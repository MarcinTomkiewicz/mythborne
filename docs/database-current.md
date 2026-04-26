# Monster Hunt — Database Current Notes

This file is not a full schema dump.
It is a lightweight semantic guide for the most important domain tables and rules.

If this file conflicts with migrations, prefer migrations and update this file later.

## General Rules
- PostgreSQL / Supabase
- relational modeling
- RLS-enabled user data
- explicit keys and constraints preferred
- central bonus-template model preferred over hardcoded stat columns everywhere

## Canonical Base Stats
Base stats come from the stats table and should be treated as canonical.

Current canonical set:
- strength
- dexterity
- endurance
- agility
- cunning
- charisma
- wisdom
- intelligence
- spirituality

Do not hardcode old stat lists from outdated concept docs.

## `hero_stats`
Purpose:
- stores base stat values for a hero

Notes:
- keyed by hero and stat key
- should align with the canonical stats table

## `hero_derived`
Purpose:
- stores derived / special values such as:
  - health / hp-style combat values,
  - defense,
  - min damage,
  - max damage,
  - luck

Notes:
- luck is treated as a special derived/equipment-sensitive stat, not a normal point-investment stat

## `bonus_templates`
Purpose:
- central definition of bonuses

Pattern:
- `target`
- `type`
- `description`

Use:
- origins
- items
- buildings
- other modular bonus systems

Design rule:
Prefer modular bonus linking over hardcoded effect columns across many domain entities.

## `buildings`
Important columns:
- `key`: canonical technical identifier
- `name`
- `description`
- `rank_required`
- `district_code`
- `image_path`
- `sort_order`
- `base_cost`
- `base_build_time_minutes`
- `max_level`
- `requirements` (jsonb)

Important semantics:
- `district_code` links building availability to estate district logic
- `rank_required` is a progression gate, but should not be simplistically treated as the same thing as district
- `requirements` is a flexible extension point for future gating
- `max_level = 0` may mean unlimited, depending on feature logic
- building descriptions may still be conceptual, not final effect specs

## Estate / district layer
The game has a separate estate/district system.

Important conceptual distinction:
- district / estate access
- building availability
- player level
- prestige / reputation

These are related but not identical systems.

Do not collapse them into one variable unless explicitly instructed.

## Trials / encounters / progression
Even if not all of this is stored directly in current tables yet, implementation should respect these semantics:
- trial appearance,
- trial manifestation,
- trial completion

These are distinct stages and should not be flattened conceptually.

Also note:
- normal encounters do not reset trial progression chance,
- the highest item quality should be gated by the highest difficulty tier,
- premium should increase daily attempt count, not quality odds.

## Migrations as source of truth
When implementing schema-sensitive features:
1. read relevant migrations,
2. read current seed data if needed,
3. only use this file as a semantic shortcut.

This file should be updated when:
- a table meaning changes,
- a key relation changes,
- a gameplay-relevant column is added,
- or a major naming decision changes.

---

# Update 2026-04-26 — Economy/trade/auction/anti-abuse schema state

## `hero` Character Points columns

`hero` now stores Character Points directly:

- `character_points integer not null default 0`
- `total_character_points_earned integer not null default 0`

Constraints prevent negative values.

Character Points are current spendable/tradable balance. They are earned alongside experience and can be spent on stats, trade, auctions, penalties and future economy sinks.

## `character_point_ledger`

`character_point_ledger` is the append-only history of Character Point balance changes.

Important fields:

- `server_id`
- `hero_id`
- `amount_delta`
- `balance_after`
- `reason public.character_point_ledger_reason`
- `related_entity_type`
- `related_entity_id`
- `description`
- `created_by`
- `created_at`

Ledger is separate from audit logs. Audit describes important domain/admin actions; ledger explains CP balance.

## `hero_derived`

`hero_derived.hp` has been removed.

`hero_derived.health` remains as combat health while this table is transitional.

Remaining `hero_derived` values must not be treated as authoritative source of truth for new systems. The intended direction is runtime derived-stat resolution from base stats, equipment, bonuses, formulas and context.

## `items` lifecycle / ownership

`items` supports trade/auction lifecycle:

- `server_id`
- `hero_id`
- `status public.item_status`
- `scrapped_at`
- `recoverable_until`

Current `item_status` values:

- `active`
- `scrapped`
- `locked_trade`
- `locked_auction`

Trade/auction should change ownership by updating `items.hero_id`, not by copying item rows.

## Direct trade tables

Direct trade foundation uses:

- `player_trade_offers`
- `player_trade_offer_items`
- `player_trade_transactions`
- `player_trade_transaction_items`
- `character_point_locks`

Important rules:

- offers are server-scoped;
- both heroes must be on the same server;
- pending offer items are locked as `locked_trade`;
- offered Character Points are reserved in `character_point_locks`;
- completion writes `player_trade_transactions`, transaction item rows and Character Point ledger rows;
- cancel/reject/expiry releases locks.

## Auction tables

Auction foundation uses:

- `player_auction_listings`
- `player_auction_bids`
- `character_point_locks`
- `player_trade_transactions` with `transaction_type = auction_sale`
- `player_trade_transaction_items`

Important rules:

- one auction sells exactly one item;
- item is locked as `locked_auction`;
- allowed modes: `bidding`, `buy_now`, `bidding_with_buy_now`;
- auction duration is configured per server;
- bids reserve CP through locks;
- buy now completes immediately;
- auction without bids after `ends_at` becomes `expired` and item returns to `active`;
- auction with winning bid writes a completed transaction and CP ledger rows.

## Trade/Auction runtime functions

Important RPC/runtime functions include:

- `create_player_direct_trade_offer(...)`
- `respond_player_direct_trade_offer(...)`
- `cancel_player_direct_trade_offer(...)`
- `reject_player_direct_trade_offer(...)`
- `confirm_player_direct_trade_offer(...)`
- `create_player_auction_listing(...)`
- `place_player_auction_bid(...)`
- `buy_now_player_auction(...)`
- `cancel_player_auction_listing(...)`
- `close_player_auction_listing(...)`
- `get_hero_available_character_points(...)`
- `apply_character_points_delta(...)`

Critical mutating operations should use RPC/domain operations rather than direct UI table mutation.

## Trade/Auction configs

Server-configured keys added:

- `trade_direct_offer_expiration_hours`
- `trade_max_items_per_direct_offer`
- `auction_duration_hours`
- `auction_min_bid_increment_character_points`
- `trade_active_offer_limit_fallback`

`trade_active_offer_limit_fallback` is temporary until Trade Routes building bonus runtime is connected.

## Anti-abuse signal/case grouping

Implemented signal types:

- `trade.high_cp_direct_trade`
- `auction.high_cp_sale`
- `trade.repeated_pair_transfers`

Automatic case grouping:

- controlled by `anti_abuse_auto_case_creation_enabled`;
- signals with the same `server_id + grouping_key` attach to one active case;
- active statuses are `open`, `in_review`, `waiting_for_player`;
- resolved/cancelled cases are not reopened;
- a unique partial index prevents duplicate active cases for the same `server_id + grouping_key`;
- actor/target are linked as participants.

Anti-abuse still does not apply sanctions automatically.

## Completed rollback-tested database stages

Completed and tested:

- item ownership foundation;
- trade/auction schema foundation;
- Character Points balance and ledger foundation;
- direct trade RPC/runtime;
- auction RPC/runtime;
- trade/auction anti-abuse signal generation;
- automatic anti-abuse case grouping.
