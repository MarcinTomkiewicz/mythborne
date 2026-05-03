import { DestroyRef, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { Observable, finalize } from 'rxjs';
import { ToastService } from '../../../core/services/ui/toast';
import { getErrorMessage } from '../../../core/utils/error-message';
import { RequestToken } from '../../../core/utils/request-token';

export interface CombatOpponentWorkflowAction<T> {
  token: RequestToken;
  destroyRef: DestroyRef;
  toast: ToastService;
  isSaving: WritableSignal<boolean>;
  setError: (message: string | null) => void;
  call: () => Observable<T>;
  successMessage: string;
  failureMessage: string;
  onSuccess?: (value: T) => void;
}

export function runCombatOpponentWorkflowAction<T>(
  action: CombatOpponentWorkflowAction<T>,
): void {
  const token = action.token.next();

  action.isSaving.set(true);
  action.setError(null);
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
        if (!action.token.isCurrent(token)) {
          return;
        }

        action.onSuccess?.(value);
        action.toast.show('success', 'Combat opponents', action.successMessage);
      },
      error: (error: unknown) => {
        if (action.token.isCurrent(token)) {
          action.setError(getErrorMessage(error, action.failureMessage));
        }
      },
    });
}

export function markCombatOpponentReasonInvalid(
  reasonError: WritableSignal<string | null>,
  reason: FormControl<string>,
): boolean {
  reason.markAsTouched();

  if (reason.value.trim().length > 0) {
    reasonError.set(null);
    return false;
  }

  reasonError.set('Reason is required for this admin mutation.');
  return true;
}
