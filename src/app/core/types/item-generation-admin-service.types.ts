import { BonusScope, BonusType } from './bonus.types';

export type BucketProfilePayload = {
  key: string;
  name: string;
  description: string | null;
  bucketCount: number;
  baseValue: number;
  linearGrowth: number;
  growthFactor: number;
  roundingStep: number;
  minIncrement: number;
  isActive: boolean;
};

export type BonusTemplatePayload = {
  key: string;
  label: string;
  category: string;
  target: string;
  type: BonusType;
  scope: BonusScope;
  description: string | null;
  baseValue: number;
  levelsStep: number | null;
  sourceStat: string | null;
  scalingFactor: number | null;
  sortOrder: number;
  isActive: boolean;
};
