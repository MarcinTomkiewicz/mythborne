<!-- HANDOFF_OVERRIDE_START -->
# Handoff agent instructions — 2026-04-27

For next conversation and Codex review:
- Use Polish for Codex prompts/comments unless user requests otherwise.
- Preserve exact filenames.
- Do not modify Codex status files unless user asks or confirms task completion.
- Treat `database-current.md` as the semantic DB/RPC/helper registry.
- Before starting a new backlog task, run `git status --short`; if the working tree is not clean, report it and wait for the user decision instead of starting the next task.
- Always check current generated types/schema when implementing schema-sensitive logic.
- Do not reintroduce `hero_derived` usage.
- Use `scope`, not `context`, for bonus semantics.
- Use DB dictionaries instead of hardcoded gameplay/config lists.
- Keep critical mutations behind domain/RPC/governance paths.
- For D4 review, see handoff sections in backlog/todo/state files.
<!-- HANDOFF_OVERRIDE_END -->

# AGENTS.md — Mythborne implementation guidance

## Purpose
This file is the short execution-oriented guide for coding agents working on Monster Hunt.

Prefer this file for fast implementation context.
For broader detail, also consult:
- `project-context.md`
- `current-decisions.md`
- `database-current.md`

If there is a conflict, prefer:
1. explicit user instruction,
2. current migrations / schema,
3. `current-decisions.md`,
4. this file.

## Tech stack
- Angular 21
- zoneless
- signals-based
- modern Angular only

Prefer:
- signals
- computed signals
- effects where appropriate
- typed domain models
- mappers from backend data to domain/UI models
- modular feature boundaries
- configurable gameplay values

Avoid by default:
- promise-heavy architecture
- outdated Angular patterns
- zone-dependent assumptions
- legacy Angular habits
- hardcoding gameplay constants that are likely to be balanced later

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

Do not casually rename the main PvE loop back to “monster hunt” in implementation language.

Core in-world names should remain Greek across language versions.
Localize descriptions and explanatory text, not the proper names themselves.

## Core PvE loop
Exploration flow:
1. player chooses direction
2. every movement step takes time
3. first step also takes time
4. roll for **trial**
5. if no trial, roll **encounter or nothing**
6. encounter and trial do not happen at the same time

Important:
- trial chance increases after consecutive non-trial steps
- encounter does **not** reset trial progression
- trial resets the progression
- all exploration ends when daily trials are exhausted
- backtracking should be possible and should cost time
- previously discovered branches should be remembered, not rerolled

## Encounter types
Current intended encounter set:
- combat
- resource
- buff/debuff

### Buff/debuff rule
- only one active buff/debuff at a time
- if one is already active, do not stack/apply another one
- active buff/debuff lasts until the next combat encounter or the next trial
- then it expires

## Core combat loop
Combat is turn-limited.

If neither side reaches 0 Health before the turn limit:
- result = draw

Draw:
- gives no reward
- may leave injuries in PvE
- generally should not leave persistent injuries in PvP

### Player attack resolution
The player attacks through the timing minigame:
- moving indicator nickname: **Walking Dead**
- player must stop it inside the green zone

### Hit zone
Base green-zone width depends mainly on:
- attacker **Dexterity**
- defender **Agility**
- PvE difficulty modifiers
- item/effect modifiers

### Streak
Successful timing hits:
- narrow the green zone
- speed up Walking Dead

Miss:
- resets streak
- resets zone width and speed to that fight's baseline

Evaded hit:
- deals no damage
- still counts toward streak

### Evasion
After a successful timing hit:
- defender rolls evasion

Evasion depends mainly on:
- Agility
- Luck
- item modifiers

### Crit
If hit is not evaded:
- roll crit

Crit depends mainly on:
- Cunning
- Luck
- item modifiers

Current crit multiplier:
- x2

### Damage
Weapons use:
- min damage
- max damage

Final successful non-evaded hit:
- roll damage in weapon range
- apply relevant modifiers
- reduce by defense
- minimum 1 damage

### Opponent
Opponent attacks resolve automatically from stats/rules.
Do not require real-time enemy interaction.

### Attack count
Number of attacks comes from:
- weapon choice
- item effects
- affixes
- set effects

Not from raw stat points.

### Equipment combat profiles
Examples:
- weapon + shield = fewer attacks, more defense
- dual wield = more attacks, less defense
- two-handed = fewer attacks, stronger hits
- ranged = separate profile, always two-handed, still provisional

Shields should strengthen existing defensive layers instead of creating too many extra combat sub-systems.

## Current stat roles
- **Strength** = damage
- **Dexterity** = offensive hit control
- **Agility** = defensive anti-hit and evasion
- **Endurance** = defense / damage reduction
- **Cunning** = crit chance and some attack-side tactical value
- **Wisdom** = knowledge gate on equip; also its own trial archetype
- **Intelligence** = tactical/tempo candidate; likely attack-order candidate
- **Spirituality** = trial pacing / manifestation support; also its own trial archetype
- **Charisma** = prestige gain/loss modulation; also its own trial archetype
- **Luck** = special support stat; not a normal point-investment combat stat

Every base stat should eventually have its own trial archetype.

## Bonus system
Current intended bonus types:
- `flat`
- `percent`
- `per_levels`
- `scaled_stat_bonus`
- `resource_flat`
- `resource_percent`
- `capacity_flat`
- `unlock_feature`

Current intended scopes:
- `global`
- `pvp_attack`
- `pvp_defense`
- `exploration`
- `trial`
- `combat`
- `economy`
- `building_management`

Important:
- `per_4_levels` should be generalized into `per_levels`
- target is separate from type
- scope is separate from type
- category is an organizational/filter field
- bonus templates should be centrally managed in the database
- buildings should support local formula overrides with fallback to global defaults

## Prestige
System label:
- **Prestige**

Player sees:
- only prestige rank/tier
- not the raw hidden points

Current working ranks:
1. Thetes
2. Zeugitai
3. Hippeis
4. Archontes
5. Basilikoi

These names remain untranslated in UI.

Prestige should:
- come mainly from meaningful PvP
- come slightly from PvE
- not decay passively over time
- punish disgraceful actions more strongly at higher standing
- not use collective guild punishment

Council/governance should:
- help choose E1-like seat
- vote on server-wide events

Before council thresholds are met:
- server events may still be system-triggered or admin-triggered

## Reports
The system must support shareable public report snapshots.

Core rule:
- a report externally reproduces the in-game view of the event,
- but uses historical snapshot data instead of live current game data.

Important report types:
- `trial`
- `encounter`
- `pvp_combat`
- `siege`

Tooltips in reports should use snapshot data for the referenced entities.
Player names may link to public in-game profiles where applicable.
Public reports should not expose private account data.

## Buildings
Buildings belong to the estate/world layer, not just a personal upgrade tree.

Key current A-tier concepts:
- Agora
- Farm
- Lumber Mill
- Barracks
- Fortress
- Trade Routes
- Armory

Armory rule:
- items do not disappear because they are not visible
- armory controls practical visibility/access/organization

## Equipment model
Current intended slots:
- hands:
  - weapon + shield
  - dual wield
  - two-handed weapon
  - ranged weapon (always two-handed)
- helmet
- armor
- pants
- boots
- amulet
- two rings

## Database guidance
This repo should treat migrations/schema as technical source of truth.

Do not invent old stat lists or old gameplay assumptions from outdated concept docs.

Important semantic assumptions:
- canonical base stats come from the stats table
- `hero_derived` should cover values like health, defense, min/max damage, luck
- weapon damage should support min/max ranges
- attack count should come from equipment logic, not raw stats
- `buildings` has `district_code`, `rank_required`, `requirements`, `max_level`, etc.
- exploration path/session data is temporary state
- shareable reports are separate historical snapshots

## Estate/address implementation rule
Do not pre-create rows for all empty estates.

Use district capacity to derive possible addresses.
Only occupied estates should exist as rows.
When a player abandons/relocates from an estate, the old estate row and related building state can be deleted.
If the same address is later claimed again, create a new estate row with a new id.

Frontend may generate address labels from capacity and overlay occupied addresses returned from the database.

## PvP travel timer
Regular PvP attacks should not be instant.
Attacks should have travel time based on distance/address/geography, with a hard minimum such as 1 minute.
Exact formula is TBD.

## Product-level cadence
Some values should be treated as product-level constants / hardcoded cadence, not casual server-specific admin settings:
- daily trial count,
- daily attack count,
- base exploration step timing,
- manual siege action timer,
- base PvP travel-time minimum/model,
- possibly base siege preparation duration.

Keep balancing configurable where appropriate, but do not turn every foundational gameplay cadence value into a casual per-server knob unless explicitly instructed.

## Implementation style
When something is still being balanced:
- keep it configurable
- prefer admin-configurable or data-driven values
- avoid baking temporary numbers deep into code

When something is ambiguous:
- keep implementation extensible
- do not guess aggressively
- call out assumptions clearly

## Verification and smoke reports

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

Non-blocking findings found during smoke should go to `docs/ui-ux-notes.md` unless the user promotes them into current task acceptance criteria.

Group UX notes as:

- **Quick wins**: copy, spacing, labels, obvious validation, small template/component cleanup.
- **DB metadata needed**: UI needs labels/descriptions/helper text/read models/options that should come from database contracts.
- **Redesign needed**: workflow, information architecture, permissions, or domain model mismatch that should not be patched locally.

---

## Update 2026-04-27 — item generation/equipment DB contract

Codex must treat the current item generation/equipment database model as authoritative:

- base item types are in `item_generation_base_types`;
- required/optional native target rules are in `item_generation_base_type_targets`;
- concrete base item native values are in `entity_bonuses` with `entity_type = item_generation_base`;
- `item_generation_bases.base_type_key` is the source of truth;
- `item_generation_bases.slot` is legacy/deprecated;
- equipment state is in `hero_equipment`, not on `items.status`;
- Armory shelf names are in `hero_armory_shelves`;
- item shelf position is `items.armory_shelf_position` and transfers with item ownership;
- visible Armory capacity uses existing bonus target `visible_item_capacity`;
- do not invent `armory_visible_capacity`;
- `attack_count` and `critical_damage` are bonus targets;
- no equip/unequip RPC is currently approved/documented yet.

Before coding against these structures:

1. read `database-current.md`;
2. regenerate `database.types.ts` if the local generated types do not include the new schema;
3. do not create alternative table/RPC names;
4. report missing DB contracts as blockers instead of inventing them.
