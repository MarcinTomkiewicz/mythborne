import { Database } from './database.types';

export type AssignGlobalRoleRpcArgs =
  Database['public']['Functions']['assign_global_role']['Args'];
export type AssignServerStaffRpcArgs =
  Database['public']['Functions']['assign_server_staff']['Args'];
export type RevokeServerStaffRpcArgs =
  Database['public']['Functions']['revoke_server_staff']['Args'];
export type SearchServerStaffCandidatesRpcArgs =
  Database['public']['Functions']['search_server_staff_candidates']['Args'];
export type SetServerStaffPermissionScopesRpcArgs =
  Database['public']['Functions']['set_server_staff_permission_scopes']['Args'];
export type UserHasHeroOnServerRpcArgs =
  Database['public']['Functions']['user_has_hero_on_server']['Args'];
export type UserHasStaffDisqualifyingHistoryRpcArgs =
  Database['public']['Functions']['user_has_staff_disqualifying_history']['Args'];
