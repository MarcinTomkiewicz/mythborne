import { BonusContext, BonusType } from './bonus.types';

export interface Origin {
  id: string;
  key: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string | null;
}

export interface OriginBonus {
  id: string;
  originId: string;
  templateId: string | null;
  category: string;
  target: string;
  type: BonusType;
  context: BonusContext;
  description: string | null;
  baseValue: number;
  levelsStep: number | null;
  sourceStat: string | null;
  scalingFactor: number | null;
}
