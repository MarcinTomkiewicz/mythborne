import { Database } from './database.types';

type Rpc<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T];

export type GetLuckLabPreviewContractsRpcRow =
  Rpc<'get_luck_lab_preview_contracts'>['Returns'][number];

export type GetHeroLuckBreakdownRpcRow =
  Rpc<'get_hero_luck_breakdown'>['Returns'][number];

export type CalculateTrialPowerRpcRow =
  Rpc<'calculate_trial_power'>['Returns'][number];

export type GetHeroTrialPowerRpcArgs =
  Rpc<'get_hero_trial_power'>['Args'];

export type GetHeroTrialPowerRpcRow =
  Rpc<'get_hero_trial_power'>['Returns'][number];

export type PreviewLuckInfluenceAndTrialPowerRpcArgs =
  Rpc<'preview_luck_influence_and_trial_power'>['Args'];

export type PreviewLuckInfluenceAndTrialPowerRpcRow =
  Rpc<'preview_luck_influence_and_trial_power'>['Returns'][number];

export type PreviewTrialOpportunityCurveLuckRpcRow =
  Rpc<'preview_trial_opportunity_curve'>['Returns'][number];
export type PreviewTrialOpportunityCurveLuckRpcArgs =
  Rpc<'preview_trial_opportunity_curve'>['Args'];

export type PreviewTrialManifestationChanceLuckRpcRow =
  Rpc<'preview_trial_manifestation_chance'>['Returns'][number];
export type PreviewTrialManifestationChanceLuckRpcArgs =
  Rpc<'preview_trial_manifestation_chance'>['Args'];

export type PreviewChallengeAutoResolveSuccessChanceLuckRpcRow =
  Rpc<'preview_challenge_auto_resolve_success_chance'>['Returns'][number];
export type PreviewChallengeAutoResolveSuccessChanceLuckRpcArgs =
  Rpc<'preview_challenge_auto_resolve_success_chance'>['Args'];

export type PreviewNonTrialEncounterChanceLuckRpcRow =
  Rpc<'preview_non_trial_encounter_chance'>['Returns'][number];
export type PreviewNonTrialEncounterChanceLuckRpcArgs =
  Rpc<'preview_non_trial_encounter_chance'>['Args'];

export type PreviewExplorationLuckRngChainRpcRow =
  Rpc<'preview_exploration_luck_rng_chain'>['Returns'][number];
export type PreviewExplorationLuckRngChainRpcArgs =
  Rpc<'preview_exploration_luck_rng_chain'>['Args'];

export type PreviewRewardProfileLuckRpcRow =
  Rpc<'preview_reward_profile_luck'>['Returns'][number];
export type PreviewRewardProfileLuckRpcArgs =
  Rpc<'preview_reward_profile_luck'>['Args'];

export type PreviewRewardGeneratedItemLuckRpcRow =
  Rpc<'preview_reward_generated_item_luck'>['Returns'][number];
export type PreviewRewardGeneratedItemLuckRpcArgs =
  Rpc<'preview_reward_generated_item_luck'>['Args'];

export type PreviewRewardGeneratedItemDistributionLuckRpcRow =
  Rpc<'preview_reward_generated_item_distribution_luck'>['Returns'][number];
export type PreviewRewardGeneratedItemDistributionLuckRpcArgs =
  Rpc<'preview_reward_generated_item_distribution_luck'>['Args'];

export type PreviewCombatLuckFormulaContextRpcRow =
  Rpc<'preview_combat_luck_formula_context'>['Returns'][number];
export type PreviewCombatLuckFormulaContextRpcArgs =
  Rpc<'preview_combat_luck_formula_context'>['Args'];
