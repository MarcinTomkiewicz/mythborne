import { Database } from './database.types';

export type UpsertTrialDefinitionRpcArgs =
  Database['public']['Functions']['upsert_trial_definition']['Args'];
export type UpsertTrialCombatCandidateRpcArgs =
  Database['public']['Functions']['upsert_trial_combat_candidate']['Args'];
export type DeactivateTrialCombatCandidateRpcArgs =
  Database['public']['Functions']['deactivate_trial_combat_candidate']['Args'];
export type UpsertRewardProfileAssignmentRpcArgs =
  Database['public']['Functions']['upsert_reward_profile_assignment']['Args'];
export type DeactivateRewardProfileAssignmentRpcArgs =
  Database['public']['Functions']['deactivate_reward_profile_assignment']['Args'];
