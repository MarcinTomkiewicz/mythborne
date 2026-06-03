# UI-SHELL-32 - Shell Foundation Acceptance Report

Status: decision-ready shell foundation report
Date: 2026-05-12

## Completed Tasks

- UI-SHELL-00/01/02: README-first inventory, rollback boundary and token/color anchor inventory.
- UI-SHELL-04/05/06: authenticated shell containment, main scroll/content boundary and tokenized shell surfaces.
- UI-SHELL-07/08/09/10: topbar anchor mapping, composition ownership, three-zone layout and right-zone notification placement.
- UI-SHELL-11/12B/13/14/15: Health semantics boundary, Health/XP visual pattern, resource data boundary and final compact resource summaries.
- UI-SHELL-17: topbar color/elevation pass.
- UI-SHELL-19/20/21/22/23/24/25: sidebar context card, data guards, IA groups, nav item pattern, nav interactions, icon registry pass and badge semantics.
- UI-SHELL-26/27/28: shell palette alignment, content container rhythm and topbar notification dropdown behavior/presentation.
- UI-SHELL-29: deferred after reverting responsive-only template changes.
- UI-SHELL-30/31: prototype comparison pass and cleanup of the empty sidebar stylesheet hook.

## Kept Runtime Classes And Patterns

- Shell structure: `mg-game-shell`, `mg-game-shell__topbar`, `mg-game-shell__sidebar`, `mg-game-shell__main`.
- Topbar layout: `mg-grid`, `grid-cols-3`, `grid-cols-1-lg`, `grid-items-center`, existing flex/gap/width utilities.
- Brand fallback: `mg-brand-mark-fallback` with `shadow-brand-mark`.
- Health/XP: shared `mg-chip` variants and `app-game-bar`.
- Resources: shared shell `mg-resource-summary*` pattern.
- Sidebar context: shared `mg-context-card*` pattern.
- Sidebar nav: shared shell `mg-shell-nav-item*` pattern.
- Topbar controls/dropdowns: `mg-shell-topbar-control`, `dropdown-anchor`, `dropdown-trigger`, `dropdown-panel`, `dropdown-list`, `dropdown-list-item`.

## Visual Anchors Matched

- Desktop topbar keeps left hero status, centered Mythsworn brand and right notifications/resources.
- Fallback `M` brand reads as a gold/navy medallion, not a generic badge.
- Health and XP/Level are compact topbar chips with strong values.
- Drachma, Materials and Workforce are compact right-side summaries with icon, label, strong value and rate; Character Points are not shown as a produced resource.
- Sidebar selected context is a compact premium card with Hero, selected server/status and Prestige separated inside one surface.
- Sidebar nav uses compact icon+label rows with tokenized hover/focus/active styling and a visible active left inset.
- Shell surfaces use the dark navy/gold theme token direction rather than copied prototype CSS.
- Route content stays in `mg-container`, with `max-w-none` still available for wide/admin routes.

## Deferred Anchors And Known Gaps

- Responsive shell/topbar/sidebar smoke and fixes remain deferred to UI-SHELL-29.
- Health still uses the UI-SHELL-11 temporary `max / max` display until a canonical current-HP read model exists.
- Brand remains a temporary `M` fallback until a real brand asset/key exists.
- Full browser/manual visual smoke remains user-side.
- Game dashboard and persistent player state are not part of shell foundation; next work should move to `UI-DASHBOARD-*`.

## Data And Read-Model Dependencies

- Topbar resources use the existing active-hero `hero_resources` path and shared resource display definitions.
- Sidebar selected server/status uses `ActiveServer`.
- Sidebar Prestige uses `get_hero_prestige_public_summary` with stale hero/server guards.
- No DB/RPC/generated-type changes were made by the final cleanup/report slice.

## Verification Checklist

- Focused shell/sidebar specs: required after UI-SHELL-31 cleanup.
- `npx tsc --noEmit`: required after UI-SHELL-31 cleanup.
- `npm run build`: required after UI-SHELL-31 cleanup.
- Static cleanup grep: required for `mg-game-topbar__*`, `mg-resource-chip*`, and `game-sidebar.scss`.
- Manual/browser smoke: user-side for final visual acceptance.

## Recommended Next Tasks

- Start `UI-DASHBOARD-1` for the hero-centric dashboard layout.
- Keep `UI-DASHBOARD-2` separate for durable persistent state widgets.
- Revisit UI-SHELL-29 only when the user explicitly starts the dedicated responsive pass.
