import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import {
  AntiAbuseSignalListFilters,
  AntiAbuseSignalListReadModel,
} from '../../domain/anti-abuse/anti-abuse-signal-list.model';
import { FilterOperator } from '../../enums/filter-operators';
import { FilterDefinition, IFilter } from '../../interfaces/i-filter';
import { Row } from '../../types/supabase.types';
import { mapAntiAbuseSignalReadModel } from '../../utils/anti-abuse-case-mappers';
import { trimText } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';
import { AntiAbuseReferencedDictionaries } from './anti-abuse-referenced-dictionaries';

@Injectable({ providedIn: 'root' })
export class AntiAbuseSignals {
  private readonly backend = inject(Backend);
  private readonly dictionaries = inject(AntiAbuseReferencedDictionaries);

  getSignalsForServer(
    filters: AntiAbuseSignalListFilters,
  ): Observable<AntiAbuseSignalListReadModel> {
    return this.backend
      .getAll<Row<'anti_abuse_signals'>>({
        table: TABLES.anti_abuse_signals,
        filters: toSignalListQueryFilters(filters),
        orderBy: [{ column: 'created_at', ascending: false }],
        camelCase: false,
      })
      .pipe(
        map((rows) => rows.map(mapAntiAbuseSignalReadModel)),
        switchMap((signals) =>
          this.dictionaries.getForReferences({
            sanctionTypeKeys: [],
            reportTypeKeys: [],
            declarationTypeKeys: [],
            signalTypeKeys: uniqueTexts(signals.map((entry) => entry.signalTypeKey)),
          }).pipe(
            map((dictionaries) => ({
              signals,
              dictionaries: {
                signalTypes: dictionaries.signalTypes,
              },
            })),
          ),
        ),
      );
  }
}

export function toSignalListQueryFilters(
  filters: AntiAbuseSignalListFilters,
): Record<string, FilterDefinition> {
  const serverId = trimText(filters.serverId);

  if (!serverId) {
    throw new Error('serverId is required for anti-abuse signal list.');
  }

  const result: Record<string, FilterDefinition> = {
    serverId: { operator: FilterOperator.EQ, value: serverId },
  };

  addOptionalEqFilter(result, 'signalTypeKey', filters.signalTypeKey);
  addOptionalEqFilter(result, 'severity', filters.severity);
  addOptionalEqFilter(result, 'actorHeroId', filters.actorHeroId);
  addOptionalEqFilter(result, 'actorUserId', filters.actorUserId);
  addOptionalEqFilter(result, 'targetHeroId', filters.targetHeroId);
  addOptionalEqFilter(result, 'targetUserId', filters.targetUserId);
  addOptionalEqFilter(result, 'entityTypeKey', filters.entityTypeKey);
  addOptionalEqFilter(result, 'entityId', filters.entityId);
  addOptionalEqFilter(result, 'groupingKey', filters.groupingKey);

  if (filters.isDismissed !== null && filters.isDismissed !== undefined) {
    result['isDismissed'] = {
      operator: FilterOperator.EQ,
      value: filters.isDismissed,
    };
  }

  const createdAtFilters: IFilter[] = [];
  const createdFrom = trimText(filters.createdFrom);
  const createdTo = trimText(filters.createdTo);

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

function uniqueTexts(values: readonly (string | null | undefined)[]): string[] {
  return [...new Set(values.map((value) => trimText(value)).filter(Boolean))];
}
