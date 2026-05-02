import { DestroyRef, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { finalize, Observable } from 'rxjs';
import { ToastService } from '../../../core/services/ui/toast';
import { getErrorMessage } from '../../../core/utils/error-message';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationTrialsPageState } from './exploration-trials-page.state';

export function markReasonInvalid(
  error: WritableSignal<string | null>,
  control: AbstractControl<string>,
): boolean {
  if (!control.invalid) {
    error.set(null);
    return false;
  }

  control.markAsTouched();
  error.set('Reason is required for this admin mutation.');
  return true;
}

export function nextSortOrder<T>(rows: readonly T[], sortOrder: (row: T) => number): number {
  return rows.reduce((max, row) => Math.max(max, sortOrder(row)), 0) + 10;
}

export function runTrialWorkflowAction<T>(params: {
  token: RequestToken;
  destroyRef: DestroyRef;
  page: ExplorationTrialsPageState;
  toast: ToastService;
  isSaving: WritableSignal<boolean>;
  guard: () => boolean;
  call: () => Observable<T>;
  successMessage: string;
  failureMessage: string;
  onSuccess?: (value: T) => void;
}): void {
  const token = params.token.next();

  params.isSaving.set(true);
  params.page.error.set(null);
  params.call()
    .pipe(
      finalize(() => {
        if (params.token.isCurrent(token)) {
          params.isSaving.set(false);
        }
      }),
      takeUntilDestroyed(params.destroyRef),
    )
    .subscribe({
      next: (value) => {
        if (!params.token.isCurrent(token) || !params.guard()) {
          return;
        }

        params.toast.show('success', 'Exploration trials', params.successMessage);
        params.onSuccess?.(value);
      },
      error: (error: unknown) => {
        if (!params.token.isCurrent(token) || !params.guard()) {
          return;
        }

        params.page.error.set(getErrorMessage(error, params.failureMessage));
      },
    });
}
