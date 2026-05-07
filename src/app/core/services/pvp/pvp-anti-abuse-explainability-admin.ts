import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { PVP_ANTI_ABUSE_SECTION_METADATA_NAMESPACE } from '../../constants/pvp-ui-metadata.const';
import { AntiAbuseDictionaryData } from '../../domain/anti-abuse/anti-abuse-dictionary.model';
import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';
import { AntiAbuseDictionaries } from '../anti-abuse/anti-abuse-dictionaries';
import { PvpUiMetadata } from './pvp-ui-metadata';

export const PVP_ANTI_ABUSE_SIGNAL_KEYS = [
  'same_ip_pvp_attack',
  'pvp_feeding_pattern',
] as const;

export const PVP_RELATIONSHIP_DECLARATION_CONTEXT_KEYS = [
  'mercenary_contract',
] as const;

export interface PvpAntiAbuseExplainabilityAdminData {
  dictionaries: AntiAbuseDictionaryData;
  metadataEntries: UiMetadataEntryReadModel[];
}

@Injectable({ providedIn: 'root' })
export class PvpAntiAbuseExplainabilityAdmin {
  private readonly dictionaries = inject(AntiAbuseDictionaries);
  private readonly metadata = inject(PvpUiMetadata);

  getData(): Observable<PvpAntiAbuseExplainabilityAdminData> {
    return forkJoin({
      dictionaries: this.dictionaries.getActiveDictionaries(),
      metadataEntries: this.metadata.getNamespaceEntries(
        PVP_ANTI_ABUSE_SECTION_METADATA_NAMESPACE,
      ),
    }).pipe(
      map((data) => ({
        dictionaries: data.dictionaries,
        metadataEntries: data.metadataEntries,
      })),
    );
  }
}
