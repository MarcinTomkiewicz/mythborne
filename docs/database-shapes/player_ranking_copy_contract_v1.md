# Mythsworn PvP Ranking Copy Contract - `get_pvp_ranking_copy`

Status: DB/RPC copy contract applied and verified
Audience: Codex / frontend implementation
Scope: PvP hero ranking / opponent selection copy only
Out of scope: ranking read model, PvP action execution, Vicinity copy, combat result rendering, prestige implementation

---

## 1. RPC

```sql
get_pvp_ranking_copy(
  p_locale text default 'pl'
) returns jsonb
```

Access:

```text
anon: execute allowed
authenticated: execute allowed
```

Purpose:

```text
DB-owned locale-backed static copy for the PvP hero ranking / opponent selection UI.
```

This RPC is public-safe. It does not expose hero state, target data, ranking rows, PvP action availability, resource data, or private player state.

Do not use these names:

```sql
get_pvp_ranking_page_copy(...)
get_ranking_copy(...)
```

---

## 2. Locale behavior

The RPC returns:

```ts
requestedLocale: string;
locale: 'pl' | 'en';
fallbackLocale: 'en';
```

Rules:

```text
p_locale = 'pl'    -> locale = 'pl'
p_locale = 'pl-PL' -> locale = 'pl'
p_locale = 'en'    -> locale = 'en'
p_locale = 'de'    -> locale = 'en'
p_locale = null/empty -> locale = 'pl'
```

Frontend must use `locale` as the resolved locale and may use `requestedLocale` only for diagnostics.

---

## 3. Top-level shape

```ts
interface PvpRankingCopy {
  contractKey: 'pvp_ranking_copy';

  requestedLocale: string;
  locale: 'pl' | 'en';
  fallbackLocale: 'en';

  common: PvpRankingCommonCopy;
  header: PvpRankingHeaderCopy;
  playerStatus: PvpRankingPlayerStatusCopy;
  ranking: PvpRankingRankingCopy;
  filters: PvpRankingFiltersCopy;
  table: PvpRankingTableCopy;
  targetPanel: PvpRankingTargetPanelCopy;
  actions: PvpRankingActionsCopy;
  disabledReasonTooltips: PvpRankingDisabledReasonTooltipsCopy;
  feedback: PvpRankingFeedbackCopy;
}
```

Frontend rule:

```ts
const copy = get_pvp_ranking_copy(locale);
```

Do not create local Polish fallback labels in Angular.

---

## 4. `common`

```ts
interface PvpRankingCommonCopy {
  emptyValues: {
    noAttackProtection: string;
    noData: string;
    noGuild: string;
    noValue: string;
  };
}
```

Current PL values:

```json
{
  "noAttackProtection": "Brak aktywnej ochrony",
  "noData": "Brak danych",
  "noGuild": "Brak gildii",
  "noValue": "-"
}
```

Usage:

```ts
copy.common.emptyValues.noAttackProtection
copy.common.emptyValues.noData
copy.common.emptyValues.noGuild
copy.common.emptyValues.noValue
```

Rules:

* Use `noGuild` when data context returns `guildName: null`.
* Use `noAttackProtection` when protection display is `null`.
* Use `noData` for missing generic display values that are expected to be nullable.
* Use `noValue` only for compact table fallback where a dash is acceptable.

Do not add:

```ts
copy.common.emptyValues.noRankingPosition
copy.common.emptyValues.freeAddress
```

Reason:

* Active hero must have a ranking position.
* Ranking shows heroes only, not free addresses.

---

## 5. `header`

```ts
interface PvpRankingHeaderCopy {
  eyebrow: string;
  title: string;
  intro: string;
}
```

Current PL values:

```json
{
  "eyebrow": "PvP",
  "title": "Wybierz przeciwnika",
  "intro": "Na stronie rankingu wybierasz przeciwnika do walki. Zwycięstwo daje ci prawo do przejęcia części zasobów pokonanego bohatera; porażka oznacza okup wypłacony zwycięzcy. Ataki na innych graczy są głównym źródłem doświadczenia - im silniejszego przeciwnika wyzwiesz, tym więcej możesz zyskać. W walce zdobywasz również prestiż (funkcja na razie niedostępna). Rosnący prestiż buduje twoją chwałę w Helladzie, otwiera drogę do Rady Hellady i w przyszłości może przybliżyć cię do Tronu."
}
```

Usage:

```ts
copy.header.eyebrow
copy.header.title
copy.header.intro
```

Rules:

* `eyebrow` may remain `PvP` for pre-alpha.
* `intro` already includes the prestige placeholder: `(funkcja na razie niedostępna)`.
* Do not replace `Rady Hellady` or `Tronu` with lowercase variants.
* Do not mention database, RPC, rank formula, or implementation details in player-facing header copy.

---

## 6. `playerStatus`

```ts
interface PvpRankingPlayerStatusCopy {
  labels: {
    dailyAttackLimit: string;
    rankingPosition: string;
    attackProtection: string;
    siegeProtection: string;
  };

  emptyValueKeys: {
    attackProtection: 'noAttackProtection';
    siegeProtection: 'noData';
    generic: 'noData';
  };
}
```

Current PL `labels`:

```json
{
  "dailyAttackLimit": "Dzienna liczba ataków",
  "rankingPosition": "Twoja pozycja w rankingu",
  "attackProtection": "Ochrona przed atakiem",
  "siegeProtection": "Ochrona przed oblężeniem"
}
```

Current PL `emptyValueKeys`:

```json
{
  "attackProtection": "noAttackProtection",
  "siegeProtection": "noData",
  "generic": "noData"
}
```

Usage with ranking context:

```ts
const status = context.activeHero;

dailyAttackLimitLabel = copy.playerStatus.labels.dailyAttackLimit;
dailyAttackLimitValue = `${status.dailyAttackLimitRemaining}/${status.dailyAttackLimitMax}`;

rankingPositionLabel = copy.playerStatus.labels.rankingPosition;
rankingPositionValue = status.rankingPosition;

attackProtectionLabel = copy.playerStatus.labels.attackProtection;
attackProtectionValue =
  status.attackProtectionDisplay ??
  copy.common.emptyValues[copy.playerStatus.emptyValueKeys.attackProtection];

siegeProtectionLabel = copy.playerStatus.labels.siegeProtection;
siegeProtectionValue =
  status.siegeProtectionDisplay ??
  copy.common.emptyValues[copy.playerStatus.emptyValueKeys.siegeProtection];
```

Rules:

* Do not render `noRankingPosition`.
* If `activeHero.rankingPosition` is missing/null in the future, report it as a read-model issue. Do not invent player-facing copy for that state.
* `attackProtectionDisplay` and `siegeProtectionDisplay` are dynamic display strings from the ranking context when present.
* Static empty labels are resolved through `common.emptyValues`.

---

## 7. `ranking`

```ts
interface PvpRankingRankingCopy {
  title: string;
  description: string;
}
```

Current PL values:

```json
{
  "title": "Ranking bohaterów",
  "description": "Ranking jest uporządkowany według poziomu bohaterów. Wybierz dzielnicę, odszukaj bohatera lub adres i zdecyduj, czy najpierw wyślesz szpiegów, czy od razu rozpoczniesz atak."
}
```

Usage:

```ts
copy.ranking.title
copy.ranking.description
```

Rules:

* Ranking displays heroes only.
* Do not display free addresses in ranking.
* Do not mention sorting internals such as `districtRank`, `addressNumber`, or database order.

---

## 8. `filters`

```ts
interface PvpRankingFiltersCopy {
  districtLabel: string;

  districtOptions: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };

  searchLabel: string;
  searchPlaceholder: string;
  searchAction: string;
  myPositionAction: string;
}
```

Current PL values:

```json
{
  "districtLabel": "Dzielnica",
  "districtOptions": {
    "A": "Dzielnica A (A)",
    "B": "Dzielnica B (B)",
    "C": "Dzielnica C (C)",
    "D": "Dzielnica D (D)",
    "E": "Dzielnica E (E)"
  },
  "searchLabel": "Szukaj bohatera lub adresu",
  "searchPlaceholder": "Szukaj bohatera lub adresu",
  "searchAction": "Szukaj",
  "myPositionAction": "Moja pozycja"
}
```

Usage with ranking context:

```ts
districtLabel = copy.filters.districtLabel;

districtOptions = context.filters.districtOptions.map(option => ({
  key: option.key,
  label: copy.filters.districtOptions[option.key],
  enabled: option.enabled
}));

searchLabel = copy.filters.searchLabel;
searchPlaceholder = copy.filters.searchPlaceholder;
searchActionLabel = copy.filters.searchAction;
myPositionActionLabel = copy.filters.myPositionAction;
```

Rules:

* Context owns `districtOptions[].key` and `enabled`.
* Copy owns district option labels.
* Frontend must not create local labels like `Dzielnica ${key}`.
* `Moja pozycja` should call the ranking context with no query, no district, and `p_offset = null`; frontend must not calculate the active hero page offset.

---

## 9. `table`

```ts
interface PvpRankingTableCopy {
  columns: {
    rankPosition: string;
    hero: string;
    level: string;
    address: string;
    attackDuration: string;
    spyDuration: string;
    actions: string;
  };

  emptyValueKeys: {
    noGuild: 'noGuild';
    noValue: 'noValue';
  };

  emptyState: {
    title: string;
    text: string;
  };
}
```

Current PL `columns`:

```json
{
  "rankPosition": "Pozycja",
  "hero": "Bohater",
  "level": "Poziom",
  "address": "Adres",
  "attackDuration": "Atak",
  "spyDuration": "Szpieguj",
  "actions": "Akcje"
}
```

Current PL `emptyValueKeys`:

```json
{
  "noGuild": "noGuild",
  "noValue": "noValue"
}
```

Current PL `emptyState`:

```json
{
  "title": "Nie znaleziono przeciwników",
  "text": "Zmień dzielnicę albo wpisz inny fragment imienia bohatera lub adresu."
}
```

Expected table columns in UI:

```text
Pozycja
Bohater
Poziom
Adres
Atak
Szpieguj
Akcje
```

Usage:

```ts
copy.table.columns.rankPosition
copy.table.columns.hero
copy.table.columns.level
copy.table.columns.address
copy.table.columns.attackDuration
copy.table.columns.spyDuration
copy.table.columns.actions
```

Rendering row data:

```ts
row.rankPosition
row.heroName
row.guildName ?? copy.common.emptyValues[copy.table.emptyValueKeys.noGuild]
row.level
row.addressDisplay
row.attackDurationDisplay ?? copy.common.emptyValues[copy.table.emptyValueKeys.noValue]
row.spyDurationDisplay ?? copy.common.emptyValues[copy.table.emptyValueKeys.noValue]
row.actions
```

Empty list:

```ts
copy.table.emptyState.title
copy.table.emptyState.text
```

Rules:

* Ranking table must not render free addresses.
* Do not expect `freeAddress` copy.
* Do not sort rows in Angular.
* Do not calculate rank positions in Angular.
* Do not derive attack/spy availability in Angular.

---

## 10. `targetPanel`

```ts
interface PvpRankingTargetPanelCopy {
  labels: {
    target: string;
    guild: string;
    address: string;
    attackDuration: string;
    spyDuration: string;
    protection: string;
  };

  emptyValueKeys: {
    guild: 'noGuild';
    protection: 'noAttackProtection';
    generic: 'noData';
  };

  emptyState: {
    title: string;
    text: string;
  };
}
```

Current PL `labels`:

```json
{
  "target": "Cel",
  "guild": "Gildia",
  "address": "Adres",
  "attackDuration": "Czas ataku",
  "spyDuration": "Czas szpiegowania",
  "protection": "Ochrona"
}
```

Current PL `emptyValueKeys`:

```json
{
  "guild": "noGuild",
  "protection": "noAttackProtection",
  "generic": "noData"
}
```

Current PL `emptyState`:

```json
{
  "title": "Wybierz cel",
  "text": "Wybierz bohatera z rankingu, aby zobaczyć czas ataku, czas szpiegowania, ochronę i dostępne akcje."
}
```

Usage:

```ts
if (!context.selectedTarget) {
  render(copy.targetPanel.emptyState.title);
  render(copy.targetPanel.emptyState.text);
}
```

Selected target:

```ts
const target = context.selectedTarget;

targetLabel = copy.targetPanel.labels.target;
guildLabel = copy.targetPanel.labels.guild;
addressLabel = copy.targetPanel.labels.address;
attackDurationLabel = copy.targetPanel.labels.attackDuration;
spyDurationLabel = copy.targetPanel.labels.spyDuration;
protectionLabel = copy.targetPanel.labels.protection;

targetName = target.heroName;
guildValue =
  target.guildName ??
  copy.common.emptyValues[copy.targetPanel.emptyValueKeys.guild];

addressValue = target.addressDisplay;

attackDurationValue =
  target.attackDurationDisplay ??
  copy.common.emptyValues[copy.targetPanel.emptyValueKeys.generic];

spyDurationValue =
  target.spyDurationDisplay ??
  copy.common.emptyValues[copy.targetPanel.emptyValueKeys.generic];

protectionValue =
  target.protectionDisplay ??
  copy.common.emptyValues[copy.targetPanel.emptyValueKeys.protection];
```

Rules:

* There is no `targetPanel.labels.actions`.
* Action labels are under `copy.actions`.
* `selectedTarget` shape should match row shape.
* Do not add local empty text for guild/protection.

---

## 11. `actions`

```ts
interface PvpRankingActionsCopy {
  spy: {
    label: string;
    tooltip: string;
  };

  attack: {
    label: string;
    tooltip: string;
  };

  siege: {
    label: string;
    tooltip: string;
    disabledTooltip: string;
  };
}
```

Current PL values:

```json
{
  "spy": {
    "label": "Szpieguj",
    "tooltip": "Wyślij szpiegów"
  },
  "attack": {
    "label": "Atak",
    "tooltip": "Rozpocznij atak"
  },
  "siege": {
    "label": "Oblężenie",
    "tooltip": "Rozpocznij oblężenie",
    "disabledTooltip": "Oblężenia nie są dostępne."
  }
}
```

Usage:

```ts
copy.actions.spy.label
copy.actions.spy.tooltip

copy.actions.attack.label
copy.actions.attack.tooltip

copy.actions.siege.label
copy.actions.siege.tooltip
copy.actions.siege.disabledTooltip
```

Action rendering:

```ts
function getActionTooltip(
  action: 'spy' | 'attack' | 'siege',
  state: PvpRankingActionState,
  copy: PvpRankingCopy
): string {
  if (!state.enabled && state.disabledReasonKey) {
    return copy.disabledReasonTooltips[state.disabledReasonKey];
  }

  return copy.actions[action].tooltip;
}
```

Rules:

* Use `disabledReasonTooltips[disabledReasonKey]` for disabled action tooltips.
* Use default action tooltip only when action is enabled or has no disabled reason.
* `siege.disabledTooltip` is available for simple disabled siege button display, but `disabledReasonTooltips.siege_not_available` is the canonical reason-key tooltip.
* Do not hardcode action tooltips in Angular.

---

## 12. `disabledReasonTooltips`

```ts
type PvpRankingDisabledReasonKey =
  | 'no_target'
  | 'self_target'
  | 'daily_attack_limit_reached'
  | 'attack_protection_active'
  | 'target_level_too_high'
  | 'target_level_too_low'
  | 'spy_unavailable'
  | 'attack_unavailable'
  | 'siege_unavailable'
  | 'siege_not_available'
  | 'cooldown_active';

type PvpRankingDisabledReasonTooltipsCopy =
  Record<PvpRankingDisabledReasonKey, string>;
```

Current PL values:

```json
{
  "no_target": "Wybierz przeciwnika.",
  "self_target": "Nie możesz zaatakować własnej posiadłości.",
  "daily_attack_limit_reached": "Wykorzystałeś dzienny limit ataków.",
  "attack_protection_active": "Ten bohater jest objęty ochroną przed atakiem.",
  "target_level_too_high": "Atak na tego bohatera nie przyniósłby ci chwały - byłby zwykłym samobójstwem.",
  "target_level_too_low": "Nie ma chwały w atakowaniu wyraźnie słabszych przeciwników.",
  "spy_unavailable": "Nie możesz teraz wysłać szpiegów.",
  "attack_unavailable": "Nie możesz teraz rozpocząć ataku.",
  "siege_unavailable": "Nie możesz teraz rozpocząć oblężenia.",
  "siege_not_available": "Oblężenia nie są dostępne.",
  "cooldown_active": "Musisz zaczekać przed kolejną akcją."
}
```

Usage:

```ts
const reasonKey = row.actions.attack.disabledReasonKey;

const tooltip =
  reasonKey == null
    ? copy.actions.attack.tooltip
    : copy.disabledReasonTooltips[reasonKey];
```

Rules:

* Copy covers the full agreed union of disabled reason keys.
* Ranking row actions should not emit arbitrary strings.
* `no_target` is primarily a UI/copy key for empty target panel state. Row actions normally should not emit it, because each row has a target.
* `siege_not_available` is the current expected siege reason.
* `siege_unavailable` remains covered for future or fallback coverage.
* `attack_unavailable` and `spy_unavailable` are fallback reasons. If they appear frequently in read model smoke, technical classification is too broad and should be refined.
* `target_level_too_high` and `target_level_too_low` must be decided by DB/RPC ranking context from target level and active hero attack level range.

---

## 13. `feedback`

```ts
interface PvpRankingFeedbackCopy {
  searchFailed: {
    summary: string;
    detail: string;
  };

  targetUnavailable: {
    summary: string;
    detail: string;
  };
}
```

Current PL values:

```json
{
  "searchFailed": {
    "summary": "Nie udało się pobrać rankingu",
    "detail": "Stan rankingu mógł się zmienić. Odśwież stronę i spróbuj ponownie."
  },
  "targetUnavailable": {
    "summary": "Cel niedostępny",
    "detail": "Nie możesz teraz wykonać tej akcji wobec wybranego bohatera."
  }
}
```

Usage:

```ts
copy.feedback.searchFailed.summary
copy.feedback.searchFailed.detail

copy.feedback.targetUnavailable.summary
copy.feedback.targetUnavailable.detail
```

Rules:

* Use `searchFailed` when ranking context load/search fails.
* Use `targetUnavailable` when action execution rejects due to target/action state mismatch.
* Do not expose raw DB errors as player-facing messages.

---

## 14. Copy vs ranking context responsibilities

`get_pvp_ranking_copy(...)` owns:

```text
static labels
headers
descriptions
button labels
tooltips
disabled reason tooltip text
empty-state text
empty display strings
district option labels
```

`get_pvp_ranking_context(...)` or the final technical read model owns:

```text
active hero data
ranking rows
rank positions
district option keys and enabled state
query/applied filters
target data
daily attack limit numbers
attack level range numbers
attack/spy durations
protection display strings
action enabled state
disabled reason keys
pagination
selected target
capabilities
```

Frontend owns only:

```text
rendering
selected row state, if kept client-side
calling copy RPC and context RPC
mapping machine keys to copy
```

Frontend must not own:

```text
player-facing Polish fallback labels
rank calculation
target eligibility
attack level range decisions
disabled reason classification
district labels
action tooltip text
free address rendering in ranking
```

---

## 15. Expected ranking context shape for pairing with copy

This is not returned by the copy RPC. It is included only to show how copy should be consumed.

```ts
interface PvpRankingContext {
  contractVersion: 'pvp_ranking_context_v1';

  activeHero: {
    heroId: string;
    heroName: string;
    addressDisplay: string;
    rankingPosition: number;

    dailyAttackLimitRemaining: number;
    dailyAttackLimitMax: number;

    attackProtectionDisplay: string | null;
    siegeProtectionDisplay: string | null;

    attackMinTargetLevel: number;
    attackMaxTargetLevel: number;
    attackLevelRangeDisplay: string | null;
  };

  filters: {
    appliedDistrictKey: 'A' | 'B' | 'C' | 'D' | 'E' | null;
    query: string | null;
    districtOptions: Array<{
      key: 'A' | 'B' | 'C' | 'D' | 'E';
      enabled: boolean;
    }>;
  };

  ranking: {
    rows: PvpRankingRow[];
    totalCount: number;
    limit: 20;
    offset: number;
    hasNextPage: boolean;
  };

  selectedTarget: PvpRankingSelectedTarget | null;

  capabilities: {
    canSearch: boolean;
    canFilterDistrict: boolean;
    canJumpToMyPosition: boolean;
    canSpy: boolean;
    canAttack: boolean;
    canSiege: false;
  };
}

interface PvpRankingRow {
  rankPosition: number;

  heroId: string;
  heroName: string;
  guildName: string | null;

  level: number;

  addressDisplay: string;
  districtKey: 'A' | 'B' | 'C' | 'D' | 'E';

  attackDurationDisplay: string | null;
  spyDurationDisplay: string | null;

  protectionDisplay: string | null;

  isSelf: boolean;
  isWithinAttackLevelRange: boolean;

  actions: {
    spy: PvpRankingActionState;
    attack: PvpRankingActionState;
    siege: PvpRankingActionState;
  };
}

interface PvpRankingSelectedTarget extends PvpRankingRow {}

interface PvpRankingActionState {
  enabled: boolean;
  disabledReasonKey: PvpRankingDisabledReasonKey | null;
}
```

---

## 16. Example mapping

```ts
function mapPvpRankingDistrictOptions(
  context: PvpRankingContext,
  copy: PvpRankingCopy
) {
  return context.filters.districtOptions.map(option => ({
    key: option.key,
    label: copy.filters.districtOptions[option.key],
    enabled: option.enabled,
  }));
}
```

```ts
function getPvpRankingActionTooltip(
  action: 'spy' | 'attack' | 'siege',
  state: PvpRankingActionState,
  copy: PvpRankingCopy
): string {
  if (!state.enabled && state.disabledReasonKey) {
    return copy.disabledReasonTooltips[state.disabledReasonKey];
  }

  return copy.actions[action].tooltip;
}
```

```ts
function getPvpRankingGuildDisplay(
  guildName: string | null,
  copy: PvpRankingCopy
): string {
  return guildName ?? copy.common.emptyValues.noGuild;
}
```

```ts
function getPvpRankingProtectionDisplay(
  protectionDisplay: string | null,
  copy: PvpRankingCopy
): string {
  return protectionDisplay ?? copy.common.emptyValues.noAttackProtection;
}
```

---

## 17. Negative contract checks

Codex must not expect or create these paths:

```ts
copy.common.emptyValues.noRankingPosition
copy.common.emptyValues.freeAddress
copy.table.emptyValues.freeAddress
copy.targetPanel.labels.actions
copy.playerStatus.emptyValues.noRankingPosition
```

Codex must not create local equivalents of:

```text
Brak gildii
Brak danych
Brak aktywnej ochrony
Wolny
Dzielnica A (A)
Dzielnica B (B)
Dzielnica C (C)
Dzielnica D (D)
Dzielnica E (E)
Oblężenia nie są dostępne.
```

Note:

```text
"Wolny" must not appear in ranking. Free addresses belong to Vicinity, not PvP Ranking.
```

---

## 18. Verified smoke expectations

The current DB verification confirmed:

```text
get_pvp_ranking_copy(text) exists
get_pvp_ranking_page_copy(text) does not exist
anon execute = true
authenticated execute = true
pl locale works
en locale works
unsupported locale falls back to en
pl-PL resolves to pl
disabledReasonTooltips has 11 required keys
missing required disabled reason keys = []
no noRankingPosition empty value
no targetPanel labels.actions
no freeAddress label
header intro includes prestige unavailable note
header intro includes Rady Hellady
header intro includes Tronu
```

Codex should implement against this contract, not infer new copy paths.

---

## 19. Implementation boundary for Codex

Codex should:

1. Call `get_pvp_ranking_copy(locale)`.
2. Call the ranking context RPC separately.
3. Render static labels from copy.
4. Render dynamic data from ranking context.
5. Resolve district labels from `copy.filters.districtOptions[option.key]`.
6. Resolve empty display values through `copy.common.emptyValues`.
7. Resolve disabled action tooltips through `copy.disabledReasonTooltips[disabledReasonKey]`.
8. Use `copy.actions.*` for action labels and base tooltips.
9. Treat `rankingPosition`, rank order, attack eligibility and disabled reasons as DB/RPC-owned.
10. Report missing copy keys as a DB/RPC contract issue, not as a reason to add local fallback labels.

Codex must not:

1. Hardcode Polish labels in Angular.
2. Render free addresses in ranking.
3. Calculate ranking positions.
4. Sort ranking rows.
5. Calculate attack level eligibility.
6. Classify disabled reasons locally.
7. Add `noRankingPosition`.
8. Add `targetPanel.labels.actions`.
9. Add a generic local `Wolny` label.
10. Use Vicinity copy for PvP Ranking.
11. Mutate or manually edit generated Supabase database types.
