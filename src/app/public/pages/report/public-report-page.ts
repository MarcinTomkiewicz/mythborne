import { Component, OnInit, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { GamePageSummaryRow } from '../../../core/interfaces/game-page-summary-row.interface';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { ReportDetailSections } from '../../../game/pages/reports/report-detail-sections';
import { PublicReportDetailV2 } from '../../../core/domain/reports/report-detail.model';
import { isPublicPvpReportDetail } from '../../../core/utils/pvp-report-domain-context';
import { PvpPublicReportDomainContent } from '../../components/pvp-public-report-domain-content/pvp-public-report-domain-content';
import { PublicReportPageState } from './public-report-page.state';

@Component({
  selector: 'app-public-report-page',
  standalone: true,
  imports: [
    ButtonModule,
    GamePageHeader,
    LoadingOverlay,
    PvpPublicReportDomainContent,
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
    const pvpCopy = this.page.pvpPublicReportCopy();

    if (pvpCopy?.access.isAvailable) {
      return pvpCopy.shell && copy
        ? [
            {
              key: 'reportType',
              label: copy.reportShell.meta.eventTypeLabel,
              value: pvpCopy.shell.reportTypeLabel,
            },
            {
              key: 'source',
              label: copy.reportShell.meta.sourceLabel,
              value: pvpCopy.shell.sourceLabel,
            },
            {
              key: 'createdAt',
              label: copy.reportShell.meta.reportDateLabel,
              value: pvpCopy.shell.createdAt,
            },
          ]
        : [];
    }

    const detail = this.page.detail();

    if (pvpCopy && (!detail?.report || isPublicPvpReportDetail(detail))) {
      return [];
    }

    if (!copy || !detail?.report) {
      return [];
    }

    const sourceValue = detail.report.sourceLabel;

    return [
      {
        key: 'reportType',
        label: copy.reportShell.meta.eventTypeLabel,
        value: detail.report.reportTypeLabel,
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

  isPublicPvpDetail(detail: PublicReportDetailV2 | null): boolean {
    return !!detail?.report && isPublicPvpReportDetail(detail);
  }
}
