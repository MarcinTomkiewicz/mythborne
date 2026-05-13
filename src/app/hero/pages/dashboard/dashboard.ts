import { Component, OnInit, inject } from '@angular/core';
import { DashboardPageFacade } from '../../../core/services/hero/dashboard-page.facade';
import { DashboardBaseStatsCardComponent } from './components/dashboard-base-stats-card.component';
import { DashboardCharacterPointsHistoryComponent } from './components/dashboard-character-points-history.component';
import { DashboardDerivedStatsCardComponent } from './components/dashboard-derived-stats-card.component';
import { DashboardHeroBannerComponent } from './components/dashboard-hero-banner.component';
import { DashboardNextStepsComponent } from './components/dashboard-next-steps.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DashboardBaseStatsCardComponent,
    DashboardCharacterPointsHistoryComponent,
    DashboardDerivedStatsCardComponent,
    DashboardHeroBannerComponent,
    DashboardNextStepsComponent,
  ],
  providers: [DashboardPageFacade],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  readonly page = inject(DashboardPageFacade);

  ngOnInit(): void {
    this.page.loadData();
  }
}
