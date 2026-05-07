import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import {
  PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
  PVP_RESOURCE_TRANSFER_SECTION_METADATA_NAMESPACE,
} from '../../constants/pvp-ui-metadata.const';
import { TABLES } from '../../constants/tables.const';
import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';
import {
  ResourceTypeReadModel,
} from '../../domain/exploration/exploration-reward.model';
import { FormulaAdminData } from '../../domain/formula/formula.model';
import { Row } from '../../types/supabase.types';
import { mapResourceType } from '../../utils/exploration-reward-mappers';
import { Backend } from '../backend/backend';
import { FormulaService } from '../formula/formula';
import { PvpUiMetadata } from './pvp-ui-metadata';

export const PVP_RESOURCE_CONSEQUENCE_FORMULA_TARGET_KEYS = [
  'pvp_resource_steal_percent',
  'pvp_attacker_defeat_resource_loss_percent',
] as const;

export const PVP_ELIGIBLE_RESOURCE_KEYS = [
  'drachma',
  'materials',
  'workforce',
] as const;

export interface PvpResourceConsequencesAdminData {
  formulas: FormulaAdminData;
  resourceTypes: ResourceTypeReadModel[];
  metadataEntries: UiMetadataEntryReadModel[];
}

@Injectable({ providedIn: 'root' })
export class PvpResourceConsequencesAdmin {
  private readonly backend = inject(Backend);
  private readonly formulas = inject(FormulaService);
  private readonly metadata = inject(PvpUiMetadata);

  getData(): Observable<PvpResourceConsequencesAdminData> {
    return forkJoin({
      formulas: this.formulas.getAdminData(),
      resourceTypes: this.getResourceTypes(),
      resourceMetadataEntries: this.metadata.getNamespaceEntries(
        PVP_RESOURCE_TRANSFER_SECTION_METADATA_NAMESPACE,
      ),
      configuratorMetadataEntries: this.metadata.getNamespaceEntries(
        PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      ),
    }).pipe(
      map((data) => ({
        formulas: data.formulas,
        resourceTypes: data.resourceTypes,
        metadataEntries: [
          ...data.resourceMetadataEntries,
          ...data.configuratorMetadataEntries,
        ],
      })),
    );
  }

  private getResourceTypes(): Observable<ResourceTypeReadModel[]> {
    return this.backend.getAll<Row<'resource_types'>>({
      table: TABLES.resource_types,
      orderBy: [
        { column: 'sort_order' },
        { column: 'key' },
      ],
      camelCase: false,
    }).pipe(map((rows) => rows.map(mapResourceType)));
  }
}
