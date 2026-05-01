import { Json } from '../../types/database.types';
import { BuildingDistrictOption } from '../../types/building.types';
import { BalanceFormula } from '../formula/formula.model';
import {
  EncounterDefinitionReadModel,
  ExplorationDifficultyTierReadModel,
  ExplorationMinigameDefinitionReadModel,
} from './exploration-definition.model';
import { RewardProfileReadModel } from './exploration-reward.model';
import {
  CombatOpponentDefinitionReadModel,
  CombatOpponentFamilyReadModel,
} from './exploration-trial-admin.model';

export interface EncounterCombatCandidateReadModel {
  id: string;
  encounterDefinitionId: string;
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

export interface RewardProfileAssignmentReadModel {
  id: string;
  sourceKind: string;
  trialDefinitionId: string | null;
  encounterDefinitionId: string | null;
  rewardProfileId: string;
  outcomeKind: string;
  difficultyKey: string | null;
  districtCode: string | null;
  description: string | null;
  helperText: string | null;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}

export interface ExplorationEncounterAdminData {
  encounters: EncounterDefinitionReadModel[];
  minigames: ExplorationMinigameDefinitionReadModel[];
  difficulties: ExplorationDifficultyTierReadModel[];
  districts: BuildingDistrictOption[];
  rewardProfiles: RewardProfileReadModel[];
  rewardAssignments: RewardProfileAssignmentReadModel[];
  combatCandidates: EncounterCombatCandidateReadModel[];
  opponents: CombatOpponentDefinitionReadModel[];
  families: CombatOpponentFamilyReadModel[];
  formulas: BalanceFormula[];
}

export interface UpsertEncounterDefinitionInput {
  encounterDefinitionId: string | null;
  key: string;
  label: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  encounterKind: string;
  minigameKey: string | null;
  rewardProfileId: string | null;
  minDifficultyKey: string | null;
  maxDifficultyKey: string | null;
  minDistrictCode: string | null;
  maxDistrictCode: string | null;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  reason: string;
}

export interface UpsertEncounterCombatCandidateInput {
  candidateId: string | null;
  encounterDefinitionId: string;
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

export interface UpsertEncounterRewardAssignmentInput {
  assignmentId: string | null;
  encounterDefinitionId: string;
  rewardProfileId: string;
  outcomeKind: string;
  difficultyKey: string | null;
  districtCode: string | null;
  description: string | null;
  helperText: string | null;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  reason: string;
}

export interface EncounterDefinitionAdminView {
  encounter: EncounterDefinitionReadModel;
  kindLabel: string;
  minigameLabel: string;
  rewardProfileLabel: string;
  difficultyRangeLabel: string;
  districtRangeLabel: string;
  isCombatEncounter: boolean;
}

export interface EncounterCombatCandidateAdminView {
  candidate: EncounterCombatCandidateReadModel;
  targetLabel: string;
  targetDescription: string | null;
  formulaLabel: string;
  levelRangeLabel: string;
}

export interface EncounterRewardAssignmentAdminView {
  assignment: RewardProfileAssignmentReadModel;
  rewardProfileLabel: string;
  scopeLabel: string;
}
