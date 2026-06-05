# Mythsworn — Trade & Auctions Shape Guide

Status: DB/RPC consumption guidance for Codex / Reviewer / Frontend  
Updated: 2026-06-05  
Scope: player-facing Direct Trade and Auctions contracts, RPC usage, row shapes, workflow boundaries, and frontend restrictions.

This guide is **not** a migration and **not** a complete database dump. It is a focused shape/contract guide for implementing and reviewing Trade and Auction UI slices safely.

---

## 0. Hard rules for Codex / Frontend

Trade and Auctions are **DB/RPC-owned workflows**.

Do **not** direct-read for normal player page bootstrap:

```text
player_trade_offers
player_trade_offer_items
player_trade_transactions
player_trade_transaction_items
player_auction_listings
player_auction_bids
```

Do **not** direct-write:

```text
player_trade_offers
player_trade_offer_items
player_trade_transactions
player_trade_transaction_items
player_auction_listings
player_auction_bids
character_point_locks
character_point_ledger
items.status
items.hero_id
audit logs
anti_abuse_signals
anti_abuse_cases
```

Use canonical RPCs only.

Player-to-player economy uses **Character Points**, not Drachmy.

```text
Player-to-player trade currency = Character Points.
Drachmy = vendor/system/building currency.
```

Relevant item lock statuses:

```text
items.status:
- active
- locked_trade
- locked_auction
- scrapped
```

Locked trade/auction items must not be treated as normal usable/equippable Armory items.

---

## 1. Enums / status keys

### Direct trade

```ts
type PlayerTradeOfferStatus =
  | 'pending_target'
  | 'pending_creator'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | 'expired'
  | 'failed';

type PlayerTradeSide = 'creator' | 'target';

type PlayerTradeTransactionType =
  | 'direct_trade'
  | 'auction_sale';

type PlayerTradeTransactionStatus =
  | 'completed'
  | 'reversed'
  | 'failed';
```

### Auction

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
```

### Character Point locks

```ts
type CharacterPointLockReason =
  | 'direct_trade'
  | 'auction_bid'
  | 'auction_buy_now';

type CharacterPointLockStatus =
  | 'active'
  | 'consumed'
  | 'released'
  | 'expired'
  | 'failed';
```

---

## 2. Direct trade — page context RPC

### RPC

```sql
get_player_trade_page_context(
  p_hero_id uuid,
  p_limit integer default 50,
  p_offset integer default 0
) returns jsonb
```

### Purpose

Bootstrap for `/game/trade`.

This replaces direct reads of:

```text
player_trade_offers
player_trade_offer_items
player_trade_transactions
player_trade_transaction_items
```

`p_limit` is clamped DB-side to `1..100`; `p_offset` is clamped to `>= 0`.

### Returned JSON

```ts
interface PlayerTradePageContext {
  hero: HeroRow;

  canUseTrade: boolean;
  activeTradeSlotCount: number;
  tradeSlotLimit: number;

  offers: PlayerTradeOfferRow[];
  offerItems: PlayerTradeOfferItemRow[];

  transactions: PlayerTradeTransactionRow[];
  transactionItems: PlayerTradeTransactionItemRow[];
}
```

### Semantics

```text
hero:
- guarded by get_player_page_hero_guard(...)
- current user must be allowed to read p_hero_id

canUseTrade:
- DB-owned trade availability
- do not recalculate in Angular

activeTradeSlotCount:
- DB-owned current active trade/auction slot usage

tradeSlotLimit:
- DB-owned trade slot limit
- may depend on current Trade Route / Szlak handlowy contract when integrated

offers:
- offers on same server
- where hero is creator or target
- ordered created_at desc, id
- paginated by p_limit/p_offset

offerItems:
- items for selected offer page only

transactions:
- transactions on same server
- where hero is creator or target
- ordered created_at desc, id
- raw context may include direct_trade and auction_sale unless frontend domain layer filters for a specific screen

transactionItems:
- transaction item rows for selected transaction page only
- includes transaction-time item snapshot fields
```

---

## 3. Direct trade — row contracts

### `HeroRow`

Use the generated `hero` row shape if available. Commonly expected fields:

```ts
interface HeroRow {
  id: string;
  name: string;
  level: number | null;
  origin_id: string | null;
  rank: number | null;
  experience: number | null;
  profile_picture: string | null;
  created_at: string | null;
  estate_id: string | null;
  user_id: string;
  server_id: string;

  character_points: number;
  total_character_points_earned: number;
  total_experience_earned: number;
}
```

### `PlayerTradeOfferRow`

```ts
interface PlayerTradeOfferRow {
  id: string;
  server_id: string;

  status: PlayerTradeOfferStatus;

  creator_hero_id: string;
  target_hero_id: string;

  creator_character_points: number;
  target_character_points: number;

  description: string | null;
  status_reason: string | null;

  created_at: string;
  updated_at: string;
  expires_at: string | null;

  accepted_by_creator_at: string | null;
  accepted_by_target_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  rejected_at: string | null;
  failed_at: string | null;
}
```

Important:

```text
status_reason exists in DB row.
Player-facing UI should not expose raw status_reason as primary safe copy unless the UI/domain contract explicitly allows it.
```

### `PlayerTradeOfferItemRow`

```ts
interface PlayerTradeOfferItemRow {
  id: string;
  offer_id: string;
  item_id: string;
  offered_by_hero_id: string;
  side: PlayerTradeSide;
  created_at: string;
}
```

Important:

```text
This links selected live item IDs to a pending offer.
Do not reconstruct completed history from this table.
Completed history uses transaction item snapshots.
```

### `PlayerTradeTransactionRow`

```ts
interface PlayerTradeTransactionRow {
  id: string;
  server_id: string;

  offer_id: string | null;
  auction_listing_id: string | null;

  transaction_type: PlayerTradeTransactionType;
  status: PlayerTradeTransactionStatus;

  creator_hero_id: string | null;
  target_hero_id: string | null;

  creator_character_points: number;
  target_character_points: number;

  reason: string | null;
  description: string | null;

  created_at: string;
  completed_at: string | null;
  reversed_at: string | null;
  failed_at: string | null;
}
```

Semantics:

```text
direct_trade:
- offer_id points to source offer
- creator/target correspond to direct trade participants

auction_sale:
- auction_listing_id points to source auction
- creator_hero_id = seller
- target_hero_id = buyer
- target_character_points = sale price
```

### `PlayerTradeTransactionItemRow`

```ts
interface PlayerTradeTransactionItemRow {
  id: string;
  transaction_id: string;

  item_id: string | null;
  from_hero_id: string | null;
  to_hero_id: string | null;

  created_at: string;
  server_id: string;

  item_name_snapshot: string | null;
  item_drachma_value_snapshot: number | null;
  value_bucket_snapshot: number | null;

  generation_quality_key_snapshot: string | null;
  generation_quality_label_snapshot: string | null;

  generation_base_id_snapshot: string | null;
  generation_base_key_snapshot: string | null;
  generation_base_name_snapshot: string | null;
  generation_base_type_key_snapshot: string | null;

  prefix_affix_id_snapshot: string | null;
  prefix_affix_key_snapshot: string | null;
  prefix_affix_name_snapshot: string | null;

  suffix_affix_id_snapshot: string | null;
  suffix_affix_key_snapshot: string | null;
  suffix_affix_name_snapshot: string | null;

  has_prefix_snapshot: boolean | null;
  has_suffix_snapshot: boolean | null;

  item_snapshot_json: Record<string, unknown>;
}
```

Rendering rule:

```text
Transaction history uses transaction-time snapshot fields.
Do not reconstruct historical item state from current live items.
```

---

## 4. Direct trade — mutation RPCs

### Create offer

```sql
create_player_direct_trade_offer(
  p_creator_hero_id uuid,
  p_target_hero_id uuid,
  p_creator_character_points integer default 0,
  p_creator_item_ids uuid[] default array[]::uuid[],
  p_description text default null
) returns uuid
```

Returns:

```ts
offerId: string;
```

Guards / behavior:

```text
- requires auth.uid()
- creator hero must belong to authenticated user
- target hero must exist
- creator and target must be on same server
- creator != target
- creator must be able to use player trade
- target must be able to use player trade
- creator must have free trade slot
- creator CP cannot be negative
- creator must offer at least one item or Character Points
- duplicate item ids blocked
- item count limited by server config trade_max_items_per_direct_offer, fallback 5
- offer expiration from server config trade_direct_offer_expiration_hours, fallback 12h
- creator CP is locked via character_point_locks when amount > 0
- creator items are locked by setting items.status = locked_trade
- creates player_trade_offer_items for creator side
```

Status after success:

```text
player_trade_offers.status = pending_target
```

### Respond to offer

```sql
respond_player_direct_trade_offer(
  p_offer_id uuid,
  p_target_character_points integer default 0,
  p_target_item_ids uuid[] default array[]::uuid[],
  p_description text default null
) returns uuid
```

Returns:

```ts
offerId: string;
```

Guards / behavior:

```text
- requires auth.uid()
- offer must exist
- offer must be pending_target
- target hero must belong to authenticated user
- target must be able to use player trade
- target must have free trade slot
- target CP cannot be negative
- target must offer at least one item or Character Points
- duplicate target item ids blocked
- max item count from trade_max_items_per_direct_offer
- expired offer becomes expired, locks/items are released/unlocked, RPC raises
- target CP is locked when amount > 0
- target items are locked_trade
- creates player_trade_offer_items for target side
```

Status after success:

```text
player_trade_offers.status = pending_creator
accepted_by_target_at = now()
```

### Confirm offer

```sql
confirm_player_direct_trade_offer(
  p_offer_id uuid,
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
- offer must exist
- offer must be pending_creator
- creator hero must belong to authenticated user
- expired offer becomes expired, locks/items are released/unlocked, RPC raises
- CP-for-CP direct trade without items is blocked
- all offered items must still be locked_trade and owned by the expected side
- active CP locks must exist for non-zero CP amounts
```

On success:

```text
- inserts player_trade_transactions(transaction_type = direct_trade, status = completed)
- transfers Character Points through character point ledger
- consumes active CP locks
- transfers creator items to target
- transfers target items to creator
- inserts player_trade_transaction_items snapshots/links
- sets items.status back to active
- marks offer completed
```

Status after success:

```text
player_trade_offers.status = completed
player_trade_transactions.status = completed
```

### Cancel offer

```sql
cancel_player_direct_trade_offer(
  p_offer_id uuid,
  p_status_reason text default null
) returns uuid
```

Returns:

```ts
offerId: string;
```

Guards / behavior:

```text
- requires auth.uid()
- offer must exist
- offer status must be pending_target or pending_creator
- authenticated user must own creator or target hero
- releases CP locks
- unlocks locked_trade items
```

Status after success:

```text
player_trade_offers.status = cancelled
```

### Reject offer

```sql
reject_player_direct_trade_offer(
  p_offer_id uuid,
  p_status_reason text default null
) returns uuid
```

Returns:

```ts
offerId: string;
```

Guards / behavior:

```text
- requires auth.uid()
- offer must exist
- offer status must be pending_target or pending_creator
- authenticated user must own creator or target hero
- releases CP locks
- unlocks locked_trade items
```

Status after success:

```text
player_trade_offers.status = rejected
```

---

## 5. Auction — page context RPC

### RPC

```sql
get_player_auction_page_context(
  p_hero_id uuid,
  p_limit integer default 50,
  p_offset integer default 0
) returns jsonb
```

### Purpose

Bootstrap for `/game/auction` / `/game/auctions`.

This replaces direct reads of:

```text
player_auction_listings
player_auction_bids
auction-related player_trade_transactions
```

`p_limit` is clamped DB-side to `1..100`; `p_offset` is clamped to `>= 0`.

### Returned JSON

```ts
interface PlayerAuctionPageContext {
  hero: HeroRow;

  activeListings: PlayerAuctionListingRow[];
  myListings: PlayerAuctionListingRow[];
  myBids: PlayerAuctionBidRow[];

  auctionTransactions: PlayerTradeTransactionRow[];
}
```

### Semantics

```text
activeListings:
- active listings on hero server
- not limited to current hero
- ordered created_at desc, id
- paginated

myListings:
- listings on hero server where seller_hero_id = hero.id
- all statuses
- ordered created_at desc, id
- paginated

myBids:
- bids joined through listings on same server
- bidder_hero_id = hero.id
- ordered created_at desc, id
- paginated

auctionTransactions:
- player_trade_transactions where transaction_type = auction_sale
- involving active hero as creator/seller or target/buyer
- ordered created_at desc, id
- paginated
```

---

## 6. Auction — row contracts

### `PlayerAuctionListingRow`

```ts
interface PlayerAuctionListingRow {
  id: string;
  server_id: string;
  seller_hero_id: string;
  item_id: string;

  status: PlayerAuctionStatus;
  auction_mode: PlayerAuctionMode;

  starting_bid_character_points: number | null;
  buy_now_character_points: number | null;

  current_bid_character_points: number | null;
  current_highest_bidder_hero_id: string | null;

  description: string | null;
  status_reason: string | null;

  starts_at: string | null;
  ends_at: string | null;

  created_at: string;
  updated_at: string;

  completed_at: string | null;
  cancelled_at: string | null;
  expired_at: string | null;
  failed_at: string | null;
}
```

Mode constraints:

```text
bidding:
- starting_bid_character_points required > 0
- buy_now_character_points must be null

buy_now:
- buy_now_character_points required > 0
- starting_bid_character_points must be null

bidding_with_buy_now:
- starting_bid_character_points required > 0
- buy_now_character_points required > starting_bid_character_points
```

### `PlayerAuctionBidRow`

```ts
interface PlayerAuctionBidRow {
  id: string;
  listing_id: string;
  bidder_hero_id: string;

  amount_character_points: number;

  status: PlayerAuctionBidStatus;
  status_reason: string | null;

  created_at: string;

  cancelled_at: string | null;
  refunded_at: string | null;
  failed_at: string | null;
}
```

### Auction transaction row

Auction sale history uses `PlayerTradeTransactionRow` with:

```ts
transaction_type = 'auction_sale'
auction_listing_id = listing id
creator_hero_id = seller
target_hero_id = buyer
target_character_points = sale amount
```

Auction item history should use transaction item snapshots from `player_trade_transaction_items`, not live item reconstruction.

---

## 7. Auction — mutation RPCs

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
- seller must be able to use player trade/auction
- seller must have free active trade slot
- item must exist
- item must belong to seller hero
- item must be on same server
- item must be active
- mode/value constraints are validated explicitly
- duration from server config auction_duration_hours, fallback 24h
- item is locked with items.status = locked_auction
```

Status after success:

```text
player_auction_listings.status = active
starts_at = now()
ends_at = now() + auction_duration_hours
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
- bidder must be able to use player trade/auction
- min increment from server config auction_min_bid_increment, default likely 1
- required amount must beat starting/current bid by min increment
- CP lock is created for bid
- prior active bid lock is released/outbid as appropriate
```

Status effects:

```text
new bid inserted
listing.current_bid_character_points updated
listing.current_highest_bidder_hero_id updated
prior highest bid becomes outbid
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
- buyer must be able to use player trade/auction
- releases existing active bid locks
- creates CP lock for buy now
- finalizes auction sale immediately
```

On success:

```text
- creates player_trade_transactions(transaction_type = auction_sale)
- transfers Character Points buyer -> seller
- consumes buyer CP lock
- transfers item seller -> buyer
- creates player_trade_transaction_items snapshot/link
- marks listing completed
- releases defensive leftover locks
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
- caller must be seller or staff owner/operator/admin
- cannot cancel after any bid exists
- releases auction CP locks
- unlocks locked_auction item
```

Status after success:

```text
player_auction_listings.status = cancelled
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

## 8. Staff/search/investigation RPCs — not player page bootstrap

These are useful for moderation/admin evidence and target search, **not** normal player trade UI.

### Permissions

```sql
can_investigate_trade(p_server_id uuid) returns boolean
can_investigate_auction(p_server_id uuid) returns boolean
```

### Trade target search

```sql
search_trade_offer_targets(
  p_server_id uuid,
  p_query text,
  p_limit integer default 25
) returns table (...)
```

```sql
search_trade_offer_targets_page(
  p_server_id uuid,
  p_query text default null,
  p_limit integer default 25,
  p_offset integer default 0
) returns table (
  offer_id uuid,
  status player_trade_offer_status,
  creator_hero_id uuid,
  creator_hero_name text,
  creator_user_id uuid,
  creator_display_name text,
  target_hero_id uuid,
  target_hero_name text,
  target_user_id uuid,
  target_display_name text,
  creator_character_points integer,
  target_character_points integer,
  created_at timestamptz,
  expires_at timestamptz,
  completed_at timestamptz,
  match_kind text,
  technical_label text,
  total_count bigint
)
```

### Trade transaction target search

```sql
search_trade_transaction_targets(
  p_server_id uuid,
  p_query text,
  p_limit integer default 25
) returns table (...)
```

```sql
search_trade_transaction_targets_page(
  p_server_id uuid,
  p_query text default null,
  p_limit integer default 25,
  p_offset integer default 0
) returns table (
  transaction_id uuid,
  transaction_type player_trade_transaction_type,
  status player_trade_transaction_status,
  offer_id uuid,
  auction_listing_id uuid,
  creator_hero_id uuid,
  creator_hero_name text,
  creator_user_id uuid,
  creator_display_name text,
  target_hero_id uuid,
  target_hero_name text,
  target_user_id uuid,
  target_display_name text,
  creator_character_points integer,
  target_character_points integer,
  reason text,
  description text,
  created_at timestamptz,
  completed_at timestamptz,
  match_kind text,
  technical_label text,
  total_count bigint
)
```

### Auction target search

```sql
search_auction_listing_targets(
  p_server_id uuid,
  p_query text,
  p_limit integer default 25
) returns table (...)
```

```sql
search_auction_listing_targets_page(
  p_server_id uuid,
  p_query text default null,
  p_limit integer default 25,
  p_offset integer default 0
) returns table (
  listing_id uuid,
  status player_auction_status,
  auction_mode player_auction_mode,
  item_id uuid,
  item_display_name text,
  seller_hero_id uuid,
  seller_hero_name text,
  seller_user_id uuid,
  seller_display_name text,
  current_highest_bidder_hero_id uuid,
  current_highest_bidder_hero_name text,
  current_highest_bidder_user_id uuid,
  current_highest_bidder_display_name text,
  current_bid_character_points integer,
  buy_now_character_points integer,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz,
  match_kind text,
  technical_label text,
  total_count bigint
)
```

### Moderation item target search

```sql
search_moderation_item_targets(...)
search_moderation_item_targets_page(...)
```

Relevant because item targets may expose:

```ts
related_auction_listing_id
related_trade_offer_id
```

Do not use these player-side as normal marketplace/trade UI.

---

## 9. Internal/service helpers — do not call from Angular

These exist, but are not normal frontend contracts:

```text
assert_hero_can_use_player_trade_runtime(...)
assert_hero_can_use_player_auction_runtime(...)

hero_can_use_player_trade(...)
hero_has_free_trade_slot(...)
get_hero_active_trade_slot_count(...)
get_hero_trade_slot_limit(...)

create_character_point_lock_for_trade(...)
create_character_point_lock_for_auction_bid(...)
create_character_point_lock_for_auction_buy_now(...)

release_trade_offer_character_point_locks(...)
release_auction_character_point_locks(...)

unlock_trade_offer_items(...)
unlock_auction_item(...)

finalize_player_auction_sale(...)

audit_player_trade_offer_lifecycle()
audit_player_auction_listing_lifecycle()
audit_player_auction_bid_lifecycle()
audit_player_trade_transaction_completed()
audit_player_trade_transaction_auction_reason()

generate_trade_transaction_anti_abuse_signals(...)
generate_trade_transaction_identity_anti_abuse_signals(...)
insert_trade_transaction_anti_abuse_signal(...)
```

Reason:

```text
These are called by canonical RPCs, triggers, or staff/internal workflows.
Angular must use public workflow RPCs instead of composing lower-level locks, item transfers, audit writes, anti-abuse signals or transaction finalization.
```

Trade/auction audit and anti-abuse signal generation are DB-owned. Frontend must not add Angular AuditWriter or client-side signal creation.

---

## 10. Minimal Codex handoff

```text
Use canonical trade/auction RPCs only.

Direct trade page:
- get_player_trade_page_context(p_hero_id, p_limit, p_offset)

Direct trade actions:
- create_player_direct_trade_offer(...)
- respond_player_direct_trade_offer(...)
- confirm_player_direct_trade_offer(...)
- cancel_player_direct_trade_offer(...)
- reject_player_direct_trade_offer(...)

Auction page:
- get_player_auction_page_context(p_hero_id, p_limit, p_offset)

Auction actions:
- create_player_auction_listing(...)
- place_player_auction_bid(...)
- buy_now_player_auction(...)
- cancel_player_auction_listing(...)
- close_player_auction_listing(...)

Return semantics:
- create direct trade -> offerId
- respond direct trade -> offerId
- confirm direct trade -> transactionId
- cancel direct trade -> offerId
- reject direct trade -> offerId
- create auction -> listingId
- place bid -> bidId
- buy now -> transactionId
- cancel auction -> listingId
- close auction -> transactionId | null

Do not direct-write:
- trade/auction tables
- character_point_locks
- character_point_ledger
- items.status / items.hero_id
- audit logs
- anti-abuse signals

Do not use drachmas as player-to-player trade currency.
Use Character Points only.

Do not reconstruct history from live item state.
Use player_trade_transaction_items snapshots for trade/auction history.
```

---

## 11. Pending smoke / caution

Manual smoke remains pending for real two-hero trade and real auction flow:

```text
- direct trade create/respond/confirm/cancel/reject
- auction create/bid/buy-now/cancel/close
- completed auction history with transaction snapshots
```

Codex should report manual smoke as pending when no second hero / active listings / valid live items are available.
