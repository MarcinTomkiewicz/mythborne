# Mythsworn frontend execution rules

Apply the repository-root `AGENTS.md` first. This file adds frontend-only rules for work under `src/app`.

## Angular / PrimeNG / UI hard rules

Use modern Angular, signals-first patterns, Reactive Forms and PrimeNG patterns already used by the project.

Blocked unless the current task explicitly allows:

* `ngModel` / `FormsModule`;
* deprecated PrimeNG APIs;
* native form controls where PrimeNG/project wrappers are expected;
* `p-select` nested inside native `<label>`;
* copied prototype CSS;
* prototype `mb-*` classes;
* raw gradients/palette values copied from prototypes;
* local SCSS duplicating global utilities/shared patterns;
* local `.p-*` PrimeNG skins;
* `::ng-deep` without an explicit blocker;
* raw DB keys/UUIDs as primary UI labels;
* `muted-text` / `color-muted` on important values, decisions, warnings, reasons, outcomes, hero names, item names, ranks or selected states;
* fake UI data, counters, labels, eligibility, timers or actions.

For UI tasks:

* read task-relevant UI/UX guidance first;
* use existing utilities, wrappers and shared components before local SCSS/components;
* preserve accepted prototype visual anchors when prototype-backed;
* report missing production patterns instead of flattening them into generic cards;
* make manual/route smoke explain domain meaning, not only click paths.

If production pattern or data needed for UI is missing, report the missing pattern or DB/RPC/read-model gap. Do not invent a frontend fallback.

## UI utilities and SCSS

Do not use SCSS to recreate layout utilities.

Before adding local SCSS for display, flex, grid, gap, margin, padding, width, height, alignment, position, overflow, z-index, border, radius or background, check existing utilities and global patterns.

Use an existing utility when available.

Feature-local SCSS is allowed only for narrow component geometry or state styling that has no existing utility/pattern and is not reusable. Every local SCSS addition must have an explicit reason.

Local SCSS duplicating global utilities is a required fix, not a follow-up.

## Stale guards

Every async UI workflow depending on selected server, active hero, route id, selected entity, target item/hero, current case/sanction/penalty, access context or route context must guard success and error paths.

Required behavior:

* stale success must not overwrite current state;
* stale error must not show after context changes;
* loading ends only for the active request/context;
* changing context clears stale form state and feedback;
* responses for no-longer-selected entities are ignored.

Fix a missing stale guard in touched async code in the same task or report a blocker when it needs broader contract work.

## Specs policy

A passing spec is not proof that the application works. Specs are not acceptance evidence for player-facing UI, DB/RPC workflows or domain runtime.

Do not add or expand `.spec.ts` files unless the current task explicitly asks for test work.

If an existing spec fails because production code is broken by the current task, fix production code, not the spec.

If a spec preserves behavior intentionally removed by the task, delete the stale spec. If it still protects current behavior and only needs import/name cleanup after a move, update only that cleanup.

Do not write self-fulfilling specs that assert mocks, constants or implementation details created in the same task. Do not treat focused specs as proof that UI or game flow works.
