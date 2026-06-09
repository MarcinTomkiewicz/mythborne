import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  HeroExplorationMovementOptionReadModel,
} from '../../../core/domain/exploration/exploration-runtime.model';
import { EXPLORATION_RUNTIME_COPY } from '../../../core/constants/exploration-runtime-copy.const';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';
import { ToastService } from '../../../core/services/ui/toast';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationMinigameHandoffState } from './exploration-minigame-handoff.state';
import { ExplorationOverviewState } from './exploration-overview.state';

@Injectable()
export class ExplorationMovementState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly explorations = inject(HeroExplorations);
  private readonly feedback = inject(ExplorationFeedbackState);
  private readonly minigameHandoff = inject(ExplorationMinigameHandoffState);
  private readonly overview = inject(ExplorationOverviewState);
  private readonly toast = inject(ToastService);
  private readonly movementToken = new RequestToken();

  readonly isMoving = signal(false);
  readonly movementOptions = computed(() => this.overview.state()?.movementOptions ?? []);
  readonly movementBlockReason = computed(() => this.resolveMovementBlockReason());

  canChooseMovementOption(option: HeroExplorationMovementOptionReadModel): boolean {
    return (
      !this.isMoving()
      && option.isAvailable
      && this.movementBlockReason() === null
      && this.movementOptionValidationError(option) === null
    );
  }

  movementOptionStatusLabel(option: HeroExplorationMovementOptionReadModel): string {
    if (!option.isAvailable) {
      return EXPLORATION_RUNTIME_COPY.movementUnavailableStatus;
    }

    return option.isBacktrack || option.stepKind === 'backtrack'
      ? EXPLORATION_RUNTIME_COPY.movementBacktrackStatus
      : EXPLORATION_RUNTIME_COPY.movementAvailableStatus;
  }

  movementOptionLabel(option: HeroExplorationMovementOptionReadModel): string {
    return option.label || EXPLORATION_RUNTIME_COPY.movementLabelMissing;
  }

  chooseMovementOption(option: HeroExplorationMovementOptionReadModel): void {
    const context = this.overview.currentContext();
    const state = this.overview.state();
    const exploration = state?.exploration;

    this.feedback.clear();

    if (!context || !state?.hasExploration || !exploration) {
      this.feedback.setError(null, EXPLORATION_RUNTIME_COPY.movementStartRequired);
      return;
    }

    const blockReason = this.movementBlockReason();

    const validationError = this.movementOptionValidationError(option);

    if (blockReason || !option.isAvailable || validationError) {
      this.feedback.setError(
        null,
        blockReason ?? validationError ?? EXPLORATION_RUNTIME_COPY.movementDirectionUnavailable,
      );
      return;
    }

    const token = this.movementToken.next();

    this.isMoving.set(true);
    this.explorations
      .startHeroExplorationStep({
        heroId: context.heroId,
        difficultyKey: context.difficultyKey,
        explorationId: exploration.id,
        edgeId: option.edgeId,
        stepKind: option.stepKind,
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
          if (
            !this.isCurrentMovement(
              token,
              context.serverId,
              context.heroId,
              context.difficultyKey,
              exploration.id,
            )
          ) {
            return;
          }

          this.minigameHandoff.clearMinigameReportPointer();
          this.overview.setStateFromWorkflow(nextState);
          this.toast.show(
            'success',
            EXPLORATION_RUNTIME_COPY.explorationToastTitle,
            EXPLORATION_RUNTIME_COPY.movementStarted,
          );
        },
        error: (error: unknown) => {
          if (
            !this.isCurrentMovement(
              token,
              context.serverId,
              context.heroId,
              context.difficultyKey,
              exploration.id,
            )
          ) {
            return;
          }

          this.feedback.setError(error, EXPLORATION_RUNTIME_COPY.movementStartStepFailed);
        },
      });
  }

  private resolveMovementBlockReason(): string | null {
    const state = this.overview.state();

    if (!state?.hasExploration || !state.exploration) {
      return EXPLORATION_RUNTIME_COPY.movementStartRequired;
    }

    if (state.activeChallenge) {
      return EXPLORATION_RUNTIME_COPY.movementActiveChallengeBlock;
    }

    if (state.activeStep) {
      return EXPLORATION_RUNTIME_COPY.movementActiveStepBlock;
    }

    if (!state.movementOptions.some((option) => option.isAvailable)) {
      return EXPLORATION_RUNTIME_COPY.movementNoAvailableDirections;
    }

    return null;
  }

  private isCurrentMovement(
    token: number,
    serverId: string,
    heroId: string,
    difficultyKey: string,
    explorationId: string,
  ): boolean {
    return (
      this.movementToken.isCurrent(token) &&
      this.overview.isCurrentContext(serverId, heroId, difficultyKey) &&
      this.overview.state()?.exploration?.id === explorationId
    );
  }

  private movementOptionValidationError(
    option: HeroExplorationMovementOptionReadModel,
  ): string | null {
    const stepKind = option.stepKind.trim();
    const isBacktrack = option.isBacktrack || stepKind === 'backtrack';

    if (!stepKind) {
      return EXPLORATION_RUNTIME_COPY.movementStepKindMissing;
    }

    if (isBacktrack) {
      if (stepKind !== 'backtrack') {
        return EXPLORATION_RUNTIME_COPY.movementBacktrackKindInvalid;
      }

      if (option.edgeId !== null) {
        return EXPLORATION_RUNTIME_COPY.movementBacktrackEdgeInvalid;
      }

      return null;
    }

    if (!option.edgeId) {
      return EXPLORATION_RUNTIME_COPY.movementEdgeMissing;
    }

    return null;
  }
}
