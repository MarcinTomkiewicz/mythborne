export const REWARD_ENTRY_KIND = {
  experience: 'experience',
  characterPoints: 'character_points',
  resource: 'resource',
  itemGeneration: 'item_generation',
  explorationEffect: 'exploration_effect',
} as const;

export const REWARD_ENTRY_KIND_FALLBACKS = Object.values(REWARD_ENTRY_KIND);

export const REWARD_AMOUNT_MODE = {
  none: 'none',
  fixed: 'fixed',
  range: 'range',
  formula: 'formula',
  transferFormula: 'transfer_formula',
} as const;

export const REWARD_AMOUNT_MODE_PVE_FALLBACKS = [
  REWARD_AMOUNT_MODE.fixed,
  REWARD_AMOUNT_MODE.range,
  REWARD_AMOUNT_MODE.formula,
] as const;

export const REWARD_AMOUNT_MODE_NUMERIC_FALLBACKS = REWARD_AMOUNT_MODE_PVE_FALLBACKS;

export const REWARD_AMOUNT_MODE_NON_NUMERIC_FALLBACKS = [
  REWARD_AMOUNT_MODE.none,
] as const;

export const REWARD_SOURCE_KIND = {
  encounter: 'encounter',
  trial: 'trial',
  test: 'test',
} as const;

export const REWARD_SOURCE_KIND_FALLBACKS = Object.values(REWARD_SOURCE_KIND);

export const REWARD_ASSIGNMENT_MATCH_KIND = {
  any: 'any',
  exact: 'exact',
  range: 'range',
  minimum: 'minimum',
} as const;

export const REWARD_ASSIGNMENT_MATCH_KIND_FALLBACKS = [
  REWARD_ASSIGNMENT_MATCH_KIND.any,
  REWARD_ASSIGNMENT_MATCH_KIND.exact,
] as const;

export const ENCOUNTER_REWARD_OUTCOME_KIND_FALLBACKS = [
  'success',
  'failure',
  'encounter_completed',
] as const;

export const REWARD_AMOUNT_FORMULA_SCOPE_PARTS = [
  'reward',
  'resource',
  'experience',
  'character',
] as const;
