import { computed, inject, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import {
  GameReportServerFilters,
  PrivateGameReportListItem,
} from '../../../core/domain/reports/game-report.model';
import { GameReports } from '../../../core/services/reports/game-reports';
import { GameReportUiMetadataService } from '../../../core/services/reports/game-report-ui-metadata';
import { ToastService } from '../../../core/services/ui/toast';
import { getErrorMessage } from '../../../core/utils/error-message';
import { ReportsUiMetadata } from './reports-ui-metadata';

const REPORT_LIMIT = 50;

type ReportsFilterForm = FormGroup<{
  reportTypeKey: FormControl<string>;
  unreadOnly: FormControl<boolean>;
  searchText: FormControl<string>;
}>;

@Injectable()
export class ReportsPageState {
  private readonly gameReports = inject(GameReports);
  private readonly uiMetadataService = inject(GameReportUiMetadataService);
  private readonly toast = inject(ToastService);
  private loadRequestId = 0;

  readonly form: ReportsFilterForm = new FormGroup({
    reportTypeKey: new FormControl('', { nonNullable: true }),
    unreadOnly: new FormControl(false, { nonNullable: true }),
    searchText: new FormControl('', { nonNullable: true }),
  });

  readonly reports = signal<PrivateGameReportListItem[]>([]);
  readonly uiMetadataEntries = signal<UiMetadataEntryReadModel[]>([]);
  readonly uiMetadata = new ReportsUiMetadata(() => this.uiMetadataEntries());
  readonly unreadCount = signal(0);
  readonly isLoading = signal(true);
  readonly deletingReportId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly reportTypeOptions = computed(() => {
    const byKey = new Map<string, string>();

    for (const report of this.reports()) {
      byKey.set(report.reportTypeKey, report.reportTypeLabel);
    }

    return Array.from(byKey, ([value, label]) => ({ value, label }))
      .sort((left, right) => left.label.localeCompare(right.label));
  });
  readonly reportTypeFilterOptions = computed(() => [
    { value: '', label: 'All types' },
    ...this.reportTypeOptions(),
  ]);

  readonly visibleReports = computed(() =>
    filterReportsBySearch(this.reports(), this.form.controls.searchText.value),
  );

  loadData(): void {
    const requestId = ++this.loadRequestId;
    const filters = this.serverFilters();

    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      reports: this.gameReports.getActiveHeroReports(filters),
      unreadCount: this.gameReports.getActiveHeroUnreadCount(),
      uiMetadataEntries: this.uiMetadataService.getReportsCenterEntries(),
    }).subscribe({
      next: ({ reports, unreadCount, uiMetadataEntries }) => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.reports.set(reports);
        this.uiMetadataEntries.set(uiMetadataEntries);
        this.unreadCount.set(unreadCount);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        const message = getErrorMessage(error, 'Failed to load game reports.');
        this.error.set(message);
        this.toast.show('error', 'Reports unavailable', message);
        this.isLoading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.loadData();
  }

  clearFilters(): void {
    this.form.reset({
      reportTypeKey: '',
      unreadOnly: false,
      searchText: '',
    });
    this.loadData();
  }

  removeReport(report: PrivateGameReportListItem): void {
    if (this.deletingReportId()) {
      return;
    }

    this.deletingReportId.set(report.reportId);
    this.error.set(null);

    this.gameReports.deleteActiveHeroReport(report.reportId).subscribe({
      next: () => {
        this.toast.show('success', 'Report removed', `${report.title} was removed.`);
        this.deletingReportId.set(null);
        this.loadData();
      },
      error: (error: unknown) => {
        const message = getErrorMessage(error, 'Failed to remove game report.');
        this.error.set(message);
        this.toast.show('error', 'Report removal failed', message);
        this.deletingReportId.set(null);
      },
    });
  }

  publicShareToken(report: PrivateGameReportListItem): string {
    return report.publicToken;
  }

  copyPublicToken(report: PrivateGameReportListItem): void {
    const token = this.publicShareToken(report);

    if (!navigator.clipboard) {
      this.toast.show('info', 'Public token', token);
      return;
    }

    void navigator.clipboard.writeText(token)
      .then(() => this.toast.show('success', 'Public token copied', token))
      .catch(() => this.toast.show('info', 'Public token', token));
  }

  participantSummary(report: PrivateGameReportListItem): string {
    if (report.participants.length === 0) {
      return 'No participants';
    }

    return report.participants
      .map((participant) => participant.displayName)
      .join(', ');
  }

  toDateTimeLabel(value: string): string {
    return new Date(value).toLocaleString();
  }

  private serverFilters(): GameReportServerFilters {
    return {
      reportTypeKey: this.form.controls.reportTypeKey.value || null,
      unreadOnly: this.form.controls.unreadOnly.value,
      limit: REPORT_LIMIT,
      offset: 0,
    };
  }
}

function filterReportsBySearch(
  reports: readonly PrivateGameReportListItem[],
  rawSearchText: string,
): PrivateGameReportListItem[] {
  const searchText = rawSearchText.trim().toLowerCase();

  if (!searchText) {
    return [...reports];
  }

  return reports.filter((report) => {
    const values = [
      report.title,
      report.summary,
      report.reportTypeLabel,
      ...report.participants.map((participant) => participant.displayName),
    ];

    return values.some((value) => value?.toLowerCase().includes(searchText));
  });
}
