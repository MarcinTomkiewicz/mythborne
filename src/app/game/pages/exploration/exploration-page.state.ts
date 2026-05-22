import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable } from 'rxjs';
import { GameServerKind } from '../../../core/enums/active-server.enum';
import { ExplorationStepSelectionDiagnosticReadModel } from '../../../core/domain/exploration/exploration-readiness.model';
import { AddHeroRemainingActionsResult } from '../../../core/domain/exploration/exploration-debug.model';
import {
  HeroExplorationMovementOptionReadModel,
} from '../../../core/domain/exploration/exploration-runtime.model';
import { HeroExplorationDebug } from '../../../core/services/exploration/hero-exploration-debug';
import { ActiveServer } from '../../../core/services/server/active-server';
import { ToastService } from '../../../core/services/ui/toast';
import { humanizeKey } from '../../../core/utils/normalize-text';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationChallengeState } from './exploration-challenge.state';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationMovementState } from './exploration-movement.state';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationPreviewState } from './exploration-preview.state';
import { ExplorationRewardState } from './exploration-reward.state';
import { ExplorationStepState } from './exploration-step.state';
import { ExplorationStartState } from './exploration-start.state';

@Injectable()
export class ExplorationPageState {
  private readonly activeServer = inject(ActiveServer);
  private readonly debug = inject(HeroExplorationDebug);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);
  private readonly sandboxActionToken = new RequestToken();
  readonly feedback = inject(ExplorationFeedbackState);
  readonly overview = inject(ExplorationOverviewState);
  readonly movement = inject(ExplorationMovementState);
  readonly preview = inject(ExplorationPreviewState);
  readonly step = inject(ExplorationStepState);
  readonly challenge = inject(ExplorationChallengeState);
  readonly rewardState = inject(ExplorationRewardState);
  readonly start = inject(ExplorationStartState);

  readonly difficultyCardPreviews = this.preview.difficultyCardPreviews;
  readonly state = this.overview.state;
  readonly selectedDifficultyKey = this.overview.selectedDifficultyKey;
  readonly selectedDifficulty = this.overview.selectedDifficulty;
  readonly selectedDifficultyCardPreview = computed(() =>
    this.preview.difficultyCardPreview(this.selectedDifficultyKey()),
  );
  readonly isLoading = this.overview.isLoading;
  readonly isMoving = this.movement.isMoving;
  readonly isResolvingStep = this.step.isResolving;
  readonly isCompletingChallenge = this.challenge.isCompleting;
  readonly isRunningSandboxTool = signal(false);
  readonly isStarting = this.start.isStarting;
  readonly movementOptions = this.movement.movementOptions;
  readonly activeStep = this.step.activeStep;
  readonly activeChallenge = this.challenge.activeChallenge;
  readonly isCombatChallenge = this.challenge.isCombatChallenge;
  readonly canStartCombat = this.challenge.canStartCombat;
  readonly canSubmitCombatStrike = this.challenge.canSubmitCombatStrike;
  readonly combatHitWindow = this.challenge.combatHitWindow;
  readonly combatWalkingSpeed = this.challenge.combatWalkingSpeed;
  readonly isCombatRunning = this.challenge.isCombatRunning;
  readonly isEnsuringCombatSession = this.challenge.isEnsuringCombatSession;
  readonly isSubmittingCombatAction = this.challenge.isSubmittingCombatAction;
  readonly combatLiveState = this.challenge.combatLiveState;
  readonly combatResultDetail = this.challenge.combatResultDetail;
  readonly combatTimingManifest = this.challenge.combatTimingManifest;
  readonly combatParticipants = this.challenge.combatParticipants;
  readonly combatEvents = this.challenge.combatEvents;
  readonly combatTimelineRows = this.challenge.combatTimelineRows;
  readonly completedCombatLiveState = this.challenge.completedCombatLiveState;
  readonly currentCombatActor = this.challenge.currentCombatActor;
  readonly combatStatusLabel = this.challenge.combatStatusLabel;
  readonly combatRoundLabel = this.challenge.combatRoundLabel;
  readonly combatPlayerActionStatusLabel = this.challenge.combatPlayerActionStatusLabel;
  readonly walkingPosition = this.challenge.walkingPosition;
  readonly activeStepProgressPercent = this.step.activeStepProgressPercent;
  readonly activeStepRemainingLabel = this.step.activeStepRemainingLabel;
  readonly activeStepStatusLabel = this.step.activeStepStatusLabel;
  readonly canCheckResult = this.step.canCheckResult;
  readonly currentStepResult = this.step.currentStepResult;
  readonly stepResultDescription = this.step.stepResultDescription;
  readonly stepResultFlavor = this.step.stepResultFlavor;
  readonly stepResultTitle = this.step.stepResultTitle;
  readonly canCompleteChallenge = this.challenge.canCompleteChallenge;
  readonly canAutoResolveChallenge = this.challenge.canAutoResolveChallenge;
  readonly canShowManualResolveActions = this.challenge.canShowManualResolveActions;
  readonly canShowAutoResolveAction = this.challenge.canShowAutoResolveAction;
  readonly challengeActionBlocker = this.challenge.challengeActionBlocker;
  readonly challengeFacts = this.challenge.challengeFacts;
  readonly challengeStatusLabel = this.challenge.challengeStatusLabel;
  readonly challengeResultDescription = this.challenge.challengeResultDescription;
  readonly challengeResultTitle = this.challenge.challengeResultTitle;
  readonly challengeTitle = this.challenge.challengeTitle;
  readonly currentChallengeResult = this.challenge.currentChallengeResult;
  readonly autoResolveExplanation = this.challenge.autoResolveExplanation;
  readonly isLoadingReward = this.rewardState.isLoadingReward;
  readonly reward = this.rewardState.reward;
  readonly rewardDisplay = this.rewardState.rewardDisplay;
  readonly rewardDiagnostics = this.rewardState.rewardDiagnostics;
  readonly rewardBackendDiagnostics = this.rewardState.rewardBackendDiagnostics;
  readonly rewardUnavailableMessage = this.rewardState.rewardUnavailableMessage;
  readonly movementBlockReason = this.movement.movementBlockReason;
  readonly remainingTrialsLabel = this.overview.remainingTrialsLabel;
  readonly currentNodeLabel = this.overview.currentNodeLabel;
  readonly activeStepLabel = this.overview.activeStepLabel;
  readonly activeChallengeLabel = this.overview.activeChallengeLabel;
  readonly activeEffectLabel = this.overview.activeEffectLabel;
  readonly activeEffectDisplay = this.overview.activeEffectDisplay;
  readonly runtimeStatusLabel = computed(() => {
    const state = this.state();

    if (this.isLoading()) {
      return 'Ładowanie';
    }

    if (!this.selectedDifficultyKey()) {
      return 'Wybierz trudność';
    }

    if (!state) {
      return 'Status niedostępny';
    }

    if (state.activeChallenge) {
      return 'Wyzwanie aktywne';
    }

    if (state.activeStep) {
      return this.canCheckResult() ? 'Wynik gotowy' : 'Ruch w toku';
    }

    if (state.hasExploration) {
      return this.movementBlockReason() ? 'Akcja zablokowana' : 'Gotowe do ruchu';
    }

    return 'Gotowe do startu';
  });
  readonly canShowDirectionBoard = computed(() => {
    const state = this.state();

    return Boolean(
      state?.hasExploration
      && state.exploration
      && !state.activeStep
      && !state.activeChallenge
      && this.movementBlockReason() === null,
    );
  });
  readonly runtimeStatusDetail = computed(() => {
    const state = this.state();

    if (this.isLoading()) {
      return 'Ładowanie stanu eksploracji bohatera.';
    }

    if (!this.selectedDifficultyKey()) {
      return 'Wybierz trudność, żeby załadować stan eksploracji.';
    }

    if (!state) {
      return 'Stan eksploracji jest niedostępny dla wybranej trudności.';
    }

    if (state.activeChallenge) {
      return 'Aktywne wyzwanie czeka na rozstrzygnięcie.';
    }

    if (state.activeStep) {
      return this.canCheckResult()
        ? 'Możesz sprawdzić wynik aktywnego ruchu.'
        : 'Ruch jest w toku.';
    }

    if (state.hasExploration) {
      return this.movementBlockReason()
        ?? 'Wybierz dostępny kierunek, żeby kontynuować.';
    }

    return 'Eksploracja nie jest jeszcze aktywna. Rozpocznij ją z wybranej trudności.';
  });
  readonly canShowSelectionDiagnostics = computed(() => {
    const server = this.activeServer.selectedServer();
    const access = this.activeServer.access();

    return server?.kind === GameServerKind.Sandbox && access.canAccessSandbox;
  });
  readonly canShowSandboxTools = this.canShowSelectionDiagnostics;
  readonly canSkipSandboxStepTimer = computed(() =>
    this.canShowSandboxTools()
    && Boolean(this.activeStep())
    && !this.isRunningSandboxTool(),
  );
  readonly canAddSandboxTrials = computed(() =>
    this.canShowSandboxTools()
    && Boolean(this.overview.currentContext())
    && !this.isRunningSandboxTool(),
  );
  readonly canShowSandboxChallengeTools = computed(() =>
    this.canShowSandboxTools()
    && this.canShowManualResolveActions()
    && Boolean(this.activeChallenge()),
  );
  readonly stepSelectionDiagnostic = computed(() =>
    this.canShowSelectionDiagnostics()
      ? this.currentStepResult()?.selectionDiagnostic ?? null
      : null,
  );
  readonly runtimeScreenRequested = signal(false);
  readonly shouldShowRuntimeScreen = computed(() => {
    const state = this.state();

    return (
      this.runtimeScreenRequested()
      || Boolean(state?.activeStep)
      || Boolean(state?.activeChallenge)
      || Boolean(this.currentStepResult())
      || Boolean(this.currentChallengeResult())
      || Boolean(this.reward())
    );
  });

  loadData(): void {
    this.overview.loadData();
  }

  selectDifficulty(difficultyKey: string): void {
    this.runtimeScreenRequested.set(false);
    this.overview.selectDifficulty(difficultyKey);
  }

  startSelectedDifficulty(): void {
    this.start.startSelectedDifficulty(() => this.runtimeScreenRequested.set(true));
  }

  showDifficultyEntry(): void {
    this.runtimeScreenRequested.set(false);
  }

  checkStepResult(): void {
    this.step.checkResult();
  }

  completeChallenge(success: boolean): void {
    this.challenge.completeManually(success);
  }

  autoResolveChallenge(): void {
    this.challenge.autoResolve();
  }

  skipSandboxStepTimer(): void {
    const scope = this.currentSandboxScope();
    const step = this.activeStep();

    if (!scope || !step || !this.canShowSandboxTools()) {
      this.feedback.setError(null, 'Narzędzie sandbox jest niedostępne dla tego kontekstu.');
      return;
    }

    this.runSandboxAction(
      scope,
      this.debug.skipStepTimer({
        serverId: scope.serverId,
        stepId: step.id,
        reason: 'Sandbox runtime: skrócenie czasu aktywnego kroku eksploracji.',
      }),
      (result) => {
        this.step.lastResolvedStep.set(result);
        this.overview.refreshCurrentState();
        this.toast.show('success', 'Sandbox', 'Czas aktywnego kroku został skrócony.');
      },
      'Nie udało się skrócić czasu aktywnego kroku.',
    );
  }

  addSandboxTrials(): void {
    const scope = this.currentSandboxScope();

    if (!scope || !this.canShowSandboxTools()) {
      this.feedback.setError(null, 'Narzędzie sandbox jest niedostępne dla tego kontekstu.');
      return;
    }

    this.runSandboxAction(
      scope,
      this.debug.addRemainingActions({
        serverId: scope.serverId,
        heroId: scope.heroId,
        actionKind: 'trial',
        amount: 3,
        reason: 'Sandbox runtime: dodanie prób Trial z ekranu eksploracji.',
      }),
      (result: AddHeroRemainingActionsResult) => {
        this.overview.refreshCurrentState();
        this.toast.show(
          'success',
          'Sandbox',
          `Dodano próby Trial. Aktualnie dostępne: ${result.remainingCount}.`,
        );
      },
      'Nie udało się dodać prób Trial.',
    );
  }

  forceCompleteSandboxChallenge(success: boolean): void {
    const scope = this.currentSandboxScope();
    const challenge = this.activeChallenge();

    if (!scope || !challenge || !this.canShowSandboxTools()) {
      this.feedback.setError(null, 'Narzędzie sandbox jest niedostępne dla tego kontekstu.');
      return;
    }

    this.runSandboxAction(
      scope,
      this.debug.forceCompleteChallengeAttempt({
        serverId: scope.serverId,
        challengeAttemptId: challenge.id,
        success,
        reason: 'Sandbox runtime: ręczne domknięcie próby z ekranu eksploracji.',
      }),
      (result) => {
        if (this.activeChallenge()?.id !== challenge.id) {
          return;
        }

        this.challenge.acceptSandboxCompletion(
          result,
          this.state()?.exploration?.id ?? null,
        );
        this.overview.refreshCurrentState();
        this.toast.show('success', 'Sandbox', 'Próba została domknięta.');
      },
      'Nie udało się domknąć próby w sandboxie.',
    );
  }

  startCombatChallenge(): void {
    this.challenge.startCombat();
  }

  submitCombatChallengeStrike(): void {
    this.challenge.submitCombatStrike();
  }

  chooseMovementOption(option: HeroExplorationMovementOptionReadModel): void {
    this.movement.chooseMovementOption(option);
  }

  canChooseMovementOption(option: HeroExplorationMovementOptionReadModel): boolean {
    return this.movement.canChooseMovementOption(option);
  }

  movementOptionLabel(option: HeroExplorationMovementOptionReadModel): string {
    return this.movement.movementOptionLabel(option);
  }

  movementOptionStatusLabel(option: HeroExplorationMovementOptionReadModel): string {
    return this.movement.movementOptionStatusLabel(option);
  }

  diagnosticOutcomeLabel(
    diagnostic: ExplorationStepSelectionDiagnosticReadModel,
  ): string {
    return humanizeKey(diagnostic.finalOutcomeKind, 'Unknown');
  }

  diagnosticSelectionReason(
    diagnostic: ExplorationStepSelectionDiagnosticReadModel,
  ): string {
    if (diagnostic.forcedOverrideId) {
      return 'Sandbox override selected this outcome.';
    }

    if (diagnostic.readinessGuarded) {
      return 'DB readiness filtering was applied before selecting the final outcome.';
    }

    return 'Selected by the DB runtime selection flow.';
  }

  diagnosticDefinitionLabel(
    diagnostic: ExplorationStepSelectionDiagnosticReadModel,
  ): string {
    const selected = diagnostic.selectedDefinition;

    if (!selected) {
      return 'No Trial or Encounter definition selected.';
    }

    const kind = selected.encounterKind
      ? `${humanizeKey(selected.encounterKind, 'Unknown')} Encounter`
      : humanizeKey(selected.definitionKind, 'Unknown');

    return `${kind}: ${selected.definitionKey}`;
  }

  diagnosticSkippedLabel(
    diagnostic: ExplorationStepSelectionDiagnosticReadModel,
  ): string | null {
    const skipped = diagnostic.skippedDefinition;

    if (!skipped) {
      return null;
    }

    const definition = skipped.definitionKey ?? skipped.definitionId ?? 'unknown definition';
    const reason = skipped.reasonKey ?? 'unspecified';

    return `${humanizeKey(skipped.definitionKind, 'Unknown')} ${definition} skipped: ${reason}`;
  }

  diagnosticReasonLabels(
    diagnostic: ExplorationStepSelectionDiagnosticReadModel,
  ): string[] {
    return [
      ...(diagnostic.selectedDefinition?.readinessReasons ?? []),
      ...(diagnostic.skippedDefinition?.readinessReasons ?? []),
    ].map((reason) =>
      [
        reason.label ?? reason.key,
        reason.description,
        reason.isBlocking === true ? 'blocking' : null,
      ]
        .filter(Boolean)
        .join(' - '),
    );
  }

  rewardEntryLabel = this.rewardState.entryLabel.bind(this.rewardState);
  rewardEntryDetails = this.rewardState.entryDetails.bind(this.rewardState);
  rewardItemLabel = this.rewardState.itemLabel.bind(this.rewardState);
  rewardItemDetails = this.rewardState.itemDetails.bind(this.rewardState);
  participantHpLabel = this.challenge.participantHpLabel.bind(this.challenge);
  combatEventMetaLabel = this.challenge.eventMetaLabel.bind(this.challenge);
  timingManifestLabel = this.challenge.timingManifestLabel.bind(this.challenge);

  private currentSandboxScope(): {
    serverId: string;
    heroId: string;
    difficultyKey: string;
  } | null {
    const server = this.activeServer.selectedServer();
    const context = this.overview.currentContext();

    return server?.id && context
      ? { serverId: server.id, ...context }
      : null;
  }

  private runSandboxAction<T>(
    scope: { serverId: string; heroId: string; difficultyKey: string },
    action: Observable<T>,
    onSuccess: (result: T) => void,
    errorMessage: string,
  ): void {
    const token = this.sandboxActionToken.next();

    this.isRunningSandboxTool.set(true);
    this.feedback.clear();
    action
      .pipe(
        finalize(() => {
          if (this.isCurrentSandboxAction(token, scope)) {
            this.isRunningSandboxTool.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          if (!this.isCurrentSandboxAction(token, scope)) {
            return;
          }

          onSuccess(result);
        },
        error: (error: unknown) => {
          if (!this.isCurrentSandboxAction(token, scope)) {
            return;
          }

          this.feedback.setError(error, errorMessage);
        },
      });
  }

  private isCurrentSandboxAction(
    token: number,
    scope: { serverId: string; heroId: string; difficultyKey: string },
  ): boolean {
    return (
      this.sandboxActionToken.isCurrent(token) &&
      this.canShowSandboxTools() &&
      this.activeServer.selectedServer()?.id === scope.serverId &&
      this.overview.isCurrentContext(scope.heroId, scope.difficultyKey)
    );
  }

  stepBackendDiagnostics(): Array<{ label: string; value: string }> {
    const result = this.currentStepResult();

    if (!result) {
      return [];
    }

    return [
      { label: 'RPC', value: 'resolve_hero_exploration_step' },
      { label: 'Args', value: JSON.stringify({ p_step_id: result.stepId }) },
      { label: 'Mapped result shape', value: JSON.stringify(result) },
    ];
  }

}
