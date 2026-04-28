import { WritableSignal } from '@angular/core';
import { Observable, finalize } from 'rxjs';

export interface RequestStateOptions<T> {
  request$: Observable<T>;
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  message?: WritableSignal<string | null>;
  successMessage?: string;
  errorMessage: string;
  onSuccess: (value: T) => void;
  onSuccessMessage?: (message: string) => void;
  onError?: (message: string) => void;
  clearMessage?: boolean;
}

export function runRequest<T>(options: RequestStateOptions<T>): void {
  options.error.set(null);

  if (options.clearMessage ?? true) {
    options.message?.set(null);
  }

  options.loading.set(true);

  options.request$
    .pipe(finalize(() => options.loading.set(false)))
    .subscribe({
      next: (value) => {
        if (options.successMessage) {
          options.message?.set(options.successMessage);
          options.onSuccessMessage?.(options.successMessage);
        }

        options.onSuccess(value);
      },
      error: (error: unknown) => {
        const message =
          error instanceof Error ? error.message : options.errorMessage;

        options.error.set(message);
        options.onError?.(message);
      },
    });
}
