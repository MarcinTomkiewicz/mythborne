export const ENCOUNTER_KIND = {
  combat: 'combat',
  resource: 'resource',
  buff: 'buff',
  debuff: 'debuff',
} as const;

export const ENCOUNTER_KIND_FALLBACKS = Object.values(ENCOUNTER_KIND);
export const EXPLORATION_EFFECT_KIND_FALLBACKS = [
  ENCOUNTER_KIND.buff,
  ENCOUNTER_KIND.debuff,
] as const;

export const COMBAT_CANDIDATE_KIND = {
  opponent: 'opponent',
  family: 'family',
} as const;

export const EXPLORATION_PAYLOAD_FORMULA_SCOPE_PARTS = [
  'exploration',
  'encounter',
  'resource',
  'reward',
] as const;
