import { BonusType } from './bonus.types';

export type BuildingResourceType = 'drachma' | 'materials' | 'workforce';
export type BuildingRequirementType = 'hero_level' | 'hero_rank' | 'hero_stat';

export interface BuildingBonusPreview {
  templateId: string | null;
  target: string;
  type: BonusType;
  description: string | null;
  baseValue: number;
  currentValue: number;
  nextValue: number;
}

export interface BuildingResourceCostPreview {
  resourceType: BuildingResourceType;
  appliesFromLevel: number;
  baseValue: number;
  nextValue: number;
}

export interface BuildingResourceCostTotal {
  resourceType: BuildingResourceType;
  amount: number;
}

export interface BuildingRequirementPreview {
  type: BuildingRequirementType;
  statKey: string | null;
  statLabel: string | null;
  minValue: number;
  appliesFromLevel: number;
}

export interface BuildingFormulaOverrides {
  upgradeCostFormulaId: string | null;
  upgradeTimeFormulaId: string | null;
  bonusGrowthFormulaId: string | null;
}

export interface MansionBuilding {
  id: string;
  key: string;
  name: string;
  description: string | null;
  imagePath: string | null;
  districtCode: string;
  rankRequired: number;
  sortOrder: number;
  maxLevel: number;
  currentLevel: number;
  nextLevel: number;
  baseBuildTimeMinutes: number;
  isOwned: boolean;
  isUnlocked: boolean;
  canUpgrade: boolean;
  nextUpgradeTimeMinutes: number | null;
  nextUpgradeCosts: BuildingResourceCostTotal[];
  activeCostRules: BuildingResourceCostPreview[];
  activeRequirements: BuildingRequirementPreview[];
  bonuses: BuildingBonusPreview[];
}

export interface EditableBuildingBonus {
  templateId: string | null;
  target: string;
  type: BonusType;
  value: number;
  description: string;
}

export interface EditableBuildingResourceCost {
  id: string | null;
  resourceType: BuildingResourceType;
  baseValue: number;
  appliesFromLevel: number;
}

export interface EditableBuildingRequirement {
  id: string | null;
  type: BuildingRequirementType;
  statKey: string | null;
  minValue: number;
  appliesFromLevel: number;
}

export interface EditableBuilding {
  id: string | null;
  key: string;
  name: string;
  description: string;
  imagePath: string;
  districtCode: string;
  rankRequired: number;
  sortOrder: number;
  baseBuildTimeMinutes: number;
  maxLevel: number;
  formulaOverrides: BuildingFormulaOverrides;
  bonuses: EditableBuildingBonus[];
  resourceCosts: EditableBuildingResourceCost[];
  requirements: EditableBuildingRequirement[];
}

export interface BuildingDistrictOption {
  code: string;
  name: string;
  description: string;
  rank: number;
}

export interface BuildingStatOption {
  key: string;
  label: string;
}

export interface BuildingAdminData {
  buildings: EditableBuilding[];
  bonusTemplates: EditableBuildingBonus[];
  districts: BuildingDistrictOption[];
  stats: BuildingStatOption[];
}

export interface MansionEstateView {
  currentAddress: string | null;
  currentDistrictCode: string | null;
  currentDistrictName: string | null;
  buildings: MansionBuilding[];
}
