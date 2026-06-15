import { Component, computed, input } from '@angular/core';
import { ReportDetail } from '../../../core/domain/reports/report-detail.model';
import { ExplorationReportResultContent } from '../exploration-report-result-content/exploration-report-result-content';

@Component({
  selector: 'app-exploration-report-domain-content',
  standalone: true,
  imports: [
    ExplorationReportResultContent,
  ],
  templateUrl: './exploration-report-domain-content.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationReportDomainContent {
  readonly detail = input.required<ReportDetail>();

  readonly reportId = computed(() => this.detail().domainContextJson.gameReportId);
}
