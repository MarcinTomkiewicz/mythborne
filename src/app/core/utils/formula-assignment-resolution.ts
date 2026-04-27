import {
  FormulaAdminData,
  FormulaAssignmentResolution,
  FormulaEntityAssignmentLookup,
} from '../domain/formula/formula.model';

export function resolveAssignedFormula(
  data: FormulaAdminData,
  targetKey: string,
  entity?: FormulaEntityAssignmentLookup,
): FormulaAssignmentResolution {
  const target = data.targets.find((entry) => entry.key === targetKey);

  if (!target) {
    throw new Error(`Formula target "${targetKey}" is not defined in Supabase.`);
  }

  const entityAssignment = entity
    ? data.entityAssignments.find(
        (entry) =>
          entry.entityKind === entity.entityKind &&
          entry.entityId === entity.entityId &&
          entry.targetId === target.id,
      ) ?? null
    : null;
  const globalAssignment =
    data.assignments.find((entry) => entry.targetId === target.id) ?? null;
  // Runtime lookup prefers a local entity assignment; only missing local assignment falls back to global/default.
  // A local assignment pointing to a missing/disabled formula is a configuration error, not a silent fallback case.
  const assignment = entityAssignment ?? globalAssignment;
  const formula =
    data.formulas.find((entry) => entry.id === assignment?.formulaId && entry.isEnabled) ?? null;

  if (!assignment || !formula) {
    throw new Error(`Formula target "${target.label}" has no enabled assigned formula.`);
  }

  return {
    target,
    formula,
    assignment,
    source: entityAssignment ? 'entity' : 'global',
  };
}
