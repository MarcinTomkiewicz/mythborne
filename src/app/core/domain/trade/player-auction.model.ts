import { HeroRow } from '../../types/domain-row.types';

export type PlayerAuctionMode = 'bidding' | 'buy_now' | 'bidding_with_buy_now';

export type PlayerAuctionStatus =
  | 'draft'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'failed';

export type PlayerAuctionBidStatus =
  | 'active'
  | 'outbid'
  | 'winning'
  | 'cancelled'
  | 'refunded'
  | 'failed';

export interface AuctionPageCopy {
  contractVersion: 'auction_page_copy_v1';
  header: {
    eyebrow: string;
    title: string;
    intro: string;
  };
  actions: {
    createAuction: string;
    refresh: string;
    bid: string;
    buyNow: string;
    cancel: string;
    close: string;
    details: string;
  };
  tabs: {
    browse: string;
    myListings: string;
    myBids: string;
    create: string;
  };
  summary: {
    availableCharacterPoints: string;
    lockedCharacterPoints: string;
    activeBids: string;
    myListings: string;
    tradeSlotLimit: string;
  };
  filters: {
    title: string;
    helperText: string;
    searchLabel: string;
    searchPlaceholder: string;
    slotLabel: string;
    priceLabel: string;
    sortLabel: string;
    modeLabel: string;
  };
  filterOptions: {
    auctionModes: Array<{
      key: PlayerAuctionMode;
      label: string;
    }>;
    sortOptions: Array<{
      key: 'newest' | 'ending_soon' | 'price_asc' | 'price_desc';
      label: string;
    }>;
  };
  labels: {
    currentBid: string;
    startingBid: string;
    buyNow: string;
    seller: string;
    endsAt: string;
    endsIn: string;
    characterPointsShort: string;
  };
  empty: {
    listings: string;
    myListings: string;
    myBids: string;
    eligibleItems: string;
  };
  rules: {
    title: string;
    rows: Array<{ label: string; value: string }>;
    notes: string[];
  };
}

export interface AuctionPageContext {
  contractVersion: 'auction_page_context_v1';
  hero: HeroRow;
  summary: {
    characterPoints: number;
    characterPointsDisplayValue: string;
    availableCharacterPoints: number;
    availableCharacterPointsDisplayValue: string;
    lockedCharacterPoints: number;
    lockedCharacterPointsDisplayValue: string;
    activeBidCount: number;
    myListingCount: number;
    activeListingCount: number;
    activeTradeSlotCount: number;
    tradeSlotLimit: number;
    hasFreeTradeSlot: boolean;
    canUseAuction: boolean;
    canCreateAuction: boolean;
    createAuctionBlockerKey?: string;
    createAuctionBlockerLabel?: string;
  };
  constraints: AuctionConstraints;
  navigation: {
    defaultTabKey: AuctionTabKey;
    tabs: Array<{
      key: AuctionTabKey;
      labelKey: string;
      count?: number;
    }>;
  };
}

export interface AuctionListingsSearchPage {
  contractVersion: 'auction_listings_search_page_v1';
  activeListings: AuctionListingRow[];
  pagination: AuctionPagination;
  appliedFilters: {
    query: string | null;
    auctionMode: string | null;
    baseTypeKey: string | null;
    priceMin: number | null;
    priceMax: number | null;
    sortKey: string;
  };
}

export interface AuctionListingsPage {
  contractVersion: 'auction_listings_page_v1';
  myListings: AuctionListingRow[];
  pagination: AuctionPagination;
}

export interface AuctionBidsPage {
  contractVersion: 'auction_bids_page_v1';
  myBids: AuctionBidRow[];
  pagination: AuctionPagination;
}

export interface AuctionCreateContext {
  contractVersion: 'auction_create_context_v1';
  canCreateAuction: boolean;
  blockerKey?: string;
  blockerLabel?: string;
  constraints: AuctionConstraints;
  auctionModes: Array<{
    key: PlayerAuctionMode;
    label: string;
    helperText: string;
  }>;
  eligibleItems: AuctionEligibleItemRow[];
  pagination: AuctionPagination;
}

export interface AuctionPagination {
  limit: number;
  offset: number;
  totalCount: number;
  hasNextPage: boolean;
}

export interface AuctionListingRow {
  listingId: string;
  serverId: string;
  sellerHeroId: string;
  sellerHeroName?: string;
  itemId: string;
  itemDisplayName: string;
  itemDisplayCore: ItemDisplayCore;
  auctionMode: PlayerAuctionMode;
  auctionModeLabel: string;
  status: PlayerAuctionStatus;
  statusLabel: string;
  statusTone: string;
  startingBidCharacterPoints?: number;
  startingBidDisplayValue?: string;
  currentBidCharacterPoints?: number;
  currentBidDisplayValue?: string;
  buyNowCharacterPoints?: number;
  buyNowDisplayValue?: string;
  currentHighestBidderHeroId?: string;
  currentHighestBidderHeroName?: string;
  primaryPriceLabel?: string;
  primaryPriceCharacterPoints?: number;
  primaryPriceDisplayValue?: string;
  minNextBidCharacterPoints?: number;
  minNextBidDisplayValue?: string;
  startsAt?: string;
  endsAt?: string;
  createdAt?: string;
  endsInSeconds?: number;
  isOwnListing: boolean;
  isHighestBidder: boolean;
  bidCount: number;
  canBid: boolean;
  bidBlockerKey?: string;
  bidBlockerLabel?: string;
  canBuyNow: boolean;
  buyNowBlockerKey?: string;
  buyNowBlockerLabel?: string;
  canCancel: boolean;
  cancelBlockerKey?: string;
  cancelBlockerLabel?: string;
  canClose: boolean;
}

export interface AuctionBidRow {
  bidId: string;
  listingId: string;
  bidderHeroId: string;
  amountCharacterPoints: number;
  amountDisplayValue: string;
  status: PlayerAuctionBidStatus;
  statusLabel: string;
  statusTone: string;
  createdAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  failedAt?: string;
  listing: AuctionListingRow | null;
}

export interface AuctionEligibleItemRow {
  itemId: string;
  itemDisplayName: string;
  itemDisplayCore: ItemDisplayCore;
  drachmaValue?: number;
  generatedAt?: string;
  createdAt?: string;
}

export interface ItemDisplayCore {
  itemId: string;
  itemName: string;
  itemStatus?: string;
  lifecycleStatusKey?: string;
  lifecycleStatusLabel?: string;
  generationQualityKey?: string;
  qualityLabel?: string;
  baseKey?: string;
  baseName?: string;
  baseTypeKey?: string;
  baseTypeLabel?: string;
  drachmaValue?: string | number;
  valueDisplay?: {
    displayLabel: string;
    displayValue: string;
  };
  equipmentArea?: string;
  displayIconKey?: string;
  handUsageKey?: string;
  handUsageLabel?: string;
  allowedSlotKeys?: string[];
}

export interface AuctionListingsFilters {
  auctionMode?: PlayerAuctionMode;
  baseTypeKey?: string;
  priceMin?: number;
  priceMax?: number;
  sortKey?: 'newest' | 'ending_soon' | 'price_asc' | 'price_desc';
}

export interface PlayerAuctionCreateListingResult {
  listingId: string;
}

export interface PlayerAuctionCancelListingResult {
  listingId: string;
}

export interface PlayerAuctionBidResult {
  bidId: string;
}

export interface PlayerAuctionBuyNowResult {
  transactionId: string;
}

export interface PlayerAuctionCloseResult {
  transactionId: string | null;
}

export interface CreatePlayerAuctionListingInput {
  sellerHeroId: string;
  itemId: string;
  auctionMode: PlayerAuctionMode;
  startingBidCharacterPoints?: number | null;
  buyNowCharacterPoints?: number | null;
  description?: string | null;
}

export interface PlacePlayerAuctionBidInput {
  auctionListingId: string;
  bidderHeroId: string;
  amountCharacterPoints: number;
}

export interface PlayerAuctionListingActionInput {
  auctionListingId: string;
  description?: string | null;
  statusReason?: string | null;
}

export interface PlayerAuctionBuyNowInput {
  auctionListingId: string;
  buyerHeroId: string;
  description?: string | null;
}

type AuctionTabKey = 'browse' | 'myListings' | 'myBids' | 'create';

interface AuctionConstraints {
  currencyKey: 'character_points';
  currencyLabel: 'Punkty Postaci';
  currencyShortLabel: 'PP';
  listingItemCount: 1;
  auctionDurationHours: number;
  minBidIncrementCharacterPoints: number;
  minStartingBidCharacterPoints: number;
  minBuyNowCharacterPoints: number;
}
