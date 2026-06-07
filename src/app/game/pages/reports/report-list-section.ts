import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { ReportsCenterListCopy } from '../../../core/domain/reports/reports-center-copy.model';
import {
  ReportsCenterCountsV1,
  ReportsCenterListRowV2,
  ReportsCenterPaginationV1,
} from '../../../core/domain/reports/reports-center.model';
import { ReportsCenterListRow } from './report-list-row';

@Component({
  selector: 'app-report-list-section',
  standalone: true,
  imports: [
    ButtonModule,
    PaginatorModule,
    ReportsCenterListRow,
  ],
  templateUrl: './report-list-section.html',
  host: { class: 'd-block w-100 min-w-0' },
})
export class ReportListSection {
  readonly copy = input.required<ReportsCenterListCopy>();
  readonly reports = input.required<readonly ReportsCenterListRowV2[]>();
  readonly pagination = input.required<ReportsCenterPaginationV1>();
  readonly counts = input.required<ReportsCenterCountsV1>();
  readonly selectedReportId = input<string | null>(null);
  readonly markAllReadSupported = input(false);
  readonly markAllReadEnabled = input(false);
  readonly markAllReadLabel = input.required<string>();
  readonly markAllReadDisabledTooltip = input.required<string>();
  readonly isLoading = input(false);
  readonly pageChange = output<{ first?: number | null; rows?: number | null }>();
  readonly selectReport = output<string>();
  readonly markAllRead = output<void>();
}
