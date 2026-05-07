import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';
import { PvpAttackResult } from '../../../core/domain/pvp/pvp.model';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../core/services/pvp/player-pvp';
import { PvpAttackResultState } from './pvp-attack-result.state';

describe('PvpAttackResultState', () => {
  let state: PvpAttackResultState;
  let activeHero: Pick<ActiveHero, 'state'>;
  let playerPvp: jasmine.SpyObj<PlayerPvp>;
  let activeHeroState: WritableSignal<ActiveHeroState | null>;

  beforeEach(() => {
    activeHeroState = signal(heroState());
    activeHero = {
      state: activeHeroState.asReadonly(),
    };
    playerPvp = jasmine.createSpyObj<PlayerPvp>('PlayerPvp', [
      'getMyAttackResult',
    ]);
    playerPvp.getMyAttackResult.and.returnValue(
      new Subject<PvpAttackResult>().asObservable(),
    );

    TestBed.configureTestingModule({
      providers: [
        PvpAttackResultState,
        { provide: ActiveHero, useValue: activeHero },
        { provide: PlayerPvp, useValue: playerPvp },
      ],
    });
    state = TestBed.inject(PvpAttackResultState);
  });

  it('loads one attack result through PlayerPvp using a trimmed id', () => {
    const response = new Subject<PvpAttackResult>();
    playerPvp.getMyAttackResult.and.returnValue(response.asObservable());

    state.load(' attack-result-1 ');

    expect(state.isLoading()).toBeTrue();
    expect(state.requestedAttackResultId()).toBe('attack-result-1');
    expect(playerPvp.getMyAttackResult)
      .toHaveBeenCalledOnceWith('attack-result-1');

    response.next(attackResult());

    expect(state.status()).toBe('loaded');
    expect(state.hasResult()).toBeTrue();
    expect(state.result()).toEqual(jasmine.objectContaining({
      attackResultId: 'attack-result-1',
      outcomeKey: 'attacker_won',
      resourceOutcome: { raw: { drachmaDelta: 120 } },
      rewardContext: { raw: { xp: 25 } },
      prestigeContext: { future: true },
      reportContext: { raw: { reportId: 'report-1' } },
    }));
    expect(JSON.stringify(state.result())).not.toContain('antiAbuse');
    expect(JSON.stringify(state.result())).not.toContain('metadataJson');
  });

  it('treats empty or inaccessible RPC result as unavailable without guessing ownership', () => {
    playerPvp.getMyAttackResult.and.returnValue(throwError(() =>
      new Error('get_my_pvp_attack_result returned no PvP row.'),
    ));

    state.load('attack-result-1');

    expect(state.status()).toBe('missing-or-not-accessible');
    expect(state.isUnavailable()).toBeTrue();
    expect(state.result()).toBeNull();
    expect(state.error()).toBe('PvP attack result was not found or is not accessible.');
  });

  it('handles access denied errors separately from generic RPC errors', () => {
    playerPvp.getMyAttackResult.and.returnValue(throwError(() =>
      new Error('permission denied for function get_my_pvp_attack_result'),
    ));

    state.load('attack-result-1');

    expect(state.status()).toBe('access-denied');
    expect(state.isUnavailable()).toBeTrue();
    expect(state.error()).toBe('permission denied for function get_my_pvp_attack_result');
  });

  it('handles RPC errors without preserving stale result data', () => {
    playerPvp.getMyAttackResult.and.returnValue(throwError(() =>
      new Error('RPC failed'),
    ));

    state.load('attack-result-1');

    expect(state.status()).toBe('error');
    expect(state.result()).toBeNull();
    expect(state.error()).toBe('RPC failed');
  });

  it('does not call the service when there is no active hero context', () => {
    activeHeroState.set(null);

    state.load('attack-result-1');

    expect(playerPvp.getMyAttackResult).not.toHaveBeenCalled();
    expect(state.status()).toBe('missing-or-not-accessible');
    expect(state.error()).toBe('No active hero for PvP attack result.');
  });

  it('clears loading state when active hero context changes before success arrives', () => {
    const response = new Subject<PvpAttackResult>();
    playerPvp.getMyAttackResult.and.returnValue(response.asObservable());

    state.load('attack-result-1');
    activeHeroState.set(heroState({
      heroId: 'active-hero-2',
      serverId: 'server-1',
    }));
    response.next(attackResult());

    expect(state.status()).toBe('missing-or-not-accessible');
    expect(state.result()).toBeNull();
    expect(state.isLoading()).toBeFalse();
    expect(state.error()).toBe('PvP attack result context changed.');
  });

  it('clears loading state when active server context changes before error arrives', () => {
    const response = new Subject<PvpAttackResult>();
    playerPvp.getMyAttackResult.and.returnValue(response.asObservable());

    state.load('attack-result-1');
    activeHeroState.set(heroState({
      heroId: 'active-hero-1',
      serverId: 'server-2',
    }));
    response.error(new Error('stale error'));

    expect(state.status()).toBe('missing-or-not-accessible');
    expect(state.result()).toBeNull();
    expect(state.isLoading()).toBeFalse();
    expect(state.error()).toBe('PvP attack result context changed.');
  });

  it('ignores stale errors after a newer load starts', () => {
    const oldResponse = new Subject<PvpAttackResult>();
    const newResponse = new Subject<PvpAttackResult>();
    playerPvp.getMyAttackResult.and.returnValues(
      oldResponse.asObservable(),
      newResponse.asObservable(),
    );

    state.load('attack-result-1');
    state.load('attack-result-2');
    oldResponse.error(new Error('stale error'));
    newResponse.next(attackResult({ attackResultId: 'attack-result-2' }));

    expect(state.status()).toBe('loaded');
    expect(state.error()).toBeNull();
    expect(state.result()?.attackResultId).toBe('attack-result-2');
  });

  it('clears the current read state', () => {
    const response = new Subject<PvpAttackResult>();
    playerPvp.getMyAttackResult.and.returnValue(response.asObservable());
    state.load('attack-result-1');
    response.next(attackResult());

    state.clear();

    expect(state.status()).toBe('idle');
    expect(state.result()).toBeNull();
    expect(state.error()).toBeNull();
    expect(state.requestedAttackResultId()).toBeNull();
  });
});

function heroState(
  overrides: Partial<Pick<ActiveHeroState, 'heroId' | 'serverId'>> = {},
): ActiveHeroState {
  return {
    heroId: overrides.heroId ?? 'active-hero-1',
    serverId: overrides.serverId ?? 'server-1',
    userId: 'user-1',
    hero: {} as never,
    heroRow: { id: overrides.heroId ?? 'active-hero-1' } as never,
    server: {} as never,
  };
}

function attackResult(
  overrides: Partial<PvpAttackResult> = {},
): PvpAttackResult {
  return {
    attackResultId: overrides.attackResultId ?? 'attack-result-1',
    pvpActionId: 'pvp-action-1',
    serverId: 'server-1',
    createdAt: '2026-05-06T12:00:00Z',
    attacker: {
      heroId: 'active-hero-1',
      levelSnapshot: 10,
    },
    defender: {
      heroId: 'target-hero-1',
      levelSnapshot: 9,
    },
    combatResultId: 'combat-result-1',
    combatOutcome: 'initiator_victory',
    outcomeKey: 'attacker_won',
    outcomeLabel: 'Attacker victory',
    winnerHeroId: 'active-hero-1',
    loserHeroId: 'target-hero-1',
    levelDifference: 1,
    resourceOutcome: { raw: { drachmaDelta: 120 } },
    rewardContext: { raw: { xp: 25 } },
    prestigeContext: { future: true },
    reportContext: { raw: { reportId: 'report-1' } },
    notificationContext: { raw: { notificationType: 'pvp.attack.completed' } },
    ...overrides,
  };
}
