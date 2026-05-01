import {
  GetHeroExplorationStateRpcArgs,
  PreviewTrialOpportunityCurveRpcArgs,
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
