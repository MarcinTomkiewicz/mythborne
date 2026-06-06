import { Component, OnInit, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { TradeOverviewState } from './trade-overview.state';
import { TradePageState } from './trade-page.state';

@Component({
  selector: 'app-trade-page',
  standalone: true,
  imports: [
    GamePageHeader,
    LoadingOverlay,
    MessageModule,
  ],
  providers: [
    TradeOverviewState,
    TradePageState,
  ],
  templateUrl: './trade-page.html',
})
export class TradePage implements OnInit {
  readonly page = inject(TradePageState);

  ngOnInit(): void {
    this.page.loadData();
  }
}
