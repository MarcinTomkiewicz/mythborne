import {
  DestroyRef,
  Injectable,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService } from 'primeng/api';
import {
  Observable,
  catchError,
  defer,
  finalize,
  map,
  of,
  switchMap,
  take,
} from 'rxjs';
import { GAME_COPY_DEFAULT_LOCALE } from '../../../core/constants/game-copy.const';
import {
  MANUAL_TRIAL_COPY_KIND,
  MANUAL_TRIAL_EXIT_DIALOG_KEY,
} from '../../../core/constants/manual-trial.const';
import type { StructuredConfirmDialogContent } from '../../../core/interfaces/structured-dialog-content.interface';
import { ManualTrialFlow } from '../../../core/services/manual-trial/manual-trial-flow';
import { RequestToken } from '../../../core/utils/request-token';
import { plainStructuredConfirmMessage } from '../../../core/utils/structured-confirm-dialog/plain-structured-confirm-message';
import { MINIGAME_KEY } from '../../../core/domain/minigame/minigame-completion.model';
import { ExplorationManualTrialCopyState } from './exploration-manual-trial-copy.state';
import { ExplorationManualTrialRecoveryState } from './exploration-manual-trial-recovery.state';

@Injectable()
export class ExplorationManualTrialExitState {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly copyState = inject(ExplorationManualTrialCopyState);
  private readonly destroyRef = inject(DestroyRef);
  private readonly flow = inject(ManualTrialFlow);
  private readonly recovery = inject(ExplorationManualTrialRecoveryState);
  private readonly exitRequest = new RequestToken();
  private activeScopeKey: string | null = null;

  readonly dialogKey = MANUAL_TRIAL_EXIT_DIALOG_KEY;
  readonly isResolving = signal(false);
  readonly canExitManualSession = computed(() => {
    const offer = this.recovery.offer();

    return Boolean(
      offer
      && offer.minigameKey !== MINIGAME_KEY.combat
      && !offer.existingVerdictId
      && !this.recovery.verdict()
      && this.recovery.activeManualSessionId()
      && !this.isResolving(),
    );
  });
  readonly content = computed<StructuredConfirmDialogContent>(() => {
    const copy = this.copyState.copy();

    if (!copy) {
      return { message: { paragraphs: [] } };
    }

    return {
      header: {
        text: copy.exit.title,
        editTarget: {
          gameCopyKind: MANUAL_TRIAL_COPY_KIND,
          copyPath: 'exit.title',
          locale: GAME_COPY_DEFAULT_LOCALE,
        },
      },
      message: {
        paragraphs: [{ segments: [{ text: copy.exit.body, tone: 'plain' }] }],
        editTarget: {
          gameCopyKind: MANUAL_TRIAL_COPY_KIND,
          copyPath: 'exit.body',
          locale: GAME_COPY_DEFAULT_LOCALE,
        },
      },
      accept: {
        text: copy.exit.actions.confirm,
        editTarget: {
          gameCopyKind: MANUAL_TRIAL_COPY_KIND,
          copyPath: 'exit.actions.confirm',
          locale: GAME_COPY_DEFAULT_LOCALE,
        },
      },
      reject: {
        text: copy.exit.actions.cancel,
        editTarget: {
          gameCopyKind: MANUAL_TRIAL_COPY_KIND,
          copyPath: 'exit.actions.cancel',
          locale: GAME_COPY_DEFAULT_LOCALE,
        },
      },
    };
  });

  constructor() {
    effect(() => {
      const scopeKey = this.recovery.scopeKey();

      if (scopeKey === this.activeScopeKey) {
        return;
      }

      this.activeScopeKey = scopeKey;
      this.exitRequest.next();
      this.isResolving.set(false);
    });
  }

  requestExit(): void {
    this.confirmExit()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  resolveUnsupported(): void {
    if (this.canExitManualSession()) {
      this.requestExit();
    }
  }

  confirmExitBeforeNavigation(): Observable<boolean> {
    if (this.recovery.verdict()) {
      return of(true);
    }

    if (this.recovery.isOfferLoading() || this.isResolving()) {
      return of(false);
    }

    if (this.canExitManualSession()) {
      return this.confirmExit();
    }

    return this.recovery.hasManualRuntimeSessionReference()
      ? of(false)
      : of(true);
  }

  private confirmExit(): Observable<boolean> {
    return defer(() => {
      const copy = this.copyState.copy();
      const content = this.content();
      const header = content.header;
      const accept = content.accept;
      const reject = content.reject;

      if (
        !copy
        || !header
        || !accept
        || !reject
        || !this.canExitManualSession()
      ) {
        return of(false);
      }

      return new Observable<boolean>((subscriber) => {
        let settled = false;

        this.confirmationService.confirm({
          key: MANUAL_TRIAL_EXIT_DIALOG_KEY,
          header: header.text,
          message: plainStructuredConfirmMessage(content),
          acceptLabel: accept.text,
          rejectLabel: reject.text,
          acceptIcon: 'pi pi-check',
          rejectIcon: 'pi pi-times',
          closable: false,
          closeOnEscape: false,
          accept: () => {
            settled = true;
            subscriber.next(true);
            subscriber.complete();
          },
          reject: () => {
            settled = true;
            subscriber.next(false);
            subscriber.complete();
          },
        });

        return () => {
          if (!settled) {
            this.confirmationService.close();
          }
        };
      }).pipe(
        take(1),
        switchMap((accepted) => accepted ? this.exitToAutoResolve() : of(false)),
      );
    });
  }

  private exitToAutoResolve(): Observable<boolean> {
    return defer(() => {
      const offer = this.recovery.offer();
      const manualSessionId = this.recovery.activeManualSessionId();
      const scopeKey = this.recovery.scopeKey();

      if (!offer || !manualSessionId || !scopeKey || !this.canExitManualSession()) {
        return of(false);
      }

      const requestId = this.exitRequest.next();

      this.recovery.beginAction();
      this.isResolving.set(true);

      return this.flow.exitToAutoResolve(manualSessionId).pipe(
        map((verdict) => {
          if (!this.isCurrent(requestId, scopeKey, offer.attemptId)) {
            return false;
          }

          const currentOffer = this.recovery.offer();

          if (!currentOffer || currentOffer.attemptId !== offer.attemptId) {
            this.recovery.markActionUnavailable();
            return false;
          }

          return this.recovery.acceptActionVerdict(verdict, currentOffer);
        }),
        catchError(() => {
          if (this.isCurrent(requestId, scopeKey, offer.attemptId)) {
            this.recovery.markActionUnavailable();
          }

          return of(false);
        }),
        finalize(() => {
          if (this.isCurrent(requestId, scopeKey, offer.attemptId)) {
            this.isResolving.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      );
    });
  }

  private isCurrent(
    requestId: number,
    scopeKey: string,
    attemptId: string,
  ): boolean {
    return this.exitRequest.isCurrent(requestId)
      && this.recovery.isCurrentScope(scopeKey, attemptId);
  }
}
