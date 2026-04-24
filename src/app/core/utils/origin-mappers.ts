import { Origin, OriginBonus } from '../domain/origin/origin.model';
import { OriginBonusWithTemplate } from '../types/domain-row.types';
import { Row } from '../types/supabase.types';
import { normalizeBonusTarget, normalizeBonusType } from './bonus';

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

export function mapOriginBonus(row: OriginBonusWithTemplate): OriginBonus {
  return {
    id: row.id,
    originId: row.origin_id!,
    value: row.value,
    target: normalizeBonusTarget(row.bonus_templates.target),
    type: normalizeBonusType(row.bonus_templates.type),
    description: row.bonus_templates.description ?? null,
  };
}
