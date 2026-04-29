import { Component, computed, effect, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { startWith } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FormulaTargetAssignmentRow } from '../../../core/types/formula-admin-view.types';
import { toFormulaChartState } from '../../../core/utils/formula-chart';
import { FormulaRuntimeService } from '../../../core/services/progression/formula-runtime';
import { FormulaExpressionPreview } from '../balance/formula-expression-preview';

interface ImpactPreviewRow {
  input: number;
  value: number | null;
  error: string | null;
}

@Component({
  selector: 'app-formula-impact-calculator',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    FormulaExpressionPreview,
  ],
  templateUrl: './formula-impact-calculator.html',
})
export class FormulaImpactCalculator {
  private readonly formBuilder = inject(FormBuilder);
  private readonly formulaRuntime = inject(FormulaRuntimeService);

  readonly rows = input<readonly FormulaTargetAssignmentRow[]>([]);
  readonly form = this.formBuilder.nonNullable.group({
    targetId: '',
    sweepVariable: '',
    fromValue: 1,
    toValue: 12,
    context: new FormRecord<FormControl<number>>({}),
  });
  readonly formValue = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
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
      label: variable,
      value: variable,
    })),
  );
  readonly sweepVariable = computed(() => this.formValue().sweepVariable ?? '');
  readonly editableVariables = computed(() =>
    (this.selectedRow()?.target.allowedVariables ?? []).filter(
      (variable) => variable !== this.sweepVariable(),
    ),
  );
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
  readonly previewRows = computed<ImpactPreviewRow[]>(() => {
    const row = this.selectedRow();
    const formula = row?.formula ?? null;
    const sweepVariable = this.sweepVariable();
    const fromValue = this.toInteger(this.formValue().fromValue);
    const toValue = this.toInteger(this.formValue().toValue);

    if (!row || !formula || !sweepVariable || this.rangeError() || fromValue === null || toValue === null) {
      return [];
    }

    const baseContext = this.contextFromForm();
    const previewRows: ImpactPreviewRow[] = [];

    for (let value = fromValue; value <= toValue; value += 1) {
      const result = this.formulaRuntime.evaluate(
        formula.expression,
        {
          ...baseContext,
          [sweepVariable]: value,
        },
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
    toFormulaChartState(
      this.previewRows()
        .filter((row): row is ImpactPreviewRow & { value: number } => row.value !== null && row.error === null)
        .map((row) => ({ x: row.input, y: row.value })),
    ),
  );

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
      this.syncContextControls(row);
    });

    effect(() => {
      const variables = this.selectedRow()?.target.allowedVariables ?? [];
      const current = this.form.controls.sweepVariable.value;

      if (variables.length === 0 && current) {
        this.form.controls.sweepVariable.setValue('');
        return;
      }

      if (variables.length > 0 && !variables.includes(current)) {
        this.form.controls.sweepVariable.setValue(this.preferredSweepVariable(variables));
      }
    });
  }

  contextControl(variable: string): FormControl<number> {
    const control = this.form.controls.context.controls[variable];

    if (!control) {
      throw new Error(`Formula preview context control "${variable}" is not registered.`);
    }

    return control;
  }

  private preferredTargetId(): string | null {
    const preferred = this.rows().find((row) => {
      const key = row.target.key.toLowerCase();
      return row.formula?.isEnabled && (key.includes('building') || key.includes('stat'));
    });

    return preferred?.target.id ?? null;
  }

  private preferredSweepVariable(variables: readonly string[]): string {
    return (
      variables.find((variable) => variable === 'statLevel') ??
      variables.find((variable) => variable === 'level') ??
      variables.find((variable) => variable === 'heroLevel') ??
      variables[0] ??
      ''
    );
  }

  private syncContextControls(row: FormulaTargetAssignmentRow | null): void {
    const controls = this.form.controls.context;
    const variables = row?.target.allowedVariables ?? [];
    const defaults = row?.target.defaultTestContext ?? {};

    for (const key of Object.keys(controls.controls)) {
      if (!variables.includes(key)) {
        controls.removeControl(key as never);
      }
    }

    for (const variable of variables) {
      if (controls.controls[variable]) {
        continue;
      }

      controls.addControl(
        variable,
        new FormControl(Number(defaults[variable] ?? 0), { nonNullable: true }),
      );
    }
  }

  private contextFromForm(): Record<string, number> {
    return Object.entries(this.form.controls.context.controls).reduce(
      (acc, [key, control]) => {
        acc[key] = Number(control.value);
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  private toInteger(value: unknown): number | null {
    const normalized = Number(value);
    return Number.isFinite(normalized) ? Math.trunc(normalized) : null;
  }
}
