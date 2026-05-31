import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardWorldStateActionKey } from '../../../../core/services/hero/dashboard-persistent-state.model';
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

  actionRoute(actionKey: DashboardWorldStateActionKey | null | undefined): string | null {
    switch (actionKey) {
      case 'open_vicinity':
        return '/game/vicinity';
      case 'open_estate':
        return '/game/mansion';
      case 'open_exploration':
        return '/game/exploration';
      case null:
      case undefined:
        return null;
    }
  }
}
