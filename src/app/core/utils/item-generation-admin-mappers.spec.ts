import {
  mapEditableQuality,
  mapItemRequirementAggregationSettings,
  mapItemQualityImpactPreview,
  toGetItemQualityImpactPreviewRpcArgs,
} from './item-generation-admin-mappers';
import { ItemQualityImpactPreviewRpcRow } from '../types/item-generation-preview-rpc.types';
import { Row } from '../types/supabase.types';

describe('item generation admin mappers', () => {
  it('maps quality requirement multiplier separately from value multiplier', () => {
    expect(mapEditableQuality(createQualityRow())).toEqual(jasmine.objectContaining({
      key: 'quality',
      label: 'Quality',
      multiplier: 1.5,
      requirementMultiplier: 1.25,
    }));
  });

  it('maps item requirement aggregation settings from DB rows', () => {
    expect(mapItemRequirementAggregationSettings(createAggregationSettingsRow())).toEqual({
      additionalRequirementFraction: 0.5,
      minRequiredValue: 1,
      roundingMode: 'ceil',
      isActive: true,
      updatedAt: '2026-05-08T10:00:00.000Z',
      updatedBy: 'user-1',
    });
  });

  it('maps item quality impact preview rows from DB metadata', () => {
    expect(mapItemQualityImpactPreview(createQualityImpactRow())).toEqual({
      qualityKey: 'quality',
      qualityLabel: 'Quality',
      multiplier: 1.5,
      weight: 25,
      isEnabled: true,
      sortOrder: 20,
      sampleBaseValue: 100,
      sampleBonusValue: 4,
      sampleItemValue: 150,
      sampleQualityScaledBonusValue: 6,
      valueMultiplierExplanation: '100 x 1.5 = 150',
      bonusScalingExplanation: '4 x 1.5 = 6',
    });
  });

  it('maps item quality preview input to typed RPC args', () => {
    expect(
      toGetItemQualityImpactPreviewRpcArgs({
        baseValue: 120,
        bonusValue: 8,
      }),
    ).toEqual({
      p_base_value: 120,
      p_bonus_value: 8,
    });
  });

  it('rejects non-finite item quality preview values', () => {
    expect(() =>
      toGetItemQualityImpactPreviewRpcArgs({
        baseValue: Number.NaN,
        bonusValue: 8,
      }),
    ).toThrowError('baseValue must be a finite number for item quality impact preview.');
  });

  it('rejects empty item quality preview values before they become zero', () => {
    expect(() =>
      toGetItemQualityImpactPreviewRpcArgs({
        baseValue: null,
        bonusValue: 8,
      }),
    ).toThrowError('baseValue is required for item quality impact preview.');
  });

  it('allows negative bonus preview values for malus samples', () => {
    expect(
      toGetItemQualityImpactPreviewRpcArgs({
        baseValue: 120,
        bonusValue: -4,
      }),
    ).toEqual({
      p_base_value: 120,
      p_bonus_value: -4,
    });
  });

  it('rejects negative base preview values', () => {
    expect(() =>
      toGetItemQualityImpactPreviewRpcArgs({
        baseValue: -1,
        bonusValue: 4,
      }),
    ).toThrowError('baseValue must be zero or greater for item quality impact preview.');
  });
});

function createQualityImpactRow(): ItemQualityImpactPreviewRpcRow {
  return {
    quality_key: 'quality',
    quality_label: 'Quality',
    multiplier: 1.5,
    weight: 25,
    is_enabled: true,
    sort_order: 20,
    sample_base_value: 100,
    sample_bonus_value: 4,
    sample_item_value: 150,
    sample_quality_scaled_bonus_value: 6,
    value_multiplier_explanation: '100 x 1.5 = 150',
    bonus_scaling_explanation: '4 x 1.5 = 6',
  };
}

function createQualityRow(): Row<'item_generation_qualities'> {
  return {
    id: 'quality-1',
    key: 'quality',
    label: 'Quality',
    multiplier: 1.5,
    requirement_multiplier: 1.25,
    weight: 25,
    sort_order: 20,
    is_enabled: true,
    created_at: '2026-05-08T10:00:00.000Z',
  };
}

function createAggregationSettingsRow(): Row<'item_requirement_aggregation_settings'> {
  return {
    id: true,
    additional_requirement_fraction: 0.5,
    min_required_value: 1,
    rounding_mode: 'ceil',
    is_active: true,
    created_at: '2026-05-08T10:00:00.000Z',
    updated_at: '2026-05-08T10:00:00.000Z',
    updated_by: 'user-1',
  };
}
