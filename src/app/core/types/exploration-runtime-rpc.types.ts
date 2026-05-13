import { Database } from './database.types';

type Rpc<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T];

export type GetHeroExplorationStateRpcArgs =
  Rpc<'get_hero_exploration_state'>['Args'];
export type GetHeroExplorationStateRpcResult =
  Rpc<'get_hero_exploration_state'>['Returns'];
export type GetHeroPendingCombatEffectStateRpcArgs =
  Rpc<'get_hero_pending_combat_effect_state'>['Args'];
export type GetHeroPendingCombatEffectStateRpcRow =
  Rpc<'get_hero_pending_combat_effect_state'>['Returns'][number];

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

export type GetExplorationStepSelectionDiagnosticRpcArgs =
  Rpc<'get_exploration_step_selection_diagnostic'>['Args'];
export type GetExplorationStepSelectionDiagnosticRpcRow =
  Rpc<'get_exploration_step_selection_diagnostic'>['Returns'][number];

export type GetExplorationRewardExecutionDiagnosticRpcArgs =
  Rpc<'get_exploration_reward_execution_diagnostic'>['Args'];
export type GetExplorationRewardExecutionDiagnosticRpcRow =
  Rpc<'get_exploration_reward_execution_diagnostic'>['Returns'][number];

export type GetExplorationChallengeRewardReadModelRpcArgs =
  Rpc<'get_exploration_challenge_reward_read_model'>['Args'];
export type GetExplorationChallengeRewardReadModelRpcRow =
  Rpc<'get_exploration_challenge_reward_read_model'>['Returns'][number];
export type GetExplorationStepRewardReadModelRpcArgs =
  Rpc<'get_exploration_step_reward_read_model'>['Args'];
export type GetExplorationStepRewardReadModelRpcRow =
  Rpc<'get_exploration_step_reward_read_model'>['Returns'][number];

export type GetExplorationStepDurationSecondsRpcArgs =
  Rpc<'get_exploration_step_duration_seconds'>['Args'];
export type GetExplorationStepDurationSecondsRpcResult =
  Rpc<'get_exploration_step_duration_seconds'>['Returns'];

export type GetTrialDefinitionReadinessRpcArgs =
  Rpc<'get_trial_definition_readiness'>['Args'];
export type GetTrialDefinitionReadinessRpcRow =
  Rpc<'get_trial_definition_readiness'>['Returns'][number];

export type GetEncounterDefinitionReadinessRpcArgs =
  Rpc<'get_encounter_definition_readiness'>['Args'];
export type GetEncounterDefinitionReadinessRpcRow =
  Rpc<'get_encounter_definition_readiness'>['Returns'][number];

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
