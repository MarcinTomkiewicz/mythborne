import { Database } from './database.types';

type Rpc<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T];

export type PreviewTrialOpportunityCurveRpcArgs =
  Rpc<'preview_trial_opportunity_curve'>['Args'];
export type PreviewTrialOpportunityCurveRpcRow =
  Rpc<'preview_trial_opportunity_curve'>['Returns'][number];

export type PreviewTrialManifestationChanceRpcArgs =
  Rpc<'preview_trial_manifestation_chance'>['Args'];
export type PreviewTrialManifestationChanceRpcRow =
  Rpc<'preview_trial_manifestation_chance'>['Returns'][number];

export type PreviewChallengeAutoResolveSuccessChanceRpcArgs =
  Rpc<'preview_challenge_auto_resolve_success_chance'>['Args'];
export type PreviewChallengeAutoResolveSuccessChanceRpcRow =
  Rpc<'preview_challenge_auto_resolve_success_chance'>['Returns'][number];

export type PreviewRewardGeneratedItemRpcArgs =
  Rpc<'preview_reward_generated_item'>['Args'];
export type PreviewRewardGeneratedItemRpcRow =
  Rpc<'preview_reward_generated_item'>['Returns'][number];

export type PreviewRewardProfileRpcArgs = Rpc<'preview_reward_profile'>['Args'];
export type PreviewRewardProfileRpcRow =
  Rpc<'preview_reward_profile'>['Returns'][number];

export type SimulateTrialOpportunityRunsRpcArgs =
  Rpc<'simulate_trial_opportunity_runs'>['Args'];
export type SimulateTrialOpportunityRunsRpcRow =
  Rpc<'simulate_trial_opportunity_runs'>['Returns'][number];
