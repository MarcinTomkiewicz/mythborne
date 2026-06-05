import {
  AuctionListingsPage,
  AuctionListingsSearchPage,
} from '../domain/trade/player-auction.model';
import { Json } from '../types/database.types';
import { optionalNumber, optionalText, read, requiredRecord, requiredText } from './json-read';
import {
  mapAuctionListingRow,
  mapAuctionPagination,
  requireContractVersion,
  requiredRecordArray,
} from './auction-contract-mapper-common';

export function mapAuctionListingsSearchPage(value: Json): AuctionListingsSearchPage {
  const root = requiredRecord(value, 'search_auction_listings_page');

  return {
    contractVersion: requireContractVersion(
      root,
      'auction_listings_search_page_v1',
      'search_auction_listings_page',
    ),
    activeListings: requiredRecordArray(
      read(root, 'activeListings'),
      'search_auction_listings_page.activeListings',
    ).map((row, index) =>
      mapAuctionListingRow(row, `search_auction_listings_page.activeListings[${index}]`),
    ),
    pagination: mapAuctionPagination(
      read(root, 'pagination'),
      'search_auction_listings_page.pagination',
    ),
    appliedFilters: mapAppliedFilters(
      requiredRecord(
        read(root, 'appliedFilters'),
        'search_auction_listings_page.appliedFilters',
      ),
    ),
  };
}

export function mapAuctionListingsPage(value: Json): AuctionListingsPage {
  const root = requiredRecord(value, 'get_auction_listings_page');

  return {
    contractVersion: requireContractVersion(
      root,
      'auction_listings_page_v1',
      'get_auction_listings_page',
    ),
    myListings: requiredRecordArray(
      read(root, 'myListings'),
      'get_auction_listings_page.myListings',
    ).map((row, index) =>
      mapAuctionListingRow(row, `get_auction_listings_page.myListings[${index}]`),
    ),
    pagination: mapAuctionPagination(
      read(root, 'pagination'),
      'get_auction_listings_page.pagination',
    ),
  };
}

function mapAppliedFilters(
  filters: Record<string, Json | undefined>,
): AuctionListingsSearchPage['appliedFilters'] {
  return {
    query: optionalText(read(filters, 'query')),
    auctionMode: optionalText(read(filters, 'auctionMode')),
    baseTypeKey: optionalText(read(filters, 'baseTypeKey')),
    priceMin: optionalNumber(read(filters, 'priceMin')),
    priceMax: optionalNumber(read(filters, 'priceMax')),
    sortKey: requiredText(read(filters, 'sortKey'), 'appliedFilters.sortKey'),
  };
}
