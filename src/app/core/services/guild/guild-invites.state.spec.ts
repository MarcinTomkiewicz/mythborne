import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import {
  GuildInvite,
  GuildInviteOperationResult,
} from '../../domain/guild/guild.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { ActiveHero } from '../hero/active-hero';
import { CurrentGuildState } from './current-guild.state';
import { GuildInvitesState } from './guild-invites.state';
import { PlayerGuildInvites } from './player-guild-invites';

describe('GuildInvitesState', () => {
  let state: GuildInvitesState;
  let activeHeroState: ReturnType<typeof signal<ActiveHeroState | null>>;
  let currentGuild: jasmine.SpyObj<CurrentGuildState>;
  let playerGuildInvites: jasmine.SpyObj<PlayerGuildInvites>;

  beforeEach(() => {
    activeHeroState = signal<ActiveHeroState | null>(activeContext());
    currentGuild = jasmine.createSpyObj<CurrentGuildState>('CurrentGuildState', ['load']);
    playerGuildInvites = jasmine.createSpyObj<PlayerGuildInvites>('PlayerGuildInvites', [
      'cancelGuildInviteForActiveHero',
      'createGuildInviteForActiveHero',
      'getActiveHeroGuildInvites',
      'respondGuildInviteForActiveHero',
    ]);

    TestBed.configureTestingModule({
      providers: [
        GuildInvitesState,
        { provide: ActiveHero, useValue: { state: activeHeroState.asReadonly() } },
        { provide: CurrentGuildState, useValue: currentGuild },
        { provide: PlayerGuildInvites, useValue: playerGuildInvites },
      ],
    });

    state = TestBed.inject(GuildInvitesState);
  });

  it('loads guild invites for active hero', () => {
    playerGuildInvites.getActiveHeroGuildInvites.and.returnValue(of([invite()]));

    state.load(true);

    expect(playerGuildInvites.getActiveHeroGuildInvites).toHaveBeenCalledWith(true);
    expect(state.invites()[0].inviteId).toBe('invite-1');
    expect(state.isLoading()).toBeFalse();
    expect(state.error()).toBeNull();
  });

  it('accepts invite, refreshes current guild, and reloads invites', () => {
    playerGuildInvites.respondGuildInviteForActiveHero.and.returnValue(of(operation({
      statusKey: 'accepted',
      membershipId: 'membership-1',
      memberCount: 13,
      memberLimit: 30,
    })));
    playerGuildInvites.getActiveHeroGuildInvites.and.returnValue(of([]));

    state.respond({ inviteId: 'invite-1', accept: true, reason: 'Yes.' });

    expect(playerGuildInvites.respondGuildInviteForActiveHero).toHaveBeenCalledWith({
      inviteId: 'invite-1',
      accept: true,
      reason: 'Yes.',
    });
    expect(currentGuild.load).toHaveBeenCalled();
    expect(state.lastResult()?.membershipId).toBe('membership-1');
    expect(state.message()).toBe('Guild invite accepted.');
    expect(state.invites()).toEqual([]);
  });

  it('rejects invite without refreshing current guild', () => {
    playerGuildInvites.respondGuildInviteForActiveHero.and.returnValue(of(operation({
      statusKey: 'rejected',
    })));
    playerGuildInvites.getActiveHeroGuildInvites.and.returnValue(of([]));

    state.respond({ inviteId: 'invite-1', accept: false });

    expect(currentGuild.load).not.toHaveBeenCalled();
    expect(state.lastResult()?.statusKey).toBe('rejected');
    expect(state.message()).toBe('Guild invite rejected.');
  });

  it('creates and cancels invites through player guild service and refreshes current guild', () => {
    playerGuildInvites.createGuildInviteForActiveHero.and.returnValue(of(operation()));
    playerGuildInvites.cancelGuildInviteForActiveHero.and.returnValue(of(operation({
      statusKey: 'cancelled',
    })));
    playerGuildInvites.getActiveHeroGuildInvites.and.returnValue(of([]));

    state.create({ targetHeroId: 'target-hero-1', reason: 'Join us.' });
    state.cancel({ inviteId: 'invite-1', reason: 'Wrong target.' });

    expect(playerGuildInvites.createGuildInviteForActiveHero).toHaveBeenCalledWith({
      targetHeroId: 'target-hero-1',
      reason: 'Join us.',
    });
    expect(playerGuildInvites.cancelGuildInviteForActiveHero).toHaveBeenCalledWith({
      inviteId: 'invite-1',
      reason: 'Wrong target.',
    });
    expect(currentGuild.load).toHaveBeenCalledTimes(2);
    expect(state.lastResult()?.statusKey).toBe('cancelled');
  });

  it('surfaces rejected or invalid invite RPC errors clearly', () => {
    playerGuildInvites.respondGuildInviteForActiveHero.and.returnValue(
      throwError(() => new Error('Guild invite is expired.')),
    );

    state.respond({ inviteId: 'invite-1', accept: true });

    expect(state.error()).toBe('Guild invite is expired.');
    expect(state.isMutating()).toBeFalse();
  });

  it('ignores stale load success after active hero changes and clears invites', () => {
    const response = new Subject<GuildInvite[]>();
    playerGuildInvites.getActiveHeroGuildInvites.and.returnValue(response.asObservable());
    state.invites.set([invite()]);

    state.load();
    activeHeroState.set(activeContext({ heroId: 'hero-2' }));
    response.next([invite({ inviteId: 'stale-invite' })]);

    expect(state.invites()).toEqual([]);
    expect(state.error()).toBeNull();
    expect(state.isLoading()).toBeFalse();
  });

  it('ignores stale accept success after active server changes', () => {
    const response = new Subject<GuildInviteOperationResult>();
    playerGuildInvites.respondGuildInviteForActiveHero.and.returnValue(response.asObservable());
    playerGuildInvites.getActiveHeroGuildInvites.and.returnValue(of([]));

    state.respond({ inviteId: 'invite-1', accept: true });
    activeHeroState.set(activeContext({ serverId: 'server-2' }));
    response.next(operation({ statusKey: 'accepted', membershipId: 'membership-1' }));

    expect(state.lastResult()).toBeNull();
    expect(state.message()).toBeNull();
    expect(state.error()).toBeNull();
    expect(state.isMutating()).toBeFalse();
    expect(currentGuild.load).not.toHaveBeenCalled();
  });

  it('requires active hero context before loading or mutating', () => {
    activeHeroState.set(activeContext({ heroId: null }));
    state.invites.set([invite()]);

    state.load();
    state.cancel({ inviteId: 'invite-1' });

    expect(playerGuildInvites.getActiveHeroGuildInvites).not.toHaveBeenCalled();
    expect(playerGuildInvites.cancelGuildInviteForActiveHero).not.toHaveBeenCalled();
    expect(state.invites()).toEqual([]);
    expect(state.error()).toBe('No active hero for guild invites.');
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

function invite(overrides: Partial<GuildInvite> = {}): GuildInvite {
  return {
    inviteId: 'invite-1',
    guildId: 'guild-1',
    guildName: 'Argonauts',
    guildTag: 'ARGO',
    inviterHeroId: 'hero-2',
    inviterHeroName: 'Inviter Hero',
    targetHeroId: 'hero-1',
    targetHeroName: 'Target Hero',
    statusKey: 'pending',
    reason: 'Join us.',
    statusReason: null,
    createdAt: '2026-05-08T10:00:00.000Z',
    expiresAt: '2026-05-09T10:00:00.000Z',
    respondedAt: null,
    canAccept: true,
    canReject: true,
    canCancel: false,
    ...overrides,
  };
}

function operation(
  overrides: Partial<GuildInviteOperationResult> = {},
): GuildInviteOperationResult {
  return {
    inviteId: 'invite-1',
    guildId: 'guild-1',
    targetHeroId: 'hero-1',
    statusKey: 'pending',
    expiresAt: '2026-05-09T10:00:00.000Z',
    membershipId: null,
    memberCount: null,
    memberLimit: null,
    ...overrides,
  };
}
