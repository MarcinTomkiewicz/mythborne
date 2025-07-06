export interface OriginBonus {
  id: string;
  originId: string;
  value: number;
  target?: string;
  type: 'flat' | 'percent';
  description: string | null;
}
