import { Origin, OriginBonus } from '../domain/origin/origin.model';
import { CanonicalEntityBonusWithTemplateRow } from '../types/bonus-governance.types';
import { Row } from '../types/supabase.types';
import { mapCanonicalBonusTemplate, mapResolvedBonus } from './bonus-governance';
import { readParamNumber } from './params';
import { BonusScope, BonusType } from '../types/bonus.types';

export function mapOrigin(row: Row<'origin'>): Origin {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description ?? null,
    imageUrl: originImageUrl(row.key),
    createdAt: row.created_at ?? null,
  };
}

export function originImageUrl(originKey: string): string {
  return `/images/origins/${originKey.toLowerCase()}.png`;
}

export function originPaperdollImageUrl(originKey: string | null | undefined): string | null {
  return originKey
    ? `/images/paperdolls/${originKey.toLowerCase()}.png`
    : null;
}

export function mapOriginBonus(row: CanonicalEntityBonusWithTemplateRow): OriginBonus {
  if (!row.bonus_templates) {
    throw new Error(`Origin entity bonus "${row.id}" has no joined bonus template.`);
  }

  const resolved = mapResolvedBonus(row);
  const template = mapCanonicalBonusTemplate(row.bonus_templates);

  // F7 keeps the existing OriginBonus view model stable while sourcing it from entity_bonuses.
  return {
    id: row.id,
    originId: resolved.entityId,
    templateId: resolved.templateId,
    category: '',
    target: resolved.targetKey,
    type: resolved.typeKey as BonusType,
    scope: resolved.scopeKey as BonusScope,
    description: row.description ?? template.description,
    baseValue: resolved.value,
    levelsStep: resolved.levelInterval,
    sourceStat: resolved.scalingStatKey,
    scalingFactor: readParamNumber(resolved.paramsJson, 'scalingFactor'),
  };
}
