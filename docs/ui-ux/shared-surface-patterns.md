# Shared Surface, Badge, Chip And Page Header Patterns

Status: UI-CORE-4 draft for review  
Scope: pattern plan only; no SCSS implementation yet

This document defines the shared/global UI patterns that should replace local feature-specific card, badge, chip and page-header styling. It does not add CSS. Implementation should happen in a later global SCSS/shared-component task with build/style verification.

Use with:

- `docs/ui-ux/mythsworn-style-contract.md`;
- `docs/ui-ux/global-scss-shared-inventory.md`;
- `docs/ui-ux/local-scss-budget-checklist.md`;
- `docs/ui-ux/prototype-production-mapping.md`;
- `docs/ui-ux/primeng-vendor-wrapper-lookup.md`.

## Existing Foundation

| current file / pattern | current role | status | UI-CORE-4 decision |
|---|---|---|---|
| `src/scss/base/_surface.scss` / `.mg-card` | Standard card surface | legacy-compatible | Keep as baseline. Add semantic variants globally later. |
| `src/scss/base/_badges.scss` / `.tag-badge` | Badge and compact state base | production-ready | Keep canonical `.tag-badge--*` variants. Treat old aliases as compatibility only. |
| `src/scss/utilities/_shadows.scss` | Shadow utilities | production-ready | Use sparingly; repeated card depth belongs in surface variants. |
| `src/scss/utilities/_borders.scss` | `border-0` only | production-ready but minimal | Do not build local border systems; add global surface variants if needed. |
| `src/scss/utilities/_backgrounds.scss` | `bg-transparent` only | production-ready but minimal | Do not stack backgrounds to fake card variants. |
| `src/scss/layouts/_components.scss` / `.mg-section*` | Section/container/title primitives | production-ready | Use until a game page-header pattern is implemented. |

## Target Pattern Set

| target pattern | intended use | current mapping | target semantic name | implementation status |
|---|---|---|---|---|
| Page header | Main in-game/admin page orientation with title, copy, status chips and optional summary panel | `.mg-card`, `.mg-section__title`, `.tag-badge`, grid/flex utilities | `mg-page-header` | planned |
| Standard card | Default framed surface | `.mg-card` | `mg-card` | exists |
| Elevated / premium card | Important summary, dashboard stat, hero/gameplay highlight | `.mg-card` plus local utility combinations today | `mg-card--elevated` | planned |
| Selected / active surface | Current selection, active nav-like row, selected target/card | `.mg-card` plus local state class today | `mg-card--selected` or `mg-surface--selected` | planned |
| Compact row surface | Dense list/report/notification/table-like row | ad hoc `.mg-card` rows today | `mg-row-surface` | planned |
| Summary card | Key/value summary block in page header or side panel | `.mg-card`, grid/flex utilities | `mg-summary-card` | planned |
| Summary row | Label/value row inside summary/report blocks | ad hoc grid/flex rows | `mg-summary-row` | planned |
| Stat card | Metric card with label, value, optional subtext/icon | `.mg-card`, `.mg-grid`, text utilities | `mg-stat-card` | planned |
| Note/info panel | Non-blocking explanation, dependency, diagnostic or read-only helper | `.mg-card` / muted text today | `mg-note-panel` | planned |
| Status pill | Compact status/control state, stronger than free-form muted text | `.tag-badge` today | `mg-status-pill` | planned |
| Chip | Compact metadata/resource chip, often icon + label/value | `.tag-badge` or flex utilities today | `mg-chip` | planned |
| Detail side panel | Secondary read-only details next to primary list/form | `.mg-card`, grid layout | `mg-detail-panel` | planned |

## Badge And Chip Semantics

Use canonical badge variants for semantic meaning:

| semantic use | current class | notes |
|---|---|---|
| primary / important | `tag-badge--primary` | Use for primary status, not arbitrary red tint. |
| success | `tag-badge--success` | Success/available/confirmed. |
| danger | `tag-badge--danger` | Error/blocking/destructive state. |
| info | `tag-badge--info` | Neutral information. |
| warning | `tag-badge--warn` | Warnings and attention states. |
| special/system | `tag-badge--arcane` | Rare/special/system context. |
| muted | `tag-badge--muted` | Secondary metadata. |
| gold/accent | `tag-badge--golden` | Premium/important accent, use sparingly. |

Legacy aliases without the canonical `tag-badge--*` prefix, and legacy domain aliases such as `green`, `blue`, `gray`, `violet`, `join`, `gm`, `owner`, `member` and similar names, are compatibility-only. New UI should use canonical semantic variants such as `tag-badge--muted` and `tag-badge--golden` where appropriate.

Chips are not a separate color system. When implemented, `mg-chip` should use the same semantic token family as badges and surface variants.

## Pattern Rules

### Page Header

Use a page header when a screen needs orientation and DB-backed state:

- title and short copy;
- status chips/badges;
- optional summary card;
- optional primary action area.

Do not put marketing hero layouts inside game/admin workflow screens. Do not copy prototype page-header gradients or `mb-page-header` classes. Use DB/read-model data for counters, labels and status values.

### Cards And Surfaces

Use `mg-card` as the default card. Add new global variants only when they serve a repeated visual role:

- elevated/premium;
- selected/active;
- compact row;
- note/info;
- summary/stat.

Do not create local `auction-card`, `admin-card`, `pvp-card`, `trial-card` or similar classes when a global surface plus layout utility is enough.

### Summary And Stat Cards

Summary/stat cards may display read-model values, but they must not compute gameplay authority. Examples:

- resource amount from read model;
- unread count from notification/report service;
- action eligibility from RPC/read model;
- reward/report result fields from durable report/read model.

If the DB/read model does not expose a value, show a dependency/gap instead of hardcoding a prototype number.

### Note / Info / Diagnostics

Use note/info panels for:

- DB/read-model dependency explanations;
- admin explainability;
- non-blocking diagnostics;
- empty or unavailable state.

Warnings/action-critical states must be visible inline and not only in a toast, tooltip or color.

## Token And Styling Rules

Future implementation must:

- use existing `--mg-*` theme tokens and SCSS variables;
- keep gradients, borders and shadows global and token-driven;
- avoid raw prototype colors/palette values;
- avoid feature-local PrimeNG internals;
- avoid local duplicated badge/chip/card systems;
- keep status text visible and not color-only.

If a required token does not exist, report a token gap instead of adding a feature-local one-off color.

## Implementation Plan

| phase | action | verification |
|---|---|---|
| 1 | Add global surface variants in `src/scss/base/_surface.scss` or a future global components file imported by `main.scss`. | style compile/build |
| 2 | Add summary/stat/note/chip/status pattern classes globally only if at least one accepted screen task needs them. | build + representative visual smoke |
| 3 | Migrate touched screens opportunistically, not by big-bang rewrite. | focused route/component smoke |
| 4 | Add shared Angular components only when class patterns are not enough or markup repeats across pages. | focused specs where component has behavior |

## Review Checklist

Before accepting a UI task using these patterns:

- Did it use `mg-card`/planned global surface names before local classes?
- Did it use canonical `.tag-badge--*` variants rather than legacy aliases?
- Did it avoid local copied gradients/borders/shadows?
- Did it keep gameplay/admin labels DB/read-model sourced?
- Did it avoid card-inside-card composition except for repeated items/tools?
- Did it report local SCSS exceptions using UI-CORE-3?
- Did it include accessibility/responsive smoke notes?
