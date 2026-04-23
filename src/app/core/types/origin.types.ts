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
  value: number;
  target: string;
  type: 'flat' | 'percent';
  description: string | null;
}
