import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardPageFacade } from '../../../../core/services/hero/dashboard-page.facade';

@Component({
  selector: 'app-dashboard-persistent-state',
  standalone: true,
  imports: [RouterLink],
  host: { class: 'd-block w-100' },
  templateUrl: './dashboard-persistent-state.html',
})
export class DashboardPersistentState {
  readonly page = input.required<DashboardPageFacade>();
}
