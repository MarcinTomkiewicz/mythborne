import {
  DestroyRef,
  Injectable,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { GAME_COPY_DEFAULT_LOCALE } from '../../../core/constants/game-copy.const';
import { MANUAL_TRIAL_COPY_KIND } from '../../../core/constants/manual-trial.const';
import type { LoadingOverlayCopyEditTargets } from '../../../core/interfaces/loading-overlay.interface';
import type { ManualTrialCopy } from '../../../core/domain/manual-trial/manual-trial-copy.model';
import { GameCopy } from '../../../core/services/game-copy/game-copy';
import { GameCopySignalLoader } from '../../../core/services/game-copy/game-copy-signal-loader';
import { RequestToken } from '../../../core/utils/request-token';
import { GameCopyEditState } from '../../../shared/game-copy-edit/game-copy-edit.state';

@Injectable()
export class ExplorationManualTrialCopyState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly gameCopy = inject(GameCopy);
  private readonly gameCopyEdit = inject(GameCopyEditState);
  private readonly loader = inject(GameCopySignalLoader);
  private readonly refreshRevision = this.gameCopy.refreshRevision(
    MANUAL_TRIAL_COPY_KIND,
    GAME_COPY_DEFAULT_LOCALE,
  );
  private readonly request = new RequestToken();
  private handledRefreshRevision = 0;

  readonly copy = signal<ManualTrialCopy | null>(null);
  readonly isLoading = signal(false);
  readonly unavailable = signal(false);
  readonly loadingEditTargets = computed<LoadingOverlayCopyEditTargets | null>(() =>
    this.copy()
      ? {
          label: {
            gameCopyKind: MANUAL_TRIAL_COPY_KIND,
            copyPath: 'manual.loading',
            locale: GAME_COPY_DEFAULT_LOCALE,
          },
        }
      : null,
  );

  constructor() {
    effect(() => {
      const revision = this.refreshRevision();

      if (revision <= this.handledRefreshRevision) {
        return;
      }

      this.handledRefreshRevision = revision;

      if (this.copy()) {
        this.reload(true);
      }
    });
  }

  load(): void {
    if (this.copy() || this.isLoading()) {
      return;
    }

    this.reload(false);
  }

  private reload(preserveCurrent: boolean): void {
    this.loader.load({
      kind: MANUAL_TRIAL_COPY_KIND,
      args: { locale: GAME_COPY_DEFAULT_LOCALE },
      requestToken: this.request,
      destroyRef: this.destroyRef,
      loading: this.isLoading,
      target: this.copy,
      preserveCurrent,
      onStart: () => {
        if (!preserveCurrent) {
          this.unavailable.set(false);
        }
      },
      onSuccess: () => this.unavailable.set(false),
      onError: (_error, preservedCurrent) => {
        if (preservedCurrent) {
          this.gameCopyEdit.notifyRefreshFailure(
            MANUAL_TRIAL_COPY_KIND,
            GAME_COPY_DEFAULT_LOCALE,
          );
        } else {
          this.unavailable.set(true);
        }
      },
    });
  }
}
