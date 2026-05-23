import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  HeroExplorationMovementOptionReadModel,
} from '../../../core/domain/exploration/exploration-runtime.model';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';
import { ToastService } from '../../../core/services/ui/toast';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationOverviewState } from './exploration-overview.state';

@Injectable()
export class ExplorationMovementState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly explorations = inject(HeroExplorations);
  private readonly feedback = inject(ExplorationFeedbackState);
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
      return 'Niedostępna';
    }

    return option.isBacktrack || option.stepKind === 'backtrack'
      ? 'Powrót'
      : 'Dostępna ścieżka';
  }

  movementOptionLabel(option: HeroExplorationMovementOptionReadModel): string {
    return option.label || option.directionKey || option.stepKind;
  }

  chooseMovementOption(option: HeroExplorationMovementOptionReadModel): void {
    const context = this.overview.currentContext();
    const state = this.overview.state();
    const exploration = state?.exploration;

    this.feedback.clear();

    if (!context || !state?.hasExploration || !exploration) {
      this.feedback.setError(null, 'Rozpocznij eksplorację przed wyborem kierunku.');
      return;
    }

    const blockReason = this.movementBlockReason();

    const validationError = this.movementOptionValidationError(option);

    if (blockReason || !option.isAvailable || validationError) {
      this.feedback.setError(
        null,
        blockReason ?? validationError ?? 'Ten kierunek jest niedostępny.',
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
          if (!this.isCurrentMovement(token, context.heroId, context.difficultyKey, exploration.id)) {
            return;
          }

          this.overview.setStateFromWorkflow(nextState);
          this.toast.show('success', 'Eksploracja', 'Ruch został rozpoczęty.');
        },
        error: (error: unknown) => {
          if (!this.isCurrentMovement(token, context.heroId, context.difficultyKey, exploration.id)) {
            return;
          }

          this.feedback.setError(error, 'Nie udało się rozpocząć kroku eksploracji.');
        },
      });
  }

  private resolveMovementBlockReason(): string | null {
    const state = this.overview.state();

    if (!state?.hasExploration || !state.exploration) {
      return 'Rozpocznij eksplorację przed wyborem kierunku.';
    }

    if (state.activeChallenge) {
      return 'Rozstrzygnij aktywne wyzwanie przed dalszym ruchem.';
    }

    if (state.activeStep) {
      return 'Poczekaj na rozstrzygnięcie bieżącego kroku.';
    }

    if (!state.movementOptions.some((option) => option.isAvailable)) {
      return 'Brak dostępnych kierunków.';
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

  private movementOptionValidationError(
    option: HeroExplorationMovementOptionReadModel,
  ): string | null {
    const stepKind = option.stepKind.trim();
    const isBacktrack = option.isBacktrack || stepKind === 'backtrack';

    if (!stepKind) {
      return 'Ten kierunek nie ma poprawnego rodzaju ruchu.';
    }

    if (isBacktrack) {
      if (stepKind !== 'backtrack') {
        return 'Ścieżka powrotu nie ma poprawnego rodzaju ruchu.';
      }

      if (option.edgeId !== null) {
        return 'Ścieżka powrotu ma niepoprawne dane trasy.';
      }

      return null;
    }

    if (!option.edgeId) {
      return 'Ten kierunek nie ma poprawnego połączenia trasy.';
    }

    return null;
  }
}
