import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PrivateReportDetailPage } from '../../../core/domain/reports/report-detail.model';
import { ReportPageCopy } from '../../../core/domain/reports/report-page-copy.model';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerReports } from '../../../core/services/reports/player-reports';
import { toDateTimeLabel } from '../../../core/utils/date-display';
import { RequestToken } from '../../../core/utils/request-token';

@Injectable()
export class ReportDetailPageState {
  private readonly activeHero = inject(ActiveHero);
  private readonly reports = inject(PlayerReports);
  private readonly destroyRef = inject(DestroyRef);
  private readonly requestToken = new RequestToken();

  private activeHeroId: string | null = null;
  private activeServerId: string | null = null;

  readonly copy = signal<ReportPageCopy | null>(null);
  readonly detail = signal<PrivateReportDetailPage | null>(null);
  readonly hasError = signal(false);
  readonly pendingRequestCount = signal(0);
  readonly isLoading = computed(() => this.pendingRequestCount() > 0);

  loadData(reportId: string): void {
    const token = this.requestToken.next();

    this.copy.set(null);
    this.detail.set(null);
    this.hasError.set(false);
    this.pendingRequestCount.set(1);

    this.activeHero
      .requireActiveHero()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state) => {
          this.finishRequest(token);

          if (!this.requestToken.isCurrent(token)) {
            return;
          }

          this.activeHeroId = state.heroId;
          this.activeServerId = state.serverId;
          this.loadReportFoundation(state.heroId, state.serverId, reportId, token);
        },
        error: (error: unknown) => {
          this.finishRequest(token);

          if (!this.requestToken.isCurrent(token)) {
            return;
          }

          this.hasError.set(true);
        },
      });
  }

  formatDateTime(value: string): string {
    return toDateTimeLabel(value);
  }

  private loadReportFoundation(
    heroId: string,
    serverId: string,
    reportId: string,
    token: number,
  ): void {
    this.loadPageCopy(heroId, serverId, token);
    this.loadDetail(heroId, serverId, reportId, token);
  }

  private loadPageCopy(heroId: string, serverId: string, token: number): void {
    this.startRequest(token);

    this.reports.getPageCopy()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (copy) => {
          this.finishRequest(token);

          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.copy.set(copy);
        },
        error: (error: unknown) => {
          this.finishRequest(token);

          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.hasError.set(true);
        },
      });
  }

  private loadDetail(
    heroId: string,
    serverId: string,
    reportId: string,
    token: number,
  ): void {
    this.startRequest(token);

    this.reports.getDetailPage({ heroId, reportId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          this.finishRequest(token);

          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.detail.set(detail);
        },
        error: (error: unknown) => {
          this.finishRequest(token);

          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.hasError.set(true);
        },
      });
  }

  private isCurrentRequest(token: number, heroId: string, serverId: string): boolean {
    return (
      this.requestToken.isCurrent(token) &&
      this.activeHeroId === heroId &&
      this.activeServerId === serverId
    );
  }

  private startRequest(token: number): void {
    if (!this.requestToken.isCurrent(token)) {
      return;
    }

    this.pendingRequestCount.update((count) => count + 1);
  }

  private finishRequest(token: number): void {
    if (!this.requestToken.isCurrent(token)) {
      return;
    }

    this.pendingRequestCount.update((count) => Math.max(0, count - 1));
  }
}
