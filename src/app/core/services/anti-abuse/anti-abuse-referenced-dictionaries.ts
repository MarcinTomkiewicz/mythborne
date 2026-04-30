import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import {
  AntiAbuseDictionaryData,
  AntiAbuseDictionaryReferences,
} from '../../domain/anti-abuse/anti-abuse-dictionary.model';
import { FilterOperator } from '../../enums/filter-operators';
import { FilterDefinition } from '../../interfaces/i-filter';
import { TableName } from '../../types/supabase.types';
import {
  mapAntiAbuseSanctionType,
  mapAntiAbuseSignalType,
  mapPlayerAbuseReportType,
  mapPlayerRelationshipDeclarationType,
} from '../../utils/anti-abuse-dictionary';
import { trimText } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';
import { AntiAbuseDictionaries } from './anti-abuse-dictionaries';

@Injectable({ providedIn: 'root' })
export class AntiAbuseReferencedDictionaries {
  private readonly backend = inject(Backend);
  private readonly dictionaries = inject(AntiAbuseDictionaries);

  getForReferences(
    references: AntiAbuseDictionaryReferences,
  ): Observable<AntiAbuseDictionaryData> {
    return this.dictionaries.getActiveDictionaries().pipe(
      switchMap((active) =>
        forkJoin({
          sanctionTypes: this.withReferencedTypes(
            active.sanctionTypes,
            references.sanctionTypeKeys,
            TABLES.anti_abuse_sanction_types,
            mapAntiAbuseSanctionType,
          ),
          reportTypes: this.withReferencedTypes(
            active.reportTypes,
            references.reportTypeKeys,
            TABLES.player_abuse_report_types,
            mapPlayerAbuseReportType,
          ),
          declarationTypes: this.withReferencedTypes(
            active.declarationTypes,
            references.declarationTypeKeys,
            TABLES.player_relationship_declaration_types,
            mapPlayerRelationshipDeclarationType,
          ),
          signalTypes: this.withReferencedTypes(
            active.signalTypes,
            references.signalTypeKeys,
            TABLES.anti_abuse_signal_types,
            mapAntiAbuseSignalType,
          ),
        }),
      ),
    );
  }

  private withReferencedTypes<TEntry extends { key: string }, TRow extends object>(
    activeTypes: TEntry[],
    keys: readonly string[],
    table: TableName,
    mapRow: (row: TRow) => TEntry,
  ): Observable<TEntry[]> {
    const missingKeys = missingDictionaryKeys(activeTypes, keys);

    if (!missingKeys.length) {
      return of(activeTypes);
    }

    return this.backend
      .getAll<TRow>({
        table,
        filters: { key: inList(missingKeys) },
        orderBy: [{ column: 'sort_order' }, { column: 'key' }],
        camelCase: false,
      })
      .pipe(map((rows) => [...activeTypes, ...rows.map(mapRow)]));
  }
}

function inList(values: string[]): FilterDefinition {
  return { operator: FilterOperator.IN, value: values };
}

function missingDictionaryKeys(
  entries: readonly { key: string }[],
  keys: readonly string[],
): string[] {
  const knownKeys = new Set(entries.map((entry) => entry.key));
  return uniqueTexts(keys).filter((key) => !knownKeys.has(key));
}

function uniqueTexts(values: readonly (string | null | undefined)[]): string[] {
  return [...new Set(values.map((value) => trimText(value)).filter(Boolean))];
}
