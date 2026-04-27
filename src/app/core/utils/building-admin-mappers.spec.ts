import { BONUS_ENTITY_TYPES } from '../constants/bonus-entity-types.const';
import { BonusTemplate } from '../types/bonus.types';
import { CanonicalEntityBonusWithTemplateRow } from '../types/bonus-governance.types';
import { mapEditableBuildingEntityBonus } from './building-admin-mappers';

describe('building admin mappers', () => {
  it('maps building bonus from canonical entity bonus rows', () => {
    const bonus = mapEditableBuildingEntityBonus(
      createEntityBonusRow({
        value: 12,
        description: 'Building row description.',
      }),
      new Map([[createTemplate().id, createTemplate()]]),
    );

    expect(bonus.templateId).toBe('template-1');
    expect(bonus.target).toBe('drachma_income');
    expect(bonus.type).toBe('flat');
    expect(bonus.value).toBe(12);
    expect(bonus.description).toBe('Building row description.');
  });

  it('does not fall back to legacy template target/type columns', () => {
    expect(() =>
      mapEditableBuildingEntityBonus(
        createEntityBonusRow({
          bonus_templates: createTemplateRow({
            target_key: null,
            type_key: null,
            target: 'legacy_target',
            type: 'percent',
          }),
        }),
        new Map([[createTemplate().id, createTemplate()]]),
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
    entity_type: BONUS_ENTITY_TYPES.Building,
    entity_id: 'building-1',
    bonus_template_id: 'template-1',
    value: 5,
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
    bonus_templates: createTemplateRow(),
    ...overrides,
  };
}

function createTemplateRow(
  overrides: Partial<CanonicalEntityBonusWithTemplateRow['bonus_templates']> = {},
): NonNullable<CanonicalEntityBonusWithTemplateRow['bonus_templates']> {
  return {
    id: 'template-1',
    key: 'building-drachma-income',
    label: 'Building drachma income',
    description: 'Template description.',
    type_key: 'flat',
    target_key: 'drachma_income',
    scope_key: 'building_management',
    level_interval: null,
    formula_id: null,
    formula_target_id: null,
    scaling_stat_key: null,
    params_json: {},
    sort_order: 10,
    is_active: true,
    target: 'legacy-target',
    type: 'percent',
    updated_at: '2026-04-27T00:00:00.000Z',
    ...overrides,
  };
}

function createTemplate(overrides: Partial<BonusTemplate> = {}): BonusTemplate {
  return {
    id: 'template-1',
    key: 'building-drachma-income',
    label: 'Building drachma income',
    category: 'economy',
    target: 'drachma_income',
    type: 'flat',
    scope: 'building_management',
    description: 'Template description.',
    baseValue: 0,
    levelsStep: null,
    sourceStat: null,
    scalingFactor: null,
    sortOrder: 10,
    isActive: true,
    ...overrides,
  };
}
