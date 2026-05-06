# Item Popover Shared Component Contract

Status: UI-CORE-6 draft for review  
Scope: documentation only; no Angular, SCSS, DB/RPC or generated-type changes

This document defines the production contract for one reusable item popover/detail pattern across Armory, Auction House, Direct Trade, Reports, rewards and loot/result screens. The archived item popover prototype is visual reference only; production must use current Angular read models, DB/RPC contracts, PrimeNG wrappers and shared/global surface patterns.

Use with:

- `docs/ui-ux/mythsworn-style-contract.md`;
- `docs/ui-ux/prototype-production-mapping.md`;
- `docs/ui-ux/primeng-vendor-wrapper-lookup.md`;
- `docs/ui-ux/shared-surface-patterns.md`;
- `docs/ui-ux/icon-placeholder-mapping.md`.

## Source Order

Production item popovers must resolve data from this order:

1. Durable DB/read model for the current context.
2. Historical snapshot read model for reports, completed trades and completed auctions.
3. Safe partial item label/read model if detailed item data is unavailable.
4. Explicit missing-data diagnostic.

Do not fill gaps by calculating item bonuses, requirements, equipment legality, trade value or outcome state in Angular.

## Existing Data Sources

| source | current fields useful for popover | status | notes |
|---|---|---|---|
| `ItemReadModel` / `items` | id, owner hero id, name, description, status, base/quality/prefix/suffix ids, armory shelf, drachma value, lifecycle timestamps, metadata | production partial | Does not include resolved base label, slot/kind label, native stats, bonuses or requirements. |
| `get_hero_equipment_runtime_slots(p_hero_id)` | equipped item display, base/quality/prefix/suffix labels, slot/group/area, runtime usability | DB contract exists | Canonical owner-safe equipment slot read source. Use when implementing equipped item popovers. |
| `get_hero_equipment_runtime_bonus_rows(p_hero_id)` | effective equipment bonus rows by item, slot, scope, target, raw/effective value, quality multiplier | DB contract exists | Good source for equipped/current-loadout bonus rows. Not a general item-detail popover for unequipped/trade/history items by itself. |
| `get_item_effective_requirements(p_item_id)` | effective item requirements from base/prefix/suffix/quality aggregation | DB contract exists | Use for requirement display when current item id is readable. |
| `check_hero_meets_item_requirements(p_hero_id, p_item_id)` | meets flag and failure JSON | DB contract exists | Use for owner/current-hero equip warning state; do not use for public/historical report viewers unless DB exposes that as intended. |
| `DirectTradeOfferItemReadModel` | live offer item id/name/status/drachma value | production partial | Good for safe item label, not full bonuses/requirements. |
| `DirectTradeTransactionItemReadModel` | completed trade item snapshots: name, drachma value, generation base/quality/prefix/suffix labels, value bucket, snapshot JSON | production historical partial | Use snapshot data for history; do not refetch mutable current item state as the historical truth. |
| `PlayerAuctionItemLabel` | listing item id/name/status/drachma value | production partial | Active listing label only; not full item detail. |
| `PlayerAuctionTransactionReadModel.items` | auction sale item snapshots through trade transaction item model | production historical partial | Same snapshot rules as direct trade history. |
| `GameReportItemReference` / `PublicGameReportItemReference` | display name, quality key, safe display details, source kind | production safe partial | Reports deliberately expose safe item display details, not full private equipment by default. |
| `ExplorationChallengeRewardReadModel.items` | durable generated reward item rows via `ItemReadModel` | production partial | Shows reward item identity/value/quality key when item rows are readable; detailed bonuses/requirements need more read model support. |

## Target Shared View Model

Future implementation should introduce a shared UI/domain view model rather than letting every feature shape popover content independently.

Recommended shape:

| field | purpose | source rule |
|---|---|---|
| `itemId` | stable item identity if known | DB/read model or snapshot; may be null for public/safe references. |
| `name` | primary title | DB/read model or snapshot. |
| `description` | optional body copy | DB/read model only; omit if unavailable. |
| `statusLabel` / `statusKey` | current or historical status | DB/read model/snapshot. |
| `qualityLabel` / `qualityKey` | quality/tier row | DB/read model/snapshot; label preferred over key. |
| `kindLabel` / `slotLabel` | item kind and equip slot | DB/read model/snapshot; do not derive from base id in UI. |
| `iconClass` | right-side icon box | `icon-placeholder-mapping.md`; report missing item-kind icon keys. |
| `nativeStats` | item-native stats such as damage/defense where DB exposes them | DB/read model only. |
| `bonusRows` | resolved bonuses | DB/RPC bonus rows or trusted snapshot, not local reconstruction. |
| `requirementRows` | effective requirements | `get_item_effective_requirements(...)` or trusted snapshot. |
| `requirementState` | met/not met/not applicable | `check_hero_meets_item_requirements(...)` for current viewer context when allowed. |
| `drachmaValue` | vendor/system item value | DB/read model/snapshot; never Character Points market valuation. |
| `snapshotContext` | report/trade/history explanation | required for historical sources so users know values are snapshots. |
| `dataGaps` | missing sections | explicit diagnostics for absent bonuses/requirements/stats/read model. |

## Display Sections

The shared popover should render sections in this order when data exists:

1. Header: item name, quality/tier, kind/slot/status, right-side icon box.
2. Value: drachma/vendor/system value only.
3. Native stats: DB-backed item-native stats.
4. Bonuses: DB-backed effective or snapshot bonus rows.
5. Requirements: DB-backed effective requirements and current viewer met/not-met state where available.
6. Context: current item, trade snapshot, auction snapshot, reward drop or report-safe reference.
7. Diagnostics: visible missing-data notes for expected sections that are unavailable.

Empty sections should be omitted unless the absence is actionable or diagnostic. If `reward_grant_id` exists but reward item/entry detail is missing, keep the existing reward diagnostics pattern instead of inventing local reward content.

## Nested Row Contracts

Future implementations should use these nested shapes instead of creating local row contracts per feature.

`nativeStats` row:

| field | rule |
|---|---|
| `key` | Stable stat key from DB/read model or trusted snapshot. |
| `label` | Display label from DB/read model or trusted snapshot. |
| `displayValue` | Already formatted display value or value formatted by shared mapper from DB-provided value/unit. |
| `rawValue` | Optional DB/read-model raw value. |
| `effectiveValue` | Optional DB/read-model effective value. |
| `unit` | Optional DB/read-model unit. |
| `isBoosted` | True only when DB/read model or trusted snapshot proves effective value differs from raw/base value. |
| `boostSourceLabel` | Optional DB/read-model/snapshot source label. |

Source rule: DB/read model or trusted snapshot only; no UI calculation.

`bonusRows` row:

| field | rule |
|---|---|
| `key` | Stable bonus/template key from DB/RPC row or trusted snapshot. |
| `label` | DB-backed or snapshot label. |
| `scopeLabel` | Optional DB-backed/snapshot scope label. |
| `targetLabel` | Optional DB-backed/snapshot target label. |
| `displayValue` | Display value from DB/RPC/snapshot or shared mapper formatting DB-provided values. |
| `rawValue` | Optional raw DB/RPC/snapshot value. |
| `effectiveValue` | Optional DB/RPC/snapshot effective value. |
| `unit` | Optional DB/RPC/snapshot unit. |
| `sourceLabel` | Optional item layer, slot, source or snapshot label. |

Source rule: DB/RPC bonus rows or trusted snapshot only.

`requirementRows` row:

| field | rule |
|---|---|
| `key` | Stable requirement/stat key. |
| `label` | DB-backed or snapshot label. |
| `requiredValue` | Required value from DB/RPC/snapshot. |
| `currentValue` | Optional current viewer value from DB/RPC when allowed. |
| `isMet` | Optional/null met state from DB/RPC/snapshot. |
| `failureReason` | Optional DB/RPC failure reason or safe snapshot detail. |

Source rule: `get_item_effective_requirements(...)`, `check_hero_meets_item_requirements(...)`, or trusted snapshot only.

`requirementState`:

| field | rule |
|---|---|
| `kind` | `'met' | 'not_met' | 'not_applicable' | 'unknown'`. |
| `label` | Player-facing state label. |
| `details` | Optional DB/RPC/snapshot details. |

Source rule: current viewer context only when DB/RPC allows it; no public/historical private checks.

`snapshotContext`:

| field | rule |
|---|---|
| `kind` | `'current' | 'trade_snapshot' | 'auction_snapshot' | 'report_reference' | 'reward_item' | 'safe_partial'`. |
| `label` | Short context label. |
| `capturedAt` | Optional snapshot timestamp. |
| `sourceLabel` | Optional report/trade/reward/source label. |

Source rule: required for historical/snapshot sources.

`dataGaps` row:

| field | rule |
|---|---|
| `section` | Missing section key, such as `nativeStats`, `bonusRows`, `requirementRows`, `icon`, `snapshot`. |
| `label` | Short visible diagnostic label. |
| `details` | Specific missing DB/read-model/RLS/snapshot detail. |
| `severity` | `'info' | 'warning'`. |

Source rule: used instead of invented local content.

## Visual And Interaction Contract

Use PrimeNG popover as the preferred shell:

- `PopoverModule` / PrimeNG popover trigger where implemented;
- `_p-popover.scss` for overlay shell styling;
- `_tooltip.scss` only for short supplemental text, not full item details;
- shared/global surface, badge, chip and detail-row patterns from UI-CORE-4.

Popover behavior must support:

- hover where pointer hover is available;
- focus/keyboard opening for item links/buttons;
- click/tap opening on touch devices;
- escape/outside click close through the PrimeNG overlay behavior;
- accessible trigger text or `aria-label`;
- a popover title connected through `aria-labelledby` or equivalent when the implementation supports it.

Tooltip-only item details are blocked. A tooltip may name a compact icon or explain a short status, but full item content belongs in the shared popover/detail pattern.

## Data Rules

Allowed:

- display drachma value as vendor/system item value;
- display Character Points only as auction/trade price outside the inherent item value row;
- use historical snapshot fields for completed trades, auctions and reports;
- show `Not equippable` / requirement warnings only from DB/RPC requirement state;
- show boosted values only when a DB/read model marks or proves the effective value differs from raw/base value.

Blocked:

- CP value as inherent item value;
- local item stat calculators;
- local requirement aggregation;
- local quality multiplier calculations;
- local bonus reconstruction from base/prefix/suffix ids;
- local tooltip CSS per feature;
- copied prototype `mb-*`, CSS, gradients, palette values or mock item copy;
- exposing private player equipment/loadout details in public reports unless the report read model deliberately returns them.

## Current Gaps

| gap | impact | required follow-up |
|---|---|---|
| No shared item popover component exists. | Features currently show compact item labels/details independently. | Implement shared component when first runtime screen needs it. |
| No single item-detail read model combines base/quality/prefix/suffix labels, native stats, bonuses, requirements and viewer requirement state for arbitrary item ids. | Full popover cannot be reliably complete in Armory/Auction/Rewards without composing multiple DB/RPC reads. | Add a domain service or DB-backed read model contract before full production item popover. |
| `ItemReadModel` is partial. | Reward/armory item display can show name/status/value/quality key but not full stats/bonuses/requirements. | Extend through service/read model, not component-local enrichment. |
| Active auction/listing item labels are partial. | Auction list can show safe label/value, not full popover content. | Add listing item detail read path or show partial popover with diagnostic. |
| Reports intentionally expose safe item references. | Public/private report item popovers may be partial by design. | Use report item references unless a report detail variant explicitly exposes more. |
| Item-kind icon keys are missing. | Right-side icon box may need generic/custom registry fallback. | Track in UI-CORE-10; do not use emoji/prototype initials as final icons. |

## Implementation Boundary

Because UI-CORE-6 already identifies multiple consumers, the first production implementation should default to a shared component and display model. Domain shaping should live in `core/domain/...` and `core/utils/...` or a narrow feature adapter; the component should receive a display-ready view model.

Do not create feature-local `auction-item-popover`, `trade-item-tooltip`, `reward-item-card-tooltip` duplicates unless review explicitly scopes a temporary exception, marks it temporary, and records why the shared contract could not be used yet.

## Required Report Addendum

Any UI task implementing or consuming item popovers must report:

- prototype source:
- reused popover/vendor:
- item read model source:
- snapshot source, if any:
- requirement source:
- bonus/stat source:
- icon classes reused:
- new shared component added:
- local SCSS added:
- copied from prototype: no:
- DB/read-model blockers:
- accessibility/responsive smoke:
