export const ENCOUNTER_CONFIGURATOR_SECTION_METADATA_NAMESPACE =
  'encounter_configurator_section';
export const ENCOUNTER_CONFIGURATOR_FIELD_METADATA_NAMESPACE =
  'encounter_configurator_field';

export const ENCOUNTER_CONFIGURATOR_SECTION_METADATA_KEYS = [
  'page_header',
  'encounter_meaning',
  'encounter_definition',
  'reward_assignments',
  'combat_candidates',
  'kind_specific_payloads',
  'resource_payloads',
  'effect_library',
  'effect_payloads',
] as const;

export const ENCOUNTER_CONFIGURATOR_FIELD_METADATA_KEYS = [
  'encounter_key',
  'encounter_kind',
  'minigame',
  'direct_reward_profile',
  'min_difficulty',
  'max_difficulty',
  'min_district',
  'max_district',
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
  'resource_type',
  'resource_amount_mode',
  'resource_formula',
  'resource_reason',
  'effect_key',
  'effect_kind',
  'bonus_template',
  'effect_duration',
  'effect_definition_reason',
  'effect_payload_definition',
  'effect_payload_reason',
] as const;
