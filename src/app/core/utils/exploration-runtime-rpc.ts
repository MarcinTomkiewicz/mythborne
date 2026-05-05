import {
  HeroExplorationChallengeCompletionReadModel,
  HeroExplorationChallengeCompletionWorkflowResult,
  HeroExplorationStepResolutionReadModel,
  HeroExplorationStepResolutionWorkflowResult,
} from '../domain/exploration/exploration-runtime.model';
import {
  AutoResolveHeroExplorationChallengeAttemptRpcArgs,
  AutoResolveHeroExplorationChallengeAttemptRpcRow,
  CompleteHeroExplorationChallengeAttemptRpcArgs,
  CompleteHeroExplorationChallengeAttemptRpcRow,
  GetHeroExplorationStateRpcArgs,
  PreviewTrialOpportunityCurveRpcArgs,
  ResolveHeroExplorationStepRpcArgs,
  ResolveHeroExplorationStepRpcRow,
  StartHeroExplorationStepRpcArgs,
  StartHeroExplorationStepRpcRow,
  StartOrGetHeroExplorationRpcArgs,
  StartOrGetHeroExplorationRpcRow,
  SubmitExplorationChallengeCombatResolutionRpcArgs,
  SubmitExplorationChallengeCombatResolutionRpcRow,
} from '../types/exploration-runtime-rpc.types';
import { Json } from '../types/database.types';
import { trimText, trimToNull } from './normalize-text';

export function toGetHeroExplorationStateRpcArgs(input: {
  heroId: string | null | undefined;
  difficultyKey: string | null | undefined;
}): GetHeroExplorationStateRpcArgs {
  return {
    p_hero_id: requiredText(input.heroId, 'heroId'),
    p_difficulty_key: requiredText(input.difficultyKey, 'difficultyKey'),
  };
}

export function toStartOrGetHeroExplorationRpcArgs(input: {
  heroId: string | null | undefined;
  difficultyKey: string | null | undefined;
}): StartOrGetHeroExplorationRpcArgs {
  return {
    p_hero_id: requiredText(input.heroId, 'heroId'),
    p_difficulty_key: requiredText(input.difficultyKey, 'difficultyKey'),
  };
}

export function toStartHeroExplorationStepRpcArgs(input: {
  explorationId: string | null | undefined;
  edgeId: string | null | undefined;
  stepKind?: string | null;
}): StartHeroExplorationStepRpcArgs {
  const args: StartHeroExplorationStepRpcArgs = {
    p_exploration_id: requiredText(input.explorationId, 'explorationId'),
    p_edge_id: requiredText(input.edgeId, 'edgeId'),
  };
  const stepKind = trimText(input.stepKind);

  if (stepKind) {
    args.p_step_kind = stepKind;
  }

  return args;
}

export function toResolveHeroExplorationStepRpcArgs(input: {
  stepId: string | null | undefined;
}): ResolveHeroExplorationStepRpcArgs {
  return {
    p_step_id: requiredText(input.stepId, 'stepId'),
  };
}

export function toCompleteHeroExplorationChallengeAttemptRpcArgs(input: {
  challengeAttemptId: string | null | undefined;
  success: boolean;
  completionMode?: string | null;
  score?: number | null;
  performanceRating?: string | null;
  detailsJson?: Json;
  requestId?: string | null;
}): CompleteHeroExplorationChallengeAttemptRpcArgs {
  const args: CompleteHeroExplorationChallengeAttemptRpcArgs = {
    p_challenge_attempt_id: requiredText(
      input.challengeAttemptId,
      'challengeAttemptId',
    ),
    p_completion_mode: trimText(input.completionMode) || 'manual',
    p_success: input.success,
  };
  const score = optionalFiniteNumber(input.score);
  const performanceRating = trimToNull(input.performanceRating);
  const requestId = trimToNull(input.requestId);

  if (score !== null) {
    args.p_score = score;
  }

  if (performanceRating) {
    args.p_performance_rating = performanceRating;
  }

  if (input.detailsJson !== undefined) {
    args.p_details_json = input.detailsJson;
  }

  if (requestId) {
    args.p_request_id = requestId;
  }

  return args;
}

export function toAutoResolveHeroExplorationChallengeAttemptRpcArgs(input: {
  challengeAttemptId: string | null | undefined;
  requestId?: string | null;
}): AutoResolveHeroExplorationChallengeAttemptRpcArgs {
  const args: AutoResolveHeroExplorationChallengeAttemptRpcArgs = {
    p_challenge_attempt_id: requiredText(
      input.challengeAttemptId,
      'challengeAttemptId',
    ),
  };
  const requestId = trimToNull(input.requestId);

  if (requestId) {
    args.p_request_id = requestId;
  }

  return args;
}

export function toSubmitExplorationChallengeCombatResolutionRpcArgs(input: {
  challengeAttemptId: string | null | undefined;
  timingHitsJson?: Json;
  requestId?: string | null;
}): SubmitExplorationChallengeCombatResolutionRpcArgs {
  const args: SubmitExplorationChallengeCombatResolutionRpcArgs = {
    p_challenge_attempt_id: requiredText(
      input.challengeAttemptId,
      'challengeAttemptId',
    ),
  };
  const requestId = trimToNull(input.requestId);

  if (input.timingHitsJson !== undefined) {
    args.p_timing_hits_json = input.timingHitsJson;
  }

  if (requestId) {
    args.p_request_id = requestId;
  }

  return args;
}

export function toPreviewTrialOpportunityCurveRpcArgs(input: {
  difficultyKey: string | null | undefined;
  startingDryStepCount?: number | null;
  stepsToPreview?: number | null;
}): PreviewTrialOpportunityCurveRpcArgs {
  const args: PreviewTrialOpportunityCurveRpcArgs = {
    p_difficulty_key: requiredText(input.difficultyKey, 'difficultyKey'),
  };
  const startingDryStepCount = optionalNonNegativeInteger(input.startingDryStepCount);
  const stepsToPreview = optionalPositiveInteger(input.stepsToPreview);

  if (startingDryStepCount !== null) {
    args.p_starting_dry_step_count = startingDryStepCount;
  }

  if (stepsToPreview !== null) {
    args.p_steps_to_preview = stepsToPreview;
  }

  return args;
}

export function firstStartOrGetHeroExplorationRow(
  rows: readonly StartOrGetHeroExplorationRpcRow[],
): StartOrGetHeroExplorationRpcRow {
  const row = rows[0];

  if (!row) {
    throw new Error('start_or_get_hero_exploration returned no exploration row.');
  }

  return row;
}

export function firstStartHeroExplorationStepRow(
  rows: readonly StartHeroExplorationStepRpcRow[],
): StartHeroExplorationStepRpcRow {
  const row = rows[0];

  if (!row) {
    throw new Error('start_hero_exploration_step returned no step row.');
  }

  return row;
}

export function firstResolveHeroExplorationStepRow(
  rows: readonly ResolveHeroExplorationStepRpcRow[],
): ResolveHeroExplorationStepRpcRow {
  const row = rows[0];

  if (!row) {
    throw new Error('resolve_hero_exploration_step returned no result row.');
  }

  return row;
}

export function firstCompleteHeroExplorationChallengeAttemptRow(
  rows: readonly CompleteHeroExplorationChallengeAttemptRpcRow[],
): CompleteHeroExplorationChallengeAttemptRpcRow {
  const row = rows[0];

  if (!row) {
    throw new Error(
      'complete_hero_exploration_challenge_attempt returned no result row.',
    );
  }

  return row;
}

export function firstAutoResolveHeroExplorationChallengeAttemptRow(
  rows: readonly AutoResolveHeroExplorationChallengeAttemptRpcRow[],
): AutoResolveHeroExplorationChallengeAttemptRpcRow {
  const row = rows[0];

  if (!row) {
    throw new Error(
      'auto_resolve_hero_exploration_challenge_attempt returned no result row.',
    );
  }

  return row;
}

export function firstSubmitExplorationChallengeCombatResolutionRow(
  rows: readonly SubmitExplorationChallengeCombatResolutionRpcRow[],
): SubmitExplorationChallengeCombatResolutionRpcRow {
  const row = rows[0];

  if (!row) {
    throw new Error('Wynik walki nie został zapisany.');
  }

  return row;
}

export function mapResolveHeroExplorationStepResult(
  row: ResolveHeroExplorationStepRpcRow,
): HeroExplorationStepResolutionReadModel {
  return {
    stepId: row.step_id,
    explorationId: row.exploration_id,
    status: row.status,
    outcomeKind: row.outcome_kind,
    currentNodeId: row.current_node_id,
    toNodeId: row.to_node_id,
    trialDefinitionId: row.trial_definition_id,
    encounterDefinitionId: row.encounter_definition_id,
    challengeAttemptId: row.challenge_attempt_id,
    remainingTrials: row.remaining_trials,
    trialDryStepCount: row.trial_dry_step_count,
    metadataJson: row.metadata_json as Json,
  };
}

export function mapCompleteHeroExplorationChallengeResult(
  row: CompleteHeroExplorationChallengeAttemptRpcRow,
): HeroExplorationChallengeCompletionReadModel {
  return {
    challengeAttemptId: row.challenge_attempt_id,
    status: row.status,
    success: row.success,
    completionMode: row.completion_mode,
    rewardGrantId: row.reward_grant_id,
    remainingTrials: row.remaining_trials,
    explorationStatus: row.exploration_status,
    autoResolveChance: null,
    autoResolveRoll: null,
  };
}

export function mapAutoResolveHeroExplorationChallengeResult(
  row: AutoResolveHeroExplorationChallengeAttemptRpcRow,
): HeroExplorationChallengeCompletionReadModel {
  return {
    challengeAttemptId: row.challenge_attempt_id,
    status: row.status,
    success: row.success,
    completionMode: row.completion_mode,
    rewardGrantId: row.reward_grant_id,
    remainingTrials: null,
    explorationStatus: null,
    autoResolveChance: row.auto_resolve_chance,
    autoResolveRoll: row.auto_resolve_roll,
  };
}

export function mapSubmitExplorationChallengeCombatResolutionResult(
  row: SubmitExplorationChallengeCombatResolutionRpcRow,
): HeroExplorationChallengeCompletionReadModel {
  return {
    challengeAttemptId: row.challenge_attempt_id,
    status: row.status,
    success: row.outcome === 'draw' ? false : row.success,
    completionMode: row.completion_mode,
    rewardGrantId: row.reward_grant_id,
    remainingTrials: row.remaining_trials,
    explorationStatus: row.exploration_status,
    autoResolveChance: null,
    autoResolveRoll: null,
    combatResultId: row.combat_result_id,
    combatOutcome: row.outcome,
    turnsCompleted: row.turns_completed,
    participantsCreated: row.participants_created,
    participantStatsCreated: row.participant_stats_created,
    attacksCreated: row.attacks_created,
  };
}

export function explorationStepResolutionWorkflowResult(
  result: HeroExplorationStepResolutionReadModel,
  state: HeroExplorationStepResolutionWorkflowResult['state'],
): HeroExplorationStepResolutionWorkflowResult {
  return { result, state };
}

export function explorationChallengeCompletionWorkflowResult(
  result: HeroExplorationChallengeCompletionReadModel,
  state: HeroExplorationChallengeCompletionWorkflowResult['state'],
): HeroExplorationChallengeCompletionWorkflowResult {
  return { result, state };
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for exploration runtime workflow.`);
  }

  return normalized;
}

function optionalNonNegativeInteger(value: number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = Math.floor(Number(value));

  return Number.isFinite(normalized) && normalized >= 0 ? normalized : null;
}

function optionalPositiveInteger(value: number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = Math.floor(Number(value));

  return Number.isFinite(normalized) && normalized > 0 ? normalized : null;
}

function optionalFiniteNumber(value: number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = Number(value);

  return Number.isFinite(normalized) ? normalized : null;
}
