import {
  DestroyRef,
  Injectable,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { GAME_COPY_DEFAULT_LOCALE } from '../../../core/constants/game-copy.const';
import {
  type ExplorationDifficultyCopy,
  isExplorationDifficultyCopyKey,
} from '../../../core/domain/game-copy/exploration-difficulty-copy.model';
import {
  EXPLORATION_RUNTIME_COPY_LOCALES,
  type ExplorationRuntimeCopy,
} from '../../../core/domain/exploration/exploration-runtime-copy.model';
import { GameCopy } from '../../../core/services/game-copy/game-copy';
import { GameCopySignalLoader } from '../../../core/services/game-copy/game-copy-signal-loader';
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
  private readonly loader = inject(GameCopySignalLoader);
  private readonly difficultyCopyRevision = this.gameCopy.refreshRevision(
    'player.exploration.difficulty',
    GAME_COPY_DEFAULT_LOCALE,
  );
  private readonly runtimeCopyRevisions = EXPLORATION_RUNTIME_COPY_LOCALES.map(
    (locale) => ({
      locale,
      revision: this.gameCopy.refreshRevision(
        'player.exploration.runtime',
        locale,
      ),
      handled: 0,
    }),
  );
  private handledDifficultyCopyRevision = 0;

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
  readonly selectedDifficultyCopy = computed(() => {
    const copy = this.difficultyCopy();
    const difficultyKey = this.overview.selectedDifficultyKey();

    return copy && difficultyKey && isExplorationDifficultyCopyKey(difficultyKey)
      ? copy.difficulty.cards[difficultyKey] ?? null
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
      || Boolean(this.minigameHandoff.currentMinigameCompletion())
      || Boolean(this.rewardState.reward())
    );
  });

  constructor() {
    effect(() => {
      const revision = this.difficultyCopyRevision();

      if (revision > this.handledDifficultyCopyRevision) {
        this.handledDifficultyCopyRevision = revision;

        if (this.difficultyCopy()) {
          this.loadDifficultyCopy(true);
        }
      }
    });
    effect(() => {
      const currentLocale = this.runtimeCopy()?.locale;

      for (const tracked of this.runtimeCopyRevisions) {
        const revision = tracked.revision();

        if (revision <= tracked.handled) {
          continue;
        }

        tracked.handled = revision;

        if (currentLocale === tracked.locale) {
          this.loadRuntimeCopy(true, tracked.locale);
        }
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

  private loadDifficultyCopy(background = false): void {
    this.loader.load({
      kind: 'player.exploration.difficulty',
      args: { locale: GAME_COPY_DEFAULT_LOCALE },
      requestToken: this.copyToken,
      destroyRef: this.destroyRef,
      loading: this.isDifficultyCopyLoading,
      target: this.difficultyCopy,
      preserveCurrent: background,
      onStart: () => this.difficultyCopyError.set(false),
      onSuccess: () => this.difficultyCopyError.set(false),
      onError: (_error, preservedCurrent) => {
        this.difficultyCopyError.set(true);

        if (preservedCurrent) {
          this.gameCopyEdit.notifyRefreshFailure(
            'player.exploration.difficulty',
            GAME_COPY_DEFAULT_LOCALE,
          );
        }
      },
    });
  }

  private loadRuntimeCopy(
    background = false,
    locale = GAME_COPY_DEFAULT_LOCALE,
  ): void {
    this.loader.load({
      kind: 'player.exploration.runtime',
      args: { locale },
      requestToken: this.runtimeCopyToken,
      destroyRef: this.destroyRef,
      loading: this.isRuntimeCopyLoading,
      target: this.runtimeCopy,
      preserveCurrent: background,
      onStart: () => this.runtimeCopyError.set(false),
      onSuccess: () => this.runtimeCopyError.set(false),
      onError: (_error, preservedCurrent) => {
        this.runtimeCopyError.set(true);

        if (preservedCurrent) {
          this.gameCopyEdit.notifyRefreshFailure(
            'player.exploration.runtime',
            locale,
          );
        }
      },
    });
  }
}
