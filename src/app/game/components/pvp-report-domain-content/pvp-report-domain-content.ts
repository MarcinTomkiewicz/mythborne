import { Component, computed, input } from '@angular/core';
import type {
  PrivateReportDetailPage,
} from '../../../core/domain/reports/report.model';
import { mapReportDetailPreviewView } from '../../../core/utils/report-detail-preview.mapper';
import { ReportDetailPreviewDisplay } from '../report-detail-preview-card/report-detail-preview-display';

@Component({
  selector: 'app-pvp-report-domain-content',
  standalone: true,
  imports: [
    ReportDetailPreviewDisplay,
  ],
  templateUrl: './pvp-report-domain-content.html',
  host: { class: 'd-block w-100' },
})
export class PvpReportDomainContent {
  readonly detail = input.required<PrivateReportDetailPage>();
  readonly activeHeroId = input<string | null>(null);

  readonly preview = computed(() =>
    mapReportDetailPreviewView({
      detail: this.detail(),
      activeHeroId: this.activeHeroId(),
      showRewardResult: true,
    }),
  );
}
