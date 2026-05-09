import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import {
  CurrentGuildReadModel,
  GuildConfigSummary,
  GuildCreateResult,
} from '../../domain/guild/guild.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { ActiveHero } from '../hero/active-hero';
import { CurrentGuildState } from './current-guild.state';
import { GuildCreateState } from './guild-create.state';
import { PlayerGuild } from './player-guild';

describe('GuildCreateState', () => {
  let state: GuildCreateState;
  let activeHeroState: ReturnType<typeof signal<ActiveHeroState | null>>;
  let currentGuild: jasmine.SpyObj<CurrentGuildState>;
  let playerGuild: jasmine.SpyObj<PlayerGuild>;

  beforeEach(() => {
    activeHeroState = signal<ActiveHeroState | null>(activeContext());
    currentGuild = jasmine.createSpyObj<CurrentGuildState>('CurrentGuildState', ['load']);
    playerGuild = jasmine.createSpyObj<PlayerGuild>('PlayerGuild', [
      'createGuildForActiveHero',
      'getActiveHeroGuild',
      'getGuildConfigSummary',
    ]);

    TestBed.configureTestingModule({
      providers: [
        GuildCreateState,
        { provide: ActiveHero, useValue: { state: activeHeroState.asReadonly() } },
        { provide: CurrentGuildState, useValue: currentGuild },
        { provide: PlayerGuild, useValue: playerGuild },
      ],
    });

    state = TestBed.inject(GuildCreateState);
  });

  it('loads DB-owned creation cost and current create eligibility', () => {
    playerGuild.getGuildConfigSummary.and.returnValue(of(config()));
    playerGuild.getActiveHeroGuild.and.returnValue(of(readModel(null)));

    state.load();

    expect(state.creationDrachmaCost()).toBe(1000);
    expect(state.canCreateGuild()).toBeTrue();
    expect(state.isReady()).toBeTrue();
  });

  it('blocks create submit when current hero already has a guild', () => {
    playerGuild.getGuildConfigSummary.and.returnValue(of(config()));
    playerGuild.getActiveHeroGuild.and.returnValue(of(readModel('leader')));
    state.load();
    state.form.patchValue({ name: 'Argonauts', tag: 'ARGO' });

    state.submit();

    expect(playerGuild.createGuildForActiveHero).not.toHaveBeenCalled();
    expect(state.error()).toBe('Current hero cannot create another guild.');
  });

  it('submits create guild and refreshes current guild state after success', () => {
    state.canCreateGuild.set(true);
    state.form.patchValue({
      name: 'Argonauts',
      tag: 'ARGO',
      description: 'Greek crew.',
      reason: 'Founding.',
    });
    playerGuild.createGuildForActiveHero.and.returnValue(of(createResult()));

    state.submit();

    expect(playerGuild.createGuildForActiveHero).toHaveBeenCalledWith({
      name: 'Argonauts',
      tag: 'ARGO',
      description: 'Greek crew.',
      reason: 'Founding.',
    });
    expect(state.result()?.guildId).toBe('guild-1');
    expect(state.canCreateGuild()).toBeFalse();
    expect(currentGuild.load).toHaveBeenCalled();
  });

  it('clears previous create result when loading without active hero context', () => {
    state.result.set(createResult());
    activeHeroState.set(activeContext({ heroId: null }));

    state.load();

    expect(state.result()).toBeNull();
    expect(state.isLoading()).toBeFalse();
    expect(state.error()).toBe('No active hero for guild creation.');
  });

  it('clears previous create result on stale load success after active hero changes', () => {
    const configResponse = new Subject<GuildConfigSummary>();
    const guildResponse = new Subject<CurrentGuildReadModel>();
    state.result.set(createResult());
    playerGuild.getGuildConfigSummary.and.returnValue(configResponse.asObservable());
    playerGuild.getActiveHeroGuild.and.returnValue(guildResponse.asObservable());

    state.load();
    activeHeroState.set(activeContext({ heroId: 'hero-2' }));
    configResponse.next(config());
    guildResponse.next(readModel(null));
    configResponse.complete();
    guildResponse.complete();

    expect(state.result()).toBeNull();
    expect(state.creationDrachmaCost()).toBeNull();
    expect(state.canCreateGuild()).toBeFalse();
    expect(state.isLoading()).toBeFalse();
    expect(state.error()).toBeNull();
  });

  it('clears previous create result on stale load error after active server changes', () => {
    const configResponse = new Subject<GuildConfigSummary>();
    const guildResponse = new Subject<CurrentGuildReadModel>();
    state.result.set(createResult());
    playerGuild.getGuildConfigSummary.and.returnValue(configResponse.asObservable());
    playerGuild.getActiveHeroGuild.and.returnValue(guildResponse.asObservable());

    state.load();
    activeHeroState.set(activeContext({ serverId: 'server-2' }));
    configResponse.error(new Error('old load failed'));

    expect(state.result()).toBeNull();
    expect(state.error()).toBeNull();
    expect(state.isLoading()).toBeFalse();
  });

  it('surfaces readable RPC errors', () => {
    state.canCreateGuild.set(true);
    state.form.patchValue({ name: 'Argonauts', tag: 'ARGO' });
    playerGuild.createGuildForActiveHero.and.returnValue(
      throwError(() => new Error('Guild name already exists on this server.')),
    );

    state.submit();

    expect(state.error()).toBe('Guild name already exists on this server.');
    expect(state.isSubmitting()).toBeFalse();
  });

  it('ignores stale create success after active hero changes', () => {
    const response = new Subject<GuildCreateResult>();
    state.canCreateGuild.set(true);
    state.form.patchValue({ name: 'Argonauts', tag: 'ARGO' });
    playerGuild.createGuildForActiveHero.and.returnValue(response.asObservable());

    state.submit();
    activeHeroState.set(activeContext({ heroId: 'hero-2' }));
    response.next(createResult());

    expect(state.result()).toBeNull();
    expect(state.message()).toBeNull();
    expect(state.error()).toBeNull();
    expect(state.isSubmitting()).toBeFalse();
    expect(currentGuild.load).not.toHaveBeenCalled();
  });

  it('requires active hero context before loading or submitting', () => {
    activeHeroState.set(activeContext({ heroId: null }));

    state.load();
    expect(state.error()).toBe('No active hero for guild creation.');

    state.submit();
    expect(playerGuild.createGuildForActiveHero).not.toHaveBeenCalled();
    expect(state.error()).toBe('No active hero for guild creation.');
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

function config(): GuildConfigSummary {
  return {
    creationDrachmaCost: 1000,
    memberBaseLimit: 10,
    memberLimitPerLeaderLevel: 2,
    leaderInactivityThresholdDays: 15,
    nominationDurationMinutes: 360,
    votingDurationMinutes: 720,
    emergencyMaxCandidates: 3,
    armoryCapacity: 0,
    armoryCapacityIsUnlimited: true,
  };
}

function createResult(): GuildCreateResult {
  return {
    guildId: 'guild-1',
    serverId: 'server-1',
    leaderHeroId: 'hero-1',
    membershipId: 'membership-1',
    name: 'Argonauts',
    tag: 'ARGO',
    statusKey: 'active',
    creationDrachmaCost: 1000,
    drachmaBalanceAfter: 9000,
  };
}

function readModel(roleKey: 'leader' | null): CurrentGuildReadModel {
  const guild = roleKey
    ? {
        guildId: 'guild-1',
        serverId: 'server-1',
        name: 'Argonauts',
        tag: 'ARGO',
        statusKey: 'active',
        memberCount: 1,
        memberLimit: 10,
      }
    : null;

  return {
    heroId: 'hero-1',
    serverId: 'server-1',
    state: {
      heroId: 'hero-1',
      serverId: 'server-1',
      guild,
      membership: null,
      canCreateGuild: !guild,
      permissions: {
        canInvite: false,
        canManageArmory: false,
        canManageMembers: false,
        canStartEmergencyElection: false,
      },
    },
    detail: null,
  };
}
