# Monster Hunt - Current State Summary

Updated: 2026-04-24

This file summarizes the current implementation state against:
- `docs/project-context.md`
- `docs/database-current.md`
- `docs/current-decisions.md`

If code, migrations, and this file diverge, prefer code and migrations, then update this file.

## Overall Completion Snapshot

This is an operational estimate, not a formal audit.

| Area | Approx. completion | Notes |
| --- | --- | --- |
| Angular 21 / zoneless / signals architecture | 85% | Active pattern across current feature work. |
| Auth / hero bootstrap / stat loading | 75% | Core hero data, stats, and derived stats are loaded and used in multiple screens. |
| Item generation and balance admin | 85% | Quality tiers, bucket profiles, formulas, previews, assignments, and bonus types are live. |
| Building admin and estate building preview | 70% | Definitions, progression formulas, requirements, costs, and previews exist. Real build execution is still placeholder. |
| Bonus-template based modular stats | 75% | Used across origins, items, and buildings, including `percent` and `per_4_levels`. |
| Formula system | 85% | Targets, formulas, assignments, block library, human preview, chart, target-defined variables, and combat balance targets are implemented. |
| Hero progression formulas | 70% | Stat cost and cap formulas are live, including support for `statLevel`. |
| Armory / item visibility layer | 50% | Core item catalog and armory surface exist, but broader gameplay loops are still incomplete. |
| Combat | 35% | `/game/combat` now has a 10-turn Walking Dead duel with formula-driven hit/evasion/crit/damage, but it is still sandbox-only and not tied to rewards or exploration. |
| Exploration / trials / encounters | 5% | Documented conceptually, not implemented as a real loop yet. |
| Prestige / reputation | 0% | Not implemented yet. |
| Guilds / politics / sieges | 0% | Not implemented yet. |
| Trade / economy gameplay loop | 10% | Resources and some building/resource groundwork exist, but the real system is not built. |

## What Is Implemented

### Frontend / architecture
- App is aligned with Angular 21 standalone structure.
- Current feature work follows zoneless and signals-first patterns.
- Shared non-component form/config logic has been moved toward `core`.
- Reusable UI helpers such as form field renderers and tag-link components are in shared UI.

### Canonical stats and derived stats
- Base stats are loaded from canonical stat definitions.
- Derived stats are loaded separately and displayed in hero/game screens.
- Origin bonuses are applied through the modular bonus system rather than hardcoded per-feature columns.

### Bonus template model
- `bonus_templates` is used as a central bonus definition source.
- Supported bonus types now include:
  - `flat`
  - `percent`
  - `per_4_levels`
- Bonus normalization and formatting are shared through utils.

### Item generation / item balance
- Item generation balance admin has working CRUD for:
  - quality tiers
  - bucket profiles
  - global formulas
  - formula assignments
- Quality tier validation enforces weight totals for enabled tiers.
- Bucket profile preview updates reactively.
- Bucket profile key generation is automated from name.
- Formula editor supports:
  - human-readable preview
  - function/tooltips
  - chart preview
  - block insertion
  - template insertion
  - target-level variable management

### Formula platform
- Formula targets, formulas, assignments, and formula blocks are backed by Supabase tables.
- Formula runtime evaluates only functions and variables allowed by the selected target.
- Unknown custom variables are no longer silently accepted.
- Target variables are now editable and persisted.
- `statLevel` is supported in the stat progression target and runtime.
- Combat balance is now also configured through formula targets for:
  - Walking Dead green-zone width
  - evasion chance
  - critical chance
  - final damage

### Buildings / estate layer
- Building admin supports:
  - building definitions
  - district availability
  - progression inputs
  - requirements
  - bonus rows
  - cost rows
  - formula assignment
  - preview of next level costs/time/bonuses/requirements
- Mansion page displays current building state and formula-based next-step previews.
- This is currently preview/admin heavy. Real construction execution is not implemented yet.

### Combat
- `/game/combat` is no longer a placeholder.
- Current hero data is loaded and mapped into a combat snapshot.
- A demo opponent with base stats around 5-10 and derived combat values is created.
- The current slice uses:
  - Walking Dead timing for player attacks
  - automatic opponent attacks
  - a 10-turn limit
  - victory / defeat / draw resolution
  - streak-based green-zone narrowing and speed increase
- Hit zone width, evasion, critical chance, and final damage are read from admin-managed combat formulas.
- This is intentionally still a sandbox slice, not the final PvE/PvP system.

## What Is Only Partially Realized

### Item philosophy from business context
Partially realized:
- layered item generation exists
- quality and affix systems exist
- requirement-driven gating exists in the data model and formulas

Not fully realized:
- broader loot loop in exploration/trials
- economic weirdness / awkward but valuable items as a live gameplay loop
- stronger market/trade consequences

### Buildings as estate/world progression
Partially realized:
- district-linked building definitions exist
- building previews and admin balancing exist
- resources are connected conceptually to buildings

Not fully realized:
- real relocation consequences
- siege-driven estate takeover
- build queue / build execution / timers / claims

### Luck philosophy
Partially realized:
- luck exists as a derived stat
- luck is treated separately from standard point-invested stats
- item-generation design clearly leaves room for luck-sensitive variance

Not fully realized:
- exploration/trial manifestation influence
- encounter influence
- bucket filtering / dry-streak emotional tuning in live gameplay

### Trial / exploration loop
Mostly not realized yet:
- no live movement loop
- no progressive trial chance tracker
- no manifestation stage
- no daily trial cap flow
- no difficulty-tier execution loop

## Current Decision Alignment

### Strongly aligned already
- Angular 21 / zoneless / signals-first implementation direction
- Modular bonus-template approach
- Buildings treated as estate/world-side systems rather than just player talents
- Formula/balance systems left configurable for admin balancing
- Hardcoded gameplay values reduced where balancing is expected later

### Only conceptually aligned so far
- Exploration + trials as the main PvE loop
- Trial appearance vs manifestation vs completion separation
- Hard-only access to the top quality tier in the actual PvE reward loop
- Reputation / prestige as a separate axis
- Guild coalitions and politics

## Database Semantics Check

Aligned with `docs/database-current.md`:
- canonical stat loading from database-backed stat definitions
- separate handling of base and derived stats
- central `bonus_templates` model
- building definitions with progression-related metadata
- formula targets with `allowed_variables` and `default_test_context`

Still pending at the gameplay level even if partially supported in schema:
- trials / encounters / manifestation-specific storage and runtime flow
- estate conflict / siege persistence
- reputation / prestige persistence and scoring

## Important Notes For Next Work

- `core` should continue to hold non-component logic:
  - domain models
  - domain-specific services
  - mappers
  - helpers/utils
  - feature config
- New gameplay systems should be split into small vertical slices.
- Combat should now evolve from the sandbox slice into reusable domain pieces, not a giant monolithic combat engine.
- Exploration, encounter, and trial logic should be built on top of the current formula/stat/bonus foundation instead of bypassing it.
