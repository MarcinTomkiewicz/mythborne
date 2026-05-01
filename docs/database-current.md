# Mythborne — Database Current Notes

Updated: 2026-05-01

This file is the curated semantic index of the current database state. It is not a full `pg_dump`.

If this file conflicts with the actual database, generated Supabase types, or a newer explicit user instruction, prefer:

1. explicit user instruction,
2. current database schema / migrations / dump,
3. generated `database.types.ts`,
4. `current-decisions.md`,
5. this file.

---

# Current DB/RPC contract updates

## Update 2026-05-01 — L11 trial admin write path and PvE read policies

The DB now has a canonical admin/balancer write path for Trial definitions and Trial combat candidates.

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

PvE read policies/grants added:

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

## Update 2026-05-01 — Epic Q notifications DB foundation

Notifications are persistent inbox/bell entries. They are separate from game reports, audit logs, player abuse reports, and local UI-only toasts/messages.

Toast behavior is presentation-only: frontend may show a fresh notification row as a toast when the recipient is online and the notification type allows it. The persistent `notifications` row is the source of truth.

Current DB foundation:

- enum `notification_recipient_kind`: `user`, `hero`, `staff`;
- enum `notification_severity`: `info`, `notice`, `warning`, `critical`;
- table `notification_types` for DB-backed labels/descriptions/categories/default severity/default toast behavior;
- table `notifications` for persistent notification rows;
- internal helper `create_notification(...)` for DB/RPC workflows;
- RPC `mark_notification_read(p_notification_id)`;
- RPC `dismiss_notification(p_notification_id)`.

Current seeded notification types include:

- direct trade: `trade.offer_received`, `trade.offer_completed`, `trade.offer_rejected`;
- auction: `auction.outbid`, `auction.sold`, `auction.won`;
- declarations: `declaration.approved`, `declaration.rejected`;
- reports/moderation: `abuse_report.resolved`, `anti_abuse.case_waiting_for_player`, `anti_abuse.case_waiting_for_staff`;
- sanctions: `sanction.created`, `cp_penalty.created`;
- estate/buildings: `building.completed`.

Current DB-owned notification hooks:

- `notify_player_trade_offer_lifecycle()` via `trg_notify_player_trade_offer_lifecycle` on `player_trade_offers`;
- `notify_player_trade_transaction_completed()` via `trg_notify_player_trade_transaction_completed` on `player_trade_transactions`;
- `notify_player_auction_bid_outbid()` via `trg_notify_player_auction_bid_outbid` on `player_auction_bids`;
- `notify_player_relationship_declaration_decision()` via `trg_notify_player_relationship_declaration_decision` on `player_relationship_declarations`;
- `notify_player_abuse_report_decision()` via `trg_notify_player_abuse_report_decision` on `player_abuse_reports`;
- `notify_anti_abuse_case_attention()` via `trg_notify_anti_abuse_case_attention` on `anti_abuse_cases`;
- `notify_anti_abuse_sanction_created()` via `trg_notify_anti_abuse_sanction_created` on `anti_abuse_sanctions`;
- `notify_character_point_penalty_created()` via `trg_notify_character_point_penalty_created` on `character_point_penalties`.

Frontend/Codex implications:

- Frontend must not insert rows into `notifications` directly.
- Frontend should read current-user notifications, unread counts, and dismissed state from `notifications` joined with `notification_types`.
- Frontend may display fresh eligible notification rows as toasts, but toast state is not a separate DB domain.
- Game reports use the Reports inbox/badge and must not create `game_report.created` notifications by default.
- Notification item names such as an auction item name are short current-context labels, not historical item snapshots.

---

## Update 2026-05-01 — Epic P game reports DB foundation

Game reports are player-facing gameplay reports and are separate from `player_abuse_reports` and audit logs.

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

Public report routing should use `game_reports.public_token`, conceptually `/report/:publicToken`, not the internal report UUID.

Current report RPC/helper foundation:

- `create_game_report_from_combat_result(p_combat_result_id, p_owner_hero_id, p_reason, p_request_id)`;
- `delete_game_report_for_hero(p_report_id, p_hero_id, p_reason, p_request_id)`;
- `attach_reward_drop_item_to_game_report(p_report_id, p_item_id, p_sort_order, p_reason, p_request_id)`;
- `build_report_item_display_name(p_quality_key, p_base_id, p_prefix_affix_id, p_suffix_affix_id, p_source_item_id)`.

Combat report production wraps `combat_results` and does not duplicate `combat_result_attacks`.

`game_report_item_references` prefers `source_item_id` when the real item still exists, so report item cards can show the current live/balanced item. If the item row is gone, rendering falls back to saved quality/base/prefix/suffix component refs plus `display_name_fallback`.

A unique partial index protects reward-drop idempotency for `(report_id, source_kind, source_item_id)` where `source_item_id is not null`.

Frontend/Codex implications:

- Use `game_report_types` labels/descriptions rather than hardcoding report type labels.
- Use report RPCs/helpers rather than direct table writes/deletes.
- Combat reports should render combat snapshots from `combat_results`.
- Trial/encounter/PvP/siege producers are future integrations.
- Public reports must not expose account/user ids or private equipment loadouts.

---

## Update 2026-05-01 — Authoritative DB formula runtime and Epic O estate/building runtime foundation

The database has an authoritative, DB-side numeric formula evaluator for assigned `balance_formulas`. This is a platform rule, not only an Epic O detail.

Formula runtime helpers:

- `formula_round_up(p_value numeric, p_step numeric default 1)`;
- `formula_round_down(p_value numeric, p_step numeric default 1)`;
- `formula_clamp(p_value numeric, p_min numeric, p_max numeric)`;
- `formula_random()`;
- `formula_random(p_min numeric, p_max numeric)`;
- `evaluate_balance_formula_expression(p_expression text, p_allowed_variables text[], p_variables_json jsonb)`;
- `evaluate_balance_formula_target(p_target_key text, p_variables_json jsonb)`.

Authoritative DB/RPC workflows must not rely on frontend-computed formula outputs. Frontend formula runtime remains appropriate for previews, charts and admin explainability.

### Resource ledger

Minimal resource ledger foundation exists:

- table `hero_resource_ledger`;
- helper `apply_hero_resource_delta_with_ledger(p_hero_id, p_resource_type, p_amount_delta, p_reason, p_related_entity_type, p_related_entity_id)`.

The ledger records minimal resource balance changes for resources such as `drachma`, `materials`, and `workforce`. It is not an undo/refund feature.

### Estate address foundation

Estate address source of truth is `district_code + address_number`.

`estates.address` remains legacy/display compatibility only.

Current address/capacity objects:

- `estate_district_address_capacities`;
- `format_estate_address(...)`;
- `parse_estate_address_number(...)`;
- `normalize_estate_address_fields()` trigger function;
- trigger `trg_normalize_estate_address_fields` on `estates`.

Current active capacities:

- A = 5000;
- B = 3000;
- C = 500;
- D = 50;
- E = 1.

Empty estate addresses are not stored as database rows. Frontend may generate possible address ranges from capacity and overlay occupied estates.

When Codex removes the final code dependency on `estates.address`, it must report `DB cleanup candidate: estates.address`.

### Empty-address relocation RPC

Player relocation to an empty address is DB-owned:

- `relocate_hero_estate_to_empty_address(p_hero_id, p_district_code, p_address_number, p_confirm_destroy_existing_estate, p_reason, p_request_id)`.

This is destructive relocation to an empty address, not siege/takeover of an occupied estate.

### Building jobs and building start

Active building jobs are stored in `estate_building_jobs`.

Status enum: `active`, `completed`, `cancelled`, `failed`.

MVP rule: one active job per estate. Player-facing cancel is not implemented.

Lazy finalization helper:

- `finalize_completed_estate_building_jobs(p_estate_id)`.

Building construction/upgrade start is DB-owned:

- `start_estate_building_upgrade(p_hero_id, p_building_id, p_reason, p_request_id)`.

This RPC finalizes completed jobs, validates ownership/district/max level/one-active-job rule, evaluates assigned `building_upgrade_cost` and `building_upgrade_time` formulas in DB, spends `drachma/materials/workforce` through `apply_hero_resource_delta_with_ledger(...)`, creates an active `estate_building_job`, and writes audit action `estate.building_upgrade.started`.

Frontend must call this RPC. Frontend must not compute authoritative cost/time, directly mutate `hero_resources`, or insert building jobs.

---

## Update 2026-05-01 — Vendor scrap/sell DB/RPC foundation

Vendor scrap/sell is DB/RPC-owned and is not player trade.

Current contracts:

- config `vendor_scrap_drachma_payout_percent`, default 50;
- helper `get_vendor_scrap_drachma_payout_percent()`;
- RPC `vendor_scrap_hero_item(p_item_id, p_actor_hero_id, p_reason, p_request_id)`.

`vendor_scrap_hero_item(...)` computes drachma payout from `items.drachma_value`, calls `scrap_hero_item(...)`, applies drachma resource delta, and writes vendor audit.

Frontend must not compose `scrap_hero_item(...)` and resource updates client-side.

---

## Update 2026-05-01 — Trade/auction lifecycle audit DB ownership

Trade and auction lifecycle audit is DB-owned. Frontend must not write these audit logs manually.

DB-owned audit covers:

- direct trade offer create/respond/cancel/reject/expire/fail;
- auction listing listed/cancelled/expired/failed;
- auction bid placement;
- auction buy-now / auction close path reason;
- completed direct trade / auction sale transactions.

Frontend trade/auction flows should continue using canonical public RPCs and should not add Angular `AuditWriter` calls for those lifecycle events.

---

## Update 2026-05-01 — Epic N progression DB foundation

Progression formula targets include:

- `hero_stat_upgrade_cost`;
- `hero_stat_level_cap`;
- `hero_experience_to_next_level`.

`save_stat_allocation(...)` remains the canonical stat allocation workflow.

`critical_damage` exists as a runtime/combat derived stat concept with base 50% plus active bonuses. The final combat resolver must not use hardcoded x2 crit multiplier as target architecture.

---

## L-DB4c — preview/simulation RPCs

Applied in the database. Current non-mutating preview/simulation RPCs:

- `preview_trial_opportunity_curve(...)`;
- `preview_trial_manifestation_chance(...)`;
- `preview_challenge_auto_resolve_success_chance(...)`;
- `preview_reward_generated_item(...)`;
- `preview_reward_profile(...)`;
- `simulate_trial_opportunity_runs(...)`.

These are read-only lab/explainability tools. They must not be used as runtime mutation paths.

---

# Legacy / transitional warnings

## `hero_derived`

Legacy/transitional. Do not add new frontend/runtime dependencies.

## Legacy bonus join tables

Legacy/transitional:

- `origin_bonuses`;
- `building_bonuses`;
- `item_bonuses`;
- `item_generation_base_bonuses`;
- `item_generation_affix_bonuses`.

Current app paths should use semantic `bonus_templates` and `entity_bonuses`.

## Legacy estate address field

`estates.address` is legacy/display compatibility. Use `district_code + address_number` as source of truth.

## Old requirements tables/fields

Legacy/transitional:

- `building_requirements`;
- `buildings.requirements`;
- `buildings.rank_required`.

Use central `requirement_definitions` / `entity_requirements` for new paths.
