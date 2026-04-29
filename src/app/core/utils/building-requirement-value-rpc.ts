import { REQUIREMENT_VALUE_TYPES } from '../constants/requirement.const';
import {
  BuildingRequirementDraft,
  BuildingRequirementValueType,
} from '../domain/building/building.model';
import {
  CreateEntityRequirementRpcArgs,
  UpdateEntityRequirementRpcArgs,
} from '../types/building-requirement-rpc.types';
import { trimText } from './normalize-text';

export function validateBuildingRequirementDraftForValueType(
  draft: BuildingRequirementDraft,
  valueType: BuildingRequirementValueType,
): void {
  toRequirementValueRpcArgs(draft, valueType);
}

export function toRequirementValueRpcArgs(
  draft: BuildingRequirementDraft,
  valueType: BuildingRequirementValueType,
): Partial<CreateEntityRequirementRpcArgs & UpdateEntityRequirementRpcArgs> {
  const args: Partial<CreateEntityRequirementRpcArgs & UpdateEntityRequirementRpcArgs> = {};
  const mutableArgs = args as Record<string, unknown>;

  switch (valueType) {
    case REQUIREMENT_VALUE_TYPES.Integer:
      mutableArgs['p_required_value_integer'] = requiredIntegerValue(
        draft.requiredValueInteger,
        'requiredValueInteger',
      );
      break;
    case REQUIREMENT_VALUE_TYPES.Decimal:
      mutableArgs['p_required_value_decimal'] = requiredFiniteNumber(
        draft.requiredValueDecimal,
        'requiredValueDecimal',
      );
      break;
    case REQUIREMENT_VALUE_TYPES.Boolean:
      mutableArgs['p_required_value_boolean'] = requiredBooleanValue(
        draft.requiredValueBoolean,
        'requiredValueBoolean',
      );
      break;
    case REQUIREMENT_VALUE_TYPES.String:
    case REQUIREMENT_VALUE_TYPES.EnumRef:
      mutableArgs['p_required_value_text'] = requiredText(
        draft.requiredValueText,
        'requiredValueText',
      );
      break;
    case REQUIREMENT_VALUE_TYPES.StatKey:
      mutableArgs['p_required_stat_key'] = requiredText(
        draft.requiredStatKey,
        'requiredStatKey',
      );
      mutableArgs['p_required_value_integer'] = requiredIntegerValue(
        draft.requiredValueInteger,
        'requiredValueInteger',
      );
      break;
    case REQUIREMENT_VALUE_TYPES.BuildingKey:
      mutableArgs['p_required_building_key'] = requiredText(
        draft.requiredBuildingKey,
        'requiredBuildingKey',
      );
      mutableArgs['p_required_value_integer'] = requiredIntegerValue(
        draft.requiredValueInteger,
        'requiredValueInteger',
      );
      break;
    case REQUIREMENT_VALUE_TYPES.ResourceType:
      mutableArgs['p_required_resource_type'] = requiredText(
        draft.requiredResourceType,
        'requiredResourceType',
      );
      mutableArgs['p_required_value_decimal'] = requiredFiniteNumber(
        draft.requiredValueDecimal,
        'requiredValueDecimal',
      );
      break;
    case REQUIREMENT_VALUE_TYPES.DistrictCode:
      mutableArgs['p_required_district_code'] = requiredText(
        draft.requiredDistrictCode,
        'requiredDistrictCode',
      );
      break;
  }

  return args;
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for building requirement RPC.`);
  }

  return normalized;
}

function requiredBooleanValue(
  value: boolean | null | undefined,
  field: string,
): boolean {
  if (value === null || value === undefined) {
    throw new Error(`${field} is required for building requirement RPC.`);
  }

  return value;
}

function requiredFiniteNumber(
  value: number | string | null | undefined,
  field: string,
): number {
  if (value === null || value === undefined || value === '') {
    throw new Error(`${field} is required for building requirement RPC.`);
  }

  const normalized = Number(value);

  if (!Number.isFinite(normalized)) {
    throw new Error(`${field} must be a finite number for building requirement RPC.`);
  }

  return normalized;
}

function requiredIntegerValue(
  value: number | string | null | undefined,
  field: string,
): number {
  const normalized = requiredFiniteNumber(value, field);

  if (!Number.isInteger(normalized)) {
    throw new Error(`${field} must be an integer for building requirement RPC.`);
  }

  return normalized;
}
