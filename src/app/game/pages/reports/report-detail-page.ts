import { Component, OnInit, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GamePageSummaryRow } from '../../../core/interfaces/game-page-summary-row.interface';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { PrivateReportDetailPage } from '../../../core/domain/reports/report-detail.model';
import { isPrivatePvpReportDetail } from '../../../core/utils/pvp-report-domain-context';
import { ReportDetailSections } from './report-detail-sections';
import { ReportDetailPageState } from './report-detail-page.state';
import { PvpReportDomainContent } from '../../components/pvp-report-domain-content/pvp-report-domain-content';

@Component({
  selector: 'app-report-detail-page',
  standalone: true,
  imports: [
    GamePageHeader,
    LoadingOverlay,
    PvpReportDomainContent,
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

    const shell = detail.reportShellContextJson;
    const sourceValue = shell.source.label;

    return [
      {
        key: 'reportType',
        label: copy.reportShell.meta.eventTypeLabel,
        value: shell.eventType.label,
      },
      ...(sourceValue
        ? [{
          key: 'source',
          label: copy.reportShell.meta.sourceLabel,
          value: sourceValue,
        }]
        : []),
      {
        key: 'createdAt',
        label: copy.reportShell.meta.reportDateLabel,
        value: shell.reportDate.displayValue ?? (
          shell.reportDate.value ? this.page.formatDateTime(shell.reportDate.value) : ''
        ),
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

  isPrivatePvpDetail(detail: PrivateReportDetailPage): boolean {
    return isPrivatePvpReportDetail(detail);
  }
}
