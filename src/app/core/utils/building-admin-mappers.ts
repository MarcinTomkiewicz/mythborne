import {
  BuildingAdminData,
  BuildingFormulaOverrides,
  EditableBuildingBonus,
  EditableBuilding,
  EditableBuildingRequirement,
  EditableBuildingResourceCost,
} from '../domain/building/building.model';
import { resolveBuildingImagePath } from '../domain/building/building-image-paths';
import {
  BuildingBonusAdminRow,
  BuildingRequirementAdminRow,
  BuildingResourceCostAdminRow,
  EditableBuildingRow,
} from '../types/building-admin-row.types';
import { Row } from '../types/supabase.types';
import { normalizeBonusTarget, normalizeBonusType } from './bonus';
import { FormulaAdminData } from '../domain/formula/formula.model';

export function mapEditableBuilding(
  row: EditableBuildingRow,
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
    bonuses: (row.building_bonuses ?? []).map((bonus) => ({
      templateId: bonus.template_id,
      target: normalizeBonusTarget(bonus.bonus_templates.target),
      type: normalizeBonusType(bonus.bonus_templates.type),
      value: Number(bonus.value ?? bonus.base_value ?? 0),
      description: bonus.bonus_templates.description ?? '',
    })),
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
  rows: Row<'bonus_templates'>[]
): BuildingAdminData['bonusTemplates'] {
  return rows.map((row): EditableBuildingBonus => ({
    templateId: row.id,
    target: normalizeBonusTarget(row.target),
    type: normalizeBonusType(row.type),
    value: 0,
    description: row.description ?? '',
  }));
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
