import {
  CancelGuildInviteInput,
  CreateGuildInviteInput,
  GuildInviteOperationResult,
  RespondGuildInviteInput,
} from '../domain/guild/guild.model';
import {
  CancelGuildInviteRpcArgs,
  CancelGuildInviteRpcRow,
  CreateGuildInviteRpcArgs,
  CreateGuildInviteRpcRow,
  RespondGuildInviteRpcArgs,
  RespondGuildInviteRpcRow,
} from '../types/guild-rpc.types';

export function toCreateGuildInviteRpcArgs(
  actorHeroId: string,
  input: CreateGuildInviteInput,
): CreateGuildInviteRpcArgs {
  return {
    p_actor_hero_id: actorHeroId,
    p_target_hero_id: requiredText(input.targetHeroId, 'target hero id'),
    p_expires_at: nullableText(input.expiresAt) ?? undefined,
    p_reason: nullableText(input.reason) ?? undefined,
    p_request_id: nullableText(input.requestId) ?? undefined,
  };
}

export function toRespondGuildInviteRpcArgs(
  targetHeroId: string,
  input: RespondGuildInviteInput,
): RespondGuildInviteRpcArgs {
  return {
    p_target_hero_id: targetHeroId,
    p_invite_id: requiredText(input.inviteId, 'invite id'),
    p_accept: input.accept,
    p_reason: nullableText(input.reason) ?? undefined,
    p_request_id: nullableText(input.requestId) ?? undefined,
  };
}

export function toCancelGuildInviteRpcArgs(
  actorHeroId: string,
  input: CancelGuildInviteInput,
): CancelGuildInviteRpcArgs {
  return {
    p_actor_hero_id: actorHeroId,
    p_invite_id: requiredText(input.inviteId, 'invite id'),
    p_reason: nullableText(input.reason) ?? undefined,
    p_request_id: nullableText(input.requestId) ?? undefined,
  };
}

export function mapGuildInviteOperationResult(
  row: CreateGuildInviteRpcRow | RespondGuildInviteRpcRow | CancelGuildInviteRpcRow,
): GuildInviteOperationResult {
  return {
    inviteId: row.invite_id,
    guildId: row.guild_id,
    targetHeroId: row.target_hero_id,
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
