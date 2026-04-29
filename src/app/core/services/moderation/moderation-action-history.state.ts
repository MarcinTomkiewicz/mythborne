import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { Observable, finalize } from 'rxjs';
import {
  ModerationAction,
  ModerationActionHistoryMode,
} from '../../domain/moderation/moderation-action.model';
import { trimToNull } from '../../utils/normalize-text';
import { ToastService } from '../ui/toast';
import { ModerationActions } from './moderation-actions';
import { ModerationTargetSearchState } from './moderation-target-search.state';

interface LoadHistoryOptions {
  notifyEmpty?: boolean;
  showValidation?: boolean;
}

@Injectable()
export class ModerationActionHistoryState {
  private readonly moderationActions = inject(ModerationActions);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly historyFilterForm = this.formBuilder.nonNullable.group({
    targetUserId: '',
    targetHeroId: '',
  });
  readonly targets = new ModerationTargetSearchState(
    this.moderationActions,
    this.destroyRef,
    {
      setUserTargetId: (userId) => {
        this.historyFilterForm.controls.targetUserId.setValue(userId);
        this.historyFilterForm.controls.targetUserId.markAsDirty();
        this.markHistoryFiltersChanged();
      },
      clearUserTargetId: () => {
        this.historyFilterForm.controls.targetUserId.setValue('');
        this.markHistoryFiltersChanged();
      },
      setHeroTargetIds: (userId, heroId) => {
        this.historyFilterForm.patchValue({ targetUserId: userId, targetHeroId: heroId });
        this.historyFilterForm.controls.targetUserId.markAsDirty();
        this.historyFilterForm.controls.targetHeroId.markAsDirty();
        this.markHistoryFiltersChanged();
      },
      clearHeroTargetId: () => {
        this.historyFilterForm.controls.targetHeroId.setValue('');
        this.markHistoryFiltersChanged();
      },
      setError: (summary, error) => this.handleError(summary, error),
    },
  );
  readonly history = signal<ModerationAction[]>([]);
  readonly historyMode = signal<ModerationActionHistoryMode>('visible');
  readonly canReadFullHistory = signal(false);
  readonly canSearchTargets = signal(false);
  readonly isLoading = signal(false);
  readonly isLoadingFullHistoryAccess = signal(false);
  readonly isLoadingTargetSearchAccess = signal(false);
  readonly hasLoadedHistory = signal(false);
  readonly warningMessage = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  loadFullHistoryAccess(serverId: string | null, canModerate: boolean): void {
    this.canReadFullHistory.set(false);
    this.warningMessage.set(null);

    if (this.historyMode() !== 'visible') {
      this.historyMode.set('visible');
    }

    if (!serverId || !canModerate) {
      return;
    }

    this.isLoadingFullHistoryAccess.set(true);
    this.moderationActions
      .canReadFullHistory(serverId)
      .pipe(
        finalize(() => this.isLoadingFullHistoryAccess.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (canRead) => {
          this.canReadFullHistory.set(canRead);
        },
        error: () => {
          this.canReadFullHistory.set(false);
          this.historyMode.set('visible');
        },
      });
  }

  loadTargetSearchAccess(serverId: string | null, canModerate: boolean): void {
    this.canSearchTargets.set(false);

    if (!serverId || !canModerate) {
      return;
    }

    this.isLoadingTargetSearchAccess.set(true);
    this.moderationActions
      .canSearchTargets(serverId)
      .pipe(
        finalize(() => this.isLoadingTargetSearchAccess.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (canSearch) => this.canSearchTargets.set(canSearch),
        error: () => this.canSearchTargets.set(false),
      });
  }

  setHistoryMode(
    mode: ModerationActionHistoryMode,
    serverId: string | null,
    canModerate: boolean,
  ): void {
    if (mode !== 'visible' && !this.canReadFullHistory()) {
      this.setBlockingWarning(
        'This account cannot read full moderation history in the selected server context.',
      );
      return;
    }

    this.warningMessage.set(null);
    this.historyMode.set(mode);

    if (mode === 'full_user' && !this.targetUserId()) {
      this.setBlockingWarning(
        'Select a user/account target before loading full user moderation history.',
      );
      return;
    }

    if (mode === 'full_hero' && !this.targetHeroId()) {
      this.setBlockingWarning(
        'Select a hero target before loading full hero moderation history.',
      );
      return;
    }

    this.clearHistoryResults();
  }

  loadHistory(
    serverId: string | null,
    canModerate: boolean,
    options: LoadHistoryOptions = {},
  ): void {
    if (!serverId || !canModerate) {
      this.history.set([]);
      this.hasLoadedHistory.set(false);
      return;
    }

    const request = this.historyRequest(serverId, options);

    if (!request) {
      return;
    }

    this.isLoading.set(true);
    this.hasLoadedHistory.set(false);
    this.warningMessage.set(null);
    this.error.set(null);
    request
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (actions) => {
          this.history.set(actions);
          this.hasLoadedHistory.set(true);
          if (!actions.length && options.notifyEmpty) {
            this.toast.show(
              'info',
              'History loaded',
              'No moderation actions match the current filters.',
            );
          }
        },
        error: (error) => this.handleError('Moderation history failed', error),
      });
  }

  resetHistoryFilters(): void {
    this.historyFilterForm.reset({ targetUserId: '', targetHeroId: '' });
    this.targets.reset();
    this.warningMessage.set(null);
    this.clearHistoryResults();
  }

  reset(): void {
    this.history.set([]);
    this.historyMode.set('visible');
    this.canReadFullHistory.set(false);
    this.canSearchTargets.set(false);
    this.hasLoadedHistory.set(false);
    this.historyFilterForm.reset({ targetUserId: '', targetHeroId: '' });
    this.targets.reset();
    this.warningMessage.set(null);
  }

  private historyRequest(
    serverId: string,
    options: LoadHistoryOptions,
  ): Observable<ModerationAction[]> | null {
    const targetUserId = this.targetUserId();
    const targetHeroId = this.targetHeroId();

    switch (this.historyMode()) {
      case 'visible':
        if (!targetUserId && !targetHeroId) {
          this.setOptionalBlockingWarning(
            'Select a user/account or hero target before refreshing moderation history.',
            options,
          );
          return null;
        }

        return this.moderationActions.getVisibleActions({
          serverId,
          targetUserId,
          targetHeroId,
        });
      case 'full_user':
        if (!this.canReadFullHistory()) {
          this.setBlockingWarning(
            'This account cannot read full moderation history in the selected server context.',
          );
          return null;
        }

        if (!targetUserId) {
          this.setOptionalBlockingWarning(
            'Select a user/account target before loading full user moderation history.',
            options,
          );
          return null;
        }

        return this.moderationActions.getFullUserHistory({
          serverId,
          userId: targetUserId,
        });
      case 'full_hero':
        if (!this.canReadFullHistory()) {
          this.setBlockingWarning(
            'This account cannot read full moderation history in the selected server context.',
          );
          return null;
        }

        if (!targetHeroId) {
          this.setOptionalBlockingWarning(
            'Select a hero target before loading full hero moderation history.',
            options,
          );
          return null;
        }

        return this.moderationActions.getFullHeroHistory({
          serverId,
          heroId: targetHeroId,
        });
    }
  }

  private handleError(summary: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.hasLoadedHistory.set(false);
    this.error.set(message);
    this.toast.show('error', summary, message);
  }

  private setBlockingWarning(message: string): void {
    this.clearHistoryResults();
    this.warningMessage.set(message);
  }

  private setOptionalBlockingWarning(
    message: string,
    options: LoadHistoryOptions,
  ): void {
    this.clearHistoryResults();

    if (options.showValidation) {
      this.warningMessage.set(message);
    }
  }

  private markHistoryFiltersChanged(): void {
    this.clearHistoryResults();
    this.warningMessage.set(null);
  }

  private clearHistoryResults(): void {
    this.history.set([]);
    this.hasLoadedHistory.set(false);
  }

  private targetUserId(): string | null {
    return trimToNull(this.historyFilterForm.controls.targetUserId.value);
  }

  private targetHeroId(): string | null {
    return trimToNull(this.historyFilterForm.controls.targetHeroId.value);
  }
}
