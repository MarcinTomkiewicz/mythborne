# Prototype To Production Mapping

Status: UI-CORE-11 draft for review  
Scope: mapping only; no Angular/SCSS implementation

This document maps accepted prototype families to production patterns. Prototype HTML remains visual reference only. Do not copy prototype CSS, `mb-*` class names, gradients, palette values or layout class names into Angular.

Use with:

- `docs/ui-ux/mythsworn-style-contract.md`;
- `docs/ui-ux/global-scss-shared-inventory.md`;
- `docs/ui-ux/local-scss-budget-checklist.md`.

## Source Rule

Prototype status and archive naming come from `docs/mythborne_ui_ux_backlog.md` section `4.1. Current accepted prototype map`. `docs/ui-ux/README.md` is the prototype archive index and production mapping index. If those two disagree, use the backlog accepted map for task authority and report the mismatch.

Every prototype-backed implementation must still check current Angular/shared/global SCSS code before adding markup, styles or components.

## Shared Production Patterns

| prototype visual pattern | production mapping | missing pattern / follow-up | local layout-only exception |
|---|---|---|---|
| Shell frame, topbar, sidebar | `layout/components/app-shell`, `game-sidebar`, `game-topbar`, `src/scss/base/_app-shell.scss`, layout utilities | Modern game shell pass, brand mark registry, selected nav item pattern | Route shell host sizing only if needed |
| Brand mark / Mythsworn identity | Existing shell/layout components plus future icon/brand registry | UI-CORE-10 should define custom brand/icon registry; accepted `M` mark must remain available | None |
| Page header / hero band | `mg-section__title`, `mg-card`, `.mg-container`, badges, grid/flex utilities | Shared game page header pattern | Page-specific header grid until global pattern exists |
| Standard card/surface | `.mg-card`, `src/scss/base/_surface.scss` | Elevated, selected, note/info, compact row variants | Component host layout only |
| Summary rows/stat cards | `.mg-card`, `.mg-grid`, flex utilities, `.tag-badge` | Summary row/stat card global pattern | Temporary page grid |
| Badge/chip/status pill | `.tag-badge` canonical variants | Explicit chip/status pill contract | None |
| Forms/search/selects | PrimeNG form wrappers, `_p-inputtext.scss`, `_p-select.scss`, `_p-labels.scss`, `_p-form-messages.scss` | Screen-specific form composition patterns | Field row layout only |
| Buttons/actions | PrimeNG buttons through `_p-buttons.scss` | Icon-only action button pattern may need shared/global definition | Host alignment only |
| Tabs/subnav/stepper | `_p-tabs.scss`, `_p-stepper.scss`, route/nav components | Decide when to use PrimeNG tabs vs route links | Layout around tab container only |
| Lists/tables/pagination | `_p-table.scss`, `_p-paginator.scss`, `.mg-grid`, list-row gap | UI-CORE-14 table/list/paginator decision | Responsive list layout only |
| Popover/tooltip | `_p-popover.scss`, `_tooltip.scss` | DB-backed item popover component contract | Popover content layout only |
| Reports/notifications rows | `shared/game-report-content`, notification bell components, global cards/badges | Archive entry row and selected/unread row pattern | List split layout only |
| Admin explainability panels | `.mg-card`, metadata/json preview components, PrimeNG wrappers | Admin context/explainability panel pattern | Dense admin page layout only |
| Trial minigame renderer | Existing exploration route/state, future minigame renderer boundary, global surfaces/badges/buttons | DB/RPC/read-model contract for minigame config, input submission and result state | Renderer host/canvas/container layout only |
| Active combat minigame | Existing exploration/combat timing pieces where DB-backed, future active combat state renderer | Step-wise DB combat contract/read model: combatants, HP/state, round/turn/attack log and timing config | Combat renderer host/container layout only |
| Durable combat report/result | `shared/game-report-content`, report mappers/services, global report rows/cards | Combat report variants for final stats, health outcome, rewards and viewer-relative outcome | Report detail layout only |
| Shared item popover | PrimeNG popover wrapper, item read models/mappers, global badges/rows | DB-backed item popover component contract | Popover content layout only |

## Accepted Families

| family | source file | archive name | status | production mapping | missing pattern / dependency | local exception |
|---|---|---|---|---|---|---|
| Game shell / dashboard shell | `mythborne_ui_shell_prototype.html` | `game-shell-v1.html` | accepted direction | `app-shell`, `game-sidebar`, `game-topbar`, `game-bar`, `.mg-container`, `.mg-grid`, `.mg-card`, `.tag-badge` | Modern shell/nav/resource chip/page header/stat card patterns; brand mark registry; dashboard data must stay active-hero/read-model backed | Dashboard-specific grid only until shared dashboard sections exist |
| Hero statistics | `mythborne_statistics_allocation_v_1.html` | `hero-statistics-v1.html` | accepted direction | PrimeNG buttons/inputs, `.mg-card`, `.mg-grid`, `.tag-badge`, form/shared state patterns | Stat row/allocation control pattern; save must use canonical stat allocation workflow; costs/caps must come from DB/RPC/read model | Stat allocation row grid if not reused elsewhere |
| Armory / equipment | `mythborne_armory_v_1.html` | `armory-v2.html` | accepted direction | `.mg-grid`, `.mg-card`, `.tag-badge`, PrimeNG popover wrapper, item mappers/read models | DB-backed item popover contract; equipment/paperdoll pattern; inventory/list/table decision | Equipment slot layout only |
| Estate / buildings | `mythborne_estate_v_1.html` | `estate-v3.html` | accepted direction | `.mg-card`, `.mg-grid`, `.tag-badge`, `game-bar` for progress where applicable, PrimeNG buttons | Building card/job status pattern; no player-facing cancel action unless DB workflow exists; labels from DB/read model | Estate/building grid layout only |
| Exploration | `mythborne_exploration_flow_v_2.html` | `exploration-flow-v2.html` | accepted direction | Existing exploration state components, `game-bar`/Walking Dead timing UI where already production-backed, `.mg-card`, `.tag-badge`, PrimeNG dialogs | Shared progress/timer strip; DB-backed combat/read-model dependencies must not be fabricated; no invented route-map fiction | Exploration page composition and active-step strip layout |
| Auction House | `mythborne_trade_v_1.html` | `auction-house-v2.html` | accepted direction | PrimeNG inputs/selects/buttons/paginator/table where chosen, `.mg-card`, `.tag-badge`, popover wrapper, trade/auction domain services | Item popover contract; UI-CORE-14 list/table decision; one-item auction workflow must use canonical domain/RPC paths | Listing row/list layout until shared list row pattern exists |
| Direct Trade | `direct-trade-v2.html` | `direct-trade-v2.html` | accepted direction | PrimeNG inputs/buttons, `.mg-card`, `.tag-badge`, `.mg-grid`, trade domain services | Trade slot pattern; target search/read model; canonical direct trade RPC/domain operations; no CP-only for CP-only | Two-side builder layout only |
| PvP Vicinity | `pvp-vicinity-v4.html` | `pvp-vicinity-v4.html` | accepted direction | Existing `/game/vicinity` state/card slices, `.mg-card`, `.tag-badge`, PrimeNG buttons/inputs if added, PvP read/service boundaries | Target list/table pattern; no Walking Dead/combat preview/log; PvP eligibility/reason labels DB/RPC/metadata backed | Target list responsive layout only |
| Reports | `reports-center-v2.html` | `reports-center-v2.html` | accepted direction | `shared/game-report-content`, report services/mappers, `.mg-card`, `.tag-badge`, PrimeNG tabs/paginator/table/list wrappers | Reports archive entry row, selected/unread state, filter panel pattern; durable report snapshots only | Reports split-list/detail layout only |
| Notifications | `notifications-center-v1.html` | `notifications-center-v1.html` | accepted direction | `notification-bell`, `staff-notification-bell`, notification services/mappers, `.mg-card`, `.tag-badge`, PrimeNG tabs/paginator/list wrappers | Notification archive entry row; short notification archive must not replace full reports | Notifications list/filter layout only |
| Admin Overview | `admin-overview-v7.html` | `admin-overview-v7.html` | accepted direction | Admin route components, PrimeNG wrappers, `.mg-card`, `.mg-grid`, `.tag-badge`, metadata/json preview components | Admin shell/orientation hub pattern, scope strip, area map, coverage checklist, explainability panel | Admin overview dense layout only |

## Archive-Present Families Needing Review

These prototypes exist in `docs/ui-ux/prototypes/`, but are not listed as `accepted direction` in the backlog accepted map at the time of UI-CORE-11. Future UI tasks may reference this mapping, but must confirm acceptance/status before implementation.

| family | source file | archive/status | production mapping | missing pattern / dependency | local exception | forbidden |
|---|---|---|---|---|---|---|
| Trial minigame: Apollo / Path of Light | `mythsworn_apollo_trial.html` | archive present, needs review | Existing exploration route/state plus future minigame renderer boundary; global page header/surface/badge/button patterns | DB/RPC/read-model for minigame config, active state, allowed inputs, submitted result and durable reward/report state | Renderer host/canvas/grid container layout only | Copying prototype JS/CSS/`mb-*`; hardcoded path sequence, difficulty config, outcomes or rewards |
| Trial minigame: Aphrodite / Graces' Court | `mythsworn_aphrodite_trial.html` | archive present, needs review | Existing exploration route/state plus future minigame renderer boundary; global surfaces/badges/buttons; accessible timing/choice controls | DB/RPC/read-model for timing windows, influence/failure pressure, active state, input submission and result | Renderer host/canvas/container layout only | Copying prototype JS/CSS/`mb-*`; hardcoded grace names/config/outcomes; unsafe flashing or hover-only critical state |
| Trial minigame: Hera / Labyrinth | `mythsworn_trial_labirynth.html.html` | archive present, needs review | Existing exploration route/state plus future minigame renderer boundary; global surfaces/badges/buttons/list/log rows | DB/RPC/read-model for maze/labyrinth config, movement choices, active state, submitted input and result | Renderer host/canvas/grid container layout only | Copying prototype JS/CSS/`mb-*`; hardcoded maze, path, outcomes or Trial config |
| Trial minigame: Artemis / Harpy Hunt | `mythsworn_artemis_trial.html` and related recovered Artemis files | archive present, needs review | Existing exploration route/state plus future minigame renderer boundary; global surfaces/badges/buttons; accessible target/input controls | DB/RPC/read-model for target config, timing/input rules, active state, submitted result and durable report/reward state | Renderer host/canvas/container layout only | Copying prototype JS/CSS/`mb-*`; hardcoded targets, hit rules, outcomes, rewards or gameplay config |
| Active combat minigame / active combat Trial | `mythborne_combat_minigame_prototype.html` | archive present, needs review | Existing exploration route/state plus future active combat renderer; reuse Walking Dead timing component only where DB-backed; global combatant cards/badges/buttons | Step-wise DB combat contract/read model for combatants, HP/state, round/turn/attack log, attack order, timing config and completion state; sandbox must stay separate from production authority | Combat renderer host/container layout only | Angular combat authority, copied prototype JS/CSS/`mb-*`, hardcoded stats/equipment/luck/damage/opponent/outcome, fake turn log |
| Combat report/result detail | `mythborne_combat_report_attacker_victory_prototype.html` and `mythborne_combat_report_defender_victory_prototype.html` | archive present, needs review | Durable report/result detail pattern through report services/mappers and `shared/game-report-content`; global report rows/cards/badges | Combat result/report read model for final attacker/defender stats, health outcome, combat log, rewards and viewer-relative outcome | Report detail layout only | Recomputing combat from live state, fabricating logs/rewards, copying prototype CSS/`mb-*`, exposing private ids in player-facing report |
| Shared item popover | `mythborne_item_popover_armory_prototype.html` | archive present, needs review | PrimeNG popover wrapper plus item read model/mappers; use in Armory, Auction, Direct Trade, Reports and loot/result screens | DB-backed item popover component contract covering bonuses, requirements, drachma/vendor value, item status/locks and display labels | Popover content layout only | Local duplicate popovers per feature, copied prototype CSS/`mb-*`, hardcoded item bonuses/requirements/value |

## Intentional Non-Mapping

These prototype details must not become production code directly:

- `mb-*` classes;
- inline prototype media query values;
- prototype palette variables and raw color values;
- prototype gradients/borders/shadows;
- emoji or text initials as final icon systems;
- placeholder rows, counts, labels and gameplay examples;
- prototype-only navigation hrefs;
- mock report/notification/combat/reward content.

Translate only the visual/product intent into current global SCSS, vendor wrappers, shared components and DB/RPC-backed data paths.

## Cross-Family Gaps

Handle these before broad screen rewrites or during the appropriate UI-CORE follow-up:

- shared game page header;
- modern game shell/sidebar nav item pattern;
- brand mark and icon registry;
- resource chip / compact metric chip;
- elevated/selected/note/info/compact-row surface variants;
- summary row and stat card patterns;
- status pill/chip contract;
- list/report/notification entry row;
- item popover component contract;
- Trial minigame renderer boundary and DB/RPC/read-model contracts;
- active combat minigame step-wise DB contract/read model;
- durable combat report/result variants;
- equipment/paperdoll layout pattern;
- trade slot pattern;
- admin scope strip/area map/explainability panel;
- table/list/paginator decision per context.

## Implementation Report Requirements

For each future task based on a mapped prototype, report:

- prototype source;
- archive name and status source checked;
- visual patterns reused;
- patterns intentionally not implemented;
- global SCSS/vendor/shared mapping;
- local SCSS needed and why;
- copied from prototype: yes/no;
- DB/read-model blockers;
- accessibility/responsive smoke.
