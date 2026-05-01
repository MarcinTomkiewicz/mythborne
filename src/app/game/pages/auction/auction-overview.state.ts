import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  PlayerAuctionListingReadModel,
  PlayerAuctionOverviewReadModel,
} from '../../../core/domain/trade/player-auction.model';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerAuctions } from '../../../core/services/trade/player-auctions';
import { RequestToken } from '../../../core/utils/request-token';
import { auctionListingLabel } from './auction-labels';
import { AuctionFeedbackState } from './auction-feedback.state';

@Injectable()
export class AuctionOverviewState {
  private readonly activeHero = inject(ActiveHero);
  private readonly auctions = inject(PlayerAuctions);
  private readonly destroyRef = inject(DestroyRef);
  private readonly feedback = inject(AuctionFeedbackState);
  private readonly requestToken = new RequestToken();

  private activeServerId: string | null = null;
  private activeHeroId: string | null = null;

  readonly overview = signal<PlayerAuctionOverviewReadModel>({
    listings: [],
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

  currentHeroId(): string | null {
    return this.activeHeroId;
  }

  isCurrentContext(serverId: string, heroId: string): boolean {
    return this.activeServerId === serverId && this.activeHeroId === heroId;
  }

  listingLabel(listing: PlayerAuctionListingReadModel): string {
    return auctionListingLabel(listing);
  }

  private loadOverview(serverId: string, heroId: string, token: number): void {
    this.auctions
      .getAuctionsForHero({ serverId, heroId })
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

          this.feedback.setError(error, 'Failed to load auctions.');
        },
      });
  }

  private isCurrentRequest(token: number, serverId: string, heroId: string): boolean {
    return this.requestToken.isCurrent(token) && this.isCurrentContext(serverId, heroId);
  }
}
