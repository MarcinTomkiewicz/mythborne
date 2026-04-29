import {
  BuildingRequirementEntityType,
  BuildingRequirementValueType,
} from '../domain/building/building.model';

export const REQUIREMENT_ENTITY_TYPES = {
  BuildingDefinition: 'building_definition',
} as const satisfies Record<string, BuildingRequirementEntityType>;

export const REQUIREMENT_VALUE_TYPES = {
  Integer: 'integer',
  Decimal: 'decimal',
  Boolean: 'boolean',
  String: 'string',
  StatKey: 'stat_key',
  BuildingKey: 'building_key',
  ResourceType: 'resource_type',
  DistrictCode: 'district_code',
  EnumRef: 'enum_ref',
} as const satisfies Record<string, BuildingRequirementValueType>;

export const REQUIREMENT_BOOLEAN_OPTIONS = [
  { label: 'Required', value: true },
  { label: 'Not required', value: false },
] as const;
