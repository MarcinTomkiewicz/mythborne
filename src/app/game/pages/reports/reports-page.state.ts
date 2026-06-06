import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReportListPage, ReportPageCopy } from '../../../core/domain/reports/report.model';
import { GamePageSummaryRow } from '../../../core/interfaces/game-page-summary-row.interface';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerReports } from '../../../core/services/reports/player-reports';
import { RequestToken } from '../../../core/utils/request-token';

const REPORT_LIST_PAGE_LIMIT = 25;
const REPORT_LIST_PAGE_OFFSET = 0;

@Injectable()
export class ReportsPageState {
  private readonly activeHero = inject(ActiveHero);
  private readonly reports = inject(PlayerReports);
  private readonly destroyRef = inject(DestroyRef);
  private readonly requestToken = new RequestToken();

  private activeHeroId: string | null = null;
  private activeServerId: string | null = null;

  readonly copy = signal<ReportPageCopy | null>(null);
  readonly listPage = signal<ReportListPage | null>(null);
  readonly hasError = signal(false);
  readonly pendingRequestCount = signal(0);
  readonly isLoading = computed(() => this.pendingRequestCount() > 0);
  readonly headerSummaryRows: readonly GamePageSummaryRow[] = [];

  loadData(): void {
    const token = this.requestToken.next();

    this.copy.set(null);
    this.listPage.set(null);
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
          this.loadReportsFoundation(state.heroId, state.serverId, token);
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

  private loadReportsFoundation(heroId: string, serverId: string, token: number): void {
    this.loadPageCopy(heroId, serverId, token);
    this.loadListPage(heroId, serverId, token);
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

  private loadListPage(heroId: string, serverId: string, token: number): void {
    this.startRequest(token);

    this.reports.getListPage({
      heroId,
      limit: REPORT_LIST_PAGE_LIMIT,
      offset: REPORT_LIST_PAGE_OFFSET,
      reportTypeKey: null,
      unreadOnly: false,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (listPage) => {
          this.finishRequest(token);

          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.listPage.set(listPage);
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
