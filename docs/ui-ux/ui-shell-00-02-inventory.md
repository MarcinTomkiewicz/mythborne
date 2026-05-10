# UI-SHELL-00/01/02 Inventory

Date: 2026-05-10

Scope: no-code inventory for `UI-SHELL-00`, `UI-SHELL-01` and `UI-SHELL-02`.

Runtime files were inspected only. No Angular, SCSS or generated DB type changes are part of this artifact.

## Preflight

| Field | Result |
|---|---|
| Task id / title | `UI-SHELL-00` README-first inventory, `UI-SHELL-01` current shell diff and rollback boundary, `UI-SHELL-02` token and color anchor inventory |
| User instruction | Execute UI-SHELL 00, 01 and 02 as no-code tasks. |
| Dirty tree | `git status --short` returned clean before edits. |
| README checked | yes: `docs/ui-ux/README.md` |
| UI-CORE docs checked | `mythsworn-style-contract.md`, `global-scss-shared-inventory.md`, `local-scss-budget-checklist.md`, `prototype-production-mapping.md`, `utility-class-audit.md`, `layout-section-pattern-cleanup.md`, `text-utility-semantics.md`, `shared-surface-patterns.md`, `surface-badge-pattern-expansion.md`, `icon-brand-registry.md`, `icon-placeholder-mapping.md` |
| Source files checked | listed in the source inventory below |
| Prototype source | `game-shell-v1.html` direction from backlog; no prototype CSS copied |
| Data/read model source | existing shell services only: `ActiveHero`, `ActiveServer`, `AuthState`, `HeroDerivedStats`, `EstateAddresses`, `get_hero_prestige_public_summary`, notification states |
| Local SCSS plan | none for 00-02 |
| Verification plan | docs-only: grep/diff/status; no tsc/build required |

## Source Inventory

| Area | Files checked | Key findings |
|---|---|---|
| Shell host | `src/app/layout/components/app-shell/app-shell.html`, `app-shell.ts` | Current shell uses utility composition: sticky topbar, left sidebar, scrollable main, staff/gameplay blockers. No named `mg-game-shell` grid is currently used in the template. |
| Topbar | `src/app/layout/components/game-topbar/game-topbar.html`, `game-topbar.ts` | Current topbar has three content groups: hero status, centered brand/address, right notifications/resources. Layout uses flex utilities rather than a named topbar pattern. |
| Sidebar | `src/app/layout/components/game-sidebar/game-sidebar.html`, `game-sidebar.ts`, empty `game-sidebar.scss` | Current sidebar has hero card, selected world/prestige card and nav links. Nav links use `mg-card`; active class is `is-active heading-color`, but there is no dedicated active inset pattern. |
| Notifications | `notification-bell/*.html`, `staff-notification-bell/*.html` | Existing notification bell components already provide topbar actions and dropdown surfaces with `mg-card`, `tag-badge` and utility classes. |
| Layout utilities | `_flex.scss`, `_grid.scss`, `_gap.scss`, `_spacings.scss`, `_width.scss`, `_height.scss`, `_display.scss`, `_position.scss`, `_overflow.scss`, `_z-index.scss`, `_backdrop.scss` | Flex, gap, spacing, width, position, overflow, z-index and backdrop utilities are sufficient for most shell composition. Grid utilities do not express the accepted desktop topbar three-zone layout with centered brand. |
| Surfaces/text/badges | `_surface.scss`, `_badges.scss`, `_typography.scss` | `mg-card`, `mg-card--legend`, `card-legend`, canonical `tag-badge--*`, `heading-color`, `muted-text`, focus-visible ring exist. Elevated/selected/note/chip/nav patterns remain planned, not implemented. |
| Brand/icons | `_game-shell.scss`, `_custom-icons.scss`, `icon-brand-registry.md`, `icon-placeholder-mapping.md` | `mg-brand-mark-fallback` exists as CSS/text M mark. No dedicated brand asset key exists; keep fallback until a future asset task. Resource icons exist through PrimeNG custom icon mapping for `cash`, `marble`, `workforce`, `sun-eclipse`. |
| Theme tokens | `_variables.scss`, `_theme.dark.scss`, `_theme.common.scss`, `_theme.light.scss`, `_theme.engine.scss` | Dark navy background, surface, elevated surface, gold/secondary, border, text, muted text, info/blue, form focus ring and global focus-visible tokens exist. Shell-specific premium card/nav inset/resource chip tokens do not exist as named patterns. |

## UI-SHELL-00 Lookup Table

| Shell need | Existing class/component/pattern | Source file | Use now? | Gap/follow-up |
|---|---|---|---|---|
| three-zone desktop topbar | Utility flex groups in `app-game-topbar`; no named grid/topbar pattern | `game-topbar.html`, `_flex.scss` | partial | `UI-SHELL-09` should decide whether a small `mg-game-topbar` grid is needed to keep brand truly centered. |
| flex row start/center | `flex-row-start-center` | `_flex.scss` | yes | none |
| flex row end/center | `flex-row-end-center` | `_flex.scss` | yes | none |
| flex wrap | `flex-wrap`, responsive flex classes | `_flex.scss` | yes | none |
| full-width/flex fill | `w-100`, `flex-1`, `flex-none`, `min-w-*` | `_width.scss`, `_flex.scss` | yes | none |
| compact resource chip fallback | `tag-badge tag-badge--muted gap-sm` with icon/label/value stack | `game-topbar.html`, `_badges.scss` | partial | Current fallback is acceptable short term, but `mg-chip` / resource chip pattern is still missing. |
| brand mark fallback | `mg-brand-mark-fallback` | `_game-shell.scss`, `game-topbar.html` | yes | Missing dedicated brand asset/key; keep CSS/text fallback. |
| selected server/prestige card | `mg-card mg-card--legend` plus label/value rows | `game-sidebar.html`, `_surface.scss` | partial | Premium selected-server/prestige card pattern is missing; avoid local sidebar card system until UI-SHELL-19/21. |
| active nav inset | `routerLinkActive="is-active heading-color"` only | `game-sidebar.html` | no | Dedicated gold left inset/active nav pattern is missing. |
| nav hover/focus states | global anchor hover and focus-visible ring only | `_typography.scss`; `game-sidebar.html` | partial | Need nav-specific hover/focus/active surface pattern before color pass. |
| shell surface/background/border | `mg-card`, `border-0`, dark theme `color-bg`, `color-bg-surface`, `color-border` | `_surface.scss`, `_theme.dark.scss`, `app-shell.html` | yes | Shell-specific boundary/elevated variants remain implicit. |

## UI-SHELL-01 Current Shell Boundary

Current git diff was clean before this documentation artifact, so the table below classifies the current checked-in shell, not uncommitted changes.

| File / class or pattern | Classification | Keep/remove boundary |
|---|---|---|
| `app-shell.html` utility shell host: `flex-col min-h-full`, sticky `header`, sidebar/main flex row | accepted UI-SHELL-1 skeleton / current baseline | Keep for `UI-SHELL-03`; only replace with named shell grid if a later task proves containment/scroll issues. |
| `app-shell.html` `mg-card border-0 position-sticky top-0 z-10 backdrop-blur-xl` topbar wrapper | current baseline with visual-shell debt | Keep for now; `UI-SHELL-06/09` should decide tokenized/elevated topbar surface. |
| `app-shell.html` sidebar wrapper `mg-card border-0 flex-none w-px-250 overflow-y-auto` | accepted skeleton / current baseline | Keep width/scroll boundary unless `UI-SHELL-05` changes containment. |
| `app-shell.html` staff fallback topbar with only `app-staff-notification-bell` | current baseline | Keep; `UI-SHELL-04` should confirm no guest/account/public leakage. |
| `game-topbar.html` three visible groups | experimental UI-SHELL-2 style direction, partly aligned with anchors | Keep as current visual baseline; later tasks should harden centering/responsive behavior. |
| `game-topbar.html` `tag-badge--muted` Health/XP/resource chips | temporary fallback | Keep until `UI-SHELL-13/14/15`; do not expand into a local chip system. |
| `game-topbar.html` `mg-brand-mark-fallback` | accepted anchor | Keep; missing real brand asset is a known gap. |
| `game-topbar.html` address as `muted-text` below brand | current baseline | Keep as secondary metadata; important status values must not be moved to muted text later. |
| `game-sidebar.html` hero identity `mg-card` with golden badge | current baseline | Keep; not the selected-server/prestige premium card. |
| `game-sidebar.html` selected world `mg-card mg-card--legend` | partial current baseline | Keep until `UI-SHELL-19/21`; should become premium context card pattern later. |
| `game-sidebar.html` nav links as `mg-card ... routerLinkActive="is-active heading-color"` | temporary fallback / debt | Keep only as temporary fallback; `UI-SHELL-23/26/27` should replace with dedicated nav active/hover/focus pattern. |
| `game-sidebar.scss` empty file | should remove if still empty when next touching sidebar | Safe cleanup candidate for first sidebar implementation task. |
| `_game-shell.scss` `mg-brand-mark-fallback` | accepted anchor / current baseline | Keep; do not copy prototype brand CSS. |
| Prototype CSS/classes | not present in runtime shell | keep absent | Do not copy into production. |

Remove candidates before code changes:

- `src/app/layout/components/game-sidebar/game-sidebar.scss` if it remains empty when a sidebar runtime task next touches the component.
- No runtime shell class should be removed in 00-02. Nav/resource/card replacements need their specific implementation tasks.

Unknown/user decision:

- Whether `app-shell.html` should keep utility-only shell containment or move to named `mg-game-shell` grid in `UI-SHELL-03/05`.
- Whether `UI-SHELL-09` is allowed to add one structural topbar grid class to guarantee centered brand independent of left/right content width.

## Important baseline note

“Keep for now” means rollback-safe temporary baseline only.

It does not mean visual acceptance, final shell acceptance, or permission to preserve the current layout if a later UI-SHELL microtask proves that it does not match accepted `game-shell-v1` visual anchors.

Future implementation tasks must still:
- follow their own allowed-files / allowed-classes limits;
- prefer existing utilities and patterns;
- report missing patterns instead of inventing local CSS;
- preserve required visual anchors unless the user accepts a gap/defer decision.

## UI-SHELL-02 Token And Color Anchor Table

| Visual need | Current token/pattern | Source file | Gap / owner |
|---|---|---|---|
| dark navy shell background | `--mg-color-bg` dark value `#080d14`; dark theme gradient | `_theme.dark.scss`, `_variables.scss` | Token exists. Shell host currently relies on body/theme background rather than named shell background class. |
| elevated topbar surface | `--mg-color-bg-surface`, `--mg-color-bg-surface-elevated`, `mg-card`, `shadow-soft` | `_theme.dark.scss`, `_surface.scss`, `_variables.scss` | Pattern gap: no topbar-specific elevated shell surface. Owner: `UI-SHELL-06/09`. |
| sidebar surface | `mg-card`, `--mg-color-bg-surface`, `border-0` wrapper | `app-shell.html`, `_surface.scss` | Pattern gap: no sidebar-specific surface token/class. Owner: `UI-SHELL-06/21/27`. |
| soft gold border | `--mg-color-border` dark `rgba(240, 201, 111, 0.2)` | `_theme.dark.scss` | Token exists as generic border. No premium/context border variant yet. |
| active nav gold inset | none | `game-sidebar.html`, `_badges.scss`, `_theme.dark.scss` | Pattern gap. Owner: `UI-SHELL-26`; do not fake with one-off local border before nav inventory. |
| active nav hover gold/blue wash | generic anchor hover uses `--mg-color-link-hover`; dark theme has gold secondary and blue info | `_typography.scss`, `_theme.dark.scss` | Pattern gap. Owner: `UI-SHELL-27`; should use token-level/shared nav pattern. |
| brand mark gold/navy medallion | `mg-brand-mark-fallback` uses secondary/antique/background tokens | `_game-shell.scss` | Pattern exists as fallback. Missing asset/key remains in `icon-brand-registry.md`. |
| resource chip border/background | `tag-badge--muted` uses surface + border + muted text | `_badges.scss`, `game-topbar.html` | Fallback exists. Dedicated `mg-chip`/resource chip pattern missing. Owner: `UI-SHELL-14/15`. |
| selected server/prestige premium card | `mg-card mg-card--legend`, `tag-badge--success/muted`, `heading-color` | `game-sidebar.html`, `_surface.scss`, `_badges.scss` | Pattern gap: premium context card and separated Prestige sub-surface missing. Owner: `UI-SHELL-19/21/22`. |
| focus-visible ring/outline | global `:focus-visible` outline with secondary/gold mix | `_typography.scss` | Token exists globally. Nav-specific focus surface still needs `UI-SHELL-27`. |

## Muted-Text Audit

- Acceptable current uses: address secondary metadata, resource per-hour secondary line, server labels, notification descriptions/timestamps.
- Do not use `muted-text` for active nav state, server status, prestige rank, blocking membership/staff state, missing data dependencies or errors.
- Existing notification error templates use `tag-badge tag-badge--warn`, which is stronger than muted-only diagnostics.

## Deferred Visual Anchors

| Anchor | Current status | Deferred to |
|---|---|---|
| Desktop brand centered independent of side content widths | partially met by middle flex group, not guaranteed | `UI-SHELL-09` |
| Fallback M brand mark visible and distinct | met | none |
| Health and XP/Level summary in left topbar | met | none |
| Notifications/Staff plus Drachma/Materials/Workforce in right topbar | met | `UI-SHELL-10/13` for placement/data hardening |
| Resources as compact stacked chips/cards | partial fallback through badges | `UI-SHELL-14/15` |
| Sidebar selected server/prestige as compact premium context card | partial generic card | `UI-SHELL-19/21/22` |
| Active sidebar nav gold left inset | not met | `UI-SHELL-26` |
| Hover/focus/active accepted navy/gold/blue language | partial global focus/anchor hover only | `UI-SHELL-27/30` |
| Important values not muted | mostly met; keep auditing on touched templates | every implementation task |

## Verification

- Runtime code changed: no.
- Generated DB types changed: no.
- Prototype CSS copied: no.
- `npx tsc --noEmit`: not run; docs-only inventory.
- `npm run build`: not run; docs-only inventory.
- Focused specs: not run; docs-only inventory.
