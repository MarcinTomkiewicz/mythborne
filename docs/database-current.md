# Mythborne — Database Current Notes

Updated: 2026-04-28

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
- `scope_key`
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
- `scope_key_override`
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

## Bonus scopes

Known seeded bonus scopes include:

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


## Config governance RPC/functions

Current config helper functions:

- `get_server_config_integer(uuid, text, integer)` → reads a server config value by config key with integer fallback.
- `get_server_config_boolean(uuid, text, boolean)` → reads a server config value by config key with boolean fallback.
- `get_current_global_effective_config_value_json(uuid)` → returns current effective global config value JSON for a config definition.
- `get_current_server_effective_config_value_json(uuid, uuid)` → returns current effective server config value JSON for a config definition/server pair.
- `config_json_values_match(jsonb, jsonb)` → null-safe JSONB equality helper used by config apply conflict checks.
- `server_config_value_source_for_scope(config_governance_scope)` → maps config governance scope to server config value source.
- `can_manage_config_governance(uuid)` → permission helper for config governance workflows.

Frontend/domain RPC contracts:

- `create_config_change_set_draft(text, text, config_change_visibility, text, text)` → returns `config_change_sets`; creates a draft change set, sets `requested_by = auth.uid()`, validates through table constraints, checks `can_manage_config_governance(null)`, and writes best-effort audit through `try_write_config_change_set_audit(...)`.
- `create_config_value_change_entry(uuid, config_change_kind, uuid, jsonb, uuid, jsonb)` → returns `config_change_entries`; creates a `global_value_change` or `server_value_change` entry only while the change set is `draft`, computes old effective config value DB-side, sets `field_path = value_json`, stores lightweight metadata, and writes best-effort audit through `try_write_config_change_set_audit(...)`.
- `mark_config_change_set_ready(uuid)` → returns `config_change_sets`; marks a draft config change set ready after DB-side validation.
- `apply_config_change_set(uuid)` → returns `config_change_sets`; atomically applies a ready config change set. Current supported scope is scalar/json `global_value_change` and `server_value_change` entries.
- `cancel_config_change_set(uuid, text)` → returns `config_change_sets`; cancels a draft/ready change set and requires explicit cancellation reason.

Internal helper functions:

- `validate_config_change_set_entries_for_d5(uuid)` → validates D5-supported entries before ready/apply.
- `apply_global_config_value_change_entry(config_change_entries, uuid)` → internal helper used by `apply_config_change_set(...)`.
- `apply_server_config_value_change_entry(config_change_entries, uuid)` → internal helper used by `apply_config_change_set(...)`.
- `try_write_config_change_set_audit(...)` → internal/best-effort audit helper. Frontend must not call this helper directly.

Operational rules:

- Frontend must call `create_config_change_set_draft(...)` instead of direct inserts into `config_change_sets`.
- Frontend must call `create_config_value_change_entry(...)` instead of direct inserts into `config_change_entries` for governed scalar/json value entries.
- Frontend must call ready/apply/cancel workflow RPCs instead of direct status updates.
- Frontend must not call `try_write_config_change_set_audit(...)`; audit for config governance workflow is DB-side.
- `create_config_value_change_entry(...)` supports only D4/D5 scalar/json value-entry flow: `scalar_config` / `json_config` definitions and value types `integer`, `decimal`, `boolean`, `string`, `json`.
- Relational `entity_field_change` creation/application remains a future dedicated workflow. Do not invent generic relational apply logic in frontend.
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

## Anti-abuse functions and RPC contracts

Known signal/case helper functions include:

- `build_anti_abuse_hero_pair_grouping_key(server_id, hero_a, hero_b)`
- `generate_trade_transaction_anti_abuse_signals(transaction_id)`
- `insert_trade_transaction_anti_abuse_signal(...)` internal/helper
- `trigger_generate_trade_transaction_anti_abuse_signals()` trigger function
- `create_or_link_anti_abuse_case_for_signal(signal_id)`
- `trigger_create_or_link_anti_abuse_case_for_signal()` trigger function
- `refresh_anti_abuse_case_signal_stats(case_id)` internal/helper
- `add_anti_abuse_case_participant_if_missing(...)` internal/helper

Player-facing report/declaration creation functions include:

- `create_player_abuse_report(...)` if present in generated types/schema;
- declaration/report creation should prefer RPC where available.

G5 anti-abuse decision/audit RPC contracts now present:

- `can_manage_anti_abuse(uuid)` → permission helper for anti-abuse staff/admin workflows.
- `set_anti_abuse_case_decision(uuid, anti_abuse_case_status, text, anti_abuse_case_verdict, text, boolean, text, text)` → returns `anti_abuse_cases`; updates case status/verdict fields and writes DB-side audit.
- `set_player_relationship_declaration_decision(uuid, player_relationship_declaration_status, text, text, text)` → returns `player_relationship_declarations`; updates declaration review/status fields and writes DB-side audit.
- `set_player_abuse_report_decision(uuid, player_abuse_report_status, text, uuid, text, text)` → returns `player_abuse_reports`; updates report status/case/admin notes/player notes and writes DB-side audit.
- `create_anti_abuse_sanction(uuid, text, uuid, uuid, text, text, integer, integer, uuid, uuid)` → returns `anti_abuse_sanctions`; creates sanction record and writes DB-side audit.
- `set_anti_abuse_sanction_status(uuid, anti_abuse_sanction_status, text)` → returns `anti_abuse_sanctions`; updates sanction status/timestamps and writes DB-side audit.
- `create_character_point_penalty_for_sanction(uuid, text, text)` → returns `character_point_penalties`; creates CP penalty record from a sanction and writes DB-side audit.
- `set_character_point_penalty_status(uuid, anti_abuse_sanction_status, text)` → returns `character_point_penalties`; updates CP penalty status/timestamps and writes DB-side audit.
- `add_anti_abuse_sanction_item(uuid, uuid, uuid, uuid, text, text)` → returns `anti_abuse_sanction_items`; links an item to a sanction as moderation evidence/decision context and writes DB-side audit.

Internal anti-abuse audit helper:

- `try_write_anti_abuse_case_audit(text, uuid, text, uuid, text, jsonb, jsonb, jsonb)` → internal best-effort audit helper that writes `audit_logs` and links them through `anti_abuse_case_audit_logs`. Frontend must not call it directly.

Anti-abuse workflow operational rules:

- Frontend must call the public anti-abuse workflow RPCs above instead of direct updates/inserts into case/report/declaration/sanction/penalty tables.
- Frontend must not call `write_audit_log(...)` as a second step after a domain mutation. Audit for these workflows is DB-side.
- Frontend must not call `try_write_anti_abuse_case_audit(...)`; it is internal.
- Public/domain RPCs should have `EXECUTE` for `authenticated`; internal helpers should not be granted to `authenticated` or `anon`.
- `add_anti_abuse_sanction_item(...)` records sanction-item involvement and audit evidence. It does **not** transfer item ownership and does **not** implement full item confiscation/return. A real confiscation/return ownership workflow remains a separate DB/RPC contract.

G5 audit dictionary additions include action keys for case decisions, declaration decisions, report decisions, sanction creation/status changes, CP penalty creation/status changes, and sanction item links. Relevant audit entity keys include `anti_abuse_case`, `player_relationship_declaration`, `player_abuse_report`, `anti_abuse_sanction`, `character_point_penalty`, and `anti_abuse_sanction_item`.

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
- `scope_key`
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
