# Mythsworn - `player.exploration.runtime` GameCopy frontend contract v1

## 0. Status

Canonical DB copy RPC:

```sql
public.get_player_exploration_runtime_copy(p_locale text default 'pl') returns jsonb
```

GameCopy kind:

```ts
'player.exploration.runtime'
```

Contract identity:

```ts
contractKey: 'exploration_runtime_copy'
contractVersion: 'exploration_runtime_copy_v1'
```

The RPC is authenticated-only, `SECURITY DEFINER`, `STABLE`, and returns English fallback copy for unsupported locales.

Verified DB smoke:

```text
function: get_player_exploration_runtime_copy
identity_arguments: p_locale text
result_type: jsonb
volatility: stable
security_definer: true
anon_can_execute: false
authenticated_can_execute: true

contractKey: exploration_runtime_copy
contractVersion: exploration_runtime_copy_v1
fallbackLocale: en

containsUppercasePvp: false
containsCharacterPointsPl: false
containsPrestigePl: false
containsTimer: false
containsTimeOraclePl: false
containsEnOrEmDash: false
```

Verified PL shape smoke:

```text
pendingStep.inProgress.title: Bohater podróżuje
movement.title: Wybierz kierunek eksploracji
combatSourcePresentations.trial.decision.manualActionLabel: Walcz!
combatSourcePresentations.trial.decision.autoActionLabel: Automatycznie
combatSourcePresentations.trial.live.meterTitle: Moment ataku
combatSourcePresentations.combatEncounter.decision.eyebrow: Starcie na szlaku
combatEffect.buff.textTemplate: Bogowie wyjątkowo sprzyjają dziś twojemu bohaterowi. Na czas tej walki masz {effectSummary}.
combatEffect.debuff.textTemplate: Bohater znajduje się pod wpływem klątwy bogów. W tej walce ma {effectSummary}.
```

## 1. Purpose

This contract exists to unblock the Exploration runtime frontend and `CombatHost` / `MinigameHost` source presentation blocker.

It provides DB-owned copy for:

- active/pending Exploration step;
- direction selection / movement board;
- difficulty-return action;
- minimal active challenge state labels;
- full Exploration-owned `CombatSourcePresentation` variants;
- buff/debuff combat effect context;
- Exploration-specific feedback copy.

It does not replace:

- `player.exploration.difficulty`;
- `exploration_result_copy_v1`;
- `trialSectionJson.resultNarrativeJson`;
- `encounterSectionJson.resultNarrativeJson`;
- `rewardSectionJson.rewardRichTextJson`;
- `effectSectionJson.effectRichTextJson`;
- Combat dynamic log display helpers.

Dynamic combat log rows remain Combat-owned and are not part of this copy contract.

## 2. Non-negotiable frontend rules

Frontend reads all player-facing Exploration runtime strings through `GameCopyService`.

Do not hardcode player-facing Exploration runtime copy in Angular components, local configs, services, templates, mappers, or `Error.message`.

Do not build `CombatSourcePresentation` locally from scattered strings. Use `combatSourcePresentations.*` from this payload.

Do not use `player.pvp.action` as a source for Exploration combat copy.

Do not add local Polish or English fallbacks. If a required path is missing, treat it as a contract error and surface diagnostics through existing project error-handling patterns.

Do not introduce or render player-facing:

```text
PvP
Punkty Postaci
prestiż
timer
Wyrocznia czasu
```

Do not edit or regenerate generated Supabase types. The user/Migrator supplies `database.types.ts`. If `Database['public']['Functions']['get_player_exploration_runtime_copy']` is missing, stop and report generated types as stale.

## 3. Required GameCopy integration

Add this kind to the GameCopy registry:

```ts
'player.exploration.runtime'
```

Required registry args:

```ts
export interface ExplorationRuntimeCopyArgs {
  locale: string;
}
```

Required reader shape:

```ts
'player.exploration.runtime': (backend, args) =>
  backend.rpc<
    Database['public']['Functions']['get_player_exploration_runtime_copy']['Returns']
  >(
    RPC.get_player_exploration_runtime_copy,
    { p_locale: args.locale },
  ).pipe(map(mapExplorationRuntimeCopy))
```

Required RPC constant:

```ts
get_player_exploration_runtime_copy: 'get_player_exploration_runtime_copy'
```

Required mapper:

```ts
mapExplorationRuntimeCopy(
  raw: Database['public']['Functions']['get_player_exploration_runtime_copy']['Returns'],
): ExplorationRuntimeCopy
```

The mapper may normalize unknown JSON into the typed frontend model, but it must not invent player-facing text.

## 4. TypeScript model

Put named types in a model/type file. Do not declare these types locally inside production component files.

Suggested file:

```text
src/app/core/domain/player/exploration-runtime-copy.model.ts
```

```ts
export type GameCopyLocale = 'pl' | 'en';

export type ExplorationCombatSourcePresentationKey =
  | 'default'
  | 'trial'
  | 'combatEncounter';

export type ExplorationCombatEffectTone =
  | 'success'
  | 'danger';

export interface ExplorationRuntimeCopy {
  contractKey: 'exploration_runtime_copy';
  contractVersion: 'exploration_runtime_copy_v1';
  requestedLocale: string;
  locale: GameCopyLocale;
  fallbackLocale: 'en';

  pendingStep: ExplorationPendingStepCopy;
  movement: ExplorationMovementCopy;
  runtimeActions: ExplorationRuntimeActionsCopy;
  activeChallenge: ExplorationActiveChallengeCopy;

  combatSourcePresentationKeys: ExplorationCombatSourcePresentationKeysCopy;
  combatSourcePresentations: ExplorationCombatSourcePresentationsCopy;

  combatEffect: ExplorationCombatEffectCopy;
  feedback: ExplorationRuntimeFeedbackCopy;
}

export interface ExplorationCopyTitleText {
  title: string;
  text: string;
}

export interface ExplorationPendingStepCopy {
  inProgress: ExplorationCopyTitleText;
  ready: ExplorationCopyTitleText;
  readyActionLabel: string;
  progressAriaLabel: string;
  timeAriaLabel: string;
  loading: ExplorationCopyTitleText;
  unavailable: ExplorationCopyTitleText;
}

export interface ExplorationMovementCopy {
  title: string;
  summary: string;
  destinationLabel: string;
  travelDurationLabel: string;
  selectedLabel: string;
  backtrackLabel: string;
  unavailableLabel: string;
  emptyTitle: string;
  emptyText: string;
  startActionLabel: string;
  startingLabel: string;
  startedFeedback: string;
}

export interface ExplorationRuntimeActionsCopy {
  changeDifficultyLabel: string;
  changeDifficultyTooltip: string;
}

export interface ExplorationActiveChallengeCopy {
  awaitingActionLabel: string;
  inProgressLabel: string;
  readyLabel: string;
  completedLabel: string;
  unavailableTitle: string;
  unavailableText: string;
}

export interface ExplorationCombatSourcePresentationKeysCopy {
  default: 'default';
  trial: 'trial';
  combatEncounter: 'combatEncounter';
}

export interface ExplorationCombatSourcePresentationsCopy {
  default: CombatSourcePresentation;
  trial: CombatSourcePresentation;
  combatEncounter: CombatSourcePresentation;
}

export interface CombatSourcePresentation {
  decision: CombatSourceDecisionCopy;
  loadingPreview: CombatSourceTitleTextCopy;
  unavailablePreview: CombatSourceTitleTextCopy;
  emptyLog: CombatSourceTitleTextCopy;
  emptyParticipants: CombatSourceEmptyParticipantsCopy;
  live: CombatSourceLiveCopy;
  workflow: CombatSourceWorkflowCopy;
}

export interface CombatSourceDecisionCopy {
  eyebrow: string;
  title: string;
  description: string;
  manualActionLabel: string;
  manualActionTooltip: string;
  autoActionLabel: string;
  autoActionTooltip: string;
  waitingForDecision: string;
}

export interface CombatSourceTitleTextCopy {
  title: string;
  text: string;
}

export interface CombatSourceEmptyParticipantsCopy {
  loading: CombatSourceParticipantsSideCopy;
  unavailable: CombatSourceParticipantsSideCopy;
}

export interface CombatSourceParticipantsSideCopy {
  leftTitle: string;
  leftText: string;
  rightTitle: string;
  rightText: string;
}

export interface CombatSourceLiveCopy {
  contextLabel: string;
  title: string;
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

export interface CombatSourceWorkflowCopy {
  finalizingResult: CombatSourceTitleTextCopy;
  finalizeUnavailable: CombatSourceTitleTextCopy;
  actionUnavailable: CombatSourceTitleTextCopy;
}

export interface ExplorationCombatEffectCopy {
  buff: ExplorationCombatEffectTemplateCopy;
  debuff: ExplorationCombatEffectTemplateCopy;
}

export interface ExplorationCombatEffectTemplateCopy {
  title: string;
  textTemplate: string;
  tone: ExplorationCombatEffectTone;
}

export interface ExplorationRuntimeFeedbackCopy {
  refreshing: string;
  refreshed: string;
  movementStarting: string;
  movementStarted: string;
  resolveStepStarting: string;
  resolveStepReady: string;
  actionUnavailable: string;
  genericError: string;
}
```

If the project already has an existing `CombatSourcePresentation` type, import and reuse it. Do not create a parallel duplicate type.

## 5. Payload inventory

### 5.1 Root

| Path | Type | UI usage |
|---|---|---|
| `contractKey` | `'exploration_runtime_copy'` | Mapper validation. |
| `contractVersion` | `'exploration_runtime_copy_v1'` | Mapper validation. |
| `requestedLocale` | `string` | Diagnostics only. |
| `locale` | `'pl' | 'en'` | Diagnostics / locale confirmation. |
| `fallbackLocale` | `'en'` | Diagnostics. |
| `pendingStep` | `ExplorationPendingStepCopy` | Pending/ready step panel. |
| `movement` | `ExplorationMovementCopy` | Direction board. |
| `runtimeActions` | `ExplorationRuntimeActionsCopy` | Runtime-only actions. |
| `activeChallenge` | `ExplorationActiveChallengeCopy` | Minimal challenge state labels. |
| `combatSourcePresentationKeys` | object | Stable source presentation key mapping. |
| `combatSourcePresentations` | object | Full CombatSourcePresentation variants. |
| `combatEffect` | object | Buff/debuff context for combat panel. |
| `feedback` | object | Exploration runtime feedback/toasts. |

### 5.2 Pending step

| Path | PL value |
|---|---|
| `pendingStep.inProgress.title` | `Bohater podróżuje` |
| `pendingStep.inProgress.text` | `Bohater jest w drodze. Kiedy dotrze do celu, sprawdzisz, co napotkał na swojej drodze.` |
| `pendingStep.ready.title` | `Bohater dotarł do celu` |
| `pendingStep.ready.text` | `Droga dobiegła końca. Sprawdź, co wydarzyło się podczas podróży.` |
| `pendingStep.readyActionLabel` | `Sprawdź, co wydarzyło się podczas podróży` |
| `pendingStep.progressAriaLabel` | `Postęp eksploracji` |
| `pendingStep.timeAriaLabel` | `Pozostały czas podróży` |
| `pendingStep.loading.title` | `Przygotowujemy rozstrzygnięcie eksploracji` |
| `pendingStep.loading.text` | `Sprawdzamy przeciwników i kaprysy bogów na końcu drogi.` |
| `pendingStep.unavailable.title` | `Nie można rozstrzygnąć etapu` |
| `pendingStep.unavailable.text` | `Ta podróż nie jest jeszcze gotowa do rozstrzygnięcia.` |

Frontend rules:

- Do not use `timer`.
- Do not render `Wyrocznia czasu`.
- Do not add local labels like `Sprawdź wynik`.
- Do not treat pending step text as resolved result narrative.

### 5.3 Movement

| Path | PL value |
|---|---|
| `movement.title` | `Wybierz kierunek eksploracji` |
| `movement.summary` | `Zdecyduj, w jakim kierunku chcesz podążać. Każdy kierunek może poprowadzić przez trakty, wzgórza i zapomniane ruiny Hellady aż do prób zesłanych przez bogów.` |
| `movement.destinationLabel` | `Cel` |
| `movement.travelDurationLabel` | `Czas podróży` |
| `movement.selectedLabel` | `Wybrany kierunek` |
| `movement.backtrackLabel` | `Wróć po własnych śladach` |
| `movement.unavailableLabel` | `Ten kierunek nie jest teraz dostępny.` |
| `movement.emptyTitle` | `Brak dostępnych kierunków` |
| `movement.emptyText` | `Nie znaleziono dalszej drogi.` |
| `movement.startActionLabel` | `Wyrusz w wybranym kierunku` |
| `movement.startingLabel` | `Bohater rusza w dalszą drogę` |
| `movement.startedFeedback` | `Bohater wyruszył w dalszą drogę.` |

Frontend rules:

- Use `movement.travelDurationLabel`, not `Czas drogi`.
- Do not add `knownPathLabel` or `unknownPathLabel` unless a later DB contract adds those paths.

### 5.4 Runtime actions

| Path | PL value |
|---|---|
| `runtimeActions.changeDifficultyLabel` | `Zmień poziom trudności` |
| `runtimeActions.changeDifficultyTooltip` | `Wróć do wyboru trudności eksploracji.` |

Frontend rules:

- Do not encode availability rules in copy.
- Availability remains technical runtime state.

### 5.5 Active challenge

| Path | PL value |
|---|---|
| `activeChallenge.awaitingActionLabel` | `Wyzwanie czeka na decyzję` |
| `activeChallenge.inProgressLabel` | `Wyzwanie trwa` |
| `activeChallenge.readyLabel` | `Wyzwanie można rozstrzygnąć` |
| `activeChallenge.completedLabel` | `Wyzwanie zostało rozstrzygnięte` |
| `activeChallenge.unavailableTitle` | `Nie można przygotować wyzwania` |
| `activeChallenge.unavailableText` | `Odśwież eksplorację i spróbuj ponownie.` |

Frontend rules:

- Do not add Trial/Encounter titles, summaries, fact rows or result narratives here.
- Resolved content belongs to `exploration_result_copy_v1` and source-domain report snapshots.
- This section is only minimal runtime state copy.

### 5.6 CombatSourcePresentation key mapping

| Path | Value |
|---|---|
| `combatSourcePresentationKeys.default` | `default` |
| `combatSourcePresentationKeys.trial` | `trial` |
| `combatSourcePresentationKeys.combatEncounter` | `combatEncounter` |

Suggested frontend selection:

```ts
const presentationKey =
  sourceKind === 'trial'
    ? copy.combatSourcePresentationKeys.trial
    : sourceKind === 'encounter' && encounterKind === 'combat'
      ? copy.combatSourcePresentationKeys.combatEncounter
      : copy.combatSourcePresentationKeys.default;
```

Rules:

- Source facts come from DB/runtime state.
- Copy comes from this GameCopy payload.
- If source context is unknown, use `default`.

### 5.7 CombatSourcePresentation variants

Available variants:

```ts
copy.combatSourcePresentations.default
copy.combatSourcePresentations.trial
copy.combatSourcePresentations.combatEncounter
```

Each variant is a full `CombatSourcePresentation`. It is intended to be passed into `CombatHost` / `MinigameHost` without local composition.

#### 5.7.1 Default Exploration combat

| Path | PL value |
|---|---|
| `combatSourcePresentations.default.decision.eyebrow` | `Walka podczas eksploracji` |
| `combatSourcePresentations.default.decision.title` | `Walka blokuje dalszą eksplorację` |
| `combatSourcePresentations.default.decision.description` | `Eksploracja doprowadziła do walki. Rozstrzygnij starcie, aby ruszyć dalej.` |
| `combatSourcePresentations.default.decision.manualActionLabel` | `Walcz!` |
| `combatSourcePresentations.default.decision.manualActionTooltip` | `Poprowadź walkę samodzielnie. W wielu starciach ręczne rozstrzygnięcie daje większą szansę na zwycięstwo.` |
| `combatSourcePresentations.default.decision.autoActionLabel` | `Automatycznie` |
| `combatSourcePresentations.default.decision.autoActionTooltip` | `Skorzystaj z automatycznego rozstrzygnięcia. Wynik nadal zależy od siły bohatera, wyposażenia i zasad walki.` |
| `combatSourcePresentations.default.decision.waitingForDecision` | `Czeka na twój rozkaz` |
| `combatSourcePresentations.default.live.contextLabel` | `Walka podczas eksploracji` |
| `combatSourcePresentations.default.live.title` | `Walka podczas eksploracji` |

#### 5.7.2 Trial combat

| Path | PL value |
|---|---|
| `combatSourcePresentations.trial.decision.eyebrow` | `Próba bogów` |
| `combatSourcePresentations.trial.decision.title` | `Walka blokuje dalszą eksplorację` |
| `combatSourcePresentations.trial.decision.description` | `Próba bogów prowadzi do walki. Rozstrzygnij starcie, aby zakończyć wyzwanie.` |
| `combatSourcePresentations.trial.decision.manualActionLabel` | `Walcz!` |
| `combatSourcePresentations.trial.decision.manualActionTooltip` | `Poprowadź walkę samodzielnie. W wielu starciach ręczne rozstrzygnięcie daje większą szansę na zwycięstwo.` |
| `combatSourcePresentations.trial.decision.autoActionLabel` | `Automatycznie` |
| `combatSourcePresentations.trial.decision.autoActionTooltip` | `Skorzystaj z automatycznego rozstrzygnięcia. Wynik nadal zależy od siły bohatera, wyposażenia i zasad walki.` |
| `combatSourcePresentations.trial.decision.waitingForDecision` | `Czeka na twój rozkaz` |
| `combatSourcePresentations.trial.live.contextLabel` | `Próba bogów` |
| `combatSourcePresentations.trial.live.title` | `Próba bogów` |

#### 5.7.3 Combat encounter

| Path | PL value |
|---|---|
| `combatSourcePresentations.combatEncounter.decision.eyebrow` | `Starcie na szlaku` |
| `combatSourcePresentations.combatEncounter.decision.title` | `Walka blokuje dalszą eksplorację` |
| `combatSourcePresentations.combatEncounter.decision.description` | `Na szlaku stanął przeciwnik. Rozstrzygnij starcie, aby kontynuować eksplorację.` |
| `combatSourcePresentations.combatEncounter.decision.manualActionLabel` | `Walcz!` |
| `combatSourcePresentations.combatEncounter.decision.manualActionTooltip` | `Poprowadź walkę samodzielnie. W wielu starciach ręczne rozstrzygnięcie daje większą szansę na zwycięstwo.` |
| `combatSourcePresentations.combatEncounter.decision.autoActionLabel` | `Automatycznie` |
| `combatSourcePresentations.combatEncounter.decision.autoActionTooltip` | `Skorzystaj z automatycznego rozstrzygnięcia. Wynik nadal zależy od siły bohatera, wyposażenia i zasad walki.` |
| `combatSourcePresentations.combatEncounter.decision.waitingForDecision` | `Czeka na twój rozkaz` |
| `combatSourcePresentations.combatEncounter.live.contextLabel` | `Starcie na szlaku` |
| `combatSourcePresentations.combatEncounter.live.title` | `Starcie na szlaku` |

#### 5.7.4 Shared per-variant combat fields

All variants contain these fields:

| Path suffix | PL value |
|---|---|
| `loadingPreview.title` | `Przygotowujemy walkę` |
| `loadingPreview.text` | `Ładujemy uczestników starcia i aktualny przebieg walki.` |
| `unavailablePreview.title` | `Walka niedostępna` |
| `unavailablePreview.text` | `Nie można teraz otworzyć tej walki. Odśwież eksplorację i spróbuj ponownie.` |
| `emptyLog.title` | `Przebieg starcia` |
| `emptyLog.text` | `Gdy padnie pierwszy cios, tutaj pojawi się przebieg walki.` |
| `emptyParticipants.loading.leftTitle` | `Bohater` |
| `emptyParticipants.loading.leftText` | `Ładujemy stan twojego bohatera.` |
| `emptyParticipants.loading.rightTitle` | `Przeciwnik` |
| `emptyParticipants.loading.rightText` | `Ładujemy stan przeciwnika.` |
| `emptyParticipants.unavailable.leftTitle` | `Bohater niedostępny` |
| `emptyParticipants.unavailable.leftText` | `Nie udało się ustalić aktualnego stanu bohatera.` |
| `emptyParticipants.unavailable.rightTitle` | `Przeciwnik niedostępny` |
| `emptyParticipants.unavailable.rightText` | `Nie udało się ustalić aktualnego stanu przeciwnika.` |
| `live.helperText` | `Wybierz moment uderzenia i obserwuj przebieg starcia.` |
| `live.submittingHelperText` | `Wysyłamy rozkaz bohatera.` |
| `live.preparingHelperText` | `Przygotowujemy kolejną akcję.` |
| `live.completedHelperText` | `Walka została zakończona. Możesz przejść do wyniku.` |
| `live.timingActionLabel` | `Uderz` |
| `live.meterTitle` | `Moment ataku` |
| `live.meterHelperText` | `Traf w środek pola, aby wykonać najlepszy ruch.` |
| `live.meterEarlyLabel` | `Za wcześnie` |
| `live.meterHitZoneLabel` | `Trafienie` |
| `live.meterLateLabel` | `Za późno` |
| `workflow.finalizingResult.title` | `Utrwalamy wynik walki` |
| `workflow.finalizingResult.text` | `Przygotowujemy wynik starcia i dalszy przebieg eksploracji.` |
| `workflow.finalizeUnavailable.title` | `Wynik nie jest jeszcze gotowy` |
| `workflow.finalizeUnavailable.text` | `Walka nie została jeszcze zakończona albo wymaga odświeżenia eksploracji.` |
| `workflow.actionUnavailable.title` | `Akcja niedostępna` |
| `workflow.actionUnavailable.text` | `Ta akcja nie może zostać teraz wykonana.` |

Frontend rules:

- Do not use `player.pvp.action.combatHandoff` for Exploration.
- Do not locally clone PvP combat copy.
- Pass selected `combatSourcePresentations.*` into existing CombatHost/MinigameHost.
- Do not use these fields as attack log rows. Dynamic combat log rows come from Combat event display payloads.

### 5.8 Combat effect context

| Path | PL value |
|---|---|
| `combatEffect.buff.title` | `Bogowie sprzyjają bohaterowi` |
| `combatEffect.buff.textTemplate` | `Bogowie wyjątkowo sprzyjają dziś twojemu bohaterowi. Na czas tej walki masz {effectSummary}.` |
| `combatEffect.buff.tone` | `success` |
| `combatEffect.debuff.title` | `Klątwa bogów` |
| `combatEffect.debuff.textTemplate` | `Bohater znajduje się pod wpływem klątwy bogów. W tej walce ma {effectSummary}.` |
| `combatEffect.debuff.tone` | `danger` |

Frontend rules:

- Replace `{effectSummary}` with DB/source-owned `effectSummary`.
- Do not compose `effectSummary` in Angular from technical keys.
- Do not insert a colon before `{effectSummary}`.
- Do not add a generic player-facing `effect` branch.
- If effect kind is neither `buff` nor `debuff`, do not render this panel unless a later contract adds it.

### 5.9 Feedback

| Path | PL value |
|---|---|
| `feedback.refreshing` | `Odświeżamy eksplorację.` |
| `feedback.refreshed` | `Eksploracja została odświeżona.` |
| `feedback.movementStarting` | `Bohater rusza w dalszą drogę.` |
| `feedback.movementStarted` | `Bohater wyruszył w dalszą drogę.` |
| `feedback.resolveStepStarting` | `Przygotowujemy rozstrzygnięcie eksploracji.` |
| `feedback.resolveStepReady` | `Wynik eksploracji jest gotowy.` |
| `feedback.actionUnavailable` | `Ta akcja nie jest teraz dostępna.` |
| `feedback.genericError` | `Nie udało się wykonać akcji. Odśwież eksplorację i spróbuj ponownie.` |

## 6. Mapper behavior

The mapper should be strict:

1. Accept raw `jsonb` return type from `get_player_exploration_runtime_copy`.
2. Verify `contractKey === 'exploration_runtime_copy'`.
3. Verify `contractVersion === 'exploration_runtime_copy_v1'`.
4. Verify `locale` is `pl` or `en`.
5. Verify `fallbackLocale === 'en'`.
6. Verify required top-level sections exist:
   - `pendingStep`;
   - `movement`;
   - `runtimeActions`;
   - `activeChallenge`;
   - `combatSourcePresentationKeys`;
   - `combatSourcePresentations`;
   - `combatEffect`;
   - `feedback`.
7. Verify every path listed in this contract exists and has the expected primitive/object shape.
8. Verify `combatSourcePresentations.default`, `combatSourcePresentations.trial`, and `combatSourcePresentations.combatEncounter` each satisfy the existing `CombatSourcePresentation` type.
9. Verify `combatEffect.buff.tone === 'success'`.
10. Verify `combatEffect.debuff.tone === 'danger'`.
11. Return the typed `ExplorationRuntimeCopy`.
12. Do not supply fallback strings.
13. Do not compose or translate missing copy.
14. Do not normalize Polish text in the mapper.

If the project already has a shared copy-contract assertion helper, reuse it. Do not create a broad generic framework inside this slice.

## 7. Component consumption rules

Runtime UI should consume:

```ts
this.gameCopy.getCopy('player.exploration.runtime', { locale })
```

Use:

```ts
copy.pendingStep
```

for pending/ready Exploration step surfaces.

Use:

```ts
copy.movement
```

for direction selection surfaces.

Use:

```ts
copy.runtimeActions
```

for runtime-only actions such as returning to difficulty selection.

Use:

```ts
copy.activeChallenge
```

only for minimal active challenge states. Do not use it for Trial/Encounter result narratives.

Use:

```ts
copy.combatSourcePresentations[resolvedPresentationKey]
```

as the `CombatSourcePresentation` passed to `CombatHost` / `MinigameHost`.

Use:

```ts
copy.combatEffect.buff
copy.combatEffect.debuff
```

for Exploration effect context in combat/minigame panels.

Use:

```ts
copy.feedback
```

for Exploration runtime feedback/toasts.

## 8. Relationship to existing Exploration result copy

Existing Exploration result/report copy remains authoritative for resolved content.

Do not replace or duplicate:

```text
trialSectionJson.resultNarrativeJson
encounterSectionJson.resultNarrativeJson
rewardSectionJson.rewardRichTextJson
effectSectionJson.effectRichTextJson
```

This runtime contract does not render final Trial/Encounter/result/reward/report content.

If a challenge is resolved and a report/result exists, use the result/report snapshot contract, not runtime text.

## 9. Relationship to Combat dynamic log

Dynamic combat log text and structured event display remain owned by Combat DB helpers/read models.

Known DB combat display helpers include:

```text
build_combat_attack_log_display_json(...)
combat_event_player_display_json(...)
combat_attack_source_label_pl(...)
combat_display_text_with_legal_life_drain(...)
format_combat_damage_display_pl(...)
get_combat_live_state(...)
```

Frontend must not use this runtime copy to build attack log sentences such as:

```text
Athena trafia za 10 obrażeń.
Satyr chybia.
Satyr trafia za 5 obrażeń.
```

Combat log rows come from Combat event display payloads.

## 10. Files Codex will likely need to touch

Expected files, adjusted to existing project layout:

```text
src/app/core/constants/rpc.const.ts
src/app/core/types/game-copy-registry.types.ts
src/app/core/types/game-copy-reader.types.ts
src/app/core/services/game-copy/game-copy-player.readers.ts
src/app/core/domain/player/exploration-runtime-copy.model.ts
src/app/core/utils/exploration-runtime-copy.mapper.ts
```

Exploration runtime component files may also need changes, depending on current layout:

```text
src/app/game/pages/exploration/**/*
src/app/game/components/exploration*/**/*
src/app/core/domain/exploration/**/*
src/app/core/utils/exploration*/**/*
```

Do not edit:

```text
src/app/core/types/database.types.ts
```

The user/Migrator supplies generated Supabase types.

## 11. Generated type requirement

This DB/RPC change requires regenerated Supabase database types before Codex consumes it.

Expected generated function key:

```ts
Database['public']['Functions']['get_player_exploration_runtime_copy']
```

Expected generated args conceptually:

```ts
{
  p_locale?: string | null;
}
```

Expected generated return type:

```ts
Json
```

Codex must not create manual generated-type substitutes if this function is missing from `database.types.ts`.

## 12. Acceptance checks for Codex

Codex should report:

```text
- get_player_exploration_runtime_copy reader added under GameCopyService.
- player.exploration.runtime registered in GameCopyRegistry and GameCopyReaders.
- ExplorationRuntimeCopy named types are not declared inside components.
- Mapper validates contract identity, root sections, nested paths and CombatSourcePresentation variants.
- Runtime Exploration UI uses GameCopyService for pending step, movement, runtime actions, active challenge minimal labels, combat source presentation, combat effect context and feedback.
- CombatHost / MinigameHost receives source presentation from copy.combatSourcePresentations.*.
- No player-facing Exploration runtime fallback copy was added locally.
- No player.pvp.action copy is reused for Exploration runtime combat handoff.
- No Trial/Encounter result narrative copy was duplicated in runtime.
- No reward/effect/result rich text is reconstructed in Angular.
- No player-facing PvP string was added.
- No player-facing Punkty Postaci string was added.
- No player-facing prestiż string was added.
- No player-facing timer string was added.
- No player-facing Wyrocznia czasu string was added.
- database.types.ts was not edited.
```

Suggested static greps:

```bash
rg "get_player_exploration_runtime_copy|player\.exploration\.runtime|mapExplorationRuntimeCopy|ExplorationRuntimeCopy" src/app/core src/app/game
rg "player\.pvp\.action|PvpActionCopy|mapPvpActionCopy" src/app/game/pages/exploration src/app/game/components src/app/core/domain/exploration src/app/core/utils
rg "PvP|Punkty Postaci|prestiż|timer|Wyrocznia czasu|Czas drogi|Sprawdź wynik" src/app/core src/app/game
rg "Walcz!|Automatycznie|Moment ataku|Przebieg starcia|Za wcześnie|Za późno" src/app/core src/app/game
```

The final grep may find accepted references from this runtime contract or existing PvP/combat copy. Codex must classify each hit as:

```text
accepted DB copy contract
existing PvP copy
existing combat event display
touched-scope blocker
existing cleanup candidate
```

## 13. Reviewer notes

This is an intentional short-term unblocking contract.

It keeps `CombatSourcePresentation` fully DB-owned for Exploration runtime so the frontend does not have to compose missing combat handoff copy locally.

It does not attempt to solve broader Combat copy cleanup. Dynamic combat log copy and future shared combat common extraction remain separate follow-ups.

The accepted target state after this slice:

```text
Exploration runtime copy: get_player_exploration_runtime_copy(...)
Exploration result/report copy: exploration_result_copy_v1 + source-domain snapshots
Combat dynamic log copy: existing combat event display helpers/read models
PvP action copy: get_pvp_action_copy(...)
```
