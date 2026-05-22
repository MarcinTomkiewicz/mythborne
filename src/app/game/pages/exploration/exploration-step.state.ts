import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  HeroExplorationStepReadModel,
  HeroExplorationStepResolutionReadModel,
} from '../../../core/domain/exploration/exploration-runtime.model';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';
import { ToastService } from '../../../core/services/ui/toast';
import { jsonRecord, read } from '../../../core/utils/json-read';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationOverviewState } from './exploration-overview.state';
import {
  explorationStepEncounterKind,
  explorationStepReportFallbackLines,
  explorationStepReportNarrativeLines,
  explorationStepResultHasEffectContext,
  explorationStepResultTitle,
  explorationStepResultTypeLabel,
} from './exploration-step-result-ui';

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
      return 'Brak aktywnego ruchu.';
    }

    return this.isActiveStepReady()
      ? 'Wynik jest gotowy do sprawdzenia.'
      : `Ruch zakończy się ${step.resolvesAt}.`;
  });
  readonly stepResultTitle = computed(() =>
    explorationStepResultTitle(this.currentStepResult()),
  );
  readonly stepResultTypeLabel = computed(() =>
    explorationStepResultTypeLabel(this.currentStepResult()),
  );
  readonly stepResultEncounterKind = computed(() =>
    explorationStepEncounterKind(this.currentStepResult()),
  );
  readonly stepReportTitle = computed(() =>
    this.reportTitle(this.currentStepResult()),
  );
  readonly stepReportNarrativeLines = computed(() =>
    explorationStepReportNarrativeLines(this.currentStepResult()),
  );
  readonly stepReportFallbackLines = computed(() =>
    explorationStepReportFallbackLines(this.currentStepResult()),
  );
  readonly isCurrentStepEffectReport = computed(() =>
    explorationStepResultHasEffectContext(this.currentStepResult()),
  );
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

    if (!this.isActiveStepReady()) {
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

  private isActiveStepReady(): boolean {
    const resolvesAt = this.resolvesAtMs(this.activeStep());

    return resolvesAt !== null && this.now() >= resolvesAt;
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

  private reportTitle(result: HeroExplorationStepResolutionReadModel | null): string {
    const title = this.stepResultTitle();
    const typeLabel = this.stepResultTypeLabel();

    if (result?.outcomeKind !== 'encounter') {
      return title;
    }

    if (!typeLabel || title.includes(typeLabel)) {
      return title;
    }

    return `${title}: ${typeLabel}`;
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
      return 'Gotowe';
    }

    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
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
