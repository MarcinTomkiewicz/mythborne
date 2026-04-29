import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { finalize } from 'rxjs';
import { ModerationAction } from '../../domain/moderation/moderation-action.model';
import { ToastService } from '../ui/toast';
import { ModerationActions } from './moderation-actions';

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
  readonly history = signal<ModerationAction[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  loadHistory(serverId: string | null, canModerate: boolean): void {
    if (!serverId || !canModerate) {
      this.history.set([]);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.moderationActions
      .getVisibleActions({
        serverId,
        targetUserId: this.historyFilterForm.controls.targetUserId.value,
        targetHeroId: this.historyFilterForm.controls.targetHeroId.value,
      })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (actions) => this.history.set(actions),
        error: (error) => this.handleError('Moderation history failed', error),
      });
  }

  resetHistoryFilters(serverId: string | null, canModerate: boolean): void {
    this.historyFilterForm.reset({ targetUserId: '', targetHeroId: '' });
    this.loadHistory(serverId, canModerate);
  }

  reset(): void {
    this.history.set([]);
    this.historyFilterForm.reset({ targetUserId: '', targetHeroId: '' });
  }

  private handleError(summary: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.error.set(message);
    this.toast.show('error', summary, message);
  }
}
