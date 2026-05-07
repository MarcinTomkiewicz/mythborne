# Mythsworn — Database Current Notes

Updated: 2026-05-07

This file is the curated semantic index of the current database state. It is not a full `pg_dump`.

If this file conflicts with the actual database, generated Supabase types, or a newer explicit user instruction, prefer:

1. explicit user instruction,
2. current database schema / migrations / dump,
3. generated `database.types.ts`,
4. `current-decisions.md`,
5. this file.

After every schema/RPC migration that Codex will consume, regenerate/update generated Supabase types before frontend work.



## Update 2026-05-07 — S9-FIX2 item native display policy and item-generation requirements admin readiness

This section is based on the current dump plus rollback/read-only smoke checks run after the S9-FIX2 item detail hardening and item-generation requirements preflight. It extends the Epic S item/equipment notes below.

### S9-FIX2 — DB-owned native item stat display policy

`item_generation_base_type_targets` is no longer only a validation/config registry for native base-item targets. It now also owns player-facing display classification for native item stats. Current display policy columns are:

- `display_role` — one of `primary_stat`, `bonus_stat`, `technical_default`, `hidden`;
- `display_group` — optional grouping key such as `damage`, `defense`, `critical`, `attacks`, `base_stat`, `evasion`, or `jewelry_identity`;
- `display_group_role` — one of `range_min`, `range_max`, `value`;
- `is_player_visible`;
- `hide_when_zero`;
- `hide_when_default`;
- `display_label` — optional player-facing label override.

Rules for frontend/admin consumption:

- `primary_stat` rows are the DB-owned source for the main Item stats section;
- `bonus_stat` native rows may be rendered in the Bonus section when visible/nonzero according to the returned payload;
- `technical_default` and `hidden` rows must not be rendered as player-facing Item stats;
- Angular must not classify native stats by `base_type_key`;
- `display_group = damage` with `range_min`/`range_max` means DB/RPC combines `min_damage` and `max_damage` into a single range row such as `Damage 2-9`;
- debug/admin surfaces may inspect hidden native rows, but player-facing item details should consume the read-model rows returned by RPC.

Current seeded display intent:

- one-handed weapons: primary `Damage`; `attack_count = 1` is a hidden technical default; native zero crit rows are not primary stats;
- two-handed weapons: primary `Damage`, `Critical chance`, and `Critical damage`; `attack_count = 1` is a hidden technical default;
- ranged weapons: primary `Damage` and `Attack count`; native crit rows are bonus-style and hidden when zero;
- shield/helmet/armor/pants/boots: primary `Defense`; shield/pants/boots extra native traits such as evasion/agility/dexterity are bonus-style and hidden when zero;
- amulet: primary Charisma as jewelry identity;
- ring: primary Charisma or Cunning as jewelry identity, with missing/zero alternative hidden.

Current item detail RPC:

- `get_hero_armory_item_detail(p_hero_id uuid, p_item_id uuid)` is the owner-safe visible armory item detail read model;
- it builds on `get_hero_armory_items(p_hero_id)` and returns one row for a visible/readable item;
- it returns `bonuses_json` with the DB-owned display contract:
  - `bonuses_json.itemStats.rows` — primary player-facing Item stats;
  - `bonuses_json.itemStats.bonusRows` — native base-item rows classified as bonus-style rows when visible;
  - `bonuses_json.itemStats.hiddenNativeRows` — debug/admin diagnostics for hidden native rows and hide reasons;
  - `bonuses_json.nativeRows` — native/base rows for diagnostics;
  - `bonuses_json.modifierRows` — prefix/suffix/item modifier rows;
  - `bonuses_json.finalStats.damage` — convenience final damage range when available.

Verified smoke:

- Demonic Dagger / one-handed weapon returned only `Damage 2-9` in `itemStats.rows`;
- `attack_count = 1` appeared in `hiddenNativeRows` as `technical_default`;
- native zero crit rows stayed out of player-facing Item stats;
- Demonic prefix modifier rows remained in `modifierRows`;
- full multi-type runtime smoke was limited by missing sample items for most base types, but the display-policy seed matrix passed for all expected base types/targets.

Out of scope / follow-up:

- S9-FIX2 does not implement multiplicative `attack_count` affix semantics. Future `attack_count` modifier aggregation should remain DB-owned and must not be implemented as Angular-side arithmetic.

### Item-generation requirements admin editor DB/RPC readiness

The central requirements system already supports item generation base and affix requirements. The database side is ready for the frontend admin editor that views and edits central `entity_requirements` for item generation bases and affixes.

Supported target entity types:

- `requirement_entity_type = item_generation_base`;
- `requirement_entity_type = item_generation_affix`;
- `requirement_entity_type = item` also exists for item-specific requirement targets, but generated item effective requirements intentionally aggregate base/prefix/suffix layer requirements for equip/use checks.

Canonical read/search/preview surfaces:

- `search_item_generation_entity_targets(p_entity_type, p_query, p_limit)` — autocomplete/read model for item generation base, affix and quality targets;
- `search_item_generation_entity_targets_page(p_entity_type, p_query, p_limit, p_offset)` — paginated target browser with `total_count`;
- `get_requirement_impact_preview(p_entity_type, p_entity_id)` — central requirement preview using `requirement_definitions` and `entity_requirements`; it does not read legacy building requirement JSON/columns;
- `get_item_requirement_component_rows(p_item_id)` — owner/staff-safe component resolver for active item layer requirements from base, prefix and suffix;
- `get_item_effective_requirements(p_item_id)` — owner/staff-safe final item requirement aggregation;
- `check_hero_meets_item_requirements(p_hero_id, p_item_id)` — canonical item equip/use requirement check.

Canonical write surfaces for admin/editor UI:

- `create_entity_requirement(...)`;
- `update_entity_requirement(...)`;
- `deactivate_entity_requirement(...)`;
- `reorder_entity_requirements(...)`;
- `assert_can_manage_entity_requirements(...)` validates that the authenticated actor can manage central requirements and that item-generation base/affix/item targets exist.

Frontend/admin rules:

- requirements must be shown separately from bonuses;
- frontend must not use local JSON fields or legacy requirement columns for item generation requirements;
- frontend must not direct-write `entity_requirements`;
- all create/update/deactivate/reorder mutations must go through the canonical audited RPCs above;
- `get_requirement_impact_preview(...)` can return inactive rows after deactivation, so UI must show status clearly or deliberately filter/section active vs inactive requirements;
- current production data may have zero configured requirements for item-generation bases and affixes; this is a valid editable empty state, not a DB blocker.

Verified smoke:

- preflight confirmed required enum values, active `hero_level` and `hero_stat` definitions, target search for item-generation bases and affixes, and all required RPCs;
- rollback smoke confirmed create/update/reorder/deactivate for `item_generation_base` and `item_generation_affix`;
- rollback smoke confirmed `get_requirement_impact_preview(...)` reflects created, updated, reordered and deactivated rows;
- no permanent data changes were required by the smoke.

Frontend readiness verdict:

- DB/RPC foundation: ready;
- governed write path: ready;
- target search: ready;
- preview/read model: ready;
- initial item-generation requirements data: empty but editable;
- DB/RPC blocker for the admin editor: none;
- regenerate Supabase generated types before frontend work consumes these contracts.


## Update 2026-05-07 — latest dump reconciliation: combat H2, SCALE-DB1, PvP R20/R21 and PvP result chain

This section is based on the latest available schema dump and supersedes older notes in this file where they still imply:

- manual combat manifest does not apply streak difficulty;
- exploration combat finalization can use `manual_combat`;
- combat opponent scaling is a simple multiplier-only snapshot;
- PvP Foundation stops at R-DB5 / R-DB6 is not applied;
- PvP action dictionaries require a dedicated RPC to be read.

Frontend/Codex must regenerate Supabase database types after consuming this section. The current dump is the source of truth where it differs from older status documents.

### Manual live combat H2 — DB-owned streak manifest and valid manual completion

Manual live combat remains DB-authoritative per player action. The current player-facing RPCs are still:

- `ensure_exploration_combat_session(p_challenge_attempt_id uuid, p_request_id text)`;
- `get_combat_live_state(p_session_id uuid, p_since_event_index integer)`;
- `submit_combat_player_action(p_session_id uuid, p_timing_input_json jsonb, p_request_id text)`.

The old public full-resolution exploration combat RPC remains removed and must not be used.

`build_combat_live_action_manifest(p_session_id, p_action_json)` now applies DB/config-owned streak difficulty. It reads the current actor streak from `combat_live_participants.streak_current`, computes base hit chance from the `combat_hit_green_zone` formula target, then adjusts the current manifest:

- higher `streakBefore` shrinks `greenZonePercent`;
- higher `streakBefore` increases `speedMultiplier`;
- the adjusted `greenZonePercent` is also returned as `hitChancePercent`;
- `baseHitChancePercent` exposes the pre-streak hit/green-zone value for diagnostics;
- `streakTuning` exposes the config values used for the current manifest.

Current streak tuning config keys:

- `combat_manual_streak_green_zone_shrink_points_per_stack`;
- `combat_manual_streak_green_zone_min_percent`;
- `combat_manual_streak_speed_multiplier_per_stack`;
- `combat_manual_streak_speed_multiplier_max`.

Current canonical manifest fields include:

- `manifestId`;
- `sessionId`;
- `roundNumber`;
- `actionIndex`;
- `attackIndex`;
- `actorParticipantId`;
- `targetParticipantId`;
- `actorSide`;
- `targetSide`;
- `greenZonePercent`;
- `hitChancePercent`;
- `baseHitChancePercent`;
- `speedMultiplier`;
- `streakBefore`;
- `requiresManualInput`;
- `isPlayerControlled`;
- `generatedAt`;
- `source`;
- `streakTuning`;
- `notes`.

Frontend rule:

- read `greenZonePercent`, `speedMultiplier` and `streakBefore` directly from the DB manifest;
- do not locally compute streak shrink or speed as authority;
- do not require non-canonical aliases such as `greenZoneWidth`, `greenZoneWidthPercent`, `speed` or `currentStreak`;
- attack outcome, damage, HP, evade and crit still come only from `submit_combat_player_action(...)` response/events.

Participant HP contract:

- current HP key is `healthCurrent`;
- max HP key is `healthMax`;
- frontend should not expect `maxHp`, `maxHP` or `maxHealth` in the live participant read model unless a frontend mapper intentionally aliases it.

Exploration combat finalization:

- `finalize_exploration_combat_session(...)` persists the final combat result and completes the exploration challenge attempt through `complete_hero_exploration_challenge_attempt(...)`;
- completion mode is now canonical `manual`, not invalid `manual_combat`;
- metadata may still mention `manual_combat_to_manual` as a diagnostic/historical fix marker;
- draw counts as failure for exploration Trial/Encounter.

Reward/drop observation after live combat smoke:

- successful combat Trial completion correctly creates a `reward_grant`;
- `reward_grant_entries` for XP and Character Points are durable DB rows;
- `item_generation` may legally produce zero item drops when `min_item_count = 0`;
- direct generator and forced item-count smoke confirmed item generation and `reward_grant_entries.item_id` linkage work when item count is `1`;
- player UI does not need to announce “no item dropped”;
- admin/test UI should distinguish “item_count = 0” from generator failure;
- if `reward_grant_entries` contains XP/CP, frontend/test UI must not display “No reward entries were recorded.”

### SCALE-DB1 — formula-backed combat opponent scaling and balancer preview

Combat opponent runtime scaling now uses the DB formula system rather than a simple multiplier-only snapshot.

Primary formula target:

- `combat_opponent_scaled_stat`.

Current default expression:

```text
round(baseValue + (currentLevel - 1) * difficultyMultiplier)
```

Allowed variables:

- `baseValue`;
- `currentLevel`;
- `difficultyMultiplier`.

Important rule: this expression is not hardcoded in the snapshot builder. Runtime resolves and evaluates the active DB formula. It can be changed through formula governance or overridden per opponent/candidate where configured.

Current formula priority for opponent stat scaling:

1. candidate `scaling_formula_id` on `trial_combat_candidates` or `encounter_combat_candidates`;
2. opponent `default_scaling_formula_id` on `combat_opponent_definitions`;
3. global assignment for `combat_opponent_scaled_stat`.

Current SCALE-DB1 helper/RPC surface:

- `resolve_combat_opponent_scaling_formula(p_opponent_definition_id uuid, p_candidate_scaling_formula_id uuid default null)` — service-only helper resolving the formula priority above;
- `evaluate_combat_opponent_scaled_stat(p_base_value numeric, p_current_level integer, p_difficulty_multiplier numeric, p_opponent_definition_id uuid, p_candidate_scaling_formula_id uuid default null)` — service-only helper evaluating one stat;
- `build_opponent_combatant_snapshot_for_resolver(p_opponent_definition_id uuid, p_side combat_side, p_reference_level integer, p_difficulty_multiplier numeric, p_candidate_scaling_formula_id uuid)` — service-only formula-backed snapshot builder;
- `build_opponent_combatant_snapshot_for_resolver(p_opponent_definition_id uuid, p_side combat_side, p_reference_level integer, p_difficulty_multiplier numeric)` — compatibility wrapper without candidate override;
- `preview_combat_opponent_scaling(p_opponent_definition_id uuid, p_difficulty_multiplier numeric default 1, p_scaling_formula_id uuid default null, p_levels integer[] default array[1,5,10,20,50])` — authenticated read-only balancer/admin preview RPC.

`pick_exploration_combat_live_opponent(...)` now returns the candidate `difficulty_multiplier` from the matching Trial/Encounter combat candidate instead of a fixed `1`. `ensure_exploration_combat_session(...)` now looks up candidate `scaling_formula_id` and passes it to the formula-backed opponent snapshot builder.

Formula-backed opponent snapshots include scaling diagnostics such as:

- `baseStats`;
- `stats`;
- `snapshotVersion = SCALE-DB1`;
- `difficultyMultiplier`;
- `scalingFormulaId`;
- `scalingFormulaKey`;
- `scalingFormulaSource`;
- `candidateScalingFormulaId`;
- `opponentDefaultScalingFormulaId`.

Balancer/admin UI rule:

- use `preview_combat_opponent_scaling(...)` to show final stat values for several hero levels before changing `difficulty_multiplier` or formula assignments;
- do not leave the admin with only a raw numeric multiplier input;
- show formula source: `candidate_override`, `opponent_default`, `global_assignment` or fallback context where applicable.

Design caveat:

- the current default formula scales every base stat row, including a stat with `baseValue = 0`;
- if design wants zero to remain zero, create/change a DB formula such as `if(baseValue <= 0, 0, ...)` through formula governance or candidate/opponent override.

### Epic W / Exploration diagnostics and selection guard current status

The current dump includes the Epic W exploration completion work:

- readiness reason dictionary/metadata;
- `get_trial_definition_readiness(...)`;
- `get_encounter_definition_readiness(...)`;
- readiness-aware Trial/Encounter pickers used by `resolve_hero_exploration_step(...)`;
- no-ready eligible Encounter fallback to `nothing`;
- `get_exploration_step_selection_diagnostic(p_step_id uuid)`;
- `get_exploration_reward_execution_diagnostic(p_challenge_attempt_id uuid)`;
- config-backed `exploration_step_base_duration_seconds`;
- `get_exploration_step_duration_seconds(p_server_id uuid, p_difficulty_key text)` consumed by `start_hero_exploration_step(...)`.

Runtime rules:

- normal Trial/Encounter selection should only use readiness-ready content;
- if an Encounter roll happens but no ready eligible Encounter matches, the step is safely recorded as `nothing`;
- frontend/admin diagnostics should read DB diagnostic RPCs, not reconstruct selection/reward logic in Angular;
- timer display should use DB `started_at` / `resolves_at`.

### PvP R20/R21 — action dictionaries, targeting/protection metadata and formula targets

R20 dictionary/read facts:

- `pvp_action_kinds` exists as a DB-backed dictionary;
- `pvp_action_statuses` exists as a DB-backed dictionary;
- rows include active `attack` and `spy`, inactive/future `siege`;
- action statuses include travelling/arrived/manual window/resolving/resolved/cancelled/failed/expired;
- there is no dedicated dictionary RPC for these two tables;
- `authenticated` has `SELECT`, `anon` does not;
- RLS is enabled and policies exist.

Frontend/admin rule:

- a narrow read-only service using direct dictionary reads is acceptable for `pvp_action_kinds` and `pvp_action_statuses`;
- labels/descriptions/helper text should come from dictionary rows;
- no write paths should be added;
- inactive `siege` must be treated as future/inactive, not as ready gameplay.

R21 formula/metadata facts:

Current PvP formula targets include:

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

Current PvP targeting/protection metadata namespaces include:

- `pvp_configurator_section`;
- `pvp_targeting_section`;
- `pvp_runtime_section`.

Important metadata rows include:

- `pvp_targeting_section:estate_vicinity_targeting`;
- `pvp_targeting_section:attack_level_range`;
- `pvp_targeting_section:travel_time`;
- `pvp_targeting_section:target_protection`;
- `pvp_targeting_section:one_incoming_attack`;
- `pvp_configurator_section:level_range`;
- `pvp_configurator_section:travel_time`;
- `pvp_configurator_section:target_protection`;
- `pvp_configurator_section:manual_window`.

Runtime/read surfaces:

- `pvp_actions`;
- `pvp_target_protections`;
- `calculate_pvp_estate_distance_score(...)`;
- `get_pvp_target_candidates(p_attacker_hero_id uuid, p_district_code text default null, p_search text default null, p_limit integer default 50, p_offset integer default 0)`;
- `expire_pvp_target_protections(p_server_id uuid)`;
- `set_pvp_target_protection_updated_at()` trigger helper.

Frontend/admin rule:

- formula UI should filter by real DB target keys, not invented UI constants;
- targeting/protection explanations should consume `pvp_targeting_section` / `pvp_configurator_section` metadata;
- metadata gaps are valid only for missing detailed field-level copy, not for the whole targeting/protection area.

### PvP attack result/result-consequence/report chain now present in the latest dump

Older notes saying that R-DB6 was not applied are obsolete for the current dump. The dump includes the PvP attack result and post-result chain through resource consequences, XP rewards, future Prestige context, anti-abuse signals and reports.

Current attack result table/workflow:

- `pvp_attack_results` is the durable PvP attack outcome table produced from persisted PvP `combat_results`;
- `create_pvp_attack_result_from_combat_result(p_combat_result_id, p_request_id default null)` creates/gets a PvP attack result from `combat_results.source_type = 'pvp'`;
- `after_pvp_combat_result_insert_create_attack_result()` automatically creates a PvP attack result after a PvP combat result insert;
- outcome keys are `attacker_victory`, `defender_victory`, and `draw`;
- `level_difference` means `attacker_level_snapshot - defender_level_snapshot`.

Current post-result chain:

- `apply_pvp_resource_consequences(p_pvp_attack_result_id, p_request_id default null)` applies PvP resource consequences for `drachma`, `materials` and `workforce` only;
- resource consequences settle attacker/defender runtime state before computing resource loss/transfer;
- `apply_pvp_xp_rewards(p_pvp_attack_result_id, p_request_id default null)` routes PvP XP through canonical progression (`grant_hero_experience(...)`), so Character Points are generated by XP/progression, not as separate PvP CP entries;
- `build_pvp_prestige_context(...)` and `refresh_pvp_attack_result_prestige_context(...)` store future Prestige context only;
- `generate_pvp_attack_anti_abuse_signals(...)` creates review-only PvP signals such as shared identity context and feeding-pattern candidates; relationship declarations, including mercenary context, are context only and do not suppress signals;
- `create_pvp_attack_game_report(...)` creates/gets contextual `pvp_combat` reports with `source_entity_type = 'pvp_result'` and `source_entity_id = pvp_attack_results.id`;
- report combat sections resolve through `pvp_attack_results.combat_result_id` and do not duplicate combat attacks into report tables.

Current trigger wrappers include:

- `after_pvp_attack_result_insert_apply_resource_consequences`;
- `after_pvp_attack_result_insert_apply_xp_rewards`;
- `after_pvp_attack_result_insert_refresh_prestige_context`;
- `after_pvp_attack_result_update_prestige_context`;
- `after_pvp_attack_result_insert_generate_anti_abuse_signals`;
- `after_pvp_attack_result_insert_create_report`.

Frontend rules:

- frontend must not direct-write `pvp_attack_results`, resource consequence, reward context, report context, notification context or anti-abuse signal rows;
- PvP result/report/notification surfaces should consume DB-owned read models and context JSON;
- ordinary PvP does not transfer items, buildings, Character Points, or estate ownership;
- PvP notifications are after-the-fact result notifications, not incoming-attack notifications.

### Generated types / frontend contract note

The latest dump includes RPC/table/function changes that must be reflected in generated Supabase types before frontend work continues. In particular, frontend work touching manual combat, exploration diagnostics, opponent scaling preview, PvP targeting, PvP action dictionaries or PvP result reports must use regenerated types.


## Update 2026-05-06 — Epic U/V Luck, live manual combat and Epic W Exploration Core

This section supersedes the earlier 2026-05-06 combat notes that still described `submit_exploration_challenge_combat_resolution(...)` as the player-facing manual combat endpoint. The current dump shows the live combat session model and the old full-resolution exploration combat RPC is removed.

Frontend/Codex must regenerate Supabase database types before consuming the contracts in this section.

### Epic U — Luck Foundation DB/RPC/formula/config foundation

Epic U Luck Foundation is DB-ready.

Final checks passed for the core Luck foundation:

- expected Luck/combat/reward formula targets are present, assigned and enabled;
- expected Luck-related config definitions are active;
- Luck resolver and trial power helpers use DB formula/runtime state rather than Angular-side authority;
- exploration/trial runtime helpers use DB formula runtime and Luck-aware runtime inputs;
- reward amount and item-count helpers route through Luck-aware formula targets;
- item generation runtime is wired through Luck-aware DB helpers;
- combat Luck preview exists as a DB read/preview contract.

Core Luck helpers/RPCs include:

- `get_hero_luck_breakdown(p_hero_id)` — DB-side explanation of effective Luck sources;
- `get_hero_luck_value(p_hero_id)` — effective hero Luck;
- `get_hero_exploration_luck_value(p_hero_id)` — exploration Luck value routed through runtime Luck;
- `calculate_luck_influence(p_luck_value)` — DB formula-backed Luck influence;
- `calculate_trial_power(p_tested_stat_value, p_luck_value)` — DB formula-backed tested stat + Luck influence power;
- `get_hero_trial_power(p_hero_id, p_tested_stat_key)` — hero-specific trial power read helper;
- `preview_luck_influence_and_trial_power(...)` — admin/Luck Lab preview helper.

Luck-aware exploration/trial runtime helpers include:

- `get_trial_opportunity_chance(p_exploration_id)`;
- `get_trial_manifestation_chance(p_exploration_id, p_trial_definition_id)`;
- `get_challenge_auto_resolve_success_chance(p_challenge_attempt_id)`;
- `get_non_trial_encounter_chance(p_exploration_id)`.

Luck Lab / preview RPCs include:

- `preview_trial_opportunity_curve(...)`;
- `simulate_trial_opportunity_runs(...)`;
- `preview_trial_manifestation_chance(...)`;
- `preview_challenge_auto_resolve_success_chance(...)`;
- `preview_non_trial_encounter_chance(...)`;
- `preview_exploration_luck_rng_chain(...)`;
- `preview_reward_profile_luck(...)`;
- `preview_reward_generated_item_luck(...)`;
- `preview_combat_luck_formula_context(...)`.

Reward and item-generation Luck contracts:

- `reward_entry_amount` is Luck-aware for range amount calculation;
- `reward_entry_item_count` is Luck-aware for item-generation count calculation;
- `evaluate_reward_profile_entry_amount(...)` uses the reward amount formula target;
- `evaluate_reward_profile_entry_item_count(...)` uses the item-count formula target;
- `grant_reward_profile_to_hero(...)` delegates to the amount and item-count helpers, then calls the existing item generator;
- `reward_item_budget_bucket_index`, `reward_item_quality_adjusted_weight` and `reward_item_affix_chance` drive Luck-aware item generation;
- `generate_reward_item_for_hero(...)` uses Luck-aware helper logic and writes Luck-aware metadata;
- legacy comparison helpers such as `compute_reward_item_budget(...)` and `pick_reward_item_quality_key(...)` remain available for compatibility/admin comparison.

Combat Luck preview contract:

- `preview_combat_luck_formula_context(...)` is read-only and formula-backed;
- it exposes how Luck affects critical chance and evasion chance where the DB/formula layer exposes those surfaces;
- it does not persist combat and does not apply combat consequences.

Epic U does not require Angular to simulate formula authority. Frontend/Luck Lab must consume DB/RPC outputs and should not hardcode Luck curves, chance formulas, reward ranges or item-generation Luck effects.

### Epic V — Luck Lab registry/read model

Epic V DB/RPC readiness is implemented for the first Luck Lab frontend slice.

Current Luck Lab registry RPC:

- `get_luck_lab_preview_contracts()` — authenticated read model listing Luck Lab preview/simulation contracts, labels, descriptions, helper text, RPC names, signatures, result type strings, availability flags, ACL flags, sort order and lightweight metadata.

The registry currently covers 10 contracts across panels:

- `core` — Luck influence / Trial Power;
- `exploration` — opportunity curve, multi-roll simulation, manifestation chance, non-Trial Encounter chance and RNG-chain preview;
- `trial` — challenge auto-resolve preview;
- `rewards` — reward profile Luck preview;
- `drops` — generated item Luck preview;
- `combat` — combat Luck formula context preview.

Luck Lab preview RPC ACL was hardened:

- `authenticated` can execute the 10 Luck Lab preview/simulation RPCs;
- `anon` and `PUBLIC` execute were removed;
- `get_luck_lab_preview_contracts()` is authenticated-only.

Luck Lab metadata:

- `ui_metadata_entries` includes `luck_lab_section` rows for overview/core/exploration/combat/drops/comparison/formula navigation;
- `ui_metadata_entries` includes `luck_lab_runtime_rule` rows for DB/RPC authority and single-roll/RNG interpretation.

Frontend rule:

- Luck Lab must start from `get_luck_lab_preview_contracts()` instead of hardcoding the preview surface list;
- Angular may format, compare and chart DB-returned values;
- Angular must not compute Luck formulas, caps, multipliers, chance curves, drop behavior or combat Luck context as authority;
- expensive simulations such as `simulate_trial_opportunity_runs(...)` should be explicit/debounced in UI, not fired on every slider tick.

### Live manual combat runtime — DB-owned per player action

Manual combat now uses a DB-owned live session model. This replaces the removed public full-resolution exploration combat endpoint.

Removed legacy public RPC:

- `submit_exploration_challenge_combat_resolution(uuid, jsonb, text)` — removed intentionally. Frontend must not call it.

Current live combat tables:

- `combat_live_session_statuses`;
- `combat_live_participant_statuses`;
- `combat_live_event_kinds`;
- `combat_live_sessions`;
- `combat_live_participants`;
- `combat_live_events`;
- `combat_live_action_requests`.

Purpose of the live model:

- `combat_live_sessions` stores active combat state between player clicks;
- `combat_live_participants` stores hero/opponent participants with HP, streak, snapshot and manual-input flags;
- `combat_live_events` stores round/action/system events such as `round_started`, `manifest_generated`, `attack_resolved` and `combat_completed`;
- `combat_live_action_requests` stores idempotency by `(session_id, request_id)`.

Frontend-facing live combat RPCs:

- `ensure_exploration_combat_session(p_challenge_attempt_id uuid, p_request_id text)`:
  - authenticated owner-safe RPC;
  - validates exploration combat Trial/Encounter attempts through `hero.user_id`, never `hero.id = auth.uid()`;
  - builds hero/opponent participants from trusted DB snapshots;
  - starts a round/order and returns state;
  - if the first action requires player input, returns a DB-generated Walking Dead timing manifest.
- `get_combat_live_state(p_session_id uuid, p_since_event_index integer)`:
  - authenticated owner-safe read model;
  - returns current session state, participants, current manifest, event delta, final result id and event count;
  - does not resolve actions.
- `submit_combat_player_action(p_session_id uuid, p_timing_input_json jsonb, p_request_id text)`:
  - authenticated owner-safe mutation RPC;
  - resolves exactly one current player-controlled action;
  - then automatically resolves non-player/opponent actions until the next player input, terminal combat, draw/turn limit or error state;
  - stores idempotency in `combat_live_action_requests`;
  - if the live exploration combat ends, finalizes to `combat_result` and exploration completion workflow.

Internal/service-only live combat helpers include:

- `combat_live_snapshot_number(...)` and `combat_live_snapshot_text(...)`;
- `pick_exploration_combat_live_opponent(...)`;
- `build_combat_live_action_manifest(...)`;
- `start_combat_live_round(...)`;
- `combat_live_formula_value(...)`;
- `combat_live_timing_input_percent(...)`;
- `combat_live_attack_source_kind_from_text(...)`;
- `resolve_combat_live_attack(...)`;
- `advance_combat_live_to_next_player_action(...)`;
- `mark_combat_live_session_completed_if_terminal(...)`;
- `get_combat_live_session_outcome(...)`;
- `build_combat_live_participants_snapshot_json(...)`;
- `build_combat_live_attacks_snapshot_json(...)`;
- `persist_completed_combat_live_session_result(...)`;
- `finalize_exploration_combat_session(...)`.

Live combat timing manifest contract:

- `current_timing_manifest_json` is the canonical DB-owned manifest for exactly one current player-controlled action;
- current canonical fields emitted by `build_combat_live_action_manifest(...)` include:
  - `manifestId`;
  - `sessionId`;
  - `roundNumber`;
  - `actionIndex`;
  - `attackIndex`;
  - `actorParticipantId`;
  - `targetParticipantId`;
  - `actorSide`;
  - `targetSide`;
  - `greenZonePercent`;
  - `hitChancePercent`;
  - `speedMultiplier`;
  - `streakBefore`;
  - `requiresManualInput`;
  - `isPlayerControlled`;
  - `generatedAt`;
  - `source`;
  - `notes`.
- `greenZonePercent` is the DB-owned width/chance value used for the current Walking Dead green zone;
- `speedMultiplier` is the DB-owned animation speed hint;
- `streakBefore` is the current streak before resolving this action;
- frontend must adapt to this DB manifest shape rather than requiring aliases such as `greenZoneWidth`, `greenZoneWidthPercent`, `speed` or `currentStreak`;
- frontend may animate locally, but it must not show hit/miss/evade/critical/damage/HP outcome before `submit_combat_player_action(...)` returns.

Recommended timing input payload:

```json
{
  "positionPercent": 50
}
```

The DB helper also accepts a few alternate input key names for robustness, but the frontend contract should standardize on `positionPercent`.

Live combat finalization:

- live combat persists final combat snapshots through `persist_combat_result_snapshot(...)`;
- `combat_results`, `combat_result_participants`, `combat_result_participant_stats` and `combat_result_attacks` remain the report-ready persistence model;
- `finalize_exploration_combat_session(...)` completes Trial/Encounter attempts through `complete_hero_exploration_challenge_attempt(...)`;
- draw counts as failure for exploration Trial/Encounter;
- reward grants remain caller/completion-owned, not frontend-computed.

Verified live combat behavior:

- table/schema/RLS/ACL foundation verified;
- one player action produces DB events;
- opponent/auto action catch-up reaches the next player action;
- the next player manifest is generated by DB;
- retry with the same `request_id` does not create new events;
- final `combat_result` snapshot persistence passed rollback smoke;
- old full-resolution exploration combat RPC was removed.

Open live-combat smoke note:

- synthetic/transactional smoke passed for step resolution, auto catch-up and final snapshot;
- representative full player-flow smoke on a real completed exploration combat Trial/Encounter should still be rerun when data/UI is convenient, especially reward-once behavior after a real victory;
- current observed live session already showed a DB manifest with `manifestId`, participants, `greenZonePercent`, `hitChancePercent`, `speedMultiplier` and `streakBefore`; the UI parser must consume the DB manifest rather than report it missing.

PvP boundary:

- PvP should use the same generic live combat/session/result foundations when wired, but it must use a PvP-specific wrapper/finalizer and must not call exploration-specific ensure/finalize RPCs.

### Epic W — Exploration Core Completion DB/RPC foundation

Epic W DB/RPC foundation is implemented far enough for frontend/runtime consumption.

Scope completed:

- readiness reason dictionary and metadata;
- Trial/Encounter readiness read models;
- runtime selection guard through readiness-aware pickers;
- selection diagnostics read model;
- reward/effect execution diagnostics read model;
- config-backed exploration step timer.

Readiness dictionary:

- `exploration_readiness_reason_codes` stores DB-backed reason codes with label, description, severity, `is_blocking`, sort order and metadata;
- `ui_metadata_entries` includes `exploration_readiness_section` and `exploration_readiness_reason` metadata.

Readiness RPCs:

- `get_trial_definition_readiness(p_trial_definition_id uuid default null)`:
  - authenticated read model;
  - returns Trial readiness with `is_ready`, `blocking_reason_count`, `reasons_json`, reward assignment count and combat candidate count;
  - current conservative Trial readiness supports combat minigame and blocks unsupported/unwired minigames.
- `get_encounter_definition_readiness(p_encounter_definition_id uuid default null)`:
  - authenticated read model;
  - returns Encounter readiness with `is_ready`, `blocking_reason_count`, `reasons_json`, reward assignment count, combat candidate count and effect payload count;
  - current supported encounter kinds are `combat`, `resource`, `buff`, `debuff`;
  - combat Encounter readiness requires an active concrete opponent candidate;
  - resource Encounter readiness requires active reward profile/entry resource payload;
  - buff/debuff Encounter readiness requires active `encounter_effect_payloads` pointing to an active `exploration_effect_definitions` row of matching effect kind.

Runtime selection guard:

- `pick_random_trial_definition()` now joins `get_trial_definition_readiness(...)` and only returns ready Trials;
- `pick_random_encounter_definition(p_exploration_id)` now joins `get_encounter_definition_readiness(...)`, preserves existing difficulty/district/effect filters, and only returns ready Encounters;
- if no ready eligible Encounter exists, the picker returns an empty composite rather than raising;
- `resolve_hero_exploration_step(p_step_id)` now records a safe `nothing` outcome with metadata such as `readinessGuarded = true` and `encounterSelectionSkippedReason = no_ready_encounter_definition` when an Encounter roll happens but no ready eligible Encounter exists.

Selection diagnostic RPC:

- `get_exploration_step_selection_diagnostic(p_step_id)`:
  - authenticated owner-safe read model;
  - explains step outcome using DB-owned chance/roll fields, selected Trial/Encounter readiness, challenge status/reward id and resolver metadata;
  - handles steps with no Trial/Encounter without unassigned-record runtime errors;
  - does not mutate gameplay state.

Reward/effect execution diagnostic RPC:

- `get_exploration_reward_execution_diagnostic(p_challenge_attempt_id)`:
  - authenticated owner-safe read model;
  - joins challenge attempt, `reward_grants`, `reward_grant_entries`, `encounter_effect_payloads` and `hero_exploration_effects`;
  - uses `reward_grants.recipient_hero_id` as the hero ownership column;
  - exposes JSON arrays for reward entries, effect payloads and hero effects plus diagnostic flags;
  - does not mutate gameplay state.

Exploration timer config:

- config definition `exploration_step_base_duration_seconds` exists and is active;
- active global config value currently defaults to `60`;
- `get_exploration_step_duration_seconds(p_server_id, p_difficulty_key)` returns DB/config-owned step duration in seconds;
- final duration is `exploration_step_base_duration_seconds × exploration_difficulty_tiers.step_duration_multiplier`, with a safe lower bound;
- `start_hero_exploration_step(...)` now consumes `get_exploration_step_duration_seconds(...)` and writes metadata:
  - `durationSeconds`;
  - `durationSource = config_exploration_step_base_duration_seconds`;
  - `durationConfigKey = exploration_step_base_duration_seconds`;
  - `difficultyMultiplier`.
- frontend should display timers from DB `started_at` / `resolves_at`, not from a hardcoded Angular duration.

Verified Epic W behavior:

- readiness RPCs exist and are authenticated-only;
- readiness reason table has RLS/policy and metadata;
- readiness smoke returned rows and JSON-array reasons;
- runtime pickers choose ready Trial/Encounter only;
- sample picker smoke returned a ready Trial and ready resource Encounter;
- `resolve_hero_exploration_step(...)` smoke resolved a real in-progress step into a ready Encounter and diagnostic confirmed `readinessGuarded = true`;
- reward/effect diagnostic smoke worked on a real completed challenge attempt;
- step duration config/helper/metadata is structurally verified;
- start-step positive smoke was pending when no startable exploration existed, but active UI state later showed DB `started_at`/`resolves_at` with a 60-second duration consistent with the config.

Content readiness snapshot from verification:

- active combat Trials existed, but readiness reduced them to a smaller ready subset;
- readiness verification showed 1 ready Trial and 2 ready Encounters at the time of smoke;
- some configured Encounter content remained blocked, including combat and debuff examples, which is expected because readiness is conservative and exposes missing candidates/effect payloads rather than letting incomplete content enter runtime.

### Q9 — Notification Hook Diagnostics DB/RPC source

Q9 backend diagnostics source is implemented and verified.

Current DB source:

- `notification_db_owned_producer_diagnostics` — DB-backed registry of DB-owned notification producers and explicit non-producers;
- `get_admin_notification_db_owned_producer_diagnostics()` — canonical admin/staff diagnostics RPC;
- `get_notification_hook_diagnostics()` — compatibility wrapper;
- `notification_hook_diagnostics_section` metadata rows exist in `ui_metadata_entries`.

Verification passed with:

- 11 diagnostics rows;
- 10 OK producer rows;
- 1 explicit non-producer row;
- `blockerCount = 0`;
- `game_report_created_is_not_default_notification_producer` is an explicit non-producer with empty missing arrays;
- diagnostics RPCs do not create or mutate `notifications`.

Q9 frontend should consume the diagnostics RPC/source. Missing producers or missing notification types should be treated as DB/RPC blockers, not patched through Angular insert logic.

### Type regeneration reminder

Regenerate Supabase generated database types before frontend/Codex work that consumes Epic U/V, live combat, Epic W or Q9 contracts. New or changed RPCs include Luck preview/runtime helpers, Luck Lab registry, live combat session/read/submit/finalizer functions, exploration readiness/diagnostic functions and the config-backed exploration step timer helper.

## Update 2026-05-05 — Epic T Guild Foundation DB/RPC foundation

Epic T guild foundation is now implemented and verified on the database/RPC side. This section records the semantic contract that frontend/Codex should consume after generated Supabase types are regenerated. It is a curated index, not a full dump.

Final verification passed with:

- 19 expected guild-related tables present;
- 47 expected guild/equipment/item-hardening functions present;
- 19 expected guild-related tables with RLS enabled, at least one policy, and authenticated SELECT grant;
- 9 active guild dictionary tables at expected row counts;
- 8 active guild config definitions and 8 active guild config values;
- `get_guild_config_summary()` returning a valid config summary;
- `items_block_current_guild_armory_mutations` enabled on `items`;
- runtime contracts for borrowed guild armory equipment, loadout presets, requirement checks, staff transfer and item mutation guards verified.

### Guild foundation scope

Guilds are a simple server-scoped organization layer for shared item logistics and future group-support hooks. The first foundation includes:

- hero-based guild membership;
- roles: `leader`, `officer`, `member`;
- one active officer per guild;
- invite and request-to-join flows;
- kick/promote/demote/leave/disband/leadership-transfer workflows;
- emergency leader election for inactive-leader recovery;
- guild armory deposit/borrow/return/force-return/withdraw/remove flows;
- per-member guild armory access lock;
- frontend-ready relational read models for dashboard, invite/request rows, armory rows, loan rows and emergency election rows.

Not included in Epic T foundation:

- siege implementation;
- Argonautics implementation;
- guild-to-guild diplomacy;
- alliances / non-aggression pacts / war declarations;
- district influence;
- guild reputation;
- guild buildings;
- player-facing full activity feed/history for every guild armory click.

### Guild dictionaries and config

Active dictionary tables now include:

- `guild_statuses` — active guild lifecycle/status labels;
- `guild_roles` — first-foundation roles `leader`, `officer`, `member`;
- `guild_membership_statuses`;
- `guild_invite_statuses`;
- `guild_join_request_statuses`;
- `guild_emergency_election_statuses`;
- `guild_armory_item_statuses`;
- `guild_armory_loan_statuses`;
- `guild_armory_access_statuses`.

Guild config is exposed through `get_guild_config_summary()` and backed by `config_definitions` / `global_config_values` under the guild managed entity key. Current config summary fields include:

- `creation_drachma_cost`;
- `member_base_limit`;
- `member_limit_per_leader_level`;
- `leader_inactivity_threshold_days`;
- `nomination_duration_minutes`;
- `voting_duration_minutes`;
- `emergency_max_candidates`;
- `armory_capacity`;
- `armory_capacity_is_unlimited`.

`armory_capacity = 0` means unlimited. Frontend/admin UI must read guild config from DB/RPC/config governance and must not hardcode these values.

### Core guild identity and membership tables

Core tables:

- `guilds` — server-scoped guild identity and lifecycle state.
- `guild_memberships` — hero-based membership rows.
- `guild_invites` — invite workflow rows.
- `guild_join_requests` — request-to-join workflow rows.

Core identity/membership constraints and indexes include:

- guild names are unique per server for active guilds;
- guild tags are unique per server for active guilds;
- one active guild membership per hero/server;
- one active leader per guild;
- one active officer per guild.

Rules:

- `guild.id` is server-scoped through `guilds.server_id`.
- Membership is hero-based, not user-based.
- A hero may have only one active guild membership on a server.
- A leader cannot simply leave; leader must transfer leadership or disband the guild.
- Officer can act as deputy for invites, join requests, member kick, guild armory removal/force-return and member armory access lock.
- Officer cannot disband the guild.

### Core guild RPCs

Core creation/read RPCs:

- `create_guild(p_leader_hero_id, p_name, p_tag, p_description, p_reason, p_request_id)`:
  - owner-safe;
  - creates active guild and leader membership;
  - charges configurable creation drachma cost;
  - returns `guild_id`, `server_id`, `leader_hero_id`, `membership_id`, display fields, cost/balance, and audit id.
- `get_guild_member_limit(p_guild_id)`:
  - resolves member limit from guild config and leader level.
- `get_hero_guild_state(p_hero_id)`:
  - owner-safe current guild state row.
- `get_hero_guild_members(p_hero_id)`:
  - owner-safe member list for current hero's guild.

Invite/request RPCs:

- `create_guild_invite(p_actor_hero_id, p_target_hero_id, p_reason, p_expires_at, p_request_id)`;
- `respond_guild_invite(p_invite_id, p_target_hero_id, p_accept, p_reason, p_request_id)`;
- `cancel_guild_invite(p_invite_id, p_actor_hero_id, p_reason, p_request_id)`;
- `create_guild_join_request(p_requester_hero_id, p_guild_id, p_reason, p_expires_at, p_request_id)`;
- `review_guild_join_request(p_join_request_id, p_actor_hero_id, p_accept, p_reason, p_request_id)`;
- `cancel_guild_join_request(p_join_request_id, p_requester_hero_id, p_reason, p_request_id)`.

Member/officer/leadership RPCs:

- `kick_guild_member(p_actor_hero_id, p_target_hero_id, p_reason, p_request_id)`:
  - leader/officer workflow;
  - officer can kick regular members only;
  - leader cannot be kicked through this workflow.
- `promote_guild_member_to_officer(p_actor_hero_id, p_target_hero_id, p_reason, p_request_id)`:
  - leader-only;
  - target must be active regular member;
  - one active officer rule enforced.
- `demote_guild_officer(p_actor_hero_id, p_target_hero_id, p_reason, p_request_id)`:
  - leader-only;
  - target must be active officer.
- `transfer_guild_leadership(p_actor_hero_id, p_target_hero_id, p_reason, p_request_id)`:
  - leader-only;
  - target must be active member/officer of same guild;
  - old leader becomes member and target becomes leader.
- `leave_guild(p_actor_hero_id, p_reason, p_request_id)`:
  - member/officer leave workflow;
  - active leader is blocked and must transfer leadership or disband.
- `disband_guild(p_actor_hero_id, p_reason, p_request_id)`:
  - leader-only;
  - ends active memberships and cancels pending invites/join requests.

All guild mutation RPCs are `SECURITY DEFINER`, require authenticated context, validate ownership/role/server state, require reasons where decisions are made, and write audit rows where relevant. Frontend must use these RPCs and must not direct-insert/update/delete guild, membership, invite or join request rows.

### Emergency leader election

Emergency election tables:

- `guild_emergency_elections`;
- `guild_emergency_election_nominations`;
- `guild_emergency_election_votes`.

Emergency leader election rules:

- Recovery workflow only; it is not a normal confidence vote.
- Any active non-leader member may start an emergency election if the current leader is inactive past the configured threshold.
- Candidate can be any active member except the inactive leader.
- Candidate consent is not required.
- One candidate is enough to proceed.
- There is no quorum and no 50%+1 all-member threshold.
- Highest vote count wins; ties resolve by earliest nomination.
- If there are no votes, finalization fails without leadership change.

Emergency election RPCs:

- `start_guild_emergency_election(p_actor_hero_id, p_reason, p_request_id)`:
  - validates active membership, non-leader actor, and leader inactivity;
  - creates nomination phase;
  - nomination duration is clamped and built as `minutes * interval '1 minute'`.
- `nominate_guild_emergency_leader_candidate(p_election_id, p_actor_hero_id, p_candidate_hero_id, p_reason, p_request_id)`:
  - validates active nomination phase, active member actor, active member candidate, candidate limit.
- `start_guild_emergency_election_voting(p_election_id, p_actor_hero_id, p_reason, p_request_id)`:
  - moves nomination to voting after nomination window closes and at least one candidate exists;
  - voting duration is clamped and built as `minutes * interval '1 minute'`.
- `vote_guild_emergency_election(p_election_id, p_voter_hero_id, p_candidate_hero_id, p_reason, p_request_id)`:
  - one vote per voter;
  - candidate must be nominated.
- `finalize_guild_emergency_election(p_election_id, p_actor_hero_id, p_reason, p_request_id)`:
  - after voting window closes;
  - selects winner by vote count then earliest nomination;
  - updates `guilds.leader_hero_id` and membership roles.

### Guild armory and loans

Guild armory tables:

- `guild_armory_items` — current deposited item state and terminal withdrawn/removed rows;
- `guild_armory_loans` — active and terminal loan rows;
- `guild_armory_access_locks` — one access state row per guild/member.

Current user-facing guild armory item states are only:

- `available`;
- `borrowed`.

Withdrawn/removed items are terminal/history state and disappear from player-facing current armory read models.

Guild armory rules:

- Guild armory is lending/borrowing, not trade.
- Depositing an item into guild armory does not change `items.hero_id`.
- Borrowing an item creates use permission/loan and does not change ownership.
- Borrowed guild armory items may be equipped.
- Borrowed guild armory items count in runtime loadout.
- Borrowed guild armory items may appear in loadout presets.
- Blocked members cannot borrow or deposit.
- Blocked members can return borrowed items and may still view armory read-only.
- Owner can withdraw own available item.
- Leader/officer can remove available items from guild armory; this is not confiscation and ownership does not change.
- Borrower can return active loan.
- Owner/leader/officer can force-return active loan.
- Return/force-return clears borrower equipment defensively where needed.
- Guild armory loans do not expire in the first foundation.

Guild armory RPCs:

- `guild_member_has_armory_access(p_guild_id, p_member_hero_id)`:
  - internal/helper read of allowed/blocked state.
- `deposit_guild_armory_item(p_actor_hero_id, p_item_id, p_reason, p_request_id)`:
  - owner-safe;
  - actor must own item and be active guild member with armory access;
  - item must be active;
  - no ownership transfer.
- `borrow_guild_armory_item(p_actor_hero_id, p_armory_item_id, p_reason, p_request_id)`:
  - active member with access borrows available item owned by another hero;
  - creates active loan;
  - no ownership transfer.
- `return_guild_armory_loan(p_actor_hero_id, p_loan_id, p_reason, p_request_id)`:
  - borrower-only normal return;
  - returns item to `available` armory state.
- `force_return_guild_armory_loan(p_actor_hero_id, p_loan_id, p_reason, p_request_id)`:
  - owner or leader/officer force-return;
  - returns item to `available` armory state.
- `withdraw_guild_armory_item(p_actor_hero_id, p_armory_item_id, p_reason, p_request_id)`:
  - owner-only withdrawal of available item;
  - item leaves current guild armory view.
- `remove_guild_armory_item(p_actor_hero_id, p_armory_item_id, p_reason, p_request_id)`:
  - leader/officer removal of available item;
  - item leaves current guild armory view without ownership transfer.
- `set_guild_armory_member_access(p_actor_hero_id, p_member_hero_id, p_status_key, p_reason, p_request_id)`:
  - leader/officer updates `allowed`/`blocked` for a member;
  - uses named unique constraint `guild_armory_access_locks_guild_member_key`.

### Guild armory integration with items, equipment and presets

Current helper functions:

- `get_current_guild_armory_item_state(p_item_id)`:
  - returns current `available`/`borrowed` guild armory state and active loan, if any.
- `assert_item_not_in_current_guild_armory(p_item_id, p_action)`:
  - blocks forbidden economic/lifecycle actions for current guild armory items.
- `end_current_guild_armory_state_for_item(p_item_id, p_terminal_status, p_reason, p_actor_hero_id, p_request_id)`:
  - terminalizes guild armory/loan state for controlled ownership/lifecycle workflows;
  - clears equipment if an active borrower loan exists.
- `can_hero_runtime_use_item(p_hero_id, p_item_id)`:
  - normal owner can use owned active/locked items unless item is in current guild armory state;
  - active borrower can use borrowed active guild armory item without ownership transfer.

Equipment and requirement integration:

- `enforce_hero_equipment_item_valid()` now uses `can_hero_runtime_use_item(...)`, so active guild armory borrowers can equip borrowed active items while owners cannot equip deposited/borrowed-away items.
- `equip_hero_item(p_hero_id, p_item_id, p_target_slot_key, p_request_id)` uses `can_hero_runtime_use_item(...)`, checks requirements against the equipping/runtime hero, and journals borrowed guild armory equipment with `ownershipTransferred = false`.
- `check_hero_meets_item_requirements(p_hero_id, p_item_id)` uses runtime usability instead of strict `items.hero_id` ownership. This allows active guild armory borrowers to check/equip borrowed active items without ownership transfer.
- `apply_hero_loadout_preset(p_hero_id, p_preset_number, p_request_id)` uses `can_hero_runtime_use_item(...)` and can apply borrowed guild armory item IDs saved in a preset without ownership transfer. It journals `preset_apply_borrowed_guild_armory_item` where relevant.
- `staff_transfer_item_ownership(...)` calls `end_current_guild_armory_state_for_item(...)` before changing `items.hero_id`, so staff ownership correction ends active guild armory/loan state safely.

Item mutation hardening:

- Trigger `items_block_current_guild_armory_mutations` is enabled on `items` before `UPDATE OF status, hero_id` and before `DELETE`.
- Trigger function `enforce_item_not_in_current_guild_armory_for_item_mutation()` blocks:
  - `active -> locked_trade`;
  - `active -> locked_auction`;
  - `active -> scrapped`;
  - direct `DELETE`;
  - direct `hero_id` ownership change;
  while the item is currently `available` or `borrowed` in guild armory.
- Controlled staff transfer must first terminalize guild armory state through `end_current_guild_armory_state_for_item(...)`.

Frontend consequences:

- Angular must not mutate `items.hero_id` for guild loans.
- Angular must not direct-write `hero_equipment`.
- Angular must not offer trade/auction/scrap/vendor actions for current guild armory borrowed/deposited items unless a DB/RPC read model says the action is valid.
- Guild armory/equipment state must be refreshed from DB/RPC after borrow/return/force-return/withdraw/remove/equip/preset actions.

### Frontend-ready guild read models

Owner-safe read RPCs added for Epic T frontend:

- `get_hero_guild_dashboard(p_hero_id)`:
  - returns current guild/membership state, role, member counts, invite/request counts, active election ids/status, armory counts, personal loan/deposit counts, armory access state and role-derived capability booleans.
- `get_hero_guild_invitation_rows(p_hero_id, p_include_terminal default false)`:
  - relational invite rows visible to the hero and, if leader/officer, outgoing guild invites.
- `get_hero_guild_join_request_rows(p_hero_id, p_include_terminal default false)`:
  - relational join request rows visible to requester and, if leader/officer, incoming guild requests.
- `get_hero_guild_armory_item_rows(p_hero_id)`:
  - current available/borrowed armory rows with item display fields, owner/borrower context and action booleans.
- `get_hero_guild_armory_loan_rows(p_hero_id, p_include_terminal default false)`:
  - active loan rows by default and terminal history if requested.
- `get_hero_guild_emergency_election_summary(p_hero_id)`:
  - current active nomination/voting election summary for hero's guild, if one exists.
- `get_hero_guild_emergency_election_candidate_rows(p_hero_id)`:
  - candidate rows for current active emergency election, with vote counts and my-vote flags.

Read model rules:

- These read RPCs are `SECURITY DEFINER` and owner-safe through `can_read_hero(...)`.
- They return relational/scalar rows, not JSON authority payloads.
- They use `hero.id`, not `auth.uid()`, as gameplay identity.
- Frontend must map these RPC rows into domain models rather than exposing raw generated rows inside components.

### Security, RLS and grants

Guild-related tables now have RLS enabled and authenticated SELECT grants. Player-facing writes are via RPC. Service role has broader table grants where needed.

All player-facing guild mutation RPCs are `SECURITY DEFINER`, authenticate `auth.uid()`, and validate hero ownership/active membership/role/capacity/server state. Critical workflows require `reason`/`status_reason` where appropriate and write audit records.

Frontend Epic T must use generated Supabase types after regeneration and must not create direct-table fallback paths if a guild RPC/read model is missing.



## Update 2026-05-05 — O6 runtime settlement, PvP continuation and Epic S item/equipment foundation

This update records the DB/RPC migrations applied after the previous 2026-05-03 snapshot. It intentionally updates only the semantic current-state notes; it is not a full dump.

### O6 — Estate runtime settlement and resource materialization

Estate/building runtime is now centralized around settlement functions rather than frontend route-specific finalization.

Current settlement helpers/RPCs:

- `settle_estate_runtime(p_estate_id, p_as_of default now())`:
  - service/internal estate settlement helper;
  - finalizes due `estate_building_jobs` up to `p_as_of`;
  - ensures estate building baseline;
  - writes completed building level to `estate_buildings`;
  - marks completed jobs with `updated_at = completes_at`, so the effective gameplay completion time is preserved even if settlement runs later;
  - refreshes hero resource production rates after building completion where relevant.
- `settle_hero_estate_runtime(p_hero_id, p_as_of default now())`:
  - authenticated owner-safe hero estate settlement wrapper.
- `settle_hero_runtime_state(p_hero_id, p_as_of default now())`:
  - central runtime state settlement helper;
  - settles estate/building jobs and materializes hero resources together;
  - should be called by DB workflows that need current durable hero/estate/resource state before decisions.
- `finalize_completed_estate_building_jobs(...)` and `finalize_hero_estate_building_jobs(...)` now delegate to the settlement path rather than owning separate finalization logic.

Owner-safe estate runtime read:

- `get_hero_estate_runtime_state(p_hero_id)` is the canonical frontend read RPC for `/game/mansion` / estate runtime state.
- It performs runtime settlement to DB `now()` before returning.
- It returns scalar identity/context fields such as `hero_id`, `server_id`, `estate_id`, district/address data and `estate_rank`.
- It returns:
  - `active_job_json` as a JSON object or JSON null;
  - `recent_jobs_json` as a JSON array;
  - `buildings_json` as a JSON array;
  - `resources_json` as a JSON array.
- After it returns, overdue active building jobs should already be completed and should not remain as active due jobs.
- Frontend should replace direct `estate_building_jobs` active/recent reads and route-specific finalize calls with this RPC as source of truth.

Resource materialization:

- `materialize_hero_resource(p_hero_id, p_resource_type, p_as_of default now(), ...)` materializes one resource row based on `amount`, `per_hour` and `updated_at`.
- `materialize_hero_resources(p_hero_id, p_as_of default now(), ...)` materializes all relevant hero resources.
- `apply_hero_resource_delta_with_ledger(...)` and `apply_reward_resource_delta(...)` materialize accrued resources before durable spend/add operations.
- `hero_resources` now has a unique `(hero_id, resource_type)` contract through `hero_resources_hero_resource_type_uidx`; resource helper functions rely on that uniqueness rather than selecting “latest” duplicate rows.
- Materialization writes ledger rows with reason such as `resource_accrual_materialized` when accrued amount is persisted.

Building/resource production:

- `resolve_hero_resource_production_rates(p_hero_id)` resolves current production rates from effective building state and configured building bonuses.
- `refresh_hero_resource_production_rates(p_hero_id, p_as_of default now(), ...)` materializes resources before changing `per_hour`, then updates production rates.
- Building completion settlement refreshes production after applying completed building levels.

Building upgrade start:

- `start_estate_building_upgrade(...)` now calls central runtime settlement before pricing/starting a new job.
- It materializes hero resources before spending, so returned `*_balance_after` values should match the durable balances visible after refreshing runtime state.
- It no longer depends on the old direct `finalize_completed_estate_building_jobs(...)` path.

### Exploration runtime cleanup after central activity lock

A stale active exploration runtime lock was found and the DB path was adjusted so exploration read/start paths settle stale exploration runtime state before blocking other gameplay.

Current rule:

- exploration runtime activity locks must be released/archived when the underlying exploration is stale or terminal;
- `get_hero_exploration_state(...)` and `start_or_get_hero_exploration(...)` should call the exploration runtime settlement path before returning/starting state;
- `hero_runtime_activities` remains the central blocking activity model for exploration, PvP attack and PvP spy.

### PvP Foundation after R-DB5 — attack result, resource, XP, prestige, anti-abuse and reports

The older note saying that R-DB6 was not applied is now obsolete. The current DB/RPC state includes the post-R-DB5 PvP foundation layers.

Current PvP attack result flow:

- `pvp_attack_results` is the durable PvP attack outcome table produced from persisted PvP `combat_results`.
- `create_pvp_attack_result_from_combat_result(p_combat_result_id, p_request_id default null)` creates the PvP attack result from a `combat_result` with `source_type = 'pvp'`.
- `after_pvp_combat_result_insert_create_attack_result()` automatically creates a PvP attack result after a PvP combat result insert.
- Outcome keys are `attacker_victory`, `defender_victory`, and `draw`.
- `level_difference` means `attacker_level_snapshot - defender_level_snapshot`.

PvP resource consequences:

- `apply_pvp_resource_consequences(p_pvp_attack_result_id, p_request_id default null)` applies resource consequences to `drachma`, `materials`, and `workforce` only.
- Before calculating transfers/losses it settles runtime state for both attacker and defender via `settle_hero_runtime_state(...)`.
- Attacker victory transfers a configured percentage from defender to attacker.
- Defender victory applies configured attacker loss as a sink.
- Draw has no resource consequence.
- PvP resource consequences never transfer items, Character Points, buildings or estate ownership.
- A trigger wrapper applies resource consequences after `pvp_attack_results` insert.

PvP XP rewards:

- `apply_pvp_xp_rewards(...)` exists as the PvP XP reward workflow.
- It routes XP through the canonical progression workflow (`grant_hero_experience(...)`) so Character Points remain generated by the XP/progression rule, not by a separate PvP CP reward.
- A trigger wrapper applies XP rewards after `pvp_attack_results` insert.

PvP future prestige context:

- `refresh_pvp_attack_result_prestige_context(...)` records future Prestige context without implementing prestige ranks/points.
- Insert/update trigger wrappers refresh prestige context when PvP results and resource/reward contexts change.

PvP anti-abuse and reports:

- `generate_pvp_attack_anti_abuse_signals(...)` produces review-only anti-abuse signals from PvP attack results.
- A trigger wrapper runs PvP anti-abuse signal generation after result insert.
- `create_pvp_attack_game_report(...)` creates the contextual PvP combat report wrapper.
- A trigger wrapper creates the PvP report after result insert.

Rules:

- PvP result triggers are DB-owned workflow wiring; frontend must not direct-write PvP result/resource/reward/report tables.
- PvP spy/attack resolution must use current settled runtime state for estate/building/resource effects.
- PvP still must not use `hero_derived` as runtime source of truth.

### Epic S — Item/equipment foundation current state

Epic S database/RPC foundation is now complete through S-DB9 final verification.

Armory shelves and item shelf position:

- `hero_armory_shelves` represents player-managed shelves only.
- Player shelf positions are `1..10`.
- Position `0` is intentionally not a shelf row.
- `items.armory_shelf_position` supports `0..10`:
  - `0` means general/default unshelved/drop area;
  - `1..10` point at player shelves.
- `ensure_default_hero_armory_shelf()` now seeds shelves `1..10`, not position `0`.
- `generate_reward_item_for_hero(...)` creates dropped/reward items at `armory_shelf_position = 0`.

Equipment runtime read model:

- `hero_equipment` remains the relational current-equipment table.
- `get_hero_equipment_runtime_slots(p_hero_id)` is the canonical owner-safe runtime slots read RPC.
- `get_hero_equipment_runtime_bonus_rows(p_hero_id)` returns relational/effective bonus rows for equipped items.
- `get_hero_equipment_runtime_bonus_totals(p_hero_id)` aggregates from `get_hero_equipment_runtime_bonus_rows(...)`.
- Runtime equipment/bonus reads include `locked_trade` and `locked_auction` as runtime-usable item statuses where appropriate.
- Runtime read models are not JSON-payload authority; JSON output fields are only returned where an RPC deliberately packages a final view/journal for UI convenience.

Equipment mutation workflows:

- `equip_hero_item(p_hero_id, p_item_id, p_slot_key, p_request_id default null)` is the canonical single-item equip RPC.
- `unequip_hero_item(p_hero_id, p_slot_key, p_item_id default null, p_request_id default null)` is the canonical unequip RPC.
- `bulk_equip_hero_items(p_hero_id, p_items_json, p_request_id default null)` processes a JSON array input for UI batch-equipping but calls the single-item equip workflow per entry and returns per-entry journal data.
- Player equipment workflows do not write classic `audit_logs`; they are gameplay-state mutations with returned journals.
- Hand conflicts are resolved by workflow logic, not by frontend direct table writes.

Item requirements:

- `item_generation_qualities.requirement_multiplier` is part of the quality tier contract.
- `item_requirement_aggregation_settings` stores the global relational aggregation settings for item requirements.
- `get_item_requirement_component_rows(p_item_id)` returns requirement components from item layers.
- `get_item_effective_requirements(p_item_id)` resolves final effective requirements using quality requirement multiplier and aggregation settings.
- `check_hero_meets_item_requirements(p_hero_id, p_item_id)` is the canonical requirement check RPC for equip flows.
- Requirement aggregation currently uses highest component value plus configurable fraction of additional component values, with configured rounding/minimum rules.

Loadout presets:

- Loadout presets are relational, not JSON authority:
  - `hero_loadout_preset_settings` stores the configured preset limit, clamped to 5..10;
  - `hero_loadout_presets` stores hero/preset headers;
  - `hero_loadout_preset_slots` stores exact item ids per preset slot.
- `get_hero_loadout_preset_limit()` returns the active configured preset limit.
- `ensure_hero_loadout_presets(p_hero_id)` creates missing preset header rows up to the configured limit.
- `get_hero_loadout_presets(p_hero_id)` returns the owner-safe list.
- `save_current_hero_loadout_preset(p_hero_id, p_preset_number, p_name default null, p_request_id default null)` saves current equipment into relational slot rows.
- `clear_hero_loadout_preset(p_hero_id, p_preset_number, p_request_id default null)` clears slot rows while keeping the preset header.
- `preview_hero_loadout_preset(p_hero_id, p_preset_number)` reports whether saved exact item ids are still available/missing/scrapped/no-longer-owned.
- `apply_hero_loadout_preset(p_hero_id, p_preset_number, p_request_id default null)` applies exact saved item ids to literal slots:
  - uses `ON CONFLICT ON CONSTRAINT hero_equipment_pkey`;
  - skips missing/scrapped/no-longer-owned items;
  - does not recheck requirements for saved exact ids;
  - leaves unrelated slots unchanged except unavoidable hand conflicts;
  - returns a journal JSON and final equipment JSON for UI convenience.

Item lifecycle / scrap:

- `scrapped_affix_item_retention_days` is a global config definition for recoverable scrapped affix items.
- `get_scrapped_affix_item_retention_days()` returns the configured value clamped to `1..365`.
- `scrap_hero_item(...)` is the canonical owner-safe scrap workflow:
  - no-affix items are always hard-deleted from `items` after audit;
  - affix items move to `scrapped` with `scrapped_at` and `recoverable_until` using configured retention unless an explicit future `p_recoverable_until` is provided;
  - equipment is cleared as part of lifecycle.
- `vendor_scrap_hero_item(...)` uses `scrap_hero_item(...)` plus configured vendor payout logic.
- `recover_scrapped_item(...)` remains the staff/admin recovery workflow for recoverable scrapped items.
- No-affix hard delete means such items are not recoverable through `recover_scrapped_item(...)` after scrap.

Staff/admin ownership correction:

- `staff_transfer_item_ownership(p_item_id, p_target_hero_id, p_reason, p_request_id default null)` is the canonical staff/admin ownership correction RPC.
- It requires anti-abuse/sanction management permission for the item server.
- It only transfers active items.
- It requires same-server target hero.
- It explicitly clears `hero_equipment` before changing `items.hero_id`.
- It writes `item.owner_changed` audit.
- Scrapped recovery stays in `recover_scrapped_item(...)`; locked trade/auction items must be resolved through their dedicated workflows before staff transfer.

RLS/grants after S:

- `hero_equipment` is read-only for authenticated users through `can_read_hero(hero_id)`; workflow mutations are RPC-owned.
- `hero_loadout_preset_settings`, `hero_loadout_presets`, and `hero_loadout_preset_slots` have RLS enabled and authenticated read policies/grants.
- `item_requirement_aggregation_settings` has RLS enabled and authenticated read access, with config-governance management.
- `trial_definitions` read policy was fixed so authenticated users can read active trial definitions while config-governance staff can also see/manage inactive rows.

UI metadata content:

- Building/estate configurator UI metadata rows were extended so admin-facing descriptions/helper texts are DB-backed and precise.
- For admin-facing configuration descriptions in this area, Polish explanatory text is preferred for now.

Final S verification:

- S-DB9 final smoke passed for the known test hero:
  - 9 runtime equipment slots;
  - configured loadout preset count;
  - shelf rows 1..10;
  - no player shelf row 0;
  - preset limit and scrap retention helper values in configured range.

Generated types:

- After O6/S migrations, regenerate Supabase generated types before frontend work consumes the new/changed tables/RPCs.

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

### R-DB6+ note

The earlier R-DB6 “next work” warning is superseded by the 2026-05-05 update above. Current database state includes the PvP attack result, resource consequence, XP reward, future prestige context, anti-abuse signal and report trigger layers.

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
