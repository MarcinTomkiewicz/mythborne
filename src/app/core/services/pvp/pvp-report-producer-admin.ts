import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { PVP_REPORT_SECTION_METADATA_NAMESPACE } from '../../constants/pvp-ui-metadata.const';
import { TABLES } from '../../constants/tables.const';
import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';
import { GameReportTypeEntry } from '../../domain/reports/game-report.model';
import {
  GameReportSourceEntityType,
  GameReportTypeRow,
} from '../../types/game-report-rpc.types';
import { mapGameReportType } from '../../utils/game-report-mappers';
import { Backend } from '../backend/backend';
import { PvpUiMetadata } from './pvp-ui-metadata';

export const PVP_REPORT_TYPE_KEY = 'pvp_combat';
export const PVP_REPORT_SOURCE_ENTITY_TYPE: GameReportSourceEntityType =
  'pvp_result';
export const PVP_REPORT_COMBAT_SECTION_SOURCE_TYPE = 'pvp';

export interface PvpReportProducerAdminData {
  reportTypes: GameReportTypeEntry[];
  metadataEntries: UiMetadataEntryReadModel[];
}

@Injectable({ providedIn: 'root' })
export class PvpReportProducerAdmin {
  private readonly backend = inject(Backend);
  private readonly metadata = inject(PvpUiMetadata);

  getData(): Observable<PvpReportProducerAdminData> {
    return forkJoin({
      reportTypes: this.getReportTypes(),
      metadataEntries: this.metadata.getNamespaceEntries(
        PVP_REPORT_SECTION_METADATA_NAMESPACE,
      ),
    }).pipe(
      map((data) => ({
        reportTypes: data.reportTypes,
        metadataEntries: data.metadataEntries,
      })),
    );
  }

  private getReportTypes(): Observable<GameReportTypeEntry[]> {
    return this.backend.getAll<GameReportTypeRow>({
      table: TABLES.game_report_types,
      orderBy: [
        { column: 'sort_order' },
        { column: 'key' },
      ],
      camelCase: false,
    }).pipe(map((rows) => rows.map(mapGameReportType)));
  }
}
