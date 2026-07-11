import { Injectable, inject, isDevMode } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import type { GameCopySignalLoadOptions } from '../../interfaces/game-copy-signal-load.interface';
import type { GameCopyRegistryKind } from '../../types/game-copy-registry.types';
import { GameCopy } from './game-copy';

@Injectable({ providedIn: 'root' })
export class GameCopySignalLoader {
  private readonly gameCopy = inject(GameCopy);

  load<Kind extends GameCopyRegistryKind>(
    options: GameCopySignalLoadOptions<Kind>,
  ): void {
    const requestId = options.requestToken.next();

    if (!options.preserveCurrent) {
      options.loading.set(true);
      options.target.set(null);
    }

    options.onStart?.();

    this.gameCopy.getCopy(options.kind, options.args)
      .pipe(
        finalize(() => {
          if (
            options.requestToken.isCurrent(requestId)
            && !options.preserveCurrent
          ) {
            options.loading.set(false);
          }
        }),
        takeUntilDestroyed(options.destroyRef),
      )
      .subscribe({
        next: (copy) => {
          if (!options.requestToken.isCurrent(requestId)) {
            return;
          }

          options.target.set(copy);
          options.onSuccess?.();
        },
        error: (error: unknown) => {
          if (!options.requestToken.isCurrent(requestId)) {
            return;
          }

          if (!options.preserveCurrent) {
            options.target.set(null);
          }

          if (isDevMode()) {
            console.error(options.kind, error);
          }

          options.onError?.(error, options.preserveCurrent);
        },
      });
  }
}
