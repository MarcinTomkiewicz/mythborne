import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PlayerAuctionTransactionReadModel } from '../../../core/domain/trade/player-auction.model';
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

  transactionLabel(transaction: PlayerAuctionTransactionReadModel): string {
    const item = transaction.items[0];
    const itemName = item?.itemName ?? item?.itemId ?? 'Auction item';
    return `${itemName} - ${transaction.seller.heroName ?? transaction.seller.heroId ?? 'Seller'} -> ${
      transaction.buyer.heroName ?? transaction.buyer.heroId ?? 'Buyer'
    }`;
  }
}
