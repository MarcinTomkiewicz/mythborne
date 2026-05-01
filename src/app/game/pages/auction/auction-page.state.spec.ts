import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { DirectTradeActions } from '../../../core/services/trade/direct-trade-actions';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { RequiredActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import {
  PlayerAuctionListingReadModel,
  PlayerAuctionOverviewReadModel,
} from '../../../core/domain/trade/player-auction.model';
import { PlayerAuctionActions } from '../../../core/services/trade/player-auction-actions';
import { PlayerAuctions } from '../../../core/services/trade/player-auctions';
import { AuctionCreateListingState } from './auction-create-listing.state';
import { AuctionFeedbackState } from './auction-feedback.state';
import { AuctionListingActionsState } from './auction-listing-actions.state';
import { AuctionOverviewState } from './auction-overview.state';
import { AuctionPageState } from './auction-page.state';

describe('AuctionPage states', () => {
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let auctions: jasmine.SpyObj<PlayerAuctions>;
  let auctionActions: jasmine.SpyObj<PlayerAuctionActions>;
  let itemSearch: jasmine.SpyObj<DirectTradeActions>;
  let overview: AuctionOverviewState;
  let actions: AuctionListingActionsState;
  let feedback: AuctionFeedbackState;

  beforeEach(() => {
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', ['requireActiveHero']);
    auctions = jasmine.createSpyObj<PlayerAuctions>('PlayerAuctions', ['getAuctionsForHero']);
    auctionActions = jasmine.createSpyObj<PlayerAuctionActions>('PlayerAuctionActions', [
      'createListing',
      'placeBid',
      'buyNow',
      'closeListing',
      'cancelListing',
    ]);
    itemSearch = jasmine.createSpyObj<DirectTradeActions>('DirectTradeActions', [
      'searchOwnItemTargets',
    ]);

    activeHero.requireActiveHero.and.returnValue(
      of({
        userId: 'user-1',
        serverId: 'server-1',
        heroId: 'hero-1',
        server: { id: 'server-1', name: 'Server' } as RequiredActiveHeroState['server'],
        hero: {} as never,
        heroRow: {} as never,
      }),
    );
    auctions.getAuctionsForHero.and.returnValue(of(emptyOverview()));
    auctionActions.placeBid.and.returnValue(of({ bidId: 'bid-1' }));

    TestBed.configureTestingModule({
      providers: [
        AuctionFeedbackState,
        AuctionOverviewState,
        AuctionCreateListingState,
        AuctionListingActionsState,
        AuctionPageState,
        { provide: ActiveHero, useValue: activeHero },
        { provide: PlayerAuctions, useValue: auctions },
        { provide: PlayerAuctionActions, useValue: auctionActions },
        { provide: DirectTradeActions, useValue: itemSearch },
      ],
    });
    overview = TestBed.inject(AuctionOverviewState);
    actions = TestBed.inject(AuctionListingActionsState);
    feedback = TestBed.inject(AuctionFeedbackState);
    overview.loadData();
  });

  it('keeps AuctionPageState as a composition facade', () => {
    const page = TestBed.inject(AuctionPageState);

    expect(page.overview).toBe(overview);
    expect(page.actions).toBe(actions);
    expect(page.feedback).toBe(feedback);
  });

  it('blocks bid and buy-now actions for seller-owned listings', () => {
    const listing = auctionListing({ sellerHeroId: 'hero-1' });

    expect(actions.canBid(listing)).toBeFalse();
    expect(actions.canBuyNow(listing)).toBeFalse();
    expect(actions.canCancel(listing)).toBeTrue();
  });

  it('hides seller cancel after bids exist', () => {
    expect(
      actions.canCancel(
        auctionListing({
          sellerHeroId: 'hero-1',
          currentBidCharacterPoints: 20,
          currentHighestBidderHeroId: 'hero-2',
          bidCount: 1,
        }),
      ),
    ).toBeFalse();
  });

  it('ignores stale overview errors', () => {
    const first = new Subject<PlayerAuctionOverviewReadModel>();
    const second = new Subject<PlayerAuctionOverviewReadModel>();
    auctions.getAuctionsForHero.and.returnValues(first.asObservable(), second.asObservable());

    overview.loadData();
    overview.loadData();

    first.error(new Error('stale overview failure'));
    expect(feedback.error()).toBeNull();
    expect(overview.isLoading()).toBeTrue();

    second.next(emptyOverview());
    second.complete();
    expect(feedback.error()).toBeNull();
    expect(overview.isLoading()).toBeFalse();
  });

  it('ignores stale action errors and finalize state after a newer action starts', () => {
    const first = new Subject<{ bidId: string }>();
    const second = new Subject<{ bidId: string }>();
    auctionActions.placeBid.and.returnValues(first.asObservable(), second.asObservable());
    overview.overview.set({
      listings: [auctionListing({ sellerHeroId: 'hero-2' })],
      transactions: [],
    });
    const listing = overview.overview().listings[0];

    actions.bidForm(listing).controls.bidAmountCharacterPoints.setValue(10);
    actions.placeBid(listing);
    actions.bidForm(listing).controls.bidAmountCharacterPoints.setValue(12);
    actions.placeBid(listing);

    first.error(new Error('stale failure'));
    expect(feedback.error()).toBeNull();
    expect(actions.isSaving()).toBeTrue();

    second.error(new Error('fresh failure'));
    expect(feedback.error()).toBe('fresh failure');
    expect(actions.isSaving()).toBeFalse();
  });

  it('accepts bid, buy-now and close success results that are not listing ids', () => {
    const listing = auctionListing({ sellerHeroId: 'hero-2' });
    overview.overview.set({ listings: [listing], transactions: [] });
    spyOn(overview, 'refreshCurrent');
    auctionActions.placeBid.and.returnValue(of({ bidId: 'bid-1' }));
    auctionActions.buyNow.and.returnValue(of({ transactionId: 'transaction-1' }));
    auctionActions.closeListing.and.returnValues(
      of({ transactionId: 'transaction-2' }),
      of({ transactionId: null }),
    );

    actions.bidForm(listing).controls.bidAmountCharacterPoints.setValue(10);
    actions.placeBid(listing);
    expect(feedback.successMessage()).toBe('Auction bid placed.');

    actions.buyNow(listing);
    expect(feedback.successMessage()).toBe('Auction bought now.');

    actions.closeListing(listing);
    expect(feedback.successMessage()).toBe('Auction closed.');

    actions.closeListing(listing);
    expect(feedback.successMessage()).toBe('Auction closed.');
    expect(overview.refreshCurrent).toHaveBeenCalledTimes(4);
  });
});

function emptyOverview(): PlayerAuctionOverviewReadModel {
  return { listings: [], transactions: [] };
}

function auctionListing(input: {
  sellerHeroId: string;
  currentBidCharacterPoints?: number | null;
  currentHighestBidderHeroId?: string | null;
  bidCount?: number;
}): PlayerAuctionListingReadModel {
  return {
    id: 'listing-1',
    serverId: 'server-1',
    seller: { heroId: input.sellerHeroId, heroName: 'Seller' },
    item: {
      itemId: 'item-1',
      itemName: 'Blade',
      itemStatus: 'active',
      drachmaValue: 100,
    },
    auctionMode: 'bidding_with_buy_now',
    status: 'active',
    startingBidCharacterPoints: 5,
    buyNowCharacterPoints: 50,
    currentBidCharacterPoints: input.currentBidCharacterPoints ?? null,
    currentHighestBidder: {
      heroId: input.currentHighestBidderHeroId ?? null,
      heroName: input.currentHighestBidderHeroId ? 'Bidder' : null,
    },
    description: null,
    startsAt: '2026-04-30T10:00:00.000Z',
    endsAt: '2026-04-30T11:00:00.000Z',
    completedAt: null,
    cancelledAt: null,
    expiredAt: null,
    failedAt: null,
    createdAt: '2026-04-30T10:00:00.000Z',
    updatedAt: '2026-04-30T10:00:00.000Z',
    bids: Array.from({ length: input.bidCount ?? 0 }, (_, index) => ({
      id: `bid-${index + 1}`,
      listingId: 'listing-1',
      bidder: { heroId: 'hero-2', heroName: 'Bidder' },
      amountCharacterPoints: 20,
      status: 'active',
      cancelledAt: null,
      refundedAt: null,
      failedAt: null,
      createdAt: '2026-04-30T10:05:00.000Z',
    })),
  };
}
