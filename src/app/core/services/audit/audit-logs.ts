import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { AuditLogEntry } from '../../domain/audit/audit-log.model';
import { AuditLogFilters, AuditLogWithDictionaryRow } from '../../types/audit-log-row.types';
import { mapAuditLogEntry, toAuditLogFilters } from '../../utils/audit-log';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class AuditLogs {
  private readonly backend = inject(Backend);

  getLogs(filters: AuditLogFilters): Observable<AuditLogEntry[]> {
    return this.backend
      .getAll<AuditLogWithDictionaryRow>({
        table: TABLES.audit_logs,
        select: '*, audit_action_types (*), audit_entity_types (*)',
        filters: toAuditLogFilters(filters),
        orderBy: { column: 'created_at', ascending: false },
        range: { from: 0, to: 99 },
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapAuditLogEntry)));
  }
}
