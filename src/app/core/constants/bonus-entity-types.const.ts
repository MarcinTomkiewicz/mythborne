export const BONUS_ENTITY_TYPES = {
  Hero: 'hero',
  Origin: 'origin',
  ItemGenerationBase: 'item_generation_base',
  ItemGenerationAffix: 'item_generation_affix',
  Building: 'building',
  Item: 'item',
} as const;

export type BonusEntityType =
  (typeof BONUS_ENTITY_TYPES)[keyof typeof BONUS_ENTITY_TYPES];
