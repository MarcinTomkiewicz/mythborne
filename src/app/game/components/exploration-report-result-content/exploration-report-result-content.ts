import { Component, input } from '@angular/core';
import { ReportDetailPreviewCard } from '../report-detail-preview-card/report-detail-preview-card';

@Component({
  selector: 'app-exploration-report-result-content',
  standalone: true,
  imports: [
    ReportDetailPreviewCard,
  ],
  templateUrl: './exploration-report-result-content.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationReportResultContent {
  readonly reportId = input.required<string>();
  readonly reportLabel = input<string | undefined>(undefined);
}
