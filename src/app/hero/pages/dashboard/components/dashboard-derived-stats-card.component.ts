import { Component, input } from '@angular/core';
import { DashboardPageFacade } from '../../../../core/services/hero/dashboard-page.facade';

@Component({
  selector: 'app-dashboard-derived-stats-card',
  standalone: true,
  host: { class: 'd-block w-100' },
  templateUrl: './dashboard-derived-stats-card.component.html',
})
export class DashboardDerivedStatsCardComponent {
  readonly page = input.required<DashboardPageFacade>();
}
