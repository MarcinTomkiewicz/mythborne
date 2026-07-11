import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import type { CombatHostRequestRunnerInput } from '../../../core/interfaces/combat-host-runner.interface';
import { sameSourceRef } from '../../../core/utils/source-ref';

@Injectable()
export class CombatHostRequestRunner {
  private readonly destroyRef = inject(DestroyRef);

  run<T>(input: CombatHostRequestRunnerInput<T>): void {
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
