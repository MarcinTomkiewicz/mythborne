import type { Json } from '../../types/database.types';

export interface PlayerEstatePageContextV3 {
  contractVersion: 'player_estate_page_context_v3';
  hero: PlayerEstateHeroRow;
  copyJson: EstateCopyJson;
  estateRuntimeState: EstateRuntimeState | null;
}

export interface PlayerEstateHeroRow {
  id: string;
  name: string;
  level: number | null;
  origin_id: string | null;
  rank: number | null;
  experience: number | null;
  profile_picture: string | null;
  created_at: string | null;
  estate_id: string | null;
  user_id: string;
  server_id: string;
  character_points: number;
  total_character_points_earned: number;
  total_experience_earned: number;
}

export interface EstateCopyJson {
  sections: {
    overview: string;
    buildings: string;
    resources: string;
    requirements?: string;
    upgradePreview?: string;
    bonuses?: string;
  };
  summary: {
    district: string;
    activeJob: string;
    vicinity: string;
    address?: string;
    rank?: string;
    buildingsReady?: string;
  };
  actions: {
    upgrade: string;
    details: string;
    openVicinityEstateList: string;
    openVicinityEstateListAriaLabel: string;
  };
  empty: {
    buildings: string;
    bonuses: string;
    activeJob: string;
    requirements?: string;
  };
  labels: {
    currentLevel: string;
    nextLevel: string;
    buildTime: string;
    maxLevel?: string;
    availableInDistrict?: string;
  };
  topSummary?: {
    vicinityLabel?: string;
    vicinityActionLabel?: string;
    activeJobEmptyLabel?: string;
  };
}

export interface EstateRuntimeState {
  hero_id: string;
  server_id: string;
  estate_id: string;
  district_code: string;
  address_number?: number;
  address?: string;
  estate_rank?: number;
  settled_completed_count?: number;
  settled_as_of?: string;
  active_job_json: EstateBuildingJob | null;
  recent_jobs_json: EstateBuildingJob[];
  resources_json: EstateResourceRow[];
  buildings_json: EstateBuildingRow[];
  building_groups_json: EstateBuildingGroupRow[];
  attack_protection_active?: boolean;
  attack_protection_expires_at?: string;
  attack_protection_source_entity_type?: string;
  attack_protection_source_entity_id?: string;
  siege_protection_active?: boolean;
  siege_protection_expires_at?: string;
  siege_protection_source?: string;
}

export interface EstateBuildingJob {
  jobId: string;
  estateId: string;
  buildingId: string;
  buildingKey?: string;
  buildingName?: string;
  targetLevel: number;
  status: 'active' | 'completed' | 'cancelled' | 'failed' | string;
  startedAt?: string;
  completesAt?: string;
  createdAt?: string;
  updatedAt?: string;
  secondsUntilCompletion?: number;
  isDue?: boolean;
}

export interface EstateResourceRow {
  resourceId?: string;
  heroId?: string;
  resourceType: 'drachma' | 'materials' | 'workforce' | string;
  amount?: number;
  perHour?: number;
  updatedAt?: string;
  dbNow?: string;
  elapsedHours?: number;
  naiveLiveAmountIfAccrued?: number;
  displayLabel: string;
  displayValue: string;
}

export interface EstateBuildingRow {
  buildingId: string;
  buildingKey: string;
  buildingName: string;
  buildingDescription?: string;
  districtCode?: string;
  level: number;
  currentLevel: number;
  targetLevel: number;
  nextLevel: number;
  startingLevel?: number;
  maxLevel?: number;
  effectiveMaxLevel?: number;
  isAtMaxLevel?: boolean;
  isAvailableInEstateDistrict?: boolean;
  resourceCostsJson: EstateResourceCostRow[];
  requirementsJson: EstateRequirementRow[];
  bonusesJson: EstateBuildingBonusRow[];
  upgradePreviewJson: EstateUpgradePreview | null;
  meetsRequirements: boolean;
  meetsResourceCosts?: boolean;
  canAffordResourceCosts?: boolean;
  resourceCostCount?: number;
  unmetResourceCostCount?: number;
  resourceCostFailuresJson?: EstateResourceCostRow[];
  requirementCount: number;
  unmetCount: number;
  requirementFailuresJson: EstateRequirementRow[];
}

export interface EstateBuildingGroupRow {
  groupKey: string;
  districtCode?: string;
  districtLabel?: string;
  groupTitle: string;
  displayLabel: string;
  sortOrder?: number;
  isCurrentEstateDistrict?: boolean;
  buildingCount: number;
  buildingsJson: EstateBuildingRow[];
}

export interface EstateResourceCostRow {
  resourceType: 'drachma' | 'materials' | 'workforce' | string;
  amount: number;
  displayLabel: string;
  displayValue: string;
  sortOrder?: number;
  currentAmount?: number;
  currentDisplayValue?: string;
  isMet?: boolean;
  statusKey?: 'met' | 'not_met' | string;
  displayTone?: 'success' | 'danger' | string;
  missingAmount?: number;
  missingDisplayValue?: string;
  failureReasonKey?: 'insufficient_resource' | string;
  failureReasonLabel?: string;
  valueSource?: string;
}

export interface EstateRequirementRow {
  entityRequirementId: string;
  requirementDefinitionKey: string;
  requiredValue?: number;
  requiredStatKey?: string;
  requiredBuildingKey?: string;
  requiredResourceType?: string;
  requiredDistrictCode?: string;
  context?: string;
  sortOrder?: number;
  displayLabel: string;
  displayValue: string;
  displayUnit?: string;
  isMet: boolean;
  statusKey: 'met' | 'not_met' | string;
  displayTone: 'success' | 'danger' | string;
  currentValue?: number;
  currentDisplayValue?: string;
  missingValue?: number;
  missingDisplayValue?: string;
  failureReasonKey?: 'requirement_not_met' | string;
  failureReasonLabel?: string;
  valueSource?: string;
}

export interface EstateBuildingBonusRow {
  entityBonusId: string;
  targetKey: string;
  typeKey: 'flat' | 'percent' | 'per_4_levels' | string;
  scopeKey: string;
  displayLabel?: string;
  targetLabel?: string;
  targetDescription?: string;
  targetHelperText?: string;
  currentLevel?: number;
  nextLevel?: number;
  currentValue?: number;
  nextValue?: number;
  delta?: number;
  displayValue?: string;
  nextDisplayValue?: string;
  deltaDisplayValue?: string;
  displayText?: string;
  nextDisplayText?: string;
  deltaDisplayText?: string;
  fullDisplayText?: string;
  nextFullDisplayText?: string;
  deltaFullDisplayText?: string;
}

export interface EstateUpgradePreview {
  contractVersion: 'estate_building_upgrade_preview_v2';
  currentLevel: number;
  targetLevel: number;
  nextLevel: number;
  isAtMaxLevel?: boolean;
  effectiveMaxLevel?: number;
  buildTimeSeconds?: number;
  resourceCostsJson: EstateResourceCostRow[];
  requirementsJson: EstateRequirementRow[];
  bonusesJson: EstateBuildingBonusRow[];
  meetsRequirements: boolean;
  meetsResourceCosts?: boolean;
  canAffordResourceCosts?: boolean;
  resourceCostCount?: number;
  unmetResourceCostCount?: number;
  resourceCostFailuresJson?: EstateResourceCostRow[];
  requirementCount: number;
  unmetCount: number;
  failuresJson: EstateRequirementRow[];
}

export type PlayerEstateRawJson = Json;
