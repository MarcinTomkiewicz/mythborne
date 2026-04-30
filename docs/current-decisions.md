

# Mythborne — Current Decisions Log

Use this file for recent design and implementation decisions that should override older assumptions.

If something conflicts, prefer:

1. explicit user instruction,
2. current database schema / migrations,
3. this file,
4. broader concept documents.

## Confirmed / Active

---

## Combat / Epic M Decisions — 2026-04-30

### Combat module scope

Combat is one reusable module, not multiple combat types. Exploration encounter combat, trial combat, PvP, sandbox and future systems provide combatants and interpret the result, but the core combat rules stay the same.

Reports/public share links are a separate future epic. Epic M must still produce a rich enough combat result snapshot so later private/public reports can visually reproduce the combat UI from historical data.

### Turn model

A combat turn is a full round of eligible attack slots from both sides, unless one side is defeated earlier.

The product default turn limit is 10 full turns. This is stored as product-level config `combat_turn_limit` and exposed by `get_combat_turn_limit()`. Do not duplicate `turn_limit` into each combat result row.

If neither side is defeated by the turn limit, combat outcome is draw.

### Sides and outcomes

Combat uses side names:

- `initiator`
- `defender`

This supports PvE and future PvP without assuming `hero` vs `opponent` in the core result.

Outcomes:

- `initiator_victory`
- `defender_victory`
- `draw`

Draw has no winner/loser side.

### Initiative and attack slots

Attack slots are ordered by formula target `combat_initiative_score`.

Allowed variables:

- `combatantIntelligence`
- `combatantAgility`
- `attackIndex`
- `attackCount`

Default seed formula:

`combatantIntelligence * 1.0 + combatantAgility * 0.25 - (attackIndex - 1) * 5`

Higher score acts earlier. The initiating side wins exact ties. Randomness is allowed only through the formula system, not hidden inside combat ordering logic.

### Weapon / attack plan rules

Attack plans are built from current combatant state.

Rules:

- no weapon = one unarmed attack;
- unarmed base damage range is `strength..strength`, plus applicable bonuses;
- one one-handed weapon with empty off-hand = one weapon attack plus one unarmed attack;
- one-handed weapon plus shield = one weapon attack; shield does not attack;
- dual wield = one attack from each weapon;
- two-handed = one attack unless item-native data says otherwise;
- ranged is two-handed and uses item-native `attack_count`.

Natural opponent attack sources such as Bite, Scratch, Iron Wings or Fist are configured in `combat_opponent_attack_sources` and can produce attack slots without equipment.

### Critical damage

Hardcoded crit multiplier x2 is technical debt and must be removed from the final combat resolver.

Critical damage is a combat/derived value:

- base critical damage percent = 50;
- plus applicable `critical_damage` bonuses from equipment/affixes/etc.;
- `critMultiplier = 1 + finalCriticalDamagePercent / 100`.

`critical_damage` is displayed/stored as a percent. It is not a standalone formula target.

### Random formulas

Formula tooling must support:

- `random()` — random decimal 0..1;
- `random(min, max)` — random decimal in range.

No separate `randomInt` is needed; integer-like values can use `floor`, `ceil` or `round` around random output.

Admin formula preview must show that formulas containing random are nondeterministic and allow reroll/refresh.

### Opponent definitions

Opponents are admin/balancer-defined content. Combat rules do not know why an opponent was selected.

One opponent belongs to one opponent family. Families are admin-defined categories, not hardcoded gameplay lists. Encounter/trial candidates can select:

- one concrete opponent;
- or one family, which expands to active opponents in that family.

Multiple candidates can mix families and specific opponents.

Opponent definitions contain baseline stat values. Runtime scales those baseline values using:

1. candidate scaling formula override, if provided;
2. opponent default scaling formula, if provided;
3. default `combat_opponent_scaled_stat` formula assignment.

`difficulty_multiplier` on candidates is passed into the scaling formula.

### Opponent equipment

Opponent equipment mode:

- `none`
- `manual`
- `generated`

Manual equipment uses item-generation component references but does not create player-owned items.

Generated equipment is materialized once at combat start for the fight snapshot/input and must not create rows in `items`. It exists only for that fight/result snapshot.

Equipment is private. Future reports should show attack source labels and safe item-like source details/tooltips, not reveal full equipment loadouts by default.

### Combat result snapshots

Combat result persistence is relational:

- `combat_results`
- `combat_result_participants`
- `combat_result_participant_stats`
- `combat_result_attacks`

A combat report should be able to display attack order, source labels, hit/evasion/crit/damage and Health changes without recomputing live hero/opponent state.

`combat_result_attacks.source_item_id` is intentionally not a FK to `items`; item lifecycle must not break historical combat reports. Optional quality/base/prefix/suffix refs can support item-like tooltip/display reconstruction.

Full equipment stays private unless a future explicit UI decision exposes it.


### Progression / Epic N Decisions — 2026-04-30

### Scope

Epic N covers stats, Character Points, derived progression values and level progression. It must use the current DB/RPC foundation and must not recreate old placeholder workflows.

### Stat allocation

Stat allocation final save uses canonical `save_stat_allocation(...)`.

Rules:

- plus/minus UI clicks are local draft changes and are not audited;
- final save is the persistent/auditable mutation;
- frontend must not direct-write `hero_stats`;
- frontend must not direct-write `hero.character_points`;
- frontend must not direct-write `character_point_ledger`;
- frontend must not call low-level audit helpers for stat allocation.

### Character Points and Health terminology

- Health means hit points.
- Character Points are progression/trade currency.
- Character Points are stored on `hero.character_points`.
- Lifetime total is stored on `hero.total_character_points_earned` where needed.
- Balance history lives in `character_point_ledger`.

Avoid mixing Character Points with drachmas/resources, and avoid using Health/HP language for Character Points.

### Progression formulas

Progression formulas are DB-backed and configurable through the formula system.

Current formula targets:

- `hero_stat_upgrade_cost`
  - variables: `heroLevel`, `level`, `statLevel`;
- `hero_stat_level_cap`
  - variables: `heroLevel`;
- `hero_experience_to_next_level`
  - variables: `heroLevel`.

Do not hardcode stat costs, stat caps or XP thresholds in Angular. Formula assignments are the source of truth.

`hero_experience_to_next_level` is a configurable seed. It may be rebalanced later through admin formula tooling.

### Critical damage

`critical_damage` is a runtime derived/combat value and active bonus target.

Current semantic rule:

- base critical damage percent = 50;
- active `critical_damage` bonuses add to that value;
- final crit multiplier = `1 + finalCriticalDamagePercent / 100`.

`critical_damage` is not a standalone formula target. It replaces the old sandbox hardcoded crit multiplier x2.

### Derived stats

Runtime derived/special stats must be resolved on the fly from DB-backed definitions, base stats, bonuses and formula assignments where applicable.

Do not reintroduce `hero_derived` as runtime source of truth.

### Level-up workflow

Level-up persistence is not assumed complete just because XP formula exists.

Before implementing level-up, Codex must inspect current level/experience mutation paths and define the DB/RPC/domain workflow for:

- adding experience;
- checking `hero_experience_to_next_level`;
- increasing `hero.level`;
- granting Character Points where applicable;
- writing ledger/audit.

Any persistent mutation of level, experience or Character Points should go through a DB/RPC/domain workflow, not direct Angular table writes.

---

## Project name

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

Desired bonus scopes:

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

---

## Equipment slots and generated item requirements

### Equipment slot model

The current Mythborne equipment model is intentionally limited. Do not add new wearable slots without explicit redesign.

Current wearable model:

- hands / weapon profile:
  - one-handed weapon;
  - one-handed weapon + shield where supported;
  - two-handed melee weapon;
  - ranged weapon;
- helmet;
- armor;
- pants;
- boots;
- amulet;
- ring 1;
- ring 2.

Boots are intentionally included as a normal equipment slot. Do not remove them or recreate a “no boots” equipment meta.

### Item layer model

Generated items use the layered model:

```text
quality + optional prefix + base item + optional suffix
```

Examples:

- `Dagger`
- `Demonic Dagger`
- `Demonic Dagger of Hades`
- `Outstanding Demonic Dagger of Hades`

This layer model is a product/system rule. Admins may define content for qualities, base items, prefixes and suffixes, but should not redefine the layer architecture casually.

### Requirement authorship

Item requirements are authored at component level, not final generated item level.

Components that may carry item-equip requirements:

- base item;
- prefix;
- suffix.

Final generated item combinations do not receive manually authored requirement rows. For example, do not author separate requirement rows for every possible item such as `Outstanding Demonic Dagger of Hades`.

### Base item requirement rule

Every base item must define at least one item-equip level requirement.

Base items may also define additional requirements where appropriate, especially when the base item itself naturally implies a physical or build requirement. Examples:

- two-handed or heavy weapons may require Strength;
- heavy armor may require Strength or Endurance;
- other item-specific exceptions are allowed through requirement configuration.

Default expectation: base items usually provide the minimum level gate, while affixes provide most stat specialization.

### Prefix/suffix requirement rule

Every prefix and every suffix must define at least one item-equip requirement.

Affix requirements may include:

- level requirements;
- hero stat requirements;
- other central requirement types if intentionally allowed/configured.

Design preference for early itemization:

- use hero level and hero stats as the normal equipment requirement language;
- prestige, building, district or similar requirements for equipment are technically possible through the central requirement system, but should be rare and intentional.

### Final generated item requirement aggregation

Final generated item requirements are calculated automatically from component requirement profiles.

Rules:

- requirements are grouped by requirement definition/key and relevant parameters, for example `hero_level`, `hero_stat:strength`, `hero_stat:dexterity`;
- same-key requirements are not summed linearly;
- the highest same-key requirement contributes fully;
- lower same-key requirements contribute partially through global stack weights;
- the stack-weight model is global for the item system and is not configured per final generated item combination;
- quality scales the final aggregated requirements through requirement-specific quality parameters, not through the quality value/power multiplier.

Recommended conceptual aggregation model:

```text
For each requirement key:
  sort component requirement values descending
  aggregate = value[0] * weight[0] + value[1] * weight[1] + value[2] * weight[2] + ...
  final = ceil(aggregate * quality_requirement_multiplier + quality_flat_add)
```

Recommended starting shape for balance discussion:

```text
level_stack_weights = [1.0, 0.5, 0.25, 0.1]
stat_stack_weights  = [1.0, 0.35, 0.15, 0.05]
```

These values are balancing examples, not frozen constants. The system rule is that same-key requirements use global stack weights instead of linear sums.

### Quality and requirements

Quality affects item value/power and item requirements through separate parameters.

Important rule:

```text
quality value/power multiplier != quality requirement multiplier
```

For example, an Outstanding item may have a much larger value/power multiplier than its requirement multiplier. This prevents high-quality generated items from becoming impossible to equip by default.

### Drachma value vs equip difficulty

Economic item value and equip difficulty are separate axes.

Drachma value is used for:

- item generation/drop bucket logic;
- item economic value;
- vendor scrap/sell value.

Equip requirements are used for:

- item usage gating;
- progression pacing;
- build identity.

The current conceptual scrap/sell baseline is that scrapping/selling returns a fraction of item drachma value, currently 50%. This is an economy/balance parameter, not a requirement rule.

### Equip-time check

Equipment requirements are checked when equipping the item. Equipped items should not continuously unequip merely because requirements later change, unless an explicit future decision changes this rule.

---

# Update 2026-04-27 — item generation and equipment DB foundation

## Item generation base type model

The current item generation model uses explicit base item types in the `item_generation_*` namespace.

Canonical base item type keys:

- `one_handed_weapon`
- `two_handed_weapon`
- `ranged_weapon`
- `shield`
- `helmet`
- `armor`
- `pants`
- `boots`
- `amulet`
- `ring`

Do not add gloves, belts, cloaks, capes, caps, bracers, shoulders or other wearable slots without explicit redesign.

`item_generation_bases.base_type_key` is the source of truth for the base item type. The old `slot` field is legacy/deprecated and must not be used as semantic source of truth.

## Base item native target validation

Base item types define required and optional native targets through `item_generation_base_type_targets`.

This is an intentional database-driven validation model:

- admin UI should read required/optional native targets from the database;
- Angular should not hardcode which targets a base item type must have;
- concrete native values are stored through `entity_bonuses` for `entity_type = item_generation_base`.

Required target decisions:

- one-handed weapon: `min_damage`, `max_damage`, `attack_count`, `critical_chance`, `critical_damage`; default attack count 1, critical values may be 0.
- two-handed weapon: `min_damage`, `max_damage`, `attack_count`, `critical_chance`, `critical_damage`; attack count 1, critical chance and critical damage must be positive.
- ranged weapon: `min_damage`, `max_damage`, `attack_count`, `critical_chance`, `critical_damage`; default attack count 2, critical values may be 0.
- shield: required `defense`; optional `evasion_chance`.
- helmet: required `defense`.
- armor: required `defense`.
- pants: required `defense`; optional `dexterity`, `evasion_chance`.
- boots: required `defense`; optional `agility`, `evasion_chance`.
- amulet: required `charisma`.
- ring: must satisfy `ring_identity`, meaning at least one of `charisma` or `cunning`.

## Equipment state table

Equipped items are represented by `hero_equipment`, not by an `equipped` item status.

Equipment slots:

- `main_hand`
- `off_hand`
- `helmet`
- `armor`
- `pants`
- `boots`
- `amulet`
- `ring_1`
- `ring_2`

Rules:

- one hero can have at most one item per equipment slot;
- one item can be equipped at most once;
- equipped item must belong to the same hero;
- `scrapped` items cannot be equipped;
- `locked_trade` and `locked_auction` items may remain equipped while still owned by the hero;
- changing item owner or changing item status to `scrapped` clears any `hero_equipment` row for that item;
- deleting an item cascades the equipment row through FK.

Hand-pair rules remain domain/RPC responsibility:

- one-handed weapons equip to `main_hand` first;
- off-hand one-handed weapon requires a weapon in `main_hand`;
- shield equips to `off_hand`;
- two-handed and ranged weapons clear both hand slots and occupy the hand profile through `main_hand` with `off_hand` empty/blocked.

## Generated item identity columns

Items now carry generated item layer references:

- `generated_at`
- `generation_quality_key`
- `generation_base_id`
- `prefix_affix_id`
- `suffix_affix_id`
- `drachma_value`
- `armory_shelf_position`

Rules:

- item generation layers remain `quality + optional prefix + base item + optional suffix`;
- prefix/suffix FK kind is validated by DB trigger;
- `generated_at` is the generation timestamp and is used for Armory ordering rather than acquisition/transfer time;
- `drachma_value` is generated item value at generation time.

## Armory shelves and visibility

`visible_item_capacity` remains the technical bonus target for Armory visible/directly manageable item capacity. Do not create a duplicate `armory_visible_capacity` target.

Armory shelf model:

- `items.armory_shelf_position` is item-owned and transfers with the item;
- `hero_armory_shelves` stores hero-local names for shelf positions;
- the item does not FK to a hero shelf row;
- shelf name is player-defined, max 30 trimmed characters;
- every hero receives default shelf position `0` named `Default`.

This means that if an item transfers with `armory_shelf_position = 3`, it remains on position 3 for the buyer, but the buyer's local name for position 3 may differ from the seller's name.

Intended visibility order:

1. equipped and listed/market-locked items first;
2. higher `armory_shelf_position` first;
3. within the same priority/shelf group, `generated_at` from oldest to newest;
4. limit by resolved `visible_item_capacity`.

## New combat/equipment targets

The equipment foundation requires these additional bonus targets:

- `attack_count`
- `critical_damage`

`attack_count` and `critical_damage` are combat targets. Values may be numeric/decimal. Final projection/rounding belongs to combat formulas/resolvers.

## Codex implications

Codex must:

- regenerate database types before touching frontend code using this schema;
- use `item_generation_base_types` and `item_generation_base_type_targets` for admin item-generation UI;
- stop relying on `item_generation_bases.slot`;
- read native base item values from `entity_bonuses` for `item_generation_base`;
- model `hero_equipment` as the equipment source of truth;
- model `hero_armory_shelves` and `items.armory_shelf_position` for Armory organization;
- not invent equip/unequip RPC names until the conceptual/database track defines them.

---

# Update 2026-04-28 — U0 sanctions, staff access and moderation read contracts

## U0 sanction/access database completion

The U0 sanction/access database layer is now treated as contract-complete for Codex-facing frontend work after DB1–DB6.

Implemented scope:

- runtime enforcement for `trade_restriction` and `auction_restriction`;
- central normal gameplay access helpers;
- staff gameplay block on normal standard servers;
- `server_suspension` / `server_ban` synchronization into `server_memberships` runtime state;
- explicit G5 anti-abuse permission helper contracts;
- scope-aware moderation-action read model;
- removal of legacy combined moderation-history RPCs.

Behavioral rollback tests were intentionally not completed in this conversation. Future behavioral tests should use a proper sandbox/harness and should not be treated as missing DB contract.

## Moderation actions vs runtime access state

`moderation_actions` is the canonical server-scoped historical/decision record for moderation actions.

`server_memberships.status` is the fast runtime access state used by gameplay access logic.

For `server_suspension` and `server_ban`:

- active moderation actions remain in `moderation_actions`;
- membership runtime state is synchronized into `server_memberships.status`;
- `server_memberships.moderation_block_action_id` links the membership block back to the moderation action;
- `server_memberships.moderation_block_reason` stores the moderation reason copied for runtime/admin visibility;
- `server_memberships.moderation_block_expires_at` stores the copied expiry where relevant;
- `server_memberships.moderation_block_synced_at` records the last sync.

The sync intentionally avoids clobbering manual/non-moderation membership blocks. It restores to `active` only when the current blocked state was driven by a moderation-sync action.

## Normal gameplay access contract

Canonical helper/RPC contracts:

- `hero_is_staff_on_server(p_hero_id uuid)`
- `hero_is_staff_gameplay_blocked(p_hero_id uuid)`
- `hero_can_use_normal_gameplay(p_hero_id uuid)`
- `get_hero_normal_gameplay_block_reason(p_hero_id uuid)`
- `assert_hero_can_use_normal_gameplay(p_hero_id uuid, p_operation text)`

Rules:

- normal gameplay is allowed only for playable server statuses currently accepted by helper logic (`live`, `testing`);
- `server_memberships.status in ('suspended', 'banned')` blocks normal gameplay;
- active `server_suspension` and `server_ban` moderation actions block normal gameplay;
- staff assigned on the same normal `standard` server is blocked from normal player gameplay;
- `sandbox` and `testing` contexts are test exceptions for staff gameplay;
- a global admin/operator/tester without selected-server staff assignment is not automatically blocked from normal player gameplay on a standard server.

Future persistent gameplay RPCs should call `assert_hero_can_use_normal_gameplay(...)` before mutating normal gameplay state.

## Trade and auction restriction enforcement

Canonical helper/RPC contracts:

- `hero_has_active_moderation_action(p_hero_id uuid, p_action_type_key text)`
- `hero_has_active_trade_restriction(p_hero_id uuid)`
- `hero_has_active_auction_restriction(p_hero_id uuid)`
- `hero_has_active_server_play_block(p_hero_id uuid)`
- `assert_hero_can_use_player_trade_runtime(p_hero_id uuid, p_operation text)`
- `assert_hero_can_use_player_auction_runtime(p_hero_id uuid, p_operation text)`

Runtime triggers enforce these boundaries on the existing trade/auction tables:

- `trg_enforce_player_trade_runtime_restrictions` on `player_trade_offers`;
- `trg_enforce_player_auction_listing_runtime_restrictions` on `player_auction_listings`;
- `trg_enforce_player_auction_bid_runtime_restrictions` on `player_auction_bids`;
- `trg_enforce_character_point_lock_market_restrictions` on `character_point_locks`.

`trade_restriction` blocks player direct-trade participation. `auction_restriction` blocks auction participation. Server suspension/ban and membership suspension/ban also block market actions through the normal gameplay/access helper layer.

Safe exits and cleanup paths such as cancellation, rejection, expiry and unlock/refund cleanup must not be blocked solely because the user is restricted.

## Staff assignment and staff gameplay boundary

Server staff remains server-scoped through `server_staff_assignments`.

`assign_server_staff(...)` is the canonical audited mutation path. Frontend must not insert/update `server_staff_assignments` directly.

Important rules:

- standard servers cannot receive a staff assignment for a user who already has any hero on that server;
- sandbox/testing contexts are exceptions for staff/test gameplay;
- staff-disqualifying moderation history blocks server staff assignment;
- a user with a server ban anywhere is staff-disqualifying;
- long operator/manual suspensions above the configured threshold are staff-disqualifying;
- global role assignment remains separate from server staff assignment.

## Explicit G5 anti-abuse permission helpers

Future G5/H UI must prefer explicit helpers instead of broad `can_manage_anti_abuse(...)`.

Canonical permission/read helpers:

- `can_triage_anti_abuse(p_server_id uuid)`
- `assert_can_triage_anti_abuse(p_server_id uuid, p_operation text)`
- `can_decide_anti_abuse(p_server_id uuid)`
- `assert_can_decide_anti_abuse(p_server_id uuid, p_operation text)`
- `can_manage_anti_abuse_sanctions(p_server_id uuid)`
- `assert_can_manage_anti_abuse_sanctions(p_server_id uuid, p_operation text)`
- `can_read_full_moderation_history(p_server_id uuid)`
- `assert_can_read_full_moderation_history(p_server_id uuid, p_operation text)`

`can_manage_anti_abuse(...)` remains only as compatibility/broad helper for older paths. New Codex work should not choose it as the primary UI contract.

## Moderation read model contracts

Canonical scoped UI read RPC:

- `get_visible_moderation_actions(p_server_id uuid, p_target_user_id uuid, p_target_hero_id uuid)`

Canonical full-history action-only RPCs:

- `get_full_user_moderation_history(p_server_id uuid, p_user_id uuid)`
- `get_full_hero_moderation_history(p_server_id uuid, p_hero_id uuid)`

Visibility helper:

- `can_read_moderation_action(p_action moderation_actions)`

Rules:

- admin/operator/full-history authority can read full moderation action history;
- scoped moderators use `get_visible_moderation_actions(...)`;
- scoped moderators see only local/scope-relevant moderation actions;
- heavy account/server punishment history remains full-history authority by default;
- anti-abuse cases, sanctions and Character Point penalties use dedicated G5 RPC/services, not combined legacy moderation-history feeds.

The legacy combined history RPCs have been removed:

- `get_user_moderation_history(...)` removed;
- `get_hero_moderation_history(...)` removed.

Codex must not reintroduce those names or create frontend fallbacks to them.

## RLS/read-model direction

`moderation_actions` RLS is enabled.

Current policy direction:

- global admin can manage;
- admin/operator can select full history;
- scoped moderator selection is constrained by `scope_key` and moderator scope helper logic;
- targets can read their own targeted actions where policy allows.

UI should still prefer RPC/read contracts above instead of direct table reads for staff/moderation surfaces.

## Codex implications

Before implementing U0/H frontend tasks, Codex must:

- regenerate and use current `database.types.ts`;
- use DB dictionaries (`staff_permission_scopes`, `moderation_action_types`, etc.) for labels/options;
- use explicit G5 permission helpers for future anti-abuse UI;
- use `get_visible_moderation_actions(...)` for moderator-facing moderation UI;
- use `get_full_user_moderation_history(...)` / `get_full_hero_moderation_history(...)` for admin/operator full moderation action history;
- use dedicated G5 RPC/services for anti-abuse cases, sanctions and CP penalties;
- use `hero_can_use_normal_gameplay(...)` / `get_hero_normal_gameplay_block_reason(...)` / `assert_hero_can_use_normal_gameplay(...)` for normal gameplay access;
- never reintroduce `get_user_moderation_history(...)` or `get_hero_moderation_history(...)`.

---

## DB-backed UI explainability metadata

Admin/staff/config UI must not rely on raw keys or JSON as the only visible explanation when DB metadata exists.

Current decision:

- technical keys remain stable and may be shown as secondary metadata;
- primary labels, descriptions, helper text, impact summaries and warnings should come from DB-backed metadata where available;
- Angular should not create permanent hardcoded dictionaries for configurable gameplay/config values when the database exposes a dictionary/read model;
- `metadata_json` remains lightweight and must not replace relational domain systems.

Canonical metadata contracts:

- `ui_metadata_entries`
- `get_ui_metadata_entries(...)`

Seeded metadata namespaces include config governance scopes, config change kinds/statuses/visibility, value types, server config sources, gameplay block reasons, staff candidate eligibility reasons, preview kinds, config managed entity types, applies-to kinds and effective value sources.

## Config definition explainability

`config_definition_ui_metadata` is the per-config-definition UI metadata layer.

It stores admin-facing helper text, gameplay impact summary, change warning, preview kind and grouping.

Canonical read contracts:

- `get_config_definition_ui_metadata(...)`
- `get_config_definition_explainability(...)`

Rules:

- config governance screens should use `get_config_definition_explainability(...)` instead of reconstructing governance semantics in frontend switch statements;
- `server_required` means a selected server is needed before showing the effective server-scoped value;
- `not_value_config` means the definition governs a relational system and should use a dedicated read/preview model instead of scalar/json config editing;
- target/scope in config change entry UI should be derived from DB definition metadata and explained, not presented as a fake editable choice.

## Admin preview contracts

Canonical preview registry:

- `get_admin_preview_contracts()`.

Canonical preview RPCs:

- `get_item_quality_impact_preview(...)`
- `get_building_progression_preview(...)`
- `get_bonus_impact_preview(...)`
- `get_requirement_impact_preview(...)`

Rules:

- item quality preview reads `item_generation_qualities`; do not hardcode exactly three quality rows;
- building preview explains district availability, effective caps and `0 = unlimited`;
- bonus preview uses semantic bonus dictionaries and `entity_bonuses`;
- quality may scale bonus value only when `quality_scales_value = true`;
- quality never scales `level_interval`;
- requirement preview uses `requirement_definitions` and `entity_requirements`, not legacy requirements JSON.

## Staff candidate search read model

`search_server_staff_candidates(...)` is the canonical server-scoped staff candidate search RPC.

Rules:

- frontend must not fetch broad `user_data` pools and filter up to large limits client-side for staff candidate search;
- frontend must not read `auth.users` directly;
- staff candidate eligibility flags should come from DB-side read model/helper logic;
- eligibility reasons should be displayed through human-readable DB metadata, not raw keys as primary text.

## Localization note for future design

Language should eventually be supported at two levels:

- server default language;
- private account/user language preference.

This is a remembered future-design note, not a requirement to implement localization in the current DB explainability slice.

---

# Update 2026-04-30 — Epic K/L DB foundation and working standards

## Epic K identity / same-IP-device path

Epic K is DB/backend-ready for the currently agreed scope.

Decisions:

- IP/device signals are review aids, not proof of abuse and not an automatic punishment path.
- Raw IP must not be stored in the database by default.
- Identity observations use hashed material produced by trusted backend code, not by Angular payloads.
- The trusted capture path is Supabase Edge Function `record-identity-observation`, written in backend TypeScript/Deno under `supabase/functions/record-identity-observation/index.ts`.
- The Edge Function verifies the authenticated user, hashes IP / IP prefix / user-agent / optional device token with `IDENTITY_HASH_PEPPER`, and calls service-role-only `record_anti_abuse_identity_observation(...)`.
- Deploying the Edge Function does not create observation rows. Rows appear only after authenticated invocation.
- Shared household / same-IP declarations remain review context. They do not disable signals by themselves.

Current DB/backend foundation:

- `anti_abuse_identity_observations` stores hash-only identity observations with retention.
- `record_anti_abuse_identity_observation(...)` and `purge_expired_anti_abuse_identity_observations(...)` are service-role-only.
- `generate_identity_observation_anti_abuse_signals(...)` creates same-IP/login and same-device/multiple-account review signals.
- `generate_trade_transaction_identity_anti_abuse_signals(...)` creates same-IP/device trade review signals.
- Trigger wrappers exist and public grants have been removed.
- Signal types `same_ip_login`, `same_device_multiple_accounts`, and `same_ip_trade` are active.

Codex implications:

- frontend must call the Edge Function, not insert into `anti_abuse_identity_observations`;
- frontend needs a stable client/device token helper, but the token itself is not a secret;
- smoke tests should verify rows in `anti_abuse_identity_observations` and generated review signals when hashes match;
- if Edge Function secrets are missing, report a deployment/config blocker instead of weakening the model.

## Epic L PvE exploration/trials foundation

Epic L has moved from planning into applied DB foundation up to **L-DB4b**.

Applied and verified in conversation:

- **L-DB1** — PvE dictionaries, formula targets, reward foundation.
- **L-DB2** — exploration runtime state tables.
- **L-DB3a** — exploration bootstrap / state read / start step timer RPCs.
- **L-DB3b** — step resolution, trial opportunity, encounter/nothing, challenge attempt creation, district snapshot support.
- **L-DB3c** — reward grants, real item persistence, challenge completion and auto-resolve helpers.
- **L-DB4a** — sandbox/admin debug state, add remaining actions, reset exploration, skip timer, test grant reward profile.
- **L-DB4b** — force next outcome overrides, force challenge result, `items.metadata_json`, and override-aware step resolution.

Not yet applied:

- **L-DB4c** — preview/simulation RPCs. This must be the first DB continuation item in a new conversation, split into small SQL chunks.

Current gameplay decisions now represented by DB foundation:

- exploration is graph-based and server-side;
- per hero/day/difficulty exploration graphs are allowed, so a hero may have separate easy/medium/hard graphs on the same day;
- daily action counters are generic for `trial` now and `attack` later;
- `remaining_trials = 0` blocks starting/continuing real exploration steps but does not block opening the exploration start/status screen;
- backtracking and known-path travel cost time and do not roll trial/encounter/nothing;
- unknown discovery steps resolve by trial opportunity first, then encounter/nothing;
- trial opportunity consumes one daily trial regardless of manifestation or completion result;
- trial definitions are selected equally among active rows;
- manifestation fail consumes the trial, resets dry-step count, gives no reward and creates no minigame;
- manifested trial and combat encounter create `hero_exploration_challenge_attempts` and block further exploration until completed/auto-resolved/admin-forced;
- auto-resolve is intentionally worse than manual play but is not automatic failure;
- reward success can create XP, matching CP, resources, real items in `items`, and exploration effects;
- XP always grants the same amount of Character Points; standalone CP is explicit and separate;
- reward grants prevent double payout for the same source/profile/hero;
- item reward persistence is required because sandbox testing must allow the full loop: exploration → trial → item → equip → changed stats/chances → combat/testing.

## Reward and leveling memory note

Leveling remains a separate future system, but the reward foundation must not block it.

Future direction:

- XP required for next level should be formula-driven;
- level-up may grant rewards, including stat bonuses on selected levels or every N levels;
- `level_up` should be able to use the generic reward profile system later;
- this is not implemented in L-DB1..L-DB4b and should be treated as future work.

## Working-standard clarification

“Notatki dla pamięci” are only for cross-cutting or future notes discovered while working on something else. Do not put the current task’s own acceptance criteria into memory notes. When docs are updated, valid memory notes should be moved into `current-decisions.md` or `project-context.md` so they do not remain only in conversation.
