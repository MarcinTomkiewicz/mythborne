import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import { PrivateGameReportDetail } from '../../../core/domain/reports/game-report.model';
import { GameReports } from '../../../core/services/reports/game-reports';
import { GameReportUiMetadataService } from '../../../core/services/reports/game-report-ui-metadata';
import { ToastService } from '../../../core/services/ui/toast';
import { getErrorMessage } from '../../../core/utils/error-message';
import { ReportDetailUiMetadata } from './reports-ui-metadata';

@Injectable()
export class ReportDetailPageState {
  private readonly gameReports = inject(GameReports);
  private readonly uiMetadataService = inject(GameReportUiMetadataService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private loadRequestId = 0;
  private actionRequestId = 0;

  readonly report = signal<PrivateGameReportDetail | null>(null);
  readonly unreadCount = signal(0);
  readonly uiMetadataEntries = signal<UiMetadataEntryReadModel[]>([]);
  readonly uiMetadata = new ReportDetailUiMetadata(() => this.uiMetadataEntries());
  readonly isLoading = signal(true);
  readonly isMarkingRead = signal(false);
  readonly deletingReportId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  loadData(reportId: string): void {
    const requestId = ++this.loadRequestId;

    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      report: this.gameReports.getActiveHeroReportDetail(reportId),
      unreadCount: this.gameReports.getActiveHeroUnreadCount(),
      uiMetadataEntries: this.uiMetadataService.getReportDetailEntries(),
    }).subscribe({
      next: ({ report, unreadCount, uiMetadataEntries }) => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.report.set(report);
        this.unreadCount.set(unreadCount);
        this.uiMetadataEntries.set(uiMetadataEntries);
        this.isLoading.set(false);

        if (report.readState.isUnread) {
          this.markRead(report.reportId, requestId);
        }
      },
      error: (error: unknown) => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        const message = getErrorMessage(error, 'Failed to load game report.');
        this.error.set(message);
        this.toast.show('error', 'Report unavailable', message);
        this.isLoading.set(false);
      },
    });
  }

  removeReport(): void {
    const report = this.report();

    if (!report || this.deletingReportId()) {
      return;
    }

    const requestId = ++this.actionRequestId;

    this.deletingReportId.set(report.reportId);
    this.error.set(null);

    this.gameReports.deleteActiveHeroReport(report.reportId).subscribe({
      next: () => {
        if (requestId !== this.actionRequestId) {
          return;
        }

        this.toast.show('success', 'Report removed', `${report.title} was removed.`);
        this.deletingReportId.set(null);
        void this.router.navigateByUrl('/game/reports');
      },
      error: (error: unknown) => {
        if (requestId !== this.actionRequestId) {
          return;
        }

        const message = getErrorMessage(error, 'Failed to remove game report.');
        this.error.set(message);
        this.toast.show('error', 'Report removal failed', message);
        this.deletingReportId.set(null);
      },
    });
  }

  publicShareToken(): string {
    return this.report()?.publicToken ?? '';
  }

  copyPublicToken(): void {
    const token = this.publicShareToken();

    if (!token) {
      return;
    }

    if (!navigator.clipboard) {
      this.toast.show('info', 'Public token', token);
      return;
    }

    void navigator.clipboard.writeText(token)
      .then(() => this.toast.show('success', 'Public token copied', token))
      .catch(() => this.toast.show('info', 'Public token', token));
  }

  toDateTimeLabel(value: string): string {
    return new Date(value).toLocaleString();
  }

  private markRead(reportId: string, loadRequestId: number): void {
    this.isMarkingRead.set(true);

    this.gameReports.markActiveHeroReportRead(reportId).subscribe({
      next: (result) => {
        if (loadRequestId !== this.loadRequestId) {
          return;
        }

        const report = this.report();

        if (report?.reportId === result.reportId) {
          this.report.set({
            ...report,
            readState: {
              accessRole: result.accessRole,
              readAt: result.readAt,
              isUnread: result.readAt === null,
            },
          });
        }

        this.refreshUnreadCount(loadRequestId);
        this.isMarkingRead.set(false);
      },
      error: (error: unknown) => {
        if (loadRequestId !== this.loadRequestId) {
          return;
        }

        const message = getErrorMessage(error, 'Failed to mark report read.');
        this.error.set(message);
        this.toast.show('error', 'Read state update failed', message);
        this.isMarkingRead.set(false);
      },
    });
  }

  private refreshUnreadCount(loadRequestId: number): void {
    this.gameReports.getActiveHeroUnreadCount().subscribe({
      next: (count) => {
        if (loadRequestId === this.loadRequestId) {
          this.unreadCount.set(count);
        }
      },
      error: () => {
        if (loadRequestId === this.loadRequestId) {
          const message = 'Unread count refresh failed.';
          this.error.set(message);
          this.toast.show('warn', 'Unread count unavailable', message);
        }
      },
    });
  }
}
