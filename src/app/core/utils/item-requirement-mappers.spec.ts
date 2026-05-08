import {
  CheckHeroMeetsItemRequirementsRpcRow,
  GetItemEffectiveRequirementsRpcRow,
  GetItemRequirementComponentRowsRpcRow,
} from '../types/item-equipment-rpc.types';
import { mapItemRequirementPreview } from './item-requirement-mappers';

describe('mapItemRequirementPreview', () => {
  it('maps DB-resolved item requirements without hiding canonical RPC rows', () => {
    const preview = mapItemRequirementPreview({
      heroId: 'hero-1',
      itemId: 'item-1',
      stats: [{ key: 'strength', label: 'Strength' }],
      checkRows: [{ meets_requirements: false, failures_json: [] }],
      effectiveRows: [
        effectiveRequirementRow('hero_level', '', 5),
        effectiveRequirementRow('hero_stat', 'strength', 12),
        effectiveRequirementRow('prestige_rank', '', 2),
      ],
      componentRows: [
        componentRequirementRow('hero_level', '', 5, 'base'),
        componentRequirementRow('hero_stat', 'strength', 10, 'base'),
        componentRequirementRow('hero_stat', 'strength', 2, 'prefix'),
        componentRequirementRow('resource_amount', '', 100, 'suffix'),
      ],
    });

    expect(preview.meetsRequirements).toBeFalse();
    expect(preview.effectiveRequirements.map((row) => ({
      key: row.requirementDefinitionKey,
      label: row.displayLabel,
      value: row.displayValue,
    }))).toEqual([
      { key: 'hero_level', label: 'Hero level', value: 'Level 5' },
      { key: 'hero_stat', label: 'Strength', value: '12' },
      { key: 'prestige_rank', label: 'Prestige rank', value: '2' },
    ]);
    expect(preview.components.map((row) => ({
      key: row.requirementDefinitionKey,
      layer: row.sourceLayerLabel,
      label: row.displayLabel,
      value: row.displayValue,
    }))).toEqual([
      { key: 'hero_level', layer: 'Base', label: 'Hero level', value: 'Level 5' },
      { key: 'hero_stat', layer: 'Base', label: 'Strength', value: '10' },
      { key: 'hero_stat', layer: 'Prefix', label: 'Strength', value: '2' },
      { key: 'resource_amount', layer: 'Suffix', label: 'Resource amount', value: '100' },
    ]);
  });
});

function effectiveRequirementRow(
  requirementDefinitionKey: string,
  requiredStatKey: string,
  requiredValue: number,
): GetItemEffectiveRequirementsRpcRow {
  return {
    additional_component_value: 0,
    additional_requirement_fraction: 0,
    component_count: 1,
    final_decimal_value: requiredValue,
    generation_quality_key: 'normal',
    highest_component_value: requiredValue,
    item_id: 'item-1',
    item_owner_hero_id: 'hero-1',
    pre_quality_value: requiredValue,
    quality_requirement_multiplier: 1,
    required_stat_key: requiredStatKey,
    required_value_integer: requiredValue,
    requirement_definition_key: requirementDefinitionKey,
    rounding_mode: 'ceil',
  };
}

function componentRequirementRow(
  requirementDefinitionKey: string,
  requiredStatKey: string,
  rawRequiredValue: number,
  sourceLayer: string,
): GetItemRequirementComponentRowsRpcRow {
  return {
    applies_from_level: 1,
    generation_quality_key: 'normal',
    item_id: 'item-1',
    item_owner_hero_id: 'hero-1',
    item_status: 'active',
    quality_requirement_multiplier: 1,
    raw_required_value: rawRequiredValue,
    required_stat_key: requiredStatKey,
    requirement_definition_key: requirementDefinitionKey,
    requirement_id: `${sourceLayer}-${requirementDefinitionKey}-${requiredStatKey || 'none'}`,
    requirement_sort_order: requirementDefinitionKey === 'hero_level' ? 10 : 20,
    source_entity_id: `${sourceLayer}-1`,
    source_entity_type: sourceLayer === 'base'
      ? 'item_generation_base'
      : 'item_generation_affix',
    source_key: sourceLayer,
    source_label: sourceLayer,
    source_layer: sourceLayer,
    source_sort_order: sourceLayer === 'base' ? 10 : 20,
  };
}
