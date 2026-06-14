# Mythsworn - `pvp.combat` Copy Frontend Contract v2

Status: active after DB migration  
Audience: Codex / frontend integration  
Owner: PvP live/manual combat source presentation and participant effect summaries  
RPC:

```sql
public.get_pvp_combat_copy(p_locale text default 'pl') returns jsonb
```

## 1. Contract identity

```ts
contractKey: 'pvp_combat_copy'
contractVersion: 'pvp_combat_copy_v2'
```

Current logical owner:

```text
pvp.combat
```

The payload may still expose legacy naming such as `gameCopyKind: 'player.pvp.combat'`. Validate `contractKey` and `contractVersion` first.

Auth:

```text
anon: false
authenticated: true
```

## 2. Verified v2 cleanup

DB smoke confirmed:

```text
has_report_key = false
has_barracks_title = false
has_fortress_title = false
has_blessing_title = false
has_curse_title = false
has_barracks_rich_template = true
has_fortress_rich_template = true
has_blessing_rich_template = true
has_curse_rich_template = true
```

## 3. Purpose

`pvp.combat` owns:

- PvP-specific live/manual combat header and source presentation;
- PvP participant effect copy templates:
  - Koszary;
  - Forteca;
  - błogosławieństwo;
  - klątwa.

It does not own:

- final PvP result;
- XP after combat;
- resources/loot after combat;
- Chwała after combat;
- report shell/list copy.

Those belong to `pvp.result` or Reports shell contracts.

## 4. TypeScript shape

```ts
export type RichTextTone = 'heading' | 'info' | 'warn' | 'success' | 'danger' | 'muted';

export interface PvpCombatCopy {
  contractKey: 'pvp_combat_copy';
  contractVersion: 'pvp_combat_copy_v2';
  requestedLocale: string;
  locale: 'pl' | 'en';
  fallbackLocale: string;

  sourcePresentation: PvpCombatSourcePresentationCopy;
  context: PvpCombatContextCopy;
  legacy?: PvpCombatLegacyMarkerCopy;
}

export interface PvpCombatSourcePresentationCopy {
  contractKey: 'pvp_combat_source_presentation';
  contractVersion: 'pvp_combat_source_presentation_v1';
  header: PvpCombatHeaderCopy;
  live: PvpCombatLiveCopy;
  emptyLog: PvpCombatMessageCopy;
  workflow: PvpCombatWorkflowCopy;
}

export interface PvpCombatHeaderCopy {
  eyebrow: string;
  title: string;
  text: string;
}

export interface PvpCombatLiveCopy {
  title: string;
  text: string;
  helperText: string;
}

export interface PvpCombatMessageCopy {
  title: string;
  text: string;
}

export interface PvpCombatWorkflowCopy {
  finalizingResult: PvpCombatMessageCopy;
  finalizeUnavailable: PvpCombatMessageCopy;
  actionUnavailable: PvpCombatMessageCopy;
}

export interface PvpCombatContextCopy {
  contractKey?: string;
  contractVersion?: string;
  emptyLabel?: string;
  participantEffectTemplates: PvpCombatParticipantEffectTemplatesCopy;
}

export interface PvpCombatParticipantEffectTemplatesCopy {
  attackerBarracksHealth: PvpCombatParticipantEffectTemplateCopy;
  defenderFortressHealth: PvpCombatParticipantEffectTemplateCopy;
  blessing: PvpCombatParticipantEffectTemplateCopy;
  curse: PvpCombatParticipantEffectTemplateCopy;
}

export interface PvpCombatParticipantEffectTemplateCopy {
  key: string;
  participantRole: string;
  sourceKey: 'barracks' | 'fortress' | 'blessing' | 'curse';
  summaryPlainTemplate: string;
  summaryRichTextTemplate: RichTextFragment[];
  valueDisplay?: string;
  requiredPlaceholders?: string[];
  tone?: RichTextTone;
  sortOrder?: number;
}

export interface RichTextFragment {
  kind: 'text' | 'value';
  text: string;
  tone?: RichTextTone;
}

export interface PvpCombatLegacyMarkerCopy {
  removedPlayerFacingEffectTitles?: boolean;
  removedReportSection?: boolean;
  legacySourceFunction?: 'get_pvp_combat_copy_legacy_v1';
  targetOwner?: 'pvp.combat';
  resultOwner?: 'pvp.result';
}
```

## 5. Source presentation inventory

| Path | PL text | UI usage |
|---|---|---|
| `sourcePresentation.header.eyebrow` | `Starcie bohaterów` | PvP live combat eyebrow. |
| `sourcePresentation.header.title` | `Walka na progu posiadłości` | PvP live combat title. |
| `sourcePresentation.header.text` | `Napastnik dotarł do posiadłości obrońcy. Teraz już tylko walka może rozstrzygnąć spór między wami. Niech bogowie wam sprzyjają.` | PvP live combat header body. |
| `sourcePresentation.live.title` | `Starcie trwa` | PvP live state title. |
| `sourcePresentation.live.text` | `Bohaterowie zwarli się w walce. Liczą się przygotowanie, broń, wytrzymałość i to, kto pierwszy wykorzysta błąd przeciwnika. Bogowie patrzą, ale nie obiecują sprawiedliwości.` | PvP live state body. |
| `sourcePresentation.live.helperText` | `Obserwuj przebieg starcia. Gdy pojawi się sposobność, twój bohater będzie mógł zadać cios.` | PvP live helper. |
| `sourcePresentation.emptyLog.title` | `Brak rezultatów` | PvP empty log title. |
| `sourcePresentation.emptyLog.text` | `Przebieg walki pojawi się, gdy bohaterowie wymienią pierwsze ciosy.` | PvP empty log body. |
| `sourcePresentation.workflow.finalizingResult.title` | `Starcie dobiegło końca` | PvP finalizing title. |
| `sourcePresentation.workflow.finalizingResult.text` | `Zadano ostatni cios. Oczekiwanie na rezultat starcia.` | PvP finalizing body. |
| `sourcePresentation.workflow.finalizeUnavailable.title` | `Nie można jeszcze ogłosić wyniku` | PvP cannot-finalize title. |
| `sourcePresentation.workflow.finalizeUnavailable.text` | `Starcie musi się zakończyć, zanim jego skutki zostaną rozliczone.` | PvP cannot-finalize body. |
| `sourcePresentation.workflow.actionUnavailable.title` | `Brak ruchu` | PvP no-action title. |
| `sourcePresentation.workflow.actionUnavailable.text` | `Bohater nie ma teraz ciosu do zadania.` | PvP no-action body. |

## 6. CombatSourcePresentation composition

For PvP live/manual combat, compose from `combat.common` and `pvp.combat`:

```ts
const common = combatCommonCopy;
const pvp = pvpCombatCopy;

const combatSourcePresentation = {
  header: pvp.sourcePresentation.header,
  live: {
    ...common.live,
    title: pvp.sourcePresentation.live.title,
    text: pvp.sourcePresentation.live.text,
    helperText: pvp.sourcePresentation.live.helperText,
  },
  emptyLog: pvp.sourcePresentation.emptyLog,
  emptyParticipants: common.emptyParticipants,
  workflow: pvp.sourcePresentation.workflow ?? common.workflow,
};
```

Keep the pre-combat manual/auto decision from `pvp.action.combatHandoff`. Do not replace the decision screen with `pvp.combat.sourcePresentation`.

## 7. Participant effect templates

### 7.1 Rendering rule

Do not render effect titles.

The old visible titles are intentionally removed:

```text
Koszary napastnika
Forteca obrońcy
Błogosławieństwo
Klątwa
```

Frontend should render only DB/read-model-composed `summaryRichText`.

If the current payload exposes templates rather than composed effects, Codex must not substitute values in Angular unless explicitly scoped. Target state is DB/read-model-composed participant effects.

### 7.2 Target composed effect shape

```ts
export interface PvpCombatParticipantEffect {
  key: 'attacker_barracks_health'
    | 'defender_fortress_health'
    | 'blessing'
    | 'curse';
  sourceKey: 'barracks' | 'fortress' | 'blessing' | 'curse';
  participantRole: 'attacker' | 'defender';
  summaryPlain: string;
  summaryRichText: RichTextFragment[];
  valueDisplay: string;
  tone: RichTextTone;
  sortOrder: number;
}
```

### 7.3 `attackerBarracksHealth`

Template path:

```text
context.participantEffectTemplates.attackerBarracksHealth
```

Plain template:

```text
Dzięki treningowi w Koszarach na poziomie {buildingLevel}, {heroName} ma zwiększone Zdrowie o {valueDisplay}.
```

Rich template:

```ts
[
  { kind: 'text', text: 'Dzięki treningowi w ' },
  { kind: 'text', text: 'Koszarach', tone: 'heading' },
  { kind: 'text', text: ' na poziomie ' },
  { kind: 'text', text: '{buildingLevel}', tone: 'heading' },
  { kind: 'text', text: ', ' },
  { kind: 'text', text: '{heroName}', tone: 'heading' },
  { kind: 'text', text: ' ma zwiększone ' },
  { kind: 'text', text: 'Zdrowie', tone: 'heading' },
  { kind: 'text', text: ' o ' },
  { kind: 'value', text: '{valueDisplay}', tone: 'heading' },
  { kind: 'text', text: '.' }
]
```

Tone rule:

```text
Koszarach, buildingLevel, heroName, Zdrowie, valueDisplay -> heading
```

### 7.4 `defenderFortressHealth`

Template path:

```text
context.participantEffectTemplates.defenderFortressHealth
```

Plain template:

```text
Umocnienia i budowle obronne Fortecy na poziomie {buildingLevel} sprawiają, że {heroName} ma zwiększone Zdrowie o {valueDisplay}.
```

Rich template:

```ts
[
  { kind: 'text', text: 'Umocnienia i budowle obronne ' },
  { kind: 'text', text: 'Fortecy', tone: 'heading' },
  { kind: 'text', text: ' na poziomie ' },
  { kind: 'text', text: '{buildingLevel}', tone: 'heading' },
  { kind: 'text', text: ' sprawiają, że ' },
  { kind: 'text', text: '{heroName}', tone: 'heading' },
  { kind: 'text', text: ' ma zwiększone ' },
  { kind: 'text', text: 'Zdrowie', tone: 'heading' },
  { kind: 'text', text: ' o ' },
  { kind: 'value', text: '{valueDisplay}', tone: 'heading' },
  { kind: 'text', text: '.' }
]
```

Tone rule:

```text
Fortecy, buildingLevel, heroName, Zdrowie, valueDisplay -> heading
```

### 7.5 `blessing`

Template path:

```text
context.participantEffectTemplates.blessing
```

Plain template:

```text
{heroName} znajduje się pod wpływem błogosławieństwa zesłanego przez bogów i otrzymuje {valueDisplay}.
```

Rich template:

```ts
[
  { kind: 'text', text: '{heroName}', tone: 'heading' },
  { kind: 'text', text: ' znajduje się pod wpływem ' },
  { kind: 'text', text: 'błogosławieństwa zesłanego przez bogów', tone: 'heading' },
  { kind: 'text', text: ' i otrzymuje ' },
  { kind: 'value', text: '{valueDisplay}', tone: 'success' },
  { kind: 'text', text: '.' }
]
```

Tone rule:

```text
heroName -> heading
błogosławieństwa zesłanego przez bogów -> heading
valueDisplay -> success
```

### 7.6 `curse`

Template path:

```text
context.participantEffectTemplates.curse
```

Plain template:

```text
Nad bohaterem {heroName} ciąży klątwa, która nakłada {valueDisplay}.
```

Rich template:

```ts
[
  { kind: 'text', text: 'Nad bohaterem ' },
  { kind: 'text', text: '{heroName}', tone: 'heading' },
  { kind: 'text', text: ' ciąży ' },
  { kind: 'text', text: 'klątwa', tone: 'heading' },
  { kind: 'text', text: ', która nakłada ' },
  { kind: 'value', text: '{valueDisplay}', tone: 'danger' },
  { kind: 'text', text: '.' }
]
```

Tone rule:

```text
heroName -> heading
klątwa -> heading
valueDisplay -> danger
```

## 8. Frontend integration rules

Codex must:

- call `get_player_combat_common_copy(locale)` for shared combat UI;
- call `get_pvp_combat_copy(locale)` for PvP combat source/effect copy;
- render PvP participant effects from composed `participantEffects[]`, not from raw metadata;
- render only `summaryRichText`, not effect titles;
- keep `pvp.action.combatHandoff` as the manual/auto pre-combat decision owner.

Codex must not:

- render `context.participantEffectTemplates.*.title`;
- re-add local headings for Koszary/Forteca/błogosławieństwo/klątwa;
- use `pvp.combat` for final result, XP, resources or Chwała;
- use `pvp.combat` report subsections; v2 removed `report`;
- call `get_pvp_combat_copy_legacy_v1`;
- direct-read PvP/combat/report tables;
- edit generated Supabase types manually.

## 9. Current known DB/RPC gap

`get_pvp_combat_copy` provides copy/templates.

The dynamic composed participant effects still need to be exposed through a source/read model for:

```text
live PvP combat
private report detail
public report detail
```

Preferred source-domain shape:

```ts
interface PvpCombatContextPresentation {
  contractKey: 'pvp_combat_context_presentation';
  contractVersion: 'pvp_combat_context_presentation_v1';
  emptyLabel: string;
  participantEffects: PvpCombatParticipantEffect[];
}
```

If this payload is not exposed, Codex must report a DB/RPC read-model gap and must not reconstruct participant effect text in Angular.
