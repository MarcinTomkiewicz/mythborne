# Mythborne — Project Context for Codex

Updated: 2026-05-03 late

## Purpose

This file is the short, operational context document for implementation work.

Use it as the primary high-level source of truth when generating code, scaffolding features, or proposing architecture.

If something here conflicts with a newer migration, seed, generated type, or explicit user instruction, prefer:

1. explicit user instruction,
2. current database schema / migrations / dump,
3. `current-decisions.md`,
4. `database-current.md`,
5. this document.

This document is intentionally compact. For exact DB/RPC/helper inventory, consult `database-current.md` and the current dump. For decision rationale and warnings, consult `current-decisions.md`.

---


## Current High-Priority Implementation Context — 2026-05-03 late

Current focus has moved from Epic Q to the new **Epic R — PvP Foundation**. The previous/refactor-like R/admin-IA work is parked locally by the user as a late backlog item; do not treat it as the active Epic R.

### Recently completed DB/RPC foundation work after the previous context snapshot

- **Epic Q / Notifications foundation:**
  - Q-DB0: notification table/RPC boundary and RLS were hardened. `anon` cannot read/mutate notifications or call notification action RPCs.
  - Q-DB1: owner-safe player/staff notification read/count RPCs were added.
  - Q-DB2: `mark_notification_read(...)` and `dismiss_notification(...)` were hardened; dismiss also marks read.
  - Q-DB3: building completion now produces DB-owned `estate.building_job.completed` notifications from building job finalization.
  - Q-DB4: notification metadata/readability rows were seeded for player center, staff center, type admin and hook diagnostics.
- **Epic N hotfixes/follow-up:**
  - `save_stat_allocation(...)` was fixed by changing the conflict target to `ON CONFLICT ON CONSTRAINT hero_stats_pkey` to avoid ambiguous `hero_id` with `RETURNS TABLE(hero_id ...)`.
  - `get_hero_experience_to_next_level(...)` was granted to `authenticated`; XP display no longer needs a frontend fallback.
  - missing progression diagnostics/configurator metadata rows were seeded.
- **Epic O O1 blocker fix:**
  - `search_building_targets(...)` and `search_building_targets_page(...)` now return `base_build_time_seconds`, not legacy `base_build_time_minutes`.
  - Supabase types must be regenerated before Codex repeats O1.
- **Pre-PvP cleanup:**
  - `player_relationship_declaration_types.mercenary_contract` was added as a PvP/anti-abuse context declaration.
  - `hero_equipment` boundary was hardened: `anon` has no access, `authenticated` has SELECT only through RLS, service role has full access. Full equip/unequip workflow remains for the item/equipment epic.

### Current PvP Foundation state

The following R/PvP DB work has been applied and verified enough to continue:

- **R-AA0/R-AA1:** relationship declaration context helper and indexes:
  - `get_hero_pair_relationship_declaration_context(...)` is internal/service-only.
  - It returns active/pending relationship context including `mercenary_contract` and never suppresses anti-abuse signals.
- **R-AA2:** trade/auction anti-abuse signal enrichment:
  - `insert_trade_transaction_anti_abuse_signal(...)` enriches metadata with relationship context and `hasMercenaryContract`.
  - It is hardened to service-only, not a frontend RPC.
- **R-DB1:** central runtime activity foundation:
  - `hero_runtime_activity_kinds`, `hero_runtime_activity_statuses`, `hero_runtime_activities`.
  - blocking kinds include `exploration`, `pvp_attack`, `pvp_spy`; `siege` is future/inactive.
  - frontend can read active activity through `get_hero_active_runtime_activity(...)`; start/finish helpers are internal/service-only.
- **R-DB1b:** existing `hero_explorations` now sync active/exhausted/completed states to `hero_runtime_activities` through triggers.
- **R-DB2:** PvP config/formula/dictionary foundation:
  - `pvp_action_kinds` includes active `attack` and `spy`, inactive/future `siege`.
  - formula targets/default assignments exist for attack level range, travel time, spy travel time, manual fight window, target protection, resource transfer percentages, XP reward and future prestige context.
  - `pvp_configurator_section` metadata exists.
- **R-DB3:** PvP target eligibility/protection foundation:
  - `pvp_target_protections` internal table exists.
  - `calculate_pvp_estate_distance_score(...)` exists as internal/service-only.
  - `get_pvp_target_candidates(...)` is owner-safe for `authenticated` and exposes attack/spy eligibility and travel/protection preview.
- **R-DB4:** PvP jobs/travel/protection runtime:
  - `pvp_action_statuses` and `pvp_actions` exist.
  - `start_pvp_action(...)` starts `attack` or `spy`; attack creates target protection immediately; both create central runtime activity.
  - no positive start smoke was possible because the test server had no second hero with estate, but structural verification passed.
- **R-DB5:** PvP spy result snapshot foundation:
  - `pvp_spy_results` exists.
  - internal snapshot helpers exist for equipment, base stats, resources, estate, buildings and derived stat definition context.
  - `create_pvp_spy_result_from_action(...)` is service-only.
  - `get_my_pvp_spy_result(...)` is owner-safe for `authenticated`.
  - derived combat stats must still come from the runtime derived/combat resolver; do not use `hero_derived`.

### Do not continue from the interrupted R-DB6 text blindly

The conversation stopped before applying R-DB6. The next conversation should start from **R-DB6 — PvP attack result foundation / attack resolution boundary**, but it should first re-read the current DB dump and the generated types, then prepare a fresh migration. Do not assume the last in-chat R-DB6 draft is safe to run without review.

Important: after R-DB6 and later schema/RPC migrations, regenerate generated Supabase types before Codex frontend work.

Current Epic N decision state:

- Epic N concerns **Stats and Progression**.
- Stats = spending Character Points on stat allocation through `save_stat_allocation(...)`.
- Progression = XP, level, XP-to-next-level formula, level-up, Character Points gain, penalty sink, level-up rewards and level-up stat bonuses.
- `save_stat_allocation(...)` is the canonical stat allocation workflow.
- `grant_hero_experience(...)` is the canonical XP/level-up workflow.
- `hero.experience` is current progress toward the next level.
- `hero.total_experience_earned` is lifetime XP.
- `hero_progression_ledger` is the append-only XP/progression ledger.
- XP always grants equal gross Character Points through the canonical progression/reward CP path.
- Active CP penalties may immediately consume newly granted CP through the penalty sink, but this does not change the XP → gross CP rule.
- Level-up reward routing supports level matching through `reward_profile_assignments`.
- Level-up stat bonus rules update base `hero_stats` and record append-only grant rows.
- Multiple stat bonus rules may fire on the same reached level.
- Random level-up stat bonuses are configurable/reportable, not hidden in `metadata_json`.

Important current warning for N:

- Older Epic N task text may still describe level-up as missing or preflight-only. That wording is obsolete after N-DB0..N-DB4.
- New frontend Epic N tasks must consume current DB/RPC reality:
  - `save_stat_allocation(...)`;
  - `get_hero_experience_to_next_level(...)`;
  - `grant_hero_experience(...)`;
  - `hero_progression_ledger`;
  - reward level matching;
  - `level_up_stat_bonus_rules`;
  - `hero_level_stat_bonus_grants`;
  - progression metadata.
- Do not implement a second XP/level-up/stat allocation workflow in Angular.
- Do not direct-write `hero_stats`, `hero.character_points`, `hero.experience`, `hero.level`, `character_point_ledger`, `hero_progression_ledger`, or level-up grant tables from Angular.

A new conversation should not start N frontend work until it has read the handoff/current docs and confirmed generated types are regenerated against the current schema. Do not mark Codex tasks complete in status documents unless the user explicitly confirms the task outcome.

---
## Current Known Gaps / Future Work Notes

These are known planning gaps and memory notes. They are not current active N-DB work unless the user explicitly promotes them.

- **Trial editor explainability:** after Epic M, return to `/admin/exploration-trials` for an explainability/layout pass analogous to L12c.
- **Admin configurator sweep:** later create/run a dedicated `UX-CFG` epic for systematic review of all admin/configurator UI explanations, DB-backed dictionary text and runtime meaning.
- **Equipment equip/unequip:** `hero_equipment` exists, but there is no approved player-facing equip/unequip DB/RPC workflow yet. Angular must not invent direct writes for this.
- **PvP MVP:** combat/report foundations can support PvP sources, but target selection, level range, guild restrictions, attack travel time, spying, siege rules, protection/cooldowns, resource stealing/loss, PvP consequences and PvP report production still need a dedicated epic/workflow.
- **PvP memory notes:** attacks should be level-range limited and cannot target own guild; attack travel time depends on estate/address distance; spying is shorter, has no level limit and can target own guild; sieges ignore level limits but cannot target own guild.
- **Auction watchers:** later design/implement watched auctions and notifications for watched auction changes.
- **Auction rules:** later design where auction rules live and how minimum bid increment, custom bid amount, timing and anti-snipe/end-extension behavior are configured.
- **Trade Routes / building-economy integration:** future work; Trade Routes should affect the combined active offer-slot limit across auctions/direct trade. Received direct-trade offers should not consume the receiver’s slot unless the receiver creates a counteroffer/commitment.

Memory notes are intentionally short. Do not expand them into design work unless the user asks to work on that topic.

---

## Project Name

The canonical project/game name is **Mythborne**.

Older names such as Monster Hunt, MythHunter, MythBurn, Mythos Hunter, etc. may still appear in legacy filenames or older discussion. They should not be treated as current canonical naming.

Use **Mythborne** for new conceptual, UI-facing and documentation work unless explicitly instructed otherwise.

---

## Working / Review Discipline Current Direction

The user often dictates project notes. Obvious transcription noise should not be treated as a design change. Examples such as `UX/UI` vs `UI/UX`, malformed words or reordered phrases should be interpreted conservatively against the current dump and project files.

Do not say that a whole epic is ready merely because a table, seed or runtime helper exists. For admin configurators, check the full path: table/read policy, canonical RPC/write path, governance permission, audit/reason handling, generated types and frontend route scope.

When the user asks for database or RPC work, provide SQL in-chat in future turns, plus verification SQL and rollback smoke tests when feasible. If smoke cannot be done without a real authenticated admin session, state that plainly.

Memory/side notes are not the place for active task details. Keep current task decisions in the relevant working response, migration, handoff or one of the three canonical project files.

---

## Game Overview

Mythborne is a browser RPG inspired by ancient Greece.

The game combines:

- character progression;
- item generation and loot variance;
- exploration plus trials;
- encounters;
- estate and district progression;
- PvP conflict;
- guild-supported sieges;
- long-term prestige systems;
- server-level events and governance;
- configuration governance / balance change control;
- game reports and shareable public report snapshots;
- notifications for short attention/status events.

Failure is allowed. RNG is allowed. High value does not always mean high usefulness.

The game should support serious long-term progression, politics, PvP tension and economic variance, while still allowing lighter flavor elements such as strange encounters, unlucky drops and shareable “look what happened” reports.

---

## Canonical Terms

Use these terms consistently:

- Exploration;
- Trial opportunity / Trial appearance;
- Trial manifestation;
- Trial completion;
- Encounter;
- Prestige;
- Health;
- Character Points.

Do not rename the PvE implementation loop back to “monster hunt” except when referencing old legacy documents.

Core in-world names should remain Greek across language versions. Localize descriptions and explanatory text, not proper names.

---

## Source and Implementation Rules

Codex must:

- work from the current repository state;
- run `git status --short` before starting a new backlog task and stop if the tree is dirty;
- read relevant docs before coding;
- not invent schema that is not in current DB/migrations;
- regenerate/update database types when schema changes require it;
- not assume `hero.id === auth.uid()`;
- load selected/current server and active hero before hero-owned queries;
- use DB dictionaries/configs instead of hardcoded gameplay/config lists;
- keep metadata JSON lightweight;
- prefer backend/RPC/domain operations for critical persistent changes;
- preserve `reason`, `description`, `status_reason`, helper/admin text wherever applicable;
- not mark tasks completed in state docs before user confirms they work.

---

## Authoritative Formula Runtime Current Direction

Balance formulas are source of truth for configurable gameplay math.

Frontend formula runtime may be used for preview, charts, calculators and admin explainability. It must not be treated as authoritative for persistent gameplay mutations.

DB/RPC/backend workflows that spend resources, start timers, grant rewards, resolve challenges, persist combat results, validate stat costs/caps or otherwise change durable state must evaluate assigned formulas server-side.

Current DB-side formula runtime foundation includes:

- `evaluate_balance_formula_expression(...)`;
- `evaluate_balance_formula_target(...)`;
- formula helpers for `roundUp`, `roundDown`, `clamp`, and random functions.

Codex rule: if an authoritative workflow needs a formula result and no DB/RPC path evaluates it server-side, report a DB/RPC blocker instead of computing the value in Angular and sending it as truth.

---

## Server / Account / Hero Current Direction

`hero.id != auth.uid()`.

User account is global. Hero is server-specific.

Correct loading path:

1. authenticated user;
2. selected/current server;
3. active hero on selected server;
4. hero-owned data.

Sandbox/testing may allow privileged multi-hero tooling. Standard gameplay must not assume one global hero.

Server staff permissions are server-scoped.

---

## Exploration / Trials Current Direction

Exploration runtime tables are RLS-protected and readable by the owning hero/user through SELECT policies. Frontend read models may read owner-visible exploration state, but persistent mutations must go through PvE RPCs.

Difficulty tiers are DB-backed. Current active tiers are `easy`, `medium`, and `hard`; UI must not show hardcoded permanent cards when DB tiers are available.

Trial definitions and trial combat candidates have canonical admin write RPCs:

- `upsert_trial_definition(...)`;
- `upsert_trial_combat_candidate(...)`;
- `deactivate_trial_combat_candidate(...)`.

`trial_definitions.minigame_key` is the source of truth for which minigame executes a trial. Combat candidates are valid only for trials where `minigame_key = combat`.

Frontend must not direct-write `trial_definitions` or `trial_combat_candidates`.

`/admin/exploration-trials` is the current admin/balancer UI for trial definition and combat candidate configuration. It uses DB-backed stats, minigames, opponents, families and formulas, and routes all trial/candidate mutations through the canonical RPCs above with mandatory reasons.

---

## Encounters / L12 Current Direction

Encounter definitions are now DB/RPC-backed admin/balancer configuration, not frontend-only content.

Current encounter kinds are:

- `combat`;
- `resource`;
- `buff`;
- `debuff`.

`nothing` remains an exploration step outcome and must not be modeled as an encounter definition.

Canonical L12 admin write RPCs:

- `upsert_encounter_definition(...)`;
- `deactivate_encounter_definition(...)`;
- `upsert_encounter_combat_candidate(...)`;
- `deactivate_encounter_combat_candidate(...)`;
- `upsert_encounter_description_variant(...)`;
- `deactivate_encounter_description_variant(...)`;
- `upsert_reward_profile_assignment(...)`;
- `deactivate_reward_profile_assignment(...)`.

Frontend must not direct-write `encounter_definitions`, `encounter_combat_candidates`, `encounter_description_variants` or `reward_profile_assignments`.

L12 UI must be encounter-kind aware:

- combat encounters may configure opponent/family candidates and scaling;
- resource/buff/debuff encounters should not expose combat-candidate editors;
- buff/debuff presentation must remember that only one exploration effect may be active at a time;
- reward balancing must use `reward_profile_assignments`, especially `source_kind = encounter`, rather than treating `encounter_definitions.reward_profile_id` as the complete reward system.

Codex rule: after schema changes in this area, generated Supabase types must be refreshed before frontend implementation.

---

## Estate / Buildings Current Direction

Empty estate addresses are not database rows. The database stores occupied estates only.

Estate address source of truth is `district_code + address_number`.

`estates.address` remains legacy/display compatibility. New code should format addresses from `district_code + address_number`. When the final code dependency on `estates.address` is removed, Codex must report it as a DB cleanup candidate.

Current district capacity values: A=5000, B=3000, C=500, D=50, E=1.

Frontend may generate possible address ranges from `estate_district_address_capacities` and overlay occupied estate rows.

Moving to an empty address is destructive and DB-owned through `relocate_hero_estate_to_empty_address(...)`. It deletes the current estate row and its buildings/jobs via cascade, then creates the new estate at the selected empty address. It is not the same as siege/takeover.

Siege/takeover of an occupied estate is a future guild/PvP workflow. It should swap/transfer estate ownership or hero assignment without deleting estate/building state.

Building construction/upgrades are DB-owned:

- one active `estate_building_jobs` row per estate;
- job stores target level and timing only;
- player-facing cancel is not part of MVP;
- `finalize_completed_estate_building_jobs(...)` lazy-finalizes completed jobs;
- `start_estate_building_upgrade(...)` starts construction/upgrade, evaluates assigned building formulas server-side, spends `drachma/materials/workforce` through `hero_resource_ledger`, creates a job and writes audit.

Building UI may preview formulas, but authoritative cost/time is calculated in the RPC.

---

## Vendor Scrap / Resource Economy Current Direction

Vendor/system item scrap/sell uses drachmas and is not player trade.

Frontend must call `vendor_scrap_hero_item(...)` for vendor sell/scrap. It must not compose item lifecycle and resource updates in Angular.

Resources such as `drachma`, `materials`, and `workforce` have current balances in `hero_resources`. A minimal relational `hero_resource_ledger` records balance changes from DB/RPC workflows such as building upgrades. The ledger is for history/debug/admin investigation; it is not an undo/refund feature.

---

## Game Reports Current Direction

Game reports are player-facing gameplay reports and are separate from audit logs, player abuse reports, notifications and temporary runtime/debug state.

A report should reproduce the same core event view the player saw in-game. The private Reports UI renders it inside the normal application shell; the public link renders the same report content without the app shell.

Public report route is conceptually `/report/:publicToken` and uses `game_reports.public_token`, not the internal report id.

Multiple heroes can have private access to the same report through `game_report_hero_access`, which supports future PvP and siege reports. Removing a report from one hero's list removes that hero's access; if no hero access remains, the report is deleted and the public token stops resolving.

Current report type dictionary values include `combat`, `trial`, `encounter`, `pvp_combat`, and `siege`.

Combat report production is the first concrete producer and wraps `combat_results`. Trial and encounter producers should later wrap challenge/encounter outcomes, reward grant data and optional combat sections. PvP and siege report producers belong to future PvP/siege epics.

Reward/drop item references are public showcase item references. If the dropped item still exists, renderers should prefer the live `items` row and current balanced item card. If the item row is gone, renderers fall back to saved quality/base/prefix/suffix component refs and fallback display name.

Combat attack source labels can be public, but full private player equipment/loadouts must not be exposed by default.

---

## Notifications Current Direction

Notifications are persistent inbox/bell entries. They are separate from game reports, audit logs, player abuse reports and UI-only toasts/messages.

The durable DB row is the source. Toasts are only presentation of fresh eligible notification rows.

Reports have their own Reports inbox and unread badge. Do not create default `game_report.created` notifications for ordinary report creation.

Frontend must not insert notifications directly. DB/RPC workflows create them through `create_notification(...)`; frontend may mark/dismiss current-user notifications through the approved RPCs.

---

## Combat Current Direction

Combat is one reusable module, not multiple combat types.

Exploration encounter combat, trial combat, PvP, sandbox and future systems provide combatants and interpret the result, but core combat rules stay the same.

Combat receives combatants and produces a combat result. It does not decide rewards, trial completion, PvP consequences, cooldowns or public report publishing.

Combat is turn-limited. Current global product rule `combat_turn_limit` defaults to 10 full turns.

Combat uses side names `initiator` and `defender`. Outcomes are `initiator_victory`, `defender_victory`, and `draw`.

Admin-defined opponents belong to one family. Encounter/trial combat candidates may point to a concrete opponent or a family. Opponent equipment can be none, manual blueprint, or generated item-like loadout materialized only for one fight.

Generated opponent equipment must not create normal player-owned `items` rows.

---

## Trade / Auction Current Direction

Player-to-player trade uses Character Points. Drachmas are vendor/system/building currency.

Items are not copied on transfer; ownership changes through `items.hero_id` through DB/RPC workflows.

Direct trade and one-item auction workflows are DB/RPC-owned. Angular must not direct-write critical trade/auction tables.

Trade/auction audit and anti-abuse signal generation are DB-owned.

---

## Bonus / Derived Stats Current Direction

Use `scope`, not `context`, for bonus semantics.

Central bonus foundation uses DB dictionaries and semantic bonus templates:

- `bonus_types`;
- `bonus_scopes`;
- `bonus_target_categories`;
- `bonus_targets`;
- `bonus_templates`;
- `entity_bonuses`.

Legacy bonus join tables are transitional.

`hero_derived` is no longer frontend/runtime source of truth. Do not introduce new dependencies on it.

---

## Admin / Content Tooling Current Direction

Admin/balancer/content tooling must use DB-backed dictionaries and canonical RPC/governance contracts.

Critical mutations must not be direct writes from Angular.

Admin UI should be organized by work intent rather than raw table names.

Current admin IA groups:

- Overview;
- Global Governance;
- Game Balance;
- Server Operations;
- Moderation & Anti-abuse;
- Gameplay Tools / Sandbox.

Epic R is lightweight admin information architecture/layout hygiene, not final visual redesign. Final visual direction belongs to `mythborne-ui-ux-backlog.md` and UI/UX work.

For complex admin pages, prefer PrimeNG tabs/tabbed sections or clear sections instead of one long vertical form.

---

## UI/UX Current Direction

Roboczo zaakceptowany kierunek UI: modern premium browser RPG UI stylizowany na antyczną Grecję.

Avoid generic SaaS admin feel, heavy decorative stone panels everywhere, raw UUID-only pickers and hardcoded gameplay lists when DB dictionaries/read models exist.

Use existing/shared/vendor components before adding new ones. Future Codex reports for larger UI/workflow tasks must include `reused`, `checked but not reused`, and `new component/state/helper added`.

---

## Current High-Priority Implementation Implications

- Regenerate/update generated Supabase types after the new L11/L12/P/Q/O schema additions before Codex consumes them.
- L11 can be converted from read-only inspector into RPC-backed editor using trial RPCs.
- L12 can be implemented as write-capable encounter configurator using encounter/reward assignment RPCs.
- M12 combat opponent configurator remains future work; check exact dump/generated types before assuming its write path.
- Reports, Notifications, Audit Logs and Player Abuse Reports are separate domains.
- Frontend formula runtime is preview/explainability only; durable mutation workflows must calculate server-side.
- Do not update Codex status files without explicit user acceptance/confirmation.
