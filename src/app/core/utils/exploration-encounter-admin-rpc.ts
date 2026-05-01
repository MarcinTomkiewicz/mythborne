import { Json } from '../types/database.types';
import {
  DeactivateEncounterCombatCandidateRpcArgs,
  DeactivateEncounterDefinitionRpcArgs,
  DeactivateRewardProfileAssignmentRpcArgs,
  UpsertEncounterCombatCandidateRpcArgs,
  UpsertEncounterDefinitionRpcArgs,
  UpsertRewardProfileAssignmentRpcArgs,
} from '../types/exploration-encounter-admin-rpc.types';
import {
  UpsertEncounterCombatCandidateInput,
  UpsertEncounterDefinitionInput,
  UpsertEncounterRewardAssignmentInput,
} from '../domain/exploration/exploration-encounter-admin.model';
import { trimText, trimToNull } from './normalize-text';

export function toUpsertEncounterDefinitionRpcArgs(
  input: UpsertEncounterDefinitionInput,
): UpsertEncounterDefinitionRpcArgs {
  const args: UpsertEncounterDefinitionRpcArgs = {
    p_encounter_definition_id: trimToNull(input.encounterDefinitionId) ?? undefined,
    p_key: requiredText(input.key, 'key'),
    p_label: requiredText(input.label, 'label'),
    p_description: requiredText(input.description, 'description'),
    p_encounter_kind: requiredText(input.encounterKind, 'encounterKind'),
    p_sort_order: integer(input.sortOrder, 'sortOrder'),
    p_is_active: input.isActive,
    p_metadata_json: input.metadataJson as Json,
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_helper_text', input.helperText);
  addOptionalText(args, 'p_admin_description', input.adminDescription);
  addOptionalText(args, 'p_minigame_key', input.minigameKey);
  addOptionalText(args, 'p_reward_profile_id', input.rewardProfileId);
  addOptionalText(args, 'p_min_difficulty_key', input.minDifficultyKey);
  addOptionalText(args, 'p_max_difficulty_key', input.maxDifficultyKey);
  addOptionalText(args, 'p_min_district_code', input.minDistrictCode);
  addOptionalText(args, 'p_max_district_code', input.maxDistrictCode);

  return args;
}

export function toDeactivateEncounterDefinitionRpcArgs(
  encounterDefinitionId: string,
  reason: string,
): DeactivateEncounterDefinitionRpcArgs {
  return {
    p_encounter_definition_id: requiredText(encounterDefinitionId, 'encounterDefinitionId'),
    p_reason: requiredText(reason, 'reason'),
  };
}

export function toUpsertEncounterCombatCandidateRpcArgs(
  input: UpsertEncounterCombatCandidateInput,
): UpsertEncounterCombatCandidateRpcArgs {
  const args: UpsertEncounterCombatCandidateRpcArgs = {
    p_candidate_id: trimToNull(input.candidateId) ?? undefined,
    p_encounter_definition_id: requiredText(input.encounterDefinitionId, 'encounterDefinitionId'),
    p_candidate_kind: requiredText(input.candidateKind, 'candidateKind') as 'opponent' | 'family',
    p_difficulty_multiplier: positiveNumber(input.difficultyMultiplier, 'difficultyMultiplier'),
    p_weight: positiveNumber(input.weight, 'weight'),
    p_sort_order: integer(input.sortOrder, 'sortOrder'),
    p_is_active: input.isActive,
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_opponent_definition_id', input.opponentDefinitionId);
  addOptionalText(args, 'p_family_key', input.familyKey);
  addOptionalText(args, 'p_scaling_formula_id', input.scalingFormulaId);
  addOptionalInteger(args, 'p_min_hero_level', input.minHeroLevel);
  addOptionalInteger(args, 'p_max_hero_level', input.maxHeroLevel);

  return args;
}

export function toDeactivateEncounterCombatCandidateRpcArgs(
  candidateId: string,
  reason: string,
): DeactivateEncounterCombatCandidateRpcArgs {
  return {
    p_candidate_id: requiredText(candidateId, 'candidateId'),
    p_reason: requiredText(reason, 'reason'),
  };
}

export function toUpsertRewardProfileAssignmentRpcArgs(
  input: UpsertEncounterRewardAssignmentInput,
): UpsertRewardProfileAssignmentRpcArgs {
  const args: UpsertRewardProfileAssignmentRpcArgs = {
    p_assignment_id: trimToNull(input.assignmentId) ?? undefined,
    p_source_kind: 'encounter',
    p_encounter_definition_id: requiredText(input.encounterDefinitionId, 'encounterDefinitionId'),
    p_reward_profile_id: requiredText(input.rewardProfileId, 'rewardProfileId'),
    p_outcome_kind: requiredText(input.outcomeKind, 'outcomeKind'),
    p_sort_order: integer(input.sortOrder, 'sortOrder'),
    p_is_active: input.isActive,
    p_metadata_json: input.metadataJson as Json,
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_difficulty_key', input.difficultyKey);
  addOptionalText(args, 'p_district_code', input.districtCode);
  addOptionalText(args, 'p_description', input.description);
  addOptionalText(args, 'p_helper_text', input.helperText);

  return args;
}

export function toDeactivateRewardProfileAssignmentRpcArgs(
  assignmentId: string,
  reason: string,
): DeactivateRewardProfileAssignmentRpcArgs {
  return {
    p_assignment_id: requiredText(assignmentId, 'assignmentId'),
    p_reason: requiredText(reason, 'reason'),
  };
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for encounter configuration workflow.`);
  }

  return normalized;
}

function integer(value: number | null | undefined, field: string): number {
  const normalized = Math.floor(Number(value));

  if (!Number.isFinite(normalized)) {
    throw new Error(`${field} must be a number for encounter configuration workflow.`);
  }

  return normalized;
}

function positiveNumber(value: number | null | undefined, field: string): number {
  const normalized = Number(value);

  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new Error(`${field} must be positive for encounter configuration workflow.`);
  }

  return normalized;
}

function addOptionalText<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  key: K,
  value: string | null | undefined,
): void {
  const normalized = trimToNull(value);

  if (normalized) {
    target[key] = normalized as T[K];
  }
}

function addOptionalInteger<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  key: K,
  value: number | null | undefined,
): void {
  if (value === null || value === undefined) {
    return;
  }

  const normalized = Math.floor(Number(value));

  if (Number.isFinite(normalized)) {
    target[key] = normalized as T[K];
  }
}
