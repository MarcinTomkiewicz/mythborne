import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import {
  CombatLiveStateReadModel,
  CombatResultDetailReadModel,
} from '../../../core/domain/combat/combat-live.model';
import { ExplorationDifficultyTierReadModel } from '../../../core/domain/exploration/exploration-definition.model';
import { TrialOpportunityCurvePreview } from '../../../core/domain/exploration/exploration-preview.model';
import { ExplorationChallengeRewardReadModel } from '../../../core/domain/exploration/exploration-reward.model';
import {
  HeroExplorationChallengeCompletionWorkflowResult,
  HeroExplorationStateReadModel,
  HeroExplorationStepResolutionWorkflowResult,
} from '../../../core/domain/exploration/exploration-runtime.model';
import { RequiredActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { ExplorationLiveCombat } from '../../../core/services/combat/exploration-live-combat';
import { HeroExplorationRewards } from '../../../core/services/exploration/hero-exploration-rewards';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ExplorationChallengeState } from './exploration-challenge.state';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationLiveCombatState } from './exploration-live-combat.state';
import { ExplorationMovementState } from './exploration-movement.state';
import { ExplorationPage } from './exploration-page';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationPageState } from './exploration-page.state';
import { ExplorationPreviewState } from './exploration-preview.state';
import { ExplorationRewardState } from './exploration-reward.state';
import { ExplorationStepState } from './exploration-step.state';
import { ExplorationStartState } from './exploration-start.state';

describe('ExplorationPageState', () => {
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let explorations: jasmine.SpyObj<HeroExplorations>;
  let liveCombat: jasmine.SpyObj<ExplorationLiveCombat>;
  let rewards: jasmine.SpyObj<HeroExplorationRewards>;
  let page: ExplorationPageState;
  let feedback: ExplorationFeedbackState;

  beforeEach(() => {
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', ['requireActiveHero']);
    rewards = jasmine.createSpyObj<HeroExplorationRewards>('HeroExplorationRewards', [
      'getLatestChallengeReward',
    ]);
    liveCombat = jasmine.createSpyObj<ExplorationLiveCombat>('ExplorationLiveCombat', [
      'ensureSession',
      'getState',
      'submitPlayerAction',
      'getResultDetail',
    ]);
    explorations = jasmine.createSpyObj<HeroExplorations>('HeroExplorations', [
      'getActiveDifficultyTiers',
      'getHeroExplorationState',
      'startHeroExplorationStep',
      'startOrGetHeroExploration',
      'previewTrialOpportunityCurve',
      'resolveHeroExplorationStep',
      'completeHeroExplorationChallengeAttempt',
      'autoResolveHeroExplorationChallengeAttempt',
    ]);

    activeHero.requireActiveHero.and.returnValue(of(activeHeroContext()));
    explorations.getActiveDifficultyTiers.and.returnValue(of([difficulty('easy')]));
    explorations.getHeroExplorationState.and.returnValue(of(noExplorationState('easy')));
    explorations.startHeroExplorationStep.and.returnValue(
      of(activeExplorationState('easy', true)),
    );
    explorations.startOrGetHeroExploration.and.returnValue(of(activeExplorationState('easy')));
    explorations.previewTrialOpportunityCurve.and.returnValue(of([previewRow('easy')]));
    explorations.resolveHeroExplorationStep.and.returnValue(
      of(stepResolutionWorkflow('easy')),
    );
    explorations.completeHeroExplorationChallengeAttempt.and.returnValue(
      of(challengeCompletionWorkflow('easy')),
    );
    explorations.autoResolveHeroExplorationChallengeAttempt.and.returnValue(
      of(challengeCompletionWorkflow('easy', { completionMode: 'auto' })),
    );
    liveCombat.ensureSession.and.returnValue(of(combatLiveState()));
    liveCombat.getState.and.returnValue(of(combatLiveState()));
    liveCombat.submitPlayerAction.and.returnValue(of(combatLiveState({
      awaitingPlayerAction: true,
      eventCount: 2,
      events: [combatEvent(1), combatEvent(2)],
    })));
    liveCombat.getResultDetail.and.returnValue(of(combatResultDetail()));
    rewards.getLatestChallengeReward.and.returnValue(of(null));

    TestBed.configureTestingModule({
      imports: [ExplorationPage],
      providers: [
        ExplorationFeedbackState,
        ExplorationLiveCombatState,
        ExplorationPreviewState,
        ExplorationOverviewState,
        ExplorationMovementState,
        ExplorationStepState,
        ExplorationChallengeState,
        ExplorationRewardState,
        ExplorationStartState,
        ExplorationPageState,
        { provide: ActiveHero, useValue: activeHero },
        { provide: HeroExplorations, useValue: explorations },
        { provide: ExplorationLiveCombat, useValue: liveCombat },
        { provide: HeroExplorationRewards, useValue: rewards },
      ],
    });
    page = TestBed.inject(ExplorationPageState);
    feedback = TestBed.inject(ExplorationFeedbackState);
  });

  it('loads active hero context, DB difficulty tiers and selected exploration state', () => {
    page.loadData();

    expect(page.difficulties()[0].key).toBe('easy');
    expect(page.selectedDifficultyKey()).toBe('easy');
    expect(page.state()?.remainingTrials).toBe(2);
    expect(explorations.getHeroExplorationState).toHaveBeenCalledWith({
      heroId: 'hero-1',
      difficultyKey: 'easy',
    });
    expect(explorations.previewTrialOpportunityCurve).toHaveBeenCalledWith({
      difficultyKey: 'easy',
      stepsToPreview: 3,
    });
  });

  it('creates the exploration route component with local page state providers', () => {
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();

    expect(fixture.componentInstance.page).toBeTruthy();
    expect(activeHero.requireActiveHero).toHaveBeenCalled();
  });

  it('does not assume hero id matches auth user id when starting exploration', () => {
    page.loadData();
    page.startSelectedDifficulty();

    expect(explorations.startOrGetHeroExploration).toHaveBeenCalledWith({
      heroId: 'hero-1',
      difficultyKey: 'easy',
    });
    expect(page.state()?.hasExploration).toBeTrue();
    expect(feedback.successMessage()).toBe('Exploration is ready.');
  });

  it('starts movement through RPC for the selected DB edge', () => {
    page.loadData();
    page.startSelectedDifficulty();
    const edge = page.edges()[0];

    page.chooseDirection(edge);

    expect(explorations.startHeroExplorationStep).toHaveBeenCalledOnceWith({
      heroId: 'hero-1',
      difficultyKey: 'easy',
      explorationId: 'exploration-1',
      edgeId: 'edge-1',
    });
    expect(feedback.successMessage()).toBe('Movement step started.');
    expect(page.activeStepLabel()).toContain('movement - pending');
  });

  it('disables movement while a step or challenge blocks direction choice', () => {
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(activeExplorationState('easy', true));

    expect(page.movementBlockReason()).toBe('Wait for the active movement step to resolve.');
    expect(page.canChooseDirection(page.edges()[0])).toBeFalse();

    page.overview.setStateFromWorkflow(activeExplorationState('easy', false, true));

    expect(page.movementBlockReason()).toBe('Resolve the active challenge before moving.');
    expect(page.canChooseDirection(page.edges()[0])).toBeFalse();
  });

  it('describes resolved step outcomes from RPC snapshots', () => {
    const cases: Array<[
      Partial<HeroExplorationStepResolutionWorkflowResult['result']>,
      string,
      string,
    ]> = [
      [{ outcomeKind: 'known_path' }, 'Path resolved', 'Current node: node-2.'],
      [{ outcomeKind: 'empty', currentNodeId: null, toNodeId: null }, 'Nothing found', 'database runtime'],
      [{ outcomeKind: 'encounter', encounterDefinitionId: 'encounter-1', challengeAttemptId: 'challenge-1' }, 'Encounter started', 'An encounter challenge is ready.'],
      [{ outcomeKind: 'trial', trialDefinitionId: 'trial-1', challengeAttemptId: 'challenge-1' }, 'Trial manifested', 'A trial challenge is ready.'],
      [{ outcomeKind: 'trial', trialDefinitionId: 'trial-1' }, 'Trial did not manifest', 'daily trial opportunity was consumed'],
    ];

    page.loadData();
    page.startSelectedDifficulty();

    for (const [patch, title, description] of cases) {
      page.overview.setStateFromWorkflow(activeExplorationState('easy', true, false, pastStepTiming()));
      explorations.resolveHeroExplorationStep.and.returnValue(
        of(stepResolutionWorkflow('easy', patch)),
      );

      page.checkStepResult();

      expect(explorations.resolveHeroExplorationStep).toHaveBeenCalledWith({
        heroId: 'hero-1',
        difficultyKey: 'easy',
        stepId: 'step-1',
      });
      expect(page.stepResultTitle()).toBe(title);
      expect(page.stepResultDescription()).toContain(description);
    }
  });

  it('hides stale resolved step results after exploration context changes', () => {
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(activeExplorationState('easy', true, false, pastStepTiming()));
    page.checkStepResult();

    expect(page.currentStepResult()).not.toBeNull();

    page.overview.setStateFromWorkflow(activeExplorationState('hard', false, false, pastStepTiming(), 'exploration-2'));

    expect(page.currentStepResult()).toBeNull();
  });

  it('does not resolve movement steps before the DB ready time', () => {
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(
      activeExplorationState('easy', true, false, {
        startedAt: new Date(Date.now()).toISOString(),
        resolvesAt: new Date(Date.now() + 60_000).toISOString(),
      }),
    );

    expect(page.canCheckResult()).toBeFalse();

    page.checkStepResult();

    expect(explorations.resolveHeroExplorationStep).not.toHaveBeenCalled();
    expect(feedback.error()).toBe('Movement step is not ready yet.');
  });

  it('completes active challenges through the manual completion RPC', () => {
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(activeExplorationState('easy', false, true));

    page.completeChallenge(true);

    expect(explorations.completeHeroExplorationChallengeAttempt).toHaveBeenCalledOnceWith({
      heroId: 'hero-1',
      difficultyKey: 'easy',
      challengeAttemptId: 'challenge-1',
      completionMode: 'manual',
      success: true,
    });
    expect(page.challengeResultTitle()).toBe('Challenge completed');
    expect(page.challengeResultDescription()).toContain('Manual completion succeeded');
    expect(feedback.successMessage()).toBe('Challenge completed.');
  });

  it('ensures live combat session and submits one DB player action per strike', () => {
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(
      activeExplorationState('easy', false, true, undefined, 'exploration-1', 'combat'),
    );
    TestBed.flushEffects();

    expect(page.isCombatChallenge()).toBeTrue();
    expect(page.canCompleteChallenge()).toBeFalse();
    expect(liveCombat.ensureSession).toHaveBeenCalledWith(jasmine.objectContaining({
      challengeAttemptId: 'challenge-1',
      requestId: jasmine.stringMatching(/^exploration-combat:ensure:challenge-1:/),
    }));
    expect(page.combatParticipants().length).toBe(2);
    expect(page.combatEvents().length).toBe(1);
    expect(page.combatTimingManifest()).toEqual(jasmine.objectContaining({
      manifestId: 'manifest-1',
      greenZonePercent: 30,
      speedMultiplier: 1.25,
      streakBefore: 0,
    }));
    expect(page.combatHitWindow()).toEqual({ start: 35, end: 65, width: 30 });
    expect(page.timingManifestLabel(page.combatTimingManifest()))
      .not.toContain('DB nie zwróciła manifestu timingu');

    page.startCombatChallenge();
    expect(page.isCombatRunning()).toBeTrue();

    page.submitCombatChallengeStrike();

    expect(explorations.completeHeroExplorationChallengeAttempt).not.toHaveBeenCalled();
    expect(liveCombat.submitPlayerAction)
      .toHaveBeenCalledOnceWith(jasmine.objectContaining({
        sessionId: 'session-1',
        timingInput: jasmine.objectContaining({
          positionPercent: jasmine.any(Number),
        }),
        requestId: jasmine.stringMatching(/^exploration-combat:action:challenge-1:/),
      }));
    const input = liveCombat.submitPlayerAction.calls.mostRecent().args[0];

    expect(JSON.stringify(input)).not.toContain('damage');
    expect(JSON.stringify(input)).not.toContain('equipment');
    expect(JSON.stringify(input)).not.toContain('opponent');
    expect(JSON.stringify(input)).not.toContain('outcome');
    expect(page.combatEvents().map((event) => event.eventIndex)).toEqual([1, 2]);
  });

  it('loads final live combat result detail and refreshes exploration state after DB completion', () => {
    liveCombat.submitPlayerAction.and.returnValue(of(combatLiveState({
      statusKey: 'completed',
      statusLabel: 'Completed',
      awaitingPlayerAction: false,
      finalCombatResultId: 'combat-result-1',
      eventCount: 2,
      events: [combatEvent(1), combatEvent(2, { eventKind: 'session_completed' })],
    })));
    explorations.getHeroExplorationState.and.returnValues(
      of(noExplorationState('easy')),
      of(noExplorationState('easy')),
      of(activeExplorationState('easy')),
    );
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(
      activeExplorationState('easy', false, true, undefined, 'exploration-1', 'combat'),
    );
    TestBed.flushEffects();

    page.startCombatChallenge();
    page.submitCombatChallengeStrike();

    expect(page.combatLiveState()?.statusKey).toBe('completed');
    expect(page.combatResultDetail()?.combatResultId).toBe('combat-result-1');
    expect(liveCombat.getResultDetail).toHaveBeenCalledOnceWith({
      combatResultId: 'combat-result-1',
    });
    expect(explorations.getHeroExplorationState).toHaveBeenCalledWith({
      heroId: 'hero-1',
      difficultyKey: 'easy',
    });
    expect(feedback.successMessage()).toBe('Walka została zakończona przez DB.');
  });

  it('exposes live combat participants, events and final detail without legacy resolver', () => {
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState('easy')));
    liveCombat.ensureSession.and.returnValue(of(combatLiveState({
      statusKey: 'completed',
      statusLabel: 'Completed',
      awaitingPlayerAction: false,
      finalCombatResultId: 'combat-result-1',
      eventCount: 2,
      events: [combatEvent(1), combatEvent(2, { eventKind: 'session_completed' })],
    })));
    rewards.getLatestChallengeReward.and.returnValue(of(null));

    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(
      activeExplorationState('easy', false, true, undefined, 'exploration-1', 'combat'),
    );
    TestBed.flushEffects();

    expect(page.combatResultDetail()?.combatResultId).toBe('combat-result-1');
    expect(page.combatResultDetail()?.outcome).toBe('initiator_victory');
    expect(page.combatParticipants().map((participant) => participant.displayName))
      .toEqual(['Hero', 'Opponent']);
    expect(page.combatEvents().map((event) => event.eventIndex)).toEqual([1, 2]);
    expect(liveCombat.ensureSession).toHaveBeenCalled();
    expect(liveCombat.submitPlayerAction).not.toHaveBeenCalled();
  });
  it('auto-resolves active challenges as a database fallback', () => {
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(activeExplorationState('easy', false, true));

    expect(page.autoResolveExplanation()).toContain('database fallback');
    expect(page.autoResolveExplanation()).toContain('worse than manual');

    page.autoResolveChallenge();

    expect(explorations.autoResolveHeroExplorationChallengeAttempt).toHaveBeenCalledOnceWith({
      heroId: 'hero-1',
      difficultyKey: 'easy',
      challengeAttemptId: 'challenge-1',
    });
    expect(page.currentChallengeResult()?.completionMode).toBe('auto');
    expect(feedback.successMessage()).toBe('Challenge auto-resolved.');
  });

  it('labels auto-resolve as manual combat for active combat challenges', () => {
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(
      activeExplorationState('easy', false, true, undefined, 'exploration-1', 'combat'),
    );

    const autoResolveFact = page.challengeFacts()
      .find((fact) => fact.label === 'Auto-resolve');

    expect(autoResolveFact?.value).toBe('Manual combat');
  });

  it('loads persisted challenge rewards for the current exploration', async () => {
    rewards.getLatestChallengeReward.and.returnValue(of(challengeReward()));

    page.loadData();
    page.startSelectedDifficulty();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(rewards.getLatestChallengeReward).toHaveBeenCalledWith({
      heroId: 'hero-1',
      explorationId: 'exploration-1',
    });
    expect(page.rewardSummary()).toContain('2 reward entries');
    expect(page.rewardEntryLabel(page.reward()!.entries[0])).toBe('20 EXP');
    expect(page.rewardItemLabel('item-1')).toBe('Reward blade');
    expect(page.rewardItemDetails('item-1')).toContain('Quality fine');
  });

  it('shows XP and Character Points while hiding generated-item entries without items', async () => {
    rewards.getLatestChallengeReward.and.returnValue(
      of(challengeReward({
        entries: [
          rewardEntry({ id: 'entry-xp', entryKind: 'experience', amount: 70 }),
          rewardEntry({
            id: 'entry-cp',
            entryKind: 'character_points',
            amount: 70,
          }),
          rewardEntry({
            id: 'entry-item',
            entryKind: 'generated_item',
            amount: 0,
            itemId: null,
          }),
        ],
        items: [],
      })),
    );

    page.loadData();
    page.startSelectedDifficulty();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(page.rewardSummary()).toContain('3 reward entries');
    expect(page.visibleRewardEntries().map((entry) => entry.id))
      .toEqual(['entry-xp', 'entry-cp']);
    expect(page.visibleRewardEntries().map((entry) => page.rewardEntryLabel(entry)))
      .toEqual(['70 EXP', '70 Character Points']);
  });

  it('shows clear no-reward state for failed persisted challenges', async () => {
    rewards.getLatestChallengeReward.and.returnValue(
      of(challengeReward({
        success: false,
        rewardGrantId: null,
        rewardGrant: null,
        entries: [],
        items: [],
      })),
    );

    page.loadData();
    page.startSelectedDifficulty();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(page.rewardSummary()).toBe('The latest completed challenge did not grant a reward.');
  });

  it('clears stale reward while loading a new exploration and ignores stale responses', async () => {
    const firstReward = new Subject<ExplorationChallengeRewardReadModel | null>();
    const secondReward = new Subject<ExplorationChallengeRewardReadModel | null>();
    rewards.getLatestChallengeReward.and.returnValues(
      of(challengeReward()),
      firstReward.asObservable(),
      secondReward.asObservable(),
    );

    page.loadData();
    page.startSelectedDifficulty();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(page.reward()?.rewardGrantId).toBe('reward-1');

    page.overview.setStateFromWorkflow(activeExplorationState('easy', false, false, pastStepTiming(), 'exploration-2'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(page.reward()).toBeNull();
    expect(page.isLoadingReward()).toBeTrue();

    page.overview.setStateFromWorkflow(activeExplorationState('easy', false, false, pastStepTiming(), 'exploration-3'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(page.reward()).toBeNull();
    expect(page.isLoadingReward()).toBeTrue();

    firstReward.next(challengeReward({ rewardGrantId: 'stale-reward' }));
    firstReward.complete();
    expect(page.reward()).toBeNull();
    expect(page.isLoadingReward()).toBeTrue();

    secondReward.next(challengeReward({ rewardGrantId: 'reward-2' }));
    secondReward.complete();
    expect(page.reward()?.rewardGrantId).toBe('reward-2');
    expect(page.isLoadingReward()).toBeFalse();
  });

  it('hides stale challenge completion results after exploration context changes', () => {
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(activeExplorationState('easy', false, true));
    page.completeChallenge(true);

    expect(page.currentChallengeResult()).not.toBeNull();

    page.overview.setStateFromWorkflow(activeExplorationState('hard', false, false, pastStepTiming(), 'exploration-2'));

    expect(page.currentChallengeResult()).toBeNull();
  });

  it('ignores stale state responses after difficulty changes', () => {
    const firstState = new Subject<HeroExplorationStateReadModel>();
    const secondState = new Subject<HeroExplorationStateReadModel>();
    explorations.getActiveDifficultyTiers.and.returnValue(
      of([difficulty('easy'), difficulty('hard')]),
    );
    explorations.getHeroExplorationState.and.returnValues(
      of(noExplorationState('easy')),
      firstState.asObservable(),
      secondState.asObservable(),
    );

    page.loadData();
    page.selectDifficulty('hard');
    page.selectDifficulty('easy');

    firstState.next(activeExplorationState('hard'));
    firstState.complete();
    expect(page.state()?.difficultyKey).toBe('easy');
    expect(page.isLoading()).toBeTrue();

    secondState.next(noExplorationState('easy'));
    secondState.complete();
    expect(page.state()?.difficultyKey).toBe('easy');
    expect(page.isLoading()).toBeFalse();
  });
});

function activeHeroContext(): RequiredActiveHeroState {
  return {
    heroId: 'hero-1',
  } as RequiredActiveHeroState;
}

function difficulty(key: string): ExplorationDifficultyTierReadModel {
  return {
    key,
    label: key.toUpperCase(),
    description: `${key} difficulty.`,
    trialOpportunityStepCap: 3,
  } as ExplorationDifficultyTierReadModel;
}

function previewRow(difficultyKey: string): TrialOpportunityCurvePreview {
  return {
    difficultyKey,
  } as TrialOpportunityCurvePreview;
}

function noExplorationState(difficultyKey: string): HeroExplorationStateReadModel {
  return {
    hasExploration: false,
    heroId: 'hero-1',
    difficultyKey,
    remainingTrials: 2,
    exploration: null,
    edges: [],
    activeStep: null,
  } as unknown as HeroExplorationStateReadModel;
}

function activeExplorationState(
  difficultyKey: string,
  withActiveStep = false,
  withActiveChallenge = false,
  activeStepTiming = { startedAt: '2026-05-01T10:00:00.000Z', resolvesAt: '2026-05-01T10:05:00.000Z' },
  explorationId = 'exploration-1',
  minigameKey = 'timing',
): HeroExplorationStateReadModel {
  return {
    ...noExplorationState(difficultyKey),
    hasExploration: true,
    exploration: {
      id: explorationId,
      difficultyKey,
      districtCode: 'district-a',
      status: 'active',
      currentNodeId: 'node-1',
      trialDryStepCount: 0,
    } as HeroExplorationStateReadModel['exploration'],
    currentNode: {
      id: 'node-1',
      label: 'Crossroads',
    } as HeroExplorationStateReadModel['currentNode'],
    edges: [
      {
        id: 'edge-1',
        explorationId,
        fromNodeId: 'node-1',
        toNodeId: 'node-2',
        directionKey: 'north',
        label: 'North road',
        sortOrder: 10,
        isAvailable: true,
      } as HeroExplorationStateReadModel['edges'][number],
    ],
    activeStep: withActiveStep
      ? {
          id: 'step-1',
          stepKind: 'movement',
          status: 'pending',
          startedAt: activeStepTiming.startedAt,
          resolvesAt: activeStepTiming.resolvesAt,
        } as HeroExplorationStateReadModel['activeStep']
      : null,
    activeChallenge: withActiveChallenge
      ? {
          id: 'challenge-1',
          explorationId,
          stepId: 'step-1',
          challengeKind: 'trial',
          status: 'active',
          difficultyKey,
          districtCode: 'district-a',
          trialDefinitionId: 'trial-1',
          encounterDefinitionId: null,
          minigameKey,
          testedStatKey: 'dexterity',
          manifestationStatus: 'manifested',
          manifestationChance: 40,
          manifestationRoll: 12,
          manualDeadlineAt: '2026-05-01T10:10:00.000Z',
          completionMode: null,
          performanceRating: null,
          score: null,
          success: null,
          rewardGrantId: null,
          autoResolveChance: 35,
          autoResolveRoll: null,
          startedAt: '2026-05-01T10:05:00.000Z',
          completedAt: null,
        } as HeroExplorationStateReadModel['activeChallenge']
      : null,
  };
}

function stepResolutionWorkflow(
  difficultyKey: string,
  patch: Partial<HeroExplorationStepResolutionWorkflowResult['result']> | string = 'nothing',
): HeroExplorationStepResolutionWorkflowResult {
  const resultPatch = typeof patch === 'string' ? { outcomeKind: patch } : patch;

  return {
    result: {
      stepId: 'step-1',
      explorationId: 'exploration-1',
      status: 'resolved',
      outcomeKind: 'nothing',
      currentNodeId: 'node-2',
      toNodeId: 'node-2',
      trialDefinitionId: null,
      encounterDefinitionId: null,
      challengeAttemptId: null,
      remainingTrials: 1,
      trialDryStepCount: 1,
      metadataJson: { flavorText: 'The passage is quiet.' },
      ...resultPatch,
    },
    state: activeExplorationState(difficultyKey),
  };
}

function challengeCompletionWorkflow(
  difficultyKey: string,
  patch: Partial<HeroExplorationChallengeCompletionWorkflowResult['result']> = {},
): HeroExplorationChallengeCompletionWorkflowResult {
  return {
    result: {
      challengeAttemptId: 'challenge-1',
      status: 'completed',
      success: true,
      completionMode: 'manual',
      rewardGrantId: 'reward-1',
      remainingTrials: 1,
      explorationStatus: 'active',
      autoResolveChance: null,
      autoResolveRoll: null,
      ...patch,
    },
    state: activeExplorationState(difficultyKey),
  };
}

function combatLiveState(
  patch: Partial<CombatLiveStateReadModel> = {},
): CombatLiveStateReadModel {
  return {
    sessionId: 'session-1',
    serverId: 'server-1',
    sourceType: 'exploration_challenge',
    sourceEntityType: 'hero_exploration_challenge_attempt',
    sourceEntityId: 'challenge-1',
    statusKey: 'awaiting_player',
    statusLabel: 'Awaiting player',
    currentRoundNumber: 1,
    currentActionIndex: 1,
    currentActorParticipantId: 'participant-hero',
    awaitingPlayerAction: true,
    currentTimingManifest: {
      manifestId: 'manifest-1',
      actorParticipantId: 'participant-hero',
      targetParticipantId: 'participant-opponent',
      greenZonePercent: 30,
      hitChancePercent: 30,
      speedMultiplier: 1.25,
      streakBefore: 0,
      roundNumber: 1,
      actionIndex: 1,
      attackIndex: 1,
      requiresManualInput: true,
      isPlayerControlled: true,
      zoneStartPercent: 35,
      zoneEndPercent: 65,
      zoneWidthPercent: 30,
      speed: 1.25,
      label: 'Strike window',
      rawJson: {},
    },
    participants: [
      {
        participantId: 'participant-hero',
        side: 'initiator',
        displayName: 'Hero',
        statusKey: 'active',
        statusLabel: 'Active',
        currentHp: 42,
        maxHp: 50,
        heroId: 'hero-1',
        opponentDefinitionId: null,
        rawJson: {},
      },
      {
        participantId: 'participant-opponent',
        side: 'defender',
        displayName: 'Opponent',
        statusKey: 'active',
        statusLabel: 'Active',
        currentHp: 30,
        maxHp: 30,
        heroId: null,
        opponentDefinitionId: 'opponent-1',
        rawJson: {},
      },
    ],
    events: [combatEvent(1)],
    finalCombatResultId: null,
    eventCount: 1,
    updatedAt: '2026-05-01T10:10:00.000Z',
    rawJson: {},
    ...patch,
  };
}

function combatEvent(
  eventIndex: number,
  patch: Partial<CombatLiveStateReadModel['events'][number]> = {},
): CombatLiveStateReadModel['events'][number] {
  return {
    eventIndex,
    eventKind: 'player_action_requested',
    label: `Event ${eventIndex}`,
    actorParticipantId: 'participant-hero',
    targetParticipantId: 'participant-opponent',
    roundNumber: 1,
    actionIndex: eventIndex,
    happenedAt: '2026-05-01T10:10:00.000Z',
    details: [`Detail ${eventIndex}`],
    rawJson: {},
    ...patch,
  };
}

function combatResultDetail(
  patch: Partial<CombatResultDetailReadModel> = {},
): CombatResultDetailReadModel {
  return {
    combatResultId: 'combat-result-1',
    outcome: 'initiator_victory',
    winnerSide: 'initiator',
    loserSide: 'defender',
    turnsCompleted: 2,
    startedAt: '2026-05-01T10:10:00.000Z',
    completedAt: '2026-05-01T10:11:00.000Z',
    participants: [],
    attacks: [],
    rawJson: {},
    ...patch,
  };
}

function challengeReward(
  patch: Partial<ExplorationChallengeRewardReadModel> = {},
): ExplorationChallengeRewardReadModel {
  return {
    challengeAttemptId: 'challenge-1',
    challengeKind: 'trial',
    status: 'completed',
    success: true,
    completionMode: 'manual',
    completedAt: '2026-05-01T10:20:00.000Z',
    rewardGrantId: 'reward-1',
    rewardGrant: {
      id: 'reward-1',
      serverId: 'server-1',
      recipientHeroId: 'hero-1',
      rewardProfileId: 'profile-1',
      sourceKind: 'challenge_attempt',
      sourceId: 'challenge-1',
      status: 'granted',
      reason: null,
      requestId: null,
      metadataJson: {},
      grantedAt: '2026-05-01T10:20:00.000Z',
      createdAt: '2026-05-01T10:20:00.000Z',
    },
    entries: [
      {
        id: 'entry-1',
        rewardGrantId: 'reward-1',
        rewardProfileEntryId: 'profile-entry-1',
        entryKind: 'experience',
        amount: 20,
        resourceType: null,
        itemId: null,
        effectDefinitionId: null,
        sourceHeroId: null,
        targetHeroId: 'hero-1',
        oldValueJson: null,
        newValueJson: null,
        metadataJson: {},
        createdAt: '2026-05-01T10:20:00.000Z',
      },
      {
        id: 'entry-2',
        rewardGrantId: 'reward-1',
        rewardProfileEntryId: 'profile-entry-2',
        entryKind: 'generated_item',
        amount: 1,
        resourceType: null,
        itemId: 'item-1',
        effectDefinitionId: null,
        sourceHeroId: null,
        targetHeroId: 'hero-1',
        oldValueJson: null,
        newValueJson: null,
        metadataJson: {},
        createdAt: '2026-05-01T10:20:00.000Z',
      },
    ],
    items: [
      {
        id: 'item-1',
        serverId: 'server-1',
        heroId: 'hero-1',
        name: 'Reward blade',
        description: null,
        status: 'active',
        generationBaseId: 'base-1',
        generationQualityKey: 'fine',
        prefixAffixId: 'prefix-1',
        suffixAffixId: null,
        armoryShelfPosition: 0,
        drachmaValue: 120,
        metadataJson: {},
        generatedAt: '2026-05-01T10:20:00.000Z',
        scrappedAt: null,
        recoverableUntil: null,
        createdAt: '2026-05-01T10:20:00.000Z',
        updatedAt: '2026-05-01T10:20:00.000Z',
      },
    ],
    ...patch,
  };
}

function rewardEntry(
  patch: Partial<ExplorationChallengeRewardReadModel['entries'][number]> = {},
): ExplorationChallengeRewardReadModel['entries'][number] {
  return {
    id: 'entry-1',
    rewardGrantId: 'reward-1',
    rewardProfileEntryId: 'profile-entry-1',
    entryKind: 'experience',
    amount: 20,
    resourceType: null,
    itemId: null,
    effectDefinitionId: null,
    sourceHeroId: null,
    targetHeroId: 'hero-1',
    oldValueJson: null,
    newValueJson: null,
    metadataJson: {},
    createdAt: '2026-05-01T10:20:00.000Z',
    ...patch,
  };
}

function pastStepTiming(): { startedAt: string; resolvesAt: string } {
  return {
    startedAt: new Date(Date.now() - 60_000).toISOString(),
    resolvesAt: new Date(Date.now() - 1_000).toISOString(),
  };
}
