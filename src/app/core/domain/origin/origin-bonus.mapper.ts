import { Row } from '../../types/supabase.types';
import { OriginBonus } from './origin-bonus.model';

export interface OriginBonusWithTemplate extends Row<'origin_bonuses'> {
  bonus_templates: Row<'bonus_templates'>;
}

const validTypes = ['flat', 'percent'] as const;

function isValidBonusType(value: any): value is 'flat' | 'percent' {
  return validTypes.includes(value);
}

export function mapOriginBonus(row: OriginBonusWithTemplate): OriginBonus {
  return {
    id: row.id,
    originId: row.origin_id!,
    value: row.value,
    target: row.bonus_templates.target,
    type: isValidBonusType(row.bonus_templates.type)
      ? row.bonus_templates.type
      : 'flat',
    description: row.bonus_templates.description ?? null,
  };
}
