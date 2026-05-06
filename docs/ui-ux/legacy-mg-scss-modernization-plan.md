# Legacy `mg-*` SCSS Modernization Plan

Status: UI-CORE-7 draft for review  
Scope: documentation only; no Angular, SCSS, DB/RPC or generated-type changes

This document defines how to treat the existing Monster Hunt / `mg-*` styling layer while Mythsworn UI work continues. The current `mg-*` layer is production compatibility, not final branding. Future UI work should reuse it deliberately, add aliases globally when needed, and avoid feature-local rebrands.

Use with:

- `docs/ui-ux/mythsworn-style-contract.md`;
- `docs/ui-ux/global-scss-shared-inventory.md`;
- `docs/ui-ux/local-scss-budget-checklist.md`;
- `docs/ui-ux/shared-surface-patterns.md`;
- `docs/ui-ux/primeng-vendor-wrapper-lookup.md`.

## Authority

The existing Angular app and global SCSS remain the production source. Prototypes are visual reference only and must not introduce a local `mb-*` system into Angular. `mg-*` classes can remain in templates until a reviewed global alias or shared component replaces them.

Do not rename broadly for branding alone. Rename or alias only when it improves reuse, clarifies semantics, or unblocks a repeated production pattern.

## Current Inventory Summary

| family | examples | status | modernization direction |
|---|---|---|---|
| Surface/card | `.mg-card`, `.mg-card--legend`, `.card-legend` | legacy-compatible, heavily used | Keep. Add semantic global variants through UI-CORE-9 rather than local card classes. |
| Section/layout | `.mg-section`, `.mg-section__title`, `.mg-section__subtitle`, `.mg-grid`, `.mg-container` | production-ready/legacy-compatible | Keep as current page composition foundation. Future aliases can wrap page header/detail/summary patterns globally. |
| Badges | `.tag-badge`, `.tag-badge--*`, `.tag-badge.green`, `.tag-badge.gm`, `.tag-badge.owner` | mixed: canonical variants plus compatibility aliases | Use canonical `.tag-badge--*` in new UI. Keep aliases until usage audit and safe migration. |
| Forms | `.mg-form`, `.grid-form`, `.form-field`, PrimeNG wrappers | production foundation with audit gaps | Keep. Do not broaden `_p-select.scss` scope or local override `.p-*` internals without wrapper review. |
| Vendor wrappers | `.mg-toast`, `.mg-dialog`, `.mg-confirmdialog`, `.mg-popover-menu__link` | production-ready/legacy-compatible | Keep. Add missing variants globally only through wrapper/style tasks. |
| Theme tokens | `--mg-*`, SCSS variables in `abstracts/_variables.scss` | production source | Keep as token foundation. Do not copy prototype `--mb-*` values. |
| Icons | custom icon registry, PrimeIcons local wrapper | production source | Keep. UI-CORE-10 can define brand/final icon aliases later. |
| Empty placeholders | `abstracts/_functions.scss`, `base/_icons.scss` | not real APIs | Do not build on them until a dedicated task gives them content/purpose. |

## Compatibility Classification

| pattern | classification | rule |
|---|---|---|
| `mg-card` | keep | Default production surface class. |
| `mg-card--legend` / `card-legend` | keep until page-header/card variants exist | Useful but visually specific; do not create feature-local replacements. |
| `mg-grid`, `grid-cols-*`, flex/gap/spacing utilities | keep | Valid composition utilities within UI-CORE-3 class budget. |
| `mg-section__title`, `mg-section__subtitle`, `mg-section__eyebrow` | keep | Current section title API; future page-header aliases should be global/shared. |
| `tag-badge--primary/success/danger/info/warn/arcane/muted/golden` | canonical current API | Prefer these for new UI. |
| `tag-badge.green/blue/gray/violet/golden` | compatibility alias | Do not use in new UI; migrate when touching relevant code if safe. |
| `tag-badge.join/gm/reception/owner/coowner/member/club/mine/muted` | legacy domain alias | Compatibility only. Use semantic canonical variants in new UI. |
| `mg-toast--info/success/danger/arcane` | keep | Current toast wrapper API. Warning remains a documented wrapper gap. |
| `mg-button-*` | compatibility | Use PrimeNG `p-button` wrapper first for new commands unless existing pattern requires this class. |
| `mg-color-*`, `mg-space-*`, `mg-radius-*` utility tokens/classes | compatibility | Use only if already part of global utility pattern; avoid decorative one-off styling. |
| `mb-*` prototype classes | blocked in Angular | Do not copy. Note that Bootstrap-like spacing utilities such as `mb-0` are not prototype classes and are outside this ban. |

## Alias Strategy

Add aliases only globally and only after a usage check.

| target alias | maps to | when to add | notes |
|---|---|---|---|
| `myth-page-header` or `mg-page-header` | current section/card composition | UI-CORE-9 or first page-header implementation | Prefer the already planned `mg-page-header` naming from UI-CORE-4 unless a review decides Mythsworn-branded names. |
| `mg-summary-card` | `.mg-card` plus repeated summary layout | UI-CORE-9 | Do not create `auction-summary-card` / `pvp-summary-card` duplicates. |
| `mg-stat-card` | `.mg-card` plus metric layout | UI-CORE-9 | Use for dashboard/admin counters when repeated. |
| `mg-note-panel` | note/info/dependency panel | UI-CORE-9 | Should replace repeated muted diagnostic cards. |
| `mg-status-pill` / `mg-chip` | badge/chip semantics | UI-CORE-9 | Share color semantics with `.tag-badge--*`. |
| `brand-mythsworn` / `brand-mark-m` | accepted shell brand mark | UI-CORE-10 | Do not remove existing visible Mythsworn mark before final registry exists. |

Avoid adding both `myth-*` and `mg-*` names for the same thing without a migration reason. For now, `mg-*` remains the practical production prefix.

## Migration Rules

1. Check real usage with `rg` before changing a class or alias.
2. Keep existing `mg-*` classes when they are widely used or coupled to vendor wrappers.
3. Add global aliases before touching multiple features.
4. Migrate touched templates opportunistically from legacy badge aliases to canonical `.tag-badge--*` only when it is semantically obvious.
5. Do not remove alias SCSS until static grep proves no production usage.
6. Do not treat spacing helpers such as `mb-0`, `mb-lg`, `mb-md` as prototype `mb-*` leakage without checking their origin.
7. Keep PrimeNG wrapper changes in `src/scss/vendors`; feature-local `.p-*` skins remain blocked by default.

## Cleanup Candidates

| candidate | safe to remove now | reason |
|---|---|---|
| `abstracts/_functions.scss` | no | Empty placeholder, but removal is unnecessary churn and may affect import structure later. |
| `base/_icons.scss` | no | Empty placeholder, but UI-CORE-10 may decide whether it should become an icon API. |
| legacy badge aliases in `_badges.scss` / `_tag-badge-aliases.scss` | unknown | Usage audit required. Keep compatibility until no templates use them. |
| `mg-button-*` direct usage | unknown | Needs template audit and PrimeNG button replacement plan. |
| broad `_p-select.scss` scope | no | Documented as needs usage audit; do not rewrite as part of UI-CORE-7. |
| prototype `mb-*` classes in docs archive | no | Archive is allowed; block only production Angular/SCSS copying. |

## Review Checklist

Future UI tasks touching styles must report:

- reused legacy compatibility:
- canonical replacement used:
- aliases added:
- cleanup candidates:
- safe to remove now yes/no/unknown:
- copied from prototype: no:
- local SCSS added:
- usage grep performed:
