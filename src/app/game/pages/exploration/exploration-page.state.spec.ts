import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { ExplorationDifficultyTierReadModel } from '../../../core/domain/exploration/exploration-definition.model';
import { TrialOpportunityCurvePreview } from '../../../core/domain/exploration/exploration-preview.model';
import {
  HeroExplorationChallengeCompletionWorkflowResult,
  HeroExplorationStateReadModel,
  HeroExplorationStepResolutionWorkflowResult,
} from '../../../core/domain/exploration/exploration-runtime.model';
import { RequiredActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ExplorationChallengeState } from './exploration-challenge.state';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationMovementState } from './exploration-movement.state';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationPageState } from './exploration-page.state';
import { ExplorationPreviewState } from './exploration-preview.state';
import { ExplorationStepState } from './exploration-step.state';
import { ExplorationStartState } from './exploration-start.state';

describe('ExplorationPageState', () => {
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let explorations: jasmine.SpyObj<HeroExplorations>;
  let page: ExplorationPageState;
  let feedback: ExplorationFeedbackState;

  beforeEach(() => {
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', ['requireActiveHero']);
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

    TestBed.configureTestingModule({
      providers: [
        ExplorationFeedbackState,
        ExplorationPreviewState,
        ExplorationOverviewState,
        ExplorationMovementState,
        ExplorationStepState,
        ExplorationChallengeState,
        ExplorationStartState,
        ExplorationPageState,
        { provide: ActiveHero, useValue: activeHero },
        { provide: HeroExplorations, useValue: explorations },
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
          minigameKey: 'timing',
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

function pastStepTiming(): { startedAt: string; resolvesAt: string } {
  return {
    startedAt: new Date(Date.now() - 60_000).toISOString(),
    resolvesAt: new Date(Date.now() - 1_000).toISOString(),
  };
}
