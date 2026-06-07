import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs';
import { ReportPageCopy } from '../../../core/domain/reports/report-page-copy.model';
import {
  ReportsCenterAppliedFiltersV1,
  ReportsCenterPageContextV2,
} from '../../../core/domain/reports/reports-center.model';
import { GamePageSummaryRow } from '../../../core/interfaces/game-page-summary-row.interface';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerReports } from '../../../core/services/reports/player-reports';
import { createRequestId } from '../../../core/utils/request-id';
import { RequestToken } from '../../../core/utils/request-token';

const REPORTS_CENTER_PAGE_LIMIT = 12;
const REPORTS_CENTER_PAGE_OFFSET = 0;
const DEFAULT_REPORT_AREA_KEY = 'all';
const DEFAULT_READ_MODE_KEY = 'unread_first';
const DEFAULT_TIME_RANGE_KEY = 'last_7_days';

@Injectable()
export class ReportsPageState {
  private readonly activeHero = inject(ActiveHero);
  private readonly reports = inject(PlayerReports);
  private readonly destroyRef = inject(DestroyRef);
  private readonly requestToken = new RequestToken();

  private activeHeroId: string | null = null;
  private activeServerId: string | null = null;
  private listLimit = REPORTS_CENTER_PAGE_LIMIT;
  private listOffset = REPORTS_CENTER_PAGE_OFFSET;

  readonly filtersForm = new FormGroup({
    query: new FormControl('', { nonNullable: true }),
    reportAreaKey: new FormControl(DEFAULT_REPORT_AREA_KEY, { nonNullable: true }),
    readModeKey: new FormControl(DEFAULT_READ_MODE_KEY, { nonNullable: true }),
    timeRangeKey: new FormControl(DEFAULT_TIME_RANGE_KEY, { nonNullable: true }),
  });
  readonly copy = signal<ReportPageCopy | null>(null);
  readonly context = signal<ReportsCenterPageContextV2 | null>(null);
  readonly selectedReportId = signal<string | null>(null);
  readonly hasError = signal(false);
  readonly pageCopyLoadMs = signal<number | null>(null);
  readonly reportsCenterContextLoadMs = signal<number | null>(null);
  readonly pendingRequestCount = signal(0);
  readonly isLoading = computed(() => this.pendingRequestCount() > 0);
  readonly selectedRow = computed(() => {
    const selectedReportId = this.selectedReportId();

    return this.context()?.reports.find((row) => row.reportId === selectedReportId) ?? null;
  });
  readonly selectedPreview = computed(() =>
    this.selectedRow()?.preview ?? this.context()?.selectedPreview ?? null,
  );
  readonly headerSummaryRows = computed<readonly GamePageSummaryRow[]>(() => {
    const summary = this.context()?.summary;

    if (!summary) {
      return [];
    }

    return [
      {
        key: 'totalReports',
        label: summary.totalReports.label,
        value: summary.totalReports.value,
      },
      {
        key: 'unreadReports',
        label: summary.unreadReports.label,
        value: summary.unreadReports.value,
      },
      {
        key: 'latestReport',
        label: summary.latestReport.label,
        value: summary.latestReport.title ?? summary.latestReport.fallbackLabel,
        route: summary.latestReport.privatePath ?? undefined,
      },
    ];
  });

  loadData(): void {
    const token = this.beginRequestToken();

    this.copy.set(null);
    this.context.set(null);
    this.selectedReportId.set(null);
    this.hasError.set(false);
    this.pageCopyLoadMs.set(null);
    this.reportsCenterContextLoadMs.set(null);
    this.listLimit = REPORTS_CENTER_PAGE_LIMIT;
    this.listOffset = REPORTS_CENTER_PAGE_OFFSET;
    this.filtersForm.setValue({
      query: '',
      reportAreaKey: DEFAULT_REPORT_AREA_KEY,
      readModeKey: DEFAULT_READ_MODE_KEY,
      timeRangeKey: DEFAULT_TIME_RANGE_KEY,
    }, { emitEvent: false });

    this.startRequest();
    this.activeHero
      .requireActiveHero()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.finishRequest()),
      )
      .subscribe({
        next: (state) => {
          if (!this.requestToken.isCurrent(token)) {
            return;
          }

          this.activeHeroId = state.heroId;
          this.activeServerId = state.serverId;
          this.loadReportsFoundation(state.heroId, state.serverId, token);
        },
        error: () => {
          if (!this.requestToken.isCurrent(token)) {
            return;
          }

          this.hasError.set(true);
        },
      });
  }

  applyFilters(): void {
    if (!this.activeHeroId || !this.activeServerId) {
      return;
    }

    this.listOffset = REPORTS_CENTER_PAGE_OFFSET;
    this.loadCurrentPage();
  }

  changeReportsPage(input: { first?: number | null; rows?: number | null }): void {
    if (!this.activeHeroId || !this.activeServerId) {
      return;
    }

    this.listLimit = positiveInteger(input.rows) ?? this.listLimit;
    this.listOffset = nonNegativeInteger(input.first) ?? REPORTS_CENTER_PAGE_OFFSET;
    this.loadCurrentPage();
  }

  selectReport(reportId: string): void {
    if (!this.context()?.reports.some((row) => row.reportId === reportId)) {
      return;
    }

    this.selectedReportId.set(reportId);
  }

  markAllRead(): void {
    const heroId = this.activeHeroId;
    const serverId = this.activeServerId;
    const context = this.context();

    if (
      !heroId ||
      !serverId ||
      !context?.actions.markAllRead.supported ||
      !context.actions.markAllRead.enabled
    ) {
      return;
    }

    const token = this.beginRequestToken();
    const filters = this.currentFilters();

    this.hasError.set(false);
    this.startRequest();
    this.reports.markAllReportsRead({
      heroId,
      query: filters.query,
      reportAreaKey: filters.reportAreaKey,
      readModeKey: filters.readModeKey,
      timeRangeKey: filters.timeRangeKey,
      requestId: createRequestId('reports-center-mark-all-read'),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.finishRequest()),
      )
      .subscribe({
        next: () => {
          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.loadReportsCenterPage(heroId, serverId, token);
        },
        error: () => {
          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.hasError.set(true);
        },
      });
  }

  private loadCurrentPage(): void {
    if (!this.activeHeroId || !this.activeServerId) {
      return;
    }

    const token = this.beginRequestToken();

    this.hasError.set(false);
    this.loadReportsCenterPage(this.activeHeroId, this.activeServerId, token);
  }

  private loadReportsFoundation(heroId: string, serverId: string, token: number): void {
    this.loadPageCopy(heroId, serverId, token);
    this.loadReportsCenterPage(heroId, serverId, token);
  }

  private loadPageCopy(heroId: string, serverId: string, token: number): void {
    this.startRequest();

    const startedAt = performance.now();

    this.reports.getPageCopy()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.finishRequest()),
      )
      .subscribe({
        next: (copy) => {
          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.recordPageCopyTiming(startedAt);
          this.copy.set(copy);
        },
        error: () => {
          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.recordPageCopyTiming(startedAt);
          this.hasError.set(true);
        },
      });
  }

  private loadReportsCenterPage(heroId: string, serverId: string, token: number): void {
    this.startRequest();

    const filters = this.currentFilters();
    const startedAt = performance.now();

    this.reports.getReportsCenterPageContext({
      heroId,
      limit: this.listLimit,
      offset: this.listOffset,
      query: filters.query,
      reportAreaKey: filters.reportAreaKey,
      readModeKey: filters.readModeKey,
      timeRangeKey: filters.timeRangeKey,
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.finishRequest()),
      )
      .subscribe({
        next: (context) => {
          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.recordReportsCenterContextTiming(startedAt);
          this.context.set(context);
          this.syncAppliedFilters(context.filters.applied);
          this.syncSelectedReport(context);
        },
        error: () => {
          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.recordReportsCenterContextTiming(startedAt);
          this.hasError.set(true);
        },
      });
  }

  private syncAppliedFilters(filters: ReportsCenterAppliedFiltersV1): void {
    this.filtersForm.setValue({
      query: filters.query ?? '',
      reportAreaKey: filters.reportAreaKey,
      readModeKey: filters.readModeKey,
      timeRangeKey: filters.timeRangeKey,
    }, { emitEvent: false });
  }

  private syncSelectedReport(context: ReportsCenterPageContextV2): void {
    const selectedReportId = this.selectedReportId();

    if (selectedReportId && context.reports.some((row) => row.reportId === selectedReportId)) {
      return;
    }

    this.selectedReportId.set(
      context.selectedPreview?.reportId ?? context.reports[0]?.reportId ?? null,
    );
  }

  private currentFilters(): ReportsCenterAppliedFiltersV1 {
    const query = this.filtersForm.controls.query.value.trim();

    return {
      query: query ? query : null,
      reportAreaKey: this.filtersForm.controls.reportAreaKey.value,
      readModeKey: this.filtersForm.controls.readModeKey.value,
      timeRangeKey: this.filtersForm.controls.timeRangeKey.value,
    };
  }

  private isCurrentRequest(token: number, heroId: string, serverId: string): boolean {
    return (
      this.requestToken.isCurrent(token) &&
      this.activeHeroId === heroId &&
      this.activeServerId === serverId
    );
  }

  private beginRequestToken(): number {
    return this.requestToken.next();
  }

  private startRequest(): void {
    this.pendingRequestCount.update((count) => count + 1);
  }

  private finishRequest(): void {
    this.pendingRequestCount.update((count) => Math.max(0, count - 1));
  }

  private recordPageCopyTiming(startedAt: number): void {
    const durationMs = elapsedMs(startedAt);

    this.pageCopyLoadMs.set(durationMs);
    // Temporary user-side smoke instrumentation for Reports Center RPC timings.
    console.debug('Reports Center get_report_page_copy duration', { durationMs });
  }

  private recordReportsCenterContextTiming(startedAt: number): void {
    const durationMs = elapsedMs(startedAt);

    this.reportsCenterContextLoadMs.set(durationMs);
    // Temporary user-side smoke instrumentation for Reports Center RPC timings.
    console.debug('Reports Center get_reports_center_page_context duration', { durationMs });
  }
}

function positiveInteger(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function nonNegativeInteger(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function elapsedMs(startedAt: number): number {
  return Math.round(performance.now() - startedAt);
}
