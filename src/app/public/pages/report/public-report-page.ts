import { Component, OnInit, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { GamePageSummaryRow } from '../../../core/interfaces/game-page-summary-row.interface';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { ReportDetailSections } from '../../../game/pages/reports/report-detail-sections';
import { PublicReportPageState } from './public-report-page.state';

@Component({
  selector: 'app-public-report-page',
  standalone: true,
  imports: [
    ButtonModule,
    GamePageHeader,
    LoadingOverlay,
    ReportDetailSections,
    RouterLink,
  ],
  providers: [PublicReportPageState],
  templateUrl: './public-report-page.html',
  host: { class: 'd-block w-100' },
})
export class PublicReportPage implements OnInit {
  readonly page = inject(PublicReportPageState);
  private readonly route = inject(ActivatedRoute);

  readonly headerSummaryRows = computed<readonly GamePageSummaryRow[]>(() => {
    const copy = this.page.copy();
    const detail = this.page.detail();

    if (!copy || !detail?.report) {
      return [];
    }

    return [
      {
        key: 'reportType',
        label: copy.reportShell.meta.eventTypeLabel,
        value: detail.report.reportTypeLabel,
      },
      ...(detail.report.sourceLabel
        ? [{
          key: 'source',
          label: copy.reportShell.meta.sourceLabel,
          value: detail.report.sourceLabel,
        }]
        : []),
      {
        key: 'createdAt',
        label: copy.reportShell.meta.reportDateLabel,
        value: this.page.toDateTimeLabel(detail.report.createdAt),
      },
    ];
  });

  ngOnInit(): void {
    const publicToken = this.route.snapshot.paramMap.get('publicToken');

    if (publicToken) {
      this.page.loadData(publicToken);
    }
  }
}
