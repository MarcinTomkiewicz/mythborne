export type BonusType = 'flat' | 'percent';

export interface Bonus {
  target: string;
  value: number;
  type: BonusType;
}

export interface BonusSource {
  name: string;
  bonuses: Bonus[];
}
