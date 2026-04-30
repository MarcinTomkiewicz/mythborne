import {
  toBuyNowPlayerAuctionRpcArgs,
  toCancelPlayerAuctionListingRpcArgs,
  toClosePlayerAuctionListingRpcArgs,
  toCreatePlayerAuctionListingRpcArgs,
  toPlacePlayerAuctionBidRpcArgs,
} from './player-auction-rpc';

describe('player auction rpc mappers', () => {
  it('maps create listing args without client-side auction duration', () => {
    expect(
      toCreatePlayerAuctionListingRpcArgs({
        sellerHeroId: 'hero-1',
        itemId: 'item-1',
        auctionMode: 'bidding_with_buy_now',
        startingBidCharacterPoints: 10,
        buyNowCharacterPoints: 50,
        description: 'Listed item',
      }),
    ).toEqual({
      p_seller_hero_id: 'hero-1',
      p_item_id: 'item-1',
      p_auction_mode: 'bidding_with_buy_now',
      p_starting_bid_character_points: 10,
      p_buy_now_character_points: 50,
      p_description: 'Listed item',
    });
  });

  it('maps bid, buy-now, close and cancel action args', () => {
    expect(
      toPlacePlayerAuctionBidRpcArgs({
        auctionListingId: 'listing-1',
        bidderHeroId: 'hero-2',
        amountCharacterPoints: 25,
      }),
    ).toEqual({
      p_auction_listing_id: 'listing-1',
      p_bidder_hero_id: 'hero-2',
      p_amount_character_points: 25,
    });
    expect(
      toBuyNowPlayerAuctionRpcArgs({
        auctionListingId: 'listing-1',
        buyerHeroId: 'hero-2',
        description: 'Buy now',
      }),
    ).toEqual({
      p_auction_listing_id: 'listing-1',
      p_buyer_hero_id: 'hero-2',
      p_description: 'Buy now',
    });
    expect(toClosePlayerAuctionListingRpcArgs({ auctionListingId: 'listing-1' })).toEqual({
      p_auction_listing_id: 'listing-1',
    });
    expect(
      toCancelPlayerAuctionListingRpcArgs({
        auctionListingId: 'listing-1',
        statusReason: 'Cancelled',
      }),
    ).toEqual({
      p_auction_listing_id: 'listing-1',
      p_status_reason: 'Cancelled',
    });
  });

  it('rejects non-positive bid amounts before RPC', () => {
    expect(() =>
      toPlacePlayerAuctionBidRpcArgs({
        auctionListingId: 'listing-1',
        bidderHeroId: 'hero-2',
        amountCharacterPoints: 0,
      }),
    ).toThrowError(/positive integer/);
  });

  it('rejects invalid listing prices before RPC', () => {
    expect(() =>
      toCreatePlayerAuctionListingRpcArgs({
        sellerHeroId: 'hero-1',
        itemId: 'item-1',
        auctionMode: 'bidding',
        startingBidCharacterPoints: 1.5,
      }),
    ).toThrowError(/non-negative integer/);
  });
});
