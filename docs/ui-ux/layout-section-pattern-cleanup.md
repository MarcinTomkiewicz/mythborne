# Layout Utilities And Section Pattern Cleanup

Status: UI-CORE-15 draft for review  
Scope: documentation and cleanup rules only; no Angular, SCSS, runtime, DB/RPC or generated-type changes

This document defines how to use existing layout utilities, section/header patterns, prose lists, scrollbars and image slots without turning templates into repeated utility soup. It extends:

- `docs/ui-ux/mythsworn-style-contract.md`;
- `docs/ui-ux/global-scss-shared-inventory.md`;
- `docs/ui-ux/local-scss-budget-checklist.md`;
- `docs/ui-ux/shared-surface-patterns.md`;
- `docs/ui-ux/surface-badge-pattern-expansion.md`;
- `docs/ui-ux/utility-class-audit.md`;
- `docs/ui-ux/table-paginator-list-decision.md`;
- `docs/ui-ux/icon-brand-registry.md`.

## Sources Checked

| source | result |
|---|---|
| `src/scss/layouts/_components.scss` | Defines `mg-container`, `mg-section`, `mg-section--full`, `mg-section--center`, `mg-section__header`, `mg-section__title`, title size modifiers, subtitle modifiers, `image__preview` variants and `mg-loading-overlay`. |
| `src/scss/layouts/_grid.scss` | Defines `mg-grid`, auto-fit/fill grids, `mg-grid-2/3/4/4-soft`, `grid-cols-*`, responsive `grid-cols-*-bp`, alignment utilities and common `grid-2-1`, `grid-1-2`, `grid-1-1`. |
| `src/scss/base/_flex.scss` | Defines row/column flex containers, responsive flex direction/alignment, wrap, basis, min/max width and flex fixed helpers. |
| `src/scss/base/_lists.scss` | Globally resets `ul` padding and removes native bullets from `ul li`; supports `li--unset` and `li--bullet-<custom-icon>`. |
| `src/scss/base/_scrollbars.scss` | Global scrollbar styling exists and should remain global. |
| `src/scss/base/_img.scss` | Global media defaults exist for `img`, `svg`, `video` and `canvas`. |
| Representative `src/app/**/*.html` grep | Current templates heavily use `mg-section__title`, responsive header rows, `flex-col gap-xl w-100`, `mg-grid grid-cols-*`, `grid-2-1`, and `image__preview`. |

## Layout Source Order

Before adding local layout SCSS or a new wrapper class, check in this order:

1. Shared/layout Angular component.
2. Existing page/section primitives: `mg-container`, `mg-section`, `mg-section__title`, `mg-section__subtitle`.
3. Existing grid primitives: `mg-grid`, `mg-grid-auto-fit`, `grid-2-1`, `grid-1-2`, `grid-cols-*`.
4. Existing flex primitives: `flex-row-*`, `flex-col`, responsive `flex-col-sm/md`, `flex-wrap`, `flex-1`.
5. Existing surface/card/status patterns from UI-CORE-4/9.
6. Narrow feature-local layout SCSS only as a documented exception.

Prototype layout class names, `mb-*` prototype classes, gradients, palette values and copied shadows are not production sources.

## Section And Header Rules

| pattern | use for | do not use for | notes |
|---|---|---|---|
| `mg-container` | Shell/main content width and route-level horizontal containment. | Nested cards or arbitrary inner row sizing. | Keep shell/content containment centralized. |
| `mg-section` | Public/content sections where vertical rhythm is wanted. | Dense game/admin card stacks if `mg-card`/route layout is already providing rhythm. | Current app often uses card sections directly; do not force `mg-section` everywhere. |
| `mg-section__header` | Centered public/content section header. | Action-heavy game/admin page headers. | Future `mg-page-header` should cover action-heavy headers. |
| `mg-section__title` | Current production title styling for route titles, card headings and compact headings. | Generic value emphasis, status text, errors or labels. | Use size modifiers deliberately; avoid hero-scale title inside dense cards. |
| `mg-section__title--sm/xs` | Compact page/card/admin headings. | Body copy or metric values unless current pattern already uses it for stat cards. | Future `mg-stat-card` should define metric hierarchy. |
| `mg-section__subtitle` | Neutral supporting copy under a section title. | Errors, blockers, eligibility reasons, workflow outcomes. | Follow UI-CORE-8 for semantic text. |
| `mg-section__eyebrow` | Existing template usage only until runtime SCSS is checked/added. | New production dependency without verifying class exists. | `mg-section__eyebrow` appears in templates but was not found in `_components.scss`; treat as a wrapper gap. |

## Repeated Section Patterns Found

| repeated pattern | current role | cleanup decision |
|---|---|---|
| `flex-col gap-xl w-100` wrapping page content | Route-level vertical stack. | Keep for now; future page shell/page content pattern may replace it. |
| `flex-row-between-center flex-col-sm gap-md` at top of cards/pages | Responsive heading plus actions. | Future `mg-page-header` / `mg-section-header` candidate. Do not create local header classes per page. |
| `mg-card p-lg w-100` section cards | Full-width card section. | Keep until surface runtime pattern exists; future `mg-detail-panel` / section surface may replace repeated use. |
| `mg-grid grid-cols-* grid-cols-*-bp gap-* w-100` | Responsive forms/metrics/list summaries. | Keep as utility when composition differs; extract only repeated semantic row/card layouts. |
| `grid-2-1 gap-xl` | Main/detail split layout. | Keep as existing common layout. Do not duplicate with local 2:1 grids. |
| `image__preview image__preview--square/circle w-px-*` | Avatar/building/media slot. | Keep as current image slot pattern; future item/banner/brand slots should extend this globally. |

## Grid And Flex Rules

Use grid when:

- content is two-dimensional and column alignment matters;
- forms or metric summaries need predictable responsive columns;
- page layout needs known splits such as `grid-2-1` or `grid-1-2`;
- item/card grids need stable column collapse.

Use flex when:

- content is one-dimensional;
- a header row needs title/actions;
- badges/actions need wrapping;
- label/value rows need horizontal alignment.

Do not use grid/flex utilities to:

- encode gameplay/access state;
- hide missing read-model data;
- force text into clipped controls;
- replicate a repeated semantic component with different local class piles.

## Prose And List Styling

Global list styling currently affects all `ul` and `ul li`:

- `ul` padding is reset to `0`;
- `ul li` removes native list style and adds custom left padding;
- icon bullets are opt-in through `li--bullet-<custom-icon>`;
- `li--unset` exists as an escape hatch.

Rules:

- For prose/report/admin explanatory lists, verify readability after any touched-file change.
- Do not assume browser-default bullets are available.
- Use semantic HTML lists when the content is a real list, but report whether current global list styling is acceptable.
- If prose lists need default bullets/spacing, add a future global prose-list pattern rather than feature-local resets.
- Do not add local `ul/li` resets in feature SCSS unless a review names the global follow-up.
- Do not use icon bullet classes unless the icon exists in the custom icon registry and the bullet is decorative/supplementary.

Current gap:

| gap | impact | future action |
|---|---|---|
| No documented prose-list class | Reports/admin prose may inherit compact custom list styling. | Add a global prose/list pattern only when a runtime task changes SCSS and includes visual smoke. |

## Scrollbar Rules

- Keep scrollbar styling global through `src/scss/base/_scrollbars.scss`.
- Do not add feature-local scrollbar skins.
- Scroll containers may use existing overflow utilities, but the content must remain reachable and readable.
- If a feature needs a special scroll area, document the containment reason and prefer a shared/global pattern.

## Image, Banner, Logo And Item Art Slots

Current production image patterns:

- global media defaults from `_img.scss`;
- `image__preview` with `image__preview--circle`, `image__preview--square`, `image__preview--landscape`;
- `image__preview-image` for object-fit cover inside preview slots.

Use these for:

- hero/avatar images;
- building/mansion art;
- item art once a DB-backed item image/read-model contract exists;
- future banner/logo slots only after the brand asset registry has real assets.

Do not:

- reference direct `/icons/*.svg` from feature templates for brand/item art;
- add copied prototype image wrappers;
- invent item art if the item read model has no asset;
- make canvas/minigame hosts use `image__preview` unless the renderer is actually media preview, not interactive gameplay.

Missing future slots:

| slot | dependency |
|---|---|
| `brand-mark-m`, wordmark and banner | UI-CORE-10 asset task. |
| Item art slot | DB-backed item display/popover contract plus asset source. |
| Minigame renderer host | Future minigame renderer boundary, not generic image preview. |

## Layout Cleanup Rules For Future Tasks

When touching a route/template:

1. Keep existing `mg-section__title` usage if it matches heading hierarchy.
2. Do not add new `mg-section__eyebrow` usage until the class is verified or added globally.
3. Replace repeated local header stacks only when a shared/global header pattern exists in scope.
4. Keep `grid-2-1`, `mg-grid`, `grid-cols-*` and flex utilities for real layout composition.
5. Report repeated 4+ class layout stacks as extraction candidates per UI-CORE-13.
6. Check prose lists if the file contains `ul`/`li`.
7. Keep scrollbars global.
8. Use `image__preview` for fixed media slots and justify fixed px sizes.
9. Do not perform big-bang HTML rewrites.

## Runtime Follow-Ups

This task does not implement runtime classes. Future runtime SCSS/shared tasks should consider:

- `mg-page-header` / `mg-section-header` for repeated action-heavy headers;
- a global prose/list pattern for reports/admin explanatory copy;
- final semantics for `mg-section__eyebrow` because it appears in templates but is not defined in `_components.scss`;
- banner/logo/item art slot patterns after real asset/read-model contracts exist;
- visual smoke for route-level stack, card section, prose list, image preview and mobile header wrapping.

## Required Report Addendum

Future UI tasks touching layout/section/list/media patterns should include:

```md
Layout:
- layout utilities reused:
- section/header patterns used:
- repeated layout stacks found:
- extraction candidates:
- prose/list impact:
- scrollbar impact:
- image/media slots:
- fixed px justified:
- local SCSS added:
- copied from prototype:
- responsive/accessibility smoke:
```

## Verification Notes

This task is MD-only. `npx tsc --noEmit`, focused specs and `npm run build` are not required unless a future implementation changes Angular/SCSS/runtime files.
