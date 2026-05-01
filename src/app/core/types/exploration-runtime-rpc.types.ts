import { Database } from './database.types';

type Rpc<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T];

export type GetHeroExplorationStateRpcArgs =
  Rpc<'get_hero_exploration_state'>['Args'];
export type GetHeroExplorationStateRpcResult =
  Rpc<'get_hero_exploration_state'>['Returns'];

export type StartOrGetHeroExplorationRpcArgs =
  Rpc<'start_or_get_hero_exploration'>['Args'];
export type StartOrGetHeroExplorationRpcRow =
  Rpc<'start_or_get_hero_exploration'>['Returns'][number];

export type StartHeroExplorationStepRpcArgs =
  Rpc<'start_hero_exploration_step'>['Args'];
export type StartHeroExplorationStepRpcRow =
  Rpc<'start_hero_exploration_step'>['Returns'][number];

export type ResolveHeroExplorationStepRpcArgs =
  Rpc<'resolve_hero_exploration_step'>['Args'];
export type ResolveHeroExplorationStepRpcRow =
  Rpc<'resolve_hero_exploration_step'>['Returns'][number];

export type CompleteHeroExplorationChallengeAttemptRpcArgs =
  Rpc<'complete_hero_exploration_challenge_attempt'>['Args'];
export type CompleteHeroExplorationChallengeAttemptRpcRow =
  Rpc<'complete_hero_exploration_challenge_attempt'>['Returns'][number];

export type AutoResolveHeroExplorationChallengeAttemptRpcArgs =
  Rpc<'auto_resolve_hero_exploration_challenge_attempt'>['Args'];
export type AutoResolveHeroExplorationChallengeAttemptRpcRow =
  Rpc<'auto_resolve_hero_exploration_challenge_attempt'>['Returns'][number];

export type PreviewTrialOpportunityCurveRpcArgs =
  Rpc<'preview_trial_opportunity_curve'>['Args'];
export type PreviewTrialOpportunityCurveRpcRow =
  Rpc<'preview_trial_opportunity_curve'>['Returns'][number];
