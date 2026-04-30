import { Component, OnInit, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { AuctionCreateListingSection } from './auction-create-listing-section';
import { AuctionCreateListingState } from './auction-create-listing.state';
import { AuctionFeedbackState } from './auction-feedback.state';
import { AuctionListingActionsState } from './auction-listing-actions.state';
import { AuctionListingsSection } from './auction-listings-section';
import { AuctionOverviewState } from './auction-overview.state';
import { AuctionPageState } from './auction-page.state';

@Component({
  selector: 'app-auction-page',
  standalone: true,
  imports: [MessageModule, AuctionCreateListingSection, AuctionListingsSection],
  providers: [
    AuctionFeedbackState,
    AuctionOverviewState,
    AuctionCreateListingState,
    AuctionListingActionsState,
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
