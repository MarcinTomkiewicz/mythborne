import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { AntiAbuseCaseReadModel } from '../../domain/anti-abuse/anti-abuse-case.model';
import { AntiAbuseCaseListFilters } from '../../domain/anti-abuse/anti-abuse-case-list.model';
import { FilterOperator } from '../../enums/filter-operators';
import { FilterDefinition, IFilter } from '../../interfaces/i-filter';
import { Row } from '../../types/supabase.types';
import { mapAntiAbuseCaseReadModel } from '../../utils/anti-abuse-case-mappers';
import { trimText } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class AntiAbuseCases {
  private readonly backend = inject(Backend);

  getCasesForServer(
    filters: AntiAbuseCaseListFilters,
  ): Observable<AntiAbuseCaseReadModel[]> {
    return this.getParticipantCaseIds(filters).pipe(
      switchMap((participantCaseIds) => {
        if (participantCaseIds && !participantCaseIds.length) {
          return of([]);
        }

        return this.backend.getAll<Row<'anti_abuse_cases'>>({
          table: TABLES.anti_abuse_cases,
          filters: toCaseListQueryFilters(filters, participantCaseIds),
          orderBy: [
            { column: 'updated_at', ascending: false },
            { column: 'created_at', ascending: false },
          ],
          camelCase: false,
        });
      }),
      map((rows) => rows.map(mapAntiAbuseCaseReadModel)),
    );
  }

  private getParticipantCaseIds(
    filters: AntiAbuseCaseListFilters,
  ): Observable<string[] | null> {
    const participantFilters = toParticipantQueryFilters(filters);

    if (!participantFilters) {
      return of(null);
    }

    return this.backend
      .getAll<Row<'anti_abuse_case_participants'>>({
        table: TABLES.anti_abuse_case_participants,
        filters: participantFilters,
        camelCase: false,
      })
      .pipe(map((rows) => uniqueTexts(rows.map((row) => row.case_id))));
  }
}

export function toCaseListQueryFilters(
  filters: AntiAbuseCaseListFilters,
  participantCaseIds: readonly string[] | null = null,
): Record<string, FilterDefinition> {
  const serverId = trimText(filters.serverId);

  if (!serverId) {
    throw new Error('serverId is required for anti-abuse case list.');
  }

  const result: Record<string, FilterDefinition> = {
    serverId: { operator: FilterOperator.EQ, value: serverId },
  };

  addOptionalEqFilter(result, 'status', filters.status);
  addOptionalEqFilter(result, 'verdict', filters.verdict);
  addOptionalEqFilter(result, 'source', filters.source);

  if (participantCaseIds) {
    result['id'] = { operator: FilterOperator.IN, value: participantCaseIds };
  }

  const createdFrom = trimText(filters.createdFrom);
  const createdTo = trimText(filters.createdTo);
  const createdAtFilters: IFilter[] = [];

  if (createdFrom) {
    createdAtFilters.push({ operator: FilterOperator.GTE, value: createdFrom });
  }

  if (createdTo) {
    createdAtFilters.push({ operator: FilterOperator.LTE, value: createdTo });
  }

  if (createdAtFilters.length) {
    result['createdAt'] = createdAtFilters;
  }

  return result;
}

export function toParticipantQueryFilters(
  filters: Pick<AntiAbuseCaseListFilters, 'participantHeroId' | 'participantUserId'>,
): Record<string, FilterDefinition> | null {
  const result: Record<string, FilterDefinition> = {};

  addOptionalEqFilter(result, 'heroId', filters.participantHeroId);
  addOptionalEqFilter(result, 'userId', filters.participantUserId);

  return Object.keys(result).length ? result : null;
}

function addOptionalEqFilter(
  filters: Record<string, FilterDefinition>,
  key: string,
  value: string | null | undefined,
): void {
  const normalized = trimText(value);

  if (normalized) {
    filters[key] = { operator: FilterOperator.EQ, value: normalized };
  }
}

function uniqueTexts(values: readonly (string | null | undefined)[]): string[] {
  return [...new Set(values.map((value) => trimText(value)).filter(Boolean))];
}
