# Mythsworn - `pvp.result` Copy / Snapshot Frontend Contract v1

Status: active after DB migration  
Audience: Codex / frontend integration  
Owner: final PvP result source-domain copy  
Copy/debug RPC:

```sql
public.get_pvp_result_copy(p_locale text default 'pl') returns jsonb
```

Canonical source-domain snapshot storage:

```text
pvp_attack_results.report_context_json.pvpResult
```

Frontend must not direct-read that table. The snapshot must be exposed through report detail/public report detail RPCs before frontend integration.

## 1. Contract identity

Copy/debug RPC:

```ts
contractKey: 'pvp_result_copy'
contractVersion: 'pvp_result_copy_v1'
gameCopyKind: 'pvp.result'
```

Snapshot:

```ts
contractKey: 'pvp_result_snapshot'
contractVersion: 'pvp_result_snapshot_v1'
sourceOwner: 'pvp.result'
```

Summary:

```ts
contractKey: 'pvp_result_summary'
contractVersion: 'pvp_result_summary_v1'
sourceOwner: 'pvp.result'
```

Glory sentence:

```ts
contractKey: 'pvp_result_glory_sentence'
contractVersion: 'pvp_result_glory_sentence_v1'
```

## 2. Purpose

`pvp.result` owns final PvP result presentation:

- result outcome;
- XP;
- resources / loot / ransom;
- Chwała for private attacker/defender perspectives only.

It does not own:

- active action/travel/manual-auto decision copy - `pvp.action`;
- live combat meter/UI - `combat.common`;
- Koszary/Forteca/blessing/curse effect summaries - `pvp.combat`;
- report shell/list labels - Reports copy.

## 3. Core rules

```ts
rules.summaryRichTextIsSingleMainResult = true;
rules.neutralPerspectiveIncludesGlory = false;
rules.privatePerspectivesIncludeGlory = true;
```

Frontend renders:

```text
title
summaryRichText
```

Frontend does not render `experienceLines`, `resourceLine`, or `gloryLine` as the primary result once `pvpResult` is available.

Frontend must not compose the result from raw reward/resource/prestige context.

## 4. TypeScript model

```ts
export type PvpResultOutcomeKey =
  | 'attacker_victory'
  | 'defender_victory'
  | 'draw';

export type PvpResultPerspective =
  | 'attacker'
  | 'defender'
  | 'neutral';

export type RichTextTone =
  | 'heading'
  | 'info'
  | 'warn'
  | 'success'
  | 'danger'
  | 'muted';

export interface RichTextFragment {
  kind: 'text' | 'value';
  text: string;
  tone?: RichTextTone;
}

export interface PvpResultCopy {
  contractKey: 'pvp_result_copy';
  contractVersion: 'pvp_result_copy_v1';
  gameCopyKind: 'pvp.result';
  requestedLocale: string;
  locale: 'pl';
  fallbackLocale: 'pl';
  rules: {
    summaryRichTextIsSingleMainResult: true;
    neutralPerspectiveIncludesGlory: false;
    privatePerspectivesIncludeGlory: true;
  };
  resultSummaries: unknown;
  glorySentences: unknown;
  legacy: unknown;
}

export interface PvpResultSnapshotV1 {
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

export interface PvpResultSummaryV1 {
  contractKey: 'pvp_result_summary';
  contractVersion: 'pvp_result_summary_v1';
  sourceOwner: 'pvp.result';
  locale: 'pl';
  outcomeKey: PvpResultOutcomeKey;
  perspective: PvpResultPerspective;
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

export interface PvpResultGlorySentenceV1 {
  contractKey: 'pvp_result_glory_sentence';
  contractVersion: 'pvp_result_glory_sentence_v1';
  messageKind: string;
  plainText: string;
  richText: RichTextFragment[];
}
```

## 5. Source-domain snapshot access

Preferred private report detail exposure:

```text
get_report_detail(...).report.domainContextJson.pvpResult
```

or equivalent explicit path.

Preferred public report detail exposure:

```text
get_public_report_detail(...).report.domainContextJson.pvpResult
```

or equivalent explicit path.

If `pvpResult` is missing from report detail RPCs, this is a DB/RPC read-model gap. Codex must stop and report it.

Codex must not direct-read:

```text
pvp_attack_results.report_context_json
```

## 6. Perspective selection

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

Neutral/public result never includes Chwała.

## 7. Result summary variants

### `attackerVictory.attackerPerspective`

```ts
{
  title: 'Zdobycze po walce',
  plainText: 'Pokonujesz {defenderName} i zdobywasz {xpValue} punktów doświadczenia. Twoi ludzie plądrują posiadłość obrońcy i zabierają {drachmaValue} drachm, {materialsValue} materiałów, {workforceValue} siły roboczej. {glorySentence}',
  includesGlory: true
}
```

### `attackerVictory.defenderPerspective`

```ts
{
  title: 'Straty po walce',
  plainText: '{attackerName} przełamuje twoją obronę i zdobywa {xpValue} punktów doświadczenia. Jego ludzie plądrują twoją posiadłość i zabierają {drachmaValue} drachm, {materialsValue} materiałów, {workforceValue} siły roboczej. {glorySentence}',
  includesGlory: true
}
```

### `attackerVictory.neutralPerspective`

```ts
{
  title: 'Zdobycze po walce',
  plainText: 'Atak {attackerName} na {defenderName} zakończył się sukcesem. {attackerName} zdobywa {xpValue} punktów doświadczenia. Jego ludzie plądrują posiadłość obrońcy i zabierają {drachmaValue} drachm, {materialsValue} materiałów, {workforceValue} siły roboczej.',
  includesGlory: false
}
```

### `defenderVictory.attackerPerspective`

```ts
{
  title: 'Napad odparty',
  plainText: '{defenderName} odpiera twój atak i zdobywa {xpValue} punktów doświadczenia. Musisz zapłacić zwycięzcy {drachmaValue} drachm, {materialsValue} materiałów, {workforceValue} siły roboczej, żeby pozwolił ci wrócić do twojej posiadłości. {glorySentence}',
  includesGlory: true
}
```

### `defenderVictory.defenderPerspective`

```ts
{
  title: 'Obrona zwycięża',
  plainText: 'Odpierasz atak bohatera {attackerName} i zdobywasz {xpValue} punktów doświadczenia. Zgadzasz się wypuścić napastnika, po tym jak zapłaci {drachmaValue} drachm, {materialsValue} materiałów, {workforceValue} siły roboczej. {glorySentence}',
  includesGlory: true
}
```

### `defenderVictory.neutralPerspective`

```ts
{
  title: 'Napad odparty',
  plainText: 'Atak {attackerName} na {defenderName} został odparty. {defenderName} zdobywa {xpValue} punktów doświadczenia. Obrońca wspaniałomyślnie puszcza napastnika wolno, nie zapominając o odebraniu okupu za jego wolność, który wynosi {drachmaValue} drachm, {materialsValue} materiałów, {workforceValue} siły roboczej.',
  includesGlory: false
}
```

### `draw.attackerPerspective`

```ts
{
  title: 'Nierozstrzygnięte starcie',
  plainText: 'Twój atak na {defenderName} kończy się bez rozstrzygnięcia. Bez zdobyczy, bez doświadczenia udajesz się w podróż powrotną do swojej posiadłości. {glorySentence}',
  includesGlory: true
}
```

### `draw.defenderPerspective`

```ts
{
  title: 'Nierozstrzygnięte starcie',
  plainText: 'Atak bohatera {attackerName} na twoją posiadłość kończy się bez rozstrzygnięcia. Choć w tym boju nic nie zdobyłeś, dziękujesz bogom, wiedząc ile mogłeś stracić. {glorySentence}',
  includesGlory: true
}
```

### `draw.neutralPerspective`

```ts
{
  title: 'Nierozstrzygnięte starcie',
  plainText: 'Atak {attackerName} na {defenderName} kończy się bez rozstrzygnięcia. Zgadzając się odłożyć pojedynek na inny czas, bohaterowie odstąpili od siebie i wrócili do własnych zajęć.',
  includesGlory: false
}
```

## 8. Rich text tone rules

| Fragment | Tone |
|---|---|
| `{attackerName}` | `heading` |
| `{defenderName}` | `heading` |
| `{xpValue}` | `heading` |
| `{drachmaValue}` | `heading` |
| `{materialsValue}` | `heading` |
| `{workforceValue}` | `heading` |
| `Chwała` | `heading` |
| `wzrosła` | `heading` |
| `ucierpiała` | `heading` |
| `{rankName}` | `heading` |
| `nieznacznie`, `wyraźnie`, `drastycznie`, `dramatycznie` | normal |
| `się nie zmieniła` | normal |

No `success` / `danger` for Chwała.

## 9. Glory sentence variants

Neutral/public perspective does not use these.

| Key | Backend message kinds | Text |
|---|---|---|
| `minorGain` | `minor_increase`, `minorGain` | `Wieść o tym starciu rozejdzie się między ludźmi. Twoja Chwała nieznacznie wzrosła.` |
| `majorGain` | `significant_increase`, `majorGain`, `significantGain` | `Pieśni o tym starciu będą rozbrzmiewać w całej Helladzie. Twoja Chwała wyraźnie wzrosła.` |
| `dramaticGain` | `dramatic_increase`, `dramaticGain` | `O tym starciu usłyszeli nawet bogowie na Olimpie. Twoja Chwała drastycznie wzrosła.` |
| `noChange` | `no_change`, `noChange` | `O tym pojedynku wspomną co najwyżej w podłych spelunach po czwartym kielichu wina. Twoja Chwała się nie zmieniła.` |
| `minorLoss` | `minor_decrease`, `minorLoss` | `Wieść o tym starciu nie przyniesie ci zaszczytów. Twoja Chwała nieznacznie ucierpiała.` |
| `majorLoss` | `significant_decrease`, `majorLoss`, `significantLoss` | `Pieśni o tym starciu będą rozbrzmiewać w całej Helladzie, ale nie ku twojej radości. Twoja Chwała wyraźnie ucierpiała.` |
| `dramaticLoss` | `dramatic_decrease`, `dramaticLoss` | `Bogowie! Gdyby tylko dało się uciszyć poetów, którzy śpiewają o tym starciu. Twoja Chwała dramatycznie ucierpiała.` |
| `rankUp` | `rank_up`, `rankUp` | `O Twojej Chwale słychać na odległych krańcach Hellady. Twoja ranga wzrasta do {rankName}.` |
| `rankDown` | `rank_down`, `rankDown` | `Hańba, którą się okrywasz sprawia, że Twoje znaczenie w świecie spada. Twoja nowa ranga to {rankName}.` |

## 10. Frontend rendering rules

Render:

```ts
summary.title
summary.summaryRichText
```

Do not render `summaryPlainText` if `summaryRichText` exists.

Do not render `technicalContext`.

Do not split result into separate local XP/resources/Chwała sentences.

Do not show Chwała in public/neutral perspective.

## 11. Legacy contracts replaced

The following legacy fields are replaced as primary source by `pvp.result`:

```text
get_pvp_report_copy(...).attackReport.resultTitle
get_pvp_report_copy(...).attackReport.resultNarrative
get_pvp_report_copy(...).attackReport.experienceLines[]
get_pvp_report_copy(...).attackReport.resourceLine
get_pvp_report_copy(...).attackReport.gloryLine
get_public_pvp_report_copy(...).attackReport.*
```

Legacy wrappers may still exist for compatibility, but frontend should not use them as the new source of truth once `pvpResult` is exposed by report detail read model.

## 12. Current required read-model exposure

Required private exposure:

```ts
report.domainContextJson.pvpResult.private.attacker
report.domainContextJson.pvpResult.private.defender
```

Required public exposure:

```ts
report.domainContextJson.pvpResult.public.neutral
```

If this is missing, Codex must report a DB/RPC gap.

## 13. Acceptance checks

Codex must report:

```text
- pvp.result snapshot is consumed from a report detail/public detail read model, not direct table reads.
- Private report renders attacker or defender summary based on active hero.
- Public report renders neutral summary only.
- Public report does not render Chwała.
- Result text is rendered from summaryRichText.
- No Angular-local XP/resource/Chwała sentence composition was added.
- Legacy get_pvp_report_copy fields are not used as primary final result source after pvpResult exposure.
- database.types.ts was not edited manually.
```
