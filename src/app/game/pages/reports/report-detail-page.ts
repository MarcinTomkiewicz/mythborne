import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { ReportDetailPageState } from './report-detail-page.state';

@Component({
  selector: 'app-report-detail-page',
  standalone: true,
  imports: [ButtonModule, LoadingOverlay, RouterLink],
  providers: [ReportDetailPageState],
  templateUrl: './report-detail-page.html',
})
export class ReportDetailPage implements OnInit {
  readonly page = inject(ReportDetailPageState);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const reportId = this.route.snapshot.paramMap.get('reportId');

    if (reportId) {
      this.page.loadData(reportId);
    }
  }
}
