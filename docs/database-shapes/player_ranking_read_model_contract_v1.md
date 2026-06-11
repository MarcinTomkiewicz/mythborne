# Mythsworn Codex Handoff - PvP Ranking Page Contract

## Scope

Implement frontend page for PvP Ranking using the canonical DB/RPC read model.

This is a frontend integration task. Do not change DB/RPC in Codex unless explicitly instructed by the user.

The ranking page should reuse presentational patterns/components from Vicinity where practical, but it must not reuse Vicinity page-state assumptions that belong to empty-address browsing, relocation, or address slot generation.

## Canonical data RPC

Use:

```ts
get_pvp_ranking_context(
  p_hero_id: string,
  p_query?: string | null,
  p_district_key?: 'A' | 'B' | 'C' | 'D' | 'E' | null,
  p_offset?: number | null,
  p_selected_target_hero_id?: string | null
): PvpRankingContext
```

SQL signature:

```sql
public.get_pvp_ranking_context(
  p_hero_id uuid,
  p_query text default null,
  p_district_key text default null,
  p_offset integer default null,
  p_selected_target_hero_id uuid default null
) returns jsonb
```

Generated Supabase types: regeneration required.

Reason: this task added a new frontend-callable RPC:

```sql
get_pvp_ranking_context(uuid,text,text,integer,uuid)
```

If generated types do not include this RPC, stop and report a generated-types blocker. Do not replace this with direct table reads, local mock data, or a different RPC.

## Auth / grants

The RPC is player/auth-only.

Expected grants:

```text
authenticated: execute
anon: no execute
```

Frontend must call it as the authenticated active player.

## Top-level payload

```ts
interface PvpRankingContext {
  contractVersion: 'pvp_ranking_context_v1';

  activeHero: PvpRankingActiveHero;

  filters: PvpRankingFilters;

  ranking: PvpRankingList;

  selectedTarget: PvpRankingSelectedTarget | null;

  capabilities: PvpRankingCapabilities;
}
```

`contractVersion` is a technical JSON body contract version. Use it for runtime diagnostics only if needed. Do not branch business logic by version unless explicitly instructed.

## activeHero

```ts
interface PvpRankingActiveHero {
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
}
```

### Field semantics

`heroId` - active hero ID.

`heroName` - active hero display name.

`addressDisplay` - DB-formatted active hero address, for example `A-3857`.

`rankingPosition` - active hero global rank position in the full ranking, starting from `1`.

`dailyAttackLimitRemaining` - number of PvP attacks remaining today.

`dailyAttackLimitMax` - daily PvP attack cap.

`attackProtectionDisplay` - DB-provided display string for active hero attack protection, or `null` when no active protection exists.

`null` must be rendered with copy fallback from copy RPC, not with local Polish text.

`siegeProtectionDisplay` - DB-provided display string for siege protection, currently `null` because siege is not available.

`attackMinTargetLevel` - minimum target level the active hero can attack.

`attackMaxTargetLevel` - maximum target level the active hero can attack.

`attackLevelRangeDisplay` - compact DB display for the level range, for example `1-17`. This is not a sentence. Copy/labels remain owned by copy RPC.

## filters

```ts
interface PvpRankingFilters {
  appliedDistrictKey: PvpDistrictKey | null;
  query: string | null;

  districtOptions: PvpRankingDistrictOption[];
}

type PvpDistrictKey = 'A' | 'B' | 'C' | 'D' | 'E';

interface PvpRankingDistrictOption {
  key: PvpDistrictKey;
  enabled: boolean;
}
```

### Field semantics

`appliedDistrictKey` - currently applied district filter, or `null`.

`query` - currently applied search query, or `null`.

`districtOptions[]` - DB-owned list of available district filter options.

Labels are not returned here. Use copy RPC:

```ts
copy.filters.districtOptions[option.key]
```

Do not hardcode district labels in Angular.

## ranking

```ts
interface PvpRankingList {
  rows: PvpRankingRow[];

  totalCount: number;
  limit: 20;
  offset: number;
  hasNextPage: boolean;
}
```

### Field semantics

`rows` - current page rows.

`totalCount` - total number of rows matching the current `query` and `district` filter.

`limit` - always `20`.

Do not pass page size from frontend. The DB owns page size for this page.

`offset` - zero-based offset applied by DB.

`hasNextPage` - whether another page exists after the current page.

There is no `hasPreviousPage` key. Frontend may enable the previous-page control when:

```ts
context.ranking.offset > 0
```

That is pagination UI behavior, not gameplay logic.

## Default page / "my position" behavior

Initial page load and "Moja pozycja" should call:

```ts
get_pvp_ranking_context(heroId, null, null, null, null)
```

Meaning:

```text
p_query = null
p_district_key = null
p_offset = null
p_selected_target_hero_id = null
```

When `p_offset = null`, `p_query = null`, and `p_district_key = null`, DB opens the page containing the active hero.

Examples:

```text
rankingPosition = 3  -> offset = 0
rankingPosition = 30 -> offset = 20
rankingPosition = 41 -> offset = 40
```

When a query or district filter is active and `p_offset = null`, DB returns `offset = 0`.

When user navigates next/previous pages, call with explicit offset:

```ts
nextOffset = context.ranking.offset + context.ranking.limit
previousOffset = Math.max(context.ranking.offset - context.ranking.limit, 0)
```

Do not use arbitrary page sizes.

## Search behavior

The DB handles search.

`p_query` may search by:

```text
hero name
formatted address
address without dash
```

Frontend must not locally filter rows after RPC return, except for purely visual selection state.

When search form is submitted:

```ts
get_pvp_ranking_context(heroId, query, currentDistrictOrNull, 0, selectedTargetIdOrNull)
```

If search input is cleared, pass `null`, not empty string. DB normalizes empty/blank strings to null, but frontend should still send null for clarity.

## District filtering

When district filter changes:

```ts
get_pvp_ranking_context(heroId, queryOrNull, districtKeyOrNull, 0, selectedTargetIdOrNull)
```

Allowed district keys:

```ts
'A' | 'B' | 'C' | 'D' | 'E'
```

Do not pass district labels.

## Ranking order

Ranking order is fully DB-owned.

Current sort:

```text
level DESC
districtRank DESC       // E > D > C > B > A
addressNumber ASC
heroName ASC
heroId ASC
```

Frontend must not sort ranking rows.

Frontend must not use address number or hidden local fields to sort. The RPC does not return `addressNumber`.

## PvpRankingRow

```ts
interface PvpRankingRow {
  rankPosition: number;

  heroId: string;
  heroName: string;
  guildName: string | null;

  level: number;

  addressDisplay: string;
  districtKey: PvpDistrictKey;

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
```

### Field semantics

`rankPosition` - global rank position, starting from `1`.

This remains the global rank position even when filters/search are applied. It is not recomputed as “position within filtered result”.

`heroId` - target/row hero ID.

`heroName` - target/row hero display name.

`guildName` - guild name or `null`.

Use copy fallback for null guild, not local Polish text.

`level` - target/row hero level.

`addressDisplay` - DB-formatted address.

`districtKey` - district key.

`attackDurationDisplay` - DB-formatted attack travel time display, or `null`.

`spyDurationDisplay` - DB-formatted spy travel time display, or `null`.

`protectionDisplay` - DB-formatted protection display for target, or `null`.

`isSelf` - true for the active hero row.

When `isSelf = true`, attack and spy actions are disabled with `self_target`.

`isWithinAttackLevelRange` - DB-owned boolean derived from active hero target level bounds.

Frontend must not compute this using `level`, `attackMinTargetLevel`, or `attackMaxTargetLevel`.

## PvpRankingActionState

```ts
interface PvpRankingActionState {
  enabled: boolean;
  disabledReasonKey: PvpRankingDisabledReasonKey | null;
}
```

### Rules

If `enabled = true`, `disabledReasonKey` should be `null`.

If `enabled = false`, use `disabledReasonKey` to look up tooltip/copy.

Frontend must not infer disabled reason from row fields.

## Disabled reason key union

The copy contract must cover the full union below.

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
```

### Reason semantics

`no_target` - copy/UI key for target panel when no target is selected. DB row actions should normally not emit this because every row is a target.

`self_target` - row is the active hero.

`daily_attack_limit_reached` - active hero has no remaining daily attacks.

`attack_protection_active` - target has active attack protection.

`target_level_too_high` - target level is above active hero allowed attack range.

`target_level_too_low` - target level is below active hero allowed attack range.

`spy_unavailable` - fallback reason for spy not available.

`attack_unavailable` - fallback reason for attack not available.

`siege_unavailable` - reserved copy coverage for siege unavailable.

`siege_not_available` - current normal siege disabled reason. Siege is not available in this page.

`cooldown_active` - active hero has a blocking PvP activity/cooldown.

### Current observed reasons in verification

Current verified sample produced:

```text
self_target
siege_not_available
```

That is expected for small test data where all non-self targets are attackable and no protection/cooldown blocks are active.

## selectedTarget

```ts
type PvpRankingSelectedTarget = PvpRankingRow;
```

Top-level field:

```ts
selectedTarget: PvpRankingSelectedTarget | null;
```

### Behavior

When `p_selected_target_hero_id = null`, `selectedTarget = null`.

When `p_selected_target_hero_id` points to a ranked hero, DB returns the same row shape as `ranking.rows[]`, even if that hero is not on the current page.

When selected target ID is not found in ranking base, `selectedTarget = null`.

Frontend should use `selectedTarget` for the right-side target panel.

Do not reconstruct selected target from cached rows if DB returned `selectedTarget`.

## capabilities

```ts
interface PvpRankingCapabilities {
  canSearch: boolean;
  canFilterDistrict: boolean;
  canJumpToMyPosition: boolean;
  canSpy: boolean;
  canAttack: boolean;
  canSiege: false;
}
```

### Field semantics

`canSearch` - whether search UI is supported.

`canFilterDistrict` - whether district filter UI is supported.

`canJumpToMyPosition` - whether the active hero has a ranking position and the "my position" action can be shown/enabled.

`canSpy` - coarse page-level capability. Row-level `actions.spy.enabled` is still authoritative for each row.

`canAttack` - coarse page-level capability. Row-level `actions.attack.enabled` is still authoritative for each row.

`canSiege` - currently false. Siege actions are not available.

Frontend must not enable a row action from capabilities alone. Use row action state.

## Copy RPC alignment

Expected copy RPC name:

```sql
get_pvp_ranking_copy(p_locale text default 'pl') returns jsonb
```

Do not rename the copy RPC in frontend.

Data RPC returns machine data and fallback display strings.

Copy RPC owns:

```text
page title/intro
player status labels
table column labels
district labels
empty values
target panel labels
action labels/tooltips
disabled reason tooltips
feedback messages
```

Do not add Polish labels locally in Angular.

## Copy lookup paths

The data contract expects the copy contract to cover:

```ts
copy.common.emptyValues.noAttackProtection
copy.common.emptyValues.noData
copy.common.emptyValues.noGuild
copy.common.emptyValues.noValue

copy.playerStatus.labels.dailyAttackLimit
copy.playerStatus.labels.rankingPosition
copy.playerStatus.labels.attackProtection
copy.playerStatus.labels.siegeProtection

copy.filters.districtOptions.A
copy.filters.districtOptions.B
copy.filters.districtOptions.C
copy.filters.districtOptions.D
copy.filters.districtOptions.E

copy.table.columns.rankPosition
copy.table.columns.hero
copy.table.columns.level
copy.table.columns.address
copy.table.columns.attackDuration
copy.table.columns.spyDuration
copy.table.columns.actions

copy.targetPanel.labels.target
copy.targetPanel.labels.guild
copy.targetPanel.labels.address
copy.targetPanel.labels.attackDuration
copy.targetPanel.labels.spyDuration
copy.targetPanel.labels.protection

copy.actions.spy.label
copy.actions.spy.tooltip
copy.actions.attack.label
copy.actions.attack.tooltip
copy.actions.siege.label
copy.actions.siege.tooltip
copy.actions.siege.disabledTooltip

copy.disabledReasonTooltips[reasonKey]
```

## Empty value rendering

Use copy empty values for nulls.

Recommended rendering:

```ts
guildName === null -> copy.common.emptyValues.noGuild

attackProtectionDisplay === null -> copy.common.emptyValues.noAttackProtection

siegeProtectionDisplay === null -> copy.common.emptyValues.noData

protectionDisplay === null -> copy.common.emptyValues.noAttackProtection

attackDurationDisplay === null -> copy.common.emptyValues.noValue

spyDurationDisplay === null -> copy.common.emptyValues.noValue
```

Do not hardcode `-`, `Brak danych`, `Brak gildii`, or `Brak aktywnej ochrony` in Angular.

## Action execution

This read model only provides action availability.

Do not create new action RPCs for this task.

Use the existing PvP action flow already used by Vicinity for spy/attack where applicable.

Row buttons should use:

```ts
row.actions.spy.enabled
row.actions.attack.enabled
row.actions.siege.enabled
```

Disabled tooltips should use:

```ts
copy.disabledReasonTooltips[row.actions.<action>.disabledReasonKey]
```

For siege, the current row state is:

```ts
enabled: false
disabledReasonKey: 'siege_not_available'
```

Do not implement siege behavior in this task.

## Frontend state flow

### Initial load

```ts
context = get_pvp_ranking_context(activeHeroId, null, null, null, null)
```

DB returns the page containing active hero.

### Search submit

```ts
context = get_pvp_ranking_context(
  activeHeroId,
  queryOrNull,
  currentDistrictKeyOrNull,
  0,
  selectedTargetHeroIdOrNull
)
```

### District filter change

```ts
context = get_pvp_ranking_context(
  activeHeroId,
  currentQueryOrNull,
  selectedDistrictKeyOrNull,
  0,
  selectedTargetHeroIdOrNull
)
```

### Next page

```ts
context = get_pvp_ranking_context(
  activeHeroId,
  currentQueryOrNull,
  currentDistrictKeyOrNull,
  context.ranking.offset + context.ranking.limit,
  selectedTargetHeroIdOrNull
)
```

### Previous page

```ts
context = get_pvp_ranking_context(
  activeHeroId,
  currentQueryOrNull,
  currentDistrictKeyOrNull,
  Math.max(context.ranking.offset - context.ranking.limit, 0),
  selectedTargetHeroIdOrNull
)
```

### Jump to my position

```ts
context = get_pvp_ranking_context(activeHeroId, null, null, null, selectedTargetHeroIdOrNull)
```

This should clear search and district filters in UI.

### Select row for target panel

```ts
context = get_pvp_ranking_context(
  activeHeroId,
  currentQueryOrNull,
  currentDistrictKeyOrNull,
  currentOffset,
  row.heroId
)
```

DB returns `selectedTarget`.

Frontend may optimistically display the clicked row while loading, but canonical target panel state comes from `selectedTarget`.

## Reuse from Vicinity

Reuse UI shell and visual row/action patterns from Vicinity where useful.

Do not reuse Vicinity-specific concepts that do not exist in ranking:

```text
empty address slots
relocation
address capacity slot generation
free address cards
neighborhood range browsing
```

Ranking shows heroes only.

It does not show free addresses.

## Hard non-goals

Do not add these fields to frontend model:

```text
addressNumber
isTargetable
rankingScore
sortOptions
prestige
canSort
```

Do not add frontend sort controls.

Do not add prestige UI or prestige placeholder behavior.

Do not compute ranking position in Angular.

Do not compute whether a target is in attack range in Angular.

Do not compute whether a target can be attacked in Angular.

Do not infer disabled reason from level, address, protection, daily limits, or cooldown.

Do not direct-read Supabase tables.

Do not call `get_pvp_target_candidates(...)` from Angular for this page. Ranking uses `get_pvp_ranking_context(...)`.

Do not add local Polish fallback labels.

Do not hide rows client-side after DB returns them, except for purely visual UI concerns not affecting data semantics.

## Accepted verification result

The expected DB verification result is:

```text
PVP_RANKING_CONTEXT_OK
```

The verified sample had:

```text
rpc_exists = true
authenticated_can_execute = true
anon_can_execute = false
ranking.limit = 20
ranking.offset = 0
activeHero.rankingPosition = 1
ranking.rows.length = 8
selectedTarget populated when selected target id exists
disabledReasonKeysSeen = ['self_target', 'siege_not_available']
badDisabledReasonKeys = []
```

## Blockers Codex must report

Report a blocker if any of these occur:

1. Generated Supabase types do not include:

```ts
get_pvp_ranking_context
```

2. `get_pvp_ranking_context(...)` returns a payload without:

```ts
contractVersion
activeHero
filters
ranking
selectedTarget
capabilities
```

3. `ranking.rows[]` lacks any required row keys.

4. `actions.*.disabledReasonKey` contains a key missing from copy.

5. The copy RPC does not include the full disabled reason union.

6. Frontend code would need to compute ranking, attack eligibility, level range, or disabled reason locally.

7. Existing Vicinity component cannot be reused without importing Vicinity-only concepts into Ranking. In that case create a Ranking-specific adapter/presenter rather than contaminating the data contract.

## Final implementation target

The final frontend page should be able to render from only:

```ts
PvpRankingContext
PvpRankingCopy
```

and existing PvP action execution RPCs.

No other data source should be required for the Ranking screen.
