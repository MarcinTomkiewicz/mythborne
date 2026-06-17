import { Component, OnInit, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GamePageSummaryRow } from '../../../core/interfaces/game-page-summary-row.interface';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { PublicReportDetail } from '../../../core/domain/reports/report-detail.model';
import { isPublicPvpReportDetail } from '../../../core/utils/pvp-report-domain-context';
import { mapReportDetailPreviewView } from '../../../core/utils/report-detail-preview.mapper';
import { PvpPublicReportDomainContent } from '../../components/pvp-public-report-domain-content/pvp-public-report-domain-content';
import { ReportDetailPreviewDisplay } from '../../../game/components/report-detail-preview-card/report-detail-preview-display';
import { PublicReportPageState } from './public-report-page.state';

@Component({
  selector: 'app-public-report-page',
  standalone: true,
  imports: [
    GamePageHeader,
    LoadingOverlay,
    PvpPublicReportDomainContent,
    ReportDetailPreviewDisplay,
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
          shell.reportDate.value ? this.page.toDateTimeLabel(shell.reportDate.value) : ''
        ),
      },
    ];
  });
  readonly publicSnapshotPreview = computed(() => {
    const detail = this.page.detail();

    return detail?.report && !isPublicPvpReportDetail(detail)
      ? mapReportDetailPreviewView({
          detail,
          activeHeroId: null,
        })
      : null;
  });

  ngOnInit(): void {
    const publicToken = this.route.snapshot.paramMap.get('publicToken');

    if (publicToken) {
      this.page.loadData(publicToken);
      return;
    }

    this.page.markMissingRoutePublicToken();
  }

  isPublicPvpDetail(detail: PublicReportDetail | null): boolean {
    return !!detail?.report && isPublicPvpReportDetail(detail);
  }
}
