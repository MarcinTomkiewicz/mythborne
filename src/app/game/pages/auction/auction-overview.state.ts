import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, finalize } from 'rxjs';
import {
  AuctionListingsSearchPage,
  AuctionPageContext,
  AuctionPageCopy,
} from '../../../core/domain/trade/player-auction.model';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerAuctions } from '../../../core/services/trade/player-auctions';
import { RequestToken } from '../../../core/utils/request-token';

const AUCTION_FOUNDATION_PAGE_LIMIT = 25;
const AUCTION_FOUNDATION_PAGE_OFFSET = 0;

@Injectable()
export class AuctionOverviewState {
  private readonly activeHero = inject(ActiveHero);
  private readonly auctions = inject(PlayerAuctions);
  private readonly destroyRef = inject(DestroyRef);
  private readonly requestToken = new RequestToken();

  private activeHeroId: string | null = null;
  private activeServerId: string | null = null;

  readonly copy = signal<AuctionPageCopy | null>(null);
  readonly context = signal<AuctionPageContext | null>(null);
  readonly listingsPage = signal<AuctionListingsSearchPage | null>(null);
  readonly error = signal<unknown>(null);
  readonly isLoading = signal(false);

  loadData(): void {
    const token = this.requestToken.next();

    this.isLoading.set(true);
    this.error.set(null);
    this.copy.set(null);
    this.context.set(null);
    this.listingsPage.set(null);

    this.activeHero
      .requireActiveHero()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state) => {
          if (!this.requestToken.isCurrent(token)) {
            return;
          }

          this.activeHeroId = state.heroId;
          this.activeServerId = state.serverId;
          this.loadAuctionFoundation(state.heroId, state.serverId, token);
        },
        error: (error: unknown) => {
          if (!this.requestToken.isCurrent(token)) {
            return;
          }

          this.isLoading.set(false);
          this.error.set(error);
        },
      });
  }

  private loadAuctionFoundation(heroId: string, serverId: string, token: number): void {
    forkJoin({
      copy: this.auctions.getPageCopy(),
      context: this.auctions.getPageContext(heroId, serverId),
      listingsPage: this.auctions.searchListingsPage(
        heroId,
        null,
        {},
        AUCTION_FOUNDATION_PAGE_LIMIT,
        AUCTION_FOUNDATION_PAGE_OFFSET,
      ),
    })
      .pipe(
        finalize(() => {
          if (this.requestToken.isCurrent(token)) {
            this.isLoading.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (state) => {
          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.copy.set(state.copy);
          this.context.set(state.context);
          this.listingsPage.set(state.listingsPage);
        },
        error: (error: unknown) => {
          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.error.set(error);
        },
      });
  }

  private isCurrentRequest(token: number, heroId: string, serverId: string): boolean {
    return (
      this.requestToken.isCurrent(token) &&
      this.activeHeroId === heroId &&
      this.activeServerId === serverId
    );
  }
}
