import {
  BalanceFormula,
  EntityFormulaAssignment,
  FormulaAssignment,
  FormulaTarget,
} from '../domain/formula/formula.model';
import {
  EntityFormulaInspectionRow,
  FormulaEntityReference,
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

export function toEntityFormulaInspectionRow(input: {
  assignment: EntityFormulaAssignment;
  target: FormulaTarget | null;
  localFormula: BalanceFormula | null;
  globalAssignment: FormulaAssignment | null;
  globalFormula: BalanceFormula | null;
  entityReference: FormulaEntityReference | null;
}): EntityFormulaInspectionRow {
  // Runtime lookup uses local entity assignment first; if it is removed,
  // the same target falls back to its global/default formula assignment.
  return {
    assignment: input.assignment,
    target: input.target,
    formula: input.localFormula,
    globalAssignment: input.globalAssignment,
    globalFormula: input.globalFormula,
    entityLabel: input.entityReference?.label ?? null,
    entityKey: input.entityReference?.key ?? null,
    resolutionLabel: input.localFormula
      ? 'local override active'
      : 'local override references missing formula',
  };
}
