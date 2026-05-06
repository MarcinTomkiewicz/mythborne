# Local SCSS Budget And Styling Report Checklist

Status: UI-CORE-3 draft for review  
Scope: reporting and review rules only; no lint automation

Use this checklist for larger UI tasks and any task that touches templates, global SCSS, feature-local SCSS, shared/layout components or PrimeNG wrappers. It extends `docs/ui-ux/mythsworn-style-contract.md` and `docs/ui-ux/global-scss-shared-inventory.md`.

## Default Styling Lookup

Before adding local SCSS or a new class, check in this order:

1. Shared/layout Angular component.
2. PrimeNG component with existing vendor wrapper.
3. Global `mg-*` surface/layout/utility class.
4. Existing shared feature-local pattern in the same page/module.
5. New global/shared pattern if the need is repeated or prototype-backed.
6. Feature-local SCSS only as a narrow exception.

The inventory is a guide, not permission to skip reading the actual code. Each UI task still needs a real reuse check against current files.

## Class Budget

| template element | budget | review rule |
|---|---:|---|
| Normal semantic element | 1-2 classes | Expected default. |
| Layout wrapper | up to 3 classes | Allowed when using existing grid/flex/spacing utilities. |
| Repeated item/card/list row | up to 3 classes | If repeated across a feature, consider a shared pattern/component. |
| PrimeNG host/component | existing wrapper classes only | Do not add feature-local `.p-*` skins. |
| More than 3 classes | exception | Must be justified in the report. |

Dense utility combinations are acceptable only when they are short-lived composition or clearly simpler than a component. Repeated combinations such as `mg-card flex-col gap-* p-*` across many rows are a signal to promote a global/shared pattern.

## Local SCSS Budget

Local SCSS is allowed for:

- page-specific layout composition;
- a one-off responsive grid or placement rule that does not belong globally;
- host sizing or containment for a route/component;
- a temporary migration wrapper with a clear follow-up.

Local SCSS is not allowed for:

- new color tokens or palette values;
- new card/surface/badge/chip/button systems;
- copied prototype gradients, borders, shadows or `mb-*` rules;
- gameplay/access-control visibility logic;
- DB status semantics, labels or dictionary meaning;
- PrimeNG internal overrides without a documented blocker.

If local SCSS grows beyond narrow layout composition, stop and decide whether the pattern belongs in global SCSS, a shared component or a vendor wrapper.

## PrimeNG Override Rule

Feature-local PrimeNG overrides are blocked by default:

- no local `.p-button`, `.p-select`, `.p-datatable`, `.p-popover`, `.p-dialog`, `.p-tabs` skins;
- no local `::ng-deep` for PrimeNG styling without an explicit reason;
- no duplicated PrimeNG focus/hover/disabled styling in feature files.

Allowed exceptions:

- a documented PrimeNG bug/workaround scoped to one component;
- a host layout rule around a PrimeNG component, not styling its internals;
- a temporary migration where the report names the global wrapper follow-up.

## Copied Prototype Rule

Every prototype-backed task must report `copied from prototype: yes/no`.

Expected answer is `no`. A `yes` answer is normally a blocker unless the copied part is explicitly approved non-style static placeholder content for a temporary mock. CSS, layout class names, palette values and gradients from prototype HTML must be translated into production global/shared/vendor patterns instead.

## DB And Access Rule

CSS visibility is not access control. UI may hide unavailable actions for usability, but backend/RPC/domain rules remain authoritative.

Do not hardcode gameplay labels, admin dictionaries, eligibility reasons, counters, report content or notification meaning in SCSS/classes. Use DB/RPC/read-model data where it exists; report a DB/read-model blocker where it does not.

## Required Styling Report

Add this section to future UI task reports:

```md
Styling:
- prototype source: ...
- archive/status source checked: ...
- reused shared/layout/vendor/global patterns: ...
- checked but not reused: ...
- global tokens/classes used: ...
- local SCSS added: yes/no + why
- local SCSS class count risk: pass/fail + comment
- 3+ class elements justified: yes/no/not applicable
- copied from prototype: yes/no
- PrimeNG local override: yes/no + reason
- DB/read-model blockers: ...
- accessibility/responsive smoke: ...
```

## Review Questions

Before accepting a UI task, review should be able to answer:

- Did the task check the inventory and real code before adding styles?
- Did it reuse shared/layout/vendor/global patterns where possible?
- Are local classes layout-only and narrowly scoped?
- Are repeated utility combinations becoming a hidden component system?
- Did any prototype CSS or `mb-*` production class leak into Angular?
- Are PrimeNG internals styled through vendor wrappers or a justified exception?
- Does responsive behavior avoid overlap, clipped controls and unreadable text?
- Are icon-only controls accessible?
- Is status conveyed with text, not color alone?
- Does any hidden UI still rely on DB/RPC authority for real permissions?

## Automation Note

No stylelint/custom lint automation was found during UI-CORE-3 discovery. Do not add lint tooling in this task. A later tooling task can consider automated checks for local `::ng-deep`, feature-local `.p-*`, copied prototype `mb-*` classes and oversized class lists.
