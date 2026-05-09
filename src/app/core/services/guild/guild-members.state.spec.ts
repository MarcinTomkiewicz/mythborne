import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import {
  GuildMemberListItem,
  GuildMemberOperationResult,
} from '../../domain/guild/guild.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { GuildRoleKey } from '../../types/guild-rpc.types';
import { ActiveHero } from '../hero/active-hero';
import { CurrentGuildState } from './current-guild.state';
import { GuildMembersState } from './guild-members.state';
import { PlayerGuildMembers } from './player-guild-members';

describe('GuildMembersState', () => {
  let state: GuildMembersState;
  let activeHeroState: ReturnType<typeof signal<ActiveHeroState | null>>;
  let currentGuild: jasmine.SpyObj<CurrentGuildState>;
  let currentRoleKey: ReturnType<typeof signal<GuildRoleKey | null>>;
  let playerGuildMembers: jasmine.SpyObj<PlayerGuildMembers>;

  beforeEach(() => {
    activeHeroState = signal<ActiveHeroState | null>(activeContext());
    currentRoleKey = signal<GuildRoleKey | null>('leader');
    currentGuild = jasmine.createSpyObj<CurrentGuildState>('CurrentGuildState', ['load']);
    (currentGuild as unknown as { roleKey: () => GuildRoleKey | null }).roleKey =
      currentRoleKey.asReadonly();
    playerGuildMembers = jasmine.createSpyObj<PlayerGuildMembers>('PlayerGuildMembers', [
      'demoteGuildOfficerForActiveHero',
      'getActiveHeroGuildMembers',
      'kickGuildMemberForActiveHero',
      'promoteGuildMemberForActiveHero',
    ]);

    TestBed.configureTestingModule({
      providers: [
        GuildMembersState,
        { provide: ActiveHero, useValue: { state: activeHeroState.asReadonly() } },
        { provide: CurrentGuildState, useValue: currentGuild },
        { provide: PlayerGuildMembers, useValue: playerGuildMembers },
      ],
    });

    state = TestBed.inject(GuildMembersState);
  });

  it('loads guild members for active hero', () => {
    playerGuildMembers.getActiveHeroGuildMembers.and.returnValue(of([member()]));

    state.load();

    expect(playerGuildMembers.getActiveHeroGuildMembers).toHaveBeenCalled();
    expect(state.members()[0].memberHeroId).toBe('member-hero-1');
    expect(state.isLoading()).toBeFalse();
    expect(state.error()).toBeNull();
  });

  it('kicks member and refreshes member list plus current guild state', () => {
    state.members.set([member()]);
    playerGuildMembers.kickGuildMemberForActiveHero.and.returnValue(of(operation({
      statusKey: 'removed',
    })));
    playerGuildMembers.getActiveHeroGuildMembers.and.returnValue(of([]));

    state.kick({ targetHeroId: 'member-hero-1', reason: 'Rule breach.' });

    expect(playerGuildMembers.kickGuildMemberForActiveHero).toHaveBeenCalledWith({
      targetHeroId: 'member-hero-1',
      reason: 'Rule breach.',
    });
    expect(currentGuild.load).toHaveBeenCalled();
    expect(state.members()).toEqual([]);
    expect(state.lastResult()?.statusKey).toBe('removed');
    expect(state.message()).toBe('Guild member kicked.');
  });

  it('promotes and demotes through player guild member service', () => {
    state.members.set([
      member(),
      member({
        memberHeroId: 'officer-hero-1',
        roleKey: 'officer',
        roleLabel: 'Officer',
      }),
    ]);
    playerGuildMembers.promoteGuildMemberForActiveHero.and.returnValue(of(operation({
      newRoleKey: 'officer',
    })));
    playerGuildMembers.demoteGuildOfficerForActiveHero.and.returnValue(of(operation({
      targetHeroId: 'officer-hero-1',
      oldRoleKey: 'officer',
      newRoleKey: 'member',
    })));
    playerGuildMembers.getActiveHeroGuildMembers.and.returnValue(of([]));

    state.promote({ targetHeroId: 'member-hero-1', reason: 'Trusted.' });
    state.members.set([
      member({
        memberHeroId: 'officer-hero-1',
        roleKey: 'officer',
        roleLabel: 'Officer',
      }),
    ]);
    state.demote({ targetHeroId: 'officer-hero-1', reason: 'Inactive.' });

    expect(playerGuildMembers.promoteGuildMemberForActiveHero).toHaveBeenCalledWith({
      targetHeroId: 'member-hero-1',
      reason: 'Trusted.',
    });
    expect(playerGuildMembers.demoteGuildOfficerForActiveHero).toHaveBeenCalledWith({
      targetHeroId: 'officer-hero-1',
      reason: 'Inactive.',
    });
    expect(currentGuild.load).toHaveBeenCalledTimes(2);
    expect(state.lastResult()?.newRoleKey).toBe('member');
  });

  it('blocks role-disallowed actions before calling RPC', () => {
    currentRoleKey.set('officer');
    state.members.set([
      member(),
      member({
        memberHeroId: 'officer-hero-1',
        roleKey: 'officer',
        roleLabel: 'Officer',
      }),
    ]);

    state.promote({ targetHeroId: 'member-hero-1' });
    state.demote({ targetHeroId: 'officer-hero-1' });
    state.kick({ targetHeroId: 'officer-hero-1' });

    expect(playerGuildMembers.promoteGuildMemberForActiveHero).not.toHaveBeenCalled();
    expect(playerGuildMembers.demoteGuildOfficerForActiveHero).not.toHaveBeenCalled();
    expect(playerGuildMembers.kickGuildMemberForActiveHero).not.toHaveBeenCalled();
    expect(currentGuild.load).not.toHaveBeenCalled();
    expect(state.error()).toBe('Current hero cannot kick this guild member.');
  });

  it('does not frontend-calculate one-officer availability', () => {
    state.members.set([
      member(),
      member({
        memberHeroId: 'officer-hero-1',
        roleKey: 'officer',
        roleLabel: 'Officer',
      }),
    ]);
    playerGuildMembers.promoteGuildMemberForActiveHero.and.returnValue(
      throwError(() => new Error('Guild already has an active officer.')),
    );

    state.promote({ targetHeroId: 'member-hero-1' });

    expect(playerGuildMembers.promoteGuildMemberForActiveHero).toHaveBeenCalled();
    expect(state.error()).toBe('Guild already has an active officer.');
    expect(state.isMutating()).toBeFalse();
  });

  it('ignores stale load success after active hero changes and clears members', () => {
    const response = new Subject<GuildMemberListItem[]>();
    playerGuildMembers.getActiveHeroGuildMembers.and.returnValue(response.asObservable());
    state.members.set([member()]);

    state.load();
    activeHeroState.set(activeContext({ heroId: 'hero-2' }));
    response.next([member({ memberHeroId: 'stale-member' })]);

    expect(state.members()).toEqual([]);
    expect(state.error()).toBeNull();
    expect(state.isLoading()).toBeFalse();
  });

  it('ignores stale kick success after active server changes', () => {
    const response = new Subject<GuildMemberOperationResult>();
    state.members.set([member()]);
    playerGuildMembers.kickGuildMemberForActiveHero.and.returnValue(response.asObservable());
    playerGuildMembers.getActiveHeroGuildMembers.and.returnValue(of([]));

    state.kick({ targetHeroId: 'member-hero-1' });
    activeHeroState.set(activeContext({ serverId: 'server-2' }));
    response.next(operation({ statusKey: 'removed' }));

    expect(state.members()).toEqual([]);
    expect(state.lastResult()).toBeNull();
    expect(state.message()).toBeNull();
    expect(state.error()).toBeNull();
    expect(state.isMutating()).toBeFalse();
    expect(currentGuild.load).not.toHaveBeenCalled();
  });

  it('requires active hero context before loading or mutating', () => {
    activeHeroState.set(activeContext({ heroId: null }));
    state.members.set([member()]);

    state.load();
    state.kick({ targetHeroId: 'member-hero-1' });

    expect(playerGuildMembers.getActiveHeroGuildMembers).not.toHaveBeenCalled();
    expect(playerGuildMembers.kickGuildMemberForActiveHero).not.toHaveBeenCalled();
    expect(state.members()).toEqual([]);
    expect(state.error()).toBe('No active hero for guild members.');
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

function member(overrides: Partial<GuildMemberListItem> = {}): GuildMemberListItem {
  return {
    guildId: 'guild-1',
    memberHeroId: 'member-hero-1',
    memberName: 'Member Hero',
    roleKey: 'member',
    roleLabel: 'Member',
    membershipStatusKey: 'active',
    joinedAt: '2026-05-08T10:00:00.000Z',
    createdAt: '2026-05-08T09:00:00.000Z',
    ...overrides,
  };
}

function operation(
  overrides: Partial<GuildMemberOperationResult> = {},
): GuildMemberOperationResult {
  return {
    guildId: 'guild-1',
    actorHeroId: 'hero-1',
    targetHeroId: 'member-hero-1',
    targetMembershipId: 'membership-1',
    oldRoleKey: 'member',
    newRoleKey: null,
    statusKey: null,
    endedAt: null,
    ...overrides,
  };
}
