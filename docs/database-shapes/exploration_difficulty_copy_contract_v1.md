# Mythsworn Exploration - Difficulty Copy Contract v1

Status: **DB/RPC migration applied, frontend contract pending Reviewer/Codex handoff**  
Scope: **Exploration difficulty-selection article copy only**  
Out of scope: Exploration result narrative, direction/route article, oracle/timer article, sandbox/test copy, mechanics tooltip copy, combat rendering, report shell, reward/result generation logic.

## 0. Reviewer handoff summary

The migration added one focused copy RPC for the first Exploration page article:

- `get_player_exploration_difficulty_copy(p_locale text default 'pl') returns jsonb`

This RPC owns only the player-facing copy for the Exploration difficulty-selection article visible before or while choosing the difficulty of the active Exploration flow.

Frontend must use this RPC as the only source of copy for:

1. Exploration header article.
2. Top status panel labels and empty values for the difficulty-selection article.
3. Difficulty section title/description.
4. Difficulty cards for `easy`, `medium`, and `hard`.
5. Difficulty metrics labels.
6. Difficulty article actions.
7. Trial details section title/description/labels.
8. Trial names displayed in the details grid.

This RPC does **not** own Exploration result text. Result/report text is already owned by `exploration_result_copy_v1`, `resultNarrativeJson`, `rewardRichTextJson`, and `effectRichTextJson`.

Codex must not create local Polish fallback copy for this article. Missing copy is a DB/RPC blocker or a contract follow-up, not a reason to hardcode Angular strings.

## 1. Hard rules for Codex / Frontend

- Do not hardcode local Polish strings for the difficulty-selection article.
- Do not use raw difficulty keys such as `easy`, `medium`, `hard` as player-facing labels.
- Do not use English labels such as `Easy`, `Medium`, `Hard` when this RPC is available.
- Do not use stat labels in the Trial details grid. The grid must display Trial names from `trialDetails.trials`, not raw stat names.
- Do not infer Trial labels from stat keys locally in Angular.
- Do not render `Duchowości` and `Fatum` as plain text in the Trial details description when `descriptionRichText` is available. They must use `tone: 'heading'`.
- Do not invent custom rich text tones such as `divine`.
- Do not use en dash or em dash in player-facing copy; DB copy uses plain hyphen-minus where a dash is needed.
- Do not add page-copy keys for direction/oracle/result/sandbox/mechanics into this article contract.
- Do not treat this RPC as a general Exploration copy payload. It is intentionally narrow.
- Generated Supabase types will only say `jsonb`; this document is the authoritative recursive JSON contract.

## 2. RPC inventory and grants

| RPC | Return | Grants | Purpose |
|---|---|---|---|
| `get_player_exploration_difficulty_copy(p_locale text default 'pl')` | `jsonb` | `authenticated` | DB-owned copy for the Exploration difficulty-selection article. |

No `anon` grant is expected for this RPC because the page is authenticated gameplay UI.

## 3. RPC signature

```sql
get_player_exploration_difficulty_copy(
  p_locale text default 'pl'
) returns jsonb
```

## 4. Top-level return

```ts
interface ExplorationDifficultyCopyV1 {
  contractVersion: 'exploration_difficulty_copy_v1';
  locale: 'pl';
  articleKey: 'difficulty_selection';

  header: ExplorationDifficultyHeaderCopy;
  statusPanel: ExplorationDifficultyStatusPanelCopy;
  difficulty: ExplorationDifficultySectionCopy;
  trialDetails: ExplorationDifficultyTrialDetailsCopy;
}
```

### Required top-level values

```ts
{
  contractVersion: 'exploration_difficulty_copy_v1',
  locale: 'pl',
  articleKey: 'difficulty_selection'
}
```

Frontend must check `contractVersion`. If an unsupported version is returned, Codex should report a DB/RPC contract blocker instead of silently falling back to local strings.

## 5. Header copy

Located at `payload.header`.

```ts
interface ExplorationDifficultyHeaderCopy {
  eyebrow: string;
  title: string;
  intro: string;
}
```

Expected values:

```ts
{
  eyebrow: 'Eksploracja',
  title: 'Wyrusz po własny mit',
  intro: 'Poza murami posiadłości zaczyna się Hellada. Podczas wyprawy przez górzyste trakty i bezdroża Grecji możesz natrafić na potwory, bandytów, wędrowców, skrytki z zasobami, miejsca modlitwy albo omen zesłany przez bogów. Jeśli bogowie okażą ci łaskę, ześlą na ciebie Próbę - wyzwanie, w którym zwycięstwo przyniesie ci sławę i potężną nagrodę. Im dalej odejdziesz od zamieszkanych terenów, tym większe ryzyko - i tym większa szansa, że wrócisz z opowieścią, która dopisze kolejny rozdział twojego mitu.'
}
```

Usage:

- `eyebrow` is the small article/category label.
- `title` is the main title of the difficulty-selection article.
- `intro` is the long player-facing introductory description.

Do not shorten or paraphrase `intro` locally. Layout may visually truncate if required by the UI, but the source text must come from this field.

## 6. Status panel copy

Located at `payload.statusPanel`.

```ts
interface ExplorationDifficultyStatusPanelCopy {
  labels: ExplorationDifficultyStatusLabelsCopy;
  emptyValues: ExplorationDifficultyStatusEmptyValuesCopy;
}
```

### Status labels

Located at `payload.statusPanel.labels`.

```ts
interface ExplorationDifficultyStatusLabelsCopy {
  difficulty: string;
  estimatedAutoResult: string;
  trialsToday: string;
  activeEffect: string;
}
```

Expected values:

```ts
{
  difficulty: 'Trudność',
  estimatedAutoResult: 'Szansa automatycznego rozstrzygnięcia',
  trialsToday: 'Pozostałe próby',
  activeEffect: 'Znak od bogów'
}
```

Usage:

- `difficulty` labels the currently selected difficulty.
- `estimatedAutoResult` labels the estimated automatic resolution chance.
- `trialsToday` labels remaining daily Trial opportunities.
- `activeEffect` labels the current Exploration effect/buff/debuff summary.

`activeEffect` is intentionally not `Tymczasowy efekt`. Use `Znak od bogów`.

### Status empty values

Located at `payload.statusPanel.emptyValues`.

```ts
interface ExplorationDifficultyStatusEmptyValuesCopy {
  noDifficulty: string;
  noAutoResult: string;
  noTrials: string;
  noEffect: string;
}
```

Expected values:

```ts
{
  noDifficulty: 'Nie wybrano',
  noAutoResult: 'Brak danych',
  noTrials: 'Brak prób',
  noEffect: 'Bogowie są neutralni'
}
```

Usage:

- Use `noEffect` when there is no active positive or negative Exploration effect.
- Do not render local alternatives such as `Brak aktywnego`, `Brak aktywnego efektu`, or English fallback labels.

## 7. Difficulty section copy

Located at `payload.difficulty`.

```ts
interface ExplorationDifficultySectionCopy {
  section: ExplorationDifficultySectionIntroCopy;
  cards: ExplorationDifficultyCardsCopy;
  metrics: ExplorationDifficultyMetricLabelsCopy;
  actions: ExplorationDifficultyActionCopy;
}
```

### Difficulty section intro

Located at `payload.difficulty.section`.

```ts
interface ExplorationDifficultySectionIntroCopy {
  title: string;
  description: string;
}
```

Expected values:

```ts
{
  title: 'Poziom trudności',
  description: 'Od wyboru trudności zależy, jak daleko od bezpiecznych traktów zapuści się bohater. Łatwiejsza droga częściej pozwala wrócić bez ran, ale też przynosi mniej doświadczenia i słabsze przedmioty. Trudniejsza częściej prowadzi do większej chwały i potężniejszych darów, ale ceną może być gniew bogów i bolesna porażka.'
}
```

Usage:

- This section explains why the player is choosing a difficulty.
- It must remain player-facing and narrative, not technical documentation.
- It must not mention implementation terms such as RPC, server, payload, or algorithm.

### Difficulty cards

Located at `payload.difficulty.cards`.

```ts
interface ExplorationDifficultyCardsCopy {
  easy: ExplorationDifficultyCardCopy;
  medium: ExplorationDifficultyCardCopy;
  hard: ExplorationDifficultyCardCopy;
}
```

```ts
interface ExplorationDifficultyCardCopy {
  title: string;
  subtitle: string;
  description: string;
}
```

#### Easy card

Located at `payload.difficulty.cards.easy`.

```ts
{
  title: 'Wzgórza Peloponezu',
  subtitle: 'Sielankowa podróż niedaleko własnej posiadłości',
  description: 'Trzymasz się pól, wiosek i dróg, którymi podróżują zwykli ludzie. Tu częściej miniesz kupca, rolnika albo przydrożną kapliczkę niż bestię ukrytą w ciemnym lesie. To dobry wybór dla bohatera, który rozpoczyna swoją przygodę, chce zebrać pierwsze doświadczenia i zdobyć pierwsze przedmioty.'
}
```

#### Medium card

Located at `payload.difficulty.cards.medium`.

```ts
{
  title: 'Słupy Heraklesa',
  subtitle: 'Wyprawa w nieznane na krańce świata',
  description: 'Udajesz się w podróż ku granicom znanego świata. Tu docierają jedynie nieliczni feniccy kupcy - dość odważni albo dość głupi, by nie bać się potworów, bandytów i gniewu bogów. Możesz trafić na cenne znalezisko, poważne zagrożenie albo Próbę, która oddzieli pustą ambicję od prawdziwej chwały.'
}
```

`feniccy kupcy` is intentional. Do not replace it with a generic traveler/merchant phrase.

#### Hard card

Located at `payload.difficulty.cards.hard`.

```ts
{
  title: 'Okolice Styksu',
  subtitle: 'Od podnóży Olimpu do Krainy Umarłych',
  description: 'Idziesz w miejsca, do których rozsądni wędrowcy nie zapuszczają się prawie nigdy: odludne pustkowia, gęste lasy, stare ruiny i niedostępne wzgórza. Twoja wyprawa może zaprowadzić cię aż na brzeg Styksu. Próby zesłane przez bogów są prawdziwym wyzwaniem dla śmiałka, który odważy się stawić im czoło, a niebezpieczeństwo idzie w parze z nagrodą wartą ryzyka.'
}
```

### Difficulty card usage rules

- The runtime difficulty key is still `easy`, `medium`, or `hard`.
- The displayed title must be taken from `payload.difficulty.cards[difficultyKey].title`.
- Do not display raw keys or English labels like `Easy`, `Medium`, `Hard` in this article when this RPC is available.
- `title`, `subtitle`, and `description` are all player-facing.
- The cards intentionally use mythic/geographical labels rather than generic difficulty labels.

## 8. Difficulty metrics copy

Located at `payload.difficulty.metrics`.

```ts
interface ExplorationDifficultyMetricLabelsCopy {
  duration: string;
  trialChance: string;
  manifestationChance: string;
  autoResolveChance: string;
  rewardItems: string;
}
```

Expected values:

```ts
{
  duration: 'Czas odcinka',
  trialChance: 'Szansa próby',
  manifestationChance: 'Szansa manifestacji',
  autoResolveChance: 'Szansa automatycznego rozstrzygnięcia',
  rewardItems: 'Dary z Próby'
}
```

Usage:

- Use these labels for the difficulty cards' numeric/stat rows.
- Do not render `Wynik auto` for `autoResolveChance` in this article.
- Do not render `Przedmioty z nagrody` for `rewardItems`.
- `Dary z Próby` is intentional because item rewards are tied to successful Trials, not to every encounter.
- Detailed tooltips explaining these metrics belong to a later mechanics-copy RPC, not this contract.

## 9. Difficulty actions copy

Located at `payload.difficulty.actions`.

```ts
interface ExplorationDifficultyActionCopy {
  startExploration: string;
  continueExploration: string;
  changeDifficulty: string;
}
```

Expected values:

```ts
{
  startExploration: 'Rozpocznij eksplorację',
  continueExploration: 'Kontynuuj wyprawę',
  changeDifficulty: 'Zmień poziom trudności'
}
```

Usage:

- Use `startExploration` when no Exploration step has started and the CTA starts the selected difficulty flow.
- Use `continueExploration` when the CTA continues the current Expedition/Exploration flow from the difficulty article.
- Use `changeDifficulty` for the button that returns from later Exploration states to the difficulty-selection article.
- Do not invent generic `Wybierz`, `Wybrano`, `Odśwież`, or `Wróć` labels for this article unless a future contract adds them.

## 10. Trial details copy

Located at `payload.trialDetails`.

```ts
interface ExplorationDifficultyTrialDetailsCopy {
  section: ExplorationDifficultyTrialDetailsSectionCopy;
  labels: ExplorationDifficultyTrialDetailsLabelsCopy;
  trials: ExplorationDifficultyTrialLabelsCopy;
}
```

### Trial details section

Located at `payload.trialDetails.section`.

```ts
interface ExplorationDifficultyTrialDetailsSectionCopy {
  title: string;
  descriptionPlainText: string;
  descriptionRichText: ExplorationDifficultyRichTextFragment[];
}
```

Expected values:

```ts
{
  title: 'Próby bogów',
  descriptionPlainText: 'Każda próba należy do jednego z bogów, ale jej przebieg zależy od cech bohatera. Próba składa się z szansy na manifestację oraz szansy powodzenia - im wyższy poziom cechy, tym większe szanse na łaskę bogów oraz sukces w samej próbie. Wysoki poziom Duchowości oraz Fatum zwiększa szansę na to, że bogowie zwrócą na ciebie uwagę i ześlą próbę.',
  descriptionRichText: [ ... ]
}
```

`descriptionPlainText` exists for plain fallback/accessibility/search. Frontend display should prefer `descriptionRichText` when rendering the visible article text.

### Trial details rich text fragment

```ts
interface ExplorationDifficultyRichTextFragment {
  kind: 'text';
  text: string;
  tone?: 'heading' | 'info' | 'warn' | 'success' | 'danger';
}
```

Current `descriptionRichText` value:

```ts
[
  {
    kind: 'text',
    text: 'Każda próba należy do jednego z bogów, ale jej przebieg zależy od cech bohatera. Próba składa się z szansy na manifestację oraz szansy powodzenia - im wyższy poziom cechy, tym większe szanse na łaskę bogów oraz sukces w samej próbie. Wysoki poziom '
  },
  {
    kind: 'text',
    text: 'Duchowości',
    tone: 'heading'
  },
  {
    kind: 'text',
    text: ' oraz '
  },
  {
    kind: 'text',
    text: 'Fatum',
    tone: 'heading'
  },
  {
    kind: 'text',
    text: ' zwiększa szansę na to, że bogowie zwrócą na ciebie uwagę i ześlą próbę.'
  }
]
```

Rendering rules:

- `tone: 'heading'` means heading color and bold text.
- `Duchowości` and `Fatum` must be rendered with heading tone.
- Do not locally lowercase mechanics names such as `Duchowość` or `Fatum`.
- Do not invent new tones.

### Trial details labels

Located at `payload.trialDetails.labels`.

```ts
interface ExplorationDifficultyTrialDetailsLabelsCopy {
  selectedDifficulty: string;
  manifestation: string;
  autoResult: string;
}
```

Expected values:

```ts
{
  selectedDifficulty: 'Wybrana trudność',
  manifestation: 'Szansa na skuteczną modlitwę',
  autoResult: 'Szansa automatycznego rozstrzygnięcia'
}
```

Usage:

- Use `manifestation` for the Trial details manifestation/progress row.
- Use `autoResult` for the Trial details automatic resolution/progress row.
- Do not render `Manifestacja` or `Wynik auto` in this article when the RPC is available.

### Trial labels

Located at `payload.trialDetails.trials`.

```ts
interface ExplorationDifficultyTrialLabelsCopy {
  strength: string;
  dexterity: string;
  endurance: string;
  agility: string;
  cunning: string;
  charisma: string;
  wisdom: string;
  intelligence: string;
  spirituality: string;
}
```

Expected values:

```ts
{
  strength: 'Próba Aresa',
  dexterity: 'Próba Artemidy',
  endurance: 'Próba Hefajstosa',
  agility: 'Próba Apolla',
  cunning: 'Próba Hermesa',
  charisma: 'Próba Afrodyty',
  wisdom: 'Próba Ateny',
  intelligence: 'Próba Hery',
  spirituality: 'Próba Zeusa'
}
```

Usage:

- These object keys are mechanical stat keys only.
- Do not display the keys.
- Do not display stat labels such as `Siła`, `Zręczność`, `Wytrzymałość`, etc. in this Trial details grid.
- Display only the Trial name values returned by the RPC.
- The goal is for players to see Trial names, not a direct stat-label table.

## 11. Non-owned fields and explicit out-of-scope UI

This RPC does not own:

- Exploration result narrative.
- Trial/Encounter result titles.
- Reward sentences.
- Effect sentences.
- Combat log labels.
- Report shell actions such as public link copying.
- Direction-board copy.
- Oracle/timer copy.
- Sandbox/test tool copy.
- Mechanics tooltips.
- Item display names.
- Resource/stat dictionary labels outside the specific Trial details labels above.

Use the appropriate domain/source contract for those surfaces.

## 12. Expected rendering on the difficulty-selection article

The page/article should use these fields as follows:

```ts
const copy = await get_player_exploration_difficulty_copy('pl');

copy.header.eyebrow;
copy.header.title;
copy.header.intro;

copy.statusPanel.labels.difficulty;
copy.statusPanel.labels.estimatedAutoResult;
copy.statusPanel.labels.trialsToday;
copy.statusPanel.labels.activeEffect;
copy.statusPanel.emptyValues.noEffect;

copy.difficulty.section.title;
copy.difficulty.section.description;
copy.difficulty.cards[difficultyKey].title;
copy.difficulty.cards[difficultyKey].subtitle;
copy.difficulty.cards[difficultyKey].description;
copy.difficulty.metrics.duration;
copy.difficulty.metrics.trialChance;
copy.difficulty.metrics.manifestationChance;
copy.difficulty.metrics.autoResolveChance;
copy.difficulty.metrics.rewardItems;
copy.difficulty.actions.startExploration;
copy.difficulty.actions.continueExploration;
copy.difficulty.actions.changeDifficulty;

copy.trialDetails.section.title;
copy.trialDetails.section.descriptionRichText;
copy.trialDetails.labels.selectedDifficulty;
copy.trialDetails.labels.manifestation;
copy.trialDetails.labels.autoResult;
copy.trialDetails.trials[statKey];
```

Any other player-facing text on this article is either:

1. Data from existing runtime/read models, or
2. Out of scope and must be covered by another source-domain copy contract.

It must not be invented locally.

## 13. Verification coverage

Verified after migration:

- `get_player_exploration_difficulty_copy(text)` exists.
- Function is `stable`.
- Function is `security definer`.
- `authenticated` can execute.
- `anon` cannot execute.
- `contractVersion='exploration_difficulty_copy_v1'`.
- `articleKey='difficulty_selection'`.
- Header title is `Wyrusz po własny mit`.
- Active effect label is `Znak od bogów`.
- No-effect value is `Bogowie są neutralni`.
- Difficulty card titles are `Wzgórza Peloponezu`, `Słupy Heraklesa`, `Okolice Styksu`.
- Reward item metric label is `Dary z Próby`.
- Trial labels include `Próba Aresa` and `Próba Zeusa`.
- No forbidden en dash/em dash was detected in the checked strings.
- No forbidden `divine` tone was detected.
- `descriptionRichText` has exactly two `heading` fragments: `Duchowości`, `Fatum`.

## 14. Codex implementation boundary

Codex should:

- Add a typed frontend model for `exploration_difficulty_copy_v1`.
- Fetch `get_player_exploration_difficulty_copy('pl')` for the difficulty-selection article.
- Render only the fields defined in this contract for this article's copy.
- Render `descriptionRichText` with tone-aware rich-text rendering.
- Use `tone: 'heading'` as heading color plus bold.
- Map runtime difficulty keys `easy | medium | hard` to `copy.difficulty.cards[key]`.
- Map runtime/stat keys to `copy.trialDetails.trials[key]` for the Trial details grid.
- Report missing fields as a DB/RPC blocker or contract follow-up.

Codex should not:

- Edit generated Supabase types.
- Regenerate generated Supabase types.
- Direct-read copy tables.
- Hardcode local Polish fallback strings.
- Use previous local labels like `Easy`, `Medium`, `Hard`, `Wynik auto`, `Manifestacja`, or stat names when the RPC field exists.
- Add generic common copy keys not present in this RPC.
- Add direction/oracle/sandbox/result/mechanics copy to this article model.
- Infer narrative from runtime values.
- Translate or rewrite this DB-owned copy locally.

## 15. Follow-ups outside this contract

Remaining Exploration copy slices:

1. `get_player_exploration_direction_copy(...)` - direction/route article.
2. `get_player_exploration_oracle_copy(...)` - timer/oracle/result-ready article.
3. `get_player_exploration_mechanics_copy(...)` - tooltip/mechanics explanations.
4. `get_player_exploration_sandbox_copy(...)` - sandbox/test tools.

Separate non-copy follow-up:

- Combat encounter parent reports.

After adding this RPC, regenerate Supabase database types before Codex relies on generated RPC typing.
