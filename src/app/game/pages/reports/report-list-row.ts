import { Component, input } from '@angular/core';
import { ReportListRow as ReportListRowModel, ReportPageCopy } from '../../../core/domain/reports/report.model';
import { toDateTimeLabel } from '../../../core/utils/date-display';

@Component({
  selector: 'app-report-list-row',
  standalone: true,
  templateUrl: './report-list-row.html',
  host: { class: 'd-block w-100' },
})
export class ReportListRow {
  readonly report = input.required<ReportListRowModel>();
  readonly unreadLabel = input.required<string>();
  readonly readLabel = input.required<string>();
  readonly labels = input.required<ReportPageCopy['labels']>();
  readonly detailSections = input.required<ReportPageCopy['detail']['sections']>();

  formatDateTime(value: string): string {
    return toDateTimeLabel(value);
  }
}
