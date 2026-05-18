import {
  ItemRequirementPreview,
} from '../domain/item/item-equipment.model';
import { Json } from '../types/database.types';
import {
  GetHeroItemRequirementStatusRpcRow,
} from '../types/item-equipment-rpc.types';
import {
  JsonRecord,
  mapJsonArray,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
} from './json-read';
import { humanizeKey } from './normalize-text';

export function mapItemRequirementPreview(input: {
  row: GetHeroItemRequirementStatusRpcRow;
}): ItemRequirementPreview {
  const row = input.row;

  return {
    itemId: row.item_id,
    heroId: row.hero_id,
    meetsRequirements: row.meets_requirements,
    requirementCount: row.requirement_count,
    unmetCount: row.unmet_count,
    failedRequirementKeys: failedRequirementKeys(row.failures_json),
    components: [],
    effectiveRequirements: mapJsonArray(row.requirements_json, mapRequirementStatusRow),
  };
}

function failedRequirementKeys(value: Json | undefined): string[] {
  return mapJsonArray(value, (row) => {
    const requirementDefinitionKey = optionalText(
      read(row, 'requirementDefinitionKey', 'requirement_definition_key'),
    );
    const requiredStatKey = optionalText(read(row, 'requiredStatKey', 'required_stat_key'));

    return requirementDefinitionKey
      ? requirementKey(requirementDefinitionKey, requiredStatKey)
      : '';
  }).filter(Boolean);
}

function requirementKey(
  requirementDefinitionKey: string,
  requiredStatKey: string | null,
): string {
  return `${requirementDefinitionKey}:${requiredStatKey ?? ''}`;
}

function mapRequirementStatusRow(row: JsonRecord) {
  const requirementDefinitionKey = optionalText(
    read(row, 'requirementDefinitionKey', 'requirement_definition_key'),
  ) ?? 'requirement';
  const requiredStatKey = optionalText(read(row, 'requiredStatKey', 'required_stat_key'));
  const requiredStatLabel = optionalText(read(
    row,
    'requiredStatLabel',
    'required_stat_label',
    'statLabel',
    'stat_label',
    'targetLabel',
    'target_label',
  ));
  const requiredValue = optionalNumber(read(row, 'requiredValue', 'required_value')) ?? 0;
  const currentValue = optionalNumber(read(row, 'currentValue', 'current_value'));
  const missingValue = optionalNumber(read(row, 'missingValue', 'missing_value'));
  const legacyShapeDefaults = legacyRequirementShapeDefaults(requiredValue);

  return {
    requirementDefinitionKey,
    valueType: null,
    displayLabel: displayLabel({
      row,
      requirementDefinitionKey,
      requiredStatKey,
      requiredStatLabel,
    }),
    displayValue: optionalText(read(
      row,
      'requiredValueLabel',
      'required_value_label',
      'displayValue',
      'display_value',
      'valueLabel',
      'value_label',
    ))
      ?? String(requiredValue),
    requiredKey: requiredStatKey,
    requiredStatKey,
    requiredValue,
    currentValueLabel: optionalText(read(
      row,
      'currentValueLabel',
      'current_value_label',
      'currentDisplayValue',
      'current_display_value',
    ))
      ?? (currentValue === null ? null : String(currentValue)),
    isMet: optionalBoolean(read(row, 'isMet', 'is_met')),
    missingValue,
    failureReasonKey: optionalText(read(row, 'failureReasonKey', 'failure_reason_key')),
    failureReasonLabel: optionalText(read(row, 'failureReasonLabel', 'failure_reason_label')),
    ...legacyShapeDefaults,
  };
}

function displayLabel(input: {
  row: JsonRecord;
  requirementDefinitionKey: string;
  requiredStatKey: string | null;
  requiredStatLabel: string | null;
}): string {
  const candidateLabel = playerFacingRequirementLabel(
    optionalText(read(
      input.row,
      'requirementLabel',
      'requirement_label',
      'displayLabel',
      'display_label',
      'label',
      'name',
    )),
    input.requirementDefinitionKey,
    input.requiredStatKey,
  );

  return candidateLabel
    ?? input.requiredStatLabel
    ?? (input.requiredStatKey ? humanizeKey(input.requiredStatKey) : null)
    ?? humanizeKey(input.requirementDefinitionKey);
}

function playerFacingRequirementLabel(
  label: string | null,
  requirementDefinitionKey: string,
  requiredStatKey: string | null,
): string | null {
  if (!label?.trim() || rawRequirementLabel(label, requirementDefinitionKey, requiredStatKey)) {
    return null;
  }

  return label;
}

function rawRequirementLabel(
  label: string,
  requirementDefinitionKey: string,
  requiredStatKey: string | null,
): boolean {
  const normalizedLabel = label.trim().toLowerCase();
  const normalizedDefinition = requirementDefinitionKey.trim().toLowerCase();
  const normalizedStat = requiredStatKey?.trim().toLowerCase() ?? '';

  return normalizedLabel === normalizedDefinition
    || normalizedLabel === normalizedStat
    || /^[a-z0-9]+(?:_[a-z0-9]+)+$/.test(normalizedLabel);
}

function legacyRequirementShapeDefaults(requiredValue: number) {
  return {
    finalDecimalValue: requiredValue,
    highestComponentValue: requiredValue,
    additionalComponentValue: 0,
    additionalRequirementFraction: 0,
    preQualityValue: requiredValue,
    qualityRequirementMultiplier: 1,
    roundingMode: '',
    componentCount: 1,
  };
}
