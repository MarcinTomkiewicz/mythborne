import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  HeroExplorationStepReadModel,
  HeroExplorationStepResolutionReadModel,
} from '../../../core/domain/exploration/exploration-runtime.model';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';
import { ToastService } from '../../../core/services/ui/toast';
import type { PendingTimerDisplay } from '../../../core/types/pending-timer.types';
import { jsonRecord, read } from '../../../core/utils/json-read';
import { pendingTimerDisplay, pendingTimerHasElapsed } from '../../../core/utils/pending-timer';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationOverviewState } from './exploration-overview.state';

@Injectable()
export class ExplorationStepState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly explorations = inject(HeroExplorations);
  private readonly feedback = inject(ExplorationFeedbackState);
  private readonly overview = inject(ExplorationOverviewState);
  private readonly toast = inject(ToastService);
  private readonly resolveToken = new RequestToken();

  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly now = signal(Date.now());
  readonly isResolving = signal(false);
  readonly lastResolvedStep = signal<HeroExplorationStepResolutionReadModel | null>(null);
  readonly activeStep = computed(() => this.overview.state()?.activeStep ?? null);
  readonly currentStepResult = computed(() => {
    const state = this.overview.state();
    const result = this.lastResolvedStep();
    const activeChallenge = state?.activeChallenge ?? null;

    if (
      !result ||
      state?.exploration?.id !== result.explorationId ||
      state.activeStep
    ) {
      return null;
    }

    if (activeChallenge && result.challengeAttemptId !== activeChallenge.id) {
      return null;
    }

    return result;
  });
  readonly activeStepTimerDisplay = computed(() =>
    this.activeStepTimerDisplayFor(this.activeStep(), this.now()),
  );
  readonly canCheckActiveStepResult = computed(() => {
    const step = this.activeStep();

    return Boolean(
      step &&
      this.isActiveStepWorkflowReady(step, this.now()) &&
      !this.isResolving(),
    );
  });
  readonly isCurrentStepNothing = computed(() =>
    this.currentStepResult()?.outcomeKind === 'nothing' &&
    !this.isCurrentStepTrialNoManifest(),
  );
  readonly isCurrentStepTrialNoManifest = computed(() =>
    this.isTrialManifestationFailure(this.currentStepResult()),
  );

  constructor() {
    effect(() => {
      if (this.activeStep()) {
        this.startClock();
      } else {
        this.stopClock();
      }
    });
    this.destroyRef.onDestroy(() => this.stopClock());
  }

  checkResult(): void {
    const context = this.overview.currentContext();
    const step = this.activeStep();

    this.feedback.clear();

    if (!context || !step) {
      this.feedback.setError(null, 'Brak aktywnego kroku ruchu do sprawdzenia.');
      return;
    }

    if (!this.isActiveStepWorkflowReady(step, this.now())) {
      this.feedback.setError(null, 'Krok ruchu nie jest jeszcze gotowy.');
      return;
    }

    const token = this.resolveToken.next();

    this.isResolving.set(true);
    this.explorations
      .resolveHeroExplorationStep({
        heroId: context.heroId,
        difficultyKey: context.difficultyKey,
        stepId: step.id,
      })
      .pipe(
        finalize(() => {
          if (this.resolveToken.isCurrent(token)) {
            this.isResolving.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (workflow) => {
          if (!this.isCurrentResolve(token, context.heroId, context.difficultyKey, step.id)) {
            return;
          }

          this.lastResolvedStep.set(workflow.result);
          this.overview.setStateFromWorkflow(workflow.state);
          this.toast.show('success', 'Eksploracja', 'Wynik ruchu został sprawdzony.');
        },
        error: (error: unknown) => {
          if (!this.isCurrentResolve(token, context.heroId, context.difficultyKey, step.id)) {
            return;
          }

          this.feedback.setError(error, 'Nie udało się sprawdzić wyniku ruchu.');
        },
      });
  }

  private isTrialManifestationFailure(
    result: HeroExplorationStepResolutionReadModel | null,
  ): boolean {
    if (!result || result.outcomeKind !== 'nothing') {
      return false;
    }

    const metadata = jsonRecord(result.metadataJson);

    return (
      (
        result.rawOutcomeKind === 'trial_opportunity' ||
        read(metadata, 'rawOutcomeKind', 'raw_outcome_kind') === 'trial_opportunity'
      ) &&
      read(metadata, 'trialManifested', 'trial_manifested') === false
    );
  }

  private activeStepTimerDisplayFor(
    step: HeroExplorationStepReadModel | null,
    nowMs: number,
  ): PendingTimerDisplay {
    return pendingTimerDisplay({
      subjectId: step?.id ?? null,
      startedAt: step?.startedAt,
      resolvesAt: step?.resolvesAt,
      nowMs,
      isLoading: this.overview.isLoading(),
    });
  }

  private isActiveStepWorkflowReady(
    step: HeroExplorationStepReadModel,
    nowMs: number,
  ): boolean {
    return pendingTimerHasElapsed({
      resolvesAt: step.resolvesAt,
      nowMs,
    });
  }

  private startClock(): void {
    this.now.set(Date.now());

    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => this.now.set(Date.now()), 1000);
  }

  private stopClock(): void {
    if (!this.intervalId) {
      return;
    }

    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  private isCurrentResolve(
    token: number,
    heroId: string,
    difficultyKey: string,
    stepId: string,
  ): boolean {
    return (
      this.resolveToken.isCurrent(token) &&
      this.overview.isCurrentContext(heroId, difficultyKey) &&
      this.overview.state()?.activeStep?.id === stepId
    );
  }
}
