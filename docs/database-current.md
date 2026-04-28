<!-- HANDOFF_OVERRIDE_START -->
# Handoff override — 2026-04-27

This section is newer than the older body below. Use it as the current operational database/context override for the next conversation.


## Update 2026-04-28 — G4b config governance create RPCs

Config governance draft creation and draft value-entry creation are now DB/RPC workflows, not direct frontend table writes. This aligns creation with the existing D5 ready/apply/cancel RPC workflow and keeps config audit on the database side.

New frontend/domain RPC contracts:

- `create_config_change_set_draft(text, text, config_change_visibility, text, text)` → returns `config_change_sets`; creates a draft change set, sets `requested_by = auth.uid()`, validates through table constraints, checks `can_manage_config_governance(null)`, and writes best-effort audit through `try_write_config_change_set_audit(...)`.
- `create_config_value_change_entry(uuid, config_change_kind, uuid, jsonb, uuid, jsonb)` → returns `config_change_entries`; creates a `global_value_change` or `server_value_change` entry only while the change set is `draft`, computes old effective config value DB-side, sets `field_path = value_json`, stores lightweight metadata, and writes best-effort audit through `try_write_config_change_set_audit(...)`.

Audit dictionary additions for this workflow:

- `audit_action_types.key = config.change_set.created`
- `audit_action_types.key = config.change_set.entry_created`
- `audit_entity_types.key = config_change_set` must exist.

Rules:

- Frontend must call these RPCs instead of direct inserts into `config_change_sets` and `config_change_entries`.
- Frontend must not call `try_write_config_change_set_audit(...)`; it remains an internal helper.
- `create_config_value_change_entry(...)` supports only D4/D5 scalar/json value-entry flow: `scalar_config` / `json_config` definitions and value types `integer`, `decimal`, `boolean`, `string`, `json`.
- Relational `entity_field_change` creation/application remains a future dedicated workflow.
- After applying this migration, regenerate `database.types.ts` so the new RPCs are available to typed frontend services.

## Critical DB/application state

- Frontend has been cleaned of runtime references to `hero_derived`; only generated `database.types.ts` may mention it while the physical table exists.
- Do **not** add new dependencies on `hero_derived`.
- Runtime derived/special stats are resolved from active hero context, `hero_stats`, `derived_stat_definitions`, `bonus_types`, `bonus_scopes`, `bonus_targets`, `bonus_templates`, `entity_bonuses`, and formula assignments only where genuinely needed.
- The physical `hero_derived` table may still exist unless explicitly confirmed dropped. Treat it as deprecated DB legacy.
- If/when `hero_derived` is dropped, regenerate `database.types.ts`.

## Bonus system current truth

Current canonical bonus naming is **scope**, not context.

Use `bonus_scopes`, `scope_key`, `scope_key_override`, and `BonusScope` in frontend/domain code. Do not introduce new `BonusContext` terminology except as temporary legacy alias.

Central bonus foundation:
- `bonus_types`
- `bonus_scopes`
- `bonus_target_categories`
- `bonus_targets`
- extended `bonus_templates`
- `entity_bonuses`

Legacy/transitional bonus tables:
- `origin_bonuses`
- `building_bonuses`
- `item_bonuses`
- `item_generation_base_bonuses`
- `item_generation_affix_bonuses`

New code should use `entity_bonuses` as the central relation. Legacy tables may remain only for compatibility/migration.

Quality scaling:
- `entity_bonuses.quality_scales_value = true` means item quality multiplier scales `value`.
- `quality_scales_level_interval` must remain false.
- Quality never scales `level_interval`.
- No database-level rounding is applied.
- UI/admin preview should read active rows from `item_generation_qualities`; do not hardcode exactly three qualities.

## Derived stat definitions

`derived_stat_definitions` is the DB-backed semantic dictionary for runtime derived/special stats.

Seeded definitions:
- `health`
- `defense`
- `min_damage`
- `max_damage`
- `luck`
- `critical_chance`
- `evasion_chance`

Resolver semantics:
- `defense = endurance + active defense bonuses`.
- `luck = active luck bonuses`, base 0 unless explicitly changed later.
- `min_damage = strength + weapon/base min_damage + active min_damage bonuses + active damage bonuses`.
- `max_damage = strength + weapon/base max_damage + active max_damage bonuses + active damage bonuses`.
- `damage` target applies to both `min_damage` and `max_damage`.
- Resolver must ensure `max_damage >= min_damage`.
- `health` may use a base health formula/fallback, then active health bonuses.
- `critical_chance` and `evasion_chance` are additive bonus inputs for combat formulas, not necessarily whole final chances.

## Config governance status

Confirmed frontend tasks:
- D1 config definitions read model: accepted.
- D2 config values/effective values read model: accepted.
- D3 change-set list/detail read model: accepted.
- D4 draft edit flow: Codex reported fixes; next conversation should verify build/UI and user acceptance before marking completed.

D4 expected corrected behavior:
- create draft change set with mandatory title/reason,
- trim-required validation for title/reason,
- public changelog requires title/body after trim,
- add value change entries without applying config values,
- scalar editor supports only `integer`, `decimal`, `boolean`, `string`, `json`,
- `entity_ref`, `formula_ref`, `enum_ref` are unsupported/hidden in this simple editor,
- `global_value_change` / `server_value_change` must not send `entityType/entityId`,
- value changes must not set `oldScope/newScope`,
- selected server changes must refresh effective values,
- metadata includes `oldSource` / `oldSourceLabel` where available.

## Config change entries

For `global_value_change` / `server_value_change` use `config_definition_id`, `server_id` only for server changes, `field_path = value_json`, old/new value JSON, and lightweight metadata. Do **not** misuse `entity_id`.

For relational entity edits later, use `entity_field_change`, with `entity_type`, UUID `entity_id`, and `field_path`.

## Access helpers

Use canonical helpers when writing SQL/RPC:
- `has_global_role(text[])`
- `has_server_staff_role(uuid, server_staff_role[])`

Do not duplicate role logic by joining `roles` unless the helper layer is missing. If `is_admin()` exists or is needed, prefer it as a wrapper around `has_global_role(array['admin'])`.

`can_manage` is not the same as `can_use_as_sandbox`. Tester visibility is not management permission.

## Character Points

Character Points are stored on `hero.character_points` and `hero.total_character_points_earned`. Use `character_point_ledger` for persistent balance history. Do not put Character Points in `hero_resources` or `hero_derived`.

## Trade and auctions

DB/RPC foundation exists for direct trade, one-item auctions, CP locks, item locks, transactions, and anti-abuse signals/case grouping. Frontend gameplay surfaces are still pending.

Trade between players uses Character Points. Drachmas are vendor/system/building currency. Vendor scrap is not trade.

## Requirements/building caps

Central requirement foundation: `requirement_definitions`, `entity_requirements`.

Building availability: `buildings.district_code` is minimum district; available in that district and higher districts. `buildings.max_level = 0` means unlimited. `building_district_level_caps` stores overrides only; missing override falls back to `buildings.max_level`.

## Documentation rule

`database-current.md` should remain a curated semantic DB/RPC/helper registry. It is not a full dump, but it must include important helper functions, RPCs, legacy warnings and domain semantics.


## Verified live DB function/RPC inventory — 2026-04-27

This section is based on a direct live database inventory query against `pg_proc` in schema `public`.

Operational rule:
- Codex must not invent new RPC names, migrations, or database workflow functions when a needed DB contract is missing.
- If a needed function/RPC is not listed here and is not present in generated database types, the implementation task is blocked by missing database contract.
- New database RPCs are designed in the conceptual/database track first, then implemented through an approved migration, then documented here and regenerated into `database.types.ts`.

### Config governance functions currently present

Current config helper functions:
- `get_server_config_integer(uuid, text, integer)` → reads a server config value by config key with integer fallback.
- `get_server_config_boolean(uuid, text, boolean)` → reads a server config value by config key with boolean fallback.
- `get_current_global_effective_config_value_json(uuid)` → returns current effective global config value JSON for a config definition.
- `get_current_server_effective_config_value_json(uuid, uuid)` → returns current effective server config value JSON for a config definition/server pair.
- `config_json_values_match(jsonb, jsonb)` → null-safe JSONB equality helper used by config apply conflict checks.
- `server_config_value_source_for_scope(config_governance_scope)` → maps config governance scope to server config value source.
- `can_manage_config_governance(uuid)` → permission helper for config governance workflows.

Frontend/domain RPC contracts for config governance:
- `create_config_change_set_draft(text, text, config_change_visibility, text, text)` → returns `config_change_sets`; creates a draft change set, sets `requested_by = auth.uid()`, validates through table constraints, checks `can_manage_config_governance(null)`, and writes best-effort audit through `try_write_config_change_set_audit(...)`.
- `create_config_value_change_entry(uuid, config_change_kind, uuid, jsonb, uuid, jsonb)` → returns `config_change_entries`; creates a `global_value_change` or `server_value_change` entry only while the change set is `draft`, computes old effective config value DB-side, sets `field_path = value_json`, stores lightweight metadata, and writes best-effort audit through `try_write_config_change_set_audit(...)`.
- `mark_config_change_set_ready(uuid)` → returns `config_change_sets`; marks a draft config change set ready after DB-side validation.
- `apply_config_change_set(uuid)` → returns `config_change_sets`; atomically applies a ready config change set. Current D5 scope supports scalar/json `global_value_change` and `server_value_change` entries.
- `cancel_config_change_set(uuid, text)` → returns `config_change_sets`; cancels a draft/ready change set and requires explicit cancellation reason.

Internal config governance helper functions:
- `validate_config_change_set_entries_for_d5(uuid)` → validates D5-supported entries before ready/apply.
- `apply_global_config_value_change_entry(config_change_entries, uuid)` → internal helper used by `apply_config_change_set(...)`.
- `apply_server_config_value_change_entry(config_change_entries, uuid)` → internal helper used by `apply_config_change_set(...)`.
- `try_write_config_change_set_audit(...)` → internal/best-effort audit helper. Frontend must not call this helper directly.

Config governance operational rules:
- Frontend must call `create_config_change_set_draft(...)` instead of direct inserts into `config_change_sets`.
- Frontend must call `create_config_value_change_entry(...)` instead of direct inserts into `config_change_entries` for governed scalar/json value entries.
- Frontend must call ready/apply/cancel workflow RPCs instead of direct status updates.
- Frontend must not call `try_write_config_change_set_audit(...)`; audit for config governance workflow is DB-side.
- `create_config_value_change_entry(...)` supports only D4/D5 scalar/json value-entry flow: `scalar_config` / `json_config` definitions and value types `integer`, `decimal`, `boolean`, `string`, `json`.
- Relational `entity_field_change` creation/application remains a future dedicated workflow. Do not invent generic relational apply logic in frontend.

### Access / identity helpers

- `has_global_role(text[])` → checks current authenticated user's global role keys.
- `user_has_global_role(uuid, text[])` → checks a specific user's global role keys.
- `has_server_staff_role(uuid, server_staff_role[])` → checks current authenticated user's staff role on a server.
- `can_read_hero(uuid)` → hero read helper.
- `can_manage_hero(uuid)` → hero management helper.
- `estate_matches_hero_server(uuid, uuid)` → validates estate/hero server relationship.
- `is_admin()` → legacy/compatibility helper using older role naming; prefer `has_global_role(array['admin'])` in new SQL/RPC.

### Character Points helpers / operations

- `get_hero_active_character_point_locks(uuid)` → active CP lock sum for hero.
- `get_hero_available_character_points(uuid)` → spendable CP after active locks.
- `apply_character_points_delta(uuid, integer, character_point_ledger_reason, text, uuid, text, uuid)` → applies CP delta and writes `character_point_ledger`.
- `create_character_point_lock_for_trade(uuid, uuid, integer, uuid, text)` → creates CP lock for direct trade.
- `create_character_point_lock_for_auction_bid(uuid, uuid, integer, uuid, uuid, text)` → creates CP lock for auction bid.
- `create_character_point_lock_for_auction_buy_now(uuid, uuid, integer, uuid, text)` → creates CP lock for auction buy-now.

### Player direct trade RPC / operations

- `create_player_direct_trade_offer(uuid, uuid, integer, uuid[], text)` → creates direct trade offer and locks creator-side CP/items.
- `respond_player_direct_trade_offer(uuid, integer, uuid[], text)` → target response to direct trade offer.
- `confirm_player_direct_trade_offer(uuid, text)` → creator confirmation and transactional completion.
- `cancel_player_direct_trade_offer(uuid, text)` → cancels pending direct trade offer.
- `reject_player_direct_trade_offer(uuid, text)` → rejects pending direct trade offer.
- `release_trade_offer_character_point_locks(uuid, text)` → releases active CP locks for trade offer.
- `unlock_trade_offer_items(uuid)` → unlocks trade-locked items for offer.

### Player auction RPC / operations

- `create_player_auction_listing(uuid, uuid, player_auction_mode, integer, integer, text)` → creates one-item auction listing and locks item.
- `place_player_auction_bid(uuid, uuid, integer)` → places auction bid and locks bidder CP.
- `buy_now_player_auction(uuid, uuid, text)` → completes buy-now purchase.
- `close_player_auction_listing(uuid, text)` → closes ended auction, expires if no bids or completes sale.
- `cancel_player_auction_listing(uuid, text)` → cancels active auction where allowed.
- `finalize_player_auction_sale(uuid, uuid, integer, text, text, uuid)` → final auction transfer operation.
- `release_auction_character_point_locks(uuid, text)` → releases active auction CP locks.
- `unlock_auction_item(uuid)` → unlocks auction-locked item.

### Trade slot / availability helpers

- `get_hero_active_trade_slot_count(uuid)` → active direct-trade + auction slot count.
- `get_hero_trade_slot_limit(uuid)` → current trade slot limit; transitional fallback uses server config `trade_active_offer_limit_fallback`.
- `hero_has_free_trade_slot(uuid)` → checks if hero has a free active trade slot.
- `hero_can_use_player_trade(uuid)` → checks whether hero can use player trade/auctions; transitional fallback uses trade slot config.

### Anti-abuse RPC / operations

- `create_player_abuse_report(uuid, text, text, text, uuid, uuid, uuid, uuid, text)` → creates player abuse report and linked case.
- `create_or_link_anti_abuse_case_for_signal(uuid)` → creates or links case for signal grouping key.
- `add_anti_abuse_case_participant_if_missing(uuid, uuid, uuid, text, text, text, uuid)` → idempotent case participant insert.
- `refresh_anti_abuse_case_signal_stats(uuid)` → refreshes case signal count and last signal timestamp.
- `generate_trade_transaction_anti_abuse_signals(uuid)` → generates trade/auction-related anti-abuse signals from completed transaction.
- `insert_trade_transaction_anti_abuse_signal(uuid, text, text, text, text, uuid, uuid, text, integer, numeric, jsonb)` → inserts anti-abuse signal for trade transaction.
- `build_anti_abuse_hero_pair_grouping_key(uuid, uuid, uuid)` → deterministic same-pair grouping key.

### Audit RPC / operations

- `write_audit_log(text, text, uuid, uuid, uuid, uuid, uuid, audit_severity, text, jsonb, jsonb, jsonb, text)` → writes audit log after validating dictionary keys and actor constraints.

Audit note:
- Existing audit foundation is present.
- Config governance apply/cancel audit integration is not yet implemented as a dedicated workflow.

### Building / district helpers

- `is_building_available_in_district(uuid, text)` → checks district availability by comparing district ranks.
- `get_building_max_level_for_district(uuid, text)` → resolves district-specific cap override with fallback to `buildings.max_level`.

### Trigger / validation functions

These are not frontend RPC contracts. They are database trigger helpers and validation functions:

- `rls_auto_enable()`
- `audit_dictionary_change()`
- `audit_set_updated_at()`
- `prevent_audit_dictionary_key_update()`
- `prevent_dictionary_key_update()`
- `set_anti_abuse_dictionary_updated_at()`
- `set_anti_abuse_sanction_updated_at()`
- `set_anti_abuse_updated_at()`
- `set_items_updated_at()`
- `set_player_relationship_updated_at()`
- `anti_abuse_case_signal_stats_trigger()`
- `trigger_create_or_link_anti_abuse_case_for_signal()`
- `trigger_generate_trade_transaction_anti_abuse_signals()`
- `enforce_hero_server_policy()`
- `enforce_item_server_matches_hero()`
- `enforce_character_point_ledger_server()`
- `enforce_character_point_lock_server()`
- `enforce_building_district_cap_is_available()`
- `enforce_player_trade_offer_server()`
- `enforce_player_trade_offer_item_valid()`
- `enforce_player_auction_listing_valid()`
- `enforce_player_auction_bid_valid()`
- `validate_anti_abuse_sanction()`
- `validate_anti_abuse_sanction_item()`
- `validate_character_point_penalty()`

Documentation debt:
- Most live DB functions currently have no `COMMENT ON FUNCTION` descriptions.
- Add comments for critical RPCs in future migrations so function inventory can become self-documenting.

<!-- HANDOFF_OVERRIDE_END -->

# Mythborne — Database Current Notes

Updated: 2026-04-27

This file is the curated semantic index of the current database state.

It is not a full `pg_dump`, but it must contain the important tables, enums, helper functions, RPCs, legacy warnings, and gameplay/database semantics that Codex needs without rediscovering everything from scratch.

If this file conflicts with the actual database or generated `database.types.ts`, prefer the actual database/generated types and update this file.

## Source-of-truth order

For schema-sensitive implementation, use this order:

1. current live database / generated `database.types.ts`
2. current migrations / SQL that have been applied
3. this file as the semantic index
4. `current-decisions.md`
5. `project-context.md`
6. `codex-mythborne-backlog.md`
7. `current-state-summary.md` and `current-todo.md` only as Codex progress/status files

Important: `current-state-summary.md`, `current-todo.md`, and task statuses in the backlog are owned by Codex/user-confirmed implementation progress. Do not use them as the main schema source.

---

# General database rules

- PostgreSQL / Supabase.
- Prefer relational modeling over hidden JSON blobs.
- Prefer explicit constraints, dictionary tables, helper text, descriptions, and status reasons.
- Do not duplicate role/access logic if canonical helper functions exist.
- Critical gameplay/economy mutations should go through RPC/domain operations, not direct frontend table writes.
- Preserve `reason`, `description`, `status_reason`, `helper_text`, and `admin_description` wherever applicable.
- Metadata JSON should be lightweight and contextual, not a place to hide core fields.
- Legacy/transitional tables and fields may remain for compatibility, but new systems should use the current central models.

---

# Canonical stats

Base stats come from the `stats` table and should be treated as canonical.

Current canonical base stat keys:

- `strength`
- `dexterity`
- `endurance`
- `agility`
- `cunning`
- `charisma`
- `wisdom`
- `intelligence`
- `spirituality`

Do not hardcode old stat lists from outdated concept docs.

## `hero_stats`

Purpose:

- stores base stat values for a hero.

Important semantics:

- keyed by hero and stat key;
- should align with the canonical `stats` table;
- stat allocation should spend Character Points through proper domain/RPC flow, not direct UI balance mutation.

---

# Hero, account, server and identity model

## `hero`

Current hero identity model:

- `hero.id` is the character id.
- `hero.user_id` is the owning account id.
- `hero.server_id` is the server/world id.
- Do not assume `hero.id = auth.uid()`.

Current important columns include:

- `id`
- `name`
- `level`
- `origin_id`
- `rank`
- `experience`
- `profile_picture`
- `created_at`
- `estate_id`
- `user_id`
- `server_id`
- `character_points`
- `total_character_points_earned`

Important constraints:

- `character_points >= 0`
- `total_character_points_earned >= 0`
- hero names are server-scoped.

## Hero loading rule

Any hero-owned query should resolve:

1. current authenticated user;
2. selected/current server;
3. active hero on that server;
4. then use `hero.id` for hero-owned tables.

Do not use `auth.uid()` as `hero_id`.

## Character creation / onboarding warning

Old onboarding code/RLS may still assume `hero.id = auth.uid()`.

Before fully relying on multiple heroes per account or sandbox multi-hero flows, audit and fix:

- character creation using user id as hero id;
- onboarding RLS comparing `hero.id` or `hero_id` directly to `auth.uid()`;
- estate/stat/resource creation using account id as hero id.

---

# Server/world access and staff access

## Core tables

Important server/access tables include:

- `game_servers`
- `server_memberships`
- `server_staff_assignments`

Known conceptual columns:

`game_servers`:

- `id`
- `key`
- `name`
- `kind`
- `status`
- `description`
- `launched_at`
- `archived_at`

Enums include:

- `game_server_kind`
- `game_server_status`
- `server_membership_status`
- `server_staff_role`

## Canonical access helpers

Current DB/RLS logic uses helper functions for role/staff checks. New SQL/RPC should use these instead of duplicating role joins.

Known helper functions:

- `has_global_role(text[])`
- `has_server_staff_role(uuid, server_staff_role[])`

`is_admin()` may exist as a compatibility wrapper. If it exists or is needed, prefer implementing it as:

```sql
select public.has_global_role(array['admin']);
```

Do not create a second independent standard for checking admin/operator/tester roles by manually joining `roles`, unless the helper layer is missing.

## Role table caveat

Older schema snapshots used `roles.name`.

Some newer code may expect `roles.key`.

Before referencing either column directly, inspect the current generated types/schema. Prefer `has_global_role(...)` where possible.

## Access semantics

`can_manage` and `can_use_as_sandbox` are different concepts.

Recommended meaning:

- `can_manage`:
  - global admin;
  - or server staff role in `owner`, `operator`, `moderator`.
- `can_use_as_sandbox`:
  - sandbox server;
  - and global role in `admin`, `operator`, `tester`;
  - or assigned server staff role on that sandbox, including tester where appropriate.

Tester visibility is not automatically management permission.

## Server switcher / accessible servers

For staff server switcher and accessible server RPCs:

- admin can see all relevant servers;
- normal authenticated players can see standard scheduled/live servers where appropriate;
- assigned server staff can see their assigned servers;
- operator/tester can see sandbox/testing according to global role policy;
- returned rows should distinguish membership status, staff role, manage permission, and sandbox-use permission.

If `get_accessible_game_servers()` is created/updated, it should use `has_global_role(...)` and `has_server_staff_role(...)` where possible.

---

# Character Points

## `hero.character_points`

Character Points are the canonical spendable/progression currency.

Rules:

- stored on `hero.character_points`;
- lifetime baseline stored on `hero.total_character_points_earned`;
- earned alongside experience unless a later explicit rule overrides it;
- used for stat allocation, trade, auctions, fines/sanctions, and future economy sinks;
- not stored in `hero_resources`;
- not stored in `hero_derived`.

## `character_point_ledger`

Append-only history of Character Point balance changes.

Important fields:

- `server_id`
- `hero_id`
- `amount_delta`
- `balance_after`
- `reason`
- `related_entity_type`
- `related_entity_id`
- `description`
- `created_by`
- `created_at`

Ledger is separate from audit logs.

Audit describes important domain/admin actions.
Ledger explains Character Point balance movement.

## Character Point helper/RPC functions

Known important helpers include:

- `get_hero_active_character_point_locks(hero_id)`
- `get_hero_available_character_points(hero_id)`
- `apply_character_points_delta(...)`

Rules:

- use domain/RPC operations for persistent Character Point changes;
- do not update `hero.character_points` directly from UI click handlers;
- do not write CP ledger rows directly from generic UI components;
- final stat allocation save, trade, auction, fines/penalties should use domain/RPC paths.

---

# Hero resources

## `hero_resources`

Purpose:

- stores regular resources, not Character Points.

Current core resources:

- `drachma`
- `materials`
- `workforce`

Rules:

- drachmas are system/vendor/building economy resource;
- materials and workforce support construction/economy;
- Character Points are not a `hero_resources` row;
- vendor scrap gives drachmas, not Character Points.

---

# Derived stats

## `hero_derived`

`hero_derived` is transitional/legacy.

`hero_derived.hp` has been removed.

`hero_derived.health` remains combat Health while the transition is ongoing.

Remaining values such as defense, damage range, luck, critical, evasion may still be read by existing screens, but new systems should not treat `hero_derived` as authoritative source of truth.

Current direction:

- derived values should be calculated from base stats, equipment, bonuses, formulas and context;
- frontend may calculate previews;
- backend/RPC/domain actions should calculate authoritative runtime values;
- combat/trials/reports should store snapshots of values used at the time.

Do not add new persistent dependencies on `hero_derived`.

---

# Items and item lifecycle

## `items`

Current item model supports ownership and lifecycle.

Important fields include:

- `id`
- `server_id`
- `hero_id`
- `name`
- `description`
- `created_at`
- `status`
- `scrapped_at`
- `recoverable_until`
- `updated_at`

Current `item_status` values:

- `active`
- `scrapped`
- `locked_trade`
- `locked_auction`

Rules:

- player-to-player trade and auctions do not copy item rows;
- item ownership changes by updating `items.hero_id`;
- direct trade locks items as `locked_trade`;
- auctions lock listed item as `locked_auction`;
- normal player inventory/armory should hide or disable locked/scrapped items;
- staff/admin views may need access to scrapped/recoverable items for anti-abuse/case resolution.

## Scrapping

Vendor scrap is not player trade.

Rules:

- vendor scrap gives drachmas;
- vendor scrap does not use Character Points;
- trivial/no-affix items may be permanently removed;
- affix-bearing or important items should become `scrapped` and recoverable for a retention window;
- `scrapped_at` and `recoverable_until` identify recovery lifecycle.

---

# Item generation

Current item generation layers:

- quality;
- optional prefix;
- base item;
- optional suffix.

Important tables:

- `item_generation_bases`
- `item_generation_affixes`
- `item_generation_qualities`
- `item_generation_bucket_profiles`
- legacy item generation bonus join tables, now mirrored into `entity_bonuses`

## Item qualities

`item_generation_qualities` stores quality definitions.

Important fields:

- `key`
- `label`
- `multiplier`
- `weight`
- `sort_order`
- `is_enabled`

Rules:

- frontend/admin preview should not hardcode exactly three qualities;
- preview should read active qualities from `item_generation_qualities`;
- quality multiplier scales generated item bonus values where `entity_bonuses.quality_scales_value = true`;
- quality does not scale `level_interval`;
- real runtime/resolver and frontend preview must use the same quality data.

Current conceptual examples:

- normal × 1.0
- quality × 1.5
- outstanding × 2.0

Future qualities may be added without code hardcoding.

---

# Bonus system

## Current direction

The old bonus system was based on `bonus_templates.target`, `bonus_templates.type`, and separate source-specific join tables.

The current refactor introduces dictionary-driven bonus semantics and central `entity_bonuses`.

## Dictionary tables

Current bonus dictionaries:

- `bonus_types`
- `bonus_contexts`
- `bonus_target_categories`
- `bonus_targets`

## Extended `bonus_templates`

`bonus_templates` now keeps legacy columns and also has new semantic columns.

Legacy columns:

- `target`
- `type`
- `description`

New semantic columns include:

- `key`
- `label`
- `type_key`
- `target_key`
- `context_key`
- `level_interval`
- `formula_id`
- `formula_target_id`
- `scaling_stat_key`
- `params_json`
- `is_active`
- `sort_order`
- `updated_at`

Legacy mappings:

- `def` → `defense`
- `minDmg` → `min_damage`
- `maxDmg` → `max_damage`
- `critical` → `critical_chance`
- `evasion` → `evasion_chance`
- `per_4_levels` → `per_levels` with `level_interval = 4`

## `entity_bonuses`

Central table for attaching bonus instances to any supported entity.

Important fields:

- `entity_type`
- `entity_id`
- `bonus_template_id`
- `value`
- `level_interval_override`
- `formula_id_override`
- `formula_target_id_override`
- `scaling_stat_key_override`
- `context_key_override`
- `quality_scales_value`
- `quality_scales_level_interval`
- `params_json`
- `is_active`
- `description`
- `sort_order`
- `legacy_source_table`
- `legacy_source_id`

Current migrated entity types:

- `origin`
- `item_generation_base`
- `item_generation_affix`

Existing legacy rows from these tables were backfilled:

- `origin_bonuses`
- `item_generation_base_bonuses`
- `item_generation_affix_bonuses`

`building_bonuses` and `item_bonuses` were structurally supported but had no current data at the time of backfill.

## Legacy bonus tables

Legacy/transitional:

- `origin_bonuses`
- `building_bonuses`
- `item_bonuses`
- `item_generation_base_bonuses`
- `item_generation_affix_bonuses`

These should not be expanded as the main future model. New systems should read/write through `bonus_templates` + `entity_bonuses`.

## Quality scaling rules for item bonuses

Quality scaling is instance/source-specific and stored on `entity_bonuses`.

Rules:

- origin bonuses: `quality_scales_value = false`;
- item generation base bonuses: `quality_scales_value = true`;
- item generation affix bonuses: `quality_scales_value = true`;
- `quality_scales_level_interval` must remain false;
- quality scaling multiplies `value`;
- quality scaling never multiplies `level_interval`.

Preview rule:

```text
scaled_value = entity_bonuses.value * item_generation_qualities.multiplier
```

No database-level rounding is applied.

Runtime/resolver decides how to project decimals:

- integer stats may round/floor/ceil according to resolver rules;
- percent/chance values may remain decimal;
- requirement reductions may remain decimal until the final comparison.

Admin UI should show raw decimal preview and, where useful, projected integer preview by target/resolver rule.

## Bonus types

Known seeded bonus types include:

- `flat`
- `percent`
- `per_levels`
- `formula_bonus`
- `scaled_stat_bonus`
- `resource_flat`
- `resource_percent`
- `capacity_flat`
- `unlock_feature`
- `requirement_flat_reduction`
- `requirement_percent_reduction`

## Bonus contexts

Known seeded bonus contexts include:

- `global`
- `combat`
- `pvp_attack`
- `pvp_defense`
- `exploration`
- `trial`
- `economy`
- `resource_production`
- `building_management`
- `trade`
- `auction`
- `requirements`
- `item_equip`

## Bonus target categories

Known seeded categories include:

- `base_stat`
- `derived_stat`
- `combat`
- `resource_production`
- `capacity`
- `feature`
- `requirement`
- `economy`

## Bonus targets

Known seeded targets include:

Base stats:

- `strength`
- `dexterity`
- `endurance`
- `agility`
- `cunning`
- `charisma`
- `wisdom`
- `intelligence`
- `spirituality`

Derived / combat:

- `health`
- `defense`
- `min_damage`
- `max_damage`
- `damage`
- `luck`
- `critical_chance`
- `evasion_chance`

Resource/production:

- `drachmas_production`
- `materials_production`
- `workforce_production`
- `all_resource_production`

Capacity:

- `max_active_trade_offers`
- `visible_item_capacity`

Feature:

- `player_trade`
- `player_auction`

Requirement:

- `all_requirements`
- `item_requirements`
- `building_requirements`
- `hero_level_requirements`
- `hero_stat_requirements`
- `wisdom_requirements`
- `prestige_rank_requirements`

## Formula-based bonus rules

Formula-based bonuses should reference real formula rows, not hardcoded expression text.

Use:

- `bonus_templates.formula_id` / `entity_bonuses.formula_id_override`
- optionally `bonus_templates.formula_target_id` / `entity_bonuses.formula_target_id_override`

Building bonuses such as:

- Barracks: Health in PvP attack from building level × selected stat;
- Fortress: Health in PvP defense from building level × selected stat;

should be modeled as formula/scaled bonuses, not hardcoded exceptions.

---

# Requirements system

## Tables

Central requirements foundation:

- `requirement_definitions`
- `entity_requirements`

Enums:

- `requirement_value_type`
- `requirement_entity_type`

Current seeded requirement definitions:

- `hero_level`
- `prestige_rank`
- `hero_stat`
- `building_level`
- `resource_amount`
- `district_access`
- `trade_routes_access`

Rules:

- requirements are not costs;
- requirements are not bonuses;
- new systems should not add fresh requirement JSON fields;
- `building_requirements` is legacy/transitional;
- `buildings.requirements` JSONB is legacy/transitional.

Existing legacy building requirements were migrated additively into `entity_requirements` where possible.

`buildings.rank_required > 1` was migrated additively into `entity_requirements` as `prestige_rank`, but the old column remains transitional for compatibility.

## Requirement modifier bonuses

Requirement modifiers are bonuses, not requirements.

Examples:

- `requirement_percent_reduction` targeting `item_requirements`;
- `requirement_percent_reduction` targeting `all_requirements`;
- `requirement_flat_reduction` targeting `wisdom_requirements`.

A bonus reducing requirements works while the bonus source is active, e.g. an equipped item. It does not reduce the source item’s own requirement retroactively unless a future explicit rule says so.

---

# Buildings, estates and districts

## `buildings`

Important fields:

- `key`
- `name`
- `description`
- `district_code`
- `rank_required`
- `base_cost`
- `base_build_time_minutes`
- `max_level`
- `requirements`
- `sort_order`
- `image_path`

Important semantics:

- `district_code` is the minimum district where the building can be built;
- building is available in that district and every higher district;
- `rank_required` is legacy/transitional and should not be the primary availability rule;
- prestige/rank gates should use central `entity_requirements`;
- `requirements` JSONB is legacy/transitional;
- `max_level = 0` means unlimited global/default cap.

## `building_district_level_caps`

Stores district-specific max-level overrides for buildings.

Rules:

- `buildings.max_level` = global/default cap;
- `0` means unlimited;
- `building_district_level_caps` stores overrides only;
- missing override means fallback to `buildings.max_level`;
- do not generate full building × district matrix unless each row is a real override;
- cap override cannot be below building minimum district.

## Building helper functions

Known helper functions:

- `get_building_max_level_for_district(building_id, district_code)`
- `is_building_available_in_district(building_id, district_code)`

Use these or equivalent logic when checking building availability / effective max level.

## Estates

Rules:

- occupied estates are rows;
- do not pre-create all empty estates;
- address availability can be derived from district capacity plus occupied estate rows;
- relocation to a new empty estate should be operationally simple but strategically expensive;
- relocation can delete/abandon old estate/building state;
- siege takeover will later swap addresses/estates according to combat/siege rules.

---

# Formula governance

Important formula tables include:

- `balance_formula_targets`
- `balance_formulas`
- `balance_formula_assignments`
- `balance_formula_blocks`
- `entity_formula_assignments`

Important rules:

- formula targets define allowed variables;
- formulas should be validated against target variables/functions;
- local entity formula assignment should override global/default where applicable;
- building-specific formula overrides use `entity_formula_assignments`;
- do not replace relational formula system with generic JSON.

Formula-related runtime should follow:

1. local entity assignment;
2. global/default assignment;
3. explicit fallback/error.

---

# Config governance

Important config tables include:

- `config_definitions`
- `global_config_values`
- `server_config_values`
- `config_change_sets`
- `config_change_entries`

Important enums include:

- `config_governance_scope`
- `config_managed_entity_type`
- `config_value_status`
- `config_value_type`
- `server_config_value_source`

Known helper functions:

- `get_server_config_integer(server_id, config_key, fallback)`
- `get_server_config_boolean(server_id, config_key, fallback)`

Config values should not be hardcoded where server/product balance says they are governed.

Config change sets preserve:

- title;
- reason;
- status;
- changelog visibility;
- requested/applied/cancelled user;
- timestamps.

## Config-managed entities added by recent foundations

Known managed entity types/definitions include:

Requirements/building caps:

- `requirement_definition`
- `entity_requirement`
- `building_district_level_cap`

Bonus system:

- bonus dictionaries and `entity_bonuses` should be registered/managed through config governance in the next bonus stage.

Anti-abuse configs exist for trade/abuse thresholds and should be server-specific where defined.

---

# Direct trade

## Core tables

Direct trade foundation uses:

- `player_trade_offers`
- `player_trade_offer_items`
- `player_trade_transactions`
- `player_trade_transaction_items`
- `character_point_locks`

## Direct trade rules

- private between two heroes;
- server-scoped;
- both heroes must be on same server;
- both sides must be able to use player trade;
- each side only selects their own items;
- no access to another hero’s private inventory;
- each side must offer item(s) and/or Character Points;
- CP-only-for-CP-only exchange is blocked at finalization;
- offered CP is locked with `character_point_locks`;
- offered items are locked as `locked_trade`;
- cancel/reject/expiry releases CP locks and returns items to `active`;
- finalization is transactional.

## Direct trade RPC/functions

Known important functions:

- `create_player_direct_trade_offer(...)`
- `respond_player_direct_trade_offer(...)`
- `cancel_player_direct_trade_offer(...)`
- `reject_player_direct_trade_offer(...)`
- `confirm_player_direct_trade_offer(...)`

Trade-slot helper functions include:

- `hero_can_use_player_trade(hero_id)`
- `hero_has_free_trade_slot(hero_id)`
- `get_hero_trade_slot_limit(hero_id)`
- `get_hero_active_trade_slot_count(hero_id)`

`trade_active_offer_limit_fallback` is temporary until Trade Routes/building bonus runtime is connected.

---

# Auctions

## Core tables

Auction foundation uses:

- `player_auction_listings`
- `player_auction_bids`
- `character_point_locks`
- `player_trade_transactions` with `transaction_type = auction_sale`
- `player_trade_transaction_items`

## Auction rules

- public server-scoped listing;
- exactly one item per auction;
- no bundle/set auction support for now;
- allowed modes:
  - bidding,
  - buy now,
  - bidding with buy now;
- auction duration is server-configured, not player-selected;
- listed item is locked as `locked_auction`;
- bids lock Character Points;
- outbid bids release prior CP lock;
- buy now completes immediately;
- seller can cancel only before any bid exists;
- auction without bids after `ends_at` becomes `expired` and item returns to `active`;
- auction with winning bid completes into a trade transaction and CP ledger rows.

## Auction RPC/functions

Known important functions:

- `create_player_auction_listing(...)`
- `place_player_auction_bid(...)`
- `buy_now_player_auction(...)`
- `cancel_player_auction_listing(...)`
- `close_player_auction_listing(...)`

Internal/helper functions created for auction runtime include:

- `create_character_point_lock_for_auction_bid(...)`
- `create_character_point_lock_for_auction_buy_now(...)`
- `release_auction_character_point_locks(...)`
- `unlock_auction_item(...)`
- `finalize_player_auction_sale(...)`

Frontend should use public RPCs, not internal helpers.

---

# Trade / auction configs

Server config keys added for trade/auction runtime:

- `trade_direct_offer_expiration_hours`
- `trade_max_items_per_direct_offer`
- `auction_duration_hours`
- `auction_min_bid_increment_character_points`
- `trade_active_offer_limit_fallback`

`trade_active_offer_limit_fallback` is temporary.

Final active trade/auction slot limit should come from Trade Routes/building bonus runtime.

Direct trade offers and active auctions currently share the active-offer slot pool unless a later explicit config changes that.

---

# Anti-abuse foundation

## Core tables

Important anti-abuse tables include:

- `anti_abuse_signal_types`
- `anti_abuse_signals`
- `anti_abuse_cases`
- `anti_abuse_case_signals`
- `anti_abuse_case_participants`
- `anti_abuse_case_declarations`
- `anti_abuse_case_audit_logs`
- `anti_abuse_sanction_types`
- `anti_abuse_sanctions`
- `anti_abuse_sanction_items`
- `character_point_penalties`
- `player_relationship_declaration_types`
- `player_relationship_declarations`
- `player_relationship_declaration_participants`
- `player_relationship_declaration_items`
- `player_relationship_declaration_trades`
- `player_abuse_report_types`
- `player_abuse_reports`

## Signal types currently implemented

- `trade.high_cp_direct_trade`
- `auction.high_cp_sale`
- `trade.repeated_pair_transfers`

## Anti-abuse rules

- anti-abuse signals/cases are review aids, not automatic guilt;
- sanctions are not automatically applied by detection;
- signals use lightweight `metadata_json`;
- signals use `grouping_key` for case grouping;
- automatic case creation is controlled by `anti_abuse_auto_case_creation_enabled`;
- active cases are grouped by `server_id + grouping_key`;
- active statuses for grouping:
  - `open`
  - `in_review`
  - `waiting_for_player`
- `resolved` and `cancelled` cases are historical and are not reopened automatically;
- a new signal after resolved/cancelled creates a new case if auto-case is enabled;
- signal actor/target are added as participants.

## Case enums

Known case statuses:

- `open`
- `in_review`
- `waiting_for_player`
- `resolved`
- `cancelled`

Known verdicts:

- `no_abuse`
- `insufficient_evidence`
- `abuse_confirmed`
- `resolved_by_voluntary_return`

Known sources:

- `system_signal`
- `player_report`
- `manual`

## Anti-abuse functions

Known signal/case helper functions include:

- `build_anti_abuse_hero_pair_grouping_key(server_id, hero_a, hero_b)`
- `generate_trade_transaction_anti_abuse_signals(transaction_id)`
- `insert_trade_transaction_anti_abuse_signal(...)` internal/helper
- `trigger_generate_trade_transaction_anti_abuse_signals()` trigger function
- `create_or_link_anti_abuse_case_for_signal(signal_id)`
- `trigger_create_or_link_anti_abuse_case_for_signal()` trigger function
- `refresh_anti_abuse_case_signal_stats(case_id)` internal/helper
- `add_anti_abuse_case_participant_if_missing(...)` internal/helper

Player report/declaration functions created earlier include:

- `create_player_abuse_report(...)` if present in generated types/schema;
- declaration/report creation should prefer RPC where available.

Codex must inspect current generated DB types for exact signatures before calling.

## Sanctions and CP penalties

Sanctions are separate records linked to cases.

A case can have multiple sanctions.

Sanction status should track lifecycle such as:

- pending;
- applied;
- completed;
- cancelled;
- forgiven;
- failed.

CP fines should use `character_point_penalties`.

Do not hide core sanction data in metadata JSON.

---

# Player relationship declarations and abuse reports

## Relationship declarations

Used to provide context for anti-abuse review.

Examples:

- shared IP;
- loan;
- group purchase;
- shared item pool;
- item lending;
- group settlement.

Declaration types are dictionary/config-driven, not hardcoded.

Declaration does not disable anti-abuse. It provides context for case review.

## Abuse reports

Player abuse reports create or link cases.

Report types are dictionary/config-driven.

Examples:

- scam;
- stolen item;
- unreturned loan;
- suspicious trade;
- multi-accounting;
- harassment;
- other.

Report status/reason should be visible to relevant players where allowed.

---

# Audit foundation

Important tables include:

- `audit_action_types`
- `audit_entity_types`
- `audit_logs`

Audit is for important domain/admin actions, not every UI click.

Good audit targets:

- config changes;
- anti-abuse case decisions;
- sanctions;
- stat allocation final save;
- major item operations;
- trade/auction operations;
- estate/building irreversible changes.

Audit metadata should be lightweight and should not replace event/report snapshots.

---

# Reports and snapshots

Reports are not audit logs.

Future report/snapshot system should support:

- trial reports;
- encounter reports;
- PvP combat reports;
- siege reports.

Rule:

- public report reproduces the event view using historical snapshot data;
- it must not recalculate from current live state;
- tooltips in public reports use snapshot values;
- public reports must not expose private account data.

---

# Notifications

Notification module is future work, but domain operations should preserve enough data to emit notifications later.

Important future notification events:

- declaration accepted/rejected/revoked/expired;
- report linked/dismissed/resolved;
- case status/verdict involving player;
- sanction status changes;
- item confiscation/return;
- CP fine/debt changes;
- trade/auction state changes where relevant.

Notifications should include relevant reason/status reason.

---

# Legacy / transitional warnings

## Hero identity

Legacy assumption:

- `hero.id = auth.uid()`

Current rule:

- `hero.user_id = auth.uid()`;
- `hero.id` is character id;
- `hero.server_id` selects server/world.

## `hero_derived`

Legacy/transitional.

Do not add new dependencies.

## `bonus_templates` old shape

Legacy columns remain:

- `target`
- `type`

Current code should migrate toward:

- `type_key`
- `target_key`
- `context_key`
- `entity_bonuses`

## Old bonus relation tables

Legacy/transitional:

- `origin_bonuses`
- `building_bonuses`
- `item_bonuses`
- `item_generation_base_bonuses`
- `item_generation_affix_bonuses`

Use `entity_bonuses` for the central future model.

## Old requirements tables/fields

Legacy/transitional:

- `building_requirements`
- `buildings.requirements`
- `buildings.rank_required`

Use central `entity_requirements`.

## Trade active slot fallback

`trade_active_offer_limit_fallback` is temporary.

Use Trade Routes/building bonus runtime when implemented.

## Vendor scrap

Vendor scrap is not trade.

Vendor scrap gives drachmas and does not use Character Points.

---

# Current completed database/runtime foundations

The following foundations were designed and rollback-tested in SQL editor:

- item ownership / lifecycle foundation;
- Character Points balance and ledger foundation;
- direct trade schema and RPC runtime;
- auction schema and RPC runtime;
- trade/auction anti-abuse signal generation;
- automatic anti-abuse case grouping;
- requirements foundation and building district cap overrides;
- bonus dictionary/entity bonus foundation and legacy bonus backfill.

Codex must regenerate database types after schema changes before implementing affected frontend/domain code.
