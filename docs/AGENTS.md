# AGENTS.md — Mythsworn implementation guidance

## Purpose

This file is the short execution-oriented guide for coding agents working on **Mythsworn**.

Prefer this file for fast implementation context. For broader detail, also consult:

- `database-current.md`
- `current-decisions.md`
- `project-context.md`
- `codex-Mythsworn-backlog.md`
- `current-state-summary.md`
- `current-todo.md`

If there is a conflict, prefer:

1. explicit user instruction;
2. current live database / migrations / dump and user-provided `database.types.ts` input;
3. `database-current.md` as the semantic DB/RPC/helper registry;
4. `current-decisions.md`;
5. `project-context.md`;
6. this file.

Older Monster Hunt / Mythborne wording may remain in legacy source files, but new implementation, UI-facing text and documentation should use **Mythsworn** unless the user explicitly asks otherwise.

---

## Operating rules for Codex runs

- Use Polish for Codex prompts/comments unless the user requests otherwise.
- Preserve exact filenames.
- Before starting a new backlog task, run `git status --short`; if the working tree is not clean, report it and wait for the user decision.
- Do not modify `current-todo.md`, `current-state-summary.md` or backlog task statuses unless the user asks or confirms task completion.
- Always check current generated types/schema when implementing schema-sensitive logic.
- Treat `src/app/core/types/database.types.ts` as **read-only user-owned generated input**. Codex must never edit, regenerate, partially patch, reformat or “fix” this file. If generated types are missing, stale or incompatible, report a DB/types blocker and wait for the user/migrator to update them.
- Do not invent tables, RPC names, helper names, enums or migration behavior that are not in current DB/migrations/docs.
- Use DB dictionaries/configs instead of hardcoded gameplay/config lists.
- Keep critical gameplay/economy/admin mutations behind canonical domain/RPC/governance paths.
- Preserve `reason`, `description`, `status_reason`, `helper_text`, `admin_description` and audit-relevant context wherever applicable.
- If a needed DB contract is missing, report a DB/types blocker instead of creating a frontend fallback.
- After each task, report exact changes, verification results and acceptance-criteria status. Wait for user confirmation before marking anything complete.

---

## Tech stack

- Angular 21
- zoneless
- signals-based
- modern Angular only
- PrimeNG UI patterns where used by the project
- Supabase / PostgreSQL backend

Prefer:

- signals, computed signals and effects where appropriate;
- typed domain models;
- mappers from backend/generated rows to domain/UI models;
- modular feature boundaries;
- DB-backed dictionaries and metadata;
- backend/RPC/domain operations for persistent workflows.

Avoid by default:

- promise-heavy architecture when signal composition fits better;
- outdated Angular patterns;
- zone-dependent assumptions;
- legacy Angular habits;
- hardcoded gameplay constants that are likely to be balanced later;
- exposing raw generated DB rows as long-term domain models.

---

## Project and source-of-truth discipline

- `database-current.md` is the semantic DB/RPC/helper registry.
- `current-decisions.md` is the active decision log and overrides older concept docs.
- `project-context.md` is the short operational implementation context.
- `codex-Mythsworn-backlog.md` is the practical Codex task queue.
- `current-state-summary.md` and `current-todo.md` are progress/status files, not schema sources.
- Old uploaded concept files can explain history, but they must not override current DB/migrations/decisions.
- `database.types.ts` is generated input owned by the user/migrator. It can be read by Codex but never changed by Codex.

When a current file and a legacy concept file disagree, prefer the current schema and current docs.

---

## Generated database types are read-only

`src/app/core/types/database.types.ts` is generated and user-owned. Codex must not modify it under any circumstances.

Forbidden actions:

- editing `database.types.ts` manually;
- regenerating `database.types.ts`;
- patching one or two generated fields to make TypeScript pass;
- formatting or reordering generated content;
- including `database.types.ts` changes in a feature diff;
- claiming generated type changes as Codex work.

Required behavior when generated types are stale or incomplete:

1. stop the feature implementation;
2. report the exact missing/incompatible function/table/field/type;
3. explain which code path is blocked;
4. ask the user/migrator to regenerate or fix the DB/generated contract;
5. do not create Angular fallbacks or manual interfaces to hide the missing contract.

Manual TypeScript interfaces for generated RPC rows are forbidden unless the user explicitly approves a temporary contract gap workaround. Even then, report it as temporary debt.

---

## Shared code reuse and extension policy

Before adding new code, Codex must first check existing shared/project patterns.

### Required lookup order

When implementing forms, validators, mappers, options, metadata helpers, RPC helpers, or domain utilities, first check and prefer:

1. `core/factories`
2. `core/validators`
3. `core/utils`
4. existing form config files using `FormFieldConfig`
5. existing domain models and mappers
6. existing constants in `core/constants`
7. existing services/RPC helpers

Do not add a new domain-specific utility, mapper, factory, validator, or helper until existing shared options have been checked.

### Forms

- Form construction should use an existing factory pattern where available.
- New form creation logic should normally live in a factory, not grow large page/action files.
- Validators must reuse `core/validators` wherever possible.
- If a new validator is needed, prefer adding a generic validator to `core/validators` when it can apply across domains.
- Feature-local validators/helpers are acceptable only when genuinely domain-specific.

### Form configs and renderers

- Prefer existing `FormFieldConfig` patterns for repeated form field definitions.
- If an existing generic renderer cannot be used safely, explain why.
- In particular, do not use a renderer that wraps PrimeNG `p-select` inside a native `<label>`, because that has caused selection bugs.
- When a generic renderer is unsafe, use a feature-local config/helper only as a constrained workaround and document the reason.

### Utilities and mappers

- Do not create new `core/utils/*` files for feature-specific behavior.
- Feature-specific helpers should stay near the feature unless they are genuinely reusable across multiple domains.
- Domain mappers should not duplicate generic mapper/helpers already available in `core/utils`.
- Constants should go in `core/constants` only when they represent a shared runtime/DB contract. Feature-only constants should remain feature-local.

---

## Touched-file cleanup and code reduction policy

When modifying production TypeScript or HTML files, especially services, facades, mappers, utilities and standalone components, Codex must check whether the touched file contains code that is now unused, duplicated, obsolete or kept only because of previous workaround iterations.

This is not permission for broad unrelated refactors. Apply this policy to:

- files touched by the current task;
- directly imported helper/mapper files when the current change makes an old path obsolete;
- tests that preserve old behavior only because a previous workaround existed.

Do not expand cleanup into unrelated feature areas. If cleanup would affect unrelated flows, report a cleanup candidate instead of doing a broad refactor silently.

### Required cleanup check

For every touched production TS file above roughly 250 lines, and for every touched mapper/service/facade regardless of size, Codex must report:

- `imported by` — which files import this file;
- `exports used` — which exported symbols are still used and where;
- `private dead code check` — whether private functions/methods are still called;
- `obsolete workaround check` — whether older fallback paths became unnecessary after the current DB/RPC/read-model contract;
- `removed` — what was deleted instead of leaving legacy paths in place;
- `not removed because` — suspicious code intentionally left and why;
- `net code effect` — added/deleted line count for the touched area.

### Required behavior

- Prefer deleting obsolete workaround code over adding another wrapper/fallback.
- Do not keep tests that only preserve dead legacy behavior.
- Do not split a large file merely to hide line count; split only when responsibilities become clearer.
- Do not add a new helper or mapper if the simpler fix is to remove an obsolete branch from the existing one.
- If the new contract makes old frontend fallback logic unnecessary, remove the old fallback instead of layering the new path on top.
- If the current task cannot safely remove suspicious code, report it as a cleanup candidate with the reason.

### File size thresholds

- Production TS/HTML above roughly 250–300 lines is a warning.
- Production TS/HTML at 400+ lines in a touched file is a strong maintainability problem.
- Production TS/HTML at 600+ lines in a touched file should normally be reduced, split by responsibility, or explicitly blocked/deferred with a cleanup candidate.
- Long test fixtures are less risky than production code, but if they make review difficult or preserve obsolete behavior, extract or delete them.

### Required report section

Add this section to the task report when any touched production TS/HTML file crosses the warning threshold, or when a mapper/service/facade is touched:

```text
Touched-file cleanup:
- file:
- current line count:
- imported by:
- exports used:
- private dead code checked:
- obsolete workaround paths removed:
- suspicious code left:
- not removed because:
- net code effect:
- cleanup candidate needed: yes/no
```

---

## Required implementation report

Every implementation summary must start with:

1. task scope / what the task covered;
2. non-goals / what the task intentionally did not cover;
3. acceptance mapping;
4. verification;
5. clean-code check covering DRY, KISS, separation of concerns, touched-file cleanup and reuse of existing helpers/services/constants/factories;
6. explicit statement that manual smoke and route smoke were not run by Codex, unless the user explicitly asked Codex to run them;
7. a user-only manual smoke checklist when the task has a meaningful manual flow.

Every implementation summary must also include:

| Category | Required content |
|---|---|
| reused | Existing utilities/factories/configs/validators/services reused |
| checked but not reused | Existing shared code checked and why it was not appropriate |
| new | New helpers/factories/utils/configs/constants added and why they are feature-local or core |

### No retrospective refactor by default

Do not refactor unrelated legacy code merely to satisfy these rules unless the task explicitly asks for cleanup. Apply these rules to new or touched code. Larger cleanup belongs in a separate refactor task/backlog item.

### Shared code registry

When adding a new shared generic helper, factory, validator, renderer, or config pattern, update the shared-code registry document if one exists. The registry should help future work discover reusable project primitives without scanning the entire repository.

---

## Legacy DB cleanup candidates

When a task removes the last known code usage of a legacy table, column, RPC, helper or model, Codex must report it explicitly instead of silently leaving database debt behind.

Add this section to the task report when relevant:

```text
DB cleanup candidate:
- legacy object:
- previous usage:
- replacement path:
- remaining blockers, if any:
- safe to remove now: yes/no/unknown
```

Do not drop or migrate legacy DB objects unless the current task explicitly includes that migration. Report the cleanup candidate and wait for the user to approve a dedicated DB cleanup step.

Examples:

- `hero_derived` after runtime/stat/combat paths no longer depend on it;
- legacy building requirements;
- legacy bonus paths;
- transitional display columns such as `estates.address` after frontend moves to `district_code + address_number`.

---

## Canonical gameplay language

Use these terms consistently:

- **Exploration**
- **Trials**
- **Encounter**
- **Trial appearance**
- **Trial manifestation**
- **Trial completion**
- **Prestige**
- **Health**
- **Character Points**

Do not casually rename the main PvE loop back to “monster hunt” in implementation language.

Core in-world names should remain Greek across language versions. Localize descriptions and explanatory text, not the proper names themselves.

---

## Server / account / hero rules

- `auth.uid()` / `user_data.id` is the global account id.
- `hero.id` is the character id.
- `hero.user_id` is the owner account id.
- `hero.server_id` is the selected game server/world id.
- Never assume `hero.id === auth.uid()`.
- Load selected/current server first, then active hero for `user_id + server_id`, then use `hero.id` for hero-owned data.
- Server staff authority is server-scoped; do not infer that a global role automatically grants authority on every server.
- Normal staff gameplay on assigned standard servers is blocked by DB/helper policy; sandbox/testing contexts are explicit exceptions.

---

## DB/RPC/domain boundary

- Critical gameplay, economy, admin and workflow mutations must go through canonical DB/RPC/domain operations.
- Frontend must not direct-write runtime/workflow tables such as item ownership, equipment, armory moves, auctions, trades, estate jobs, resources, audit, sanctions or progression ledgers.
- Frontend must not call internal low-level helper RPCs unless the current docs explicitly declare them player/admin-facing.
- Use generated Supabase types for RPC args/returns whenever the function exists in `database.types.ts`.
- Codex may read `database.types.ts` but must never edit or regenerate it. If generated RPC types are missing or stale, report a blocker.
- Do not maintain manual TypeScript interfaces for generated RPC rows unless the generated contract is unavailable and the user explicitly approves a temporary workaround.
- If the DB/RPC/read-model contract does not expose data required by UI, report a blocker. Do not invent Angular-side authority.

---

## DB-backed dictionaries and metadata

- Labels, descriptions, helper text and player-facing classifications should come from DB dictionaries/read models/metadata when the DB owns the concept.
- Raw keys may be shown only as secondary technical metadata, not as the primary player/operator label.
- Do not hardcode permanent gameplay explanations in components when DB metadata exists or should exist.
- Missing DB-backed metadata should be reported as a gap, not permanently masked with Angular copy.
- For formula/help copy, prefer `get_ui_metadata_entries(...)` and the documented metadata namespace.

---

## Angular / PrimeNG / UI rules

- Prefer signals, computed signals and clear state boundaries.
- Prefer Reactive Forms for form workflows.
- Avoid deprecated PrimeNG APIs.
- Do not nest PrimeNG `p-select` inside a native `<label>`.
- Do not introduce local SCSS unless global utilities/vendor wrappers/shared patterns are insufficient.
- Do not copy prototype CSS into Angular components.
- Prototype HTML is visual reference only. Translate accepted patterns into global SCSS tokens, shared components, PrimeNG wrappers or documented layout utilities.
- `muted-text` is for labels, helper text and metadata. Do not use it for important decisions, reasons, warnings or operator/player outcomes.
- UI smoke must explain what the action means in gameplay/admin terms, not only which buttons were clicked.
- Route smoke `200` is not full smoke.

---

## Stale guards

Every async UI workflow that depends on selected entity, route id, active hero, selected server, target item, target hero, current case, current sanction, current penalty, selected item or access context must guard success and error paths.

Required behavior:

- stale success must not overwrite current state;
- stale error must not show after context changes;
- loading should end only for the active request/context;
- changing context should clear stale form state and feedback;
- if selected entity changes during a request, the response must be ignored.

---

## Manual smoke discipline

- Do not claim a player/admin workflow is complete only because `tsc`, focused specs or route smoke passed.
- If the user provides smoke feedback or a screenshot, treat it as authoritative evidence for that iteration.
- Pending manual smoke is acceptable only when the agent cannot access the required session, auth state, real data or gameplay producer.
- When manual smoke is pending, provide a short checklist with expected visible outcomes.
- If smoke fails, stop guessing and inspect the real DB/RPC/read-model contract or ask for the missing runtime payload.

---

## Stats, Character Points and progression

- Base stats come from the DB `stats` table. Do not hardcode old stat lists from legacy concept docs.
- Canonical current base stat keys are: `strength`, `dexterity`, `endurance`, `agility`, `cunning`, `charisma`, `wisdom`, `intelligence`, `spirituality`.
- Health means hit points.
- Character Points are progression/trade currency and are stored on `hero.character_points`; lifetime total is on `hero.total_character_points_earned` where needed.
- Character Point history lives in `character_point_ledger`.
- Do not store Character Points in `hero_resources`.
- Do not use Health/HP wording for Character Points.

### Stat allocation

- Final stat allocation save uses canonical `save_stat_allocation(...)`.
- Plus/minus UI clicks are local draft state and are not audited.
- Final save is the persistent/auditable mutation.
- Frontend must not direct-write `hero_stats`, `hero.character_points`, `character_point_ledger` or audit tables.
- Frontend must not call low-level audit helpers for stat allocation.

### Progression formulas

Use DB-backed formula targets instead of hardcoded frontend values:

- `hero_stat_upgrade_cost`
- `hero_stat_level_cap`
- `hero_experience_to_next_level`

Level-up persistence is not assumed complete just because the XP formula exists. Before implementing level-up, inspect current level/experience mutation paths and define the DB/RPC/domain workflow for adding XP, checking threshold, increasing `hero.level`, granting Character Points and writing ledger/audit.

---

## Runtime derived stats

Runtime derived/special stats must be resolved on the fly from:

- base stats;
- equipment;
- bonus dictionaries/templates/entity bonuses;
- derived stat definitions;
- formula assignments where applicable;
- active hero/server context.

Do not reintroduce `hero_derived` as runtime source of truth. If generated types still mention `hero_derived`, treat it as physical legacy until removed by a dedicated DB cleanup.

Important current semantics:

- `critical_damage` is a combat/derived stat and active bonus target.
- Base critical damage percent is `50`.
- Final crit multiplier is `1 + finalCriticalDamagePercent / 100`.
- Do not use the old hardcoded crit multiplier `x2` in new combat resolver work.

---

## Items, armory and equipment

Codex must treat the current item generation/equipment database model as authoritative:

- generated item model is `quality + optional prefix + base item + optional suffix`;
- base item types are in `item_generation_base_types`;
- required/optional native target rules are in `item_generation_base_type_targets`;
- concrete base item native values are in `entity_bonuses` with `entity_type = item_generation_base`;
- `item_generation_bases.base_type_key` is the source of truth;
- `item_generation_bases.slot` is legacy/deprecated;
- equipment state is in `hero_equipment`, not `items.status = equipped`;
- Armory shelf names are in `hero_armory_shelves`;
- item shelf position is `items.armory_shelf_position` and transfers with item ownership;
- visible Armory capacity uses existing bonus target `visible_item_capacity`;
- do not invent `armory_visible_capacity`;
- `attack_count` and `critical_damage` are bonus targets;
- item drachma value is economic/vendor context, not Character Points trade price;
- item value and item usefulness are intentionally separate.

Before coding against these structures:

1. read `database-current.md`;
2. inspect current migrations/dump and current user-provided generated types;
3. do not edit or regenerate `database.types.ts`;
4. do not create alternative table/RPC names;
5. report missing DB contracts as blockers instead of inventing them.

Armory rules:

- items do not disappear because they are not visible;
- Armory controls practical visibility/access/organization, not ownership existence;
- Armory visibility, shelves and item detail must come from DB/RPC read models;
- `get_hero_armory_items(p_hero_id)` is a list/read surface;
- `get_hero_armory_item_detail(p_hero_id, p_item_id)` is the canonical item detail surface;
- frontend must not reconstruct item stats from base/prefix/suffix tables when the detail RPC provides a display contract;
- native/base item stats feed Item stats; modifier rows feed Bonuses;
- do not show native/base rows as player-facing bonuses unless the DB read model explicitly classifies them as visible bonus-style rows;
- do not implement item requirement, stat aggregation, attack count aggregation or equipment compatibility as Angular authority;
- equip/unequip/move/rename/scrap/recover/vendor/trade/auction workflows must use canonical RPC/domain operations;
- do not direct-write `items`, `hero_equipment`, `hero_armory_shelves`, trade tables or auction tables from Angular.

---

## Requirements

- Requirements are not costs and not bonuses.
- Central requirements use `requirement_definitions` and `entity_requirements`.
- Building, item-generation and item effective requirements must be read through canonical DB/RPC/read-model surfaces.
- Frontend must not hardcode permanent requirement categories if DB/RPC should own display eligibility.
- If a read model returns extra requirement categories that should not be player-facing, request a DB/RPC display contract instead of silently filtering them in Angular.
- Requirement mutations must use canonical governed RPCs. Do not direct-write `entity_requirements`.
- Requirement display should use DB-backed labels where available.

---

## Bonus system

Use **scope**, not legacy **context**, for bonus semantics.

Current canonical bonus foundation:

- `bonus_types`;
- `bonus_scopes`;
- `bonus_target_categories`;
- `bonus_targets`;
- semantic `bonus_templates`;
- `entity_bonuses`.

Legacy bonus join tables and old semantic columns may physically remain as transitional debt, but new/changed app paths should use the canonical dictionaries/templates/entity bonuses.

Important:

- target is separate from type;
- scope is separate from type;
- category is organizational/filter metadata;
- `quality_scales_value` can scale value;
- quality must never scale `level_interval`;
- if canonical `entity_bonuses` data is missing, report a SQL/backfill blocker instead of adding permanent legacy fallback.

---

## Buildings, estates and districts

Buildings belong to the estate/world layer, not just a personal upgrade tree.

Key A-tier concepts:

- Agora;
- Farm;
- Lumber Mill;
- Barracks;
- Fortress;
- Trade Routes;
- Armory.

Important rules:

- do not pre-create rows for all empty estates;
- district capacity defines possible addresses;
- only occupied estates should exist as rows;
- when a player relocates away, the old estate row and related building state may be deleted;
- if the same address is later claimed again, create a new estate row with a new id;
- `buildings.district_code` is the minimum district where a building can be built;
- building is available in that district and higher districts;
- `buildings.max_level = 0` means unlimited;
- district cap overrides live in `building_district_level_caps` and missing rows fall back to global/default max level;
- central requirements live in `requirement_definitions` and `entity_requirements`.

---

## Exploration / trials / encounters

Exploration flow:

1. player chooses direction;
2. every movement step takes time;
3. first step also takes time;
4. unknown discovery step rolls trial opportunity first;
5. if no trial opportunity, roll encounter or nothing;
6. encounter and trial do not happen at the same time.

Important:

- trial chance increases after consecutive non-trial discovery steps;
- normal encounters do not reset trial progression;
- any trial opportunity attempt consumes a daily trial and resets dry-step count, even if manifestation fails;
- manifestation failure gives no reward and creates no minigame/challenge;
- manifested trial and combat encounter create challenge attempts and block further exploration until completed/auto-resolved/admin-forced;
- all exploration ends/blocks continuing real steps when daily trials are exhausted, but the status/start screen may still be visible;
- backtracking and known-path travel cost time and do not roll trial/encounter/nothing;
- previously discovered branches should be remembered, not rerolled.

Current encounter set:

- combat;
- resource;
- buff/debuff.

Buff/debuff rule:

- only one active buff/debuff at a time;
- if one is already active, do not stack/apply another one;
- active buff/debuff lasts until the next combat encounter or next trial;
- then it expires.

---

## Combat current direction

Combat is one reusable gameplay module. Exploration encounters, trials, future PvP, sandbox/admin tests and later systems provide combatants and interpret the result; the core combat rules stay the same.

Combat receives combatants and produces a result. It does not decide rewards, trial completion, PvP consequences, cooldowns or public report publishing. The caller interprets the result.

Core combat expectations:

- combat is limited by product config `combat_turn_limit`, currently defaulting to 10 full turns;
- one turn is a full round of eligible attack slots from both sides unless one side is defeated earlier;
- if no side is defeated before the turn limit, outcome is `draw`;
- sides are `initiator` and `defender`;
- player-controlled attacks use the Walking Dead timing minigame;
- resolution order is timing hit → evasion → crit → damage;
- opponents/automatic sides resolve attacks automatically;
- attack slots are ordered by formula target `combat_initiative_score`;
- initiative ties are won by the initiating side;
- randomness in initiative should come through formula tooling, not hidden combat ordering logic;
- completed combat should be persisted to relational snapshot tables when the caller needs history/reports.

### Attack plans

Attack plans are built from current combatant state:

- no weapon = one unarmed attack;
- unarmed base damage range starts at `strength..strength`, plus applicable bonuses;
- one one-handed weapon with empty off-hand = one weapon attack plus one unarmed attack;
- one-handed weapon plus shield = one weapon attack; shield does not attack;
- dual wield = one attack from each weapon;
- two-handed = one attack unless item-native data says otherwise;
- ranged is two-handed and may use item-native `attack_count` greater than 1;
- natural opponent attack sources such as Bite, Scratch, Iron Wings or Fist come from `combat_opponent_attack_sources`.

### Opponent definitions

Opponents are admin/balancer-defined content:

- one opponent belongs to one admin-defined family;
- encounter/trial combat candidates may point to a concrete opponent or a family;
- candidate scaling formula and `difficulty_multiplier` let the same opponent/family scale differently in encounter and trial contexts;
- opponent equipment can be `none`, `manual`, or `generated`;
- manual/generated opponent equipment uses item-generation component references but must not create player-owned `items` rows;
- generated opponent equipment is materialized only for one fight/result snapshot.

### Combat result snapshots

Combat result persistence is relational and report-ready:

- `combat_results` header;
- `combat_result_participants`;
- `combat_result_participant_stats`;
- `combat_result_attacks`.

Combat snapshots must preserve enough attack/result data to reproduce the combat UI later. Full equipment remains private; reports show attack source labels and safe item-like source details rather than full equipment loadouts.

---

## Trade, auctions and vendor economy

Player-to-player trade and auctions are DB/RPC-owned workflows.

Rules:

- direct player trade uses Character Points;
- one-item auctions use Character Points;
- drachmas are system/vendor/building resource currency;
- vendor scrap/sell is not player trade;
- do not design `market_listings` unless a new explicit product/database decision replaces the current direct-trade/auction model;
- do not direct-write trade, auction, lock, transaction, item ownership or item lifecycle tables from Angular;
- use canonical public RPCs from generated types and `database-current.md`;
- internal helper RPCs/functions are not frontend contracts.

### Trade and auction audit

Trade/auction lifecycle audit is DB-owned:

- direct trade offer lifecycle is audited by DB triggers;
- auction listing lifecycle is audited by DB triggers;
- auction bid placement is audited by DB triggers;
- completed direct trade and auction sale transactions are audited by DB triggers;
- buy-now vs normal auction-close path reason is audited DB-side.

Frontend must not add Angular-side `AuditWriter` calls for trade/auction lifecycle. If lifecycle audit is missing, fix the DB/RPC/trigger foundation instead of creating frontend audit writes.

Audit complements transaction rows, Character Point ledgers, item snapshots and anti-abuse signals. It does not replace those systems and it is not a public report/snapshot system.

### Vendor scrap/sell

Vendor scrap/sell is a system/vendor economy workflow:

- uses drachmas/resources, not Character Points;
- current payout config is `vendor_scrap_drachma_payout_percent`, product-global, default 50%;
- frontend must call `vendor_scrap_hero_item(...)`;
- frontend must not compose `scrap_hero_item(...)` plus resource updates client-side;
- frontend must not direct-update `items`, `hero_resources` or audit logs;
- `scrap_hero_item(...)` remains the canonical safe lifecycle helper internally, but vendor payout belongs to `vendor_scrap_hero_item(...)`.

There is currently no general `hero_resource_ledger`. Do not invent frontend-side resource history. If a full resource ledger is needed, it should be a separate DB/domain decision.

---

## Prestige, reports and future social systems

Prestige:

- player sees prestige rank/tier, not raw hidden points;
- prestige is separate from character level;
- meaningful PvP should matter more than farming weak targets.

Reports:

- public/shareable reports should use historical snapshot data, not current live values;
- important report types include `trial`, `encounter`, `pvp_combat`, and `siege`;
- tooltips in reports should use snapshot data;
- public reports must not expose private account data.

PvP travel:

- regular PvP attacks should not be instant;
- travel time should depend on distance/address/geography;
- there should be a hard minimum such as one minute;
- exact formula remains TBD.

---

## Product-level cadence

Some values should be treated as product-level cadence, not casual per-server knobs:

- daily trial count;
- daily attack count;
- base exploration step timing;
- manual siege action timer;
- base PvP travel-time minimum/model;
- possibly base siege preparation duration.

Keep balancing configurable where appropriate, but do not turn every foundational gameplay cadence value into a casual per-server setting unless explicitly instructed.

---

## Implementation style

When something is still being balanced:

- keep it configurable where appropriate;
- prefer admin-configurable or data-driven values;
- avoid baking temporary numbers deep into code.

When something is ambiguous:

- keep implementation extensible;
- do not guess aggressively;
- call out assumptions clearly;
- ask for/flag DB contract if the workflow is persistent or security-sensitive.

Route/page/component guidance:

- route pages should remain thin;
- domain logic belongs in `core/domain`, `core/services`, `core/utils`, typed models/mappers, or a focused workflow/state class;
- avoid large route components accumulating service/facade/domain responsibilities;
- do not add exported domain interfaces/types inside components.

---

## Verification, smoke and reporting

When reporting manual smoke tests, include both the clicked UI path and the domain meaning of the action.

Use this shape for each meaningful smoke path:

```text
Smoke: <UI path>
Action: <what was clicked/edited/submitted>
Domain meaning: <what this proves in gameplay/admin terms>
Expected result: <the user-visible and data/permission meaning>
Result: <passed/blocked/deferred, with reason>
```

Examples:

- `Admin panel -> Buildings -> Requirements -> Add Hero stat`
  - Domain meaning: central building requirements can express a stat gate from `requirement_definitions` and save it through canonical requirement RPCs.
- `Admin panel -> Moderation actions -> New moderation action -> Server ban`
  - Domain meaning: staff creates a server-scoped punishment record that affects moderation history/runtime access, with reason preserved for audit.
- `Admin panel -> Config changes -> Apply draft`
  - Domain meaning: a governed configuration change moves through the audited DB workflow instead of mutating live config directly.

Task reports for larger UI/workflow changes should include:

```text
reused:
checked but not reused:
new component/state/helper added:
import/use count:
touched-file cleanup:
manual smoke:
```

Non-blocking findings found during smoke should go to `docs/ui-ux-notes.md` unless the user promotes them into current task acceptance criteria.

Group UX notes as:

- **Quick wins**: copy, spacing, labels, obvious validation, small template/component cleanup;
- **DB metadata needed**: labels/descriptions/helper text/read models/options should come from DB contracts;
- **Redesign needed**: workflow, information architecture, permissions, or domain model mismatch that should not be patched locally.

---

## Red flags

Treat these as blockers or strong warnings unless the task explicitly justifies them:

- assuming `hero.id === auth.uid()`;
- direct writes to gameplay/economy/workflow tables from Angular;
- frontend fallback masking missing DB/RPC/read-model data;
- editing, regenerating or patching `database.types.ts`;
- manual TypeScript interfaces for generated RPC contracts;
- hardcoded gameplay/config/dictionary labels where DB owns the data;
- old formula variable names such as `level`, `nextLevel`, `heroLevel`, `statLevel`, `levelDifference` in active frontend formula contexts;
- using `context` naming for formula variables where `variables` is the established term;
- invented route names or concepts not present in current docs;
- large touched production files without cleanup report;
- splitting files only to hide line count;
- route smoke or build treated as full manual smoke;
- updating status docs before user acceptance;
- keeping tests that only preserve obsolete behavior.

---

## Final task report template

Use this structure at the end of every implementation task:

```text
Scope:
Non-goals:
Acceptance mapping:
Changed files:
Verification:
Manual smoke:
Clean-code / touched-file cleanup:
Reused / checked but not reused / new:
Import/use count:
DB/RPC contract notes:
Known gaps:
Status docs:
```

Minimum verification expected unless the task is docs-only:

- `npx tsc --noEmit`;
- focused specs for touched area, when available;
- `npm run build`, unless explicitly out of scope or blocked by known unrelated issue;
- static grep for banned direct writes / deprecated patterns when touching runtime/workflow code.

Status docs:

- state whether `current-todo.md`, `current-state-summary.md`, backlog/status docs and `database.types.ts` were touched;
- Codex must not touch `database.types.ts` at all;
- do not update status docs without explicit user instruction or accepted task completion.
