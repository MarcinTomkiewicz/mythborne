import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { FormulaService } from '../../../core/services/formula/formula';
import { FORMULAS_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import {
  EMPTY_FORMULA_ADMIN_DATA,
  EntityFormulaInspectionRow,
  FormulaScopeInspectionRow,
  FormulaTargetAssignmentRow,
} from '../../../core/types/formula-admin-view.types';
import { toFormulaTargetAssignmentRow } from '../../../core/utils/formula-assignment-view';
import { FormulaAssignmentViewer } from '../../components/formulas/formula-assignment-viewer';

@Component({
  selector: 'app-formulas-page',
  standalone: true,
  imports: [LoadingOverlay, AdminTagLinks, FormulaAssignmentViewer],
  templateUrl: './formulas-page.html',
})
export class FormulasPage implements OnInit {
  private readonly formulaService = inject(FormulaService);

  readonly links = FORMULAS_PAGE_LINKS;
  readonly data = signal(EMPTY_FORMULA_ADMIN_DATA);
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
  readonly targetRows = computed<FormulaTargetAssignmentRow[]>(() =>
    this.data().targets.map((target) => {
      const assignment = this.assignmentByTargetId().get(target.id) ?? null;
      const formula = assignment
        ? this.formulaById().get(assignment.formulaId) ?? null
        : null;
      return toFormulaTargetAssignmentRow(target, assignment, formula);
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
  readonly formulasByScope = computed(() =>
    this.groupByScope(this.data().formulas),
  );
  readonly blocksByScope = computed(() => this.groupByScope(this.data().blocks));
  readonly scopeRows = computed<FormulaScopeInspectionRow[]>(() =>
    this.scopes().map((scopeKey) => ({
      scopeKey,
      formulas: this.formulasByScope().get(scopeKey) ?? [],
      blocks: this.blocksByScope().get(scopeKey) ?? [],
    })),
  );

  ngOnInit(): void {
    this.loadData();
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

  private groupByScope<T extends { scopeKey: string }>(
    entries: readonly T[],
  ): Map<string, T[]> {
    return entries.reduce((acc, entry) => {
      acc.set(entry.scopeKey, [...(acc.get(entry.scopeKey) ?? []), entry]);
      return acc;
    }, new Map<string, T[]>());
  }
}
