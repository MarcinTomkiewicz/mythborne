import { Component, OnInit, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GamePageSummaryRow } from '../../../core/interfaces/game-page-summary-row.interface';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { ReportDetailSections } from './report-detail-sections';
import { ReportDetailPageState } from './report-detail-page.state';

@Component({
  selector: 'app-report-detail-page',
  standalone: true,
  imports: [
    GamePageHeader,
    LoadingOverlay,
    ReportDetailSections,
  ],
  providers: [ReportDetailPageState],
  templateUrl: './report-detail-page.html',
})
export class ReportDetailPage implements OnInit {
  readonly page = inject(ReportDetailPageState);
  private readonly route = inject(ActivatedRoute);
  readonly headerSummaryRows = computed<readonly GamePageSummaryRow[]>(() => {
    const copy = this.page.copy();
    const detail = this.page.detail();

    if (!copy || !detail) {
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
        value: this.page.formatDateTime(detail.report.createdAt),
      },
      {
        key: 'reportsCenter',
        label: copy.reportsCenter.header.title,
        value: copy.reportShell.header.backAction,
        route: '/game/reports',
      },
    ];
  });

  ngOnInit(): void {
    const reportId = this.route.snapshot.paramMap.get('reportId');

    if (reportId) {
      this.page.loadData(reportId);
    }
  }
}
