import {
  BalanceFormula,
  EntityFormulaAssignment,
  FormulaAdminData,
  FormulaTarget,
} from './formula.types';

export interface FormulaEvaluationResult {
  value: number | null;
  error: string | null;
}

export interface StatProgressionRules {
  costTarget: FormulaTarget;
  capTarget: FormulaTarget;
  costFormula: BalanceFormula;
  capFormula: BalanceFormula;
}

export interface AttributeAllocationRow {
  key: string;
  label: string;
  description: string | null;
  currentValue: number;
  plannedValue: number;
  pendingLevels: number;
  nextLevelCost: number | null;
  maxAllowedValue: number | null;
  canIncrease: boolean;
  canDecrease: boolean;
  increaseReason: string | null;
  formulaError: string | null;
}

export const STAT_PROGRESSION_TARGET_KEYS = {
  cost: 'hero_stat_upgrade_cost',
  cap: 'hero_stat_level_cap',
} as const;

export interface BuildingProgressionRules {
  costFormulaId?: string | null;
  timeFormulaId?: string | null;
  bonusFormulaId?: string | null;
  costExpression: string;
  timeExpression: string;
  bonusExpression: string;
}

export const BUILDING_PROGRESSION_TARGET_KEYS = {
  upgradeCost: 'building_upgrade_cost',
  upgradeTime: 'building_upgrade_time',
  bonusGrowth: 'building_bonus_growth',
} as const;
