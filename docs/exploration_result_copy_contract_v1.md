# Mythsworn Exploration - Result Copy and Report Snapshot Contract v1

Status: **DB/RPC migration applied, frontend contract pending Reviewer/Codex handoff**  
Scope: **Exploration result copy v1 + Exploration-owned report section snapshots + reward/effect rich text v1**  
Out of scope: Exploration Page Copy RPC, Exploration Mechanics Copy RPC, Exploration Sandbox Copy RPC, Combat renderer internals, item detail/popover read model, Reports Center list RPC, combat encounter parent report creation.

## 0. Reviewer handoff summary

Exploration result rendering must be owned by the Exploration source-domain renderer. Reports Detail remains a thin shell and must not invent or repair Exploration copy.

Frontend should render Exploration results from these DB-owned fields:

1. `trialSectionJson.resultNarrativeJson` for Trial reports.
2. `encounterSectionJson.resultNarrativeJson` for Encounter reports.
3. `rewardSectionJson.rewardRichTextJson` only as a DB-owned reward rich-text snapshot, not as reconstructed local reward text.
4. `effectSectionJson.effectRichTextJson` only as a DB-owned effect rich-text snapshot, not as raw effect labels.
5. `combatSectionJson` only through the existing Combat renderer when combat details are shown.

The primary player-facing Exploration narrative is `resultNarrativeJson`. Combat details, reward details, effects, and report shell actions may be displayed around it according to UI layout decisions, but they must not replace it.

The migration added:

- `exploration_trial_patron_forms`
- `exploration_result_copy_variants`
- `get_player_exploration_result_copy(p_locale text default 'pl') returns jsonb`
- `build_exploration_result_narrative_json(...) returns jsonb`
- `build_exploration_reward_rich_text_json(p_reward_section_json jsonb) returns jsonb`
- `build_exploration_effect_rich_text_json(p_effect_section_json jsonb) returns jsonb`
- `resultNarrativeJson` added to Trial/Encounter report sections
- `rewardRichTextJson` added to Reward report sections
- `effectRichTextJson` added to Effect report sections

`get_player_exploration_result_copy(...)` is a copy/debug/contract RPC. Frontend may use it to inspect available copy, but report/result rendering must prefer the actual source-domain snapshots returned in report/result payloads.

## 1. Hard rules for Codex / Frontend

- Do not translate, rewrite, repair, or concatenate Exploration result narrative locally in Angular.
- Do not render the primary Exploration result from `combatSectionJson.title`, `combatSectionJson.summary`, or `combatSectionJson.narrativeLines`.
- Do not use generic report headings such as `Co się stało`, generic `Efekt`, or generic `Nagroda` as the primary result narrative.
- Do not render `rewardSectionJson.entries` directly as the player-facing reward sentence.
- Do not show `character_points` in the player-facing Exploration reward sentence. Character Points may exist in reward entries as technical/progression data, but they are intentionally excluded from `rewardRichTextJson`.
- Do not apply local colors to XP/resources/items. Use the `tone` supplied by rich text fragments.
- In this contract, `tone: 'heading'` means the frontend must render the fragment using the heading color and bold/emphasized weight.
- Do not invent local Polish fallback copy for missing `resultNarrativeJson`, `rewardRichTextJson`, or `effectRichTextJson`. Missing fields are DB/RPC blockers or follow-ups.
- Do not call internal helper functions from frontend. Use report detail RPCs and the returned report snapshot.
- Do not direct-read Exploration tables from Angular.
- Do not use Reports copy to patch or replace Exploration domain content.
- Do not create a second Combat renderer inside the Exploration/Reports renderer. Pass `combatSectionJson` to the existing Combat renderer when combat details are shown.
- Do not display public-redacted source IDs as missing data. Public redaction is intentional.
- Do not infer reward punctuation, item separators, or Polish pluralization on the frontend. Backend rich text owns this.
- If `itemRef` cannot be rendered with the accepted shared item reference/popover behavior, report a frontend/domain renderer blocker or follow-up rather than replacing it with ad hoc local item UI.

## 2. RPC inventory and grants

| RPC / helper | Return | Frontend call? | Purpose |
|---|---|---:|---|
| `get_player_exploration_result_copy(p_locale text default 'pl')` | `jsonb` | Yes | Copy/debug/contract payload for Exploration result copy v1. |
| `get_report_detail(p_hero_id uuid, p_report_id uuid)` | `jsonb` | Yes | Private report detail. Source-domain Exploration content is under `report.*SectionJson`. |
| `get_public_report_detail(p_public_token text)` | `jsonb` | Yes | Public report detail. Must render from returned report snapshot only. |
| `build_exploration_result_narrative_json(...)` | `jsonb` | No | Internal/source-domain helper used by report section builders. |
| `build_exploration_reward_rich_text_json(...)` | `jsonb` | No | Internal/source-domain helper for reward rich text. |
| `build_exploration_effect_rich_text_json(...)` | `jsonb` | No | Internal/source-domain helper for effect rich text. |
| `build_game_report_trial_section_json(...)` | `jsonb` | No | Report snapshot builder, consumed through report detail RPCs. |
| `build_game_report_encounter_section_json(...)` | `jsonb` | No | Report snapshot builder, consumed through report detail RPCs. |
| `build_game_report_reward_section_json(...)` | `jsonb` | No | Report snapshot builder, consumed through report detail RPCs. |
| `build_game_report_effect_section_json(...)` | `jsonb` | No | Report snapshot builder, consumed through report detail RPCs. |

Frontend must not call the `build_*` helpers directly even if database grants technically permit execution. They are not the frontend contract surface.

## 3. `get_player_exploration_result_copy(...)`

### Signature

```sql
get_player_exploration_result_copy(
  p_locale text default 'pl'
) returns jsonb
```

### Top-level return

```ts
interface ExplorationResultCopyV1 {
  contractVersion: 'exploration_result_copy_v1';
  locale: 'pl' | string;

  resultShell: ExplorationResultShellCopy;
  toneVocabulary: ExplorationRichTextTone[];

  richTextContractVersion: 'exploration_rich_text_v1';
  narrativeSnapshotContractVersion: 'exploration_result_narrative_snapshot_v1';

  variants: ExplorationResultCopyVariant[];
  trialPatronForms: ExplorationTrialPatronForm[];
}
```

### Result shell copy

```ts
interface ExplorationResultShellCopy {
  eyebrow: 'Raport eksploracji' | string;
}
```

Usage:

- `resultShell.eyebrow` is the source-domain eyebrow for Exploration result surfaces.
- Reports shell may have its own header/actions, but Exploration source content should use the Exploration eyebrow from the snapshot or this copy payload.

### Tone vocabulary

```ts
type ExplorationRichTextTone =
  | 'heading'
  | 'info'
  | 'warn'
  | 'success'
  | 'danger';
```

Rendering policy:

- `heading` = heading color + bold/emphasized weight.
- `info` = informational tone.
- `warn` = warning tone.
- `success` = success tone.
- `danger` = danger/error/failure tone.
- Do not use unapproved flavor tones such as `divine`.
- Reward fragments for XP/resources/items use `heading`, not `success`.

## 4. Exploration result copy variant

Located in `payload.variants[]` from `get_player_exploration_result_copy(...)`.

```ts
interface ExplorationResultCopyVariant {
  copyKey: ExplorationResultCopyKey;
  resultKind: ExplorationResultKind;

  title: string;
  titleTone: ExplorationRichTextTone;

  narrativeTemplate: string;

  eligibilityJson: ExplorationCopyEligibilityJson;
  metadataJson: ExplorationCopyMetadataJson;
}
```

### Copy keys

```ts
type ExplorationResultCopyKey =
  | 'trial.manifested.common_opening.v1'
  | 'trial.manifested.ares.v1'
  | 'trial.manifested.hera.v1'
  | 'trial.manifested.aphrodite.v1'
  | 'trial.manifested.apollo.v1'
  | 'trial.manifested.artemis.v1'
  | 'trial.manifested.athena.v1'
  | 'trial.manifested.zeus.v1'
  | 'trial.manifested.hephaestus.v1'
  | 'trial.manifested.hermes.v1'
  | 'trial.not_manifested.default.v1'
  | 'trial.resolved_success.default.v1'
  | 'trial.resolved_failure.default.v1'
  | `step.no_event.${string}.v1`
  | `encounter.resources.${string}.v1`
  | `encounter.buff.${string}.v1`
  | `encounter.debuff.${string}.v1`
  | `encounter.combat_handoff.${string}.v1`
  | `encounter.combat_success.${string}.v1`
  | `encounter.combat_failure.${string}.v1`
  | string;
```

Known seeded copy groups:

| Group | Count |
|---|---:|
| `trial_manifested_common_opening` | 1 |
| `trial_manifested` | 9 |
| `trial_not_manifested` | 1 |
| `trial_resolved_success` | 1 |
| `trial_resolved_failure` | 1 |
| `step_no_event` | 10 |
| `encounter_resources` | 8 |
| `encounter_buff` | 8 |
| `encounter_debuff` | 8 |
| `encounter_combat_handoff` | 6 |
| `encounter_combat_success` | 6 |
| `encounter_combat_failure` | 6 |

### Result kinds

```ts
type ExplorationResultKind =
  | 'trial_manifested_common_opening'
  | 'trial_manifested'
  | 'trial_not_manifested'
  | 'trial_resolved_success'
  | 'trial_resolved_failure'
  | 'step_no_event'
  | 'encounter_resources'
  | 'encounter_buff'
  | 'encounter_debuff'
  | 'encounter_combat_handoff'
  | 'encounter_combat_success'
  | 'encounter_combat_failure';
```

Not valid in v1 unless explicitly reintroduced later:

```ts
type InvalidExplorationResultKind =
  | 'trial_resolved_partial'
  | 'trial_resolved_timeout'
  | 'trial_resolved_abandoned';
```

### Eligibility JSON

```ts
interface ExplorationCopyEligibilityJson {
  rewardEligibility?: 'workforce' | 'not_workforce' | 'any';
  [key: string]: unknown;
}
```

Current use:

- `encounter.resources.*` variants may use `rewardEligibility`.
- `workforce` variants are for workforce rewards only.
- `not_workforce` variants are for drachma/materials/non-workforce rewards.

Frontend must not evaluate this to pick random variants for report detail. The DB helper already selects a variant and exposes it as `selectedCopyKey` inside `resultNarrativeJson`.

### Metadata JSON

```ts
interface ExplorationCopyMetadataJson {
  patronKey?: ExplorationPatronKey;
  [key: string]: unknown;
}
```

Current use:

- `trial.manifested.*` variants may include `patronKey`.
- Frontend should treat this as diagnostic/copy metadata, not display content.

## 5. Trial patron forms

Located in `payload.trialPatronForms[]` from `get_player_exploration_result_copy(...)`.

```ts
interface ExplorationTrialPatronForm {
  trialKey: string;
  patronKey: ExplorationPatronKey;
  patronLabel: string;

  trialTitle: string;
  trialTitleDative: string;

  acceptedOfferingVerbPast: string;
  rejectedOfferingVerbPast: string;
  laughVerbPast: string;
  failureWordDefault: string;

  manualTrialKey: string | null;
}
```

```ts
type ExplorationPatronKey =
  | 'ares'
  | 'hera'
  | 'aphrodite'
  | 'apollo'
  | 'artemis'
  | 'athena'
  | 'zeus'
  | 'hephaestus'
  | 'hermes';
```

Usage:

- Forms are DB-owned grammar/copy data.
- Frontend must not derive Polish grammar from `patronKey` or `trialKey`.
- Frontend must not transform `Próba Aresa` into stat-based titles like `Próba Siły`.
- Trial titles are patron-based.

Known form examples:

```ts
{
  trialKey: 'strength_trial',
  patronKey: 'ares',
  patronLabel: 'Ares',
  trialTitle: 'Próba Aresa',
  trialTitleDative: 'Próbie Aresa',
  acceptedOfferingVerbPast: 'przyjął',
  rejectedOfferingVerbPast: 'odrzucił',
  laughVerbPast: 'śmiał się',
  failureWordDefault: 'klęski',
  manualTrialKey: 'combat'
}
```

## 6. Exploration rich text v1

Used in:

- `resultNarrativeJson.narrativeRichText`
- `resultNarrativeJson.rewardRichText`
- `resultNarrativeJson.effectRichText`
- `rewardSectionJson.rewardRichTextJson.inlineRichText`
- `rewardSectionJson.rewardRichTextJson.sentenceRichText`
- `effectSectionJson.effectRichTextJson.inlineRichText`

### Rich text envelope

```ts
interface ExplorationRewardRichTextJsonV1 {
  contractVersion: 'exploration_rich_text_v1';

  inlinePlainText: string | null;
  inlineRichText: ExplorationRichTextFragment[];

  sentencePlainText: string | null;
  sentenceRichText: ExplorationRichTextFragment[];
}
```

```ts
interface ExplorationEffectRichTextJsonV1 {
  contractVersion: 'exploration_rich_text_v1';

  inlinePlainText: string | null;
  inlineRichText: ExplorationRichTextFragment[];
}
```

### Rich text fragment

```ts
interface ExplorationRichTextFragment {
  kind: ExplorationRichTextFragmentKind;
  text: string;

  tone?: ExplorationRichTextTone;
  token?: string;

  value?: number;
  displayValue?: string;

  resourceKey?: ExplorationResourceKey | string;
  statKey?: string;
  effectKey?: string;
  effectKind?: 'buff' | 'debuff' | string;

  itemId?: string;
  itemName?: string;
  itemPublicToken?: string | null;

  metadata?: Record<string, unknown>;
}
```

```ts
type ExplorationRichTextFragmentKind =
  | 'text'
  | 'patronRef'
  | 'trialTitleRef'
  | 'experience'
  | 'resource'
  | 'itemRef'
  | 'effect'
  | 'stat'
  | 'value';
```

```ts
type ExplorationResourceKey =
  | 'drachma'
  | 'materials'
  | 'workforce';
```

### Fragment rendering rules

- Render fragments in array order exactly.
- `kind='text'` is literal text. It includes punctuation, spaces, commas, periods and conjunctions.
- `kind='experience'` is player-facing XP text. Render with supplied `tone`.
- `kind='resource'` is player-facing resource text. Render with supplied `tone`.
- `kind='itemRef'` is a generated/referenced item. Render with supplied `tone` and the accepted item reference/popover behavior using `itemId`/`itemName` where available.
- `kind='effect'` is a player-facing effect fragment. Render with supplied `tone`.
- `kind='patronRef'` and `kind='trialTitleRef'` are emphasized references. Render with supplied `tone`.
- Do not add punctuation around fragments.
- Do not insert additional line breaks inside the reward sentence.
- Do not convert rich fragments into markdown strings.
- Do not infer local labels from `resourceKey`, `effectKey`, `statKey`, or `itemId`.

### Reward fragment policy

Player-facing reward rich text includes only:

```ts
type PlayerFacingExplorationRewardEntryKind =
  | 'experience'
  | 'resource'
  | 'item_generation';
```

Excluded from player-facing Exploration reward sentence:

```ts
type ExcludedExplorationRewardEntryKind =
  | 'character_points'
  | 'exploration_effect'
  | string;
```

Rules:

- `character_points` must not be shown in player-facing Exploration reward sentences.
- `experience`, `resource`, and `itemRef` fragments must use `tone: 'heading'`.
- `tone: 'heading'` means heading color + bold/emphasis.
- `resourceKey='workforce'` must render as `{amount} siły roboczej`, for example `3 siły roboczej`.
- `resourceKey='materials'` renders with Polish plural forms such as `1 materiał`, `2 materiały`, `5 materiałów`.
- `resourceKey='drachma'` renders with Polish plural forms such as `1 drachma`, `2 drachmy`, `5 drachm`.
- Multiple rewards are joined backend-side with `, ` and ` i ` before the final item.
- Examples:
  - `Zdobywasz: 8 punktów doświadczenia i Gemma Sowy.`
  - `Zdobywasz: 31 materiałów.`
  - `Zdobywasz: 3 siły roboczej.`
  - `Zdobywasz: 8 punktów doświadczenia, Przedmiot A, Przedmiot B i Przedmiot C.`

### Effect fragment policy

- Effects use `effectRichTextJson`, not raw `effects[].displayValue` when displaying the player-facing summary.
- Buff fragments usually use `tone: 'success'`.
- Debuff fragments usually use `tone: 'danger'`.
- Example buff: `+10% do szansy krytycznej`.
- Example debuff: `-10 do Wytrzymałości`.
- Do not display English/raw labels such as `Critical Chance +10%` if `effectRichTextJson` is present.

## 7. Exploration result narrative snapshot v1

Located at:

- `report.trialSectionJson.resultNarrativeJson`
- `report.encounterSectionJson.resultNarrativeJson`

```ts
interface ExplorationResultNarrativeSnapshotV1 {
  contractVersion: 'exploration_result_narrative_snapshot_v1';
  locale: 'pl' | string;

  selectedCopyKey: ExplorationResultCopyKey;

  sourceKind: ExplorationResultSourceKind;
  resultKind: ExplorationResultKind;

  eyebrow: 'Raport eksploracji' | string;

  title: string;
  titleTone: ExplorationRichTextTone;

  narrativePlainText: string;
  narrativeRichText: ExplorationRichTextFragment[];

  rewardPlainText?: string | null;
  rewardRichText?: ExplorationRichTextFragment[] | null;

  effectPlainText?: string | null;
  effectRichText?: ExplorationRichTextFragment[] | null;

  metadata: ExplorationResultNarrativeMetadata;
}
```

```ts
type ExplorationResultSourceKind =
  | 'step'
  | 'trial'
  | 'encounter';
```

### Narrative metadata

```ts
interface ExplorationResultNarrativeMetadata {
  trialKey?: string | null;
  patronKey?: ExplorationPatronKey | string | null;

  encounterKey?: string | null;
  encounterKind?: ExplorationEncounterKind | string | null;

  rewardEligibility?: 'workforce' | 'not_workforce' | 'any' | null;

  completionMode?: 'manual' | 'auto' | 'admin_forced' | string | null;
  success?: boolean | null;

  // Redacted in public reports.
  sourceId?: string | null;
}
```

```ts
type ExplorationEncounterKind =
  | 'combat'
  | 'resource'
  | 'buff'
  | 'debuff';
```

Public behavior:

- In public report detail, `metadata.sourceId` must be `null` or absent.
- `selectedCopyKey`, `resultKind`, `title`, `narrativeRichText`, reward/effect rich text may remain public-safe.

Frontend usage:

- This is the primary Exploration result content.
- Render `eyebrow`, `title`, and `narrativeRichText` as the source-domain narrative.
- Do not re-render the same reward sentence separately if it is already included in `narrativeRichText`, unless the UI intentionally has a separate reward detail block and avoids duplicate text.
- Do not replace this with combat summary.

## 8. Trial section snapshot v1

Located at `report.trialSectionJson` when present.

```ts
interface ExplorationTrialSectionSnapshotV1 {
  title: string | null;
  summary: string | null;
  sourceLabel: string | null;

  challengeAttemptId: string | null;
  explorationId: string | null;
  stepId: string | null;
  trialDefinitionId: string | null;

  trialKey: string | null;
  trialLabel: string | null;

  testedStatKey: string | null;
  testedStatLabel: string | null;

  difficultyKey: string | null;
  minigameKey: string | null;

  status: string | null;
  manifestationStatus: 'manifested' | 'failed' | 'succeeded' | string | null;
  trialManifested: boolean | null;

  success: boolean | null;
  completionMode: 'manual' | 'auto' | 'admin_forced' | string | null;

  resultKey: string | null;
  resultKind: string | null;
  resultLabel: string | null;

  outcomeKind: string | null;
  outcomeLabel: string | null;

  score?: number | null;
  performanceRating?: string | null;

  rewardGrantId?: string | null;

  createdAt: string | null;
  completedAt: string | null;

  narrativeLines: string[];
  descriptionLines: string[];

  resultNarrativeJson?: ExplorationResultNarrativeSnapshotV1 | null;
}
```

Usage:

- `resultNarrativeJson` is the player-facing Trial result narrative.
- Existing `title`, `summary`, `narrativeLines`, `descriptionLines` may remain for legacy/debug/backward compatibility. New UI should not use them as primary content when `resultNarrativeJson` is present.
- `testedStatLabel` is mechanical detail only. It must not replace patron-based Trial title.

Known Trial result mapping:

| Snapshot condition | Expected `resultNarrativeJson.resultKind` |
|---|---|
| `manifestationStatus='failed'` or `trialManifested=false` | `trial_not_manifested` |
| `success=true` | `trial_resolved_success` |
| `success=false` | `trial_resolved_failure` |
| manifested but unresolved | `trial_manifested` |

## 9. Encounter section snapshot v1

Located at `report.encounterSectionJson` when present.

```ts
interface ExplorationEncounterSectionSnapshotV1 {
  title: string | null;
  summary: string | null;
  sourceLabel: string | null;

  stepId: string | null;
  explorationId: string | null;
  encounterDefinitionId: string | null;

  encounterKey: string | null;
  encounterLabel: string | null;
  encounterKind: ExplorationEncounterKind | string | null;

  difficultyKey: string | null;

  status: string | null;
  outcomeKind: string | null;
  outcomeLabel: string | null;

  success?: boolean | null;

  rewardGrantId: string | null;
  resolvedAt: string | null;

  narrativeLines: string[];
  descriptionLines: string[];

  resultNarrativeJson?: ExplorationResultNarrativeSnapshotV1 | null;
}
```

Usage:

- `resultNarrativeJson` is the player-facing Encounter result narrative.
- Existing `title`, `summary`, `narrativeLines`, `descriptionLines` are not the primary content when `resultNarrativeJson` is present.
- For resource encounters, `resultNarrativeJson.narrativeRichText` includes the resource reward inline.
- For buff/debuff encounters, `resultNarrativeJson.narrativeRichText` includes the effect rich text inline.

Known Encounter result mapping:

| Snapshot condition | Expected `resultNarrativeJson.resultKind` |
|---|---|
| `encounterKind='resource'` | `encounter_resources` |
| `encounterKind='buff'` | `encounter_buff` |
| `encounterKind='debuff'` | `encounter_debuff` |
| `encounterKind='combat'` and `success=true` | `encounter_combat_success` |
| `encounterKind='combat'` and `success=false` | `encounter_combat_failure` |
| `encounterKind='combat'` and `success=null` | `encounter_combat_handoff` |

Current limitation:

- Combat encounter parent reports are not fully solved in this slice. Parent/context reports for combat encounters are a separate DB/RPC follow-up.

## 10. Reward section snapshot v1 extension

Located at `report.rewardSectionJson` when present.

```ts
interface ExplorationRewardSectionSnapshotV1 {
  title: string | null;
  summary: string | null;
  reason: string | null;
  status: string | null;

  sourceKind: string | null;
  sourceId: string | null;
  sourceLabel: string | null;

  hasReward: boolean;
  entryCount: number;
  grantedAt: string | null;

  rewardGrantId: string | null;
  rewardProfileId: string | null;

  narrativeLines: string[];
  entries: ExplorationRewardEntrySnapshot[];

  rewardRichTextJson?: ExplorationRewardRichTextJsonV1;
}
```

### Reward entry snapshot

```ts
interface ExplorationRewardEntrySnapshot {
  entryId?: string;

  entryKind:
    | 'experience'
    | 'character_points'
    | 'resource'
    | 'item_generation'
    | 'exploration_effect'
    | string;

  entryLabel: string;

  amount?: number;
  amountDisplay?: string;
  displayValue?: string;
  playerSummary?: string;
  summary?: string;

  sourceKind?: string;
  sourceId?: string;

  rewardGrantId?: string;
  createdAt?: string;

  metadata?: Record<string, unknown>;

  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;

  resourceType?: ExplorationResourceKey | string;

  itemId?: string;
  itemDisplayName?: string;

  effectDefinitionId?: string;
  effectKey?: string;
  effectKind?: 'buff' | 'debuff' | string;
  effectLabel?: string;
  effectDisplay?: Record<string, unknown>;
}
```

Usage:

- New UI should render the player-facing reward sentence from `rewardRichTextJson`, not from `entries`.
- `entries` remain available as structured snapshot data for domain/shared renderers, debugging, and future detail components.
- Reports UI must not build a local reward adapter from `entries`.
- `character_points` entries may be present, but must not be displayed as player-facing Exploration reward text.

## 11. Effect section snapshot v1 extension

Located at `report.effectSectionJson` when present.

```ts
interface ExplorationEffectSectionSnapshotV1 {
  title: string | null;
  summary: string | null;
  sourceLabel: string | null;

  hasEffects: boolean;

  narrativeLines: string[];

  effects: ExplorationEffectEntrySnapshot[];
  rewardEffectEntries: ExplorationEffectEntrySnapshot[];

  effectRichTextJson?: ExplorationEffectRichTextJsonV1;
}
```

### Effect entry snapshot

```ts
interface ExplorationEffectEntrySnapshot {
  title?: string;
  summary?: string;
  status?: string;
  statusLabel?: string;

  effectId?: string;
  effectDefinitionId?: string;

  isActive?: boolean;

  appliedAt?: string;
  consumedAt?: string | null;
  consumedByKind?: string | null;
  consumedById?: string | null;

  effectKey?: string;
  effect_key?: string;

  effectKind?: 'buff' | 'debuff' | string;
  effect_kind?: 'buff' | 'debuff' | string;

  effectLabel?: string;
  effect_label?: string;

  effectTargetKey?: string;
  effect_target_key?: string;
  effectTargetLabel?: string;
  effect_target_label?: string;

  bonusTypeKey?: 'flat' | 'percent' | string;
  bonus_type_key?: 'flat' | 'percent' | string;

  defaultValue?: number;
  default_value?: number;

  displayValue?: string;
  display_value?: string;
  valueDisplay?: string;
  value_display?: string;

  playerSummary?: string;
  player_summary?: string;

  narrativeLines?: string[];
  narrative_lines?: string[];

  descriptionLines?: string[];
  description_lines?: string[];

  metadata?: Record<string, unknown>;
}
```

Usage:

- New UI should render player-facing effect summary from `effectRichTextJson`, not raw `effects[].displayValue`.
- Raw `effects` and `rewardEffectEntries` may contain legacy/English labels and are not the primary copy source.

## 12. Combat section usage in Exploration reports

Located at `report.combatSectionJson` when present.

This contract does not redefine the full Combat section shape. Combat rendering remains Combat-domain owned.

Exploration renderer rules:

- It may pass `combatSectionJson` to the existing Combat renderer.
- It must not use `combatSectionJson.title` as the primary Exploration result title.
- It must not use `combatSectionJson.narrativeLines` as the primary Exploration narrative.
- It must display the relevant Exploration `resultNarrativeJson` when available.
- If a Trial or Encounter result includes combat, the Exploration result still starts from Trial/Encounter source context, not from generic combat outcome labels.

## 13. Report Detail integration

This contract extends the report content snapshot described by Reports Detail Domain Context Contract v1.

Relevant `ReportContentSnapshotV1` fields:

```ts
interface ReportContentSnapshotV1 {
  trialSectionJson: ExplorationTrialSectionSnapshotV1 | null;
  encounterSectionJson: ExplorationEncounterSectionSnapshotV1 | null;
  combatSectionJson: CombatSectionSnapshot | null;
  rewardSectionJson: ExplorationRewardSectionSnapshotV1 | null;
  effectSectionJson: ExplorationEffectSectionSnapshotV1 | null;
}
```

Private report behavior:

- `get_report_detail(...)` may expose source IDs through `domainContextJson` and section metadata.
- Frontend still should render the returned snapshot by default.
- Private source-domain reads may be used only through owner-safe/domain RPCs when explicitly required by a source-domain renderer.

Public report behavior:

- `get_public_report_detail(...)` returns public-safe report snapshot.
- Public `resultNarrativeJson.metadata.sourceId` must be null or absent.
- Public renderer must not call private source-domain RPCs.
- Public renderer must render from returned report snapshot.

## 14. Rendering decision tree

Given a report detail payload:

```ts
const report = payload.report;
```

### Exploration Trial report

Use when:

```ts
report.trialSectionJson?.resultNarrativeJson != null
```

Render:

1. Reports shell/header/actions from Reports copy.
2. Exploration source content from `report.trialSectionJson.resultNarrativeJson`.
3. Optional combat details through Combat renderer if `report.combatSectionJson` exists.
4. Optional structured reward/effect detail only from `rewardRichTextJson` / `effectRichTextJson`, avoiding duplicated text already present in narrative.

Do not render:

- Generic Participants section.
- Generic Items section.
- Generic Rewards section built from `entries`.
- Generic Effects section built from raw `effects`.
- Local heading `Co się stało`.

### Exploration Encounter report

Use when:

```ts
report.encounterSectionJson?.resultNarrativeJson != null
```

Render:

1. Reports shell/header/actions from Reports copy.
2. Exploration source content from `report.encounterSectionJson.resultNarrativeJson`.
3. Optional combat details through Combat renderer if `report.combatSectionJson` exists.
4. Optional structured reward/effect detail only from `rewardRichTextJson` / `effectRichTextJson`, avoiding duplicated text already present in narrative.

Do not render:

- Legacy encounter `title`/`summary` as primary content when `resultNarrativeJson` exists.
- Local reconstruction of resource/effect rewards.

## 15. No-event results

`step_no_event` variants are part of `get_player_exploration_result_copy(...)`.

Current known policy:

- No-event steps do not currently create Reports Center rows.
- No-event copy is intended for the Exploration result surface, not necessarily Reports Detail.
- If a future DB/RPC payload exposes a no-event result snapshot, it should use `resultKind='step_no_event'` and the same `ExplorationResultNarrativeSnapshotV1` shape.

Frontend must not create no-event report rows locally.

## 16. Current verification coverage

Verified after migration and cleanup:

- `exploration_trial_patron_forms` has 10 rows.
- `exploration_result_copy_variants` has 65 rows.
- Variant coverage exists for all v1 result kinds.
- Forbidden typography check found no en dash/em dash in templates.
- `get_player_exploration_result_copy('pl')` returns `exploration_result_copy_v1`.
- Trial reports expose `resultNarrativeJson` with `exploration_result_narrative_snapshot_v1`.
- Encounter reports expose `resultNarrativeJson` with `exploration_result_narrative_snapshot_v1`.
- Public report detail returns redacted source IDs and snapshot rendering mode.
- Reward rich text excludes `character_points`.
- Reward fragments for `experience`, `resource`, and `itemRef` use `tone: 'heading'`.
- Workforce reward rich text renders as `{amount} siły roboczej`.
- Effect rich text renders Polish player-facing fragments such as `+10% do szansy krytycznej` and `-10 do Wytrzymałości`.

Still requires representative data/smoke when available:

- Exploration combat encounter parent/context report rows.
- Encounter combat success/failure reports after the parent report follow-up.
- Multiple item reward in one Trial reward grant.
- Public report with multiple item refs.
- Future no-event result snapshot if no-event reports/results become report-visible.

## 17. Data-blocked / follow-up policy

- If a branch lacks representative data, mark it `data-blocked`; do not remove fields from frontend types.
- Do not infer combat encounter parent behavior from Trial combat reports.
- Do not infer multi-item rendering from single-item smoke; the contract still requires correct rendering of multiple `itemRef` fragments.
- If `resultNarrativeJson` is missing for an Exploration report with Trial/Encounter context, report a DB/RPC blocker.
- If `rewardRichTextJson` is missing but reward section has reward entries, report a DB/RPC blocker.
- If `effectRichTextJson` is missing but effect section has effects, report a DB/RPC blocker.

## 18. Codex implementation boundary

Codex should:

- Consume `get_player_exploration_result_copy(...)` for copy/debug/contract needs only.
- Render Exploration report primary content from `resultNarrativeJson`.
- Render rich text fragments in order.
- Apply `tone: 'heading'` as heading color + bold/emphasis.
- Render `itemRef` with the accepted shared item reference/popover behavior.
- Use `rewardRichTextJson` and `effectRichTextJson` when showing reward/effect details.
- Pass `combatSectionJson` to the existing Combat renderer only when combat details are required.
- Keep Reports shell separate from Exploration source content.
- Treat missing source-domain snapshots as DB/RPC blockers, not local fallback opportunities.

Codex should not:

- Edit generated Supabase types.
- Regenerate generated Supabase types.
- Direct-read source tables.
- Call internal helper RPCs/builders.
- Render `character_points` in Exploration reward sentences.
- Add local Polish fallback copy.
- Translate raw effect/resource/item labels in Angular.
- Build reward sentences from `rewardSectionJson.entries`.
- Build effect display from raw `effectSectionJson.effects` when `effectRichTextJson` exists.
- Use `combatSectionJson.title` as the Exploration result title.
- Create a generic report-section renderer for Exploration.

## 19. Frontend minimal accepted rendering example

Given:

```json
{
  "contractVersion": "exploration_result_narrative_snapshot_v1",
  "eyebrow": "Raport eksploracji",
  "title": "Próba zakończona sukcesem",
  "titleTone": "success",
  "narrativeRichText": [
    { "kind": "text", "text": "Stawiłeś czoło " },
    { "kind": "trialTitleRef", "text": "Próbie Hefajstosa", "tone": "heading" },
    { "kind": "text", "text": ". Bogowie z uznaniem spojrzeli na twój pokaz męstwa i sprawności oraz obdarzyli cię swoją łaską. Zdobywasz: " },
    { "kind": "experience", "text": "8 punktów doświadczenia", "tone": "heading", "value": 8 },
    { "kind": "text", "text": " i " },
    { "kind": "itemRef", "text": "Gemma Sowy", "tone": "heading", "itemId": "...", "itemName": "Gemma Sowy" },
    { "kind": "text", "text": "." }
  ]
}
```

Frontend may visually render this as:

```text
Raport eksploracji
Próba zakończona sukcesem

Stawiłeś czoło Próbie Hefajstosa. Bogowie z uznaniem spojrzeli na twój pokaz męstwa i sprawności oraz obdarzyli cię swoją łaską. Zdobywasz: 8 punktów doświadczenia i Gemma Sowy.
```

The fragments `Próbie Hefajstosa`, `8 punktów doświadczenia`, and `Gemma Sowy` must use heading emphasis. `Gemma Sowy` must be treated as an item reference when item rendering support exists.

## 20. Cleanup candidates

- Legacy/generic report titles and summaries such as `Trial report: ...`, `Encounter report: ...`, and generic technical summary text remain cleanup candidates in source producers.
- Legacy `narrativeLines` in Trial/Encounter/Reward/Effect sections remain backward-compatible data but should not be primary UI content for new Exploration renderers.
- Combat encounter parent reports are a separate follow-up.
- Raw English effect labels remain cleanup candidates in effect display definitions/read models. `effectRichTextJson` currently shields the primary summary from those raw labels.

