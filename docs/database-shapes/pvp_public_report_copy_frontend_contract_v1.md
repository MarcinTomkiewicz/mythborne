# Mythsworn - `player.pvp.report.public` GameCopy frontend contract v1

## 0. Status

This contract describes the frontend shape for the canonical public DB copy RPC:

```sql
public.get_public_pvp_report_copy(
  p_locale text default 'pl',
  p_public_token text default null::text
) returns jsonb
```

GameCopy kind:

```ts
'player.pvp.report.public'
```

Contract identity returned by the RPC:

```ts
contractKey: 'pvp_report_copy'
contractVersion: 'pvp_report_copy_v1'
```

Public visibility identity:

```ts
visibility: 'public'
```

The RPC is public-readable for `anon` and `authenticated`, is `STABLE`, uses `SECURITY DEFINER`, and falls back to English for unsupported locales.

Verified function signature:

```text
get_public_pvp_report_copy(p_locale text, p_public_token text) returns jsonb
```

Verified privilege contract:

```text
anon can execute RPC: true
authenticated can execute RPC: true
anon SELECT on game_reports: false
anon SELECT on pvp_attack_results: false
anon SELECT on pvp_spy_results: false
```

The frontend must call the RPC. It must not direct-read public report tables.

## 1. Non-negotiable frontend rules

Frontend reads all player-facing strings in this area through `GameCopyService`.

Do not read public report copy from:

```text
game_reports.title
game_reports.summary
report_type_key
source_entity_type
pvp_attack_results.outcome_key
pvp_spy_results.result_summary
pvp_spy_results.outcome_key
metadata_json
local configs
local mappers
templates
Error.message
hardcoded fallback strings
```

Do not add local player-facing fallback labels in Angular. If a required copy key is missing, treat it as a contract error and surface diagnostics according to existing project error-handling patterns.

Do not use player-facing `PvP`.

Do not use player-facing `Punkty Postaci`.

Use `Chwała`, not `prestiż`, in player-facing Polish copy.

Do not expose raw Chwała numeric deltas in public report copy.

Do not expose private report ids, hero ids, user ids, account ids, estate ids, combat result ids, PvP action ids, attacker/defender hero ids, spy/target hero ids, or private reward/resource recipient details.

`publicToken` is intentionally returned because it is the public addressing key for this surface.

`reportId` is intentionally `null` in this public contract.

Public attack reports intentionally omit private loot, XP and Chwała detail lines. The public attack payload only says that private details are omitted.

Public spy reports intentionally omit private identifiers and account data. This contract currently exposes only resolved public copy, section labels, public shell data, participants display rows, and spy empty-state copy.

Generated Supabase `database.types.ts` is owned by the user/Migrator. Codex must not edit or regenerate it. If `Database['public']['Functions']['get_public_pvp_report_copy']` is missing, stop and report generated types as stale.

## 2. Required GameCopy integration

Add this kind to the GameCopy registry:

```ts
'player.pvp.report.public'
```

Required registry args:

```ts
export interface PvpPublicReportCopyArgs {
  locale: string;
  publicToken: string;
}
```

Required reader shape, following the existing GameCopy reader pattern:

```ts
'player.pvp.report.public': (backend, args) =>
  backend.rpc<
    Database['public']['Functions']['get_public_pvp_report_copy']['Returns']
  >(
    RPC.get_public_pvp_report_copy,
    {
      p_locale: args.locale,
      p_public_token: args.publicToken,
    },
  ).pipe(map(mapPvpPublicReportCopy))
```

Required RPC constant:

```ts
get_public_pvp_report_copy: 'get_public_pvp_report_copy'
```

Required mapper:

```ts
mapPvpPublicReportCopy(
  raw: Database['public']['Functions']['get_public_pvp_report_copy']['Returns'],
): PvpPublicReportCopy
```

The mapper may normalize unknown JSON into the typed frontend model, but it must not invent player-facing text.

## 3. TypeScript model

Put named types in a model/type file. Do not declare these types locally inside production component files.

```ts
export type GameCopyLocale = 'pl' | 'en';

export type PvpPublicReportKind =
  | 'attack'
  | 'spy';

export type PvpPublicReportKindOrUnavailable =
  | PvpPublicReportKind
  | null;

export type PvpPublicViewerRole = 'viewer';

export type PvpPublicAttackOutcomeKey =
  | 'attacker_victory'
  | 'defender_victory'
  | 'draw';

export type PvpPublicSpyOutcomeKey =
  | 'success_undetected'
  | 'success_detected'
  | 'failure_undetected'
  | 'failure_detected';

export interface PvpPublicReportCopy {
  contractKey: 'pvp_report_copy';
  contractVersion: 'pvp_report_copy_v1';
  requestedLocale: string;
  locale: GameCopyLocale;
  fallbackLocale: 'en';

  visibility: 'public';
  reportId: null;
  publicToken: string | null;
  reportKind: PvpPublicReportKindOrUnavailable;

  access: PvpPublicReportAccessCopy;

  shell: PvpPublicReportShellCopy | null;
  sections: PvpPublicReportSectionsCopy;

  attackReport: PvpPublicAttackReportCopy | null;
  spyReport: PvpPublicSpyReportCopy | null;
}

export type PvpPublicReportAvailableCopy =
  | PvpPublicAttackReportAvailableCopy
  | PvpPublicSpyReportAvailableCopy;

export interface PvpPublicAttackReportAvailableCopy extends PvpPublicReportCopy {
  visibility: 'public';
  reportId: null;
  publicToken: string;
  reportKind: 'attack';
  access: PvpPublicReportAvailableAccessCopy;
  shell: PvpPublicReportShellCopy;
  sections: PvpPublicReportSectionsCopy;
  attackReport: PvpPublicAttackReportCopy;
  spyReport: null;
}

export interface PvpPublicSpyReportAvailableCopy extends PvpPublicReportCopy {
  visibility: 'public';
  reportId: null;
  publicToken: string;
  reportKind: 'spy';
  access: PvpPublicReportAvailableAccessCopy;
  shell: PvpPublicReportShellCopy;
  sections: PvpPublicReportSectionsCopy;
  attackReport: null;
  spyReport: PvpPublicSpyReportCopy;
}

export interface PvpPublicReportUnavailableCopy extends PvpPublicReportCopy {
  visibility: 'public';
  reportId: null;
  publicToken: string | null;
  reportKind: null;
  access: PvpPublicReportUnavailableAccessCopy;
  shell: null;
  sections: PvpPublicReportSectionsCopy;
  attackReport: null;
  spyReport: null;
}

export type PvpPublicReportAccessCopy =
  | PvpPublicReportAvailableAccessCopy
  | PvpPublicReportUnavailableAccessCopy;

export interface PvpPublicReportAvailableAccessCopy {
  viewerRole: 'viewer';
  isAvailable: true;
}

export interface PvpPublicReportUnavailableAccessCopy {
  viewerRole: 'viewer';
  isAvailable: false;
  notFoundKey: 'public_report_not_found' | 'public_pvp_report_unsupported';
  notFoundLabel: string;
}

export interface PvpPublicReportShellCopy {
  eyebrow: string;
  title: string;
  summary: string;
  createdAt: string;
  publicToken: string;
  reportTypeLabel: string;
  sourceLabel: string;
  visibilityLabel: string;
  participants: PvpPublicReportParticipantCopy[];
}

export interface PvpPublicReportParticipantCopy {
  participantRole: string;
  sideLabel: string | null;
  displayName: string;
  levelSnapshot: number | null;
  sortOrder: number;
}

export interface PvpPublicReportSectionsCopy {
  result: PvpPublicReportBasicSectionCopy;
  combat: PvpPublicReportBasicSectionCopy;
  participants: PvpPublicReportBasicSectionCopy;
  spy: PvpPublicReportBasicSectionCopy;
  resources: PvpPublicReportPrivateOmittedSectionCopy;
  experience: PvpPublicReportPrivateOmittedSectionCopy;
  publicNotice: PvpPublicReportNoticeSectionCopy;
  notFound: PvpPublicReportNoticeSectionCopy;
}

export interface PvpPublicReportBasicSectionCopy {
  label: string;
  emptyLabel: string;
}

export interface PvpPublicReportPrivateOmittedSectionCopy {
  label: string;
  privateOmittedLabel: string;
}

export interface PvpPublicReportNoticeSectionCopy {
  title: string;
  text: string;
}

export interface PvpPublicAttackReportCopy {
  reportKind: 'attack';
  viewerRole: 'viewer';
  outcomeKey: PvpPublicAttackOutcomeKey;

  title: string;
  summary: string;
  resultTitle: string;
  resultNarrative: string;

  experienceLines: [];
  resourceLine: null;
  gloryLine: null;

  privateDetailsOmitted: true;
  privateDetailsOmittedLabel: string;
}

export interface PvpPublicSpyReportCopy {
  reportKind: 'spy';
  viewerRole: 'viewer';
  outcomeKey: PvpPublicSpyOutcomeKey;

  title: string;
  summary: string;

  emptyStates: PvpPublicSpyEmptyStatesCopy;

  privateDetailsOmitted: true;
  privateDetailsOmittedLabel: string;
}

export interface PvpPublicSpyEmptyStatesCopy {
  noBuildings: string;
  noEquipment: string;
  noResources: string;
  noVisibleData: string;
}
```

## 4. Top-level payload inventory

The RPC always returns the following top-level keys.

| Path | Type | Available report | Missing/unsupported report | Notes |
|---|---|---:|---:|---|
| `contractKey` | `'pvp_report_copy'` | yes | yes | Contract identity. |
| `contractVersion` | `'pvp_report_copy_v1'` | yes | yes | Contract version. |
| `requestedLocale` | `string` | yes | yes | Raw requested locale after DB-side normalization of blank input. |
| `locale` | `'pl' \| 'en'` | yes | yes | Unsupported locales fall back to `en`. |
| `fallbackLocale` | `'en'` | yes | yes | Static fallback locale. |
| `visibility` | `'public'` | yes | yes | This RPC is public-only. |
| `reportId` | `null` | yes | yes | Intentionally not exposed publicly. |
| `publicToken` | `string \| null` | yes | yes | Public token, or null when request token was blank. |
| `reportKind` | `'attack' \| 'spy' \| null` | yes | null | Null when not found or unsupported. |
| `access` | `PvpPublicReportAccessCopy` | yes | yes | Public viewer access object. |
| `shell` | `PvpPublicReportShellCopy \| null` | yes | null | Public shell copy. |
| `sections` | `PvpPublicReportSectionsCopy` | yes | yes | Public section labels and empty/omitted-state copy. |
| `attackReport` | `PvpPublicAttackReportCopy \| null` | attack only | null | Present only for public combat/attack reports. |
| `spyReport` | `PvpPublicSpyReportCopy \| null` | spy only | null | Present only for public spy reports. |

## 5. Access object inventory

### 5.1 Available public report

| Path | Type | Value |
|---|---|---|
| `access.viewerRole` | `'viewer'` | `viewer` |
| `access.isAvailable` | `true` | `true` |

### 5.2 Missing or unsupported public report

| Path | Type | Value |
|---|---|---|
| `access.viewerRole` | `'viewer'` | `viewer` |
| `access.isAvailable` | `false` | `false` |
| `access.notFoundKey` | `'public_report_not_found' \| 'public_pvp_report_unsupported'` | error/status key |
| `access.notFoundLabel` | `string` | localized player-facing unavailable text |

PL values:

| Case | `access.notFoundKey` | `access.notFoundLabel` |
|---|---|---|
| Missing or blank token | `public_report_not_found` | `Raport nie istnieje albo nie jest już publicznie dostępny.` |
| Unsupported public PvP report shape | `public_pvp_report_unsupported` | `Raport nie istnieje albo nie jest już publicznie dostępny.` |

EN values:

| Case | `access.notFoundKey` | `access.notFoundLabel` |
|---|---|---|
| Missing or blank token | `public_report_not_found` | `The report does not exist or is no longer publicly available.` |
| Unsupported public PvP report shape | `public_pvp_report_unsupported` | `The report does not exist or is no longer publicly available.` |

## 6. Shell object inventory

`shell` is present only when `access.isAvailable === true`.

| Path | Type | Attack PL | Spy PL | UI usage |
|---|---|---|---|---|
| `shell.eyebrow` | `string` | `Raport walki` | `Raport zwiadu` | Public report page eyebrow. |
| `shell.title` | `string` | outcome-dependent | outcome-dependent | Main public report title. |
| `shell.summary` | `string` | outcome-dependent | outcome-dependent | Lead/summary text. |
| `shell.createdAt` | `string` | DB timestamp string | DB timestamp string | Display timestamp. |
| `shell.publicToken` | `string` | token | token | Public route/share key; not a private id. |
| `shell.reportTypeLabel` | `string` | `Walka` | `Zwiad` | Compact report type label. |
| `shell.sourceLabel` | `string` | `Walka bohaterów` | `Zwiad posiadłości` | Public source label. |
| `shell.visibilityLabel` | `string` | `Raport publiczny` | `Raport publiczny` | Public visibility badge/label. |
| `shell.participants` | `PvpPublicReportParticipantCopy[]` | array | array | Display-only participants list. |

EN shell labels:

| Path | Attack EN | Spy EN |
|---|---|---|
| `shell.eyebrow` | `Combat report` | `Scouting report` |
| `shell.reportTypeLabel` | `Combat` | `Scouting` |
| `shell.sourceLabel` | `Hero combat` | `Estate scouting` |
| `shell.visibilityLabel` | `Public report` | `Public report` |

## 7. Participants inventory

Participants are display-only rows copied from `game_report_participants`.

They must not be treated as identity authority. They do not expose `hero_id`.

| Path | Type | Nullable | UI usage |
|---|---|---:|---|
| `shell.participants[].participantRole` | `string` | no | Display/sorting/grouping hint. Do not use as permission authority. |
| `shell.participants[].sideLabel` | `string \| null` | yes | Optional side label. |
| `shell.participants[].displayName` | `string` | no | Public display name. |
| `shell.participants[].levelSnapshot` | `number \| null` | yes | Public level snapshot if available. |
| `shell.participants[].sortOrder` | `number` | no | Sort order. |

Frontend must preserve backend order or sort by `sortOrder` only.

## 8. Sections inventory

`sections` is always present, including missing-token responses.

### 8.1 `sections.result`

| Path | Type | PL value | EN value | UI usage |
|---|---|---|---|---|
| `sections.result.label` | `string` | `Wynik starcia` | `Result` | Result section title. |
| `sections.result.emptyLabel` | `string` | `Nie udało się ustalić wyniku.` | `The result could not be determined.` | Empty result state. |

### 8.2 `sections.combat`

| Path | Type | PL value | EN value | UI usage |
|---|---|---|---|---|
| `sections.combat.label` | `string` | `Przebieg starcia` | `Combat log` | Combat/log section title. |
| `sections.combat.emptyLabel` | `string` | `Brak publicznego przebiegu starcia.` | `No public combat log is available.` | Empty public combat log. |

### 8.3 `sections.participants`

| Path | Type | PL value | EN value | UI usage |
|---|---|---|---|---|
| `sections.participants.label` | `string` | `Uczestnicy` | `Participants` | Participants section title. |
| `sections.participants.emptyLabel` | `string` | `Brak publicznych danych uczestników.` | `No public participant data is available.` | Empty participants state. |

### 8.4 `sections.spy`

| Path | Type | PL value | EN value | UI usage |
|---|---|---|---|---|
| `sections.spy.label` | `string` | `Raport zwiadu` | `Scouting report` | Spy section title. |
| `sections.spy.emptyLabel` | `string` | `Brak publicznych danych zwiadu.` | `No public scouting data is available.` | Empty spy section. |

### 8.5 `sections.resources`

| Path | Type | PL value | EN value | UI usage |
|---|---|---|---|---|
| `sections.resources.label` | `string` | `Zasoby` | `Resources` | Resource section title. |
| `sections.resources.privateOmittedLabel` | `string` | `Szczegóły zasobów są dostępne tylko uczestnikom raportu.` | `Resource details are available only to report participants.` | Public omitted-state message. |

### 8.6 `sections.experience`

| Path | Type | PL value | EN value | UI usage |
|---|---|---|---|---|
| `sections.experience.label` | `string` | `Doświadczenie` | `Experience` | Experience section title. |
| `sections.experience.privateOmittedLabel` | `string` | `Szczegóły doświadczenia są dostępne tylko uczestnikom raportu.` | `Experience details are available only to report participants.` | Public omitted-state message. |

### 8.7 `sections.publicNotice`

| Path | Type | PL value | EN value | UI usage |
|---|---|---|---|---|
| `sections.publicNotice.title` | `string` | `Raport publiczny` | `Public report` | Public notice title/badge. |
| `sections.publicNotice.text` | `string` | `Ten widok pokazuje wyłącznie publiczną część raportu.` | `This view shows only the public part of the report.` | Public notice body. |

### 8.8 `sections.notFound`

| Path | Type | PL value | EN value | UI usage |
|---|---|---|---|---|
| `sections.notFound.title` | `string` | `Raport niedostępny` | `Report unavailable` | Not-found title. |
| `sections.notFound.text` | `string` | `Raport nie istnieje albo nie jest już publicznie dostępny.` | `The report does not exist or is no longer publicly available.` | Not-found body. |

## 9. Public attack report inventory

`attackReport` is present only when:

```ts
reportKind === 'attack'
access.isAvailable === true
spyReport === null
```

### 9.1 Attack report fields

| Path | Type | Nullable | UI usage |
|---|---|---:|---|
| `attackReport.reportKind` | `'attack'` | no | Runtime discriminator. |
| `attackReport.viewerRole` | `'viewer'` | no | Public viewer role. |
| `attackReport.outcomeKey` | `PvpPublicAttackOutcomeKey` | no | Outcome styling/branching key. |
| `attackReport.title` | `string` | no | Attack result title. |
| `attackReport.summary` | `string` | no | Attack summary. |
| `attackReport.resultTitle` | `string` | no | Result section title. Same value as `title`. |
| `attackReport.resultNarrative` | `string` | no | Result narrative. Same value as `summary`. |
| `attackReport.experienceLines` | `[]` | no | Always empty in public contract. |
| `attackReport.resourceLine` | `null` | yes | Always null in public contract. |
| `attackReport.gloryLine` | `null` | yes | Always null in public contract. |
| `attackReport.privateDetailsOmitted` | `true` | no | Indicates public omissions. |
| `attackReport.privateDetailsOmittedLabel` | `string` | no | Localized public omission explanation. |

### 9.2 Attack outcome text matrix - PL

| `attackReport.outcomeKey` | `shell.title` / `attackReport.title` / `attackReport.resultTitle` | `shell.summary` / `attackReport.summary` / `attackReport.resultNarrative` |
|---|---|---|
| `attacker_victory` | `Zwycięstwo po ciężkim boju` | `Po trudnym boju atakujący przełamał obronę posiadłości i wyszedł ze starcia zwycięsko.` |
| `defender_victory` | `Atak odparty` | `Obrona wytrzymała natarcie. Napastnik musiał wycofać się bez łupu.` |
| `draw` | `Nierozstrzygnięte starcie` | `Starcie przeciągnęło się aż do zachodu słońca. Obie strony odstąpiły od siebie, zanim padł ostateczny cios.` |

### 9.3 Attack outcome text matrix - EN

| `attackReport.outcomeKey` | `shell.title` / `attackReport.title` / `attackReport.resultTitle` | `shell.summary` / `attackReport.summary` / `attackReport.resultNarrative` |
|---|---|---|
| `attacker_victory` | `Victory after a hard-fought clash` | `After a hard-fought clash, the attacker broke through the estate defense and left victorious.` |
| `defender_victory` | `Attack repelled` | `The defense held. The attacker had to withdraw without loot.` |
| `draw` | `Unresolved clash` | `The clash dragged on until sunset. Both sides withdrew before the final blow was struck.` |

### 9.4 Attack omitted private details

PL:

| Path | Value |
|---|---|
| `attackReport.experienceLines` | `[]` |
| `attackReport.resourceLine` | `null` |
| `attackReport.gloryLine` | `null` |
| `attackReport.privateDetailsOmitted` | `true` |
| `attackReport.privateDetailsOmittedLabel` | `Szczegóły łupu, doświadczenia i Chwały są dostępne tylko uczestnikom raportu.` |

EN:

| Path | Value |
|---|---|
| `attackReport.experienceLines` | `[]` |
| `attackReport.resourceLine` | `null` |
| `attackReport.gloryLine` | `null` |
| `attackReport.privateDetailsOmitted` | `true` |
| `attackReport.privateDetailsOmittedLabel` | `Loot, experience and Glory details are available only to report participants.` |

## 10. Public spy report inventory

`spyReport` is present only when:

```ts
reportKind === 'spy'
access.isAvailable === true
attackReport === null
```

### 10.1 Spy report fields

| Path | Type | Nullable | UI usage |
|---|---|---:|---|
| `spyReport.reportKind` | `'spy'` | no | Runtime discriminator. |
| `spyReport.viewerRole` | `'viewer'` | no | Public viewer role. |
| `spyReport.outcomeKey` | `PvpPublicSpyOutcomeKey` | no | Outcome styling/branching key. |
| `spyReport.title` | `string` | no | Spy result title. |
| `spyReport.summary` | `string` | no | Spy result summary. |
| `spyReport.emptyStates` | `PvpPublicSpyEmptyStatesCopy` | no | Empty-state copy for public spy detail sections. |
| `spyReport.privateDetailsOmitted` | `true` | no | Indicates public identifier/data omissions. |
| `spyReport.privateDetailsOmittedLabel` | `string` | no | Localized public omission explanation. |

### 10.2 Spy outcome text matrix - PL

| `spyReport.outcomeKey` | `shell.title` / `spyReport.title` | `shell.summary` / `spyReport.summary` |
|---|---|---|
| `success_undetected` | `Zwiad zakończony sukcesem` | `Szpiedzy zdobyli informacje o celu i pozostali niewykryci.` |
| `success_detected` | `Zwiad zakończony sukcesem` | `Szpiedzy zdobyli informacje, ale zostali wykryci podczas odwrotu.` |
| `failure_detected` | `Zwiad zakończony porażką` | `Szpiedzy zostali wykryci, zanim zdobyli użyteczne informacje.` |
| `failure_undetected` | `Zwiad zakończony porażką` | `Zwiad nie przyniósł użytecznych informacji, ale szpiedzy pozostali niewykryci.` |

### 10.3 Spy outcome text matrix - EN

| `spyReport.outcomeKey` | `shell.title` / `spyReport.title` | `shell.summary` / `spyReport.summary` |
|---|---|---|
| `success_undetected` | `Scouting succeeded` | `The spies gathered information about the target and remained undetected.` |
| `success_detected` | `Scouting succeeded` | `The spies gathered information, but were detected while withdrawing.` |
| `failure_detected` | `Scouting failed` | `The spies were detected before they gathered useful information.` |
| `failure_undetected` | `Scouting failed` | `The scouting attempt produced no useful information, but the spies remained undetected.` |

### 10.4 Spy empty states - PL

| Path | Value |
|---|---|
| `spyReport.emptyStates.noBuildings` | `Nie udało się ustalić stanu budynków.` |
| `spyReport.emptyStates.noEquipment` | `Nie udało się ustalić ekwipunku celu.` |
| `spyReport.emptyStates.noResources` | `Nie udało się ustalić zasobów celu.` |
| `spyReport.emptyStates.noVisibleData` | `Zwiad nie przyniósł użytecznych informacji.` |

### 10.5 Spy empty states - EN

| Path | Value |
|---|---|
| `spyReport.emptyStates.noBuildings` | `Building state could not be determined.` |
| `spyReport.emptyStates.noEquipment` | `Target equipment could not be determined.` |
| `spyReport.emptyStates.noResources` | `Target resources could not be determined.` |
| `spyReport.emptyStates.noVisibleData` | `The scouting attempt produced no useful information.` |

### 10.6 Spy omitted private details

PL:

| Path | Value |
|---|---|
| `spyReport.privateDetailsOmitted` | `true` |
| `spyReport.privateDetailsOmittedLabel` | `Ten widok nie ujawnia prywatnych identyfikatorów ani danych kont.` |

EN:

| Path | Value |
|---|---|
| `spyReport.privateDetailsOmitted` | `true` |
| `spyReport.privateDetailsOmittedLabel` | `This view does not expose private identifiers or account data.` |

## 11. Missing-token / unavailable payload shape

When the requested token is blank, missing, unknown, or not a supported public PvP report, the payload still has the full top-level contract identity and `sections`, but no report content.

Required unavailable shape:

```ts
{
  contractKey: 'pvp_report_copy';
  contractVersion: 'pvp_report_copy_v1';
  requestedLocale: string;
  locale: 'pl' | 'en';
  fallbackLocale: 'en';

  visibility: 'public';
  reportId: null;
  publicToken: string | null;
  reportKind: null;

  access: {
    viewerRole: 'viewer';
    isAvailable: false;
    notFoundKey: 'public_report_not_found' | 'public_pvp_report_unsupported';
    notFoundLabel: string;
  };

  shell: null;
  sections: PvpPublicReportSectionsCopy;

  attackReport: null;
  spyReport: null;
}
```

Frontend behavior:

- Render `sections.notFound.title` and `sections.notFound.text`, or `access.notFoundLabel` according to the existing error/empty-state pattern.
- Do not infer that the token was valid.
- Do not retry with private report RPC.
- Do not direct-read `game_reports`.
- Do not render public report shell if `shell === null`.
- Do not render `attackReport` or `spyReport` if null.

## 12. Path inventory and UI usage

### 12.1 Root

| Path | Type | UI usage |
|---|---|---|
| `contractKey` | literal | Mapper contract validation. |
| `contractVersion` | literal | Mapper contract validation. |
| `requestedLocale` | string | Diagnostics only. |
| `locale` | `'pl' \| 'en'` | Diagnostics, optional locale confirmation. |
| `fallbackLocale` | `'en'` | Diagnostics. |
| `visibility` | `'public'` | Public/private branch guard. |
| `reportId` | `null` | Must not be used for navigation. |
| `publicToken` | `string \| null` | Public route/share identity. |
| `reportKind` | `'attack' \| 'spy' \| null` | Public report branch discriminator. |
| `access` | object | Availability guard. |
| `shell` | object/null | Header shell. |
| `sections` | object | Section labels and state copy. |
| `attackReport` | object/null | Attack detail copy. |
| `spyReport` | object/null | Spy detail copy. |

### 12.2 Access

| Path | Type | UI usage |
|---|---|---|
| `access.viewerRole` | `'viewer'` | Public viewer role; not auth role. |
| `access.isAvailable` | boolean | Primary availability guard. |
| `access.notFoundKey` | string, unavailable only | Diagnostics/status key. |
| `access.notFoundLabel` | string, unavailable only | Unavailable state copy. |

### 12.3 Shell

| Path | Type | UI usage |
|---|---|---|
| `shell.eyebrow` | string | Page eyebrow. |
| `shell.title` | string | Main heading. |
| `shell.summary` | string | Lead paragraph/summary. |
| `shell.createdAt` | string | Timestamp display. |
| `shell.publicToken` | string | Public share key. |
| `shell.reportTypeLabel` | string | Report type label/badge. |
| `shell.sourceLabel` | string | Source label/badge. |
| `shell.visibilityLabel` | string | Public visibility label/badge. |
| `shell.participants` | array | Public participant list. |

### 12.4 Participant row

| Path | Type | UI usage |
|---|---|---|
| `shell.participants[].participantRole` | string | Display grouping only. |
| `shell.participants[].sideLabel` | string/null | Optional side label. |
| `shell.participants[].displayName` | string | Display name. |
| `shell.participants[].levelSnapshot` | number/null | Level display. |
| `shell.participants[].sortOrder` | number | Sort order. |

### 12.5 Section objects

| Path | Type | UI usage |
|---|---|---|
| `sections.result.label` | string | Result section title. |
| `sections.result.emptyLabel` | string | Empty result state. |
| `sections.combat.label` | string | Combat section title. |
| `sections.combat.emptyLabel` | string | Empty combat state. |
| `sections.participants.label` | string | Participants section title. |
| `sections.participants.emptyLabel` | string | Empty participants state. |
| `sections.spy.label` | string | Spy section title. |
| `sections.spy.emptyLabel` | string | Empty spy state. |
| `sections.resources.label` | string | Resources section title. |
| `sections.resources.privateOmittedLabel` | string | Omitted public resources message. |
| `sections.experience.label` | string | Experience section title. |
| `sections.experience.privateOmittedLabel` | string | Omitted public XP message. |
| `sections.publicNotice.title` | string | Public notice title. |
| `sections.publicNotice.text` | string | Public notice text. |
| `sections.notFound.title` | string | Not-found title. |
| `sections.notFound.text` | string | Not-found text. |

### 12.6 Attack report

| Path | Type | UI usage |
|---|---|---|
| `attackReport.reportKind` | `'attack'` | Attack discriminator. |
| `attackReport.viewerRole` | `'viewer'` | Public viewer role. |
| `attackReport.outcomeKey` | attack outcome union | Styling/branch key. |
| `attackReport.title` | string | Result title. |
| `attackReport.summary` | string | Result summary. |
| `attackReport.resultTitle` | string | Result section title. |
| `attackReport.resultNarrative` | string | Result section narrative. |
| `attackReport.experienceLines` | empty array | Always empty publicly. |
| `attackReport.resourceLine` | null | Always null publicly. |
| `attackReport.gloryLine` | null | Always null publicly. |
| `attackReport.privateDetailsOmitted` | true | Omitted private details flag. |
| `attackReport.privateDetailsOmittedLabel` | string | Omitted private details text. |

### 12.7 Spy report

| Path | Type | UI usage |
|---|---|---|
| `spyReport.reportKind` | `'spy'` | Spy discriminator. |
| `spyReport.viewerRole` | `'viewer'` | Public viewer role. |
| `spyReport.outcomeKey` | spy outcome union | Styling/branch key. |
| `spyReport.title` | string | Result title. |
| `spyReport.summary` | string | Result summary. |
| `spyReport.emptyStates.noBuildings` | string | Empty buildings state. |
| `spyReport.emptyStates.noEquipment` | string | Empty equipment state. |
| `spyReport.emptyStates.noResources` | string | Empty resources state. |
| `spyReport.emptyStates.noVisibleData` | string | Empty no-visible-data state. |
| `spyReport.privateDetailsOmitted` | true | Omitted private details flag. |
| `spyReport.privateDetailsOmittedLabel` | string | Omitted private details text. |

## 13. Suggested mapper behavior

The mapper should be small and strict:

1. Accept the raw `jsonb` return type from `get_public_pvp_report_copy`.
2. Verify `contractKey === 'pvp_report_copy'`.
3. Verify `contractVersion === 'pvp_report_copy_v1'`.
4. Verify `visibility === 'public'`.
5. Verify `reportId === null`.
6. Verify `locale` is `pl` or `en`.
7. Verify `fallbackLocale === 'en'`.
8. Verify `access.viewerRole === 'viewer'`.
9. Verify `access.isAvailable` is boolean.
10. Verify `sections` exists and includes all required nested section paths.
11. If `access.isAvailable === false`:
    - verify `reportKind === null`;
    - verify `shell === null`;
    - verify `attackReport === null`;
    - verify `spyReport === null`;
    - verify `access.notFoundKey` and `access.notFoundLabel` are strings.
12. If `reportKind === 'attack'`:
    - verify `shell` exists;
    - verify `attackReport` exists;
    - verify `spyReport === null`;
    - verify `attackReport.reportKind === 'attack'`;
    - verify `attackReport.viewerRole === 'viewer'`;
    - verify `attackReport.outcomeKey` is one of `attacker_victory`, `defender_victory`, `draw`;
    - verify `attackReport.experienceLines` is an empty array;
    - verify `attackReport.resourceLine === null`;
    - verify `attackReport.gloryLine === null`;
    - verify `attackReport.privateDetailsOmitted === true`.
13. If `reportKind === 'spy'`:
    - verify `shell` exists;
    - verify `spyReport` exists;
    - verify `attackReport === null`;
    - verify `spyReport.reportKind === 'spy'`;
    - verify `spyReport.viewerRole === 'viewer'`;
    - verify `spyReport.outcomeKey` is one of `success_undetected`, `success_detected`, `failure_undetected`, `failure_detected`;
    - verify all `spyReport.emptyStates.*` strings exist;
    - verify `spyReport.privateDetailsOmitted === true`.
14. Verify `shell.participants` is an array when `shell` exists.
15. Verify each participant row has:
    - `participantRole` string;
    - `sideLabel` string or null;
    - `displayName` string;
    - `levelSnapshot` number or null;
    - `sortOrder` number.
16. Return the typed `PvpPublicReportCopy` object.
17. Do not substitute Polish or English local fallback strings in the mapper.

If the project already has a shared copy-contract assertion helper, reuse it. Do not create a broad generic framework inside this slice.

## 14. Component consumption rules

Public report detail should consume:

```ts
this.gameCopy.getCopy('player.pvp.report.public', {
  locale,
  publicToken,
})
```

Use `access.isAvailable` as the first render guard.

When `access.isAvailable === false`, render the unavailable state from:

```ts
sections.notFound.title
sections.notFound.text
```

or:

```ts
access.notFoundLabel
```

according to the existing page error/empty-state pattern.

Use `shell` only when non-null.

Use `shell.eyebrow`, `shell.title`, `shell.summary`, `shell.createdAt`, `shell.reportTypeLabel`, `shell.sourceLabel`, and `shell.visibilityLabel` for the public report header.

Use `shell.participants` for public participant display. Do not infer private identity from participants.

For attack reports:

```ts
copy.reportKind === 'attack'
copy.attackReport !== null
copy.spyReport === null
```

Use:

```ts
attackReport.resultTitle
attackReport.resultNarrative
attackReport.privateDetailsOmittedLabel
```

Do not render private XP/resource/Chwała detail rows because the public contract intentionally returns:

```ts
experienceLines: []
resourceLine: null
gloryLine: null
```

For spy reports:

```ts
copy.reportKind === 'spy'
copy.spyReport !== null
copy.attackReport === null
```

Use:

```ts
spyReport.title
spyReport.summary
spyReport.emptyStates
spyReport.privateDetailsOmittedLabel
```

Do not use spy result table snapshots directly as copy sources.

## 15. Files Codex will likely need to touch

Expected files, adjusted to the existing project layout:

```text
src/app/core/constants/rpc.const.ts
src/app/core/types/game-copy-registry.types.ts
src/app/core/types/game-copy-reader.types.ts
src/app/core/services/game-copy/game-copy-player.readers.ts
src/app/core/domain/player/pvp-public-report-copy.model.ts
src/app/core/utils/pvp-public-report-copy.mapper.ts
```

Public report route/component files may also need to consume the new GameCopy kind, depending on current routing:

```text
src/app/game/**/*
src/app/public/**/*
src/app/core/**/*
```

Do not edit:

```text
src/app/core/types/database.types.ts
```

The user/Migrator supplies generated Supabase types.

## 16. Generated type requirement

This DB/RPC change requires regenerated Supabase database types before Codex consumes it.

Expected generated function key:

```ts
Database['public']['Functions']['get_public_pvp_report_copy']
```

Expected generated args conceptually:

```ts
{
  p_locale?: string | null;
  p_public_token?: string | null;
}
```

Expected generated return type:

```ts
Json
```

Codex must not create manual generated-type substitutes if this function is missing from `database.types.ts`.

## 17. Acceptance checks for Codex

Codex should report:

```text
- get_public_pvp_report_copy reader added under GameCopyService.
- player.pvp.report.public registered in GameCopyRegistry and GameCopyReaders.
- PvpPublicReportCopy named types are not declared inside components.
- Mapper validates contract identity, public visibility, availability shape, shell shape, sections shape, attack shape and spy shape.
- Public detail UI uses GameCopyService for player-facing public report copy.
- No local player-facing fallback copy was added.
- No direct reads of game_reports, pvp_attack_results or pvp_spy_results were added for public report copy.
- No private report id, hero id, user id, estate id, combat result id or PvP action id is exposed from the public mapper/UI.
- No player-facing PvP string was added.
- No player-facing Punkty Postaci string was added.
- No player-facing prestiż string was added.
- No raw Chwała delta is rendered.
- database.types.ts was not edited.
```

Suggested static greps:

```bash
rg "get_public_pvp_report_copy|player\.pvp\.report\.public|mapPvpPublicReportCopy|PvpPublicReportCopy" src/app/core src/app/game src/app/public
rg "PvP|Punkty Postaci|prestiż|timer|raw.*Chwała|gloryDelta|prestigeDelta" src/app/core src/app/game src/app/public
rg "from\\(['\"]game_reports|from\\(['\"]pvp_attack_results|from\\(['\"]pvp_spy_results" src/app/core src/app/game src/app/public
rg "publicToken|reportId|heroId|userId|estateId|combatResultId|pvpActionId" src/app/core src/app/game src/app/public
```

The greps may find unrelated existing code. Codex must classify each hit as touched scope, existing cleanup candidate, legitimate internal key, or blocker.

## 18. DB verification reference

The DB contract was verified with:

```text
function: get_public_pvp_report_copy
identity arguments: p_locale text, p_public_token text
result: jsonb
volatility: stable
security definer: true
anon execute: true
authenticated execute: true
anon direct SELECT on game_reports: false
anon direct SELECT on pvp_attack_results: false
anon direct SELECT on pvp_spy_results: false
```

Payload verification:

```text
payloadCount: 30
allContractKeysOk: true
allContractVersionsOk: true
allPublicVisibilityOk: true
allViewerRoleOk: true
allDeFallbackToEn: true
containsUppercasePvp: false
containsCharacterPointsPl: false
containsPrestigePl: false
containsTimer: false
exposesNonNullReportId: false
```

Smoke coverage:

```text
latest combat PL: available attack report
latest combat EN: available attack report
latest spy PL: available spy report
latest spy EN: available spy report
missing token PL: unavailable public report
```

## 19. Handoff summary for Reviewer/Codex

Scope:

```text
Public-safe resolved copy for shared public combat/spy reports.
```

DB/RPC contract:

```text
public.get_public_pvp_report_copy(p_locale text default 'pl', p_public_token text default null::text) returns jsonb
```

GameCopy kind:

```text
player.pvp.report.public
```

Frontend authority:

```text
GameCopyService + RPC only.
No direct table reads.
No local report narrative composition.
No local player-facing fallback copy.
```

Public safety:

```text
reportId is null.
publicToken is returned.
viewerRole is always viewer.
Private ids are not returned.
Private loot/XP/Chwała details are omitted.
```

Regeneration:

```text
Regenerate Supabase database types before frontend implementation.
```
