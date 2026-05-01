import { Database } from './database.types';

type Rpc<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T];

export type AddHeroRemainingActionsRpcArgs =
  Rpc<'add_hero_remaining_actions'>['Args'];
export type AddHeroRemainingActionsRpcRow =
  Rpc<'add_hero_remaining_actions'>['Returns'][number];

export type ForceCompleteHeroExplorationChallengeAttemptRpcArgs =
  Rpc<'force_complete_hero_exploration_challenge_attempt'>['Args'];
export type ForceCompleteHeroExplorationChallengeAttemptRpcRow =
  Rpc<'force_complete_hero_exploration_challenge_attempt'>['Returns'][number];

export type GetHeroExplorationDebugStateRpcArgs =
  Rpc<'get_hero_exploration_debug_state'>['Args'];
export type GetHeroExplorationDebugStateRpcResult =
  Rpc<'get_hero_exploration_debug_state'>['Returns'];

export type ResetHeroExplorationRpcArgs =
  Rpc<'reset_hero_exploration'>['Args'];
export type ResetHeroExplorationRpcResult =
  Rpc<'reset_hero_exploration'>['Returns'];

export type SetNextHeroExplorationOutcomeOverrideRpcArgs =
  Rpc<'set_next_hero_exploration_outcome_override'>['Args'];
export type SetNextHeroExplorationOutcomeOverrideRpcRow =
  Rpc<'set_next_hero_exploration_outcome_override'>['Returns'][number];

export type SkipHeroExplorationStepTimerRpcArgs =
  Rpc<'skip_hero_exploration_step_timer'>['Args'];
export type SkipHeroExplorationStepTimerRpcRow =
  Rpc<'skip_hero_exploration_step_timer'>['Returns'][number];

export type TestGrantRewardProfileToHeroRpcArgs =
  Rpc<'test_grant_reward_profile_to_hero'>['Args'];
export type TestGrantRewardProfileToHeroRpcRow =
  Rpc<'test_grant_reward_profile_to_hero'>['Returns'][number];
