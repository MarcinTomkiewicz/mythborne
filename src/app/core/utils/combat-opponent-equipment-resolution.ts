import { COMBAT_ATTACK_SOURCE_KIND } from '../domain/combat/combat.model';
import {
  CombatOpponentAdminData,
  CombatOpponentDefinitionReadModel,
  CombatOpponentEquipmentEntryReadModel,
  ResolveCombatOpponentInput,
  ResolvedCombatOpponentEquipment,
  ResolvedCombatOpponentGeneratedItem,
} from '../domain/combat/combat-opponent.model';
import { GeneratedItemResult, ItemGenerationCatalog } from '../domain/item/item-generation.model';
import { isLevelInRange, opponentLevel } from './combat-opponent-range';

export const OPPONENT_EQUIPMENT_MODE = {
  none: 'none',
  manual: 'manual',
  generated: 'generated',
} as const;

export function equipmentEntriesFor(
  data: CombatOpponentAdminData,
  opponent: CombatOpponentDefinitionReadModel,
  input: ResolveCombatOpponentInput,
): CombatOpponentEquipmentEntryReadModel[] {
  if (opponent.equipmentMode === OPPONENT_EQUIPMENT_MODE.none) {
    return [];
  }

  const level = opponentLevel(input);

  return data.equipmentEntries.filter(
    (entry) =>
      entry.opponentDefinitionId === opponent.id &&
      entry.isActive &&
      entry.entryMode === opponent.equipmentMode &&
      isLevelInRange(level, entry.minOpponentLevel, entry.maxOpponentLevel),
  );
}

export function materializeManualEquipment(
  entry: CombatOpponentEquipmentEntryReadModel,
  catalog: ItemGenerationCatalog | null,
): ResolvedCombatOpponentEquipment {
  const label = manualEquipmentLabel(entry, catalog);

  return {
    kind: OPPONENT_EQUIPMENT_MODE.manual,
    equipmentEntryId: entry.id,
    slotKey: entry.slotKey,
    levelRange: {
      min: entry.minOpponentLevel,
      max: entry.maxOpponentLevel,
    },
    source: {
      kind: COMBAT_ATTACK_SOURCE_KIND.opponentManual,
      label,
      opponentAttackSourceId: null,
      sourceItemId: null,
      sourceBaseId: entry.manualBaseId,
      sourceQualityKey: entry.manualQualityKey,
      sourcePrefixAffixId: entry.manualPrefixAffixId,
      sourceSuffixAffixId: entry.manualSuffixAffixId,
    },
    generatedItem: null,
  };
}

export function materializeGeneratedEquipment(
  entry: CombatOpponentEquipmentEntryReadModel,
  generated: ResolvedCombatOpponentGeneratedItem,
): ResolvedCombatOpponentEquipment {
  return {
    kind: OPPONENT_EQUIPMENT_MODE.generated,
    equipmentEntryId: entry.id,
    slotKey: entry.slotKey,
    levelRange: {
      min: entry.minOpponentLevel,
      max: entry.maxOpponentLevel,
    },
    source: {
      kind: COMBAT_ATTACK_SOURCE_KIND.opponentGenerated,
      label: generated.displayName,
      opponentAttackSourceId: null,
      sourceItemId: null,
      sourceBaseId: generated.baseId,
      sourceQualityKey: generated.qualityKey,
      sourcePrefixAffixId: generated.prefixAffixId,
      sourceSuffixAffixId: generated.suffixAffixId,
    },
    generatedItem: generated,
  };
}

export function generatedItemSnapshot(
  entry: CombatOpponentEquipmentEntryReadModel,
  generated: GeneratedItemResult,
): ResolvedCombatOpponentGeneratedItem {
  return {
    displayName: generated.displayName,
    baseId: generated.base.id,
    qualityKey: generated.quality.key,
    prefixAffixId: generated.prefix?.id ?? null,
    suffixAffixId: generated.suffix?.id ?? null,
    bucketProfileId: entry.generatedBucketProfileId,
    maxQualityKey: entry.generatedMaxQualityKey,
  };
}

export function catalogForGeneratedEquipment(
  entry: CombatOpponentEquipmentEntryReadModel,
  catalog: ItemGenerationCatalog,
): ItemGenerationCatalog {
  if (entry.generatedBucketProfileId) {
    throw new Error(
      `Generated opponent equipment entry "${entry.id}" uses bucket profile "${entry.generatedBucketProfileId}", but opponent-specific bucket profile selection is not supported by the current item generation catalog loader.`,
    );
  }

  if (!entry.generatedMaxQualityKey) {
    return catalog;
  }

  const maxQuality = catalog.qualities.find(
    (quality) => quality.key === entry.generatedMaxQualityKey,
  );

  if (!maxQuality) {
    throw new Error(
      `Generated opponent equipment entry "${entry.id}" references missing max quality "${entry.generatedMaxQualityKey}".`,
    );
  }

  return {
    ...catalog,
    qualities: catalog.qualities.filter(
      (quality) => quality.multiplier <= maxQuality.multiplier,
    ),
  };
}

function manualEquipmentLabel(
  entry: CombatOpponentEquipmentEntryReadModel,
  catalog: ItemGenerationCatalog | null,
): string {
  const base = entry.manualBaseId
    ? catalog?.bases.find((item) => item.id === entry.manualBaseId)
    : null;
  const quality = entry.manualQualityKey
    ? catalog?.qualities.find((item) => item.key === entry.manualQualityKey)
    : null;
  const prefix = entry.manualPrefixAffixId
    ? catalog?.prefixes.find((item) => item.id === entry.manualPrefixAffixId)
    : null;
  const suffix = entry.manualSuffixAffixId
    ? catalog?.suffixes.find((item) => item.id === entry.manualSuffixAffixId)
    : null;

  if (base) {
    return [
      quality?.label,
      prefix?.name,
      base.name,
      suffix?.name,
    ].filter(Boolean).join(' ');
  }

  return `Manual opponent equipment (${entry.slotKey})`;
}
