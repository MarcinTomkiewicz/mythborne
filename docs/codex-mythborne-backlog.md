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

**Goal:** Show global/default formula assignments.

**Scope:**
- List formula target -> assigned formula.
- Show expression and description.
- Show target scope/category if present.

**Acceptance criteria:**
- Admin can understand which formula is active globally/default.

---

## Task E3 — Local entity formula assignment support

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

# Epic F — Bonus template refactor

## Task F1 — Inspect current bonus template usage

**Goal:** Understand existing old-shape usage before migration.

**Scope:**
- Find all frontend/backend references to `bonus_templates`.
- Identify expected fields:
  - old `target/type/description`,
  - any newer intended fields.
- Report affected features.

**Acceptance criteria:**
- Clear impact report.
- No schema change yet.

---

## Task F2 — Design implementation migration for bonus templates

**Goal:** Prepare controlled migration to intended model.

**Scope:**
- Compare current schema with desired:
  - bonus types:
    - flat,
    - percent,
    - per_levels,
    - scaled_stat_bonus,
    - resource_flat,
    - resource_percent,
    - capacity_flat,
    - unlock_feature.
  - contexts:
    - global,
    - pvp_attack,
    - pvp_defense,
    - exploration,
    - trial,
    - combat,
    - economy,
    - building_management.
- Propose SQL migration and FE model changes.

**Acceptance criteria:**
- Migration plan is reviewable before execution.

---

## Task F3 — Implement bonus template migration after approval

**Goal:** Apply approved bonus template refactor.

**Scope:**
- Apply SQL migration only after user approval.
- Regenerate DB types.
- Update mappers/domain models.
- Preserve existing data where possible.

**Acceptance criteria:**
- App compiles.
- Bonus templates use intended shape or documented transitional shape.

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

**Goal:** Player can submit declaration.

**Scope:**
- Submit declaration with server/user/hero context.
- Persist participants/items/trades where supplied.
- Prefer RPC if available.

**Acceptance criteria:**
- Declaration can be submitted and later listed.

---

## Task H8 — Player declaration list/status view

**Goal:** Player can see declarations and reasons.

**Scope:**
- List relevant declarations.
- Show status, reason, participants, items/trades, timestamps.

**Acceptance criteria:**
- Player understands accepted/rejected/revoked/pending state.

---

## Task H9 — Staff declaration review

**Goal:** Staff can accept/reject/revoke declarations.

**Scope:**
- Detail view.
- Status transitions with reason.
- Audit hook where available.

**Acceptance criteria:**
- Staff decision and reason are stored and visible.

---

## Task H10 — Player abuse report form model

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

---

## Task H11 — Player abuse report submission

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

## Task J5 — Add trade snapshot features for anti-abuse

**Goal:** Store lightweight indexed trade/item similarity features.

**Scope:**
- Snapshot features:
  - quality,
  - base item class/type,
  - prefix/suffix presence/id,
  - approximate power/value bucket,
  - item identity if applicable.
- Avoid heavy runtime joins for detection.

**Acceptance criteria:**
- Anti-abuse trade detection can compare similar trades cheaply.

---

# Epic K — Anti-abuse signal generation/detection

## Task K1 — Signal generation skeleton

**Goal:** Provide backend/domain path for creating anti-abuse signals.

**Scope:**
- Create signal with:
  - server id,
  - signal type,
  - participants,
  - related item/trade/report/declaration when available,
  - score/confidence/severity,
  - reason/description.

**Acceptance criteria:**
- Signals can be created by domain operations.

---

## Task K2 — Trade suspicious price detection

**Goal:** Create signals for suspicious trade prices.

**Scope:**
- Compare trade price against server-local similar trade history.
- Use anti-abuse server config values.
- Do not rely on vendor/drachma value alone.
- Handle:
  - underpriced valuable item,
  - overpriced trash item/substitute payment.

**Acceptance criteria:**
- Suspicious trades create signals or candidates.

---

## Task K3 — Same-participant/repeated transfer detection

**Goal:** Detect patterns across repeated trades/actions.

**Scope:**
- Group repeated transfers between same participants.
- Use signal grouping window config.

**Acceptance criteria:**
- Repeated suspicious patterns can create or join cases.

---

## Task K4 — Same-IP/device signal placeholder

**Goal:** Prepare careful future IP/device signal path.

**Scope:**
- Do not implement dehash/security-sensitive handling yet.
- Add clear TODO/interface boundary if login signal data exists.

**Acceptance criteria:**
- No unsafe IP handling is introduced.

---

## Task K5 — Auto-case grouping

**Goal:** Group strong/related signals into cases.

**Scope:**
- Use anti-abuse configs:
  - grouping window,
  - auto case creation enabled.
- Group by server, participants, signal type, time window, related objects.

**Acceptance criteria:**
- Signals can be grouped into cases in DB, not only UI.

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

**Goal:** Enforce PvE roll order.

**Scope:**
1. roll trial,
2. if no trial, roll encounter/empty.
- Trial and encounter do not occur simultaneously.
- Encounter does not reset progressive trial chance.
- Trial resets chance.

**Acceptance criteria:**
- Runtime matches documented roll order.

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

## Task N2 — Stat allocation save via domain/RPC operation

**Goal:** Make stat allocation save auditable and transactional.

**Scope:**
- Validate available Character Points.
- Validate caps.
- Save stat changes.
- Update resources.
- Write audit.
- Return typed result.

**Acceptance criteria:**
- UI plus/minus clicks are not audited.
- Final confirm/save is audited.

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
13. F1-F3 — bonus template refactor
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
