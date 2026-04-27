import {
  BalanceFormula,
  EntityFormulaAssignment,
  FormulaAdminData,
  FormulaAssignment,
  FormulaBlock,
  FormulaTarget,
} from '../domain/formula/formula.model';

export type FormulaAssignmentStatus =
  | 'enabled'
  | 'disabled'
  | 'missing_formula'
  | 'no_assignment';

export interface FormulaTargetAssignmentRow {
  target: FormulaTarget;
  assignment: FormulaAssignment | null;
  formula: BalanceFormula | null;
  status: FormulaAssignmentStatus;
  statusLabel: string;
}

export interface EntityFormulaInspectionRow {
  assignment: EntityFormulaAssignment;
  target: FormulaTarget | null;
  formula: BalanceFormula | null;
}

export interface FormulaScopeInspectionRow {
  scopeKey: string;
  formulas: BalanceFormula[];
  blocks: FormulaBlock[];
}

export const EMPTY_FORMULA_ADMIN_DATA: FormulaAdminData = {
  targets: [],
  formulas: [],
  assignments: [],
  entityAssignments: [],
  blocks: [],
};
