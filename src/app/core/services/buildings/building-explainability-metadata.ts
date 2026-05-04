import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import {
  BUILDING_CONFIGURATOR_FIELD_METADATA_KEYS,
  BUILDING_CONFIGURATOR_FIELD_METADATA_NAMESPACE,
  BUILDING_CONFIGURATOR_SECTION_METADATA_KEYS,
  BUILDING_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
  ESTATE_BUILDING_RUNTIME_SECTION_METADATA_KEYS,
  ESTATE_BUILDING_RUNTIME_SECTION_METADATA_NAMESPACE,
  ESTATE_RUNTIME_SECTION_METADATA_KEYS,
  ESTATE_RUNTIME_SECTION_METADATA_NAMESPACE,
} from '../../constants/building-ui-metadata.const';
import { RPC } from '../../constants/rpc.const';
import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';
import { mapUiMetadataEntry } from '../../utils/admin-ui-metadata';
import { Backend } from '../backend/backend';
import { Database } from '../../types/database.types';

type GetUiMetadataEntriesRpcRow =
  Database['public']['Functions']['get_ui_metadata_entries']['Returns'][number];

@Injectable({ providedIn: 'root' })
export class BuildingExplainabilityMetadata {
  private readonly backend = inject(Backend);

  getAdminEntries(): Observable<UiMetadataEntryReadModel[]> {
    return this.getMetadataGroups([
      [
        BUILDING_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
        BUILDING_CONFIGURATOR_SECTION_METADATA_KEYS,
      ],
      [
        BUILDING_CONFIGURATOR_FIELD_METADATA_NAMESPACE,
        BUILDING_CONFIGURATOR_FIELD_METADATA_KEYS,
      ],
    ]);
  }

  getRuntimeEntries(): Observable<UiMetadataEntryReadModel[]> {
    return this.getMetadataGroups([
      [
        ESTATE_RUNTIME_SECTION_METADATA_NAMESPACE,
        ESTATE_RUNTIME_SECTION_METADATA_KEYS,
      ],
      [
        ESTATE_BUILDING_RUNTIME_SECTION_METADATA_NAMESPACE,
        ESTATE_BUILDING_RUNTIME_SECTION_METADATA_KEYS,
      ],
    ]);
  }

  private getMetadataGroups(
    groups: readonly (readonly [string, readonly string[]])[],
  ): Observable<UiMetadataEntryReadModel[]> {
    return forkJoin(
      groups.map(([namespace, keys]) => this.getUiMetadataEntries(namespace, keys)),
    ).pipe(map((rows) => rows.flat().map(mapUiMetadataEntry)));
  }

  private getUiMetadataEntries(
    namespace: string,
    keys: readonly string[],
  ): Observable<GetUiMetadataEntriesRpcRow[]> {
    return this.backend.rpc<GetUiMetadataEntriesRpcRow[]>(RPC.get_ui_metadata_entries, {
      p_namespace: namespace,
      p_keys: [...keys],
      p_include_inactive: false,
    });
  }
}
