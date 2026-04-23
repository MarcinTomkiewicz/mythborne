import { BalanceFormula, FormulaTarget } from '../formula/formula.model';

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

export const STAT_PROGRESSION_TARGET_KEYS = {
  cost: 'hero_stat_upgrade_cost',
  cap: 'hero_stat_level_cap',
} as const;
