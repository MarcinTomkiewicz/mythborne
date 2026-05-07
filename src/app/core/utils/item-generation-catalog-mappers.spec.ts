import { Row } from '../types/supabase.types';
import {
  BONUS_ENTITY_TYPES,
} from '../constants/bonus-entity-types.const';
import { CanonicalEntityBonusWithTemplateRow } from '../types/bonus-governance.types';
import {
  applyQualityScaledBonuses,
  mapItemGenerationBase,
  mapItemGenerationBaseType,
  mapItemGenerationBaseTypeTarget,
  mapResolvedItemGenerationBonus,
  toBaseTypeByKey,
} from './item-generation-catalog-mappers';

describe('item generation catalog mappers', () => {
  it('maps base type metadata from canonical dictionaries', () => {
    const baseType = mapItemGenerationBaseType(createBaseTypeRow());
    const target = mapItemGenerationBaseTypeTarget(createBaseTypeTargetRow());

    expect(baseType.key).toBe('one_handed_weapon');
    expect(baseType.label).toBe('One-handed weapon');
    expect(baseType.equipmentSlotGroup).toBe('weapon');
    expect(baseType.handUsage).toBe('one_handed');
    expect(target.baseTypeKey).toBe('one_handed_weapon');
    expect(target.bonusTargetKey).toBe('min_damage');
    expect(target.isRequired).toBeTrue();
  });

  it('maps item base display metadata from base_type_key instead of legacy slot', () => {
    const base = mapItemGenerationBase(
      createBaseRow({ slot: 'legacy-shield' }),
      [],
      toBaseTypeByKey([mapItemGenerationBaseType(createBaseTypeRow())]),
    );

    expect(base.baseTypeKey).toBe('one_handed_weapon');
    expect(base.baseTypeLabel).toBe('One-handed weapon');
    expect(base.equipmentSlotGroup).toBe('weapon');
    expect(base.handUsage).toBe('one_handed');
    expect(Object.hasOwn(base, 'slot')).toBeFalse();
  });

  it('fails when item base references a missing base_type_key', () => {
    expect(() =>
      mapItemGenerationBase(createBaseRow({ base_type_key: 'missing_type' }), [], new Map()),
    ).toThrowError(
      'Item generation base "base-1" references missing base_type_key "missing_type".',
    );
  });

  it('maps item generation bonuses from entity_bonuses and semantic templates', () => {
    const bonus = mapResolvedItemGenerationBonus(
      createEntityBonusRow({
        value: 2.5,
        level_interval_override: 4,
        quality_scales_value: true,
      }),
    );

    expect(bonus.target).toBe('min_damage');
    expect(bonus.type).toBe('per_levels');
    expect(bonus.scope).toBe('combat');
    expect(bonus.value).toBe(2.5);
    expect(bonus.levelsStep).toBe(4);
    expect(bonus.qualityScalesValue).toBeTrue();
  });

  it('scales only item generation bonus value for quality projection', () => {
    const [scaled] = applyQualityScaledBonuses(
      [
        {
          target: 'min_damage',
          type: 'per_levels',
          scope: 'combat',
          value: 2,
          levelsStep: 4,
          qualityScalesValue: true,
        },
      ],
      1.5,
    );

    expect(scaled.value).toBe(3);
    expect(scaled.levelsStep).toBe(4);
  });

  it('rejects quality scaling for level interval in item generation bonuses', () => {
    expect(() =>
      mapResolvedItemGenerationBonus(
        createEntityBonusRow({ quality_scales_level_interval: true }),
      ),
    ).toThrowError('entity_bonuses.quality_scales_level_interval must remain false.');
  });
});

function createBaseTypeRow(
  overrides: Partial<Row<'item_generation_base_types'>> = {},
): Row<'item_generation_base_types'> {
  return {
    id: 'base-type-1',
    key: 'one_handed_weapon',
    label: 'One-handed weapon',
    description: 'Weapon type.',
    equipment_slot_group: 'weapon',
    hand_usage: 'one_handed',
    sort_order: 10,
    is_active: true,
    created_at: '2026-04-27T00:00:00.000Z',
    updated_at: '2026-04-27T00:00:00.000Z',
    ...overrides,
  };
}

function createBaseTypeTargetRow(
  overrides: Partial<Row<'item_generation_base_type_targets'>> = {},
): Row<'item_generation_base_type_targets'> {
  return {
    id: 'base-type-target-1',
    base_type_key: 'one_handed_weapon',
    bonus_target_key: 'min_damage',
    is_required: true,
    required_group_key: 'damage',
    min_required_in_group: 1,
    default_value: 1,
    display_group: 'damage',
    display_group_role: 'range_min',
    display_label: 'Minimum damage',
    display_role: 'primary_stat',
    hide_when_default: false,
    hide_when_zero: false,
    min_value: 1,
    max_value: 10,
    helper_text: 'Damage target.',
    is_player_visible: true,
    sort_order: 20,
    created_at: '2026-04-27T00:00:00.000Z',
    updated_at: '2026-04-27T00:00:00.000Z',
    ...overrides,
  };
}

function createBaseRow(
  overrides: Partial<Row<'item_generation_bases'>> = {},
): Row<'item_generation_bases'> {
  return {
    id: 'base-1',
    key: 'short_sword',
    name: 'Short sword',
    base_type_key: 'one_handed_weapon',
    base_value: 100,
    description: 'A basic blade.',
    slot: null,
    created_at: '2026-04-27T00:00:00.000Z',
    ...overrides,
  };
}

function createEntityBonusRow(
  overrides: Partial<CanonicalEntityBonusWithTemplateRow> = {},
): CanonicalEntityBonusWithTemplateRow {
  return {
    id: 'entity-bonus-1',
    entity_type: BONUS_ENTITY_TYPES.ItemGenerationBase,
    entity_id: 'base-1',
    bonus_template_id: 'template-1',
    value: 1,
    description: null,
    level_interval_override: null,
    formula_id_override: null,
    formula_target_id_override: null,
    scaling_stat_key_override: null,
    scope_key_override: null,
    quality_scales_value: false,
    quality_scales_level_interval: false,
    params_json: {},
    sort_order: 10,
    is_active: true,
    legacy_source_id: null,
    legacy_source_table: null,
    created_at: '2026-04-27T00:00:00.000Z',
    updated_at: '2026-04-27T00:00:00.000Z',
    bonus_templates: {
      id: 'template-1',
      key: 'base-min-damage',
      label: 'Base min damage',
      description: 'Template description.',
      type_key: 'per_levels',
      target_key: 'min_damage',
      scope_key: 'combat',
      level_interval: null,
      formula_id: null,
      formula_target_id: null,
      scaling_stat_key: null,
      params_json: {},
      sort_order: 10,
      is_active: true,
      target: 'legacy-target',
      type: 'flat',
      updated_at: '2026-04-27T00:00:00.000Z',
    },
    ...overrides,
  };
}
