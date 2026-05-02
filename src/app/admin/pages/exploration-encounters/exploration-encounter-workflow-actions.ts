import { DestroyRef, WritableSignal } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../core/services/ui/toast';
import { getErrorMessage } from '../../../core/utils/error-message';
import { RequestToken } from '../../../core/utils/request-token';
import { markReasonInvalid, nextSortOrder } from '../../../core/utils/admin-form-helpers';
import { ExplorationEncountersPageState } from './exploration-encounters-page.state';

export interface EncounterWorkflowAction<T> {
  token: RequestToken;
  destroyRef: DestroyRef;
  page: ExplorationEncountersPageState;
  toast: ToastService;
  isSaving: WritableSignal<boolean>;
  guard: () => boolean;
  call: () => Observable<T>;
  successMessage: string;
  failureMessage: string;
  onSuccess?: (value: T) => void;
}

export function runEncounterWorkflowAction<T>(action: EncounterWorkflowAction<T>): void {
  const token = action.token.next();

  action.isSaving.set(true);
  action.page.error.set(null);
  action
    .call()
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
        action.toast.show('success', 'Exploration encounters', action.successMessage);
        action.page.loadInitialData();
      },
      error: (error: unknown) => {
        if (!action.token.isCurrent(token) || !action.guard()) {
          return;
        }

        action.page.error.set(getErrorMessage(error, action.failureMessage));
      },
    });
}

export { markReasonInvalid, nextSortOrder };
