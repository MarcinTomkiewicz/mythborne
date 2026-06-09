import {
  DestroyRef,
  Injectable,
  computed,
  inject,
  isDevMode,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs';
import { ReportPageCopy } from '../../../core/domain/reports/report-page-copy.model';
import {
  reportsCenterEventTypeCopyByKey,
  ReportsCenterEventTypeCopy,
} from '../../../core/domain/reports/reports-center-copy.model';
import {
  ReportsCenterAppliedFilters,
  ReportsCenterPageContext,
} from '../../../core/domain/reports/reports-center.model';
import { GameCopyService } from '../../../core/services/game-copy/game-copy.service';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerReports } from '../../../core/services/reports/player-reports';
import {
  nonNegativeIntegerOrNull,
  positiveIntegerOrNull,
} from '../../../core/utils/number-guards';
import { mapReportsCenterHeaderSummaryRows } from '../../../core/utils/reports-center-header-summary.mapper';
import { RequestToken } from '../../../core/utils/request-token';

const REPORTS_CENTER_PAGE_LIMIT = 12;
const REPORTS_CENTER_PAGE_OFFSET = 0;
const DEFAULT_REPORT_AREA_KEY = 'all';
const DEFAULT_READ_MODE_KEY = 'unread_first';
const DEFAULT_TIME_RANGE_KEY = 'last_7_days';

@Injectable()
export class ReportsPageState {
  private readonly activeHero = inject(ActiveHero);
  private readonly gameCopy = inject(GameCopyService);
  private readonly reports = inject(PlayerReports);
  private readonly destroyRef = inject(DestroyRef);
  private readonly requestToken = new RequestToken();

  private activeHeroId: string | null = null;
  private activeServerId: string | null = null;
  private listLimit = REPORTS_CENTER_PAGE_LIMIT;
  private listOffset = REPORTS_CENTER_PAGE_OFFSET;

  readonly filtersForm = new FormGroup({
    query: new FormControl('', { nonNullable: true }),
    reportAreaKey: new FormControl(DEFAULT_REPORT_AREA_KEY, {
      nonNullable: true,
    }),
    readModeKey: new FormControl(DEFAULT_READ_MODE_KEY, { nonNullable: true }),
    timeRangeKey: new FormControl(DEFAULT_TIME_RANGE_KEY, {
      nonNullable: true,
    }),
  });
  readonly copy = signal<ReportPageCopy | null>(null);
  readonly context = signal<ReportsCenterPageContext | null>(null);
  readonly selectedReportId = signal<string | null>(null);
  readonly selectedReportIds = signal<readonly string[]>([]);
  readonly hasError = signal(false);
  readonly pendingRequestCount = signal(0);
  readonly isLoading = computed(() => this.pendingRequestCount() > 0);
  readonly selectedRow = computed(() => {
    const selectedReportId = this.selectedReportId();

    return (
      this.context()?.reports.find(
        (row) => row.reportId === selectedReportId,
      ) ?? null
    );
  });
  readonly selectedPreview = computed(
    () =>
      this.selectedRow()?.preview ?? this.context()?.selectedPreview ?? null,
  );
  readonly selectedPreviewEventTypeCopy = computed<ReportsCenterEventTypeCopy | null>(() => {
    const copy = this.copy();
    const preview = this.selectedPreview();
    const row = this.selectedRow()
      ?? this.context()?.reports.find((report) => report.reportId === preview?.reportId)
      ?? null;

    if (!copy || !preview || !row) {
      return null;
    }

    return reportsCenterEventTypeCopyByKey(
      copy.reportsCenter.eventTypes,
      row.eventType.key,
    );
  });
  readonly headerSummaryRows = computed(() => {
    const copy = this.copy();
    const context = this.context();

    return copy && context
      ? mapReportsCenterHeaderSummaryRows(
        copy.reportsCenter.summary,
        context.summary,
      )
      : [];
  });
  readonly allVisibleReportsSelected = computed(() => {
    const reports = this.context()?.reports ?? [];

    return (
      reports.length > 0 &&
      reports.every((row) => this.selectedReportIds().includes(row.reportId))
    );
  });

  loadData(): void {
    const token = this.beginRequestToken();

    this.pendingRequestCount.set(0);
    this.copy.set(null);
    this.context.set(null);
    this.selectedReportId.set(null);
    this.selectedReportIds.set([]);
    this.hasError.set(false);
    this.listLimit = REPORTS_CENTER_PAGE_LIMIT;
    this.listOffset = REPORTS_CENTER_PAGE_OFFSET;
    this.filtersForm.setValue(
      {
        query: '',
        reportAreaKey: DEFAULT_REPORT_AREA_KEY,
        readModeKey: DEFAULT_READ_MODE_KEY,
        timeRangeKey: DEFAULT_TIME_RANGE_KEY,
      },
      { emitEvent: false },
    );

    this.startRequest(token);
    this.activeHero
      .requireActiveHero()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.finishRequest(token)),
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
    this.selectedReportIds.set([]);
    this.loadCurrentPage();
  }

  changeReportsPage(input: {
    first?: number | null;
    rows?: number | null;
  }): void {
    if (!this.activeHeroId || !this.activeServerId) {
      return;
    }

    this.listLimit = positiveIntegerOrNull(input.rows) ?? this.listLimit;
    this.listOffset =
      nonNegativeIntegerOrNull(input.first) ?? REPORTS_CENTER_PAGE_OFFSET;
    this.selectedReportIds.set([]);
    this.loadCurrentPage();
  }

  selectReport(reportId: string): void {
    if (!this.context()?.reports.some((row) => row.reportId === reportId)) {
      return;
    }

    this.selectedReportId.set(reportId);
  }

  toggleReportSelection(reportId: string): void {
    if (!this.context()?.reports.some((row) => row.reportId === reportId)) {
      return;
    }

    const selectedReportIds = this.selectedReportIds();

    this.selectedReportIds.set(
      selectedReportIds.includes(reportId)
        ? selectedReportIds.filter((selectedId) => selectedId !== reportId)
        : [...selectedReportIds, reportId],
    );
  }

  toggleVisibleReportSelection(): void {
    const reportIds = this.context()?.reports.map((row) => row.reportId) ?? [];

    if (reportIds.length === 0) {
      return;
    }

    this.selectedReportIds.set(
      this.allVisibleReportsSelected() ? [] : reportIds,
    );
  }

  private loadCurrentPage(): void {
    if (!this.activeHeroId || !this.activeServerId) {
      return;
    }

    const token = this.beginRequestToken();

    this.hasError.set(false);
    this.loadReportsCenterPage(this.activeHeroId, this.activeServerId, token);
  }

  private loadReportsFoundation(
    heroId: string,
    serverId: string,
    token: number,
  ): void {
    this.loadPageCopy(heroId, serverId, token);
    this.loadReportsCenterPage(heroId, serverId, token);
  }

  private loadPageCopy(heroId: string, serverId: string, token: number): void {
    this.startRequest(token);

    this.gameCopy
      .getCopy('player.reports.page', { locale: 'pl' })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.finishRequest(token)),
      )
      .subscribe({
        next: (copy) => {
          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.copy.set(copy);
        },
        error: (error: unknown) => {
          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          if (isDevMode()) {
            console.error('Reports page copy load failed.', error);
          }

          this.hasError.set(true);
        },
      });
  }

  private loadReportsCenterPage(
    heroId: string,
    serverId: string,
    token: number,
  ): void {
    this.startRequest(token);

    const filters = this.currentFilters();

    this.reports
      .getReportsCenterPageContext({
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
        finalize(() => this.finishRequest(token)),
      )
      .subscribe({
        next: (context) => {
          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.context.set(context);
          this.syncAppliedFilters(context.filters.applied);
          this.syncSelectedReport(context);
          this.syncSelectedReportIds(context);
        },
        error: (error: unknown) => {
          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          if (isDevMode()) {
            console.error('Reports center page context load failed.', error);
          }

          this.hasError.set(true);
        },
      });
  }

  private syncAppliedFilters(filters: ReportsCenterAppliedFilters): void {
    this.filtersForm.setValue(
      {
        query: filters.query ?? '',
        reportAreaKey: filters.reportAreaKey,
        readModeKey: filters.readModeKey,
        timeRangeKey: filters.timeRangeKey,
      },
      { emitEvent: false },
    );
  }

  private syncSelectedReport(context: ReportsCenterPageContext): void {
    const selectedReportId = this.selectedReportId();

    if (
      selectedReportId &&
      context.reports.some((row) => row.reportId === selectedReportId)
    ) {
      return;
    }

    this.selectedReportId.set(
      context.selectedPreview?.reportId ?? context.reports[0]?.reportId ?? null,
    );
  }

  private syncSelectedReportIds(context: ReportsCenterPageContext): void {
    const reportIds = context.reports.map((row) => row.reportId);

    this.selectedReportIds.update((selectedIds) =>
      selectedIds.filter((selectedId) => reportIds.includes(selectedId)),
    );
  }

  private currentFilters(): ReportsCenterAppliedFilters {
    const query = this.filtersForm.controls.query.value.trim();

    return {
      query: query ? query : null,
      reportAreaKey: this.filtersForm.controls.reportAreaKey.value,
      readModeKey: this.filtersForm.controls.readModeKey.value,
      timeRangeKey: this.filtersForm.controls.timeRangeKey.value,
    };
  }

  private isCurrentRequest(
    token: number,
    heroId: string,
    serverId: string,
  ): boolean {
    return (
      this.requestToken.isCurrent(token) &&
      this.activeHeroId === heroId &&
      this.activeServerId === serverId
    );
  }

  private beginRequestToken(): number {
    return this.requestToken.next();
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
