import { inject, Injectable } from '@angular/core';
import { from, map, Observable, shareReplay } from 'rxjs';
import {
  BalanceFormula,
  EditableBalanceFormula,
  FormulaAdminData,
  FormulaAssignment,
  FormulaTarget,
} from '../../domain/formula/formula.model';
import { SupabaseClientService } from '../supabase/supabase-client';

@Injectable({ providedIn: 'root' })
export class FormulaService {
  private readonly supabase = inject(SupabaseClientService).client;

  private adminData$?: Observable<FormulaAdminData>;

  getAdminData(): Observable<FormulaAdminData> {
    if (!this.adminData$) {
      this.adminData$ = from(
        Promise.all([
          this.supabase
            .from('balance_formula_targets')
            .select('*')
            .order('sort_order', { ascending: true }),
          this.supabase
            .from('balance_formulas')
            .select('*')
            .order('scope_key', { ascending: true })
            .order('label', { ascending: true }),
          this.supabase
            .from('balance_formula_assignments')
            .select('*')
            .order('created_at', { ascending: true }),
        ])
      ).pipe(
        map(([targetsResult, formulasResult, assignmentsResult]) => {
          if (targetsResult.error) {
            throw targetsResult.error;
          }

          if (formulasResult.error) {
            throw formulasResult.error;
          }

          if (assignmentsResult.error) {
            throw assignmentsResult.error;
          }

          return {
            targets: (targetsResult.data ?? []).map((row) => this.mapTarget(row)),
            formulas: (formulasResult.data ?? []).map((row) => this.mapFormula(row)),
            assignments: (assignmentsResult.data ?? []).map((row) =>
              this.mapAssignment(row)
            ),
          };
        }),
        shareReplay(1)
      );
    }

    return this.adminData$;
  }

  clearCache() {
    this.adminData$ = undefined;
  }

  getAssignedFormula(targetKey: string): Observable<{
    target: FormulaTarget;
    formula: BalanceFormula;
  }> {
    return this.getAdminData().pipe(
      map((data) => {
        const target = data.targets.find((entry) => entry.key === targetKey);

        if (!target) {
          throw new Error(`Formula target "${targetKey}" is not defined in Supabase.`);
        }

        const assignment = data.assignments.find((entry) => entry.targetId === target.id);

        if (!assignment) {
          throw new Error(`Formula target "${target.label}" has no assigned formula.`);
        }

        const formula = data.formulas.find(
          (entry) => entry.id === assignment.formulaId && entry.isEnabled
        );

        if (!formula) {
          throw new Error(`Assigned formula for "${target.label}" is missing or disabled.`);
        }

        return {
          target,
          formula,
        };
      })
    );
  }

  saveFormula(draft: EditableBalanceFormula): Observable<void> {
    return from(this.saveFormulaInternal(draft));
  }

  deleteFormula(id: string): Observable<void> {
    return from(this.deleteFormulaInternal(id));
  }

  assignFormula(targetId: string, formulaId: string): Observable<void> {
    return from(this.assignFormulaInternal(targetId, formulaId));
  }

  private async saveFormulaInternal(draft: EditableBalanceFormula): Promise<void> {
    const payload = {
      key: draft.key.trim(),
      scope_key: draft.scopeKey.trim(),
      label: draft.label.trim(),
      expression: draft.expression.trim(),
      description: draft.description.trim() || null,
      is_enabled: draft.isEnabled,
      updated_at: new Date().toISOString(),
    };

    if (draft.id) {
      const { data, error } = await this.supabase
        .from('balance_formulas')
        .update(payload)
        .eq('id', draft.id)
        .select('id')
        .single();

      if (error || !data) {
        throw error ?? new Error('Formula update did not affect any row.');
      }
    } else {
      const { data, error } = await this.supabase
        .from('balance_formulas')
        .insert(payload)
        .select('id')
        .single();

      if (error || !data) {
        throw error ?? new Error('Formula insert failed.');
      }
    }

    this.clearCache();
  }

  private async deleteFormulaInternal(id: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('balance_formulas')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    if (error || !data) {
      throw error ?? new Error('Formula delete did not affect any row.');
    }

    this.clearCache();
  }

  private async assignFormulaInternal(targetId: string, formulaId: string): Promise<void> {
    const now = new Date().toISOString();
    const { data: existing, error: existingError } = await this.supabase
      .from('balance_formula_assignments')
      .select('id')
      .eq('target_id', targetId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing?.id) {
      const { data, error } = await this.supabase
        .from('balance_formula_assignments')
        .update({
          formula_id: formulaId,
          updated_at: now,
        })
        .eq('id', existing.id)
        .select('id')
        .single();

      if (error || !data) {
        throw error ?? new Error('Formula assignment update did not affect any row.');
      }
    } else {
      const { data, error } = await this.supabase
        .from('balance_formula_assignments')
        .insert({
          target_id: targetId,
          formula_id: formulaId,
          updated_at: now,
        })
        .select('id')
        .single();

      if (error || !data) {
        throw error ?? new Error('Formula assignment insert failed.');
      }
    }

    this.clearCache();
  }

  private mapTarget(row: {
    id: string;
    key: string;
    scope_key: string;
    label: string;
    description: string | null;
    allowed_variables: string[] | null;
    default_test_context: unknown;
    sort_order: number;
    created_at: string | null;
  }): FormulaTarget {
    return {
      id: row.id,
      key: row.key,
      scopeKey: row.scope_key,
      label: row.label,
      description: row.description,
      allowedVariables: row.allowed_variables ?? [],
      defaultTestContext: this.normalizeContext(row.default_test_context),
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    };
  }

  private mapFormula(row: {
    id: string;
    key: string;
    scope_key: string;
    label: string;
    expression: string;
    description: string | null;
    is_enabled: boolean;
    created_at: string | null;
    updated_at: string | null;
  }): BalanceFormula {
    return {
      id: row.id,
      key: row.key,
      scopeKey: row.scope_key,
      label: row.label,
      expression: row.expression,
      description: row.description,
      isEnabled: row.is_enabled,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapAssignment(row: {
    id: string;
    target_id: string;
    formula_id: string;
    created_at: string | null;
    updated_at: string | null;
  }): FormulaAssignment {
    return {
      id: row.id,
      targetId: row.target_id,
      formulaId: row.formula_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private normalizeContext(value: unknown): Record<string, number> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    return Object.entries(value as Record<string, unknown>).reduce(
      (acc, [key, rawValue]) => {
        const normalized = Number(rawValue);

        if (Number.isFinite(normalized)) {
          acc[key] = normalized;
        }

        return acc;
      },
      {} as Record<string, number>
    );
  }
}
