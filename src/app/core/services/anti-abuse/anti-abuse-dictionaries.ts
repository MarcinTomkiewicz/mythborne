import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { AntiAbuseDictionaryData } from '../../domain/anti-abuse/anti-abuse-dictionary.model';
import { FilterOperator } from '../../enums/filter-operators';
import { Row } from '../../types/supabase.types';
import {
  mapAntiAbuseSanctionType,
  mapAntiAbuseSignalType,
  mapPlayerAbuseReportType,
  mapPlayerRelationshipDeclarationType,
} from '../../utils/anti-abuse-dictionary';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class AntiAbuseDictionaries {
  private readonly backend = inject(Backend);

  getActiveDictionaries(): Observable<AntiAbuseDictionaryData> {
    return forkJoin({
      sanctionTypes: this.getActiveSanctionTypes(),
      reportTypes: this.getActiveReportTypes(),
      declarationTypes: this.getActiveDeclarationTypes(),
      signalTypes: this.getActiveSignalTypes(),
    });
  }

  getActiveSanctionTypes(): Observable<AntiAbuseDictionaryData['sanctionTypes']> {
    return this.backend
      .getAll<Row<'anti_abuse_sanction_types'>>({
        table: TABLES.anti_abuse_sanction_types,
        filters: { isActive: { operator: FilterOperator.EQ, value: true } },
        orderBy: [{ column: 'category' }, { column: 'sort_order' }, { column: 'label' }],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapAntiAbuseSanctionType)));
  }

  getActiveReportTypes(): Observable<AntiAbuseDictionaryData['reportTypes']> {
    return this.backend
      .getAll<Row<'player_abuse_report_types'>>({
        table: TABLES.player_abuse_report_types,
        filters: { isActive: { operator: FilterOperator.EQ, value: true } },
        orderBy: [{ column: 'category' }, { column: 'sort_order' }, { column: 'label' }],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapPlayerAbuseReportType)));
  }

  getActiveDeclarationTypes(): Observable<
    AntiAbuseDictionaryData['declarationTypes']
  > {
    return this.backend
      .getAll<Row<'player_relationship_declaration_types'>>({
        table: TABLES.player_relationship_declaration_types,
        filters: { isActive: { operator: FilterOperator.EQ, value: true } },
        orderBy: [{ column: 'category' }, { column: 'sort_order' }, { column: 'label' }],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapPlayerRelationshipDeclarationType)));
  }

  getActiveSignalTypes(): Observable<AntiAbuseDictionaryData['signalTypes']> {
    return this.backend
      .getAll<Row<'anti_abuse_signal_types'>>({
        table: TABLES.anti_abuse_signal_types,
        filters: { isActive: { operator: FilterOperator.EQ, value: true } },
        orderBy: [{ column: 'category' }, { column: 'sort_order' }, { column: 'label' }],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapAntiAbuseSignalType)));
  }
}
