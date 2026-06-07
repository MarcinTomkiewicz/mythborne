import { Component, input, output } from '@angular/core';
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
  readonly pageChange = output<{ first?: number | null; rows?: number | null }>();
  readonly selectReport = output<string>();
}
