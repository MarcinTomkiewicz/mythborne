import { Bonus } from './bonus.types';

export type ItemQualityKey = 'normal' | 'quality' | 'outstanding';
export type ItemAffixKind = 'prefix' | 'suffix';
export type ItemSlot = 'weapon' | 'trinket' | 'armor' | 'shield';

export interface ItemQualityDefinition {
  key: ItemQualityKey;
  label: string;
  multiplier: number;
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

export interface ItemBaseDefinition {
  id: string;
  key: string;
  name: string;
  slot: ItemSlot;
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
