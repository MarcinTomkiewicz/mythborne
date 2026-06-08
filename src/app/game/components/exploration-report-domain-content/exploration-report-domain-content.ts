import { Component, computed, input } from '@angular/core';
import { ReportDetailV2 } from '../../../core/domain/reports/report-detail.model';
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
  readonly detail = input.required<ReportDetailV2>();

  readonly reportId = computed(() => this.detail().domainContextJson.gameReportId);
}
