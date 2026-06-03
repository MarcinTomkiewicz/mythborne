import {
  HeroExplorationChallengeCompletionReadModel,
  HeroExplorationChallengeCompletionWorkflowResult,
  HeroExplorationStepResolutionReadModel,
  HeroExplorationStepResolutionWorkflowResult,
} from '../domain/exploration/exploration-runtime.model';
import {
  AutoResolveHeroExplorationChallengeAttemptRpcArgs,
  AutoResolveHeroExplorationChallengeAttemptRpcRow,
  AutoResolveCombatSessionRpcArgs,
  AutoResolveCombatSessionRpcRow,
  CompleteHeroExplorationChallengeAttemptRpcArgs,
  CompleteHeroExplorationChallengeAttemptRpcRow,
  GetHeroExplorationDifficultyCardPreviewsRpcArgs,
  GetHeroExplorationStateRpcArgs,
  PreviewTrialOpportunityCurveRpcArgs,
  ResolveHeroExplorationStepRpcArgs,
  ResolveHeroExplorationStepRpcRow,
  StartHeroExplorationStepRpcArgs,
  StartHeroExplorationStepRpcRow,
  StartOrGetHeroExplorationAndStartInitialStepRpcArgs,
  StartOrGetHeroExplorationRpcArgs,
  StartOrGetHeroExplorationRpcRow,
} from '../types/exploration-runtime-rpc.types';
import { Json } from '../types/database.types';
import { jsonRecord, read } from './json-read';
import { mapExplorationStepSelectionDiagnosticJson } from './exploration-readiness-mappers';
import { trimText, trimToNull } from './normalize-text';

type StartHeroExplorationStepRpcArgsWithNullableEdge =
  Omit<StartHeroExplorationStepRpcArgs, 'p_edge_id'> & {
    p_edge_id?: string | null;
  };

export function toGetHeroExplorationStateRpcArgs(input: {
  heroId: string | null | undefined;
  difficultyKey: string | null | undefined;
}): GetHeroExplorationStateRpcArgs {
  return {
    p_hero_id: requiredText(input.heroId, 'heroId'),
    p_difficulty_key: requiredText(input.difficultyKey, 'difficultyKey'),
  };
}

export function toGetHeroExplorationDifficultyCardPreviewsRpcArgs(input: {
  heroId: string | null | undefined;
  stepsToPreview?: number | null;
}): GetHeroExplorationDifficultyCardPreviewsRpcArgs {
  const args: GetHeroExplorationDifficultyCardPreviewsRpcArgs = {
    p_hero_id: requiredText(input.heroId, 'heroId'),
  };
  const stepsToPreview = optionalPositiveInteger(input.stepsToPreview);

  if (stepsToPreview !== null) {
    args.p_steps_to_preview = stepsToPreview;
  }

  return args;
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

export function toStartOrGetHeroExplorationAndStartInitialStepRpcArgs(input: {
  heroId: string | null | undefined;
  difficultyKey: string | null | undefined;
  requestId: string | null | undefined;
}): StartOrGetHeroExplorationAndStartInitialStepRpcArgs {
  return {
    p_hero_id: requiredText(input.heroId, 'heroId'),
    p_difficulty_key: requiredText(input.difficultyKey, 'difficultyKey'),
    p_request_id: requiredText(input.requestId, 'requestId'),
  };
}

export function toStartHeroExplorationStepRpcArgs(input: {
  explorationId: string | null | undefined;
  edgeId: string | null | undefined;
  stepKind: string | null | undefined;
}): StartHeroExplorationStepRpcArgsWithNullableEdge {
  const args: StartHeroExplorationStepRpcArgsWithNullableEdge = {
    p_exploration_id: requiredText(input.explorationId, 'explorationId'),
    p_step_kind: requiredText(input.stepKind, 'stepKind'),
  };
  const edgeId = trimToNull(input.edgeId);

  if (input.edgeId === null) {
    args.p_edge_id = null;
  } else if (edgeId) {
    args.p_edge_id = edgeId;
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

export function toAutoResolveCombatSessionRpcArgs(input: {
  sourceEntityType: string | null | undefined;
  sourceEntityId: string | null | undefined;
  requestId: string | null | undefined;
}): AutoResolveCombatSessionRpcArgs {
  return {
    p_source_entity_type: requiredText(input.sourceEntityType, 'sourceEntityType'),
    p_source_entity_id: requiredText(input.sourceEntityId, 'sourceEntityId'),
    p_request_id: requiredText(input.requestId, 'requestId'),
  };
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

export function firstAutoResolveCombatSessionRow(
  rows: readonly AutoResolveCombatSessionRpcRow[],
): AutoResolveCombatSessionRpcRow {
  const row = rows[0];

  if (!row) {
    throw new Error(
      'auto_resolve_combat_session returned no result row.',
    );
  }

  return row;
}

export function mapResolveHeroExplorationStepResult(
  row: ResolveHeroExplorationStepRpcRow,
): HeroExplorationStepResolutionReadModel {
  const metadataJson = row.metadata_json as Json;
  const selectionDiagnostic = mapExplorationStepSelectionDiagnosticJson(
    readSelectionDiagnosticJson(metadataJson),
  );

  return {
    stepId: row.step_id,
    explorationId: row.exploration_id,
    status: row.status,
    outcomeKind: canonicalStepOutcomeKind(row.outcome_kind),
    rawOutcomeKind: row.outcome_kind,
    currentNodeId: trimToNull(row.current_node_id),
    toNodeId: trimToNull(row.to_node_id),
    trialDefinitionId: trimToNull(row.trial_definition_id),
    encounterDefinitionId: trimToNull(row.encounter_definition_id),
    challengeAttemptId: trimToNull(row.challenge_attempt_id),
    remainingTrials: row.remaining_trials,
    trialDryStepCount: row.trial_dry_step_count,
    selectedDefinition: selectionDiagnostic?.selectedDefinition ?? null,
    selectionDiagnostic,
    metadataJson,
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

export function mapAutoResolveCombatSessionChallengeResult(
  row: AutoResolveCombatSessionRpcRow,
): HeroExplorationChallengeCompletionReadModel {
  return {
    challengeAttemptId: row.source_entity_id,
    status: row.status,
    success: row.success,
    completionMode: row.completion_mode,
    rewardGrantId: row.reward_grant_id,
    remainingTrials: row.remaining_trials,
    explorationStatus: row.exploration_status,
    autoResolveChance: null,
    autoResolveRoll: null,
    combatResultId: row.combat_result_id,
    combatSessionId: row.combat_session_id,
    combatOutcome: row.outcome,
    gameReportId: row.game_report_id,
    participantsCreated: row.participants_created,
    participantStatsCreated: row.participant_stats_created,
    attacksCreated: row.attacks_created,
    finalEventCount: row.final_event_count,
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

function canonicalStepOutcomeKind(value: string): HeroExplorationStepResolutionReadModel['outcomeKind'] {
  return value === 'trial' || value === 'encounter' ? value : 'nothing';
}

function readSelectionDiagnosticJson(value: Json): Json {
  const metadata = jsonRecord(value);

  return read(
    metadata,
    'selectionDiagnostic',
    'selection_diagnostic',
    'stepSelectionDiagnostic',
    'step_selection_diagnostic',
    'selectionDebug',
    'selection_debug',
  ) ?? null;
}
