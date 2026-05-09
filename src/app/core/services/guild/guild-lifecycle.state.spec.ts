import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import {
  GuildDisbandResult,
  GuildLeaveResult,
  GuildLifecycleOperationResult,
} from '../../domain/guild/guild.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { GuildRoleKey } from '../../types/guild-rpc.types';
import { ActiveHero } from '../hero/active-hero';
import { CurrentGuildState } from './current-guild.state';
import { GuildLifecycleState } from './guild-lifecycle.state';
import { PlayerGuildLifecycle } from './player-guild-lifecycle';

describe('GuildLifecycleState', () => {
  let state: GuildLifecycleState;
  let activeHeroState: ReturnType<typeof signal<ActiveHeroState | null>>;
  let currentGuild: jasmine.SpyObj<CurrentGuildState>;
  let currentRoleKey: ReturnType<typeof signal<GuildRoleKey | null>>;
  let playerGuildLifecycle: jasmine.SpyObj<PlayerGuildLifecycle>;

  beforeEach(() => {
    activeHeroState = signal<ActiveHeroState | null>(activeContext());
    currentRoleKey = signal<GuildRoleKey | null>('member');
    currentGuild = jasmine.createSpyObj<CurrentGuildState>('CurrentGuildState', ['load']);
    (currentGuild as unknown as { roleKey: () => GuildRoleKey | null }).roleKey =
      currentRoleKey.asReadonly();
    playerGuildLifecycle = jasmine.createSpyObj<PlayerGuildLifecycle>(
      'PlayerGuildLifecycle',
      ['disbandGuildForActiveHero', 'leaveGuildForActiveHero'],
    );

    TestBed.configureTestingModule({
      providers: [
        GuildLifecycleState,
        { provide: ActiveHero, useValue: { state: activeHeroState.asReadonly() } },
        { provide: CurrentGuildState, useValue: currentGuild },
        { provide: PlayerGuildLifecycle, useValue: playerGuildLifecycle },
      ],
    });

    state = TestBed.inject(GuildLifecycleState);
  });

  it('lets member leave guild and refreshes current guild state', () => {
    playerGuildLifecycle.leaveGuildForActiveHero.and.returnValue(of(leaveResult()));

    state.leave({ reason: 'Moving on.' });

    expect(playerGuildLifecycle.leaveGuildForActiveHero).toHaveBeenCalledWith({
      reason: 'Moving on.',
    });
    expect(currentGuild.load).toHaveBeenCalled();
    expect(state.lastResult()?.kind).toBe('leave');
    expect(state.message()).toBe('Guild left.');
  });

  it('blocks leader leave before calling RPC', () => {
    currentRoleKey.set('leader');

    state.leave({ reason: 'Cannot.' });

    expect(playerGuildLifecycle.leaveGuildForActiveHero).not.toHaveBeenCalled();
    expect(currentGuild.load).not.toHaveBeenCalled();
    expect(state.error()).toBe('Guild leader cannot leave guild through leave action.');
  });

  it('lets leader disband guild and refreshes current guild state', () => {
    currentRoleKey.set('leader');
    playerGuildLifecycle.disbandGuildForActiveHero.and.returnValue(of(disbandResult()));

    state.disband({ reason: 'Closing guild.' });

    expect(playerGuildLifecycle.disbandGuildForActiveHero).toHaveBeenCalledWith({
      reason: 'Closing guild.',
    });
    expect(currentGuild.load).toHaveBeenCalled();
    expect(state.lastResult()?.kind).toBe('disband');
    expect(state.message()).toBe('Guild disbanded.');
  });

  it('blocks member disband before calling RPC', () => {
    state.disband({ reason: 'No authority.' });

    expect(playerGuildLifecycle.disbandGuildForActiveHero).not.toHaveBeenCalled();
    expect(currentGuild.load).not.toHaveBeenCalled();
    expect(state.error()).toBe('Only guild leader can disband guild.');
  });

  it('surfaces active-siege or DB lifecycle blockers', () => {
    currentRoleKey.set('leader');
    playerGuildLifecycle.disbandGuildForActiveHero.and.returnValue(
      throwError(() => new Error('Guild cannot be disbanded during active siege.')),
    );

    state.disband({ reason: 'Closing guild.' });

    expect(playerGuildLifecycle.disbandGuildForActiveHero).toHaveBeenCalled();
    expect(state.error()).toBe('Guild cannot be disbanded during active siege.');
    expect(state.isMutating()).toBeFalse();
  });

  it('ignores stale lifecycle success after active server changes', () => {
    const response = new Subject<GuildLeaveResult>();
    playerGuildLifecycle.leaveGuildForActiveHero.and.returnValue(response.asObservable());

    state.leave({ reason: 'Moving on.' });
    activeHeroState.set(activeContext({ serverId: 'server-2' }));
    response.next(leaveResult());

    expect(state.lastResult()).toBeNull();
    expect(state.message()).toBeNull();
    expect(state.error()).toBeNull();
    expect(state.isMutating()).toBeFalse();
    expect(currentGuild.load).not.toHaveBeenCalled();
  });

  it('requires active hero context before lifecycle actions', () => {
    activeHeroState.set(activeContext({ heroId: null }));

    state.leave();
    state.disband({ reason: 'Closing guild.' });

    expect(playerGuildLifecycle.leaveGuildForActiveHero).not.toHaveBeenCalled();
    expect(playerGuildLifecycle.disbandGuildForActiveHero).not.toHaveBeenCalled();
    expect(state.error()).toBe('No active hero for guild lifecycle action.');
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

function leaveResult(): GuildLeaveResult {
  return {
    kind: 'leave',
    guildId: 'guild-1',
    actorHeroId: 'hero-1',
    membershipId: 'membership-1',
    oldRoleKey: 'member',
    statusKey: 'left',
    endedAt: '2026-05-09T10:00:00.000Z',
  };
}

function disbandResult(): GuildDisbandResult {
  return {
    kind: 'disband',
    guildId: 'guild-1',
    actorHeroId: 'hero-1',
    statusKey: 'disbanded',
    dissolvedAt: '2026-05-09T11:00:00.000Z',
    endedMembershipCount: 3,
    cancelledInviteCount: 2,
    cancelledJoinRequestCount: 1,
  };
}
