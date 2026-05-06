# PrimeNG Table, Paginator And List Pattern Decision

Status: UI-CORE-14 draft for review  
Scope: documentation and decision guidance only; no Angular, SCSS, runtime, DB/RPC or generated-type changes

This document decides when future UI work should use PrimeNG table/paginator wrappers and when it should use custom list/card rows. It extends:

- `docs/ui-ux/mythsworn-style-contract.md`;
- `docs/ui-ux/global-scss-shared-inventory.md`;
- `docs/ui-ux/primeng-vendor-wrapper-lookup.md`;
- `docs/ui-ux/shared-surface-patterns.md`;
- `docs/ui-ux/utility-class-audit.md`;
- `docs/ui-ux/item-popover-contract.md`.

## Sources Checked

| source | result |
|---|---|
| `src/scss/vendors/_p-table.scss` | Existing PrimeNG datatable wrapper exists. It covers table surface, header text and row hover colors. |
| `src/scss/vendors/_p-paginator.scss` | Existing PrimeNG paginator wrapper exists. It covers paginator tokens, nav buttons and rows-per-page select styling. |
| `src/app/**/*.html` grep for `p-table` | `p-table` is used mostly for admin/dense read-only or editor-support tables, plus hero attributes. |
| `src/app/**/*.html` grep for paginator usage | No production `p-paginator` / `PaginatorModule` usage found in templates/imports during UI-CORE-14 discovery. |
| Player-facing list screens | Reports, notifications, auction listings, direct trade offers, PvP vicinity, exploration and mansion use card/list/grid patterns. |
| Service/read model pagination grep | Several read paths expose `limit`/`offset` (`reports`, `notifications`, `pvp targets`, `estate addresses`, moderation/search). Total-count support is not consistent. |

## Decision Summary

| context | default pattern | pagination default | reason |
|---|---|---|---|
| Admin dense comparable data | PrimeNG `p-table` with existing wrapper. | PrimeNG paginator when server/read model provides paging and total/count or stable page controls. | Dense rows, comparable columns and admin scanning benefit from table behavior. |
| Admin small dictionaries/config previews | PrimeNG `p-table`; no paginator unless row count needs it. | No paginator for small bounded lists. | Avoid pagination noise for short reference/config tables. |
| Reports center/archive | Custom list/card rows. | Server/read-model `limit`/`offset`; use PrimeNG paginator only when total/count or page report is available. | Reports are content-rich, status-rich and viewer-relative, not purely tabular. |
| Notification archive/list | Custom list rows/cards. | Server/read-model `limit`/`offset`; PrimeNG paginator for full archive if total/count exists. | Notifications need title/body/status/action context, not dense columns. |
| Notification bell/dropdown | Existing bell list, no paginator. | Limit from notification read path. | Bell is a compact overlay, not an archive surface. |
| Auction listings | Custom listing cards/list rows. | Read-model pagination if available; PrimeNG paginator if total/count exists. | Each listing is item-rich and action-rich, with item popover and bid/buy states. |
| Auction transaction/admin-like history | Table only when the task needs dense comparable transaction audit. | PrimeNG paginator if read path supports it. | History/audit can be tabular; marketplace browsing should not default to table. |
| PvP vicinity targets | Custom target cards/list rows. | Existing `limit`/`offset` simple prev/next is acceptable while total count is unavailable; PrimeNG paginator if DB read model adds count/total. | Target card needs eligibility, travel/protection, action state and reason detail. |
| Armory item grids | Custom item grid/cards with shared item popover. | Prefer inventory/read-model paging only when needed; do not add table for item browsing by default. | Item browsing is visual/status-rich and needs item popover contract. |
| Direct trade pending offers | Custom offer cards/list rows. | Read-model paging when offers grow; PrimeNG paginator if total/count exists. | Offers contain multiple items, participants, CP/lock/status actions and explanations. |
| Combat/report result detail | Custom report/detail pattern. | Not paginated unless DB exposes durable timeline paging. | Combat logs and report details need ordered narrative/detail display. |

## Table Use Rules

Use PrimeNG `p-table` when all are true:

- the data is dense and comparable across rows;
- columns have stable labels and compact values;
- row actions are secondary or fit standard action columns;
- item/report/detail content does not need large rich preview inside every row;
- the table can use existing PrimeNG wrappers without local `.p-*` skins;
- responsive behavior is acceptable with PrimeNG table behavior or documented horizontal scroll.

Do not use `p-table` for:

- item-rich marketplace/armory browsing where item popover/card context matters;
- combat/report narrative content;
- player-facing offers/listings where each row has multiple nested sections;
- replacing accepted card/list UX just because row count is high;
- hiding missing read-model fields by flattening content into weak columns.

## List/Card Use Rules

Use custom list/card rows when the item has:

- multiple status badges or eligibility reasons;
- nested item rows or item popover triggers;
- player-facing action state;
- viewer-relative outcome or access/reason copy;
- rich descriptions, combat/report summary, reward data or notification body;
- responsive layout needs where table columns would clip important text.

List/card rows should still use existing production primitives:

- `mg-card` and future `mg-row-surface` / `mg-detail-panel`;
- `.tag-badge--*` and future `mg-status-pill` / `mg-chip`;
- grid/flex/spacing utilities within UI-CORE-13 class budget;
- PrimeNG buttons/menus/popovers where appropriate.

## Paginator Decision

PrimeNG paginator is preferred for standard full archive/list paging when the read path provides enough state:

- page size;
- current offset/page;
- total record count or enough data to render page report/page numbers;
- stable filters/search state;
- owner-safe server/read-model query.

If only `limit`/`offset` exists and total count is not available:

- a simple Previous/Next control is acceptable as a documented temporary pattern;
- label it as unknown-total paging;
- do not build a local numbered paginator;
- report the missing total/count as a read-model dependency if numbered pagination is needed.

If the read path has no pagination:

- do not invent client-only pagination over unbounded runtime/workflow data;
- request/record a service/read-model pagination dependency;
- for small bounded admin dictionaries, no paginator is acceptable.

## Screen Decisions

| screen family | decision | notes/dependencies |
|---|---|---|
| Admin tables | PrimeNG `p-table` default for dense comparable admin data. | Existing usage already follows this direction. Use existing `_p-table.scss`; no feature-local table skins. |
| Admin pagination | PrimeNG paginator when needed. | Wrapper exists but no production usage found. First implementation should smoke desktop/mobile and rows-per-page select. |
| Reports center | Custom report list cards. | Use report read path `limit`/`offset`; add PrimeNG paginator only if total/count appears. |
| Report detail | Custom detail/report content. | Use shared `game-report-content`; no table unless a specific dense subtable is DB-backed and readable. |
| Notifications archive | Custom notification list rows/cards. | Bell remains compact list. Full archive may use PrimeNG paginator when read model provides count/total. |
| Auction listings | Custom listing cards/list rows. | Shared item popover contract required for item details. No dense item table for player marketplace browsing by default. |
| PvP vicinity | Custom target cards/list rows. | Existing target candidate state has `limit`/`offset`; keep simple prev/next unless DB adds total count. |
| Armory | Custom item grid/cards. | Shared item popover and DB-backed item display contract are required before broad polish. |
| Direct trade pending offers | Custom offer cards/list rows. | Multiple nested items and participant/action state make table a poor default. |

## Dependency Rules

- Pagination source/page size should come from DB/read model/config where available.
- If a service exposes `limit`/`offset` but no total count, do not fake total pages.
- If a task needs sorting/filtering across server data, request a DB/RPC/read-model contract instead of client-only sorting a partial page.
- Status labels, report fields, item details and eligibility reasons remain DB/read-model sourced.
- CSS/classes do not enforce access; backend/domain/RPC remains authority.

## Local CSS And Wrapper Rules

- Do not add feature-local `.p-datatable`, `.p-paginator`, `.p-select` or `::ng-deep` skins.
- Use existing PrimeNG wrappers from `src/scss/vendors`.
- Table/list/card layout may use utilities within UI-CORE-13 class budget.
- Repeated custom list rows should become a shared row/card pattern, not another local card system.
- Do not copy prototype table/list CSS, `mb-*`, gradients, shadows or palette values.

## Required Report Addendum

Future tasks touching list/table/pagination decisions should include:

```md
Table/list/pagination:
- screen family:
- pattern chosen:
- table/paginator wrappers reused:
- custom list justified:
- pagination source:
- total/count available:
- unknown-total paging used:
- local custom paginator: yes/no + reason
- read-model/service blockers:
- item popover/report/detail dependency:
- responsive/accessibility smoke:
```

## Verification Notes

This task is MD-only. `npx tsc --noEmit`, focused specs and `npm run build` are not required unless a future implementation changes Angular/SCSS/runtime files.
