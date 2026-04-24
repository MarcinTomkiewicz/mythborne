import { FormulaTarget, FormulaVariableDefinition } from '../types/formula.types';

export function toFormulaVariableKey(value: string): string {
  const normalized = (value ?? '').trim().replace(/[^A-Za-z0-9_]/g, '');

  if (!normalized) {
    return '';
  }

  const startsWithLetter = /^[A-Za-z_]/.test(normalized);
  return startsWithLetter ? normalized : `v${normalized}`;
}

export function toFormulaVariableDefinitions(
  target: Pick<FormulaTarget, 'allowedVariables' | 'defaultTestContext'> | null
): FormulaVariableDefinition[] {
  if (!target) {
    return [];
  }

  return target.allowedVariables.map((key) => ({
    key,
    defaultValue: Number(target.defaultTestContext[key] ?? 0),
  }));
}

export function toFormulaVariableContext(
  variables: readonly FormulaVariableDefinition[]
): Record<string, number> {
  return variables.reduce(
    (acc, variable) => {
      acc[variable.key] = Number.isFinite(variable.defaultValue) ? variable.defaultValue : 0;
      return acc;
    },
    {} as Record<string, number>
  );
}

export function validateFormulaVariables(
  variables: readonly FormulaVariableDefinition[]
): string | null {
  const seen = new Set<string>();

  for (const variable of variables) {
    const key = toFormulaVariableKey(variable.key);

    if (!key) {
      return 'Variable key cannot be empty.';
    }

    if (seen.has(key)) {
      return `Variable "${key}" is duplicated.`;
    }

    seen.add(key);
  }

  return null;
}
