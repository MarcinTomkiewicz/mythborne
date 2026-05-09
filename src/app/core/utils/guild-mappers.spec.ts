import {
  GetGuildConfigSummaryRpcRow,
  GetHeroGuildDashboardRpcRow,
  GetHeroGuildInvitationRowsRpcRow,
  GetHeroGuildJoinRequestRowsRpcRow,
  GetHeroGuildMembersRpcRow,
  GetHeroGuildStateRpcRow,
  SearchGuildsForHeroRpcRow,
} from '../types/guild-rpc.types';
import {
  mapCurrentHeroGuildState,
  mapGuildConfigSummary,
  mapGuildDetail,
  mapGuildInvite,
  mapGuildJoinRequest,
  mapGuildMemberListItem,
  mapGuildSearchResult,
} from './guild-mappers';

describe('guild mappers', () => {
  it('maps guild config without frontend constants', () => {
    expect(mapGuildConfigSummary(configRow())).toEqual({
      creationDrachmaCost: 1000,
      memberBaseLimit: 10,
      memberLimitPerLeaderLevel: 2,
      leaderInactivityThresholdDays: 15,
      nominationDurationMinutes: 360,
      votingDurationMinutes: 720,
      emergencyMaxCandidates: 3,
      armoryCapacity: 0,
      armoryCapacityIsUnlimited: true,
    });
  });

  it('maps current hero guild state with explicit no-guild branch', () => {
    const state = mapCurrentHeroGuildState(guildStateRow({
      guild_id: '',
      membership_id: '',
      can_create_guild: true,
    }));

    expect(state.guild).toBeNull();
    expect(state.membership).toBeNull();
    expect(state.canCreateGuild).toBeTrue();
    expect(state.permissions.canStartEmergencyElection).toBeFalse();
  });

  it('maps current hero guild state without exposing account ids', () => {
    const state = mapCurrentHeroGuildState(guildStateRow());

    expect(state.guild).toEqual(jasmine.objectContaining({
      guildId: 'guild-1',
      serverId: 'server-1',
      name: 'Argonauts',
      tag: 'ARGO',
      memberCount: 12,
      memberLimit: 30,
    }));
    expect(state.membership).toEqual(jasmine.objectContaining({
      membershipId: 'membership-1',
      heroId: 'hero-1',
      roleKey: 'officer',
      roleLabel: 'Officer',
    }));
    expect(JSON.stringify(state)).not.toContain('user-');
  });

  it('maps guild dashboard detail and permissions', () => {
    expect(mapGuildDetail(guildDashboardRow())).toEqual(jasmine.objectContaining({
      guildId: 'guild-1',
      currentHeroId: 'hero-1',
      currentRoleKey: 'leader',
      armoryAvailableCount: 7,
      armoryBorrowedCount: 2,
      activeElectionId: null,
      activeElectionStatusKey: null,
      permissions: {
        canInvite: true,
        canManageArmory: true,
        canManageMembers: true,
        canStartEmergencyElection: false,
      },
    }));
  });

  it('maps member rows without leaking member account ids', () => {
    const member = mapGuildMemberListItem(memberRow());

    expect(member).toEqual({
      guildId: 'guild-1',
      memberHeroId: 'member-hero-1',
      memberName: 'Member Hero',
      roleKey: 'member',
      roleLabel: 'Member',
      membershipStatusKey: 'active',
      joinedAt: '2026-05-08T10:00:00.000Z',
      createdAt: '2026-05-08T09:00:00.000Z',
    });
    expect(JSON.stringify(member)).not.toContain('user-1');
  });

  it('maps invites and join requests preserving reasons', () => {
    expect(mapGuildInvite(inviteRow({
      reason: '',
      status_reason: 'expired by system',
      responded_at: '',
    }))).toEqual(jasmine.objectContaining({
      inviteId: 'invite-1',
      guildName: 'Argonauts',
      reason: null,
      statusReason: 'expired by system',
      respondedAt: null,
      canAccept: true,
    }));

    expect(mapGuildJoinRequest(joinRequestRow({
      reviewed_by_hero_id: '',
      reviewed_by_hero_name: '',
      reviewed_at: '',
    }))).toEqual(jasmine.objectContaining({
      joinRequestId: 'join-request-1',
      requesterHeroName: 'Requester Hero',
      reviewedByHeroId: null,
      reviewedByHeroName: null,
      reviewedAt: null,
      reason: 'I can help.',
    }));
  });

  it('maps guild discovery rows without exposing raw/private fields', () => {
    const result = mapGuildSearchResult([
      searchGuildRow({
        current_join_request_status_key: '',
        current_invite_status_key: 'pending',
      }),
    ], 'argo', 10, 5);

    expect(result).toEqual({
      query: 'argo',
      limit: 10,
      offset: 5,
      totalCount: 3,
      guilds: [
        {
          guildId: 'guild-1',
          serverId: 'server-1',
          name: 'Argonauts',
          tag: 'ARGO',
          statusKey: 'active',
          memberCount: 12,
          memberLimit: 30,
          canRequestToJoin: true,
          currentJoinRequestStatusKey: null,
          currentInviteStatusKey: 'pending',
        },
      ],
    });
    expect(JSON.stringify(result)).not.toContain('total_count');
    expect(JSON.stringify(result)).not.toContain('member_user_id');
  });

  it('maps empty guild discovery result total from DB rows only', () => {
    expect(mapGuildSearchResult([], null, 25, 0)).toEqual({
      query: null,
      limit: 25,
      offset: 0,
      totalCount: 0,
      guilds: [],
    });
  });
});

function configRow(): GetGuildConfigSummaryRpcRow {
  return {
    creation_drachma_cost: 1000,
    member_base_limit: 10,
    member_limit_per_leader_level: 2,
    leader_inactivity_threshold_days: 15,
    nomination_duration_minutes: 360,
    voting_duration_minutes: 720,
    emergency_max_candidates: 3,
    armory_capacity: 0,
    armory_capacity_is_unlimited: true,
  };
}

function guildStateRow(
  overrides: Partial<GetHeroGuildStateRpcRow> = {},
): GetHeroGuildStateRpcRow {
  return {
    hero_id: 'hero-1',
    server_id: 'server-1',
    guild_id: 'guild-1',
    guild_name: 'Argonauts',
    guild_tag: 'ARGO',
    guild_status_key: 'active',
    membership_id: 'membership-1',
    membership_status_key: 'active',
    role_key: 'officer',
    role_label: 'Officer',
    member_count: 12,
    member_limit: 30,
    can_create_guild: false,
    can_invite: true,
    can_manage_armory: true,
    can_manage_members: true,
    ...overrides,
  };
}

function guildDashboardRow(
  overrides: Partial<GetHeroGuildDashboardRpcRow> = {},
): GetHeroGuildDashboardRpcRow {
  return {
    ...guildStateRow({
      role_key: 'leader',
      role_label: 'Leader',
      can_invite: true,
      can_manage_armory: true,
      can_manage_members: true,
    }),
    active_election_id: '',
    active_election_status_key: '',
    armory_available_count: 7,
    armory_borrowed_count: 2,
    can_start_emergency_election: false,
    my_active_loan_count: 1,
    my_armory_access_status_key: 'allowed',
    my_deposited_item_count: 3,
    pending_invite_count: 4,
    pending_join_request_count: 5,
    ...overrides,
  };
}

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
    joined_at: '2026-05-08T10:00:00.000Z',
    created_at: '2026-05-08T09:00:00.000Z',
    ...overrides,
  };
}

function inviteRow(
  overrides: Partial<GetHeroGuildInvitationRowsRpcRow> = {},
): GetHeroGuildInvitationRowsRpcRow {
  return {
    invite_id: 'invite-1',
    guild_id: 'guild-1',
    guild_name: 'Argonauts',
    guild_tag: 'ARGO',
    inviter_hero_id: 'inviter-hero-1',
    inviter_hero_name: 'Inviter Hero',
    target_hero_id: 'target-hero-1',
    target_hero_name: 'Target Hero',
    status_key: 'pending',
    reason: 'Join us.',
    status_reason: '',
    created_at: '2026-05-08T10:00:00.000Z',
    expires_at: '2026-05-09T10:00:00.000Z',
    responded_at: '',
    can_accept: true,
    can_reject: true,
    can_cancel: false,
    ...overrides,
  };
}

function joinRequestRow(
  overrides: Partial<GetHeroGuildJoinRequestRowsRpcRow> = {},
): GetHeroGuildJoinRequestRowsRpcRow {
  return {
    join_request_id: 'join-request-1',
    guild_id: 'guild-1',
    guild_name: 'Argonauts',
    guild_tag: 'ARGO',
    requester_hero_id: 'requester-hero-1',
    requester_hero_name: 'Requester Hero',
    reviewed_by_hero_id: 'reviewer-hero-1',
    reviewed_by_hero_name: 'Reviewer Hero',
    status_key: 'pending',
    reason: 'I can help.',
    status_reason: '',
    created_at: '2026-05-08T10:00:00.000Z',
    expires_at: '2026-05-09T10:00:00.000Z',
    reviewed_at: '',
    can_accept: true,
    can_reject: true,
    can_cancel: false,
    ...overrides,
  };
}

function searchGuildRow(
  overrides: Partial<SearchGuildsForHeroRpcRow> = {},
): SearchGuildsForHeroRpcRow {
  return {
    guild_id: 'guild-1',
    server_id: 'server-1',
    name: 'Argonauts',
    tag: 'ARGO',
    status_key: 'active',
    member_count: 12,
    member_limit: 30,
    can_request_to_join: true,
    current_join_request_status_key: 'pending',
    current_invite_status_key: '',
    total_count: 3,
    ...overrides,
  };
}
