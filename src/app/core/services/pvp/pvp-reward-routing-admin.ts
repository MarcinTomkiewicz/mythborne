import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import {
  PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
  PVP_REWARD_SECTION_METADATA_NAMESPACE,
} from '../../constants/pvp-ui-metadata.const';
import { TABLES } from '../../constants/tables.const';
import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';
import {
  RewardDictionaryReadModel,
  RewardOutcomeKindReadModel,
  RewardProfileAssignmentReadModel,
  RewardProfileEntryReadModel,
  RewardProfileReadModel,
  ResourceTypeReadModel,
} from '../../domain/exploration/exploration-reward.model';
import { FormulaAdminData } from '../../domain/formula/formula.model';
import { Row } from '../../types/supabase.types';
import {
  mapRewardDictionary,
  mapRewardOutcomeKind,
  mapRewardProfile,
  mapRewardProfileAssignment,
  mapRewardProfileEntry,
  mapResourceType,
} from '../../utils/exploration-reward-mappers';
import { Backend } from '../backend/backend';
import { FormulaService } from '../formula/formula';
import { PvpUiMetadata } from './pvp-ui-metadata';

export const PVP_REWARD_SOURCE_KIND = 'pvp';

export const PVP_REWARD_OUTCOME_KEYS = [
  'attacker_victory',
  'defender_victory',
  'draw',
] as const;

export const PVP_REWARD_FORMULA_TARGET_KEYS = [
  'pvp_xp_reward',
] as const;

export interface PvpRewardRoutingAdminData {
  formulas: FormulaAdminData;
  outcomeKinds: RewardOutcomeKindReadModel[];
  profiles: RewardProfileReadModel[];
  entries: RewardProfileEntryReadModel[];
  assignments: RewardProfileAssignmentReadModel[];
  entryKinds: RewardDictionaryReadModel[];
  amountModes: RewardDictionaryReadModel[];
  resourceTypes: ResourceTypeReadModel[];
  metadataEntries: UiMetadataEntryReadModel[];
}

@Injectable({ providedIn: 'root' })
export class PvpRewardRoutingAdmin {
  private readonly backend = inject(Backend);
  private readonly formulas = inject(FormulaService);
  private readonly metadata = inject(PvpUiMetadata);

  getData(): Observable<PvpRewardRoutingAdminData> {
    return forkJoin({
      formulas: this.formulas.getAdminData(),
      outcomeKinds: this.getRows<Row<'reward_outcome_kinds'>>(
        TABLES.reward_outcome_kinds,
        [
          { column: 'source_kind', ascending: true },
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
      ),
      profiles: this.getRows<Row<'reward_profiles'>>(
        TABLES.reward_profiles,
        [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
      ),
      entries: this.getRows<Row<'reward_profile_entries'>>(
        TABLES.reward_profile_entries,
        [
          { column: 'sort_order', ascending: true },
          { column: 'label', ascending: true },
        ],
      ),
      assignments: this.getRows<Row<'reward_profile_assignments'>>(
        TABLES.reward_profile_assignments,
        [
          { column: 'source_kind', ascending: true },
          { column: 'outcome_kind', ascending: true },
          { column: 'sort_order', ascending: true },
        ],
      ),
      entryKinds: this.getRows<Row<'reward_entry_kinds'>>(
        TABLES.reward_entry_kinds,
        [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
      ),
      amountModes: this.getRows<Row<'reward_entry_amount_modes'>>(
        TABLES.reward_entry_amount_modes,
        [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
      ),
      resourceTypes: this.getRows<Row<'resource_types'>>(
        TABLES.resource_types,
        [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
      ),
      rewardMetadataEntries: this.metadata.getNamespaceEntries(
        PVP_REWARD_SECTION_METADATA_NAMESPACE,
      ),
      configuratorMetadataEntries: this.metadata.getNamespaceEntries(
        PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      ),
    }).pipe(
      map((data) => ({
        formulas: data.formulas,
        outcomeKinds: data.outcomeKinds.map(mapRewardOutcomeKind),
        profiles: data.profiles.map(mapRewardProfile),
        entries: data.entries.map(mapRewardProfileEntry),
        assignments: data.assignments.map(mapRewardProfileAssignment),
        entryKinds: data.entryKinds.map(mapRewardDictionary),
        amountModes: data.amountModes.map(mapRewardDictionary),
        resourceTypes: data.resourceTypes.map(mapResourceType),
        metadataEntries: [
          ...data.rewardMetadataEntries,
          ...data.configuratorMetadataEntries,
        ],
      })),
    );
  }

  private getRows<T extends object>(
    table: string,
    orderBy: Array<{ column: string; ascending: boolean }>,
  ): Observable<T[]> {
    return this.backend.getAll<T>({
      table,
      orderBy,
      camelCase: false,
    });
  }
}
