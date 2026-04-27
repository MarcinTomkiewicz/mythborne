import {
  BonusDictionaryMaps,
  BonusDictionarySource,
  CanonicalEntityBonusWithTemplateRow,
  EntityBonusPayload,
  EntityBonusPayloadInput,
  ResolvedBonusView,
} from '../types/bonus-governance.types';
import {
  mapCanonicalBonusTemplate,
  mapCanonicalEntityBonus,
  mapResolvedBonus,
} from './bonus-governance';
import { trimText, trimToNull } from './normalize-text';

export function mapResolvedBonusView(
  row: CanonicalEntityBonusWithTemplateRow,
  dictionaries: BonusDictionaryMaps,
): ResolvedBonusView {
  if (!row.bonus_templates) {
    throw new Error(`Entity bonus "${row.id}" has no joined bonus template.`);
  }

  const resolved = mapResolvedBonus(row);
  const entityBonus = mapCanonicalEntityBonus(row);
  const template = mapCanonicalBonusTemplate(row.bonus_templates);
  const type = requiredDictionaryEntry(
    dictionaries.types,
    resolved.typeKey,
    'bonus_types',
  );
  const scope = requiredDictionaryEntry(
    dictionaries.scopes,
    resolved.scopeKey,
    'bonus_scopes',
  );
  const target = requiredDictionaryEntry(
    dictionaries.targets,
    resolved.targetKey,
    'bonus_targets',
  );
  const targetCategory = requiredDictionaryEntry(
    dictionaries.targetCategories,
    target.categoryKey,
    'bonus_target_categories',
  );

  return {
    ...resolved,
    type,
    scope,
    target,
    targetCategory,
    entityDescription: entityBonus.description,
    templateDescription: template.description,
    description: entityBonus.description ?? template.description,
  };
}

export function toBonusDictionaryMaps(
  source: BonusDictionarySource,
): BonusDictionaryMaps {
  return {
    types: new Map(source.types.map((entry) => [entry.key, entry])),
    scopes: new Map(source.scopes.map((entry) => [entry.key, entry])),
    targetCategories: new Map(
      source.targetCategories.map((entry) => [entry.key, entry]),
    ),
    targets: new Map(source.targets.map((entry) => [entry.key, entry])),
  };
}

export function toEntityBonusPayload(
  input: EntityBonusPayloadInput,
): EntityBonusPayload {
  if (input.qualityScalesLevelInterval) {
    throw new Error('entity_bonuses.quality_scales_level_interval must remain false.');
  }

  return {
    entityType: input.entityType,
    entityId: requiredPayloadString(input.entityId, 'entity_bonuses.entity_id'),
    bonusTemplateId: requiredPayloadString(
      input.bonusTemplateId,
      'entity_bonuses.bonus_template_id',
    ),
    value: requiredFiniteNumber(input.value, 'entity_bonuses.value'),
    description: trimToNull(input.description),
    levelIntervalOverride: readFiniteNumber(input.levelIntervalOverride),
    formulaIdOverride: trimToNull(input.formulaIdOverride),
    formulaTargetIdOverride: trimToNull(input.formulaTargetIdOverride),
    scalingStatKeyOverride: trimToNull(input.scalingStatKeyOverride),
    scopeKeyOverride: trimToNull(input.scopeKeyOverride),
    qualityScalesValue: input.qualityScalesValue ?? false,
    qualityScalesLevelInterval: false,
    paramsJson: input.paramsJson ?? {},
    sortOrder: readFiniteNumber(input.sortOrder) ?? 0,
    isActive: input.isActive ?? true,
  };
}

function requiredDictionaryEntry<T>(
  entries: ReadonlyMap<string, T>,
  key: string,
  dictionaryName: string,
): T {
  const entry = entries.get(key);

  if (!entry) {
    throw new Error(`${dictionaryName} entry "${key}" is required for resolved bonus view.`);
  }

  return entry;
}

function requiredPayloadString(
  value: string | null | undefined,
  field: string,
): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for entity bonus writes.`);
  }

  return normalized;
}

function requiredFiniteNumber(value: number, field: string): number {
  const normalized = Number(value);

  if (!Number.isFinite(normalized)) {
    throw new Error(`${field} must be a finite number.`);
  }

  return normalized;
}

function readFiniteNumber(value: number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : null;
}
