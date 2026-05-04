import { inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';
import { Row } from '../../types/supabase.types';
import { FormulaTargetAssignmentRow } from '../../types/formula-admin-view.types';
import { mapUiMetadataEntry } from '../../utils/admin-ui-metadata';
import { Backend } from '../backend/backend';

export const FORMULA_VARIABLE_HELP_NAMESPACE = 'formula_variable_help';

@Injectable({ providedIn: 'root' })
export class FormulaVariableHelp {
  private readonly backend = inject(Backend);

  getHelpByTargetVariable(
    rows: readonly FormulaTargetAssignmentRow[],
  ): Observable<ReadonlyMap<string, string>> {
    const keys = Array.from(new Set(
      rows.flatMap((row) =>
        row.target.allowedVariables.map((variable) =>
          toFormulaVariableHelpKey(row.target.key, variable),
        ),
      ),
    ));

    if (keys.length === 0) {
      return of(new Map<string, string>());
    }

    return this.backend.rpc<Row<'ui_metadata_entries'>[]>(RPC.get_ui_metadata_entries, {
      p_namespace: FORMULA_VARIABLE_HELP_NAMESPACE,
      p_keys: keys,
      p_include_inactive: false,
    }).pipe(
      map((entries) => toHelpMap(entries.map(mapUiMetadataEntry))),
    );
  }
}

export function toFormulaVariableHelpKey(targetKey: string, variableKey: string): string {
  return `${targetKey}.${variableKey}`;
}

function toHelpMap(entries: readonly UiMetadataEntryReadModel[]): ReadonlyMap<string, string> {
  return new Map(
    entries.map((entry) => [
      entry.key,
      entry.helperText ?? entry.description ?? entry.impactSummary ?? entry.warningText ?? entry.label,
    ]),
  );
}
