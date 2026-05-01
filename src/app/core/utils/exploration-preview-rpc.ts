import {
  PreviewChallengeAutoResolveSuccessChanceRpcArgs,
  PreviewRewardGeneratedItemRpcArgs,
  PreviewRewardProfileRpcArgs,
  PreviewTrialManifestationChanceRpcArgs,
  PreviewTrialOpportunityCurveRpcArgs,
  SimulateTrialOpportunityRunsRpcArgs,
} from '../types/exploration-preview-rpc.types';
import { trimToNull } from './normalize-text';

export interface PreviewTrialOpportunityCurveInput {
  difficultyKey?: string | null;
  startingDryStepCount?: number | null;
  stepsToPreview?: number | null;
}

export interface PreviewTrialManifestationChanceInput {
  difficultyKey?: string | null;
  districtCode?: string | null;
  trialDefinitionId?: string | null;
  testedStatValue?: number | null;
  spiritualityValue?: number | null;
  luckValue?: number | null;
}

export interface PreviewChallengeAutoResolveSuccessChanceInput {
  difficultyKey?: string | null;
  testedStatKey?: string | null;
  testedStatValue?: number | null;
  spiritualityValue?: number | null;
  luckValue?: number | null;
}

export interface PreviewRewardGeneratedItemInput {
  bucketProfileId?: string | null;
  maxQualityKey?: string | null;
  previewCount?: number | null;
}

export interface PreviewRewardProfileInput {
  rewardProfileId?: string | null;
  previewCount?: number | null;
}

export interface SimulateTrialOpportunityRunsInput {
  difficultyKey?: string | null;
  startingDryStepCount?: number | null;
  maxStepsPerRun?: number | null;
  runCount?: number | null;
  includeRollHistory?: boolean | null;
}

export function toPreviewTrialOpportunityCurveRpcArgs(
  input: PreviewTrialOpportunityCurveInput,
): PreviewTrialOpportunityCurveRpcArgs {
  const args: PreviewTrialOpportunityCurveRpcArgs = {};

  addOptionalText(args, 'p_difficulty_key', input.difficultyKey);
  addOptionalNonNegativeInteger(
    args,
    'p_starting_dry_step_count',
    input.startingDryStepCount,
  );
  addOptionalPositiveInteger(args, 'p_steps_to_preview', input.stepsToPreview);

  return args;
}

export function toPreviewTrialManifestationChanceRpcArgs(
  input: PreviewTrialManifestationChanceInput,
): PreviewTrialManifestationChanceRpcArgs {
  const args: PreviewTrialManifestationChanceRpcArgs = {};

  addOptionalText(args, 'p_difficulty_key', input.difficultyKey);
  addOptionalText(args, 'p_district_code', input.districtCode);
  addOptionalText(args, 'p_trial_definition_id', input.trialDefinitionId);
  addOptionalNonNegativeInteger(args, 'p_tested_stat_value', input.testedStatValue);
  addOptionalNonNegativeInteger(args, 'p_spirituality_value', input.spiritualityValue);
  addOptionalNonNegativeInteger(args, 'p_luck_value', input.luckValue);

  return args;
}

export function toPreviewChallengeAutoResolveSuccessChanceRpcArgs(
  input: PreviewChallengeAutoResolveSuccessChanceInput,
): PreviewChallengeAutoResolveSuccessChanceRpcArgs {
  const args: PreviewChallengeAutoResolveSuccessChanceRpcArgs = {};

  addOptionalText(args, 'p_difficulty_key', input.difficultyKey);
  addOptionalText(args, 'p_tested_stat_key', input.testedStatKey);
  addOptionalNonNegativeInteger(args, 'p_tested_stat_value', input.testedStatValue);
  addOptionalNonNegativeInteger(args, 'p_spirituality_value', input.spiritualityValue);
  addOptionalNonNegativeInteger(args, 'p_luck_value', input.luckValue);

  return args;
}

export function toPreviewRewardGeneratedItemRpcArgs(
  input: PreviewRewardGeneratedItemInput,
): PreviewRewardGeneratedItemRpcArgs {
  const args: PreviewRewardGeneratedItemRpcArgs = {};

  addOptionalText(args, 'p_bucket_profile_id', input.bucketProfileId);
  addOptionalText(args, 'p_max_quality_key', input.maxQualityKey);
  addOptionalPositiveInteger(args, 'p_preview_count', input.previewCount);

  return args;
}

export function toPreviewRewardProfileRpcArgs(
  input: PreviewRewardProfileInput,
): PreviewRewardProfileRpcArgs {
  const args: PreviewRewardProfileRpcArgs = {};

  addOptionalText(args, 'p_reward_profile_id', input.rewardProfileId);
  addOptionalPositiveInteger(args, 'p_preview_count', input.previewCount);

  return args;
}

export function toSimulateTrialOpportunityRunsRpcArgs(
  input: SimulateTrialOpportunityRunsInput,
): SimulateTrialOpportunityRunsRpcArgs {
  const args: SimulateTrialOpportunityRunsRpcArgs = {};

  addOptionalText(args, 'p_difficulty_key', input.difficultyKey);
  addOptionalNonNegativeInteger(
    args,
    'p_starting_dry_step_count',
    input.startingDryStepCount,
  );
  addOptionalPositiveInteger(args, 'p_max_steps_per_run', input.maxStepsPerRun);
  addOptionalPositiveInteger(args, 'p_run_count', input.runCount);

  if (input.includeRollHistory !== null && input.includeRollHistory !== undefined) {
    args.p_include_roll_history = input.includeRollHistory;
  }

  return args;
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

function addOptionalPositiveInteger<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  key: K,
  value: number | null | undefined,
): void {
  const normalized = optionalInteger(value, 1);

  if (normalized !== null) {
    target[key] = normalized as T[K];
  }
}

function addOptionalNonNegativeInteger<
  T extends Record<string, unknown>,
  K extends keyof T,
>(target: T, key: K, value: number | null | undefined): void {
  const normalized = optionalInteger(value, 0);

  if (normalized !== null) {
    target[key] = normalized as T[K];
  }
}

function optionalInteger(value: number | null | undefined, min: number): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = Math.floor(Number(value));

  return Number.isFinite(normalized) && normalized >= min ? normalized : null;
}
