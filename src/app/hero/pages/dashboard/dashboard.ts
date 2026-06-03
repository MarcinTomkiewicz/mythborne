import { Component, OnInit, inject } from '@angular/core';
import { DashboardPageFacade } from '../../../core/services/hero/dashboard-page.facade';
import { DashboardDerivedStatsCard } from './components/dashboard-derived-stats-card';
import { DashboardEquipmentPreview } from './components/dashboard-equipment-preview';
import { DashboardHeroBanner } from './components/dashboard-hero-banner';
import { DashboardNextSteps } from './components/dashboard-next-steps';
import { DashboardPersistentState } from './components/dashboard-persistent-state';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { StatCard } from '../../../shared/stat-card/stat-card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DashboardDerivedStatsCard,
    DashboardEquipmentPreview,
    DashboardHeroBanner,
    DashboardNextSteps,
    DashboardPersistentState,
    LoadingOverlay,
    StatCard,
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
