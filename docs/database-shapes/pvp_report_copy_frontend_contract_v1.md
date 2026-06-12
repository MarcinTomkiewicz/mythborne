# `get_pvp_report_copy` frontend contract v1

Status: **verified on DB**.

This contract describes the canonical private resolved GameCopy RPC for player-facing hero combat and spy report copy.

The RPC exists and was verified as:

| signature | identity_arguments | result_type | volatility | security_definer |
|---|---|---|---|---|
| `get_pvp_report_copy(text,uuid)` | `p_locale text, p_report_id uuid` | `jsonb` | `s` | `true` |

Privileges were verified as:

| role | execute |
|---|---:|
| `anon` | false |
| `authenticated` | true |

Helper functions are internal only and are not executable by `anon` or `authenticated`.

---

## 1. GameCopyService registration

Recommended frontend kind:

```ts
'player.pvp.report.private'
```

Reader arguments:

```ts
interface PvpPrivateReportCopyArgs {
  locale?: string;
  reportId: string;
}
```

RPC call:

```ts
get_pvp_report_copy(p_locale: string, p_report_id: string)
```

Frontend rule:

```text
All player-facing report copy for hero combat and spy report detail must come from GameCopyService.

Do not read player-facing report labels, titles, summaries, source labels, event type labels, reward text, resource text, XP text, Chwała text, or spy summary text from:
- get_report_detail(...)
- get_reports_center_page_context(...)
- raw report metadata
- local mappers
- local fallback strings
```

`get_report_detail(...)` may still provide ids, technical keys, report state, domain data, combat data and non-copy runtime structure, but it is not a copy source.

---

## 2. Locale behavior

Accepted input:

```ts
p_locale: string | null | undefined
```

Resolution:

| Input | Returned `locale` |
|---|---|
| `pl`, `pl-PL`, any `pl%` | `pl` |
| `en`, `en-US`, unsupported locale such as `de` | `en` |

Returned top-level locale fields:

```ts
interface LocaleHeader {
  requestedLocale: string;
  locale: 'pl' | 'en';
  fallbackLocale: 'en';
}
```

---

## 3. Auth and access rules

This is a private resolved copy RPC.

Rules:

```text
- Requires authenticated user.
- `auth.uid()` must match a hero that has access to the report through `game_report_hero_access`.
- `anon` must not execute this function.
- If the report is missing, inaccessible, or not a supported combat/spy report, the RPC raises.
```

Returned access object:

```ts
interface PvpReportCopyAccess {
  heroId: string;
  accessRole: string;
  viewerRole: 'attacker' | 'defender' | 'viewer' | 'spy_owner' | 'target';
}
```

For attack reports:

```text
attacker: current user's hero is the attacker
defender: current user's hero is the defender
viewer: current user's hero has access but is neither attacker nor defender
```

For spy reports:

```text
spy_owner: current user's hero sent the spies
target: current user's hero was the target
viewer: current user's hero has access but is neither spy_owner nor target
```

---

## 4. Supported reports

Supported report types:

| `game_reports.report_type_key` | `game_reports.source_entity_type` | Returned `reportKind` |
|---|---|---|
| `pvp_combat` | `pvp_result` | `attack` |
| `pvp_spy` | `pvp_result` | `spy` |

Unsupported report types must not be handled by frontend fallbacks.

---

## 5. Forbidden output strings

The frontend should assert or log if these appear in a returned player-facing payload:

```text
PvP
Punkty Postaci
prestiż
timer
```

Verified sample result:

| contains_uppercase_pvp | contains_character_points_label | contains_prestiz_word | contains_timer_word |
|---:|---:|---:|---:|
| false | false | false | false |

Player-facing term for prestige is:

```text
Chwała
```

Numeric Chwała deltas are intentionally not exposed.

---

## 6. Top-level shape

```ts
interface PvpReportCopy {
  contractKey: 'pvp_report_copy';
  contractVersion: 'pvp_report_copy_v1';
  requestedLocale: string;
  locale: 'pl' | 'en';
  fallbackLocale: 'en';

  visibility: 'private';
  reportId: string;
  publicToken: string | null;
  reportKind: 'attack' | 'spy';

  access: PvpReportCopyAccess;

  shell: PvpReportShellCopy;
  sections: PvpReportSectionsCopy;

  attackReport: PvpAttackReportCopy | null;
  spyReport: PvpSpyReportCopy | null;
}
```

Branch rules:

```text
if reportKind = 'attack':
  attackReport is not null
  spyReport is null

if reportKind = 'spy':
  spyReport is not null
  attackReport is null
```

---

## 7. Shell shape

```ts
interface PvpReportShellCopy {
  eyebrow: string;
  sourceLabel: string;
  eventTypeLabel: string;
  title: string;
  summary: string;
}
```

Attack shell PL:

| Path | Text |
|---|---|
| `shell.eyebrow` | `Raport walki` |
| `shell.sourceLabel` | `Walka` |
| `shell.eventTypeLabel` | `Walka bohaterów` |
| `shell.title` | dynamic attack result title |
| `shell.summary` | dynamic attack result narrative |

Spy shell PL:

| Path | Text |
|---|---|
| `shell.eyebrow` | `Raport szpiegowania` |
| `shell.sourceLabel` | `Szpiegowanie` |
| `shell.eventTypeLabel` | `Zwiad` |
| `shell.title` | dynamic spy title |
| `shell.summary` | dynamic spy summary |

---

## 8. Sections shape

```ts
interface PvpReportSectionsCopy {
  result: string;
  resources?: string;
  battleLoot?: string;
  experience?: string;
  glory?: string;
  combat?: string;

  spy?: string;
  buildings?: string;
  equipment?: string;
  stats?: string;
  detection?: string;
}
```

Attack sections PL:

| Path | Text |
|---|---|
| `sections.result` | `Wynik starcia` |
| `sections.battleLoot` | `Łup po walce` |
| `sections.resources` | `Zasoby` |
| `sections.experience` | `Doświadczenie` |
| `sections.glory` | `Chwała` |
| `sections.combat` | `Przebieg starcia` |

Spy sections PL:

| Path | Text |
|---|---|
| `sections.result` | `Wynik starcia` |
| `sections.spy` | `Zwiad` |
| `sections.resources` | `Zasoby` |
| `sections.buildings` | `Budynki` |
| `sections.equipment` | `Ekwipunek` |
| `sections.stats` | `Cechy` |
| `sections.detection` | `Wykrycie` |

Note: `sections.result = Wynik starcia` is currently returned for spy too. Do not locally rename it in frontend; raise contract feedback if a different label is needed.

---

## 9. Attack report shape

```ts
interface PvpAttackReportCopy {
  outcomeKey: 'attacker_victory' | 'defender_victory' | 'draw' | string;
  viewerRole: 'attacker' | 'defender' | 'viewer';

  result: {
    title: string;
    narrativePlainText: string;
  };

  experience: {
    rows: PvpExperienceRow[];
    lines: PvpExperienceLine[];
  };

  resources: {
    line: string;
    gainRows: PvpResourceRow[];
    lossRows: PvpResourceRow[];
  };

  glory: PvpGloryCopy;
}
```

---

## 10. Attack result title/narrative variants - PL

### `attacker_victory` + viewer `attacker`

| Field | Text |
|---|---|
| `title` | `Zwycięstwo po ciężkim boju` |
| `narrativePlainText` | `Po trudnym boju przełamałeś obronę przeciwnika i wyszedłeś ze starcia zwycięsko.` |

### `attacker_victory` + viewer `defender`

| Field | Text |
|---|---|
| `title` | `Obrona przełamana` |
| `narrativePlainText` | `Po trudnym boju twoja obrona pękła. Przeciwnik opuścił twoją posiadłość z łupem.` |

### `defender_victory` + viewer `attacker`

| Field | Text |
|---|---|
| `title` | `Atak odparty` |
| `narrativePlainText` | `Twój atak załamał się pod obroną przeciwnika. Wracasz do posiadłości bez łupu.` |

### `defender_victory` + viewer `defender`

| Field | Text |
|---|---|
| `title` | `Obrona zakończona zwycięstwem` |
| `narrativePlainText` | `Twoja obrona wytrzymała natarcie. Odpierasz przeciwnika i zatrzymujesz go u bram posiadłości.` |

### `attacker_victory` + public/neutral viewer

| Field | Text |
|---|---|
| `title` | `Zwycięstwo po ciężkim boju` |
| `narrativePlainText` | `Po trudnym boju atakujący przełamał obronę posiadłości i wyszedł ze starcia zwycięsko.` |

### `defender_victory` + public/neutral viewer

| Field | Text |
|---|---|
| `title` | `Atak odparty` |
| `narrativePlainText` | `Obrona wytrzymała natarcie. Napastnik musiał wycofać się bez łupu.` |

### `draw` private/neutral

| Field | Text |
|---|---|
| `title` | `Nierozstrzygnięte starcie` |
| `narrativePlainText` | `Starcie przeciągnęło się aż do zachodu słońca. Obie strony odstąpiły od siebie i wróciły do swoich posiadłości. Ten pojedynek trzeba będzie rozstrzygnąć innego dnia.` |

---

## 11. Experience shape and copy

```ts
interface PvpExperienceRow {
  recipientHeroId: string;
  amount: number;
  label: 'Doświadczenie' | 'Experience';
  displayValue: string;
}

interface PvpExperienceLine {
  key: 'ownExperience' | 'opponentExperience';
  recipient: 'viewer' | 'opponent';
  amount: number;
  text: string;
}
```

PL amount formatting:

| Amount | Display |
|---:|---|
| 1 | `1 punkt doświadczenia` |
| 2 | `2 punkty doświadczenia` |
| 5 | `5 punktów doświadczenia` |
| 12 | `12 punktów doświadczenia` |

Line rules:

| Situation | Text |
|---|---|
| current viewer received XP | `Zdobywasz {experienceRichText}.` |
| opponent received XP | `Przeciwnik zdobywa {experienceRichText}.` |
| draw / no XP | no line |

Current runtime returns plain resolved text, for example:

```text
Zdobywasz 10 punktów doświadczenia.
Przeciwnik zdobywa 10 punktów doświadczenia.
```

Important rule:

```text
Defender victory must include experience for the defending winner.
The losing viewer may see opponent experience.
Draw has no experience narrative.
```

---

## 12. Resource row shape and copy

```ts
interface PvpResourceRow {
  key: string;
  resourceType: string;
  label: string;
  amount: number;
  displayValue: string;
}
```

PL labels:

| Resource type | Label |
|---|---|
| `drachma` | `Drachmy` |
| `materials` | `Materiały` |
| `workforce` | `Siła robocza` |

PL amount display:

| Resource type | Example |
|---|---|
| `drachma` | `278 drachm` |
| `materials` | `278 materiałów` |
| `workforce` | `278 siły roboczej` |

Resource line variants - PL:

| Situation | Text |
|---|---|
| attacker victory, attacker view, gained resources | `Plądrujesz jego posiadłość i zabierasz {resourceRichText}.` |
| defender victory, defender view, gained resources | `Odbierasz {resourceRichText} pokonanemu napastnikowi.` |
| defender victory, attacker view, lost resources | `Oddajesz {resourceRichText} zwycięzcy.` |
| generic gain | `Zyskujesz {resourceRichText}.` |
| generic loss | `Tracisz {resourceRichText}.` |
| draw / none | `Nie przejęto ani nie utracono zasobów.` |

Current runtime returns plain resolved text, for example:

```text
Plądrujesz jego posiadłość i zabierasz 278 drachm, 278 materiałów, 278 siły roboczej.
```

---

## 13. Chwała shape and copy

```ts
interface PvpGloryCopy {
  variantKey:
    | 'majorGain'
    | 'minorGain'
    | 'noChange'
    | 'minorLoss'
    | 'majorLoss'
    | 'unavailable';
  linePlainText: string;
  lineRichText: RichTextFragment[];
}

interface RichTextFragment {
  kind: 'text';
  text: string;
  tone?: 'heading' | 'info' | 'warn' | 'success' | 'danger';
}
```

No numeric Chwała amount is exposed.

PL variants:

| Variant | Plain text |
|---|---|
| `majorGain` | `Pieśni o tym starciu będą rozbrzmiewać w całej Helladzie. Twoja Chwała wyraźnie wzrosła.` |
| `minorGain` | `Wieść o tym starciu rozejdzie się między ludźmi. Twoja Chwała nieznacznie wzrosła.` |
| `noChange` | `O tym pojedynku wspomną co najwyżej w podłych spelunach po czwartym kielichu wina. Twoja Chwała się nie zmieniła.` |
| `minorLoss` | `Wieść o tym starciu nie przyniesie ci zaszczytów. Twoja Chwała nieznacznie osłabła.` |
| `majorLoss` | `Pieśni o tym starciu będą rozbrzmiewać w całej Helladzie, ale nie ku twojej radości. Twoja Chwała wyraźnie ucierpiała.` |
| `unavailable` | `Chwała: funkcja na razie niedostępna.` |

Rich text rule - PL:

```text
The word `Chwała` must be its own fragment with `tone: heading`.
```

Example:

```json
{
  "variantKey": "minorGain",
  "linePlainText": "Wieść o tym starciu rozejdzie się między ludźmi. Twoja Chwała nieznacznie wzrosła.",
  "lineRichText": [
    { "kind": "text", "text": "Wieść o tym starciu rozejdzie się między ludźmi. Twoja " },
    { "kind": "text", "text": "Chwała", "tone": "heading" },
    { "kind": "text", "text": " nieznacznie wzrosła." }
  ]
}
```

---

## 14. Spy report shape

```ts
interface PvpSpyReportCopy {
  outcomeKey:
    | 'success_undetected'
    | 'success_detected'
    | 'failure_undetected'
    | 'failure_detected'
    | string;

  viewerRole: 'spy_owner' | 'target' | 'viewer';
  success: boolean;
  detected: boolean;

  result: {
    title: string;
    summary: string;
  };

  emptyStates: {
    noResources: string;
    noBuildings: string;
    noEquipment: string;
    noVisibleData: string;
  };
}
```

---

## 15. Spy outcome variants - PL

Title should not encode detection for the spy owner. Detection is explained in summary.

### Spy owner view - `success_undetected`

| Field | Text |
|---|---|
| `title` | `Zwiad zakończony sukcesem` |
| `summary` | `Twoi szpiedzy skutecznie zdobyli informacje o przeciwniku. Cel pozostaje błogo nieświadomy, że do jego posiadłości przeniknęli twoi ludzie.` |

### Spy owner view - `success_detected`

| Field | Text |
|---|---|
| `title` | `Zwiad zakończony sukcesem` |
| `summary` | `Twoi szpiedzy przeniknęli do posiadłości rywala, ale zostali wykryci i musieli uciekać. Zdobyli jednak dość informacji, by dostarczyć ci pełny raport.` |

### Spy owner view - `failure_undetected`

| Field | Text |
|---|---|
| `title` | `Zwiad zakończony porażką` |
| `summary` | `Twoi szpiedzy musieli uciekać z posiadłości celu, zanim zdołali zebrać użyteczne informacje. Na szczęście przeciwnik nie zauważył ich obecności.` |

### Spy owner view - `failure_detected`

| Field | Text |
|---|---|
| `title` | `Zwiad zakończony porażką` |
| `summary` | `Twoi szpiedzy zostali wykryci, zanim zdołali zdobyć jakiekolwiek informacje. Zdołali ujść z życiem, ale przeciwnik wie, kto wydał rozkaz szpiegowania.` |

### Target view - detected and successful spy

| Field | Text |
|---|---|
| `title` | `Wykryto szpiegów` |
| `summary` | `Wykryłeś szpiegów w swojej posiadłości. Zdołali jednak zdobyć informacje, zanim uszli z życiem.` |

### Target view - detected and failed spy

| Field | Text |
|---|---|
| `title` | `Wykryto szpiegów` |
| `summary` | `Wykryłeś szpiegów w swojej posiadłości. Nie zdołali zdobyć użytecznych informacji i musieli uciekać.` |

Fallback:

| Field | Text |
|---|---|
| `title` | `Zwiad zakończony` |
| `summary` | `Zwiad został rozstrzygnięty.` |

---

## 16. Spy empty states - PL

| Path | Text |
|---|---|
| `spyReport.emptyStates.noResources` | `Nie udało się ustalić zasobów celu.` |
| `spyReport.emptyStates.noBuildings` | `Nie udało się ustalić stanu budynków.` |
| `spyReport.emptyStates.noEquipment` | `Nie udało się ustalić ekwipunku celu.` |
| `spyReport.emptyStates.noVisibleData` | `Zwiad nie przyniósł użytecznych informacji.` |

---

## 17. Verified sample output - attack

Verified sample returned:

```json
{
  "reportKind": "attack",
  "viewerRole": "attacker",
  "outcomeKey": "attacker_victory",
  "resultTitle": "Zwycięstwo po ciężkim boju",
  "resultNarrative": "Po trudnym boju przełamałeś obronę przeciwnika i wyszedłeś ze starcia zwycięsko.",
  "experienceLines": [
    {
      "key": "ownExperience",
      "text": "Zdobywasz 10 punktów doświadczenia.",
      "amount": 10,
      "recipient": "viewer"
    }
  ],
  "resourceLine": "Plądrujesz jego posiadłość i zabierasz 278 drachm, 278 materiałów, 278 siły roboczej.",
  "gloryVariant": "minorGain",
  "gloryLine": "Wieść o tym starciu rozejdzie się między ludźmi. Twoja Chwała nieznacznie wzrosła."
}
```

---

## 18. Verified sample output - spy

Verified sample returned:

```json
{
  "reportKind": "spy",
  "viewerRole": "target",
  "outcomeKey": "success_detected",
  "title": "Wykryto szpiegów",
  "summary": "Wykryłeś szpiegów w swojej posiadłości. Zdołali jednak zdobyć informacje, zanim uszli z życiem.",
  "emptyStates": {
    "noBuildings": "Nie udało się ustalić stanu budynków.",
    "noEquipment": "Nie udało się ustalić ekwipunku celu.",
    "noResources": "Nie udało się ustalić zasobów celu.",
    "noVisibleData": "Zwiad nie przyniósł użytecznych informacji."
  }
}
```

---

## 19. Frontend integration checklist

Codex must:

```text
1. Add GameCopyService reader for `player.pvp.report.private`.
2. The reader calls `get_pvp_report_copy(locale, reportId)`.
3. Report detail UI uses this copy payload for:
   - shell eyebrow/title/summary/source/event type
   - attack result title/narrative
   - attack experience lines
   - attack resource line and rows
   - Chwała line/rich text
   - spy title/summary
   - spy empty states
4. Do not use local fallback copy for these fields.
5. Do not read player-facing labels from report metadata once this reader is wired.
6. Do not expose Character Points.
7. Do not display raw prestige/prestiż wording; use Chwała.
8. Do not display `PvP`.
9. Do not introduce the word `timer`.
```

---

## 20. Acceptance checks for Codex

Frontend/code review should verify:

```text
- No local Polish fallback for copied fields.
- No hardcoded `PvP` in player-facing report surfaces.
- No hardcoded `prestiż`/`Prestige` in player-facing report surfaces except technical keys/comments.
- No `Punkty Postaci` display.
- No local construction of XP/resource/Chwała sentences.
- `Walcz!` remains only CTA in action copy, not report copy.
- `Chwała` rich text fragment with heading tone is preserved if UI supports rich text.
```
