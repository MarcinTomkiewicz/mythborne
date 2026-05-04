import {
  BuildingBonusPreview,
  BuildingResourceCostPreview,
  BuildingResourceCostTotal,
  BuildingResourceType,
} from '../../domain/building/building.model';
import { BuildingProgressionRules } from '../../domain/progression/building-progression.model';
import { CanonicalEntityBonusWithTemplateRow } from '../../types/bonus-governance.types';
import { MansionBuildingResourceCostRow } from '../../types/building-service.types';
import { mapResolvedBonus } from '../../utils/bonus-governance';
import { normalizeBonusType } from '../../utils/bonus';
import { normalizeBuildingResourceType } from '../../utils/building-admin-mappers';
import { resourceOrder } from '../../utils/building-display';

export function mapBuildingBonuses(
  rows: readonly CanonicalEntityBonusWithTemplateRow[],
  currentLevel: number,
  rules: BuildingProgressionRules,
  getBonusValue: (
    currentLevel: number,
    baseValue: number,
    rules: BuildingProgressionRules,
  ) => number | null,
): BuildingBonusPreview[] {
  return rows.map((row) => {
    const resolved = mapResolvedBonus(row);

    if (resolved.qualityScalesLevelInterval) {
      throw new Error('entity_bonuses.quality_scales_level_interval must remain false.');
    }

    return {
      templateId: resolved.templateId,
      target: resolved.targetKey,
      type: normalizeBonusType(resolved.typeKey),
      description: row.description ?? row.bonus_templates?.description ?? null,
      baseValue: resolved.value,
      currentValue: getBonusValue(currentLevel, resolved.value, rules) ?? 0,
      nextValue: getBonusValue(currentLevel + 1, resolved.value, rules) ?? 0,
    };
  });
}

export function mapActiveCostRules(
  rows: readonly MansionBuildingResourceCostRow[],
  currentLevel: number,
  rank: number,
  rules: BuildingProgressionRules,
  getUpgradeCost: (
    currentLevel: number,
    baseValue: number,
    rank: number,
    rules: BuildingProgressionRules,
  ) => number | null,
): BuildingResourceCostPreview[] {
  const nextLevel = currentLevel + 1;

  return rows
    .filter((row) => row.applies_from_level <= nextLevel)
    .sort((left, right) => {
      if (left.sort_order !== right.sort_order) {
        return left.sort_order - right.sort_order;
      }

      return left.applies_from_level - right.applies_from_level;
    })
    .map((row) => ({
      resourceType: normalizeBuildingResourceType(row.resource_type),
      appliesFromLevel: row.applies_from_level,
      baseValue: row.base_value,
      nextValue: getUpgradeCost(currentLevel, row.base_value, rank, rules) ?? 0,
    }));
}

export function aggregateCostTotals(
  rows: readonly BuildingResourceCostPreview[],
): BuildingResourceCostTotal[] {
  const totals = rows.reduce((acc, row) => {
    acc.set(row.resourceType, (acc.get(row.resourceType) ?? 0) + row.nextValue);
    return acc;
  }, new Map<BuildingResourceType, number>());

  return Array.from(totals.entries())
    .map(([resourceType, amount]) => ({
      resourceType,
      amount,
    }))
    .sort(
      (left, right) =>
        resourceOrder(left.resourceType) - resourceOrder(right.resourceType),
    );
}

export function groupBonusesByEntityId(
  rows: readonly CanonicalEntityBonusWithTemplateRow[],
): ReadonlyMap<string, CanonicalEntityBonusWithTemplateRow[]> {
  const mapById = new Map<string, CanonicalEntityBonusWithTemplateRow[]>();

  for (const row of rows) {
    const existing = mapById.get(row.entity_id) ?? [];
    existing.push(row);
    mapById.set(row.entity_id, existing);
  }

  return mapById;
}
