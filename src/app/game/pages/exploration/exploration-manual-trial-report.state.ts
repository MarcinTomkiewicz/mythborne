import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RPC } from '../../../core/constants/rpc.const';
import { activeHeroContextKey } from '../../../core/domain/hero/active-hero-context';
import type { ManualTrialBackendVerdict } from '../../../core/domain/manual-trial/manual-trial-core.model';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ManualTrialFlow } from '../../../core/services/manual-trial/manual-trial-flow';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationMinigameHandoffState } from './exploration-minigame-handoff.state';

@Injectable()
export class ExplorationManualTrialReportState {
  private readonly activeHero = inject(ActiveHero);
  private readonly destroyRef = inject(DestroyRef);
  private readonly flow = inject(ManualTrialFlow);
  private readonly minigameHandoff = inject(ExplorationMinigameHandoffState);
  private readonly request = new RequestToken();
  private readonly verdict = signal<ManualTrialBackendVerdict | null>(null);
  private readonly unavailable = signal(false);

  readonly errorContext = RPC.create_manual_trial_game_report;
  readonly currentUnavailable = computed(() => {
    const completion = this.minigameHandoff.currentMinigameCompletion();
    const verdict = this.verdict();

    return Boolean(
      this.unavailable()
      && completion
      && verdict
      && completion.sourceEntityId === verdict.attemptId
      && completion.resultId === verdict.verdictId,
    );
  });

  acceptVerdict(verdict: ManualTrialBackendVerdict): void {
    const requestId = this.request.next();

    this.unavailable.set(false);
    this.verdict.set(verdict);

    if (!verdict.report.gameReportId) {
      this.load(verdict, requestId);
    }
  }

  private load(
    verdict: ManualTrialBackendVerdict,
    requestId: number,
  ): void {
    const contextKey = activeHeroContextKey(this.activeHero.state());

    if (!contextKey) {
      this.unavailable.set(true);
      return;
    }

    this.flow.createReportHandoff(verdict.verdictId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (handoff) => {
          if (!this.isCurrent(requestId, contextKey, verdict)) {
            return;
          }

          if (handoff.attemptId !== verdict.attemptId) {
            this.unavailable.set(true);
            return;
          }

          this.minigameHandoff.attachCompletionReport(
            verdict.attemptId,
            verdict.verdictId,
            handoff.reportId,
          );
        },
        error: () => {
          if (this.isCurrent(requestId, contextKey, verdict)) {
            this.unavailable.set(true);
          }
        },
      });
  }

  private isCurrent(
    requestId: number,
    contextKey: string,
    verdict: ManualTrialBackendVerdict,
  ): boolean {
    return this.request.isCurrent(requestId)
      && activeHeroContextKey(this.activeHero.state()) === contextKey
      && this.verdict()?.verdictId === verdict.verdictId;
  }
}
