<!-- HANDOFF_OVERRIDE_START -->
# Handoff project context — 2026-04-27

## Project name

Canonical current project/game name: **Mythborne**. Legacy docs may say Monster Hunt; treat that as historical naming unless the user explicitly discusses old documents.

## Current work mode

This project is currently in a split track:
1. Codex executes frontend/backlog tasks.
2. The conversation reviews Codex output, database/concept changes, and schema fixes.
3. Important database/concept changes must be reflected in MD files.

## Current Codex location

Epic D — Configuration Governance.

Accepted:
- D1 config definitions read model.
- D2 config values/effective values read model.
- D3 change-set list/detail.

Current:
- D4 config edit draft flow. Codex reported fixes; next step is verify/accept.

## D4 acceptance focus for next conversation

Confirm build and UI; ensure draft change set creation, reason/title trim validation, public changelog validation, scalar entry creation, unsupported entity/formula/enum refs, no direct config mutation, no misuse of `entity_id` or old/new scope, and effective values refresh after server changes.

## Near-term after D4

D5 apply/cancel flow, D6 anti-abuse config admin, then audit/logging integration and anti-abuse UI/read models. Separate later work: equipment model, trade/auction UI, PvE/trials.

## Review style

When reviewing Codex code: distinguish blockers from polish, give direct Polish feedback, do not accept if DB semantics are wrong, and do not ask Codex to update status until user confirms.
<!-- HANDOFF_OVERRIDE_END -->

# Mythborne — Project Context for Codex

## Purpose

This file is the short, operational context document for implementation work.

Use it as the primary high-level source of truth when generating code, scaffolding features, or proposing architecture.

If something here conflicts with a newer migration, seed, or explicit user instruction, prefer:

1. explicit user instruction,
2. current database schema / migrations,
3. `current-decisions.md`,
4. this document.

## Project Name

The current canonical project/game name is **Mythborne**.

Older working names such as Monster Hunt, MythHunter, MythBurn, Mythos Hunter, etc. may still appear in legacy filenames or older discussion, but they should not be treated as current canonical naming.

Use **Mythborne** for new conceptual, UI-facing and documentation work unless explicitly instructed otherwise.

---

## Game Overview

Mythborne is a browser RPG inspired by ancient Greece.

The game combines:

- character progression,
- item generation and loot variance,
- exploration plus trials,
- estate and district progression,
- PvP conflict,
- guild-supported sieges,
- long-term prestige systems,
- server-level events and governance,
- configuration governance / balance change control,
- and shareable report snapshots.

Failure is allowed.

RNG is allowed.

High value does not always mean high usefulness.

The game should support serious long-term progression, politics, PvP tension and economic variance, while still allowing lighter flavor elements such as strange encounters, unlucky drops and shareable “look what happened” reports.

---

## Canonical Terminology

### Character / Power

- **Level**: main character progression level.
- **Stats**: canonical base stats from the database.
- **Derived stats**: Health, defense, damage ranges, luck, etc.
- **Gear / equipment**: modifies build capability and challenge success.
- **Health**: hit points. Use `Health` in user-facing language to avoid confusion with Hero Points / Character Points.
- **Hero Points / Character Points**: final naming still unresolved.

### Estate / World

- **Estate / Possession**: the player's current property.
- **Address**: district-coded address such as `A-2374`.
- **District**: world/estate layer: A, B, C, D, E.
- **Buildings**: infrastructure attached to an estate, not just to the player.

### Social / Server

- **Guild**: social structure that can support sieges and coordinated progression.
- **Prestige**: hidden-point system represented to the player as visible prestige tiers / ranks.
- **Server governance**: political / voting / event layer tied to higher districts.
- **Game server / world / realm**: logical game world inside the same application and database.

### PvE

Preferred terms:

- **Exploration**
- **Trials**
- **Encounter**
- **Trial chance**
- **Trial appearance**
- **Trial manifestation**
- **Trial completion**

Do not default to calling the PvE loop “monster hunt” in implementation language.

---

## Server / World / Account Model

### Game server definition

A game server is a logical world/realm inside the same application and the same database.

A game server is **not**:

- a separate machine,
- a separate deployment,
- a separate Supabase project,
- or a separate database.

The system may contain multiple game servers/worlds in one database.

### Game server identity

A game server should have:

- `id uuid`
- `key text`
- `name text`
- `kind`
- `status`
- lifecycle timestamps as needed.

`id` is the technical database identifier.

`key` is a stable technical slug, e.g. `sandbox`.

`name` is the player/admin-facing display name, e.g. `Sandbox`, `Athens`, `Sparta`, `Corinth`, etc.

### Game server kind

`game_server_kind` is a PostgreSQL enum.

Current values:

- `sandbox`
- `standard`

No `seasonal` or `event` kind for now.

If those are needed later, they should be added intentionally through a later decision/migration.

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

The initial server/world migration creates a default sandbox server.

Current default:

- `key = sandbox`
- `name = Sandbox`
- `kind = sandbox`
- `status = live`

This sandbox is a permanent internal test world, not a normal production server.

---

## User / Hero Model

### Global account

User account is global.

The global account is represented by:

- `auth.users`
- `user_data`

### Hero as server-specific character

A hero is a server-specific character owned by a global account.

A hero belongs to:

- one user account,
- one game server.

After the game server migration:

- `auth.uid()` / `user_data.id` = global account id,
- `hero.id` = character id,
- `hero.user_id` = owner account id,
- `hero.server_id` = game server id.

Critical rule:

**Never assume that `hero.id = auth.uid()` after the server/hero migration.**

This is a hard architectural change.

### Correct loading flow

After migration, frontend/backend logic should follow this conceptual flow:

1. get authenticated user,
2. determine accessible / selected server,
3. load active hero for `user_id + server_id`,
4. use `hero.id` for gameplay-owned data.

Do not filter hero-owned gameplay data by assuming `hero.id === auth.uid()`.

### Hero uniqueness

Normal production-like servers:

- one account should have at most one hero on a given non-sandbox server.

Sandbox:

- admin/operator/tester/server staff may have multiple heroes on a sandbox server for testing,
- this allows testing interactions between characters without creating multiple email accounts.

Because sandbox has an intentional exception, one-hero-per-server should not be implemented as a simple unconditional `unique(user_id, server_id)` constraint.

Preferred model:

- `unique(server_id, name)` for hero names,
- trigger/domain policy for one hero per user per non-sandbox server,
- sandbox multi-hero exception for privileged users.

### Hero name uniqueness

Hero name must be unique within a server.

The same name may exist on different servers unless later intentionally changed.

UI should handle occupied names with a friendly message and suggestions.

---

## Roles / Membership / Staff Assignments

### Global roles

Global roles are stored in the `roles` table with a stable technical `key`.

Known role keys:

- `admin`
- `moderator`
- `player`
- `operator`
- `tester`

Global role describes account-level capability.

Global role does not necessarily mean authority on every server.

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

## Configuration Governance

Mythborne uses database-backed configuration governance for balance and server/world configuration.

Important rule:

**Configurable does not mean freely changeable at any time.**

Configuration governance is not meant to replace existing relational systems such as formulas, item generation tables, buildings or bonus templates. It is a governance layer over them.

### Governance purpose

Configuration governance exists to define:

- what kind of configurable thing exists,
- what scope it belongs to,
- whether it is global, server-specific, launch-locked, live-editable or test-only,
- how changes are packaged,
- why a change was made,
- whether it should appear in internal/public changelog,
- and how existing relational balance systems should be governed.

### Config scopes

`config_governance_scope` is a PostgreSQL enum.

Current values:

- `product_global`
- `global_balance`
- `server_launch`
- `live_server`
- `test_override`

Meaning:

#### `product_global`

Core product rhythm / game identity.

Examples:

- daily trial count,
- daily attack count,
- base exploration step timing model,
- manual siege action timer,
- base PvP travel-time minimum/model,
- possibly base siege preparation duration.

These values should not casually differ per server. They may be stored in DB for visibility/governance, but should be treated as highly controlled product-level rules.

#### `global_balance`

Balance or formula data shared globally unless overridden by future governance.

Examples:

- combat formula assignments,
- building formula assignments,
- item generation qualities,
- item generation bucket profiles,
- item generation bases,
- item generation affixes,
- bonus templates,
- building definitions.

These are patchable, but changes should eventually go through change sets instead of casual instant production edits.

#### `server_launch`

Server-specific config chosen before launch and locked after the server goes live.

Examples:

- district capacity profile,
- server-specific drop bucket profile if later moved from global balance,
- launch-time server rules.

If a config moves from global balance to `server_launch`, existing live servers should receive snapshot values preserving current behavior.

#### `live_server`

Server-specific config that may change during server life, but should still be controlled and logged.

Examples:

- active server events,
- maintenance flags/messages,
- temporary server modifiers.

#### `test_override`

Sandbox/testing-only overrides.

Examples:

- shortened timers,
- forced trials,
- forced encounters,
- extra daily attempts,
- manual test setup.

Test overrides are not normal gameplay features.

### Config definitions

`config_definitions` is a registry of things governed by configuration/change policy.

It is **not only** a key-value config table.

A config definition may refer to:

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

This means `config_definitions` can govern existing relational systems instead of replacing them with JSON.

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

Simple scalar/profile configs may use `global_config_values` or `server_config_values`.

Existing relational systems should usually remain relational. For example:

- formulas remain in `balance_formulas`,
- formula target assignments remain in `balance_formula_assignments`,
- local formula overrides remain in `entity_formula_assignments`,
- item generation remains in `item_generation_*` tables,
- buildings remain in `buildings`,
- bonus templates remain in `bonus_templates`.

### Global and server config values

`global_config_values` is for scalar/json/profile-like global values.

`server_config_values` is for server-specific scalar/json/profile-like values, launch snapshots, live overrides or test overrides.

Do not use these tables to duplicate existing relational systems if a proper relational model already exists.

### Change sets

Configuration changes are grouped in `config_change_sets`.

`config_change_status` is a PostgreSQL enum.

Current values:

- `draft`
- `ready`
- `applied`
- `cancelled`

A change set should include:

- title,
- reason,
- status,
- changelog visibility,
- optional changelog title/body,
- actor fields such as requested/applied/cancelled by,
- timestamps.

Reason is mandatory. Config changes and scope changes should not be reasonless.

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

- `entity_type = balance_formula_assignment`
- `entity_id = <balance_formula_assignment.id>`
- `field_path = formula_id`

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

## Formula Governance and Assignment

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

Example targets include:

- building upgrade cost,
- building upgrade time,
- building bonus growth,
- combat hit green zone,
- combat evasion chance,
- combat critical chance,
- combat final damage,
- hero stat upgrade cost,
- hero stat level cap,
- item requirement level.

### Local formula assignment

`entity_formula_assignments` stores local override assignments for specific entities.

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

This table is structural support only. Runtime/frontend must still implement the fallback logic.

---

## Current PvE / Exploration Model

The main PvE loop is exploration, not a static hunt screen.

1. The player chooses a direction.
2. Every movement step costs time.
3. The first step also costs time.
4. The first step is not guaranteed to be empty.
5. After step time resolves, the system rolls:
   - first: trial,
   - if no trial: encounter or empty result.

A step may result in:

- empty / flavor-only location,
- encounter,
- trial.

### Trial flow

- **Appearance**: the exploration system rolls whether a trial appears.
- **Manifestation**: even if a trial appears, it may fail to fully occur.
- **Completion**: if the trial manifests, the player still has to clear it.

Manifestation depends on:

- trial difficulty,
- the relevant core stat for that trial,
- supporting modifiers such as Luck / Spirituality depending on final balancing.

### Difficulty tiers

Three difficulty tiers are planned:

- **Easy**
- **Medium**
- **Hard**

Current design intent:

- **Medium** should usually be the best overall progression tier for most players.
- **Hard** should be the highest-ceiling tier, not the universally optimal farming tier.
- **Outstanding** item quality is only available from the highest difficulty tier.

### Daily trial limit

The day is effectively gated by trial count.

After the player uses all available trials for that day:

- exploration ends,
- the player cannot continue walking only for encounters or empty steps.

Premium may increase the number of daily trials / attempts.

Premium should not directly improve:

- drop quality,
- trial success chance,
- or luck outcomes.

It only increases the number of attempts/opportunities.

### Backtracking

Backtracking should be possible within the active exploration session.

Important rules:

- backtracking also costs time,
- previously discovered nodes/branches must be remembered,
- already discovered branch structure must not be rerolled,
- the system should lazily generate only visited/discovered nodes, not a full world map in advance.

The intended model:

- server-side exploration session state,
- lightweight node/branch history,
- optional client cache only for UX,
- important reports stored separately from temporary exploration path state.

### Empty steps

Empty steps are not blank “nothing happened” screens.

They should still show flavor text / location text to maintain atmosphere.

---

## Encounter Model

Current encounter set has 3 types:

### 1. Combat encounter

- a lighter fight than a true trial,
- may injure,
- may kill,
- gives a small amount of EXP.

### 2. Resource encounter

- grants resources such as drachmas, materials or workforce.

### 3. Buff / debuff encounter

- grants one temporary effect,
- only one active buff/debuff may exist at a time,
- no new buff/debuff encounter should apply if one is already active,
- the active buff/debuff lasts until:
  - the next combat encounter,
  - or the next trial,
- then it is consumed/removed.

### Encounter enemies

Encounter combat enemies should be admin-defined and scalable.

The system should eventually support:

- enemy definitions,
- base stats,
- stat growth formulas,
- optional randomized or manual stat assignment,
- gear thresholds by player level,
- optional NPC gear nerfing,
- reuse of the normal gear/bonus model where practical.

### Trial on prototype

On the prototype stage, a trial may simply use the combat system.

This allows testing:

- combat,
- encounters,
- trial flow,
- and later potentially siege combat foundations,

without waiting for all unique trial archetypes to exist.

---

## Core Combat System

### Combat overview

Combat is turn-limited.

If neither side reaches 0 Health before the turn limit, the fight ends in a draw.

Draw:

- gives no reward,
- may leave injuries in PvE,
- should generally not leave persistent injuries in PvP.

### Active attack resolution

The player resolves attacks through a timing minigame with a moving indicator referred to in design discussion as **Walking Dead**.

The player must stop the indicator inside the green hit zone.

### Hit zone width

Base green-zone width depends on:

- **Dexterity of the attacker**,
- **Agility of the defender**,
- PvE difficulty modifiers,
- possible item/effect modifiers.

Current stat meaning in combat:

- **Strength** = damage
- **Dexterity** = offensive hit stat
- **Agility** = defensive anti-hit stat and evasion stat
- **Endurance** = damage reduction / defense
- **Cunning** = critical strike chance
- **Luck** = light modifier to crit and evasion
- **Intelligence** = candidate stat for attack order / combat tempo logic
- **Wisdom** = not currently the primary tempo stat

### Streak system

Every successful timing hit:

- narrows the green zone,
- speeds up Walking Dead.

Every miss:

- resets the streak,
- resets green-zone width and indicator speed to that fight's baseline.

If the timing hit succeeds but the defender evades:

- no damage is dealt,
- but the streak still counts.

### Evasion

After a successful timing hit, the defender gets an evasion check.

Evasion depends on:

- **Agility**
- **Luck**
- item modifiers

### Critical hit

If the attack is not evaded, critical chance is checked.

Critical chance depends on:

- **Cunning**
- **Luck**
- item modifiers

Critical damage multiplier:

- currently x2

### Damage

Weapons use:

- **min damage**
- **max damage**

Actual base weapon damage is rolled between min and max.

Then modified by:

- Strength where relevant,
- item bonuses,
- other combat modifiers.

### Defense and final damage

Defense comes from:

- **Endurance**
- defensive item bonuses

Final damage:

- rolled damage,
- modified by crit if applicable,
- reduced by defense,
- minimum 1 damage on a successful, non-evaded hit.

### Opponent resolution

The opponent does not play the timing minigame.

Opponent attacks are resolved automatically from stats and combat rules.

This is necessary for:

- PvE,
- offline PvP defense,
- automation.

### Number of attacks

The number of attacks does **not** come from stats.

It comes from:

- weapon choice,
- affixes,
- item effects,
- set effects,
- similar combat modifiers.

Examples:

- weapon + shield = fewer attacks, more defense,
- dual wield = more attacks, less defense,
- two-handed = fewer attacks, heavier hits,
- ranged = separate profile, always two-handed, still TBD in detail.

### Shields

Shields should strengthen existing defense layers rather than create many extra sub-systems.

They may support:

- defense,
- endurance,
- evasion.

Do not multiply combat sub-states unnecessarily.

---

## Stat Roles

Current working model:

- **Strength** — damage / impact
- **Dexterity** — offensive hit control
- **Agility** — defensive anti-hit and evasion
- **Endurance** — defense / damage reduction
- **Cunning** — crit chance and some attack-side tactical value
- **Wisdom** — item-usage knowledge gate on equip; can also matter in its own trial archetype
- **Intelligence** — defense-side tactical value; likely attack order / tempo candidate
- **Spirituality** — trial-related pacing / manifestation support; also its own trial archetype
- **Charisma** — prestige gain/loss modulation; also its own trial archetype
- **Luck** — special stat affecting opportunity quality, crit/evasion support, and some trial-facing layers

Every base stat should eventually have its own trial archetype.

---

## Luck

Luck is a special stat.

It should not be treated as a normal point-investment combat stat.

Luck should:

- improve access to better opportunities,
- improve bucket quality,
- improve chance of affixes / quality rolls,
- reduce frequency of the worst outcomes at high values,
- slightly support crit/evasion and some trial systems.

Luck should not:

- guarantee success,
- guarantee best-in-slot items,
- replace a real build.

Luck has no hard global system cap by default.

Its practical ceiling should come from itemization and build structure.

---

## Bonus System Philosophy

The bonus system must be database-driven, extensible and reusable.

Current intended bonus types:

- `flat`
- `percent`
- `per_levels`
- `scaled_stat_bonus`
- `resource_flat`
- `resource_percent`
- `capacity_flat`
- `unlock_feature`

Important notes:

- `per_4_levels` should be generalized into `per_levels`
- bonus `target` is a separate field
- bonus `context` is a separate field
- bonus `category` is an organizational/filter field
- no dedicated `conditional_bonus` type is needed if context exists

Current intended contexts include:

- `global`
- `pvp_attack`
- `pvp_defense`
- `exploration`
- `trial`
- `combat`
- `economy`
- `building_management`

Bonus templates should be a central database resource with their own admin CRUD.

Important current implementation note:

- the desired bonus model is broader than the currently observed old table shape in some database dumps,
- `bonus_templates` may still require a separate refactor/migration,
- do not assume the intended `category/context/per_levels/scaled_stat_bonus` model is fully implemented unless confirmed by the current schema.

---

## Equipment Philosophy

Items follow layered generation:

- quality,
- optional prefix,
- base item,
- optional suffix.

High economic value is not always equal to high direct usability.

Allowed item categories include:

- immediate upgrades,
- economically valuable but awkward items,
- prestige/bait items,
- future-use items blocked by requirements.

Items may have level/stat requirements.

Requirements must be met when equipping the item.

After equip, the item may continue to remain equipped even if the stat would no longer be met by a fresh equip check.

---

## Equipment Slots

Current intended slots:

- hands:
  - weapon + shield,
  - dual wield,
  - two-handed weapon,
  - ranged weapon (always two-handed),
- helmet,
- armor,
- pants,
- boots,
- amulet,
- two rings.

---

## Resources

Important resources:

- Drachmas
- materials
- workforce

Wood and marble are not necessarily two equally separate final economy layers.

Current interpretation:

- they are production inputs / profiles feeding the broader construction-materials economy,
- wood is earlier / less efficient,
- marble is later / more efficient.

---

## Buildings

Buildings are attached to estates / addresses / districts.

Key examples from current design:

- **Agora** — drachma generation
- **Farm** — workforce generation
- **Lumber Mill** — materials generation
- **Barracks** — attack-side PvP Health scaling and/or a small offensive boost
- **Fortress** — defense-side PvP Health scaling and/or a small defensive boost
- **Trade Routes** — unlock / support player trade
- **Armory** — visibility / operational access to stored items, not item deletion on overflow

### Armory rule

Items do not disappear just because they are not currently visible.

Armory controls practical visibility / access / organization, not item existence.

`max_level = 0` may mean unlimited unless feature logic overrides it.

### Formula assignment philosophy

Buildings must support:

- global default formulas by scope,
- optional local formula overrides per building.

This should cover at least:

- upgrade cost,
- upgrade time,
- bonus growth,
- other building-related formula scopes where needed.

If no local formula is assigned:

- fallback to the global default for that scope.

---

## Districts, Estates and Relocation

District progression is a core world system.

The player has an address in a district.

Moving to a new empty estate should be operationally simple:

- choose address,
- click claim/occupy,
- confirm,
- understand that existing buildings are lost,
- rebuild from zero.

### Estate Address Generation / Occupancy Model

Estate district capacity is known from server/world configuration, but empty estates do **not** need to exist as database records.

Important rule:

- the system knows that district A may contain e.g. 5000 addresses,
- but an estate row is created only when an address is actually occupied,
- an empty address has no estate row,
- if an estate becomes ownerless/null through relocation or abandonment, its estate record and related estate-building state can be deleted,
- deleting the occupied estate record is what destroys the old building state,
- if another player later claims the same address, a new estate record is created with a new estate id.

This means:

- address identity and estate record identity are not the same thing,
- `A-0001` may be claimed multiple times across server history,
- every occupation creates a separate estate record,
- relocation to an empty estate is irreversible because old estate/building state is deleted,
- this must be clearly communicated to the player before confirmation.

Frontend can render possible address lists from district capacity:

- it does not need one database row per empty estate,
- it can generate address labels such as `A-0001`, `A-0002`, etc.,
- then overlay occupied addresses loaded from the database.

Occupied address display should show relevant public data, such as:

- character name,
- guild name if applicable,
- available actions such as regular PvP attack or siege.

### Estate ownership

- Estate belongs to a hero, not directly to a global user account.
- Estate should also carry `server_id`.
- Estate address is unique within a server.

### District E

District E always has exactly one address/seat.

This should not vary per server unless explicitly redesigned later.

---

## Siege / Estate Takeover

Estate takeover is a longer PvP/guild process, not a one-click action.

Expected flow:

- siege preparation time,
- possible guild participation,
- defense participation,
- resolution.

If the attacker wins:

- addresses are swapped,
- the winner takes the target estate,
- the loser takes the winner’s old estate.

If the siege fails:

- everyone stays where they are.

Manual siege participation should have action timers.

A player who does not act in time should be auto-resolved by the system.

The exact siege battle model is still to be finalized, but current direction:

- participants fight through a pooled battle model,
- targets may be selected randomly from living opponents,
- leader death may apply a morale/combat penalty,
- exact penalty should be configurable or decided by server/balance rules, not casually hardcoded without design confirmation.

---

## Prestige and Governance

### Prestige system

Use **Prestige** as the main system label.

The player sees:

- only visible prestige tier / rank 1–5.

Under the hood:

- hidden prestige points exist,
- thresholds are not shown directly to players.

The player should be notified when prestige tier changes.

### Prestige behavior

Prestige should:

- grow mainly from meaningful PvP actions,
- grow slightly from PvE successes,
- penalize disgraceful actions more strongly at higher standing,
- not decay simply because time passed,
- not use collective guild punishment.

### Prestige ranks

Current working Greek-inspired rank set:

1. **Thetes**
2. **Zeugitai**
3. **Hippeis**
4. **Archontes**
5. **Basilikoi**

These are in-world names and should remain untranslated in all UI languages.

Descriptions/tooltips may be localized.

### Council / governance

Higher districts feed into a server council model.

The council should:

- participate in E1 selection,
- vote on server-wide events.

Before council requirements are met, server events may still be:

- system-triggered,
- admin-triggered.

Only the highest prestige tier should be eligible to contend for the highest seat / E1 equivalent, but not everyone of that tier must automatically occupy it.

---

## Report Snapshots / Sharing

The system must support public/shareable report snapshots.

Core rule:

- a shareable report is a historical snapshot of an in-game event,
- externally it should render as a faithful reproduction of the in-game view of that event,
- but using historical snapshot data, not current live game data.

Important rules:

- reports should have their own public identifiers / URLs,
- report URLs should be shareable,
- reports may be visible even to non-logged-in users,
- important reports must be stored separately from temporary exploration path/session data,
- tooltips in reports must use snapshot data of the referenced entities, not current live values,
- player names in reports may link to a public in-game profile if applicable,
- public reports should not expose private account data.

Current important report types:

- `trial`
- `encounter`
- `pvp_combat`
- `siege`

Notes:

- trial reports should reflect the full trial result as shown in-game,
- if a trial in-game view includes drop/reward, the report should show it too,
- encounter reports should mirror the in-game encounter view,
- PvP reports should mirror the in-game PvP combat view.

---

## PvP Travel Timer

Regular PvP attacks should not be instant.

When a player attacks another estate/character:

- the attacker must travel for a calculated amount of time,
- closer targets should take less time,
- distant targets should take more time,
- there should be a hard minimum travel time, e.g. at least 1 minute even for a nearby address.

The exact distance formula is still provisional, but the design intent is:

- geography/address distance matters,
- PvP has pacing and anticipation,
- instant repeated attacks should be avoided.

---

## Server Configuration vs Product-Level Cadence

Not every rule should become server-specific configuration.

Some systems are so core to the identity and pacing of the game that they should be treated as product-level rules rather than casual per-server knobs.

Strong candidates for hardcoded/product-level cadence:

- daily trial count,
- daily attack count,
- base exploration step timing model,
- manual siege action timer,
- base PvP travel-time model/minimum,
- possibly base siege preparation duration if treated as part of the core game promise.

Reason:

- these values define the game’s rhythm,
- changing them per server may confuse players,
- changing them should require deliberate product/code change, not casual admin tuning.

Other systems may still be data-driven or configurable:

- item balance,
- affix/prefix values,
- building effects,
- drop tables,
- combat formulas,
- event effects,
- test/admin overrides.

Guiding rule:

**Configurable does not mean freely changeable at any time.**

Some values can be database-driven for implementation reasons but still locked by policy after launch or treated as product-level constants.

---

## Anti-Abuse Direction

One account / one hero rules only solve part of abuse.

They can prevent:

- one account creating many heroes on one normal server.

They do not prevent:

- one person creating many accounts.

Multi-account abuse will require a separate detection and admin-review system.

Potential signals:

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

## Audit / Logging Direction

Audit logging is required for moderation, debugging, anti-abuse and admin accountability, but it is a separate system from config governance.

Long-term audit goals:

- record important gameplay actions,
- record administrative actions,
- record balance/configuration changes,
- record suspicious economy/trade events,
- support admin/operator review,
- provide evidence for bans/suspensions,
- help debug “my item disappeared” or similar reports.

Do not log meaningless UI clicks by default.

Prefer logging meaningful domain events, such as:

- item trade completed,
- item transferred,
- item scrapped/sold,
- PvP attack created/resolved,
- siege created/resolved,
- trial completed,
- report generated,
- admin changed config,
- operator suspended/banned a user on a server,
- balance change set applied.

Audit log implementation should come after the core config governance model or be designed to integrate with it.

---

## Test / Admin Tooling Notes

During development and testing, admin/tester tooling should eventually support:

- shortening or bypassing exploration timers,
- restoring or adding daily trial count,
- forcing trial generation,
- forcing encounter generation,
- setting or clearing active buff/debuff,
- switching between multiple sandbox heroes for one privileged account,
- generally accelerating exploration/combat testing workflows.

These are testing tools, not normal gameplay features.

---

## Localization Rule

Core in-world proper names remain in Greek across all language versions.

Only explanatory text is localized.

This applies to:

- prestige ranks,
- building names where intended,
- similar core world proper nouns.

---

## Frontend / Technical Rules

The stack is:

- Angular 21
- zoneless
- signals-based
- modern Angular patterns only.

Prefer:

- signals,
- computed signals,
- effects where appropriate,
- typed domain models,
- mappers from backend data to domain/UI models,
- modular feature structure.

Avoid:

- promise-heavy default architecture,
- outdated Angular patterns,
- zone-dependent assumptions,
- imperative UI logic where signal composition fits better.

After server/hero migration:

- do not treat `auth.uid()` as `hero.id`,
- load selected/active server,
- load active hero by `user_id + server_id`,
- use `hero.id` only as character id,
- update all services/facades/mappers/RLS-aware queries accordingly.

---

## Repository Organization

Use these broad feature boundaries:

- `src/app/public`
- `src/app/auth`
- `src/app/admin`
- `src/app/hero`
- `src/app/game`
- `src/app/layout`
- `src/app/shared`
- `src/app/core`

`core` is for:

- services,
- domain models,
- mappers,
- interfaces/types,
- config/constants,
- enums,
- validators,
- helpers/utils,
- reusable technical infrastructure.

---

## What Codex Should Treat As Provisional

Unless explicitly confirmed elsewhere, these areas are still subject to change:

- exact formulas,
- exact district thresholds,
- exact prestige thresholds,
- exact building effects,
- exact premium numbers,
- exact trial progression curve,
- exact combat tempo / initiative formula,
- exact ranged-weapon formula,
- exact report payload structures,
- final naming cleanup for Hero Points / Character Points,
- full anti-abuse implementation details,
- final audit log implementation details,
- exact config change set UI/workflow,
- final server balance deployment/change-set model.

Do not over-freeze provisional gameplay values into code without leaving room for balancing/admin control.
---

# Update 2026-04-26 — requirements and building district configuration

## Requirements

Requirements are a central gameplay/configuration concept.

Requirements define whether a hero or entity can equip, build, unlock, use or perform something.

Requirements are separate from:

- costs — what the player pays,
- bonuses — what the player receives.

Current database direction:

- requirement definitions are stored in `requirement_definitions`;
- requirements attached to concrete entities are stored in `entity_requirements`;
- old `building_requirements` and `buildings.requirements` are legacy/transitional.

New feature work should use the central requirements system instead of creating new requirement JSON fields.

Current requirement categories include hero gates, prestige/rank gates, stat gates, building-level gates, resource gates, district gates and Trade Routes access.

## Buildings, districts and caps

`buildings.district_code` is the minimum district where a building can be built.

A building is available in its minimum district and every higher district.

`buildings.max_level` is the global/default max level for a building.

- `0` means unlimited.
- District-specific max-level exceptions live in `building_district_level_caps`.
- `building_district_level_caps` stores overrides only.
- Missing override means use `buildings.max_level`.

Example: a building can be globally unlimited but capped at level 20 in district A through a single override row for A.

District caps are part of building balance and should be managed in building/admin configuration together with costs, build time, bonus rows, formula assignments and requirements.

## Implementation guidance

When implementing building availability or upgrade validation:

1. Check whether the building is available in the estate district.
2. Resolve effective max level:
   - district override if present,
   - otherwise `buildings.max_level`.
3. Treat `0` as unlimited.
4. Apply central `entity_requirements` as additional gates.
5. Keep costs separate from requirements.

Do not rebuild the old model where `rank_required` alone determines building availability.

---

# Update 2026-04-27 — equipment, Armory and item lifecycle context

## Equipment state and slots

Equipment state is a hero-level relation, not an item lifecycle status. The item row tracks ownership, lifecycle and market state. A separate hero-equipment relation should track which owned item is currently equipped in which slot.

The current conceptual slot model is:

- `main_hand`;
- `off_hand`;
- `helmet`;
- `armor`;
- `pants`;
- `boots`;
- `amulet`;
- `ring_1`;
- `ring_2`.

The hand model must support one-handed weapon, one-handed weapon plus shield, dual wield where allowed, two-handed melee weapon, and ranged weapon. Ranged weapons are treated as two-handed unless explicitly redesigned later.

Equipped items should be automatically removed from equipment when ownership changes, when the item is deleted, or when it becomes scrapped. Do not rely on every market/scrap/admin operation remembering to manually unequip the item.

## Equip, unequip and replacement UX

Equip and unequip are immediate actions. There is no timer, cooldown, cursed-item behavior or default equip/unequip cost.

If a player equips an item into an occupied compatible slot, the new item replaces the current item in that slot. The player should not have to manually unequip first.

For ambiguous single-equip cases such as rings or compatible one-handed weapon slots, a single equip action may replace a random compatible occupied slot unless a more explicit UI flow is implemented.

Bulk equip and saved equipment sets provide more controlled alternatives.

## Equip requirements

Requirements are checked when equipping.

The candidate item’s own bonuses do not help satisfy its own requirements. Already active bonuses from other equipped items or other active sources may help.

If the candidate item would replace another equipped item, validation should use the state after removing the replaced item, but before applying the candidate item’s bonuses.

After an item is equipped, it may remain equipped even if the hero later stops meeting its requirements. If unequipped, requirements must be met again to equip it later.

The equipment UI should disable Equip when requirements are not met and should show the final item requirement list with clear met/unmet indicators.

## Bulk equip

Bulk equip means equipping two or more selected items without using a saved set.

Bulk equip may equip only the selected items that are legal according to the progressing equipment state. It is not all-or-nothing.

Bulk equip does not solve circular dependencies. If two unequipped selected items only satisfy each other, neither should be equipped.

If one selected item can be legally equipped first and then makes another selected item legal, the system may equip both in sequence.

Bulk equip should be deterministic when practical. Selecting two rings should equip those rings into the ring slots if legal, rather than using random single-equip replacement behavior.

## Saved equipment sets

A saved equipment set stores exact item IDs from a legal equipped state.

Re-equipping a saved set should not require re-solving the individual item requirement path. The set represents a previously legal configuration.

A saved set does not accept equivalent replacements. If the saved set contains a specific item ID and that item is sold, scrapped, confiscated, deleted or otherwise unavailable, another item with the same visible name/prefix/suffix does not count.

Saved set equip is all-or-nothing. If any item in the set is unavailable, no part of the set is equipped.

## Market-listed and locked items

A listed, `locked_trade`, or `locked_auction` item may remain equipped and active while still owned by the hero.

Market locks prevent scrapping and prevent using the same item in another market channel. They do not disable equipment effects by themselves.

If the item is sold, transferred, bought through buy now, confiscated or otherwise removed from the hero’s ownership, it should be automatically unequipped and later actions should use the updated equipment state.

## Armory visibility and shelves

There is no hard owned-item limit. Armory limits visible / operational access, not ownership.

Armory visible capacity should come from the normal bonus system, not from hardcoded Armory-specific capacity logic. A future or existing bonus target such as `visible_item_capacity` / `armory_visible_capacity` may be used depending on final naming.

Armory UI should show owned item count versus resolved visible capacity, for example `76/80` or overloaded `251/100`.

Visibility order:

1. equipped items;
2. listed / market-locked items;
3. higher shelf / visibility tier;
4. lower shelf / visibility tier.

Within the same priority and shelf group, items are ordered by generation time from oldest to newest. Newer and lower-priority items are hidden first when capacity is exceeded.

“Shelf” is the current working term. The final UI name may change later.

Shelf / visibility tier is item state and transfers with the item when ownership changes.

## Scrap and database hygiene

The game should not limit drops simply because the player owns many items. Instead, Armory visibility pressure should encourage players to clean up low-value items.

Items without prefix and suffix are permanently removed immediately when scrapped, regardless of quality or drachma value.

Items with prefix and/or suffix enter `scrapped` / recoverable state and may be permanently removed after up to 30 days.

Quality alone does not make a no-affix item recoverable.

This model pushes item cleanup pressure to the player without blocking drops or requiring broad manual database cleanup.

## No durability

Mythborne does not use item durability by default. Durability would mostly create a routine drachma/material sink rather than an interesting decision. Resource sinks should primarily live in buildings, estate progression and strategic systems.

## Duplicate items, affix variants and set direction

Duplicate equipped items are allowed where slots allow them. Two rings with the same prefix/suffix may be equipped at the same time.

Affix-family set bonuses are allowed as a future direction. Example: `Glowing Amulet` plus two `Glowing Rings` may contribute to a `Glowing` set bonus.

The same affix family/name may have different bonus profiles by item slot, category or weapon profile. Example: `Demonic` may be weaker on a one-handed weapon than on a two-handed weapon.

Do not introduce unique items, special base variants, or hidden item layers as part of the default item model.

## Future super-quality direction

A separate super-quality layer such as `Mythic` may be considered much later, after the game and economy mature. This would be an additional layer above normal quality, not a replacement for normal qualities.

Example future distinction:

- `Mythic Demonic Sword`;
- `Mythic Quality Demonic Sword`.

These would be different item outputs because `Mythic` would provide its own super-multiplier while `Quality` remains the normal quality layer. This is a future expansion direction, not part of launch scope.

## Manual combat/trial fallback direction

Manual combat and trials should eventually have resilience against disconnects, tab closes and intentional exits.

A manual fight should not disappear when the player disconnects or leaves. It should auto-complete with reduced player agency and worse expected control/outcome than competent manual play.

A trial should likewise resolve automatically/proportionally with lower expected success or control than manual play. Auto-resolve is a safety fallback, not an optimal strategy.

Combat/trial systems should allow dynamic equipment state. If equipment changes during an activity, later resolved actions should use the updated equipment-derived values. Reports should snapshot the values actually used at each step.
