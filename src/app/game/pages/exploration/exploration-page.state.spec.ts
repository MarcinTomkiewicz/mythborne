import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { signal } from '@angular/core';
import { ENCOUNTER_KIND } from '../../../core/constants/encounter-runtime-keys.const';
import {
  CombatLiveStateReadModel,
  CombatResultDetailReadModel,
} from '../../../core/domain/combat/combat-live.model';
import { HeroExplorationDifficultyCardPreview } from '../../../core/domain/exploration/exploration-preview.model';
import { ExplorationChallengeRewardReadModel } from '../../../core/domain/exploration/exploration-reward.model';
import { ExplorationStepOutcomeKind } from '../../../core/domain/exploration/exploration-readiness.model';
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
import { ActiveServer } from '../../../core/services/server/active-server';
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
  let selectedServer: ReturnType<typeof signal<{ kind: string; canUseAsSandbox: boolean } | null>>;
  let serverAccess: ReturnType<typeof signal<{ canAccessSandbox: boolean }>>;
  let page: ExplorationPageState;
  let feedback: ExplorationFeedbackState;

  beforeEach(() => {
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', ['requireActiveHero']);
    rewards = jasmine.createSpyObj<HeroExplorationRewards>('HeroExplorationRewards', [
      'getChallengeReward',
      'getStepReward',
    ]);
    liveCombat = jasmine.createSpyObj<ExplorationLiveCombat>('ExplorationLiveCombat', [
      'ensureSession',
      'getState',
      'submitPlayerAction',
      'getResultDetail',
    ]);
    explorations = jasmine.createSpyObj<HeroExplorations>('HeroExplorations', [
      'getActiveDifficultyTiers',
      'getHeroExplorationDifficultyCardPreviews',
      'getHeroExplorationState',
      'startHeroExplorationStep',
      'startOrGetHeroExploration',
      'previewTrialOpportunityCurve',
      'resolveHeroExplorationStep',
      'completeHeroExplorationChallengeAttempt',
      'autoResolveHeroExplorationChallengeAttempt',
    ]);

    activeHero.requireActiveHero.and.returnValue(of(activeHeroContext()));
    explorations.getHeroExplorationDifficultyCardPreviews.and.returnValue(
      of([difficultyCardPreview('easy')]),
    );
    explorations.getHeroExplorationState.and.returnValue(of(noExplorationState('easy')));
    explorations.startHeroExplorationStep.and.returnValue(
      of(activeExplorationState('easy', true)),
    );
    explorations.startOrGetHeroExploration.and.returnValue(of(activeExplorationState('easy')));
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
      events: [combatEvent(1), combatEvent(2, {
        label: 'Attack Resolved',
        rawJson: {
          finalDamage: 18,
          targetHealthBefore: 30,
          targetHealthAfter: 12,
          timingHit: true,
          critical: true,
        },
      })],
    })));
    liveCombat.getResultDetail.and.returnValue(of(combatResultDetail()));
    rewards.getChallengeReward.and.returnValue(of(null));
    rewards.getStepReward.and.returnValue(of(null));
    selectedServer = signal({ kind: 'standard', canUseAsSandbox: false });
    serverAccess = signal({ canAccessSandbox: false });

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
        {
          provide: ActiveServer,
          useValue: {
            selectedServer: () => selectedServer(),
            access: () => serverAccess(),
          },
        },
      ],
    });
    TestBed.overrideComponent(ExplorationPage, {
      remove: { providers: [ExplorationLiveCombat] },
      add: { providers: [{ provide: ExplorationLiveCombat, useValue: liveCombat }] },
    });
    page = TestBed.inject(ExplorationPageState);
    feedback = TestBed.inject(ExplorationFeedbackState);
  });

  it('loads active hero context, DB difficulty card previews and selected exploration state', () => {
    page.loadData();

    expect(page.difficultyCardPreviews()[0].difficultyKey).toBe('easy');
    expect(page.selectedDifficultyKey()).toBe('easy');
    expect(page.state()?.remainingTrials).toBe(2);
    expect(explorations.getHeroExplorationDifficultyCardPreviews).toHaveBeenCalledWith({
      heroId: 'hero-1',
      stepsToPreview: 3,
    });
    expect(explorations.getHeroExplorationState).toHaveBeenCalledWith({
      heroId: 'hero-1',
      difficultyKey: 'easy',
    });
    expect(explorations.previewTrialOpportunityCurve).not.toHaveBeenCalled();
  });

  it('creates the exploration route component with local page state providers', () => {
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();

    expect(fixture.componentInstance.page).toBeTruthy();
    expect(activeHero.requireActiveHero).toHaveBeenCalled();
  });

  it('renders start exploration on the selected difficulty and starts through the canonical workflow', () => {
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    const startButton = findButton(fixture.nativeElement, 'Start exploration');

    expect(startButton).not.toBeNull();

    startButton?.click();

    expect(explorations.startOrGetHeroExploration).toHaveBeenCalledWith({
      heroId: 'hero-1',
      difficultyKey: 'easy',
    });
  });

  it('selects an available non-selected difficulty from the whole card surface', () => {
    explorations.getHeroExplorationDifficultyCardPreviews.and.returnValue(
      of([difficultyCardPreview('easy'), difficultyCardPreview('hard')]),
    );
    explorations.getHeroExplorationState.and.returnValue(of(noExplorationState('easy')));
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    const hardCard = (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLElement>('[aria-label="Select HARD difficulty"]');

    expect(hardCard).not.toBeNull();

    hardCard?.click();

    expect(fixture.componentInstance.page.selectedDifficultyKey()).toBe('hard');
    expect(explorations.getHeroExplorationState).toHaveBeenCalledWith({
      heroId: 'hero-1',
      difficultyKey: 'hard',
    });
  });

  it('shows selected difficulty auto-result in the entry summary without status badges', () => {
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Approx. auto result');
    expect(text).toContain('57%');
    expect(text).not.toContain('Available');
    expect(text).not.toContain('Unavailable');
    expect(text).not.toContain('Selected');
  });

  it('shows continue action instead of start when exploration already exists', () => {
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState('easy')));
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Continue adventure');
    expect(text).not.toContain('Start exploration');
  });

  it('continues an existing exploration into the runtime screen without difficulty cards as primary content', () => {
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState('easy')));
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    findButton(fixture.nativeElement, 'Continue adventure')?.click();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Exploration runtime');
    expect(text).toContain('Choose the next path');
    expect(text).toContain('Directions');
    expect(text).toContain('Direction board');
    expect(text).toContain('North road');
    expect(text).toContain('Available path');
    expect(text).not.toContain('Active tiers come from the database configuration.');
  });

  it('starts the next movement step from the runtime direction board', () => {
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState('easy')));
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    findButton(fixture.nativeElement, 'Continue adventure')?.click();
    fixture.detectChanges();

    const chooseButton = findButton(fixture.nativeElement, 'Choose path');

    expect(chooseButton).not.toBeNull();

    chooseButton?.click();

    expect(explorations.startHeroExplorationStep).toHaveBeenCalledWith({
      heroId: 'hero-1',
      difficultyKey: 'easy',
      explorationId: 'exploration-1',
      edgeId: 'edge-1',
      stepKind: 'edge',
    });
  });

  it('shows a no-choice state when the runtime read model has no directions', () => {
    explorations.getHeroExplorationState.and.returnValue(of({
      ...activeExplorationState('easy'),
      edges: [],
      movementOptions: [],
    }));
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    findButton(fixture.nativeElement, 'Continue adventure')?.click();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Directions');
    expect(text).toContain('No available directions.');
    expect(text).toContain('No directions are available');
    expect(findButton(fixture.nativeElement, 'Choose path')).toBeNull();
  });

  it('renders active pending step as the runtime screen with backend-owned progress', () => {
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState(
      'easy',
      true,
      false,
      { startedAt: '2026-05-01T10:00:00.000Z', resolvesAt: '2026-05-01T10:05:00.000Z' },
    )));
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Exploration runtime');
    expect(text).toContain('Pending step');
    expect(text).toContain('Step progress');
    expect(text).toContain('Remaining');
    expect(text).toContain('Progress');
    expect(text).toContain('Movement in progress');
    expect(text).not.toContain('Check result');
    expect(text).not.toContain('Active tiers come from the database configuration.');
  });

  it('shows the check-result action only when the pending step is ready', () => {
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState(
      'easy',
      true,
      false,
      pastStepTiming(),
    )));
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Exploration runtime');
    expect(text).toContain('Result ready');
    expect(text).toContain('Ready');
    expect(text).toContain('Check result');
  });

  it('does not render the difficulty entry screen for active combat runtime state', () => {
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState(
      'easy',
      false,
      true,
      { startedAt: '2026-05-01T10:00:00.000Z', resolvesAt: '2026-05-01T10:05:00.000Z' },
      'exploration-1',
      ENCOUNTER_KIND.combat,
    )));
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('Active tiers come from the database configuration.');
    expect(text).toContain('Exploration runtime');
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
    const option = page.movementOptions()[0];

    page.chooseMovementOption(option);

    expect(explorations.startHeroExplorationStep).toHaveBeenCalledOnceWith({
      heroId: 'hero-1',
      difficultyKey: 'easy',
      explorationId: 'exploration-1',
      edgeId: 'edge-1',
      stepKind: 'edge',
    });
    expect(feedback.successMessage()).toBe('Movement step started.');
    expect(page.activeStepLabel()).toContain('movement - pending');
  });

  it('disables movement while a step or challenge blocks direction choice', () => {
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(activeExplorationState('easy', true));

    expect(page.movementBlockReason()).toBe('Wait for the active movement step to resolve.');
    expect(page.canChooseMovementOption(page.movementOptions()[0])).toBeFalse();

    page.overview.setStateFromWorkflow(activeExplorationState('easy', false, true));

    expect(page.movementBlockReason()).toBe('Resolve the active challenge before moving.');
    expect(page.canChooseMovementOption(page.movementOptions()[0])).toBeFalse();
  });

  it('describes resolved step outcomes from RPC snapshots', () => {
    const cases: Array<[
      Partial<HeroExplorationStepResolutionWorkflowResult['result']>,
      string,
      string,
    ]> = [
      [{ outcomeKind: 'nothing', currentNodeId: null, toNodeId: null }, 'Nothing found', 'database fallback'],
      [
        {
          outcomeKind: 'encounter',
          encounterDefinitionId: 'encounter-1',
          challengeAttemptId: 'challenge-1',
          selectedDefinition: selectedEncounter('encounter-1', 'light_combat', ENCOUNTER_KIND.combat),
        },
        'Combat Encounter started',
        'requires resolution',
      ],
      [
        {
          outcomeKind: 'encounter',
          encounterDefinitionId: 'encounter-2',
          selectedDefinition: selectedEncounter('encounter-2', 'minor_resource_find', ENCOUNTER_KIND.resource),
        },
        'Resource Encounter resolved',
        'database reward flow',
      ],
      [
        {
          outcomeKind: 'encounter',
          encounterDefinitionId: 'encounter-3',
          selectedDefinition: selectedEncounter('encounter-3', 'blessing', ENCOUNTER_KIND.buff),
        },
        'Buff Encounter resolved',
        'did not return an active effect',
      ],
      [{ outcomeKind: 'trial', trialDefinitionId: 'trial-1', challengeAttemptId: 'challenge-1' }, 'Trial manifested', 'supported Trial action'],
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

  it('renders checked step result as the runtime outcome screen', () => {
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState(
      'easy',
      true,
      false,
      pastStepTiming(),
    )));
    explorations.resolveHeroExplorationStep.and.returnValue(
      of(stepResolutionWorkflow('easy', {
        outcomeKind: 'encounter',
        encounterDefinitionId: 'encounter-2',
        selectedDefinition: selectedEncounter(
          'encounter-2',
          'minor_resource_find',
          ENCOUNTER_KIND.resource,
        ),
      })),
    );
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    fixture.componentInstance.page.checkStepResult();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Exploration runtime');
    expect(text).toContain('Step resolved');
    expect(text).toContain('Step report');
    expect(text).toContain('Resource Encounter resolved');
    expect(text).toContain('Reward / report');
    expect(text).toContain('Ready for next path');
    expect(text).not.toContain('Sandbox selection diagnostics');
    expect(text).not.toContain('Raw selection debug payload');
  });

  it('shows selection diagnostics only for sandbox-access context', () => {
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(activeExplorationState('easy', true, false, pastStepTiming()));
    explorations.resolveHeroExplorationStep.and.returnValue(
      of(stepResolutionWorkflow('easy', {
        outcomeKind: 'encounter',
        encounterDefinitionId: 'encounter-1',
        selectedDefinition: selectedEncounter('encounter-1', 'minor_resource_find', ENCOUNTER_KIND.resource),
        selectionDiagnostic: selectionDiagnostic(),
      })),
    );

    page.checkStepResult();

    expect(page.stepSelectionDiagnostic()).toBeNull();

    selectedServer.set({ kind: 'sandbox', canUseAsSandbox: true });
    serverAccess.set({ canAccessSandbox: true });

    expect(page.stepSelectionDiagnostic()).toEqual(jasmine.objectContaining({
      finalOutcomeKind: 'encounter',
      readinessGuarded: true,
    }));
    expect(page.diagnosticSkippedLabel(page.stepSelectionDiagnostic()!))
      .toContain('incomplete_selected_definition');
  });

  it('renders sandbox selection diagnostics only in gated result context', () => {
    selectedServer.set({ kind: 'sandbox', canUseAsSandbox: true });
    serverAccess.set({ canAccessSandbox: true });
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState(
      'easy',
      true,
      false,
      pastStepTiming(),
    )));
    explorations.resolveHeroExplorationStep.and.returnValue(
      of(stepResolutionWorkflow('easy', {
        outcomeKind: 'encounter',
        encounterDefinitionId: 'encounter-1',
        selectedDefinition: selectedEncounter('encounter-1', 'minor_resource_find', ENCOUNTER_KIND.resource),
        selectionDiagnostic: selectionDiagnostic(),
      })),
    );
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    fixture.componentInstance.page.checkStepResult();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Exploration runtime');
    expect(text).toContain('Step report');
    expect(text).toContain('Sandbox selection diagnostics');
    expect(text).toContain('Raw selection debug payload');
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
    expect(feedback.error()).toBe('Krok ruchu nie jest jeszcze gotowy.');
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
    expect(feedback.successMessage()).toBe('Wyzwanie zostało ukończone.');
  });

  it('hides Trial auto-resolve when DB does not return an auto chance', () => {
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(activeExplorationState(
      'easy',
      false,
      true,
      undefined,
      'exploration-1',
      'timing',
      {
        autoResolveChance: null,
        autoResolveRoll: null,
        autoResolve: {
          ...activeExplorationState('easy', false, true).activeChallenge!.autoResolve,
          chance: null,
          roll: null,
        },
      },
    ));

    expect(page.canCompleteChallenge()).toBeTrue();
    expect(page.canShowManualResolveActions()).toBeTrue();
    expect(page.canShowAutoResolveAction()).toBeFalse();
    expect(page.autoResolveExplanation()).toBe(
      'DB nie zwróciła szansy automatycznego rozstrzygnięcia dla tej próby.',
    );

    page.autoResolveChallenge();

    expect(explorations.autoResolveHeroExplorationChallengeAttempt).not.toHaveBeenCalled();
    expect(feedback.error()).toBe(
      'DB nie zwróciła szansy automatycznego rozstrzygnięcia dla tej próby.',
    );
  });

  it('does not expose resolve buttons for immediate Resource Encounter state', () => {
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(activeExplorationState(
      'easy',
      false,
      true,
      undefined,
      'exploration-1',
      ENCOUNTER_KIND.resource,
      {
        challengeKind: 'encounter',
        trialDefinitionId: null,
        encounterDefinitionId: 'encounter-1',
        testedStatKey: null,
        autoResolveChance: null,
        autoResolveRoll: null,
      },
    ));

    expect(page.challengeTitle()).toBe('Encounter');
    expect(page.canCompleteChallenge()).toBeFalse();
    expect(page.canShowManualResolveActions()).toBeFalse();
    expect(page.canShowAutoResolveAction()).toBeFalse();
    expect(page.challengeActionBlocker()).toContain('Resource Encounter');

    page.completeChallenge(true);

    expect(explorations.completeHeroExplorationChallengeAttempt).not.toHaveBeenCalled();
    expect(feedback.error()).toContain('powinien rozwiązać się przez wynik kroku, nagrodę albo efekt');
  });

  it('ensures live combat session and submits one DB player action per strike', () => {
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(
      activeExplorationState('easy', false, true, undefined, 'exploration-1', ENCOUNTER_KIND.combat),
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
      luckRng: jasmine.objectContaining({
        attackerLuckInfluence: 5,
        criticalChance: 12,
      }),
    }));
    expect(page.timingManifestLabel(page.combatTimingManifest()))
      .not.toContain(`Luck${':'}`);
    expect(page.timingManifestLabel(page.combatTimingManifest()))
      .not.toContain('DB timing context.');
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
    expect(page.combatTimelineRows()[1]).toEqual(jasmine.objectContaining({
      title: 'Hero attacks Opponent',
      badges: jasmine.arrayContaining(['Hit', 'Critical', 'Damage 18', 'HP 30 -> 12']),
    }));
  });

  it('routes a resolved Combat Encounter into live combat instead of a step reward read', () => {
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(activeExplorationState(
      'easy',
      true,
      false,
      pastStepTiming(),
    ));
    explorations.resolveHeroExplorationStep.and.returnValue(
      of(stepResolutionWorkflow('easy', {
        outcomeKind: 'encounter',
        encounterDefinitionId: 'encounter-combat',
        challengeAttemptId: 'challenge-1',
        selectedDefinition: selectedEncounter(
          'encounter-combat',
          'light_combat',
          ENCOUNTER_KIND.combat,
        ),
      }, {
        activeChallenge: activeExplorationState(
          'easy',
          false,
          true,
          undefined,
          'exploration-1',
          ENCOUNTER_KIND.combat,
        ).activeChallenge,
      })),
    );

    page.checkStepResult();
    TestBed.flushEffects();

    expect(page.stepResultTitle()).toBe('Combat Encounter started');
    expect(page.isCombatChallenge()).toBeTrue();
    expect(liveCombat.ensureSession).toHaveBeenCalledWith(jasmine.objectContaining({
      challengeAttemptId: 'challenge-1',
    }));
    expect(rewards.getStepReward).not.toHaveBeenCalled();
    expect(page.combatParticipants().map((participant) => participant.displayName))
      .toEqual(['Hero', 'Opponent']);
  });

  it('loads final live combat result detail and refreshes exploration state after DB completion', () => {
    liveCombat.submitPlayerAction.and.returnValue(of(combatLiveState({
      statusKey: 'completed',
      statusLabel: 'Completed',
      awaitingPlayerAction: false,
      finalCombatResultId: 'combat-result-1',
      eventCount: 2,
      events: [combatEvent(1, {
        label: 'Attack Resolved',
        rawJson: {
          displayText: 'Hero strikes Opponent.',
          finalDamage: 18,
          targetHealthBefore: 30,
          targetHealthAfter: 12,
          timingHit: true,
        },
      }), combatEvent(2, {
        eventKind: 'session_completed',
        label: 'Attack Resolved',
        rawJson: {
          displayText: 'Hero strikes Opponent.',
          finalDamage: 18,
          targetHealthBefore: 30,
          targetHealthAfter: 12,
          timingHit: true,
        },
      })],
    })));
    explorations.getHeroExplorationState.and.returnValues(
      of(noExplorationState('easy')),
      of(noExplorationState('easy')),
      of(activeExplorationState('easy')),
    );
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(
      activeExplorationState('easy', false, true, undefined, 'exploration-1', ENCOUNTER_KIND.combat),
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

  it('renders exact completed Combat Encounter reward without using step reward', async () => {
    liveCombat.submitPlayerAction.and.returnValue(of(combatLiveState({
      statusKey: 'completed',
      statusLabel: 'Completed',
      awaitingPlayerAction: false,
      finalCombatResultId: 'combat-result-1',
      eventCount: 2,
      events: [combatEvent(1, {
        label: 'Attack Resolved',
        rawJson: {
          displayText: 'Hero strikes Opponent.',
          finalDamage: 18,
          targetHealthBefore: 30,
          targetHealthAfter: 12,
          timingHit: true,
        },
      }), combatEvent(2, { eventKind: 'session_completed' })],
    })));
    rewards.getChallengeReward.and.callFake((input: {
      challengeAttemptId: string;
    }) => of(input.challengeAttemptId === 'challenge-1'
      ? challengeReward({
          entries: [
            rewardEntry({ id: 'entry-xp', entryKind: 'experience', amount: 70 }),
            rewardEntry({ id: 'entry-cp', entryKind: 'character_points', amount: 5 }),
            rewardEntry({
              id: 'entry-item',
              entryKind: 'item_generation',
              amount: 1,
              itemId: 'item-1',
            }),
          ],
          items: [
            {
              ...challengeReward().items[0],
              id: 'item-1',
              name: 'Combat reward blade',
            },
          ],
        })
      : null));
    explorations.getHeroExplorationState.and.returnValues(
      of(noExplorationState('easy')),
      of(activeExplorationState('easy')),
    );
    explorations.resolveHeroExplorationStep.and.returnValue(
      of(stepResolutionWorkflow('easy', {
        outcomeKind: 'encounter',
        encounterDefinitionId: 'encounter-combat',
        challengeAttemptId: 'challenge-1',
        selectedDefinition: selectedEncounter(
          'encounter-combat',
          'light_combat',
          ENCOUNTER_KIND.combat,
        ),
      }, {
        activeChallenge: activeExplorationState(
          'easy',
          false,
          true,
          undefined,
          'exploration-1',
          ENCOUNTER_KIND.combat,
        ).activeChallenge,
      })),
    );
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.componentInstance.page.overview.setStateFromWorkflow(
      activeExplorationState('easy', true, false, pastStepTiming()),
    );
    fixture.componentInstance.page.checkStepResult();
    fixture.detectChanges();
    TestBed.flushEffects();

    expect(liveCombat.ensureSession).toHaveBeenCalledWith(jasmine.objectContaining({
      challengeAttemptId: 'challenge-1',
    }));

    fixture.componentInstance.page.startCombatChallenge();
    fixture.componentInstance.page.submitCombatChallengeStrike();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    const exactRewardCall = rewards.getChallengeReward.calls.allArgs().some(([input]) =>
      input.challengeAttemptId === 'challenge-1',
    );
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(exactRewardCall).toBeTrue();
    expect(rewards.getStepReward).not.toHaveBeenCalled();
    expect(text).toContain('70 EXP');
    expect(text).toContain('5 Punktów Postaci');
    expect(text).toContain('Przedmiot: Combat reward blade (item-1)');
    expect(text).toContain('Hero strikes Opponent.');
    expect(text).toContain('Damage 18');
    expect(text).toContain('HP 30 -> 12');
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
    rewards.getChallengeReward.and.returnValue(of(null));

    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(
      activeExplorationState('easy', false, true, undefined, 'exploration-1', ENCOUNTER_KIND.combat),
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
  it('auto-resolves active challenges with DB-returned chance context', () => {
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(activeExplorationState('easy', false, true));

    expect(page.autoResolveExplanation()).toBe(
      'Automatyczne rozstrzygnięcie używa szansy sukcesu zwróconej przez DB dla tego wyzwania: 35%.',
    );
    expect(page.challengeFacts().map((fact) => fact.label).filter((label) =>
      label.startsWith('Auto ') || label === 'Auto-resolve Luck',
    )).toEqual([]);
    expect(page.challengeFacts().map((fact) => fact.label)).not.toContain(
      'Luck',
    );

    page.autoResolveChallenge();

    expect(explorations.autoResolveHeroExplorationChallengeAttempt).toHaveBeenCalledOnceWith({
      heroId: 'hero-1',
      difficultyKey: 'easy',
      challengeAttemptId: 'challenge-1',
    });
    expect(page.currentChallengeResult()?.completionMode).toBe('auto');
    expect(feedback.successMessage()).toBe('Wyzwanie zostało automatycznie rozstrzygnięte.');
  });

  it('describes DB-applied Buff and Debuff Encounter effects from refreshed state', () => {
    const cases: Array<[typeof ENCOUNTER_KIND.buff | typeof ENCOUNTER_KIND.debuff, string]> = [
      [ENCOUNTER_KIND.buff, 'Buff Encounter'],
      [ENCOUNTER_KIND.debuff, 'Debuff Encounter'],
    ];

    page.loadData();
    page.startSelectedDifficulty();

    for (const [encounterKind, title] of cases) {
      page.overview.setStateFromWorkflow(activeExplorationState('easy', true, false, pastStepTiming()));
      explorations.resolveHeroExplorationStep.and.returnValue(
        of(stepResolutionWorkflow('easy', {
          outcomeKind: 'encounter',
          encounterDefinitionId: `${encounterKind}-encounter`,
          selectedDefinition: selectedEncounter(
            `${encounterKind}-encounter`,
            `${encounterKind}_encounter`,
            encounterKind,
          ),
        }, {
          activeEffect: activeEffect(encounterKind),
        })),
      );

      page.checkStepResult();

      expect(page.stepResultTitle()).toBe(`${title} resolved`);
      expect(page.stepResultDescription()).toContain('applied an exploration effect');
      expect(page.activeEffectDisplay()).toEqual(jasmine.objectContaining({
        title: `${encounterKind === ENCOUNTER_KIND.buff ? 'Buff' : 'Debuff'} effect active`,
        summary: 'Szczegóły efektu są niedostępne w kanonicznym read modelu DB.',
        warning: 'Brak szczegółów efektu w kanonicznym read modelu DB.',
      }));
    }
  });

  it('renders DB-owned active effect label and summary when the refreshed state provides them', () => {
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(activeExplorationState('easy', true, false, pastStepTiming()));
    explorations.resolveHeroExplorationStep.and.returnValue(
      of(stepResolutionWorkflow('easy', {
        outcomeKind: 'encounter',
        encounterDefinitionId: 'buff-encounter',
        selectedDefinition: selectedEncounter(
          'buff-encounter',
          'blessing',
          ENCOUNTER_KIND.buff,
        ),
      }, {
        activeEffect: activeEffect(ENCOUNTER_KIND.buff, {
          metadataJson: {
            effectLabel: 'Blessing of Focus',
            summary: 'Focus is increased for the next Trial.',
          },
        }),
      })),
    );

    page.checkStepResult();

    expect(page.activeEffectDisplay()).toEqual(jasmine.objectContaining({
      title: 'Blessing of Focus',
      summary: 'Focus is increased for the next Trial.',
      warning: null,
    }));
  });

  it('labels auto-resolve as manual combat for active combat challenges', () => {
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(
      activeExplorationState('easy', false, true, undefined, 'exploration-1', ENCOUNTER_KIND.combat),
    );

    const autoResolveFact = page.challengeFacts()
      .find((fact) => fact.label === 'Auto-resolve');

    expect(autoResolveFact?.value).toBe('Manual combat');
    expect(page.autoResolveExplanation()).toBe(
      'Wyzwanie bojowe wymaga ręcznej walki.',
    );
    expect(page.challengeFacts().map((fact) => fact.label).filter((label) =>
      label.startsWith('Auto ') || label === 'Auto-resolve Luck',
    )).toEqual([]);

    page.autoResolveChallenge();

    expect(explorations.autoResolveHeroExplorationChallengeAttempt).not.toHaveBeenCalled();
    expect(feedback.error()).toBe(
      'Wyzwanie bojowe wymaga ręcznej walki i nie może zostać automatycznie rozstrzygnięte z tej akcji.',
    );
  });

  it('does not load challenge rewards without an explicit current-event source', async () => {
    rewards.getChallengeReward.and.returnValue(of(challengeReward()));

    page.loadData();
    page.startSelectedDifficulty();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(rewards.getChallengeReward).not.toHaveBeenCalled();
    expect(page.reward()).toBeNull();
    expect(page.rewardDisplay()).toBeNull();
  });

  it('renders persisted XP, Character Points and generated item reward rows on the route', async () => {
    rewards.getChallengeReward.and.returnValue(
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
            amount: 1,
            itemId: 'item-1',
          }),
        ],
      })),
    );
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState('easy')));
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.componentInstance.page.rewardState.preferCompletedChallengeReward(
      'exploration-1',
      'challenge-1',
    );
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('70 EXP');
    expect(text).toContain('70 Punktów Postaci');
    expect(text).toContain('Przedmiot: Reward blade (item-1)');
    expect(text).toContain('Jakość fine');
    expect(text).not.toContain('reward_grant_entries` jest puste');
  });

  it('renders the exact workflow challenge reward instead of a later manifestation-failed no-reward attempt', async () => {
    rewards.getChallengeReward.and.callFake((input: {
      challengeAttemptId: string;
    }) => of(input.challengeAttemptId === 'challenge-1'
      ? challengeReward({
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
              amount: 1,
              itemId: 'item-1',
            }),
          ],
        })
      : challengeReward({
          challengeAttemptId: 'challenge-manifestation-failed',
          success: false,
          rewardGrantId: null,
          rewardGrant: null,
          entries: [],
          items: [],
          rewardStatusKey: 'not_granted',
          rewardStatusLabel: 'Manifestation failed',
          noRewardReasonKey: 'manifestation_failed',
          noRewardReasonLabel: 'Manifestation failed',
        })));
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState('easy')));
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.componentInstance.page.overview.setStateFromWorkflow(
      activeExplorationState('easy', false, true),
    );
    fixture.componentInstance.page.completeChallenge(true);
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    const exactRewardCall = rewards.getChallengeReward.calls.allArgs().some(([input]) =>
      input.challengeAttemptId === 'challenge-1',
    );

    expect(exactRewardCall).toBeTrue();
    expect(text).toContain('70 EXP');
    expect(text).toContain('70 Punktów Postaci');
    expect(text).toContain('Przedmiot: Reward blade (item-1)');
    expect(text).not.toContain('Manifestation failed');
  });

  it('hides the previous challenge reward after starting a new movement step', async () => {
    rewards.getChallengeReward.and.returnValue(
      of(challengeReward({
        entries: [rewardEntry({ id: 'entry-xp', entryKind: 'experience', amount: 70 })],
      })),
    );
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState('easy')));
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.componentInstance.page.overview.setStateFromWorkflow(
      activeExplorationState('easy', false, true),
    );
    fixture.componentInstance.page.completeChallenge(true);
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent ?? '').toContain('70 EXP');

    fixture.componentInstance.page.chooseMovementOption(
      fixture.componentInstance.page.movementOptions()[0],
    );
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('movement - pending');
    expect(text).not.toContain('70 EXP');
    expect(fixture.componentInstance.page.reward()).toBeNull();
  });

  it('clears the previous completed combat result after starting a new movement step', async () => {
    liveCombat.ensureSession.and.returnValue(of(combatLiveState({
      statusKey: 'completed',
      statusLabel: 'Completed',
      awaitingPlayerAction: false,
      finalCombatResultId: 'combat-result-1',
      eventCount: 2,
      events: [combatEvent(1), combatEvent(2, { eventKind: 'session_completed' })],
    })));
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState('easy')));

    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(
      activeExplorationState('easy', false, true, undefined, 'exploration-1', ENCOUNTER_KIND.combat),
    );
    TestBed.flushEffects();

    expect(page.completedCombatLiveState()).not.toBeNull();

    page.overview.setStateFromWorkflow(activeExplorationState('easy'));
    page.chooseMovementOption(page.movementOptions()[0]);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(page.completedCombatLiveState()).toBeNull();
  });

  it('does not show the previous challenge reward for a Nothing found step result', async () => {
    rewards.getChallengeReward.and.returnValue(
      of(challengeReward({
        entries: [rewardEntry({ id: 'entry-xp', entryKind: 'experience', amount: 70 })],
      })),
    );
    rewards.getStepReward.and.returnValue(of(null));
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState('easy')));
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.componentInstance.page.overview.setStateFromWorkflow(
      activeExplorationState('easy', false, true),
    );
    fixture.componentInstance.page.completeChallenge(true);
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent ?? '').toContain('70 EXP');

    fixture.componentInstance.page.overview.setStateFromWorkflow(
      activeExplorationState('easy', true, false, pastStepTiming()),
    );
    fixture.componentInstance.page.checkStepResult();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Nothing found');
    expect(rewards.getStepReward).not.toHaveBeenCalled();
    expect(text).not.toContain('70 EXP');
    expect(fixture.componentInstance.page.reward()).toBeNull();
  });

  it('clears the previous completed combat result for a Nothing found step result', () => {
    liveCombat.ensureSession.and.returnValue(of(combatLiveState({
      statusKey: 'completed',
      statusLabel: 'Completed',
      awaitingPlayerAction: false,
      finalCombatResultId: 'combat-result-1',
      eventCount: 2,
      events: [combatEvent(1), combatEvent(2, { eventKind: 'session_completed' })],
    })));
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState('easy')));

    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(
      activeExplorationState('easy', false, true, undefined, 'exploration-1', ENCOUNTER_KIND.combat),
    );
    TestBed.flushEffects();

    expect(page.completedCombatLiveState()).not.toBeNull();

    page.overview.setStateFromWorkflow(
      activeExplorationState('easy', true, false, pastStepTiming()),
    );
    page.checkStepResult();
    TestBed.flushEffects();

    expect(page.stepResultTitle()).toBe('Nothing found');
    expect(page.completedCombatLiveState()).toBeNull();
  });

  it('shows sandbox step reward RPC diagnostics when a Resource Encounter reward read returns empty', async () => {
    rewards.getStepReward.and.returnValue(of(null));
    selectedServer.set({ kind: 'sandbox', canUseAsSandbox: true });
    serverAccess.set({ canAccessSandbox: true });
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState(
      'easy',
      true,
      false,
      pastStepTiming(),
    )));
    explorations.resolveHeroExplorationStep.and.returnValue(
      of(stepResolutionWorkflow('easy', {
        outcomeKind: 'encounter',
        encounterDefinitionId: 'encounter-resource',
        challengeAttemptId: null,
        selectedDefinition: selectedEncounter(
          'encounter-resource',
          'minor_resource_find',
          ENCOUNTER_KIND.resource,
        ),
      })),
    );
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.componentInstance.page.checkStepResult();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(rewards.getStepReward).toHaveBeenCalledWith({ stepId: 'step-1' });
    expect(text).toContain('Resource Encounter resolved');
    expect(text).toContain('Szczegóły nagrody są niedostępne w kanonicznym read modelu DB.');
    expect(text).toContain('Reward RPC backend shape');
    expect(text).toContain('get_exploration_step_reward_read_model');
    expect(text).toContain('{"p_step_id":"step-1"}');
    expect(text).toContain('null/empty response');
    expect(text).toContain('Backend row shape');
  });

  it('does not render a stale challenge reward for a direct Encounter step result', async () => {
    rewards.getChallengeReward.and.returnValue(of(challengeReward()));
    rewards.getStepReward.and.returnValue(of(challengeReward({
      challengeAttemptId: '',
      challengeKind: 'encounter',
      status: 'resolved',
      stepId: 'step-1',
      outcomeKind: 'encounter',
      rewardSourceKind: 'exploration_step',
      rewardSourceId: 'step-1',
      rewardSourceLabel: 'Resource Encounter reward',
      entries: [
        rewardEntry({
          id: 'entry-materials',
          entryKind: 'resource',
          amount: 12,
          resourceType: 'materials',
        }),
        rewardEntry({
          id: 'entry-workforce',
          entryKind: 'resource',
          amount: 3,
          resourceType: 'workforce',
        }),
        rewardEntry({
          id: 'entry-drachma',
          entryKind: 'resource',
          amount: 20,
          resourceType: 'drachma',
        }),
        rewardEntry({ id: 'entry-xp', entryKind: 'experience', amount: 70 }),
        rewardEntry({ id: 'entry-cp', entryKind: 'character_points', amount: 5 }),
        rewardEntry({
          id: 'entry-item',
          entryKind: 'generated_item',
          amount: 1,
          itemId: 'item-1',
        }),
      ],
    })));
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState(
      'easy',
      true,
      false,
      pastStepTiming(),
    )));
    explorations.resolveHeroExplorationStep.and.returnValue(
      of(stepResolutionWorkflow('easy', {
        outcomeKind: 'encounter',
        encounterDefinitionId: 'encounter-resource',
        challengeAttemptId: null,
        selectedDefinition: null,
        metadataJson: {
          encounterKind: ENCOUNTER_KIND.resource,
        },
      })),
    );
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent ?? '')
      .not.toContain('Przedmiot: Reward blade (item-1)');

    fixture.componentInstance.page.checkStepResult();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Resource Encounter resolved');
    expect(rewards.getStepReward).toHaveBeenCalledWith({ stepId: 'step-1' });
    expect(text).toContain('Nagroda za Resource Encounter');
    expect(text).toContain('Status nagrody: Nagroda przyznana');
    expect(text).toContain('Materials +12');
    expect(text).toContain('Workforce +3');
    expect(text).toContain('Drachma +20');
    expect(text).toContain('70 EXP');
    expect(text).toContain('5 Punktów Postaci');
    expect(text).toContain('Przedmiot: Reward blade (item-1)');
    expect(text).not.toContain('Nagroda za challenge');
    expect(text).not.toContain('Resource Encounter reward');
    expect(text).not.toContain('Wynik: N/D');
    expect(text).not.toContain('Tryb: N/D');
    expect(text).not.toContain('Tryb: manual');
    expect(text).not.toContain('reward_grant_id');
  });

  it('renders item_generation rewards from generated item read-model rows before non-item entries', async () => {
    rewards.getStepReward.and.returnValue(of(challengeReward({
      challengeAttemptId: '',
      challengeKind: 'encounter',
      status: 'resolved',
      stepId: 'step-1',
      outcomeKind: 'encounter',
      rewardSourceKind: 'exploration_step',
      rewardSourceId: 'step-1',
      rewardSourceLabel: 'Resource Encounter reward',
      rewardEntryCount: 3,
      generatedItemCount: 1,
      entries: [
        rewardEntry({ id: 'entry-xp', entryKind: 'experience', amount: 70 }),
        rewardEntry({ id: 'entry-cp', entryKind: 'character_points', amount: 70 }),
        rewardEntry({
          id: 'entry-item',
          entryKind: 'item_generation',
          amount: 1,
          itemId: 'item-1',
        }),
      ],
      items: [
        {
          ...challengeReward().items[0],
          id: 'item-1',
          name: 'Live reward blade',
          generationQualityKey: 'fine',
          generationBaseId: 'iron_blade',
          prefixAffixId: 'sharp',
          suffixAffixId: 'focus',
          drachmaValue: 135,
          metadataJson: {
            qualityLabel: 'Fine',
            baseName: 'Iron blade',
            prefixName: 'Sharp',
            suffixName: 'of Focus',
            rewardEntryIds: ['entry-item'],
          },
        },
      ],
    })));
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState(
      'easy',
      true,
      false,
      pastStepTiming(),
    )));
    explorations.resolveHeroExplorationStep.and.returnValue(
      of(stepResolutionWorkflow('easy', {
        outcomeKind: 'encounter',
        encounterDefinitionId: 'encounter-resource',
        challengeAttemptId: null,
        selectedDefinition: selectedEncounter(
          'encounter-resource',
          'minor_resource_find',
          ENCOUNTER_KIND.resource,
        ),
      })),
    );
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.componentInstance.page.checkStepResult();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    const itemIndex = text.indexOf('Przedmiot: Live reward blade (item-1)');
    const xpIndex = text.indexOf('70 EXP');

    expect(itemIndex).toBeGreaterThanOrEqual(0);
    expect(xpIndex).toBeGreaterThanOrEqual(0);
    expect(itemIndex).toBeLessThan(xpIndex);
    expect(text).toContain('Przyznano 2 wpisy nagrody i 1 przedmiot.');
    expect(text).toContain('Jakość Fine');
    expect(text).toContain('Baza Iron blade');
    expect(text).toContain('Prefix Sharp');
    expect(text).toContain('Suffix of Focus');
    expect(text).toContain('70 Punktów Postaci');
    expect(text).not.toContain('Nagroda została przyznana, ale szczegóły nagrody nie są dostępne.');
    expect(text).not.toContain('Ten wynik eksploracji nie przyznał nagrody.');
    expect(text).not.toContain('Resource Encounter reward');
  });

  it('ignores a stale challenge reward response after switching to a step reward source', async () => {
    const staleChallengeReward = new Subject<ExplorationChallengeRewardReadModel | null>();
    const stepReward = new Subject<ExplorationChallengeRewardReadModel | null>();

    rewards.getChallengeReward.and.returnValue(staleChallengeReward.asObservable());
    rewards.getStepReward.and.returnValue(stepReward.asObservable());
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState(
      'easy',
      true,
      false,
      pastStepTiming(),
    )));
    explorations.resolveHeroExplorationStep.and.returnValue(
      of(stepResolutionWorkflow('easy', {
        outcomeKind: 'encounter',
        encounterDefinitionId: 'encounter-resource',
        challengeAttemptId: null,
        selectedDefinition: selectedEncounter(
          'encounter-resource',
          'minor_resource_find',
          ENCOUNTER_KIND.resource,
        ),
      })),
    );
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));

    fixture.componentInstance.page.checkStepResult();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));

    staleChallengeReward.next(challengeReward({
      rewardSourceLabel: 'Stale Trial reward',
    }));
    staleChallengeReward.complete();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent ?? '')
      .not.toContain('Stale Trial reward');

    stepReward.next(challengeReward({
      challengeAttemptId: '',
      challengeKind: 'encounter',
      status: 'resolved',
      stepId: 'step-1',
      outcomeKind: 'encounter',
      rewardSourceKind: 'exploration_step',
      rewardSourceId: 'step-1',
      rewardSourceLabel: 'Current step reward',
      entries: [rewardEntry({ id: 'entry-xp', entryKind: 'experience', amount: 45 })],
    }));
    stepReward.complete();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Nagroda za wynik eksploracji');
    expect(text).toContain('45 EXP');
    expect(text).not.toContain('Stale Trial reward');
    expect(text).not.toContain('Current step reward');
  });

  it('shows DB no-reward reason for direct step reward read models', async () => {
    rewards.getStepReward.and.returnValue(of(challengeReward({
      challengeAttemptId: '',
      challengeKind: 'encounter',
      status: 'resolved',
      stepId: 'step-1',
      outcomeKind: 'encounter',
      rewardSourceKind: 'exploration_step',
      rewardSourceId: 'step-1',
      rewardSourceLabel: 'Resource Encounter reward',
      rewardGrantId: null,
      rewardGrant: null,
      entries: [],
      items: [],
      rewardStatusKey: 'not_granted',
      rewardStatusLabel: 'Nagroda nieprzyznana',
      noRewardReasonKey: 'no_reward_profile',
      noRewardReasonLabel: 'Brak profilu nagrody dla encountera',
      noRewardReasonHelperText: 'DB nie znalazła aktywnego profilu dla wyniku kroku.',
    })));
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState(
      'easy',
      true,
      false,
      pastStepTiming(),
    )));
    explorations.resolveHeroExplorationStep.and.returnValue(
      of(stepResolutionWorkflow('easy', {
        outcomeKind: 'encounter',
        encounterDefinitionId: 'encounter-resource',
        challengeAttemptId: null,
        selectedDefinition: selectedEncounter(
          'encounter-resource',
          'minor_resource_find',
          ENCOUNTER_KIND.resource,
        ),
      })),
    );
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.componentInstance.page.checkStepResult();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Ten wynik eksploracji nie przyznał nagrody.');
    expect(text).toContain('Brak skonfigurowanej nagrody dla tego wyniku.');
    expect(text).not.toContain('Brak profilu nagrody dla encountera');
    expect(text).not.toContain('DB nie znalazła aktywnego profilu dla wyniku kroku.');
    expect(text).not.toContain('No reward grant was attached to this step');
    expect(text).not.toContain('reward_grant_id');
    expect(text).not.toContain('Reward assignment lookup');
    expect(text).not.toContain('Item generation');
    expect(text).not.toContain('Tryb: manual');
  });

  it('shows XP and Character Points while hiding generated-item entries without items', async () => {
    rewards.getChallengeReward.and.returnValue(
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
    page.rewardState.preferCompletedChallengeReward('exploration-1', 'challenge-1');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(page.rewardDisplay()?.summary).toContain('Przyznano 2 wpisy nagrody');
    expect(page.rewardDisplay()?.entries.map((entry) => entry.id))
      .toEqual(['entry-xp', 'entry-cp']);
    expect(page.rewardDisplay()?.entries.map((entry) => page.rewardEntryLabel(entry)))
      .toEqual(['70 EXP', '70 Punktów Postaci']);
    expect(page.rewardDisplay()?.entries.map((entry) => page.rewardEntryDetails(entry)))
      .toEqual([null, null]);
    expect(page.rewardDisplay()?.hiddenMessages[0]).toContain('Wpis losowania przedmiotu');
  });

  it('shows player-safe generated-item no-drop copy without raw DB reason', async () => {
    rewards.getChallengeReward.and.returnValue(
      of(challengeReward({
        entries: [
          rewardEntry({
            id: 'entry-item',
            entryKind: 'generated_item',
            amount: 0,
            itemId: null,
            metadataJson: { itemGenerationReason: 'Item count roll returned zero.' },
          }),
        ],
        items: [],
      })),
    );

    page.loadData();
    page.startSelectedDifficulty();
    page.rewardState.preferCompletedChallengeReward('exploration-1', 'challenge-1');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(page.rewardDisplay()?.entries).toEqual([]);
    expect(page.rewardDisplay()?.hiddenMessages).toEqual([
      'Wpis losowania przedmiotu nie utworzył itemu.',
    ]);
  });

  it('does not render DB reward grant reason in the standard reward card', async () => {
    rewards.getChallengeReward.and.returnValue(
      of(challengeReward({
        rewardGrant: {
          ...challengeReward().rewardGrant!,
          status: 'failed',
          reason: 'Reward profile entry failed.',
        },
      })),
    );
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState('easy')));
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.componentInstance.page.rewardState.preferCompletedChallengeReward(
      'exploration-1',
      'challenge-1',
    );
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('Reward profile entry failed.');
    expect(text).not.toContain('Status grantu');
  });

  it('does not describe a granted reward with empty mapped entries as no reward', async () => {
    rewards.getChallengeReward.and.returnValue(
      of(challengeReward({
        entries: [],
        items: [],
        rewardEntryCount: 2,
        generatedItemCount: 1,
        rewardStatusKey: 'granted',
        rewardStatusLabel: 'Nagroda przyznana',
      })),
    );
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState('easy')));
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.componentInstance.page.rewardState.preferCompletedChallengeReward(
      'exploration-1',
      'challenge-1',
    );
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Nagroda przyznana');
    expect(text).toContain('Nagroda została przyznana, ale szczegóły nagrody nie są dostępne.');
    expect(text).not.toContain('Ten challenge nie przyznał nagrody');
    expect(text).not.toContain('Ostatni ukończony challenge nie przyznał nagrody');
  });

  it('builds sandbox reward execution diagnostics from DB reward payload', async () => {
    rewards.getChallengeReward.and.returnValue(
      of(challengeReward({
        entries: [
          rewardEntry({ id: 'entry-xp', entryKind: 'experience', amount: 70 }),
          rewardEntry({
            id: 'entry-item',
            entryKind: 'generated_item',
            amount: 0,
            itemId: null,
            metadataJson: {
              itemGenerationReason: 'Item count roll returned zero.',
              skippedReason: 'Generated item count was zero.',
            },
          }),
        ],
        items: [],
      })),
    );
    selectedServer.set({ kind: 'sandbox', canUseAsSandbox: true });
    serverAccess.set({ canAccessSandbox: true });

    page.loadData();
    page.startSelectedDifficulty();
    page.rewardState.preferCompletedChallengeReward('exploration-1', 'challenge-1');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(page.canShowSelectionDiagnostics()).toBeTrue();
    expect(page.rewardDiagnostics().map((row) => row.label)).toContain(
      'Reward assignment lookup',
    );
    expect(page.rewardDiagnostics().map((row) => row.value).join(' | '))
      .toContain('Item count roll returned zero.');
    expect(page.rewardDiagnostics().map((row) => row.value).join(' | '))
      .toContain('Generated item count was zero.');
  });

  it('does not render full reward execution diagnostics for standard servers', async () => {
    rewards.getChallengeReward.and.returnValue(of(challengeReward()));
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState('easy')));
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.componentInstance.page.rewardState.preferCompletedChallengeReward(
      'exploration-1',
      'challenge-1',
    );
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(fixture.componentInstance.page.canShowSelectionDiagnostics()).toBeFalse();
    expect(text).not.toContain('Diagnostyka wykonania rewardu');
    expect(text).not.toContain('Reward assignment lookup');
    expect(text).not.toContain('Item generation');
    expect(text).not.toContain('reward_grant_id');
  });

  it('renders reward execution diagnostics collapsed for sandbox access', async () => {
    rewards.getChallengeReward.and.returnValue(of(challengeReward()));
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState('easy')));
    selectedServer.set({ kind: 'sandbox', canUseAsSandbox: true });
    serverAccess.set({ canAccessSandbox: true });
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.componentInstance.page.rewardState.preferCompletedChallengeReward(
      'exploration-1',
      'challenge-1',
    );
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    const details = (fixture.nativeElement as HTMLElement).querySelector('details');
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(fixture.componentInstance.page.canShowSelectionDiagnostics()).toBeTrue();
    expect(details?.hasAttribute('open')).toBeFalse();
    expect(text).toContain('Diagnostyka wykonania rewardu');
    expect(text).toContain('Reward assignment lookup');
  });

  it('shows clear no-reward state for failed persisted challenges', async () => {
    rewards.getChallengeReward.and.returnValue(
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
    page.rewardState.preferCompletedChallengeReward('exploration-1', 'challenge-1');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(page.rewardDisplay()?.summary).toBe('Ostatni ukończony challenge nie przyznał nagrody.');
  });

  it('shows player-safe no-reward copy from the canonical reward read model', async () => {
    rewards.getChallengeReward.and.returnValue(
      of(challengeReward({
        rewardGrantId: null,
        rewardGrant: null,
        entries: [],
        items: [],
        rewardStatusKey: 'not_granted',
        rewardStatusLabel: 'Nagroda nieprzyznana',
        noRewardReasonKey: 'no_reward_profile',
        noRewardReasonLabel: 'Brak pasującego profilu nagrody',
        noRewardReasonHelperText: 'DB nie znalazła aktywnego reward profile dla tego wyniku.',
      })),
    );
    explorations.getHeroExplorationState.and.returnValue(of(activeExplorationState('easy')));
    const fixture = TestBed.createComponent(ExplorationPage);

    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.componentInstance.page.rewardState.preferCompletedChallengeReward(
      'exploration-1',
      'challenge-1',
    );
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Ostatni ukończony challenge nie przyznał nagrody.');
    expect(text).toContain('Brak skonfigurowanej nagrody dla tego wyniku.');
    expect(text).not.toContain('Brak pasującego profilu nagrody');
    expect(text).not.toContain('DB nie znalazła aktywnego reward profile dla tego wyniku.');
    expect(text).not.toContain('reward_grant_entries` jest puste');
  });

  it('clears stale reward while leaving an explicit challenge reward source', async () => {
    const firstReward = new Subject<ExplorationChallengeRewardReadModel | null>();
    rewards.getChallengeReward.and.returnValue(firstReward.asObservable());

    page.loadData();
    page.startSelectedDifficulty();
    page.rewardState.preferCompletedChallengeReward('exploration-1', 'challenge-1');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(page.reward()).toBeNull();
    expect(page.isLoadingReward()).toBeTrue();

    page.overview.setStateFromWorkflow(activeExplorationState('easy', true, false, pastStepTiming()));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(page.reward()).toBeNull();
    expect(page.isLoadingReward()).toBeFalse();

    firstReward.next(challengeReward({ rewardGrantId: 'stale-reward' }));
    firstReward.complete();
    expect(page.reward()).toBeNull();
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

  it('hides stale challenge completion results while the next movement step is active', () => {
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(activeExplorationState('easy', false, true));
    page.completeChallenge(true);

    expect(page.currentChallengeResult()).not.toBeNull();

    page.overview.setStateFromWorkflow(activeExplorationState('easy', true, false, pastStepTiming()));

    expect(page.currentChallengeResult()).toBeNull();
  });

  it('hides stale challenge completion results after a later non-challenge step resolves', () => {
    page.loadData();
    page.startSelectedDifficulty();
    page.overview.setStateFromWorkflow(activeExplorationState('easy', false, true));
    page.completeChallenge(true);

    expect(page.currentChallengeResult()).not.toBeNull();

    page.overview.setStateFromWorkflow(activeExplorationState('easy', true, false, pastStepTiming()));
    explorations.resolveHeroExplorationStep.and.returnValue(
      of(stepResolutionWorkflow('easy', {
        challengeAttemptId: null,
        outcomeKind: 'nothing',
        rawOutcomeKind: 'nothing',
      })),
    );
    page.checkStepResult();

    expect(page.currentStepResult()?.outcomeKind).toBe('nothing');
    expect(page.currentChallengeResult()).toBeNull();
  });

  it('ignores stale state responses after difficulty changes', () => {
    const firstState = new Subject<HeroExplorationStateReadModel>();
    const secondState = new Subject<HeroExplorationStateReadModel>();
    explorations.getHeroExplorationDifficultyCardPreviews.and.returnValue(
      of([difficultyCardPreview('easy'), difficultyCardPreview('hard')]),
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

function difficultyCardPreview(key: string): HeroExplorationDifficultyCardPreview {
  return {
    difficultyKey: key,
    difficultyLabel: key.toUpperCase(),
    difficultyDescription: `${key} difficulty.`,
    difficultyHelperText: null,
    isActive: true,
    isAvailable: true,
    stepDurationDisplay: '01:00',
    stepDurationSeconds: 60,
    trialOpportunityDisplay: '18%',
    trialOpportunityChance: 18,
    trialOpportunityIsGuaranteedByStepCap: false,
    manifestationDisplay: '64%',
    manifestationChance: 64,
    autoResultDisplay: '57%',
    autoResultSuccessChance: 57,
    rewardItemCountDisplay: '2-3 items',
    statDetails: [],
  };
}

function findButton(element: Element, label: string): HTMLButtonElement | null {
  return Array.from(element.querySelectorAll('button')).find((button) =>
    button.textContent?.includes(label),
  ) ?? null;
}

function noExplorationState(difficultyKey: string): HeroExplorationStateReadModel {
  return {
    hasExploration: false,
    heroId: 'hero-1',
    difficultyKey,
    remainingTrials: 2,
    exploration: null,
    edges: [],
    movementOptions: [],
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
  challengePatch: Partial<NonNullable<HeroExplorationStateReadModel['activeChallenge']>> = {},
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
    movementOptions: [
      {
        optionKind: 'edge',
        actionKey: 'move',
        stepKind: 'edge',
        edgeId: 'edge-1',
        directionKey: 'north',
        label: 'North road',
        sortOrder: 10,
        toNodeId: 'node-2',
        isKnownPath: true,
        isBacktrack: false,
        isAvailable: true,
        startRpc: {
          rpc: 'start_hero_exploration_step',
        },
        metadataJson: {},
      },
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
          serverId: 'server-1',
          heroId: 'hero-1',
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
          manifestation: {
            status: 'manifested',
            chance: 40,
            roll: 12,
            trialDefinitionId: 'trial-1',
            testedStatKey: 'dexterity',
            luckValue: null,
            luckInfluence: null,
            trialPower: null,
            configIssueKey: null,
            configIssueMessage: null,
            explanation: null,
            metadataJson: {},
            formulaContextJson: {},
          },
          manualDeadlineAt: '2026-05-01T10:10:00.000Z',
          completionMode: null,
          performanceRating: null,
          score: null,
          success: null,
          rewardGrantId: null,
          autoResolveChance: 35,
          autoResolveRoll: null,
          autoResolve: {
            chance: 35,
            roll: null,
            testedStatKey: 'dexterity',
            testedStatValue: 32,
            luckValue: 15,
            luckInfluence: 5,
            trialPower: 37,
            difficultyMultiplier: 1,
            capPercent: 90,
            autoResolvePenalty: 10,
            manualChanceReference: 60,
            rawSuccessChance: 58,
            finalSuccessChance: 35,
            formulaContextJson: {
              formulaKey: 'challenge_auto_resolve_success_chance',
            },
            explanation: 'DB auto-resolve context.',
            metadataJson: {
              source: 'db',
            },
          },
          detailsJson: {},
          metadataJson: {},
          startedAt: '2026-05-01T10:05:00.000Z',
          completedAt: null,
          createdAt: '2026-05-01T10:05:00.000Z',
          updatedAt: '2026-05-01T10:05:00.000Z',
          ...challengePatch,
        } as HeroExplorationStateReadModel['activeChallenge']
      : null,
  };
}

function stepResolutionWorkflow(
  difficultyKey: string,
  patch: Partial<HeroExplorationStepResolutionWorkflowResult['result']> | string = 'nothing',
  statePatch: Partial<HeroExplorationStateReadModel> = {},
): HeroExplorationStepResolutionWorkflowResult {
  const resultPatch: Partial<HeroExplorationStepResolutionWorkflowResult['result']> =
    typeof patch === 'string'
      ? { outcomeKind: patch as ExplorationStepOutcomeKind }
      : patch;

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
      rawOutcomeKind: 'nothing',
      remainingTrials: 1,
      trialDryStepCount: 1,
      selectedDefinition: null,
      selectionDiagnostic: null,
      metadataJson: { flavorText: 'The passage is quiet.' },
      ...resultPatch,
    },
    state: {
      ...activeExplorationState(difficultyKey),
      ...statePatch,
    },
  };
}

function activeEffect(
  effectKind: typeof ENCOUNTER_KIND.buff | typeof ENCOUNTER_KIND.debuff,
  patch: Partial<NonNullable<HeroExplorationStateReadModel['activeEffect']>> = {},
): NonNullable<HeroExplorationStateReadModel['activeEffect']> {
  return {
    id: 'effect-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    explorationId: 'exploration-1',
    effectDefinitionId: 'effect-definition-1',
    effectKind,
    sourceKind: 'encounter',
    sourceId: 'encounter-1',
    isActive: true,
    appliedAt: '2026-05-01T10:10:00.000Z',
    consumedAt: null,
    consumedByKind: null,
    consumedById: null,
    metadataJson: {},
    createdAt: '2026-05-01T10:10:00.000Z',
    updatedAt: '2026-05-01T10:10:00.000Z',
    ...patch,
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

function selectedEncounter(
  definitionId: string,
  definitionKey: string,
  encounterKind: string,
): HeroExplorationStepResolutionWorkflowResult['result']['selectedDefinition'] {
  return {
    definitionKind: 'encounter',
    definitionId,
    definitionKey,
    isReady: true,
    encounterKind,
    readinessReasons: [],
  };
}

function selectionDiagnostic(): NonNullable<HeroExplorationStepResolutionWorkflowResult['result']['selectionDiagnostic']> {
  return {
    stepId: 'step-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    explorationId: 'exploration-1',
    stepKind: 'movement',
    stepStatus: 'resolved',
    resolutionAttemptId: null,
    resolutionAttemptStatus: null,
    rewardGrantId: 'reward-1',
    outcomeKind: 'encounter',
    readinessGuarded: true,
    forcedOverrideId: null,
    trialOpportunityChance: 25,
    trialOpportunityRoll: 80,
    encounterChance: 40,
    encounterRoll: 10,
    selectedDefinition: selectedEncounter('encounter-1', 'minor_resource_find', ENCOUNTER_KIND.resource),
    skippedDefinition: {
      definitionKind: 'encounter',
      definitionId: 'encounter-skipped',
      definitionKey: 'broken_resource',
      reasonKey: 'incomplete_selected_definition',
      readinessReasons: [
        {
          key: 'missing_reward_assignment',
          label: 'Missing reward assignment',
          description: 'Configure reward profile assignment.',
          severity: 'error',
          isBlocking: true,
          metadataJson: {},
        },
      ],
    },
    finalOutcomeKind: 'encounter',
    selectedAt: '2026-05-01T10:10:00.000Z',
    metadataJson: { source: 'spec' },
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
      luckRng: {
        'attackerLuck' : 15,
        attackerLuckInfluence: 5,
        'defenderLuck' : 9,
        defenderLuckInfluence: 3,
        hitGreenZone: 30,
        hitChance: 30,
        evasionChance: 8,
        criticalChance: 12,
        criticalMultiplier: 1.5,
        criticalDamage: 24,
        finalDamage: 18,
        formulaContextJson: {
          formulaKey: 'combat_critical_chance',
        },
        explanation: 'DB timing context.',
        rawJson: {},
      },
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
    stepId: 'step-1',
    outcomeKind: null,
    rewardSourceKind: 'challenge_attempt',
    rewardSourceId: 'challenge-1',
    rewardSourceLabel: 'Nagroda za challenge',
    status: 'completed',
    success: true,
    completionMode: 'manual',
    completedAt: '2026-05-01T10:20:00.000Z',
    rewardGrantId: 'reward-1',
    rewardStatusKey: 'granted',
    rewardStatusLabel: 'Nagroda przyznana',
    rewardEntryCount: 2,
    generatedItemCount: 1,
    noRewardReasonKey: null,
    noRewardReasonLabel: null,
    noRewardReasonHelperText: null,
    explanation: null,
    rawJson: {},
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



