# Codex Backlog — Mythsworn Implementation Backlog

Purpose: this backlog translates current project decisions into small, promptable implementation tasks for Codex.

Use this as a practical task queue. Concept documents remain informational; this file is for execution.

## Latest accepted guild follow-up

**Implementation note:** T22 accepted on 2026-05-09. The `/game/guild` in-guild state now has real membership, invite and join-request management UI through a focused `GuildMembershipManagementSection`. The section reuses existing `GuildMembersState`, `GuildInvitesState`, `GuildJoinRequestsState` and `CurrentGuildState`; renders members and roles; exposes pending invite/request sections; supports invite create/cancel; supports incoming join-request accept/reject; and supports outgoing request cancel when DB-backed flags allow it. Accepted join requests refresh the member list, action feedback uses `ToastService`, blocking read/load errors remain inline, invite target hero input uses shared trim-required validation plus trimmed payloads, and repeated explicit action toasts are not suppressed by component-local dedupe. No DB/RPC changes, generated type edits, direct table access, guild armory changes, emergency election actions, role-management/kick/promote/demote UI or fake siege/Argonautics actions were added. Verification passed with focused T22 specs, full guild + route/sidebar specs, `npx tsc --noEmit`, `npm run build` with known warnings and static greps for `button pButton`, `.from(` and direct write patterns. Manual smoke for `/game/guild` in-guild invite/request/member-management flows remains pending.

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

**Implementation note:** P11 accepted on 2026-05-05 as the Epic P technical checkpoint. Codex verified the implemented report slice with `npx tsc --noEmit`, focused report specs with 49 SUCCESS, static grep checks and `npm run build` with known budget/CommonJS warnings. Covered technical paths include `/game/reports`, `/game/reports/:reportId`, root `/report/:publicToken`, private list/detail state, public not-found state, strict private/public mapper boundaries, shared combat/item renderer, low-level producer boundaries and static checks for no direct report table writes, no default frontend notification inserts, no fake contextual producers and no public raw-id leaks in the checked paths. Codex did not claim full manual gameplay smoke because there was no authenticated session or representative seeded/generated report data in this run. Pending manual smoke remains: private list/unread/detail/mark-read/remove/copy public link, public route shellless/not-found/private-data checks, combat timeline rendering, item-reference rendering and deletion semantics with multi-access reports. No new blocker was found in the technical checkpoint.

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

**Status:** Accepted on 2026-05-05.

**Acceptance summary:** Q1 added generated notification RPC/table aliases, typed notification read models and mapper tests for player/staff list items, read/dismiss state, nullable body/action/source fields, toast eligibility and staff/player boundary guards. `StaffNotificationListItem.recipientKind` is narrowed to `staff`; player mapping rejects staff rows and staff mapping rejects non-staff rows. No UI, service, write path or frontend notification writes were added.

**Verification:** `npx tsc --noEmit` passed; focused notification mapper specs passed with 6 SUCCESS; `npm run build` passed with known bundle budget and Supabase `cookie` CommonJS warnings; static greps passed for no direct notification writes, no durable `any`, and no user/account id exposure in the checked notification model/mapper paths.

**Manual smoke:** N/A for mapper-only slice.

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

**Status:** Accepted on 2026-05-05.

**Acceptance summary:** Q2 added the RPC-only `NotificationInbox` service for player/user/hero notification reads. `getPlayerNotifications(...)` uses `ActiveHero.requireActiveHero()` with `get_my_notifications(...)`, passes active `heroId` and `serverId`, requests non-dismissed rows, supports unread/limit/offset filters, maps through the Q1 player mapper and defensively filters dismissed rows. `getPlayerUnreadCount()` uses `get_my_notification_unread_count(...)` only, keeping Reports unread count separate. Staff rows remain blocked by the player mapper boundary. No UI, action service, direct table read/write or frontend notification write path was added.

**Verification:** `npx tsc --noEmit` passed; focused notification service/mapper specs passed with 11 SUCCESS after rerunning outside the known sandbox `spawn EPERM`; `npm run build` passed with known bundle budget and Supabase `cookie` CommonJS warnings; static greps passed for no direct notification writes, no report unread RPC mixing and no durable `any` in the checked Q2 paths.

**Manual smoke:** N/A for service-only slice.

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

**Status:** Accepted on 2026-05-05.

**Acceptance summary:** Q3 extended the RPC-only `NotificationInbox` service with explicit server-scoped staff list/count methods. `getStaffNotifications(serverId, ...)` requires a non-empty server id, uses `get_my_staff_notifications(...)`, requests non-dismissed rows, supports unread/limit/offset filters, maps through the Q1 staff mapper and defensively filters dismissed rows. `getStaffUnreadCount(serverId)` uses `get_my_staff_notification_unread_count(...)` only. Staff methods do not call `ActiveHero.requireActiveHero()`, do not use player notification/count RPCs and do not expose staff notifications through a player UI. Non-staff rows returned by the staff RPC are rejected by the mapper. No UI, action service, direct table read/write or frontend notification write path was added.

**Verification:** `npx tsc --noEmit` passed; focused notification service/mapper specs passed with 16 SUCCESS; `npm run build` passed with known bundle budget and Supabase `cookie` CommonJS warnings; static greps passed for no direct notification writes and no durable `any` in the checked Q3 paths.

**Manual smoke:** N/A for service-only slice.

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

**Status:** Accepted on 2026-05-05.

**Acceptance summary:** Q4 added a player notification bell in the game topbar backed by `NotificationInbox.getPlayerNotifications(...)` and `getPlayerUnreadCount()`. The dropdown shows a concise player-only list with unread badge/state, type label/category/severity, short body, created time and route action links. Action links are allowlisted from player-safe `MENU_LOGGED_IN` game routes: `/game/mansion` is allowed, while `ViewState`, `/admin/...`, `/report/...`, `/game/reports` and unknown `/game/...` routes are blocked. Load errors clear stale notifications and unread count. Styling uses shared dropdown/list utility classes, with no local `notification-bell.scss`. No staff notifications, Reports items, direct notification writes or frontend `create_notification(...)` calls were added.

**Verification:** `npx tsc --noEmit` passed; focused notification bell/service/mapper specs passed with 21 SUCCESS; `npm run build` passed with known bundle budget and Supabase `cookie` CommonJS warnings; static greps passed for no direct notification writes and no `ViewState`/staff/report/admin links in bell/topbar.

**Manual smoke:** Pending real DB row check for building-completed notifications. The source `action_url` must be `/game/mansion`; if DB/content still returns `ViewState`, fix the producer/content source rather than adding a frontend remap.

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

**Status:** Accepted on 2026-05-05.

**Acceptance summary:** Q5 added canonical player notification read/dismiss actions through `NotificationInbox.markPlayerNotificationRead(...)` and `dismissPlayerNotification(...)`, backed only by `mark_notification_read(...)` and `dismiss_notification(...)`. The bell can mark unread rows read, dismiss rows from the normal dropdown and refresh unread count through `get_my_notification_unread_count(...)` after successful mutations, without frontend count guessing. `NotificationBell` remains a thin wrapper and `NotificationBellState` owns loading, pending state, stale guards, action errors and toast feedback. Stale mark-read/dismiss responses after active hero/server changes are ignored and pending ids are cleared on context change, new payload and stale response cleanup. No direct notification table writes, direct `read_at`/`dismissed_at` updates, deletes or frontend `create_notification(...)` calls were added.

**Verification:** `npx tsc --noEmit` passed; focused notification bell/service/mapper specs passed with 30 SUCCESS; `npm run build` passed with known bundle budget and Supabase `cookie` CommonJS warnings; static greps passed for no direct notification writes. `.update(...)` grep hits are Angular signal updates only.

**Manual smoke:** Pending user run: open bell, mark read, dismiss, action link. Denied/invalid action behavior is covered by spec/mock; real DB/RLS denied-action smoke remains pending if suitable data/access exists.

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

**Status:** Accepted on 2026-05-05.

**Acceptance summary:** Q6 added presentation-only fresh notification toasts for the player bell using a safe 60s polling fallback over the persistent inbox. Initial/historical rows are seeded per active hero/server context and do not toast; first successful recovery payload after an initial load failure also seeds instead of spamming old unread rows. Later successful payloads present only unseen, unread notifications whose `defaultToastEnabled` is true, while read rows and disabled-toast rows remain inbox-only. The implementation keeps `NotificationBell` as a thin wrapper and splits responsibilities across `NotificationBellState` for context/load/polling/signals, `NotificationBellActionRunner` for read/dismiss mutations and stale guards, `NotificationActionRoutePolicy` for player route allowlisting through `MENU_LOGGED_IN`, `NotificationBellDisplayFormatter` for display formatting and `NotificationFreshToastPresenter` for toast dedupe/presentation. No realtime dependency, direct notification writes, frontend `create_notification(...)` calls or frontend action-route remap were added. Verification passed with `npx tsc --noEmit`, focused notification-bell specs with 18 SUCCESS, static greps and `npm run build` with known warnings. Full fresh-toast smoke remains pending until real DB producer notification data exists.

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

**Status:** Accepted on 2026-05-05.

**Acceptance summary:** Q7 added a separate staff/admin notification bell in the shell header for server-scoped staff notifications. The surface uses `NotificationInbox.getStaffNotifications(serverId, ...)` and `getStaffUnreadCount(serverId)` from Q3, requires selected server context, and is gated through `resolveStaffAccessPolicy(...)` so normal player access does not render the staff bell or call staff RPCs. Missing selected server shows a clear no-RPC state, loss of staff access resets the UI, and switching selected server immediately clears stale `notifications`, `unreadCount` and `error` while the new load is pending to avoid cross-server leakage. The dropdown shows unread count, title/body, type label/category/severity, created time, read/dismiss state and guarded action links. Staff action routes are allowlisted from real `adminRoutes`, allowing declared admin routes while blocking `ViewState`, `/game/...`, `/report/...`, `/admin/missing` and `/admin/access-denied`. Styling uses shared dropdown/list utilities with no local SCSS. No direct notification writes, frontend `create_notification(...)` calls, staff/player mixing or staff notification exposure in the player bell were added.

**Verification:** `npx tsc --noEmit` passed; focused notification bell specs passed with 26 SUCCESS; `npm run build` passed with known bundle budget and Supabase `cookie` CommonJS warnings; static greps passed for no direct notification writes and no staff RPC usage in the player bell/topbar.

**Manual smoke:** Pending real staff user + selected server + seeded/generated staff notification row. Later smoke should verify real DB/RLS visibility and real staff action URL content.

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

**Status:** Accepted on 2026-05-05.

**Acceptance summary:** Q8 added a read-only `/admin/notification-types` admin surface backed by DB `notification_types` rows. The page exposes key, label, description, helper text, admin description, category, default severity, default toast behavior, active flag and sort order without hardcoded notification type lists. Inactive rows remain visible, `adminDescription` is part of the notification type model and mapper, and UI copy comes from `notification_type_admin_section` metadata with explicit fallbacks. The admin page is not a raw table editor and has no Save/Edit/Delete/Create controls. No notification write path or frontend `create_notification(...)` call was added.

**Verification:** `npx tsc --noEmit` passed; focused notification mapper/service/admin notification-type specs passed with 24 SUCCESS; `npm run build` passed with known bundle budget and Supabase `cookie` CommonJS warnings; static greps passed for no direct notification writes in the touched notification-type paths.

**Manual smoke:** Pending `/admin/notification-types` with real admin/operator access, seeded `notification_types` and `notification_type_admin_section` rows, confirmation of admin navigation card/link, and confirmation that no Save/Edit/Delete/Create controls are exposed.

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

**Status:** Accepted on 2026-05-05.

**Acceptance summary:** Q9 added a read-only `/admin/notification-hooks` diagnostics surface backed by the canonical DB/RPC producer diagnostics contract. The frontend consumes `get_admin_notification_db_owned_producer_diagnostics(...)` through generated project types and maps the current RPC row shape: Polish admin label/description/helper/status/summary copy, notification type keys, notification type JSON snapshots, missing and inactive notification type keys, producer function names, producer function JSON snapshots, missing producer function names, producer table/trigger metadata, diagnostic status and explicit non-producer flags. The page renders real DB/RPC rows rather than a generic missing-source placeholder and does not contain a frontend hardcoded producer registry. `game_report_created_is_not_default_notification_producer` is handled as an explicit non-producer, and missing type/function arrays are shown per row as DB/content blockers. No frontend insert/update/upsert/delete path for `notifications` and no frontend `create_notification(...)` call was added.

**Verification:** `npx tsc --noEmit` passed; focused Q9 mapper/service/page specs passed with 7 SUCCESS; `npm run build` passed with known bundle budget and Supabase `cookie` CommonJS warnings; static greps passed for no `NOTIFICATION_HOOK_PRODUCERS`, no frontend producer registry, canonical `get_admin_notification_db_owned_producer_diagnostics(...)` usage, and no direct notification writes in the touched Q9 paths.

**Manual smoke:** Pending `/admin/notification-hooks` with real admin/operator access and live rows from `get_admin_notification_db_owned_producer_diagnostics(...)`, including confirmation of producer rows, per-row blockers if any, and `game_report_created_is_not_default_notification_producer` as an explicit non-producer.

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

**Status:** Accepted on 2026-05-05 as a technical checkpoint.

**Acceptance summary:** Q10 verified the implemented notification slice technically without claiming unavailable manual DB smoke. Covered paths include notification type/admin read-only surfaces, player and staff notification list/count RPC boundaries, player mark-read/dismiss RPC actions, player/staff bell state and route-guard behavior, fresh-toast eligibility/dedupe rules, and Q9 DB-owned producer diagnostics through `get_admin_notification_db_owned_producer_diagnostics(...)`. No code or DB/RPC behavior was changed during Q10.

**Verification:** `npx tsc --noEmit` passed; focused notification specs passed with 57 SUCCESS; `npm run build` passed with known bundle budget and Supabase `cookie` CommonJS warnings; static greps found no direct notification writes, no `TABLES.notifications`, no `.from('notifications')`, and `create_notification` only in generated `database.types.ts`.

**Manual smoke:** Not claimed by Codex because no authenticated session, live admin/staff/player access or representative workflow data was available in the run. Pending manual checks remain: player inbox load/count/mark-read/dismiss; staff selected-server inbox list/count/RLS; `/admin/notification-hooks` live rows from `get_admin_notification_db_owned_producer_diagnostics(...)`; real producer smoke for building completion plus trade/auction/anti-abuse where data exists; and confirmation that report creation does not create a default notification.

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

**Implementation note:** R1 accepted on 2026-05-05. Added typed PvP RPC aliases and player/admin domain models only; no UI, services, Angular RPC calls, direct table reads/writes or manual flow. Future slices must not render raw `Json` snapshot/context placeholders directly in UI without explicit mapper/contract review.

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

**Implementation note:** R2 accepted on 2026-05-05. Added pure PvP mappers and focused coverage for dictionaries, target eligibility, action/runtime rows, spy results and attack results. Player/admin result mapping remains separated; no UI, services, Angular RPC calls or direct PvP table reads/writes were added.

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

**Implementation note:** R3 accepted on 2026-05-05. Added the thin `PlayerPvp` service over canonical player PvP RPCs using `ActiveHero.requireActiveHero()` and R2 mappers. No UI, routes, direct PvP table reads/writes or internal producer/helper RPC usage were added.

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

**Implementation note:** R4 accepted on 2026-05-05. Added the `PvpUiMetadata` service and PvP metadata namespace constants for DB-backed explainability copy through `get_ui_metadata_entries(...)`. Public service methods return shared `UiMetadataEntryReadModel` values only; raw generated RPC rows are confined to the private RPC helper. No `p_keys` gameplay fallback contract, direct `ui_metadata_entries` reads/writes, direct PvP table access, UI or routes were added.

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

**Implementation note:** R5 accepted on 2026-05-05. `/game/vicinity` is covered by a route contract spec under the guarded `/game` shell, with `requireOnboardedHeroGuard` verified through `canActivateChild`. The slice also locks out `/game/neighborhood` / `neighborhood` route aliases and adds a regression that missing current estate is surfaced as an invariant error without loading occupied address ranges or building fake range data. No new PvP table reads/writes/workflows were added.

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

**Implementation note:** R6 accepted on 2026-05-05. The player sidebar navigation has `Vicinity` pointing to `/game/vicinity`, keeps `Mansion` at `/game/mansion`, and does not introduce `Neighborhood` / `/game/neighborhood`. Sidebar regression coverage verifies that staff-blocked standard server context hides `/game/vicinity`, so the link stays on the same `MENU_LOGGED_IN` gameplay filtering path as other player gameplay links. No UI/workflow/PvP logic was added.

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

**Implementation note:** R7 accepted on 2026-05-05. Added `VicinityTargetCandidatesState` as a UI-state/facade boundary for PvP target candidates with loading, error, empty, district, search and pagination state. Candidate loading goes through `PlayerPvp.getTargetCandidates(...)`; owner-safe active hero resolution remains inside `PlayerPvp`, while the state uses `activeHero.state()` only for context-key snapshots and stale response guards. Missing active hero/server context surfaces a local invariant error and skips the PvP service. Attack/spy eligibility stays passthrough from RPC/mappers, with no frontend recomputation, no action-start workflow and no direct PvP table access.

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

**Implementation note:** R8 accepted on 2026-05-05. `/game/vicinity` now renders a read-only PvP target list from `VicinityTargetCandidatesState` / `PlayerPvp.getTargetCandidates(...)`, with filters for target district, search, page size and pagination. Target rows show player-safe candidate data only: display name, level, estate address, distance score, attack/spy travel time, protection state and attack/spy eligibility. Empty vicinity plots are not used as PvP targets, private target/estate ids are not rendered, eligibility remains RPC/mapper passthrough, and no start attack/spy workflow, combat preview/log, `start_pvp_action(...)` call or direct PvP table access was added.

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

**Implementation note:** R9 accepted on 2026-05-06. `/game/vicinity` now renders PvP target eligibility through a page-local `VicinityPvpTargetCard` and pure `pvp-eligibility-display` helper. Attack/Spy disabled reasons are derived from the RPC-mapped `blockReason` values, use `pvp_targeting_section` UI metadata first when matching reason metadata exists, and keep the raw reason key visible as secondary diagnostics. Fallback display covers attacker busy, target protected, target below/above attack level range and action unavailable without recomputing `can_attack` / `can_spy` or changing the RPC contract. No start attack/spy workflow, combat preview/log, `start_pvp_action(...)` call or direct PvP table access was added. Verification passed with `npx tsc --noEmit`, focused vicinity/PvP eligibility specs with 27 SUCCESS, static greps and `npm run build` with known budget/Supabase `cookie` warnings. Follow-up: real PvP data smoke should confirm metadata labels for main reason keys; fully Polish fallback copy can be handled later or covered through DB metadata.

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

**Implementation note:** R10 accepted on 2026-05-06. `/game/vicinity` now starts eligible spy actions from the PvP target list through `PlayerPvp.startAction(...)` / canonical `start_pvp_action(...)` with `actionKind = spy`. `VicinityPvpTargetCard` remains a thin UI boundary that emits `startSpy`, while `VicinityTargetCandidatesState` owns per-target pending state, success/error feedback, active hero/server stale guards, candidate refresh after success and owner-safe runtime activity refresh through `get_hero_active_runtime_activity(...)`. The frontend did not add Start Attack, combat preview/log, target notification UI, notification writes or direct PvP table access. Verification passed with `npx tsc --noEmit`, focused vicinity/PvP service specs with 48 SUCCESS, static greps and `npm run build` with known budget/Supabase `cookie` warnings. Follow-up: pending submit state is per target; add a global action pending state later only if UX should block parallel attempts against different targets before DB response.

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

**Implementation note:** R11 accepted on 2026-05-06. `/game/vicinity` now starts eligible attack actions from `VicinityPvpTargetCard` through `VicinityTargetCandidatesState` and `PlayerPvp.startAction(...)`, which calls canonical `start_pvp_action(...)` with `actionKind = attack`. Attack and spy share the same start-action path, but the state uses a global `pendingAction` lock so only one PvP action start request can be active at a time. The lock blocks attack->spy, spy->attack and target-A->target-B submits, stays active through owner-safe runtime activity refresh and target-candidate refresh after success, and clears on success, error or stale hero/server response. The card receives global `actionPending` and disables both Start Attack and Start Spy without knowing the RPC boundary. No incoming attack notification UI, combat preview/log, notification write, PvP table write or direct PvP table read was added. Verification passed with `npx tsc --noEmit`, focused vicinity state/card/page specs with 20 SUCCESS, static greps and `npm run build` with known budget/Supabase `cookie` warnings. Manual smoke is N/A in the current environment because no second hero/player target is available.

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

**Implementation note:** R12 accepted on 2026-05-06. `/game/vicinity` now loads and renders active PvP runtime activity through the existing `PlayerPvp.getActiveRuntimeActivity()` service boundary, which uses canonical `get_hero_active_runtime_activity(...)`. A pure `pvp-runtime-activity-display` helper filters the shared `HeroActiveRuntimeActivity` read model to `pvp_attack` / `pvp_spy` only and formats status, start, arrival and deadline facts without creating a separate PvP busy source of truth. `VicinityTargetCandidatesState` owns runtime activity loading and active hero/server stale guards, and the page refresh action reloads both runtime activity and target candidates. Start attack/spy still goes through `PlayerPvp.startAction(...)`; no direct PvP table access/write, notification UI, combat preview/log or PvP result read was added. Verification passed with `npx tsc --noEmit`, focused runtime helper/vicinity state/page specs with 24 SUCCESS, static greps and `npm run build` with known budget/Supabase `cookie` warnings. Manual smoke for real start attack/spy remains N/A without a second hero/player target; if active PvP runtime activity exists, smoke should check the runtime card and refresh. Follow-up: split `VicinityTargetCandidatesState` before the next larger touch, move combined refresh into a state method, consider partial refresh instead of all-or-nothing `forkJoin`, and avoid expanding `ngModel` in new UI work.

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

**Implementation note:** R13 accepted on 2026-05-07. Added `PvpSpyResultState` as a state/facade-only slice for reading one durable spy result through `PlayerPvp.getMySpyResult(...)` / canonical `get_my_pvp_spy_result(...)`. The state covers loading, missing-or-not-accessible, access-denied and generic RPC error states, treats empty/no-row as unavailable without guessing ownership, and uses active hero/server stale guards so context changes cannot leave the state stuck in loading or overwrite current data. No UI, route, raw snapshot rendering, direct PvP table access/write or Angular gameplay authority was added. R14 must provide player-facing no-access copy, avoid raw snapshot JSON without explicit display mappers/contracts, and preserve route-param stale guards.

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

**Implementation note:** R14 accepted on 2026-05-07. Added `/game/vicinity/spy-results/:spyResultId` as a guarded player-facing spy result detail page, with the private dynamic route configured as SSR `RenderMode.Server` instead of prerender. The page consumes `PvpSpyResultState` / `PlayerPvp.getMySpyResult(...)` only, uses route-param stale guards, shows player-facing unavailable/access-denied copy, and displays target summary plus safe base stats, resources, equipment, estate and buildings through `pvpSpyResultDisplay(...)`. It does not render raw snapshot JSON, active exploration/PvP runtime state, staff/admin internals, anti-abuse internals, target notification/write flow, direct PvP table access/write or Angular gameplay authority. Follow-up before broader snapshot display: prefer DB-backed display rows or explicit per-section allowlist contracts over the current conservative denylist for generic primitive rows; remove unused `ButtonModule` at next touch; consider invalid-date fallback and shared label helper reuse if needed.

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

**Implementation note:** R15 accepted on 2026-05-07. Added `PvpAttackResultState` for owner-safe reads through `PlayerPvp.getMyAttackResult(...)` / `get_my_pvp_attack_result(...)`, with loading, unavailable/access-denied/error handling, active hero/server stale guards and no anti-abuse/admin metadata exposure or Angular gameplay calculation.

---

## Task R16 — Attack result UI

**Goal:** Add player-facing PvP attack result display.

**Scope:**

- Display:
  - outcome;
  - attacker/defender role labels;
  - resource consequence summary;
  - XP/reward summary;
  - report link deferred to R17.
- Prestige context may be shown only as future/non-final context.
- Do not show item/building/estate/CP transfer as ordinary PvP consequences.

**Acceptance criteria:**

- PvP attack result is understandable after the fact.
- Display matches DB result context.

**Implementation note:** R16 accepted on 2026-05-07. Added `/game/vicinity/attack-results/:attackResultId` under the guarded game shell and SSR `RenderMode.Server`. The page reads through `PvpAttackResultState`, displays only mapped outcome, role, resource, XP and future-prestige rows, avoids raw JSON and notification context display, keeps access-denied copy player-facing, and leaves report linking/integration for R17.

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

**Implementation note:** R17 accepted on 2026-05-07. `pvp_combat` / `pvp_result` reports are handled through the existing Reports UI path, shared `combat_section_json` parser and `GameReportContent` combat renderer. Empty PvP report payloads keep a safe readiness fallback; no duplicated PvP/combat state, direct reads/writes or raw PvP runtime/log table display was added.

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

**Implementation note:** R18 accepted on 2026-05-07. Player notification action route policy now allows `/game/vicinity/attack-results/:id` only for `pvp.attack_result.attacker` / `pvp.attack_result.defender` with matching `sourceEntity: pvp_attack_result/:id`, and `/game/vicinity/spy-results/:id` only for `pvp.spy_result.ready` with matching `sourceEntity: pvp_spy_result/:id`. Static menu routes remain unchanged; no incoming attack/target spy behavior, direct notification writes or direct PvP reads were added.

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

**Implementation note:** R19 accepted on 2026-05-07. Added `/admin/pvp-overview` and admin dashboard/navigation links for a read-only PvP Foundation overview backed by existing PvP UI metadata RPC/service boundaries. The page summarizes action kinds, targeting, runtime, spy, resources, rewards, reports and anti-abuse metadata, uses existing admin/global UI patterns, and explicitly keeps siege/guild/Prestige future-only unless later DB metadata/routes expose them. No DB/RPC/generated type changes or direct PvP table reads/writes were added.

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

**Implementation note:** R20 accepted on 2026-05-07. Added `/admin/pvp-action-lifecycle` and admin navigation/dashboard links for a read-only PvP action lifecycle surface. The page reads `pvp_action_kinds` and `pvp_action_statuses` through a narrow admin service using generated row types and existing PvP mappers, shows DB labels/descriptions/helper/admin text, and marks active/future action kinds plus blocking/terminal statuses from DB booleans. Siege is shown as future/inactive; no runtime PvP workflow reads, write/action mutation paths, DB/RPC changes or generated type changes were added.

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

**Implementation note:** R21 accepted on 2026-05-07. Added `/admin/pvp-targeting` and admin navigation/dashboard links for a read-only targeting/protection balancer surface. The page reuses the formula admin read model and PvP UI metadata service, displays real PvP targeting formula targets (`pvp_attack_min_target_level`, `pvp_attack_max_target_level`, `pvp_attack_travel_time_seconds`, `pvp_spy_travel_time_seconds`, `pvp_manual_fight_window_seconds`, `pvp_target_protection_seconds`) with labels/descriptions/variables/expressions/default context from DB read rows, and loads metadata from both `pvp_targeting_section` and `pvp_configurator_section`. Metadata matching stays explicit by `key`/`uiGroupKey`; missing rows show configuration gaps rather than fuzzy Angular copy. No DB/RPC/generated type changes, direct PvP runtime reads or writes were added. Follow-up: verify real DB metadata key/uiGroupKey values from dump/seeds on the next touch.

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

**Implementation note:** R22 accepted on 2026-05-07. Added `/admin/pvp-travel-timing` and admin navigation/dashboard links for a read-only PvP travel/manual-window timing surface. The page reuses the formula admin read model to show `pvp_attack_travel_time_seconds`, `pvp_spy_travel_time_seconds` and `pvp_manual_fight_window_seconds` with DB-backed labels/descriptions/variables/expressions/default context, and clearly labels the current output unit as seconds. No DB/RPC/generated type changes, direct PvP runtime reads or writes were added. Follow-up: extract shared formula-target row rendering if another similar PvP admin formula surface is added, and replace the hardcoded seconds label if DB later exposes unit metadata.

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

**Implementation note:** R23 accepted on 2026-05-07. Added `/admin/pvp-resource-consequences` and admin navigation/dashboard links for a read-only PvP resource consequence balancer surface. The page reads eligible resource labels/descriptions from `resource_types`, shows `drachma`, `materials` and `workforce`, uses the formula admin read model for `pvp_resource_steal_percent` and `pvp_attacker_defeat_resource_loss_percent`, and renders forbidden-boundary metadata only through explicit DB metadata key/group matching. No DB/RPC/generated type changes, direct PvP runtime reads or writes were added. Follow-up: extract shared formula-target row rendering before adding a fourth similar admin formula surface; rename the eligible-resource count and excluded consequence category label at next touch.

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

**Implementation note:** R24 accepted on 2026-05-07. Added `/admin/pvp-reward-routing` and admin navigation/dashboard links for a read-only PvP XP reward routing surface. The page reads PvP outcome rows from DB `reward_outcome_kinds` filtered by `source_kind = pvp`, shows matching `reward_profile_assignments`, renders active reward profile entry summaries, and uses the formula admin read model for `pvp_xp_reward`. Character Points are presented as XP/progression-derived rather than a standalone PvP reward route, and standalone CP entries are surfaced as admin configuration gaps. Shared formula-target row logic was extracted for the PvP admin formula surfaces. No DB/RPC/generated type changes, direct PvP runtime reads or reward grant calls were added. Follow-up: confirm the advisory `PVP_REWARD_OUTCOME_KEYS` checklist against real DB keys; avoid counting inactive/future PvP outcomes without assignments as gaps; consider showing outcome active/inactive status.

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

**Implementation note:** R25 accepted on 2026-05-07. Added `/admin/pvp-prestige-context` and admin navigation/dashboard links for a read-only future Prestige context surface. The page reads `pvp_prestige_delta_context` from the formula admin read model, shows `recipientLevel`, `opponentLevel`, `opponentLevelDelta` and `outcomeMultiplier` as a checklist against formula target allowed variables/default context, and reads future-context copy through explicit PvP metadata key/group matching. The UI clearly states this is future context only and does not claim current Prestige points, ranks or scoring are implemented. No DB/RPC/generated type changes or direct PvP runtime reads/writes were added. Follow-up: confirm field keys when the real Prestige epic starts; move to a dedicated Prestige metadata namespace if one is added; consider a shared read-only formula-target component before the next similar surface.

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

**Implementation note:** R26 accepted on 2026-05-07. Added `/admin/pvp-anti-abuse-explainability` and admin navigation/dashboard links for a read-only PvP anti-abuse explainability surface. The page reads active anti-abuse dictionary rows and PvP anti-abuse metadata, shows `same_ip_pvp_attack` and `pvp_feeding_pattern`, and presents `mercenary_contract` as review context rather than an allowlist. It keeps signals as review aids only, does not imply automatic punishment or declaration-based suppression, does not render raw signal payloads/private identifiers, and uses explicit metadata key/UI-group matching only. No DB/RPC/generated type changes, direct PvP runtime reads/writes or raw anti-abuse signal/case reads were added. Follow-up: if DB adds more active PvP signal or declaration-context rows, render DB-driven rows and keep the current key lists only as expected-gap checklists; revisit inactive-row badge branches if active dictionary loaders make them unreachable.

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

**Implementation note:** R27 accepted on 2026-05-07. Added `/admin/pvp-report-producer` and admin navigation/dashboard links for a read-only PvP report producer surface. The page reads `pvp_combat` from DB `game_report_types`, shows the typed producer contract `source_entity_type = pvp_result`, and explains that the report wrapper points at the PvP result while the combat timeline comes from the linked combat result snapshot. It explicitly avoids implying that combat attacks are duplicated into report tables and uses explicit PvP report metadata key/UI-group matching. No DB/RPC/generated type changes, direct PvP/report runtime reads/writes or producer mutations were added. Follow-up: treat inactive `pvp_combat` as a stronger configuration gap; prefer narrow metadata keys such as `pvp_report_producer` / `pvp_report_combat_section` as DB metadata expands; move explanatory prose into metadata rows when DB owns the full copy; read report source entity labels from DB if a dictionary/metadata source appears.

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

**Implementation note:** R28 accepted on 2026-05-07. Added `/admin/pvp-foundation-diagnostic` and admin navigation/dashboard links for a read-only PvP foundation diagnostic surface. The page calls `inspect_pvp_foundation_integration_state(...)` through the normal `Backend.rpc` admin/service boundary, maps optional diagnostic JSON fields without inventing missing values, and shows structural status, formula status, missing functions, missing triggers, incoming notification count and positive-smoke prerequisites. The UI does not expose service-role secrets, create test data, execute positive smoke or read/write PvP runtime tables directly. No DB/RPC/generated type changes were made. Follow-up: confirm the exact RPC return shape if it ever changes from a single JSON object, reload diagnostics if selected server can change in-place, and consider widening blocker counting for non-ok structural/formula statuses.

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

**Implementation note:** S0 accepted on 2026-05-07 as verification-only. Codex inspected the current generated `database.types.ts` read-only and confirmed the S item/equipment contracts are present, including current equipment runtime slots, equip/unequip/bulk equip, loadout presets, armory shelves and item requirement RPC/table contracts. `npx tsc --noEmit` and `npm run build` passed with known build warnings. Regeneration was out of scope/forbidden, and no generated DB type file was edited.

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

**Implementation note:** S1 accepted on 2026-05-07. Added `item-equipment.model.ts` with typed domain models for item summary, lifecycle state, equipment slots, current loadout, operation journals, requirement preview, armory shelves, armory item summaries, loadout presets and preset slot items. The model preserves exact item ids and literal slot keys, uses `ownerHeroId` for item ownership versus loadout/equipping hero context, keeps runtime-usable item statuses as read-model/display classification only, and preserves DB journal `reason` plus `detailsJson` for later mapper/UI use. Requirement preview models remain generic enough to preserve non-stat `valueType`, `requiredKey`, `requiredValue` and nullable `requiredStatKey`. No DB/RPC/generated/runtime changes were made.

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

**Implementation note:** S2 accepted on 2026-05-07. Added typed item/equipment RPC row aliases and pure mappers for item summaries, lifecycle state, current equipment loadouts, equipped item display data, armory shelves/items, item requirement previews, loadout presets, preset slot items and equipment operation journals. Mapper specs verify exact DB key preservation for item ids, owner/loadout hero context and literal slot keys. Operation journal mapping supports grouped, array and nested DB-like journal shapes, normalizes `action`/`actionKey`, `slotKey`/`targetSlotKey`, `reason`/`reasonKey` and details fields, buckets entries by normalized action, and defaults failed entries without explicit success to `success: false`. No DB/RPC/generated type changes were made.

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

**Implementation note:** S3 accepted on 2026-05-07. Added `PlayerEquipment` service over canonical equipment RPCs for current equipment read, single item equip, slot unequip and bulk equip. The service uses `ActiveHero.requireActiveHero()` for hero context, does not assume auth user id as hero id, does not send frontend reason, does not direct-read/write `hero_equipment`, and maps operation results through the S2 journal mapper. Added RPC constants for the equipment service boundary. No DB/RPC/generated type changes were made. Follow-ups: omit optional `p_request_id` keys instead of sending `undefined`, decide/spec empty bulk input behavior, and preserve explicit empty `final_equipment_json` as an empty loadout later.

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

**Implementation note:** S4 accepted on 2026-05-07. Added `CurrentEquipmentState` read facade over `PlayerEquipment` with loading/error/empty states, current loadout, slot list, literal slot-key lookup and `load`/`refresh`/`clear` methods. The state guards responses by request id plus active `serverId:heroId`, ignores older responses after newer refreshes, clears loading on context-changed stale responses, and surfaces missing active hero as an invariant error. No direct table reads/writes, DB/RPC changes or generated type edits were made. Follow-ups: add `DestroyRef`/`takeUntilDestroyed` if the state becomes long-lived/root-provided, and decide in UI whether refresh should keep stale loadout visible to avoid flicker.

---

## Task S5 — Equipment paperdoll UI

**Status:** Done / accepted on 2026-05-07.

**Goal:** Render current equipment by slot.

**Scope:**

- Display slots from DB-backed `equipment_slot_definitions`.
- Use active slot dictionary rows sorted by DB `sort_order`/`key`.
- Show item name/layers/status where useful.
- Show empty slots.
- Show locked status without implying the item is unusable.
- Do not implement equip action in this task unless already provided by S7.

**Acceptance criteria:**

- Player can see current equipment.
- Locked equipped item is shown as equipped, not hidden.
- Empty slot and item lifecycle states are clear.

**Implementation note:** S5 accepted on 2026-05-07. The armory paperdoll now renders from the read-only `equipment_slot_definitions` dictionary through `PlayerEquipment.getEquipmentSlots()`, using the real DB filter column `is_active` and DB sort order instead of a local Angular slot list. `ArmoryPage` joins equipped items by literal `slotKey` via `CurrentEquipmentState.slot(...)`, so custom DB-backed slots render even when they were not in the old hardcoded list. Empty slots and locked equipped items remain visible. No equip/unequip UI, direct `hero_equipment`/`items` writes, DB/RPC changes or generated type edits were added. Follow-ups: surface equipment slot dictionary load errors instead of silently showing no slot definitions, and avoid mapping `equipmentArea` as `equipmentSlotGroup` unless that fallback is intentional.

---

## Task S6 — Armory shelf read state

**Status:** Done / accepted on 2026-05-07.

**Goal:** Add state/facade for armory inventory organized by shelves.

**Scope:**

- Load armory items for active hero through `get_hero_armory_items(...)`.
- Load shelf names/metadata through `get_hero_armory_visibility_state(...)`.
- Preserve 10 shelf structure.
- Treat position `0` as the unsorted/default drop area.
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

**Implementation note:** S6 accepted on 2026-05-07 after the blocker fix. `PlayerArmory` now reads armory visibility/capacity through DB-owned `get_hero_armory_visibility_state(...)` and visible items through `get_hero_armory_items(...)`, using active hero context only. The read model maps DB fields for total/visible/hidden counts, `visible_item_capacity` source, source config, visible statuses, unsorted position `0`, and DB-owned shelves `1..10`. It no longer calculates visibility from direct `items` plus `hero_armory_shelves`, does not mark shelf 1 as the default drop shelf, and keeps locked trade/auction items visible when the RPC returns them. No equip/unequip UI, DB/migration changes or generated-type edits were made by Codex; current regenerated DB types were used read-only. Follow-up: when this area is next touched, sort `shelves_json` by position and ensure raw visibility JSON is not exposed directly in player-facing UI.

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

**Implementation note:** S7 accepted on 2026-05-07 after the DB formula resolver fix and manual smoke. `/game/armory` now renders visible armory shelves and item cards from the DB/RPC-backed `ArmoryShelfState`; position `0` is the unsorted/drop area, player shelves preserve DB positions `1..10`, and items are joined only by matching `armory_shelf_position`. The UI renders `visibilityLimit` exactly from `get_hero_armory_visibility_state(...)` without hardcoded `30/35/40` or local recalculation; manual smoke confirmed armory level 1 shows `Limit 30`. Raw item layer IDs and raw visibility JSON/source strings are not shown in player-facing UI. No equip/unequip UI, DB/RPC changes or generated-type edits were made by Codex.

---

## Task S8 — Armory shelf management

**Status:** Done / accepted on 2026-05-07.

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

**Implementation note:** S8 accepted on 2026-05-07. Armory shelf rename and item move actions use canonical owner-safe RPCs through `PlayerArmory`, with active hero context and no direct writes to `items` or `hero_armory_shelves`. Shelf `0` remains the unsorted/drop area and is not renameable, while move targets support positions `0..10`. Mutation return rows are checked before refreshing the DB-owned armory read model, including runtime `success: false` payloads if returned; stale mutation responses after active hero/server context changes clear previous armory state. The player UI uses PrimeNG controls rather than raw browser controls and still does not add equip/unequip actions. No DB/RPC/generated changes were made by Codex.

---

## Task S9 — Item detail / popover equipment data

**Status:** Done / conditionally accepted on 2026-05-07.

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

**Implementation note:** S9 conditionally accepted on 2026-05-07 after S9-FIX2 DB/RPC hardening and real Demonic Dagger smoke. `/game/armory` item Details use canonical `get_hero_armory_item_detail(p_hero_id, p_item_id)` through the active hero id, with stale response guarding. Player-facing Item stats consume `bonuses_json.itemStats.rows`; player-facing Bonuses consume `bonuses_json.itemStats.bonusRows` when present, otherwise `bonuses_json.modifierRows`. `hiddenNativeRows`, `nativeRows` and diagnostic `rows` are not rendered as player-facing bonuses, and Angular does not classify native rows by `base_type_key`. Manual smoke confirmed Value `300 drachma`, Item stats `Damage 2-9`, Bonuses `Critical chance +2` and `Maximum damage +4`, with no `No bonuses returned.`, `CriticalChance`, `Max Damage Flat`, `Critical Chance Flat`, `Flat`, native/base/zero/debug rows, or console/runtime errors. Follow-up: detail RPC currently returns `base_type_key` but not `base_type_label`, `equipment_slot_group`, `hand_usage`, valid/equippable slot keys or player-facing placement metadata; future detail/equipment UI must get these from DB/RPC/read model rather than infer slot compatibility in Angular.

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

**Implementation note:** S10 accepted on 2026-05-08. `/game/armory` item Details now show DB/RPC-resolved equip requirements in a separate Requirements section. `PlayerArmory.getArmoryItemDetail(itemId)` preserves owner-safe sequencing by first calling `get_hero_armory_item_detail(p_hero_id, p_item_id)` with the active hero id, then calling `get_item_effective_requirements(p_item_id)`, `get_item_requirement_component_rows(p_item_id)` and `check_hero_meets_item_requirements(p_hero_id, p_item_id)` only after the detail row is confirmed, using `detailRow.item_id` rather than the raw input. Empty or denied detail responses do not trigger requirement RPCs or stat-label reads. Angular no longer masks canonical requirement rows with a hardcoded requirement whitelist; if DB/RPC returns a row in this read model, the UI renders it. Manual smoke for a real item looked OK, while fuller variants remain pending for item without requirements, item with met requirements and item with unmet requirements. Follow-up: `PlayerArmory` should be split or reduced on the next larger armory touch because shelf reads, shelf mutations, detail reads and requirement orchestration now share one service.

---

## Task S11 — Equip single item action

**Status:** Done / accepted 2026-05-08.

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

**Implementation note:** S11 accepted on 2026-05-08. `/game/armory` visible item cards now use a simple `Equip` button without exposing a slot dropdown. The default player flow calls `equip_hero_item(...)` through `PlayerEquipment.equipItem(...)` without `p_target_slot_key`, so DB/RPC owns default slot selection and hand/ring/armor placement. Operation journals are surfaced as player feedback, `success=false` is treated as a domain result instead of an app crash, and current equipment plus visible armory items refresh after the RPC. User smoke confirmed `Quality Leather Vest of Marble` equipped into `Pancerz`, with the Details popover still rendering correctly and showing no requirements for that item.

**Follow-up accepted on 2026-05-08:** Dashboard runtime combat stats and Hero Stats now consume the DB-owned `get_hero_dashboard_runtime_stats(p_hero_id)` read model. Damage is rendered per attack source from `damage_rows_json` rather than as a locally aggregated fallback, and Hero Stats are rendered from `stats_json` instead of `StatsService.getFinalStats(...)` plus local origin-bonus composition. The dashboard path does not call `hero.getHeroStats()`, does not use `hero_derived`, does not direct-read/write `hero_equipment`, and does not treat `get_hero_equipment_runtime_bonus_totals` as the combat source of truth. Item detail keeps using `get_hero_armory_item_detail(...)`; player-facing Bonuses come from `modifierRows`, while `itemStats.consumedModifierRows` is not rendered as ordinary Bonuses. Cleanup candidate: retire `HeroDerivedStats` / the local derived resolver after topbar and combat-demo surfaces move to DB-owned runtime contracts.

---

## Task S12 — Unequip slot action

**Status:** Done / accepted 2026-05-08.

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

**Implementation note:** S12 accepted on 2026-05-08. `/game/armory` paperdoll slots now show `Unequip` for equipped items and call `unequip_hero_item(...)` through the existing `PlayerEquipment` / `CurrentEquipmentState` path. The action preserves DB operation journals, refreshes current equipment and visible Armory items, does not direct-write `hero_equipment`, and does not mutate item status in Angular. User smoke confirmed an equipped item can be unequipped, the slot becomes empty, the item can be equipped again through default `Equip`, and no Angular-side item status mutation was observed. Follow-up: neutralize shifted journal wording from `Already equipped` to `Shifted` or rely directly on DB messages before slot-rotation UX is finalized.

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

**Implementation note:** S13 accepted on 2026-05-08 after static review and user smoke. `/game/armory` now supports bulk selection of visible armory items and submits the selected items in UI selection order to canonical `bulk_equip_hero_items(...)` through the hero-scoped equipment service / `CurrentEquipmentState` path. The bulk payload is ordered `{ itemId }[]` without explicit target slots, without an equip slot dropdown and without an Angular-side compatibility engine. The UI renders the full DB operation journal, including equipped, shifted, unequipped and failed entries, so partial success remains visible. The Armory flow uses PrimeNG `p-checkbox`, `p-select` and component `<p-button />` with Reactive Forms; it does not use `ngModel`, `FormsModule`, `button pButton`, dynamic `[formControl]` helpers in the template or direct `hero_equipment` writes. User smoke confirmed `/game/armory` loads without console errors, bulk select works, `Equip selected` shows the full journal, current equipment / shelves / runtime stats refresh, and the move shelf select does not regress to the previous form-control runtime error. Follow-up: `armory-page.html` and `armory-page.ts` are now heavy; the next larger Armory touch should extract bulk selection, journal and shelf item card concerns into smaller components or dedicated state.

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

**Implementation note:** S14 conditionally accepted on 2026-05-08. `PlayerEquipment` was renamed to `HeroEquipment` at file, class, import and spec level with no compatibility alias, because equipment is scoped to the active hero rather than the player/account. `HeroEquipment` now supports loadout preset read, save current loadout, rename, clear, preview and apply through canonical generated RPCs, including standalone `rename_hero_loadout_preset(...)`. Rename does not call `save_current_hero_loadout_preset(...)`, does not mutate saved slots, does not apply/preview/equip, and does not direct-write `hero_loadout_presets`, `hero_loadout_preset_slots` or `hero_equipment`. Preset result rows are guarded by `(hero_id, preset_number)` where the target preset is known; wrong hero or wrong preset rows fail loudly, and empty preset mutation responses report `returned no preset row`. Blank rename returns controlled `rename_hero_loadout_preset_name_invalid` feedback. Verification passed with `npx tsc --noEmit`, focused hero equipment/current equipment/Armory specs, static greps for no `PlayerEquipment|player-equipment` and no direct equipment writes, and `npm run build` with known budget/CommonJS warnings. Follow-up: `HeroEquipment` is already broad; before S15/S16 preset UI or workflow additions, check whether to split a `HeroLoadoutPresets` service/state or preset facade instead of adding more UI/workflow responsibility to `HeroEquipment`.

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

**Implementation note:** S15 accepted on 2026-05-08. `/game/armory` now includes player-facing loadout preset management through a dedicated `LoadoutPresetManagement` component and `HeroLoadoutPresetsState`, keeping preset UI/workflow state out of the already broad `HeroEquipment` service and reducing the Armory page surface. The UI shows DB-owned preset slots, allows rename, clear and save current loadout through canonical `HeroEquipment` methods backed by `rename_hero_loadout_preset(...)`, `clear_hero_loadout_preset(...)` and `save_current_hero_loadout_preset(...)`, and does not apply/preview/equip during rename. Blank rename maps to controlled `Preset name is required.` feedback. No direct writes to `hero_loadout_presets`, `hero_loadout_preset_slots`, `hero_equipment`, `items` or `hero_armory_shelves` were added, `database.types.ts` was not touched, and UI copy avoids the standalone word `set` for presets. Verification passed with `npx tsc --noEmit`, focused Armory/loadout preset specs, static greps for no `ngModel`, `FormsModule`, `button pButton`, `[disabled]` on `formControlName` controls or direct gameplay table writes, and `npm run build` with known budget/CommonJS warnings. S16/S17 remain separate tasks for preview and apply.

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

**Implementation note:** S16 accepted on 2026-05-08 after user smoke. `/game/armory` loadout presets now expose a `Preview` action through the existing `LoadoutPresetManagement` component and `HeroLoadoutPresetsState`, backed by canonical `HeroEquipment.previewLoadoutPreset(...)` / `preview_hero_loadout_preset(...)` plus DB-owned equipment slot definitions for literal empty-slot display. The preview renders exact saved item IDs, literal target slots, owned/available, missing, no-longer-owned, scrapped and empty-slot states, does not run frontend requirement checks, does not imply similar item substitution, and has no apply/equip side effect. Preview responses are guarded against active hero/server context changes. Verification passed with `npx tsc --noEmit`, focused loadout preset management/state specs, static greps for no `ngModel`, `button pButton`, `[disabled]` on `formControlName` controls or direct table writes, and `npm run build` with known budget/CommonJS warnings. User smoke confirmed `/game/armory -> Preview preset` shows exact IDs, literal slots, empty slots, unavailable states and no apply side effect. Cleanup: removed 0 / added preview UI-state coverage; unused code checked.

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

**Implementation note:** S17 accepted on 2026-05-08 after user smoke. `/game/armory` loadout presets now expose `Apply preset` through `LoadoutPresetManagement`, using `CurrentEquipmentState.applyLoadoutPreset(...)` and canonical `HeroEquipment.applyLoadoutPreset(...)` / `apply_hero_loadout_preset(...)`. The frontend sends only the preset number, does not run requirement rechecks, does not implement slot/hand/ring rotation, and does not direct-write equipment, preset, item or armory tables. The existing equipment result panel now displays DB journal equipped/shifted/unequipped/failed/skipped entries plus DB-returned final equipment, so partial apply results stay visible. Successful apply uses the existing equipment final-equipment/refresh path and refreshes Armory/runtime stats. Verification passed with `npx tsc --noEmit`, focused current-equipment/loadout-preset/Armory specs, static greps for PrimeNG/form/direct-write gates, and `npm run build` with known budget/CommonJS warnings. User smoke confirmed preview -> apply shows equipped/skipped/failed/final equipment, refreshes current loadout and armory, and preserves partial results. Cleanup: removed 2 / added 168 / net +166; unused code checked.

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

**Implementation note:** S18 accepted on 2026-05-08 after user smoke. `/game/armory` loadout preset preview now compares the previewed preset with current equipment by literal slot and exact item id where current equipment data is loaded or empty. When they differ, the preview panel shows a non-intrusive `Current loadout differs` suggestion with local `Dismiss` and intentional `Save current loadout`; dismiss is UI-local and does not persist or nag after dismissal for the same preset update key. The overwrite action reuses the existing `saveCurrentLoadout(...)` path, backed by canonical `save_current_hero_loadout_preset(...)`, and no auto-update, apply side effect, requirement check, slot rotation or direct table write was added. Pure preview/suggestion display logic was extracted to feature-local `loadout-preset-preview-display.ts`, reducing `LoadoutPresetManagement` from 235 to 158 lines. Verification passed with `npx tsc --noEmit`, focused loadout preset spec, static greps for PrimeNG/form/direct-write gates, and `npm run build` with known budget/CommonJS warnings. User smoke confirmed matching preset has no suggestion, differing preset shows suggestion, dismiss works locally, and save current loadout overwrites the intended preset and refreshes UI. Cleanup: component -77 lines / helper +122 lines / net +45 production TS; unused code checked.

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

**Implementation note:** S19 accepted on 2026-05-08 after user smoke and the Migrator DB/RPC boundary fix. `/game/armory` now exposes one player-facing lifecycle action for active items: `Sell to vendor`, backed only by `ItemLifecycleService.vendorScrapHeroItem(...)` / canonical `vendor_scrap_hero_item(...)`. The previous player-facing `Scrap` CTA and `scrapItem(...)` / `scrapHeroItem(...)` frontend path were removed, along with `toScrapHeroItemRpcArgs`, `ScrapHeroItem*` frontend types, `RPC.scrap_hero_item`, and the obsolete safe-scrap classification helper. Locked trade/auction items do not get vendor sell actions. Vendor lifecycle success triggers current equipment/runtime refresh even if the later Armory read-model refresh fails; stale/context-changed lifecycle responses do not run the post-mutation Armory refresh. Verification passed with `npx tsc --noEmit`, focused item lifecycle mapper/service specs, Armory shelf state spec, Armory page spec, static greps for no direct writes/no forbidden Angular patterns/no player-facing scrap path, and `npm run build` with known budget/CommonJS warnings. User smoke confirmed active item has exactly one sell CTA, locked item has none, equipped sold item disappears from current equipment, and sold item disappears from the normal Armory list. Cleanup: removed obsolete player-facing scrap path / added vendor-only UI-state tests and shared mutation runner / unused code checked.

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

**Implementation note:** S20 accepted with follow-up on 2026-05-08 after user smoke. `/admin/scrapped-item-recovery` now provides a staff recovery surface for DB-returned recoverable scrapped affix items. The page uses `ItemLifecycleService.searchRecoverableScrappedItems(...)` / `search_recoverable_scrapped_items_page(...)` for inspection and `ItemLifecycleService.recoverScrappedItem(...)` / `recover_scrapped_item(...)` for recovery, without direct `items` writes and without touching `database.types.ts` or migrations. The UI states that ordinary no-affix items are hard-deleted by lifecycle policy and are not presented as recoverable. Verification passed with `npx tsc --noEmit`, focused page/state specs, static greps and `npm run build` with known budget/CommonJS warnings. User smoke confirmed route rendering, selected server context, clear empty recoverable state, no fake rows and no implied no-affix recovery. Recovery execution on a real recoverable affix item remains untested because no convenient fixture/data item exists. Follow-up: on the next small anti-abuse/admin touch, check whether DB ACL should be mirrored more precisely by splitting UI policy into `canSearch` for anti-abuse triage/sanction inspection and `canRecover` for sanction-management recovery authority. Do not keep growing `ScrappedItemRecoveryState`; split it on the next meaningful expansion.

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

**Implementation note:** S21 accepted with follow-up on 2026-05-08. Frontend runtime mapping now treats `active`, `locked_trade`, and `locked_auction` as runtime/equipment-usable item statuses, while `scrapped` remains excluded. The only local runtime filter found was `isPlayerUsableItemStatus(...)` used by combat hero attack-source mapping; it now uses the current runtime-usable status set instead of active-only logic. Combat regressions cover locked trade/auction equipped items being included as attack sources and scrapped equipped rows being excluded. No DB/RPC path, direct write, Armory CTA, `database.types.ts`, migration or status-doc change was made before acceptance. Verification passed with `npx tsc --noEmit`, focused item/combat mapper specs, focused runtime equipment specs and `npm run build` with known budget/CommonJS warnings. Follow-up: do not broaden `isPlayerUsableItemStatus(...)` for vendor sell/scrap/listing eligibility; if touched again, consider renaming or replacing it with a clearer runtime/equipment-specific helper name.

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

**Implementation note:** S22 accepted on 2026-05-08. `/game/exploration` live combat challenge messaging now states that live loadout resolution is DB-owned per combat action and that Angular does not filter equipment by item lifecycle status. The existing canonical path still sends only player timing input through the exploration live-combat RPC/service flow and does not send or calculate stats, equipment, damage, HP, final outcome or rewards. Touched challenge-panel buttons were converted from `button pButton` to `<p-button>`. No DB/RPC path, direct write, generated type, migration or `isPlayerUsableItemStatus(...)` change was made. Verification passed with `npx tsc --noEmit`, focused exploration page spec and `npm run build` with known budget/CommonJS warnings. Manual smoke is deferred until a real exploration combat challenge appears; later UI copy can unify the mixed Polish/English boundary text.

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

**Implementation note:** S23 accepted on 2026-05-08. `/game/combat` remains a documented sandbox/test surface using the currently loaded hero runtime snapshot, while its Training Duel copy now explicitly states that production live combat resolves loadout and timing manifests through DB/RPC per action. The change does not reuse exploration live-combat state/service because this route is not the production live combat surface. A focused component regression covers the boundary text. No DB/RPC path, direct write, generated type, migration, service/helper/component or `isPlayerUsableItemStatus(...)` change was made. Verification passed with `npx tsc --noEmit`, focused combat page spec and `npm run build` with known budget/CommonJS warnings. User smoke for real exploration live combat confirmed DB log, HP updates, finalization, outcome/turns/result rendering; attack-source labels remain a future safe read-model/UI improvement only if DB exposes them.

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

**Implementation note:** S24 accepted with follow-up on 2026-05-08 after blocker fix. PvP spy result Equipment now labels the section as a DB-recorded current equipment snapshot. PvP attack result display now shows explicit player-facing boundary notes that equipment belongs to DB/runtime combat resolution and that ordinary PvP attacks do not transfer, steal or destroy items. The previous player-facing numeric Prestige delta/projected-delta rows were removed; until a dedicated player-safe Prestige summary contract exists, attack result Prestige display is limited to a non-numeric future-context row. No DB/RPC path, direct write, raw JSON preview, Angular Prestige calculation/fallback, generated type, migration or status-doc schema change was added. Verification passed with `npx tsc --noEmit`, focused PvP display/page specs and `npm run build` with known budget/CommonJS warnings. Manual smoke remains user-owned for representative PvP result pages.

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

**Implementation note:** S25 accepted on 2026-05-08 after cleanup pass. `/admin/balance` now renders a DB-backed item requirement aggregation section from `item_requirement_aggregation_settings`, explains the DB-owned highest-component-plus-additional-fraction rule, shows base/prefix/suffix contribution roles, and displays quality `multiplier` separately from `requirementMultiplier`. The UI does not create per-item instance requirement editing or Angular-owned requirement formulas. Cleanup split `ItemRequirementAggregationSection` into a presentational component, extracted quality form construction into `ItemGenerationQualityFormFactory`, reduced the broad balance form factory, and made touched item-generation table reads use `TABLES.*` consistently. No DB/RPC contract change, direct write, migration, generated type edit or status-schema change was added. Verification passed with `npx tsc --noEmit`, focused item-generation/balance specs, static template checks and `npm run build` with known budget/CommonJS warnings. Optional RPC-constant check found no existing `RPC.get_item_quality_impact_preview`, so the existing raw RPC string was left unchanged rather than adding churn.

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

**Implementation note:** S26 accepted on 2026-05-08 after user smoke. `/admin/balance` quality impact preview now labels `Value/bonus multiplier` separately from `Requirement multiplier`; value/bonus data comes from the DB/RPC preview rows and requirement multiplier data comes from the already loaded DB-backed quality rows. No hardcoded multiplier values, Angular-side requirement calculation, DB/RPC change, migration, generated type edit or quality generation semantic change was added. Verification passed with `npx tsc --noEmit`, focused item-generation mapper/form specs and `npm run build` with known warnings.

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

**Implementation note:** T0 accepted on 2026-05-08 as verification-only. Current generated `database.types.ts` already exposes the expected guild tables/RPCs for identity, config, membership, invites, join requests, roles, officer management, emergency election, guild armory, loans and access locks. Codex did not edit/regenerate generated types and did not add frontend substitutes for missing contracts. Verification passed with `npx tsc --noEmit` and `npm run build` with known warnings.

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

**Implementation note:** T1 accepted with follow-up on 2026-05-08. Added `guild.model.ts`, `guild-rpc.types.ts`, `guild-mappers.ts` and focused mapper specs for guild summary/detail, current hero guild state, membership, member list rows, invites, join requests and config summary. The mapper layer uses generated RPC row types, keeps raw rows out of future components, preserves reasons/status reasons, handles empty optional fields as null, and does not expose `member_user_id` in the player-facing member model. No services, UI, routes, RPC calls, direct guild table writes, DB/RPC changes, migrations or generated type edits were added. Verification passed with `npx tsc --noEmit`, focused `guild-mappers.spec.ts` and `npm run build` with known warnings. Follow-up for T2/UI: if role dictionary labels/descriptions are needed, add a DB-backed guild role model/read path instead of hardcoding role lists.

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

**Implementation note:** T2 accepted on 2026-05-08. Added `PlayerGuild` and `CurrentGuildState` over canonical guild RPC read models, with explicit no-guild/member/officer/leader/loading/error states, DB/RPC-derived permissions, active hero + selected server stale guards, and focused service/state specs including the `hasGuild()` null-state regression. No UI, routes, DB/RPC changes, migrations, generated type edits, status writes during implementation or direct guild table access were added. Verification passed with `npx tsc --noEmit`, focused guild specs and `npm run build` with known warnings.

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

**Implementation note:** T3 accepted on 2026-05-09. Added generated RPC aliases and player-facing discovery/search models for `search_guilds_for_hero(...)`, mapped DB rows through `guild-mappers`, and extended `PlayerGuild` plus `GuildDiscoveryState` for active-hero guild search with request-id and active hero/server stale guards. Mapper/service/state specs cover query, pagination, DB-owned `can_request_to_join`, member count/limit, pending request/invite statuses, raw/private field exclusion, overlapping searches and active context changes. No UI/routes, DB/RPC changes, generated type edits, direct guild table reads/writes or frontend join-availability calculation were added. Verification passed with `npx tsc --noEmit`, focused guild specs and `npm run build` with known warnings. Manual smoke remains N/A until a future UI slice has enough real sandbox guild/hero data.

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

**Implementation note:** T4 accepted on 2026-05-09. Added generated RPC aliases and player-facing create input/result models for `create_guild(...)`, mapped create args/result through `guild-mappers` without exposing `audit_log_id`, and extended `PlayerGuild` plus `GuildCreateState` for DB-config-owned creation cost, current guild eligibility, canonical create submission, RPC error surfacing, current guild refresh after success and active hero/server stale guards. No UI/routes/menu, DB/RPC changes, generated type edits, migrations, direct guild table reads/writes or frontend creation fallback were added. Verification passed with `npx tsc --noEmit`, focused guild specs and `npm run build` with known warnings. Manual smoke remains N/A until a future guild UI entry slice wires this state into a page.

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

**Implementation note:** T5 accepted on 2026-05-09. Added generated RPC aliases and player-facing invite input/result models for `create_guild_invite(...)`, `respond_guild_invite(...)`, `cancel_guild_invite(...)` and `get_hero_guild_invitation_rows(...)`. Invite RPC calls live in dedicated `PlayerGuildInvites`; invite args/result mapping lives in `guild-invite-mappers`; `GuildInvitesState` loads relevant invites, creates/cancels/responds, refreshes `CurrentGuildState` after create/cancel/accept, preserves reject without current-guild refresh, uses canonical DB status key `cancelled`, and guards stale active hero/server responses. No UI/routes/menu, DB/RPC changes, generated type edits, migrations, direct guild table reads/writes or frontend membership insert/fallback were added. Verification passed with `npx tsc --noEmit`, focused guild specs and `npm run build` with known warnings. Manual smoke remains N/A until a future guild UI entry slice wires this state into a page.

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

**Implementation note:** T6 accepted on 2026-05-09. Added generated RPC aliases and player-facing join-request input/result models for `create_guild_join_request(...)`, `review_guild_join_request(...)`, `cancel_guild_join_request(...)` and `get_hero_guild_join_request_rows(...)`. Join request RPC calls live in dedicated `PlayerGuildJoinRequests`; join request args/result mapping lives in `guild-join-request-mappers`; `GuildJoinRequestsState` loads relevant requests, creates/reviews/cancels, refreshes current guild and discovery state after mutations, uses canonical terminal status `cancelled`, and guards stale active hero/server responses. No UI/routes/menu, DB/RPC changes, generated type edits, migrations, direct guild table reads/writes, frontend membership insert, permission fallback or Angular-side eligibility calculation were added. Verification passed with `npx tsc --noEmit`, focused guild specs and `npm run build` with known warnings. Manual smoke remains N/A until a future guild UI entry slice wires this state into a page.

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

**Implementation note:** T7 accepted on 2026-05-09. Added generated RPC aliases and player-facing member action input/result models for `kick_guild_member(...)`, `promote_guild_member_to_officer(...)` and `demote_guild_officer(...)`; member list still reads through `get_hero_guild_members(...)`. Member RPC calls live in dedicated `PlayerGuildMembers`; member list/action mapping lives in `guild-member-mappers`; `GuildMembersState` loads members, runs kick/promote/demote actions, refreshes member list and current guild state after mutations, and guards stale active hero/server responses. `member_user_id` and `audit_log_id` are not exposed in player-facing domain models. The one-officer rule remains DB-owned and RPC errors surface. No UI/routes/menu, DB/RPC changes, generated type edits, migrations, direct guild table reads/writes, frontend membership insert/update or DB-rule fallback were added. Verification passed with `npx tsc --noEmit`, focused guild specs and `npm run build` with known warnings. Manual smoke remains N/A until a future guild UI entry slice wires this state into a page.

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

**Implementation note:** T8 accepted on 2026-05-09. Added generated RPC aliases and player-facing lifecycle input/result models for `leave_guild(...)` and `disband_guild(...)`. Lifecycle RPC calls live in dedicated `PlayerGuildLifecycle`; lifecycle args/result mapping lives in `guild-lifecycle-mappers`; `GuildLifecycleState` runs leave/disband actions, refreshes current guild state after success, and guards stale active hero/server responses. `audit_log_id` is not exposed in player-facing lifecycle result models. Leader leave and non-leader disband are blocked before RPC, while DB-owned blockers such as active siege remain RPC-owned and surface as errors. No UI/routes/menu, DB/RPC changes, generated type edits, migrations, direct guild table reads/writes, frontend membership deletion or DB-rule fallback were added. Verification passed with `npx tsc --noEmit`, focused guild specs and `npm run build` with known warnings. Manual smoke remains N/A until a future guild UI entry slice wires this state into a page.

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

**Implementation note:** T9 accepted on 2026-05-09. Added generated RPC aliases and focused emergency-election domain models for `get_hero_guild_emergency_election_summary(...)` and `get_hero_guild_emergency_election_candidate_rows(...)`. Election read RPC calls live in dedicated `PlayerGuildElections`; mapping lives in `guild-emergency-election-mappers`; `GuildEmergencyElectionState` loads active election summary/candidates, exposes phase/status and DB-owned start eligibility via the current guild dashboard permission, and guards stale active hero/server responses. Candidate and summary models do not add quorum/50% semantics, do not calculate results, do not compute leader inactivity locally, and do not invent time-remaining rules beyond exposing DB timestamps. No UI/routes/menu, DB/RPC changes, generated type edits, migrations, direct guild table reads/writes or normal confidence-vote UI were added. Verification passed with `npx tsc --noEmit`, focused guild specs and `npm run build` with known warnings. Manual smoke remains N/A until a future guild UI entry slice wires this state into a page.

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

**Implementation note:** T10 accepted on 2026-05-09. Emergency leader election actions now use generated canonical RPC contracts through a dedicated `PlayerGuildElectionActions` service, while `PlayerGuildElections` remains the read-only election service. `GuildEmergencyElectionState` loads through the read service and mutates through the action service for start, nominate, start voting, vote and finalize, with active hero/server stale guards, current guild refresh and election reload after successful actions. Election timing, quorum/no-quorum rules, max candidates, winner/tie-break semantics and final result authority remain DB-owned; Angular only maps and surfaces RPC/read-model data. No UI/routes/menu, DB/RPC changes, generated type edits, migrations or direct guild table reads/writes were added. Verification passed with `npx tsc --noEmit`, focused T10 specs, full guild specs and `npm run build` with known warnings. Manual smoke remains N/A until a future guild UI entry slice wires this state into a page.

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

**Implementation note:** T11 accepted on 2026-05-09. Guild armory core now has DB-backed domain models for current armory items, loans, operation results and member access lock state, with no unused shelf model because current read RPC rows do not expose shelf fields. `PlayerGuildArmory` is read-only over `get_hero_guild_armory_item_rows(...)` and `get_hero_guild_armory_loan_rows(...)`; `PlayerGuildArmoryActions` uses canonical deposit, borrow, return, force-return, withdraw, remove and member-access RPCs only. Read/action mapper files and read/action service specs are split. Player-facing item states remain limited to `available`/`borrowed`; owner/borrower fields are mapped only where DB exposes them; `audit_log_id` is not exposed in domain results. No UI/routes/menu, DB/RPC changes, generated type edits, migrations, direct guild armory/loan/item/equipment writes, `.from(` usage, frontend ownership-transfer logic or shelf mapping were added. Verification passed with focused T11 specs, full guild specs, `npx tsc --noEmit`, `npm run build` with known warnings, and static greps for direct writes / `.from(`.

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

**Implementation note:** T12 accepted on 2026-05-09. Added a read-only `GuildArmoryReadSection` and local `GuildArmoryReadState` under `src/app/game/pages/guild` for current guild armory display. The section shows DB/RPC-backed current armory items, available vs borrowed state, owner, borrower for borrowed items, current loans and capacity summary with `0 = unlimited` handling. Shelf grouping/UI was intentionally not added because the current guild armory read RPC rows do not expose shelf fields. The section uses PrimeNG `<p-button />`, host width class and explicit status class bindings. No route/menu entry, T13/T20 behavior, DB/RPC/migration/generated type/status-contract change, direct write, `.from(` usage, frontend ownership-transfer logic, removed/withdrawn historical list or full click log was added. Verification passed with focused T12 specs, full guild + guild page specs, `npx tsc --noEmit`, `npm run build` with known warnings, `git diff --check`, duplicate file checks and static greps for `button pButton`, `.from(` and direct write patterns. Manual/route smoke remains N/A until T20 wires the section into a route/menu entry.

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

**Implementation note:** T13 accepted on 2026-05-09. The existing `GuildArmoryReadSection` now includes deposit, owner withdraw and leader/officer remove UI actions through a local `GuildArmoryItemActionsState` that delegates to canonical `PlayerGuildArmoryActions` only. Equipped item deposit is blocked before RPC using the current equipment read state, while DB/RPC-owned eligibility still controls persisted deposit/withdraw/remove behavior. Successful deposit/withdraw/remove refreshes the guild armory read state plus the player's armory and current equipment contexts; stale active hero/server mutation responses do not set feedback or refresh state. Header refresh now reloads both the guild armory read state and deposit context. No route/menu, DB/RPC/migration/generated type/status-contract change, direct table access, `.from(` usage, frontend ownership-transfer logic, shelf UI or T14/T20 behavior was added. Verification passed with focused T13 specs, full guild + guild page specs, `npx tsc --noEmit`, `npm run build` with known warnings, `git diff --check`, and static greps for `button pButton`, `.from(` and direct write patterns. Manual/route smoke remains pending until T20 wires the guild section into a route/menu entry.

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

**Implementation note:** T14 accepted on 2026-05-09. The existing `GuildArmoryReadSection` now exposes borrow and return UI actions through local `GuildArmoryItemActionsState` and canonical `PlayerGuildArmoryActions` only. Borrow uses `borrowGuildArmoryItemForActiveHero(...)`; return uses `returnGuildArmoryLoanForActiveHero(...)` from both current item rows and current loan rows. Button visibility is driven by DB-backed `canBorrow` and `canReturn` flags from the read model, including the locked-access return case. The UI does not assume borrowing changes `items.hero_id`, does not add frontend ownership-transfer logic, and does not expose trade, auction, vendor, equipment or T15 force-return actions for borrowed guild armory items. No route/menu, DB/RPC/migration/generated type/status-contract change, direct table access, `.from(` usage or T20 behavior was added. Verification passed with focused T14 specs, full guild + guild page specs, `npx tsc --noEmit`, `npm run build` with known warnings, `git diff --check`, and static greps for `button pButton`, `.from(` and direct write patterns. Manual/route smoke remains pending until T20 wires the guild section into a route/menu entry.

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

**Implementation note:** T15 accepted on 2026-05-09. The existing `GuildArmoryReadSection` now exposes force-return UI actions through local `GuildArmoryItemActionsState` and canonical `PlayerGuildArmoryActions.forceReturnGuildArmoryLoanForActiveHero(...)` only. Force-return is available from borrowed item rows and current loan rows when the DB-backed `canForceReturn` flag is true, and the UI shows a clear warning that force-return can remove borrower equipment. Successful force-return refreshes guild armory read state, personal armory state and current active hero equipment from DB/RPC state. The UI does not add direct table access, local ownership-transfer logic, borrower equipment simulation, action history, route/menu changes, DB/RPC changes, generated type edits, migrations or T20 behavior. Verification passed with focused T15 specs, full guild + guild page specs, `npx tsc --noEmit`, `npm run build` with known warnings, `git diff --check`, and static greps for `button pButton`, `.from(` and direct write patterns. Manual/route smoke remains pending until the guild armory section is reachable via route/menu.

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

**Implementation note:** T16 accepted on 2026-05-09. `get_hero_guild_members(...)` is now the canonical member access read surface for the UI through generated `armory_access_status_key`, mapped to `GuildMemberListItem.armoryAccessStatusKey` without Angular-side access guessing. The existing `GuildArmoryReadSection` shows per-member `allowed`/`blocked` armory access status and exposes leader/officer block/unblock actions through canonical `PlayerGuildArmoryActions.setGuildArmoryMemberAccessForActiveHero(...)` only. Successful access changes refresh guild members, current guild state and guild armory read state. Transient action success/error feedback uses the shared `ToastService`; inline `<p-message>` remains only for blocking read/load state. No route/menu, DB/RPC changes, migrations, generated type edits by Codex, direct `guild_armory_access_locks` reads, `.from(` usage, direct table writes, low-level helper UI contract, local access-state fallback or T17/T20 behavior was added. Verification passed with focused T16 specs, full guild + guild page specs, `npx tsc --noEmit`, `npm run build` with known warnings, `git diff --check`, and static greps for `button pButton`, `.from(` and direct write patterns. Manual/route smoke remains pending until the guild armory section is reachable via route/menu and suitable leader/officer/member test data exists.

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

**Implementation note:** T17 accepted on 2026-05-09. Player Armory now uses feature-local `ArmoryGuildItemUsageState` over canonical `PlayerGuildArmory.getActiveHeroGuildArmory(false)` to show private/deposited/borrowed-from/borrowed-by guild armory usage on visible armory items and item detail popovers. Private item actions such as equip, bulk equip, shelf move and vendor sell are hidden and guarded for deposited, borrowed or unavailable guild item usage. No client-side ownership transfer, direct table access, trade/auction/vendor workflow expansion, route/menu changes, DB/RPC changes, migrations or generated type edits were added. Verification passed with focused T17 specs, full guild + armory specs, `npx tsc --noEmit`, `npm run build` with known warnings and static greps for `button pButton`, `.from(` and direct write patterns. Manual smoke remains pending.

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

**Implementation note:** T18 accepted on 2026-05-09. `GuildArmoryReadSection` now shows a minimal guild support placeholder for future siege and Argonautics support, both explicitly bound to guild membership. No siege/Argonautics implementation, fake action buttons, friend-based support, diplomacy, influence, reputation, route/menu changes, DB/RPC changes, migrations or generated type edits were added. Verification passed with focused T18 spec, full guild + guild page specs, `npx tsc --noEmit`, `npm run build` with known warnings and static greps for `button pButton`, `.from(` and direct write patterns. Manual/route smoke remains pending until the guild section is reachable through route/menu.

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

**Implementation note:** T19 accepted on 2026-05-09. Added a read-only `GuildConfigSummarySection` to the admin config definitions page, backed by canonical `PlayerGuild.getGuildConfigSummary()`. The section displays guild creation cost, member limit formula, leader inactivity threshold, nomination/voting durations, emergency max candidates and guild armory capacity, rendering `armoryCapacity = 0` / unlimited as `Unlimited`. No config mutation UI, direct DB access, route/menu changes, DB/RPC changes, migrations, generated type edits or unrelated guild moderation behavior were added. Verification passed with focused T19 spec, config/guild read specs, `npx tsc --noEmit`, `npm run build` with known warnings and static greps for `button pButton`, `.from(` and direct write patterns. Manual smoke for `/admin/config-definitions` remains pending.

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

**Implementation note:** T20 accepted on 2026-05-09. Added lazy `/game/guild` route, sidebar `Guild` entry and thin `GuildPage` composition over `CurrentGuildState`. The page shows no-guild entry areas for create/search/join requests/invites, in-guild overview/member/election summaries and mounts the existing `GuildArmoryReadSection`. No new guild mutations, custom forms, DB/RPC changes, migrations, generated type edits, direct table access, siege/Argonautics implementation or fake siege/Argonautics action buttons were added. Verification passed with focused T20 specs, full guild + route/sidebar specs, `npx tsc --noEmit`, `npm run build` with known warnings and static greps for `button pButton`, `.from(` and direct write patterns. Manual smoke for `/game/guild` remains pending.

---

## Task T21 — Guild entry UI: create, search, join requests, invites

**Goal:** Replace `/game/guild` no-guild placeholder entry cards with real guild entry workflows.

**Scope:**

- Create guild.
- Search guilds.
- Request to join and cancel request.
- Accept or reject received invites.
- Use existing `CurrentGuildState`, `GuildCreateState`, `GuildDiscoveryState`, `GuildJoinRequestsState` and `GuildInvitesState`.

**Acceptance criteria:**

- No-guild player can create a guild, search guilds, request to join, cancel a request and accept/reject invites.
- Mutations use canonical guild service/state/RPC layers only.
- `pending/accepted/rejected/cancelled` status spelling stays aligned with DB.
- No fake siege/Argonautics actions.

**Implementation note:** T21 accepted on 2026-05-09. The `/game/guild` no-guild state now has real create/search/request/cancel/invite response UI over the existing guild states and canonical service layer. Create and accepted invites refresh current guild state; request/cancel refresh discovery plus join requests; invite reject refreshes invites only; join-request review refreshes current guild for both accept and reject. Search/read errors are shown inline, while transient action success/error uses `ToastService`. No DB/RPC changes, migrations, generated type edits, direct table access, membership fallback, route/menu changes or fake siege/Argonautics actions were added. Verification passed with focused T21 specs, full guild + route/sidebar specs, `npx tsc --noEmit`, `npm run build` with known warnings and static greps for `button pButton`, `.from(` and direct write patterns. Manual smoke for `/game/guild` create/search/request/cancel/invite flows remains pending.


# GUILD-FOLLOWUP-1 / T21 — Guild Entry UI: create, search, join requests, invites

**Status:** accepted/done. Manual smoke pending for `/game/guild` create/search/request/cancel/invite flows.

## Cel

Zamienić no-guild placeholder cards na realne, klikalne sekcje wejścia do gildii.

## Zakres

Na `/game/guild`, w stanie `no-guild`, dodać realne UI dla:

- create guild;
- search guilds;
- request to join / cancel request;
- received invites accept/reject.

Użyć istniejących core state/services:

- `CurrentGuildState`;
- `GuildDiscoveryState`;
- `GuildJoinRequestsState`;
- `GuildInvitesState`;
- `PlayerGuild`;
- `PlayerGuildJoinRequests`;
- `PlayerGuildInvites`.

Po sukcesie akcji odświeżać właściwe stany:

- create/accept join → `CurrentGuildState`;
- request/cancel → discovery + join requests;
- invite accept → current guild + invites;
- invite reject → invites, bez niepotrzebnego current guild refresh.

## Non-goals

- Bez zmian DB/RPC/generated.
- Bez direct table access.
- Bez membership insert fallbacków.
- Bez route/menu zmian poza istniejącym `/game/guild`.
- Bez admin/member management UI.

## Acceptance

- Użytkownik bez gildii może faktycznie:
  - utworzyć gildię;
  - wyszukać gildie;
  - wysłać request;
  - anulować request;
  - zaakceptować/odrzucić invite.
- UI nie pokazuje fikcyjnych akcji siege/Argonautics.
- Wszystkie mutacje idą przez canonical RPC/service layer.
- Statusy `pending/accepted/rejected/cancelled` są zgodne z DB, bez `canceled`.

## Manual smoke

- No-guild hero: create guild.
- No-guild hero: search guilds → request join → cancel request.
- Target hero: accept invite → current guild refresh.
- Target hero: reject invite → invite znika albo zmienia status, bez fałszywego guild state.

---

# GUILD-FOLLOWUP-2 / T22 — In-guild membership/invite/request management UI

**Status:** accepted/done. Manual smoke pending for `/game/guild` in-guild member/invite/join-request management flows.

## Cel

Dla gracza będącego w gildii zrobić realną sekcję zarządzania członkostwem, invite’ami i requestami, zamiast samych liczników.

## Zakres

Na `/game/guild`, gdy hero jest w gildii, dodać UI dla:

- listy członków;
- invite create/cancel;
- incoming join requests review accept/reject;
- own outgoing join requests, jeśli relevant dla aktualnego read modelu;
- pending invite/request counts jako linkowane/realne sekcje, nie tylko liczby.

Użyć istniejących:

- `GuildMembersState`;
- `GuildInvitesState`;
- `GuildJoinRequestsState`;
- `CurrentGuildState`.

Akcje pokazywać tylko tam, gdzie DB-backed permissions/capability flags pozwalają.

## Non-goals

- Bez guild armory zmian.
- Bez emergency election actions.
- Bez DB changes.
- Bez local role/permission inference poza oczywistym UI guardem; DB/RPC dalej final authority.

## Acceptance

- Leader/officer widzi requesty i może accept/reject, jeśli DB pozwala.
- Uprawniony gracz może create/cancel invite.
- Członkowie i role są widoczne.
- Błędy RPC surface’ują się jako toast/action error.
- Blocking read errors zostają inline.

## Manual smoke

- Leader/officer zaprasza hero.
- Zaproszenie jest widoczne u target hero.
- Join request od no-guild hero jest widoczny dla leader/officer.
- Accept join request aktualizuje member count/current guild.

---

# GUILD-FOLLOWUP-3 / T23 — Guild member role/lifecycle UI

**Status:** accepted/done. Manual smoke pending/data-blocked because the current server has only one character/guild member.

## Cel

Dodać realne przyciski member management: kick/promote/demote/leave/disband.

## Zakres

W in-guild member section dodać:

- kick member;
- promote member to officer;
- demote officer;
- leave guild;
- disband guild.

Użyć istniejących:

- `GuildMembersState`;
- `GuildLifecycleState`;
- `PlayerGuildMembers`;
- `PlayerGuildLifecycle`.

UI guard:

- regular member nie widzi/nie odpala management actions;
- leader leave blokowany w UI zgodnie z istniejącą zasadą;
- disband tylko leader;
- one-officer rule i inne ograniczenia zostają DB-owned.

## Non-goals

- Bez transfer leadership, bo `transfer_guild_leadership` było poza T8 scope.
- Bez nowych RPC.
- Bez admin override.

## Acceptance

- Kick/promote/demote/leave/disband działają przez canonical RPC only.
- Po sukcesie odświeża się current guild + member list.
- RPC errors typu “last officer”, “cannot disband during active siege” surface’ują się bez lokalnego obchodzenia.

## Manual smoke

- Leader promote member.
- Leader demote officer.
- Officer może kick member, ale nie officer/leader.
- Member leave.
- Leader disband, jeśli DB pozwala.

---

# GUILD-FOLLOWUP-4 / T24 — Emergency election full UI

**Status:** accepted/done. Manual smoke pending/data-dependent for start election, nominate, start voting, vote, finalize, DB-backed action visibility, counts and timestamps.

**Implementation note:** T24 accepted on 2026-05-09. The `/game/guild` page now mounts a real emergency election section using `GuildEmergencyElectionState` and the canonical election service/action layer. The UI renders active election summary, DB timestamps, candidates and DB-backed action visibility for start, nominate, start voting, vote and finalize. Mutation feedback uses `ToastService`; read/load and nomination validation feedback stay inline. Refresh is disabled during both reads and mutations so pending action feedback cannot be cleared mid-mutation. No DB/RPC/generated changes, direct table access, local quorum calculation, local result inference or fake emergency flow were added. Verification passed with focused T24 + guild page specs, `npx tsc --noEmit`, `npm run build` with known warnings and static greps for `button pButton`, `.from(` and direct write patterns.

## Cel

Zamienić emergency election read/action core w realne UI.

## Zakres

Na `/game/guild` dodać sekcję emergency election:

- active election summary;
- candidates;
- start emergency election;
- nominate;
- start voting;
- vote;
- finalize.

Użyć:

- `GuildEmergencyElectionState`;
- `PlayerGuildElections`;
- `PlayerGuildElectionActions`;
- DB-backed `canNominate/canStartVoting/canVote/canFinalize`.

Countdown/time display ma bazować na timestampach z DB, bez lokalnego odtwarzania reguł.

## Non-goals

- Bez client quorum calculation.
- Bez local result inference.
- Bez DB changes.
- Bez fake emergency flow, jeśli brak aktywnej/ineligible sytuacji.

## Acceptance

- UI pokazuje aktualny phase/status.
- Akcje widoczne tylko według DB-backed capability flags.
- Po każdej akcji refresh election + current guild.
- Brak lokalnej semantyki quorum/50%/winner poza tym, co zwraca DB.

## Manual smoke

- Ineligible start → RPC error.
- Eligible start → nomination phase.
- Nominate candidate.
- Start voting.
- Vote.
- Finalize.

---

# ADMIN-FOLLOWUP-1 — Guild config edit via governance change-set

## Cel

Admin nie tylko widzi guild config summary, ale może przejść do kontrolowanej edycji przez config governance.

## Zakres

W `GuildConfigSummarySection` dodać ścieżkę edycji dla configów gildii.

Nie robić prostego direct form save. Użyć istniejącego config governance/change-set flow:

- draft change set;
- add config value change entries;
- mark ready;
- apply/cancel;
- reason/audit.

Dodać linki/akcje przy wartościach:

- creation drachma cost;
- member base limit;
- member limit per leader level;
- leader inactivity threshold;
- nomination duration;
- voting duration;
- emergency max candidates;
- armory capacity / unlimited.

## Non-goals

- Bez direct table writes.
- Bez omijania governance.
- Bez edycji generated types.
- Bez osobnego custom RPC, jeśli istniejący config governance wystarcza.

## Acceptance

- Admin może rozpocząć change-set z poziomu guild config summary.
- Każda zmiana tworzy governance entry, nie zapisuje bezpośrednio wartości.
- Summary po apply pokazuje nowe wartości.
- UI jasno pokazuje, że `0 = unlimited` dla armory capacity.

## Manual smoke

- Create draft.
- Change armory capacity z `0` na wartość.
- Mark ready/apply.
- Summary pokazuje nowy limit.

**Implementation note:** ADMIN-FOLLOWUP-1 accepted on 2026-05-09. `GuildConfigSummarySection` now includes a real editable guild config form backed by focused `GuildConfigEditorState`. The editor creates a governed change set, adds changed config value entries in sequence, marks the draft ready, applies it, then reloads `PlayerGuild.getGuildConfigSummary()`. Numeric fields use Reactive Forms validation for required, non-negative integer values; `armoryCapacity = 0` is accepted and displayed as `Unlimited`; governance reason is required. The frontend uses an explicit contract map from non-prefixed `get_guild_config_summary()` fields to prefixed canonical `config_definitions.key` values: `creationDrachmaCost -> guild_creation_drachma_cost`, `memberBaseLimit -> guild_member_base_limit`, `memberLimitPerLeaderLevel -> guild_member_limit_per_leader_level`, `leaderInactivityThresholdDays -> guild_leader_inactivity_threshold_days`, `nominationDurationMinutes -> guild_emergency_nomination_duration_minutes`, `votingDurationMinutes -> guild_emergency_voting_duration_minutes`, `emergencyMaxCandidates -> guild_emergency_max_candidates`, and `armoryCapacity -> guild_armory_capacity`. No fallback/alias mapping, DB/RPC/generated edits, direct writes or `.from(...)` access were added. Verification passed with focused admin config specs, relevant config specs, `npx tsc --noEmit`, `npm run build` with known warnings and static greps. Manual smoke for creation cost and unlimited armory capacity apply/reload passed per acceptance.
- Cancel draft nie zmienia wartości.

---

# ADMIN-FOLLOWUP-2 — Item requirement aggregation editability

## Cel

`Item Requirement Aggregation` w balance/admin przestaje być tylko podglądem.

## Najpierw preflight decyzyjny

Ustalić, gdzie DB trzyma te zasady:

- config governance value;
- relacyjne balance tables;
- dedicated admin RPC.

Nie zgadywać na froncie.

## Wariant A — jeśli to config governance

Dodać edycję przez change-set flow, analogicznie do guild config.

## Wariant B — jeśli to relacyjne balance records

Dodać canonical admin RPC dla upsert/update/deactivate/reorder. Dopiero potem UI CRUD.

## Zakres UI

- Edycja aggregation settings.
- Walidacja formularza bez lokalnego duplikowania DB rules.
- Preview/impact, jeśli istnieje canonical RPC.
- Toasty dla transient action feedback.
- Inline tylko dla blocking read errors.

## Non-goals

- Bez direct table writes.
- Bez hardcoded Angular constants jako źródła prawdy.
- Bez tymczasowego local-only save.

## Acceptance

- Admin może realnie zmienić aggregation rule.
- Zmiana przechodzi przez governance/RPC boundary.
- Po refreshu UI pokazuje DB value.
- Nie ma fallbacków, które udają brak kontraktu.

## Manual smoke

- Zmień jedną regułę aggregation.
- Zweryfikuj refresh.
- Zweryfikuj, że item detail/requirements używają nowych wartości, jeśli runtime jest podpięty.

---

# ADMIN-FOLLOWUP-3 — Admin config/edit navigation polish

## Cel

Read-only summary cards nie mogą wyglądać jak “koniec funkcji”, jeśli istnieje osobny flow edycji.

## Zakres

Dodać jasne CTA/linki:

- `Edit via change set`;
- `Open config definition`;
- `View effective value source`.

Dotyczy:

- guild config summary;
- item requirement aggregation;
- innych read-only summary sekcji w adminie.

Jeżeli edycja jeszcze nie istnieje, dodać wyraźny tekst:

> Read-only until edit workflow is implemented.

## Acceptance

- Admin wie, czy dana sekcja jest tylko podglądem, czy ma dostępny workflow edycji.
- Nie ma martwych “ładnych summary”, które sugerują pełną funkcjonalność.

---

# Epic U — Luck Foundation

Epic U wires the DB-owned Luck Foundation into frontend/domain/admin surfaces after the Luck Foundation DB/RPC migrations are complete.

Luck is a global RNG/opportunity stat. It is not only an item-drop stat.

Luck affects gameplay RNG where the roll can help the player, unless that configurable RNG surface is explicitly Luck-excluded. Luck never guarantees success.

Epic U is not:

- Luck Lab;
- a full balancing UI with sliders and charts;
- a redesign of the admin information architecture;
- a new item generation model;
- a new trial/minigame framework;
- a Maze/Harpy/minigame implementation;
- a replacement for reward profiles;
- a frontend formula authority.

Luck Lab belongs to the next follow-up epic.

**Current DB/RPC foundation expected before Codex starts Epic U tasks:**

- regenerated `database.types.ts` after Luck Foundation DB migrations;
- DB-owned RNG surface inventory/read model or equivalent metadata/read RPC;
- DB/formula/config support for `luckInfluence` or equivalent;
- DB/formula/config support for `trial_power`;
- Luck-aware trial opportunity computation;
- Luck-aware trial manifestation computation;
- Luck-aware challenge auto-resolve computation;
- Luck-aware exploration encounter fallback computation;
- Luck-aware combat RNG formula/config contracts where applicable:
  - hit chance;
  - evasion chance;
  - critical chance;
  - critical damage;
- drop generator audited or adjusted so Luck influence remains consistent with the current bucket/value/quality/prefix/suffix model;
- reward amount range Luck behavior decided and exposed if applicable;
- DB metadata/explainability for Luck/RNG surfaces where admin UI should show labels/descriptions.

If the DB/RPC contract is missing, Codex must report a DB dependency instead of hardcoding Luck formulas in Angular.

**Epic rules:**

- Angular must not become authoritative for Luck formulas.
- Frontend previews may display DB/RPC/formula outputs, but durable gameplay decisions are DB/RPC-owned.
- Do not hardcode Luck multipliers, Luck caps, encounter chance, trial chance, manifestation chance, hit/evasion/crit formulas or drop formulas in Angular.
- Do not create a second item rarity system.
- Do not add rarity flags for prefix/suffix/component combinations.
- Item rarity/frequency continues to come from drachma value, bucket budget and item-generation rules.
- `trial_power` is the canonical domain name for effective trial strength.
- `trial_power` is conceptually `testedStatValue + luckInfluence`.
- `luckInfluence` is not raw `luckValue` and is not 1:1.
- Difficulty and district affect formulas/caps/pressure that consume `trial_power`; they are not part of `trial_power` itself.
- `nothing` is not a separate RNG surface; it is the deterministic fallback when trial opportunity and encounter rolls fail.
- Anti-abuse is not gameplay RNG and must not be affected by Luck.
- Siege/Argonautics are future systems; they inherit Luck only through combat/trial-like mechanics later.
- Luck Lab is out of scope except for minimal display/readiness hooks.

---

## Task U0 — Align generated DB types after Luck Foundation DB migrations

**Goal:** Synchronize frontend generated DB types with the Luck Foundation DB/RPC contract.

**Scope:**

- Regenerate/update generated Supabase database types.
- Fix compile errors caused by new/changed Luck Foundation RPCs, formula targets, metadata rows or read models.
- Confirm generated types include the new/updated contracts for:
  - Luck/RNG surface read model;
  - `trial_power`;
  - Luck-aware trial opportunity;
  - Luck-aware trial manifestation;
  - Luck-aware auto-resolve;
  - Luck-aware encounter fallback;
  - Luck-aware combat RNG surfaces;
  - Luck-aware drop/reward read or preview contracts where exposed.
- Do not edit generated DB types manually.
- Do not add frontend fallback formulas.

**Acceptance criteria:**

- Generated types match the current schema/RPC signatures.
- Frontend compiles against regenerated types.
- No manual edits to generated DB types exist.
- Missing DB/RPC contracts are reported as blockers, not replaced with Angular logic.

**Status note 2026-05-09:** Accepted verification-only. Current generated types already exposed the Luck Foundation RPC/contracts needed for U0, including Trial Power, Luck preview and combat/drop/reward preview surfaces. Codex did not edit `database.types.ts` or add Angular fallback formulas.

---

## Task U1 — Luck domain models and mappers

**Goal:** Add typed frontend domain models for Luck Foundation read data.

**Scope:**

- Add domain/read models for:
  - Luck RNG surface;
  - Luck influence config/read state;
  - Trial Power preview/read result;
  - Luck-aware chance preview/result;
  - Luck-excluded flag/state where DB exposes it;
  - RNG surface category;
  - RNG surface formula/config status.
- Map DB/RPC payloads into domain-safe models.
- Keep raw generated DB rows out of components.
- Preserve labels/descriptions/helper/admin text from DB metadata.
- Do not invent permanent category names if DB exposes them.

**Acceptance criteria:**

- Components/services consume typed Luck domain models.
- Mapper distinguishes raw `luckValue`, `luckInfluence`, and `trialPower`.
- Mapper handles nullable/missing preview values safely.
- Build and focused mapper tests pass.

**Status note 2026-05-09:** Accepted. Added Luck domain/read models, generated RPC row aliases and mapper coverage for surfaces, Trial Power, chance previews, reward/drop previews and combat preview output while preserving DB labels/descriptions/helper text and formula metadata.

---

## Task U2 — Luck RNG surface read service

**Goal:** Add a service layer for reading Luck-related RNG surfaces from DB/RPC/metadata.

**Scope:**

- Load the DB-owned list of RNG surfaces affected by Luck.
- Expose categories such as:
  - exploration;
  - trial;
  - auto-resolve;
  - combat;
  - drops;
  - rewards, if applicable.
- Show whether each surface is:
  - Luck-aware;
  - Luck-excluded;
  - formula/config-owned;
  - fallback/ad hoc, if DB reports that state;
  - missing required config, if DB reports that state.
- Do not compute these classifications locally unless DB explicitly returns enough metadata.

**Acceptance criteria:**

- Admin/front-end read layer can list Luck-relevant RNG surfaces.
- Luck-excluded is represented only where DB exposes it.
- Unknown/missing state is explicit.
- No direct table mutation is introduced.

**Status note 2026-05-09:** Accepted. Added `LuckRngSurfaces` over canonical `get_luck_lab_preview_contracts()` via `Backend.rpc(...)`, reusing U1 read models/mappers and grouping by DB-returned category keys without local registry/classification fallback.

---

## Task U3 — Trial Power read/preview integration

**Goal:** Wire DB-owned `trial_power` into frontend domain/read surfaces.

**Scope:**

- Add service/read helpers for `trial_power` preview where DB exposes it.
- Display/represent:
  - tested stat key/value;
  - raw Luck value;
  - Luck influence;
  - final Trial Power.
- Use DB-backed stat labels where available.
- Do not include difficulty or district as part of Trial Power.
- If DB returns formula explanation, preserve it for admin/explainability views.

**Acceptance criteria:**

- Frontend can show `testedStatValue + luckInfluence = trialPower`.
- Raw Luck and Luck influence are not confused.
- Difficulty/district are not shown as Trial Power ingredients.
- No Angular hardcoded Trial Power formula exists.

**Status note 2026-05-09:** Accepted. Added `LuckTrialPower` over `get_hero_trial_power(...)` and `preview_luck_influence_and_trial_power(...)`, preserving tested stat value, raw Luck, Luck influence, final Trial Power and DB formula explanation; stat labels are presentation-only enrichment.

---

## Task U4 — Exploration RNG read-state alignment

**Goal:** Align exploration step outcome read models with Luck-aware DB results.

**Scope:**

- Update exploration result/read models to preserve DB-returned:
  - trial opportunity chance;
  - trial opportunity roll;
  - encounter chance;
  - encounter roll;
  - final outcome.
- Ensure `nothing` is represented as fallback outcome, not independent RNG roll.
- If DB exposes Luck contribution/explanation, preserve it in diagnostic/admin-friendly fields.
- Player UI should remain readable and not expose noisy math by default.

**Acceptance criteria:**

- Exploration read model reflects trial opportunity → encounter → nothing sequence.
- Luck-aware values from DB are preserved.
- Player-facing view does not imply `nothing` was separately rolled.
- Build and focused exploration mapper/service tests pass.

**Status note 2026-05-09:** Accepted after cleanup. Exploration RNG read state preserves DB-returned trial opportunity chance/roll, encounter chance/roll, Luck/context/formula/explanation metadata and final outcome. Roll-level `outcomeKind` was removed; only `finalOutcomeKind` remains, and canonical `nothing` is the only fallback outcome.

---

## Task U5 — Trial manifestation read-state alignment

**Goal:** Align trial manifestation read models with Luck-aware DB results.

**Scope:**

- Preserve DB-returned manifestation chance, roll and result where exposed.
- Preserve Luck influence/explanation where exposed.
- Keep manifestation distinct from trial opportunity.
- Surface misconfigured/no-manifestation states as DB/config issues where applicable.

**Acceptance criteria:**

- Trial opportunity and manifestation remain distinct in domain models.
- Luck-aware manifestation values are available for admin/explainability.
- Player-facing UI remains concise.
- No frontend manifestation formula is added.

**Status note 2026-05-09:** Accepted after cleanup. Challenge attempts now expose nested Trial Manifestation read-state populated by both runtime row and JSON mappers. It preserves DB-returned manifestation chance/roll/status, Luck value/influence, Trial Power, formula context, explanation and config issue metadata while keeping Trial Manifestation separate from Trial Opportunity RNG and without adding Angular manifestation formulas.

---

## Task U6 — Challenge auto-resolve Luck integration

**Goal:** Align challenge auto-resolve UI/services with DB-owned Luck-aware auto-resolve.

**Scope:**

- Update auto-resolve read/action service to use DB/RPC result fields for:
  - success chance;
  - tested stat;
  - Luck influence;
  - Trial Power;
  - difficulty/cap/explanation where exposed.
- Remove or quarantine any frontend fallback auto-resolve chance logic if present.
- Preserve binary success/failure result.
- Do not add partial-success behavior.

**Acceptance criteria:**

- Auto-resolve display comes from DB/RPC output.
- Luck influence and Trial Power are not computed in Angular.
- Auto-resolve remains binary success/failure.
- Build and focused challenge/auto-resolve tests pass.

**Status note 2026-05-09:** Accepted after cleanup. Challenge attempts now expose nested Challenge Auto-resolve read-state populated by runtime row/JSON mappers from DB-returned chance/roll and DB metadata for tested stat, Luck value/influence, Trial Power, cap/penalty/manual reference, formula context and explanation. Non-combat auto-resolve UI uses DB-owned explanation/facts; combat challenges stay on the live-combat/manual boundary, hide auto-resolve Luck facts and reject auto-resolve before the RPC.

---

## Task U7 — Combat RNG Luck alignment

**Goal:** Align frontend combat/domain models with DB-owned Luck-aware combat RNG.

**Scope:**

- Update combat read models/mappers to preserve:
  - hit chance / green-zone output where exposed;
  - evasion chance;
  - critical chance;
  - critical damage;
  - Luck contribution/explanation where DB exposes it.
- Reuse existing combat formula/read paths where they exist.
- Do not create duplicate formula target names in Angular.
- Do not hardcode Luck impact on hit/evasion/crit/critical damage.

**Acceptance criteria:**

- Combat read models can show Luck-aware RNG values where DB exposes them.
- Existing combat formula targets are reused rather than duplicated in frontend code.
- Luck impact is displayed as DB/formula output, not Angular calculation.
- Combat remains symmetric: damager dexterity vs target agility for hit/evasion-related logic.

**Status note 2026-05-09:** Accepted after cleanup. Live combat timing manifests now expose nested DB-owned combat Luck RNG read-state for Luck values/influence, hit green zone/chance, evasion, critical, critical multiplier/damage/final damage, formula context and explanation where DB returns it. Combat action semantics did not change: `submit_combat_player_action(...)` remains timing-input-only and Angular still does not calculate damage, outcome, equipment, stats, Luck formulas or combat RNG formulas. The combat live mapper was split into focused RPC args, state, timing manifest, Luck RNG, participant, event and result-detail mappers; `combat-live-mappers.ts` remains a thin import-compatible facade. Broad fallback aliases were removed from combat participant/event/Luck parsing, leaving only explicit camel/snake DB contract keys.

---

## Task U8 — Drop generator Luck alignment

**Goal:** Align item-generation preview/read surfaces with Luck Foundation without changing the bucket philosophy.

**Scope:**

- Preserve current item generation model:
  - value bucket;
  - quality;
  - base item;
  - prefix;
  - suffix;
  - optional upgrade/spare-budget pass.
- Ensure UI/read models can show DB-returned Luck inputs and roll breakdown.
- Do not add rarity flags or rare-combination logic.
- Ensure one-roll previews do not claim Luck guarantees better single outcomes.
- Where DB exposes distribution preview/simulation, map it for future Luck Lab reuse.

**Acceptance criteria:**

- Item generation preview still follows current bucket/value model.
- Prefix/suffix rarity is not represented as a separate flag.
- Luck is shown as influencing bucket/quality/prefix/suffix opportunity, not guaranteeing a specific item.
- No item generation rewrite is introduced.

**Status:** accepted/done. Manual smoke pending for Exploration Lab generated item preview.

**Implementation note 2026-05-09:** U8 accepted after cleanup. Exploration Lab generated item preview now calls DB-owned `preview_reward_generated_item_luck(...)` with `p_luck_value`, maps DB-returned bucket/value/quality/base/prefix/suffix/budget/Luck breakdown into the Luck preview read model and formats the admin table for readable quality/affix roll display. The UI copy states that Luck can affect bucket, quality, prefix and suffix opportunity, but a single preview does not guarantee a better item. No rarity/rare-combination flags, local item/drop/Luck formulas, direct writes, DB/RPC/generated changes or item-generation rewrite were added. The old non-Luck generated-item args helper was removed from the frontend mapper while leaving the central `preview_reward_generated_item` RPC constant/type contract intact.

---

## Task U9 — Reward range Luck option alignment

**Goal:** Align reward amount range UI/read models with Luck Foundation where DB exposes Luck-aware reward range behavior.

**Scope:**

- Inspect reward profile/entry read models for random amount ranges.
- If DB exposes an “include Luck” / Luck-aware reward-range flag or equivalent, map and display it.
- Keep reward profiles as the reward authority.
- Do not invent new reward calculation in Angular.
- Do not make reward range Luck behavior a blocker if DB explicitly leaves it unsupported.

**Acceptance criteria:**

- Reward amount ranges remain reward-profile owned.
- Any DB-exposed Luck-aware toggle/state is visible in admin read/edit surfaces where appropriate.
- No local reward RNG formula is added.
- Missing DB support is reported clearly if needed.

**Status:** accepted/done. Manual smoke pending for Exploration Lab and Reward Profiles reward-profile preview surfaces.

**Implementation note 2026-05-09:** U9 accepted after stale-state and fixture cleanup. Reward profile previews now use DB-owned `preview_reward_profile_luck(...)` with preview count, Spirituality and Luck inputs in both Exploration Lab and Reward Profiles admin surfaces. The read model and mapper preserve DB-returned reward range output, Luck value/influence, Luck policy JSON, formula context, generated item preview JSON and explanation without adding Angular-side reward RNG, amount-range or Luck formulas. Preview rows are cleared when the selected reward profile changes and at the start of a preview request, while stale async response guards remain in place. Test fixtures now match the generated non-null DB contract instead of bypassing it with `null as never`. No DB/RPC/generated changes, direct writes or local reward authority were added.

---

## Task U10 — Luck metadata and admin readability

**Goal:** Make Luck Foundation readable in existing admin/balance surfaces without building full Luck Lab.

**Scope:**

- Show DB-backed metadata/explanations for Luck-related surfaces where available.
- Integrate Luck surface labels/descriptions into existing admin/balance/formula views.
- Show `trial_power` and `luckInfluence` meanings clearly.
- Mark fallback/ad hoc surfaces if DB reports them.
- Do not add slider-heavy visualization or distribution lab in this task.

**Acceptance criteria:**

- Admin can understand what Luck affects at a high level.
- `trial_power` is explained as tested stat plus Luck influence.
- Luck surfaces are readable without raw-only keys.
- This task does not become Luck Lab.

**Status:** accepted/done with follow-up. Manual smoke pending for Exploration Lab Luck surface registry and chance preview readability.

**Implementation note 2026-05-09:** U10 accepted with follow-up. Existing Exploration Lab now includes a read-only Luck surface registry backed by `LuckRngSurfaces` / `get_luck_lab_preview_contracts()`, showing DB-returned surface label, description, helper text, RPC signature, metadata and status flags such as Luck-aware, formula-owned, config-owned, fallback/ad hoc and missing config. Trial opportunity, trial manifestation and challenge auto-resolve preview models now preserve DB-returned `luckInfluence`, `trialPower`, `formulaKey` and formula expression, and the chance tables show Luck influence, Trial Power and formula keys without adding local Luck/chance/reward/item formulas or direct writes. The touched chance template was cleaned up to use Reactive Forms with PrimeNG components, no `ngModel` / `FormsModule`, no `<button pButton>` and no native `<label>` wrappers around PrimeNG controls. Follow-up: `ExplorationLabPageState` is a real split candidate at 358 lines; if another Luck/chance/reward/simulation feature lands there, extract responsibilities instead of growing one broad state class.

---

## Task U11 — Formula admin integration for Luck targets

**Goal:** Ensure existing formula admin surfaces can inspect/edit Luck Foundation formula targets.

**Scope:**

- Make `trial_power`, Luck influence target/helper and Luck-aware combat/trial/drop formula targets visible through existing formula admin patterns.
- Use existing formula target/assignment/read/edit services.
- Do not build a separate formula editor.
- Preserve target-defined variables and variable help metadata.
- Ensure variable labels distinguish:
  - `luckValue`;
  - `luckInfluence`;
  - `testedStatValue`;
  - `trialPower`.

**Acceptance criteria:**

- Luck-related formula targets are visible and editable where existing formula governance allows it.
- Variable help prevents confusing raw Luck with Luck influence.
- Formula target UI does not reintroduce ambiguous bare `level`-style variable naming.
- Build and focused formula admin tests pass.

**Implementation note 2026-05-09:** U11 accepted after DB/data blocker resolution and user manual smoke. Existing formula admin surfaces now expose Luck Foundation formula targets through the current formula governance/read/edit patterns rather than a separate formula editor. `/admin/formulas` includes a focused Luck Foundation target section, metadata-first variable help, and clear labels for raw Luck (`luck` / `luckValue`), `luckInfluence`, `testedStatValue` and `trialPower`. The formula impact/tester flow no longer calls form-control getter methods from templates, and the tester target selection prefers the assigned formula target or an exact variable-compatible target instead of retaining an unrelated target. Migrator fixed the live data blocker by aligning `balance_formula_targets.key = trial_manifestation_chance` to `scope_key = exploration`; the target already existed, kept the expected allowed variables/default context, and remained assigned to `Default trial manifestation chance`. User smoke passed for `/admin/formulas -> Default trial manifestation chance`: tester target resolves to `Trial manifestation chance` / `trial_manifestation_chance`, no false `Unknown variable: capPercent` appears, and raw `luck` displays as `Luck value (luck)` distinct from `luckInfluence`. No DB/RPC/generated type changes or frontend Luck/gameplay formulas were added by Codex.

---

## Task U12 — Player-facing Luck explanation pass

**Status 2026-05-10:** Cancelled direction; cleanup accepted, manual smoke pending.

**Product/design correction:** Player-facing Exploration must not show explicit counterfactual Luck-impact messages or DB Luck explanations for hidden/indirect Luck influence. U12 implementation was reverted rather than replaced with alternative player-facing Luck copy.

**Accepted cleanup:**

- Removed cancelled player-facing Luck copy.
- Removed `Luck:` / DB Luck explanation from Exploration timing labels.
- Removed auto-resolve technical Luck/Trial Power/cap facts from player-facing challenge facts.
- Extracted touched challenge/live-combat helper code out of state files.
- No DB/RPC/generated/status behavior was changed.

**Manual smoke:** pending for `/game/exploration` active challenge and live combat rendering/operation without player-facing Luck copy.

---

## Task U13 — Luck Foundation cleanup and integration pass

**Goal:** Remove stale frontend fallback assumptions and align touched systems with DB-owned Luck Foundation.

**Scope:**

- Search touched exploration/trial/combat/item/reward frontend code for hardcoded Luck multipliers or fallback chance formulas.
- Replace with DB/RPC/formula outputs where contracts exist.
- If a fallback remains necessary because DB does not expose a contract, report it explicitly as a DB dependency.
- Confirm no unrelated systems were pulled into Luck Foundation.
- Keep Luck Lab out of scope.

**Acceptance criteria:**

- No new hardcoded Luck constants are introduced.
- Known old fallback formulas are removed or explicitly isolated with blocker notes.
- Luck Foundation surfaces consistently use DB/RPC/formula-owned values.
- Build and focused integration tests pass.

**Status:** accepted/done with follow-up. Manual smoke pending representative generated-opponent data.

**Implementation note 2026-05-10:** U13 removed stale local item-generation/Luck RNG fallback paths from the frontend: the old item generator panel/service/factories/rule types were deleted, Armory no longer renders the local generated-item demo panel, and `item-generation-rules.ts` is limited to name composition. Generated PvE opponent equipment no longer uses Angular-side item/Luck/affix RNG and no preview RPC is used as runtime authority. After Migrator added the DB-owned runtime contract, `CombatOpponentResolver` now delegates generated opponent equipment to `build_opponent_combatant_snapshot_for_resolver(...)`, using generated RPC args/returns and focused snapshot mapper helpers. JSON readers and opponent combatant snapshot mapping live in `core/utils` with specs; the resolver stays orchestration-only. No status docs were changed before acceptance, and no Codex edit was made to generated database types.

**Follow-up:** When representative generated opponent equipment data exists, smoke the generated PvE opponent path end-to-end and confirm combat attack source component refs render correctly in result/report paths.

---

## Task U14 — Luck Foundation status/reporting handoff

**Goal:** Produce the final implementation report and DB follow-up list for Luck Foundation.

**Scope:**

- Summarize which Luck surfaces are wired.
- List remaining DB/config gaps if any.
- List Luck Lab dependencies discovered during U tasks.
- List any formula target / metadata / generated type blockers.
- Do not update status docs before user confirmation.

**Acceptance criteria:**

- Report clearly maps Epic U scope to implemented surfaces.
- Remaining Luck Lab work is separated from Luck Foundation blockers.
- DB cleanup/follow-up candidates are concrete.
- User can decide whether to accept Epic U and move to Luck Lab.

---

## Deferred to Epic V — Luck Lab

Luck Lab should be a separate full epic after Luck Foundation.

Expected Luck Lab scope:

- `luckValue` slider;
- `testedStatValue` slider;
- difficulty selector;
- district selector;
- `luckInfluence` preview;
- `trial_power` preview;
- trial opportunity preview;
- trial manifestation preview;
- auto-resolve preview;
- encounter fallback preview;
- combat hit/evasion/critical/critical damage preview;
- drop single-roll preview;
- drop distribution simulation;
- Luck 0 vs Luck X comparisons;
- human-readable explanations of what changed.

Luck Lab is required for real balancing, because Luck cannot be meaningfully validated by a few manual exploration clicks.

---

# Epic V — Luck Lab

Epic V implements the admin/balancer-facing **Luck Lab** after Epic U / Luck Foundation DB-RPC contracts are available.

Luck Lab is a visual balancing and explainability tool. It exists because Luck cannot be meaningfully validated by a few manual exploration clicks.

Luck Lab should let an admin/balancer understand how raw Luck changes:

- Luck influence;
- Trial Power;
- trial opportunity;
- trial manifestation;
- challenge auto-resolve;
- exploration encounter fallback;
- combat hit/evasion/critical/critical damage;
- item drop bucket/quality/prefix/suffix outcomes;
- distribution over many rolls, not only one roll.

Epic V is not:

- Luck Foundation;
- a replacement for DB formulas;
- a player-facing feature;
- a new item generation system;
- a new combat system;
- a new trial/minigame system;
- a config governance rewrite;
- an admin information architecture refactor;
- a local Angular formula simulator used as authority.

**Current DB/RPC foundation expected before Codex starts Epic V tasks:**

- Epic U / Luck Foundation is accepted or at least DB/RPC contracts are available;
- generated `database.types.ts` includes Luck Foundation read/preview/simulation RPCs;
- DB exposes read/preview contracts for:
  - Luck influence;
  - Trial Power;
  - trial opportunity;
  - trial manifestation;
  - challenge auto-resolve;
  - exploration encounter fallback;
  - combat RNG previews;
  - item generation single roll and/or distribution simulation;
- DB exposes labels/descriptions/helper text for Luck-related formula targets and RNG surfaces;
- existing formula governance/admin read models can inspect Luck-related formula targets;
- item generation preview/simulation remains DB-owned.

If a required DB/RPC contract is missing, Codex must report a DB dependency instead of implementing a local authoritative formula simulator in Angular.

**Epic rules:**

- Luck Lab displays DB/RPC/formula outputs.
- Luck Lab must not become gameplay authority.
- Angular must not hardcode Luck multipliers, caps, curves, or final formulas.
- Angular may format values, calculate simple UI-only comparisons from already-returned values, and render charts/tables.
- Any simulation of actual game rolls must come from DB/RPC or an explicitly non-authoritative preview endpoint.
- Luck Lab must separate:
  - raw `luckValue`;
  - `luckInfluence`;
  - `trialPower`;
  - difficulty/district caps;
  - final displayed chance.
- Luck Lab must make clear that a single roll does not prove Luck works or does not work.
- Drop preview must preserve the bucket/value philosophy: no rarity flags, no rare-combination model.
- Use existing admin/balance/formula UI patterns and services where possible.
- Do not reorganize the whole admin panel in this epic.
- Do not implement Maze, Harpy shooting, or other minigames in this epic.

---

## Task V0 — Align generated DB types after Luck Lab contracts

**Goal:** Synchronize frontend generated DB types with Luck Lab preview/simulation RPCs.

**Scope:**

- Regenerate/update Supabase database types after Luck Lab DB/RPC contracts exist.
- Confirm generated types include available preview/simulation contracts for:
  - Luck influence;
  - Trial Power;
  - trial opportunity;
  - trial manifestation;
  - auto-resolve;
  - encounter fallback;
  - combat RNG;
  - drop single-roll preview;
  - drop distribution simulation.
- Fix compile issues caused by new/changed signatures.
- Do not edit generated DB types manually.
- Do not add local fallback formula logic.

**Acceptance criteria:**

- Generated types match current DB/RPC signatures.
- Frontend compiles against regenerated types.
- Missing preview/simulation contracts are reported as DB dependencies.

**Status:** Accepted on 2026-05-10. Current generated types compile against the available Luck Lab preview contracts; dedicated drop-distribution simulation remains a DB dependency for later V distribution work.

---

## Task V1 — Luck Lab domain models and mappers

**Goal:** Add typed frontend models for Luck Lab inputs, previews, comparisons and distributions.

**Scope:**

- Add domain/read models for:
  - Luck Lab input state;
  - Luck preview result;
  - Luck influence;
  - Trial Power preview;
  - chance preview;
  - combat RNG preview;
  - drop single-roll preview;
  - drop distribution summary;
  - comparison row;
  - explanation row.
- Map DB/RPC payloads into domain models.
- Preserve labels, descriptions and helper text from DB metadata.
- Keep raw generated rows out of components.

**Acceptance criteria:**

- Luck Lab UI consumes typed domain models.
- Raw Luck, Luck influence and Trial Power are distinct in models.
- Mapper handles missing/unsupported preview sections safely.
- Build and focused mapper tests pass.

**Status:** Accepted on 2026-05-10. Added typed Luck Lab input/result, Luck influence, Trial Power, chance/combat/reward/generated-item, comparison, explanation and unsupported drop-distribution models and mappers. Generated item preview uses nullable `prefixAffix` / `suffixAffix` objects for optional affixes and normalizes absent affix data to `null`. Later UI tasks must not display `luck_influence` comparison rows as ordinary gain/loss because raw Luck and formula-derived Luck influence are different units.

---

## Task V2 — Luck Lab service and state

**Goal:** Add a state/service layer for running Luck Lab previews.

**Scope:**

- Create service methods for available DB/RPC previews:
  - Trial Power preview;
  - trial opportunity preview;
  - manifestation preview;
  - auto-resolve preview;
  - encounter fallback preview;
  - combat RNG preview;
  - drop preview/distribution.
- Add signal-based state for:
  - `luckValue`;
  - `testedStatValue`;
  - difficulty;
  - district;
  - selected trial/minigame where supported;
  - selected combat profile where supported;
  - selected drop profile where supported.
- Debounce slider-driven requests where needed.
- Guard stale async responses.
- Do not compute authoritative formulas locally.

**Acceptance criteria:**

- Slider changes trigger safe preview reloads without stale overwrites.
- Loading/error states are section-specific.
- Missing DB preview contracts are represented clearly.
- No hardcoded Luck formulas are added.

**Status:** Accepted on 2026-05-10. Added reusable `LuckLabPreviews`, `LuckLabState` and Luck Lab RPC args mapping over DB/RPC preview contracts. State exposes signal inputs, debounced reloads, stale-response guards and section-specific loading/error/result patching so partial failures do not poison all sections. Drop distribution remains explicit `unsupported` until DB exposes a dedicated simulation contract. `selectedCombatProfileKey` is intentionally future input only because current combat preview RPC does not consume it. Later V3/V14 UI should render per-section loading/error clearly because section patching may temporarily retain older section data while reloading.

---

## Task V3 — Luck Lab admin route and shell

**Goal:** Add the main admin/balancer Luck Lab page.

**Scope:**

- Add an admin route/page for Luck Lab in the appropriate admin/balance area.
- Use existing admin layout/page-header/card/section patterns.
- Show concise page explanation:
  - Luck is global RNG/opportunity stat;
  - this page previews DB-owned formulas;
  - values are balancing previews, not player-facing promises.
- Add shared input controls:
  - Luck slider;
  - tested stat slider;
  - difficulty selector;
  - district selector;
  - optional trial selector if DB supports it.
- Keep page component thin.

**Acceptance criteria:**

- Admin can open Luck Lab route.
- Core controls are visible and usable.
- Page does not imply it changes config directly.
- Build and route smoke pass where Codex can run route smoke.

**Status:** Accepted on 2026-05-10 with follow-up. Added `/admin/luck-lab`, dashboard/navigation entry, thin page and page state with shared Luck/tested-stat sliders plus DB-backed difficulty/district/stat/trial selectors reused from existing exploration definitions. The shell copy states that previews are DB-owned balancing outputs and not config mutation or player-facing promises. No generated types, direct writes, local RNG/formula/drop simulation or status-independent gameplay authority were added. Verification passed with focused route/page/page-state and Luck Lab service-state specs, `npx tsc --noEmit`, `npm run build` with known warnings, static greps and prerender route output for `/admin/luck-lab`. Follow-up for V4+: render real preview panels with section-specific loading/error and freshness clarity; align form defaults with `DEFAULT_LUCK_LAB_INPUT` on the next Luck Lab form touch.

---

## Task V4 — Trial Power preview panel

**Goal:** Show how raw Luck contributes to Trial Power.

**Scope:**

- Display:
  - tested stat value;
  - raw Luck value;
  - Luck influence;
  - final Trial Power.
- Show a readable equation-like summary:
  - `testedStatValue + luckInfluence = trialPower`.
- Show DB/formula explanation where available.
- Show comparison rows such as:
  - current sliders;
  - Luck 0 with same stat;
  - same Luck with higher/lower tested stat where useful.
- Do not include difficulty/district as Trial Power ingredients.

**Acceptance criteria:**

- Admin can see the difference between raw Luck and Luck influence.
- Trial Power is clear and not confused with raw stat.
- Difficulty/district are visually separated from Trial Power.
- Values come from DB/RPC preview.

**Status:** Accepted on 2026-05-10. Added a dedicated Luck Lab Trial Power panel that displays tested stat, raw Luck, Luck influence, final Trial Power, equation-style summary, DB formula keys/expressions, explanation and DB-backed comparison rows through `LuckLabPreviews.previewTrialPower(...)`. Difficulty and district are shown as later chance-panel context rather than Trial Power ingredients. No local formula/RNG/drop simulation, direct writes, generated type edits or status-independent gameplay authority were added. Form defaults now reuse `DEFAULT_LUCK_LAB_INPUT`. Verification passed with focused Luck Lab route/page/page-state/service-state specs, `npx tsc --noEmit`, `npm run build` with known warnings, static greps and prerender route output for `/admin/luck-lab`. Follow-up: V11 should not duplicate or drift from the Trial Power comparison presets, and V14 should re-check performance/stale behavior for the extra Trial Power preview calls.

---

## Task V5 — Trial opportunity and manifestation preview panel

**Goal:** Show how Luck affects reaching and manifesting trials.

**Scope:**

- Display trial opportunity chance from DB/RPC preview.
- Display trial manifestation chance from DB/RPC preview.
- Display expected/average steps where DB exposes it.
- Show the selected difficulty/district context where applicable.
- Show comparison:
  - Luck 0;
  - current Luck;
  - optional high Luck sample.
- Explain that Luck improves chances but does not guarantee trial appearance or manifestation.
- Do not repeat full trial flow text unnecessarily.

**Acceptance criteria:**

- Opportunity and manifestation are separate.
- Admin can see how Luck shifts chances.
- Expected step changes are visible if DB exposes them.
- No local chance formulas are introduced.

**Status:** Accepted on 2026-05-10. Added a dedicated Trial chances panel that separates Trial opportunity from Trial manifestation, renders DB/RPC chance previews with percent units, DB formula keys/explanations, selected difficulty/district context and DB-backed trial label/key as the primary trial context value with raw id only as secondary metadata. Added Luck 0/current/high comparison rows for opportunity and manifestation through DB/RPC preview calls; expected step/step-cap values are shown when returned in DB context. Comparison orchestration now lives in feature-local `LuckLabComparisonState`, keeping `LuckLabPageState` focused on shared form/input composition and definition labels. No local chance formulas, RNG/drop simulation, direct writes, generated type edits or gameplay authority were added. Verification passed with focused Luck Lab route/page/page-state/service-state specs, `npx tsc --noEmit`, `npm run build` with known warnings, static greps and prerender route output for `/admin/luck-lab`. Manual smoke remains pending for `/admin/luck-lab` input changes and separate opportunity/manifestation comparison refresh.

---

## Task V6 — Auto-resolve preview panel

**Goal:** Show how Luck and Trial Power affect challenge auto-resolve.

**Scope:**

- Display DB-owned auto-resolve chance.
- Display:
  - tested stat;
  - Luck influence;
  - Trial Power;
  - difficulty/district cap where exposed;
  - final auto-resolve chance.
- Show binary success/failure framing.
- Explain that auto-resolve is intended to be less favorable than good manual play.
- Support selected trial/minigame where DB exposes it.

**Acceptance criteria:**

- Admin can inspect auto-resolve odds for selected inputs.
- Luck contribution is visible.
- Caps/multipliers are shown where available.
- No partial-success UI is introduced.

**Status:** Accepted on 2026-05-10. Added a dedicated Auto-resolve panel that displays DB-owned binary success/failure chance, tested stat, Luck influence, Trial Power, raw chance, cap, difficulty multiplier and manual chance reference. Added Luck 0/current/high comparison rows through `LuckLabPreviews.previewChallengeAutoResolve(...)`, keeping all values DB/RPC-owned and avoiding local auto-resolve formulas, RNG/drop simulation, direct writes, generated type edits or partial-success UI. The panel explicitly marks selected trial/minigame context as not consumed by the current auto-resolve RPC. Verification passed with focused Luck Lab route/page/page-state/service-state specs, `npx tsc --noEmit`, `npm run build` with known warnings, static greps and prerender route output for `/admin/luck-lab`. Follow-up: keep `LuckLabComparisonState` from becoming a monolith if later V panels add heavier preset orchestration.

---

## Task V7 — Exploration encounter fallback preview panel

**Goal:** Show how Luck affects encounter chance after no trial opportunity occurs.

**Scope:**

- Display DB-owned encounter fallback chance.
- Show base chance and Luck-influenced chance if DB exposes both.
- Make clear that `nothing` is deterministic fallback after failed trial and encounter rolls.
- Show comparison across Luck values.
- Keep resource event as encounter subtype; do not create separate resource-event RNG model in UI unless DB exposes one.

**Acceptance criteria:**

- Encounter fallback is understandable.
- `nothing` is not shown as independent RNG roll.
- Luck impact on encounter chance is visible.
- No client-side encounter chance formula exists.

**Status:** Accepted on 2026-05-10. Added a dedicated Encounter fallback panel that displays DB-owned non-trial encounter chance, base/raw/final/cap breakdown, Luck value/influence and Luck 0/current/high comparison rows through `LuckLabPreviews.previewNonTrialEncounter(...)`. The panel explains that `nothing` is the deterministic fallback after failed trial opportunity and encounter rolls, not a separate RNG roll. Resource events remain an encounter subtype with no separate resource-event RNG model. No local encounter formula/RNG/drop simulation, direct writes, generated type edits or gameplay authority were added. Verification passed with focused Luck Lab page/page-state/service-state/route specs, `npx tsc --noEmit`, `npm run build` with known warnings, static greps and prerender route output for `/admin/luck-lab`.

---

## Task V8 — Combat RNG preview panel

**Goal:** Show how Luck affects combat RNG surfaces.

**Scope:**

- Display preview rows for:
  - hit chance;
  - evasion chance;
  - critical chance;
  - critical damage.
- Use DB/RPC/formula preview results.
- Show relevant input stats where DB exposes them:
  - damager dexterity;
  - target agility;
  - Luck;
  - Luck influence/contribution;
  - final chance/result.
- Preserve combat symmetry: each side can be modeled as damager vs target.
- If initiative has Luck influence and DB exposes it, show it as optional/additional row.
- Do not build a new combat simulator.

**Acceptance criteria:**

- Combat RNG preview shows Luck impact clearly.
- Hit/evasion/crit/critical damage are distinct.
- Existing DB formula target labels are used.
- No duplicate frontend formula target naming is introduced.

**Status:** Accepted on 2026-05-10. Added a dedicated Combat RNG panel over DB-owned `previewCombat`, showing hit chance, evasion chance, critical chance, DB-returned critical multiplier, final damage and optional initiative with Luck 0/current/high comparison rows. Combat-specific row mapping, formatting and comparison accessors live in section-local state rather than `LuckLabPageState`. The local `formulasJson` compatibility parser was removed; formula target keys are shown only as metadata, and missing stable combat formula labels / separate critical multiplier target are tracked as a DB metadata gap. No combat simulator, local formula/RNG/drop simulation, direct writes, generated type edits or gameplay authority were added. Verification passed with focused Luck Lab page/page-state/combat-section-state/service-state specs, `npx tsc --noEmit`, `npm run build` with known warnings, static greps and prerender route output for `/admin/luck-lab`. Follow-up for V14/performance: narrow `LuckLabCombatSectionState` comparison reload dependencies if the current combat preview continues to consume only attacker Luck.

---

## Task V9 — Drop single-roll preview panel

**Goal:** Show a single item-generation roll while explaining its limits.

**Scope:**

- Use DB/RPC item generation preview.
- Display:
  - selected Luck;
  - selected bucket profile;
  - rolled bucket;
  - quality;
  - base item;
  - prefix;
  - suffix;
  - final value;
  - spare-budget/upgrade pass result where DB exposes it.
- Explain that one roll does not prove Luck effect.
- Preserve current bucket/value model.
- Do not add rarity flags.

**Acceptance criteria:**

- Single roll preview is readable.
- Roll breakdown matches DB output.
- UI does not imply higher Luck guarantees a better single item.
- No item generation model rewrite is introduced.

**Status:** Accepted on 2026-05-10. Added a dedicated single-roll generated item panel over DB-owned `preview_reward_generated_item_luck(...)`. The generated item preview path forces `p_preview_count = 1`, the UI has no `Preview count` control, and the panel shows selected bucket/max quality context, generated item, rolled bucket, quality, base item, nullable prefix/suffix, final value and budget breakdown while explaining that one roll does not prove Luck effect. `LuckLabState` now separates `rewardProfile` and `generatedItem` loading/error/result patching, and the page shell only shows definitions/shared-shell errors, so hidden reward profile preview failures do not poison the generated item panel or global page error. No rarity flags, item model rewrite, local formula/RNG/drop simulation, direct writes or generated type edits were added. Verification passed with focused Luck Lab page/page-state/generated-item-section/service-state specs, `npx tsc --noEmit`, `npm run build` with known warnings, static greps and prerender route output for `/admin/luck-lab`.

---

## Task V10 — Drop distribution simulation panel

**Goal:** Show distribution-level Luck impact on item generation.

**Scope:**

- Use DB/RPC distribution simulation if available.
- Display summary metrics:
  - roll count;
  - average value;
  - median value if exposed;
  - bucket distribution;
  - quality distribution;
  - prefix hit rate;
  - suffix hit rate;
  - outstanding/high-value rate where DB exposes it.
- Compare Luck 0 vs current Luck.
- Optionally show simple charts/tables using existing chart patterns.
- Do not run heavy simulation in Angular if DB/RPC is expected to do it.

**Acceptance criteria:**

- Admin can see statistical Luck effect on drops.
- Luck 0 vs Luck X comparison is visible.
- Distribution view prevents misleading conclusions from one roll.
- Simulation workload is not implemented as uncontrolled browser loops.

**Status:** Accepted on 2026-05-10. Added a dedicated Drop distribution panel over DB-owned `preview_reward_generated_item_distribution_luck(...)`, with typed generated RPC args/row aliases, a domain summary model and mapper, and `LuckLabPreviews.previewDropDistribution(...)` replacing the former unsupported path when the RPC returns rows. The panel shows roll count, average/median/min/max value, bucket and quality distributions for current Luck and Luck 0 comparison, prefix/suffix hit rates, high-value/outstanding rates, average delta and DB explanation while stating that Angular only renders DB-returned summary rows and does not run browser-side rolls or reconstruct item RNG. Loading/error are scoped to `dropDistribution`. Cleanup reused `createUnsupportedDropDistributionSummary(...)` for no-row fallback, removed unused `prefixRows` / `suffixRows`, and extracted shared bucket/quality option labels for item preview panels. No generated type edits, direct writes, rarity flags, local formula/RNG/drop simulation or durable item/reward mutation were added. Verification passed with focused Luck Lab specs, `npx tsc --noEmit`, `npm run build` with known warnings and static greps. Manual smoke remains pending for `/admin/luck-lab` Luck/bucket/max-quality changes and distribution refresh.

---

## Task V11 — Luck comparison presets

**Goal:** Add quick comparison presets for common Luck values.

**Scope:**

- Add comparison presets:
  - Luck 0;
  - low Luck;
  - medium Luck;
  - high Luck;
  - current slider value.
- Values should come from DB/config where exposed, or be UI-only labels if DB does not define presets.
- Show comparisons across main panels where useful:
  - Trial Power;
  - opportunity;
  - manifestation;
  - auto-resolve;
  - combat RNG;
  - drop distribution.
- Keep comparison UI compact.

**Acceptance criteria:**

- Admin can quickly compare current Luck to known baselines.
- Comparisons use DB/RPC preview values.
- UI remains readable and does not become a huge wall of numbers.

---

## Task V12 — Human-readable Luck explanations

**Goal:** Make Luck Lab understandable without requiring the user to understand formula syntax.

**Scope:**

- Add explanation helpers/components for:
  - raw Luck vs Luck influence;
  - Trial Power;
  - opportunity vs manifestation;
  - auto-resolve vs manual difficulty;
  - single roll vs distribution;
  - combat RNG surfaces.
- Use DB metadata/helper text where available.
- Avoid unexplained Greek-letter constants or raw formula-only presentation.
- Keep raw formula access available through existing formula admin links/diagnostics where appropriate.

**Acceptance criteria:**

- A non-technical balancer can understand what changed.
- Formula details are available but not the only explanation.
- Labels/descriptions come from DB metadata where available.
- No permanent hardcoded gameplay labels replace DB metadata.

---

## Task V13 — Luck Lab formula navigation links

**Goal:** Connect Luck Lab previews to existing formula governance screens.

**Scope:**

- Add links or references from Luck Lab sections to related formula targets where existing routes allow it:
  - `trial_power`;
  - Luck influence;
  - trial opportunity;
  - manifestation;
  - auto-resolve;
  - combat RNG;
  - drop-related formula/config surfaces if exposed.
- Do not implement a new formula editor.
- If formula route/deep-link does not exist, show target key as secondary metadata only.

**Acceptance criteria:**

- Admin can navigate from preview to formula governance where supported.
- Missing deep links do not break the page.
- Luck Lab does not duplicate the formula editor.

---

## Task V14 — Luck Lab performance and stale-response hardening

**Goal:** Ensure slider-heavy previews are safe and responsive.

**Scope:**

- Debounce high-frequency slider inputs.
- Cancel/ignore stale requests.
- Keep section-level loading states.
- Avoid running expensive previews until required inputs are valid.
- Add user feedback for slow simulations.
- Prevent distribution simulation from running on every tiny slider movement unless explicitly requested or debounced safely.

**Acceptance criteria:**

- Fast slider movement does not create stale UI.
- Expensive simulations are controlled.
- Errors stay scoped to the relevant panel.
- Build and focused state tests pass.

---

## Task V15 — Luck Lab final integration report

**Goal:** Produce final Epic V implementation report and remaining balancing notes.

**Scope:**

- Report which panels are implemented.
- Report which DB/RPC preview contracts were used.
- Report which surfaces remain unsupported by DB.
- Report known Luck Lab limitations.
- Report follow-up needs for admin IA/refactor if discovered.
- Do not update status docs before user confirmation.

**Acceptance criteria:**

- Report clearly separates implemented Luck Lab from missing DB contracts.
- Remaining limitations are concrete.
- Luck Foundation vs Luck Lab boundaries remain clear.

---

# Epic W — Exploration Core Completion

Epic W completes the core Exploration runtime so the player-facing loop works end-to-end:

direction → timer → step result → Trial / Encounter / Nothing → resolution or immediate outcome → reward/effect → continue exploration.

After Epic W, new Trials, Encounters and Minigames should be content/modules plugged into a stable runtime, not reasons to redesign the exploration foundation.

## DB/RPC foundation expected before Codex starts W tasks

Migrator must first complete the DB/RPC preflight and any required migrations for:

- Trial readiness / eligibility model.
- Encounter readiness / eligibility model.
- Stable readiness reason codes.
- DB-backed metadata for readiness reason codes.
- Runtime filtering so only complete active Trials and Encounters can be selected.
- Selection/debug payload for step result resolution.
- Reward execution/debug payload for reward and item generation.
- Exploration step timer config audit/fix.
- Sandbox-only helper/RPC access for:
  - adding daily Trial attempts / remaining Trial actions;
  - skipping or finishing the current exploration step timer.
- Minimal complete smoke content:
  - one Combat Trial;
  - one Combat Encounter;
  - one Resource Encounter;
  - one Buff Encounter;
  - one Debuff Encounter;
  - one Trial reward with item generation;
  - one Combat Encounter reward with XP;
  - one Resource Encounter reward with resources;
  - one Buff Encounter effect;
  - one Debuff Encounter effect.

If any DB/RPC contract is missing, Codex must report the DB dependency instead of faking runtime behavior in Angular.

## Epic rules

- Use canonical domain words: Trial, Encounter, Nothing, Combat, Minigame.
- Do not use player-facing “Challenge” wording for the domain, even if DB internals still have attempt/state names.
- Normal runtime may select only complete active Trials and Encounters.
- Misconfigured Trials/Encounters may exist in admin config, but they must not enter normal runtime selection.
- Trial must have reward in normal runtime.
- Encounter must have reward or effect in normal runtime.
- Combat Encounter without reward is not eligible.
- Resource Encounter is reward-only and does not require manual resolve.
- Buff Encounter is complete when it applies a buff effect.
- Debuff Encounter is complete when it applies a debuff effect.
- The only negative exploration outcome currently allowed is a debuff from Debuff Encounter.
- Active unresolved Trial or Encounter blocks the next exploration step.
- If a Trial or Encounter requires resolution, UI must show a working manual resolve or auto-resolve action.
- Auto-resolve-only Trial is allowed only when explicitly configured.
- Tester/admin tools are sandbox-server-only.
- Live servers must not show add-attempt or skip-timer tools.
- Force outcome / force resolve is not part of Epic W.
- Step duration must be DB/config-owned, not hardcoded in Angular.
- Reward/drop path must be tested through real exploration flow, not only the admin item generator.
- Frontend copy for statuses, errors and diagnostics in this slice should be Polish-facing where practical.
- DB-backed metadata/dictionaries should provide stable labels/descriptions for readiness reasons; Angular must not invent a separate permanent translation system.

---

## Task W0 — Align generated DB types after Exploration Core migrations

**Goal:** Synchronize frontend generated DB types with the Exploration Core Completion DB/RPC contract.

**Scope:**

- Regenerate/update generated Supabase database types after W DB/RPC migrations.
- Fix compile errors caused by changed exploration/trial/encounter/reward contracts.
- Confirm generated types include available contracts for:
  - Trial readiness / eligibility;
  - Encounter readiness / eligibility;
  - readiness reason codes / metadata;
  - step selection/debug payload;
  - reward execution/debug payload;
  - sandbox add-action helper;
  - sandbox skip/finish timer helper;
  - exploration step duration config/read model, if exposed.
- Do not edit generated DB types manually.
- Do not add frontend fallback eligibility logic.

**Acceptance criteria:**

- Generated types match the current DB/RPC signatures.
- Frontend compiles against regenerated types.
- Missing DB/RPC contracts are reported as blockers.

---

## Task W1 — Exploration readiness domain models and mappers

**Goal:** Add typed domain models for Trial/Encounter readiness and selection diagnostics.

**Scope:**

- Add models/mappers for:
  - Trial readiness row;
  - Encounter readiness row;
  - readiness status;
  - readiness reason;
  - readiness reason metadata;
  - eligible selected definition;
  - skipped/incomplete selected definition;
  - step selection journal/debug payload.
- Keep UI-facing model names aligned with canonical domain language:
  - Trial;
  - Encounter;
  - Nothing;
  - Combat;
  - Minigame.
- Preserve raw technical ids/keys only as secondary metadata.
- Do not expose raw DB rows directly to components.

**Acceptance criteria:**

- Frontend can represent complete/incomplete Trials and Encounters.
- Reason codes and DB-backed labels/descriptions are preserved.
- Mappers do not invent player-facing “Challenge” terminology.
- Mapper handles missing optional debug payload safely.

---

## Task W2 — Exploration runtime result model cleanup

**Goal:** Align exploration step result models with the completed runtime contract.

**Scope:**

- Ensure step result model represents only:
  - Trial;
  - Encounter;
  - Nothing.
- Represent Nothing as fallback result, not an independent RNG roll.
- Preserve DB-returned selection/debug payload if present.
- Preserve selected Trial/Encounter identity and readiness diagnostics where DB returns them.
- Ensure UI can distinguish:
  - Combat Trial;
  - Combat Encounter;
  - Resource Encounter;
  - Buff Encounter;
  - Debuff Encounter.
- Do not add new runtime selection logic in Angular.

**Acceptance criteria:**

- Step result UI/domain state uses canonical outcome names.
- Resource/Buff/Debuff Encounters do not appear as unresolved minigame-like Trial states.
- Selection diagnostics can be shown in sandbox/tester mode.
- Normal player view remains concise.

---

## Task W3 — Sandbox exploration diagnostics panel

**Goal:** Show useful sandbox-only diagnostics for step selection without dumping noisy full pools by default.

**Scope:**

- Add or update sandbox/tester diagnostics in `/game/exploration`.
- Show:
  - what outcome was selected;
  - why it was selected;
  - when it was selected;
  - if something was skipped due to incomplete config, what was skipped and why;
  - what complete definition was used instead, if applicable;
  - final outcome: Trial / Encounter / Nothing.
- Add expandable raw/debug payload view for deeper inspection.
- Do not show a giant always-visible list of every rejected Trial/Encounter.
- Gate diagnostics to sandbox/tester/admin context.
- Normal players must not see this diagnostic panel.

**Acceptance criteria:**

- Tester can tell whether a result came from RNG or configuration filtering.
- Incomplete selected/skipped definitions show reason codes and readable labels.
- Debug details are expandable/collapsed, not noisy by default.
- No sandbox diagnostics are shown on live servers.

---

## Task W4 — Trial readiness display in admin configurator

**Goal:** Make Trial configuration completeness visible in admin tooling.

**Scope:**

- Add readiness status to existing Trial admin/configurator surfaces.
- Show which Trials are complete and eligible for runtime.
- Show incomplete Trials with reason codes and DB-backed labels/descriptions.
- Highlight missing:
  - inactive definition;
  - unsupported minigame;
  - missing resolver;
  - missing reward assignment;
  - missing combat candidate for combat Trial;
  - no eligible combat candidate due to bounds/config;
  - missing config/metadata where relevant.
- Allow saving incomplete Trial config; do not block admin edits just because the Trial is incomplete.
- Clearly state that incomplete Trials are not selected by normal runtime.

**Acceptance criteria:**

- Admin can see at a glance which Trials are runtime-ready.
- Incomplete Trials are explainable without SQL.
- Readiness display uses DB/RPC readiness model, not Angular-only recomputation.
- Admin can still work on incomplete definitions incrementally.

---

## Task W5 — Encounter readiness display in admin configurator

**Goal:** Make Encounter configuration completeness visible in admin tooling.

**Scope:**

- Add readiness status to existing Encounter admin/configurator surfaces.
- Show which Encounters are complete and eligible for runtime.
- Show incomplete Encounters with reason codes and DB-backed labels/descriptions.
- Handle existing Encounter types:
  - Combat Encounter;
  - Resource Encounter;
  - Buff Encounter;
  - Debuff Encounter.
- Highlight missing:
  - inactive definition;
  - missing combat candidate for Combat Encounter;
  - no eligible combat candidate due to bounds/config;
  - missing resource payload/reward for Resource Encounter;
  - missing effect payload for Buff/Debuff Encounter;
  - missing config/metadata where relevant.
- Allow saving incomplete Encounter config.
- Clearly state that incomplete Encounters are not selected by normal runtime.

**Acceptance criteria:**

- Admin can see at a glance which Encounters are runtime-ready.
- Resource/Buff/Debuff Encounter readiness follows their existing payload/effect model.
- Readiness display uses DB/RPC readiness model.
- Incomplete Encounters are explainable without SQL.

---

## Task W6 — Exploration timer config visibility

**Goal:** Make exploration step duration configuration discoverable and readable.

**Scope:**

- Locate and use DB/RPC/config read paths for:
  - base step duration;
  - difficulty multiplier;
  - step duration multiplier;
  - global/server override if present.
- Show current effective step duration configuration in the relevant admin/balancer area or existing exploration config surface.
- If config is missing from DB/RPC, report exact DB/config dependency.
- Do not hardcode timer values in Angular.
- Do not implement a full admin IA refactor.

**Acceptance criteria:**

- Admin/tester can find where exploration step duration comes from.
- UI explains base duration and multipliers clearly.
- Missing config is reported as a DB/config blocker.
- Player-facing timer continues to use DB-owned runtime values.

---

## Task W7 — Sandbox timer skip / finish workflow

**Goal:** Allow sandbox testers to skip waiting during exploration step testing.

**Scope:**

- Add sandbox-only UI action to skip/finish the current exploration step timer.
- Use canonical DB/RPC helper if it exists.
- If helper is missing, report DB dependency.
- Show current timer normally before/after skip action.
- Refresh step state after successful skip/finish.
- Hide action on live servers.
- Hide action from normal players.

**Acceptance criteria:**

- Tester can start a step, see timer, skip/finish it, and then check result.
- Normal gameplay timer remains intact.
- No frontend direct table mutation is introduced.
- Live server never exposes skip timer control.

---

## Task W8 — Sandbox daily Trial attempts / remaining actions workflow

**Goal:** Allow sandbox testers to add Trial attempts/actions without leaving the exploration screen.

**Scope:**

- Add sandbox-only UI for daily Trial attempts / remaining Trial actions.
- Use existing canonical helper/RPC where possible.
- Show current available Trial count.
- Allow tester to increase count through a simple draft control and confirm.
- Refresh count after successful mutation.
- Hide action on live servers.
- Hide action from normal players.
- Use Polish-facing action labels and feedback.

**Acceptance criteria:**

- Tester can add Trial attempts/actions from the exploration testing context.
- UI shows current and updated value clearly.
- Helper/RPC errors are shown in readable Polish copy.
- No direct table update is introduced.

---

## Task W9 — Exploration Trial/Encounter resolution UI cleanup

**Goal:** Ensure visible Trials and Encounters have the correct resolution/outcome UI.

**Scope:**

- Update `/game/exploration` active state rendering for:
  - Combat Trial;
  - Combat Encounter;
  - Resource Encounter;
  - Buff Encounter;
  - Debuff Encounter;
  - Nothing outcome.
- Show manual resolve where supported.
- Show auto-resolve where configured.
- Do not show resolve buttons for Resource Encounter if it resolves as immediate outcome/reward flow.
- Do not show unresolved “ready” states without a working action.
- Use canonical Trial/Encounter wording in UI.
- Show clear blocker/error when DB reports an impossible state.

**Acceptance criteria:**

- “Trial ready” without action no longer appears in normal gameplay.
- Resource Encounter does not masquerade as a minigame Trial.
- Buff/Debuff Encounter shows applied effect outcome where DB returns it.
- Combat Trial/Encounter can be resolved through the supported action path.

---

## Task W10 — Exploration reward and item drop display hardening

**Goal:** Make reward and item drop results durable, readable and failure-aware.

**Scope:**

- Use DB/RPC reward result payloads for display.
- Show reward grant / reward entries where available.
- If item generation was attempted, show generated item id/display data where available.
- If item generation failed, show reason if DB provides one.
- If reward was configured but not granted, show reason if DB provides one.
- Ensure refresh does not duplicate reward display or regenerate rewards.
- Link or surface the generated item through item/armory read path where available.
- Use Polish-facing success/error/status copy.

**Acceptance criteria:**

- Reward display reflects durable DB state.
- Item drops from exploration are real item rows.
- Missing/failed reward generation is visible and explainable.
- Refresh is safe and does not create duplicate rewards.

---

## Task W11 — Exploration reward execution diagnostics

**Goal:** Expose reward execution debug details for sandbox/admin users.

**Scope:**

- Add sandbox/admin diagnostic display for reward execution payload.
- Show:
  - reward assignment lookup;
  - reward profile used;
  - reward entries processed;
  - item generation attempted;
  - item generation result;
  - skipped entries and reasons where DB returns them;
  - final summary.
- Keep diagnostics collapsed by default.
- Do not show raw JSON as the only UI.
- Normal players should not see full diagnostics.

**Acceptance criteria:**

- Tester can understand why a configured item reward did or did not appear.
- Diagnostics use DB/RPC payload, not frontend guesses.
- Normal player reward UI remains concise.

---

## Task W12 — Minimal exploration smoke content visibility

**Goal:** Ensure the minimal complete content set for exploration smoke is visible and usable from admin/tester surfaces.

**Scope:**

- Surface or confirm the configured minimal content set:
  - one complete Combat Trial;
  - one complete Combat Encounter;
  - one complete Resource Encounter;
  - one complete Buff Encounter;
  - one complete Debuff Encounter;
  - Trial reward with item generation;
  - Combat Encounter XP reward;
  - Resource Encounter resource reward;
  - Buff Encounter buff effect;
  - Debuff Encounter debuff effect.
- If these already exist, do not duplicate them.
- If any are missing or incomplete, show the specific readiness reason.
- Do not seed content from Angular.

**Acceptance criteria:**

- Admin/tester can identify the minimum content needed for full exploration smoke.
- Missing pieces are visible and actionable.
- No duplicate definitions are created by frontend work.

---

## Task W13 — Exploration full loop player/sandbox integration

**Goal:** Tie the completed runtime pieces into one stable player/sandbox exploration loop.

**Scope:**

- Ensure the flow works across:
  - start exploration;
  - direction selection;
  - step timer;
  - skip timer in sandbox;
  - check result;
  - Nothing;
  - Combat Trial;
  - Combat Encounter;
  - Resource Encounter;
  - Buff/Debuff Encounter;
  - reward/effect display;
  - continue exploration.
- Preserve stale guards on selected server/active hero/exploration state.
- Surface errors in Polish.
- Do not hide DB/RPC failures behind generic fallback success.

**Acceptance criteria:**

- Core exploration loop can be followed end-to-end.
- Sandbox tester can accelerate waiting without breaking runtime.
- Player-facing flow remains concise.
- Errors and impossible states are explicit.

---

## Task W14 — Exploration Core completion report and docs handoff

**Goal:** Report final state of Exploration Core Completion and prepare next-step acceptance.

**Scope:**

- Summarize which runtime pieces are now wired.
- Summarize which DB/RPC contracts were consumed.
- List any remaining DB/config blockers.
- List any missing minimal smoke content.
- List any UI/UX follow-ups.
- Do not update status docs before user confirmation.

**Acceptance criteria:**

- Report clearly states whether exploration core is ready for user smoke.
- Remaining blockers are concrete and actionable.
- Report separates core runtime issues from future minigames/UI redesign.

---

# Epic X — Onboarding / Start Flow Completion

## Epic goal

Domknąć kanoniczny start flow gracza: wybór serwera → wybór albo utworzenie bohatera → aktywny kontekst gry → stat allocation tylko po stworzeniu nowej postaci, a przy późniejszych wejściach dashboard/game shell.

Epic X nie jest tutorialem. To brama wejścia do gry oparta o selected server → active hero i DB/RPC-owned hero creation.

## Epic rules

- Nie zakładaj `hero.id === auth.uid()`.
- Konto użytkownika jest globalne; hero jest server-specific.
- Cały player flow działa przez selected/current server → active hero → hero-owned data.
- Standardowy gracz ma maksymalnie jednego bohatera na standard serverze.
- Sandbox/test servers mogą pozwalać staff/testerom na wiele hero.
- Sandbox multi-hero default: wybierz najwcześniej utworzonego bohatera, ale pozwól przełączyć na innego.
- Hero creation musi iść przez canonical DB/RPC/domain workflow, nie przez direct table writes.
- Hero name jest unikalny per server.
- Origin jest wybierany raz podczas hero creation i nie jest później zmieniany.
- Origin content/opisy/bonusy mają pochodzić z DB/config/admin contentu, nie z hardcoded frontendu.
- Nowy hero startuje z 1000 Character Points.
- Nowy hero musi od razu dostać estate.
- Startowe estate dostaje losowy wolny adres w district A; frontend nie wybiera ani nie pokazuje adresu przed utworzeniem hero.
- Jeśli district A jest pełny, server jest niedostępny dla nowej postaci i UI pokazuje server full / brak wolnych miejsc.
- Po hero creation gracz jest już w grze, ale domyślnie trafia na stat allocation.
- Przy późniejszych wejściach z istniejącym hero gracz trafia na dashboard/game shell.
- Nie aktualizuj `current-todo.md`, `current-state-summary.md` ani statusów backlogu.

---

## Task X1 — Start-flow DB/RPC contract integration layer

**Goal:**  
Podłączyć frontendowy start flow do zatwierdzonego DB/RPC kontraktu dla server availability, origin read, active hero context i atomic hero creation.

**Scope:**

- Zacznij od `git status --short`; jeśli working tree nie jest czysty, zgłoś to i czekaj na decyzję użytkownika.
- Przeczytaj:
  - `docs/current-decisions.md`;
  - `docs/project-context.md`;
  - `docs/database-current.md`;
  - `AGENTS.md`;
  - aktualne generated database types.
- Sprawdź, czy generated types zawierają zatwierdzony kontrakt DB/RPC dla:
  - dostępnych serwerów / server picker data;
  - liczby wolnych miejsc w district A albo równoważnej eligibility/capacity informacji;
  - DB-backed origins z bonusami/opisem;
  - atomic hero creation z originem, 1000 Character Points i losowym estate w district A;
  - active hero reload po utworzeniu postaci.
- Jeśli kontraktu nie ma w generated types/schema, nie implementuj workaroundu — zgłoś DB/RPC blocker.
- Jeśli kontrakt istnieje, dodaj lub dostosuj typed domain models/mappers/services dla start flow:
  - server option / server availability;
  - origin option / origin bonus display;
  - hero creation request;
  - hero creation result;
  - active hero context refresh.
- Użyj istniejących core services, mappers, validators, factories i state patterns przed dodaniem nowych helperów.
- Nie twórz nowych nazw RPC, tabel ani enumów z głowy.

**Out of scope:**

- Brak DB migration.
- Brak direct insert/update/upsert do `hero`, `hero_stats`, `estates`, `hero_resources`, `character_point_ledger` albo origin/bonus tables.
- Brak pełnego UI redesignu.
- Brak status docs updates.

**Acceptance criteria:**

- Frontend ma typed integration layer dla start flow oparty o istniejący/generated DB/RPC contract.
- Brak direct table writes dla hero creation.
- Brak fallbacku typu „stwórz hero w Angularze kilkoma insertami”.
- Missing DB/RPC contract jest zgłoszony jako blocker, nie obchodzony.
- Active hero reload po creation jest przygotowany przez istniejący active hero/server context path.
- Build/typecheck przechodzi, jeśli kod został zmieniony.

**Verification:**

- `npx tsc --noEmit`
- focused specs dla nowych mapperów/services/state, jeśli dodane
- `npm run build`
- static grep:
  - brak direct writes do hero/estate/CP workflow tables z onboarding/start-flow kodu;
  - brak `hero.id === auth.uid()` / auth uid jako hero id;
  - brak hardcoded origin bonusów jako runtime source.

**Required Codex report:**

- task scope;
- non-goals;
- acceptance mapping;
- verification;
- clean-code check;
- reused / checked but not reused / new table;
- DB/RPC blocker, jeśli wystąpił;
- manual smoke checklist, jeśli flow jest już możliwy do kliknięcia.

---

## Task X2 — Server picker and entry routing

**Goal:**  
Zbudować player entry routing od wyboru serwera do właściwego ekranu: hero creation, dashboard albo sandbox hero selection.

**Scope:**

- Użyj integration layer z X1.
- Server picker ma pokazywać dostępne serwery dla obecnego użytkownika.
- Dla standard serverów pokaż stan dostępności do stworzenia postaci:
  - available / can create;
  - full / district A full;
  - unavailable / no permission where applicable.
- Standard player:
  - jeśli ma hero na wybranym serverze → dashboard/game shell;
  - jeśli nie ma hero i server jest dostępny → hero creation;
  - jeśli nie ma hero i district A jest full → pokaż czytelny blocker.
- Multi-server user/staff:
  - może przełączać server bez ponownego logowania.
- Sandbox/test server:
  - jeśli użytkownik ma wiele hero, flow ma prowadzić do sandbox hero selection albo użyć default active hero i dać zmianę hero.
  - default sandbox hero = najwcześniej utworzony hero.
- Zachowaj selected server → active hero → hero-owned data.
- Dodaj stale guards na zmianę selected server podczas async load.

**Out of scope:**

- Brak hero creation form w tym tasku, poza routingiem do miejsca docelowego.
- Brak DB migration.
- Brak refaktoru duplicate helper cleanup poza dotkniętymi ścieżkami.
- Brak status docs updates.

**Acceptance criteria:**

- Użytkownik może wybrać serwer i trafić do właściwego flow.
- Standard server z istniejącym hero prowadzi do dashboard/game shell.
- Standard server bez hero prowadzi do hero creation tylko jeśli można stworzyć hero.
- Full district A blokuje tworzenie postaci na tym serverze.
- Sandbox multi-hero ma domyślny hero oraz możliwość zmiany.
- Nie ma auth uid jako hero id.
- Async stale response nie nadpisuje aktualnego selected server/hero contextu.

**Verification:**

- `npx tsc --noEmit`
- focused specs dla server picker / routing state, jeśli istnieje test harness
- `npm run build`
- static grep:
  - brak `hero.id === auth.uid()`;
  - brak direct writes;
  - brak hardcoded server availability.

**Manual smoke checklist:**

- Konto bez hero na dostępnym standard serverze → hero creation.
- Konto z hero na standard serverze → dashboard.
- Standard server full → czytelny blocker.
- Staff/tester na sandboxie z wieloma hero → default najwcześniej utworzony + możliwość przełączenia.
- Zmiana servera nie wymaga relogowania.

---

## Task X3 — Hero creation UI with DB-backed origin selection

**Goal:**  
Zaimplementować hero creation UI, które pozwala wybrać nazwę i origin, a następnie wywołuje canonical hero creation RPC/domain workflow.

**Scope:**

- Użyj DB-backed origin read model z X1.
- Pokaż origins z:
  - nazwą;
  - opisem/lore;
  - bonusami;
  - czytelną informacją, że origin wybiera się raz.
- Hero creation form zawiera:
  - hero name;
  - origin selection;
  - submit.
- Hero name uniqueness per server jest walidowana autorytatywnie przez DB/RPC.
- Frontend może robić lekką walidację UX, ale nie może być źródłem prawdy dla unikalności.
- Submit wywołuje atomic hero creation workflow.
- Po sukcesie:
  - odśwież active hero context;
  - nie pokazuj ani nie wybieraj startowego adresu przed creation;
  - jeżeli wynik zwraca adres, można pokazać go dopiero po creation jako informację.
- Po błędzie:
  - pokaż czytelny błąd po polsku;
  - szczególnie obsłuż duplicate name, server full/district A full, invalid origin, permission/membership error.
- Użyj reactive forms / project form patterns, nie `ngModel`.
- Użyj istniejących shared UI/patternów; nie kopiuj CSS z prototypów.

**Out of scope:**

- Brak direct writes do `hero`, `hero_stats`, `estates`, `character_point_ledger`.
- Brak admin origin editora w tym tasku.
- Brak ręcznego ustawiania 1000 CP w Angularze.
- Brak ręcznego wyboru estate address przez gracza.
- Brak status docs updates.

**Acceptance criteria:**

- Origin screen jest DB-backed/config-backed.
- Hero creation idzie jednym canonical DB/RPC workflow.
- Nowy hero dostaje origin, 1000 Character Points i estate po stronie DB/RPC.
- Frontend nie tworzy estate ani CP ledger client-side.
- Duplicate name i full server/district są pokazane jako czytelne błędy.
- Po sukcesie active hero context jest odświeżony.

**Verification:**

- `npx tsc --noEmit`
- focused specs dla form/state/service, jeśli dodane
- `npm run build`
- static grep:
  - brak `.insert(` / `.upsert(` / `.update(` do hero creation tables w start-flow kodzie;
  - brak hardcoded origin bonus content jako source of truth;
  - brak `ngModel` w nowym hero creation form.

**Manual smoke checklist:**

- Originy ładują się z DB/config.
- Wybranie originu pokazuje opis i bonusy.
- Próba stworzenia z zajętą nazwą pokazuje błąd.
- Próba stworzenia na full serverze pokazuje błąd.
- Udane stworzenie hero odświeża active hero i przechodzi dalej do stat allocation.

---

## Task X4 — Post-creation routing and stat allocation entry

**Goal:**  
Po stworzeniu hero wejść do gry i domyślnie otworzyć stat allocation, ale nie blokować gracza w tutorial/wizard flow.

**Scope:**

- Po successful hero creation routing prowadzi do in-game stat allocation screen.
- Stat allocation jest normalnym ekranem gry, nie osobnym obowiązkowym wizardem.
- Gracz może opuścić stat allocation i przejść do dashboard/game shell.
- Późniejsze wejścia z istniejącym hero prowadzą domyślnie do dashboard/game shell, nie znowu do stat allocation.
- Zachowaj istniejący canonical `save_stat_allocation(...)` dla zapisu statów.
- Nie zmieniaj zasad stat allocation poza routingiem/entry.
- Jeśli stat allocation route/page już istnieje, użyj go zamiast tworzyć duplikat.
- Jeśli istniejący ekran zakłada stare identity assumptions, popraw tylko zakres potrzebny dla Epic X.

**Out of scope:**

- Brak przebudowy całego stats/progression systemu.
- Brak zmian DB/RPC w `save_stat_allocation(...)`.
- Brak obowiązkowego tutoriala.
- Brak status docs updates.

**Acceptance criteria:**

- Freshly created hero → stat allocation.
- Existing hero returning to selected server → dashboard/game shell.
- Stat allocation można opuścić.
- Stat save nadal idzie przez canonical stat allocation RPC.
- Nie ma auth uid jako hero id.
- Routing nie tworzy pętli ani nie wraca na creation po refreshu z istniejącym hero.

**Verification:**

- `npx tsc --noEmit`
- focused routing/state specs, jeśli istnieją
- `npm run build`
- manual route smoke dla fresh-created vs returning hero.

**Manual smoke checklist:**

- Po creation trafiam na stat allocation.
- Mogę wyjść ze stat allocation.
- Refresh / ponowne wejście z tym samym hero prowadzi na dashboard.
- Zapis statów nadal działa przez istniejący canonical flow.

---

## Task X5 — Sandbox multi-hero switcher

**Goal:**  
Dodać albo domknąć sandbox/test multi-hero selection/switching dla staff/testerów bez naruszania standard server one-hero rule.

**Scope:**

- Użyj istniejącej roli/membership/staff access layer.
- Sandbox/test server może pokazać listę hero dostępnych dla użytkownika na tym serverze.
- Default selection:
  - najwcześniej utworzony hero;
  - jeśli istniejący active hero na tym sandboxie jest już ustawiony i nadal dostępny, można go zachować w bieżącej sesji, ale canonical fallback to earliest created.
- UI pozwala przełączyć active hero.
- Po przełączeniu:
  - active hero context reload;
  - hero-owned data reload;
  - route zostaje w sensownym miejscu albo wraca do dashboardu, jeśli obecny route nie pasuje do nowego hero.
- Standard server nie pokazuje multi-hero switchera dla normalnego gracza.
- Jeśli użytkownik ma uprawnienie do tworzenia kolejnego sandbox hero, UI może prowadzić do hero creation dla sandboxa.

**Out of scope:**

- Brak zmian standard server one-hero rule.
- Brak staff management refactoru.
- Brak direct hero writes.
- Brak status docs updates.

**Acceptance criteria:**

- Sandbox/test multi-hero user widzi możliwość zmiany hero.
- Default sandbox hero to najwcześniej utworzony.
- Zmiana hero odświeża active hero i hero-owned data.
- Normalny standard-server gracz nie widzi niepotrzebnego hero switchera.
- Uprawnienia sandbox/test są respektowane przez istniejący access layer/DB.

**Verification:**

- `npx tsc --noEmit`
- focused specs dla multi-hero selection state, jeśli dodane
- `npm run build`
- static grep:
  - brak globalnego założenia one hero per account;
  - brak auth uid jako hero id;
  - brak direct writes.

**Manual smoke checklist:**

- Staff/tester na sandboxie z wieloma hero widzi switcher.
- Default wskazuje najwcześniej utworzonego hero.
- Przełączenie hero zmienia aktywny kontekst i dane.
- Normalny gracz na standard serverze nie dostaje sandbox switchera.

---

## Task X6 — Start flow final integration and smoke hardening

**Goal:**  
Domknąć end-to-end start flow i usunąć niespójności między server picker, hero creation, sandbox switcher, active hero resolver i post-creation routing.

**Scope:**

- Przejdź pełne flow w kodzie:
  - auth/session ready;
  - server picker;
  - selected server;
  - active hero resolve;
  - no hero → hero creation;
  - creation success → active hero reload → stat allocation;
  - existing hero → dashboard;
  - sandbox multi-hero → switcher/default/switch;
  - server full / district A full → blocker.
- Napraw realne integracyjne błędy znalezione w tych ścieżkach.
- Ujednolić error handling i loading states:
  - permission/membership error;
  - no accessible servers;
  - server full;
  - duplicate hero name;
  - origin unavailable/inactive;
  - hero creation RPC failure;
  - active hero reload failure.
- Dodać stale guards tam, gdzie async response zależy od selected server / active hero / route context.
- Zachować cienkie route pages; większą logikę trzymać w state/service/facade zgodnie z istniejącymi patternami.
- Nie maskować DB/RPC blockerów frontendowymi sukcesami.

**Out of scope:**

- Brak nowej DB migration.
- Brak status docs updates.
- Brak UI redesignu poza koniecznym uporządkowaniem start flow.
- Brak unrelated refactoru.

**Acceptance criteria:**

- Start flow działa jako spójna brama do gry.
- Fresh account/player może wybrać server, stworzyć hero i trafić do stat allocation.
- Returning player trafia do dashboard.
- Sandbox multi-hero działa bez relogu.
- Full server/district A pokazuje czytelny blocker.
- Żaden workflow hero creation nie używa direct table writes.
- Nie ma `hero.id === auth.uid()` assumptions.
- Build przechodzi.

**Verification:**

- `npx tsc --noEmit`
- focused specs dla dotkniętych states/services/routes
- `npm run build`
- static grep:
  - no direct writes for hero creation workflow;
  - no auth uid as hero id;
  - no hardcoded origins as source of truth;
  - no Angular-side CP/estate creation.

**Manual smoke checklist:**

- Nowy użytkownik / no hero → server picker → hero creation → stat allocation.
- Returning user / existing hero → server picker or remembered server → dashboard.
- Sandbox tester z wieloma hero → default earliest created → switch hero.
- Full standard server → blocker, brak creation submit.
- Duplicate name → czytelny błąd.
- Refresh po creation nie wraca do hero creation.
- Zmiana servera nie wymaga relogowania.

---

# Epic Y — Prestige Foundation Frontend Integration

## Epic goal

Podłączyć frontend Mythsworn do DB/RPC foundation systemu Prestige po migracji migratora.

Epic Y pokazuje Prestige jako player-facing rangę oraz admin/tester-facing raw/debug data, ale nie liczy punktów, delt, progów ani rang w Angularze.

Prestige jest DB-authoritative.

## Hard dependency

Do not start this Epic until the migrator confirms:

- Prestige DB/RPC foundation exists;
- generated Supabase types are regenerated and available;
- `ranks` / prestige rank registry is migrated or adapted;
- current hero Prestige state exists;
- Prestige ledger exists;
- PvP Prestige delta workflow exists;
- player-safe Prestige read path exists;
- public hero rank read path exists;
- admin/debug Prestige read path exists;
- PvP report context includes player-safe qualitative Prestige change summary;
- rank-change notification producer exists, or is explicitly marked as follow-up;
- RLS/grants are defined.

If any required contract is missing from generated types, stop and report DB/RPC blocker.

## Canonical decisions

- Prestige is hero-scoped and server-scoped.
- Prestige is separate from level, XP and Character Points.
- Prestige has hidden points and visible rank.
- Players see their own and other heroes’ Prestige rank.
- Players do not see raw Prestige points.
- Players do not see numeric Prestige delta.
- Admin/tester/sandbox UI may see raw points, raw deltas, thresholds and source context.
- Prestige cannot drop below zero.
- Prestige has no decay.
- Prestige v1 is PvP-driven.
- Future sources such as Argonautics may be added later, but are not part of Epic Y.
- Prestige gates districts, building starts/upgrades, relocation and future political privileges.
- Losing Prestige below a district threshold does not delete estate, buildings or existing progress.
- PvP reports show qualitative Prestige change after each Prestige-affecting PvP result.
- Separate notifications are created only when Prestige rank changes.

## Prestige ranks

Use DB-backed rank data. Do not hardcode as source of truth.

Expected canonical rank names:

| Rank | District | Name |
|---:|---|---|
| 1 | A | Perioecus |
| 2 | B | Ephor |
| 3 | C | Strategos |
| 4 | D | Archon |
| 5 | E | Basileus |

Frontend may use these names only as fallback diagnostics if DB data is missing, not as permanent runtime source.

---

## Task Y1 — Prestige read models and mapper layer

**Goal:**  
Add typed frontend read models/mappers for Prestige rank, current hero Prestige state, public hero Prestige rank, PvP Prestige summary and admin/debug Prestige state.

**Scope:**

- Read current generated database types and migrator-provided RPCs/views.
- Add explicit domain/read models for:
  - `PrestigeRank`;
  - `HeroPrestigePlayerState`;
  - `HeroPrestigePublicState`;
  - `HeroPrestigeAdminDebugState`;
  - `PrestigeChangeSummary`;
  - `PrestigeRankChangeNotification`;
  - `PrestigeLedgerEntry` if exposed to admin/debug.
- Map DB/RPC rows to explicit domain models.
- Keep player-safe, public-safe and admin/debug models separate.
- Preserve raw keys only as secondary/debug metadata.
- Do not expose raw generated DB rows to components.
- Do not compute rank from points in Angular if DB exposes current rank.
- Do not compute PvP delta in Angular.

**Out of scope:**

- No DB/RPC changes.
- No generated types regeneration.
- No UI redesign.
- No admin configurator yet.
- No status docs updates.

**Acceptance criteria:**

- Prestige frontend domain/read models exist.
- Player-safe/public models do not include raw points or numeric deltas.
- Admin/debug model may include raw points/delta/source context.
- PvP report summary model supports qualitative change message.
- Rank-change notification model supports before/after rank names.
- Missing DB contract is reported as blocker, not faked.

**Verification:**

- `npx tsc --noEmit`
- focused mapper specs if added
- `npm run build`

**Required report:**

- reused / checked but not reused / new;
- DB/RPC contract used;
- player-safe fields vs public-safe fields vs admin/debug fields;
- generated types changed: no.

---

## Task Y2 — Own hero Prestige rank display

**Goal:**  
Show current hero Prestige rank in player-facing own-hero surfaces.

**Scope:**

- Use read models from Y1.
- Show own hero Prestige rank where current dashboard/profile/hero summary already displays hero identity.
- Show rank name, rank number/tier and player-facing helper/description if DB provides it.
- Do not show raw points.
- Do not show raw delta.
- Use DB-backed rank label/description/helper text.
- Missing rank metadata should not crash the page.

**Out of scope:**

- No full Prestige page.
- No public target card work.
- No admin raw points view.
- No local permanent copy.

**Acceptance criteria:**

- Player can see own Prestige rank.
- Player cannot see raw Prestige points.
- Rank label/description comes from DB/read model.
- Missing data degrades safely.

**Verification:**

- `npx tsc --noEmit`
- focused component/state specs if touched
- `npm run build`
- static check for raw prestige fields in own-player templates.

**Manual smoke:**

- Open own dashboard/profile.
- Confirm Prestige rank is visible.
- Confirm no raw points/delta are visible.

---

## Task Y3 — Public/target Prestige rank display

**Goal:**  
Show other heroes’ Prestige rank in public/player-facing identity surfaces.

**Scope:**

- Use public-safe read model from Y1.
- Show other hero Prestige rank where public hero/PvP target identity is already displayed.
- Priority surface: PvP/vicinity target cards if available.
- Show rank name/tier only.
- Do not show raw points.
- Do not show raw delta.
- Do not show admin/debug source context.

**Out of scope:**

- No new public profile page unless it already exists.
- No PvP target redesign.
- No admin debug data.
- No local rank calculations.

**Acceptance criteria:**

- Player can see target/other hero Prestige rank where appropriate.
- Raw points/deltas are not present in public/player-facing model or template.
- Missing public Prestige data does not crash target cards.

**Verification:**

- `npx tsc --noEmit`
- focused specs if touched
- `npm run build`
- static check for raw prestige fields in public/player-facing target templates.

**Manual smoke:**

- Open PvP/vicinity target list.
- Confirm target Prestige rank is visible.
- Confirm target raw points are not visible.

---

## Task Y4 — PvP report Prestige summary

**Goal:**  
Display qualitative Prestige change inside the PvP report/result, not as a separate notification.

**Scope:**

- Use DB-provided PvP report/read model context.
- Display qualitative Prestige change in the PvP report alongside normal PvP result information such as outcome, XP/CP, resources and combat summary.
- Player-facing examples:
  - no change;
  - minor increase;
  - significant increase;
  - dramatic increase;
  - minor decrease;
  - significant decrease;
  - dramatic decrease.
- Do not show numeric delta such as `+12` or `-6`.
- Do not show before/after raw points.
- Do not calculate qualitative category in Angular if DB provides message kind/category.
- If Prestige delta exists but report context lacks a player-safe summary, report DB/read-model blocker.
- If no Prestige delta applies, show neutral/absent state according to DB response.

**Out of scope:**

- No separate notification for ordinary point delta.
- No DB scoring.
- No formula preview.
- No admin debug panel.
- No copy finalization beyond using DB metadata/copy.

**Acceptance criteria:**

- PvP report can show qualitative Prestige change.
- Raw points and numeric delta are hidden from player-facing report.
- Prestige summary is sourced from DB/report context.
- Missing Prestige summary is reported as dependency, not locally invented.

**Verification:**

- `npx tsc --noEmit`
- focused report mapper/display specs if touched
- `npm run build`

**Manual smoke:**

- Open a PvP report with Prestige delta.
- Confirm qualitative Prestige change appears in the report.
- Confirm no numeric delta/raw points appear.
- Confirm no separate notification is expected unless rank changed.

---

## Task Y5 — Admin/test Prestige debug surface

**Goal:**  
Expose raw Prestige points, deltas, thresholds and source context to authorized admin/test/sandbox UI.

**Scope:**

- Add or extend an existing admin/debug surface for hero Prestige.
- Use admin/debug RPC/read model only.
- Show:
  - current raw points;
  - current rank;
  - next threshold;
  - last delta;
  - source kind/source entity;
  - before/after rank;
  - before/after points;
  - qualitative message kind;
  - PvP band classification if available;
  - source ledger id if available.
- Respect server/staff/test access.
- Keep this model out of player-facing services/components.

**Out of scope:**

- No threshold editing yet.
- No manual admin adjustment unless migrator provides governed RPC and user asks.
- No config UI.
- No DB changes.

**Acceptance criteria:**

- Admin/tester can inspect raw Prestige state for a hero where authorized.
- Player-facing UI cannot access/display this raw debug model.
- Missing source context is shown as diagnostic, not guessed.
- Access boundary is clear.

**Verification:**

- `npx tsc --noEmit`
- focused specs if admin state/service added
- `npm run build`
- static check that admin/debug service is not imported into player-facing components.

**Manual smoke:**

- Open admin/test hero Prestige debug surface.
- Confirm raw points/delta/context are visible for authorized user.
- Confirm normal player path does not show raw points.

---

## Task Y6 — Prestige admin config surface

**Goal:**  
Expose Prestige balancing/configuration surfaces after DB config/read models exist.

**Scope:**

- Use migrator-provided config/read paths.
- Support viewing and, if governed write path exists, editing:
  - rank thresholds;
  - rank metadata/helper text;
  - rank descriptions;
  - target banding defaults such as 20/60/20;
  - PvP attacker delta matrix;
  - PvP defender delta matrix;
  - qualitative message categories/thresholds/copy.
- Use existing config governance patterns where applicable.
- Do not direct-write config tables if governed config workflow exists.
- Show admin/debug explanation of player-safe vs admin-only fields.

**Out of scope:**

- No DB config schema changes.
- No new config governance workflow.
- No arbitrary manual Prestige adjustment.
- No player UI.
- No Server Council or server events.

**Acceptance criteria:**

- Admin can inspect Prestige configuration.
- Editing is available only if canonical/governed DB/RPC path exists.
- If editing path is missing, UI reports dependency instead of faking.
- Config values are not hardcoded in Angular.
- Rank labels/descriptions/helper text come from DB/config.

**Verification:**

- `npx tsc --noEmit`
- focused admin/config specs if touched
- `npm run build`

**Manual smoke:**

- Open Prestige config/admin surface.
- Confirm thresholds, banding and delta matrix are visible.
- If edit path exists, make a governed test edit and confirm stale guards/save handling.
- If edit path does not exist, confirm dependency message is clear.

---

## Task Y7 — Building Prestige requirement display

**Goal:**  
Reflect DB-authoritative Prestige requirements in building/build-upgrade UI.

**Scope:**

- Use existing requirement/read-model path exposed by migrator.
- Do not decide whether `buildings.rank_required` or central `entity_requirements` is canonical; consume the DB/RPC contract migrator exposes.
- In mansion/building UI:
  - existing buildings continue to display and work;
  - already-started jobs are not blocked client-side;
  - new build/upgrade action is unavailable when DB says current Prestige rank does not meet requirement;
  - visible reason comes from DB/read model.
- Do not hide existing estate/buildings.
- Do not recalculate requirement in Angular.

**Out of scope:**

- No DB validation changes.
- No direct requirement calculation.
- No building redesign.
- No relocation logic.
- No council/siege rules.

**Acceptance criteria:**

- New building/upgrade above current Prestige rank is blocked where DB says blocked.
- Existing buildings remain visible and usable.
- Started jobs remain visible and continue.
- Lower-rank building actions remain available where DB allows.
- Reasons come from DB/RPC/read model, not hardcoded Angular logic.

**Verification:**

- `npx tsc --noEmit`
- focused mansion/building specs if touched
- `npm run build`

**Manual smoke:**

- Use a hero whose Prestige rank is lower than a building requirement.
- Confirm existing buildings still appear.
- Confirm high-rank build/upgrade is blocked with reason.
- Confirm lower-rank build/upgrade remains available.

---

## Task Y8 — Relocation and district Prestige gate display

**Goal:**  
Reflect DB-authoritative Prestige district gates in relocation/vicinity UI.

**Scope:**

- Use migrator-provided district/prestige requirement read model.
- In relocation/vicinity UI:
  - block relocation within current higher district if hero no longer meets that district’s Prestige requirement;
  - block moving to higher district if current rank is insufficient;
  - show DB-sourced reason.
- Do not evict hero.
- Do not hide current estate.
- Do not mutate estate/buildings.
- Do not infer district eligibility from rank names in Angular.

**Out of scope:**

- No DB validation changes.
- No estate relocation RPC changes.
- No building requirement logic.
- No Server Council.
- No siege.

**Acceptance criteria:**

- Relocation UI reflects Prestige district gate.
- Hero below district requirement cannot relocate within that higher district via UI.
- Hero below higher district requirement cannot move higher.
- Current estate/address remains visible.
- Reasons come from DB/read model.

**Verification:**

- `npx tsc --noEmit`
- focused vicinity/relocation specs if touched
- `npm run build`

**Manual smoke:**

- Use hero in district C with Prestige rank below C requirement.
- Confirm current estate remains visible.
- Confirm relocation within C is blocked with reason.
- Confirm lower-eligible actions remain unaffected where applicable.
- Confirm moving higher is blocked.

---

## Task Y9 — Prestige rank-change notifications

**Goal:**  
Render persistent notifications when Prestige rank changes.

**Scope:**

- Use existing notification services/read models.
- Do not create notification rows in Angular.
- Render DB-created Prestige rank-change notifications for:
  - rank up;
  - rank down.
- Notification should include:
  - old rank name;
  - new rank name;
  - player-safe message.
- Notification must not include:
  - raw points;
  - numeric delta;
  - formula context.
- Ordinary point delta without rank change should not create or require a separate notification.
- If migrator did not implement rank-change notification producer yet, report as follow-up and do not fake notifications.

**Out of scope:**

- No notification DB producer.
- No notification center redesign.
- No local notification generation.
- No report summary work; that is Y4.

**Acceptance criteria:**

- Prestige rank-change notifications render when DB provides them.
- Player notification text shows rank change, not raw points.
- No notification appears/gets fabricated for ordinary non-rank-changing point delta.
- Missing notification hook is reported as follow-up, not faked.

**Verification:**

- `npx tsc --noEmit`
- focused notification mapper/specs if touched
- `npm run build`

**Manual smoke:**

- Trigger or inspect Prestige rank-up/rank-down event with DB notification.
- Confirm notification appears.
- Confirm old/new rank names are visible.
- Confirm no raw delta/points appear.
- Confirm ordinary Prestige point change is visible in PvP report, not as separate notification.

---

## Task Y10 — Prestige frontend integration smoke and cleanup candidates

**Goal:**  
Do a final frontend integration pass after Y1–Y9 to confirm Prestige works coherently across player/admin surfaces.

**Scope:**

- Walk through:
  - own hero rank display;
  - public/target hero rank display;
  - PvP report qualitative Prestige change;
  - admin/debug raw view;
  - admin config view;
  - building requirement display;
  - relocation/district gate display;
  - rank-change notification rendering if DB producer exists.
- Fix small integration issues found in touched scope.
- Report cleanup candidates:
  - old level-based rank display;
  - stale dashboard rank fallback;
  - raw Prestige point leak risk;
  - old `ranks.required_level` / `ranks.max_players` frontend usage;
  - old fields assuming rank from level rather than Prestige points.
- Do not perform unrelated feature cleanup.

**Out of scope:**

- No DB changes.
- No new scoring logic.
- No Server Council.
- No server events.
- No Argonautics.
- No UI redesign.
- No status docs updates.

**Acceptance criteria:**

- Player sees rank and qualitative PvP report changes only.
- Player sees rank-change notifications only when rank changes.
- Admin/tester sees raw/debug data where authorized.
- Building/relocation gates consume DB read models.
- No Angular-side Prestige scoring exists.
- No raw points leak in player-facing templates.
- Old level-based rank display is removed or reported as cleanup candidate.

**Verification:**

- `npx tsc --noEmit`
- focused specs for touched areas
- `npm run build`
- static grep:
  - player-facing raw `prestigePoints` / raw delta fields;
  - old level-based rank display;
  - hardcoded rank thresholds;
  - hardcoded PvP delta matrix;
  - stale references to `ranks.required_level` / `ranks.max_players`.

**Manual smoke:**

- Player dashboard/profile: rank visible, no points.
- PvP target card: target rank visible, no points.
- PvP report: qualitative Prestige change visible.
- Rank change: notification appears with old/new rank.
- Admin debug: points/delta/context visible.
- Admin config: thresholds/matrix visible.
- Building UI: rank gates shown correctly.
- Relocation UI: district gates shown correctly.

---

# Epic Z — Server Events Frontend Integration

## Epic goal

Podłączyć frontend Mythsworn do DB/RPC foundation systemu Server Events po migracji migratora.

Server Event jest globalnym, server-scoped, czasowym buffem/debuffem działającym na wszystkich bohaterów na serwerze. Frontend pokazuje aktywny event, admin pozwala zarządzać definicjami/aktywacją/configiem, ale Angular nie liczy efektów eventu jako authority.

## Hard dependency

Do not start this Epic until the migrator confirms:

- Server Events DB/RPC foundation exists.
- Generated Supabase types are regenerated and available.
- Server event definitions/read model exists.
- Server event effects/read model exists.
- Active server event read path exists.
- Admin event catalog/config read path exists.
- Manual admin start RPC exists, or is explicitly missing and should be reported as blocker.
- System roll/cooldown config read path exists if Z6 is attempted.
- RLS/grants are defined.
- Runtime/stat/Luck/requirement resolver integration is DB-owned.

If any required DB/RPC contract is missing from generated types, stop and report DB/RPC blocker.

## Canonical decisions

- Server Event affects the whole server.
- Server Event affects all heroes on that server.
- No district/guild/rank/origin/player sub-scopes in v1.
- Only one active Server Event per server.
- Events are rare, powerful and irregular.
- Events can be positive, negative or mixed.
- Events require lore-facing name, description and helper/copy metadata.
- Event copy must be DB/admin-configurable, not hardcoded in Angular.
- Default duration is one week, but duration is DB/admin-configurable.
- Admin can manually start an event.
- Manual start ignores cooldown.
- Cooldown counts from the actual end of the last event, including manually started events.
- Automatic system roll can run after configurable cooldown, default 14 days.
- Automatic roll chance default is 10%.
- If automatic roll succeeds, system selects one active eligible event uniformly from the pool and starts it immediately.
- Events do not have weights.
- Automatic events can start even when no players are online.
- Manual end/reschedule is not normal production flow, but may exist as admin/sandbox/emergency correction if DB supports it.
- Server Events may modify base stats, all stats, Luck, derived stats, combat-derived values and normal requirement checks.
- Requirement modifiers apply to normal requirements such as item/building requirements, but not Prestige/district entry gates.
- Server Events must not directly alter manual minigame mechanics such as Walking Dead speed.
- Event effects flow through DB/runtime resolver/read-model paths.
- Angular must not calculate event effects as authority.

## Future council compatibility, not part of Epic Z implementation

Server Council voting is future work. Do not implement council voting in this Epic.

Future direction only:

- Council receives default 5 event proposals.
- Voting lasts default 3 days.
- Event starts by configurable rule: chosen weekday or X days after voting ends.
- Basileus/E1 vote breaks ties when available.
- If no Basileus/E1 and tie remains, run 24h runoff among tied events.
- If still tied, randomly select among still-tied events only.

---

## Task Z1 — Server Event read models and mapper layer

**Goal:**  
Add typed frontend read models/mappers/services for Server Event definitions, effects, active event state and admin/debug state.

**Scope:**

- Read current generated database types and migrator-provided RPCs/views.
- Add explicit domain/read models for:
  - `ServerEventDefinition`;
  - `ServerEventEffect`;
  - `ActiveServerEvent`;
  - `ServerEventRun`;
  - `ServerEventActivationConfig`;
  - `ServerEventAdminSummary`;
  - `ServerEventEffectDisplayRow`.
- Keep player-safe and admin/debug models separate if DB exposes separate read paths.
- Map DB/RPC rows into explicit domain models.
- Do not expose raw generated DB rows to components.
- Do not compute stat/Luck/requirement effects in Angular.
- Preserve raw technical keys only as secondary/admin metadata.
- Use selected/current server context; no global fallback.

**Out of scope:**

- No DB/RPC changes.
- No generated types regeneration.
- No UI screen implementation beyond mapper/service tests if needed.
- No event editor yet.
- No manual start UI yet.
- No status docs updates.

**Acceptance criteria:**

- Typed read models exist for definitions, effects, active event state and admin summary.
- Player-safe model includes lore name/description/effect display, not raw SQL/debug internals.
- Admin model may include technical keys/config/status where DB exposes them.
- Missing DB contracts are reported as blockers, not faked.
- No Angular-side effect calculation is introduced.

**Verification:**

- `npx tsc --noEmit`
- focused mapper/service specs if added
- `npm run build`

**Required Codex report:**

- task scope;
- non-goals;
- acceptance mapping;
- verification;
- reused / checked but not reused / new;
- DB/RPC contract used;
- generated types changed: no.

---

## Task Z2 — Active Server Event player indicator

**Goal:**  
Show a simple player-facing indicator for the currently active Server Event.

**Scope:**

- Use read models/services from Z1.
- Add or extend one compact indicator in the game shell/topbar/sidebar area.
- If no active event exists, show a clear neutral state such as “no active server event”.
- If an event is active, show:
  - lore name;
  - lore description/helper text;
  - remaining time/end time if DB exposes it;
  - concise effect summary from DB/read model.
- Do not create a large banner, report, archive or notification system.
- Do not compute effective stat/Luck/requirement changes in Angular.
- Use DB-provided/effect-display rows.
- Use stale guards for selected server changes.
- The indicator is not a notification producer and must not insert notification rows.

**Out of scope:**

- No admin editing.
- No manual event start.
- No event history page.
- No Server Council.
- No UI redesign.
- No local hardcoded event copy.

**Acceptance criteria:**

- Player can see whether a Server Event is active.
- Active event name/description/effects are DB-backed.
- Indicator updates when selected server changes.
- No Angular-side event authority is introduced.
- Missing active event read path is reported as DB/RPC blocker.

**Verification:**

- `npx tsc --noEmit`
- focused component/state specs if touched
- `npm run build`

**Manual smoke:**

- Open game shell with no active event → neutral indicator appears.
- Open game shell with active event → event name/description/effects appear.
- Switch server context → stale old response does not overwrite current indicator.

---

## Task Z3 — Admin Server Event catalog read surface

**Goal:**  
Add an admin/read-only surface for inspecting configured Server Events and their effects.

**Scope:**

- Use admin read model from Z1.
- Add route/section under appropriate admin balance/server operations area.
- List Server Event definitions with:
  - key;
  - lore name;
  - lore description;
  - active/inactive status;
  - default duration;
  - effect summary;
  - technical metadata as secondary/admin-only display.
- Detail view should show effect rows:
  - effect kind/target;
  - operation;
  - value;
  - player-facing explanation if DB provides it.
- Include clear diagnostics for unsupported/missing effect data.
- Do not expose this as player UI.

**Out of scope:**

- No editing.
- No manual start.
- No config change-set integration.
- No DB changes.
- No Server Council proposal UI.

**Acceptance criteria:**

- Admin can inspect all Server Event definitions.
- Admin can inspect event effects.
- Technical keys are secondary, not the only visible label.
- No local list of events/effects is hardcoded.
- Missing DB metadata is shown as dependency/diagnostic.

**Verification:**

- `npx tsc --noEmit`
- focused admin specs if added
- `npm run build`

**Manual smoke:**

- Open Server Events admin catalog.
- Confirm event definitions appear.
- Open a definition/detail and confirm lore copy + effects are visible.

---

## Task Z4 — Server Event definition and effect editor

**Goal:**  
Allow admin to edit Server Event definitions and effects if canonical/governed DB write paths exist.

**Scope:**

- Use migrator-provided governed RPC/config workflow.
- If governed write RPC/config-change-set path is missing, keep the screen read-only and report blocker. Do not add direct table write, local save, or optimistic fake mutation.
- Editing should support where DB permits:
  - lore name;
  - lore description;
  - helper/player-facing copy;
  - active/inactive flag;
  - default duration;
  - effect rows.
- Effect editor should support DB-provided effect kinds/targets/operators only.
- Do not invent effect types in Angular.
- If write path is missing, show/read-only dependency and report blocker.
- Use Reactive Forms; no new `ngModel`.

**Out of scope:**

- No direct table writes.
- No DB schema changes.
- No manual start.
- No system roll config.
- No council voting/proposals.
- No broad admin UI redesign.

**Acceptance criteria:**

- Admin can edit Server Event definitions only through canonical/governed path.
- Admin can edit effects only if DB exposes safe write contract.
- Missing write path is reported, not bypassed.
- Event copy is editable through DB/admin path, not hardcoded.
- No event weights are added or exposed.

**Verification:**

- `npx tsc --noEmit`
- focused form/service specs if touched
- `npm run build`

**Manual smoke:**

- Open event editor.
- Change lore name/description in governed flow if available.
- Save through canonical path.
- Reload and confirm persisted values.
- If write path absent, confirm clear dependency message.

---

## Task Z5 — Manual admin Server Event start

**Goal:**  
Add admin action to manually start a Server Event through canonical DB/RPC.

**Scope:**

- Use migrator-provided manual start RPC/domain operation.
- Manual start ignores cooldown.
- Starting an event must respect one-active-event-per-server rule enforced by DB.
- UI should show:
  - currently active event if any;
  - candidate events available to start;
  - duration/default duration;
  - confirmation before start;
  - result after start.
- Use selected server context.
- Include stale guards for selected server and active event reload.
- If DB exposes emergency end/reschedule, surface only if explicitly present and label as correction/emergency/sandbox tool, not normal gameplay flow.

**Out of scope:**

- No Angular-side cooldown override logic.
- No direct insert into event run tables.
- No system roll trigger unless DB exposes an explicit admin/test RPC.
- No council voting.
- No player UI.

**Acceptance criteria:**

- Admin can manually start an event if DB/RPC allows it.
- Manual start uses canonical RPC.
- UI does not allow starting a second active event if DB says one is already active.
- Manual start result reloads active event state.
- Emergency end/reschedule is absent unless DB exposes explicit correction RPC.

**Verification:**

- `npx tsc --noEmit`
- focused admin action specs if added
- `npm run build`

**Manual smoke:**

- Select server.
- Start an event manually.
- Confirm active event appears in admin and player indicator.
- Try starting another while one active → blocked by DB/read model/RPC.
- Confirm cooldown is not enforced client-side for manual start.

---

## Task Z6 — Server Event system roll/cooldown config surface

**Goal:**  
Expose system activation settings for Server Events in admin UI.

**Scope:**

- Use DB config/read model exposed by migrator.
- Show:
  - cooldown duration, default 14 days;
  - roll chance, default 10%;
  - default event duration, default one week;
  - next eligible roll info if DB exposes it;
  - last event end timestamp;
  - whether system roll is enabled.
- Editing is allowed only through governed DB/config path.
- If edit path is missing, show dependency and keep read-only.
- Do not implement scheduler logic in Angular.
- Do not fake next roll calculation if DB does not expose it.

**Out of scope:**

- No DB config schema changes.
- No council voting config.
- No manual start action; that is Z5.
- No event definition editing; that is Z4.

**Acceptance criteria:**

- Admin can inspect system roll/cooldown config.
- Admin can edit only through canonical/governed path if available.
- No event weights are shown.
- Missing next-roll data is shown as dependency, not calculated as authority by Angular.

**Verification:**

- `npx tsc --noEmit`
- focused admin/config specs if touched
- `npm run build`

**Manual smoke:**

- Open Server Event activation config.
- Confirm cooldown/chance/default duration are visible.
- If edit path exists, perform governed edit and reload.
- If not, confirm read-only dependency message.

---

## Task Z7 — Active Server Event effect source display in runtime explainability

**Goal:**  
Show Server Event as a source in existing runtime/explainability surfaces where DB read models expose it.

**Scope:**

- Use DB/runtime/read-model output only.
- Candidate surfaces:
  - Luck breakdown;
  - stat/derived stat explainability;
  - requirement check explainability;
  - combat/admin debug preview if DB exposes event source.
- Display Server Event contribution as a source row, e.g. event name + effect summary.
- Do not compute the contribution in Angular.
- Do not add new formula calculations.
- Do not alter manual minigame mechanics.
- If DB does not expose event source rows yet, report DB/read-model follow-up.
- Touch only surfaces that already expose compatible read-model source rows or are already in scope for this Epic.

**Out of scope:**

- No runtime DB changes.
- No manual start/admin catalog.
- No new player-facing event history.
- No broad refactor of all stats screens.

**Acceptance criteria:**

- Where DB exposes event source rows, UI can show Server Event contribution.
- No local event-effect math is introduced.
- Missing read model is reported as dependency.
- Existing explainability surfaces remain usable without active event.

**Verification:**

- `npx tsc --noEmit`
- focused mapper/display specs if touched
- `npm run build`

**Manual smoke:**

- With active `+Luck` event, open Luck breakdown and confirm event source appears if DB exposes it.
- With requirement modifier event, open relevant requirement explanation and confirm event source appears if DB exposes it.
- Confirm no effect is calculated/displayed from hardcoded Angular rules.

---

## Task Z8 — Server Event player/admin integration smoke

**Goal:**  
Perform a final frontend integration pass for Server Events after Z1–Z7.

**Scope:**

- Walk through:
  - no active event indicator;
  - active event indicator;
  - admin event catalog;
  - admin event detail/effect rows;
  - manual start flow;
  - activation config surface;
  - event contribution in runtime explainability if DB exposes it.
- Fix small integration issues within touched Server Event scope.
- Report cleanup candidates:
  - hardcoded event labels;
  - old local event placeholders;
  - stale active event cache;
  - direct table write risks;
  - missing generated types/read models.
- Do not implement council voting.
- Do not implement event history/archive unless already present and tiny to expose.

**Out of scope:**

- No DB/RPC changes.
- No server council.
- No player event archive.
- No UI redesign.
- No status docs updates.

**Acceptance criteria:**

- Player sees one active-event indicator.
- Admin can inspect event definitions/effects.
- Admin can manually start event if DB provides RPC.
- Admin can inspect activation config.
- Event effects are never calculated in Angular.
- No raw/generated rows leak as long-term UI models.
- No backlog/status docs are updated.

**Verification:**

- `npx tsc --noEmit`
- focused specs for touched areas
- `npm run build`
- static grep:
  - no direct writes to server event tables;
  - no event weights in frontend;
  - no Angular-side effect calculators;
  - no hardcoded event definitions as runtime source.

**Manual smoke:**

- No active event → player indicator shows neutral state.
- Manual admin start → event becomes active.
- Player indicator shows active event.
- Admin catalog/detail shows lore and effects.
- Active event remains one-per-server.
- If runtime read model exposes effect sources, explainability surfaces show event source.

---

# Epic AA — Server Council / Server Event Voting

**Status:** Blocked until Server Council DB/RPC foundation exists and generated Supabase types are current.

## Epic goal

Wdrożyć frontendową integrację Rady Serwera jako prostego systemu głosowania nad Server Eventem.

Rada Serwera v1 nie jest parlamentem ani pełnym systemem polityki. Jej jedyną funkcją w tym epiku jest wybór Server Eventu z puli propozycji.

## Hard dependency

Do not start this Epic until migrator confirms the DB/RPC foundation exists and generated Supabase types are current.

Required DB/RPC/read-model contracts:

- current council eligibility for selected server;
- active council vote/session read path;
- council event proposal read path;
- cast/change vote RPC;
- vote result/read model;
- tie-break/runoff/result status exposed by DB;
- player-safe public council status read path;
- server event activation integration after voting;
- RLS/grants for council members, normal players and admin/debug views.

If any required contract is missing from generated types, stop and report DB/RPC blocker.

## Canonical decisions

- Server Council v1 exists only to choose Server Events.
- It is not a parliament, tax system, punishment system, guild governance system, veto system or public debate system.
- Council exists to give additional meaning to high districts D/E and especially E1.
- Council members are current estate holders in districts D and E.
- District C is not part of Council v1.
- There are no terms, campaigns, candidates or elections.
- Membership is dynamic: if a hero leaves/loses D/E estate, they leave the Council.
- If a hero takes a D/E estate and meets eligibility, they naturally enter the Council.
- Falling below Prestige eligibility suspends voting rights but does not remove estate.
- Suspended/banned membership cannot vote.
- Being in Council does not grant or remove Prestige.
- Council can only negatively affect players indirectly by choosing a negative Server Event.
- Every eligible council member has one vote.
- A vote may be changed until voting ends.
- Not voting has no penalty.
- Vote totals/results are hidden during voting.
- Players outside Council may see that “Council is deliberating”.
- Players outside Council do not need to see proposals or live vote counts.
- After voting ends, at least the selected Server Event may be shown publicly.
- The E1 estate holder is the tiebreaker, not every hero with Basileus rank.
- A hero with Basileus rank outside E1 is not the tiebreaker.
- E1 may be lore-associated with the royal palace, but the tiebreaker comes from holding E1.
- Council voting may start only when at least 20 estate addresses in district D are occupied on the server.
- The 20 occupied-D threshold is an activation threshold for Council voting, not a hard member cap.
- Council size comes from actual D/E occupancy and eligibility.

## Future compatibility

Server Council voting connects to Server Events.

Future/default voting direction:

- proposal count default: 5 Server Event proposals;
- voting duration default: 3 days;
- start rule after voting is configurable by DB/admin:
  - chosen weekday, or
  - X days after voting ends;
- if tied and E1 holder voted for one of the tied options, E1 vote breaks the tie;
- if no E1 holder / no eligible E1 vote resolves the tie, run 24h runoff among tied options;
- if runoff remains tied, randomly select among still-tied options only.

Do not implement broader politics in Epic AA.

---

## Task AA0 — Server Council DB/types preflight

**Goal:**  
Confirm that the current generated Supabase types expose the Server Council DB/RPC contracts required by Epic AA.

**Scope:**

- Inspect generated database types.
- List available Council tables/views/RPCs/read models.
- Compare available contracts against Epic AA hard dependencies.
- Report missing contracts as DB/RPC blockers.
- Do not create frontend fallback interfaces for missing contracts.
- Do not implement UI.
- Do not edit or regenerate generated types.

**Out of scope:**

- No Angular implementation.
- No DB/RPC changes.
- No generated type regeneration.
- No temporary mock models.
- No status docs updates.

**Acceptance criteria:**

- Available Council contracts are listed.
- Missing contracts are listed as blockers.
- No frontend fallback models are created.
- Codex clearly states whether AA1 can start.

**Verification:**

- `npx tsc --noEmit` only if code was touched; otherwise not applicable.
- No build required if this is report-only.

**Required report:**

- available Council tables/views/RPCs:
- missing contracts:
- generated types status:
- blocker / ready verdict:
- no files changed unless explicitly needed.

---

## Task AA1 — Server Council read models and mapper layer

**Goal:**  
Add typed frontend models/mappers/services for Server Council eligibility, council state, voting sessions, proposals, votes and public council status.

**Scope:**

- Use AA0 results.
- Read generated DB types and migrator-provided read models/RPCs.
- Add explicit domain/read models for:
  - `ServerCouncilEligibility`;
  - `ServerCouncilMember`;
  - `ServerCouncilVotingSession`;
  - `ServerCouncilProposal`;
  - `ServerCouncilVoteState`;
  - `ServerCouncilPublicStatus`;
  - `ServerCouncilResult`;
  - `ServerCouncilTieBreakState` if exposed.
- Keep council-member, public-player and admin/debug models separate where DB exposes them separately.
- Do not expose raw generated rows to components.
- Do not calculate Council eligibility in Angular.
- Do not calculate winners/tiebreaks in Angular.
- Do not infer D/E/E1 membership from client-side address strings if DB exposes canonical eligibility.
- Use selected server context and active hero context where hero-specific Council state is loaded.
- Do not query Council state from `auth.uid()` as if it were `hero.id`.

**Out of scope:**

- No DB/RPC changes.
- No generated type regeneration.
- No UI screen beyond mapper/service tests if needed.
- No voting UI yet.
- No status docs updates.

**Acceptance criteria:**

- Typed Council read models exist.
- Player-safe/public status model does not expose vote counts or proposal details unless DB explicitly exposes them.
- Council-member model exposes proposals and own vote state where allowed.
- Admin/debug model may expose technical fields only if DB read path provides them.
- Missing DB contracts are reported as blockers, not faked.
- No `hero.id === auth.uid()` assumption is introduced.

**Verification:**

- `npx tsc --noEmit`
- focused mapper/service specs if added
- `npm run build`

**Required report:**

- reused / checked but not reused / new;
- DB/RPC contracts consumed;
- public-safe vs council-member vs admin/debug fields;
- generated types changed: no.

---

## Task AA2 — Council eligibility and member status display

**Goal:**  
Show whether the current hero is eligible to participate in Council voting.

**Scope:**

- Use AA1 read model.
- Use selected server -> active hero context.
- In a suitable player/game surface, show:
  - whether Council voting is currently available on the selected server;
  - whether the current active hero is a Council member;
  - if not eligible, a DB-sourced reason where available.
- Eligibility should account for:
  - current D/E estate ownership;
  - active/suspended/banned membership;
  - Prestige voting eligibility;
  - occupied-D threshold for Council activation.
- If Council is not active because fewer than 20 D estates are occupied, show a neutral explanation where DB exposes it.
- Do not calculate D occupancy or membership client-side.
- Do not query by auth user id as hero id.

**Out of scope:**

- No vote casting.
- No proposal display.
- No public result page.
- No admin/debug.

**Acceptance criteria:**

- Eligible Council member can see their status.
- Non-eligible player gets clear explanation or neutral unavailable state.
- Suspended/banned player is not shown as eligible.
- Less-than-20-D-occupied state does not look like an error.
- No Angular-side eligibility calculation.
- No `hero.id === auth.uid()` assumption.

**Verification:**

- `npx tsc --noEmit`
- focused specs if touched
- `npm run build`

**Manual smoke:**

- Hero in D/E and eligible → Council status visible.
- Hero not in D/E → not eligible.
- Suspended/banned membership → not eligible.
- Server below 20 occupied D estates → Council not active/available.

---

## Task AA3 — Council voting proposal surface

**Goal:**  
Show active Council voting proposals to eligible Council members.

**Scope:**

- Use AA1 read model.
- If an active voting session exists and current hero is eligible, show:
  - voting session title/status;
  - voting end time;
  - proposed Server Events, default 5 if DB provides that many;
  - lore name and description;
  - concise effect summary from DB/read model;
  - current own vote if already cast.
- Do not show live vote totals.
- Do not show proposals to non-Council public UI unless DB/product later explicitly exposes them.
- Use selected server context and stale guards.

**Out of scope:**

- No vote casting; that is AA4.
- No live results.
- No admin proposal generation.
- No Server Event editor.
- No Council history.

**Acceptance criteria:**

- Eligible Council member can view proposals for active voting.
- Non-eligible player cannot view proposal details through this surface.
- Live vote totals are hidden during voting.
- Proposal event copy/effects are DB-backed.
- Stale selected-server responses are ignored.

**Verification:**

- `npx tsc --noEmit`
- focused specs if touched
- `npm run build`

**Manual smoke:**

- Eligible D/E hero opens active voting → proposals visible.
- Non-Council hero opens same surface → no proposal details.
- Live vote totals are not visible.

---

## Task AA4 — Cast and change Council vote

**Goal:**  
Allow eligible Council members to cast or change their vote before voting ends.

**Scope:**

- Use canonical DB/RPC vote cast/change operation.
- Use `request_id`/idempotency if the vote RPC exposes it.
- Each eligible hero has one active vote per voting session.
- Voting on another option before close changes the vote.
- UI should show pending state and refreshed own vote after save.
- Voting is disabled after voting ends.
- Voting is disabled if eligibility is lost.
- Use stale guards for selected server, active hero, session id and hero context.
- Do not direct-write vote tables.

**Out of scope:**

- No DB/RPC changes.
- No winner calculation.
- No tiebreak calculation.
- No live vote totals.
- No admin override.

**Acceptance criteria:**

- Eligible member can cast vote.
- Eligible member can change vote before end.
- Ineligible member cannot vote.
- Vote mutation uses canonical RPC.
- If RPC exposes request id/idempotency, UI uses it.
- UI does not calculate or expose winner.
- Stale responses do not overwrite current session state.

**Verification:**

- `npx tsc --noEmit`
- focused action/state specs if touched
- `npm run build`

**Manual smoke:**

- Cast vote on proposal A.
- Change vote to proposal B.
- Reload and confirm own vote state.
- Attempt after voting end → blocked.
- Attempt after eligibility loss → blocked.

---

## Task AA5 — Public Council deliberation and result display

**Goal:**  
Show simple public Council state to non-Council players without exposing hidden vote details.

**Scope:**

- Use public-safe Council read model from AA1.
- If voting is active, show a public message such as “Council is deliberating”.
- Do not show proposal list or live vote totals to normal public/player UI.
- After voting completes, show at least the selected Server Event if DB exposes the result.
- If no Council voting is active, show neutral absent state or omit according to existing UI pattern.
- Do not create a full Council public archive.

**Out of scope:**

- No Council member proposal list.
- No vote totals during voting.
- No debate/public comments.
- No history/archive unless DB already exposes a simple result list and task stays tiny.

**Acceptance criteria:**

- Non-Council players can see that Council is deliberating.
- Non-Council players do not see live proposals/vote counts.
- Completed result can show selected event.
- Public model remains player-safe.

**Verification:**

- `npx tsc --noEmit`
- focused specs if touched
- `npm run build`

**Manual smoke:**

- Non-Council player during active vote → sees deliberation message.
- Non-Council player after vote → sees selected event if DB exposes it.
- No live vote totals visible.

---

## Task AA6 — Council result/tiebreak display for members/admin

**Goal:**  
Display completed Council voting result and tiebreak/runoff outcome where DB exposes it.

**Scope:**

- Use DB result read model.
- For Council members/admin surfaces, show:
  - winning event;
  - whether vote was resolved normally, by E1 tiebreak, runoff or random fallback;
  - final status;
  - own vote;
  - final counts only after voting is complete, if DB exposes them.
- Do not calculate tiebreaks in Angular.
- Do not infer E1 tiebreak resolution client-side from estate/vote data.
- Display DB-sourced `resolutionMode`, `tieBreakSource`, `tieBreakHeroId`, `runoffStatus`, or equivalent fields only if DB exposes them.
- Do not reveal hidden intermediate live totals.
- If DB does not expose final counts/tiebreak detail, show only available result and report follow-up.

**Out of scope:**

- No tiebreak implementation.
- No runoff implementation.
- No random selection logic.
- No admin override.
- No public full archive.

**Acceptance criteria:**

- Completed result is readable to allowed users.
- E1 tiebreak/runoff/random fallback status displays if DB exposes it.
- Angular does not calculate winner or tiebreak.
- Angular does not infer E1 vote behavior from raw vote data.
- Final counts are shown only after completion.

**Verification:**

- `npx tsc --noEmit`
- focused result mapper/display specs if touched
- `npm run build`

**Manual smoke:**

- Open completed Council vote.
- Confirm winning event is visible.
- Confirm resolution mode is visible if exposed.
- Confirm no live-count leakage before completion.

---

## Task AA7 — Admin/debug Council surface

**Goal:**  
Expose Council eligibility, sessions and vote/debug state to authorized admin/tester surfaces.

**Scope:**

- Use admin/debug DB read models only.
- Show:
  - current D/E Council member list;
  - eligibility reasons;
  - occupied D count and activation threshold;
  - active/completed voting sessions;
  - proposals;
  - vote counts/status where allowed;
  - tiebreak/runoff/random fallback diagnostics.
- Keep normal player UI separate.
- Respect server staff/admin access.
- Admin/debug surface is inspection-only unless a separate governed correction RPC is explicitly provided and separately tasked.

**Out of scope:**

- No manual vote editing.
- No DB session creation unless migrator provides governed admin/test RPC and user asks in a separate task.
- No council rule editing unless DB/config surface exists and task scope includes it.
- No Server Event definition editing.
- No admin override hidden inside debug surface.

**Acceptance criteria:**

- Admin/tester can inspect Council state.
- Admin view shows why a hero is or is not eligible.
- Player-facing services/components do not import admin/debug models.
- Missing DB diagnostics are reported as follow-up.
- No vote/session correction UI is added without separate governed RPC and explicit task.

**Verification:**

- `npx tsc --noEmit`
- focused admin specs if touched
- `npm run build`
- static check that admin debug service is not used by player-facing components.

**Manual smoke:**

- Open Council admin/debug surface.
- Confirm D/E members and eligibility reasons.
- Confirm occupied D count and threshold.
- Confirm active/completed vote status.

---

## Task AA8 — Council integration smoke and cleanup candidates

**Goal:**  
Perform final frontend integration pass for Council voting.

**Scope:**

- Walk through:
  - below-threshold server state;
  - eligible Council member state;
  - non-eligible player state;
  - active vote proposal view;
  - cast/change vote;
  - public deliberation state;
  - completed result display;
  - admin/debug inspection.
- Fix small integration issues within Council scope.
- Report cleanup candidates:
  - hardcoded D/E thresholds;
  - direct estate/rank membership inference in Angular;
  - live vote count leaks;
  - duplicate event proposal display logic;
  - old placeholder Council/politics UI if any.
- Do not implement broader politics.

**Out of scope:**

- No DB/RPC changes.
- No Server Event runtime changes.
- No taxes, budgets, vetoes, debates, guild governance or elections.
- No status docs updates.

**Acceptance criteria:**

- Council member can vote.
- Non-member cannot vote.
- Public players see deliberation/result safely.
- Results are hidden during voting.
- E1 tiebreak/fallbacks are display-only from DB result.
- No Angular-side winner/tiebreak calculation.
- No live vote totals leak before completion.

**Verification:**

- `npx tsc --noEmit`
- focused specs for touched areas
- `npm run build`
- static grep:
  - no direct writes to Council vote/session tables;
  - no Angular-side winner calculation;
  - no hardcoded Council member list;
  - no public live vote count.

**Manual smoke:**

- Server below 20 occupied D estates → Council voting unavailable.
- Eligible D/E hero → sees voting surface.
- Eligible hero casts and changes vote.
- Non-Council hero → sees only safe public state.
- Completed vote → selected event visible.
- Admin debug → eligibility/session/result visible.

---

---

# Epic AB — Manual Trial Minigame Shell/Core

**Status:** Blocked until Manual Trial Runtime DB/RPC foundation exists and generated Supabase types are current.

**Execution note:** AB0 is allowed while blocked; AB1+ are blocked until AB0 confirms the required DB/RPC/generated-type contracts are present.

## Epic goal

Wdrożyć frontendową integrację wspólnego **Manual Trial Minigame Shell/Core** dla manualnych Triali.

Manual Trial Core nie jest konkretną minigierką. Jego zadaniem jest przygotowanie wspólnego hosta i workflow dla przyszłych minigier: Trial Offer, Manual Runtime Session, Manual Runtime Manifest, Action Log, Backend Verdict, result/report handoff, fail-closed unsupported renderer, exit/inactivity behavior i renderer registry.

Konkretne minigry, takie jak Apollo / Path of Light, Hermes / Shifting Seals, Zeus / Storm Charge, Hephaestus / Divine Forge, Hera / Maze, Artemis / Harpy Hunt, Athena / Scales of Judgment i Aphrodite / Graces' Court, są poza zakresem Epic AB i powinny dostać osobne epiki/mini-epiki po Core.

## Hard dependency

Do not start AB1+ implementation tasks in this Epic until migrator confirms the Manual Trial Runtime DB/RPC foundation exists and generated Supabase types are current.

AB0 may run before the foundation exists because its job is to audit current DB/RPC/generated-type readiness and report exact blockers.

Required DB/RPC/read-model contracts:

- player-safe Trial Offer read model for the active unresolved Trial;
- manual/auto boundary for the same locked Trial attempt;
- start Manual Runtime Session RPC;
- Manual Runtime Manifest read model/RPC;
- Action Log submit RPC;
- Backend Verdict/result RPC or read model;
- auto-resolve workflow for:
  - direct player choice;
  - offer inactivity timeout;
  - explicit manual exit;
  - manual inactivity timeout where applicable;
- status/outcome/resolution-mode/failure-reason semantics;
- report/reward/result handoff;
- player-safe report summary or report reference;
- stale/session/attempt guards;
- DB-owned timeout/inactivity policy;
- generated Supabase types exposing all required rows/args/returns.

If any required contract is missing from generated types, stop and report DB/RPC blocker.

Codex must not create Angular fallback models, mock RPCs, direct table reads/writes or manual generated-row interfaces to hide missing DB/RPC contracts.

## Canonical decisions

- Trial identity is locked before the player chooses manual resolve or auto-resolve.
- Trial Offer shows the active Trial and allows manual resolve or auto-resolve.
- Manual Runtime Session starts only after the player chooses manual resolve.
- Auto-resolve does not create or require a Manual Runtime Manifest.
- Manual Runtime Manifest is backend-owned and defines the runtime state/config for one manual minigame session.
- Frontend renders the manual minigame from the manifest.
- Frontend submits Action Log, not final success/fail authority.
- Backend is the authority for outcome, failure reason, reward and report.
- Backend must be able to replay/validate the Action Log against the manifest.
- UI must not show final success/reward before Backend Verdict returns.
- Timing/continuous minigames must use a deterministic manifest model shared by frontend and backend.
- Hidden safety margin may exist in DB/backend/manifest policy, but it is not player-facing.
- Player-facing UI should show bars, thresholds, timers and state, not raw replay math.
- There is no normal durable `abandoned` outcome.
- Every resolved Trial must have an outcome.
- Every failed Trial must have a failure reason at least for debug/admin/reporting.
- Explicit exit from manual resolve triggers a warning and then auto-resolve if confirmed.
- Offer inactivity timeout triggers ordinary auto-resolve.
- Timer expiration inside a timer-based manual minigame is a manual fail, usually `time_expired`.
- Non-timer manual minigames may use inactivity timeout that triggers auto-resolve.
- Reports use a shared shape: intro/lore → replay-lite/timeline/summary → outcome → reward.
- Technical replay log is source-of-truth/debug data; player/public reports show safe replay-lite or summary.
- Ares/combat is not a Manual Minigame renderer; it uses combat wrapper/result handoff around the generic combat engine.
- Apollo / Path of Light may be considered an early proof-of-path candidate after Core, but concrete Apollo mechanics are not implemented in Epic AB.

## Epic rules

- Use canonical domain words: Trial, Manual Runtime Session, Manual Runtime Manifest, Action Log, Backend Verdict, Auto Resolve, Report.
- Do not use player-facing “Challenge” wording for new UI unless current DB/internal naming forces it in technical metadata.
- Do not implement Apollo, Hermes, Zeus, Hephaestus, Hera, Artemis, Athena or Aphrodite gameplay in Epic AB.
- Do not create hardcoded minigame configs in Angular.
- Do not calculate manual Trial outcome in Angular.
- Do not calculate rewards in Angular.
- Do not generate reports in Angular as authority.
- Do not direct-read or direct-write manual Trial runtime tables if DB exposes canonical RPC/read models.
- Do not edit or regenerate `database.types.ts`.
- If generated types are missing or stale, report a DB/types blocker.
- Keep player-safe models separate from admin/debug/replay technical data.
- Preserve selected server → active hero → active Trial context.
- Do not assume `hero.id === auth.uid()`.
- Use existing exploration/report/reward services and patterns where possible.
- Add `reused / checked but not reused / new` report section for any new helper, mapper, state or service.
- Do not update `current-todo.md`, `current-state-summary.md` or backlog/status docs.

---

## Task AB0 — Manual Trial Core DB/types preflight

**Goal:**  
Confirm which Manual Trial Core DB/RPC/generated-type contracts are available and which are still blockers for Epic AB implementation.

**Scope:**

- Read:
  - `AGENTS.md`;
  - `docs/current-decisions.md`;
  - `docs/project-context.md`;
  - `docs/database-current.md`;
  - this Epic AB section.
- Inspect current generated Supabase types without editing them.
- Inspect current exploration/trial/report services and existing RPC usage.
- List available contracts for:
  - active Trial Offer;
  - manual/auto resolve boundary;
  - start Manual Runtime Session;
  - get Manual Runtime Manifest;
  - submit Action Log;
  - Backend Verdict/result;
  - auto-resolve from offer/manual exit/inactivity;
  - report/reward handoff;
  - status/outcome/resolution-mode/failure-reason fields.
- List missing or ambiguous contracts as DB/RPC blockers.
- Do not implement UI.
- Do not add frontend fallback models.
- Do not create temporary manual RPC interfaces.

**Out of scope:**

- No Angular implementation.
- No DB/RPC changes.
- No generated type regeneration.
- No mock manifest.
- No Apollo or concrete minigame implementation.
- No status docs updates.

**Acceptance criteria:**

- Available Manual Trial contracts are listed.
- Missing Manual Trial contracts are listed as blockers.
- Ambiguous contracts are called out with exact file/type/RPC references where possible.
- Codex clearly states whether AB1 can start.
- No frontend fallback models are created.
- No generated types are edited.

**Verification:**

- `npx tsc --noEmit` only if files were changed; otherwise not applicable.
- No build required if this is report-only.

**Required report:**

- available DB/RPC/generated contracts:
- missing contracts:
- ambiguous contracts:
- existing exploration/report services checked:
- generated types status:
- blocker / ready verdict:
- files changed: `none` unless explicitly justified.

---

## Task AB1 — Manual Trial Core domain models and mapper envelopes

**Goal:**  
Add typed frontend domain models and mapper envelopes for Manual Trial Core once DB/RPC contracts exist.

**Gate:**  
Do not start AB1 unless AB0 verdict is ready and names exact generated RPC/table/return contracts to consume.

**Scope:**

- Use AB0 results and migrator-provided generated types.
- Add typed domain/read models for:
  - `TrialOffer`;
  - `ManualTrialSession`;
  - `ManualRuntimeManifest`;
  - `ManualTrialActionLogEnvelope`;
  - `ManualTrialBackendVerdict`;
  - `ManualTrialOutcome`;
  - `ManualTrialResolutionMode`;
  - `ManualTrialFailureReason`;
  - `ManualTrialReportSummary`;
  - `ManualTrialRewardSummary` where DB exposes it.
- Add mapper helpers from generated RPC rows/returns to domain models.
- Preserve `manifestVersion`, `manifestHash` or equivalent validation identity if DB exposes them.
- Preserve `minigameKey` as renderer selection input.
- Preserve player-safe fields separately from admin/debug/replay fields.
- Represent minigame-specific config as opaque/typed-enough payload for future renderers; do not model Apollo/Hermes/etc. yet.
- Add focused mapper tests.

**Out of scope:**

- No UI page.
- No route changes.
- No real minigame renderer.
- No DB/RPC changes.
- No generated type edits.
- No Angular fallback contract if generated types are missing.
- No status docs updates.

**Acceptance criteria:**

- Manual Trial Core domain models exist outside components.
- Mappers do not expose raw generated rows to components.
- Mapper tests cover:
  - Trial Offer;
  - Manual Runtime Manifest;
  - Action Log envelope shape;
  - Backend Verdict with success;
  - Backend Verdict with failure reason;
  - player-safe report summary.
- Technical replay/debug fields do not leak into player-facing models unless explicitly exposed as safe summary by DB.
- Missing generated contracts are reported as blockers.

**Verification:**

- focused mapper specs
- `npx tsc --noEmit`
- `npm run build`

**Required report:**

- reused:
- checked but not reused:
- new model/mapper files:
- generated contracts consumed:
- blockers:
- verification results:

---

## Task AB2 — Manual Trial Core read/action services

**Goal:**  
Add core services for loading Trial Offer, starting manual sessions, submitting Action Logs, triggering auto-resolve and receiving Backend Verdicts.

**Scope:**

- Use AB1 models and generated RPC types.
- Add or extend core services for:
  - loading active Trial Offer for the active hero;
  - starting Manual Runtime Session;
  - loading/receiving Manual Runtime Manifest;
  - submitting Action Log envelope;
  - triggering auto-resolve;
  - handling Backend Verdict;
  - linking to report/result handoff.
- Use selected server and active hero context.
- Add stale guards for:
  - active hero change;
  - selected server change;
  - Trial attempt/session change;
  - outdated RPC responses.
- Generate request ids only where DB/RPC contract supports idempotency/request id.
- Do not calculate outcome locally.
- Do not calculate reward locally.
- Do not direct-read or direct-write trial runtime tables.
- Add focused service tests.

**Out of scope:**

- No UI page.
- No real minigame renderer.
- No Apollo/Hermes/etc.
- No DB/RPC changes.
- No generated type edits.
- No status docs updates.

**Acceptance criteria:**

- Services call only canonical DB/RPC contracts.
- Missing RPC/generated type causes blocker, not fallback.
- Stale responses cannot update current state after hero/server/session changes.
- Action Log submit returns/loads Backend Verdict from backend.
- Auto-resolve uses backend workflow.
- No Angular-side durable outcome/reward/report calculation is introduced.
- Tests cover success, failure verdict, stale context and missing/empty row behavior where applicable.

**Verification:**

- focused service specs
- `npx tsc --noEmit`
- `npm run build`
- static grep:
  - no direct writes to trial/runtime tables;
  - no direct `.from(...)` reads for Manual Trial runtime if canonical RPC exists;
  - no hardcoded minigame config as runtime source.

**Required report:**

- reused:
- checked but not reused:
- new services/helpers:
- RPCs consumed:
- stale guards:
- blockers:
- verification results:

---

## Task AB3 — Manual Trial Host route/page shell

**Goal:**  
Create the player-facing Manual Trial Host shell for Trial Offer, manual/auto boundary, manual session loading, unsupported minigame state, Backend Verdict and report handoff.

**Scope:**

- Add or extend the appropriate game route/page for active manual Trial resolution.
- Show Trial Offer state:
  - trial name/label where DB exposes it;
  - deity/stat/difficulty where DB exposes it;
  - player-safe helper text;
  - Manual Resolve action;
  - Auto Resolve action.
- Start Manual Runtime Session only after Manual Resolve.
- Load/display Manual Runtime Manifest state after session start.
- Select renderer through registry by `minigameKey`.
- If renderer is missing, show a clear fail-closed unsupported state.
- Support generic shared HUD slots from manifest where exposed:
  - timer/countdown;
  - mistakes/attempts;
  - required successes;
  - status/progress.
- Show submitting/resolving state while Backend Verdict is pending.
- Show backend outcome/result summary after Backend Verdict.
- Link or hand off to report/result view where DB/read model exposes it.
- Add explicit exit warning:
  - leaving manual resolve triggers warning;
  - confirmed exit triggers backend auto-resolve if RPC exists.
- Use the narrowest existing in-app navigation guard/pattern available.
- Do not introduce a global unsaved-changes/navigation framework unless explicitly approved.
- Use existing UI/shared patterns where possible.
- Keep UI player-safe; no raw replay/debug payloads.

**Out of scope:**

- No concrete minigame gameplay.
- No Apollo implementation.
- No custom large visual redesign.
- No DB/RPC changes.
- No generated type edits.
- No status docs updates.

**Acceptance criteria:**

- Player can see Trial Offer and choose manual or auto when DB exposes active Trial.
- Manual path loads manifest and renderer boundary.
- Missing renderer does not fake gameplay and does not crash the app.
- Auto path calls backend auto-resolve workflow.
- UI does not show final success/reward before Backend Verdict.
- UI does not expose raw `trial_power`.
- Exit warning is present for manual session navigation where feasible.
- No concrete minigame appears in this task.

**Verification:**

- focused component/page specs where practical
- `npx tsc --noEmit`
- `npm run build`
- route smoke if app can run locally

**Manual smoke:**

- Active Trial Offer appears.
- Manual Resolve loads manual session/manifest or reports DB blocker clearly.
- Auto Resolve completes through backend workflow or reports DB blocker clearly.
- Unsupported `minigameKey` shows fail-closed state.
- Leaving during manual resolve shows warning where supported.
- Backend Verdict controls final result display.

**Required report:**

- reused:
- checked but not reused:
- new component/state/helper added:
- DB/RPC contracts consumed:
- unsupported renderer behavior:
- manual smoke status:
- pending manual smoke:
- verification results:

---

## Task AB4 — Manual Trial renderer registry and Action Log boundary

**Goal:**  
Add the renderer registry and generic Action Log boundary that future concrete minigames will use.

**Scope:**

- Add a Manual Trial renderer registry keyed by `minigameKey`.
- Define a renderer contract/interface for:
  - consuming Manual Runtime Manifest;
  - emitting Action Log events/envelope;
  - reporting local observed summary if needed;
  - surfacing local UI state to the host without claiming final outcome.
- Add placeholder/fail-closed renderer behavior for unsupported minigames.
- A test/dummy renderer may exist only for registry wiring tests and must not simulate gameplay success/failure.
- Add host-side generic Action Log submit boundary.
- Add hooks/placeholders for:
  - timer policy;
  - inactivity policy;
  - heartbeat/activity signal where needed;
  - hidden safety-margin compatibility where manifest exposes it.
- Ensure the registry can later add Apollo/Hermes/etc. without changing host lifecycle.
- Add focused tests for renderer selection and unsupported renderer behavior.

**Out of scope:**

- No Apollo renderer.
- No Hermes/Zeus/Hephaestus/Hera/Artemis/Athena/Aphrodite renderer.
- No minigame-specific action semantics beyond generic envelope.
- No dummy renderer simulating success/failure gameplay.
- No DB/RPC changes.
- No generated type edits.
- No status docs updates.

**Acceptance criteria:**

- Host can select renderer by `minigameKey`.
- Unsupported keys are handled fail-closed and player-safe.
- Renderer contract cannot provide final durable outcome as authority.
- Action Log boundary routes submit through backend service.
- A test/dummy renderer, if present, exists only for registry wiring tests and must not simulate gameplay success/failure.
- Future concrete renderers can plug into the registry without duplicating Trial Offer/manual session/result lifecycle.
- Tests cover registry lookup and unsupported renderer behavior without introducing pseudo-gameplay.

**Verification:**

- focused registry/host specs
- `npx tsc --noEmit`
- `npm run build`

**Required report:**

- reused:
- checked but not reused:
- new registry/interfaces/helpers:
- unsupported behavior:
- future renderer integration notes:
- verification results:

---

## Task AB5 — Manual Trial timeout, inactivity and exit behavior

**Goal:**  
Implement frontend-side handling for offer inactivity, manual inactivity hooks and explicit exit warning according to DB-owned policies.

**Scope:**

- Consume DB/manifest-provided timeout/inactivity policies where available.
- Do not hardcode permanent timeout values in Angular.
- Track meaningful player/session activity where needed by the host.
- In Trial Offer:
  - if DB exposes inactivity timeout behavior, surface safe UI state and let backend resolve timeout;
  - do not create a client-only timer as authority.
- In Manual Runtime Session:
  - timer-based minigame expiration must be backend/verdict-owned;
  - non-timer inactivity should trigger backend auto-resolve only through DB/RPC workflow where exposed.
- Implement explicit navigation/exit warning inside the app where feasible.
- Use the narrowest existing in-app navigation guard/pattern available.
- Do not introduce a global unsaved-changes/navigation framework unless explicitly approved.
- Confirmed exit calls backend auto-resolve workflow if DB exposes it.
- Add tests for warning/confirm/cancel behavior and stale context.
- Do not attempt to protect every browser crash; backend timeout/finalization is authority.

**Out of scope:**

- No DB scheduler/cron implementation.
- No backend timeout finalizer.
- No local outcome calculation.
- No concrete minigame timer logic.
- No global navigation/unsaved-changes framework unless explicitly approved.
- No status docs updates.

**Acceptance criteria:**

- Angular does not hardcode durable timeout/inactivity values.
- Explicit exit warning is clear.
- Confirmed exit uses backend auto-resolve workflow.
- Cancelled exit returns to manual trial state.
- Timer expiration is not treated as frontend-owned final outcome.
- Inactivity behavior does not leave a normal `abandoned` outcome.
- Missing DB/RPC timeout support is reported as blocker/follow-up, not faked.

**Verification:**

- focused state/component specs
- `npx tsc --noEmit`
- `npm run build`

**Manual smoke:**

- Start manual resolve and attempt in-app navigation.
- Confirm exit warning appears.
- Cancel keeps session visible.
- Confirm triggers backend auto-resolve if available.
- No final result appears before backend verdict.

**Required report:**

- timeout/inactivity contracts consumed:
- exit warning behavior:
- stale guards:
- blockers:
- manual smoke status:
- verification results:

---

## Task AB6 — Manual Trial verdict, report and reward handoff

**Goal:**  
Display Backend Verdict and hand off to report/reward/result views without Angular becoming the authority.

**Scope:**

- Consume Backend Verdict from DB/RPC service.
- Display player-safe outcome summary:
  - success/fail;
  - player-safe reason where DB exposes it;
  - resolution mode where player-safe;
  - reward summary where DB exposes it;
  - report link/reference where DB exposes it.
- Preserve technical replay/debug reference only for admin/debug paths if exposed separately.
- Do not generate report content locally as authority.
- Do not calculate reward locally.
- Do not expose raw IDs, raw replay JSON, manifest hash, seed or staff/debug fields to player UI.
- Add fallback player-safe display for missing optional summary fields, but not for missing required verdict/report contracts.
- Optional display fallback may hide/label missing optional fields; it must not synthesize outcome, reward, report id, reason or resolution mode.
- Add focused mapper/display tests.

**Out of scope:**

- No public report page redesign.
- No concrete minigame replay-lite design.
- No Apollo timeline/replay.
- No DB/RPC changes.
- No generated type edits.
- No status docs updates.

**Acceptance criteria:**

- Backend Verdict controls final outcome display.
- Reward/report data is consumed from DB/read model.
- Technical replay/debug fields do not leak to player-facing UI.
- Missing required report/verdict contracts are blockers.
- Optional display fallback may hide/label missing optional fields but must not synthesize outcome, reward, report id, reason or resolution mode.
- Player can navigate to existing report/detail route if DB/read model exposes one.
- Report display follows shared shape: intro/lore → summary/replay-lite slot → outcome → reward where available.

**Verification:**

- focused mapper/display specs
- `npx tsc --noEmit`
- `npm run build`

**Manual smoke:**

- Complete/auto-resolve a Trial with backend verdict.
- Confirm outcome appears only after backend verdict.
- Confirm reward summary/report link appears if DB exposes it.
- Confirm no raw debug/replay payload appears in player UI.

**Required report:**

- verdict contracts consumed:
- report/reward contracts consumed:
- player-safe fields:
- debug/admin fields excluded:
- manual smoke status:
- verification results:

---

## Task AB7 — Manual Trial Core integration smoke and final report

**Goal:**  
Perform final integration pass for Manual Trial Core after AB1–AB6 and produce remaining DB/UI follow-up notes.

**Scope:**

- Walk through available Manual Trial Core paths:
  - no active Trial;
  - active Trial Offer;
  - Manual Resolve;
  - manifest loading;
  - unsupported renderer;
  - Auto Resolve;
  - explicit exit to auto-resolve;
  - Backend Verdict;
  - report/reward handoff.
- Fix small integration issues inside AB scope.
- Report DB/RPC gaps that block full runtime smoke.
- Report follow-up tasks needed for first concrete minigame epic.
- Confirm no concrete minigame was accidentally implemented.
- Confirm no Angular-side outcome/reward/report authority was added.
- Confirm no direct table writes/reads were added for Manual Trial runtime where RPC exists.
- Do not update status docs.

**Out of scope:**

- No Apollo/Hermes/etc. implementation.
- No DB/RPC changes.
- No generated type regeneration.
- No status docs updates.
- No broad exploration refactor.
- No UI redesign.

**Acceptance criteria:**

- Manual Trial Core host works as far as current DB/RPC contracts allow.
- Unsupported minigames fail closed and do not fake gameplay.
- Manual/auto boundary is clear.
- Backend Verdict controls final outcome.
- Report/reward handoff is wired where DB exposes it.
- All remaining blockers are concrete and actionable.
- Next concrete minigame epic can start planning with clear dependencies.

**Verification:**

- `npx tsc --noEmit`
- focused specs for touched areas
- `npm run build`
- static grep:
  - no direct writes to trial/manual runtime tables;
  - no Angular-side outcome calculators;
  - no hardcoded durable minigame config;
  - no concrete Apollo/Hermes/etc. renderer implemented in AB.

**Manual smoke:**

- No active Trial → neutral/no-active-trial state.
- Active Trial → Trial Offer visible.
- Manual Resolve → manifest/unsupported renderer state visible.
- Auto Resolve → backend workflow called.
- Explicit exit → warning then auto-resolve if confirmed.
- Backend Verdict → final outcome/report handoff visible.
- Confirm player UI does not expose raw `trial_power`, manifest seed/hash or debug replay JSON.

**Required report:**

- implemented AB scope:
- reused:
- checked but not reused:
- DB/RPC contracts consumed:
- missing/blocking contracts:
- static grep results:
- verification results:
- manual smoke completed:
- pending manual smoke:
- next recommended concrete minigame epic:
- confirmation that no status docs were updated:

---

# Epic AZ — Appeals and future moderation extensions

## Task AZ1 — Appeals parked design note

**Goal:** Keep appeal concept available without implementing yet.

**Scope:**

- Document that sanctions can later have formal appeals.
- Current statuses `cancelled` and `forgiven` support manual changes meanwhile.

**Acceptance criteria:**

- No appeal system is built prematurely.

---

## Task AZ2 — Future relationship/report types as configurable dictionaries

**Goal:** Ensure future types like mercenary/equipment rental remain configurable.

**Scope:**

- Do not hardcode future declaration/report types.
- Admin UI should load active DB rows.

**Acceptance criteria:**

- New types can be added later through dictionaries/config without frontend enum edits.

---
## Task HOTFIX-COMBAT-1 — Podłącz DB-owned combat resolver do exploration Trial/Encounter

**Goal:** Exploration Trial/Encounter z `minigame_key = combat` ma uruchamiać combat UI i kończyć walkę przez canonical DB RPC `submit_exploration_challenge_combat_resolution(...)`.

**Scope:**

- Sprawdź aktualny model aktywnego Triala/Encountera w `/game/exploration`.
- Gdy aktywny Trial/Encounter ma `minigame_key = combat`, nie traktuj go jako zwykły resolved/no-op state.
- Pokaż istniejący combat/timing UI albo najbliższy istniejący komponent walki, który da się bezpiecznie użyć.
- Po manualnym input gracza wywołaj canonical RPC:

  `submit_exploration_challenge_combat_resolution(challenge_attempt_id, timing_hits_json, request_id)`

- Nazwy argumentów RPC weź z aktualnych wygenerowanych `database.types.ts`; nie zgaduj, czy mają prefiks `p_`.
- Frontend wysyła wyłącznie:
  - `challenge_attempt_id`;
  - `timing_hits_json`;
  - `request_id`.
- Frontend nie wysyła:
  - statów;
  - equipment;
  - luck;
  - damage;
  - opponent data;
  - final outcome.
- DB jest autorytetem walki.
- Po sukcesie RPC zapisz/odśwież stan exploration na podstawie pól zwróconych przez RPC:
  - `combat_result_id`;
  - `outcome`;
  - `success`;
  - `status`;
  - `completion_mode`;
  - `reward_grant_id`;
  - `exploration_status`;
  - `remaining_trials`;
  - `turns_completed`;
  - `participants_created`;
  - `attacks_created`.
- Dla Trial/Encounter `draw` traktuj jako failure zgodnie z kontraktem DB.
- Nie używaj tego RPC dla PvP.
- Jeśli obecny frontend nadal używa generic completion RPC jako manual combat resolvera, zastąp tę ścieżkę dla `minigame_key = combat`.
- Dodaj czytelne polskie komunikaty błędów:
  - nie można uruchomić walki;
  - brak danych aktywnego Triala/Encountera;
  - RPC odrzucił próbę;
  - wynik walki nie został zapisany.

**Acceptance criteria:**

- Combat Trial/Encounter w eksploracji pokazuje UI walki zamiast martwego “ready” state.
- Manualne rozstrzygnięcie walki idzie przez `submit_exploration_challenge_combat_resolution(...)`.
- Angular nie liczy wyniku walki jako gameplay authority.
- Angular nie wysyła statów/equipment/luck/damage/opponent data.
- Po sukcesie RPC exploration state i remaining trials są odświeżone.
- Draw w PvE Trial/Encounter jest pokazany jako porażka.
- Build przechodzi.

## Task HOTFIX-COMBAT-2 — Pokaż wynik, reward i combat report po exploration combat resolution

**Goal:** Po zakończeniu combat Trial/Encounter przez DB RPC gracz widzi trwały wynik walki, reward i może kontynuować eksplorację.

**Scope:**

- Po `submit_exploration_challenge_combat_resolution(...)` pokaż wynik walki na podstawie DB-returned payload:
  - outcome;
  - success/failure;
  - completion mode;
  - turns completed;
  - reward grant id, jeśli istnieje.
- Jeśli `combat_result_id` istnieje:
  - użyj istniejącego combat result/read API, jeśli jest dostępne;
  - pokaż podstawowe informacje o walce;
  - jeśli istniejący read model pozwala, pokaż attack log / timeline.
- Jeśli nie ma istniejącego read modelu do attack logu:
  - pokaż summary z pól RPC;
  - zgłoś w raporcie DB/frontend dependency na combat result read model;
  - nie próbuj rekonstruować logu lokalnie z timing inputu.
- Odśwież reward display po `reward_grant_id`.
- Jeśli reward miał wygenerować item, pokaż wygenerowany item przez istniejący reward/item/armory read path, jeśli jest dostępny.
- Jeśli `reward_grant_id` jest null przy sukcesie albo DB zwraca informację o braku rewardu, pokaż czytelny komunikat diagnostyczny po polsku.
- Po completion odblokuj możliwość kontynuacji eksploracji zgodnie z DB state.
- Refresh strony nie może ponownie submitować walki ani duplikować rewardu.

**Acceptance criteria:**

- Po combat Trial/Encounter gracz widzi wynik walki.
- Reward display korzysta z trwałego DB reward state.
- Generated item, jeśli istnieje, jest widoczny przez istniejący item/reward path.
- Brak attack log read API nie blokuje pokazania summary, ale jest zgłoszony jako dependency.
- Refresh nie powtarza RPC i nie duplikuje rewardu.
- Gracz może kontynuować exploration po completed state.
- Build przechodzi.

## Task HOTFIX-COMBAT-3 — Reuse Walking Dead timing UI for exploration combat

**Goal:** Existing Walking Dead / green-zone combat timing UI becomes the normal manual resolver UI for exploration Combat Trial and Combat Encounter.

**Scope:**

- Locate the current sandbox combat / Walking Dead / green-zone timing UI used by `/game/combat` or combat sandbox.
- Extract or reuse the timing UI as a reusable combat minigame component/service, without making `/game/combat` the production authority.
- Keep `/game/combat` as sandbox/test caller only.
- Render the reusable timing UI from `/game/exploration` when the active Trial/Encounter has `minigame_key = combat`.
- The UI should collect only timing input needed for `timing_hits_json`.
- The UI must not compute final combat outcome, damage, evasion, crits, rewards or opponent state as gameplay authority.
- After timing input is collected, pass it to the exploration combat submit path from HOTFIX-COMBAT-1:
  `submit_exploration_challenge_combat_resolution(challenge_attempt_id, timing_hits_json, request_id)`.
- If the current Walking Dead UI depends on sandbox-only data, split the reusable timing input layer from sandbox-only preview/debug state.
- If DB/read model does not provide enough information to render the timing UI safely, report the missing DB/read contract instead of fabricating combat data in Angular.
- Use Polish-facing copy for player-visible labels/errors where touched.

**Acceptance criteria:**

- Exploration Combat Trial/Encounter renders the green-zone / Walking Dead timing UI.
- `/game/combat` still works as sandbox/test surface.
- Timing input can be submitted to the DB-owned exploration combat resolver.
- Angular sends timing input only, not stats/equipment/luck/damage/opponent data.
- Final combat result remains DB-owned.
- No sandbox-only combat state becomes production source of truth.
- Build passes.

---

## TASK HOTFIX-REWARD-AUTO-RESOLVE - Reward/drop communication and manual combat auto-resolve wording 

## Goal Fix frontend/test UI communication after manual combat 
- Trial completion so the UI does not misreport valid DB rewards or manual combat state. DB/RPC reward workflow is considered working for this fix. Do not change DB, migrations, RPC contracts or generated types. 

## Context Migrator confirmed that after a won Agility Trial the DB created: - reward_grant - reward_grant_entries - experience: 70 - character_points: 70 The UI/test panel currently shows or can show misleading copy such as:

text
No reward entries were recorded

This is wrong when XP/CP reward entries exist.

Item drops are optional. A reward profile may contain item generation with chance 100, but if min_item_count = 0 and max_item_count = 1, the final item count may legally be 0. That is not a reward failure.

Manual combat uses completion_mode = manual, so auto-resolve roll/chance is not used. Showing “not rolled” as if something failed is misleading.

Scope

Update frontend/test/debug reward/result mapping and copy for exploration challenge completion/manual combat Trial results.

Find the UI/path that renders:

reward grant/result entries after Trial/Encounter completion;
“No reward entries were recorded” or equivalent fallback;
auto-resolve roll/chance rows for challenge attempts;
manual combat completion summary/debug panel, if separate.

Use existing mappers/state/display helpers where available.

Required behavior
Player-facing UI

When XP/CP reward entries exist:

show XP/CP reward entries normally;
do not show “No reward entries were recorded”.

When item generation produces no item:

do not treat this as an error;
player-facing UI does not need to say “item did not drop”;
show item only if an item actually exists.

For manual combat:

do not show auto-resolve as failed/not rolled;
hide auto-resolve row, or display a clear neutral label such as:
Manual combat
Admin/test/debug UI

Admin/test/debug UI should distinguish these cases where data is available:

reward_grant does not exist.
reward_grant exists, but reward_grant_entries are empty.
XP/CP entries exist.
Item generation entry exists and item_id/generated item exists.
Item generation was possible, but item count/result is 0.
Item generator/reward workflow actually failed.
Manual combat did not use auto-resolve because completion_mode = manual.

Suggested admin/debug wording:

Auto-resolve not used because completion_mode=manual.

Do not invent DB fields. If the existing read model does not expose enough detail to distinguish item_generation=0 from missing item data, show only the distinctions supported by the current response and report the missing diagnostic as follow-up.

Non-goals
No DB/RPC/migration changes.
No generated types regeneration.
No reward profile balancing changes.
No item generation logic changes.
No manual combat runtime changes.
No broad UI redesign.
No status docs/backlog status updates.
Acceptance criteria
UI no longer shows “No reward entries were recorded” when XP/CP entries exist.
XP and Character Points reward entries are displayed after successful manual combat Trial completion.
Legal “no item dropped” outcome is not shown as an error in player-facing UI.
Manual combat completion does not show auto-resolve “not rolled” as if it were a failure.
Admin/test/debug copy clearly explains manual combat auto-resolve not used where relevant.
Missing diagnostic detail is reported as a read-model/debug follow-up, not faked in Angular.
Verification

Run:

npx tsc --noEmit
npm run build

Run focused specs if the touched mapper/state/component already has tests.

Static checks:

Search for No reward entries were recorded and confirm it is not used when entries exist.
Search for auto-resolve “not rolled” copy and confirm manual completion mode is handled separately.
Confirm no DB/RPC/migration/generated type files were changed.
Manual smoke for user/reviewer

Use a manual combat Trial completion where DB creates reward entries:

XP entry exists.
Character Points entry exists.
item drop may or may not exist.

Expected:

Win manual combat Trial.
Result UI shows XP/CP.
If no item dropped, UI does not call it a reward failure.
If item dropped, UI shows item.
Manual combat result does not show misleading auto-resolve failure/not-rolled wording.
Admin/test/debug view explains auto-resolve not used for manual completion mode, if that row is shown.
Required Codex report
Scope / non-goals.
Files changed.
Acceptance mapping.
Verification.
Reuse report:
reused:
checked but not reused:
new:
DB/RPC changes: none.
Generated types changed: no.
Manual smoke checklist for user.

---

## SPECIAL TASK - Item generation requirements admin editor

**Status:** Done / accepted 2026-05-08.

Goal:
Allow admin to view and edit central `entity_requirements` for item generation bases and affixes.

Scope:
- Reuse existing central requirement editor/write path if available.
- Support `entity_type = item_generation_base`.
- Support `entity_type = item_generation_affix`.
- Show requirements separately from bonuses.
- Do not use local JSON fields or legacy requirement columns.
- Use `requirement_definitions`, `entity_requirements`, and `get_requirement_impact_preview(...)`.
- If governed write path is missing for these entity types, keep read-only and report DB/RPC/governance blocker.

Acceptance:
- Admin can add/edit requirements for base items.
- Admin can add/edit requirements for prefixes/suffixes.
- Generated item effective requirements reflect base + prefix + suffix.
- No direct table writes unless already accepted as the central admin pattern.

Implementation note:
Accepted on 2026-05-08 after blocker follow-up. The accepted implementation embeds Requirements directly in `/admin/item-catalog` for the currently selected base item, prefix or suffix instead of adding a separate admin page. Base item requirements use `entity_type = item_generation_base` and the selected base id; prefix/suffix requirements use `entity_type = item_generation_affix` and the selected affix id. The rejected separate `/admin/item-generation-requirements` route, target browser/card search UI and large dedicated item-generation requirements state were removed. The final write/read path reuses the existing central requirement admin service/state and governed requirement RPC helpers for `requirement_definitions`, `entity_requirements`, `get_requirement_impact_preview(...)`, create/update/deactivate and reorder behavior, with no direct `entity_requirements` table writes and no local JSON or legacy requirement columns. Manual smoke confirmed adding a Dexterity 6 requirement to the Demonic prefix, after which Armory item detail showed runtime requirements `Hero level 1` and `Dexterity 6`; existing S9/S10 detail display still showed `300 drachma`, `Damage 2-9`, `Critical chance +2` and `Maximum damage +4`. Non-blocking follow-ups: item catalog Requirements UI needs a later UX pass; player popover source-layer diagnostics are acceptable pre-alpha/debug aid but should later move to admin/debug or be removed; `BuildingRequirementsState` should be renamed/split into a neutral entity-requirements state on a future larger requirements touch.

## Accepted hotfix implementation notes

- HOTFIX-REWARD-AUTO-RESOLVE accepted on 2026-05-07. Exploration reward UI now renders persisted XP and Character Points reward entries from the existing durable reward read path, exposes displayable reward entries through `visibleRewardEntries`, and hides generated-item rows without `itemId` from player-facing reward output so legal no-item outcomes are not shown as reward failures. The old `No reward entries were recorded` fallback was replaced with explicit empty-entries/debug wording. Manual combat challenge facts now show neutral `Manual combat` copy instead of auto-resolve `not rolled` wording. No DB/RPC/migration/generated type files were changed. Follow-up: richer admin/debug diagnostics should distinguish generated item count zero vs missing generated item row when the read model exposes enough detail.
- HOTFIX-COMBAT-1 accepted on 2026-05-05. Exploration challenges with `minigameKey === 'combat'` now use the DB-owned `submit_exploration_challenge_combat_resolution(...)` RPC instead of the generic manual completion RPC. The frontend sends only `p_challenge_attempt_id`, `p_timing_hits_json` and `p_request_id`; it does not send stats, equipment, luck, damage, opponent data or final outcome. The service maps DB-returned combat fields and refreshes canonical exploration state through `getHeroExplorationState(...)`; PvE `draw` is presented as failure. This path is scoped to exploration and does not touch PvP. Manual smoke remains pending for a real combat Trial/Encounter.
- HOTFIX-COMBAT-2 accepted on 2026-05-05. After exploration combat resolution, the challenge result card displays the durable DB resolver summary: `combat_result_id`, outcome, success/failure, completion mode, turns completed, participants, attacks, exploration status and `reward_grant_id`. Reward display continues to use the existing durable exploration reward read path and shows Polish diagnostics when `reward_grant_id` is null or the reward has not yet been read. The UI does not reconstruct an attack log from timing input; it explicitly reports the dependency on a future DB combat result read model for detailed timeline/log display. Refreshing the page does not resubmit the resolver or duplicate rewards.
- HOTFIX-COMBAT-3 accepted on 2026-05-05. Exploration Combat Trial/Encounter reuses the shared Walking Dead / green-zone timing UI, while `/game/combat` remains a sandbox/test caller and does not become production combat authority. The shared `advanceWalkingDeadTimingFrame(...)` helper now owns indicator movement for both callers. Exploration still submits timing input through `submit_exploration_challenge_combat_resolution(...)` and does not send stats, equipment, luck, damage, opponent data or final outcome; final combat result, reward and exploration status remain DB-owned. Manual smoke remains pending for `/game/combat` and real exploration combat Trial/Encounter.
- HOTFIX-COMBAT-LIVE accepted on 2026-05-06. Exploration Combat Trial/Encounter has been moved from the legacy batch resolver to the DB-owned live combat runtime. The frontend route uses `ensure_exploration_combat_session(...)` for idempotent get-or-create/recovery, `submit_combat_player_action(...)` for each Walking Dead click, and `get_combat_result_detail(...)` after finalization; `get_combat_live_state(...)` is available in the live combat service boundary for future explicit delta/recovery reads. The player-action payload is limited to `p_session_id`, `p_timing_input_json: { positionPercent }` and `p_request_id`; Angular does not send or calculate stats, equipment, Luck, hit/miss/evade/crit, damage, HP, final outcome or reward. UI renders participants, HP, current actor, round/action, events and timing manifest from DB state, then refreshes exploration/reward state after DB finalization. Accepted frontend follow-ups aligned the manifest parser with the current DB-owned `current_timing_manifest_json` shape and mapped participant `healthCurrent` plus `healthMax` / `health_max` into `currentHp` / `maxHp`, without adding local streak shrink, speed, green-zone, damage, outcome or HP authority. Manual smoke remains pending for a representative real combat Trial/Encounter, refresh recovery, duplicate-submit safety and DB-updated HP/manifest values.
