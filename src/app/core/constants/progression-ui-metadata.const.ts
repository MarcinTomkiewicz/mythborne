export const PROGRESSION_CONFIGURATOR_SECTION_METADATA_NAMESPACE =
  'progression_configurator_section';
export const PROGRESSION_DIAGNOSTICS_SECTION_METADATA_NAMESPACE =
  'progression_diagnostics_section';
export const LEVEL_UP_REWARD_SECTION_METADATA_NAMESPACE =
  'level_up_reward_section';
export const LEVEL_UP_STAT_BONUS_SECTION_METADATA_NAMESPACE =
  'level_up_stat_bonus_section';

export const PROGRESSION_CONFIGURATOR_SECTION_METADATA_KEYS = [
  'page_header',
  'xp_current_vs_lifetime',
  'xp_to_next_level_formula',
  'xp_to_character_points',
  'cp_penalty_sink',
  'append_only_ledgers',
  'no_direct_angular_mutations',
] as const;

export const PROGRESSION_DIAGNOSTICS_SECTION_METADATA_KEYS = [
  'formula_targets',
  'allowed_variables',
  'default_test_context',
] as const;

export const LEVEL_UP_REWARD_SECTION_METADATA_KEYS = [
  'level_up_reward_matching',
  'level_up_reward_profile_selection',
] as const;

export const LEVEL_UP_STAT_BONUS_SECTION_METADATA_KEYS = [
  'level_up_stat_bonus_rules',
  'fixed_stat_bonuses',
  'random_stat_pool_bonuses',
  'level_up_stat_bonus_grants',
] as const;
