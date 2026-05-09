import {
  BalanceFormula,
  FormulaAdminData,
  FormulaTarget,
} from '../../domain/formula/formula.model';

export function selectFormulaTesterTarget(input: {
  data: FormulaAdminData;
  currentTargetId: string;
  currentScope: string;
  expressionVariables: readonly string[];
  formula: Pick<BalanceFormula, 'id'> | { id: string | null } | null;
  selectedTarget: FormulaTarget | null;
}): FormulaTarget | null {
  const targets = input.data.targets.filter((target) => target.scopeKey === input.currentScope);
  const assignedTargets = input.formula?.id
    ? targets.filter((target) =>
        input.data.assignments.some(
          (assignment) =>
            assignment.formulaId === input.formula?.id &&
            assignment.targetId === target.id,
        ),
      )
    : [];

  if (assignedTargets.length === 1) {
    return assignedTargets[0];
  }

  const current = targets.find((target) => target.id === input.currentTargetId) ?? null;
  const selected =
    input.selectedTarget?.scopeKey === input.currentScope
      ? targets.find((target) => target.id === input.selectedTarget?.id) ?? null
      : null;

  if (input.expressionVariables.length === 0) {
    return current ?? selected ?? assignedTargets[0] ?? targets[0] ?? null;
  }

  const coveringAssignedTargets = assignedTargets.filter((target) =>
    targetAllowsVariables(target, input.expressionVariables),
  );

  if (coveringAssignedTargets.length === 1) {
    return coveringAssignedTargets[0];
  }

  if (current && targetAllowsVariables(current, input.expressionVariables)) {
    return current;
  }

  if (selected && targetAllowsVariables(selected, input.expressionVariables)) {
    return selected;
  }

  const coveringTargets = targets.filter((target) =>
    targetAllowsVariables(target, input.expressionVariables),
  );

  if (coveringTargets.length === 1) {
    return coveringTargets[0];
  }

  return assignedTargets[0] ?? null;
}

export function targetAllowsVariables(
  target: Pick<FormulaTarget, 'allowedVariables'>,
  variables: readonly string[],
): boolean {
  return variables.every((variable) => target.allowedVariables.includes(variable));
}
