# Mythsworn Reports - Report Detail Shell + Domain Context Contract v3.1

Status: DB/RPC contract after report detail shell/domain context v2, Reports copy v3 and pvp.result read-model exposure work  
Audience: Codex, Reviewer, Migrator  
Scope: private/public report detail shell, domain-context routing, parent/child contextual report handling, report content snapshot usage, Reports copy v3 integration, and pvp.result snapshot pass-through for PvP combat reports  
Out of scope: Reports Center list/root context, source-domain renderer implementation, source-domain result narrative/reward/effect copy authoring

---

## 0. Handoff summary

Report detail is a thin wrapper. It must not become a second renderer for Exploration, PvP, Spy or Combat content.

Report detail renders:

1. Report shell/header/actions owned by Reports.
2. Domain content owned by the source-domain renderer, selected using `domainContextJson`.
3. Existing persisted report snapshot content when domain private reads are not allowed, especially in public reports.
4. For PvP combat reports, the already-built source-domain `pvp.result` snapshot exposed as `domainContextJson.pvpResult`.

Reports copy is now locale-backed:

```sql
get_report_page_copy(p_locale text default 'pl') returns jsonb
```

Current copy contract:

```ts
contractVersion: 'report_page_copy_v3'
```

The copy RPC covers Reports Center and thin report shell only. It must not duplicate Exploration/PvP/Combat/Reward/Spy/Argonautics result narratives.

PvP combat result text is owned by `pvp.result`, not Reports copy and not legacy PvP report copy. Report detail only passes the `pvpResult` snapshot through to frontend.

---

## 1. Hard rules for Codex / Frontend

- Do not render report detail through generic Reports sections such as Participants, Items, Effects, Related Reports or Rewards when a source-domain renderer owns that content.
- Do not reconstruct rewards from `rewardSectionJson` or `itemReferencesJson` inside a Reports-specific adapter.
- Do not translate or repair domain title/summary/narrative locally in Angular.
- Do not use legacy `report.reportTypeLabel`, `report.title`, `report.summary` or `report.sourceLabel` for the top report shell/header. Use `reportShellContextJson`.
- Do not call private hero-owned domain RPCs from public report pages.
- Do not guess missing source IDs. If `missingContextReason` is non-null in private mode, report a DB/RPC blocker or follow-up.
- Do not treat public redaction as missing data. Public mode intentionally nulls source IDs.
- Do not use legacy `detail.sections.*` copy to create a new report detail UI.
- Keep private `access.isUnread/readAt` as logic state only; do not show read state in report detail meta.
- Use `get_report_page_copy(locale).reportShell` for shell labels/actions.
- For PvP combat reports, use `domainContextJson.pvpResult` as the final PvP result source when present.
- Do not use legacy `get_pvp_report_copy` / `get_public_pvp_report_copy` fields as the primary final PvP result source once `pvpResult` is exposed.
- Do not direct-read `pvp_attack_results` from Angular to obtain `pvpResult`.
- Generated Supabase types will only say `jsonb`; this document is the authoritative recursive JSON contract.

---

## 2. RPC inventory and grants

| RPC | Return | Grants | Purpose |
|---|---|---|---|
| `get_report_detail(p_hero_id uuid, p_report_id uuid)` | `jsonb` | `authenticated` | Private report detail wrapper. Calls `get_report_detail_legacy_v1(...)`, then attaches `domainContextJson.pvpResult` for PvP combat reports. |
| `get_public_report_detail(p_public_token text)` | `jsonb` | `anon`, `authenticated` | Public report detail wrapper. Calls `get_public_report_detail_legacy_v1(...)`, then attaches public-safe `domainContextJson.pvpResult.public.neutral` for public PvP combat reports. |
| `get_report_page_copy(p_locale text default 'pl')` | `jsonb` | `anon`, `authenticated` | Locale-backed DB copy for Reports Center and report shell. Unsupported locales fall back to `en`. |
| `build_report_domain_context_json(p_report_id uuid, p_public_safe boolean default false)` | `jsonb` | no frontend grants | Internal helper used by legacy detail implementations only. |
| `build_report_shell_context_json(p_report_id uuid, p_public_safe boolean default false)` | `jsonb` | no frontend grants | Internal helper used by legacy detail implementations only. |
| `attach_pvp_result_to_report_detail_payload(p_payload jsonb, p_report_id uuid, p_public_token text)` | `jsonb` | no frontend grants | Internal read-model helper. Attaches `pvp_attack_results.report_context_json.pvpResult` to report detail payload `domainContextJson` for PvP combat reports. |
| `get_report_detail_legacy_v1(p_hero_id uuid, p_report_id uuid)` | `jsonb` | no frontend use | Legacy internal implementation retained under wrapper. Do not call from frontend. |
| `get_public_report_detail_legacy_v1(p_public_token text)` | `jsonb` | no frontend use | Legacy internal implementation retained under wrapper. Do not call from frontend. |

Codex must not call internal helpers or legacy implementations directly.

The public wrapper names and signatures did not change, so frontend still calls the same RPC names:

```ts
get_report_detail(p_hero_id, p_report_id)
get_public_report_detail(p_public_token)
```

The payload shape is extended for PvP combat reports by `domainContextJson.pvpResult`.


## 3. Private report detail RPC

```sql
get_report_detail(
  p_hero_id uuid,
  p_report_id uuid
) returns jsonb
```

```ts
interface ReportDetailV2 {
  contractVersion: 'report_detail_v2';
  access: ReportAccessPrivate;
  domainContextJson: ReportDomainContextV1;
  reportShellContextJson: ReportShellContextV1;
  report: ReportContentSnapshotV1;
}
```

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

Private behavior:

- hero access is enforced DB-side;
- `domainContextJson.frontendUsage.canUsePrivateDomainReads` should be `true`;
- `domainContextJson.frontendUsage.sourceIdsRedacted` should be `false`;
- source IDs may be present and may be used only through owner-safe/domain RPCs;
- the RPC does not mark the report as read.

---

## 4. Public report detail RPC

```sql
get_public_report_detail(
  p_public_token text
) returns jsonb
```

Available report:

```ts
interface PublicReportDetailV2Available {
  contractVersion: 'report_detail_v2';
  access: ReportAccessPublicAvailable;
  domainContextJson: ReportDomainContextV1;
  reportShellContextJson: ReportShellContextV1;
  report: ReportContentSnapshotV1;
}

interface ReportAccessPublicAvailable {
  visibility: 'public';
  isPublic: true;
  publicToken: string;
  isAvailable: true;
}
```

Unavailable report:

```ts
interface PublicReportDetailV2Unavailable {
  contractVersion: 'report_detail_v2';
  access: ReportAccessPublicUnavailable;
  domainContextJson: null;
  reportShellContextJson: null;
  report: null;
}

interface ReportAccessPublicUnavailable {
  visibility: 'public';
  isPublic: true;
  publicToken: string | null;
  isAvailable: false;
  notFoundKey: 'public_report_not_found';
  notFoundLabel: string;
}
```

Public behavior:

- safe for anonymous users;
- must not expose source-domain UUIDs;
- must not call private source-domain RPCs;
- should render from returned report snapshot.

---

## 5. Report shell context

Located at:

```ts
payload.reportShellContextJson
```

Source of truth for top report shell/header.

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

### 5.1 Shell source

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

### 5.2 Shell event type

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

Rules:

- Use `reportShellContextJson.eventType` for shell metadata.
- If the UI wants the same chip treatment as Reports Center and the key exists in `get_report_page_copy(locale).reportsCenter.eventTypes.byKey`, use the copy map for display label/tone/icon and treat shell context label as DB fallback.
- Never use `report.reportTypeLabel` as shell event type.

### 5.3 Shell date

```ts
interface ReportShellDate {
  value: string | null;
  displayValue: string | null;
}
```

### 5.4 Legacy snapshot

```ts
interface ReportShellLegacySnapshot {
  reportTypeKey: string | null;
  sourceEntityType: string | null;
  title: string | null;
  summary: string | null;
  hiddenFromShell: true;
}
```

Legacy fields are diagnostics/backwards compatibility. If `hiddenFromShell=true`, new shell/header UI must not display them as shell copy.

### 5.5 Shell render rule

Use:

```ts
const shell = payload.reportShellContextJson;
const copy = get_report_page_copy(locale).reportShell;

eyebrow = shell.eyebrow;
title = shell.title;
summary = shell.summary;
sourceValue = shell.source.label;
eventTypeValue = shell.eventType.label; // or copy.reportsCenter.eventTypes.byKey[shell.eventType.key] if used as chip
dateValue = shell.reportDate.displayValue;
backLabel = copy.header.backAction;
copyLinkLabel = copy.header.copyLinkAction;
openFullLabel = copy.header.openFullReportAction;
removeLabel = copy.header.removeAction;
```

Do not use:

```ts
payload.report.reportTypeLabel;
payload.report.title;
payload.report.summary;
payload.report.sourceLabel;
payload.access.isUnread;
payload.access.readAt;
```

as top shell/header display.

---

## 6. Reports copy integration

```ts
interface ReportPageCopyV3 {
  contractVersion: 'report_page_copy_v3';
  locale: string;
  requestedLocale: string;
  fallbackLocale: 'en';
  reportShell: ReportShellCopyV3;
  reportsCenter: ReportsCenterCopyV3;
}

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

- `reportShell` copy provides labels/actions only.
- `reportShellContextJson` provides actual report values.
- Source-domain content remains outside Reports copy.

---

## 7. Report content snapshot

Located at:

```ts
payload.report
```

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

Rules:

- `title` and `summary` may still contain legacy/domain copy until source-domain producers are fixed.
- Reports copy must not patch these locally.
- Domain renderer owns opaque source sections.
- Combat section should be passed to the existing Combat renderer, not rendered by a new Reports-specific combat renderer.

---

## 8. Related report snapshot

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

Rules:

- `parent_context_report` means a low-level combat report belongs to a parent contextual report.
- `child_combat_report` means the current contextual report embeds/owns a child combat report.
- Report detail may redirect from child combat to parent contextual report in private UI when appropriate.
- Full detail should not render generic Related Reports by default.

---

## 9. Combat section snapshot

Located at:

```ts
payload.report.combatSectionJson
```

This is owned by the Combat renderer. Reports detail passes it through.

```ts
interface CombatSectionSnapshot {
  title: string | null;
  summary: string | null;
  combatResultId: string | null;
  sourceType: string | null;
  sourceTypeLabel: string | null;
  sourceLabel: string | null;
  outcome: string | null;
  outcomeLabel: string | null;
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

Reports detail must not locally translate combat attacks or outcomes.

---

## 10. Reward section snapshot

Located at:

```ts
payload.report.rewardSectionJson
```

Reports detail must not build a new reward renderer from this shape unless a domain/shared reward renderer owns it.

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
}
```

---

## 11. Opaque source-domain sections

These are not Reports-owned contracts:

```ts
interface SpySectionSnapshot { [key: string]: unknown; }
interface TrialSectionSnapshot { [key: string]: unknown; }
interface EncounterSectionSnapshot { [key: string]: unknown; }
interface EffectSectionSnapshot { [key: string]: unknown; }
```

Rules:

- Reports shell must not create generic sections from them.
- Source-domain renderers may interpret them using their own contracts.
- If a source-domain renderer contract is missing, report that as a follow-up/blocker rather than guessing.

---

## 12. Domain context v1

Located at:

```ts
payload.domainContextJson
```

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

  // Present for PvP combat reports when the source pvp_attack_result has a pvp.result snapshot.
  // Public detail must render only pvpResult.public.neutral.
  pvpResult?: PvpResultSnapshotV1 | null;

  missingContextReason: MissingContextReason | null;
}
```

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

### 12.1 Frontend usage

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

---

## 13. Exploration domain context

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

Rules:

- Private report mode may call existing exploration reward/read-model RPCs only when required source IDs are present.
- Public report mode must render from report snapshot.
- If private `rewardSourceKind='challenge_attempt'` and `challengeAttemptId=null`, that is a DB/RPC gap.
- If private `rewardSourceKind='step'` and `stepId=null`, that is a DB/RPC gap.

---

## 14. PvP, Spy and Combat domain contexts

```ts
interface PvpReportDomainContext {
  pvpActionId: string | null;
  pvpAttackResultId: string | null;
  combatResultId: string | null;
  sourceKind: 'pvp_attack' | 'pvp_spy' | null;
  outcomeKey: string | null;
}

interface SpyReportDomainContext {
  pvpSpyResultId: string | null;
  pvpActionId: string | null;
  outcomeKey: string | null;
  success: boolean | null;
  detected: boolean | null;
}

interface CombatReportDomainContext {
  combatResultId: string | null;
  sourceType: string | null;
  sourceEntityId: string | null;
  parentReportId: string | null;
  parentPublicToken: string | null;
  isChildCombatReport: boolean;
}
```

Rules:

- Private PvP/Spy report detail may use IDs through owner-safe domain RPCs only.
- Public PvP/Spy report detail renders from report snapshot only.
- `combat.isChildCombatReport=true` means the low-level combat report has a contextual parent.
- Child combat reports should not be promoted as primary Reports Center list rows.


### 14.1 PvP result snapshot extension

For PvP combat reports, report detail now exposes the source-domain `pvp.result` snapshot under:

```ts
payload.domainContextJson.pvpResult
```

This snapshot is copied from:

```text
pvp_attack_results.report_context_json.pvpResult
```

by the internal helper `attach_pvp_result_to_report_detail_payload(...)`. Frontend must not direct-read `pvp_attack_results`.

```ts
interface PvpResultSnapshotV1 {
  contractKey: 'pvp_result_snapshot';
  contractVersion: 'pvp_result_snapshot_v1';
  sourceOwner: 'pvp.result';
  refreshedAt: string;
  requestId: string;

  private: {
    attacker: PvpResultSummaryV1;
    defender: PvpResultSummaryV1;
  };

  public: {
    neutral: PvpResultSummaryV1;
    includesGlory: false;
    glory: null;
  };

  legacy: {
    reportCopyRpcsDeprecated: true;
    deprecatedPrivateReportCopyRpc: 'get_pvp_report_copy';
    deprecatedPublicReportCopyRpc: 'get_public_pvp_report_copy';
    genericCombatSectionIsDetailOnly: true;
  };
}

interface PvpResultSummaryV1 {
  contractKey: 'pvp_result_summary';
  contractVersion: 'pvp_result_summary_v1';
  sourceOwner: 'pvp.result';

  locale: 'pl';
  outcomeKey: 'attacker_victory' | 'defender_victory' | 'draw';
  perspective: 'attacker' | 'defender' | 'neutral';

  title: string;
  summaryPlainText: string;
  summaryRichText: RichTextFragment[];

  includesGlory: boolean;
  glorySentence: PvpResultGlorySentenceV1 | null;

  technicalContext: {
    pvpAttackResultId: string;
    combatResultId: string;
    attackerHeroId: string;
    defenderHeroId: string;
  };
}

interface PvpResultGlorySentenceV1 {
  contractKey: 'pvp_result_glory_sentence';
  contractVersion: 'pvp_result_glory_sentence_v1';
  messageKind: string;
  plainText: string;
  richText: RichTextFragment[];
}

interface RichTextFragment {
  kind: 'text' | 'value';
  text: string;
  tone?: 'heading' | 'info' | 'warn' | 'success' | 'danger' | 'muted';
}
```

Private rendering rule:

```ts
const pvpResult = payload.domainContextJson.pvpResult;

if (activeHeroId === pvpResult.private.attacker.technicalContext.attackerHeroId) {
  render(pvpResult.private.attacker.title, pvpResult.private.attacker.summaryRichText);
} else if (activeHeroId === pvpResult.private.defender.technicalContext.defenderHeroId) {
  render(pvpResult.private.defender.title, pvpResult.private.defender.summaryRichText);
} else {
  render(pvpResult.public.neutral.title, pvpResult.public.neutral.summaryRichText);
}
```

Public rendering rule:

```ts
render(
  payload.domainContextJson.pvpResult.public.neutral.title,
  payload.domainContextJson.pvpResult.public.neutral.summaryRichText,
);
```

Public/neutral perspective must not render Chwała:

```ts
payload.domainContextJson.pvpResult.public.includesGlory === false
payload.domainContextJson.pvpResult.public.glory === null
payload.domainContextJson.pvpResult.public.neutral.includesGlory === false
```

If `pvpResult` is present, it is the source of the final PvP result summary. Do not use legacy fields such as `report.title`, `report.summary`, `get_pvp_report_copy(...).experienceLines`, `resourceLine`, or `gloryLine` as the primary final PvP result.

`payload.report.combatSectionJson` remains the combat-log/detail source. It is not the owner of PvP result/reward/Chwała copy.

PvP spy reports are unchanged by this extension. They are not expected to have `domainContextJson.pvpResult`.


---

## 15. Missing context reason

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

---

## 16. Data-blocked policy

Representative data may be absent for some branches:

- Trade;
- Auction;
- Siege;
- Argonautics;
- some public redacted PvP/Spy branches;
- unsupported/future domains.

Policy:

- mark absent branch smoke as `data-blocked`;
- do not delete fields because current data lacks a branch;
- do not add local fallback labels/copy;
- preserve domain routing shape.

---

## 17. Codex implementation boundary

Codex should:

- use `get_report_page_copy(locale)` v3 keys for report shell labels/actions;
- use `get_report_detail(...)` and `get_public_report_detail(...)` v2;
- use `domainContextJson` to select source-domain renderer/report mode;
- for PvP combat reports, render final result summary from `domainContextJson.pvpResult`;
- keep report shell separate from source-domain content;
- keep private read state as logic state, not important visible shell meta;
- redirect or link from child combat reports to parent contextual reports where UI requires contextual detail;
- report missing source-domain renderer support as a blocker/follow-up instead of guessing.

Codex should not:

- edit or regenerate generated database types unless explicitly asked;
- direct-read source tables, including `pvp_attack_results`;
- call internal helpers such as `build_report_domain_context_json(...)` or `attach_pvp_result_to_report_detail_payload(...)`;
- create a generic report-section renderer;
- create one bespoke component per report type;
- add local Polish fallback copy for domain content;
- reconstruct PvP result from legacy report copy fields when `pvpResult` is present;
- use legacy `report.reportTypeLabel`, `report.title`, `report.summary`, or `report.sourceLabel` as shell/header source.


---

## 18. Verification status after pvp.result exposure

Latest DB checks confirmed:

- source `pvp_attack_results.report_context_json.pvpResult` snapshots exist and are valid for 50/50 checked PvP attack results;
- `attach_pvp_result_to_report_detail_payload(...)` attaches `pvp_result_snapshot_v1` with private attacker, private defender and public neutral summaries;
- `get_public_report_detail(...)` exposes `pvpResult.public.neutral` for a public PvP combat sample;
- 50/50 checked `pvp_combat` reports link to `pvp_attack_results` rows that contain `pvp_result_snapshot_v1`;
- `pvp_spy` reports are not expected to link to `pvp_attack_results` and are not part of this `pvpResult` extension.

The old broad link check that included `pvp_spy` reports can return a partial diagnostic; use the combat-only check for this contract.

## 19. Generated types note

The public RPCs return `jsonb`, so generated types will not describe recursive JSON payloads. Regenerate generated types after signature changes, but use this document as the authoritative recursive detail shell/domain context contract.
