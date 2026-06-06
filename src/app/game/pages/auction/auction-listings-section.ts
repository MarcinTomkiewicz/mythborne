import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import {
  AuctionListingRow as AuctionListingRowModel,
  AuctionPagination,
  AuctionPageCopy,
} from '../../../core/domain/trade/player-auction.model';
import { AuctionListingRow } from './auction-listing-row';

@Component({
  selector: 'app-auction-listings-section',
  standalone: true,
  imports: [
    AuctionListingRow,
    ButtonModule,
    PaginatorModule,
  ],
  templateUrl: './auction-listings-section.html',
})
export class AuctionListingsSection {
  readonly title = input.required<string>();
  readonly emptyLabel = input.required<string>();
  readonly listings = input.required<readonly AuctionListingRowModel[]>();
  readonly pagination = input.required<AuctionPagination>();
  readonly actions = input.required<AuctionPageCopy['actions']>();
  readonly labels = input.required<AuctionPageCopy['labels']>();
  readonly isLoading = input.required<boolean>();
  readonly refresh = output<void>();
  readonly pageChange = output<{ first?: number | null; rows?: number | null }>();
}
