import { Observable } from 'rxjs';
import { HeroArmoryReadModel } from '../../domain/item/item-equipment.model';
import { getErrorMessage } from '../../utils/error-message';

export class ArmoryShelfMutationRunner {
  private requestId = 0;

  invalidate(): void {
    this.requestId++;
  }

  run(options: ArmoryShelfMutationRunnerOptions): void {
    const requestId = ++this.requestId;
    const contextKey = options.currentContextKey();

    options.setActionError(null);
    options.setActionMessage(null);

    if (!contextKey) {
      options.setActionError('No active hero for armory shelf action.');
      return;
    }

    options.setMutating(true);

    let request: Observable<HeroArmoryReadModel>;
    try {
      request = options.operation(
        requestId,
        contextKey,
        () => this.accepts(requestId, contextKey, options),
      );
    } catch (error: unknown) {
      if (requestId === this.requestId) {
        options.setMutating(false);
        options.setActionError(getErrorMessage(error, options.failureMessage));
      }
      return;
    }

    request.subscribe({
      next: (readModel) => {
        if (!this.accepts(requestId, contextKey, options)) {
          return;
        }

        options.applyReadModel(readModel);
        options.setMutating(false);
        options.setActionMessage(options.successMessage ?? null);
        options.afterResponse?.();
      },
      error: (error: unknown) => {
        if (!this.accepts(requestId, contextKey, options)) {
          return;
        }

        options.setMutating(false);
        if (options.hasCommitted?.()) {
          options.markReadModelError();
          options.setActionError(
            getErrorMessage(
              error,
              options.committedRefreshFailureMessage
                ?? options.failureMessage,
            ),
          );
          return;
        }

        options.setActionError(getErrorMessage(error, options.failureMessage));
      },
    });
  }

  private accepts(
    requestId: number,
    contextKey: string,
    options: ArmoryShelfMutationRunnerOptions,
  ): boolean {
    if (requestId !== this.requestId) {
      return false;
    }

    if (contextKey !== options.currentContextKey()) {
      options.markContextChanged();
      return false;
    }

    return true;
  }
}

interface ArmoryShelfMutationRunnerOptions {
  operation: (
    requestId: number,
    contextKey: string,
    acceptsCurrentContext: () => boolean,
  ) => Observable<HeroArmoryReadModel>;
  currentContextKey: () => string | null;
  applyReadModel: (readModel: HeroArmoryReadModel) => void;
  markContextChanged: () => void;
  markReadModelError: () => void;
  setActionError: (message: string | null) => void;
  setActionMessage: (message: string | null) => void;
  setMutating: (isMutating: boolean) => void;
  afterResponse?: () => void;
  successMessage?: string;
  failureMessage: string;
  committedRefreshFailureMessage?: string;
  hasCommitted?: () => boolean;
}
