# Mythsworn — Direct Trade Shape Guide

Status: DB/RPC consumption guidance for Codex / Reviewer / Frontend  
Updated: 2026-06-05  
Scope: player-facing Direct Trade contracts only: page copy, page context, target search, pending offers, create context, action RPCs, row shapes, workflow boundaries and frontend restrictions.

This guide is **not** a migration and **not** a complete database dump. It is a focused shape/contract guide for implementing and reviewing the Direct Trade UI safely.

---

## 0. Hard rules for Codex / Frontend

Direct Trade is a **DB/RPC-owned workflow**.

Do **not** use the legacy direct-trade bootstrap for the new Direct Trade screen:

```text
get_player_trade_page_context(...)
```

Use the split direct-trade contract in this guide.

Do **not** direct-read for normal player Direct Trade page bootstrap:

```text
player_trade_offers
player_trade_offer_items
player_trade_transactions
player_trade_transaction_items
items
character_point_locks
character_point_ledger
```

Do **not** direct-write:

```text
player_trade_offers
player_trade_offer_items
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

Direct Trade currency is **Character Points**.

```text
Direct Trade currency = Character Points.
UI short label = PP.
Drachmy are not Direct Trade currency.
```

Relevant item lock statuses:

```text
items.status:
- active
- locked_trade
- locked_auction
- scrapped
```

Locked trade items must not be treated as normal usable/equippable Armory items.

If the Trade Route / Szlak handlowy slot limit is `0`, Direct Trade is unavailable:

```text
canUseTrade = false
canCreateOffer = false
canSendOffer = false
eligibleItems = []
```

Frontend should show the DB-owned blocker/copy and must not render the offer builder as usable.

---

## 1. Function naming decision

Use simple domain names.

Do not add `player` to new Direct Trade RPC names just because the RPC accepts `p_hero_id`.

Do not add `my` to function names. UI-friendly payload fields are allowed.

Do not add `json` to function names. The functions may technically return `jsonb`, but semantically they return page copy, page context, or a page of rows.

Canonical Direct Trade split functions:

```sql
get_trade_page_copy()

get_trade_page_context(
  p_hero_id uuid
)

search_trade_targets_page(
  p_hero_id uuid,
  p_query text default null,
  p_limit integer default 25,
  p_offset integer default 0
)

get_trade_offers_page(
  p_hero_id uuid,
  p_limit integer default 25,
  p_offset integer default 0
)

get_trade_create_context(
  p_hero_id uuid,
  p_target_hero_id uuid default null,
  p_limit integer default 25,
  p_offset integer default 0
)
```

Meaning:

```text
get_trade_page_copy
- page labels, actions, sections, empty states, blocked states and rules only

get_trade_page_context
- lightweight hero-scoped summary and eligibility only
- exactly four header summary fields
- no offer rows
- no target search rows
- no item rows
- no page copy

search_trade_targets_page
- same-server heroes as potential Direct Trade targets
- includes DB-owned receive eligibility

get_trade_offers_page
- currently pending direct-trade offers for the hero
- creator or target side

get_trade_create_context
- create-offer form context
- selected target state when provided
- eligible active owned items
- constraints
- send blockers
```

---

## 2. Enums / status keys

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

type CharacterPointLockReason =
  | 'direct_trade'
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
get_trade_page_copy() returns jsonb
```

### Purpose

DB-owned copy for the Direct Trade page.

It returns labels, actions, sections, empty states, blocked states and rules. It contains **no hero/runtime data**, **no offers**, **no targets** and **no item rows**.

### Shape

```ts
interface TradePageCopy {
  contractVersion: 'trade_page_copy_v1';

  header: {
    eyebrow: string;
    title: string;
    intro: string;
  };

  actions: {
    sendOffer: string;
    reset: string;
    respond: string;
    reject: string;
    cancel: string;
    open: string;
    changeTarget: string;
  };

  sections: {
    offerBuilder: string;
    yourOffer: string;
    response: string;
    pendingOffers: string;
    rules: string;
  };

  summary: {
    availableCharacterPoints: string;
    lockedCharacterPoints: string;
    activeOffers: string;
    pendingOffers: string;
  };

  labels: {
    targetHero: string;
    yourCharacterPoints: string;
    responseCharacterPoints: string;
    selectedItems: string;
    characterPointsToLock: string;
    targetResponseWaiting: string;
    targetNotSet: string;
  };

  empty: {
    eligibleItems: string;
    pendingOffers: string;
    responseItems: string;
  };

  blocked: {
    tradeUnavailableTitle: string;
    tradeUnavailableText: string;
    noFreeSlotTitle: string;
    noFreeSlotText: string;
  };

  rules: {
    title: string;
    rows: Array<{ label: string; value: string }>;
    notes: string[];
  };
}
```

### Current expected labels

```text
header.title = Złóż ofertę wybranemu bohaterowi
actions.sendOffer = Złóż ofertę
actions.reset = Resetuj
summary.activeOffers = Aktywne oferty
```

There is intentionally no `saveDraft` action. No draft workflow exists for this screen.

---

## 4. Lightweight page context

### RPC

```sql
get_trade_page_context(
  p_hero_id uuid
) returns jsonb
```

### Purpose

Lightweight hero-scoped page context for the Direct Trade header/summary and eligibility.

It does not return page copy, pending offers, targets or eligible item rows.

### Header summary rule

Header summary has **exactly four fields**:

```text
1. Dostępne Punkty Postaci
2. Zablokowane Punkty Postaci
3. Aktywne oferty
4. Oferty oczekujące
```

No additional header rows should be rendered from this context.

### Shape

```ts
interface TradePageContext {
  contractVersion: 'trade_page_context_v1';

  hero: HeroRow;

  headerSummary: {
    availableCharacterPoints: {
      label: 'Dostępne Punkty Postaci';
      value: number;
      displayValue: string;
    };

    lockedCharacterPoints: {
      label: 'Zablokowane Punkty Postaci';
      value: number;
      displayValue: string;
    };

    activeOffers: {
      label: 'Aktywne oferty';
      used: number;
      limit: number;
      displayValue: string; // e.g. "0 / 3"
    };

    pendingOffers: {
      label: 'Oferty oczekujące';
      value: number;
      displayValue: string;
    };
  };

  canUseTrade: boolean;
  canCreateOffer: boolean;
  createOfferBlockerKey?: string;
  createOfferBlockerLabel?: string;

  constraints: {
    currencyKey: 'character_points';
    currencyLabel: 'Punkty Postaci';
    currencyShortLabel: 'PP';

    maxItemsPerSide: number;
    offerExpirationHours: number;
  };
}
```

### Field semantics

```text
availableCharacterPoints
= get_hero_available_character_points(p_hero_id)

lockedCharacterPoints
= get_hero_active_character_point_locks(p_hero_id)

activeOffers.used
= get_hero_active_trade_slot_count(p_hero_id)

activeOffers.limit
= get_hero_trade_slot_limit(p_hero_id)

activeOffers.displayValue
= used || ' / ' || limit

pendingOffers
= count(player_trade_offers)
  where hero is creator or target
  and status in ('pending_target', 'pending_creator')
```

### Current Vlad sandbox smoke

```text
contractVersion = trade_page_context_v1
headerSummary.availableCharacterPoints.displayValue = 193
headerSummary.lockedCharacterPoints.displayValue = 0
headerSummary.activeOffers.displayValue = 0 / 3
headerSummary.pendingOffers.displayValue = 0
canUseTrade = true
canCreateOffer = true
```

---

## 5. Target search

### RPC

```sql
search_trade_targets_page(
  p_hero_id uuid,
  p_query text default null,
  p_limit integer default 25,
  p_offset integer default 0
) returns jsonb
```

### Purpose

Search same-server heroes as possible Direct Trade targets.

The returned target row includes DB-owned receive eligibility. Frontend must not decide target eligibility locally.

### Shape

```ts
interface TradeTargetsSearchPage {
  contractVersion: 'trade_targets_search_page_v1';

  targets: TradeTargetRow[];

  pagination: TradePagination;

  appliedFilters: {
    query: string | null;
  };
}
```

### Target row

```ts
interface TradeTargetRow {
  heroId: string;
  heroName: string;
  level?: number;
  rank?: number;

  canReceiveOffer: boolean;
  blockerKey?: string;
  blockerLabel?: string;
}
```

Rendering rules:

- Show target name from `heroName`.
- Disable/select-block only from `canReceiveOffer`.
- Show blocker from `blockerLabel`.
- Do not decide target availability locally from building level or restrictions.

Current Vlad sandbox smoke returned Walford as a same-server target with:

```text
canReceiveOffer = false
blockerKey = trade_unavailable
blockerLabel = Handel wymaga Szlaku handlowego
```

---

## 6. Pending offers page

### RPC

```sql
get_trade_offers_page(
  p_hero_id uuid,
  p_limit integer default 25,
  p_offset integer default 0
) returns jsonb
```

### Purpose

Returns currently pending direct-trade offers where the hero is creator or target.

### Shape

```ts
interface TradeOffersPage {
  contractVersion: 'trade_offers_page_v1';

  pendingOffers: TradeOfferRow[];

  pagination: TradePagination;
}
```

Only statuses included:

```ts
'pending_target' | 'pending_creator'
```

Current Vlad sandbox smoke returned an empty `pendingOffers` array.

---

## 7. Create trade context

### RPC

```sql
get_trade_create_context(
  p_hero_id uuid,
  p_target_hero_id uuid default null,
  p_limit integer default 25,
  p_offset integer default 0
) returns jsonb
```

### Purpose

Context for the Direct Trade offer builder.

Returns selected target state when provided, send eligibility, constraints and eligible active owned items.

If no target is selected, it still may return eligible items, but `canSendOffer = false` and blocker is target-related.

If Trade Route slot limit is `0`, `canSendOffer = false` and `eligibleItems = []`.

### Shape

```ts
interface TradeCreateContext {
  contractVersion: 'trade_create_context_v1';

  targetHero: TradeTargetRow | null;

  canSendOffer: boolean;
  sendOfferBlockerKey?: string;
  sendOfferBlockerLabel?: string;

  constraints: {
    currencyKey: 'character_points';
    currencyLabel: 'Punkty Postaci';
    currencyShortLabel: 'PP';

    maxItemsPerSide: number;
    offerExpirationHours: number;
  };

  eligibleItems: TradeEligibleItemRow[];

  pagination: TradePagination;
}
```

### Current expected no-target behavior

```text
targetHero = null
canSendOffer = false
sendOfferBlockerKey = target_required
sendOfferBlockerLabel = Wybierz bohatera
eligibleItems may be present if the hero can use trade
```

Current Vlad sandbox smoke:

```text
contractVersion = trade_create_context_v1
canSendOffer = false
sendOfferBlockerKey = target_required
eligibleItems = 5
```

---

## 8. Eligible item row

Returned by:

```text
get_trade_create_context(...).eligibleItems[]
```

Shape:

```ts
interface TradeEligibleItemRow {
  itemId: string;
  itemDisplayName: string;

  itemDisplayCore: ItemDisplayCore;

  drachmaValue?: number;
  generatedAt?: string;
  createdAt?: string;
}
```

Only `active` owned items are eligible.

Do not list:
- `locked_trade`;
- `locked_auction`;
- `scrapped`;
- non-owned items;
- items from another server.

---

## 9. Pending offer row

Returned by:

```text
get_trade_offers_page(...).pendingOffers[]
```

Shape:

```ts
interface TradeOfferRow {
  offerId: string;

  status: PlayerTradeOfferStatus;
  statusLabel: string;
  statusTone: string;

  createdAt?: string;
  expiresAt?: string;
  endsInSeconds?: number;

  creatorHeroId: string;
  creatorHeroName: string;

  targetHeroId: string;
  targetHeroName: string;

  viewerRole: 'creator' | 'target';
  directionKey: 'incoming' | 'outgoing';

  creatorOffer: TradeOfferSide;
  targetOffer: TradeOfferSide;

  viewerOffer: TradeOfferSide;
  counterpartyOffer: TradeOfferSide;

  canRespond: boolean;
  respondBlockerKey?: string;
  respondBlockerLabel?: string;

  canConfirm: boolean;
  confirmBlockerKey?: string;
  confirmBlockerLabel?: string;

  canCancel: boolean;
  cancelBlockerKey?: string;
  cancelBlockerLabel?: string;

  canReject: boolean;
  rejectBlockerKey?: string;
  rejectBlockerLabel?: string;
}
```

Rendering rules:

- Incoming/outgoing badges come from `directionKey`.
- Render status from `statusLabel` / `statusTone`.
- Render current user side from `viewerOffer`.
- Render other side from `counterpartyOffer`.
- Render buttons only from `canRespond`, `canConfirm`, `canCancel`, `canReject`.
- Render disabled reason from matching blocker labels.
- Do not compute offer action eligibility in Angular.

---

## 10. Offer side

```ts
interface TradeOfferSide {
  side: 'creator' | 'target';

  heroId: string;
  heroName: string;

  characterPoints: number;
  characterPointsDisplayValue: string;

  itemCount: number;
  items: TradeOfferItemRow[];

  isSet: boolean;
}
```

Semantics:

```text
creatorOffer.isSet = true

targetOffer.isSet = false
when the offer is still pending_target and target has not responded with items/PP
```

---

## 11. Offer item row

```ts
interface TradeOfferItemRow {
  itemId: string;
  itemDisplayName: string;

  itemDisplayCore: ItemDisplayCore;
}
```

---

## 12. Shared pagination

```ts
interface TradePagination {
  limit: number;
  offset: number;
  totalCount: number;
  hasNextPage: boolean;
}
```

Use returned pagination. Do not infer total count from current page length.

---

## 13. Item display core

Trade rows use the shared item display core shape returned by DB helpers.

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

Use this only for display. Do not use it as item lifecycle authority.

---

## 14. Direct Trade action RPCs

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
- creator must be able to use Direct Trade
- target must be able to use Direct Trade
- creator must have free trade/auction slot
- creator CP cannot be negative
- creator must offer at least one item or Character Points
- duplicate item ids blocked
- item count limited by DB config
- offer expiration from DB config
- creator CP is locked when amount > 0
- creator items are locked_trade
- creates creator-side offer item rows
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
- target must be able to use Direct Trade
- target must have free trade/auction slot
- target CP cannot be negative
- target must offer at least one item or Character Points
- duplicate target item ids blocked
- expired offer becomes expired, locks/items are released/unlocked, RPC raises
- target CP is locked when amount > 0
- target items are locked_trade
- creates target-side offer item rows
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
- creates direct trade transaction
- transfers Character Points through Character Point ledger
- consumes active CP locks
- transfers creator items to target
- transfers target items to creator
- creates transaction item snapshots/links
- sets items.status back to active
- marks offer completed
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
- marks offer cancelled
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
- marks offer rejected
```

---

## 15. Internal helpers — do not call from Angular

These exist for DB composition only:

```text
build_trade_item_row(...)
build_trade_offer_side(...)
build_trade_offer_row(...)
hero_can_use_player_trade(...)
hero_has_free_trade_slot(...)
get_hero_active_trade_slot_count(...)
get_hero_trade_slot_limit(...)
create_character_point_lock_for_trade(...)
release_trade_offer_character_point_locks(...)
unlock_trade_offer_items(...)
```

Reason:

```text
These are called by canonical RPCs, triggers, or internal DB helpers.
Angular must use public Direct Trade RPCs instead of composing lower-level locks, item transfers, audit writes or finalization.
```

---

## 16. Minimal Codex handoff

```text
Use the Direct Trade split contract only.

Read:
- get_trade_page_copy()
- get_trade_page_context(p_hero_id)
- search_trade_targets_page(p_hero_id, p_query, p_limit, p_offset)
- get_trade_offers_page(p_hero_id, p_limit, p_offset)
- get_trade_create_context(p_hero_id, p_target_hero_id, p_limit, p_offset)

Actions:
- create_player_direct_trade_offer(...)
- respond_player_direct_trade_offer(...)
- confirm_player_direct_trade_offer(...)
- cancel_player_direct_trade_offer(...)
- reject_player_direct_trade_offer(...)

Do not use:
- get_player_trade_page_context(...)
- build_trade_item_row(...)
- build_trade_offer_side(...)
- build_trade_offer_row(...)

Header summary must render exactly four fields:
- headerSummary.availableCharacterPoints
- headerSummary.lockedCharacterPoints
- headerSummary.activeOffers
- headerSummary.pendingOffers

Do not add extra header summary rows.

No Save Draft action. Do not implement drafts.

Return semantics:
- create offer -> offerId
- respond offer -> offerId
- confirm offer -> transactionId
- cancel offer -> offerId
- reject offer -> offerId

Do not direct-read or direct-write trade tables, item status, item owner, CP locks, CP ledger, audit or anti-abuse tables.

Do not use drachmas as Direct Trade currency.
Use Character Points / PP only.

Do not compute trade eligibility, target eligibility, send eligibility, respond eligibility, confirm eligibility, cancel eligibility or reject eligibility in Angular.
Use DB fields and blocker labels.
```

---

## 17. Current verified sandbox smoke

For Vlad on sandbox:

```text
get_trade_page_copy.contractVersion = trade_page_copy_v1

get_trade_page_context.contractVersion = trade_page_context_v1
canUseTrade = true
canCreateOffer = true
headerSummary.availableCharacterPoints.displayValue = 193
headerSummary.lockedCharacterPoints.displayValue = 0
headerSummary.activeOffers.displayValue = 0 / 3
headerSummary.pendingOffers.displayValue = 0

search_trade_targets_page.contractVersion = trade_targets_search_page_v1
targets includes Walford
Walford.canReceiveOffer = false
Walford.blockerKey = trade_unavailable

get_trade_offers_page.contractVersion = trade_offers_page_v1
pendingOffers = []

get_trade_create_context.contractVersion = trade_create_context_v1
canSendOffer = false
sendOfferBlockerKey = target_required
eligibleItems = 5
```

Empty pending offers are valid when no offers exist yet.
