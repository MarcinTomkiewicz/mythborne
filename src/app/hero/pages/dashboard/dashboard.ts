import { Component, OnInit, inject } from '@angular/core';
import { DashboardPageFacade } from '../../../core/services/hero/dashboard-page.facade';
import { CurrentEquipmentState } from '../../../core/services/items/current-equipment.state';
import { DashboardBaseStatsCard } from './components/dashboard-base-stats-card';
import { DashboardDerivedStatsCard } from './components/dashboard-derived-stats-card';
import { DashboardEquipmentPreview } from './components/dashboard-equipment-preview';
import { DashboardHeroBanner } from './components/dashboard-hero-banner';
import { DashboardNextSteps } from './components/dashboard-next-steps';
import { DashboardPersistentState } from './components/dashboard-persistent-state';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DashboardBaseStatsCard,
    DashboardDerivedStatsCard,
    DashboardEquipmentPreview,
    DashboardHeroBanner,
    DashboardNextSteps,
    DashboardPersistentState,
  ],
  providers: [DashboardPageFacade, CurrentEquipmentState],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  readonly page = inject(DashboardPageFacade);

  ngOnInit(): void {
    this.page.loadData();
  }
}
