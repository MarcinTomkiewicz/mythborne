import { MansionBuilding } from '../../domain/building/building.model';
import {
  SUPABASE_ASSET_IMAGE_TRANSFORMS,
  storageBackedImageUrl,
} from '../../config/storage-assets.config';
import { resolveBuildingImagePath } from '../../domain/building/building-image-paths';
import { FormulaAdminData } from '../../domain/formula/formula.model';
import { BuildingProgressionRules } from '../../domain/progression/building-progression.model';
import { CanonicalEntityBonusWithTemplateRow } from '../../types/bonus-governance.types';
import {
  BuildingDistrictLevelCapRow,
  EstateBuildingRow,
  MansionBuildingRequirementRow,
  MansionBuildingResourceCostRow,
  MansionBuildingRow,
} from '../../types/building-service.types';
import {
  aggregateCostTotals,
  mapActiveCostRules,
  mapBuildingBonuses,
} from './building-runtime-calculation';
import {
  effectiveBuildingMaxLevel,
  isUnlimitedBuildingCap,
  mapActiveBuildingRequirements,
  requiredBuildingDistrictCode,
  requiredDistrictRank,
  requiredEstateBuildingLevel,
} from './building-runtime-read-model';

export interface MansionBuildingMappingInput {
  building: MansionBuildingRow & {
    building_resource_costs: MansionBuildingResourceCostRow[];
  };
  bonuses: CanonicalEntityBonusWithTemplateRow[];
  estateBuildingsByBuildingId: ReadonlyMap<string, EstateBuildingRow>;
  levelCaps: ReadonlyMap<string, BuildingDistrictLevelCapRow>;
  requirements: readonly MansionBuildingRequirementRow[];
  statLabels: ReadonlyMap<string, string>;
  currentDistrictRank: number;
  currentDistrictCode: string;
  districtRanks: ReadonlyMap<string, number>;
  formulaData: FormulaAdminData;
  resolveRulesForBuilding: (
    buildingId: string,
    data: FormulaAdminData,
  ) => BuildingProgressionRules;
  getUpgradeTimeSeconds: (
    currentLevel: number,
    baseBuildTimeSeconds: number,
    rank: number,
    rules: BuildingProgressionRules,
  ) => number | null;
  getUpgradeCost: (
    currentLevel: number,
    baseValue: number,
    rank: number,
    rules: BuildingProgressionRules,
  ) => number | null;
  getBonusValue: (
    currentLevel: number,
    baseValue: number,
    rules: BuildingProgressionRules,
  ) => number | null;
}

export function mapMansionBuilding(input: MansionBuildingMappingInput): MansionBuilding {
  const building = input.building;
  const districtCode = requiredBuildingDistrictCode(building);
  const buildingDistrictRank = requiredDistrictRank(districtCode, input.districtRanks);
  const currentLevel = requiredEstateBuildingLevel(
    input.estateBuildingsByBuildingId,
    building,
  );
  const nextLevel = currentLevel + 1;
  const effectiveMaxLevel = effectiveBuildingMaxLevel({
    building,
    currentDistrictCode: input.currentDistrictCode,
    levelCaps: input.levelCaps,
  });
  const isUnlimited = isUnlimitedBuildingCap(effectiveMaxLevel);
  const canUpgrade = isUnlimited || currentLevel < effectiveMaxLevel;
  const rules = input.resolveRulesForBuilding(building.id, input.formulaData);
  const activeCostRules = canUpgrade
    ? mapActiveCostRules(
        building.building_resource_costs ?? [],
        currentLevel,
        building.rank_required,
        rules,
        input.getUpgradeCost,
      )
    : [];

  return {
    id: building.id,
    key: building.key,
    name: building.name,
    description: building.description ?? null,
    imagePath: resolveBuildingImagePath(building.key, districtCode) ??
      storageBackedImageUrl(
        building.image_path ?? '/assets/icons/capitol.svg',
        SUPABASE_ASSET_IMAGE_TRANSFORMS.buildingCard,
      ),
    districtCode,
    districtUnlockRank: buildingDistrictRank,
    rankRequired: building.rank_required,
    sortOrder: building.sort_order ?? 0,
    startingLevel: building.starting_level,
    baseCost: building.base_cost,
    maxLevel: building.max_level ?? 0,
    effectiveMaxLevel,
    isUnlimited,
    currentLevel,
    nextLevel,
    baseBuildTimeSeconds: building.base_build_time_seconds ?? 0,
    isOwned: currentLevel > 0,
    isUnlocked: buildingDistrictRank <= input.currentDistrictRank,
    canUpgrade,
    nextUpgradeTimeSeconds: canUpgrade
      ? input.getUpgradeTimeSeconds(
          currentLevel,
          building.base_build_time_seconds ?? 0,
          building.rank_required,
          rules,
        )
      : null,
    nextUpgradeCosts: aggregateCostTotals(activeCostRules),
    activeCostRules,
    activeRequirements: mapActiveBuildingRequirements(
      input.requirements,
      nextLevel,
      input.statLabels,
    ),
    bonuses: mapBuildingBonuses(
      input.bonuses,
      currentLevel,
      rules,
      input.getBonusValue,
    ),
  };
}
