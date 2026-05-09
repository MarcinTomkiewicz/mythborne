import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { GuildArmoryAccessLockState } from '../../../core/domain/guild/guild-armory.model';
import { GuildMemberListItem } from '../../../core/domain/guild/guild.model';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { CurrentGuildState } from '../../../core/services/guild/current-guild.state';
import { GuildMembersState } from '../../../core/services/guild/guild-members.state';
import { PlayerGuildArmoryActions } from '../../../core/services/guild/player-guild-armory-actions';
import { ToastService } from '../../../core/services/ui/toast';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { GuildRoleKey } from '../../../core/types/guild-rpc.types';
import { GuildArmoryMemberAccessState } from './guild-armory-member-access.state';
import { GuildArmoryReadState } from './guild-armory-read.state';

describe('GuildArmoryMemberAccessState', () => {
  let state: GuildArmoryMemberAccessState;
  let activeHeroState: ReturnType<typeof signal<ActiveHeroState | null>>;
  let currentGuild: jasmine.SpyObj<CurrentGuildState>;
  let guildArmory: jasmine.SpyObj<GuildArmoryReadState>;
  let guildMembers: FakeGuildMembersState;
  let playerGuildArmoryActions: jasmine.SpyObj<PlayerGuildArmoryActions>;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    activeHeroState = signal<ActiveHeroState | null>(activeContext());
    currentGuild = jasmine.createSpyObj<CurrentGuildState>('CurrentGuildState', ['load']);
    guildArmory = jasmine.createSpyObj<GuildArmoryReadState>('GuildArmoryReadState', ['load']);
    guildMembers = new FakeGuildMembersState();
    playerGuildArmoryActions = jasmine.createSpyObj<PlayerGuildArmoryActions>(
      'PlayerGuildArmoryActions',
      ['setGuildArmoryMemberAccessForActiveHero'],
    );
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    TestBed.configureTestingModule({
      providers: [
        GuildArmoryMemberAccessState,
        { provide: ActiveHero, useValue: { state: activeHeroState.asReadonly() } },
        { provide: CurrentGuildState, useValue: currentGuild },
        { provide: GuildArmoryReadState, useValue: guildArmory },
        { provide: GuildMembersState, useValue: guildMembers },
        { provide: PlayerGuildArmoryActions, useValue: playerGuildArmoryActions },
        { provide: ToastService, useValue: toast },
      ],
    });

    state = TestBed.inject(GuildArmoryMemberAccessState);
  });

  it('loads guild members through existing member state', () => {
    state.load();

    expect(guildMembers.load).toHaveBeenCalled();
  });

  it('blocks and allows member access through canonical armory action service', () => {
    playerGuildArmoryActions.setGuildArmoryMemberAccessForActiveHero.and.returnValues(
      of(accessResult({ statusKey: 'blocked' })),
      of(accessResult({ statusKey: 'allowed' })),
    );

    state.block(member());
    state.allow(member({ armoryAccessStatusKey: 'blocked' }));

    expect(playerGuildArmoryActions.setGuildArmoryMemberAccessForActiveHero)
      .toHaveBeenCalledWith({
        memberHeroId: 'member-hero-1',
        statusKey: 'blocked',
        reason: 'Blocked guild armory access.',
      });
    expect(playerGuildArmoryActions.setGuildArmoryMemberAccessForActiveHero)
      .toHaveBeenCalledWith({
        memberHeroId: 'member-hero-1',
        statusKey: 'allowed',
        reason: 'Allowed guild armory access.',
      });
    expect(guildMembers.load).toHaveBeenCalledTimes(2);
    expect(currentGuild.load).toHaveBeenCalledTimes(2);
    expect(guildArmory.load).toHaveBeenCalledTimes(2);
    expect(toast.show).toHaveBeenCalledWith(
      'success',
      'Guild armory access',
      'Guild armory access allowed.',
    );
  });

  it('blocks regular member before calling access RPC', () => {
    guildMembers.currentRoleKey.set('member');

    state.block(member());

    expect(playerGuildArmoryActions.setGuildArmoryMemberAccessForActiveHero)
      .not.toHaveBeenCalled();
    expect(state.error()).toBe('Current hero cannot manage guild armory access.');
    expect(state.isMutating()).toBeFalse();
    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Guild armory access failed',
      'Current hero cannot manage guild armory access.',
    );
  });

  it('surfaces access action errors without local access-state fallback', () => {
    playerGuildArmoryActions.setGuildArmoryMemberAccessForActiveHero.and.returnValue(
      throwError(() => new Error('Only leader or officer can manage armory access.')),
    );

    state.block(member());

    expect(state.error()).toBe('Only leader or officer can manage armory access.');
    expect(state.isMutating()).toBeFalse();
    expect(guildMembers.load).not.toHaveBeenCalled();
    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Guild armory access failed',
      'Only leader or officer can manage armory access.',
    );
  });

  it('ignores stale access success after active server changes', () => {
    const response = new Subject<GuildArmoryAccessLockState>();
    playerGuildArmoryActions.setGuildArmoryMemberAccessForActiveHero.and.returnValue(
      response.asObservable(),
    );

    state.block(member());
    activeHeroState.set(activeContext({ serverId: 'server-2' }));
    response.next(accessResult({ statusKey: 'blocked' }));

    expect(state.lastResult()).toBeNull();
    expect(state.error()).toBeNull();
    expect(state.isMutating()).toBeFalse();
    expect(guildMembers.load).not.toHaveBeenCalled();
    expect(currentGuild.load).not.toHaveBeenCalled();
    expect(guildArmory.load).not.toHaveBeenCalled();
  });

  it('requires active hero context before mutating', () => {
    activeHeroState.set(activeContext({ heroId: null }));

    state.block(member());

    expect(playerGuildArmoryActions.setGuildArmoryMemberAccessForActiveHero)
      .not.toHaveBeenCalled();
    expect(state.error()).toBe('No active hero for guild armory access.');
    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Guild armory access failed',
      'No active hero for guild armory access.',
    );
  });
});

class FakeGuildMembersState {
  readonly members = signal<GuildMemberListItem[]>([]);
  readonly isLoading = signal(false);
  readonly currentRoleKey = signal<GuildRoleKey | null>('leader');
  readonly load = jasmine.createSpy('load');
}

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
    armoryAccessStatusKey: 'allowed',
    joinedAt: '2026-05-08T10:00:00.000Z',
    createdAt: '2026-05-08T09:00:00.000Z',
    ...overrides,
  };
}

function accessResult(
  overrides: Partial<GuildArmoryAccessLockState> = {},
): GuildArmoryAccessLockState {
  return {
    accessLockId: 'access-lock-1',
    guildId: 'guild-1',
    memberHeroId: 'member-hero-1',
    statusKey: 'blocked',
    ...overrides,
  };
}
