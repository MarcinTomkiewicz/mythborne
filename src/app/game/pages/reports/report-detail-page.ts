import { Component, DestroyRef, OnInit, effect, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PrivateGameReportDetail } from '../../../core/domain/reports/game-report.model';
import { RouteBackgroundOverride } from '../../../core/services/ui/route-background-override';
import { GameReportContent } from '../../../shared/game-report-content/game-report-content';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { PvpSpyReport } from '../../../shared/pvp-spy-report/pvp-spy-report';
import { ReportDetailPageState } from './report-detail-page.state';

const SPY_REPORT_BACKGROUND_SOURCE = 'report-spy';
const SPY_REPORT_BACKGROUND_IMAGE = "url('/images/backgrounds/spy-background.png')";

@Component({
  selector: 'app-report-detail-page',
  standalone: true,
  imports: [ButtonModule, GameReportContent, LoadingOverlay, PvpSpyReport, RouterLink],
  providers: [ReportDetailPageState],
  templateUrl: './report-detail-page.html',
  host: { class: 'd-block w-100' },
})
export class ReportDetailPage implements OnInit {
  readonly page = inject(ReportDetailPageState);
  private readonly route = inject(ActivatedRoute);
  private readonly routeBackgroundOverride = inject(RouteBackgroundOverride);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const report = this.page.report();

      if (report && isSpyReport(report)) {
        this.routeBackgroundOverride.set(
          SPY_REPORT_BACKGROUND_SOURCE,
          SPY_REPORT_BACKGROUND_IMAGE,
        );
        return;
      }

      this.routeBackgroundOverride.clear(SPY_REPORT_BACKGROUND_SOURCE);
    });

    this.destroyRef.onDestroy(() => {
      this.routeBackgroundOverride.clear(SPY_REPORT_BACKGROUND_SOURCE);
    });
  }

  ngOnInit(): void {
    const reportId = this.route.snapshot.paramMap.get('reportId');

    if (reportId) {
      this.page.loadData(reportId);
    }
  }
}

function isSpyReport(report: PrivateGameReportDetail): boolean {
  return report.reportTypeKey === 'pvp_spy' ||
    report.spySection !== null;
}
