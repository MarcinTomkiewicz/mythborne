import {
  PlayerAuctionBidReadModel,
  PlayerAuctionItemLabel,
  PlayerAuctionListingReadModel,
  PlayerAuctionParticipantLabel,
  PlayerAuctionTransactionReadModel,
} from '../domain/trade/player-auction.model';
import { DirectTradeTransactionItemReadModel } from '../domain/trade/direct-trade.model';
import { Row } from '../types/supabase.types';

export function mapPlayerAuctionListing(
  row: Row<'player_auction_listings'>,
  context: {
    bids: readonly PlayerAuctionBidReadModel[];
    itemLabels: ReadonlyMap<string, PlayerAuctionItemLabel>;
    participantLabels: ReadonlyMap<string, PlayerAuctionParticipantLabel>;
  },
): PlayerAuctionListingReadModel {
  return {
    id: row.id,
    serverId: row.server_id,
    seller: participantLabel(row.seller_hero_id, context.participantLabels),
    item: context.itemLabels.get(row.item_id) ?? {
      itemId: row.item_id,
      itemName: null,
      itemStatus: null,
      drachmaValue: null,
    },
    auctionMode: row.auction_mode,
    status: row.status,
    startingBidCharacterPoints: row.starting_bid_character_points,
    buyNowCharacterPoints: row.buy_now_character_points,
    currentBidCharacterPoints: row.current_bid_character_points,
    currentHighestBidder: participantLabel(
      row.current_highest_bidder_hero_id,
      context.participantLabels,
    ),
    description: row.description,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
    expiredAt: row.expired_at,
    failedAt: row.failed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    bids: context.bids.filter((bid) => bid.listingId === row.id),
  };
}

export function mapPlayerAuctionBid(
  row: Row<'player_auction_bids'>,
  participantLabels: ReadonlyMap<string, PlayerAuctionParticipantLabel>,
): PlayerAuctionBidReadModel {
  return {
    id: row.id,
    listingId: row.listing_id,
    bidder: participantLabel(row.bidder_hero_id, participantLabels),
    amountCharacterPoints: row.amount_character_points,
    status: row.status,
    cancelledAt: row.cancelled_at,
    refundedAt: row.refunded_at,
    failedAt: row.failed_at,
    createdAt: row.created_at,
  };
}

export function mapPlayerAuctionTransaction(
  row: Row<'player_trade_transactions'>,
  context: {
    items: readonly DirectTradeTransactionItemReadModel[];
    participantLabels: ReadonlyMap<string, PlayerAuctionParticipantLabel>;
  },
): PlayerAuctionTransactionReadModel {
  return {
    id: row.id,
    serverId: row.server_id,
    auctionListingId: row.auction_listing_id,
    status: row.status,
    description: row.description,
    seller: participantLabel(row.creator_hero_id, context.participantLabels),
    buyer: participantLabel(row.target_hero_id, context.participantLabels),
    sellerCharacterPoints: row.creator_character_points,
    buyerCharacterPoints: row.target_character_points,
    completedAt: row.completed_at,
    reversedAt: row.reversed_at,
    failedAt: row.failed_at,
    createdAt: row.created_at,
    items: context.items.filter((item) => item.transactionId === row.id),
  };
}

export function mapPlayerAuctionItemLabels(
  rows: readonly Pick<Row<'items'>, 'id' | 'name' | 'status' | 'drachma_value'>[],
): ReadonlyMap<string, PlayerAuctionItemLabel> {
  return new Map(
    rows.map((row) => [
      row.id,
      {
        itemId: row.id,
        itemName: row.name,
        itemStatus: row.status,
        drachmaValue: row.drachma_value,
      },
    ]),
  );
}

export function mapPlayerAuctionParticipantLabels(
  rows: readonly Pick<Row<'hero'>, 'id' | 'name'>[],
): ReadonlyMap<string, PlayerAuctionParticipantLabel> {
  return new Map(
    rows.map((row) => [
      row.id,
      {
        heroId: row.id,
        heroName: row.name,
      },
    ]),
  );
}

function participantLabel(
  heroId: string | null,
  labels: ReadonlyMap<string, PlayerAuctionParticipantLabel>,
): PlayerAuctionParticipantLabel {
  if (!heroId) {
    return { heroId: null, heroName: null };
  }

  return labels.get(heroId) ?? { heroId, heroName: null };
}
