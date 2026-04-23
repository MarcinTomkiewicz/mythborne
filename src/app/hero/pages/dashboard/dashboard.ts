import { Component, OnInit, inject } from '@angular/core';
import { DashboardPageFacade } from '../../../core/services/hero/dashboard-page.facade';
import { GameBar } from '../../../shared/game-bar/game-bar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [GameBar],
  providers: [DashboardPageFacade],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  readonly page = inject(DashboardPageFacade);

  ngOnInit(): void {
    this.page.loadData();
  }
}
