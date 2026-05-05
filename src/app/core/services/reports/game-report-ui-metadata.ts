import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
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
    return this.backend.rpc<GetUiMetadataEntriesRpcRow[]>(
      RPC.get_ui_metadata_entries,
      {
        p_namespace: REPORTS_CENTER_SECTION_METADATA_NAMESPACE,
        p_keys: [...REPORTS_CENTER_SECTION_METADATA_KEYS],
        p_include_inactive: false,
      },
    ).pipe(map((rows) => rows.map(mapUiMetadataEntry)));
  }
}
