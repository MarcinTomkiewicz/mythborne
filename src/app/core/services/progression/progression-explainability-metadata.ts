import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import {
  LEVEL_UP_REWARD_SECTION_METADATA_KEYS,
  LEVEL_UP_REWARD_SECTION_METADATA_NAMESPACE,
  LEVEL_UP_STAT_BONUS_SECTION_METADATA_KEYS,
  LEVEL_UP_STAT_BONUS_SECTION_METADATA_NAMESPACE,
  PROGRESSION_CONFIGURATOR_SECTION_METADATA_KEYS,
  PROGRESSION_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
  PROGRESSION_DIAGNOSTICS_SECTION_METADATA_KEYS,
  PROGRESSION_DIAGNOSTICS_SECTION_METADATA_NAMESPACE,
} from '../../constants/progression-ui-metadata.const';
import { RPC } from '../../constants/rpc.const';
import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';
import { Row } from '../../types/supabase.types';
import { mapUiMetadataEntry } from '../../utils/admin-ui-metadata';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class ProgressionExplainabilityMetadata {
  private readonly backend = inject(Backend);

  getEntries(): Observable<UiMetadataEntryReadModel[]> {
    return forkJoin([
      this.getUiMetadataEntries(
        PROGRESSION_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
        PROGRESSION_CONFIGURATOR_SECTION_METADATA_KEYS,
      ),
      this.getUiMetadataEntries(
        PROGRESSION_DIAGNOSTICS_SECTION_METADATA_NAMESPACE,
        PROGRESSION_DIAGNOSTICS_SECTION_METADATA_KEYS,
      ),
      this.getUiMetadataEntries(
        LEVEL_UP_REWARD_SECTION_METADATA_NAMESPACE,
        LEVEL_UP_REWARD_SECTION_METADATA_KEYS,
      ),
      this.getUiMetadataEntries(
        LEVEL_UP_STAT_BONUS_SECTION_METADATA_NAMESPACE,
        LEVEL_UP_STAT_BONUS_SECTION_METADATA_KEYS,
      ),
    ]).pipe(
      map((groups) => groups.flat().map(mapUiMetadataEntry)),
    );
  }

  private getUiMetadataEntries(
    namespace: string,
    keys: readonly string[],
  ): Observable<Row<'ui_metadata_entries'>[]> {
    return this.backend.rpc<Row<'ui_metadata_entries'>[]>(RPC.get_ui_metadata_entries, {
      p_namespace: namespace,
      p_keys: [...keys],
      p_include_inactive: false,
    });
  }
}
