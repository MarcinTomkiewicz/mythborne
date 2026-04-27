import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import {
  BalanceFormula,
  BalanceFormulaRow,
  EditableBalanceFormula,
  EntityFormulaAssignmentRow,
  FormulaAssignmentResolution,
  FormulaVariableDefinition,
  FormulaAssignmentRow,
  FormulaAdminData,
  FormulaBlockRow,
  FormulaTargetRow,
  FormulaEntityAssignmentLookup,
} from '../../domain/formula/formula.model';
import { resolveAssignedFormula } from '../../utils/formula-assignment-resolution';
import {
  mapBalanceFormula,
  mapEntityFormulaAssignment,
  mapFormulaAssignment,
  mapFormulaBlock,
  mapFormulaTarget,
} from '../../utils/formula-admin-mappers';
import { trimText, trimToNull } from '../../utils/normalize-text';
import { FilterOperator } from '../../enums/filter-operators';
import { TABLES } from '../../constants/tables.const';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class FormulaService {
  private readonly backend = inject(Backend);
  private adminData$?: Observable<FormulaAdminData>;

  getAdminData(): Observable<FormulaAdminData> {
    if (!this.adminData$) {
      this.adminData$ = forkJoin({
        targets: this.backend.getAll<FormulaTargetRow>({
          table: TABLES.balance_formula_targets,
          orderBy: { column: 'sort_order' },
          camelCase: false,
        }),
        formulas: this.backend.getAll<BalanceFormulaRow>({
          table: TABLES.balance_formulas,
          orderBy: { column: 'scope_key' },
          camelCase: false,
        }),
        assignments: this.backend.getAll<FormulaAssignmentRow>({
          table: TABLES.balance_formula_assignments,
          orderBy: { column: 'created_at' },
          camelCase: false,
        }),
        entityAssignments: this.backend.getAll<EntityFormulaAssignmentRow>({
          table: TABLES.entity_formula_assignments,
          orderBy: { column: 'created_at' },
          camelCase: false,
        }),
        blocks: this.backend.getAll<FormulaBlockRow>({
          table: TABLES.balance_formula_blocks,
          orderBy: { column: 'scope_key' },
          camelCase: false,
        }),
      }).pipe(
        map(({ targets, formulas, assignments, entityAssignments, blocks }) => ({
          targets: targets.map(mapFormulaTarget),
          formulas: formulas.map(mapBalanceFormula),
          assignments: assignments.map(mapFormulaAssignment),
          entityAssignments: entityAssignments.map(mapEntityFormulaAssignment),
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

  getAssignedFormula(
    targetKey: string,
    entity?: FormulaEntityAssignmentLookup
  ): Observable<FormulaAssignmentResolution> {
    return this.getAdminData().pipe(
      map((data) => resolveAssignedFormula(data, targetKey, entity))
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
      ? this.backend.update(TABLES.balance_formulas, draft.id, payload)
      : this.backend.create(TABLES.balance_formulas, payload);

    return request$.pipe(
      map(() => void 0),
      tap(() => this.clearCache())
    );
  }

  saveTargetVariables(
    targetId: string,
    variables: readonly FormulaVariableDefinition[]
  ): Observable<void> {
    const allowedVariables = variables.map((variable) => variable.key);
    const defaultTestContext = variables.reduce(
      (acc, variable) => {
        acc[variable.key] = variable.defaultValue;
        return acc;
      },
      {} as Record<string, number>
    );

    return this.backend
      .update(TABLES.balance_formula_targets, targetId, {
        allowedVariables,
        defaultTestContext,
      })
      .pipe(
        map(() => void 0),
        tap(() => this.clearCache())
      );
  }

  deleteFormula(id: string): Observable<void> {
    return this.backend.delete(TABLES.balance_formulas, id).pipe(
      tap(() => this.clearCache())
    );
  }

  assignFormula(targetId: string, formulaId: string): Observable<void> {
    const updatedAt = new Date().toISOString();

    return this.backend
      .getOneByFields<{ id: string }>(TABLES.balance_formula_assignments, { targetId })
      .pipe(
      switchMap((existing) =>
        existing?.id
          ? this.backend.update(TABLES.balance_formula_assignments, existing.id, {
              formulaId,
              updatedAt,
            })
          : this.backend.create(TABLES.balance_formula_assignments, {
              targetId,
              formulaId,
              updatedAt,
            })
      ),
      map(() => void 0),
      tap(() => this.clearCache())
    );
  }

  assignFormulaToEntity(
    entityKind: string,
    entityId: string,
    targetId: string,
    formulaId: string | null
  ): Observable<void> {
    const updatedAt = new Date().toISOString();

    return this.backend
      .getAll<{ id: string }>({
        table: TABLES.entity_formula_assignments,
        filters: {
          entityKind: { value: entityKind, operator: FilterOperator.EQ },
          entityId: { value: entityId, operator: FilterOperator.EQ },
          targetId: { value: targetId, operator: FilterOperator.EQ },
        },
        range: { from: 0, to: 0 },
      })
      .pipe(
        switchMap((rows) => {
          const existing = rows[0] ?? null;

          if (!formulaId) {
            return existing
              ? this.backend.delete(TABLES.entity_formula_assignments, existing.id)
              : of(void 0);
          }

          return existing
            ? this.backend.update(TABLES.entity_formula_assignments, existing.id, {
                formulaId,
                updatedAt,
              })
            : this.backend.create(TABLES.entity_formula_assignments, {
                entityKind,
                entityId,
                targetId,
                formulaId,
                updatedAt,
              });
        }),
        map(() => void 0),
        tap(() => this.clearCache())
      );
  }
}
