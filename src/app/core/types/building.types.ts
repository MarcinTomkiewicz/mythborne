import { BonusScope, BonusType } from './bonus.types';

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
  bonusTemplateMetadata: BuildingBonusTemplateMetadata[];
  districts: BuildingDistrictOption[];
  stats: BuildingStatOption[];
}

export interface BuildingBonusTemplateMetadata {
  id: string;
  key: string;
  label: string;
  category: string;
  target: string;
  type: BonusType;
  scope: BonusScope;
  description: string;
  baseValue: number;
  levelsStep: number | null;
  sourceStat: string | null;
  scalingFactor: number | null;
  isActive: boolean;
}

export interface BuildingProgressionPreviewInput {
  buildingId: string;
  districtCode: string;
  fromLevel: number | string | null | undefined;
  toLevel: number | string | null | undefined;
}

export interface BuildingProgressionPreview {
  buildingId: string;
  buildingKey: string;
  buildingName: string;
  buildingDescription: string;
  selectedDistrictCode: string;
  minimumDistrictCode: string;
  previewLevel: number;
  nextLevel: number;
  baseCost: number;
  baseBuildTimeMinutes: number;
  defaultMaxLevel: number;
  effectiveMaxLevel: number;
  isUnlimited: boolean;
  isAvailableInSelectedDistrict: boolean;
  capSource: string;
  capExplanation: string;
  districtExplanation: string;
}

export interface BuildingBonusImpactPreview {
  entityBonusId: string;
  bonusTemplateId: string;
  bonusKey: string;
  bonusLabel: string;
  bonusDescription: string;
  bonusTypeKey: string;
  bonusTypeLabel: string;
  bonusTypeDescription: string;
  bonusScopeKey: string;
  bonusScopeLabel: string;
  bonusScopeDescription: string;
  bonusTargetKey: string;
  bonusTargetLabel: string;
  bonusTargetDescription: string;
  value: number;
  previewValue: number;
  qualityKey: string;
  qualityLabel: string;
  qualityMultiplier: number;
  qualityScalesValue: boolean;
  qualityScalesLevelInterval: boolean;
  levelInterval: number;
  scalingStatKey: string;
  explanation: string;
  warningText: string;
}

export interface MansionEstateView {
  currentAddress: string | null;
  currentDistrictCode: string | null;
  currentDistrictName: string | null;
  buildings: MansionBuilding[];
}
