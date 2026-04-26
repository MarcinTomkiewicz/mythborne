import { Origin, OriginBonus } from '../domain/origin/origin.model';
import { OriginBonusWithTemplate } from '../types/domain-row.types';
import { Row } from '../types/supabase.types';
import {
  normalizeBonusTemplate,
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
  const template = normalizeBonusTemplate(row.bonus_templates);

  return {
    id: row.id,
    originId: row.origin_id!,
    templateId: row.template_id,
    category: template.category,
    target: template.target,
    type: template.type,
    scope: template.scope,
    description: template.description,
    baseValue: Number(row.value ?? template.baseValue),
    levelsStep: template.levelsStep,
    sourceStat: template.sourceStat,
    scalingFactor: template.scalingFactor,
  };
}
