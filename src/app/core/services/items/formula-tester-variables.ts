import {
  FormulaTarget,
  FormulaVariableDefinition,
} from '../../domain/formula/formula.model';
import { toFormulaVariableDefinitions } from '../../utils/formula-target';
import {
  isBuildingUpgradeFormulaTarget,
  toStandardBuildingTargetLevel,
} from '../../utils/building-upgrade-formula-variables';

export function formulaTesterDefinitions(input: {
  selectedTarget: FormulaTarget | null;
  referenceTarget: FormulaTarget | null;
  selectedTargetVariables: readonly FormulaVariableDefinition[];
}): FormulaVariableDefinition[] {
  if (!input.referenceTarget) {
    return [];
  }

  return input.selectedTarget?.id === input.referenceTarget.id
    ? [...input.selectedTargetVariables]
    : toFormulaVariableDefinitions(input.referenceTarget);
}

export function formulaTesterVariableKeys(
  definitions: readonly FormulaVariableDefinition[],
): string[] {
  return definitions.map((variable) => variable.key).filter((variable) => !!variable);
}

export function reconcileFormulaTesterVariables(input: {
  currentValues: Readonly<Record<string, number>>;
  definitions: readonly FormulaVariableDefinition[];
  targetKey: string | null | undefined;
}): Record<string, number> {
  const values = input.definitions.reduce(
    (acc, variable) => {
      acc[variable.key] = Number(
        input.currentValues[variable.key] ?? variable.defaultValue ?? 0,
      );
      return acc;
    },
    {} as Record<string, number>,
  );

  return normalizeBuildingUpgradeVariables(values, input.targetKey);
}

export function updateFormulaTesterVariable(input: {
  currentValues: Readonly<Record<string, number>>;
  variable: string;
  value: number;
  targetKey: string | null | undefined;
}): Record<string, number> {
  return normalizeBuildingUpgradeVariables(
    {
      ...input.currentValues,
      [input.variable]: input.value,
    },
    input.targetKey,
    input.variable,
  );
}

export function effectiveFormulaTesterVariables(input: {
  keys: readonly string[];
  baseValues: Readonly<Record<string, number>>;
  currentValues: Readonly<Record<string, number>>;
}): Record<string, number> {
  return input.keys.reduce(
    (acc, key) => {
      acc[key] = Number(input.currentValues[key] ?? input.baseValues[key] ?? 0);
      return acc;
    },
    {} as Record<string, number>,
  );
}

export function normalizeBuildingUpgradeVariables(
  values: Readonly<Record<string, number>>,
  targetKey: string | null | undefined,
  changedVariable = 'currentLevel',
): Record<string, number> {
  if (!isBuildingUpgradeFormulaTarget(targetKey)) {
    return { ...values };
  }

  if (changedVariable === 'targetLevel' && Object.hasOwn(values, 'targetLevel')) {
    return {
      ...values,
      currentLevel: Math.max(0, Number(values['targetLevel']) - 1),
    };
  }

  if (!Object.hasOwn(values, 'currentLevel')) {
    return { ...values };
  }

  return {
    ...values,
    targetLevel: toStandardBuildingTargetLevel(Number(values['currentLevel'])),
  };
}
