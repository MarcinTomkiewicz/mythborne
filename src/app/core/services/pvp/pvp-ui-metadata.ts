import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import {
  PVP_UI_METADATA_NAMESPACES,
  PvpUiMetadataNamespace,
} from '../../constants/pvp-ui-metadata.const';
import { RPC } from '../../constants/rpc.const';
import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';
import { Database } from '../../types/database.types';
import { mapUiMetadataEntry } from '../../utils/admin-ui-metadata';
import { Backend } from '../backend/backend';

type GetUiMetadataEntriesRpcRow =
  Database['public']['Functions']['get_ui_metadata_entries']['Returns'][number];

@Injectable({ providedIn: 'root' })
export class PvpUiMetadata {
  private readonly backend = inject(Backend);

  getEntries(): Observable<UiMetadataEntryReadModel[]> {
    return forkJoin(
      PVP_UI_METADATA_NAMESPACES.map((namespace) =>
        this.getNamespaceEntries(namespace),
      ),
    ).pipe(
      map((groups) => groups.flat()),
    );
  }

  getNamespaceEntries(
    namespace: PvpUiMetadataNamespace,
  ): Observable<UiMetadataEntryReadModel[]> {
    return this.getNamespaceRows(namespace).pipe(
      map((rows) => rows.map(mapUiMetadataEntry)),
    );
  }

  private getNamespaceRows(
    namespace: PvpUiMetadataNamespace,
  ): Observable<GetUiMetadataEntriesRpcRow[]> {
    return this.backend.rpc<GetUiMetadataEntriesRpcRow[]>(
      RPC.get_ui_metadata_entries,
      {
        p_namespace: namespace,
        p_include_inactive: false,
      },
    );
  }
}
