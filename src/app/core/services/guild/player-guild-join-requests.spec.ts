import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import {
  CancelGuildJoinRequestRpcRow,
  CreateGuildJoinRequestRpcRow,
  GetHeroGuildJoinRequestRowsRpcRow,
  ReviewGuildJoinRequestRpcRow,
} from '../../types/guild-rpc.types';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import { PlayerGuildJoinRequests } from './player-guild-join-requests';

describe('PlayerGuildJoinRequests', () => {
  let service: PlayerGuildJoinRequests;
  let backend: jasmine.SpyObj<Backend>;
  let activeHero: Pick<ActiveHero, 'requireActiveHero' | 'state'> & {
    requireActiveHero: jasmine.Spy;
  };
  let activeHeroState: ActiveHeroState;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc']);
    activeHeroState = activeContext();
    activeHero = {
      requireActiveHero: jasmine.createSpy('requireActiveHero'),
      state: signal<ActiveHeroState | null>(activeHeroState).asReadonly(),
    };
    activeHero.requireActiveHero.and.returnValue(of(activeHeroState as any));

    TestBed.configureTestingModule({
      providers: [
        PlayerGuildJoinRequests,
        { provide: Backend, useValue: backend },
        { provide: ActiveHero, useValue: activeHero },
      ],
    });

    service = TestBed.inject(PlayerGuildJoinRequests);
  });

  it('loads active hero guild join requests through canonical RPC', async () => {
    backend.rpc.and.returnValue(of([joinRequestRow()]));

    const result = await firstValueFrom(service.getActiveHeroGuildJoinRequests(true));

    expect(backend.rpc).toHaveBeenCalledWith('get_hero_guild_join_request_rows', {
      p_hero_id: 'hero-1',
      p_include_terminal: true,
    });
    expect(result[0]).toEqual(jasmine.objectContaining({
      joinRequestId: 'join-request-1',
      canAccept: true,
      canReject: true,
    }));
  });

  it('creates guild join request through canonical RPC only', async () => {
    backend.rpc.and.returnValue(of([createJoinRequestRow()]));

    const result = await firstValueFrom(service.createGuildJoinRequestForActiveHero({
      guildId: ' guild-1 ',
      reason: ' I can help. ',
      requestId: 'request-1',
    }));

    expect(backend.rpc).toHaveBeenCalledWith('create_guild_join_request', {
      p_requester_hero_id: 'hero-1',
      p_guild_id: 'guild-1',
      p_expires_at: undefined,
      p_reason: 'I can help.',
      p_request_id: 'request-1',
    });
    expect(result).toEqual(jasmine.objectContaining({
      joinRequestId: 'join-request-1',
      statusKey: 'pending',
    }));
  });

  it('reviews guild join request through canonical RPC only', async () => {
    backend.rpc.and.returnValue(of([reviewJoinRequestRow()]));

    const result = await firstValueFrom(service.reviewGuildJoinRequestForActiveHero({
      joinRequestId: 'join-request-1',
      accept: true,
      reason: 'Accepted.',
      requestId: 'request-2',
    }));

    expect(backend.rpc).toHaveBeenCalledWith('review_guild_join_request', {
      p_actor_hero_id: 'hero-1',
      p_join_request_id: 'join-request-1',
      p_accept: true,
      p_reason: 'Accepted.',
      p_request_id: 'request-2',
    });
    expect(result).toEqual(jasmine.objectContaining({
      statusKey: 'accepted',
      membershipId: 'membership-1',
      memberCount: 13,
    }));
  });

  it('cancels guild join request through canonical RPC only', async () => {
    backend.rpc.and.returnValue(of([cancelJoinRequestRow()]));

    const result = await firstValueFrom(service.cancelGuildJoinRequestForActiveHero({
      joinRequestId: 'join-request-1',
      reason: 'Canceled.',
      requestId: 'request-3',
    }));

    expect(backend.rpc).toHaveBeenCalledWith('cancel_guild_join_request', {
      p_requester_hero_id: 'hero-1',
      p_join_request_id: 'join-request-1',
      p_reason: 'Canceled.',
      p_request_id: 'request-3',
    });
    expect(result).toEqual(jasmine.objectContaining({
      statusKey: 'cancelled',
      membershipId: null,
    }));
  });
});

function activeContext(): ActiveHeroState {
  return {
    userId: 'user-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    server: {
      id: 'server-1',
      key: 'server-1',
      name: 'Server',
      kind: 'standard',
      status: 'live',
      description: null,
      launchedAt: null,
      archivedAt: null,
      membershipStatus: 'active',
      membership: null,
      staffRole: null,
      canManage: false,
      canUseAsSandbox: false,
    },
    hero: {} as ActiveHeroState['hero'],
    heroRow: {} as ActiveHeroState['heroRow'],
  };
}

function joinRequestRow(): GetHeroGuildJoinRequestRowsRpcRow {
  return {
    can_accept: true,
    can_cancel: false,
    can_reject: true,
    created_at: '2026-05-08T10:00:00.000Z',
    expires_at: '2026-05-09T10:00:00.000Z',
    guild_id: 'guild-1',
    guild_name: 'Argonauts',
    guild_tag: 'ARGO',
    join_request_id: 'join-request-1',
    reason: 'I can help.',
    requester_hero_id: 'hero-1',
    requester_hero_name: 'Requester Hero',
    reviewed_at: '',
    reviewed_by_hero_id: '',
    reviewed_by_hero_name: '',
    status_key: 'pending',
    status_reason: '',
  };
}

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
