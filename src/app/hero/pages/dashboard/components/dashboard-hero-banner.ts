import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameBar } from '../../../../shared/game-bar/game-bar';
import { DashboardPageFacade } from '../../../../core/services/hero/dashboard-page.facade';

@Component({
  selector: 'app-dashboard-hero-banner',
  standalone: true,
  imports: [GameBar, RouterLink],
  host: { class: 'd-block w-100' },
  templateUrl: './dashboard-hero-banner.html',
})
export class DashboardHeroBanner {
  readonly page = input.required<DashboardPageFacade>();
}
