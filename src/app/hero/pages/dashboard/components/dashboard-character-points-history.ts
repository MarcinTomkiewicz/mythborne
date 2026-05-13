import { Component, input } from '@angular/core';
import { DashboardPageFacade } from '../../../../core/services/hero/dashboard-page.facade';

@Component({
  selector: 'app-dashboard-character-points-history',
  standalone: true,
  host: { class: 'd-block w-100' },
  templateUrl: './dashboard-character-points-history.html',
})
export class DashboardCharacterPointsHistory {
  readonly page = input.required<DashboardPageFacade>();
}
