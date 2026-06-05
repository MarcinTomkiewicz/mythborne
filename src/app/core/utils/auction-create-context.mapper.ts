import {
  AuctionCreateContext,
} from '../domain/trade/player-auction.model';
import { Json } from '../types/database.types';
import {
  read,
  requiredBoolean,
  requiredNumber,
  requiredRecord,
  requiredText,
} from './json-read';
import {
  mapAuctionEligibleItemRow,
  mapAuctionPagination,
  optionalString,
  requireContractVersion,
  requiredAuctionMode,
  requiredRecordArray,
  withOptionalFields,
} from './auction-contract-mapper-common';

export function mapAuctionCreateContext(value: Json): AuctionCreateContext {
  const root = requiredRecord(value, 'get_auction_create_context');

  return withOptionalFields<AuctionCreateContext>({
    contractVersion: requireContractVersion(
      root,
      'auction_create_context_v1',
      'get_auction_create_context',
    ),
    canCreateAuction: requiredBoolean(
      read(root, 'canCreateAuction'),
      'get_auction_create_context.canCreateAuction',
    ),
    blockerKey: optionalString(root, 'blockerKey'),
    blockerLabel: optionalString(root, 'blockerLabel'),
    constraints: mapCreateConstraints(
      requiredRecord(read(root, 'constraints'), 'get_auction_create_context.constraints'),
    ),
    auctionModes: requiredRecordArray(
      read(root, 'auctionModes'),
      'get_auction_create_context.auctionModes',
    ).map((row, index) => ({
      key: requiredAuctionMode(read(row, 'key'), `auctionModes[${index}].key`),
      label: requiredText(read(row, 'label'), `auctionModes[${index}].label`),
      helperText: requiredText(read(row, 'helperText'), `auctionModes[${index}].helperText`),
    })),
    eligibleItems: requiredRecordArray(
      read(root, 'eligibleItems'),
      'get_auction_create_context.eligibleItems',
    ).map((row, index) =>
      mapAuctionEligibleItemRow(row, `get_auction_create_context.eligibleItems[${index}]`),
    ),
    pagination: mapAuctionPagination(
      read(root, 'pagination'),
      'get_auction_create_context.pagination',
    ),
  });
}

function mapCreateConstraints(
  constraints: Record<string, Json | undefined>,
): AuctionCreateContext['constraints'] {
  const currencyKey = requiredText(read(constraints, 'currencyKey'), 'constraints.currencyKey');
  const currencyLabel = requiredText(read(constraints, 'currencyLabel'), 'constraints.currencyLabel');
  const currencyShortLabel = requiredText(
    read(constraints, 'currencyShortLabel'),
    'constraints.currencyShortLabel',
  );
  const listingItemCount = requiredNumber(
    read(constraints, 'listingItemCount'),
    'constraints.listingItemCount',
  );

  if (currencyKey !== 'character_points') {
    throw new Error(`constraints.currencyKey has unsupported value: ${currencyKey}.`);
  }

  if (currencyLabel !== 'Punkty Postaci') {
    throw new Error(`constraints.currencyLabel has unsupported value: ${currencyLabel}.`);
  }

  if (currencyShortLabel !== 'PP') {
    throw new Error(`constraints.currencyShortLabel has unsupported value: ${currencyShortLabel}.`);
  }

  if (listingItemCount !== 1) {
    throw new Error(`constraints.listingItemCount has unsupported value: ${listingItemCount}.`);
  }

  return {
    currencyKey: 'character_points',
    currencyLabel: 'Punkty Postaci',
    currencyShortLabel: 'PP',
    listingItemCount: 1,
    minStartingBidCharacterPoints: requiredNumber(
      read(constraints, 'minStartingBidCharacterPoints'),
      'constraints.minStartingBidCharacterPoints',
    ),
    minBuyNowCharacterPoints: requiredNumber(
      read(constraints, 'minBuyNowCharacterPoints'),
      'constraints.minBuyNowCharacterPoints',
    ),
    minBidIncrementCharacterPoints: requiredNumber(
      read(constraints, 'minBidIncrementCharacterPoints'),
      'constraints.minBidIncrementCharacterPoints',
    ),
    auctionDurationHours: requiredNumber(
      read(constraints, 'auctionDurationHours'),
      'constraints.auctionDurationHours',
    ),
  };
}
