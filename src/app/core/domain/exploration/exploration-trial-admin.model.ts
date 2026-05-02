import { Json } from '../../types/database.types';
import { UiMetadataEntryReadModel } from '../admin-ui-metadata.model';
import { BuildingDistrictOption } from '../../types/building.types';
import { BalanceFormula } from '../formula/formula.model';
import {
  ExplorationDifficultyTierReadModel,
  ExplorationMinigameDefinitionReadModel,
  TrialDefinitionReadModel,
} from './exploration-definition.model';
import {
  RewardDictionaryReadModel,
  RewardOutcomeKindReadModel,
  RewardProfileAssignmentReadModel,
  RewardProfileEntryReadModel,
  RewardProfileEntrySummaryView,
  RewardProfileReadModel,
  ResourceTypeReadModel,
} from './exploration-reward.model';

export interface TrialCombatCandidateReadModel {
  id: string;
  trialDefinitionId: string;
  candidateKind: string;
  opponentDefinitionId: string | null;
  familyKey: string | null;
  scalingFormulaId: string | null;
  difficultyMultiplier: number;
  weight: number;
  minHeroLevel: number | null;
  maxHeroLevel: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CombatOpponentDefinitionReadModel {
  id: string;
  key: string;
  label: string;
  description: string | null;
  helperText: string | null;
  adminDescription: string | null;
  familyKey: string;
  equipmentMode: string;
  defaultScalingFormulaId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CombatOpponentFamilyReadModel {
  key: string;
  label: string;
  description: string | null;
  helperText: string | null;
  adminDescription: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrialStatReadModel {
  key: string;
  label: string;
  description: string | null;
  helperText: string | null;
  adminDescription: string | null;
}

export interface ExplorationTrialAdminData {
  trials: TrialDefinitionReadModel[];
  minigames: ExplorationMinigameDefinitionReadModel[];
  stats: TrialStatReadModel[];
  difficulties: ExplorationDifficultyTierReadModel[];
  districts: BuildingDistrictOption[];
  rewardProfiles: RewardProfileReadModel[];
  rewardProfileEntries: RewardProfileEntryReadModel[];
  rewardOutcomeKinds: RewardOutcomeKindReadModel[];
  resourceTypes: ResourceTypeReadModel[];
  rewardAssignmentMatchKinds: RewardDictionaryReadModel[];
  rewardSourceKinds: RewardDictionaryReadModel[];
  rewardEntryKinds: RewardDictionaryReadModel[];
  rewardEntryAmountModes: RewardDictionaryReadModel[];
  rewardAssignments: RewardProfileAssignmentReadModel[];
  combatCandidates: TrialCombatCandidateReadModel[];
  opponents: CombatOpponentDefinitionReadModel[];
  families: CombatOpponentFamilyReadModel[];
  formulas: BalanceFormula[];
  uiMetadataEntries: UiMetadataEntryReadModel[];
}

export interface UpsertTrialDefinitionInput {
  trialDefinitionId: string | null;
  key: string;
  label: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  testedStatKey: string;
  minigameKey: string;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  reason: string;
}

export interface UpsertTrialCombatCandidateInput {
  candidateId: string | null;
  trialDefinitionId: string;
  candidateKind: string;
  opponentDefinitionId: string | null;
  familyKey: string | null;
  scalingFormulaId: string | null;
  difficultyMultiplier: number;
  weight: number;
  minHeroLevel: number | null;
  maxHeroLevel: number | null;
  sortOrder: number;
  isActive: boolean;
  reason: string;
}

export interface UpsertTrialRewardAssignmentInput {
  assignmentId: string | null;
  trialDefinitionId: string;
  rewardProfileId: string;
  outcomeKind: string;
  difficultyKey: string | null;
  difficultyMatchKind: string;
  maxDifficultyKey: string | null;
  districtCode: string | null;
  districtMatchKind: string;
  maxDistrictCode: string | null;
  description: string | null;
  helperText: string | null;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  reason: string;
}

export interface TrialCombatCandidateAdminView {
  candidate: TrialCombatCandidateReadModel;
  targetLabel: string;
  targetDescription: string | null;
  formulaLabel: string;
  levelRangeLabel: string;
}

export interface TrialDefinitionAdminView {
  trial: TrialDefinitionReadModel;
  testedStatLabel: string;
  testedStatDescription: string | null;
  minigameLabel: string;
  minigameDescription: string | null;
  isCombatTrial: boolean;
  metadataJson: Json;
}

export interface TrialRewardAssignmentAdminView {
  assignment: RewardProfileAssignmentReadModel;
  rewardProfileLabel: string;
  rewardProfileDescription: string | null;
  outcomeLabel: string;
  difficultyMatchLabel: string;
  districtMatchLabel: string;
  scopeLabel: string;
  summaryLabel: string;
  rewardProfileEntrySummaries: RewardProfileEntrySummaryView[];
}
