import { Row } from '../types/supabase.types';
import {
  mapCombatDictionary,
  mapCombatOpponentAttackSource,
  mapCombatOpponentDefinition,
  mapCombatOpponentEquipmentEntry,
  mapCombatOpponentEquipmentMode,
  mapCombatOpponentFamily,
  mapCombatOpponentStatValue,
  mapCombatStatDefinition,
  mapEquipmentSlotDefinition,
  toCombatOpponentAdminViews,
} from './combat-opponent-admin-mappers';

describe('combat opponent admin mappers', () => {
  it('preserves opponent, family, dictionary and equipment metadata', () => {
    expect(mapCombatOpponentFamily(familyRow())).toEqual(
      jasmine.objectContaining({
        key: 'bandits',
        label: 'Bandits',
        helperText: 'Family helper.',
        adminDescription: 'Family admin.',
        isActive: true,
        sortOrder: 10,
      }),
    );
    expect(mapCombatOpponentDefinition(opponentRow())).toEqual(
      jasmine.objectContaining({
        id: 'opponent-1',
        key: 'bandit',
        familyKey: 'bandits',
        equipmentMode: 'manual',
        defaultScalingFormulaId: 'formula-1',
      }),
    );
    expect(mapCombatDictionary(dictionaryRow())).toEqual(
      jasmine.objectContaining({
        key: 'natural',
        label: 'Natural',
        description: 'Dictionary description.',
        helperText: 'Dictionary helper.',
        adminDescription: 'Dictionary admin.',
        isActive: true,
        sortOrder: 10,
      }),
    );
    expect(mapEquipmentSlotDefinition(slotRow())).toEqual(
      jasmine.objectContaining({
        key: 'main_hand',
        label: 'Main hand',
        equipmentArea: 'weapon',
      }),
    );
    expect(mapCombatOpponentEquipmentMode(equipmentModeRow())).toEqual(
      jasmine.objectContaining({
        key: 'manual',
        label: 'Manual',
      }),
    );
  });

  it('maps stat baselines, natural attacks and equipment entries into admin display views', () => {
    const data = {
      families: [mapCombatOpponentFamily(familyRow())],
      opponents: [mapCombatOpponentDefinition(opponentRow())],
      statValues: [mapCombatOpponentStatValue(statValueRow())],
      attackSources: [mapCombatOpponentAttackSource(attackSourceRow())],
      equipmentEntries: [mapCombatOpponentEquipmentEntry(equipmentEntryRow())],
      equipmentModes: [mapCombatOpponentEquipmentMode(equipmentModeRow())],
      equipmentSlots: [mapEquipmentSlotDefinition(slotRow())],
      stats: [mapCombatStatDefinition(statRow())],
    };

    const [view] = toCombatOpponentAdminViews(data);

    expect(view.familyLabel).toBe('Bandits (bandits)');
    expect(view.equipmentModeLabel).toBe('Manual (manual)');
    expect(view.statBaselines[0].statLabel).toBe('Strength (strength)');
    expect(view.naturalAttacks[0].damageLabel).toBe('3-6');
    expect(view.naturalAttacks[0].levelRangeLabel).toBe('1-10');
    expect(view.equipmentEntries[0].slotLabel).toBe('Main hand (main_hand)');
    expect(view.equipmentEntries[0].entryModeLabel).toBe('Manual (manual)');
  });
});

function familyRow(): Row<'combat_opponent_families'> {
  return {
    key: 'bandits',
    label: 'Bandits',
    description: 'Family description.',
    helper_text: 'Family helper.',
    admin_description: 'Family admin.',
    sort_order: 10,
    is_active: true,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}

function opponentRow(): Row<'combat_opponent_definitions'> {
  return {
    id: 'opponent-1',
    key: 'bandit',
    label: 'Bandit',
    description: 'Opponent description.',
    helper_text: 'Opponent helper.',
    admin_description: 'Opponent admin.',
    family_key: 'bandits',
    equipment_mode: 'manual',
    default_scaling_formula_id: 'formula-1',
    sort_order: 10,
    is_active: true,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}

function statValueRow(): Row<'combat_opponent_stat_values'> {
  return {
    id: 'stat-value-1',
    opponent_definition_id: 'opponent-1',
    stat_key: 'strength',
    base_value: 12,
    sort_order: 10,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}

function attackSourceRow(): Row<'combat_opponent_attack_sources'> {
  return {
    id: 'attack-1',
    opponent_definition_id: 'opponent-1',
    key: 'knife',
    label: 'Knife',
    description: 'Attack description.',
    helper_text: 'Attack helper.',
    admin_description: 'Attack admin.',
    min_damage: 3,
    max_damage: 6,
    critical_chance: 5,
    critical_damage: 150,
    attack_count: 1,
    min_opponent_level: 1,
    max_opponent_level: 10,
    sort_order: 10,
    is_active: true,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}

function equipmentEntryRow(): Row<'combat_opponent_equipment_entries'> {
  return {
    id: 'equipment-1',
    opponent_definition_id: 'opponent-1',
    slot_key: 'main_hand',
    entry_mode: 'manual',
    manual_base_id: 'base-1',
    manual_quality_key: 'common',
    manual_prefix_affix_id: null,
    manual_suffix_affix_id: null,
    generated_bucket_profile_id: null,
    generated_max_quality_key: null,
    min_opponent_level: null,
    max_opponent_level: null,
    sort_order: 10,
    is_active: true,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}

function equipmentModeRow(): Row<'combat_opponent_equipment_mode_definitions'> {
  return {
    key: 'manual',
    label: 'Manual',
    description: 'Manual equipment.',
    helper_text: 'Mode helper.',
    admin_description: 'Mode admin.',
    sort_order: 10,
    is_active: true,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}

function slotRow(): Row<'equipment_slot_definitions'> {
  return {
    key: 'main_hand',
    label: 'Main hand',
    description: 'Main weapon slot.',
    helper_text: 'Slot helper.',
    admin_description: 'Slot admin.',
    equipment_area: 'weapon',
    sort_order: 10,
    is_active: true,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}

function statRow(): Row<'stats'> {
  return {
    id: 'stat-1',
    key: 'strength',
    label: 'Strength',
    description: 'Strength stat.',
    helper_text: 'Stat helper.',
    admin_description: 'Stat admin.',
    order: 10,
  };
}

function dictionaryRow(): Row<'combat_attack_source_kind_definitions'> {
  return {
    key: 'natural',
    label: 'Natural',
    description: 'Dictionary description.',
    helper_text: 'Dictionary helper.',
    admin_description: 'Dictionary admin.',
    metadata_json: { icon: 'paw' },
    sort_order: 10,
    is_active: true,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}
