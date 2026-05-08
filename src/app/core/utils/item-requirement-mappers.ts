import {
  ItemEffectiveRequirement,
  ItemRequirementComponent,
  ItemRequirementPreview,
} from '../domain/item/item-equipment.model';
import {
  CheckHeroMeetsItemRequirementsRpcRow,
  GetItemEffectiveRequirementsRpcRow,
  GetItemRequirementComponentRowsRpcRow,
} from '../types/item-equipment-rpc.types';
import { Row } from '../types/supabase.types';

type StatLabelRow = Pick<Row<'stats'>, 'key' | 'label'>;

export function mapItemRequirementPreview(input: {
  heroId: string | null;
  itemId: string;
  effectiveRows: readonly GetItemEffectiveRequirementsRpcRow[];
  componentRows: readonly GetItemRequirementComponentRowsRpcRow[];
  checkRows: readonly CheckHeroMeetsItemRequirementsRpcRow[];
  stats: readonly StatLabelRow[];
}): ItemRequirementPreview {
  const statLabels = new Map(input.stats.map((row) => [row.key, row.label]));

  return {
    itemId: input.itemId,
    heroId: input.heroId,
    meetsRequirements: input.checkRows[0]?.meets_requirements ?? null,
    components: input.componentRows
      .map((row) => mapItemRequirementComponent(row, statLabels)),
    effectiveRequirements: input.effectiveRows
      .map((row) => mapItemEffectiveRequirement(row, statLabels)),
  };
}

function mapItemRequirementComponent(
  row: GetItemRequirementComponentRowsRpcRow,
  statLabels: ReadonlyMap<string, string>,
): ItemRequirementComponent {
  const displayLabel = requirementLabel(
    row.requirement_definition_key,
    row.required_stat_key,
    statLabels,
  );

  return {
    requirementId: row.requirement_id,
    requirementDefinitionKey: row.requirement_definition_key,
    valueType: null,
    displayLabel,
    displayValue: requirementValue(row.requirement_definition_key, row.raw_required_value),
    requiredKey: row.required_stat_key,
    requiredValue: row.raw_required_value,
    requiredStatKey: row.required_stat_key,
    rawRequiredValue: row.raw_required_value,
    appliesFromLevel: row.applies_from_level,
    sourceEntityType: row.source_entity_type,
    sourceEntityId: row.source_entity_id,
    sourceLayer: row.source_layer,
    sourceLayerLabel: sourceLayerLabel(row.source_layer),
    sourceKey: row.source_key,
    sourceLabel: row.source_label,
    sourceSortOrder: row.source_sort_order,
    requirementSortOrder: row.requirement_sort_order,
  };
}

function mapItemEffectiveRequirement(
  row: GetItemEffectiveRequirementsRpcRow,
  statLabels: ReadonlyMap<string, string>,
): ItemEffectiveRequirement {
  return {
    requirementDefinitionKey: row.requirement_definition_key,
    valueType: null,
    displayLabel: requirementLabel(
      row.requirement_definition_key,
      row.required_stat_key,
      statLabels,
    ),
    displayValue: requirementValue(
      row.requirement_definition_key,
      row.required_value_integer,
    ),
    requiredKey: row.required_stat_key,
    requiredStatKey: row.required_stat_key,
    requiredValue: row.required_value_integer,
    finalDecimalValue: row.final_decimal_value,
    highestComponentValue: row.highest_component_value,
    additionalComponentValue: row.additional_component_value,
    additionalRequirementFraction: row.additional_requirement_fraction,
    preQualityValue: row.pre_quality_value,
    qualityRequirementMultiplier: row.quality_requirement_multiplier,
    roundingMode: row.rounding_mode,
    componentCount: row.component_count,
  };
}

function requirementLabel(
  requirementDefinitionKey: string,
  statKey: string | null,
  statLabels: ReadonlyMap<string, string>,
): string {
  if (requirementDefinitionKey === 'hero_level') {
    return 'Hero level';
  }

  if (requirementDefinitionKey === 'hero_stat') {
    const normalizedStatKey = statKey?.trim();

    return normalizedStatKey
      ? statLabels.get(normalizedStatKey) ?? humanizeKey(normalizedStatKey)
      : 'Base stat';
  }

  return humanizeKey(requirementDefinitionKey);
}

function requirementValue(requirementDefinitionKey: string, value: number): string {
  const normalizedValue = Number.isFinite(value) ? Math.trunc(value) : value;

  return requirementDefinitionKey === 'hero_level'
    ? `Level ${normalizedValue}`
    : `${normalizedValue}`;
}

function sourceLayerLabel(layer: string): string {
  switch (layer) {
    case 'base':
      return 'Base';
    case 'prefix':
      return 'Prefix';
    case 'suffix':
      return 'Suffix';
    case 'quality':
      return 'Quality';
    default:
      return humanizeKey(layer);
  }
}

function humanizeKey(key: string): string {
  const normalized = key
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  return normalized
    ? `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`
    : key;
}
