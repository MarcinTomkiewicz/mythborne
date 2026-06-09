# AGENTS.md — Mythsworn Codex execution guide

## Purpose

This file controls Codex execution in **Mythsworn**.

Codex executes one scoped task in the current repository. It must preserve DB/RPC authority, reuse existing code, delete obsolete code, avoid fallbacks, verify honestly and report briefly.

Default rule:

> Remove obsolete code. Do not preserve it "just in case".

Do not add defensive, anticipatory, compatibility, fallback, future-proof or transitional code unless the user explicitly asks for that exact transitional state.

Do not leave old and new flow side by side.

Do not hide missing contracts behind Angular code.

Do not treat passing specs as proof that the application works.

---

## Source order

When sources conflict, use this order:

1. explicit user instruction for the current task;
2. current live DB / migrations / latest dump / user-provided generated types;
3. `docs/database-current.md`;
4. `docs/current-decisions.md`;
5. `docs/project-context.md`;
6. current backlog/task file;
7. `docs/current-state-summary.md` and `docs/current-todo.md` for status only;
8. this file;
9. legacy concept files only as history/flavor.

For UI tasks, also read the canonical UI/UX backlog and task-specific UI guidance.

Use **Mythsworn** in new implementation, UI-facing copy and reports unless the user explicitly asks about legacy material.

---

## Default workflow

Before editing code:

1. run `git status --short`;
2. read `AGENTS.md` and review standards if present;
3. read task-relevant docs/backlog;
4. inspect current source files and generated DB types when schema-sensitive;
5. inspect existing services, models, mappers, validators, factories, utilities and UI patterns before adding anything new;
6. identify blockers.

Preflight is internal preparation, not a separate deliverable.

Continue when there is no blocker and dirty tree is clean or expected.

Stop before editing if dirty tree has unexpected changes.

Implement only the current task.

Do not do unrelated refactors, status-doc updates, broad audits, opportunistic work, fake runtime, fake data, placeholder flows, defensive fallbacks or future-proof architecture.

---

## Hard blockers

Stop and report a blocker when:

* required DB/RPC/table/enum/generated type contract is missing or stale;
* required generated type is absent or incompatible;
* task would require editing `src/app/core/types/database.types.ts`;
* implementation would require direct Angular writes to gameplay/economy/workflow/config/audit tables;
* required authoritative read model does not expose data the UI needs;
* dirty tree is unexpected;
* mandatory UI prototype/guidance is missing;
* verification fails because of the current change;
* task would require keeping old and new flow side by side without explicit user approval.

Do not bypass blockers with Angular fallbacks, mock contracts, manual generated-row interfaces, guessed schema, fake data, compatibility adapters, fallback labels or defensive wrappers.

Blocker report:

```text
BLOCKER:
- <what blocks the task>

Missing contract/source:
- <table/RPC/generated type/file>

Affected path:
- <where implementation is blocked>

Needed:
- <specific user/Migrator action>

Work done before blocker:
- <short list or none>

Status docs:
- not touched
```

---

## Generated types

`src/app/core/types/database.types.ts` is generated, user/Migrator-owned input.

Codex may read it but must never edit, regenerate, patch, reformat, reorder it or create manual TypeScript interfaces to replace missing generated RPC/table rows.

When generated types are missing or stale: stop, name the missing contract, explain the blocked path and ask for regeneration/fix.

---

## DB/RPC authority

Normal player context:

```text
authenticated user -> selected/current server -> active hero -> hero-owned data
```

Never assume `hero.id === auth.uid()`.

Durable gameplay, economy, progression, item, equipment, estate, guild, PvP, report, notification, config and moderation mutations must use canonical DB/RPC/domain/governance workflows.

Angular must not direct-write critical workflow tables, including:

* hero stats/resources/Character Points;
* items/equipment/armory;
* trade/auction/locks/transactions;
* estate jobs/buildings/resources;
* guild workflows;
* exploration/trial/encounter runtime;
* combat/PvP results;
* rewards/reports/notifications;
* audit/anti-abuse/sanctions/config values.

Frontend formula/runtime calculations are preview/explainability only unless current docs explicitly say otherwise.

Use DB dictionaries/configs/read models for labels, options, helper text, eligibility, report copy and balance-facing values where DB owns the concept.

Raw keys/UUIDs may appear only as secondary technical metadata.

---

## Reuse before new code

Before adding a helper, service, mapper, validator, factory, constant, component, state class or config file, inspect existing patterns first:

1. `core/factories`;
2. `core/validators`;
3. `core/utils`;
4. form config files and `FormFieldConfig` patterns;
5. domain models and mappers;
6. `core/constants`;
7. services/RPC helpers;
8. shared/admin/game UI components and wrappers.

Reuse or extend existing patterns unless they are incompatible with the task.

Do not create new code because it is faster than checking existing code.

Meaningful reuse means concrete existing logic: method, helper, util, mapper, validator, factory, form config, service method, RPC helper, state pattern or shared UI/workflow pattern.

Do not count as reuse:

* using the component/page/facade already being edited;
* using a child component already part of the page composition;
* listing classes merely required to render the current feature.

If existing code was checked but not reused, name it and explain why it was incompatible.

---

## Touched-file audit

When Codex touches a production `.ts` file, it must audit the whole file, not only edited lines.

Every touched production `.ts` file must appear in the final report:

```text
Touched-file audit:
- <file path>: types none/moved/deleted/kept; helpers none/extracted/reused/deleted/kept; fallback none/removed/blocker; responsibility OK/fixed/blocker
```

Rules:

* Local `interface` or `type` in a component is allowed only when strictly private, view-only, used in one file and not a domain/read-model/DTO/RPC/report/equipment/combat/exploration/PvP shape.
* Non-exported local type is still a violation if it models reusable/domain/read-model data.
* Domain/read-model/report/PvP/combat/exploration/equipment/item/estate/guild shapes belong in `core/domain`, `core/types`, `core/interfaces` or a matching domain model file.
* A helper is not file-private if it encodes domain semantics, classifies source/result kinds, maps report/reward/effect/combat/trial state, parses DB/RPC payloads or duplicates logic in the current package.
* Pure generic helper goes to generic util.
* Domain helper goes to domain/report/exploration/combat/PvP util or mapper.
* Do not keep old and new flow side by side.
* Do not keep compatibility aliases, fallback paths, defensive wrappers or transitional code unless the user explicitly approved a transition.

If touched-file audit is missing for touched production `.ts` files, the report is incomplete.

---

## No future cleanup escape

Do not use these conclusions for violations inside touched production files when the fix is local to the current package:

* `future follow-up`;
* `cleanup candidate`;
* `can stay for now`;
* `if this grows later`;
* `worth considering later`;
* `left for later`.

Required fixes in touched code:

* reusable/domain/read-model interfaces or types in components;
* duplicated or near-duplicated helpers;
* domain helpers kept component-local;
* generic pure helpers kept file-local;
* obsolete fallback beside new canonical path;
* compatibility alias without explicit approval;
* old flow beside new flow;
* defensive wrapper instead of deletion;
* local SCSS duplicating utilities/patterns;
* hardcoded player-facing fallback labels where DB/read model owns the concept;
* stale spec preserving removed behavior.

Cleanup candidate is allowed only when the problem is outside the current package, requires broad unrelated refactor, needs DB/RPC/read-model/generated-type work, has explicit user-approved transition, or would alter runtime behavior outside the task.

Every cleanup candidate must name the exact blocker preventing a fix now.

---

## Types, helpers and ownership

Do not put reusable types/interfaces in components.

Placement:

* domain models: `core/domain/...`;
* generic technical types: `core/types/...`;
* public/shared interfaces: `core/interfaces/...`;
* form types: `core/types/forms/...`;
* report/domain read models: matching domain/report model file;
* feature-private one-use view-only micro-shapes: local only if strictly private.

Do not create compatibility aliases when moving types. Move the type and update imports. Delete obsolete types.

Local helpers are allowed only when one-use, private to one file and not reusable/domain/generic.

Extract now when a helper:

* is duplicated or near-duplicated in the current package;
* classifies result/source kinds;
* maps report/reward/effect/combat/trial/PvP state;
* parses DB/RPC/read-model payloads;
* formats reusable domain display values;
* normalizes generic data;
* performs reusable filtering/sorting/grouping;
* overlaps an existing helper.

Ownership:

* pure generic helper: `core/utils/...`;
* report helper: `core/utils/report-...`;
* exploration helper: `core/utils/exploration-...`;
* combat helper: `core/utils/combat-...`;
* PvP helper: `core/utils/pvp-...` or matching domain/service;
* domain mapper/helper: matching `core/domain/...`;
* service/RPC workflow helper: matching `core/services/...`.

Do not keep a helper local because it "may be reused later". Either it is private now or it has reusable/domain ownership now.

---

## Touched-file cleanup

When changing production TS/HTML/SCSS, do not only add code.

Check the whole touched file for dead code, unused imports, unused private methods/functions, duplicated helpers, obsolete fallbacks, transitional code, stale tests, local types/interfaces, responsibility drift, wrong-layer mapper/service/helper logic, utility-shadowing SCSS and hardcoded fallback copy.

Delete obsolete code.

Do not add wrappers over bad code.

Do not preserve aliases for removed concepts.

Do not split files only to hide line count.

File size:

* 250–300 lines in touched production TS/HTML: warning, cleanup attention required;
* 400+ lines: cleanup/splitting decision required in report;
* 600+ lines: reduce, split by responsibility, or report blocker/cleanup candidate with exact reason.

---

## Angular / PrimeNG / UI hard rules

Use modern Angular, signals-first patterns, Reactive Forms and PrimeNG patterns already used by the project.

Blocked unless current task explicitly allows:

* `ngModel` / `FormsModule`;
* deprecated PrimeNG APIs;
* native form controls where PrimeNG/project wrappers are expected;
* `p-select` nested inside native `<label>`;
* copied prototype CSS;
* prototype `mb-*` classes;
* raw gradients/palette values copied from prototypes;
* local SCSS duplicating global utilities/shared patterns;
* local `.p-*` PrimeNG skins;
* `::ng-deep` without explicit blocker;
* raw DB keys/UUIDs as primary UI labels;
* `muted-text` / `color-muted` on important values, decisions, warnings, reasons, outcomes, hero names, item names, ranks or selected states;
* fake UI data/counters/labels/eligibility/timers/actions.

For UI tasks:

* read task-relevant UI/UX guidance first;
* use existing utilities/wrappers/shared components before local SCSS/components;
* preserve accepted prototype visual anchors when prototype-backed;
* report missing production patterns instead of flattening into generic cards;
* manual/route smoke must explain domain meaning, not only click paths.

If production pattern/data needed for UI is missing, report the missing pattern or DB/RPC/read-model gap. Do not invent frontend fallback.

---

## UI utilities and SCSS

Do not use SCSS to recreate layout utilities.

Before adding local SCSS for display, flex, grid, gap, margin, padding, width, height, alignment, position, overflow, z-index, border, radius or background, check existing utilities/global patterns.

If a utility exists, use it.

Feature-local SCSS is allowed only for narrow component geometry or state styling that has no existing utility/pattern and is not reusable.

Every local SCSS addition must have a reason.

Local SCSS duplicating global utilities is required fix, not follow-up.

---

## Stale guards

Every async UI workflow depending on selected server, active hero, route id, selected entity, target item/hero, current case/sanction/penalty, access context or route context must guard success and error paths.

Required behavior:

* stale success must not overwrite current state;
* stale error must not show after context changes;
* loading ends only for active request/context;
* changing context clears stale form state and feedback;
* responses for no-longer-selected entities are ignored.

Missing stale guard in touched async code must be fixed in the same task or reported as blocker if it needs broader contract work.

---

## Specs policy

A passing spec is not proof that the application works.

Specs are not acceptance evidence for player-facing UI, DB/RPC workflows, runtime behavior, reports, rewards, combat, PvP, trade, armory, estate, exploration or other domain flows.

Do not add new `.spec.ts` files unless the user explicitly asks for test work.

Do not expand specs unless the current task explicitly asks for test work.

If an existing spec fails in the current accepted application state, delete it.

If an existing spec fails because the task intentionally removed obsolete behavior, delete it.

If an existing spec fails because production code is broken by the current task, fix production code, not the spec.

If a spec still protects real current behavior and only needs import/name cleanup after a type/helper move, update only that import/name cleanup.

Do not write self-fulfilling specs that assert mocks, constants or implementation details created in the same task.

Do not treat `focused specs: pass` as proof that UI or game flow works.

---

## Verification

Unless docs-only or explicitly scoped otherwise, run:

* `npx tsc --noEmit`;
* `npm run build`;
* `git diff --check`;
* relevant static greps.

Useful static greps:

* direct `.from(...).insert/update/upsert/delete` in workflow-sensitive services;
* `hero.id === auth.uid()` or auth uid used as hero id;
* `ngModel` / `FormsModule`;
* deprecated PrimeNG/native button patterns;
* direct edits to `database.types.ts`;
* old fallback paths the task should remove;
* local interfaces/types in touched components;
* duplicated local helper names across touched files;
* copied prototype `mb-*` classes;
* local `.p-*` PrimeNG styling.

Run existing focused specs only when all are true:

* spec already exists;
* it is directly relevant to touched current behavior;
* it does not preserve obsolete behavior;
* task or user explicitly makes that spec relevant.

Do not claim manual/browser smoke unless actually run with real session, data and environment.

If manual smoke is not possible, mark it as `not run`, `pending`, `user-side`, or `not applicable`.

Route smoke `200` is not full manual smoke.

User screenshots/smoke feedback are authoritative for that iteration.

---

## Status docs

Do not update `docs/current-todo.md`, `docs/current-state-summary.md`, backlog task statuses or implementation status docs unless the user explicitly asks or confirms task completion and asks for docs/status sync.

Every report must state whether status docs were touched.

---

## No automatic validation

Do not affirm the user by reflex.

Do not write `masz rację`, `dokładnie`, `świetna uwaga`, `dobry trop` or equivalent validation phrases.

If the user reports a rule violation, inspect the rule and diagnose.

If the user pastes an error, analyze the error.

If the user is wrong, say directly why.

Default mode: verify, classify, act.

---

## Final report

A successful report is a completion receipt, not a review memo.

Default successful report:

* 10–15 lines preferred;
* 20 lines maximum;
* no long preflight dump;
* no reviewer-style rationale;
* no repeated project rules;
* no full copied file contents;
* no code blocks unless user asks.

Use this shape:

```text
AGENTS/Review Standards: read

Task:
- <ID/title>

Scope:
- <one sentence>

Changed:
- <1-3 bullets max>

Removed / cleanup:
- <1-3 bullets max>

Touched-file audit:
- <file>: types none/moved/deleted/kept; helpers none/extracted/reused/deleted/kept; fallback none/removed/blocker; responsibility OK/fixed/blocker
- <file>: ...

Reuse:
- reused:
- checked but not reused:
- new:

Verification:
- `npx tsc --noEmit`: pass / not run
- `npm run build`: pass / not run
- `git diff --check`: pass / not run
- static greps: pass / not run
- specs: not added; existing relevant specs not run / deleted stale <name> / import-only cleanup <name>
- manual smoke: not run / pending / user-side / not applicable

Status docs:
- touched / not touched

Blockers/risks:
- none
```

Expand only when there is a blocker, verification failed, DB/RPC/generated types are missing/stale, dirty tree is unexpected, risky obsolete code could not be removed safely, or user asks for details.

---

## Red flags

Treat as blockers or required fixes unless task explicitly justifies them:

* assuming `hero.id === auth.uid()`;
* direct Angular writes to gameplay/economy/workflow/config/audit tables;
* frontend fallbacks masking missing DB/RPC/read-model data;
* editing/regenerating/patching `database.types.ts`;
* manual interfaces for generated RPC contracts;
* hardcoded gameplay/config/dictionary labels where DB owns the concept;
* invented table/RPC/route/concept names;
* old formula variables or old naming reintroduced without source confirmation;
* local reusable/domain/read-model interfaces/types in components;
* duplicated or near-duplicated helpers in touched files;
* generic pure helpers kept file-local;
* domain helpers kept in components;
* old and new flow left side by side;
* compatibility aliases added without explicit user approval;
* defensive wrappers added instead of deleting obsolete code;
* oversized touched production files without cleanup attempt;
* splitting files only to hide line count;
* route smoke/build treated as full manual smoke;
* passing specs treated as proof that the app works;
* stale failing specs repaired to preserve obsolete behavior;
* stale failing specs left in place;
* updating status docs before user acceptance.
