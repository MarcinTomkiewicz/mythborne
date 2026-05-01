import { Json } from '../../types/database.types';
import { Row } from '../../types/supabase.types';

export type ExplorationDifficultyKey = Row<'exploration_difficulty_tiers'>['key'];
export type ExplorationMinigameKey = Row<'exploration_minigame_definitions'>['key'];
export type EncounterKind = Row<'encounter_definitions'>['encounter_kind'];

export interface ExplorationDifficultyTierReadModel {
  key: string;
  label: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  sortOrder: number;
  isActive: boolean;
  stepDurationMultiplier: number;
  trialRewardMultiplier: number;
  encounterRewardMultiplier: number;
  trialOpportunityStepCap: number;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}

export interface ExplorationMinigameDefinitionReadModel {
  key: string;
  label: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  implementationKey: string;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}

export interface TrialDefinitionReadModel {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface EncounterDefinitionReadModel {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface ExplorationLocationDescriptionReadModel {
  id: string;
  key: string;
  label: string;
  description: string;
  helperText: string | null;
  difficultyKey: string | null;
  districtCode: string | null;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}

export interface TrialManifestationCapProfileReadModel {
  id: string;
  difficultyKey: string;
  districtCode: string;
  maxManifestationChancePercent: number;
  description: string | null;
  helperText: string | null;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}
