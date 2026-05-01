import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { ExplorationDifficultyTierReadModel } from '../../../core/domain/exploration/exploration-definition.model';
import { TrialOpportunityCurvePreview } from '../../../core/domain/exploration/exploration-preview.model';
import { HeroExplorationStateReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { RequiredActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ExplorationFeedbackState } from './exploration-feedback.state';
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
      'startOrGetHeroExploration',
      'previewTrialOpportunityCurve',
    ]);

    activeHero.requireActiveHero.and.returnValue(of(activeHeroContext()));
    explorations.getActiveDifficultyTiers.and.returnValue(of([difficulty('easy')]));
    explorations.getHeroExplorationState.and.returnValue(of(noExplorationState('easy')));
    explorations.startOrGetHeroExploration.and.returnValue(of(activeExplorationState('easy')));
    explorations.previewTrialOpportunityCurve.and.returnValue(of([previewRow('easy')]));

    TestBed.configureTestingModule({
      providers: [
        ExplorationFeedbackState,
        ExplorationPreviewState,
        ExplorationOverviewState,
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

function activeExplorationState(difficultyKey: string): HeroExplorationStateReadModel {
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
  };
}
