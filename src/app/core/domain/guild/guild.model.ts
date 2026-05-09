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

export interface KickGuildMemberInput {
  targetHeroId: string;
  reason?: string | null;
  requestId?: string | null;
}

export interface PromoteGuildMemberInput {
  targetHeroId: string;
  reason?: string | null;
  requestId?: string | null;
}

export interface DemoteGuildOfficerInput {
  targetHeroId: string;
  reason?: string | null;
  requestId?: string | null;
}

export interface GuildMemberOperationResult {
  guildId: string;
  actorHeroId: string;
  targetHeroId: string;
  targetMembershipId: string;
  oldRoleKey: GuildRoleKey;
  newRoleKey: GuildRoleKey | null;
  statusKey: GuildMembershipStatusKey | null;
  endedAt: string | null;
}

export interface LeaveGuildInput {
  reason?: string | null;
  requestId?: string | null;
}

export interface DisbandGuildInput {
  reason: string;
  requestId?: string | null;
}

export interface GuildLeaveResult {
  kind: 'leave';
  guildId: string;
  actorHeroId: string;
  membershipId: string;
  oldRoleKey: GuildRoleKey;
  statusKey: GuildMembershipStatusKey;
  endedAt: string;
}

export interface GuildDisbandResult {
  kind: 'disband';
  guildId: string;
  actorHeroId: string;
  statusKey: GuildStatusKey;
  dissolvedAt: string;
  endedMembershipCount: number;
  cancelledInviteCount: number;
  cancelledJoinRequestCount: number;
}

export type GuildLifecycleOperationResult = GuildLeaveResult | GuildDisbandResult;

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

export interface CreateGuildInviteInput {
  targetHeroId: string;
  reason?: string | null;
  expiresAt?: string | null;
  requestId?: string | null;
}

export interface RespondGuildInviteInput {
  inviteId: string;
  accept: boolean;
  reason?: string | null;
  requestId?: string | null;
}

export interface CancelGuildInviteInput {
  inviteId: string;
  reason?: string | null;
  requestId?: string | null;
}

export interface GuildInviteOperationResult {
  inviteId: string;
  guildId: string;
  targetHeroId: string;
  statusKey: GuildInviteStatusKey;
  expiresAt: string | null;
  membershipId: string | null;
  memberCount: number | null;
  memberLimit: number | null;
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

export interface CreateGuildJoinRequestInput {
  guildId: string;
  reason?: string | null;
  expiresAt?: string | null;
  requestId?: string | null;
}

export interface ReviewGuildJoinRequestInput {
  joinRequestId: string;
  accept: boolean;
  reason?: string | null;
  requestId?: string | null;
}

export interface CancelGuildJoinRequestInput {
  joinRequestId: string;
  reason?: string | null;
  requestId?: string | null;
}

export interface GuildJoinRequestOperationResult {
  joinRequestId: string;
  guildId: string;
  requesterHeroId: string;
  statusKey: GuildJoinRequestStatusKey;
  expiresAt: string | null;
  membershipId: string | null;
  memberCount: number | null;
  memberLimit: number | null;
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
