import { Row } from '../../types/supabase.types';
import { Origin, OriginBonus } from './origin.model';

export function mapOrigin(row: Row<'origin'>): Origin {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description ?? null,
    imageUrl: `/images/origins/${row.key.toLowerCase()}.png`,
    createdAt: row.created_at ?? null,
  };
}

export function mapOriginBonus(
  row: Row<'origin_bonuses'> & { bonus_templates: Row<'bonus_templates'> }
): OriginBonus {
  return {
    id: row.id,
    originId: row.origin_id!,
    value: row.value,
    target: row.bonus_templates.target,
    type: row.bonus_templates.type as 'flat' | 'percent',
    description: row.bonus_templates.description ?? null,
  };
}
