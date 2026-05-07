# Codex Backlog — Mythsworn Pre-Refactor Backlog

Status: draft for review — corrected after review  
Purpose: prepare the architecture-refactor foundation before any broad frontend refactor.  
Scope: discovery, rules, inventories and candidate maps for frontend architecture. This is not the final implementation refactor backlog.

This pre-refactor backlog exists because Mythsworn has grown quickly across `core`, `admin`, `game`, `hero`, `auth`, `layout`, `shared` and `public`. Before Codex is asked to move or deduplicate code, it must first create a reliable map of current architecture and the rules it should follow.

This backlog is inspired by the UI-CORE approach: first define rules and inventories, then perform implementation work.

---

## 0. Global rules for this pre-refactor phase

### Source order

Use this source order for all tasks in this pre-refactor backlog:

1. explicit user instruction;
2. current repo/code;
3. current DB schema / migrations / dump / generated `database.types.ts` when DB/RPC/read models are touched;
4. `database-current.md`;
5. `current-decisions.md`;
6. `project-context.md`;
7. `AGENTS.md`;
8. `project-structure.md`;
9. `core-rules.md`, once accepted or when this task is updating it;
10. `app-architecture-rules.md`, once accepted or when this task is updating it;
11. current refactor backlog / this pre-refactor backlog;
12. `current-state-summary.md` and `current-todo.md` as status/progress only.

If a referenced document does not exist in the repo, report a warning and continue with available sources unless the user explicitly made it a blocker.

### Non-goals

- Do not perform broad code moves.
- Do not rename routes.
- Do not refactor feature folders yet.
- Do not update status docs.
- Do not change DB/migrations/RPC/generated types.
- Do not do UI/SCSS/pattern refactor here; UI refactor remains a separate UI-CORE/UI-UX flow.
- Do not create a final accepted refactor backlog without user review.

### Discovery discipline

Codex must not claim “no existing helper found” unless it reports what it checked.

For each discovery/refactor candidate, the relevant inventory or candidate-map file must include concrete evidence:

- file path;
- symbol/function/class/type name;
- current folder;
- imports/usages where practical;
- why it is correct/misplaced/duplicate/legacy;
- confidence level.

Chat reports must stay short. Full evidence belongs in the output inventory/candidate map files, not in the chat response.

### Existing draft rule

If an output file already exists, Codex must review/update the existing draft instead of creating a second competing file. Preserve useful existing content unless the task explicitly asks to replace it.

### Naming rule

Use **Mythsworn** in new UI-facing text, new docs and new task names. Older filenames may still contain `mythborne` or `Monster Hunt`; do not rename existing files unless the task explicitly says so.

---

# Phase 0 — Architecture rules

## Task ARCH-PRE-1 — Review/update `core-rules.md`

**Goal:** Review or create a concise rules document defining how `src/app/core` should be organized.

**Output file:**

```text
docs/refactor/core/core-rules.md
```

If the project uses a different docs location, report it and follow explicit user instruction. If the file already exists, update it in place instead of creating a duplicate.

**Scope:**

- Read the source-order docs relevant to architecture.
- Inspect representative `src/app/core` folder structure only enough to make the rules practical; do not do full inventory in this task.
- Define rules for `core/config`, `core/config/forms`, `core/constants`, `core/domain`, `core/enums`, `core/factories`, `core/factories/forms`, `core/guards`, `core/interfaces`, `core/services`, `core/types`, `core/types/forms`, `core/utils`, `core/validators` and generated DB/Supabase types if present.
- Define feature-local vs core decision tests.
- Define rules for utilities, mappers, services/state/workflows, forms/factories/validators, constants and DB-backed data.
- Include forms rule: Reactive Forms by default, no new `ngModel`, Signal Forms only after explicit accepted technical decision.
- Include mapper rule: existing mapper locations outside `core/domain` may be legacy/transitional and must be classified by inventory before moves.
- Add required report addendum for future refactor tasks.

**Non-goals:** no code moves, no runtime changes, no status docs, no repo-wide cleanup.

**Acceptance criteria:**

- Each core folder has a clear responsibility.
- The document distinguishes reusable mechanics from domain semantics.
- The document blocks generic helpers that hide feature meaning.
- The document explains when feature-local logic should stay feature-local.
- Existing drafts are updated, not duplicated.
- It is short enough for Codex to use during tasks.

**Verification:** Markdown only; no build required.

**Required Codex chat report:** short summary of files changed, sources read, major edits, ambiguities, user decisions needed. Full evidence does not belong in chat.

---

## Task ARCH-PRE-2 — Review/update `app-architecture-rules.md`

**Goal:** Review or create a concise rules document defining responsibilities of top-level `src/app` folders.

**Output file:**

```text
docs/refactor/app/app-architecture-rules.md
```

If the file already exists, update it in place instead of creating a duplicate.

**Scope:**

- Read the source-order docs relevant to architecture.
- Inspect current `src/app` folder structure enough to make the rules practical; do not do full inventory in this task.
- Define responsibilities for `auth`, `admin`, `game`, `hero`, `layout`, `shared`, `public`, `core`, PrimeNG setup folder if present and assets/static folders where relevant.
- Define pages vs components.
- Define admin vs player-facing gameplay boundary.
- Define game vs hero boundary.
- Define shared/layout/public ownership rules.
- Define empty/legacy folder handling and route/folder naming issue handling.
- Add private dynamic route / SSR / prerender rule: private/user-specific dynamic routes must not be prerendered; check server route config when relevant.
- Add placement issue classification labels.

**Non-goals:** no folder moves, no route renames, no UI/SCSS refactor, no deletion, no status docs.

**Acceptance criteria:**

- The document explains where player gameplay belongs.
- The document explains where admin/config/balance/sandbox tools belong.
- It flags that admin should not become the home of normal player gameplay.
- It includes a classification system for inventories.
- It includes SSR/private dynamic route guidance.
- Existing drafts are updated, not duplicated.
- It includes report requirements for future app-structure refactor tasks.

**Verification:** Markdown only; no build required.

**Required Codex chat report:** short summary of files changed, sources read, top-level folders considered, ambiguous ownership cases, user decisions needed.

---

# Phase 1 — Inventories

Phase 1 creates maps. It does not perform broad cleanup.

## Task ARCH-PRE-3 — Generate core inventory

**Goal:** Create a machine-assisted inventory of `src/app/core` using `core-rules.md`.

**Output file:**

```text
docs/refactor/core/core-inventory.md
```

If the file already exists, update it in place or regenerate the relevant sections according to the task scope.

**Scope:**

- Read `core-rules.md`, `app-architecture-rules.md`, source-order docs and current repo structure.
- Scan `src/app/core`.
- Inventory each relevant file with:
  - path;
  - folder;
  - apparent category;
  - exported functions/classes/interfaces/types/constants;
  - naming pattern/suffix, e.g. mapper, rpc, display, dictionary, state, action, guard, validator, factory;
  - whether a spec/test exists nearby;
  - rough usage/import evidence where practical;
  - placement classification using `core-rules.md`.

**Classification labels:**

- `correct_owner`;
- `misplaced_candidate`;
- `duplicate_mechanics_candidate`;
- `generic_primitive_candidate`;
- `domain_specific_keep`;
- `legacy_or_transitional`;
- `unused_or_unknown`;
- `needs_user_decision`.

**Non-goals:** no code moves, no helper extraction, no deletion, no final cleanup decisions, no status docs.

**Acceptance criteria:**

- Inventory covers current `src/app/core`.
- It is grouped by folder and mechanic family.
- It identifies obvious misplaced candidates.
- It identifies duplicate-mechanics candidate families without refactoring them.
- It avoids universal helpers for unrelated gameplay domains.
- It includes confidence notes where classification is uncertain.

**Required Codex chat report:** commands used, number of files scanned, major families found, top cleanup candidates, keep-domain-specific examples, user decisions needed. Keep chat short; full evidence goes in the inventory file.

---

## Task ARCH-PRE-4 — Generate app structure inventory

**Goal:** Create an inventory of top-level `src/app` structure using `app-architecture-rules.md`.

**Output file:**

```text
docs/refactor/app/app-structure-inventory.md
```

If the file already exists, update it in place or regenerate the relevant sections according to the task scope.

**Scope:**

- Read `app-architecture-rules.md`, `core-rules.md`, source-order docs and current repo structure.
- Scan top-level `src/app` folders.
- Inventory:
  - folder purpose;
  - pages/components/config/services/state/helpers present;
  - empty folders;
  - duplicate route concepts;
  - possible legacy folders;
  - player gameplay in admin risk;
  - admin tooling in player route risk;
  - component/page boundary issues;
  - feature folders that appear too large or too state-heavy;
  - private dynamic route / SSR / prerender risks where route config evidence is available.

**Classification labels:** use the labels from `app-architecture-rules.md`.

**Non-goals:** no folder moves, no route renames, no deletion, no feature implementation, no status docs.

**Acceptance criteria:**

- Inventory covers current top-level `src/app`.
- Empty and near-empty folders are listed.
- Duplicate/ambiguous route concepts are listed.
- Large feature folders are identified as future refactor candidates.
- Admin/game/hero boundary concerns are called out.
- The inventory separates valid admin tool from player-flow-in-admin risk.
- Private dynamic route/prerender risks are called out when visible from route configuration.

**Required Codex chat report:** commands used, folders scanned, empty/legacy folders, misplaced candidates, duplicate route concepts, suggested first feature folders for later cleanup, user decisions needed. Keep chat short; full evidence goes in the inventory file.

---

# Phase 2 — Candidate maps

## Task ARCH-PRE-5 — Core placement and duplicate candidate map

**Goal:** Use `core-inventory.md` to prepare a candidate map for future core refactor implementation tasks.

**Output file:**

```text
docs/refactor/core/core-refactor-candidate-map.md
```

**Scope:**

- Read `core-rules.md`, `core-inventory.md`, `app-architecture-rules.md`, `app-structure-inventory.md` if available.
- Produce candidate groups:
  - obvious misplaced code;
  - duplicate mechanics by family;
  - generic primitive extraction candidates;
  - feature-local candidates that should not be in core;
  - domain-specific mappers to keep;
  - validators/factories/form configs cleanup candidates;
  - services/state/action/resolver candidates;
  - orphan/legacy/unknown candidates.

**Non-goals:** no implementation refactor, no code moves, no deletion, no final accepted backlog, no status docs.

**Acceptance criteria:**

- Candidate map is evidence-backed.
- Each candidate references file paths/symbols.
- Each candidate has risk level and suggested first safe slice.
- It distinguishes duplicate mechanics from domain semantics.
- It identifies candidates requiring user/design decision.

**Required Codex chat report:** candidate group counts, top 5 safe candidates, top 5 risky candidates, user decisions needed. Full evidence goes in the candidate map file.

---

## Task ARCH-PRE-6 — App placement and structure candidate map

**Goal:** Use `app-structure-inventory.md` to prepare a candidate map for future app-structure cleanup tasks.

**Output file:**

```text
docs/refactor/app/app-refactor-candidate-map.md
```

**Scope:**

- Read `app-architecture-rules.md`, `app-structure-inventory.md`, `core-rules.md`, `core-inventory.md` if available.
- Produce candidate groups:
  - empty/legacy folders;
  - duplicate route concepts;
  - player-flow-in-admin risks;
  - admin-tool-in-player-route risks;
  - component/page boundary issues;
  - promote-to-core candidates;
  - promote-to-shared candidates;
  - private route/prerender risks;
  - needs-user-decision cases.

**Non-goals:** no code moves, no route rename, no deletion, no implementation refactor, no status docs.

**Acceptance criteria:**

- Candidate map is evidence-backed.
- Each candidate references file/folder paths.
- It distinguishes real misplaced code from valid admin tooling.
- It does not treat empty folders as authority for future architecture.
- It identifies route/name decisions that need user approval.

**Required Codex chat report:** candidate group counts, top safe candidates, top risky candidates, user decisions needed. Full evidence goes in the candidate map file.

---

# Phase 3 — Final refactor backlog candidate

## Task ARCH-PRE-7 — Prepare final refactor backlog candidate

**Goal:** Prepare a candidate final architecture refactor backlog based on the accepted rules, inventories and candidate maps.

**Output file:**

```text
docs/refactor/codex-mythsworn-refactor-backlog-candidate.md
```

Do not replace the existing refactor backlog unless the user explicitly asks. Preserve useful existing refactor backlog content and identify how old tasks should map into the new structure.

**Scope:**

- Read accepted or reviewed:
  - `core-rules.md`;
  - `app-architecture-rules.md`;
  - `core-inventory.md`;
  - `app-structure-inventory.md`;
  - `core-refactor-candidate-map.md`;
  - `app-refactor-candidate-map.md`;
  - existing current refactor backlog.
- Prepare a candidate backlog with implementation phases such as:
  - Core placement cleanup;
  - Core utils/mapper/display/dictionary cleanup;
  - Services/state/actions/resolvers cleanup;
  - Forms/factories/validators cleanup;
  - Types/interfaces/domain cleanup;
  - App structure cleanup;
  - Feature folder dedup against core;
  - Static diagnostics/guardrails if justified.
- Preserve/migrate useful existing refactor backlog tasks rather than silently dropping them.
- Mark implementation phases as candidate only until user accepts.

**Non-goals:** no implementation refactor, no code moves, no status docs, no automatic replacement of existing backlog.

**Acceptance criteria:**

- Candidate backlog is based on evidence from inventories/maps.
- Existing refactor backlog content is not silently discarded.
- Tasks are small enough to prompt Codex.
- Audit-only tasks lead to concrete implementation tasks.
- Broad refactors remain blocked until user accepts the final backlog.

**Required Codex chat report:** proposed backlog structure, old backlog content preserved/mapped, unresolved decisions, recommended first implementation phase. Keep chat short; full candidate backlog goes in the output file.

---

# Locked future phases

The phases below are intentionally locked until the user reviews and accepts Phase 0–3 outputs.

Do not execute these as implementation tasks from this pre-refactor backlog without explicit user approval.

## Locked Phase A — Core placement cleanup

Move obvious misplaced files only after inventory and candidate maps are accepted.

## Locked Phase B — Shared mechanics extraction

Extract narrow reusable mechanics such as JSON readers, dictionary option mappers, request state primitives, stale guard helpers or action lifecycle helpers only when backed by candidate-map evidence.

## Locked Phase C — Forms / factories / validators cleanup

Clean form configs, factories and validators according to `core-rules.md`, using Reactive Forms and avoiding new `ngModel`.

## Locked Phase D — Types / interfaces / domain cleanup

Resolve `types` vs `interfaces` vs `domain` placement only after inventory shows concrete misplaced cases.

## Locked Phase E — Services / state / actions / resolvers cleanup

Extract shared services/workflow mechanics without creating universal gameplay services.

## Locked Phase F — Feature folder dedup against core

Refactor large feature folders such as `game/pages/vicinity` only after core rules and core inventory are accepted. The task must compare local helpers/state/runners/guards/mappers/display functions against accepted core helpers and remove only proven duplicate mechanics.

## Locked Phase G — Static diagnostics / guardrails

Optional later tooling or scripts for detecting new `ngModel`, misplaced validators, feature-local duplicate helpers, broad utility misuse, private route prerender risks or other recurring architecture violations.
