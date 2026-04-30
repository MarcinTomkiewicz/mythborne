import { Injectable, inject } from '@angular/core';
import { AuctionCreateListingState } from './auction-create-listing.state';
import { AuctionFeedbackState } from './auction-feedback.state';
import { AuctionListingActionsState } from './auction-listing-actions.state';
import { AuctionOverviewState } from './auction-overview.state';

@Injectable()
export class AuctionPageState {
  readonly feedback = inject(AuctionFeedbackState);
  readonly overview = inject(AuctionOverviewState);
  readonly create = inject(AuctionCreateListingState);
  readonly actions = inject(AuctionListingActionsState);

  loadData(): void {
    this.overview.loadData();
  }
}
