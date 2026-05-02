import {
  COMBAT_ATTACK_SOURCE_KIND,
  COMBAT_SIDE,
} from '../domain/combat/combat.model';
import { ItemGenerationCatalog } from '../domain/item/item-generation.model';
import { EquippedItemRow } from '../types/equipment-row.types';
import { EquippedCombatItemAttackSource } from '../domain/combat/combat-attack-plan.model';
import { BONUS_TARGETS } from '../constants/bonus-targets.const';
import {
  buildHeroAttackPlan,
  toEquippedCombatItemAttackSources,
} from './combat-hero-attack-sources';

describe('combat attack plan', () => {
  it('creates one unarmed attack when no weapon is equipped', () => {
    const plan = buildHeroAttackPlan({
      side: COMBAT_SIDE.initiator,
      equippedItems: [],
    });

    expect(plan.slots.length).toBe(1);
    expect(plan.slots[0].slotIndex).toBe(0);
    expect(plan.slots[0].source.kind).toBe(COMBAT_ATTACK_SOURCE_KIND.unarmed);
  });

  it('creates weapon plus unarmed attack for a single one-handed weapon without shield', () => {
    const plan = buildHeroAttackPlan({
      side: COMBAT_SIDE.initiator,
      equippedItems: [combatItem({
        itemId: 'sword-1',
        slotKey: 'main_hand',
        handUsage: 'one_handed',
      })],
    });

    expect(plan.slots.map((slot) => slot.source.kind)).toEqual([
      COMBAT_ATTACK_SOURCE_KIND.playerItem,
      COMBAT_ATTACK_SOURCE_KIND.unarmed,
    ]);
    expect(plan.slots[0].source.sourceItemId).toBe('sword-1');
  });

  it('does not create a shield attack for one-handed weapon plus shield', () => {
    const plan = buildHeroAttackPlan({
      side: COMBAT_SIDE.initiator,
      equippedItems: [
        combatItem({ itemId: 'sword-1', slotKey: 'main_hand', handUsage: 'one_handed' }),
        combatItem({
          itemId: 'shield-1',
          slotKey: 'off_hand',
          baseTypeKey: 'shield',
          equipmentSlotGroup: 'shield',
          handUsage: 'shield',
        }),
      ],
    });

    expect(plan.slots.length).toBe(1);
    expect(plan.slots[0].source.kind).toBe(COMBAT_ATTACK_SOURCE_KIND.playerItem);
    expect(plan.slots[0].source.sourceItemId).toBe('sword-1');
  });

  it('creates one attack from each weapon when dual wielding', () => {
    const plan = buildHeroAttackPlan({
      side: COMBAT_SIDE.initiator,
      equippedItems: [
        combatItem({ itemId: 'sword-1', slotKey: 'main_hand', handUsage: 'one_handed' }),
        combatItem({ itemId: 'dagger-1', slotKey: 'off_hand', handUsage: 'one_handed' }),
      ],
    });

    expect(plan.slots.map((slot) => slot.source.sourceItemId)).toEqual(['sword-1', 'dagger-1']);
    expect(plan.slots.every((slot) => slot.source.kind === COMBAT_ATTACK_SOURCE_KIND.playerItem))
      .toBeTrue();
  });

  it('uses item-native attack_count for two-handed or ranged weapons', () => {
    const plan = buildHeroAttackPlan({
      side: COMBAT_SIDE.initiator,
      equippedItems: [combatItem({
        itemId: 'bow-1',
        slotKey: 'main_hand',
        baseTypeKey: 'ranged_weapon',
        equipmentSlotGroup: 'weapon',
        handUsage: 'ranged',
        attackCount: 3,
      })],
    });

    expect(plan.slots.length).toBe(3);
    expect(plan.slots.map((slot) => slot.source.label)).toEqual([
      'Normal Bow #1',
      'Normal Bow #2',
      'Normal Bow #3',
    ]);
  });

  it('maps equipped item rows and catalog metadata into item attack sources', () => {
    const [source] = toEquippedCombatItemAttackSources(
      [equippedRow()],
      itemCatalog(),
    );

    expect(source).toEqual(jasmine.objectContaining({
      itemId: 'item-1',
      slotKey: 'main_hand',
      baseId: 'base-1',
      baseName: 'Blade',
      qualityKey: 'quality',
      qualityLabel: 'Quality',
      prefixAffixId: 'prefix-1',
      prefixName: 'Sharp',
      suffixAffixId: 'suffix-1',
      suffixName: 'of Dawn',
      displayName: 'Quality Sharp Blade of Dawn',
      attackCount: 2,
    }));
  });
});

function combatItem(
  overrides: Partial<EquippedCombatItemAttackSource> = {},
): EquippedCombatItemAttackSource {
  return {
    itemId: 'item-1',
    slotKey: 'main_hand',
    baseId: 'base-1',
    baseName: 'Bow',
    baseTypeKey: 'weapon',
    equipmentSlotGroup: 'weapon',
    handUsage: 'one_handed',
    qualityKey: 'normal',
    qualityLabel: 'Normal',
    prefixAffixId: null,
    prefixName: null,
    suffixAffixId: null,
    suffixName: null,
    displayName: 'Normal Bow',
    attackCount: 1,
    ...overrides,
  };
}

function equippedRow(): EquippedItemRow {
  return {
    id: 'equipment-1',
    hero_id: 'hero-1',
    item_id: 'item-1',
    slot_key: 'main_hand',
    equipped_at: '2026-05-01T10:00:00.000Z',
    items: {
      id: 'item-1',
      generation_base_id: 'base-1',
      generation_quality_key: 'quality',
      prefix_affix_id: 'prefix-1',
      suffix_affix_id: 'suffix-1',
      status: 'active',
      scrapped_at: null,
      recoverable_until: null,
      updated_at: '2026-05-01T10:00:00.000Z',
    },
  } as EquippedItemRow;
}

function itemCatalog(): ItemGenerationCatalog {
  return {
    budgetBuckets: [10],
    qualities: [
      { key: 'quality', label: 'Quality', multiplier: 2, weight: 1 },
    ],
    baseTypes: [],
    baseTypeTargets: [],
    bases: [{
      id: 'base-1',
      key: 'blade',
      name: 'Blade',
      baseTypeKey: 'one_handed_weapon',
      baseTypeLabel: 'One-handed weapon',
      equipmentSlotGroup: 'weapon',
      handUsage: 'one_handed',
      baseValue: 5,
      description: '',
      bonuses: [{
        target: BONUS_TARGETS.AttackCount,
        value: 1,
        type: 'flat',
        scope: 'combat',
        levelsStep: null,
        sourceStat: null,
        scalingFactor: null,
        qualityScalesValue: false,
      }],
    }],
    prefixes: [{
      id: 'prefix-1',
      key: 'sharp',
      kind: 'prefix',
      name: 'Sharp',
      goldValue: 1,
      description: '',
      bonuses: [],
    }],
    suffixes: [{
      id: 'suffix-1',
      key: 'of-dawn',
      kind: 'suffix',
      name: 'of Dawn',
      goldValue: 1,
      description: '',
      bonuses: [{
        target: BONUS_TARGETS.AttackCount,
        value: 1,
        type: 'flat',
        scope: 'combat',
        levelsStep: null,
        sourceStat: null,
        scalingFactor: null,
      }],
    }],
  };
}
