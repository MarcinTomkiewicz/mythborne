export type BonusType =
  | 'flat'
  | 'percent'
  | 'per_levels'
  | 'scaled_stat_bonus'
  | 'resource_flat'
  | 'resource_percent'
  | 'capacity_flat'
  | 'unlock_feature';

export type BonusScope =
  | 'global'
  | 'combat'
  | 'pvp_attack'
  | 'pvp_defense'
  | 'trial'
  | 'exploration'
  | 'requirements'
  | 'trade'
  | 'auction'
  | 'economy'
  | 'building_management';

export interface BonusTargetDefinition {
  id: string;
  key: string;
  label: string;
  kind: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface BonusTemplate {
  id: string;
  key: string;
  label: string;
  category: string;
  target: string;
  type: BonusType;
  scope: BonusScope;
  description: string;
  baseValue: number;
  levelsStep: number | null;
  sourceStat: string | null;
  scalingFactor: number | null;
  sortOrder: number;
  isActive: boolean;
}

export interface BonusAdminData {
  templates: BonusTemplate[];
  targets: BonusTargetDefinition[];
  categories: string[];
}

export interface EditableAppliedBonus {
  id?: string | null;
  templateId: string | null;
  category: string;
  templateLabel: string;
  target: string;
  type: BonusType;
  scope: BonusScope;
  description: string;
  baseValue: number;
  levelsStep: number | null;
  sourceStat: string | null;
  scalingFactor: number | null;
}

export interface Bonus {
  target: string;
  value: number;
  type: BonusType;
  scope: BonusScope;
  sourceStat?: string | null;
  scalingFactor?: number | null;
  levelsStep?: number | null;
}

export interface BonusSource {
  name: string;
  bonuses: Bonus[];
}
