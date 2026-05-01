import {
  AddHeroRemainingActionsInput,
  AddHeroRemainingActionsResult,
  ExplorationDebugScopeInput,
  ForceCompleteHeroExplorationChallengeAttemptInput,
  ForceCompleteHeroExplorationChallengeAttemptResult,
  ResetHeroExplorationInput,
  ResetHeroExplorationResult,
  SetNextHeroExplorationOutcomeOverrideInput,
  SetNextHeroExplorationOutcomeOverrideResult,
  SkipHeroExplorationStepTimerInput,
  SkipHeroExplorationStepTimerResult,
  TestGrantRewardProfileToHeroInput,
  TestGrantRewardProfileToHeroResult,
} from '../domain/exploration/exploration-debug.model';
import { Json } from '../types/database.types';
import {
  AddHeroRemainingActionsRpcArgs,
  AddHeroRemainingActionsRpcRow,
  ForceCompleteHeroExplorationChallengeAttemptRpcArgs,
  ForceCompleteHeroExplorationChallengeAttemptRpcRow,
  GetHeroExplorationDebugStateRpcArgs,
  ResetHeroExplorationRpcArgs,
  SetNextHeroExplorationOutcomeOverrideRpcArgs,
  SetNextHeroExplorationOutcomeOverrideRpcRow,
  SkipHeroExplorationStepTimerRpcArgs,
  SkipHeroExplorationStepTimerRpcRow,
  TestGrantRewardProfileToHeroRpcArgs,
  TestGrantRewardProfileToHeroRpcRow,
} from '../types/exploration-debug-rpc.types';
import {
  mapCompleteHeroExplorationChallengeResult,
  mapResolveHeroExplorationStepResult,
} from './exploration-runtime-rpc';
import { trimText, trimToNull } from './normalize-text';

export function toGetHeroExplorationDebugStateRpcArgs(
  input: ExplorationDebugScopeInput,
): GetHeroExplorationDebugStateRpcArgs {
  const args: GetHeroExplorationDebugStateRpcArgs = {
    p_server_id: requiredText(input.serverId, 'serverId'),
    p_hero_id: requiredText(input.heroId, 'heroId'),
  };

  addOptionalText(args, 'p_exploration_date', input.explorationDate);

  return args;
}

export function toAddHeroRemainingActionsRpcArgs(
  input: AddHeroRemainingActionsInput,
): AddHeroRemainingActionsRpcArgs {
  const args: AddHeroRemainingActionsRpcArgs = {
    p_server_id: requiredText(input.serverId, 'serverId'),
    p_hero_id: requiredText(input.heroId, 'heroId'),
    p_action_kind: requiredText(input.actionKind, 'actionKind'),
    p_amount: requiredPositiveInteger(input.amount, 'amount'),
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_action_date', input.actionDate);

  return args;
}

export function toResetHeroExplorationRpcArgs(
  input: ResetHeroExplorationInput,
): ResetHeroExplorationRpcArgs {
  const args: ResetHeroExplorationRpcArgs = {
    p_server_id: requiredText(input.serverId, 'serverId'),
    p_hero_id: requiredText(input.heroId, 'heroId'),
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_difficulty_key', input.difficultyKey);
  addOptionalText(args, 'p_exploration_date', input.explorationDate);

  return args;
}

export function toSkipHeroExplorationStepTimerRpcArgs(
  input: SkipHeroExplorationStepTimerInput,
): SkipHeroExplorationStepTimerRpcArgs {
  return {
    p_server_id: requiredText(input.serverId, 'serverId'),
    p_step_id: requiredText(input.stepId, 'stepId'),
    p_reason: requiredText(input.reason, 'reason'),
  };
}

export function toTestGrantRewardProfileToHeroRpcArgs(
  input: TestGrantRewardProfileToHeroInput,
): TestGrantRewardProfileToHeroRpcArgs {
  return {
    p_server_id: requiredText(input.serverId, 'serverId'),
    p_hero_id: requiredText(input.heroId, 'heroId'),
    p_reward_profile_id: requiredText(input.rewardProfileId, 'rewardProfileId'),
    p_reason: requiredText(input.reason, 'reason'),
  };
}

export function toSetNextHeroExplorationOutcomeOverrideRpcArgs(
  input: SetNextHeroExplorationOutcomeOverrideInput,
): SetNextHeroExplorationOutcomeOverrideRpcArgs {
  const args: SetNextHeroExplorationOutcomeOverrideRpcArgs = {
    p_server_id: requiredText(input.serverId, 'serverId'),
    p_hero_id: requiredText(input.heroId, 'heroId'),
    p_difficulty_key: requiredText(input.difficultyKey, 'difficultyKey'),
    p_forced_outcome_kind: requiredText(input.forcedOutcomeKind, 'forcedOutcomeKind'),
    p_reason: requiredText(input.reason, 'reason'),
  };
  const expiresInMinutes = optionalPositiveInteger(input.expiresInMinutes);

  addOptionalText(args, 'p_trial_definition_id', input.trialDefinitionId);
  addOptionalText(args, 'p_encounter_definition_id', input.encounterDefinitionId);
  addOptionalText(
    args,
    'p_force_manifestation_status',
    input.forceManifestationStatus,
  );

  if (expiresInMinutes !== null) {
    args.p_expires_in_minutes = expiresInMinutes;
  }

  return args;
}

export function toForceCompleteHeroExplorationChallengeAttemptRpcArgs(
  input: ForceCompleteHeroExplorationChallengeAttemptInput,
): ForceCompleteHeroExplorationChallengeAttemptRpcArgs {
  return {
    p_server_id: requiredText(input.serverId, 'serverId'),
    p_challenge_attempt_id: requiredText(
      input.challengeAttemptId,
      'challengeAttemptId',
    ),
    p_success: input.success,
    p_reason: requiredText(input.reason, 'reason'),
  };
}

export function firstAddHeroRemainingActionsRow(
  rows: readonly AddHeroRemainingActionsRpcRow[],
): AddHeroRemainingActionsRpcRow {
  return firstRow(rows, 'add_hero_remaining_actions');
}

export function firstSkipHeroExplorationStepTimerRow(
  rows: readonly SkipHeroExplorationStepTimerRpcRow[],
): SkipHeroExplorationStepTimerRpcRow {
  return firstRow(rows, 'skip_hero_exploration_step_timer');
}

export function firstTestGrantRewardProfileToHeroRow(
  rows: readonly TestGrantRewardProfileToHeroRpcRow[],
): TestGrantRewardProfileToHeroRpcRow {
  return firstRow(rows, 'test_grant_reward_profile_to_hero');
}

export function firstSetNextHeroExplorationOutcomeOverrideRow(
  rows: readonly SetNextHeroExplorationOutcomeOverrideRpcRow[],
): SetNextHeroExplorationOutcomeOverrideRpcRow {
  return firstRow(rows, 'set_next_hero_exploration_outcome_override');
}

export function firstForceCompleteHeroExplorationChallengeAttemptRow(
  rows: readonly ForceCompleteHeroExplorationChallengeAttemptRpcRow[],
): ForceCompleteHeroExplorationChallengeAttemptRpcRow {
  return firstRow(rows, 'force_complete_hero_exploration_challenge_attempt');
}

export function mapAddHeroRemainingActionsResult(
  row: AddHeroRemainingActionsRpcRow,
): AddHeroRemainingActionsResult {
  return {
    serverId: row.server_id,
    heroId: row.hero_id,
    actionKind: row.action_kind,
    actionDate: row.action_date,
    remainingCount: row.remaining_count,
    counterId: row.counter_id,
  };
}

export function mapResetHeroExplorationResult(
  resetCount: number,
): ResetHeroExplorationResult {
  return { resetCount };
}

export function mapSkipHeroExplorationStepTimerResult(
  row: SkipHeroExplorationStepTimerRpcRow,
): SkipHeroExplorationStepTimerResult {
  return mapResolveHeroExplorationStepResult(row);
}

export function mapTestGrantRewardProfileToHeroResult(
  row: TestGrantRewardProfileToHeroRpcRow,
): TestGrantRewardProfileToHeroResult {
  return {
    rewardGrantId: row.reward_grant_id,
    rewardProfileId: row.reward_profile_id,
    recipientHeroId: row.recipient_hero_id,
    status: row.status,
    entriesJson: row.entries_json as Json,
  };
}

export function mapSetNextHeroExplorationOutcomeOverrideResult(
  row: SetNextHeroExplorationOutcomeOverrideRpcRow,
): SetNextHeroExplorationOutcomeOverrideResult {
  return {
    overrideId: row.override_id,
    serverId: row.server_id,
    heroId: row.hero_id,
    difficultyKey: row.difficulty_key,
    forcedOutcomeKind: row.forced_outcome_kind,
    trialDefinitionId: row.trial_definition_id,
    encounterDefinitionId: row.encounter_definition_id,
    forceManifestationStatus: row.force_manifestation_status,
    expiresAt: row.expires_at,
  };
}

export function mapForceCompleteHeroExplorationChallengeAttemptResult(
  row: ForceCompleteHeroExplorationChallengeAttemptRpcRow,
): ForceCompleteHeroExplorationChallengeAttemptResult {
  return mapCompleteHeroExplorationChallengeResult(row);
}

function firstRow<T>(rows: readonly T[], rpcName: string): T {
  const row = rows[0];

  if (!row) {
    throw new Error(`${rpcName} returned no result row.`);
  }

  return row;
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for exploration debug workflow.`);
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

function requiredPositiveInteger(value: number | null | undefined, field: string): number {
  const normalized = optionalPositiveInteger(value);

  if (normalized === null) {
    throw new Error(`${field} must be a positive integer for exploration debug workflow.`);
  }

  return normalized;
}

function optionalPositiveInteger(value: number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = Math.floor(Number(value));

  return Number.isFinite(normalized) && normalized > 0 ? normalized : null;
}
