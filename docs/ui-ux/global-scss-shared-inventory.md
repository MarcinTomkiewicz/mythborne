# Global SCSS And Shared Pattern Inventory

Status: UI-CORE-2 draft for review  
Scope: inventory only; no refactor, no screen implementation

This inventory lists the existing production styling and shared UI assets that future UI tasks must check before adding local SCSS or new components. Use it together with `docs/ui-ux/mythsworn-style-contract.md`.

## Status Legend

| status | meaning |
|---|---|
| production-ready | Use first for new UI when it fits. |
| legacy-compatible | Existing production API; reuse carefully and do not replace locally. |
| needs audit | Existing code is real, but exact future usage needs review before expansion. |
| placeholder/gap | File or pattern exists only as a placeholder, or no reusable pattern exists yet. |

## Entrypoints

| file / pattern | intended use | status | notes |
|---|---|---|---|
| `src/scss/main.scss` | Global SCSS entrypoint for themes, base, layouts, utilities and vendors. | production-ready | Do not bypass with feature-local imports for global styles. |
| `src/scss/themes/themes.scss` | Theme aggregator. | production-ready | Runtime values back `--mg-*` tokens. |
| `src/scss/vendors/primeng.scss` | PrimeNG wrapper aggregator. | production-ready | Check before adding feature-local PrimeNG overrides. |
| `src/scss/utilities/utilities.scss` | Utility aggregator. | production-ready | Utilities are allowed, but repeated combinations should become shared/global patterns. |
| `src/scss/layouts/_layouts.scss` | Layout aggregator. | production-ready | Main lookup for reusable layout primitives. |
| `src/scss/base/_base.scss` | Base aggregator. | production-ready | Includes reset, typography, shell background, surfaces, badges and scrollbars. |

## Abstracts And Themes

| file / pattern | intended use | status | notes |
|---|---|---|---|
| `src/scss/abstracts/_variables.scss` | Typography, spacing, breakpoints, radii, shadows and `--mg-*` token bindings. | production-ready | Primary source for production tokens. Do not create local color tokens in components. |
| `src/scss/abstracts/_mixins.scss` | Shared SCSS mixins for responsive rules, grids, badges and effects. | production-ready | Use through global SCSS only; avoid feature-local mixin-driven design systems. |
| `src/scss/abstracts/_custom-icons.scss` | Custom icon filename registry. | needs audit | Real registry exists. UI-CORE-10 should define usage/ownership before broad expansion. |
| `src/scss/abstracts/_functions.scss` | SCSS functions placeholder. | placeholder/gap | Empty; do not treat as an existing function API. |
| `src/scss/themes/_theme.common.scss` | Shared theme constants. | production-ready | Stable source for shared palette constants. |
| `src/scss/themes/_theme.dark.scss` | Dark theme values. | production-ready | Current player-facing dark/navy direction is compatible with this foundation. |
| `src/scss/themes/_theme.light.scss` | Light theme values. | production-ready | Keep contrast/fallback behavior when adding global variants. |
| `src/scss/themes/_theme.engine.scss` | Theme variable emission/runtime engine. | production-ready | Do not duplicate theme variable emission locally. |

## Base Patterns

| file / pattern | intended use | status | notes |
|---|---|---|---|
| `src/scss/base/_app-shell.scss` | Global body background and app shell backdrop behavior. | production-ready | Current source for full-page background behavior. |
| `src/scss/base/_surface.scss` / `.mg-card` | Standard card/surface. | legacy-compatible | Use as current standard surface. Missing: explicit elevated, selected, note/info and compact row variants. |
| `src/scss/base/_badges.scss` / `.tag-badge` | Badge variants and legacy aliases. | production-ready | Canonical variants should be preferred over legacy class aliases. |
| `src/scss/base/_typography.scss` | Base typography and text helpers. | production-ready | Check before adding local heading/copy styles. |
| `src/scss/base/_flex.scss` | Flex helper classes. | production-ready | Common source for `flex-row-*` and `flex-col` layout. Avoid excessive utility piles. |
| `src/scss/base/_scrollbars.scss` | Scrollbar styling. | production-ready | Use global behavior; do not style scrollbars locally. |
| `src/scss/base/_lists.scss` | List defaults. | production-ready | Does not replace report/list-row patterns. |
| `src/scss/base/_img.scss` | Image defaults. | production-ready | Use with `image__preview` layout pattern where applicable. |
| `src/scss/base/_fonts.scss` | Font loading/definitions. | production-ready | Display/body font source. |
| `src/scss/base/_reset.scss` | Reset/base normalization. | production-ready | Do not override reset behavior locally. |
| `src/scss/base/_icons.scss` | Icon base placeholder. | placeholder/gap | Empty; not a real icon system. Use PrimeIcons/custom icon registry rules until UI-CORE-10. |

## Layouts

| file / pattern | intended use | status | notes |
|---|---|---|---|
| `src/scss/layouts/_components.scss` / `.mg-container`, `.mg-section`, `.mg-section__title`, `.mg-section__subtitle` | Page/section/container/title primitives. | production-ready | Current source for page intro/section composition. Missing modern game page header pattern. |
| `src/scss/layouts/_grid.scss` / `.mg-grid`, `grid-cols-*`, `grid-*` | Responsive grid utilities and common 2:1 / 1:2 layouts. | production-ready | Use for page composition before local grids. |
| `src/scss/layouts/_form-panel.scss` | Reusable form panel layout. | needs audit | Use for form-heavy screens if current structure matches. |
| `src/scss/layouts/_div.scss` | Generic div/layout helpers. | needs audit | Check exact class before reuse; avoid adding more generic aliases. |
| `src/scss/layouts/_footer.scss` | Footer layout. | production-ready | Shell/footer use only. |

## Utilities

| file / pattern | intended use | status | notes |
|---|---|---|---|
| `src/scss/utilities/_spacings.scss`, `_gap.scss` | Margin/padding/gap utilities. | production-ready | Use deliberately. Repeated dense combinations are candidates for global patterns. |
| `src/scss/utilities/_width.scss`, `_height.scss`, `_aspect-ratio.scss` | Sizing helpers. | production-ready | Prefer stable dimensions for cards, controls and fixed-format elements. |
| `src/scss/utilities/_display.scss`, `_position.scss`, `_overflow.scss`, `_visibility.scss` | Layout behavior helpers. | production-ready | Use for composition, not access control. |
| `src/scss/utilities/_backgrounds.scss`, `_borders.scss`, `_shadows.scss`, `_backdrop.scss`, `_opacity.scss` | Visual utility helpers. | needs audit | Use sparingly; do not create one-off surface systems by stacking utilities. |
| `src/scss/utilities/_status-text.scss` | Text status helpers. | production-ready | Pair color with readable text. |
| `src/scss/utilities/_text-alignment.scss`, `_text-wrap.scss`, `_text-heights.scss`, `_truncate.scss`, `_line-heights.scss` | Text layout and overflow helpers. | production-ready | Check before local text overflow fixes. |
| `src/scss/utilities/_interactions.scss`, `_transitions.scss`, `_animations.scss` | Interaction/transition helpers. | needs audit | Do not invent gameplay animation semantics here. |
| `src/scss/utilities/_object-fit.scss` | Media fit helpers. | production-ready | Use for image previews/media. |
| `src/scss/utilities/_dropdowns.scss` | Dropdown helpers. | needs audit | Prefer PrimeNG wrappers when using PrimeNG dropdown/select components. |
| `src/scss/utilities/_z-index.scss` | Z-index utilities. | production-ready | Use existing z-index layers; do not introduce local arbitrary z-index values. |
| `src/scss/utilities/_tag-badge-aliases.scss` | Legacy badge color aliases. | legacy-compatible | Existing aliases only. Prefer canonical `.tag-badge--*` variants in new UI. |

## PrimeNG Vendor Wrappers

| file / pattern | intended use | status | notes |
|---|---|---|---|
| `_p-buttons.scss` | PrimeNG button semantic mapping and focus behavior. | production-ready | Check before local button styling. |
| `_p-inputtext.scss`, `_p-textarea.scss`, `_p-select.scss`, `_p-password.scss`, `_p-datepicker.scss`, `_p-autocomplete.scss`, `_p-slider.scss` | Form input wrappers. | production-ready | Use PrimeNG wrappers first; avoid feature-local `.p-*` overrides. |
| `_p-labels.scss`, `_p-form-messages.scss`, `_p-forms.autofill.scss` | Form labels, validation messages and autofill behavior. | production-ready | Use for form UX consistency. |
| `_p-table.scss`, `_p-paginator.scss` | Table and paginator wrappers. | production-ready | UI-CORE-14 still needed for table/list/paginator decision by context. |
| `_p-tabs.scss`, `_p-stepper.scss`, `_p-accordion.scss` | Navigation/step/accordion wrappers. | production-ready | Reuse before building custom local tab/step patterns. |
| `_p-popover.scss`, `_tooltip.scss` | Popover and tooltip wrappers. | production-ready | Source for item popover/tooltip shell styling; domain content still needs shared component/read model. |
| `_p-dialogs.scss`, `_p-drawer.scss`, `_p-confirmdialog.scss`, `_p-confirmpopup.scss` | Modal/drawer/confirmation wrappers. | production-ready | Use for overlays; do not create feature-local modal skins. |
| `_p-toasts.scss` | Toast wrapper. | production-ready | Use for operational feedback where appropriate. |
| `_p-breadcrumbs.scss` | Breadcrumb wrapper. | production-ready | Use for hierarchical navigation if product IA calls for it. |
| `_p_fileupload.scss` | File upload wrapper. | production-ready | Use where PrimeNG file upload is used. |
| `_p-custom-icons.scss`, `_primeicons-local.scss` | Prime/custom icon integration. | needs audit | Existing icon path exists; UI-CORE-10 should define final icon registry behavior. |

## Shared Angular Components

| component / pattern | intended use | status | notes |
|---|---|---|---|
| `layout/components/app-shell` | Main app/game shell composition. | production-ready | Use for shell-level changes; modern visual pass is a future shell task. |
| `layout/components/game-sidebar` | Game navigation/sidebar. | legacy-compatible | Current implementation uses `mg-card`/utilities. Needs modern nav item pattern later. |
| `layout/components/game-topbar` | Hero resources, address, health/experience and notification bell. | production-ready | Source for resource/topbar behavior. Missing global resource chip pattern. |
| `layout/components/notification-bell` | Player notification bell, state, formatter and action runner. | production-ready | Use for player notifications; archive/list UI is separate. |
| `layout/components/staff-notification-bell` | Staff notification bell. | production-ready | Staff/admin notification path, separate from player bell. |
| `layout/components/membership-blocked-notice` | Membership gate notice. | production-ready | Reuse for gameplay access gate. |
| `layout/components/staff-gameplay-blocked-notice` | Staff gameplay gate notice. | production-ready | Reuse for staff restriction messaging. |
| `shared/game-bar` | Segmented HP/XP/progress bar. | production-ready | Some inline styles exist; future pattern polish can move styling global if repeated. |
| `shared/game-report-content` | DB-backed report content rendering. | production-ready | Use for report detail content; do not fabricate reports in UI. |
| `shared/loading-overlay` | Loading overlay. | production-ready | Reuse for blocking page/workflow loading. |
| `shared/metadata-display` | Metadata display helper component. | production-ready | Use for DB/admin metadata display instead of ad hoc JSON where appropriate. |
| `shared/json-preview/collapsed-json-preview` | Collapsed JSON preview. | production-ready | Use for diagnostics/admin previews, not player-facing primary copy. |
| `shared/form-fields` | Shared form field rendering. | needs audit | Check safety for current PrimeNG control composition before reuse. |
| `shared/carousel` | Carousel component. | needs audit | Use only where carousel UX is explicitly appropriate. |

## Pattern Lookup Cheatsheet

| need | check first | do not use randomly |
|---|---|---|
| Card/surface | `.mg-card`, `src/scss/base/_surface.scss` | Local card classes or copied prototype card CSS. |
| Badge/chip/status | `.tag-badge`, `src/scss/base/_badges.scss` | Local badge systems or legacy aliases for new UI. |
| Button | PrimeNG button + `_p-buttons.scss` | Feature-local `.p-button` overrides. |
| Input/select/form | PrimeNG wrappers + form shared patterns | Native/local controls when project already has PrimeNG pattern. |
| Table/paginator | `_p-table.scss`, `_p-paginator.scss` | Custom paginator/list/table until UI-CORE-14 decision. |
| Popover/tooltip | `_p-popover.scss`, `_tooltip.scss` | Local floating panel CSS. |
| Tabs/stepper | `_p-tabs.scss`, `_p-stepper.scss` | Custom tab rows unless justified. |
| Page section/title | `.mg-section*`, `.mg-container` | Prototype `mb-title` / `mb-page-header` CSS. |
| Grid/layout | `.mg-grid`, `grid-cols-*`, flex utilities | Local grid classes duplicating utilities. |
| Report content | `shared/game-report-content` | Direct report/combat table reads or fabricated report rows. |
| Notifications | `notification-bell`, `staff-notification-bell` | UI-created notifications or local producer behavior. |
| Icons | PrimeIcons and `_custom-icons.scss` registry | Treating empty `_icons.scss` as an icon system. |

## Inventory Gaps

- No shared game page header component/pattern yet.
- No explicit resource chip / compact metric chip pattern.
- No modern selected nav item pattern with accepted gold-left-inset visual direction.
- No standard global variants for elevated, selected, note/info and compact row surfaces.
- No dedicated report/notification archive row component.
- No DB-backed item popover component contract yet.
- No final table/list/paginator decision per context.
- Empty `_functions.scss` and `_icons.scss` must not be used as real APIs.
