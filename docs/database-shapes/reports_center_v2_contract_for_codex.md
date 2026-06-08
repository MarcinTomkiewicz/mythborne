# Mythsworn Reports Center v2 - list, filter, preview and report shell contract

Status: DB/RPC contract after Reports Center v2 migration  
Audience: Reviewer and Codex  
Scope: Reports Center list/archive, filters, lightweight preview, summary/header state, bulk mark-read action, report shell context integration  
Out of scope: domain narrative copy for Exploration/PvP/Combat/Spy/Argonautics, reward wording fixes, item/reward renderer fixes, exploration combat producer gaps, notification archive

---

## 1. Core decision

Reports Center is not a domain-content renderer.

Reports Center owns:

- report archive/list state;
- search/filter/pagination state;
- row markers and lightweight list/right-preview payloads;
- summary/header counters;
- report read/remove/copy-link actions;
- thin report shell copy and display context.

Reports Center does not own:

- Exploration narrative;
- PvP outcome narrative;
- Combat log/participant rendering;
- Spy result rendering;
- Reward/item copy;
- Argonautics future domain narrative.

Frontend must not reconstruct report preview by calling full report detail, private domain RPCs, or direct-reading source tables. The Reports Center list and right-side preview must come from `get_reports_center_page_context(...)`.

---

## 2. RPC inventory

### 2.1 `get_reports_center_page_context(...)`

Signature:

```sql
get_reports_center_page_context(
  p_hero_id uuid,
  p_limit integer default 12,
  p_offset integer default 0,
  p_query text default null,
  p_report_area_key text default null,
  p_read_mode_key text default 'unread_first',
  p_time_range_key text default 'last_7_days'
) returns jsonb
```

Access:

- `authenticated`: execute allowed;
- `anon`: execute denied.

Purpose:

Canonical Reports Center v2 read model. Returns DB-filtered rows, real filter options, summary data, lightweight right-preview payloads, row marker/icon contract, capabilities, and mark-all-read metadata.

Frontend rules:

- Use this RPC for `/game/reports` list/archive page.
- Do not use `get_report_detail(...)` to populate right preview.
- Do not perform durable filtering/search/sort locally in Angular.
- Local UI may keep selected row state, but the row/preview payload comes from this RPC.
- Use returned `capabilities` to decide which controls to show. Do not render fake disabled filters.

### 2.2 `mark_all_reports_read(...)`

Signature:

```sql
mark_all_reports_read(
  p_hero_id uuid,
  p_query text default null,
  p_report_area_key text default null,
  p_read_mode_key text default 'unread_first',
  p_time_range_key text default 'last_7_days',
  p_request_id text default null
) returns jsonb
```

Access:

- `authenticated`: execute allowed;
- `anon`: execute denied.

Purpose:

Bulk read-state action for Reports Center v2. Marks unread reports matching the current Reports Center filters as read for the selected hero. Child combat reports hidden by the primary-list policy are not marked by this bulk action.

Frontend rules:

- Use this for the prototype-style “mark all read” action.
- After success, reload `get_reports_center_page_context(...)`.
- Treat returned counts as authoritative.
- Do not bulk-update read state locally except optimistic UI that is rolled back on error.

### 2.3 `get_reports_center_filtered_report_rows(...)`

Signature:

```sql
get_reports_center_filtered_report_rows(
  p_hero_id uuid,
  p_query text default null,
  p_report_area_key text default null,
  p_read_mode_key text default 'unread_first',
  p_time_range_key text default 'last_7_days',
  p_include_child_reports boolean default false
) returns table (...)
```

Access:

- `authenticated`: execute denied;
- `anon`: execute denied.

Purpose:

Internal helper used by Reports Center v2 read/action RPCs.

Frontend rules:

- Never call directly.

### 2.4 `build_reports_center_report_preview_json(...)`

Signature:

```sql
build_reports_center_report_preview_json(
  p_report_id uuid,
  p_hero_id uuid default null,
  p_access_role game_report_access_role default null,
  p_read_at timestamptz default null
) returns jsonb
```

Access:

- `authenticated`: execute denied;
- `anon`: execute denied.

Purpose:

Internal helper that builds lightweight list/right-preview JSON from report snapshot, shell/domain context, and safe report section helpers.

Frontend rules:

- Never call directly.
- Consume its result only through `get_reports_center_page_context(...).reports[].preview` or `.selectedPreview`.

### 2.5 Existing report detail RPCs

`get_report_detail(...)` and `get_public_report_detail(...)` remain the detail/full-report wrappers. They are not list/preview sources.

Frontend rules:

- Use `get_report_detail(...)` only after opening a full private report.
- Use `get_public_report_detail(...)` only for public report route.
- Do not use either RPC to populate Reports Center right preview.

---

## 3. `ReportsCenterPageContextV2`

Returned by `get_reports_center_page_context(...)`.

```ts
interface ReportsCenterPageContextV2 {
  contractVersion: 'reports_center_page_context_v2';

  reports: ReportsCenterListRowV2[];
  selectedPreview: ReportsCenterPreviewV1 | null;

  pagination: ReportsCenterPaginationV1;
  summary: ReportsCenterSummaryV1;
  counts: ReportsCenterCountsV1;
  filters: ReportsCenterFiltersV1;
  actions: ReportsCenterActionsV1;
  capabilities: ReportsCenterCapabilitiesV1;
}
```

Rules:

- `reports` is already DB-filtered, DB-sorted and paginated.
- `selectedPreview` is the preview for the first returned row, or `null` when the list is empty.
- Frontend may choose a different selected row client-side, but it must use that row’s own `preview` payload.
- `selectedPreview` and `reports[].preview` must not require full detail.

---

## 4. `ReportsCenterListRowV2`

```ts
interface ReportsCenterListRowV2 {
  contractVersion: 'reports_center_list_row_v2';

  reportId: string;
  publicToken: string;

  reportTypeKey: string;
  sourceEntityType: string;
  sourceEntityId: string;

  reportDomainKey: ReportDomainKey;
  contentKind: ReportContentKind;
  resultKind: string | null;

  source: ReportsCenterKeyLabel;
  eventType: ReportsCenterKeyLabel;

  title: string;
  summary: string | null;

  createdAt: string;
  reportDate: ReportsCenterReportDateV1;

  accessRole: 'owner' | 'participant' | 'viewer' | string;
  readAt: string | null;
  isUnread: boolean;

  marker: ReportsCenterMarkerV1;
  preview: ReportsCenterPreviewV1;
  visibilityPolicy: ReportsCenterVisibilityPolicyV1;
}
```

Field notes:

- `title`: DB-owned display title for the list row. It should come from shell/domain context, not legacy `game_reports.title` when a better shell title exists.
- `summary`: lightweight display summary for the row. It is not a full report narrative.
- `source`: high-level source/domain, for example `Eksploracja`, `PvP`, `Szpiegowanie`.
- `eventType`: concrete event kind, for example `Próba`, `Walka`, `Zasoby`, `Klątwa`, `Błogosławieństwo`, `Szpiegowanie`.
- `marker`: stable marker/icon source. Do not derive this from display labels.
- `preview`: durable lightweight preview for the right panel.

Frontend rules:

- Use `row.marker.markerKey`, `row.marker.markerLabel`, or `row.marker.iconKey` for marker/icon display.
- Do not derive markers like `PC/TR/ER` from `reportTypeLabel` or title.
- Do not use `reportTypeKey` as player-facing text.
- Do not call full report detail for row preview.

---

## 5. `ReportsCenterPreviewV1`

Located at:

- `ReportsCenterPageContextV2.selectedPreview`;
- `ReportsCenterListRowV2.preview`.

```ts
interface ReportsCenterPreviewV1 {
  contractVersion: 'reports_center_preview_v1';

  reportId: string;
  title: string;
  summary: string | null;

  source: ReportsCenterKeyLabel;
  eventType: ReportsCenterKeyLabel;
  reportDate: ReportsCenterReportDateV1;

  outcomeStatus: ReportsCenterOutcomeStatusV1;
  opponentTarget: ReportsCenterOpponentTargetV1;
  address: ReportsCenterAddressV1;
  combat: ReportsCenterCombatPreviewV1;
  reward: ReportsCenterRewardPreviewV1;
  access: ReportsCenterAccessPreviewV1;
  publicAccess: ReportsCenterPublicAccessV1;
  marker: ReportsCenterMarkerV1;
  diagnostics: ReportsCenterPreviewDiagnosticsV1;
}
```

### 5.1 `ReportsCenterKeyLabel`

```ts
interface ReportsCenterKeyLabel {
  key: string;
  label: string;
}
```

Used for:

- `source`;
- `eventType`.

### 5.2 `ReportsCenterReportDateV1`

```ts
interface ReportsCenterReportDateV1 {
  value: string;
  displayValue: string | null;
}
```

Rules:

- `value` is the ISO/timestamptz string.
- `displayValue` is DB-formatted display text.
- Frontend should not re-label this as “Utworzono” in new Reports Center; use copy label `Data raportu`.

### 5.3 `ReportsCenterOutcomeStatusV1`

```ts
interface ReportsCenterOutcomeStatusV1 {
  key: string | null;
  label: string | null;
  tone: 'positive' | 'negative' | 'neutral' | string;
}
```

Rules:

- This is a preview-level status only.
- Do not use it to render full domain result copy.
- Unknown `tone` must not break UI.

### 5.4 `ReportsCenterOpponentTargetV1`

```ts
interface ReportsCenterOpponentTargetV1 {
  name: string | null;
  roleKey: string | null;
}
```

Rules:

- Used where applicable, e.g. PvP opponent/target.
- May be null for exploration resource/buff/debuff reports.

### 5.5 `ReportsCenterAddressV1`

```ts
interface ReportsCenterAddressV1 {
  displayValue: string | null;
  districtCode: string | null;
  addressNumber: number | null;
}
```

Rules:

- Used where applicable, e.g. PvP target address.
- May be null for reports without address context.

### 5.6 `ReportsCenterCombatPreviewV1`

```ts
interface ReportsCenterCombatPreviewV1 {
  combatResultId: string | null;
  turnCount: number | null;
  attackCount: number;
}
```

Rules:

- This is preview metadata.
- Do not render full combat log from this.
- Use `get_report_detail(...)` only after opening the full report.

### 5.7 `ReportsCenterRewardPreviewV1`

```ts
interface ReportsCenterRewardPreviewV1 {
  summary: string | null;
  entryCount: number;
  resourcesSummary: string | null;
}
```

Rules:

- This is a compact preview summary.
- Full reward display belongs to domain/report detail renderer.
- Do not reconstruct item popovers or reward rows from this.

### 5.8 `ReportsCenterAccessPreviewV1`

```ts
interface ReportsCenterAccessPreviewV1 {
  visibility: 'private';
  accessRole: 'owner' | 'participant' | 'viewer' | string;
  isUnread: boolean;
  readAt: string | null;
}
```

### 5.9 `ReportsCenterPublicAccessV1`

```ts
interface ReportsCenterPublicAccessV1 {
  hasPublicToken: boolean;
  publicToken: string | null;
  publicPath: string | null;
  privatePath: string;
}
```

Rules:

- `privatePath` is the route to open the private report detail.
- `publicPath` is the route/link to copy or share when available.
- Current schema is expected to provide public tokens for existing reports, but UI must still handle `hasPublicToken=false` defensively.

### 5.10 `ReportsCenterMarkerV1`

```ts
interface ReportsCenterMarkerV1 {
  markerKey: string;
  markerLabel: string;
  iconKey: string;
  domainKey: ReportDomainKey | string;
  eventTypeKey: string;
}
```

Known current examples:

```ts
type ReportsCenterMarkerKey =
  | 'trial'
  | 'exploration'
  | 'combat'
  | 'spy'
  | 'trade'
  | 'auction'
  | 'siege'
  | 'report'
  | string;
```

Known marker labels:

- `PR` for Trial;
- `EX` for Exploration;
- `WA` for Combat/PvP combat;
- `SZ` for Spy;
- `HA` for Trade;
- `AU` for Auction;
- `OB` for Siege;
- `RP` fallback.

Rules:

- These labels are stable DB-owned marker labels for current UI.
- Later icon implementation may use `iconKey` instead of marker text.
- Do not compute marker text from Polish/English labels.

### 5.11 `ReportsCenterPreviewDiagnosticsV1`

```ts
interface ReportsCenterPreviewDiagnosticsV1 {
  previewWarnings: ReportsCenterPreviewWarning[];
  usesFullReportDetail: false;
  usesPrivateDomainRpc: false;
  legacyTitle: string | null;
  legacySummary: string | null;
}

interface ReportsCenterPreviewWarning {
  key: string;
  message?: string;
}
```

Rules:

- `usesFullReportDetail` must remain `false`.
- `usesPrivateDomainRpc` must remain `false`.
- `legacyTitle` and `legacySummary` are diagnostics; do not render them as player-facing list/preview copy.
- Warnings are diagnostic; do not expose raw SQL/internal messages to normal players unless explicitly approved.

---

## 6. `ReportsCenterPaginationV1`

```ts
interface ReportsCenterPaginationV1 {
  limit: number;
  offset: number;
  totalCount: number;
  rangeStart: number;
  rangeEnd: number;
  hasNextPage: boolean;
  displayLabel: string;
}
```

Rules:

- `displayLabel` is DB-owned display text.
- Frontend should not calculate display range labels locally except as a defensive non-player fallback if RPC fails entirely.

---

## 7. `ReportsCenterSummaryV1`

```ts
interface ReportsCenterSummaryV1 {
  totalReports: ReportsCenterSummaryMetricV1;
  unreadReports: ReportsCenterSummaryMetricV1;
  latestReport: ReportsCenterLatestReportV1;
  notifications: ReportsCenterNotificationsSummaryV1;
}

interface ReportsCenterSummaryMetricV1 {
  label: string;
  value: number;
}

interface ReportsCenterLatestReportV1 {
  label: string;
  fallbackLabel: string;
  reportId: string | null;
  title: string | null;
  createdAt: string | null;
  publicToken: string | null;
  openActionLabel: string;
  privatePath: string | null;
}

interface ReportsCenterNotificationsSummaryV1 {
  included: false;
  reasonKey: 'notifications_not_part_of_reports_center_v2' | string;
  label: string | null;
  latestNotification: null;
}
```

Rules:

- Reports Center v2 does not include Notifications archive.
- Do not create fake notification header rows.
- If prototype has four header rows, notifications must remain absent unless a future Notifications contract is added.

---

## 8. `ReportsCenterCountsV1`

```ts
interface ReportsCenterCountsV1 {
  totalReports: number;
  unreadReports: number;
  matchingReports: number;
  matchingUnreadReports: number;
}
```

Rules:

- `totalReports`: all primary reports visible to this hero across all time.
- `unreadReports`: all unread primary reports visible to this hero across all time.
- `matchingReports`: reports matching current filters.
- `matchingUnreadReports`: unread reports matching current filters, except when read-only mode makes the count intentionally zero.

---

## 9. `ReportsCenterFiltersV1`

```ts
interface ReportsCenterFiltersV1 {
  applied: ReportsCenterAppliedFiltersV1;
  options: ReportsCenterFilterOptionsV1;
}

interface ReportsCenterAppliedFiltersV1 {
  query: string | null;
  reportAreaKey: ReportsCenterEventTypeFilterKey;
  readModeKey: ReportsCenterReadModeKey;
  timeRangeKey: ReportsCenterTimeRangeKey;
}

interface ReportsCenterFilterOptionsV1 {
  eventTypes: ReportsCenterFilterOption[];
  readModes: ReportsCenterFilterOption[];
  timeRanges: ReportsCenterFilterOption[];
}

interface ReportsCenterFilterOption {
  key: string;
  label: string;
  enabled: boolean;
}
```

### 9.1 Event type filter keys

```ts
type ReportsCenterEventTypeFilterKey =
  | 'all'
  | 'exploration'
  | 'combat'
  | 'spy'
  | 'trade'
  | 'auction'
  | 'siege';
```

Current behavior:

- `all`: all primary reports.
- `exploration`: exploration domain reports.
- `combat`: combat-like reports, including PvP combat and exploration combat encounter.
- `spy`: spy reports.
- `trade`, `auction`, `siege`: supported by filter contract, but may be data-blocked if no reports exist yet.

### 9.2 Read mode keys

```ts
type ReportsCenterReadModeKey =
  | 'unread_first'
  | 'all'
  | 'unread_only'
  | 'read_only';
```

Current verified behavior:

- `all`: returns read and unread.
- `unread_first`: returns read and unread, sorted with unread before read.
- `unread_only`: returns unread only.
- `read_only`: returns read only.

### 9.3 Time range keys

```ts
type ReportsCenterTimeRangeKey =
  | 'last_7_days'
  | 'last_30_days'
  | 'all_time';
```

Current verified behavior:

- `last_7_days`: reports from last 7 days.
- `last_30_days`: reports from last 30 days.
- `all_time`: all reports.

### 9.4 Search query

`applied.query` is the accepted search text or `null`.

Current search coverage includes:

- report legacy title;
- report legacy summary;
- report shell title;
- report shell eyebrow;
- report shell source label;
- report shell event type label;
- report type key;
- report participant display names.

Frontend rules:

- Do not locally search/filter after RPC result.
- Debounce user input in UI as needed, then call RPC.
- Show/hide filter controls from `capabilities.filters`, not hardcoded assumptions.

---

## 10. `ReportsCenterActionsV1`

```ts
interface ReportsCenterActionsV1 {
  markAllRead: ReportsCenterMarkAllReadActionV1;
}

interface ReportsCenterMarkAllReadActionV1 {
  supported: boolean;
  enabled: boolean;
  matchingUnreadCount: number;
  label: string;
  disabledTooltip: string;
}
```

Frontend rules:

- If `supported=false`, hide the action.
- If `enabled=false`, show disabled action only if the UI needs it, with `disabledTooltip`.
- When clicked, call `mark_all_reports_read(...)` with current filters.

---

## 11. `MarkAllReportsReadResultV1`

Returned by `mark_all_reports_read(...)`.

```ts
interface MarkAllReportsReadResultV1 {
  contractVersion: 'mark_all_reports_read_result_v1';
  heroId: string;
  requestId: string | null;

  matchingUnreadCountBefore: number;
  markedCount: number;
  remainingUnreadCount: number;

  filters: {
    query: string | null;
    reportAreaKey: ReportsCenterEventTypeFilterKey | string;
    readModeKey: ReportsCenterReadModeKey | string;
    timeRangeKey: ReportsCenterTimeRangeKey | string;
  };
}
```

Verified rollback smoke example:

- `matchingUnreadCountBefore = 98`;
- `markedCount = 98`;
- `remainingUnreadCount = 47`;
- transaction rolled back.

Frontend rules:

- Reload Reports Center context after success.
- Do not assume all unread reports were marked; only matching current filters are included.

---

## 12. `ReportsCenterCapabilitiesV1`

```ts
interface ReportsCenterCapabilitiesV1 {
  filters: {
    search: boolean;
    eventType: boolean;
    readMode: boolean;
    timeRange: boolean;
  };

  preview: {
    rightPreview: boolean;
    usesFullReportDetail: false;
    requiresPrivateDomainRpc: false;
  };

  markAllRead: {
    supported: boolean;
  };

  primaryListPolicy: {
    hidesChildCombatReports: boolean;
  };

  notifications: {
    included: false;
    reasonKey: 'notifications_not_part_of_reports_center_v2' | string;
  };

  unsupportedFilters: unknown[];
}
```

Current verified values:

- `filters.search = true`;
- `filters.eventType = true`;
- `filters.readMode = true`;
- `filters.timeRange = true`;
- `preview.rightPreview = true`;
- `preview.usesFullReportDetail = false`;
- `preview.requiresPrivateDomainRpc = false`;
- `markAllRead.supported = true`;
- `primaryListPolicy.hidesChildCombatReports = true`;
- `notifications.included = false`;
- `unsupportedFilters = []`.

Frontend rules:

- No fake disabled controls for these filters.
- No Notifications archive in Reports Center v2.

---

## 13. Sorting and primary list policy

Current DB order for paged rows:

1. When `readModeKey='unread_first'`, unread rows first.
2. Then `createdAt desc`.
3. Then `reportId desc`.

Primary list policy:

- Child combat reports with a parent contextual report are hidden by default.
- `visibilityPolicy.isPrimaryListEntry=true` for rows returned by `get_reports_center_page_context(...)`.
- Hidden child combat reports are also excluded from bulk mark-all-read when using the default list policy.

Frontend rules:

- Do not reorder rows locally except for pure visual selected-state handling.
- Do not resurrect hidden child combat reports as normal primary entries.

---

## 14. Copy contract used by Reports Center v2

`get_report_page_copy()` returns `report_page_copy_v2` and includes both new and legacy keys.

New UI should use:

- `reportsCenter.header.*`
- `reportsCenter.summary.*`
- `reportsCenter.filters.*`
- `reportsCenter.filterOptions.*`
- `reportsCenter.list.*`
- `reportsCenter.preview.*`
- `reportsCenter.actions.markAllRead.*`
- `reportShell.*`

Legacy keys retained for compatibility:

- `detail.*`
- `publicReport.*`
- `labels.*`
- `pagination.*`

Frontend rules:

- New Reports Center v2 should not use legacy `detail.sections` to render generic full-report sections.
- New report shell should not show read state as important meta.
- Reports Center copy must remain separate from domain narrative/result copy.

---

## 15. Verified smoke results

### 15.1 Read mode filters

Observed counts:

| read mode | matching | unread | read |
|---|---:|---:|---:|
| `all` | 147 | 145 | 2 |
| `unread_first` | 147 | 145 | 2 |
| `unread_only` | 145 | 145 | 0 |
| `read_only` | 2 | 0 | 2 |

Result: OK.

### 15.2 Event/domain filters

Observed counts:

| area | matching | observed domains | observed content kinds |
|---|---:|---|---|
| `all` | 147 | exploration, pvp, spy | exploration/combat/pvp/spy kinds |
| `exploration` | 136 | exploration | exploration_step, exploration_trial, exploration_combat_encounter |
| `combat` | 38 | exploration, pvp | exploration_combat_encounter, pvp_combat |
| `spy` | 1 | spy | pvp_spy |

Result: OK.

### 15.3 Time range and search

Observed counts:

| scenario | count | status |
|---|---:|---|
| `all_time` | 147 | OK |
| `last_30_days` | 147 | OK |
| `last_7_days` | 100 | OK |
| search by participant `Walford` | 11 | OK |

Result: OK.

### 15.4 Lightweight preview fields

First five rows verified:

- have `reports_center_preview_v1`;
- have marker key and marker label;
- have title;
- have summary;
- have source;
- have event type;
- have report date;
- have private path;
- have `usesFullReportDetail=false`;
- have `usesPrivateDomainRpc=false`.

Result: OK.

### 15.5 Mark all read rollback smoke

Observed result:

- `matchingUnreadCountBefore = 98`;
- `markedCount = 98`;
- `remainingUnreadCount = 47`;
- transaction rolled back.

Result: OK.

---

## 16. Data-blocked / not yet represented branches

The following branches are contract-supported but not proven by current representative data:

- Trade reports;
- Auction reports;
- Siege reports;
- rows without public token, if schema ever permits them;
- future Argonautics reports;
- future notification archive integration.

Reviewer/Codex policy:

- Mark these as `data-blocked` in smoke/reporting if no representative rows exist.
- Do not remove fields because current data lacks a branch.
- Do not invent local Angular fallback labels for future branches.
- Use `capabilities.notifications.included=false` until a real Notifications contract exists.

---

## 17. Known copy/domain debt outside this contract

The Reports Center v2 contract is functioning, but some preview text still reveals domain copy debt.

Observed examples:

- `Minor materials find`;
- `Minor resource find`;
- `Minor blessing`;
- reward summaries like `Bohater otrzymał 3 elementów nagrody.`.

These are not Reports Center filter/preview contract bugs. They belong to Exploration/Encounter/Reward domain copy/read-model cleanup.

Frontend rules:

- Do not translate these locally.
- Do not add Angular fallback copy.
- Report as domain copy follow-up.

---

## 18. Codex implementation directives

Codex must:

1. Use `get_reports_center_page_context(...)` as the single Reports Center v2 page bootstrap.
2. Use `payload.reports` for list rows.
3. Use `payload.selectedPreview` for initial right preview.
4. Use `row.preview` when the selected row changes.
5. Use `payload.filters.options` for controls.
6. Use `payload.filters.applied` as source of truth for active state.
7. Use `payload.capabilities` to show/hide controls.
8. Use `mark_all_reports_read(...)` for bulk read action.
9. Reload page context after mutations.
10. Use `row.marker` for markers/icons.
11. Use `preview.publicAccess.publicPath` for copy-link target.
12. Use `preview.publicAccess.privatePath` / row report id for opening private report.
13. Treat `diagnostics` as non-player-facing unless explicitly approved.

Codex must not:

1. Call `get_report_detail(...)` for the right preview.
2. Call private domain RPCs to build the preview.
3. Direct-read report/source tables.
4. Locally filter/search/sort after DB returns rows, except local selected-row state.
5. Derive marker labels from display copy.
6. Render Notifications archive inside Reports Center v2.
7. Translate domain debt strings locally.
8. Show fake disabled controls when `capabilities` says feature is supported.
9. Reintroduce generic full-report sections in Reports Center preview.

---

## 19. Generated types note

After this migration, Supabase generated database types should be regenerated before Codex consumes new RPC names.

However, all new public RPCs return `jsonb`, so generated types will not describe the recursive JSON payloads. This document is the authoritative shape contract for Codex implementation and review.
