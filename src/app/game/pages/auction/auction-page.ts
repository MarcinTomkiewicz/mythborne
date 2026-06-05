import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { AuctionOverviewState } from './auction-overview.state';
import { AuctionPageState } from './auction-page.state';

@Component({
  selector: 'app-auction-page',
  standalone: true,
  imports: [GamePageHeader, LoadingOverlay, RouterLink],
  providers: [
    AuctionOverviewState,
    AuctionPageState,
  ],
  templateUrl: './auction-page.html',
})
export class AuctionPage implements OnInit {
  readonly page = inject(AuctionPageState);

  ngOnInit(): void {
    this.page.loadData();
  }
}
