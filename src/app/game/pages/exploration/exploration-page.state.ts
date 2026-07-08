import {
  DestroyRef,
  Injectable,
  WritableSignal,
  computed,
  effect,
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
import { GameCopy } from '../../../core/services/game-copy/game-copy';
import {
  GameCopyRegistry,
} from '../../../core/types/game-copy-registry.types';
import { RequestToken } from '../../../core/utils/request-token';
import { GameCopyEditState } from '../../../shared/game-copy-edit/game-copy-edit.state';
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
  private readonly gameCopy = inject(GameCopy);
  private readonly difficultyCopyRevision = this.gameCopy.refreshRevision(
    'player.exploration.difficulty',
    'pl',
  );

  readonly minigameHandoff = inject(ExplorationMinigameHandoffState);
  readonly overview = inject(ExplorationOverviewState);
  readonly movement = inject(ExplorationMovementState);
  readonly preview = inject(ExplorationPreviewState);
  readonly step = inject(ExplorationStepState);
  readonly challenge = inject(ExplorationChallengeState);
  readonly rewardState = inject(ExplorationRewardState);
  readonly sandbox = inject(ExplorationSandboxToolState);
  readonly start = inject(ExplorationStartState);
  readonly gameCopyEdit = inject(GameCopyEditState);

  readonly selectedDifficultyCardPreview = computed(() =>
    this.preview.difficultyCardPreview(this.overview.selectedDifficultyKey()),
  );
  readonly difficultyCopy = signal<ExplorationDifficultyCopy | null>(null);
  readonly runtimeCopy = signal<ExplorationRuntimeCopy | null>(null);
  readonly isDifficultyCopyLoading = signal(false);
  readonly isRuntimeCopyLoading = signal(false);
  readonly difficultyCopyError = signal(false);
  readonly runtimeCopyError = signal(false);
  readonly hasDifficultyCopyError = computed(() => this.difficultyCopyError());
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

  constructor() {
    effect(() => {
      if (this.difficultyCopyRevision() > 0) {
        this.loadDifficultyCopy();
      }
    });
  }

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
    this.loadPageCopy(
      'player.exploration.difficulty',
      this.copyToken,
      this.isDifficultyCopyLoading,
      this.difficultyCopyError,
      this.difficultyCopy,
    );
  }

  private loadRuntimeCopy(): void {
    this.loadPageCopy(
      'player.exploration.runtime',
      this.runtimeCopyToken,
      this.isRuntimeCopyLoading,
      this.runtimeCopyError,
      this.runtimeCopy,
    );
  }

  private loadPageCopy<
    K extends 'player.exploration.difficulty' | 'player.exploration.runtime',
  >(
    kind: K,
    requestToken: RequestToken,
    loading: WritableSignal<boolean>,
    errorState: WritableSignal<boolean>,
    target: WritableSignal<GameCopyRegistry[K] | null>,
  ): void {
    const token = requestToken.next();

    loading.set(true);
    errorState.set(false);
    target.set(null);

    this.gameCopy
      .getCopy(kind, { locale: 'pl' })
      .pipe(
        finalize(() => {
          if (requestToken.isCurrent(token)) {
            loading.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (copy) => {
          if (!requestToken.isCurrent(token)) {
            return;
          }

          errorState.set(false);
          target.set(copy);
        },
        error: (error: unknown) => {
          if (!requestToken.isCurrent(token)) {
            return;
          }

          if (isDevMode()) {
            console.error(kind, error);
          }

          errorState.set(true);
          target.set(null);
        },
      });
  }
}
