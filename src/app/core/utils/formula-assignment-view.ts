import { BalanceFormula, FormulaAssignment } from '../domain/formula/formula.model';
import {
  FormulaAssignmentStatus,
  FormulaTargetAssignmentRow,
} from '../types/formula-admin-view.types';

export function toFormulaAssignmentStatus(
  assignment: FormulaAssignment | null,
  formula: BalanceFormula | null,
): FormulaAssignmentStatus {
  if (!assignment) {
    return 'no_assignment';
  }

  if (!formula) {
    return 'missing_formula';
  }

  return formula.isEnabled ? 'enabled' : 'disabled';
}

export function formulaAssignmentStatusLabel(
  status: FormulaAssignmentStatus,
): string {
  if (status === 'enabled') {
    return 'enabled assigned formula';
  }

  if (status === 'disabled') {
    return 'disabled assigned formula';
  }

  if (status === 'missing_formula') {
    return 'missing assigned formula';
  }

  return 'no assignment';
}

export function toFormulaTargetAssignmentRow(
  target: FormulaTargetAssignmentRow['target'],
  assignment: FormulaAssignment | null,
  formula: BalanceFormula | null,
): FormulaTargetAssignmentRow {
  const status = toFormulaAssignmentStatus(assignment, formula);

  return {
    target,
    assignment,
    formula,
    status,
    statusLabel: formulaAssignmentStatusLabel(status),
  };
}
