import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { FilterOperator } from '../../enums/filter-operators';
import { AuditDictionaryData } from '../../domain/audit/audit-dictionary.model';
import { Row } from '../../types/supabase.types';
import {
  mapAuditActionType,
  mapAuditEntityType,
} from '../../utils/audit-dictionary';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class AuditDictionaries {
  private readonly backend = inject(Backend);

  getActiveDictionaries(): Observable<AuditDictionaryData> {
    return forkJoin({
      actionTypes: this.getActiveActionTypes(),
      entityTypes: this.getActiveEntityTypes(),
    });
  }

  getActiveActionTypes(): Observable<AuditDictionaryData['actionTypes']> {
    return this.backend
      .getAll<Row<'audit_action_types'>>({
        table: TABLES.audit_action_types,
        filters: { isActive: { operator: FilterOperator.EQ, value: true } },
        orderBy: [{ column: 'category' }, { column: 'sort_order' }, { column: 'label' }],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapAuditActionType)));
  }

  getActiveEntityTypes(): Observable<AuditDictionaryData['entityTypes']> {
    return this.backend
      .getAll<Row<'audit_entity_types'>>({
        table: TABLES.audit_entity_types,
        filters: { isActive: { operator: FilterOperator.EQ, value: true } },
        orderBy: [{ column: 'category' }, { column: 'sort_order' }, { column: 'label' }],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapAuditEntityType)));
  }
}
