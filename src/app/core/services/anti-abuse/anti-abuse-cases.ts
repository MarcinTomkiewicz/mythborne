import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import {
  AntiAbuseCaseReadModel,
  AntiAbuseCaseSource,
} from '../../domain/anti-abuse/anti-abuse-case.model';
import {
  AntiAbuseCaseStatus,
  AntiAbuseCaseVerdict,
} from '../../domain/anti-abuse/anti-abuse-decision.model';
import { FilterOperator } from '../../enums/filter-operators';
import { FilterDefinition, IFilter } from '../../interfaces/i-filter';
import { Row } from '../../types/supabase.types';
import { mapAntiAbuseCaseReadModel } from '../../utils/anti-abuse-case-mappers';
import { trimText } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';

export interface AntiAbuseCaseListFilters {
  serverId: string;
  status?: AntiAbuseCaseStatus | null;
  verdict?: AntiAbuseCaseVerdict | null;
  source?: AntiAbuseCaseSource | null;
  createdFrom?: string | null;
  createdTo?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AntiAbuseCases {
  private readonly backend = inject(Backend);

  getCasesForServer(
    filters: AntiAbuseCaseListFilters,
  ): Observable<AntiAbuseCaseReadModel[]> {
    return this.backend
      .getAll<Row<'anti_abuse_cases'>>({
        table: TABLES.anti_abuse_cases,
        filters: toCaseListQueryFilters(filters),
        orderBy: [
          { column: 'updated_at', ascending: false },
          { column: 'created_at', ascending: false },
        ],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapAntiAbuseCaseReadModel)));
  }
}

export function toCaseListQueryFilters(
  filters: AntiAbuseCaseListFilters,
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
