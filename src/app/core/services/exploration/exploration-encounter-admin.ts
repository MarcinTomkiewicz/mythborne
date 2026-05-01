import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import {
  EncounterCombatCandidateReadModel,
  ExplorationEncounterAdminData,
  UpsertEncounterCombatCandidateInput,
  UpsertEncounterDefinitionInput,
  UpsertEncounterRewardAssignmentInput,
} from '../../domain/exploration/exploration-encounter-admin.model';
import { EncounterDefinitionReadModel } from '../../domain/exploration/exploration-definition.model';
import { RewardProfileAssignmentReadModel } from '../../domain/exploration/exploration-reward.model';
import { Database } from '../../types/database.types';
import { Row } from '../../types/supabase.types';
import { mapBuildingDistricts } from '../../utils/building-admin-mappers';
import {
  mapEncounterDefinition,
  mapExplorationDifficultyTier,
  mapExplorationMinigameDefinition,
} from '../../utils/exploration-definition-mappers';
import {
  mapEncounterCombatCandidate,
} from '../../utils/exploration-encounter-admin-mappers';
import {
  toDeactivateEncounterCombatCandidateRpcArgs,
  toDeactivateEncounterDefinitionRpcArgs,
  toDeactivateRewardProfileAssignmentRpcArgs,
  toUpsertEncounterCombatCandidateRpcArgs,
  toUpsertEncounterDefinitionRpcArgs,
  toUpsertRewardProfileAssignmentRpcArgs,
} from '../../utils/exploration-encounter-admin-rpc';
import {
  mapCombatOpponentDefinition,
  mapCombatOpponentFamily,
} from '../../utils/exploration-trial-admin-mappers';
import {
  mapRewardProfile,
  mapRewardProfileAssignment,
} from '../../utils/exploration-reward-mappers';
import { mapBalanceFormula } from '../../utils/formula-admin-mappers';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class ExplorationEncounterAdmin {
  private readonly backend = inject(Backend);

  getAdminData(): Observable<ExplorationEncounterAdminData> {
    return forkJoin({
      encounters: this.backend.getAll<Row<'encounter_definitions'>>({
        table: TABLES.encounter_definitions,
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
      difficulties: this.backend.getAll<Row<'exploration_difficulty_tiers'>>({
        table: TABLES.exploration_difficulty_tiers,
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      }),
      districts: this.backend.getAll<Row<'estate_districts'>>({
        table: TABLES.estate_districts,
        orderBy: [
          { column: 'rank', ascending: true },
          { column: 'code', ascending: true },
        ],
        camelCase: false,
      }),
      rewardProfiles: this.backend.getAll<Row<'reward_profiles'>>({
        table: TABLES.reward_profiles,
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      }),
      rewardAssignments: this.backend.getAll<Row<'reward_profile_assignments'>>({
        table: TABLES.reward_profile_assignments,
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'id', ascending: true },
        ],
        camelCase: false,
      }),
      combatCandidates: this.backend.getAll<Row<'encounter_combat_candidates'>>({
        table: TABLES.encounter_combat_candidates,
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
    }).pipe(
      map((data) => ({
        encounters: data.encounters.map(mapEncounterDefinition),
        minigames: data.minigames.map(mapExplorationMinigameDefinition),
        difficulties: data.difficulties.map(mapExplorationDifficultyTier),
        districts: mapBuildingDistricts(data.districts),
        rewardProfiles: data.rewardProfiles.map(mapRewardProfile),
        rewardAssignments: data.rewardAssignments.map(mapRewardProfileAssignment),
        combatCandidates: data.combatCandidates.map(mapEncounterCombatCandidate),
        opponents: data.opponents.map(mapCombatOpponentDefinition),
        families: data.families.map(mapCombatOpponentFamily),
        formulas: data.formulas.map(mapBalanceFormula),
      })),
    );
  }

  upsertEncounterDefinition(
    input: UpsertEncounterDefinitionInput,
  ): Observable<EncounterDefinitionReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['upsert_encounter_definition']['Returns']>(
        RPC.upsert_encounter_definition,
        toUpsertEncounterDefinitionRpcArgs(input),
      )
      .pipe(map(mapEncounterDefinition));
  }

  deactivateEncounterDefinition(
    encounterDefinitionId: string,
    reason: string,
  ): Observable<EncounterDefinitionReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['deactivate_encounter_definition']['Returns']>(
        RPC.deactivate_encounter_definition,
        toDeactivateEncounterDefinitionRpcArgs(encounterDefinitionId, reason),
      )
      .pipe(map(mapEncounterDefinition));
  }

  upsertEncounterCombatCandidate(
    input: UpsertEncounterCombatCandidateInput,
  ): Observable<EncounterCombatCandidateReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['upsert_encounter_combat_candidate']['Returns']>(
        RPC.upsert_encounter_combat_candidate,
        toUpsertEncounterCombatCandidateRpcArgs(input),
      )
      .pipe(map(mapEncounterCombatCandidate));
  }

  deactivateEncounterCombatCandidate(
    candidateId: string,
    reason: string,
  ): Observable<EncounterCombatCandidateReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['deactivate_encounter_combat_candidate']['Returns']>(
        RPC.deactivate_encounter_combat_candidate,
        toDeactivateEncounterCombatCandidateRpcArgs(candidateId, reason),
      )
      .pipe(map(mapEncounterCombatCandidate));
  }

  upsertRewardProfileAssignment(
    input: UpsertEncounterRewardAssignmentInput,
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
