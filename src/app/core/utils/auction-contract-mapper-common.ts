import {
  JsonRecord,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
  requiredBoolean,
  requiredNumber,
  requiredRecord,
  requiredText,
} from './json-read';
import {
  AuctionEligibleItemRow,
  AuctionListingRow,
  AuctionPagination,
  ItemDisplayCore,
  PlayerAuctionBidStatus,
  PlayerAuctionMode,
  PlayerAuctionStatus,
} from '../domain/trade/player-auction.model';
import { Json } from '../types/database.types';

export function requireContractVersion<T extends string>(
  root: JsonRecord,
  expected: T,
  field: string,
): T {
  const version = requiredText(read(root, 'contractVersion'), `${field}.contractVersion`);

  if (version !== expected) {
    throw new Error(`${field} has unsupported contractVersion: ${version}.`);
  }

  return expected;
}

export function requiredRecordArray(value: Json | undefined, field: string): JsonRecord[] {
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array.`);
  }

  return value.map((entry, index) => requiredRecord(entry, `${field}[${index}]`));
}

export function requiredTextArray(value: Json | undefined, field: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array.`);
  }

  return value.map((entry, index) => requiredText(entry, `${field}[${index}]`));
}

export function mapAuctionPagination(value: Json | undefined, field: string): AuctionPagination {
  const record = requiredRecord(value, field);

  return {
    limit: requiredNumber(read(record, 'limit'), `${field}.limit`),
    offset: requiredNumber(read(record, 'offset'), `${field}.offset`),
    totalCount: requiredNumber(read(record, 'totalCount'), `${field}.totalCount`),
    hasNextPage: requiredBoolean(read(record, 'hasNextPage'), `${field}.hasNextPage`),
  };
}

export function mapAuctionListingRow(row: JsonRecord, field: string): AuctionListingRow {
  return withOptionalFields<AuctionListingRow>({
    listingId: requiredText(read(row, 'listingId'), `${field}.listingId`),
    serverId: requiredText(read(row, 'serverId'), `${field}.serverId`),
    sellerHeroId: requiredText(read(row, 'sellerHeroId'), `${field}.sellerHeroId`),
    sellerHeroName: optionalString(row, 'sellerHeroName'),
    itemId: requiredText(read(row, 'itemId'), `${field}.itemId`),
    itemDisplayName: requiredText(read(row, 'itemDisplayName'), `${field}.itemDisplayName`),
    itemDisplayCore: mapItemDisplayCore(
      requiredRecord(read(row, 'itemDisplayCore'), `${field}.itemDisplayCore`),
      `${field}.itemDisplayCore`,
    ),
    auctionMode: requiredAuctionMode(read(row, 'auctionMode'), `${field}.auctionMode`),
    auctionModeLabel: requiredText(read(row, 'auctionModeLabel'), `${field}.auctionModeLabel`),
    status: requiredAuctionStatus(read(row, 'status'), `${field}.status`),
    statusLabel: requiredText(read(row, 'statusLabel'), `${field}.statusLabel`),
    statusTone: requiredText(read(row, 'statusTone'), `${field}.statusTone`),
    startingBidCharacterPoints: optionalNumeric(row, 'startingBidCharacterPoints'),
    startingBidDisplayValue: optionalString(row, 'startingBidDisplayValue'),
    currentBidCharacterPoints: optionalNumeric(row, 'currentBidCharacterPoints'),
    currentBidDisplayValue: optionalString(row, 'currentBidDisplayValue'),
    buyNowCharacterPoints: optionalNumeric(row, 'buyNowCharacterPoints'),
    buyNowDisplayValue: optionalString(row, 'buyNowDisplayValue'),
    currentHighestBidderHeroId: optionalString(row, 'currentHighestBidderHeroId'),
    currentHighestBidderHeroName: optionalString(row, 'currentHighestBidderHeroName'),
    primaryPriceLabel: optionalString(row, 'primaryPriceLabel'),
    primaryPriceCharacterPoints: optionalNumeric(row, 'primaryPriceCharacterPoints'),
    primaryPriceDisplayValue: optionalString(row, 'primaryPriceDisplayValue'),
    minNextBidCharacterPoints: optionalNumeric(row, 'minNextBidCharacterPoints'),
    minNextBidDisplayValue: optionalString(row, 'minNextBidDisplayValue'),
    startsAt: optionalString(row, 'startsAt'),
    endsAt: optionalString(row, 'endsAt'),
    createdAt: optionalString(row, 'createdAt'),
    endsInSeconds: optionalNumeric(row, 'endsInSeconds'),
    isOwnListing: requiredBoolean(read(row, 'isOwnListing'), `${field}.isOwnListing`),
    isHighestBidder: requiredBoolean(read(row, 'isHighestBidder'), `${field}.isHighestBidder`),
    bidCount: requiredNumber(read(row, 'bidCount'), `${field}.bidCount`),
    canBid: requiredBoolean(read(row, 'canBid'), `${field}.canBid`),
    bidBlockerKey: optionalString(row, 'bidBlockerKey'),
    bidBlockerLabel: optionalString(row, 'bidBlockerLabel'),
    canBuyNow: requiredBoolean(read(row, 'canBuyNow'), `${field}.canBuyNow`),
    buyNowBlockerKey: optionalString(row, 'buyNowBlockerKey'),
    buyNowBlockerLabel: optionalString(row, 'buyNowBlockerLabel'),
    canCancel: requiredBoolean(read(row, 'canCancel'), `${field}.canCancel`),
    cancelBlockerKey: optionalString(row, 'cancelBlockerKey'),
    cancelBlockerLabel: optionalString(row, 'cancelBlockerLabel'),
    canClose: requiredBoolean(read(row, 'canClose'), `${field}.canClose`),
  });
}

export function mapAuctionEligibleItemRow(
  row: JsonRecord,
  field: string,
): AuctionEligibleItemRow {
  return withOptionalFields<AuctionEligibleItemRow>({
    itemId: requiredText(read(row, 'itemId'), `${field}.itemId`),
    itemDisplayName: requiredText(read(row, 'itemDisplayName'), `${field}.itemDisplayName`),
    itemDisplayCore: mapItemDisplayCore(
      requiredRecord(read(row, 'itemDisplayCore'), `${field}.itemDisplayCore`),
      `${field}.itemDisplayCore`,
    ),
    drachmaValue: optionalNumeric(row, 'drachmaValue'),
    generatedAt: optionalString(row, 'generatedAt'),
    createdAt: optionalString(row, 'createdAt'),
  });
}

export function requiredAuctionMode(
  value: Json | undefined,
  field: string,
): PlayerAuctionMode {
  const mode = requiredText(value, field);

  if (
    mode !== 'bidding' &&
    mode !== 'buy_now' &&
    mode !== 'bidding_with_buy_now'
  ) {
    throw new Error(`${field} has unsupported auction mode: ${mode}.`);
  }

  return mode;
}

export function optionalString(record: JsonRecord, key: string): string | undefined {
  return optionalText(read(record, key)) ?? undefined;
}

export function optionalNumeric(record: JsonRecord, key: string): number | undefined {
  return optionalNumber(read(record, key)) ?? undefined;
}

export function optionalBooleanValue(record: JsonRecord, key: string): boolean | undefined {
  return optionalBoolean(read(record, key)) ?? undefined;
}

export function withOptionalFields<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
}

function mapItemDisplayCore(row: JsonRecord, field: string): ItemDisplayCore {
  const valueDisplay = optionalValueDisplay(row, `${field}.valueDisplay`);

  return withOptionalFields<ItemDisplayCore>({
    itemId: requiredText(read(row, 'itemId'), `${field}.itemId`),
    itemName: requiredText(read(row, 'itemName'), `${field}.itemName`),
    itemStatus: optionalString(row, 'itemStatus'),
    lifecycleStatusKey: optionalString(row, 'lifecycleStatusKey'),
    lifecycleStatusLabel: optionalString(row, 'lifecycleStatusLabel'),
    generationQualityKey: optionalString(row, 'generationQualityKey'),
    qualityLabel: optionalString(row, 'qualityLabel'),
    baseKey: optionalString(row, 'baseKey'),
    baseName: optionalString(row, 'baseName'),
    baseTypeKey: optionalString(row, 'baseTypeKey'),
    baseTypeLabel: optionalString(row, 'baseTypeLabel'),
    drachmaValue: optionalDrachmaValue(row),
    valueDisplay,
    equipmentArea: optionalString(row, 'equipmentArea'),
    displayIconKey: optionalString(row, 'displayIconKey'),
    handUsageKey: optionalString(row, 'handUsageKey'),
    handUsageLabel: optionalString(row, 'handUsageLabel'),
    allowedSlotKeys: optionalStringArray(read(row, 'allowedSlotKeys'), `${field}.allowedSlotKeys`),
  });
}

function optionalValueDisplay(
  row: JsonRecord,
  field: string,
): ItemDisplayCore['valueDisplay'] | undefined {
  const record = requiredOptionalRecord(read(row, 'valueDisplay'), field);

  if (!record) {
    return undefined;
  }

  return {
    displayLabel: requiredText(read(record, 'displayLabel'), `${field}.displayLabel`),
    displayValue: requiredText(read(record, 'displayValue'), `${field}.displayValue`),
  };
}

function optionalDrachmaValue(row: JsonRecord): string | number | undefined {
  const value = read(row, 'drachmaValue');

  return typeof value === 'string' || typeof value === 'number' ? value : undefined;
}

function optionalStringArray(value: Json | undefined, field: string): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return requiredTextArray(value, field);
}

function requiredOptionalRecord(value: Json | undefined, field: string): JsonRecord | null {
  if (value === undefined || value === null) {
    return null;
  }

  return requiredRecord(value, field);
}

function requiredAuctionStatus(value: Json | undefined, field: string): PlayerAuctionStatus {
  const status = requiredText(value, field);

  if (
    status !== 'draft' &&
    status !== 'active' &&
    status !== 'completed' &&
    status !== 'cancelled' &&
    status !== 'expired' &&
    status !== 'failed'
  ) {
    throw new Error(`${field} has unsupported auction status: ${status}.`);
  }

  return status;
}

export function requiredAuctionBidStatus(
  value: Json | undefined,
  field: string,
): PlayerAuctionBidStatus {
  const status = requiredText(value, field);

  if (
    status !== 'active' &&
    status !== 'outbid' &&
    status !== 'winning' &&
    status !== 'cancelled' &&
    status !== 'refunded' &&
    status !== 'failed'
  ) {
    throw new Error(`${field} has unsupported auction bid status: ${status}.`);
  }

  return status;
}
