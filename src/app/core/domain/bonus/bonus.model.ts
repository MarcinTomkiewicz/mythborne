type BonusType = 'flat' | 'percent';

export interface Bonus {
  target: string; // np. 'strength', 'health', 'luck', 'minDmg'
  value: number;
  type: BonusType;
}

export interface BonusSource {
  name: string; // np. 'origin', 'equipment', 'buildings'
  bonuses: Bonus[];
}
