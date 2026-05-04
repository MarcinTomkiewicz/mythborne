export const BUILDING_CONFIGURATOR_SECTION_METADATA_NAMESPACE =
  'building_configurator_section';
export const BUILDING_CONFIGURATOR_FIELD_METADATA_NAMESPACE =
  'building_configurator_field';
export const ESTATE_RUNTIME_SECTION_METADATA_NAMESPACE = 'estate_runtime_section';
export const ESTATE_BUILDING_RUNTIME_SECTION_METADATA_NAMESPACE =
  'estate_building_runtime_section';

export const BUILDING_CONFIGURATOR_SECTION_METADATA_KEYS = [
  'page_header',
  'formula_assignments',
  'edited_building',
  'building_identity',
  'building_progression',
  'local_formulas',
  'resource_costs',
  'central_requirements',
  'building_bonuses',
  'preview',
  'diagnostics',
] as const;

export const BUILDING_CONFIGURATOR_FIELD_METADATA_KEYS = [
  'key',
  'name',
  'description',
  'image_path',
  'district_code',
  'sort_order',
  'starting_level',
  'base_build_time_seconds',
  'max_level',
  'resource_costs',
  'cost_resource_type',
  'cost_base_value',
  'cost_applies_from_level',
  'formula_assignments',
  'upgrade_cost_formula',
  'upgrade_time_formula',
  'bonus_growth_formula',
  'central_requirements',
  'building_bonuses',
  'bonus_template',
  'bonus_base_value',
  'bonus_target',
  'bonus_type',
  'bonus_description',
] as const;

export const ESTATE_RUNTIME_SECTION_METADATA_KEYS = [
  'page_header',
  'address_model',
  'relocation_reset',
  'resource_ledger',
  'diagnostics',
] as const;

export const ESTATE_BUILDING_RUNTIME_SECTION_METADATA_KEYS = [
  'baseline_initialization',
  'district_inheritance',
  'active_job_model',
  'lazy_finalization',
  'seconds_based_timers',
  'preview_vs_authoritative_rpc',
  'requirements',
  'bonuses',
] as const;
