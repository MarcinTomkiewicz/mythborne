import { Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import {
  reportsCenterEventTypeCopyByKey,
  ReportsCenterActionsCopy,
  ReportsCenterEventTypeCopy,
  ReportsCenterEventTypeCopyBundle,
  ReportsCenterListCopy,
} from '../../../core/domain/reports/reports-center-copy.model';
import {
  ReportsCenterListRow,
  ReportsCenterPagination,
} from '../../../core/domain/reports/reports-center.model';
import { ReportListRow } from './report-list-row';

@Component({
  selector: 'app-report-list-section',
  standalone: true,
  imports: [
    ButtonModule,
    PaginatorModule,
    ReportListRow,
  ],
  templateUrl: './report-list-section.html',
  host: { class: 'd-block w-100 min-w-0' },
})
export class ReportListSection {
  readonly copy = input.required<ReportsCenterListCopy>();
  readonly reports = input.required<readonly ReportsCenterListRow[]>();
  readonly pagination = input.required<ReportsCenterPagination>();
  readonly selectedReportId = input<string | null>(null);
  readonly selectedReportIds = input<readonly string[]>([]);
  readonly actionsCopy = input.required<ReportsCenterActionsCopy>();
  readonly eventTypesCopy = input.required<ReportsCenterEventTypeCopyBundle>();
  readonly markAllReadSupported = input(false);
  readonly markAllReadEnabled = input(false);
  readonly isLoading = input(false);
  readonly pageChange = output<{ first?: number | null; rows?: number | null }>();
  readonly selectReport = output<string>();
  readonly toggleReportSelection = output<string>();
  readonly toggleVisibleReportSelection = output<void>();
  readonly allVisibleReportsSelected = computed(() => {
    const selectedReportIds = this.selectedReportIds();
    const reports = this.reports();

    return (
      reports.length > 0
      && reports.every((report) => selectedReportIds.includes(report.reportId))
    );
  });
  readonly visibleSelectionActionCopy = computed(() =>
    this.allVisibleReportsSelected()
      ? this.actionsCopy().clearSelection
      : this.actionsCopy().selectAllVisible,
  );

  eventTypeCopy(report: ReportsCenterListRow): ReportsCenterEventTypeCopy {
    return reportsCenterEventTypeCopyByKey(
      this.eventTypesCopy(),
      report.eventType.key,
    );
  }
}
