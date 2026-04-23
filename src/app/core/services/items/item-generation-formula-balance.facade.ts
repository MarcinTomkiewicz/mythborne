import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Observable, finalize, startWith, take } from 'rxjs';
import {
  BalanceFormula,
  EditableBalanceFormula,
  FormulaAdminData,
  FormulaBlock,
  FormulaTarget,
} from '../../domain/formula/formula.model';
import { ItemGenerationBalanceFormFactory } from '../../factories/forms/item-generation-balance-form.factory';
import { getErrorMessage } from '../../utils/error-message';
import { FormulaBalanceSelection } from '../../types/item-generation-formula-balance.types';
import { FormulaService } from '../formula/formula';
import { FormulaRuntimeService } from '../progression/formula-runtime';
import { ToastService } from '../ui/toast';

const EMPTY_FORMULA_DATA: FormulaAdminData = {
  targets: [],
  formulas: [],
  assignments: [],
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
  readonly testerContext = signal<Record<string, number>>({});
  readonly selectorForm = this.formFactory.createFormulaSelectorForm();
  readonly editorForm = this.formFactory.createFormulaEditorForm();
  readonly assignmentForm = this.formFactory.createFormulaAssignmentForm();
  readonly editorValue = toSignal(
    this.editorForm.valueChanges.pipe(startWith(this.editorForm.getRawValue())),
    { initialValue: this.editorForm.getRawValue() }
  );
  readonly assignmentValue = toSignal(
    this.assignmentForm.valueChanges.pipe(startWith(this.assignmentForm.getRawValue())),
    { initialValue: this.assignmentForm.getRawValue() }
  );

  readonly selectedTarget = computed(() =>
    this.data().targets.find((target) => target.id === this.assignmentValue().targetId) ?? null
  );
  readonly selectedAssignedFormula = computed(() =>
    this.data().formulas.find((formula) => formula.id === this.assignmentValue().formulaId) ?? null
  );
  readonly availableScopes = computed(() =>
    Array.from(new Set(this.data().targets.map((target) => target.scopeKey)))
  );
  readonly currentScope = computed(() => this.editorValue().scopeKey ?? 'hero_progression');
  readonly formulasForSelectedTarget = computed(() => this.formulasFor(this.selectedTarget()));
  readonly testerReferenceTarget = computed(
    () =>
      this.selectedTarget() ??
      this.data().targets.find((target) => target.scopeKey === this.currentScope()) ??
      null
  );
  readonly testerVariables = computed(() => {
    const expressionVariables = this.formulaRuntime.getVariables(
      this.editorValue().expression ?? ''
    );
    return Array.from(
      new Set([
        ...(this.testerReferenceTarget()?.allowedVariables ?? []),
        ...expressionVariables,
      ])
    );
  });
  readonly blocks = computed(() =>
    this.data().blocks.filter((block) => block.scopeKey === this.currentScope())
  );
  readonly blockCategories = computed(() =>
    Array.from(new Set(this.blocks().map((block) => block.category)))
  );
  readonly preview = computed(() => {
    const target = this.testerReferenceTarget();
    const context = this.testerVariables().reduce((acc, variable) => {
      const fallback = Number(target?.defaultTestContext?.[variable] ?? 0);
      acc[variable] = Number(this.testerContext()[variable] ?? fallback);
      return acc;
    }, {} as Record<string, number>);

    return this.formulaRuntime.evaluate(this.editorValue().expression ?? '', context);
  });

  constructor() {
    this.selectorForm.controls.selectedId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => this.patchEditor(this.data().formulas.find((entry) => entry.id === id)));

    this.assignmentForm.controls.targetId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => this.applyTargetSelection(id));
  }

  setData(data: FormulaAdminData, preferred?: FormulaBalanceSelection) {
    this.data.set(data);
    const target =
      data.targets.find((entry) => entry.key === preferred?.targetKey) ?? data.targets[0] ?? null;
    this.assignmentForm.controls.targetId.setValue(target?.id ?? '', { emitEvent: false });
    this.applyTargetSelection(target?.id ?? '');

    const formula =
      data.formulas.find((entry) => entry.key === preferred?.formulaKey) ??
      this.selectedAssignedFormula() ??
      this.formulasFor(target).find((entry) => entry.isEnabled) ??
      data.formulas[0];

    this.selectorForm.controls.selectedId.setValue(formula?.id ?? '', { emitEvent: false });
    this.patchEditor(formula);
  }

  refresh(preferred?: FormulaBalanceSelection) {
    this.formulaService
      .refreshAdminData()
      .pipe(take(1))
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

  updateTesterContext(variable: string, value: string) {
    const numericValue = Number(value);
    this.testerContext.update((current) => ({
      ...current,
      [variable]: Number.isFinite(numericValue) ? numericValue : 0,
    }));
  }

  getTesterValue(variable: string): number {
    const fallback = Number(this.testerReferenceTarget()?.defaultTestContext?.[variable] ?? 0);
    return this.testerContext()[variable] ?? fallback;
  }

  blocksFor(category: string): FormulaBlock[] {
    return this.blocks().filter((block) => block.category === category);
  }

  appendBlock(token: string) {
    const currentValue = this.editorForm.controls.expression.value ?? '';
    this.editorForm.controls.expression.setValue(`${currentValue}${token}`.trim());
  }

  humanizeScope(scopeKey: string): string {
    return scopeKey
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  currentFormulaKey(): string {
    return this.currentDraft().key;
  }

  selectedTargetKey(): string | undefined {
    return this.selectedTarget()?.key;
  }

  private currentDraft(): EditableBalanceFormula {
    return this.formFactory.toFormula(this.editorForm);
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
    this.testerContext.set({ ...(target?.defaultTestContext ?? {}) });
  }

  private formulasFor(target: FormulaTarget | null): BalanceFormula[] {
    return target
      ? this.data().formulas.filter((formula) => formula.scopeKey === target.scopeKey)
      : this.data().formulas;
  }

  private patchEditor(formula?: EditableBalanceFormula | BalanceFormula) {
    const draft = formula ?? this.formFactory.createFormulaDraft(this.selectedTarget()?.scopeKey);
    this.formFactory.patchFormula(this.editorForm, draft);
    this.testerContext.set({
      ...(this.data().targets.find((target) => target.scopeKey === draft.scopeKey)
        ?.defaultTestContext ?? {}),
    });
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
        take(1),
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
