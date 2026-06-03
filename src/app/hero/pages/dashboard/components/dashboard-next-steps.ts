import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardPageFacade } from '../../../../core/services/hero/dashboard-page.facade';

@Component({
  selector: 'app-dashboard-next-steps',
  standalone: true,
  imports: [RouterLink],
  host: { class: 'd-block w-100' },
  templateUrl: './dashboard-next-steps.html',
})
export class DashboardNextSteps {
  readonly page = input.required<DashboardPageFacade>();
}
