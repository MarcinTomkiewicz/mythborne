import { BONUS_ENTITY_TYPES } from '../constants/bonus-entity-types.const';
import { BonusTemplate } from '../types/bonus.types';
import { CanonicalEntityBonusWithTemplateRow } from '../types/bonus-governance.types';
import { BonusImpactPreviewRpcRow } from '../types/building-impact-preview-rpc.types';
import { BuildingProgressionPreviewRpcRow } from '../types/building-preview-rpc.types';
import {
  mapBuildingBonusImpactPreview,
  mapBuildingProgressionPreview,
  mapEditableBuildingEntityBonus,
  toGetBonusImpactPreviewRpcArgs,
  toGetBuildingProgressionPreviewRpcArgs,
} from './building-admin-mappers';

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
            target_key: null as unknown as string,
            type_key: null as unknown as string,
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

  it('maps building progression preview rows from DB metadata', () => {
    expect(mapBuildingProgressionPreview(createProgressionPreviewRow())).toEqual(
      jasmine.objectContaining({
        buildingId: 'building-1',
        buildingKey: 'market',
        buildingName: 'Market',
        selectedDistrictCode: 'B',
        previewLevel: 2,
        nextLevel: 3,
        baseCost: 250,
        baseBuildTimeSeconds: 90,
        effectiveMaxLevel: 0,
        isUnlimited: true,
        capExplanation: 'Selected district has unlimited cap. 0 = unlimited.',
      }),
    );
  });

  it('maps bonus impact preview rows from canonical DB metadata', () => {
    expect(mapBuildingBonusImpactPreview(createBonusImpactPreviewRow())).toEqual(
      jasmine.objectContaining({
        entityBonusId: 'entity-bonus-1',
        bonusLabel: 'Drachma income',
        bonusTargetLabel: 'Drachma income',
        bonusTypeLabel: 'Flat bonus',
        bonusScopeLabel: 'Building management',
        value: 10,
        previewValue: 15,
        explanation: 'Flat building management bonus.',
      }),
    );
  });

  it('maps bonus impact preview input to RPC args', () => {
    expect(toGetBonusImpactPreviewRpcArgs(' building-1 ')).toEqual({
      p_entity_type: 'building',
      p_entity_id: 'building-1',
    });
  });

  it('maps building progression preview input to RPC args', () => {
    expect(
      toGetBuildingProgressionPreviewRpcArgs({
        buildingId: ' building-1 ',
        districtCode: ' B ',
        fromLevel: 2,
        toLevel: 5,
      }),
    ).toEqual({
      p_building_id: 'building-1',
      p_district_code: 'B',
      p_from_level: 2,
      p_to_level: 5,
    });
  });

  it('rejects invalid building progression preview ranges', () => {
    expect(() =>
      toGetBuildingProgressionPreviewRpcArgs({
        buildingId: 'building-1',
        districtCode: 'B',
        fromLevel: 0,
        toLevel: 5,
      }),
    ).toThrowError(
      'fromLevel must be a positive integer level for building progression preview.',
    );

    expect(() =>
      toGetBuildingProgressionPreviewRpcArgs({
        buildingId: 'building-1',
        districtCode: 'B',
        fromLevel: 6,
        toLevel: 5,
      }),
    ).toThrowError(
      'fromLevel must be less than or equal to toLevel for building progression preview.',
    );
  });

  it('rejects decimal building progression preview levels', () => {
    expect(() =>
      toGetBuildingProgressionPreviewRpcArgs({
        buildingId: 'building-1',
        districtCode: 'B',
        fromLevel: '1.5',
        toLevel: 5,
      }),
    ).toThrowError(
      'fromLevel must be a positive integer level for building progression preview.',
    );

    expect(() =>
      toGetBuildingProgressionPreviewRpcArgs({
        buildingId: 'building-1',
        districtCode: 'B',
        fromLevel: 1,
        toLevel: '3.2',
      }),
    ).toThrowError(
      'toLevel must be a positive integer level for building progression preview.',
    );

    expect(() =>
      toGetBuildingProgressionPreviewRpcArgs({
        buildingId: 'building-1',
        districtCode: 'B',
        fromLevel: 1.5,
        toLevel: 3,
      }),
    ).toThrowError(
      'fromLevel must be a positive integer level for building progression preview.',
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

function createBonusImpactPreviewRow(
  overrides: Partial<BonusImpactPreviewRpcRow> = {},
): BonusImpactPreviewRpcRow {
  return {
    entity_bonus_id: 'entity-bonus-1',
    entity_type: 'building',
    entity_id: 'building-1',
    bonus_template_id: 'template-1',
    bonus_key: 'drachma_income_flat',
    bonus_label: 'Drachma income',
    bonus_description: 'Adds drachma income.',
    bonus_type_key: 'flat',
    bonus_type_label: 'Flat bonus',
    bonus_type_description: 'Adds a direct value.',
    bonus_scope_key: 'building_management',
    bonus_scope_label: 'Building management',
    bonus_scope_description: 'Applies to building management.',
    bonus_target_key: 'drachma_income',
    bonus_target_label: 'Drachma income',
    bonus_target_description: 'Increases drachma income.',
    value: 10,
    preview_value: 15,
    quality_key: 'quality',
    quality_label: 'Quality',
    quality_multiplier: 1.5,
    quality_scales_value: true,
    quality_scales_level_interval: false,
    level_interval: 0,
    scaling_stat_key: '',
    params_json: {},
    explanation: 'Flat building management bonus.',
    warning_text: '',
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

function createProgressionPreviewRow(
  overrides: Partial<BuildingProgressionPreviewRpcRow> = {},
): BuildingProgressionPreviewRpcRow {
  return {
    building_id: 'building-1',
    building_key: 'market',
    building_name: 'Market',
    building_description: 'Trade building.',
    selected_district_code: 'B',
    minimum_district_code: 'A',
    preview_level: 2,
    next_level: 3,
    base_cost: 250,
    base_build_time_seconds: 90,
    starting_level: 1,
    starting_level_explanation: 'Default starting level.',
    default_max_level: 0,
    effective_max_level: 0,
    is_unlimited: true,
    is_available_in_selected_district: true,
    cap_source: 'district',
    cap_explanation: 'Selected district has unlimited cap. 0 = unlimited.',
    district_explanation: 'Available in selected district.',
    ...overrides,
  };
}
