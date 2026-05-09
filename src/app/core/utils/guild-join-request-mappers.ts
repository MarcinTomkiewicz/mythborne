import {
  CancelGuildJoinRequestInput,
  CreateGuildJoinRequestInput,
  GuildJoinRequestOperationResult,
  ReviewGuildJoinRequestInput,
} from '../domain/guild/guild.model';
import {
  CancelGuildJoinRequestRpcArgs,
  CancelGuildJoinRequestRpcRow,
  CreateGuildJoinRequestRpcArgs,
  CreateGuildJoinRequestRpcRow,
  ReviewGuildJoinRequestRpcArgs,
  ReviewGuildJoinRequestRpcRow,
} from '../types/guild-rpc.types';

export function toCreateGuildJoinRequestRpcArgs(
  requesterHeroId: string,
  input: CreateGuildJoinRequestInput,
): CreateGuildJoinRequestRpcArgs {
  return {
    p_requester_hero_id: requesterHeroId,
    p_guild_id: requiredText(input.guildId, 'guild id'),
    p_expires_at: nullableText(input.expiresAt) ?? undefined,
    p_reason: nullableText(input.reason) ?? undefined,
    p_request_id: nullableText(input.requestId) ?? undefined,
  };
}

export function toReviewGuildJoinRequestRpcArgs(
  actorHeroId: string,
  input: ReviewGuildJoinRequestInput,
): ReviewGuildJoinRequestRpcArgs {
  return {
    p_actor_hero_id: actorHeroId,
    p_join_request_id: requiredText(input.joinRequestId, 'join request id'),
    p_accept: input.accept,
    p_reason: nullableText(input.reason) ?? undefined,
    p_request_id: nullableText(input.requestId) ?? undefined,
  };
}

export function toCancelGuildJoinRequestRpcArgs(
  requesterHeroId: string,
  input: CancelGuildJoinRequestInput,
): CancelGuildJoinRequestRpcArgs {
  return {
    p_requester_hero_id: requesterHeroId,
    p_join_request_id: requiredText(input.joinRequestId, 'join request id'),
    p_reason: nullableText(input.reason) ?? undefined,
    p_request_id: nullableText(input.requestId) ?? undefined,
  };
}

export function mapGuildJoinRequestOperationResult(
  row:
    | CreateGuildJoinRequestRpcRow
    | ReviewGuildJoinRequestRpcRow
    | CancelGuildJoinRequestRpcRow,
): GuildJoinRequestOperationResult {
  return {
    joinRequestId: row.join_request_id,
    guildId: row.guild_id,
    requesterHeroId: row.requester_hero_id,
    statusKey: row.status_key,
    expiresAt: 'expires_at' in row ? nullableText(row.expires_at) : null,
    membershipId: 'membership_id' in row ? nullableText(row.membership_id) : null,
    memberCount: 'member_count' in row ? row.member_count : null,
    memberLimit: 'member_limit' in row ? row.member_limit : null,
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
