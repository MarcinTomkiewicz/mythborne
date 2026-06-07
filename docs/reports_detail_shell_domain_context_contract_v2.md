# Mythsworn Reports — Report Detail Shell + Domain Context Contract v2

Status: **DB/RPC migration applied, frontend contract pending reviewer/Codex handoff**  
Scope: **Reports detail shell context + domain-context routing contract + Reports copy v2**  
Out of scope: Reports Center v2 list RPC, `mark_all_reports_read(...)`, domain copy for Exploration/PvP/Combat/Spy/Argonautics, domain renderer implementation.

## 0. Reviewer handoff summary

Reports detail must remain a thin wrapper. It must not become a second renderer for Exploration/PvP/Spy/Combat content.

Frontend Reports detail should render:

1. Report shell/header/actions owned by Reports.
2. Domain content owned by the source domain renderer, selected using `domainContextJson`.
3. Existing persisted report snapshot content when domain private reads are not allowed, especially in public reports.

Reports copy must only cover Reports Center list/archive, filters, preview, pagination, actions, and the thin report shell. It must not duplicate Exploration/PvP/Combat/Reward/Spy/Argonautics narrative or result copy.

The migration added:

- `build_report_domain_context_json(p_report_id uuid, p_public_safe boolean default false) returns jsonb`
- `build_report_shell_context_json(p_report_id uuid, p_public_safe boolean default false) returns jsonb`
- `get_report_detail(p_hero_id uuid, p_report_id uuid) returns jsonb`, now returning `report_detail_v2`
- `get_public_report_detail(p_public_token text) returns jsonb`, now returning `report_detail_v2`
- `get_report_page_copy() returns jsonb`, now returning `report_page_copy_v2` with legacy v1 keys preserved

Codex must not call `build_report_domain_context_json(...)` or `build_report_shell_context_json(...)` directly. Both are internal and not granted to `anon` or `authenticated`. Codex consumes `domainContextJson` and `reportShellContextJson` through `get_report_detail(...)` and `get_public_report_detail(...)`.

## 1. Hard rules for Codex / Frontend

- Do not render report detail through generic Reports sections such as Participants, Items, Effects, Related Reports, or Rewards when a source-domain renderer owns that content.
- Do not reconstruct rewards from `rewardSectionJson` or `itemReferencesJson` inside a Reports-specific adapter.
- Do not translate or repair domain title/summary/narrative locally in Angular.
- Do not use legacy `report.reportTypeLabel`, `report.title`, `report.summary`, or `report.sourceLabel` for the top report shell/header. Use `reportShellContextJson`.
- Do not call private hero-owned domain RPCs from public report pages.
- Do not guess missing source IDs. If `missingContextReason` is non-null in private mode, report a DB/RPC blocker or follow-up.
- Do not treat public redaction as missing data. Public mode intentionally nulls source IDs.
- Do not use legacy `detail.sections.*` copy to create new report detail UI.
- Keep private `access.isUnread/readAt` as logic state only; do not show read state in report detail meta.
- Generated Supabase types will only say `jsonb`; this document is the authoritative recursive JSON contract.

## 2. RPC inventory and grants

| RPC | Return | Grants | Purpose |
|---|---|---|---|
| `get_report_detail(p_hero_id uuid, p_report_id uuid)` | `jsonb` | `authenticated` | Private report detail. Returns private access state, `domainContextJson`, `reportShellContextJson`, and report content snapshot. |
| `get_public_report_detail(p_public_token text)` | `jsonb` | `anon`, `authenticated` | Public report detail. Returns public-safe `domainContextJson`, `reportShellContextJson`, redacted source IDs, and report content snapshot. |
| `get_report_page_copy()` | `jsonb` | `anon`, `authenticated` | DB-owned copy for Reports Center and report shell. V2 adds new copy while preserving legacy keys. |
| `build_report_domain_context_json(p_report_id uuid, p_public_safe boolean default false)` | `jsonb` | no frontend grants | Internal helper used by detail RPCs only. |
| `build_report_shell_context_json(p_report_id uuid, p_public_safe boolean default false)` | `jsonb` | no frontend grants | Internal helper used by detail RPCs only. Builds player-facing shell/header context so frontend does not use legacy report fields as shell copy. |

## 3. Private report detail RPC

### Signature

```sql
get_report_detail(
  p_hero_id uuid,
  p_report_id uuid
) returns jsonb
```

### Top-level return

```ts
interface ReportDetailV2 {
  contractVersion: 'report_detail_v2';
  access: ReportAccessPrivate;
  domainContextJson: ReportDomainContextV1;
  reportShellContextJson: ReportShellContextV1;
  report: ReportContentSnapshotV1;
}
```

### Private access envelope

```ts
interface ReportAccessPrivate {
  visibility: 'private';
  heroId: string;
  reportId: string;
  accessRole: 'owner' | 'participant' | 'viewer' | string;
  isUnread: boolean;
  readAt: string | null;
}
```

### Private behavior

- Authenticated hero access is enforced DB-side.
- `domainContextJson.frontendUsage.canUsePrivateDomainReads` should be `true`.
- `domainContextJson.frontendUsage.sourceIdsRedacted` should be `false`.
- Source IDs may be present and may be used only through owner-safe/domain RPCs.
- The RPC does not mark the report as read.

## 4. Public report detail RPC

### Signature

```sql
get_public_report_detail(
  p_public_token text
) returns jsonb
```

### Available report return

```ts
interface PublicReportDetailV2Available {
  contractVersion: 'report_detail_v2';
  access: ReportAccessPublicAvailable;
  domainContextJson: ReportDomainContextV1;
  reportShellContextJson: ReportShellContextV1;
  report: ReportContentSnapshotV1;
}
```

```ts
interface ReportAccessPublicAvailable {
  visibility: 'public';
  isPublic: true;
  publicToken: string;
  isAvailable: true;
}
```

### Unavailable report return

```ts
interface PublicReportDetailV2Unavailable {
  contractVersion: 'report_detail_v2';
  access: ReportAccessPublicUnavailable;
  domainContextJson: null;
  reportShellContextJson: null;
  report: null;
}
```

```ts
interface ReportAccessPublicUnavailable {
  visibility: 'public';
  isPublic: true;
  publicToken: string | null;
  isAvailable: false;
  notFoundKey: 'public_report_not_found';
  notFoundLabel: string;
}
```

### Public behavior

- Public detail is safe for anonymous users.
- Public detail must not expose source-domain UUIDs.
- Public `domainContextJson.frontendUsage.canUsePrivateDomainReads` must be `false`.
- Public `domainContextJson.frontendUsage.shouldRenderFromReportSnapshot` must be `true`.
- Public `domainContextJson.frontendUsage.sourceIdsRedacted` must be `true`.
- Public renderer must use the returned report snapshot content, not private source-domain RPCs.

## 5. Report shell context

Located at `payload.reportShellContextJson`.

This object is the source of truth for the top report shell/header. It exists specifically so the frontend does not use legacy `report.reportTypeLabel`, `report.title`, `report.summary`, or `report.sourceLabel` as shell copy.

```ts
interface ReportShellContextV1 {
  contractVersion: 'report_shell_context_v1';

  eyebrow: string;
  title: string;
  summary: string | null;

  source: ReportShellSource;
  eventType: ReportShellEventType;
  reportDate: ReportShellDate;

  legacyReportSnapshot: ReportShellLegacySnapshot;
  missingShellContextReason: string | null;
}
```

### `ReportShellSource`

```ts
interface ReportShellSource {
  key:
    | 'exploration'
    | 'pvp'
    | 'spy'
    | 'combat'
    | 'trade'
    | 'auction'
    | 'siege'
    | 'argonautics'
    | 'unknown'
    | string;
  label: string;
}
```

Meaning:

- `source.label` is the high-level source/domain displayed in the shell, for example `Eksploracja`, `PvP`, `Szpiegowanie`, `Oblężenie`, future `Argonautics`.
- It is not the same as legacy `report.sourceLabel`.

### `ReportShellEventType`

```ts
interface ReportShellEventType {
  key:
    | 'trial'
    | 'combat'
    | 'spy'
    | 'encounter'
    | 'resource'
    | 'buff'
    | 'debuff'
    | 'nothing'
    | 'known_path'
    | 'backtrack'
    | 'unknown'
    | string;
  label: string;
}
```

Meaning:

- `eventType.label` is the concrete kind displayed in the shell, for example `Próba`, `Walka`, `Szpiegowanie`, `Omen`, `Zasadzka`, `Znalezisko`, `Błogosławieństwo`, `Klątwa`.
- Do not use `report.reportTypeLabel` for this.

### `ReportShellDate`

```ts
interface ReportShellDate {
  value: string | null;
  displayValue: string | null;
}
```

Meaning:

- `value` is the underlying report timestamp.
- `displayValue` is the DB-formatted player-facing date for shell display.

### `ReportShellLegacySnapshot`

```ts
interface ReportShellLegacySnapshot {
  reportTypeKey: string | null;
  sourceEntityType: string | null;
  title: string | null;
  summary: string | null;
  hiddenFromShell: true;
}
```

Meaning:

- This exists to make it explicit that legacy report title/summary/type are still part of the persisted report snapshot.
- New shell/header UI must not display these fields as shell copy when `hiddenFromShell=true`.
- These fields may remain available for diagnostics and backwards compatibility.

### Shell rendering rules

Use these fields in the top report shell:

```ts
const shell = payload.reportShellContextJson;

eyebrow = shell.eyebrow;
title = shell.title;
summary = shell.summary; // render only when non-null
sourceValue = shell.source.label;
eventTypeValue = shell.eventType.label;
reportDateValue = shell.reportDate.displayValue;
```

Do not use these legacy fields for the top shell:

```ts
payload.report.reportTypeLabel;
payload.report.title;
payload.report.summary;
payload.report.sourceLabel;
payload.access.isUnread;
payload.access.readAt;
```

If `reportShellContextJson` is missing in a private report after this migration, treat it as a DB/RPC contract blocker. Do not silently fall back to `Trial report: ...` or `Combat report: ...` in the player-facing shell.

## 6. Report content snapshot

Located at `payload.report`.

```ts
interface ReportContentSnapshotV1 {
  publicToken: string | null;

  reportTypeKey: string;
  reportTypeLabel: string;
  reportTypeDescription: string | null;

  title: string;
  summary: string | null;
  sourceLabel: string | null;
  sourceEntityType: string | null;

  createdAt: string;

  participantsJson: ReportParticipantSnapshot[];
  itemReferencesJson: ReportItemReferenceSnapshot[];

  spySectionJson: SpySectionSnapshot | null;
  trialSectionJson: TrialSectionSnapshot | null;
  encounterSectionJson: EncounterSectionSnapshot | null;
  combatSectionJson: CombatSectionSnapshot | null;
  rewardSectionJson: RewardSectionSnapshot | null;
  effectSectionJson: EffectSectionSnapshot | null;
  relatedReportsJson: RelatedReportSnapshot[];
}
```

### Important report content rules

- `title` and `summary` may still contain legacy/domain copy such as English technical titles until source-domain producers are fixed.
- Reports copy must not patch or replace domain title/summary locally.
- `spySectionJson`, `trialSectionJson`, `encounterSectionJson`, `effectSectionJson` are domain-owned/opaque unless a source-domain contract says otherwise.
- Reports code must not introspect opaque sections to invent UI.
- `combatSectionJson` can be passed to existing combat presentation.
- `rewardSectionJson` can be passed to a domain/shared reward renderer if one owns that exact shape; Reports must not build a new reward adapter.

## 7. Participant snapshot

Located at `report.participantsJson[]`.

```ts
interface ReportParticipantSnapshot {
  heroId: string | null;
  sideLabel: string | null;
  sortOrder: number | null;
  displayName: string;
  levelSnapshot: number | null;
  participantRole: string | null;
}
```

Usage:

- List/preview may use this as lightweight hint.
- Full report detail must not render this as a generic Participants section when Combat/PvP/Exploration owns participants.

## 8. Related report snapshot

Located at `report.relatedReportsJson[]`.

```ts
interface RelatedReportSnapshot {
  reportId: string;
  publicToken: string | null;
  reportTypeKey: string;
  reportTypeLabel: string | null;
  sourceEntityType: string | null;
  sourceEntityId: string | null;
  title: string;
  createdAt: string;
  relationKind: 'parent_context_report' | 'child_combat_report' | string;
}
```

Usage:

- `relationKind='parent_context_report'` means a low-level combat report belongs to a parent contextual report.
- `relationKind='child_combat_report'` means the current contextual report embeds/owns a child combat report.
- Reports Center v2 should not promote child combat reports as primary list rows when parent context exists.
- Full report detail should not render generic Related Reports by default.

## 9. Item reference snapshot

Located at `report.itemReferencesJson[]`.

```ts
interface ReportItemReferenceSnapshot {
  [key: string]: unknown;
}
```

Usage:

- This is a report snapshot reference, not necessarily full popover-ready item detail.
- Reports must not build item popovers from this unless a domain/shared item popover contract explicitly supports the exact shape.

## 10. Combat section snapshot

Located at `report.combatSectionJson`.

```ts
interface CombatSectionSnapshot {
  title: string | null;
  summary: string | null;

  combatResultId: string | null;
  pvpAttackResultId?: string | null;

  sourceType: string | null;
  sourceTypeLabel: string | null;
  sourceLabel: string | null;

  outcome: string | null;
  outcomeLabel: string | null;
  pvpOutcome?: string | null;

  winnerSide: string | null;
  winnerSideLabel: string | null;
  loserSide: string | null;
  loserSideLabel: string | null;

  startedAt: string | null;
  completedAt: string | null;
  turnsCompleted: number | null;

  narrativeLines: string[];

  participants: CombatParticipantSnapshot[];
  attacks: CombatAttackSnapshot[];
}
```

### Combat participant snapshot

```ts
interface CombatParticipantSnapshot {
  participantId: string;
  participantKind: 'hero' | 'opponent' | string;
  participantKindLabel: string | null;

  heroId: string | null;
  side: 'initiator' | 'defender' | string;
  sideLabel: string | null;

  displayName: string;
  level: number | null;

  healthStart: number | null;
  healthCurrent: number | null;
  healthEnd: number | null;
  healthMax: number | null;
  maxHealth: number | null;

  defense: number | null;
  minDamage: number | null;
  maxDamage: number | null;

  criticalChance: number | null;
  criticalDamage: number | null;
  evasionChance: number | null;
  luck: number | null;

  stats: CombatSimpleStatRow[];
  baseStatRows: CombatDisplayStatRow[];
  combatStatRows: CombatDisplayStatRow[];
}
```

### Combat simple stat row

```ts
interface CombatSimpleStatRow {
  statKey: string;
  statLabel: string;
  statValue: number;
}
```

### Combat display stat row

```ts
interface CombatDisplayStatRow {
  key: string;
  kind: 'base_stat' | 'combat_stat' | string;
  statKey: string;
  label: string;

  value: number;
  baseValue: number;
  finalValue: number;
  delta: number;

  displayValue: string;
  baseDisplayValue: string;
  deltaDisplayValue: string;

  tone: 'neutral' | 'positive' | 'negative' | string;
  unit?: 'number' | 'percent' | 'count' | string;

  sortOrder: number;
  hasBonus?: boolean;
  hasModifier?: boolean;
  colorableFinalValue?: boolean;

  sourceRows: unknown[];
  modifierSources: unknown[];
}
```

### Combat attack snapshot

```ts
interface CombatAttackSnapshot {
  attackId: string;

  turnNumber: number;
  attackOrder: number;
  attackSlotIndex: number | null;

  actorSide: string;
  actorSideLabel: string | null;
  actorDisplayName: string;

  targetSide: string;
  targetSideLabel: string | null;
  targetDisplayName: string;

  attackSourceKind: string | null;
  attackSourceKindLabel: string | null;
  attackSourceLabel: string | null;

  timingHit: boolean | null;
  hit?: boolean | null;
  evaded: boolean;
  critical: boolean;

  rolledDamage: number | null;
  finalDamage: number | null;
  criticalDamage: number | null;

  targetHealthBefore: number | null;
  targetHealthAfter: number | null;

  eventLabel: string | null;
  presentationKind: 'hit' | 'miss' | string;
  tone: 'neutral' | 'positive' | 'negative' | string;

  displayText: string;
  detailText: string | null;
  summary: string | null;

  damageDisplay?: string;
  resultDisplay?: string;

  createdAt: string | null;
}
```

Usage:

- Existing Combat renderer owns display of combat cards/log/timeline.
- Reports detail must not implement a second combat renderer.
- Reports detail must not locally translate combat attacks or outcomes.

## 11. Reward section snapshot

Located at `report.rewardSectionJson`.

```ts
interface RewardSectionSnapshot {
  title: string | null;
  summary: string | null;
  reason: string | null;
  status: string | null;

  sourceKind: string | null;
  sourceId: string | null;
  sourceLabel: string | null;

  hasReward: boolean;
  entryCount: number;
  grantedAt: string | null;

  rewardGrantId: string | null;
  rewardProfileId: string | null;

  narrativeLines: string[];

  entries: RewardEntrySnapshot[];

  pvpResourceOutcome?: PvpResourceOutcomeSnapshot | null;
}
```

### Reward entry snapshot

```ts
interface RewardEntrySnapshot {
  entryId?: string;
  entryKind: string;
  entryLabel: string;

  amount?: number;
  amountDisplay?: string;
  displayValue?: string;
  playerSummary?: string;
  summary?: string;

  sourceKind?: string;
  sourceId?: string;

  rewardGrantId?: string;
  createdAt?: string;

  metadata?: Record<string, unknown>;

  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;

  resourceType?: string;
  gainAmount?: number;
  lossAmount?: number;
  sinkAmount?: number;
}
```

### PvP resource outcome snapshot

```ts
interface PvpResourceOutcomeSnapshot {
  mode: string;
  status: string;
  percent: number | null;

  appliedAt: string | null;
  requestId: string | null;

  totalLost: number;
  totalGained: number;
  sinkAmount: number;

  resourceTypes: string[];

  resources: PvpResourceTransferRow[];

  formulaTarget: string | null;
  formulaContext: Record<string, unknown>;

  boundary: {
    noItems: boolean;
    noBuildings: boolean;
    noCharacterPoints: boolean;
    noEstateOwnership: boolean;
  };

  runtimeSettlement: {
    attackerHeroId: string | null;
    defenderHeroId: string | null;
    attackerEstateId: string | null;
    defenderEstateId: string | null;
    attackerSettledAsOf: string | null;
    defenderSettledAsOf: string | null;
    attackerCompletedCount: number | null;
    defenderCompletedCount: number | null;
  };
}
```

### PvP resource transfer row

```ts
interface PvpResourceTransferRow {
  resourceType: string;
  percent: number;
  lostAmount: number;
  gainedAmount: number;
  balanceBefore: number;
  gainBalanceAfter: number;
  lossBalanceAfter: number;
  gainHeroId: string;
  lossHeroId: string;
}
```

Usage:

- Private Exploration detail may use domain context source IDs to call native reward read RPCs.
- Public detail must render from report snapshot only.
- Reports copy does not own reward text.
- Reports detail must not build local reward adapters from this shape unless a domain/shared reward renderer already owns it.

## 12. Opaque source-domain sections

These fields exist but are not Reports-owned contracts:

```ts
interface SpySectionSnapshot {
  [key: string]: unknown;
}

interface TrialSectionSnapshot {
  [key: string]: unknown;
}

interface EncounterSectionSnapshot {
  [key: string]: unknown;
}

interface EffectSectionSnapshot {
  [key: string]: unknown;
}
```

Rules:

- Codex must not inspect these fields in Reports UI unless the corresponding source-domain contract is provided.
- Source-domain renderers may own and interpret them.
- Reports shell must not create generic sections from them by default.

## 12. Domain context v1

Located at `payload.domainContextJson`.

```ts
interface ReportDomainContextV1 {
  contractVersion: 'report_domain_context_v1';

  reportDomainKey: ReportDomainKey;
  contentKind: ReportContentKind;
  resultKind: string | null;

  gameReportId: string | null;
  publicToken: string | null;

  reportTypeKey: string | null;
  sourceEntityType: string | null;
  sourceEntityId: string | null;

  frontendUsage: ReportDomainFrontendUsage;

  exploration: ExplorationReportDomainContext | null;
  pvp: PvpReportDomainContext | null;
  spy: SpyReportDomainContext | null;
  combat: CombatReportDomainContext | null;

  missingContextReason: MissingContextReason | null;
}
```

### Domain keys

```ts
type ReportDomainKey =
  | 'exploration'
  | 'pvp'
  | 'spy'
  | 'combat'
  | 'trade'
  | 'auction'
  | 'siege'
  | 'argonautics'
  | 'unknown';
```

Current helper produces:

- `exploration`
- `pvp`
- `spy`
- `combat`
- `unknown`

Future-reserved:

- `trade`
- `auction`
- `siege`
- `argonautics`

### Content kinds

```ts
type ReportContentKind =
  | 'exploration_trial'
  | 'exploration_encounter'
  | 'exploration_combat_encounter'
  | 'exploration_challenge'
  | 'exploration_step'
  | 'pvp_combat'
  | 'pvp_spy'
  | 'combat'
  | 'trade'
  | 'auction'
  | 'siege'
  | 'argonautics'
  | 'unknown';
```

Current helper produces:

- `exploration_trial`
- `exploration_combat_encounter`
- `exploration_challenge`
- `exploration_step`
- `pvp_combat`
- `pvp_spy`
- `combat`
- `unknown`

### Frontend usage

```ts
interface ReportDomainFrontendUsage {
  contentAccessMode: 'private_source_context' | 'report_snapshot_only';
  canUsePrivateDomainReads: boolean;
  shouldRenderFromReportSnapshot: boolean;
  sourceIdsRedacted: boolean;
}
```

Private expected:

```ts
{
  contentAccessMode: 'private_source_context',
  canUsePrivateDomainReads: true,
  shouldRenderFromReportSnapshot: false,
  sourceIdsRedacted: false
}
```

Public expected:

```ts
{
  contentAccessMode: 'report_snapshot_only',
  canUsePrivateDomainReads: false,
  shouldRenderFromReportSnapshot: true,
  sourceIdsRedacted: true
}
```

## 13. Exploration domain context

Located at `domainContextJson.exploration` when `reportDomainKey='exploration'`.

```ts
interface ExplorationReportDomainContext {
  explorationId: string | null;
  challengeAttemptId: string | null;
  stepId: string | null;
  combatResultId: string | null;

  rewardSourceKind: 'challenge_attempt' | 'step' | null;

  challengeKind: string | null;
  challengeStatus: string | null;
  challengeSuccess: boolean | null;
  completionMode: string | null;

  stepOutcomeKind: string | null;
}
```

### Private challenge-based exploration report

Expected when a trial/challenge report is available privately:

```ts
{
  explorationId: string;
  challengeAttemptId: string;
  stepId: string | null;
  combatResultId: string | null;
  rewardSourceKind: 'challenge_attempt';
  challengeKind: string;
  challengeStatus: string;
  challengeSuccess: boolean | null;
  completionMode: string | null;
  stepOutcomeKind: null;
}
```

### Private step-based exploration report

Expected when the report is based on an exploration step:

```ts
{
  explorationId: string;
  challengeAttemptId: null;
  stepId: string;
  combatResultId: null;
  rewardSourceKind: 'step';
  challengeKind: null;
  challengeStatus: null;
  challengeSuccess: null;
  completionMode: null;
  stepOutcomeKind: string | null;
}
```

### Public exploration report

Expected public redacted behavior:

```ts
{
  explorationId: null;
  challengeAttemptId: null;
  stepId: null;
  combatResultId: null;
  rewardSourceKind: 'challenge_attempt' | 'step' | null;
  challengeKind: string | null;
  challengeStatus: string | null;
  challengeSuccess: boolean | null;
  completionMode: string | null;
  stepOutcomeKind: string | null;
}
```

Frontend rules:

- Private report mode may call existing exploration reward read-model RPCs when IDs are present.
- Public report mode must not call those private reward RPCs.
- If private `rewardSourceKind='challenge_attempt'` and `challengeAttemptId=null`, that is a DB/RPC gap.
- If private `rewardSourceKind='step'` and `stepId=null`, that is a DB/RPC gap.

## 14. PvP domain context

Located at `domainContextJson.pvp` when `reportDomainKey='pvp'`.

```ts
interface PvpReportDomainContext {
  pvpActionId: string | null;
  pvpAttackResultId: string | null;
  combatResultId: string | null;
  sourceKind: 'pvp_attack' | 'pvp_spy' | null;
  outcomeKey: string | null;
}
```

Private expected for PvP combat:

```ts
{
  pvpActionId: string | null;
  pvpAttackResultId: string;
  combatResultId: string | null;
  sourceKind: 'pvp_attack';
  outcomeKey: string;
}
```

Public expected for PvP combat:

```ts
{
  pvpActionId: null;
  pvpAttackResultId: null;
  combatResultId: null;
  sourceKind: 'pvp_attack' | null;
  outcomeKey: string | null;
}
```

Frontend rules:

- Private PvP report detail may use IDs through owner-safe PvP domain RPCs only.
- Public PvP report detail renders from report snapshot only.
- PvP copy and result narrative are PvP-domain responsibilities, not Reports copy.

## 15. Spy domain context

Located at `domainContextJson.spy` when `reportDomainKey='spy'`.

```ts
interface SpyReportDomainContext {
  pvpSpyResultId: string | null;
  pvpActionId: string | null;
  outcomeKey: string | null;
  success: boolean | null;
  detected: boolean | null;
}
```

Private expected:

```ts
{
  pvpSpyResultId: string;
  pvpActionId: string | null;
  outcomeKey: string;
  success: boolean;
  detected: boolean;
}
```

Public expected:

```ts
{
  pvpSpyResultId: null;
  pvpActionId: null;
  outcomeKey: string | null;
  success: boolean | null;
  detected: boolean | null;
}
```

Frontend rules:

- Spy result renderer owns spy copy and snapshot display.
- Reports copy must not recreate spy result text.

## 16. Combat domain context

Located at `domainContextJson.combat` when combat is relevant.

```ts
interface CombatReportDomainContext {
  combatResultId: string | null;
  sourceType: string | null;
  sourceEntityId: string | null;

  parentReportId: string | null;
  parentPublicToken: string | null;
  isChildCombatReport: boolean;
}
```

Private expected:

- `combatResultId` present when report includes combat.
- `sourceType` may be `trial`, `encounter`, `pvp`, `sandbox`, `admin_test`, or future values.
- `sourceEntityId` present in private mode when known.
- `parentReportId` present for low-level child combat reports that have a contextual parent report.
- `isChildCombatReport=true` means report should not be promoted as a primary Reports Center list row once list v2 supports that policy.

Public expected:

- source UUID fields are null.
- `isChildCombatReport` may remain as safe boolean.

## 17. Missing context reason

```ts
type MissingContextReason =
  | 'report_id_required'
  | 'report_not_found'
  | 'pvp_spy_result_not_found'
  | 'pvp_attack_result_not_found'
  | 'exploration_source_context_not_found'
  | 'combat_result_not_found'
  | 'unsupported_report_domain'
  | string;
```

Rules:

- `null` means no known context gap.
- Non-null in private detail means Codex must not guess missing IDs.
- Public redaction is not a missing context reason.

## 18. Reports copy v2

Returned by `get_report_page_copy()`.

```ts
interface ReportPageCopyV2 {
  contractVersion: 'report_page_copy_v2';
  reportsCenter: ReportsCenterCopyV2;
  reportShell: ReportShellCopyV2;
  detail: LegacyReportDetailCopyV1;
  publicReport: LegacyPublicReportCopyV1;
  labels: LegacyReportLabelsV1;
  pagination: LegacyReportPaginationCopyV1;
}
```

### Reports Center copy

```ts
interface ReportsCenterCopyV2 {
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
    eventTypeLabel: string;
    readModeLabel: string;
    timeRangeLabel: string;

    reportTypeLabel: string;
    unreadOnlyLabel: string;
    allTypesLabel: string;
  };

  filterOptions: {
    eventTypes: {
      all: string;
      exploration: string;
      combat: string;
      spy: string;
      trade: string;
      auction: string;
      siege: string;
    };
    readModes: {
      unreadFirst: string;
      all: string;
      unreadOnly: string;
      readOnly: string;
    };
    timeRanges: {
      last7Days: string;
      last30Days: string;
      allTime: string;
    };
  };

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
    emptyTitle: string;
    emptyText: string;
    titleFallback: string;
    sourceLabel: string;
    eventTypeLabel: string;
    reportDateLabel: string;
    rewardLabel: string;
    openAction: string;
    copyLinkAction: string;
  };

  actions: {
    markAllRead: {
      label: string;
      disabledTooltip: string;
      confirmTitle: string;
      confirmText: string;
      successText: string;
    };
  };
}
```

### Report shell copy

```ts
interface ReportShellCopyV2 {
  header: {
    titleFallback: string;
    backAction: string;
    copyLinkAction: string;
    removeAction: string;
  };

  meta: {
    sourceLabel: string;
    eventTypeLabel: string;
    reportDateLabel: string;
  };

  public: {
    titleFallback: string;
    notFoundTitle: string;
    notFoundText: string;
  };

  feedback: {
    copyLinkSuccess: string;
    removeSuccess: string;
    markReadSuccess: string;
  };
}
```

### Legacy copy retained

Legacy keys remain temporarily:

- `detail.header.*`
- `detail.sections.*`
- `detail.empty.*`
- `publicReport.header.*`
- `publicReport.privacy.publicBoundaryText`
- `labels.*`
- `pagination.rangeTemplate`

New UI should prefer `reportsCenter` and `reportShell` keys. Legacy keys exist only for transition.

## 19. Verification coverage and data-blocked policy

Verified from current smoke:

- Function signatures and grants exist for helper/detail/copy RPCs.
- `get_report_page_copy()` returns `report_page_copy_v2` and preserves legacy keys.
- Private exploration report with combat returns:
  - `reportDomainKey='exploration'`
  - `contentKind='exploration_trial'`
  - `resultKind='trial_failure'`
  - `challengeAttemptId`
  - `stepId`
  - `combatResultId`
  - `rewardSourceKind='challenge_attempt'`
- Private step-based exploration report returns:
  - `contentKind='exploration_step'`
  - `rewardSourceKind='step'`
  - `stepId`
- Public exploration reports return redacted IDs and `report_snapshot_only` usage.

Still requires representative data/smoke when available:

- Private PvP combat `domainContextJson.pvp` branch.
- Public PvP combat redacted branch.
- Private spy `domainContextJson.spy` branch.
- Public spy redacted branch.
- Standalone combat branch.
- Child combat report with `isChildCombatReport=true` after this migration.
- Not-found public report payload.
- Unsupported/future domain branch.

Codex/reviewer rule:

- If representative data does not exist for a branch, mark the smoke as `data-blocked`.
- Do not infer a branch works merely because another branch works.
- Do not omit fields from TypeScript/domain models because a branch was absent in test data.
- If a branch is untested due to no data, the contract still stands; UI must handle it defensively as specified.

## 20. Codex implementation boundary

Codex task derived from this contract should be limited to frontend consumption and renderer routing.

Codex should:

- read `get_report_page_copy()` v2 keys;
- use `get_report_detail(...)` / `get_public_report_detail(...)` v2;
- use `domainContextJson` to select source-domain renderer/report mode;
- keep report shell separate from source-domain content;
- hide read state from detail meta;
- not render generic empty sections;
- not build local reward/item/combat/domain adapters;
- report missing source-domain renderer support as a blocker/follow-up instead of guessing.

Codex should not:

- edit generated database types;
- regenerate generated database types;
- direct-read source tables;
- call internal helper `build_report_domain_context_json(...)`;
- create a generic report-section renderer;
- create one bespoke component per report type;
- add local Polish fallback copy for domain content.
