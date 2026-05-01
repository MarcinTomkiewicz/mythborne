# Mythborne — Current Decisions Log

Updated: 2026-05-01

Use this file for recent design, domain, database and implementation decisions that should override older assumptions.

If something conflicts, prefer:

1. explicit user instruction,
2. current database schema / migrations / dump,
3. this file,
4. `project-context.md`,
5. broader concept documents.

This file is not a Codex status tracker. Do not mark Codex tasks as completed here unless the user explicitly asks for documentation/status updates after accepting the work.

---

## Working Standard / Dictation and Source Discipline — 2026-05-01

User input may be dictated, so transcription mistakes should be interpreted carefully. Obvious wording/order slips such as `UX/UI` vs `UI/UX`, malformed words or repeated fragments should be treated as likely dictation noise unless the user explicitly frames them as a new decision.

Do not convert a wording accident into a project decision. If a phrase appears suspicious or conflicts with current project files, check the current dump/docs and resolve conservatively.

Do not say that an epic or domain is “ready” merely because a table, seed or runtime helper exists. For admin configurators, check the full path: table/read policy, canonical RPC/write path, governance permission, audit/reason handling, generated types and frontend route scope.

The current collaboration mode is: decide business/domain semantics, prepare DB/RPC/schema foundations, then let Codex implement frontend slices against those contracts.

If the user mentions notes for memory, treat them as side notes or unrelated reminders. Do not move active task details, current Codex instructions or live decision material into those side notes.

---

## Project Name and Terminology

The canonical project/game name is **Mythborne**.

Older names such as Monster Hunt, MythHunter, MythBurn or Mythos Hunter may appear in legacy files. Do not use them as current canonical naming in new documentation, UI labels or Codex prompts unless explicitly referencing old source material.

Canonical gameplay terms:

- Exploration;
- Trial opportunity / Trial appearance;
- Trial manifestation;
- Trial completion;
- Encounter;
- Prestige;
- Health;
- Character Points.

Do not casually rename the main PvE loop back to “monster hunt” in implementation language.

---

## Exploration / L11 Trial Admin Configuration Decisions — 2026-05-01

Trial definitions and trial combat candidates have a canonical DB/RPC write path for admin/balancer tooling.

Current RPCs:

- `upsert_trial_definition(...)` — create/update `trial_definitions`;
- `upsert_trial_combat_candidate(...)` — create/update `trial_combat_candidates`;
- `deactivate_trial_combat_candidate(...)` — deactivate a trial combat candidate.

Frontend must not direct-write `trial_definitions` or `trial_combat_candidates`.

These RPCs require authenticated user context, config-governance permission and a non-blank reason.

`trial_definitions.minigame_key` is the source of truth for trial minigame routing. Combat candidates may be edited only for trial definitions with `minigame_key = combat`.

Candidate kind rules:

- `opponent` candidate requires `opponent_definition_id` and null `family_key`;
- `family` candidate requires `family_key` and null `opponent_definition_id`;
- `difficulty_multiplier` and `weight` must be positive;
- min/max hero level constraints, if present, must be valid and ordered.

Exploration read policies exist for active difficulty tiers and owner-readable runtime exploration tables. These are read-only policies. Persistent exploration mutations still use canonical PvE RPCs.

The previous L11 read-only inspector blocker was real before these RPCs existed. After this DB foundation, Codex can convert L11 into a write-capable configurator using these RPCs.

---

## Exploration / L12 Encounter Admin Configuration Decisions — 2026-05-01

Encounter definitions now have a canonical DB/RPC write path for admin/balancer tooling.

Current RPCs:

- `upsert_encounter_definition(...)` — create/update `encounter_definitions`;
- `deactivate_encounter_definition(...)` — deactivate an encounter definition;
- `upsert_encounter_combat_candidate(...)` — create/update `encounter_combat_candidates`;
- `deactivate_encounter_combat_candidate(...)` — deactivate an encounter combat candidate;
- `upsert_encounter_description_variant(...)` — create/update `encounter_description_variants`;
- `deactivate_encounter_description_variant(...)` — deactivate an encounter description variant;
- `upsert_reward_profile_assignment(...)` — create/update `reward_profile_assignments`;
- `deactivate_reward_profile_assignment(...)` — deactivate a reward profile assignment.

Frontend must not direct-write `encounter_definitions`, `encounter_combat_candidates`, `encounter_description_variants` or `reward_profile_assignments`.

These RPCs require authenticated user context, config-governance permission and a non-blank reason.

Encounter kind rules:

- supported `encounter_kind` values are `combat`, `resource`, `buff` and `debuff`;
- `nothing` is a step outcome, not an encounter definition;
- `combat` encounters may have combat candidates;
- non-combat encounters must not receive combat candidates;
- buff/debuff encounters must respect the runtime rule that only one active exploration effect is active at a time.

Encounter combat candidate rules:

- candidate kind `opponent` requires `opponent_definition_id` and null `family_key`;
- candidate kind `family` requires `family_key` and null `opponent_definition_id`;
- `difficulty_multiplier` and `weight` must be positive;
- min/max hero level constraints, if present, must be valid and ordered;
- candidate scaling may use `scaling_formula_id`, otherwise runtime can fall back to opponent/default scaling rules.

Reward assignment rules:

- L12 UI should use `reward_profile_assignments` as the real reward assignment surface, not only `encounter_definitions.reward_profile_id`;
- for encounter rewards, use `source_kind = encounter`;
- `source_kind = encounter` may use `encounter_definition_id` and must not use `trial_definition_id`;
- `source_kind = trial` may use `trial_definition_id` and must not use `encounter_definition_id`;
- source kinds other than `trial`/`encounter` must not use trial or encounter definition ids;
- `outcome_kind` is a key-like value, not a free-form label.

Admin SELECT policies now exist for the L12 admin/balancer read path. Mutations still go through RPCs only.

After this DB foundation, Codex can implement L12 as a write-capable encounter configurator, provided generated Supabase types are refreshed and the UI uses the canonical RPCs.

---

## Exploration Runtime Decisions

The core PvE order is:

1. player chooses direction;
2. every movement step takes time, including the first step;
3. trial opportunity is rolled first;
4. if no trial, encounter-or-nothing is rolled;
5. trial and encounter do not happen at the same time.

Encounter does not reset trial dry-step progression. Trial opportunity resets it.

Difficulty tiers are DB-backed. UI must not hardcode permanent difficulty cards when DB tiers are available.

Owner-readable exploration runtime tables are read-only from Angular. Persistent gameplay mutations use PvE RPCs.

---

## Formula Runtime Decisions — 2026-05-01

`balance_formulas` and their assignments are the source of truth for configurable gameplay formulas.

Frontend formula runtime is preview/explainability tooling. It is not authoritative for durable gameplay mutations.

Any DB/RPC/backend workflow that persists gameplay state must evaluate assigned formulas server-side when the result affects durable state.

Examples: building upgrade cost/time, stat upgrade cost/cap validation, XP-to-next-level validation, combat/opponent scaling where persisted, reward/challenge resolution where formula-backed, and future PvP/siege/resource calculations.

Current DB-side formula runtime foundation includes:

- `evaluate_balance_formula_expression(...)`;
- `evaluate_balance_formula_target(...)`;
- `formula_round_up(...)`;
- `formula_round_down(...)`;
- `formula_clamp(...)`;
- `formula_random()`;
- `formula_random(min, max)`.

If a new authoritative workflow needs formula evaluation and the current helper subset is insufficient, extend the approved DB/backend formula runtime instead of duplicating formula expressions in ad hoc RPC helpers or Angular.

---

## Estate / Buildings Runtime Decisions — 2026-05-01

Empty estate addresses are not rows. The database stores occupied estates only.

`district_code + address_number` is the source of truth for estate address identity.

`estates.address` remains legacy/display compatibility. New code should format addresses from `district_code + address_number`. When the final code dependency on `estates.address` is removed, Codex must report it as a DB cleanup candidate.

Current district capacity values:

- A = 5000;
- B = 3000;
- C = 500;
- D = 50;
- E = 1.

Moving to an empty address is destructive and DB-owned through `relocate_hero_estate_to_empty_address(...)`. It deletes the current estate row and its buildings/jobs via cascade, then creates the new estate at the selected empty address. It is not siege/takeover.

Siege/takeover of an occupied estate is a future guild/PvP workflow and must not delete estate/building state as if it were a relocation.

Building construction/upgrades are DB-owned:

- one active `estate_building_jobs` row per estate;
- player-facing cancel is not part of MVP;
- `finalize_completed_estate_building_jobs(...)` lazy-finalizes completed jobs;
- `start_estate_building_upgrade(...)` evaluates assigned building formulas server-side, spends resources through `hero_resource_ledger`, creates a job and writes audit.

Building UI may preview formulas, but authoritative cost/time is calculated in the RPC.

---

## Game Reports / Epic P Decisions — 2026-05-01

Game reports are player-facing gameplay reports, not audit logs and not player abuse reports.

A report should reproduce the same core event view the player saw in-game. The private Reports UI renders it inside the normal application shell; the public link renders the same report content without the app shell.

Public report route is conceptually `/report/:publicToken`. Use `game_reports.public_token` instead of exposing internal report ids.

Game reports are shared per event. Multiple heroes can have private access to the same report through `game_report_hero_access` with roles `owner`, `participant` or `viewer`.

Removing a report from a hero's Reports list removes that hero access row. If it was the final access row, the report row is deleted and the public token stops resolving. This is gameplay/report cleanup, not audit deletion.

Current report type dictionary values include:

- `combat`;
- `trial`;
- `encounter`;
- `pvp_combat`;
- `siege`.

Combat report production wraps `combat_results`. Combat reports must not duplicate combat attack rows; renderers should read the durable combat result snapshot tables.

Trial and encounter reports should later wrap challenge/encounter outcomes, reward grant data and optional combat sections. PvP and siege report producers belong to future PvP/siege epics.

Reward/drop item references are public showcase item references. If the dropped item still exists, renderers should prefer the live `items` row and current balanced item card. If the item row is gone, renderers fall back to saved quality/base/prefix/suffix component refs and fallback display name.

Reward/drop report references intentionally do not snapshot final item stats forever. Reports show the living item when it still exists, not a frozen pre-rebalance stat card.

Combat attack source labels can be public, but full private player equipment/loadouts must not be exposed by default. Drop rewards are showcase items; used weapons/equipment are not automatically full public item cards.

---

## Notifications / Epic Q Decisions — 2026-05-01

Notifications are persistent inbox/bell entries for short attention or status events.

Notifications are not game reports, audit logs, player abuse reports or local UI-only toasts/messages.

The DB notification row is the durable source. A toast is only frontend presentation of a fresh notification row when the recipient is online and the notification type has `default_toast_enabled = true`.

Reports have their own Reports inbox and unread badge. Do not create default `game_report.created` notifications for ordinary report creation.

Recipient kinds:

- `user` — account/global notification;
- `hero` — gameplay/server/hero notification;
- `staff` — staff/server-work notification.

Notification severity values:

- `info`;
- `notice`;
- `warning`;
- `critical`.

Frontend must not insert notification rows directly. DB/RPC workflows create notifications through `create_notification(...)`. Frontend may call `mark_notification_read(...)` and `dismiss_notification(...)` for current-user notifications.

DB-owned hooks currently cover direct trade, auctions, declarations, abuse report decisions, anti-abuse case attention, sanctions and Character Points penalties.

Notification body/title/action URLs are concise attention messages. They are not historical item/report snapshots.

---

## Combat / Epic M Decisions

Combat is one reusable module, not multiple combat types. Exploration encounter combat, trial combat, PvP, sandbox and future systems provide combatants and interpret the result, but the core combat rules stay the same.

Combat receives combatants and produces a combat result. It does not decide rewards, trial completion, PvP consequences, cooldowns or public report publishing. The caller interprets the result.

Combat is limited by global product rule `combat_turn_limit`, currently defaulting to 10 full turns. One turn is a full round of eligible attack slots from both sides unless someone is defeated earlier. Draw occurs if no side is defeated before the turn limit.

Combat uses side names `initiator` and `defender`. Outcomes are `initiator_victory`, `defender_victory` and `draw`.

Attack slots are ordered by formula target `combat_initiative_score`. Higher score acts earlier; exact ties are won by the initiating side.

Critical damage is formula/bonus-driven: hardcoded x2 is not target architecture.

Admin-defined opponents:

- one opponent belongs to one family;
- encounter/trial combat candidates may point to a concrete opponent or a family;
- candidate scaling formula and `difficulty_multiplier` let the same opponent/family scale differently in encounter and trial contexts;
- opponent equipment can be `none`, `manual` item-like blueprint or `generated` item-like loadout materialized only for one fight;
- generated opponent equipment must not create normal player-owned `items` rows.

Combat result persistence should be relational and report-ready: result header, participant snapshots, participant stat snapshots and one row per resolved attack.

---

## Item Generation and Luck Decisions

Items use a layered identity: quality + optional prefix + base item + optional suffix.

Quality changes value and power. Prefix and suffix have independent value and gameplay impact.

High economic value does not guarantee direct usefulness. A player may drop a valuable but awkward item; that is intentional for economy and long-term trade.

Luck should improve opportunities, not guarantee perfect rewards. It can influence value bucket, quality and affix chances, but a full Luck strategy must carry opportunity costs in challenge success.

Item requirements are a critical progression safety valve. A player may obtain an item before being able to equip it.

---

## Vendor Scrap / Sell Decisions — 2026-05-01

Vendor/system item scrap/sell uses drachmas and is not player trade.

Frontend must call `vendor_scrap_hero_item(...)` for vendor sell/scrap. It must not compose item lifecycle updates and resource updates in Angular.

Vendor scrap is an item lifecycle transition plus resource reward, owned by DB/RPC.

---

## Trade / Auction Decisions

Player-to-player trade uses Character Points. Drachmas are vendor/system/building currency, not player-to-player trade currency.

Items are not copied on transfer. Ownership changes through `items.hero_id` via DB/RPC workflows.

Item statuses include `active`, `scrapped`, `locked_trade` and `locked_auction`.

Direct trade and one-item auction workflows are DB/RPC-owned. Angular must not directly mutate critical trade/auction tables.

Trade/auction audit is DB-owned through triggers and helper functions. Frontend must not manually write lifecycle audit rows.

---

## Progression / Epic N Decisions

Stat upgrade cost and cap validation are DB/RPC-owned for durable mutation. Frontend calculators may preview only.

Character Points are the canonical player-visible progression/economy points. Older `PR` / `Hero Points` wording may appear in legacy notes but new UI should use Character Points unless explicitly changed.

Progression formulas must be evaluated server-side when spending points or validating upgrades.

---

## Server / Account / Hero Decisions

`hero.id != auth.uid()`.

User account is global. Hero is server-specific.

Correct loading path:

1. authenticated user;
2. selected/current server;
3. active hero on that server;
4. hero-owned data.

Sandbox/testing may allow privileged multi-hero tooling. Standard gameplay must not assume one global hero.

Server staff permissions are server-scoped.

---

## Configuration Governance Decisions

Config changes must be reasoned and grouped in change sets.

Config definitions are a registry/governance layer, not a replacement for relational domain tables.

Critical config/value/entity edits should flow through DB/RPC/governance contracts, not direct Angular writes.

`global_value_change` / `server_value_change` entries must not misuse `entity_id`. Those entries use `config_definition_id`, optional `server_id`, `field_path = value_json`, old/new values and metadata. Entity edits use `entity_field_change`.

---

## Bonus / Derived Stat Decisions

Use `scope`, not `context`, for bonus semantics.

Central bonus foundation uses DB dictionaries and semantic bonus templates:

- `bonus_types`;
- `bonus_scopes`;
- `bonus_target_categories`;
- `bonus_targets`;
- extended `bonus_templates`;
- `entity_bonuses`.

Legacy bonus join tables are transitional.

`hero_derived` is no longer frontend/runtime source of truth. Do not introduce new dependencies on it.

Derived stats should resolve from base stats, equipment, origin/building/item/entity bonuses and formula/fallback layers where applicable.

---

## Admin IA / Epic R Direction — 2026-05-01

Epic R is lightweight admin information architecture and layout hygiene, not a final visual redesign.

Admin UI should be organized by work intent, not raw table names.

Recommended groups:

- Overview;
- Global Governance;
- Game Balance;
- Server Operations;
- Moderation & Anti-abuse;
- Gameplay Tools / Sandbox.

Codex should prefer PrimeNG tabs/tabbed sections or clear sections for complex admin pages instead of one long vertical form.

Final visual style, spacing, iconography and design-system decisions remain in the UI/UX backlog.

---

## M12 / Combat Opponent Admin Configurator Reminder

Combat opponent definitions are a future admin/balancer configurator area.

Corrected facts:

- `combat_opponent_attack_sources` does not have an attack-source-kind field;
- attack source rows have natural attack-source fields such as key/label/descriptions, min/max opponent level, attack count, min/max damage, critical chance/damage, active/sort order;
- opponent-level `equipment_mode` supports `none`, `manual`, `generated`;
- equipment-entry-level `entry_mode` supports `manual`, `generated` only.

Do not assume a write-capable M12 UI is safe until the dump/generated types confirm the current RPC/governance path for the exact tables being edited.
