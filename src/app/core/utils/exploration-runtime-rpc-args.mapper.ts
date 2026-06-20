import {
  AutoResolveCombatSessionRpcInput,
  AutoResolveHeroExplorationChallengeAttemptRpcInput,
  CompleteHeroExplorationChallengeAttemptRpcInput,
  GetHeroExplorationDifficultyCardPreviewsRpcInput,
  GetHeroExplorationStateRpcInput,
  PreviewTrialOpportunityCurveRpcInput,
  ResolveHeroExplorationStepRpcInput,
  StartHeroExplorationStepRpcArgsWithNullableEdge,
  StartHeroExplorationStepRpcInput,
  StartOrGetHeroExplorationAndStartInitialStepRpcInput,
  StartOrGetHeroExplorationRpcInput,
} from '../interfaces/exploration/exploration-runtime-rpc-input.interface';
import {
  AutoResolveCombatSessionRpcArgs,
  AutoResolveHeroExplorationChallengeAttemptRpcArgs,
  CompleteHeroExplorationChallengeAttemptRpcArgs,
  GetHeroExplorationDifficultyCardPreviewsRpcArgs,
  GetHeroExplorationStateRpcArgs,
  PreviewTrialOpportunityCurveRpcArgs,
  ResolveHeroExplorationStepRpcArgs,
  StartOrGetHeroExplorationAndStartInitialStepRpcArgs,
  StartOrGetHeroExplorationRpcArgs,
} from '../types/exploration-runtime-rpc.types';
import { trimText, trimToNull } from './normalize-text';

export function toGetHeroExplorationStateRpcArgs(
  input: GetHeroExplorationStateRpcInput,
): GetHeroExplorationStateRpcArgs {
  return {
    p_hero_id: requiredText(input.heroId, 'heroId'),
    p_difficulty_key: requiredText(input.difficultyKey, 'difficultyKey'),
  };
}

export function toGetHeroExplorationDifficultyCardPreviewsRpcArgs(
  input: GetHeroExplorationDifficultyCardPreviewsRpcInput,
): GetHeroExplorationDifficultyCardPreviewsRpcArgs {
  const args: GetHeroExplorationDifficultyCardPreviewsRpcArgs = {
    p_hero_id: requiredText(input.heroId, 'heroId'),
  };
  const stepsToPreview = optionalPositiveInteger(input.stepsToPreview);

  if (stepsToPreview !== null) {
    args.p_steps_to_preview = stepsToPreview;
  }

  return args;
}

export function toStartOrGetHeroExplorationRpcArgs(
  input: StartOrGetHeroExplorationRpcInput,
): StartOrGetHeroExplorationRpcArgs {
  return {
    p_hero_id: requiredText(input.heroId, 'heroId'),
    p_difficulty_key: requiredText(input.difficultyKey, 'difficultyKey'),
  };
}

export function toStartOrGetHeroExplorationAndStartInitialStepRpcArgs(
  input: StartOrGetHeroExplorationAndStartInitialStepRpcInput,
): StartOrGetHeroExplorationAndStartInitialStepRpcArgs {
  return {
    p_hero_id: requiredText(input.heroId, 'heroId'),
    p_difficulty_key: requiredText(input.difficultyKey, 'difficultyKey'),
    p_request_id: requiredText(input.requestId, 'requestId'),
  };
}

export function toStartHeroExplorationStepRpcArgs(
  input: StartHeroExplorationStepRpcInput,
): StartHeroExplorationStepRpcArgsWithNullableEdge {
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

export function toResolveHeroExplorationStepRpcArgs(
  input: ResolveHeroExplorationStepRpcInput,
): ResolveHeroExplorationStepRpcArgs {
  return {
    p_step_id: requiredText(input.stepId, 'stepId'),
  };
}

export function toCompleteHeroExplorationChallengeAttemptRpcArgs(
  input: CompleteHeroExplorationChallengeAttemptRpcInput,
): CompleteHeroExplorationChallengeAttemptRpcArgs {
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

export function toAutoResolveHeroExplorationChallengeAttemptRpcArgs(
  input: AutoResolveHeroExplorationChallengeAttemptRpcInput,
): AutoResolveHeroExplorationChallengeAttemptRpcArgs {
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

export function toAutoResolveCombatSessionRpcArgs(
  input: AutoResolveCombatSessionRpcInput,
): AutoResolveCombatSessionRpcArgs {
  return {
    p_source_entity_type: requiredText(input.sourceEntityType, 'sourceEntityType'),
    p_source_entity_id: requiredText(input.sourceEntityId, 'sourceEntityId'),
    p_request_id: requiredText(input.requestId, 'requestId'),
  };
}

export function toPreviewTrialOpportunityCurveRpcArgs(
  input: PreviewTrialOpportunityCurveRpcInput,
): PreviewTrialOpportunityCurveRpcArgs {
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
