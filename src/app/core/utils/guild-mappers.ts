import {
  CurrentHeroGuildState,
  GuildConfigSummary,
  GuildDetail,
  GuildDiscoveryResult,
  GuildInvite,
  GuildJoinRequest,
  GuildMemberListItem,
  GuildSearchResult,
} from '../domain/guild/guild.model';
import {
  GetGuildConfigSummaryRpcRow,
  GetHeroGuildDashboardRpcRow,
  GetHeroGuildInvitationRowsRpcRow,
  GetHeroGuildJoinRequestRowsRpcRow,
  GetHeroGuildMembersRpcRow,
  GetHeroGuildStateRpcRow,
  SearchGuildsForHeroRpcRow,
} from '../types/guild-rpc.types';

export function mapGuildConfigSummary(
  row: GetGuildConfigSummaryRpcRow,
): GuildConfigSummary {
  return {
    creationDrachmaCost: row.creation_drachma_cost,
    memberBaseLimit: row.member_base_limit,
    memberLimitPerLeaderLevel: row.member_limit_per_leader_level,
    leaderInactivityThresholdDays: row.leader_inactivity_threshold_days,
    nominationDurationMinutes: row.nomination_duration_minutes,
    votingDurationMinutes: row.voting_duration_minutes,
    emergencyMaxCandidates: row.emergency_max_candidates,
    armoryCapacity: row.armory_capacity,
    armoryCapacityIsUnlimited: row.armory_capacity_is_unlimited,
  };
}

export function mapCurrentHeroGuildState(
  row: GetHeroGuildStateRpcRow,
): CurrentHeroGuildState {
  const guildId = nullableText(row.guild_id);
  const membershipId = nullableText(row.membership_id);

  return {
    heroId: row.hero_id,
    serverId: row.server_id,
    guild: guildId
      ? {
          guildId,
          serverId: row.server_id,
          name: row.guild_name,
          tag: row.guild_tag,
          statusKey: row.guild_status_key,
          memberCount: row.member_count,
          memberLimit: row.member_limit,
        }
      : null,
    membership: guildId && membershipId
      ? {
          membershipId,
          guildId,
          heroId: row.hero_id,
          statusKey: row.membership_status_key,
          roleKey: row.role_key,
          roleLabel: row.role_label,
        }
      : null,
    canCreateGuild: row.can_create_guild,
    permissions: {
      canInvite: row.can_invite,
      canManageArmory: row.can_manage_armory,
      canManageMembers: row.can_manage_members,
      canStartEmergencyElection: false,
    },
  };
}

export function mapGuildDetail(row: GetHeroGuildDashboardRpcRow): GuildDetail {
  return {
    guildId: row.guild_id,
    serverId: row.server_id,
    name: row.guild_name,
    tag: row.guild_tag,
    statusKey: row.guild_status_key,
    memberCount: row.member_count,
    memberLimit: row.member_limit,
    currentHeroId: row.hero_id,
    currentMembershipId: row.membership_id,
    currentMembershipStatusKey: row.membership_status_key,
    currentRoleKey: row.role_key,
    currentRoleLabel: row.role_label,
    armoryAvailableCount: row.armory_available_count,
    armoryBorrowedCount: row.armory_borrowed_count,
    myActiveLoanCount: row.my_active_loan_count,
    myArmoryAccessStatusKey: row.my_armory_access_status_key,
    myDepositedItemCount: row.my_deposited_item_count,
    pendingInviteCount: row.pending_invite_count,
    pendingJoinRequestCount: row.pending_join_request_count,
    activeElectionId: nullableText(row.active_election_id),
    activeElectionStatusKey: nullableText(row.active_election_status_key),
    permissions: {
      canInvite: row.can_invite,
      canManageArmory: row.can_manage_armory,
      canManageMembers: row.can_manage_members,
      canStartEmergencyElection: row.can_start_emergency_election,
    },
  };
}

export function mapGuildMemberListItem(
  row: GetHeroGuildMembersRpcRow,
): GuildMemberListItem {
  return {
    guildId: row.guild_id,
    memberHeroId: row.member_hero_id,
    memberName: row.member_name,
    roleKey: row.role_key,
    roleLabel: row.role_label,
    membershipStatusKey: row.membership_status_key,
    joinedAt: row.joined_at,
    createdAt: row.created_at,
  };
}

export function mapGuildInvite(row: GetHeroGuildInvitationRowsRpcRow): GuildInvite {
  return {
    inviteId: row.invite_id,
    guildId: row.guild_id,
    guildName: row.guild_name,
    guildTag: row.guild_tag,
    inviterHeroId: row.inviter_hero_id,
    inviterHeroName: row.inviter_hero_name,
    targetHeroId: row.target_hero_id,
    targetHeroName: row.target_hero_name,
    statusKey: row.status_key,
    reason: nullableText(row.reason),
    statusReason: nullableText(row.status_reason),
    createdAt: row.created_at,
    expiresAt: nullableText(row.expires_at),
    respondedAt: nullableText(row.responded_at),
    canAccept: row.can_accept,
    canReject: row.can_reject,
    canCancel: row.can_cancel,
  };
}

export function mapGuildJoinRequest(
  row: GetHeroGuildJoinRequestRowsRpcRow,
): GuildJoinRequest {
  return {
    joinRequestId: row.join_request_id,
    guildId: row.guild_id,
    guildName: row.guild_name,
    guildTag: row.guild_tag,
    requesterHeroId: row.requester_hero_id,
    requesterHeroName: row.requester_hero_name,
    reviewedByHeroId: nullableText(row.reviewed_by_hero_id),
    reviewedByHeroName: nullableText(row.reviewed_by_hero_name),
    statusKey: row.status_key,
    reason: nullableText(row.reason),
    statusReason: nullableText(row.status_reason),
    createdAt: row.created_at,
    expiresAt: nullableText(row.expires_at),
    reviewedAt: nullableText(row.reviewed_at),
    canAccept: row.can_accept,
    canReject: row.can_reject,
    canCancel: row.can_cancel,
  };
}

export function mapGuildDiscoveryResult(
  row: SearchGuildsForHeroRpcRow,
): GuildDiscoveryResult {
  return {
    guildId: row.guild_id,
    serverId: row.server_id,
    name: row.name,
    tag: row.tag,
    statusKey: row.status_key,
    memberCount: row.member_count,
    memberLimit: row.member_limit,
    canRequestToJoin: row.can_request_to_join,
    currentJoinRequestStatusKey: nullableText(row.current_join_request_status_key),
    currentInviteStatusKey: nullableText(row.current_invite_status_key),
  };
}

export function mapGuildSearchResult(
  rows: readonly SearchGuildsForHeroRpcRow[],
  query: string | null,
  limit: number,
  offset: number,
): GuildSearchResult {
  return {
    query,
    limit,
    offset,
    totalCount: rows[0]?.total_count ?? 0,
    guilds: rows.map(mapGuildDiscoveryResult),
  };
}

function nullableText(value: string | null | undefined): string | null {
  return value ? value : null;
}
