# Monster Hunt — Current Decisions Log

Use this file for recent design and implementation decisions that should override older assumptions.

## Confirmed / Active

### PvE loop
- The core PvE loop is exploration + trials, not a plain monster-hunt loop.
- Movement happens through a text-described virtual space.
- A movement step may lead to:
  - nothing,
  - a light encounter,
  - a small reward,
  - or a proper trial.
- Trial count is limited daily.
- Premium may increase the number of daily trials.
- Premium does not directly improve trial quality, drop quality, or luck outcomes.

### Trial pacing and order of checks
- On each step, check trial first.
- If trial does not appear, then check encounter or nothing.
- Encounter and trial do not happen simultaneously.
- Trial chance should increase after consecutive non-trial steps.
- Trial chance resets after a trial appears.
- Normal encounters do not reset the trial progression counter.
- This system is intentional anti-dry-streak pacing, not fixed deterministic scheduling.

### Trial manifestation
- A trial appearing does not guarantee that the trial truly happens.
- After appearance, the system checks whether the trial manifests / proceeds.
- This chance depends on difficulty, the relevant stat, and slightly on luck.
- Higher difficulties should be less reliable at baseline.
- Flavor examples such as “the gods did not answer” are intentional.

### Trial difficulties
- There are three main difficulty tiers: easy, medium, hard.
- Easy should be reliable and accessible.
- Medium should usually be the best all-around progression tier.
- Hard should be the highest-ceiling tier, not the default best farming tier for everyone.
- Hard can open access to the best item quality, but still should not guarantee strong results.

### Trial rewards and quality gating
- Trials are an important source of XP.
- If a player forces difficulty that is too high and fails too often, they should lose efficiency in XP progression.
- Highest item quality (`Outstanding`) should be obtainable only from the highest difficulty tier.
- Lower tiers may still give useful loot but should not produce the top quality tier.
- Even on the highest difficulty, players may still receive ordinary items.

### Encounters
- Current minimal encounter set:
  - light combat encounter,
  - resource encounter.
- Combat encounters are lighter than combat trials and exist mostly to make exploration less empty.
- Encounter can still damage or kill the player.
- Encounter should not randomly steal player resources.
- Resource encounters may grant drachmas, materials, workforce, and similar small gains.

### Luck
- Luck has no hard global cap by default.
- Practical maximum should come from itemization, slot economy, set bonuses, and origins.
- Luck is not upgraded from player stat points.
- Luck should remain worth maximizing.
- Luck improves opportunities, not guarantees.
- High luck may reduce or effectively remove the lowest-value buckets at extreme values, depending on balancing.
- High luck should not be enough on its own to trivialize difficult combat/trials.
- Luck can slightly support trial manifestation but should not replace the relevant trial stat.

### Item philosophy
- Expensive items are not guaranteed to be useful.
- Economically strong but awkward items are allowed.
- Requirements remain an important anti-skip mechanic.
- Valuable early drops should not always be freely monetizable immediately.

### Estates / districts / buildings
- Buildings belong to the estate/world progression layer, not just a personal upgrade tree.
- Relocating to an empty estate should be easy in UX terms, but expensive in strategic terms because buildings are lost.
- Siege-based estate takeover is a longer PvP/guild process, not a one-click event.
- Current building data is still partly conceptual and subject to iteration.
- Farm: workforce resource.
- Lumber Mill: materials resource.
- Agora: drachmas resource.
- Barracks: attack-side PvP support, mainly health scaling from one chosen stat and building level, plus maybe one small offensive bonus.
- Fortress: defense-side PvP support, mainly health scaling from one chosen stat and building level, plus maybe one small defensive/combat bonus.
- Trade Routes: unlock trade, keep simple for now.
- Armory: controls visible/directly manageable item capacity; invisible items still exist until sold/scrapped.

### Prestige / reputation
- This is a separate axis from character level.
- It should broadly represent honor / standing / reputation.
- Farming much weaker opponents should not be a strong prestige source.
- Meaningful victories and successful difficult actions should matter more.
- Prestige is expected to matter more in higher-end social/world systems.

### Guilds / politics
- Guild cooperation and negotiation are intentional parts of the design.
- Coalition-building is expected and not treated as a design failure.
- Later server-level leadership, voting, and global event systems are part of the long-term direction.

### Frontend / architecture
- Angular 21
- zoneless
- signals-based
- avoid outdated Angular patterns
- avoid promise-heavy architecture by default

## Still Provisional
- exact trial chance growth curve,
- exact movement step times,
- exact district entry thresholds,
- exact prestige formula,
- exact premium values,
- exact building formulas and caps,
- exact guild size rules,
- exact server governance details,
- exact encounter reward tables,
- exact manifestation probabilities,
- final naming between prestige / reputation / honor.

---

# Update 2026-04-26 — Character Points, trade, auctions and anti-abuse runtime

## Character Points are canonical

Character Points are the canonical spendable/progression currency of a hero.

Rules:

- Character Points are stored on `hero.character_points`.
- Lifetime generated/earned baseline is stored on `hero.total_character_points_earned`.
- `character_point_ledger` is the append-only ledger of Character Point balance changes.
- Audit logs do not replace the Character Point ledger.
- Character Points are earned in parallel with experience: gaining X experience should also generate X Character Points unless a specific future rule overrides this.
- Experience is used mainly for leveling/progression thresholds.
- Character Points remain as spendable/tradable currency for stat allocation, trade, auctions, sanctions/fines and future economy flows.

## `hero_derived.hp` removed

`hero_derived.hp` was legacy/ambiguous and has been removed.

- Character Points are not stored in `hero_derived`.
- Combat hit points / health use `hero_derived.health` while the transitional table remains.
- Frontend/backend code must not read `hero_derived.hp`.
- Old wording such as Hero Points / HP-as-points must be cleaned up by Codex.

## `hero_derived` transitional decision

`hero_derived` is transitional/legacy and must not be treated as authoritative source of truth for new systems.

Current decision:

- derived stats are calculated from base stats, equipment, bonuses, formulas and contextual modifiers;
- frontend may calculate derived stat previews for UX;
- backend/RPC/domain actions must calculate authoritative values for real actions;
- reports/combat/trials should store event snapshots of the values used at the time;
- do not add new dependencies on persisted `hero_derived` values;
- do not update `hero_derived` on every equipment/stat change unless a deliberate documented cache design is introduced.

Existing code may still use remaining `hero_derived` columns and must be audited/refactored by Codex before the table can be removed.

## Item lifecycle for trade/auction

`items` now has ownership/lifecycle fields and statuses supporting trade and auctions.

Important statuses:

- `active`
- `locked_trade`
- `locked_auction`
- `scrapped`

Rules:

- player-to-player trade and auctions do not copy items;
- item ownership changes by updating `items.hero_id`;
- direct trade locks involved items as `locked_trade` until completion/cancel/reject/expiry;
- auctions lock the listed item as `locked_auction` until sale/cancel/expiry;
- locked items should not appear as usable/equippable inventory items in the player armory;
- vendor scrap is not player trade and does not use Character Points.

## Direct trade runtime

Direct trade backend/RPC runtime is implemented in the database foundation.

Rules:

- direct trade is private between two heroes on the same server;
- both sides must be able to use player trade;
- Trade Routes runtime is still represented by a fallback config until building bonus runtime is connected;
- each side must offer something: item(s) and/or Character Points;
- CP-only for CP-only exchange is blocked at finalization;
- each side only adds their own items; there is no access to the other player's inventory;
- CP offered in a pending trade is locked through `character_point_locks`;
- finalization is transactional in RPC: item ownership transfer, CP ledger, CP locks and transaction rows happen together;
- cancel/reject/expiry releases CP locks and returns items to `active`.

Main runtime tables/functions include:

- `player_trade_offers`
- `player_trade_offer_items`
- `player_trade_transactions`
- `player_trade_transaction_items`
- `character_point_locks`
- `create_player_direct_trade_offer(...)`
- `respond_player_direct_trade_offer(...)`
- `cancel_player_direct_trade_offer(...)`
- `reject_player_direct_trade_offer(...)`
- `confirm_player_direct_trade_offer(...)`

## Auction runtime

Auction backend/RPC runtime is implemented in the database foundation.

Rules:

- auctions are public server-scoped sales for exactly one item;
- no bundle/set auction support for now;
- allowed modes: bidding, buy now, bidding with buy now;
- auction duration is server-configured, not chosen by players;
- auction item is locked as `locked_auction`;
- bids lock Character Points in escrow-like CP locks;
- outbid bids are released/refunded by releasing the previous CP lock;
- buy now completes immediately;
- seller can cancel only before any bid exists;
- auction without bids after `ends_at` becomes `expired` and item returns to `active` with the same owner;
- auction with winning bid completes into a trade transaction and CP ledger entries.

Main runtime tables/functions include:

- `player_auction_listings`
- `player_auction_bids`
- `create_player_auction_listing(...)`
- `place_player_auction_bid(...)`
- `buy_now_player_auction(...)`
- `cancel_player_auction_listing(...)`
- `close_player_auction_listing(...)`

## Trade/Auction configs

Server configs added for trade/auction runtime:

- `trade_direct_offer_expiration_hours`
- `trade_max_items_per_direct_offer`
- `auction_duration_hours`
- `auction_min_bid_increment_character_points`
- `trade_active_offer_limit_fallback`

`trade_active_offer_limit_fallback` is temporary. It must be replaced by real Trade Routes/building bonus runtime.

## Anti-abuse signals and automatic case grouping

Trade/auction anti-abuse foundation is implemented for the first runtime slice.

Current implemented signals:

- `trade.high_cp_direct_trade`
- `auction.high_cp_sale`
- `trade.repeated_pair_transfers`

Rules:

- anti-abuse does not apply sanctions automatically;
- completed trade/auction transactions may create anti-abuse signals;
- signals use lightweight metadata JSON only;
- signals have `grouping_key` for case grouping;
- automatic case creation is controlled by `anti_abuse_auto_case_creation_enabled`;
- active cases are grouped by `server_id + grouping_key`;
- active statuses for grouping are `open`, `in_review`, `waiting_for_player`;
- `resolved` and `cancelled` cases are historical and are not reopened automatically;
- a new signal after a resolved/cancelled case creates a new case if auto-case is enabled;
- signal actor/target are added as case participants.

This is review tooling, not proof of abuse.

## Completed database foundation stages

The following database/runtime stages were completed and rollback-tested:

- Stage 0 — item ownership foundation;
- Stage 1 — trade and auction schema foundation;
- Stage 1.5 — Character Points balance and ledger foundation;
- Stage 2 — direct trade RPC/runtime;
- Stage 3 — auction RPC/runtime;
- Stage 4A — trade/auction anti-abuse signal generation;
- Stage 4B — automatic anti-abuse case grouping.
