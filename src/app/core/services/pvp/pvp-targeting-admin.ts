import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import {
  PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
  PVP_TARGETING_SECTION_METADATA_NAMESPACE,
} from '../../constants/pvp-ui-metadata.const';
import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';
import { FormulaAdminData } from '../../domain/formula/formula.model';
import { FormulaService } from '../formula/formula';
import { PvpUiMetadata } from './pvp-ui-metadata';

export const PVP_TARGETING_FORMULA_TARGET_KEYS = [
  'pvp_attack_min_target_level',
  'pvp_attack_max_target_level',
  'pvp_attack_travel_time_seconds',
  'pvp_spy_travel_time_seconds',
  'pvp_manual_fight_window_seconds',
  'pvp_target_protection_seconds',
] as const;

export interface PvpTargetingAdminData {
  formulas: FormulaAdminData;
  metadataEntries: UiMetadataEntryReadModel[];
}

@Injectable({ providedIn: 'root' })
export class PvpTargetingAdmin {
  private readonly formulas = inject(FormulaService);
  private readonly metadata = inject(PvpUiMetadata);

  getData(): Observable<PvpTargetingAdminData> {
    return forkJoin({
      formulas: this.formulas.getAdminData(),
      targetingMetadataEntries: this.metadata.getNamespaceEntries(
        PVP_TARGETING_SECTION_METADATA_NAMESPACE,
      ),
      configuratorMetadataEntries: this.metadata.getNamespaceEntries(
        PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      ),
    }).pipe(
      map((data) => ({
        formulas: data.formulas,
        metadataEntries: [
          ...data.targetingMetadataEntries,
          ...data.configuratorMetadataEntries,
        ],
      })),
    );
  }
}
