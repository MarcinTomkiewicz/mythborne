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

**Status:** Done / confirmed 2026-04-30.

**Goal:** Staff can create sanctions.

**Scope:**
- Create sanction.
- Create CP penalty for CP fine.
- Create sanction item links for item sanctions.
- Validate required fields.

**Acceptance criteria:**
- Staff can create at least warning, suspension, CP fine.
- Case detail shows sanctions.
- Implementation note: sanction creation is wired into selected-server case detail through canonical anti-abuse decision workflows. Target hero/account, source hero and item selection use server-scoped search/picker flows instead of UUID-only staff inputs. CP fines create linked Character Point penalties, item sanctions link selected item evidence/context, partial linked-record failures are surfaced and the detail aggregate refreshes after base sanction creation. Full manual smoke is deferred until representative gameplay case/item data exists.

---

## Task H20 — Sanction status update operation

**Status:** Done / confirmed 2026-04-30.

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
- Implementation note: sanction status updates are wired into selected-server case detail through canonical `AntiAbuseDecisions.setSanctionStatus(...)`. The UI requires status reason, uses central sanction status options, labels sanction choices with type/status/target/reason preview, refreshes detail after success, and guards stale success/error responses against case/server changes and selected-sanction changes. Full manual smoke is deferred until representative gameplay sanctions/cases exist.

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

## Task J1 — Inspect current item/trade implementation

**Goal:** Understand what exists before adding trade/anti-abuse logic.

**Scope:**
- Inspect item tables/models.
- Inspect any market/trade/listing code.
- Report gaps.

**Acceptance criteria:**
- Clear list of existing vs missing trade runtime pieces.

---

## Task J2 — Design player-to-player trade model

**Goal:** Prepare trade schema/flow if missing.

**Scope:**
- Trade uses Character Points.
- Drachma/vendor value is not player market value.
- Account for:
  - item sale,
  - substitute payments,
  - loans,
  - group purchase,
  - shared item pool,
  - item lending.

**Acceptance criteria:**
- Proposed schema/flow is reviewable before implementation.

---

## Task J3 — Implement minimal market listing read/write

**Goal:** Enable basic player-to-player listing if approved.

**Scope:**
- Create/list market listings.
- Price in Character Points.
- Server-scoped.
- Active hero context.

**Acceptance criteria:**
- Player can create/list basic item listings.

---

## Task J4 — Implement trade completion with audit hooks

**Goal:** Complete trade transaction safely.

**Scope:**
- Validate seller/buyer/server/item/status.
- Transfer item/CP.
- Write audit.
- Emit anti-abuse signal candidate if suspicious detection exists.

**Acceptance criteria:**
- Trade completion is transactional.

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

---
## Task J6 — Trade and auction audit follow-up

**Goal:** Add audit evidence for significant trade/auction state changes once frontend flows exist and DB audit keys/RPC support are confirmed.

**Scope:**
- Audit-worthy events may include offer created, offer responded, offer confirmed/completed, offer cancelled/rejected/expired, auction listed, bid placed, buy-now completed, auction closed, auction cancelled/expired.
- Prefer DB-side audit inside existing trade/auction RPCs.
- Do not add separate frontend `AuditWriter` calls if the RPC owns the mutation.
- Seed/check `audit_action_types` and `audit_entity_types` before using new audit keys.

**Acceptance criteria:**
- Significant trade/auction operations leave audit evidence where agreed.
- Audit metadata remains lightweight and does not replace report/snapshot data.
- UI-only clicks are not audited.
- If DB/RPC audit support is missing, report DB blocker instead of writing parallel frontend audit.

---

## Task J7 — Vendor scrap/sell for drachmas

**Goal:** Implement the vendor/system economy path for converting items into drachmas, separate from player trade.

**Scope:**
- Treat vendor scrap/sell as a system/vendor operation, not player-to-player trade.
- Use drachmas/resources, not Character Points.
- Decide and implement the canonical DB/RPC path before frontend mutation work.
- Integrate with current item lifecycle rules without bypassing safe scrap/recovery semantics.
- Preserve audit/reason where the operation is significant.

**Acceptance criteria:**
- Vendor scrap/sell does not use trade/auction tables or Character Points.
- Drachma/resource payout is handled by DB/RPC workflow, not direct Angular table updates.
- Item cleanup follows current lifecycle rules.
- If no DB/RPC workflow exists, Codex reports blocker instead of implementing direct writes.

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

# Epic L — PvE exploration/trials

## Task L1 — Inspect current PvE/exploration implementation

**Goal:** Know current state before building loop.

**Scope:**
- Find exploration, trial, encounter code.
- Report what exists vs docs.

**Acceptance criteria:**
- Clear implementation gap report.

---

## Task L2 — Exploration step model

**Goal:** Implement or plan movement step state.

**Scope:**
- Direction choice.
- Every step costs time.
- First step also costs time.
- Discovered branches/nodes remembered.
- Backtracking possible and costs time.

**Acceptance criteria:**
- Movement model follows current decisions.

---

## Task L3 — Trial/encounter roll order

**Goal:** Enforce PvE roll order and progressive trial chance semantics.

**Scope:**
1. roll trial opportunity;
2. if no trial opportunity, roll encounter/empty.
- Trial and encounter do not occur simultaneously.
- Encounter does not reset progressive trial chance.
- Dry-step/trial chance progression resets after any trial opportunity attempt, even if manifestation fails.

**Acceptance criteria:**
- Runtime matches documented roll order.
- Trial chance reset is tied to trial opportunity attempt, not only completed/manifested trial.

---

## Task L4 — Daily trial limit

**Goal:** Implement daily trial gating.

**Scope:**
- Daily limit applies to trials, not steps.
- After trials exhausted, exploration ends for the day.
- Premium can increase opportunities but not quality/luck outcomes.

**Acceptance criteria:**
- Daily trial count controls exploration end.

---

## Task L5 — Trial stages

**Goal:** Model trial appearance/manifestation/completion.

**Scope:**
- Trial appearance.
- Manifestation check.
- Completion challenge/combat placeholder.

**Acceptance criteria:**
- Trial flow has explicit stages.

---

## Task L6 — Encounter types

**Goal:** Implement current encounter categories.

**Scope:**
- Combat encounter.
- Resource encounter.
- Buff/debuff encounter.
- Only one buff/debuff active at a time.

**Acceptance criteria:**
- Encounter rules follow project context.

---

# Epic M — Combat

## Task M1 — Inspect current combat implementation

**Goal:** Compare current code with documented combat model.

**Scope:**
- Timing minigame.
- Evasion.
- Crit.
- Damage.
- Turn limit/draw.
- Formula runtime usage.

**Acceptance criteria:**
- Gap report before changes.

---

## Task M2 — Turn limit and draw behavior

**Goal:** Ensure draw logic is correct.

**Scope:**
- Combat ends after turn limit if both alive.
- Draw gives no reward.

**Acceptance criteria:**
- Draw outcome is represented and rewardless.

---

## Task M3 — Walking Dead timing integration

**Goal:** Align hit timing rules.

**Scope:**
- Green-zone width based on Dexterity vs Agility plus modifiers.
- Successful hits narrow/speed.
- Miss resets.
- Evaded hit counts toward streak.

**Acceptance criteria:**
- Timing behavior follows current decisions.

---

## Task M4 — Evasion/crit/damage sequence

**Goal:** Enforce resolution order.

**Scope:**
1. successful timing hit,
2. evasion check,
3. crit check,
4. damage roll/reduction,
5. minimum 1 final non-evaded damage.

**Acceptance criteria:**
- Combat resolver follows documented sequence.

---

## Task M5 — Formula-backed combat values

**Goal:** Use formula governance for combat formulas.

**Scope:**
- combat_hit_green_zone,
- combat_evasion_chance,
- combat_critical_chance,
- combat_final_damage.

**Acceptance criteria:**
- Combat formula runtime uses DB formula assignments.

---

# Epic N — Stats and progression

## Task N1 — Stat terminology cleanup

**Goal:** Normalize HP/CP naming.

**Scope:**
- Health = hit points.
- Character Points = progression/trade currency.
- Replace legacy Hero Points/PR wording where relevant.

**Acceptance criteria:**
- UI/domain terms reduce HP/CP confusion.

---

## Task N2 — Wire stat allocation UI to `save_stat_allocation(...)`

**Goal:** Use the canonical transactional stat allocation RPC instead of separate frontend writes.

**Scope:**
- Use generated RPC type for `save_stat_allocation(...)`.
- Do not direct-write `hero_stats`.
- Do not direct-update `hero.character_points`.
- Do not write separate frontend audit for this flow.
- Map RPC result into stat/hero state refresh.
- Pass reason and `request_id` where available.

**Acceptance criteria:**
- UI plus/minus clicks are not audited.
- Final confirm/save goes through `save_stat_allocation(...)`.
- Character Points and stats refresh from RPC result or post-RPC read model.
- If a formula-backed cost resolver is later needed, it is added only after a DB contract exists.

---

## Task N3 — Stat cap formula integration

**Goal:** Use formula target for stat caps.

**Scope:**
- `hero_stat_level_cap`.
- Runtime should use formula assignment.

**Acceptance criteria:**
- Stat cap is formula-driven.

---

## Task N4 — Stat upgrade cost formula integration

**Goal:** Use formula target for stat upgrade cost.

**Scope:**
- `hero_stat_upgrade_cost`.
- Runtime should use formula assignment.

**Acceptance criteria:**
- Upgrade costs are formula-driven.

---

# Epic O — Estates, districts and buildings

## Task O1 — Estate/address read layer cleanup

**Goal:** Align estate code with server/hero model.

**Scope:**
- Estate belongs to hero and server.
- Address unique in server.
- Empty estates are not rows.
- District E has one address/seat.

**Acceptance criteria:**
- Estate queries use server id and hero id properly.

---

## Task O2 — Estate address availability UI

**Goal:** Display possible vs occupied addresses.

**Scope:**
- Generate possible labels from district capacity.
- Overlay occupied estate rows.
- Do not create empty estate rows.

**Acceptance criteria:**
- UI can show available/occupied addresses.

---

## Task O3 — Estate relocation flow

**Goal:** Handle irreversible relocation.

**Scope:**
- Moving to empty estate deletes/abandons old estate/building state.
- Require confirmation/warning.
- Audit irreversible action.

**Acceptance criteria:**
- Player cannot accidentally relocate without clear confirmation.

---

## Task O4 — Building definitions read layer

**Goal:** Use relational building definitions.

**Scope:**
- Read buildings.
- Use formula assignments for upgrade cost/time/bonus.
- Respect local formula override if present.

**Acceptance criteria:**
- Building UI uses DB definitions/formulas.

---

## Task O5 — Building upgrade flow

**Goal:** Implement or align building upgrade operation.

**Scope:**
- Validate resources/time.
- Apply upgrade.
- Audit persistent change.
- Use formulas.

**Acceptance criteria:**
- Upgrade flow is transactional/auditable where possible.

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

Historical retained list. For the actual current task position, prefer `current-todo.md` and user-confirmed Codex status files.

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

## Current execution order update — U0 and UX implementation

This section is historical if it conflicts with `current-todo.md`. Preserve only as context.

1. U0-I1 — completed / confirmed: central staff access policy model.
2. U0-I2 — completed / confirmed: staff gameplay boundary implementation.
3. U0-I3 — completed / confirmed: admin route guard and sidebar boundary.
4. U0-I4 — completed / confirmed: admin dashboard/cards/tag-link filtering.
5. U0-I5 — completed / confirmed: staff management read models and services.
6. U0-I6 — completed / confirmed: staff management UI foundation.
7. U0-I7 — moderator scope assignment UI.
8. U0-I8 — moderation actions UI foundation.
9. U0-I9 — moderation history and disqualification panels.
10. UX-I1/UX-I2 quick wins may be interleaved when touching the same admin screens.

Operational rule:
- Do not run U0-C5 or additional UX audits before at least U0-I1 through U0-I4 are implemented unless the user explicitly asks.
- When a screen is already being changed, include the relevant UX implementation improvement instead of creating a separate audit task.

---

# 2026-04-26 Priority Update — DB foundation after trade/auction/anti-abuse stages

This historical priority update is retained for context. Current execution position should come from `current-todo.md` and user-confirmed implementation state.

## Immediate execution order update

Run these before broader gameplay work when still applicable:

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
