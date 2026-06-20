import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable } from 'rxjs';
import { EXPLORATION_RUNTIME_COPY } from '../../../core/constants/exploration-runtime-copy.const';
import { HeroExplorationChallengeCompletionReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { AddHeroRemainingActionsResult } from '../../../core/domain/exploration/exploration-debug.model';
import { HeroExplorationDebug } from '../../../core/services/exploration/hero-exploration-debug';
import { ActiveServer } from '../../../core/services/server/active-server';
import { ToastService } from '../../../core/services/ui/toast';
import { ExplorationSandboxScope } from '../../../core/types/exploration-runtime-context.types';
import { canShowSandboxTestTools } from '../../../core/utils/sandbox-test-tools-visibility';
import { RequestToken } from '../../../core/utils/request-token';
import { ChallengeCompletionSnapshot } from './exploration-challenge.model';
import { ExplorationChallengeState } from './exploration-challenge.state';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationRewardState } from './exploration-reward.state';
import { ExplorationStepState } from './exploration-step.state';

@Injectable()
export class ExplorationSandboxToolState {
  private readonly activeServer = inject(ActiveServer);
  private readonly debug = inject(HeroExplorationDebug);
  private readonly destroyRef = inject(DestroyRef);
  private readonly feedback = inject(ExplorationFeedbackState);
  private readonly overview = inject(ExplorationOverviewState);
  private readonly step = inject(ExplorationStepState);
  private readonly challenge = inject(ExplorationChallengeState);
  private readonly rewardState = inject(ExplorationRewardState);
  private readonly toast = inject(ToastService);
  private readonly sandboxActionToken = new RequestToken();
  private readonly sandboxCompletion = signal<ChallengeCompletionSnapshot | null>(null);

  readonly isRunningSandboxTool = signal(false);
  readonly isUpdatingActiveStepTimer = signal(false);

  readonly canShowSandboxTools = computed(() => {
    const server = this.activeServer.selectedServer();
    const access = this.activeServer.access();

    return canShowSandboxTestTools(server, access);
  });
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

  skipSandboxStepTimer(): void {
    const scope = this.currentSandboxScope();
    const step = this.step.activeStep();

    if (!scope || !step || !this.canShowSandboxTools()) {
      this.feedback.setError(null, EXPLORATION_RUNTIME_COPY.sandboxUnavailable);
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
        this.toast.show(
          'success',
          EXPLORATION_RUNTIME_COPY.sandboxTitle,
          EXPLORATION_RUNTIME_COPY.sandboxStepTimerShortened,
        );
      },
      EXPLORATION_RUNTIME_COPY.sandboxStepTimerFailed,
      () => this.isUpdatingActiveStepTimer.set(false),
      () => this.isUpdatingActiveStepTimer.set(false),
    );
  }

  addSandboxTrials(): void {
    const scope = this.currentSandboxScope();

    if (!scope || !this.canShowSandboxTools()) {
      this.feedback.setError(null, EXPLORATION_RUNTIME_COPY.sandboxUnavailable);
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
          EXPLORATION_RUNTIME_COPY.sandboxTitle,
          `${EXPLORATION_RUNTIME_COPY.sandboxTrialsAddedPrefix} ${result.remainingCount}.`,
        );
      },
      EXPLORATION_RUNTIME_COPY.sandboxTrialsFailed,
    );
  }

  forceCompleteSandboxChallenge(success: boolean): void {
    const scope = this.currentSandboxScope();
    const challenge = this.challenge.activeChallenge();

    if (!scope || !challenge || !this.canShowSandboxTools()) {
      this.feedback.setError(null, EXPLORATION_RUNTIME_COPY.sandboxUnavailable);
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
        this.toast.show(
          'success',
          EXPLORATION_RUNTIME_COPY.sandboxTitle,
          EXPLORATION_RUNTIME_COPY.sandboxChallengeCompleted,
        );
      },
      EXPLORATION_RUNTIME_COPY.sandboxChallengeFailed,
    );
  }

  private currentSandboxScope(): ExplorationSandboxScope | null {
    const server = this.activeServer.selectedServer();
    const context = this.overview.currentContext();

    return server?.id && context && server.id === context.serverId
      ? context
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
    scope: ExplorationSandboxScope,
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
    scope: ExplorationSandboxScope,
  ): boolean {
    return (
      this.sandboxActionToken.isCurrent(token) &&
      this.canShowSandboxTools() &&
      this.activeServer.selectedServer()?.id === scope.serverId &&
      this.overview.isCurrentContext(
        scope.serverId,
        scope.heroId,
        scope.difficultyKey,
      )
    );
  }
}
