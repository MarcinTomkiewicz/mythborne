# Mythsworn — Current Decisions Log

Updated: 2026-05-09

## Purpose

This file records active design, domain, database-boundary and implementation-boundary decisions that should override older concept notes.

Use this file to answer:

- what has already been decided semantically;
- what remains intentionally out of scope;
- which domain boundaries Codex, Migrator and Reviewer must preserve;
- what must not be reintroduced from older Monster Hunt / Mythborne assumptions.

This file is **not**:

- a full DB/RPC registry;
- a migration log;
- a Codex task-status tracker;
- a smoke-test history;
- a replacement for `database-current.md`, `project-context.md`, `current-todo.md` or the implementation backlogs.

For exact DB/RPC/helper/table inventory, use `database-current.md` and the current dump/generated types. For short implementation context, use `project-context.md`. For task execution order and task status, use the backlogs and status files.

## Conflict order

When sources conflict, prefer:

1. explicit user instruction in the current conversation;
2. current live database / migrations / latest dump / regenerated generated types;
3. `database-current.md` for exact DB/RPC/helper contracts;
4. this file for semantic/domain decisions;
5. `project-context.md` for compact operational context;
6. backlog/status files for task execution state;
7. older concept documents only as historical context.

Do not update `current-todo.md`, `current-state-summary.md` or backlog task statuses from this file unless the user explicitly asks for a documentation/status sync after accepting implementation work.

---

# 1. Global project and source discipline

## Project name and canonical vocabulary

The canonical project/game name is **Mythsworn**.

Older names such as Monster Hunt, MythHunter, MythBurn, Mythborne or Mythos Hunter may appear in legacy files. Do not use them as current canonical naming in new documentation, UI labels or Codex prompts unless explicitly referencing old source material.

Canonical gameplay terms include:

- Exploration;
- Trial opportunity / Trial appearance;
- Trial manifestation;
- Trial completion;
- Encounter;
- Prestige;
- Health;
- Character Points.

Do not casually rename the main PvE loop back to “monster hunt” in implementation language.

Core in-world rank names and similar proper names may remain Greek-styled across language versions. Localize explanatory text, not proper names themselves.

## Dictation and interpretation standard

User input may be dictated. Obvious wording/order slips, malformed words or repeated fragments should be treated as likely dictation noise unless the user explicitly frames them as a new decision.

Do not convert a wording accident into a project decision. If a phrase conflicts with current project files, schema or accepted decisions, resolve conservatively and check the current source documents.

## Implementation-source discipline

The collaboration mode is:

1. decide business/domain semantics;
2. prepare DB/RPC/schema foundations through Migrator where needed;
3. let Codex implement frontend/Angular slices against those contracts;
4. let Reviewer verify against decisions, DB/RPC contracts and project standards.

Do not say that an epic or domain is “ready” merely because one table, seed or helper exists. For admin configurators and durable workflows, check the full path:

- table/read policy;
- canonical RPC/write path;
- permission/governance boundary;
- reason/audit handling;
- generated type readiness;
- frontend route/scope.

Generated Supabase types are user/migrator-owned input. Codex may read them, but must not edit, regenerate, patch or reformat them. If a generated type is missing or stale, report a DB/types blocker instead of creating a frontend fallback.

## Global DB/RPC authority rule

Durable gameplay, economy, progression, item, equipment, estate, guild, PvP, report, notification, config and moderation mutations must flow through canonical DB/RPC/domain/governance workflows.

Angular may display previews, drafts and explainability outputs, but must not become durable authority for:

- formulas;
- XP/level/Character Points;
- item ownership/equipment/lifecycle;
- building construction/resources;
- rewards;
- combat finalization;
- exploration/trial/encounter resolution;
- PvP consequences;
- Prestige deltas;
- notifications/reports;
- config governance;
- audit/anti-abuse/sanctions.

If a required DB/RPC/read-model contract is missing, Codex must report the dependency instead of inventing an Angular-side permanent fallback.

---

# 2. Identity, server, hero and entry flow

## Server / account / hero

- User/account is global.
- Hero is server-specific.
- `hero.id != auth.uid()`.
- Correct normal loading path is: authenticated user → selected/current server → active hero on that server → hero-owned data.
- Standard gameplay must not assume one global hero.
- Sandbox/test servers may allow privileged multi-hero tooling.
- Server staff permissions are server-scoped.

## Onboarding / start flow

The canonical player entry flow starts from server selection and proceeds into active hero gameplay or hero creation.

Decisions:

- If the selected standard server has no hero for the current user, the user enters hero creation.
- If the selected server has an existing hero for the current user, the user enters the game dashboard/game shell by default.
- After hero creation, the player is already inside the game and is routed by default to stat allocation.
- Initial stat allocation is not a mandatory tutorial/wizard lock. The player may leave it and return later.
- On later entries, an existing hero is routed to the dashboard/game shell by default, not back to stat allocation.
- Server availability for new character creation must consider whether the selected standard server can still provide a free starting estate address in district A.

Sandbox/test behavior:

- Privileged users such as staff/testers may have multiple heroes on sandbox/test servers.
- The default sandbox/test active hero is the earliest created hero unless a more explicit selector/context exists.
- UI may use either a combined server-and-hero selector or a server-first then hero selector, as long as selected server → active hero semantics remain explicit.

Hero creation semantics:

- Hero creation must be one coherent domain/DB-RPC workflow, not a series of direct frontend table writes.
- Hero names are unique per server. The same name may exist on different servers.
- Origin is selected once during hero creation and immediately affects hero identity and bonuses.
- Origin should not be changed after creation except through a future explicit admin/correction workflow if designed.
- Origin screen/content must be admin-configurable, including descriptions, lore and bonus presentation.
- New heroes start with 1000 Character Points.
- Starting Character Points do not have to be spent immediately.
- Every new hero must receive an estate during creation. A hero without an estate after creation is an integrity error.
- Starting estate address is randomly selected from free addresses in district A.
- Starting estate addresses must not be assigned sequentially as A1, A2, A3, etc.
- The player does not choose or preview the exact starting address before hero creation.

Codex must not implement onboarding by direct-writing hero, origin, Character Points, estate, resource, audit or related onboarding tables from Angular.

---

# 3. Progression, stats, bonuses and Luck

## Stats and Character Points

Stats means Character Point allocation into base stats.

Progression means XP, level, XP-to-next-level, level-up, Character Points generated from XP, Character Point penalties/sinks, level-up rewards and level-up stat bonuses.

Decisions:

- Stat upgrade cost and cap validation are DB/RPC-owned for durable mutation.
- Frontend calculators may preview only.
- Character Points are the canonical player-visible progression/economy points.
- Older `PR` / `Hero Points` wording may appear in legacy notes, but new UI should use Character Points unless explicitly changed.
- Progression formulas must be evaluated server-side when spending points or validating upgrades.
- Plus/minus stat clicks in UI are local draft state and are not audited. The final save is the persistent/auditable mutation.
- Angular must not direct-write `hero_stats`, `hero.character_points`, `character_point_ledger` or audit tables.

## XP and Character Points

Core rule: **every XP gain always grants the same gross amount of Character Points**.

If a hero gains `40 XP`, the hero also gains `40 Character Points` gross. This is not an optional configurable boolean.

If a hero has an active Character Point penalty/debt, newly gained Character Points may be immediately consumed by the penalty sink. This does not break the XP → CP rule. Ledger/history should show:

- positive CP gain from XP;
- negative CP payment toward active penalty/debt;
- net spendable CP after sink.

Use:

- `hero.experience` = current XP progress toward next level;
- `hero.total_experience_earned` = lifetime XP earned.

The canonical XP/level-up workflow must evaluate thresholds server-side, support multiple level-ups in one grant, write progression ledger, grant gross Character Points and route CP through the penalty sink.

## Character Point penalties

Character Point penalties/debts are explicit penalty records with total/paid/remaining amounts and status workflow.

Rules:

- CP is granted gross first.
- Active payable penalty/debt consumes as much newly granted CP as possible.
- Paid/remaining amounts are updated.
- CP ledger records both gain and sink/payment.
- If a penalty reaches zero remaining amount, its status moves to completed according to sanction/penalty status semantics.
- Frontend must not call low-level CP helpers directly.

## Level-up rewards and stat bonuses

Level-up rewards use reward/profile foundations and are selected by reached level.

Rules:

- Level-up reward routing supports `any`, `exact`, `minimum`, `range` and `interval` / every N levels.
- A single reached-level event chooses one best matching reward profile.
- If a level should give several things, they belong as multiple entries inside the selected reward profile.
- Level-up reward profiles must not contain active `experience` reward entries, to avoid recursive `level-up → XP reward → new level-up` loops.

Level-up stat bonuses are a core progression feature:

- They are configurable and must not be hidden only in `metadata_json`.
- They increase actual base stat values in `hero_stats`, not only separate derived bonuses.
- This intentionally increases future manual stat upgrade costs and contributes to the Character Point sink.
- Rules may support fixed-stat bonuses, random stat-pool bonuses and exact/minimum/range/interval level matching.
- Actual grants should record before/after stat values.

## Bonus and derived stat model

- Use `scope`, not `context`, for bonus semantics.
- Central bonus foundation uses DB dictionaries and semantic bonus templates:
  - `bonus_types`;
  - `bonus_scopes`;
  - `bonus_target_categories`;
  - `bonus_targets`;
  - semantic/extended `bonus_templates`;
  - `entity_bonuses`.
- Legacy bonus join tables are transitional.
- `hero_derived` is no longer frontend/runtime source of truth. Do not introduce new dependencies on it.
- Derived stats should resolve from base stats, equipment, origin/building/item/entity bonuses and formula/fallback layers where applicable.

## Luck Foundation

Luck Foundation is a closed decision topic. Do not reopen it unless Migrator, Codex or Reviewer returns a real blocker.

Luck is a global RNG/opportunity stat. It is not only an item-drop stat and it is not a guarantee of success or perfect rewards.

Core semantics:

- Luck affects helpful gameplay RNG surfaces unless a specific RNG surface is explicitly Luck-excluded.
- Luck improves opportunities and odds; it must not make success deterministic.
- `luckInfluence` is the canonical derived influence value used by formulas. It is not raw Luck and must not be treated as 1:1 with `luckValue`.
- `trial_power` is the canonical effective trial strength concept.
- Conceptually, `trial_power = testedStatValue + luckInfluence`.
- Difficulty, district and pressure/caps consume `trial_power` through their own formulas/config; they are not part of `trial_power` itself.
- `nothing` is not a separate RNG surface. It is the deterministic fallback when trial opportunity and encounter rolls do not produce an outcome.
- Anti-abuse is not gameplay RNG and must not be affected by Luck.

Luck can affect, where configured:

- item/drop opportunity, value bucket, quality and affix chances;
- reward amount and reward item-count ranges;
- trial opportunity;
- trial manifestation;
- trial power;
- challenge auto-resolve success chance;
- manual trial/minigame difficulty through `trial_power`;
- exploration encounter fallback / non-trial encounter chance;
- combat RNG surfaces such as hit, evasion, critical chance and critical-damage context.

Authority rules:

- Luck formulas, caps, chances, reward ranges and item-generation effects are DB/RPC/formula-owned.
- Angular may display DB/RPC preview/explainability outputs, but must not hardcode Luck curves, chance formulas, reward ranges or item-generation Luck effects.
- If a needed Luck contract is missing, Codex must report a DB/RPC dependency rather than creating a frontend fallback formula.
- Luck Lab is separate from Luck Foundation and must display DB/RPC/formula outputs; it must not become gameplay authority.

---

# 4. Exploration, Trials and Encounters

## Exploration core

Exploration Core Completion exists to finish the runtime so normal gameplay can progress through direction choice, step timing, step result, Trial / Encounter / Nothing, resolution or immediate outcome, reward/effect and continued exploration without dead states.

Canonical terms:

- Trial;
- Encounter;
- Nothing;
- Combat;
- Minigame.

Do not use `Challenge` as a canonical player-facing or planning-facing term for this scope.

`Nothing` is a step outcome and deterministic fallback. It is not an Encounter definition and not an independent RNG roll.

## Runtime eligibility and readiness

Normal exploration runtime may select only active and complete Trial / Encounter definitions.

A Trial is runtime-complete only when it is active, has a supported resolver/minigame or explicit auto-resolve-only mode, has reward assignment, has any required combat candidate or minigame configuration, and has no blocking readiness error.

An Encounter is runtime-complete according to its kind:

- `combat` requires at least one eligible combat candidate and a reward assignment;
- `resource` requires a valid resource reward/payload;
- `buff` requires a valid buff/effect payload;
- `debuff` requires a valid debuff/effect payload.

Resource Encounter is a reward Encounter. Buff Encounter grants a buff. Debuff Encounter applies a debuff and is the intended negative exploration outcome. Do not introduce a generic penalty/consequence category for normal exploration.

Misconfigured Trials and Encounters may exist in admin configuration, but must be excluded from normal runtime selection. Adding incomplete future content must not break gameplay.

## Resolution and blocking

- An unresolved active Trial or Encounter blocks starting the next exploration step.
- If a Trial or Encounter requires resolution, UI must expose a working manual resolve action, auto-resolve action or explicit auto-resolve-only flow.
- A visible `Trial is ready` state without a working resolve action is a blocker.
- Resource/effect Encounters should use their own outcome/reward/effect flow and must not pretend to be manual minigames.
- Force outcome / force resolve tooling is outside the normal core flow.

## Step timing and diagnostics

Exploration step duration is DB/config-owned and must not be hardcoded in Angular.

Exploration needs one DB/RPC-owned readiness/eligibility model for Trial and Encounter definitions so runtime selection and admin diagnostics use the same rules.

Readiness reason codes should be stable and backed by metadata/labels/descriptions. Angular should display DB-backed labels/copy rather than inventing a separate permanent reason-label system.

Sandbox/tester diagnostics should show the useful selection story without dumping a huge full pool by default.

## Trial admin configuration

Trial definitions and trial combat candidates have a canonical DB/RPC write path for admin/balancer tooling. Frontend must not direct-write trial definition or trial combat candidate tables.

Rules:

- `trial_definitions.minigame_key` is the source of truth for trial minigame routing.
- Combat candidates may be edited only for trial definitions with `minigame_key = combat`.
- Candidate kind `opponent` requires an opponent definition and no family key.
- Candidate kind `family` requires a family key and no opponent definition.
- `difficulty_multiplier` and `weight` must be positive.
- Min/max hero level constraints, if present, must be valid and ordered.
- Mutations require authenticated user context, config-governance permission and non-blank reason.

## Encounter admin configuration

Encounter definitions have a canonical DB/RPC write path for admin/balancer tooling. Frontend must not direct-write encounter definitions, combat candidates, description variants or reward assignments.

Encounter kind rules:

- supported `encounter_kind` values are `combat`, `resource`, `buff` and `debuff`;
- `nothing` is a step outcome, not an encounter definition;
- `combat` encounters may have combat candidates;
- non-combat encounters must not receive combat candidates;
- buff/debuff encounters must respect the runtime rule that only one active exploration effect is active at a time.

Reward assignment rules:

- Encounter UI should use reward profile assignments as the real reward assignment surface.
- For encounter rewards, use `source_kind = encounter`.
- `source_kind = encounter` may use encounter definition id and must not use trial definition id.
- `source_kind = trial` may use trial definition id and must not use encounter definition id.
- `outcome_kind` is a key-like value, not a free-form label.

## Resource and effect payloads

Resource, buff and debuff encounters require typed DB-backed payload configuration.

Rules:

- Resource payloads are valid only for `encounter_kind = resource`.
- Effect payloads are valid only for `encounter_kind = buff` or `encounter_kind = debuff`.
- Effect payload kind must match the linked effect definition kind.
- Resource payload amount modes are typed as `fixed`, `range` or `formula`.
- Formula-backed payloads reference balance formulas; fixed/range payloads require ordered min/max amounts.
- Chance percent must remain within `0..100`.
- `metadata_json` remains technical extension data and must not become the authoritative gameplay contract for resource/effect behavior.

L12 UI should expose kind-aware payload sections instead of encoding resource/effect behavior in arbitrary metadata JSON.

---

# 5. Manual Trial Minigame Shell/Core

Manual Trial Minigame Shell/Core is the shared runtime foundation for player-facing manual Trial minigames. It is not a concrete minigame and must not implement Apollo, Hermes, Zeus, Hera, Artemis, Athena, Hephaestus or Aphrodite gameplay directly.

The shell exists to prevent each minigame from inventing its own attempt lifecycle, manual/auto boundary, timeout handling, replay validation, report handoff and reward/result flow.

## Terms

- **Trial Offer** — state where a Trial has appeared and the player chooses manual resolve or auto-resolve.
- **Manual Runtime Session** — session created only after the player chooses manual resolve.
- **Manual Runtime Manifest** — backend-owned manifest/config that lets frontend render one concrete manual minigame session.
- **Action Log** — player action stream submitted by frontend for backend replay/validation.
- **Backend Verdict** — backend-owned result after replay/validation or auto-resolve.

Concrete minigames are separate renderers/epics. Core may include a fail-closed unsupported renderer but must not include real gameplay for any concrete minigame.

## Trial Offer and manual/auto boundary

- Trial identity is locked before the player chooses manual resolve or auto-resolve.
- When the Trial Offer is shown, backend already knows trial definition, god, tested stat, difficulty and `minigame_key`.
- Manual resolve and auto-resolve are two resolution paths for the same locked Trial attempt, not two separate rolls.
- Trial Offer shows Trial identity and manual/auto choice, but does not require loading or creating the Manual Runtime Manifest.
- `trial_power` remains a gameplay/runtime concept and must not be shown raw to players.
- Auto-resolve is backend-owned and resolves the locked Trial attempt without creating/running concrete minigame runtime.
- Auto-resolve can be chosen explicitly by the player.
- Trial Offer has an inactivity timeout only, to avoid permanently pending offers; it is not a hard decision timer for an active player.
- Offer inactivity timeout is DB/config/admin-owned, not hardcoded in Angular.
- Auto-resolve caused by inactivity is ordinary auto-resolve.

## Manual Runtime Session

- Manual Runtime Session is created only after manual resolve is selected.
- Backend returns the Manual Runtime Manifest.
- Frontend renders only from the backend manifest and must not generate durable difficulty parameters locally.
- If the player explicitly exits or navigates away during a manual Trial, UI should warn that leaving will resolve the Trial automatically.
- If the player confirms exit, backend should resolve through auto-resolve and the player should see the resulting report/outcome.
- There is no normal durable `abandoned` outcome. Every Trial should reach a final result or explicit system failure/correction.

## Timing, inactivity and fairness

- Timer-based minigames may fail through normal manual timeout.
- If a client/browser crash prevents submit and a timer expires, result can be manual fail with `time_expired` or equivalent reason.
- Non-timer minigames need inactivity handling so a session cannot stay pending forever.
- Non-timer inactivity should be based on meaningful activity/session signals and lead to ordinary auto-resolve, not abandoned state.
- Timing-based and continuous minigames must use a deterministic runtime model shared by frontend rendering and backend replay.
- UI must not show final success before Backend Verdict.
- If UI shows the player reached a visible readiness threshold, backend validation should not normally fail because of a different hidden model of time/thresholds.
- Hidden player-friendly safety/tolerance margins may exist in manifest/backend validation policy. They are not player-facing and must not create hidden additional difficulty.

## Backend authority and replay validation

- Frontend is not authoritative for manual Trial success, failure, rewards or report generation.
- Frontend submits Action Log plus supporting client-observed metadata, not a final “I won/I failed” truth value.
- Backend replays/validates Action Log against Manual Runtime Manifest.
- Backend owns outcome, failure reason, reward eligibility/result, report generation and durable state transition.
- Manifest version/hash/seed/config and Action Log must be sufficient for replay/validation.
- Manifest/session mismatch, invalid action log or system mismatch must be handled through validation/system reason semantics, not by trusting frontend.

## Envelope and status semantics

Manual Runtime Manifest should include a common envelope: attempt/session identity, `minigame_key`, manifest version/hash, trial identity, god/stat/difficulty metadata, display metadata, timing policy, inactivity policy, accessibility policy, report policy, minigame-specific config and validation context.

Action Log submit should include attempt/session/manifest identity, manifest version/hash, action entries, client timing summary, client-observed summary, optional environment summary and request id.

Backend Verdict should include outcome, resolution mode, failure/success reason, replay summary, player report summary, reward result, report id and validation/debug context where useful.

Do not collapse lifecycle, outcome, resolution mode and failure reason into one overloaded status.

Trial attempt lifecycle must support at least: offered, manual session active, auto-resolving, manual submit validating/replaying, resolved and system failure/correction.

Manual session lifecycle must support at least: active, submitted, validated, expired/timeout, closed to auto-resolve and invalidated/session mismatch.

A resolved Trial must always have outcome semantics: success or fail. Every failed Trial result must have a reason at least for admin/debug/log/report-source purposes.

Resolution mode should distinguish manual, direct auto-resolve, auto after offer inactivity, auto after explicit exit and auto after manual inactivity where applicable.

Reason codes should be DB-stable technical keys. Player-facing labels/descriptions should come from read models/metadata/copy, not raw reason keys.

## Reports and replay output

Every resolved Trial should produce or feed a game report/result surface.

Common player/public report structure:

- intro/lore;
- Trial identity;
- replay/timeline summary or final-state summary;
- outcome;
- reward.

Public/player reports should be safe, replay-friendly and attractive, without raw UUIDs, staff-only fields, debug payloads or raw technical replay internals.

Full technical replay log is backend/admin/debug source-of-truth. Player/public reports show curated safe summaries.

## Combat / Ares boundary

Combat is a reusable combat engine, not a Manual Trial Minigame renderer.

Ares/Strength Trial may use combat through a combat wrapper/result handoff rather than through the manual minigame renderer registry. Manual Trial Shell/Core must not absorb live combat runtime or make combat behave like Apollo/Hermes/Zeus-style manual minigame renderers.

## Implementation boundary

Manual Trial Core may implement host/page/shell, Trial Offer UI, manual/auto boundary, manual session loading, manifest envelope handling, renderer registry, unsupported renderer fail-closed state, shared HUD slots, Action Log submit envelope, Backend Verdict handling, result/report handoff, stale guards, exit warning, inactivity/timeout hooks and generic error states.

Manual Trial Core must not implement Apollo gameplay, Zeus charging, Hermes shuffle, Hera maze, Artemis aiming, Athena omen logic, Hephaestus forge, Aphrodite timing court, minigame-specific balancing, minigame-specific backend replay validation or minigame-specific report timelines.

Concrete minigames should follow after Core as separate epics/mini-epics. Apollo / Path of Light may remain an early proof-of-path candidate, but concrete Apollo mechanics are separate future decisions and are not frozen by this file.

Migrator should design the DB/RPC/read-model foundation before Codex implements the frontend Core.

---

# 6. Combat

## Combat core

Combat is one reusable module, not multiple combat types. Exploration encounter combat, Trial combat, PvP, sandbox and future systems provide combatants and interpret the result, but core combat rules stay the same.

Combat receives combatants and produces a combat result. It does not decide rewards, Trial completion, PvP consequences, cooldowns, notifications or report publishing. The caller interprets the result.

Current decisions:

- Combat turn limit is a global product rule, currently defaulting to 10 full turns.
- One turn is a full round of eligible attack slots from both sides unless someone is defeated earlier.
- Draw occurs if no side is defeated before the turn limit.
- Combat uses side names `initiator` and `defender`.
- Outcomes are `initiator_victory`, `defender_victory` and `draw`.
- Attack slots are ordered by formula target `combat_initiative_score`.
- Higher initiative score acts earlier; exact ties are won by the initiating side.
- Critical damage is formula/bonus-driven. Hardcoded x2 is not target architecture.
- No `hero_derived` dependency is allowed.

## Combat persistence and authority

Combat result persistence should be relational and report-ready: result header, participant snapshots, participant stat snapshots and one row per resolved attack.

Combat result snapshot persistence persists the snapshot only. It is not anti-cheat validation and does not prove that the result was production-authoritative.

Sandbox/admin-test combat may use an Angular combat resolver as a test surface. Production gameplay callers such as encounter, trial and PvP must not silently persist arbitrary Angular-computed combat results as final authoritative truth unless a backend/RPC validation/finalization boundary explicitly approves that path.

## Admin-defined opponents

- One opponent belongs to one family.
- Encounter/trial combat candidates may point to a concrete opponent or a family.
- Candidate scaling formula and `difficulty_multiplier` let the same opponent/family scale differently in encounter and trial contexts.
- Opponent equipment can be `none`, `manual` item-like blueprint or `generated` item-like loadout materialized only for one fight.
- Generated opponent equipment must not create normal player-owned `items` rows.
- Opponent equipment entries are fight-local item-like blueprints/loadouts.

M12 correction/reminder:

- `combat_opponent_attack_sources` does not have an attack-source-kind field.
- Attack source rows have natural attack-source fields such as key/label/descriptions, min/max opponent level, attack count, min/max damage, critical chance/damage, active/sort order.
- Opponent-level `equipment_mode` supports `none`, `manual`, `generated`.
- Equipment-entry-level `entry_mode` supports `manual`, `generated` only.
- Do not assume write-capable M12 UI is safe until dump/generated types confirm the current RPC/governance path for the exact tables being edited.

## Combat explainability

Epic M must be treated as reusable combat foundation, not just a sandbox screen.

Combat formulas and dictionaries should be DB-backed and explainable. Admin/balancer UI must explain what combat configuration changes, where it is used and whether it affects production runtime or sandbox/admin-test only.

---

# 7. Items, equipment, armory, trade and auctions

## Item identity and generation

Items use layered identity:

- quality;
- optional prefix;
- base item;
- optional suffix.

Quality changes value and power. Prefix and suffix have independent value and gameplay impact.

High economic value does not guarantee direct usefulness. A player may drop a valuable but awkward item; that is intentional for economy and long-term trade.

Luck should improve opportunities, not guarantee perfect rewards. It can influence value bucket, quality and affix chances, but a full Luck strategy carries opportunity costs in challenge success.

Item requirements are a critical progression safety valve. A player may obtain an item before being able to equip it.

Do not create a second item rarity system for Luck. Item rarity/frequency continues to come from drachma value, bucket budget and item-generation rules.

## Item ownership and lifecycle

- Item ownership changes through `items.hero_id`; items are not copied on transfer.
- `hero_equipment` is the source of equipped state.
- There is no `items.status = equipped`.
- Frontend must not mutate `hero_equipment` directly.
- Equip/unequip must go through canonical DB/RPC workflow.
- Item statuses include `active`, `scrapped`, `locked_trade`, `locked_auction`.

Equipped usable item statuses are:

- `active`;
- `locked_trade`;
- `locked_auction`.

Locked trade/auction items reserve the item for workflow and block duplicate listing/scrap/vendor sale, but do not block wearing the item. Locked items still count for current loadout and runtime equipment effects while equipped.

Ownership transfer or scrap clears the item from the previous owner's equipment. A player may manually unequip locked items. There are no cursed/non-removable items in the current equipment foundation.

## Scrap, vendor sale and recovery

Vendor/system scrap/sell uses drachmas and is not player trade.

Frontend must call the canonical vendor scrap/sell workflow and must not compose item lifecycle updates and resource updates in Angular.

Rules:

- Active equipped items may be scrapped or sold to vendor; this auto-unequips the item.
- UI should not require confirmation for every scrap/vendor sale, because players may clean many items.
- Items without affixes are hard-deleted from the database on scrap.
- Items with affixes move to `scrapped` state and are recoverable only through staff/admin/operator workflow.
- Scrapped affix items are automatically cleaned after a configurable retention period, default 30 days.
- Historical references such as trade offers, counteroffers or reports do not justify retaining no-affix items.
- Staff/admin recovery, transfer, sanction and lifecycle corrections must be audited.
- Normal player equip/unequip changes are not classic audit-log workflows and should not require user-provided reasons.

## Item requirements

- Item requirements are equip/use requirements, not item generation requirements.
- Requirements apply to normal equip and bulk equip.
- Requirements are checked at equip time.
- If a hero later stops meeting requirements, already equipped items remain equipped.
- Item requirements may use hero level and primary/base stats.
- Item requirements do not use resources, Prestige, building level, district access or Trade Routes.
- Concrete `items.id` rows must not have arbitrary unique requirements.
- Requirements derive from definitional item layers: base, prefix, suffix and quality requirement multiplier.
- Requirements from base/prefix/suffix are aggregated by a global item requirement rule.
- Highest requirement is the base; lower requirements add configurable partial contributions.
- Quality has a separate requirement multiplier independent from quality bonus/value multiplier.
- Candidate item bonuses cannot help that same item meet its own requirements.
- Already equipped items may help meet requirements for another item.
- Items equipped earlier in a bulk operation may help later items.

## Item bonuses and runtime loadout

- Item bonuses from base/prefix/suffix sum absolutely.
- Runtime loadout usable statuses are `active`, `locked_trade` and `locked_auction`; `scrapped` is excluded.
- Any resolver that ignores equipped locked trade/auction items is inconsistent and must be corrected.
- Equipment affects PvE, PvP, combat/autoresolve, manual combat, spy snapshots and runtime hero capability.
- PvE/PvP checks use current loadout at the relevant resolve/check moment.
- Manual combat must do per-turn loadout/stat checks.

## Slot compatibility and normal equip

- `item_generation_bases.base_type_key` is the source of truth for equip slot compatibility.
- `item_generation_bases.slot` is legacy/deprecated for equip workflow.
- One item cannot occupy multiple slots.
- One slot cannot contain multiple items.
- Normal equip may receive explicit `slot_key`.
- With explicit `slot_key`, RPC attempts the literal target slot if compatible.
- Without explicit `slot_key`, RPC uses default behavior for item base type.
- Failed normal equip must not remove the currently equipped item being replaced.
- RPC result must show what was equipped, shifted, unequipped, failed/skipped and final equipment state; exact payload shape is DB/RPC detail.

Hand rules:

- Hand slots are `main_hand` and `off_hand`.
- Two-handed and ranged weapons use both hands and are stored in `main_hand`.
- Shields are off-hand only.
- One-handed weapon rotation is deterministic: current `off_hand` → `main_hand`, new item → `off_hand`, old `main_hand` unequipped.
- If hands are empty and no explicit slot is passed, one-handed weapon uses `main_hand` by default.

Ring rules:

- Ring slots are `ring_1` and `ring_2`.
- Ring rotation is deterministic: current `ring_2` → `ring_1`, new ring → `ring_2`, old `ring_1` unequipped.
- Explicit ring slot replaces that literal slot if compatible.

Bulk equip:

- Processes items in explicit input order.
- Equips what can be equipped and reports failures.
- Failure of one item does not stop the whole operation.
- Failed items should not unnecessarily remove current equipped items.
- Each step sees loadout produced by earlier successful steps.

## Presets / loadout presets

- The word `set` is reserved for future item set bonuses.
- Saved equipment configurations are called `preset` / `loadout preset`.
- Presets are convenience workflow, not item-set-bonus mechanics.
- Presets store exact `item_id` values per literal slot.
- Presets do not match by name, base, quality, prefix, suffix or similarity.
- Preset apply uses literal saved slots and does not use hand/ring rotation.
- Preset apply equips available items from the preset and does not touch the rest of current equipment.
- Preset apply can partially succeed.
- Preset preview should show which saved items are available, missing/unavailable and their saved slots.
- A preset that was legal when saved may re-equip the same exact item ids without rechecking item requirements.
- Presets can be edited, renamed, cleared or overwritten.
- Presets are not deleted; a hero has a fixed number of preset slots.
- Target range is 5–10 presets per hero; final count should be flat configurable value, not formula.
- Presets should be stored relationally, not as JSON authority.

## Armory shelves

- Armory shelves are inventory organization, not equipment state.
- DB/code may use `shelf`; final UI naming belongs to UI/UX backlog.
- There are always 10 player-organizable shelves, numbered `1` through `10`.
- Dropped/newly generated items enter shelf `0`, meaning unsorted / no player shelf.
- `hero_armory_shelves` stores hero-local shelf names for shelves `1` through `10`.
- `items.armory_shelf_position` stores item shelf number; `0` means unsorted/no shelf.
- Item shelf number persists when item transfers to another hero, even though the target hero may have a different local shelf name.
- Armory building level affects how many items are visible in armory.
- Items outside visible range do not disappear; they disappear only through explicit scrap/transfer/lifecycle workflow.

## Trade and auctions

- Player-to-player trade uses Character Points.
- Drachmas are vendor/system/building currency, not player-to-player trade currency.
- Items are not copied on transfer. Ownership changes through DB/RPC workflows.
- Direct trade and one-item auction workflows are DB/RPC-owned.
- Angular must not directly mutate critical trade/auction tables.
- Trade/auction audit is DB-owned through triggers/helpers. Frontend must not manually write lifecycle audit rows.

Pending future decisions:

- watched auctions and watched-auction notifications;
- minimum bid increment;
- allowed custom bid amount;
- timing and anti-snipe/end-extension behavior;
- Trade Routes/building-level effect on combined active offer-slot limit across auctions and direct trade;
- received direct trade offer should not consume receiver slot until receiver responds with their own counteroffer/commitment.

---

# 8. Estate and buildings

## Estate addresses and relocation

Empty estate addresses are not rows. The database stores occupied estates only.

`district_code + address_number` is the source of truth for estate address identity.

`estates.address` remains legacy/display compatibility. New code should format addresses from `district_code + address_number`. When final code dependency on `estates.address` is removed, Codex must report it as a DB cleanup candidate.

Current district capacity values:

- A = 5000;
- B = 3000;
- C = 500;
- D = 50;
- E = 1.

Moving to an empty address is destructive and DB-owned. It deletes current estate row and its buildings/jobs via cascade, then creates the new estate at the selected empty address. It is not siege/takeover.

Siege/takeover of an occupied estate is future guild/PvP workflow and must not delete estate/building state as if it were relocation.

If an estate changes owner during successful siege/takeover while a building job is active, the job is interrupted/cancelled. The building remains at its pre-job level. Active construction job does not transfer with the estate.

## Cooldowns and protection

Relocation and future siege/takeover cooldowns are DB/config-owned, not frontend constants.

Defaults currently assumed for design/balancing:

- active estate relocation cooldown: 12 hours;
- outgoing siege/takeover cooldown after successful move/process completion: 12 hours;
- defender protection window after incoming siege/takeover event: 12 hours.

Defender siege/takeover protection blocks new incoming sieges/takeovers but does not block that hero from initiating outgoing siege/takeover.

An active incoming siege/takeover blocks voluntary relocation by the target owner/hero; defender cannot escape a contested estate to deny the attacker outcome.

Siege/takeover-specific protection is separate from ordinary PvP attack target protection.

## Building construction/upgrades

Building construction/upgrades are DB-owned:

- one active estate building job per estate;
- player-facing cancel is not part of MVP;
- completed jobs are lazy-finalized;
- start upgrade workflow evaluates assigned building formulas server-side, spends resources through resource ledger, creates job and writes audit.

Building UI may preview formulas, but authoritative cost/time is calculated in DB/RPC.

---

# 9. Rewards, reports and notifications

## Reward configuration

Reward configuration must be DB-backed and explainable. A technically writable admin UI is not sufficient if the admin cannot understand what is being configured.

Decisions:

- Reward outcome kinds are DB-backed runtime-facing dictionary values.
- Reward profiles and reward profile entries are governed admin/balancer content.
- Reward profile assignments validate source kind and outcome kind against dictionaries.
- `source_kind = test` is technical/admin/sandbox only, not normal player gameplay.
- `outcome_kind` should be semantically valid for the source that can emit it.
- Reward amount/item-count behavior, including Luck-aware behavior, belongs to DB/RPC/formula contracts, not Angular-side calculations.
- L12/L13-style UIs must explain reward assignments and consume DB-backed labels/descriptions/helper/admin descriptions instead of inventing permanent Angular-only copy.

## Game reports

Game reports are player-facing gameplay reports. They are not audit logs and not player abuse reports.

A report should reproduce the same core event view the player saw in-game. Private Reports UI renders it inside normal app shell. Public link renders the same report content without app shell.

Decisions:

- Public route is conceptually `/report/:publicToken`.
- Use public token, not internal report id, for public access.
- Reports are shared per event. Multiple heroes can have private access to the same report through access rows/roles.
- Removing a report from a hero's Reports list removes that hero access row. If final access row is removed, the report row is deleted and the public token stops resolving.
- This is gameplay/report cleanup, not audit deletion.
- Current report type dictionary values include `combat`, `trial`, `encounter`, `pvp_combat` and `siege`.
- Combat reports wrap combat results and must not duplicate combat attack rows; renderers should read durable combat result snapshot tables.
- Trial/encounter reports should later wrap outcome, reward grant data and optional combat sections.
- PvP and siege report producers belong to future PvP/siege epics where applicable.

Reward/drop item references:

- Reward/drop item references are public showcase item references.
- If dropped item still exists, renderers should prefer live item row/current balanced item card.
- If item row is gone, renderers fall back to saved component refs and fallback display name.
- Reward/drop report references intentionally do not snapshot final item stats forever. Reports show living item when it still exists.
- Combat attack source labels can be public, but full private player equipment/loadouts must not be exposed by default.
- Drop rewards are showcase items; used weapons/equipment are not automatically full public item cards.

## Notifications

Notifications are persistent inbox/bell entries for short attention or status events.

Notifications are not game reports, audit logs, player abuse reports or local UI-only toasts/messages.

Decisions:

- DB notification row is durable source.
- A toast is only frontend presentation of a fresh notification row when recipient is online and notification type enables default toast.
- Reports have their own Reports inbox and unread badge.
- Do not create default `game_report.created` notifications for ordinary report creation.
- Recipient kinds are `user`, `hero` and `staff`.
- Severity values are `info`, `notice`, `warning`, `critical`.
- Frontend must not insert notification rows directly.
- DB/RPC workflows create notifications.
- Frontend may mark/read or dismiss current-user notifications through approved workflows.
- Notification title/body/action URLs are concise attention messages, not historical item/report snapshots.

DB-owned notification hooks currently cover direct trade, auctions, declarations, abuse report decisions, anti-abuse case attention, sanctions and Character Point penalties.

---

# 10. PvP and Prestige

## PvP Foundation

PvP Foundation is target architecture foundation, not a throwaway MVP. Future systems may remain unimplemented where their own foundations do not exist yet, but the PvP model itself should not be knowingly temporary.

Core decisions:

- PvP uses existing combat module/combat result snapshot model.
- PvP supplies hero-vs-hero combatants and interprets the result.
- Defender is another hero/player, not an admin-defined opponent.
- PvP combat reports use `pvp_combat`, not plain low-level `combat`, when combat is part of PvP.
- PvP notifications are after-the-fact result notifications. Do not create incoming-attack notification by default.
- Manual fight window applies to attacker only. If attacker misses configured window, future runtime should auto-resolve.
- Combat uses current loadout/stats at fight start/resolve time, not at attack-click/travel-start time.
- Derived combat stats are resolved on the fly through current derived stat/equipment/bonus/formula runtime. Do not reintroduce `hero_derived`.

Targeting, travel and protection:

- Targeting is estate/vicinity based.
- Attack level range is configurable through DB formula/config, not hardcoded.
- Attack travel time is configurable through DB formula/config.
- Spy travel time is derived from attack travel time through configurable formula; current default is attack travel time divided by 3.
- Target protection starts when attack starts, not when it resolves.
- One incoming attack per target may be active at a time.
- Protection duration is configurable and may support district-dependent behavior.
- Protection may be visible as target/vicinity state, but defender should not receive incoming-attack notification by default.

Spy:

- Spying creates durable spy result snapshot/report-ready object, not transient toast only.
- Spy may show current equipment, derived combat stats, resource amounts and estate/building state.
- Spy must not show active exploration/PvP state or staff/admin/private internals.
- Spy results may later become shareable/public through controlled report/surface; current private read is owner-safe.

PvP rewards/resources:

- PvP reward routing should use existing reward foundation for XP where possible.
- Canonical PvP reward outcomes are `attacker_victory`, `defender_victory`, `draw`.
- XP rewards are configurable and level-difference aware.
- Character Points are not a separate PvP reward. CP comes from XP through XP → gross CP progression rule.
- Resource steal/loss is not an ordinary reward profile entry. It is PvP-owned resource transfer/consequence workflow.
- PvP resource consequences are limited to `drachma`, `materials` and `workforce`.
- PvP attack consequences do not include item transfer/steal/destruction, building loss, Character Point theft or estate ownership transfer.

Runtime/activity/anti-abuse:

- Central runtime activity model covers `exploration`, `pvp_attack`, `pvp_spy` and future `siege`.
- Daily action counters are counters/limits, not runtime activity locks.
- Anti-abuse signals are review aids, not automatic punishment.
- Relationship declarations provide context and must never automatically suppress signals.
- `mercenary_contract` is a case-by-case declaration, not permanent mercenary status.
- Mercenary contracts use Character Points as declared payment channel, require amount and expiration, and may involve more than two participants.

Future boundaries:

- Siege is future guild/multiplayer PvP and remains inactive until guild/siege systems exist.
- Own-guild attack/siege restriction must be enforced when guild membership exists; do not create fake guild system inside PvP Foundation.
- Equipment equip/unequip workflow belongs to item/equipment foundation. PvP must not invent equipment mutation workflow.

## Prestige Foundation

Prestige is a long-term reputation/sława system for a hero. It is not level, XP, Character Points, guild reputation, anti-abuse sanctioning or a server-wide score.

Core model:

- Prestige is hero-scoped and server-scoped.
- Prestige belongs to hero, not account, guild or whole server.
- Prestige is separate from level, XP and Character Points.
- Prestige has hidden points and visible rank.
- Prestige points cannot fall below `0`.
- Prestige has no decay.
- Prestige is DB/RPC-authoritative. Angular must not calculate durable points, rank, PvP delta or final outcome.
- Prestige is not anti-abuse. It can discourage dishonourable PvP farming but does not replace moderation/sanctions/review.

Visibility:

- Players can see their own Prestige rank.
- Players can see other heroes' Prestige rank where public/player-facing hero identity is shown.
- Players must not see raw Prestige points or numeric deltas.
- Admin/tester/sandbox UI may show raw points/delta, thresholds, source kind/entity, formula/config context and before/after rank/points.
- Player-facing rank names/descriptions/helper text should come from DB/config/metadata.

Ranks:

- There are 5 Prestige ranks.
- Canonical mapping:
  - Rank 1 / District A: `Perioecus`;
  - Rank 2 / District B: `Ephor`;
  - Rank 3 / District C: `Strategos`;
  - Rank 4 / District D: `Archon`;
  - Rank 5 / District E: `Basileus`.
- `Basileus` is canonical form for rank 5.
- Rank registry should use technical ID plus separate `rank_number`.
- Existing `ranks.required_level` and `ranks.max_players` are legacy relative to Prestige model.
- Rank thresholds should be admin-configurable, preferably explicit per-rank thresholds.
- Suggested default thresholds: `0 / 100 / 350 / 900 / 2000`. These are balancing defaults, not Angular constants.

Sources and scoring:

- Prestige v1 is PvP-driven.
- Trial/PvE, Guild and Siege actions do not grant Prestige in first foundation.
- Guild actions do not affect member private Prestige in first foundation.
- Future source kinds should be DB/config-driven where practical.
- PvP Prestige is based on honour, challenge and shame, not victory alone.
- Target strength is classified by target position inside legal PvP target range, not raw absolute level difference only.
- Default banding is `20 / 60 / 20`: weaker / similar / stronger. Banding should be admin-configurable.
- Attacker penalties are harsher because attacker chooses target; defender penalties are softer because defender does not choose fight.
- Numeric scoring seed may exist in DB config but must not be hardcoded in Angular.

Reports/notifications:

- Every PvP Prestige delta should appear in PvP report/result as player-safe qualitative Prestige change summary.
- Player-facing reports must not expose raw Prestige points or numeric delta.
- Ordinary point changes without rank change should not create separate notification.
- Persistent notification should be created when Prestige rank changes.
- Rank-change notifications must not expose raw points, numeric delta or formula/debug context.

Districts/buildings:

- Prestige rank gates district privileges: A/B/C/D/E require ranks 1/2/3/4/5.
- Falling below current district rank requirement does not delete estate, delete buildings, downgrade buildings or force relocation.
- Existing buildings keep working after Prestige loss.
- Already-started building jobs/upgrades may finish even if Prestige drops.
- A hero may only start new building construction/upgrades whose Prestige requirement is met.
- A hero below current district requirement cannot relocate within that higher district and cannot move to a higher district until requirement is met again.
- `buildings.rank_required` exists, but central requirement foundations also exist. Migrator must avoid two conflicting canonical sources.

---

# 11. Guilds

The first guild foundation should be deliberately simple. Guilds primarily support shared item logistics, future Argonautics/group expeditions and future siege/defense support. Do not turn guilds into a broad parallel progression empire by default.

## Scope and non-goals

Guilds support:

- membership;
- roles;
- invite/request-to-join;
- guild armory loans;
- emergency leader election;
- future hooks for siege and Argonautics.

Guilds do not currently implement:

- diplomacy/alliance/NAP/war diplomacy system;
- district influence;
- guild reputation;
- guild buildings in first foundation;
- generic assistance by arbitrary non-guild friends.

Guild actions do not affect a member's private Prestige/reputation in first foundation.

Help from other players in siege/defense or Argonautics should be organized through guild membership. Solo attempts may exist, but group support uses guild.

## Identity, creation and membership

- Guild is server-scoped.
- Guild membership is hero-based, not user-based.
- A hero may belong to only one guild on a server.
- Any active hero without a guild may create a guild.
- Creating a guild has configurable cost.
- Guild name must be unique on server.
- If guild tags are introduced, they should also be unique on server.
- Membership can start through guild invite or request-to-join.
- Invite and request-to-join are both first-foundation flows.
- A leader cannot simply leave guild. Leader must dissolve guild or transfer leadership through approved workflow.

## Roles and permissions

- Guild role model should support leader, officer and member-style permissions.
- Exact technical role keys belong to DB implementation.
- Leader/officer/member permissions must be explicit and not inferred only from UI.
- Role management/promotion/demotion/kick flows need approved DB/RPC workflows before frontend mutation.

## Member limit and inactive leader

- Guild member capacity depends on leader hero level.
- Member capacity is calculated through admin-configurable formula/config.
- Inactive leaders create a real growth problem because their level does not increase.
- Emergency leader election exists to handle inactive leader cases.
- Exact inactivity threshold, nomination duration, voting duration and candidate count are config-owned.

## Emergency leader election

- Emergency leader election is for inactive leader recovery, not ordinary politics.
- Candidate eligibility and voting rules belong to DB/RPC design.
- Emergency election should preserve guild continuity and auditability.
- It should not erase guild history.

## Guild armory and loans

- Guild armory is shared item logistics, not ownership erasure.
- Deposited item remains owned according to DB lifecycle/ownership model but becomes available through guild armory workflow.
- Borrowed guild armory items can affect runtime loadout while active/borrowed.
- Loans do not expire in first foundation.
- A loan ends through borrower return, owner/officer/leader force return/removal, owner withdraw, ownership change, scrap, owner/borrower leaving guild or guild dissolution.
- Borrowed item handling must be DB/RPC-owned and must not be faked in Angular.

## Guild armory shelves and capacity

- Guild armory may use shelves; DB/code may use `shelf`.
- Guild armory can mirror 10-shelf player armory unless DB implementation finds a better reason not to.
- A deposited item keeps its shelf number.
- Guild armory capacity is configurable.
- `0` capacity means unlimited.
- Capacity counts every item assigned to guild armory, including currently borrowed items.

## Guild dissolution

- Only leader can dissolve guild.
- Dissolution should end active guild armory loans.
- Borrowed items should be unequipped/removed from borrowers when loans end through dissolution.
- Guild armory items return to owners' private state.
- Membership becomes inactive/dissolved according to DB workflow.
- Guild history should remain available for logs/anti-abuse; dissolution must not erase everything without trace.

---

# 12. Server Events and Server Council

## Server Events

Server Events are global, temporary, server-scoped events that affect every hero on a server. They are not per-district, per-guild, per-rank, per-origin or per-player events. They are intended to be rare, powerful and lore-forward rather than a constant rotation of small buffs.

DB/RPC Server Events foundation exists. First frontend integration should consume active-event read models and admin/config paths after generated Supabase types are current. Player surfaces should use DB/RPC read models such as `get_active_server_event(...)`; Angular must not calculate or apply Server Event effects as authority.

Core decisions:

- A Server Event affects the whole server and every hero on that server.
- No sub-scopes in v1: no district/guild/origin/rank/player-group targeting.
- Only one Server Event may be active on a server at a time.
- Server Events are temporary and have start/end semantics.
- Events can be positive, negative or mixed.
- Negative events are valid events, not separate rarer category.
- Event definitions should be internally coherent and lore-driven.
- Preferred design is one strong effect or simple coherent bundle, not random pile of tiny modifiers.
- Event names/descriptions/helper text/player-facing copy are DB/admin-configurable and must not become permanent Angular hardcode.

Effect semantics:

- Server Events may affect base stats, all stats, Luck, derived stats and combat-derived values such as HP, evasion chance, critical chance and critical damage.
- Server Events may affect combat through stats, derived stats and runtime bonus inputs.
- Server Events must not directly alter manual minigame mechanics such as Walking Dead speed or input timing.
- Server Events may apply requirement modifiers such as `-15%` to normal requirements.
- Requirement modifiers apply to item/building-style requirements, not Prestige/district gates or political access thresholds.
- Requirement modifiers are runtime modifiers and do not permanently rewrite definitions.
- If an action is valid while event is active, normal persistence rules apply; already equipped items do not fall off and already-started building jobs/upgrades continue normally.
- Server Events are not primarily economy system in v1. They may indirectly affect drops through Luck, but do not start from production/cost economy events unless later design expands them.

Runtime/authority:

- Server Events should not permanently mutate hero stats, Luck, HP or similar hero fields.
- Treat active event as runtime bonus/debuff source.
- Final effective runtime value = hero baseline + active bonus sources including active Server Events.
- Migrator owns whether event effects directly reuse bonus system or use separate event-effect layer mapped into runtime resolvers.

Activation/scheduling:

- Admin/operator tooling may manually start event.
- Manual start ignores cooldown.
- Cooldown counts from actual event end, including manually started events.
- Manual end/reschedule is not normal production flow but may exist as admin/sandbox/emergency correction tooling.
- Automatic system roll can start events after configurable cooldown.
- Default automatic cooldown: 14 days.
- Default automatic roll chance: 10%.
- If automatic roll succeeds, system picks one active eligible event uniformly from pool.
- Events do not have weights in current design.
- Automatic events can start even if no players are online.

UI boundary:

- Player UI needs one compact active Server Event indicator.
- If no event is active, indicator may show no active Server Event.
- If event is active, indicator should show lore name, description and major effects.
- Full event page, large banner, report or notification spam is not required for v1.

## Server Council

Server Council is future Epic AA. It is a lightweight political/prestige feature that gives high-district estate ownership additional meaning. It is not part of first Server Events foundation and should not be implemented inside Server Events foundation.

Core scope:

- Server Council v1 exists only to choose Server Events.
- It is not parliament, budget, tax, punishment, veto, guild governance or full political simulator.
- Council exists to give additional meaning to high districts D/E and especially E1 estate.
- Council should be planned after Prestige and Server Events foundations are available.

Membership/eligibility:

- Council membership is based on current estate ownership in districts D and E.
- District C is not part of Council v1.
- Council size follows current D/E estate capacity; it is not separate hardcoded limit.
- No terms, campaigns, candidate lists or Council elections.
- A hero that loses D/E estate loses Council membership.
- A hero that gains D/E estate enters Council if other eligibility is satisfied.
- Falling below required Prestige threshold suspends voting rights but does not evict hero or remove estate.
- Suspended/banned server membership cannot vote.
- Being in Council does not grant/remove Prestige by itself.
- Council does not directly punish players. The only negative effect a Council decision may create is choosing a negative Server Event.

Activation/voting:

- Council-driven voting may begin once at least 20 district D estates are occupied.
- This threshold should be DB/config-owned.
- If threshold is not met, Server Events may still start through admin/system activation; only Council voting is unavailable.
- Council votes over a pool of Server Event proposals.
- Default proposal count is 5 and should be configurable.
- Each eligible Council member has one vote.
- Vote can be changed until voting closes.
- Not voting is non-participation and has no penalty.
- Voting results are not visible while voting is open.
- Non-Council players may see public state such as “the Council is deliberating”; proposal list/live counts are not required for them.

E1 / Basileus tiebreaker:

- Tiebreaker is the hero currently holding estate E1.
- It is not every hero with Prestige rank `Basileus`.
- If tied and E1 holder voted for one tied option, E1 vote breaks the tie.
- If no eligible E1 holder or E1 vote does not resolve tie, run runoff.
- Runoff lasts 24 hours by default and includes only tied options.
- If runoff remains tied, randomly select one winner from still-tied options only.
- Do not use “first proposed wins”.

Out of scope for v1:

- Council terms/campaigns/elections;
- Council ranks beyond E1 tiebreaker;
- budget/taxes/veto;
- formal guild voting blocs;
- public debates;
- voting rewards;
- punishment for not voting;
- player sanctions or disciplinary decisions.

---

# 13. Config governance, formulas and admin explainability

## Configuration governance

Config changes must be reasoned and grouped in change sets.

Config definitions are registry/governance layer, not replacement for relational domain tables.

Critical config/value/entity edits should flow through DB/RPC/governance contracts, not direct Angular writes.

`global_value_change` and `server_value_change` entries must not misuse `entity_id`. Those entries use config definition, optional server, `field_path = value_json`, old/new values and metadata. Entity edits use `entity_field_change`.

## Formula runtime

- Angular formula evaluation is admin/preview/explainability only.
- Durable gameplay workflows must evaluate assigned formulas server-side.
- Frontend formula results must not be trusted for persistent mutations.
- Lookup order for formula-driven runtime paths should be local entity assignment → global/default assignment → explicit fallback/config error.
- Avoid duplicating formulas in generic config JSON where relational formula system exists.

## Admin configurator explainability

Every epic that introduces or consumes admin-configurable gameplay objects must include admin/operator/balancer explanation surface for those objects.

Admin UI must explain:

- what the object configures;
- where it is used;
- whether it is global, server-scoped, entity-scoped, reusable library content or technical metadata;
- what runtime/gameplay effect configuration has;
- which DB dictionary/helper/admin text is displayed;
- which mutation path/RPC owns durable changes.

Raw keys/UUIDs are secondary metadata only. Missing/weak DB dictionary text is a DB/content seed gap, not something to hide with permanent hardcoded Angular copy.

For new feature epics, explainability belongs inside the feature epic. Do not defer new-feature explainability into retrospective UX-CFG cleanup.

Section-level runtime meaning and impact should be DB-backed, usually via UI metadata entries. Ordinary field labels, small validation messages and translation polish may later move to i18n/refactor backlog.

Domain dictionaries remain source of truth for values such as resource types, reward outcome kinds, combat candidate kinds, equipment modes and stats.

If frontend reports missing metadata keys, prefer adding exact missing metadata rows/aliases as content seed rather than hardcoding permanent domain copy in Angular.

## Admin IA

Admin UI should be organized by work intent, not raw table names.

Recommended groups:

- Overview;
- Global Governance;
- Game Balance;
- Server Operations;
- Moderation & Anti-abuse;
- Gameplay Tools / Sandbox.

Epic R / Ref A style admin IA is layout hygiene, not final visual redesign. Final visual style, spacing, iconography and design-system decisions remain in UI/UX backlog.

## Backlog split

Implementation backlog is split into:

- main feature backlog — active feature/foundation epics;
- Codex Mythsworn Refactor Backlog — refactor/cleanup/retro epics.

Refactor backlog uses `Epic Ref A`, `Epic Ref B`, etc. to avoid colliding with main feature backlog letters.

Historical priority/update blocks preserved in refactor backlog are not current execution order and must not override current epics or current DB/docs.

---

# 14. Known planning gaps and future notes

These notes are preserved for future planning. They are not current task scope unless the user explicitly promotes the topic.

## Current known foundation gaps

- Player-facing equipment equip/unequip needs approved DB/RPC workflow before Angular mutates equipment state.
- Auction watchers are future side note.
- Auction rules/configuration are future side note.
- Full siege/takeover remains future guild/PvP workflow.

## PvP / siege future notes

- Attacks must be limited by allowed level range. Low-level player cannot attack far higher-level player and vice versa.
- A player cannot attack members of their own guild.
- Attack travel time depends on distance between estates/addresses; nearby targets take less time than far-away targets.
- Spying is shorter than attacking.
- Spying has no level range restriction and can target own guild members, but still uses distance-based travel time.
- Sieges have no level range limit but cannot be declared against own guild members.

## Player bug reporting system

Plan a separate player/user bug reporting system later. Preferred direction: in-game bug report form that sends email and creates external board task, e.g. Trello, Jira or GitHub Issues. A Mythsworn admin-panel record may also be useful, but an external board is preferred for real triage/tracking.

This is a future product/ops workflow, not part of current PvP Foundation DB work.

## Note preservation rule

When future notes are moved into canonical docs as pending/future decisions, they must remain discoverable. If later conversation starts discussing PvP, auctions, Trade Routes or bug reporting, remind the user that these notes already exist.
