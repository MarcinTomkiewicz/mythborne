import { Component, input } from '@angular/core';
import { DashboardPageFacade } from '../../../../core/services/hero/dashboard-page.facade';

@Component({
  selector: 'app-dashboard-base-stats-card',
  standalone: true,
  host: { class: 'd-block w-100 h-100' },
  templateUrl: './dashboard-base-stats-card.component.html',
})
export class DashboardBaseStatsCardComponent {
  readonly page = input.required<DashboardPageFacade>();
}
