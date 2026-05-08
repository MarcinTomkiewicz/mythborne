import { REQUIREMENT_ENTITY_TYPES } from '../constants/requirement.const';
import {
  BuildingRequirementDefinition,
  BuildingRequirementDraft,
  BuildingRequirementEntityType,
  BuildingRequirementImpactPreview,
  BuildingRequirementValueType,
} from '../domain/building/building.model';
import { RequirementDefinitionRow } from '../types/building-admin-row.types';
import {
  CreateEntityRequirementRpcArgs,
  DeactivateEntityRequirementRpcArgs,
  GetRequirementImpactPreviewRpcArgs,
  RequirementImpactPreviewRpcRow,
  ReorderEntityRequirementsRpcArgs,
  UpdateEntityRequirementRpcArgs,
} from '../types/building-requirement-rpc.types';
import { trimText } from './normalize-text';
import { toRequirementValueRpcArgs } from './building-requirement-value-rpc';

const DEFAULT_REQUIREMENT_UPDATE_REASON = 'Admin central requirement update.';

export function mapBuildingRequirementDefinition(
  row: RequirementDefinitionRow,
): BuildingRequirementDefinition {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    description: row.description ?? '',
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    category: row.category,
    valueType: row.value_type,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export function mapBuildingRequirementImpactPreview(
  row: RequirementImpactPreviewRpcRow,
): BuildingRequirementImpactPreview {
  return {
    entityRequirementId: row.entity_requirement_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    requirementDefinitionKey: row.requirement_definition_key,
    requirementLabel: row.requirement_label,
    requirementDescription: row.requirement_description,
    requirementHelperText: row.requirement_helper_text,
    requirementAdminDescription: row.requirement_admin_description,
    requirementCategory: row.requirement_category,
    requirementValueType: row.requirement_value_type,
    resolvedValueLabel: row.resolved_value_label,
    appliesFromLevel: row.applies_from_level,
    context: row.context,
    description: row.description,
    explanation: row.explanation,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    requiredBuildingKey: row.required_building_key,
    requiredDistrictCode: row.required_district_code,
    requiredResourceType: row.required_resource_type,
    requiredStatKey: row.required_stat_key,
    requiredValueBoolean: row.required_value_boolean,
    requiredValueDecimal: row.required_value_decimal,
    requiredValueInteger: row.required_value_integer,
    requiredValueText: row.required_value_text,
  };
}

export function toGetRequirementImpactPreviewRpcArgs(
  buildingId: string,
): GetRequirementImpactPreviewRpcArgs {
  return toGetEntityRequirementImpactPreviewRpcArgs(
    REQUIREMENT_ENTITY_TYPES.BuildingDefinition,
    buildingId,
  );
}

export function toGetEntityRequirementImpactPreviewRpcArgs(
  entityType: BuildingRequirementEntityType,
  entityId: string,
): GetRequirementImpactPreviewRpcArgs {
  return {
    p_entity_type: entityType,
    p_entity_id: requiredText(entityId, 'entityId'),
  };
}

export function toCreateEntityRequirementRpcArgs(
  buildingId: string,
  draft: BuildingRequirementDraft,
  valueType: BuildingRequirementValueType,
): CreateEntityRequirementRpcArgs {
  return toCreateManagedEntityRequirementRpcArgs(
    REQUIREMENT_ENTITY_TYPES.BuildingDefinition,
    buildingId,
    draft,
    valueType,
  );
}

export function toCreateManagedEntityRequirementRpcArgs(
  entityType: BuildingRequirementEntityType,
  entityId: string,
  draft: BuildingRequirementDraft,
  valueType: BuildingRequirementValueType,
): CreateEntityRequirementRpcArgs {
  const args: CreateEntityRequirementRpcArgs = {
    ...toRequirementValueRpcArgs(draft, valueType),
    p_entity_type: entityType,
    p_entity_id: requiredText(entityId, 'entityId'),
    p_requirement_definition_key: requiredText(
      draft.requirementDefinitionKey,
      'requirementDefinitionKey',
    ),
    p_applies_from_level: requiredPositiveInteger(
      draft.appliesFromLevel,
      'appliesFromLevel',
    ),
    p_sort_order: nonNegativeIntegerValue(draft.sortOrder),
  };
  setOptional(args, 'p_description', draft.description);
  args.p_reason = trimText(draft.reason) || DEFAULT_REQUIREMENT_UPDATE_REASON;
  return args;
}

export function toUpdateEntityRequirementRpcArgs(
  draft: BuildingRequirementDraft,
  valueType: BuildingRequirementValueType,
): UpdateEntityRequirementRpcArgs {
  const args: UpdateEntityRequirementRpcArgs = {
    ...toRequirementValueRpcArgs(draft, valueType),
    p_requirement_id: requiredText(draft.id, 'requirementId'),
    p_requirement_definition_key: requiredText(
      draft.requirementDefinitionKey,
      'requirementDefinitionKey',
    ),
    p_applies_from_level: requiredPositiveInteger(
      draft.appliesFromLevel,
      'appliesFromLevel',
    ),
    p_is_active: true,
    p_sort_order: nonNegativeIntegerValue(draft.sortOrder),
  };
  setOptional(args, 'p_description', draft.description);
  args.p_reason = trimText(draft.reason) || DEFAULT_REQUIREMENT_UPDATE_REASON;
  return args;
}

export function toDeactivateEntityRequirementRpcArgs(
  requirementId: string,
  reason: string | null = null,
): DeactivateEntityRequirementRpcArgs {
  return {
    p_requirement_id: requiredText(requirementId, 'requirementId'),
    p_reason: trimText(reason) || 'Admin requirement deactivation.',
  };
}

export function toReorderEntityRequirementsRpcArgs(
  buildingId: string,
  requirementIds: string[],
  reason: string | null = null,
): ReorderEntityRequirementsRpcArgs {
  return toReorderManagedEntityRequirementsRpcArgs(
    REQUIREMENT_ENTITY_TYPES.BuildingDefinition,
    buildingId,
    requirementIds,
    reason,
  );
}

export function toReorderManagedEntityRequirementsRpcArgs(
  entityType: BuildingRequirementEntityType,
  entityId: string,
  requirementIds: string[],
  reason: string | null = null,
): ReorderEntityRequirementsRpcArgs {
  return {
    p_entity_type: entityType,
    p_entity_id: requiredText(entityId, 'entityId'),
    p_requirement_ids: requirementIds,
    p_reason: trimText(reason) || 'Admin requirement reorder.',
  };
}

export function draftFromRequirementImpactPreview(
  row: BuildingRequirementImpactPreview,
): BuildingRequirementDraft {
  return {
    id: row.entityRequirementId,
    requirementDefinitionKey: row.requirementDefinitionKey,
    appliesFromLevel: row.appliesFromLevel,
    description: row.description ?? '',
    reason: '',
    sortOrder: row.sortOrder,
    requiredBuildingKey: nullIfEmpty(row.requiredBuildingKey),
    requiredDistrictCode: nullIfEmpty(row.requiredDistrictCode),
    requiredResourceType: nullIfEmpty(row.requiredResourceType),
    requiredStatKey: nullIfEmpty(row.requiredStatKey),
    requiredValueBoolean: row.requiredValueBoolean,
    requiredValueDecimal: row.requiredValueDecimal,
    requiredValueInteger: row.requiredValueInteger,
    requiredValueText: nullIfEmpty(row.requiredValueText),
  };
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for entity requirement RPC.`);
  }

  return normalized;
}

function setOptional(
  args: Record<string, unknown>,
  key: string,
  value: string | number | boolean | null | undefined,
): void {
  if (typeof value === 'string') {
    const normalized = trimText(value);

    if (normalized) {
      args[key] = normalized;
    }

    return;
  }

  if (value !== null && value !== undefined) {
    args[key] = value;
  }
}

function nullIfEmpty(value: string | null | undefined): string | null {
  return trimText(value) || null;
}

function nonNegativeIntegerValue(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const normalized = Number(value);

  if (!Number.isInteger(normalized) || normalized < 0) {
    throw new Error('sortOrder must be a non-negative integer for building requirements.');
  }

  return normalized;
}

function requiredPositiveInteger(
  value: number | string | null | undefined,
  field: string,
): number {
  if (value === null || value === undefined || value === '') {
    throw new Error(`${field} is required for building requirement RPC.`);
  }

  if (typeof value === 'string' && !/^\d+$/.test(value.trim())) {
    throw new Error(`${field} must be a positive integer level for building requirement RPC.`);
  }

  const normalized = Number(value);

  if (!Number.isInteger(normalized) || normalized < 1) {
    throw new Error(`${field} must be a positive integer level for building requirement RPC.`);
  }

  return normalized;
}
