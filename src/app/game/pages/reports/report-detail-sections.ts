import { Component, computed, input } from '@angular/core';
import {
  ReportDetailCore,
  ReportPageCopy,
} from '../../../core/domain/reports/report.model';
import { buildReportDetailSections } from './report-detail-section-display';

@Component({
  selector: 'app-report-detail-sections',
  standalone: true,
  templateUrl: './report-detail-sections.html',
  host: { class: 'd-block w-100 min-w-0' },
})
export class ReportDetailSections {
  readonly report = input.required<ReportDetailCore>();
  readonly sectionLabels = input.required<ReportPageCopy['detail']['sections']>();
  readonly emptyLabels = input.required<ReportPageCopy['detail']['empty']>();

  readonly sections = computed(() =>
    buildReportDetailSections(
      this.report(),
      this.sectionLabels(),
      this.emptyLabels(),
    ),
  );
}
