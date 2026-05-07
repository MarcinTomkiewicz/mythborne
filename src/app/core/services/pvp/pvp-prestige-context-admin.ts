import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import {
  PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
  PVP_REWARD_SECTION_METADATA_NAMESPACE,
} from '../../constants/pvp-ui-metadata.const';
import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';
import { FormulaAdminData } from '../../domain/formula/formula.model';
import { FormulaService } from '../formula/formula';
import { PvpUiMetadata } from './pvp-ui-metadata';

export const PVP_PRESTIGE_CONTEXT_FORMULA_TARGET_KEYS = [
  'pvp_prestige_delta_context',
] as const;

export const PVP_PRESTIGE_CONTEXT_FIELD_KEYS = [
  'recipientLevel',
  'opponentLevel',
  'opponentLevelDelta',
  'outcomeMultiplier',
] as const;

export interface PvpPrestigeContextAdminData {
  formulas: FormulaAdminData;
  metadataEntries: UiMetadataEntryReadModel[];
}

@Injectable({ providedIn: 'root' })
export class PvpPrestigeContextAdmin {
  private readonly formulas = inject(FormulaService);
  private readonly metadata = inject(PvpUiMetadata);

  getData(): Observable<PvpPrestigeContextAdminData> {
    return forkJoin({
      formulas: this.formulas.getAdminData(),
      rewardMetadataEntries: this.metadata.getNamespaceEntries(
        PVP_REWARD_SECTION_METADATA_NAMESPACE,
      ),
      configuratorMetadataEntries: this.metadata.getNamespaceEntries(
        PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      ),
    }).pipe(
      map((data) => ({
        formulas: data.formulas,
        metadataEntries: [
          ...data.rewardMetadataEntries,
          ...data.configuratorMetadataEntries,
        ],
      })),
    );
  }
}
