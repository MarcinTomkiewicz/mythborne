import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, shareReplay, switchMap, tap } from 'rxjs';
import {
  BalanceFormula,
  EditableBalanceFormula,
  FormulaAdminData,
  FormulaTarget,
} from '../../domain/formula/formula.model';
import {
  mapBalanceFormula,
  mapFormulaAssignment,
  mapFormulaBlock,
  mapFormulaTarget,
} from '../../utils/formula-admin-mappers';
import { trimText, trimToNull } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class FormulaService {
  private readonly backend = inject(Backend);
  private adminData$?: Observable<FormulaAdminData>;

  getAdminData(): Observable<FormulaAdminData> {
    if (!this.adminData$) {
      this.adminData$ = forkJoin({
        targets: this.backend.getAll<any>({
          table: 'balance_formula_targets',
          orderBy: { column: 'sort_order' },
          camelCase: false,
        }),
        formulas: this.backend.getAll<any>({
          table: 'balance_formulas',
          orderBy: { column: 'scope_key' },
          camelCase: false,
        }),
        assignments: this.backend.getAll<any>({
          table: 'balance_formula_assignments',
          orderBy: { column: 'created_at' },
          camelCase: false,
        }),
        blocks: this.backend.getAll<any>({
          table: 'balance_formula_blocks',
          orderBy: { column: 'scope_key' },
          camelCase: false,
        }),
      }).pipe(
        map(({ targets, formulas, assignments, blocks }) => ({
          targets: targets.map(mapFormulaTarget),
          formulas: formulas.map(mapBalanceFormula),
          assignments: assignments.map(mapFormulaAssignment),
          blocks: blocks.map(mapFormulaBlock),
        })),
        shareReplay(1)
      );
    }

    return this.adminData$;
  }

  clearCache() {
    this.adminData$ = undefined;
  }

  refreshAdminData(): Observable<FormulaAdminData> {
    this.clearCache();
    return this.getAdminData();
  }

  getAssignedFormula(targetKey: string): Observable<{ target: FormulaTarget; formula: BalanceFormula }> {
    return this.getAdminData().pipe(
      map((data) => {
        const target = data.targets.find((entry) => entry.key === targetKey);

        if (!target) {
          throw new Error(`Formula target "${targetKey}" is not defined in Supabase.`);
        }

        const assignment = data.assignments.find((entry) => entry.targetId === target.id);
        const formula = data.formulas.find(
          (entry) => entry.id === assignment?.formulaId && entry.isEnabled
        );

        if (!assignment || !formula) {
          throw new Error(`Formula target "${target.label}" has no enabled assigned formula.`);
        }

        return { target, formula };
      })
    );
  }

  saveFormula(draft: EditableBalanceFormula): Observable<void> {
    const payload = {
      key: trimText(draft.key),
      scopeKey: trimText(draft.scopeKey),
      label: trimText(draft.label),
      expression: trimText(draft.expression),
      description: trimToNull(draft.description),
      isEnabled: draft.isEnabled,
      updatedAt: new Date().toISOString(),
    };
    const request$ = draft.id
      ? this.backend.update('balance_formulas', draft.id, payload)
      : this.backend.create('balance_formulas', payload);

    return request$.pipe(
      map(() => void 0),
      tap(() => this.clearCache())
    );
  }

  deleteFormula(id: string): Observable<void> {
    return this.backend.delete('balance_formulas', id).pipe(
      tap(() => this.clearCache())
    );
  }

  assignFormula(targetId: string, formulaId: string): Observable<void> {
    const updatedAt = new Date().toISOString();

    return this.backend
      .getOneByFields<{ id: string }>('balance_formula_assignments', { targetId })
      .pipe(
      switchMap((existing) =>
        existing?.id
          ? this.backend.update('balance_formula_assignments', existing.id, {
              formulaId,
              updatedAt,
            })
          : this.backend.create('balance_formula_assignments', {
              targetId,
              formulaId,
              updatedAt,
            })
      ),
      map(() => void 0),
      tap(() => this.clearCache())
    );
  }
}
