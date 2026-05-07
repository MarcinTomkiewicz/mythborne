import { FormulaAdminData } from '../domain/formula/formula.model';
import { FormulaTargetAssignmentRow } from '../types/formula-admin-view.types';
import { toFormulaTargetAssignmentRow } from './formula-assignment-view';

export function toFormulaTargetAssignmentRows(
  data: FormulaAdminData,
  targetKeys: readonly string[],
): FormulaTargetAssignmentRow[] {
  const formulaById = new Map(
    data.formulas.map((formula) => [formula.id, formula]),
  );
  const assignmentByTargetId = new Map(
    data.assignments.map((assignment) => [assignment.targetId, assignment]),
  );
  const targetOrder = new Map<string, number>(
    targetKeys.map((key, index) => [key, index]),
  );

  return data.targets
    .filter((target) => targetKeys.includes(target.key))
    .sort((left, right) =>
      (targetOrder.get(left.key) ?? 99) - (targetOrder.get(right.key) ?? 99),
    )
    .map((target) => {
      const assignment = assignmentByTargetId.get(target.id) ?? null;
      const formula = assignment
        ? formulaById.get(assignment.formulaId) ?? null
        : null;

      return toFormulaTargetAssignmentRow(target, assignment, formula);
    });
}

export function missingFormulaTargetKeys(
  rows: readonly FormulaTargetAssignmentRow[],
  targetKeys: readonly string[],
): string[] {
  const existing = new Set(rows.map((row) => row.target.key));

  return targetKeys.filter((key) => !existing.has(key));
}

export function formulaTargetContextPreview(
  row: FormulaTargetAssignmentRow,
): string {
  return JSON.stringify(row.target.defaultTestContext, null, 2);
}
