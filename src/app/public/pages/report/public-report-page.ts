import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { GameReportContent } from '../../../shared/game-report-content/game-report-content';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { PvpSpyReport } from '../../../shared/pvp-spy-report/pvp-spy-report';
import { PublicReportPageState } from './public-report-page.state';

@Component({
  selector: 'app-public-report-page',
  standalone: true,
  imports: [ButtonModule, GameReportContent, LoadingOverlay, PvpSpyReport, RouterLink],
  providers: [PublicReportPageState],
  templateUrl: './public-report-page.html',
  host: { class: 'd-block w-100' },
})
export class PublicReportPage implements OnInit {
  readonly page = inject(PublicReportPageState);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const publicToken = this.route.snapshot.paramMap.get('publicToken');

    if (publicToken) {
      this.page.loadData(publicToken);
    } else {
      this.page.isNotFound.set(true);
      this.page.isLoading.set(false);
    }
  }
}
