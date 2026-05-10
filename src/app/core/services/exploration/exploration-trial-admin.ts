import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import {
  TRIAL_CONFIGURATOR_FIELD_METADATA_KEYS,
  TRIAL_CONFIGURATOR_FIELD_METADATA_NAMESPACE,
  TRIAL_CONFIGURATOR_SECTION_METADATA_KEYS,
  TRIAL_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
} from '../../constants/exploration-trial-ui-metadata.const';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import {
  ExplorationTrialAdminData,
  TrialCombatCandidateReadModel,
  UpsertTrialCombatCandidateInput,
  UpsertTrialDefinitionInput,
  UpsertTrialRewardAssignmentInput,
} from '../../domain/exploration/exploration-trial-admin.model';
import { TrialDefinitionReadModel } from '../../domain/exploration/exploration-definition.model';
import { RewardProfileAssignmentReadModel } from '../../domain/exploration/exploration-reward.model';
import { GetTrialDefinitionReadinessRpcRow } from '../../types/exploration-runtime-rpc.types';
import { mapBuildingDistricts } from '../../utils/building-admin-mappers';
import { mapUiMetadataEntry } from '../../utils/admin-ui-metadata';
import {
  mapExplorationDifficultyTier,
  mapExplorationMinigameDefinition,
  mapTrialDefinition,
} from '../../utils/exploration-definition-mappers';
import {
  mapCombatOpponentDefinition,
  mapCombatOpponentFamily,
} from '../../utils/combat-opponent-admin-mappers';
import {
  mapTrialCombatCandidate,
} from '../../utils/exploration-trial-admin-mappers';
import { mapTrialReadiness } from '../../utils/exploration-readiness-mappers';
import {
  mapResourceType,
  mapRewardDictionary,
  mapRewardOutcomeKind,
  mapRewardProfile,
  mapRewardProfileAssignment,
  mapRewardProfileEntry,
} from '../../utils/exploration-reward-mappers';
import {
  toDeactivateRewardProfileAssignmentRpcArgs,
  toDeactivateTrialCombatCandidateRpcArgs,
  toUpsertRewardProfileAssignmentRpcArgs,
  toUpsertTrialCombatCandidateRpcArgs,
  toUpsertTrialDefinitionRpcArgs,
} from '../../utils/exploration-trial-admin-rpc';
import { mapBalanceFormula } from '../../utils/formula-admin-mappers';
import { Database } from '../../types/database.types';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class ExplorationTrialAdmin {
  private readonly backend = inject(Backend);

  getAdminData(): Observable<ExplorationTrialAdminData> {
    return forkJoin({
      trials: this.backend.getAll<Row<'trial_definitions'>>({
        table: TABLES.trial_definitions,
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      }),
      minigames: this.backend.getAll<Row<'exploration_minigame_definitions'>>({
        table: TABLES.exploration_minigame_definitions,
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      }),
      stats: this.backend.getAll<Row<'stats'>>({
        table: TABLES.stats,
        orderBy: [
          { column: 'order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      }),
      difficulties: getRows<Row<'exploration_difficulty_tiers'>>(this.backend, TABLES.exploration_difficulty_tiers, [
        { column: 'sort_order', ascending: true },
        { column: 'key', ascending: true },
      ]),
      districts: getRows<Row<'estate_districts'>>(this.backend, TABLES.estate_districts, [
        { column: 'rank', ascending: true },
        { column: 'code', ascending: true },
      ]),
      rewardProfiles: getRows<Row<'reward_profiles'>>(this.backend, TABLES.reward_profiles, [
        { column: 'sort_order', ascending: true },
        { column: 'key', ascending: true },
      ]),
      rewardProfileEntries: getRows<Row<'reward_profile_entries'>>(this.backend, TABLES.reward_profile_entries, [
        { column: 'reward_profile_id', ascending: true },
        { column: 'sort_order', ascending: true },
        { column: 'label', ascending: true },
      ]),
      rewardOutcomeKinds: getRows<Row<'reward_outcome_kinds'>>(this.backend, TABLES.reward_outcome_kinds, [
        { column: 'source_kind', ascending: true },
        { column: 'sort_order', ascending: true },
        { column: 'key', ascending: true },
      ]),
      resourceTypes: getRows<Row<'resource_types'>>(this.backend, TABLES.resource_types, [
        { column: 'sort_order', ascending: true },
        { column: 'key', ascending: true },
      ]),
      rewardAssignmentMatchKinds: getRows<Row<'reward_assignment_match_kinds'>>(this.backend, TABLES.reward_assignment_match_kinds, [
        { column: 'sort_order', ascending: true },
        { column: 'key', ascending: true },
      ]),
      rewardSourceKinds: getRows<Row<'reward_source_kinds'>>(this.backend, TABLES.reward_source_kinds, [
        { column: 'sort_order', ascending: true },
        { column: 'key', ascending: true },
      ]),
      rewardEntryKinds: getRows<Row<'reward_entry_kinds'>>(this.backend, TABLES.reward_entry_kinds, [
        { column: 'sort_order', ascending: true },
        { column: 'key', ascending: true },
      ]),
      rewardEntryAmountModes: getRows<Row<'reward_entry_amount_modes'>>(this.backend, TABLES.reward_entry_amount_modes, [
        { column: 'sort_order', ascending: true },
        { column: 'key', ascending: true },
      ]),
      rewardAssignments: getRows<Row<'reward_profile_assignments'>>(this.backend, TABLES.reward_profile_assignments, [
        { column: 'sort_order', ascending: true },
        { column: 'id', ascending: true },
      ]),
      trialReadiness: this.backend.rpc<GetTrialDefinitionReadinessRpcRow[]>(
        RPC.get_trial_definition_readiness,
        {},
      ),
      combatCandidates: this.backend.getAll<Row<'trial_combat_candidates'>>({
        table: TABLES.trial_combat_candidates,
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'id', ascending: true },
        ],
        camelCase: false,
      }),
      opponents: this.backend.getAll<Row<'combat_opponent_definitions'>>({
        table: TABLES.combat_opponent_definitions,
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      }),
      families: this.backend.getAll<Row<'combat_opponent_families'>>({
        table: TABLES.combat_opponent_families,
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      }),
      formulas: this.backend.getAll<Row<'balance_formulas'>>({
        table: TABLES.balance_formulas,
        orderBy: [
          { column: 'scope_key', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      }),
      uiMetadataEntries: getTrialConfiguratorUiMetadata(this.backend),
    }).pipe(
      map((data) => ({
        trials: data.trials.map(mapTrialDefinition),
        minigames: data.minigames.map(mapExplorationMinigameDefinition),
        stats: data.stats.map((row) => ({
          key: row.key,
          label: row.label,
          description: row.description,
          helperText: row.helper_text,
          adminDescription: row.admin_description,
        })),
        difficulties: data.difficulties.map(mapExplorationDifficultyTier),
        districts: mapBuildingDistricts(data.districts),
        rewardProfiles: data.rewardProfiles.map(mapRewardProfile),
        rewardProfileEntries: data.rewardProfileEntries.map(mapRewardProfileEntry),
        rewardOutcomeKinds: data.rewardOutcomeKinds.map(mapRewardOutcomeKind),
        resourceTypes: data.resourceTypes.map(mapResourceType),
        rewardAssignmentMatchKinds: data.rewardAssignmentMatchKinds.map(mapRewardDictionary),
        rewardSourceKinds: data.rewardSourceKinds.map(mapRewardDictionary),
        rewardEntryKinds: data.rewardEntryKinds.map(mapRewardDictionary),
        rewardEntryAmountModes: data.rewardEntryAmountModes.map(mapRewardDictionary),
        rewardAssignments: data.rewardAssignments.map(mapRewardProfileAssignment),
        trialReadiness: data.trialReadiness.map(mapTrialReadiness),
        combatCandidates: data.combatCandidates.map(mapTrialCombatCandidate),
        opponents: data.opponents.map(mapCombatOpponentDefinition),
        families: data.families.map(mapCombatOpponentFamily),
        formulas: data.formulas.map(mapBalanceFormula),
        uiMetadataEntries: data.uiMetadataEntries,
      })),
    );
  }

  upsertTrialDefinition(
    input: UpsertTrialDefinitionInput,
  ): Observable<TrialDefinitionReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['upsert_trial_definition']['Returns']>(
        RPC.upsert_trial_definition,
        toUpsertTrialDefinitionRpcArgs(input),
      )
      .pipe(map(mapTrialDefinition));
  }

  upsertTrialCombatCandidate(
    input: UpsertTrialCombatCandidateInput,
  ): Observable<TrialCombatCandidateReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['upsert_trial_combat_candidate']['Returns']>(
        RPC.upsert_trial_combat_candidate,
        toUpsertTrialCombatCandidateRpcArgs(input),
      )
      .pipe(map(mapTrialCombatCandidate));
  }

  deactivateTrialCombatCandidate(
    candidateId: string,
    reason: string,
  ): Observable<TrialCombatCandidateReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['deactivate_trial_combat_candidate']['Returns']>(
        RPC.deactivate_trial_combat_candidate,
        toDeactivateTrialCombatCandidateRpcArgs(candidateId, reason),
      )
      .pipe(map(mapTrialCombatCandidate));
  }

  upsertRewardProfileAssignment(
    input: UpsertTrialRewardAssignmentInput,
  ): Observable<RewardProfileAssignmentReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['upsert_reward_profile_assignment']['Returns']>(
        RPC.upsert_reward_profile_assignment,
        toUpsertRewardProfileAssignmentRpcArgs(input),
      )
      .pipe(map(mapRewardProfileAssignment));
  }

  deactivateRewardProfileAssignment(
    assignmentId: string,
    reason: string,
  ): Observable<RewardProfileAssignmentReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['deactivate_reward_profile_assignment']['Returns']>(
        RPC.deactivate_reward_profile_assignment,
        toDeactivateRewardProfileAssignmentRpcArgs(assignmentId, reason),
      )
      .pipe(map(mapRewardProfileAssignment));
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

function getTrialConfiguratorUiMetadata(backend: Backend) {
  return forkJoin([
    getUiMetadataEntries(
      backend,
      TRIAL_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      TRIAL_CONFIGURATOR_SECTION_METADATA_KEYS,
    ),
    getUiMetadataEntries(
      backend,
      TRIAL_CONFIGURATOR_FIELD_METADATA_NAMESPACE,
      TRIAL_CONFIGURATOR_FIELD_METADATA_KEYS,
    ),
  ]).pipe(map(([sections, fields]) => [...sections, ...fields].map(mapUiMetadataEntry)));
}

function getUiMetadataEntries(
  backend: Backend,
  namespace: string,
  keys: readonly string[],
) {
  return backend.rpc<Row<'ui_metadata_entries'>[]>(RPC.get_ui_metadata_entries, {
    p_namespace: namespace,
    p_keys: [...keys],
    p_include_inactive: false,
  });
}
