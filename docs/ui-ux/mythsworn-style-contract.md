# Mythsworn UI Style Contract

Status: UI-CORE-1 draft for review  
Scope: production usage contract, not a final design system

This file turns accepted prototype direction into rules that future Angular UI work can use. Prototype HTML under `docs/ui-ux/prototypes/` is visual reference only. Do not copy prototype CSS or introduce prototype `mb-*` classes into Angular production code.

## Authority Order

Use this order when implementing UI:

1. Explicit user instruction for the current task.
2. Existing Angular code, shared components, layout components and global SCSS.
3. Current DB/generated contracts and documented RPC/read models.
4. Current decisions and project context docs.
5. This style contract and UI/UX backlog constraints.
6. Accepted prototype direction from `docs/ui-ux/prototypes/`.

Prototype direction is visual reference only. It is always constrained by user instruction, existing Angular/shared/global SCSS, DB/RPC/read models, current decisions/project context and this contract. If a prototype conflicts with those sources, translate only the compatible visual intent or report the gap.

If a visual pattern needs runtime meaning from DB or an RPC/read model, implement only what the current contract provides. Do not hardcode gameplay labels, eligibility, counters, combat state, rewards, reports or admin dictionaries as a UI fallback.

## Production Foundation

The current production foundation is the existing `mg-*` SCSS system:

- tokens: `src/scss/abstracts/_variables.scss` and `src/scss/themes/*`;
- shell/base surfaces: `src/scss/base/_app-shell.scss`, `_surface.scss`, `_badges.scss`;
- layout primitives: `src/scss/layouts/*`;
- utility classes: `src/scss/utilities/*`;
- PrimeNG wrappers: `src/scss/vendors/*`;
- shared/layout components: `src/app/shared/*`, `src/app/layout/components/*`.

Treat `mg-*` as legacy-compatible production API. It may be modernized later, but new feature work must not create a competing local `mb-*` token system.

## Visual Direction

The accepted player-facing direction is a modern premium browser RPG interface with ancient-Greek flavor:

- dark navy layered background;
- bronze/gold accents and soft gold borders;
- readable, compact information density;
- premium translucent surfaces with restrained depth;
- selected navigation marked by a gold left inset or equivalent active affordance;
- clear chips/badges for state and compact metrics;
- hero-centric game shell and dashboard, not a generic SaaS admin page;
- Greek flavor through typography, spacing, icons and surface accents, not through heavy stone panels everywhere.

Avoid:

- one-off local color palettes;
- beige/stone-only screens;
- raw UUID-first controls;
- decorative cards inside cards;
- prototype-only placeholder content becoming production copy;
- local `::ng-deep` or `.p-*` overrides in feature SCSS;
- copied canvas CSS values in component SCSS.

## Lookup Order

Before adding local HTML structure, SCSS or a helper component:

1. Reuse an existing shared/layout component.
2. Reuse a PrimeNG component through existing vendor wrappers.
3. Reuse global `mg-*` surface/layout/utility classes.
4. Add or extend a global/shared pattern if the need is repeated or prototype-backed.
5. Add feature-local SCSS only for narrow page composition that cannot reasonably live globally.

Feature-local SCSS must not define new color tokens, card systems, badge systems, button systems, PrimeNG skins or gameplay semantics.

## Class Budget

Normal elements should use 1-2 purposeful classes. More than 3 classes on a normal element needs a clear reason.

Allowed dense class usage:

- existing utility-based layout while no shared pattern exists;
- temporary migration of legacy screens;
- small static composition where extracting a component would add more complexity than it removes.

Not allowed:

- defensive utility piles;
- repeated `mg-card flex-col gap-* p-*` structures across a feature when a shared pattern is needed;
- nested `mg-card` surfaces just to create spacing;
- local classes that duplicate existing utilities with domain-specific names.

## Prototype Mapping

Prototype class names and CSS are not production API. Translate them as follows:

| Prototype intent | Production mapping now | Gap / follow-up |
|---|---|---|
| `mb-app-shell`, shell grid | `app-shell`, `game-sidebar`, `game-topbar`, global layout utilities | Game shell needs a modern shared shell pattern pass. |
| Brand mark/title | `app-shell`/sidebar/topbar currently show text/icon fallback | Need retained Mythsworn mark with accepted gold/navy `M` direction. |
| Sidebar nav link active state | `game-sidebar` with `routerLinkActive`, `mg-card`, `heading-color` | Need global nav item pattern with selected left gold inset. |
| Resource chips/topbar metrics | `game-topbar`, `app-game-bar`, flex utilities, PrimeIcons | Need global resource chip/status metric pattern. |
| Page hero/header | `mg-section__title`, `mg-card`, layout utilities | Need production page header pattern for gameplay screens. |
| Standard/elevated cards | `mg-card`, `_surface.scss` | Need variants for standard, premium/elevated, note/info and selected surfaces. |
| Summary/stat cards | `mg-card` plus grid/flex utilities | Need shared summary row/stat card patterns. |
| Badges/chips/status pills | `.tag-badge` variants | Need explicit chip/status pill guidance; avoid separate local badge systems. |
| List/report rows | ad hoc `mg-card` rows, `game-report-content` | Need list row and selected/unread row pattern. |
| Item popover | PrimeNG popover wrapper exists; item popover prototype exists | Need DB-backed item popover component/contract later. |
| Notifications | `notification-bell`, `staff-notification-bell` | Need archive/list row pattern aligned with reports center. |
| Admin overview | PrimeNG/vendor wrappers, `mg-card` surfaces | Need admin scope/context/explainability patterns. |

## Pattern Rules

### Shell

Game shell must stay hero-centric. Sidebar/topbar should expose selected hero/server context, core resources and notifications only through existing DB-backed read models. Admin/staff state stays visually distinct from player gameplay.

Production shell work should prefer `src/app/layout/components/*` and global shell/layout SCSS over route-local shell markup.

### Page Header

Use page headers to orient the player: location, current workflow, key DB-backed status and primary action constraints. Do not use marketing hero layout for in-game operational screens.

Until a shared page header exists, compose with `mg-card`, `mg-section__title` and compact badge rows. If the same composition appears on multiple game pages, promote it to a shared/global pattern.

### Surfaces

Use `mg-card` as the current standard surface. Add global variants only when a repeated distinction is needed, such as:

- elevated/premium card;
- selected/active card;
- note/info panel;
- compact row surface;
- detail side panel.

Do not put cards inside cards unless each nested card is a repeated item or a genuinely framed tool.

### Badges And Chips

Use `.tag-badge` and canonical variants first:

- `tag-badge--primary`;
- `tag-badge--success`;
- `tag-badge--danger`;
- `tag-badge--info`;
- `tag-badge--warn`;
- `tag-badge--arcane`;
- `tag-badge--muted`;
- `tag-badge--golden`.

Use badges/chips for compact state, counts, eligibility and metadata. Status must not rely on color alone; include text or an accessible label.

### Lists, Reports And Notifications

Report/notification list rows should be scan-friendly: icon/status marker, title, short subtitle, metadata chips and timestamp. Do not expose only raw ids when labels/read models exist. If a report or notification producer/read path is missing, show a dependency/diagnostic instead of fabricating a report in Angular.

### Item Popover

Use the item popover prototype as visual direction only. Production item popovers must be DB/read-model backed and should use shared domain models/mappers. Do not build local item stat calculators in UI.

### Admin Screens

Admin UI should be dense, explainable and operational rather than decorative. Use PrimeNG/vendor wrappers and global surfaces. Reason-required workflows must keep reason/context visible. DB dictionaries/config metadata should provide labels/descriptions where available.

## Missing Global Patterns

These are gaps discovered during UI-CORE-1 and should be handled by later UI-CORE tasks before broad screen rewrites:

- shared game page header;
- modern game shell/sidebar nav item pattern;
- resource chip / compact metric chip;
- standard card variants: elevated, selected, note/info, compact row;
- summary row and stat card patterns;
- status pill/chip contract separate from badges if needed;
- report/notification entry row;
- item popover component contract;
- table/list/paginator decision for dense lists;
- brand mark registry and icon guidance.

## Accessibility And Responsive Baseline

Every future UI task must check:

- keyboard focus for interactive controls;
- visible labels or accessible names for icon buttons;
- status conveyed by text, not color only;
- no critical information hidden behind hover-only UI;
- mobile/tablet collapse without overlapping text or controls;
- long labels and ids wrap or truncate deliberately;
- tables/lists have a responsive mode or documented overflow behavior.

## Required UI Task Report Addendum

Future UI implementation reports should include:

- prototype source and archive name, if any;
- reused shared/layout/vendor/global patterns;
- checked but not reused patterns;
- new component/state/helper added;
- global tokens/classes used;
- local SCSS added and why;
- copied from prototype: yes/no;
- DB/read-model dependencies and blockers;
- accessibility/responsive smoke notes.
