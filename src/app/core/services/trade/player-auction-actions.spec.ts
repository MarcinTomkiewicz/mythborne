import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { AuditWriter } from '../audit/audit-writer';
import { Backend } from '../backend/backend';
import { PlayerAuctionActions } from './player-auction-actions';

describe('PlayerAuctionActions', () => {
  let auditWriter: jasmine.SpyObj<AuditWriter>;
  let backend: jasmine.SpyObj<Backend>;
  let service: PlayerAuctionActions;

  beforeEach(() => {
    auditWriter = jasmine.createSpyObj<AuditWriter>('AuditWriter', ['write']);
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'getAll',
      'create',
      'update',
      'delete',
      'rpc',
    ]);
    TestBed.configureTestingModule({
      providers: [
        PlayerAuctionActions,
        { provide: AuditWriter, useValue: auditWriter },
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(PlayerAuctionActions);
  });

  it('uses public auction RPCs for auction mutations', async () => {
    backend.rpc.and.returnValues(
      of('listing-1'),
      of('bid-1'),
      of('transaction-1'),
      of('transaction-2'),
      of('listing-1'),
    );

    await firstValueFrom(
      service.createListing({
        sellerHeroId: 'hero-1',
        itemId: 'item-1',
        auctionMode: 'bidding',
        startingBidCharacterPoints: 10,
      }),
    );
    await firstValueFrom(
      service.placeBid({
        auctionListingId: 'listing-1',
        bidderHeroId: 'hero-2',
        amountCharacterPoints: 15,
      }),
    );
    await firstValueFrom(
      service.buyNow({ auctionListingId: 'listing-1', buyerHeroId: 'hero-2' }),
    );
    await firstValueFrom(service.closeListing({ auctionListingId: 'listing-1' }));
    await firstValueFrom(service.cancelListing({ auctionListingId: 'listing-1' }));

    expect(backend.rpc.calls.allArgs()).toEqual([
      [
        RPC.create_player_auction_listing,
        {
          p_seller_hero_id: 'hero-1',
          p_item_id: 'item-1',
          p_auction_mode: 'bidding',
          p_starting_bid_character_points: 10,
        },
      ],
      [
        RPC.place_player_auction_bid,
        {
          p_auction_listing_id: 'listing-1',
          p_bidder_hero_id: 'hero-2',
          p_amount_character_points: 15,
        },
      ],
      [
        RPC.buy_now_player_auction,
        {
          p_auction_listing_id: 'listing-1',
          p_buyer_hero_id: 'hero-2',
        },
      ],
      [RPC.close_player_auction_listing, { p_auction_listing_id: 'listing-1' }],
      [RPC.cancel_player_auction_listing, { p_auction_listing_id: 'listing-1' }],
    ]);
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
    expect(auditWriter.write).not.toHaveBeenCalled();
  });

  it('maps auction RPC result ids by action semantics', async () => {
    backend.rpc.and.returnValues(
      of('listing-1'),
      of('bid-1'),
      of('transaction-1'),
      of('transaction-2'),
      of(null),
      of('listing-1'),
    );

    await expectAsync(
      firstValueFrom(
        service.createListing({
          sellerHeroId: 'hero-1',
          itemId: 'item-1',
          auctionMode: 'buy_now',
          buyNowCharacterPoints: 50,
        }),
      ),
    ).toBeResolvedTo({ listingId: 'listing-1' });
    await expectAsync(
      firstValueFrom(
        service.placeBid({
          auctionListingId: 'listing-1',
          bidderHeroId: 'hero-2',
          amountCharacterPoints: 15,
        }),
      ),
    ).toBeResolvedTo({ bidId: 'bid-1' });
    await expectAsync(
      firstValueFrom(
        service.buyNow({ auctionListingId: 'listing-1', buyerHeroId: 'hero-2' }),
      ),
    ).toBeResolvedTo({ transactionId: 'transaction-1' });
    await expectAsync(
      firstValueFrom(service.closeListing({ auctionListingId: 'listing-1' })),
    ).toBeResolvedTo({ transactionId: 'transaction-2' });
    await expectAsync(
      firstValueFrom(service.closeListing({ auctionListingId: 'listing-1' })),
    ).toBeResolvedTo({ transactionId: null });
    await expectAsync(
      firstValueFrom(service.cancelListing({ auctionListingId: 'listing-1' })),
    ).toBeResolvedTo({ listingId: 'listing-1' });
  });
});
