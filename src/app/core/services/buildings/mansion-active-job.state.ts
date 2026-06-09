import { DestroyRef, Injectable, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { MansionBuildingJobFinalization } from '../../domain/building/building.model';
import {
  EstateBuildingJob,
  PlayerEstatePageContextV3,
} from '../../domain/estate/player-estate-page-context.model';
import {
  ActiveJobSettlementAttempt,
  MansionActiveJobBindings,
} from '../../interfaces/building/mansion-active-job-settlement.interface';
import { toBuildingDurationLabel } from '../../utils/building-display';
import { getErrorMessage } from '../../utils/error-message';
import { ActiveHeroRuntimeInvalidation } from '../hero/active-hero-runtime-invalidation';
import { PlayerEstate } from '../estate/player-estate';
import { Platform } from '../platform/platform';
import { ToastService } from '../ui/toast';
import { BuildingJobs } from './building-jobs';

const ACTIVE_JOB_SETTLEMENT_RETRY_COOLDOWN_MS = 5000;

@Injectable()
export class MansionActiveJobState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly playerEstate = inject(PlayerEstate);
  private readonly runtimeInvalidation = inject(ActiveHeroRuntimeInvalidation);
  private readonly platform = inject(Platform);
  private readonly toast = inject(ToastService);
  private readonly buildingJobs = inject(BuildingJobs);

  readonly settlingActiveJobId = signal<string | null>(null);
  readonly nowMs = signal(Date.now());

  private bindings: MansionActiveJobBindings | null = null;
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

    const job = this.currentActiveJob();

    if (!job || this.activeJobRemainingSeconds(job) !== 0) {
      return;
    }

    queueMicrotask(() => this.settleDueActiveJob(job));
  });

  constructor() {
    this.startActiveJobClock();
  }

  configure(input: MansionActiveJobBindings): void {
    this.bindings = input;
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
    const attempt = this.createSettlementAttempt(job);

    if (!attempt) {
      return;
    }

    this.runSettlementAttempt(attempt);
  }

  private runSettlementAttempt(attempt: ActiveJobSettlementAttempt): void {
    this.buildingJobs.finalizeHeroEstateBuildingJobs(attempt.context.hero.id).pipe(
      switchMap((result) => this.reloadAfterCommittedSettlement(attempt, result)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (nextContext) => this.handleSettlementReloadSuccess(attempt, nextContext),
      error: (error: unknown) => this.handleSettlementError(attempt, error),
    });
  }

  private createSettlementAttempt(
    job: EstateBuildingJob,
  ): ActiveJobSettlementAttempt | null {
    const bindings = this.requireBindings();
    const context = bindings.context();

    if (!context) {
      return null;
    }

    const estate = context.estateRuntimeState;

    if (!estate) {
      return null;
    }

    const activeJob = estate.active_job_json;

    if (
      !activeJob
      || activeJob.jobId !== job.jobId
      || this.settlingActiveJobId()
      || !this.canAttemptActiveJobSettlement(job.jobId)
    ) {
      return null;
    }

    const requestId = ++this.settlementRequestId;
    const contextKey = bindings.contextKey(context);

    if (!contextKey) {
      return null;
    }

    this.recordActiveJobSettlementAttempt(job.jobId);
    this.settlingActiveJobId.set(job.jobId);

    return {
      requestId,
      job,
      context,
      estate,
      contextKey,
      bindings,
    };
  }

  private reloadAfterCommittedSettlement(
    attempt: ActiveJobSettlementAttempt,
    result: MansionBuildingJobFinalization,
  ) {
    this.assertSettlementResultMatchesAttempt(result, attempt);
    this.invalidateDashboardAfterSettlement(result);

    return this.playerEstate.getPageContext();
  }

  private assertSettlementResultMatchesAttempt(
    result: MansionBuildingJobFinalization,
    attempt: ActiveJobSettlementAttempt,
  ): void {
    if (
      result.heroId === attempt.context.hero.id
      && result.serverId === attempt.context.hero.server_id
      && result.estateId === attempt.estate.estate_id
    ) {
      return;
    }

    throw new Error(
      `Finalized estate building job result does not match active attempt for job ${attempt.job.jobId}.`,
    );
  }

  private invalidateDashboardAfterSettlement(
    result: MansionBuildingJobFinalization,
  ): void {
    this.runtimeInvalidation.invalidateActiveHeroDashboardContext(
      'estate_building_job_finalized',
      { serverId: result.serverId, heroId: result.heroId },
    );
  }

  private handleSettlementReloadSuccess(
    attempt: ActiveJobSettlementAttempt,
    nextContext: PlayerEstatePageContextV3,
  ): void {
    if (
      !this.isCurrentSettlementAttempt(attempt) ||
      !attempt.bindings.acceptsContext(nextContext)
    ) {
      this.clearSettlingJob(attempt.requestId);
      return;
    }

    attempt.bindings.applyContext(nextContext);
    this.handleActiveJobSettlementReload(attempt.job.jobId, nextContext);
    this.clearSettlingJob(attempt.requestId);
  }

  private handleSettlementError(
    attempt: ActiveJobSettlementAttempt,
    error: unknown,
  ): void {
    if (!this.isCurrentSettlementAttempt(attempt)) {
      this.clearSettlingJob(attempt.requestId);
      return;
    }

    const message = getErrorMessage(error, '');

    this.handleActiveJobSettlementFailure(attempt.job.jobId);

    if (message) {
      this.toast.show('error', attempt.context.copyJson.summary.activeJob, message);
    }

    this.clearSettlingJob(attempt.requestId);
  }

  private isCurrentSettlementAttempt(attempt: ActiveJobSettlementAttempt): boolean {
    return (
      attempt.requestId === this.settlementRequestId &&
      attempt.bindings.isCurrentContextKey(attempt.contextKey)
    );
  }

  private currentConfiguredContext(): PlayerEstatePageContextV3 | null {
    if (!this.bindings) {
      return null;
    }

    return this.bindings.context();
  }

  private currentActiveJob(): EstateBuildingJob | null {
    const context = this.currentConfiguredContext();

    if (!context) {
      return null;
    }

    const estate = context.estateRuntimeState;

    if (!estate) {
      return null;
    }

    return estate.active_job_json;
  }

  private requireBindings(): MansionActiveJobBindings {
    if (!this.bindings) {
      throw new Error('Mansion active job state must be configured before settlement.');
    }

    return this.bindings;
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
    const attemptCount = retry ? retry.attemptCount + 1 : 1;

    this.settlementRetries.set(jobId, {
      attemptCount,
      nextAttemptAtMs: this.nowMs() + ACTIVE_JOB_SETTLEMENT_RETRY_COOLDOWN_MS,
    });
  }

  private handleActiveJobSettlementReload(
    jobId: string,
    context: PlayerEstatePageContextV3,
  ): void {
    const estate = context.estateRuntimeState;
    const activeJob = estate ? estate.active_job_json : null;

    if (!activeJob || activeJob.jobId !== jobId) {
      this.settlementRetries.delete(jobId);
      this.secondsUntilCompletionBaselines.delete(jobId);
      return;
    }

    this.handleActiveJobSettlementFailure(jobId);
  }

  private handleActiveJobSettlementFailure(jobId: string): void {
    const retry = this.settlementRetries.get(jobId);
    const attemptCount = retry ? retry.attemptCount : 1;

    this.settlementRetries.set(jobId, {
      attemptCount,
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
