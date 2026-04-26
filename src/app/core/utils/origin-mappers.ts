import { Origin, OriginBonus } from '../domain/origin/origin.model';
import { OriginBonusWithTemplate } from '../types/domain-row.types';
import { Row } from '../types/supabase.types';
import {
  normalizeBonusContext,
  normalizeBonusTarget,
  normalizeBonusType,
} from './bonus';

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
    templateId: row.template_id,
    category: row.bonus_templates.category ?? 'general',
    target: normalizeBonusTarget(row.bonus_templates.target),
    type: normalizeBonusType(row.bonus_templates.type),
    context: normalizeBonusContext(row.bonus_templates.context),
    description: row.bonus_templates.description ?? null,
    baseValue: Number(row.base_value ?? row.value ?? 0),
    levelsStep: row.levels_step ?? row.bonus_templates.levels_step ?? null,
    sourceStat: row.source_stat ?? row.bonus_templates.source_stat ?? null,
    scalingFactor: row.scaling_factor ?? row.bonus_templates.scaling_factor ?? null,
  };
}
