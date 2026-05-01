import { DestroyRef, Injectable, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { HeroExplorationDebugStateReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { HeroExplorationDebug } from '../../../core/services/exploration/hero-exploration-debug';
import { getErrorMessage } from '../../../core/utils/error-message';
import { RequestToken } from '../../../core/utils/request-token';
import {
  ExplorationDebugScope,
  ExplorationDebugScopeState,
} from './exploration-debug-scope.state';
import { ExplorationDebugFeedbackState } from './exploration-debug-feedback.state';

@Injectable()
export class ExplorationDebugRuntimeState {
  private readonly debug = inject(HeroExplorationDebug);
  private readonly scope = inject(ExplorationDebugScopeState);
  private readonly feedback = inject(ExplorationDebugFeedbackState);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadToken = new RequestToken();

  readonly debugState = signal<HeroExplorationDebugStateReadModel | null>(null);
  readonly isLoadingState = signal(false);

  constructor() {
    effect(() => {
      this.scope.scopeVersion();
      this.reset();
    });

    this.scope.scopeForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reset());
  }

  loadDebugState(showValidation = true): void {
    const scope = this.scope.currentScope(showValidation);

    if (!scope) {
      return;
    }

    this.loadForScope(scope, showValidation);
  }

  refreshCurrentScope(): void {
    const scope = this.scope.currentScope(false);

    if (scope) {
      this.loadForScope(scope, false);
    }
  }

  reset(): void {
    this.loadToken.next();
    this.debugState.set(null);
    this.isLoadingState.set(false);
  }

  private loadForScope(
    scope: ExplorationDebugScope,
    clearSuccess: boolean,
  ): void {
    const token = this.loadToken.next();

    this.isLoadingState.set(true);
    this.feedback.error.set(null);

    void clearSuccess;

    this.debug
      .getDebugState(scope)
      .pipe(
        finalize(() => {
          if (this.isCurrentLoad(token, scope)) {
            this.isLoadingState.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (state) => {
          if (!this.isCurrentLoad(token, scope)) {
            return;
          }

          this.debugState.set(state);
        },
        error: (error: unknown) => {
          if (!this.isCurrentLoad(token, scope)) {
            return;
          }

          this.errorFromLoad(error);
        },
      });
  }

  private isCurrentLoad(token: number, scope: ExplorationDebugScope): boolean {
    return this.loadToken.isCurrent(token) && this.scope.isCurrentScope(scope);
  }

  private errorFromLoad(error: unknown): void {
    this.errorSet(getErrorMessage(error, 'Failed to load exploration debug state.'));
  }

  private errorSet(message: string): void {
    this.feedback.error.set(message);
  }
}

