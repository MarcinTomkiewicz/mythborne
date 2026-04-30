import {
  CreatePlayerAuctionListingInput,
  PlacePlayerAuctionBidInput,
  PlayerAuctionBuyNowInput,
  PlayerAuctionListingActionInput,
} from '../domain/trade/player-auction.model';
import {
  BuyNowPlayerAuctionRpcArgs,
  CancelPlayerAuctionListingRpcArgs,
  ClosePlayerAuctionListingRpcArgs,
  CreatePlayerAuctionListingRpcArgs,
  PlacePlayerAuctionBidRpcArgs,
} from '../types/player-auction-rpc.types';
import { trimText, trimToNull } from './normalize-text';

export function toCreatePlayerAuctionListingRpcArgs(
  input: CreatePlayerAuctionListingInput,
): CreatePlayerAuctionListingRpcArgs {
  const args: CreatePlayerAuctionListingRpcArgs = {
    p_seller_hero_id: requiredText(input.sellerHeroId, 'sellerHeroId'),
    p_item_id: requiredText(input.itemId, 'itemId'),
    p_auction_mode: input.auctionMode,
  };

  addOptionalNumber(args, 'p_starting_bid_character_points', input.startingBidCharacterPoints);
  addOptionalNumber(args, 'p_buy_now_character_points', input.buyNowCharacterPoints);
  addOptionalText(args, 'p_description', input.description);

  return args;
}

export function toPlacePlayerAuctionBidRpcArgs(
  input: PlacePlayerAuctionBidInput,
): PlacePlayerAuctionBidRpcArgs {
  return {
    p_auction_listing_id: requiredText(input.auctionListingId, 'auctionListingId'),
    p_bidder_hero_id: requiredText(input.bidderHeroId, 'bidderHeroId'),
    p_amount_character_points: requiredPositiveInteger(
      input.amountCharacterPoints,
      'amountCharacterPoints',
    ),
  };
}

export function toBuyNowPlayerAuctionRpcArgs(
  input: PlayerAuctionBuyNowInput,
): BuyNowPlayerAuctionRpcArgs {
  const args: BuyNowPlayerAuctionRpcArgs = {
    p_auction_listing_id: requiredText(input.auctionListingId, 'auctionListingId'),
    p_buyer_hero_id: requiredText(input.buyerHeroId, 'buyerHeroId'),
  };

  addOptionalText(args, 'p_description', input.description);

  return args;
}

export function toClosePlayerAuctionListingRpcArgs(
  input: PlayerAuctionListingActionInput,
): ClosePlayerAuctionListingRpcArgs {
  const args: ClosePlayerAuctionListingRpcArgs = {
    p_auction_listing_id: requiredText(input.auctionListingId, 'auctionListingId'),
  };

  addOptionalText(args, 'p_description', input.description);

  return args;
}

export function toCancelPlayerAuctionListingRpcArgs(
  input: PlayerAuctionListingActionInput,
): CancelPlayerAuctionListingRpcArgs {
  const args: CancelPlayerAuctionListingRpcArgs = {
    p_auction_listing_id: requiredText(input.auctionListingId, 'auctionListingId'),
  };

  addOptionalText(args, 'p_status_reason', input.statusReason);

  return args;
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for player auction workflow.`);
  }

  return normalized;
}

function requiredPositiveInteger(value: number | null | undefined, field: string): number {
  const normalized = Number(value);

  if (!Number.isInteger(normalized) || normalized <= 0) {
    throw new Error(`${field} must be a positive integer for player auction workflow.`);
  }

  return normalized;
}

function addOptionalText<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  key: K,
  value: string | null | undefined,
): void {
  const normalized = trimToNull(value);

  if (normalized) {
    target[key] = normalized as T[K];
  }
}

function addOptionalNumber<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  key: K,
  value: number | null | undefined,
): void {
  if (value === null || value === undefined) {
    return;
  }

  const normalized = Number(value);

  if (!Number.isInteger(normalized) || normalized < 0) {
    throw new Error(`${String(key)} must be a non-negative integer for player auction workflow.`);
  }

  target[key] = normalized as T[K];
}
