import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import {
  RewardOutcomeKindReadModel,
  RewardProfileAdminData,
  RewardProfileEntryReadModel,
  RewardProfileReadModel,
  UpsertRewardOutcomeKindInput,
  UpsertRewardProfileEntryInput,
  UpsertRewardProfileInput,
} from '../../domain/exploration/exploration-reward.model';
import { Database } from '../../types/database.types';
import { Row } from '../../types/supabase.types';
import {
  mapExplorationEffectDefinition,
} from '../../utils/exploration-encounter-payload-admin-mappers';
import {
  mapRewardOutcomeKind,
  mapRewardProfile,
  mapRewardProfileEntry,
  mapRewardDictionary,
  mapResourceType,
} from '../../utils/exploration-reward-mappers';
import {
  mapEditableBucketProfile,
  mapEditableQuality,
} from '../../utils/item-generation-admin-mappers';
import { mapBalanceFormula } from '../../utils/formula-admin-mappers';
import {
  toDeactivateRewardOutcomeKindRpcArgs,
  toDeactivateRewardProfileEntryRpcArgs,
  toDeactivateRewardProfileRpcArgs,
  toUpsertRewardOutcomeKindRpcArgs,
  toUpsertRewardProfileEntryRpcArgs,
  toUpsertRewardProfileRpcArgs,
} from '../../utils/reward-profile-admin-rpc';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class RewardProfileAdmin {
  private readonly backend = inject(Backend);

  getAdminData(): Observable<RewardProfileAdminData> {
    return forkJoin({
      outcomeKinds: getRows<Row<'reward_outcome_kinds'>>(this.backend, TABLES.reward_outcome_kinds, [
        { column: 'source_kind', ascending: true },
        { column: 'sort_order', ascending: true },
        { column: 'key', ascending: true },
      ]),
      profiles: getRows<Row<'reward_profiles'>>(this.backend, TABLES.reward_profiles, [
        { column: 'sort_order', ascending: true },
        { column: 'key', ascending: true },
      ]),
      entries: getRows<Row<'reward_profile_entries'>>(this.backend, TABLES.reward_profile_entries, [
        { column: 'sort_order', ascending: true },
        { column: 'label', ascending: true },
      ]),
      entryKinds: getRows<Row<'reward_entry_kinds'>>(this.backend, TABLES.reward_entry_kinds, [
        { column: 'sort_order', ascending: true },
        { column: 'key', ascending: true },
      ]),
      amountModes: getRows<Row<'reward_entry_amount_modes'>>(this.backend, TABLES.reward_entry_amount_modes, [
        { column: 'sort_order', ascending: true },
        { column: 'key', ascending: true },
      ]),
      sourceKinds: getRows<Row<'reward_source_kinds'>>(this.backend, TABLES.reward_source_kinds, [
        { column: 'sort_order', ascending: true },
        { column: 'key', ascending: true },
      ]),
      formulas: getRows<Row<'balance_formulas'>>(this.backend, TABLES.balance_formulas, [
        { column: 'scope_key', ascending: true },
        { column: 'key', ascending: true },
      ]),
      resourceTypes: getRows<Row<'resource_types'>>(this.backend, TABLES.resource_types, [
        { column: 'sort_order', ascending: true },
        { column: 'key', ascending: true },
      ]),
      qualities: getRows<Row<'item_generation_qualities'>>(this.backend, TABLES.item_generation_qualities, [
        { column: 'sort_order', ascending: true },
        { column: 'key', ascending: true },
      ]),
      bucketProfiles: getRows<Row<'item_generation_bucket_profiles'>>(this.backend, TABLES.item_generation_bucket_profiles, [
        { column: 'key', ascending: true },
      ]),
      effectDefinitions: getRows<Row<'exploration_effect_definitions'>>(this.backend, TABLES.exploration_effect_definitions, [
        { column: 'effect_kind', ascending: true },
        { column: 'sort_order', ascending: true },
        { column: 'key', ascending: true },
      ]),
    }).pipe(
      map((data) => ({
        outcomeKinds: data.outcomeKinds.map(mapRewardOutcomeKind),
        profiles: data.profiles.map(mapRewardProfile),
        entries: data.entries.map(mapRewardProfileEntry),
        entryKinds: data.entryKinds.map(mapRewardDictionary),
        amountModes: data.amountModes.map(mapRewardDictionary),
        sourceKinds: data.sourceKinds.map(mapRewardDictionary),
        formulas: data.formulas.map(mapBalanceFormula),
        resourceTypes: data.resourceTypes.map(mapResourceType),
        qualities: data.qualities.map(mapEditableQuality).map((quality) => ({
          key: quality.key,
          label: quality.label,
          sortOrder: quality.sortOrder,
          isEnabled: quality.isEnabled,
        })),
        bucketProfiles: data.bucketProfiles.map(mapEditableBucketProfile).map((profile) => ({
          id: profile.id,
          key: profile.key,
          name: profile.name,
          isActive: profile.isActive,
        })),
        effectDefinitions: data.effectDefinitions.map(mapExplorationEffectDefinition).map((effect) => ({
          id: effect.id,
          key: effect.key,
          label: effect.label,
          effectKind: effect.effectKind,
          isActive: effect.isActive,
        })),
      })),
    );
  }

  upsertOutcomeKind(input: UpsertRewardOutcomeKindInput): Observable<RewardOutcomeKindReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['upsert_reward_outcome_kind']['Returns']>(
        RPC.upsert_reward_outcome_kind,
        toUpsertRewardOutcomeKindRpcArgs(input),
      )
      .pipe(map(mapRewardOutcomeKind));
  }

  deactivateOutcomeKind(
    sourceKind: string,
    key: string,
    reason: string,
  ): Observable<RewardOutcomeKindReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['deactivate_reward_outcome_kind']['Returns']>(
        RPC.deactivate_reward_outcome_kind,
        toDeactivateRewardOutcomeKindRpcArgs(sourceKind, key, reason),
      )
      .pipe(map(mapRewardOutcomeKind));
  }

  upsertProfile(input: UpsertRewardProfileInput): Observable<RewardProfileReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['upsert_reward_profile']['Returns']>(
        RPC.upsert_reward_profile,
        toUpsertRewardProfileRpcArgs(input),
      )
      .pipe(map(mapRewardProfile));
  }

  deactivateProfile(rewardProfileId: string, reason: string): Observable<RewardProfileReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['deactivate_reward_profile']['Returns']>(
        RPC.deactivate_reward_profile,
        toDeactivateRewardProfileRpcArgs(rewardProfileId, reason),
      )
      .pipe(map(mapRewardProfile));
  }

  upsertEntry(input: UpsertRewardProfileEntryInput): Observable<RewardProfileEntryReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['upsert_reward_profile_entry']['Returns']>(
        RPC.upsert_reward_profile_entry,
        toUpsertRewardProfileEntryRpcArgs(input),
      )
      .pipe(map(mapRewardProfileEntry));
  }

  deactivateEntry(entryId: string, reason: string): Observable<RewardProfileEntryReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['deactivate_reward_profile_entry']['Returns']>(
        RPC.deactivate_reward_profile_entry,
        toDeactivateRewardProfileEntryRpcArgs(entryId, reason),
      )
      .pipe(map(mapRewardProfileEntry));
  }
}

function getRows<T extends object>(
  backend: Backend,
  table: string,
  orderBy: Array<{ column: string; ascending: boolean }>,
) {
  return backend.getAll<T>({
    table,
    orderBy,
    camelCase: false,
  });
}
