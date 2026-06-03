import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';
import { createRequestId } from '../../../core/utils/request-id';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationMinigameHandoffState } from './exploration-minigame-handoff.state';
import { ExplorationOverviewState } from './exploration-overview.state';

@Injectable()
export class ExplorationStartState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly explorations = inject(HeroExplorations);
  private readonly feedback = inject(ExplorationFeedbackState);
  private readonly minigameHandoff = inject(ExplorationMinigameHandoffState);
  private readonly overview = inject(ExplorationOverviewState);
  private readonly actionToken = new RequestToken();

  readonly isStarting = signal(false);

  startSelectedDifficulty(onReady?: () => void): void {
    if (this.isStarting()) {
      return;
    }

    const context = this.overview.currentContext();

    if (!context) {
      this.feedback.setError(null, 'Wybierz poziom trudności przed rozpoczęciem eksploracji.');
      return;
    }

    const token = this.actionToken.next();
    const requestId = createRequestId(
      `exploration-start:${context.heroId}:${context.difficultyKey}`,
    );

    this.isStarting.set(true);
    this.feedback.clear();

    this.explorations
      .startOrGetHeroExplorationAndStartInitialStep({
        ...context,
        requestId,
      })
      .pipe(
        finalize(() => {
          if (this.actionToken.isCurrent(token)) {
            this.isStarting.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (state) => {
          if (!this.isCurrentAction(token, context.heroId, context.difficultyKey)) {
            return;
          }

          this.minigameHandoff.clearMinigameReportPointer();
          this.overview.setStateFromWorkflow(state);
          onReady?.();
        },
        error: (error: unknown) => {
          if (!this.isCurrentAction(token, context.heroId, context.difficultyKey)) {
            return;
          }

          this.feedback.setError(error, 'Nie udało się rozpocząć eksploracji.');
        },
      });
  }

  private isCurrentAction(token: number, heroId: string, difficultyKey: string): boolean {
    return (
      this.actionToken.isCurrent(token) &&
      this.overview.isCurrentContext(heroId, difficultyKey)
    );
  }
}
