import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, of, switchMap } from 'rxjs';
import { HeroExplorationDifficultyCardPreview } from '../../../core/domain/exploration/exploration-preview.model';
import { HeroExplorationStateReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import {
  explorationActiveChallengeLabel,
  explorationActiveEffectDisplay,
  explorationActiveEffectLabel,
  explorationActiveStepLabel,
  explorationCurrentNodeLabel,
} from './exploration-labels';
import { ExplorationPreviewState } from './exploration-preview.state';

@Injectable()
export class ExplorationOverviewState {
  private readonly activeHero = inject(ActiveHero);
  private readonly destroyRef = inject(DestroyRef);
  private readonly explorations = inject(HeroExplorations);
  private readonly feedback = inject(ExplorationFeedbackState);
  private readonly previews = inject(ExplorationPreviewState);
  private readonly loadToken = new RequestToken();

  private activeHeroId: string | null = null;

  readonly state = signal<HeroExplorationStateReadModel | null>(null);
  readonly selectedDifficultyKey = signal<string | null>(null);
  readonly isLoading = signal(false);

  readonly selectedDifficulty = computed(() => {
    return this.previews.difficultyCardPreview(this.selectedDifficultyKey());
  });

  readonly remainingTrialsLabel = computed(() => {
    const remaining = this.state()?.remainingTrials ?? 0;
    return `${remaining} trial${remaining === 1 ? '' : 's'} available today`;
  });
  readonly currentNodeLabel = computed(() => explorationCurrentNodeLabel(this.state()));
  readonly activeStepLabel = computed(() => explorationActiveStepLabel(this.state()));
  readonly activeChallengeLabel = computed(() =>
    explorationActiveChallengeLabel(this.state()),
  );
  readonly activeEffectLabel = computed(() => explorationActiveEffectLabel(this.state()));
  readonly activeEffectDisplay = computed(() => explorationActiveEffectDisplay(this.state()));

  loadData(): void {
    const token = this.loadToken.next();

    this.isLoading.set(true);
    this.feedback.clear();
    this.clearHeroScopedPreviewState();

    this.activeHero
      .requireActiveHero()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (context) => {
          if (!this.loadToken.isCurrent(token)) {
            return;
          }

          this.activeHeroId = context.heroId;
          this.loadOverview(context.heroId, token);
        },
        error: (error: unknown) => {
          if (!this.loadToken.isCurrent(token)) {
            return;
          }

          this.isLoading.set(false);
          this.feedback.setError(error, 'Failed to load active hero.');
        },
      });
  }

  selectDifficulty(difficultyKey: string): void {
    if (this.selectedDifficultyKey() === difficultyKey) {
      return;
    }

    this.selectedDifficultyKey.set(difficultyKey);
    this.loadSelectedState();
  }

  currentContext(): { heroId: string; difficultyKey: string } | null {
    const difficultyKey = this.selectedDifficultyKey();

    return this.activeHeroId && difficultyKey
      ? { heroId: this.activeHeroId, difficultyKey }
      : null;
  }

  setStateFromWorkflow(state: HeroExplorationStateReadModel): void {
    this.state.set(state);
  }

  isCurrentContext(heroId: string, difficultyKey: string): boolean {
    return (
      this.activeHeroId === heroId && this.selectedDifficultyKey() === difficultyKey
    );
  }

  private loadOverview(heroId: string, token: number): void {
    this.previews
      .loadDifficultyCardPreviews(heroId)
      .pipe(
        switchMap((difficultyCardPreviews) => {
          if (!this.loadToken.isCurrent(token)) {
            return of(null);
          }

          this.previews.difficultyCardPreviews.set(difficultyCardPreviews);
          const selectedKey = this.resolveSelectedDifficultyKey(
            difficultyCardPreviews,
          );
          this.selectedDifficultyKey.set(selectedKey);

          if (!selectedKey) {
            this.state.set(null);
            return of({ state: null });
          }

          return forkJoin({
            state: this.explorations.getHeroExplorationState({
              heroId,
              difficultyKey: selectedKey,
            }),
          });
        }),
        finalize(() => {
          if (this.loadToken.isCurrent(token)) {
            this.isLoading.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          if (!result || !this.isCurrentLoad(token, heroId)) {
            return;
          }

          this.state.set(result.state);
        },
        error: (error: unknown) => {
          if (!this.isCurrentLoad(token, heroId)) {
            return;
          }

          this.feedback.setError(error, 'Failed to load exploration status.');
        },
      });
  }

  private clearHeroScopedPreviewState(): void {
    this.activeHeroId = null;
    this.state.set(null);
    this.selectedDifficultyKey.set(null);
    this.previews.difficultyCardPreviews.set([]);
  }

  private loadSelectedState(): void {
    const context = this.currentContext();

    if (!context) {
      return;
    }

    const token = this.loadToken.next();

    this.isLoading.set(true);
    this.feedback.clear();

    this.explorations
      .getHeroExplorationState(context)
      .pipe(
        finalize(() => {
          if (this.loadToken.isCurrent(token)) {
            this.isLoading.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (state) => {
          if (!this.isCurrentLoad(token, context.heroId, context.difficultyKey)) {
            return;
          }

          this.state.set(state);
        },
        error: (error: unknown) => {
          if (!this.isCurrentLoad(token, context.heroId, context.difficultyKey)) {
            return;
          }

          this.feedback.setError(error, 'Failed to load exploration status.');
        },
      });
  }

  private resolveSelectedDifficultyKey(
    difficultyCardPreviews: readonly HeroExplorationDifficultyCardPreview[],
  ): string | null {
    const current = this.selectedDifficultyKey();

    return difficultyCardPreviews.find(
      (preview) => preview.difficultyKey === current,
    )?.difficultyKey
      ?? difficultyCardPreviews[0]?.difficultyKey
      ?? null;
  }

  private isCurrentLoad(
    token: number,
    heroId: string,
    difficultyKey = this.selectedDifficultyKey(),
  ): boolean {
    return (
      this.loadToken.isCurrent(token) &&
      this.isCurrentContext(heroId, difficultyKey ?? '')
    );
  }
}
