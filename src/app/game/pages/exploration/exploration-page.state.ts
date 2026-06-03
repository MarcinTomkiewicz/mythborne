import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable } from 'rxjs';
import { HeroExplorationChallengeCompletionReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { ExplorationStepSelectionDiagnosticReadModel } from '../../../core/domain/exploration/exploration-readiness.model';
import { AddHeroRemainingActionsResult } from '../../../core/domain/exploration/exploration-debug.model';
import { GameServerKind } from '../../../core/enums/active-server.enum';
import { HeroExplorationDebug } from '../../../core/services/exploration/hero-exploration-debug';
import { ActiveServer } from '../../../core/services/server/active-server';
import { ToastService } from '../../../core/services/ui/toast';
import { humanizeKey } from '../../../core/utils/normalize-text';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationChallengeState } from './exploration-challenge.state';
import { ChallengeCompletionSnapshot } from './exploration-challenge.model';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationMinigameHandoffState } from './exploration-minigame-handoff.state';
import { ExplorationMovementState } from './exploration-movement.state';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationPreviewState } from './exploration-preview.state';
import { ExplorationRewardState } from './exploration-reward.state';
import { ExplorationStartState } from './exploration-start.state';
import { ExplorationStepState } from './exploration-step.state';

@Injectable()
export class ExplorationPageState {
  private readonly activeServer = inject(ActiveServer);
  private readonly debug = inject(HeroExplorationDebug);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);
  private readonly sandboxActionToken = new RequestToken();

  readonly feedback = inject(ExplorationFeedbackState);
  readonly minigameHandoff = inject(ExplorationMinigameHandoffState);
  readonly overview = inject(ExplorationOverviewState);
  readonly movement = inject(ExplorationMovementState);
  readonly preview = inject(ExplorationPreviewState);
  readonly step = inject(ExplorationStepState);
  readonly challenge = inject(ExplorationChallengeState);
  readonly rewardState = inject(ExplorationRewardState);
  readonly start = inject(ExplorationStartState);

  readonly selectedDifficultyCardPreview = computed(() =>
    this.preview.difficultyCardPreview(this.overview.selectedDifficultyKey()),
  );
  readonly isRunningSandboxTool = signal(false);
  readonly isUpdatingActiveStepTimer = signal(false);
  readonly difficultyEntryRequested = signal(false);
  readonly runtimeScreenRequested = signal(false);
  private readonly sandboxCompletion = signal<ChallengeCompletionSnapshot | null>(null);

  readonly canShowSelectionDiagnostics = computed(() => {
    const server = this.activeServer.selectedServer();
    const access = this.activeServer.access();

    return server?.kind === GameServerKind.Sandbox && access.canAccessSandbox;
  });
  readonly canShowSandboxTools = this.canShowSelectionDiagnostics;
  readonly canSkipSandboxStepTimer = computed(() =>
    this.canShowSandboxTools()
    && Boolean(this.step.activeStep())
    && !this.isRunningSandboxTool(),
  );
  readonly canAddSandboxTrials = computed(() =>
    this.canShowSandboxTools()
    && Boolean(this.overview.currentContext())
    && !this.isRunningSandboxTool(),
  );
  readonly canShowDirectionBoard = computed(() => {
    const state = this.overview.state();

    return Boolean(
      state?.hasExploration
      && state.exploration
      && !state.activeStep
      && !state.activeChallenge
      && this.movement.movementBlockReason() === null,
    );
  });
  readonly canShowDifficultyEntryAction = computed(() =>
    this.canShowDirectionBoard()
    && !this.movement.isMoving()
    && !this.step.activeStep()
    && !this.challenge.activeChallenge(),
  );
  readonly shouldShowDirectionBoardHeader = computed(() =>
    !this.step.currentStepResult()
    && !this.sandboxChallengeResult(),
  );
  readonly canShowSandboxChallengeCompletionTools = computed(() => {
    const challenge = this.challenge.activeChallenge();

    return this.canShowSandboxTools()
      && Boolean(challenge?.trialDefinitionId && !challenge.minigameKey)
      && Boolean(challenge);
  });
  readonly sandboxChallengeResult = computed(() => {
    const state = this.overview.state();
    const completion = this.sandboxCompletion();
    const stepResult = this.step.currentStepResult();
    const isCompletionStep = !stepResult ||
      stepResult.challengeAttemptId === completion?.result.challengeAttemptId;

    return completion &&
      this.canShowSandboxTools() &&
      state?.exploration?.id === completion.explorationId &&
      !state.activeStep &&
      !state.activeChallenge
      && isCompletionStep
      ? completion.result
      : null;
  });
  readonly stepSelectionDiagnostic = computed(() =>
    this.canShowSelectionDiagnostics()
      ? this.step.currentStepResult()?.selectionDiagnostic ?? null
      : null,
  );
  readonly shouldShowRuntimeScreen = computed(() => {
    const state = this.overview.state();

    if (
      this.difficultyEntryRequested()
      && !state?.activeStep
      && !state?.activeChallenge
    ) {
      return false;
    }

    return (
      this.runtimeScreenRequested()
      || Boolean(state?.activeStep)
      || Boolean(state?.activeChallenge)
      || Boolean(this.step.currentStepResult())
      || Boolean(this.sandboxChallengeResult())
      || Boolean(this.minigameHandoff.currentMinigameReportPointer())
      || Boolean(this.rewardState.reward())
    );
  });

  loadData(): void {
    this.overview.loadData();
  }

  selectDifficulty(difficultyKey: string): void {
    this.difficultyEntryRequested.set(false);
    this.runtimeScreenRequested.set(false);
    this.overview.selectDifficulty(difficultyKey);
  }

  startSelectedDifficulty(): void {
    this.difficultyEntryRequested.set(false);
    this.start.startSelectedDifficulty(() => this.runtimeScreenRequested.set(true));
  }

  showDifficultyEntry(): void {
    const state = this.overview.state();

    if (state?.activeStep || state?.activeChallenge) {
      return;
    }

    this.difficultyEntryRequested.set(true);
    this.runtimeScreenRequested.set(false);
  }

  skipSandboxStepTimer(): void {
    const scope = this.currentSandboxScope();
    const step = this.step.activeStep();

    if (!scope || !step || !this.canShowSandboxTools()) {
      this.feedback.setError(null, 'Narzędzie sandbox jest niedostępne dla tego kontekstu.');
      return;
    }

    this.isUpdatingActiveStepTimer.set(true);
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
        this.isUpdatingActiveStepTimer.set(false);
        this.toast.show('success', 'Sandbox', 'Czas aktywnego kroku został skrócony.');
      },
      'Nie udało się skrócić czasu aktywnego kroku.',
      () => this.isUpdatingActiveStepTimer.set(false),
      () => this.isUpdatingActiveStepTimer.set(false),
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
    const challenge = this.challenge.activeChallenge();

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
        if (this.challenge.activeChallenge()?.id !== challenge.id) {
          return;
        }

        this.acceptSandboxCompletion(
          result,
          this.overview.state()?.exploration?.id ?? null,
        );
        this.overview.refreshCurrentState();
        this.toast.show('success', 'Sandbox', 'Próba została domknięta.');
      },
      'Nie udało się domknąć próby w sandboxie.',
    );
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

  stepBackendDiagnostics(): Array<{ label: string; value: string }> {
    const result = this.step.currentStepResult();

    if (!result) {
      return [];
    }

    return [
      { label: 'RPC', value: 'resolve_hero_exploration_step' },
      { label: 'Args', value: JSON.stringify({ p_step_id: result.stepId }) },
      { label: 'Mapped result shape', value: JSON.stringify(result) },
    ];
  }

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

  private acceptSandboxCompletion(
    result: HeroExplorationChallengeCompletionReadModel,
    explorationId: string | null,
  ): void {
    this.sandboxCompletion.set({ result, explorationId });
    this.rewardState.preferCompletedChallengeReward(
      explorationId,
      result.challengeAttemptId,
    );
  }

  private runSandboxAction<T>(
    scope: { serverId: string; heroId: string; difficultyKey: string },
    action: Observable<T>,
    onSuccess: (result: T) => void,
    errorMessage: string,
    onError?: () => void,
    onFinalize?: () => void,
  ): void {
    const token = this.sandboxActionToken.next();

    this.isRunningSandboxTool.set(true);
    this.feedback.clear();
    action
      .pipe(
        finalize(() => {
          if (this.sandboxActionToken.isCurrent(token)) {
            onFinalize?.();
          }

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

          onError?.();
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
}
