import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { GameReportContent } from '../../../shared/game-report-content/game-report-content';
import { PublicReportPageState } from './public-report-page.state';

@Component({
  selector: 'app-public-report-page',
  standalone: true,
  imports: [GameReportContent, LoadingOverlay, RouterLink],
  providers: [PublicReportPageState],
  templateUrl: './public-report-page.html',
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
