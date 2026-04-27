import type {
  BonusTemplate,
  BonusType,
  BonusScope,
} from '../types/bonus.types';
import {
  CanonicalBonusScope,
  CanonicalBonusTarget,
  CanonicalBonusTargetCategory,
  CanonicalBonusTemplate,
  CanonicalBonusTemplateRow,
  CanonicalBonusType,
  CanonicalEntityBonus,
  CanonicalEntityBonusRow,
  CanonicalEntityBonusWithTemplateRow,
  ResolvedBonus,
  SemanticBonusTemplatePayload,
} from '../types/bonus-governance.types';
import {
  BONUS_ENTITY_TYPES,
  BonusEntityType,
} from '../constants/bonus-entity-types.const';
import { Row } from '../types/supabase.types';
import { trimText, trimToNull } from './normalize-text';
import { readParamNumber } from './params';

export function mapCanonicalBonusType(row: Row<'bonus_types'>): CanonicalBonusType {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    category: row.category,
    valueKind: row.value_kind,
    description: row.description,
    adminDescription: row.admin_description,
    helperText: row.helper_text,
    requiresValue: row.requires_value,
    requiresLevelInterval: row.requires_level_interval,
    requiresScalingStat: row.requires_scaling_stat,
    requiresFormula: row.requires_formula,
    requiresResourceType: row.requires_resource_type,
    requiresFeatureTarget: row.requires_feature_target,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export function mapCanonicalBonusScope(row: Row<'bonus_scopes'>): CanonicalBonusScope {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    category: row.category,
    description: row.description,
    helperText: row.helper_text,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export function mapCanonicalBonusTargetCategory(
  row: Row<'bonus_target_categories'>,
): CanonicalBonusTargetCategory {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    description: row.description,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export function mapCanonicalBonusTarget(row: Row<'bonus_targets'>): CanonicalBonusTarget {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    categoryKey: row.category_key,
    valueKind: row.value_kind,
    description: row.description,
    helperText: row.helper_text,
    isStackable: row.is_stackable,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export function mapCanonicalBonusTemplate(
  row: CanonicalBonusTemplateRow,
): CanonicalBonusTemplate {
  return {
    id: row.id,
    key: requiredString(row.key, 'bonus_templates.key', row.id),
    label: requiredString(row.label, 'bonus_templates.label', row.id),
    description: row.description,
    typeKey: requiredString(row.type_key, 'bonus_templates.type_key', row.id),
    targetKey: requiredString(row.target_key, 'bonus_templates.target_key', row.id),
    scopeKey: requiredString(row.scope_key, 'bonus_templates.scope_key', row.id),
    levelInterval: row.level_interval,
    formulaId: row.formula_id,
    formulaTargetId: row.formula_target_id,
    scalingStatKey: row.scaling_stat_key,
    paramsJson: row.params_json,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export function mapCanonicalEntityBonus(row: CanonicalEntityBonusRow): CanonicalEntityBonus {
  return {
    id: row.id,
    entityType: toBonusEntityType(row.entity_type),
    entityId: row.entity_id,
    bonusTemplateId: row.bonus_template_id,
    value: row.value,
    description: row.description,
    levelIntervalOverride: row.level_interval_override,
    formulaIdOverride: row.formula_id_override,
    formulaTargetIdOverride: row.formula_target_id_override,
    scalingStatKeyOverride: row.scaling_stat_key_override,
    scopeKeyOverride: row.scope_key_override,
    qualityScalesValue: row.quality_scales_value,
    qualityScalesLevelInterval: row.quality_scales_level_interval,
    paramsJson: row.params_json,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export function mapResolvedBonus(row: CanonicalEntityBonusWithTemplateRow): ResolvedBonus {
  if (!row.bonus_templates) {
    throw new Error(`Entity bonus "${row.id}" has no joined bonus template.`);
  }

  const entityBonus = mapCanonicalEntityBonus(row);
  const template = mapCanonicalBonusTemplate(row.bonus_templates);

  return {
    id: entityBonus.id,
    entityType: entityBonus.entityType,
    entityId: entityBonus.entityId,
    templateId: template.id,
    templateKey: template.key,
    templateLabel: template.label,
    targetKey: template.targetKey,
    typeKey: template.typeKey,
    scopeKey: entityBonus.scopeKeyOverride ?? template.scopeKey,
    value: entityBonus.value,
    levelInterval: entityBonus.levelIntervalOverride ?? template.levelInterval,
    formulaId: entityBonus.formulaIdOverride ?? template.formulaId,
    formulaTargetId: entityBonus.formulaTargetIdOverride ?? template.formulaTargetId,
    scalingStatKey: entityBonus.scalingStatKeyOverride ?? template.scalingStatKey,
    paramsJson: mergeParams(template.paramsJson, entityBonus.paramsJson),
    qualityScalesValue: entityBonus.qualityScalesValue,
    qualityScalesLevelInterval: entityBonus.qualityScalesLevelInterval,
    sortOrder: entityBonus.sortOrder,
    isActive: entityBonus.isActive && template.isActive,
  };
}

export function toBonusTemplateAdminView(
  template: CanonicalBonusTemplate,
  targetByKey: ReadonlyMap<string, CanonicalBonusTarget>,
): BonusTemplate {
  const target = targetByKey.get(template.targetKey);

  return {
    id: template.id,
    key: template.key,
    label: template.label,
    category: target?.categoryKey ?? '',
    target: template.targetKey,
    type: template.typeKey as BonusType,
    scope: template.scopeKey as BonusScope,
    description: template.description ?? '',
    baseValue: 0,
    levelsStep: template.levelInterval,
    sourceStat: template.scalingStatKey,
    scalingFactor: readParamNumber(template.paramsJson, 'scalingFactor'),
    sortOrder: template.sortOrder,
    isActive: template.isActive,
  };
}

export function toSemanticBonusTemplatePayload(
  draft: BonusTemplate,
): SemanticBonusTemplatePayload {
  const scalingFactor = readFiniteNumber(draft.scalingFactor);

  return {
    key: requiredPayloadString(draft.key, 'bonus_templates.key'),
    label: requiredPayloadString(draft.label, 'bonus_templates.label'),
    description: trimToNull(draft.description),
    typeKey: requiredPayloadString(draft.type, 'bonus_templates.type_key'),
    targetKey: requiredPayloadString(draft.target, 'bonus_templates.target_key'),
    scopeKey: requiredPayloadString(draft.scope, 'bonus_templates.scope_key'),
    levelInterval: draft.levelsStep === null ? null : readFiniteNumber(draft.levelsStep),
    scalingStatKey: trimToNull(draft.sourceStat),
    paramsJson: scalingFactor === null ? {} : { scalingFactor },
    sortOrder: readFiniteNumber(draft.sortOrder) ?? 0,
    isActive: draft.isActive,
  };
}

export function projectQualityScaledValue(
  bonus: Pick<ResolvedBonus, 'value' | 'qualityScalesValue'>,
  qualityMultiplier: number,
): number {
  return bonus.qualityScalesValue ? bonus.value * qualityMultiplier : bonus.value;
}

function requiredString(
  value: string | null | undefined,
  field: string,
  rowId: string,
): string {
  if (!value) {
    throw new Error(`${field} is required for canonical bonus row "${rowId}".`);
  }

  return value;
}

function requiredPayloadString(
  value: string | null | undefined,
  field: string,
): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for semantic bonus template writes.`);
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

function toBonusEntityType(value: string): BonusEntityType {
  if (Object.values(BONUS_ENTITY_TYPES).includes(value as BonusEntityType)) {
    return value as BonusEntityType;
  }

  throw new Error(`Unsupported bonus entity type "${value}".`);
}

function mergeParams(
  templateParams: ResolvedBonus['paramsJson'],
  overrideParams: ResolvedBonus['paramsJson'],
): ResolvedBonus['paramsJson'] {
  if (!isPlainObject(templateParams) || !isPlainObject(overrideParams)) {
    return overrideParams ?? templateParams;
  }

  return {
    ...templateParams,
    ...overrideParams,
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
