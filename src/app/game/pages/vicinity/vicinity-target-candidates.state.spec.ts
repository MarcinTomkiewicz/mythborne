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
    expect(state.isStartingAction()).toBeFalse();
    expect(playerPvp.getTargetCandidates).toHaveBeenCalledOnceWith({
      districtCode: null,
      limit: 20,
      offset: 0,
      search: '',
    });
  });

  it('starts attack through canonical player PvP action and refreshes candidates after success', () => {
    state.loadCandidates();
    playerPvp.startAction.and.returnValue(of(startActionResult('attack')));
    playerPvp.getActiveRuntimeActivity.and.returnValue(of(activeRuntimeActivity({
      activityId: 'runtime-attack-1',
      activityKind: 'pvp_attack',
      sourceEntityId: 'pvp-attack-action-1',
    })));
    playerPvp.getTargetCandidates.calls.reset();

    state.startAttack(candidate({
      attackEligibility: {
        canStart: true,
        blockReason: null,
        travelTimeSeconds: 180,
        minTargetLevel: 8,
        maxTargetLevel: 16,
        attackerHasBlockingActivity: false,
      },
    }));

    expect(playerPvp.startAction).toHaveBeenCalledOnceWith({
      actionKind: 'attack',
      targetHeroId: 'target-1',
      requestId: jasmine.stringMatching(/^pvp-attack:target-1:/),
    });
    expect(state.lastStartedAction()).toEqual(jasmine.objectContaining({
      actionKind: 'attack',
      runtimeActivityId: 'runtime-attack-1',
    }));
    expect(state.activeRuntimeActivity()).toEqual(jasmine.objectContaining({
      activityId: 'runtime-attack-1',
      activityKind: 'pvp_attack',
    }));
    expect(state.actionSuccess()).toBe('Attack travel started. Arrival in 3m.');
    expect(state.actionError()).toBeNull();
    expect(state.isAttackPending('target-1')).toBeFalse();
    expect(state.isStartingAction()).toBeFalse();
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
    expect(state.isStartingAction()).toBeTrue();

    action.next(startSpyResult());
    action.complete();

    expect(state.isSpyPending('target-1')).toBeFalse();
    expect(state.isStartingAction()).toBeFalse();
  });

  it('blocks duplicate attack starts while one target is pending', () => {
    const action = new Subject<PvpActionStartResult>();
    playerPvp.startAction.and.returnValue(action.asObservable());
    const target = candidate({
      attackEligibility: {
        canStart: true,
        blockReason: null,
        travelTimeSeconds: 180,
        minTargetLevel: 8,
        maxTargetLevel: 16,
        attackerHasBlockingActivity: false,
      },
    });

    state.startAttack(target);
    state.startAttack(target);

    expect(playerPvp.startAction).toHaveBeenCalledTimes(1);
    expect(state.isAttackPending('target-1')).toBeTrue();
    expect(state.isStartingAction()).toBeTrue();

    action.next(startActionResult('attack'));
    action.complete();

    expect(state.isAttackPending('target-1')).toBeFalse();
    expect(state.isStartingAction()).toBeFalse();
  });

  it('blocks spy while an attack start request is globally pending', () => {
    const action = new Subject<PvpActionStartResult>();
    playerPvp.startAction.and.returnValue(action.asObservable());
    const target = candidate({
      attackEligibility: {
        canStart: true,
        blockReason: null,
        travelTimeSeconds: 180,
        minTargetLevel: 8,
        maxTargetLevel: 16,
        attackerHasBlockingActivity: false,
      },
    });

    state.startAttack(target);
    state.startSpy(target);

    expect(playerPvp.startAction).toHaveBeenCalledTimes(1);
    expect(playerPvp.startAction.calls.mostRecent().args[0].actionKind).toBe('attack');
    expect(state.isStartingAction()).toBeTrue();

    action.next(startActionResult('attack'));
    action.complete();

    expect(state.isStartingAction()).toBeFalse();
  });

  it('blocks another target while an attack start request is globally pending', () => {
    const action = new Subject<PvpActionStartResult>();
    playerPvp.startAction.and.returnValue(action.asObservable());
    const targetA = attackableCandidate('target-a');
    const targetB = attackableCandidate('target-b');

    state.startAttack(targetA);
    state.startAttack(targetB);

    expect(playerPvp.startAction).toHaveBeenCalledTimes(1);
    expect(playerPvp.startAction.calls.mostRecent().args[0].targetHeroId).toBe('target-a');
    expect(state.isAttackPending('target-a')).toBeTrue();
    expect(state.isAttackPending('target-b')).toBeFalse();
    expect(state.isStartingAction()).toBeTrue();

    action.next(startActionResult('attack'));
    action.complete();

    expect(state.isStartingAction()).toBeFalse();
  });

  it('keeps global pending until runtime activity and candidates refresh after success', () => {
    const action = new Subject<PvpActionStartResult>();
    const activity = new Subject<HeroActiveRuntimeActivity | null>();
    const candidates = new Subject<PvpTargetCandidate[]>();
    playerPvp.startAction.and.returnValue(action.asObservable());
    playerPvp.getActiveRuntimeActivity.and.returnValue(activity.asObservable());
    playerPvp.getTargetCandidates.and.returnValue(candidates.asObservable());
    const target = attackableCandidate('target-1');

    state.startAttack(target);
    action.next(startActionResult('attack'));
    action.complete();

    expect(state.isStartingAction()).toBeTrue();
    expect(state.isAttackPending('target-1')).toBeTrue();

    state.startSpy(candidate());

    expect(playerPvp.startAction).toHaveBeenCalledTimes(1);

    activity.next(activeRuntimeActivity({
      activityId: 'runtime-attack-1',
      activityKind: 'pvp_attack',
    }));
    activity.complete();
    candidates.next([candidate({ targetHeroId: 'target-refreshed' })]);
    candidates.complete();

    expect(state.isStartingAction()).toBeFalse();
    expect(state.isAttackPending('target-1')).toBeFalse();
    expect(state.activeRuntimeActivity()).toEqual(jasmine.objectContaining({
      activityId: 'runtime-attack-1',
      activityKind: 'pvp_attack',
    }));
    expect(state.candidates().map((item) => item.targetHeroId)).toEqual([
      'target-refreshed',
    ]);
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

  it('does not start attack when RPC eligibility says attack is unavailable', () => {
    state.startAttack(candidate());

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
    expect(state.isStartingAction()).toBeFalse();
  });

  it('ignores stale attack action responses after active hero or server changes and clears global pending', () => {
    const action = new Subject<PvpActionStartResult>();
    playerPvp.startAction.and.returnValue(action.asObservable());
    const target = attackableCandidate('target-1');

    state.startAttack(target);
    activeHeroState.set(activeHeroContext('server-2', 'hero-2'));

    action.next(startActionResult('attack'));
    action.complete();

    expect(state.lastStartedAction()).toBeNull();
    expect(state.activeRuntimeActivity()).toBeNull();
    expect(state.actionSuccess()).toBeNull();
    expect(state.isAttackPending('target-1')).toBeFalse();
    expect(state.isStartingAction()).toBeFalse();
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

function attackableCandidate(targetHeroId: string): PvpTargetCandidate {
  return candidate({
    targetHeroId,
    attackEligibility: {
      canStart: true,
      blockReason: null,
      travelTimeSeconds: 180,
      minTargetLevel: 8,
      maxTargetLevel: 16,
      attackerHasBlockingActivity: false,
    },
  });
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
  return startActionResult('spy');
}

function startActionResult(actionKind: 'attack' | 'spy'): PvpActionStartResult {
  const isAttack = actionKind === 'attack';

  return {
    pvpActionId: isAttack ? 'pvp-attack-action-1' : 'pvp-spy-action-1',
    runtimeActivityId: isAttack ? 'runtime-attack-1' : 'runtime-spy-1',
    serverId: 'server-1',
    actionKind,
    status: 'traveling',
    attackerHeroId: 'hero-1',
    attackerEstateId: 'attacker-estate-1',
    targetHeroId: 'target-1',
    targetEstateId: 'estate-target',
    startedAt: '2026-05-06T10:00:00.000Z',
    arrivesAt: '2026-05-06T10:01:30.000Z',
    travelTimeSeconds: isAttack ? 180 : 90,
    attackTravelTimeSeconds: 180,
    spyTravelTimeSeconds: 90,
    distanceScore: 8,
    manualFightWindowSeconds: null,
    manualDeadlineAt: null,
    targetProtectionId: null,
    targetProtectionSeconds: null,
  };
}

function activeRuntimeActivity(
  patch: Partial<HeroActiveRuntimeActivity> = {},
): HeroActiveRuntimeActivity {
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
    ...patch,
  };
}
