import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { DirectTradeOfferReadModel } from '../../../core/domain/trade/direct-trade.model';
import { DirectTradeActions } from '../../../core/services/trade/direct-trade-actions';
import { TradeFeedbackState } from './trade-feedback.state';
import { TradeOverviewState } from './trade-overview.state';
import { TradeRequestToken } from './trade-request-token';

@Injectable()
export class TradeOfferActionsState {
  private readonly tradeActions = inject(DirectTradeActions);
  private readonly overview = inject(TradeOverviewState);
  private readonly feedback = inject(TradeFeedbackState);
  private readonly destroyRef = inject(DestroyRef);
  private readonly requestToken = new TradeRequestToken();

  readonly isSaving = signal(false);

  canCancel(offer: DirectTradeOfferReadModel): boolean {
    return offer.creator.heroId === this.overview.currentHeroId();
  }

  canConfirm(offer: DirectTradeOfferReadModel): boolean {
    return (
      offer.status === 'pending_creator' &&
      offer.creator.heroId === this.overview.currentHeroId()
    );
  }

  confirmOffer(offer: DirectTradeOfferReadModel): void {
    const context = this.overview.currentContext();

    if (!context) {
      return;
    }

    const token = this.requestToken.next();

    this.isSaving.set(true);
    this.feedback.clear();
    this.tradeActions
      .confirmOffer({
        offerId: offer.id,
        description: 'Creator confirmed direct trade.',
      })
      .pipe(
        finalize(() => {
          if (this.requestToken.isCurrent(token)) {
            this.isSaving.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.applySuccess(token, context, 'Trade confirmed.'),
        error: (error: unknown) => this.applyError(token, context, error),
      });
  }

  cancelOffer(offer: DirectTradeOfferReadModel): void {
    const context = this.overview.currentContext();

    if (!context) {
      return;
    }

    const token = this.requestToken.next();

    this.isSaving.set(true);
    this.feedback.clear();
    this.tradeActions
      .cancelOffer({
        offerId: offer.id,
        statusReason: 'Cancelled by player.',
      })
      .pipe(
        finalize(() => {
          if (this.requestToken.isCurrent(token)) {
            this.isSaving.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.applySuccess(token, context, 'Trade offer cancelled.'),
        error: (error: unknown) => this.applyError(token, context, error),
      });
  }

  private applySuccess(
    token: number,
    context: { serverId: string; heroId: string },
    message: string,
  ): void {
    if (!this.isCurrentRequest(token, context)) {
      return;
    }

    this.feedback.setSuccess(message);
    this.overview.refreshCurrent();
  }

  private applyError(
    token: number,
    context: { serverId: string; heroId: string },
    error: unknown,
  ): void {
    if (!this.isCurrentRequest(token, context)) {
      return;
    }

    this.feedback.setError(error, 'Trade workflow failed.');
  }

  private isCurrentRequest(
    token: number,
    context: { serverId: string; heroId: string },
  ): boolean {
    return (
      this.requestToken.isCurrent(token) &&
      this.overview.isCurrentContext(context.serverId, context.heroId)
    );
  }
}
