import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { HeroExplorationStepReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationOverviewState } from './exploration-overview.state';

@Injectable()
export class ExplorationStepState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly explorations = inject(HeroExplorations);
  private readonly feedback = inject(ExplorationFeedbackState);
  private readonly overview = inject(ExplorationOverviewState);
  private readonly resolveToken = new RequestToken();

  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly now = signal(Date.now());
  readonly isResolving = signal(false);
  readonly activeStep = computed(() => this.overview.state()?.activeStep ?? null);
  readonly activeStepProgressPercent = computed(() =>
    this.progressPercent(this.activeStep()),
  );
  readonly activeStepRemainingLabel = computed(() =>
    this.remainingLabel(this.activeStep()),
  );
  readonly canCheckResult = computed(() =>
    Boolean(this.activeStep()) && this.isActiveStepReady() && !this.isResolving(),
  );
  readonly activeStepStatusLabel = computed(() => {
    const step = this.activeStep();

    if (!step) {
      return 'No active movement step.';
    }

    return this.isActiveStepReady()
      ? 'Ready to check result.'
      : `Resolving at ${step.resolvesAt}.`;
  });

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
      this.feedback.setError(null, 'No active movement step to check.');
      return;
    }

    if (!this.isActiveStepReady()) {
      this.feedback.setError(null, 'Movement step is not ready yet.');
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
        next: (state) => {
          if (!this.isCurrentResolve(token, context.heroId, context.difficultyKey, step.id)) {
            return;
          }

          this.overview.setStateFromWorkflow(state);
          this.feedback.setSuccess('Movement result checked.');
        },
        error: (error: unknown) => {
          if (!this.isCurrentResolve(token, context.heroId, context.difficultyKey, step.id)) {
            return;
          }

          this.feedback.setError(error, 'Failed to check movement result.');
        },
      });
  }

  private isActiveStepReady(): boolean {
    const resolvesAt = this.resolvesAtMs(this.activeStep());

    return resolvesAt !== null && this.now() >= resolvesAt;
  }

  private progressPercent(step: HeroExplorationStepReadModel | null): number {
    const startedAt = this.timeMs(step?.startedAt);
    const resolvesAt = this.resolvesAtMs(step);

    if (startedAt === null || resolvesAt === null || resolvesAt <= startedAt) {
      return this.isActiveStepReady() ? 100 : 0;
    }

    const elapsed = this.now() - startedAt;
    const duration = resolvesAt - startedAt;

    return Math.max(0, Math.min(100, Math.round((elapsed / duration) * 100)));
  }

  private remainingLabel(step: HeroExplorationStepReadModel | null): string {
    const resolvesAt = this.resolvesAtMs(step);

    if (resolvesAt === null) {
      return '-';
    }

    const remainingMs = resolvesAt - this.now();

    if (remainingMs <= 0) {
      return 'Ready now';
    }

    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return minutes > 0 ? `${minutes}m ${seconds}s remaining` : `${seconds}s remaining`;
  }

  private resolvesAtMs(step: HeroExplorationStepReadModel | null): number | null {
    return this.timeMs(step?.resolvesAt);
  }

  private timeMs(value: string | null | undefined): number | null {
    if (!value) {
      return null;
    }

    const parsed = Date.parse(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  private startClock(): void {
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
