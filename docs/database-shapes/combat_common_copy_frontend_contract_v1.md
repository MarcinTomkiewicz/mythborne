# Mythsworn - `combat.common` Copy Frontend Contract v1

Status: active  
Audience: Codex / frontend integration  
Owner: shared combat UI  
RPC:

```sql
public.get_player_combat_common_copy(p_locale text default 'pl') returns jsonb
```

## 1. Contract identity

```ts
contractKey: 'combat_common_copy'
contractVersion: 'combat_common_copy_v1'
gameCopyKind: 'player.combat.common'
```

Auth:

```text
anon: false
authenticated: true
```

## 2. Purpose

`combat.common` owns only shared live combat UI copy:

- manual strike control;
- timing/meter labels;
- common live helper states;
- empty combat log fallback;
- participant loading/unavailable placeholders;
- workflow/finalization messages.

It does not own PvP-specific source text, Exploration-specific source text, participant effects, final result, XP, resources or Chwała.

## 3. TypeScript shape

```ts
export type GameCopyLocale = 'pl' | 'en';

export interface CombatCommonCopy {
  contractKey: 'combat_common_copy';
  contractVersion: 'combat_common_copy_v1';
  gameCopyKind: 'player.combat.common';
  requestedLocale: string;
  locale: GameCopyLocale;
  fallbackLocale: 'en';

  live: CombatCommonLiveCopy;
  emptyLog: CombatCommonEmptyLogCopy;
  emptyParticipants: CombatCommonEmptyParticipantsCopy;
  workflow: CombatCommonWorkflowCopy;
}

export interface CombatCommonLiveCopy {
  helperText: string;
  submittingHelperText: string;
  preparingHelperText: string;
  completedHelperText: string;
  timingActionLabel: string;
  meterTitle: string;
  meterHelperText: string;
  meterEarlyLabel: string;
  meterHitZoneLabel: string;
  meterLateLabel: string;
}

export interface CombatCommonEmptyLogCopy {
  title: string;
  text: string;
}

export interface CombatCommonEmptyParticipantsCopy {
  loading: CombatCommonParticipantPlaceholderCopy;
  unavailable: CombatCommonParticipantPlaceholderCopy;
}

export interface CombatCommonParticipantPlaceholderCopy {
  leftTitle: string;
  leftText: string;
  rightTitle: string;
  rightText: string;
}

export interface CombatCommonWorkflowCopy {
  finalizingResult: CombatCommonWorkflowMessageCopy;
  finalizeUnavailable: CombatCommonWorkflowMessageCopy;
  actionUnavailable: CombatCommonWorkflowMessageCopy;
}

export interface CombatCommonWorkflowMessageCopy {
  title: string;
  text: string;
}
```

## 4. Payload inventory

| Path | PL text | UI usage |
|---|---|---|
| `live.helperText` | `Walka trwa. Gdy przyjdzie twoja kolej, twój bohater będzie mógł zadać cios.` | Live helper. |
| `live.submittingHelperText` | `Zadawanie ciosu.` | Submitting player action. |
| `live.preparingHelperText` | `Przygotowanie do kolejnego starcia.` | Preparing next round/action. |
| `live.completedHelperText` | `Ostatni cios został zadany.` | Completed live action/fight state. |
| `live.timingActionLabel` | `Zadaj cios` | Manual timing CTA. |
| `live.meterTitle` | `Sposobność do zadania ciosu` | Timing meter title. |
| `live.meterHelperText` | `Jeśli zadasz cios za szybko lub za późno, twój bohater chybi.` | Timing meter helper. |
| `live.meterEarlyLabel` | `Chybienie` | Early zone label. |
| `live.meterHitZoneLabel` | `Trafienie` | Hit zone label. |
| `live.meterLateLabel` | `Chybienie` | Late zone label. |
| `emptyLog.title` | `Brak rezultatów` | Empty combat log title. |
| `emptyLog.text` | `Przebieg walki pojawi się, gdy bohaterowie wymienią pierwsze ciosy.` | Empty combat log text. |
| `emptyParticipants.loading.leftTitle` | `Bohater staje do walki` | Left participant loading title. |
| `emptyParticipants.loading.leftText` | `Przyjmuje pozycję bojową.` | Left participant loading body. |
| `emptyParticipants.loading.rightTitle` | `Przeciwnik staje do boju` | Right participant loading title. |
| `emptyParticipants.loading.rightText` | `Wróg przygotowuje się do starcia.` | Right participant loading body. |
| `emptyParticipants.unavailable.leftTitle` | `Nie widać bohatera` | Left participant unavailable title. |
| `emptyParticipants.unavailable.leftText` | `Nie można teraz odczytać stanu tej strony walki.` | Left participant unavailable body. |
| `emptyParticipants.unavailable.rightTitle` | `Nie widać przeciwnika` | Right participant unavailable title. |
| `emptyParticipants.unavailable.rightText` | `Nie można teraz odczytać stanu tej strony walki.` | Right participant unavailable body. |
| `workflow.finalizingResult.title` | `Walka rozstrzygnięta` | Finalizing title. |
| `workflow.finalizingResult.text` | `Zadano ostatni cios. Oczekiwanie na rezultat starcia.` | Finalizing body. |
| `workflow.finalizeUnavailable.title` | `Nie można jeszcze ogłosić wyniku` | Cannot finalize title. |
| `workflow.finalizeUnavailable.text` | `Walka musi się zakończyć, zanim jej rezultat zostanie rozliczony.` | Cannot finalize body. |
| `workflow.actionUnavailable.title` | `Brak ruchu` | No action title. |
| `workflow.actionUnavailable.text` | `Bohater nie ma teraz ciosu do zadania.` | No action body. |

## 5. Frontend usage

CombatHost / MinigameHost should load this copy once for live combat UI.

Use it together with a source-specific combat presentation. For PvP:

```ts
const common = combatCommonCopy;
const source = pvpCombatCopy.sourcePresentation;

const presentation = {
  header: source.header,
  live: {
    ...common.live,
    title: source.live.title,
    text: source.live.text,
    helperText: source.live.helperText,
  },
  emptyLog: source.emptyLog ?? common.emptyLog,
  emptyParticipants: common.emptyParticipants,
  workflow: source.workflow ?? common.workflow,
};
```

## 6. Codex rules

Codex must not:

- hardcode any of these strings in Angular;
- create local fallback labels for missing paths;
- use `combat.common` for PvP result, XP, resources or Chwała;
- use `combat.common` for Koszary/Forteca/błogosławieństwo/klątwa;
- edit generated Supabase types manually.

If `get_player_combat_common_copy` is absent from generated types, stop and report stale generated types.
