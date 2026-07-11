import { Injectable, computed, effect, inject } from '@angular/core';
import { ExplorationManualTrialCopyState } from './exploration-manual-trial-copy.state';
import { ExplorationManualTrialRecoveryState } from './exploration-manual-trial-recovery.state';
import { ExplorationPageState } from './exploration-page.state';

@Injectable()
export class ExplorationManualTrialState {
  private readonly copyState = inject(ExplorationManualTrialCopyState);
  private readonly page = inject(ExplorationPageState);
  private readonly recovery = inject(ExplorationManualTrialRecoveryState);

  readonly offer = this.recovery.offer;
  readonly manifest = this.recovery.manifest;
  readonly verdict = this.recovery.verdict;
  readonly workflowUnavailable = this.recovery.workflowUnavailable;
  readonly isInitialLoading = computed(() =>
    this.copyState.isLoading()
    || this.recovery.isOfferLoading()
    || this.page.isRuntimeCopyLoading(),
  );

  constructor() {
    effect(() => {
      if (this.recovery.scopeKey()) {
        this.copyState.load();
      }
    });
  }

  attachAttempt(attemptId: string): void {
    this.recovery.attachAttempt(attemptId);
  }

  detachAttempt(attemptId: string): void {
    this.recovery.detachAttempt(attemptId);
  }

}
