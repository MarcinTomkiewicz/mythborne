# Mythborne — Database Current Notes

Updated: 2026-04-30

This file is the curated semantic index of the current database state.

It is not a full `pg_dump`, but it must contain the important tables, enums, helper functions, RPCs, legacy warnings, and gameplay/database semantics that Codex needs without rediscovering everything from scratch.

If this file conflicts with the actual database or generated `database.types.ts`, prefer the actual database/generated types and update this file.

---

# Source-of-truth order

For schema-sensitive implementation, use this order:

1. current live database / generated `database.types.ts`;
2. current migrations / SQL that have been applied;
3. this file as the semantic index;
4. `current-decisions.md`;
5. `project-context.md`;
6. `codex-mythborne-backlog.md`;
7. `current-state-summary.md` and `current-todo.md` only as Codex progress/status files.

Important: `current-state-summary.md`, `current-todo.md`, and task statuses in the backlog are owned by Codex/user-confirmed implementation progress. Do not use them as the main schema source.

---

# General database rules

- PostgreSQL / Supabase.
- Prefer relational modeling over hidden JSON blobs.
- Prefer explicit constraints, dictionary tables, helper text, descriptions, and status reasons.
- Do not duplicate role/access logic if canonical helper functions exist.
- Critical gameplay/economy/admin mutations should go through RPC/domain operations, not direct frontend table writes.
- Preserve `reason`, `description`, `status_reason`, `helper_text`, and `admin_description` wherever applicable.
- Metadata JSON should be lightweight and contextual, not a place to hide core fields.
- Legacy/transitional tables and fields may remain for compatibility, but new systems should use the current central models.
- Any workflow that writes audit must have active `audit_action_types` and `audit_entity_types` rows before Codex can consider it unblocked.

---

# Canonical stats and stat allocation

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

- stores base stat values for a hero;
- keyed by hero and stat key;
- should align with the canonical `stats` table.

## G6 stat allocation RPC

`save_stat_allocation(p_hero_id uuid, p_stat_values_json jsonb, p_character_points_spent integer, p_reason text, p_request_id text)` is the canonical transactional gameplay RPC for stat allocation saves.

Return model:

- `hero_id uuid`
- `server_id uuid`
- `character_points_after integer`
- `stats_json jsonb`
- `audit_log_id uuid`

Purpose:

- update `hero_stats`;
- spend Character Points through `apply_character_points_delta(...)` / `character_point_ledger`;
- write `gameplay.stat_allocation.saved` audit;
- perform the above atomically in one DB-owned workflow.

Frontend rules:

- use `save_stat_allocation(...)` for stat allocation save;
- do not update `hero_stats` directly in this flow;
- do not update `hero.character_points` directly in this flow;
- do not call frontend `AuditWriter` separately for this flow;
- normalize UI payloads before calling where useful, but DB also validates/nonnegative-normalizes the persisted values;
- pass a `request_id` when available for idempotency/audit correlation.

Required audit dictionary rows:

- `audit_action_types.key = gameplay.stat_allocation.saved`, category `gameplay`, severity `notice`, active;
- `audit_entity_types.key = hero`, category `hero`, active.

Future optional DB work:

- `calculate_stat_allocation_cost(...)` or formula-backed cost resolver, if/when stat allocation cost should be calculated fully DB-side instead of passed as `p_character_points_spent`.

---

# Hero, account, server and identity model

## `hero`

Current hero identity model:

- `hero.id` is the character id;
- `hero.user_id` is the owning account id;
- `hero.server_id` is the server/world id;
- do not assume `hero.id = auth.uid()`.

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

- `character_points >= 0`;
- `total_character_points_earned >= 0`;
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

Important server/access tables include:

- `game_servers`
- `server_memberships`
- `server_staff_assignments`
- `server_staff_assignment_scopes`
- `staff_permission_scopes`

Enums include:

- `game_server_kind`: `sandbox`, `standard`;
- `game_server_status`: `draft`, `testing`, `scheduled`, `live`, `archived`;
- `server_membership_status`: `active`, `suspended`, `banned`;
- `server_staff_role`: `owner`, `operator`, `moderator`, `tester`.

Use canonical helpers when writing SQL/RPC:

- `has_global_role(text[])`
- `has_server_staff_role(uuid, server_staff_role[])`
- `can_manage_server_staff(uuid)`
- `can_have_moderator_scope(uuid, text)`

Do not duplicate role logic by joining `roles` unless the helper layer is missing.

Global role is account-level capability. Server authority is server-scoped and should flow through `server_staff_assignments` and helper RPCs, not through assumptions that a global operator/moderator has authority everywhere.

`can_manage` is not the same as `can_use_as_sandbox`. Tester visibility is not management permission.

## Staff assignment and scope mutations

Canonical mutation paths:

- `assign_global_role(p_user_id uuid, p_role_key text, p_reason text)`;
- `assign_server_staff(p_server_id uuid, p_user_id uuid, p_role server_staff_role, p_reason text, p_notes text)`;
- `revoke_server_staff(...)` if present in generated types;
- `set_server_staff_permission_scopes(...)` if present in generated types.

Frontend must not direct-write `user_data.role_id`, `server_staff_assignments`, or `server_staff_assignment_scopes`.

Staff assignment eligibility is DB-owned and should use DB helper/read RPCs such as `search_server_staff_candidates(...)` and `search_server_staff_candidates_page(...)`.

---

# Configuration governance

Config governance is database-backed and reasoned.

Important rule: configurable does not mean freely changeable at any time.

## Config governance scopes

`config_governance_scope` values:

- `product_global`
- `global_balance`
- `server_launch`
- `live_server`
- `test_override`

`product_global` examples:

- daily trial count;
- daily attack count;
- base exploration step timing model;
- manual siege action timer;
- base PvP travel-time minimum/model.

These are highly controlled product-level rules, not casual live-server settings.

## Config change-set RPCs

Config governance workflow is DB/RPC-owned:

- `create_config_change_set_draft(text, text, config_change_visibility, text, text)`;
- `create_config_value_change_entry(uuid, config_change_kind, uuid, jsonb, uuid, jsonb)`;
- `mark_config_change_set_ready(uuid)`;
- `apply_config_change_set(uuid)`;
- `cancel_config_change_set(uuid, text)`.

Rules:

- frontend must call these RPCs instead of direct inserts/updates into `config_change_sets` and `config_change_entries`;
- frontend must not call `try_write_config_change_set_audit(...)` directly;
- `create_config_value_change_entry(...)` supports scalar/json value changes only;
- relational `entity_field_change` needs a dedicated workflow before use;
- `apply_config_change_set(...)` currently supports scalar/json `global_value_change` and `server_value_change` entries.

---

# Formulas, bonuses, derived stats

## Formula system

Use the relational formula system:

- `balance_formula_targets`
- `balance_formulas`
- `balance_formula_assignments`
- `balance_formula_blocks`
- `entity_formula_assignments`

Do not replace this with generic JSON configs.

## Bonus system current truth

Current canonical bonus naming is **scope**, not context.

Use:

- `bonus_types`
- `bonus_scopes`
- `bonus_target_categories`
- `bonus_targets`
- semantic `bonus_templates`
- `entity_bonuses`

Legacy/transitional bonus tables:

- `origin_bonuses`
- `building_bonuses`
- `item_bonuses`
- `item_generation_base_bonuses`
- `item_generation_affix_bonuses`

New code should use `entity_bonuses` as the central relation. Legacy tables may remain only for compatibility/migration.

Quality scaling:

- `entity_bonuses.quality_scales_value = true` means item quality multiplier scales `value`;
- `quality_scales_level_interval` must remain false;
- quality never scales `level_interval`;
- no database-level rounding is applied;
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

- `defense = endurance + active defense bonuses`;
- `luck = active luck bonuses`, base 0 unless explicitly changed later;
- `min_damage = strength + weapon/base min_damage + active min_damage bonuses + active damage bonuses`;
- `max_damage = strength + weapon/base max_damage + active max_damage bonuses + active damage bonuses`;
- `damage` target applies to both `min_damage` and `max_damage`;
- resolver must ensure `max_damage >= min_damage`;
- `health` may use a base health formula/fallback, then active health bonuses;
- `critical_chance` and `evasion_chance` are additive bonus inputs for combat formulas, not necessarily whole final chances.

`hero_derived` is deprecated/transitional. Do not add new dependencies on it.

---

# Requirements and building caps

Central requirement foundation:

- `requirement_definitions`
- `entity_requirements`

Legacy/transitional requirement tables/fields:

- `building_requirements`
- `buildings.requirements`
- `buildings.rank_required`

Use central `entity_requirements`.

## Requirement mutation RPCs

Central entity requirement mutations are now DB/RPC-owned.

Canonical RPCs:

- `create_entity_requirement(p_entity_type requirement_entity_type, p_entity_id uuid, p_requirement_definition_key text, p_required_value_integer integer, p_required_value_decimal numeric, p_required_value_boolean boolean, p_required_value_text text, p_required_stat_key text, p_required_building_key text, p_required_resource_type text, p_required_district_code text, p_requirement_scope_key text, p_applies_from_level integer, p_description text, p_sort_order integer, p_reason text)`;
- `update_entity_requirement(p_requirement_id uuid, p_requirement_definition_key text, p_required_value_integer integer, p_required_value_decimal numeric, p_required_value_boolean boolean, p_required_value_text text, p_required_stat_key text, p_required_building_key text, p_required_resource_type text, p_required_district_code text, p_requirement_scope_key text, p_applies_from_level integer, p_is_active boolean, p_description text, p_sort_order integer, p_reason text)`;
- `deactivate_entity_requirement(p_requirement_id uuid, p_reason text)`;
- `reorder_entity_requirements(p_entity_type requirement_entity_type, p_entity_id uuid, p_requirement_ids uuid[], p_reason text)`;
- `validate_entity_requirement_payload(...)` is an internal/helper validation function;
- `assert_can_manage_entity_requirements(...)` is an access/target assertion helper.

Rules:

- frontend must use these RPCs instead of direct writes to `entity_requirements`;
- frontend must not use legacy `building_requirements`, `buildings.requirements`, or `buildings.rank_required` for new editor workflows;
- requirement editor should load active `requirement_definitions` from DB;
- UI should render fields by `requirement_definitions.value_type`;
- preview/explainability should use `get_requirement_impact_preview(...)`.

Required audit rows:

- `audit_entity_types.key = entity_requirement`;
- `config.entity_requirement.created`;
- `config.entity_requirement.updated`;
- `config.entity_requirement.deactivated`;
- `config.entity_requirement.reordered`.

## Building caps

Building availability:

- `buildings.district_code` is minimum district;
- building is available in that district and higher districts;
- `buildings.max_level = 0` means unlimited;
- `building_district_level_caps` stores overrides only;
- missing override falls back to `buildings.max_level`.

Helpers:

- `is_building_available_in_district(uuid, text)`;
- `get_building_max_level_for_district(uuid, text)`.

---

# Human-readable reference search and paginated target browsers

Human-facing admin/staff UI must not require raw UUID entry as primary UX.

Rules:

- use DB-backed autocomplete/search/browser RPCs;
- use `_page` variants for virtual scroll, target browsers, or empty-query lazy lists;
- do not broad-fetch `user_data`, `hero`, `items`, case/sanction/trade/auction/admin balance tables and filter in Angular;
- raw UUIDs/keys may be shown only as secondary technical metadata;
- `_page` variants accept `p_limit`, `p_offset`, and return `total_count`.

Known search/browser RPC families:

- `search_server_staff_candidates(...)`
- `search_server_staff_candidates_page(...)`
- `search_moderation_user_targets(...)`
- `search_moderation_user_targets_page(...)`
- `search_moderation_hero_targets(...)`
- `search_moderation_hero_targets_page(...)`
- `search_anti_abuse_case_targets(...)`
- `search_anti_abuse_case_targets_page(...)`
- `search_anti_abuse_sanction_targets(...)`
- `search_anti_abuse_sanction_targets_page(...)`
- `search_moderation_item_targets(...)`
- `search_moderation_item_targets_page(...)`
- `search_trade_offer_targets(...)`
- `search_trade_offer_targets_page(...)`
- `search_trade_transaction_targets(...)`
- `search_trade_transaction_targets_page(...)`
- `search_auction_listing_targets(...)`
- `search_auction_listing_targets_page(...)`
- `search_config_definition_targets(...)`
- `search_config_definition_targets_page(...)`
- `search_balance_formula_targets(...)`
- `search_balance_formula_targets_page(...)`
- `search_balance_formula_target_targets(...)`
- `search_balance_formula_target_targets_page(...)`
- `search_building_targets(...)`
- `search_building_targets_page(...)`
- `search_bonus_template_targets(...)`
- `search_bonus_template_targets_page(...)`
- `search_requirement_definition_targets(...)`
- `search_requirement_definition_targets_page(...)`
- `search_item_generation_entity_targets(...)`
- `search_item_generation_entity_targets_page(...)`

---

# Item generation and equipment

Item generation is layered:

- quality;
- prefix;
- base item;
- suffix.

Luck affects value buckets, prefix/suffix odds, quality odds, and limited trial-related randomness. Luck improves opportunity quality, not certainty of perfect outcomes.

Important item-generation tables include:

- `item_generation_qualities`
- `item_generation_bases`
- `item_generation_affixes`
- `item_generation_bucket_profiles`
- `entity_bonuses`

Rules:

- high economic value does not automatically mean high utility;
- expensive “bait”/scrap-oriented affixes are allowed;
- +Luck itemization should remain rare/elite by itemization design;
- item quality roll is Luck-driven within the allowed max quality/reward profile; district and difficulty affect reward ranges/profiles, not direct guaranteed quality.

---

# Character Points, trade and auctions

Character Points are stored on:

- `hero.character_points`
- `hero.total_character_points_earned`

Use `character_point_ledger` for persistent balance history. Do not put Character Points in `hero_resources` or `hero_derived`.

DB/RPC foundation exists for:

- direct trade;
- one-item auctions;
- CP locks;
- item locks;
- transactions;
- trade/auction anti-abuse signals/case grouping.

Trade between players uses Character Points. Drachmas are vendor/system/building currency. Vendor scrap is not trade.

Frontend gameplay surfaces are still pending for full trade/auction UI.

---

# Moderation, anti-abuse, reports and declarations

## Dictionaries

Active dictionary tables include:

- `anti_abuse_signal_types`
- `anti_abuse_sanction_types`
- `player_abuse_report_types`
- `player_relationship_declaration_types`

Codex should load labels/descriptions/helper/admin text from DB where present and should not hardcode dictionary option lists.

## Anti-abuse cases and signals

Anti-abuse creates signals/cases for review. It must not auto-punish.

Important DB/RPC pieces include:

- `anti_abuse_cases`
- `anti_abuse_signals`
- `anti_abuse_case_participants`
- `anti_abuse_case_signals`
- `create_or_link_anti_abuse_case_for_signal(...)`
- `generate_trade_transaction_anti_abuse_signals(...)`
- `insert_trade_transaction_anti_abuse_signal(...)`
- `refresh_anti_abuse_case_signal_stats(...)`
- `search_anti_abuse_case_targets(...)`
- `search_anti_abuse_case_targets_page(...)`

## Moderation history and actions

Canonical read RPCs:

- `get_visible_moderation_actions(p_server_id uuid, p_target_user_id uuid, p_target_hero_id uuid)`;
- `get_full_user_moderation_history(p_server_id uuid, p_user_id uuid)`;
- `get_full_hero_moderation_history(p_server_id uuid, p_hero_id uuid)`;
- `can_read_moderation_action(moderation_actions)`;
- `can_read_full_moderation_history(p_server_id uuid)`;
- `assert_can_read_full_moderation_history(p_server_id uuid, p_operation text)`.

Scoped moderators should use scoped visible history/search RPCs. Full history is admin/operator authority.

## Player abuse reports

Canonical creation/decision RPCs:

- `create_player_abuse_report(...)`;
- `set_player_abuse_report_decision(...)`.

Relevant audit actions include:

- `player_report.created`
- `player_report.linked_to_case`
- `player_report.status_changed`
- `anti_abuse.report.decision_updated`

## Player relationship declarations

Relationship declarations provide anti-abuse context. They do not disable anti-abuse.

Canonical RPCs:

- `create_player_relationship_declaration(p_server_id uuid, p_declaration_type_key text, p_title text, p_description text, p_created_by_hero_id uuid, p_amount_character_points integer, p_starts_at timestamptz, p_expires_at timestamptz, p_participants_json jsonb, p_items_json jsonb, p_trades_json jsonb, p_request_id text)` → `TABLE(declaration_id uuid)`;
- `set_player_relationship_declaration_decision(p_declaration_id uuid, p_status player_relationship_declaration_status, p_status_reason text, p_admin_notes text, p_player_notes text)`.

Rules:

- frontend must use `create_player_relationship_declaration(...)` instead of direct inserts into declaration/participant/item/trade tables;
- creation is audited as `anti_abuse.declaration.created`;
- decision/update is audited as `anti_abuse.declaration.decision_updated`.

Relevant audit rows:

- `audit_entity_types.key = player_relationship_declaration`;
- `audit_action_types.key = anti_abuse.declaration.created`;
- `audit_action_types.key = anti_abuse.declaration.decision_updated`.

## Sanctions and CP penalties

Sanctions are explicit records linked to cases. A case can have multiple sanctions.

Canonical RPCs include:

- `create_anti_abuse_sanction(...)`;
- `set_anti_abuse_sanction_status(...)`;
- `add_anti_abuse_sanction_item(...)`;
- `create_character_point_penalty_for_sanction(...)` if present in current generated types/schema;
- `set_character_point_penalty_status(...)` if present in current generated types/schema.

Search/browser:

- `search_anti_abuse_sanction_targets(...)`;
- `search_anti_abuse_sanction_targets_page(...)`.

Sanction item linking is evidence/context linking, not necessarily a true item confiscation/return workflow. True confiscation/return item movement remains a separate future domain workflow unless explicitly implemented.

---

# Audit foundation

Important tables:

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

Critical rule:

- Any new audited mutation must seed/verify `audit_action_types` and `audit_entity_types` before Codex treats it as unblocked.

Current recently added/confirmed rows include:

- `gameplay.stat_allocation.saved`
- `config.entity_requirement.created`
- `config.entity_requirement.updated`
- `config.entity_requirement.deactivated`
- `config.entity_requirement.reordered`
- `anti_abuse.declaration.created`

---

# PvE exploration / trials / encounters — design state, not DB foundation yet

The PvE exploration/trials runtime is **not yet implemented in database**. The following is current design direction for upcoming PVE-DB work and must not be treated as existing schema.

Current design decisions:

- PvE is exploration plus trials, not classic monster hunt wording.
- Exploration is per hero/server and should produce a daily map/graph for the hero.
- Daily limit applies to trials, not raw movement steps.
- Premium increases number of attempts, not quality of outcomes.
- Step flow: trial opportunity check first; if no trial opportunity, then encounter or nothing.
- Encounter and trial cannot happen on the same step.
- Trial flow: opportunity → equal random active trial selection → manifestation → minigame completion.
- Dry step count affects only trial opportunity and resets after any trial opportunity attempt, even if manifestation fails.
- All active trial definitions are equal in selection; no trial weights.
- Each base stat should eventually have its own trial definition/archetype.
- Trial definition points to a `minigame_key`; minigame interprets difficulty.
- Difficulty tiers are `easy`, `medium`, `hard` and are one source of truth for global difficulty semantics.
- Encounter types are `combat`, `resource`, `buff`, `debuff`; `nothing` is a step outcome, not an encounter definition.
- Encounter definitions are configurable and may have multiple description variants.
- Encounter selection is equal among active/qualified definitions; no weights at the current design stage.
- Buff/debuff: only one active exploration effect at a time; buff/debuff encounters are excluded if an active effect exists; active effect expires on trial or combat encounter, not on resource/nothing.
- Manifestation caps are flat profile values by `difficulty × district`, not complex formulas.
- Trial reward item count ranges are intended to be profile values by `difficulty × district`.
- Item quality remains Luck-driven within allowed caps/profiles; district/difficulty influence ranges/profiles and reward count, not guaranteed item quality.
- Exploration graph/current-state model is still under discussion. Current direction: minimal `hero_explorations` record, nodes, edges, steps, counters/effects, avoiding duplicated state.

Future PVE DB work should follow the ongoing A–I plan in `current-decisions.md` before writing migrations.

---

# Reports and snapshots

Reports are not audit logs.

Future report/snapshot system should support:

- trial reports;
- encounter reports;
- PvP combat reports;
- siege reports.

Rules:

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

Use central `entity_requirements` and mutation RPCs.

## Trade active slot fallback

`trade_active_offer_limit_fallback` is temporary.

Use Trade Routes/building bonus runtime when implemented.

## Vendor scrap

Vendor scrap is not trade.

Vendor scrap gives drachmas and does not use Character Points.

---

# Current completed database/runtime foundations

The following foundations have current DB/RPC coverage or accepted DB direction:

- server/world/account/hero identity model;
- staff access and server-scoped staff assignments;
- config governance scalar/json change set workflow;
- formula governance foundation;
- item ownership / lifecycle foundation;
- Character Points balance and ledger foundation;
- stat allocation transactional save RPC;
- direct trade schema and RPC runtime;
- auction schema and RPC runtime;
- trade/auction anti-abuse signal generation;
- automatic anti-abuse case grouping;
- moderation read/scope contracts;
- player abuse report create/decision flows;
- player relationship declaration create/decision flows;
- sanctions, sanction item linking, CP penalties foundation;
- requirements foundation, requirement mutation RPCs and building district cap overrides;
- bonus dictionary/entity bonus foundation and legacy bonus backfill;
- human-readable reference search and paginated target browser RPCs.

Codex must regenerate database types after schema changes before implementing affected frontend/domain code.
