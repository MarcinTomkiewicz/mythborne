# Utility Class Audit, Semantics And Usage Pass

Status: UI-CORE-13 draft for review  
Scope: documentation and audit guidance only; no Angular, SCSS, runtime, DB/RPC or generated-type changes

This document defines how production templates should use global utility classes without turning utility stacks into local design systems. It extends:

- `docs/ui-ux/mythsworn-style-contract.md`;
- `docs/ui-ux/global-scss-shared-inventory.md`;
- `docs/ui-ux/local-scss-budget-checklist.md`;
- `docs/ui-ux/text-utility-semantics.md`;
- `docs/ui-ux/surface-badge-pattern-expansion.md`.

## Sources Checked

| source | result |
|---|---|
| `src/scss/utilities/*` | Real utility API exists for spacing, gap, width/height, display, overflow, visibility, opacity, backdrop, shadows, transitions, animations and text helpers. |
| `src/scss/base/_flex.scss` | Flex row/column helpers are a production source and are heavily used in templates. |
| `src/scss/layouts/_grid.scss` | Grid utilities are production source for page and card composition. |
| `src/scss/base/_surface.scss` and `_badges.scss` | Surfaces and badges should be preferred over visual utility piles. |
| Representative `src/app/**/*.html` grep | Repeated utility combinations exist and should guide future global/shared pattern extraction, not immediate rewrite. |

## Utility Matrix

| utility family | allowed use | do not use | preferred alternative |
|---|---|---|---|
| Spacing: `m*`, `p*`, `mb-0`, `mt-*`, `px-*`, `py-*` | Simple spacing around existing production components and layout sections. `mb-0` is allowed for paragraph reset. | Feature-local rhythm systems, copied prototype spacing, arbitrary spacing as semantics. | Global/shared pattern if the same spacing stack repeats across cards/rows. |
| Gap: `gap-*`, `row-gap-*`, `col-gap-*` | Pair with existing flex/grid utilities for simple composition. | Dense nested stacks that hide repeated row/card patterns. | Future `mg-summary-row`, `mg-detail-panel`, `mg-stat-card` or shared component. |
| Width percent: `w-*`, `w-*-sm/md/...`, `w-auto` | Form controls, full-width cards, responsive wrappers, known grid/flex fill behavior. | Using width to fake access/visibility or to force text into clipped layouts. | Grid/flex container, PrimeNG wrapper, or local layout-only SCSS when a route needs containment. |
| Fixed width: `w-px-*`, `min-w-*`, `max-w-*` | Stable icon/avatar/media/control sizing where fixed format is intentional and responsive behavior is checked. | Random pixel sizing for content cards, tables, text columns or prototype parity. | Aspect ratio, grid tracks, shared media/avatar pattern, or documented local layout exception. |
| Height: `h-*`, `h-px-*`, `max-h-*` | Scrollable previews, fixed media/canvas hosts, stable progress/control areas. | Hiding content, forcing text clipping, or gameplay state semantics. | `overflow-*` plus accessible content, route-local containment, or shared renderer host. |
| Display: `d-block`, `d-contents` | Narrow semantic/layout fixes where native display is the issue. | Access control, conditional workflow state, or bypassing Angular structural rendering. | Angular conditionals plus backend/RPC authority; shared layout component. |
| Visibility: `show-*`, `hide-*` | Responsive layout adaptation only. | Permission checks, staff/player access, hidden gameplay state, hidden destructive actions. | DB/RPC/domain guards plus explicit unavailable state in UI. CSS visibility is not access control. |
| Opacity: `opacity-*` | Disabled-looking visual treatment only when actual disabled/access state is also represented semantically. | Sole indicator for unavailable actions, eligibility, moderation status, failure or stale data. | `disabled`, `aria-disabled`, `tag-badge--*`, note panel, explicit reason text. |
| Shadows: `shadow-*` | Rare emphasis on existing surfaces when a global pattern calls for it. | Creating local elevated card systems or copying prototype shadows. | Future `mg-card--elevated` / `mg-card--selected`; existing `mg-card`. |
| Backdrop: `backdrop-blur-*` | Shell/overlay cases where existing global behavior already expects blur. | Decorative feature backgrounds, local glass-card systems, prototype visual copying. | PrimeNG dialog/drawer/popover wrappers or app shell pattern. |
| Background/border utilities | Small layout states or compatibility use where global class already exists. | New palettes, card variants, status semantics or decorative one-off systems. | Surface/badge/note-panel pattern or future global variant. |
| Transition utilities | Simple hover/open/close transitions on existing interactive UI. | Gameplay timing authority, combat/minigame result meaning, forced motion without reduced-motion review. | Component state plus accessible text; animation only as supplementary feedback. |
| Animation utilities | Existing loading/spinner/enter effects where already accepted. | Prototype animation copying, gameplay logic, timing input mechanics or status meaning. | Domain component renderer with DB/RPC result source; reduced-motion-aware global pattern. |
| Text utilities | Follow `text-utility-semantics.md`. | Errors, blockers, status transitions, verdicts, reasons or outcomes as `muted-text`. | `error-text`, `warn-text`, `tag-badge--*`, note/result panel. |
| Overflow/truncate/wrap | Prevent layout breakage for known long labels/ids. | Hiding critical instructions, reasons, errors, report content or item details. | Responsive layout, details panel, popover, expanded row, or explicit overflow affordance. |
| Position/z-index | Existing overlay/layout needs only. | Local stacking wars, custom overlay systems, bypassing PrimeNG wrappers. | PrimeNG overlay wrapper or shared shell layer. |

## Class Budget Rule

Use the UI-CORE-3 budget as the review default:

| element kind | expected utility use |
|---|---|
| Normal text/control element | 0-2 classes. |
| Layout wrapper | Up to 3 classes, usually one layout class plus one gap/spacing class. |
| Surface/card/list row | Up to 3 classes by default. More is allowed only with a report note. |
| PrimeNG host | Existing PrimeNG wrapper classes and simple layout utilities only. |
| Repeated 4+ class stack | Candidate for shared/global pattern or component if repeated across screens. |

Dense utility stacks are acceptable when they are a direct composition of existing production primitives and the element is not repeated. Repetition changes the decision: promote a pattern instead of adding another feature-local variant.

## Repeated Combinations Found

The following examples came from representative grep over `src/app/**/*.html`. This is not a mandate to rewrite now.

| repeated combination | observed role | future extraction candidate |
|---|---|---|
| `mg-card flex-col gap-md p-lg` / `mg-card flex-col gap-sm p-lg` | Large section/card surface. | Future `mg-detail-panel`, `mg-note-panel`, or section surface pattern depending on content. |
| `mg-card flex-col gap-xs p-md` | Compact nested metric/details card. | Future `mg-stat-card`, `mg-summary-card`, or `mg-summary-row`. |
| `flex-row-between-center flex-col-sm gap-md` | Responsive header row with actions. | Future `mg-page-header` / `mg-section-header` composition pattern. |
| `flex-row-start-center flex-wrap gap-sm` | Badge/action chip rows. | Future chip/status-row pattern if repeated with badges. |
| `mg-grid grid-cols-* grid-cols-*-sm gap-*` | Responsive card/form grids. | Keep as utility when page-specific; promote only when domain row/card structure repeats. |
| `p-lg w-100` and `p-md w-100` | Full-width sections/forms. | Keep for simple layout, but avoid adding to every nested card if a surface variant fits. |
| `w-px-*` / `h-px-*` | Icons, avatars, previews, sidebar/logo areas. | Keep only for fixed-format media/control sizing; document when used for content surfaces. |
| `opacity-50` on unavailable selectable rows | Visual disabled/unavailable treatment. | Keep only when paired with actual disabled/unavailable semantics and visible reason. |

## Audit Categories

| category | current risk | future action |
|---|---|---|
| `muted-text` overuse | Broad usage exists, including some likely errors/reasons/outcomes. | Clean only touched files per UI-CORE-8. Do not mass rewrite. |
| Error/status text as neutral copy | Some templates render `error()` or action errors as `muted-text`. | Replace with semantic error/warn/status pattern when touching the file. |
| Repeated card stacks | Frequent `mg-card flex-col gap-* p-*` combinations. | Use UI-CORE-4/9 target patterns when runtime SCSS/shared components exist. |
| Responsive header rows | Frequent `flex-row-between-center flex-col-sm gap-*`. | Prefer a future shared header pattern for screen work. |
| Fixed px utilities | Real usage exists for icons/media/sidebar and some previews. | Allow with stable-dimension rationale; avoid for arbitrary content sizing. |
| Visibility/opacity | Existing responsive utilities are valid; opacity appears for unavailable rows. | Ensure access/control remains DB/RPC/domain-owned and text explains unavailable state. |
| Shadow/backdrop/animation | Utility API exists but should be rare in feature templates. | Treat repeated use as global pattern work, not local decoration. |

## Allowed Keeping

Keep utilities when they are:

- simple layout glue around production surfaces/components;
- clearly less complex than a new class/component;
- not repeated enough to justify extraction;
- semantic only in the HTML/data layer, not in the utility class;
- responsive-only display changes, not access control;
- paired with accessible text where color/opacity changes are used.

## Extraction Triggers

Promote to global/shared pattern when any of these are true:

- the same 4+ class combination appears across multiple screens;
- a utility stack carries a named product concept such as summary card, stat card, note panel, page header or item row;
- multiple features recreate card/badge/chip variants with local classes;
- a utility stack needs local SCSS to complete the same visual repeatedly;
- review cannot tell whether a utility class is layout-only or workflow/status meaning.

## Do Not Extract Yet

Do not create new runtime classes in this task. In future runtime tasks, do not add broad aliases such as `mg-flex-row-card` or `mg-card-stack` unless they map to a real product pattern. Prefer meaningful pattern names from UI-CORE-4/9 such as:

- `mg-page-header`;
- `mg-summary-card`;
- `mg-stat-card`;
- `mg-note-panel`;
- `mg-status-pill`;
- `mg-chip`;
- `mg-detail-panel`.

## Touch-File Review Rule

When a UI implementation touches a template:

1. Check whether existing utility usage stays within the class budget.
2. Keep simple utility layout as-is when it is readable.
3. Replace `muted-text` if it carries error, blocker, reason, verdict, outcome or access meaning.
4. Check any fixed `w-px-*` / `h-px-*` for mobile and text overflow.
5. Check any `opacity-*`, `show-*` or `hide-*` for CSS visibility vs real authority.
6. If the same class stack repeats in the touched area, report whether it should become global/shared.
7. Do not copy prototype `mb-*`, CSS, gradients, palette values or animation behavior.

## Required Report Addendum

Future UI tasks that touch utility-heavy templates should include:

```md
Utility audit:
- utility usages audited:
- repeated combinations found:
- candidates for extraction:
- kept intentionally:
- fixed px utilities justified:
- visibility/opacity semantics checked:
- text utility cleanup:
- class budget exceptions:
```

## Verification Notes

This task is MD-only. `npx tsc --noEmit`, focused specs and `npm run build` are not required unless a future implementation changes Angular/SCSS/runtime files.
