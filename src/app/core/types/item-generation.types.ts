import { Bonus } from './bonus.types';

export type ItemQualityKey = 'normal' | 'quality' | 'outstanding';
export type ItemAffixKind = 'prefix' | 'suffix';

export interface ItemQualityDefinition {
  key: ItemQualityKey;
  label: string;
  multiplier: number;
  requirementMultiplier: number;
  weight: number;
}

export interface ItemGenerationBucketProfile {
  key: string;
  name: string;
  description: string | null;
  bucketCount: number;
  baseValue: number;
  linearGrowth: number;
  growthFactor: number;
  roundingStep: number;
  minIncrement: number;
}

export interface ItemGenerationBaseType {
  id: string;
  key: string;
  label: string;
  description: string | null;
  equipmentSlotGroup: string;
  handUsage: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ItemGenerationBaseTypeTarget {
  id: string;
  baseTypeKey: string;
  bonusTargetKey: string;
  isRequired: boolean;
  requiredGroupKey: string | null;
  minRequiredInGroup: number | null;
  defaultValue: number | null;
  minValue: number | null;
  maxValue: number | null;
  helperText: string | null;
  sortOrder: number;
}

export interface ItemBaseDefinition {
  id: string;
  key: string;
  name: string;
  baseTypeKey: string;
  baseTypeLabel: string;
  equipmentSlotGroup: string;
  handUsage: string;
  baseValue: number;
  description: string;
  bonuses: Bonus[];
}

export interface ItemAffixDefinition {
  id: string;
  key: string;
  kind: ItemAffixKind;
  name: string;
  goldValue: number;
  description: string;
  bonuses: Bonus[];
}

export interface ItemGenerationCatalog {
  budgetBuckets: number[];
  qualities: ItemQualityDefinition[];
  baseTypes: ItemGenerationBaseType[];
  baseTypeTargets: ItemGenerationBaseTypeTarget[];
  bases: ItemBaseDefinition[];
  prefixes: ItemAffixDefinition[];
  suffixes: ItemAffixDefinition[];
}

export interface ItemGenerationStep {
  title: string;
  detail: string;
}

export interface GeneratedItemPart {
  label: string;
  bonuses: Bonus[];
}

export interface GeneratedItemResult {
  displayName: string;
  bucketValue: number;
  luck: number;
  quality: ItemQualityDefinition;
  base: ItemBaseDefinition;
  prefix: ItemAffixDefinition | null;
  suffix: ItemAffixDefinition | null;
  baseBudget: number;
  preQualityValue: number;
  finalValue: number;
  remainingBudget: number;
  combinedBonuses: Bonus[];
  parts: GeneratedItemPart[];
  process: ItemGenerationStep[];
}
