# Mythborne — Database Current Notes

This file is not a full schema dump.

It is a lightweight semantic and architectural guide for the most important domain tables and rules.

If this file conflicts with migrations, prefer migrations and update this file later.

Priority order:

1. explicit user instruction,
2. current database schema / migrations,
3. `current-decisions.md`,
4. this file.

---

## General Rules

- PostgreSQL / Supabase.
- Relational modeling is preferred.
- RLS-enabled user data.
- Explicit keys and constraints preferred.
- Central bonus-template model preferred over hardcoded stat columns everywhere.
- Database schema and migrations are the technical source of truth.
- This file explains intended meaning and design direction, not every physical column.

Important naming note:

- Current canonical project/game name is **Mythborne**.
- Older names such as Monster Hunt may remain in legacy files until cleaned up.

---

## Server / World Model

### `game_servers`

Purpose:

- stores logical game worlds / realms inside the same database and application.

A game server is:

- a logical world,
- not a separate machine,
- not a separate deployment,
- not a separate database,
- not a separate Supabase project.

Important intended columns:

- `id uuid`
- `key text`
- `name text`
- `kind public.game_server_kind`
- `status public.game_server_status`
- lifecycle timestamps such as `created_at`, `updated_at`, `launched_at`, `archived_at`.

### `game_server_kind`

PostgreSQL enum.

Current values:

- `sandbox`
- `standard`

No `seasonal` or `event` value for now.

If those are needed later, add them deliberately through a later migration and design decision.

### `game_server_status`

PostgreSQL enum.

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

### Default sandbox server

Initial server/world migration creates a default sandbox.

Current intended values:

- `key = sandbox`
- `name = Sandbox`
- `kind = sandbox`
- `status = live`

This sandbox is a permanent internal test world, not a normal production server.

### Sandbox access

Sandbox should not be treated as a normal public server.

Normal players should see/use standard scheduled/live servers.

Admin/operator/tester or assigned server staff may see and use sandbox/testing environments according to access policies.

---

## Global Account / Hero Model

### Global account

User account is global.

Global account identity comes from:

- `auth.users`
- `user_data`

Do not treat user account as server-specific.

### `hero`

Purpose:

- stores server-specific player characters.

After the server/hero migration:

- `hero.id` is the character id,
- `hero.user_id` references the global account,
- `hero.server_id` references the game server/world.

Critical rule:

**Do not assume `hero.id = auth.uid()` after the server/hero migration.**

Correct identity model:

- `auth.uid()` / `user_data.id` = global account id,
- `hero.id` = specific character id,
- `hero.user_id` = owner account id,
- `hero.server_id` = game server id.

Correct loading flow:

1. authenticate user,
2. determine accessible / selected server,
3. load hero for `user_id + server_id`,
4. use `hero.id` for gameplay-owned data.

Any code, RLS policy, mapper, facade, query or service that assumes `hero.id === auth.uid()` must be updated.

### Hero uniqueness

Hero name:

- must be unique within a server.
- preferred constraint: `unique(server_id, name)`.

Normal non-sandbox servers:

- one account should have at most one hero on a given server.

Sandbox servers:

- privileged accounts may have multiple heroes for testing.

Because sandbox has an intentional exception, do not enforce one-hero-per-server with a simple unconditional `unique(user_id, server_id)` constraint.

Preferred enforcement:

- `unique(server_id, name)` for names,
- trigger/domain policy for one hero per account per non-sandbox server,
- sandbox exception for admin/operator/tester/server staff.

---

## Roles / Membership / Staff Tables

### `roles`

Purpose:

- global account-level roles.

Current design:

- keep `roles` as a table,
- use stable technical `key`.

Known role keys:

- `admin`
- `moderator`
- `player`
- `operator`
- `tester`

Role meaning:

- global role describes account-level capability,
- global role does not automatically mean authority on every game server,
- server-specific authority should be represented through `server_staff_assignments`.

Do not replace global roles with a plain text field.

### `server_memberships`

Purpose:

- stores user participation state on a specific game server.

This is a table.

Its `status` is a PostgreSQL enum: `server_membership_status`.

Current values:

- `active`
- `suspended`
- `banned`

Meaning:

- `active` — user participates normally on that server.
- `suspended` — temporary server-specific ban/suspension.
- `banned` — permanent server-specific ban, with possible manual admin reversal.

No `left` status for now.

Characters are not deleted simply because a user stops playing.

Important:

- membership is administrative participation state,
- hero is the actual playable character.

### `server_staff_assignments`

Purpose:

- stores server-specific staff rights.

This is a table.

Its `role` is a PostgreSQL enum: `server_staff_role`.

Current values:

- `owner`
- `operator`
- `moderator`
- `tester`

Use cases:

- user may be global `operator`,
- assigned as `operator` on one server,
- and play normally on another server.

This avoids making global operator/moderator role automatically powerful everywhere.

---

## Configuration Governance Tables

Configuration governance is now represented in the database.

Important rule:

**Config governance is a governance layer, not a replacement for existing relational systems.**

It should not flatten formulas, item generation, buildings, or bonus templates into generic JSON if those systems already have proper relational tables.

### `config_governance_scope`

PostgreSQL enum.

Current values:

- `product_global`
- `global_balance`
- `server_launch`
- `live_server`
- `test_override`

Meaning:

- `product_global` — product-level rule / core game rhythm.
- `global_balance` — shared balance/configuration that may be patched through controlled change.
- `server_launch` — chosen before server launch and locked after server goes live.
- `live_server` — server-specific live config that can change during server life, but should be controlled.
- `test_override` — sandbox/testing-only override.

### `config_managed_entity_type`

PostgreSQL enum.

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

Meaning:

- defines what kind of thing a config definition governs.
- may point to a simple scalar/json config.
- may point to an existing relational domain entity type.

### `config_value_type`

PostgreSQL enum.

Current values:

- `integer`
- `decimal`
- `boolean`
- `string`
- `json`
- `formula_ref`
- `enum_ref`
- `entity_ref`

Meaning:

- describes the value/reference type for a config definition.
- `formula_ref` and `entity_ref` are especially important for relational systems.

### `config_value_status`

PostgreSQL enum.

Current values:

- `draft`
- `active`
- `archived`

Used by `global_config_values`.

### `config_change_status`

PostgreSQL enum.

Current values:

- `draft`
- `ready`
- `applied`
- `cancelled`

Used by `config_change_sets`.

### `config_change_visibility`

PostgreSQL enum.

Current values:

- `none`
- `internal`
- `public`

Meaning:

- `none` — no changelog entry; still preserved internally.
- `internal` — visible in admin/operator changelog.
- `public` — intended for player-facing changelog.

Public changelog text should not automatically expose technical values.

### `config_change_kind`

PostgreSQL enum.

Current values:

- `scope_change`
- `global_value_change`
- `server_value_change`
- `definition_change`
- `activation_change`
- `entity_field_change`

Used by `config_change_entries`.

### `server_config_value_source`

PostgreSQL enum.

Current values:

- `manual_server_launch`
- `global_snapshot`
- `live_override`
- `test_override`
- `migration`

Used by `server_config_values`.

---

## `config_definitions`

Purpose:

- registry of things governed by configuration/change policy.

Important:

- this is not only a key-value config table,
- this table can govern existing relational systems,
- this table should not replace `balance_formulas`, `item_generation_*`, `buildings`, etc.

Important intended columns:

- `id`
- `key`
- `label`
- `description`
- `governance_scope`
- `managed_entity_type`
- `managed_entity_key`
- `value_type`
- `value_schema_json`
- `default_value_json`
- `is_active`
- `sort_order`
- timestamps.

Examples of existing seeded definitions:

- `formula_assignment_building_upgrade_cost`
- `formula_assignment_building_upgrade_time`
- `formula_assignment_building_bonus_growth`
- `formula_assignment_combat_hit_green_zone`
- `formula_assignment_combat_evasion_chance`
- `formula_assignment_combat_critical_chance`
- `formula_assignment_combat_final_damage`
- `formula_assignment_hero_stat_upgrade_cost`
- `formula_assignment_hero_stat_level_cap`
- `formula_assignment_item_requirement_level`
- `item_generation_qualities`
- `item_generation_bucket_profiles`
- `item_generation_bases`
- `item_generation_affixes`
- `building_definitions`
- `bonus_templates`

### Meaning of `managed_entity_key`

`managed_entity_key` is a stable pointer/key to the governed domain area.

Examples:

- for formula assignments, it should match `balance_formula_targets.key`,
- for item generation quality governance, it may point at `item_generation_qualities`,
- for building definition governance, it may point at `buildings`.

### Important rule

For existing relational entities, use governance records to describe scope and change policy.

Do not duplicate relational rows into `value_json` unless the thing is naturally scalar/json/profile-like.

---

## `global_config_values`

Purpose:

- stores scalar/json/profile-like global config values.

Use for:

- simple global config values,
- global JSON profiles,
- future product/global config where no better relational model exists.

Do not use for:

- `balance_formulas`,
- `balance_formula_assignments`,
- item generation tables,
- building definitions,
- bonus templates,

unless there is a deliberate design decision to represent a given thing as scalar/json config.

Important columns:

- `config_definition_id`
- `value_json`
- `status`
- `version`
- `created_by`
- timestamps including activation/archive timestamps.

Constraint:

- one active global value per config definition.

---

## `server_config_values`

Purpose:

- stores server-specific scalar/json/profile-like config values,
- stores launch snapshots,
- stores live server overrides,
- stores test overrides.

Use for:

- server launch config values,
- server-specific snapshots of previously global config,
- live server config,
- sandbox/testing overrides.

Important columns:

- `server_id`
- `config_definition_id`
- `value_json`
- `source`
- `locked_at`
- `created_by`
- timestamps.

Constraint:

- one value per server/config definition.

Important:

- `server_config_values` is not a replacement for all server-scoped relational data.
- Use it where scalar/json/profile config makes sense.

---

## `config_change_sets`

Purpose:

- groups related configuration/governance/balance changes.

Important columns:

- `title`
- `reason`
- `status`
- `changelog_visibility`
- `changelog_title`
- `changelog_body`
- `requested_by`
- `applied_by`
- `cancelled_by`
- timestamps.

Important rules:

- `reason` is mandatory and must not be blank.
- public changelog visibility requires title and body.
- this table describes intent and publication metadata.
- this table does not itself apply changes unless application/runtime logic implements applying.

Status values:

- `draft`
- `ready`
- `applied`
- `cancelled`

### Changelog rule

Public changelog text is separate from technical changes.

Example:

- technical: drop bucket values changed from one numeric profile to another,
- public: “Adjusted reward distribution in trials.”

---

## `config_change_entries`

Purpose:

- stores concrete technical changes inside a config change set.

Important columns:

- `change_set_id`
- `config_definition_id`
- `change_kind`
- `server_id`
- `entity_type`
- `entity_id`
- `field_path`
- `old_scope`
- `new_scope`
- `old_value_json`
- `new_value_json`
- `metadata_json`

Important rules:

- `scope_change` requires `old_scope` and `new_scope`, and they must differ.
- `entity_field_change` requires `entity_type`, `entity_id`, and `field_path`.

For existing relational entities, use:

    entity_type = balance_formula_assignment
    entity_id = <row id>
    field_path = formula_id

or similar.

This records technical detail without flattening the relational model into a generic config JSON.

---

## Formula System

The project already has a relational formula system.

Important tables:

- `balance_formula_targets`
- `balance_formulas`
- `balance_formula_assignments`
- `balance_formula_blocks`
- `entity_formula_assignments`

Do not replace this system with generic JSON configs.

### `balance_formula_targets`

Purpose:

- defines where formulas are used.

Examples:

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

Important semantic columns include:

- `key`
- `scope_key`
- `label`
- `description`
- `allowed_variables`
- `default_test_context`
- `sort_order`

### `balance_formulas`

Purpose:

- stores concrete formula expressions.

Examples:

- `building-upgrade-cost-default`
- `combat-hit-green-zone-default`
- `hero-stat-upgrade-cost-default`

Important columns include:

- `key`
- `scope_key`
- `label`
- `expression`
- `description`
- `is_enabled`
- timestamps.

### `balance_formula_assignments`

Purpose:

- global/default assignment of a formula target to a formula.

Current model:

- one assignment per target.

This is the global fallback used when no local entity override exists.

### `entity_formula_assignments`

Purpose:

- local formula override assignment for a specific entity.

Current supported entity kind:

- `building`

Important columns:

- `entity_kind`
- `entity_id`
- `target_id`
- `formula_id`
- timestamps.

Constraint:

- unique `(entity_kind, entity_id, target_id)`.

Current usage:

- local formula override per building.

Expected runtime lookup order:

1. look for local `entity_formula_assignments` for entity + target,
2. if present, use assigned formula,
3. if absent, use global `balance_formula_assignments`,
4. if neither exists, treat as configuration error or explicit technical fallback.

Important:

- this table is structural support only.
- runtime/frontend still needs implementation of fallback logic.

### `balance_formula_blocks`

Purpose:

- stores formula editor blocks/tokens.

Includes:

- variables,
- operators,
- functions,
- literals,

grouped by formula scope.

---

## Canonical Base Stats

Base stats come from the `stats` table and should be treated as canonical.

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

---

## `hero_stats`

Purpose:

- stores base stat values for a hero.

Notes:

- keyed by hero and stat key,
- should align with the canonical `stats` table,
- after server/hero migration, `hero_id` references character id, not auth user id.

Important:

- do not query `hero_stats` by assuming `hero_id = auth.uid()`.
- first load active hero, then use `hero.id`.

---

## `hero_derived`

Purpose:

- stores derived/special values such as:
  - health
  - defense
  - min damage
  - max damage
  - luck

Notes:

- Health is the preferred user-facing term for hit points.
- Luck is treated as a special derived/equipment-sensitive stat, not a normal point-investment stat.
- After server/hero migration, `hero_id` references character id, not auth user id.

Important:

- do not query `hero_derived` by assuming `hero_id = auth.uid()`.

---

## `hero_resources`

Purpose:

- stores resources owned by a hero.

Expected resource types include:

- drachmas,
- materials,
- workforce.

After server/hero migration:

- `hero_id` references character id,
- not auth user id.

Important:

- do not query `hero_resources` by assuming `hero_id = auth.uid()`.

---

## Combat-related Semantic Rules

These are system rules, even if not yet fully materialized as columns:

- Dexterity is offensive hit control.
- Agility is defensive anti-hit + evasion.
- Endurance is defense / damage reduction.
- Cunning is crit-related.
- Luck lightly supports evasion and crit.
- Weapon damage should support min/max ranges.
- Number of attacks should come from weapon/equipment logic rather than raw stat points.

Combat should not assume that all needed derived values are hardcoded columns forever.

Use bonus/equipment/formula systems where appropriate.

---

## Bonus System Semantic Notes

The intended bonus/template system should support at least:

- `flat`
- `percent`
- `per_levels`
- `scaled_stat_bonus`
- `resource_flat`
- `resource_percent`
- `capacity_flat`
- `unlock_feature`

Bonus definitions should conceptually support:

- `target`
- `context`
- `category`
- type-specific parameters such as:
  - base value
  - levels step
  - source stat
  - scaling factor
  - etc.

Current intended contexts include:

- `global`
- `pvp_attack`
- `pvp_defense`
- `exploration`
- `trial`
- `combat`
- `economy`
- `building_management`

Important:

- `per_4_levels` should be generalized into `per_levels`.

---

## `bonus_templates`

Purpose:

- central definition of bonuses.

Desired/future pattern:

- template identity,
- target,
- type,
- context,
- category,
- description,
- extended type-specific parameters as the system evolves.

Use:

- origins,
- items,
- buildings,
- other modular bonus systems.

Design rule:

- prefer modular bonus linking over hardcoded effect columns across many domain entities.

Important current implementation note:

- observed `bonus_templates` may still be in the old shape,
- old shape includes only `id`, `target`, `type`, `description`,
- old `bonus_type` may still include `per_4_levels`,
- the broader intended model may not yet be implemented in the current database.

Therefore:

- do not assume `category`, `context`, `base_value`, `levels_step`, `source_stat`, `scaling_factor` exist unless current schema confirms it,
- bonus template refactor should be a separate controlled migration/task,
- config governance has a registry marker for `bonus_templates`, but does not by itself refactor the table.

---

## Item Generation Tables

The project already has relational item generation tables.

Known tables include:

- `item_generation_affixes`
- `item_generation_affix_bonuses`
- `item_generation_bases`
- `item_generation_base_bonuses`
- `item_generation_bucket_profiles`
- `item_generation_qualities`

Important rule:

- do not flatten item generation into generic JSON config if relational tables already represent it.

Config governance may govern these tables through `config_definitions` and `config_change_entries`.

Examples:

- `item_generation_qualities` is governed as `item_generation_quality`.
- `item_generation_bucket_profiles` is governed as `item_generation_bucket_profile`.
- `item_generation_bases` is governed as `item_generation_base`.
- `item_generation_affixes` is governed as `item_generation_affix`.

---

## `buildings`

Purpose:

- stores building definitions.

Important columns:

- `key`: canonical technical identifier,
- `name`,
- `description`,
- `rank_required`,
- `district_code`,
- `image_path`,
- `sort_order`,
- `base_cost`,
- `base_build_time_minutes`,
- `max_level`,
- `requirements` (`jsonb`).

Important semantics:

- `district_code` links building availability to estate/district logic.
- `rank_required` is a progression gate, but should not be simplistically treated as the same thing as district.
- `requirements` is a flexible extension point for future gating.
- `max_level = 0` may mean unlimited, depending on feature logic.
- building descriptions may still be conceptual, not final effect specs.
- buildings should support global formula fallback plus optional local formula overrides.

Known current state:

- many building rows may still use placeholder cost/time values,
- building effects/bonuses may not yet be fully defined.

---

## Building Formula Assignment

Buildings support or should support:

- global default formulas by formula target,
- optional local formula overrides per building via `entity_formula_assignments`.

This should cover at least:

- upgrade cost,
- upgrade time,
- bonus growth,
- other building-related formula scopes where needed.

If no local formula is assigned:

- fallback to global/default formula assignment.

Formula assignment is conceptually separate from the building definition itself.

---

## Building Costs / Requirements

Current related tables may include:

- `building_resource_costs`
- `building_requirements`
- `building_bonuses`

Important notes:

- `building_resource_costs` may use `base_value`, not `base_amount`.
- `building_bonuses` may currently be empty.
- `building_requirements` may currently have only minimal placeholder rows.

These systems are still early and should be checked against current schema before implementation.

---

## Estate / District Layer

The game has a separate estate/district system.

Important conceptual distinction:

- district / estate access,
- building availability,
- player level,
- prestige,
- council/governance access.

These are related but not identical systems.

Do not collapse them into one variable unless explicitly instructed.

---

## `estates`

Purpose:

- stores occupied estates only.

Important post-server-migration model:

- estate belongs to a hero,
- estate belongs to a server,
- estate address is unique inside a server,
- empty estates are not stored as rows.

Expected important columns:

- `id`
- `server_id`
- `hero_id`
- `district_code`
- `address`
- other estate metadata as needed.

After server/hero migration:

- `hero_id` references `hero.id`,
- `server_id` references `game_servers.id`.

Important:

- `hero_id` must not be treated as `auth.uid()`.
- use `hero.user_id` to identify owner account.
- use `hero.id` for gameplay ownership.

### Estate address uniqueness

Old global uniqueness of `address` is not enough for multi-server.

Preferred/current constraint:

- `unique(server_id, address)`

If `address` already contains district prefix, e.g. `A-0001`, then `district_code` does not need to be part of the uniqueness constraint.

### Empty estate rule

Do not pre-create all empty estate/address records.

The database should store occupied estates, not every possible empty address:

- district capacity defines possible addresses,
- occupied estates are rows,
- empty addresses are derived from capacity minus occupied addresses,
- abandoning/relocating from an estate can delete the estate row and dependent building state.

Important distinction:

- address label, e.g. `A-0001`, is stable as a possible address slot,
- estate row id is the id of a specific occupation instance,
- if the same address is claimed later, it should create a new estate row/id.

This supports the intended relocation model:

- moving to an empty estate destroys old buildings by deleting old occupied estate state,
- the old address becomes empty again,
- if someone later claims that address, it is a new estate instance.

Frontend may generate the full address list for display using district capacity, then overlay occupied addresses queried from the database.

### District E

District E always has exactly one address/seat.

This should not vary per server unless explicitly redesigned later.

---

## `estate_buildings`

Purpose:

- stores built/upgraded building state for an occupied estate.

Important:

- building state belongs to an estate row,
- if estate row is deleted during relocation/abandonment, estate building state should be deleted through FK cascade or equivalent cleanup,
- this is how building loss is enforced when moving to an empty estate.

Do not treat buildings as globally owned by user account.

---

## Exploration Persistence Notes

Exploration should be modeled as temporary session/path state, not as a full permanent world map.

Important conceptual requirements:

- active exploration sessions,
- discovered/visited nodes,
- remembered exits/branches for backtracking,
- lightweight storage per visited node,
- important reports stored separately from temporary exploration path state.

Exploration runtime data should be server/hero scoped.

Important:

- if exploration tables are added later, they should generally reference `hero.id` and/or `server_id`,
- not `auth.uid()` directly.

---

## Reports / Snapshots

Important events should support snapshot-style reports.

Reports should:

- be based on historical snapshot data,
- not depend only on current live values,
- support public/shareable access,
- preserve tooltip-relevant entity data where needed.

Important report types:

- `trial`
- `encounter`
- `pvp_combat`
- `siege`

Report payload should reflect the original in-game view of the event.

If an in-game trial view includes drop/reward, the report should show it too.

Reports should not expose private account data.

Reports may reference public hero/profile information, but should snapshot event-critical data.

---

## PvP / Siege Persistence Direction

Future PvP and siege tables should be server-scoped.

Expected direction:

- PvP attack records reference attacker hero and defender hero/estate.
- Siege records reference attacking estate/hero and defending estate/hero.
- Server id should be present directly where useful for querying and constraints.
- Do not infer everything through multiple joins if direct `server_id` materially simplifies queries and constraints.

Regular PvP attacks should have a travel timer.

Siege should be longer-running and may involve guild support.

Exact PvP/siege schema is still provisional.

---

## Product-level Cadence / Config Scope

Some values are likely better treated as product-level constants than per-server editable config:

- daily trial count,
- daily attack count,
- base exploration step timing,
- manual siege action timer,
- base PvP travel-time minimum/model,
- possibly base siege preparation duration.

These values define the game rhythm and should not casually differ per server unless intentionally redesigned.

Other systems may be data-driven or patchable:

- item balance,
- affix/prefix values,
- building effects,
- drop tables,
- combat formulas,
- event effects,
- test/admin overrides.

Guiding rule:

**Configurable does not mean freely changeable at any time.**

Config governance now represents this distinction through:

- `product_global`
- `global_balance`
- `server_launch`
- `live_server`
- `test_override`

---

## Balance / Formula / Patch Governance

The system distinguishes or should distinguish:

- product-level/global rules,
- global balance configuration,
- server launch configuration,
- live server operations,
- test/admin overrides.

Live balance changes should not necessarily apply immediately to production servers when edited.

Current config governance supports:

- config definitions,
- governance scopes,
- change sets,
- change entries,
- internal/public changelog visibility.

Future intended direction:

- testing on sandbox/testing environments,
- explicit activation for production/live servers,
- audit log,
- player-facing changelog support,
- possible admin preview of affected servers/values before applying changes.

This is only partially implemented.

The current database supports governance structures, but application logic still needs to implement actual workflows.

---

## Audit / Logging Direction

Full audit logging is not yet finalized.

Audit log should eventually support:

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

Config governance stores reasons/change sets/change entries, but full audit log remains a separate future system.

---

## Anti-Abuse Database Direction

Database constraints can prevent some abuse:

- one account creating multiple heroes on one normal server.

They cannot prevent:

- one real person creating multiple accounts.

Future anti-abuse may require:

- access/login event logs,
- hashed IP signals,
- user-agent/device signals,
- suspicious trade detection,
- suspicious item transfer detection,
- PvP feeding detection,
- admin review tools,
- shared-household declarations.

IP/device-like signals may be personal data and must be treated carefully with privacy/legal requirements in mind.

Do not implement broad anti-abuse logging without deliberate design and privacy review.

---

## Localization Rule

Core in-world names may remain in Greek across all language versions.

Descriptions and explanatory text are localized separately.

This applies to:

- prestige ranks,
- building names where intended,
- similar core world proper nouns.

---

## Migrations as Source of Truth

When implementing schema-sensitive features:

1. read relevant migrations,
2. read current seed data if needed,
3. use this file as a semantic shortcut only.

This file should be updated when:

- a table meaning changes,
- a key relation changes,
- a gameplay-relevant column is added,
- major naming decision changes,
- server/account/hero ownership model changes,
- config governance or audit/logging model changes.

---

## Codex Warning: Server/Hero Migration

After the server/hero migration, Codex must not write code that assumes:

    hero.id === authUser.id
    hero.id === auth.uid()

Correct model:

    auth.uid()      // global account id
    hero.user_id    // global account id
    hero.id         // character id
    hero.server_id  // game server id

Gameplay-owned tables should normally reference `hero.id`.

User/account-owned administration should reference `user_data.id` / `auth.users.id`.

Server/world-specific data should reference `game_servers.id` where applicable.

Frontend/backend code should load selected/active server and active hero before querying gameplay-owned state.

---

## Codex Warning: Config Governance

After the config governance migration, Codex must not treat `config_definitions` as a simple key-value table.

Correct model:

    config_definitions = registry of governed configuration/domain areas

It may govern:

- scalar/json config,
- existing relational formula assignments,
- item generation tables,
- building definitions,
- bonus templates,
- server settings,
- test overrides.

Do not flatten existing relational systems into JSON unless explicitly instructed.

For existing relational entities, config change entries should point to:

    entity_type
    entity_id
    field_path

Examples:

    entity_type = balance_formula_assignment
    field_path = formula_id

Use `global_config_values` / `server_config_values` mainly for scalar/json/profile-like values where no better relational table exists.

Formula runtime should continue to use:

- `entity_formula_assignments` for local overrides,
- `balance_formula_assignments` for global fallback,
- `balance_formulas` for expressions.
---

# Update 2026-04-26 — requirements and building district caps

## Requirements foundation

The database now has a central requirements foundation.

Tables:

- `requirement_definitions`
- `entity_requirements`

Enums:

- `requirement_value_type`
- `requirement_entity_type`

Purpose:

- `requirement_definitions` defines reusable requirement types.
- `entity_requirements` attaches requirements to concrete entities such as building definitions, items, trade features or future trial definitions.

Current seeded requirement definitions:

- `hero_level`
- `prestige_rank`
- `hero_stat`
- `building_level`
- `resource_amount`
- `district_access`
- `trade_routes_access`

Important semantic rules:

- requirements are not costs;
- requirements are not bonuses;
- new systems should not add fresh requirement JSON fields;
- old `building_requirements` is legacy/transitional;
- old `buildings.requirements` JSONB is legacy/transitional.

Existing legacy building requirements were migrated additively into `entity_requirements` where possible.

`buildings.rank_required > 1` was migrated additively into `entity_requirements` as `prestige_rank`, but the old column remains transitional for compatibility.

## Building district max-level caps

The database now has:

- `building_district_level_caps`

Purpose:

- stores district-specific max-level overrides for buildings.

Semantics:

- `buildings.max_level` = global/default max level for a building;
- `buildings.max_level = 0` means unlimited;
- `building_district_level_caps` stores overrides only;
- missing override means fallback to `buildings.max_level`.

Do not populate a full building × district matrix unless each row is a real override.

## Building district availability

`buildings.district_code` is the minimum district where the building can be built.

A building can be built in its `district_code` and every district with higher rank.

Helper functions:

- `get_building_max_level_for_district(building_id, district_code)`
- `is_building_available_in_district(building_id, district_code)`

Validation:

- district cap overrides cannot be inserted for districts below the building’s minimum district.

## Config governance integration

The following config definitions are registered:

- `requirement_definitions`
- `entity_requirements`
- `building_district_level_caps`

They are global-balance governed entity references.

Related `config_managed_entity_type` values include:

- `requirement_definition`
- `entity_requirement`
- `building_district_level_cap`

## Implementation notes for Codex

Codex should:

- regenerate database types after this schema change;
- add domain models/mappers for requirements and district cap overrides;
- expose requirements and caps through building/admin config UI;
- treat district caps as building balance configuration;
- keep old `building_requirements` and `buildings.requirements` available only for transition/backward compatibility;
- avoid assuming explicit district cap rows exist for every building/district pair.
