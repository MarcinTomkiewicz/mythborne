# Mythsworn - `player.pvp.action` GameCopy frontend contract v1

## 0. Status

This contract describes the frontend shape for the canonical DB copy RPC:

```sql
public.get_pvp_action_copy(p_locale text default 'pl') returns jsonb
```

GameCopy kind:

```ts
'player.pvp.action'
```

Contract identity returned by the RPC:

```ts
contractKey: 'pvp_action_copy'
contractVersion: 'pvp_action_copy_v1'
```

The RPC is already public-readable for `anon` and `authenticated` and falls back to English for unsupported locales.

## 1. Non-negotiable frontend rules

Frontend reads all player-facing strings in this area through `GameCopyService`.

Do not read player-facing copy from active-action/read-model payloads such as `phase_label`, `status_label`, `sourceLabel`, `eventType.label`, local configs, local mappers, templates, `Error.message`, or hardcoded fallback strings.

Do not add local player-facing fallback labels in Angular. If a required copy key is missing, treat it as a contract error and surface diagnostics according to existing project error-handling patterns.

Do not use player-facing `PvP` anywhere.

Do not use the word `timer` in player-facing text. The contract uses the technical object name `time`.

Do not describe automatic resolution as random, pure chance, or “zdaj się na los”. Automatic resolution still depends on hero strength, equipment, and combat rules.

The button label `Walcz!` intentionally has an exclamation mark as a CTA. Descriptions and tooltips use non-exclamatory wording such as `Poprowadź walkę samodzielnie...`.

Generated Supabase `database.types.ts` is owned by the user/Migrator. Codex must not edit or regenerate it. If `Database['public']['Functions']['get_pvp_action_copy']` is missing, stop and report generated types as stale.

## 2. Required GameCopy integration

Add this kind to the GameCopy registry:

```ts
'player.pvp.action'
```

Required registry args:

```ts
export interface PvpActionCopyArgs {
  locale: string;
}
```

Required reader shape, following the existing `player.pvp.ranking` reader pattern:

```ts
'player.pvp.action': (backend, args) =>
  backend.rpc<
    Database['public']['Functions']['get_pvp_action_copy']['Returns']
  >(
    RPC.get_pvp_action_copy,
    { p_locale: args.locale },
  ).pipe(map(mapPvpActionCopy))
```

Required RPC constant:

```ts
get_pvp_action_copy: 'get_pvp_action_copy'
```

Required mapper:

```ts
mapPvpActionCopy(raw: Database['public']['Functions']['get_pvp_action_copy']['Returns']): PvpActionCopy
```

The mapper may normalize unknown JSON into the typed frontend model, but it must not invent player-facing text.

## 3. TypeScript model

Put named types in a model/type file. Do not declare these types locally inside production component files.

```ts
export type GameCopyLocale = 'pl' | 'en';
export type RichTextTone = 'heading' | 'info' | 'warn' | 'success' | 'danger';

export interface PvpActionCopy {
  contractKey: 'pvp_action_copy';
  contractVersion: 'pvp_action_copy_v1';
  requestedLocale: string;
  locale: GameCopyLocale;
  fallbackLocale: 'en';
  common: PvpActionCommonCopy;
  activeAction: PvpActiveActionCopy;
  combatHandoff: PvpCombatHandoffCopy;
  eligibility: PvpActionEligibilityCopy;
}

export interface PvpActionCommonCopy {
  labels: PvpActionCommonLabelsCopy;
  richText: PvpActionCommonRichTextCopy;
  emptyValues: PvpActionCommonEmptyValuesCopy;
  actionLabels: PvpActionCommonActionLabelsCopy;
  actionTooltips: PvpActionCommonActionTooltipsCopy;
}

export interface PvpActionCommonLabelsCopy {
  combat: string;
  heroCombat: string;
  attack: string;
  attackAction: string;
  spyAction: string;
  spyProgress: string;
  scouting: string;
  siege: string;
  report: string;
  combatReport: string;
  spyReport: string;
  target: string;
  action: string;
  state: string;
  address: string;
  targetAddress: string;
  yourAddress: string;
  protection: string;
  actions: string;
  guild: string;
  level: string;
  rankPosition: string;
  remainingTime: string;
  arrivalTime: string;
  availableFrom: string;
  decisionTime: string;
  combatLog: string;
  result: string;
  battleLoot: string;
  resources: string;
  experience: string;
  glory: string;
  rank: string;
  buildings: string;
  equipment: string;
  stats: string;
  detection: string;
}

export interface PvpActionCommonRichTextCopy {
  gloryLabel: {
    text: string;
    tone: RichTextTone;
  };
}

export interface PvpActionCommonEmptyValuesCopy {
  noData: string;
  noTarget: string;
  noGuild: string;
  noAttackProtection: string;
  noValue: string;
}

export interface PvpActionCommonActionLabelsCopy {
  refresh: string;
  openReport: string;
  resolveManual: string;
  resolveAuto: string;
  enterCombat: string;
  backToVicinity: string;
  attack: string;
  spy: string;
  siege: string;
}

export interface PvpActionCommonActionTooltipsCopy {
  attack: string;
  spy: string;
  siegeUnavailable: string;
  resolveManual: string;
  resolveAuto: string;
  openReport: string;
  refresh: string;
}

export interface PvpActiveActionCopy {
  panel: PvpActiveActionPanelCopy;
  time: PvpActiveActionTimeCopy;
  phaseText: PvpActiveActionPhaseTextCopy;
  loading: PvpActiveActionLoadingCopy;
  readyStates: PvpActiveActionReadyStatesCopy;
}

export interface PvpActiveActionPanelCopy {
  defaultTitle: string;
  attackTitle: string;
  spyTitle: string;
  returnTitle: string;
  attackAriaLabel: string;
  spyAriaLabel: string;
  returnAriaLabel: string;
}

export interface PvpActiveActionTimeCopy {
  remainingTimeLabel: string;
  attackTravelLabel: string;
  spyTravelLabel: string;
  returnTravelLabel: string;
  decisionWindowLabel: string;
}

export interface PvpActiveActionPhaseTextCopy {
  attackTravel: string;
  spyTravel: string;
  attackManualWindow: string;
  attackReturn: string;
  attackResolved: string;
  spyResolved: string;
}

export interface PvpActiveActionLoadingCopy {
  refreshSpyState: string;
  refreshAttackState: string;
  refreshDecisionState: string;
  refreshReturnState: string;
  refreshUnknownState: string;
}

export interface PvpActiveActionReadyStatesCopy {
  decisionReady: string;
  targetReached: string;
  heroReturned: string;
  reportReady: string;
}

export interface PvpCombatHandoffCopy {
  header: PvpCombatHandoffHeaderCopy;
  decisionWindow: PvpCombatDecisionWindowCopy;
  emptyCombatLog: PvpCombatEmptyLogCopy;
}

export interface PvpCombatHandoffHeaderCopy {
  eyebrowCommonKey: 'common.labels.combat';
  titleCommonKey: 'common.labels.heroCombat';
  description: string;
}

export interface PvpCombatDecisionWindowCopy {
  eyebrow: string;
  title: string;
  description: string;
  decisionWindowLabelCommonKey: 'common.labels.decisionTime';
  manualActionCommonKey: 'common.actionLabels.resolveManual';
  autoActionCommonKey: 'common.actionLabels.resolveAuto';
  waitingForDecision: string;
}

export interface PvpCombatEmptyLogCopy {
  titleCommonKey: 'common.labels.combatLog';
  text: string;
}

export interface PvpActionEligibilityCopy {
  statusLabels: PvpActionEligibilityStatusLabelsCopy;
  disabledReasonTooltips: PvpActionDisabledReasonTooltipsCopy;
}

export interface PvpActionEligibilityStatusLabelsCopy {
  available: string;
  unavailable: string;
  actionUnavailable: string;
}

export interface PvpActionDisabledReasonTooltipsCopy {
  targetProtected: string;
  attackerBusy: string;
  targetLevelTooHigh: string;
  targetLevelTooLow: string;
  sameGuild: string;
  actionUnavailable: string;
  dailyAttackLimitReached: string;
  cooldownActive: string;
  siegeNotAvailable: string;
}
```

## 4. Payload path inventory and UI usage

### 4.1 Common labels

| Path | PL value | UI usage |
|---|---|---|
| `common.labels.combat` | `Walka` | eyebrow/source label/general combat area |
| `common.labels.heroCombat` | `Walka bohaterów` | combat screen title/event type |
| `common.labels.attack` | `Atak` | noun: action type/column |
| `common.labels.attackAction` | `Atakuj` | action button label when common labels are used directly |
| `common.labels.spyAction` | `Szpieguj` | action button label when common labels are used directly |
| `common.labels.spyProgress` | `Szpiegowanie` | active action/time context |
| `common.labels.scouting` | `Zwiad` | spy result/report type |
| `common.labels.siege` | `Oblężenie` | siege label |
| `common.labels.report` | `Raport` | generic report label |
| `common.labels.combatReport` | `Raport walki` | combat report shell |
| `common.labels.spyReport` | `Raport szpiegowania` | spy report shell |
| `common.labels.target` | `Cel` | target/fact rows |
| `common.labels.action` | `Akcja` | fact row |
| `common.labels.state` | `Stan` | fact row |
| `common.labels.address` | `Adres` | table/target panel |
| `common.labels.targetAddress` | `Adres celu` | fact row |
| `common.labels.yourAddress` | `Twój adres` | fact row |
| `common.labels.protection` | `Ochrona` | target panel |
| `common.labels.actions` | `Akcje` | table column |
| `common.labels.guild` | `Gildia` | table/target panel |
| `common.labels.level` | `Poziom` | ranking table |
| `common.labels.rankPosition` | `Pozycja` | ranking table |
| `common.labels.remainingTime` | `Pozostały czas` | general time label |
| `common.labels.arrivalTime` | `Czas dotarcia do celu` | fact row |
| `common.labels.availableFrom` | `Dostępne od` | fact row |
| `common.labels.decisionTime` | `Czas na decyzję` | decision time/fact row |
| `common.labels.combatLog` | `Przebieg starcia` | combat log section |
| `common.labels.result` | `Wynik starcia` | report section |
| `common.labels.battleLoot` | `Łup po walce` | rewards/loot section |
| `common.labels.resources` | `Zasoby` | resource section/row |
| `common.labels.experience` | `Doświadczenie` | XP section/row |
| `common.labels.glory` | `Chwała` | prestige/glory section/row |
| `common.labels.rank` | `Ranga` | rank section/row |
| `common.labels.buildings` | `Budynki` | spy section |
| `common.labels.equipment` | `Ekwipunek` | spy section |
| `common.labels.stats` | `Cechy` | spy section |
| `common.labels.detection` | `Wykrycie` | spy section |

### 4.2 Common action labels and tooltips

| Path | PL value | UI usage |
|---|---|---|
| `common.actionLabels.refresh` | `Odśwież` | refresh button |
| `common.actionLabels.openReport` | `Otwórz raport` | report navigation button |
| `common.actionLabels.resolveManual` | `Walcz!` | manual resolution CTA button only |
| `common.actionLabels.resolveAuto` | `Automatycznie` | auto resolution button |
| `common.actionLabels.enterCombat` | `Przejdź do walki` | enter combat button |
| `common.actionLabels.backToVicinity` | `Wróć do okolicy` | back navigation |
| `common.actionLabels.attack` | `Atakuj` | attack action button |
| `common.actionLabels.spy` | `Szpieguj` | spy action button |
| `common.actionLabels.siege` | `Oblężenie` | siege action label |
| `common.actionTooltips.attack` | `Wyzwij tego bohatera na pojedynek i walcz o zasoby, Chwałę oraz doświadczenie.` | attack tooltip |
| `common.actionTooltips.spy` | `Wyślij szpiegów, aby zdobyli informacje o zasobach, budynkach i cechach tego bohatera. Jeśli zostaną wykryci, przeciwnik może zechcieć się zemścić.` | spy tooltip |
| `common.actionTooltips.siegeUnavailable` | `Oblężenia nie są dostępne.` | disabled siege tooltip |
| `common.actionTooltips.resolveManual` | `Poprowadź walkę samodzielnie. W wielu starciach ręczne rozstrzygnięcie daje większą szansę na zwycięstwo.` | manual resolution tooltip |
| `common.actionTooltips.resolveAuto` | `Skorzystaj z automatycznego rozstrzygnięcia. Wynik nadal zależy od siły bohaterów, wyposażenia i zasad walki.` | automatic resolution tooltip |
| `common.actionTooltips.openReport` | `Przejdź do raportu z tej akcji.` | report tooltip |
| `common.actionTooltips.refresh` | `Pobierz aktualny stan akcji, czas i dostępne decyzje.` | refresh tooltip |

### 4.3 Active action panel

| Path | PL value | UI usage |
|---|---|---|
| `activeAction.panel.defaultTitle` | `Akcja w toku` | fallback active action title |
| `activeAction.panel.attackTitle` | `Bohater jest w drodze do posiadłości przeciwnika` | active attack title |
| `activeAction.panel.spyTitle` | `Szpiedzy próbują przeniknąć do posiadłości wroga` | active spy title |
| `activeAction.panel.returnTitle` | `Bohater wraca do domu po walce` | return title |
| `activeAction.panel.attackAriaLabel` | same as attack title | aria |
| `activeAction.panel.spyAriaLabel` | same as spy title | aria |
| `activeAction.panel.returnAriaLabel` | same as return title | aria |

### 4.4 Active action time

| Path | PL value | UI usage |
|---|---|---|
| `activeAction.time.remainingTimeLabel` | `Pozostały czas` | general time label |
| `activeAction.time.attackTravelLabel` | `Czas dotarcia do celu` | attack travel time |
| `activeAction.time.spyTravelLabel` | `Czas do zakończenia zwiadu` | spy action time |
| `activeAction.time.returnTravelLabel` | `Czas powrotu bohatera` | return time |
| `activeAction.time.decisionWindowLabel` | `Czas na decyzję` | decision window time |

### 4.5 Active action phase, loading, ready states

| Path | PL value | UI usage |
|---|---|---|
| `activeAction.phaseText.attackTravel` | `Bohater jest w drodze do posiadłości przeciwnika.` | attack in travel phase |
| `activeAction.phaseText.spyTravel` | `Szpiedzy próbują przeniknąć do posiadłości wroga.` | spy travel/infiltration phase |
| `activeAction.phaseText.attackManualWindow` | `Bohater dotarł do celu. Musisz zdecydować, czy poprowadzisz walkę samodzielnie, czy skorzystasz z automatycznego rozstrzygnięcia.` | decision phase |
| `activeAction.phaseText.attackReturn` | `Bohater wraca do posiadłości.` | return phase |
| `activeAction.phaseText.attackResolved` | `Starcie zostało rozstrzygnięte.` | resolved attack |
| `activeAction.phaseText.spyResolved` | `Zwiad został zakończony.` | resolved spy action |
| `activeAction.loading.refreshSpyState` | `Pobieramy aktualny stan zwiadu i informację o raporcie.` | spy refresh loading |
| `activeAction.loading.refreshAttackState` | `Pobieramy aktualny stan ataku i czas dotarcia do celu.` | attack refresh loading |
| `activeAction.loading.refreshDecisionState` | `Pobieramy aktualny stan walki i dostępne sposoby rozstrzygnięcia.` | decision refresh loading |
| `activeAction.loading.refreshReturnState` | `Pobieramy aktualny czas powrotu bohatera.` | return refresh loading |
| `activeAction.loading.refreshUnknownState` | `Pobieramy aktualny stan aktywnej akcji.` | fallback loading |
| `activeAction.readyStates.decisionReady` | `Wybierz sposób rozstrzygnięcia` | decision ready state |
| `activeAction.readyStates.targetReached` | `Bohater dotarł do celu` | target reached state |
| `activeAction.readyStates.heroReturned` | `Bohater wrócił do posiadłości` | hero returned state |
| `activeAction.readyStates.reportReady` | `Raport jest gotowy` | report ready state |

### 4.6 Combat handoff

Fields ending in `CommonKey` are references into the same payload. Frontend must resolve them and must not render the reference string itself.

| Path | PL value / ref | UI usage |
|---|---|---|
| `combatHandoff.header.eyebrowCommonKey` | `common.labels.combat` | header eyebrow |
| `combatHandoff.header.titleCommonKey` | `common.labels.heroCombat` | header title |
| `combatHandoff.header.description` | `Bohater dotarł do posiadłości przeciwnika. Teraz musisz wybrać sposób rozstrzygnięcia starcia.` | header description |
| `combatHandoff.decisionWindow.eyebrow` | `Przed starciem` | decision eyebrow |
| `combatHandoff.decisionWindow.title` | `Wybierz sposób rozstrzygnięcia` | decision title |
| `combatHandoff.decisionWindow.description` | `Możesz sam stoczyć walkę albo skorzystać z automatycznego rozstrzygnięcia.` | decision description |
| `combatHandoff.decisionWindow.decisionWindowLabelCommonKey` | `common.labels.decisionTime` | decision label |
| `combatHandoff.decisionWindow.manualActionCommonKey` | `common.actionLabels.resolveManual` | manual CTA |
| `combatHandoff.decisionWindow.autoActionCommonKey` | `common.actionLabels.resolveAuto` | automatic CTA |
| `combatHandoff.decisionWindow.waitingForDecision` | `Czeka na twój rozkaz` | waiting state |
| `combatHandoff.emptyCombatLog.titleCommonKey` | `common.labels.combatLog` | empty log title |
| `combatHandoff.emptyCombatLog.text` | `Gdy padnie pierwszy cios, tutaj pojawi się przebieg starcia.` | empty log text |

### 4.7 Eligibility

| Path | PL value | UI usage |
|---|---|---|
| `eligibility.statusLabels.available` | `Dostępny` | status |
| `eligibility.statusLabels.unavailable` | `Niedostępny` | status |
| `eligibility.statusLabels.actionUnavailable` | `Akcja niedostępna` | fallback status |
| `eligibility.disabledReasonTooltips.targetProtected` | `Ten bohater jest objęty ochroną i nie może zostać teraz zaatakowany.` | disabled reason |
| `eligibility.disabledReasonTooltips.attackerBusy` | `Twój bohater jest zajęty inną akcją i nie może teraz ruszyć do walki.` | disabled reason |
| `eligibility.disabledReasonTooltips.targetLevelTooHigh` | `Atak na tego bohatera nie przyniósłby ci chwały - byłby zwykłym samobójstwem.` | disabled reason |
| `eligibility.disabledReasonTooltips.targetLevelTooLow` | `Nie ma chwały w atakowaniu wyraźnie słabszych przeciwników.` | disabled reason |
| `eligibility.disabledReasonTooltips.sameGuild` | `Nie możesz zaatakować członka własnej gildii.` | disabled reason |
| `eligibility.disabledReasonTooltips.actionUnavailable` | `Nie możesz teraz wykonać tej akcji.` | disabled reason |
| `eligibility.disabledReasonTooltips.dailyAttackLimitReached` | `Wykorzystałeś dzienny limit ataków.` | disabled reason |
| `eligibility.disabledReasonTooltips.cooldownActive` | `Musisz zaczekać przed kolejną akcją.` | disabled reason |
| `eligibility.disabledReasonTooltips.siegeNotAvailable` | `Oblężenia nie są dostępne.` | disabled reason |

## 5. Suggested mapper behavior

The mapper should be small and strict:

1. Accept the raw `jsonb` return type from `get_pvp_action_copy`.
2. Verify `contractKey === 'pvp_action_copy'` and `contractVersion === 'pvp_action_copy_v1'`.
3. Verify all required top-level sections exist: `common`, `activeAction`, `combatHandoff`, `eligibility`.
4. Verify all required nested paths listed in this contract exist and are strings, except `common.richText.gloryLabel`, which is an object with `text` and `tone`.
5. Return the typed `PvpActionCopy` object.
6. Do not substitute Polish or English local fallback strings in the mapper.

If the project already has a shared copy-contract assertion helper, reuse it. Do not create a broad generic framework inside this slice.

## 6. Component consumption rules

Active action UI should consume:

```ts
this.gameCopy.getCopy('player.pvp.action', { locale })
```

Use `common.actionLabels.resolveManual` only for the CTA button label. Use `common.actionTooltips.resolveManual` for the explanatory tooltip.

Use `common.actionLabels.resolveAuto` only for the automatic resolution button label. Use `common.actionTooltips.resolveAuto` for the explanatory tooltip.

Use `activeAction.time.*` for player-facing time labels. Do not introduce `timer` labels.

Use `activeAction.phaseText.*` for active phase descriptions.

Use `activeAction.loading.*` for player-facing loading text.

Use `activeAction.readyStates.*` for ready/completed states.

Use `combatHandoff.*` for the manual/automatic combat handoff screen.

Use `eligibility.statusLabels.*` and `eligibility.disabledReasonTooltips.*` for action availability UI.

## 7. Files Codex will likely need to touch

Expected files, adjusted to the existing project layout:

```text
src/app/core/constants/rpc.const.ts
src/app/core/types/game-copy-registry.types.ts
src/app/core/types/game-copy-reader.types.ts
src/app/core/services/game-copy/game-copy-player.readers.ts
src/app/core/domain/player/pvp-action-copy.model.ts
src/app/core/utils/pvp-action-copy.mapper.ts
```

Do not edit:

```text
src/app/core/types/database.types.ts
```

The user/Migrator supplies generated Supabase types.

## 8. Acceptance checks for Codex

Codex should report:

```text
- get_pvp_action_copy reader added under GameCopyService.
- player.pvp.action registered in GameCopyRegistry and GameCopyReaders.
- PvpActionCopy named types are not declared inside components.
- Mapper validates contract identity and required sections.
- No local player-facing fallback copy was added.
- No player-facing PvP string was added.
- No player-facing timer string was added.
- database.types.ts was not edited.
```

Suggested static greps:

```bash
rg "PvP|timer|Zdaj się na los|zdaj się na los" src/app/game src/app/core
rg "Atak w toku|Szpiegowanie w toku|Rozstrzygnij auto|Akcja gotowa" src/app/game src/app/core
rg "get_pvp_action_copy|player\.pvp\.action|mapPvpActionCopy|PvpActionCopy" src/app/core src/app/game
```

The first two greps may still find unrelated legacy code outside the touched slice; Codex should classify whether each hit is touched scope, existing cleanup, or a blocker for this task.
