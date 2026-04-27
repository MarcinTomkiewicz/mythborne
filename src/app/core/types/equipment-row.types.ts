import { Row } from './supabase.types';

export type EquippedItemRow = Row<'hero_equipment'> & {
  items: Pick<
    Row<'items'>,
    | 'id'
    | 'generation_base_id'
    | 'generation_quality_key'
    | 'prefix_affix_id'
    | 'suffix_affix_id'
  > | null;
};
