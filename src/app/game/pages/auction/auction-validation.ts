import { PlayerAuctionMode } from '../../../core/domain/trade/player-auction.model';

export function normalizeCharacterPoints(value: number | null): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return Number(value);
}

export function validateCreateAuctionValues(input: {
  auctionMode: PlayerAuctionMode | null;
  startingBidCharacterPoints: number | null;
  buyNowCharacterPoints: number | null;
}): string | null {
  if (!input.auctionMode) {
    return 'Auction mode is required.';
  }

  if (
    input.startingBidCharacterPoints !== null &&
    (!Number.isInteger(input.startingBidCharacterPoints) ||
      input.startingBidCharacterPoints < 0)
  ) {
    return 'Starting bid must be a non-negative integer.';
  }

  if (
    input.buyNowCharacterPoints !== null &&
    (!Number.isInteger(input.buyNowCharacterPoints) || input.buyNowCharacterPoints < 0)
  ) {
    return 'Buy now price must be a non-negative integer.';
  }

  if (input.auctionMode !== 'buy_now' && (input.startingBidCharacterPoints ?? 0) <= 0) {
    return 'Starting bid is required for bidding auctions.';
  }

  if (input.auctionMode !== 'bidding' && (input.buyNowCharacterPoints ?? 0) <= 0) {
    return 'Buy now price is required for buy-now auctions.';
  }

  if (
    input.startingBidCharacterPoints !== null &&
    input.buyNowCharacterPoints !== null &&
    input.buyNowCharacterPoints > 0 &&
    input.buyNowCharacterPoints < input.startingBidCharacterPoints
  ) {
    return 'Buy now price cannot be lower than the starting bid.';
  }

  return null;
}

export function validateBidAmount(value: number | null): string | null {
  if (value === null || !Number.isInteger(value) || value <= 0) {
    return 'Bid amount must be a positive integer.';
  }

  return null;
}
