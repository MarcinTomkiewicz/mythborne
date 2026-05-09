import {
  CancelGuildInviteRpcRow,
  CreateGuildInviteRpcRow,
  RespondGuildInviteRpcRow,
} from '../types/guild-rpc.types';
import {
  mapGuildInviteOperationResult,
  toCancelGuildInviteRpcArgs,
  toCreateGuildInviteRpcArgs,
  toRespondGuildInviteRpcArgs,
} from './guild-invite-mappers';

describe('guild invite mappers', () => {
  it('maps guild invite RPC args and trims optional text', () => {
    expect(toCreateGuildInviteRpcArgs('hero-1', {
      targetHeroId: ' target-hero-1 ',
      reason: ' Join us. ',
      expiresAt: ' 2026-05-09T10:00:00.000Z ',
      requestId: ' request-1 ',
    })).toEqual({
      p_actor_hero_id: 'hero-1',
      p_target_hero_id: 'target-hero-1',
      p_reason: 'Join us.',
      p_expires_at: '2026-05-09T10:00:00.000Z',
      p_request_id: 'request-1',
    });

    expect(toRespondGuildInviteRpcArgs('hero-2', {
      inviteId: ' invite-1 ',
      accept: true,
      reason: ' Accepted. ',
      requestId: ' request-2 ',
    })).toEqual({
      p_target_hero_id: 'hero-2',
      p_invite_id: 'invite-1',
      p_accept: true,
      p_reason: 'Accepted.',
      p_request_id: 'request-2',
    });

    expect(toCancelGuildInviteRpcArgs('hero-1', {
      inviteId: ' invite-1 ',
      reason: ' Canceled. ',
      requestId: ' request-3 ',
    })).toEqual({
      p_actor_hero_id: 'hero-1',
      p_invite_id: 'invite-1',
      p_reason: 'Canceled.',
      p_request_id: 'request-3',
    });
  });

  it('maps guild invite operation results without exposing audit log id', () => {
    const createResult = mapGuildInviteOperationResult(createInviteRow());
    const acceptResult = mapGuildInviteOperationResult(respondInviteRow());
    const cancelResult = mapGuildInviteOperationResult(cancelInviteRow());

    expect(createResult).toEqual({
      inviteId: 'invite-1',
      guildId: 'guild-1',
      targetHeroId: 'target-hero-1',
      statusKey: 'pending',
      expiresAt: '2026-05-09T10:00:00.000Z',
      membershipId: null,
      memberCount: null,
      memberLimit: null,
    });
    expect(acceptResult).toEqual(jasmine.objectContaining({
      statusKey: 'accepted',
      membershipId: 'membership-1',
      memberCount: 13,
      memberLimit: 30,
    }));
    expect(cancelResult).toEqual(jasmine.objectContaining({
      statusKey: 'cancelled',
      membershipId: null,
    }));
    expect(JSON.stringify([createResult, acceptResult, cancelResult]))
      .not.toContain('audit-log-1');
  });
});

function createInviteRow(): CreateGuildInviteRpcRow {
  return {
    audit_log_id: 'audit-log-1',
    expires_at: '2026-05-09T10:00:00.000Z',
    guild_id: 'guild-1',
    invite_id: 'invite-1',
    status_key: 'pending',
    target_hero_id: 'target-hero-1',
  };
}

function respondInviteRow(): RespondGuildInviteRpcRow {
  return {
    audit_log_id: 'audit-log-1',
    guild_id: 'guild-1',
    invite_id: 'invite-1',
    member_count: 13,
    member_limit: 30,
    membership_id: 'membership-1',
    status_key: 'accepted',
    target_hero_id: 'target-hero-1',
  };
}

function cancelInviteRow(): CancelGuildInviteRpcRow {
  return {
    audit_log_id: 'audit-log-1',
    guild_id: 'guild-1',
    invite_id: 'invite-1',
    status_key: 'cancelled',
    target_hero_id: 'target-hero-1',
  };
}
