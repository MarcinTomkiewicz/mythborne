import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import {
  AntiAbuseCaseDetailReadModel,
  AntiAbuseCaseReadModel,
} from '../../domain/anti-abuse/anti-abuse-case.model';
import { FilterOperator } from '../../enums/filter-operators';
import { FilterDefinition } from '../../interfaces/i-filter';
import { AuditLogWithDictionaryRow } from '../../types/audit-log-row.types';
import { Row } from '../../types/supabase.types';
import {
  mapAntiAbuseCaseAuditLink,
  mapAntiAbuseCaseDeclarationLink,
  mapAntiAbuseCaseParticipant,
  mapAntiAbuseCaseReadModel,
  mapAntiAbuseCaseSignalLink,
  mapAntiAbuseSignalReadModel,
} from '../../utils/anti-abuse-case-mappers';
import {
  mapAntiAbuseSanctionDecision,
  mapAntiAbuseSanctionItemDecision,
  mapCharacterPointPenaltyDecision,
  mapPlayerAbuseReportDecision,
  mapPlayerRelationshipDeclarationDecision,
} from '../../utils/anti-abuse-decision-mappers';
import { mapAuditLogEntry } from '../../utils/audit-log';
import { trimText } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';
import { AntiAbuseReferencedDictionaries } from './anti-abuse-referenced-dictionaries';

@Injectable({ providedIn: 'root' })
export class AntiAbuseCaseDetails {
  private readonly backend = inject(Backend);
  private readonly dictionaries = inject(AntiAbuseReferencedDictionaries);

  getCaseDetail(input: {
    serverId: string;
    caseId: string;
  }): Observable<AntiAbuseCaseDetailReadModel> {
    const normalizedServerId = requiredServerId(input.serverId);
    const normalizedCaseId = requiredCaseId(input.caseId);

    return this.getCase(normalizedServerId, normalizedCaseId).pipe(
      switchMap((caseModel) =>
        forkJoin({
          caseSignals: this.caseRows('anti_abuse_case_signals', normalizedCaseId).pipe(
            map((rows) => rows.map(mapAntiAbuseCaseSignalLink)),
          ),
          participants: this.caseRows(
            'anti_abuse_case_participants',
            normalizedCaseId,
          ).pipe(map((rows) => rows.map(mapAntiAbuseCaseParticipant))),
          auditLinks: this.caseRows('anti_abuse_case_audit_logs', normalizedCaseId).pipe(
            map((rows) => rows.map(mapAntiAbuseCaseAuditLink)),
          ),
          declarationLinks: this.caseRows(
            'anti_abuse_case_declarations',
            normalizedCaseId,
          ).pipe(map((rows) => rows.map(mapAntiAbuseCaseDeclarationLink))),
          reports: this.caseRows('player_abuse_reports', normalizedCaseId).pipe(
            map((rows) => rows.map(mapPlayerAbuseReportDecision)),
          ),
          sanctions: this.caseRows('anti_abuse_sanctions', normalizedCaseId).pipe(
            map((rows) => rows.map(mapAntiAbuseSanctionDecision)),
          ),
          characterPointPenalties: this.caseRows(
            'character_point_penalties',
            normalizedCaseId,
          ).pipe(map((rows) => rows.map(mapCharacterPointPenaltyDecision))),
        }).pipe(map((linked) => ({ case: caseModel, ...linked }))),
      ),
      switchMap((base) =>
        forkJoin({
          signals: this.rowsByIds(
            'anti_abuse_signals',
            base.caseSignals.map((entry) => entry.signalId),
          ).pipe(map((rows) => rows.map(mapAntiAbuseSignalReadModel))),
          auditLogs: this.getAuditLogs(base.auditLinks.map((entry) => entry.auditLogId)),
          declarations: this.rowsByIds(
            'player_relationship_declarations',
            base.declarationLinks.map((entry) => entry.declarationId),
          ).pipe(map((rows) => rows.map(mapPlayerRelationshipDeclarationDecision))),
          sanctionItems: this.getSanctionItems(base.sanctions.map((entry) => entry.id)),
        }).pipe(map((linked) => ({ ...base, ...linked }))),
      ),
      switchMap((detail) =>
        this.dictionaries.getForReferences({
          sanctionTypeKeys: detail.sanctions.map((entry) => entry.sanctionTypeKey),
          reportTypeKeys: detail.reports.map((entry) => entry.reportTypeKey),
          declarationTypeKeys: detail.declarations.map(
            (entry) => entry.declarationTypeKey,
          ),
          signalTypeKeys: detail.signals.map((entry) => entry.signalTypeKey),
        }).pipe(
          map((dictionaries) => ({ ...detail, dictionaries })),
        ),
      ),
    );
  }

  private getCase(
    serverId: string,
    caseId: string,
  ): Observable<AntiAbuseCaseReadModel> {
    return this.backend
      .getAll<Row<'anti_abuse_cases'>>({
        table: TABLES.anti_abuse_cases,
        filters: {
          id: eq(caseId),
          serverId: eq(serverId),
        },
        camelCase: false,
      })
      .pipe(
        map((rows) => {
          const row = rows[0];

          if (!row) {
            throw new Error('Anti-abuse case not found for selected server.');
          }

          return mapAntiAbuseCaseReadModel(row);
        }),
      );
  }

  private getSanctionItems(
    sanctionIds: string[],
  ): Observable<AntiAbuseCaseDetailReadModel['sanctionItems']> {
    if (!sanctionIds.length) {
      return of([]);
    }

    return this.backend
      .getAll<Row<'anti_abuse_sanction_items'>>({
        table: TABLES.anti_abuse_sanction_items,
        filters: { sanctionId: inList(sanctionIds) },
        orderBy: [{ column: 'created_at' }],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapAntiAbuseSanctionItemDecision)));
  }

  private getAuditLogs(
    auditLogIds: string[],
  ): Observable<AntiAbuseCaseDetailReadModel['auditLogs']> {
    if (!auditLogIds.length) {
      return of([]);
    }

    return this.backend
      .getAll<AuditLogWithDictionaryRow>({
        table: TABLES.audit_logs,
        joins: 'audit_action_types(*), audit_entity_types(*)',
        filters: { id: inList(auditLogIds) },
        orderBy: [{ column: 'created_at', ascending: false }],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapAuditLogEntry)));
  }

  private caseRows<T extends CaseLinkedTableName>(
    table: T,
    caseId: string,
  ): Observable<Row<T>[]> {
    return this.backend.getAll<Row<T>>({
      table: TABLES[table],
      filters: { caseId: eq(caseId) },
      orderBy: [{ column: 'created_at' }],
      camelCase: false,
    });
  }

  private rowsByIds<T extends IdTableName>(
    table: T,
    ids: string[],
  ): Observable<Row<T>[]> {
    if (!ids.length) {
      return of([]);
    }

    return this.backend.getAll<Row<T>>({
      table: TABLES[table],
      filters: { id: inList(ids) },
      camelCase: false,
    });
  }
}

type CaseLinkedTableName =
  | 'anti_abuse_case_signals'
  | 'anti_abuse_case_participants'
  | 'anti_abuse_case_audit_logs'
  | 'anti_abuse_case_declarations'
  | 'player_abuse_reports'
  | 'anti_abuse_sanctions'
  | 'character_point_penalties';

type IdTableName = 'anti_abuse_signals' | 'player_relationship_declarations';

function requiredCaseId(value: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error('caseId is required for anti-abuse case detail.');
  }

  return normalized;
}

function requiredServerId(value: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error('serverId is required for anti-abuse case detail.');
  }

  return normalized;
}

function eq(value: string): FilterDefinition {
  return { operator: FilterOperator.EQ, value };
}

function inList(values: string[]): FilterDefinition {
  return { operator: FilterOperator.IN, value: values };
}
