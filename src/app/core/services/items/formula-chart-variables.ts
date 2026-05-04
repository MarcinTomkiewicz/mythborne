import { FormulaTarget } from '../../domain/formula/formula.model';
import { FormulaRuntimeService } from '../progression/formula-runtime';
import { normalizeBuildingUpgradeVariables } from './formula-tester-variables';

export interface FormulaChartPoint {
  x: number;
  y: number;
}

export function preferredFormulaChartVariable(input: {
  variables: readonly string[];
  targetKey: string | null | undefined;
}): string | null {
  if (
    input.targetKey === 'building_upgrade_cost' ||
    input.targetKey === 'building_upgrade_time'
  ) {
    return (
      input.variables.find((variable) => variable === 'targetLevel') ??
      input.variables.find((variable) => variable === 'currentLevel') ??
      null
    );
  }

  return (
    input.variables.find((variable) => variable === 'currentLevel') ??
    input.variables.find((variable) => variable === 'targetLevel') ??
    input.variables.find((variable) => variable === 'statCurrentLevel') ??
    input.variables.find((variable) => variable === 'recipientLevel') ??
    input.variables.find((variable) => variable === 'opponentLevel') ??
    input.variables.find((variable) => variable === 'attackerLevel') ??
    input.variables.find((variable) => variable === 'defenderLevel') ??
    input.variables[0] ??
    null
  );
}

export function buildFormulaChartSamples(input: {
  runtime: FormulaRuntimeService;
  target: FormulaTarget | null;
  variable: string | null;
  expression: string;
  variables: readonly string[];
  baseValues: Readonly<Record<string, number>>;
  hasValidationError: boolean;
  isNonDeterministic: boolean;
}): FormulaChartPoint[] {
  if (
    !input.variable ||
    !input.expression.trim() ||
    input.hasValidationError ||
    input.isNonDeterministic
  ) {
    return [];
  }

  const start = input.variable.toLowerCase().includes('level') ? 1 : 0;
  const end = input.variable.toLowerCase().includes('level')
    ? Math.max(start + 11, Number(input.baseValues[input.variable] ?? 1) + 11)
    : Math.max(start + 11, Number(input.baseValues[input.variable] ?? 0) + 10);
  const points: FormulaChartPoint[] = [];

  for (let x = start; x <= end; x += 1) {
    const variables = normalizeBuildingUpgradeVariables(
      {
        ...input.baseValues,
        [input.variable]: x,
      },
      input.target?.key,
      input.variable,
    );
    const result = input.runtime.evaluate(input.expression, variables, input.variables);

    if (result.error || result.value === null) {
      return [];
    }

    points.push({ x, y: result.value });
  }

  return points;
}
