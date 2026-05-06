# Surface, Card, Badge And Chip Pattern Expansion Contract

Status: UI-CORE-9 draft for review  
Scope: documentation only; no Angular, SCSS, DB/RPC or generated-type changes

This document turns the UI-CORE-4 surface plan into a concrete global pattern contract for future SCSS/shared-component implementation. It does not add the classes yet. Until a runtime SCSS task implements them, production code should keep using the existing `mg-card`, `mg-section*`, `.tag-badge--*`, grid/flex utilities and PrimeNG wrappers.

Use with:

- `docs/ui-ux/shared-surface-patterns.md`;
- `docs/ui-ux/legacy-mg-scss-modernization-plan.md`;
- `docs/ui-ux/text-utility-semantics.md`;
- `docs/ui-ux/local-scss-budget-checklist.md`;
- `docs/ui-ux/prototype-production-mapping.md`.

## Existing Foundation

| source | current pattern | status | rule |
|---|---|---|---|
| `src/scss/base/_surface.scss` | `.mg-card`, `.mg-card--legend`, `.card-legend` | production compatibility | Keep as default surface until global variants exist. |
| `src/scss/base/_badges.scss` | `.tag-badge`, canonical `.tag-badge--*`, legacy domain aliases | mixed | New UI uses canonical variants only. |
| `src/scss/utilities/_tag-badge-aliases.scss` | color aliases `green/blue/gray/violet/golden` | compatibility | Do not use in new UI; keep until usage audit. |
| `src/scss/utilities/_shadows.scss` | `shadow-none/sm/soft/lg` | production utility | Use sparingly; prefer semantic surface variant when repeated. |
| `src/scss/utilities/_borders.scss` | `border-0` | narrow utility | Not a surface system. |
| `src/scss/utilities/_backgrounds.scss` | `bg-transparent` | narrow utility | Not a surface system. |
| `src/scss/layouts/_components.scss` | `.mg-section*` titles/subtitles | production compatibility | Current page/section heading foundation. |

## Target Global Classes

These names are the target API for a future SCSS implementation.

| class | purpose | current fallback before implementation | notes |
|---|---|---|---|
| `mg-page-header` | Main page orientation block with title, intro, status chips and optional summary region. | `mg-card` + `mg-section__title` + layout utilities. | For gameplay/admin workflow screens, not marketing heroes. |
| `mg-page-header__main` | Title/copy side of page header. | `flex-col gap-*`. | Layout only. |
| `mg-page-header__meta` | Compact summary/status area in header. | `flex-row-start-center flex-wrap gap-*`. | Use DB/read-model data for counters/status. |
| `mg-card--elevated` | More important card/surface, used sparingly. | `mg-card` only. | Token-driven shadow/border; no copied prototype gradients. |
| `mg-card--selected` | Selected or current item/target/card. | `mg-card` + feature state class only if unavoidable. | Selection must reflect state/route, not CSS-only access control. |
| `mg-row-surface` | Compact repeated row/list item surface. | `mg-card p-md` or existing table/list wrapper. | Should reduce repeated row cards later. |
| `mg-summary-card` | Key/value summary group. | `mg-card` + grid/flex. | Good for header panels and side summaries. |
| `mg-summary-row` | Label/value row inside summary/report/detail cards. | `flex-row-between-center gap-*`. | Label muted, value normal/heading. |
| `mg-stat-card` | Metric/stat card with label, value, optional detail/icon. | `mg-card` + `muted-text` label + `heading-color` value. | Must not use color-only semantics. |
| `mg-note-panel` | Inline info/dependency/diagnostic panel. | `mg-card` with explicit copy. | Replaces muted-only DB/RLS/config diagnostics. |
| `mg-note-panel--info` | Informational note. | `mg-card` + `tag-badge--info`. | Non-blocking. |
| `mg-note-panel--warning` | Warning/dependency note. | `mg-card` + `tag-badge--warn`. | Action-critical copy stays inline. |
| `mg-note-panel--danger` | Blocking/destructive/error note. | `mg-card` + `tag-badge--danger`. | Use for durable page-level failures. |
| `mg-status-pill` | Compact status state stronger than free-form text. | `.tag-badge--*`. | May be an alias/wrapper over badge semantics. |
| `mg-chip` | Compact metadata/resource chip, often icon + label/value. | `.tag-badge` or flex row. | Shares semantic color rules with badges. |
| `mg-detail-panel` | Secondary detail panel beside/under primary list/form. | `mg-card` + grid/flex. | Avoid nested cards inside this panel. |

## Badge And Status Semantics

| semantic meaning | canonical current badge | future alias if needed | use |
|---|---|---|---|
| neutral metadata | `tag-badge--muted` | `mg-status-pill--muted` | Secondary labels, ids, non-state metadata. |
| informational state | `tag-badge--info` | `mg-status-pill--info` | Active info, neutral workflow state. |
| success/available/confirmed | `tag-badge--success` | `mg-status-pill--success` | Completed, available, accepted. |
| warning/attention | `tag-badge--warn` | `mg-status-pill--warning` | Pending risk, partial blocker, action needed. |
| danger/blocking/destructive | `tag-badge--danger` | `mg-status-pill--danger` | Errors, blocked, destructive confirmation. |
| primary/important | `tag-badge--primary` | `mg-status-pill--primary` | Primary state, not arbitrary accent. |
| special/system | `tag-badge--arcane` | `mg-status-pill--arcane` | Rare system/special technical state. |
| premium/accent | `tag-badge--golden` | `mg-status-pill--accent` | Important accent, use sparingly. |

Legacy aliases such as `.green`, `.blue`, `.gray`, `.violet`, `.join`, `.gm`, `.owner`, `.member` remain compatibility-only. Do not add new domain aliases for a feature.

## Repeated Prototype Surface Mapping

| prototype pattern | production target | current fallback | forbidden |
|---|---|---|---|
| Top page block with title/copy/status chips | `mg-page-header` | `mg-card` + section title/layout utilities | `mb-page-header`, copied gradients. |
| Dashboard/admin stat tiles | `mg-stat-card` | `mg-card` + label/value layout | One-off `dashboard-stat-card` classes. |
| Trade/auction/report compact rows | `mg-row-surface` or table/list pattern from UI-CORE-14 | existing `mg-card` row | Local `auction-row-card`, copied prototype shadows. |
| DB/RLS/config diagnostics | `mg-note-panel--warning` or `--danger` | `mg-card` + `tag-badge--warn/danger` | Muted-only critical diagnostics. |
| Selected target/listing/route card | `mg-card--selected` | `mg-card` + reviewed state class | CSS-only hidden access state. |
| Item/resource/status chips | `mg-chip` or `mg-status-pill` | `.tag-badge--*` | Prototype initials/emoji as final icons. |
| Detail side panel | `mg-detail-panel` | `mg-card` + layout utilities | Card-inside-card nesting. |

## Implementation Rules For Future SCSS Task

1. Add repeated patterns globally in `src/scss/base` or `src/scss/layouts`, not feature-local SCSS.
2. Reuse existing theme variables and `--mg-*` tokens.
3. Do not copy prototype `--mb-*`, gradients, palette values, shadows or layout class names.
4. Keep existing `mg-card` and `.tag-badge--*` APIs stable.
5. Add semantic variants only when at least two screens/pattern families need them, or when a backlog task explicitly targets the shared pattern.
6. Do not use local `.p-*` PrimeNG internals to fake a surface pattern.
7. Badge text/labels come from DB/read models/dictionaries where applicable; CSS chooses presentation only.
8. Meaning must not depend on color alone.

## Token Gaps / Follow-Ups

| gap | impact | follow-up |
|---|---|---|
| No implemented `mg-page-header`. | Page headers keep repeating `mg-card` + `mg-section__title`. | Add in future SCSS/shared layout task with representative visual smoke. |
| No implemented `mg-summary-card` / `mg-stat-card`. | Metrics use ad hoc card rows. | Add global variants before broad dashboard/admin UI pass. |
| No implemented `mg-note-panel`. | Diagnostics often fall back to muted card copy. | Add info/warn/danger panels before broader cleanup from UI-CORE-8. |
| No implemented `mg-chip` / `mg-status-pill`. | Badges carry both status and chip use cases. | Consider aliases/wrappers over `.tag-badge--*`. |
| Existing utility shadows are generic. | Repeated elevated/premium surfaces risk local utility piles. | Prefer semantic surface variant over repeated `shadow-*` combinations. |

## Review Checklist

Future implementation tasks must report:

- global classes added/changed:
- variants added:
- compatibility aliases:
- token gaps:
- local SCSS avoided:
- copied from prototype: no:
- representative visual smoke:
- build/style compile:
