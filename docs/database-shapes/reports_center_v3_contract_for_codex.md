# Mythsworn Reports Center v3 - root page context, event type contract and copy handoff

Status: DB/RPC contract after Reports Center page-context v3 and locale-backed Reports copy bundle work  
Audience: Codex, Reviewer, Migrator  
Scope: `/game/reports` archive/list, filters, lightweight preview, row markers, report shell integration, event type machine keys, copy lookup  
Out of scope: source-domain result narrative/reward/effect copy, Combat renderer internals, Exploration/PvP/Spy/Argonautics domain renderer implementation

---

## 1. Core decision

Reports Center is a **page-context read model**, not a domain-content renderer.

Reports Center owns:

- report archive/list state;
- server-side search/filter/pagination state;
- lightweight row and right-preview payloads;
- row marker/icon machine contract;
- summary/header counters;
- report read/remove/copy-link action state;
- thin report shell copy integration.

Reports Center does not own:

- Exploration narrative;
- Trial/Encounter result narrative;
- Combat log/participant rendering;
- PvP outcome narrative;
- Spy result rendering;
- Reward/effect/item wording;
- future Argonautics domain narrative.

Frontend must not reconstruct Reports Center preview by calling full report detail, private domain RPCs, or by direct-reading source tables.

---

## 2. RPC inventory

### 2.1 `get_reports_center_page_context(...)`

Signature:

```sql
get_reports_center_page_context(
  p_hero_id uuid,
  p_limit integer default 25,
  p_offset integer default 0,
  p_query text default null,
  p_report_area_key text default null,
  p_read_mode_key text default null,
  p_time_range_key text default null
) returns jsonb
```

Access:

- `authenticated`: execute allowed;
- `anon`: execute denied.

Current contract version:

```ts
contractVersion: 'reports_center_page_context_v3'
```

Purpose:

Canonical Reports Center root page context. Returns DB-filtered rows, real filter options, summary data, lightweight right-preview payloads, marker/icon contract, capabilities and action metadata.

V3 event type cleanup:

- canonical event type is only `reports[].eventType.key`;
- duplicate `reports[].preview.eventType` is removed;
- duplicate `reports[].marker.eventTypeKey` is removed;
- display copy is resolved through `get_report_page_copy(locale).reportsCenter.eventTypes.byKey[eventType.key]`.

### 2.2 `get_report_page_copy(...)`

Signature:

```sql
get_report_page_copy(
  p_locale text default 'pl'
) returns jsonb
```

Access:

- `authenticated`: execute allowed;
- `anon`: execute allowed.

Current contract version:

```ts
contractVersion: 'report_page_copy_v3'
```

Purpose:

Locale-backed copy bundle for Reports Center and report shell. It is stored in `report_page_copy_bundles` and read by this RPC.

Locale behavior:

- `get_report_page_copy('pl')` returns the Polish bundle;
- `get_report_page_copy('en')` returns the English bundle;
- unsupported locales fall back to English;
- `requestedLocale` and resolved `locale` are returned in the payload.

### 2.3 `mark_all_reports_read(...)`

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

Bulk read-state action for Reports Center. Marks unread reports matching current Reports Center filters as read for the selected hero. Child combat reports hidden by primary-list policy are not marked by this bulk action.

### 2.4 Internal helpers

These are not frontend contracts:

- `get_reports_center_filtered_report_rows(...)`;
- `build_reports_center_report_preview_json(...)`;
- any report section builder helper.

Frontend must never call internal helpers directly.

---

## 3. `ReportsCenterPageContextV3`

```ts
interface ReportsCenterPageContextV3 {
  contractVersion: 'reports_center_page_context_v3';

  eventTypeContract: ReportsCenterEventTypeContractV1;

  reports: ReportsCenterListRowV3[];
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

- `reports` is DB-filtered, DB-sorted and paginated.
- `selectedPreview` is the preview for the first returned row or `null` when the list is empty.
- Frontend may keep local selected-row state, but must use the selected row's own `preview` payload.
- Frontend must not call full detail to populate the right preview.

---

## 4. Event type contract

Located at:

```ts
payload.eventTypeContract
```

```ts
interface ReportsCenterEventTypeContractV1 {
  canonicalPath: 'reports[].eventType.key';
  removedDuplicatePaths: [
    'reports[].preview.eventType',
    'reports[].marker.eventTypeKey'
  ];
  copyPath: 'get_report_page_copy(locale).reportsCenter.eventTypes.byKey[eventType.key]';
  fallbackPolicy: string;
  policy: string;
}
```

Current verified values:

```json
{
  "canonicalPath": "reports[].eventType.key",
  "removedDuplicatePaths": [
    "reports[].preview.eventType",
    "reports[].marker.eventTypeKey"
  ],
  "copyPath": "get_report_page_copy(locale).reportsCenter.eventTypes.byKey[eventType.key]"
}
```

Frontend rule:

```ts
const eventTypeKey = row.eventType.key;
const eventTypeCopy = reportPageCopy.reportsCenter.eventTypes.byKey[eventTypeKey];
```

Use:

```ts
eventTypeCopy.label;
eventTypeCopy.tone;
eventTypeCopy.iconKey;
```

Do not infer event subtype from:

- `title`;
- `summary`;
- `contentKind`;
- `resultKind`;
- `preview.outcomeStatus.label`;
- report type labels;
- source labels;
- old marker text.

`reports[].eventType.label`, `tone`, and `iconKey` are DB fallback only when the locale copy bundle lacks `eventType.key`. Current smoke confirms no missing copy keys for representative data.

---

## 5. `ReportsCenterListRowV3`

```ts
interface ReportsCenterListRowV3 {
  contractVersion: 'reports_center_list_row_v2' | string;

  reportId: string;
  publicToken: string | null;

  reportTypeKey: string;
  sourceEntityType: string;
  sourceEntityId: string;

  reportDomainKey: ReportDomainKey;
  contentKind: ReportContentKind;
  resultKind: string | null;

  source: ReportsCenterKeyLabel;
  eventType: ReportsCenterEventTypeMachine;

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

### 5.1 `ReportsCenterEventTypeMachine`

```ts
interface ReportsCenterEventTypeMachine {
  key: string;

  // Fallback only. Prefer get_report_page_copy(locale).reportsCenter.eventTypes.byKey[key].
  label?: string | null;
  tone?: string | null;
  iconKey?: string | null;
}
```

Current representative keys from smoke:

```ts
type CurrentReportsCenterEventTypeKey =
  | 'buff'
  | 'combat'
  | 'debuff'
  | 'resource'
  | 'trial';
```

The copy bundle also reserves/fills future keys:

```ts
type ReportsCenterEventTypeCopyKey =
  | 'exploration'
  | 'trial'
  | 'trial_result'
  | 'trial_manifested'
  | 'trial_not_manifested'
  | 'trial_resolved_success'
  | 'trial_resolved_failure'
  | 'encounter'
  | 'encounter_result'
  | 'encounter_combat'
  | 'encounter_resource'
  | 'encounter_resources'
  | 'encounter_buff'
  | 'encounter_debuff'
  | 'combat'
  | 'combat_result'
  | 'pvp_combat'
  | 'pvp_spy'
  | 'siege'
  | 'resource'
  | 'effect'
  | 'trade'
  | 'auction'
  | 'system'
  | 'other'
  | 'buff'
  | 'debuff';
```

---

## 6. `ReportsCenterPreviewV1`

Located at:

- `ReportsCenterPageContextV3.selectedPreview`;
- `ReportsCenterListRowV3.preview`.

```ts
interface ReportsCenterPreviewV1 {
  contractVersion: 'reports_center_preview_v1';

  reportId: string;
  title: string;
  summary: string | null;

  source: ReportsCenterKeyLabel;

  // Removed in v3. Use row.eventType.key + copy bundle instead.
  eventType?: never;

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

Rules:

- `preview` is compact preview data only.
- Do not use it to render full domain content.
- Do not call full detail to build it.
- Do not expect `preview.eventType` in v3.

---

## 7. Marker contract

```ts
interface ReportsCenterMarkerV1 {
  markerKey: string;
  markerLabel: string;
  iconKey: string;
  domainKey: ReportDomainKey | string;

  // Removed in v3. Use row.eventType.key instead.
  eventTypeKey?: never;
}
```

Rules:

- `marker.markerLabel` is a stable DB-owned visual marker, not source for event subtype.
- `marker.iconKey` can drive marker/icon display where appropriate.
- Do not compute marker text from display copy.
- Do not expect `marker.eventTypeKey` in v3.

---

## 8. Shared supporting shapes

```ts
interface ReportsCenterKeyLabel {
  key: string;
  label: string;
}

interface ReportsCenterReportDateV1 {
  value: string;
  displayValue: string | null;
}

interface ReportsCenterOutcomeStatusV1 {
  key: string | null;
  label: string | null;
  tone: 'positive' | 'negative' | 'neutral' | string;
}

interface ReportsCenterOpponentTargetV1 {
  name: string | null;
  roleKey: string | null;
}

interface ReportsCenterAddressV1 {
  displayValue: string | null;
  districtCode: string | null;
  addressNumber: number | null;
}

interface ReportsCenterCombatPreviewV1 {
  combatResultId: string | null;
  turnCount: number | null;
  attackCount: number;
}

interface ReportsCenterRewardPreviewV1 {
  summary: string | null;
  entryCount: number;
  resourcesSummary: string | null;
}

interface ReportsCenterAccessPreviewV1 {
  visibility: 'private';
  accessRole: 'owner' | 'participant' | 'viewer' | string;
  isUnread: boolean;
  readAt: string | null;
}

interface ReportsCenterPublicAccessV1 {
  hasPublicToken: boolean;
  publicToken: string | null;
  publicPath: string | null;
  privatePath: string;
}
```

---

## 9. Pagination, summary, counts, filters and capabilities

These keep the v2 shape.

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

interface ReportsCenterCountsV1 {
  totalReports: number;
  unreadReports: number;
  matchingReports: number;
  matchingUnreadReports: number;
}

interface ReportsCenterFiltersV1 {
  applied: ReportsCenterAppliedFiltersV1;
  options: ReportsCenterFilterOptionsV1;
}

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

Frontend rules:

- Use `filters.options` to render filter controls.
- Use `filters.applied` for active state.
- Use `capabilities` to show/hide controls.
- Do not locally filter/search/sort after RPC returns rows, except local selected-row state.

---

## 10. Copy usage

Use:

```ts
const copy = get_report_page_copy(locale);
```

Then:

```ts
copy.reportsCenter.header;
copy.reportsCenter.summary;
copy.reportsCenter.filters;
copy.reportsCenter.filterOptions;
copy.reportsCenter.list;
copy.reportsCenter.preview;
copy.reportsCenter.actions;
copy.reportsCenter.eventTypes.byKey[row.eventType.key];
copy.reportShell;
```

Do not hardcode local labels for:

- event type chips;
- select-all/clear-selection/bulk action labels;
- row checkbox aria labels;
- open/copy/delete/return shell actions.

---

## 11. Sorting and primary list policy

DB order:

1. If `readModeKey='unread_first'`, unread rows first.
2. Then `createdAt desc`.
3. Then `reportId desc`.

Primary list policy:

- child combat reports with a parent contextual report are hidden by default;
- hidden child combat reports are excluded from bulk mark-all-read when using default list policy;
- frontend must not resurrect hidden child combat reports as primary entries.

---

## 12. Verified smoke results

Latest smoke confirmed:

- `get_reports_center_page_context(...)` returns `reports_center_page_context_v3`;
- function grants: `authenticated=true`, `anon=false`;
- `reportCount=50` for representative Vlad smoke;
- `badShapeCount=0`;
- no `preview.eventType` remains;
- no `marker.eventTypeKey` remains;
- distinct event type keys in representative data: `buff`, `combat`, `debuff`, `resource`, `trial`;
- `missingCopyKeyCount=0` against `get_report_page_copy('pl')`.

Current sample rows still include fallback `eventType.label/tone/iconKey` in the page context, but display copy should prefer `get_report_page_copy(locale).reportsCenter.eventTypes.byKey[key]`.

---

## 13. Data-blocked / not yet represented branches

The contract supports branches not always present in current data:

- Trade reports;
- Auction reports;
- Siege reports;
- PvP spy beyond the single current row;
- future Argonautics reports;
- rows without public token if schema ever permits them;
- future Notifications archive integration.

Policy:

- mark absent branches as `data-blocked` in smoke/reporting;
- do not remove fields because current data lacks a branch;
- do not add Angular fallback labels for future branches;
- use `capabilities.notifications.included=false` until a real Notifications contract exists.

---

## 14. Known copy/domain debt outside Reports Center

Reports Center copy must not patch domain-owned narratives.

Examples that belong outside Reports Center copy:

- Exploration result narrative;
- reward/effect wording;
- Combat attack text;
- PvP result wording;
- Spy result wording;
- stored historical `game_reports.title` such as `Combat report: initiator victory` until producer/backfill cleanup is scoped.

Frontend must not locally translate such debt.

---

## 15. Codex implementation directives

Codex must:

1. Use `get_reports_center_page_context(...)` as the single Reports Center page bootstrap.
2. Use `payload.reports` for list rows.
3. Use `payload.selectedPreview` for initial right preview.
4. Use `row.preview` when selected row changes.
5. Use `payload.filters.options` for controls.
6. Use `payload.filters.applied` as active filter state.
7. Use `payload.capabilities` to show/hide controls.
8. Use `mark_all_reports_read(...)` for bulk read action.
9. Reload page context after mutations.
10. Use `row.marker` for marker/icon display.
11. Use `row.eventType.key` as the only event type machine key.
12. Use `get_report_page_copy(locale).reportsCenter.eventTypes.byKey[row.eventType.key]` for event type label/tone/icon.
13. Use `preview.publicAccess.publicPath` for copy-link target.
14. Use `preview.publicAccess.privatePath` or row report id for opening private report.
15. Treat diagnostics as non-player-facing unless explicitly approved.

Codex must not:

1. Call `get_report_detail(...)` for right preview.
2. Call private domain RPCs to build preview.
3. Direct-read report/source tables.
4. Locally filter/search/sort after DB returns rows, except selected-row state.
5. Derive event subtype from title, summary, contentKind, resultKind, marker label, report type label, or preview outcome label.
6. Expect `preview.eventType` or `marker.eventTypeKey`.
7. Render Notifications archive inside Reports Center v3.
8. Translate domain debt strings locally.
9. Show fake disabled controls when `capabilities` says the feature is supported.
10. Reintroduce generic full-report sections in Reports Center preview.

---

## 16. Generated types note

`get_reports_center_page_context(...)` and `get_report_page_copy(...)` return `jsonb`. Generated Supabase types will not describe the recursive JSON payload. This document is the authoritative shape contract for frontend implementation and review.
