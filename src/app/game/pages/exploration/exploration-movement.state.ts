import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { HeroExplorationEdgeReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationOverviewState } from './exploration-overview.state';

@Injectable()
export class ExplorationMovementState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly explorations = inject(HeroExplorations);
  private readonly feedback = inject(ExplorationFeedbackState);
  private readonly overview = inject(ExplorationOverviewState);
  private readonly movementToken = new RequestToken();

  readonly isMoving = signal(false);
  readonly edges = computed(() => this.overview.state()?.edges ?? []);
  readonly movementBlockReason = computed(() => this.resolveMovementBlockReason());

  canChooseDirection(edge: HeroExplorationEdgeReadModel): boolean {
    return !this.isMoving() && edge.isAvailable && this.movementBlockReason() === null;
  }

  edgeStatusLabel(edge: HeroExplorationEdgeReadModel): string {
    if (!edge.isAvailable) {
      return 'Unavailable';
    }

    return edge.toNodeId ? 'Known path' : 'Undiscovered branch';
  }

  directionLabel(edge: HeroExplorationEdgeReadModel): string {
    return edge.label || edge.directionKey;
  }

  chooseDirection(edge: HeroExplorationEdgeReadModel): void {
    const context = this.overview.currentContext();
    const state = this.overview.state();
    const exploration = state?.exploration;

    this.feedback.clear();

    if (!context || !state?.hasExploration || !exploration) {
      this.feedback.setError(null, 'Start exploration before choosing a direction.');
      return;
    }

    const blockReason = this.movementBlockReason();

    if (blockReason || !edge.isAvailable || edge.explorationId !== exploration.id) {
      this.feedback.setError(null, blockReason ?? 'Direction is not available.');
      return;
    }

    const token = this.movementToken.next();

    this.isMoving.set(true);
    this.explorations
      .startHeroExplorationStep({
        heroId: context.heroId,
        difficultyKey: context.difficultyKey,
        explorationId: exploration.id,
        edgeId: edge.id,
      })
      .pipe(
        finalize(() => {
          if (this.movementToken.isCurrent(token)) {
            this.isMoving.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (nextState) => {
          if (!this.isCurrentMovement(token, context.heroId, context.difficultyKey, exploration.id)) {
            return;
          }

          this.overview.setStateFromWorkflow(nextState);
          this.feedback.setSuccess('Movement step started.');
        },
        error: (error: unknown) => {
          if (!this.isCurrentMovement(token, context.heroId, context.difficultyKey, exploration.id)) {
            return;
          }

          this.feedback.setError(error, 'Failed to start movement step.');
        },
      });
  }

  private resolveMovementBlockReason(): string | null {
    const state = this.overview.state();

    if (!state?.hasExploration || !state.exploration) {
      return 'Start exploration before choosing a direction.';
    }

    if (state.activeChallenge) {
      return 'Resolve the active challenge before moving.';
    }

    if (state.activeStep) {
      return 'Wait for the active movement step to resolve.';
    }

    if (state.remainingTrials <= 0) {
      return 'No trial attempts remain today.';
    }

    if (!state.edges.some((edge) => edge.isAvailable)) {
      return 'No available directions.';
    }

    return null;
  }

  private isCurrentMovement(
    token: number,
    heroId: string,
    difficultyKey: string,
    explorationId: string,
  ): boolean {
    return (
      this.movementToken.isCurrent(token) &&
      this.overview.isCurrentContext(heroId, difficultyKey) &&
      this.overview.state()?.exploration?.id === explorationId
    );
  }
}
