import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { startWith, switchMap } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { FormulaTargetAssignmentRow } from '../../../core/types/formula-admin-view.types';
import { toFormulaChartState } from '../../../core/utils/formula-chart';
import { FormulaRuntimeService } from '../../../core/services/progression/formula-runtime';
import { FormulaExpressionPreview } from '../balance/formula-expression-preview';
import { FormulaVariableHelp, toFormulaVariableHelpKey } from '../../../core/services/formula/formula-variable-help';
import { isBuildingUpgradeFormulaTarget } from '../../../core/utils/building-upgrade-formula-variables';
import { normalizeBuildingUpgradeVariables } from '../../../core/services/items/formula-tester-variables';
import {
  buildingTargetLevelWarning,
  buildingUpgradeSummary,
  preferredBuildingSweepVariable,
} from './formula-impact-building-variables';
import {
  formulaVariableInteger,
  formulaVariablesFromControls,
  syncBuildingUpgradeVariableValues,
  syncFormulaVariableControls,
} from './formula-impact-variable-form';
import {
  formulaVariableDisplayText,
  formulaVariableHelpText,
} from '../../../core/utils/formula-variable-display';
import { EditableVariableView } from './formula-impact-calculator.model';

interface ImpactPreviewRow {
  input: number;
  value: number | null;
  error: string | null;
}

@Component({
  selector: 'app-formula-impact-calculator',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule, TooltipModule, FormulaExpressionPreview],
  templateUrl: './formula-impact-calculator.html',
})
export class FormulaImpactCalculator {
  private readonly formBuilder = inject(FormBuilder);
  private readonly formulaRuntime = inject(FormulaRuntimeService);
  private readonly formulaVariableHelp = inject(FormulaVariableHelp);
  private readonly previewRerollTick = signal(0);

  readonly rows = input<readonly FormulaTargetAssignmentRow[]>([]);
  readonly form = this.formBuilder.nonNullable.group({
    targetId: '',
    sweepVariable: '',
    fromValue: 1,
    toValue: 12,
    variables: new FormRecord<FormControl<number>>({}),
  });
  readonly formValue = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );
  readonly variableHelpByKey = toSignal(
    toObservable(this.rows).pipe(
      switchMap((rows) => this.formulaVariableHelp.getHelpByTargetVariable(rows)),
    ),
    { initialValue: new Map<string, string>() },
  );
  readonly targetOptions = computed(() =>
    this.rows()
      .filter((row) => row.formula?.isEnabled)
      .map((row) => ({
        label: `${row.target.label} (${row.target.key})`,
        value: row.target.id,
      })),
  );
  readonly selectedRow = computed(() => {
    const targetId = this.formValue().targetId;
    return this.rows().find((row) => row.target.id === targetId) ?? null;
  });
  readonly variableOptions = computed(() =>
    (this.selectedRow()?.target.allowedVariables ?? []).map((variable) => ({
      label: formulaVariableDisplayText(variable),
      value: variable,
    })),
  );
  readonly sweepVariable = computed(() => this.formValue().sweepVariable ?? '');
  readonly editableVariables = computed(() =>
    (this.selectedRow()?.target.allowedVariables ?? []).filter(
      (variable) =>
        variable !== this.sweepVariable() &&
        !(
          isBuildingUpgradeFormulaTarget(this.selectedRow()?.target.key) &&
          variable === 'targetLevel'
        ),
    ),
  );
  readonly editableVariableViews = computed<EditableVariableView[]>(() => {
    this.formValue();
    const targetKey = this.selectedRow()?.target.key ?? null;

    return this.editableVariables()
      .map((variable) => {
        const control = this.form.controls.variables.controls[variable] ?? null;

        return control
          ? {
              key: variable,
              control,
              label: this.variableDisplayText(variable),
              helpText: this.variableHelpText(variable, targetKey),
            }
          : null;
      })
      .filter((view): view is EditableVariableView => view !== null);
  });
  readonly derivedTargetLevel = computed(() => {
    this.formValue();

    if (!isBuildingUpgradeFormulaTarget(this.selectedRow()?.target.key)) {
      return null;
    }

    return this.variableInteger('targetLevel');
  });
  readonly rangeError = computed(() => {
    const fromValue = this.toInteger(this.formValue().fromValue);
    const toValue = this.toInteger(this.formValue().toValue);

    if (fromValue === null || toValue === null) {
      return 'Preview range requires numeric from/to values.';
    }

    if (fromValue > toValue) {
      return 'Preview range must start before it ends.';
    }

    if (toValue - fromValue > 50) {
      return 'Preview range is limited to 51 rows so the page stays readable.';
    }

    return null;
  });
  readonly humanExpression = computed(() =>
    this.formulaRuntime.humanizeExpression(this.selectedRow()?.formula?.expression ?? ''),
  );
  readonly isSelectedFormulaNonDeterministic = computed(() =>
    this.formulaRuntime.isNonDeterministic(this.selectedRow()?.formula?.expression ?? ''),
  );
  readonly previewRows = computed<ImpactPreviewRow[]>(() => {
    this.previewRerollTick();
    const row = this.selectedRow();
    const formula = row?.formula ?? null;
    const sweepVariable = this.sweepVariable();
    const fromValue = this.toInteger(this.formValue().fromValue);
    const toValue = this.toInteger(this.formValue().toValue);

    if (!row || !formula || !sweepVariable || this.rangeError() || fromValue === null || toValue === null) {
      return [];
    }

    const baseVariables = this.variablesFromForm();
    const previewRows: ImpactPreviewRow[] = [];

    for (let value = fromValue; value <= toValue; value += 1) {
      const result = this.formulaRuntime.evaluate(
        formula.expression,
        normalizeBuildingUpgradeVariables(
          {
            ...baseVariables,
            [sweepVariable]: value,
          },
          row.target.key,
          sweepVariable,
        ),
        row.target.allowedVariables,
      );

      previewRows.push({
        input: value,
        value: result.value,
        error: result.error,
      });
    }

    return previewRows;
  });
  readonly previewError = computed(() => {
    if (!this.selectedRow()) {
      return 'Select an enabled assigned formula target to preview impact.';
    }

    if (!this.sweepVariable()) {
      return 'Select a sweep variable for the preview range.';
    }

    return this.rangeError() ?? this.previewRows().find((row) => row.error)?.error ?? null;
  });
  readonly chartState = computed(() =>
    this.isSelectedFormulaNonDeterministic()
      ? toFormulaChartState([])
      : toFormulaChartState(
          this.previewRows()
            .filter((row): row is ImpactPreviewRow & { value: number } => row.value !== null && row.error === null)
            .map((row) => ({ x: row.input, y: row.value })),
        ),
  );
  readonly buildingTargetLevelWarning = computed(() => {
    this.formValue();
    const row = this.selectedRow();

    if (!isBuildingUpgradeFormulaTarget(row?.target.key)) {
      return null;
    }

    const currentLevel = this.variableInteger('currentLevel');
    const targetLevel = this.variableInteger('targetLevel');

    if (currentLevel === null || targetLevel === null) {
      return null;
    }

    return buildingTargetLevelWarning(currentLevel, targetLevel);
  });
  readonly outputSummary = computed(() => {
    this.formValue();
    const row = this.selectedRow();

    if (!isBuildingUpgradeFormulaTarget(row?.target.key)) {
      return `${this.sweepVariable()} ${this.formValue().fromValue} -> ${this.formValue().toValue}`;
    }

    const currentLevel = this.variableInteger('currentLevel');
    const targetLevel = this.variableInteger('targetLevel');

    if (currentLevel === null || targetLevel === null) {
      return `${this.sweepVariable()} ${this.formValue().fromValue} -> ${this.formValue().toValue}`;
    }

    return buildingUpgradeSummary(currentLevel, targetLevel)
      ?? `${this.sweepVariable()} ${this.formValue().fromValue} -> ${this.formValue().toValue}`;
  });

  constructor() {
    effect(() => {
      const options = this.targetOptions();
      const currentTargetId = this.form.controls.targetId.value;

      if (options.length > 0 && !options.some((option) => option.value === currentTargetId)) {
        this.form.controls.targetId.setValue(this.preferredTargetId() ?? options[0].value);
      }
    });

    effect(() => {
      const row = this.selectedRow();
      syncFormulaVariableControls(this.form.controls.variables, row);
    });

    effect(() => {
      this.formValue();
      syncBuildingUpgradeVariableValues(this.form.controls.variables, this.selectedRow());
    });

    effect(() => {
      const variables = this.selectedRow()?.target.allowedVariables ?? [];
      const current = this.form.controls.sweepVariable.value;
      const preferred = this.preferredSweepVariable(
        variables,
        this.selectedRow()?.target.key ?? null,
      );

      if (variables.length === 0 && current) {
        this.form.controls.sweepVariable.setValue('');
        return;
      }

      if (
        variables.length > 0 &&
        (!variables.includes(current) ||
          (
            isBuildingUpgradeFormulaTarget(this.selectedRow()?.target.key) &&
            current !== preferred
          ))
      ) {
        this.form.controls.sweepVariable.setValue(preferred);
      }
    });
  }

  variableDisplayText(variable: string): string {
    return formulaVariableDisplayText(variable);
  }

  rerollPreview(): void {
    this.previewRerollTick.update((current) => current + 1);
  }

  variableHelpText(
    variable: string,
    targetKey = this.selectedRow()?.target.key ?? null,
  ): string {
    return formulaVariableHelpText({
      variableKey: variable,
      metadataHelp: targetKey
        ? this.variableHelpByKey().get(toFormulaVariableHelpKey(targetKey, variable))
        : null,
      targetKey,
    });
  }

  private preferredTargetId(): string | null {
    const preferred = this.rows().find((row) => {
      const key = row.target.key.toLowerCase();
      return row.formula?.isEnabled && (key.includes('building') || key.includes('stat'));
    });

    return preferred?.target.id ?? null;
  }

  private preferredSweepVariable(
    variables: readonly string[],
    targetKey: string | null,
  ): string {
    const buildingVariable = preferredBuildingSweepVariable(variables, targetKey);

    return buildingVariable ?? (
      variables.find((variable) => variable === 'currentLevel') ??
      variables[0] ??
      ''
    );
  }

  private variablesFromForm(): Record<string, number> {
    return formulaVariablesFromControls(this.form.controls.variables);
  }

  private variableInteger(variable: string): number | null {
    return formulaVariableInteger(this.form.controls.variables, variable);
  }

  private toInteger(value: unknown): number | null {
    const normalized = Number(value);
    return Number.isFinite(normalized) ? Math.trunc(normalized) : null;
  }
}
