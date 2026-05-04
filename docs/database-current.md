# Mythsworn — Database Current Notes

Updated: 2026-05-03 late

This file is the curated semantic index of the current database state. It is not a full `pg_dump`.

If this file conflicts with the actual database, generated Supabase types, or a newer explicit user instruction, prefer:

1. explicit user instruction,
2. current database schema / migrations / dump,
3. generated `database.types.ts`,
4. `current-decisions.md`,
5. this file.

After every schema/RPC migration that Codex will consume, regenerate/update generated Supabase types before frontend work.


## Update 2026-05-03 late — Epic Q completed and Epic R/PvP Foundation DB state

### Epic Q — Notifications foundation

Current notification DB/RPC foundation now includes:

- hardened RLS/grants for `notification_types` and `notifications`;
- internal `create_notification(...)` helper limited away from frontend roles;
- owner-safe read RPCs:
  - `get_my_notifications(...)`;
  - `get_my_notification_unread_count(...)`;
  - `get_my_staff_notifications(...)`;
  - `get_my_staff_notification_unread_count(...)`;
- owner-safe action RPCs:
  - `mark_notification_read(...)`;
  - `dismiss_notification(...)` — dismiss also marks read;
- building completion notification hook:
  - `estate.building_job.completed` notification type;
  - `finalize_completed_estate_building_jobs(...)` creates DB-owned hero notification rows when building jobs are finalized;
- DB metadata namespaces:
  - `notification_center_section`;
  - `notification_staff_center_section`;
  - `notification_type_admin_section`;
  - `notification_hook_diagnostics_section`.

Rules:

- Frontend must not insert, update or delete notification rows directly.
- Frontend must not call `create_notification(...)`.
- Reports have their own inbox/unread state and are not default notifications.

### Epic N / O follow-up fixes

Current DB/RPC follow-up fixes include:

- `save_stat_allocation(...)` uses `ON CONFLICT ON CONSTRAINT hero_stats_pkey` and no longer trips over ambiguous `hero_id` output parameters.
- `get_hero_experience_to_next_level(...)` is executable by authenticated users for XP/level display.
- Progression diagnostics/configurator metadata was extended for formula targets, XP/CP, level-up rewards and stat bonus rules.
- `search_building_targets(...)` and `search_building_targets_page(...)` now expose `base_build_time_seconds` instead of legacy `base_build_time_minutes` in return signatures and bodies.

Regenerate generated Supabase types before Codex repeats O1 or consumes these RPC signatures in Angular.

### Pre-PvP cleanup

- `player_relationship_declaration_types` now includes `mercenary_contract`:
  - category `pvp`;
  - requires amount;
  - requires expiration;
  - min participants 2;
  - max participants null;
  - CP-only declared payment context by design.
- `hero_equipment` grants/RLS were hardened:
  - `anon`: no access;
  - `authenticated`: SELECT only through `can_read_hero(hero_id)`;
  - `service_role`: full;
  - no direct frontend mutation. Full equip/unequip workflow belongs to the future item/equipment epic.

### R-AA — Relationship/anti-abuse context foundation

Current helper/index state:

- `get_hero_pair_relationship_declaration_context(...)`:
  - internal/service-only;
  - returns active/pending declaration context for a hero pair;
  - includes `mercenary_contract` and other relationship/economy context declarations;
  - does not suppress signals and does not decide legitimacy.
- Indexes exist for declaration context lookup on declarations and participants.
- `insert_trade_transaction_anti_abuse_signal(...)` enriches trade/auction signal metadata with:
  - `relationshipContext`;
  - `hasRelationshipContext`;
  - `hasMercenaryContract`.
- `insert_trade_transaction_anti_abuse_signal(...)` is hardened as service-only.

### R-DB1/R-DB1b — Central runtime activity foundation

Current tables/dictionaries:

- `hero_runtime_activity_kinds`:
  - `exploration` active;
  - `pvp_attack` active;
  - `pvp_spy` active;
  - `siege` inactive/future.
- `hero_runtime_activity_statuses`:
  - blocking: `active`, `resolving`;
  - terminal: `completed`, `cancelled`, `failed`, `expired`.
- `hero_runtime_activities`:
  - central one-blocking-activity-per-hero lock;
  - frontend read-only through RLS and `get_hero_active_runtime_activity(...)`.

Current helpers:

- `hero_has_blocking_runtime_activity(...)` internal/service-only;
- `assert_hero_can_start_runtime_activity(...)` internal/service-only;
- `start_hero_runtime_activity(...)` internal/service-only;
- `finish_hero_runtime_activity(...)` internal/service-only;
- `finish_hero_runtime_activity_by_source(...)` internal/service-only;
- `get_hero_active_runtime_activity(...)` owner-safe authenticated read RPC.

Exploration integration:

- `sync_hero_exploration_runtime_activity()` trigger helper exists.
- `hero_explorations` INSERT and status update triggers sync active/exhausted/completed/abandoned/archived state into `hero_runtime_activities`.

### R-DB2 — PvP config/formula/dictionary foundation

Current dictionary:

- `pvp_action_kinds`:
  - `attack` active, travel, creates runtime activity, creates combat;
  - `spy` active, travel, creates runtime activity, creates spy result;
  - `siege` inactive/future.

Current formula targets/default assignments:

- `pvp_attack_min_target_level`;
- `pvp_attack_max_target_level`;
- `pvp_attack_travel_time_seconds`;
- `pvp_spy_travel_time_seconds`;
- `pvp_manual_fight_window_seconds`;
- `pvp_target_protection_seconds`;
- `pvp_resource_steal_percent`;
- `pvp_attacker_defeat_resource_loss_percent`;
- `pvp_xp_reward`;
- `pvp_prestige_delta_context`.

Current metadata namespace:

- `pvp_configurator_section`.

### R-DB3 — PvP target eligibility and protection foundation

Current objects:

- `pvp_target_protections` internal/service-only table;
- `calculate_pvp_estate_distance_score(...)` internal/service-only helper;
- `get_pvp_target_candidates(...)` owner-safe authenticated RPC.

`get_pvp_target_candidates(...)` returns occupied estate targets on the attacker's server with:

- target hero/address/district/level;
- distance score;
- formula-backed attack/spy travel preview;
- level range;
- protection state;
- attacker busy state;
- `can_attack` / `can_spy` and reason keys.

### R-DB4 — PvP jobs/travel/protection runtime

Current objects:

- `pvp_action_statuses` with blocking statuses `travelling`, `arrived`, `manual_window`, `resolving`, and terminal statuses `resolved`, `cancelled`, `failed`, `expired`.
- `pvp_actions` internal runtime table.
- `expire_pvp_target_protections(...)` internal/service-only helper.
- `start_pvp_action(...)` owner-safe authenticated RPC.

Rules:

- `start_pvp_action(...)` supports active action kinds `attack` and `spy`.
- `attack` creates a `pvp_actions` row, a central `hero_runtime_activities` row and a `pvp_target_protections` row immediately.
- `spy` creates a `pvp_actions` row and a central `hero_runtime_activities` row, but no target protection.
- No combat/spy result/report/notification is produced by R-DB4.

Positive smoke for start attack/spy was not possible in the conversation because the known test server had no second hero with an estate.

### R-DB5 — PvP spy result snapshot foundation

Current objects:

- `pvp_spy_results` durable spy result table.
- Internal/service-only snapshot helpers:
  - `build_pvp_spy_equipment_snapshot(...)`;
  - `build_pvp_spy_base_stats_snapshot(...)`;
  - `build_pvp_spy_resource_snapshot(...)`;
  - `build_pvp_spy_estate_snapshot(...)`;
  - `build_pvp_spy_buildings_snapshot(...)`;
  - `build_pvp_spy_derived_combat_stats_placeholder(...)`.
- `create_pvp_spy_result_from_action(...)` internal/service-only helper.
- `get_my_pvp_spy_result(...)` owner-safe authenticated read RPC.

Rules:

- Spy result snapshots equipment, base stats, resources, estate and building state.
- Derived combat stat values must come from the runtime derived/combat resolver integration; `hero_derived` is not a source of truth.
- Current derived combat stats placeholder records definition context and `heroDerivedUsed = false`.

### Next DB work

The next migration should be **R-DB6 — PvP attack result / attack resolution boundary**, but it was not applied in the previous conversation. Re-read current dump and generated types before writing/running it.

## Update 2026-05-03 — L11/L12/M12 UI metadata and Epic N progression DB/RPC foundation

### UI metadata content seeds

The DB now has/should be treated as having DB-backed admin configurator section metadata for recently touched configurators:

- `encounter_configurator_section` / `encounter_configurator_field` for `/admin/exploration-encounters`;
- L12c alias rows for frontend-requested keys such as `page_header`, `kind_specific_payloads`, `encounter_key`, `minigame`, `min_difficulty`, `max_difficulty`, `min_district`, `max_district`, reward assignment reason/helper keys, combat candidate reason/weight keys, resource payload keys and effect payload keys;
- `trial_configurator_section` / `trial_configurator_field` for `/admin/exploration-trials`;
- L11c alias rows for frontend-requested keys such as `page_header`, `trial_meaning`, `trial_key`, `tested_stat`, `minigame`, `definition_reason`, reward assignment keys and combat candidate reason/weight keys;
- `combat_opponent_configurator_section` for M12 combat opponent admin/balancer UI.

These are content rows in `ui_metadata_entries`; they do not require type regeneration if the table and `get_ui_metadata_entries(...)` are already present in generated types.

Rule: section-level runtime meaning and impact should come from DB metadata where available. Basic field labels and validation copy may later be handled by i18n/refactor.

### Epic N progression DB/RPC foundation — current state

Epic N DB/RPC progression foundation has been implemented and should no longer be described as missing.

Current progression tables/read surfaces:

- `hero.level`;
- `hero.experience`;
- `hero.total_experience_earned`;
- `hero.character_points`;
- `hero.total_character_points_earned`;
- `character_point_ledger`;
- `character_point_penalties`;
- `hero_progression_ledger`;
- `reward_level_match_kinds`;
- `reward_profile_assignments` level matching fields:
  - `level_match_kind`;
  - `level_value`;
  - `max_level_value`;
  - `level_interval`;
- `level_up_stat_bonus_rules`;
- `level_up_stat_bonus_rule_stats`;
- `hero_level_stat_bonus_grants`.

Current progression formulas/helpers:

- formula target `hero_experience_to_next_level`;
- `get_hero_experience_to_next_level(...)`;
- `evaluate_balance_formula_target(...)`.

Current stat allocation RPC:

- `save_stat_allocation(...)`.

Current XP/progression RPCs/helpers:

- `grant_hero_experience(...)`;
- `apply_reward_character_points_delta(...)`;
- `apply_character_point_penalty_sink(...)`;
- `grant_reward_profile_to_hero(...)`;
- `find_best_level_up_reward_assignment(...)`;
- `grant_level_up_reward_to_hero(...)`;
- `apply_level_up_stat_bonuses_to_hero(...)`;
- `apply_hero_level_stat_bonus_grant(...)`.

Current admin/configurator RPCs for progression reward/stat-bonus configuration:

- `upsert_reward_profile_assignment(...)` supports N-DB2 level matching for `source_kind = level_up`;
- `upsert_level_up_stat_bonus_rule(...)`;
- `upsert_level_up_stat_bonus_rule_stat(...)`.

Current triggers:

- `hero_progression_ledger_level_up_reward_trigger`;
- `hero_progression_ledger_level_up_stat_bonus_trigger`.

Rules:

- `hero.experience` is current progress toward next level.
- `hero.total_experience_earned` is lifetime XP.
- `grant_hero_experience(...)` is the canonical XP/level-up workflow.
- XP always grants equal gross Character Points.
- Positive reward/progression CP gains flow through `apply_reward_character_points_delta(...)`, which applies the CP penalty sink.
- CP penalty sink consumes only newly granted CP from positive gains.
- `hero_progression_ledger` records experience gain and level-up rows.
- One level-up reached-level event selects one best matching reward assignment.
- Level-up reward profiles must not contain active experience entries.
- Level-up stat bonuses update base `hero_stats`.
- `hero_level_stat_bonus_grants` records before/after stat values.
- Multiple stat bonus rules may fire for the same reached level.
- Random stat bonus results are reportable through grant rows and metadata, not hidden as unstructured-only behavior.

Frontend/Codex implications:

- Regenerate generated Supabase types before consuming N schema/RPC additions in Angular.
- Frontend must not direct-write:
  - `hero_stats`;
  - `hero.character_points`;
  - `hero.experience`;
  - `hero.level`;
  - `character_point_ledger`;
  - `hero_progression_ledger`;
  - level-up reward/stat bonus grant tables.
- Frontend must use `save_stat_allocation(...)` for stat allocation saves.
- Concrete DB/RPC producer workflows should use `grant_hero_experience(...)` for XP grants.
- UI read/display work should map rows/RPC payloads into explicit domain models, not expose raw DB rows as final UI contracts.
- Older references saying that canonical XP/level-up workflow is missing are obsolete after N-DB0..N-DB4.

---

# Current DB/RPC contract updates

## Update 2026-05-02 — L-Reward-DB1/DB2/DB3 reward configuration foundation

The DB now has a governed, explainable reward configuration foundation for L12/L13.

### L-Reward-DB1 — reward profiles, entries and outcome kinds

Tables/read surfaces:

- `reward_outcome_kinds` — DB-backed runtime outcome vocabulary per `source_kind`;
- `reward_profiles` — reusable reward bundles;
- `reward_profile_entries` — individual grants inside a reward profile;
- `reward_profile_assignments` — routing from source/outcome/scope to one reward profile.

Admin/balancer RPCs:

- `upsert_reward_outcome_kind(...)`;
- `deactivate_reward_outcome_kind(...)`;
- `upsert_reward_profile(...)`;
- `deactivate_reward_profile(...)`;
- `upsert_reward_profile_entry(...)`;
- `deactivate_reward_profile_entry(...)`;
- `upsert_reward_profile_assignment(...)`.

Rules:

- RPCs require authenticated user context, config-governance permission and a non-blank reason.
- Angular must not direct-write reward configuration tables.
- `reward_outcome_kinds` is keyed by `(source_kind, key)`.
- Outcome key is a runtime-facing value, not a label slug. Adding an outcome kind does not make runtime emit it.
- `source_kind = test` is technical/admin/sandbox only, not player gameplay.

### L-Reward-DB2 — resource type dictionary

Tables/read surfaces:

- `resource_types` — DB-backed resource dictionary for `drachma`, `materials`, `workforce` and future resources.

RPCs:

- `upsert_resource_type(...)`;
- `deactivate_resource_type(...)`.

Foreign-key alignment now keeps these resource references dictionary-backed:

- `hero_resources.resource_type`;
- `hero_resource_ledger.resource_type`;
- `reward_profile_entries.resource_type`;
- `reward_grant_entries.resource_type`;
- `encounter_resource_payloads.resource_type`.

Frontend must use `resource_types` instead of fallback hardcoded resource lists.

### L-Reward-DB3 — assignment match semantics and formula reward amounts

Tables/read surfaces:

- `reward_assignment_match_kinds` — `any`, `exact`, `minimum`, `range`;
- `reward_entry_kinds` — `experience`, `character_points`, `resource`, `item_generation`, `exploration_effect`;
- `reward_entry_amount_modes` — `fixed`, `range`, `formula`, `transfer_formula`, `none`;
- `reward_source_kinds` — `trial`, `encounter`, `pvp`, `quest`, `event`, `level_up`, `test`.

`reward_profile_assignments` now includes:

- `difficulty_match_kind`;
- `difficulty_key`;
- `max_difficulty_key`;
- `district_match_kind`;
- `district_code`;
- `max_district_code`.

Rules:

- `any` means wildcard.
- `exact` means only the selected value.
- `minimum` means selected value and higher.
- `range` means from selected value to max selected value, inclusive.
- Active duplicate assignment scopes are blocked by a DB uniqueness guard.
- Reward lookup selects one best matching reward profile; it does not fire all matching assignments.
- Multiple rewards for one event belong as multiple `reward_profile_entries` inside one reward profile.
- `amount_mode = formula` is supported for numeric `experience`, `character_points`, and `resource` entries.
- Formula reward amounts are evaluated server-side through `evaluate_reward_profile_entry_amount(...)` and `grant_reward_profile_to_hero(...)`.
- `transfer_formula` is reserved for future PvP transfer workflows and is not a normal PvE reward amount mode.
- `complete_hero_exploration_challenge_attempt(...)` can grant a configured failure reward when a matching failure assignment exists. Missing failure assignment means no failure reward.

Formula target added/used:

- `reward_entry_amount` — DB-side formula target for numeric reward entry amount.

Default formula:

- `reward_entry_amount_scaled_by_difficulty` — `round(minAmount * difficultyRewardMultiplier)`.

Frontend/Codex implications:

- Regenerate generated Supabase types before L12c/L13 work that consumes these additions.
- L12c must explain reward assignment matching and one-profile selection in the encounter configurator.
- L13 must use the DB-backed dictionaries for source kind, outcome kind, entry kind, amount mode, match kind and resource type.
- Do not present `transfer_formula` as a normal PvE option.

---

## Update 2026-05-02 — M-Dict-DB1 combat explainability dictionaries

The DB now has DB-backed, Polish explainability dictionaries for combat enum-like concepts used by Epic M admin/sandbox/report-adjacent UI.

Tables/read surfaces:

- `combat_source_type_definitions` — labels/descriptions for `encounter`, `trial`, `pvp`, `sandbox`, `admin_test`;
- `combat_side_definitions` — labels/descriptions for `initiator`, `defender`;
- `combat_outcome_definitions` — labels/descriptions for `initiator_victory`, `defender_victory`, `draw`;
- `combat_participant_kind_definitions` — labels/descriptions for `hero`, `opponent`;
- `combat_attack_source_kind_definitions` — labels/descriptions for `natural`, `unarmed`, `player_item`, `opponent_manual`, `opponent_generated`;
- `combat_candidate_kind_definitions` — labels/descriptions for `opponent`, `family`;
- enriched `combat_opponent_equipment_mode_definitions`;
- enriched `equipment_slot_definitions`.

Rules:

- These dictionaries describe fixed runtime enum/contract values. Adding new runtime enum values still requires DB/runtime migration.
- UI must show dictionary `label`, `description`, `helper_text`, and `admin_description` where relevant.
- Raw enum keys may be shown as secondary metadata only.
- Missing or weak dictionary text should be reported as DB/content seed gap, not hidden with permanent hardcoded Angular copy.

Combat formula labels/descriptions are now Polish for admin explainability:

- `combat-initiative-score-default` / `Domyślna inicjatywa ataku`;
- `combat-opponent-scaled-stat-default` / `Domyślne skalowanie statystyki przeciwnika`.

Frontend/Codex implications:

- Regenerate generated Supabase types before Epic M frontend work.
- M0 must confirm these dictionary tables are visible.
- M4/M9/M10/M11/M12 should consume these dictionaries instead of raw enum labels.

---

## Update 2026-05-02 — Epic M readiness after DB/explainability preflight

Epic M has the required DB/RPC foundations for the currently planned frontend tasks:

- combat opponent admin write path exists;
- combat result snapshot persistence exists;
- combat explainability dictionaries exist;
- combat formula targets and default formulas exist;
- combat turn limit helper exists.

Known non-blocking content state:

- The database may contain zero `combat_opponent_families`, `combat_opponent_definitions`, `combat_opponent_stat_values`, `combat_opponent_attack_sources`, and `combat_opponent_equipment_entries`.
- This is not a schema/RPC blocker. M12 must support empty state and allow creating the first family/opponent/stat/attack/equipment rows through canonical RPCs.

Important runtime boundary:

- `persist_combat_result_snapshot(...)` persists a completed snapshot. It does not prove the combat was production-authoritative.
- Sandbox/admin-test combat may persist Angular-resolved results for tooling.
- Production callers (`encounter`, `trial`, `pvp`) must keep a clear backend/RPC validation/finalization boundary before treating an Angular-computed result as authoritative gameplay truth.

---

## Update 2026-05-02 — M-DB1 combat opponent admin RPC/governance path

The DB now has a canonical admin/balancer read/write path for combat opponent configuration used by Epic M and M12.

Tables/read surfaces:

- `combat_opponent_families` — simple family/category dictionary for opponents;
- `combat_opponent_definitions` — reusable admin-defined combat opponents;
- `combat_opponent_stat_values` — baseline stat values per opponent;
- `combat_opponent_attack_sources` — natural/non-equipment attacks;
- `combat_opponent_equipment_entries` — item-like equipment blueprint entries;
- `combat_opponent_equipment_mode_definitions` — dictionary/read surface for equipment modes.

Admin/balancer RPCs:

- `upsert_combat_opponent_family(...)`;
- `deactivate_combat_opponent_family(...)`;
- `upsert_combat_opponent_definition(...)`;
- `deactivate_combat_opponent_definition(...)`;
- `upsert_combat_opponent_stat_value(...)`;
- `delete_combat_opponent_stat_value(...)`;
- `upsert_combat_opponent_attack_source(...)`;
- `deactivate_combat_opponent_attack_source(...)`;
- `upsert_combat_opponent_equipment_entry(...)`;
- `deactivate_combat_opponent_equipment_entry(...)`;
- internal helper `assert_can_manage_combat_opponent_config(...)`.

Rules:

- RPCs require authenticated user context, `can_manage_config_governance(null)` and a non-blank reason.
- Angular must not direct-write `combat_opponent_*` tables.
- Opponent `equipment_mode` supports `none`, `manual`, `generated`.
- Equipment entry `entry_mode` supports `manual` and `generated` only.
- Opponent equipment entries are item-like blueprints for combat setup, not player-owned `items`.
- Natural attack sources use key/label/descriptions, min/max opponent level, attack count, min/max damage, critical chance/damage, active flag and sort order. They do not have an “attack source kind” field.
- Stat values use canonical `stats.key`.
- Equipment entries should use DB-backed item-generation components and slot dictionaries/read models where available.

RLS/grants:

- Authenticated SELECT is granted for the combat opponent configuration tables above.
- Admin SELECT policies are gated through `can_manage_config_governance(null)`.
- No direct INSERT/UPDATE/DELETE policy is intended for Angular.

Audit dictionary entries include combat opponent family, definition, stat value, attack source and equipment entry entity/action types.

---

## Update 2026-05-02 — M-DB2 combat result snapshot persistence RPC

The DB now has a canonical RPC for persisting completed combat result snapshots:

- `persist_combat_result_snapshot(...)`.

Related read helper:

- `can_read_combat_result(...)`.

Related rule helper:

- `get_combat_turn_limit()`.

Persisted tables/read surfaces:

- `combat_results` — combat result header/source/outcome;
- `combat_result_participants` — participant snapshots;
- `combat_result_participant_stats` — participant stat snapshots;
- `combat_result_attacks` — one row per resolved attack.

Rules:

- Frontend/callers must use `persist_combat_result_snapshot(...)` instead of direct inserts into combat result tables.
- The RPC persists the snapshot only. It does not grant rewards, complete trials, apply PvP consequences, publish reports or create notifications.
- Caller/source workflows interpret the combat result.
- Read policies use `can_read_combat_result(...)`, which allows config-governance staff or authenticated owners of hero participants.
- Combat result audit uses entity type `combat_result` and action `combat.result.persisted`.

This removes the DB blocker for Epic M result persistence / M9-style frontend integration.

---

## Update 2026-05-02 — L12b resource/effect encounter payload foundation

The DB now has typed payload configuration for non-combat encounters.

Tables:

- `encounter_resource_payloads` — typed resource payload rows for `encounter_kind = resource`;
- `encounter_effect_payloads` — typed buff/debuff payload rows linking encounters to `exploration_effect_definitions`;
- `exploration_effect_definitions` — reusable exploration effect definitions with governed admin write path.

Admin/balancer RPCs:

- `upsert_encounter_resource_payload(...)`;
- `deactivate_encounter_resource_payload(...)`;
- `upsert_encounter_effect_payload(...)`;
- `deactivate_encounter_effect_payload(...)`;
- `upsert_exploration_effect_definition(...)`;
- `deactivate_exploration_effect_definition(...)`;
- internal helper `assert_can_manage_encounter_payload_config(...)`.

Rules:

- Resource payloads may be attached only to resource encounters.
- Effect payloads may be attached only to buff/debuff encounters.
- Linked effect kind must match the encounter kind.
- Resource payload `amount_mode` supports `fixed`, `range`, `formula`.
- Formula mode requires `formula_id`; fixed/range modes require ordered min/max amounts.
- Chance percent must be between 0 and 100.
- `metadata_json` is a technical extension object, not the main gameplay contract.
- Mutations require authenticated user context, config-governance permission and reason.

RLS/grants:

- Authenticated SELECT is granted for `encounter_resource_payloads`, `encounter_effect_payloads`, and `exploration_effect_definitions`.
- Admin SELECT policies are gated through `can_manage_config_governance(null)`.
- No direct write policy is intended for Angular.

Rollback smoke passed by creating, within a rolled-back transaction, one resource encounter with one resource payload and one buff encounter with one effect payload.

---

## Smoke-test note — authenticated admin context

SQL-editor rollback smoke tests should not assume that an admin/operator row can always be discovered automatically. Prefer one of these patterns:

- explicitly set `request.jwt.claim.sub` to a known admin `user_data.id` / `auth.users.id` for the local database; or
- query by a known admin email in the local test database; or
- create a temporary test user/role inside a transaction only when that is safe and isolated.

Do not treat “No admin/operator user found” from a smoke helper as evidence that the migrated RPC/table shape is broken.

---


## Update 2026-05-01 — L12 encounter admin write path and reward assignment foundation

The DB now has a canonical admin/balancer write path for Encounter definitions, encounter combat payloads, encounter flavor variants and reward profile assignments.

This resolves the earlier L12 pre-flight blocker where `encounter_definitions` and related tables existed, but there was no approved admin write path comparable to L11.

Current L12 tables/read surfaces:

- `encounter_definitions` — configurable encounter entries. Supported `encounter_kind`: `combat`, `resource`, `buff`, `debuff`. `nothing` is a step outcome, not an encounter definition.
- `encounter_combat_candidates` — combat payload for combat encounters; each candidate points to one concrete opponent or one opponent family.
- `encounter_description_variants` — optional lore/flavor variants for an encounter.
- `reward_profile_assignments` — reusable reward-profile assignments by source/outcome/difficulty/district and optional trial/encounter definition.

Admin/balancer RPCs:

- `upsert_encounter_definition(...)` — canonical RPC for creating/updating `encounter_definitions`;
- `deactivate_encounter_definition(...)` — canonical RPC for deactivating an encounter definition;
- `upsert_encounter_combat_candidate(...)` — canonical RPC for creating/updating `encounter_combat_candidates`;
- `deactivate_encounter_combat_candidate(...)` — canonical RPC for deactivating an encounter combat candidate;
- `upsert_encounter_description_variant(...)` — canonical RPC for creating/updating `encounter_description_variants`;
- `deactivate_encounter_description_variant(...)` — canonical RPC for deactivating an encounter description variant;
- `upsert_reward_profile_assignment(...)` — canonical RPC for creating/updating `reward_profile_assignments`;
- `deactivate_reward_profile_assignment(...)` — canonical RPC for deactivating a reward profile assignment.

Rules:

- RPCs require authenticated user context, config-governance permission via `can_manage_config_governance(null)`, and a non-blank reason.
- Frontend must use these RPCs instead of direct writes to L12 tables.
- `encounter_kind` is restricted to `combat`, `resource`, `buff`, `debuff`.
- `nothing` is not an encounter definition; it remains a step outcome.
- `upsert_encounter_combat_candidate(...)` is valid only for encounter definitions where `encounter_kind = combat`.
- Candidate kind `opponent` requires `opponent_definition_id` and null `family_key`.
- Candidate kind `family` requires `family_key` and null `opponent_definition_id`.
- `difficulty_multiplier` and `weight` must be positive.
- Min/max hero level constraints must be positive and ordered when present.
- `metadata_json` fields must remain JSON objects.
- Difficulty keys, minigame keys, reward profile ids, opponent ids, family keys and formula ids are validated against DB dictionaries/tables where applicable.

Reward assignment rules:

- `reward_profile_assignments.source_kind` currently supports `trial`, `encounter`, `pvp`, `quest`, `event`, `level_up`, and `test`.
- L12 encounter UI should use `source_kind = encounter`.
- For `source_kind = encounter`, `encounter_definition_id` may be used and `trial_definition_id` must be null.
- For `source_kind = trial`, `trial_definition_id` may be used and `encounter_definition_id` must be null.
- For other source kinds, trial/encounter definition ids must be null.
- `outcome_kind` must use the key format enforced by the DB.
- `encounter_definitions.reward_profile_id` may exist as a direct field, but L12 reward balancing should not pretend that this alone covers the real reward routing; challenge reward lookup uses `reward_profile_assignments`.

Audit dictionary entries expected by this foundation:

- entity type `encounter_definition`;
- entity type `encounter_combat_candidate`;
- entity type `encounter_description_variant`;
- entity type `reward_profile_assignment`;
- action `exploration.encounter_definition.upserted`;
- action `exploration.encounter_definition.deactivated`;
- action `exploration.encounter_combat_candidate.upserted`;
- action `exploration.encounter_combat_candidate.deactivated`;
- action `exploration.encounter_description_variant.upserted`;
- action `exploration.encounter_description_variant.deactivated`;
- action `reward.profile_assignment.upserted`;
- action `reward.profile_assignment.deactivated`.

Admin read policies:

- `encounter_definitions_admin_select`;
- `encounter_combat_candidates_admin_select`;
- `encounter_description_variants_admin_select`;
- `reward_profile_assignments_admin_select`.

These are SELECT policies for authenticated config-governance admins/balancers. Mutations still go through RPCs. Do not add direct INSERT/UPDATE policies for Angular unless a later explicit decision changes this architecture.

Frontend/Codex implications:

- Regenerate/update generated Supabase types before implementing L12 UI.
- L12 can now be implemented as a write-capable admin/balancer configurator, not only a read-only inspector.
- L12 UI should be encounter-kind aware, not a blind clone of L11 trial UI.
- Combat candidate editing should be visible only for combat encounters.
- Reward assignment editing should use `reward_profile_assignments` and show human-readable reward profile/difficulty/district labels where available.
- Reasons are mandatory for all durable admin mutations.
- If a future L12 route still fails, verify generated types/RLS/session permissions before assuming the DB foundation is missing.

Structural verification SQL:

```sql
select p.proname, pg_get_function_identity_arguments(p.oid) as args
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and p.proname in (
    'upsert_encounter_definition',
    'deactivate_encounter_definition',
    'upsert_encounter_combat_candidate',
    'deactivate_encounter_combat_candidate',
    'upsert_encounter_description_variant',
    'deactivate_encounter_description_variant',
    'upsert_reward_profile_assignment',
    'deactivate_reward_profile_assignment'
  )
order by p.proname, args;

select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'encounter_definitions',
    'encounter_combat_candidates',
    'encounter_description_variants',
    'reward_profile_assignments'
  )
order by tablename, policyname;

select key, label, category, is_active
from audit_entity_types
where key in (
  'encounter_definition',
  'encounter_combat_candidate',
  'encounter_description_variant',
  'reward_profile_assignment'
)
order by key;

select key, label, category, default_severity, is_active
from audit_action_types
where key in (
  'exploration.encounter_definition.upserted',
  'exploration.encounter_definition.deactivated',
  'exploration.encounter_combat_candidate.upserted',
  'exploration.encounter_combat_candidate.deactivated',
  'exploration.encounter_description_variant.upserted',
  'exploration.encounter_description_variant.deactivated',
  'reward.profile_assignment.upserted',
  'reward.profile_assignment.deactivated'
)
order by key;
```

Smoke caveat:

- SQL-editor smoke may fail on `auth.uid()` / `can_manage_config_governance(null)` when no authenticated admin context exists; this is not evidence that the RPCs are malformed.
- Runtime smoke for create/update/deactivate should be done in an authenticated admin/operator session with rollback if the tooling supports it.

---

## Update 2026-05-01 — L11 trial admin write path and PvE read policies

The DB has a canonical admin/balancer write path for Trial definitions and Trial combat candidates.

This removes the blocker where Codex could only implement `L11 — Trial definitions admin configurator` as a read-only inspector.

Audit dictionary entries:

- entity type `trial_definition`;
- entity type `trial_combat_candidate`;
- action `exploration.trial_definition.upserted`;
- action `exploration.trial_combat_candidate.upserted`;
- action `exploration.trial_combat_candidate.deactivated`.

Admin/balancer RPCs:

- `upsert_trial_definition(...)` — canonical RPC for creating/updating `trial_definitions`;
- `upsert_trial_combat_candidate(...)` — canonical RPC for creating/updating `trial_combat_candidates`;
- `deactivate_trial_combat_candidate(...)` — canonical RPC for deactivating a trial combat candidate.

Rules:

- RPCs require authenticated user context, config-governance permission via `can_manage_config_governance(null)`, and a non-blank reason.
- Frontend must use these RPCs instead of direct writes to `trial_definitions` or `trial_combat_candidates`.
- `trial_combat_candidates` may be created only for trial definitions whose `minigame_key = combat`.
- Candidate kind `opponent` requires `opponent_definition_id` and null `family_key`.
- Candidate kind `family` requires `family_key` and null `opponent_definition_id`.
- `difficulty_multiplier` and `weight` must be positive.
- `min_hero_level` / `max_hero_level`, if present, must be >= 1 and ordered correctly.

Smoke caveat:

- The earlier rollback smoke query that ordered `stats` by `sort_order` is invalid because the current `stats` table does not expose `sort_order`. Smoke tests should order `stats` by `key` unless generated types/schema confirm another ordering column.
- SQL-editor smoke may fail on `auth.uid()` / `can_manage_config_governance(null)` when no authenticated admin context exists; this is not evidence that the RPCs are malformed.

PvE read policies/grants:

- `exploration_difficulty_tiers_select_active` lets authenticated users read active difficulty tiers.
- Authenticated SELECT grants and owner-read RLS policies exist for:
  - `hero_daily_action_counters`;
  - `hero_explorations`;
  - `hero_exploration_nodes`;
  - `hero_exploration_edges`;
  - `hero_exploration_steps`;
  - `hero_exploration_effects`;
  - `hero_exploration_challenge_attempts`.

These policies are read-only. Player-facing persistent mutations still go through canonical PvE RPCs. Angular must not direct-write runtime exploration tables.

---

## Formula runtime foundation

The database has an authoritative, DB-side numeric formula evaluator for assigned `balance_formulas`.

Formula runtime helpers:

- `evaluate_balance_formula_expression(...)`;
- `evaluate_balance_formula_target(...)`;
- `formula_round_up(...)`;
- `formula_round_down(...)`;
- `formula_clamp(...)`;
- `formula_random()`;
- `formula_random(min, max)`.

Frontend formula runtime is preview/admin explainability only. Authoritative DB/RPC workflows must evaluate assigned formulas server-side.

---

## Estate/building runtime foundation — Epic O

Current DB foundation:

- `hero_resource_ledger`;
- `apply_hero_resource_delta_with_ledger(...)`;
- `estate_district_address_capacities`;
- `district_code + address_number` as estate address source of truth;
- `estates.address` as legacy/display compatibility;
- `relocate_hero_estate_to_empty_address(...)`;
- `estate_building_jobs`;
- `finalize_completed_estate_building_jobs(...)`;
- `start_estate_building_upgrade(...)`.

Current capacities:

- A = 5000;
- B = 3000;
- C = 500;
- D = 50;
- E = 1.

`start_estate_building_upgrade(...)` is the authoritative workflow for construction/upgrades. It evaluates assigned formulas server-side, spends `drachma`, `materials`, and `workforce` through `hero_resource_ledger`, creates an active job and writes audit.

Player-facing cancellation is not part of MVP.

---

## Game reports foundation — Epic P

Game reports are player-facing gameplay reports and are separate from `player_abuse_reports`, audit logs and notifications.

Current DB foundation:

- enum `game_report_access_role`: `owner`, `participant`, `viewer`;
- enum `game_report_item_source_kind`: `reward_drop`;
- enum `game_report_source_entity_type`: `combat_result`, `trial_result`, `encounter_result`, `pvp_result`, `siege_result`;
- table `game_report_types` for DB-backed report type labels/descriptions;
- table `game_reports` as the shareable report wrapper;
- table `game_report_hero_access` for private per-hero report inbox/access rows;
- table `game_report_participants` for participant snapshots shown inside report content;
- table `game_report_item_references` for public/showcase report item references, especially reward drops.

Current seeded report types:

- `combat`;
- `trial`;
- `encounter`;
- `pvp_combat`;
- `siege`.

Report RPC/helper foundation:

- `create_game_report_from_combat_result(...)`;
- `delete_game_report_for_hero(...)`;
- `attach_reward_drop_item_to_game_report(...)`;
- `build_report_item_display_name(...)`.

Combat report production wraps `combat_results` and does not duplicate `combat_result_attacks`.

`game_report_item_references` prefers `source_item_id` when the real item still exists. If the item row is gone, rendering falls back to saved quality/base/prefix/suffix component refs plus `display_name_fallback`.

Frontend must use report RPCs/helpers rather than direct table writes/deletes. Public reports must not expose account/user ids or private equipment loadouts.

---

## Notifications foundation — Epic Q

Notifications are persistent inbox/bell entries. They are separate from game reports, audit logs, player abuse reports and local UI-only toasts/messages.

Current DB foundation:

- enum `notification_recipient_kind`: `user`, `hero`, `staff`;
- enum `notification_severity`: `info`, `notice`, `warning`, `critical`;
- table `notification_types` for DB-backed labels/descriptions/categories/default severity/default toast behavior;
- table `notifications` for persistent notification rows;
- internal helper `create_notification(...)` for DB/RPC workflows;
- RPC `mark_notification_read(p_notification_id)`;
- RPC `dismiss_notification(p_notification_id)`.

Current seeded notification types include direct trade, auction, declaration, abuse report, anti-abuse attention, sanction, CP penalty and building completion notifications.

Current DB-owned notification hooks include trade offer lifecycle, trade transaction completion, auction outbid, declaration decision, abuse report decision, anti-abuse case attention, sanction created and Character Points penalty created.

Frontend must not insert rows into `notifications` directly. Game reports use the Reports inbox/badge and must not create `game_report.created` notifications by default.

---

## Combat DB foundation — Epic M

Combat is a reusable result/persistence module for encounter, trial, PvP, sandbox and admin-test callers.

Current important enums include:

- `combat_source_type`: `encounter`, `trial`, `pvp`, `sandbox`, `admin_test`;
- `combat_side`: `initiator`, `defender`;
- `combat_participant_kind`: `hero`, `opponent`;
- `combat_outcome`: `initiator_victory`, `defender_victory`, `draw`;
- `combat_candidate_kind`: `opponent`, `family`;
- `combat_opponent_equipment_mode`: `none`, `manual`, `generated`.

Combat result persistence should remain report-ready: result header, participant snapshots, stat snapshots and attack rows.

Combat does not decide rewards, trial completion, PvP consequences or report publication. Callers interpret the result.

---

## Vendor scrap / resource economy foundation

Vendor/system item scrap/sell uses drachmas and is not player trade.

Frontend must call `vendor_scrap_hero_item(...)` for vendor sell/scrap. It must not compose item lifecycle and resource updates in Angular.

Resources such as `drachma`, `materials`, and `workforce` have current balances in `hero_resources`. `hero_resource_ledger` records balance changes from DB/RPC workflows such as building upgrades.

---

## Trade and auctions foundation

Player-to-player trade uses Character Points. Drachmas are vendor/system/building currency.

Items are not copied on transfer. Ownership changes through `items.hero_id` via DB/RPC workflows.

Current item lifecycle statuses include:

- `active`;
- `scrapped`;
- `locked_trade`;
- `locked_auction`.

Direct trade and active auctions share active offer-slot logic for now.

Auctions are one item per auction at foundation stage. Auction without bids after expiry becomes expired and item returns to active. Buy now completes immediately.

Direct trade and auction mutations must use RPC/domain operations, not direct UI table writes.

Trade/auction audit is DB-owned through lifecycle triggers and helper functions.

---

## Anti-abuse / moderation foundation

Anti-abuse never auto-punishes. It creates signals/cases for review.

Declarations provide context; they do not disable anti-abuse.

Sanctions are explicit records and may be multiple per case.

Reasons/status reasons are mandatory where decisions are made.

Important helpers/RPC areas:

- case triage/read/decision helpers;
- sanction and CP penalty management;
- relationship declarations;
- player abuse reports;
- trade/auction signal generation and case grouping;
- scoped moderation/read helpers.

Player-facing models must not leak staff-only fields such as admin/operator notes, verdict reasons, status reasons or global account ids.

---

## Config governance foundation

Config changes must be reasoned and grouped in change sets.

Config definitions are a registry/governance layer, not a replacement for relational domain tables.

Important workflow RPCs include draft creation, entry creation, ready/apply/cancel and value application helpers.

`global_value_change` / `server_value_change` entries must not misuse `entity_id`. Those entries use `config_definition_id`, optional `server_id`, `field_path = value_json`, old/new values and metadata. Entity edits use `entity_field_change`.

---

## Bonus / derived stat foundation

Use `scope`, not `context`, for bonus semantics.

Central bonus foundation:

- `bonus_types`;
- `bonus_scopes`;
- `bonus_target_categories`;
- `bonus_targets`;
- extended `bonus_templates`;
- `entity_bonuses`.

Legacy bonus join tables are transitional.

Quality scaling is on `entity_bonuses`, not on type globally. Quality scales bonus value, never level interval.

`hero_derived` is no longer frontend/runtime source of truth. Do not add new dependencies on it.

---

## Requirements and building caps foundation

Central requirements system:

- `requirement_definitions`;
- `entity_requirements`.

Requirements are not costs and not bonuses.

`buildings.district_code` is the minimum district where a building can be built. Building is available in that district and higher districts.

`buildings.max_level = 0` means unlimited.

`building_district_level_caps` stores only overrides. Missing override falls back to `buildings.max_level`.

---

## Identity / hero loading foundation

`hero.id != auth.uid()`.

User account is global. Hero is server-specific.

Correct application loading path:

1. authenticated user;
2. selected/current server;
3. active hero on selected server;
4. hero-owned data.

Do not query hero-owned data using auth user id as hero id.

---

## M12 / combat opponent configurator caveat

M12 remains a future admin/balancer configurator area.

Corrected facts:

- `combat_opponent_attack_sources` does not have an attack-source-kind field;
- opponent-level `equipment_mode` supports `none`, `manual`, `generated`;
- equipment-entry-level `entry_mode` supports `manual`, `generated` only.

Do not ask Codex to build a full write-capable M12 editor until the exact current RPC/governance path for those tables is confirmed in dump/generated types.
