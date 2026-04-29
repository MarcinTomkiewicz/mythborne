import {
  BuildingAdminData,
  BuildingFormulaOverrides,
  BuildingProgressionPreview,
  BuildingProgressionPreviewInput,
  EditableBuildingBonus,
  EditableBuilding,
  EditableBuildingRequirement,
  EditableBuildingResourceCost,
} from '../domain/building/building.model';
import { resolveBuildingImagePath } from '../domain/building/building-image-paths';
import {
  BuildingRequirementAdminRow,
  BuildingResourceCostAdminRow,
  EditableBuildingRow,
} from '../types/building-admin-row.types';
import { BonusTemplate } from '../types/bonus.types';
import { CanonicalEntityBonusWithTemplateRow } from '../types/bonus-governance.types';
import {
  BuildingProgressionPreviewRpcRow,
  GetBuildingProgressionPreviewRpcArgs,
} from '../types/building-preview-rpc.types';
import { FormulaAdminData } from '../domain/formula/formula.model';
import { Row } from '../types/supabase.types';
import { mapResolvedBonus } from './bonus-governance';
import { normalizeBonusType } from './bonus';
import { trimText } from './normalize-text';

const BUILDING_PROGRESSION_PREVIEW_MAX_LEVEL_RANGE = 50;

export function mapEditableBuilding(
  row: EditableBuildingRow,
  bonuses: EditableBuildingBonus[],
  formulaData?: FormulaAdminData
): EditableBuilding {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description ?? '',
    imagePath: resolveBuildingImagePath(row.key, row.district_code) ?? row.image_path ?? '',
    districtCode: row.district_code ?? 'A',
    rankRequired: row.rank_required,
    sortOrder: row.sort_order ?? 0,
    baseBuildTimeMinutes: row.base_build_time_minutes ?? 0,
    maxLevel: row.max_level ?? 0,
    formulaOverrides: mapBuildingFormulaOverrides(row.id, formulaData),
    bonuses,
    resourceCosts: sortBuildingRules(row.building_resource_costs ?? []).map((cost) => ({
      id: cost.id,
      resourceType: normalizeBuildingResourceType(cost.resource_type),
      baseValue: cost.base_value,
      appliesFromLevel: cost.applies_from_level,
    })),
    requirements: sortBuildingRules(row.building_requirements ?? []).map((requirement) => ({
      id: requirement.id,
      type: normalizeBuildingRequirementType(requirement.requirement_type),
      statKey: requirement.stat_key,
      minValue: requirement.min_value,
      appliesFromLevel: requirement.applies_from_level,
    })),
  };
}

export function mapBuildingBonusTemplates(
  rows: BonusTemplate[]
): BuildingAdminData['bonusTemplates'] {
  return rows.map((template): EditableBuildingBonus => ({
    templateId: template.id,
    target: template.target,
    type: normalizeBonusType(template.type),
    value: 0,
    description: template.description ?? '',
  }));
}

export function mapEditableBuildingEntityBonus(
  row: CanonicalEntityBonusWithTemplateRow,
  templateById: ReadonlyMap<string, BonusTemplate>
): EditableBuildingBonus {
  const resolved = mapResolvedBonus(row);

  if (resolved.qualityScalesLevelInterval) {
    throw new Error('entity_bonuses.quality_scales_level_interval must remain false.');
  }

  const template = requiredTemplate(templateById, resolved.templateId);

  return {
    templateId: resolved.templateId,
    target: resolved.targetKey,
    type: normalizeBonusType(resolved.typeKey),
    value: resolved.value,
    description: row.description ?? template.description ?? '',
  };
}

export function mapBuildingDistricts(
  rows: Row<'estate_districts'>[]
): BuildingAdminData['districts'] {
  return rows.map((row) => ({
    code: row.code,
    name: row.name,
    description: row.description,
    rank: row.rank,
  }));
}

export function mapBuildingStats(
  rows: Pick<Row<'stats'>, 'key' | 'label'>[]
): BuildingAdminData['stats'] {
  return rows.map((row) => ({
    key: row.key,
    label: row.label,
  }));
}

export function mapBuildingProgressionPreview(
  row: BuildingProgressionPreviewRpcRow
): BuildingProgressionPreview {
  return {
    buildingId: row.building_id,
    buildingKey: row.building_key,
    buildingName: row.building_name,
    buildingDescription: row.building_description,
    selectedDistrictCode: row.selected_district_code,
    minimumDistrictCode: row.minimum_district_code,
    previewLevel: row.preview_level,
    nextLevel: row.next_level,
    baseCost: row.base_cost,
    baseBuildTimeMinutes: row.base_build_time_minutes,
    defaultMaxLevel: row.default_max_level,
    effectiveMaxLevel: row.effective_max_level,
    isUnlimited: row.is_unlimited,
    isAvailableInSelectedDistrict: row.is_available_in_selected_district,
    capSource: row.cap_source,
    capExplanation: row.cap_explanation,
    districtExplanation: row.district_explanation,
  };
}

export function toGetBuildingProgressionPreviewRpcArgs(
  input: BuildingProgressionPreviewInput
): GetBuildingProgressionPreviewRpcArgs {
  const fromLevel = requiredPositiveInteger(input.fromLevel, 'fromLevel');
  const toLevel = requiredPositiveInteger(input.toLevel, 'toLevel');

  if (fromLevel > toLevel) {
    throw new Error(
      'fromLevel must be less than or equal to toLevel for building progression preview.'
    );
  }

  if (toLevel - fromLevel + 1 > BUILDING_PROGRESSION_PREVIEW_MAX_LEVEL_RANGE) {
    throw new Error(
      `Building progression preview range cannot exceed ${BUILDING_PROGRESSION_PREVIEW_MAX_LEVEL_RANGE} levels.`
    );
  }

  return {
    p_building_id: requiredText(input.buildingId, 'buildingId'),
    p_district_code: requiredText(input.districtCode, 'districtCode'),
    p_from_level: fromLevel,
    p_to_level: toLevel,
  };
}

export function normalizeBuildingResourceType(
  value: string
): EditableBuildingResourceCost['resourceType'] {
  return value === 'materials' || value === 'workforce' ? value : 'drachma';
}

export function normalizeBuildingRequirementType(
  value: string
): EditableBuildingRequirement['type'] {
  return value === 'hero_rank' || value === 'hero_stat' ? value : 'hero_level';
}

function sortBuildingRules<T extends { sort_order: number; applies_from_level: number }>(
  rows: T[]
): T[] {
  return [...rows].sort((left, right) =>
    left.sort_order !== right.sort_order
      ? left.sort_order - right.sort_order
      : left.applies_from_level - right.applies_from_level
  );
}

function mapBuildingFormulaOverrides(
  buildingId: string,
  formulaData?: FormulaAdminData
): BuildingFormulaOverrides {
  const overrideFor = (targetKey: string) => {
    const target = formulaData?.targets.find((entry) => entry.key === targetKey);
    const assignment = target
      ? formulaData?.entityAssignments.find(
          (entry) =>
            entry.entityKind === 'building' &&
            entry.entityId === buildingId &&
            entry.targetId === target.id
        )
      : null;

    return assignment?.formulaId ?? null;
  };

  return {
    upgradeCostFormulaId: overrideFor('building_upgrade_cost'),
    upgradeTimeFormulaId: overrideFor('building_upgrade_time'),
    bonusGrowthFormulaId: overrideFor('building_bonus_growth'),
  };
}

function requiredTemplate(
  templateById: ReadonlyMap<string, BonusTemplate>,
  templateId: string
): BonusTemplate {
  const template = templateById.get(templateId);

  if (!template) {
    throw new Error(
      `bonus_templates entry "${templateId}" is required for building entity bonus admin view.`
    );
  }

  return template;
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for building progression preview.`);
  }

  return normalized;
}

function requiredPositiveInteger(
  value: number | string | null | undefined,
  field: string
): number {
  if (value === null || value === undefined || value === '') {
    throw new Error(`${field} is required for building progression preview.`);
  }

  if (typeof value === 'string' && !/^\d+$/.test(value.trim())) {
    throw new Error(`${field} must be a positive integer level for building progression preview.`);
  }

  const normalized = Number(value);

  if (!Number.isInteger(normalized) || normalized < 1) {
    throw new Error(`${field} must be a positive integer level for building progression preview.`);
  }

  return normalized;
}
