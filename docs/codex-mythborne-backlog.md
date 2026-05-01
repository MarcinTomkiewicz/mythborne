# Codex Backlog — Mythborne Implementation Backlog

Purpose: this backlog translates current project decisions into small, promptable implementation tasks for Codex.

Use this as a practical task queue. Concept documents remain informational; this file is for execution.

Canonical source order:
1. explicit user instruction,
2. current database schema / migrations,
3. `docs/database-current.md`,
4. `docs/current-decisions.md`,
5. `docs/project-context.md`,
6. `current-state-summary.md`,
7. `current-todo.md`.

Global Codex rules:
- Work from the current repository state.
- Read the relevant docs before coding.
- Do not invent schema that is not in current DB/migrations.
- Regenerate/update database types when schema changes require it.
- Do not assume `hero.id === auth.uid()`.
- Load selected/current server and active hero before hero-owned queries.
- Use DB dictionaries/configs instead of hardcoding configurable options.
- Keep metadata JSON lightweight.
- Prefer backend/RPC/domain operations for critical persistent changes.
- Preserve `reason`, `description`, `status_reason`, helper/admin text wherever applicable.
- After each task, summarize exact changes and wait for user confirmation.
- Do not mark tasks as completed in state docs before user confirms they work.

DB cleanup candidate rule:
- If a task removes the final code dependency on a legacy DB column/table/RPC/helper/model, Codex must report a `DB cleanup candidate` section.
- Include: legacy object, where it was used, what replaced it, whether frontend/backend still uses it, and whether a DB cleanup/drop migration can be prepared safely.
- Do not drop legacy DB objects inside an implementation task unless that task explicitly includes an approved DB cleanup migration.

Implementation backlog discipline:
- Prefer implementation tasks over repeated audits once schema/contracts are known.
- Audit/spec tasks should normally be followed by concrete implementation tasks in the same epic.
- Do not create long audit-only sequences unless user explicitly asks or implementation is blocked.
- If an audit finds clear work, add/update implementation tasks with acceptance criteria before continuing.
- UX tasks should produce visible UI/helpers unless explicitly marked as audit/spec.

---

# Epic A — Documentation, state and generated DB types

## Task A1 — Regenerate Supabase database types

**Goal:** Synchronize frontend generated types with current schema.

**Scope:**
- Regenerate/update `database.types.ts`.
- Confirm current tables/enums are visible:
  - game servers/memberships/staff assignments,
  - config governance,
  - formula governance,
  - audit foundation,
  - anti-abuse foundation,
  - item lifecycle fields,
  - existing hero/stats/resources/estate/building/item tables.

**Acceptance criteria:**
- App compiles.
- Generated DB types include latest schema.
- No domain models are replaced by raw DB rows.

---

## Task A2 — Update implementation state docs after confirmed work

**Goal:** Keep working documentation accurate.

**Scope:**
- After each user-confirmed task, update:
  - `current-state-summary.md`,
  - `current-todo.md`,
  - docs only when semantics/schema/architecture materially change.

**Acceptance criteria:**
- Done work moves to state summary only after user confirms.
- TODO remains actionable, not historical noise.

---

## Task A3 — Add backlog tracking convention

**Goal:** Make future Codex prompts easier and consistent.

**Scope:**
- Add/update a short section in `current-todo.md` explaining:
  - one task per Codex prompt,
  - Codex reports changes,
  - user confirms,
  - docs/state updated after confirmation.

**Acceptance criteria:**
- Current workflow is explicit in project docs.
- Codex does not mark unconfirmed tasks complete.

---

# Epic B — Server/world/account/hero model

## Task B1 — Audit old identity assumptions

**Status:** Done / confirmed 2026-04-26.

**Goal:** Find old code assuming `hero.id === auth.uid()`.

**Scope:**
- Search services, facades, components, helpers.
- Inspect:
  - hero loading,
  - stats/progression,
  - resources,
  - estate/buildings,
  - combat,
  - items/armory,
  - admin/player context.

**Acceptance criteria:**
- Report lists exact files/patterns to fix.
- No broad refactor yet.

---

## Task B2 — Standardize active server resolver

**Status:** Done / confirmed 2026-04-26.

**Goal:** Provide one reliable way to determine current game server.

**Scope:**
- Load accessible servers.
- Select default sandbox/current server for current user during prototype.
- Respect visibility:
  - normal players see standard scheduled/live servers,
  - admin/operator/tester/staff can see sandbox/testing where allowed.

**Acceptance criteria:**
- One shared server selection path exists.
- UI/domain code can access selected server id/key/name/kind/status.

---

## Task B3 — Standardize active hero resolver

**Status:** Done / confirmed 2026-04-26.

**Goal:** Provide one reliable way to load active hero for selected server.

**Scope:**
- Given auth user + selected server, load hero by `hero.user_id + hero.server_id`.
- Return typed active hero context.
- Handle no hero yet.
- Support sandbox privileged multi-hero later; do not block it architecturally.

**Acceptance criteria:**
- Active hero context exposes `user_id`, `server_id`, `hero_id`.
- No equality assumption between user id and hero id.

---

## Task B4 — Migrate stats/resources/progression to active hero id

**Status:** Done / confirmed 2026-04-26.

**Goal:** Fix critical hero-owned flows.

**Scope:**
- Stats reads/writes.
- Derived stats reads/writes.
- Resources reads/writes.
- Attribute allocation/progression save flow.

**Acceptance criteria:**
- Existing progression/stat screens still work.
- Queries use `hero.id` for hero-owned tables.

---

## Task B5 — Migrate estate/building/item/combat reads to active hero id

**Status:** Done / confirmed 2026-04-26.

**Goal:** Continue model migration.

**Scope:**
- Estates.
- Estate buildings.
- Building previews where hero/estate-specific.
- Item inventory/armory where hero-owned.
- Combat/demo snapshots where hero-owned.

**Acceptance criteria:**
- Existing views still work.
- No hero-owned query uses auth uid as hero id.

---

# Epic C — Roles, memberships and staff access

## Task C1 — Add role/membership read layer

**Status:** Done / confirmed 2026-04-26.

**Goal:** Frontend can understand global and server-specific access.

**Scope:**
- Read global role from user/account context.
- Read server membership.
- Read server staff assignment for selected server.
- Expose convenience flags for UI:
  - isAdmin,
  - isOperator,
  - isTester,
  - isServerStaff,
  - canAccessSandbox,
  - canManageSelectedServer.

**Acceptance criteria:**
- UI can hide/show admin/staff entry points correctly.
- Server staff role is separate from global role.

---

## Task C2 — Staff server switcher

**Status:** Done / confirmed 2026-04-26.

**Goal:** Operators/admins can choose relevant server context.

**Scope:**
- Server selector for staff/admin areas.
- Operators see assigned/relevant servers.
- Admin can see all.

**Acceptance criteria:**
- Staff admin pages are server-scoped.
- User does not accidentally operate on wrong server.

---

## Task C3 — Membership status UI handling

**Status:** Done / confirmed 2026-04-26.

**Goal:** Handle active/suspended/banned memberships.

**Scope:**
- Show clear state if selected server membership is suspended/banned.
- Block normal gameplay where membership status disallows it.
- Preserve admin/staff visibility where appropriate.

**Acceptance criteria:**
- Suspended/banned users are not treated as active players.
- Reason/status details can be surfaced when available.

---

# Epic D — Configuration governance

## Task D1 — Config definitions read model

**Status:** Done / confirmed 2026-04-26.

**Goal:** Typed frontend read model for config definitions.

**Scope:**
- Load `config_definitions`.
- Map:
  - key,
  - label,
  - description,
  - governance scope,
  - managed entity type/key,
  - value type,
  - schema,
  - default value,
  - active flag,
  - sort order.

**Acceptance criteria:**
- Admin UI can display config definitions without hardcoding them.

---

## Task D2 — Config values read model

**Status:** Done / confirmed 2026-04-26.

**Goal:** Typed read model for global/server config values.

**Scope:**
- Load active global config values.
- Load selected server config values.
- Resolve effective value by scope where current logic allows.

**Acceptance criteria:**
- Frontend can show current value and source for config definitions.
- No hardcoded anti-abuse/config threshold constants.

---

## Task D3 — Config change-set list/detail

**Status:** Done / confirmed 2026-04-26.

**Goal:** Staff/admin can inspect config change history.

**Scope:**
- List `config_change_sets`.
- Show:
  - title,
  - reason,
  - status,
  - changelog visibility,
  - requested/applied/cancelled info,
  - timestamps.
- Detail shows `config_change_entries`.

**Acceptance criteria:**
- Config change history is visible.
- Reason and changelog visibility are visible.

---

## Task D4 — Config edit draft flow

**Status:** Done / confirmed 2026-04-27.

**Goal:** Create controlled config edits.

**Scope:**
- Create change set with mandatory reason.
- Add change entries.
- Support editing scalar config values at minimum.
- Validate value type/schema where practical.

**Acceptance criteria:**
- Admin can create a draft change set.
- Reason is mandatory.
- No direct silent config mutation.

---

## Task D5 — Config apply/cancel flow

**Status:** Done / confirmed 2026-04-27.

**Goal:** Apply/cancel config changes through governed workflow.

**Scope:**
- Mark change set ready/applied/cancelled.
- Apply scalar/global/server config values where implemented.
- Preserve applied_by/cancelled_by/timestamps.
- Write audit where available.

**Acceptance criteria:**
- Config changes can be applied/cancelled with reason.
- Public/internal changelog fields remain optional but visible.

---

## Task D6 — Anti-abuse config admin section

**Status:** Done / confirmed 2026-04-27.

**Goal:** Display/edit anti-abuse live-server configs.

**Scope:**
- Load config definitions where `managed_entity_key = anti_abuse`.
- Load selected server values.
- Display all 10 current anti-abuse config keys.
- Support edit through config governance path.

**Acceptance criteria:**
- Anti-abuse thresholds are not hardcoded.
- Values are server-specific.

---

# Epic E — Formula governance

## Task E1 — Formula targets/formulas read layer

**Status:** Done / confirmed 2026-04-27.

**Goal:** Make formula system visible to admin tooling.

**Scope:**
- Load:
  - `balance_formula_targets`,
  - `balance_formulas`,
  - `balance_formula_assignments`,
  - `balance_formula_blocks`,
  - `entity_formula_assignments`.
- Map typed domain models.

**Acceptance criteria:**
- Admin can inspect existing formula targets and formulas.

---

## Task E2 — Formula assignment viewer

**Status:** Done / confirmed 2026-04-27.

**Goal:** Show global/default formula assignments.

**Scope:**
- List formula target -> assigned formula.
- Show expression and description.
- Show target scope/category if present.

**Acceptance criteria:**
- Admin can understand which formula is active globally/default.

---

## Task E3 — Local entity formula assignment support

**Status:** Done / confirmed 2026-04-27.

**Goal:** Support per-entity formula override inspection.

**Scope:**
- Read `entity_formula_assignments`.
- Current supported entity kind: `building`.
- Show local override vs global fallback.

**Acceptance criteria:**
- Building-specific formula overrides can be inspected.
- Runtime lookup expectation is documented in code comments where used.

---

## Task E4 — Formula runtime integration cleanup

**Status:** Done / confirmed 2026-04-27.

**Goal:** Ensure runtime uses proper assignment order.

**Scope:**
- For formula-driven runtime paths, use:
  1. local entity assignment,
  2. global/default assignment,
  3. explicit fallback/config error.
- Avoid duplicating formulas in generic config JSON.

**Acceptance criteria:**
- Runtime lookup follows current decisions.
- No new JSON replacement of relational formula system.

---

# Epic F — Bonus model legacy retirement

Epic F retires legacy bonus usage from application code. Legacy bonus join tables and legacy semantic columns may physically remain in the database as transitional debt, but new or changed frontend read/write paths must use:
- `bonus_types`,
- `bonus_scopes`,
- `bonus_target_categories`,
- `bonus_targets`,
- semantic `bonus_templates`,
- `entity_bonuses`.

**Epic rule:** Do not preserve the hybrid model as the target architecture. Legacy model support is transitional only. If required data is missing in `entity_bonuses`, stop and report a SQL/backfill blocker instead of adding a permanent fallback to legacy tables.

## Task F1 — Inspect current bonus template usage

**Status:** Done / confirmed.

**Goal:** Audit current legacy/new/hybrid bonus model usage.

**Scope:**
- Find frontend/backend references to `bonus_templates`, `entity_bonuses`, bonus dictionaries, and legacy bonus join tables.
- Classify usage as legacy read/write, hybrid fallback, new model usage, or risky/unknown.
- Report affected flows.

**Acceptance criteria:**
- Impact report is delivered.
- No code, schema, migration, seed, generated type, or docs change during F1.

---

## Task F2 — Design bonus model legacy retirement plan

**Status:** Done / confirmed.

**Goal:** Plan migration from hybrid bonus usage to canonical dictionaries + semantic `bonus_templates` + `entity_bonuses`.

**Scope:**
- Define target frontend/domain models for `BonusType`, `BonusScope`, `BonusTargetCategory`, `BonusTarget`, `BonusTemplate`, `EntityBonus`, and resolved runtime bonus view model.
- Plan read/write migration order.
- Identify SQL/backfill blockers.
- Define test plan.

**Acceptance criteria:**
- Reviewable staged plan exists.
- Risks and blockers are called out.
- Test plan is defined.
- No code, schema, migration, seed, generated type, or docs change during F2 except later backlog/status updates after confirmation.

---

## Task F3 — Canonical bonus domain models and mappers

**Goal:** Add new-only domain/types/mappers for canonical bonus models.

**Scope:**
- Add domain/types/mappers for `BonusType`, `BonusScope`, `BonusTargetCategory`, `BonusTarget`, `BonusTemplate`, `EntityBonus`, and `ResolvedBonus`.
- Add focused mapper tests.
- Do not rewire UI, runtime, or write paths yet.

**Acceptance criteria:**
- New-only mappers do not depend on legacy semantic columns.
- Legacy adapter, if needed, is explicitly transitional.
- Build passes.
- No exported types/interfaces/consts are placed in components, services, or facades.

---

## Task F4 — Bonus dictionary/admin read service

**Goal:** Load dictionaries and template read model for admin UI.

**Scope:**
- Read `bonus_types`, `bonus_scopes`, `bonus_target_categories`, `bonus_targets`, and semantic `bonus_templates`.
- Provide admin read model.
- Do not refactor write paths yet.

**Acceptance criteria:**
- `/admin/balance` does not depend on `bonus_templates.category`.
- Admin options come from dictionaries.
- No write refactor is included.

---

## Task F5 — Bonus template write path migration

**Goal:** Move template writes to semantic `bonus_templates` columns.

**Scope:**
- Update bonus template admin payloads.
- Persist `type_key`, `target_key`, `scope_key`, `level_interval`, `scaling_stat_key`, `params_json`, `is_active`, and `sort_order`.

**Acceptance criteria:**
- Semantic bonus type is not written to legacy `bonus_templates.type`.
- `category` is not sent to `bonus_templates`.
- Build passes.

---

## Task F6 — Entity bonus read model and payload helpers

**Goal:** Add shared read model and payload helpers for `entity_bonuses`.

**Scope:**
- Support entity types: origin, item generation base, item generation affix, building, and item.
- Map joined template/dictionary data.
- Provide helpers for concrete integrations.

**Important:** Do not introduce an aggressive generic "save replace collection" mechanism without integration-specific control.

**Acceptance criteria:**
- Mapper handles all planned entity types.
- Mapper joins template/dictionaries into resolved view model.
- Write operations stay in concrete integrations or separate tasks.

---

## Task F7 — Origin bonus read migration

**Goal:** Dashboard, combat, and origin display read origin bonuses through `entity_bonuses(entity_type = origin)`.

**Scope:**
- Replace app read path usage of `origin_bonuses`.
- Use shared resolved bonus model.

**Acceptance criteria:**
- App read path does not use `origin_bonuses`.
- Presentation and runtime use the same resolved bonus model.
- Build passes.

---

## Task F8 — Item generation base type model migration

**Goal:** Replace semantic use of `slot` with `base_type_key`.

**Scope:**
- Load and use `item_generation_base_types` and `item_generation_base_type_targets`.
- Treat `item_generation_bases.base_type_key` as source of truth.
- Keep `slot` as nullable legacy only.

**Acceptance criteria:**
- UI does not treat `slot` as source of truth.
- Slot/display metadata comes from base type metadata.
- Build passes.

---

## Task F9 — Item generation entity bonuses

**Goal:** Base and affix bonus read/write paths use `entity_bonuses`.

**Scope:**
- Replace app path usage of `item_generation_base_bonuses` and `item_generation_affix_bonuses`.
- Apply item quality scaling rules.

**Acceptance criteria:**
- New app paths do not use `item_generation_base_bonuses` or `item_generation_affix_bonuses`.
- `quality_scales_value` scales bonus value.
- `level_interval` is never quality-scaled.
- Build passes.

**Blocker:**
- If `entity_bonuses` lacks complete base/affix backfill, stop implementation and report SQL/backfill blocker.

---

## Task F10 — Building entity bonuses

**Goal:** Building bonuses use `entity_bonuses(entity_type = building)`.

**Scope:**
- Migrate building admin read/write.
- Migrate building preview/mansion read paths.

**Acceptance criteria:**
- Building admin, preview, and mansion flows do not use `building_bonuses`.
- Build passes.

**Blocker:**
- If building bonuses are not backfilled in `entity_bonuses`, stop and report SQL/backfill blocker. Do not add permanent fallback to legacy `building_bonuses`.

---

## Task F11 — Combat/equipment item bonus inputs

**Goal:** Combat formula inputs receive resolved item/equipment bonuses.

**Scope:**
- Connect combat item bonus inputs to resolved item/equipment bonus pipeline.
- Remove hardcoded zero item bonus inputs where appropriate.

**Important:**
- This depends on item/equipment/resolved bonus pipeline readiness.
- It may be implemented later after F8/F9 and equipment read model work.

**Acceptance criteria:**
- Combat does not rely on hardcoded zero item inputs.
- Combat bonus inputs do not depend on `hero_derived`.
- Build passes.

---

## Task F12 — Legacy bonus usage cleanup audit

**Goal:** Final repository audit after migration tasks.

**Scope:**
- Search application code for legacy bonus join tables and legacy semantic columns.
- Confirm remaining exceptions are limited to docs, generated database types, or explicit transitional adapters.

**Acceptance criteria:**
- App code does not read/write legacy bonus join tables.
- App code does not read/write legacy semantic columns as source of truth.
- Build and targeted tests pass.

---

# Epic G — Audit/logging foundation integration

## Task G1 — Audit dictionary read layer

**Goal:** Load audit action/entity dictionaries.

**Scope:**
- Domain models/mappers for:
  - `audit_action_types`,
  - `audit_entity_types`.
- Expose active rows to admin UI.

**Acceptance criteria:**
- Admin can inspect audit dictionary rows.
- Technical keys are treated as stable.

---

## Task G2 — Audit log read layer

**Goal:** Read audit logs for admin/case contexts.

**Scope:**
- Domain model for audit log rows.
- Query logs by entity/action/server/actor where supported.
- Keep metadata lightweight.

**Acceptance criteria:**
- Audit data can be displayed in admin/case views.

---

## Task G3 — Audit domain operation helper

**Goal:** Provide a reusable way for domain/backend operations to write audit.

**Scope:**
- Add a helper/function/domain operation for writing audit logs.
- Do not write audit from generic UI click handlers.
- Include:
  - actor,
  - server,
  - entity type/id,
  - action type,
  - reason/status reason,
  - lightweight metadata.

**Acceptance criteria:**
- Domain operations can use a consistent audit writer.

---

## Task G4 — Audit config governance changes

**Goal:** Log config changes.

**Scope:**
- Audit:
  - change set created,
  - ready/applied/cancelled,
  - scope changes,
  - value changes.
- Preserve reason and changelog visibility.

**Acceptance criteria:**
- Config changes leave audit evidence.

---

## Task G5 — Audit anti-abuse decisions

**Goal:** Log anti-abuse state changes.

**Scope:**
- Audit:
  - case status/verdict changes,
  - declaration decisions,
  - report decisions,
  - sanction creation/status changes,
  - CP penalty creation/status changes,
  - item confiscation/return.

**Acceptance criteria:**
- Important moderation/admin actions leave audit evidence.
- Full event snapshots are not stored in audit metadata.

---

## Task G6 — Audit gameplay persistent changes

**Goal:** Add audit to selected important gameplay state changes.

**Scope:**
Start with:
- stat allocation save,
- major item operations,
- trade operations once implemented,
- estate/building irreversible changes.

**Acceptance criteria:**
- Significant persistent gameplay changes are auditable.
- UI-only plus/minus clicks are not logged.

---

# Special Epic U0 — Roles, permissions and scoped moderation

These tasks are now implementation-oriented. Audit/spec tasks already completed should not keep multiplying unless a concrete implementation is blocked by unknown schema or conflicting requirements.

**Epic rule:** U0 work must not broaden `canManageSelectedServer` into a catch-all permission. Separate global admin, selected-server operator, scoped moderator, tester, assigned staff, and normal player gameplay permissions.

## Completed audit/spec tasks

- **U0-C1 — Frontend role usage audit** — Done / confirmed.
- **U0-C2 — Staff gameplay access audit** — Done / confirmed.
- **U0-C3 — User/staff management UI audit** — Done / confirmed.
- **U0-C4 — Moderator scope UI spec** — Done / confirmed.
- **U0-C6 — Staff/moderation navigation boundaries audit** — Done / confirmed.

## Task U0-I1 — Central staff access policy model

**Status:** Done / confirmed 2026-04-28.

**Goal:** Create one frontend policy layer for role-aware route, menu, dashboard-card and link visibility decisions.

**Scope:**
- Add typed access profile helpers for:
  - global admin,
  - server operator / owner,
  - scoped moderator,
  - tester,
  - assigned staff,
  - player.
- Derive policies from `ActiveServer.access`, selected server kind/status, selected-server staff role and future scope data.
- Do not use `canManageSelectedServer` as the only permission source.
- Add tests for standard, sandbox and testing server cases.

**Acceptance criteria:**
- Policy helpers distinguish management, moderation, testing and gameplay access.
- Normal players have no admin access.
- Assigned staff is a technical state, not automatic management authority.
- Tests cover admin/operator/moderator/tester/player cases.

---

## Task U0-I2 — Staff gameplay boundary implementation

**Status:** Done / confirmed 2026-04-28.

**Goal:** Block normal player gameplay for staff assigned to a standard server while preserving sandbox/testing exceptions.

**Scope:**
- Add central helper/computed flag for staff gameplay blocked state.
- Apply it to `/hero/*` and `/game/*` through guard/layout boundary.
- Add a dedicated staff gameplay blocked notice; do not reuse suspended/banned membership punishment notice.
- Hide or disable gameplay sidebar links in blocked context.
- Ensure topbar does not present misleading normal gameplay context when gameplay is staff-blocked.

**Acceptance criteria:**
- Player on standard live server can access gameplay.
- Assigned owner/operator/moderator/tester on standard server cannot access normal gameplay.
- Assigned staff on sandbox/testing can use gameplay for testing.
- Suspended/banned membership remains a stronger separate block with its own notice.
- `/admin/*` is not blocked by staff gameplay boundary.

---

## Task U0-I3 — Admin route guard and sidebar boundary

**Status:** Done / confirmed 2026-04-28.

**Goal:** Add route and menu boundaries for admin/staff areas.

**Scope:**
- Add `/admin/*` guard using the central access policy model.
- Filter or hide the sidebar `Admin` link for users with no admin/staff/moderation access.
- Add a clear access denied view/message for direct `/admin` navigation.
- Preserve backend/RLS/RPC authorization as source of truth; frontend guard is UX/security boundary, not a replacement.

**Acceptance criteria:**
- Player does not see `Admin` and direct `/admin` is blocked gracefully.
- Global admin can access admin dashboard.
- Server operator can access allowed selected-server tools.
- Scoped moderator can access only moderation surfaces once present.
- Tester does not receive management tools by default.

---

## Task U0-I4 — Admin dashboard cards and tag-link filtering

**Status:** Done / confirmed 2026-04-28.

**Goal:** Make admin dashboard and cross-page admin links respect access policies.

**Scope:**
- Add access metadata or a central registry for admin dashboard cards and admin tag links.
- Filter cards/links from the same policy source used by route guards.
- Remove stale dashboard copy saying there are no roles/guards.
- Hide/deactivate gameplay links when staff gameplay boundary blocks the selected server context.

**Acceptance criteria:**
- UI no longer advertises pages the guard will block.
- Moderator does not see balance/config/formula/building tools unless explicitly allowed.
- Admin/operator see relevant tools.
- Gameplay links respect U0-I2 boundary.

---

## Task U0-I5 — Staff management read models and services

**Status:** Done / confirmed 2026-04-28.

**Goal:** Add typed read/domain layer for staff and role management before building the UI.

**Scope:**
- Load/search safe user candidates without reading `auth.users` directly from Angular.
- Load `roles` by stable `key`.
- Load active `staff_permission_scopes` with label/description/helper text.
- Load selected-server staff assignments with assigned scopes.
- Add typed RPC wrappers for:
  - `assign_global_role`,
  - `assign_server_staff`,
  - `revoke_server_staff`,
  - `set_server_staff_permission_scopes`,
  - `user_has_hero_on_server`,
  - `user_has_staff_disqualifying_history`.
- Add missing `TABLES` constants for read-only dictionaries/tables where needed.

**Acceptance criteria:**
- No direct writes to staff tables.
- Roles/scopes come from DB dictionaries.
- Domain models do not expose raw generated rows directly.
- Payload mapper tests and build pass.

---

## Task U0-I6 — Staff management UI foundation

**Status:** Done / confirmed 2026-04-28.

**Goal:** Build the first role-aware staff management page.

**Scope:**
- Server selection / selected server context.
- User search/selection from safe user read model.
- Eligibility panel using `user_has_hero_on_server` and `user_has_staff_disqualifying_history`.
- Staff role selection.
- Required reason and optional notes.
- Assign/revoke staff through RPC service.
- Toast/message handling for RPC denials.

**Acceptance criteria:**
- Standard server blocks user with hero on that server as staff candidate.
- Sandbox/testing exception is shown and respected.
- Staff-disqualifying history is visible before submit.
- Reason is required.
- Mutations use RPC only.
- RPC denial appears as PrimeNG toast/message.

---

## Task U0-I7 — Moderator scope assignment UI

**Goal:** Implement the moderator scope UI designed in U0-C4.

**Scope:**
- Display active `staff_permission_scopes` as label/description/helper text first, technical key second.
- Show current assigned scopes for selected staff assignment.
- Assign/update scopes through `set_server_staff_permission_scopes` only.
- Optional pre-check with `can_have_moderator_scope(serverId, scopeKey)` where available.
- Require reason.

**Acceptance criteria:**
- No hardcoded scope list.
- Scope checklist is human-readable.
- Moderator scope mutations use RPC.
- Scoped moderator does not receive this management UI.
- Tests cover eligibility mapping and RPC payload.

---

## Task U0-I8 — Moderation actions UI foundation

**Goal:** Build the first usable UI for U0 moderation actions.

**Scope:**
- Load `moderation_action_types` and allowed `staff_permission_scopes`.
- Create local warning/account warning/restriction/suspension/ban through `create_moderation_action`.
- Require reason.
- Allow source entity id/type where relevant.
- Show server-scoped moderation history through RPC.

**Acceptance criteria:**
- No direct writes to `moderation_actions`.
- UI uses dictionaries, not hardcoded action lists.
- Moderator only sees actions allowed by scope.
- Operator/admin can see appropriate history.
- Denied actions show toast/message.

---

## Task U0-I9 — Moderation history and disqualification panels

**Goal:** Surface prior moderation history where staff decisions require it.

**Scope:**
- Use `get_visible_moderation_actions(...)` for scoped/moderator-facing moderation action history.
- Use `get_full_user_moderation_history(...)` and `get_full_hero_moderation_history(...)` only for admin/operator full moderation action history.
- Do not use or reintroduce removed legacy RPC names `get_user_moderation_history(...)` / `get_hero_moderation_history(...)`.
- Server-scoped by default.
- Full history only for admin/operator; scoped moderator sees only allowed context.
- Integrate warnings into staff candidate eligibility and anti-abuse case detail later.

**Acceptance criteria:**
- Staff-disqualifying history is explainable in UI.
- Moderator does not get global account history unless policy allows it.
- History is read-only and does not replace reason-required actions.
- Removed legacy history RPC names are not reintroduced as frontend fallbacks.

# Epic H — Anti-abuse foundation integration

## Task H1 — Anti-abuse dictionary models

**Goal:** Add typed models for anti-abuse dictionaries.

**Scope:**
- `anti_abuse_signal_types`
- `anti_abuse_sanction_types`
- `player_relationship_declaration_types`
- `player_abuse_report_types`

**Acceptance criteria:**
- Models include descriptions/helper/admin text and required-field flags.

---

## Task H2 — Anti-abuse dictionary loaders

**Goal:** Load active dictionary rows.

**Scope:**
- Read active dictionary values.
- Sort by sort order/key.
- Expose to player/staff forms.

**Acceptance criteria:**
- No hardcoded anti-abuse type lists in UI.

---

## Task H3 — Anti-abuse case read models

**Goal:** Model cases and linked context.

**Scope:**
- Cases.
- Signals.
- Case-signal links.
- Participants.
- Case-audit links.
- Case-declaration links.

**Acceptance criteria:**
- Case detail aggregation is possible.

---

## Task H4 — Server-scoped case list service

**Goal:** Load cases for selected server.

**Scope:**
- List cases by server.
- Basic filters:
  - status,
  - verdict,
  - source,
  - date range if practical.

**Acceptance criteria:**
- Staff does not see unrelated server cases by default.

---

## Task H5 — Case detail aggregation service

**Goal:** Load all linked case data.

**Scope:**
- Participants.
- Signals.
- Reports.
- Declarations.
- Audit logs.
- Sanctions.
- CP penalties.
- Sanction items.

**Acceptance criteria:**
- One service/domain method gives case detail view model.

---

## Task H6 — Player relationship declaration form model

**Goal:** Dynamic form from declaration type flags.

**Scope:**
- Required/visible fields:
  - participants,
  - amount,
  - item selection,
  - trade selection,
  - expiration,
  - description/reason.
- Show helper/description.

**Acceptance criteria:**
- Form adapts to DB type flags.

---

## Task H7 — Player relationship declaration submission

**Status:** Done / confirmed 2026-04-30.

**Goal:** Player can submit declaration.

**Scope:**
- Submit declaration with server/user/hero context.
- Persist participants/items/trades where supplied.
- Prefer RPC if available.

**Acceptance criteria:**
- Declaration can be submitted and later listed.

---

## Task H8 — Player declaration list/status view

**Status:** Done / confirmed 2026-04-30 as service/read-model slice. Player-facing UI remains a later integration step.

**Goal:** Player can see declarations and reasons.

**Scope:**
- List relevant declarations.
- Show status, reason, participants, items/trades, timestamps.

**Acceptance criteria:**
- Read model/service lists relevant declarations for a server/user/hero context without staff-only field leaks.
- Player UI still needs to consume this read model before the full user-facing screen is complete.

---

## Task H9 — Staff declaration review

**Status:** Done / confirmed 2026-04-30 as service/read-model slice. Staff-facing UI remains a later integration step.

**Goal:** Staff can accept/reject/revoke declarations.

**Scope:**
- Detail view.
- Status transitions with reason.
- Audit hook where available.

**Acceptance criteria:**
- Staff decision and reason are stored and visible.
- Service confirms the declaration belongs to the selected server before loading linked rows or sending a decision workflow request.

---

## Task H10 — Player abuse report form model

**Status:** Done / confirmed 2026-04-30.

**Goal:** Dynamic form from report type flags.

**Scope:**
- Required/visible fields:
  - accused hero,
  - item selection,
  - trade selection,
  - description.
- Show helper/description.

**Acceptance criteria:**
- Form adapts to DB report type flags.
- `title` and `description` remain base required fields while the submission RPC requires them.

---

## Task H11 — Player abuse report submission

**Status:** Done / confirmed 2026-04-30.

**Goal:** Player can submit abuse report.

**Scope:**
- Use current server/hero/user context.
- Use `create_player_abuse_report` RPC if available.
- Report should create/link case.

**Acceptance criteria:**
- Player can submit report.
- Linked case exists when RPC path is used.

---

## Task H12 — Player abuse report list/status view

**Status:** Done / confirmed 2026-04-30 as service/read-model slice. Player-facing UI integration remains a later slice.

**Goal:** Player can see report status.

**Scope:**
- Show type, status, reason, linked case status if visible, timestamps.
- Do not expose staff-only/private data.

**Acceptance criteria:**
- Player understands submitted/linked/dismissed/resolved state.

---

## Task H13 — Staff case list page

**Goal:** Staff can browse cases.

**Scope:**
- Server-scoped table/list.
- Filters by status/verdict/source/participant/date.

**Acceptance criteria:**
- Staff can open case detail from list.

---

## Task H14 — Staff case detail page

**Goal:** Staff can review complete case.

**Scope:**
- Header/status/verdict/reasons.
- Sections:
  - participants,
  - signals,
  - reports,
  - declarations,
  - audit logs,
  - sanctions,
  - CP penalties,
  - sanction items.

**Acceptance criteria:**
- Staff can understand case context from one screen.

---

## Task H15 — Case status transition action

**Goal:** Staff can update process status.

**Scope:**
- open,
- in_review,
- waiting_for_player,
- resolved,
- cancelled.
- Require reason/status reason where applicable.

**Acceptance criteria:**
- Status transition persists and is visible.

---

## Task H16 — Case verdict action

**Goal:** Staff can set verdict and sanction_required.

**Scope:**
- Verdicts:
  - no_abuse,
  - insufficient_evidence,
  - abuse_confirmed,
  - resolved_by_voluntary_return.
- Do not add false_positive.
- Require verdict reason.
- Warn/block final resolution when sanction_required but no sanctions exist.

**Acceptance criteria:**
- Verdict is stored with reason.
- Sanction requirement is visible/enforced.

---

## Task H17 — Sanction domain models

**Goal:** Model sanctions and CP penalties.

**Scope:**
- `anti_abuse_sanctions`
- `anti_abuse_sanction_items`
- `character_point_penalties`

**Acceptance criteria:**
- Explicit fields are modeled; no core data hidden in metadata JSON.

---

## Task H18 — Sanction type-driven form model

**Goal:** Dynamic sanction form from sanction type flags.

**Scope:**
- reason,
- duration/dates,
- CP amount,
- item selection,
- source hero,
- target hero.

**Acceptance criteria:**
- Warning/suspension/fine/item forms show the correct fields.

---

## Task H19 — Sanction creation operation

**Goal:** Staff can create sanctions.

**Scope:**
- Create sanction.
- Create CP penalty for CP fine.
- Create sanction item links for item sanctions.
- Validate required fields.

**Acceptance criteria:**
- Staff can create at least warning, suspension, CP fine.
- Case detail shows sanctions.

---

## Task H20 — Sanction status update operation

**Goal:** Staff can progress/cancel/forgive/fail sanctions.

**Scope:**
- pending,
- applied,
- completed,
- cancelled,
- forgiven,
- failed.
- Require reason for cancellation/forgiveness/failure.

**Acceptance criteria:**
- Status updates persist with timestamps/reasons.

---

## Task H21 — CP penalty view/management

**Goal:** Staff can inspect CP fine debt.

**Scope:**
- Show total/paid/remaining/status.
- Manual complete/cancel/forgive where supported.
- Do not implement automatic siphoning yet unless separately assigned.

**Acceptance criteria:**
- CP penalty is visible in case/hero history.

---

## Task H22 — Repeat offender/history view

**Goal:** Staff can review prior cases/sanctions for hero/account.

**Scope:**
- History panel for selected hero/user:
  - past cases,
  - sanctions,
  - warnings,
  - CP penalties.
- Server-scoped by default.

**Acceptance criteria:**
- Staff can evaluate repeat offender patterns.

---

# Epic I — Item lifecycle

## Task I1 — Add lifecycle fields to item domain models

**Goal:** App understands active/scrapped items.

**Scope:**
- Include:
  - status,
  - scrapped_at,
  - recoverable_until,
  - updated_at.

**Acceptance criteria:**
- Item domain model includes lifecycle state.

---

## Task I2 — Filter scrapped items from normal inventory

**Goal:** Prevent scrapped items from appearing usable.

**Scope:**
- Player inventory/armory views show active items only.
- Staff anti-abuse views may access recoverable scrapped items.

**Acceptance criteria:**
- Player cannot use scrapped items.

---

## Task I3 — Implement safe scrap behavior skeleton

**Goal:** Align scrap flow with item lifecycle.

**Scope:**
- No-affix trivial items may be permanently removed.
- Affix-bearing items become scrapped/recoverable.
- If affix info is not available, avoid unsafe permanent delete and add TODO.

**Acceptance criteria:**
- Affix-bearing items are not accidentally permanently deleted.

---

## Task I4 — Staff item recovery operation

**Goal:** Allow recovery for anti-abuse cases later.

**Scope:**
- Staff operation to locate recoverable scrapped item.
- Restore or transfer according to sanction/case decision.
- Preserve reason/audit.

**Acceptance criteria:**
- Staff can recover relevant scrapped item when linked to case/sanction.

---

# Epic J — Items, economy and player trade

Epic J must follow the current database/RPC reality, not the older placeholder market-listing concept.

Current source of truth:
- Direct player-to-player trade already has a DB/RPC foundation.
- One-item auctions already have a DB/RPC foundation.
- Trade/auction use Character Points, not drachmas.
- Drachmas are vendor/system/building currency.
- Vendor scrap/sell is not player trade.
- Do not design or implement a new `market_listings` table unless a new explicit product/database decision replaces the current direct-trade/auction model.
- Do not write directly to trade, auction, lock, transaction, item ownership, or item lifecycle tables from Angular.
- Use existing public RPCs from `database-current.md` and generated `database.types.ts`.
- Internal helper RPCs/functions are not frontend contracts.

Known current DB/RPC concepts for this epic:
- direct trade: `player_trade_offers`, `player_trade_offer_items`, `player_trade_transactions`, `player_trade_transaction_items`, `character_point_locks`;
- auction: `player_auction_listings`, `player_auction_bids`, `character_point_locks`, `player_trade_transactions(transaction_type = auction_sale)`, `player_trade_transaction_items`;
- item locks: `items.status = locked_trade | locked_auction`;
- player-facing trade/auction mutations should use public RPCs such as `create_player_direct_trade_offer`, `respond_player_direct_trade_offer`, `confirm_player_direct_trade_offer`, `cancel_player_direct_trade_offer`, `reject_player_direct_trade_offer`, `create_player_auction_listing`, `place_player_auction_bid`, `buy_now_player_auction`, `cancel_player_auction_listing`, and `close_player_auction_listing` where present in current generated types.

## Task J1 — Align trade/auction frontend plan with existing DB/RPC contract

**Status:** Done / confirmed 2026-04-30 as inspect/preflight slice.

**Goal:** Replace the older market/listing assumptions with the current direct-trade and one-item auction model.

**Scope:**
- Inspect current frontend item/trade/auction code and current generated DB types.
- Read `database-current.md` sections for direct trade, auctions, Character Points, item lifecycle, and anti-abuse trade signals.
- Confirm which public RPCs are available in current generated types.
- Identify any frontend paths that still assume a generic `market_listings` model.
- Report blockers instead of designing new schema.

**Acceptance criteria:**
- Report lists available trade/auction RPCs and tables used by existing DB contract.
- Report identifies any outdated market/listing assumptions in app code or prompts.
- No new schema is proposed for player market listings.
- No code changes unless explicitly requested.

---

## Task J2 — Direct trade read models and services

**Status:** Done / confirmed 2026-04-30 as service/read-model slice.

**Goal:** Add typed frontend read/domain layer for existing direct trade offers and transactions.

**Scope:**
- Model direct trade offers, offer items, transaction rows, transaction items, CP amounts, status, timestamps and participant hero labels.
- Load active/relevant direct trade offers for the active hero and selected server.
- Load historical direct trade transactions where needed for UI/history.
- Use active server and active hero context.
- Keep read models separate from mutation payloads.

**Acceptance criteria:**
- Direct trade lists/details can be displayed using current DB data.
- Queries are server/hero scoped.
- No direct write paths are added.
- No broad unrelated item/user fetches are added.
- Build and focused mapper/service tests pass.

---

## Task J3 — Direct trade mutation UI through existing RPCs

**Status:** Done / confirmed 2026-04-30. Manual full trade smoke pending sandbox data with two heroes, active items, session and real trade flow.

**Goal:** Let players create, respond to, confirm, cancel and reject direct trade offers through existing DB/RPC workflows.

**Scope:**
- Create offer from active hero to target hero using current RPC contract.
- Allow target response with CP and item selection where supported.
- Allow creator confirmation where required.
- Allow cancellation/rejection through current RPCs.
- Display CP locks and item lock state clearly.
- Use DB-backed human-readable target/item pickers where needed.

**Acceptance criteria:**
- Mutations use public trade RPCs only.
- No direct writes to `player_trade_offers`, `player_trade_offer_items`, `character_point_locks`, `items.status`, `player_trade_transactions`, or `player_trade_transaction_items`.
- CP-only-for-CP-only trade remains blocked by DB workflow.
- Trade offer expiry/cancel/reject cleanup is handled by DB/RPC, not Angular table writes.
- RPC errors are surfaced as user-readable messages/toasts.
- Build and targeted tests pass.

**Blocker rule:**
If the needed public RPC is missing from generated types or has a different signature than expected, stop and report DB/types blocker. Do not invent a frontend fallback.

---

## Task J4 — Auction gameplay UI through existing RPCs

**Status:** Done / confirmed 2026-04-30. Manual full auction smoke pending sandbox data with active item, at least two heroes, CP and real auction flow.

**Goal:** Build player-facing one-item auction surfaces using the existing auction DB/RPC foundation.

**Scope:**
- List active server-scoped auction listings.
- Create one-item auction listing from active hero inventory.
- Support auction modes currently available in DB: bidding, buy now, bidding with buy now.
- Place bid through RPC.
- Buy now through RPC.
- Close ended auction through RPC where appropriate.
- Cancel auction where allowed through RPC.
- Display active item/CP lock state and auction status.

**Acceptance criteria:**
- Auction creation/bidding/buy-now/cancel/close use public auction RPCs only.
- No direct writes to `player_auction_listings`, `player_auction_bids`, `character_point_locks`, `items.status`, `player_trade_transactions`, or `player_trade_transaction_items`.
- Seller cannot bid/buy own auction.
- Auction duration and minimum bid increment come from server config/RPC behavior, not hardcoded Angular constants.
- Expired/no-bid and completed auction states are displayed correctly.
- Build and targeted tests pass.

**Blocker rule:**
If a required auction RPC/read model is missing or not present in generated types, stop and report DB/types blocker. Do not create a parallel market/listing flow.

---

## Task J5 — Trade/auction transaction item snapshot features

**Status:** Done / confirmed 2026-05-01.

**Goal:** Support anti-abuse similarity checks with stable item snapshots captured at transaction time.

**Needed DB direction:**
`player_trade_transaction_items` should store lightweight item snapshot features such as quality key, base/base-type, prefix/suffix ids or presence, item value bucket, value snapshot and display/name snapshot at transaction time. These snapshots are for anti-abuse and report/debug evidence. They should not be reconstructed from current live item state.

**Scope after DB migration exists:**
- Update generated types.
- Extend transaction item domain models/mappers with snapshot fields.
- Use snapshot fields in anti-abuse/trade history views where relevant.
- Avoid live item joins for historical similarity when snapshot fields are available.

**Acceptance criteria:**
- If snapshot columns are absent, Codex reports DB blocker and does not implement a fake client-side substitute.
- If snapshot columns exist, transaction item mappers include them.
- Similarity/history UI reads snapshot fields instead of recalculating from current item state.
- Build and mapper tests pass.

---

## Task J6 — Trade and auction audit frontend alignment

**Status:** Done / confirmed 2026-05-01 as service/test alignment slice. Manual smoke not applicable.

**Goal:** Align frontend trade/auction flows with the current DB-owned audit foundation.

**Current DB status:** DB foundation exists. Trade/auction lifecycle audit is trigger-owned in the database. Frontend must not add Angular-side `AuditWriter` calls for these lifecycle events.

DB-owned audit currently covers:
- direct trade offer create/respond/cancel/reject/expire/fail;
- auction listing list/cancel/expire/fail;
- auction bid placement;
- auction buy-now / auction close path reason;
- completed direct trade / auction sale transactions.

**Scope:**
- Confirm frontend trade/auction mutations still go only through canonical public RPCs.
- Remove or update stale blocker notes/comments claiming lifecycle audit is missing.
- Do not call low-level audit helpers from Angular.
- Do not duplicate DB-owned audit in frontend services.
- If UI exposes audit/history later, read existing audit/domain history instead of recreating evidence client-side.

**Acceptance criteria:**
- Trade/auction UI has no direct calls to low-level audit helpers.
- All trade/auction mutations continue to use public RPC/domain operations.
- Stale DB audit blocker comments are removed or updated.
- Build and focused trade/auction tests pass.

---

## Task J7 — Vendor scrap/sell for drachmas

**Status:** Done / confirmed 2026-05-01 as core service/mapper slice. Manual smoke not applicable until player-facing inventory/armory vendor sell UI exists with real active item data.

**Goal:** Implement the vendor/system economy path for converting items into drachmas through the canonical DB/RPC workflow.

**Current DB status:** DB/RPC foundation exists. Use `vendor_scrap_hero_item(...)`.

Current DB contracts:
- `vendor_scrap_drachma_payout_percent` config, default 50;
- `get_vendor_scrap_drachma_payout_percent()` helper;
- `vendor_scrap_hero_item(p_item_id, p_actor_hero_id, p_reason, p_request_id)` public RPC;
- `scrap_hero_item(...)` remains the internal canonical item lifecycle cleanup path used by vendor workflow.

**Scope:**
- Treat vendor scrap/sell as a system/vendor operation, not player-to-player trade.
- Use drachmas/resources, not Character Points.
- Call `vendor_scrap_hero_item(...)` from frontend/domain services.
- Do not compose `scrap_hero_item(...)` and resource changes in Angular.
- Show payout amount/result from RPC response.
- Preserve clear UX language: vendor sell/scrap is irreversible according to item lifecycle outcome and is not trade.

**Acceptance criteria:**
- Vendor scrap/sell does not use trade/auction tables or Character Points.
- Drachma payout is handled by `vendor_scrap_hero_item(...)`, not direct Angular table updates.
- Item cleanup follows current lifecycle rules through DB/RPC.
- Frontend does not call `apply_reward_resource_delta(...)` directly for vendor sell.
- Frontend does not direct-write `items`, `hero_resources`, audit logs or resource balances.
- Build and focused armory/item service tests pass.

---

# Epic K — Anti-abuse signal generation/detection

Epic K is an implementation/alignment epic over the existing DB-owned anti-abuse foundation. It is not a fresh Angular signal-insert system.

Current source of truth:
- anti-abuse signal/case generation already exists in DB/RPC/trigger foundations for trade, auction, repeated transfers and identity observation signals where implemented;
- signal/case grouping is DB-owned;
- client code must not insert directly into `anti_abuse_signals`, `anti_abuse_cases`, case links or participant tables;
- public frontend code may call approved public RPCs/Edge Functions only;
- internal helpers must not be exposed as Angular service contracts.

## Task K1 — Signal generation contract alignment

**Status:** Done / confirmed 2026-05-01 as inspect/contract-alignment slice. Build/tests not applicable because no code changes were made.

**Goal:** Align frontend/domain anti-abuse integration with the current DB-owned signal generation contract.

**Scope:**
- Run `git status --short` first.
- Inspect generated `database.types.ts` and current docs for anti-abuse signal/case functions, triggers and Edge Function calls.
- Classify available functions as:
  - public frontend contract,
  - internal DB helper,
  - trigger-owned workflow,
  - Edge Function call,
  - not safe for direct Angular use.
- Confirm frontend must not direct-insert anti-abuse signals/cases.
- Identify any stale code/comments/backlog assumptions about client-side signal skeletons.

**Acceptance criteria:**
- Report lists the safe public anti-abuse integration points and internal-only helpers.
- No Angular code writes directly to anti-abuse signal/case tables.
- If a required public contract is missing, Codex reports a DB/RPC blocker instead of building a client-side workaround.

---

## Task K2 — Anti-abuse signal and case read models

**Goal:** Add/align typed read/domain models for the existing DB-backed signal/case system.

**Scope:**
- Model/read:
  - signal types,
  - signals,
  - cases,
  - case-signal links,
  - case participants,
  - related entity references where present.
- Use DB labels/descriptions/helper text where available.
- Keep player-facing and staff-facing fields separate.
- Do not mutate anti-abuse state in this task.

**Acceptance criteria:**
- Staff/admin services can read server-scoped signals/cases through current DB schema/RPC/read paths.
- Models do not expose raw generated rows directly to UI pages.
- No direct signal/case inserts are added.
- Build and mapper/service tests pass.

---

## Task K3 — Trade/auction signal review integration

**Goal:** Let staff review DB-generated trade/auction anti-abuse signals without recreating detection logic in Angular.

**Scope:**
- Surface signals/cases created by trade/auction DB workflows.
- Show related trade offer, auction listing, bid, transaction and item snapshot references where available.
- Display signal type labels, descriptions, severity/score/confidence, reason and grouping context.
- Link to existing trade/auction history/read models where available.

**Acceptance criteria:**
- Staff can understand why a trade/auction signal exists.
- UI does not recompute suspicious price/repeated-transfer detection client-side.
- Missing referenced data is handled gracefully.
- Build and smoke pass.

---

## Task K4 — Identity observation / same-IP-device integration boundary

**Goal:** Integrate the approved identity-observation path without unsafe IP handling in Angular.

**Scope:**
- Use the approved Supabase Edge Function / backend contract for identity observation where available.
- Do not store raw IP addresses in Angular state or DB writes.
- Do not hash/dehash IPs client-side.
- Surface only safe statuses/errors in UI/diagnostics.
- If generated types or Edge Function config are missing, report a precise blocker.

**Acceptance criteria:**
- Identity observation path is backend/Edge-owned.
- Angular does not create raw IP/device signals directly.
- Same-IP/device signal review remains DB/staff-side.
- Build passes.

---

## Task K5 — Signal grouping and case explainability UI

**Goal:** Make DB-owned signal grouping/cases explainable for staff.

**Scope:**
- Show case grouping key/context in human terms.
- Show linked signals, participants and related entities.
- Show auto-created vs manually-created case source where available.
- Explain that anti-abuse signals are review aids, not automatic punishment.

**Acceptance criteria:**
- Staff can inspect grouped signals from one case view.
- UI does not imply automatic punishment.
- Status/verdict/sanction actions remain in Epic H flows.

# Epic L — PvE exploration/trials frontend integration

Epic L is now an implementation epic over the existing PvE DB/RPC foundation, not a fresh design/audit epic.

**Current DB foundation expected before Codex starts L tasks:**
- L-DB1 dictionaries/formula targets/reward foundation are applied.
- L-DB2 exploration runtime tables are applied.
- L-DB3a bootstrap/state/start-step RPCs are applied.
- L-DB3b step resolve/outcome RPCs are applied.
- L-DB3c reward/challenge completion RPCs are applied.
- L-DB4a sandbox/admin helper RPCs are applied.
- L-DB4b forced outcome/challenge testing RPCs are applied.
- L-DB4c preview/simulation RPCs are applied:
  - `preview_trial_opportunity_curve(...)`,
  - `preview_trial_manifestation_chance(...)`,
  - `preview_challenge_auto_resolve_success_chance(...)`,
  - `preview_reward_generated_item(...)`,
  - `preview_reward_profile(...)`,
  - `simulate_trial_opportunity_runs(...)`.
- Runtime reward item generation has a known fix applied so `generate_reward_item_for_hero(...)` stores the picked quality key once and avoids duplicated `of of` suffix display.

**Epic rules:**
- Do not redesign PvE from scratch.
- Use canonical terms: Exploration, Trial opportunity/appearance, Trial manifestation, Trial completion, Encounter, Health.
- Do not call the implementation loop “monster hunt” except when referencing old legacy docs.
- Use selected server + active hero; never assume `hero.id === auth.uid()`.
- Use generated database types after the user regenerates them; do not invent schema or RPC signatures.
- Player-facing persistent mutations must go through DB/RPC workflows, not direct writes to exploration/challenge/reward tables.
- Admin/sandbox actions must use the dedicated test/helper RPCs and should surface permission/RPC denials clearly.
- Use DB dictionaries/read models for difficulty tiers, trials, encounters, rewards and preview labels; avoid hardcoded gameplay lists where DB data exists.
- Treat preview/simulation RPCs as read-only lab/admin/player explanation tools; do not use them to mutate runtime state.
- Preserve human-readable explainability in UI: labels, descriptions, helper text, explanatory copy for chances, caps, rewards and debug tools.
- If generated types do not include the expected PvE tables/RPCs, stop and report a DB types/schema alignment blocker.

## Task L1 — DB/types alignment after PvE migrations

**Goal:** Confirm the frontend type layer can safely consume the PvE DB/RPC foundation after the user regenerates Supabase types.

**Scope:**
- Run `git status --short` first.
- Inspect generated database types after user-side regeneration.
- Confirm generated types expose the expected PvE tables:
  - `exploration_difficulty_tiers`,
  - `exploration_minigame_definitions`,
  - `trial_definitions`,
  - `encounter_definitions`,
  - `exploration_location_descriptions`,
  - `trial_manifestation_cap_profiles`,
  - `reward_profiles`,
  - `reward_profile_entries`,
  - `reward_profile_assignments`,
  - `reward_grants`,
  - `reward_grant_entries`,
  - `hero_daily_action_counters`,
  - `hero_explorations`,
  - `hero_exploration_nodes`,
  - `hero_exploration_edges`,
  - `hero_exploration_steps`,
  - `hero_exploration_effects`,
  - `hero_exploration_challenge_attempts`,
  - `hero_exploration_test_overrides`.
- Confirm generated types expose the expected PvE RPCs:
  - `start_or_get_hero_exploration(...)`,
  - `get_hero_exploration_state(...)`,
  - `start_hero_exploration_step(...)`,
  - `resolve_hero_exploration_step(...)`,
  - `complete_hero_exploration_challenge_attempt(...)`,
  - `auto_resolve_hero_exploration_challenge_attempt(...)`,
  - `get_hero_exploration_debug_state(...)`,
  - `add_hero_remaining_actions(...)`,
  - `reset_hero_exploration(...)`,
  - `skip_hero_exploration_step_timer(...)`,
  - `test_grant_reward_profile_to_hero(...)`,
  - `set_next_hero_exploration_outcome_override(...)`,
  - `force_complete_hero_exploration_challenge_attempt(...)`,
  - all six L-DB4c preview/simulation RPCs.
- Do not regenerate types unless the user explicitly asks Codex to do so.
- Do not mark any L task complete in docs during this alignment task.

**Acceptance criteria:**
- Expected PvE tables and RPCs are visible in generated types.
- App compiles after type inspection or any minimal type-reference fixes.
- If any expected table/RPC/type is missing, Codex reports a precise blocker instead of starting L2.
- No raw generated rows replace domain models.

---

## Task L2 — Exploration domain models and mappers

**Goal:** Add typed frontend domain/read models for the DB-backed exploration/trial foundation.

**Scope:**
- Add models/mappers for:
  - exploration difficulty tier,
  - minigame definition,
  - trial definition,
  - encounter definition,
  - location description,
  - manifestation cap profile,
  - reward profile and reward profile entry,
  - reward grant and reward grant entry,
  - hero daily action counter,
  - exploration state,
  - exploration node,
  - exploration edge,
  - exploration step,
  - exploration effect,
  - challenge attempt,
  - exploration debug state,
  - L-DB4c preview/simulation output models.
- Place shared models/mappers under `core/domain` / `core/interfaces` / `core/services` according to project structure.
- Keep route components thin; do not put reusable types/interfaces in components.
- Preserve DB labels/descriptions/helper text in mapped models.
- Represent statuses and outcome kinds as typed string unions/enums derived from generated types where practical.

**Acceptance criteria:**
- Exploration/trial/reward read models do not expose raw DB rows directly to pages.
- Mappers handle nullable fields and metadata JSON safely.
- Build passes.
- No gameplay mutation UI is implemented in this task.

---

## Task L3 — Player exploration start/status screen

**Goal:** Create the player-facing entry/status surface for the current hero’s daily exploration.

**Scope:**
- Add or update a route/page under the gameplay area for Exploration.
- Load selected server and active hero before any hero-owned PvE calls.
- Use `start_or_get_hero_exploration(...)` and/or `get_hero_exploration_state(...)` through a typed service.
- Display:
  - current exploration status,
  - current difficulty if one exists,
  - remaining daily trial count,
  - active/pending step or challenge status,
  - clear empty/no-exploration state.
- Show active difficulty tiers from DB, not hardcoded cards.
- Surface human-readable descriptions, timing expectations and chance explanations where available.
- Use L-DB4c preview data where useful for difficulty graphs/curve explanation, without treating preview as runtime truth.

**Acceptance criteria:**
- A player can reach a clear Exploration status page for the active hero/server.
- Page does not assume `hero.id === auth.uid()`.
- Remaining trial count is shown in gameplay terms.
- Difficulty cards/options come from DB read models.
- No direct writes to exploration tables.

---

## Task L4 — Graph state read and direction UI

**Goal:** Show the current exploration graph/path state and allow valid direction choices.

**Scope:**
- Read graph/path state from `get_hero_exploration_state(...)`.
- Display current node, discovered branches and available directions.
- Preserve discovered state: previously discovered nodes/edges are displayed as remembered, not rerolled in the frontend.
- Support backtracking if DB state exposes a valid edge/path for it.
- Disable direction choices while a step is already active, awaiting resolution, or while a challenge attempt blocks movement.
- Explain that every movement step costs time, including the first step.

**Acceptance criteria:**
- Direction UI is driven by server-side graph state.
- Backtracking, if available in state, is shown as a normal time-costing choice.
- Frontend does not generate or mutate graph nodes/edges itself.
- Empty/no-direction states are readable and non-crashing.

---

## Task L5 — Start step timer/progress and sandbox skip support

**Goal:** Implement the player movement step start and waiting/progress UI.

**Scope:**
- Start movement through `start_hero_exploration_step(...)` only.
- Show step timer/progress from DB-returned timestamps/duration fields.
- Make clear that the player must wait before resolving the result.
- Handle in-progress, ready-to-resolve, expired/stale and blocked states.
- Add sandbox/testing/admin skip support through `skip_hero_exploration_step_timer(...)` only where the backend permits it.
- Do not let normal players bypass timers through client-only logic.

**Acceptance criteria:**
- Starting a step creates/uses the DB workflow, not direct table inserts.
- Timer/progress survives refresh by re-reading DB state.
- Sandbox skip uses the RPC and shows a clear testing-only label.
- Normal user path cannot skip by frontend-only state changes.
- Build passes and route smoke works.

---

## Task L6 — Resolve step result UI

**Goal:** Resolve an eligible exploration step and display the resulting gameplay outcome.

**Scope:**
- Resolve through `resolve_hero_exploration_step(...)` only.
- Handle/display outcome categories:
  - nothing/flavor,
  - non-trial encounter,
  - trial opportunity with manifestation failure,
  - manifested trial/challenge attempt,
  - relevant error/blocked states.
- Preserve current roll-order semantics in UI copy:
  - trial opportunity is checked first,
  - if no trial opportunity, encounter-or-nothing is checked,
  - trial and encounter do not happen on the same step,
  - encounter does not reset trial progression,
  - trial opportunity resets dry-step progression.
- Display encounter definitions and trial definitions using DB labels/descriptions.
- If a buff/debuff effect exists, show its active/consumed state clearly.

**Acceptance criteria:**
- User can resolve a ready step and see a readable result.
- UI explains no-trial, encounter, manifestation-failed and challenge-created outcomes differently.
- No frontend roll logic duplicates or replaces DB roll logic.
- No direct writes to step/challenge/effect tables.

---

## Task L7 — Challenge attempt UI: manual, auto and debug paths

**Goal:** Implement the first challenge attempt surface after a manifested trial or combat encounter.

**Scope:**
- Read current challenge attempt from exploration state/read service.
- Show challenge kind, status, tested stat/trial/encounter/minigame labels where available.
- Implement auto-resolve through `auto_resolve_hero_exploration_challenge_attempt(...)`.
- Implement manual completion only through the accepted DB completion workflow:
  - `complete_hero_exploration_challenge_attempt(...)`,
  - or a domain service that wraps it.
- If reusing current combat/Walking Dead prototype, keep it as a controlled bridge and document any placeholder assumptions.
- Add admin/debug forced completion through `force_complete_hero_exploration_challenge_attempt(...)` only for allowed sandbox/admin contexts.
- Handle already completed/auto-resolved attempts idempotently.

**Acceptance criteria:**
- Challenge attempt statuses are readable and actionable.
- Auto-resolve calls DB and displays chance/result/reward outcome.
- Manual/debug completion does not direct-write challenge rows.
- Reward is not granted twice on refresh/retry.
- Build and targeted tests/smoke pass.

---

## Task L8 — Reward display and generated item persistence confirmation

**Goal:** Display rewards from completed challenges and confirm generated item persistence in player-facing UI.

**Scope:**
- Read reward grant and reward grant entries from DB-backed read models.
- Display:
  - EXP,
  - Character Points / Hero Points according to current UI naming,
  - resources,
  - generated items,
  - skipped/unsupported reward entries where runtime records them.
- Generated reward items are real `items` rows; display item id/name/value/quality/base/affixes through existing item read models where possible.
- Handle the case where item generation reward count is zero.
- Ensure reward display survives refresh and does not re-trigger reward generation.
- Do not implement vendor scrap/sell here; that belongs to the separate vendor economy workflow.

**Acceptance criteria:**
- Completed successful challenge shows reward results from DB state.
- Generated item rewards link into existing inventory/armory visibility where possible.
- Failed/no-reward attempts show a clear no-reward state.
- Reward display does not create duplicate rewards.
- No direct writes to reward/item tables from Angular.

---

## Task L9 — Admin exploration debug page

**Goal:** Add a server-scoped sandbox/admin page for inspecting and controlling exploration test state.

**Scope:**
- Add admin/debug surface for selected server and selected/test hero.
- Use DB-owned helper RPCs:
  - `get_hero_exploration_debug_state(...)`,
  - `add_hero_remaining_actions(...)`,
  - `reset_hero_exploration(...)`,
  - `skip_hero_exploration_step_timer(...)`,
  - `test_grant_reward_profile_to_hero(...)`,
  - `set_next_hero_exploration_outcome_override(...)`,
  - `force_complete_hero_exploration_challenge_attempt(...)`.
- Require/show reason fields where RPCs require reasons.
- Display selected server/hero clearly to avoid operating on the wrong target.
- Explain each debug tool in human terms, not only technical function names.
- Do not expose debug/test tools to normal players.

**Acceptance criteria:**
- Admin/tester can inspect exploration runtime/debug state for an allowed server/hero.
- Debug actions use RPCs and show success/error states clearly.
- Forced next outcome and forced challenge completion are visible as testing tools.
- The page is permission-aware and does not rely on frontend-only security.
- Smoke report includes both UI path and gameplay/admin meaning.

---

## Task L10 — Exploration lab / preview / simulation UI

**Goal:** Expose the L-DB4c preview/simulation RPCs as a non-mutating balancing and explainability lab.

**Scope:**
- Add an admin/lab UI that calls:
  - `preview_trial_opportunity_curve(...)`,
  - `preview_trial_manifestation_chance(...)`,
  - `preview_challenge_auto_resolve_success_chance(...)`,
  - `preview_reward_generated_item(...)`,
  - `preview_reward_profile(...)`,
  - `simulate_trial_opportunity_runs(...)`.
- Present outputs as readable tables/charts where practical:
  - trial opportunity dry-step curve,
  - manifestation chance by difficulty/stat inputs,
  - auto-resolve chance,
  - generated item preview,
  - reward profile preview,
  - simulation distribution for trial opportunity runs.
- Make clear that preview/simulation RPCs do not mutate runtime state and may still use fallback formulas until final formula evaluator/luck-aware integration is wired.
- Provide input controls for difficulty, district, stat values, Luck, Spirituality, preview count/run count and max steps where supported.
- Avoid hardcoding active trial/difficulty/reward labels when DB can provide them.

**Acceptance criteria:**
- Admin/lab user can run all six preview/simulation tools.
- UI clearly distinguishes preview/simulation from real gameplay resolution.
- Outputs have human-readable labels and explanations.
- Preview errors/RPC denials are shown without crashing.
- Build passes and smoke report explains what each lab action means.

---

## Epic L known follow-ups / caveats

These are not blockers for L1-L10 unless the user promotes them into acceptance criteria:

- Several PvE runtime helpers still use fallback calculations; formula targets exist, but DB-side formula evaluator integration is not fully wired into all runtime helpers.
- `get_hero_exploration_luck_value(...)` currently has fallback behavior until canonical DB-side derived Luck resolution is fully available.
- Item generation persistence works, but final Luck-aware item-generation runtime is still future work.
- Reports/snapshots are not implemented yet; exploration graph/step/challenge rows are runtime/debug state, not public report snapshots.
- Vendor scrap/sell for drachmas is not part of Epic L reward display; it remains a separate economy workflow.

# Epic M — Combat

Epic M is an implementation epic over the current combat DB foundation. It must preserve the existing Walking Dead timing gameplay while extracting reusable combat core.

Current DB foundation includes:
- `combat_initiative_score` formula target;
- `combat_opponent_scaled_stat` formula target;
- random formula blocks `random()` and `random(min, max)` in `balance_formula_blocks`;
- `combat_turn_limit` config + `get_combat_turn_limit()`;
- opponent definitions/families/stat values/natural attack sources/equipment entries;
- encounter/trial combat candidates;
- relational combat result snapshot tables.

Epic rules:
- Do not redesign combat from scratch.
- Preserve Walking Dead behavior: green zone, streak narrowing, speed-up, miss reset, evaded-hit streak continuation.
- Resolution order remains: timing hit → evasion → crit → damage.
- Remove hardcoded crit multiplier x2; use base 50% + `critical_damage` bonuses.
- Do not reintroduce `hero_derived` as runtime source of truth.
- Use DB dictionaries/formulas/configs; do not hardcode permanent gameplay lists.

## Task M0 — DB/types alignment for combat foundation

**Goal:** Confirm generated types expose the current combat DB foundation before implementation.

**Scope:**
- Run `git status --short` first.
- Inspect generated DB types for combat enums, tables, formula targets/read paths and RPC/config helper exposure where relevant.
- Confirm expected tables include combat opponents, candidates, results, participants, participant stats, attacks and equipment slot dictionary.
- Confirm random formula block rows are visible through formula block read layer.
- Do not regenerate types unless explicitly asked.

**Acceptance criteria:**
- Expected combat DB objects are visible in generated types.
- Missing objects are reported as DB/types blocker.
- No gameplay code changes are made in this alignment task unless required for compile.

---

## Task M1 — Random formula runtime/editor support

**Goal:** Implement runtime/admin support for formula random functions seeded in DB.

**Scope:**
- Add evaluator support for `random()` and `random(min, max)`.
- No `randomInt`; integer-like results can use `floor`, `ceil`, `round`.
- Detect formulas using random and mark preview as nondeterministic.
- Add reroll/refresh behavior in formula preview/admin calculator where applicable.
- Keep DB block library as display/source for tokens.

**Acceptance criteria:**
- `random()` and `random(min,max)` evaluate correctly.
- Admin preview does not pretend random formulas are stable.
- Existing deterministic formulas still pass tests.

---

## Task M2 — Combat domain contracts

**Goal:** Add reusable combat domain/result contracts outside the sandbox page.

**Scope:**
- Define typed models for:
  - combatant input/snapshot,
  - attack source,
  - attack plan,
  - attack slot,
  - turn order,
  - combat result,
  - combat result attack event.
- Keep components thin; shared domain contracts belong under `core/domain` / `core/types` / `core/services` according to project structure.
- Include initiator/defender sides, not hardcoded hero/opponent naming.

**Acceptance criteria:**
- Combat contracts can represent PvE, trial, sandbox and future PvP.
- Contracts do not expose full private equipment as public report data.
- Build/type tests pass.

---

## Task M3 — Hero combatant resolver and critical damage debt

**Goal:** Resolve hero combat values from current stats/equipment/bonuses and remove hardcoded crit x2.

**Scope:**
- Resolve Health, defense, damage range, Luck, critical chance, critical damage and evasion from current runtime sources.
- Use `critical_damage` as base 50% plus active bonuses.
- Keep Character Points and Health terminology separate.
- Do not read `hero_derived` as source of truth.

**Acceptance criteria:**
- Hardcoded crit multiplier x2 is removed from final resolver path.
- `critical_damage` affects crit multiplier as `1 + finalCriticalDamagePercent / 100`.
- Existing combat formula inputs still work.
- Build and focused tests pass.

---

## Task M4 — Opponent definition read models

**Goal:** Add frontend/domain read layer for admin-defined opponents.

**Scope:**
- Map/read:
  - opponent families,
  - opponent definitions,
  - opponent stat values,
  - natural attack sources,
  - opponent equipment entries,
  - equipment mode definitions,
  - encounter/trial combat candidates.
- Preserve labels/descriptions/helper/admin text.
- Do not implement admin write UI yet unless separately assigned.

**Acceptance criteria:**
- Opponent/candidate data can be loaded and displayed from DB.
- Family candidates and concrete opponent candidates are both represented.
- Build and mapper tests pass.

---

## Task M5 — Opponent combatant resolver

**Goal:** Resolve a concrete opponent combatant from definition/candidate/scaling/equipment/natural attack sources.

**Scope:**
- Select eligible candidate by opponent or family according to active candidates and level bounds.
- Apply scaling formula order:
  1. candidate `scaling_formula_id`,
  2. opponent default formula,
  3. default `combat_opponent_scaled_stat` assignment.
- Resolve natural attack sources such as Bite/Scratch/Iron Wings.
- Resolve manual/generated item-like equipment without creating `items` rows.
- Generated opponent equipment is materialized only for one fight input/snapshot.

**Acceptance criteria:**
- Opponent combatant can be built without hardcoded demo enemy.
- Generated equipment does not create player-owned items.
- Missing candidate/opponent data produces readable errors.

---

## Task M6 — Attack plan builder

**Goal:** Build attack plans for heroes and opponents from current combatant state.

**Scope:**
- Hero rules:
  - unarmed = one unarmed attack;
  - one-handed + empty off-hand = weapon + unarmed;
  - weapon + shield = one weapon attack;
  - dual wield = one attack from each weapon;
  - two-handed = one attack unless native data says otherwise;
  - ranged = two-handed and may have native attack count > 1.
- Opponent rules:
  - use natural attack sources where configured;
  - use item-like equipment attack sources where configured/generated.
- Attack source labels must be report-safe.

**Acceptance criteria:**
- Attack plan matches current decisions.
- Shields do not attack.
- Attack count comes from weapon/item/native source data, not raw stat points.
- Tests cover unarmed, weapon+empty, shield, dual wield, two-handed, ranged and natural attacks.

---

## Task M7 — Initiative and turn order

**Goal:** Order attack slots using `combat_initiative_score`.

**Scope:**
- Generate attack slots for both sides.
- Evaluate formula variables:
  - `combatantIntelligence`,
  - `combatantAgility`,
  - `attackIndex`,
  - `attackCount`.
- Sort by descending score.
- Initiator wins exact ties.
- Support random formula outputs through M1 runtime behavior.

**Acceptance criteria:**
- Turn order can interleave attacks from both sides.
- Same-side multi-attacks are represented as slots.
- Tie behavior is deterministic except where formula randomness is explicit.

---

## Task M8 — Reusable combat resolver preserving Walking Dead gameplay

**Goal:** Extract current sandbox combat logic into reusable combat core.

**Scope:**
- Preserve current Walking Dead minigame behavior:
  - green-zone width formula path,
  - streak narrowing,
  - speed increase,
  - miss reset,
  - evaded-hit streak continuation.
- Enforce sequence: timing hit → evasion → crit → damage.
- Resolve automatic/opponent attacks without real-time enemy input.
- Use global turn limit from `get_combat_turn_limit()` / config read path, not per-result hardcode.
- Return a combat result object; do not grant rewards.

**Acceptance criteria:**
- Existing `/game/combat` behavior is preserved gameplay-wise.
- Resolver is not page-local sandbox state.
- Draw occurs when neither side is defeated before turn limit.
- No reward/trial/PvP side effects happen inside core resolver.

---

## Task M9 — Persist combat result snapshot

**Goal:** Persist completed combat results into relational snapshot tables when caller requests history/report support.

**Scope:**
- Insert `combat_results` header.
- Insert participant snapshots and participant stats.
- Insert one row per resolved attack.
- Store attack source label and safe source refs.
- Do not reveal full private equipment.
- Do not use `source_item_id` as FK expectation; item lifecycle must not break reports.

**Acceptance criteria:**
- Persisted combat can render attack order/source/hit/evasion/crit/damage/Health changes later.
- Full equipment is not stored as public report data.
- Result persistence is optional/caller-controlled where appropriate.

---

## Task M10 — Thin sandbox caller

**Goal:** Rewire `/game/combat` to use reusable combat core while remaining a sandbox/test page.

**Scope:**
- Keep sandbox UI thin.
- Use active hero and selected server correctly.
- Replace demo enemy with DB-backed opponent where available, or clearly label fallback/sandbox test opponent.
- Preserve Walking Dead UI behavior.

**Acceptance criteria:**
- `/game/combat` still works as a playable sandbox.
- Page no longer owns core combat rules.
- Build and route smoke pass.

---

## Task M11 — Combat admin/balance tooling foundation

**Goal:** Add first admin/balance surfaces needed to inspect combat setup.

**Scope:**
- Show initiative formula preview inputs and example slot order.
- Show opponent definitions/candidates read-only where practical.
- Show random formula reroll behavior where relevant.
- Keep write/admin CRUD for opponents as future task unless explicitly assigned.

**Acceptance criteria:**
- Admin/balancer can inspect combat formulas and basic candidate/opponent setup.
- Random preview is marked nondeterministic.
- No hardcoded permanent combat dictionaries where DB dictionaries exist.

---

# Epic N — Stats and progression

Epic N is an implementation/alignment epic over existing progression DB/RPC foundation. It must not recreate old placeholder workflows.

Current DB/RPC foundation:
- final stat allocation uses `save_stat_allocation(...)`;
- `hero_stat_upgrade_cost` formula target exists;
- `hero_stat_level_cap` formula target exists;
- `hero_experience_to_next_level` formula target exists;
- `critical_damage` is a derived/combat stat and active bonus target;
- `hero_derived` remains legacy/transitional and must not become runtime source of truth again.

## Task N1 — Progression DB/types alignment

**Goal:** Confirm generated types and services expose current progression foundation.

**Scope:**
- Inspect generated types for `save_stat_allocation(...)`, hero CP fields, `character_point_ledger`, formula targets and derived stat definitions.
- Confirm `critical_damage` is visible as derived/combat stat where read models need it.
- Do not regenerate types unless explicitly asked.

**Acceptance criteria:**
- Missing progression DB objects are reported as DB/types blocker.
- No code assumes old HP-as-points or `hero_derived` runtime source.

---

## Task N2 — Health / Character Points terminology cleanup

**Goal:** Prevent Health and Character Points from being confused in UI/domain models.

**Scope:**
- Health = hit points.
- Character Points = progression/trade currency.
- Replace old Hero Points/PR wording where relevant unless still intentionally transitional copy.

**Acceptance criteria:**
- User-facing labels reduce Health/CP ambiguity.
- Domain names distinguish Health and Character Points.

---

## Task N3 — Stat allocation frontend alignment with existing RPC

**Goal:** Ensure stat allocation UI uses the canonical existing DB workflow.

**Scope:**
- Use `save_stat_allocation(...)` for final save.
- Keep plus/minus changes local and unaudited.
- Do not direct-write `hero_stats`, `hero.character_points`, `character_point_ledger` or audit tables.
- Map RPC result into explicit domain model.

**Acceptance criteria:**
- Final stat save is RPC/domain-owned.
- No direct table mutation for stat allocation remains.
- RPC errors are user-readable.

---

## Task N4 — Stat upgrade cost formula usage audit/fix

**Goal:** Ensure stat upgrade cost UI/runtime uses `hero_stat_upgrade_cost`.

**Scope:**
- Use formula assignment resolver/runtime.
- Variables include `heroLevel`, `level`, `statLevel` according to target definition.
- Remove hardcoded cost fallbacks except explicit guarded fallback/error states.

**Acceptance criteria:**
- Stat upgrade cost is formula-driven.
- Admin formula changes can affect preview/runtime where intended.

---

## Task N5 — Stat cap formula usage audit/fix

**Goal:** Ensure stat cap UI/runtime uses `hero_stat_level_cap`.

**Scope:**
- Use formula assignment resolver/runtime with `heroLevel`.
- Remove hardcoded cap assumptions where current DB formula is available.
- Show clear blocked/at-cap state.

**Acceptance criteria:**
- Stat cap is formula-driven.
- UI explains why a stat cannot be upgraded.

---

## Task N6 — XP-to-next-level formula and level-up preflight

**Goal:** Align level/experience display with `hero_experience_to_next_level` and inspect persistent level-up needs.

**Scope:**
- Use `hero_experience_to_next_level` for XP threshold display/preview where applicable.
- Inspect current level/experience mutation paths.
- Do not implement direct Angular level-up writes.
- Report missing DB/RPC workflow for applying experience/level-up if needed.

**Acceptance criteria:**
- XP-to-next-level is formula-driven in read/preview paths.
- Any persistent XP/level mutation blocker is explicit.

---

## Task N7 — Critical damage runtime alignment

**Goal:** Ensure `critical_damage` is consumed as a derived/combat stat.

**Scope:**
- Use base 50% + active `critical_damage` bonuses.
- Feed final value into combat resolver/preview where applicable.
- Do not treat `critical_damage` as standalone formula target.

**Acceptance criteria:**
- Final crit multiplier uses `1 + finalCriticalDamagePercent / 100`.
- Hardcoded x2 does not remain in final path.

---

## Task N8 — Runtime derived stat resolver cleanup

**Goal:** Keep runtime derived/special stats on current DB-backed resolver path.

**Scope:**
- Resolve derived stats from base stats, derived stat definitions, bonuses and formulas where applicable.
- Avoid `hero_derived` as source of truth.
- Identify any remaining transitional reads and report DB cleanup candidates when removed.

**Acceptance criteria:**
- New runtime work does not depend on `hero_derived`.
- Any legacy dependency removal is reported as `DB cleanup candidate`.

---

## Task N9 — Character Point display and ledger consistency

**Goal:** Keep Character Point display consistent with current DB state.

**Scope:**
- Spendable balance from `hero.character_points`.
- Lifetime total from `hero.total_character_points_earned` where relevant.
- History from `character_point_ledger` where displayed.
- Do not store CP in `hero_resources`.

**Acceptance criteria:**
- CP balances and history are consistent.
- No CP/Health/resource confusion in UI.

---

# Epic O — Estates, districts and buildings

Epic O is an implementation epic over the estate/building DB foundation. Empty addresses are generated from capacity; only occupied estates exist as rows.

Current DB foundation:
- `estate_district_address_capacities` with capacities A=5000, B=3000, C=500, D=50, E=1;
- `estates.address_number` exists and, together with `district_code`, is the source of truth;
- `estates.address` remains legacy/display compatibility until frontend no longer depends on it;
- `format_estate_address(...)`, `parse_estate_address_number(...)` and `normalize_estate_address_fields()` exist;
- `hero_resource_ledger` and `apply_hero_resource_delta_with_ledger(...)` exist as internal resource spending/gain foundation;
- `estate_building_jobs` and `finalize_completed_estate_building_jobs(...)` exist;
- one active building job per estate is enforced;
- player-facing build cancellation is not part of MVP.

Known pending DB/RPC foundation before full runtime O implementation:
- relocation/claim RPC for moving to an empty address;
- start building upgrade RPC that spends resources, creates a job and uses building cost/time formulas.

## Task O1 — Estate DB/types alignment

**Goal:** Confirm generated types expose current estate/address/building job foundation.

**Scope:**
- Inspect generated types for:
  - `estate_district_address_capacities`,
  - `estates.address_number`,
  - `hero_resource_ledger`,
  - `estate_building_jobs`,
  - `format_estate_address`,
  - `finalize_completed_estate_building_jobs` where available.
- Confirm `estates.address` is treated as legacy/display compatibility.
- Do not regenerate types unless explicitly asked.

**Acceptance criteria:**
- Missing DB objects are reported as DB/types blocker.
- No code treats `estates.address` as source of truth for new work.

---

## Task O2 — Estate address availability read layer and UI

**Goal:** Display possible vs occupied addresses from capacity plus occupied estate rows.

**Scope:**
- Load active district capacities.
- Generate address ranges in frontend/read model from `district_code + address_number` range.
- Overlay occupied `estates` rows for selected server.
- Display formatted labels using DB-compatible formatting rules.
- Do not create rows for empty estates.

**Acceptance criteria:**
- UI can show available/occupied addresses with pagination.
- Address generation uses capacity rows, not hardcoded ranges.
- Occupancy is server-scoped.
- No empty estate rows are inserted.

---

## Task O3 — Empty-address relocation RPC integration

**Goal:** Implement player relocation to a vacant address only through approved DB/RPC workflow.

**Current DB note:** If no public relocation RPC exists in generated types, stop and report DB/RPC blocker. Do not implement direct delete/insert from Angular.

**Scope once RPC exists:**
- Select empty address.
- Show strong confirmation modal: current estate buildings are irreversibly lost.
- Call relocation RPC with active hero/server/address data and confirmation flag.
- Refresh estate/building state after success.

**Acceptance criteria:**
- Frontend does not delete/insert `estates` directly.
- Relocation to empty address is destructive and clearly confirmed.
- Old estate/building state is not recoverable through UI.
- RPC errors are shown clearly.

---

## Task O4 — Building jobs read/timer UI

**Goal:** Show active building job state for the current estate.

**Scope:**
- Load active/past relevant `estate_building_jobs` where needed.
- Show active job building, target level and time remaining from `completes_at`.
- Do not expose player-facing cancel in MVP.
- Before relying on building state, use approved read/RPC path that finalizes completed jobs.

**Acceptance criteria:**
- Player can see when current build completes.
- UI does not allow starting a second active build.
- Completed jobs stop blocking future builds after finalization path runs.

---

## Task O5 — Building definitions and progression read layer

**Goal:** Use DB building definitions, formulas, requirements and district caps for building UI.

**Scope:**
- Read buildings and current estate building levels.
- Use formula assignments for cost/time/bonus preview.
- Use central requirements and district cap semantics.
- Use `get_building_progression_preview(...)` where appropriate.
- Keep `building_requirements` / `buildings.requirements` as legacy/transitional only.

**Acceptance criteria:**
- Building UI uses DB definitions/formulas.
- `0 = unlimited` max level behavior is explained.
- Requirements come from central requirement system where available.

---

## Task O6 — Start building upgrade RPC integration

**Goal:** Start a building build/upgrade through a canonical DB/RPC workflow.

**Current DB note:** If no public start-upgrade RPC exists in generated types, stop and report DB/RPC blocker. Do not compose resource updates and job inserts in Angular.

**Scope once RPC exists:**
- Finalize completed jobs first through the approved DB path.
- Validate one active job per estate.
- Show cost/time preview before submit.
- Call start-upgrade RPC.
- Display created job and refreshed resource balances.

**Acceptance criteria:**
- No direct writes to `hero_resources`, `hero_resource_ledger`, `estate_buildings` or `estate_building_jobs` from Angular.
- Resource spending is DB/RPC-owned.
- Build time is stored as `completes_at` in the job.
- Build and focused tests pass.

---

## Task O7 — Building bonus/runtime integration preflight

**Goal:** Ensure gameplay systems read effective building state after lazy finalization.

**Scope:**
- Identify current building bonus/runtime resolver paths.
- Ensure they can call/use a DB path that finalizes completed jobs before reading effective levels.
- Focus especially on future PvP defense/combat bonuses such as Fortress/Barracks style effects.
- Do not implement siege here.

**Acceptance criteria:**
- No gameplay system uses stale building levels when a completed job should already apply.
- Missing DB/RPC read path is reported as blocker.

---

## Task O8 — Estate address legacy cleanup report

**Goal:** After frontend no longer treats `estates.address` as source of truth, report DB cleanup readiness.

**Scope:**
- Search app code for `estates.address` semantic usage.
- Ensure display formatting can use `district_code + address_number`.
- If no source-of-truth usage remains, report `DB cleanup candidate: estates.address`.
- Do not drop the column in this task.

**Acceptance criteria:**
- Legacy address usage status is explicit.
- Any remaining dependency is listed with file paths.
- Cleanup is not performed without approved DB migration.

---

# Epic P — Reports and snapshots

## Task P1 — Report/snapshot schema inspection

**Goal:** Determine current report support.

**Scope:**
- Inspect report tables/code if present.
- Compare with desired:
  - trial,
  - encounter,
  - pvp_combat,
  - siege.
- Report gaps.

**Acceptance criteria:**
- Clear plan for reports/snapshots.

---

## Task P2 — Public report route skeleton

**Goal:** Prepare shareable report viewing.

**Scope:**
- Public route by identifier.
- Load snapshot data.
- Do not expose private account data.

**Acceptance criteria:**
- Skeleton route/view exists or plan is ready.

---

## Task P3 — Trial/combat report snapshot model

**Goal:** Store historical event snapshot, not live recalculation.

**Scope:**
- Snapshot includes historical tooltips/values needed to reproduce view.
- Player names may link to public profiles.

**Acceptance criteria:**
- Reports are distinct from audit logs.

---

# Epic Q — Notifications

## Task Q1 — Notification module design stub

**Goal:** Prepare future notification system.

**Scope:**
- Document future notification events:
  - declaration status changes,
  - report status changes,
  - case status/verdict involving player,
  - sanction status,
  - item confiscation/return,
  - CP fine/debt changes.

**Acceptance criteria:**
- Notification boundaries are clear.
- No fake full notification system is built.

---

## Task Q2 — Notification event hooks in domain operations

**Goal:** Prepare domain operations to emit notifications later.

**Scope:**
- Ensure operations return/store:
  - affected user/hero,
  - reason/status reason,
  - related case/declaration/report/sanction id.

**Acceptance criteria:**
- Future notifications can be generated without reworking all operations.

---

# Epic R — Admin/navigation UX

## Task R1 — Admin panel structure review

**Goal:** Organize admin tools by global vs server-specific.

**Scope:**
- Global admin:
  - config definitions,
  - global roles,
  - global dictionaries,
  - product/global balance.
- Server admin:
  - selected server,
  - anti-abuse cases,
  - declarations/reports,
  - server configs,
  - memberships/staff.

**Acceptance criteria:**
- Navigation plan avoids mixing global and server-specific screens.

---

## Task R2 — Staff landing/dashboard

**Goal:** Give staff useful starting point.

**Scope:**
- Selected server summary.
- Open anti-abuse cases.
- Waiting-for-player cases.
- Pending declarations/reports.
- Pending sanctions.

**Acceptance criteria:**
- Staff can quickly find work.

---

# Special Epic UX — Explainability and impact previews

UX tasks in this epic should produce visible UI improvements or shared implementation helpers. Do not run another audit-only UX task unless a concrete implementation is blocked by unknown screens or missing DB metadata.

Current DB-backed contracts for this epic:
- `get_ui_metadata_entries(...)` for labels/descriptions/helper text of technical keys and enum-like values.
- `get_config_definition_ui_metadata(...)` for per-config-definition helper/impact/warning/preview metadata.
- `get_config_definition_explainability(...)` for config governance explainability screens.
- `get_admin_preview_contracts()` for canonical preview kind to RPC routing.
- `get_item_quality_impact_preview(...)`, `get_building_progression_preview(...)`, `get_bonus_impact_preview(...)`, `get_requirement_impact_preview(...)` for preview input data.

Codex must use these DB contracts where relevant instead of creating permanent Angular-side dictionaries for configurable gameplay/config metadata.

## Task UX-I1 — Shared metadata display helpers

**Goal:** Add reusable UI/helpers for showing human-readable label, description/helper text, and technical key as secondary metadata.

**Scope:**
- Create shared display helper/component pattern usable in admin/config/audit/bonus/formula screens.
- Label is primary.
- Description/helper text is visible where available.
- Technical key is secondary/collapsible/metadata.
- Raw JSON remains in technical detail blocks.

**Acceptance criteria:**
- At least one existing admin screen uses the helper.
- No raw technical key is the only visible primary label where DB metadata exists.
- Build passes.

---

## Task UX-I2 — Config governance explainability implementation

**Goal:** Make config governance screens understandable to operators before they create/apply changes.

**Scope:**
- On config definitions/change-entry forms, show what scope means: product global, global balance, server launch, live server, test override.
- Show whether a value change will be global or selected-server scoped.
- Show active server context for server-scoped entries.
- Replace stale success/error text with toast/message behavior where still missing.
- Use `ui-ux-notes.md` config governance notes as source.
- Use `get_config_definition_explainability(...)` as the canonical DB read model for scope/value/applicability explanations.

**Acceptance criteria:**
- User can tell where a config change will apply before submitting.
- Server-scoped entries show selected server.
- Global/server target is readonly/explained, not a fake choice.
- No raw governance scope key as the only explanation.
- Config scope/value/applicability text comes from DB metadata/read models where available.

---

## Task UX-I3 — Audit log readability pass

**Goal:** Replace raw audit keys as primary text in audit views with dictionary labels and helpful metadata.

**Scope:**
- Use joined `audit_action_types` and `audit_entity_types` labels/descriptions where available.
- Keep keys visible as secondary technical metadata.
- Make old/new/metadata JSON easier to scan with collapsible or constrained blocks.

**Acceptance criteria:**
- Audit log cards primarily show labels, not only keys.
- Missing dictionary joins fall back gracefully to stable keys.
- Large JSON does not dominate the page by default.

---

## Task UX-I4 — Formula impact preview calculators

**Goal:** Add practical formula calculators for admin formula/balance work.

**Scope:**
- Let admin enter example inputs for selected formula targets.
- Show output and errors clearly.
- Prioritize building upgrade cost/time/bonus and hero stat cost/cap formulas.
- Reuse existing formula runtime where possible.

**Acceptance criteria:**
- Admin can test formula output without editing DB values.
- Invalid formula/input errors are readable.
- Build passes.

---

## Task UX-I5 — Item generation quality impact preview

**Goal:** Show how item quality affects generated item values and bonuses.

**Scope:**
- For selected base/affix/template, show Normal/Quality/Outstanding or current DB-defined quality rows.
- Use `get_item_quality_impact_preview(...)` / `item_generation_qualities`, not hardcoded exactly three qualities.
- Show raw value and quality-scaled value where `quality_scales_value` applies.

**Acceptance criteria:**
- Admin can see quality impact before saving item-generation changes.
- Quality never scales level interval.
- UI uses active quality dictionary rows.

---

## Task UX-I6 — Building impact calculator

**Goal:** Show predicted building cost/time/bonus output across levels and selected district context.

**Scope:**
- Add level range preview for cost/time/bonus formulas.
- Use `get_building_progression_preview(...)` for district cap / unlimited behavior.
- Keep existing single-level preview but make multi-level impact easier to understand.

**Acceptance criteria:**
- Admin can inspect level N -> N+1 and nearby progression values.
- `0 = unlimited` is clearly explained where relevant.
- Formula errors are visible.

---

## Task UX-I7 — Bonus and requirement impact preview

**Goal:** Explain resolved bonus/requirement effects in human-readable terms.

**Scope:**
- Use `get_bonus_impact_preview(...)` to show resolved effect of bonus templates, entity bonuses, quality scaling, per-level intervals and source-stat scaling.
- Use `get_requirement_impact_preview(...)` to show requirement labels/descriptions from central requirements.
- Keep technical keys secondary.

**Acceptance criteria:**
- Admin can understand what a bonus/requirement does without reading raw JSON.
- Preview uses canonical dictionaries and entity bonuses.
- Build passes.

---

## Task UX-I8 — Anti-abuse decision explainability pass

**Goal:** Make future anti-abuse case/sanction/declaration/report UI understandable for staff and players.

**Scope:**
- Use dictionary labels/descriptions for report/declaration/sanction/action types.
- Explain sanction item links as evidence/context, not item confiscation.
- Show reason/status reason prominently.
- Do not expose staff-only technical history to scoped moderators or players.

**Acceptance criteria:**
- Anti-abuse UI uses labels/helper text from DB dictionaries.
- Player-facing status views do not leak staff-only metadata.
- Staff decision UI always requires reason.

---

## Task UX-I9 — Smoke test UX notes integration

**Goal:** Make Codex verification reports include business meaning, not only click paths.

**Scope:**
- Update workflow docs/templates so smoke tests say what the action means in gameplay/admin terms.
- Add non-blocking findings to `docs/ui-ux-notes.md`.

**Acceptance criteria:**
- Future Codex reports include UI path and domain meaning.
- UX notes are grouped as quick win / DB metadata needed / redesign-needed.


# Epic S — Responsibility and Angular 21 cleanup

## Task S1 — Responsibility audit

**Goal:** Find scattered domain responsibilities.

**Scope:**
- hero,
- progression/stat allocation,
- resources,
- estate/buildings,
- combat,
- admin/config,
- anti-abuse.

**Acceptance criteria:**
- Report lists misplaced responsibilities.

---

## Task S2 — Hero/progression/stat cleanup

**Goal:** Fix the known scattered area first.

**Scope:**
- Hero domain handles hero identity/bootstrap.
- Progression/stat domain handles stat allocation/progression.
- Resource domain handles resources.
- Preserve behavior.

**Acceptance criteria:**
- Existing stat allocation still works.
- Responsibilities are clearer.

---

## Task S3 — Angular 21 naming cleanup when touched

**Goal:** Avoid outdated naming noise.

**Scope:**
- Do not add unnecessary `XxxService` suffix if project style avoids it.
- Avoid redundant facade naming.
- Do not mass rename unrelated files.

**Acceptance criteria:**
- Touched code follows current project style.

---

# Epic T — Appeals and future moderation extensions

## Task T1 — Appeals parked design note

**Goal:** Keep appeal concept available without implementing yet.

**Scope:**
- Document that sanctions can later have formal appeals.
- Current statuses `cancelled` and `forgiven` support manual changes meanwhile.

**Acceptance criteria:**
- No appeal system is built prematurely.

---

## Task T2 — Future relationship/report types as configurable dictionaries

**Goal:** Ensure future types like mercenary/equipment rental remain configurable.

**Scope:**
- Do not hardcode future declaration/report types.
- Admin UI should load active DB rows.

**Acceptance criteria:**
- New types can be added later through dictionaries/config without frontend enum edits.

---

# Recommended near-term execution notes

This backlog is a working task queue, not a strict global order. Use the current user instruction, current DB schema/generated types, and the relevant epic section before choosing the next Codex task.

Current operational rules:
- Do not attempt the whole backlog in one run.
- Use one task or a small tightly related group per prompt.
- Run `git status --short` before starting a new task.
- If schema-sensitive generated types are stale, report/regenerate only when the user asks.
- After each completed task, wait for user test/confirmation before updating completed-state docs.
- If an old section conflicts with current `database-current.md` / `current-decisions.md`, prefer the newer DB/docs and report the mismatch.

Recent high-priority workstreams:
- J6/J7: trade/auction audit and vendor scrap/sell are DB/RPC-owned; frontend must use canonical RPCs.
- K: anti-abuse signal generation is DB/backend-owned; frontend must not insert signals/cases directly.
- L: PvE exploration/trial implementation is over existing L-DB foundation.
- M: combat implementation is over current reusable combat DB foundation.
- N: stats/progression implementation is over current stat allocation/formula/derived-stat DB foundation.
- O: estate/building runtime still has pending DB/RPC blockers for relocation and start-building workflows; do not implement Angular direct writes.

# Epic U — Requirements and building district caps

## Task U1 — Requirements read models

**Goal:** Add typed frontend/domain models for the central requirements foundation.

**Scope:**
- Add models/mappers/loaders for:
  - `requirement_definitions`,
  - `entity_requirements`.
- Include labels, descriptions, helper text, value type and active/sort fields.
- Treat old `building_requirements` and `buildings.requirements` as legacy/transitional.

**Acceptance criteria:**
- Requirements can be listed and attached requirements can be read by entity.
- New code does not add fresh JSON requirement fields.

---

## Task U2 — Building district cap read model

**Goal:** Make building district max-level overrides available to admin/building logic.

**Scope:**
- Add models/mappers/loaders for `building_district_level_caps`.
- Resolve effective max level:
  1. district override if present,
  2. otherwise `buildings.max_level`,
  3. `0` means unlimited.
- Do not assume every building/district pair has a row.

**Acceptance criteria:**
- Building admin/preview can show global cap and district-specific overrides.
- Effective max level calculation matches database semantics.

---

## Task U3 — Building availability and requirement migration cleanup

**Goal:** Align building UI/runtime with the new requirements and district rules.

**Scope:**
- Treat `buildings.district_code` as the minimum district where the building can be built.
- A building is available in that district and every higher district.
- Use central `entity_requirements` for prestige/level/stat/building/resource gates.
- Do not rely on `rank_required` as the primary availability rule.
- Keep old fields only for transitional compatibility.

**Acceptance criteria:**
- Building availability is district-based.
- Prestige/rank gates come from requirements.
- No new dependency is introduced on legacy `buildings.requirements` JSON.

---

## Task U4 — Building admin UI for requirements and caps

**Goal:** Expose requirements and district caps as building balance configuration.

**Scope:**
- In building admin/config UI, show and edit:
  - global/default `buildings.max_level`,
  - district cap overrides,
  - attached `entity_requirements`.
- Preserve reason/change-set requirements through config governance where applicable.
- Missing district override should be displayed as “uses global/default”.

**Acceptance criteria:**
- Admin can manage building requirements and district cap overrides without hardcoding.
- UI clearly explains `0 = unlimited`.

---

## Recommended order update

Place U1-U4 after config definitions/value read models and before deeper building execution, because building runtime/admin logic now depends on central requirements and district cap semantics.

---

# Epic V — Item generation and equipment foundation integration

## Task V1 — Regenerate database types after item generation/equipment migration

**Goal:** Synchronize frontend generated Supabase types with the newly migrated item generation and equipment schema.

**Scope:**
- Regenerate/update `src/app/core/types/database.types.ts`.
- Confirm generated types include:
  - `item_generation_base_types`,
  - `item_generation_base_type_targets`,
  - `item_generation_bases.base_type_key`,
  - generated item columns on `items`,
  - `hero_equipment`,
  - `hero_armory_shelves`,
  - newly available combat targets such as `attack_count` and `critical_damage` where applicable.

**Acceptance criteria:**
- App compiles.
- No domain model is replaced by raw DB rows.
- No existing backlog task status is changed unless user confirms it.

---

## Task V2 — Update item generation domain models and mappers

**Goal:** Teach frontend item-generation code the new base type model.

**Scope:**
- Add typed models/mappers for `item_generation_base_types` and `item_generation_base_type_targets`.
- Update `item_generation_bases` domain model to use `baseTypeKey` as source of truth.
- Keep old `slot` as legacy/deprecated only if generated types still expose it.
- Do not hardcode the required target list in Angular.

**Acceptance criteria:**
- Item generation admin/read models expose base type information.
- UI/domain code no longer treats old `slot` as semantic source of truth.
- Required/optional native target information comes from DB dictionaries.

---

## Task V3 — Update base item admin form to use DB-defined native targets

**Goal:** Base item creation/editing should be driven by `item_generation_base_type_targets`.

**Scope:**
- When admin selects a base type, show required and optional native targets from DB.
- Required targets must be present before save.
- Support grouped requirement for ring identity: `charisma OR cunning` through `required_group_key` / `min_required_in_group` semantics.
- Store concrete values through the central bonus model for `entity_type = item_generation_base`.
- Preserve quality scaling semantics for generated item native values.

**Acceptance criteria:**
- Admin cannot save a weapon without min/max damage and attack count.
- Admin cannot save armor pieces without defense.
- Ring requires at least one identity target from the DB-defined group.
- No hardcoded required field list in component code.

---

## Task V4 — Update item generation preview to use new native bonus model

**Goal:** Generated item preview should read base item native values from `entity_bonuses` and base type metadata.

**Scope:**
- Resolve base item native values from `entity_bonuses`.
- Use quality scaling where `quality_scales_value = true`.
- Include `attack_count` and `critical_damage` in preview where present.
- Continue reading qualities from `item_generation_qualities`, not hardcoded quality names/count.

**Acceptance criteria:**
- Preview shows correct base item combat/defense/jewelry values.
- Existing quality scaling remains consistent.
- No reliance on old `item_generation_base_bonuses` as the main model.

---

## Task V5 — Add Armory shelf read/edit UI foundation

**Goal:** Allow player/admin-facing code to display and edit hero-local Armory shelf names.

**Scope:**
- Add typed read/write models for `hero_armory_shelves`.
- Support shelf name max 30 trimmed characters.
- Show item `armory_shelf_position` as the transferred item-owned shelf position.
- Do not model item shelf as FK to `hero_armory_shelves`.

**Acceptance criteria:**
- Hero has default shelf position `0` named `Default`.
- User can rename shelf positions without changing item ownership.
- Item transfer semantics remain position-based, not FK-based.

---

## Task V6 — Add hero equipment read model

**Goal:** Frontend can read current equipment from `hero_equipment`.

**Scope:**
- Add domain model/mapper for `hero_equipment`.
- Join or aggregate item details where needed for display.
- Respect active hero context (`hero.id`, not `auth.uid()`).
- Treat `hero_equipment` as source of equipped state.
- Do not use `items.status = equipped`; such status does not exist.

**Acceptance criteria:**
- Equipped items can be displayed by slot.
- `locked_trade` / `locked_auction` items may still display as equipped.
- Scrapped items cannot appear as equipped if DB lifecycle triggers are functioning.

---

## Task V7 — Prepare equip/unequip DB workflow design, do not implement ad hoc

**Goal:** Before coding equip/unequip gameplay, identify required RPC/domain operations and ask for DB contract if missing.

**Scope:**
- Review current docs for equip/unequip, single equip, bulk equip, saved equipment sets.
- Do not directly implement critical equipment mutations from generic UI table writes.
- Report missing RPC/domain contract as blocker if needed.

**Acceptance criteria:**
- Codex does not invent equip/unequip RPC names.
- Any required DB mutations are proposed for conceptual/database-track approval first.
- No critical equipment workflow bypasses the approved DB/domain contract.

---

## Task V8 — Update Armory visible filtering to use capacity, shelf position and generation time

**Goal:** Align Armory item visibility with the new DB-backed visibility model.

**Scope:**
- Use resolved `visible_item_capacity` from the bonus/runtime model as visible capacity.
- Display owned item count / visible capacity.
- Use item priority rules:
  - equipped and market-locked/listed items first,
  - higher `armory_shelf_position` next,
  - within a priority/shelf group, older `generated_at` first.
- Treat hidden items as still owned; hidden does not mean deleted.

**Acceptance criteria:**
- Armory can show overloaded state such as `251/100`.
- Newer/lower-priority items are hidden first when capacity is exceeded.
- Visibility/access is not confused with ownership.
