import {
  AutoResolveCombatSessionRpcRow,
  AutoResolveHeroExplorationChallengeAttemptRpcRow,
  CompleteHeroExplorationChallengeAttemptRpcRow,
  ResolveHeroExplorationStepRpcRow,
  StartHeroExplorationStepRpcRow,
  StartOrGetHeroExplorationRpcRow,
} from '../types/exploration-runtime-rpc.types';

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
