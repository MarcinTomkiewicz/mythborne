# Mythsworn — Database Current

Rewritten: 2026-05-11  
Updated: 2026-05-31  
Primary source: latest `mythsworn_schema.sql` dumps from 2026-05-31, including the later 07:18 dump, plus the previous `database-current.md` and DB/RPC changes verified in the Migrator conversation. The 2026-05-31 sync preserves the 2026-05-15 content and adds current player page-context RPCs, slim JSON payload contracts, origin bonus seed state, item requirement/family rebalance notes and no-grant restore policy. This file was additionally refreshed after the slim page-context payload pass and the later player-facing copy/read-model cleanup pass: dashboard/vicinity use lightweight estate summaries, estate progression previews are deferred, per-building progression preview is loaded on demand, Attributes/Armory/Estate page contexts expose sanitized DB-owned Polish label/copy contracts, Armory equipment preview slots are canonical camelCase JSON, and Vicinity exposes a v2 sanitized address-capacity/occupied-estate contract.

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

Known regeneration-required contracts after the 2026-05-11 DB/RPC updates and later post-dump Migrator changes:

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
- Epic W report/reward/effect read-model completion:
  - `get_exploration_step_reward_read_model(p_step_id uuid)`;
  - `get_exploration_challenge_reward_read_model(p_challenge_attempt_id uuid)`;
  - changed `get_hero_game_report_detail(...)` return signature with `trial_section_json`, `encounter_section_json`, `reward_section_json`, `effect_section_json` and `related_reports_json`;
  - changed `get_public_game_report_by_token(...)` return signature with the same report section payloads;
  - `build_game_report_trial_section_json(...)`;
  - `build_game_report_encounter_section_json(...)`;
  - `build_game_report_combat_section_json(...)`;
  - `build_game_report_reward_section_json(...)`;
  - `build_game_report_effect_section_json(...)`;
  - `build_game_report_related_reports_json(...)`;
  - `attach_reward_grant_items_to_game_report(...)`;
  - updated `get_hero_exploration_state(...)` active-effect payload fields where consumed by UI.
- Epic X start-flow contracts:
  - `get_start_flow_server_availability()`;
  - `get_start_flow_origin_options()`;
  - `create_hero_start_flow(p_server_id uuid, p_origin_id uuid, p_hero_name text, p_request_id text default null)`;
  - `format_start_flow_bonus_value(...)`;
  - `start_flow_resolve_character_point_reason()`.
- UI-HERO-2 / attribute allocation preview manifest:
  - `get_hero_attribute_allocation_preview_manifest(p_hero_id uuid)`;
  - `contractVersion = hero_attribute_allocation_preview_manifest_v2`;
  - frontend consumption requires regenerated RPC return typing before Angular integration.
- Account-entry existing hero selector:
  - `get_account_entry_hero_contexts(p_server_id uuid default null)`.
- PvP role/return-runtime helper contracts where consumed by frontend/generated types:
  - `resolve_hero_pvp_role_health_bonus(p_hero_id uuid, p_role text)`;
  - `build_pvp_hero_combatant_snapshot_for_resolver(p_hero_id uuid, p_side combat_side)`;
  - `schedule_pvp_action_return_runtime_activity(...)`;
  - `complete_due_pvp_return_runtime_activities(...)`.
- Player route/page-context RPCs added after the no-grants restore pass and subsequent slim-payload pass:
  - `get_player_dashboard_page_context(p_hero_id uuid)`;
  - `get_player_attributes_page_context(p_hero_id uuid)`;
  - `get_player_armory_page_context(p_hero_id uuid)`;
  - `get_player_estate_page_context(p_hero_id uuid)`;
  - `get_player_vicinity_page_context(p_hero_id uuid)`;
  - `get_player_trade_page_context(p_hero_id uuid, p_limit integer default 50, p_offset integer default 0)`;
  - `get_player_auction_page_context(p_hero_id uuid, p_limit integer default 50, p_offset integer default 0)`;
  - `get_hero_estate_summary_state(p_hero_id uuid)`;
  - `get_player_estate_building_progression_preview_context(p_hero_id uuid, p_building_id uuid, p_from_level integer default 0, p_to_level integer default 10)`.

No type regeneration is required for data-only seeds or same-signature function body fixes, including:

- guild config key-contract clarification;
- item fractional display/runtime rounding body fixes;
- Epic W Trial/Encounter seed/readiness repair;
- body-only static-grep cleanup in generated opponent equipment helpers;
- origin bonus rewrite data seed;
- `dew_touched` display-form seed correction;
- item-generation requirement/family/base requirement data-only rebalance;
- `Triumfalny` / `Ceremonialny` / `Przepychu` requirement trim;
- same-signature function body fixes for player page-context RPCs;
- same-signature copy/sanitizer body fixes for existing JSON page-context RPCs, including Attributes derived-stat labels, Armory copy/storage/item-detail/equipment-slot labels, Estate sanitized building runtime payloads and Vicinity address-capacity/occupied-estate payload cleanup;
- same-signature slim-payload fixes to existing page-context RPCs, such as replacing full dashboard/vicinity estate runtime with lightweight `estateSummary`, deferring estate progression previews, normalizing Armory equipment slots to camelCase and sanitizing Vicinity address-capacity/occupied-estate payloads.

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

## Start flow / onboarding contracts

Epic X now has DB/RPC-owned start-flow contracts. They are canonical for server entry, origin selection and hero creation. Angular must consume these contracts and must not recreate hero creation through direct table writes.

Read contracts:

- `get_start_flow_server_availability()` returns authenticated user-visible server rows with server identity, kind/status, membership status, user hero count, default hero, sandbox hero list, District A capacity/occupied/free counts, `can_create_hero`, `can_enter_game`, `next_action`, `block_reason` and `eligibility_json`.
- `get_start_flow_origin_options()` returns DB-backed origin options from `origin` plus canonical `entity_bonuses(entity_type = origin)` display data. It includes origin id/key/label/description, sort order, `bonuses_json` and `bonus_summary_text`.

Account-entry existing hero selector:

- `get_account_entry_hero_contexts(p_server_id uuid default null)` is the canonical player-safe read model for `/auth/server-entry` existing hero selection/detail cards.
- It requires `auth.uid()`, returns only heroes owned by the authenticated account, and can optionally filter by server.
- It does not switch active hero and does not require frontend direct reads from `hero` or `estates`.
- Returned relational columns include `hero_id`, `server_id`, `server_key`, `server_name`, `hero_name`, `hero_level`, `estate_id`, `district_code`, `address_number`, `address`, `address_label`, `created_at`, `route_next_action`.
- `hero_context_json` exposes stable camelCase keys for frontend mapping: `heroId`, `serverId`, `serverKey`, `serverName`, `heroName`, `heroLevel`, `estateId`, `districtCode`, `addressNumber`, `address`, `addressLabel`, `createdAt`, `routeNextAction`.
- UI should prefer `addressLabel` for compact display and fall back to `address`.
- Expected existing-hero route action is `hero_dashboard`.

Creation contract:

- `create_hero_start_flow(p_server_id uuid, p_origin_id uuid, p_hero_name text, p_request_id text default null)` is the canonical atomic hero creation RPC.
- It authenticates through `auth.uid()`, validates target server availability via `get_start_flow_server_availability()`, validates the origin, validates hero name, and uses a server-level advisory lock for address/name-sensitive creation.
- It enforces server-local hero name uniqueness and District A starting-address availability.
- It creates `hero` with `user_id = auth.uid()`, selected server, selected origin, level 1, experience 0, `character_points = 1000`, `total_character_points_earned = 1000`.
- It seeds only existing canonical base stats from `public.stats` in the nine-stat order: `strength`, `dexterity`, `endurance`, `agility`, `cunning`, `charisma`, `wisdom`, `intelligence`, `spirituality`. Each starts at `1`. It does **not** insert `luck` into `hero_stats`.
- It seeds durable `hero_resources` rows for `drachma`, `materials` and `workforce`, all starting at `amount = 0` and `per_hour = 0`.
- It creates and binds a starting `estates` row in district `A` using a randomly selected free address from `estate_district_address_capacities`. The frontend does not choose or preview this address before creation.
- It runs `ensure_estate_building_baseline(...)`, writes a starting `character_point_ledger` row, initializes Prestige through `ensure_hero_prestige_state(...)`, and best-effort writes audit through known audit action keys without making missing audit dictionary rows fatal to hero creation.
- It returns the created hero, origin, estate/address, starting Character Points ledger id, Prestige rank, resources, hero stats, `created_new_hero = true`, and `route_next_action = 'stat_allocation'`.

Helper contracts:

- `format_start_flow_bonus_value(...)` formats origin bonus values for the origin read model.
- `start_flow_resolve_character_point_reason()` chooses a usable `character_point_ledger_reason` enum value for start-flow CP ledger entries from current enum reality. It exists to avoid hardcoding an enum value that may not exist in older dumps.

Rules:

- Standard server with an existing user hero routes to existing hero/game entry, not new hero creation.
- Standard server without a hero routes to creation only if the server is live, the user is not suspended/banned and District A has free capacity.
- Sandbox/test servers may allow staff/tester multi-hero creation; default sandbox hero is the earliest created hero unless a more explicit selector exists.
- `user_has_hero_on_server(...)` remains too small for Epic X by itself; use `get_start_flow_server_availability()` for player routing and eligibility.

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

## Generic localization/content text registry

The 2026-05-31 schema also includes a generic localization foundation for DB-backed copy and label cleanup:

- `locale_definitions` — dictionary of supported UI/content locales. Locale keys are BCP-47-like lowercase keys such as `pl`, `en` or `en-us`.
- `localized_entity_texts` — generic table for localized entity fields such as `label`, `description`, `helper_text` and `admin_description`. It is keyed by `(entity_type, entity_key, field_key, locale_key)` and keeps `metadata_json`, source-locale metadata and active state.
- `normalize_locale_key(p_locale_key text)` — normalizes requested locale keys; empty/null defaults to `pl`.
- `get_localized_entity_text(p_entity_type, p_entity_key, p_field_key, p_locale_key default 'pl', p_fallback default null)` — generic localization resolver. Resolution order is requested locale, base locale, `pl`, `en`, fallback, then entity key.
- `get_stat_label(p_stat_key, p_locale_key default 'pl', p_fallback_label default null)` — locale-aware stat label helper; new code should prefer it over language-specific wrappers.
- `hero_stat_label_pl(...)` remains a compatibility wrapper over the locale-aware helper.

Current grants/policies intentionally do not make the localization tables direct frontend dictionaries. Frontend should consume copy through canonical RPC/read-model payloads such as page contexts, `get_start_flow_origin_options(...)`, UI metadata RPCs or future dedicated copy contracts. Do not add table grants to `locale_definitions` or `localized_entity_texts` just to render labels in Angular.

---

# 4. Stats, progression, Character Points and Fatum/Fate

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

Start-flow creation seeds exactly these canonical base stats at value `1`. `luck` is a special/derived/runtime value and must not be inserted into `hero_stats`. Player-facing Polish copy must call this stat **Fatum**. Player-facing English copy should call it **Fate**, not Luck. Origin bonuses are displayed and resolved through the bonus model; they are not copied into base stat rows during creation.

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

## Attribute allocation draft preview manifest / UI-HERO-2

Canonical one-shot preview manifest:

- `get_hero_attribute_allocation_preview_manifest(p_hero_id uuid) returns jsonb`;
- current contract version: `hero_attribute_allocation_preview_manifest_v2`;
- player-safe: requires `auth.uid()`, checks `hero.user_id = auth.uid()`, and asserts normal gameplay use;
- owner context is applied for nested owner-safe helpers;
- intended frontend path: `/hero/attributes`;
- this is a page-load manifest, not a per-click preview RPC.

UI-HERO-2 rules exposed by the manifest:

- `rules.oneShotManifest = true`;
- `rules.perClickRpcPreviewRequired = false`;
- `rules.frontendMayEvaluateLocally = true`;
- `rules.frontendMayUseEval = false`;
- `rules.frontendMayGuessFormulas = false`;
- `rules.saveAuthority = canonical_db_rpc_workflow`;
- `rules.pvpRoleScopedHealthExcludedFromAttributePreview = true`;
- after save, frontend must refresh current runtime stats from DB.

Manifest top-level payload:

- `contractVersion = hero_attribute_allocation_preview_manifest_v2`;
- `heroId`, `serverId`, `generatedAt`, `source`;
- `baseStatInputs`: object keyed by base stat key. Each row includes `currentAllocatedValue`, `currentEffectiveValue`, `additiveContextDelta`, `draftVariable`, `effectiveVariable`, `sourceRows`, and an `allocated_plus_context_delta` descriptor. Frontend derives effective draft stats from DB-provided context instead of guessing stat aggregation.
- `allowedDraftVariables` and `allowedEffectiveVariables` for the safe descriptor interpreter.
- `currentRuntimeSnapshot`: current DB runtime values plus `attributePreviewMaxHealth` and DB-provided damage preview rows.
- `bonusContext`: player-safe current bonus totals/context for display and descriptor inputs.
- `supportedDerivedStats`: descriptor-backed values that Angular may preview locally.
- `unsupportedDerivedStats`: current-only values with `unsupportedReason` and `uiPolicy`.
- `frontendEvaluationPolicy`: descriptor whitelist and unknown-descriptor behavior.

Supported local-preview stats in v2:

Raw `get_hero_attribute_allocation_preview_manifest(...)` may still contain internal English labels in the schema body. The player page context sanitizes `attributeManifest.supportedDerivedStats[]` and `unsupportedDerivedStats[]` through DB-owned label helpers before Angular receives it.

Current player-facing label contract from `get_player_attributes_page_context(...)`:

| statKey | label |
|---|---|
| `health` | `Punkty życia` |
| `defense` | `Obrona` |
| `damage_rows` | `Obrażenia` |
| `critical_chance` | `Szansa krytyczna` |
| `critical_damage` | `Obrażenia krytyczne` |
| `evasion_chance` | `Unik` |
| `current_health` | `Aktualne punkty życia` |
| `luck` | `Fatum` |
| `attack_count` | `Liczba ataków` |

Helper/sanitizer functions introduced for this label contract:

- `player_derived_stat_label(p_stat_key text, p_locale_key text default 'pl', p_fallback_label text default null)`;
- `sanitize_player_attribute_manifest_derived_entry_json(p_entry_json jsonb)`;
- `sanitize_player_attribute_manifest_derived_array_json(p_entries_json jsonb)`;
- `sanitize_player_attribute_manifest_json(p_manifest_json jsonb)`.

Supported local-preview stats in the manifest:

- `health`:
  - value kind: `value`;
  - draft dependency: `endurance`;
  - descriptor kind: `linear_stat_scaled_sum_v1`;
  - formula semantics: `max(1, (30 + effectiveStats.endurance * 5 + additiveConstants) * percentMultiplier * multiplier)`;
  - `additiveConstants` include player-safe flat Health context and Health event flat delta;
  - PvP role-scoped Health from Koszary/Forteca is explicitly excluded;
  - this previews max Health only, not mutation of current Health.
- `defense`:
  - draft dependency: `endurance`;
  - descriptor kind: `max_zero_scaled_sum_v1`;
  - formula semantics: effective Endurance plus DB-provided defense bonuses/event context, clamped at zero.
- `damage_rows`:
  - value kind: `damage_rows`;
  - draft dependency: `strength`;
  - descriptor kind: `damage_rows_strength_delta_v1`;
  - rows include `label`, `rowKey`, `slotKey`, `sourceItemId`, `currentMin`, `currentMax`, `currentDisplayValue`, `currentStrength`, `strengthVariable`, `formulaDescriptor`, and the original DB `sourceRow`;
  - frontend may only apply Strength delta to DB-provided rows: `draftMin = currentMin + (draftEffectiveStrength - currentStrength)` and `draftMax = currentMax + (draftEffectiveStrength - currentStrength)`;
  - frontend must not rebuild attack plan, item grouping, equipment source rows, attack count or item modifier logic locally.
- `critical_chance`, `critical_damage`, `evasion_chance`:
  - currently supported as descriptor/current-context values, but have no draft dependencies unless a future DB contract adds stat-based dependencies;
  - frontend should render current/constant preview and must not invent Dexterity/Agility/Cunning formulas.

Unsupported/current-only in v2:

- `current_health`: current Health is runtime state; show current value only.
- `luck`: DB-owned runtime logic; show current snapshot only; label as `Fatum` in Polish player UI and `Fate` in English player UI.
- `attack_count`: DB attack plan/equipment projection; show current snapshot only.

Descriptor whitelist in v2:

- `allocated_plus_context_delta`;
- `max_zero_scaled_sum_v1`;
- `linear_stat_scaled_sum_v1`;
- `damage_rows_strength_delta_v1`;
- `runtime_context_constant_for_stat_allocation_v1`.

Frontend/Codex contract for UI-HERO-2:

- Regenerate Supabase types before consuming new/changed RPC signatures. Same-signature page-context label sanitizers do not require regeneration by themselves.
- Do not use `eval`.
- Do not parse display strings for math.
- Do not call the preview RPC per plus/minus click.
- Unknown descriptor kind must be treated as unsupported.
- Durable stat save remains through canonical DB/RPC stat allocation workflow.

Expected behavior from the v2 manifest:

- `+1 Endurance` previews Defense increasing by the descriptor-calculated amount, currently usually `+1` when no percent/multiplier context applies.
- `+1 Endurance` previews max Health increasing by `+5` before any DB-provided Health percent/multiplier context.
- `+1 Strength` previews every DB-provided damage row by shifting min/max by the Strength delta, e.g. `35-51 -> 36-52`.

## Fatum / Fate foundation

The technical/runtime key may still be `luck` for compatibility, but player-facing Polish copy is **Fatum** and player-facing English copy is **Fate**. Fatum/Fate is DB/RPC/formula-authoritative and affects opportunities, ranges and distributions rather than guaranteeing perfect outcomes.

Core Fatum/Fate helpers/RPCs, many of which still contain `luck` in their technical name:

- `get_hero_luck_breakdown(p_hero_id)`;
- `get_hero_luck_value(p_hero_id)`;
- `get_hero_exploration_luck_value(p_hero_id)`;
- `calculate_luck_influence(p_luck_value)`;
- `calculate_trial_power(p_tested_stat_value, p_luck_value)`;
- `get_hero_trial_power(p_hero_id, p_tested_stat_key)`;
- `preview_luck_influence_and_trial_power(...)`.

Fatum/Fate-aware exploration/trial helpers:

- `get_trial_opportunity_chance(p_exploration_id)`;
- `get_trial_manifestation_chance(p_exploration_id, p_trial_definition_id)`;
- `get_challenge_auto_resolve_success_chance(p_challenge_attempt_id)`;
- `get_non_trial_encounter_chance(p_exploration_id)`.

Fatum/Fate Lab registry/preview:

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

Frontend must consume DB/RPC Fatum/Fate outputs and must not hardcode curves, reward ranges, Trial modifiers, drop chances or combat RNG influence. When mapping labels, use DB/RPC-provided label fields; do not translate `luck` locally as `Szczęście`.

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

## Building bonus preview and PvP role-scoped Health

Current building bonus preview support includes hero-aware formula resolution:

- `resolve_hero_building_bonus_preview_value(p_hero_id, p_building_id, p_entity_bonus_id, p_current_level, p_rank default 1)`;
- this helper is required for building bonuses whose preview depends on hero-specific context such as a scaling stat;
- `get_hero_estate_runtime_state(p_hero_id)` uses this hero-aware helper for player-facing building `bonusesJson`.

Mansion/estate building `bonusesJson` exposes effective display metadata for scoped building bonuses, including:

- `targetLabel` / `displayLabel`;
- `scopeKey`, `scopeLabel`, `effectiveScopeKey`, `effectiveScopeLabel`;
- `templateScopeKey`;
- `scopeOverrideKey`;
- `scalingStatKey`, `scalingStatLabel`, `scalingStatValue`;
- `currentValue`, `nextValue`, `displayValue`, `nextDisplayValue`, `deltaDisplayValue`;
- `displayContract = building_bonus_effective_scope_display_v2`.

Frontend must render DB-provided values and labels. It must not recompute building preview values from `baseBonus`, `currentLevel` and `nextLevel`, because some bonuses are stat-scaled.

PvP role-scoped building Health semantics:

- Koszary (`buildings.key = barracks`) use existing `health_flat` template with `scope_key_override = pvp_attack`, `scaling_stat_key_override = cunning`, and formula `pvp-role-building-health-linear`.
- Forteca (`buildings.key = fortress`) uses existing `health_flat` template with `scope_key_override = pvp_defense`, `scaling_stat_key_override = intelligence`, and formula `pvp-role-building-health-linear`.
- Formula semantics: `buildingLevel * baseBonus * scalingStatValue`; current seed uses `baseBonus = 1`.
- Koszary therefore add PvP attacker Health equal to `barracksLevel * Cunning`.
- Forteca adds PvP defender Health equal to `fortressLevel * Intelligence`.
- These bonuses do not modify dashboard/base Health and are not included in `/hero/attributes` max-Health allocation preview.

Runtime PvP snapshot helpers:

- `resolve_hero_pvp_role_health_bonus(p_hero_id, p_role)` returns the role-scoped Health bonus row for attacker/defender preview/runtime.
- `build_pvp_hero_combatant_snapshot_for_resolver(p_hero_id, p_side)` wraps the base combatant snapshot and applies the correct PvP role-scoped Health bonus only inside PvP combat snapshots.
- `ensure_pvp_combat_session(...)` and `settle_due_pvp_attack_action(...)` use the PvP-aware snapshot path in current DB/RPC state.

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

Current player-facing building runtime notes added after the 2026-05-15 and 2026-05-31 Migrator work:

- `get_hero_estate_runtime_state(p_hero_id)` remains the full settled estate runtime builder. It may contain technical/explainability data internally.
- `get_player_estate_page_context(p_hero_id)` is the canonical `/game/estate` bootstrap and returns a **sanitized** `estateRuntimeState` plus `copyJson`; Angular must not direct-read `buildings`, `entity_bonuses`, `entity_requirements`, formula tables, `estate_districts` or `building_district_level_caps`.
- Embedded `upgradePreviewJson` rows in the sanitized page context keep player-safe fields only: `contractVersion`, current/target/next level, max state, `buildTimeSeconds`, canonical `resourceCostsJson`, canonical `requirementsJson` and sanitized `bonusesJson`.
- `resourceCostsJson[]` uses the canonical label/value shape: `resourceType`, numeric `amount`, `displayLabel`, `displayValue`, `sortOrder`. It must not expose duplicate `cost`, formula/source fields or admin/debug explanation fields in the player page payload.
- `requirementsJson[]` uses the canonical label/value shape: `requirementDefinitionKey`, target key where applicable, numeric `requiredValue`, `displayLabel`, `displayValue`, optional `displayUnit`, `context`, `sortOrder`, `entityRequirementId`.
- `bonusesJson[]` in the player page context keeps player-safe `displayText`, `nextDisplayText`, `deltaDisplayText`, values, target label/description/helper and scope/target/type keys. Formula labels/expressions/sources and bonus template labels are removed from page payload.
- Hippokaion is a District A building for attack travel-time reduction. It uses `pvp_travel_time_reduction_percent`, linear capped preview semantics, and the PvP travel resolver caps final reduction at 50% with minimum attack/spy travel floors. Current player-facing description: `Zaplecze jeździeckie i stajnie, które skracają czas dotarcia do posiadłości innych bohaterów podczas ataku.`
- Resource buildings Agora/Farm/Lumber Mill remain production-focused and should be tuned through building costs, bonus values and requirements rather than frontend formulas.
- Zbrojownia/Armory controls visible item capacity through the `visible_item_capacity` target. It should not be reinterpreted as generic item storage ownership.
- Koszary/Forteca are role-scoped PvP Health buildings as described in the bonus section; they do not affect base/dashboard Health.

Estate page-context copy/sanitizer helpers:

- `get_player_estate_copy_json()`;
- `sanitize_player_estate_bonus_json(jsonb)`;
- `sanitize_player_estate_bonus_rows_json(jsonb)`;
- `sanitize_player_estate_resource_json(jsonb)`;
- `sanitize_player_estate_resources_json(jsonb)`;
- `sanitize_player_estate_upgrade_preview_json(jsonb)`;
- `sanitize_player_estate_building_json(jsonb)`;
- `sanitize_player_estate_buildings_json(jsonb)`;
- `sanitize_player_estate_runtime_state_json(jsonb)`.

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

- Player-facing item stats show native/base `Obrażenia` for weapons and `Obrona` for armor/shields.
- Native/default/technical rows such as base attack count may be hidden or technical according to `item_generation_base_type_targets` display policy.
- Modifier rows feed Bonuses.
- `consumedModifierRows` identify modifiers folded into native final stats to prevent double-counting.
- `itemType` and `equipTarget` are DB-owned fields in `bonuses_json`; Angular must not infer player-facing type/slot from `base_type_key`.
- Player-facing item value must use structured copy: label `Wartość w drachmach`, value = numeric drachma value. Do not render `Value: ... drachma` or raw `drachma` as a unit.
- Armory item/detail/runtime payloads are sanitized through DB helpers so common labels come from DB/RPC, not Angular maps: `Damage -> Obrażenia`, `Defense -> Obrona`, `Main hand -> Główna ręka`, `Off hand -> Druga ręka`, `Unarmed -> Bez broni`, `Origin -> Pochodzenie`, `Luck -> Fatum`.

Armory label/value sanitizer helpers:

- `player_armory_text_pl(p_value text, p_field_key text default null)`;
- `player_armory_quality_label_pl(p_quality_key text)`;
- `player_armory_slot_label_pl(p_slot_key text)`;
- `player_armory_item_type_label_pl(p_base_type_key text)`;
- `sanitize_player_armory_jsonb_labels(p_json jsonb)`;
- `sanitize_player_armory_item_row_json(p_item_json jsonb)`;
- `sanitize_player_armory_item_detail_bonuses_json(p_bonuses_json jsonb, p_drachma_value integer default null)`;
- `sanitize_player_armory_equipment_slot_json(p_slot_json jsonb)` — normalizes `get_player_armory_page_context(...).equipmentSlots[]` to canonical camelCase (`slotKey`, `slotLabel`, `slotItemState`, etc.) while the raw slot helper may remain snake_case.

`get_hero_armory_item_detail(...)` preserves the core path `get_hero_armory_item_detail_core(...)` -> `aggregate_item_detail_modifier_rows(...)`, then sanitizes the returned `bonuses_json`. `get_player_armory_page_context(...)` sanitizes item rows, normalizes equipment slots to camelCase and sanitizes `runtimeDerivedStats`.

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

## Exploration reward read models

W11 added canonical player-safe reward read models for `/game/exploration`. These are the preferred UI reward sources after an Exploration step/challenge resolves.

- `get_exploration_step_reward_read_model(p_step_id uuid)` returns a player-safe resolved step reward card model for direct non-combat Encounter step rewards and step-linked challenge rewards. It includes step/encounter/challenge identity, source label, reward grant, profile, persisted `reward_entries_json`, `generated_items_json`, status labels and no-reward reason labels/helper text.
- `get_exploration_challenge_reward_read_model(p_challenge_attempt_id uuid)` returns the equivalent challenge-owned reward model for completed Trial or combat Encounter challenge attempts.

Rules:

- These read models do not infer rewards from Armory, latest challenge fallback, selection diagnostics or raw sandbox debug state.
- Generated items should be read from these exact source read models and/or report reward/item reference sections, not reconstructed from `items` by guessing.
- Resource rewards use `reward_entries_json` with entry kind/resource type/amount and profile entry labels/helper text.
- Item-generation rewards expose `generated_items_json` where the reward grant has generated item rows.
- No-reward states are explicit through `reward_status_key`, `no_reward_reason_key`, labels and helper text.

## Report item references for generated rewards

Game reports may include generated reward items both in `reward_section_json.entries` and in `item_references_json`.

- `attach_reward_grant_items_to_game_report(p_report_id uuid, p_reward_grant_id uuid, p_reason text default ..., p_request_id text default null)` attaches generated `item_generation` reward entries to `game_report_item_references` via `attach_reward_drop_item_to_game_report(...)`.
- The helper is idempotent and does not regenerate rewards or items.
- Report producers/backfills should use it when generated reward items need showcase references in private/public report detail.

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

- `get_hero_exploration_state(p_hero_id, p_difficulty_key text)`;
- `start_hero_exploration_step(...)`;
- `resolve_hero_exploration_step(...)`;
- `get_hero_exploration_debug_state(...)`;
- `get_exploration_step_reward_read_model(...)`;
- `get_exploration_challenge_reward_read_model(...)`.

Rules:

- Runtime state and timers are DB-owned.
- Angular must not direct-write exploration runtime tables.
- Player-facing persistent mutations go through canonical PvE/exploration RPCs.
- Read policies/grants are read-only; mutation authority remains RPC-owned.

## Active exploration effects

Temporary Exploration buff/debuff state is stored in `hero_exploration_effects` and defined by `exploration_effect_definitions`. The active effect read contract is `get_hero_exploration_state(...).activeEffect`.

Current `activeEffect` payload is enriched with player-facing fields from `exploration_effect_definitions`, `bonus_templates`, `bonus_types`, `bonus_targets` and `bonus_scopes`, including both camelCase and snake_case variants for UI compatibility:

- effect identity/copy: `effectKey`, `effectLabel`, `effectDescription`, `effectHelperText`, `effectKindLabel`;
- duration/value: `defaultValue`, `defaultDurationSteps`, `valueDisplay`;
- bonus metadata: `bonusTemplateKey`, `bonusTemplateLabel`, `bonusTypeKey`, `bonusTypeLabel`, `effectTargetKey`, `effectTargetLabel`, `effectScopeKey`, `effectScopeLabel`;
- player summary: `playerSummary`, e.g. `Minor fatigue: -10 Endurance` or `Critical chance: +10% Critical chance`;
- lifecycle: `status`, `is_active`, `applied_at`, `consumed_at` from the underlying effect row.

Rules:

- Angular should display DB-returned labels/summary/value, not infer target/stat/effect copy locally.
- The current storage rule is one active Exploration effect per exploration (`hero_exploration_effects_one_active_idx`).
- `consume_active_exploration_effect(p_exploration_id, p_consumed_by_kind, p_consumed_by_id)` consumes active effects when the runtime flow decides they were used by a Trial/combat Encounter/etc.
- Effect application happens through `grant_reward_profile_to_hero(...)` for `exploration_effect` reward entries when an Exploration context is available.

## Trial manifestation semantics

A Trial opportunity and a Trial manifestation are separate states. A failed manifestation is not ordinary Nothing Found.

Current DB/report semantics:

- The resolved step may still have `outcome_kind = 'trial_opportunity'` because the opportunity appeared.
- A `hero_exploration_challenge_attempts` row is created for the attempted Trial source.
- When manifestation fails, the challenge attempt has `status = 'manifestation_failed'`, `manifestation_status = 'failed'`, `success = false`, and no reward grant.
- Trial report detail uses `build_game_report_trial_section_json(...)` and returns player-facing section fields: `trialManifested = false`, `manifestationStatus = 'failed'`, `resultKind = 'trial_manifestation'`, `resultKey = 'trial_manifestation_failed'`, `outcomeKind = 'trial_manifestation_failed'`, `outcomeLabel = 'Trial did not manifest'`.
- UI should use these report/read-model fields and must not collapse failed manifestation into the ordinary `nothing` state.

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


## PvP travel, spy, return runtime and role-scoped snapshots

Additional current PvP contracts verified in the Migrator conversation:

- `start_pvp_action(...)` is DB-owned for target validation, travel time, protection and runtime activity creation. Frontend must not compute travel/protection as authority.
- Spy actions resolve to `pvp_spy_results` through DB helpers and produce a player-facing report/notification chain. Report display may still require frontend support, but result/report creation is DB-owned.
- Due PvP actions are settled through `settle_due_pvp_actions_for_hero(...)` / internal helpers before active runtime activity reads where applicable.
- After attack or spy result resolution, the attacker gets a return runtime leg. `schedule_pvp_action_return_runtime_activity(...)` schedules the return, and `complete_due_pvp_return_runtime_activities(...)` clears due return activities.
- The intended runtime rule is: outbound travel time is mirrored by return travel time; a hero may not start the next blocking action until the return activity is complete.
- `get_hero_active_runtime_activity(p_hero_id)` should complete due return activities before reporting the hero as busy.
- PvP combat snapshots must use `build_pvp_hero_combatant_snapshot_for_resolver(...)`, not the base snapshot helper directly, so Koszary/Forteca role-scoped Health is applied only in PvP.

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

Detail RPCs:

- `get_hero_game_report_detail(p_hero_id uuid, p_report_id uuid)` for private/authenticated hero report detail.
- `get_public_game_report_by_token(p_public_token text)` for shareable public-safe report snapshots.

Current report detail payload sections:

- `participants_json`;
- `item_references_json`;
- `trial_section_json`;
- `encounter_section_json`;
- `combat_section_json`;
- `reward_section_json`;
- `effect_section_json`;
- `related_reports_json`.

Section builders / helpers:

- `build_game_report_source_label(p_report_id)` gives a non-empty contextual source label where possible, including Trial/Encounter labels for low-level combat reports.
- `build_game_report_trial_section_json(p_report_id, p_public_safe)` returns Trial status, manifestation/completion outcome and source labels.
- `build_game_report_encounter_section_json(p_report_id, p_public_safe)` returns direct Encounter step or combat-Encounter challenge context.
- `build_game_report_combat_section_json(p_report_id, p_public_safe)` returns persisted combat participants and attack timeline; it must use persisted combat rows only, not live combat state.
- `build_game_report_reward_section_json(p_report_id, p_public_safe)` returns reward grant entries including resource, XP/Character Points, generated item display names and effect reward rows.
- `build_game_report_effect_section_json(p_report_id, p_public_safe)` returns player-facing buff/debuff effect sections and reward effect entries with effect labels, helper text, target/value display and lifecycle status.
- `build_game_report_related_reports_json(p_report_id, p_public_safe)` links contextual Trial/Encounter parent reports and low-level child combat reports where reports are split.

Rules:

- Player reports show safe gameplay outcome context.
- Trial/Encounter reports that involve combat should expose combat context/section or related report references; frontend must not infer this from stale challenge/live-combat state.
- Rewards/items/effects should come from the report sections or exact reward read models, not from Armory/latest challenge fallbacks.
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

- Epic X start flow:
  - DB/RPC contracts now exist for server availability, DB-backed origin options and atomic hero creation;
  - creation is RPC-owned and covers hero row, origin, starting CP/ledger, base stats at 1, resources at 0, random free District A estate, estate binding, baseline buildings, Prestige initialization and route handoff to stat allocation;
  - Angular must not reintroduce direct-write hero creation.
- Epic W report/reward/effect read models:
  - exact step/challenge reward read models exist;
  - report detail/public token payloads expose Trial/Encounter/Combat/Reward/Effect/Related sections;
  - Trial manifestation failure is distinct from ordinary Nothing in Trial report section fields;
  - active Exploration effects expose player-facing label/summary/value/target metadata.
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
- `user_has_hero_on_server(...)` — still exists but is insufficient for Epic X routing/capacity/origin/create semantics; use `get_start_flow_server_availability()` for start-flow decisions.

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

# 21. 2026-05-31 live DB sync addendum — page contexts, origin content and item requirements

Status: **current operational addendum** based on the 2026-05-31 `mythsworn_schema.sql` dump plus verified live migration/verification output from the Migrator conversation.

This section records the DB/RPC contracts added after the 2026-05-15 `database-current.md` sync. If this addendum conflicts with older sections above, prefer this addendum together with the current live dump/generated types.

## 21.1. Restore-without-grants policy and player page read models

The recent database restore intentionally did not copy broad table grants. Do **not** fix player-route `403 permission denied for table ...` errors by granting `authenticated` broad table `SELECT` access. The accepted direction is:

- keep critical gameplay/economy/config tables closed as implementation details;
- expose player-safe page data through `SECURITY DEFINER` RPC/read models;
- use `can_read_hero(...)` / equivalent guards inside DB-owned RPCs;
- have Angular consume RPC payloads and map them into existing domain/page state;
- if a page context payload is missing a field, report a DB/RPC follow-up instead of reintroducing direct table reads.

### Internal guard

`get_player_page_hero_guard(p_hero_id uuid, p_operation text default 'player page context') returns hero`

- Internal helper for the new player page-context RPCs.
- Requires `auth.uid()`.
- Loads the hero row and verifies `can_read_hero(p_hero_id)`.
- Raises controlled permission/not-found errors.
- Not a frontend contract.

### Player page context RPC signatures

These functions are frontend-visible and require `EXECUTE` for `authenticated`:

- `get_player_dashboard_page_context(p_hero_id uuid) returns jsonb`;
- `get_player_attributes_page_context(p_hero_id uuid) returns jsonb`;
- `get_player_armory_page_context(p_hero_id uuid) returns jsonb`;
- `get_player_estate_page_context(p_hero_id uuid) returns jsonb`;
- `get_player_vicinity_page_context(p_hero_id uuid) returns jsonb`;
- `get_player_trade_page_context(p_hero_id uuid, p_limit integer default 50, p_offset integer default 0) returns jsonb`;
- `get_player_auction_page_context(p_hero_id uuid, p_limit integer default 50, p_offset integer default 0) returns jsonb`.

All seven RPCs were verified to exist and have `authenticated` EXECUTE. The JSON return type means generated Supabase types will expose `Json`; frontend must use explicit page-context mapper contracts below.

### Runtime/volatility and payload-size policy

The player page-context family is a frontend read-model layer, but the PostgreSQL functions are `VOLATILE`, not `STABLE`, because nested canonical helpers may settle runtime state, ensure daily counters, or use locks. Frontend calls must use ordinary Supabase `.rpc(...)` POST calls. Do not call these RPCs with `{ get: true }`.

Payload-size policy:

- Dashboard and Vicinity must stay lightweight. They use `get_hero_estate_summary_state(...)`, not the full `get_hero_estate_runtime_state(...)`.
- Estate page may use full `get_hero_estate_runtime_state(...)`, because it actually renders buildings/runtime data.
- Estate page must not eagerly return all-building progression preview matrices. `buildingProgressionPreviews` is intentionally `[]` and `progressionPreviewsDeferred = true`.
- Per-building progression preview must be requested on demand through `get_player_estate_building_progression_preview_context(...)`.
- Missing payload fields are DB/RPC follow-ups. Angular must not reintroduce direct table reads or table grants.

### Shared mapper aliases for frontend documentation

Use generated table/function row types for nested payload rows where possible:

```ts
type JsonObject = Record<string, unknown>;

type HeroRow = Database['public']['Tables']['hero']['Row'];
type OriginRow = Database['public']['Tables']['origin']['Row'];
type HeroStatRow = Database['public']['Tables']['hero_stats']['Row'];
type StatRow = Database['public']['Tables']['stats']['Row'];
type HeroResourceRow = Database['public']['Tables']['hero_resources']['Row'];
type HeroDailyActionCounterRow = Database['public']['Tables']['hero_daily_action_counters']['Row'];
type EstateDistrictAddressCapacityRow = Database['public']['Tables']['estate_district_address_capacities']['Row'];

type PlayerTradeOfferRow = Database['public']['Tables']['player_trade_offers']['Row'];
type PlayerTradeOfferItemRow = Database['public']['Tables']['player_trade_offer_items']['Row'];
type PlayerTradeTransactionRow = Database['public']['Tables']['player_trade_transactions']['Row'];
type PlayerTradeTransactionItemRow = Database['public']['Tables']['player_trade_transaction_items']['Row'];
type PlayerAuctionListingRow = Database['public']['Tables']['player_auction_listings']['Row'];
type PlayerAuctionBidRow = Database['public']['Tables']['player_auction_bids']['Row'];

type StartFlowOriginOptionRow = Database['public']['Functions']['get_start_flow_origin_options']['Returns'][number];
type HeroHealthStateRow = Database['public']['Functions']['get_hero_health_state']['Returns'][number];
type HeroPrestigePublicSummaryRow = Database['public']['Functions']['get_hero_prestige_public_summary']['Returns'][number];
type HeroRuntimeDerivedStatsRow = Database['public']['Functions']['get_hero_runtime_derived_stats']['Returns'][number];
type HeroDashboardRuntimeStatsRow = Database['public']['Functions']['get_hero_dashboard_runtime_stats']['Returns'][number];
type HeroEquipmentRuntimeSlotRow = Database['public']['Functions']['get_hero_equipment_runtime_slots']['Returns'][number];
type HeroEstateRuntimeStateRow = Database['public']['Functions']['get_hero_estate_runtime_state']['Returns'][number];
type HeroEstateSummaryStateRow = Database['public']['Functions']['get_hero_estate_summary_state']['Returns'][number];
type HeroPendingCombatEffectStateRow = Database['public']['Functions']['get_hero_pending_combat_effect_state']['Returns'][number];
type HeroArmoryVisibilityStateRow = Database['public']['Functions']['get_hero_armory_visibility_state']['Returns'][number];
type HeroArmoryItemRow = Database['public']['Functions']['get_hero_armory_items']['Returns'][number];
type HeroLoadoutPresetRow = Database['public']['Functions']['get_hero_loadout_presets']['Returns'][number];
type BuildingProgressionPreviewRow = Database['public']['Functions']['get_building_progression_preview']['Returns'][number];
```

For JSON-returning page contexts, generated function return typing is `Json`; use the explicit contracts below at the mapper boundary.

### Shared dashboard/estate display contracts

```ts
interface DashboardExperienceState {
  level: number;
  currentExperience: number;
  experienceToNextLevel: number | null;
  totalExperienceEarned: number;
  experienceProgressPercent: number | null;
  isAvailable: boolean;
  unavailableReason: string | null;
}

interface DashboardWorldStateRow {
  key:
    | 'active_state'
    | 'vicinity'
    | 'active_job'
    | 'trials_left'
    | 'attacks_left'
    | 'active_effect'
    | 'prestige_rank';
  label: string;
  value: unknown;
  displayValue: string;
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'golden';
  sortOrder: number;
  actionKey?: 'open_vicinity' | 'open_estate' | 'open_exploration' | null;
  source?: string;
}

interface PlayerEstateSummaryState {
  hero_id: string;
  server_id: string;
  estate_id: string;
  district_code: string | null;
  address_number: number | null;
  address: string | null;
  estate_rank: number;
  settled_completed_count: number;
  settled_as_of: string;
  active_job_json: JsonObject | null;
  attack_protection_active: boolean;
  attack_protection_expires_at: string | null;
  attack_protection_source_entity_type: string | null;
  attack_protection_source_entity_id: string | null;
  siege_protection_active: boolean;
  siege_protection_expires_at: string | null;
  siege_protection_source: string;
}
```

### `get_hero_estate_summary_state(...)` contract

Purpose: owner-safe lightweight estate summary. This helper reuses canonical settlement through `settle_hero_runtime_state(...)` but deliberately does **not** return `buildings_json`, `resources_json`, `recent_jobs_json` or building progression previews.

```ts
get_hero_estate_summary_state(p_hero_id: string): PlayerEstateSummaryState[]
```

Returned row fields:

```ts
interface PlayerEstateSummaryState {
  hero_id: string;
  server_id: string;
  estate_id: string;
  district_code: string | null;
  address_number: number | null;
  address: string | null;
  estate_rank: number;
  settled_completed_count: number;
  settled_as_of: string;
  active_job_json: JsonObject | null;
  attack_protection_active: boolean;
  attack_protection_expires_at: string | null;
  attack_protection_source_entity_type: string | null;
  attack_protection_source_entity_id: string | null;
  siege_protection_active: boolean;
  siege_protection_expires_at: string | null;
  siege_protection_source: string;
}
```

Notes:

- Requires authenticated user and `can_read_hero(p_hero_id)`.
- Calls normal gameplay guard.
- Intended as lightweight support for dashboard/vicinity/header-style contexts.
- Not a replacement for full estate page building runtime.

### `get_player_dashboard_page_context(...)` JSON contract

Purpose: player-safe bootstrap for `/hero/dashboard`; replaces direct reads of `origin`, `hero_stats`, `hero_resources`, `hero_daily_action_counters`, formula tables, equipment/runtime dictionaries and related page bootstrap tables.

```ts
interface PlayerDashboardPageContext {
  hero: HeroRow;

  experienceState: DashboardExperienceState;
  worldStateRows: DashboardWorldStateRow[];

  // Lightweight summary. This is not the full estate runtime.
  estateSummary: PlayerEstateSummaryState | null;

  // Compatibility alias for older mapper shape, but intentionally slim.
  // Do not expect buildings_json/resources_json/recent_jobs_json here.
  estateRuntimeState: PlayerEstateSummaryState | null;

  origin: OriginRow | null;
  originOptions: StartFlowOriginOptionRow[];

  heroStats: HeroStatRow[];
  statsDictionary: StatRow[];

  heroResources: HeroResourceRow[];
  dailyActionCounters: HeroDailyActionCounterRow[];

  healthState: HeroHealthStateRow | null;
  prestigeSummary: HeroPrestigePublicSummaryRow | null;

  runtimeDerivedStats: HeroRuntimeDerivedStatsRow | null;
  dashboardRuntimeStats: HeroDashboardRuntimeStatsRow | null;

  equipmentSlots: HeroEquipmentRuntimeSlotRow[];
  pendingCombatEffect: HeroPendingCombatEffectStateRow | null;
}
```

Notes:

- `hero` is always present or the RPC throws.
- `experienceState` is the XP/progression display contract. There is no `experience.experienceToNextLevel` top-level object; use `experienceState.experienceToNextLevel`.
- `worldStateRows` is display-ready and contains exactly: `active_state`, `vicinity`, `active_job`, `trials_left`, `attacks_left`, `active_effect`, `prestige_rank`.
- There is no `hero_rank` world-state row.
- `estateSummary`/`estateRuntimeState` are intentionally slim on dashboard.
- `statsDictionary` is ordered by `stats."order"`, not `sort_order`.

### `get_player_attributes_page_context(...)` JSON contract

Purpose: player-safe bootstrap for `/hero/attributes`; replaces direct reads of `hero_stats`, `stats`, `balance_formula_*` and `entity_formula_assignments` for the attribute page.

```ts
interface PlayerAttributesPageContext {
  hero: HeroRow;

  attributeManifest: JsonObject;
  availableCharacterPoints: number;

  heroStats: HeroStatRow[];
  statsDictionary: StatRow[];

  runtimeDerivedStats: HeroRuntimeDerivedStatsRow | null;
}
```

Notes:

- `attributeManifest` is the sanitized JSON returned by `sanitize_player_attribute_manifest_json(get_hero_attribute_allocation_preview_manifest(p_hero_id))`.
- The raw manifest builder may still contain internal English labels; the player page context is the canonical frontend contract for labels.
- Derived stat labels in `attributeManifest.supportedDerivedStats[]` / `unsupportedDerivedStats[]` are DB-owned Polish labels: `Punkty życia`, `Obrona`, `Obrażenia`, `Szansa krytyczna`, `Obrażenia krytyczne`, `Unik`, `Aktualne punkty życia`, `Fatum`, `Liczba ataków`.
- Stat allocation writes still use the existing canonical write RPC; this page-context RPC is read-only.

### `get_player_armory_page_context(...)` JSON contract

Purpose: player-safe bootstrap for `/game/armory`; replaces direct reads of `equipment_slot_definitions`, `hero_equipment`, `items` and item-generation dictionaries for armory page bootstrap.

```ts
interface PlayerArmoryPageContext {
  hero: HeroRow;

  copyJson: JsonObject;
  visibilityState: JsonObject | null; // sanitized, no source/debug shelf internals

  storageSlots: JsonObject[];
  unsortedStorageSlot: JsonObject | null;

  items: JsonObject[]; // sanitized item rows with valueDisplay/quality/type/slot labels
  equipmentSlots: PlayerArmoryEquipmentSlot[]; // canonical camelCase equipment preview slots
  loadoutPresets: HeroLoadoutPresetRow[];

  runtimeDerivedStats: JsonObject | null; // sanitized labels in attack/damage rows
}
```

Canonical `equipmentSlots[]` row shape:

```ts
interface PlayerArmoryEquipmentSlot {
  heroId: string;
  slotKey: string;          // e.g. main_hand, off_hand, helmet
  slotLabel: string;        // e.g. Główna ręka, Druga ręka, Hełm
  slotSortOrder: number;
  slotItemState: 'empty' | string;
  hasItem: boolean;
  itemId?: string | null;
  itemName?: string | null;
  itemStatusKey?: string | null;
  equipmentArea?: string | null;
  equipmentSlotGroup?: string | null;
  isRuntimeUsable?: boolean;
  baseKey?: string | null;
  baseName?: string | null;
  baseTypeKey?: string | null;
  generationBaseId?: string | null;
  generationQualityKey?: string | null;
  qualityLabel?: string | null;
  qualityMultiplier?: number | null;
  handUsage?: string | null;
  prefixAffixId?: string | null;
  prefixKey?: string | null;
  prefixName?: string | null;
  suffixAffixId?: string | null;
  suffixKey?: string | null;
  suffixName?: string | null;
  equippedAt?: string | null;
}
```

Armory page-context rules:

- `copyJson` owns Zbrojownia section/action/filter/empty-state copy.
- `storageSlots` is the canonical top-level contract for stands/stojaki; frontend must not read nonexistent `item_storage_slots`.
- `unsortedStorageSlot` is the canonical non-stand bucket labelled `Nieprzypisane`.
- `equipmentSlots` is the canonical equipment preview slot contract; frontend must not direct-read `equipment_slot_definitions`.
- `equipmentSlots[]` are camelCase in the page context. Frontend must consume `slotKey`, `slotLabel`, `slotItemState`, `hasItem`, `itemId`, `itemName`; do not use `slot_key`, `slot_label`, `slot_item_state` from the page context.
- Default loadout names are `Zestaw 1..N`, not `Preset N`.
- Default shelf names are `Stojak 1..10`, not `Shelf N`.
- `visibilityState` in the page context is sanitized and does not include `source_config_json`, `shelves_json`, `unsorted_json`, `visibility_order` or `visibility_limit_source`.
- Item rows/details should use DB-provided labels/value fields, including `valueDisplay.displayLabel = 'Wartość w drachmach'`.

Existing armory action RPCs remain the write paths for equip/unequip/move/loadout/vendor operations.

### `get_player_estate_page_context(...)` JSON contract

Purpose: player-safe bootstrap for `/game/estate`; replaces direct reads of `estates`, `buildings`, `entity_requirements` and formula tables for estate/building page bootstrap.

```ts
interface PlayerEstatePageContext {
  contractVersion: 'player_estate_page_context_v2';
  hero: HeroRow;

  copyJson: JsonObject;

  // Sanitized full settled estate/building runtime for the Estate page.
  estateRuntimeState: JsonObject | null;
}
```

Notes:

- `estateRuntimeState` is sanitized for the player page and includes `buildings_json`, `resources_json`, active/recent job data, canonical requirements, canonical costs and sanitized bonus display rows.
- `resourceCostsJson[]` should render `displayLabel` left and `displayValue` right; numeric `amount` remains available for logic.
- `requirementsJson[]` should render `displayLabel` left and `displayValue` right, with optional `displayUnit` such as `poziom`.
- `bonusesJson[]` should render `displayText`, `nextDisplayText` and `deltaDisplayText` where appropriate. It does not expose formula expressions/source/debug rows in the player page context.
- Full all-building progression previews are no longer part of the page bootstrap contract. If the UI needs progression preview for a concrete building, call `get_player_estate_building_progression_preview_context(...)` on demand.
- Durable building mutations remain RPC-owned, especially `start_estate_building_upgrade(...)`.

### `get_player_estate_building_progression_preview_context(...)` JSON contract

Purpose: on-demand player-safe preview/explainability for **one** building and a bounded level range. Prevents `/game/estate` bootstrap from shipping all building previews.

```ts
interface PlayerEstateBuildingProgressionPreviewContext {
  heroId: string;
  serverId: string;
  estateSummary: PlayerEstateSummaryState;
  building: {
    buildingId: string;
    buildingKey: string;
    buildingName: string;
    buildingDescription: string | null;
    districtCode: string | null;
    startingLevel: number | null;
    maxLevel: number | null;
    sortOrder: number | null;
  };
  fromLevel: number;
  toLevel: number;
  previews: BuildingProgressionPreviewRow[];
}
```

RPC:

```ts
get_player_estate_building_progression_preview_context(
  p_hero_id: string,
  p_building_id: string,
  p_from_level?: number,
  p_to_level?: number
): PlayerEstateBuildingProgressionPreviewContext
```

Notes:

- Uses `get_player_page_hero_guard(...)` and `get_hero_estate_summary_state(...)`.
- Reuses canonical `get_building_progression_preview(...)`.
- `p_from_level` is clamped to `>= 0`.
- `p_to_level` is clamped to at most `p_from_level + 25`.
- Missing `p_building_id` or unknown building raises a controlled DB error.

### `get_player_vicinity_page_context(...)` JSON contract

Purpose: player-safe bootstrap for `/game/vicinity`; replaces direct reads of `estates` and `estate_district_address_capacities`.

```ts
interface PlayerVicinityAddressCapacity {
  districtCode: string;       // e.g. A
  displayLabel: string;       // e.g. Dzielnica A
  addressCapacity: number;    // e.g. 5000
  addressNumberStart: number; // normally 1
  addressNumberEnd: number;   // same as addressCapacity for current policy
  firstAddress: string;       // e.g. A-0001
  lastAddress: string;        // e.g. A-5000
  sortOrder: number;
  isActive: boolean;
}

interface PlayerVicinityOccupiedEstate {
  estateId: string;
  serverId: string;
  heroId: string;
  districtCode: string | null;
  districtLabel: string | null;
  addressNumber: number | null;
  address: string | null;        // formatted through format_vicinity_address(...)
  displayLabel: string | null;   // same formatted address, for direct rendering
  estateRank: number;
  isCurrentHeroEstate: boolean;
  occupancyStatusKey: 'current' | 'occupied' | string;
  occupancyLabel: string;        // Twoja posiadłość / Zajęty
}

interface PlayerVicinityCurrentEstate {
  estateId: string;
  serverId: string;
  heroId: string;
  districtCode: string | null;
  districtLabel: string | null;
  addressNumber: number | null;
  address: string | null;
  estateRank: number;
  occupancyStatusKey: 'current' | string;
  occupancyLabel: string;
}

interface PlayerVicinityPageContext {
  contractVersion: 'player_vicinity_page_context_v2';
  hero: HeroRow;
  copyJson: JsonObject;

  currentEstate: PlayerVicinityCurrentEstate;
  estateSummary: PlayerEstateSummaryState | null;

  // Compatibility alias for older mapper shape, but intentionally slim.
  // Do not expect buildings_json/resources_json/recent_jobs_json here.
  estateRuntimeState: PlayerEstateSummaryState | null;

  addressCapacities: PlayerVicinityAddressCapacity[];
  occupiedEstates: PlayerVicinityOccupiedEstate[];
}
```

Notes:

- `get_player_vicinity_page_context(...)` returns `contractVersion = player_vicinity_page_context_v2` and DB-owned `copyJson`.
- `addressCapacities[]` is sanitized/camelCase and contains no raw admin/debug fields such as `label`, `description`, `helper_text`, `admin_description`, `created_at`, `updated_at`, `district_code` or `address_capacity`.
- Empty addresses are not database rows. Frontend generates address slots from `addressNumberStart..addressNumberEnd` for each capacity row and overlays `occupiedEstates[]` by `districtCode + addressNumber`.
- `occupiedEstates[]` contains only occupied estate rows from DB and includes `occupancyStatusKey` / `occupancyLabel` plus formatted `address` / `displayLabel`.
- `occupiedEstates.estateRank` maps from `estates.rank`.
- `currentEstate` is the direct UI contract for the hero's current address.
- `estateSummary` and `estateRuntimeState` are lightweight; they intentionally do not carry building/runtime payloads.
- `format_vicinity_address(p_district_code text, p_address_number integer)` formats addresses such as `A-1055` and `E-0001`.
- Relocation remains owned by `relocate_hero_estate_to_empty_address(...)`.
- Frontend must not direct-read `estates`, `estate_districts` or `estate_district_address_capacities`.

### `get_player_trade_page_context(...)` JSON contract

Purpose: player-safe bootstrap for `/game/trade`; replaces direct reads of `player_trade_offers`, `player_trade_offer_items`, `player_trade_transactions` and transaction items.

```ts
interface PlayerTradePageContext {
  hero: HeroRow;

  canUseTrade: boolean;
  activeTradeSlotCount: number;
  tradeSlotLimit: number;

  offers: PlayerTradeOfferRow[];
  offerItems: PlayerTradeOfferItemRow[];

  transactions: PlayerTradeTransactionRow[];
  transactionItems: PlayerTradeTransactionItemRow[];
}
```

Notes:

- `p_limit` is clamped DB-side to `1..100`; `p_offset` is clamped to `>= 0`.
- `offers` includes only offers where the active hero is creator or target.
- `offerItems` includes items only for the selected page of offers.
- `transactions` includes only transactions involving the active hero.
- `transactionItems` includes items only for the selected page of transactions.
- Trade create/respond/cancel/completion writes remain on existing canonical trade action RPCs.

### `get_player_auction_page_context(...)` JSON contract

Purpose: player-safe bootstrap for `/game/auctions`; replaces direct reads of `player_auction_listings`, `player_auction_bids` and auction-related `player_trade_transactions`.

```ts
interface PlayerAuctionPageContext {
  hero: HeroRow;

  activeListings: PlayerAuctionListingRow[];
  myListings: PlayerAuctionListingRow[];
  myBids: PlayerAuctionBidRow[];

  auctionTransactions: PlayerTradeTransactionRow[];
}
```

Notes:

- `p_limit` is clamped DB-side to `1..100`; `p_offset` is clamped to `>= 0`.
- `activeListings` are active listings on the same server.
- `myListings` are listings where `seller_hero_id = hero.id`.
- `myBids` are bids where `bidder_hero_id = hero.id`.
- `auctionTransactions` are auction-sale trade transactions involving the active hero.
- Auction create/bid/buy-now/settlement writes remain on canonical auction/trade action RPCs.

### Frontend mapping rule for JSON page contexts

At the service boundary:

```ts
function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
```

Allowed fallback: default absent optional arrays to `[]` and nullable helper objects to `null` at the mapper boundary.

Blocked fallback: direct-reading old tables if a field is missing. Missing required page data is a DB/RPC follow-up.

### Verified payload-smoke snapshot after slim-payload pass

Rollback smoke confirmed:

- dashboard top-level keys include `experienceState`, `worldStateRows`, `estateSummary` and slim `estateRuntimeState` compatibility alias;
- dashboard/vicinity `estateSummary` contains only address/rank/active-job/protection summary fields, not `buildings_json`, `resources_json` or `recent_jobs_json`;
- `worldStateRows` keys are exactly `active_state`, `vicinity`, `active_job`, `trials_left`, `attacks_left`, `active_effect`, `prestige_rank`;
- vicinity top-level keys include `currentEstate`, `estateSummary`, slim `estateRuntimeState`, `addressCapacities`, `occupiedEstates`;
- estate top-level keys after the late copy/sanitizer pass are `contractVersion`, `copyJson`, `estateRuntimeState`, `hero`;
- estate `contractVersion = player_estate_page_context_v2`;
- all-building progression previews are deferred out of page bootstrap; on-demand building preview returned a bounded preview for one building through `get_player_estate_building_progression_preview_context(...)`.
- armory top-level keys include `copyJson`, `equipmentSlots`, `hero`, `items`, `loadoutPresets`, `runtimeDerivedStats`, `storageSlots`, `unsortedStorageSlot`, `visibilityState`;
- attributes `attributeManifest` returned by page context is label-sanitized and includes Fatum instead of Luck/Szczęście.

## 21.2. Origin content and current bonus seed contract

`get_start_flow_origin_options()` remains the canonical account-side origin read model. It returns origin content from `origin` plus canonical resolved bonuses from `entity_bonuses(entity_type = origin)`.

Current verified origin bonuses:

| Origin key | Display intent | Bonuses |
|---|---|---|
| `spartan` | Spartanin | `+10 Siła`, `+10 Wytrzymałość`, `+20 Obrona` |
| `athenian` | Ateńczyk | `+5 Charyzma`, `+10 Mądrość`, `+10 Duchowość` |
| `corinthian` | Koryntianin | `+10 Fatum`, `+5 Przebiegłość`, `+10 Mądrość` |
| `cretan` | Kreteńczyk | `+10 Mądrość`, `+10 Wytrzymałość`, `+5 Zwinność` |

Verification after the origin rewrite showed:

- all 12 desired active origin bonus rows `OK`;
- no unexpected active origin bonuses;
- `START_FLOW_ORIGIN_OPTIONS_PREVIEW` displayed the expected `bonusSummaryText` values.

Rules:

- Frontend must not hardcode exact origin bonuses.
- Artwork remains app-side transitional lookup by `origin_key` unless a later DB content/asset registry contract is added.
- `origin_bonuses` remains legacy/transitional debt and is not the source of truth.
- Origin display labels may still be English in `origin_label` depending on seed state; if Polish labels are required, handle as a separate DB/content seed pass.

## 21.3. Item-generation requirements, family membership and effective requirement state

The latest item-generation balance pass was data-only and does not require generated type regeneration. It used current canonical requirement structures:

- `requirement_definitions`;
- `entity_requirements`;
- `item_requirement_aggregation_settings`;
- `item_generation_affix_families`;
- `item_generation_affix_family_members`;
- item-generation base/affix/quality dictionaries.

Current accepted principles:

- Source requirements are designed around **normal** quality; item quality then scales final/effective requirements.
- `additional_requirement_fraction = 0.5` remains accepted globally after the latest smoke; do not lower it broadly unless a future balancing decision says otherwise.
- Standard and Luck-useful item combinations look healthy after the latest pass; do not perform broad cuts to standard/luck families.
- High-DV/economic bait is intentional. Bait items may be expensive, stat-mismatched and not gameplay-optimal.
- Outstanding standard/luck items reaching late-mid/endgame requirements can be acceptable when the bonus package justifies it.

Recent verified requirement updates:

- Standard family/tier source requirements were capped for normal progression families while preserving divine/special/elite/bait semantics.
- Unassigned active affixes from the high-value/prestige/special review were attached to explicit families instead of leaving them unclassified.
- Active generation affixes have at least one active source requirement.
- Base item requirements were repaired so active bases have hero-level gates, and missing slot/theme requirements were added for ranged weapons, boots and pants where applicable.
- `Triumfalny` / `Ceremonialny` / `Przepychu` prestige-bait source requirements were trimmed after preflight proved the old stack produced over-high effective requirements. The accepted trim targets top `Outstanding` combinations around level 60 rather than 90+ while preserving high DV bait semantics.

Current important targeted affix requirement values after trim:

| Kind | Key | Intent | Current active source requirements |
|---|---|---|---|
| prefix | `triumphal` | Triumfalny prestige weapon bait | `hero_level = 20`, `charisma = 24`, `spirituality = 7`, `strength = 12` |
| prefix | `ceremonial_weapon` | Ceremonialny weapon bait | `hero_level = 20`, `charisma = 16`, `spirituality = 7`, `wisdom = 10` |
| suffix | `opulence` | Przepychu high-Charisma bait | `hero_level = 20`, `charisma = 22`, `cunning = 8` |

Current sampler/distribution interpretation:

- `standard` and `luck_useful` should be left alone unless future representative smoke shows a concrete outlier.
- `elite_bait_special` may still have a small overcap tail; that is not automatically a bug if the item is a super-bait/special with high DV and broad bonus package.
- Future balancing should be family-/case-targeted, not global. Example: audit a concrete family pair such as `scholastic + ceremony` if it remains undesirable, instead of changing all requirements or the global aggregation setting.

## 21.4. Polish item-name forms and `dew_touched`

Current naming/composer rule:

- Final player-facing item names should be produced by the canonical item-name composer, not by ad hoc SQL/debug concatenation of `quality_label + prefix.name + base.name + suffix.name`.
- Prefix display must use `get_item_prefix_display_modifier(prefix_id, base_id, 'pl')` / equivalent canonical composer behavior so the form matches the base item's grammatical gender/number.
- Suffixes generally remain invariant genitive phrases.

`dew_touched` was corrected from the typo `Znroszony` to `Zroszony` with display forms:

- masculine inanimate singular: `Zroszony`;
- feminine singular: `Zroszona`;
- neuter singular: `Zroszone`;
- non-virile plural: `Zroszone`.

Verified examples:

- `Koszula` -> `Zroszona`;
- `Kij` -> `Zroszony`;
- `Sandały` -> `Zroszone`.

No generated type regeneration is required for this data-only seed/form correction.

## 21.5. Same-signature body fixes and no-regeneration changes

No generated Supabase type regeneration is required for:

- same-signature body fixes to page-context RPCs, including `stats."order"` ordering and `estates.rank` -> `estateRank` mapping;
- same-signature page-context copy/sanitizer body fixes for Attributes, Armory, Estate and Vicinity;
- data-only copy fixes such as Hippokaion description and default `Stojak` / `Zestaw` names;
- helper-only label/copy functions when frontend does not call them directly, including Armory/Estate/Attributes/Vicinity sanitizer and copy helpers;
- origin bonus rewrite data seed;
- `dew_touched` display-form seed correction;
- item-generation requirement/family/base requirement data-only rebalance;
- `Triumfalny` / `Ceremonialny` / `Przepychu` requirement trim.

Generated types **are** required after adding the player page-context RPC signatures if Codex needs to call them through generated Supabase function typing. They are also required before Codex consumes the new `get_hero_estate_summary_state(...)` and `get_player_estate_building_progression_preview_context(...)` function signatures. Same-signature slim-payload body changes to existing page-context RPCs do not by themselves require regeneration.




## 21.6. Late 2026-05-31 player-facing copy/read-model cleanup

This subsection records the DB/RPC cleanup verified after the later 2026-05-31 dump and subsequent Migrator smoke outputs.

### Generic localization registry

The latest schema includes `locale_definitions`, `localized_entity_texts`, `normalize_locale_key(...)`, `get_localized_entity_text(...)` and locale-aware `get_stat_label(...)`. These are DB-side content/label infrastructure. Angular should not direct-read localization tables; consume labels through canonical read models/RPCs.

### Attributes

`get_player_attributes_page_context(...)` now wraps `get_hero_attribute_allocation_preview_manifest(...)` with `sanitize_player_attribute_manifest_json(...)`. Derived rows in `attributeManifest.supportedDerivedStats[]` and `unsupportedDerivedStats[]` use the player-facing labels listed in section 4, including `Fatum` for technical `luck`. Verification showed `englishLabelsRemaining = 0`, `hasFatum = true`, `hasSzczescie = false`, `hasMojibake = false`.

### Armory / Zbrojownia

`get_player_armory_page_context(...)` is the canonical `/game/armory` bootstrap. It returns DB-owned `copyJson`, `storageSlots`, `unsortedStorageSlot`, sanitized `items`, canonical camelCase `equipmentSlots`, sanitized `runtimeDerivedStats`, `loadoutPresets`, sanitized `visibilityState` and `hero`.

Rules:

- no direct read of `equipment_slot_definitions` from the player frontend;
- no direct read of nonexistent `item_storage_slots`;
- use `storageSlots` for stands/stojaki and `unsortedStorageSlot` for `Nieprzypisane`;
- use `copyJson` for Armory page sections/actions/filters/empty states;
- item value label is `Wartość w drachmach`;
- common armory runtime labels are DB-sanitized (`Główna ręka`, `Druga ręka`, `Bez broni`, `Pochodzenie`, `Obrażenia`, `Fatum`, etc.);
- `equipmentSlots[]` is canonical camelCase in the page context (`slotKey`, `slotLabel`, `slotItemState`, `hasItem`, `itemId`, `itemName`) and no longer exposes the snake_case slot keys there.

`get_hero_armory_item_detail(...)` keeps the canonical core/aggregator path but sanitizes item detail `bonuses_json` and adds structured `valueDisplay`.

### Estate / Posiadłość

`get_player_estate_page_context(...)` now returns `contractVersion = player_estate_page_context_v2`, `copyJson`, sanitized `estateRuntimeState` and `hero`. It is the only player bootstrap path for `/game/estate`.

Rules:

- no direct reads of `buildings`, `entity_bonuses`, `entity_requirements`, `balance_formula_*`, `entity_formula_assignments`, `estate_districts` or `building_district_level_caps`;
- costs and requirements use canonical structured label/value rows;
- bonus rows expose player-safe display fields only;
- formula/source/debug fields are not part of the page context;
- detailed building progression preview remains on-demand via `get_player_estate_building_progression_preview_context(...)`.

Hippokaion player-facing description is: `Zaplecze jeździeckie i stajnie, które skracają czas dotarcia do posiadłości innych bohaterów podczas ataku.`


### Vicinity / Okolica

`get_player_vicinity_page_context(...)` now returns `contractVersion = player_vicinity_page_context_v2`, DB-owned `copyJson`, `currentEstate`, slim `estateSummary` / `estateRuntimeState` alias, canonical `addressCapacities[]` and canonical `occupiedEstates[]`.

Rules:

- no direct reads of `estates`, `estate_districts` or `estate_district_address_capacities` from the player frontend;
- DB returns only occupied estates in `occupiedEstates[]`;
- frontend generates empty/free address rows from `addressCapacities[].addressNumberStart..addressNumberEnd` and overlays `occupiedEstates[]` by `districtCode + addressNumber`;
- `addressCapacities[]` is sanitized/camelCase and player-safe: `districtCode`, `displayLabel`, `addressCapacity`, `addressNumberStart`, `addressNumberEnd`, `firstAddress`, `lastAddress`, `sortOrder`, `isActive`;
- `occupiedEstates[]` exposes formatted `address`/`displayLabel`, `districtLabel`, `occupancyStatusKey`, `occupancyLabel` and `isCurrentHeroEstate`;
- `format_vicinity_address(...)` is the DB helper for formatted addresses such as `A-1055` and `E-0001`;
- `copyJson` owns Okolica labels, filters and empty-state copy.

Verified late smoke showed 5 active capacity rows, 2 occupied estate rows in the sample, `capacityRowsWithRawFields = 0`, `badTextMatchCount = 0`, and direct table read grants remain intentionally absent.
