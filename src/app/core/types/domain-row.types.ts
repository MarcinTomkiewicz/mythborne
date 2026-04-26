import { Row } from './supabase.types';

export type HeroRow = Row<'hero'>;

export type OriginBonusWithTemplate = Row<'origin_bonuses'> & {
  bonus_templates: Row<'bonus_templates'>;
};

export type ItemGenerationBaseBonusRow = Row<'item_generation_base_bonuses'> & {
  bonus_templates: Row<'bonus_templates'>;
};

export type ItemGenerationAffixBonusRow = Row<'item_generation_affix_bonuses'> & {
  bonus_templates: Row<'bonus_templates'>;
};
