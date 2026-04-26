export type BonusType =
  | 'flat'
  | 'percent'
  | 'per_levels'
  | 'scaled_stat_bonus'
  | 'resource_flat'
  | 'resource_percent'
  | 'capacity_flat'
  | 'unlock_feature';

export type BonusContext =
  | 'global'
  | 'pvp_attack'
  | 'pvp_defense'
  | 'exploration'
  | 'trial'
  | 'combat'
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
  context: BonusContext;
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
  context: BonusContext;
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
  context: BonusContext;
  sourceStat?: string | null;
  scalingFactor?: number | null;
  levelsStep?: number | null;
}

export interface BonusSource {
  name: string;
  bonuses: Bonus[];
}
