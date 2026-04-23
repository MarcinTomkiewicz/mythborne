# Monster Hunt — Database Current Notes

This file is not a full schema dump.
It is a lightweight semantic guide for the most important domain tables and rules.

If this file conflicts with migrations, prefer migrations and update this file later.

## General Rules
- PostgreSQL / Supabase
- relational modeling
- RLS-enabled user data
- explicit keys and constraints preferred
- central bonus-template model preferred over hardcoded stat columns everywhere

## Canonical Base Stats
Base stats come from the stats table and should be treated as canonical.

Current canonical set:
- strength
- dexterity
- endurance
- agility
- cunning
- charisma
- wisdom
- intelligence
- spirituality

Do not hardcode old stat lists from outdated concept docs.

## `hero_stats`
Purpose:
- stores base stat values for a hero

Notes:
- keyed by hero and stat key
- should align with the canonical stats table

## `hero_derived`
Purpose:
- stores derived/special values such as:
  - hp
  - defense
  - min damage
  - max damage
  - luck

Notes:
- luck is treated as a special derived/equipment-sensitive stat, not a normal point-investment stat

## `bonus_templates`
Purpose:
- central definition of bonuses

Pattern:
- `target`
- `type`
- `description`

Use:
- origins
- items
- buildings
- other modular bonus systems

Design rule:
Prefer modular bonus linking over hardcoded effect columns across many domain entities.

## `buildings`
Important columns:
- `key`: canonical technical identifier
- `name`
- `description`
- `rank_required`
- `district_code`
- `image_path`
- `sort_order`
- `base_cost`
- `base_build_time_minutes`
- `max_level`
- `requirements` (jsonb)

Important semantics:
- `district_code` links building availability to estate district logic
- `rank_required` is a progression gate, but should not be simplistically treated as the same thing as district
- `requirements` is a flexible extension point for future gating
- `max_level = 0` may mean unlimited, depending on feature logic
- building descriptions may still be conceptual, not final effect specs

## Estate / district layer
The game has a separate estate/district system.

Important conceptual distinction:
- district / estate access
- building availability
- player level
- prestige / reputation

These are related but not identical systems.

Do not collapse them into one variable unless explicitly instructed.

## Migrations as source of truth
When implementing schema-sensitive features:
1. read relevant migrations,
2. read current seed data if needed,
3. only use this file as a semantic shortcut.

This file should be updated when:
- a table meaning changes,
- a key relation changes,
- a gameplay-relevant column is added,
- or a major naming decision changes.
