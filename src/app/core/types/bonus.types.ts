export type BonusType = 'flat' | 'percent' | 'per_4_levels';

export interface Bonus {
  target: string;
  value: number;
  type: BonusType;
}

export interface BonusSource {
  name: string;
  bonuses: Bonus[];
}
