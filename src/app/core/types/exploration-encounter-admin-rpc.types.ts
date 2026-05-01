import { Database } from './database.types';

export type UpsertEncounterDefinitionRpcArgs =
  Database['public']['Functions']['upsert_encounter_definition']['Args'];
export type DeactivateEncounterDefinitionRpcArgs =
  Database['public']['Functions']['deactivate_encounter_definition']['Args'];
export type UpsertEncounterCombatCandidateRpcArgs =
  Database['public']['Functions']['upsert_encounter_combat_candidate']['Args'];
export type DeactivateEncounterCombatCandidateRpcArgs =
  Database['public']['Functions']['deactivate_encounter_combat_candidate']['Args'];
export type UpsertRewardProfileAssignmentRpcArgs =
  Database['public']['Functions']['upsert_reward_profile_assignment']['Args'];
export type DeactivateRewardProfileAssignmentRpcArgs =
  Database['public']['Functions']['deactivate_reward_profile_assignment']['Args'];
