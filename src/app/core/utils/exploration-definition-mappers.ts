import {
  EncounterDefinitionReadModel,
  ExplorationDifficultyTierReadModel,
  ExplorationLocationDescriptionReadModel,
  ExplorationMinigameDefinitionReadModel,
  TrialDefinitionReadModel,
  TrialManifestationCapProfileReadModel,
} from '../domain/exploration/exploration-definition.model';
import { Row } from '../types/supabase.types';

export function mapExplorationDifficultyTier(
  row: Row<'exploration_difficulty_tiers'>,
): ExplorationDifficultyTierReadModel {
  return {
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    stepDurationMultiplier: row.step_duration_multiplier,
    trialRewardMultiplier: row.trial_reward_multiplier,
    encounterRewardMultiplier: row.encounter_reward_multiplier,
    trialOpportunityStepCap: row.trial_opportunity_step_cap,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapExplorationMinigameDefinition(
  row: Row<'exploration_minigame_definitions'>,
): ExplorationMinigameDefinitionReadModel {
  return {
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    implementationKey: row.implementation_key,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTrialDefinition(row: Row<'trial_definitions'>): TrialDefinitionReadModel {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    testedStatKey: row.tested_stat_key,
    minigameKey: row.minigame_key,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapEncounterDefinition(
  row: Row<'encounter_definitions'>,
): EncounterDefinitionReadModel {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    encounterKind: row.encounter_kind,
    minigameKey: row.minigame_key,
    rewardProfileId: row.reward_profile_id,
    minDifficultyKey: row.min_difficulty_key,
    maxDifficultyKey: row.max_difficulty_key,
    minDistrictCode: row.min_district_code,
    maxDistrictCode: row.max_district_code,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapExplorationLocationDescription(
  row: Row<'exploration_location_descriptions'>,
): ExplorationLocationDescriptionReadModel {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    difficultyKey: row.difficulty_key,
    districtCode: row.district_code,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTrialManifestationCapProfile(
  row: Row<'trial_manifestation_cap_profiles'>,
): TrialManifestationCapProfileReadModel {
  return {
    id: row.id,
    difficultyKey: row.difficulty_key,
    districtCode: row.district_code,
    maxManifestationChancePercent: row.max_manifestation_chance_percent,
    description: row.description,
    helperText: row.helper_text,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
