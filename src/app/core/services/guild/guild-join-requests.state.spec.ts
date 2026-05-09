import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import {
  GuildJoinRequest,
  GuildJoinRequestOperationResult,
} from '../../domain/guild/guild.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { ActiveHero } from '../hero/active-hero';
import { CurrentGuildState } from './current-guild.state';
import { GuildDiscoveryState } from './guild-discovery.state';
import { GuildJoinRequestsState } from './guild-join-requests.state';
import { PlayerGuildJoinRequests } from './player-guild-join-requests';

describe('GuildJoinRequestsState', () => {
  let state: GuildJoinRequestsState;
  let activeHeroState: ReturnType<typeof signal<ActiveHeroState | null>>;
  let currentGuild: jasmine.SpyObj<CurrentGuildState>;
  let discovery: jasmine.SpyObj<GuildDiscoveryState>;
  let playerGuildJoinRequests: jasmine.SpyObj<PlayerGuildJoinRequests>;

  beforeEach(() => {
    activeHeroState = signal<ActiveHeroState | null>(activeContext());
    currentGuild = jasmine.createSpyObj<CurrentGuildState>('CurrentGuildState', ['load']);
    discovery = jasmine.createSpyObj<GuildDiscoveryState>('GuildDiscoveryState', ['search']);
    playerGuildJoinRequests = jasmine.createSpyObj<PlayerGuildJoinRequests>(
      'PlayerGuildJoinRequests',
      [
        'cancelGuildJoinRequestForActiveHero',
        'createGuildJoinRequestForActiveHero',
        'getActiveHeroGuildJoinRequests',
        'reviewGuildJoinRequestForActiveHero',
      ],
    );

    TestBed.configureTestingModule({
      providers: [
        GuildJoinRequestsState,
        { provide: ActiveHero, useValue: { state: activeHeroState.asReadonly() } },
        { provide: CurrentGuildState, useValue: currentGuild },
        { provide: GuildDiscoveryState, useValue: discovery },
        { provide: PlayerGuildJoinRequests, useValue: playerGuildJoinRequests },
      ],
    });

    state = TestBed.inject(GuildJoinRequestsState);
  });

  it('loads guild join requests for active hero', () => {
    playerGuildJoinRequests.getActiveHeroGuildJoinRequests.and.returnValue(
      of([joinRequest()]),
    );

    state.load(true);

    expect(playerGuildJoinRequests.getActiveHeroGuildJoinRequests)
      .toHaveBeenCalledWith(true);
    expect(state.requests()[0].joinRequestId).toBe('join-request-1');
    expect(state.isLoading()).toBeFalse();
    expect(state.error()).toBeNull();
  });

  it('creates join request and refreshes current guild plus discovery state', () => {
    playerGuildJoinRequests.createGuildJoinRequestForActiveHero.and.returnValue(
      of(operation()),
    );
    playerGuildJoinRequests.getActiveHeroGuildJoinRequests.and.returnValue(of([]));

    state.create({ guildId: 'guild-1', reason: 'I can help.' });

    expect(playerGuildJoinRequests.createGuildJoinRequestForActiveHero)
      .toHaveBeenCalledWith({ guildId: 'guild-1', reason: 'I can help.' });
    expect(currentGuild.load).toHaveBeenCalled();
    expect(discovery.search).toHaveBeenCalled();
    expect(state.lastResult()?.statusKey).toBe('pending');
    expect(state.message()).toBe('Guild join request created.');
  });

  it('accepts join request and refreshes current guild plus discovery state', () => {
    playerGuildJoinRequests.reviewGuildJoinRequestForActiveHero.and.returnValue(
      of(operation({
        statusKey: 'accepted',
        membershipId: 'membership-1',
        memberCount: 13,
        memberLimit: 30,
      })),
    );
    playerGuildJoinRequests.getActiveHeroGuildJoinRequests.and.returnValue(of([]));

    state.review({ joinRequestId: 'join-request-1', accept: true, reason: 'Yes.' });

    expect(playerGuildJoinRequests.reviewGuildJoinRequestForActiveHero)
      .toHaveBeenCalledWith({
        joinRequestId: 'join-request-1',
        accept: true,
        reason: 'Yes.',
      });
    expect(currentGuild.load).toHaveBeenCalled();
    expect(discovery.search).toHaveBeenCalled();
    expect(state.lastResult()?.membershipId).toBe('membership-1');
    expect(state.message()).toBe('Guild join request accepted.');
  });

  it('rejects and cancels join requests with canonical terminal statuses', () => {
    playerGuildJoinRequests.reviewGuildJoinRequestForActiveHero.and.returnValue(
      of(operation({ statusKey: 'rejected' })),
    );
    playerGuildJoinRequests.cancelGuildJoinRequestForActiveHero.and.returnValue(
      of(operation({ statusKey: 'cancelled' })),
    );
    playerGuildJoinRequests.getActiveHeroGuildJoinRequests.and.returnValue(of([]));

    state.review({ joinRequestId: 'join-request-1', accept: false });
    state.cancel({ joinRequestId: 'join-request-1', reason: 'Changed mind.' });

    expect(state.lastResult()?.statusKey).toBe('cancelled');
    expect(currentGuild.load).toHaveBeenCalledTimes(2);
    expect(discovery.search).toHaveBeenCalledTimes(2);
  });

  it('surfaces duplicate or ineligible RPC errors clearly', () => {
    playerGuildJoinRequests.createGuildJoinRequestForActiveHero.and.returnValue(
      throwError(() => new Error('Hero already has a pending join request.')),
    );

    state.create({ guildId: 'guild-1' });

    expect(state.error()).toBe('Hero already has a pending join request.');
    expect(state.isMutating()).toBeFalse();
  });

  it('ignores stale load success after active hero changes and clears requests', () => {
    const response = new Subject<GuildJoinRequest[]>();
    playerGuildJoinRequests.getActiveHeroGuildJoinRequests.and.returnValue(
      response.asObservable(),
    );
    state.requests.set([joinRequest()]);

    state.load();
    activeHeroState.set(activeContext({ heroId: 'hero-2' }));
    response.next([joinRequest({ joinRequestId: 'stale-request' })]);

    expect(state.requests()).toEqual([]);
    expect(state.error()).toBeNull();
    expect(state.isLoading()).toBeFalse();
  });

  it('ignores stale accept success after active server changes', () => {
    const response = new Subject<GuildJoinRequestOperationResult>();
    playerGuildJoinRequests.reviewGuildJoinRequestForActiveHero.and.returnValue(
      response.asObservable(),
    );
    playerGuildJoinRequests.getActiveHeroGuildJoinRequests.and.returnValue(of([]));

    state.review({ joinRequestId: 'join-request-1', accept: true });
    activeHeroState.set(activeContext({ serverId: 'server-2' }));
    response.next(operation({ statusKey: 'accepted', membershipId: 'membership-1' }));

    expect(state.lastResult()).toBeNull();
    expect(state.message()).toBeNull();
    expect(state.error()).toBeNull();
    expect(state.isMutating()).toBeFalse();
    expect(currentGuild.load).not.toHaveBeenCalled();
    expect(discovery.search).not.toHaveBeenCalled();
  });

  it('requires active hero context before loading or mutating', () => {
    activeHeroState.set(activeContext({ heroId: null }));
    state.requests.set([joinRequest()]);

    state.load();
    state.cancel({ joinRequestId: 'join-request-1' });

    expect(playerGuildJoinRequests.getActiveHeroGuildJoinRequests).not.toHaveBeenCalled();
    expect(playerGuildJoinRequests.cancelGuildJoinRequestForActiveHero)
      .not.toHaveBeenCalled();
    expect(state.requests()).toEqual([]);
    expect(state.error()).toBe('No active hero for guild join requests.');
  });
});

function activeContext(
  overrides: Partial<Pick<ActiveHeroState, 'serverId' | 'heroId'>> = {},
): ActiveHeroState {
  return {
    userId: 'user-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    server: {} as ActiveHeroState['server'],
    hero: {} as ActiveHeroState['hero'],
    heroRow: {} as ActiveHeroState['heroRow'],
    ...overrides,
  };
}

function joinRequest(overrides: Partial<GuildJoinRequest> = {}): GuildJoinRequest {
  return {
    joinRequestId: 'join-request-1',
    guildId: 'guild-1',
    guildName: 'Argonauts',
    guildTag: 'ARGO',
    requesterHeroId: 'hero-1',
    requesterHeroName: 'Requester Hero',
    reviewedByHeroId: null,
    reviewedByHeroName: null,
    statusKey: 'pending',
    reason: 'I can help.',
    statusReason: null,
    createdAt: '2026-05-08T10:00:00.000Z',
    expiresAt: '2026-05-09T10:00:00.000Z',
    reviewedAt: null,
    canAccept: true,
    canReject: true,
    canCancel: false,
    ...overrides,
  };
}

function operation(
  overrides: Partial<GuildJoinRequestOperationResult> = {},
): GuildJoinRequestOperationResult {
  return {
    joinRequestId: 'join-request-1',
    guildId: 'guild-1',
    requesterHeroId: 'hero-1',
    statusKey: 'pending',
    expiresAt: '2026-05-09T10:00:00.000Z',
    membershipId: null,
    memberCount: null,
    memberLimit: null,
    ...overrides,
  };
}
