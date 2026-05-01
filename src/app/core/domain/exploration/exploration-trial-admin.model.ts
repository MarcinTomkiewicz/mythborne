import { Json } from '../../types/database.types';
import { BuildingStatOption } from '../../types/building.types';
import { BalanceFormula } from '../formula/formula.model';
import {
  ExplorationMinigameDefinitionReadModel,
  TrialDefinitionReadModel,
} from './exploration-definition.model';

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

export interface ExplorationTrialAdminData {
  trials: TrialDefinitionReadModel[];
  minigames: ExplorationMinigameDefinitionReadModel[];
  stats: BuildingStatOption[];
  combatCandidates: TrialCombatCandidateReadModel[];
  opponents: CombatOpponentDefinitionReadModel[];
  families: CombatOpponentFamilyReadModel[];
  formulas: BalanceFormula[];
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
  minigameLabel: string;
  minigameDescription: string | null;
  isCombatTrial: boolean;
  metadataJson: Json;
}
