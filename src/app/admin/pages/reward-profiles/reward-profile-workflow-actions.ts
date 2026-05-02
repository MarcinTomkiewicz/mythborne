import { DestroyRef, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize } from 'rxjs';
import { ToastService } from '../../../core/services/ui/toast';
import { getErrorMessage } from '../../../core/utils/error-message';
import { RequestToken } from '../../../core/utils/request-token';
import { RewardProfilesPageState } from './reward-profiles-page.state';

export interface RewardProfileWorkflowAction<T> {
  token: RequestToken;
  destroyRef: DestroyRef;
  page: RewardProfilesPageState;
  toast: ToastService;
  isSaving: WritableSignal<boolean>;
  guard: () => boolean;
  call: () => Observable<T>;
  successMessage: string;
  failureMessage: string;
  onSuccess?: (value: T) => void;
}

export function runRewardProfileWorkflowAction<T>(
  action: RewardProfileWorkflowAction<T>,
): void {
  const token = action.token.next();

  action.isSaving.set(true);
  action.page.error.set(null);
  action.call()
    .pipe(
      finalize(() => {
        if (action.token.isCurrent(token)) {
          action.isSaving.set(false);
        }
      }),
      takeUntilDestroyed(action.destroyRef),
    )
    .subscribe({
      next: (value) => {
        if (!action.token.isCurrent(token) || !action.guard()) {
          return;
        }

        action.onSuccess?.(value);
        action.toast.show('success', 'Reward profiles', action.successMessage);
        action.page.loadInitialData();
      },
      error: (error: unknown) => {
        if (action.token.isCurrent(token) && action.guard()) {
          action.page.error.set(getErrorMessage(error, action.failureMessage));
        }
      },
    });
}
