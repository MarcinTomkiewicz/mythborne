import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  EncounterCombatCandidateReadModel,
  EncounterEffectPayloadReadModel,
  EncounterResourcePayloadReadModel,
  ExplorationEncounterAdminData,
  ExplorationEffectDefinitionReadModel,
  UpsertEncounterCombatCandidateInput,
  UpsertEncounterDefinitionInput,
  UpsertEncounterEffectPayloadInput,
  UpsertEncounterResourcePayloadInput,
  UpsertEncounterRewardAssignmentInput,
  UpsertExplorationEffectDefinitionInput,
} from '../../domain/exploration/exploration-encounter-admin.model';
import { EncounterDefinitionReadModel } from '../../domain/exploration/exploration-definition.model';
import { RewardProfileAssignmentReadModel } from '../../domain/exploration/exploration-reward.model';
import { Database } from '../../types/database.types';
import { mapEncounterDefinition } from '../../utils/exploration-definition-mappers';
import {
  mapEncounterCombatCandidate,
} from '../../utils/exploration-encounter-admin-mappers';
import {
  mapEncounterEffectPayload,
  mapEncounterResourcePayload,
  mapExplorationEffectDefinition,
} from '../../utils/exploration-encounter-payload-admin-mappers';
import {
  toDeactivateEncounterCombatCandidateRpcArgs,
  toDeactivateEncounterDefinitionRpcArgs,
  toDeactivateRewardProfileAssignmentRpcArgs,
  toUpsertEncounterCombatCandidateRpcArgs,
  toUpsertEncounterDefinitionRpcArgs,
  toUpsertRewardProfileAssignmentRpcArgs,
} from '../../utils/exploration-encounter-admin-rpc';
import {
  toDeactivateEncounterEffectPayloadRpcArgs,
  toDeactivateEncounterResourcePayloadRpcArgs,
  toDeactivateExplorationEffectDefinitionRpcArgs,
  toUpsertEncounterEffectPayloadRpcArgs,
  toUpsertEncounterResourcePayloadRpcArgs,
  toUpsertExplorationEffectDefinitionRpcArgs,
} from '../../utils/exploration-encounter-payload-rpc';
import { mapRewardProfileAssignment } from '../../utils/exploration-reward-mappers';
import { Backend } from '../backend/backend';
import { getExplorationEncounterAdminData } from './exploration-encounter-admin-data';

@Injectable({ providedIn: 'root' })
export class ExplorationEncounterAdmin {
  private readonly backend = inject(Backend);

  getAdminData(): Observable<ExplorationEncounterAdminData> {
    return getExplorationEncounterAdminData(this.backend);
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

  upsertEncounterResourcePayload(
    input: UpsertEncounterResourcePayloadInput,
  ): Observable<EncounterResourcePayloadReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['upsert_encounter_resource_payload']['Returns']>(
        RPC.upsert_encounter_resource_payload,
        toUpsertEncounterResourcePayloadRpcArgs(input),
      )
      .pipe(map(mapEncounterResourcePayload));
  }

  deactivateEncounterResourcePayload(
    payloadId: string,
    reason: string,
  ): Observable<EncounterResourcePayloadReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['deactivate_encounter_resource_payload']['Returns']>(
        RPC.deactivate_encounter_resource_payload,
        toDeactivateEncounterResourcePayloadRpcArgs(payloadId, reason),
      )
      .pipe(map(mapEncounterResourcePayload));
  }

  upsertExplorationEffectDefinition(
    input: UpsertExplorationEffectDefinitionInput,
  ): Observable<ExplorationEffectDefinitionReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['upsert_exploration_effect_definition']['Returns']>(
        RPC.upsert_exploration_effect_definition,
        toUpsertExplorationEffectDefinitionRpcArgs(input),
      )
      .pipe(map(mapExplorationEffectDefinition));
  }

  deactivateExplorationEffectDefinition(
    effectDefinitionId: string,
    reason: string,
  ): Observable<ExplorationEffectDefinitionReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['deactivate_exploration_effect_definition']['Returns']>(
        RPC.deactivate_exploration_effect_definition,
        toDeactivateExplorationEffectDefinitionRpcArgs(effectDefinitionId, reason),
      )
      .pipe(map(mapExplorationEffectDefinition));
  }

  upsertEncounterEffectPayload(
    input: UpsertEncounterEffectPayloadInput,
  ): Observable<EncounterEffectPayloadReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['upsert_encounter_effect_payload']['Returns']>(
        RPC.upsert_encounter_effect_payload,
        toUpsertEncounterEffectPayloadRpcArgs(input),
      )
      .pipe(map(mapEncounterEffectPayload));
  }

  deactivateEncounterEffectPayload(
    payloadId: string,
    reason: string,
  ): Observable<EncounterEffectPayloadReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['deactivate_encounter_effect_payload']['Returns']>(
        RPC.deactivate_encounter_effect_payload,
        toDeactivateEncounterEffectPayloadRpcArgs(payloadId, reason),
      )
      .pipe(map(mapEncounterEffectPayload));
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
