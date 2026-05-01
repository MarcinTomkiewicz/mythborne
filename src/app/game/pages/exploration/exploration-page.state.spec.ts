import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { ExplorationDifficultyTierReadModel } from '../../../core/domain/exploration/exploration-definition.model';
import { TrialOpportunityCurvePreview } from '../../../core/domain/exploration/exploration-preview.model';
import { HeroExplorationStateReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { RequiredActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationMovementState } from './exploration-movement.state';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationPageState } from './exploration-page.state';
import { ExplorationPreviewState } from './exploration-preview.state';
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
    ]);

    activeHero.requireActiveHero.and.returnValue(of(activeHeroContext()));
    explorations.getActiveDifficultyTiers.and.returnValue(of([difficulty('easy')]));
    explorations.getHeroExplorationState.and.returnValue(of(noExplorationState('easy')));
    explorations.startHeroExplorationStep.and.returnValue(
      of(activeExplorationState('easy', true)),
    );
    explorations.startOrGetHeroExploration.and.returnValue(of(activeExplorationState('easy')));
    explorations.previewTrialOpportunityCurve.and.returnValue(of([previewRow('easy')]));

    TestBed.configureTestingModule({
      providers: [
        ExplorationFeedbackState,
        ExplorationPreviewState,
        ExplorationOverviewState,
        ExplorationMovementState,
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
    userId: 'user-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    server: { id: 'server-1', name: 'Server' } as RequiredActiveHeroState['server'],
    hero: {} as never,
    heroRow: {} as never,
  };
}

function difficulty(key: string): ExplorationDifficultyTierReadModel {
  return {
    key,
    label: key.toUpperCase(),
    description: `${key} difficulty.`,
    helperText: null,
    adminDescription: null,
    sortOrder: key === 'easy' ? 10 : 20,
    isActive: true,
    stepDurationMultiplier: 1,
    trialRewardMultiplier: 1,
    encounterRewardMultiplier: 1,
    trialOpportunityStepCap: 3,
    metadataJson: {},
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z',
  };
}

function previewRow(difficultyKey: string): TrialOpportunityCurvePreview {
  return {
    difficultyKey,
    difficultyLabel: difficultyKey.toUpperCase(),
    projectedStepNumber: 1,
    dryStepCount: 0,
    trialOpportunityChance: 25,
    trialOpportunityStepCap: 3,
    isGuaranteedByStepCap: false,
    explanation: 'Preview only.',
  };
}

function noExplorationState(difficultyKey: string): HeroExplorationStateReadModel {
  return {
    hasExploration: false,
    heroId: 'hero-1',
    difficultyKey,
    explorationDate: '2026-05-01',
    remainingTrials: 2,
    exploration: null,
    currentNode: null,
    edges: [],
    activeStep: null,
    activeChallenge: null,
    activeEffect: null,
    rawJson: {},
  };
}

function activeExplorationState(
  difficultyKey: string,
  withActiveStep = false,
  withActiveChallenge = false,
): HeroExplorationStateReadModel {
  return {
    ...noExplorationState(difficultyKey),
    hasExploration: true,
    exploration: {
      id: 'exploration-1',
      serverId: 'server-1',
      heroId: 'hero-1',
      difficultyKey,
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
    currentNode: {
      id: 'node-1',
      serverId: 'server-1',
      explorationId: 'exploration-1',
      parentNodeId: null,
      descriptionId: null,
      label: 'Crossroads',
      createdSequence: 1,
      distanceFromRoot: 0,
      metadataJson: {},
      createdAt: '2026-05-01T10:00:00.000Z',
      updatedAt: '2026-05-01T10:00:00.000Z',
    },
    edges: [
      {
        id: 'edge-1',
        serverId: 'server-1',
        explorationId: 'exploration-1',
        fromNodeId: 'node-1',
        toNodeId: 'node-2',
        directionKey: 'north',
        label: 'North road',
        sortOrder: 10,
        isAvailable: true,
        metadataJson: {},
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    activeStep: withActiveStep
      ? {
          id: 'step-1',
          stepKind: 'movement',
          status: 'pending',
          resolvesAt: '2026-05-01T10:05:00.000Z',
        } as HeroExplorationStateReadModel['activeStep']
      : null,
    activeChallenge: withActiveChallenge
      ? {
          id: 'challenge-1',
          challengeKind: 'trial',
          status: 'active',
        } as HeroExplorationStateReadModel['activeChallenge']
      : null,
  };
}
