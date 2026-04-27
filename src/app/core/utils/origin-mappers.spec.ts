import { CanonicalEntityBonusWithTemplateRow } from '../types/bonus-governance.types';
import { BONUS_ENTITY_TYPES } from '../constants/bonus-entity-types.const';
import { mapOriginBonus } from './origin-mappers';

describe('origin mappers', () => {
  it('maps origin bonus from canonical entity bonus rows', () => {
    const bonus = mapOriginBonus(
      createEntityBonusRow({
        value: 3,
        scope_key_override: 'combat',
        level_interval_override: 4,
        params_json: { scalingFactor: 0.5 },
      }),
    );

    expect(bonus.id).toBe('entity-bonus-1');
    expect(bonus.originId).toBe('origin-1');
    expect(bonus.templateId).toBe('template-1');
    expect(bonus.target).toBe('strength');
    expect(bonus.type).toBe('scaled_stat_bonus');
    expect(bonus.scope).toBe('combat');
    expect(bonus.description).toBe('Origin bonus row.');
    expect(bonus.baseValue).toBe(3);
    expect(bonus.levelsStep).toBe(4);
    expect(bonus.sourceStat).toBe('hero_level');
    expect(bonus.scalingFactor).toBe(0.5);
  });

  it('does not fall back to legacy template target/type columns', () => {
    expect(() =>
      mapOriginBonus(
        createEntityBonusRow({
          bonus_templates: createTemplateRow({
            target_key: null,
            type_key: null,
            target: 'legacy_target',
            type: 'percent',
          }),
        }),
      ),
    ).toThrowError(
      'bonus_templates.type_key is required for canonical bonus row "template-1".',
    );
  });
});

function createEntityBonusRow(
  overrides: Partial<CanonicalEntityBonusWithTemplateRow> = {},
): CanonicalEntityBonusWithTemplateRow {
  return {
    id: 'entity-bonus-1',
    entity_type: BONUS_ENTITY_TYPES.Origin,
    entity_id: 'origin-1',
    bonus_template_id: 'template-1',
    value: 2,
    description: 'Origin bonus row.',
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
    bonus_templates: createTemplateRow(),
    ...overrides,
  };
}

function createTemplateRow(
  overrides: Partial<CanonicalEntityBonusWithTemplateRow['bonus_templates']> = {},
): NonNullable<CanonicalEntityBonusWithTemplateRow['bonus_templates']> {
  return {
    id: 'template-1',
    key: 'origin-strength-scaled',
    label: 'Origin strength scaled',
    description: 'Template description.',
    type_key: 'scaled_stat_bonus',
    target_key: 'strength',
    scope_key: 'global',
    level_interval: null,
    formula_id: null,
    formula_target_id: null,
    scaling_stat_key: 'hero_level',
    params_json: { scalingFactor: 0.25 },
    sort_order: 10,
    is_active: true,
    target: 'legacy-target',
    type: 'flat',
    updated_at: '2026-04-27T00:00:00.000Z',
    ...overrides,
  };
}
