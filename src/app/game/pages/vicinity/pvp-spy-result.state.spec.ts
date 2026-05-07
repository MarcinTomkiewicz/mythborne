import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';
import { PvpSpyResult } from '../../../core/domain/pvp/pvp.model';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../core/services/pvp/player-pvp';
import { PvpSpyResultState } from './pvp-spy-result.state';

describe('PvpSpyResultState', () => {
  let state: PvpSpyResultState;
  let activeHero: Pick<ActiveHero, 'state'>;
  let playerPvp: jasmine.SpyObj<PlayerPvp>;
  let activeHeroState: WritableSignal<ActiveHeroState | null>;

  beforeEach(() => {
    activeHeroState = signal(heroState());
    activeHero = {
      state: activeHeroState.asReadonly(),
    };
    playerPvp = jasmine.createSpyObj<PlayerPvp>('PlayerPvp', [
      'getMySpyResult',
    ]);
    playerPvp.getMySpyResult.and.returnValue(new Subject<PvpSpyResult>().asObservable());

    TestBed.configureTestingModule({
      providers: [
        PvpSpyResultState,
        { provide: ActiveHero, useValue: activeHero },
        { provide: PlayerPvp, useValue: playerPvp },
      ],
    });
    state = TestBed.inject(PvpSpyResultState);
  });

  it('loads one spy result through PlayerPvp using a trimmed id', () => {
    const response = new Subject<PvpSpyResult>();
    playerPvp.getMySpyResult.and.returnValue(response.asObservable());

    state.load(' spy-result-1 ');

    expect(state.isLoading()).toBeTrue();
    expect(state.requestedSpyResultId()).toBe('spy-result-1');
    expect(playerPvp.getMySpyResult).toHaveBeenCalledOnceWith('spy-result-1');

    response.next(spyResult());

    expect(state.status()).toBe('loaded');
    expect(state.hasResult()).toBeTrue();
    expect(state.result()).toEqual(jasmine.objectContaining({
      spyResultId: 'spy-result-1',
      spyHeroId: 'active-hero-1',
      targetHeroId: 'target-hero-1',
    }));
    expect(JSON.stringify(state.result())).not.toContain('requestId');
  });

  it('treats empty or inaccessible RPC result as unavailable without guessing ownership', () => {
    playerPvp.getMySpyResult.and.returnValue(throwError(() =>
      new Error('get_my_pvp_spy_result returned no PvP row.'),
    ));

    state.load('spy-result-1');

    expect(state.status()).toBe('missing-or-not-accessible');
    expect(state.isUnavailable()).toBeTrue();
    expect(state.result()).toBeNull();
    expect(state.error()).toBe('PvP spy result was not found or is not accessible.');
  });

  it('handles access denied errors separately from generic RPC errors', () => {
    playerPvp.getMySpyResult.and.returnValue(throwError(() =>
      new Error('permission denied for function get_my_pvp_spy_result'),
    ));

    state.load('spy-result-1');

    expect(state.status()).toBe('access-denied');
    expect(state.isUnavailable()).toBeTrue();
    expect(state.error()).toBe('permission denied for function get_my_pvp_spy_result');
  });

  it('handles RPC errors without preserving stale result data', () => {
    playerPvp.getMySpyResult.and.returnValue(throwError(() =>
      new Error('RPC failed'),
    ));

    state.load('spy-result-1');

    expect(state.status()).toBe('error');
    expect(state.result()).toBeNull();
    expect(state.error()).toBe('RPC failed');
  });

  it('does not call the service when there is no active hero context', () => {
    activeHeroState.set(null);

    state.load('spy-result-1');

    expect(playerPvp.getMySpyResult).not.toHaveBeenCalled();
    expect(state.status()).toBe('missing-or-not-accessible');
    expect(state.error()).toBe('No active hero for PvP spy result.');
  });

  it('clears loading state when active hero context changes before success arrives', () => {
    const response = new Subject<PvpSpyResult>();
    playerPvp.getMySpyResult.and.returnValue(response.asObservable());

    state.load('spy-result-1');
    activeHeroState.set(heroState({
      heroId: 'active-hero-2',
      serverId: 'server-1',
    }));
    response.next(spyResult());

    expect(state.status()).toBe('missing-or-not-accessible');
    expect(state.result()).toBeNull();
    expect(state.isLoading()).toBeFalse();
    expect(state.error()).toBe('PvP spy result context changed.');
  });

  it('clears loading state when active server context changes before error arrives', () => {
    const response = new Subject<PvpSpyResult>();
    playerPvp.getMySpyResult.and.returnValue(response.asObservable());

    state.load('spy-result-1');
    activeHeroState.set(heroState({
      heroId: 'active-hero-1',
      serverId: 'server-2',
    }));
    response.error(new Error('stale error'));

    expect(state.status()).toBe('missing-or-not-accessible');
    expect(state.result()).toBeNull();
    expect(state.isLoading()).toBeFalse();
    expect(state.error()).toBe('PvP spy result context changed.');
  });

  it('ignores stale errors after a newer load starts', () => {
    const oldResponse = new Subject<PvpSpyResult>();
    const newResponse = new Subject<PvpSpyResult>();
    playerPvp.getMySpyResult.and.returnValues(
      oldResponse.asObservable(),
      newResponse.asObservable(),
    );

    state.load('spy-result-1');
    state.load('spy-result-2');
    oldResponse.error(new Error('stale error'));
    newResponse.next(spyResult({ spyResultId: 'spy-result-2' }));

    expect(state.status()).toBe('loaded');
    expect(state.error()).toBeNull();
    expect(state.result()?.spyResultId).toBe('spy-result-2');
  });

  it('clears the current read state', () => {
    const response = new Subject<PvpSpyResult>();
    playerPvp.getMySpyResult.and.returnValue(response.asObservable());
    state.load('spy-result-1');
    response.next(spyResult());

    state.clear();

    expect(state.status()).toBe('idle');
    expect(state.result()).toBeNull();
    expect(state.error()).toBeNull();
    expect(state.requestedSpyResultId()).toBeNull();
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

function spyResult(overrides: Partial<PvpSpyResult> = {}): PvpSpyResult {
  return {
    spyResultId: overrides.spyResultId ?? 'spy-result-1',
    pvpActionId: 'pvp-action-1',
    serverId: 'server-1',
    createdAt: '2026-05-06T12:00:00Z',
    spyHeroId: 'active-hero-1',
    spyLevelSnapshot: 10,
    targetHeroId: 'target-hero-1',
    targetDisplayName: 'Target Hero',
    targetLevelSnapshot: 9,
    targetAddress: 'Agora 12',
    visibilityKey: 'private',
    resultSummary: 'Spy succeeded.',
    snapshots: {
      estate: {},
      buildings: [],
      resources: {},
      equipment: [],
      baseStats: {},
      derivedCombatStats: {},
    },
    ...overrides,
  };
}
