# Mythborne — Current Decisions Log

Updated: 2026-05-01

Use this file for recent design and implementation decisions that should override older assumptions.

If something conflicts, prefer:

1. explicit user instruction,
2. current database schema / migrations / dump,
3. this file,
4. broader concept documents.

---

## Exploration / L11 Admin Configuration Decisions — 2026-05-01

Trial definitions and trial combat candidates now have a canonical DB/RPC write path for admin/balancer tooling.

Current RPCs:

- `upsert_trial_definition(...)` — create/update `trial_definitions`;
- `upsert_trial_combat_candidate(...)` — create/update `trial_combat_candidates`;
- `deactivate_trial_combat_candidate(...)` — deactivate a trial combat candidate.

Frontend must not direct-write `trial_definitions` or `trial_combat_candidates`.

These RPCs require authenticated user context, config-governance permission, and a non-blank reason.

`trial_definitions.minigame_key` is the source of truth for trial minigame routing. Combat candidates may be edited only for trial definitions with `minigame_key = combat`.

Candidate kind rules:

- `opponent` candidate requires `opponent_definition_id` and null `family_key`;
- `family` candidate requires `family_key` and null `opponent_definition_id`;
- `difficulty_multiplier` and `weight` must be positive;
- min/max hero level constraints, if present, must be valid and ordered.

Exploration read policies were added for active difficulty tiers and owner-readable runtime exploration tables. These are read-only policies. Persistent exploration mutations still use canonical PvE RPCs.

The previous L11 read-only inspector blocker was real before these RPCs existed. After this DB foundation, Codex can convert L11 into a write-capable configurator using these RPCs.

---

## Notifications / Epic Q Decisions — 2026-05-01

Notifications are persistent inbox/bell entries for short attention or status events.

Notifications are not game reports, audit logs, player abuse reports, or local UI-only toasts/messages.

The DB notification row is the durable source. A toast is only a frontend presentation of a fresh notification row when the recipient is online and the notification type has `default_toast_enabled = true`.

Reports have their own Reports inbox and unread badge. Do not create default `game_report.created` notifications for ordinary report creation.

Current recipient kinds:

- `user` — account/global notification;
- `hero` — gameplay/server/hero notification;
- `staff` — staff/server-work notification.

Current notification severity values:

- `info`;
- `notice`;
- `warning`;
- `critical`.

Frontend must not insert notification rows directly. DB/RPC workflows create notifications through `create_notification(...)`. Frontend may call `mark_notification_read(...)` and `dismiss_notification(...)` for current-user notifications.

DB-owned hooks currently cover:

- direct trade offer received/rejected/completed;
- auction outbid/sold/won;
- declaration approved/rejected;
- abuse report resolved/dismissed;
- anti-abuse case waiting for player/staff;
- sanction created;
- Character Points penalty created.

Notification body/title/action URLs are concise attention messages. They are not historical item/report snapshots. For example, auction item names may be composed from the current listing/item at notification creation time.

---

## Game Reports / Epic P Decisions — 2026-05-01

Game reports are player-facing gameplay reports, not audit logs and not player abuse reports.

A report should reproduce the same core event view the player saw in-game. The private Reports UI renders it inside the normal application shell; the public link renders the same report content without the app shell.

Public report route is conceptually `/report/:publicToken`. Use `game_reports.public_token` instead of exposing internal report ids.

Game reports are shared per event. Multiple heroes can have private access to the same report through `game_report_hero_access` with roles `owner`, `participant`, or `viewer`.

Removing a report from a hero's Reports list removes that hero access row. If it was the final access row, the report row is deleted and the public token stops resolving. This is gameplay/report cleanup, not audit deletion; audit logs and other durable system records remain separate.

Current report type dictionary values include:

- `combat`;
- `trial`;
- `encounter`;
- `pvp_combat`;
- `siege`.

Combat report production is the first concrete producer and wraps `combat_results`. Combat reports must not duplicate combat attack rows; renderers should read the durable combat result snapshot tables.

Trial and encounter reports should later wrap challenge/encounter outcomes, reward grant data and optional combat sections. PvP and siege report producers belong to future PvP/siege epics, but the report model is ready for those types.

Reward/drop item references are public showcase item references. If the dropped item still exists, renderers should prefer the live `items` row and current balanced item card. If the item row is gone, renderers fall back to saved quality/base/prefix/suffix component refs and fallback display name.

Reward/drop report references intentionally do not snapshot final item stats forever. Reports show the living item when it still exists, not a frozen pre-rebalance stat card.

Combat attack source labels can be public, but full private player equipment/loadouts must not be exposed by default. Drop rewards are showcase items; used weapons/equipment are not automatically full public item cards.

---

## Formula Runtime Decisions — 2026-05-01

`balance_formulas` and their assignments are the source of truth for configurable gameplay formulas.

Frontend formula runtime is preview/explainability tooling. It is not authoritative for durable gameplay mutations.

Any DB/RPC/backend workflow that persists gameplay state must evaluate assigned formulas server-side when the result affects durable state.

Examples: building upgrade cost/time, stat upgrade cost/cap validation, XP-to-next-level validation, combat/opponent scaling where persisted, reward/challenge resolution where formula-backed, and future PvP/siege/resource calculations.

The database now has restricted numeric evaluation helpers: `evaluate_balance_formula_expression(...)`, `evaluate_balance_formula_target(...)`, `formula_round_up(...)`, `formula_round_down(...)`, `formula_clamp(...)`, `formula_random()`, and `formula_random(min, max)`.

If a new authoritative workflow needs formula evaluation and the current helper subset is insufficient, extend the approved DB/backend formula runtime instead of duplicating formula expressions in ad hoc RPC helpers.

---

## Estates / Buildings Runtime Decisions — 2026-05-01

Empty estate addresses are not rows.

`district_code + address_number` is the source of truth for estate address identity.

`estates.address` remains legacy/display compatibility. It is not the long-term source of truth. Codex must report a `DB cleanup candidate` when frontend/backend no longer depends on it.

Current address capacities: A=5000, B=3000, C=500, D=50, E=1.

Moving to an empty address is destructive and irreversible for the current estate state. The canonical RPC is `relocate_hero_estate_to_empty_address(...)`. This is not siege/takeover.

Building construction/upgrades use one active job per estate. Player-facing cancel is not part of MVP; `cancelled` and `failed` are reserved for admin/system correction paths.

`finalize_completed_estate_building_jobs(p_estate_id)` must be called by read/gameplay workflows before relying on current building state.

The canonical building start RPC is `start_estate_building_upgrade(...)`. It must evaluate assigned `building_upgrade_cost` and `building_upgrade_time` formulas in DB, spend `drachma/materials/workforce` through resource ledger helper, create the job and write audit. Angular must not compute authoritative cost/time or directly mutate resources/jobs.

`hero_resource_ledger` is a minimal resource movement ledger. It is not a player undo/refund feature.

---

## Vendor Scrap / Sell Decisions — 2026-05-01

Vendor/system scrap is not player trade. It uses drachmas, not Character Points.

The canonical RPC is `vendor_scrap_hero_item(...)`. Frontend must not compose `scrap_hero_item(...)` and resource changes manually.

---

## Trade / Auction Audit Decisions — 2026-05-01

Trade and auction lifecycle audit is DB-owned.

Frontend must use canonical trade/auction RPCs and must not add Angular `AuditWriter` calls for trade/auction lifecycle events.

DB-owned audit covers direct trade lifecycle, auction listing lifecycle, auction bid placement, completed trade/auction sale transactions, and the distinction between buy-now and normal auction close completion.

Audit is complementary to ledgers, transaction rows, item snapshots and anti-abuse signals. It does not replace them.

---

## Progression / Epic N Decisions — 2026-05-01

Stat allocation uses the existing DB/RPC workflow `save_stat_allocation(...)`.

Progression formulas are configurable and must not be hardcoded in Angular: `hero_stat_upgrade_cost`, `hero_stat_level_cap`, and `hero_experience_to_next_level`.

`critical_damage` is a runtime combat/derived stat. Current semantic base is 50%, plus active `critical_damage` bonuses. Final crit multiplier is derived from final critical damage percent, not hardcoded x2.

---

## Combat / Epic M Decisions — 2026-04-30

Combat is one reusable module, not multiple combat types. Exploration encounter combat, trial combat, PvP, sandbox and future systems provide combatants and interpret the result, but the core combat rules stay the same.

Combat receives combatants and produces a combat result. It does not decide rewards, trial completion, PvP consequences, cooldowns or public report publishing. The caller interprets the result.

Combat is limited by global product rule `combat_turn_limit`, currently defaulting to 10 full turns. One turn is a full round of eligible attack slots from both sides unless someone is defeated earlier. Draw occurs if no side is defeated before the turn limit.

Combat uses side names `initiator` and `defender`. Outcomes are `initiator_victory`, `defender_victory`, and `draw`.

Attack slots are ordered by formula target `combat_initiative_score`. Higher score acts earlier; exact ties are won by the initiating side.

Critical damage is a combat/derived value: base critical damage percent = 50 plus applicable `critical_damage` bonuses. `critMultiplier = 1 + finalCriticalDamagePercent / 100`. Hardcoded x2 crit multiplier is not target architecture.

Attack plan rules:

- no weapon = one unarmed attack;
- unarmed base damage range is `strength..strength`, plus applicable bonuses;
- one one-handed weapon with empty off-hand = weapon attack plus unarmed attack;
- one-handed weapon plus shield = one weapon attack; shield does not attack;
- dual wield = one attack from each weapon;
- two-handed = one attack unless item-native data says otherwise;
- ranged is two-handed and uses item-native `attack_count`.

Admin-defined opponents:

- one opponent belongs to one family;
- encounter/trial combat candidates may point to a concrete opponent or a family;
- candidate scaling formula and `difficulty_multiplier` let the same opponent/family scale differently in encounter and trial contexts;
- opponent equipment can be none, manual item-like blueprint, or generated item-like loadout materialized only for one fight;
- generated opponent equipment must not create normal player-owned `items` rows.

Combat result persistence should be relational and report-ready: result header, participant snapshots, participant stat snapshots, and one row per resolved attack.

---

## Admin IA / Epic R Direction — 2026-05-01

Epic R is not a final UI redesign. It is lightweight admin information architecture and layout hygiene.

Admin UI should be organized by work intent, not by raw table names.

Recommended groups:

- Overview;
- Global Governance;
- Game Balance;
- Server Operations;
- Moderation & Anti-abuse;
- Gameplay Tools / Sandbox.

Codex should prefer PrimeNG tabs / tabbed sections or clear sections for complex admin pages instead of one long vertical form. Final visual style, spacing, iconography and full design-system decisions remain in the UI/UX backlog.
