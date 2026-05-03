import { PlayerAuctionListingReadModel } from '../../../core/domain/trade/player-auction.model';
import { displayValue } from '../../../core/utils/display-value';

export function auctionListingLabel(listing: PlayerAuctionListingReadModel): string {
  const item = listing.item.itemName ?? listing.item.itemId;
  const price =
    listing.currentBidCharacterPoints ??
    listing.startingBidCharacterPoints ??
    listing.buyNowCharacterPoints;

  return `${item} · ${listing.auctionMode} · ${displayValue(price)} Character Points`;
}

export function auctionSellerLabel(listing: PlayerAuctionListingReadModel): string {
  return listing.seller.heroName ?? listing.seller.heroId ?? 'Unknown seller';
}
