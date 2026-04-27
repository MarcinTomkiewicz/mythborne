import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { FormulaService } from '../../../core/services/formula/formula';
import {
  BalanceFormula,
  EntityFormulaAssignment,
  FormulaAdminData,
  FormulaAssignment,
  FormulaBlock,
  FormulaTarget,
} from '../../../core/domain/formula/formula.model';
import { formatConfigJsonPreview } from '../../../core/utils/config-governance';
import { FORMULAS_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';

const EMPTY_FORMULA_DATA: FormulaAdminData = {
  targets: [],
  formulas: [],
  assignments: [],
  entityAssignments: [],
  blocks: [],
};

interface FormulaTargetInspectionRow {
  target: FormulaTarget;
  assignment: FormulaAssignment | null;
  formula: BalanceFormula | null;
}

interface EntityFormulaInspectionRow {
  assignment: EntityFormulaAssignment;
  target: FormulaTarget | null;
  formula: BalanceFormula | null;
}

@Component({
  selector: 'app-formulas-page',
  standalone: true,
  imports: [LoadingOverlay, AdminTagLinks],
  templateUrl: './formulas-page.html',
})
export class FormulasPage implements OnInit {
  private readonly formulaService = inject(FormulaService);

  readonly links = FORMULAS_PAGE_LINKS;
  readonly data = signal<FormulaAdminData>(EMPTY_FORMULA_DATA);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly formulaById = computed(
    () => new Map(this.data().formulas.map((formula) => [formula.id, formula])),
  );
  readonly targetById = computed(
    () => new Map(this.data().targets.map((target) => [target.id, target])),
  );
  readonly assignmentByTargetId = computed(
    () =>
      new Map(
        this.data().assignments.map((assignment) => [
          assignment.targetId,
          assignment,
        ]),
      ),
  );
  readonly targetRows = computed<FormulaTargetInspectionRow[]>(() =>
    this.data().targets.map((target) => {
      const assignment = this.assignmentByTargetId().get(target.id) ?? null;

      return {
        target,
        assignment,
        formula: assignment
          ? this.formulaById().get(assignment.formulaId) ?? null
          : null,
      };
    }),
  );
  readonly entityAssignmentRows = computed<EntityFormulaInspectionRow[]>(() =>
    this.data().entityAssignments.map((assignment) => ({
      assignment,
      target: this.targetById().get(assignment.targetId) ?? null,
      formula: this.formulaById().get(assignment.formulaId) ?? null,
    })),
  );
  readonly scopes = computed(() =>
    Array.from(
      new Set([
        ...this.data().targets.map((target) => target.scopeKey),
        ...this.data().formulas.map((formula) => formula.scopeKey),
        ...this.data().blocks.map((block) => block.scopeKey),
      ]),
    ).sort((left, right) => left.localeCompare(right)),
  );

  ngOnInit(): void {
    this.loadData();
  }

  contextPreview(target: FormulaTarget): string {
    return formatConfigJsonPreview(target.defaultTestContext);
  }

  blocksForScope(scopeKey: string): FormulaBlock[] {
    return this.data().blocks.filter((block) => block.scopeKey === scopeKey);
  }

  formulasForScope(scopeKey: string): BalanceFormula[] {
    return this.data().formulas.filter((formula) => formula.scopeKey === scopeKey);
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.formulaService
      .getAdminData()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.data.set(data),
        error: (error: unknown) =>
          this.error.set(
            error instanceof Error
              ? error.message
              : 'Failed to load formula governance data.',
          ),
      });
  }
}
