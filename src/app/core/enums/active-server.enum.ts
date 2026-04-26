export enum GlobalRoleKey {
  Admin = 'admin',
  Moderator = 'moderator',
  Operator = 'operator',
  Player = 'player',
  Tester = 'tester',
}

export const GLOBAL_ROLE_PRIORITY = [
  GlobalRoleKey.Admin,
  GlobalRoleKey.Operator,
  GlobalRoleKey.Tester,
  GlobalRoleKey.Moderator,
  GlobalRoleKey.Player,
] as const;

export enum GameServerKind {
  Sandbox = 'sandbox',
  Standard = 'standard',
}

export enum GameServerStatus {
  Archived = 'archived',
  Draft = 'draft',
  Live = 'live',
  Scheduled = 'scheduled',
  Testing = 'testing',
}

export enum ServerStaffRole {
  Moderator = 'moderator',
  Operator = 'operator',
  Owner = 'owner',
  Tester = 'tester',
}

export enum ServerMembershipStatus {
  Active = 'active',
  Banned = 'banned',
  Suspended = 'suspended',
}

export enum GameServerOrderColumn {
  Kind = 'kind',
  Name = 'name',
  Status = 'status',
}

export enum ServerSortRank {
  Sandbox = 0,
  StandardLiveForGuest = 0,
  StandardLiveForUser = 1,
  StandardScheduled = 2,
  Testing = 3,
  Draft = 4,
  Fallback = 5,
}

export const SERVER_SANDBOX_KEY = 'sandbox';
