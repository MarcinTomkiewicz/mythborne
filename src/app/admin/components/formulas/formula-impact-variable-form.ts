import { FormControl, FormRecord } from '@angular/forms';
import { FormulaTargetAssignmentRow } from '../../../core/types/formula-admin-view.types';
import {
  isBuildingUpgradeFormulaTarget,
} from '../../../core/utils/building-upgrade-formula-variables';
import { normalizeBuildingUpgradeVariables } from '../../../core/services/items/formula-tester-variables';

export type FormulaVariableControls = FormRecord<FormControl<number>>;

export function syncFormulaVariableControls(
  controls: FormulaVariableControls,
  row: FormulaTargetAssignmentRow | null,
): void {
  const variables = row?.target.allowedVariables ?? [];
  const defaults = row?.target.defaultTestContext ?? {};

  for (const key of Object.keys(controls.controls)) {
    if (!variables.includes(key)) {
      controls.removeControl(key as never);
    }
  }

  for (const variable of variables) {
    if (controls.controls[variable]) {
      controls.controls[variable].setValue(Number(defaults[variable] ?? 0));
      continue;
    }

    controls.addControl(
      variable,
      new FormControl(Number(defaults[variable] ?? 0), { nonNullable: true }),
    );
  }
}

export function syncBuildingUpgradeVariableValues(
  controls: FormulaVariableControls,
  row: FormulaTargetAssignmentRow | null,
): void {
  if (!row || !isBuildingUpgradeFormulaTarget(row.target.key)) {
    return;
  }

  const targetKey = row.target.key;
  const variables = normalizeBuildingUpgradeVariables(
    formulaVariablesFromControls(controls),
    targetKey,
  );
  const targetLevel = variables['targetLevel'];

  if (!Number.isFinite(targetLevel)) {
    return;
  }

  setFormulaVariableValue(controls, 'targetLevel', targetLevel);
}

export function formulaVariablesFromControls(
  controls: FormulaVariableControls,
): Record<string, number> {
  return Object.entries(controls.controls).reduce(
    (acc, [key, control]) => {
      acc[key] = Number(control.value);
      return acc;
    },
    {} as Record<string, number>,
  );
}

export function formulaVariableInteger(
  controls: FormulaVariableControls,
  variable: string,
): number | null {
  const control = controls.controls[variable];
  const normalized = Number(control?.value);
  return Number.isFinite(normalized) ? Math.trunc(normalized) : null;
}

function setFormulaVariableValue(
  controls: FormulaVariableControls,
  variable: string,
  value: number,
): void {
  const control = controls.controls[variable];

  if (control && formulaVariableInteger(controls, variable) !== value) {
    control.setValue(value);
  }
}
