import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { AuctionListingActionsState } from './auction-listing-actions.state';
import { auctionSellerLabel } from './auction-labels';
import { AuctionOverviewState } from './auction-overview.state';

@Component({
  selector: 'app-auction-listings-section',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputNumberModule, InputTextModule],
  templateUrl: './auction-listings-section.html',
})
export class AuctionListingsSection {
  readonly overview = inject(AuctionOverviewState);
  readonly actions = inject(AuctionListingActionsState);
  readonly sellerLabel = auctionSellerLabel;
}
