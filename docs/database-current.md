# Mythsworn — Database Current

Rewritten: 2026-05-10  
Primary source: latest `mythborne_schema.sql` dump from 2026-05-10 plus the previous `database-current.md` and DB/RPC changes verified in the migrator conversation.

## Purpose

This file is the working semantic DB/RPC/helper registry for Codex and frontend implementation work. It is **not** a full `pg_dump`, migration log, status tracker, or historical changelog.

Use it to answer:

- which DB/RPC/read model is canonical for a feature;
- which tables are implementation detail vs frontend contract;
- which workflows are RPC-owned and must not be direct-written from Angular;
- which generated Supabase types must exist before Codex continues;
- which known legacy objects are compatibility debt rather than source of truth.

When this document conflicts with newer facts, prefer:

1. explicit user instruction;
2. current live DB / migrations / latest dump;
3. generated Supabase `database.types.ts` after regeneration;
4. `current-decisions.md`;
5. this document;
6. `project-context.md` and implementation/backlog docs.

## Global rules for Codex / frontend

- Do not assume `hero.id === auth.uid()`.
- Normal player flow is: authenticated user → selected/current server → active hero → hero-owned DB/RPC calls.
- Player-facing durable mutations must go through canonical RPC/domain workflows.
- Angular must not direct-write gameplay tables such as `hero_stats`, `hero_resources`, `items`, `hero_equipment`, `guild_*`, trade/auction tables, exploration runtime tables, PvP result tables, reward tables, audit tables or config value tables unless an explicit task says otherwise.
- Generated `database.types.ts` is user/migrator-owned generated input. Codex may read it but must not edit or patch it manually.
- When a schema/RPC signature changes and Codex needs to consume it, regenerate Supabase generated types before frontend work resumes.
- If a required DB contract is missing, Codex must report a DB/RPC blocker instead of inventing an Angular fallback.
- Frontend formula/economy/combat/exploration/Luck/prestige calculations may be used for preview only when explicitly documented. Durable authority belongs to DB/RPC/formula helpers.

## Generated type regeneration matrix

Regenerate Supabase generated types before Codex consumes any schema, enum, table or RPC signature change.

Known regeneration-required contracts after the 2026-05-10 DB/RPC updates:

- guild updates:
  - `search_guilds_for_hero(...)`;
  - changed `get_hero_guild_members(...)` return signature with `armory_access_status_key`.
- Manual Trial Runtime Foundation:
  - `manual_trial_sessions`;
  - `manual_trial_manifests`;
  - `manual_trial_action_logs`;
  - `manual_trial_verdicts`;
  - `get_active_trial_offer(...)`;
  - `start_manual_trial_runtime_session(...)`;
  - `get_manual_trial_runtime_manifest(...)`;
  - `submit_manual_trial_action_log(...)`;
  - `get_manual_trial_backend_verdict(...)`;
  - `get_manual_trial_backend_verdict_for_attempt(...)`;
  - manual-trial auto-resolve / inactivity / explicit-exit wrapper RPCs;
  - `create_manual_trial_game_report(...)`.
- Admin balance draft / relational config governance:
  - `config_change_sets.draft_kind`;
  - `config_change_entries.replaced_at`;
  - `config_change_entries.replaced_by_entry_id`;
  - `config_draft_entity_field_allowlist`;
  - new `config_managed_entity_type` enum values: `trial_definition`, `encounter_definition`, `reward_profile`, `reward_profile_assignment`, `reward_profile_entry`;
  - active balance draft RPCs;
  - relational draft entry upsert/read/overlay/apply RPCs.
- Generated PvE opponent equipment runtime:
  - `build_combat_opponent_equipment_loadout_snapshot(...)`;
  - updated `build_opponent_combatant_snapshot_for_resolver(...)` semantics where consumed.
- Luck Lab generated item distribution simulation:
  - `preview_reward_generated_item_distribution_luck(...)`.

No type regeneration is required for data-only seeds or same-signature function body fixes, including:

- guild config key-contract clarification;
- item fractional display/runtime rounding body fixes;
- Epic W Trial/Encounter seed/readiness repair;
- body-only static-grep cleanup in generated opponent equipment helpers.

---

# 1. Identity, server and hero context

## Core model

- User/account is global.
- Hero is server-scoped.
- `hero.id` is gameplay identity and is not equal to `auth.uid()`.
- Server membership/staff access is server-scoped.
- Sandbox/test server flows may later support privileged multi-hero testing, but normal player code must load the active hero by user + selected server.

## Important tables/enums

- `game_servers`, `server_memberships`, `server_staff_assignments`, `server_staff_assignment_scopes`.
- `hero`, `hero_stats`, `hero_resources`, `hero_progression_ledger`, `character_point_ledger`.
- `server_membership_status`: `active`, `suspended`, `banned`.
- `server_staff_role`: `owner`, `operator`, `moderator`, `tester`.

## Helper/authority rules

- Use active server/active hero resolution before hero-owned calls.
- Use `can_read_hero(p_hero_id)` style owner/staff-safe checks in RPCs.
- Use `get_hero_normal_gameplay_block_reason(p_hero_id)` / `assert_hero_can_use_normal_gameplay(...)` where normal gameplay should be blocked by membership/status/activity.
- Frontend must not use auth user id as hero id and must not query hero-owned tables directly when a domain read model exists.

---

# 2. Config governance and DB-backed configuration

## Core model

Config is governed through definitions, values and change sets. `config_definitions` is a registry/governance layer. It does not replace relational domain tables for structured gameplay content.

Important tables:

- `config_definitions`;
- `global_config_values`;
- `server_config_values`;
- `config_change_sets`;
- `config_change_entries`;
- `config_definition_ui_metadata`.

Important enums:

- `config_change_kind`;
- `config_change_status`;
- `config_change_visibility`;
- `config_governance_scope`;
- `config_managed_entity_type`;
- `config_value_status`;
- `config_value_type`.

## Canonical workflows

- `apply_config_change_set(p_change_set_id)` is the governed apply workflow for ready change sets.
- Internal helpers such as `apply_global_config_value_change_entry(...)` and `apply_server_config_value_change_entry(...)` are not frontend contracts.
- Config changes require reason/changelog governance where applicable.
- Frontend must not mutate `global_config_values` or `server_config_values` directly.

## Active global balance draft MVP

MVP/pre-alpha balance governance now supports one active global balance draft workspace.

Core rules:

- MVP does not support per-user drafts, per-live-server balance overrides, multi-server apply or parallel live-server balance configurations.
- Active balance draft means `config_change_sets.status = 'draft'` and `config_change_sets.draft_kind = 'balance_global'`.
- The database enforces at most one active `balance_global` draft at a time.
- Ambiguous state with more than one active balance draft is a governance blocker and must not be silently resolved by Angular.
- UI should find or create the active draft through RPC, not direct-write `config_change_sets`.

Schema/guard additions:

- `config_change_sets.draft_kind text`;
- `config_change_sets_one_active_balance_global_draft_idx`.

Admin/frontend-facing RPCs:

- `get_active_balance_draft_change_set()`;
- `get_or_create_active_balance_draft_change_set(p_reason text, p_request_id text)`.

Rules:

- The active draft is the source of proposed admin/balance changes.
- Do not introduce independent `sandbox_overrides` as a parallel source of truth.
- Live gameplay ignores draft changes unless a draft-aware preview/helper is explicitly called.

## Relational entity draft entries

Relational balance draft changes use `config_change_entries.change_kind = 'entity_field_change'`.

Compression semantics:

- `config_change_entries.replaced_at`;
- `config_change_entries.replaced_by_entry_id`;
- one active final draft entry per `change_set_id`, `entity_type`, `entity_id`, `field_path`.

Replaced entries may remain for audit/debug, but operator-facing diff/read models should show only active final entries by default.

Allowlist:

- `config_draft_entity_field_allowlist` controls which entity fields may be draft-edited.
- There is no unsafe generic table patcher.
- Draft field changes must validate entity type, field path, value type, numeric min/max where configured, ref targets where configured and domain/apply helper availability.

First enabled MVP domains:

- `item_generation_quality`;
- `item_generation_bucket_profile`;
- `balance_formula`;
- `balance_formula_assignment`.

Future enum coverage exists but is not yet allowlist/apply-enabled for:

- `trial_definition`;
- `encounter_definition`;
- `reward_profile`;
- `reward_profile_assignment`;
- `reward_profile_entry`.

Admin-facing RPC/read models:

- `upsert_config_entity_field_change(...)`;
- `get_config_change_set_draft_entries(...)`.

Service helpers:

- `get_config_entity_field_live_value_status(...)`;
- `validate_config_draft_entity_field_value(...)`.

Conflict statuses:

- `clean`;
- `conflict`;
- `missing_entity`;
- `invalid_field`.

## Draft overlay read models

Item generation overlay read models:

- `get_item_generation_quality_draft_overlay(p_change_set_id uuid default null)`;
- `get_item_generation_bucket_profile_draft_overlay(p_change_set_id uuid default null)`.

Formula overlay and draft-aware formula resolution:

- `get_balance_formula_draft_overlay(p_change_set_id uuid default null)`;
- `get_balance_formula_assignment_draft_overlay(p_change_set_id uuid default null)`;
- `resolve_balance_formula_target_with_draft(p_target_key text, p_change_set_id uuid default null)`;
- `evaluate_balance_formula_target_with_draft(p_target_key text, p_variables_json jsonb, p_change_set_id uuid default null)`.

Rules:

- `p_change_set_id = null` means live-only read/preview.
- Non-null `p_change_set_id` must be an explicit draft context.
- Draft-aware functions are for admin/sandbox diagnostics and previews.
- Live gameplay must continue to use live config/formula runtime paths unless explicitly designed otherwise.

## Draft-aware generated item preview

Luck Lab / admin preview has a draft-aware generated item preview wrapper:

- `preview_reward_generated_item_luck_with_draft(p_change_set_id uuid, p_max_quality_key text, p_bucket_profile_id uuid, p_preview_count integer, p_luck_value integer, p_metadata_json jsonb)`.

Semantics:

- Uses explicit draft context for item quality, bucket profile and formula overlay.
- Preview-only.
- Does not create `items`.
- Does not grant rewards.
- Does not mutate live config.
- Existing `preview_reward_generated_item_luck(...)` remains the live preview contract.

## Applying relational entity changes

`apply_config_change_set(p_change_set_id)` now supports:

- existing scalar/json `global_value_change`;
- existing scalar/json `server_value_change`;
- first-slice `entity_field_change` entries.

Apply semantics:

- Apply is atomic.
- Replaced entries are ignored.
- Any conflict blocks the whole apply.
- No partial apply for MVP.
- Relational entity changes are dispatched through domain-specific service helpers, not a generic table patcher.

DB-6 supported apply domains:

- `item_generation_quality`;
- `item_generation_bucket_profile`;
- `balance_formula`;
- `balance_formula_assignment`.

Apply helpers:

- `validate_config_change_set_entries_for_apply(p_change_set_id)`;
- compatibility wrapper `validate_config_change_set_entries_for_d5(p_change_set_id)`;
- `apply_config_entity_field_change_entry(p_entry config_change_entries, p_actor uuid)`;
- `apply_item_generation_quality_draft_entry(...)`;
- `apply_item_generation_bucket_profile_draft_entry(...)`;
- `apply_balance_formula_draft_entry(...)`;
- `apply_balance_formula_assignment_draft_entry(...)`.

`mark_config_change_set_ready(p_change_set_id)` validates scalar/json entries and supported active entity-field draft entries before moving a change set to `ready`.

## Guild config registry contract

Active guild config definitions under `managed_entity_key = 'guild'` are the **prefixed** canonical registry keys:

| Summary field from `get_guild_config_summary()` | Canonical `config_definitions.key` |
| --- | --- |
| `creation_drachma_cost` | `guild_creation_drachma_cost` |
| `member_base_limit` | `guild_member_base_limit` |
| `member_limit_per_leader_level` | `guild_member_limit_per_leader_level` |
| `leader_inactivity_threshold_days` | `guild_leader_inactivity_threshold_days` |
| `nomination_duration_minutes` | `guild_emergency_nomination_duration_minutes` |
| `voting_duration_minutes` | `guild_emergency_voting_duration_minutes` |
| `emergency_max_candidates` | `guild_emergency_max_candidates` |
| `armory_capacity` | `guild_armory_capacity` |

All eight are `managed_entity_key = 'guild'`, `managed_entity_type = scalar_config`, `governance_scope = product_global`, `value_type = integer`, active, and match `get_guild_config_summary()` defaults/current values.

Rules:

- Do not seed alias definitions such as `creation_drachma_cost`.
- Non-prefixed names are summary RPC output fields, not `config_definitions.key` values.
- Admin editor should use an explicit summary-field-to-definition-key map.
- Angular must not guess aliases or create fallback key matching.

---

# 3. Formula runtime and UI metadata

## Formula authority

The database has authoritative formula runtime helpers for numeric formula targets:

- `evaluate_balance_formula_expression(...)`;
- `evaluate_balance_formula_target(...)`;
- `formula_round_up(...)`;
- `formula_round_down(...)`;
- `formula_clamp(...)`;
- `formula_random()` / `formula_random(min, max)`.

Formula-related tables include:

- `balance_formula_targets`;
- `balance_formulas`;
- `balance_formula_assignments`;
- `balance_formula_blocks`;
- `entity_formula_assignments`.

Rules:

- Angular formula evaluation is admin/preview/explainability only.
- Durable gameplay workflows must evaluate assigned formulas server-side.
- Lookup order for formula-driven runtime paths should be: local entity assignment → global/default assignment → explicit fallback/config error.

## UI metadata

`ui_metadata_entries` and related metadata read helpers provide DB-backed copy/labels/helper text for admin/runtime explanation surfaces. Admin/gameplay implementation should prefer DB metadata over hardcoded explanatory lists when metadata rows exist.

---

# 4. Stats, progression, Character Points and Luck

## Canonical base stats

Current canonical base stat keys:

- `strength`;
- `dexterity`;
- `endurance`;
- `agility`;
- `cunning`;
- `charisma`;
- `wisdom`;
- `intelligence`;
- `spirituality`.

Do not use old concept-doc stat lists as implementation authority.

## Stat allocation and progression

Canonical persistent stat allocation uses:

- `save_stat_allocation(...)`.

Character Points are progression/trade currency:

- current balance: `hero.character_points`;
- lifetime total where needed: `hero.total_character_points_earned`;
- ledger: `character_point_ledger`;
- low-level internal helper: `apply_character_points_delta(...)`.

Frontend must not direct-write `hero_stats`, `hero.character_points`, `character_point_ledger`, `hero_progression_ledger` or audit tables.

Level-up/progression foundations include:

- `grant_hero_experience(...)`;
- `apply_level_up_stat_bonuses_to_hero(...)`;
- `grant_level_up_reward_to_hero(...)`;
- level-up trigger helpers for stat bonuses/rewards.

Before implementing new progression flows, inspect current generated types and exact RPC signatures.

## Runtime derived stats

Runtime derived/special stats are resolved on the fly from:

- base stats;
- equipment;
- bonus dictionaries/templates/entity bonuses;
- derived stat definitions;
- formula assignments;
- active hero/server context.

Do not reintroduce `hero_derived` as runtime source of truth. If generated types still mention it, treat it as physical legacy until a cleanup migration removes it.

Important combat/derived semantics:

- `critical_damage` is a combat/derived stat and active bonus target.
- Base critical damage percent is `50`.
- Final crit multiplier is `1 + finalCriticalDamagePercent / 100`.
- Do not use old hardcoded `x2` crit multiplier.

## Luck foundation

Luck is DB/RPC/formula-authoritative and affects opportunities, ranges and distributions rather than guaranteeing perfect outcomes.

Core Luck helpers/RPCs:

- `get_hero_luck_breakdown(p_hero_id)`;
- `get_hero_luck_value(p_hero_id)`;
- `get_hero_exploration_luck_value(p_hero_id)`;
- `calculate_luck_influence(p_luck_value)`;
- `calculate_trial_power(p_tested_stat_value, p_luck_value)`;
- `get_hero_trial_power(p_hero_id, p_tested_stat_key)`;
- `preview_luck_influence_and_trial_power(...)`.

Luck-aware exploration/trial helpers:

- `get_trial_opportunity_chance(p_exploration_id)`;
- `get_trial_manifestation_chance(p_exploration_id, p_trial_definition_id)`;
- `get_challenge_auto_resolve_success_chance(p_challenge_attempt_id)`;
- `get_non_trial_encounter_chance(p_exploration_id)`.

Luck Lab registry/preview:

- `get_luck_lab_preview_contracts()`;
- `preview_trial_opportunity_curve(...)`;
- `simulate_trial_opportunity_runs(...)`;
- `preview_trial_manifestation_chance(...)`;
- `preview_challenge_auto_resolve_success_chance(...)`;
- `preview_non_trial_encounter_chance(...)`;
- `preview_exploration_luck_rng_chain(...)`;
- `preview_reward_profile_luck(...)`;
- `preview_reward_generated_item_luck(...)`;
- `preview_reward_generated_item_luck_with_draft(...)`;
- `preview_reward_generated_item_distribution_luck(...)`;
- `preview_combat_luck_formula_context(...)`.

Frontend must consume DB/RPC Luck outputs and must not hardcode Luck curves, reward ranges, Trial modifiers, drop chances or combat RNG influence.

---

# 5. Bonus system, requirements and runtime modifiers

## Bonus system

Canonical bonus model uses:

- `bonus_types`;
- `bonus_scopes`;
- `bonus_target_categories`;
- `bonus_targets`;
- semantic `bonus_templates`;
- `entity_bonuses`.

Legacy bonus join tables may physically remain as transitional debt, but new/changed frontend read/write paths should use `entity_bonuses` and joined template/dictionary data.

Rules:

- `quality_scales_value` lives on `entity_bonuses`.
- Quality can scale bonus value.
- Quality must not scale `level_interval`.
- Use `scope`, not old `context` wording.
- Requirements must be separate from bonuses.

Runtime equipment/origin/building/stat paths should use the DB-owned bonus resolver/read models rather than local Angular aggregation.

## Requirements

Canonical requirements foundation:

- `requirement_definitions`;
- `entity_requirements`.

Supported entity types include:

- `building_definition`;
- `item_generation_base`;
- `item_generation_affix`;
- `item`;
- `trial_definition`;
- `trade_feature`;
- `auction_feature`.

Requirement admin/read helpers include:

- `create_entity_requirement(...)`;
- `update_entity_requirement(...)`;
- `deactivate_entity_requirement(...)`;
- `reorder_entity_requirements(...)`;
- `get_requirement_impact_preview(...)`;
- `search_item_generation_entity_targets_page(...)`;
- `get_item_requirement_component_rows(...)`;
- `get_item_effective_requirements(...)`;
- `check_hero_meets_item_requirements(...)`.

Frontend rules:

- Do not use legacy JSON requirement fields or legacy requirement columns as authority.
- Do not direct-write `entity_requirements`.
- Treat empty item-generation requirement sets as a valid editable empty state, not as a DB blocker.

---

# 6. Resources, estate and buildings

## Resource economy

Canonical resources currently include:

- `drachma`;
- `materials`;
- `workforce`.

Resource mutations should use ledger-backed workflows:

- `hero_resource_ledger`;
- `apply_hero_resource_delta_with_ledger(...)`.

Frontend must not direct-write `hero_resources` for durable gameplay.

## Estate address and relocation

Estate address source of truth:

- `estates.district_code`;
- `estates.address_number`;
- `estate_district_address_capacities`.

`estates.address` is legacy/display compatibility.

Current capacities:

- District A: 5000;
- District B: 3000;
- District C: 500;
- District D: 50;
- District E: 1.

Canonical relocation workflow:

- `relocate_hero_estate_to_empty_address(...)`.

Frontend must not derive hardcoded district capacities if a DB read model exists.

## Building runtime

Core tables/workflows:

- `estate_building_jobs`;
- `finalize_completed_estate_building_jobs(...)`;
- `start_estate_building_upgrade(...)`;
- `get_hero_estate_runtime_state(p_hero_id)`.

Rules:

- `start_estate_building_upgrade(...)` is the authoritative construction/upgrade workflow.
- It evaluates formulas server-side, spends `drachma`, `materials`, `workforce` through the resource ledger, creates an active job and writes audit.
- Player-facing cancellation is not part of MVP.
- Building definitions may have `starting_level = 0` as legal not-built state.
- `buildings.max_level = 0` means unlimited.
- `building_district_level_caps` stores overrides; missing override falls back to `buildings.max_level`.
- `buildings.district_code` is minimum district; a building is available in that district and higher districts.

---

# 7. Items, item generation, armory, equipment and loadouts

## Item generation model

Generated item model is:

`quality + optional prefix + base item + optional suffix`.

Core structures:

- `item_generation_qualities`;
- `item_generation_base_types`;
- `item_generation_base_type_targets`;
- `item_generation_base_type_equip_targets`;
- `item_generation_bases`;
- `item_generation_affixes`;
- `item_generation_bucket_profiles`;
- `items`;
- `entity_bonuses` for item-generation base/affix/native/effect bonuses.

Rules:

- `item_generation_bases.base_type_key` is source of truth.
- `item_generation_bases.slot` is legacy/deprecated.
- Base item type/equip display metadata is DB-owned.
- Item value and item usefulness are intentionally separate.
- Drachma value is economic/vendor context, not Character Points trade price.

## Item detail/read surfaces

Canonical armory/item read surfaces:

- `get_hero_armory_items(p_hero_id)` — list/read surface;
- `get_hero_armory_item_detail(p_hero_id, p_item_id)` — canonical item detail surface;
- `get_hero_armory_item_detail_core(...)` — internal/core detail builder;
- `get_hero_armory_visibility_state(p_hero_id)`.

Item detail display contract:

- Player-facing Item stats show native/base Damage for weapons and Defense for armor/shields.
- Native/default/technical rows such as base attack count may be hidden or technical according to `item_generation_base_type_targets` display policy.
- Modifier rows feed Bonuses.
- `consumedModifierRows` identify modifiers folded into native final stats to prevent double-counting.
- `itemType` and `equipTarget` are DB-owned fields in `bonuses_json`; Angular must not infer player-facing type/slot from `base_type_key`.

Ring rule:

- Player-facing item type is `Ring`.
- Technical physical slots are `ring_1` and `ring_2`.
- Popup should show `Ring`, not `Ring 1` / `Ring 2`.

## Fractional item values fix

`format_item_stat_numeric_display(p_value numeric)` formats player-facing item/combat numeric values as integer-like text.

`get_hero_equipment_runtime_bonus_rows(p_hero_id)` rounds quality-scaled `effective_value` when `quality_scales_value = true`.

Rules:

- Raw config can have quality multiplier `1.5`.
- DB-owned effective runtime/display output must be integer-like for player-facing combat/stat/damage values.
- Angular must not hide DB/RPC fractional gameplay values with scattered local `Math.round(...)`.
- If fractional values reappear in item detail, runtime bonus rows or attack plan, treat it as DB/RPC regression.

## Equipment runtime

Core equipment state:

- `hero_equipment`, not `items.status = equipped`.

Important runtime helpers:

- `get_hero_equipment_runtime_slots(p_hero_id)`;
- `get_hero_equipment_runtime_bonus_rows(p_hero_id)`;
- `get_hero_equipment_runtime_bonus_totals(p_hero_id)`;
- `get_hero_runtime_attack_plan(p_hero_id)`;
- `get_hero_dashboard_runtime_stats(p_hero_id)`.

Rules:

- Angular must not implement item requirement, attack-count aggregation, stat aggregation or equipment compatibility as authority.
- Equip/unequip workflows must use canonical RPC/domain operations.
- `equip_hero_item(p_hero_id, p_item_id, p_target_slot_key default null, p_request_id default null)` can resolve default slots/rotation when no target slot is supplied.
- Invalid explicit slots should return controlled failure such as `slot_incompatible`, not raw UI-side guessing.

## Loadout presets

Current loadout preset RPCs include:

- `rename_hero_loadout_preset(p_hero_id, p_preset_number, p_name, p_request_id default null)`;
- `save_current_hero_loadout_to_preset(...)`;
- `clear_hero_loadout_preset(...)`;
- `preview_hero_loadout_preset(...)`;
- `apply_hero_loadout_preset(...)`.

Rules:

- Loadouts save exact item ids to literal slots.
- Apply skips missing/scrapped/not-runtime-usable items and returns a journal JSON.
- Borrowed guild armory items can be saved/applied when `can_hero_runtime_use_item(...)` permits runtime use.

## Item lifecycle / vendor / recovery

Canonical workflows:

- `scrap_hero_item(...)`;
- `vendor_scrap_hero_item(...)`;
- `recover_scrapped_item(...)`;
- `search_recoverable_scrapped_items_page(...)`;
- `staff_transfer_item_ownership(...)`.

Rules:

- No-affix trivial items may be hard-deleted on scrap.
- Affix-bearing items become `scrapped` and recoverable until configured retention expires.
- Staff recovery is explicit and audited.
- Vendor scrap pays drachmas and is not player-to-player trade.
- Frontend must not direct-delete or direct-update `items`.

---

# 8. Rewards, drops and item generation from rewards

## Reward foundation

Core reward tables:

- `reward_profiles`;
- `reward_profile_entries`;
- `reward_profile_assignments`;
- `reward_outcome_kinds`;
- `reward_grants`;
- `reward_grant_entries`.

Core reward workflow:

- `find_reward_profile_for_challenge(...)` / matching helpers;
- `grant_reward_profile_to_hero(...)`;
- `evaluate_reward_profile_entry_amount(...)`;
- `evaluate_reward_profile_entry_item_count(...)`;
- `generate_reward_item_for_hero(...)`.

Rules:

- Rewards are profile/assignment driven.
- Trial/Encounter/PvP callers should pass source/outcome context rather than granting ad hoc frontend rewards.
- Luck-aware reward amount and item count helpers should be used for range/item-generation reward entries.
- Angular must not compute durable reward amounts or generated item outcomes.

## Generated item distribution simulation

Luck Lab has a dedicated DB-owned generated item distribution simulation RPC for V10-style drop distribution panels:

- `preview_reward_generated_item_distribution_luck(p_max_quality_key text, p_bucket_profile_id uuid, p_roll_count integer, p_luck_value integer, p_compare_luck_value integer, p_high_value_threshold integer, p_change_set_id uuid)`.

Semantics:

- Preview/read model only.
- No durable mutation.
- No `items` insert/update/delete.
- No reward grants.
- No game reports.
- No rarity flags and no rare-combination model.
- Preserves the item generation philosophy: value bucket, quality, base item, optional prefix, optional suffix.
- Supports Luck comparison, typically Luck 0 vs current Luck.
- Supports optional draft context via `p_change_set_id`.
- Internally aggregates DB-owned per-roll generated item preview output in server-side batches.

Important returned summary fields include:

- `roll_count`;
- `luck_value` / `compare_luck_value`;
- `luck_influence` / `compare_luck_influence`;
- `average_item_value`;
- `median_item_value`;
- `min_item_value` / `max_item_value`;
- `compare_average_item_value` / `compare_median_item_value`;
- `average_delta` / `average_delta_percent`;
- `prefix_hit_rate` / `suffix_hit_rate`;
- `compare_prefix_hit_rate` / `compare_suffix_hit_rate`;
- `outstanding_rate` / `compare_outstanding_rate`;
- `high_value_threshold`;
- `high_value_rate` / `compare_high_value_rate`;
- `bucket_distribution_json` / `compare_bucket_distribution_json`;
- `quality_distribution_json` / `compare_quality_distribution_json`;
- `summary_json`;
- `formula_context_json`;
- `explanation`.

Frontend rules:

- Angular must not simulate item/drop distribution locally.
- Angular must not reconstruct bucket/quality/prefix/suffix RNG.
- V10-style panels should consume `preview_reward_generated_item_distribution_luck(...)` after generated types are regenerated.

## Epic W seed/readiness repair

Data seed repair made active Trial/Encounter content ready enough for current gameplay testing without adding schema/RPC.

Reused active Trial definitions:

- `strength_trial`;
- `dexterity_trial`;
- `agility_trial`;
- `endurance_trial`;
- `cunning_trial`;
- `charisma_trial`;
- `wisdom_trial`;
- `intelligence_trial`;
- `spirituality_trial`.

Post-repair state:

- 9/9 active canonical combat Trials are `is_ready = true`.
- Each has a success reward assignment and concrete combat candidate.
- `trial_success_basic` remains the common Trial success profile with XP + generated items.
- Item-generation reward currently supports 2–3 generated items with max quality `outstanding` where configured.

Encounter readiness after repair:

- `light_combat` — ready, combat candidate + XP reward;
- `minor_resource_find` — ready, drachma resource reward;
- `w_resource_materials_find` — ready, materials reward;
- `w_resource_workforce_find` — ready, workforce reward;
- `minor_blessing` — ready, buff payload + reward;
- `minor_curse` — ready, debuff payload + reward.

Resource coverage:

- `drachma`, `materials`, `workforce` each have at least one active resource Encounter payload and active resource reward entry.

Cleanup candidate:

- inactive legacy Trial `strength` remains physical cleanup candidate. Do not delete without explicit DB cleanup task.

---

# 9. Exploration, Trials and Encounters

## Exploration runtime

Core tables include:

- `hero_daily_action_counters`;
- `hero_explorations`;
- `hero_exploration_nodes`;
- `hero_exploration_edges`;
- `hero_exploration_steps`;
- `hero_exploration_effects`;
- `hero_exploration_challenge_attempts`;
- `trial_definitions`;
- `encounter_definitions`.

Core player/read RPCs include:

- `get_hero_exploration_state(p_hero_id)`;
- `start_hero_exploration_step(...)`;
- `resolve_hero_exploration_step(...)`;
- `get_hero_exploration_debug_state(...)`.

Rules:

- Runtime state and timers are DB-owned.
- Angular must not direct-write exploration runtime tables.
- Player-facing persistent mutations go through canonical PvE/exploration RPCs.
- Read policies/grants are read-only; mutation authority remains RPC-owned.

## Trial admin/readiness

Trial admin/write path uses governed RPCs, not direct writes:

- `upsert_trial_definition(...)`;
- `set_trial_definition_active(...)`;
- `upsert_trial_combat_candidate(...)`;
- `set_trial_combat_candidate_active(...)`;
- `get_trial_definition_readiness(...)`.

Rules:

- Trial combat candidates may be created only for `minigame_key = combat`.
- Candidate kind `opponent` requires `opponent_definition_id` and null `family_key`.
- Candidate kind `family` requires `family_key` and null `opponent_definition_id`.
- Difficulty multiplier and weight must be positive.

## Encounter admin/readiness

Encounter admin/write path uses governed RPCs, not direct writes:

- `upsert_encounter_definition(...)`;
- `set_encounter_definition_active(...)`;
- `upsert_encounter_combat_candidate(...)`;
- `set_encounter_combat_candidate_active(...)`;
- `upsert_encounter_resource_payload(...)`;
- `set_encounter_resource_payload_active(...)`;
- `upsert_encounter_effect_payload(...)`;
- `set_encounter_effect_payload_active(...)`;
- `get_encounter_definition_readiness(...)`.

Current Encounter kinds include combat, resource, buff and debuff content paths. Resource/effect payloads are part of readiness and runtime content; rewards still go through reward profiles/assignments.

## Manual Trial Runtime Foundation

Manual Trial Runtime Foundation is DB/RPC-ready for future Manual Trial Shell/Core frontend work.

This foundation is not a concrete minigame implementation. It does not implement Apollo, Hermes, Zeus, Hephaestus, Hera, Artemis, Athena or Aphrodite gameplay. It provides the backend-authoritative runtime envelope:

`Trial Offer -> Manual Runtime Session -> Manual Runtime Manifest -> Action Log submit -> Backend Verdict -> report/reward handoff`

Core semantics:

- Trial identity is locked before manual/auto choice.
- Trial Offer shows an active unresolved Trial and allowed actions.
- Trial Offer does not create a Manual Runtime Manifest.
- Auto-resolve does not create a Manual Runtime Manifest.
- Manual Runtime Session is created only after Manual Resolve.
- Manual Runtime Manifest is backend-owned.
- Frontend renders from manifest but does not generate difficulty/balance parameters.
- Frontend submits Action Log, not final `success/fail`.
- Backend owns outcome, failure reason, reward/report references and durable transition.
- There is no normal durable `abandoned` outcome.
- Offer inactivity timeout resolves through ordinary auto-resolve.
- Explicit manual exit after warning resolves through auto-resolve.
- Non-timer manual inactivity timeout may resolve through auto-resolve.
- Timer-expired manual fail remains future/minigame-specific.

Dictionary/config foundation:

- `manual_trial_session_statuses`;
- `manual_trial_manifest_statuses`;
- `manual_trial_action_log_statuses`;
- `manual_trial_outcome_kinds`;
- `manual_trial_resolution_modes`;
- `manual_trial_failure_reasons`;
- `manual_trial_validation_reasons`.

Manual Trial runtime config definitions:

- `manual_trial_offer_inactivity_timeout_seconds`;
- `manual_trial_session_inactivity_timeout_seconds`;
- `manual_trial_manifest_ttl_seconds`;
- `manual_trial_timer_safety_margin_ms`;
- `manual_trial_action_log_max_entries`;
- `manual_trial_action_log_max_payload_bytes`.

Storage tables:

- `manual_trial_sessions`;
- `manual_trial_manifests`;
- `manual_trial_action_logs`;
- `manual_trial_verdicts`.

Rules:

- These tables are not direct frontend table contracts.
- `manual_trial_verdicts.manual_session_id` is nullable because direct auto-resolve / offer inactivity auto-resolve must not create a manual session.
- Frontend should use RPC/read models.

Trial Offer / Session / Manifest RPCs:

- `get_active_trial_offer(p_hero_id uuid)`;
- `start_manual_trial_runtime_session(p_attempt_id uuid, p_request_id text)`;
- `get_manual_trial_runtime_manifest(p_manual_session_id uuid)`.

Contract notes:

- `get_active_trial_offer(...)` exposes locked trial identity, labels and allowed actions; it does not expose raw `trial_power`.
- `start_manual_trial_runtime_session(...)` creates or returns an idempotent manual session and backend-owned manifest.
- `get_manual_trial_runtime_manifest(...)` returns player-safe manifest identity/policies/config and intentionally does not expose validation/admin context, seed hash or config hash.

Action Log and Backend Verdict RPCs:

- `submit_manual_trial_action_log(...)`;
- `get_manual_trial_backend_verdict(p_manual_session_id uuid)`;
- `get_manual_trial_backend_verdict_for_attempt(p_attempt_id uuid)`.

Current foundation behavior:

- Submit validates session/manifest/action-log envelope.
- Concrete minigame validators are future work.
- For unsupported minigames, submit fail-closes with `unsupported_minigame`.
- Backend Verdict returns player-safe outcome/resolution/failure/reward/report summary fields.
- It does not expose admin validation JSON or raw action-log debug payloads.

Manual Trial reports use the existing game report foundation:

- `game_report_types.key = manual_trial`;
- `create_manual_trial_game_report(p_verdict_id uuid, p_request_id text)`;
- trigger wrapper `after_manual_trial_verdict_insert_create_report()`;
- trigger `manual_trial_verdicts_after_insert_create_report`.

Report semantics:

- One `game_reports` row is created/updated with `source_entity_type = trial_result` and `source_entity_id = manual_trial_verdicts.id`.
- Private hero access is attached through `game_report_hero_access`.
- A display-safe participant snapshot is added.
- `manual_trial_verdicts.game_report_id` is updated.

Auto-resolve / inactivity / exit wrappers:

- `auto_resolve_manual_trial(p_attempt_id uuid, p_resolution_mode_key text, p_request_id text)`;
- `resolve_trial_offer_inactivity_timeout(p_attempt_id uuid, p_request_id text)`;
- `exit_manual_trial_to_auto_resolve(p_manual_session_id uuid, p_request_id text)`;
- `resolve_manual_trial_inactivity_timeout(p_manual_session_id uuid, p_request_id text)`.

Rules:

- Direct auto-resolve and offer inactivity auto-resolve do not create manual sessions/manifests.
- Explicit exit and manual inactivity require an existing manual session.
- Existing active manifests are invalidated when a manual session closes to auto-resolve.
- Verdict/report handoff remains backend-owned.

Verification status:

- Final rollback smoke passed for representative Manual Trial Core flow:
  - forced Trial attempt through exploration helpers;
  - start Manual Runtime Session;
  - get Manual Runtime Manifest;
  - submit Action Log;
  - Backend Verdict;
  - game report handoff;
  - post-submit lifecycle: session `resolved`, manifest `consumed`, one action log, one verdict, `game_report_id` attached.

Current limitations:

- Concrete minigame validators are future work.
- Generated types must be regenerated before Codex consumes these contracts.

---

# 10. Combat and combat opponents

## Combat opponent admin/configuration

Core tables:

- `combat_opponent_families`;
- `combat_opponent_definitions`;
- `combat_opponent_stat_values`;
- `combat_opponent_attack_sources`;
- scaling/formula assignment tables where applicable.

Combat opponent admin/governance RPCs include:

- opponent definition/family read/admin surfaces;
- combat opponent scaling preview/read helpers;
- readiness/configurator surfaces referenced by M12/M-DB1/SCALE-DB1.

Rules:

- Concrete opponents need stats and at least one active attack source for runtime combat readiness.
- Scaling and previews should use formula-backed DB helpers where available.

## Generated PvE opponent equipment runtime snapshot

Combat opponent equipment can be configured as `equipment_mode = generated` / `entry_mode = generated`.

Runtime contract:

- `build_combat_opponent_equipment_loadout_snapshot(p_opponent_definition_id uuid, p_reference_level integer)`.

Semantics:

- Materializes manual/generated opponent equipment into a fight-local item-like snapshot.
- Produces snapshot JSON and `attackPlan`.
- Does not create player-owned `items`.
- Does not use generated item preview RPCs as runtime authority.
- Generated entries use DB RNG and item-generation component tables.
- The snapshot may include item-generation component refs such as `source_quality_key`, `source_base_id`, `source_prefix_affix_id`, `source_suffix_affix_id` and `opponent_equipment_entry_id`.

`build_opponent_combatant_snapshot_for_resolver(...)` now consumes this fight-local equipment snapshot where available and falls back to configured opponent attack sources / natural attack where no equipment attack source exists.

Frontend rules:

- Angular must not restore local item/Luck/affix RNG for PvE opponents.
- Angular must not use `preview_reward_generated_item_luck(...)` as runtime equipment source.
- Generated PvE opponent equipment is runtime DB-owned and fight-local, not player inventory.

## Combat result snapshots

Core concepts:

- `combat_results` and related participant/round/attack snapshot rows store durable combat outcomes.
- `get_combat_result_detail(...)` is the player/admin read surface where applicable.
- Reports may attach/show safe combat snapshots; player reports must not expose unrelated hidden equipment details.

## Live manual combat runtime

Current player-facing live combat RPCs:

- `ensure_exploration_combat_session(p_challenge_attempt_id uuid, p_request_id text)`;
- `get_combat_live_state(p_session_id uuid, p_since_event_index integer)`;
- `submit_combat_player_action(p_session_id uuid, p_timing_input_json jsonb, p_request_id text)`;
- `advance_combat_live_to_next_player_action(p_session_id, p_request_id default null)`.

The old public full-resolution exploration combat RPC must not be used.

Current manifest/authority rules:

- DB owns per-action timing manifest and result resolution.
- `build_combat_live_action_manifest(...)` uses DB/config/formula inputs such as `combat_hit_green_zone` and streak tuning.
- Streak modifies green-zone percent and speed multiplier server-side.
- `attackPlanEntry` in manifest should come from DB-owned attack plan.
- Angular submits timing input; DB decides action result.

Frontend must not resolve combat durability, damage, hit chance, streak, rewards or final outcome locally.

---

# 11. Guilds, politics, emergency elections and guild armory

## Guild foundation

Core guild tables:

- `guilds`;
- `guild_memberships`;
- `guild_roles`;
- `guild_invites`;
- `guild_join_requests`;
- `guild_emergency_elections` and related candidate/vote tables;
- `guild_armory_items`;
- `guild_armory_loans`;
- `guild_armory_access_locks`;
- `guild_armory_access_statuses`.

Guild rules:

- Guilds are server-scoped.
- Membership is hero-based.
- A hero has at most one active guild membership on a server.
- Leader/officer/member roles come from DB dictionaries.
- Guild creation/member limit/emergency timing/armory capacity come from guild config registry/summary.

## Guild config

Use `get_guild_config_summary()` for current resolved guild configuration summary.

Current summary fields:

- `creation_drachma_cost`;
- `member_base_limit`;
- `member_limit_per_leader_level`;
- `leader_inactivity_threshold_days`;
- `nomination_duration_minutes`;
- `voting_duration_minutes`;
- `emergency_max_candidates`;
- `armory_capacity`;
- `armory_capacity_is_unlimited`.

See section 2 for canonical `config_definitions.key` mapping.

## Guild identity/read models

Current player-facing owner-safe read RPCs:

- `get_hero_guild_state(p_hero_id)`;
- `get_hero_guild_dashboard(p_hero_id)`;
- `search_guilds_for_hero(p_hero_id, p_query default null, p_limit default 25, p_offset default 0)`;
- `get_hero_guild_members(p_hero_id)`;
- `get_hero_guild_invitation_rows(p_hero_id, p_include_terminal default false)`;
- `get_hero_guild_join_request_rows(p_hero_id, p_include_terminal default false)`;
- `get_hero_guild_armory_item_rows(p_hero_id)`;
- `get_hero_guild_armory_loan_rows(p_hero_id, p_include_terminal default false)`;
- `get_hero_guild_emergency_election_summary(p_hero_id)`;
- `get_hero_guild_emergency_election_candidate_rows(p_hero_id)`.

Rules:

- These are `SECURITY DEFINER`, authenticated and owner/read-safe through hero context.
- They use `hero.id`, not `auth.uid()`, as gameplay identity.
- They return relational/scalar rows rather than opaque authority payloads where possible.
- Angular must map rows into domain models, not expose raw generated rows in components.

## Guild discovery/search

`search_guilds_for_hero(...)` is the canonical T3 discovery/search read model.

Return fields:

- `guild_id`, `server_id`, `name`, `tag`, `status_key`;
- `member_count`, `member_limit`;
- `can_request_to_join`;
- `current_join_request_status_key`;
- `current_invite_status_key`;
- `total_count`.

Semantics:

- scoped to `hero.server_id`;
- active guilds only;
- query filters name/tag;
- `member_count` counted from active `guild_memberships`;
- `member_limit` via `get_guild_member_limit(guild_id)`;
- `can_request_to_join` accounts for hero ownership, normal gameplay block, active guild membership, fullness, pending request and pending invite.

Frontend must not direct-read guild tables for discovery/search and must not calculate member counts/limits/join eligibility locally.

## Guild member list and armory access

`get_hero_guild_members(p_hero_id)` now returns:

- `guild_id`;
- `member_hero_id`;
- `member_user_id` — pre-existing exposure in this contract;
- `member_name`;
- `role_key`;
- `role_label`;
- `membership_status_key`;
- `armory_access_status_key`;
- `joined_at`;
- `created_at`.

Armory access semantics:

- `blocked` when `guild_armory_access_locks.status_key = 'blocked'`;
- `allowed` otherwise, including no lock row.

Status dictionary:

- `allowed`;
- `blocked`.

Frontend T16 should map `armory_access_status_key` and use `set_guild_armory_member_access(...)` for changes.

## Guild mutation workflows

Core guild workflows include:

- `create_guild(...)`;
- `create_guild_invite(...)`;
- `respond_guild_invite(...)`;
- `create_guild_join_request(...)`;
- `review_guild_join_request(...)`;
- `cancel_guild_join_request(...)`.

Rules:

- Critical mutations require authenticated user, active hero, server/guild membership/role validation and reason/status reason where appropriate.
- Frontend must use canonical RPCs and must not direct-write guild tables.

## Emergency leader election

Emergency election is a leader-continuity flow only.

Rules:

- Triggered when leader inactive past configured threshold.
- Any active non-leader member may start if leader is inactive.
- Candidate can be any active member except inactive leader.
- One candidate is enough to proceed.
- No quorum / no 50%+1 all-member threshold.
- Highest votes wins; ties by earliest nomination.

RPCs:

- `start_guild_emergency_election(...)`;
- `nominate_guild_emergency_leader_candidate(...)`;
- `start_guild_emergency_election_voting(...)`;
- `vote_guild_emergency_election(...)`;
- `finalize_guild_emergency_election(...)`.

## Guild armory and loans

Guild armory is lending/borrowing, not trade.

Rules:

- Depositing does not change `items.hero_id`.
- Borrowing creates use permission/loan, not ownership transfer.
- Borrowed items may be equipped and used in runtime/loadout presets.
- Blocked members cannot borrow/deposit but can return borrowed items and may view read-only.
- Owner can withdraw own available item.
- Leader/officer can remove available items without confiscating ownership.
- Loans do not expire in first foundation.

RPCs/helpers:

- `guild_member_has_armory_access(p_guild_id, p_member_hero_id)` — helper, not UI contract;
- `deposit_guild_armory_item(...)`;
- `borrow_guild_armory_item(...)`;
- `return_guild_armory_loan(...)`;
- `force_return_guild_armory_loan(...)`;
- `withdraw_guild_armory_item(...)`;
- `remove_guild_armory_item(...)`;
- `set_guild_armory_member_access(...)`;
- `get_current_guild_armory_item_state(p_item_id)`;
- `can_hero_runtime_use_item(p_hero_id, p_item_id)`.

Item/equipment integration:

- Owners cannot equip deposited/borrowed-away items.
- Active borrowers can equip borrowed active guild armory items.
- Trade/auction/scrap/vendor actions must be blocked for current guild armory items unless a DB/RPC workflow explicitly permits the action.

---

# 12. Trade, auctions and vendor economy

## Currency boundary

- Direct player-to-player trade and auctions use Character Points.
- Vendor scrap/sell/building/system spending use drachmas/resources.
- Drachmas are not Character Points.

## Direct trade

Core tables:

- `player_trade_offers`;
- `player_trade_offer_items`;
- `player_trade_transactions`;
- `player_trade_transaction_items`;
- `character_point_locks`.

Rules:

- Items are transferred by ownership change through DB workflow, not by copying rows.
- Character Points are locked/spent/released by DB workflow.
- Frontend must not direct-write trade tables, item ownership or CP ledger/locks.

## Auctions

Core tables:

- `player_auction_listings`;
- `player_auction_bids`;
- auction transaction tables shared with trade where applicable.

Rules:

- One item per auction.
- Buy-now completes immediately.
- Auction without bids after expiry becomes expired and item returns to active.
- Direct trade and auction use active offer-slot logic for now.

## Vendor scrap

Vendor scrap uses `vendor_scrap_hero_item(...)` / `scrap_hero_item(...)` and pays drachmas according to DB-owned value/payout logic. It is not player-to-player trade.

---

# 13. PvP, protection, Prestige, reports and consequences

## PvP action foundation

PvP foundation includes action dictionaries, targeting/protection metadata, jobs/travel/protection runtime and result chain.

Core concepts:

- action kinds: `attack`, `spy`, future inactive `siege`;
- action statuses such as `travelling`, `arrived`, `manual_window`, `resolving`, `resolved`, `cancelled`, `failed`, `expired`;
- target eligibility/protection is DB/RPC-owned.

Rules:

- Frontend must not compute target legality, travel timing, protection expiry, resource transfer, XP reward, Prestige delta, reports or notifications as authority.

## PvP result chain

Current trigger/workflow chain includes:

- combat result → `create_pvp_attack_result_from_combat_result(...)`;
- PvP resource consequence → `apply_pvp_resource_consequences(...)`;
- PvP XP reward → `apply_pvp_xp_rewards(...)`;
- Prestige context/delta → `refresh_pvp_attack_result_prestige_context(...)` and `apply_pvp_attack_result_prestige(...)`;
- reports → `create_pvp_attack_game_report(...)`;
- anti-abuse signals → `generate_pvp_attack_anti_abuse_signals(...)`.

Current PvP resource consequence rules:

- resource types: `drachma`, `materials`, `workforce`;
- draws have no resource transfer;
- ordinary PvP does not transfer items, buildings, Character Points or estate ownership;
- resource transfer uses DB-owned formulas and current settled estate/resource state.

## Prestige foundation

Prestige is hero-scoped/server-scoped, hidden points + visible rank, DB/RPC-authoritative.

Core tables/helpers include:

- `hero_prestige`;
- `hero_prestige_ledger`;
- rank registry/threshold fields on `ranks`;
- `ensure_hero_prestige_state(...)`;
- `calculate_prestige_rank_from_points(...)`;
- `apply_hero_prestige_delta(...)`;
- PvP Prestige matrix/config helpers.

Player-facing rules:

- Players may see Prestige rank/name where public hero identity is shown.
- Players must not see raw Prestige points or numeric deltas.
- Admin/debug surfaces may expose raw before/after/delta/context.
- Rank-change notifications are created when rank number changes; ordinary point changes do not create separate notifications.

District/building rules:

- Prestige rank gates district privileges.
- Falling below district requirement does not delete estate/buildings or force relocation.
- New construction/relocation into gated districts must respect current Prestige/rank requirements.

---

# 14. Anti-abuse, moderation, audit and relationships

## Anti-abuse principles

- Anti-abuse creates signals/cases for review; it does not auto-punish.
- Player relationship declarations provide context but do not disable anti-abuse.
- Sanctions are explicit records and may be multiple per case.
- Reasons/status reasons are mandatory where decisions are made.

Core concepts/tables:

- anti-abuse signal types/signals;
- anti-abuse cases/participants/sanctions/sanction items;
- player relationship declarations and participants;
- player abuse reports;
- moderation action types/actions;
- Character Point penalties.

Important workflows/helpers include:

- anti-abuse case creation/grouping helpers;
- `add_anti_abuse_sanction_item(...)`;
- `apply_character_point_penalty_sink(...)`;
- moderation action create/update workflows;
- relationship declaration read/context helpers.

Rules:

- Frontend must not directly create sanctions, penalties, audit evidence or case links outside canonical RPCs.
- Staff/moderation UI must be server-scoped and gated.
- Anti-abuse signal generation for trade/auction/PvP is DB-owned.

## Audit

Audit helpers exist for config, anti-abuse, gameplay and item workflows. Frontend must not call low-level audit helpers for normal player actions. Audit is written by the domain workflow that owns the mutation.

---

# 15. Game reports and notifications

## Game reports

Game reports are gameplay-result reports. They are separate from abuse reports, audit logs and notifications.

Core concepts:

- `game_reports`;
- private/public report access models;
- source entity types: `combat_result`, `trial_result`, `encounter_result`, `pvp_result`, `siege_result`;
- item references for reward/drop showcase where safe.

Rules:

- Player reports show safe gameplay outcome context.
- Staff/admin debug reports may expose more context where gated.
- Report producers should be low-level RPC/domain producers, not Angular constructors.

## Notifications

Notifications are persistent UI attention events, separate from audit severity.

Core concepts:

- notification recipient kinds: `user`, `hero`, `staff`;
- notification severities: `info`, `notice`, `warning`, `critical`;
- notification types for trade/auction/PvP/Prestige/etc.;
- `create_notification(...)` as a DB workflow/helper.

Rules:

- Normal workflows create notifications as side effects where DB owns the event.
- Angular should consume notification read models and should not synthesize durable notification rows for gameplay outcomes.

---

# 16. Server Events

Server Events foundation is present in the latest dump and is not only a planning topic at DB layer.

## Core tables

- `server_event_definitions` — event registry/copy;
- `server_event_effects` — per-definition effect rows;
- `server_event_runs` — per-server concrete runs;
- `server_event_config` — per-server config with defaults.

## Supported effect families

- `base_stat`;
- `all_base_stats`;
- `luck`;
- `derived_stat`;
- `combat_derived`;
- `requirement_modifier`.

Supported operations:

- `flat_add`;
- `percent_add`;
- `multiplier`.

Rules:

- Server Events are server-scoped and affect every hero on a server.
- v1 has no sub-scope for district/guild/rank/origin/player group.
- Only one active event may exist per server.
- Events are temporary and use `starts_at` / `ends_at` / `actual_ended_at` semantics.
- Definitions do not have weights; automatic roll selects uniformly among active eligible definitions.
- Requirement modifiers apply to normal requirements, not Prestige/district gates.
- Server Events must not directly alter manual minigame mechanics such as Walking Dead renderer timing; effects flow through stats/Luck/derived/combat/runtime inputs.

## Player/runtime read helpers

- `get_active_server_event(p_server_id)`;
- `get_active_server_event_effects(p_server_id)`;
- `get_active_server_event_effect_modifier(p_server_id, p_target_family, p_target_key default null)`;
- `get_hero_server_event_runtime_modifiers(p_hero_id)`;
- `apply_server_event_requirement_modifier(p_server_id, p_requirement_definition_key, p_required_value)`.

## Admin/read/write surfaces

Read/admin:

- `get_server_event_config(p_server_id)`;
- `get_server_event_roll_status(p_server_id, p_now default now())`;
- `get_server_event_admin_definitions(p_server_id)`;
- `get_server_event_admin_overview(p_server_id)`;
- `get_server_event_admin_runs(p_server_id, p_limit default 50, p_offset default 0)`.

Governed/admin/service writes:

- `upsert_server_event_definition(...)`;
- `set_server_event_definition_active(...)`;
- `upsert_server_event_effect(...)`;
- `set_server_event_effect_active(...)`;
- `update_server_event_config(...)`;
- `manual_start_server_event(...)`;
- `cancel_server_event_run(...)`;
- `roll_server_event_for_server(...)`;
- `finish_expired_server_event_runs(...)`.

Frontend rules:

- Player UI should use `get_active_server_event(...)`.
- Admin UI should use admin read/write RPCs.
- Angular must not direct-write `server_event_*` tables.
- Angular must not calculate/apply event effects as gameplay authority.
- Server Council/proposal voting UI is not part of first Server Events frontend integration.

---

# 17. Security, RLS and grants conventions

- Player-facing read RPCs are generally `SECURITY DEFINER`, authenticated, and owner/read-safe through hero/server context.
- Player-facing mutations authenticate `auth.uid()`, validate hero ownership/active membership/server scope, and write audit/reason where appropriate.
- Tables may have authenticated SELECT grants/policies for read support, but critical gameplay mutations are RPC-owned.
- `anon` and `public` should not have execute on player/staff mutation RPCs unless explicitly intended.
- Service/internal helpers are not frontend contracts even when visible in generated types.

---

# 18. Recent DB/RPC blocker resolutions

Resolved for Codex after generated type regeneration:

- Manual Trial Runtime Foundation:
  - DB/RPC contracts exist for Trial Offer, start session, manifest read, action-log submit, backend verdict, report handoff and auto-resolve/inactivity/exit wrappers.
- U13 generated PvE opponent equipment:
  - runtime DB helper exists for fight-local generated/manual opponent equipment snapshot and attack plan;
  - no frontend item/Luck/affix RNG fallback is allowed.
- V10 Drop distribution simulation:
  - `preview_reward_generated_item_distribution_luck(...)` exists as DB-owned distribution summary RPC;
  - Angular must not run item/drop distribution simulation locally.
- Admin balance draft MVP first vertical slice:
  - active global balance draft;
  - relational entity draft entries;
  - draft compression;
  - first-slice allowlist;
  - item/formula overlay;
  - draft-aware generated item preview;
  - atomic apply for first-slice domains.

Known follow-ups not to overstate:

- Manual Trial concrete minigame validators remain future work.
- Reward profile / reward profile entries / trials / encounters are enum-covered for draft governance, but not allowlist/apply-enabled yet.
- Draft-aware reward profile preview is not included in the first balance draft vertical slice.
- Luck Lab registry may need a later UI-facing registry update if Codex relies exclusively on `get_luck_lab_preview_contracts()` for panel discovery.
- Generated PvE opponent equipment contract exists, but representative generated-equipment content smoke depends on active configured generated opponent equipment data.

---

# 19. Current cleanup candidates / legacy caveats

Do not drop these without explicit cleanup task and reference search:

- `hero_derived` — physical legacy, not runtime source of truth.
- `item_generation_bases.slot` — legacy/deprecated; use `base_type_key` and DB metadata.
- legacy bonus join tables such as old origin/item/building bonus tables — transitional; new paths use `entity_bonuses`.
- inactive legacy Trial `strength` — superseded by active `strength_trial`.
- old requirement JSON/legacy requirement columns — replaced by central `entity_requirements` for new paths.
- old notes implying manual combat full-resolution RPC or non-streak manifest — superseded by live combat session model.

Cleanup candidates should be reported, not silently removed.

---

# 20. Manual smoke discipline

Structural verification of DB/RPC contracts is not the same as full manual smoke.

Acceptable data skips seen in current sandbox:

- guild discovery positive join eligibility cannot be fully exercised without active guild + eligible requester hero;
- guild member armory access block/unblock cannot be exercised without active guild leader/officer + regular member pair.

When data is missing, report `SKIPPED / data-dependent`, not PASS. When signature/grants/read model checks pass, report them separately as structural/contract PASS.

For gameplay closure, later manual smoke should verify:

- real Trial completion → reward result with XP/item grants;
- resource/buff/debuff Encounter result when UI/runtime can surface them;
- guild discovery/search and join request flow with at least two heroes on one server;
- guild armory access lock state changes with leader/officer + member data;
- Server Events player and admin surfaces after generated types are current.
