import {
  PreviewChallengeAutoResolveSuccessChanceRpcArgs,
  PreviewTrialManifestationChanceRpcArgs,
  PreviewTrialOpportunityCurveRpcArgs,
  SimulateTrialOpportunityRunsRpcArgs,
} from '../types/exploration-preview-rpc.types';
import {
  PreviewRewardGeneratedItemLuckRpcArgs,
  PreviewRewardProfileLuckRpcArgs,
} from '../types/luck-rpc.types';
import { trimToNull } from './normalize-text';
import {
  optionalNonNegativeInteger,
  optionalPositiveInteger,
} from './number';

export interface PreviewTrialOpportunityCurveInput {
  difficultyKey?: string | null;
  startingDryStepCount?: number | null;
  stepsToPreview?: number | null;
  spiritualityValue?: number | null;
  luckValue?: number | null;
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
  luckValue?: number | null;
}

export interface PreviewRewardProfileInput {
  rewardProfileId?: string | null;
  previewCount?: number | null;
  spiritualityValue?: number | null;
  luckValue?: number | null;
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
  const startingDryStepCount = optionalNonNegativeInteger(input.startingDryStepCount);
  const stepsToPreview = optionalPositiveInteger(input.stepsToPreview);
  const spiritualityValue = optionalNonNegativeInteger(input.spiritualityValue);
  const luckValue = optionalNonNegativeInteger(input.luckValue);

  if (startingDryStepCount !== null) {
    args.p_starting_dry_step_count = startingDryStepCount;
  }

  if (stepsToPreview !== null) {
    args.p_steps_to_preview = stepsToPreview;
  }

  if (spiritualityValue !== null) {
    args.p_spirituality_value = spiritualityValue;
  }

  if (luckValue !== null) {
    args.p_luck_value = luckValue;
  }

  return args;
}

export function toPreviewTrialManifestationChanceRpcArgs(
  input: PreviewTrialManifestationChanceInput,
): PreviewTrialManifestationChanceRpcArgs {
  const args: PreviewTrialManifestationChanceRpcArgs = {};

  addOptionalText(args, 'p_difficulty_key', input.difficultyKey);
  addOptionalText(args, 'p_district_code', input.districtCode);
  addOptionalText(args, 'p_trial_definition_id', input.trialDefinitionId);
  const testedStatValue = optionalNonNegativeInteger(input.testedStatValue);
  const spiritualityValue = optionalNonNegativeInteger(input.spiritualityValue);
  const luckValue = optionalNonNegativeInteger(input.luckValue);

  if (testedStatValue !== null) {
    args.p_tested_stat_value = testedStatValue;
  }

  if (spiritualityValue !== null) {
    args.p_spirituality_value = spiritualityValue;
  }

  if (luckValue !== null) {
    args.p_luck_value = luckValue;
  }

  return args;
}

export function toPreviewChallengeAutoResolveSuccessChanceRpcArgs(
  input: PreviewChallengeAutoResolveSuccessChanceInput,
): PreviewChallengeAutoResolveSuccessChanceRpcArgs {
  const args: PreviewChallengeAutoResolveSuccessChanceRpcArgs = {};

  addOptionalText(args, 'p_difficulty_key', input.difficultyKey);
  addOptionalText(args, 'p_tested_stat_key', input.testedStatKey);
  const testedStatValue = optionalNonNegativeInteger(input.testedStatValue);
  const spiritualityValue = optionalNonNegativeInteger(input.spiritualityValue);
  const luckValue = optionalNonNegativeInteger(input.luckValue);

  if (testedStatValue !== null) {
    args.p_tested_stat_value = testedStatValue;
  }

  if (spiritualityValue !== null) {
    args.p_spirituality_value = spiritualityValue;
  }

  if (luckValue !== null) {
    args.p_luck_value = luckValue;
  }

  return args;
}

export function toPreviewRewardGeneratedItemLuckRpcArgs(
  input: PreviewRewardGeneratedItemInput,
): PreviewRewardGeneratedItemLuckRpcArgs {
  const args: PreviewRewardGeneratedItemLuckRpcArgs = {};

  addOptionalText(args, 'p_bucket_profile_id', input.bucketProfileId);
  addOptionalText(args, 'p_max_quality_key', input.maxQualityKey);
  const previewCount = optionalPositiveInteger(input.previewCount);
  const luckValue = optionalNonNegativeInteger(input.luckValue);

  if (previewCount !== null) {
    args.p_preview_count = previewCount;
  }

  if (luckValue !== null) {
    args.p_luck_value = luckValue;
  }

  return args;
}

export function toPreviewRewardProfileLuckRpcArgs(
  input: PreviewRewardProfileInput,
): PreviewRewardProfileLuckRpcArgs {
  const args: PreviewRewardProfileLuckRpcArgs = {};

  addOptionalText(args, 'p_reward_profile_id', input.rewardProfileId);
  const previewCount = optionalPositiveInteger(input.previewCount);
  const spiritualityValue = optionalNonNegativeInteger(input.spiritualityValue);
  const luckValue = optionalNonNegativeInteger(input.luckValue);

  if (previewCount !== null) {
    args.p_preview_count = previewCount;
  }

  if (spiritualityValue !== null) {
    args.p_spirituality_value = spiritualityValue;
  }

  if (luckValue !== null) {
    args.p_luck_value = luckValue;
  }

  return args;
}

export function toSimulateTrialOpportunityRunsRpcArgs(
  input: SimulateTrialOpportunityRunsInput,
): SimulateTrialOpportunityRunsRpcArgs {
  const args: SimulateTrialOpportunityRunsRpcArgs = {};

  addOptionalText(args, 'p_difficulty_key', input.difficultyKey);
  const startingDryStepCount = optionalNonNegativeInteger(input.startingDryStepCount);
  const maxStepsPerRun = optionalPositiveInteger(input.maxStepsPerRun);
  const runCount = optionalPositiveInteger(input.runCount);

  if (startingDryStepCount !== null) {
    args.p_starting_dry_step_count = startingDryStepCount;
  }

  if (maxStepsPerRun !== null) {
    args.p_max_steps_per_run = maxStepsPerRun;
  }

  if (runCount !== null) {
    args.p_run_count = runCount;
  }

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
