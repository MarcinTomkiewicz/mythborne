import { REQUIREMENT_VALUE_TYPES } from '../../constants/requirement.const';
import {
  BuildingRequirementPreview,
  BuildingRequirementValueType,
} from '../../domain/building/building.model';
import {
  BuildingDistrictLevelCapRow,
  DistrictRow,
  EstateBuildingRow,
  MansionBuildingRequirementRow,
  MansionBuildingRow,
  StatLabelRow,
} from '../../types/building-service.types';

export function buildDistrictRankMap(
  districts: readonly DistrictRow[],
): ReadonlyMap<string, number> {
  return new Map(districts.map((district) => [district.code, district.rank]));
}

export function requiredDistrictRank(
  districtCode: string,
  districtRanks: ReadonlyMap<string, number>,
): number {
  const rank = districtRanks.get(districtCode);

  if (rank === undefined) {
    throw new Error(`Estate district "${districtCode}" is not configured.`);
  }

  return rank;
}

export function requiredBuildingDistrictCode(building: MansionBuildingRow): string {
  if (!building.district_code) {
    throw new Error(`Building "${building.key}" does not have a district code.`);
  }

  return building.district_code;
}

export function requiredEstateBuildingLevel(
  estateBuildingsByBuildingId: ReadonlyMap<string, EstateBuildingRow>,
  building: MansionBuildingRow,
): number {
  const estateBuilding = estateBuildingsByBuildingId.get(building.id);

  if (!estateBuilding) {
    throw new Error(
      `Estate building baseline row is missing for building "${building.key}".`,
    );
  }

  return estateBuilding.level;
}

export function groupEstateBuildingsByBuildingId(
  rows: readonly EstateBuildingRow[],
): ReadonlyMap<string, EstateBuildingRow> {
  return new Map(rows.map((row) => [row.building_id, row]));
}

export function groupLevelCapsByBuildingIdAndDistrict(
  rows: readonly BuildingDistrictLevelCapRow[],
): ReadonlyMap<string, BuildingDistrictLevelCapRow> {
  return new Map(rows.map((row) => [levelCapKey(row.building_id, row.district_code), row]));
}

export function effectiveBuildingMaxLevel(input: {
  building: MansionBuildingRow;
  currentDistrictCode: string;
  levelCaps: ReadonlyMap<string, BuildingDistrictLevelCapRow>;
}): number {
  return (
    input.levelCaps.get(levelCapKey(input.building.id, input.currentDistrictCode))
      ?.max_level ?? input.building.max_level
  );
}

export function isUnlimitedBuildingCap(maxLevel: number): boolean {
  return maxLevel === 0;
}

export function groupRequirementsByBuildingId(
  rows: readonly MansionBuildingRequirementRow[],
): ReadonlyMap<string, MansionBuildingRequirementRow[]> {
  const grouped = new Map<string, MansionBuildingRequirementRow[]>();

  for (const row of rows) {
    const existing = grouped.get(row.entity_id) ?? [];
    existing.push(row);
    grouped.set(row.entity_id, existing);
  }

  return grouped;
}

export function mapActiveBuildingRequirements(
  rows: readonly MansionBuildingRequirementRow[],
  nextLevel: number,
  statLabels: ReadonlyMap<string, string>,
): BuildingRequirementPreview[] {
  return rows
    .filter((row) => row.applies_from_level <= nextLevel)
    .map((row) => mapBuildingRequirement(row, statLabels))
    .sort((left, right) => {
      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder;
      }

      return left.appliesFromLevel - right.appliesFromLevel;
    });
}

function mapBuildingRequirement(
  row: MansionBuildingRequirementRow,
  statLabels: ReadonlyMap<string, string>,
): BuildingRequirementPreview {
  const definition = row.requirement_definitions;

  if (!definition) {
    throw new Error(
      `Requirement definition "${row.requirement_definition_key}" is not readable.`,
    );
  }

  return {
    requirementDefinitionKey: row.requirement_definition_key,
    label: definition.label,
    valueLabel: requirementValueLabel(row, definition.value_type, statLabels),
    description: row.description ?? definition.helper_text ?? definition.description ?? null,
    appliesFromLevel: row.applies_from_level,
    sortOrder: row.sort_order,
  };
}

function requirementValueLabel(
  row: MansionBuildingRequirementRow,
  valueType: BuildingRequirementValueType,
  statLabels: ReadonlyMap<string, string>,
): string {
  switch (valueType) {
    case REQUIREMENT_VALUE_TYPES.Integer:
      return String(requiredNumber(row.required_value_integer, row));
    case REQUIREMENT_VALUE_TYPES.Decimal:
      return String(requiredNumber(row.required_value_decimal, row));
    case REQUIREMENT_VALUE_TYPES.Boolean:
      return requiredBoolean(row.required_value_boolean, row) ? 'Required' : 'Not required';
    case REQUIREMENT_VALUE_TYPES.StatKey:
      return statRequirementValueLabel(row, statLabels);
    case REQUIREMENT_VALUE_TYPES.BuildingKey:
      return requiredText(row.required_building_key, row);
    case REQUIREMENT_VALUE_TYPES.ResourceType:
      return requiredText(row.required_resource_type, row);
    case REQUIREMENT_VALUE_TYPES.DistrictCode:
      return requiredText(row.required_district_code, row);
    case REQUIREMENT_VALUE_TYPES.String:
    case REQUIREMENT_VALUE_TYPES.EnumRef:
      return requiredText(row.required_value_text, row);
    default:
      throw new Error(`Unsupported requirement value type: ${valueType}`);
  }
}

export function buildStatLabelMap(
  rows: readonly StatLabelRow[],
): ReadonlyMap<string, string> {
  return new Map(rows.map((row) => [row.key, row.label]));
}

function statRequirementValueLabel(
  row: MansionBuildingRequirementRow,
  statLabels: ReadonlyMap<string, string>,
): string {
  const statKey = requiredText(row.required_stat_key, row);
  const minValue = requiredNumber(row.required_value_integer, row);
  return `${statLabels.get(statKey) ?? statKey} >= ${minValue}`;
}

function requiredText(
  value: string | null,
  row: MansionBuildingRequirementRow,
): string {
  if (!value) {
    throw new Error(
      `Requirement "${row.requirement_definition_key}" does not have a configured value.`,
    );
  }

  return value;
}

function requiredNumber(
  value: number | null,
  row: MansionBuildingRequirementRow,
): number {
  if (value === null) {
    throw new Error(
      `Requirement "${row.requirement_definition_key}" does not have a configured value.`,
    );
  }

  return value;
}

function requiredBoolean(
  value: boolean | null,
  row: MansionBuildingRequirementRow,
): boolean {
  if (value === null) {
    throw new Error(
      `Requirement "${row.requirement_definition_key}" does not have a configured value.`,
    );
  }

  return value;
}

function levelCapKey(buildingId: string, districtCode: string): string {
  return `${buildingId}:${districtCode}`;
}
