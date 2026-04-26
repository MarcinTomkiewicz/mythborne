# Mythborne — Current Decisions Log

Use this file for recent design and implementation decisions that should override older assumptions.

If something conflicts, prefer:

1. explicit user instruction,
2. current database schema / migrations,
3. this file,
4. broader concept documents.

## Confirmed / Active

### Project name

Current project/game name: **Mythborne**.

Older working names such as Monster Hunt, MythHunter, MythBurn, Mythos Hunter or similar should not be used as canonical naming.

---

## Server / World / Account Model

### Game server definition

A game server is a logical game world/realm inside the same application and the same database.

A game server is not:

- a separate machine,
- a separate deployment,
- a separate Supabase project,
- a separate database.

The system may contain multiple game servers/worlds in one database.

### Game server table

Game servers are represented by `game_servers`.

A game server has:

- `id uuid`
- `key text`
- `name text`
- `kind public.game_server_kind`
- `status public.game_server_status`
- lifecycle timestamps as needed.

### Game server kind

`game_server_kind` is a PostgreSQL enum.

Current values:

- `sandbox`
- `standard`

No `seasonal` or `event` kind for now.

### Game server status

`game_server_status` is a PostgreSQL enum.

Current values:

- `draft`
- `testing`
- `scheduled`
- `live`
- `archived`

Meaning:

- `draft` — server/world is being prepared.
- `testing` — specific server configuration is being tested before public availability.
- `scheduled` — server is configured and waiting for launch.
- `live` — active playable server.
- `archived` — closed historical server. Archiving should be treated as a very final operation.

### Default sandbox

The migration creates a default sandbox server.

Current default:

- `key = sandbox`
- `name = Sandbox`
- `kind = sandbox`
- `status = live`

This sandbox is a permanent internal test world, not a normal production server.

### Sandbox visibility

Sandbox should not be visible/available to normal players by default.

Normal players should see standard scheduled/live servers.

Admin/operator/tester or assigned staff may see sandbox/testing environments according to access policy.

---

## User / Hero Model

### Global account

User account is global.

The global user account is represented by:

- `auth.users`
- `user_data`

### Hero as server-specific character

A hero is a server-specific character owned by a global user account.

A hero belongs to:

- one user account,
- one game server.

After the game server migration:

- `auth.uid()` / `user_data.id` = global account id
- `hero.id` = character id
- `hero.user_id` = owner account id
- `hero.server_id` = game server id

Hard rule:

**Never assume that `hero.id = auth.uid()` after this migration.**

This is a hard architectural change.

### Correct loading flow

Correct conceptual flow after server/hero migration:

1. get authenticated user,
2. determine accessible / selected server,
3. load active hero for `user_id + server_id`,
4. use `hero.id` for gameplay-owned data.

Do not filter hero-owned gameplay data by assuming `hero.id === auth.uid()`.

### Hero uniqueness

Normal production-like servers:

- one user account should have at most one hero on a given non-sandbox server.

Sandbox:

- admin/operator/tester/server staff may have multiple heroes on a sandbox server for testing,
- this is needed to test interactions between characters without creating multiple email accounts.

Because sandbox has an intentional exception, one-hero-per-server should not be implemented as a simple unconditional `unique(user_id, server_id)` constraint.

Preferred rule:

- `unique(server_id, name)` for hero names,
- domain trigger / policy to enforce one hero per user per non-sandbox server,
- sandbox multi-hero exception for privileged users.

### Hero name uniqueness

Hero name must be unique within a server.

The same name may exist on different servers unless later intentionally changed.

UI should handle occupied names with a friendly message and suggestions.

---

## Roles / Membership / Staff Assignments

### Global roles

Global roles are stored in the `roles` table with a stable technical `key`.

Current known role keys:

- `admin`
- `moderator`
- `player`
- `operator`
- `tester`

Notes:

- global role describes account-level capability,
- global role does not necessarily mean full authority on every server,
- existing `moderator` role may remain,
- more specific server authority should be represented by `server_staff_assignments`.

### Server memberships

`server_memberships` is a table.

Its `status` is a PostgreSQL enum:

- `active`
- `suspended`
- `banned`

Meaning:

- `active` — user participates normally on that server.
- `suspended` — temporary server-specific ban/suspension.
- `banned` — permanent server-specific ban, with possible manual admin reversal.

No `left` status for now.

Characters are not deleted simply because a user stops playing.

### Server staff assignments

`server_staff_assignments` is a table.

Its `role` is a PostgreSQL enum.

Current values:

- `owner`
- `operator`
- `moderator`
- `tester`

Purpose:

- assign staff permissions on a specific server,
- allow an operator/moderator/tester to manage one server but play normally on another,
- avoid treating global operator/moderator role as automatic authority everywhere.

Example:

- a user may be global `operator`,
- be assigned as `operator` on server Athens,
- and still play as a normal player on server Sparta.

### Access expectations

Normal `player`:

- should access standard live servers,
- should not access sandbox servers by default.

Admin:

- may access all servers.

Tester:

- may access sandbox/testing environments.

Operator/moderator:

- may access assigned servers according to server staff assignment.

---

## Estate / Address / District Model

### Estate ownership

Estate belongs to a hero, not directly to a global user account.

Estate also carries `server_id`.

This supports server-specific estate/address uniqueness and easier address list queries.

### Estate address uniqueness

Estate address must be unique within a server.

Preferred constraint:

- `unique(server_id, address)`

If `address` already contains the district prefix, e.g. `A-0001`, then `district_code` does not need to be part of the uniqueness constraint.

### Empty estate rule

Empty estates are not pre-created as database rows.

District capacity defines possible addresses.

Occupied estates are rows.

Empty addresses are derived from capacity minus occupied rows.

An estate row is created only when an address is claimed.

If a player relocates away from an estate, the old estate row and related building state may be deleted.

If someone later claims the same address, this creates a new estate row/id.

### Address identity vs estate row identity

Address label, e.g. `A-0001`, is a possible world slot.

Estate row id represents one specific occupation instance.

The same address may be occupied multiple times across server history, each time with a new estate row id.

### Relocation

Moving to an empty estate is easy in UX but strategically expensive.

Player must confirm that old buildings will be lost.

Relocation to an empty estate is irreversible.

### District E

District E always has exactly one address/seat.

This should not vary per server unless explicitly redesigned later.

---

## Configuration Governance

### Core decision

Mythborne uses database-backed configuration governance for balance and server/world configuration.

Config governance is not a replacement for existing relational systems.

It is a governance layer over:

- formulas,
- item generation,
- buildings,
- bonus templates,
- scalar/profile configs,
- server config,
- test overrides.

Important rule:

**Configurable does not mean freely changeable at any time.**

### Config governance scope

`config_governance_scope` is a PostgreSQL enum.

Current values:

- `product_global`
- `global_balance`
- `server_launch`
- `live_server`
- `test_override`

### Scope meanings

#### `product_global`

Product-level rule / game rhythm.

Examples:

- daily trial count,
- daily attack count,
- base exploration step timing model,
- manual siege action timer,
- base PvP travel-time minimum/model,
- possibly base siege preparation duration.

These should not casually differ per server.

They may be present in database for visibility/governance, but are treated as highly controlled product-level rules.

#### `global_balance`

Shared balance configuration.

Examples:

- formula assignments,
- item generation qualities,
- item generation bucket profiles,
- item generation bases,
- item generation affixes,
- building definitions,
- bonus templates.

These may be patchable, but should eventually go through change sets instead of casual instant production edits.

#### `server_launch`

Server-specific config chosen before launch and locked after the server goes live.

Examples:

- district capacity profile,
- server-specific drop bucket profile if later moved from global balance,
- launch-time server rules.

If a config moves from `global_balance` to `server_launch`, existing live servers should receive snapshot values preserving current behavior.

#### `live_server`

Server-specific config that may change during server life, but should still be controlled and logged.

Examples:

- active server event,
- maintenance message,
- temporary server modifier.

#### `test_override`

Sandbox/testing-only override.

Examples:

- shortened timers,
- forced trials,
- forced encounters,
- added daily attempts,
- manual test setup.

Test overrides are not normal gameplay features.

### Config definitions

`config_definitions` is a registry of things governed by configuration/change policy.

It is not only a key-value table.

A config definition may govern:

- scalar config,
- JSON/profile config,
- balance formula,
- balance formula assignment,
- entity formula assignment,
- bonus template,
- building definition,
- item generation base,
- item generation affix,
- item generation quality,
- item generation bucket profile,
- server setting.

This allows existing relational systems to remain relational.

### Managed entity types

`config_managed_entity_type` is a PostgreSQL enum.

Current values:

- `scalar_config`
- `json_config`
- `balance_formula`
- `balance_formula_assignment`
- `entity_formula_assignment`
- `bonus_template`
- `building_definition`
- `item_generation_base`
- `item_generation_affix`
- `item_generation_quality`
- `item_generation_bucket_profile`
- `server_setting`

### Value types

`config_value_type` is a PostgreSQL enum.

Current values:

- `integer`
- `decimal`
- `boolean`
- `string`
- `json`
- `formula_ref`
- `enum_ref`
- `entity_ref`

### Config values

`global_config_values` is for scalar/json/profile-like global values.

`server_config_values` is for server-specific scalar/json/profile-like values, launch snapshots, live overrides or test overrides.

Do not use these tables to duplicate existing relational systems if a proper relational model already exists.

For example:

- formulas remain in `balance_formulas`,
- formula target assignments remain in `balance_formula_assignments`,
- local formula overrides remain in `entity_formula_assignments`,
- item generation remains in `item_generation_*` tables,
- buildings remain in `buildings`,
- bonus templates remain in `bonus_templates`.

### Config value status

`config_value_status` is a PostgreSQL enum.

Current values:

- `draft`
- `active`
- `archived`

### Server config value source

`server_config_value_source` is a PostgreSQL enum.

Current values:

- `manual_server_launch`
- `global_snapshot`
- `live_override`
- `test_override`
- `migration`

### Change sets

Configuration changes are grouped in `config_change_sets`.

`config_change_status` is a PostgreSQL enum.

Current values:

- `draft`
- `ready`
- `applied`
- `cancelled`

Meaning:

- `draft` — change is being edited.
- `ready` — change is ready for application.
- `applied` — change has been applied.
- `cancelled` — change was abandoned.

Reason is mandatory for config change sets.

Config changes and scope changes should not be reasonless.

### Change entries

Concrete technical changes inside a change set are stored in `config_change_entries`.

`config_change_kind` is a PostgreSQL enum.

Current values:

- `scope_change`
- `global_value_change`
- `server_value_change`
- `definition_change`
- `activation_change`
- `entity_field_change`

A change entry may point to:

- a config definition,
- a server,
- a managed entity type,
- a managed entity id,
- a field path,
- old/new scope,
- old/new value JSON,
- metadata.

For existing relational entities, change entries should use `entity_type`, `entity_id`, and `field_path`.

Example:

    entity_type = balance_formula_assignment
    entity_id = <balance_formula_assignment.id>
    field_path = formula_id

This records the technical change without flattening the formula assignment into a generic JSON config.

### Changelog visibility

`config_change_visibility` is a PostgreSQL enum.

Current values:

- `none`
- `internal`
- `public`

Meaning:

- `none` — no changelog entry; still auditable internally later.
- `internal` — visible in admin/operator changelog.
- `public` — intended for player-facing changelog.

Public changelog text does not need to expose exact technical values.

Example:

- technical change: bucket profile values changed from X to Y,
- public text: “Adjusted reward distribution in trials.”

### Config governance and audit

Full audit logging is a separate system and should be implemented later.

However, config governance is designed so that:

- every change has a reason,
- change sets preserve intent,
- change entries preserve technical detail,
- changelog visibility is explicit,
- and later audit logs can be connected to these changes.

---

## Formula Governance

### Existing formula system

The project already has a relational formula system.

Important tables:

- `balance_formula_targets`
- `balance_formulas`
- `balance_formula_assignments`
- `balance_formula_blocks`
- `entity_formula_assignments`

Do not replace this with generic JSON configs.

### Global formula assignment

`balance_formula_assignments` stores global/default assignments between a formula target and a formula.

Current known formula targets include:

- `building_upgrade_cost`
- `building_upgrade_time`
- `building_bonus_growth`
- `combat_hit_green_zone`
- `combat_evasion_chance`
- `combat_critical_chance`
- `combat_final_damage`
- `hero_stat_upgrade_cost`
- `hero_stat_level_cap`
- `item_requirement_level`

### Local formula assignment

`entity_formula_assignments` stores local formula override assignments for specific entities.

Current supported entity kind:

- `building`

Meaning:

- a specific building may use a local formula for a target,
- if no local override exists, runtime should fall back to global/default formula assignment.

Expected runtime order:

1. for entity + target, check `entity_formula_assignments`,
2. if a local assignment exists, use it,
3. otherwise use `balance_formula_assignments`,
4. if no assignment exists, treat it as configuration error or explicit technical fallback.

This table is structural support only. Runtime/frontend must still implement fallback logic.

---

## Bonus Templates Current State

Desired bonus model:

- `flat`
- `percent`
- `per_levels`
- `scaled_stat_bonus`
- `resource_flat`
- `resource_percent`
- `capacity_flat`
- `unlock_feature`

Desired bonus contexts:

- `global`
- `pvp_attack`
- `pvp_defense`
- `exploration`
- `trial`
- `combat`
- `economy`
- `building_management`

Important current implementation note:

- observed `bonus_templates` may still be in the old shape,
- old shape includes only `id`, `target`, `type`, `description`,
- old `bonus_type` may still include `per_4_levels`,
- the desired bonus-template refactor is not guaranteed to be completed unless current schema confirms it.

Decision:

- do not assume the full intended bonus model is implemented yet,
- treat bonus template refactor as a separate controlled migration/task,
- do not mix it into config governance unless explicitly requested.

---

## PvE loop

### Core model

The core PvE loop is **exploration + trials**, not a plain monster-hunt loop.

Movement happens through a text-described virtual space.

Every movement step costs time.

The first step also costs time.

The first step is not guaranteed to be empty.

A step may lead to:

- nothing / flavor,
- an encounter,
- a trial.

### Trial chance pacing

Trial chance increases after consecutive non-trial steps.

Trial chance resets after a trial occurs.

Normal encounters do not reset trial progression.

Trial is rolled first.

If no trial appears, then encounter-or-empty is rolled.

Trial and encounter do not occur at the same time.

### Trial flow structure

Trial flow consists of:

- trial appearance,
- trial manifestation,
- trial completion.

Trial manifestation depends on:

- difficulty,
- the relevant trial stat,
- supporting modifiers such as Luck / Spirituality depending on final balancing.

Every base stat is intended to have its own trial archetype.

On prototype stage, a trial may simply use the combat system.

### Difficulty tiers

Current tiers:

- Easy
- Medium
- Hard

Design intent:

- Medium should generally be the best all-around progression tier.
- Hard should be the highest-ceiling tier, not the universal best-farming tier.
- Outstanding quality only drops from the highest difficulty tier.

### Daily trial limit

Trial count is limited daily.

Premium may increase number of daily trials.

Premium does not directly improve trial quality, drop quality, or luck outcomes.

After all daily trials are used, exploration ends for that day.

Player should not continue walking only for encounters/empty steps after all trials are exhausted.

### Backtracking

Backtracking should be possible.

Backtracking costs time.

Previously discovered branches/nodes must be remembered.

The system should not reroll already discovered path nodes.

Exploration state should be remembered server-side in session/path history form.

Important long-term results/reports should be stored separately from temporary exploration path state.

---

## Encounters

Current encounter set:

- combat encounter,
- resource encounter,
- buff/debuff encounter.

### Combat encounter

Combat encounter:

- may injure,
- may kill,
- gives a small amount of EXP.

### Resource encounter

Resource encounter grants resources such as:

- drachmas,
- materials,
- workforce.

### Buff/debuff encounter

Buff/debuff encounter grants one temporary effect.

Only one active buff/debuff may exist at a time.

If one is already active, do not stack/apply a new one.

It lasts until:

- the next combat encounter,
- or the next trial.

Then it expires.

### Encounter enemies

Encounter combat enemies should be admin-defined.

They should eventually support:

- enemy definitions,
- base stats,
- stat growth/scaling rules,
- manual or randomized stat assignment,
- gear thresholds by player level,
- optional NPC gear nerfs.

---

## Luck

Luck has no hard global cap by default.

Practical maximum should come from:

- itemization,
- slot economy,
- set bonuses,
- origins,
- possible premium/business decisions later.

Luck is not upgraded from player stat points.

Luck should remain worth maximizing.

Luck improves opportunities, not guarantees.

High luck may reduce or effectively remove lowest-value buckets at extreme values, depending on balancing.

High luck should not be enough on its own to trivialize difficult combat/trials.

Luck can lightly support evasion and crit.

Luck can support some trial-facing layers.

---

## Item Philosophy

Expensive items are not guaranteed to be useful.

Economically strong but awkward items are allowed.

Requirements remain an important anti-skip mechanic.

Requirement checks are important at equip time.

After equip, item may continue to remain equipped even if requirements would no longer be met by a fresh equip check.

Valuable early drops should not always be freely monetizable immediately.

---

## Combat

### General

Combat is turn-limited.

A draw occurs if the turn limit ends with both sides alive.

Draw gives no reward.

Draw may leave injuries in PvE.

Draw generally should not leave persistent injuries in PvP.

### Player attack

Player attacks use timing minigame.

Moving indicator nickname:

- **Walking Dead**

Player must stop the indicator inside the green field.

### Hit zone

Green-zone width depends mainly on:

- attacker Dexterity,
- defender Agility,
- PvE difficulty modifiers,
- item/effect modifiers.

### Streak

Successful timing hits:

- narrow the green zone,
- speed up Walking Dead.

Miss:

- resets streak,
- resets zone width and speed to that fight baseline.

Evaded hit:

- deals no damage,
- still counts toward streak.

### Evasion

After a successful timing hit, defender rolls evasion.

Evasion depends mainly on:

- Agility,
- Luck,
- item modifiers.

### Critical hit

If hit is not evaded, roll crit.

Crit depends mainly on:

- Cunning,
- Luck,
- item modifiers.

Current crit multiplier:

- x2.

### Damage

Weapons use min damage and max damage.

Damage is rolled between weapon min and max.

Final successful, non-evaded damage has minimum 1.

Endurance reduces incoming damage.

Defense comes from Endurance and defensive item bonuses.

### Opponent

Opponents resolve attacks automatically.

Real-time enemy/player interaction is not required for defender.

This is required for:

- PvE,
- offline PvP defense,
- automation.

### Attack count

Number of attacks comes from:

- weapons,
- item effects,
- affixes,
- set effects.

Number of attacks does not come directly from raw stat points.

### Shields

Shields strengthen existing defensive layers.

They should not create too many extra defensive sub-systems.

### Combat tempo

Intelligence is the current candidate stat for attack order / combat tempo.

Exact formula is still provisional.

### Ranged weapons

Ranged weapon profile is still provisional.

Ranged weapons are always two-handed.

Their exact stat model is TBD.

---

## Equipment slots

Current intended equipment model:

- weapon + shield,
- dual wield,
- two-handed weapon,
- ranged weapon,
- helmet,
- armor,
- pants,
- boots,
- amulet,
- two rings.

---

## Stat Roles

Current working model:

- Strength — damage / impact.
- Dexterity — offensive hit control.
- Agility — defensive anti-hit and evasion.
- Endurance — defense / damage reduction.
- Cunning — crit chance and some attack-side tactical value.
- Wisdom — item-usage knowledge gate on equip; also its own trial archetype.
- Intelligence — defense-side/tactical value; likely attack order / tempo candidate.
- Spirituality — trial-related pacing / manifestation support; also its own trial archetype.
- Charisma — prestige gain/loss modulation; also its own trial archetype.
- Luck — special stat affecting opportunity quality, crit/evasion support, and some trial-facing layers.

Every base stat should eventually have its own trial archetype.

---

## Buildings / Estates / Districts

Buildings belong to estate/world progression layer, not just a personal upgrade tree.

Current building data is still partly conceptual and subject to iteration.

Buildings must support local formula assignment with fallback to global defaults.

Key A-tier building concepts:

- Agora
- Farm
- Lumber Mill
- Barracks
- Fortress
- Trade Routes
- Armory

### Armory

Armory controls visibility/practical access/organization.

Items do not disappear simply because they are not visible.

### Formula assignment

Buildings should support:

- global default formulas by scope,
- optional local formula overrides per building.

If no local formula is assigned:

- fallback to global default for that scope.

---

## Prestige / Governance

### Prestige

Main label:

- **Prestige**

Prestige uses a hidden point system.

Player sees only prestige tier/rank.

Raw points and thresholds are not shown directly.

Player should be notified when tier changes.

### Prestige behavior

Prestige should:

- come mainly from meaningful PvP,
- come slightly from PvE,
- not decay passively over time,
- punish disgraceful actions more strongly at higher standing,
- not use collective guild punishment.

### Current working ranks

1. Thetes
2. Zeugitai
3. Hippeis
4. Archontes
5. Basilikoi

These names remain untranslated in UI.

Descriptions/tooltips may be localized.

### Council / governance

Council role includes:

- E1-like seat selection,
- server-wide event voting.

Before council thresholds are met:

- server events may still be system-triggered or admin-triggered.

Only highest prestige tier should be eligible to contend for highest seat/E1 equivalent, but not everyone of that tier automatically occupies it.

---

## Report Snapshots

Shareable reports are needed relatively early.

A report is a historical snapshot of an in-game event.

Externally, the report should reproduce the in-game view of that event as faithfully as possible.

Report uses snapshot data, not current live game data.

Important report types:

- `trial`
- `encounter`
- `pvp_combat`
- `siege`

Rules:

- Trial reports should reflect in-game trial view and result/reward.
- Encounter reports should reflect in-game encounter view.
- PvP reports should reflect in-game PvP combat view.
- Tooltip-capable entities in reports should use snapshot data.
- Player names may link to public in-game character profiles.
- Public reports should not expose private account data.

---

## PvP attack travel time

Regular PvP attacks should require travel time.

Travel time should depend on distance/address/geography parameters.

Even closest attack should have a hard minimum timer, e.g. 1 minute.

Exact formula is TBD.

---

## Product-level Cadence / Hardcoded Rhythm

Some values are likely better treated as product-level constants than per-server editable config:

- daily trial count,
- daily attack count,
- base exploration step timing,
- manual siege action timer,
- base PvP travel-time minimum/model,
- possibly base siege preparation duration.

These should not casually differ per server unless game design intentionally moves that rule into server-specific configuration.

---

## Audit / Logging Direction

Audit log is required, but final implementation is still pending.

Audit/logging should support:

- moderation,
- debugging,
- anti-abuse,
- admin accountability,
- balance/config accountability,
- evidence for sanctions.

Do not log meaningless UI clicks by default.

Prefer logging important domain events, including:

- item trade completed,
- item transferred,
- item scrapped/sold,
- PvP attack created/resolved,
- siege created/resolved,
- trial completed,
- report generated,
- admin changed config,
- operator suspended/banned a user on a server,
- balance/config change set applied.

Audit log should eventually integrate with config governance.

Config governance already stores:

- reason,
- change set,
- change entries,
- changelog visibility,

but full audit log remains a separate future system.

---

## Anti-Abuse Notes

Database constraints can prevent one account from creating multiple heroes on a normal server.

They do not prevent one person from creating multiple accounts.

Multi-account abuse needs separate detection, logs, admin tools and rules.

Potential signals include:

- IP / hashed IP,
- user agent,
- suspicious trades,
- item transfers,
- PvP feeding,
- repeated coordinated behavior.

IP-based detection should be treated as a signal, not absolute proof.

Shared household / same IP cases should be supportable by declaration/admin review.

Privacy/legal requirements must be considered before storing and using IP/device-like data.

Do not implement broad anti-abuse logging without deliberate design and privacy/legal review.

---

## Testing / Admin Tooling

Eventually admin/tester tools should support:

- shortening/bypassing exploration timers,
- restoring/adding daily trial count,
- forcing trials,
- forcing encounters,
- setting or clearing active buff/debuff,
- accelerating exploration/combat testing workflows,
- switching between multiple sandbox heroes for one privileged account.

These are testing tools, not normal gameplay features.

---

## Still Provisional

The following areas remain provisional:

- exact trial chance growth curve,
- exact movement step times,
- exact district entry thresholds,
- exact prestige formula and thresholds,
- exact premium values,
- exact building formulas and caps,
- exact guild size rules,
- exact server governance thresholds,
- exact combat tempo / initiative formula,
- exact ranged-weapon stat model,
- exact report payload structures,
- final Hero Points / Character Points naming,
- full anti-abuse implementation details,
- final audit log implementation details,
- exact config governance UI/workflow,
- final server balance deployment/change-set model.
---

# Update 2026-04-26 — requirements and building district caps

## Central requirements system

Requirements are now a first-class domain/configuration system, separate from bonuses and costs.

Decisions:

- Requirements describe whether a hero/entity can equip, build, unlock, use, or perform something.
- Requirements are not costs.
- Requirements are not bonuses.
- Requirements are not stored as ad hoc JSON for new systems.
- New requirements should use:
  - `requirement_definitions`
  - `entity_requirements`
- `building_requirements` is legacy/transitional and should not be expanded into a universal system.
- `buildings.requirements` JSONB is legacy/transitional and should not be used for new requirement modeling.

Current seeded requirement definition keys:

- `hero_level`
- `prestige_rank`
- `hero_stat`
- `building_level`
- `resource_amount`
- `district_access`
- `trade_routes_access`

`prestige_rank` is the requirement key for the visible 1–5 prestige/rank-like gate. Do not treat old `rank_required` as the primary building availability mechanism.

## Building district availability

`buildings.district_code` means the minimum district where a building can be built.

Example:

- if `Oracle` has `district_code = B`, it can be built in B, C, D and E;
- it cannot be built in A.

The building is available in its minimum district and every higher district.

## Building max level and district overrides

`buildings.max_level` is the global/default max level for a building.

- `max_level = 0` means unlimited.
- `building_district_level_caps` stores only district-specific overrides.
- Missing override means fallback to `buildings.max_level`.
- Do not create a full building × district matrix unless there is an actual override.

Examples:

- global unlimited, A capped at 20:
  - `buildings.max_level = 0`
  - one override row: building + district A + `max_level = 20`
- global cap 40, A capped at 20:
  - `buildings.max_level = 40`
  - one override row: building + district A + `max_level = 20`

District caps are part of building balance/configuration, similar to building costs, build time, bonuses and formulas. They should be administered as a governed building-balance entity, not hardcoded frontend logic.

## Config governance entries

Requirements/building cap entities are registered in config governance as global balance entities:

- `requirement_definitions`
- `entity_requirements`
- `building_district_level_caps`

These use `value_type = entity_ref`.

## Codex implications

Codex must:

- load requirement definitions and entity requirements from the database;
- treat old `building_requirements` and `buildings.requirements` as legacy/transitional;
- expose district cap overrides in building admin/config UI;
- use `get_building_max_level_for_district(building_id, district_code)` or equivalent logic when checking effective building max level;
- use `is_building_available_in_district(building_id, district_code)` or equivalent logic when checking district availability;
- never assume every building has explicit cap rows for all districts.
