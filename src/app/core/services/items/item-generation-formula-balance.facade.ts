import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Observable, finalize, startWith } from 'rxjs';
import {
  BalanceFormula,
  EditableBalanceFormula,
  FormulaAdminData,
  FormulaBlock,
  FormulaFunctionGuide,
  FormulaTarget,
  FormulaTemplateGuide,
  FormulaVariableDefinition,
} from '../../domain/formula/formula.model';
import { ItemGenerationBalanceFormFactory } from '../../factories/forms/item-generation-balance-form.factory';
import { FormulaBalanceSelection } from '../../types/item-generation-formula-balance.types';
import { toFormulaChartState } from '../../utils/formula-chart';
import {
  toFormulaVariableContext,
  toFormulaVariableDefinitions,
  toFormulaVariableKey,
  validateFormulaVariables,
} from '../../utils/formula-target';
import { getErrorMessage } from '../../utils/error-message';
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
  readonly selectedTargetVariablesDraft = signal<FormulaVariableDefinition[]>([]);
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

  readonly selectedTarget = computed(
    () => this.data().targets.find((target) => target.id === this.assignmentValue().targetId) ?? null
  );
  readonly selectedAssignedFormula = computed(
    () => this.data().formulas.find((formula) => formula.id === this.assignmentValue().formulaId) ?? null
  );
  readonly availableScopes = computed(() =>
    Array.from(new Set(this.data().targets.map((target) => target.scopeKey)))
  );
  readonly currentScope = computed(() => this.editorValue().scopeKey ?? 'hero_progression');
  readonly formulasForSelectedTarget = computed(() => this.formulasFor(this.selectedTarget()));
  readonly testerReferenceTarget = computed(
    () =>
      this.selectedTarget()?.scopeKey === this.currentScope()
        ? this.selectedTarget()
        : this.data().targets.find((target) => target.scopeKey === this.currentScope()) ?? null
  );
  readonly selectedTargetVariablesError = computed(() =>
    validateFormulaVariables(this.selectedTargetVariablesDraft())
  );
  readonly previewVariableDefinitions = computed(() => {
    const referenceTarget = this.testerReferenceTarget();

    if (!referenceTarget) {
      return [];
    }

    return this.selectedTarget()?.id === referenceTarget.id
      ? this.selectedTargetVariablesDraft()
      : toFormulaVariableDefinitions(referenceTarget);
  });
  readonly testerVariables = computed(() =>
    this.previewVariableDefinitions().map((variable) => variable.key).filter((variable) => !!variable)
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
    if (this.selectedTarget()?.id === this.testerReferenceTarget()?.id && this.selectedTargetVariablesError()) {
      return this.selectedTargetVariablesError();
    }

    if (this.unknownVariables().length > 0) {
      return `Unknown variable: ${this.unknownVariables()[0]}. Add it to the target variables first.`;
    }

    return null;
  });
  readonly testerBaseContext = computed(() =>
    toFormulaVariableContext(this.previewVariableDefinitions())
  );
  readonly blocks = computed(() =>
    this.data().blocks.filter((block) => block.scopeKey === this.currentScope())
  );
  readonly preview = computed(() => {
    const validationError = this.formulaValidationError();

    if (validationError) {
      return {
        value: null,
        error: validationError,
      };
    }

    return this.formulaRuntime.evaluate(
      this.editorValue().expression ?? '',
      this.effectiveTesterContext(),
      this.testerVariables()
    );
  });
  readonly humanExpression = computed(() =>
    this.formulaRuntime.humanizeExpression(this.editorValue().expression ?? '')
  );
  readonly formulaTemplates = computed(() => this.formulaRuntime.getTemplateGuides());
  readonly chartVariable = computed(() => {
    const variables = this.testerVariables();
    return (
      variables.find((variable) => variable === 'statLevel') ??
      variables.find((variable) => variable === 'level') ??
      variables.find((variable) => variable === 'heroLevel') ??
      variables[0] ??
      null
    );
  });
  readonly templateVariable = computed(
    () => this.chartVariable() ?? this.testerVariables()[0] ?? 'level'
  );
  readonly chartSamples = computed(() => {
    const variable = this.chartVariable();
    const expression = this.editorValue().expression ?? '';

    if (!variable || !expression.trim() || this.formulaValidationError()) {
      return [];
    }

    const baseContext = this.effectiveTesterContext();
    const start = variable.toLowerCase().includes('level') ? 1 : 0;
    const end = variable.toLowerCase().includes('level')
      ? Math.max(start + 11, Number(baseContext[variable] ?? 1) + 11)
      : Math.max(start + 11, Number(baseContext[variable] ?? 0) + 10);
    const points: Array<{ x: number; y: number }> = [];

    for (let x = start; x <= end; x += 1) {
      const result = this.formulaRuntime.evaluate(
        expression,
        {
          ...baseContext,
          [variable]: x,
        },
        this.testerVariables()
      );

      if (result.error || result.value === null) {
        return [];
      }

      points.push({ x, y: result.value });
    }

    return points;
  });
  readonly chartState = computed(() => toFormulaChartState(this.chartSamples()));

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
    this.reconcileTesterContext();
  }

  removeSelectedTargetVariable(index: number) {
    this.selectedTargetVariablesDraft.update((variables) =>
      variables.filter((_, currentIndex) => currentIndex !== index)
    );
    this.reconcileTesterContext();
  }

  updateSelectedTargetVariableKey(index: number, value: string) {
    const key = toFormulaVariableKey(value);
    this.selectedTargetVariablesDraft.update((variables) =>
      variables.map((variable, currentIndex) =>
        currentIndex === index ? { ...variable, key } : variable
      )
    );
    this.reconcileTesterContext();
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
    this.reconcileTesterContext();
  }

  updateTesterContext(variable: string, value: string) {
    const numericValue = Number(value);
    this.testerContext.update((current) => ({
      ...current,
      [variable]: Number.isFinite(numericValue) ? numericValue : 0,
    }));
  }

  getTesterValue(variable: string): number {
    return this.effectiveTesterContext()[variable] ?? 0;
  }

  blocksFor(category: string): FormulaBlock[] {
    return this.blocks().filter((block) => block.category === category);
  }

  appendBlock(token: string) {
    const currentValue = this.editorForm.controls.expression.value ?? '';
    this.editorForm.controls.expression.setValue(`${currentValue}${token}`.trim());
  }

  appendBlockTemplate(block: FormulaBlock) {
    const guide = this.functionGuide(block);
    this.appendBlock(guide?.insertTemplate ?? block.token);
  }

  applyTemplate(template: FormulaTemplateGuide) {
    this.editorForm.controls.expression.setValue(this.resolveTemplateExpression(template));
  }

  blockTooltip(block: FormulaBlock): string {
    const guide = this.functionGuide(block);
    const parts = [
      guide?.humanSyntax ? `Human: ${guide.humanSyntax}` : null,
      guide?.description ?? null,
      guide?.example ? `Example: ${guide.example}` : null,
      guide?.exampleHuman ? `Meaning: ${guide.exampleHuman}` : null,
      !guide ? block.helperText : null,
    ].filter((part): part is string => !!part);

    return parts.join('\n');
  }

  templateTooltip(template: FormulaTemplateGuide): string {
    return [
      `Expression: ${this.resolveTemplateExpression(template)}`,
      `Human: ${this.resolveTemplateHuman(template)}`,
      template.summary,
      `Effect: ${template.effect}`,
      'Click to replace the current expression with this template.',
    ].join('\n');
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

  functionGuide(block: FormulaBlock): FormulaFunctionGuide | null {
    const key = block.token.replace(/\(.*/, '');
    return this.formulaRuntime.getFunctionGuides().find((guide) => guide.key === key) ?? null;
  }

  resolveTemplateExpression(template: FormulaTemplateGuide): string {
    return template.expressionTemplate.replaceAll('{{x}}', this.templateVariable());
  }

  resolveTemplateHuman(template: FormulaTemplateGuide): string {
    return template.humanTemplate.replaceAll('{{x}}', this.templateVariable());
  }

  private currentDraft(): EditableBalanceFormula {
    return this.formFactory.toFormula(this.editorForm);
  }

  private effectiveTesterContext(): Record<string, number> {
    const baseContext = this.testerBaseContext();
    const currentContext = this.testerContext();

    return this.testerVariables().reduce(
      (acc, key) => {
        acc[key] = Number(currentContext[key] ?? baseContext[key] ?? 0);
        return acc;
      },
      {} as Record<string, number>
    );
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
    this.selectedTargetVariablesDraft.set(toFormulaVariableDefinitions(target));
    this.reconcileTesterContext();
  }

  private formulasFor(target: FormulaTarget | null): BalanceFormula[] {
    return target
      ? this.data().formulas.filter((formula) => formula.scopeKey === target.scopeKey)
      : this.data().formulas;
  }

  private patchEditor(formula?: EditableBalanceFormula | BalanceFormula) {
    const draft = formula ?? this.formFactory.createFormulaDraft(this.selectedTarget()?.scopeKey);
    this.formFactory.patchFormula(this.editorForm, draft);
    this.reconcileTesterContext(
      toFormulaVariableDefinitions(
        this.data().targets.find((target) => target.scopeKey === draft.scopeKey) ?? null
      )
    );
  }

  private reconcileTesterContext(variables = this.previewVariableDefinitions()) {
    const current = this.testerContext();

    this.testerContext.set(
      variables.reduce(
        (acc, variable) => {
          acc[variable.key] = Number(current[variable.key] ?? variable.defaultValue ?? 0);
          return acc;
        },
        {} as Record<string, number>
      )
    );
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
