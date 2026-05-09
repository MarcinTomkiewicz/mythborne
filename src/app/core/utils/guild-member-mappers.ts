import {
  DemoteGuildOfficerInput,
  GuildMemberListItem,
  GuildMemberOperationResult,
  KickGuildMemberInput,
  PromoteGuildMemberInput,
} from '../domain/guild/guild.model';
import {
  DemoteGuildOfficerRpcArgs,
  DemoteGuildOfficerRpcRow,
  GetHeroGuildMembersRpcRow,
  KickGuildMemberRpcArgs,
  KickGuildMemberRpcRow,
  PromoteGuildMemberToOfficerRpcArgs,
  PromoteGuildMemberToOfficerRpcRow,
} from '../types/guild-rpc.types';

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

export function toKickGuildMemberRpcArgs(
  actorHeroId: string,
  input: KickGuildMemberInput,
): KickGuildMemberRpcArgs {
  return {
    p_actor_hero_id: actorHeroId,
    p_target_hero_id: requiredText(input.targetHeroId, 'target hero id'),
    p_reason: nullableText(input.reason) ?? undefined,
    p_request_id: nullableText(input.requestId) ?? undefined,
  };
}

export function toPromoteGuildMemberRpcArgs(
  actorHeroId: string,
  input: PromoteGuildMemberInput,
): PromoteGuildMemberToOfficerRpcArgs {
  return {
    p_actor_hero_id: actorHeroId,
    p_target_hero_id: requiredText(input.targetHeroId, 'target hero id'),
    p_reason: nullableText(input.reason) ?? undefined,
    p_request_id: nullableText(input.requestId) ?? undefined,
  };
}

export function toDemoteGuildOfficerRpcArgs(
  actorHeroId: string,
  input: DemoteGuildOfficerInput,
): DemoteGuildOfficerRpcArgs {
  return {
    p_actor_hero_id: actorHeroId,
    p_target_hero_id: requiredText(input.targetHeroId, 'target hero id'),
    p_reason: nullableText(input.reason) ?? undefined,
    p_request_id: nullableText(input.requestId) ?? undefined,
  };
}

export function mapGuildMemberOperationResult(
  row:
    | KickGuildMemberRpcRow
    | PromoteGuildMemberToOfficerRpcRow
    | DemoteGuildOfficerRpcRow,
): GuildMemberOperationResult {
  return {
    guildId: row.guild_id,
    actorHeroId: row.actor_hero_id,
    targetHeroId: row.target_hero_id,
    targetMembershipId: row.target_membership_id,
    oldRoleKey: row.old_role_key,
    newRoleKey: 'new_role_key' in row ? row.new_role_key : null,
    statusKey: 'status_key' in row ? row.status_key : null,
    endedAt: 'ended_at' in row ? nullableText(row.ended_at) : null,
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
