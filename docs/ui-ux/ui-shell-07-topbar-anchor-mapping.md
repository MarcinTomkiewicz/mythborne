# UI-SHELL-07 Topbar Visual Anchor Mapping

Date: 2026-05-12

Scope: no-code mapping for topbar anchors before UI-SHELL-08/09/10 runtime work.

Runtime files were inspected only. No Angular, SCSS, generated DB type, route, data-layer or test changes are part of this artifact.

## Sources Checked

| Source | Result |
|---|---|
| `docs/ui-ux/README.md` | Confirms prototype archive and production mapping lookup order. |
| `docs/ui-ux/prototype-production-mapping.md` | Maps game shell/topbar to `app-shell`, `game-topbar`, `game-sidebar`, `.mg-card`, `.tag-badge`, flex/grid utilities and notes missing resource chip/nav patterns. |
| `docs/ui-ux/ui-shell-00-02-inventory.md` | Confirms current shell/topbar baseline, accepted `M` fallback, resource chip fallback, and missing guaranteed centered topbar grid pattern. |
| `docs/ui-ux/prototypes/mythborne_ui_shell_prototype.html` | Accepted shell direction: Health + XP left, Mythsworn brand centered, resources right, responsive collapse/wrap. Prototype CSS/classes were not copied. |
| `src/app/layout/components/app-shell/app-shell.html` | Shell owns placement and currently hosts `app-game-topbar` inside `mg-game-shell__topbar`; staff-only fallback remains outside normal game topbar content. |
| `src/app/layout/components/game-topbar/game-topbar.html` | Current topbar has left hero metrics, centered brand/address and right notifications/resources using flex utilities and `tag-badge` fallback chips. |
| `src/app/layout/components/game-topbar/game-topbar.ts` | Current data sources are `ActiveHero`, `HeroDerivedStats`, `Hero.getHeroExperienceProgress()`, `EstateAddresses`, direct `hero_resources` read and notification components. |
| `src/scss/base/_flex.scss`, `src/scss/utilities/*`, `src/scss/base/_badges.scss`, `src/scss/base/_typography.scss` | Existing flex, gap, width, responsive utility, badge and heading/focus primitives cover most composition, but no utility guarantees a full-width centered middle topbar zone independent of side widths. |

## Prototype Anchors

| Anchor | Prototype direction | Current production mapping |
|---|---|---|
| left status zone | Health chip plus XP/Level progress on the left | First `game-topbar` flex group with Health badge and XP/Level badge. |
| centered brand | Brand mark plus Mythsworn title centered in topbar | Middle `game-topbar` group with `mg-brand-mark-fallback`, title and address metadata. |
| right resources | Drachma/Materials/Workforce compact chips on the right | Right `game-topbar` flex group with notification bells and resource fallback badges. |
| responsive behavior | Topbar zones wrap/collapse without overlap | Current `flex-col-lg`, `flex-wrap` and responsive alignment help, but do not prove centered desktop brand or all narrow widths. |

## Required Mapping Table

| Topbar anchor | Current implementation | Existing utility/component | Gap | Next task owner |
|---|---|---|---|---|
| left Health | `game-topbar.html` renders a `Health` `tag-badge` from `healthValue()` over `HeroDerivedStats.resolveActiveHeroDerivedStats()`. | `tag-badge tag-badge--muted`, `pi pi-heart`, `heading-color`, `flex-row-start-center`, `flex-wrap`, `gap-sm`. | Current copy shows a single derived health value, not current/max live HP. Avoid implying unavailable live HP semantics. | `UI-SHELL-11` |
| XP/Level | `game-topbar.html` renders `Level {{ hero()?.level ?? 1 }}`, current XP and `app-game-bar` only when `experienceToNextLevel() > 0`. | `app-game-bar`, `tag-badge tag-badge--muted`, `flex-col`, `flex-row-between-center`, `min-w-250`, `w-100-xs`. | Semantics are tied to `Hero.getHeroExperienceProgress()`; no broad layout change needed, but threshold/source should remain explicit. | `UI-SHELL-12` |
| centered brand | Middle topbar group renders `mg-brand-mark-fallback`, `Mythsworn` and current address metadata. | `mg-brand-mark-fallback`, `mg-section__title mg-section__title--sm mg-section__title--no-margin`, `muted-text`, `flex-row-center-center`, `flex-none`, `min-w-200`. | Brand is a middle flex item, not guaranteed centered against the full topbar when left/right widths differ. | `UI-SHELL-09` |
| right notifications | Player notification bell is in the right resource group before resource badges. | `app-notification-bell`, existing notification component/state, right-zone flex utilities. | Placement is visually in the right group, but a future three-zone grid must ensure notifications do not affect brand centering. | `UI-SHELL-10` |
| staff bell | Staff notification bell is in the right resource group when `app-game-topbar` is visible; `app-shell` also has a staff-only fallback when topbar is hidden. | `app-staff-notification-bell`, existing staff notification component/state, `flex-row-end-center` fallback wrapper. | Need a clear delegation boundary: normal game topbar content belongs in `app-game-topbar`; fallback should not create parallel topbar children that break centering. | `UI-SHELL-08`, then `UI-SHELL-10` |
| Drachma chip | `resourceDisplay()` maps `drachma` to label `Drachma`, amount and per-hour line; template uses `pi pi-cash`. | `tag-badge tag-badge--muted`, `pi pi-cash`, `flex-col`, `heading-color`, `muted-text`. | Current fallback matches icon/label/value/rate anchors, but there is no dedicated `mg-chip`/resource-chip pattern. | `UI-SHELL-13`, `UI-SHELL-14`, decision in `UI-SHELL-15` |
| Materials chip | `resourceDisplay()` maps `materials` to label `Materials`, amount and per-hour line; template uses `pi pi-marble`. | `tag-badge tag-badge--muted`, `pi pi-marble`, `flex-col`, `heading-color`, `muted-text`. | Same as Drachma: fallback is usable, final resource chip pattern is still a documented gap. | `UI-SHELL-13`, `UI-SHELL-14`, decision in `UI-SHELL-15` |
| Workforce chip | `resourceDisplay()` maps `workforce` to label `Workforce`, amount and per-hour line; template uses `pi pi-workforce`. | `tag-badge tag-badge--muted`, `pi pi-workforce`, `flex-col`, `heading-color`, `muted-text`. | Same as Drachma: fallback is usable, final resource chip pattern is still a documented gap. | `UI-SHELL-13`, `UI-SHELL-14`, decision in `UI-SHELL-15` |
| responsive wrap | Topbar section uses `flex-row-between-center flex-col-lg gap-md w-100`; left/right groups use `flex-wrap`; right group switches to `flex-row-start-center-lg`. | Existing flex responsive utilities, `gap-md`, `gap-sm`, `w-100`, `w-100-xs`, `min-w-*`. | Responsive utilities help avoid obvious overlap, but desktop full-width centering and narrow-width behavior need runtime verification after the three-zone decision. | `UI-SHELL-09`, `UI-SHELL-18` |

## Ordering Recommendation

1. `UI-SHELL-08`: keep `app-shell` as shell placement only and make `app-game-topbar` the normal game-topbar content owner.
2. `UI-SHELL-09`: solve desktop three-zone layout. Existing flex utilities are partial; one structural `mg-game-topbar` grid may be justified if centering cannot be expressed by existing utilities.
3. `UI-SHELL-10`: place player/staff notifications inside the right zone after the three-zone boundary is settled.
4. `UI-SHELL-11` and `UI-SHELL-12`: confirm health and XP semantics separately from layout.
5. `UI-SHELL-13` through `UI-SHELL-15`: keep current resource data/source and fallback chip mapping before deciding whether a real global chip pattern belongs in UI-CORE work.
6. `UI-SHELL-18`: verify responsive wrap/overlap after the preceding topbar structure tasks.

## Verification

- Runtime code changed: no.
- Generated DB types changed: no.
- Prototype CSS/classes copied: no.
- `npx tsc --noEmit`: not run; docs-only mapping.
- `npm run build`: not run; docs-only mapping.
- Focused specs: not run; no runtime behavior changed.
- Manual smoke: user-side / not applicable for this no-code mapping.
