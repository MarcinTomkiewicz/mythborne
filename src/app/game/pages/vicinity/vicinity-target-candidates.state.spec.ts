import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { PvpTargetCandidate } from '../../../core/domain/pvp/pvp.model';
import {
  ActiveHeroState,
} from '../../../core/interfaces/hero/active-hero.interface';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../core/services/pvp/player-pvp';
import { VicinityTargetCandidatesState } from './vicinity-target-candidates.state';

describe('VicinityTargetCandidatesState', () => {
  let state: VicinityTargetCandidatesState;
  let activeHero: Pick<ActiveHero, 'state' | 'requireActiveHero'> & {
    requireActiveHero: jasmine.Spy;
  };
  let activeHeroState: WritableSignal<ActiveHeroState | null>;
  let playerPvp: jasmine.SpyObj<PlayerPvp>;

  beforeEach(() => {
    activeHeroState = signal(activeHeroContext('server-1', 'hero-1'));
    activeHero = {
      state: activeHeroState.asReadonly(),
      requireActiveHero: jasmine.createSpy('requireActiveHero'),
    };
    playerPvp = jasmine.createSpyObj<PlayerPvp>('PlayerPvp', ['getTargetCandidates']);
    playerPvp.getTargetCandidates.and.returnValue(of([
      candidate({ targetHeroId: 'target-1' }),
    ]));

    TestBed.configureTestingModule({
      providers: [
        VicinityTargetCandidatesState,
        { provide: ActiveHero, useValue: activeHero },
        { provide: PlayerPvp, useValue: playerPvp },
      ],
    });

    state = TestBed.inject(VicinityTargetCandidatesState);
  });

  it('loads target candidates through the player PvP service with default filters', () => {
    state.loadCandidates();

    expect(playerPvp.getTargetCandidates).toHaveBeenCalledOnceWith({
      districtCode: null,
      limit: 20,
      offset: 0,
      search: '',
    });
    expect(state.candidates().map((item) => item.targetHeroId)).toEqual(['target-1']);
    expect(state.hasCandidates()).toBeTrue();
    expect(state.isEmpty()).toBeFalse();
    expect(state.error()).toBeNull();
    expect(state.isLoading()).toBeFalse();
    expect(activeHero.requireActiveHero).not.toHaveBeenCalled();
  });

  it('passes district, search and pagination filters without recomputing eligibility', () => {
    state.setDistrictCode(' B ');
    state.setSearch('  target name  ');
    state.setPageSize(1);
    playerPvp.getTargetCandidates.calls.reset();

    state.nextPage();

    expect(playerPvp.getTargetCandidates).toHaveBeenCalledOnceWith({
      districtCode: 'B',
      limit: 1,
      offset: 1,
      search: 'target name',
    });
    expect(state.candidates()[0].attackEligibility.canStart).toBeFalse();
    expect(state.candidates()[0].attackEligibility.blockReason).toBe('DB-owned block');
    expect(state.candidates()[0].spyEligibility.canStart).toBeTrue();
  });

  it('supports empty and error states', () => {
    playerPvp.getTargetCandidates.and.returnValues(
      of([]),
      throwError(() => new Error('RPC unavailable')),
    );

    state.loadCandidates();

    expect(state.candidates()).toEqual([]);
    expect(state.isEmpty()).toBeTrue();
    expect(state.error()).toBeNull();

    state.loadCandidates();

    expect(state.candidates()).toEqual([]);
    expect(state.error()).toBe('RPC unavailable');
    expect(state.isLoading()).toBeFalse();
  });

  it('ignores stale responses after active hero or server changes', () => {
    const staleCandidates = new Subject<PvpTargetCandidate[]>();
    const currentCandidates = new Subject<PvpTargetCandidate[]>();

    playerPvp.getTargetCandidates.and.returnValues(
      staleCandidates.asObservable(),
      currentCandidates.asObservable(),
    );

    state.loadCandidates();
    activeHeroState.set(activeHeroContext('server-2', 'hero-2'));
    state.loadCandidates();

    currentCandidates.next([candidate({ targetHeroId: 'target-current' })]);
    currentCandidates.complete();

    expect(state.candidates().map((item) => item.targetHeroId)).toEqual([
      'target-current',
    ]);

    staleCandidates.next([candidate({ targetHeroId: 'target-stale' })]);
    staleCandidates.complete();

    expect(state.candidates().map((item) => item.targetHeroId)).toEqual([
      'target-current',
    ]);
    expect(state.isLoading()).toBeFalse();
    expect(activeHero.requireActiveHero).not.toHaveBeenCalled();
  });

  it('shows an invariant error and skips the PvP service when active hero context is missing', () => {
    activeHeroState.set(null);

    state.loadCandidates();

    expect(playerPvp.getTargetCandidates).not.toHaveBeenCalled();
    expect(activeHero.requireActiveHero).not.toHaveBeenCalled();
    expect(state.candidates()).toEqual([]);
    expect(state.error()).toBe('No active hero for PvP target search.');
    expect(state.isLoading()).toBeFalse();
  });
});

function activeHeroContext(serverId: string, heroId: string): ActiveHeroState {
  return {
    userId: 'user-1',
    serverId,
    heroId,
    server: { id: serverId } as never,
    hero: {} as never,
    heroRow: { id: heroId } as never,
  };
}

function candidate(
  overrides: Partial<PvpTargetCandidate> = {},
): PvpTargetCandidate {
  return {
    targetHeroId: 'target-1',
    targetDisplayName: 'Target Hero',
    targetLevel: 12,
    targetAddress: {
      estateId: 'estate-target',
      districtCode: 'B',
      address: 'B-120',
      addressNumber: 120,
      estateRank: 2,
    },
    distanceScore: 8,
    underProtection: false,
    protectionExpiresAt: null,
    attackEligibility: {
      canStart: false,
      blockReason: 'DB-owned block',
      travelTimeSeconds: 180,
      minTargetLevel: 8,
      maxTargetLevel: 16,
      attackerHasBlockingActivity: true,
    },
    spyEligibility: {
      canStart: true,
      blockReason: null,
      travelTimeSeconds: 90,
    },
    ...overrides,
  };
}
