# Mythsworn — Project Context for Codex

Updated: 2026-05-09

## Purpose

This file is the short, high-level implementation context for Mythsworn. It should help Codex, reviewers, migrators and planning conversations understand the project shape without reading a chronological stack of old updates.

This file is not:

- a full DB/RPC registry;
- a migration log;
- a Codex task-status tracker;
- a replacement for `current-decisions.md`, `database-current.md`, `current-todo.md` or `current-state-summary.md`.

Use this file for operational context and boundaries. Use `database-current.md` for exact DB/RPC/helper contracts. Use `current-decisions.md` for detailed design decisions and rationale. Use backlog/status files only for execution queue and progress tracking.

## Source precedence

When sources conflict, prefer:

1. explicit user instruction for the current task;
2. current live DB / migrations / latest dump / generated Supabase types;
3. `database-current.md` for DB/RPC/helper contract semantics;
4. `current-decisions.md` for active design/domain decisions;
5. this file;
6. backlog/status files;
7. legacy concept files.

For UI tasks, also read the canonical UI/UX backlog and task-specific UI guidance. For implementation runs, also read `AGENTS.md`.

## Project identity

The canonical game/project name is **Mythsworn**.

Older names such as Monster Hunt, MythHunter, MythBurn and Mythos Hunter may remain in legacy filenames, old notes or historical docs. Do not use them as current canonical naming unless the user explicitly asks about legacy material.

Mythsworn is a browser RPG inspired by ancient Greece. It combines:

- character progression;
- item generation and loot variance;
- exploration, Trials and Encounters;
- estate/district progression;
- PvP conflict;
- guild-supported future sieges and group activity;
- Prestige and long-term political/social progression;
- Server Events and future server governance;
- game reports, notifications and shareable public report snapshots;
- DB-backed configuration governance and balance tooling.

Failure, RNG and imperfect rewards are allowed. High economic value does not always mean high gameplay usefulness.

## Canonical terminology

Use these terms consistently:

- Mythsworn;
- Exploration;
- Trial opportunity / Trial appearance;
- Trial manifestation;
- Trial completion;
- Encounter;
- Manual Trial Shell/Core;
- Trial Offer;
- Manual Runtime Session;
- Manual Runtime Manifest;
- Action Log;
- Backend Verdict;
- Health;
- Character Points;
- Prestige.

Do not rename the PvE loop back to “monster hunt” except when explicitly referencing legacy documents. In-world proper names should remain Greek-styled across language versions. Localize descriptions and explanatory copy, not canonical proper names.

## Global implementation rules

Codex and frontend work must follow these rules:

- Do not assume `hero.id === auth.uid()`.
- Normal player context is: authenticated user → selected/current server → active hero → hero-owned data.
- Hero/account/server state must be loaded explicitly. Do not use global hero shortcuts.
- Generated `database.types.ts` is user/migrator-owned generated input. Codex may read it but must not edit, patch, reformat or regenerate it unless explicitly asked.
- If a DB/RPC/generated-type contract is missing or stale, report a DB/RPC blocker. Do not invent Angular fallbacks or manual temporary interfaces.
- Durable gameplay/economy/admin mutations must go through canonical RPC/domain/governance workflows.
- Angular must not direct-write critical tables such as hero stats/resources, items/equipment, trade/auction, guild, exploration runtime, PvP results, reward, audit or config-value tables unless an explicit task says otherwise.
- DB dictionaries/configs/metadata should drive labels, options, helper text and balance-facing values where available.
- Preserve `reason`, `description`, `status_reason`, `helper_text`, `admin_description` and audit-relevant context.
- Keep metadata JSON lightweight and purposeful.
- Do not mark backlog/status tasks complete in `current-todo.md`, `current-state-summary.md` or backlog files until the user confirms the work.

## Working and review discipline

The user often dictates project notes. Treat obvious transcription noise conservatively against current project files and DB reality.

Do not declare a whole epic “ready” just because one table, seed or helper exists. For admin/configurator readiness, check the whole path: table/read policy, canonical write RPC, governance permission, audit/reason handling, generated types, frontend route scope and smoke feasibility.

For DB/RPC work, provide SQL in-chat plus verification SQL and rollback/smoke where feasible. If a smoke test requires a real authenticated admin/session/data setup, state that plainly.

Memory/side notes are not the place for active task details. Active decisions belong in the working response, migration/handoff or canonical project files.

## Technical baseline

- Angular 21.
- Zoneless / signals-first direction.
- PrimeNG where the project uses PrimeNG.
- Supabase / PostgreSQL backend.
- Typed domain/read models and mappers from generated DB rows.
- Reusable shared logic belongs in `core`; feature folders should primarily contain pages, feature components, route composition and feature-local UI.
- Frontend formula/runtime previews are allowed only for admin/preview/explainability. Durable authority belongs to DB/RPC/formula helpers.

## Formula and DB-backed metadata authority

Balance formulas are source of truth for configurable gameplay math.

DB/RPC/backend workflows that spend resources, start timers, grant rewards, resolve challenges, persist combat results, validate stat costs/caps or otherwise change durable state must evaluate assigned formulas server-side.

Angular formula evaluation may be used for preview, charts, calculators and admin explainability, but never as authoritative input for persistent gameplay mutation.

DB-backed metadata/read models should be preferred for labels, helper text, admin descriptions, dictionary options and gameplay explanations. Raw keys/UUIDs are acceptable as secondary/admin metadata, not as primary player-facing copy.

## Identity, server, hero and onboarding

User/account is global. Hero is server-scoped. Server membership/staff access is server-scoped.

Player entry starts from server selection. If the selected standard server has no hero for the current user, the user enters hero creation. If a hero exists, the user enters the dashboard/game shell by default.

Hero creation must be one coherent DB/RPC-owned domain workflow. Angular must not direct-write hero, origin, Character Points, estate, resource, audit or related onboarding tables.

Hero creation rules:

- hero name is unique per server;
- origin is selected once during creation and affects identity/bonuses immediately;
- origin content/bonus presentation should be admin-configurable;
- new heroes start with 1000 Character Points;
- starting Character Points do not have to be spent immediately;
- every new hero receives an estate during creation;
- missing estate after creation is an integrity error;
- starting estate is randomly selected from free district-A addresses;
- the player does not choose or preview the exact starting address before creation.

Sandbox/test servers may later support privileged multi-hero testing. Any multi-hero UI must still preserve explicit selected server → active hero semantics.

## Stats, progression, Character Points, bonuses and Luck

Canonical base stats are:

- `strength`;
- `dexterity`;
- `endurance`;
- `agility`;
- `cunning`;
- `charisma`;
- `wisdom`;
- `intelligence`;
- `spirituality`.

Character Points are progression/trade currency. Drachmas are vendor/system/building currency.

Persistent stat allocation and XP/level-up flows are DB/RPC-owned. Frontend must not direct-write `hero_stats`, `hero.character_points`, XP/level fields, Character Point ledger, progression ledger, level-up grant tables or audit tables.

Central bonus foundation uses:

- `bonus_types`;
- `bonus_scopes`;
- `bonus_target_categories`;
- `bonus_targets`;
- semantic `bonus_templates`;
- `entity_bonuses`.

Use `scope`, not `context`, for bonus semantics. Legacy bonus join tables are transitional.

`hero_derived` is no longer frontend/runtime source of truth. Runtime derived/special stats should be resolved from base stats, equipment, bonus dictionaries/templates/entity bonuses, derived stat definitions, formula assignments and active context.

Luck is a DB/RPC/formula-authoritative RNG/opportunity stat, not only an item-drop stat. It affects opportunity/range/distribution surfaces where DB contracts expose it, but never guarantees success or perfect rewards.

Important Luck semantics:

- `luckInfluence` is formula-derived influence, not raw Luck;
- `trial_power` is conceptually tested stat + Luck influence;
- difficulty/district/caps consume `trial_power`; they are not part of `trial_power` itself;
- `nothing` is deterministic fallback after other exploration outcome rolls fail;
- anti-abuse is not gameplay RNG and must not be affected by Luck;
- Angular must not hardcode Luck formulas, chances, caps, reward ranges, drop curves or combat Luck math.

Combat live timing manifests may expose DB-owned combat Luck RNG read-state. Angular may map and display those DB/formula outputs, but combat actions remain timing-input-only and the client must not calculate damage, outcome, equipment, stats, Luck formulas or combat RNG formulas.

Luck Lab is a separate future/admin balancer area for previews, sliders and simulations. It is not the same as the core Luck Foundation.

## Exploration, Trials and Encounters

Exploration runtime is owner-visible but persistent mutations must go through PvE RPCs.

Difficulty tiers are DB-backed. Current active tiers are `easy`, `medium` and `hard`; UI must not treat hardcoded permanent difficulty cards as source of truth when DB tiers are available.

Trial definitions and trial combat candidates are admin/configuration content and must use canonical admin RPCs. Frontend must not direct-write `trial_definitions` or trial candidate tables.

`trial_definitions.minigame_key` determines which minigame/resolver a Trial uses. Combat candidates are valid only for trials where `minigame_key = combat`.

Encounter definitions are DB/RPC-backed admin/balancer configuration. Current encounter kinds are `combat`, `resource`, `buff` and `debuff`. `nothing` remains an exploration step outcome and must not be modeled as an encounter definition.

Encounter UI must be kind-aware:

- combat encounters may configure opponent/family candidates and scaling;
- resource/buff/debuff encounters should not expose combat-candidate editors;
- buff/debuff presentation must remember that only one exploration effect may be active at a time;
- reward balancing must use reward profile assignments, especially `source_kind = encounter`, rather than treating a single encounter field as the full reward system.

Exploration core target loop:

1. choose direction;
2. wait for DB/config-owned step timer;
3. check result;
4. receive Trial / Encounter / Nothing;
5. resolve Trial or Encounter when needed;
6. receive reward/effect;
7. continue exploration.

Runtime selection should use only active and complete Trial/Encounter definitions. Incomplete definitions may exist in admin configuration but must not enter normal gameplay selection.

Sandbox-only tester tools may support adding remaining Trial actions or skipping/finishing a step timer. They must not appear on live/standard gameplay servers.

## Manual Trial Shell/Core

Manual Trial Shell/Core is the shared host/runtime foundation for future player-facing manual Trial minigames. It is not a concrete minigame.

Core rules:

- Trial identity is locked before the manual/auto choice: trial definition, god, tested stat, difficulty and `minigame_key` are already known at Trial Offer time.
- Manual resolve and auto-resolve are two resolution paths for the same locked Trial attempt.
- Trial Offer does not create the concrete Manual Runtime Manifest.
- Trial Offer inactivity prevents permanent pending offers and should lead to ordinary auto-resolve, not a special “abandoned” state.
- Manual Runtime Session starts only after manual resolve is selected.
- Frontend renders from backend Manual Runtime Manifest and submits an Action Log, not a final success/fail truth value.
- Backend owns replay/validation, outcome, failure reason, reward, report generation and durable state transitions.
- UI must not show final Trial success/reward before Backend Verdict.
- Lifecycle/status, outcome, resolution mode and failure reason must stay semantically separate.
- Every resolved Trial has an outcome; every failed Trial has a reason at least for admin/debug/report-source purposes.
- Player/public reports show curated safe summaries; full technical replay log is backend/admin/debug source of truth.
- Combat/Ares is a combat wrapper/result-handoff case, not a normal Manual Trial minigame renderer.

Manual Trial Core may implement host/shell, Trial Offer UI, manual/auto boundary, manual session loading, manifest envelope handling, renderer registry, fail-closed unsupported renderer, shared HUD slots, Action Log submit envelope, Backend Verdict handling, report handoff, stale guards, exit warning and inactivity/timeout hooks.

Manual Trial Core must not implement Apollo, Hermes, Zeus, Hera, Artemis, Athena, Hephaestus or Aphrodite gameplay. Concrete minigames come later as separate epics. Apollo / Path of Light is the preferred first proof-of-path after Core.

Implementation order: Migrator designs the DB/RPC/read-model foundation first; Codex consumes generated DB/RPC contracts after generated types are current; concrete minigames follow later.

## Combat

Combat is one reusable module, not multiple combat types.

Exploration encounter combat, trial combat, PvP, sandbox/admin test combat and future systems provide combatants and interpret results, but core combat rules stay shared.

Combat receives combatants and produces a combat result. It does not decide rewards, trial completion, PvP consequences, cooldowns or public report publishing.

Current baseline:

- combat is turn-limited; current global product rule `combat_turn_limit` defaults to 10 full turns;
- sides are `initiator` and `defender`;
- outcomes are `initiator_victory`, `defender_victory` and `draw`;
- admin-defined opponents belong to families;
- encounter/trial candidates may point to a concrete opponent or family;
- opponent equipment can be none, manual blueprint or generated item-like loadout materialized only for one fight;
- generated opponent equipment must not create normal player-owned `items` rows.

Live/manual combat runtime is DB-owned. Angular submits allowed timing/player input and DB decides action result, damage, hit/streak effects, final result and downstream consequences.

## Items, equipment, armory and vendor scrap

Items use layered generation: quality + optional prefix + base item + optional suffix. Economic value and build usefulness are intentionally separate.

`hero_equipment` is the source of equipped state. There is no `items.status = equipped`.

Equip/unequip, bulk equip and loadout preset application must use canonical DB/RPC workflows. Angular must not directly mutate `hero_equipment`.

Equipment rules:

- items can be equipped while owned by the hero and not scrapped;
- runtime-equipped statuses include `active`, `locked_trade` and `locked_auction`;
- `locked_trade` / `locked_auction` reserve market workflow but do not automatically block wearing or unequip;
- item requirements are equip/use requirements based on hero level and primary/base stats only;
- candidate item bonuses cannot help that same item meet its own requirements;
- later loss of requirements does not auto-unequip already equipped items;
- hand/ring rotation is DB/RPC workflow responsibility;
- saved equipment configurations are `preset` / `loadout preset`, not item sets.

Armory shelves are inventory organization, not equipment state. There are always 10 player-organizable shelves; new drops enter shelf `0` / unsorted / no shelf; shelf number persists on transfer.

Vendor/system scrap/sell uses drachmas and is not player trade. Frontend must call the canonical vendor scrap RPC and must not compose item lifecycle/resource updates in Angular.

## Estate, districts, buildings and siege boundary

Empty estate addresses are not database rows. The DB stores occupied estates only.

Estate address source of truth is `district_code + address_number`. `estates.address` remains legacy/display compatibility. New code should format addresses from `district_code + address_number`; when the final dependency on `estates.address` is removed, report it as a DB cleanup candidate.

Current district capacity values: A=5000, B=3000, C=500, D=50, E=1.

Frontend may generate possible address ranges from `estate_district_address_capacities` and overlay occupied `estates` rows.

Moving to an empty address is destructive and DB-owned. It is not siege/takeover. Siege/takeover of an occupied estate is future guild/PvP work and should preserve/transfer estate state rather than delete and recreate it.

Future relocation/siege timing/cooldown/protection values are DB/config-owned and must not become frontend constants.

Building construction/upgrades are DB-owned:

- one active building job per estate;
- job stores target level and timing;
- player-facing cancel is not MVP;
- completed jobs may be lazy-finalized;
- authoritative cost/time/resource spending happens in the building upgrade RPC;
- Building UI may preview formulas, but RPC result is authority.

## Trade, auction and economy

Player-to-player trade uses Character Points. Drachmas are vendor/system/building currency.

Items are not copied on transfer; ownership changes through `items.hero_id` via DB/RPC workflows.

Direct trade and one-item auction workflows are DB/RPC-owned. Angular must not direct-write critical trade/auction tables.

Trade/auction audit and anti-abuse signal generation are DB-owned.

Future/open areas:

- watched auctions and related notifications;
- minimum bid increment, custom bid amount, timing and anti-snipe/end-extension rules;
- Trade Routes/building-economy integration;
- combined active offer-slot limit across auctions/direct trades.

Received direct-trade offers should not consume the receiver’s active offer slot unless the receiver creates a counteroffer/commitment.

## Game reports and notifications

Game reports are player-facing gameplay reports. They are separate from audit logs, player abuse reports, notifications and temporary runtime/debug state.

A report should reproduce the same core event view the player saw in-game. Private report UI renders inside the normal app shell; public report route renders the same content without the app shell.

Public route conceptually uses `/report/:publicToken` and `game_reports.public_token`, not internal report id.

Current report type dictionary values include `combat`, `trial`, `encounter`, `pvp_combat` and `siege`.

Combat report production wraps `combat_results`. Trial and encounter producers should later wrap challenge/encounter outcomes, reward data and optional combat sections. PvP and siege report producers belong to future PvP/siege work.

Reward/drop item references are public showcase references. Prefer live `items` row and current item card when the item still exists; otherwise use saved component references/fallback display.

Combat attack source labels can be public, but full private player equipment/loadouts must not be exposed by default.

Notifications are durable inbox/bell entries. They are separate from game reports, audit logs, player abuse reports and UI-only toasts/messages. Frontend must not insert notifications directly; DB/RPC workflows create them. Frontend may mark/dismiss current-user notifications only through approved RPCs.

Reports have their own inbox/unread badge. Do not create default `game_report.created` notifications for ordinary report creation.

## PvP

Current DB/RPC foundations support parts of PvP target selection, travel/actions, spy snapshots, combat result handoff, resource/XP/prestige consequence hooks, anti-abuse signal generation and report trigger layers. Check `database-current.md` and generated types before any frontend work.

PvP MVP still needs dedicated workflow/UI work for target selection, level range handling, guild restrictions, attack travel time, spying, siege rules, protection/cooldowns, resource stealing/loss, PvP consequences and PvP reports.

Current design notes:

- attacks should be level-range limited;
- attacks cannot target own guild;
- attack travel time depends on estate/address distance;
- spying is shorter, has no level limit and can target own guild;
- sieges ignore level limits but cannot target own guild.

Do not use older in-chat R-DB drafts as current source of truth; re-read current dump and `database-current.md`.

## Prestige

Prestige is a hero-scoped, server-scoped reputation/fame system. It is not level, XP, Character Points, guild reputation, anti-abuse sanctioning or a server-wide score.

Prestige has hidden points and visible ranks. Players may see their own and others’ rank, but never raw points or numeric deltas. Admin/tester/sandbox UI may show raw points, deltas, thresholds and debug context.

Prestige is DB/RPC-authoritative for points, rank calculation, PvP deltas, ledger writes, player-safe summaries, reports and notifications.

Prestige ranks:

- Rank 1 / District A: `Perioecus`;
- Rank 2 / District B: `Ephor`;
- Rank 3 / District C: `Strategos`;
- Rank 4 / District D: `Archon`;
- Rank 5 / District E: `Basileus`.

Existing `ranks.required_level` and `ranks.max_players` semantics are legacy for the Prestige model. Target model uses explicit rank numbers, admin-configurable point thresholds and DB/config-backed player-facing labels/descriptions/helper text.

Prestige affects future district/building/relocation/council privileges. Falling below a district threshold never deletes estates, buildings or progress and never forces relocation, but future starts/upgrades/relocation into locked districts should be blocked by canonical DB requirements/read models.

Ordinary point changes should appear in PvP reports as qualitative player-safe summaries. Persistent notifications should be created only for rank changes.

## Guilds, emergency leadership and guild armory

Guilds are server-scoped and hero-membership based. A hero may belong to one guild per server.

First-foundation roles are `leader`, `officer` and `member`. There is one officer. The leader has full permissions and can dissolve the guild. The officer can invite, process join requests, kick, manage guild armory access and force-return/remove armory items, but cannot dissolve the guild.

Guild member capacity depends on leader level through DB/config/formula. Guild buildings are not part of first foundation and may never be needed; do not design a parallel estate-building treadmill.

Guilds do not currently implement diplomacy, alliances, war declarations, district influence or guild reputation. Guild actions do not affect private hero Prestige in the first foundation.

Emergency leader election exists only to recover from inactive leadership:

- any current member can start it if the leader has been inactive for the configured threshold;
- default inactivity threshold is 15 days;
- default phases are 6h nomination + 12h voting;
- maximum candidate count defaults to 3;
- any current member except the inactive leader can be nominated;
- no quorum and no 50%+1 threshold;
- most votes wins, ties go to earlier nomination;
- result automatically changes leadership.

Guild armory is lending/borrowing, not trade:

- deposit/borrow does not change `items.hero_id`;
- owner remains owner;
- borrowed items may be equipped, count in runtime loadout and appear in presets;
- borrower cannot sell, trade, auction, scrap or vendor-sell borrowed item;
- owner can still sell/trade/auction/scrap/withdraw/force-return their item;
- leader/officer can remove items from armory or force-return borrowed items;
- blocked members can still return borrowed items;
- loans do not expire in first foundation;
- capacity is configurable; `0` means unlimited.

## Server Events and future Server Council

Server Events are server-scoped, temporary effects affecting all heroes on the server. V1 has no district/guild/rank/origin/player sub-scope and only one active Server Event per server.

DB/RPC Server Events foundation exists. First frontend integration should consume active-event read models and admin/config paths after generated Supabase types are current. Player surfaces should use DB/RPC read models such as `get_active_server_event(...)`; Angular must not calculate or apply Server Event effects as authority.

Server Events are rare, powerful and irregular. They may be positive, negative or mixed. Event copy, helper text and duration should be DB/admin-configurable.

Effects may modify base stats, all stats, Luck, derived stats, combat-derived values and normal requirement checks. They must not permanently rewrite hero stats or requirement definitions.

Requirement modifiers may apply to normal item/building requirements, but not Prestige/district entry gates. Server Events must not directly alter manual minigame mechanics such as Walking Dead speed; effects should flow through existing stat/derived/Luck/runtime paths.

Activation direction:

- admin/operator may manually start an event;
- manual start ignores cooldown;
- cooldown counts from actual end of last event;
- automatic roll can run after configurable cooldown, default 14 days;
- automatic roll chance default is 10%;
- successful automatic roll selects uniformly from active eligible events;
- current design has no event weights;
- automatic events can start even if no players are online.

Server Council is future work and must not be implemented as part of first Server Events frontend/backend integration.

Future Council direction:

- v1 exists only to choose Server Events;
- it is based on current estate ownership in districts D and E;
- District C is outside the Council in v1;
- no terms, campaigns, candidate lists or elections;
- Council voting may begin once at least 20 district-D estates are occupied;
- threshold/proposal count/voting windows are DB/config-owned;
- default proposal count is 5;
- live results are hidden;
- E1 holder, not every `Basileus`, is the tiebreaker when their vote resolves a tie;
- otherwise use 24h runoff, then random selection among still-tied options.

## Admin, content tooling and UI/UX

Admin/balancer/content tooling must use DB-backed dictionaries, metadata and canonical RPC/governance contracts. Critical mutations must not be direct writes from Angular.

Admin UI should be organized by work intent rather than raw table names. Current admin IA groups:

- Overview;
- Global Governance;
- Game Balance;
- Server Operations;
- Moderation & Anti-abuse;
- Gameplay Tools / Sandbox.

Epic Ref/Admin IA is lightweight structure/layout hygiene, not final visual redesign.

For complex admin pages, prefer PrimeNG tabs/tabbed sections or clear sections over one long vertical form.

UI direction: modern premium browser RPG UI stylized around ancient Greece. Avoid generic SaaS admin feel, heavy decorative stone panels everywhere, raw UUID-only pickers and hardcoded gameplay lists when DB dictionaries/read models exist.

Use existing shared/vendor components, utilities and patterns before adding new components/helpers/state. Larger UI/workflow task reports must include `reused`, `checked but not reused` and `new component/state/helper added`.

## Known open gaps and future notes

These notes are not active work unless the user explicitly promotes them:

- Trial editor explainability/layout pass after relevant exploration/trial admin work.
- Dedicated admin configurator sweep for explanations, DB-backed dictionary text and runtime meaning.
- Equipment equip/unequip DB/RPC workflow if still missing for a concrete frontend slice.
- PvP MVP workflow/UI beyond existing foundations.
- Auction watchers and auction rule configuration.
- Trade Routes/building-economy integration.
- Server Council DB/RPC/UI planning after Prestige, estate ownership and Server Events are stable.
- Luck Lab as a separate admin/balancer preview/simulation surface.

Do not expand these memory notes into implementation scope unless the user asks to work on that topic.
