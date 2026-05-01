import { Json } from '../types/database.types';
import {
  DeactivateTrialCombatCandidateRpcArgs,
  UpsertTrialCombatCandidateRpcArgs,
  UpsertTrialDefinitionRpcArgs,
} from '../types/exploration-trial-admin-rpc.types';
import {
  UpsertTrialCombatCandidateInput,
  UpsertTrialDefinitionInput,
} from '../domain/exploration/exploration-trial-admin.model';
import { trimText, trimToNull } from './normalize-text';

export function toUpsertTrialDefinitionRpcArgs(
  input: UpsertTrialDefinitionInput,
): UpsertTrialDefinitionRpcArgs {
  return {
    p_trial_definition_id: trimToNull(input.trialDefinitionId) ?? undefined,
    p_key: requiredText(input.key, 'key'),
    p_label: requiredText(input.label, 'label'),
    p_description: requiredText(input.description, 'description'),
    p_helper_text: trimToNull(input.helperText) ?? undefined,
    p_admin_description: trimToNull(input.adminDescription) ?? undefined,
    p_tested_stat_key: requiredText(input.testedStatKey, 'testedStatKey'),
    p_minigame_key: requiredText(input.minigameKey, 'minigameKey'),
    p_sort_order: integer(input.sortOrder, 'sortOrder'),
    p_is_active: input.isActive,
    p_metadata_json: input.metadataJson as Json,
    p_reason: requiredText(input.reason, 'reason'),
  };
}

export function toUpsertTrialCombatCandidateRpcArgs(
  input: UpsertTrialCombatCandidateInput,
): UpsertTrialCombatCandidateRpcArgs {
  const args: UpsertTrialCombatCandidateRpcArgs = {
    p_candidate_id: trimToNull(input.candidateId) ?? undefined,
    p_trial_definition_id: requiredText(input.trialDefinitionId, 'trialDefinitionId'),
    p_candidate_kind: requiredText(input.candidateKind, 'candidateKind') as 'opponent' | 'family',
    p_difficulty_multiplier: positiveNumber(
      input.difficultyMultiplier,
      'difficultyMultiplier',
    ),
    p_weight: positiveNumber(input.weight, 'weight'),
    p_sort_order: integer(input.sortOrder, 'sortOrder'),
    p_is_active: input.isActive,
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_opponent_definition_id', input.opponentDefinitionId);
  addOptionalText(args, 'p_family_key', input.familyKey);
  addOptionalText(args, 'p_scaling_formula_id', input.scalingFormulaId);
  addOptionalNumber(args, 'p_min_hero_level', input.minHeroLevel);
  addOptionalNumber(args, 'p_max_hero_level', input.maxHeroLevel);

  return args;
}

export function toDeactivateTrialCombatCandidateRpcArgs(
  candidateId: string,
  reason: string,
): DeactivateTrialCombatCandidateRpcArgs {
  return {
    p_candidate_id: requiredText(candidateId, 'candidateId'),
    p_reason: requiredText(reason, 'reason'),
  };
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for trial configuration workflow.`);
  }

  return normalized;
}

function integer(value: number | null | undefined, field: string): number {
  const normalized = Math.floor(Number(value));

  if (!Number.isFinite(normalized)) {
    throw new Error(`${field} must be a number for trial configuration workflow.`);
  }

  return normalized;
}

function positiveNumber(value: number | null | undefined, field: string): number {
  const normalized = Number(value);

  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new Error(`${field} must be positive for trial configuration workflow.`);
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

function addOptionalNumber<T extends Record<string, unknown>, K extends keyof T>(
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
