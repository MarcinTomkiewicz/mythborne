import { inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { EntityFormulaAssignment } from '../../domain/formula/formula.model';
import {
  FormulaBuildingLabelRow,
  FormulaEntityKey,
  FormulaEntityReference,
} from '../../types/formula-admin-view.types';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class FormulaEntityLabels {
  private readonly backend = inject(Backend);

  getEntityLabels(
    assignments: readonly EntityFormulaAssignment[],
  ): Observable<Map<FormulaEntityKey, FormulaEntityReference>> {
    const hasBuildingAssignments = assignments.some(
      (assignment) => assignment.entityKind === 'building',
    );

    if (!hasBuildingAssignments) {
      return of(new Map());
    }

    return this.backend
      .getAll<FormulaBuildingLabelRow>({
        table: TABLES.buildings,
        select: 'id, key, name, sort_order',
        orderBy: { column: 'sort_order' },
        camelCase: false,
      })
      .pipe(map((rows) => this.toBuildingReferences(rows)));
  }

  private toBuildingReferences(
    rows: readonly FormulaBuildingLabelRow[],
  ): Map<FormulaEntityKey, FormulaEntityReference> {
    return new Map(
      rows.map((row) => [
        this.referenceKey('building', row.id),
        {
          entityKind: 'building',
          entityId: row.id,
          label: row.name,
          key: row.key,
        },
      ]),
    );
  }

  referenceKey(entityKind: string, entityId: string): FormulaEntityKey {
    return `${entityKind}:${entityId}`;
  }
}
