# Mythsworn — Project Context for Codex

Updated: 2026-05-07

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



## Prestige Foundation Planning Context — 2026-05-07

Prestige is now a closed-enough design topic for DB/RPC foundation planning and later Codex Epic Y frontend integration. It is not implemented yet in the current app state; current PvP work only stores context for a future Prestige system.

Key implementation direction:

- Prestige is hero-scoped and server-scoped.
- Prestige has hidden points and visible ranks.
- Players see their own and other heroes' Prestige rank, but never raw points or numeric deltas.
- Admin/tester/sandbox UI may see raw points, raw deltas, thresholds and source/debug context.
- Prestige has no decay and cannot go below `0`.
- Prestige v1 is PvP-driven; future private feats such as Argonautics may become source kinds later.
- Guild/Siege/collective actions do not affect private hero Prestige in the first foundation.
- DB/RPC is authoritative for point balance, rank calculation, PvP deltas, ledger writes, player-safe summaries, reports and notifications.

Prestige ranks:

- Rank 1 / District A: `Perioecus`.
- Rank 2 / District B: `Ephor`.
- Rank 3 / District C: `Strategos`.
- Rank 4 / District D: `Archon`.
- Rank 5 / District E: `Basileus`.

Existing DB `ranks` rows are the seed/candidate registry. The current `required_level` and `max_players` semantics are legacy for the new Prestige model. The target model should use explicit rank numbers, admin-configurable point thresholds and DB/config-backed player-facing labels/descriptions/helper text.

PvP Prestige scoring should be challenge/shame based. The target band is based on the opponent's position inside the legal PvP target range, with default `20 / 60 / 20` lower/similar/upper bands. Attacking stronger targets can increase Prestige; losing to stronger targets does not penalize Prestige. Farming weaker targets may slightly reduce Prestige even on victory, and failing against weaker targets is more shameful. Defender penalties are milder because the defender does not choose the fight.

PvP reports and notifications have separate roles:

- Every PvP Prestige point delta should appear inside the PvP report/result as a qualitative player-safe summary.
- Ordinary point changes without rank change should not create separate notifications.
- A persistent notification should be created only when the hero's Prestige rank changes.
- Player-facing reports/notifications must not expose raw points or numeric deltas.

Prestige affects future privileges:

- District A/B/C/D/E map to Prestige ranks 1/2/3/4/5.
- Falling below a district threshold never deletes estate, buildings or existing progress and never forces relocation.
- Existing buildings keep working and already-started jobs/upgrades can finish.
- New building starts/upgrades above current Prestige rank are blocked by canonical DB requirements/read models.
- Relocation within a district whose requirement is no longer met and moving to higher districts are blocked.
- Future council voting rights depend on meeting high Prestige/district requirements, but Server Council and server events are separate future systems.

Migration and frontend ordering:

1. Migrator prepares Prestige DB/RPC foundation and regenerates/generated types become available.
2. Codex Epic Y consumes the DB/RPC contract for frontend read models, rank display, PvP report summary, admin/debug/config surfaces, building/relocation gate display and rank-change notifications.
3. Status files such as `current-todo.md`, `current-state-summary.md` and backlog completion markers are not updated until actual implementation is confirmed through the normal Codex/status workflow.

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

### PvP result chain current note

The old R-DB6 warning is obsolete. Current `database-current.md` records the PvP attack result chain as present in the current dump, including PvP attack results, resource consequences, XP rewards, future Prestige context, anti-abuse signal generation and report trigger layers.

For any new PvP/combat work, re-read the current dump and `database-current.md`; do not use older in-chat R-DB6 drafts as source of truth.

After schema/RPC migrations that Codex will consume, regenerate/update generated Supabase types before frontend work.

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

## Item / Equipment Decision Scope — 2026-05-04

The item/equipment decision scope is now closed enough for future DB/RPC foundation work. Frontend implementation remains blocked until the DB/RPC workflow exists.

Core rules:

- `hero_equipment` is the source of equipped state. There is no `items.status = equipped`.
- Frontend must not directly mutate `hero_equipment`. Equip/unequip must go through canonical DB/RPC workflow.
- Items can be equipped while owned by the hero and not `scrapped`. Runtime-equipped statuses are `active`, `locked_trade`, and `locked_auction`; `scrapped` is excluded.
- `locked_trade` and `locked_auction` reserve the item for market workflow but do not block wearing it and do not auto-unequip. Ownership transfer or scrap clears equipment.
- Player equip/unequip has no user-provided reason and is not a heavy audit workflow. Staff/admin recovery, transfer, sanction and lifecycle corrections must be audited.
- No-affix items are hard-deleted on scrap. Affix items become `scrapped`, are staff/admin recoverable, and are automatically cleaned after configurable retention; default retention is 30 days.
- Item requirements are equip/use requirements based on hero level and primary/base stats only. They do not use resources, prestige, building level, district access or trade routes.
- There are no item instance requirements. Requirements derive from base/prefix/suffix and quality requirement multiplier.
- Requirement calculation semantics: aggregate base/prefix/suffix requirements by the global item requirement rule, then apply the quality requirement multiplier. The exact DB/config shape belongs to the DB migration track.
- Item bonuses from layers sum absolutely.
- Candidate item bonuses cannot help that same item meet its own requirements. Later loss of requirements does not unequip already equipped items.
- Failed normal equip does not remove the currently equipped item being replaced. Bulk equip processes in input order, equips what can be equipped, and reports failures.
- Hand and ring rotation are DB/RPC workflow responsibilities. Two-handed/ranged weapons use both hands and are stored in `main_hand`; one-handed rotation is `off_hand -> main_hand`, new item -> `off_hand`, old `main_hand` unequipped; ring rotation is `ring_2 -> ring_1`, new ring -> `ring_2`, old `ring_1` unequipped.
- Equipment affects PvE, PvP, combat/autoresolve, manual combat, spy snapshots and runtime hero capability. Manual combat must use per-turn loadout/stat checks.
- Saved equipment configurations are `preset` / `loadout preset`, not item sets. `set` is reserved for future item set bonuses.
- Presets store exact item IDs per literal slot, apply available items without touching the rest of equipment, can partially succeed, and bypass requirements for exact item IDs if the preset was legal when saved. Preset privilege survives transfer away and later reacquisition of the same item ID.
- Presets are relational DB state, not JSON authority. A hero has a fixed number of preset slots, target range 5–10, as a flat configurable value.
- Armory shelves are inventory organization, not equipment state. DB/code may use `shelf`; final UI naming is UI/UX scope. There are always 10 player-organizable shelves; new drops enter shelf `0` / unsorted / no shelf; shelf number persists on item transfer; armory building level affects visible item count only.

Current implementation warning:

- Any resolver that filters equipped runtime items to `status = active` only is inconsistent with current decisions and must be corrected by the DB/runtime migration track.

## Guild Foundation Decision Scope — 2026-05-04

Guild decisions are now clear enough for future DB/RPC foundation planning, but guild work depends on the player item/equipment/armory foundation where it touches shared items.

Core guild rules:

- Guilds are server-scoped.
- Guild membership is hero-based.
- A hero may belong to one guild per server.
- Any active hero without a guild may create a guild.
- Guild creation has a cost.
- Guild name must be unique per server.
- Guild join flows include both invite and request-to-join.
- First-foundation roles are `leader`, `officer`, and `member`.
- There is one officer.
- The leader has full permissions and can dissolve the guild.
- The officer can invite, accept/reject join requests, kick, remove guild armory items, force-return borrowed items, and block/unblock guild armory access per member.
- The officer cannot dissolve the guild.
- Guild member capacity depends on the leader hero's level through admin-configurable formula/config.
- Guild buildings are not part of the first foundation and may never be needed. Do not design a parallel estate-building treadmill.
- Guilds do not currently implement guild-to-guild diplomacy, alliances, non-aggression pacts, war declarations, district influence or guild reputation.
- Guild actions do not affect private hero Prestige/reputation in the first foundation.
- Help from other players in future siege/defense and Argonautics is organized through guild membership. Solo attempts may exist, but group support should use the guild.

Emergency leader election:

- Emergency leader election exists to recover from inactive leadership.
- It can be started by any current member if the leader hero has been inactive for the configured threshold.
- Default inactivity threshold is 15 days.
- Election is a new-leader election, not a removal vote.
- Election has 6h nomination phase plus 12h voting phase by default; both values are configurable.
- Maximum candidate count defaults to 3 and is configurable.
- Any current member except the inactive leader can be nominated; candidate consent is not required.
- There is no quorum and no 50% + 1 threshold.
- The candidate with the most votes wins; ties go to the earlier nomination.
- The result automatically changes leadership when voting ends.

Guild armory:

- Guild armory is a lending/borrowing system, not trade.
- Depositing or borrowing does not change `items.hero_id`; the owner remains the owner.
- Borrowed guild armory items may be equipped, count in runtime loadout, and can be part of loadout presets.
- Borrower cannot sell, trade, auction, scrap or vendor-sell a borrowed item.
- Owner can still sell, trade, auction, scrap, withdraw or force-return their own item.
- An equipped item cannot be deposited; the owner must unequip it first.
- Owner can withdraw their item from guild armory.
- Leader/officer can remove any item from guild armory; this is not confiscation and returns the item to the owner's private state.
- Leader/officer/owner can force-return borrowed items; force-return may unequip the item from the borrower.
- Guild armory access can be blocked per member by leader/officer; blocked members can still return borrowed items.
- Loans do not expire in the first foundation. They end through return, force-return, withdraw/remove, ownership change, scrap, guild leave or guild dissolution.
- Guild armory may use shelves; deposited items preserve shelf number.
- Guild armory capacity is configurable; `0` means unlimited and borrowed items count toward capacity.


## Current Known Gaps / Future Work Notes

These are known planning gaps and memory notes. They are not current active N-DB work unless the user explicitly promotes them.

- **Trial editor explainability:** after Epic M, return to `/admin/exploration-trials` for an explainability/layout pass analogous to L12c.
- **Admin configurator sweep:** later create/run a dedicated `UX-CFG` epic for systematic review of all admin/configurator UI explanations, DB-backed dictionary text and runtime meaning.
- **Equipment equip/unequip:** domain decisions are now closed enough for DB/RPC foundation work. `hero_equipment` exists, but player-facing equip/unequip, bulk equip and preset apply still need canonical DB/RPC workflow before Angular can implement them. Angular must not invent direct writes.
- **PvP MVP:** combat/report foundations can support PvP sources, but target selection, level range, guild restrictions, attack travel time, spying, siege rules, protection/cooldowns, resource stealing/loss, PvP consequences and PvP report production still need a dedicated epic/workflow.
- **PvP memory notes:** attacks should be level-range limited and cannot target own guild; attack travel time depends on estate/address distance; spying is shorter, has no level limit and can target own guild; sieges ignore level limits but cannot target own guild.
- **Auction watchers:** later design/implement watched auctions and notifications for watched auction changes.
- **Auction rules:** later design where auction rules live and how minimum bid increment, custom bid amount, timing and anti-snipe/end-extension behavior are configured.
- **Trade Routes / building-economy integration:** future work; Trade Routes should affect the combined active offer-slot limit across auctions/direct trade. Received direct-trade offers should not consume the receiver’s slot unless the receiver creates a counteroffer/commitment.

Memory notes are intentionally short. Do not expand them into design work unless the user asks to work on that topic.

---

## Project Name

The canonical project/game name is **Mythsworn**.

Older names such as Monster Hunt, MythHunter, MythBurn, Mythos Hunter, etc. may still appear in legacy filenames or older discussion. They should not be treated as current canonical naming.

Use **Mythsworn** for new conceptual, UI-facing and documentation work unless explicitly instructed otherwise.

---

## Working / Review Discipline Current Direction

The user often dictates project notes. Obvious transcription noise should not be treated as a design change. Examples such as `UX/UI` vs `UI/UX`, malformed words or reordered phrases should be interpreted conservatively against the current dump and project files.

Do not say that a whole epic is ready merely because a table, seed or runtime helper exists. For admin configurators, check the full path: table/read policy, canonical RPC/write path, governance permission, audit/reason handling, generated types and frontend route scope.

When the user asks for database or RPC work, provide SQL in-chat in future turns, plus verification SQL and rollback smoke tests when feasible. If smoke cannot be done without a real authenticated admin session, state that plainly.

Memory/side notes are not the place for active task details. Keep current task decisions in the relevant working response, migration, handoff or one of the three canonical project files.

---

## Game Overview

Mythsworn is a browser RPG inspired by ancient Greece.

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


## Epic X / Onboarding Start Flow Current Direction — 2026-05-06

Epic X is the canonical entry flow from server selection to active hero gameplay entry. It is not a tutorial epic.

Player entry starts from server selection. If the selected standard server has no hero for the current user, route to hero creation. If a hero exists on the selected server, route to the game dashboard/game shell by default.

Server availability for new character creation must account for starting estate capacity in district A. A standard server that cannot provide a free starting district-A address is unavailable for new hero creation and should be presented as full/unavailable for that purpose.

Sandbox/test servers may allow privileged users to have multiple heroes. In sandbox/test multi-hero contexts, default to the earliest created hero as the likely main/default test hero, but the UI must allow switching to another hero. A combined server-and-hero selector is acceptable if it preserves explicit selected server -> active hero semantics.

Hero creation must be a single domain/DB-RPC workflow. Angular must not direct-write hero, origin, Character Points, estate, resource, audit or related onboarding tables.

Hero creation rules:

- hero name is unique per server;
- origin is selected once during hero creation and immediately affects hero identity and bonuses;
- origin screen/content is admin-configurable, including descriptions, lore and bonus presentation;
- new heroes start with 1000 Character Points;
- starting Character Points do not have to be spent immediately;
- every new hero receives an estate during creation;
- missing estate after hero creation is an integrity error;
- starting estate address is randomly selected from free addresses in district A;
- starting addresses must not be assigned sequentially as A1, A2, A3, etc.;
- the player does not choose or preview the exact starting address before creation.

After hero creation, the player is inside the game and is routed by default to stat allocation. This is a default first screen, not a mandatory wizard lock; the player can leave it and return later. On later entries with an existing hero, route to the dashboard/game shell by default.

All Epic X implementation must preserve selected server -> active hero loading and must not assume `hero.id === auth.uid()`.

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

## Exploration Core Completion Scope — 2026-05-05

Epic W should complete the core exploration runtime before new minigames are implemented. The target loop is: choose direction, wait for the step timer, check the result, receive Trial / Encounter / Nothing, resolve the Trial or Encounter when needed, receive reward/effect, and continue exploration.

Runtime selection must use only active and complete Trial / Encounter definitions. Incomplete definitions may be saved in admin configuration but must not enter normal gameplay selection. A Trial requires a supported minigame/resolver or explicit auto-resolve-only mode plus a reward assignment. Combat Trials and Combat Encounters require eligible combat candidates. Resource Encounters require resource reward/payload. Buff/Debuff Encounters require effect payloads. Debuff is the only intended negative exploration outcome.

Epic W should provide a DB/RPC-owned readiness/eligibility model and DB-backed reason metadata so admin UI can show which Trials and Encounters are wired and which are incomplete. UI should use canonical terms Trial, Encounter, Nothing, Combat and Minigame; avoid player-facing `Challenge` terminology.

Sandbox-only tester tools should allow authorized testers/admins to add daily Trial attempts / remaining Trial actions and skip or finish the current step timer. These tools must not appear on live/standard gameplay servers.

Step duration must be DB/config-owned and discoverable in admin/balancer tooling. Epic W should verify base step duration, difficulty duration multipliers and any global/server overrides.

Exploration rewards must run through the real reward profile/assignment flow. Item rewards must create real `items` rows, be visible through item/armory read paths, and remain refresh-safe. Tester/admin diagnostics should show what was rolled or attempted, what was skipped because it was incomplete, what replaced it, and why reward or item generation failed when that reason is known.

Epic W should ensure a minimal smoke content set: one Combat Trial, one Combat Encounter with XP, one Resource Encounter, one Buff Encounter, one Debuff Encounter and one Trial reward assignment that can generate an item. Reuse/fix existing definitions where possible instead of creating duplicates.

---


## Luck Foundation Decision Scope — 2026-05-05

Luck Foundation is a closed decision topic and must stay visible as its own project context area.

Current direction:

- Luck is a global RNG/opportunity stat, not only an item-drop stat.
- Luck affects helpful gameplay RNG surfaces unless a specific surface is explicitly excluded by configuration/design.
- Luck never guarantees success or perfect rewards.
- `luckInfluence` is the formula-derived influence value and must not be treated as raw Luck or 1:1 with `luckValue`.
- `trial_power` is the canonical effective trial strength concept and is conceptually `testedStatValue + luckInfluence`.
- Difficulty, district and caps consume `trial_power`; they are not part of `trial_power` itself.
- Luck applies to trial opportunity, trial manifestation, trial power, auto-resolve, manual trial difficulty through trial power, exploration encounter fallback, item/drop opportunity, reward/item generation and combat RNG surfaces where DB contracts expose them.
- `nothing` is a deterministic fallback after other exploration outcome rolls fail, not a separate Luck surface.
- Anti-abuse is not gameplay RNG and must not be affected by Luck.
- Angular must not hardcode Luck formulas, chances, caps, reward ranges, drop curves or combat Luck math.
- Frontend and admin tooling should consume DB/RPC/formula outputs and report missing contracts as DB dependencies.
- Luck Lab is separate from Luck Foundation and belongs to its own admin/balancer epic with sliders, previews and distribution simulations.

Current DB/RPC state summary:

- `database-current.md` records Epic U Luck Foundation as DB-ready.
- Core helpers/RPCs include effective Luck, Luck breakdown, Luck influence, `trial_power`, Luck-aware exploration/trial helpers, reward/item-generation Luck contracts and combat Luck preview.
- Frontend work must regenerate Supabase types after Luck DB/RPC migrations before consuming those contracts.

## Estate / Buildings Current Direction

Empty estate addresses are not database rows. The database stores occupied estates only.

Estate address source of truth is `district_code + address_number`.

`estates.address` remains legacy/display compatibility. New code should format addresses from `district_code + address_number`. When the final code dependency on `estates.address` is removed, Codex must report it as a DB cleanup candidate.

Current district capacity values: A=5000, B=3000, C=500, D=50, E=1.

Frontend may generate possible address ranges from `estate_district_address_capacities` and overlay occupied estate rows.

Moving to an empty address is destructive and DB-owned through `relocate_hero_estate_to_empty_address(...)`. It deletes the current estate row and its buildings/jobs via cascade, then creates the new estate at the selected empty address. It is not the same as siege/takeover.

Siege/takeover of an occupied estate is a future guild/PvP workflow. It should swap/transfer estate ownership or hero assignment without deleting estate/building state.

If an estate changes owner during a successful siege/takeover while an estate building job is active, the building job is interrupted/cancelled. The building remains at the level it had before the job started. The active construction job does not transfer together with the estate.

Relocation/siege timing rules for future DB work:

- Active estate relocation has a configurable cooldown after successful relocation completion; default 12h.
- A hero that completes a siege/takeover-driven estate move as initiator cannot start another outgoing siege/takeover for a configurable duration after completion; default 12h.
- A defender receives configurable protection from new incoming sieges/takeovers after completed/interrupted/cancelled/repelled incoming siege; default 12h.
- Defender protection blocks incoming siege/takeover only; it does not block the protected hero from starting outgoing siege/takeover.
- Active incoming siege/takeover blocks voluntary relocation by the target owner/hero.
- These values are DB/config-owned and must not become frontend constants.


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
