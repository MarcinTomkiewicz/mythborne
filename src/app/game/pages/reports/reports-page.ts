import { Component, OnInit, inject } from '@angular/core';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { ReportsPageState } from './reports-page.state';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    GamePageHeader,
    LoadingOverlay,
  ],
  providers: [ReportsPageState],
  templateUrl: './reports-page.html',
})
export class ReportsPage implements OnInit {
  readonly page = inject(ReportsPageState);

  ngOnInit(): void {
    this.page.loadData();
  }
}
