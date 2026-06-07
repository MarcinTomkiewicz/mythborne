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
        label: copy.labels.reportType,
        value: detail.report.reportTypeLabel,
      },
      ...(detail.report.sourceLabel
        ? [{
          key: 'source',
          label: copy.labels.source,
          value: detail.report.sourceLabel,
        }]
        : []),
      {
        key: 'createdAt',
        label: copy.labels.createdAt,
        value: this.page.formatDateTime(detail.report.createdAt),
      },
      {
        key: 'readState',
        label: copy.labels.readState,
        value: detail.access.isUnread
          ? copy.reportsCenter.list.unreadLabel
          : copy.reportsCenter.list.readLabel,
      },
      {
        key: 'reportsCenter',
        label: copy.reportsCenter.header.title,
        value: copy.detail.header.backAction,
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
