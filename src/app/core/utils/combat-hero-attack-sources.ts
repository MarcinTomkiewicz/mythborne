import { COMBAT_ITEM_BONUS_TARGETS } from '../constants/bonus-targets.const';
import {
  COMBAT_ATTACK_SOURCE_KIND,
  CombatAttackPlan,
} from '../domain/combat/combat.model';
import {
  CombatAttackSourcePlanInput,
  EquippedCombatItemAttackSource,
  HeroAttackPlanInput,
} from '../domain/combat/combat-attack-plan.model';
import {
  ItemGenerationCatalog,
} from '../domain/item/item-generation.model';
import { isPlayerUsableItemStatus } from '../domain/item/item.model';
import { Bonus } from '../types/bonus.types';
import { EquippedItemRow } from '../types/equipment-row.types';
import { normalizeBonusTarget } from './bonus';
import { buildCombatAttackPlan } from './combat-attack-plan';
import { applyQualityScaledBonuses } from './item-generation-catalog-mappers';
import { composeItemName } from './item-generation-rules';
import {
  requiredItemGenerationAffix,
  requiredItemGenerationBase,
  requiredItemGenerationQuality,
} from './item-catalog-lookup';
import { normalizeKeyText } from './normalize-text';

export function buildHeroAttackPlan(input: HeroAttackPlanInput): CombatAttackPlan {
  const unarmedLabel = input.unarmedLabel ?? 'Unarmed';
  const shields = input.equippedItems.filter(isShield);
  const weapons = input.equippedItems.filter((item) => isWeapon(item) && !isShield(item));
  const twoHandedWeapon = weapons.find(isTwoHanded);
  const oneHandedWeapons = weapons.filter((item) => !isTwoHanded(item));
  const sources: CombatAttackSourcePlanInput[] = [];

  if (twoHandedWeapon) {
    sources.push(playerItemAttackSource(twoHandedWeapon));
  } else if (oneHandedWeapons.length >= 2) {
    sources.push(...oneHandedWeapons.slice(0, 2).map(playerItemAttackSource));
  } else if (oneHandedWeapons.length === 1) {
    sources.push(playerItemAttackSource(oneHandedWeapons[0]));

    if (shields.length === 0) {
      sources.push(unarmedAttackSource(unarmedLabel));
    }
  } else {
    sources.push(unarmedAttackSource(unarmedLabel));
  }

  return buildCombatAttackPlan(
    input.side,
    sources,
    'Hero combatant has no available unarmed or equipment attack source.',
  );
}

export function toEquippedCombatItemAttackSources(
  rows: readonly EquippedItemRow[],
  catalog: ItemGenerationCatalog,
): EquippedCombatItemAttackSource[] {
  return rows.flatMap((row) => {
    const item = row.items;

    if (!item) {
      throw new Error(`Equipped item "${row.item_id}" could not be loaded.`);
    }

    if (!isPlayerUsableItemStatus(item.status)) {
      return [];
    }

    const base = requiredItemGenerationBase(item.generation_base_id, item.id, catalog);
    const quality = requiredItemGenerationQuality(item.generation_quality_key, item.id, catalog);
    const prefix = item.prefix_affix_id
      ? requiredItemGenerationAffix(item.prefix_affix_id, item.id, catalog.prefixes)
      : null;
    const suffix = item.suffix_affix_id
      ? requiredItemGenerationAffix(item.suffix_affix_id, item.id, catalog.suffixes)
      : null;
    const bonuses = applyQualityScaledBonuses(
      [
        ...base.bonuses,
        ...(prefix?.bonuses ?? []),
        ...(suffix?.bonuses ?? []),
      ],
      quality.multiplier,
    );

    return [{
      itemId: item.id,
      slotKey: row.slot_key,
      baseId: base.id,
      baseName: base.name,
      baseTypeKey: base.baseTypeKey,
      equipmentSlotGroup: base.equipmentSlotGroup,
      handUsage: base.handUsage,
      qualityKey: quality.key,
      qualityLabel: quality.label,
      prefixAffixId: prefix?.id ?? null,
      prefixName: prefix?.name ?? null,
      suffixAffixId: suffix?.id ?? null,
      suffixName: suffix?.name ?? null,
      displayName: composeItemName(quality, base, prefix, suffix),
      attackCount: attackCountFromBonuses(bonuses),
    }];
  });
}

function playerItemAttackSource(
  item: EquippedCombatItemAttackSource,
): CombatAttackSourcePlanInput {
  return {
    source: {
      kind: COMBAT_ATTACK_SOURCE_KIND.playerItem,
      label: item.displayName,
      opponentAttackSourceId: null,
      sourceItemId: item.itemId,
      sourceBaseId: item.baseId,
      sourceQualityKey: item.qualityKey,
      sourcePrefixAffixId: item.prefixAffixId,
      sourceSuffixAffixId: item.suffixAffixId,
    },
    repeat: item.attackCount,
  };
}

function unarmedAttackSource(label: string): CombatAttackSourcePlanInput {
  return {
    source: {
      kind: COMBAT_ATTACK_SOURCE_KIND.unarmed,
      label,
      opponentAttackSourceId: null,
      sourceItemId: null,
      sourceBaseId: null,
      sourceQualityKey: null,
      sourcePrefixAffixId: null,
      sourceSuffixAffixId: null,
    },
  };
}

function isWeapon(item: EquippedCombatItemAttackSource): boolean {
  return [item.equipmentSlotGroup, item.handUsage, item.baseTypeKey]
    .map(normalizeKeyText)
    .some((value) =>
      value.includes('weapon') || value.includes('handed') || value.includes('ranged')
    );
}

function isShield(item: EquippedCombatItemAttackSource): boolean {
  return [item.equipmentSlotGroup, item.handUsage, item.baseTypeKey, item.slotKey]
    .map(normalizeKeyText)
    .some((value) => value.includes('shield'));
}

function isTwoHanded(item: EquippedCombatItemAttackSource): boolean {
  return [item.handUsage, item.baseTypeKey, item.equipmentSlotGroup]
    .map(normalizeKeyText)
    .some((value) => value.includes('two_handed') || value.includes('ranged'));
}

function attackCountFromBonuses(bonuses: readonly Bonus[]): number {
  const count = bonuses
    .filter((bonus) => COMBAT_ITEM_BONUS_TARGETS.AttackCount.some(
      (target) => target === normalizeBonusTarget(bonus.target),
    ))
    .reduce((sum, bonus) => sum + Number(bonus.value), 0);

  return Math.max(1, Math.floor(count || 1));
}
