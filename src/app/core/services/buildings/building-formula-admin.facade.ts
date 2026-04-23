import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, forkJoin, take } from 'rxjs';
import { FormulaAdminData, FormulaTarget } from '../../domain/formula/formula.model';
import {
  BUILDING_PROGRESSION_TARGET_KEYS,
  BuildingProgressionRules,
} from '../../domain/progression/building-progression.model';
import { BuildingAdminFormFactory } from '../../factories/forms/building-admin-form.factory';
import { getErrorMessage } from '../../utils/error-message';
import { FormulaService } from '../formula/formula';
import { BuildingProgressionService } from '../progression/building-progression';
import { ToastService } from '../ui/toast';

const EMPTY_FORMULA_DATA: FormulaAdminData = {
  targets: [],
  formulas: [],
  assignments: [],
  blocks: [],
};

@Injectable()
export class BuildingFormulaAdminFacade {
  private readonly formulaService = inject(FormulaService);
  private readonly progression = inject(BuildingProgressionService);
  private readonly formFactory = inject(BuildingAdminFormFactory);
  private readonly toast = inject(ToastService);

  readonly isSaving = signal(false);
  readonly data = signal<FormulaAdminData>(EMPTY_FORMULA_DATA);
  readonly assignmentForm = this.formFactory.createFormulaAssignmentForm();

  readonly targets = computed(() => {
    const keys = Object.values(BUILDING_PROGRESSION_TARGET_KEYS);
    return keys
      .map((key) => this.data().targets.find((target) => target.key === key) ?? null)
      .filter((target): target is FormulaTarget => target !== null);
  });

  readonly formulas = computed(() =>
    this.data().formulas.filter((formula) => formula.scopeKey === 'building_balance')
  );

  readonly rules = computed<BuildingProgressionRules>(() => {
    const value = this.assignmentForm.getRawValue();
    const expressionFor = (targetKey: string) =>
      this.data().formulas.find(
        (formula) =>
          formula.id === value[this.formFactory.toFormulaControlName(targetKey)]
      )?.expression ?? '';

    return {
      costExpression: expressionFor(BUILDING_PROGRESSION_TARGET_KEYS.upgradeCost),
      timeExpression: expressionFor(BUILDING_PROGRESSION_TARGET_KEYS.upgradeTime),
      bonusExpression: expressionFor(BUILDING_PROGRESSION_TARGET_KEYS.bonusGrowth),
    };
  });

  setData(data: FormulaAdminData) {
    this.data.set(data);
    this.assignmentForm.patchValue(
      Object.fromEntries(
        Object.values(BUILDING_PROGRESSION_TARGET_KEYS).map((key) => [
          this.formFactory.toFormulaControlName(key),
          this.findAssignedFormulaId(data, key),
        ])
      ),
      { emitEvent: false }
    );
  }

  refresh() {
    this.formulaService
      .refreshAdminData()
      .pipe(take(1))
      .subscribe((data) => this.setData(data));
  }

  applyAssignments() {
    const operations = this.targets()
      .map((target) => {
        const formulaId =
          this.assignmentForm.controls[this.toControlName(target.key)].value;
        return formulaId ? this.formulaService.assignFormula(target.id, formulaId) : null;
      })
      .filter((operation): operation is Observable<void> => operation !== null);

    if (operations.length === 0) {
      return;
    }

    this.isSaving.set(true);
    forkJoin(operations)
      .pipe(
        take(1),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.progression.clearCache();
          this.toast.show('success', 'Formulas applied', 'Building formulas were updated.');
          this.refresh();
        },
        error: (error: unknown) => {
          this.toast.show(
            'error',
            'Assignment failed',
            getErrorMessage(error, 'Failed to assign building formulas.')
          );
        },
      });
  }

  formulasFor(targetKey: string) {
    const target = this.data().targets.find((entry) => entry.key === targetKey);
    return target
      ? this.formulas().filter((formula) => formula.scopeKey === target.scopeKey)
      : [];
  }

  toControlName(targetKey: string) {
    return this.formFactory.toFormulaControlName(targetKey);
  }

  private findAssignedFormulaId(data: FormulaAdminData, targetKey: string): string {
    const target = data.targets.find((entry) => entry.key === targetKey);
    const assignment = target
      ? data.assignments.find((entry) => entry.targetId === target.id)
      : null;

    return assignment?.formulaId ?? '';
  }
}
