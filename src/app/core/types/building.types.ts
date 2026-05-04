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
  requirementDefinitionKey: string;
  label: string;
  valueLabel: string;
  description: string | null;
  appliesFromLevel: number;
  sortOrder: number;
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
  districtUnlockRank: number;
  rankRequired: number;
  sortOrder: number;
  startingLevel: number;
  baseCost: number;
  maxLevel: number;
  effectiveMaxLevel: number;
  isUnlimited: boolean;
  currentLevel: number;
  nextLevel: number;
  baseBuildTimeSeconds: number;
  isOwned: boolean;
  isUnlocked: boolean;
  canUpgrade: boolean;
  nextUpgradeTimeSeconds: number | null;
  nextUpgradeCosts: BuildingResourceCostTotal[];
  activeCostRules: BuildingResourceCostPreview[];
  activeRequirements: BuildingRequirementPreview[];
  bonuses: BuildingBonusPreview[];
}

export type EstateBuildingJobStatus = 'active' | 'completed' | 'cancelled' | 'failed';

export interface MansionBuildingJob {
  id: string;
  estateId: string;
  buildingId: string;
  buildingKey: string;
  buildingName: string;
  targetLevel: number;
  status: EstateBuildingJobStatus;
  startedAt: string;
  completesAt: string;
  durationSeconds: number;
  remainingSeconds: number;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface MansionBuildingJobFinalization {
  heroId: string;
  serverId: string;
  estateId: string;
  completedCount: number;
}

export interface BuildingUpgradeResourceCostResult {
  resourceType: BuildingResourceType;
  cost: number;
  balanceAfter: number;
}

export interface StartBuildingUpgradeResult {
  auditLogId: string;
  buildTimeSeconds: number;
  buildingId: string;
  completesAt: string;
  estateId: string;
  jobId: string;
  startedAt: string;
  status: EstateBuildingJobStatus;
  targetLevel: number;
  resourceCosts: BuildingUpgradeResourceCostResult[];
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

export interface EditableBuilding {
  id: string | null;
  key: string;
  name: string;
  description: string;
  imagePath: string;
  districtCode: string;
  sortOrder: number;
  baseBuildTimeSeconds: number;
  maxLevel: number;
  formulaOverrides: BuildingFormulaOverrides;
  bonuses: EditableBuildingBonus[];
  resourceCosts: EditableBuildingResourceCost[];
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

export type BuildingRequirementEntityType =
  | 'building_definition'
  | 'item_generation_base'
  | 'item_generation_affix'
  | 'item'
  | 'trial_definition'
  | 'trade_feature'
  | 'auction_feature';
export type BuildingRequirementValueType =
  | 'integer'
  | 'decimal'
  | 'boolean'
  | 'string'
  | 'stat_key'
  | 'building_key'
  | 'resource_type'
  | 'district_code'
  | 'enum_ref';

export interface BuildingRequirementDefinition {
  id: string;
  key: string;
  label: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  category: string;
  valueType: BuildingRequirementValueType;
  sortOrder: number;
  isActive: boolean;
}

export interface BuildingRequirementImpactPreview {
  entityRequirementId: string;
  entityType: BuildingRequirementEntityType;
  entityId: string;
  requirementDefinitionKey: string;
  requirementLabel: string;
  requirementDescription: string;
  requirementHelperText: string;
  requirementAdminDescription: string;
  requirementCategory: string;
  requirementValueType: BuildingRequirementValueType;
  resolvedValueLabel: string;
  appliesFromLevel: number;
  context: string;
  description: string;
  explanation: string;
  isActive: boolean;
  sortOrder: number;
  requiredBuildingKey: string;
  requiredDistrictCode: string;
  requiredResourceType: string;
  requiredStatKey: string;
  requiredValueBoolean: boolean;
  requiredValueDecimal: number;
  requiredValueInteger: number;
  requiredValueText: string;
}

export interface BuildingRequirementDraft {
  id: string | null;
  requirementDefinitionKey: string;
  appliesFromLevel: number;
  description: string;
  reason: string;
  sortOrder: number;
  requiredBuildingKey: string | null;
  requiredDistrictCode: string | null;
  requiredResourceType: string | null;
  requiredStatKey: string | null;
  requiredValueBoolean: boolean | null;
  requiredValueDecimal: number | null;
  requiredValueInteger: number | null;
  requiredValueText: string | null;
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
  baseBuildTimeSeconds: number;
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
  heroId: string;
  serverId: string;
  currentAddress: string | null;
  currentDistrictCode: string | null;
  currentDistrictName: string | null;
  activeBuildingJob: MansionBuildingJob | null;
  recentBuildingJobs: MansionBuildingJob[];
  finalizedBuildingJobsCount: number;
  buildings: MansionBuilding[];
}
