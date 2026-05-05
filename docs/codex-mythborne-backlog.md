# Codex Backlog — Mythsworn Implementation Backlog

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
- Frontend formula runtime is preview/admin explainability only; authoritative DB/RPC workflows must evaluate assigned `balance_formulas` server-side and must not trust Angular-computed formula results for durable mutations.
- Preserve `reason`, `description`, `status_reason`, helper/admin text wherever applicable.
- After each task, summarize exact changes and wait for user confirmation.
- Do not mark tasks as completed in state docs before user confirms they work.
- Before adding new utility/config/factory files, check existing `core/utils`, `core/factories`, form config files and shared form patterns. If you add a new helper anyway, include a `reused / checked but not reused / new` table in the report.

---

## DB cleanup candidate rule

If a task removes the final frontend/backend dependency on a legacy DB object, Codex must report it as a cleanup candidate instead of silently leaving schema debt.

The report must include:

- object name, e.g. table/column/function/view;
- where it was previously used;
- what replaced it;
- whether a later DB cleanup/drop migration appears safe;
- any remaining known references in docs, generated types, tests, migrations or legacy adapters.

Codex must not create cleanup/drop migrations unless the user explicitly asks for database cleanup work.

---

## Implementation backlog discipline

- Prefer implementation tasks over repeated audits once schema/contracts are known.
- Audit/spec tasks should normally be followed by concrete implementation tasks in the same epic.
- Do not create long audit-only sequences unless user explicitly asks or implementation is blocked.
- If an audit finds clear work, add/update implementation tasks with acceptance criteria before continuing.
- UX tasks should produce visible UI/helpers unless explicitly marked as audit/spec.

---

# Epic A — Documentation, state and generated DB types

## Task A1 — Regenerate Supabase database types

**Status:** Done / confirmed.

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

**Status:** Done / confirmed.

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

**Status:** Done / confirmed.

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

**Status:** Done / confirmed.

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

**Status:** Done / confirmed.

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

**Status:** Done / confirmed.

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

**Status:** Done / confirmed.

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

**Status:** Done / confirmed.

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

**Status:** Done / confirmed.

**Goal:** Building bonuses use `entity_bonuses(entity_type = building)`.

**Scope:**

- Migrate building admin read/write.
- Migrate building preview/mansion read paths.

**Acceptance criteria:**

- Building admin, preview, and mansion flows do not use `building_bonuses`.
- Build passes.

**Blocker:**

- If expected building bonus rows are missing from `entity_bonuses`, stop and report SQL/backfill blocker. Do not add permanent fallback to legacy `building_bonuses`.
- If buildings legitimately have no bonus rows, treat that as an empty canonical `entity_bonuses` state and keep the page/runtime loading without legacy fallback.

---

## Task F11 — Combat/equipment item bonus inputs

**Status:** Done / confirmed.

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

**Status:** Done / confirmed.

**Goal:** Final repository audit after migration tasks.

**Scope:**

- Search application code for legacy bonus join tables and legacy semantic columns.
- Confirm remaining exceptions are limited to docs, generated database types, or explicit transitional adapters.
- Confirm derived-stat runtime uses canonical `entity_bonuses` and semantic `bonus_templates` without legacy target/type fallback.

**Acceptance criteria:**

- App code does not read/write legacy bonus join tables.
- App code does not read/write legacy semantic columns as source of truth.
- Derived stats calculate from final/effective base stats before deriving defense, health, damage, and combat inputs.
- Build and targeted tests pass.

---

# Epic G — Audit/logging foundation integration

## Task G1 — Audit dictionary read layer

**Status:** Done / confirmed.

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

**Status:** Done / confirmed.

**Goal:** Read audit logs for admin/case contexts.

**Scope:**

- Domain model for audit log rows.
- Query logs by entity/action/server/actor where supported.
- Keep metadata lightweight.

**Acceptance criteria:**

- Audit data can be displayed in admin/case views.

---

## Task G3 — Audit domain operation helper

**Status:** Done / confirmed.

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

**Status:** Done / confirmed.

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
- Config governance create/add workflows use DB-side audited RPCs, not direct inserts or frontend audit helper calls.

---

## Task G5 — Audit anti-abuse decisions

**Status:** Done / confirmed.

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
- Frontend anti-abuse decision calls use DB-side audited workflow RPCs, not direct table writes or frontend audit helper calls.
- Sanction item linking is evidence/context only; real item confiscation/return remains a separate workflow contract.

---

## Task G6 — Audit gameplay persistent changes

**Status:** Done / confirmed on 2026-04-29 for the stat allocation slice.

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
- Implementation note: stat allocation now uses canonical `save_stat_allocation(...)`; DB workflow owns Character Point spend validation, CP ledger writes and audit. UI draft plus/minus clicks remain local and unaudited. Remaining gameplay audit slices are major item operations, trade operations once frontend flows exist, and estate/building irreversible changes.

---

# Epic H — Anti-abuse foundation integration

## Task H1 — Anti-abuse dictionary models

Status: completed and accepted on 2026-04-29 through UX-I8.

**Goal:** Add typed models for anti-abuse dictionaries.

**Scope:**

- `anti_abuse_signal_types`
- `anti_abuse_sanction_types`
- `player_relationship_declaration_types`
- `player_abuse_report_types`

**Acceptance criteria:**

- Models include descriptions/helper/admin text and required-field flags.
- Implementation note: typed anti-abuse dictionary models and mappers cover sanction types, signal types, player abuse report types and player relationship declaration types.

---

## Task H2 — Anti-abuse dictionary loaders

Status: completed and accepted on 2026-04-29.

**Goal:** Load active dictionary rows.

**Scope:**

- Read active dictionary values.
- Sort by sort order/key.
- Expose to player/staff forms.

**Acceptance criteria:**

- No hardcoded anti-abuse type lists in UI.
- Implementation note: `AntiAbuseDictionaries` loads active DB-backed dictionary rows for all four anti-abuse dictionary collections, sorted by `sort_order` then `key`.

---

## Task H3 — Anti-abuse case read models

Status: completed and accepted on 2026-04-30.

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
- Implementation note: model-only slice; case, signal, participant, audit-link and declaration-link read models are available for H5 aggregation.

---

## Task H4 — Server-scoped case list service

Status: completed and accepted on 2026-04-30.

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
- Implementation note: `AntiAbuseCases` requires `serverId`, supports status/verdict/source/date filters, and does not fall back to a global case list.

---

## Task H5 — Case detail aggregation service

Status: completed and accepted on 2026-04-30.

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
- Implementation note: `AntiAbuseCaseDetails` loads the selected-server case detail aggregate only after confirming the base case by `serverId + caseId`; missing selected-server cases do not trigger linked reads.

---

## Task H6 — Player relationship declaration form model

Status: completed and accepted on 2026-04-30.

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
- Implementation note: player relationship declaration form models are generated from DB-backed type flags. Title, description and participants are always required; amount, expiration, item and trade fields are enabled only when required by the declaration type. Staff-only admin description is not exposed.

---

## Task H7 — Player relationship declaration submission

Status: completed and accepted on 2026-04-30.

**Goal:** Player can submit declaration.

**Scope:**

- Submit declaration with server/user/hero context.
- Persist participants/items/trades where supplied.
- Prefer RPC if available.

**Acceptance criteria:**

- Declaration can be submitted and later listed.
- Implementation note: submission uses canonical `create_player_relationship_declaration(...)` through a focused service and payload mapper. Top-level RPC args are generated `p_*` fields, while nested participants/items/trades JSON is explicitly mapped to the DB workflow contract.

---

## Task H8 — Player declaration list/status view

Status: completed and accepted on 2026-04-30.

**Goal:** Player can see declarations and reasons.

**Scope:**

- List relevant declarations.
- Show status, reason, participants, items/trades, timestamps.

**Acceptance criteria:**

- Player understands accepted/rejected/revoked/pending state.
- Implementation note: service/read-model slice requires `serverId`, `heroId` and `userId`, combines own declarations, hero participant declarations and user-only participant declarations, finalizes server scope through `serverId + id IN (...)`, loads inactive/deprecated type labels by key, and omits staff-only/global account fields from the player-facing model.

---

## Task H9 — Staff declaration review

Status: completed and accepted on 2026-04-30.

**Goal:** Staff can accept/reject/revoke declarations.

**Scope:**

- Detail view.
- Status transitions with reason.
- Audit hook where available.

**Acceptance criteria:**

- Staff decision and reason are stored and visible.
- Implementation note: staff review uses a server-scoped detail loader and canonical `AntiAbuseDecisions.setRelationshipDeclarationDecision(...)`; no direct write, frontend audit write or direct `.rpc()` call is done in the review service.

---

## Task H10 — Player abuse report form model

Status: completed and accepted on 2026-04-30.

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
- Implementation note: player abuse report form models are generated from DB-backed report type flags. `title` and `description` are always visible and required because current `create_player_abuse_report(...)` requires `p_title` and `p_description`; optional accused hero/item/trade fields remain flag-driven.

---

## Task H11 — Player abuse report submission

Status: completed and accepted on 2026-04-30.

**Goal:** Player can submit abuse report.

**Scope:**

- Use current server/hero/user context.
- Use `create_player_abuse_report` RPC if available.
- Report should create/link case.

**Acceptance criteria:**

- Player can submit report.
- Linked case exists when RPC path is used.
- Implementation note: submission uses canonical `create_player_abuse_report(...)`, sends only generated RPC args supported by the DB contract, does not require/send fake `reportingUserId`, requires returned `report_id` and `case_id`, and performs no direct report table writes or frontend audit writes.

---

## Task H12 — Player abuse report list/status view

Status: completed and accepted on 2026-04-30.

**Goal:** Player can see report status.

**Scope:**

- Show type, status, reason, linked case status if visible, timestamps.
- Do not expose staff-only/private data.

**Acceptance criteria:**

- Player understands submitted/linked/dismissed/resolved state.
- Implementation note: service/read-model slice requires `serverId`, `heroId` and `userId`, combines hero-owned reports and user-only reports, defensively filters final rows by `server_id`, loads inactive/deprecated report type labels and linked case status, and omits staff-only/global account fields.

---

## Task H13 — Staff case list page

Status: completed and accepted on 2026-04-30.

**Goal:** Staff can browse cases.

**Scope:**

- Server-scoped table/list.
- Filters by status/verdict/source/participant/date.

**Acceptance criteria:**

- Staff can open case detail from list.
- Implementation note: full manual data smoke with real case/signal content is deferred until gameplay data exists.

---

## Task H14 — Staff case detail page

Status: completed and accepted on 2026-04-30.

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
- Implementation note: technical verification and route smoke passed; full manual smoke with real case/signal/gameplay content is deferred until representative gameplay data exists.

---

## Task H15 — Case status transition action

Status: completed and accepted on 2026-04-30.

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
- Implementation note: status-only updates go through `AntiAbuseDecisions.setCaseDecision(...)` with only `caseId`, `status` and `statusReason`. Technical verification and route smoke passed; full manual smoke on real case/staff data is deferred until representative gameplay cases exist.

---

## Task H16 — Case verdict action

Status: completed and accepted on 2026-04-30.

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
- Implementation note: verdict updates go through `AntiAbuseDecisions.setCaseDecision(...)`, omit `operatorNotes`, preserve existing `statusReason` or use the stable fallback `Verdict updated.`, and clear `noSanctionReason` to `null` when a sanction is required. Technical verification and route smoke passed; full manual smoke on real case/staff data is deferred until representative gameplay cases exist.
- Planning note: if more case action sections are added, consider a light shared workflow-action wrapper/helper for the repeated error/success/loading/submit shell.

---

## Task H17 — Sanction domain models

Status: completed and accepted on 2026-04-30.

**Goal:** Model sanctions and CP penalties.

**Scope:**

- `anti_abuse_sanctions`
- `anti_abuse_sanction_items`
- `character_point_penalties`

**Acceptance criteria:**

- Explicit fields are modeled; no core data hidden in metadata JSON.
- Implementation note: sanction models live in `anti-abuse-sanction.model.ts`, with compatibility re-exports from `anti-abuse-decision.model.ts`. Explicit `createdAt` and `createdByUserId` fields are mapped from table columns where available. H17 is model/service-only; technical verification passed and full UI smoke is not applicable.

---

## Task H18 — Sanction type-driven form model

Status: completed and accepted on 2026-04-30.

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
- Implementation note: base required fields are `reason`, `targetHeroId` and `targetUserId`; dynamic fields are driven by sanction type flags. Future H19 UI must use server-scoped hero/account target search to populate target ids, not UUID-only inputs.

---

## Task H19 — Sanction creation operation

Status: completed and accepted on 2026-04-30.

**Goal:** Staff can create sanctions.

**Scope:**

- Create sanction.
- Create CP penalty for CP fine.
- Create sanction item links for item sanctions.
- Validate required fields.

**Acceptance criteria:**

- Staff can create at least warning, suspension, CP fine.
- Case detail shows sanctions.
- Implementation note: sanction creation is wired into selected-server case detail through canonical `AntiAbuseDecisions.createSanction(...)`. Target hero/account, source hero and item selection use server-scoped search/picker flows instead of UUID-only staff inputs. CP fines create linked Character Point penalties, item sanctions link selected item evidence/context, partial linked-record failures are surfaced, and the detail aggregate refreshes after base sanction creation. Full manual smoke is deferred until representative gameplay case/item data exists.

---

## Task H20 — Sanction status update operation

Status: completed and accepted on 2026-04-30.

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
- Implementation note: selected-server case detail can update sanction status through canonical `AntiAbuseDecisions.setSanctionStatus(...)`. The action requires sanction, status and status reason, uses central status options, refreshes detail after success, labels sanction options with type/status/target/reason context, and guards stale success/error responses against case/server and selected-sanction changes.

---

## Task H21 — CP penalty view/management

Status: completed and accepted on 2026-04-30.

**Goal:** Staff can inspect CP fine debt.

**Scope:**

- Show total/paid/remaining/status.
- Manual complete/cancel/forgive where supported.
- Do not implement automatic siphoning yet unless separately assigned.

**Acceptance criteria:**

- CP penalty is visible in case/hero history.
- Implementation note: selected-server case detail shows CP penalty debt and supports manual CP penalty status updates through canonical `AntiAbuseDecisions.setCharacterPointPenaltyStatus(...)`. The UI requires status reason, uses central sanction status options, labels penalty choices with hero/status/debt/reason context, refreshes detail after success, and guards stale success/error responses against case/server changes and selected-penalty changes. Automatic siphoning is not implemented. Full manual smoke is deferred until representative gameplay CP penalty data exists.

---

## Task H22 — Repeat offender/history view

Status: completed and accepted on 2026-04-30.

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
- Implementation note: selected-server case detail now includes repeat-offender history for a selected hero/account. The read service is server-scoped, excludes the current case, resolves final cases through `serverId + id IN (...)`, reads anti-abuse cases/participants/sanctions/Character Point penalties directly, and does not use the legacy moderation history RPC. Prior sanction/warning labels use referenced sanction type dictionaries loaded through `AntiAbuseReferencedDictionaries`, with raw type keys shown only as secondary metadata. Empty participant targets are ignored and UI requests guard stale target/case/server responses. Full manual smoke is deferred until representative anti-abuse history data exists.

---

# Epic I — Item lifecycle

## Task I1 — Add lifecycle fields to item domain models

Status: completed and accepted on 2026-04-30.

**Goal:** App understands active/scrapped items.

**Scope:**

- Include:
  - status,
  - scrapped_at,
  - recoverable_until,
  - updated_at.

**Acceptance criteria:**

- Item domain model includes lifecycle state.
- Implementation note: added `ItemReadModel` and `mapItemReadModel(...)` for runtime `items` rows, including `status`, `scrappedAt`, `recoverableUntil` and `updatedAt`. Equipped-item row typing/select now carries lifecycle fields for follow-up filtering. I1 is model/mapper-only; UI/manual smoke is not applicable.

---

## Task I2 — Filter scrapped items from normal inventory

Status: completed and accepted on 2026-04-30.

**Goal:** Prevent scrapped items from appearing usable.

**Scope:**

- Player inventory/armory views show active items only.
- Staff anti-abuse views may access recoverable scrapped items.

**Acceptance criteria:**

- Player cannot use scrapped items.
- Implementation note: current player-facing item usage path is equipment bonus resolution for combat. `EquipmentBonusesService` now applies bonuses only for joined `items.status = active`; `scrapped`, `locked_trade` and `locked_auction` items produce no bonuses. Missing joined item rows still throw an integrity error instead of being silently ignored. UI/manual smoke is deferred because runtime inventory/armory list UI does not exist yet.

---

## Task I3 — Implement safe scrap behavior skeleton

Status: completed and accepted on 2026-04-30.

**Goal:** Align scrap flow with item lifecycle.

**Scope:**

- No-affix trivial items may be permanently removed.
- Affix-bearing items become scrapped/recoverable.
- If affix info is not available, avoid unsafe permanent delete and add TODO.

**Acceptance criteria:**

- Affix-bearing items are not accidentally permanently deleted.
- Implementation note: added a core item lifecycle skeleton around the canonical `scrap_hero_item` RPC. `ItemLifecycleService` never direct-deletes or direct-writes `items`; frontend code always asks the DB workflow to decide whether a no-affix item is permanently removed or an affix-bearing/unknown item remains scrapped and recoverable. `permanent_delete_candidate` is only a classification hint, not a frontend delete path. Future UI should refresh inventory/equipment after success and base messaging on the RPC result, especially `recoverableUntil`, without assuming the item row still exists.

---

## Task I4 — Staff item recovery operation

Status: completed and accepted on 2026-04-30.

**Goal:** Allow recovery for anti-abuse cases later.

**Scope:**

- Staff operation to locate recoverable scrapped item.
- Restore or transfer according to sanction/case decision.
- Preserve reason/audit.

**Acceptance criteria:**

- Staff can recover relevant scrapped item when linked to case/sanction.
- Implementation note: added core item lifecycle recovery/search support around canonical `recover_scrapped_item` and `search_recoverable_scrapped_items_page` RPCs. `ItemLifecycleService` does not direct-write or direct-delete `items`; recovery results allow `status = active` with `scrappedAt` and `recoverableUntil` cleared to `null`, matching DB workflow semantics. I4 is service/model/mapper-only, so manual UI smoke is not applicable; full staff recovery UI smoke is deferred to a later UI task with real staff data.

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

Status: completed and accepted on 2026-04-30.

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
- Implementation note: inspect confirmed that J2 can proceed on the current direct-trade and one-item auction DB/RPC contract. Generated types include the expected public player RPCs for direct trade and auctions, while helper RPCs such as unlock/release/finalize remain internal and should not be treated as frontend player contracts. No active `market_listings` frontend path was found in `src`, and no new player market schema is required.

---

## Task J2 — Direct trade read models and services

Status: completed and accepted on 2026-04-30.

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
- Implementation note: added `DirectTrades`, direct trade domain read models and row mappers for active direct trade offers plus direct-trade transaction history. Reads are selected-server and active-hero scoped, transaction loading excludes `auction_sale`, linked hero/item labels are fetched only by concrete IDs, and the service stays read-only through `Backend.getAll`. Player-facing models intentionally do not expose raw `status_reason`/`reason` fields as primary UI data; future UI should add explicit player-safe messaging only if backed by a safe contract.

---

## Task J3 — Direct trade mutation UI through existing RPCs

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

**Status:** Accepted 2026-04-30.

- Implementation note: added `/game/auction` as a player-facing one-item auction surface for listing, bidding, buy-now, close and cancel flows. Mutations go through public auction RPCs via `PlayerAuctionActions`; the UI does not write directly to auction, lock, item status or transaction tables.
- Architecture note: auction UI is split into `AuctionOverviewState`, `AuctionCreateListingState`, `AuctionListingActionsState`, `AuctionFeedbackState`, route-level `AuctionPageState` facade and pure validation/label helpers. The page is reachable from the game sidebar through `/game/auction`.
- RPC result note: auction mutation results keep per-action semantics: create/cancel return `listingId`, bid returns `bidId`, buy-now returns `transactionId`, and close returns `transactionId | null`. Action guards use request token plus current server/hero/listing context instead of treating every RPC result as a listing id.
- Verification: `npx tsc --noEmit` passed; targeted auction/sidebar specs passed (`player-auction-rpc.spec.ts`, `player-auction-actions.spec.ts`, `auction-page.state.spec.ts`, `game-sidebar.spec.ts`, 17 SUCCESS); `npm run build` passed with existing bundle budget/CommonJS warnings; route smoke `/game/auction` works through the game sidebar.
- Manual smoke: create/bid/buy-now/cancel/close remains pending until sandbox data includes an active item, at least two heroes/users, Character Points and a real auction flow.

---

## Task J5 — Trade/auction transaction item snapshot feature integration

**Goal:** Use existing transaction item snapshots for anti-abuse similarity checks, trade/auction history, and future report/debug evidence.

**Current DB status:** DB foundation exists. `player_trade_transaction_items` stores lightweight item snapshot features captured at transaction time. Frontend/domain work should update generated types and consume these fields where relevant instead of treating snapshot support as a missing migration.

**Scope:**

- Update/regenerate generated types if needed.
- Extend transaction item domain models/mappers with snapshot fields from `player_trade_transaction_items`.
- Use snapshot fields in anti-abuse, trade history, auction history, and review/debug views where relevant.
- Avoid reconstructing historical similarity from current live item state when snapshot fields are available.
- Keep snapshots lightweight; do not replace full report/snapshot systems.

**Acceptance criteria:**

- Transaction item mappers include available snapshot fields.
- Similarity/history UI reads snapshot fields instead of recalculating from current item state.
- No client-side fake snapshot substitute is introduced.
- If generated types do not yet expose the snapshot columns, Codex reports a types regeneration blocker instead of reintroducing the old DB-migration blocker.
- Build and mapper tests pass.

**Status:** Accepted 2026-05-01.

- Implementation note: `DirectTradeTransactionItemReadModel` and `mapDirectTradeTransactionItem(...)` now expose the lightweight transaction-time snapshot fields from `player_trade_transaction_items`, including item/base/quality/affix identifiers and labels, prefix/suffix flags, value bucket and snapshot JSON.
- Auction integration note: `/game/auction` now includes auction sale history for the active hero by reading `player_trade_transactions(transaction_type = auction_sale)` and linking historical `player_trade_transaction_items` snapshots. The history does not reconstruct item state from current `items`.
- Reuse note: auction history reuses the direct-trade transaction item snapshot mapper instead of creating a parallel snapshot mapper. No write path or fake client-side snapshot substitute was added.
- Verification: `npx tsc --noEmit` passed; targeted specs passed (`direct-trade-mappers.spec.ts`, `player-auctions.spec.ts`, `auction-page.state.spec.ts`, 9 SUCCESS); `npm run build` passed with existing bundle budget/CommonJS warnings.
- Manual smoke: auction history with real transaction snapshots remains pending until sandbox data includes completed auction sales.

---

## Task J6 — Trade and auction audit frontend alignment

**Goal:** Align frontend trade/auction flows with the now DB-owned audit foundation, without adding Angular-side audit writers.

**Current DB foundation:**

- Trade/auction audit action dictionaries are seeded for direct trade and auction lifecycle.
- Audit entity dictionaries exist for:
  - `player_trade_offer`,
  - `player_trade_transaction`,
  - `player_auction_listing`,
  - `player_auction_bid`.
- DB triggers write lifecycle audit for:
  - direct trade offer create/respond/cancel/reject/expire/fail,
  - auction listing list/cancel/expire/fail,
  - auction bid placement,
  - auction buy-now / auction close path reason,
  - completed direct trade / auction sale transactions.
- Existing transaction rows, ledgers, transaction item snapshots and anti-abuse signals remain complementary evidence; audit does not replace them.

**Scope:**

- Confirm frontend trade/auction mutations still go only through canonical public RPCs.
- Do not add `AuditWriter` calls in Angular for trade/auction lifecycle.
- Update any review notes, services or comments that still claim trade/auction audit is missing as a DB blocker.
- If UI exposes audit/history later, read from audit logs and domain history; do not recreate audit evidence client-side.
- Keep audit metadata lightweight and do not treat audit logs as public reports or item/combat snapshots.

**Acceptance criteria:**

- Trade/auction UI has no direct calls to low-level audit helpers.
- All trade/auction mutations continue to use public RPC/domain operations.
- Any stale blocker/comment saying lifecycle audit is missing is removed or updated to the DB-owned trigger model.
- Frontend does not duplicate DB-owned lifecycle audit.
- Build and focused trade/auction tests pass.

---

## Task J7 — Vendor scrap/sell for drachmas

**Status:** Done / confirmed 2026-05-01.

**Goal:** Implement the vendor/system economy path for converting items into drachmas through the canonical DB/RPC workflow.

**Current DB status:** DB/RPC foundation exists. Use `vendor_scrap_hero_item(...)`.

Current DB contracts:

- `vendor_scrap_drachma_payout_percent` config, default 50;
- `get_vendor_scrap_drachma_payout_percent()` helper;
- `vendor_scrap_hero_item(p_item_id, p_actor_hero_id, p_reason, p_request_id)` public RPC;
- `scrap_hero_item(...)` remains the canonical item lifecycle cleanup path used by vendor workflow.

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

Epic K must use and extend the existing anti-abuse database foundation. It must not recreate a parallel Angular-only signal/case system and must not reintroduce a “build from scratch” anti-abuse foundation task unless the current schema genuinely lacks the needed contract.

Current source of truth:

- anti-abuse signals and case grouping already exist in the DB/RPC foundation;
- signal generation is a review aid, not automatic punishment;
- resolved/cancelled cases are historical and must not be silently reopened;
- suspicious trade/auction analysis should use stable transaction snapshots where available, not current live item state;
- any new signal source must remain server-scoped and privacy-conscious.

Known current DB/RPC concepts for this epic include:

- `anti_abuse_signals`;
- `anti_abuse_cases`;
- `anti_abuse_case_signals`;
- `anti_abuse_case_participants`;
- `create_or_link_anti_abuse_case_for_signal(...)`;
- `generate_trade_transaction_anti_abuse_signals(...)`;
- `insert_trade_transaction_anti_abuse_signal(...)`;
- `refresh_anti_abuse_case_signal_stats(...)`;
- `build_anti_abuse_hero_pair_grouping_key(...)`;
- paginated case/target search read models where present in generated types.

## Task K1 — Signal generation contract alignment

**Goal:** Align frontend/domain expectations with the existing DB/RPC anti-abuse signal generation contract.

**Scope:**

- Inspect current generated DB types and `database-current.md` for available anti-abuse signal/case RPCs.
- Confirm which signal-generation paths already exist for trade/auction transactions.
- Confirm which internal helper functions must not be called from Angular.
- Identify missing public contracts, if any, as DB/types blockers.
- Do not create new signal tables, Angular-only signal records, or parallel case grouping logic.

**Acceptance criteria:**

- Report lists available anti-abuse signal/case tables, public RPCs, and internal helper-only functions.
- Any missing contract is reported as a DB/types blocker.
- No new schema is proposed unless the current DB contract is genuinely missing.
- No code changes unless explicitly requested.

---

## Task K2 — Trade/auction suspicious value detection integration

**Goal:** Use existing transaction snapshots and anti-abuse signal generation paths to detect suspicious trade/auction value patterns.

**Scope:**

- Use transaction-time item snapshots from `player_trade_transaction_items` where available.
- Compare trade/auction CP value against server-local comparable history and configured thresholds.
- Use anti-abuse server config values rather than hardcoded thresholds.
- Handle patterns such as:
  - underpriced valuable item;
  - overpriced low-value item/substitute payment;
  - high CP transfer with weak or missing item value justification.
- Do not rely only on vendor/drachma value.
- Do not reconstruct historical item value from current live item state when snapshot fields exist.

**Acceptance criteria:**

- Suspicious trade/auction value patterns create or contribute to anti-abuse signals through DB/domain workflow.
- Existing transaction snapshots are used where present.
- Thresholds come from DB/config contracts.
- No automatic punishment is applied.
- If a required DB/RPC contract is missing, Codex reports a blocker instead of implementing client-side detection as the source of truth.

---

## Task K3 — Same-participant/repeated transfer detection integration

**Goal:** Detect repeated suspicious transfer patterns using the existing signal/case grouping foundation.

**Scope:**

- Group repeated transfers between the same hero pair / participant set.
- Use server scope and configured grouping window.
- Use existing grouping-key helpers where present, especially pair/grouping helpers for trade/auction transactions.
- Link related signals into cases through DB/RPC workflow.
- Preserve resolved/cancelled cases as historical instead of silently reopening them.

**Acceptance criteria:**

- Repeated suspicious patterns can create or join review cases through existing DB grouping workflow.
- Grouping is server-scoped.
- Existing helper/RPC contracts are used where available.
- No automatic punishment is applied.

---

## Task K4 — Same-IP/device signal boundary

**Goal:** Prepare a safe future boundary for IP/device/user-agent signals without introducing unsafe client-side or privacy-unsafe handling.

**Scope:**

- Do not expose raw IP/device identifiers to Angular.
- Do not store raw IP as a normal frontend-provided value.
- If login/session signal data is needed, define the boundary as trusted backend / Edge Function / server-side only.
- Use hashed identifiers with pepper/salt strategy only after explicit privacy/legal design approval.
- Treat IP/device matches as signals, never proof.

**Acceptance criteria:**

- No unsafe IP handling is introduced.
- Angular does not collect or submit raw IP/device fingerprint data.
- Any future implementation is clearly marked as trusted-backend-only and privacy-reviewed.

---

## Task K5 — IP/device signal ingestion design stub

**Goal:** Keep the future IP/device signal path available without implementing it prematurely.

**Scope:**

- Document the intended event boundary for login/session/device signals.
- Define which actor/system would create the signal.
- Define minimum metadata needed for review without exposing private raw values.
- Do not wire this into anti-abuse scoring until the privacy/legal boundary is approved.

**Acceptance criteria:**

- The future signal path is documented as design-only.
- No raw identifiers are exposed in frontend or normal admin UI.
- No automatic enforcement is built from IP/device matches.

---

## Task K6 — Existing auto-case grouping integration / extension

**Goal:** Verify and extend the existing DB-owned auto-case grouping workflow where needed.

**Scope:**

- Use existing DB case grouping helpers/triggers where present.
- Group by server, participants, signal type, grouping key, time window and related objects as supported by the current schema.
- Respect anti-abuse config values such as grouping window and auto-case creation enabled.
- Keep resolved/cancelled cases historical; create a new case or link according to DB helper semantics instead of silently reopening closed cases.
- Refresh case signal stats through existing DB helper/RPC where present.

**Acceptance criteria:**

- Signals can be grouped into cases through DB workflow, not only UI state.
- Existing grouping helpers are used where available.
- Resolved/cancelled cases are not silently reopened.
- If an extension requires new DB behavior, Codex reports a DB blocker instead of implementing Angular-only grouping.

---

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
- L-DB4c preview/simulation RPCs are applied in the current dump:
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
  - `preview_trial_opportunity_curve(...)`,
  - `preview_trial_manifestation_chance(...)`,
  - `preview_challenge_auto_resolve_success_chance(...)`,
  - `preview_reward_generated_item(...)`,
  - `preview_reward_profile(...)`,
  - `simulate_trial_opportunity_runs(...)`.
- Do not regenerate types unless the user explicitly asks Codex to do so.
- Do not mark any L task complete in docs during this alignment task.

**Acceptance criteria:**

- Expected PvE tables and RPCs are visible in generated types.
- App compiles after type inspection or any minimal type-reference fixes.
- If any expected table/RPC/type is missing, Codex reports a precise blocker instead of starting L2.
- No raw generated rows replace domain models.

---

## Task L2 — Exploration domain models and mappers

**Status:** Done / confirmed.

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

**Status:** Done / confirmed on 2026-05-01.

**Goal:** Create the player-facing entry/status surface for the current hero’s daily exploration.

**Scope:**

- Add or update a route/page under the gameplay area for Exploration.
- Load selected server and active hero before any hero-owned PvE calls.
- Use `start_or_get_hero_exploration(...)` and/or `get_hero_exploration_state(...)` through a typed service.
- Display current exploration status, difficulty, remaining trials, active/pending step or challenge status, and clear empty/no-exploration state.
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

**Status:** Done / confirmed on 2026-05-01.

**Goal:** Show the current exploration graph/path state and allow valid direction choices.

**Scope:**

- Read graph/path state from `get_hero_exploration_state(...)`.
- Display current node, discovered branches and available directions.
- Preserve discovered state: previously discovered nodes/edges are displayed as remembered, not rerolled in the frontend.
- Support backtracking if DB state exposes a valid edge/path for it.
- Disable direction choices while a step is already active, awaiting resolution, or while a challenge attempt blocks movement.
- Explain that every movement step costs time, including the first step.

**Acceptance criteria:**

- Player can see where they are and which directions are available.
- Known paths/backtracking do not trigger frontend-side rerolls.
- Invalid movement states are disabled/explained.
- Direction actions call DB/RPC workflow only.

---

## Task L5 — Start step timer and progress UI

**Status:** Done / confirmed on 2026-05-01.

**Goal:** Let players start exploration movement and understand the timer before resolving the step.

**Scope:**

- Start movement through `start_hero_exploration_step(...)`.
- Show timer/progress using DB `resolves_at`/step status, not arbitrary client-only state.
- Handle active step refresh/reload safely.
- Show `Check result` / resolve affordance only when the DB step is ready.
- For sandbox/admin/testing contexts, surface `skip_hero_exploration_step_timer(...)` only where permitted.
- Do not allow normal players to bypass timers.

**Acceptance criteria:**

- Starting a step creates/uses DB state.
- Reloading the page preserves timer state.
- Step cannot be resolved before DB-ready time unless sandbox/admin helper is used.
- Sandbox skip requires reason where RPC requires it.

---

## Task L6 — Resolve step result UI

**Status:** Done / confirmed on 2026-05-01.

**Goal:** Display resolved step outcomes clearly without duplicating DB roll logic in Angular.

**Scope:**

- Resolve ready step through `resolve_hero_exploration_step(...)`.
- Display outcome kinds: known-path/backtracking movement, nothing/empty flavor, encounter, trial opportunity with manifestation success, trial opportunity with manifestation fail.
- For nothing/empty results, show location/flavor text when available instead of a blank “nothing happened”.
- For manifestation fail, show that the daily trial opportunity was consumed and no reward is granted.
- For manifested trial or combat encounter, route/transition into challenge attempt UI.
- Do not reroll on refresh.

**Acceptance criteria:**

- Result page is driven by DB step/challenge state.
- Trial opportunity consumption and manifestation failure are understandable.
- Encounter/trial/nothing are mutually exclusive in the UI.
- No reward is generated by frontend code.

---

## Task L7 — Challenge attempt UI: manual, auto and debug paths

**Status:** Done / confirmed on 2026-05-01.

**Goal:** Provide the first UI for manifested trial/combat encounter challenge attempts.

**Scope:**

- Load active challenge attempt from exploration state.
- Show trial/encounter label, tested stat/minigame info and manual resolution deadline where available.
- Support manual completion through `complete_hero_exploration_challenge_attempt(...)` where current prototype allows.
- Support auto-resolve through `auto_resolve_hero_exploration_challenge_attempt(...)`.
- Surface chance/explanation data from DB where available; use L-DB4c preview for explanation only, not runtime truth.
- For admin/sandbox, support forced completion through `force_complete_hero_exploration_challenge_attempt(...)` only in allowed debug UI.

**Acceptance criteria:**

- Challenge attempt blocks further movement until completed/auto-resolved/admin-forced.
- Completion uses DB/RPC, not table updates.
- Success/failure state is visible and refresh-safe.
- Auto-resolve is clearly presented as fallback/worse-than-manual where applicable.

---

## Task L8 — Reward display and item persistence confirmation

**Status:** Done / confirmed on 2026-05-01.

**Goal:** Show exploration challenge rewards from persisted DB state.

**Scope:**

- Read reward grant and reward grant entries from DB-backed read models.
- Display EXP, Character Points / Hero Points according to current UI naming, resources, generated items, and skipped/unsupported reward entries where runtime records them.
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

**Status:** Done / confirmed on 2026-05-01 for frontend/admin-debug. Full gameplay smoke is pending backend/RLS fix for `hero_exploration_challenge_attempts` read access.

**Goal:** Add a server-scoped sandbox/admin page for inspecting and controlling exploration test state.

**Scope:**

- Add admin/debug surface for selected server and selected/test hero.
- Use DB-owned helper RPCs: `get_hero_exploration_debug_state(...)`, `add_hero_remaining_actions(...)`, `reset_hero_exploration(...)`, `skip_hero_exploration_step_timer(...)`, `test_grant_reward_profile_to_hero(...)`, `set_next_hero_exploration_outcome_override(...)`, `force_complete_hero_exploration_challenge_attempt(...)`.
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

**Status:** Done / confirmed on 2026-05-01.

**Goal:** Expose the L-DB4c preview/simulation RPCs as a non-mutating balancing and explainability lab.

**Scope:**

- Add an admin/lab UI that calls: `preview_trial_opportunity_curve(...)`, `preview_trial_manifestation_chance(...)`, `preview_challenge_auto_resolve_success_chance(...)`, `preview_reward_generated_item(...)`, `preview_reward_profile(...)`, `simulate_trial_opportunity_runs(...)`.
- Present outputs as readable tables/charts where practical: trial opportunity dry-step curve, manifestation chance by difficulty/stat inputs, auto-resolve chance, generated item preview, reward profile preview, and simulation distribution for trial opportunity runs.
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

## Task L11 — Trial definitions admin configurator

**Status:** Done / confirmed on 2026-05-01.

**Goal:** Add an admin/balancer UI for configuring trial definitions used by Exploration.

**Scope:**

- Add admin page/section for listing and editing `trial_definitions`.
- Load and display:
  - trial key,
  - label,
  - description/helper/admin text where available,
  - `tested_stat_key`,
  - `minigame_key`,
  - active flag / sort order where available.
- `tested_stat_key` must come from canonical `stats`, not hardcoded stat lists.
- `minigame_key` must come from `exploration_minigame_definitions`, not hardcoded minigame lists.
- For `minigame_key = combat`, show and manage assigned `trial_combat_candidates`:
  - candidate kind: concrete opponent or opponent family;
  - opponent definition / family picker;
  - scaling formula assignment if available;
  - difficulty multiplier;
  - weight;
  - min/max hero level if available.
- Preserve human-readable metadata: label, description, helper text, admin description.
- Do not treat all trials as combat in code. Combat is selected through `trial_definitions.minigame_key`.
- If write RPC/governance path for trial definitions or `trial_combat_candidates` is missing, stop and report DB/RPC blocker. Do not implement direct Angular writes as a permanent path.

**Acceptance criteria:**

- Admin can inspect configured trial definitions with readable labels and selected stat/minigame.
- Admin can configure combat trial candidates when a trial uses `minigame_key = combat`.
- UI uses DB dictionaries for stats, minigames, opponents and families.
- Frontend does not hardcode trial/minigame/stat lists.
- Mutations use approved RPC/governance path or are reported as DB/RPC blocker.
- Build passes and smoke report explains what trial configuration affects in Exploration.

---

## Task L11c — Trial configurator explainability and layout pass

**Status:** Done / accepted on 2026-05-02 after manual smoke.

**Goal:** Rebuild `/admin/exploration-trials` into a usable admin/balancer configurator, not a raw table editor.

The admin must understand:

- what the selected trial represents;
- which stat it tests;
- which minigame executes it;
- where combat candidates apply;
- when rewards are routed;
- what reward profile will be selected;
- what candidate/scaling settings do at runtime.

**DB/RPC foundation status:** Available after L11 write path, L-Reward-DB1/2/3/4, M-Dict-DB1 and L11-DB2.

Relevant DB-backed surfaces include:

- `trial_definitions`;
- `trial_combat_candidates`;
- `stats`;
- `exploration_minigame_definitions`;
- `reward_source_kinds`;
- `reward_outcome_kinds`;
- `reward_assignment_match_kinds`;
- `reward_profiles`;
- `reward_profile_entries`;
- `reward_entry_kinds`;
- `reward_entry_amount_modes`;
- `reward_entry_kind_amount_modes`;
- `resource_types`;
- `combat_candidate_kind_definitions`;
- `combat_opponent_families`;
- `combat_opponent_definitions`;
- `combat_opponent_stat_values`;
- `combat_opponent_attack_sources`;
- `combat_opponent_equipment_mode_definitions`;
- `combat_source_type_definitions`;
- `combat_outcome_definitions`;
- `combat_attack_source_kind_definitions`;
- `ui_metadata_entries` via `get_ui_metadata_entries(...)`.

Canonical mutation RPCs:

- `upsert_trial_definition(...)`;
- `deactivate_trial_definition(...)`;
- `upsert_trial_combat_candidate(...)`;
- `deactivate_trial_combat_candidate(...)`;
- `upsert_reward_profile_assignment(...)`;
- `deactivate_reward_profile_assignment(...)`.

Frontend must not direct-write `trial_definitions`, `trial_combat_candidates` or `reward_profile_assignments`.

**Scope:**

- Reorganize `/admin/exploration-trials` into clear sections/tabs:
  - Overview / meaning;
  - Trial definition;
  - Reward assignments;
  - Combat candidates;
  - Previews / simulation;
  - Advanced / technical.
- Load trial configurator section/field help from `ui_metadata_entries` through `get_ui_metadata_entries(...)`.
- Preserve and display DB-backed:
  - label;
  - description;
  - helper text;
  - admin description;
  - impact summary / warning text where available.
- Raw keys/UUIDs may appear only as secondary metadata.
- Metadata JSON must be collapsed under Advanced / Technical.

### Overview / meaning

- Show selected trial label and description.
- Explain:
  - trial definition = reusable exploration trial;
  - tested stat = gameplay meaning of the trial;
  - minigame = current execution mechanic;
  - current combat minigame may be prototype execution for multiple stat trials.
- Use `stats.description/helper_text/admin_description` for tested stat explanation.
- Use `exploration_minigame_definitions` for minigame explanation.

### Trial definition section

- Allow create/update through `upsert_trial_definition(...)`.
- Allow deactivate through `deactivate_trial_definition(...)`.
- Reason is mandatory.
- Explain fields:
  - key = stable technical/runtime key;
  - label = admin/player-facing label;
  - description/helper/admin description = UI/explainability copy;
  - tested stat = stat archetype tested by trial;
  - minigame = current execution mechanic;
  - active flag = whether runtime may use this trial;
  - sort order = admin display/order, not probability unless DB/runtime explicitly says so.
- Do not rely on local hardcoded stat descriptions.

### Reward assignments section

- Show `source_kind = trial` as the normal source kind for this page.
- Use `reward_source_kinds` and `reward_outcome_kinds`.
- Explain:
  - outcome kind is a runtime-emitted signal;
  - trial runtime currently emits success/failure for completion reward routing;
  - reward assignment chooses one best matching reward profile;
  - multiple rewards for one event belong as entries inside one reward profile.
- Use L-Reward-DB3 match modes:
  - any;
  - exact;
  - minimum;
  - range.
- Show whether assignment is:
  - scoped to selected trial via `trial_definition_id`;
  - or global for matching trials.
- Show human-readable summary, e.g.:
  - “Dla triala X, gdy runtime wyemituje Y, a trudność/dystrykt pasują do zakresu, użyj profilu Z.”
- Show selected reward profile summary:
  - profile label/description/helper/admin text;
  - active entries;
  - entry kind labels from `reward_entry_kinds`;
  - amount mode labels from `reward_entry_amount_modes`;
  - allowed mode filtering from `reward_entry_kind_amount_modes`.
- Do not expose `formula` for `item_generation` or `exploration_effect`.
- `transfer_formula` remains reserved for future PvP transfer runtime.

### Combat candidates section

- Show this section as active only when `trial_definitions.minigame_key = combat`.
- If selected trial is not combat, explain why combat candidates are not applicable.
- Use `combat_candidate_kind_definitions`.
- Explain:
  - opponent candidate = concrete opponent definition;
  - family candidate = runtime can select from a family/pool;
  - weight = selection weight, not stat multiplier;
  - difficulty multiplier = scaling multiplier for this trial/candidate;
  - scaling formula = override of opponent stat scaling;
  - min/max hero level = candidate availability bounds.
- Use DB-backed labels/descriptions for:
  - opponent definitions;
  - opponent families;
  - formulas;
  - candidate kind.
- Empty state:
  - if there are no trial combat candidates, say none are configured;
  - if there are no combat opponents/families yet, link/point to M12 opponent configurator or explain that opponents must be created first.
- Mutations use:
  - `upsert_trial_combat_candidate(...)`;
  - `deactivate_trial_combat_candidate(...)`.

### Previews / simulation section

- Use preview RPCs where available:
  - `preview_trial_manifestation_chance(...)`;
  - `preview_challenge_auto_resolve_success_chance(...)`;
  - relevant reward profile preview if selected.
- Explain that previews are read-only tools and do not mutate runtime state.
- Preview UI must clearly state inputs:
  - difficulty;
  - district;
  - stat value;
  - hero level;
  - relevant formula/default context.

### Advanced / technical section

- Collapse metadata JSON.
- Show raw keys/UUIDs as secondary metadata.
- Show generated/runtime key warnings only here or as subdued technical metadata.
- Do not make metadata JSON the primary gameplay configuration surface.

### General architecture rules

- Use Reactive Forms.
- Use existing shared/admin helpers where possible:
  - metadata JSON display;
  - dictionary option mappers;
  - reason form patterns;
  - RPC error display;
  - stale request guards.
- Do not add new DB schema in this task.
- If generated `database.types.ts` does not include L11-DB2 / reward amount mode matrix / M-Dict-DB1 additions, stop and request type regeneration.
- Do not hardcode permanent explanations when DB text exists.

### Non-negotiable completeness requirements

This task must implement the trial editor as a complete functional admin/balancer configurator, not a styling-only pass.

Codex must verify that generated `database.types.ts` includes after L11-DB2:

- `stats.description`;
- `stats.helper_text`;
- `stats.admin_description`;
- `deactivate_trial_definition(...)`;
- `reward_entry_kind_amount_modes`;
- `ui_metadata_entries`;
- `get_ui_metadata_entries(...)`;
- latest reward dictionaries from L-Reward-DB3/DB4;
- latest combat dictionaries from M-Dict-DB1.

If any of these are missing, stop and report that generated DB types must be regenerated.

The page must load and use, at minimum:

- trial definitions;
- trial combat candidates;
- stats with description/helper/admin text;
- exploration minigame definitions;
- trial configurator UI metadata from `ui_metadata_entries`;
- reward source kinds;
- reward outcome kinds;
- reward assignment match kinds;
- reward profiles;
- reward profile entries;
- reward entry kinds;
- reward entry amount modes;
- reward entry kind amount mode matrix;
- resource types;
- combat candidate kind definitions;
- combat opponent families and definitions;
- formula targets/formulas relevant to trial combat candidate scaling and preview.

The UI must not expose all amount modes for all reward entry kinds. It must use `reward_entry_kind_amount_modes`:

- `experience`: fixed/range/formula;
- `character_points`: fixed/range/formula;
- `resource`: fixed/range/formula;
- `item_generation`: none only;
- `exploration_effect`: none only.

`transfer_formula` must not be shown as a normal PvE reward mode.

The trial editor must include clear empty states for:

- no reward assignments for selected trial;
- no reward profiles available;
- no combat candidates for selected trial;
- no combat opponents/families available yet;
- selected trial is not combat, so combat candidates are not applicable.

The page must provide human-readable summaries, not just forms:

- selected trial summary;
- tested stat meaning;
- minigame meaning;
- reward assignment summary;
- selected reward profile summary;
- reward entries summary;
- combat candidate summary;
- scaling/difficulty multiplier explanation;
- preview input/result explanation.

The reward assignment summary must state clearly:

- source kind is `trial`;
- outcome is a runtime-emitted signal such as success/failure;
- assignment chooses one best matching reward profile;
- multiple rewards belong as entries inside that one reward profile;
- difficulty/district matching uses any/exact/minimum/range;
- assignment may be selected-trial scoped or global for matching trials.

The combat candidate section must state clearly:

- candidate kind `opponent` means one concrete opponent;
- candidate kind `family` means runtime can select from a family/pool;
- weight affects selection frequency, not stat scaling;
- difficulty multiplier affects opponent scaling in this trial context;
- scaling formula overrides or falls back to combat opponent/default scaling;
- natural attack/equipment details come from opponent configuration, not from this trial row.

The trial definition section must state clearly:

- tested stat is the gameplay archetype of the trial;
- minigame is the execution mechanic;
- combat may currently be a prototype minigame for multiple stat trials;
- changing tested stat/minigame may change balancing and runtime meaning;
- sort order is display/admin order unless runtime explicitly uses it.

Metadata JSON must remain collapsed under Advanced / Technical and must not be presented as the primary gameplay configuration surface.

All durable mutations must use canonical RPCs only:

- `upsert_trial_definition(...)`;
- `deactivate_trial_definition(...)`;
- `upsert_trial_combat_candidate(...)`;
- `deactivate_trial_combat_candidate(...)`;
- `upsert_reward_profile_assignment(...)`;
- `deactivate_reward_profile_assignment(...)`.

No direct Angular writes to:

- `trial_definitions`;
- `trial_combat_candidates`;
- `reward_profile_assignments`;
- `reward_profile_entries`;
- `reward_profiles`.

Every durable mutation must require and send reason where the RPC requires it.

**Acceptance criteria:**

- Admin can understand what each section changes without knowing table names.
- Admin can distinguish:
  - trial definition;
  - tested stat;
  - minigame;
  - reward assignment;
  - reward profile;
  - reward profile entry;
  - combat candidate;
  - opponent/family target.
- Admin can tell whether reward assignment is scoped to selected trial or global.
- Admin can tell exactly when reward assignment will match.
- Admin can tell that only one reward profile is selected.
- Admin can tell that several rewards require several entries inside the selected reward profile.
- Admin can see that `formula` amount mode is only for experience/character_points/resource.
- Admin cannot select formula for item_generation or exploration_effect.
- Combat candidates are not shown as normal editable content for non-combat minigames.
- Empty states for no reward assignments/no combat candidates/no opponents are clear.
- Mutations use canonical RPCs only.
- Build passes.
- Smoke report explains:
  - trial definition create/update/deactivate;
  - reward assignment create/deactivate for trial success/failure;
  - combat candidate create/deactivate when combat minigame is selected;
  - what each tested configuration would affect in runtime.
- Generated DB types include L11-DB2 additions before implementation starts.
- Trial editor loads DB-backed UI metadata for sections/fields instead of relying only on hardcoded section copy.
- Tested stat descriptions come from `stats`, not local Angular copy.
- Reward amount modes are filtered through `reward_entry_kind_amount_modes`.
- `formula` is not available for `item_generation` or `exploration_effect`.
- `item_generation` explains min/max item count, max quality and bucket profile as item generation configuration.
- `exploration_effect` explains effect definition selection as effect application, not numeric amount.
- Trial reward assignments clearly explain one selected profile, not stacked matching assignments.
- Combat candidate section is disabled/explained for non-combat minigames.
- Empty states are useful and tell admin what must be configured next.
- Smoke report includes domain meaning, not only click path:
  - trial definition create/update/deactivate;
  - tested stat/minigame explanation visible;
  - reward assignment create/deactivate for trial success/failure;
  - reward profile entries summary visible;
  - amount mode filtering verified;
  - combat candidate empty state or create/deactivate verified;
  - preview section explanation verified.

---

## Task L12 — Encounter definitions admin configurator

**Status:** Done / frontend-confirmed on 2026-05-01. Full admin smoke remains conditional on backend/RLS grants for the required read tables.

**Goal:** Add an admin/balancer UI for configuring encounter definitions used by Exploration.

**Scope:**

- Add admin page/section for listing and editing `encounter_definitions`.
- Load and display:
  - encounter key,
  - label,
  - description/helper/admin text where available,
  - `encounter_kind`,
  - `minigame_key`,
  - reward profile assignment,
  - min/max difficulty,
  - min/max district,
  - active flag / sort order where available.
- Encounter kind must come from DB/schema-backed values, not hardcoded permanent UI lists.
- Reward profile picker must use `reward_profiles`, not raw UUID-only entry.
- Difficulty and district fields must use DB-backed labels/dictionaries where available.
- For combat encounters, show and manage `encounter_combat_candidates`:
  - candidate kind: concrete opponent or opponent family;
  - opponent definition / family picker;
  - scaling formula assignment if available;
  - difficulty multiplier;
  - weight;
  - min/max hero level if available.
- Keep resource and buff/debuff encounter details as clearly marked pending sections if DB shape for those details is not yet available.
- Preserve human-readable metadata: label, description, helper text, admin description.
- If write RPC/governance path for encounter definitions or `encounter_combat_candidates` is missing, stop and report DB/RPC blocker. Do not implement direct Angular writes as a permanent path.

**Acceptance criteria:**

- Admin can inspect configured encounter definitions with readable kind, minigame, reward profile, difficulty and district boundaries.
- Admin can configure combat encounter candidates when the encounter is combat/minigame-backed.
- UI does not use raw UUID-only pickers for reward profiles, opponents, families or formulas.
- UI clearly distinguishes implemented combat candidate config from future resource/effect-specific config.
- Mutations use approved RPC/governance path or are reported as DB/RPC blocker.
- Build passes and smoke report explains what encounter configuration affects in Exploration.

---

## Task L12b — Resource and effect encounter payload configurators

**Status:** Implemented / accepted on 2026-05-02.

**Goal:** Add explicit DB-backed configuration for non-combat encounter payloads instead of hiding them in generic metadata.

**Scope:**

- Define/read the DB shape for resource encounter payloads.
- Define/read the DB shape for buff/debuff exploration effect payloads.
- Add approved write RPC/governance paths for the new payload tables or report a DB/RPC blocker.
- Extend `/admin/exploration-encounters` with dedicated sections for:
  - resource encounter payloads,
  - buff encounter payloads,
  - debuff encounter payloads.
- Keep the current combat candidate editor limited to combat encounters.
- Do not encode authoritative resource/effect behavior as arbitrary JSON-only Angular forms.

**Acceptance criteria:**

- Resource encounters have a readable, typed payload editor.
- Buff/debuff encounters have readable, typed payload editors.
- UI explains how the payload affects exploration runtime.
- Mutations use approved RPC/governance path.
- Build passes and smoke report distinguishes combat, resource and effect encounter config.

---

## Task L12c — Encounter configurator explainability and layout pass

**Status:** Done / accepted on 2026-05-02 after manual smoke.

**Goal:** Make `/admin/exploration-encounters` usable as an admin/balancer tool, not just a raw table editor.

The admin must understand:

- what the selected encounter does;
- which configuration applies only to the selected encounter;
- which configuration is global/fallback;
- when a reward assignment will match;
- which one reward profile will be selected;
- what that reward profile actually grants.

**DB/RPC foundation status:** Available after L12, L12b, L-Reward-DB1, L-Reward-DB2 and L-Reward-DB3.

Relevant DB-backed dictionaries/read surfaces include:

- `reward_source_kinds`
- `reward_outcome_kinds`
- `reward_assignment_match_kinds`
- `reward_entry_kinds`
- `reward_entry_amount_modes`
- `resource_types`
- `reward_profiles`
- `reward_profile_entries`
- `encounter_resource_payloads`
- `encounter_effect_payloads`
- `exploration_effect_definitions`

Do not hardcode permanent gameplay/config explanations in Angular when DB-backed labels/descriptions/helper/admin text exist.

**Scope:**

- Reorganize the page into clear sections/tabs:
  - Overview / meaning,
  - Encounter definition,
  - Reward assignments,
  - Combat candidates,
  - Resource payloads,
  - Effect definitions,
  - Effect payloads,
  - Advanced / technical.

- Every section must clearly say whether it affects:
  - the selected encounter only,
  - all encounters through a global assignment,
  - reusable library content,
  - or technical/advanced metadata.

- Add selected-scope labels, for example:
  - `Reward assignments for selected encounter: Light combat`
  - `Combat candidates for selected encounter: Light combat`
  - `Resource payloads for selected encounter: Resource find`

- Update stale copy that says resource/effect payloads are pending. After L12b they are DB-backed.

### Encounter definition section

- Explain `encounter_kind` in gameplay terms:
  - combat = encounter resolves through combat candidate/opponent flow;
  - resource = encounter gives configured resource payloads / reward routing;
  - buff/debuff = encounter links to temporary exploration effects.
- Explain that `nothing` is not an encounter definition.
- Explain that min/max difficulty and min/max district on the encounter definition control where the encounter may appear, not reward amount and not reward assignment matching.
- Keep generated/raw key secondary.
- Keep metadata JSON collapsed under Advanced / Technical.

### Reward assignments section

Reward assignment UI must explain the full reward routing model:

- A reward assignment chooses **one best matching reward profile**.
- If one event should grant several things, e.g. XP + item + drachma, those must be modeled as several `reward_profile_entries` inside one selected reward profile.
- Do not imply that multiple matching assignments all fire.
- The selected reward profile is the bundle of grants; the assignment only decides when that bundle is used.
- `source_kind = encounter` should be shown as the normal source kind for this page.
- `outcome_kind` is a runtime-emitted outcome signal, not a label slug.
- Adding an outcome kind does not make runtime emit it.
- Show whether the assignment is scoped to the selected encounter:
  - if `encounter_definition_id` is set, say it applies to the selected encounter;
  - if `encounter_definition_id` is null, say it is global for matching encounters.

Use DB-backed dictionaries:

- `reward_source_kinds` for source kind label/help;
- `reward_outcome_kinds` for outcome label/help/admin description;
- `reward_assignment_match_kinds` for difficulty/district match modes.

Difficulty and district matching must use L-Reward-DB3 semantics:

- `any` / `Dowolne` = any value;
- `exact` / `Dokładnie` = only selected value;
- `minimum` / `Od wartości wzwyż` = selected value and higher;
- `range` / `Zakres` = from selected value to max selected value.

UI must not describe difficulty/district as exact-only after L-Reward-DB3.

For every reward assignment, show a human-readable summary, for example:

> For selected encounter `Light combat`, when outcome `Encounter failure` is emitted and difficulty matches `Od wartości wzwyż: Medium`, district matches `Dowolne`, use reward profile `Test profile`.

Or in Polish if the surrounding admin UI is Polish:

> Dla encountera `Light combat`, gdy runtime wyemituje `Encounter failure`, a trudność pasuje jako `Od wartości wzwyż: Medium` i dystrykt jako `Dowolne`, użyj profilu nagrody `Test profile`.

Show a short reward profile summary inline:

- profile label;
- profile description/helper/admin text if available;
- list of active entries:
  - entry kind label,
  - amount mode label,
  - amount/formula/resource/item/effect summary.

If no reward profile is selectable:

- explain that reward profiles are created in the reward profile configurator;
- do not imply direct creation is available in this page unless it actually is;
- do not direct-write reward tables from this page.

`Direct reward profile` on `encounter_definitions.reward_profile_id` must be labelled as legacy/simple fallback, not the main balancing path. Main reward balancing is through `reward_profile_assignments`.

### Reward entry / amount mode explainability when shown from assignment preview

If reward profile entries are summarized in this page, use DB-backed labels from:

- `reward_entry_kinds`,
- `reward_entry_amount_modes`,
- `resource_types`.

Explain:

- `fixed` = fixed numeric amount;
- `range` = DB/runtime rolls within range;
- `formula` = numeric reward amount calculated DB-side for XP/CP/resource;
- `transfer_formula` = reserved for future PvP transfer runtime, not normal PvE reward mode;
- `none` = no numeric amount, used for item generation or exploration effect.

Formula amount mode must be described as numeric reward amount only. It must not imply arbitrary durable gameplay effects such as siege relocation or other special workflow outcomes.

### Combat candidates section

- Explain that combat candidates apply only to combat encounters.
- Explain candidate kind:
  - concrete opponent = this specific opponent definition;
  - opponent family = runtime can choose from a family/pool.
- Explain:
  - weight affects candidate selection probability/priority;
  - difficulty multiplier affects opponent scaling for this encounter;
  - scaling formula override changes how opponent stats scale for this candidate.
- Use DB-backed labels/descriptions for opponents, families and formulas where available.
- Do not show raw UUIDs as primary labels.

### Resource payloads section

- Explain resource payloads as typed payloads for resource encounters.
- Use `resource_types` as the source of truth for resource options.
- Do not use fallback resource type lists as the normal source after L-Reward-DB2.
- Explain:
  - resource type;
  - fixed/range/formula amount mode;
  - min/max amount;
  - chance percent;
  - formula usage as DB-side numeric reward/payload amount.
- Raw resource key may be secondary metadata only.

### Effect definitions section

- Explain that effect definitions are reusable buff/debuff library entries.
- Explain:
  - buff/debuff kind;
  - bonus template;
  - default value;
  - default duration;
  - runtime rule: only one active exploration effect at a time.
- Make clear that editing effect definitions may affect every encounter/payload that reuses the same effect.

### Effect payloads section

- Explain that effect payload links the selected encounter to a reusable effect definition.
- Explain that payload controls whether this selected encounter may apply the effect.
- Use DB-backed effect labels/descriptions/helper/admin text.
- Make clear whether the selected payload is active and what chance percent means.

### Advanced / technical section

- Keep metadata JSON collapsed.
- Keep raw keys/UUIDs secondary.
- Metadata JSON must not be presented as the primary gameplay configuration surface.
- Reason field must explain that it is required for audit/governance.

### General UI and architecture rules

- Prefer DB-backed labels/descriptions/helper/admin text over hardcoded explanations.
- Raw keys/UUIDs may appear as secondary metadata only.
- Formula pickers must be filtered, grouped, or clearly labelled so unrelated formula targets are not presented as equally valid without explanation.
- Preserve all existing RPC/governance mutation paths.
- Do not add new DB schema in this task.
- If generated `database.types.ts` does not include L-Reward-DB3 dictionaries/fields, stop and request database type regeneration.

**Acceptance criteria:**

- Admin can tell what each section changes in gameplay without knowing table names.
- Admin can distinguish:
  - encounter definition,
  - reward assignment,
  - reward profile,
  - reward profile entry,
  - resource payload,
  - effect definition,
  - effect payload.
- Admin can tell whether a reward assignment is scoped to the selected encounter or global.
- Admin can tell exactly when a reward assignment will match.
- Admin can tell that reward assignment chooses one best matching reward profile.
- Admin can tell that several rewards for one event must be entries inside the selected reward profile.
- Admin can see what the selected reward profile contains.
- Difficulty/district matching uses and explains any/exact/minimum/range from `reward_assignment_match_kinds`.
- Resource/effect payload sections no longer say their DB payloads are pending.
- Resource type options come from `resource_types`.
- Metadata JSON is not presented as the primary gameplay configuration surface.
- Build passes.
- Smoke report explains what a combat/resource/buff/debuff encounter configuration affects and what tested reward assignments would do at runtime.

---

## Task L13 — Reward profile configurator

**Status:** Implemented / accepted on 2026-05-02.

**Goal:** Add a write-capable admin/balancer UI for creating and editing reusable reward profiles, reward profile entries, and DB-backed reward outcome kinds used by trials, encounters and future reward sources.

**DB/RPC foundation status:** Available after L-Reward-DB1.

Current canonical DB/RPC surface:

- `reward_outcome_kinds`
- `reward_profiles`
- `reward_profile_entries`
- `reward_profile_assignments`
- `upsert_reward_outcome_kind(...)`
- `deactivate_reward_outcome_kind(...)`
- `upsert_reward_profile(...)`
- `deactivate_reward_profile(...)`
- `upsert_reward_profile_entry(...)`
- `deactivate_reward_profile_entry(...)`
- `upsert_reward_profile_assignment(...)`
- `preview_reward_profile(...)`

Frontend must use these RPCs. Do not direct-write reward tables from Angular.

**Scope:**

- Add an admin/balancer page or section for reward configuration, preferably under the same Game Balance / Exploration admin area where trials and encounters are configured.
- Load and display `reward_profiles`:
  - key,
  - label,
  - description,
  - helper text,
  - admin description,
  - category,
  - active flag,
  - sort order,
  - metadata as collapsed Advanced/Technical only.
- Allow creating/updating reward profiles through `upsert_reward_profile(...)`.
- Allow deactivating reward profiles through `deactivate_reward_profile(...)`.
- Reason is mandatory for all durable reward mutations.
- Load and display `reward_profile_entries` for the selected reward profile.
- Allow creating/updating reward profile entries through `upsert_reward_profile_entry(...)`.
- Allow deactivating reward profile entries through `deactivate_reward_profile_entry(...)`.
- Supported entry kinds:
  - `experience`,
  - `character_points`,
  - `resource`,
  - `item_generation`,
  - `exploration_effect`.
- Entry kind UI must be kind-aware:
  - `experience`: fixed/range amount; explain that runtime grants matching Character Points according to current reward workflow.
  - `character_points`: fixed/range Character Points.
  - `resource`: resource type + fixed/range amount.
  - `item_generation`: min/max item count, max quality, bucket profile.
  - `exploration_effect`: effect definition selector.
- Do not expose unsupported formula reward amount modes as normal editable options unless DB/runtime support exists. If generated types expose formula fields, keep them technical/reserved or report a runtime support gap.
- Use DB-backed dictionaries/read models where available:
  - `reward_outcome_kinds`,
  - item generation qualities,
  - item generation bucket profiles,
  - exploration effect definitions,
  - resource type source if available in current schema/read models.
- Load and display `reward_outcome_kinds` as a DB-backed dictionary:
  - source kind,
  - key,
  - label,
  - description,
  - helper text,
  - admin description,
  - active flag,
  - sort order.
- Outcome kinds must not be hardcoded in Angular as the source of truth.
- Normal encounter/trial reward assignment UI should use active outcome kinds filtered by `source_kind`.
- `source_kind = test` is a technical/admin/sandbox context only. Do not present it as normal player gameplay content.
- Use `preview_reward_profile(...)` to show what a selected reward profile would grant.
- Preview must be labelled clearly as preview-only, not a real grant.
- Add clear explainability:
  - reward profile = reusable bundle of rewards;
  - reward profile entry = one grant inside the bundle;
  - reward profile assignment = where/when that profile is used;
  - outcome kind = DB-backed meaning for success/failure/completion in a source context.
- Add navigation/link affordance from `/admin/exploration-encounters` reward assignment empty state:
  - if no reward profiles exist, tell admin to create/activate one in reward profile configurator;
  - do not imply direct reward profile creation is available inside L12 unless it actually is.
- Keep raw keys/UUIDs secondary. Show labels/descriptions/helper/admin text wherever available.
- Keep metadata JSON collapsed under Advanced/Technical.
- Reuse existing shared/admin helpers where possible:
  - metadata JSON display,
  - reason field pattern,
  - DB dictionary option mapping,
  - RPC error display,
  - stale request guards,
  - PrimeNG section/tab patterns.
- If generated `database.types.ts` does not include L-Reward-DB1 tables/functions, stop and report that database types must be regenerated. Do not invent permanent frontend types manually.

**Acceptance criteria:**

- Admin can create/update/deactivate reward profiles.
- Admin can create/update/deactivate reward profile entries.
- Admin can inspect DB-backed reward outcome kinds.
- Admin can preview a reward profile without granting it.
- Encounter/trial reward assignment UI can select existing reward profiles and DB-backed outcome kinds.
- Outcome kind options come from `reward_outcome_kinds`, not hardcoded Angular lists.
- `source_kind = test` is treated as technical/admin/sandbox, not normal gameplay.
- Mutations use canonical RPC/governance path only.
- No Angular direct writes to:
  - `reward_outcome_kinds`,
  - `reward_profiles`,
  - `reward_profile_entries`,
  - `reward_profile_assignments`.
- UI explains the gameplay/admin meaning of reward profiles, entries, assignments and outcome kinds.
- Build passes.
- Smoke report covers:
  - reward profile create/update/deactivate,
  - reward profile entry create/update/deactivate for at least `experience` and one non-XP kind if data exists,
  - reward profile preview,
  - outcome kind read/display,
  - L12 empty-state/link behavior when no reward profile is selectable,
  - and explains what each tested action means in reward routing terms.

---

## Epic L known follow-ups / caveats

- Current DB runtime still uses fallback calculations for several formulas. Formula targets exist, but a full DB-side formula evaluator integration is not fully wired into exploration runtime helpers.
- `get_hero_exploration_luck_value(...)` may still return fallback 0 until canonical DB-side derived Luck resolver exists.
- Item generation persistence works through fallback picker/budget helpers, not final Luck-aware item-generation runtime.
- Report snapshots are not implemented yet; exploration graph/step/challenge rows are runtime/debug state, not public report snapshots.
- L-DB4c preview/simulation RPCs are preview tools only. They must not be used as authoritative gameplay resolution.
- Frontend implementation must wait for regenerated `database.types.ts` after the latest PvE schema/RPC changes.

---

# Epic M — Combat

Epic M builds the reusable combat core. Combat is one generic module: a caller provides two combatants and receives a result. Exploration encounters, trials, PvP, sandbox and future systems use the same combat rules and interpret the result differently.

Epic M must not implement rewards, trial completion, PvP consequences, prestige changes, reports publishing, siege effects or special durable workflow effects. Combat produces a result/snapshot; the caller owns consequences.

**DB foundation status:** applied in schema before frontend work. Current DB foundation includes:

- combat formula targets:
  - `combat_initiative_score`,
  - `combat_opponent_scaled_stat`;
- random formula block seeds:
  - `random()`,
  - `random(min, max)`;
- global `combat_turn_limit` config + `get_combat_turn_limit()` helper;
- opponent families/definitions/stat values/natural attack sources;
- opponent equipment blueprint entries using `equipment_slot_definitions`;
- encounter/trial combat candidate tables;
- relational combat result snapshot tables;
- snapshot persistence RPC:
  - `persist_combat_result_snapshot(...)`;
- snapshot read helper:
  - `can_read_combat_result(...)`;
- opponent admin/balancer RPCs:
  - `upsert_combat_opponent_family(...)`,
  - `deactivate_combat_opponent_family(...)`,
  - `upsert_combat_opponent_definition(...)`,
  - `deactivate_combat_opponent_definition(...)`,
  - `upsert_combat_opponent_stat_value(...)`,
  - `delete_combat_opponent_stat_value(...)`,
  - `upsert_combat_opponent_attack_source(...)`,
  - `deactivate_combat_opponent_attack_source(...)`,
  - `upsert_combat_opponent_equipment_entry(...)`,
  - `deactivate_combat_opponent_equipment_entry(...)`;
- combat explainability dictionaries:
  - `combat_source_type_definitions`,
  - `combat_side_definitions`,
  - `combat_outcome_definitions`,
  - `combat_participant_kind_definitions`,
  - `combat_attack_source_kind_definitions`,
  - `combat_candidate_kind_definitions`,
  - `combat_opponent_equipment_mode_definitions`,
  - enriched `equipment_slot_definitions`.

**Important DB/content note:** starter opponent rows are not required before Epic M frontend work. Current DB may contain zero opponent families/definitions/stat values/attack sources/equipment entries. M12 must support this empty state and let admins create the first family/opponent through canonical RPCs.

**Core combat rules:**

- Combat is turn-limited.
- A turn is a full round of eligible attack slots from both sides, unless one side is defeated earlier.
- Default global combat turn limit is 10 and must be read from DB config/helper, not duplicated in combat result rows.
- If no side is defeated by the limit, outcome is draw.
- Player attack resolution remains:
  1. timing hit,
  2. evasion,
  3. crit,
  4. damage.
- Opponent attacks resolve automatically.
- Attack slots are ordered by `combat_initiative_score`, not by fixed all-A-then-all-B order.
- Tie in initiative is won by the initiating side.
- Equipment is private. Combat reports show attack source label and optional item-like component refs for tooltip/display, not the full equipment loadout.
- Public/private report rendering is a later epic, but `CombatResult` must preserve enough relational snapshot data to reproduce the combat UI later.
- Do not use `hero_derived`.
- Sandbox/admin-test combat may use the Angular combat resolver as a test surface.
- Production gameplay callers (`encounter`, `trial`, `pvp`) must not treat a fully Angular-computed combat result as final authoritative truth unless a caller-specific backend/RPC validation/finalization path explicitly approves that boundary.
- `persist_combat_result_snapshot(...)` is the canonical snapshot persistence contract. It stores a completed result; it does not by itself prove that the result was authoritatively resolved.
- Epic M may build the reusable combat core and sandbox caller first. Real encounter/trial/PvP integration must keep the authority boundary explicit.
- Combat UI/admin tooling must use DB-backed dictionary descriptions for source type, side, outcome, participant kind, attack source kind, candidate kind, opponent equipment mode and equipment slots.
- Raw enum keys/UUIDs may appear only as secondary technical metadata.
- If DB dictionary label/description/helper/admin text is missing or too weak, report the exact table/key/field gap instead of creating permanent hardcoded Angular explanations.

---

## Task M0 — Align generated DB types after Epic M schema foundation

**Status:** Done / accepted on 2026-05-02.

**Goal:** Make the frontend aware of the current combat DB foundation.

**Scope:**

- Confirm regenerated `database.types.ts` includes combat enums:
  - `combat_side`,
  - `combat_outcome`,
  - `combat_source_type`,
  - `combat_participant_kind`,
  - `combat_attack_source_kind`,
  - `combat_opponent_equipment_mode`,
  - `combat_candidate_kind`.
- Confirm generated types include combat tables:
  - `combat_opponent_families`,
  - `combat_opponent_definitions`,
  - `combat_opponent_stat_values`,
  - `combat_opponent_attack_sources`,
  - `combat_opponent_equipment_entries`,
  - `combat_opponent_equipment_mode_definitions`,
  - `equipment_slot_definitions`,
  - `encounter_combat_candidates`,
  - `trial_combat_candidates`,
  - `combat_results`,
  - `combat_result_participants`,
  - `combat_result_participant_stats`,
  - `combat_result_attacks`.
- Confirm generated types include combat explainability dictionaries:
  - `combat_source_type_definitions`,
  - `combat_side_definitions`,
  - `combat_outcome_definitions`,
  - `combat_participant_kind_definitions`,
  - `combat_attack_source_kind_definitions`,
  - `combat_candidate_kind_definitions`.
- Confirm generated types include helpers/RPCs:
  - `get_combat_turn_limit()`,
  - `persist_combat_result_snapshot(...)`,
  - `can_read_combat_result(...)`,
  - all M-DB1 combat opponent admin RPCs.
- Do not edit generated DB types manually.
- Do not update status docs before user confirmation.

**Acceptance criteria:**

- Generated types match current schema.
- Generated types include M-DB1, M-DB2 and M-Dict-DB1 additions.
- No frontend model uses raw DB rows directly as final domain models.
- If combat dictionaries/RPCs are missing from generated types, stop and report that database types must be regenerated.

---

## Task M1 — Formula random runtime/editor support

**Status:** Done / accepted on 2026-05-02.

**Goal:** Make seeded random formula blocks executable and explainable.

**Scope:**

- Add runtime support for:
  - `random()` → decimal 0..1,
  - `random(min, max)` → decimal between min and max.
- Do not add separate `randomInt`; integer-like results should use `floor`, `ceil` or `round`.
- Admin formula preview/editor must mark formulas containing random as non-deterministic.
- Add reroll/refresh behavior in preview where applicable.
- Avoid pretending random formulas have stable chart values.
- Keep `balance_formula_blocks` DB-backed; do not hardcode block library as the source of truth.

**Acceptance criteria:**

- `FormulaRuntimeService` can evaluate both random forms.
- Existing deterministic formulas remain stable.
- Admin preview clearly indicates randomized output and allows reroll.
- Formula block library remains DB-backed.

---

## Task M2 — Combat domain contracts

**Status:** Done / confirmed 2026-05-02.

**Goal:** Define reusable combat domain models independent from `/game/combat` sandbox UI.

**Scope:**

- Add domain/types for:
  - combatant input/snapshot,
  - combat result,
  - combat participant side,
  - combat participant kind,
  - combat outcome,
  - combat source type,
  - combat attack source kind,
  - attack plan,
  - attack slot,
  - attack result/event row model.
- Model result from caller perspective without embedding reward/trial/PvP logic.
- Ensure result can later be mapped to:
  - `combat_results`,
  - `combat_result_participants`,
  - `combat_result_participant_stats`,
  - `combat_result_attacks`.
- Domain models should not expose raw generated DB rows as final UI/domain types.

**Acceptance criteria:**

- Combat core types are not declared inside components/facades.
- Combat result can represent initiator victory, defender victory and draw.
- Result contains enough data to persist relational snapshot rows.
- Reports are not implemented in this task.
- Caller-owned consequences are not embedded in combat core.

---

## Task M3 — Hero combatant resolver and critical damage debt

**Status:** Done / confirmed 2026-05-02.

**Goal:** Build a reusable resolver for hero combat values from current hero stats, equipment and bonuses.

**Scope:**

- Reuse existing F11 equipment/bonus pipeline where possible.
- Resolve final combat values on the fly, without `hero_derived`:
  - Health,
  - defense,
  - min/max damage,
  - luck,
  - critical chance,
  - critical damage,
  - evasion chance,
  - attack-relevant item/native values.
- Replace hardcoded crit multiplier `2` with:
  - base critical damage = 50%,
  - plus active `critical_damage` bonuses,
  - multiplier = `1 + criticalDamagePercent / 100`.
- Keep equipment private; only attack source data is carried into combat result/report snapshot.
- If equip/unequip workflow is missing, do not implement it in M. M may consume current equipped state only.

**Acceptance criteria:**

- No `hero_derived` use.
- Hardcoded crit multiplier is removed from final resolver path.
- `critical_damage` bonus target is consumed.
- Existing F11 helpers/services are reused or explicitly rejected with reason.
- Missing equip/unequip workflow is not confused with a combat resolver blocker.

---

## Task M4 — Opponent definitions and combat dictionaries read layer

**Status:** Done / accepted on 2026-05-02.

**Goal:** Add frontend/domain read models for admin-defined combat opponents and DB-backed combat explainability dictionaries.

**Scope:**

- Read/map:
  - `combat_opponent_families`,
  - `combat_opponent_definitions`,
  - `combat_opponent_stat_values`,
  - `combat_opponent_attack_sources`,
  - `combat_opponent_equipment_entries`,
  - `combat_opponent_equipment_mode_definitions`,
  - `equipment_slot_definitions`.
- Read/map combat explainability dictionaries:
  - `combat_source_type_definitions`,
  - `combat_side_definitions`,
  - `combat_outcome_definitions`,
  - `combat_participant_kind_definitions`,
  - `combat_attack_source_kind_definitions`,
  - `combat_candidate_kind_definitions`.
- Preserve:
  - label,
  - description,
  - helper text,
  - admin description,
  - active flag,
  - sort order.
- Family is a simple category/pool: one opponent belongs to one family.
- Handle empty opponent tables as a valid configuration state.

**Acceptance criteria:**

- Admin/balance UI can display opponents with family, equipment mode, stat baselines and natural attacks.
- Combat enum-like values are displayed through DB dictionary labels/descriptions, not raw enum keys.
- No hardcoded family list.
- No hardcoded slot list.
- Empty opponent family/definition lists show useful empty state, not broken admin UI.

**Implementation note:** M4 accepted on 2026-05-02 as a read-layer. Core combat now has `CombatOpponentAdmin`, shared combat opponent read models and mappers, and DB-backed reads for opponent families/definitions/stat baselines/natural attacks/equipment entries/equipment modes/equipment slots plus combat explainability dictionaries. Trial and encounter admin reads reuse the shared mapper instead of keeping feature-local opponent mapping. No UI, forms, direct writes, mutation RPCs, manual smoke or route smoke were added in M4. Follow-up debt: first opponent catalog UI should add readable labels for manual item-generation references and generated bucket profile references, and should distinguish "families exist but no opponent definitions" from a fully empty opponent catalog.

---

## Task M5 — Opponent combatant/loadout resolver

**Status:** Done / accepted on 2026-05-02.

**Goal:** Resolve an admin-defined opponent into a combatant input.

**Scope:**

- Scale opponent stat baselines using:
  - candidate scaling formula override if present,
  - otherwise opponent default scaling formula,
  - otherwise global/default `combat_opponent_scaled_stat` assignment.
- Support `difficultyMultiplier` from encounter/trial candidate.
- Support equipment modes:
  - `none`,
  - `manual` item-like blueprint,
  - `generated` item-like loadout materialized for the fight only.
- Generated NPC equipment must not create rows in `items`.
- Natural attack sources such as Bite, Scratch, Iron Wings or Fist must be supported.
- If no active opponent definitions exist in DB, resolver implementation may still be developed with typed fixtures/domain models, but live UI/manual smoke must report that real content must be created through M12 before live opponent resolution can be demonstrated.

**Acceptance criteria:**

- Same opponent can be used by encounter and trial candidates with different scaling formula/multiplier.
- Generated equipment is materialized once for combat input/snapshot, not rerolled during render/attack.
- No player-owned item is created for NPC equipment.
- Missing combat opponent content is reported as content/configuration gap, not as missing DB/RPC contract.

**Implementation note:** M5 accepted on 2026-05-02 as a read/resolution layer. Core combat now has `CombatOpponentResolver`, typed resolved opponent models, opponent stat scaling through formula assignments/overrides, fight-local generated equipment materialization, manual equipment source snapshots, natural attack source attack-plan slots, and explicit configuration-gap errors for unsupported generated bucket profile integration and opponents with no active attack sources. The resolver stays orchestration-focused; stat resolution, range/level helpers, equipment resolution and attack-plan construction are split into focused helpers. No UI, sandbox/prototype flow changes, player-owned item creation, write/RPC mutation path, manual smoke or route smoke were added in M5.

---

## Task M6 — Attack plan builder

**Status:** Done / accepted on 2026-05-02.

**Goal:** Build concrete attack slots from hero/opponent combatants.

**Scope:**

- Apply weapon/attack plan rules:
  - no weapon = one unarmed attack,
  - one one-handed weapon + empty off-hand = weapon attack + unarmed attack,
  - one-handed weapon + shield = one weapon attack,
  - dual wield = one attack from each weapon,
  - two-handed = one attack unless item-native data says otherwise,
  - ranged = two-handed, attack count from item-native `attack_count`,
  - natural attack sources contribute configured attack slots.
- Carry attack source labels and optional item-like components into attack slots.
- Do not expose full equipment in report-oriented output.
- Use `combat_attack_source_kind_definitions` when displaying attack source kind in admin/sandbox/report-adjacent UI.

**Acceptance criteria:**

- Attack plan is reusable for hero, opponent and future PvP.
- Shields do not create attacks.
- Natural sources and item-like sources are distinguishable.
- Attack source kind display uses DB-backed dictionary text where visible.

**Implementation note:** M6 accepted on 2026-05-02. Core combat now has a reusable canonical attack plan builder, domain input contracts for attack-source planning, a hero/equipped-item attack-source adapter, and opponent attack-plan construction using the same shared builder. The hero adapter implements unarmed, one-handed, shield, dual-wield, two-handed/ranged and item-native `attack_count` behavior without touching the prototype `/game/combat` flow. Shared item catalog lookup helpers are used by both equipment bonus resolution and attack-source materialization to avoid private-helper duplication. M6 added no UI, no sandbox/prototype behavior changes, no write/RPC paths, no manual smoke and no route smoke.

---

## Task M7 — Initiative and turn order

**Status:** Done / accepted on 2026-05-02.

**Goal:** Order attack slots using the DB formula target `combat_initiative_score`.

**Scope:**

- Evaluate initiative per attack slot using:
  - `combatantIntelligence`,
  - `combatantAgility`,
  - `attackIndex`,
  - `attackCount`.
- Sort slots descending by initiative score.
- Initiator wins tie.
- One combat turn consists of all eligible slots from both sides, unless someone dies earlier.
- Formula target/formula labels and descriptions should be shown in admin preview/tooling where applicable.
- Preview must explain:
  - higher score acts earlier,
  - tie-breaker is outside the formula,
  - formula assignment is DB-backed.

**Acceptance criteria:**

- Multiattack participants can have interleaved attack order.
- Formula assignment is read from DB; no hardcoded initiative expression as source of truth.
- Random initiative formulas work once M1 random runtime support exists.
- Admin can understand why the sample order is produced.

**Implementation note:** M7 accepted on 2026-05-02. Core combat now has `CombatInitiativeOrderService`, which reads the assigned `combat_initiative_score` formula through `FormulaService`, evaluates each attack slot with `combatantIntelligence`, `combatantAgility`, `attackIndex` and `attackCount`, orders slots by descending score, and applies the initiator tie-breaker outside the formula. The result includes formula metadata and explanation text so admin/preview tooling can show why a sample order was produced. M7 added no UI, no sandbox/prototype flow changes, no write/RPC mutation path, no manual smoke and no route smoke.

---

## Task M8 — Core combat resolver with slot execution

**Status:** Done / accepted on 2026-05-02.

**Goal:** Replace sandbox-only alternating flow with reusable turn-limited slot execution.

**Scope:**

- Keep Walking Dead timing helpers for player-controlled attack timing.
- Resolve each attack in sequence:
  1. timing hit when applicable,
  2. evasion,
  3. crit,
  4. damage roll/final damage,
  5. health update.
- Opponent/automatic attacks do not require real-time UI interaction.
- End combat on initiator victory, defender victory or draw.
- Use `get_combat_turn_limit()` or equivalent DB-backed config path for limit.
- Use `combat_outcome_definitions` and `combat_side_definitions` for admin/sandbox result display where visible.

**Acceptance criteria:**

- Resolver is reusable outside `/game/combat` page.
- Draw happens only after the global turn limit.
- Minimum successful non-evaded final damage remains enforced.
- Critical damage percent is used instead of hardcoded x2.
- Resolver is suitable for sandbox/admin-test and for producing deterministic domain result objects.
- Any future production integration must explicitly state whether the result is backend-authoritative, backend-validated, or sandbox/client-only.

**Implementation note:** M8 accepted on 2026-05-02. Core combat now has `CombatCoreResolverService` for reusable slot execution over canonical combat inputs. The service loads `get_combat_turn_limit()` through `RPC.get_combat_turn_limit`, reads DB-backed combat formula assignments, uses M7 initiative order, validates invalid turn-limit configuration, and delegates turn loop, attack resolution, formula context, and result/event snapshot mapping to focused pure helpers. Timing inputs are keyed by turn, final non-evaded damage is clamped to at least 1, critical damage uses percent multiplier semantics, and opponent formula bonuses use a named default helper. M8 added no UI, no sandbox/prototype flow changes, no result persistence, no manual smoke and no route smoke.

---

## Task M9 — Persist combat result snapshot through canonical RPC

**Goal:** Persist completed reusable combat results through the canonical DB/RPC snapshot contract.

**DB/RPC foundation status:** Available after M-DB2.

Current canonical RPC/helper surface:

- `persist_combat_result_snapshot(...)`,
- `can_read_combat_result(...)`,
- `get_combat_turn_limit()`.

Current snapshot tables:

- `combat_results`,
- `combat_result_participants`,
- `combat_result_participant_stats`,
- `combat_result_attacks`.

**Scope:**

- Replace any planned/direct table insert flow for combat result persistence with `persist_combat_result_snapshot(...)`.
- Map the completed combat core result into the RPC payload:
  - `server_id`,
  - `source_type`,
  - optional `source_entity_id`,
  - outcome,
  - turns completed,
  - participant snapshots JSON,
  - attack history JSON,
  - started/completed timestamps where available,
  - reason/request id where available.
- Preserve the core Epic M rule:
  - Combat produces a result.
  - The caller interprets rewards, trial completion, PvP consequences, cooldowns and report publishing.
  - M9 must not grant rewards, complete trials, apply PvP consequences or create public reports.
- Participant snapshot mapping must include:
  - side,
  - participant kind,
  - hero id or opponent definition id where applicable,
  - display name,
  - level,
  - Health start/end/max,
  - defense,
  - min/max damage,
  - luck,
  - critical chance,
  - critical damage,
  - evasion chance,
  - stat snapshots.
- Attack snapshot mapping must include:
  - turn number,
  - attack order,
  - actor side,
  - target side,
  - attack slot index,
  - attack source kind,
  - attack source label,
  - optional player item id / quality / base / prefix / suffix component refs,
  - optional opponent attack source id,
  - timing hit,
  - evaded,
  - critical,
  - critical damage,
  - rolled damage,
  - final damage,
  - target Health before/after,
  - display text.
- Do not store or expose the full equipment loadout.
- Do not recompute persisted results from live hero/opponent state after persistence.
- Use `get_combat_turn_limit()` for limit alignment where the frontend still needs to display or validate the limit.
- Add domain mappers/helpers for converting combat core result models into the RPC payload.
- Keep domain models outside components/facades.
- Use generated Supabase types, but do not expose raw generated DB rows as final domain models.
- For `sandbox` / `admin_test`, M9 may persist a result produced by the reusable frontend combat core for testing and balancing.
- For production gameplay source types (`encounter`, `trial`, `pvp`), do not silently persist arbitrary Angular-computed combat results as authoritative gameplay truth. If the current task reaches real gameplay integration and no backend/RPC validation/finalization boundary exists, report this as a production-authority blocker instead of pretending M9 fully solves it.
- Treat `persist_combat_result_snapshot(...)` as snapshot persistence, not reward/trial/PvP finalization and not anti-cheat validation.
- When displaying persisted snapshots in admin/sandbox tooling, use:
  - `combat_source_type_definitions`,
  - `combat_side_definitions`,
  - `combat_outcome_definitions`,
  - `combat_participant_kind_definitions`,
  - `combat_attack_source_kind_definitions`.

**Acceptance criteria:**

- Completed combat result is persisted by calling `persist_combat_result_snapshot(...)`.
- No Angular direct insert/update into `combat_results`, `combat_result_participants`, `combat_result_participant_stats` or `combat_result_attacks`.
- Persisted result can be rendered later without recomputing live hero/opponent state.
- Combat reports can later use snapshot rows for attack order, source label, hit/evasion/crit/damage and Health changes.
- Full equipment remains private; attack source label/component refs are the only public/report-ready attack-source data carried forward.
- M9 does not create game reports, grant rewards, complete trials or apply PvP consequences.
- Snapshot/admin display does not rely on raw combat enum keys as primary labels.
- Build passes.
- Smoke report explains:
  - which combat caller was used,
  - which source type was persisted,
  - whether the RPC returned a combat result id,
  - whether participant/stat/attack counts match the combat result,
  - which smoke steps remain pending due to missing real gameplay data.

---

**Implementation note:** M9 accepted on 2026-05-02. Combat result persistence now goes through `CombatResultSnapshotsService` and `RPC.persist_combat_result_snapshot` only. The mapper converts completed canonical combat results to participant/stat/attack JSON payloads, normalizes empty returned `source_entity_id` to `null`, keeps full equipment private, and does not add rewards, trial completion, PvP consequences, notifications or reports. Production gameplay source types require an explicit backend validation/finalization authority boundary before snapshot persistence. Verification passed: `npx tsc --noEmit`, focused M9 specs with 6 SUCCESS, static grep checks for no direct writes/consequence paths, and `npm run build` with known budget/CommonJS warnings. Manual smoke and route smoke were not run by Codex.

**Related compile-only note:** The M9 acceptance window also included a minimal Epic O type-drift hotfix after DB type regeneration. Active building frontend code now uses the seconds-based build-time contract (`base_build_time_seconds`, `baseBuildTimeSeconds`, `nextUpgradeTimeSeconds`, `getUpgradeTimeSeconds(...)`) and no longer uses active legacy `base_build_time_minutes` / `baseBuildTimeMinutes` or `building_requirements` / `buildings.requirements` references outside generated types. This is not full Epic O UI/read-layer alignment; pending O follow-up is central `entity_requirements` / `requirement_definitions` integration for building requirements.

---

## Task M10 — Thin sandbox combat caller

**Status:** Done / accepted on 2026-05-02.

**Goal:** Keep `/game/combat` as a sandbox/test caller using the reusable combat core.

**Scope:**

- Remove page-facade ownership of core combat rules where possible.
- Sandbox may still create demo/admin-test inputs, but should call the same resolver path.
- Keep current Walking Dead UI behavior where it remains useful.
- Sandbox UI should use combat dictionaries for source/outcome/side/participant/attack-source labels when displaying result summaries.
- Do not integrate exploration/trial/PvP consequences in this task.

**Acceptance criteria:**

- `/game/combat` remains usable as a test surface.
- Core rules are no longer trapped in page-specific state.
- No exploration/trial/PvP integration is required in this task.
- Sandbox result display does not rely on raw combat enum keys as primary UX.

**Implementation note:** M10 accepted on 2026-05-02. `/game/combat` remains a temporary Walking Dead timing test surface for the canonical combat core, not the target production combat UI. One strike resolves only the current player timing action plus the enemy response through the canonical step path; if the fight has not naturally ended, the meter returns for the next player action. The slice keeps persistence, rewards, trial/exploration/PvP consequences, reports and production combat UI scope out of M10. User manual smoke passed; Codex did not run manual smoke or route smoke. Technical verification passed with `npx tsc --noEmit`, focused combat page/caller/step/core specs and `npm run build` with known budget/CommonJS warnings.

---

## Task M11 — Combat admin/balance tooling foundation

**Status:** Done / accepted on 2026-05-02.

**Goal:** Add admin/balance UI surfaces needed to test combat foundation.

**Scope:**

- Opponent family/definition/stat/natural attack read views.
- Candidate read views for encounter/trial combat candidates.
- Initiative preview:
  - user enters stats and attack counts for two sides,
  - sees a sample attack order,
  - sees formula target/formula explanation.
- If formula uses random, preview supports reroll/refresh.
- Use combat explainability dictionaries in all combat admin/balance tooling:
  - source type,
  - side,
  - outcome,
  - participant kind,
  - attack source kind,
  - candidate kind,
  - opponent equipment mode,
  - equipment slot.
- Initiative preview must explain:
  - what `combat_initiative_score` controls,
  - which variables are used,
  - that higher score acts earlier,
  - that tie-breaker is handled by combat ordering logic, not by the formula itself.
- Candidate read views must explain candidate kind using `combat_candidate_kind_definitions`.
- Attack/source previews must explain attack source kind using `combat_attack_source_kind_definitions`.

**Acceptance criteria:**

- Admin can inspect opponent/candidate setup without raw-key-only UI.
- Initiative preview explains the sample order in gameplay terms.
- Admin can understand candidate/source labels without knowing raw enum keys.
- Combat admin tooling uses DB-backed dictionary text for explainability.
- This task does not implement full report sharing.

**Implementation note:** M11 accepted on 2026-05-02 after user-side smoke. Added read-only `/admin/combat-balance` for opponent/candidate inspection and `combat_initiative_score` sample preview. The page reuses canonical combat opponent read models, DB-backed combat dictionaries, `CombatInitiativeOrderService`, and real PrimeNG controls with reactive forms. Initiative preview is explicitly a sample order for one evaluation/reroll; current core combat evaluates initiative once before the turn loop, so per-turn random initiative recomputation remains a M7/M8 follow-up if design requires it. M11 did not add writes, persistence, rewards, reports, trial/exploration/PvP consequences or `/game/combat` changes. Codex did not run manual smoke or route smoke.

---

## Task M12 — Combat opponent definitions admin configurator

**Status:** Done / accepted on 2026-05-03.

**Goal:** Add a write-capable admin/balancer UI for configuring reusable combat opponent definitions used by encounter and trial combat candidates.

**DB/RPC foundation status:** Available after M-DB1 and M-Dict-DB1.

Current canonical RPC surface:

- `upsert_combat_opponent_family(...)`,
- `deactivate_combat_opponent_family(...)`,
- `upsert_combat_opponent_definition(...)`,
- `deactivate_combat_opponent_definition(...)`,
- `upsert_combat_opponent_stat_value(...)`,
- `delete_combat_opponent_stat_value(...)`,
- `upsert_combat_opponent_attack_source(...)`,
- `deactivate_combat_opponent_attack_source(...)`,
- `upsert_combat_opponent_equipment_entry(...)`,
- `deactivate_combat_opponent_equipment_entry(...)`.

Frontend must use these RPCs. Do not direct-write combat opponent tables from Angular.

**Scope:**

- Add or extend an admin/balancer page/section for combat opponents, preferably under the Game Balance admin group.
- The page must support empty DB state:
  - if no opponent families/definitions exist, show a clear empty state;
  - allow creating the first family/opponent through canonical RPCs;
  - do not treat empty opponent tables as DB blocker.
- Load and display `combat_opponent_families`:
  - key,
  - label,
  - description,
  - helper text,
  - admin description,
  - active flag,
  - sort order.
- Allow creating/updating/deactivating opponent families through canonical family RPCs.
- Load and display `combat_opponent_definitions`:
  - opponent key,
  - label/name,
  - description,
  - helper text,
  - admin description,
  - family,
  - equipment mode,
  - default scaling formula,
  - active flag,
  - sort order.
- Allow creating/updating/deactivating opponent definitions through canonical opponent definition RPCs.
- Show and manage baseline stat values from `combat_opponent_stat_values`:
  - stat picker from canonical `stats`,
  - readable stat label/description,
  - base value,
  - sort order if used by current schema/read model.
- Stat values must use:
  - `upsert_combat_opponent_stat_value(...)`,
  - `delete_combat_opponent_stat_value(...)`.
- Show and manage natural attack sources from `combat_opponent_attack_sources`.
- Important corrected rule:
  - `combat_opponent_attack_sources` does **not** have an attack-source-kind field;
  - treat these rows as natural/non-equipment opponent attack sources.
- Natural attack source fields:
  - key,
  - label,
  - description,
  - helper text,
  - admin description,
  - min/max opponent level,
  - attack count,
  - min/max damage,
  - critical chance,
  - critical damage,
  - active flag,
  - sort order.
- Natural attack source mutations must use:
  - `upsert_combat_opponent_attack_source(...)`,
  - `deactivate_combat_opponent_attack_source(...)`.
- Show and manage opponent equipment entries from `combat_opponent_equipment_entries`.
- Opponent-level `equipment_mode` supports:
  - `none`,
  - `manual`,
  - `generated`.
- Equipment-entry-level `entry_mode` supports:
  - `manual`,
  - `generated`.
- Equipment entry UI must use DB-backed dictionaries/read models:
  - slots from `equipment_slot_definitions`,
  - qualities from item generation quality definitions,
  - bases from item generation base definitions,
  - prefix/suffix affixes from item generation affix definitions,
  - generated bucket profiles from item generation bucket profiles,
  - formulas from formula read/search helpers where applicable.
- Manual equipment entry fields:
  - slot,
  - level range where available,
  - quality,
  - base,
  - optional prefix,
  - optional suffix.
- Generated equipment entry fields:
  - slot,
  - level range where available,
  - generated bucket profile,
  - generated max quality.
- Equipment entries must not create player-owned `items`.
- Generated opponent equipment is fight-local only and must be described that way in the UI.
- Formula picker must use formula labels/search/read helpers where available, not raw UUID-only entry.
- Load and use combat explainability dictionaries:
  - `combat_candidate_kind_definitions` for candidate kind labels/help,
  - `combat_attack_source_kind_definitions` where attack source kinds are displayed,
  - `combat_opponent_equipment_mode_definitions` for opponent equipment mode,
  - `equipment_slot_definitions` for equipment slot labels/help,
  - formula target/formula labels/descriptions for scaling formula selectors.
- Show DB-backed `description`, `helper_text`, and `admin_description` near relevant form sections.
- The page must explain:
  - family = grouping/selection pool;
  - opponent definition = reusable NPC identity and default scaling/equipment mode;
  - stat values = baseline values before scaling;
  - natural attack sources = non-equipment attack slots configured on the opponent;
  - equipment mode = whether opponent uses no equipment, manual blueprint or generated fight-local loadout;
  - equipment entries = fight-local item-like blueprint/loadout sources, not player-owned items;
  - scaling formula = how baseline values change for concrete encounter/trial usage;
  - difficulty multiplier = candidate-level multiplier applied in that concrete context.
- Technical keys/UUIDs may appear as secondary metadata only.
- Reason is mandatory for all durable admin mutations.
- Use PrimeNG tabs/sections or another existing project pattern so the page does not become one long, hard-to-use form.
- Reuse existing admin/shared helpers where possible:
  - metadata/JSON display helpers,
  - dictionary option mappers,
  - reason form patterns,
  - RPC error display patterns,
  - stale request guards.
- If generated `database.types.ts` does not include M-DB1/M-Dict-DB1 functions/tables, stop and report that DB types must be regenerated.
- Do not invent large permanent Angular explanations for combat dictionaries if DB dictionary text is missing or weak.
- If a required DB-backed description is missing after accepted seed cleanup, report the exact table/key/field gap.
- M12 must load `ui_metadata_entries` with namespace `combat_opponent_configurator_section` and use those rows for section/page intros. Field labels may remain local/i18n for now, but domain dictionary rows and section metadata must explain runtime meaning and impact.

**Acceptance criteria:**

- Admin can create the first combat opponent family/definition from an empty database state.
- Admin can inspect and configure combat opponent families and opponent definitions.
- Admin can define baseline stats for opponents.
- Admin can define natural attack sources for non-equipped or additionally equipped opponents.
- Admin can configure no/manual/generated equipment modes without creating normal player-owned item rows.
- Encounter/trial candidate configurators can reuse these opponents/families as selectable content.
- UI uses DB dictionaries for:
  - combat candidate kind,
  - attack source kind where displayed,
  - opponent equipment mode,
  - stats,
  - slots,
  - item-generation components,
  - formulas,
  - bucket profiles.
- Admin can understand runtime meaning of:
  - family,
  - opponent definition,
  - stat baseline,
  - natural attack source,
  - equipment mode,
  - equipment entry,
  - scaling formula,
  - difficulty multiplier.
- Mutations use approved RPC/governance path only.
- No direct Angular writes to:
  - `combat_opponent_families`,
  - `combat_opponent_definitions`,
  - `combat_opponent_stat_values`,
  - `combat_opponent_attack_sources`,
  - `combat_opponent_equipment_entries`.
- Build passes.
- Smoke report distinguishes:
  - empty state,
  - family creation/update/deactivation,
  - opponent definition creation/update/deactivation,
  - stat value upsert/delete,
  - natural attack source upsert/deactivation,
  - manual equipment entry upsert/deactivation,
  - generated equipment entry upsert/deactivation,
  - and explains how configured opponent content affects combat encounters/trials.

**Implementation note:** M12 accepted on 2026-05-03 after user-side smoke. Added write-capable `/admin/combat-opponents` under admin Game Balance for combat opponent families, opponent definitions, baseline stats, natural attacks and equipment entries. Durable mutations use the canonical combat opponent RPCs only; Angular does not direct-write `combat_opponent_*` tables. The configurator supports empty opponent content, DB-backed section metadata, DB-backed combat/equipment/item-generation/formula options, full baseline stat grid with missing stats treated as default `0`, row-safe stat upsert/delete, bulk stat baseline save, and a reusable `AdminReasonPresetField` reason preset pattern. Equipment entries remain fight-local blueprints/loadouts and do not create player-owned `items`. The remaining equipment slot read issue found during smoke was resolved by a database/RLS fix for `equipment_slot_definitions`; no hardcoded frontend fallback slots were added. Follow-ups are not M12 blockers: apply `AdminReasonPresetField` to the remaining M12 reason fields for consistency, broader UI polish for native-looking inputs where global PrimeNG/theme styles are inconsistent, optional later refactor of large shared files (`combat-opponent-admin.ts`, `combat-opponent.model.ts`), and future UX/configurator layout refinement. Verification passed with `npx tsc --noEmit`, focused M12 specs, static greps for no direct combat opponent writes/no hardcoded slot fallback/no `label > p-select`/no durable M12 `any`, and `npm run build` with known budget/CommonJS warnings. Manual smoke was performed by the user and passed; Codex did not run manual smoke or route smoke.

---

### Epic M admin configuration completeness / explainability rule

Epic M must expose the full admin/balancer configuration surface for combat opponents introduced or consumed by this epic.

Admin UI must not be a raw table editor. It must explain how each configured object affects combat runtime:

- opponent family controls grouping/selection pools;
- opponent definition controls reusable NPC identity and default scaling/equipment mode;
- stat values define baseline opponent combat stats before scaling;
- natural attack sources define non-equipment attack slots;
- equipment entries define fight-local manual/generated item-like attack/defense sources and must not create player-owned items;
- scaling formulas and difficulty multipliers affect how the same opponent behaves in trial/encounter contexts.

This rule is backed by DB dictionaries. M UI should consume, not duplicate, explanatory text from:

- `combat_source_type_definitions`;
- `combat_side_definitions`;
- `combat_outcome_definitions`;
- `combat_participant_kind_definitions`;
- `combat_attack_source_kind_definitions`;
- `combat_candidate_kind_definitions`;
- `combat_opponent_equipment_mode_definitions`;
- `equipment_slot_definitions`;
- relevant formula targets/formulas;
- combat opponent family/definition/attack/equipment rows.

Raw keys/UUIDs may appear as secondary metadata only.

If these dictionaries are missing from generated types, regenerate database types before frontend work. If a dictionary row is missing or weak after accepted DB seed cleanup, report the exact table/key/field gap instead of hiding it with permanent hardcoded Angular copy.

---

# Epic N — Stats and progression

Epic N implements frontend/domain/admin integration over the current DB/RPC stats and progression foundation.

Epic N must follow the current DB/RPC reality, not the old placeholder version.

Current source of truth:

- stat allocation already uses canonical DB/RPC workflow from G6: `save_stat_allocation(...)`;
- frontend must not write directly to `hero_stats`, `hero.character_points`, `hero.experience`, `hero.level`, `character_point_ledger`, `hero_progression_ledger` or audit tables;
- stat upgrade cost and stat cap formulas already exist:
  - `hero_stat_upgrade_cost`;
  - `hero_stat_level_cap`;
- XP to next level is formula-backed through `hero_experience_to_next_level`;
- `get_hero_experience_to_next_level(...)` exists as a DB helper/read RPC for XP threshold display;
- `grant_hero_experience(...)` exists as the canonical XP/level-up workflow;
- `hero.experience` is current XP progress toward next level;
- `hero.total_experience_earned` is lifetime XP;
- `hero_progression_ledger` is the append-only XP/progression ledger;
- XP always grants equal gross Character Points;
- positive reward/progression Character Point gains flow through the CP penalty sink;
- level-up reward routing exists through `reward_profile_assignments` level matching;
- level-up stat bonus rules and grant history exist;
- `critical_damage` is now a runtime derived/combat stat and active bonus target;
- runtime derived/special stats must be resolved on the fly and must not reintroduce `hero_derived`;
- progression/admin metadata exists under progression-oriented `ui_metadata_entries` namespaces seeded by N-DB4.

**Epic rule:** Do not implement a second stat allocation workflow. Do not implement a second XP/level-up workflow. Do not hardcode progression formulas. Do not reintroduce `hero_derived`. Treat formula assignments, derived stat definitions, progression ledgers, level-up reward routing and stat bonus rules as DB-backed balance/runtime configuration.

---

## Task N0 — Align generated DB types after Epic N DB foundation

**Status:** Done / accepted on 2026-05-03 as completed preflight.

**Goal:** Make frontend aware of the current progression DB/RPC foundation.

**Scope:**

- Regenerate/update generated Supabase database types after N DB/RPC migrations.
- Confirm generated types include:
  - `hero.character_points`;
  - `hero.total_character_points_earned`;
  - `hero.experience`;
  - `hero.total_experience_earned`;
  - `hero.level`;
  - `character_point_ledger`;
  - `hero_progression_ledger`;
  - `reward_level_match_kinds`;
  - `reward_profile_assignments.level_match_kind`;
  - `reward_profile_assignments.level_value`;
  - `reward_profile_assignments.max_level_value`;
  - `reward_profile_assignments.level_interval`;
  - `level_up_stat_bonus_rules`;
  - `level_up_stat_bonus_rule_stats`;
  - `hero_level_stat_bonus_grants`;
  - current `save_stat_allocation(...)` RPC signature;
  - `get_hero_experience_to_next_level(...)`;
  - `grant_hero_experience(...)`;
  - `grant_level_up_reward_to_hero(...)`;
  - `upsert_level_up_stat_bonus_rule(...)`;
  - `upsert_level_up_stat_bonus_rule_stat(...)`;
  - current `derived_stat_definitions` / `critical_damage` read surfaces.
- Confirm formula read models can see:
  - `hero_stat_upgrade_cost`;
  - `hero_stat_level_cap`;
  - `hero_experience_to_next_level`.
- Do not edit generated DB types manually.
- Do not update status docs before user confirmation.

**Acceptance criteria:**

- Generated types match current schema/RPC signatures.
- Missing progression tables/functions are reported before UI implementation.
- No frontend model uses raw DB rows directly as final domain models.
- No docs/status files are updated before user confirmation.
- Build/typecheck passes where applicable.

**Implementation note:** N0 accepted on 2026-05-03 as a completed preflight. Current generated Supabase types expose the Epic N progression schema/RPC surface required for frontend follow-up work, including hero XP/CP fields, `character_point_ledger`, `hero_progression_ledger`, level-up reward matching fields, level-up stat bonus rule/grant tables, `save_stat_allocation(...)`, `get_hero_experience_to_next_level(...)`, `grant_hero_experience(...)`, `grant_level_up_reward_to_hero(...)`, level-up stat bonus rule RPCs and `critical_damage` derived stat surfaces. No generated types were edited manually. Frontend stat allocation and derived stat paths continue to map DB/RPC rows into explicit domain/read models instead of using raw rows as final UI contracts. Verification passed with `npx tsc --noEmit`, focused progression/hero/derived-stat specs and `npm run build` with known budget/CommonJS warnings. Follow-up before relying on live balancing content: verify actual `balance_formula_targets`, `balance_formulas` and assignment rows for `hero_experience_to_next_level`, `hero_stat_upgrade_cost` and `hero_stat_level_cap`; generated TypeScript confirms schema/RPC signatures, not seeded formula content or active assignments.

---

## Task N1 — Terminology cleanup: Health vs Character Points

**Status:** Done / accepted on 2026-05-03.

**Goal:** Normalize player-facing and domain terminology so Health and Character Points are not confused.

**Scope:**

- Use `Health` for hit points.
- Use `Character Points` consistently for progression/trade currency unless final product naming changes.
- Replace legacy Hero Points / PR wording only where touched and safe.
- Keep `drachma`, `materials`, `workforce` separate from Character Points.
- Do not rename DB columns.

**Acceptance criteria:**

- UI/domain terms reduce HP/CP confusion.
- Player-facing labels do not call Character Points “Health”, “HP”, “Hero Points” or “PR” in newly touched surfaces.
- No schema assumptions are changed.
- Build passes where code changes are made.

**Implementation note:** N1 accepted on 2026-05-03. Active player/admin UI labels now use `Character Points` instead of `CP`, `Hero Points` or `PR` in the touched progression, auction/trade and anti-abuse penalty surfaces. Dashboard Health display uses `Health` instead of `HP`. `AttributeAllocationPageFacade` now uses `characterPoints`, `remainingCharacterPoints` and `spentCharacterPoints` naming. No DB/RPC contract, schema assumptions or progression/ledger write paths were changed. Verification passed with `npx tsc --noEmit`, focused stat allocation/hero/anti-abuse specs, static greps for legacy HP/CP/Hero Points/PR terminology in active `src/app` paths and direct progression/ledger writes, and `npm run build` with known budget/CommonJS warnings. Pending visual smoke: attributes, dashboard, auction/trade and anti-abuse penalty sections should be checked manually for layout regressions caused by longer `Character Points` labels.

---

## Task N2 — Stat allocation alignment with existing RPC

**Status:** Done / accepted on 2026-05-03.

**Goal:** Ensure stat allocation UI uses the existing canonical DB workflow.

**Scope:**

- Use `save_stat_allocation(...)` for final save.
- Keep plus/minus draft changes local and unaudited.
- Map RPC result into an explicit domain result.
- Refresh hero stats and Character Points after successful save.
- Surface DB/RPC validation errors as user-readable messages.
- Preserve current active hero/server loading rules.
- Do not assume `hero.id === auth.uid()`.

**Acceptance criteria:**

- No direct frontend writes to `hero_stats`.
- No direct frontend writes to `hero.character_points`.
- No direct frontend writes to `character_point_ledger`.
- Final save is auditable through DB workflow.
- UI draft clicks are not audited.
- Build and focused tests pass.

**Implementation note:** N2 accepted on 2026-05-03 after DB-side blocker fix and user smoke. The `/hero/attributes` save path remains canonical through `save_stat_allocation(...)`; no frontend fallback or direct writes to `hero_stats`, `hero.character_points`, `character_point_ledger` or `hero_progression_ledger` were introduced. Frontend follow-up kept `saveProgressionDraft(...)` on the active hero context and added a stale-result guard so `AuthState.hero().characterPoints` refreshes only when the RPC result matches the current active `heroId` and `serverId`. The DB blocker was fixed in `save_stat_allocation(...)` without changing the RPC contract: the ambiguous `hero_id` conflict with the `RETURNS TABLE(hero_id uuid, ...)` output parameter was resolved by using `ON CONFLICT ON CONSTRAINT hero_stats_pkey`. Verification passed with `npx tsc --noEmit`, focused stat allocation/hero specs, static greps for no direct progression writes and no `auth.uid()`/user-id hero assumption in the stat allocation path, and `npm run build` with known budget/CommonJS warnings.

---

## Task N3 — Stat upgrade cost formula usage audit/fix

**Status:** Done / accepted on 2026-05-03.

**Goal:** Ensure stat upgrade costs use the existing DB formula target.

**Scope:**

- Use `hero_stat_upgrade_cost` through current formula assignment resolver.
- Pass the expected variables:
  - `heroLevel`;
  - `level`;
  - `statLevel`.
- Remove or isolate old hardcoded cost fallback.
- Keep formula preview/admin behavior consistent with formula governance.
- Missing/disabled formula assignment should be a configuration error or explicit technical fallback, not silently hidden as normal state.

**Acceptance criteria:**

- Upgrade costs are formula-driven.
- Missing/disabled formula assignment is surfaced clearly.
- UI explains why an upgrade cannot be calculated when formula config is broken.
- Build and focused tests pass.

**Implementation note:** N3 accepted on 2026-05-03 after code review. Stat upgrade costs remain DB/formula-backed through `StatProgressionService.getRules()` and `resolveAssignedFormula(...)` for `hero_stat_upgrade_cost`; no local fallback expression, DB/RPC change or direct write path was introduced. Runtime formula context passed into `evaluateNextLevelCost(...)` / `getNextLevelCost(...)` includes `heroLevel`, `level` and `statLevel`. `/hero/attributes` no longer masks an unavailable cost as `0` spent Character Points: spent/remaining Character Points become `Unavailable`, save is blocked through `canSaveDraft()`, and row-level errors expose the exact formula/configuration issue. Verification passed with `npx tsc --noEmit`, focused stat progression/allocation/hero specs, static greps for no direct progression writes and formula target/context usage, and `npm run build` with known budget/CommonJS warnings. Follow-up: future UI polish can surface the first exact row-level cost error in the summary instead of the current generic `characterPointSummaryError()`.

---

## Task N4 — Stat level cap formula usage audit/fix

**Status:** Done / accepted on 2026-05-03.

**Goal:** Ensure stat caps use the existing DB formula target.

**Scope:**

- Use `hero_stat_level_cap` through current formula assignment resolver.
- Pass `heroLevel`.
- Ensure allocation UI prevents or clearly blocks saves above cap.
- Ensure DB/RPC validation remains source of truth for final save.
- Do not use hardcoded cap values as normal runtime truth.

**Acceptance criteria:**

- Stat cap is formula-driven.
- UI cap messaging is understandable.
- Final save cannot bypass DB/RPC cap validation.
- Build and focused tests pass.

**Implementation note:** N4 accepted on 2026-05-03 after user smoke and code review. `/hero/attributes` displays `Stat level cap`, keeps next-level costs visible, shows cap-reached messaging for capped stats, and blocks increases when Character Points are unavailable. The cap path remains formula-driven through `StatProgressionService.getRules()` and `resolveAssignedFormula(...)` for `hero_stat_level_cap`, with `heroLevel` passed into cap evaluation. No local fallback expression, DB/RPC change, migration or direct write path was introduced; final save remains through `Hero.saveProgressionDraft(...)` / `save_stat_allocation(...)`. Verification passed with `npx tsc --noEmit`, focused stat progression/allocation/hero specs, static greps for no direct progression writes/no new `any`/no `label > p-select`, and `npm run build` with known budget/CommonJS warnings. Follow-up: `attribute-allocation-page.facade.ts` is 362 lines and should be split in a later refactor; this is not an N4 blocker.

---

## Task N5 — XP and level display over current DB/RPC contract

**Status:** Done / accepted on 2026-05-03.

**Goal:** Display hero XP/level progression using the current canonical DB/RPC foundation.

**Scope:**

- Read:
  - `hero.level`;
  - `hero.experience`;
  - `hero.total_experience_earned`;
  - current XP threshold via `get_hero_experience_to_next_level(...)` or approved read model.
- Use `hero.experience` as current progress toward next level.
- Use `hero.total_experience_earned` only as lifetime total/history metric.
- Do not hardcode XP thresholds in Angular.
- Show clear loading/error states when formula/RPC threshold evaluation fails.
- Do not mutate XP or level from display code.

**Acceptance criteria:**

- XP-to-next-level display uses DB/RPC/formula-backed threshold.
- Admin/balancer can change XP formula without frontend code change.
- Formula/RPC errors are visible and not silently replaced by unrelated thresholds.
- Display distinguishes current XP progress from lifetime XP.
- Build passes.

**Implementation note:** N5 accepted on 2026-05-03 after DB/RPC permission fix and user smoke. Dashboard XP display reads the current hero level/current XP/lifetime XP fields and uses canonical `get_hero_experience_to_next_level(...)` for the current threshold; the player-facing bar now displays real `XP current / threshold` values such as `XP 0 / 180`, with no misleading `XP 0 / 100`, no duplicated `Current: current / threshold` line and no player-facing lifetime XP. Formula/RPC threshold errors show `Unavailable`/error instead of a local fallback. No DB/RPC changes, migrations, XP/level mutations or direct progression writes were introduced from Angular. Verification passed with `npx tsc --noEmit`, focused hero/dashboard XP specs, static greps for no hardcoded XP threshold/no lifetime dashboard text/no direct writes/no new `any`, and `npm run build` with known budget/CommonJS warnings. The dashboard remains a provisional screen and should receive broader UI/UX rebuild later, outside N5.

---

## Task N6 — XP grant workflow integration boundary

**Status:** Done / accepted on 2026-05-03.

**Goal:** Ensure frontend and future producers treat `grant_hero_experience(...)` as the canonical XP/level-up workflow.

**Scope:**

- Add or update domain/RPC types/mappers for `grant_hero_experience(...)` result.
- Do not call `grant_hero_experience(...)` from arbitrary player UI unless a concrete approved gameplay producer/action requires it.
- Approved DB/RPC producer workflows should use `grant_hero_experience(...)` for XP grants instead of direct hero mutations.
- The result model should expose:
  - XP gained;
  - level before/after;
  - experience before/after;
  - total experience before/after;
  - levels gained;
  - reached levels;
  - gross Character Points gained;
  - Character Points balance after penalty sink.
- Do not direct-write:
  - `hero.experience`;
  - `hero.level`;
  - `hero.total_experience_earned`;
  - `hero_progression_ledger`;
  - `character_point_ledger`.
- If a trial/encounter/reward producer lacks a proper integration point, report a producer blocker instead of creating frontend-only XP mutation.

**Acceptance criteria:**

- Frontend has a typed result model for canonical XP grants.
- No second XP/level-up workflow is introduced.
- Producers that grant XP can use the canonical RPC/path where assigned.
- Missing producer integration is reported explicitly.
- Build and focused tests pass where code changes are made.

**Implementation note:** N6 accepted on 2026-05-03 after blocker fix and review. Frontend now has a typed boundary for canonical `grant_hero_experience(...)`: explicit RPC args/result types, mapper helpers, first-row guard and `Hero.grantExperience(...)` service method using `RPC.grant_hero_experience`. The result model exposes XP gained, level before/after, experience before/after, total experience before/after, levels gained, reached levels, gross Character Points gained and Character Points balance after penalty sink. `experienceAmount` is validated as a positive integer and decimal input such as `25.2` throws instead of being silently rounded. No UI, producer integration, fallback XP/level-up workflow, DB/RPC change, migration or direct write path to hero XP/level/progression ledger/Character Point ledger was introduced. Verification passed with `npx tsc --noEmit`, focused hero progression RPC/hero specs with 14 SUCCESS, static greps for no direct progression writes/no new `any`, and `npm run build` with known budget/CommonJS warnings. Follow-up: decide AuthState/dashboard refresh behavior after `grantExperience(...)` at the first real XP producer integration.

---

## Task N7 — Progression ledger and history read models

**Status:** Done / accepted on 2026-05-03.

**Goal:** Make XP/progression history readable without treating ledgers as mutable UI state.

**Scope:**

- Add typed read/domain models for `hero_progression_ledger`.
- Represent at minimum:
  - entry kind;
  - source kind/id;
  - experience delta;
  - experience before/after;
  - total experience before/after;
  - reached level for level-up rows;
  - parent ledger relationship where present;
  - created_at;
  - metadata as secondary diagnostics.
- Add read service/helper for active hero progression history where appropriate.
- Keep player-facing fields display-safe.
- Do not expose staff/audit-only data in player-facing history.
- Do not mutate ledger rows.

**Acceptance criteria:**

- Progression history can show XP gains and level-up events.
- Level-up rows are distinguishable from experience gain rows.
- History uses explicit domain models, not raw DB rows as final UI contracts.
- No direct writes to `hero_progression_ledger`.
- Build and focused mapper tests pass.

**Implementation note:** N7 accepted on 2026-05-03 after review. Frontend now has a read-only progression history boundary for `hero_progression_ledger`: `HeroProgressionHistoryReadModel`, `mapHeroProgressionLedgerEntry(...)`, `HeroProgressionHistory.getActiveHeroHistory(...)`, and the shared `TABLES.hero_progression_ledger` constant. The read model exposes display-safe XP/progression fields for XP gains and level-up rows, including entry kind/type, source kind/id, experience delta, experience before/after, total experience before/after, level before/after, reached level, parent ledger id, created timestamp and metadata diagnostics. Staff/audit-only fields such as `reason`, `request_id` and `created_by` are not exposed in the player-facing read model. The service uses `ActiveHero.requireActiveHero()` and filters by `heroId + serverId`; no UI, route, producer integration, DB/RPC change, migration or direct ledger write path was introduced. Verification passed with `npx tsc --noEmit`, focused mapper/service specs with 5 SUCCESS, static greps for no direct progression ledger writes/no new `any`, and `npm run build` with known budget/CommonJS warnings. Manual smoke and route smoke were not performed by Codex because N7 adds no player-facing flow. Follow-up: wire progression history into a concrete screen later and provide a user smoke checklist at that point.

---

## Task N8 — Level-up reward visibility and routing awareness

**Status:** Done / accepted on 2026-05-03.

**Goal:** Make level-up reward results understandable in frontend/admin surfaces without reimplementing reward routing.

**Scope:**

- Model/display level-up reward grant data where available through existing reward grant/read surfaces.
- Surface the fact that one best matching level-up reward profile is selected per reached level.
- Display level matching metadata where useful:
  - any;
  - exact;
  - minimum;
  - range;
  - interval.
- Do not select reward profiles in Angular.
- Do not grant rewards from Angular.
- Do not allow active XP entries in level-up reward profiles.
- If the UI needs to inspect reward assignments, use existing reward/profile dictionaries/read services.
- If current read models cannot show the level-up reward outcome, report a read-model blocker.

**Acceptance criteria:**

- Level-up reward UI/admin surfaces understand current level matching semantics.
- Angular does not implement reward assignment selection.
- Angular does not grant level-up rewards directly.
- XP recursion guard is preserved.
- Build passes where code changes are made.

**Implementation note:** N8 accepted on 2026-05-03 after SoC follow-up and user smoke. Admin reward profile surfaces now expose level-up reward routing awareness without reimplementing DB/RPC selection: level-up profile matching metadata includes `any`, `exact`, `minimum`, `range` and `interval`, and the UI states that DB/RPC chooses one best matching reward profile per reached level. Active `Experience` entries in `level_up` profiles are blocked by a recursion guard. Level-up routing awareness lives in `reward-level-up-routing-awareness.ts`, and amount-mode rules live in `reward-profile-entry-rules.ts`, so `RewardProfilesPageState` composes the result instead of owning those rules. N8 did not add runtime reward granting, producer integration, DB/RPC changes or migrations, and Angular does not call `grant_level_up_reward_to_hero(...)` or `find_best_level_up_reward_assignment(...)`. Verification passed with `npx tsc --noEmit`, focused reward mapper/page-state/admin specs, static greps for no direct reward grant/ledger writes, no unauthorized level-up grant/selection RPC calls, no durable `any`, and no `label > p-select`, plus `npm run build` with known budget/CommonJS warnings. Manual and route smoke were not performed by Codex; user smoke passed. Follow-up: `RewardProfilesPageState` remains 317 lines and still mixes load, selection, forms, options and key sync; split it further in a later refactor.

---

## Task N9 — Level-up stat bonus rules and grant display/admin alignment

**Status:** Done / accepted on 2026-05-03.

**Goal:** Integrate existing level-up stat bonus rules/grants into frontend/admin surfaces.

**Scope:**

- Add typed models/mappers for:
  - `level_up_stat_bonus_rules`;
  - `level_up_stat_bonus_rule_stats`;
  - `hero_level_stat_bonus_grants`.
- Admin/configurator surfaces should show:
  - rule key/label/description;
  - rule kind: fixed stat or random pool;
  - level matching kind/value/range/interval;
  - fixed stat and amount;
  - random pool stat weights and max points per level;
  - active flag and sort order;
  - helper/admin descriptions.
- If editing is implemented, use canonical DB/RPC paths:
  - `upsert_level_up_stat_bonus_rule(...)`;
  - `upsert_level_up_stat_bonus_rule_stat(...)`;
- Player/history surfaces should show actual grants from `hero_level_stat_bonus_grants`:
  - stat key;
  - amount;
  - before/after value;
  - reached level;
  - rule reference.
- Do not hide actual random outcomes only in unstructured metadata.
- Do not update `hero_stats` from Angular for level-up stat grants.

**Acceptance criteria:**

- Admin can inspect configured level-up stat bonus rules.
- Player/history can display actual stat bonus grants after level-up where data exists.
- Fixed and random stat bonus rules are both modeled.
- Multiple rules firing on the same level are supported in display.
- No direct writes to `hero_stats` or grant tables from Angular.
- Build and focused tests pass.

**Implementation note:** N9 accepted on 2026-05-03 after review and user smoke. Added read-only admin visibility for level-up stat bonus rules through `/admin/level-up-stat-bonuses`, typed models/mappers for `level_up_stat_bonus_rules`, `level_up_stat_bonus_rule_stats` and `hero_level_stat_bonus_grants`, and a player/history read boundary that can attach actual stat bonus grant rows to level-up progression ledger entries. Fixed stat and random pool rules are modeled explicitly, actual grant outcomes expose stat, amount, before/after value, reached level and rule references, and level matching labels reuse the shared `levelMatchLabel(...)` helper. N9 did not add rule editing, runtime grant execution, producer integration, DB/RPC changes, migrations or direct writes to `hero_stats`, grant tables or ledgers. Verification passed with `npx tsc --noEmit`, focused level-up stat bonus mapper/service/history specs, static greps for no direct progression/stat bonus writes, no durable `any` and no `label > p-select`, plus `npm run build` with known budget/CommonJS warnings. Manual and route smoke were not performed by Codex; user route smoke passed and showed the empty-state message. Empty admin rules are acceptable if the environment has no seeded rules or RLS intentionally hides them; if rules exist and should be visible, treat it as a DB/RLS/query blocker rather than adding a frontend fallback. Follow-up: if progression history receives more enrichment slices, consider extracting a dedicated enrichment service.

---

## Task N10 — Derived stat resolver cleanup, including critical damage

**Status:** Done / accepted 2026-05-03.

**Goal:** Align runtime derived/combat stat resolver with current DB dictionaries.

**Scope:**

- Read `derived_stat_definitions` and active bonuses.
- Ensure runtime can resolve:
  - health;
  - defense;
  - min_damage;
  - max_damage;
  - luck;
  - critical_chance;
  - critical_damage;
  - evasion_chance.
- `critical_damage` semantics:
  - base critical damage percent = 50;
  - plus active `critical_damage` bonuses;
  - combat multiplier = `1 + finalCriticalDamagePercent / 100`.
- Do not use `hero_derived`.
- Do not hardcode critical x2 in the final combat path.

**Acceptance criteria:**

- `critical_damage` is available to combat resolver as percent.
- Hardcoded crit x2 is not used in final combat path.
- Derived stat resolver uses DB-backed definitions/bonus targets.
- No new `hero_derived` dependency appears.
- Build and focused tests pass.

**Implementation note:** N10 accepted on 2026-05-03 after user smoke. Runtime derived stats continue to resolve from `derived_stat_definitions` plus active scoped bonuses, `StatsService.getDerivedStats()` now reads active `derived_stat_definitions` instead of legacy `stats_derived`, and `critical_damage` resolves as base 50 percent plus active `critical_damage` bonuses without adding a base stat value. Combat critical damage remains percent-based through multiplier `1 + finalCriticalDamagePercent / 100`; no hardcoded critical x2 was introduced in the final combat path. Dashboard derived stats now show ordered rows from `DashboardPageFacade.derivedStatRows()`, including separate `Critical chance` and `Critical damage`, instead of hardcoded critical rows in the template. N10 did not add DB/RPC changes, migrations, fallback rows, producer integration, direct writes, or a new `hero_derived` dependency. Verification passed with `npx tsc --noEmit`, focused dashboard/derived-stats/stats-service specs, static greps for no active `stats_derived` or `hero_derived` usage, no legacy `Critical:` dashboard label, no direct writes and no durable `any`, plus `npm run build` with known budget/CommonJS warnings. Codex did not run manual smoke or route smoke; user smoke passed.

---

## Task N11 — Character Points display, ledger and penalty sink clarity

**Status:** Done / accepted 2026-05-03.

**Goal:** Keep Character Points display/history consistent with DB truth.

**Scope:**

- Display current spendable balance from `hero.character_points` or approved read model.
- Use `hero.total_character_points_earned` only as lifetime/baseline where intended.
- Use `character_point_ledger` for Character Points history views.
- Show XP-derived CP as gross gain where history data supports it.
- Show penalty sink/payment entries as separate negative ledger/payment events where history data supports it.
- Avoid treating drachmas, resources and Character Points as interchangeable.
- Do not calculate spendable Character Points from ledger totals client-side as source of truth.
- Do not expose staff-only/audit-only fields to player UI.

**Acceptance criteria:**

- Character Points UI uses DB balance as source of truth.
- XP-derived CP and penalty sink/payment can be explained in history where data exists.
- Trade/progression currency language stays clear.
- History and balance views do not expose staff-only/audit-only fields to player UI.
- Build passes.

**Implementation note:** N11 accepted on 2026-05-03 after user smoke. Dashboard now displays current spendable Character Points from `hero.character_points` and `hero.total_character_points_earned` only as lifetime earned context. A typed player-safe `character_point_ledger` read boundary was added through `CharacterPointHistory`, `CharacterPointHistoryReadModel` and `mapCharacterPointLedgerEntry(...)`; it maps XP-derived CP gains and `penalty_payment` sink/payment rows as separate history events without calculating the spendable balance from ledger totals. The dashboard currently renders recent Character Points history rows from the ledger, but this placement is provisional UI/UX and may be moved or hidden in a future dashboard redesign. N11 did not add DB/RPC changes, migrations, direct writes or fallback rows, and it does not expose staff/audit-only fields such as `created_by`, internal descriptions, related entity ids, request ids or metadata in player history. Verification passed with `npx tsc --noEmit`, focused Character Points mapper/service/dashboard/progression RPC specs, static greps for no direct writes, no durable `any`, no staff/audit field exposure in N11 UI/read model and no Character Points/drachma wording mix, plus `npm run build` with known budget/CommonJS warnings. Codex did not run manual smoke or route smoke; user smoke passed.

---

## Task N12 — Progression admin/formula/configurator explainability

**Goal:** Make progression formulas and progression rules inspectable and explainable in admin tooling.

**Scope:**

- Ensure formula admin surfaces show:
  - `hero_stat_upgrade_cost`;
  - `hero_stat_level_cap`;
  - `hero_experience_to_next_level`.
- Ensure allowed variables and default test context are visible.
- Use DB-backed metadata for progression/admin sections where available.
- Progression admin/configurator surfaces should explain:
  - XP current vs lifetime;
  - XP-to-next-level formula;
  - XP → gross Character Points rule;
  - CP penalty sink;
  - level-up reward matching;
  - level-up reward profile selection;
  - level-up stat bonus rules;
  - fixed stat bonuses;
  - random stat-pool bonuses;
  - append-only ledgers/grants;
  - no direct Angular mutations.
- Missing metadata should be reported with exact namespace/key, not permanently hardcoded in Angular.
- Ordinary final labels/i18n polish may remain for later UI/refactor work.

**Acceptance criteria:**

- Admin can inspect active progression formula assignments.
- Admin can understand current progression configuration without reading SQL.
- Metadata is DB-backed where available.
- No hardcoded formula labels/descriptions replace DB labels/descriptions.
- Build passes.

**Implementation note:** N12 accepted on 2026-05-03 after user smoke/review. `/admin/formulas` now has a read-only Progression explainability section that highlights the expected progression formula targets (`hero_stat_upgrade_cost`, `hero_stat_level_cap`, `hero_experience_to_next_level`), shows their DB-backed target/formula labels/descriptions, assigned formula expression, allowed variables and default test context, and links to the related reward profile/stat bonus admin surfaces. Progression admin metadata is loaded through `get_ui_metadata_entries(...)` for `progression_configurator_section`, `progression_diagnostics_section`, `level_up_reward_section` and `level_up_stat_bonus_section`; missing metadata is intentionally reported as exact `namespace/key` gaps instead of replaced by permanent Angular fallback copy. N12 did not add DB/RPC changes, migrations, write/grant/level-up workflows, fallback metadata or hardcoded formula labels/descriptions. Verification passed with `npx tsc --noEmit`, focused progression/formula explainability specs with 12 SUCCESS, static greps for no direct writes/no grant workflow/no durable `any`/no `label > p-select`, and `npm run build` with known budget/CommonJS warnings. Codex did not run manual smoke or route smoke; user smoke passed. Follow-up for DB/content cleanup: replace remaining formula target `hero points` wording with `Character Points`, confirm and align stat upgrade default test context keys (`hero_level`/`stat_level` vs allowed `heroLevel`/`statLevel`), and seed the currently reported UI metadata gaps.

---

## Task N13 — Progression integration smoke and blocker report

**Goal:** Verify Epic N integration after N0–N12 changes.

**Scope:**

- Run technical checks appropriate for touched slices.
- Smoke stat allocation where possible:
  - local draft plus/minus;
  - final save through `save_stat_allocation(...)`;
  - stats refresh;
  - Character Points refresh.
- Smoke XP/level display:
  - current level;
  - current XP progress;
  - lifetime XP;
  - next-level threshold.
- Smoke progression history where data exists:
  - experience gain rows;
  - level-up rows;
  - reached levels;
  - CP ledger entries.
- Smoke derived stats:
  - health;
  - defense;
  - damage;
  - luck;
  - critical chance;
  - critical damage.
- Smoke admin/configurator surfaces where implemented:
  - formula targets;
  - level-up reward matching;
  - stat bonus rules;
  - metadata explanations.
- Do not claim full manual gameplay smoke if there is no authenticated session or representative progression data.
- If a producer workflow cannot be tested because trial/encounter/PvP integration is not ready, report that as pending producer smoke, not as completed gameplay smoke.
- If a DB/RPC/read-model blocker remains, report it explicitly and do not mark the relevant flow complete.

**Acceptance criteria:**

- Report states which N flows were technically verified.
- Report lists pending manual smoke separately from blockers.
- Route smoke alone is not treated as full smoke.
- No direct writes were introduced for progression runtime.
- No `hero_derived` dependency was reintroduced.
- Remaining blockers, if any, are concrete and actionable.

**Implementation note:** N13 accepted on 2026-05-03 as the post N0-N12 technical integration checkpoint. No code, DB/RPC, migration or status-changing implementation was added during the check. Frontend technical verification is green: `npx tsc --noEmit` passed; focused progression/formula/dashboard/ledger/admin specs passed with 71 SUCCESS after rerunning outside the known sandbox `spawn EPERM`; `npm run build` passed with only known budget/CommonJS warnings. Static greps found no new direct progression runtime write paths, no `hero_derived` runtime source, `stats_derived` only in generated types, grant/selection RPC names only in generated/typed-boundary context rather than Angular runtime calls, no durable `any`, and no `label > p-select`. Codex did not run manual smoke or route smoke. Pending validation is explicitly separate from blockers: real producer smoke remains pending until a representative XP-producing flow exists or is intentionally selected, and user/manual validation remains user-owned. N12 DB/content cleanup remains a follow-up, not an N13 blocker: terminology/content should use `Character Points`, stat upgrade default test context keys should be aligned with allowed variables if confirmed, and missing progression UI metadata rows should be seeded rather than hidden with frontend fallback copy.

# Epic O — Estates, districts and buildings

Epic O implements player-facing estate/building runtime, estate address browsing/relocation UI, and admin/balancer building configuration over the current DB/RPC estate foundation.

This is not a fresh placeholder design. The DB foundation exists and must be treated as the source of truth for frontend and admin work.

**Current DB/RPC foundation expected before Codex starts O tasks:**

- `estate_district_address_capacities` with active capacities:
  - A = 5000;
  - B = 3000;
  - C = 500;
  - D = 50;
  - E = 1.
- `estates.district_code + estates.address_number` as the estate address source of truth.
- `estates.address` only as legacy/display compatibility. New code should format addresses from `district_code + address_number`.
- `trg_normalize_estate_address_fields` / `normalize_estate_address_fields(...)` on `estates`.
- `buildings.district_code` as **minimum district availability**, not exact district only.
- `buildings.starting_level`.
- `buildings.base_build_time_seconds`.
- No `buildings.requirements` legacy JSON column.
- No `building_requirements` legacy table.
- `building_resource_costs`.
- `building_district_level_caps`.
- Central requirements through `requirement_definitions` and `entity_requirements`.
- `hero_resource_ledger`.
- Internal `apply_hero_resource_delta_with_ledger(...)`.
- `estate_building_jobs`.
- `estate_building_job_status`: `active`, `completed`, `cancelled`, `failed`.
- Internal `finalize_completed_estate_building_jobs(...)`.
- Internal `ensure_estate_building_baseline(...)`.
- Internal `assert_hero_meets_building_requirements(...)`.
- Owner-safe `finalize_hero_estate_building_jobs(...)`.
- Owner-safe `relocate_hero_estate_to_empty_address(...)`.
- Owner-safe `start_estate_building_upgrade(...)`, returning `build_time_seconds`.
- `get_building_progression_preview(...)`.
- `evaluate_balance_formula_target(...)` and DB-side formula runtime helpers.
- DB metadata namespaces:
  - `building_configurator_section`;
  - `building_configurator_field`;
  - `estate_runtime_section`;
  - `estate_building_runtime_section`.

**Epic rules:**

- Empty estate addresses are not database rows.
- The database stores occupied estates only.
- `district_code + address_number` is the source of truth for estate identity.
- `estates.address` is legacy/display compatibility only. Do not treat it as source of truth. If a task removes final code dependency on it, report `DB cleanup candidate: estates.address`.
- Frontend may generate possible address labels from `estate_district_address_capacities` and overlay occupied `estates` rows.
- `buildings.district_code` is the minimum estate district where the building becomes available.
- Higher estate districts include buildings from lower districts:
  - Estate A sees A buildings;
  - Estate B sees A+B buildings;
  - Estate C sees A+B+C buildings;
  - Estate D sees A+B+C+D buildings;
  - Estate E sees A+B+C+D+E buildings.
- Do not render higher-district buildings as locked cards in lower districts. They should not appear in the player estate building list.
- New estate baseline is DB-owned through `ensure_estate_building_baseline(...)`.
- New estate baseline creates explicit `estate_buildings` rows for buildings available in the estate district and lower districts.
- `buildings.starting_level` controls the level inserted into new estate baseline:
  - `0` means available but unbuilt; first upgrade builds level 1;
  - `1` is the default;
  - values above `1` are technically allowed but should be treated as advanced/admin-danger balance configuration.
- Moving to an empty address is destructive and irreversible for the current estate/building/job state.
- Empty-address relocation must use `relocate_hero_estate_to_empty_address(...)`; do not direct delete/insert `estates` from Angular.
- Empty-address relocation resets building state to the configured baseline for the target district. It does not preserve levels from the old estate.
- Siege/takeover of occupied estates is a separate future guild/PvP workflow and must not use the destructive empty-address relocation RPC.
- Building construction/upgrades use one active `estate_building_jobs` row per estate.
- Player-facing build cancel is not part of MVP. `cancelled` and `failed` are reserved for admin/system correction paths.
- Frontend must use `finalize_hero_estate_building_jobs(...)` for owner-safe lazy finalization. It must not call internal `finalize_completed_estate_building_jobs(...)`.
- `finalize_hero_estate_building_jobs(...)` ensures baseline and lazy-finalizes completed jobs before current building state is trusted.
- Building construction/upgrade must use `start_estate_building_upgrade(...)`.
- `start_estate_building_upgrade(...)` is the authoritative workflow for:
  - owner validation;
  - gameplay eligibility;
  - baseline normalization;
  - completed job finalization;
  - active job guard;
  - district availability;
  - max-level/district cap validation;
  - central requirement validation;
  - formula-backed resource costs;
  - formula-backed build time in seconds;
  - resource spending through `hero_resource_ledger`;
  - job creation;
  - audit.
- Build time contract is seconds. UI may render seconds as minutes/hours/days, but new code must not assume whole minutes.
- Formula preview in Angular is explainability only. Authoritative cost/time is calculated by DB/RPC.
- Requirements are central `entity_requirements`. Requirements are availability gates, not costs.
- Legacy `building_requirements` and `buildings.requirements` must not be reintroduced.
- `buildings.max_level = 0` means unlimited.
- Missing district cap override falls back to `buildings.max_level`.
- Costs come from `building_resource_costs` and formula evaluation. Costs are spent by RPC and recorded in resource ledger.
- Player-facing UI must not direct-write:
  - `estates`;
  - `estate_buildings`;
  - `estate_building_jobs`;
  - `hero_resources`;
  - `hero_resource_ledger`.
- Admin/balancer building configurator must explain what each section configures, where runtime uses it, what changes on save and gameplay impact. Use DB-backed metadata namespaces where available.
- Ordinary form labels may come from frontend i18n, but runtime meaning, impact, safety boundaries and diagnostics must use DB-backed metadata where feasible.
- If a building/estate admin edit path lacks a canonical DB/RPC/governance write path, stop and report a DB/RPC blocker instead of expanding raw direct table writes.

---

## Task O1 — DB/types alignment after estate foundation cleanup

**Status:** Done / accepted on 2026-05-03.

**Goal:** Synchronize generated frontend DB types and frontend expectations with the current estate/building DB contract.

**Scope:**

- Regenerate/update generated Supabase database types after the O foundation migrations.
- Confirm generated types include:
  - `buildings.starting_level`;
  - `buildings.base_build_time_seconds`;
  - no `buildings.base_build_time_minutes`;
  - no `buildings.requirements`;
  - no `building_requirements`;
  - `finalize_hero_estate_building_jobs(...)`;
  - `relocate_hero_estate_to_empty_address(...)`;
  - `start_estate_building_upgrade(...)` with `build_time_seconds`;
  - `get_building_progression_preview(...)`;
  - `building_configurator_section`;
  - `building_configurator_field`;
  - `estate_runtime_section`;
  - `estate_building_runtime_section`.
- Confirm generated types do not expose internal helpers as intended frontend contracts:
  - `finalize_completed_estate_building_jobs(...)`;
  - `ensure_estate_building_baseline(...)`;
  - `assert_hero_meets_building_requirements(...)`;
  - `apply_hero_resource_delta_with_ledger(...)`.
- If internal helpers still appear in generated function types, do not use them from frontend services.
- Do not edit generated DB types manually.
- Do not update status docs before user confirmation.

**Acceptance criteria:**

- Generated types match the current estate/building schema and RPC signatures.
- Frontend code does not reference removed legacy fields/tables.
- Frontend services use `hero.id` as the domain target and do not assume `hero.id === auth.uid()`.
- Player-facing service contracts use owner-safe RPCs, not internal helpers.
- Build passes after type regeneration and any required compile fixes.

**Implementation note:** O1 accepted on 2026-05-03 after DB-side correction and regenerated/imported Supabase types. The prior blocker was stale generated type output from legacy `search_building_targets(...)` and `search_building_targets_page(...)` return signatures; after DB correction and type import, both expose `base_build_time_seconds` instead of `base_build_time_minutes`. Generated types include `buildings.starting_level`, `buildings.base_build_time_seconds`, `get_building_progression_preview(...)`, and `start_estate_building_upgrade(...)` returning `build_time_seconds`. Active frontend code has no `base_build_time_minutes` / `baseBuildTimeMinutes` usage, no minutes-based fallback logic, and no calls to internal estate helper RPCs. No DB/RPC/migration changes or manual generated-type edits were made by Codex. Verification passed with `npx tsc --noEmit`, focused estate/building specs with 15 SUCCESS after rerunning outside the known sandbox `spawn EPERM`, static greps, and `npm run build` with known budget/CommonJS warnings. Codex did not run manual smoke or route smoke.

---

## Task O2 — Estate address and capacity read layer

**Status:** Done / accepted on 2026-05-03.

**Goal:** Provide a typed read layer for estate address identity, district capacity and occupied-address overlays.

**Scope:**

- Add/update domain models and mappers for:
  - estate district capacity;
  - occupied estate address;
  - generated empty address option;
  - selected/current estate address state.
- Load capacities from `estate_district_address_capacities`.
- Generate possible address labels from `district_code + address_number`.
- Overlay occupied `estates` rows for the selected server.
- Treat `estates.address` as display compatibility only.
- Do not create rows for empty addresses.
- Do not expose global account/user ids in player-facing address views.
- Preserve server scope. Address occupancy is server-scoped.
- Support district capacity values:
  - A = 5000;
  - B = 3000;
  - C = 500;
  - D = 50;
  - E = 1.
- Keep address generation efficient. Do not render thousands of DOM rows without paging/filtering/virtualization.

**Acceptance criteria:**

- Player/admin read layer can list occupied addresses and generate empty address options per district.
- Address display is derived from `district_code + address_number`.
- Empty addresses are generated client-side/read-model-side and are not persisted.
- Occupied state is server-scoped.
- `estates.address` is not used as source of truth.
- No direct estate mutation is introduced.

**Implementation note:** O2 accepted on 2026-05-03 after user smoke and the immediate optional-filter follow-up. Added `EstateAddresses` as a read-only service plus typed estate address/capacity models and mappers. Current mansion/topbar/Hero address display now uses `district_code + address_number` labels such as `A-123` instead of legacy `estates.address`. The read layer loads active district capacities from `estate_district_address_capacities`, lists occupied `estates` rows by `server_id` with optional `districtCode`, generates paged empty address options read-model-side, and overlays occupied addresses without exposing global account/user ids. O2 did not add relocation UI, estate mutation, relocation/build-upgrade RPC calls, DB/RPC/migration changes, or frontend fallbacks. Verification passed with `npx tsc --noEmit`, focused estate address specs after rerunning outside the known sandbox `spawn EPERM`, static direct-write greps in O2 paths, and `npm run build` with known budget/CommonJS warnings. Codex did not run manual smoke or route smoke; user smoke passed for `/game/mansion` and topbar address display.

---

## Task O3 — Empty-address relocation flow

**Goal:** Implement player-facing relocation to an empty estate address through the canonical destructive RPC.

**Scope:**

- Use active hero context and pass `hero.id` to `relocate_hero_estate_to_empty_address(...)`.
- Do not pass `auth.uid()` as hero id.
- Require explicit destructive confirmation in UI.
- Show warning that relocation:
  - destroys current estate/building/job state;
  - creates a new estate at the chosen empty address;
  - resets buildings to configured baseline from `buildings.starting_level`;
  - does not preserve old building levels.
- Explain district building inheritance:
  - moving to C creates baseline rows for A+B+C buildings;
  - moving to C does not create D/E building rows.
- Refresh estate address, building state, active job state and resources after successful RPC.
- Do not direct delete/insert `estates`.
- Do not use this workflow for occupied-estate siege/takeover.

**Acceptance criteria:**

- Player can choose a valid empty address and relocate through RPC.
- UI clearly communicates destructive reset and baseline semantics before submit.
- New estate state is reloaded after success.
- Building list after relocation reflects target district baseline.
- Occupied address relocation is blocked by RPC and surfaced clearly.
- No direct table writes are used.

**Implementation note:** O3 accepted on 2026-05-03 after backend/RPC/RLS fixes and frontend invariant hardening. The relocation UI is implemented as `/game/vicinity` rather than a mansion panel or district/address dropdown form. Vicinity renders nearby address slots around the active hero estate (`address_number +/- 10`, clipped to active district capacity), highlights the current estate, disables occupied rows, and allows selecting only generated empty slots. Relocation uses only `relocate_hero_estate_to_empty_address(...)` with active `hero.id`, requires destructive confirmation, refreshes `ActiveHero`, verifies the refreshed `hero.estate_id` matches `new_estate_id`, and verifies the new estate address is readable through `EstateAddresses.getCurrentAddress(...)`. `/game/mansion` remains the estate/building screen and no longer masks a missing current estate address with fallback district `A`. No DB/RPC/migration change, generated-type edit, direct estate/hero/estate_buildings write, internal estate helper RPC, or frontend fallback was introduced by Codex. Codex did not run manual smoke or route smoke.

---

## Task O4 — Building catalog and estate building read layer

**Goal:** Provide typed building read models for player estate screens and admin previews using the current DB contract.

**Scope:**

- Read `buildings` with:
  - key;
  - name;
  - description;
  - image/path where available;
  - minimum `district_code`;
  - `starting_level`;
  - `base_cost`;
  - `base_build_time_seconds`;
  - `max_level`;
  - rank/sort fields where present.
- Read current estate building levels from `estate_buildings`.
- Treat `estate_buildings.level = 0` as available but unbuilt.
- Do not infer level from missing rows. Baseline should ensure explicit rows for available buildings.
- Filter player estate building list by district inheritance:
  - show building if `building.district_code` rank is less than or equal to estate district rank;
  - hide higher-district buildings.
- Load district caps from `building_district_level_caps`.
- Interpret `max_level = 0` and effective cap `0` as unlimited.
- Load central requirements from `entity_requirements`.
- Do not read `building_requirements`.
- Do not read `buildings.requirements`.
- Load resource cost rows from `building_resource_costs`.
- Load formula target metadata for `building_upgrade_cost` and `building_upgrade_time` where preview is needed.
- Formula preview is explainability only; do not treat client preview as authoritative mutation input.
- Preserve building bonuses through the canonical `entity_bonuses(entity_type = building)` path if bonuses are displayed.
- Do not add `buildings.is_active`; current decision is that building definitions exist as the active building pool.

**Acceptance criteria:**

- Player estate building screen can display available buildings for the current estate district.
- Estate C shows A+B+C buildings and hides D/E buildings.
- Level 0 buildings are shown as available/unbuilt, not as missing data.
- Starting level is visible in admin/diagnostic contexts.
- Time values use seconds, not minutes.
- Requirements come only from central requirements.
- Legacy building requirements are not referenced.
- No direct mutation is added.

**Implementation note:** O4 was conditionally accepted on 2026-05-04 after user smoke/review and the formula-variable follow-up after BUILDING-FORMULA-DB-FIX2/FIX3. The player mansion/building read layer uses the current estate address, seconds-based build times, level 0/unbuilt rows, central `entity_requirements`, DB-backed stat labels for `hero_stat` requirement display, and canonical building formula preview variables. Formula tester/scope variables for building targets now come from the selected target contract: `building_upgrade_cost` uses `currentLevel`, `targetLevel`, `baseCost`, `rank`; `building_upgrade_time` uses `currentLevel`, `targetLevel`, `baseTimeSeconds`, `rank`; `hero_stat_upgrade_cost` keeps `statCurrentLevel` isolated. `currentLevel -> targetLevel` sync and derived `targetLevel` display are handled in frontend preview/tester code only; durable building upgrade remains backend/RPC-owned through the canonical upgrade workflow. No DB/RPC/migration/generated-type edit, direct write path, legacy variable fallback mapping, legacy requirements read, or manual/route smoke by Codex was introduced. Follow-up: `ItemGenerationFormulaBalanceFacade` remains about 447 lines and must be split further before the next larger item generation/formula balance task adds responsibilities.

---

## Task O5 — Building job read layer and lazy finalization

**Goal:** Make building job state readable and keep current building levels fresh through the owner-safe finalization wrapper.

**Scope:**

- Add/update typed models/mappers for `estate_building_jobs`.
- Load active and recent job state for the current hero estate.
- Before trusting current building levels in player runtime, call `finalize_hero_estate_building_jobs(p_hero_id)` where appropriate.
- Do not call internal `finalize_completed_estate_building_jobs(...)` from frontend.
- Treat `completed_count = 0` as normal.
- Use `started_at` and `completes_at` as authoritative timer anchors.
- Use seconds-based duration formatting in UI.
- Do not assume whole-minute timers.
- Do not implement player-facing cancel/claim flow in this task.
- Preserve `cancelled` and `failed` as admin/system correction statuses only.
- Guard async responses by selected hero/server context.

**Acceptance criteria:**

- Completed active jobs can be finalized through owner-safe RPC before building state is displayed.
- Active job progress can be displayed from timestamps.
- UI handles no active job, active job and just-finalized job states.
- No direct writes to `estate_building_jobs` or `estate_buildings`.
- No internal helper RPC is used from frontend services.
- Stale responses do not update the wrong selected hero/server state.

**Implementation note:** O5 accepted on 2026-05-04 after review. The mansion building read path now calls owner-safe `finalize_hero_estate_building_jobs(p_hero_id)` before reading current `estate_buildings` state, treats `completed_count = 0` as normal, and validates the returned hero/server/estate identifiers before trusting finalized state. Building job reads use typed `estate_building_jobs` rows plus generated RPC return typing from `Database['public']['Functions']['finalize_hero_estate_building_jobs']['Returns'][number]`; no local hand-written RPC return interface is maintained. Mansion exposes active/recent job read models, calculates progress/remaining from `started_at` and `completes_at`, and guards stale async responses in `MansionPageFacade`. O5 did not add build-start, cancel, claim, DB/RPC/migration changes, direct writes to estate/building job tables, internal helper RPC calls, or manual/route smoke by Codex. Pending user/manual validation remains for real active/completed job data: active job panel, progress/remaining, completed finalization banner and recent job history.

**Status:** Done / accepted on 2026-05-04.

---

## Task O6 — Start building construction/upgrade flow

**Goal:** Implement the player action to start a building construction/upgrade through the authoritative RPC.

**Scope:**

- Use active hero context and pass `hero.id` to `start_estate_building_upgrade(...)`.
- Do not pass `auth.uid()` as hero id.
- Use RPC return values as source of truth:
  - job id;
  - estate id;
  - building id;
  - target level;
  - status;
  - started_at;
  - completes_at;
  - build_time_seconds;
  - drachma/materials/workforce costs;
  - resource balances after spending;
  - audit log id where returned.
- Show requirements/cap/resource/time preview before submit, but treat it as advisory.
- Surface RPC errors for:
  - unmet central requirements;
  - unavailable district;
  - max-level/cap reached;
  - active job already exists;
  - insufficient resources;
  - gameplay blocked by membership/moderation state.
- Support `estate_buildings.level = 0` → target level 1 construction.
- Disable or explain unavailable action when another active job exists.
- Refresh resources, building levels and active job state after success.
- Do not calculate authoritative cost/time in Angular.
- Do not write resources or jobs directly.

**Acceptance criteria:**

- Player can start a valid build/upgrade through RPC.
- RPC-calculated costs, duration and balances are shown after success.
- Level 0 building can start target level 1 construction.
- Active job blocks additional construction.
- Requirements/cap/resource errors are clear.
- No direct table writes are introduced.
- Build passes.

**Implementation note:** O6 accepted on 2026-05-04 after frontend rewire to the central settled estate runtime model and user smoke. Mansion starts construction/upgrades only through `start_estate_building_upgrade(...)` with active `hero.id`, then refreshes active hero state and reloads mansion data from `get_hero_estate_runtime_state(p_hero_id)`. Active/recent job state, finalized completed count, current building levels and resource snapshots come from the settled runtime RPC; direct `estate_building_jobs` reads and separate mansion finalization are no longer the mansion source of truth. Runtime JSON payloads inside `buildings_json`, `active_job_json` and `recent_jobs_json` are parsed as camelCase (`buildingId`, `jobId`, `targetLevel`, `startedAt`, `completesAt`, etc.) with no fallback to snake_case JSON. O6 introduced no Angular resource materialization, no direct writes to estate/building job/resource tables, no internal helper RPC use, and no Codex-run manual/route smoke. User smoke confirmed start, active job panel, route leave/return, browser refresh during an active job, completed-job settlement and the new building level after `completes_at`.

**Status:** Done / accepted on 2026-05-04.

---

## Task O7 — Building and estate configurator explainability

**Goal:** Align building/estate admin and runtime screens with DB-backed explanation metadata so the admin understands what each section configures and what the gameplay impact is.

**Scope:**

- Load and use DB metadata from:
  - `building_configurator_section`;
  - `building_configurator_field`;
  - `estate_runtime_section`;
  - `estate_building_runtime_section`.
- Do not hardcode permanent section explanations when DB metadata exists.
- Field labels and short form validation copy may remain local/i18n, but runtime meaning, impact, safety and diagnostics must use DB-backed metadata where available.
- Building configurator/admin surfaces must explain:
  - building identity;
  - minimum district availability;
  - district inheritance;
  - starting level;
  - level 0 semantics;
  - base build time in seconds;
  - resource costs;
  - formula preview vs authoritative RPC;
  - max level and district caps;
  - central requirements;
  - building bonuses;
  - runtime boundary;
  - diagnostics.
- Estate runtime/player/admin surfaces must explain:
  - empty addresses are not rows;
  - `district_code + address_number` source of truth;
  - relocation reset;
  - baseline initialization;
  - district building inheritance;
  - active job model;
  - lazy finalization;
  - resource ledger;
  - seconds-based timers.
- Missing metadata must be reported with exact `namespace/key`, not silently replaced by permanent local copy.
- Raw keys/UUIDs may appear only as secondary metadata.
- Use existing shared metadata display helpers/components where available.
- Include shared/reuse report in Codex summary.

**Acceptance criteria:**

- Admin can understand what each building/estate section configures without reading SQL or source code.
- UI explains where runtime uses each configuration and what changes on save.
- `building_configurator_section` and `building_configurator_field` are used for admin configurator explanations.
- `estate_runtime_section` and `estate_building_runtime_section` are used for runtime/diagnostic explanations.
- Missing metadata gaps are reported precisely.
- No raw table-editor style screen is introduced as the final UX.
- Build passes.

---

**Implementation note:** O7 accepted on 2026-05-04 after reviewer fixes and user smoke. Building admin explainability now uses DB-backed `building_configurator_section` metadata for section titles/text and `building_configurator_field` metadata for selected field labels, with missing entries shown as exact `namespace/key` gaps. Mansion runtime explainability uses `estate_runtime_section` and `estate_building_runtime_section`. O7 loads metadata via canonical `get_ui_metadata_entries(...)` and generated function return typing. The touched building/admin/shared select templates no longer nest `p-select` inside native `<label>` elements. Permanent local gameplay/admin explainability copy was removed from touched O7 sections; remaining local copy is limited to short operational UI labels and empty states. Verification passed with `npx tsc --noEmit`, 31 focused building specs, and `npm run build` with known existing warnings. Codex did not run manual or route smoke.

**Status:** Done / accepted on 2026-05-04.

---

## Task O8 — Building configurator edit alignment

**Goal:** Align the existing building admin/editor surface with the current building DB model and safety rules.

**Scope:**

- Inspect the existing building admin/editor route/components/services before changing them.
- Reuse existing admin layout, metadata display and form patterns where possible.
- Ensure the editor can display and, where an approved write path exists, edit:
  - building identity fields;
  - minimum district;
  - `starting_level`;
  - `base_build_time_seconds`;
  - resource base costs from `building_resource_costs`;
  - max level and district caps;
  - central requirements from `entity_requirements`;
  - building bonuses through `entity_bonuses(entity_type = building)`;
  - formula assignments/preview where existing formula tooling supports it.
- If the current editor has no canonical DB/RPC/governance write path for a mutation, stop and report a DB/RPC blocker for that write slice.
- Do not expand raw direct table writes for critical balance configuration.
- Do not reintroduce legacy fields/tables:
  - `building_requirements`;
  - `buildings.requirements`;
  - `base_build_time_minutes`;
  - `buildings.is_active`.
- Explain advanced/admin-danger values:
  - `starting_level > 1`;
  - unlimited max level (`0`);
  - very long or very short build times;
  - high resource costs;
  - district cap overrides.
- Preserve selected server/global context distinctions where relevant.
- Include stale guards for selected server/route/entity changes during async saves.
- Include shared/reuse report in Codex summary.

**Acceptance criteria:**

- Existing building editor reflects the current DB model.
- Admin can see and understand `starting_level`, seconds-based build time, costs, caps, requirements and bonuses.
- Editor does not show removed legacy fields.
- Editor does not assume `buildings.is_active`.
- Save paths use approved DB/RPC/governance operations or are explicitly reported as blockers.
- Build passes.

**Implementation note:** O8 accepted on 2026-05-04 after reviewer follow-up and user smoke. The building admin editor now maps, displays and saves `starting_level` through the existing building editor path. `starting_level = 0` is an explicitly legal not-built definition state and is preserved through DB row mapping, reactive form draft conversion and save payloads instead of being normalized to `1`; `startingLevel = 2` continues to round-trip. The shared form field config now supports numeric `min`/`max`, with the starting-level input configured as `min=0` and `step=1`, and the save service rejects negative/non-integer starting levels without clamping. O8 reused existing admin layout, DB-backed metadata labels, building resource cost editing, entity bonus editing and formula assignment/preview paths. It did not add write paths for `building_district_level_caps` or `entity_requirements`; those remain governed/read-preview areas until an approved write boundary exists. Verification passed with `npx tsc --noEmit`, focused building/admin specs with 47 SUCCESS, and `npm run build` with known existing warnings. Codex did not run manual or route smoke.

---

## Task O9 — Estate vicinity/address browser and relocation picker UI

**Goal:** Build the player-facing UI for browsing estate addresses by district/vicinity, seeing occupied/empty addresses and choosing an empty address for relocation. The visual direction should be compatible with the future PvP “Nearby estates” targeting screen, but this task must not implement real PvP attack/spy/siege actions.

**Scope:**

- Add a player-facing estate vicinity/address browser UI.
- Use the read layer from O2.
- Use the provided “Nearby estates / vicinity” mockup as visual direction:
  - main content list/table of nearby or generated estate addresses;
  - current estate highlighted;
  - occupied estate rows;
  - empty plot rows;
  - selected address/target side panel where useful;
  - compact context cards for current estate/district/address.
- Show districts A–E with configured capacities:
  - A = 5000;
  - B = 3000;
  - C = 500;
  - D = 50;
  - E = 1.
- Do not render thousands of address rows at once. Use paging, filtering, virtualization or a compact generated list pattern.
- Show address identity from `district_code + address_number`.
- Overlay occupied estate rows onto generated address options.
- Empty address rows/cards should clearly show:
  - address label;
  - district;
  - empty/available state;
  - relocation action if eligible.
- Occupied address rows/cards should show safe public occupant/estate information only:
  - hero/display name where allowed;
  - district/address;
  - visible public summary only;
  - no account id;
  - no private staff/user metadata.
- Support filters/search where useful:
  - district;
  - address number;
  - empty only;
  - occupied only;
  - hero/name if safely available.
- The relocation action must route into O3 confirmation flow.
- Future PvP concepts such as attack, spy, siege, protection, daily attacks, travel time and target eligibility may be represented only as disabled/placeholder visual slots if needed for layout compatibility.
- Do not implement real attack/spy/siege actions in Epic O.
- Do not implement PvP eligibility logic in Epic O.
- Do not implement siege/takeover actions here.
- Do not create empty estate rows.
- Do not direct-write `estates`.
- Reuse existing game shell/card/table/button patterns where available.
- Include shared/reuse report in Codex summary.

**Acceptance criteria:**

- Player can browse estate addresses by district/vicinity.
- Current estate is visually identifiable.
- Empty addresses are visibly distinct from occupied addresses.
- Empty address action starts the relocation confirmation flow.
- Occupied addresses do not expose private account/user data.
- Large districts do not render as one massive DOM list.
- UI structure can later be extended by a PvP targeting epic without rewriting the address browser foundation.
- No real PvP attack/spy/siege action is implemented in this task.
- No empty address rows are persisted.
- Build passes.

**Implementation note:** O9 accepted on 2026-05-04 after user smoke. `/game/vicinity` now supports district selection, center-address browsing, compact generated address ranges, and all/empty/occupied filtering over the O2 address read layer. Current estate rows are identifiable, occupied rows stay generic/safe, empty rows are selectable, and relocation continues through canonical `EstateRelocation.relocateActiveHeroEstate(...)` / `relocate_hero_estate_to_empty_address(...)` without direct `estates` writes. Stale guards cover load/reload and relocation responses, and controls are disabled/ignored while relocation is pending. No `/game/neighborhood`, PvP attack/spy/siege/takeover/protection/travel mechanics, empty-address persistence, hardcoded production capacities, DB/RPC migration, or Angular resource-production fallback was introduced. Verification passed with `npx tsc --noEmit`, focused vicinity/estate/building specs, static grep checks, and `npm run build` with known budget/CommonJS warnings; Codex did not run manual or route smoke. Follow-up: resource production after destructive relocation remains a non-blocking DB/runtime/topbar consistency issue. If `hero_resources.per_hour` remains stale after relocation or mansion settlement, return to backend/migrator; if DB values are correct, fix the topbar reload/cache path. Do not solve it with local Angular production recalculation.

---

## Task O10 — Player estate overview and building dashboard UI

**Status:** Done / conditionally accepted on 2026-05-05 after user smoke.

**Goal:** Build the main player-facing estate screen that shows the current estate, available buildings, levels, jobs, resources and build/upgrade actions.

**Scope:**

- Add/update player-facing estate overview page under the game/estate area.
- Show current estate identity:
  - district;
  - address number;
  - formatted address;
  - rank if relevant.
- Show available buildings for the current estate district using district inheritance:
  - Estate A shows A buildings;
  - Estate B shows A+B buildings;
  - Estate C shows A+B+C buildings;
  - Estate D shows A+B+C+D buildings;
  - Estate E shows A+B+C+D+E buildings.
- Do not show higher-district buildings as locked cards in lower districts.
- Show each available building with:
  - name;
  - description;
  - current level;
  - `level 0` as available but unbuilt;
  - next target level where applicable;
  - effective max level / unlimited state;
  - requirement state;
  - resource cost preview;
  - build time preview in seconds rendered as human duration;
  - active job state where relevant.
- Use `finalize_hero_estate_building_jobs(...)` before trusting completed job state, as defined by O5.
- Use `start_estate_building_upgrade(...)` for build/upgrade action, as defined by O6.
- Show resource balances relevant to building:
  - drachma;
  - materials;
  - workforce.
- Show one-active-job limitation clearly.
- Show no cancel/claim action in MVP.
- Use existing shell/card/button/progress/timer components where available.
- Include shared/reuse report in Codex summary.

**Acceptance criteria:**

- Player can see current estate and available buildings.
- Available building list respects district inheritance.
- Level 0 buildings are shown as unbuilt but available.
- Active job progress is visible.
- Build/upgrade action is available only through RPC.
- Costs/time shown before action are clearly preview/advisory.
- RPC result updates job/resources/building state.
- No direct estate/building/resource writes are introduced.
- Build passes.

**Implementation note:** O10 was conditionally accepted on 2026-05-05 after blocker follow-up and user smoke. `/game/mansion` now shows a player-facing estate overview with current district/address/rank, available/unbuilt building counts, active job state and settled resource cards for drachma/materials/workforce from `get_hero_estate_runtime_state(...)`. Building cards keep district-inherited availability, level 0/unbuilt display, preview cost/time labels, active/completed job state and build/upgrade through `start_estate_building_upgrade(...)`; no cancel/claim action or direct estate/building/resource write path was added. The runtime JSON mapper was aligned with the DB contract: SQL return columns remain snake_case, while nested JSON payloads use camelCase, including `resources_json.resourceType`, `amount` and `perHour` with no snake_case fallback. Verification passed with `npx tsc --noEmit`, focused building/mansion specs with 34 SUCCESS, static greps for no direct writes/no legacy finalization or job-table source/no auth-user hero id assumption/no legacy minutes or requirements/no durable `any`, and `npm run build` with known budget/CommonJS warnings. Codex did not run manual or route smoke; user smoke passed.

**Follow-up:** Resource production after destructive relocation remains a DB/runtime consistency issue, not a frontend fallback task. After relocating to a new estate with level 0 buildings, `hero_resources.per_hour` for drachma may remain stale, for example `+18/h`, until a later build/finalize path recalculates production to the new value, for example `+12/h`. Do not mask this in Angular or locally recalculate production. Check `relocate_hero_estate_to_empty_address(...)`, `settle_hero_runtime_state(...)`, `get_hero_estate_runtime_state(...)` and `refresh_hero_resource_production_rates(...)`.

---

## Task O11 — Estate/building feedback and notification integration

**Status:** Done / accepted on 2026-05-05 after user smoke and clean-code review.

**Goal:** Ensure estate/building actions provide correct immediate feedback and produce persistent notifications only where appropriate.

**Scope:**

- Use local toast/inline feedback for immediate player actions:
  - successful relocation;
  - failed relocation;
  - successful build/upgrade start;
  - failed build/upgrade start.
- Relocation success feedback should explain:
  - new address;
  - destructive reset completed;
  - new baseline initialized.
- Do not create frontend-inserted notification rows.
- Building completion is an asynchronous/time-based event and should be represented by persistent notification when DB workflow finalizes a completed job.
- Check whether a DB-owned building completion notification hook already exists.
- If no hook exists, report DB/RPC blocker or add the approved DB-owned hook in the assigned DB slice:
  - notification type for building completion;
  - call `create_notification(...)` from finalization workflow;
  - recipient kind `hero`;
  - source entity type `estate_building_job`;
  - source entity id = job id;
  - action URL to the estate/building page.
- Notification bell/inbox rendering belongs to Epic Q, but O must ensure estate/building workflows produce the correct events.
- Do not create ordinary game reports for estate/building actions.
- Do not duplicate audit logs as player notifications.

**Acceptance criteria:**

- Immediate estate/building actions show clear UI feedback.
- Frontend does not insert notification rows.
- Building completion notification production is either implemented DB-side or reported as an explicit DB/RPC blocker.
- Relocation does not create persistent notifications unless a separate design decision explicitly requires it.
- Notification action links route to the estate/building UI.
- Build passes.

**Implementation note:** O11 accepted on 2026-05-05 after functional smoke and SoC blocker follow-up. Immediate estate/building action feedback now uses local inline state plus `ToastService`: relocation success/failure and missing confirmation are handled by `VicinityRelocationRunner` / `VicinityRelocationFeedback`, and build/upgrade success/failure/unavailable states are handled by `MansionBuildingActionRunner` / `MansionBuildingActionFeedback`. Relocation success feedback includes the new address, destructive reset and new district baseline initialization. The vicinity page state was split so range loading lives in `VicinityBrowserRangeLoader`, relocation RPC workflow/stale relocation guard/reload-after-success live in `VicinityRelocationRunner`, and the page state coordinates signals, selection/filter state and apply-result only. `EstateVicinityPageState` was reduced from about 414 to about 289 lines; `MansionPageFacade` remains about 229 lines after the mansion action split. Building completion notification production is DB-owned: current DB notes expose `estate.building_job.completed`, produced by the building finalization workflow, and Angular does not call `create_notification(...)` or insert/update notification rows. No DB/RPC contract change, frontend notification write, direct estate write, direct `estate_building_jobs` source, PvP action, game report, or local production fallback was added. Verification passed with `npx tsc --noEmit`, focused mansion/vicinity specs with 49 SUCCESS, static greps for notification/runtime boundaries, and `npm run build` with known budget/CommonJS warnings. Codex did not run manual or route smoke; user smoke passed. Known UI debt: vicinity still uses native selects / `ngModel` and should move to project/PrimeNG reactive-form patterns in a future UI pass.

---

## Task O12 — Estate/building integration smoke and blocker report

**Goal:** Verify the player-facing and admin-facing Epic O integration after O1–O11 changes.

**Scope:**

- Run technical checks appropriate for the changed slice.
- Smoke player flow where possible:
  - load current estate;
  - show address/district;
  - browse estate addresses by district;
  - show occupied and empty addresses;
  - trigger relocation confirmation from an empty address;
  - show available building list;
  - hide higher-district buildings;
  - show level 0 buildings as unbuilt where configured;
  - show active/no-active job state;
  - finalize completed jobs through `finalize_hero_estate_building_jobs(...)`;
  - start a build/upgrade through `start_estate_building_upgrade(...)` when data/resources allow;
  - show immediate feedback for relocation/build actions.
- Smoke notification integration where possible:
  - confirm frontend does not insert notification rows;
  - confirm building completion notification hook exists or blocker is reported;
  - confirm notification action URL points to the estate/building page where available.
- Smoke admin/configurator flow where possible:
  - metadata sections render;
  - starting level is visible;
  - seconds-based time is visible;
  - central requirements are visible;
  - resource costs are visible;
  - caps are visible;
  - raw keys are secondary metadata only.
- Do not claim full manual gameplay smoke if there is no authenticated session or insufficient test data.
- If a smoke step cannot be executed, report the exact missing data/session/permission.
- If a DB/RPC/configurator write blocker remains, report it explicitly and do not mark the epic complete.

**Acceptance criteria:**

- Report states which O flows were technically verified.
- Report lists pending manual smoke separately from blockers.
- Route smoke alone is not treated as full smoke.
- Address browser, estate overview, building dashboard and admin configurator are covered by the smoke report.
- No direct writes were introduced for player runtime.
- No frontend notification inserts were introduced.
- No legacy building requirements/time fields are used.
- Remaining blockers, if any, are concrete and actionable.

**Implementation note:** O12 accepted on 2026-05-05 as the post O1-O11 technical integration checkpoint. No code, DB/RPC, migration, status-changing runtime implementation, frontend notification write or Angular production fallback was added during the check. Frontend technical verification is green: `npx tsc --noEmit` passed; focused O-slice specs passed with 80 SUCCESS after rerunning outside the known sandbox `spawn EPERM`; `npm run build` passed with the known bundle budget and Supabase `cookie` CommonJS warnings. Static greps found no new `create_notification`, frontend notification writes, direct `TABLES.estate_building_jobs` mansion source, legacy finalization RPC, `auth.uid` / `userId` hero-id assumption, legacy `base_build_time_minutes`, legacy `building_requirements` / `buildings.requirements`, `label > p-select`, or durable `any` in the checked O paths. Codex did not run manual or route smoke and does not claim it. Pending manual smoke remains user-owned: `/game/mansion` resources versus topbar, build start/active/completion states, `/game/vicinity` district/center/filter and relocation, `/admin/buildings` save/reload for starting level/costs/formulas/metadata, and notification DB smoke for building-completion rows/action URLs where representative data exists. Non-blocking follow-up remains: after destructive relocation, `hero_resources.per_hour` can remain stale until later settlement/build/finalize; diagnose `relocate_hero_estate_to_empty_address(...)`, `settle_hero_runtime_state(...)`, `get_hero_estate_runtime_state(...)` and `refresh_hero_resource_production_rates(...)`, and do not mask this with Angular-side production recalculation.

# Epic P — Reports and snapshots

Epic P implements player-facing gameplay reports over the DB-backed game report foundation.

Game reports are gameplay-facing records that let a hero return to past events and, where safe, share a public report link. They are separate from:

- `player_abuse_reports`;
- audit logs;
- anti-abuse/staff review data;
- notifications;
- temporary runtime/debug state.

Reports must support both:

- private Reports Center / Reports tab for the active hero;
- public report route `/report/:publicToken` for shareable report views.

This epic must provide enough prototype UI to smoke-test report creation, listing, reading, sharing and rendering. Final visual polish belongs in the UI/UX backlog, but P must create usable report surfaces.

**Current DB/RPC foundation expected before Codex starts P tasks:**

- `game_report_types`;
- `game_reports`;
- `game_report_hero_access`;
- `game_report_hero_access.read_at`;
- `game_report_participants`;
- `game_report_item_references`;
- enum `game_report_access_role = owner | participant | viewer`;
- enum `game_report_item_source_kind = reward_drop`;
- enum `game_report_source_entity_type = combat_result | trial_result | encounter_result | pvp_result | siege_result`;
- `generate_game_report_public_token()`;
- `delete_game_report_for_hero(...)`;
- `create_game_report_from_combat_result(...)`;
- `attach_reward_drop_item_to_game_report(...)`;
- `build_report_item_display_name(...)`;
- `mark_game_report_read(...)`;
- `get_hero_game_report_unread_count(...)`;
- `get_hero_game_reports(...)`;
- `get_hero_game_report_detail(...)`;
- `get_public_game_report_by_token(...)`;
- internal `build_game_report_combat_section_json(...)`;
- DB metadata namespaces:
  - `reports_center_section`;
  - `report_detail_section`;
  - `public_report_section`;
  - `report_combat_section`;
  - `report_future_source_section`.

**Epic rules:**

- Use the report DB/RPC foundation.
- Do not make public gameplay reports from `player_abuse_reports`, audit logs, anti-abuse data or raw exploration runtime/debug rows.
- Public report route is `/report/:publicToken`.
- Public report route uses `game_reports.public_token`, not internal report ids.
- Public report route must use `get_public_game_report_by_token(...)`; do not require anon direct SELECT on private report tables.
- Private Reports UI uses `game_report_hero_access`.
- Multiple heroes may have access to the same report.
- Report read/unread state is per hero access row:
  - a report is unread for a hero while `game_report_hero_access.read_at` is null;
  - reading by one hero must not mark the report read for another hero.
- Reports have their own unread count through `get_hero_game_report_unread_count(...)`.
- Reports are not notifications.
- Do not create default `game_report.created` notification rows for every report.
- Notifications may link to reports only for separately designed important events.
- Opening a private report may call `mark_game_report_read(...)`.
- Removing a report for one hero uses `delete_game_report_for_hero(...)`.
- Removing a report removes only that hero access row; the underlying report is deleted only when no access rows remain.
- Public token stops resolving only when the underlying report row is deleted.
- Public payload must not expose:
  - internal `report_id`;
  - private `read_at` state;
  - account/user ids;
  - staff-only fields;
  - audit/anti-abuse data;
  - internal combat participant/attack row ids.
- Private payload may include private report id and access role for the active hero, but must not expose staff/audit/anti-abuse data.
- Report participants are display-safe snapshots, not live account/user records.
- Combat section renders persisted `combat_results` and related snapshot rows.
- Combat report rendering must not recompute combat from live hero/opponent state.
- Combat reports wrap `combat_results`; do not duplicate `combat_result_attacks` into report tables.
- `combat` report type is a basic wrapper for one persisted combat result. Production gameplay reports should usually be contextual:
  - `trial` report may include combat as a section;
  - `encounter` report may include combat/resource/effect/reward sections;
  - `pvp_combat` report belongs to future PvP workflow;
  - `siege` report belongs to future guild/siege workflow.
- Reward/drop item references are public showcase references.
- Reward/drop item references should prefer live `source_item_id` when safe and available.
- If the live source item is missing, renderer must fall back to quality/base/prefix/suffix/display name.
- Reward/drop references do not snapshot final item stats forever.
- Combat attack source labels can be public.
- Full private player equipment/loadouts must not be exposed by default.
- Do not fake trial/encounter/PvP/siege producers before durable source workflows exist.
- If Codex removes the final code dependency on a legacy report/display field, report it as a `DB cleanup candidate`; do not silently leave obsolete DB debt.

---

## Task P0 — Align generated DB types after reports foundation

**Goal:** Confirm frontend type layer exposes current game report DB/RPC contracts.

**Scope:**

- Regenerate/update generated Supabase database types after P report foundation migrations.
- Confirm generated types include report enums/tables/functions listed in the P foundation.
- Confirm generated types include:
  - `game_report_hero_access.read_at`;
  - `mark_game_report_read(...)`;
  - `get_hero_game_report_unread_count(...)`;
  - `get_hero_game_reports(...)`;
  - `get_hero_game_report_detail(...)`;
  - `get_public_game_report_by_token(...)`.
- Confirm generated types include combat result tables used by report rendering.
- Confirm internal helpers are not used as frontend service contracts:
  - `build_game_report_combat_section_json(...)`;
  - `build_report_item_display_name(...)`;
  - `attach_reward_drop_item_to_game_report(...)`, unless called only from an approved producer/server-side workflow.
- Do not edit generated types manually.
- Do not update status docs before user confirmation.

**Acceptance criteria:**

- Generated types match current schema and RPC signatures.
- Missing report tables/functions are reported before UI implementation.
- No raw generated rows replace report domain models.
- Build passes after type regeneration and compile fixes.

---

## Task P1 — Game report domain models and mappers

**Goal:** Add typed domain/read models for game reports.

**Scope:**

- Add domain/read models for:
  - report type dictionary;
  - report list item;
  - report detail payload;
  - public report payload;
  - hero report access/read state;
  - participants;
  - item references;
  - combat section;
  - combat participants;
  - combat attacks.
- Map `read_at` to `readAt`.
- Derive `isUnread` from `readAt === null`.
- Keep private and public models separate.
- Private model may include:
  - report id;
  - access role;
  - read state.
- Public model must not include:
  - internal report id;
  - access role;
  - read state;
  - hero id;
  - user/account ids;
  - internal combat row ids.
- Report type labels/descriptions must come from `game_report_types`.
- Use payload fields from safe RPCs rather than raw direct joins where available.

**Acceptance criteria:**

- Models separate private access from report participants.
- Public-facing models do not expose account/user ids or private read state.
- Raw DB rows are mapped to explicit domain/UI models.
- Mapper tests cover read/unread, participants, item references and combat section payload.
- Build passes.

**Implementation note:** P1 accepted on 2026-05-05. Added typed game report read-model foundation and mappers only; no UI, service, report write path, producer, notification write or status docs were changed during implementation. Private list/detail and public report models are separated. Private models may carry `reportId`, active-hero access role and read state, while public models omit internal report ids, `sourceEntityId`, access/read state, hero/user/account ids, internal combat ids and raw item/content ids. Public item references use a separate safe model with only `sourceKind`, `displayName`, `qualityKey` and `sortOrder`. The report mappers use generated RPC/table types, derive `isUnread` from `readAt === null`, parse nested JSON as strict camelCase without snake_case fallback, and fail on malformed combat payloads. Verification passed with `npx tsc --noEmit`, focused report mapper specs with 6 SUCCESS, static grep checks and `npm run build` with known budget/CommonJS warnings. Manual smoke is not applicable for this model/mapper-only slice.

---

## Task P2 — Private Reports list / Reports tab prototype

**Goal:** Show reports available to the active hero in a minimal Reports tab UI.

**Scope:**

- Add or update a player-facing Reports route/tab under the game/report area.
- Use `get_hero_game_reports(...)` for the report list.
- Use active hero context and pass `hero.id`.
- Do not pass `auth.uid()` as hero id.
- Show:
  - report type label;
  - title;
  - summary;
  - created time;
  - participant summary;
  - item reference count where useful;
  - read/unread state;
  - public link/share action;
  - remove action.
- Support simple filters where practical:
  - report type;
  - unread only;
  - search text.
- Show unread count through `get_hero_game_report_unread_count(...)`.
- Do not read report tables directly from Angular if the RPC payload covers the need.
- Use `delete_game_report_for_hero(...)` to remove a report from this hero's list.
- Surface RPC errors as user-readable messages/toasts.
- Use DB metadata from `reports_center_section` where useful for section explanations.
- This is prototype UI for smoke, not final UI/UX polish.

**Acceptance criteria:**

- Hero sees only reports they have access to.
- Read/unread state is visible.
- Unread count is visible or otherwise available in state.
- Removing a report uses RPC, not direct delete.
- If other heroes still have access, report remains for them.
- Public link stops resolving only when the underlying report row is deleted after final access removal.
- No default notification row is created for listing a report.
- Build passes.

**Implementation note:** P2 accepted on 2026-05-05. `/game/reports` now provides a minimal private Reports tab backed by `get_hero_game_reports(p_hero_id)`, `get_hero_game_report_unread_count(p_hero_id)` and `delete_game_report_for_hero(...)` through typed active-hero service boundaries. Server filters cover report type and unread-only; search is explicitly local over the loaded page. The page shows type label, title, summary, created time, participant summary, item-reference count, read/unread state, unread count, remove action and copy-token sharing. Public `/report/:publicToken` routing remains a P4 non-goal, so P2 does not render a fake public link. UI section copy uses `reports_center_section` metadata and exact missing metadata gaps. No direct report table reads/writes or frontend notification writes were added. Verification passed with `npx tsc --noEmit`, focused report specs with 15 SUCCESS, static greps and `npm run build` with known warnings. Manual smoke remains pending until representative report producers/data exist.

---

## Task P3 — Private report detail and mark-read flow

**Goal:** Render one private report in the authenticated game shell and support per-hero mark-read behavior.

**Scope:**

- Add private report detail route/view.
- Load detail through `get_hero_game_report_detail(p_hero_id, p_report_id)`.
- Use active hero context.
- Do not pass `auth.uid()` as hero id.
- Show:
  - report title;
  - type label;
  - summary;
  - created time;
  - participants;
  - item references;
  - combat section where available;
  - public share link;
  - remove action.
- On successful open, call `mark_game_report_read(...)` when appropriate.
- Marking read must update only the current hero access row.
- Do not mark other report participants as read.
- Refresh list/unread count state after marking read.
- Do not expose staff/audit/anti-abuse fields.
- Use DB metadata from `report_detail_section` where useful.

**Acceptance criteria:**

- Private report detail renders through owner-safe RPC.
- Opening detail can mark the report read for the active hero only.
- Other participants' read state is unaffected.
- Remove/share actions work from detail.
- Detail does not expose staff/audit/anti-abuse data.
- Build passes.

**Implementation note:** P3 accepted on 2026-05-05. `/game/reports/:reportId` now renders private report detail through `GameReports` using active-hero RPC boundaries: `get_hero_game_report_detail(p_hero_id, p_report_id)`, `mark_game_report_read(p_hero_id, p_report_id)`, `get_hero_game_report_unread_count(p_hero_id)` and `delete_game_report_for_hero(...)`. Mark-read updates only the active hero read state, refreshes unread count from the authoritative RPC and leaves the previous count unchanged if that refresh fails. Detail uses `report_detail_section` metadata, includes remove and copy-token actions, and keeps public `/report/:publicToken` routing as P4 scope. No direct report table writes or frontend notification writes were added. Verification passed with `npx tsc --noEmit`, focused report specs with 22 SUCCESS, static greps and `npm run build` with known warnings. Manual smoke remains pending until representative report producer data exists.

---

## Task P4 — Public report route

**Goal:** Add public route `/report/:publicToken` for shareable reports.

**Scope:**

- Add public route outside the normal authenticated game shell.
- Load report through `get_public_game_report_by_token(...)`.
- Do not direct SELECT report tables from anon.
- Render report content without normal app shell/sidebar/topbar.
- Use the same core report renderer as private detail where practical.
- Show safe not-found state when token no longer resolves.
- Public view must not expose:
  - report id;
  - private read state;
  - access role;
  - account/user ids;
  - staff-only data;
  - audit logs;
  - anti-abuse metadata;
  - internal combat participant/attack ids.
- Use DB metadata from `public_report_section` where useful.
- Public route should be readable by anonymous visitors with a valid token.

**Acceptance criteria:**

- Anonymous/public viewer can open a valid report token.
- Missing/deleted/no-access token shows safe not-found page.
- Public route does not leak private account/user/staff data.
- Public route does not require direct table SELECT for anon.
- Public and private report content use shared rendering where practical.
- Build passes.

**Implementation note:** P4 accepted on 2026-05-05. `/report/:publicToken` is registered in root routes outside the game shell, with SSR configured for the dynamic public token route. Public report loading uses `get_public_game_report_by_token(p_public_token)` through `GameReports`, generated RPC args/returns and the public-safe report mapper; it does not require active hero context or direct report table reads. Missing/deleted/no-access tokens show a safe not-found state. Public/private report content shares the read-only `GameReportContent` renderer, while public view uses `public_report_section` metadata and omits private ids, read/access state, account/user ids, staff/audit/anti-abuse data and internal combat ids. Verification passed with `npx tsc --noEmit`, focused report specs with 25 SUCCESS, static greps and `npm run build` with known warnings. Manual smoke remains pending until representative report producer data exists.

---

## Task P5 — Combat report renderer

**Goal:** Render combat sections sourced from persisted `combat_results`.

**Scope:**

- Use `combat_section_json` from report detail/public RPCs.
- Render:
  - combat source type label;
  - outcome label;
  - winner/loser side where available;
  - turns completed;
  - started/completed timestamps where useful;
  - participants;
  - participant combat stats;
  - participant base stat snapshots where useful;
  - attack timeline.
- Attack timeline should show:
  - attack order;
  - turn number;
  - actor side;
  - target side;
  - attack source label;
  - hit/timing result;
  - evasion;
  - critical;
  - rolled damage;
  - final damage;
  - target health before/after;
  - display text.
- Do not duplicate or recompute combat result state.
- Do not use live hero/opponent stats to reconstruct historical combat.
- Do not expose full private equipment/loadouts by default.
- Public rendering must respect public-safe payload omissions.
- Support both private app-shell rendering and public bare-shell rendering.

**Acceptance criteria:**

- Combat report reproduces the core persisted combat result.
- Attack rows are rendered in historical order.
- Attack source labels are visible.
- HP changes are readable.
- Private equipment stays private unless a future explicit feature changes that.
- Public renderer does not require internal combat ids.
- Build passes.

**Implementation note:** P5 accepted on 2026-05-05. The shared `GameReportContent` renderer now renders persisted `combat_section_json` for both private report detail and public reports, including source/outcome/winner/loser/timestamps where present, participant HP/combat/base-stat snapshots, and historical attack timeline fields for turn/order/sides/source label/timing/evasion/critical/rolled/final damage/target HP/display text. The renderer does not recompute combat state, does not read live hero/opponent stats, and public rendering remains based on the public-safe report model without internal combat ids or full equipment/loadout exposure. Historical participant snapshot rendering uses `$index` tracking rather than non-unique domain fields such as combat side. Verification passed with `npx tsc --noEmit`, focused report specs with 26 SUCCESS, static greps and `npm run build` with known warnings. Manual smoke remains pending until representative combat report data exists.

---

## Task P6 — Combat report creation integration

**Status:** Done / confirmed 2026-05-05.

**Goal:** Use the current DB producer to create/get reports for combat results where a low-level combat result should become a report.

**Scope:**

- Call `create_game_report_from_combat_result(...)` only from approved places where a combat result should become a report.
- Treat the RPC as idempotent.
- Do not create report rows directly in Angular.
- Do not duplicate `combat_result_attacks` into report tables.
- Use this primarily for:
  - sandbox/admin-test combat reports;
  - temporary low-level combat report smoke;
  - future producers where source context explicitly wants a low-level combat wrapper.
- Do not replace contextual trial/encounter/PvP reports with low-level combat reports when contextual source data exists.
- If a source workflow needs a contextual report producer and does not have one, report that as a producer blocker instead of faking it.

**Acceptance criteria:**

- Combat result can produce a report wrapper through RPC.
- Hero participants receive private report access.
- Report uses existing combat result snapshot tables.
- Repeated creation attempts return/reuse the existing report rather than creating duplicates.
- No direct report inserts are introduced.
- Build passes where code changes are made.

**Implementation note:** P6 accepted on 2026-05-05. Frontend now exposes a low-level, RPC-only `GameReportProducers.createCombatReportFromResult(...)` boundary for `create_game_report_from_combat_result(...)`, with generated RPC args/return aliases and focused mapper/service tests. The boundary treats idempotence as DB/RPC-owned, does not add contextual gameplay producers, UI buttons, direct report table writes, frontend idempotence logic, notification writes or duplication of `combat_result_attacks`. Verification passed with `npx tsc --noEmit`, focused report producer/mapper specs with 20 SUCCESS, static greps and `npm run build` with known warnings. Manual smoke is not applicable until representative persisted combat result data exists.

---

## Task P7 — Reward/drop item reference display

**Status:** Done / confirmed 2026-05-05.

**Goal:** Render public showcase drop item references in reports.

**Scope:**

- Read item reference payload from report detail/public RPCs.
- Prefer live `source_item_id` when the item exists and is safe to show.
- Fall back to:
  - `display_name_fallback`;
  - quality key;
  - base id/label where resolvable;
  - prefix/suffix id/label where resolvable.
- Do not snapshot final item stats forever.
- Show item card/tooltip for reward drops where available.
- Do not use reward/drop references as a way to expose equipment used in combat.
- Public route must not expose private item owner/account data.

**Acceptance criteria:**

- Drop reward item can be displayed in private and public reports.
- Live item data is preferred when available and safe.
- Missing item row falls back gracefully.
- Used weapons/equipment are not automatically rendered as public item cards.
- Build passes.

**Implementation note:** P7 accepted on 2026-05-05. Private and public report item references now render through shared `GameReportContent` using safe report `displayName`, `qualityKey` and optional RPC-provided `displayDetails`. Angular does not build player-facing copy from raw `baseId`, `prefixAffixId` or `suffixAffixId`; if safe component labels are absent, the fallback is only `displayName` plus safe `Quality ...`. Public report item references still omit `sourceItemId`, `baseId`, `prefixAffixId` and `suffixAffixId`. No live item fetch, report write path, notification write or equipment-source rendering was added. Verification passed with `npx tsc --noEmit`, focused report specs with 35 SUCCESS, static greps and `npm run build` with known warnings. Manual smoke remains pending until representative report item-reference data exists.

---

## Task P8 — Attach reward drops to reports through approved producer path

**Status:** Done / confirmed 2026-05-05.

**Goal:** Use DB helper to attach dropped/generated reward items to reports from approved gameplay producers.

**Scope:**

- Do not call `attach_reward_drop_item_to_game_report(...)` directly from arbitrary Angular UI.
- Use `attach_reward_drop_item_to_game_report(...)` from approved DB/RPC producer/workflow where reward drop report should include item.
- Keep report/item attachment idempotent.
- Do not insert `game_report_item_references` directly from Angular.
- Use generated item/item read models for display after DB attachment.
- If the required producer workflow does not exist yet, report it as a producer blocker.

**Acceptance criteria:**

- Reward drops can appear in report item references through approved producer path.
- Duplicate report/item references are prevented by DB.
- No direct report item reference writes from Angular.
- Missing producer workflow is reported explicitly instead of faked.

**Implementation note:** P8 accepted on 2026-05-05. Frontend now exposes a typed, low-level `GameReportProducers.attachRewardDropItemToReport(...)` boundary for `attach_reward_drop_item_to_game_report(...)`, using generated RPC args/return aliases and the existing producer mapper pattern. The call goes through `Backend.rpc` only, leaves item-reference idempotence to DB/RPC, maps a small result model for approved producers, and does not add UI hooks, arbitrary Angular calls, direct `game_report_item_references` writes, notification writes or contextual gameplay producer fakes. Verification passed with `npx tsc --noEmit`, focused report specs with 43 SUCCESS, static greps and `npm run build` with known warnings. Manual smoke is not applicable until an approved producer workflow supplies real `reportId` and `itemId` data. Follow-up: clarify the attach reward drop error-message context and confirm whether `sortOrder` should be non-negative before the next touch.

---

## Task P9 — Trial and encounter report producer readiness

**Goal:** Prepare report rendering and producer boundaries for trial and encounter reports after L/M integration.

**Scope:**

- Treat `trial` and `encounter` as contextual report types.
- Do not fake trial/encounter producers from raw debug/runtime rows.
- Identify where completed trial/encounter workflows should call report creation after their durable result/consequence workflow exists.
- Trial reports should be able to include:
  - trial outcome;
  - reward summary;
  - optional combat section when the trial used combat.
- Encounter reports should be able to include:
  - encounter outcome;
  - reward/resource/effect summary;
  - optional combat section when the encounter used combat.
- Combat section renderer from P5 should be reused when a trial/encounter includes combat.
- Reward/drop item references should be attached through approved producer path.
- Do not re-trigger reward generation when creating a report.

**Acceptance criteria:**

- Producer plan exists before coding trial/encounter report creation.
- UI can show safe placeholder/readiness state for trial/encounter report types when source payload is not yet available.
- Combat section is reused when a trial/encounter includes combat.
- Reward grants are represented without re-triggering reward generation.
- No raw exploration graph/step/challenge runtime rows are exposed as public report snapshots.

**Implementation note:** P9 accepted on 2026-05-05. Frontend now has a safe contextual readiness model for trial and encounter reports. `PrivateGameReportDetail` and `PublicGameReport` expose `contextualReadiness` for `trial` / `trial_result` and `encounter` / `encounter_result` payloads, while `GameReportContent` renders the readiness placeholder only when the report has no participants, item references or combat section. This keeps trial/encounter report UI ready without faking producers from raw exploration/challenge/runtime rows, without re-triggering rewards, without report table writes and without frontend notification writes. Existing report mappers, strict JSON model and P5 combat renderer are reused; reward/drop references remain on the approved producer path. Verification passed with `npx tsc --noEmit`, focused report specs with 47 SUCCESS, static greps and `npm run build` with known warnings. Manual smoke is pending until real or seeded trial/encounter reports exist. Follow-up: during the next report UI pass, consider hiding otherwise-empty sections while contextual readiness is active and keep future consumers aligned with the same "placeholder only when no safe payload exists" rule.

---

## Task P10 — Future PvP and siege report placeholders

**Goal:** Keep report model ready for PvP and siege without implementing those workflows early.

**Scope:**

- Keep report type support for:
  - `pvp_combat`;
  - `siege`.
- Do not fake PvP/siege producers before those epics exist.
- PvP reports should later show:
  - combat section;
  - resource outcome;
  - prestige/standing indication where allowed;
  - relevant access rows for participants.
- Siege reports should later support:
  - many hero access rows;
  - multi-participant outcome;
  - future guild/siege context.
- Public/private renderers should show safe placeholder/readiness states for these types if no producer payload exists yet.

**Acceptance criteria:**

- P does not block future PvP/siege reports.
- No fake PvP/siege workflow is built inside P.
- Public/private renderers handle future report types gracefully.

**Implementation note:** P10 accepted on 2026-05-05. Frontend now extends the existing contextual readiness path for future `pvp_combat` / `pvp_result` and `siege` / `siege_result` reports. Public and private report mapping can surface safe readiness placeholders for these future types, while `GameReportContent` keeps the P9 rule that readiness is rendered only when the report has no safe payload: no participants, no item references and no combat section. P10 did not build PvP or siege producers, did not fake workflow results from raw runtime payloads, did not add report writes and did not add frontend notification writes. Verification passed with `npx tsc --noEmit`, focused report specs with 49 SUCCESS, static greps and `npm run build` with known warnings. Manual smoke is pending until real or seeded PvP/siege reports exist.

---

## Task P11 — Reports Center prototype UI smoke and blocker report

**Goal:** Verify the player-facing and public Epic P integration after P0–P10 changes.

**Scope:**

- Run technical checks appropriate for the changed slice.
- Smoke private Reports UI where possible:
  - load Reports list for active hero;
  - show read/unread state;
  - show unread count;
  - open report detail;
  - mark as read;
  - remove report from this hero's list;
  - copy/open public link.
- Smoke public report route:
  - open `/report/:publicToken`;
  - verify no normal authenticated shell/sidebar/topbar;
  - verify not-found state;
  - verify no private ids/read state/staff data leak.
- Smoke combat renderer where combat result data exists:
  - outcome;
  - participants;
  - attack timeline;
  - hit/evasion/crit/damage;
  - health before/after.
- Smoke item references where report item data exists:
  - live item where available;
  - fallback item display where live item missing.
- Smoke report deletion semantics where possible:
  - removing one hero access does not delete report if other access rows remain;
  - public token stops resolving only after final access row deletion.
- Do not claim full manual gameplay smoke if there is no authenticated session or insufficient report/combat data.
- If a smoke step cannot be executed, report the exact missing data/session/permission.
- If a producer blocker remains for trial/encounter/PvP/siege, report it explicitly and do not mark those producer paths complete.

**Acceptance criteria:**

- Report states which P flows were technically verified.
- Report lists pending manual smoke separately from blockers.
- Route smoke alone is not treated as full smoke.
- Private Reports list/detail and public report route are covered by smoke report.
- Combat renderer is covered if combat result data exists.
- No direct report table writes are introduced from Angular.
- No frontend notification inserts are introduced for default report creation.
- Remaining blockers, if any, are concrete and actionable.

---

# Epic Q — Notifications

Epic Q implements persistent notification inbox/bell UI over the current DB-owned notification foundation.

Notifications are short attention/status events. They are not:

- game reports;
- audit logs;
- player abuse reports;
- anti-abuse case records;
- local UI-only toasts.

Reports have their own Reports Center and unread state. Toasts are presentation of fresh notification rows, not a separate persistence model.

**Current DB/RPC foundation expected before Codex starts Q tasks:**

- enum `notification_recipient_kind`: `user`, `hero`, `staff`;
- enum `notification_severity`: `info`, `notice`, `warning`, `critical`;
- table `notification_types`;
- table `notifications`;
- `notifications.read_at`;
- `notifications.dismissed_at`;
- internal helper `create_notification(...)`;
- owner-safe RPC `get_my_notifications(...)`;
- owner-safe RPC `get_my_notification_unread_count(...)`;
- owner-safe staff RPC `get_my_staff_notifications(...)`;
- owner-safe staff RPC `get_my_staff_notification_unread_count(...)`;
- owner-safe RPC `mark_notification_read(p_notification_id)`;
- owner-safe RPC `dismiss_notification(p_notification_id)`;
- DB metadata namespaces:
  - `notification_center_section`;
  - `notification_staff_center_section`;
  - `notification_type_admin_section`;
  - `notification_hook_diagnostics_section`.

**Current DB-owned notification hooks:**

- `notify_player_trade_offer_lifecycle`;
- `notify_player_trade_transaction_completed`;
- `notify_player_auction_bid_outbid`;
- `notify_player_relationship_declaration_decision`;
- `notify_player_abuse_report_decision`;
- `notify_anti_abuse_case_attention`;
- `notify_anti_abuse_sanction_created`;
- `notify_character_point_penalty_created`;
- `finalize_completed_estate_building_jobs(...)` creates `estate.building_job.completed`.

**Epic rules:**

- Frontend must not insert notification rows directly.
- Frontend must not update `notifications.read_at` or `notifications.dismissed_at` directly.
- Frontend must not delete notification rows.
- Frontend must not call `create_notification(...)`.
- `create_notification(...)` is an internal DB/service workflow helper.
- Player/game inbox must use `get_my_notifications(...)`.
- Player/game unread count must use `get_my_notification_unread_count(...)`.
- Staff/admin inbox must use `get_my_staff_notifications(...)`.
- Staff/admin unread count must use `get_my_staff_notification_unread_count(...)`.
- Read action must use `mark_notification_read(...)`.
- Dismiss action must use `dismiss_notification(...)`.
- `dismiss_notification(...)` also marks the row as read.
- Dismissed notifications are hidden from normal inbox views.
- Notification unread means `read_at is null` and `dismissed_at is null`.
- `notification_types` are DB-backed dictionaries. Use labels/descriptions/category/default toast behavior from DB.
- Do not hardcode permanent notification labels/categories in Angular when DB values exist.
- Frontend may show fresh notification rows as toasts when `notification_types.default_toast_enabled = true`.
- Toast is presentation only; persistent `notifications` row remains the source of truth.
- Reports have their own Reports inbox/badge and must not be counted as notifications.
- Do not create default `game_report.created` notifications for every report.
- Notifications may link to reports only for separately designed important events.
- Use active auth user and selected server/hero context where relevant.
- Do not expose staff-only fields in player-facing notifications.
- Player notification inbox must not show `recipient_kind = staff`.
- Staff notifications are server-scoped and require current staff/global access.
- Staff action URLs are pointers, not authorization; route guards still apply.
- Notification source entity references are contextual links, not authority to read the source.
- If a notification hook is missing for a workflow, report a DB/RPC hook blocker. Do not compensate with frontend inserts.

---

## Task Q0 — Align generated DB types after notification foundation

**Goal:** Synchronize generated frontend DB types with the current notification DB/RPC contract.

**Scope:**

- Regenerate/update generated Supabase database types after Q DB/RPC migrations.
- Confirm generated types include:
  - `notification_recipient_kind`;
  - `notification_severity`;
  - `notification_types`;
  - `notifications`;
  - `notifications.read_at`;
  - `notifications.dismissed_at`;
  - `get_my_notifications(...)`;
  - `get_my_notification_unread_count(...)`;
  - `get_my_staff_notifications(...)`;
  - `get_my_staff_notification_unread_count(...)`;
  - `mark_notification_read(...)`;
  - `dismiss_notification(...)`.
- Confirm generated types do not make frontend use `create_notification(...)` as a UI contract.
- Confirm metadata read path can load:
  - `notification_center_section`;
  - `notification_staff_center_section`;
  - `notification_type_admin_section`;
  - `notification_hook_diagnostics_section`.
- Do not edit generated DB types manually.
- Do not update status docs before user confirmation.

**Acceptance criteria:**

- Generated types match current schema/RPC signatures.
- Frontend code does not reference removed/old notification assumptions.
- Frontend services use read/action RPCs instead of direct notification table mutations.
- Build/typecheck passes after type regeneration and compile fixes.

---

## Task Q1 — Notification domain models and mappers

**Goal:** Add typed frontend domain models for DB-backed notification inbox/bell data.

**Scope:**

- Add domain/read models for:
  - notification type dictionary;
  - player notification list item;
  - staff notification list item;
  - recipient kind;
  - severity;
  - read/dismiss state;
  - source entity reference;
  - action link metadata;
  - toast eligibility.
- Map RPC payloads into UI-safe models.
- Map:
  - `read_at` → `readAt`;
  - `dismissed_at` → `dismissedAt`;
  - `is_unread` → `isUnread`;
  - `is_dismissed` → `isDismissed`;
  - `default_toast_enabled` → `defaultToastEnabled`.
- Keep private/staff models explicit.
- Keep raw DB rows out of components.
- Preserve:
  - `title`;
  - `body`;
  - `action_label`;
  - `action_url`;
  - `created_at`;
  - `read_at`;
  - `dismissed_at`;
  - source entity type/id.
- Player-facing model must not expose staff-only data.
- Raw keys/UUIDs may appear only as secondary metadata where useful for admin/debug contexts.

**Acceptance criteria:**

- Notification models expose readable type label/category/severity.
- Mapper handles nullable source/action/body fields safely.
- Player-facing model does not expose staff-only fields or unrelated global account ids.
- Staff model is distinct from player model where needed.
- Mapper tests cover read/unread, dismissed, action link and toast eligibility.
- Build passes.

---

## Task Q2 — Player notification read service and unread count

**Goal:** Load current user's player/game notification inbox and unread count through owner-safe RPCs.

**Scope:**

- Add service/domain read layer using `get_my_notifications(...)`.
- Add unread count read using `get_my_notification_unread_count(...)`.
- Use active auth user implicitly through RPC.
- Use selected server/hero context where available.
- Pass `hero.id`, not `auth.uid()`, where a hero id parameter is needed.
- Normal player inbox should include:
  - `recipient_kind = user`;
  - `recipient_kind = hero`.
- Normal player inbox must not include:
  - `recipient_kind = staff`.
- Exclude dismissed rows from normal inbox view.
- Support unread-only filter where useful.
- Sort newest first by RPC result.
- Do not mix Reports unread count into notification unread count.
- Do not query `notifications` directly from Angular if the RPC payload covers the need.
- Guard async responses by selected server/hero context.

**Acceptance criteria:**

- Current user can see their user/hero notification inbox.
- Bell badge uses notification unread count only.
- Dismissed notifications are hidden from normal inbox view.
- Staff notifications do not appear in player inbox.
- Reports remain a separate inbox/badge.
- No direct notification table mutation is introduced.
- Build and focused service tests pass.

---

## Task Q3 — Staff notification read service and unread count

**Goal:** Load server-scoped staff/admin notifications through owner-safe staff RPCs.

**Scope:**

- Add staff/admin notification read service using `get_my_staff_notifications(p_server_id, ...)`.
- Add staff unread count using `get_my_staff_notification_unread_count(p_server_id)`.
- Require selected server context.
- Do not load staff notifications without an explicit server id.
- Staff notifications should be visible only to users with current staff/global access for that server, as enforced by RPC.
- Keep staff notifications separate from normal player inbox.
- Surface access-denied RPC errors clearly.
- Guard async responses by selected server context.
- Do not expose staff notifications in player-facing shell unless a future staff shell deliberately combines badges.

**Acceptance criteria:**

- Staff user can see server-scoped staff notifications addressed to them.
- Normal player does not see staff notifications.
- Staff unread count is separate from player notification unread count.
- Staff action links remain route-guarded and server-scoped.
- Build and access tests pass where possible.

---

## Task Q4 — Notification bell / dropdown UI

**Goal:** Add a player-visible notification bell with unread count and concise notification list.

**Scope:**

- Add notification bell entry in the app shell/topbar.
- Use player notification read/count service from Q2.
- Show unread count badge.
- Dropdown/list shows newest notifications with:
  - title;
  - short body;
  - type label/category/severity;
  - created time;
  - unread/read state;
  - action link if available.
- Keep technical keys secondary or hidden unless useful for diagnostics.
- Do not show raw UUIDs as primary text.
- Do not include Reports items in the notification bell.
- Do not include staff notifications in the normal player bell.
- Use DB metadata from `notification_center_section` where useful for explanations/empty states.
- Use existing shell/card/list/button/badge patterns where available.
- Include shared/reuse report in Codex summary.

**Acceptance criteria:**

- User can open a concise notification dropdown/list.
- Unread notifications are visually distinguishable.
- Dismissed notifications do not appear in normal dropdown/list.
- Action link navigates to the relevant route when present.
- Empty state is clear.
- Reports are not shown in notification bell.
- Staff notifications are not shown in player bell.
- Build and route smoke pass.

---

## Task Q5 — Mark read / dismiss notification actions

**Goal:** Allow users to manage notification read/dismiss state through canonical RPCs.

**Scope:**

- Call `mark_notification_read(...)` for marking one notification read.
- Call `dismiss_notification(...)` for hiding/dismissing one notification.
- Do not direct-update `notifications.read_at`.
- Do not direct-update `notifications.dismissed_at`.
- Do not delete notification rows from Angular.
- Support marking one notification read on click/open.
- Support dismiss from dropdown/list.
- Refresh unread count after mutation.
- Refresh or locally remove dismissed row after successful dismiss.
- Show RPC errors via toast/message.
- Preserve stale guards for selected server/hero or current list state.

**Acceptance criteria:**

- Read/dismiss mutations use RPC only.
- Notification ownership/access denial is surfaced clearly.
- Unread badge updates after read/dismiss.
- Dismissed notifications disappear from normal inbox view.
- Dismissed notifications are not counted as unread.
- Build and focused tests pass.

---

## Task Q6 — Optional online toast presentation for fresh notifications

**Goal:** Show fresh DB-created notifications as transient toasts when the user is online.

**Scope:**

- Detect newly loaded or realtime-received notification rows for current user.
- Show toast only when `notification_types.default_toast_enabled = true`.
- Avoid duplicate toasts for the same notification in one session.
- Toast content uses:
  - notification title;
  - body;
  - severity;
  - action label where useful.
- Toast display must not create notification rows.
- Toast display must not mutate notification rows.
- Toast display must not replace persistent inbox.
- If realtime subscription is not available/reliable yet, implement a safe polling/refresh-based fallback or report the limitation.
- Offline users should still see unread notifications later.

**Acceptance criteria:**

- Fresh eligible notifications can appear as toasts.
- No duplicate toast spam for the same row in one session.
- Toasts are presentation-only; persistent DB notification remains source of truth.
- Disabled toast types do not show toast, but still appear in inbox if present.
- Build and smoke pass.

---

## Task Q7 — Staff notification inbox/dropdown UI

**Goal:** Provide a staff/admin-facing notification surface for server-scoped staff notifications.

**Scope:**

- Add staff/admin notification UI where appropriate in admin/staff shell.
- Use staff read/count service from Q3.
- Require selected server context.
- Show:
  - unread count;
  - title/body;
  - type label/category/severity;
  - created time;
  - read/dismiss state;
  - action link.
- Keep staff notifications separate from normal player notifications unless the shell explicitly indicates staff context.
- Use DB metadata from `notification_staff_center_section` where useful.
- Do not expose staff notification body/action to normal player UI.
- Use existing admin shell/card/list/button/badge patterns where available.
- Include shared/reuse report in Codex summary.

**Acceptance criteria:**

- Staff user can see server-scoped staff notifications.
- Staff unread count is visible in staff/admin context.
- Normal player cannot access staff notifications.
- Staff notification action links remain route-guarded.
- Missing selected server state is handled clearly.
- Build and access smoke pass where possible.

---

## Task Q8 — Notification type/admin readability pass

**Goal:** Make notification type labels/descriptions readable in admin/debug contexts.

**Scope:**

- Add a simple admin/read-only view or section for `notification_types`, or integrate into existing dictionary/admin metadata tooling.
- Display:
  - key;
  - label;
  - description;
  - helper text;
  - admin description;
  - category;
  - default severity;
  - default toast enabled;
  - active flag;
  - sort order.
- Use DB metadata from `notification_type_admin_section` where useful.
- Do not implement notification type editing unless a governed write path is approved.
- Keep technical key secondary to label/description.
- If historical notifications reference inactive types, do not assume active-only dictionary labels are enough; report a referenced-lookup need if encountered.

**Acceptance criteria:**

- Admin/operator can inspect notification types and understand which events may toast.
- No hardcoded notification type list is introduced in admin UI.
- Type labels/descriptions come from DB.
- No raw table-editor style screen is introduced as the final UX.
- Build passes.

---

## Task Q9 — Notification hook diagnostics/admin readability

**Goal:** Make DB-owned notification producers inspectable and prevent missing/duplicated notification hooks.

**Scope:**

- Add or extend admin/debug diagnostics for DB notification producers.
- Use DB metadata from `notification_hook_diagnostics_section`.
- Show or report known DB-owned producers:
  - trade offer lifecycle;
  - trade transaction completion;
  - auction outbid;
  - declaration decision;
  - player abuse report decision;
  - anti-abuse case attention;
  - sanction created;
  - Character Points penalty created;
  - estate building completion.
- Confirm there is no default `game_report.created` hook.
- Diagnostics may be read-only and technical.
- Do not create frontend notification rows to compensate for missing hooks.
- If a hook is missing for a required workflow, report it as DB/RPC blocker.

**Acceptance criteria:**

- Admin/operator can understand which workflows produce notifications.
- Building completion hook is visible as DB-owned.
- Reports are documented as not default notification producers.
- Missing hooks are reported precisely.
- Build passes where code changes are made.

---

## Task Q10 — Notification smoke and hook verification

**Goal:** Verify DB-owned notification hooks are visible through the frontend/read model and actions.

**Scope:**

- Run technical checks appropriate for the changed slice.
- Smoke player notification flow where possible:
  - load player inbox;
  - show unread count;
  - mark notification read;
  - dismiss notification;
  - verify dismissed row disappears from normal inbox.
- Smoke staff notification flow where possible:
  - load staff inbox for selected server;
  - show staff unread count;
  - mark/dismiss staff notification.
- Smoke DB-owned hooks where data/workflows are available:
  - trade offer lifecycle;
  - trade transaction completion;
  - auction outbid;
  - declaration approved/rejected;
  - abuse report resolved/dismissed;
  - anti-abuse attention;
  - sanction/CP penalty created;
  - estate building completion.
- At minimum, verify building completion notification if estate/building test data exists.
- Verify report creation does not create a default notification.
- Do not claim full manual gameplay smoke if there is no authenticated session or insufficient data.
- If real workflow data is unavailable, list pending smoke cases and exact required data.
- Do not use Angular direct insert as a smoke shortcut.

**Acceptance criteria:**

- Report states which Q flows were technically verified.
- Report lists pending manual smoke separately from blockers.
- At least one player notification read/dismiss flow is smoke-tested where data exists.
- At least one staff notification read/dismiss flow is smoke-tested where data/access exists.
- At least one DB-owned hook is smoke-tested end-to-end where data exists.
- Building completion hook is smoke-tested where estate/building data exists.
- Report creation does not create a default notification.
- No notification is created by Angular direct insert.
- Remaining blockers, if any, are concrete and actionable.

---

# Epic R — PvP Foundation

Epic R implements the frontend and admin/balancer integration for the current DB-owned PvP Foundation.

PvP Foundation covers:

- estate/vicinity based player target selection;
- attack and spy action start;
- central runtime activity display for PvP attack/spy;
- durable spy result display;
- durable PvP attack result display;
- PvP combat report integration;
- after-the-fact PvP notification routing;
- admin/balancer surfaces for PvP targeting, travel, protection, resources, rewards, Prestige context, reports and anti-abuse explainability.

PvP Foundation is not:

- a guild/siege implementation;
- a generic formula editor cleanup epic;
- a generic notification epic;
- a generic reports epic;
- an item/equipment mutation epic;
- a combat engine rewrite;
- a relocation/empty-address browser epic.

**Current DB/RPC foundation expected before Codex starts R tasks:**

- generated `database.types.ts` is regenerated after the latest PvP and formula-variable DB migrations;
- `get_pvp_target_candidates(...)`;
- `start_pvp_action(...)`;
- `get_my_pvp_spy_result(...)`;
- `get_my_pvp_attack_result(...)`;
- `get_hero_active_runtime_activity(...)`;
- `get_ui_metadata_entries(...)`;
- current notification read/action RPCs;
- current report read path;
- tables/dictionaries:
  - `pvp_action_kinds`;
  - `pvp_action_statuses`;
  - `pvp_actions`;
  - `pvp_target_protections`;
  - `pvp_spy_results`;
  - `pvp_attack_outcome_kinds`;
  - `pvp_attack_results`;
  - `game_report_types`;
  - `notification_types`;
  - `anti_abuse_signal_types`;
- metadata namespaces:
  - `pvp_configurator_section`;
  - `pvp_runtime_section`;
  - `pvp_targeting_section`;
  - `pvp_spy_section`;
  - `pvp_reward_section`;
  - `pvp_resource_transfer_section`;
  - `pvp_anti_abuse_section`;
  - `pvp_report_section`.

**Epic rules:**

- Use `/game/vicinity` for the PvP target surface.
- Do not add `/game/neighborhood`.
- Do not assume `hero.id === auth.uid()`.
- Use selected server and active hero context for player-owned PvP reads.
- Frontend must not directly insert, update or delete PvP, combat, report, notification, reward, resource, protection or anti-abuse rows.
- Start attack/spy only through `start_pvp_action(...)`.
- Load PvP target candidates only through `get_pvp_target_candidates(...)`.
- Load spy results only through `get_my_pvp_spy_result(...)`.
- Load attack results only through `get_my_pvp_attack_result(...)`.
- Do not call DB internal producer helpers from Angular.
- Do not create frontend fallbacks for missing DB contracts.
- Do not create incoming attack notifications.
- Do not create target spy notifications.
- Do not expose staff/admin/anti-abuse internals in player-facing PvP UI.
- Do not use `hero_derived`.
- PvP target selection is not a combat preview screen.
- PvP target selection is not a combat log screen.
- Ordinary PvP does not transfer items, buildings, Character Points or estate ownership.
- PvP resource consequences are limited to `drachma`, `materials` and `workforce`.
- Character Points come from XP through progression, not from a separate PvP CP reward.
- Prestige is future context only until a dedicated Prestige epic exists.
- Relationship declarations, including `mercenary_contract`, are anti-abuse context only and must not suppress signals.

---

## Task R0 — Generated DB types alignment

**Goal:** Align frontend generated DB types with the current PvP DB/RPC contract.

**Scope:**

- Regenerate generated Supabase DB types.
- Fix compile errors caused by changed PvP and formula-variable contracts.
- Confirm frontend code consumes current RPC signatures and generated table/function types.
- Do not edit generated DB types manually.

**Acceptance criteria:**

- Frontend compiles against regenerated types.
- PvP services can type RPC calls without local hand-written DB row substitutes.
- Old generated-type assumptions do not remain in PvP code.

---

## Task R1 — PvP domain models

**Goal:** Add typed frontend domain models for PvP player and admin surfaces.

**Scope:**

- Add domain models for:
  - PvP target candidate;
  - PvP action start result;
  - PvP runtime activity summary;
  - PvP spy result;
  - PvP attack result;
  - PvP report link/context;
  - PvP dictionary/metadata items where needed.
- Keep player-facing and admin-facing models distinct where needed.
- Keep generated DB rows out of components.

**Acceptance criteria:**

- PvP UI uses domain models instead of raw RPC payloads in components.
- Player-facing models do not expose anti-abuse or staff-only fields.

---

## Task R2 — PvP mappers

**Goal:** Map current DB/RPC PvP payloads into the R1 domain models.

**Scope:**

- Map:
  - target eligibility flags;
  - target reason keys;
  - travel/protection seconds;
  - spy snapshot sections;
  - attack outcome;
  - resource consequence summary;
  - XP/reward summary;
  - report context;
  - notification route context where needed.

**Acceptance criteria:**

- Null/optional metadata fields are handled safely.
- Mapping preserves enough information for both player UI and admin read-only surfaces.
- No anti-abuse metadata leaks into player-facing models.

---

## Task R3 — PvP player RPC service

**Goal:** Add the player PvP service boundary.

**Scope:**

- Add service methods for:
  - `get_pvp_target_candidates(...)`;
  - `start_pvp_action(...)`;
  - `get_my_pvp_spy_result(...)`;
  - `get_my_pvp_attack_result(...)`.
- Use selected server and active hero context.
- Surface RPC errors clearly.
- Do not query or mutate PvP tables directly from Angular.

**Acceptance criteria:**

- Player PvP reads and actions go through canonical RPCs.
- Service code does not assume `hero.id === auth.uid()`.
- Service code does not call internal producer helpers.

---

## Task R4 — PvP metadata read layer

**Goal:** Add read access to DB-backed PvP metadata for player/admin explainability.

**Scope:**

- Load PvP metadata through `get_ui_metadata_entries(...)`.
- Support the current PvP metadata namespaces:
  - `pvp_configurator_section`;
  - `pvp_runtime_section`;
  - `pvp_targeting_section`;
  - `pvp_spy_section`;
  - `pvp_reward_section`;
  - `pvp_resource_transfer_section`;
  - `pvp_anti_abuse_section`;
  - `pvp_report_section`.
- Map metadata entries to shared UI metadata models.

**Acceptance criteria:**

- PvP screens can use DB-backed labels/help text where available.
- Missing metadata does not become a gameplay fallback.

---

## Task R5 — Vicinity page route

**Goal:** Add the player-facing PvP target route.

**Scope:**

- Add `/game/vicinity`.
- Use existing game shell/page layout patterns.
- Render loading, empty and invariant/error states.
- Do not add `/game/neighborhood`.

**Acceptance criteria:**

- Player can navigate to `/game/vicinity`.
- Missing active hero/current estate is shown as an invariant/error state, not masked with fake data.
- Route uses existing player access guards.

---

## Task R6 — Vicinity navigation entry

**Goal:** Add navigation to the Vicinity page.

**Scope:**

- Add player navigation/sidebar entry labeled `Vicinity`.
- Link to `/game/vicinity`.
- Preserve existing route guard behavior.
- Do not rename unrelated mansion/estate routes.

**Acceptance criteria:**

- Vicinity is reachable from player navigation.
- No `Neighborhood` player route/label is introduced.

---

## Task R7 — Vicinity target candidate state

**Goal:** Add state/facade for loading PvP target candidates.

**Scope:**

- Load candidates for the active hero through PvP player service.
- Support the UI’s current needs for:
  - loading;
  - error;
  - empty state;
  - district filter;
  - search;
  - pagination.
- Guard async responses by active hero/server context.

**Acceptance criteria:**

- Candidate state is driven by `get_pvp_target_candidates(...)`.
- Frontend does not recompute PvP eligibility independently.
- Stale responses cannot overwrite current active hero/server state.

---

## Task R8 — Vicinity target list UI

**Goal:** Render PvP target candidates in the Vicinity page.

**Scope:**

- Render occupied target rows/cards.
- Show:
  - target hero display name;
  - target estate address;
  - target level;
  - distance score where useful;
  - attack travel time;
  - spy travel time;
  - protection state;
  - attack/spy eligibility.
- Current/self row must not be attackable if present.
- Empty plots are not PvP attack targets.

**Acceptance criteria:**

- Target list uses RPC candidate data.
- Target rows do not expose private account/staff fields.
- Target selection does not show combat preview/log.

---

## Task R9 — Vicinity eligibility reason display

**Goal:** Show readable attack/spy disabled reasons.

**Scope:**

- Display reason states for:
  - attacker busy;
  - target protected;
  - target below level range;
  - target above level range;
  - action unavailable.
- Use DB-backed labels/metadata where available.
- Keep raw reason keys secondary.

**Acceptance criteria:**

- Disabled attack/spy states are understandable.
- Eligibility display matches RPC output.

---

## Task R10 — Start spy action

**Goal:** Start a spy action from the Vicinity target list.

**Scope:**

- Call `start_pvp_action(...)` with action kind `spy`.
- Disable duplicate submit while pending.
- Refresh runtime activity after success.
- Refresh candidate state where useful.
- Use existing success/error message patterns.

**Acceptance criteria:**

- Spy starts through canonical RPC.
- No target spy notification is created or implied by frontend.
- No direct PvP table write is introduced.

---

## Task R11 — Start attack action

**Goal:** Start an attack action from the Vicinity target list.

**Scope:**

- Call `start_pvp_action(...)` with action kind `attack`.
- Show confirmation copy if current UI pattern requires it.
- Disable duplicate submit while pending.
- Refresh runtime activity after success.
- Refresh candidate/protection state after success.

**Acceptance criteria:**

- Attack starts through canonical RPC.
- Frontend does not create incoming attack notification UI.
- No direct PvP table write is introduced.

---

## Task R12 — PvP runtime activity display

**Goal:** Display active PvP attack/spy runtime state through the shared runtime activity model.

**Scope:**

- Reuse `get_hero_active_runtime_activity(...)` read path.
- Display active `pvp_attack` or `pvp_spy` state in relevant player surfaces.
- Include arrival/deadline data where available.
- Do not create a separate PvP busy flag.

**Acceptance criteria:**

- PvP runtime state is visible to the player.
- Exploration and PvP use the same central runtime model.

---

## Task R13 — Spy result read state

**Goal:** Add state/facade for reading one durable spy result.

**Scope:**

- Read through `get_my_pvp_spy_result(...)`.
- Handle:
  - loading;
  - missing result;
  - no access;
  - RPC error.
- Map result data through PvP spy result mapper.

**Acceptance criteria:**

- Spy result reads use the owner-safe RPC.
- State does not guess result ownership or target data.

---

## Task R14 — Spy result UI

**Goal:** Add player-facing spy result display.

**Scope:**

- Display safe spy snapshot sections:
  - target summary;
  - base stats;
  - resources;
  - equipment snapshot if present;
  - estate/building snapshot.
- Do not expose:
  - active exploration state;
  - active PvP runtime state;
  - staff/admin internals;
  - anti-abuse internals.

**Acceptance criteria:**

- Spy result is readable and player-safe.
- Target hero does not get implied access or notification.

---

## Task R15 — Attack result read state

**Goal:** Add state/facade for reading one PvP attack result.

**Scope:**

- Read through `get_my_pvp_attack_result(...)`.
- Handle:
  - loading;
  - missing result;
  - no access;
  - RPC error.
- Map:
  - outcome;
  - resource context;
  - reward context;
  - Prestige future context;
  - report context.

**Acceptance criteria:**

- Attack result reads use the owner-safe RPC.
- Player state does not expose anti-abuse metadata.

---

## Task R16 — Attack result UI

**Goal:** Add player-facing PvP attack result display.

**Scope:**

- Display:
  - outcome;
  - attacker/defender role labels;
  - resource consequence summary;
  - XP/reward summary;
  - report link if available.
- Prestige context may be shown only as future/non-final context.
- Do not show item/building/estate/CP transfer as ordinary PvP consequences.

**Acceptance criteria:**

- PvP attack result is understandable after the fact.
- Display matches DB result context.

---

## Task R17 — PvP report integration

**Goal:** Integrate `pvp_combat` reports into the existing Reports UI.

**Scope:**

- Handle report type `pvp_combat`.
- Handle report source `pvp_result`.
- Render combat section through existing report data path.
- Preserve report access rules.
- Do not duplicate combat result attacks in frontend state.

**Acceptance criteria:**

- PvP combat reports are readable through the Reports UI.
- Player-facing report wrapper is `pvp_result`.

---

## Task R18 — PvP notification routing

**Goal:** Route PvP notifications to the correct player surfaces.

**Scope:**

- Handle:
  - `pvp.attack_result.attacker`;
  - `pvp.attack_result.defender`;
  - `pvp.spy_result.ready`.
- Route attack result notifications to result/report surface.
- Route spy result notifications to spy result/PvP surface.
- Use existing notification center/action link patterns.

**Acceptance criteria:**

- PvP notification actions are useful.
- No incoming attack notification behavior is introduced.
- No target spy notification behavior is introduced.

---

## Task R19 — PvP admin overview

**Goal:** Add read-only admin/balancer overview for PvP Foundation.

**Scope:**

- Show high-level PvP foundation sections from DB metadata.
- Summarize:
  - action kinds;
  - targeting;
  - runtime;
  - spy;
  - resources;
  - rewards;
  - reports;
  - anti-abuse.
- Use existing admin layout patterns.

**Acceptance criteria:**

- Admin overview is DB metadata backed.
- Overview does not imply unimplemented siege/guild/Prestige functionality exists.

---

## Task R20 — PvP action lifecycle admin surface

**Goal:** Show PvP action kinds and action statuses in admin/balancer UI.

**Scope:**

- Display `pvp_action_kinds`.
- Display `pvp_action_statuses`.
- Show active/future state for attack, spy and siege.
- Show blocking/terminal lifecycle meaning where available.

**Acceptance criteria:**

- Admin can understand PvP action lifecycle.
- Siege is clearly future/inactive.

---

## Task R21 — PvP targeting/protection balancer surface

**Goal:** Add admin/balancer surface for PvP target eligibility and protection.

**Scope:**

- Show attack min/max target level formula targets.
- Show target protection formula target.
- Show target protection metadata/explanation.
- Show one-incoming-attack rule explanation from DB metadata.
- Use existing formula admin/read patterns.

**Acceptance criteria:**

- Balancer can inspect targeting/protection configuration.
- UI does not hardcode formula variables or expressions.

---

## Task R22 — PvP travel/manual-window balancer surface

**Goal:** Add admin/balancer surface for PvP travel and manual fight timing.

**Scope:**

- Show attack travel time formula target.
- Show spy travel time formula target.
- Show manual fight window formula target.
- Display seconds units clearly.
- Use existing formula admin/read patterns.

**Acceptance criteria:**

- Balancer can inspect travel/manual window configuration.
- Time unit is clear.

---

## Task R23 — PvP resource consequence balancer surface

**Goal:** Add admin/balancer surface for PvP resource consequences.

**Scope:**

- Show eligible resources:
  - drachma;
  - materials;
  - workforce.
- Show attacker victory transfer formula.
- Show defender victory attacker-loss sink formula.
- Show ordinary PvP forbidden consequence boundaries.

**Acceptance criteria:**

- Balancer can inspect resource consequence settings.
- UI does not imply CP/item/building/estate transfer.

---

## Task R24 — PvP XP/reward balancer surface

**Goal:** Add admin/balancer surface for PvP XP reward routing.

**Scope:**

- Show PvP reward outcomes:
  - attacker_victory;
  - defender_victory;
  - draw.
- Show reward profile assignments for PvP outcomes.
- Show `pvp_xp_reward` formula target.
- Explain CP derived from XP.

**Acceptance criteria:**

- Balancer can inspect PvP reward routing.
- UI does not imply standalone PvP CP rewards.

---

## Task R25 — PvP Prestige context admin surface

**Goal:** Add read-only admin/balancer surface for future PvP Prestige context.

**Scope:**

- Show `pvp_prestige_delta_context`.
- Show:
  - recipientLevel;
  - opponentLevel;
  - opponentLevelDelta;
  - outcomeMultiplier.
- Make clear this is future context only.

**Acceptance criteria:**

- Prestige context is understandable.
- UI does not claim hidden Prestige points/ranks are implemented.

---

## Task R26 — PvP anti-abuse explainability surface

**Goal:** Add staff/admin explainability for PvP anti-abuse signals.

**Scope:**

- Show:
  - `same_ip_pvp_attack`;
  - `pvp_feeding_pattern`;
  - relationship declaration context;
  - `mercenary_contract` as context, not allowlist.
- Make clear signals are review aids only.
- Do not expose raw IP/device identifiers.

**Acceptance criteria:**

- Staff/admin can understand PvP anti-abuse signal meaning.
- UI does not imply automatic punishment or declaration-based suppression.

---

## Task R27 — PvP report producer admin surface

**Goal:** Add admin read-only surface explaining PvP report production.

**Scope:**

- Show `pvp_combat` report type.
- Show `source_entity_type = pvp_result`.
- Show that combat section resolves through linked combat result.
- Explain that combat attacks are not duplicated into report tables.

**Acceptance criteria:**

- Admin can understand PvP report wrapping.
- UI does not imply low-level combat report duplication.

---

## Task R28 — PvP foundation diagnostic admin surface

**Goal:** Add admin read-only surface for PvP foundation diagnostics if project architecture supports it.

**Scope:**

- Display `inspect_pvp_foundation_integration_state(...)` through an approved admin/service boundary.
- Show:
  - structural status;
  - formula status;
  - missing functions/triggers;
  - incoming notification count;
  - positive smoke prerequisites.
- If browser access to this service-only diagnostic is not allowed, show a clear backend/admin dependency instead.

**Acceptance criteria:**

- Admin can understand current PvP foundation readiness.
- No service-role secret is exposed to the browser.
- No test data is created.

---

# Epic S — Item Equipment, Armory and Loadout Presets

Epic S implements player-facing and admin-facing integration for the DB-owned item/equipment foundation.

This epic covers:

- current equipment/loadout read models;
- equip and unequip workflows;
- bulk equip workflows;
- loadout presets;
- armory shelves;
- item requirements display;
- item lifecycle display for active, locked and scrapped items;
- item runtime usability alignment for PvE, PvP, combat, spy and derived stat resolution;
- admin/balancer surfaces for item requirement aggregation and item lifecycle configuration.

Epic S is not:

- a generic item generation epic;
- a generic formula editor cleanup epic;
- a generic trade/auction epic;
- a future item set bonus epic;
- a combat engine rewrite;
- a PvP epic;
- a UI/UX naming polish epic for final shelf copy.

**Current DB/RPC foundation expected before Codex starts S tasks:**

- generated `database.types.ts` is regenerated after the S DB/RPC migrations;
- `hero_equipment` remains the source of equipped state;
- `items.status` includes:
  - `active`;
  - `scrapped`;
  - `locked_trade`;
  - `locked_auction`;
- owner-safe equipment read RPC exists;
- owner-safe equip/unequip RPCs exist;
- owner-safe bulk equip RPC exists;
- owner-safe preset read/write/apply RPCs exist;
- owner-safe armory/shelf read/write RPCs exist where needed;
- item requirement preview/read RPC exists where needed;
- runtime/equipment resolver treats `active`, `locked_trade`, `locked_auction` as usable equipped statuses;
- scrapped item retention/cleanup rules exist in DB;
- DB-owned result payloads for equip/bulk/preset apply return a readable operation journal.

If any of these DB/RPC contracts are missing, Codex must report a DB dependency instead of creating direct table mutations or frontend fallback logic.

**Epic rules:**

- Frontend must not directly insert, update or delete `hero_equipment`.
- Frontend must not directly mutate durable item lifecycle state.
- Frontend must not invent equipment eligibility rules outside DB/RPC results.
- Frontend must not assume `hero.id === auth.uid()`.
- Player-owned reads use selected server and active hero.
- Equip/unequip/bulk/preset apply must use canonical RPCs.
- There is no `items.status = equipped`.
- `hero_equipment` is the source of equipped state.
- Item can be equipped if it belongs to the hero and is not `scrapped`.
- Runtime usable equipped statuses are:
  - `active`;
  - `locked_trade`;
  - `locked_auction`.
- `scrapped` items are excluded from runtime loadout.
- `locked_trade` and `locked_auction` block new market/lifecycle actions where appropriate, but do not block wearing.
- Locked equipped items still count for runtime loadout.
- Trade/auction lock does not auto-unequip.
- Ownership transfer or scrap clears equipment.
- Player can unequip locked items.
- Equip/unequip does not require a user-provided reason.
- Normal player equip/unequip changes are not classic audit-log workflows.
- Staff/admin recovery, transfer, sanction and lifecycle corrections must be auditable.
- Item requirements are equip/use requirements, not generation requirements.
- Item requirements use hero level and primary/base stats.
- Item requirements do not use resources, prestige, buildings, districts or trade routes.
- No item instance requirements.
- Requirements come from base/prefix/suffix and quality requirement multiplier.
- Bonus values from item layers sum absolutely.
- Requirements use global item aggregation rules.
- Candidate item cannot help itself equip.
- Later requirement loss does not unequip an item.
- Failed single equip does not remove the currently equipped item.
- Bulk equip applies what can be applied and reports failures.
- Hand and ring rotation are DB/RPC workflow behavior.
- Two-handed and ranged items use both hands and are stored in `main_hand`.
- Preset uses literal slots and exact item IDs.
- Preset is not an item set.
- The word `set` is reserved for future item set bonuses.
- Shelves are armory organization, not equipment state.
- There are always 10 shelves.
- Shelf 1 is the default drop shelf.
- Final player-facing shelf naming belongs to UI/UX later; DB/code may use `shelf`.

---

## Task S0 — Generated DB types alignment after item/equipment foundation

**Goal:** Align generated frontend DB types with the current item/equipment DB/RPC foundation.

**Scope:**

- Regenerate generated Supabase database types after S DB/RPC migrations.
- Fix compile errors caused by new/changed item/equipment RPC signatures.
- Confirm generated types expose the current item/equipment/preset/shelf contracts.
- Do not edit generated DB types manually.
- Do not create frontend substitutes for missing RPCs.

**Acceptance criteria:**

- Frontend compiles against regenerated types.
- S services can type canonical RPC calls.
- No manual generated-type edits exist.

---

## Task S1 — Item and equipment domain models

**Goal:** Add typed frontend domain models for item equipment, armory and presets.

**Scope:**

- Add domain models for:
  - item summary;
  - item lifecycle state;
  - item equipment slot;
  - current equipment/loadout;
  - equipment operation journal;
  - item requirement preview;
  - armory shelf;
  - loadout preset;
  - loadout preset slot item.
- Keep generated DB/RPC rows behind mappers.
- Keep player-facing and admin-facing models separate where needed.
- Preserve exact item IDs for equipment and preset flows.

**Acceptance criteria:**

- Components do not consume raw DB rows directly.
- Models distinguish item lifecycle, current equipment and armory organization.
- Preset models use exact item IDs and literal slots.

---

## Task S2 — Item and equipment mappers

**Goal:** Map current DB/RPC item/equipment payloads into domain models.

**Scope:**

- Map:
  - current equipment;
  - equipped item display data;
  - armory item display data;
  - lifecycle status;
  - requirement preview;
  - equipment operation journal;
  - preset read/apply result;
  - shelf display data.
- Preserve operation result fields:
  - equipped;
  - shifted;
  - unequipped;
  - failed;
  - skipped;
  - final equipment.
- Do not hide partial success/failure details.

**Acceptance criteria:**

- Mappers handle nullable item layers and missing preset items safely.
- Player-facing mapping does not expose staff/admin-only fields.
- Operation journals remain readable to UI.

---

## Task S3 — Equipment RPC service

**Goal:** Add player equipment service methods over canonical DB/RPC contracts.

**Scope:**

- Add service methods for:
  - current equipment read;
  - single item equip;
  - slot unequip;
  - bulk equip;
  - operation result reload if needed.
- Use active hero and selected server scope.
- Do not direct-write `hero_equipment`.
- Do not add local equip eligibility fallback.

**Acceptance criteria:**

- Equip/unequip calls go through canonical RPCs.
- Service does not require user-provided reason.
- Service preserves DB operation journal payload.

---

## Task S4 — Current equipment read state

**Goal:** Add state/facade for reading and refreshing the current hero equipment.

**Scope:**

- Load current equipment for active hero.
- Expose current equipment by slot.
- Expose loading/error/empty state.
- Refresh after equip, unequip, bulk equip and preset apply.
- Guard async responses by active hero/server scope.

**Acceptance criteria:**

- Current equipment state is sourced from DB/RPC.
- Stale responses do not overwrite current active hero/server state.
- Missing active hero is surfaced as an invariant/error state.

---

## Task S5 — Equipment paperdoll UI

**Goal:** Render current equipment by slot.

**Scope:**

- Display:
  - `main_hand`;
  - `off_hand`;
  - `helmet`;
  - `armor`;
  - `pants`;
  - `boots`;
  - `amulet`;
  - `ring_1`;
  - `ring_2`.
- Show item name/layers/status where useful.
- Show empty slots.
- Show locked status without implying the item is unusable.
- Do not implement equip action in this task unless already provided by S7.

**Acceptance criteria:**

- Player can see current equipment.
- Locked equipped item is shown as equipped, not hidden.
- Empty slot and item lifecycle states are clear.

---

## Task S6 — Armory shelf read state

**Goal:** Add state/facade for armory inventory organized by shelves.

**Scope:**

- Load armory items for active hero.
- Load shelf names/metadata.
- Preserve 10 shelf structure.
- Treat shelf 1 as default drop shelf.
- Respect current DB visibility rules for armory/building limits.
- Do not delete or hide item rows because they are outside visible range.
- Respect armory building level visibility limit.
- Load/read only the visible item range according to DB/RPC.
- Do not treat non-visible items as deleted.
- Surface visibility limit metadata if DB/RPC returns it.

**Acceptance criteria:**

- Armory state distinguishes visible items from existing-but-not-visible items where DB supports it.
- Shelf number is preserved.
- Shelf organization is not confused with equipment state.

---

## Task S7 — Armory shelf UI

**Goal:** Render player armory shelves and item lists.

**Scope:**

- Show 10 shelves.
- Show hero-local shelf names where available.
- Show item cards/list entries per visible shelf.
- Show item lifecycle status:
  - active;
  - locked_trade;
  - locked_auction;
  - scrapped where relevant/admin-safe surfaces expose it.
- Show locked items as wearable if equipped/equippable according to DB result.
- Do not create final UI naming polish for shelves here.
- Show that the armory building level limits how many items are visible.
- If DB/RPC exposes it, show visible count / total owned count / next visibility upgrade hint.
- Do not imply hidden items are gone.

**Acceptance criteria:**

- Player can browse visible armory items by shelf.
- Locked items are not incorrectly treated as unusable equipment.
- Shelf UI does not imply hidden items were deleted.

---

## Task S8 — Armory shelf management

**Goal:** Add player-facing shelf organization actions through canonical RPCs.

**Scope:**

- Rename shelf where DB/RPC supports it.
- Move item to another shelf where DB/RPC supports it.
- Preserve item shelf number through mappers.
- Do not mutate `items.armory_shelf_position` directly from Angular.

**Acceptance criteria:**

- Shelf rename/move uses canonical RPCs.
- Item movement does not change equipment state.
- Missing DB write path is reported as dependency.

---

## Task S9 — Item detail / popover equipment data

**Goal:** Show item details needed for equipment decisions.

**Scope:**

- Display:
  - quality;
  - prefix;
  - base;
  - suffix;
  - status;
  - shelf;
  - current equipped state;
  - requirement preview;
  - bonuses;
  - drachma value.
- Distinguish:
  - economic value;
  - requirements;
  - bonuses;
  - lifecycle status.
- Do not imply expensive item is always useful.

**Acceptance criteria:**

- Item detail makes requirements and bonuses readable.
- Locked status is explained as market/lifecycle reservation, not equipment ban.
- Scrapped items are not shown as normal usable items.

---

## Task S10 — Item requirement display

**Goal:** Display resolved item equip requirements from DB/RPC.

**Scope:**

- Show final resolved requirements for:
  - hero level;
  - primary/base stats.
- Show source/layer breakdown if DB/RPC exposes it:
  - base;
  - prefix;
  - suffix;
  - quality requirement multiplier.
- Do not show resources/prestige/building/district/trade route requirements for item equip.
- Do not compute final requirement values locally if DB/RPC provides them.

**Acceptance criteria:**

- Requirement display matches DB result.
- UI distinguishes requirements from costs and bonuses.
- Item instance requirements are not introduced.

---

## Task S11 — Equip single item action

**Goal:** Wire single item equip through canonical RPC.

**Scope:**

- Equip selected item from armory/item detail.
- Support explicit slot where the UI provides it.
- Otherwise use DB/RPC automatic behavior.
- Display operation journal result:
  - equipped;
  - shifted;
  - unequipped;
  - failed.
- Failed equip must leave previous UI state consistent with DB result.

**Acceptance criteria:**

- Single equip uses canonical RPC.
- No direct `hero_equipment` write exists.
- Failure message shows why the item did not equip.
- Existing item is not shown as removed when DB did not remove it.

---

## Task S12 — Unequip slot action

**Goal:** Wire unequip through canonical RPC.

**Scope:**

- Unequip a selected slot.
- Allow unequip of locked items.
- Do not change item status.
- Do not cancel trade/auction lock.
- Refresh current equipment and armory state after success.

**Acceptance criteria:**

- Unequip uses canonical RPC.
- Locked item can be unequipped without cancelling its lock.
- UI state refreshes from DB after action.

---

## Task S13 — Bulk equip action

**Goal:** Add player-facing bulk equip workflow where the UI needs multi-item equip.

**Scope:**

- Submit ordered item list through canonical bulk equip RPC.
- Preserve input order.
- Display per-step result:
  - equipped;
  - shifted;
  - unequipped;
  - failed;
  - skipped.
- Do not stop client-side on first failure unless DB result says operation stopped.
- Do not locally simulate requirements.

**Acceptance criteria:**

- Bulk equip uses canonical RPC.
- Partial success is visible.
- Failed items do not hide successful earlier steps.

---

## Task S14 — Preset domain service

**Goal:** Add service methods for loadout preset read/write/apply.

**Scope:**

- Add service methods for:
  - read presets;
  - rename preset;
  - clear preset;
  - overwrite preset with current equipment;
  - apply preset;
  - preview preset if DB/RPC supports it.
- Preserve exact item IDs and literal slots.
- Do not use JSON as frontend authority if DB returns relational rows.

**Acceptance criteria:**

- Preset operations use canonical RPCs.
- Service preserves exact item ID mapping.
- Missing preset RPC is reported as DB dependency.

---

## Task S15 — Preset management UI

**Goal:** Add player-facing management for loadout presets.

**Scope:**

- Show available preset slots.
- Allow rename.
- Allow clear.
- Allow overwrite with current equipment.
- Do not delete preset rows.
- Do not use the word `set` for this feature.

**Acceptance criteria:**

- Player can manage preset names and contents.
- Preset slots remain stable.
- UI copy avoids confusing presets with future item sets.

---

## Task S16 — Preset preview UI

**Goal:** Show what a preset contains before applying it.

**Scope:**

- Display preset slots and exact items.
- Show:
  - item owned and available;
  - item missing;
  - item no longer owned;
  - item scrapped;
  - empty slot.
- Show literal target slots.
- Do not run local requirement checks for preset privilege.

**Acceptance criteria:**

- Player can see what will be applied and what is missing.
- Missing/unavailable preset items are clear.
- Preview does not imply similar items can substitute exact IDs.

---

## Task S17 — Apply preset action

**Goal:** Apply a loadout preset through canonical RPC.

**Scope:**

- Apply available exact item IDs into literal saved slots.
- Do not move unrelated current equipment unless DB result says it changed.
- Do not use hand/ring rotation.
- Display DB operation journal:
  - applied;
  - skipped;
  - failed;
  - final equipment.
- Refresh current equipment and armory after success.

**Acceptance criteria:**

- Preset apply uses canonical RPC.
- Preset applies what is available and does not disturb the rest.
- Requirement recheck is not done on the frontend.
- Partial result is visible.

---

## Task S18 — Preset update suggestion

**Goal:** Add a non-intrusive UI suggestion when current equipment differs from a preset.

**Scope:**

- Compare current equipment with selected preset where data is available.
- Offer a non-blocking action to overwrite preset with current equipment.
- Do not auto-update preset.
- Do not nag the player repeatedly.

**Acceptance criteria:**

- Player can intentionally update a preset.
- Suggestion is non-intrusive.
- Preset update still uses canonical RPC.

---

## Task S19 — Item lifecycle actions alignment

**Goal:** Align item lifecycle UI with current DB rules.

**Scope:**

- Ensure active item scrap/vendor flows respect canonical RPCs.
- Show that scrapping equipped active item removes it from equipment after DB action.
- Show locked item cannot be scrapped/vendor sold while locked.
- Do not require a confirmation for every scrap action unless an existing batch/destructive pattern requires it.
- Refresh armory/equipment after lifecycle actions.

**Acceptance criteria:**

- Scrap/vendor uses canonical DB/RPC path.
- Equipped item disappears from equipment after successful scrap/vendor.
- Locked items are not offered as scrap/vendor candidates.

---

## Task S20 — Scrapped item staff recovery surface

**Goal:** Align staff/admin scrapped item recovery UI with affix-item retention rules.

**Scope:**

- Show recoverable scrapped affix items where staff/admin RPC allows it.
- Do not imply no-affix items are recoverable after hard delete.
- Show retention/expiry if DB exposes it.
- Recovery uses canonical staff/admin RPC.
- Staff/admin recovery remains auditable through DB workflow.

**Acceptance criteria:**

- Staff/admin can inspect recoverable scrapped affix items.
- Recovery UI does not imply ordinary no-affix item recovery.
- Recovery uses canonical RPC.

---

## Task S21 — Equipment runtime usability alignment

**Goal:** Align frontend runtime/read-model assumptions with DB usable equipment statuses.

**Scope:**

- Ensure current equipment/read-model consumers treat these equipped statuses as usable:
  - active;
  - locked_trade;
  - locked_auction.
- Ensure `scrapped` is excluded.
- Update affected item/equipment display and derived-runtime consumers after DB resolver migration.
- Do not reintroduce frontend-only filtering that contradicts DB.

**Acceptance criteria:**

- Locked equipped items still appear in current loadout.
- Locked equipped items are not treated as bonusless merely because they are locked.
- Runtime display matches DB/resolver behavior.

---

## Task S22 — PvE equipment integration read alignment

**Goal:** Ensure PvE player surfaces consume current loadout/equipment state consistently.

**Scope:**

- Align exploration/trial/encounter read displays with current equipment behavior where the UI shows relevant stats/loadout.
- Do not compute authoritative PvE stat checks in Angular.
- Surface DB/runtime data where available.
- Respect live/per-turn loadout decision where DB/runtime exposes it.

**Acceptance criteria:**

- PvE surfaces do not show stale assumptions about active-only equipment.
- Frontend does not fake resolver behavior.

---

## Task S23 — Combat/manual equipment display alignment

**Goal:** Ensure combat/manual surfaces display equipment/runtime stat assumptions consistently.

**Scope:**

- Show current equipment/stat data as provided by DB/runtime.
- Do not assume manual combat uses a static equipment snapshot if DB/runtime provides per-turn/live state.
- Do not recalculate authoritative walking-dead or hit-window values locally unless the DB/RPC contract marks it as preview-only.

**Acceptance criteria:**

- Combat UI messaging matches current loadout/stat decision.
- Manual combat display does not contradict per-turn loadout behavior.

---

## Task S24 — PvP and spy equipment display alignment

**Goal:** Ensure PvP and spy surfaces consume equipment snapshot/loadout decisions correctly.

**Scope:**

- Spy result displays current equipment snapshot from DB.
- PvP target/result/report surfaces do not imply item transfer/loss from ordinary PvP.
- PvP surfaces treat equipment as part of runtime stat/loadout resolution, not as PvP reward/consequence.

**Acceptance criteria:**

- Spy equipment snapshot is displayed safely.
- PvP UI does not imply item theft/destruction.
- PvP equipment assumptions match DB/runtime.

---

## Task S25 — Item requirement admin/balancer surface

**Goal:** Add admin/balancer readability for item requirement aggregation.

**Scope:**

- Show global item requirement aggregation configuration once DB exposes it.
- Show quality requirement multiplier separately from bonus/value multiplier.
- Show base/prefix/suffix requirement contributions.
- Do not create per-item instance requirement UI.
- Do not create per-stat local rules unless DB foundation explicitly exposes them.
- If DB/RPC exposes armory building visibility rules, admin/balancer UI may show them as part of building/armory balance.
- Do not create a separate admin surface just for shelf visibility unless needed later.

**Acceptance criteria:**

- Balancer can understand how final item requirements are formed.
- UI does not imply item instance requirements exist.
- Quality requirement multiplier is distinct from bonus/value multiplier.

---

## Task S26 — Item quality admin/balancer alignment

**Goal:** Align item quality admin UI with separate value/bonus and requirement multipliers.

**Scope:**

- Show quality label/key.
- Show value/bonus multiplier.
- Show requirement multiplier.
- Preserve current quality generation semantics.
- Do not hardcode multipliers in Angular.

**Acceptance criteria:**

- Admin can distinguish power/value scaling from requirement scaling.
- Quality settings come from DB/config/read model.

---

# Epic T — Guild Foundation

Epic T implements the player-facing guild foundation over DB/RPC-owned guild contracts.

Guilds in Mythsworn are a simple organization layer for:

- shared guild armory / item lending;
- future siege support;
- future Argonautics support;
- emergency leadership recovery.

Epic T is not:

- siege implementation;
- Argonautics implementation;
- guild-to-guild diplomacy;
- alliances / non-aggression pacts / war declarations;
- district influence;
- guild reputation;
- guild buildings;
- a social activity feed;
- a player-facing audit/history log for every guild action.

**Current DB/RPC foundation expected before Codex starts Epic T tasks:**

- generated `database.types.ts` regenerated after Guild DB/RPC migrations;
- guild identity/read RPCs exist;
- guild creation RPC exists;
- guild membership read RPCs exist;
- invite and request-to-join RPCs exist;
- accept/reject invite/request RPCs exist;
- kick/leave/disband/leadership RPCs exist where relevant;
- emergency leader election RPCs exist;
- guild armory read/write/loan RPCs exist;
- guild armory access lock RPCs exist;
- guild config/read model exists for:
  - creation cost;
  - member limit formula/config;
  - emergency leader inactivity threshold;
  - nomination duration;
  - voting duration;
  - max candidates;
  - guild armory capacity.
- DB enforces hero/server ownership and guild membership rules.
- DB enforces that guild armory loan does not change `items.hero_id`.
- DB enforces that borrowed guild items cannot be traded/auctioned/scrapped/vendor-sold by borrower.
- DB enforces that owner/leader/officer force-return and withdraw/remove end loans where needed.
- DB/RPC returns readable operation results for guild armory actions.

If any of these DB/RPC contracts are missing, Codex must report a DB dependency instead of creating direct table writes or frontend fallback logic.

**Epic rules:**

- Frontend must not direct-insert/update/delete guild, membership, election, invite, request, armory or loan rows.
- Frontend must not mutate `items.hero_id` for guild armory loans.
- Frontend must not mutate `hero_equipment` directly.
- Frontend must not fake guild membership or guild role state.
- Frontend must not assume `hero.id === auth.uid()`.
- All player guild actions use active hero and selected server.
- A hero can belong to only one guild on a server.
- Guild is server-scoped.
- Membership is hero-based.
- Roles are:
  - leader;
  - officer;
  - member.
- There is one officer.
- Leader has full guild authority.
- Officer can invite, accept/reject requests, kick, manage guild armory, force-return guild items and block armory access per member.
- Officer cannot disband the guild.
- Leader can disband the guild.
- Guild creation has DB/config-owned cost.
- Guild name is unique per server.
- Guild tag is guild identity/display/search data where DB exposes it.
- Member limit depends on leader level and DB/config/formula.
- Guild armory is lending, not trade.
- Guild armory deposit/loan does not change item owner.
- Borrowed guild item can be equipped and can be part of presets.
- Borrower cannot trade, auction, scrap or vendor-sell borrowed item.
- Owner can withdraw/force-return/sell/trade/auction/scrap their own item according to DB rules.
- Leader/officer can remove items from guild armory.
- Removed/withdrawn item disappears from guild armory; it does not remain as a visible historical item.
- Guild armory user-facing item states are only:
  - available;
  - borrowed.
- Guild armory access lock is per member.
- Blocked member cannot borrow or deposit.
- Blocked member can return borrowed items.
- Blocked member may still view guild armory read-only if DB/RPC allows it.
- No player-facing full click history/log of guild armory actions.
- UI may show current state such as “borrowed by X”.
- Emergency leader election is a recovery election, not a normal confidence vote.
- Emergency leader election starts only when leader inactivity threshold is met.
- Election has nomination phase and voting phase.
- No quorum.
- Candidate with most votes wins; tie goes to earlier nomination.
- Siege/Argonautics are future systems and must not be implemented in Epic T.

---

## Task T0 — Align generated DB types after guild foundation

**Goal:** Synchronize generated frontend DB types with the current guild DB/RPC contract.

**Scope:**

- Regenerate/update Supabase database types after guild DB/RPC migrations.
- Fix compile errors caused by new/changed guild RPC signatures.
- Confirm generated types expose current guild contracts:
  - guild read models;
  - guild creation;
  - membership;
  - invites;
  - join requests;
  - roles;
  - officer management;
  - emergency election;
  - guild armory;
  - guild armory loans;
  - armory access locks;
  - guild config/read models.
- Do not edit generated DB types manually.
- Do not add frontend substitutes for missing RPCs.

**Acceptance criteria:**

- Frontend compiles against regenerated types.
- Guild services can type canonical RPC calls.
- No manual generated-type edits exist.

---

## Task T1 — Guild domain models and mappers

**Goal:** Add typed frontend domain models for guild identity, membership, roles and configuration.

**Scope:**

- Add models for:
  - guild summary;
  - guild detail;
  - guild role;
  - guild membership;
  - guild member list item;
  - guild invite;
  - guild join request;
  - guild config summary;
  - current hero guild state.
- Map DB/RPC payloads through explicit mappers.
- Preserve selected server and active hero boundaries.
- Keep raw DB rows out of components.
- Keep guild staff/admin fields separate from player-facing models if DB exposes them.

**Acceptance criteria:**

- Components consume domain models, not raw DB rows.
- Guild role and membership state are explicit.
- Mapper handles missing/null optional fields safely.
- Build and focused mapper tests pass.

---

## Task T2 — Guild read service and current guild state

**Goal:** Add a player-facing service/state layer for the current hero’s guild.

**Scope:**

- Load current hero guild membership through canonical RPC/read contract.
- Load guild summary/detail for current hero’s guild.
- Expose:
  - no guild state;
  - member state;
  - officer state;
  - leader state;
  - loading/error state.
- Guard async responses by selected server and active hero.
- Do not query or mutate guild tables directly if RPC/read model exists.

**Acceptance criteria:**

- Current guild state resolves from active hero/server.
- No-guild state is explicit.
- Role-specific capabilities are derived from DB/RPC state.
- Stale responses do not overwrite current selected server/hero state.

---

## Task T3 — Guild discovery and search

**Goal:** Add player-facing guild discovery/search over DB/RPC read models.

**Scope:**

- Add service/state for guild list/search.
- Search by guild name and tag where DB supports it.
- Show:
  - name;
  - tag;
  - member count;
  - member limit;
  - whether current hero can request to join;
  - current request/invite status if available.
- Do not expose staff-only metadata.
- Do not fake member counts client-side.

**Acceptance criteria:**

- Player can browse/search guilds on selected server.
- Name/tag display comes from DB.
- Join availability reflects DB/RPC state.
- No direct guild table mutation is introduced.

---

## Task T4 — Create guild flow

**Goal:** Allow an eligible hero to create a guild through the canonical RPC.

**Scope:**

- Add create guild service action.
- Add create guild UI/form where appropriate.
- Include:
  - guild name;
  - guild tag if DB requires/exposes it.
- Show DB/config-owned creation cost.
- Submit through create guild RPC.
- Refresh current guild state after success.
- Surface uniqueness/cost/eligibility errors from RPC.

**Acceptance criteria:**

- Guild creation uses canonical RPC only.
- Creation cost is displayed from DB/read model, not hardcoded.
- Name/tag uniqueness errors are readable.
- Hero already in a guild cannot create another guild.

---

## Task T5 — Guild invites

**Goal:** Implement invite flow through DB/RPC contracts.

**Scope:**

- Leader/officer can invite an eligible hero.
- Invited hero can accept or reject invite.
- Show pending invites relevant to current hero.
- Show pending outgoing invites where leader/officer view supports it.
- Use canonical RPCs for invite, accept and reject.
- Do not implement direct membership insertion.

**Acceptance criteria:**

- Invite workflow uses RPC only.
- Leader/officer permissions come from DB/RPC.
- Accepting invite refreshes current guild state.
- Rejected/expired/invalid invite states are surfaced clearly.

---

## Task T6 — Request-to-join flow

**Goal:** Implement request-to-join flow through DB/RPC contracts.

**Scope:**

- Hero without guild can request to join a guild.
- Leader/officer can accept or reject join requests.
- Current hero can see own pending requests.
- Guild leader/officer can see incoming requests.
- Use canonical RPCs only.
- Refresh current guild and discovery state after mutations.

**Acceptance criteria:**

- Request-to-join is available in addition to invites.
- Accepting request creates membership through DB/RPC workflow.
- Rejection/duplicate/ineligible states are readable.
- No direct guild membership table mutation exists.

---

## Task T7 — Guild member management

**Goal:** Add guild member list and role-aware member actions.

**Scope:**

- Show guild member list:
  - hero name;
  - role;
  - membership status where exposed;
  - last activity if DB/RPC exposes it;
  - armory access lock state if exposed.
- Leader/officer can kick members according to DB/RPC rules.
- Leader can promote/demote the single officer according to DB/RPC rules.
- Officer cannot disband guild.
- Member actions use canonical RPCs.
- Refresh member list and current guild state after actions.

**Acceptance criteria:**

- Member list is role-aware.
- Officer management respects one-officer rule.
- Kick/promote/demote uses RPC only.
- Current user cannot perform actions not allowed by their role.

---

## Task T8 — Guild leave and disband actions

**Goal:** Wire guild leave/disband behavior through canonical RPCs.

**Scope:**

- Member/officer can leave guild where DB rules allow.
- Leader cannot simply leave if DB requires disband or leadership transfer.
- Leader can disband guild through canonical RPC.
- Disband action is clearly destructive.
- If DB blocks disband during active siege-related state, surface that error.
- Refresh current guild state after success.

**Acceptance criteria:**

- Leave/disband use RPC only.
- Leader restrictions are respected.
- Disband is not available to officer/member.
- Active-siege blocker is surfaced if DB returns it.
- No frontend deletion of guild rows exists.

---

## Task T9 — Emergency leader election read state

**Goal:** Add read state for emergency leader election.

**Scope:**

- Load current emergency election state for current guild.
- Display:
  - whether election can be started;
  - leader inactivity threshold/status where DB exposes it;
  - nomination phase;
  - voting phase;
  - candidates;
  - votes summary if DB exposes it;
  - time remaining.
- Do not compute leader inactivity locally if DB/RPC provides the decision.
- Do not create normal confidence-vote UI.

**Acceptance criteria:**

- Player can see whether emergency election is available.
- Election phase is clear.
- UI reflects DB/RPC timing and eligibility.
- No quorum/50% requirement is shown.

---

## Task T10 — Emergency leader election actions

**Goal:** Implement emergency leader election actions through canonical RPCs.

**Scope:**

- Any member can start election when DB allows it.
- During nomination phase, eligible members can nominate candidates.
- Candidate consent is not required.
- Enforce max candidate count through DB/RPC result.
- During voting phase, eligible members can vote.
- Show result after completion.
- Refresh guild state when election changes leader.

**Acceptance criteria:**

- Start/nominate/vote actions use RPC only.
- 6h nomination + 12h voting semantics are represented from DB/RPC data.
- Max 3 candidates is shown from DB/config where exposed.
- Most votes wins; earlier nomination tie-breaker is presented in explanatory copy if useful.
- No client-side election result calculation is authoritative.

---

## Task T11 — Guild armory domain models and service

**Goal:** Add frontend models and service methods for guild armory and loans.

**Scope:**

- Add models for:
  - guild armory item;
  - guild armory item state;
  - guild armory shelf;
  - guild armory loan;
  - guild armory operation result;
  - armory access lock state.
- Add service methods for:
  - read guild armory;
  - deposit item;
  - borrow item;
  - return borrowed item;
  - force-return item;
  - withdraw own item;
  - remove item from armory;
  - lock/unlock member armory access.
- Use canonical RPCs only.
- Do not mutate item ownership from Angular.

**Acceptance criteria:**

- Guild armory item states are limited to available/borrowed in player-facing models.
- Borrowed item owner and borrower are represented clearly where DB exposes them.
- Service preserves operation result details.
- No direct writes to guild armory, loans, items or hero_equipment tables exist.

---

## Task T12 — Guild armory read UI

**Goal:** Display guild armory with shelves and available/borrowed state.

**Scope:**

- Show guild armory items grouped by shelf where DB/RPC exposes shelf data.
- Show item display data:
  - item name/layers;
  - owner;
  - available or borrowed;
  - borrower if borrowed;
  - shelf number/name if exposed.
- Show capacity summary:
  - current count;
  - limit;
  - `0 = unlimited` handling.
- Do not show removed/withdrawn items as guild armory items.
- Do not show full historical click log.

**Acceptance criteria:**

- Player can see current guild armory state.
- Available vs borrowed is clear.
- Borrowed-by information is current-state display, not a full log.
- Capacity display handles unlimited.

---

## Task T13 — Guild armory deposit and withdraw

**Goal:** Allow members to deposit and owners to withdraw items through canonical RPCs.

**Scope:**

- Deposit own eligible item into guild armory.
- Do not allow depositing currently equipped item; surface DB/RPC error or prevalidated disabled state if RPC/read model exposes it.
- Preserve item shelf number from DB/RPC behavior.
- Owner can withdraw own item.
- Leader/officer can remove any item from guild armory.
- Removed/withdrawn item disappears from guild armory view.
- Refresh guild armory and current equipment/armory state after success where relevant.

**Acceptance criteria:**

- Deposit/withdraw/remove uses RPC only.
- Equipped item cannot be deposited.
- Owner withdraw and leader/officer remove are distinct actions.
- Removed item is not shown as a historical guild armory row.

---

## Task T14 — Guild armory borrow and return

**Goal:** Allow members to borrow and return guild armory items.

**Scope:**

- Borrow available item through canonical RPC.
- Return own borrowed item through canonical RPC.
- Blocked member cannot borrow.
- Blocked member can still return borrowed item.
- Borrowed item may be equipped through player equipment workflow if DB/RPC allows it.
- Do not create item transfer/trade behavior.

**Acceptance criteria:**

- Borrow/return uses RPC only.
- Borrowing does not change `items.hero_id` in frontend assumptions.
- Borrower cannot be offered trade/auction/scrap/vendor actions for borrowed item.
- Return remains available even when armory access is locked.

---

## Task T15 — Guild armory force-return actions

**Goal:** Add owner/leader/officer force-return actions.

**Scope:**

- Owner can force-return own borrowed item.
- Leader/officer can force-return borrowed guild item.
- Show clear warning that borrower may lose equipped item.
- Operation uses canonical RPC.
- Refresh guild armory, member state and current equipment/armory state where relevant.
- Do not build a player-facing action history log.

**Acceptance criteria:**

- Force-return uses RPC only.
- Action availability follows role/ownership.
- Borrower equipment state is refreshed from DB/RPC after action.
- UI shows current state after force-return.

---

## Task T16 — Guild armory access lock

**Goal:** Allow leader/officer to block or unblock a member’s guild armory access.

**Scope:**

- Leader/officer can lock/unlock armory access per member.
- Locked member:
  - cannot borrow;
  - cannot deposit;
  - can return borrowed items;
  - may see armory read-only.
- Show lock state in member list and guild armory where relevant.
- Use canonical RPCs only.

**Acceptance criteria:**

- Access lock actions use RPC only.
- Locked member’s allowed/blocked actions match guild rules.
- Officer can manage locks like leader.
- Member cannot manage locks.

---

## Task T17 — Guild armory item action integration with player item UI

**Goal:** Align player item action availability with guild armory/loan state.

**Scope:**

- In player item detail/armory surfaces, indicate when item is:
  - owned private item;
  - deposited in guild armory;
  - borrowed from guild armory;
  - borrowed by someone else.
- Hide or disable invalid actions according to DB/RPC state:
  - borrower cannot trade/auction/scrap/vendor borrowed item;
  - owner can manage own item according to DB rules;
  - deposited item must be withdrawn before owner uses it privately.
- Do not implement local authority for these rules; use read model/RPC result.

**Acceptance criteria:**

- Item action availability does not contradict guild loan rules.
- Borrowed/deposited state is clear.
- No client-side item ownership transfer is introduced.

---

## Task T18 — Guild support placeholders for future siege and Argonautics

**Goal:** Add minimal UI/read-model placeholders showing guild as the future group-support boundary.

**Scope:**

- Where existing navigation or guild page makes sense, show concise future notes:
  - group support for future siege requires guild membership;
  - group support for future Argonautics requires guild membership.
- Do not implement siege.
- Do not implement Argonautics.
- Do not implement friend-based support.
- Do not create guild diplomacy.

**Acceptance criteria:**

- Guild page can communicate why guilds matter beyond armory.
- No fake siege/Argonautics functionality is shown.
- No diplomacy/influence/reputation UI is introduced.

---

## Task T19 — Admin/balancer guild config read surface

**Goal:** Make guild config readable in admin/balancer tooling where DB exposes it.

**Scope:**

- Display DB/config-backed guild settings:
  - guild creation cost;
  - member limit formula/config;
  - leader inactivity threshold;
  - nomination duration;
  - voting duration;
  - max candidate count;
  - guild armory capacity.
- Use existing config governance/read patterns.
- Do not hardcode values in Angular.
- Do not implement unrelated guild admin moderation.

**Acceptance criteria:**

- Admin can inspect current guild configuration.
- Values come from DB/config read model.
- `0 = unlimited` guild armory capacity is displayed clearly.
- No direct config mutation is added unless existing config governance flow supports it.

---

## Task T20 — Guild route/page integration

**Goal:** Add guild entry points to the player-facing game shell.

**Scope:**

- Add route/page entry for guilds where project routing conventions place it.
- Show correct state:
  - no guild: create/search/request/invite entry points;
  - in guild: guild overview/member/armory/election sections.
- Use existing shell/navigation patterns.
- Keep page composition thin.
- Do not implement custom visual redesign beyond existing patterns.

**Acceptance criteria:**

- Player can reach guild functionality from game UI.
- No-guild and in-guild states are clear.
- Route does not imply siege/Argonautics are implemented.
- Build and focused route/component tests pass.

---

# Epic Z — Appeals and future moderation extensions

## Task Z1 — Appeals parked design note

**Goal:** Keep appeal concept available without implementing yet.

**Scope:**

- Document that sanctions can later have formal appeals.
- Current statuses `cancelled` and `forgiven` support manual changes meanwhile.

**Acceptance criteria:**

- No appeal system is built prematurely.

---

## Task Z2 — Future relationship/report types as configurable dictionaries

**Goal:** Ensure future types like mercenary/equipment rental remain configurable.

**Scope:**

- Do not hardcode future declaration/report types.
- Admin UI should load active DB rows.

**Acceptance criteria:**

- New types can be added later through dictionaries/config without frontend enum edits.

---
