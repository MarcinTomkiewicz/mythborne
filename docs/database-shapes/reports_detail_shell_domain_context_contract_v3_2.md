# Mythsworn Reports - Report Detail Shell + Domain Context Contract v3.2

Status: active after full PvP result + PvP combat context DB/RPC gate  
Audience: Codex / Reviewer / Migrator  
Scope: private/public report detail shell, domain context, `pvpResult`, `pvpCombatContext`, report snapshot usage  
Out of scope: Reports Center list/root context, source-domain renderer internals, Reports Page Copy payload content

---

## 1. Core decision

Report detail remains a thin wrapper.

It renders:

1. report shell/header/actions owned by Reports;
2. source-domain content selected using `domainContextJson`;
3. persisted report snapshot content when domain private reads are not allowed;
4. PvP final result from `domainContextJson.pvpResult`;
5. PvP combat context effects from `domainContextJson.pvpCombatContext`.

It must not become a second renderer for Exploration, PvP, Spy or Combat internals.

---

## 2. RPC inventory

| RPC | Return | Grants | Purpose |
|---|---|---|---|
| `get_report_detail(p_hero_id uuid, p_report_id uuid)` | `jsonb` | authenticated | Private report detail. |
| `get_public_report_detail(p_public_token text)` | `jsonb` | anon, authenticated | Public report detail. |
| `get_report_page_copy(p_locale text default 'pl')` | `jsonb` | anon, authenticated | Reports Center + report shell copy only. |

Internal helpers are not frontend contracts:

```text
build_report_domain_context_json(...)
build_report_shell_context_json(...)
attach_pvp_result_to_report_detail_payload(...)
attach_pvp_combat_context_to_report_detail_payload(...)
```

Codex must not call internal helpers directly.

---

## 3. Private report detail payload

```ts
interface ReportDetailV2 {
  contractVersion: 'report_detail_v2';
  access: ReportAccessPrivate;
  domainContextJson: ReportDomainContextV1;
  reportShellContextJson: ReportShellContextV1;
  report: ReportContentSnapshotV1;
}
```

Private behavior:

- hero access is enforced DB-side;
- source IDs may be present;
- private mode may use owner-safe/domain RPCs only when the source-domain renderer contract requires them;
- the RPC does not mark the report as read.

---

## 4. Public report detail payload

Available report:

```ts
interface PublicReportDetailV2Available {
  contractVersion: 'report_detail_v2';
  access: ReportAccessPublicAvailable;
  domainContextJson: ReportDomainContextV1;
  reportShellContextJson: ReportShellContextV1;
  report: ReportContentSnapshotV1;
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
```

Public behavior:

- safe for anonymous users;
- does not expose private source UUIDs in public-safe source-domain payloads;
- must not call private source-domain RPCs;
- renders from returned report snapshot and public-safe domain context.

---

## 5. Report shell context

Located at:

```text
payload.reportShellContextJson
```

Use this for top shell/header values:

```ts
interface ReportShellContextV1 {
  contractVersion: 'report_shell_context_v1';

  eyebrow: string;
  title: string;
  summary: string | null;

  source: {
    key: string;
    label: string;
  };

  eventType: {
    key: string;
    label: string;
  };

  reportDate: {
    value: string | null;
    displayValue: string | null;
  };

  legacyReportSnapshot: {
    reportTypeKey: string | null;
    sourceEntityType: string | null;
    title: string | null;
    summary: string | null;
    hiddenFromShell: true;
  };

  missingShellContextReason: string | null;
}
```

Use `get_report_page_copy(locale).reportShell` only for labels/actions.

Do not use as top shell/header display:

```text
payload.report.reportTypeLabel
payload.report.title
payload.report.summary
payload.report.sourceLabel
payload.access.isUnread
payload.access.readAt
```

---

## 6. Domain context v1

Located at:

```text
payload.domainContextJson
```

Base shape:

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

  pvpResult?: PvpResultSnapshotV1 | null;
  pvpCombatContext?: PvpCombatContextPresentation | null;

  missingContextReason: MissingContextReason | null;
}
```

Private expected frontend usage:

```ts
{
  contentAccessMode: 'private_source_context',
  canUsePrivateDomainReads: true,
  shouldRenderFromReportSnapshot: false,
  sourceIdsRedacted: false
}
```

Public expected frontend usage:

```ts
{
  contentAccessMode: 'report_snapshot_only',
  canUsePrivateDomainReads: false,
  shouldRenderFromReportSnapshot: true,
  sourceIdsRedacted: true
}
```

---

## 7. `domainContextJson.pvpResult`

Present for:

```text
reportTypeKey = pvp_combat
sourceEntityType = pvp_result
```

Shape:

```ts
interface PvpResultSnapshotV1 {
  contractKey: 'pvp_result_snapshot';
  contractVersion: 'pvp_result_snapshot_v1';
  sourceOwner: 'pvp.result';

  private: {
    attacker: PvpResultSummaryV1;
    defender: PvpResultSummaryV1;
  };

  public: {
    neutral: PvpResultSummaryV1;
    includesGlory: false;
    glory: null;
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
```

Frontend rendering:

Private report:

```ts
if (activeHeroId === pvpResult.private.attacker.technicalContext.attackerHeroId) {
  render(pvpResult.private.attacker);
} else if (activeHeroId === pvpResult.private.defender.technicalContext.defenderHeroId) {
  render(pvpResult.private.defender);
} else {
  render(pvpResult.public.neutral);
}
```

Public report:

```ts
render(pvpResult.public.neutral);
```

Render:

```text
title
summaryRichText
```

Do not render `technicalContext`.

Public result must not show Chwała.

---

## 8. `domainContextJson.pvpCombatContext`

Present for:

```text
reportTypeKey = pvp_combat
sourceEntityType = pvp_result
```

Shape:

```ts
interface PvpCombatContextPresentation {
  contractKey: 'pvp_combat_context_presentation';
  contractVersion: 'pvp_combat_context_presentation_v1';
  sourceOwner: 'pvp.combat';
  publicSafe: true;
  emptyLabel: string;
  participantEffects: PvpCombatParticipantEffect[];
  participants: PvpCombatParticipantContext[];
}

interface PvpCombatParticipantContext {
  participantRole: 'attacker' | 'defender';
  displayName: string;
  participantEffects: PvpCombatParticipantEffect[];
}

interface PvpCombatParticipantEffect {
  key:
    | 'attacker_barracks_health'
    | 'defender_fortress_health'
    | 'blessing'
    | 'curse';

  sourceKey:
    | 'barracks'
    | 'fortress'
    | 'blessing'
    | 'curse';

  participantRole: 'attacker' | 'defender';
  heroName: string;
  valueDisplay: string;

  summaryPlain: string;
  summaryRichText: RichTextFragment[];

  tone: 'info' | 'success' | 'danger';
  sortOrder: number;
}
```

Frontend rendering:

```text
participantEffects[].summaryRichText
```

Do not render separate effect titles.

Forbidden as standalone effect titles:

```text
Koszary napastnika
Forteca obrońcy
Błogosławieństwo
Klątwa
```

The word `klątwa` is valid inside the accepted sentence:

```text
Nad bohaterem {heroName} ciąży klątwa, która nakłada {valueDisplay}.
```

Public mode renders the same returned public-safe context. Do not call private domain RPCs.

---

## 9. Report content snapshot

Located at:

```text
payload.report
```

Reports detail passes source-owned sections to source-domain renderers.

It must not create a generic report-section renderer from:

```text
participantsJson
itemReferencesJson
rewardSectionJson
effectSectionJson
relatedReportsJson
```

Combat section belongs to the Combat renderer.

PvP result belongs to `domainContextJson.pvpResult`.

PvP combat context effects belong to `domainContextJson.pvpCombatContext`.

---

## 10. Codex implementation boundary

Codex should:

- call `get_report_detail(...)` and `get_public_report_detail(...)`;
- call `get_report_page_copy(locale)` for shell labels/actions;
- use `reportShellContextJson` for shell values;
- use `domainContextJson.pvpResult` for final PvP result;
- use `domainContextJson.pvpCombatContext` for PvP combat context effects;
- use existing rich text renderer;
- keep Reports Center preview lightweight.

Codex must not:

- direct-read source tables;
- call internal helper functions;
- compose PvP result text locally;
- compose participant effect text locally;
- use legacy `experienceLines`, `resourceLine`, `gloryLine` as primary result when `pvpResult` exists;
- render Chwała in public result;
- render separate effect titles;
- add local Polish fallback copy;
- edit generated database types manually.

---

## 11. Verified gate

The DB/RPC gate has confirmed:

- private report detail exposes `domainContextJson.pvpResult`;
- public report detail exposes `domainContextJson.pvpResult.public.neutral`;
- private report detail exposes `domainContextJson.pvpCombatContext`;
- public report detail exposes public-safe `domainContextJson.pvpCombatContext`;
- stored `pvpCombatContext` is valid for 50/50 checked PvP attack results;
- live representative gate found a PvP live session with expected effects and rendered effects;
- no UUID-like public leak;
- no top-level effect titles;
- no exact old effect-title rich text fragments.
