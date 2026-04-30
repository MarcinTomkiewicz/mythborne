import { Injectable, inject } from '@angular/core';
import { TradeCreateOfferState } from './trade-create-offer.state';
import { TradeFeedbackState } from './trade-feedback.state';
import { TradeOfferActionsState } from './trade-offer-actions.state';
import { TradeOverviewState } from './trade-overview.state';
import { TradeRespondOfferState } from './trade-respond-offer.state';

@Injectable()
export class TradePageState {
  readonly feedback = inject(TradeFeedbackState);
  readonly overview = inject(TradeOverviewState);
  readonly create = inject(TradeCreateOfferState);
  readonly respond = inject(TradeRespondOfferState);
  readonly actions = inject(TradeOfferActionsState);

  loadData(): void {
    this.overview.loadData();
  }
}
