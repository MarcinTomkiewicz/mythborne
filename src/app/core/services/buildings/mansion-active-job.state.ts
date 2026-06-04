import { DestroyRef, Injectable, Signal, effect, inject, signal } from '@angular/core';
import { switchMap } from 'rxjs';
import {
  EstateBuildingJob,
  PlayerEstatePageContextV3,
} from '../../domain/estate/player-estate-page-context.model';
import { toBuildingDurationLabel } from '../../utils/building-display';
import { getErrorMessage } from '../../utils/error-message';
import { PlayerDashboardShellState } from '../hero/player-dashboard-shell-state';
import { PlayerEstate } from '../estate/player-estate';
import { Platform } from '../platform/platform';
import { ToastService } from '../ui/toast';
import { BuildingJobs } from './building-jobs';

const ACTIVE_JOB_SETTLEMENT_RETRY_COOLDOWN_MS = 5000;

@Injectable()
export class MansionActiveJobState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly playerEstate = inject(PlayerEstate);
  private readonly dashboardShellState = inject(PlayerDashboardShellState);
  private readonly platform = inject(Platform);
  private readonly toast = inject(ToastService);
  private readonly buildingJobs = inject(BuildingJobs);

  readonly settlingActiveJobId = signal<string | null>(null);
  readonly nowMs = signal(Date.now());

  private context: Signal<PlayerEstatePageContextV3 | null> | null = null;
  private applyContext: ((context: PlayerEstatePageContextV3) => void) | null = null;
  private acceptsContext: ((context: PlayerEstatePageContextV3) => boolean) | null = null;
  private contextKey: ((context: PlayerEstatePageContextV3 | null) => string | null) | null = null;
  private isCurrentContextKey: ((contextKey: string | null) => boolean) | null = null;
  private settlementRequestId = 0;
  private readonly secondsUntilCompletionBaselines = new Map<
    string,
    { remainingSeconds: number; capturedAtMs: number }
  >();
  private readonly settlementRetries = new Map<
    string,
    { attemptCount: number; nextAttemptAtMs: number }
  >();
  private readonly settleDueActiveJobEffect = effect(() => {
    if (!this.platform.isBrowser) {
      return;
    }

    const job = this.context?.()?.estateRuntimeState?.active_job_json ?? null;

    if (!job || this.activeJobRemainingSeconds(job) !== 0) {
      return;
    }

    queueMicrotask(() => this.settleDueActiveJob(job));
  });

  constructor() {
    this.startActiveJobClock();
  }

  configure(input: {
    context: Signal<PlayerEstatePageContextV3 | null>;
    applyContext: (context: PlayerEstatePageContextV3) => void;
    acceptsContext: (context: PlayerEstatePageContextV3) => boolean;
    contextKey: (context: PlayerEstatePageContextV3 | null) => string | null;
    isCurrentContextKey: (contextKey: string | null) => boolean;
  }): void {
    this.context = input.context;
    this.applyContext = input.applyContext;
    this.acceptsContext = input.acceptsContext;
    this.contextKey = input.contextKey;
    this.isCurrentContextKey = input.isCurrentContextKey;
  }

  activeJobCountdownLabel(job: EstateBuildingJob): string | null {
    const remainingSeconds = this.activeJobRemainingSeconds(job);

    return remainingSeconds === null
      ? null
      : toBuildingDurationLabel(remainingSeconds);
  }

  activeJobProgress(job: EstateBuildingJob): number {
    if (job.isDue === true) {
      return 100;
    }

    if (!job.startedAt) {
      return 0;
    }

    const startedAt = new Date(job.startedAt).getTime();
    const completesAt = this.activeJobCompletionMs(job);

    if (completesAt === null) {
      return 0;
    }

    const totalMs = completesAt - startedAt;

    if (!Number.isFinite(totalMs) || totalMs <= 0) {
      return 0;
    }

    const progress = ((this.nowMs() - startedAt) / totalMs) * 100;

    return Math.round(Math.min(Math.max(progress, 0), 100));
  }

  private settleDueActiveJob(job: EstateBuildingJob): void {
    const context = this.context?.() ?? null;
    const estate = context?.estateRuntimeState;
    const activeJob = estate?.active_job_json;
    const contextKey = this.contextKey?.(context) ?? null;

    if (
      !context
      || !estate
      || activeJob?.jobId !== job.jobId
      || this.settlingActiveJobId()
      || !this.canAttemptActiveJobSettlement(job.jobId)
    ) {
      return;
    }

    const requestId = ++this.settlementRequestId;

    this.recordActiveJobSettlementAttempt(job.jobId);
    this.settlingActiveJobId.set(job.jobId);

    this.buildingJobs.finalizeHeroEstateBuildingJobs(context.hero.id).pipe(
      switchMap((result) => {
        if (
          result.heroId !== context.hero.id
          || result.serverId !== context.hero.server_id
          || result.estateId !== estate.estate_id
        ) {
          console.error({
            estateActiveJobSettlement: {
              jobId: job.jobId,
              estateId: estate.estate_id,
              result,
            },
          });

          throw new Error();
        }

        return this.playerEstate.getPageContext();
      }),
    ).subscribe({
      next: (nextContext) => {
        if (
          requestId !== this.settlementRequestId
          || this.isCurrentContextKey?.(contextKey) !== true
          || this.acceptsContext?.(nextContext) !== true
        ) {
          this.clearSettlingJob(requestId);
          return;
        }

        this.applyContext?.(nextContext);
        this.dashboardShellState.refreshActiveDashboardContext();
        this.handleActiveJobSettlementReload(job.jobId, nextContext);
        this.clearSettlingJob(requestId);
      },
      error: (error: unknown) => {
        if (
          requestId !== this.settlementRequestId
          || this.isCurrentContextKey?.(contextKey) !== true
        ) {
          this.clearSettlingJob(requestId);
          return;
        }

        const message = getErrorMessage(error, '');
        this.handleActiveJobSettlementFailure(job.jobId);

        if (message) {
          this.toast.show('error', context.copyJson.summary.activeJob, message);
        }

        this.clearSettlingJob(requestId);
      },
    });
  }

  private activeJobRemainingSeconds(job: EstateBuildingJob): number | null {
    if (job.isDue === true) {
      return 0;
    }

    const completesAt = this.activeJobCompletionMs(job);

    if (completesAt !== null) {
      return Math.max(Math.ceil((completesAt - this.nowMs()) / 1000), 0);
    }

    return null;
  }

  private activeJobCompletionMs(job: EstateBuildingJob): number | null {
    if (job.completesAt) {
      const completesAt = new Date(job.completesAt).getTime();

      if (Number.isFinite(completesAt)) {
        return completesAt;
      }
    }

    const baseline = this.secondsUntilCompletionBaseline(job);

    return baseline
      ? baseline.capturedAtMs + baseline.remainingSeconds * 1000
      : null;
  }

  private secondsUntilCompletionBaseline(
    job: EstateBuildingJob,
  ): { remainingSeconds: number; capturedAtMs: number } | null {
    if (job.secondsUntilCompletion === undefined) {
      return null;
    }

    const existing = this.secondsUntilCompletionBaselines.get(job.jobId);

    if (existing) {
      return existing;
    }

    const baseline = {
      remainingSeconds: Math.max(job.secondsUntilCompletion, 0),
      capturedAtMs: this.nowMs(),
    };

    this.secondsUntilCompletionBaselines.set(job.jobId, baseline);

    return baseline;
  }

  private canAttemptActiveJobSettlement(jobId: string): boolean {
    const retry = this.settlementRetries.get(jobId);

    if (!retry) {
      return true;
    }

    return this.nowMs() >= retry.nextAttemptAtMs;
  }

  private recordActiveJobSettlementAttempt(jobId: string): void {
    const retry = this.settlementRetries.get(jobId);

    this.settlementRetries.set(jobId, {
      attemptCount: (retry?.attemptCount ?? 0) + 1,
      nextAttemptAtMs: Number.POSITIVE_INFINITY,
    });
  }

  private handleActiveJobSettlementReload(
    jobId: string,
    context: PlayerEstatePageContextV3,
  ): void {
    const activeJob = context.estateRuntimeState?.active_job_json;

    if (activeJob?.jobId !== jobId) {
      this.settlementRetries.delete(jobId);
      this.secondsUntilCompletionBaselines.delete(jobId);
      return;
    }

    console.error({
      estateActiveJobSettlement: {
        jobId,
        activeJobId: activeJob?.jobId ?? null,
        estateId: context.estateRuntimeState?.estate_id ?? null,
      },
    });
    this.handleActiveJobSettlementFailure(jobId);
  }

  private handleActiveJobSettlementFailure(jobId: string): void {
    const retry = this.settlementRetries.get(jobId);

    this.settlementRetries.set(jobId, {
      attemptCount: retry?.attemptCount ?? 1,
      nextAttemptAtMs: this.nowMs() + ACTIVE_JOB_SETTLEMENT_RETRY_COOLDOWN_MS,
    });
  }

  private startActiveJobClock(): void {
    if (!this.platform.isBrowser) {
      return;
    }

    const intervalId = window.setInterval(() => {
      this.nowMs.set(Date.now());
    }, 1000);

    this.destroyRef.onDestroy(() => {
      window.clearInterval(intervalId);
    });
  }

  private clearSettlingJob(requestId: number): void {
    if (requestId === this.settlementRequestId) {
      this.settlingActiveJobId.set(null);
    }
  }
}
