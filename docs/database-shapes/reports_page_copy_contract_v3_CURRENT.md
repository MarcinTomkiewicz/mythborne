# Mythsworn Reports Page Copy Contract v3

Status: locale-backed DB copy contract for Reports Center and report shell  
Audience: Codex, Reviewer, Migrator  
Scope: `get_report_page_copy(p_locale text default 'pl')`, `report_page_copy_bundles`, Reports Center shell/action/event-type copy, report detail/public shell copy  
Out of scope: source-domain result narratives, reward/effect text, combat log text, PvP/Spy/Exploration renderer copy

---

## 1. Core decision

Reports copy is DB-owned and locale-backed.

Current RPC:

```sql
get_report_page_copy(
  p_locale text default 'pl'
) returns jsonb
```

Current contract version:

```ts
contractVersion: 'report_page_copy_v3'
```

Storage:

```sql
report_page_copy_bundles(
  locale text primary key,
  copy_json jsonb not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
)
```

Locale behavior:

- `pl` returns Polish copy;
- `en` returns English copy;
- any unsupported locale falls back to `en`;
- payload returns both `requestedLocale` and resolved `locale`.

Reports copy owns:

- Reports Center header/summary/filter/list/preview/action labels;
- Reports Center event type display map by machine key;
- report shell header/meta/feedback labels;
- public report unavailable shell copy;
- legacy compatibility copy keys while old UI is being migrated.

Reports copy does **not** own:

- Exploration result narrative;
- Trial/Encounter narrative;
- reward/effect wording;
- Combat attack text;
- PvP/Spy outcome text;
- stored historical report titles/summaries.

---

## 2. RPC and grants

```ts
interface GetReportPageCopyRpc {
  p_locale?: string; // default 'pl'
  returns: ReportPageCopyV3;
}
```

Grants:

- `anon`: execute allowed;
- `authenticated`: execute allowed.

The RPC is safe for public pages because it returns copy only, no private report state.

---

## 3. Top-level shape

```ts
interface ReportPageCopyV3 {
  contractVersion: 'report_page_copy_v3';
  locale: string;
  requestedLocale: string;
  fallbackLocale: 'en';
  copyStorage: 'report_page_copy_bundles';
  reportsCopyPatchVersion: string;

  reportsCenter: ReportsCenterCopyV3;
  reportShell: ReportShellCopyV3;

  // legacy compatibility keys retained during migration
  detail: LegacyReportDetailCopyV1;
  publicReport: LegacyPublicReportCopyV1;
  labels: LegacyReportLabelsV1;
  pagination: LegacyReportPaginationCopyV1;
}
```

Current verified patch version:

```ts
reportsCopyPatchVersion: 'reports_center_locale_bundle_v2'
```

---

## 4. Reports Center copy

```ts
interface ReportsCenterCopyV3 {
  header: {
    eyebrow: string;
    title: string;
    intro: string;
  };

  summary: {
    totalReportsLabel: string;
    unreadReportsLabel: string;
    latestReportLabel: string;
    latestReportFallback: string;
    openLatestReportAction: string;
  };

  filters: {
    title: string;
    helperText: string;
    searchLabel: string;
    searchPlaceholder: string;
    reportTypeLabel: string;
    eventTypeLabel: string;
    readModeLabel: string;
    timeRangeLabel: string;
    unreadOnlyLabel: string;
    allTypesLabel: string;
  };

  filterOptions: {
    eventTypes: Record<string, string>;
    readModes: Record<string, string>;
    timeRanges: Record<string, string>;
  };

  eventTypes: ReportsCenterEventTypeCopyBundleV1;

  list: {
    title: string;
    emptyTitle: string;
    emptyText: string;
    openAction: string;
    removeAction: string;
    markReadAction: string;
    unreadLabel: string;
    readLabel: string;
    unreadCountTemplate: string;
    rangeTemplate: string;
  };

  preview: {
    titleFallback: string;
    emptyTitle: string;
    emptyText: string;
    openAction: string;
    copyLinkAction: string;
    copyLinkShortAction: string;
    sourceLabel: string;
    eventTypeLabel: string;
    reportDateLabel: string;
    accessLabel: string;
    rewardLabel: string;
    resourcesLabel: string;
    turnCountLabel: string;
    opponentTargetLabel: string;
    addressLabel: string;
  };

  actions: ReportsCenterActionCopyV3;
}
```

---

## 5. Event type copy bundle

Located at:

```ts
copy.reportsCenter.eventTypes
```

```ts
interface ReportsCenterEventTypeCopyBundleV1 {
  contractVersion: 'reports_center_event_type_copy_v1';
  policy: string;
  keys: string[];
  byKey: Record<string, ReportsCenterEventTypeCopy>;
}

interface ReportsCenterEventTypeCopy {
  label: string;
  tone: string;
  iconKey: string;
}
```

Use with Reports Center v3:

```ts
const key = row.eventType.key;
const eventTypeCopy = copy.reportsCenter.eventTypes.byKey[key];
```

Do not use local fallback labels for these keys.

Current key list:

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

Current representative PL display:

| key | label | tone | iconKey |
|---|---|---|---|
| `buff` | `Wzmocnienie` | `success` | `report-buff` |
| `combat` | `Walka` | `danger` | `combat` |
| `debuff` | `Osłabienie` | `danger` | `report-debuff` |
| `resource` | `Zasoby` | `success` | `resource` |
| `trial` | `Próba` | `warn` | `trial` |
| `encounter_combat` | `Starcie na szlaku` | `danger` | `combat` |
| `pvp_spy` | `Zwiad` | `info` | `spy` |

Current representative EN display:

| key | label | tone | iconKey |
|---|---|---|---|
| `buff` | `Buff` | `success` | `report-buff` |
| `combat` | `Combat` | `danger` | `combat` |
| `debuff` | `Debuff` | `danger` | `report-debuff` |
| `resource` | `Resources` | `success` | `resource` |
| `trial` | `Trial` | `warn` | `trial` |
| `encounter_combat` | `Road combat` | `danger` | `combat` |
| `pvp_spy` | `Spy report` | `info` | `spy` |

Frontend rules:

- Use this map for event type display in Reports Center.
- Use `row.eventType.label/tone/iconKey` only as DB fallback if `byKey[key]` is missing.
- Do not infer subtype from title, summary, contentKind, resultKind or preview outcome label.
- Do not expect duplicate event type fields in `preview` or `marker`.

---

## 6. Reports Center action copy

Located at:

```ts
copy.reportsCenter.actions
```

```ts
interface ReportsCenterActionCopyV3 {
  markAllRead: {
    label: string;
    confirmTitle: string;
    confirmText: string;
    successText: string;
    disabledTooltip: string;
  };

  selectAllVisible: {
    label: string;
    ariaLabel: string;
    tooltip: string;
  };

  clearSelection: {
    label: string;
    ariaLabel: string;
    tooltip: string;
  };

  markSelectedRead: {
    label: string;
    ariaLabel: string;
    confirmTitle: string;
    confirmText: string;
    successText: string;
    disabledTooltip: string;
  };

  deleteSelected: {
    label: string;
    ariaLabel: string;
    confirmTitle: string;
    confirmText: string;
    successText: string;
    disabledTooltip: string;
  };

  markOneRead: {
    label: string;
    ariaLabel: string;
    tooltip: string;
    successText: string;
  };

  deleteOne: {
    label: string;
    ariaLabel: string;
    tooltip: string;
    confirmTitle: string;
    confirmText: string;
    successText: string;
  };

  selectReportRow: {
    ariaLabelTemplate: string; // {title}
    selectedAriaLabelTemplate: string; // {title}
    fallbackAriaLabel: string;
    selectedFallbackAriaLabel: string;
  };
}
```

Rules:

- Do not hardcode button labels, tooltips or aria labels in Angular.
- If an action is unsupported by the page context, do not show a fake working action just because copy exists.
- Copy describes UI text; capabilities/actions in page context decide behavior.

---

## 7. Report shell copy

Located at:

```ts
copy.reportShell
```

```ts
interface ReportShellCopyV3 {
  header: {
    titleFallback: string;
    backAction: string;
    copyLinkAction: string;
    openFullReportAction: string;
    removeAction: string;
  };

  meta: {
    sourceLabel: string;
    eventTypeLabel: string;
    reportDateLabel: string;
  };

  feedback: {
    copyLinkSuccess: string;
    markReadSuccess: string;
    removeSuccess: string;
  };

  public: {
    titleFallback: string;
    notFoundTitle: string;
    notFoundText: string;
  };
}
```

Rules:

- Report shell action labels come from this copy.
- Shell title/source/event/date values come from `reportShellContextJson`, not from copy.
- Copy labels such as `sourceLabel`, `eventTypeLabel`, `reportDateLabel` are field labels only.

---

## 8. Legacy compatibility copy

The payload still includes legacy keys while older UI is migrated:

- `detail.*`;
- `publicReport.*`;
- `labels.*`;
- `pagination.*`.

New Reports Center and new Report Shell code should prefer:

- `reportsCenter.*`;
- `reportShell.*`;
- `reportsCenter.eventTypes.byKey`.

Do not use legacy `detail.sections.*` to reintroduce generic full-report sections.

---

## 9. Verification status

Latest verification confirmed:

- `get_report_page_copy(text)` exists;
- argument is `p_locale text DEFAULT 'pl'::text`;
- `anon=true`, `authenticated=true`;
- bundles exist for `pl` and `en`;
- unsupported locale `de` resolves to `en`;
- PL title is `Raporty`;
- EN title is `Reports`;
- `reportsCopyPatchVersion = reports_center_locale_bundle_v2`;
- action copy includes select-all, clear selection, mark selected read, delete selected, mark one read, delete one, select row aria labels and open full report;
- current representative page-context event type keys all have copy coverage.

---

## 10. Codex directives

Codex must:

1. Call `get_report_page_copy(locale)` for Reports Center and report shell copy.
2. Use locale selected by app/user context. Until broader locale selection exists, pass `'pl'` for Polish UI.
3. Use `copy.locale` as the resolved locale.
4. Use `copy.reportsCenter.eventTypes.byKey[row.eventType.key]` for event type display.
5. Use Reports Center action copy from `copy.reportsCenter.actions`.
6. Use report shell copy from `copy.reportShell`.
7. Keep source-domain narratives/rewards/effects out of this copy layer.

Codex must not:

1. Recreate a local Reports Center copy object.
2. Use Angular local fallback translations for event types/actions/shell labels.
3. Infer event subtype from report title, summary, contentKind, resultKind or marker label.
4. Treat eventType fallback labels from page context as primary display when copy by key exists.
5. Put Exploration/PvP/Combat/Spy result copy into Reports copy.

---

## 11. Generated types note

The RPC returns `jsonb`, so generated types do not describe this recursive copy payload. Regenerate Supabase generated types after signature changes, but use this file as the authoritative recursive copy shape contract.
