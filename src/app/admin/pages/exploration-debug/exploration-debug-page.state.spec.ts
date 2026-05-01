import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { HeroExplorationDebugStateReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { ModerationHeroTarget } from '../../../core/domain/moderation/moderation-action.model';
import { SelectedGameServer, ServerAccessState } from '../../../core/interfaces/server/active-server.interface';
import { ExplorationDefinitions } from '../../../core/services/exploration/exploration-definitions';
import { HeroExplorationDebug } from '../../../core/services/exploration/hero-exploration-debug';
import { ModerationActions } from '../../../core/services/moderation/moderation-actions';
import { ActiveServer } from '../../../core/services/server/active-server';
import { ToastService } from '../../../core/services/ui/toast';
import { ExplorationDebugActionsState } from './exploration-debug-actions.state';
import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';
import { ExplorationDebugScopeState } from './exploration-debug-scope.state';
import { ExplorationDebugFeedbackState } from './exploration-debug-feedback.state';
import { ExplorationDebugPageState } from './exploration-debug-page.state';
import { ExplorationDebugRuntimeState } from './exploration-debug-runtime.state';

describe('ExplorationDebugPageState', () => {
  let activeServer: Partial<ActiveServer>;
  let selectedServerSignal: ReturnType<typeof signal<SelectedGameServer | null>>;
  let accessSignal: ReturnType<typeof signal<ServerAccessState>>;
  let debug: jasmine.SpyObj<HeroExplorationDebug>;
  let definitions: jasmine.SpyObj<ExplorationDefinitions>;
  let moderationActions: jasmine.SpyObj<ModerationActions>;
  let toast: jasmine.SpyObj<ToastService>;
  let state: ExplorationDebugPageState;

  beforeEach(() => {
    selectedServerSignal = signal(server({ canUseAsSandbox: true }));
    accessSignal = signal(access({ isTester: true, canAccessSandbox: true }));
    activeServer = {
      servers: signal([server({ canUseAsSandbox: true })]).asReadonly(),
      selectedServer: selectedServerSignal.asReadonly(),
      access: accessSignal.asReadonly(),
      isLoading: signal(false).asReadonly(),
      error: signal(null).asReadonly(),
      loadAccessibleServers: () => of([server({ canUseAsSandbox: true })]),
    };
    debug = jasmine.createSpyObj<HeroExplorationDebug>('HeroExplorationDebug', [
      'getDebugState',
      'addRemainingActions',
      'resetExploration',
      'skipStepTimer',
      'testGrantRewardProfileToHero',
      'setNextOutcomeOverride',
      'forceCompleteChallengeAttempt',
    ]);
    debug.getDebugState.and.returnValue(of(debugState()));
    debug.addRemainingActions.and.returnValue(
      of({
        serverId: 'server-1',
        heroId: 'hero-1',
        actionKind: 'trial',
        actionDate: '2026-05-01',
        remainingCount: 2,
        counterId: 'counter-1',
      }),
    );
    definitions = jasmine.createSpyObj<ExplorationDefinitions>(
      'ExplorationDefinitions',
      [
        'getActiveDifficultyTiers',
        'getActiveRewardProfiles',
        'getActiveTrialDefinitions',
        'getActiveEncounterDefinitions',
        'getActiveItemBucketProfiles',
        'getEnabledItemQualities',
        'getDistrictOptions',
        'getStatOptions',
      ],
    );
    definitions.getActiveDifficultyTiers.and.returnValue(of([difficulty()]));
    definitions.getActiveRewardProfiles.and.returnValue(of([rewardProfile()]));
    definitions.getActiveTrialDefinitions.and.returnValue(of([trialDefinition()]));
    definitions.getActiveEncounterDefinitions.and.returnValue(of([encounterDefinition()]));
    definitions.getActiveItemBucketProfiles.and.returnValue(of([]));
    definitions.getEnabledItemQualities.and.returnValue(of([]));
    definitions.getDistrictOptions.and.returnValue(of([]));
    definitions.getStatOptions.and.returnValue(of([]));
    moderationActions = jasmine.createSpyObj<ModerationActions>('ModerationActions', [
      'searchHeroTargets',
    ]);
    moderationActions.searchHeroTargets.and.returnValue(of([heroTarget()]));
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show', 'clear']);

    TestBed.configureTestingModule({
      providers: [
        ExplorationDebugFeedbackState,
        ExplorationDebugScopeState,
        ExplorationDefinitionsState,
        ExplorationDebugRuntimeState,
        ExplorationDebugActionsState,
        ExplorationDebugPageState,
        { provide: ActiveServer, useValue: activeServer },
        { provide: HeroExplorationDebug, useValue: debug },
        { provide: ExplorationDefinitions, useValue: definitions },
        { provide: ModerationActions, useValue: moderationActions },
        { provide: ToastService, useValue: toast },
      ],
    });
    state = TestBed.inject(ExplorationDebugPageState);
  });

  it('loads server-scoped debug state for selected sandbox hero scope', () => {
    state.selectHeroTarget(heroTarget());
    state.scopeForm.patchValue({ explorationDate: '2026-05-01' });

    state.loadDebugState();

    expect(debug.getDebugState).toHaveBeenCalledOnceWith({
      serverId: 'server-1',
      heroId: 'hero-1',
      explorationDate: '2026-05-01',
    });
    expect(state.debugState()?.heroId).toBe('hero-1');
  });

  it('blocks debug helpers when selected server testing access is missing', () => {
    selectedServerSignal.set(
      server({ kind: 'standard', staffRole: null, canUseAsSandbox: false }),
    );
    accessSignal.set(access({ serverStaffRole: null }));
    state.selectHeroTarget(heroTarget());

    state.loadDebugState();

    expect(debug.getDebugState).not.toHaveBeenCalled();
    expect(state.error()).toBe('Select a server with sandbox testing access first.');
  });

  it('runs sandbox actions through the debug service and refreshes debug state', () => {
    debug.getDebugState.and.returnValue(of(debugState({ withTrialCounter: true })));
    state.selectHeroTarget(heroTarget());
    state.actions.remainingActionsForm.patchValue({
      actionKind: 'trial',
      amount: 2,
      actionDate: '2026-05-01',
      reason: 'Manual sandbox counter.',
    });

    state.actions.addRemainingActions();

    expect(debug.addRemainingActions).toHaveBeenCalledOnceWith({
      serverId: 'server-1',
      heroId: 'hero-1',
      actionKind: 'trial',
      amount: 2,
      actionDate: '2026-05-01',
      reason: 'Manual sandbox counter.',
    });
    expect(debug.getDebugState).toHaveBeenCalledWith({
      serverId: 'server-1',
      heroId: 'hero-1',
      explorationDate: null,
    });
    expect(toast.show).toHaveBeenCalledWith(
      'success',
      'Exploration debug',
      'Remaining exploration actions updated.',
    );
    expect(state.debugState()?.counters[0]?.actionKind).toBe('trial');
    expect(state.debugState()?.counters[0]?.actionDate).toBe('2026-05-01');
    expect(state.debugState()?.counters[0]?.remainingCount).toBe(2);
  });

  it('falls back to scope exploration date when add actions date input is blank', () => {
    state.selectHeroTarget(heroTarget());
    state.scopeForm.patchValue({ explorationDate: '2026-05-01' });
    state.actions.remainingActionsForm.patchValue({
      actionKind: 'trial',
      amount: 2,
      actionDate: '',
      reason: 'Manual sandbox counter.',
    });

    state.actions.addRemainingActions();

    expect(debug.addRemainingActions).toHaveBeenCalledOnceWith({
      serverId: 'server-1',
      heroId: 'hero-1',
      actionKind: 'trial',
      amount: 2,
      actionDate: '2026-05-01',
      reason: 'Manual sandbox counter.',
    });
  });

  it('loads active difficulty tiers for picker-driven debug actions', () => {
    state.loadInitialData();

    expect(definitions.getActiveDifficultyTiers).toHaveBeenCalled();
    expect(state.definitions.difficultyOptions()).toEqual([
      { label: 'Easy (easy)', value: 'easy' },
    ]);
    expect(state.hasActiveDifficulties()).toBeTrue();
  });

  it('searches heroes by staff-facing target search and stores selected hero id', () => {
    state.searchHeroTargets({ query: 'Aster' } as never);
    state.selectHeroTarget(heroTarget());

    expect(moderationActions.searchHeroTargets).toHaveBeenCalledOnceWith({
      serverId: 'server-1',
      query: 'Aster',
      limit: 10,
    });
    expect(state.heroTargetSuggestions()).toEqual([heroTarget()]);

    state.loadDebugState();

    expect(debug.getDebugState).toHaveBeenCalledWith({
      serverId: 'server-1',
      heroId: 'hero-1',
      explorationDate: null,
    });
  });

  it('ignores stale load errors after hero scope changes', () => {
    const load = new Subject<HeroExplorationDebugStateReadModel>();
    debug.getDebugState.and.returnValue(load.asObservable());
    state.selectHeroTarget(heroTarget());

    state.loadDebugState();
    expect(state.runtime.isLoadingState()).toBeTrue();

    state.selectHeroTarget(heroTarget('hero-2'));
    load.error(new Error('Old hero load failed.'));

    expect(state.error()).toBeNull();
    expect(state.runtime.isLoadingState()).toBeFalse();
  });

  it('keeps loading active when only a stale load finishes', () => {
    const firstLoad = new Subject<HeroExplorationDebugStateReadModel>();
    const secondLoad = new Subject<HeroExplorationDebugStateReadModel>();
    debug.getDebugState.and.returnValues(firstLoad.asObservable(), secondLoad.asObservable());
    state.selectHeroTarget(heroTarget());

    state.loadDebugState();
    state.loadDebugState();
    firstLoad.complete();

    expect(state.runtime.isLoadingState()).toBeTrue();

    secondLoad.next(debugState());
    secondLoad.complete();

    expect(state.runtime.isLoadingState()).toBeFalse();
  });

  it('ignores stale action errors after hero scope changes', () => {
    const action = new Subject<ReturnType<typeof debugActionResult>>();
    debug.addRemainingActions.and.returnValue(action.asObservable());
    state.selectHeroTarget(heroTarget());
    state.actions.remainingActionsForm.patchValue({
      actionKind: 'trial',
      amount: 2,
      reason: 'Manual sandbox counter.',
    });

    state.actions.addRemainingActions();
    expect(state.actions.isRunningAction()).toBeTrue();

    state.selectHeroTarget(heroTarget('hero-2'));
    action.error(new Error('Old action failed.'));

    expect(state.error()).toBeNull();
    expect(state.actions.isRunningAction()).toBeFalse();
  });

  it('requires hero scope for timer skip and forced challenge completion', () => {
    state.actions.skipTimerForm.patchValue({
      stepId: 'step-1',
      reason: 'Skip timer.',
    });
    state.actions.forceChallengeForm.patchValue({
      challengeAttemptId: 'challenge-1',
      reason: 'Force complete.',
    });

    state.actions.skipStepTimer();
    state.actions.forceCompleteChallenge();

    expect(debug.skipStepTimer).not.toHaveBeenCalled();
    expect(debug.forceCompleteChallengeAttempt).not.toHaveBeenCalled();
    expect(state.error()).toBe('Select a hero for exploration debug tools.');
  });
});

function debugActionResult() {
  return {
    serverId: 'server-1',
    heroId: 'hero-1',
    actionKind: 'trial',
    actionDate: '2026-05-01',
    remainingCount: 2,
    counterId: 'counter-1',
  };
}

function heroTarget(heroId = 'hero-1'): ModerationHeroTarget {
  return {
    heroId,
    heroName: heroId === 'hero-1' ? 'Aster' : 'Boreas',
    userId: 'user-1',
    userDisplayName: 'Aster Account',
    email: 'aster@example.com',
    hasVisibleModerationHistory: false,
    matchKind: 'hero_name',
    technicalLabel: heroId,
    label: heroId === 'hero-1' ? 'Aster' : 'Boreas',
    description: `Aster Account | aster@example.com | ${heroId}`,
  };
}

function server(patch: Partial<SelectedGameServer> = {}): SelectedGameServer {
  return {
    id: 'server-1',
    key: 'sandbox',
    name: 'Sandbox',
    kind: 'sandbox',
    status: 'live',
    description: null,
    launchedAt: null,
    archivedAt: null,
    membershipStatus: 'active',
    membership: null,
    staffRole: 'tester',
    canManage: false,
    canUseAsSandbox: true,
    ...patch,
  };
}

function access(patch: Partial<ServerAccessState> = {}): ServerAccessState {
  return {
    userId: 'user-1',
    globalRoleKey: null,
    membershipStatus: 'active',
    membership: null,
    serverStaffRole: 'tester',
    isAdmin: false,
    isOperator: false,
    isTester: false,
    isModerator: false,
    isServerStaff: true,
    isMembershipActive: true,
    isMembershipSuspended: false,
    isMembershipBanned: false,
    isMembershipBlocked: false,
    canAccessSandbox: false,
    canManageSelectedServer: false,
    ...patch,
  };
}

function debugState(
  options: { withTrialCounter?: boolean } = {},
): HeroExplorationDebugStateReadModel {
  return {
    serverId: 'server-1',
    heroId: 'hero-1',
    explorationDate: '2026-05-01',
    counters: options.withTrialCounter
      ? [
          {
            id: 'counter-1',
            serverId: 'server-1',
            heroId: 'hero-1',
            actionKind: 'trial',
            actionDate: '2026-05-01',
            remainingCount: 2,
            metadataJson: {},
            createdAt: '2026-05-01T10:00:00.000Z',
            updatedAt: '2026-05-01T10:00:00.000Z',
          },
        ]
      : [],
    explorations: [
      {
        exploration: {
          id: 'exploration-1',
          serverId: 'server-1',
          heroId: 'hero-1',
          difficultyKey: 'easy',
          districtCode: 'district-a',
          explorationDate: '2026-05-01',
          status: 'active',
          currentNodeId: 'node-1',
          trialDryStepCount: 0,
          metadataJson: {},
          startedAt: '2026-05-01T10:00:00.000Z',
          completedAt: null,
          createdAt: '2026-05-01T10:00:00.000Z',
          updatedAt: '2026-05-01T10:00:00.000Z',
        },
        remainingTrials: options.withTrialCounter ? 2 : 0,
        currentNode: null,
        edges: [],
        activeStep: null,
        activeChallenge: null,
        activeEffect: null,
        recentSteps: [
          {
            id: 'step-1',
            serverId: 'server-1',
            heroId: 'hero-1',
            explorationId: 'exploration-1',
            edgeId: null,
            fromNodeId: 'node-1',
            toNodeId: 'node-2',
            directionKey: 'north',
            stepKind: 'movement',
            status: 'pending',
            outcomeKind: 'known_path',
            difficultyKey: 'easy',
            districtCode: 'district-a',
            trialDefinitionId: null,
            encounterDefinitionId: null,
            trialOpportunityChance: null,
            trialOpportunityRoll: null,
            encounterChance: null,
            encounterRoll: null,
            metadataJson: {},
            startedAt: '2026-05-01T10:00:00.000Z',
            resolvesAt: '2026-05-01T10:05:00.000Z',
            resolvedAt: null,
            createdAt: '2026-05-01T10:00:00.000Z',
            updatedAt: '2026-05-01T10:00:00.000Z',
          },
        ],
        recentChallenges: [],
        testOverrides: [],
      },
    ],
    rawJson: {},
  };
}

function difficulty() {
  return {
    key: 'easy',
    label: 'Easy',
  } as never;
}

function rewardProfile() {
  return {
    id: 'profile-1',
    key: 'starter_reward',
    label: 'Starter reward',
    category: 'trial',
  } as never;
}

function trialDefinition() {
  return {
    id: 'trial-1',
    key: 'trial_spirit',
    label: 'Spirit trial',
    testedStatKey: 'spirituality',
  } as never;
}

function encounterDefinition() {
  return {
    id: 'encounter-1',
    key: 'encounter_cache',
    label: 'Hidden cache',
    encounterKind: 'resource',
  } as never;
}

