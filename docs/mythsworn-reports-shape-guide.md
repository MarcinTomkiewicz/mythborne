# Mythsworn — Reports Shape Guide

Status: DB/RPC consumption guidance for Codex / Reviewer / Frontend  
Updated: 2026-06-06  
Scope: player-facing Reports contracts only: Reports Center copy, report list, private report detail, public report detail, read/remove actions, handoff from gameplay results, row shapes, public-safety boundaries and frontend restrictions.

This guide is **not** a migration and **not** a complete database dump. It is a focused shape/contract guide for implementing and reviewing the Reports UI safely.

---

## 0. Hard rules for Codex / Frontend

Reports are a **DB/RPC-owned workflow**.

Use the canonical Reports split contract in this guide.

Do **not** use the old/legacy report RPC names from Angular:

```text
get_hero_game_reports(...)
get_hero_game_report_detail(...)
get_public_game_report_by_token(...)
get_hero_game_report_unread_count(...)
mark_game_report_read(...)
delete_game_report_for_hero(...)
```

Those functions may still exist as internal/transition dependencies for canonical wrappers, but they are closed for normal frontend roles and must not be called by the new Reports UI.

Do **not** direct-read for normal player Reports UI:

```text
game_reports
game_report_hero_access
game_report_participants
game_report_item_references
game_report_types
combat_results
combat_result_participants
combat_result_attacks
pvp_attack_results
pvp_spy_results
manual_trial_verdicts
exploration_challenge_attempts
reward_grants
items
```

Do **not** direct-write:

```text
game_reports
game_report_hero_access
game_report_participants
game_report_item_references
read state rows
public tokens
combat/trial/encounter/pvp report source rows
```

Use canonical Reports RPCs only.

After gameplay workflows such as combat, trial, encounter or spy produce `game_report_id`, the frontend should open the same canonical private Report Detail renderer:

```text
get_report_detail(activeHeroId, game_report_id)
```

Do not build a separate transient report UI for post-combat/post-trial/post-encounter/post-spy results when a durable report exists.

---

## 1. Canonical Reports RPCs

### Copy

```sql
get_report_page_copy()
```

Access:

```text
anon = true
authenticated = true
```

Reason: public report pages also need the same copy.

### Reports Center list

```sql
get_report_list_page(
  p_hero_id uuid,
  p_limit integer default 25,
  p_offset integer default 0,
  p_report_type_key text default null,
  p_unread_only boolean default false
)
```

Access:

```text
anon = false
authenticated = true
```

### Private report detail

```sql
get_report_detail(
  p_hero_id uuid,
  p_report_id uuid
)
```

Access:

```text
anon = false
authenticated = true
```

### Public report detail

```sql
get_public_report_detail(
  p_public_token text
)
```

Access:

```text
anon = true
authenticated = true
```

### Actions

```sql
mark_report_read(
  p_hero_id uuid,
  p_report_id uuid
)

remove_report_from_list(
  p_hero_id uuid,
  p_report_id uuid,
  p_reason text default null,
  p_request_id text default null
)
```

Access:

```text
anon = false
authenticated = true
```

---

## 2. Canonical contract versions

```text
get_report_page_copy       -> report_page_copy_v1
get_report_list_page       -> report_list_page_v1
get_report_detail          -> report_detail_v1
get_public_report_detail   -> report_detail_v1
mark_report_read           -> report_read_state_v1
remove_report_from_list    -> report_remove_result_v1
```

---

## 3. Page copy

### RPC

```sql
get_report_page_copy() returns jsonb
```

### Purpose

DB-owned copy for:

```text
Reports Center
Private report detail
Public report detail
```

The copy payload contains **no report rows**, **no report detail content**, **no hero/runtime data** and **no private state**.

### Shape

```ts
interface ReportPageCopy {
  contractVersion: 'report_page_copy_v1';

  reportsCenter: {
    header: {
      eyebrow: string;
      title: string;
      intro: string;
    };

    filters: {
      title: string;
      helperText: string;
      reportTypeLabel: string;
      unreadOnlyLabel: string;
      searchLabel: string;
      searchPlaceholder: string;
      allTypesLabel: string;
    };

    list: {
      title: string;
      emptyTitle: string;
      emptyText: string;
      unreadLabel: string;
      readLabel: string;
      openAction: string;
      removeAction: string;
    };
  };

  detail: {
    header: {
      titleFallback: string;
      backAction: string;
      shareAction: string;
      markReadAction: string;
      removeAction: string;
    };

    sections: {
      participants: string;
      itemReferences: string;
      spy: string;
      trial: string;
      encounter: string;
      combat: string;
      rewards: string;
      effects: string;
      relatedReports: string;
    };

    empty: {
      participants: string;
      itemReferences: string;
      rewards: string;
      relatedReports: string;
    };
  };

  publicReport: {
    header: {
      titleFallback: string;
      notFoundTitle: string;
      notFoundText: string;
    };

    privacy: {
      publicBoundaryText: string;
    };
  };

  labels: {
    createdAt: string;
    reportType: string;
    source: string;
    participants: string;
    rewards: string;
    status: string;
    publicLink: string;
    readState: string;
  };

  pagination: {
    rangeTemplate: string;
  };
}
```

### Current expected copy preview

```text
reportsCenter.header.title = Raporty
reportsCenter.header.intro = Przeglądaj trwałe zapisy walk, prób, spotkań, zwiadu i innych wydarzeń w grze.
reportsCenter.filters.title = Filtry raportów
reportsCenter.list.emptyTitle = Brak raportów do wyświetlenia
detail.header.titleFallback = Raport
publicReport.header.notFoundTitle = Raport niedostępny
publicReport.privacy.publicBoundaryText = To publiczny widok raportu. Pokazuje tylko bezpieczne informacje zapisane w raporcie.
pagination.rangeTemplate = Wyświetlane raporty {start}–{end} z {total}
```

Frontend must not hardcode these strings locally.

---

## 4. Reports Center list

### RPC

```sql
get_report_list_page(
  p_hero_id uuid,
  p_limit integer default 25,
  p_offset integer default 0,
  p_report_type_key text default null,
  p_unread_only boolean default false
) returns jsonb
```

### Purpose

Canonical Reports Center list page RPC.

It returns:

```text
report list rows
unread count
pagination
applied filters
```

It does **not** return page copy and does **not** return detail sections.

### Shape

```ts
interface ReportListPage {
  contractVersion: 'report_list_page_v1';

  reports: ReportListRow[];

  unreadCount: number;

  pagination: ReportPagination;

  appliedFilters: {
    reportTypeKey: string | null;
    unreadOnly: boolean;
  };
}
```

### Report list row

```ts
interface ReportListRow {
  reportId: string;
  publicToken: string | null;

  reportTypeKey: string;
  reportTypeLabel: string;

  title: string;
  summary: string | null;

  sourceEntityType: string | null;
  sourceEntityId: string | null;

  accessRole: string;

  createdAt: string;
  readAt: string | null;
  isUnread: boolean;

  participantsJson: unknown[];
  itemReferencesCount: number;
}
```

### Pagination

```ts
interface ReportPagination {
  limit: number;
  offset: number;
  totalCount: number;
  hasNextPage: boolean;

  rangeStart: number;
  rangeEnd: number;
  rangeTotal: number;
  rangeTemplate: string;
  displayLabel: string;
}
```

Example:

```text
Wyświetlane raporty 1–10 z 93
```

Use `pagination.displayLabel`. Do not locally compose `1-10 / 93`.

### Rendering rules

- List rows are summaries only.
- Do not render detail sections from list rows.
- Do not infer unread count from the current page length.
- Do not direct-read `game_report_hero_access`.
- Do not call legacy `get_hero_game_reports(...)`.

---

## 5. Shared report detail core

Private and public report detail both use the same `report` object shape.

### Shared core shape

```ts
interface ReportDetailCore {
  publicToken: string | null;

  reportTypeKey: string;
  reportTypeLabel: string;
  reportTypeDescription: string | null;

  title: string;
  summary: string | null;
  sourceLabel: string | null;
  sourceEntityType: string | null;

  createdAt: string;

  participantsJson: unknown[];
  itemReferencesJson: unknown[];

  spySectionJson: unknown | null;
  trialSectionJson: unknown | null;
  encounterSectionJson: unknown | null;
  combatSectionJson: unknown | null;
  rewardSectionJson: unknown | null;
  effectSectionJson: unknown | null;
  relatedReportsJson: unknown[];
}
```

### Required section keys

Every private and public report detail payload should expose these keys under `report`:

```text
participantsJson
itemReferencesJson
spySectionJson
trialSectionJson
encounterSectionJson
combatSectionJson
rewardSectionJson
effectSectionJson
relatedReportsJson
```

A section may be JSON `null`, but the key must exist.

### Section semantics

```text
participantsJson
- display-safe participant snapshots
- not live account/user records

itemReferencesJson
- reward/drop item references
- renderer should prefer live item detail when safe and fall back to saved display components when needed

spySectionJson
- PvP spy report section
- viewer-aware in private detail
- public-safe in public detail

trialSectionJson
- Trial result section

encounterSectionJson
- Encounter result section

combatSectionJson
- persisted combat snapshot section
- frontend must not recompute combat outcome/stat rows locally

rewardSectionJson
- rewards, XP, CP, resources, item rewards, PvP resource transfer where applicable

effectSectionJson
- exploration/persistent effect outcomes where safe

relatedReportsJson
- parent/child/contextual report links
```

---

## 6. Private report detail

### RPC

```sql
get_report_detail(
  p_hero_id uuid,
  p_report_id uuid
) returns jsonb
```

### Purpose

Canonical private report detail for the authenticated game shell.

It wraps existing durable report content into `report_detail_v1`.

It does not mark the report as read. Use `mark_report_read(...)` separately.

### Shape

```ts
interface PrivateReportDetailPage {
  contractVersion: 'report_detail_v1';

  access: {
    visibility: 'private';

    heroId: string;
    reportId: string;

    accessRole: string;

    isUnread: boolean;
    readAt: string | null;
  };

  report: ReportDetailCore;
}
```

### Rendering rules

- Render title from `report.title`.
- Render summary from `report.summary`.
- Render read state from `access.isUnread` / `access.readAt`.
- Do not call `mark_report_read(...)` implicitly inside the mapper.
- Do not direct-read `game_report_hero_access`.
- Do not call legacy `get_hero_game_report_detail(...)`.

---

## 7. Public report detail

### RPC

```sql
get_public_report_detail(
  p_public_token text
) returns jsonb
```

### Purpose

Canonical public report detail for `/report/:publicToken`.

Uses the same `report` core shape as private detail when the token resolves.

### Available shape

```ts
interface PublicReportDetailPage {
  contractVersion: 'report_detail_v1';

  access: {
    visibility: 'public';
    isPublic: true;
    publicToken: string;
    isAvailable: true;
  };

  report: ReportDetailCore;
}
```

### Not found / unavailable shape

```ts
interface PublicReportNotFoundPage {
  contractVersion: 'report_detail_v1';

  access: {
    visibility: 'public';
    isPublic: true;
    publicToken: string | null;
    isAvailable: false;
    notFoundKey: 'public_report_not_found';
    notFoundLabel: string;
  };

  report: null;
}
```

Current not-found label:

```text
Raport nie istnieje albo nie jest już publicznie dostępny.
```

### Public safety boundary

Public detail must not expose:

```text
internal reportId
sourceEntityId
heroId
accessRole
readAt
isUnread
account/user ids
staff fields
audit fields
anti-abuse fields
internal combat row ids
```

Public-safe fields may include:

```text
publicToken
reportTypeKey
reportTypeLabel
title
summary
sourceLabel
sourceEntityType
createdAt
safe report sections
```

---

## 8. Report read action

### RPC

```sql
mark_report_read(
  p_hero_id uuid,
  p_report_id uuid
) returns jsonb
```

### Shape

```ts
interface ReportReadState {
  contractVersion: 'report_read_state_v1';

  reportId: string;
  heroId: string;

  accessRole: string;

  readAt: string;
  isUnread: false;
}
```

### Rules

- Marks only one hero access row as read.
- Reading by one participant does not affect other participants.
- Use this instead of legacy `mark_game_report_read(...)`.

---

## 9. Remove report action

### RPC

```sql
remove_report_from_list(
  p_hero_id uuid,
  p_report_id uuid,
  p_reason text default null,
  p_request_id text default null
) returns jsonb
```

### Shape

```ts
interface ReportRemoveResult {
  contractVersion: 'report_remove_result_v1';

  reportId: string;
  heroId: string;

  removedAccess: boolean;
  deletedReport: boolean;

  publicToken: string | null;
  remainingAccessCount: number;
}
```

### Rules

- Removes the report from one hero private Reports list.
- If it was the last access row, the durable report may be deleted and public token stops resolving.
- Use this instead of legacy `delete_game_report_for_hero(...)`.
- Frontend must not direct-delete report rows.

---

## 10. Gameplay result handoff

When gameplay workflows return `game_report_id`, frontend should route to the canonical private report detail.

### Correct flow

```text
combat/trial/encounter/spy workflow
→ response.game_report_id
→ route to Reports Detail
→ get_report_detail(activeHeroId, game_report_id)
→ render the same report component used by Reports Center
```

### Do not do this

```text
workflow response
→ build separate transient report UI
→ duplicate report sections/copy/mappers
```

### Verified handoff sources

The current DB smoke verified that expected gameplay handoff functions expose `game_report_id`, including:

```text
auto_resolve_combat_session
finalize_combat_source_result
auto_resolve_manual_trial
exit_manual_trial_to_auto_resolve
resolve_manual_trial_inactivity_timeout
resolve_trial_offer_inactivity_timeout
submit_manual_trial_action_log
get_active_trial_offer
get_manual_trial_backend_verdict
get_manual_trial_backend_verdict_for_attempt
create_pvp_spy_game_report
```

Encounter reports are present in the durable report source coverage and render through the same canonical detail contract.

---

## 11. Legacy Reports RPCs — do not call

The following legacy/transition report RPCs are closed for `anon/authenticated` and must not be used by frontend:

```text
get_hero_game_reports(...)
get_hero_game_report_detail(...)
get_public_game_report_by_token(...)
get_hero_game_report_unread_count(...)
mark_game_report_read(...)
delete_game_report_for_hero(...)
```

They may still exist for internal wrapper dependency.

Do not drop them without a separate DB review because canonical wrappers currently delegate to them.

---

## 12. Internal report builders/producers — do not call from Angular

These are DB composition/producer helpers, not Reports UI API:

```text
build_game_report_combat_section_json(...)
build_game_report_combat_section_json_base(...)
build_game_report_trial_section_json(...)
build_game_report_encounter_section_json(...)
build_game_report_spy_section_json(...)
build_game_report_spy_section_json_for_viewer(...)
build_game_report_reward_section_json(...)
build_game_report_effect_section_json(...)
build_game_report_related_reports_json(...)
build_game_report_source_label(...)
resolve_game_report_combat_result_id(...)
resolve_game_report_reward_grant_id(...)
attach_reward_drop_item_to_game_report(...)
attach_reward_grant_items_to_game_report(...)
create_game_report_from_combat_result(...)
create_manual_trial_game_report(...)
create_pvp_attack_game_report(...)
create_pvp_spy_game_report(...)
generate_game_report_public_token()
```

Some helper/producer grants may be audited separately later. For the Reports UI, Codex must use only the canonical Reports RPCs in this guide.

Do not mix this Reports UI migration with broad Combat/Trial/Admin grant cleanup. Those are separate domains.

---

## 13. Minimal Codex handoff

```text
Use the canonical Reports split contract only.

Copy:
- get_report_page_copy()

Reports Center:
- get_report_list_page(p_hero_id, p_limit, p_offset, p_report_type_key, p_unread_only)

Private detail:
- get_report_detail(p_hero_id, p_report_id)

Public detail:
- get_public_report_detail(p_public_token)

Actions:
- mark_report_read(p_hero_id, p_report_id)
- remove_report_from_list(p_hero_id, p_report_id, p_reason, p_request_id)

Do not use:
- get_hero_game_reports(...)
- get_hero_game_report_detail(...)
- get_public_game_report_by_token(...)
- get_hero_game_report_unread_count(...)
- mark_game_report_read(...)
- delete_game_report_for_hero(...)
- build_game_report_* helpers
- report tables directly

Public route:
- if access.isAvailable=false, render access.notFoundLabel and do not render report sections.
- if access.isAvailable=true, render report core from payload.report.
- public report must not expect private read state.

Private route:
- render access.isUnread/readAt from payload.access.
- mark read through mark_report_read(...), not through detail load.

Gameplay handoff:
- after combat/trial/encounter/spy result, use game_report_id and open get_report_detail(...).
- do not create a separate transient report renderer.
```

---

## 14. Verified state

Latest verified state:

```text
get_report_page_copy.contractVersion = report_page_copy_v1
get_report_list_page.contractVersion = report_list_page_v1
get_report_detail.contractVersion = report_detail_v1
get_public_report_detail.contractVersion = report_detail_v1
mark_report_read.contractVersion = report_read_state_v1
remove_report_from_list.contractVersion = report_remove_result_v1
```

Canonical grants:

```text
get_report_page_copy: anon + authenticated
get_report_list_page: authenticated only
get_report_detail: authenticated only
get_public_report_detail: anon + authenticated
mark_report_read: authenticated only
remove_report_from_list: authenticated only
```

Legacy Reports RPC grants:

```text
get_hero_game_reports: closed
get_hero_game_report_detail: closed
get_public_game_report_by_token: closed
get_hero_game_report_unread_count: closed
mark_game_report_read: closed
delete_game_report_for_hero: closed
```

Final report type matrix:

```text
combat: private/public OK
trial: private/public OK
encounter: private/public OK
pvp_combat: private/public OK
pvp_spy: private/public OK
```

All tested report detail types have:

```text
same private/public report core keys
same section JSON types
publicSafe = true
sectionsOk = true
coreKeysOk = true
```

Reports table privileges:

```text
game_reports: no anon/auth direct select/insert/update
game_report_hero_access: no anon/auth direct select/insert/update
game_report_participants: no anon/auth direct select/insert/update
game_report_item_references: no anon/auth direct select/insert/update
game_report_types: no anon/auth direct select/insert/update
```
