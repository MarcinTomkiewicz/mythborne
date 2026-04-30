# Mythborne — Database Current Notes

Updated: 2026-04-30

This file is the curated semantic index of the current database state.

It is not a full `pg_dump`, but it must contain the important tables, enums, helper functions, RPCs, legacy warnings, and gameplay/database semantics that Codex needs without rediscovering everything from scratch.

If this file conflicts with the actual database or generated `database.types.ts`, prefer the actual database/generated types and update this file.

---

# Current DB/RPC contract updates — 2026-04-28

## Update 2026-04-30 — Epic M combat DB foundation

Epic M now has database foundation for reusable combat core, admin-defined opponents, combat candidates and relational combat result snapshots. This is schema/config foundation only; frontend/domain implementation still must be done by Codex after type regeneration.

### Combat formula/config additions

New formula targets:

- `combat_initiative_score`
  - `scope_key = combat_balance`
  - allowed variables: `combatantIntelligence`, `combatantAgility`, `attackIndex`, `attackCount`
  - default formula: `combatantIntelligence * 1.0 + combatantAgility * 0.25 - (attackIndex - 1) * 5`
  - higher score acts earlier; ties are handled by combat ordering logic and won by the initiating side.
- `combat_opponent_scaled_stat`
  - `scope_key = combat_balance`
  - allowed variables: `baseValue`, `heroLevel`, `difficultyMultiplier`
  - default formula: `round(baseValue + (heroLevel - 1) * difficultyMultiplier)`

Random formula library seeds now exist in `balance_formula_blocks` for each current formula scope:

- `random()` — random decimal 0..1.
- `random(min, max)` — random decimal between min and max.

These are DB/admin library seeds only. Runtime support still requires Codex to implement evaluator/editor/preview handling, including nondeterministic preview and reroll/refresh behavior.

Global combat turn limit:

- `config_definitions.key = combat_turn_limit`
- `governance_scope = product_global`
- `managed_entity_type = scalar_config`
- `managed_entity_key = combat`
- `value_type = integer`
- default value `10`
- helper `get_combat_turn_limit()` returns the effective value clamped to at least 1.

Do not store `turn_limit` per combat result. Combat results store `turns_completed`; the limit is the global product rule.

### Combat enums

New combat-related enums:

- `combat_side`: `initiator`, `defender`.
- `combat_participant_kind`: `hero`, `opponent`.
- `combat_outcome`: `initiator_victory`, `defender_victory`, `draw`.
- `combat_source_type`: `encounter`, `trial`, `pvp`, `sandbox`, `admin_test`.
- `combat_opponent_equipment_mode`: `none`, `manual`, `generated`.
- `combat_candidate_kind`: `opponent`, `family`.
- `combat_attack_source_kind`: `natural`, `unarmed`, `player_item`, `opponent_manual`, `opponent_generated`.

### Equipment slot dictionary

`equipment_slot_definitions` is the canonical DB dictionary for equipment slots used by both hero equipment and opponent equipment blueprints.

Current active keys:

- `main_hand`
- `off_hand`
- `helmet`
- `armor`
- `pants`
- `boots`
- `amulet`
- `ring_1`
- `ring_2`

`hero_equipment.slot_key` and `combat_opponent_equipment_entries.slot_key` both reference `equipment_slot_definitions(key)`. Do not duplicate permanent slot lists in frontend code.

### Opponent definitions

Opponent/NPC content is admin/balancer-defined. Combat rules remain generic; opponents are combatants provided by encounter/trial/sandbox/PvP callers.

Tables:

- `combat_opponent_equipment_mode_definitions`
  - human-readable dictionary for `combat_opponent_equipment_mode`.
- `combat_opponent_families`
  - admin-defined family/category, e.g. beast, human, undead, mythic; names are data, not hardcoded gameplay logic.
- `combat_opponent_definitions`
  - reusable opponent definition.
  - one opponent belongs to one `family_key`.
  - has `equipment_mode` and optional `default_scaling_formula_id`.
- `combat_opponent_stat_values`
  - baseline canonical stat values per opponent and `stats.key`.
  - runtime scales these values using candidate/opponent/default formula flow.
- `combat_opponent_attack_sources`
  - natural/non-equipment attack sources such as Bite, Scratch, Iron Wings, Fist.
  - used for opponents that attack without player-owned items.
- `combat_opponent_equipment_entries`
  - optional item-like equipment blueprint per opponent and slot.
  - `entry_mode = manual` uses quality/base/prefix/suffix component references.
  - `entry_mode = generated` stores generation bucket/max quality instructions.
  - generated opponent equipment must not create rows in `items`; it is materialized only for the fight snapshot.

Opponent equipment is private. Combat reports show attack source labels and optional item-like source component refs; they do not reveal full equipment loadouts by default.

### Encounter/trial combat candidates

Combat candidates replace the earlier idea of separate pools in v1. A candidate may point to one concrete opponent or to one family. Multiple rows can mix families and specific opponents.

Tables:

- `encounter_combat_candidates`
  - FK to `encounter_definitions`.
  - `candidate_kind = opponent | family`.
  - exactly one of `opponent_definition_id` or `family_key` is required according to kind.
  - optional `scaling_formula_id`, `difficulty_multiplier`, `weight`, `min_hero_level`, `max_hero_level`.
- `trial_combat_candidates`
  - same model for `trial_definitions`.

The same opponent can be used in encounter and trial candidates with different formula/multiplier. Trial combat uses the same combat module, not a separate combat type.

### Combat result snapshot foundation

Relational combat result tables exist for completed combat history and future private/public report rendering:

- `combat_results`
  - header for one completed fight.
  - stores `server_id`, source type/entity, optional initiator/defender hero ids, outcome, winner/loser side, `turns_completed`, timestamps.
  - no `turn_limit`; use `get_combat_turn_limit()` for the global limit.
- `combat_result_participants`
  - one row per side.
  - stores participant kind, hero/opponent reference, display name, level and resolved combat values at fight time.
  - includes final `critical_damage` percent.
- `combat_result_participant_stats`
  - relational base/canonical stat snapshot per participant.
  - avoids reading `hero_derived` or live state for historical reports.
- `combat_result_attacks`
  - one row per resolved attack.
  - stores turn/order, actor/target side, source kind, source label, optional source component refs, hit/evasion/crit/damage/health-after fields and display text.
  - `source_item_id` is intentionally not a FK to `items`; item lifecycle must not break historical combat reports.

Full equipment is not public report data. Report UI may show an attack source such as `Outstanding Golden Sword of Despair`, `Bite`, `Iron Wings`, or `Fist` and may use quality/base/prefix/suffix refs for a tooltip when safe.

### Frontend/Codex implications

After schema changes, regenerate `database.types.ts` before implementing Epic M frontend/domain tasks.

Codex tasks must:

- implement random support in formula runtime/editor/preview;
- remove hardcoded crit multiplier x2 and consume `critical_damage` as base 50% + bonuses;
- build reusable combat domain models and resolver outside the sandbox page;
- build attack plans and initiative slot ordering;
- resolve opponents from definitions/candidates/stat scaling/equipment/natural sources;
- persist completed combat results into the relational snapshot tables when gameplay caller requires history;
- avoid `hero_derived`.

This section is a normal part of `database-current.md`. It is not a handoff override and it must not silently supersede the rest of the file. If an older section below conflicts with this section, update the older section instead of adding another override block.

## Update 2026-04-28 — G4b config governance create RPCs

Config governance draft creation and draft value-entry creation are now DB/RPC workflows, not direct frontend table writes. This aligns creation with the existing ready/apply/cancel RPC workflow and keeps config audit on the database side.

Frontend/domain RPC contracts:

- `create_config_change_set_draft(text, text, config_change_visibility, text, text)` → returns `config_change_sets`; creates a draft change set, sets `requested_by = auth.uid()`, validates through table constraints, checks `can_manage_config_governance(null)`, and writes best-effort audit through `try_write_config_change_set_audit(...)`.
- `create_config_value_change_entry(uuid, config_change_kind, uuid, jsonb, uuid, jsonb)` → returns `config_change_entries`; creates a `global_value_change` or `server_value_change` entry only while the change set is `draft`, computes old effective config value DB-side, sets `field_path = value_json`, stores lightweight metadata, and writes best-effort audit through `try_write_config_change_set_audit(...)`.
- `mark_config_change_set_ready(uuid)` → returns `config_change_sets`; marks a draft change set as ready after DB-side validation.
- `apply_config_change_set(uuid)` → returns `config_change_sets`; atomically applies a ready change set. Current scope supports scalar/json `global_value_change` and `server_value_change` entries.
- `cancel_config_change_set(uuid, text)` → returns `config_change_sets`; cancels a draft/ready change set and requires explicit cancellation reason.

Rules:

- Frontend must call these RPCs instead of direct inserts into `config_change_sets` and `config_change_entries` or direct status updates.
- Frontend must not call `try_write_config_change_set_audit(...)`; it remains an internal helper.
- `create_config_value_change_entry(...)` supports only the scalar/json value-entry flow: `scalar_config` / `json_config` definitions and value types `integer`, `decimal`, `boolean`, `string`, `json`.
- Relational `entity_field_change` creation/application remains a future dedicated workflow.
- After applying schema/RPC migrations, regenerate `database.types.ts` so the typed frontend services see the current RPCs.

## Update 2026-04-30 — Epic N progression DB foundation

Epic N now has current DB/balance foundation for stat progression, XP-to-next-level and critical damage semantics. This is schema/config foundation only; frontend/domain implementation still must be done by Codex after type regeneration.

### Existing stat allocation workflow

Stat allocation is not a new Epic N DB task. The canonical workflow already exists from the gameplay audit/stat allocation slice:

- `save_stat_allocation(...)` is the frontend-facing DB/RPC workflow for final stat allocation save.
- UI plus/minus changes should remain local drafts and unaudited.
- Final save must go through the RPC/domain workflow.
- Frontend must not direct-write `hero_stats`, `hero.character_points`, `character_point_ledger`, or audit tables.

### Progression formula targets

Current active progression formula targets:

- `hero_stat_level_cap`
  - `scope_key = hero_progression`
  - allowed variables: `heroLevel`
  - current default formula: `heroLevel + 4`
- `hero_stat_upgrade_cost`
  - `scope_key = hero_progression`
  - allowed variables: `heroLevel`, `level`, `statLevel`
  - current default formula: `roundUp(4 + level * 2 + pow(level, 1.45), 5)`
- `hero_experience_to_next_level`
  - `scope_key = hero_progression`
  - allowed variables: `heroLevel`
  - current default formula: `roundUp(100 + heroLevel * 50 + pow(heroLevel, 2.1) * 25, 10)`

`hero_experience_to_next_level` is a configurable formula seed, not a hardcoded frontend threshold table. Admin/balancer may rebalance it through the formula system.

### Critical damage derived stat

`critical_damage` is now present in `derived_stat_definitions` as a runtime combat stat:

- `key = critical_damage`
- `value_kind = decimal`
- `calculation_kind = additive`
- `base_source = zero`
- `bonus_target_key = critical_damage`
- `is_combat_stat = true`

Runtime semantic decision:

- base critical damage percent is 50;
- active `critical_damage` bonuses are added on top;
- final crit multiplier should be computed by combat runtime as `1 + finalCriticalDamagePercent / 100`.

This replaces the old sandbox hardcoded crit multiplier x2. Do not treat `critical_damage` as a standalone formula target.

### Codex implications for Epic N

- Regenerate `database.types.ts` before implementing N frontend/domain tasks.
- Do not recreate stat allocation RPC/workflow.
- Do not hardcode stat cost, cap or XP thresholds in Angular.
- Use formula assignment resolver for progression formulas.
- Use `derived_stat_definitions` and active bonuses for runtime derived/combat stats.
- Do not reintroduce `hero_derived` dependencies.

## Config governance status

Confirmed frontend/admin work currently includes D1–D6 and G1–G5. The current backlog position is G6: audit gameplay persistent changes.

D4/D5 scalar/json config governance rules remain:

- create draft change set with mandatory title/reason;
- trim-required validation for title/reason;
- public changelog requires title/body after trim;
- add value change entries without applying config values;
- scalar editor supports only `integer`, `decimal`, `boolean`, `string`, `json`;
- `entity_ref`, `formula_ref`, `enum_ref` are unsupported/hidden in this simple editor;
- `global_value_change` / `server_value_change` must not send `entityType/entityId`;
- value changes must not set `oldScope/newScope`;
- selected server changes must refresh effective values;
- metadata includes `oldSource` / `oldSourceLabel` where available.

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

## Update 2026-04-28 — U0 sanction/access, staff gameplay and moderation read contracts

This is the current semantic DB/RPC contract for U0 role/staff/moderation and sanction/access work. It is a curated contract registry for Codex, not a full table dump.

The live dump reflects the DB1–DB6 sequence completed for this area. Treat this U0 database layer as contract-complete for Codex-facing frontend work. Behavioral rollback tests were intentionally not completed here; future behavioral tests should use a proper sandbox/harness and are not a missing DB contract.

### Role/staff foundations

Existing foundations include:

- `roles` with stable global role `key` values;
- `server_staff_assignments` with `server_staff_role` values `owner`, `operator`, `moderator`, `tester`;
- `server_staff_assignment_scopes` linking moderator scopes to staff assignments;
- `staff_permission_scopes` as the DB dictionary for moderator/staff responsibility scopes;
- `server_memberships` with `server_membership_status` values `active`, `suspended`, `banned`;
- access helpers such as `has_global_role(...)`, `user_has_global_role(...)`, `has_server_staff_role(...)`, `can_manage_server_staff(...)`.

Global role is account-level capability. Server authority is server-scoped and should flow through `server_staff_assignments` and helper RPCs, not through assumptions that a global operator/moderator has authority everywhere.

### Staff scope dictionary

`staff_permission_scopes` defines configurable staff/moderator responsibility scopes. Initial active scope keys:

- `chat`
- `dm`
- `trade`
- `auction`
- `reports`
- `anti_abuse_triage`

`server_staff_assignment_scopes` assigns scope keys to a specific `server_staff_assignments` row. Current intended use is moderator scopes. Operator/admin authority comes from role/helper authority, not from assigned moderator scopes.

Codex must read labels/descriptions/helper text from DB dictionaries instead of hardcoding scope lists for UI.

### Staff assignment eligibility

Server staff assignment is guarded by DB/RPC logic:

- `assign_server_staff(...)` is the canonical audited mutation path.
- Frontend must not insert/update `server_staff_assignments` directly.
- User cannot be assigned staff on a standard server if the user has any hero on that server.
- Sandbox/testing contexts are exceptions for staff/test gameplay.
- User with staff-disqualifying history cannot be assigned server staff.
- Server ban anywhere is staff-disqualifying.
- Suspensions longer than `moderation_staff_disqualifying_suspension_days` are staff-disqualifying.

Canonical staff/user management RPC:

- `assign_global_role(p_user_id uuid, p_role_key text, p_reason text)`
- `assign_server_staff(p_server_id uuid, p_user_id uuid, p_role server_staff_role, p_reason text, p_notes text)`
- `revoke_server_staff(p_staff_assignment_id uuid, p_reason text)`
- `set_server_staff_permission_scopes(p_staff_assignment_id uuid, p_scope_keys text[], p_reason text)`

Rules:

- reason is mandatory for staff/global role mutations;
- global role assignment is admin-only;
- server operators may only assign moderator staff where allowed;
- direct writes to `user_data.role_id` and `server_staff_assignments` are not valid frontend paths.

### Staff gameplay block / normal gameplay access

Normal staff should not play normal gameplay on production-like standard servers where they are assigned staff. Sandbox/test servers are exceptions.

Canonical helper contracts:

- `hero_is_staff_gameplay_blocked(...)`
- `hero_can_use_normal_gameplay(...)`
- `get_hero_normal_gameplay_block_reason(...)`
- `assert_hero_can_use_normal_gameplay(...)`

Future persistent gameplay RPCs should call `assert_hero_can_use_normal_gameplay(...)` before mutating normal gameplay state.

Safe exits and cleanup paths such as cancellation, rejection, expiry and unlock/refund cleanup must not be blocked solely because a user is restricted.

### Sanctions and runtime access

Moderation actions are server-scoped historical/decision records. Runtime access is enforced through helper functions, triggers, and `server_memberships.status`.

- `trade_restriction` blocks player direct-trade participation.
- `auction_restriction` blocks auction participation.
- `server_suspension` and `server_ban` synchronize into `server_memberships.status` for fast runtime access checks.
- `server_memberships.moderation_block_*` columns preserve the moderation action link, reason, expiry and sync timestamp.
- Future market mutations should use `assert_hero_can_use_player_trade_runtime(...)` / `assert_hero_can_use_player_auction_runtime(...)`.

### Moderation action model

The database has a contract-complete foundation for server-scoped moderation actions:

- local warnings;
- account warnings within a server;
- trade/auction restrictions;
- server suspensions;
- server bans;
- scoped moderation action visibility;
- full-history admin/operator moderation action visibility.

Moderators may apply light/local actions in assigned scopes. Operators/admins handle heavy sanctions, appeals, CP penalties and severe punishments.

Canonical read contracts:

- moderator/scoped UI: `get_visible_moderation_actions(...)`;
- admin/operator full action history: `get_full_user_moderation_history(...)`, `get_full_hero_moderation_history(...)`;
- moderation target autocomplete/search: `search_moderation_user_targets(...)`, `search_moderation_hero_targets(...)`.

Moderation target picker/search contracts:

- `can_search_moderation_targets(p_server_id uuid)` -> boolean. Checks whether the authenticated user may use server-scoped moderation target search. Admin/operator/full server staff can search; scoped moderators with at least one active scope can search without receiving full-history authority.
- `search_moderation_user_targets(p_server_id uuid, p_query text, p_limit integer)` -> account/user target autocomplete. Returns `user_id`, human display name, email only where policy allows, primary hero id/name, visible-history flag, match kind, and technical label.
- `search_moderation_hero_targets(p_server_id uuid, p_query text, p_limit integer)` -> hero target autocomplete. Returns `hero_id`, hero name, owning user id/display name, email only where policy allows, visible-history flag, match kind, and technical label.

Rules for moderation target search:

- these RPCs are the canonical read models for moderation action/history target pickers;
- they are server-scoped and require `can_search_moderation_targets(p_server_id)`;
- they do not read `auth.users`;
- they reject/return no broad results for empty or too-short queries;
- minimum query length is 2 characters unless query is UUID-like;
- email search and email return are limited to full-history authority via `can_read_full_moderation_history(p_server_id)`;
- scoped moderators can search by account display name and hero name, but should not receive email;
- `has_visible_moderation_history` means the current actor can see at least one matching moderation action through `can_read_moderation_action(...)`; it must not be treated as proof of all hidden/full history;
- `search_server_staff_candidates(...)` must not be reused for moderation target search because it has staff-management semantics and permissions.

Legacy combined moderation-history RPCs were removed:

- `get_user_moderation_history(...)` removed;
- `get_hero_moderation_history(...)` removed.

Codex must not reintroduce those names or create frontend fallbacks to them.

### Explicit anti-abuse permission model

Future G5/H UI should prefer explicit helpers:

- `can_triage_anti_abuse(...)` / `assert_can_triage_anti_abuse(...)`;
- `can_decide_anti_abuse(...)` / `assert_can_decide_anti_abuse(...)`;
- `can_manage_anti_abuse_sanctions(...)` / `assert_can_manage_anti_abuse_sanctions(...)`.

Broad compatibility helper `can_manage_anti_abuse(...)` may still exist, but new UI/domain code should use explicit helpers where relevant.

### RLS/read-model direction

`moderation_actions` RLS is enabled.

Current policy direction:

- global admin can manage;
- admin/operator can select full history;
- scoped moderator selection is constrained by `scope_key` and moderator scope helper logic;
- targets can read their own targeted actions where policy allows.

UI should prefer RPC/read contracts above instead of direct table reads for staff/moderation surfaces.

### Grant expectations

Functions/RPCs in this U0 surface should not expose `PUBLIC`/`anon` execute. Current expected grants are `authenticated`, `postgres`, and `service_role` only unless a future migration intentionally says otherwise.

### Codex implications

Before implementing U0/H frontend tasks, Codex must:

- regenerate and use current `database.types.ts` after schema/RPC changes;
- use DB dictionaries (`staff_permission_scopes`, `moderation_action_types`, etc.) for labels/options;
- use explicit G5 permission helpers for future anti-abuse UI;
- use `get_visible_moderation_actions(...)` for moderator-facing moderation UI;
- use `get_full_user_moderation_history(...)` / `get_full_hero_moderation_history(...)` for admin/operator full moderation action history;
- use `search_moderation_user_targets(...)` and `search_moderation_hero_targets(...)` for moderation target picker/autocomplete;
- do not use `search_server_staff_candidates(...)` for moderation target search;
- use dedicated G5 RPC/services for anti-abuse cases, sanctions and CP penalties;
- use `hero_can_use_normal_gameplay(...)` / `get_hero_normal_gameplay_block_reason(...)` / `assert_hero_can_use_normal_gameplay(...)` for normal gameplay access;
- use `assert_hero_can_use_player_trade_runtime(...)` and `assert_hero_can_use_player_auction_runtime(...)` for future market mutations;
- never reintroduce `get_user_moderation_history(...)` or `get_hero_moderation_history(...)`.

### Remaining work outside DB contract

The DB contract for the U0 sanction/access layer is complete for Codex-facing frontend work.

Remaining work is frontend/application integration, not missing DB contract:

- route/sidebar/admin shell guards;
- staff gameplay blocked notice and player-route guard wiring;
- user/staff management UI;
- moderator scope assignment UI;
- moderation action/history UI;
- G5 UI migration from broad `can_manage_anti_abuse(...)` toward explicit permission helpers where relevant.

## Verified live DB function/RPC inventory — 2026-04-28

This section is based on live database inventory/dump verification against schema `public`.

Operational rule:
- Codex must not invent new RPC names, migrations, or database workflow functions when a needed DB contract is missing.
- If a needed function/RPC is not listed here and is not present in generated database types, the implementation task is blocked by missing database contract.
- New database RPCs are designed in the conceptual/database track first, then implemented through an approved migration, then documented here and regenerated into `database.types.ts`.

### Config governance functions currently present

Current config helper functions:
- `get_server_config_integer(uuid, text, integer)` → reads a server config value by config key with integer fallback.
- `get_server_config_boolean(uuid, text, boolean)` → reads a server config value by config key with boolean fallback.

Current D5 config change-set workflow RPCs:
- `mark_config_change_set_ready(uuid)` → returns `config_change_sets`; marks a draft change set as ready after DB-side validation.
- `apply_config_change_set(uuid)` → returns `config_change_sets`; atomically applies a ready change set. D5 supports scalar/json `global_value_change` and `server_value_change` entries only.
- `cancel_config_change_set(uuid, text)` → returns `config_change_sets`; cancels a draft/ready change set and requires an explicit cancellation reason.

Current internal config workflow helpers:
- `validate_config_change_set_entries_for_d5(uuid)` → validates D5-supported entries before mutation.
- `apply_global_config_value_change_entry(config_change_entries, uuid)` → internal helper for one `global_value_change` entry.
- `apply_server_config_value_change_entry(config_change_entries, uuid)` → internal helper for one `server_value_change` entry.

D5 operational rules:
- Frontend must use the RPCs above as a thin client; it must not directly mutate `global_config_values` or `server_config_values`.
- Codex must not invent new config governance RPC names or migrations. If a needed DB workflow is not listed here, the task is DB-blocked until the conceptual/database track designs and applies it.
- D5 currently supports only scalar/json value changes. Relational/entity changes remain blocked until a dedicated `entity_field_change` workflow exists.
- `cancel_config_change_set` requires `p_cancelled_reason`; the original change-set `reason` explains why a change was proposed, while `cancelled_reason` explains why it was abandoned.

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
- Config governance create/add/ready/apply/cancel workflow RPCs own their DB-side audit writes where available.
- Frontend code must not call low-level audit helpers directly after governed config mutations.

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

Known helper/RPC functions:

- `get_server_config_integer(server_id, config_key, fallback)`
- `get_server_config_boolean(server_id, config_key, fallback)`
- `mark_config_change_set_ready(p_change_set_id uuid)`
- `apply_config_change_set(p_change_set_id uuid)`
- `cancel_config_change_set(p_change_set_id uuid, p_cancelled_reason text)`

Config values should not be hardcoded where server/product balance says they are governed.

Config change sets preserve:

- title;
- reason;
- status;
- changelog visibility;
- requested/applied/cancelled user;
- `ready_by` / `ready_at`;
- `cancelled_reason`;
- timestamps.

D5 apply/cancel rules:

- apply/cancel/ready are database-owned workflow operations, not frontend write sequences;
- `apply_config_change_set` is atomic and supports only `global_value_change` and `server_value_change` for scalar/json definitions;
- `server_config_values.locked_at` must be respected;
- server value source is derived from `config_definitions.governance_scope`;
- unsupported change kinds such as `entity_field_change` remain blocked until a dedicated workflow is designed.

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

---

## Update 2026-04-29 — U0 staff candidate search and UX explainability DB contracts

This section documents the DB/RPC contracts added after the U0 sanction/access work, so Codex can build staff-management and admin explainability UI without client-side broad reads or hardcoded labels.

### Staff candidate search RPC

`search_server_staff_candidates(p_server_id uuid, p_query text, p_limit integer)` is the canonical DB-side read model for user/staff candidate search in staff management UI.

Purpose:

- replace frontend fetching broad `user_data` pools and filtering client-side;
- avoid Angular reads from `auth.users`;
- keep candidate search server-scoped;
- expose only limited fields needed for staff assignment UI;
- return DB-computed eligibility flags using the same DB-side rules as staff assignment.

Return model includes:

- `user_id`
- `display_name`
- `email`
- `global_role_key`
- `existing_staff_assignment_id`
- `existing_staff_role`
- `has_hero_on_server`
- `has_staff_disqualifying_history`
- `is_existing_staff_on_server`
- `is_eligible_for_server_staff`
- `eligibility_reason`

Rules:

- requires `can_manage_server_staff(p_server_id)`;
- does not read `auth.users`;
- does not return broad unfiltered results;
- short/empty search queries should not become a broad user list;
- frontend should map `eligibility_reason` through DB metadata / human-readable UI, not display raw keys as primary text.


### Moderation target search RPCs

U0-I9 moderation history/action UI must not require humans to type raw UUIDs for account/user or hero targets. The database now provides canonical server-scoped target-search RPCs for autocomplete/lazy target pickers.

Contracts:

- `can_search_moderation_targets(p_server_id uuid)` -> boolean. Returns whether the current authenticated user may use moderation target search for the server.
- `search_moderation_user_targets(p_server_id uuid, p_query text, p_limit integer)` -> table with:
  - `user_id`
  - `display_name`
  - `email`
  - `primary_hero_id`
  - `primary_hero_name`
  - `has_visible_moderation_history`
  - `match_kind`
  - `technical_label`
- `search_moderation_hero_targets(p_server_id uuid, p_query text, p_limit integer)` -> table with:
  - `hero_id`
  - `hero_name`
  - `user_id`
  - `user_display_name`
  - `email`
  - `has_visible_moderation_history`
  - `match_kind`
  - `technical_label`

Rules:

- these RPCs are for moderation action/history target pickers, not staff assignment;
- `search_server_staff_candidates(...)` remains staff-management-only and must not be reused for moderation target search;
- no frontend read from `auth.users`;
- no broad client-side fetch from `user_data` or `hero`;
- queries are server-scoped;
- empty or too-short queries return no broad result set;
- minimum query length is 2 characters unless query is UUID-like;
- primary UI labels should use `display_name`, `primary_hero_name`, `hero_name`, and `user_display_name`;
- UUIDs belong in secondary technical metadata only;
- `email` may be null for scoped moderators because email search/return requires full-history authority;
- `has_visible_moderation_history` is actor-visible history only, not a full hidden-history indicator.

Known eligibility reason keys:

- `already_staff_on_server`
- `staff_disqualifying_history`
- `has_hero_on_standard_server`

### UI metadata registry

`ui_metadata_entries` is the canonical DB-backed metadata registry for enum-like keys, reason keys, config scope names, preview kinds and other technical values that may appear in admin/staff/config UI.

Core columns:

- `namespace`
- `key`
- `label`
- `description`
- `helper_text`
- `impact_summary`
- `warning_text`
- `ui_group_key`
- `ui_group_label`
- `sort_order`
- `is_active`
- `metadata_json`

Canonical read RPC:

- `get_ui_metadata_entries(p_namespace text, p_keys text[], p_include_inactive boolean)` → returns `ui_metadata_entries`.

Current seeded namespaces include:

- `config_governance_scope`
- `config_change_kind`
- `config_change_status`
- `config_change_visibility`
- `config_value_type`
- `server_config_value_source`
- `gameplay_block_reason`
- `staff_candidate_eligibility_reason`
- `ui_preview_kind`
- `config_managed_entity_type`
- `config_applies_to_kind`
- `config_effective_value_source`

Rules:

- frontend should use this registry instead of hardcoding configurable enum/key labels;
- raw technical keys may be visible as secondary metadata, but must not be the only explanation when metadata exists;
- `metadata_json` must remain lightweight and must not replace relational domain systems;
- labels/descriptions seeded during this work may be Polish-first until a proper localization layer exists.

### Config definition UI metadata

`config_definition_ui_metadata` stores per-config-definition admin explainability metadata.

Purpose:

- avoid hardcoding config helper text and impact descriptions in Angular;
- describe the admin/operator meaning of a concrete `config_definitions` row;
- tell UI which preview family to use;
- group config definitions for readable admin panels.

Core columns:

- `config_definition_id`
- `admin_label_override`
- `admin_description_override`
- `helper_text`
- `gameplay_impact_summary`
- `change_warning`
- `preview_kind`
- `ui_group_key`
- `ui_group_label`
- `sort_order`
- `metadata_json`

Canonical read RPC:

- `get_config_definition_ui_metadata(p_config_definition_id uuid, p_managed_entity_key text, p_include_inactive boolean)`.

Current preview kind keys include:

- `none`
- `scalar`
- `json`
- `formula`
- `item_quality`
- `building_progression`
- `bonus`
- `requirement`
- `anti_abuse_threshold`

### Canonical config explainability read model

`get_config_definition_explainability(p_server_id uuid, p_managed_entity_key text, p_include_inactive boolean)` is the canonical DB-backed read model for config governance explainability UI.

It combines:

- `config_definitions`;
- `config_definition_ui_metadata`;
- UI metadata for managed entity type, governance scope, value type, preview kind, applies-to kind, effective value source and expected change kind;
- effective scalar/json value where applicable;
- source explanation for server/global/default/missing values;
- expected change kind for UI/workflow guidance.

Frontend should use this read model for config definitions/change-entry explainability instead of reconstructing scope semantics through Angular switch statements.

Important semantics:

- `server_required` means selected server context is required before showing an effective server-scoped value;
- `not_value_config` means the definition governs a relational system and should use a dedicated read model/preview instead of pretending to be a scalar/json value;
- `selected_server_id` is populated only for server-scoped applies-to kinds when a server id was supplied.

### Admin preview input contracts

`get_admin_preview_contracts()` lists canonical preview contract names for UI routing.

Current preview contract RPCs:

- `get_item_quality_impact_preview(p_base_value numeric, p_bonus_value numeric)`
- `get_building_progression_preview(p_building_id uuid, p_district_code text, p_from_level integer, p_to_level integer)`
- `get_bonus_impact_preview(p_entity_type text, p_entity_id uuid, p_quality_key text)`
- `get_requirement_impact_preview(p_entity_type requirement_entity_type, p_entity_id uuid)`

Rules:

- item quality preview reads active `item_generation_qualities`; UI must not hardcode quality rows;
- bonus preview joins semantic `bonus_templates`, bonus dictionaries and `entity_bonuses`;
- bonus quality scaling applies only to value when `quality_scales_value = true`;
- quality never scales `level_interval`;
- building preview shows district availability, effective cap, cap source and `0 = unlimited` semantics;
- requirement preview uses central `requirement_definitions` and `entity_requirements`, not legacy `building_requirements` or `buildings.requirements` JSON.

### Codex implications

For UX/admin/config explainability work, Codex must:

- use `get_ui_metadata_entries(...)` for key/enum/reason labels when available;
- use `get_config_definition_explainability(...)` for config governance screens;
- use `get_config_definition_ui_metadata(...)` when only per-definition metadata is needed;
- use `get_admin_preview_contracts()` and the preview RPCs above for preview input data;
- not hardcode gameplay/config dictionaries in Angular when DB metadata exists;
- keep raw keys as secondary technical metadata only;
- keep JSON collapsed/constrained and never as the only explanation;
- regenerate `database.types.ts` after these schema/RPC changes before implementing affected frontend work.

---

# Update 2026-04-30 — Epic K/L database registry

# Epic K identity observations and same-IP/device signals

Epic K has DB/backend foundation for privacy-limited identity observations and review-only same-IP/device signals.

## Identity observations

Table:

- `anti_abuse_identity_observations`

Purpose:

- stores privacy-limited anti-abuse identity observations;
- uses hashes only, not raw IP;
- supports `ip_hash`, `ip_prefix_hash`, `user_agent_hash`, `device_token_hash`;
- stores `observed_at` and `retention_until`;
- RLS enabled; direct frontend writes are not allowed.

Canonical write path:

- `record_anti_abuse_identity_observation(...)` — service-role-only RPC, called by trusted Supabase Edge Function/backend.

Cleanup:

- `purge_expired_anti_abuse_identity_observations(p_limit integer)` — service-role-only cleanup RPC.

Rules:

- Angular must not insert identity observations directly;
- Edge Function hashes identity material with `IDENTITY_HASH_PEPPER`;
- raw IP is not stored by default;
- identity observations are review signals only and are not punishment evidence by themselves.

## Identity signal generation

Functions:

- `insert_identity_anti_abuse_signal(...)` — internal/service-role helper;
- `generate_identity_observation_anti_abuse_signals(p_observation_id uuid, p_min_distinct_users integer, p_lookback_hours integer)`;
- `trigger_generate_identity_observation_anti_abuse_signals()`;
- `generate_trade_transaction_identity_anti_abuse_signals(p_transaction_id uuid, p_lookback_hours integer)`;
- `trigger_generate_trade_transaction_identity_anti_abuse_signals()`.

Triggers:

- `trg_generate_identity_observation_anti_abuse_signals` on `anti_abuse_identity_observations`;
- `trg_generate_trade_transaction_identity_anti_abuse_signals` on `player_trade_transactions`.

Signal types:

- `same_ip_login`;
- `same_device_multiple_accounts`;
- `same_ip_trade`.

Edge Function:

- deployed function name: `record-identity-observation`;
- file path in repo: `supabase/functions/record-identity-observation/index.ts`;
- rows appear only after function invocation with authenticated JWT.

# Epic L PvE exploration / trials / rewards DB foundation

Epic L DB foundation is partially implemented through applied migrations **L-DB1..L-DB4b**. Preview/simulation RPCs remain pending as **L-DB4c**.

## L-DB1 — dictionaries, formulas, rewards

Current tables added/seeded:

- `exploration_difficulty_tiers` — seeded `easy`, `medium`, `hard`; includes `trial_opportunity_step_cap` where `0` means no guaranteed trial opportunity step.
- `exploration_minigame_definitions` — seeded `combat` as prototype/default minigame.
- `trial_definitions` — one active standard trial per canonical base stat; active trials are selected equally.
- `encounter_definitions` — supported `encounter_kind`: `combat`, `resource`, `buff`, `debuff`; `nothing` is a step outcome, not an encounter definition.
- `encounter_description_variants`.
- `exploration_location_descriptions`.
- `trial_manifestation_cap_profiles` — flat `difficulty × district` cap matrix.
- `exploration_effect_definitions`.
- `reward_profiles`.
- `reward_profile_entries`.
- `reward_profile_assignments`.
- `reward_grants`.
- `reward_grant_entries`.

Formula targets added:

- `daily_trial_limit`;
- `exploration_step_duration`;
- `trial_opportunity_chance`;
- `trial_manifestation_chance`;
- `exploration_challenge_auto_resolve_success_chance`.

Reward rules:

- `experience` reward grants equal Character Points automatically;
- standalone Character Points require explicit `character_points` reward entry;
- item generation reward uses `min_item_count`, `max_item_count`, `max_quality_key`, optional `bucket_profile_id`;
- `bucket_profile_id = null` means use default/global bucket profile;
- reward grants prevent double payout.

## L-DB2 — runtime tables

Current tables:

- `hero_daily_action_counters` — `action_kind in ('trial', 'attack')`.
- `hero_explorations` — one runtime graph per hero/date/difficulty; contains `current_node_id`, `trial_dry_step_count`, `district_code`, status.
- `hero_exploration_nodes` — graph nodes with `created_sequence`, `distance_from_root`, optional `description_id`.
- `hero_exploration_edges` — graph edges with nullable `to_node_id`; null means undiscovered branch.
- `hero_exploration_steps` — DB-backed step timers and lightweight roll/evidence footprint.
- `hero_exploration_effects` — one active exploration buff/debuff per exploration.
- `hero_exploration_challenge_attempts` — manifested trials and combat encounters requiring manual/auto/admin resolution.

Runtime state tables have RLS enabled and are intended to be used through RPCs/domain workflows, not direct Angular writes.

## L-DB3a — bootstrap/start/read RPCs

Current functions:

- `get_current_exploration_date()`;
- `assert_can_use_hero_exploration(p_hero_id uuid, p_operation text)`;
- `get_default_daily_action_limit(p_hero_id uuid, p_action_kind text)`;
- `ensure_hero_daily_action_counter(p_hero_id uuid, p_action_kind text, p_action_date date)`;
- `create_default_exploration_edges(p_exploration_id uuid, p_node_id uuid)`;
- `start_or_get_hero_exploration(p_hero_id uuid, p_difficulty_key text)`;
- `get_hero_exploration_state(p_hero_id uuid, p_difficulty_key text)`;
- `start_hero_exploration_step(p_exploration_id uuid, p_edge_id uuid, p_step_kind text)`.

Current fallback behavior:

- daily trial limit falls back to `20` until formula-backed runtime is wired;
- step duration uses difficulty multiplier fallback until formula-backed runtime is wired.

## L-DB3b — step resolution and outcome rolls

Current functions/helpers:

- `get_hero_current_district_code(p_hero_id uuid)`;
- `get_hero_base_stat_value(p_hero_id uuid, p_stat_key text)`;
- `get_hero_exploration_luck_value(p_hero_id uuid)` — currently returns `0` until canonical DB-side derived Luck resolver exists;
- `get_exploration_manual_resolution_seconds()` — fallback 5 minutes;
- `get_trial_opportunity_chance(p_exploration_id uuid)`;
- `get_trial_manifestation_chance(p_exploration_id uuid, p_trial_definition_id uuid)`;
- `get_non_trial_encounter_chance(p_exploration_id uuid)` — fallback 60%;
- `pick_random_trial_definition()`;
- `pick_random_encounter_definition(p_exploration_id uuid)`;
- `consume_active_exploration_effect(p_exploration_id uuid, p_consumed_by_kind text, p_consumed_by_id uuid)`;
- `resolve_hero_exploration_step(p_step_id uuid)`.

Step resolution rules:

- known path and backtracking cost time but do not roll outcome;
- unknown discovery creates node, connects edge, moves hero;
- discovery checks trial opportunity first;
- if no trial opportunity, rolls encounter/nothing;
- trial opportunity consumes one daily trial and resets dry step count;
- manifestation fail creates failed challenge attempt and grants no reward;
- manifested trial and combat encounter create awaiting `hero_exploration_challenge_attempts`.

## L-DB3c — rewards and challenge completion

Current functions:

- `apply_reward_character_points_delta(...)`;
- `apply_reward_resource_delta(...)`;
- `pick_reward_item_quality_key(p_max_quality_key text)`;
- `compute_reward_item_budget(p_bucket_profile_id uuid)`;
- `generate_reward_item_for_hero(...)`;
- `grant_reward_profile_to_hero(...)`;
- `find_reward_profile_for_challenge(p_challenge_attempt_id uuid, p_success boolean)`;
- `complete_hero_exploration_challenge_attempt(...)`;
- `get_challenge_auto_resolve_success_chance(p_challenge_attempt_id uuid)`;
- `auto_resolve_hero_exploration_challenge_attempt(...)`.

Rules:

- reward grants prevent double payout;
- successful trial fallback uses `trial_success_basic` if no more specific assignment exists;
- failure gives no reward unless future explicit assignment logic adds one;
- generated item rewards insert real rows into `items`;
- `items.metadata_json` stores reward-generated context.

## L-DB4a — sandbox/admin helpers

Current functions:

- `assert_can_use_exploration_test_tools(p_server_id uuid, p_operation text)`;
- `assert_hero_belongs_to_server(p_hero_id uuid, p_server_id uuid)`;
- `get_hero_exploration_debug_state(p_server_id uuid, p_hero_id uuid, p_exploration_date date)`;
- `add_hero_remaining_actions(p_server_id uuid, p_hero_id uuid, p_action_kind text, p_amount integer, p_reason text, p_action_date date)`;
- `reset_hero_exploration(p_server_id uuid, p_hero_id uuid, p_difficulty_key text, p_reason text, p_exploration_date date)`;
- `skip_hero_exploration_step_timer(p_server_id uuid, p_step_id uuid, p_reason text)`;
- `test_grant_reward_profile_to_hero(p_server_id uuid, p_hero_id uuid, p_reward_profile_id uuid, p_reason text)`.

## L-DB4b — forced outcome/challenge testing

Current table:

- `hero_exploration_test_overrides`

Current functions:

- `set_next_hero_exploration_outcome_override(...)`;
- `consume_next_hero_exploration_outcome_override(p_exploration_id uuid, p_step_id uuid)`;
- `force_complete_hero_exploration_challenge_attempt(...)`;
- `resolve_hero_exploration_step(...)` has been replaced with override-aware resolution.

Rules:

- forced outcome kinds: `trial_opportunity`, `encounter`, `nothing`;
- trial override can force a concrete `trial_definition_id` and manifestation success/fail;
- encounter override can force a concrete `encounter_definition_id`;
- overrides expire and are consumed by step resolution;
- challenge force-complete uses normal completion path, so success still grants rewards.

## Pending L-DB4c — preview/simulation RPCs

Not yet applied in the database.

Next migration should be split into small safe chunks and add preview/simulation RPCs for:

- trial opportunity curve preview;
- trial manifestation preview;
- auto-resolve preview;
- reward profile preview;
- generated item preview without inserting into `items`;
- multi-run trial opportunity/manifestation simulation.

Codex/frontend must not assume these functions exist until present in live schema/generated types.
