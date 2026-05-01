import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { finalize } from 'rxjs';
import { DirectTradeItemTarget } from '../../../core/domain/trade/direct-trade.model';
import { PlayerAuctionMode } from '../../../core/domain/trade/player-auction.model';
import { DirectTradeActions } from '../../../core/services/trade/direct-trade-actions';
import { PlayerAuctionActions } from '../../../core/services/trade/player-auction-actions';
import { PlayerAuctionCreateForm } from '../../../core/types/forms/player-auction-form.types';
import { trimText } from '../../../core/utils/normalize-text';
import { RequestToken } from '../../../core/utils/request-token';
import { AuctionFeedbackState } from './auction-feedback.state';
import { AuctionOverviewState } from './auction-overview.state';
import { normalizeCharacterPoints, validateCreateAuctionValues } from './auction-validation';

@Injectable()
export class AuctionCreateListingState {
  private readonly itemSearch = inject(DirectTradeActions);
  private readonly auctionActions = inject(PlayerAuctionActions);
  private readonly overview = inject(AuctionOverviewState);
  private readonly feedback = inject(AuctionFeedbackState);
  private readonly destroyRef = inject(DestroyRef);
  private readonly itemSearchToken = new RequestToken();
  private readonly submitToken = new RequestToken();

  readonly itemSuggestions = signal<DirectTradeItemTarget[]>([]);
  readonly isSaving = signal(false);
  readonly modeOptions: { label: string; value: PlayerAuctionMode }[] = [
    { label: 'Bidding', value: 'bidding' },
    { label: 'Buy now', value: 'buy_now' },
    { label: 'Bidding with buy now', value: 'bidding_with_buy_now' },
  ];
  readonly form: PlayerAuctionCreateForm = new FormGroup({
    item: new FormControl<DirectTradeItemTarget | null>(null, Validators.required),
    auctionMode: new FormControl<PlayerAuctionMode | null>('bidding', Validators.required),
    startingBidCharacterPoints: new FormControl<number | null>(null),
    buyNowCharacterPoints: new FormControl<number | null>(null),
    description: new FormControl<string | null>(null),
  });

  searchItemTargets(event: AutoCompleteCompleteEvent): void {
    const context = this.overview.currentContext();
    const query = trimText(event.query);
    const token = this.itemSearchToken.next();

    if (!context || query.length < 2) {
      this.itemSuggestions.set([]);
      return;
    }

    this.itemSearch
      .searchOwnItemTargets({ ...context, query })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          if (!this.isCurrentItemSearch(token, context.serverId, context.heroId, query)) {
            return;
          }

          this.itemSuggestions.set(items);
        },
        error: (error: unknown) => {
          if (!this.isCurrentItemSearch(token, context.serverId, context.heroId, query)) {
            return;
          }

          this.feedback.setError(error, 'Failed to search auction items.');
        },
      });
  }

  submit(): void {
    const context = this.overview.currentContext();
    const item = this.form.controls.item.value;
    const auctionMode = this.form.controls.auctionMode.value;
    const startingBidCharacterPoints = normalizeCharacterPoints(
      this.form.controls.startingBidCharacterPoints.value,
    );
    const buyNowCharacterPoints = normalizeCharacterPoints(
      this.form.controls.buyNowCharacterPoints.value,
    );

    this.feedback.clear();

    if (!context || !item) {
      this.form.markAllAsTouched();
      this.feedback.error.set('Auction item is required.');
      return;
    }

    const validationError = validateCreateAuctionValues({
      auctionMode,
      startingBidCharacterPoints,
      buyNowCharacterPoints,
    });

    if (validationError || !auctionMode) {
      this.feedback.error.set(validationError ?? 'Auction mode is required.');
      return;
    }

    const token = this.submitToken.next();

    this.isSaving.set(true);
    this.auctionActions
      .createListing({
        sellerHeroId: context.heroId,
        itemId: item.itemId,
        auctionMode,
        startingBidCharacterPoints:
          auctionMode === 'buy_now' ? null : startingBidCharacterPoints,
        buyNowCharacterPoints: auctionMode === 'bidding' ? null : buyNowCharacterPoints,
        description: this.form.controls.description.value,
      })
      .pipe(
        finalize(() => {
          if (this.submitToken.isCurrent(token)) {
            this.isSaving.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          if (!this.isCurrentSubmit(token, context.serverId, context.heroId)) {
            return;
          }

          this.feedback.setSuccess('Auction listing created.');
          this.form.reset({
            item: null,
            auctionMode: 'bidding',
            startingBidCharacterPoints: null,
            buyNowCharacterPoints: null,
            description: null,
          });
          this.overview.refreshCurrent();
        },
        error: (error: unknown) => {
          if (!this.isCurrentSubmit(token, context.serverId, context.heroId)) {
            return;
          }

          this.feedback.setError(error, 'Auction workflow failed.');
        },
      });
  }

  private isCurrentItemSearch(
    token: number,
    serverId: string,
    heroId: string,
    query: string,
  ): boolean {
    return (
      this.itemSearchToken.isCurrent(token) &&
      this.overview.isCurrentContext(serverId, heroId) &&
      trimText(query).length >= 2
    );
  }

  private isCurrentSubmit(token: number, serverId: string, heroId: string): boolean {
    return this.submitToken.isCurrent(token) && this.overview.isCurrentContext(serverId, heroId);
  }
}
