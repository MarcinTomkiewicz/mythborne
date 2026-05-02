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
  entityAssignments: [],
  blocks: [],
};

interface ScopeVariableCatalogItem {
  key: string;
  label: string;
  helperText: string;
  targetLabels: string[];
}

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
  readonly testerTargetId = signal('');
  readonly selectedTargetVariablesDraft = signal<FormulaVariableDefinition[]>([]);
  private readonly previewRerollTick = signal(0);
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
      const variable = this.unknownVariables()[0];
      const testerTarget = this.testerReferenceTarget();
      const availableVariables = this.testerVariables().join(', ') || 'none';
      const scopeVariable = this.scopeVariables().find((entry) => entry.key === variable);
      const availabilityHint =
        scopeVariable?.targetLabels.length
          ? ` Available in: ${scopeVariable.targetLabels.join(', ')}.`
          : '';

      return `Unknown variable: ${variable}. Tester target "${testerTarget?.label ?? 'none'}" allows: ${availableVariables}.${availabilityHint} Choose the correct tester target or add the variable to that target first.`;
    }

    return null;
  });
  readonly testerBaseContext = computed(() =>
    toFormulaVariableContext(this.previewVariableDefinitions())
  );
  readonly blocks = computed(() =>
    this.data().blocks.filter((block) => block.scopeKey === this.currentScope())
  );
  readonly scopeVariables = computed<ScopeVariableCatalogItem[]>(() => {
    const items = new Map<string, ScopeVariableCatalogItem>();

    for (const block of this.blocksFor('variables')) {
      items.set(block.token, {
        key: block.token,
        label: block.label,
        helperText: block.helperText ?? '',
        targetLabels: [],
      });
    }

    for (const target of this.targetsForCurrentScope()) {
      for (const key of target.allowedVariables) {
        const current = items.get(key);

        if (current) {
          current.targetLabels = [...current.targetLabels, target.label];
          continue;
        }

        items.set(key, {
          key,
          label: key,
          helperText: '',
          targetLabels: [target.label],
        });
      }
    }

    return Array.from(items.values()).sort((left, right) => left.label.localeCompare(right.label));
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
      this.effectiveTesterContext(),
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

    if (
      !variable ||
      !expression.trim() ||
      this.formulaValidationError() ||
      this.isFormulaNonDeterministic()
    ) {
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

  rerollPreview() {
    this.previewRerollTick.update((current) => current + 1);
  }

  getTesterValue(variable: string): number {
    return this.effectiveTesterContext()[variable] ?? 0;
  }

  selectTesterTarget(targetId: string) {
    this.testerTargetId.set(targetId);
    this.reconcileTesterContext();
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
    return this.functionGuideByKey(key);
  }

  functionGuideByKey(key: string): FormulaFunctionGuide | null {
    return this.functionGuides().find((guide) => guide.key === key) ?? null;
  }

  functionGuideTooltip(guide: FormulaFunctionGuide): string {
    return [
      `Human: ${guide.humanSyntax}`,
      guide.description,
      `Example: ${guide.example}`,
      `Meaning: ${guide.exampleHuman}`,
    ].join('\n');
  }

  variableTooltip(key: string, fallback = ''): string {
    const previewVariable =
      this.previewVariableDefinitions().find((variable) => variable.key === key) ?? null;
    const scopeVariable = this.scopeVariables().find((variable) => variable.key === key) ?? null;
    const testerTarget = this.testerReferenceTarget();
    const scopeLine = scopeVariable?.helperText || fallback;
    const availabilityLine =
      scopeVariable?.targetLabels.length
        ? `Available in: ${scopeVariable.targetLabels.join(', ')}`
        : null;
    const targetLine = testerTarget
      ? previewVariable
        ? `Tester target "${testerTarget.label}" default: ${previewVariable.defaultValue}`
        : `Tester target "${testerTarget.label}" does not expose this variable.`
      : null;

    return [scopeLine, availabilityLine, targetLine]
      .filter((line): line is string => !!line)
      .join('\n');
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
    this.syncTesterTargetSelection();
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
    this.syncTesterTargetSelection(draft.id ?? null);
    this.reconcileTesterContext();
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
