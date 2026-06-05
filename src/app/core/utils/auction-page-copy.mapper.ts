import { AuctionPageCopy } from '../domain/trade/player-auction.model';
import { Json } from '../types/database.types';
import { read, requiredRecord, requiredText } from './json-read';
import {
  requireContractVersion,
  requiredAuctionMode,
  requiredRecordArray,
  requiredTextArray,
} from './auction-contract-mapper-common';

export function mapAuctionPageCopy(value: Json): AuctionPageCopy {
  const root = requiredRecord(value, 'get_auction_page_copy');

  return {
    contractVersion: requireContractVersion(
      root,
      'auction_page_copy_v1',
      'get_auction_page_copy',
    ),
    header: mapHeader(requiredRecord(read(root, 'header'), 'get_auction_page_copy.header')),
    actions: mapActions(requiredRecord(read(root, 'actions'), 'get_auction_page_copy.actions')),
    tabs: mapTabs(requiredRecord(read(root, 'tabs'), 'get_auction_page_copy.tabs')),
    summary: mapSummary(requiredRecord(read(root, 'summary'), 'get_auction_page_copy.summary')),
    filters: mapFilters(requiredRecord(read(root, 'filters'), 'get_auction_page_copy.filters')),
    filterOptions: mapFilterOptions(
      requiredRecord(read(root, 'filterOptions'), 'get_auction_page_copy.filterOptions'),
    ),
    labels: mapLabels(requiredRecord(read(root, 'labels'), 'get_auction_page_copy.labels')),
    empty: mapEmpty(requiredRecord(read(root, 'empty'), 'get_auction_page_copy.empty')),
    rules: mapRules(requiredRecord(read(root, 'rules'), 'get_auction_page_copy.rules')),
  };
}

function mapHeader(header: Record<string, Json | undefined>): AuctionPageCopy['header'] {
  return {
    eyebrow: requiredText(read(header, 'eyebrow'), 'header.eyebrow'),
    title: requiredText(read(header, 'title'), 'header.title'),
    intro: requiredText(read(header, 'intro'), 'header.intro'),
  };
}

function mapActions(actions: Record<string, Json | undefined>): AuctionPageCopy['actions'] {
  return {
    createAuction: requiredText(read(actions, 'createAuction'), 'actions.createAuction'),
    refresh: requiredText(read(actions, 'refresh'), 'actions.refresh'),
    bid: requiredText(read(actions, 'bid'), 'actions.bid'),
    buyNow: requiredText(read(actions, 'buyNow'), 'actions.buyNow'),
    cancel: requiredText(read(actions, 'cancel'), 'actions.cancel'),
    close: requiredText(read(actions, 'close'), 'actions.close'),
    details: requiredText(read(actions, 'details'), 'actions.details'),
  };
}

function mapTabs(tabs: Record<string, Json | undefined>): AuctionPageCopy['tabs'] {
  return {
    browse: requiredText(read(tabs, 'browse'), 'tabs.browse'),
    myListings: requiredText(read(tabs, 'myListings'), 'tabs.myListings'),
    myBids: requiredText(read(tabs, 'myBids'), 'tabs.myBids'),
    create: requiredText(read(tabs, 'create'), 'tabs.create'),
  };
}

function mapSummary(summary: Record<string, Json | undefined>): AuctionPageCopy['summary'] {
  return {
    availableCharacterPoints: requiredText(
      read(summary, 'availableCharacterPoints'),
      'summary.availableCharacterPoints',
    ),
    lockedCharacterPoints: requiredText(
      read(summary, 'lockedCharacterPoints'),
      'summary.lockedCharacterPoints',
    ),
    activeBids: requiredText(read(summary, 'activeBids'), 'summary.activeBids'),
    myListings: requiredText(read(summary, 'myListings'), 'summary.myListings'),
    tradeSlotLimit: requiredText(read(summary, 'tradeSlotLimit'), 'summary.tradeSlotLimit'),
  };
}

function mapFilters(filters: Record<string, Json | undefined>): AuctionPageCopy['filters'] {
  return {
    title: requiredText(read(filters, 'title'), 'filters.title'),
    helperText: requiredText(read(filters, 'helperText'), 'filters.helperText'),
    searchLabel: requiredText(read(filters, 'searchLabel'), 'filters.searchLabel'),
    searchPlaceholder: requiredText(
      read(filters, 'searchPlaceholder'),
      'filters.searchPlaceholder',
    ),
    slotLabel: requiredText(read(filters, 'slotLabel'), 'filters.slotLabel'),
    priceLabel: requiredText(read(filters, 'priceLabel'), 'filters.priceLabel'),
    sortLabel: requiredText(read(filters, 'sortLabel'), 'filters.sortLabel'),
    modeLabel: requiredText(read(filters, 'modeLabel'), 'filters.modeLabel'),
  };
}

function mapFilterOptions(
  filterOptions: Record<string, Json | undefined>,
): AuctionPageCopy['filterOptions'] {
  return {
    auctionModes: requiredRecordArray(
      read(filterOptions, 'auctionModes'),
      'filterOptions.auctionModes',
    ).map((row, index) => ({
      key: requiredAuctionMode(
        read(row, 'key'),
        `filterOptions.auctionModes[${index}].key`,
      ),
      label: requiredText(read(row, 'label'), `filterOptions.auctionModes[${index}].label`),
    })),
    sortOptions: requiredRecordArray(
      read(filterOptions, 'sortOptions'),
      'filterOptions.sortOptions',
    ).map((row, index) => ({
      key: requiredAuctionSortKey(
        read(row, 'key'),
        `filterOptions.sortOptions[${index}].key`,
      ),
      label: requiredText(read(row, 'label'), `filterOptions.sortOptions[${index}].label`),
    })),
  };
}

function requiredAuctionSortKey(
  value: Json | undefined,
  field: string,
): AuctionPageCopy['filterOptions']['sortOptions'][number]['key'] {
  const key = requiredText(value, field);

  if (
    key !== 'newest' &&
    key !== 'ending_soon' &&
    key !== 'price_asc' &&
    key !== 'price_desc'
  ) {
    throw new Error(`${field} has unsupported auction sort key: ${key}.`);
  }

  return key;
}

function mapLabels(labels: Record<string, Json | undefined>): AuctionPageCopy['labels'] {
  return {
    currentBid: requiredText(read(labels, 'currentBid'), 'labels.currentBid'),
    startingBid: requiredText(read(labels, 'startingBid'), 'labels.startingBid'),
    buyNow: requiredText(read(labels, 'buyNow'), 'labels.buyNow'),
    seller: requiredText(read(labels, 'seller'), 'labels.seller'),
    endsAt: requiredText(read(labels, 'endsAt'), 'labels.endsAt'),
    endsIn: requiredText(read(labels, 'endsIn'), 'labels.endsIn'),
    characterPointsShort: requiredText(
      read(labels, 'characterPointsShort'),
      'labels.characterPointsShort',
    ),
  };
}

function mapEmpty(empty: Record<string, Json | undefined>): AuctionPageCopy['empty'] {
  return {
    listings: requiredText(read(empty, 'listings'), 'empty.listings'),
    myListings: requiredText(read(empty, 'myListings'), 'empty.myListings'),
    myBids: requiredText(read(empty, 'myBids'), 'empty.myBids'),
    eligibleItems: requiredText(read(empty, 'eligibleItems'), 'empty.eligibleItems'),
  };
}

function mapRules(rules: Record<string, Json | undefined>): AuctionPageCopy['rules'] {
  return {
    title: requiredText(read(rules, 'title'), 'rules.title'),
    rows: requiredRecordArray(read(rules, 'rows'), 'rules.rows').map((row, index) => ({
      label: requiredText(read(row, 'label'), `rules.rows[${index}].label`),
      value: requiredText(read(row, 'value'), `rules.rows[${index}].value`),
    })),
    notes: requiredTextArray(read(rules, 'notes'), 'rules.notes'),
  };
}
