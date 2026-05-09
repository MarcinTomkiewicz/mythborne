import {
  DemoteGuildOfficerRpcRow,
  GetHeroGuildMembersRpcRow,
  KickGuildMemberRpcRow,
  PromoteGuildMemberToOfficerRpcRow,
} from '../types/guild-rpc.types';
import {
  mapGuildMemberListItem,
  mapGuildMemberOperationResult,
  toDemoteGuildOfficerRpcArgs,
  toKickGuildMemberRpcArgs,
  toPromoteGuildMemberRpcArgs,
} from './guild-member-mappers';

describe('guild member mappers', () => {
  it('maps member rows without leaking member account ids', () => {
    const member = mapGuildMemberListItem(memberRow());

    expect(member).toEqual({
      guildId: 'guild-1',
      memberHeroId: 'member-hero-1',
      memberName: 'Member Hero',
      roleKey: 'member',
      roleLabel: 'Member',
      membershipStatusKey: 'active',
      armoryAccessStatusKey: 'blocked',
      joinedAt: '2026-05-08T10:00:00.000Z',
      createdAt: '2026-05-08T09:00:00.000Z',
    });
    expect(JSON.stringify(member)).not.toContain('user-1');
  });

  it('maps member action RPC args and trims optional text', () => {
    expect(toKickGuildMemberRpcArgs('hero-1', {
      targetHeroId: ' target-hero-1 ',
      reason: ' Rule breach. ',
      requestId: ' request-1 ',
    })).toEqual({
      p_actor_hero_id: 'hero-1',
      p_target_hero_id: 'target-hero-1',
      p_reason: 'Rule breach.',
      p_request_id: 'request-1',
    });

    expect(toPromoteGuildMemberRpcArgs('hero-1', {
      targetHeroId: ' target-hero-2 ',
      reason: ' Trusted. ',
      requestId: ' request-2 ',
    })).toEqual({
      p_actor_hero_id: 'hero-1',
      p_target_hero_id: 'target-hero-2',
      p_reason: 'Trusted.',
      p_request_id: 'request-2',
    });

    expect(toDemoteGuildOfficerRpcArgs('hero-1', {
      targetHeroId: ' target-hero-3 ',
      reason: ' Inactive. ',
      requestId: ' request-3 ',
    })).toEqual({
      p_actor_hero_id: 'hero-1',
      p_target_hero_id: 'target-hero-3',
      p_reason: 'Inactive.',
      p_request_id: 'request-3',
    });
  });

  it('maps kick/promote/demote results without exposing audit log id', () => {
    const kickResult = mapGuildMemberOperationResult(kickRow());
    const promoteResult = mapGuildMemberOperationResult(promoteRow());
    const demoteResult = mapGuildMemberOperationResult(demoteRow());

    expect(kickResult).toEqual({
      guildId: 'guild-1',
      actorHeroId: 'leader-hero-1',
      targetHeroId: 'member-hero-1',
      targetMembershipId: 'membership-1',
      oldRoleKey: 'member',
      newRoleKey: null,
      statusKey: 'removed',
      endedAt: '2026-05-09T10:00:00.000Z',
    });
    expect(promoteResult).toEqual(jasmine.objectContaining({
      oldRoleKey: 'member',
      newRoleKey: 'officer',
      statusKey: null,
    }));
    expect(demoteResult).toEqual(jasmine.objectContaining({
      oldRoleKey: 'officer',
      newRoleKey: 'member',
      statusKey: null,
    }));
    expect(JSON.stringify([kickResult, promoteResult, demoteResult]))
      .not.toContain('audit-log-1');
  });
});

function memberRow(
  overrides: Partial<GetHeroGuildMembersRpcRow> = {},
): GetHeroGuildMembersRpcRow {
  return {
    guild_id: 'guild-1',
    member_hero_id: 'member-hero-1',
    member_name: 'Member Hero',
    member_user_id: 'user-1',
    role_key: 'member',
    role_label: 'Member',
    membership_status_key: 'active',
    armory_access_status_key: 'blocked',
    joined_at: '2026-05-08T10:00:00.000Z',
    created_at: '2026-05-08T09:00:00.000Z',
    ...overrides,
  };
}

function kickRow(overrides: Partial<KickGuildMemberRpcRow> = {}): KickGuildMemberRpcRow {
  return {
    actor_hero_id: 'leader-hero-1',
    audit_log_id: 'audit-log-1',
    ended_at: '2026-05-09T10:00:00.000Z',
    guild_id: 'guild-1',
    old_role_key: 'member',
    status_key: 'removed',
    target_hero_id: 'member-hero-1',
    target_membership_id: 'membership-1',
    ...overrides,
  };
}

function promoteRow(
  overrides: Partial<PromoteGuildMemberToOfficerRpcRow> = {},
): PromoteGuildMemberToOfficerRpcRow {
  return {
    actor_hero_id: 'leader-hero-1',
    audit_log_id: 'audit-log-1',
    guild_id: 'guild-1',
    new_role_key: 'officer',
    old_role_key: 'member',
    target_hero_id: 'member-hero-1',
    target_membership_id: 'membership-1',
    ...overrides,
  };
}

function demoteRow(
  overrides: Partial<DemoteGuildOfficerRpcRow> = {},
): DemoteGuildOfficerRpcRow {
  return {
    actor_hero_id: 'leader-hero-1',
    audit_log_id: 'audit-log-1',
    guild_id: 'guild-1',
    new_role_key: 'member',
    old_role_key: 'officer',
    target_hero_id: 'officer-hero-1',
    target_membership_id: 'membership-2',
    ...overrides,
  };
}
