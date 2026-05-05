import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  REPORT_DETAIL_SECTION_METADATA_KEYS,
  REPORT_DETAIL_SECTION_METADATA_NAMESPACE,
  REPORTS_CENTER_SECTION_METADATA_KEYS,
  REPORTS_CENTER_SECTION_METADATA_NAMESPACE,
} from '../../constants/game-report-ui-metadata.const';
import { RPC } from '../../constants/rpc.const';
import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';
import { Database } from '../../types/database.types';
import { mapUiMetadataEntry } from '../../utils/admin-ui-metadata';
import { Backend } from '../backend/backend';

type GetUiMetadataEntriesRpcRow =
  Database['public']['Functions']['get_ui_metadata_entries']['Returns'][number];

@Injectable({ providedIn: 'root' })
export class GameReportUiMetadataService {
  private readonly backend = inject(Backend);

  getReportsCenterEntries(): Observable<UiMetadataEntryReadModel[]> {
    return this.getEntries(
      REPORTS_CENTER_SECTION_METADATA_NAMESPACE,
      REPORTS_CENTER_SECTION_METADATA_KEYS,
    );
  }

  getReportDetailEntries(): Observable<UiMetadataEntryReadModel[]> {
    return this.getEntries(
      REPORT_DETAIL_SECTION_METADATA_NAMESPACE,
      REPORT_DETAIL_SECTION_METADATA_KEYS,
    );
  }

  private getEntries(
    namespace: string,
    keys: readonly string[],
  ): Observable<UiMetadataEntryReadModel[]> {
    return this.backend.rpc<GetUiMetadataEntriesRpcRow[]>(
      RPC.get_ui_metadata_entries,
      {
        p_namespace: namespace,
        p_keys: [...keys],
        p_include_inactive: false,
      },
    ).pipe(map((rows) => rows.map(mapUiMetadataEntry)));
  }
}
