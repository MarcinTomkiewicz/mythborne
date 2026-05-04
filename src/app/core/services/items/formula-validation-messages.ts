import { FormulaTarget, FormulaVariableDefinition } from '../../domain/formula/formula.model';
import { ScopeVariableCatalogItem } from './formula-target-variable-catalog';

export function formulaValidationMessage(input: {
  selectedTarget: FormulaTarget | null;
  testerTarget: FormulaTarget | null;
  selectedVariablesError: string | null;
  unknownVariables: readonly string[];
  testerVariables: readonly string[];
  scopeVariables: readonly ScopeVariableCatalogItem[];
}): string | null {
  if (input.selectedTarget?.id === input.testerTarget?.id && input.selectedVariablesError) {
    return input.selectedVariablesError;
  }

  if (input.unknownVariables.length === 0) {
    return null;
  }

  const variable = input.unknownVariables[0];
  const availableVariables = input.testerVariables.join(', ') || 'none';
  const scopeVariable = input.scopeVariables.find((entry) => entry.key === variable);
  const availabilityHint = scopeVariable?.targetLabels.length
    ? ` Available in: ${scopeVariable.targetLabels.join(', ')}.`
    : '';

  return `Unknown variable: ${variable}. Tester target "${input.testerTarget?.label ?? 'none'}" allows: ${availableVariables}.${availabilityHint} Choose the correct tester target or add the variable to that target first.`;
}

export function formulaVariableTooltip(input: {
  key: string;
  fallback: string;
  previewVariables: readonly FormulaVariableDefinition[];
  scopeVariables: readonly ScopeVariableCatalogItem[];
  testerTarget: FormulaTarget | null;
}): string {
  const previewVariable =
    input.previewVariables.find((variable) => variable.key === input.key) ?? null;
  const scopeVariable =
    input.scopeVariables.find((variable) => variable.key === input.key) ?? null;
  const scopeLine = scopeVariable?.helperText || input.fallback;
  const availabilityLine = scopeVariable?.targetLabels.length
    ? `Available in: ${scopeVariable.targetLabels.join(', ')}`
    : null;
  const targetLine = input.testerTarget
    ? previewVariable
      ? `Tester target "${input.testerTarget.label}" default: ${previewVariable.defaultValue}`
      : `Tester target "${input.testerTarget.label}" does not expose this variable.`
    : null;

  return [scopeLine, availabilityLine, targetLine]
    .filter((line): line is string => !!line)
    .join('\n');
}
