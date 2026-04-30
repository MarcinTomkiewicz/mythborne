import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { PlayerAbuseReportTypeEntry } from '../../domain/anti-abuse/anti-abuse-dictionary.model';
import {
  PlayerAbuseReportLinkedCaseView,
  PlayerAbuseReportListInput,
  PlayerAbuseReportListItem,
} from '../../domain/anti-abuse/player-abuse-report-view.model';
import { FilterOperator } from '../../enums/filter-operators';
import { FilterDefinition } from '../../interfaces/i-filter';
import { Row } from '../../types/supabase.types';
import { mapPlayerAbuseReportType } from '../../utils/anti-abuse-dictionary';
import {
  mapPlayerAbuseReportLinkedCase,
  mapPlayerAbuseReportListItem,
} from '../../utils/player-abuse-report-view';
import { trimText } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';
import { AntiAbuseDictionaries } from './anti-abuse-dictionaries';

@Injectable({ providedIn: 'root' })
export class PlayerAbuseReportList {
  private readonly backend = inject(Backend);
  private readonly dictionaries = inject(AntiAbuseDictionaries);

  getReportsForPlayer(
    input: PlayerAbuseReportListInput,
  ): Observable<PlayerAbuseReportListItem[]> {
    const serverId = requiredText(input.serverId, 'serverId');
    const heroId = requiredText(input.heroId, 'heroId');
    const userId = requiredText(input.userId, 'userId');

    return forkJoin({
      heroReports: this.getReports(serverId, { reportingHeroId: heroId }),
      userReports: this.getReports(serverId, { reportingUserId: userId }),
      reportTypes: this.dictionaries.getActiveReportTypes(),
    }).pipe(
      switchMap((base) => {
        const reports = uniqueRowsById([
          ...base.heroReports,
          ...base.userReports,
        ])
          .filter((entry) => entry.server_id === serverId)
          .sort((left, right) => right.updated_at.localeCompare(left.updated_at));
        const caseIds = uniqueTexts(reports.map((entry) => entry.case_id));
        const reportTypeKeys = uniqueTexts(reports.map((entry) => entry.report_type_key));

        return forkJoin({
          reports: of(reports),
          reportTypes: this.getReferencedReportTypes(base.reportTypes, reportTypeKeys),
          cases: this.getCasesByIds(serverId, caseIds),
        });
      }),
      map((data) => {
        const caseById = new Map(
          data.cases.map((entry) => [entry.id, mapPlayerAbuseReportLinkedCase(entry)]),
        );

        return data.reports.map((report) =>
          mapPlayerAbuseReportListItem(report, {
            reportTypes: data.reportTypes,
            linkedCase: linkedCaseFor(report, caseById),
          }),
        );
      }),
    );
  }

  private getReports(
    serverId: string,
    filters: {
      reportingHeroId?: string;
      reportingUserId?: string;
    },
  ): Observable<Row<'player_abuse_reports'>[]> {
    return this.backend.getAll<Row<'player_abuse_reports'>>({
      table: TABLES.player_abuse_reports,
      filters: {
        serverId: eq(serverId),
        ...Object.entries(filters).reduce<Record<string, FilterDefinition>>(
          (result, [key, value]) => {
            if (value) {
              result[key] = eq(value);
            }

            return result;
          },
          {},
        ),
      },
      orderBy: [{ column: 'updated_at', ascending: false }],
      camelCase: false,
    });
  }

  private getCasesByIds(
    serverId: string,
    caseIds: readonly string[],
  ): Observable<Row<'anti_abuse_cases'>[]> {
    if (!caseIds.length) {
      return of([]);
    }

    return this.backend.getAll<Row<'anti_abuse_cases'>>({
      table: TABLES.anti_abuse_cases,
      filters: {
        serverId: eq(serverId),
        id: inList(caseIds),
      },
      camelCase: false,
    });
  }

  private getReferencedReportTypes(
    activeTypes: readonly PlayerAbuseReportTypeEntry[],
    referencedKeys: readonly string[],
  ): Observable<PlayerAbuseReportTypeEntry[]> {
    const activeKeys = new Set(activeTypes.map((entry) => entry.key));
    const missingKeys = referencedKeys.filter((key) => !activeKeys.has(key));

    if (!missingKeys.length) {
      return of([...activeTypes]);
    }

    return this.backend
      .getAll<Row<'player_abuse_report_types'>>({
        table: TABLES.player_abuse_report_types,
        filters: { key: inList(missingKeys) },
        orderBy: [{ column: 'sort_order' }, { column: 'key' }],
        camelCase: false,
      })
      .pipe(
        map((rows) =>
          uniqueReportTypesByKey([
            ...activeTypes,
            ...rows.map(mapPlayerAbuseReportType),
          ]),
        ),
      );
  }
}

function linkedCaseFor(
  report: Row<'player_abuse_reports'>,
  caseById: ReadonlyMap<string, PlayerAbuseReportLinkedCaseView>,
): PlayerAbuseReportLinkedCaseView | null {
  return report.case_id ? caseById.get(report.case_id) ?? null : null;
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for player abuse report list.`);
  }

  return normalized;
}

function eq(value: string): FilterDefinition {
  return { operator: FilterOperator.EQ, value };
}

function inList(values: readonly string[]): FilterDefinition {
  return { operator: FilterOperator.IN, value: values };
}

function uniqueTexts(values: readonly (string | null)[]): string[] {
  return [...new Set(values.filter(isNotNullOrEmpty))];
}

function isNotNullOrEmpty(value: string | null): value is string {
  return Boolean(value);
}

function uniqueRowsById<T extends { id: string }>(rows: readonly T[]): T[] {
  const byId = new Map<string, T>();

  for (const row of rows) {
    byId.set(row.id, row);
  }

  return [...byId.values()];
}

function uniqueReportTypesByKey(
  rows: readonly PlayerAbuseReportTypeEntry[],
): PlayerAbuseReportTypeEntry[] {
  const byKey = new Map<string, PlayerAbuseReportTypeEntry>();

  for (const row of rows) {
    byKey.set(row.key, row);
  }

  return [...byKey.values()];
}
