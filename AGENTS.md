# AGENTS.md — Mythsworn Codex execution guide

## Purpose

This file is the short execution-oriented guide for Codex/implementation agents working on **Mythsworn**.

It is not a domain encyclopedia, DB/RPC registry, migration log, UI backlog, status file, or replacement for task instructions.

Use this file to execute one task safely:
- read the right sources;
- avoid unsafe DB/frontend shortcuts;
- reuse existing code before adding new code;
- clean touched files instead of layering workarounds;
- verify the change;
- report briefly.

For domain detail, use the current source documents instead of expanding this file.

---

## Source order

When sources conflict, prefer:

1. explicit user instruction for the current task;
2. current live DB / migrations / latest dump / user-provided generated types;
3. `docs/database-current.md` for DB/RPC/helper contracts;
4. `docs/current-decisions.md` for semantic/domain decisions;
5. `docs/project-context.md` for compact operational context;
6. the current backlog/task file;
7. `docs/current-state-summary.md` and `docs/current-todo.md` for status only;
8. this file;
9. legacy concept files only as history/flavor.

For UI tasks, also read the canonical UI/UX backlog and task-specific UI guidance.

Older Monster Hunt / Mythborne wording may remain in legacy files. New implementation, UI-facing copy and reports should use **Mythsworn** unless the user explicitly asks otherwise.

---

## Default workflow

Before editing code:

1. run `git status --short`;
2. read `AGENTS.md` and `docs/mythborne_codex_review_standards.md` if present;
3. read the task-relevant project docs/backlog section;
4. inspect current source files and generated DB types when schema-sensitive;
5. look for existing services, models, mappers, validators, factories, utilities and UI patterns to reuse;
6. identify blockers before coding.

Do not stop after preflight if there is no blocker and the working tree is clean or expected. Preflight is internal preparation, not a separate deliverable.

If the working tree has unexpected changes, report them and wait for the user decision before editing.

Implement only the current task. Do not do unrelated refactors, status updates, broad audits or opportunistic feature work.

---

## Hard blockers

Stop and report a blocker instead of guessing when:

- a required DB/RPC/table/enum/generated type contract is missing or stale;
- the generated type for a required RPC/table is absent or incompatible;
- a task would require editing `src/app/core/types/database.types.ts`;
- implementation would require direct-writing gameplay/economy/workflow/config/audit tables from Angular;
- a required authoritative read model does not expose data the UI needs;
- a dirty working tree is unexpected;
- a UI task needs missing accepted prototype/guidance that the user made mandatory;
- verification fails in a way that may be caused by the current change.

A blocker report should say exactly:
- what blocks the task;
- which contract/file/type/RPC is missing or incompatible;
- which code path is affected;
- what is needed from the user/Migrator;
- what, if anything, was changed before the blocker.

Do not hide blockers with Angular fallbacks, local mock contracts, manual generated-row interfaces, or guessed schema.

---

## Generated types

`src/app/core/types/database.types.ts` is generated, user/Migrator-owned input.

Codex may read it but must never:
- edit it;
- regenerate it;
- patch one or two fields manually;
- reformat/reorder it;
- include it as Codex-authored work;
- create manual TypeScript interfaces to replace missing generated RPC rows.

When generated types are missing/stale:
1. stop;
2. name the missing function/table/field/type;
3. explain the blocked code path;
4. ask the user/Migrator to regenerate or fix the contract;
5. do not implement a frontend workaround.

---

## DB/RPC and mutation boundaries

Normal player context is:

`authenticated user -> selected/current server -> active hero -> hero-owned data`.

Never assume `hero.id === auth.uid()`.

Durable gameplay, economy, progression, item, equipment, estate, guild, PvP, report, notification, config and moderation mutations must use canonical DB/RPC/domain/governance workflows.

Angular must not direct-write critical workflow tables, including but not limited to:
- `hero_stats`, `hero_resources`, `character_point_ledger`;
- `items`, `hero_equipment`, armory tables;
- trade/auction/lock/transaction tables;
- estate jobs/building/resource mutation tables;
- guild workflow tables;
- exploration/trial/encounter runtime tables;
- combat/PvP result tables;
- reward/report/notification source tables;
- audit, anti-abuse, sanction and config value tables.

Frontend formula/runtime calculations are preview/explainability only unless the current docs explicitly say otherwise. Durable authority belongs to DB/RPC/formula helpers.

Use DB dictionaries/configs/metadata for labels, options, helper text and balance-facing values where DB owns the concept. Raw keys/UUIDs may appear as secondary technical metadata, not primary player/operator copy.

Preserve `reason`, `description`, `status_reason`, `helper_text`, `admin_description` and audit-relevant context.

---

## Reuse before new code

Before adding a new helper, service, mapper, validator, factory, constant, component, state class or config file, check existing project patterns first.

Lookup order:

1. `core/factories`
2. `core/validators`
3. `core/utils`
4. existing form config files and `FormFieldConfig` patterns
5. existing domain models and mappers
6. `core/constants`
7. existing services/RPC helpers
8. shared/admin/game UI components and wrappers

Rules:
- extend/reuse existing patterns when reasonable;
- do not create `core/utils/*` for feature-specific behavior;
- keep feature-specific helpers near the feature;
- put reusable domain models/mappers in the appropriate `core/domain`, `core/types`, `core/interfaces`, `core/services` or `core/utils` location;
- do not export domain interfaces/types from components;
- route/page components should stay thin.

If a new abstraction is added, it must have a clear reason. In the final report, mention it briefly only when it matters.

---

## Touched-file cleanup

When changing an existing production TS/HTML file, especially a service, facade, mapper, state class, utility or large standalone component, do not only add code. Check the touched area for:

- dead code;
- unused imports;
- unused private methods/functions;
- duplicated helpers;
- obsolete fallbacks/workarounds;
- transitional code made unnecessary by the current task;
- tests preserving obsolete behavior.

Prefer deleting obsolete code over adding another wrapper, adapter or fallback.

Do not expand cleanup into unrelated features. If cleanup would affect unrelated flows or needs a larger decision, report a cleanup candidate instead of silently doing a broad refactor.

File size guidance:
- 250–300 lines in touched production TS/HTML is a warning;
- 400+ lines is a strong cleanup/splitting signal;
- 600+ lines should normally be reduced, split by responsibility, or reported as a cleanup candidate.

Normal successful report: summarize cleanup in **one sentence**.

Use a detailed touched-file cleanup note only when:
- suspicious obsolete code was found but not removed;
- a touched production file remains 400+ lines for a meaningful reason;
- cleanup affects public exports/import chains;
- a cleanup candidate needs user/reviewer decision;
- verification risk remains.

---

## Legacy DB cleanup candidates

When a task removes the last known code usage of a legacy table, column, RPC, helper or model, report it as a DB cleanup candidate.

Do not create DB cleanup/drop migrations unless the current task explicitly asks for DB cleanup work.

Compact report shape when relevant:

```text
DB cleanup candidate:
- legacy object:
- replaced by:
- remaining blockers:
- safe to remove now: yes/no/unknown
```

---

## Angular / PrimeNG / UI rules

Use modern Angular, signals-first patterns, Reactive Forms and PrimeNG patterns already used by the project.

Avoid:
- `ngModel` / `FormsModule` in forms;
- deprecated PrimeNG APIs;
- native form elements when PrimeNG/project wrappers are expected;
- `p-select` nested inside native `<label>`;
- local SCSS that duplicates global utilities or shared patterns;
- copied prototype CSS;
- raw DB keys as primary UI labels;
- `muted-text` for important values, decisions, warnings, reasons or outcomes.

For UI tasks:
- read task-relevant UI/UX guidance first;
- use existing utilities/wrappers/shared components before adding local SCSS/components;
- preserve accepted prototype visual anchors when the task is prototype-backed;
- report missing production patterns instead of flattening them into generic cards;
- manual/route smoke must explain domain meaning, not only click paths.

---

## Stale guards

Every async UI workflow depending on selected server, active hero, route id, selected entity, target item/hero, current case/sanction/penalty, access context or route context must guard success and error paths.

Required behavior:
- stale success must not overwrite current state;
- stale error must not show after context changes;
- loading ends only for the active request/context;
- changing context clears stale form state and feedback;
- responses for no-longer-selected entities are ignored.

---

## Verification

Unless the task is docs-only or explicitly scoped otherwise, run:

- focused specs for the touched area when available;
- `npx tsc --noEmit`;
- `npm run build`;
- static grep checks relevant to the touched area.

Useful static greps include:
- direct `.from(...).insert/update/upsert/delete` in workflow-sensitive services;
- `hero.id === auth.uid()` or auth uid used as hero id;
- `ngModel` / `FormsModule`;
- deprecated PrimeNG/native button patterns where relevant;
- direct edits to `database.types.ts`;
- old fallback paths that the task was supposed to remove.

Do not claim manual/browser smoke unless you actually ran it with a real session, data and environment. If manual smoke is not possible, mark it as `not run`, `pending` or `not applicable`.

Route smoke `200` is not full manual smoke.

User screenshots/smoke feedback are authoritative for that iteration.

---

## Status docs

Do not update:
- `docs/current-todo.md`;
- `docs/current-state-summary.md`;
- backlog task statuses;
- implementation status docs;

unless the user explicitly asks or confirms task completion and asks for a docs/status sync.

Every report must state whether status docs were touched.

---

## Final report

A successful report is a completion receipt, not a review memo.

Default successful report:
- 10–15 lines preferred;
- 20 lines maximum;
- no long preflight dump;
- no full reuse inventory;
- no full touched-file cleanup table;
- no reviewer-style rationale;
- no repeated project rules.

Use this shape:

```text
AGENTS/Review Standards: read

Task:
- <ID/title>

Scope:
- <one sentence>

Acceptance:
- <criterion>: pass
- <criterion>: pass

Changed:
- <1-3 bullets max>

Cleanup:
- <one sentence only>

Verification:
- focused specs: pass / not run / N/A
- `npx tsc --noEmit`: pass / not run
- `npm run build`: pass / not run
- static greps: pass / not run
- manual smoke: not run / pending / not applicable

Status docs:
- touched / not touched

Blockers/risks:
- none
```

Expand beyond the compact report only when:
- there is a blocker;
- verification failed;
- generated types/DB/RPC contracts are missing or stale;
- dirty tree is unexpected;
- cleanup found risky obsolete code that could not be removed safely;
- a large UI/workflow refactor needs review evidence;
- the user explicitly asks for details.

Blocker report shape:

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

## Red flags

Treat these as blockers or strong warnings unless the task explicitly justifies them:

- assuming `hero.id === auth.uid()`;
- direct Angular writes to gameplay/economy/workflow/config/audit tables;
- frontend fallbacks masking missing DB/RPC/read-model data;
- editing/regenerating/patching `database.types.ts`;
- manual interfaces for generated RPC contracts;
- hardcoded gameplay/config/dictionary labels where DB owns the concept;
- invented table/RPC/route/concept names;
- old formula variables or old naming reintroduced without source confirmation;
- oversized touched production files without cleanup attempt;
- splitting files only to hide line count;
- route smoke/build treated as full manual smoke;
- updating status docs before user acceptance;
- tests that preserve obsolete behavior only.
