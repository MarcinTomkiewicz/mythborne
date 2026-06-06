import { Component, OnInit, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { AuctionFiltersPanel } from './auction-filters-panel';
import { AuctionListingsSection } from './auction-listings-section';
import { AuctionOverviewState } from './auction-overview.state';
import { AuctionPageState } from './auction-page.state';
import { AuctionRulesPanel } from './auction-rules-panel';

@Component({
  selector: 'app-auction-page',
  standalone: true,
  imports: [
    AuctionFiltersPanel,
    AuctionListingsSection,
    AuctionRulesPanel,
    GamePageHeader,
    LoadingOverlay,
    MessageModule,
  ],
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
