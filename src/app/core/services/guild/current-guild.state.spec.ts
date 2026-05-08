import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Subject, of, throwError } from 'rxjs';
import { CurrentGuildReadModel } from '../../domain/guild/guild.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { ActiveHero } from '../hero/active-hero';
import { CurrentGuildState } from './current-guild.state';
import { PlayerGuild } from './player-guild';

describe('CurrentGuildState', () => {
  let state: CurrentGuildState;
  let activeHeroState: ReturnType<typeof signal<ActiveHeroState | null>>;
  let activeHero: Pick<ActiveHero, 'state'>;
  let playerGuild: jasmine.SpyObj<PlayerGuild>;

  beforeEach(() => {
    activeHeroState = signal<ActiveHeroState | null>(activeContext('server-1', 'hero-1'));
    activeHero = { state: activeHeroState.asReadonly() } as Pick<ActiveHero, 'state'>;
    playerGuild = jasmine.createSpyObj<PlayerGuild>('PlayerGuild', ['getActiveHeroGuild']);

    TestBed.configureTestingModule({
      providers: [
        CurrentGuildState,
        { provide: ActiveHero, useValue: activeHero },
        { provide: PlayerGuild, useValue: playerGuild },
      ],
    });

    state = TestBed.inject(CurrentGuildState);
  });

  it('starts without a guild', () => {
    expect(state.hasGuild()).toBeFalse();
  });

  it('clears guild presence state', () => {
    playerGuild.getActiveHeroGuild.and.returnValue(of(readModel('member')));

    state.load();
    expect(state.hasGuild()).toBeTrue();

    state.clear();

    expect(state.readModel()).toBeNull();
    expect(state.hasGuild()).toBeFalse();
  });

  it('exposes no-guild status explicitly', () => {
    playerGuild.getActiveHeroGuild.and.returnValue(of(readModel(null)));

    state.load();

    expect(state.status()).toBe('no-guild');
    expect(state.hasGuild()).toBeFalse();
    expect(state.error()).toBeNull();
  });

  it('exposes role-specific status from DB/RPC state', () => {
    playerGuild.getActiveHeroGuild.and.returnValue(of(readModel('officer')));

    state.load();

    expect(state.status()).toBe('officer');
    expect(state.roleKey()).toBe('officer');
    expect(state.hasGuild()).toBeTrue();
    expect(state.readModel()?.detail?.permissions.canManageArmory).toBeTrue();
  });

  it('marks member guild presence as true', () => {
    playerGuild.getActiveHeroGuild.and.returnValue(of(readModel('member')));

    state.load();

    expect(state.status()).toBe('member');
    expect(state.hasGuild()).toBeTrue();
  });

  it('marks leader guild presence as true', () => {
    playerGuild.getActiveHeroGuild.and.returnValue(of(readModel('leader')));

    state.load();

    expect(state.status()).toBe('leader');
    expect(state.hasGuild()).toBeTrue();
  });

  it('ignores stale responses after active hero or server changes', () => {
    const response = new Subject<CurrentGuildReadModel>();
    playerGuild.getActiveHeroGuild.and.returnValue(response.asObservable());

    state.load();
    activeHeroState.set(activeContext('server-2', 'hero-2'));
    response.next(readModel('leader', 'server-1', 'hero-1'));
    response.complete();

    expect(state.readModel()).toBeNull();
    expect(state.status()).toBe('idle');
    expect(state.error()).toBeNull();
  });

  it('surfaces current request errors only', () => {
    playerGuild.getActiveHeroGuild.and.returnValue(
      throwError(() => new Error('guild rpc failed')),
    );

    state.load();

    expect(state.status()).toBe('error');
    expect(state.error()).toBe('guild rpc failed');
  });

  it('requires active hero context before loading', () => {
    activeHeroState.set(null);

    state.load();

    expect(playerGuild.getActiveHeroGuild).not.toHaveBeenCalled();
    expect(state.status()).toBe('error');
    expect(state.error()).toBe('No active hero for guild state.');
  });
});

function activeContext(serverId: string, heroId: string): ActiveHeroState {
  return {
    userId: 'user-1',
    serverId,
    heroId,
    server: {
      id: serverId,
      key: serverId,
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

function readModel(
  roleKey: 'member' | 'officer' | 'leader' | null,
  serverId = 'server-1',
  heroId = 'hero-1',
): CurrentGuildReadModel {
  const guild = roleKey
    ? {
        guildId: 'guild-1',
        serverId,
        name: 'Argonauts',
        tag: 'ARGO',
        statusKey: 'active',
        memberCount: 12,
        memberLimit: 30,
      }
    : null;
  const membership = roleKey && guild
    ? {
        membershipId: 'membership-1',
        guildId: guild.guildId,
        heroId,
        statusKey: 'active',
        roleKey,
        roleLabel: roleKey,
      }
    : null;

  return {
    heroId,
    serverId,
    state: {
      heroId,
      serverId,
      guild,
      membership,
      canCreateGuild: !guild,
      permissions: {
        canInvite: roleKey === 'leader' || roleKey === 'officer',
        canManageArmory: roleKey === 'leader' || roleKey === 'officer',
        canManageMembers: roleKey === 'leader' || roleKey === 'officer',
        canStartEmergencyElection: false,
      },
    },
    detail: guild && membership
      ? {
          ...guild,
          currentHeroId: heroId,
          currentMembershipId: membership.membershipId,
          currentMembershipStatusKey: membership.statusKey,
          currentRoleKey: membership.roleKey,
          currentRoleLabel: membership.roleLabel,
          armoryAvailableCount: 7,
          armoryBorrowedCount: 2,
          myActiveLoanCount: 1,
          myArmoryAccessStatusKey: 'allowed',
          myDepositedItemCount: 3,
          pendingInviteCount: 0,
          pendingJoinRequestCount: 0,
          activeElectionId: null,
          activeElectionStatusKey: null,
          permissions: {
            canInvite: roleKey === 'leader' || roleKey === 'officer',
            canManageArmory: roleKey === 'leader' || roleKey === 'officer',
            canManageMembers: roleKey === 'leader' || roleKey === 'officer',
            canStartEmergencyElection: false,
          },
        }
      : null,
  };
}
