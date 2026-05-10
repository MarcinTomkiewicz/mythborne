import {
  PreviewChallengeAutoResolveSuccessChanceLuckRpcArgs,
  PreviewCombatLuckFormulaContextRpcArgs,
  PreviewExplorationLuckRngChainRpcArgs,
  PreviewNonTrialEncounterChanceLuckRpcArgs,
  PreviewRewardGeneratedItemLuckRpcArgs,
  PreviewRewardProfileLuckRpcArgs,
  PreviewTrialManifestationChanceLuckRpcArgs,
  PreviewTrialOpportunityCurveLuckRpcArgs,
} from '../../types/luck-rpc.types';
import { LuckLabInputState } from '../../domain/luck/luck.model';
import { trimToNull } from '../../utils/normalize-text';
import { optionalNonNegativeInteger, optionalPositiveInteger } from '../../utils/number';

export function toTrialOpportunityArgs(
  input: LuckLabInputState,
): PreviewTrialOpportunityCurveLuckRpcArgs {
  const args: PreviewTrialOpportunityCurveLuckRpcArgs = {};

  addOptionalText(args, 'p_difficulty_key', input.difficultyKey);
  addOptionalNonNegativeInteger(args, 'p_starting_dry_step_count', input.dryStepCount);
  addOptionalPositiveInteger(args, 'p_steps_to_preview', input.stepsToPreview);
  addOptionalNonNegativeInteger(args, 'p_spirituality_value', input.spiritualityValue);
  addOptionalNonNegativeInteger(args, 'p_luck_value', input.luckValue);

  return args;
}

export function toTrialManifestationArgs(
  input: LuckLabInputState,
): PreviewTrialManifestationChanceLuckRpcArgs {
  const args: PreviewTrialManifestationChanceLuckRpcArgs = {};

  addOptionalText(args, 'p_difficulty_key', input.difficultyKey);
  addOptionalText(args, 'p_district_code', input.districtCode);
  addOptionalText(args, 'p_trial_definition_id', input.trialDefinitionId);
  addOptionalNonNegativeInteger(args, 'p_tested_stat_value', input.testedStatValue);
  addOptionalNonNegativeInteger(args, 'p_spirituality_value', input.spiritualityValue);
  addOptionalNonNegativeInteger(args, 'p_luck_value', input.luckValue);

  return args;
}

export function toChallengeAutoResolveArgs(
  input: LuckLabInputState,
): PreviewChallengeAutoResolveSuccessChanceLuckRpcArgs {
  const args: PreviewChallengeAutoResolveSuccessChanceLuckRpcArgs = {};

  addOptionalText(args, 'p_difficulty_key', input.difficultyKey);
  addOptionalText(args, 'p_tested_stat_key', input.testedStatKey);
  addOptionalNonNegativeInteger(args, 'p_tested_stat_value', input.testedStatValue);
  addOptionalNonNegativeInteger(args, 'p_spirituality_value', input.spiritualityValue);
  addOptionalNonNegativeInteger(args, 'p_luck_value', input.luckValue);

  return args;
}

export function toNonTrialEncounterArgs(
  input: LuckLabInputState,
): PreviewNonTrialEncounterChanceLuckRpcArgs {
  const args: PreviewNonTrialEncounterChanceLuckRpcArgs = {};

  addOptionalText(args, 'p_difficulty_key', input.difficultyKey);
  addOptionalText(args, 'p_district_code', input.districtCode);
  addOptionalNonNegativeInteger(args, 'p_spirituality_value', input.spiritualityValue);
  addOptionalNonNegativeInteger(args, 'p_luck_value', input.luckValue);

  return args;
}

export function toExplorationRngChainArgs(
  input: LuckLabInputState,
): PreviewExplorationLuckRngChainRpcArgs {
  const args: PreviewExplorationLuckRngChainRpcArgs = {};

  addOptionalText(args, 'p_difficulty_key', input.difficultyKey);
  addOptionalText(args, 'p_district_code', input.districtCode);
  addOptionalNonNegativeInteger(args, 'p_dry_step_count', input.dryStepCount);
  addOptionalNonNegativeInteger(args, 'p_tested_stat_value', input.testedStatValue);
  addOptionalNonNegativeInteger(args, 'p_spirituality_value', input.spiritualityValue);
  addOptionalNonNegativeInteger(args, 'p_luck_value', input.luckValue);

  return args;
}

export function toCombatArgs(input: LuckLabInputState): PreviewCombatLuckFormulaContextRpcArgs {
  const args: PreviewCombatLuckFormulaContextRpcArgs = {};

  addOptionalNonNegativeInteger(args, 'p_attacker_luck', input.luckValue);

  return args;
}

export function toRewardProfileArgs(input: LuckLabInputState): PreviewRewardProfileLuckRpcArgs {
  const args: PreviewRewardProfileLuckRpcArgs = {};

  addOptionalText(args, 'p_reward_profile_id', input.rewardProfileId);
  addOptionalPositiveInteger(args, 'p_preview_count', input.previewCount);
  addOptionalNonNegativeInteger(args, 'p_spirituality_value', input.spiritualityValue);
  addOptionalNonNegativeInteger(args, 'p_luck_value', input.luckValue);

  return args;
}

export function toGeneratedItemArgs(
  input: LuckLabInputState,
): PreviewRewardGeneratedItemLuckRpcArgs {
  const args: PreviewRewardGeneratedItemLuckRpcArgs = {};

  addOptionalText(args, 'p_bucket_profile_id', input.bucketProfileId);
  addOptionalText(args, 'p_max_quality_key', input.maxQualityKey);
  addOptionalPositiveInteger(args, 'p_preview_count', input.previewCount);
  addOptionalNonNegativeInteger(args, 'p_luck_value', input.luckValue);

  return args;
}

function addOptionalText<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  key: K,
  value: string | null,
): void {
  const normalized = trimToNull(value);

  if (normalized) {
    target[key] = normalized as T[K];
  }
}

function addOptionalNonNegativeInteger<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  key: K,
  value: number | null,
): void {
  const normalized = optionalNonNegativeInteger(value);

  if (normalized !== null) {
    target[key] = normalized as T[K];
  }
}

function addOptionalPositiveInteger<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  key: K,
  value: number | null,
): void {
  const normalized = optionalPositiveInteger(value);

  if (normalized !== null) {
    target[key] = normalized as T[K];
  }
}
