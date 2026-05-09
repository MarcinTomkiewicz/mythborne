import {
  CancelGuildJoinRequestRpcRow,
  CreateGuildJoinRequestRpcRow,
  ReviewGuildJoinRequestRpcRow,
} from '../types/guild-rpc.types';
import {
  mapGuildJoinRequestOperationResult,
  toCancelGuildJoinRequestRpcArgs,
  toCreateGuildJoinRequestRpcArgs,
  toReviewGuildJoinRequestRpcArgs,
} from './guild-join-request-mappers';

describe('guild join request mappers', () => {
  it('maps guild join request RPC args and trims optional text', () => {
    expect(toCreateGuildJoinRequestRpcArgs('hero-1', {
      guildId: ' guild-1 ',
      reason: ' I can help. ',
      expiresAt: ' 2026-05-09T10:00:00.000Z ',
      requestId: ' request-1 ',
    })).toEqual({
      p_requester_hero_id: 'hero-1',
      p_guild_id: 'guild-1',
      p_reason: 'I can help.',
      p_expires_at: '2026-05-09T10:00:00.000Z',
      p_request_id: 'request-1',
    });

    expect(toReviewGuildJoinRequestRpcArgs('hero-2', {
      joinRequestId: ' join-request-1 ',
      accept: true,
      reason: ' Accepted. ',
      requestId: ' request-2 ',
    })).toEqual({
      p_actor_hero_id: 'hero-2',
      p_join_request_id: 'join-request-1',
      p_accept: true,
      p_reason: 'Accepted.',
      p_request_id: 'request-2',
    });

    expect(toCancelGuildJoinRequestRpcArgs('hero-1', {
      joinRequestId: ' join-request-1 ',
      reason: ' Canceled. ',
      requestId: ' request-3 ',
    })).toEqual({
      p_requester_hero_id: 'hero-1',
      p_join_request_id: 'join-request-1',
      p_reason: 'Canceled.',
      p_request_id: 'request-3',
    });
  });

  it('maps join request operation results without exposing audit log id', () => {
    const createResult = mapGuildJoinRequestOperationResult(createJoinRequestRow());
    const acceptResult = mapGuildJoinRequestOperationResult(reviewJoinRequestRow());
    const cancelResult = mapGuildJoinRequestOperationResult(cancelJoinRequestRow());

    expect(createResult).toEqual({
      joinRequestId: 'join-request-1',
      guildId: 'guild-1',
      requesterHeroId: 'hero-1',
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

function createJoinRequestRow(): CreateGuildJoinRequestRpcRow {
  return {
    audit_log_id: 'audit-log-1',
    expires_at: '2026-05-09T10:00:00.000Z',
    guild_id: 'guild-1',
    join_request_id: 'join-request-1',
    requester_hero_id: 'hero-1',
    status_key: 'pending',
  };
}

function reviewJoinRequestRow(): ReviewGuildJoinRequestRpcRow {
  return {
    audit_log_id: 'audit-log-1',
    guild_id: 'guild-1',
    join_request_id: 'join-request-1',
    member_count: 13,
    member_limit: 30,
    membership_id: 'membership-1',
    requester_hero_id: 'hero-1',
    status_key: 'accepted',
  };
}

function cancelJoinRequestRow(): CancelGuildJoinRequestRpcRow {
  return {
    audit_log_id: 'audit-log-1',
    guild_id: 'guild-1',
    join_request_id: 'join-request-1',
    requester_hero_id: 'hero-1',
    status_key: 'cancelled',
  };
}
