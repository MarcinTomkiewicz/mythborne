import { Json } from './database.types';
import { Row } from './supabase.types';

export type BonusEntityType =
  | 'origin'
  | 'item_generation_base'
  | 'item_generation_affix'
  | 'building'
  | 'item';

export interface CanonicalBonusType {
  id: string;
  key: string;
  label: string;
  category: string;
  valueKind: string;
  description: string;
  adminDescription: string | null;
  helperText: string | null;
  requiresValue: boolean;
  requiresLevelInterval: boolean;
  requiresScalingStat: boolean;
  requiresFormula: boolean;
  requiresResourceType: boolean;
  requiresFeatureTarget: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface CanonicalBonusScope {
  id: string;
  key: string;
  label: string;
  category: string;
  description: string;
  helperText: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface CanonicalBonusTargetCategory {
  id: string;
  key: string;
  label: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CanonicalBonusTarget {
  id: string;
  key: string;
  label: string;
  categoryKey: string;
  valueKind: string;
  description: string;
  helperText: string | null;
  isStackable: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface CanonicalBonusTemplate {
  id: string;
  key: string;
  label: string;
  description: string | null;
  typeKey: string;
  targetKey: string;
  scopeKey: string;
  levelInterval: number | null;
  formulaId: string | null;
  formulaTargetId: string | null;
  scalingStatKey: string | null;
  paramsJson: Json;
  sortOrder: number;
  isActive: boolean;
}

export interface CanonicalEntityBonus {
  id: string;
  entityType: BonusEntityType;
  entityId: string;
  bonusTemplateId: string;
  value: number;
  description: string | null;
  levelIntervalOverride: number | null;
  formulaIdOverride: string | null;
  formulaTargetIdOverride: string | null;
  scalingStatKeyOverride: string | null;
  scopeKeyOverride: string | null;
  qualityScalesValue: boolean;
  qualityScalesLevelInterval: boolean;
  paramsJson: Json;
  sortOrder: number;
  isActive: boolean;
}

export interface ResolvedBonus {
  id: string;
  entityType: BonusEntityType;
  entityId: string;
  templateId: string;
  templateKey: string;
  templateLabel: string;
  targetKey: string;
  typeKey: string;
  scopeKey: string;
  value: number;
  levelInterval: number | null;
  formulaId: string | null;
  formulaTargetId: string | null;
  scalingStatKey: string | null;
  paramsJson: Json;
  qualityScalesValue: boolean;
  qualityScalesLevelInterval: boolean;
  sortOrder: number;
  isActive: boolean;
}

export type CanonicalBonusTemplateRow = Row<'bonus_templates'>;

export type CanonicalEntityBonusRow = Row<'entity_bonuses'>;

export type CanonicalEntityBonusWithTemplateRow = CanonicalEntityBonusRow & {
  bonus_templates: CanonicalBonusTemplateRow | null;
};
