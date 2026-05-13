import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardPageFacade } from '../../../../core/services/hero/dashboard-page.facade';

@Component({
  selector: 'app-dashboard-estate-card',
  standalone: true,
  imports: [RouterLink],
  host: { class: 'd-block w-100' },
  templateUrl: './dashboard-estate-card.html',
})
export class DashboardEstateCard {
  readonly page = input.required<DashboardPageFacade>();
}
