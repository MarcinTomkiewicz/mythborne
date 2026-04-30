import { Component, OnInit, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { TradeActiveOffersSection } from './trade-active-offers-section';
import { TradeCreateOfferSection } from './trade-create-offer-section';
import { TradeCreateOfferState } from './trade-create-offer.state';
import { TradeFeedbackState } from './trade-feedback.state';
import { TradeOfferActionsState } from './trade-offer-actions.state';
import { TradeOverviewState } from './trade-overview.state';
import { TradePageState } from './trade-page.state';
import { TradeRespondOfferSection } from './trade-respond-offer-section';
import { TradeRespondOfferState } from './trade-respond-offer.state';

@Component({
  selector: 'app-trade-page',
  standalone: true,
  imports: [
    MessageModule,
    TradeCreateOfferSection,
    TradeRespondOfferSection,
    TradeActiveOffersSection,
  ],
  providers: [
    TradeFeedbackState,
    TradeOverviewState,
    TradeCreateOfferState,
    TradeRespondOfferState,
    TradeOfferActionsState,
    TradePageState,
  ],
  templateUrl: './trade-page.html',
})
export class TradePage implements OnInit {
  readonly page = inject(TradePageState);

  ngOnInit(): void {
    this.page.loadData();
  }
}
