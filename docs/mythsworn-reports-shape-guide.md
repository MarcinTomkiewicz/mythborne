# Mythsworn — Reports Shape Guide

Status: DB/RPC consumption guidance for Codex / Reviewer / Frontend  
Updated: 2026-06-06  
Scope: player-facing Reports contracts only: Reports Center copy, report list, private report detail, public report detail, section display JSON, read/remove actions, handoff from gameplay results, public-safety boundaries and frontend restrictions.

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

Those functions still exist as closed internal backing implementations for canonical wrappers. They are closed for normal frontend roles and must not be called by the Reports UI.

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
reward_grant_entries
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

### No heuristic report-section renderer

Angular must not scan arbitrary JSON, stringify booleans/numbers, or infer display rows from unknown keys.

Allowed:

```text
- render the shared report shell from `report.title`, `report.summary`, `report.sourceLabel`, `report.createdAt`;
- render section-level common fields when explicitly present: `title`, `summary`, `sourceLabel`, `outcomeLabel`, `resultLabel`, `message`, `narrativeLines`, `descriptionLines`;
- render each section’s arrays using the exact row shapes documented below.
```

Blocked:

```text
- generic recursive key/value renderer;
- `title/summary/facts/items` heuristics unless the section actually exposes those exact fields in this guide;
- local fallback copy for missing labels;
- guessing private/public ID visibility;
- deriving combat stats/outcome, reward rows, spy intel, trial/encounter outcome or related-report links in Angular.
```

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

  participantsJson: ReportParticipantRow[];
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

### Private RPC

```sql
get_report_detail(p_hero_id uuid, p_report_id uuid) returns jsonb
```

### Public RPC

```sql
get_public_report_detail(p_public_token text) returns jsonb
```

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

  participantsJson: ReportParticipantRow[];
  itemReferencesJson: ReportItemReferenceRow[];

  spySectionJson: ReportSpySection | ReportMissingSection | null;
  trialSectionJson: ReportTrialSection | ReportMissingSection | null;
  encounterSectionJson: ReportEncounterSection | ReportMissingSection | null;
  combatSectionJson: ReportCombatSection | ReportMissingSection | null;
  rewardSectionJson: ReportRewardSection | ReportMissingSection | null;
  effectSectionJson: ReportEffectSection | null;
  relatedReportsJson: ReportRelatedReportRow[];
}
```

### Required section keys

Every private and public `report_detail_v1` payload exposes these keys under `report`:

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

A section value may be JSON `null`, but the key must exist.

### Public/private envelope difference

```ts
interface PrivateReportDetailPage {
  contractVersion: 'report_detail_v1';
  access: {
    visibility: 'private';
    heroId: string;
    reportId: string;
    accessRole: 'owner' | 'participant' | 'viewer' | string;
    isUnread: boolean;
    readAt: string | null;
  };
  report: ReportDetailCore;
}

interface PublicReportDetailPage {
  contractVersion: 'report_detail_v1';
  access: {
    visibility: 'public';
    isPublic: true;
    publicToken: string | null;
    isAvailable: boolean;
    notFoundKey?: 'public_report_not_found';
    notFoundLabel?: string;
  };
  report: ReportDetailCore | null;
}
```

Public report detail must not expose:

```text
reportId
sourceEntityId
heroId
accessRole
readAt
isUnread
account/user/staff/audit/anti-abuse/internal combat row ids
```

---

## 6. Section display contract — common rules

### Field presence rules

There are two levels of requiredness:

1. **Core keys:** all section keys listed in section 5 must exist under `report`.
2. **Section object keys:** many section builders use `jsonb_strip_nulls(...)`; private-only/internal fields may be omitted in public payloads and may also be omitted when their DB value is null.

Therefore Angular must treat fields as:

```text
required = must exist when the section object exists and the row/object type applies;
optional = may be missing or null;
private-only = only in private detail and often stripped from public detail;
public-safe = may appear in both private and public detail.
```

### Generic rendering policy

Angular may render this **common display envelope** when present:

```ts
interface ReportSectionDisplayEnvelope {
  title?: string;
  summary?: string;
  sourceLabel?: string;
  outcomeLabel?: string;
  resultLabel?: string;
  playerSummary?: string;
  message?: string;
  narrativeLines?: string[];
  descriptionLines?: string[];
}
```

Angular must not scan arbitrary JSON beyond this envelope.

Specific arrays must use the exact shapes in this guide:

```text
participantsJson[]             -> ReportParticipantRow
itemReferencesJson[]           -> ReportItemReferenceRow
combatSectionJson.participants -> ReportCombatParticipantRow
combatSectionJson.attacks      -> ReportCombatAttackRow
rewardSectionJson.entries      -> ReportRewardEntryRow
rewardSectionJson.entries[pvp] -> ReportPvpResourceRewardEntryRow
effectSectionJson.effects      -> ReportEffectRow
effectSectionJson.rewardEffectEntries -> ReportRewardEffectEntryRow
relatedReportsJson[]           -> ReportRelatedReportRow
spySectionJson.baseStats/resources/equipment/buildings -> documented spy row shapes
```

---

## 7. `participantsJson[]`

### Shape

```ts
interface ReportParticipantRow {
  participantRole: string | null;
  sideLabel: string | null;
  displayName: string;
  levelSnapshot: number | null;
  sortOrder: number | null;

  // Private detail only. Public detail currently omits this key.
  heroId?: string | null;
}
```

### Required / optional

| Field | Required | Public/private | Rendering |
|---|---:|---|---|
| `displayName` | yes | public + private | Primary participant name. Do not replace with hero/account lookup. |
| `participantRole` | optional | public + private | Role key/label snapshot; use as role badge/text only if non-empty. |
| `sideLabel` | optional | public + private | Display-safe side/role label. |
| `levelSnapshot` | optional | public + private | Render as level if present. |
| `sortOrder` | optional | public + private | Ordering only; do not show as text. |
| `heroId` | optional | private only | Internal navigation/debug only; do not require it for display. |

### Null handling

`participantsJson` is always an array. Empty array means no participants to show.

### Rendering rule

Use a dedicated participant row renderer. Do not generic-render this row as arbitrary facts.

---

## 8. `itemReferencesJson[]`

### Shape

```ts
interface ReportItemReferenceRow {
  itemReferenceId: string;
  sourceKind: 'reward_drop' | string;
  sourceItemId: string | null;
  displayNameFallback: string | null;
  qualityKey: string | null;
  baseId: string | null;
  prefixAffixId: string | null;
  suffixAffixId: string | null;
  sortOrder: number | null;
}
```

### Required / optional

| Field | Required | Public/private | Rendering |
|---|---:|---|---|
| `itemReferenceId` | yes | public + private | Stable report item reference id. Not a player-visible label. |
| `sourceKind` | yes | public + private | Currently `reward_drop`; use only for routing/display grouping if needed. |
| `sourceItemId` | optional | public + private | Prefer live item detail/popover when canonical item detail access supports the current context. |
| `displayNameFallback` | optional | public + private | Display fallback when live item detail is unavailable. |
| `qualityKey` | optional | public + private | Component fallback. Do not render raw unless no DB/display name exists. |
| `baseId` | optional | public + private | Component fallback for generated item reconstruction. |
| `prefixAffixId` | optional | public + private | Component fallback for generated item reconstruction. |
| `suffixAffixId` | optional | public + private | Component fallback for generated item reconstruction. |
| `sortOrder` | optional | public + private | Ordering only. |

### Null handling

`itemReferencesJson` is always an array. Empty array means no referenced items.

### Rendering rule

Use item-reference specific rendering:

```text
1. If `sourceItemId` can be safely opened through canonical item popover/detail, use it.
2. Else show `displayNameFallback`.
3. Else show a conservative item placeholder from report copy.
```

Do not render CP price, trade price, auction price, owner-only status or shelf visibility inside report item references.

---

## 9. `trialSectionJson`

### Applies to

```text
report.sourceEntityType = trial_result
report.reportTypeKey = trial
```

For non-trial reports this section is `null`.

### Shape

```ts
interface ReportTrialSection {
  // Private-only/internal source ids. Omitted in public detail.
  challengeAttemptId?: string;
  stepId?: string;
  explorationId?: string;
  trialDefinitionId?: string;
  rewardGrantId?: string;

  // Display/source identity.
  trialKey: string;
  trialLabel: string;
  sourceLabel: string;

  minigameKey: string | null;
  difficultyKey: string | null;
  status: string;

  trialManifested: boolean;
  manifestationStatus: 'failed' | 'pending' | 'manifested' | string;
  resultKind: 'trial_manifestation' | 'trial_runtime' | 'trial_completion' | string;
  resultKey: 'trial_manifestation_failed' | 'trial_success' | 'trial_failed' | 'trial_pending' | string;
  outcomeKind: 'trial_manifestation_failed' | 'trial_success' | 'trial_failed' | 'trial_pending' | string;

  title: string;
  summary: string;
  outcomeLabel: string;
  resultLabel: string;
  narrativeLines: string[];
  descriptionLines: string[];

  success: boolean | null;
  completionMode: string | null;
  score: number | null;
  performanceRating: string | null;
  testedStatKey: string | null;
  testedStatLabel: string | null;
  createdAt: string | null;
  completedAt: string | null;
}
```

### Missing shape

If the report says it is a trial report but the source row cannot be found:

```ts
interface ReportMissingSection {
  missing: true;
  sourceEntityType: string;
  sourceLabel: string;
  title: string;
  summary: string;
  message: string;
}
```

### Required / optional

Required display fields when present:

```text
trialKey
trialLabel
sourceLabel
status
trialManifested
manifestationStatus
resultKind
resultKey
outcomeKind
title
summary
outcomeLabel
resultLabel
narrativeLines
descriptionLines
```

Optional/nullable:

```text
minigameKey
difficultyKey
success
completionMode
score
performanceRating
testedStatKey
testedStatLabel
createdAt
completedAt
```

Private-only and stripped from public:

```text
challengeAttemptId
stepId
explorationId
trialDefinitionId
rewardGrantId
```

### Rendering rule

This section has its own Trial shape. Angular may render the common envelope (`title`, `summary`, `outcomeLabel`, `narrativeLines`, `descriptionLines`) but must use named Trial fields for status/result/tested-stat rows. Do not derive Trial success from reward entries or combat section.

---

## 10. `encounterSectionJson`

### Applies to

```text
report.sourceEntityType = encounter_result
report.reportTypeKey = encounter
```

For non-encounter reports this section is `null`.

### Direct step/encounter shape

```ts
interface ReportEncounterSection {
  // Private-only/internal source ids. Omitted in public detail.
  stepId?: string;
  explorationId?: string;
  encounterDefinitionId?: string;
  challengeAttemptId?: string;
  rewardGrantId?: string;

  encounterKey: string | null;
  encounterLabel: string;
  sourceLabel: string;
  encounterKind: 'nothing' | 'resource' | 'buff' | 'debuff' | 'combat' | string;
  minigameKey: string | null;
  difficultyKey: string | null;
  outcomeKind?: string | null;
  status: string | null;
  resolvedAt?: string | null;

  noRewardReason?: string | null;
  noEffectReason?: string | null;
  noReportReason?: string | null;

  // Present for combat challenge encounter reports.
  challengeKind?: string | null;
  success?: boolean | null;
  completionMode?: string | null;
  createdAt?: string | null;
  completedAt?: string | null;

  title: string;
  summary: string;
  outcomeLabel: string;
  narrativeLines: string[];
  descriptionLines: string[];
}
```

### Missing shape

```ts
interface ReportMissingSection {
  missing: true;
  sourceEntityType: string;
  sourceLabel: string;
  title: string;
  summary: string;
  message: string;
}
```

### Required / optional

Required display fields when present:

```text
encounterLabel
sourceLabel
encounterKind
title
summary
outcomeLabel
narrativeLines
descriptionLines
```

Optional/nullable:

```text
encounterKey
minigameKey
difficultyKey
outcomeKind
status
resolvedAt
noRewardReason
noEffectReason
noReportReason
challengeKind
success
completionMode
createdAt
completedAt
```

Private-only and stripped from public:

```text
stepId
explorationId
encounterDefinitionId
challengeAttemptId
rewardGrantId
```

### Rendering rule

This section has its own Encounter shape. Angular may render the common envelope, but must not infer reward/effect/combat state from `encounterKind`; those have their own sections.

---

## 11. `combatSectionJson`

### Applies to

```text
combat reports
pvp_combat reports
trial/encounter contextual reports with embedded combat
```

For `pvp_spy` reports this section is always `null`. For trial/encounter reports without combat it may be `null`.

### Section shape

```ts
interface ReportCombatSection {
  // Private-only/internal ids. Omitted in public detail.
  combatResultId?: string;
  pvpAttackResultId?: string;

  sourceLabel: string;
  title: string;
  summary: string;

  pvpOutcome?: string | null;
  sourceType: 'encounter' | 'trial' | 'pvp' | 'sandbox' | 'admin_test' | string;
  sourceTypeLabel: string;

  outcome: 'initiator_victory' | 'defender_victory' | 'draw' | string;
  outcomeLabel: string;

  winnerSide: 'initiator' | 'defender' | null;
  winnerSideLabel: string | null;
  loserSide: 'initiator' | 'defender' | null;
  loserSideLabel: string | null;

  turnsCompleted: number;
  startedAt: string | null;
  completedAt: string | null;
  narrativeLines: string[];

  participants: ReportCombatParticipantRow[];
  attacks: ReportCombatAttackRow[];
}
```

### Missing shape

```ts
interface ReportMissingSection {
  missing: true;
  sourceEntityType: string;
  sourceLabel: string;
  title: string;
  summary: string;
  message: string;
}
```

### Combat participant row

```ts
interface ReportCombatParticipantRow {
  // Private-only/internal ids. Omitted in public detail.
  participantId?: string;
  heroId?: string | null;
  opponentDefinitionId?: string | null;

  side: 'initiator' | 'defender' | string;
  sideLabel: string;

  participantKind: 'hero' | 'opponent' | string;
  participantKindLabel: string;

  displayName: string;
  level: number | null;

  healthStart: number | null;
  healthEnd: number | null;
  healthCurrent: number | null;
  healthMax: number | null;
  maxHealth: number | null;

  defense: number | null;
  minDamage: number | null;
  maxDamage: number | null;
  luck: number | null;
  criticalChance: number | null;
  criticalDamage: number | null;
  evasionChance: number | null;

  stats: Array<{
    statKey: string;
    statLabel: string;
    statValue: number;
  }>;

  baseStatRows: CombatDisplayStatRow[];
  combatStatRows: CombatDisplayStatRow[];
}
```

### Combat display stat row

`baseStatRows` and `combatStatRows` are backend-built display rows from persisted combat snapshots. The exact row payload may include additional display metadata, but the frontend may only rely on display-safe fields, not compute values locally.

```ts
interface CombatDisplayStatRow {
  statKey?: string;
  key?: string;
  label?: string;
  statLabel?: string;
  displayLabel?: string;
  value?: number | string;
  statValue?: number | string;
  finalValue?: number | string;
  displayValue?: string;
  tone?: string;
  colorTone?: string;
  colorableFinalValue?: boolean;
  sortOrder?: number;
}
```

Rendering rule for stat rows:

```text
Use `displayLabel` or `statLabel` or `label` as the label.
Use `displayValue` when present; otherwise use the numeric/string value already returned.
Do not recompute Health, Defense, Damage, Evasion, Luck/Fatum, attack count, critical chance or any derived combat stat in Angular.
```

### Combat attack row

```ts
interface ReportCombatAttackRow {
  // Private-only/internal ids. Omitted in public detail.
  attackId?: string;
  sourceItemId?: string | null;
  sourceBaseId?: string | null;
  sourcePrefixAffixId?: string | null;
  sourceSuffixAffixId?: string | null;
  opponentAttackSourceId?: string | null;

  turnNumber: number;
  attackOrder: number;

  actorSide: 'initiator' | 'defender' | string;
  actorSideLabel: string;
  targetSide: 'initiator' | 'defender' | string;
  targetSideLabel: string;

  actorDisplayName: string | null;
  targetDisplayName: string | null;

  attackSlotIndex: number | null;
  attackSourceKind: 'natural' | 'unarmed' | 'player_item' | 'opponent_manual' | 'opponent_generated' | string;
  attackSourceKindLabel: string;
  attackSourceLabel: string | null;
  sourceQualityKey: string | null;

  timingHit: boolean | null;
  evaded: boolean | null;
  critical: boolean | null;
  criticalDamage: number | null;
  rolledDamage: number | null;
  finalDamage: number | null;
  targetHealthBefore: number | null;
  targetHealthAfter: number | null;

  displayText: string | null;
  eventLabel: string | null;
  detailText: string | null;
  summary: string | null;
  damageDisplay: string | null;
  resultDisplay: string | null;
  presentationKind: string | null;
  tone: string | null;
  createdAt: string | null;
}
```

### Required / optional

Required display fields when present:

```text
sourceLabel
title
summary
sourceType
sourceTypeLabel
outcome
outcomeLabel
turnsCompleted
narrativeLines
participants
attacks
```

Required participant display fields:

```text
side
sideLabel
participantKind
participantKindLabel
displayName
baseStatRows
combatStatRows
```

Required attack display fields:

```text
turnNumber
attackOrder
actorSide
actorSideLabel
targetSide
targetSideLabel
attackSourceKind
attackSourceKindLabel
```

Optional/nullable attack presentation fields:

```text
actorDisplayName
targetDisplayName
attackSourceLabel
displayText
eventLabel
detailText
summary
damageDisplay
resultDisplay
presentationKind
tone
```

Private-only and stripped from public:

```text
combatResultId
pvpAttackResultId
participantId
heroId
opponentDefinitionId
attackId
sourceItemId
sourceBaseId
sourcePrefixAffixId
sourceSuffixAffixId
opponentAttackSourceId
```

### Rendering rule

Combat has its own renderer. Do not generic-render `combatSectionJson` as key/value facts. Render:

```text
- section header from title/summary/outcomeLabel/sourceTypeLabel;
- participants from participants[];
- attacks/log from attacks[];
- stat cards from baseStatRows/combatStatRows.
```

---

## 12. `rewardSectionJson`

### Applies to

```text
trial reports
encounter reports
combat reports with reward context
pvp_combat reports with reward/resource outcome
```

May be `null` for report types with no reward context. For trial/encounter reports without reward it may be an object with `hasReward=false`.

### Section shape

```ts
interface ReportRewardSection {
  hasReward: boolean;
  title: string;
  summary: string;
  sourceLabel: string;

  // Private-only/internal ids. Omitted in public detail.
  rewardGrantId?: string;
  rewardProfileId?: string;
  sourceId?: string;

  status?: string;
  sourceKind?: string;
  reason?: string | null;
  grantedAt?: string | null;

  entryCount?: number;
  entries: ReportRewardEntryRow[];
  narrativeLines?: string[];

  // Private-only for PvP resource outcome. Omitted in public detail.
  pvpResourceOutcome?: unknown;

  // Missing/no-reward variants.
  missing?: true;
  message?: string;
}
```

### Standard reward entry row

```ts
interface ReportRewardEntryRow {
  // Private-only/internal ids. Omitted in public detail.
  entryId?: string;
  rewardGrantId?: string;
  itemId?: string;
  effectDefinitionId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: unknown;

  entryKind:
    | 'experience'
    | 'character_points'
    | 'resource'
    | 'item_generation'
    | 'exploration_effect'
    | 'pvp_resource_transfer'
    | string;

  entryLabel: string;

  amount?: number | null;
  amountDisplay?: string | null;

  resourceType?: string | null;
  resourceLabel?: string | null;

  itemDisplayName?: string | null;

  effectKey?: string | null;
  effectLabel?: string | null;
  effectKind?: string | null;
  effectDisplay?: ExplorationEffectDisplay | null;

  displayValue: string | null;
  summary: string | null;
  playerSummary: string | null;
  createdAt?: string | null;
}
```

### PvP resource transfer reward entry row

```ts
interface ReportPvpResourceRewardEntryRow {
  entryKind: 'pvp_resource_transfer';
  entryLabel: string;
  resourceType: 'drachma' | 'materials' | 'workforce' | string;
  amount: number;
  gainAmount: number;
  lossAmount: number;
  sinkAmount: number;
  displayValue: string;
  amountDisplay: string;
  summary: string;
  playerSummary: string;
  sourceKind: 'pvp_resource_outcome';

  // Private only.
  sourceId?: string;
  metadata?: {
    source: 'pvp_attack_results.resource_outcome_json';
    rawRow: unknown;
    resourceOutcomeStatus: string | null;
    resourceOutcomeMode: string | null;
    totalLost: unknown;
    totalGained: unknown;
    sinkAmount: unknown;
  };
}
```

### Missing / no-reward shapes

No reward for a valid trial/encounter result:

```ts
interface ReportNoRewardSection {
  hasReward: false;
  title: string;
  summary: string;
  sourceLabel: string;
  entries: [];
  narrativeLines: string[];
  message: string;
}
```

Missing reward grant:

```ts
interface ReportMissingRewardSection {
  missing: true;
  hasReward: false;
  title: string;
  summary: string;
  sourceLabel: string;
  rewardGrantId?: string; // private only
  entries: [];
  message: string;
}
```

### Required / optional

Required section display fields when object exists:

```text
hasReward
title
summary
sourceLabel
entries
```

Required reward row display fields:

```text
entryKind
entryLabel
displayValue
summary
playerSummary
```

Optional/nullable by entry kind:

```text
amount
amountDisplay
resourceType
resourceLabel
itemDisplayName
effectKey
effectLabel
effectKind
effectDisplay
createdAt
```

Private-only and stripped from public:

```text
rewardGrantId
rewardProfileId
sourceId
entryId
itemId
effectDefinitionId
oldValue
newValue
metadata
pvpResourceOutcome
```

### Rendering rule

Reward has its own renderer. Do not generic-render reward entries. Use `entryKind` and display fields:

```text
experience / character_points / resource -> displayValue + summary/playerSummary
item_generation -> itemDisplayName/displayValue and item popover where safely available
exploration_effect -> effectDisplay/displayValue/playerSummary
pvp_resource_transfer -> displayValue/playerSummary
```

---

## 13. `effectSectionJson`

### Applies to

```text
reports whose reward/effect context can produce exploration effects
```

May be `null` for reports with no effect context. For encounter reports without effect it may be an object with `hasEffects=false`.

### Section shape

```ts
interface ReportEffectSection {
  hasEffects: boolean;
  title: string;
  summary: string;
  sourceLabel: string;
  effects: ReportEffectRow[];
  rewardEffectEntries: ReportRewardEffectEntryRow[];
  narrativeLines?: string[];
}
```

### Exploration effect display base

Effect rows include the canonical Exploration effect display payload. It may contain both camelCase and snake_case aliases. Angular should prefer camelCase.

```ts
interface ExplorationEffectDisplay {
  // Identity / labels.
  effectDefinitionId?: string;          // private only
  effect_definition_id?: string;        // private only alias
  effectKey: string;
  effect_key?: string;
  effectLabel: string;
  effect_label?: string;
  effectDescription?: string | null;
  effect_description?: string | null;
  effectHelperText?: string | null;
  effect_helper_text?: string | null;
  effectKind: string;
  effect_kind?: string;
  effectKindLabel: string;
  effect_kind_label?: string;

  // Display.
  title: string;
  summary: string;
  playerSummary: string;
  player_summary?: string;
  displayValue: string;
  display_value?: string;
  valueDisplay: string;
  value_display?: string;
  narrativeLines: string[];
  narrative_lines?: string[];
  descriptionLines: string[];
  description_lines?: string[];

  // Defaults / bonus metadata.
  defaultValue?: number | null;
  default_value?: number | null;
  defaultDurationSteps?: number | null;
  default_duration_steps?: number | null;
  bonusTemplateId?: string | null;       // private only
  bonus_template_id?: string | null;     // private only alias
  bonusTemplateKey?: string | null;
  bonus_template_key?: string | null;
  bonusTemplateLabel?: string | null;
  bonus_template_label?: string | null;
  bonusTemplateDescription?: string | null;
  bonus_template_description?: string | null;
  bonusTypeKey?: string | null;
  bonus_type_key?: string | null;
  bonusTypeLabel?: string | null;
  bonus_type_label?: string | null;
  effectTargetKey?: string | null;
  effect_target_key?: string | null;
  effectTargetLabel?: string | null;
  effect_target_label?: string | null;
  effectTargetDescription?: string | null;
  effect_target_description?: string | null;
  effectTargetHelperText?: string | null;
  effect_target_helper_text?: string | null;
  effectScopeKey?: string | null;
  effect_scope_key?: string | null;
  effectScopeLabel?: string | null;
  effect_scope_label?: string | null;
  definitionIsActive?: boolean;
  definition_is_active?: boolean;
}
```

### Active/consumed effect row

```ts
interface ReportEffectRow extends ExplorationEffectDisplay {
  // Private-only/internal ids. Omitted in public detail.
  effectId?: string;
  explorationId?: string;
  consumedByKind?: string | null;
  consumedById?: string | null;
  metadata?: unknown;

  status: 'active' | 'consumed' | 'inactive' | string;
  statusLabel: string;
  isActive: boolean;
  appliedAt: string | null;
  consumedAt: string | null;
}
```

### Reward effect entry row

```ts
interface ReportRewardEffectEntryRow extends ExplorationEffectDisplay {
  // Private-only/internal fields. Omitted in public detail.
  entryId?: string;
  metadata?: unknown;

  skipped: boolean;
  applied: boolean;
  reason: string | null;
  createdAt: string | null;
}
```

### Required / optional

Required section fields when object exists:

```text
hasEffects
title
summary
sourceLabel
effects
rewardEffectEntries
```

Required row display fields when an effect row exists:

```text
effectKey
effectLabel
effectKind
effectKindLabel
title
summary
playerSummary
displayValue
narrativeLines
descriptionLines
```

Private-only and stripped from public:

```text
effectDefinitionId/effect_definition_id
bonusTemplateId/bonus_template_id
effectId
explorationId
consumedByKind
consumedById
entryId
metadata
```

### Rendering rule

Effect has its own renderer. Use `displayValue`, `playerSummary`, `statusLabel`, `narrativeLines`. Do not infer effect meaning from `bonusTemplateKey` in Angular.

---

## 14. `spySectionJson`

### Applies to

```text
report.reportTypeKey = pvp_spy
```

For non-spy reports this section is `null`.

### Section shape

```ts
interface ReportSpySection {
  sectionKind: 'pvp_spy';
  sourceLabel: 'Szpiegowanie PvP' | string;
  title: string;
  summary: string;

  outcomeKey: string;
  success: boolean;
  detected: boolean;
  outcomeLabel: string;
  playerSummary: string;

  visibilityKey: string | null;
  publicRedacted: boolean;
  viewerRole: 'spy' | 'target' | 'viewer';

  // Private-only/internal ids. Omitted in public detail.
  spyResultId?: string;
  pvpActionId?: string;

  spy: {
    heroId?: string | null; // private spy-owner only; omitted/null in public and non-owner views
    level: number | null;
    roleLabel: string;
  };

  target: {
    heroId?: string | null; // private only; omitted/null in public
    displayName: string | null;
    level: number | null;
    districtCode: string | null;
    addressNumber: number | null;
    address: string | null;
  };

  // Private only. Spy owner receives full resolution; detected target may receive minimal booleans.
  resolution?: ReportSpyResolutionOwner | ReportSpyResolutionTarget;

  revealedSections: {
    baseStats: boolean;
    combatStats: boolean;
    resources: boolean;
    estate: boolean;
    buildings: boolean;
    equipment: boolean;
  };

  // Present only when `revealedSections.*` is true; otherwise stripped from JSON.
  baseStats?: ReportSpyBaseStatRow[];
  derivedCombatStats?: unknown;
  resources?: ReportSpyResourceRow[];
  estate?: unknown;
  buildings?: ReportSpyBuildingRow[];
  equipment?: ReportSpyEquipmentRow[];

  narrativeLines: string[];
}
```

### Resolution rows

```ts
interface ReportSpyResolutionOwner {
  spyCunningSnapshot: number | null;
  targetIntelligenceSnapshot: number | null;
  successChance: number | null;
  successRoll: number | null;
  detectionChance: number | null;
  detectionRoll: number | null;
  policy: unknown;
}

interface ReportSpyResolutionTarget {
  detected: boolean;
  success: boolean;
}
```

### Revealed base stat row

```ts
interface ReportSpyBaseStatRow {
  key: string;
  kind: 'base_stat';
  statKey: string;
  label: string;
  statLabel: string;
  value: number;
  finalValue: number;
  baseValue: number;
  delta: number;
  tone: 'positive' | 'negative' | 'neutral' | string;
  colorTone: 'positive' | 'negative' | 'neutral' | string;
  displayValue: string;
  baseDisplayValue: string;
  deltaDisplayValue: string;
  colorableFinalValue: true;
  sourceRows: [];
  sortOrder: number;
}
```

### Revealed resource row

```ts
interface ReportSpyResourceRow {
  resourceType: 'drachma' | 'materials' | 'workforce' | string;
  resourceLabel: string;
  amount: number;
  displayValue: string;
}
```

### Revealed equipment row

```ts
interface ReportSpyEquipmentRow {
  slotKey: string | null;
  slotLabel: string | null;
  equipmentArea: string | null;
  itemId?: string | null;     // private only
  displayName: string;
  qualityKey: string | null;
  rawSnapshot?: unknown;      // private only
}
```

### Revealed building row

```ts
interface ReportSpyBuildingRow {
  buildingId?: string | null; // private only
  buildingKey: string | null;
  buildingName: string | null;
  districtCode: string | null;
  level: number | null;
  displayValue: string;
}
```

### Missing shape

```ts
interface ReportMissingSection {
  missing: true;
  sectionKind: 'pvp_spy';
  title: string;
  summary: string;
  message: string;
  sourceLabel: string;
}
```

### Public/private differences

Private spy owner on successful spy:

```text
publicRedacted = false
viewerRole = spy
revealedSections.* may be true
baseStats/resources/equipment/buildings/estate/derivedCombatStats may be present
resolution may include rolls/chances/policy
```

Private detected target:

```text
viewerRole = target
resolution may include detected/success only
revealed intel sections are false/absent
```

Public:

```text
publicRedacted = true
viewerRole = viewer
revealedSections.* = false
baseStats/resources/equipment/buildings/estate/derivedCombatStats absent
spyResultId/pvpActionId/hero ids absent
```

### Rendering rule

Spy has its own renderer. Do not generic-render spy JSON. Render header/outcome, spy/target summary, revealed sections only when `revealedSections.<section> === true` and the matching array/object is present.

---

## 15. `relatedReportsJson[]`

### Shape

```ts
interface ReportRelatedReportRow {
  relationKind: 'child_combat_report' | 'parent_context_report' | string;

  // Private-only/internal ids. Omitted in public detail.
  reportId?: string;
  sourceEntityId?: string;

  publicToken: string | null;
  reportTypeKey: string;
  reportTypeLabel: string;
  title: string;
  sourceEntityType: string;
  createdAt: string;
}
```

### Semantics

```text
child_combat_report
- Trial/Encounter contextual report links to its lower-level combat report.

parent_context_report
- Combat report links back to its Trial/Encounter context report.
```

### Required / optional

Required display fields:

```text
relationKind
publicToken
reportTypeKey
reportTypeLabel
title
sourceEntityType
createdAt
```

Private-only and stripped from public:

```text
reportId
sourceEntityId
```

### Null handling

`relatedReportsJson` is always an array. Empty array means no related reports.

### Rendering rule

Use related-report row renderer. Use `publicToken` for public/share navigation where appropriate and `reportId` only in private report detail if present. Do not infer relation from report type in Angular; use `relationKind`.

---

## 16. Report actions

### Mark read

```sql
mark_report_read(
  p_hero_id uuid,
  p_report_id uuid
) returns jsonb
```

Shape:

```ts
interface ReportReadStateResult {
  contractVersion: 'report_read_state_v1';
  reportId: string;
  heroId: string;
  accessRole: string;
  readAt: string;
  isUnread: false;
}
```

Use this action instead of `mark_game_report_read(...)`.

### Remove from list

```sql
remove_report_from_list(
  p_hero_id uuid,
  p_report_id uuid,
  p_reason text default null,
  p_request_id text default null
) returns jsonb
```

Shape:

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

Use this action instead of `delete_game_report_for_hero(...)`.

---

## 17. Legacy/internal Reports RPC

The following functions are closed to `anon` and `authenticated` and must not be used by Angular:

```text
get_hero_game_reports(...)
get_hero_game_report_detail(...)
get_public_game_report_by_token(...)
get_hero_game_report_unread_count(...)
mark_game_report_read(...)
delete_game_report_for_hero(...)
```

They are retained as internal backing implementations for canonical wrappers.

---

## 18. Minimal Codex handoff

```text
Use the canonical Reports split contract only.

Read/copy:
- get_report_page_copy()
- get_report_list_page(p_hero_id, p_limit, p_offset, p_report_type_key, p_unread_only)
- get_report_detail(p_hero_id, p_report_id)
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
- direct report tables
- generic recursive JSON renderers

Report detail renderer:
- render common report shell from report.title, report.summary, report.sourceLabel, report.createdAt;
- render each section using the exact section contract from this guide;
- no arbitrary JSON scan;
- no Angular inference for combat/reward/effect/spy/trial/encounter outcome;
- no local fallback copy for missing display labels.

Post-gameplay handoff:
- if a workflow result contains game_report_id, route/open canonical private report detail;
- load get_report_detail(activeHeroId, game_report_id);
- do not render a separate transient report UI when durable report exists.
```

---

## 19. Verified sandbox state

Latest verified DB/RPC state:

```text
Canonical grants:
- get_report_page_copy: anon/authenticated
- get_report_list_page: authenticated only
- get_report_detail: authenticated only
- get_public_report_detail: anon/authenticated
- mark_report_read: authenticated only
- remove_report_from_list: authenticated only

Legacy Reports RPC:
- get_hero_game_reports: closed
- get_hero_game_report_detail: closed
- get_public_game_report_by_token: closed
- get_hero_game_report_unread_count: closed
- mark_game_report_read: closed
- delete_game_report_for_hero: closed

Table privileges:
- no anon/auth direct select/insert/update on game_reports
- no anon/auth direct select/insert/update on game_report_hero_access
- no anon/auth direct select/insert/update on game_report_participants
- no anon/auth direct select/insert/update on game_report_item_references
- no anon/auth direct select/insert/update on game_report_types
```

Final matrix smoke passed for:

```text
combat
trial
encounter
pvp_combat
pvp_spy
```

For every verified report type:

```text
private detail contractVersion = report_detail_v1
public detail contractVersion = report_detail_v1
private report core keys == public report core keys
section JSON types match between private and public
public detail has no private fields
```
