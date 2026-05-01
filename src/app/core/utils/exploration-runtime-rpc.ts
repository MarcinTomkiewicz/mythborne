import {
  GetHeroExplorationStateRpcArgs,
  PreviewTrialOpportunityCurveRpcArgs,
  ResolveHeroExplorationStepRpcArgs,
  ResolveHeroExplorationStepRpcRow,
  StartHeroExplorationStepRpcArgs,
  StartHeroExplorationStepRpcRow,
  StartOrGetHeroExplorationRpcArgs,
  StartOrGetHeroExplorationRpcRow,
} from '../types/exploration-runtime-rpc.types';
import { trimText } from './normalize-text';

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
