import { Component, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  AuctionListingRow as AuctionListingRowModel,
  AuctionPageCopy,
} from '../../../core/domain/trade/player-auction.model';
import { toDateTimeLabel } from '../../../core/utils/date-display';
import { toShortDurationLabel } from '../../../core/utils/duration-display';
import { ItemDetailPopover } from '../../../shared/item-detail-popover/item-detail-popover';

@Component({
  selector: 'app-auction-listing-row',
  standalone: true,
  imports: [
    ButtonModule,
    ItemDetailPopover,
  ],
  templateUrl: './auction-listing-row.html',
  host: { class: 'd-block w-100' },
})
export class AuctionListingRow {
  readonly listing = input.required<AuctionListingRowModel>();
  readonly actions = input.required<AuctionPageCopy['actions']>();
  readonly labels = input.required<AuctionPageCopy['labels']>();

  formatDuration(seconds: number): string {
    return toShortDurationLabel(seconds);
  }

  formatDateTime(value: string): string {
    return toDateTimeLabel(value);
  }
}
