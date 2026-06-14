# Mythsworn - PvP Combat Copy + Context Frontend Contract v2.1

Status: active after full DB/RPC gate  
Audience: Codex / Reviewer / Migrator  
Scope: `get_player_combat_common_copy`, `get_pvp_combat_copy`, live PvP `pvpCombatContext`, private/public report `pvpCombatContext`  
Out of scope: final PvP result summary, report shell copy, Reports Center list/preview

---

## 1. Core decision

PvP combat presentation has two layers:

```text
combat.common
pvp.combat
```

`combat.common` owns shared live combat UI copy:

- meter;
- timing action;
- empty log fallback;
- participant loading/unavailable placeholders;
- workflow/finalization states.

`pvp.combat` owns PvP-specific combat presentation and combat context effects:

- PvP live/manual source presentation;
- attacker Barracks Health context;
- defender Fortress Health context;
- blessing;
- curse.

Final PvP result is not owned here. It is owned by `pvp.result`.

---

## 2. RPC inventory

### 2.1 Shared combat copy

```sql
get_player_combat_common_copy(p_locale text default 'pl') returns jsonb
```

Contract identity:

```ts
contractKey: 'combat_common_copy'
contractVersion: 'combat_common_copy_v1'
gameCopyKind: 'player.combat.common'
```

Frontend use:

```text
CombatHost / MinigameHost shared live combat UI
```

### 2.2 PvP combat copy

```sql
get_pvp_combat_copy(p_locale text default 'pl') returns jsonb
```

Contract identity:

```ts
contractKey: 'pvp_combat_copy'
contractVersion: 'pvp_combat_copy_v2'
```

Current v2 rules:

- no `report` key;
- no player-facing effect title keys;
- effect templates retain `summaryRichTextTemplate`;
- frontend must not call `get_pvp_combat_copy_legacy_v1`.

### 2.3 Live PvP combat state

```sql
get_combat_live_state(p_session_id uuid, p_since_event_index integer default null)
```

For PvP live sessions, the wrapper adds:

```text
current_timing_manifest_json.pvpCombatContext
participants_json[].participantEffects
```

The live context is DB-composed by:

```sql
build_pvp_combat_context_from_live_session(p_session_id uuid)
```

Frontend calls only `get_combat_live_state`, not the internal builder.

### 2.4 Completed PvP report context

Completed PvP attack results store:

```text
pvp_attack_results.report_context_json.pvpCombatContext
```

Frontend must not direct-read this table.

Private/public report detail wrappers expose this through:

```text
get_report_detail(...).domainContextJson.pvpCombatContext
get_public_report_detail(...).domainContextJson.pvpCombatContext
```

---

## 3. CombatSourcePresentation composition

For PvP live/manual combat, use:

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

Do not use Exploration runtime copy for PvP.

Do not replace the pre-combat manual/auto decision screen from `pvp.action.combatHandoff`.

---

## 4. `PvpCombatContextPresentation`

Located at:

```text
current_timing_manifest_json.pvpCombatContext
domainContextJson.pvpCombatContext
```

Shape:

```ts
export interface PvpCombatContextPresentation {
  contractKey: 'pvp_combat_context_presentation';
  contractVersion: 'pvp_combat_context_presentation_v1';
  sourceOwner: 'pvp.combat';
  publicSafe: true;
  emptyLabel: string;
  participantEffects: PvpCombatParticipantEffect[];
  participants: PvpCombatParticipantContext[];
}

export interface PvpCombatParticipantContext {
  participantRole: 'attacker' | 'defender';
  displayName: string;
  participantEffects: PvpCombatParticipantEffect[];
}

export interface PvpCombatParticipantEffect {
  key:
    | 'attacker_barracks_health'
    | 'defender_fortress_health'
    | 'blessing'
    | 'curse';

  sourceKey:
    | 'barracks'
    | 'fortress'
    | 'blessing'
    | 'curse';

  participantRole: 'attacker' | 'defender';
  heroName: string;
  valueDisplay: string;

  summaryPlain: string;
  summaryRichText: RichTextFragment[];

  tone: 'info' | 'success' | 'danger';
  sortOrder: number;
}

export interface RichTextFragment {
  kind: 'text' | 'value';
  text: string;
  tone?: 'heading' | 'info' | 'warn' | 'success' | 'danger';
}
```

Public-safe means:

- no UUIDs;
- no raw metadata;
- no formula/debug source rows;
- no internal source table references;
- display names and display-ready values are allowed.

---

## 5. Participant effects

### 5.1 Rendering rule

Frontend renders only:

```text
summaryRichText
```

Do not render separate titles for effects.

Forbidden as separate visible effect titles:

```text
Koszary napastnika
Forteca obrońcy
Błogosławieństwo
Klątwa
```

The word `klątwa` is valid inside the accepted curse sentence and must not be treated as a title leak.

### 5.2 `attacker_barracks_health`

Meaning:

```text
attacker receives PvP Health bonus from Barracks
```

Example plain:

```text
Dzięki treningowi w Koszarach na poziomie {buildingLevel}, {heroName} ma zwiększone Zdrowie o {valueDisplay}.
```

Tone rules:

| Fragment | Tone |
|---|---|
| `Koszarach` | `heading` |
| `{buildingLevel}` | `heading` |
| `{heroName}` | `heading` |
| `Zdrowie` | `heading` |
| `{valueDisplay}` | `heading` |

No separate title.

### 5.3 `defender_fortress_health`

Meaning:

```text
defender receives PvP Health bonus from Fortress
```

Example plain:

```text
Umocnienia i budowle obronne Fortecy na poziomie {buildingLevel} sprawiają, że {heroName} ma zwiększone Zdrowie o {valueDisplay}.
```

Tone rules:

| Fragment | Tone |
|---|---|
| `Fortecy` | `heading` |
| `{buildingLevel}` | `heading` |
| `{heroName}` | `heading` |
| `Zdrowie` | `heading` |
| `{valueDisplay}` | `heading` |

No separate title.

### 5.4 `blessing`

Meaning:

```text
participant has a consumed/active Exploration buff affecting this PvP combat
```

Plain:

```text
{heroName} znajduje się pod wpływem błogosławieństwa zesłanego przez bogów i otrzymuje {valueDisplay}.
```

Tone rules:

| Fragment | Tone |
|---|---|
| `{heroName}` | `heading` |
| `błogosławieństwa zesłanego przez bogów` | `heading` |
| `{valueDisplay}` | `success` |

No separate title.

### 5.5 `curse`

Meaning:

```text
participant has a consumed/active Exploration debuff affecting this PvP combat
```

Plain:

```text
Nad bohaterem {heroName} ciąży klątwa, która nakłada {valueDisplay}.
```

Tone rules:

| Fragment | Tone |
|---|---|
| `{heroName}` | `heading` |
| `klątwa` | `heading` |
| `{valueDisplay}` | `danger` |

No separate title.

---

## 6. Frontend usage

### 6.1 Live PvP combat

Use:

```text
get_combat_live_state(...).current_timing_manifest_json.pvpCombatContext
```

or participant-local:

```text
get_combat_live_state(...).participants_json[].participantEffects
```

Render `summaryRichText`.

If there are no effects, omit the effect list or render `emptyLabel` according to accepted UI behavior.

### 6.2 Private PvP report detail

Use:

```text
get_report_detail(...).domainContextJson.pvpCombatContext
```

Render `participantEffects[].summaryRichText`.

### 6.3 Public PvP report detail

Use:

```text
get_public_report_detail(...).domainContextJson.pvpCombatContext
```

Render only returned public-safe content. Do not call private domain RPCs.

---

## 7. Codex restrictions

Codex must not:

- compose effect text in Angular;
- substitute `get_pvp_combat_copy` templates in Angular;
- derive effect values from raw metadata/stat deltas/snapshot JSON;
- render `title` for participant effects;
- call internal helper builders;
- direct-read `pvp_attack_results` or `combat_live_participants`;
- add local Polish fallback copy;
- edit generated Supabase types manually.

Codex must:

- use existing rich text renderer;
- treat `summaryPlain` as fallback/diagnostic only when `summaryRichText` exists;
- keep effect rendering separate from final result rendering;
- report data-blocked live smoke only if no live PvP sample exists.

---

## 8. Verified gate

The DB/RPC gate has confirmed:

- function/wrapper inventory exists;
- private report detail exposes `domainContextJson.pvpCombatContext`;
- public report detail exposes public-safe `domainContextJson.pvpCombatContext`;
- stored PvP attack result contexts are valid for 50/50 checked rows;
- no top-level effect titles are present;
- no exact old title fragments are present;
- no UUID-like public leaks were detected;
- live representative gate found a live PvP session with expected effects and rendered effects.
