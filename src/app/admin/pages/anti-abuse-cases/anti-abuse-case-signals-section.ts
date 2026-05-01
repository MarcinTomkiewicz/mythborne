import { Component, input } from '@angular/core';
import {
  AntiAbuseSignalReadModel,
} from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import { AntiAbuseSignalTypeEntry } from '../../../core/domain/anti-abuse/anti-abuse-dictionary.model';
import { Json } from '../../../core/types/database.types';
import { displayValue } from '../../../core/utils/display-value';
import { CollapsedJsonPreview } from '../../../shared/json-preview/collapsed-json-preview';

@Component({
  selector: 'app-anti-abuse-case-signals-section',
  standalone: true,
  imports: [CollapsedJsonPreview],
  templateUrl: './anti-abuse-case-signals-section.html',
})
export class AntiAbuseCaseSignalsSection {
  readonly signals = input.required<AntiAbuseSignalReadModel[]>();
  readonly signalTypes = input.required<AntiAbuseSignalTypeEntry[]>();

  signalType(signal: AntiAbuseSignalReadModel): AntiAbuseSignalTypeEntry | null {
    return this.signalTypes().find((entry) => entry.key === signal.signalTypeKey) ?? null;
  }

  value(value: string | number | null | undefined): string {
    return displayValue(value);
  }

  relatedTradeContext(signal: AntiAbuseSignalReadModel): SignalContextEntry[] {
    const entries: SignalContextEntry[] = [];
    const primaryEntityLabel = tradeEntityLabel(signal.entityTypeKey);

    if (primaryEntityLabel) {
      entries.push({
        label: primaryEntityLabel,
        value: signal.entityId,
      });
    }

    entries.push(
      ...metadataTextEntries(signal.metadataJson, [
        ['Trade offer', ['offerId', 'offer_id', 'tradeOfferId', 'trade_offer_id']],
        [
          'Trade transaction',
          ['transactionId', 'transaction_id', 'tradeTransactionId', 'trade_transaction_id'],
        ],
        ['Auction listing', ['auctionListingId', 'auction_listing_id', 'listingId', 'listing_id']],
        ['Auction bid', ['bidId', 'bid_id', 'auctionBidId', 'auction_bid_id']],
        ['Item', ['itemId', 'item_id']],
        ['Transaction item', ['transactionItemId', 'transaction_item_id']],
      ]),
    );

    return dedupeContext(entries);
  }

  isTradeOrAuctionSignal(signal: AntiAbuseSignalReadModel): boolean {
    return (
      tradeEntityLabel(signal.entityTypeKey) !== null ||
      signal.signalTypeKey.startsWith('trade.') ||
      signal.signalTypeKey.startsWith('auction.') ||
      hasTradeOrAuctionMetadataRef(signal.metadataJson)
    );
  }
}

interface SignalContextEntry {
  label: string;
  value: string | number | null | undefined;
}

function tradeEntityLabel(value: string | null): string | null {
  switch (normalizeKey(value)) {
    case 'player_trade_offer':
    case 'trade_offer':
    case 'direct_trade_offer':
      return 'Trade offer';
    case 'player_trade_transaction':
    case 'trade_transaction':
    case 'direct_trade_transaction':
      return 'Trade transaction';
    case 'player_trade_transaction_item':
    case 'trade_transaction_item':
      return 'Transaction item';
    case 'player_auction_listing':
    case 'auction_listing':
      return 'Auction listing';
    case 'player_auction_bid':
    case 'auction_bid':
      return 'Auction bid';
    default:
      return null;
  }
}

function metadataTextEntries(
  metadata: Json,
  specs: readonly [string, readonly string[]][],
): SignalContextEntry[] {
  if (!isJsonRecord(metadata)) {
    return [];
  }

  return specs.flatMap(([label, keys]) => {
    const value = firstMetadataText(metadata, keys);
    return value ? [{ label, value }] : [];
  });
}

function firstMetadataText(
  metadata: Record<string, Json | undefined>,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = metadata[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return null;
}

function hasTradeOrAuctionMetadataRef(metadata: Json): boolean {
  if (!isJsonRecord(metadata)) {
    return false;
  }

  return (
    firstMetadataText(metadata, [
      'offerId',
      'offer_id',
      'tradeOfferId',
      'trade_offer_id',
      'transactionId',
      'transaction_id',
      'tradeTransactionId',
      'trade_transaction_id',
      'auctionListingId',
      'auction_listing_id',
      'listingId',
      'listing_id',
      'bidId',
      'bid_id',
      'auctionBidId',
      'auction_bid_id',
    ]) !== null
  );
}

function dedupeContext(entries: readonly SignalContextEntry[]): SignalContextEntry[] {
  const seen = new Set<string>();
  const result: SignalContextEntry[] = [];

  for (const entry of entries) {
    const value = displayValue(entry.value);
    const key = `${entry.label}:${value}`;

    if (value === '-' || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(entry);
  }

  return result;
}

function isJsonRecord(value: Json): value is Record<string, Json | undefined> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeKey(value: string | null): string {
  return (value ?? '').trim().toLowerCase();
}
