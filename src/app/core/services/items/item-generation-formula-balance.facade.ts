import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Observable, finalize, startWith } from 'rxjs';
import {
  BalanceFormula,
  EditableBalanceFormula,
  FormulaAdminData,
  FormulaTarget,
} from '../../domain/formula/formula.model';
import { ItemGenerationBalanceFormFactory } from '../../factories/forms/item-generation-balance-form.factory';
import { FormulaBalanceSelection } from '../../types/item-generation-formula-balance.types';
import { toFormulaChartState } from '../../utils/formula-chart';
import {
  toFormulaVariableDefinitions,
  toFormulaVariableKey,
  validateFormulaVariables,
} from '../../utils/formula-target';
import { getErrorMessage } from '../../utils/error-message';
import { FormulaService } from '../formula/formula';
import { FormulaRuntimeService } from '../progression/formula-runtime';
import { ToastService } from '../ui/toast';
import {
  buildScopeVariableCatalog,
  ScopeVariableCatalogItem,
} from './formula-target-variable-catalog';
import {
  effectiveFormulaTesterVariables,
  formulaTesterDefinitions,
  formulaTesterVariableKeys,
  reconcileFormulaTesterVariables,
  updateFormulaTesterVariable,
} from './formula-tester-variables';
import {
  buildFormulaChartSamples,
  preferredFormulaChartVariable,
} from './formula-chart-variables';
import {
  formulaValidationMessage,
  formulaVariableTooltip,
} from './formula-validation-messages';

const EMPTY_FORMULA_DATA: FormulaAdminData = {
  targets: [],
  formulas: [],
  assignments: [],
  entityAssignments: [],
  blocks: [],
};

@Injectable()
export class ItemGenerationFormulaBalanceFacade {
  private readonly destroyRef = inject(DestroyRef);
  private readonly formFactory = inject(ItemGenerationBalanceFormFactory);
  private readonly formulaService = inject(FormulaService);
  private readonly formulaRuntime = inject(FormulaRuntimeService);
  private readonly toast = inject(ToastService);

  readonly isSaving = signal(false);
  readonly data = signal<FormulaAdminData>(EMPTY_FORMULA_DATA);
  readonly testerVariableValues = signal<Record<string, number>>({});
  readonly testerTargetId = signal('');
  readonly selectedTargetVariablesDraft = signal<ReturnType<typeof toFormulaVariableDefinitions>>([]);
  private readonly selectedAssignmentTargetId = signal('');
  private readonly selectedAssignmentFormulaId = signal('');
  private readonly previewRerollTick = signal(0);
  readonly selectorForm = this.formFactory.createFormulaSelectorForm();
  readonly editorForm = this.formFactory.createFormulaEditorForm();
  readonly assignmentForm = this.formFactory.createFormulaAssignmentForm();
  readonly editorValue = toSignal(
    this.editorForm.valueChanges.pipe(startWith(this.editorForm.getRawValue())),
    { initialValue: this.editorForm.getRawValue() }
  );
  readonly selectedTarget = computed(
    () => this.data().targets.find((target) => target.id === this.selectedAssignmentTargetId()) ?? null
  );
  readonly selectedAssignedFormula = computed(
    () => this.data().formulas.find((formula) => formula.id === this.selectedAssignmentFormulaId()) ?? null
  );
  readonly selectedEditorFormula = computed(
    () => this.data().formulas.find((formula) => formula.id === this.selectorForm.controls.selectedId.value) ?? null
  );
  readonly availableScopes = computed(() =>
    Array.from(new Set(this.data().targets.map((target) => target.scopeKey)))
  );
  readonly currentScope = computed(() => this.editorValue().scopeKey ?? 'hero_progression');
  readonly formulasForSelectedTarget = computed(() => this.formulasFor(this.selectedTarget()));
  readonly targetsForCurrentScope = computed(() =>
    this.data().targets.filter((target) => target.scopeKey === this.currentScope())
  );
  readonly testerReferenceTarget = computed(
    () =>
      this.targetsForCurrentScope().find((target) => target.id === this.testerTargetId()) ?? null
  );
  readonly selectedTargetVariablesError = computed(() =>
    validateFormulaVariables(this.selectedTargetVariablesDraft())
  );
  readonly previewVariableDefinitions = computed(() =>
    formulaTesterDefinitions({
      selectedTarget: this.selectedTarget(),
      referenceTarget: this.testerReferenceTarget(),
      selectedTargetVariables: this.selectedTargetVariablesDraft(),
    })
  );
  readonly testerVariables = computed(() =>
    formulaTesterVariableKeys(this.previewVariableDefinitions())
  );
  readonly expressionVariables = computed(() =>
    this.formulaRuntime.getVariables(this.editorValue().expression ?? '')
  );
  readonly unknownVariables = computed(() =>
    this.formulaRuntime.getUnknownVariables(
      this.editorValue().expression ?? '',
      this.testerVariables()
    )
  );
  readonly formulaValidationError = computed(() => {
    return formulaValidationMessage({
      selectedTarget: this.selectedTarget(),
      testerTarget: this.testerReferenceTarget(),
      selectedVariablesError: this.selectedTargetVariablesError(),
      unknownVariables: this.unknownVariables(),
      testerVariables: this.testerVariables(),
      scopeVariables: this.scopeVariables(),
    });
  });
  readonly testerBaseVariables = computed(() =>
    reconcileFormulaTesterVariables({
      currentValues: {},
      definitions: this.previewVariableDefinitions(),
      targetKey: this.testerReferenceTarget()?.key,
    })
  );
  readonly blocks = computed(() =>
    this.data().blocks.filter((block) => block.scopeKey === this.currentScope())
  );
  readonly scopeVariables = computed<ScopeVariableCatalogItem[]>(() => {
    return buildScopeVariableCatalog({
      target: this.testerReferenceTarget(),
      variables: this.previewVariableDefinitions(),
      blocks: this.blocks().filter((block) => block.category === 'variables'),
    });
  });
  readonly preview = computed(() => {
    this.previewRerollTick();
    const validationError = this.formulaValidationError();

    if (validationError) {
      return {
        value: null,
        error: validationError,
      };
    }

    return this.formulaRuntime.evaluate(
      this.editorValue().expression ?? '',
      this.effectiveTesterVariables(),
      this.testerVariables()
    );
  });
  readonly humanExpression = computed(() =>
    this.formulaRuntime.humanizeExpression(this.editorValue().expression ?? '')
  );
  readonly isFormulaNonDeterministic = computed(() =>
    this.formulaRuntime.isNonDeterministic(this.editorValue().expression ?? '')
  );
  readonly functionGuides = computed(() => this.formulaRuntime.getFunctionGuides());
  readonly formulaTemplates = computed(() => this.formulaRuntime.getTemplateGuides());
  readonly chartVariable = computed(() => {
    return preferredFormulaChartVariable({
      variables: this.testerVariables(),
      targetKey: this.testerReferenceTarget()?.key,
    });
  });
  readonly templateVariable = computed(
    () => this.chartVariable() ?? this.testerVariables()[0] ?? 'currentLevel'
  );
  readonly chartSamples = computed(() => {
    return buildFormulaChartSamples({
      runtime: this.formulaRuntime,
      target: this.testerReferenceTarget(),
      variable: this.chartVariable(),
      expression: this.editorValue().expression ?? '',
      variables: this.testerVariables(),
      baseValues: this.effectiveTesterVariables(),
      hasValidationError: !!this.formulaValidationError(),
      isNonDeterministic: this.isFormulaNonDeterministic(),
    });
  });
  readonly chartState = computed(() => toFormulaChartState(this.chartSamples()));

  constructor() {
    this.selectorForm.controls.selectedId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => this.patchEditor(this.data().formulas.find((entry) => entry.id === id)));

    this.assignmentForm.controls.targetId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => {
        this.selectedAssignmentTargetId.set(id);
        this.applyTargetSelection(id);
      });

    this.assignmentForm.controls.formulaId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => this.selectedAssignmentFormulaId.set(id));
  }

  setData(data: FormulaAdminData, preferred?: FormulaBalanceSelection) {
    this.data.set(data);
    const target =
      data.targets.find((entry) => entry.key === preferred?.targetKey) ?? data.targets[0] ?? null;
    this.assignmentForm.controls.targetId.setValue(target?.id ?? '', { emitEvent: false });
    this.selectedAssignmentTargetId.set(target?.id ?? '');
    this.applyTargetSelection(target?.id ?? '');

    const formula =
      data.formulas.find((entry) => entry.key === preferred?.formulaKey) ??
      this.selectedAssignedFormula() ??
      this.formulasFor(target).find((entry) => entry.isEnabled) ??
      data.formulas[0];

    this.selectorForm.controls.selectedId.setValue(formula?.id ?? '', { emitEvent: false });
    this.patchEditor(formula, !!preferred?.formulaKey);
  }

  refresh(preferred?: FormulaBalanceSelection) {
    this.formulaService
      .refreshAdminData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.setData(data, preferred));
  }

  newFormula() {
    this.selectorForm.controls.selectedId.setValue('', { emitEvent: false });
    this.patchEditor(this.formFactory.createFormulaDraft(this.selectedTarget()?.scopeKey));
  }

  saveFormula() {
    const draft = this.currentDraft();

    if (this.preview().error) {
      this.toast.show('error', 'Formula invalid', this.preview().error ?? '');
      return;
    }

    this.save(
      () => this.formulaService.saveFormula(draft),
      'Formula saved',
      `${draft.label} was saved.`,
      { formulaKey: draft.key, targetKey: this.selectedTarget()?.key }
    );
  }

  saveSelectedTargetVariables() {
    const target = this.selectedTarget();
    const error = this.selectedTargetVariablesError();

    if (!target) {
      return;
    }

    if (error) {
      this.toast.show('error', 'Target variables invalid', error);
      return;
    }

    this.save(
      () => this.formulaService.saveTargetVariables(target.id, this.selectedTargetVariablesDraft()),
      'Target variables saved',
      `${target.label} variables were updated.`,
      { targetKey: target.key, formulaKey: this.currentFormulaKey() }
    );
  }

  deleteFormula() {
    const id = this.editorForm.controls.id.value;

    if (!id) {
      this.newFormula();
      return;
    }

    this.save(
      () => this.formulaService.deleteFormula(id),
      'Formula deleted',
      'The formula was deleted.',
      { targetKey: this.selectedTarget()?.key }
    );
  }

  applyAssignment() {
    const target = this.selectedTarget();
    const formula = this.selectedAssignedFormula();

    if (!target || !formula) {
      return;
    }

    this.save(
      () => this.formulaService.assignFormula(target.id, formula.id),
      'Formula applied',
      `${formula.label} is now assigned to ${target.label}.`,
      { formulaKey: this.currentDraft().key, targetKey: target.key }
    );
  }

  addSelectedTargetVariable() {
    this.selectedTargetVariablesDraft.update((variables) => [
      ...variables,
      { key: '', defaultValue: 0 },
    ]);
    this.reconcileTesterVariables();
  }

  removeSelectedTargetVariable(index: number) {
    this.selectedTargetVariablesDraft.update((variables) =>
      variables.filter((_, currentIndex) => currentIndex !== index)
    );
    this.reconcileTesterVariables();
  }

  updateSelectedTargetVariableKey(index: number, value: string) {
    const key = toFormulaVariableKey(value);
    this.selectedTargetVariablesDraft.update((variables) =>
      variables.map((variable, currentIndex) =>
        currentIndex === index ? { ...variable, key } : variable
      )
    );
    this.reconcileTesterVariables();
  }

  updateSelectedTargetVariableDefault(index: number, value: string) {
    const numericValue = Number(value);
    this.selectedTargetVariablesDraft.update((variables) =>
      variables.map((variable, currentIndex) =>
        currentIndex === index
          ? { ...variable, defaultValue: Number.isFinite(numericValue) ? numericValue : 0 }
          : variable
      )
    );
    this.reconcileTesterVariables();
  }

  updateTesterVariable(variable: string, value: string) {
    const numericValue = Number(value);
    const nextValue = Number.isFinite(numericValue) ? numericValue : 0;
    this.testerVariableValues.update((current) =>
      updateFormulaTesterVariable({
        currentValues: current,
        variable,
        value: nextValue,
        targetKey: this.testerReferenceTarget()?.key,
      }),
    );
  }

  rerollPreview() {
    this.previewRerollTick.update((current) => current + 1);
  }

  getTesterValue(variable: string): number {
    return this.effectiveTesterVariables()[variable] ?? 0;
  }

  selectTesterTarget(targetId: string) {
    this.testerTargetId.set(targetId);
    this.reconcileTesterVariables();
  }

  currentFormulaKey(): string {
    return this.currentDraft().key;
  }

  selectedTargetKey(): string | undefined {
    return this.selectedTarget()?.key;
  }

  variableTooltip(key: string, fallback = ''): string {
    return formulaVariableTooltip({
      key,
      fallback,
      previewVariables: this.previewVariableDefinitions(),
      scopeVariables: this.scopeVariables(),
      testerTarget: this.testerReferenceTarget(),
    });
  }

  private currentDraft(): EditableBalanceFormula {
    return this.formFactory.toFormula(this.editorForm);
  }

  private effectiveTesterVariables(): Record<string, number> {
    return effectiveFormulaTesterVariables({
      keys: this.testerVariables(),
      baseValues: this.testerBaseVariables(),
      currentValues: this.testerVariableValues(),
    });
  }

  private applyTargetSelection(targetId: string) {
    const target = this.data().targets.find((entry) => entry.id === targetId) ?? null;
    const assignedId = target
      ? this.data().assignments.find((entry) => entry.targetId === target.id)?.formulaId
      : null;
    const formulaId =
      this.data().formulas.find((entry) => entry.id === assignedId)?.id ??
      this.formulasFor(target).find((entry) => entry.isEnabled)?.id ??
      '';

    this.assignmentForm.controls.formulaId.setValue(formulaId, { emitEvent: false });
    this.selectedAssignmentFormulaId.set(formulaId);
    this.selectedTargetVariablesDraft.set(toFormulaVariableDefinitions(target));
    this.syncTesterTargetSelection();
    this.reconcileTesterVariables();
  }

  private formulasFor(target: FormulaTarget | null): BalanceFormula[] {
    return target
      ? this.data().formulas.filter((formula) => formula.scopeKey === target.scopeKey)
      : this.data().formulas;
  }

  private patchEditor(
    formula?: EditableBalanceFormula | BalanceFormula,
    syncTesterByFormula = true,
  ) {
    const draft = formula ?? this.formFactory.createFormulaDraft(this.selectedTarget()?.scopeKey);
    this.formFactory.patchFormula(this.editorForm, draft);
    this.syncTesterTargetSelection(syncTesterByFormula ? draft.id ?? null : null);
    this.reconcileTesterVariables();
  }

  private reconcileTesterVariables(variables = this.previewVariableDefinitions()) {
    this.testerVariableValues.set(
      reconcileFormulaTesterVariables({
        currentValues: this.testerVariableValues(),
        definitions: variables,
        targetKey: this.testerReferenceTarget()?.key,
      }),
    );
  }

  private syncTesterTargetSelection(preferredFormulaId: string | null = this.selectedEditorFormula()?.id ?? null) {
    const targets = this.targetsForCurrentScope();
    const assignedTarget =
      preferredFormulaId
        ? targets.find((target) =>
            this.data().assignments.some(
              (assignment) => assignment.targetId === target.id && assignment.formulaId === preferredFormulaId
            )
          ) ?? null
        : null;
    const current = targets.find((target) => target.id === this.testerTargetId());

    if (assignedTarget && current?.id === assignedTarget.id) {
      return;
    }

    if (!assignedTarget && current) {
      return;
    }

    const preferredTarget =
      assignedTarget ??
      (this.selectedTarget()?.scopeKey === this.currentScope()
        ? targets.find((target) => target.id === this.selectedTarget()?.id)
        : null) ??
      targets[0] ??
      null;

    this.testerTargetId.set(preferredTarget?.id ?? '');
  }

  private save(
    operation: () => Observable<void>,
    title: string,
    message: string,
    preferred?: FormulaBalanceSelection
  ) {
    this.isSaving.set(true);
    operation()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.toast.show('success', title, message);
          this.formulaService.clearCache();
          this.refresh(preferred);
        },
        error: (error: unknown) => {
          this.toast.show('error', 'Save failed', getErrorMessage(error, message));
        },
      });
  }
}
