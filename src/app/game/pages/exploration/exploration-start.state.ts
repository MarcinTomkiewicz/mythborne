import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationOverviewState } from './exploration-overview.state';

@Injectable()
export class ExplorationStartState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly explorations = inject(HeroExplorations);
  private readonly feedback = inject(ExplorationFeedbackState);
  private readonly overview = inject(ExplorationOverviewState);
  private readonly actionToken = new RequestToken();

  readonly isStarting = signal(false);

  startSelectedDifficulty(onReady?: () => void): void {
    if (this.isStarting()) {
      return;
    }

    const context = this.overview.currentContext();

    if (!context) {
      this.feedback.setError(null, 'Select a difficulty before starting exploration.');
      return;
    }

    const token = this.actionToken.next();
    const requestId = startExplorationRequestId(context.heroId, context.difficultyKey);

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

          this.overview.setStateFromWorkflow(state);
          onReady?.();
        },
        error: (error: unknown) => {
          if (!this.isCurrentAction(token, context.heroId, context.difficultyKey)) {
            return;
          }

          this.feedback.setError(error, 'Failed to start exploration.');
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

function startExplorationRequestId(heroId: string, difficultyKey: string): string {
  const randomId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `exploration-start:${heroId}:${difficultyKey}:${randomId}`;
}
