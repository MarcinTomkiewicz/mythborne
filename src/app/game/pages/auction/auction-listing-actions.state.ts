import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, finalize } from 'rxjs';
import { PlayerAuctionListingReadModel } from '../../../core/domain/trade/player-auction.model';
import { PlayerAuctionActions } from '../../../core/services/trade/player-auction-actions';
import { PlayerAuctionBidForm } from '../../../core/types/forms/player-auction-form.types';
import { RequestToken } from '../../../core/utils/request-token';
import { AuctionFeedbackState } from './auction-feedback.state';
import { AuctionOverviewState } from './auction-overview.state';
import { normalizeCharacterPoints, validateBidAmount } from './auction-validation';

@Injectable()
export class AuctionListingActionsState {
  private readonly actions = inject(PlayerAuctionActions);
  private readonly overview = inject(AuctionOverviewState);
  private readonly feedback = inject(AuctionFeedbackState);
  private readonly destroyRef = inject(DestroyRef);
  private readonly actionToken = new RequestToken();

  readonly isSaving = signal(false);
  readonly bidForms = new Map<string, PlayerAuctionBidForm>();

  bidForm(listing: PlayerAuctionListingReadModel): PlayerAuctionBidForm {
    const existing = this.bidForms.get(listing.id);

    if (existing) {
      return existing;
    }

    const form: PlayerAuctionBidForm = new FormGroup({
      bidAmountCharacterPoints: new FormControl<number | null>(null),
      description: new FormControl<string | null>(null),
    });

    this.bidForms.set(listing.id, form);
    return form;
  }

  canBid(listing: PlayerAuctionListingReadModel): boolean {
    return (
      listing.status === 'active' &&
      listing.auctionMode !== 'buy_now' &&
      listing.seller.heroId !== this.overview.currentHeroId()
    );
  }

  canBuyNow(listing: PlayerAuctionListingReadModel): boolean {
    return (
      listing.status === 'active' &&
      listing.auctionMode !== 'bidding' &&
      !!listing.buyNowCharacterPoints &&
      listing.seller.heroId !== this.overview.currentHeroId()
    );
  }

  canCancel(listing: PlayerAuctionListingReadModel): boolean {
    return (
      listing.status === 'active' &&
      listing.seller.heroId === this.overview.currentHeroId() &&
      !this.hasBid(listing)
    );
  }

  canClose(listing: PlayerAuctionListingReadModel): boolean {
    return (
      listing.status === 'active' &&
      !!listing.endsAt &&
      listing.endsAt <= new Date().toISOString()
    );
  }

  placeBid(listing: PlayerAuctionListingReadModel): void {
    const context = this.overview.currentContext();
    const form = this.bidForm(listing);
    const amount = normalizeCharacterPoints(form.controls.bidAmountCharacterPoints.value);
    const validationError = validateBidAmount(amount);

    this.feedback.clear();

    if (!context || validationError || amount === null) {
      this.feedback.error.set(validationError ?? 'Active hero is required.');
      return;
    }

    this.runAction(
      context,
      listing,
      this.actions.placeBid({
        auctionListingId: listing.id,
        bidderHeroId: context.heroId,
        amountCharacterPoints: amount,
      }),
      'Auction bid placed.',
    );
  }

  buyNow(listing: PlayerAuctionListingReadModel): void {
    const context = this.overview.currentContext();
    const form = this.bidForm(listing);

    this.feedback.clear();

    if (!context) {
      this.feedback.error.set('Active hero is required.');
      return;
    }

    this.runAction(
      context,
      listing,
      this.actions.buyNow({
        auctionListingId: listing.id,
        buyerHeroId: context.heroId,
        description: form.controls.description.value,
      }),
      'Auction bought now.',
    );
  }

  closeListing(listing: PlayerAuctionListingReadModel): void {
    const context = this.overview.currentContext();

    this.feedback.clear();

    if (!context) {
      this.feedback.error.set('Active hero is required.');
      return;
    }

    this.runAction(
      context,
      listing,
      this.actions.closeListing({ auctionListingId: listing.id }),
      'Auction closed.',
    );
  }

  cancelListing(listing: PlayerAuctionListingReadModel): void {
    const context = this.overview.currentContext();

    this.feedback.clear();

    if (!context) {
      this.feedback.error.set('Active hero is required.');
      return;
    }

    this.runAction(
      context,
      listing,
      this.actions.cancelListing({
        auctionListingId: listing.id,
        statusReason: 'Cancelled by seller.',
      }),
      'Auction cancelled.',
    );
  }

  private runAction(
    context: { serverId: string; heroId: string },
    listing: PlayerAuctionListingReadModel,
    request: Observable<unknown>,
    successMessage: string,
  ): void {
    const token = this.actionToken.next();

    this.isSaving.set(true);
    request
      .pipe(
        finalize(() => {
          if (this.actionToken.isCurrent(token)) {
            this.isSaving.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          if (!this.isCurrentAction(token, context, listing.id)) {
            return;
          }

          this.feedback.setSuccess(successMessage);
          this.overview.refreshCurrent();
        },
        error: (error: unknown) => {
          if (!this.isCurrentAction(token, context, listing.id)) {
            return;
          }

          this.feedback.setError(error, 'Auction workflow failed.');
        },
      });
  }

  private isCurrentAction(
    token: number,
    context: { serverId: string; heroId: string },
    requestedListingId: string,
  ): boolean {
    return (
      this.actionToken.isCurrent(token) &&
      this.overview.isCurrentContext(context.serverId, context.heroId) &&
      this.overview.overview().listings.some((listing) => listing.id === requestedListingId)
    );
  }

  private hasBid(listing: PlayerAuctionListingReadModel): boolean {
    return (
      listing.bids.length > 0 ||
      listing.currentBidCharacterPoints !== null ||
      listing.currentHighestBidder.heroId !== null
    );
  }
}
