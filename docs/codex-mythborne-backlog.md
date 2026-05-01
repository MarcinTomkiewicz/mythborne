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

## Epic L known follow-ups / caveats

- Current DB runtime still uses fallback calculations for several formulas. Formula targets exist, but a full DB-side formula evaluator integration is not fully wired into exploration runtime helpers.
- `get_hero_exploration_luck_value(...)` may still return fallback 0 until canonical DB-side derived Luck resolver exists.
- Item generation persistence works through fallback picker/budget helpers, not final Luck-aware item-generation runtime.
- Report snapshots are not implemented yet; exploration graph/step/challenge rows are runtime/debug state, not public report snapshots.
- L-DB4c preview/simulation RPCs are preview tools only. They must not be used as authoritative gameplay resolution.
- Frontend implementation must wait for regenerated `database.types.ts` after the latest PvE schema/RPC changes.

---

# Epic M — Combat

Epic M builds the reusable combat core. Combat is one generic module: a caller provides two combatants and receives a result. Exploration encounters, trials, PvP, sandbox and future systems use the same combat rules and only interpret the result differently.

**DB foundation status:** applied in schema before frontend work. Current DB foundation includes:
- combat formula targets: `combat_initiative_score`, `combat_opponent_scaled_stat`;
- random formula block seeds: `random()`, `random(min, max)`;
- global `combat_turn_limit` config + `get_combat_turn_limit()` helper;
- opponent families/definitions/stat values/natural attack sources;
- opponent equipment blueprint entries using `equipment_slot_definitions`;
- encounter/trial combat candidate tables;
- relational combat result snapshot tables.

**Core rules:**
- Combat is turn-limited. A turn is a full round of eligible attack slots from both sides, unless one side is defeated earlier.
- Default global combat turn limit is 10, read from DB config/helper, not duplicated in combat result rows.
- If no side is defeated by the limit, outcome is draw.
- Player attack resolution remains timing hit → evasion → crit → damage.
- Opponent attacks resolve automatically.
- Attack slots are ordered by `combat_initiative_score`, not by a fixed all-A-then-all-B order.
- Tie in initiative is won by the initiating side.
- Equipment is private. Combat reports show the attack source label and optional item-like component refs for tooltip/display, not the full equipment loadout.
- Public/private report rendering is a later epic, but CombatResult must preserve enough relational snapshot data to reproduce the combat UI later.
- Do not use `hero_derived`.

---

## Task M0 — Align generated DB types after Epic M schema foundation

**Goal:** Make the frontend aware of the new combat DB foundation.

**Scope:**
- Confirm regenerated `database.types.ts` includes new enums, tables, config helper and formula seeds.
- Inspect generated enum/table names for:
  - `combat_side`, `combat_outcome`, `combat_source_type`, `combat_participant_kind`, `combat_attack_source_kind`, `combat_opponent_equipment_mode`, `combat_candidate_kind`;
  - `equipment_slot_definitions`;
  - `combat_opponent_*` tables;
  - `encounter_combat_candidates`, `trial_combat_candidates`;
  - `combat_results`, `combat_result_participants`, `combat_result_participant_stats`, `combat_result_attacks`;
  - `get_combat_turn_limit()`.

**Acceptance criteria:**
- Generated types match current schema.
- No frontend model uses raw DB rows directly as final domain models.
- No file/status docs are updated before user confirmation.

---

## Task M1 — Formula random runtime/editor support

**Goal:** Make seeded random formula blocks executable and explainable.

**Scope:**
- Add runtime support for:
  - `random()` → decimal 0..1;
  - `random(min, max)` → decimal between min and max.
- Do not add separate `randomInt`; integer-like results should use `floor`, `ceil` or `round`.
- Admin formula preview/editor must mark formulas containing random as non-deterministic.
- Add reroll/refresh behavior in preview where applicable.
- Avoid pretending random formulas have stable chart values.

**Acceptance criteria:**
- `FormulaRuntimeService` can evaluate both random forms.
- Existing deterministic formulas remain stable.
- Admin preview clearly indicates randomized output and allows reroll.
- `balance_formula_blocks` remains DB-backed; do not hardcode block library as the source of truth.

---

## Task M2 — Combat domain contracts

**Goal:** Define reusable combat domain models independent from `/game/combat` sandbox UI.

**Scope:**
- Add domain/types for:
  - combatant input/snapshot;
  - combat result;
  - combat participant side: initiator/defender;
  - combat attack source kind;
  - attack plan;
  - attack slot;
  - attack result/event row model.
- Model result from caller perspective without embedding reward/trial/PvP logic.
- Ensure result can later be mapped to `combat_results` and related tables.

**Acceptance criteria:**
- Combat core types are not declared inside components/facades.
- Combat result can represent initiator victory, defender victory and draw.
- Result contains enough data to persist relational snapshot rows.
- Reports are not implemented in this task.

---

## Task M3 — Hero combatant resolver and critical damage debt

**Goal:** Build a reusable resolver for hero combat values from current hero stats, equipment and bonuses.

**Scope:**
- Reuse existing F11 equipment/bonus pipeline where possible.
- Resolve final combat values on the fly, without `hero_derived`:
  - Health;
  - defense;
  - min/max damage;
  - luck;
  - critical chance;
  - critical damage;
  - evasion chance;
  - attack-relevant item/native values.
- Replace hardcoded crit multiplier `2` with:
  - base critical damage = 50%;
  - plus active `critical_damage` bonuses;
  - multiplier = `1 + criticalDamagePercent / 100`.
- Keep equipment private; only attack source data is carried into combat result/report snapshot.

**Acceptance criteria:**
- No `hero_derived` use.
- Hardcoded crit multiplier is removed from final resolver path.
- `critical_damage` bonus target is consumed.
- Existing F11 helpers/services are reused or explicitly rejected with reason.

---

## Task M4 — Opponent definitions read layer

**Goal:** Add frontend/domain read models for admin-defined combat opponents.

**Scope:**
- Read/map:
  - `combat_opponent_families`;
  - `combat_opponent_definitions`;
  - `combat_opponent_stat_values`;
  - `combat_opponent_attack_sources`;
  - `combat_opponent_equipment_entries`;
  - `equipment_slot_definitions`.
- Preserve labels/descriptions/helper/admin descriptions from DB.
- Family is a simple category: one opponent belongs to one family.

**Acceptance criteria:**
- Admin/balance UI can display opponents with family, equipment mode, stat baselines and natural attacks.
- No hardcoded family list.
- No hardcoded slot list if `equipment_slot_definitions` can be read.

---

## Task M5 — Opponent combatant/loadout resolver

**Goal:** Resolve an admin-defined opponent into a combatant input.

**Scope:**
- Scale opponent stat baselines using:
  - candidate scaling formula override if present;
  - otherwise opponent default scaling formula;
  - otherwise global/default `combat_opponent_scaled_stat` assignment.
- Support `difficultyMultiplier` from encounter/trial candidate.
- Support equipment modes:
  - `none`;
  - `manual` item-like blueprint;
  - `generated` item-like loadout materialized for the fight only.
- Generated NPC equipment must not create rows in `items`.
- Natural attack sources such as Bite, Scratch, Iron Wings or Fist must be supported.

**Acceptance criteria:**
- Same opponent can be used by encounter and trial candidates with different scaling formula/multiplier.
- Generated equipment is materialized once for combat input/snapshot, not rerolled during render/attack.
- No player-owned item is created for NPC equipment.

---

## Task M6 — Attack plan builder

**Goal:** Build concrete attack slots from hero/opponent combatants.

**Scope:**
- Apply weapon/attack plan rules:
  - no weapon = one unarmed attack;
  - one one-handed weapon + empty off-hand = weapon attack + unarmed attack;
  - one-handed weapon + shield = one weapon attack;
  - dual wield = one attack from each weapon;
  - two-handed = one attack unless item-native data says otherwise;
  - ranged = two-handed, attack count from item-native `attack_count`;
  - natural attack sources contribute configured attack slots.
- Carry attack source labels and optional item-like components into attack slots.
- Do not expose full equipment in report-oriented output.

**Acceptance criteria:**
- Attack plan is reusable for hero, opponent and future PvP.
- Shields do not create attacks.
- Natural sources and item-like sources are distinguishable.

---

## Task M7 — Initiative and turn order

**Goal:** Order attack slots using the DB formula target `combat_initiative_score`.

**Scope:**
- Evaluate initiative per attack slot using:
  - `combatantIntelligence`;
  - `combatantAgility`;
  - `attackIndex`;
  - `attackCount`.
- Sort slots descending by initiative score.
- Initiator wins tie.
- One combat turn consists of all eligible slots from both sides, unless someone dies earlier.

**Acceptance criteria:**
- Multiattack participants can have interleaved attack order.
- Formula assignment is read from DB; no hardcoded initiative expression as source of truth.
- Random initiative formulas work once M1 random runtime support exists.

---

## Task M8 — Core combat resolver with slot execution

**Goal:** Replace sandbox-only alternating flow with reusable turn-limited slot execution.

**Scope:**
- Keep Walking Dead timing helpers for player-controlled attack timing.
- Resolve each attack in sequence:
  1. timing hit when applicable;
  2. evasion;
  3. crit;
  4. damage roll/final damage;
  5. health update.
- Opponent/automatic attacks do not require real-time UI interaction.
- End combat on initiator victory, defender victory or draw.
- Use `get_combat_turn_limit()` or equivalent DB-backed config path for limit.

**Acceptance criteria:**
- Resolver is reusable outside `/game/combat` page.
- Draw happens only after the global turn limit.
- Minimum successful non-evaded final damage remains enforced.
- Critical damage percent is used instead of hardcoded x2.

---

## Task M9 — Persist combat result snapshot

**Goal:** Map completed combat results into the relational DB snapshot foundation.

**Scope:**
- Insert into:
  - `combat_results`;
  - `combat_result_participants`;
  - `combat_result_participant_stats`;
  - `combat_result_attacks`.
- Store attack source label and source kind.
- Store optional component refs for item-like sources:
  - quality;
  - base;
  - prefix;
  - suffix;
  - historical player item id without FK expectation.
- Do not store full equipment loadout.

**Acceptance criteria:**
- Combat result can be rendered later without recomputing live hero/opponent state.
- Combat reports can show attack order, source label, hit/evasion/crit/damage and health changes.
- Full equipment remains private.
- Future public report system can build from these rows.

---

## Task M10 — Thin sandbox combat caller

**Goal:** Keep `/game/combat` as a sandbox/test caller using the reusable combat core.

**Scope:**
- Remove page-facade ownership of core combat rules where possible.
- Sandbox may still create demo/admin-test inputs, but should call the same resolver path.
- Keep current Walking Dead UI behavior where it remains useful.

**Acceptance criteria:**
- `/game/combat` remains usable as a test surface.
- Core rules are no longer trapped in page-specific state.
- No exploration/trial/PvP integration is required in this task.

---

## Task M11 — Combat admin/balance tooling foundation

**Goal:** Add admin/balance UI surfaces needed to test combat foundation.

**Scope:**
- Opponent family/definition/stat/natural attack read views.
- Candidate read views for encounter/trial combat candidates.
- Initiative preview: user enters stats and attack counts for two sides and sees a sample attack order.
- If formula uses random, preview supports reroll/refresh.

**Acceptance criteria:**
- Admin can inspect opponent/candidate setup without raw-key-only UI.
- Initiative preview explains the sample order in gameplay terms.
- This task does not implement full report sharing.

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
