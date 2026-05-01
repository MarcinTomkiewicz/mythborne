# Mythborne — Project Context for Codex

Updated: 2026-05-01

## Purpose

This file is the short, operational context document for implementation work.

Use it as the primary high-level source of truth when generating code, scaffolding features, or proposing architecture.

If something here conflicts with a newer migration, seed, generated type, or explicit user instruction, prefer:

1. explicit user instruction,
2. current database schema / migrations / dump,
3. `current-decisions.md`,
4. this document.

## Project Name

The current canonical project/game name is **Mythborne**.

Older names such as Monster Hunt, MythHunter, MythBurn, Mythos Hunter, etc. may still appear in legacy filenames or older discussion. They should not be treated as current canonical naming.

Use **Mythborne** for new conceptual, UI-facing and documentation work unless explicitly instructed otherwise.

---

## Game Overview

Mythborne is a browser RPG inspired by ancient Greece.

The game combines:

- character progression;
- item generation and loot variance;
- exploration plus trials;
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

## Exploration / Trials Current Direction

Use canonical terms:

- Exploration;
- Trial opportunity / Trial appearance;
- Trial manifestation;
- Trial completion;
- Encounter;
- Health.

Do not rename the PvE implementation loop back to “monster hunt” except when referencing old legacy documents.

Exploration runtime tables are RLS-protected and readable by the owning hero/user through SELECT policies. Frontend read models may read owner-visible exploration state, but persistent mutations must go through PvE RPCs.

Difficulty tiers are DB-backed. Current active tiers are `easy`, `medium`, and `hard`; UI must not show hardcoded permanent cards when DB tiers are available.

Trial definitions and trial combat candidates now have canonical admin write RPCs:

- `upsert_trial_definition(...)`;
- `upsert_trial_combat_candidate(...)`;
- `deactivate_trial_combat_candidate(...)`.

`trial_definitions.minigame_key` is the source of truth for which minigame executes a trial. Combat candidates are valid only for trials where `minigame_key = combat`.

Frontend must not direct-write `trial_definitions` or `trial_combat_candidates`.

`/admin/exploration-trials` is the current admin/balancer UI for trial definition and combat candidate configuration. It uses DB-backed stats, minigames, opponents, families and formulas, and routes all trial/candidate mutations through the canonical RPCs above with mandatory reasons.

---

## Estate / Buildings Current Direction

Empty estate addresses are not database rows. The database stores occupied estates only.

Estate address source of truth is `district_code + address_number`.

`estates.address` remains legacy/display compatibility. New code should format addresses from `district_code + address_number`. When the final code dependency on `estates.address` is removed, Codex must report it as a `DB cleanup candidate`.

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

Game reports are player-facing gameplay reports and are separate from audit logs, player abuse reports, notifications, and temporary runtime/debug state.

A report should reproduce the same core event view the player saw in-game. The private Reports UI renders it inside the normal application shell; the public link renders the same report content without the app shell.

Public report route is conceptually `/report/:publicToken` and uses `game_reports.public_token`, not the internal report id.

Multiple heroes can have private access to the same report through `game_report_hero_access`, which supports future PvP and siege reports. Removing a report from one hero's list removes that hero's access; if no hero access remains, the report is deleted and the public token stops resolving.

Current report type dictionary values include `combat`, `trial`, `encounter`, `pvp_combat`, and `siege`.

Combat report production is the first concrete producer and wraps `combat_results`. Trial and encounter producers should later wrap challenge/encounter outcomes, reward grant data and optional combat sections. PvP and siege report producers belong to future PvP/siege epics.

Reward/drop item references are public showcase item references. If the dropped item still exists, renderers should prefer the live `items` row and current balanced item card. If the item row is gone, renderers fall back to saved quality/base/prefix/suffix component refs and fallback display name. Reward/drop report references intentionally do not snapshot final item stats forever.

Combat attack source labels can be public, but full private player equipment/loadouts must not be exposed by default. Drop rewards are showcase items; used weapons/equipment are not automatically full public item cards.

---

## Notifications Current Direction

Notifications are persistent inbox/bell entries for short attention or status events.

Notifications are separate from:

- game reports, which have their own Reports inbox and unread badge;
- audit logs, which are operational/system evidence;
- player abuse reports, which are moderation/source records;
- local UI toasts/messages after a user action.

The database always creates a persistent `notifications` row for notification-worthy events. If the recipient is online, frontend may present a fresh notification row as a toast when the notification type allows it. Toasts are presentation only, not a separate domain.

Recipient kinds:

- `user` — account/global notification;
- `hero` — gameplay/server/hero notification;
- `staff` — staff/server-work notification for an account in a server context.

Current DB foundation includes `notification_types`, `notifications`, `create_notification(...)`, `mark_notification_read(...)`, and `dismiss_notification(...)`.

Trade, auction, declaration, abuse report, anti-abuse case, sanction and Character Points penalty hooks are DB-owned. Frontend must read notifications and mutate read/dismiss state through RPCs; it must not insert notification rows directly.

Reports do not create notifications by default. A new report appears in the Reports area and contributes to the Reports unread badge, not the Notifications bell.

---

## Combat Current Direction

Combat is a reusable gameplay module. The same core combat rules should support exploration encounters, trials, future PvP, sandbox/admin tests and later systems.

Combat receives combatants and produces a combat result. It does not decide rewards, trial completion, PvP consequences, cooldowns or public report publishing. The caller interprets the result.

Core combat expectations:

- combat is limited by global product rule `combat_turn_limit`, currently defaulting to 10 full turns;
- one turn is a full round of eligible attack slots from both sides unless someone is defeated earlier;
- draw occurs if no side is defeated before the turn limit;
- player-controlled attacks use the Walking Dead timing minigame;
- resolution order is timing hit, evasion, crit, damage;
- opponents/automatic sides resolve attacks automatically;
- attack slots are ordered by `combat_initiative_score`;
- initiative ties are won by the initiating side;
- critical damage is base 50% plus active `critical_damage` bonuses, not a hardcoded x2 multiplier.

Attack plans:

- unarmed attack damage starts at `strength..strength` plus applicable bonuses;
- one one-handed weapon with empty off-hand means weapon attack plus unarmed attack;
- one-handed weapon plus shield means one weapon attack; shield does not attack;
- dual wield means one attack from each weapon;
- two-handed means one attack unless item-native data says otherwise;
- ranged is two-handed and can have item-native attack count greater than 1;
- opponents may also use natural attack sources such as Bite, Scratch, Iron Wings or Fist.

Opponents are admin/balancer-defined content:

- one opponent belongs to one admin-defined family;
- encounter/trial combat candidates may point to a concrete opponent or to a family;
- candidate scaling formula and `difficulty_multiplier` let the same opponent/family scale differently in encounter and trial contexts;
- opponent equipment can be none, manual item-like blueprint, or generated item-like loadout materialized only for one fight;
- generated opponent equipment must not create normal player-owned `items` rows.

Combat result persistence should be relational and report-ready:

- result header;
- participant snapshots;
- participant stat snapshots;
- one row per resolved attack.

Future public/private report rendering is a separate epic, but combat snapshots must preserve enough attack/result data to reproduce the combat UI later. Full equipment remains private; reports show attack source labels and safe item-like source details rather than full equipment loadouts.

---

## Admin / Content Tooling Current Direction

Admin tooling should be organized by work intent, not raw table names.

Recommended top-level admin IA groups:

- Overview;
- Global Governance;
- Game Balance;
- Server Operations;
- Moderation & Anti-abuse;
- Gameplay Tools / Sandbox.

Complex admin pages should prefer PrimeNG tabs or clearly separated sections over long vertical forms. This is structural/layout hygiene, not a final visual redesign.

Known configurators that need predictable placement:

- Combat Opponents → Game Balance / Combat Opponents;
- Trial Definitions → Game Balance / Trials;
- Encounter Definitions → Game Balance / Encounters;
- Notifications → Overview/Operations and Global Governance for type dictionaries;
- Reports → Gameplay Tools/Reports area.

---

## Canonical Terminology

Use canonical implementation terms:

- Exploration;
- Trials;
- Encounter;
- Trial appearance/opportunity;
- Trial manifestation;
- Trial completion;
- Prestige;
- Health;
- Character Points for the current UI-facing progression/trade currency label where new UI labels are needed.

Core in-world Greek names remain Greek across language versions. Localize explanations and UI descriptions, not the proper names themselves.
