import {
  DisbandGuildRpcRow,
  LeaveGuildRpcRow,
} from '../types/guild-rpc.types';
import {
  mapGuildDisbandResult,
  mapGuildLeaveResult,
  toDisbandGuildRpcArgs,
  toLeaveGuildRpcArgs,
} from './guild-lifecycle-mappers';

describe('guild lifecycle mappers', () => {
  it('maps leave and disband RPC args with trimmed reasons', () => {
    expect(toLeaveGuildRpcArgs('hero-1', {
      reason: ' Moving on. ',
      requestId: ' request-1 ',
    })).toEqual({
      p_actor_hero_id: 'hero-1',
      p_reason: 'Moving on.',
      p_request_id: 'request-1',
    });

    expect(toDisbandGuildRpcArgs('hero-1', {
      reason: ' Closing guild. ',
      requestId: ' request-2 ',
    })).toEqual({
      p_actor_hero_id: 'hero-1',
      p_reason: 'Closing guild.',
      p_request_id: 'request-2',
    });
  });

  it('requires disband reason', () => {
    expect(() => toDisbandGuildRpcArgs('hero-1', { reason: ' ' }))
      .toThrowError('disband reason is required.');
  });

  it('maps lifecycle results without exposing audit log id', () => {
    const leaveResult = mapGuildLeaveResult(leaveRow());
    const disbandResult = mapGuildDisbandResult(disbandRow());

    expect(leaveResult).toEqual({
      kind: 'leave',
      guildId: 'guild-1',
      actorHeroId: 'member-hero-1',
      membershipId: 'membership-1',
      oldRoleKey: 'member',
      statusKey: 'left',
      endedAt: '2026-05-09T10:00:00.000Z',
    });
    expect(disbandResult).toEqual({
      kind: 'disband',
      guildId: 'guild-1',
      actorHeroId: 'leader-hero-1',
      statusKey: 'disbanded',
      dissolvedAt: '2026-05-09T11:00:00.000Z',
      endedMembershipCount: 3,
      cancelledInviteCount: 2,
      cancelledJoinRequestCount: 1,
    });
    expect(JSON.stringify([leaveResult, disbandResult])).not.toContain('audit-log-1');
  });
});

function leaveRow(overrides: Partial<LeaveGuildRpcRow> = {}): LeaveGuildRpcRow {
  return {
    actor_hero_id: 'member-hero-1',
    audit_log_id: 'audit-log-1',
    ended_at: '2026-05-09T10:00:00.000Z',
    guild_id: 'guild-1',
    membership_id: 'membership-1',
    old_role_key: 'member',
    status_key: 'left',
    ...overrides,
  };
}

function disbandRow(overrides: Partial<DisbandGuildRpcRow> = {}): DisbandGuildRpcRow {
  return {
    actor_hero_id: 'leader-hero-1',
    audit_log_id: 'audit-log-1',
    cancelled_invite_count: 2,
    cancelled_join_request_count: 1,
    dissolved_at: '2026-05-09T11:00:00.000Z',
    ended_membership_count: 3,
    guild_id: 'guild-1',
    status_key: 'disbanded',
    ...overrides,
  };
}
