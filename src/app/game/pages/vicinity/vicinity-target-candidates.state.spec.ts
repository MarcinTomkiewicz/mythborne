import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import {
  HeroActiveRuntimeActivity,
  PvpActionStartResult,
  PvpTargetCandidate,
} from '../../../core/domain/pvp/pvp.model';
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
    playerPvp = jasmine.createSpyObj<PlayerPvp>('PlayerPvp', [
      'getTargetCandidates',
      'startAction',
      'getActiveRuntimeActivity',
    ]);
    playerPvp.getTargetCandidates.and.returnValue(of([
      candidate({ targetHeroId: 'target-1' }),
    ]));
    playerPvp.startAction.and.returnValue(of(startSpyResult()));
    playerPvp.getActiveRuntimeActivity.and.returnValue(of(activeRuntimeActivity()));

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

  it('starts spy through canonical player PvP action and refreshes candidates after success', () => {
    state.loadCandidates();
    playerPvp.getTargetCandidates.calls.reset();

    state.startSpy(state.candidates()[0]);

    expect(playerPvp.startAction).toHaveBeenCalledOnceWith({
      actionKind: 'spy',
      targetHeroId: 'target-1',
      requestId: jasmine.stringMatching(/^pvp-spy:target-1:/),
    });
    expect(state.lastStartedAction()).toEqual(jasmine.objectContaining({
      actionKind: 'spy',
      runtimeActivityId: 'runtime-spy-1',
    }));
    expect(playerPvp.getActiveRuntimeActivity).toHaveBeenCalled();
    expect(state.activeRuntimeActivity()).toEqual(jasmine.objectContaining({
      activityId: 'runtime-spy-1',
      activityKind: 'pvp_spy',
    }));
    expect(state.actionSuccess()).toBe('Spy travel started. Arrival in 1m 30s.');
    expect(state.actionError()).toBeNull();
    expect(state.isSpyPending('target-1')).toBeFalse();
    expect(playerPvp.getTargetCandidates).toHaveBeenCalledOnceWith({
      districtCode: null,
      limit: 20,
      offset: 0,
      search: '',
    });
  });

  it('blocks duplicate spy starts while one target is pending', () => {
    const action = new Subject<PvpActionStartResult>();
    playerPvp.startAction.and.returnValue(action.asObservable());
    state.loadCandidates();

    const target = state.candidates()[0];
    state.startSpy(target);
    state.startSpy(target);

    expect(playerPvp.startAction).toHaveBeenCalledTimes(1);
    expect(state.isSpyPending('target-1')).toBeTrue();

    action.next(startSpyResult());
    action.complete();

    expect(state.isSpyPending('target-1')).toBeFalse();
  });

  it('does not start spy when RPC eligibility says spy is unavailable', () => {
    const unavailable = candidate({
      spyEligibility: {
        canStart: false,
        blockReason: 'attacker_busy',
        travelTimeSeconds: 90,
      },
    });

    state.startSpy(unavailable);

    expect(playerPvp.startAction).not.toHaveBeenCalled();
  });

  it('ignores stale spy action responses after active hero or server changes', () => {
    const action = new Subject<PvpActionStartResult>();
    playerPvp.startAction.and.returnValue(action.asObservable());
    state.loadCandidates();

    state.startSpy(state.candidates()[0]);
    activeHeroState.set(activeHeroContext('server-2', 'hero-2'));

    action.next(startSpyResult());
    action.complete();

    expect(state.lastStartedAction()).toBeNull();
    expect(state.activeRuntimeActivity()).toBeNull();
    expect(state.actionSuccess()).toBeNull();
    expect(state.isSpyPending('target-1')).toBeFalse();
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

function startSpyResult(): PvpActionStartResult {
  return {
    pvpActionId: 'pvp-spy-action-1',
    runtimeActivityId: 'runtime-spy-1',
    serverId: 'server-1',
    actionKind: 'spy',
    status: 'traveling',
    attackerHeroId: 'hero-1',
    attackerEstateId: 'attacker-estate-1',
    targetHeroId: 'target-1',
    targetEstateId: 'estate-target',
    startedAt: '2026-05-06T10:00:00.000Z',
    arrivesAt: '2026-05-06T10:01:30.000Z',
    travelTimeSeconds: 90,
    attackTravelTimeSeconds: 180,
    spyTravelTimeSeconds: 90,
    distanceScore: 8,
    manualFightWindowSeconds: null,
    manualDeadlineAt: null,
    targetProtectionId: null,
    targetProtectionSeconds: null,
  };
}

function activeRuntimeActivity(): HeroActiveRuntimeActivity {
  return {
    activityId: 'runtime-spy-1',
    heroId: 'hero-1',
    serverId: 'server-1',
    activityKind: 'pvp_spy',
    activityKindLabel: 'PvP spy',
    status: 'active',
    statusLabel: 'Active',
    sourceEntityType: 'pvp_action',
    sourceEntityId: 'pvp-spy-action-1',
    startedAt: '2026-05-06T10:00:00.000Z',
    availableAt: '2026-05-06T10:01:30.000Z',
    expiresAt: null,
    endedAt: null,
    reason: null,
    requestId: null,
    metadataJson: {},
  };
}
