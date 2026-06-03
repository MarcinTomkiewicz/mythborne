export interface BaseStatSnapshot {
  key: string;
  label: string;
  description: string | null;
  order: number;
  currentValue: number;
}
