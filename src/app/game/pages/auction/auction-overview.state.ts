import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AuctionListingsFilters,
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
  private listingQuery: string | null = null;
  private listingFilters: AuctionListingsFilters = {};
  private listingLimit = AUCTION_FOUNDATION_PAGE_LIMIT;
  private listingOffset = AUCTION_FOUNDATION_PAGE_OFFSET;

  readonly copy = signal<AuctionPageCopy | null>(null);
  readonly context = signal<AuctionPageContext | null>(null);
  readonly listingsPage = signal<AuctionListingsSearchPage | null>(null);
  readonly error = signal<unknown>(null);
  readonly pendingRequestCount = signal(0);
  readonly isLoading = computed(() => this.pendingRequestCount() > 0);

  loadData(): void {
    const token = this.requestToken.next();

    this.error.set(null);
    this.copy.set(null);
    this.context.set(null);
    this.listingsPage.set(null);
    this.listingQuery = null;
    this.listingFilters = {};
    this.listingLimit = AUCTION_FOUNDATION_PAGE_LIMIT;
    this.listingOffset = AUCTION_FOUNDATION_PAGE_OFFSET;
    this.pendingRequestCount.set(1);

    this.activeHero
      .requireActiveHero()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state) => {
          this.finishRequest(token);

          if (!this.requestToken.isCurrent(token)) {
            return;
          }

          this.activeHeroId = state.heroId;
          this.activeServerId = state.serverId;
          this.loadAuctionFoundation(state.heroId, state.serverId, token);
        },
        error: (error: unknown) => {
          this.finishRequest(token);

          if (!this.requestToken.isCurrent(token)) {
            return;
          }

          this.error.set(error);
        },
      });
  }

  searchListings(query: string | null, filters: AuctionListingsFilters): void {
    if (
      !this.activeHeroId
      || !this.activeServerId
      || this.context()?.summary.canUseAuction !== true
    ) {
      return;
    }

    this.listingQuery = query;
    this.listingFilters = filters;
    this.listingOffset = AUCTION_FOUNDATION_PAGE_OFFSET;
    this.loadListingsPage(
      this.activeHeroId,
      this.activeServerId,
      this.listingLimit,
      this.listingOffset,
    );
  }

  changeListingsPage(input: { first?: number | null; rows?: number | null }): void {
    if (
      !this.activeHeroId
      || !this.activeServerId
      || this.context()?.summary.canUseAuction !== true
    ) {
      return;
    }

    this.listingLimit = positiveInteger(input.rows) ?? this.listingLimit;
    this.listingOffset = nonNegativeInteger(input.first) ?? AUCTION_FOUNDATION_PAGE_OFFSET;
    this.loadListingsPage(
      this.activeHeroId,
      this.activeServerId,
      this.listingLimit,
      this.listingOffset,
    );
  }

  private loadAuctionFoundation(heroId: string, serverId: string, token: number): void {
    this.loadPageCopy(heroId, serverId, token);
    this.loadPageContext(heroId, serverId, token);
  }

  private loadListingsPage(
    heroId: string,
    serverId: string,
    limit: number,
    offset: number,
  ): void {
    const token = this.requestToken.next();

    this.error.set(null);
    this.loadListingsPageForToken(heroId, serverId, limit, offset, token);
  }

  private loadPageCopy(heroId: string, serverId: string, token: number): void {
    this.startRequest(token);

    this.auctions.getPageCopy()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (copy) => {
          this.finishRequest(token);

          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.copy.set(copy);
          this.loadFoundationListingsIfAllowed(heroId, serverId, token);
        },
        error: (error: unknown) => {
          this.finishRequest(token);

          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.error.set(error);
        },
      });
  }

  private loadPageContext(heroId: string, serverId: string, token: number): void {
    this.startRequest(token);

    this.auctions.getPageContext(heroId, serverId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (context) => {
          this.finishRequest(token);

          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.context.set(context);

          if (!context.summary.canUseAuction) {
            this.listingsPage.set(null);
            return;
          }

          this.loadFoundationListingsIfAllowed(heroId, serverId, token);
        },
        error: (error: unknown) => {
          this.finishRequest(token);

          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.error.set(error);
        },
      });
  }

  private loadFoundationListingsIfAllowed(heroId: string, serverId: string, token: number): void {
    const context = this.context();

    if (!this.isCurrentRequest(token, heroId, serverId) || !this.copy() || !context) {
      return;
    }

    if (!context.summary.canUseAuction || this.listingsPage()) {
      return;
    }

    this.loadListingsPageForToken(
      heroId,
      serverId,
      this.listingLimit,
      this.listingOffset,
      token,
    );
  }

  private loadListingsPageForToken(
    heroId: string,
    serverId: string,
    limit: number,
    offset: number,
    token: number,
  ): void {
    this.startRequest(token);
    this.listingsPage.set(null);

    this.auctions.searchListingsPage(
      heroId,
      this.listingQuery,
      this.listingFilters,
      limit,
      offset,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (listingsPage) => {
          this.finishRequest(token);

          if (!this.isCurrentRequest(token, heroId, serverId)) {
            return;
          }

          this.listingsPage.set(listingsPage);
        },
        error: (error: unknown) => {
          this.finishRequest(token);

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

  private startRequest(token: number): void {
    if (!this.requestToken.isCurrent(token)) {
      return;
    }

    this.pendingRequestCount.update((count) => count + 1);
  }

  private finishRequest(token: number): void {
    if (!this.requestToken.isCurrent(token)) {
      return;
    }

    this.pendingRequestCount.update((count) => Math.max(0, count - 1));
  }
}

function positiveInteger(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function nonNegativeInteger(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
    ? value
    : null;
}
