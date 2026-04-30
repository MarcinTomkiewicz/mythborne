import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TradeOfferActionsState } from './trade-offer-actions.state';
import { TradeOverviewState } from './trade-overview.state';

@Component({
  selector: 'app-trade-active-offers-section',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './trade-active-offers-section.html',
})
export class TradeActiveOffersSection {
  readonly overview = inject(TradeOverviewState);
  readonly actions = inject(TradeOfferActionsState);
}
