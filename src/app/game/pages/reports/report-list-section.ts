import { Component, input, output } from '@angular/core';
import { PaginatorModule } from 'primeng/paginator';
import {
  ReportListRow as ReportListRowModel,
  ReportPageCopy,
  ReportPagination,
} from '../../../core/domain/reports/report.model';
import { ReportListRow } from './report-list-row';

@Component({
  selector: 'app-report-list-section',
  standalone: true,
  imports: [
    PaginatorModule,
    ReportListRow,
  ],
  templateUrl: './report-list-section.html',
  host: { class: 'd-block w-100 min-w-0' },
})
export class ReportListSection {
  readonly title = input.required<string>();
  readonly emptyTitle = input.required<string>();
  readonly emptyText = input.required<string>();
  readonly unreadLabel = input.required<string>();
  readonly readLabel = input.required<string>();
  readonly unreadCount = input.required<number>();
  readonly reports = input.required<readonly ReportListRowModel[]>();
  readonly pagination = input.required<ReportPagination>();
  readonly labels = input.required<ReportPageCopy['labels']>();
  readonly detailSections = input.required<ReportPageCopy['detail']['sections']>();
  readonly pageChange = output<{ first?: number | null; rows?: number | null }>();
}
