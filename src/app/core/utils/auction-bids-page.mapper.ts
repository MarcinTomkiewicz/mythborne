import { AuctionBidRow, AuctionBidsPage } from '../domain/trade/player-auction.model';
import { Json } from '../types/database.types';
import {
  read,
  requiredNumber,
  requiredRecord,
  requiredText,
} from './json-read';
import {
  mapAuctionListingRow,
  mapAuctionPagination,
  optionalString,
  requireContractVersion,
  requiredAuctionBidStatus,
  requiredRecordArray,
  withOptionalFields,
} from './auction-contract-mapper-common';

export function mapAuctionBidsPage(value: Json): AuctionBidsPage {
  const root = requiredRecord(value, 'get_auction_bids_page');

  return {
    contractVersion: requireContractVersion(
      root,
      'auction_bids_page_v1',
      'get_auction_bids_page',
    ),
    myBids: requiredRecordArray(read(root, 'myBids'), 'get_auction_bids_page.myBids').map(
      (row, index) => mapAuctionBidRow(row, `get_auction_bids_page.myBids[${index}]`),
    ),
    pagination: mapAuctionPagination(read(root, 'pagination'), 'get_auction_bids_page.pagination'),
  };
}

function mapAuctionBidRow(row: Record<string, Json | undefined>, field: string): AuctionBidRow {
  const listing = read(row, 'listing');

  return withOptionalFields<AuctionBidRow>({
    bidId: requiredText(read(row, 'bidId'), `${field}.bidId`),
    listingId: requiredText(read(row, 'listingId'), `${field}.listingId`),
    bidderHeroId: requiredText(read(row, 'bidderHeroId'), `${field}.bidderHeroId`),
    amountCharacterPoints: requiredNumber(
      read(row, 'amountCharacterPoints'),
      `${field}.amountCharacterPoints`,
    ),
    amountDisplayValue: requiredText(read(row, 'amountDisplayValue'), `${field}.amountDisplayValue`),
    status: requiredAuctionBidStatus(read(row, 'status'), `${field}.status`),
    statusLabel: requiredText(read(row, 'statusLabel'), `${field}.statusLabel`),
    statusTone: requiredText(read(row, 'statusTone'), `${field}.statusTone`),
    createdAt: optionalString(row, 'createdAt'),
    cancelledAt: optionalString(row, 'cancelledAt'),
    refundedAt: optionalString(row, 'refundedAt'),
    failedAt: optionalString(row, 'failedAt'),
    listing: listing === null
      ? null
      : mapAuctionListingRow(requiredRecord(listing, `${field}.listing`), `${field}.listing`),
  });
}
