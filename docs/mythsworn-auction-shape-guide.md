# Mythsworn — Auction Shape Guide

Status: DB/RPC consumption guidance for Codex / Reviewer / Frontend  
Updated: 2026-06-06  
Scope: player-facing Auction contracts only: page copy, page context, auction listing search, own listings, own bids, create context, watch/unwatch, action RPCs, row shapes, workflow boundaries and frontend restrictions.

This guide is **not** a migration and **not** a complete database dump. It is a focused shape/contract guide for implementing and reviewing the Auction UI safely.

---

## 0. Hard rules for Codex / Frontend

Auctions are **DB/RPC-owned workflows**.

Use the Auction split contract in this guide. The legacy auction bootstrap has been removed; do **not** use:

```text
get_player_auction_page_context(...)
```

Do **not** direct-read for normal player auction page bootstrap:

```text
player_auction_listings
player_auction_bids
player_auction_watches
player_trade_transactions
player_trade_transaction_items
items
character_point_locks
character_point_ledger
```

Do **not** direct-write:

```text
player_auction_listings
player_auction_bids
player_auction_watches
player_trade_transactions
player_trade_transaction_items
character_point_locks
character_point_ledger
items.status
items.hero_id
audit logs
anti_abuse_signals
anti_abuse_cases
```

Use canonical RPCs only.

Auction currency is **Character Points**.

```text
Auction currency = Character Points.
UI short label = PP.
Drachmy are not auction currency.
```

Relevant item lock statuses:

```text
items.status:
- active
- locked_auction
- locked_trade
- scrapped
```

Locked auction items must not be treated as normal usable/equippable Armory items.

---

## 1. Canonical Auction split functions

Use simple domain names.

Do not add `player` to new Auction RPC names just because the RPC accepts `p_hero_id`.

Do not add `my` to function names. `myListings` and `myBids` may exist inside returned payloads because they are UI-friendly payload fields, but not as function names.

Do not add `json` to function names. The functions may technically return `jsonb`, but semantically they return page copy, page context, or a page of rows.

Canonical Auction split functions:

```sql
get_auction_page_copy()

get_auction_page_context(
  p_hero_id uuid
)

search_auction_listings_page(
  p_hero_id uuid,
  p_query text default null,
  p_filters jsonb default '{}'::jsonb,
  p_limit integer default 25,
  p_offset integer default 0
)

get_auction_listings_page(
  p_hero_id uuid,
  p_limit integer default 25,
  p_offset integer default 0
)

get_auction_bids_page(
  p_hero_id uuid,
  p_limit integer default 25,
  p_offset integer default 0
)

get_auction_create_context(
  p_hero_id uuid,
  p_limit integer default 25,
  p_offset integer default 0
)
```

Meaning:

```text
get_auction_page_copy
- page labels, actions, filters, placeholders, filter options, pagination templates, empty states and rules only

get_auction_page_context
- lightweight hero-scoped summary and eligibility only
- no listing rows
- no bid rows
- no create item list
- no page copy

search_auction_listings_page
- currently active auction market listings available on the hero server
- search/filter/sort/pagination

get_auction_listings_page
- auctions listed by the given hero
- payload field: myListings

get_auction_bids_page
- bids placed by the given hero
- payload field: myBids

get_auction_create_context
- create-auction form context
- eligible active owned items
- auction modes
- constraints
- create blockers
```

---

## 2. Enums / status keys

```ts
type PlayerAuctionMode =
  | 'bidding'
  | 'buy_now'
  | 'bidding_with_buy_now';

type PlayerAuctionStatus =
  | 'draft'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'failed';

type PlayerAuctionBidStatus =
  | 'active'
  | 'outbid'
  | 'winning'
  | 'cancelled'
  | 'refunded'
  | 'failed';

type CharacterPointLockReason =
  | 'auction_bid'
  | 'auction_buy_now'
  | string;

type CharacterPointLockStatus =
  | 'active'
  | 'consumed'
  | 'released'
  | 'expired'
  | 'failed'
  | string;
```

---

## 3. Page copy

### RPC

```sql
get_auction_page_copy() returns jsonb
```

### Purpose

DB-owned copy for the Auction page.

It returns labels, actions, tabs, filter labels/options, pagination templates, empty states and rules. It contains **no hero/runtime data** and **no auction listings**.

### Shape

```ts
interface AuctionPageCopy {
  contractVersion: 'auction_page_copy_v1';

  header: {
    eyebrow: string;
    title: string;
    intro: string;
  };

  actions: {
    createAuction: string;
    refresh: string;
    search: string;
    bid: string;
    buyNow: string;
    watch: string;
    unwatch: string;
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
    searchActionLabel: string;
    slotLabel: string;
    priceLabel: string;
    sortLabel: string;
    modeLabel: string;
  };

  filterOptions: {
    auctionModes: Array<{
      key: 'bidding' | 'buy_now' | 'bidding_with_buy_now';
      label: string;
    }>;

    sortOptions: Array<{
      key: 'newest' | 'ending_soon' | 'price_asc' | 'price_desc';
      label: string;
    }>;

    baseTypeOptions: Array<{
      key: string | null;
      label: string;
    }>;
  };

  pagination: {
    rangeTemplate: string;     // "Wyświetlane aukcje {start}–{end} z {total}"
    bidRangeTemplate: string;  // "Wyświetlane licytacje {start}–{end} z {total}"
    itemRangeTemplate: string; // "Wyświetlane przedmioty {start}–{end} z {total}"
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
```

### Current expected labels/options

```text
header.title = Aukcje
actions.createAuction = Utwórz aukcję
actions.search = Szukaj
actions.bid = Licytuj
actions.buyNow = Kup teraz
actions.watch = Obserwuj
actions.unwatch = Przestań obserwować
actions.refresh = Odśwież
filters.searchActionLabel = Szukaj
filters.searchPlaceholder = Szukaj przedmiotu albo sprzedawcy
labels.characterPointsShort = PP
filterOptions.baseTypeOptions[0] = { key: null, label: "Wszystkie" }
pagination.rangeTemplate = Wyświetlane aukcje {start}–{end} z {total}
```

Current verified base type options include:

```text
Wszystkie
Broń jednoręczna
Broń dwuręczna
Broń dystansowa
Hełm
Pancerz
Nogawice
Buty
Pierścień
Amulet
Tarcza
```

Rules copy must be rendered as-is from DB. Frontend must not rewrite rules locally.

---

## 4. Lightweight page context

### RPC

```sql
get_auction_page_context(
  p_hero_id uuid
) returns jsonb
```

### Purpose

Lightweight hero-scoped page context for the Auction page header/summary/navigation.

It does not return copy, listing rows, bid rows or eligible item rows.

### Shape

```ts
interface AuctionPageContext {
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

  constraints: {
    currencyKey: 'character_points';
    currencyLabel: 'Punkty Postaci';
    currencyShortLabel: 'PP';

    listingItemCount: 1;

    auctionDurationHours: number;
    minBidIncrementCharacterPoints: number;
    minStartingBidCharacterPoints: number;
    minBuyNowCharacterPoints: number;
  };

  navigation: {
    defaultTabKey: 'browse' | 'myListings' | 'myBids' | 'create';

    tabs: Array<{
      key: 'browse' | 'myListings' | 'myBids' | 'create';
      labelKey: string;
      count?: number;
    }>;
  };
}
```

---

## 5. Search active auction listings

### RPC

```sql
search_auction_listings_page(
  p_hero_id uuid,
  p_query text default null,
  p_filters jsonb default '{}'::jsonb,
  p_limit integer default 25,
  p_offset integer default 0
) returns jsonb
```

### Purpose

Main auction market browse/search endpoint.

Returns **currently active auction listings** available on the hero server.

Use this for the primary auction list / browse tab.

### Filters

Current supported filters:

```ts
interface AuctionListingsFilters {
  auctionMode?: 'bidding' | 'buy_now' | 'bidding_with_buy_now';
  baseTypeKey?: string;
  priceMin?: number;
  priceMax?: number;
  sortKey?: 'newest' | 'ending_soon' | 'price_asc' | 'price_desc';
}
```

`p_query` searches item display name and seller name.

### Shape

```ts
interface AuctionListingsSearchPage {
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
```

---

## 6. Own auction listings page

### RPC

```sql
get_auction_listings_page(
  p_hero_id uuid,
  p_limit integer default 25,
  p_offset integer default 0
) returns jsonb
```

### Purpose

Returns auctions listed by the given hero.

Function name is domain-simple. Payload field is UI-friendly `myListings`.

### Shape

```ts
interface AuctionListingsPage {
  contractVersion: 'auction_listings_page_v1';

  myListings: AuctionListingRow[];

  pagination: AuctionPagination;
}
```

---

## 7. Own bids page

### RPC

```sql
get_auction_bids_page(
  p_hero_id uuid,
  p_limit integer default 25,
  p_offset integer default 0
) returns jsonb
```

### Purpose

Returns bids placed by the given hero.

Function name is domain-simple. Payload field is UI-friendly `myBids`.

### Shape

```ts
interface AuctionBidsPage {
  contractVersion: 'auction_bids_page_v1';

  myBids: AuctionBidRow[];

  pagination: AuctionPagination;
}
```

---

## 8. Create auction context

### RPC

```sql
get_auction_create_context(
  p_hero_id uuid,
  p_limit integer default 25,
  p_offset integer default 0
) returns jsonb
```

### Purpose

Context for the create-auction form.

Returns create eligibility, auction constraints, auction modes and eligible active owned items.

### Shape

```ts
interface AuctionCreateContext {
  contractVersion: 'auction_create_context_v1';

  canCreateAuction: boolean;
  blockerKey?: string;
  blockerLabel?: string;

  constraints: {
    currencyKey: 'character_points';
    currencyLabel: 'Punkty Postaci';
    currencyShortLabel: 'PP';

    listingItemCount: 1;

    minStartingBidCharacterPoints: number;
    minBuyNowCharacterPoints: number;
    minBidIncrementCharacterPoints: number;
    auctionDurationHours: number;
  };

  auctionModes: Array<{
    key: 'bidding' | 'buy_now' | 'bidding_with_buy_now';
    label: string;
    helperText: string;
  }>;

  eligibleItems: AuctionEligibleItemRow[];

  pagination: AuctionPagination;
}
```

### Eligible item row

```ts
interface AuctionEligibleItemRow {
  itemId: string;
  itemDisplayName: string;

  itemDisplayCore: ItemDisplayCore;

  drachmaValue?: number;
  generatedAt?: string;
  createdAt?: string;
}
```

Only `active` owned items are eligible. Locked, scrapped or non-owned items must not be listed.

---

## 9. Shared pagination

```ts
interface AuctionPagination {
  limit: number;
  offset: number;
  totalCount: number;
  hasNextPage: boolean;

  rangeStart: number;
  rangeEnd: number;
  rangeTotal: number;
  rangeTemplate: string;
  displayLabel: string;
}
```

Use returned pagination. Do not infer total count from current page length.

Examples:

```text
Wyświetlane aukcje 1–3 z 3
Wyświetlane aukcje 0–0 z 0
Wyświetlane licytacje 0–0 z 0
Wyświetlane przedmioty 1–5 z 5
```

---

## 10. Auction listing display row

Returned by:

```text
search_auction_listings_page(...).activeListings[]
get_auction_listings_page(...).myListings[]
get_auction_bids_page(...).myBids[].listing
```

Shape:

```ts
interface AuctionListingRow {
  listingId: string;
  serverId: string;

  sellerHeroId: string;
  sellerHeroName?: string;

  itemId: string;
  itemDisplayName: string;
  itemDisplayCore: ItemDisplayCore;

  auctionMode: 'bidding' | 'buy_now' | 'bidding_with_buy_now';
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

  watchId: string | null;
  isWatched: boolean;
  canWatch: boolean;
  canUnwatch: boolean;
  watchBlockerKey: string | null;
  watchBlockerLabel: string | null;

  canCancel: boolean;
  cancelBlockerKey?: string;
  cancelBlockerLabel?: string;

  canClose: boolean;
}
```

### Watch row semantics

Watch fields are always present on `AuctionListingRow`. `watchBlockerKey` and `watchBlockerLabel` must exist as JSON keys even when their value is `null`.

```text
Not watched, can watch:
- watchId = null
- isWatched = false
- canWatch = true
- canUnwatch = false
- watchBlockerKey = null
- watchBlockerLabel = null

Watched:
- watchId = uuid
- isWatched = true
- canWatch = false
- canUnwatch = true
- watchBlockerKey = already_watched
- watchBlockerLabel = Już obserwujesz tę aukcję

After unwatch:
- same as not watched, can watch
```

### Rendering rules

- Render item name from `itemDisplayName`.
- Render item visual/core badges from `itemDisplayCore`.
- Render seller from `sellerHeroName`.
- Render auction mode from `auctionModeLabel`.
- Render status from `statusLabel` / `statusTone`.
- Render current/starting/buy-now prices from display fields.
- Render primary price from `primaryPriceLabel` + `primaryPriceDisplayValue`.
- Render next bid minimum from `minNextBidDisplayValue`.
- Render action buttons only from `canBid`, `canBuyNow`, `canWatch`, `canUnwatch`, `canCancel`, `canClose`.
- Render disabled reason from matching `*BlockerLabel`.
- Do not compute action eligibility in Angular.
- Do not compute next bid in Angular.
- Do not compute watch state locally.
- Do not compute whether the auction has ended in Angular except for countdown display based on DB `endsInSeconds` if needed.

---

## 11. Auction bid display row

Returned by:

```text
get_auction_bids_page(...).myBids[]
```

Shape:

```ts
interface AuctionBidRow {
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
```

Rendering rules:

- Render bid amount from `amountDisplayValue`.
- Render status from `statusLabel` / `statusTone`.
- Render nested auction card from `listing` if present.
- Do not reconstruct bid status from listing status locally.

---

## 12. Item display core

Auction rows use the shared item display core shape returned by DB helpers.

Current observed fields include:

```ts
interface ItemDisplayCore {
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
```

Use this only for card/list display. Do not use it as item lifecycle authority.

For full item detail popover, use the shared item popover RPCs:

```text
item_popover_copy()
item_popover_detail(...)
```

Do not create auction-specific item popovers.

---

## 13. Auction action RPCs

### Create listing

```sql
create_player_auction_listing(
  p_seller_hero_id uuid,
  p_item_id uuid,
  p_auction_mode player_auction_mode,
  p_starting_bid_character_points integer default null,
  p_buy_now_character_points integer default null,
  p_description text default null
) returns uuid
```

Returns:

```ts
listingId: string;
```

Guards / behavior:

```text
- requires auth.uid()
- seller hero must belong to authenticated user
- seller must be able to use auctions
- seller must have free active trade/auction slot
- item must exist
- item must belong to seller hero
- item must be on same server
- item must be active
- auction mode/value constraints are validated DB-side
- item is locked with items.status = locked_auction
- listing status becomes active
- starts_at = now()
- ends_at = now() + auction_duration_hours
```

### Place bid

```sql
place_player_auction_bid(
  p_auction_listing_id uuid,
  p_bidder_hero_id uuid,
  p_amount_character_points integer
) returns uuid
```

Returns:

```ts
bidId: string;
```

Guards / behavior:

```text
- requires auth.uid()
- amount must be positive
- listing must exist
- listing must be active
- listing must not be ended
- listing mode cannot be buy_now
- bidder hero must belong to authenticated user
- bidder server must match listing server
- seller cannot bid on own auction
- current highest bidder cannot outbid self
- bidder must be able to use auctions
- amount must satisfy DB-owned minimum
- CP lock is created for bid
- prior active bid lock is released/outbid as appropriate
- listing current bid/current highest bidder are updated
```

### Buy now

```sql
buy_now_player_auction(
  p_auction_listing_id uuid,
  p_buyer_hero_id uuid,
  p_description text default null
) returns uuid
```

Returns:

```ts
transactionId: string;
```

Guards / behavior:

```text
- requires auth.uid()
- listing must exist
- listing must be active
- listing must not be ended
- listing mode must be buy_now or bidding_with_buy_now
- buy_now_character_points must exist and be positive
- buyer hero must belong to authenticated user
- buyer server must match listing server
- seller cannot buy own auction
- buyer must be able to use auctions
- releases existing active bid locks
- creates CP lock for buy now
- finalizes auction sale immediately
```

On success:

```text
- creates auction sale transaction
- transfers Character Points buyer -> seller
- consumes buyer CP lock
- transfers item seller -> buyer
- creates transaction item snapshot/link
- marks listing completed
- releases defensive leftover locks
```

### Watch listing

```sql
watch_auction_listing(
  p_hero_id uuid,
  p_auction_listing_id uuid
) returns uuid
```

Returns:

```ts
watchId: string;
```

Guards / behavior:

```text
- requires auth.uid()
- hero must belong to authenticated user
- listing must exist
- listing must be on the same server
- listing must be active
- listing must not have ended
- hero cannot watch own listing
- creates or reactivates player_auction_watches row
```

### Unwatch listing

```sql
unwatch_auction_listing(
  p_hero_id uuid,
  p_auction_listing_id uuid
) returns uuid | null
```

Returns:

```ts
watchId: string | null;
```

Behavior:

```text
- requires auth.uid()
- hero must belong to authenticated user
- deactivates active watch row if present
- returns null if there was no active watch row
```

### Cancel listing

```sql
cancel_player_auction_listing(
  p_auction_listing_id uuid,
  p_status_reason text default null
) returns uuid
```

Returns:

```ts
listingId: string;
```

Guards / behavior:

```text
- requires auth.uid()
- listing must exist
- listing must be active
- caller must be seller or authorized staff
- cannot cancel after any bid exists
- releases auction CP locks
- unlocks locked_auction item
- listing status becomes cancelled
```

### Close listing

```sql
close_player_auction_listing(
  p_auction_listing_id uuid,
  p_description text default null
) returns uuid
```

Returns:

```ts
transactionId: string | null;
```

Guards / behavior:

```text
- listing must exist
- listing must be active
- listing must have ended
```

If no bids:

```text
- releases auction CP locks
- unlocks locked_auction item
- marks listing expired
- returns null
```

If winning bid exists:

```text
- finalizes auction sale with current_highest_bidder_hero_id and current_bid_character_points
- returns transactionId
```

Important:

```text
close may return null.
Codex must not treat every close result as transaction id.
```

---

## 14. Internal helpers — do not call from Angular

These exist for DB composition only:

```text
build_auction_listing_row(...)
build_auction_listing_row_raw_v1(...)
build_auction_bid_row(...)
get_auction_page_copy_raw_v1(...)
search_auction_listings_page_raw_v1(...)
get_auction_listings_page_raw_v1(...)
get_auction_bids_page_raw_v1(...)
get_auction_create_context_raw_v1(...)
get_auction_base_type_filter_options(...)
build_auction_pagination_display(...)
apply_auction_pagination_display(...)
hero_can_use_player_trade(...)
hero_has_free_trade_slot(...)
get_hero_active_trade_slot_count(...)
get_hero_trade_slot_limit(...)
create_character_point_lock_for_auction_bid(...)
create_character_point_lock_for_auction_buy_now(...)
release_auction_character_point_locks(...)
unlock_auction_item(...)
finalize_player_auction_sale(...)
audit_player_auction_listing_lifecycle()
audit_player_auction_bid_lifecycle()
```

Reason:

```text
These are called by canonical RPCs, triggers, or internal DB helpers.
Angular must use public auction RPCs instead of composing lower-level locks, item transfers, audit writes or finalization.
```

---

## 15. Minimal Codex handoff

```text
Use the Auction split contract only.

Read:
- get_auction_page_copy()
- get_auction_page_context(p_hero_id)
- search_auction_listings_page(p_hero_id, p_query, p_filters, p_limit, p_offset)
- get_auction_listings_page(p_hero_id, p_limit, p_offset)
- get_auction_bids_page(p_hero_id, p_limit, p_offset)
- get_auction_create_context(p_hero_id, p_limit, p_offset)

Actions:
- create_player_auction_listing(...)
- place_player_auction_bid(...)
- buy_now_player_auction(...)
- watch_auction_listing(...)
- unwatch_auction_listing(...)
- cancel_player_auction_listing(...)
- close_player_auction_listing(...)

Do not use:
- get_player_auction_page_context(...)
- build_auction_listing_row(...)
- build_auction_listing_row_raw_v1(...)
- build_auction_bid_row(...)
- any raw_v1 auction RPC

Return semantics:
- create auction -> listingId
- place bid -> bidId
- buy now -> transactionId
- watch auction -> watchId
- unwatch auction -> watchId | null
- cancel auction -> listingId
- close auction -> transactionId | null

Do not direct-read or direct-write auction tables, watch tables, item status, item owner, CP locks, CP ledger, audit or anti-abuse tables.

Do not use drachmas as auction currency.
Use Character Points / PP only.

Do not compute auction eligibility, next bid, buy-now eligibility, watch eligibility, cancel eligibility or close eligibility in Angular.
Use DB fields canBid/canBuyNow/canWatch/canUnwatch/canCancel/canClose and blocker labels.

Use:
- copy.actions.search / copy.filters.searchActionLabel for search button copy
- copy.filterOptions.baseTypeOptions for base-type filters
- payload.pagination.displayLabel for pagination range text
- copy.rules.rows and copy.rules.notes without local rewrite
```

---

## 16. Current verified sandbox smoke

Latest canonical-only verification:

```text
canonicalOnlyOk = true
legacyGetPlayerAuctionPageContextExists = false
unexpectedCallableFunctions = []
missingExpectedFunctions = []

Frontend-callable Auction RPCs are exactly:
- buy_now_player_auction
- cancel_player_auction_listing
- close_player_auction_listing
- create_player_auction_listing
- get_auction_bids_page
- get_auction_create_context
- get_auction_listings_page
- get_auction_page_context
- get_auction_page_copy
- place_player_auction_bid
- search_auction_listings_page
- unwatch_auction_listing
- watch_auction_listing

No direct anon/authenticated table privileges:
- player_auction_bids
- player_auction_listings
- player_auction_watches
```

Latest Auction split smoke:

```text
final_auction_smoke.smokeOk = true
get_auction_page_copy.contractVersion = auction_page_copy_v1
get_auction_page_context.contractVersion = auction_page_context_v1
search_auction_listings_page.contractVersion = auction_listings_search_page_v1
get_auction_listings_page.contractVersion = auction_listings_page_v1
get_auction_bids_page.contractVersion = auction_bids_page_v1
get_auction_create_context.contractVersion = auction_create_context_v1

search_auction_listings_page.rowCount = 3
search_auction_listings_page.pagination.displayLabel = Wyświetlane aukcje 1–3 z 3
get_auction_listings_page.pagination.displayLabel = Wyświetlane aukcje 0–0 z 0
get_auction_bids_page.pagination.displayLabel = Wyświetlane licytacje 0–0 z 0
get_auction_create_context.pagination.displayLabel = Wyświetlane przedmioty 1–5 z 5
```

Latest copy/options/rules/watch verification:

```text
verificationOk = true
actions.search = Szukaj
actions.watch = Obserwuj
actions.unwatch = Przestań obserwować
filters.searchActionLabel = Szukaj
filterOptions.baseTypeOptions includes { key: null, label: "Wszystkie" }
rulesContainTechnicalWords = false
pagination.rangeTemplate = Wyświetlane aukcje {start}–{end} z {total}
listingRowHelperClosed = true
rawListingRowHelperClosed = true
watchAuthenticatedOnly = true
unwatchAuthenticatedOnly = true
watchBlockerKey/watchBlockerLabel keys are present even when null
```

Latest watch/unwatch smoke:

```text
watch_smoke_result.status = pass

before watch:
- isWatched = false
- canWatch = true
- canUnwatch = false
- watchBlockerKey = null
- watchBlockerLabel = null

after watch:
- isWatched = true
- canWatch = false
- canUnwatch = true
- watchBlockerKey = already_watched
- watchBlockerLabel = Już obserwujesz tę aukcję

after unwatch:
- isWatched = false
- canWatch = true
- canUnwatch = false
- watchBlockerKey = null
- watchBlockerLabel = null
```
