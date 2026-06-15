import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { PvpPrivateReportCopy } from '../../../core/domain/pvp/pvp-private-report-copy.model';
import { PrivateReportDetailPage } from '../../../core/domain/reports/report-detail.model';
import { ReportPageCopy } from '../../../core/domain/reports/report-page-copy.model';
import { GameCopyService } from '../../../core/services/game-copy/game-copy.service';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerReports } from '../../../core/services/reports/player-reports';
import { toDateTimeLabel } from '../../../core/utils/date-display';
import { isPrivatePvpSpyReportDetail } from '../../../core/utils/pvp-report-domain-context';
import { RequestToken } from '../../../core/utils/request-token';

@Injectable()
export class ReportDetailPageState {
  private readonly activeHero = inject(ActiveHero);
  private readonly gameCopy = inject(GameCopyService);
  private readonly reports = inject(PlayerReports);
  private readonly destroyRef = inject(DestroyRef);
  private readonly requestToken = new RequestToken();

  private activeHeroId: string | null = null;
  private activeServerId: string | null = null;

  readonly copy = signal<ReportPageCopy | null>(null);
  readonly detail = signal<PrivateReportDetailPage | null>(null);
  readonly pvpPrivateReportCopy = signal<PvpPrivateReportCopy | null>(null);
  readonly hasError = signal(false);
  readonly pendingRequestCount = signal(0);
  readonly isLoading = computed(() => this.pendingRequestCount() > 0);
  loadData(reportId: string): void {
    const token = this.beginDetailLoadToken();

    this.copy.set(null);
    this.detail.set(null);
    this.pvpPrivateReportCopy.set(null);
    this.hasError.set(false);

    this.startRequest(token);
    this.activeHero
      .requireActiveHero()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.finishRequest(token);
        }),
      )
      .subscribe({
        next: (state) => {
          if (!this.requestToken.isCurrent(token)) {
            return;
          }

          this.activeHeroId = state.heroId;
          this.activeServerId = state.serverId;
          this.loadReportFoundation(state.heroId, state.serverId, reportId, token);
        },
        error: () => {
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

    this.gameCopy.getCopy('player.reports.page', { locale: 'pl' })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.finishRequest(token);
        }),
      )
      .subscribe({
        next: (copy) => {
          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.copy.set(copy);
        },
        error: () => {
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
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.finishRequest(token);
        }),
      )
      .subscribe({
        next: (detail) => {
          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.detail.set(detail);

          if (isPrivatePvpSpyReportDetail(detail)) {
            this.loadPvpPrivateReportCopy(heroId, serverId, reportId, token);
          }
        },
        error: () => {
          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.hasError.set(true);
        },
      });
  }

  private loadPvpPrivateReportCopy(
    heroId: string,
    serverId: string,
    reportId: string,
    token: number,
  ): void {
    this.startRequest(token);

    this.gameCopy.getCopy('player.pvp.report.private', {
      locale: 'pl',
      reportId,
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.finishRequest(token);
      }),
    ).subscribe({
      next: (copy) => {
        if (!this.isCurrentRequest(token, heroId, serverId)) {
          return;
        }

        this.pvpPrivateReportCopy.set(copy);
      },
      error: () => {
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

    this.pendingRequestCount.update((count) => {
      return count + 1;
    });
  }

  private finishRequest(token: number): void {
    if (!this.requestToken.isCurrent(token)) {
      return;
    }

    this.pendingRequestCount.update((count) => {
      return Math.max(0, count - 1);
    });
  }

  private beginDetailLoadToken(): number {
    const token = this.requestToken.next();

    this.pendingRequestCount.set(0);

    return token;
  }
}
