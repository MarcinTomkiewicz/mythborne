import {
  DestroyRef,
  Injectable,
  computed,
  inject,
  isDevMode,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  ExplorationDifficultyCopy,
  explorationDifficultyCardCopy,
} from '../../../core/domain/game-copy/exploration-difficulty-copy.model';
import { ExplorationRuntimeCopy } from '../../../core/domain/exploration/exploration-runtime-copy.model';
import { GameCopyService } from '../../../core/services/game-copy/game-copy.service';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationChallengeState } from './exploration-challenge.state';
import { ExplorationMinigameHandoffState } from './exploration-minigame-handoff.state';
import { ExplorationMovementState } from './exploration-movement.state';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationPreviewState } from './exploration-preview.state';
import { ExplorationRewardState } from './exploration-reward.state';
import { ExplorationSandboxToolState } from './exploration-sandbox-tool.state';
import { ExplorationStartState } from './exploration-start.state';
import { ExplorationStepState } from './exploration-step.state';

@Injectable()
export class ExplorationPageState {
  private readonly copyToken = new RequestToken();
  private readonly runtimeCopyToken = new RequestToken();
  private readonly destroyRef = inject(DestroyRef);
  private readonly gameCopy = inject(GameCopyService);

  readonly minigameHandoff = inject(ExplorationMinigameHandoffState);
  readonly overview = inject(ExplorationOverviewState);
  readonly movement = inject(ExplorationMovementState);
  readonly preview = inject(ExplorationPreviewState);
  readonly step = inject(ExplorationStepState);
  readonly challenge = inject(ExplorationChallengeState);
  readonly rewardState = inject(ExplorationRewardState);
  readonly sandbox = inject(ExplorationSandboxToolState);
  readonly start = inject(ExplorationStartState);

  readonly selectedDifficultyCardPreview = computed(() =>
    this.preview.difficultyCardPreview(this.overview.selectedDifficultyKey()),
  );
  readonly difficultyCopy = signal<ExplorationDifficultyCopy | null>(null);
  readonly runtimeCopy = signal<ExplorationRuntimeCopy | null>(null);
  readonly isDifficultyCopyLoading = signal(false);
  readonly isRuntimeCopyLoading = signal(false);
  readonly runtimeCopyError = signal(false);
  readonly hasRuntimeCopyError = computed(() => this.runtimeCopyError());
  readonly selectedDifficultyCopy = computed(() => {
    const copy = this.difficultyCopy();
    const difficultyKey = this.overview.selectedDifficultyKey();

    return copy && difficultyKey
      ? explorationDifficultyCardCopy(copy, difficultyKey)
      : null;
  });
  readonly isLoading = computed(() =>
    this.overview.isLoading()
    || this.start.isStarting()
    || this.isDifficultyCopyLoading(),
  );
  readonly difficultyEntryRequested = signal(false);
  readonly runtimeScreenRequested = signal(false);
  readonly canShowDirectionBoard = computed(() => {
    const state = this.overview.state();

    return Boolean(
      state?.hasExploration
      && state.exploration
      && !state.activeStep
      && !state.activeChallenge
      && this.movement.movementBlockReason() === null,
    );
  });
  readonly canShowDifficultyEntryAction = computed(() =>
    this.canShowDirectionBoard()
    && !this.movement.isMoving()
    && !this.step.activeStep()
    && !this.challenge.activeChallenge(),
  );
  readonly shouldShowDirectionBoardHeader = computed(() =>
    !this.step.currentStepResult()
    && !this.sandbox.sandboxChallengeResult(),
  );
  readonly shouldShowRuntimeScreen = computed(() => {
    const state = this.overview.state();

    if (
      this.difficultyEntryRequested()
      && !state?.activeStep
      && !state?.activeChallenge
    ) {
      return false;
    }

    return (
      this.runtimeScreenRequested()
      || Boolean(state?.activeStep)
      || Boolean(state?.activeChallenge)
      || Boolean(this.step.currentStepResult())
      || Boolean(this.sandbox.sandboxChallengeResult())
      || Boolean(this.minigameHandoff.currentMinigameReportPointer())
      || Boolean(this.rewardState.reward())
    );
  });

  loadData(): void {
    this.loadDifficultyCopy();
    this.loadRuntimeCopy();
    this.overview.loadData();
  }

  selectDifficulty(difficultyKey: string): void {
    this.difficultyEntryRequested.set(false);
    this.runtimeScreenRequested.set(false);
    this.overview.selectDifficulty(difficultyKey);
  }

  startSelectedDifficulty(): void {
    this.difficultyEntryRequested.set(false);
    this.start.startSelectedDifficulty(() => this.runtimeScreenRequested.set(true));
  }

  showDifficultyEntry(): void {
    const state = this.overview.state();

    if (state?.activeStep || state?.activeChallenge) {
      return;
    }

    this.difficultyEntryRequested.set(true);
    this.runtimeScreenRequested.set(false);
  }

  private loadDifficultyCopy(): void {
    const token = this.copyToken.next();

    this.isDifficultyCopyLoading.set(true);
    this.difficultyCopy.set(null);

    this.gameCopy
      .getCopy('player.exploration.difficulty', { locale: 'pl' })
      .pipe(
        finalize(() => {
          if (this.copyToken.isCurrent(token)) {
            this.isDifficultyCopyLoading.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (copy) => {
          if (!this.copyToken.isCurrent(token)) {
            return;
          }

          this.difficultyCopy.set(copy);
        },
        error: (error: unknown) => {
          if (!this.copyToken.isCurrent(token)) {
            return;
          }

          if (isDevMode()) {
            console.error('Exploration difficulty copy load failed.', error);
          }

          this.difficultyCopy.set(null);
        },
      });
  }

  private loadRuntimeCopy(): void {
    const token = this.runtimeCopyToken.next();

    this.isRuntimeCopyLoading.set(true);
    this.runtimeCopyError.set(false);
    this.runtimeCopy.set(null);

    this.gameCopy
      .getCopy('player.exploration.runtime', { locale: 'pl' })
      .pipe(
        finalize(() => {
          if (this.runtimeCopyToken.isCurrent(token)) {
            this.isRuntimeCopyLoading.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (copy) => {
          if (!this.runtimeCopyToken.isCurrent(token)) {
            return;
          }

          this.runtimeCopyError.set(false);
          this.runtimeCopy.set(copy);
        },
        error: (error: unknown) => {
          if (!this.runtimeCopyToken.isCurrent(token)) {
            return;
          }

          if (isDevMode()) {
            console.error('Exploration runtime copy load failed.', error);
          }

          this.runtimeCopyError.set(true);
          this.runtimeCopy.set(null);
        },
      });
  }
}
