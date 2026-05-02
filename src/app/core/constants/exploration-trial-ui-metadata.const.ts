export const TRIAL_CONFIGURATOR_SECTION_METADATA_NAMESPACE = 'trial_configurator_section';
export const TRIAL_CONFIGURATOR_FIELD_METADATA_NAMESPACE = 'trial_configurator_field';

export const TRIAL_CONFIGURATOR_SECTION_METADATA_KEYS = [
  'page_header',
  'trial_meaning',
  'trial_definition',
  'reward_assignments',
  'combat_candidates',
] as const;

export const TRIAL_CONFIGURATOR_FIELD_METADATA_KEYS = [
  'trial_key',
  'tested_stat',
  'minigame',
  'definition_reason',
  'reward_profile',
  'outcome_kind',
  'difficulty_match_kind',
  'district_match_kind',
  'assignment_helper_text',
  'assignment_reason',
  'candidate_kind',
  'scaling_formula',
  'difficulty_multiplier',
  'weight',
  'candidate_reason',
] as const;
