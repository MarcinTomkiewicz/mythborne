import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  DirectTradeOfferReadModel,
  DirectTradeOverviewReadModel,
} from '../../../core/domain/trade/direct-trade.model';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { DirectTrades } from '../../../core/services/trade/direct-trades';
import { SelectOption } from '../../../core/types/select-option.types';
import { RequestToken } from '../../../core/utils/request-token';
import { TradeFeedbackState } from './trade-feedback.state';
import { directTradeOfferLabel } from './trade-labels';

@Injectable()
export class TradeOverviewState {
  private readonly activeHero = inject(ActiveHero);
  private readonly directTrades = inject(DirectTrades);
  private readonly destroyRef = inject(DestroyRef);
  private readonly feedback = inject(TradeFeedbackState);
  private readonly requestToken = new RequestToken();

  private activeServerId: string | null = null;
  private activeHeroId: string | null = null;

  readonly overview = signal<DirectTradeOverviewReadModel>({
    offers: [],
    transactions: [],
  });
  readonly isLoading = signal(false);

  loadData(): void {
    const token = this.requestToken.next();

    this.isLoading.set(true);
    this.feedback.error.set(null);

    this.activeHero
      .requireActiveHero()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state) => {
          if (!this.requestToken.isCurrent(token)) {
            return;
          }

          this.activeServerId = state.serverId;
          this.activeHeroId = state.heroId;
          this.loadOverview(state.serverId, state.heroId, token);
        },
        error: (error: unknown) => {
          if (!this.requestToken.isCurrent(token)) {
            return;
          }

          this.isLoading.set(false);
          this.feedback.setError(error, 'Failed to load active hero.');
        },
      });
  }

  refreshCurrent(): void {
    const context = this.currentContext();

    if (!context) {
      return;
    }

    const token = this.requestToken.next();

    this.isLoading.set(true);
    this.loadOverview(context.serverId, context.heroId, token);
  }

  currentContext(): { serverId: string; heroId: string } | null {
    return this.activeServerId && this.activeHeroId
      ? { serverId: this.activeServerId, heroId: this.activeHeroId }
      : null;
  }

  isCurrentContext(serverId: string, heroId: string): boolean {
    return this.activeServerId === serverId && this.activeHeroId === heroId;
  }

  currentHeroId(): string | null {
    return this.activeHeroId;
  }

  incomingOfferOptions(): SelectOption<string>[] {
    return this.overview()
      .offers.filter(
        (offer) =>
          offer.status === 'pending_target' && offer.target.heroId === this.activeHeroId,
      )
      .map((offer) => ({
        value: offer.id,
        label: this.offerLabel(offer),
      }));
  }

  offerLabel(offer: DirectTradeOfferReadModel): string {
    return directTradeOfferLabel(offer, this.activeHeroId);
  }

  syncIncomingOfferSelection(selectedOfferId: string | null): string | null {
    const options = this.incomingOfferOptions();

    return selectedOfferId && options.some((option) => option.value === selectedOfferId)
      ? selectedOfferId
      : options[0]?.value ?? null;
  }

  private loadOverview(serverId: string, heroId: string, token: number): void {
    this.directTrades
      .getTradesForHero({ serverId, heroId })
      .pipe(
        finalize(() => {
          if (this.requestToken.isCurrent(token)) {
            this.isLoading.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (overview) => {
          if (!this.isCurrentRequest(token, serverId, heroId)) {
            return;
          }

          this.overview.set(overview);
        },
        error: (error: unknown) => {
          if (!this.isCurrentRequest(token, serverId, heroId)) {
            return;
          }

          this.feedback.setError(error, 'Failed to load direct trades.');
        },
      });
  }

  private isCurrentRequest(token: number, serverId: string, heroId: string): boolean {
    return this.requestToken.isCurrent(token) && this.isCurrentContext(serverId, heroId);
  }
}
