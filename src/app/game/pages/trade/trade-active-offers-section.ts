import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ItemDetailPopover } from '../../../shared/item-detail-popover/item-detail-popover';
import { TradeOfferActionsState } from './trade-offer-actions.state';
import { TradeOverviewState } from './trade-overview.state';

@Component({
  selector: 'app-trade-active-offers-section',
  standalone: true,
  imports: [ButtonModule, ItemDetailPopover],
  templateUrl: './trade-active-offers-section.html',
})
export class TradeActiveOffersSection {
  readonly overview = inject(TradeOverviewState);
  readonly actions = inject(TradeOfferActionsState);
}
