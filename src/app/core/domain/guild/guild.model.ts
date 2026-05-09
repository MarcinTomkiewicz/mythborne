import {
  GuildInviteStatusKey,
  GuildJoinRequestStatusKey,
  GuildMembershipStatusKey,
  GuildRoleKey,
  GuildStatusKey,
} from '../../types/guild-rpc.types';

export interface GuildSummary {
  guildId: string;
  serverId: string;
  name: string;
  tag: string;
  statusKey: GuildStatusKey;
  memberCount: number;
  memberLimit: number;
}

export interface GuildMembership {
  membershipId: string;
  guildId: string;
  heroId: string;
  statusKey: GuildMembershipStatusKey;
  roleKey: GuildRoleKey;
  roleLabel: string;
}

export interface CurrentHeroGuildState {
  heroId: string;
  serverId: string;
  guild: GuildSummary | null;
  membership: GuildMembership | null;
  canCreateGuild: boolean;
  permissions: GuildPermissions;
}

export interface CurrentGuildReadModel {
  heroId: string;
  serverId: string;
  state: CurrentHeroGuildState;
  detail: GuildDetail | null;
}

export interface GuildDetail extends GuildSummary {
  currentHeroId: string;
  currentMembershipId: string;
  currentMembershipStatusKey: GuildMembershipStatusKey;
  currentRoleKey: GuildRoleKey;
  currentRoleLabel: string;
  armoryAvailableCount: number;
  armoryBorrowedCount: number;
  myActiveLoanCount: number;
  myArmoryAccessStatusKey: string;
  myDepositedItemCount: number;
  pendingInviteCount: number;
  pendingJoinRequestCount: number;
  activeElectionId: string | null;
  activeElectionStatusKey: string | null;
  permissions: GuildPermissions;
}

export interface GuildPermissions {
  canInvite: boolean;
  canManageArmory: boolean;
  canManageMembers: boolean;
  canStartEmergencyElection: boolean;
}

export interface GuildMemberListItem {
  guildId: string;
  memberHeroId: string;
  memberName: string;
  roleKey: GuildRoleKey;
  roleLabel: string;
  membershipStatusKey: GuildMembershipStatusKey;
  joinedAt: string;
  createdAt: string;
}

export interface GuildInvite {
  inviteId: string;
  guildId: string;
  guildName: string;
  guildTag: string;
  inviterHeroId: string;
  inviterHeroName: string;
  targetHeroId: string;
  targetHeroName: string;
  statusKey: GuildInviteStatusKey;
  reason: string | null;
  statusReason: string | null;
  createdAt: string;
  expiresAt: string | null;
  respondedAt: string | null;
  canAccept: boolean;
  canReject: boolean;
  canCancel: boolean;
}

export interface GuildJoinRequest {
  joinRequestId: string;
  guildId: string;
  guildName: string;
  guildTag: string;
  requesterHeroId: string;
  requesterHeroName: string;
  reviewedByHeroId: string | null;
  reviewedByHeroName: string | null;
  statusKey: GuildJoinRequestStatusKey;
  reason: string | null;
  statusReason: string | null;
  createdAt: string;
  expiresAt: string | null;
  reviewedAt: string | null;
  canAccept: boolean;
  canReject: boolean;
  canCancel: boolean;
}

export interface GuildDiscoveryResult extends GuildSummary {
  canRequestToJoin: boolean;
  currentJoinRequestStatusKey: GuildJoinRequestStatusKey | null;
  currentInviteStatusKey: GuildInviteStatusKey | null;
}

export interface GuildSearchResult {
  query: string | null;
  limit: number;
  offset: number;
  totalCount: number;
  guilds: GuildDiscoveryResult[];
}

export interface GuildSearchFilters {
  query?: string | null;
  limit?: number;
  offset?: number;
}

export interface CreateGuildInput {
  name: string;
  tag: string;
  description?: string | null;
  reason?: string | null;
  requestId?: string | null;
}

export interface GuildCreateResult {
  guildId: string;
  serverId: string;
  leaderHeroId: string;
  membershipId: string;
  name: string;
  tag: string;
  statusKey: GuildStatusKey;
  creationDrachmaCost: number;
  drachmaBalanceAfter: number;
}

export interface GuildConfigSummary {
  creationDrachmaCost: number;
  memberBaseLimit: number;
  memberLimitPerLeaderLevel: number;
  leaderInactivityThresholdDays: number;
  nominationDurationMinutes: number;
  votingDurationMinutes: number;
  emergencyMaxCandidates: number;
  armoryCapacity: number;
  armoryCapacityIsUnlimited: boolean;
}
