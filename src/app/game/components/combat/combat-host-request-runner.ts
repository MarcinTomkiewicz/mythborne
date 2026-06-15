import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize } from 'rxjs';
import { RequestToken } from '../../../core/utils/request-token';
import { sameSourceRef } from '../../../core/utils/source-ref';
import { MinigameSourceRef } from '../minigame-host/minigame-host.model';

@Injectable()
export class CombatHostRequestRunner {
  private readonly destroyRef = inject(DestroyRef);

  run<T>(input: {
    requestToken: RequestToken;
    currentSourceRef: () => MinigameSourceRef | null;
    sourceRef: MinigameSourceRef;
    request: Observable<T>;
    onSuccess: (result: T) => void;
    onError: (error: unknown) => void;
    onFinalize?: () => void;
    isCurrent?: () => boolean;
  }): void {
    const token = input.requestToken.next();
    const isCurrent = () =>
      input.requestToken.isCurrent(token) &&
      sameSourceRef(input.currentSourceRef(), input.sourceRef) &&
      (input.isCurrent?.() ?? true);

    input.request
      .pipe(
        finalize(() => {
          if (isCurrent()) {
            input.onFinalize?.();
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          if (isCurrent()) {
            input.onSuccess(result);
          }
        },
        error: (error: unknown) => {
          if (isCurrent()) {
            input.onError(error);
          }
        },
      });
  }
}
