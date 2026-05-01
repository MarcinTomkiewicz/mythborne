# AGENTS.md — Mythborne implementation guidance

## Purpose

This file is the short execution-oriented guide for coding agents working on **Mythborne**.

Prefer this file for fast implementation context. For broader detail, also consult:

- `database-current.md`
- `current-decisions.md`
- `project-context.md`
- `codex-mythborne-backlog.md`
- `current-state-summary.md`
- `current-todo.md`

If there is a conflict, prefer:

1. explicit user instruction;
2. current live database / migrations / generated `database.types.ts`;
3. `database-current.md` as the semantic DB/RPC/helper registry;
4. `current-decisions.md`;
5. `project-context.md`;
6. this file.

Older Monster Hunt wording may remain in legacy source files, but new implementation, UI-facing text and documentation should use **Mythborne** unless the user explicitly asks otherwise.

---

## Operating rules for Codex runs

- Use Polish for Codex prompts/comments unless the user requests otherwise.
- Preserve exact filenames.
- Before starting a new backlog task, run `git status --short`; if the working tree is not clean, report it and wait for the user decision.
- Do not modify `current-todo.md`, `current-state-summary.md` or backlog task statuses unless the user asks or confirms task completion.
- Always check current generated types/schema when implementing schema-sensitive logic.
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
- `codex-mythborne-backlog.md` is the practical Codex task queue.
- `current-state-summary.md` and `current-todo.md` are progress/status files, not schema sources.
- Old uploaded concept files can explain history, but they must not override current DB/migrations/decisions.

When a current file and a legacy concept file disagree, prefer the current schema and current docs.

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

## Core PvE / exploration / trial loop

Exploration flow:

1. player chooses direction;
2. every movement step takes time;
3. first step also takes time;
4. unknown discovery step rolls trial opportunity first;
5. if no trial opportunity, roll encounter or nothing;
6. encounter and trial do not happen at the same time.

Important:

- trial chance increases after consecutive non-trial discovery steps;
- normal encounters do **not** reset trial progression;
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

## Item generation, equipment and Armory

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
- no equip/unequip RPC is currently approved/documented yet.

Before coding against these structures:

1. read `database-current.md`;
2. regenerate `database.types.ts` if local generated types do not include the current schema;
3. do not create alternative table/RPC names;
4. report missing DB contracts as blockers instead of inventing them.

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

Armory rule:

- items do not disappear because they are not visible;
- Armory controls practical visibility/access/organization, not ownership existence.

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

Task reports for larger UI/workflow changes should include a short shared/reuse check:

```text
reused:
checked but not reused:
new component/state/helper added:
```

Non-blocking findings found during smoke should go to `docs/ui-ux-notes.md` unless the user promotes them into current task acceptance criteria.

Group UX notes as:

- **Quick wins**: copy, spacing, labels, obvious validation, small template/component cleanup;
- **DB metadata needed**: labels/descriptions/helper text/read models/options should come from DB contracts;
- **Redesign needed**: workflow, information architecture, permissions, or domain model mismatch that should not be patched locally.
