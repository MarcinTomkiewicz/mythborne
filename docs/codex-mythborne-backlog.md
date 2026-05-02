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
- Frontend formula runtime is preview/admin explainability only; authoritative DB/RPC workflows must evaluate assigned `balance_formulas` server-side and must not trust Angular-computed formula results for durable mutations.
- Preserve `reason`, `description`, `status_reason`, helper/admin text wherever applicable.
- After each task, summarize exact changes and wait for user confirmation.
- Do not mark tasks as completed in state docs before user confirms they work.

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

- Add selected-context labels, for example:
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

---

## Task M5 — Opponent combatant/loadout resolver

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

---

## Task M6 — Attack plan builder

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

---

## Task M7 — Initiative and turn order

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

---

## Task M8 — Core combat resolver with slot execution

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

## Task M10 — Thin sandbox combat caller

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

---

## Task M11 — Combat admin/balance tooling foundation

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

---

## Task M12 — Combat opponent definitions admin configurator

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

Epic N must follow the current DB/RPC reality, not the old placeholder version.

Current source of truth:

- stat allocation already uses canonical DB/RPC workflow from G6: `save_stat_allocation(...)`;
- frontend must not write directly to `hero_stats`, `hero.character_points`, `character_point_ledger` or audit tables;
- stat upgrade cost and stat cap formulas already exist: `hero_stat_upgrade_cost`, `hero_stat_level_cap`;
- XP to next level is now formula-backed through `hero_experience_to_next_level`;
- `critical_damage` is now a runtime derived/combat stat and active bonus target;
- runtime derived/special stats must be resolved on the fly and must not reintroduce `hero_derived`.

**Epic rule:** Do not implement a second stat allocation workflow. Do not hardcode progression formulas. Do not reintroduce `hero_derived`. Treat formula assignments and derived stat definitions as DB-backed balance configuration.

---

## Task N0 — Align generated DB types after Epic N DB foundation

**Goal:** Make frontend aware of current progression DB foundation.

**Scope:**

- Confirm regenerated `database.types.ts` includes:
  - `hero_experience_to_next_level` target/formula rows through formula read models;
  - `critical_damage` in `derived_stat_definitions`;
  - current `save_stat_allocation(...)` RPC signature;
  - current `hero.character_points` and `hero.total_character_points_earned` fields;
  - `character_point_ledger` fields used by progression/history UI.
- Do not edit generated DB types manually.

**Acceptance criteria:**

- Generated types match current schema.
- No frontend model uses raw DB rows directly as final domain models.
- No docs/status files are updated before user confirmation.

---

## Task N1 — Terminology cleanup: Health vs Character Points

**Goal:** Normalize player-facing and domain terminology so Health and Character Points are not confused.

**Scope:**

- Use `Health` for hit points.
- Use `Character Points` consistently for progression/trade currency unless final product naming changes.
- Replace legacy Hero Points / PR wording only where touched and safe.

**Acceptance criteria:**

- UI/domain terms reduce HP/CP confusion.
- No schema assumptions are changed.

---

## Task N2 — Stat allocation alignment with existing RPC

**Goal:** Ensure stat allocation UI uses the existing canonical DB workflow.

**Scope:**

- Use `save_stat_allocation(...)` for final save.
- Keep plus/minus draft changes local and unaudited.
- Map RPC result into an explicit domain result.
- Refresh hero stats and Character Points after successful save.
- Surface DB/RPC validation errors as user-readable messages.

**Acceptance criteria:**

- No direct frontend writes to `hero_stats`.
- No direct frontend writes to `hero.character_points`.
- No direct frontend writes to `character_point_ledger`.
- Final save is auditable through DB workflow.
- UI draft clicks are not audited.

---

## Task N3 — Stat upgrade cost formula usage audit/fix

**Goal:** Ensure stat upgrade costs use the existing DB formula target.

**Scope:**

- Use `hero_stat_upgrade_cost` through current formula assignment resolver.
- Pass the expected variables: `heroLevel`, `level`, `statLevel`.
- Remove or isolate any old hardcoded cost fallback.
- Keep formula preview/admin behavior consistent with formula governance.

**Acceptance criteria:**

- Upgrade costs are formula-driven.
- Missing/disabled formula assignment is surfaced as configuration error or explicit technical fallback, not silently hidden.
- Build and focused tests pass.

---

## Task N4 — Stat level cap formula usage audit/fix

**Goal:** Ensure stat caps use the existing DB formula target.

**Scope:**

- Use `hero_stat_level_cap` through current formula assignment resolver.
- Pass `heroLevel`.
- Ensure allocation UI prevents or clearly blocks saves above cap.
- Ensure DB/RPC validation remains source of truth for final save.

**Acceptance criteria:**

- Stat cap is formula-driven.
- UI cap messaging is understandable.
- Final save cannot bypass DB/RPC cap validation.

---

## Task N5 — XP to next level formula read/use path

**Goal:** Use the new configurable XP-to-next-level formula.

**Scope:**

- Read assigned formula for `hero_experience_to_next_level`.
- Evaluate it with `heroLevel`.
- Use the result for level/progression display where applicable.
- Do not hardcode XP thresholds in Angular.

**Acceptance criteria:**

- XP-to-next-level display uses formula assignment.
- Admin/balancer can change formula without frontend code change.
- Formula errors are visible and not silently replaced by an unrelated threshold.

---

## Task N6 — Level-up workflow preflight/design

**Goal:** Inspect and define what is needed for actual hero level-up persistence.

**Scope:**

- Inspect current hero `level`, `experience`, Character Points and ledger handling.
- Determine whether level-up currently happens anywhere.
- Define desired DB/RPC workflow for:
  - adding experience;
  - checking `hero_experience_to_next_level`;
  - increasing `hero.level`;
  - granting Character Points where applicable;
  - writing ledger/audit.
- Do not implement schema or workflow in this inspect task unless explicitly assigned.

**Acceptance criteria:**

- Report identifies current implementation state and blockers.
- Proposed workflow does not bypass Character Point ledger/audit.
- No direct frontend level/experience mutation is introduced.

---

## Task N7 — Derived stat resolver cleanup, including critical damage

**Goal:** Align runtime derived/combat stat resolver with current DB dictionaries.

**Scope:**

- Read `derived_stat_definitions` and active bonuses.
- Ensure runtime can resolve health, defense, min_damage, max_damage, luck, critical_chance, critical_damage and evasion_chance.
- `critical_damage` semantics:
  - base critical damage percent = 50;
  - plus active `critical_damage` bonuses;
  - combat multiplier = `1 + finalCriticalDamagePercent / 100`.
- Do not use `hero_derived`.

**Acceptance criteria:**

- `critical_damage` is available to combat resolver as percent.
- Hardcoded crit x2 is not used in final combat path.
- Derived stat resolver uses DB-backed definitions/bonus targets.

---

## Task N8 — Character Points display and ledger consistency

**Goal:** Keep Character Points display and history consistent with DB truth.

**Scope:**

- Display current spendable/balance values from `hero.character_points` or approved helper/read model.
- Use `hero.total_character_points_earned` only as lifetime/baseline where intended.
- Use `character_point_ledger` for history views.
- Avoid treating drachmas, resources and Character Points as interchangeable.

**Acceptance criteria:**

- Character Points UI does not recalculate ledger totals client-side as source of truth.
- Trade/progression currency language stays clear.
- History and balance views do not expose staff-only/audit-only fields to player UI.

---

## Task N9 — Progression admin/formula preview alignment

**Goal:** Make progression formulas inspectable and previewable in admin tooling.

**Scope:**

- Ensure formula admin surfaces show `hero_stat_upgrade_cost`, `hero_stat_level_cap` and `hero_experience_to_next_level`.
- Ensure allowed variables and default test context are visible.
- If random is later used in progression formulas, use random preview/reroll behavior from the formula runtime/editor task.

**Acceptance criteria:**

- Admin can inspect active progression formula assignments.
- Admin preview uses DB formula target metadata.
- No hardcoded formula labels/descriptions replace DB labels/descriptions.

---

# Epic O — Estates, districts and buildings

Epic O is now an implementation epic over the current DB/RPC estate/building runtime foundation, not a fresh placeholder design.

**Current DB/RPC foundation expected before Codex starts O tasks:**

- `estate_district_address_capacities` with active capacities: A=5000, B=3000, C=500, D=50, E=1.
- `estates.address_number`.
- `format_estate_address(...)` and `parse_estate_address_number(...)`.
- `normalize_estate_address_fields(...)` trigger on `estates`.
- `hero_resource_ledger`.
- `apply_hero_resource_delta_with_ledger(...)`.
- `estate_building_jobs`.
- `estate_building_job_status` enum: `active`, `completed`, `cancelled`, `failed`.
- `finalize_completed_estate_building_jobs(...)`.
- `relocate_hero_estate_to_empty_address(...)`.
- `start_estate_building_upgrade(...)`.
- `evaluate_balance_formula_target(...)` and DB-side formula runtime helpers.

**Epic rules:**

- Empty estate addresses are not database rows.
- `district_code + address_number` is the source of truth for estate identity.
- `estates.address` is legacy/display compatibility only. Do not treat it as source of truth. If a task removes final code dependency on it, report `DB cleanup candidate: estates.address`.
- Frontend may generate possible address labels from `estate_district_address_capacities` and overlay occupied `estates` rows.
- Moving to an empty address is destructive and irreversible for the current estate/building/job state.
- Empty-address relocation must use `relocate_hero_estate_to_empty_address(...)`; do not direct delete/insert `estates` from Angular.
- Siege/takeover of occupied estates is a separate future workflow and must not use the destructive empty-address relocation RPC.
- Building construction/upgrades use one active `estate_building_jobs` row per estate.
- Player-facing build cancel is not part of MVP. `cancelled` and `failed` are reserved for admin/system correction paths.
- `finalize_completed_estate_building_jobs(...)` must be called by read/gameplay workflows before relying on current completed building state.
- Starting a build/upgrade must use `start_estate_building_upgrade(...)`; do not calculate authoritative cost/time in Angular, do not direct-write `hero_resources`, `hero_resource_ledger`, `estate_buildings`, or `estate_building_jobs`.
- `start_estate_building_upgrade(...)` evaluates assigned `building_upgrade_cost` and `building_upgrade_time` formulas server-side through DB formula runtime.
- Building UI may show previews, but preview is not source of truth for spending/timers.

## Task O1 — DB/types alignment after estate/building runtime migrations

**Goal:** Confirm frontend generated types expose the current estate/building runtime foundation before implementation work.

**Scope:**

- Run `git status --short` first.
- Inspect generated database types after user-side regeneration.
- Confirm generated types expose:
  - `estate_district_address_capacities`,
  - `estates.address_number`,
  - `hero_resource_ledger`,
  - `estate_building_jobs`,
  - `estate_building_job_status`,
  - `relocate_hero_estate_to_empty_address(...)`,
  - `start_estate_building_upgrade(...)`,
  - `finalize_completed_estate_building_jobs(...)`,
  - `evaluate_balance_formula_target(...)`.
- Do not regenerate types unless the user explicitly asks Codex to do so.
- Do not mark O tasks complete in state docs during this alignment task.

**Acceptance criteria:**

- Expected tables/enums/RPCs are visible in generated types.
- App compiles after type inspection or minimal type-reference fixes.
- If any expected table/RPC/type is missing, Codex reports a precise DB/types blocker instead of starting O2.
- No raw generated rows replace domain models.

---

## Task O2 — Estate/address read layer and availability model

**Goal:** Build the frontend read/domain layer for current estate address identity and district capacities.

**Scope:**

- Add/update domain models/mappers for:
  - estate district,
  - district address capacity,
  - occupied estate row,
  - generated available/vacant address entry.
- Treat `district_code + address_number` as source of truth.
- Format display address from `district_code + address_number`; keep `estates.address` as legacy/display fallback only.
- Generate possible addresses from `estate_district_address_capacities` and overlay occupied `estates` rows.
- Support pagination/windowing so frontend does not materialize huge address lists unnecessarily.
- Show occupied address with safe occupant display data only; do not expose private account data.

**Acceptance criteria:**

- Address availability UI/read model can show possible vs occupied addresses without empty DB rows.
- Address identity uses `district_code + address_number`.
- `estates.address` is not treated as source of truth.
- If this task removes final dependency on `estates.address`, report `DB cleanup candidate: estates.address`.
- Build and mapper/service tests pass.

---

## Task O3 — Empty-address relocation flow

**Goal:** Implement the destructive move-to-empty-address player flow using the canonical RPC.

**Current DB contract:** `relocate_hero_estate_to_empty_address(p_hero_id, p_district_code, p_address_number, p_confirm_destroy_existing_estate, p_reason, p_request_id)`.

**Scope:**

- Add relocation action only for vacant addresses.
- Show strong confirmation modal/warning that the current estate/building/job state will be permanently destroyed.
- Require explicit confirmation before calling RPC.
- Call `relocate_hero_estate_to_empty_address(...)` through a typed domain service.
- Refresh active estate/building/address state after success.
- Surface RPC errors clearly, including occupied address, invalid capacity/range, no estate, or gameplay block.
- Do not implement siege/takeover here.

**Acceptance criteria:**

- Relocation uses the RPC only.
- No direct Angular delete/insert/update of `estates`, `estate_buildings`, or `estate_building_jobs`.
- User cannot relocate without explicit destructive confirmation.
- UI clearly distinguishes empty-address relocation from future siege/takeover.
- Build and focused flow tests pass.

---

## Task O4 — Building definitions/read layer alignment

**Goal:** Align building read models with current building definitions, requirements, caps, formulas, and district availability.

**Scope:**

- Read building definitions and current estate building levels.
- Use `get_building_progression_preview(...)` for admin/preview input data where appropriate.
- Use `building_district_level_caps` / existing helpers for effective max level semantics.
- Respect `0 = unlimited` max-level behavior.
- Use central `entity_requirements`; do not add new dependencies on legacy `building_requirements` / `buildings.requirements` JSON.
- Display formula assignments and local overrides as read/preview metadata where useful, but do not use Angular-computed formula output as authoritative mutation input.

**Acceptance criteria:**

- Building UI/read model uses DB definitions and current district/cap semantics.
- `0 = unlimited` is explained where visible.
- Requirements come from central requirements model where present.
- No new direct dependency on legacy requirement JSON.
- Build and mapper/service tests pass.

---

## Task O5 — Building jobs and lazy finalization read integration

**Goal:** Make active building jobs visible and ensure completed jobs are finalized before current building state is used.

**Scope:**

- Add typed read/domain models for `estate_building_jobs`.
- Show active job state in estate/building UI:
  - building label,
  - target level,
  - status,
  - started_at,
  - completes_at,
  - remaining/progress display.
- Integrate read flows so DB-side `finalize_completed_estate_building_jobs(...)` is called through approved RPC/read workflow before relying on current building levels, where available.
- If no public read/finalization wrapper exists for a needed UI path, report DB/RPC blocker instead of direct-updating job state.
- Do not expose player-facing cancel.

**Acceptance criteria:**

- Active building job is visible to the player.
- Completed jobs do not leave stale building state in normal read/gameplay flows.
- UI does not direct-update `estate_building_jobs.status` or `estate_buildings.level`.
- Player-facing cancel is not implemented.
- Build and focused tests pass.

---

## Task O6 — Start building construction/upgrade flow

**Goal:** Let players start a building construction/upgrade through the canonical DB/RPC workflow.

**Current DB contract:** `start_estate_building_upgrade(p_hero_id, p_building_id, p_reason, p_request_id)`.

**Scope:**

- Add start/upgrade action for eligible building definitions.
- Call `start_estate_building_upgrade(...)` through a typed domain service.
- Display returned:
  - job id,
  - target level,
  - started/completes timestamps,
  - drachma/materials/workforce costs,
  - resulting balances.
- Use returned RPC values as source of truth for spending/timing.
- Refresh resources, active job and building state after success.
- Surface errors clearly: insufficient resources, active job exists, district/cap unavailable, gameplay block, missing estate.

**Acceptance criteria:**

- Start/upgrade uses `start_estate_building_upgrade(...)` only.
- Angular does not calculate authoritative cost/time.
- Angular does not direct-write `hero_resources`, `hero_resource_ledger`, `estate_buildings`, or `estate_building_jobs`.
- Returned costs/timers are displayed or used for refresh feedback.
- Build and focused service/UI tests pass.

---

## Task O7 — Estate/building admin and diagnostics alignment

**Goal:** Align admin/building diagnostics with the current runtime foundation and formula source-of-truth rules.

**Scope:**

- In admin/building screens, expose district capacity, address-number model, current active jobs and formula-backed start behavior where relevant.
- Make it clear that formula preview is not the authoritative mutation path.
- Use DB labels/descriptions/helper/admin text for district capacity and building definitions.
- Add diagnostics for active jobs and completed-but-not-finalized jobs if useful.
- Do not add admin-only direct mutations unless backed by approved RPC/governance workflow.

**Acceptance criteria:**

- Admin can understand address capacity and building runtime state without raw SQL.
- Formula preview and authoritative DB/RPC mutation are clearly distinguished.
- No new direct DB workflow writes are added from Angular.
- Build passes.

---

# Epic P — Reports and snapshots

Epic P is an implementation epic over the DB-backed game report foundation. It must not be treated as a generic report placeholder or as an audit/player-abuse feature.

Game reports are player-facing gameplay reports. They are separate from:

- `player_abuse_reports`;
- audit logs;
- temporary runtime/debug state.

Current DB/RPC foundation:

- `game_report_types`;
- `game_reports`;
- `game_report_hero_access`;
- `game_report_participants`;
- `game_report_item_references`;
- enum `game_report_access_role = owner | participant | viewer`;
- enum `game_report_item_source_kind = reward_drop`;
- enum `game_report_source_entity_type = combat_result | trial_result | encounter_result | pvp_result | siege_result`;
- `generate_game_report_public_token()`;
- `delete_game_report_for_hero(...)`;
- `create_game_report_from_combat_result(...)`;
- `attach_reward_drop_item_to_game_report(...)`;
- `build_report_item_display_name(...)`.

**Epic rules:**

- Use the report DB/RPC foundation.
- Do not make public gameplay reports from `player_abuse_reports`, audit logs or raw exploration runtime/debug rows.
- Public report route is `/report/:publicToken` and uses `game_reports.public_token`, not internal report ids.
- Private Reports UI uses `game_report_hero_access`; multiple heroes may have access to the same report.
- Removing a report for one hero uses `delete_game_report_for_hero(...)`; it removes that hero access row and deletes the report only when no access rows remain.
- Combat reports wrap `combat_results`; do not duplicate `combat_result_attacks` into report tables.
- Reward/drop item references are public showcase references. Prefer live `source_item_id` when the item still exists; fall back to quality/base/prefix/suffix/display name when it does not.
- Reward/drop references do not snapshot final item stats forever.
- Combat attack source labels can be public, but full private player equipment/loadouts must not be exposed by default.
- If Codex removes the final code dependency on a legacy report/display field, report it as a `DB cleanup candidate`; do not silently leave obsolete DB debt.

---

## Task P0 — Align generated DB types after game reports foundation

**Goal:** Confirm frontend type layer exposes current game report DB/RPC contracts.

**Scope:**

- Confirm generated types include report enums/tables/functions listed in the P foundation.
- Confirm generated types include combat result tables used by report rendering.
- Do not edit generated types manually.

**Acceptance criteria:**

- Generated types match current schema.
- Missing report types/functions are reported before UI implementation.
- No raw generated rows replace report domain models.

---

## Task P1 — Game report domain models and mappers

**Goal:** Add typed domain/read models for game reports.

**Scope:**

- Report type dictionary.
- Report header.
- Hero access rows.
- Participants.
- Item references.
- Combat source linkage.
- Public token route payload/read model.

**Acceptance criteria:**

- Models separate private access from report participants.
- Raw DB rows are mapped to domain/UI models.
- Report type labels/descriptions come from DB.
- Public-facing models do not expose account/user ids.

---

## Task P2 — Private Reports list/inbox

**Goal:** Show reports available to the active hero.

**Scope:**

- Load reports through `game_report_hero_access` for active hero/server.
- Show type, title, summary, created time and public link.
- Support removing a report from this hero's list through `delete_game_report_for_hero(...)`.
- Surface RPC errors as user-readable messages/toasts.

**Acceptance criteria:**

- Hero sees only reports they have access to.
- Removing a report uses RPC, not direct delete.
- If other heroes still have access, report remains for them.
- Public link stops resolving only when the underlying report row is deleted after final access removal.

---

## Task P3 — Public report route

**Goal:** Add public route `/report/:publicToken` for shareable reports.

**Scope:**

- Load report by `public_token`.
- Render report content without normal app shell/sidebar/topbar.
- Do not expose account/user ids, staff-only data, audit logs or anti-abuse metadata.
- Show safe not-found state when token no longer resolves.

**Acceptance criteria:**

- Anonymous/public viewer can open a valid report token.
- Deleted/no-access reports show a safe not-found page.
- Public route does not leak private account data.
- Public and private report content use the same core report renderer where practical.

---

## Task P4 — Combat report renderer

**Goal:** Render reports sourced from `combat_results`.

**Scope:**

- Use `combat_results`, `combat_result_participants`, participant stats and attacks.
- Show attack order, source labels, timing/evasion/crit/damage and Health changes.
- Do not duplicate or recompute combat result state.
- Do not expose full private equipment/loadouts by default.
- Support both private app-shell rendering and public bare-shell rendering.

**Acceptance criteria:**

- Combat report reproduces the core combat result view.
- Attack source labels are visible.
- Combat result attack rows are rendered in historical order.
- Private equipment stays private unless a future explicit feature changes that.

---

## Task P5 — Combat report creation integration

**Goal:** Use current DB producer to create/get reports for combat results.

**Scope:**

- Call `create_game_report_from_combat_result(...)` where a combat result should become a report.
- Treat the RPC as idempotent.
- Do not create report rows directly in Angular.
- Do not duplicate `combat_result_attacks` into report tables.

**Acceptance criteria:**

- Combat result can produce a report wrapper.
- Hero participants receive private report access.
- Report uses existing combat result snapshot tables.
- Repeated creation attempts return/reuse the existing report rather than creating duplicates.

---

## Task P6 — Reward/drop item reference display

**Goal:** Render public showcase drop item references in reports.

**Scope:**

- Read `game_report_item_references`.
- Prefer live `source_item_id` when the item exists.
- Fall back to quality/base/prefix/suffix/display name.
- Do not snapshot final item stats forever.
- Show full item card/tooltip for reward drops.
- Do not use this as a way to expose equipment used in combat.

**Acceptance criteria:**

- Drop reward item can be shared publicly.
- Rebalanced live item stats are reflected when item exists.
- Missing item row falls back gracefully.
- Used weapons/equipment are not automatically rendered as public item cards.

---

## Task P7 — Attach reward drops to reports

**Goal:** Use DB helper to attach dropped/generated reward items to reports.

**Scope:**

- Call `attach_reward_drop_item_to_game_report(...)` from approved producer/workflow where reward drop report should include item.
- Keep it idempotent.
- Do not insert `game_report_item_references` directly from Angular.
- Use generated item/item read models for display after DB attachment.

**Acceptance criteria:**

- Reward drops can appear in report item references.
- Duplicate report/item references are prevented by DB unique index.
- No direct report item reference writes from Angular.

---

## Task P8 — Trial/encounter report producer preflight

**Goal:** Prepare producers for trial and encounter reports after L/M integration.

**Scope:**

- Decide where completed trial/encounter workflows should call report creation.
- Wrap challenge outcome, reward grant and optional combat result.
- Attach reward/drop items through `attach_reward_drop_item_to_game_report(...)` where appropriate.
- Do not expose raw exploration graph/step/challenge runtime rows directly as public report snapshots.

**Acceptance criteria:**

- Producer plan exists before coding trial/encounter report creation.
- Combat section is reused when a trial/encounter includes combat.
- Reward grants are represented without re-triggering reward generation.

---

## Task P9 — Future PvP/siege report placeholders

**Goal:** Keep report model ready for PvP and siege without implementing those workflows early.

**Scope:**

- Keep report type support for `pvp_combat` and `siege`.
- Do not fake PvP/siege producers before those epics exist.
- Later PvP reports should show resource changes and prestige indication without exposing hidden prestige values.
- Later siege reports should support many hero access rows for all eligible participants.

**Acceptance criteria:**

- P does not block future PvP/siege reports.
- No fake PvP/siege workflow is built inside P.

---

# Epic Q — Notifications

Epic Q implements persistent notification inbox/bell UI over the current DB-owned notification foundation.

Notifications are short attention/status events. They are not game reports, audit logs, player abuse reports, or local UI-only toasts.

Current DB foundation:
- enum `notification_recipient_kind`: `user`, `hero`, `staff`;
- enum `notification_severity`: `info`, `notice`, `warning`, `critical`;
- table `notification_types`;
- table `notifications`;
- internal helper `create_notification(...)`;
- RPC `mark_notification_read(p_notification_id)`;
- RPC `dismiss_notification(p_notification_id)`.

Current DB-owned notification hooks:
- direct trade offer received/rejected/completed;
- auction outbid/sold/won;
- declaration approved/rejected;
- abuse report resolved/dismissed;
- anti-abuse case waiting for player/staff;
- sanction created;
- Character Points penalty created.

Epic rules:
- Frontend must not insert notification rows directly.
- Frontend may show fresh notification rows as toasts when `notification_types.default_toast_enabled = true`.
- Toast is presentation only; persistent `notifications` row is the source.
- Reports have their own Reports inbox/badge and must not be treated as notifications.
- Use DB labels/descriptions from `notification_types`, not hardcoded permanent notification labels.
- Use active auth user and selected server/hero context where relevant.
- Do not expose staff-only fields in player-facing notifications.

## Task Q1 — Notification domain models and mappers

**Goal:** Add typed frontend domain models for DB-backed notification inbox/bell data.

**Scope:**
- Add models/mappers for:
  - `notification_types`,
  - `notifications`,
  - recipient kind,
  - severity,
  - read/dismiss state,
  - source entity reference,
  - action link metadata.
- Map DB rows into UI-safe models.
- Keep raw DB rows out of components.
- Preserve `title`, `body`, `action_label`, `action_url`, `created_at`, `read_at`, `dismissed_at`.
- Join or load `notification_types` so UI can show labels/descriptions/category/default toast behavior.

**Acceptance criteria:**
- Notification models expose readable type label/category/severity.
- Mapper handles nullable source/action/body fields safely.
- Player-facing model does not expose unrelated staff-only data.
- Build and focused mapper tests pass.

---

## Task Q2 — Notification read service and unread counts

**Goal:** Load current user's notification inbox and unread counts.

**Scope:**
- Add a service/domain read layer for notifications belonging to `auth.uid()`.
- Query `notifications.recipient_user_id = current user`.
- Exclude dismissed rows from normal inbox view.
- Support unread filter where `read_at is null`.
- Sort newest first.
- Load notification type metadata from `notification_types`.
- Provide unread count for topbar/bell badge.
- Do not mix game reports unread count into notifications.

**Acceptance criteria:**
- Current user can see their notification inbox.
- Bell badge shows unread notification count only.
- Dismissed notifications are hidden from normal inbox view.
- Reports remain a separate inbox/badge.
- Build and service tests pass.

---

## Task Q3 — Notification bell / dropdown UI

**Goal:** Add a player/staff-visible notification bell with unread count and short notification list.

**Scope:**
- Add notification bell entry in the app shell/topbar.
- Show unread count badge.
- Dropdown/list shows newest notifications with:
  - title,
  - short body,
  - type label/category/severity,
  - created time,
  - unread/read state,
  - action link if available.
- Keep technical keys secondary or hidden unless useful for admin diagnostics.
- Do not show raw UUIDs as primary text.
- Do not include Reports items in the notification bell.

**Acceptance criteria:**
- User can open a concise notification dropdown/list.
- Unread notifications are visually distinguishable.
- Action link navigates to the relevant route when present.
- Empty state is clear.
- Build and route smoke pass.

---

## Task Q4 — Mark read / dismiss notification actions

**Goal:** Allow users to manage notification read/dismiss state through canonical RPCs.

**Scope:**
- Call `mark_notification_read(...)` for marking a notification read.
- Call `dismiss_notification(...)` for hiding/dismissing a notification.
- Do not direct-update `notifications.read_at` or `notifications.dismissed_at`.
- Support marking one notification read on click/open.
- Support dismiss from dropdown/list.
- Refresh unread count after mutation.
- Show RPC errors via toast/message.

**Acceptance criteria:**
- Read/dismiss mutations use RPC only.
- Notification ownership/access denial is surfaced clearly.
- Unread badge updates after read/dismiss.
- Dismissed notifications disappear from normal inbox view.
- Build and focused tests pass.

---

## Task Q5 — Optional online toast presentation for fresh notifications

**Goal:** Show fresh DB-created notifications as transient toasts when the user is online.

**Scope:**
- Detect newly loaded or realtime-received notification rows for current user.
- Show toast only when `notification_types.default_toast_enabled = true`.
- Avoid duplicate toasts for the same notification in one session.
- Toast content uses notification title/body/action label.
- Toast display must not create or mutate notification rows.
- If realtime subscription is not available/reliable yet, implement a safe polling/refresh-based fallback or report the limitation.

**Acceptance criteria:**
- Fresh eligible notifications can appear as toasts.
- No duplicate toast spam for the same row in one session.
- Toasts are presentation-only; persistent DB notification remains source of truth.
- Offline users still see unread notifications later.
- Build and smoke pass.

---

## Task Q6 — Staff notification inbox integration

**Goal:** Make staff/server-work notifications visible in the same notification system while respecting selected-server access.

**Scope:**
- Show staff notifications where `recipient_kind = staff`.
- Keep recipient check by authenticated user.
- Server-scoped staff notifications should display selected server context.
- Do not show staff-only notifications to normal players without access.
- Use existing access policy helpers for staff/admin visibility.
- Keep player and staff notifications in the same inbox unless UX later splits them.

**Acceptance criteria:**
- Staff user can see server-scoped staff notifications addressed to them.
- Normal player does not see staff notifications.
- Notification body does not leak staff-only case details beyond what the notification row already stores.
- Build and access tests pass.

---

## Task Q7 — Notification type/admin readability pass

**Goal:** Make notification type labels/descriptions readable in admin/debug contexts.

**Scope:**
- Add a simple admin/read-only view or section for `notification_types`, or integrate into existing dictionary/admin metadata tooling.
- Display:
  - key,
  - label,
  - description,
  - helper/admin text,
  - category,
  - default severity,
  - default toast enabled,
  - active flag / sort order.
- Do not implement notification type editing unless a governed write path is approved.
- Keep technical key secondary to label/description.

**Acceptance criteria:**
- Admin/operator can inspect notification types and understand which events may toast.
- No hardcoded notification type list in admin UI.
- Build passes.

---

## Task Q8 — Notification smoke and hook verification

**Goal:** Verify that DB-owned notification hooks are visible to users through the frontend.

**Scope:**
- Use existing DB/RPC workflows where possible to trigger:
  - trade offer received,
  - auction outbid or sold/won,
  - declaration approved/rejected,
  - abuse report resolved,
  - sanction/CP penalty created.
- If real workflow data is unavailable, document which smoke cases are pending and why.
- Verify notification row appears in inbox/read model.
- Verify read/dismiss actions work.
- Verify report creation does not create a notification.

**Acceptance criteria:**
- At least one trade/auction notification is smoke-tested end-to-end where data exists.
- At least one moderation/declaration notification is smoke-tested where data exists.
- Pending smoke cases are explicitly listed with required data.
- No notification is created by Angular direct insert.

---

# Epic R — Admin information architecture and layout hygiene

Epic R is a lightweight admin IA/layout hygiene epic, not a final UI redesign.

The goal is to stop admin tooling from growing randomly and to give new admin/balancer modules predictable places in the admin shell. Final visual style, spacing, iconography, and full design-system decisions remain in the UI/UX backlog.

Admin UI should be organized by **work intent**, not by raw table names.

Preferred admin groups:

- **Overview**
- **Global Governance**
- **Game Balance**
- **Server Operations**
- **Moderation & Anti-abuse**
- **Gameplay Tools / Sandbox**

General Epic R rules:
- Do not rename gameplay concepts casually.
- Do not move player-facing routes into admin.
- Keep selected server context visible for server-scoped admin pages.
- Use DB dictionaries and labels instead of hardcoded permanent lists.
- Raw technical keys/UUIDs may appear as secondary metadata, not as primary UX.
- Prefer PrimeNG Tabs / tabbed sections for complex admin pages instead of one long vertical form.
- R is not a final visual redesign. Keep changes structural, navigational, and reusable.
- If a route/page already exists, preserve functionality while moving or grouping navigation.
- If a target route does not exist yet, add a clear placeholder/navigation slot only when useful; do not fake implemented functionality.

---

## Task R1 — Admin navigation taxonomy and route inventory

**Goal:** Audit current admin routes and assign them to a stable admin navigation taxonomy.

**Scope:**
- Inspect current admin routes, sidebar entries, dashboard links, and admin page entry points.
- Classify each current admin route under one of:
  - Overview;
  - Global Governance;
  - Game Balance;
  - Server Operations;
  - Moderation & Anti-abuse;
  - Gameplay Tools / Sandbox.
- Identify routes currently placed randomly or under misleading labels.
- Identify missing route slots needed by upcoming/current admin modules:
  - Trial definitions admin configurator;
  - Encounter definitions admin configurator;
  - Combat opponent definitions admin configurator;
  - Notification inbox/type admin/readability;
  - Game report admin/debug/readability;
  - Exploration lab/debug tools;
  - Combat sandbox/admin test tools.
- Keep a distinction between:
  - global/product admin pages;
  - selected-server admin pages;
  - staff/moderation pages;
  - sandbox/test tools.
- Do not change behavior yet unless it is a trivial label/grouping fix.

**Acceptance criteria:**
- Report lists current admin routes and their proposed group.
- Report identifies misplaced or ambiguous routes.
- Report lists missing navigation slots for M12/L11/L12/P/Q-related admin pages.
- No large UI rewrite is done in this audit task.
- No route is removed.
- Build is not required unless code changes are made.

---

## Task R2 — Admin sidebar grouping implementation

**Goal:** Reorganize admin navigation into stable, readable groups.

**Scope:**
- Update admin/sidebar navigation to use the agreed groups:
  - Overview;
  - Global Governance;
  - Game Balance;
  - Server Operations;
  - Moderation & Anti-abuse;
  - Gameplay Tools / Sandbox.
- Move existing entries into the correct groups based on R1.
- Keep global/product tools separate from selected-server tools.
- Keep moderation and anti-abuse tools grouped together.
- Create clear navigation slots for upcoming admin modules where appropriate:
  - Game Balance → Trials;
  - Game Balance → Encounters;
  - Game Balance → Combat Opponents;
  - Game Balance → Reward Profiles if/when route exists;
  - Gameplay Tools / Sandbox → Exploration Lab;
  - Gameplay Tools / Sandbox → Combat Sandbox/Admin Test;
  - Overview or Operations → Notifications;
  - Gameplay Tools or Reports area → Game Reports, if route exists.
- Do not create fake working pages. If a route is missing, either omit it or mark it as pending only if the project already uses pending/disabled navigation conventions.
- Preserve existing route guards and staff/admin access boundaries.
- Preserve selected-server switcher behavior.

**Acceptance criteria:**
- Admin sidebar is grouped by work intent, not raw table/entity names.
- Existing admin routes remain reachable.
- No player-facing route is accidentally moved into admin.
- Server-scoped pages still make selected server context clear.
- Hidden/disabled/pending links do not imply implemented functionality.
- Build passes.

---

## Task R3 — Admin page layout pattern: header, context, and sections

**Goal:** Establish a reusable admin page layout pattern for current and future admin tools.

**Scope:**
- Identify or create a lightweight reusable/admin-local layout pattern for admin pages:
  - page title;
  - short explanation/helper text;
  - optional technical key/source metadata;
  - global vs selected-server context indicator;
  - action area;
  - content sections.
- Prefer reuse of existing shared/page layout components if they already exist.
- For complex admin pages, prefer PrimeNG Tabs / tabbed grouping or clearly separated sections instead of long vertical forms.
- Do not perform full visual redesign.
- Do not introduce a heavy design system replacement.
- Apply the pattern to one or two representative admin pages only, unless the change is trivial and safe.
- Document the pattern in comments or local helper naming so future admin configurators can reuse it.

**Recommended tab patterns for future configurators:**
- Combat Opponents:
  - Overview;
  - Stats;
  - Natural attacks;
  - Equipment;
  - Scaling;
  - Usage / candidates.
- Trials:
  - Overview;
  - Minigame;
  - Combat candidates;
  - Requirements / availability;
  - Preview.
- Encounters:
  - Overview;
  - Kind / minigame;
  - Reward profile;
  - Combat candidates;
  - Difficulty / districts;
  - Preview.
- Notifications:
  - Types;
  - Inbox/read model;
  - Hook diagnostics.
- Reports:
  - Types;
  - Combat reports;
  - Public link preview;
  - Item references.

**Acceptance criteria:**
- At least one admin page demonstrates the reusable header/context/section pattern.
- Selected-server pages visibly show selected server context.
- Global pages do not pretend to be server-scoped.
- Complex content is organized into tabs or logical sections where appropriate.
- Existing form behavior is not broken.
- Build passes.

---

## Task R4 — Staff/Admin dashboard attention cards

**Goal:** Make the admin/staff landing page useful by surfacing work that needs attention.

**Scope:**
- Add or improve staff/admin landing dashboard cards using existing read models where available.
- Candidate cards:
  - selected server summary;
  - open anti-abuse cases;
  - cases waiting for player;
  - cases waiting for staff;
  - pending player abuse reports;
  - pending relationship declarations;
  - pending sanctions / Character Points penalties;
  - unread staff notifications.
- Use DB/RPC/read models that already exist.
- Do not invent new backend aggregation tables.
- If a needed aggregate/read path is missing, show a minimal safe fallback or report DB/RPC blocker.
- Cards should link to the relevant admin/staff section.
- Avoid raw UUID-only display.
- Do not expose staff-only data to non-staff users.

**Acceptance criteria:**
- Staff/admin landing page shows at least several meaningful attention cards from existing systems.
- Staff notifications from the Q foundation can be surfaced if current read path permits.
- Cards link to relevant admin pages where routes exist.
- Missing route/read path is documented clearly instead of faked.
- Normal players cannot access staff dashboard data.
- Build passes.

---

## Task R5 — Admin source-link and cross-navigation hygiene

**Goal:** Improve navigation between related admin/domain entities without forcing admins to manually copy UUIDs.

**Scope:**
- Add or standardize source links where existing data has source entity references:
  - notifications → source entity;
  - audit logs → entity/source where route exists;
  - anti-abuse case → related report/trade/auction/hero;
  - player abuse report → related case/trade/item;
  - game report → source combat result/report detail where route exists;
  - exploration lab/debug → related trial/encounter definitions where route exists.
- If a route exists, render a usable link.
- If a route does not exist, show readable metadata and mark the link as unavailable/pending.
- Keep raw UUIDs secondary and copyable where useful.
- Do not create fake routes or broken links.
- Respect player/staff privacy boundaries.

**Acceptance criteria:**
- Admins can navigate from at least one notification/source-driven area to its source entity where route exists.
- Missing source routes are represented as disabled/pending with metadata, not broken links.
- UUIDs are not the main UX label.
- Cross-links do not expose player-private or staff-only fields to the wrong audience.
- Build passes.

---

## Task R6 — Admin configurator placement check for M12/L11/L12

**Goal:** Ensure new admin configurators for combat opponents, trials, and encounters have correct navigation and layout placement.

**Scope:**
- Confirm where these upcoming/added admin tools should appear:
  - `M12 — Combat opponent definitions admin configurator` → Game Balance / Combat Opponents.
  - `L11 — Trial definitions admin configurator` → Game Balance / Trials.
  - `L12 — Encounter definitions admin configurator` → Game Balance / Encounters.
- Ensure route labels are human-readable and not raw table names.
- Ensure these pages use the R3 layout pattern where implemented.
- If routes are not implemented yet, document the intended placement and keep sidebar placeholders disabled or omitted according to existing navigation convention.
- Do not implement M12/L11/L12 inside R unless explicitly instructed.

**Acceptance criteria:**
- Placement decision for M12/L11/L12 is documented in code comments, route metadata, or admin navigation config.
- No configurator is hidden under unrelated moderation/server/config sections.
- Future Codex tasks can add those pages without inventing a new navigation structure.
- Build passes if code changes are made.

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

# Recommended near-term execution order

1. A1 — Regenerate DB types
2. B1 — Audit identity assumptions
3. B2 — Active server resolver
4. B3 — Active hero resolver and critical progression/stat/resource cleanup
5. C1/C2 — role/membership/staff access read layer and server switcher
6. D1/D2 — config definitions/values read model
7. G1/G2/G3 — audit dictionaries/log read/write helper
8. H1/H2/H3/H4/H5 — anti-abuse read models and server-scoped case read
9. H6-H12 — player declarations/reports
10. H13-H21 — staff case/sanction UI
11. D6/H config admin — anti-abuse config UI
12. I1-I3 — item lifecycle
13. F1-F12 — bonus model legacy retirement
14. L/M/N/O/P workstreams as separate feature milestones

# Notes

- Do not attempt this entire backlog in one Codex run.
- Use one task or a small tightly related group per prompt.
- After each completed task, wait for user test/confirmation before updating completed-state docs.

---

# 2026-04-26 Priority Update — DB foundation after trade/auction/anti-abuse stages

The database now contains new runtime foundations that Codex must treat as current schema after regenerating Supabase types.

## Immediate execution order update

Run these before broader gameplay work:

1. Regenerate Supabase `database.types.ts` and fix compile errors.
2. Replace legacy `hero_derived.hp` / Hero Points / old HP-as-points usage.
3. Ensure Character Points reads use `hero.character_points`.
4. Ensure Character Points changes go through backend/RPC/domain operations and write `character_point_ledger` where appropriate.
5. Treat `hero_derived` as transitional/legacy; do not add new dependencies to it.
6. Wire direct trade and auction frontend to existing RPCs.
7. Ensure inventory/armory hides or disables `locked_trade` and `locked_auction` items.
8. Connect Trade Routes/building bonus runtime to active trade slot limit; remove reliance on fallback config in normal gameplay.
9. Build staff/admin anti-abuse signal/case read views from existing tables.
10. Only after user confirms these work, update state docs as completed.

## High priority task — Character Points / legacy HP cleanup

Current database state:

- `hero.character_points` is current spendable Character Points balance.
- `hero.total_character_points_earned` tracks lifetime generated Character Points baseline.
- `character_point_ledger` stores append-only CP balance changes.
- `hero_derived.hp` no longer exists.
- `hero_derived.health` is combat health / hit points.
- `hero_resources` remains for resources like drachmas, materials and workforce.

Required work:

- regenerate database types;
- find all references to `hero_derived.hp`, `hp` as points, `hero points`, `Hero Points`, old PR/points wording;
- replace Character Point reads with `hero.character_points`;
- replace combat HP reads with `hero_derived.health` or runtime health resolver;
- update stat allocation/progression save flow to spend `hero.character_points` and write ledger through backend/RPC/domain logic;
- do not store Character Points in `hero_resources`;
- do not write CP ledger rows directly from UI click handlers.

Acceptance criteria:

- app compiles with regenerated DB types;
- no reference to removed `hero_derived.hp` remains;
- stat allocation uses Character Points correctly;
- Character Points and Health are not confused in domain models/UI.

## High priority task — Derived stats cleanup

Decision:

- `hero_derived` is transitional/legacy;
- derived stats are not authoritative persisted state for new systems;
- frontend may calculate previews;
- backend/RPC/domain actions calculate authoritative values from base stats, equipment, bonuses, formulas and context;
- reports/combat/trials store event snapshots of values used at the time.

Required work:

- audit all reads/writes of `hero_derived`;
- identify which screens/services rely on persisted derived stats;
- avoid adding new writes to `hero_derived` on equipment/stat changes;
- introduce or reuse runtime derived-stat resolver/calculator;
- do not remove remaining `hero_derived` columns until current usages are audited and replaced.

Acceptance criteria:

- clear report of existing usage;
- new trade/economy work does not depend on `hero_derived`;
- combat/progression screens still work after cleanup.

## High priority task — Direct trade frontend/runtime integration

Database/RPCs already exist:

- `create_player_direct_trade_offer(...)`
- `respond_player_direct_trade_offer(...)`
- `cancel_player_direct_trade_offer(...)`
- `reject_player_direct_trade_offer(...)`
- `confirm_player_direct_trade_offer(...)`

Frontend/domain requirements:

- direct trade is private between two heroes;
- both sides must be on same server and able to use trade;
- each side only selects own items;
- no access to another hero's private inventory;
- each side must offer item(s) and/or Character Points;
- CP-only for CP-only exchange should be blocked;
- show available CP as current CP minus active locks;
- show clear reason/status text for cancel/reject/expire/fail;
- after completing/cancelling/rejecting, refresh inventory, CP balance and active offers.

Acceptance criteria:

- player can create, respond to, cancel/reject and complete direct trade using RPCs;
- locked items are not usable/equippable;
- CP locks affect available CP display;
- completed trade creates transaction/ledger and can create anti-abuse signal/case when rules trigger.

## High priority task — Auction frontend/runtime integration

Database/RPCs already exist:

- `create_player_auction_listing(...)`
- `place_player_auction_bid(...)`
- `buy_now_player_auction(...)`
- `cancel_player_auction_listing(...)`
- `close_player_auction_listing(...)`

Frontend/domain requirements:

- one auction lists exactly one item;
- supported modes are bidding, buy now, bidding with buy now;
- duration is server-configured;
- seller can cancel only before bids;
- expired auction without bids returns item to `active`;
- buy now completes immediately;
- bids lock CP and outbid releases prior lock;
- show item/CP status clearly.

Acceptance criteria:

- player can list, bid, buy now, cancel eligible auction and close expired/ended auction through RPCs;
- item and CP locks display correctly;
- completed auction writes transaction/ledger and can create anti-abuse signal/case.

## High priority task — Anti-abuse signal/case UI integration

Database foundation exists:

- `anti_abuse_signals`
- `anti_abuse_cases`
- `anti_abuse_case_signals`
- `anti_abuse_case_participants`

Implemented signal types:

- `trade.high_cp_direct_trade`
- `auction.high_cp_sale`
- `trade.repeated_pair_transfers`

Requirements:

- staff/admin views must be server-scoped;
- list cases by server/status/grouping key;
- case detail should show linked signals, participants, related transaction/entity ids, metadata, reasons/descriptions;
- signals/cases are review aids, not automatic punishment;
- resolved/cancelled cases are historical and not reopened automatically.

Acceptance criteria:

- staff can view signal-generated cases;
- case list groups repeated signals correctly;
- linked transaction/entity ids are visible enough for review/debugging.

## High priority task — Trade Routes and active offer limit

Current database runtime uses `trade_active_offer_limit_fallback`.

Required work:

- connect active trade/auction offer limit to Trade Routes/building bonus runtime;
- both sides of direct trade must be able to use player trade;
- auction seller/buyer/bidder must be able to use player trade;
- direct trade and active auctions share the active-offer slot pool unless later config deliberately changes it.

Acceptance criteria:

- fallback is not the normal gameplay source once building runtime exists;
- active offer limit changes with Trade Routes/building level/config;
- frontend explains why trade/auction is unavailable.

## Update old backlog items

Older tasks mentioning generic public fixed-price listings should be interpreted as superseded.

Current direction:

- direct private trade is implemented first;
- auctions are implemented as the public market path;
- there is no separate public fixed-price listing mode outside auction buy-now.

---

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

---

# Special Epic U0 — Roles, permissions and scoped moderation

These tasks should be inserted after the current G-series work and before deeper H/admin/staff UI work, unless the user explicitly chooses another order. They depend on the U0-N4 DB foundation and regenerated Supabase types.

## Task U0-C1 — Frontend role usage audit

**Status:** Done / confirmed on 2026-04-28.

**Goal:** Audit current frontend role/staff assumptions.

**Scope:**

- Search for role assumptions such as `isAdmin`, `isOperator`, `isModerator`, `isServerStaff`, `globalRoleKey`, `serverStaffRole`, `canManageSelectedServer`.
- Classify whether each usage matches the U0 role model.
- Do not refactor broadly.

**Acceptance criteria:**

- Report lists exact files/components/services.
- Report identifies mismatches between global role and server staff assignment.
- No schema or behavior changes.
- Implementation note: audit identified `/admin` route guards, logged-in menu visibility, static admin navigation, and broad `ActiveServer.canManageSelectedServer` semantics as primary frontend role-boundary risks.

## Task U0-C2 — Staff gameplay access audit

**Status:** Done / confirmed on 2026-04-28.

**Goal:** Verify whether staff can enter normal gameplay on servers where they are assigned staff.

**Scope:**

- Active server/hero loading.
- Route guards.
- Gameplay entry points.
- Sandbox/test exceptions.

**Acceptance criteria:**

- Report explains where staff gameplay should be blocked or allowed.
- Sandbox exception is preserved.
- No broad implementation yet unless user requests it.
- Implementation note: audit confirmed `/hero/*` and `/game/*` lacked standard-server assigned-staff gameplay blocking; later U0 implementation added the central policy and gameplay boundary.

## Task U0-C3 — User/staff management UI audit

**Status:** Done / confirmed on 2026-04-28.

**Goal:** Identify existing or missing UI for global role assignment, server staff assignment and moderator scope assignment.

**Scope:**

- User search/selection.
- Assign global role flow.
- Assign server staff flow.
- Assign moderator scopes flow.
- Candidate disqualification display.

**Acceptance criteria:**

- Report identifies missing screens/services/components.
- No direct table writes proposed; future UI must use U0 RPC.
- Implementation note: audit confirmed no frontend staff management screen existed yet and future implementation must use staff RPC workflows/dictionaries instead of direct staff table writes.

## Task U0-C4 — Moderator scope UI spec

**Status:** Done / confirmed on 2026-04-28.

**Goal:** Design UI flow for assigning moderator scopes.

**Scope:**

- Admin/operator selects user and server.
- UI excludes/disables users with heroes on standard target server.
- UI shows staff-disqualifying history warnings.
- UI allows choosing moderator scopes.

**Acceptance criteria:**

- Spec uses DB dictionaries from `staff_permission_scopes`.
- No hardcoded scope list except transitional display fallback.
- No implementation unless user requests it.
- Implementation note: spec defined safe server/user selection, eligibility checks, moderator role assignment, DB-driven scope selection, required reason/notes and RPC-only submit.

## Task U0-C5 — Role-aware technical metadata visibility audit

**Goal:** Audit where technical keys/raw JSON are shown and whether visibility should depend on role/context.

**Acceptance criteria:**

- Player-facing technical key leaks are identified.
- Moderator-only views are checked against scope/context.
- Admin/operator metadata remains available as secondary information.

## Task U0-C6 — Staff/moderation navigation boundaries audit

**Status:** Done / confirmed on 2026-04-28.

**Goal:** Ensure navigation separates admin global tools, operator server tools, moderator scoped tools and player gameplay.

**Acceptance criteria:**

- Report identifies routes/menu items requiring role/scope guards.
- Moderator does not receive operator/admin tooling unless explicitly allowed.
- Implementation note: audit confirmed admin shell, sidebar, dashboard cards and admin tag-links needed one central route/navigation access policy rather than static prototype visibility.

## Task U0-C7 — Moderation actions UI foundation

**Status:** Done / confirmed on 2026-04-29 through U0-I8 and U0-I9.

**Goal:** Build frontend read/write surfaces for U0 moderation actions after types regeneration.

**Scope:**

- Create local warning/account warning/restriction/suspension/ban through `create_moderation_action`.
- Show required reason.
- Allow source entity id/type where relevant.
- Show moderation history through RPC.

**Acceptance criteria:**

- No direct writes to `moderation_actions`.
- UI uses `moderation_action_types` and `staff_permission_scopes` dictionaries.
- Moderator only sees actions allowed by scope.
- Operator/admin see history.
- Implementation note: `/admin/moderation-actions` uses DB dictionaries, creates actions only through `create_moderation_action`, reads visible/full history through moderation history RPCs, and uses server-scoped user/account and hero target search autocompletes.

## Confirmed U0 implementation follow-ups

These implementation slices were executed after the U0 audit/spec tasks and are recorded here to preserve the completed task history.

- **U0-I1 — Central staff access policy model:** Done / confirmed on 2026-04-28. Added `resolveStaffAccessPolicy(...)` and exported policy types to separate global roles, selected-server staff assignment, management authority, moderation authority, testing access, player gameplay access and assigned-staff gameplay blocking.
- **U0-I2 — Staff gameplay boundary implementation:** Done / confirmed on 2026-04-28. `/hero/*` and `/game/*` now respect staff gameplay blocking on standard servers while preserving sandbox/testing exceptions and membership punishment handling.
- **U0-I3 — Admin route guard and sidebar boundary:** Done / confirmed on 2026-04-28. `/admin/*` is guarded by central staff access policy and normal players no longer see the admin shell entry.
- **U0-I4 — Admin dashboard cards and tag-link filtering:** Done / confirmed on 2026-04-28. Admin dashboard cards and reusable admin tag links now filter through central admin navigation access metadata.
- **U0-I5 — Staff management read models and services:** Done / confirmed on 2026-04-28. Staff management has typed domain/read services, server-scoped staff candidate search, RPC-only staff mutations and DB-backed roles/scopes.
- **U0-I6 — Staff management UI foundation:** Done / confirmed on 2026-04-28. `/admin/staff-management` provides selected-server staff assignment management through server-scoped candidate search and RPC-backed assignment/revoke flows.
- **U0-I7 — Moderator scope assignment UI:** Done / confirmed on 2026-04-29. Staff management supports moderator permission scope assignment using `staff_permission_scopes` labels and `set_server_staff_permission_scopes`.
- **U0-I8 — Moderation actions UI foundation:** Done / confirmed on 2026-04-29. `/admin/moderation-actions` supports server-scoped moderation actions through canonical moderation action RPCs.
- **U0-I9 — Moderation history target picker and full-history modes:** Done / confirmed on 2026-04-29. Moderation action create/history target fields use server-scoped user/account and hero autocompletes and support visible plus full target history modes.

# Special Epic UX — Explainability and impact previews

## Task UX-C1 — Audit raw-key and unexplained UI exposure

**Goal:** Find places where UI exposes raw keys, enum values, JSON blobs, config names or audit/action/entity keys without human-readable label/description/helper text.

**Scope:** config governance, formula governance, audit logs, bonus admin, anti-abuse, building admin, item generation admin.

**Acceptance criteria:** report exact screens/components, classify missing DB metadata vs missing display use, and do not refactor broadly.

## Task UX-C2 — Audit missing gameplay impact previews

**Goal:** Find places where admin can change data but cannot see predicted gameplay effect.

**Examples:** item Normal/Quality/Outstanding preview, formula calculators, building level calculators, bonus/requirement previews.

**Acceptance criteria:** actionable report only; no broad refactor.

## Task UX-C3 — Add human-readable metadata display helpers

**Status:** Done / confirmed on 2026-04-29 through UX-I1.

**Goal:** Add shared helper/component pattern to render label, description/helper, and technical key as secondary metadata.

**Acceptance criteria:** label is primary; key is secondary; raw JSON is in technical details; no hardcoded gameplay dictionary explosion.

- Implementation note: shared `MetadataDisplay` was added and used in Moderation actions action-type details plus Staff management moderator scope options.

## Task UX-C4 — Add dictionary value display helper

**Goal:** Support human-readable labels/descriptions for enum/status/scope/type keys using DB metadata once available.

**Acceptance criteria:** raw enum keys are not primary UI text when dictionary metadata exists.

## Task UX-C5 — Config governance explainability pass

**Status:** Done / confirmed on 2026-04-29 through UX-I2.

**Goal:** Make config governance screens understandable: what the value changes, where it applies, and what risk/scope it has.

- Implementation note: config governance screens consume `get_config_definition_explainability(...)` for DB-backed scope/value/applicability explanations and keep technical JSON/schema as secondary legacy admin previews.

## Task UX-C6 — Formula impact preview calculators

**Status:** Done / confirmed on 2026-04-29 through UX-I4.

**Goal:** Add calculators showing formula output for supplied example inputs, e.g. building level 11 -> level 12 cost.

- Implementation note: `/admin/formulas` includes a formula impact calculator for enabled global/default target assignments, using existing formula runtime and expression preview.

## Task UX-C7 — Item generation quality impact preview

**Status:** Done / confirmed on 2026-04-29 through UX-I5.

**Goal:** Show Normal/Quality/Outstanding outcomes for item generation definitions, bonuses, requirements and drachma value.

- Implementation note: Balance quality tiers include DB-backed item quality impact preview through `get_item_quality_impact_preview(...)` and no hardcoded quality-tier list.

## Task UX-C8 — Building formula impact calculators

**Status:** Done / confirmed on 2026-04-29 through UX-I6.

**Goal:** Show predicted building cost/effect/production by selected level and formula assignment.

- Implementation note: Building admin includes a separate preview section combining local formula output with DB-backed district/cap progression context from `get_building_progression_preview(...)`.

## Task UX-C9 — Bonus and requirement impact preview

**Status:** Done / confirmed on 2026-04-29 through UX-I7 and UX-I7b.

**Goal:** Show resolved effect of bonus templates, entity bonuses, quality scaling, per-level intervals and requirements in human-readable terms.

- Implementation note: Building admin bonus rows show live local explainability and saved canonical bonus impact; building requirements now use a DB-driven central requirement editor backed by `requirement_definitions`, canonical entity requirement RPCs and `get_requirement_impact_preview(...)`.

## Task UX-C10 — Audit and anti-abuse explainability pass

**Status:** Done / confirmed on 2026-04-29 through UX-I3 and UX-I8.

**Goal:** Replace raw audit action/case/sanction keys as primary UI text with labels and explanations.

- Implementation note: Audit logs now show joined audit action/entity labels and collapsed technical JSON; anti-abuse decision explainability has DB-backed dictionary loading and display/projection helpers for sanction, report, declaration and signal types.

## Task UX-C11 — Smoke test UX notes integration

**Goal:** Ensure Codex smoke tests describe both click path and business/gameplay meaning of what is tested.

## Task UX-C12 — ux-ui-notes cleanup and prioritization pass

**Goal:** Periodically group and prioritize UX/UI notes by severity, quick wins, DB metadata needed, and redesign-needed items.
