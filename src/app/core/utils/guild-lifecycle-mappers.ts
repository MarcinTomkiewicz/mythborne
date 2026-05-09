import {
  DisbandGuildInput,
  GuildDisbandResult,
  GuildLeaveResult,
  LeaveGuildInput,
} from '../domain/guild/guild.model';
import {
  DisbandGuildRpcArgs,
  DisbandGuildRpcRow,
  LeaveGuildRpcArgs,
  LeaveGuildRpcRow,
} from '../types/guild-rpc.types';

export function toLeaveGuildRpcArgs(
  actorHeroId: string,
  input: LeaveGuildInput,
): LeaveGuildRpcArgs {
  return {
    p_actor_hero_id: actorHeroId,
    p_reason: nullableText(input.reason) ?? undefined,
    p_request_id: nullableText(input.requestId) ?? undefined,
  };
}

export function toDisbandGuildRpcArgs(
  actorHeroId: string,
  input: DisbandGuildInput,
): DisbandGuildRpcArgs {
  return {
    p_actor_hero_id: actorHeroId,
    p_reason: requiredText(input.reason, 'disband reason'),
    p_request_id: nullableText(input.requestId) ?? undefined,
  };
}

export function mapGuildLeaveResult(row: LeaveGuildRpcRow): GuildLeaveResult {
  return {
    kind: 'leave',
    guildId: row.guild_id,
    actorHeroId: row.actor_hero_id,
    membershipId: row.membership_id,
    oldRoleKey: row.old_role_key,
    statusKey: row.status_key,
    endedAt: row.ended_at,
  };
}

export function mapGuildDisbandResult(row: DisbandGuildRpcRow): GuildDisbandResult {
  return {
    kind: 'disband',
    guildId: row.guild_id,
    actorHeroId: row.actor_hero_id,
    statusKey: row.status_key,
    dissolvedAt: row.dissolved_at,
    endedMembershipCount: row.ended_membership_count,
    cancelledInviteCount: row.cancelled_invite_count,
    cancelledJoinRequestCount: row.cancelled_join_request_count,
  };
}

function nullableText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function requiredText(value: string, label: string): string {
  const trimmed = nullableText(value);

  if (!trimmed) {
    throw new Error(`${label} is required.`);
  }

  return trimmed;
}
