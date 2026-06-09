# Mythsworn - Exploration Result Context one-ID migration plan

Version: v0.1  
Scope: Exploration result UI, Trial/Encounter combat handoff, completed result reports  
Goal: stop making Angular compose the Exploration result screen from child combat report IDs, parent report IDs, reward IDs, and transient runtime state.

---

## 1. Problem statement

The current frontend flow is report-ID driven. After a minigame/combat completes, Angular often receives a `combat / combat_result` report ID and then tries to discover whether that report is a child of an Exploration Trial or Encounter report.

This creates unstable logic such as:

```text
child combat report -> maybe parent_context_report -> maybe trial/encounter section -> maybe reward read model -> render
```

This is the reason Trial and Encounter regressions alternate. A fix that selects `encounter/encounter_result` can break Trial. A fix that selects Trial can break Encounter. The frontend is starting from the wrong object.

The target model is:

```text
one Exploration result context ID -> source-domain read model -> render sections in declared order
```

Combat/minigame results can exist internally, but they must not be the primary object for Exploration result UI.

---

## 2. Target rule

Frontend has exactly one primary ID for an Exploration result screen:

```ts
explorationResultContextId: string
```

The frontend may receive optional report/link IDs for actions, but it must not need them to compose the screen.

### Hard rule

`combat_result_id`, child `combat` report ID, `reward_grant_id`, parent report ID, and `currentStepResult` are not primary render IDs for completed Exploration result UI.

They may exist internally or as action/link metadata. They do not drive the screen.

---

## 3. Recommended ID model

For the migration, do not rebuild the whole DB model first.

Use a source-domain context ID:

- For minigame-backed Trial/Encounter: `hero_exploration_challenge_attempts.id` can be the first `explorationResultContextId`.
- For non-challenge step results: either use the step/result source ID or introduce a context row/view later.
- If the backend needs a stable uniform table/view, add `hero_exploration_result_contexts` or a read-model view, but the frontend still receives only `explorationResultContextId`.

The key point is not whether the backend has more technical IDs. The key point is that the frontend has one primary source-domain ID.

---

## 4. Target read model

Add one source-domain RPC/read model:

```sql
get_hero_exploration_result_context(
  p_hero_id uuid,
  p_context_id uuid
)
```

It returns one source-domain view model.

Suggested shape:

```ts
interface ExplorationResultContextView {
  contractVersion: 'exploration_result_context_v1';
  contextId: string;
  sourceKind: 'trial' | 'encounter' | 'step_result';
  status: 'pending_minigame' | 'completed';
  resultKind: string | null;

  introNarrativeJson: ExplorationResultNarrativeSnapshotV1 | null;

  minigameJson: {
    key: 'combat';
    combatSectionJson: ReportCombatSection;
  } | null;

  resultNarrativeJson: ExplorationResultNarrativeSnapshotV1 | null;

  actionsJson: {
    directReportId: string | null;
    publicToken: string | null;
  } | null;
}
```

The backend may assemble this from challenge attempts, step results, reports, combat results, rewards, and narrative snapshots. Angular must not do that assembly.

---

## 5. Rendering contract

Every Exploration result context screen renders in this order:

```text
1. introNarrativeJson
2. minigameJson.combatSectionJson via existing CombatStage, if minigame is combat
3. resultNarrativeJson.narrativeRichText
4. resultNarrativeJson.rewardRichText / effectRichText, if present
5. actions
```

No frontend-local fallback copy.

Do not derive player-facing Exploration copy from:

- `combatSectionJson.title`
- `combatSectionJson.narrativeLines`
- `sourceLabel`
- `encounterLabel`
- `trialLabel`
- `Light combat`
- `currentStepResult`
- reward entries
- local Angular strings

---

## 6. RPC split rule

One large RPC is acceptable for MVP.

If payload size becomes a problem, split into 2-3 RPCs, but every RPC must take the same `explorationResultContextId`.

Allowed split:

```sql
get_hero_exploration_result_shell(p_hero_id, p_context_id)
get_hero_exploration_result_minigame(p_hero_id, p_context_id)
get_hero_exploration_result_actions(p_hero_id, p_context_id)
```

Not allowed:

```text
shell by challengeAttemptId
combat by combatResultId
reward by rewardGrantId
report by parentReportId
```

The frontend can call multiple RPCs, but it does not juggle multiple domain IDs.

---

## 7. Migrator tasks

### M0 - Current-flow audit

Confirm and document, for Trial and Encounter combat:

- which source row represents the Exploration event/result;
- which ID should become `explorationResultContextId`;
- how to find intro narrative;
- how to find final result narrative;
- how to find combat stage/log;
- how to find report action links.

Expected MVP answer for minigame-backed Exploration: use `hero_exploration_challenge_attempts.id` as the context ID.

### M1 - Add source-domain context RPC

Create owner-safe RPC:

```sql
get_hero_exploration_result_context(p_hero_id uuid, p_context_id uuid)
```

Requirements:

- Authenticated owner-safe.
- Server/hero scoped.
- Does not require frontend to pass combat report ID, combat result ID, reward grant ID, or parent report ID.
- Returns `introNarrativeJson`, `minigameJson`, `resultNarrativeJson`, and `actionsJson` for one context.
- Does not expose Character Points as player-facing reward copy.

### M2 - Combat-backed Encounter support

For completed Encounter combat context, the RPC must return:

- `sourceKind = 'encounter'`
- `introNarrativeJson.resultKind = 'encounter_combat_handoff'`
- `minigameJson.key = 'combat'`
- `minigameJson.combatSectionJson` present
- `resultNarrativeJson.resultKind = 'encounter_combat_success'` or `encounter_combat_failure`
- `rewardRichText` / `effectRichText` inside `resultNarrativeJson`, if present

### M3 - Combat-backed Trial support

For completed Trial combat context, the RPC must return:

- `sourceKind = 'trial'`
- Trial manifestation narrative as `introNarrativeJson`
- `minigameJson.key = 'combat'`
- `minigameJson.combatSectionJson` present
- final Trial result narrative as `resultNarrativeJson`
- reward rich text inside `resultNarrativeJson`, if present

### M4 - Minigame completion payload patch

Update Exploration minigame/combat completion payload so the primary UI ID is:

```ts
explorationResultContextId
```

Optional metadata may include:

```ts
childCombatReportId
childCombatResultId
```

But Angular must not treat these as primary render IDs.

### M5 - Transitional resolver, only if needed

If existing routes or reports still hand Angular a legacy ID, add a resolver:

```sql
resolve_exploration_result_context_id(
  p_hero_id uuid,
  p_legacy_id uuid,
  p_legacy_kind text
)
```

It may resolve:

- child combat report ID -> Exploration context ID
- parent Trial/Encounter report ID -> Exploration context ID
- challenge attempt ID -> Exploration context ID

This resolver is transitional. New runtime flow should return `explorationResultContextId` directly.

### M6 - Migrator verification

Run smoke queries for:

1. Pending Encounter combat context.
2. Completed Encounter combat context.
3. Pending Trial combat context.
4. Completed Trial combat context.
5. Existing old child combat report ID resolving to context ID, if transition resolver is added.

Verification must prove that the source-domain context payload alone is enough to render:

```text
intro narrative -> CombatStage -> final result narrative -> reward/effect -> actions
```

No frontend local copy required.

---

## 8. Codex tasks

### C0 - Do not expand current hotfix architecture

Do not add more child-report/parent-report routing rules except to keep the current app working until the context RPC exists.

The current child combat report -> parent report redirect is transitional, not target architecture.

### C1 - Add domain models

Add frontend models under `core/domain/exploration/...`, for example:

```ts
ExplorationResultContextView
ExplorationResultContextMinigame
ExplorationResultContextActions
```

Rules:

- Use DB/RPC names where possible.
- Do not invent player-facing copy.
- Do not edit generated Supabase types. If generated RPC types are missing, report a handoff/blocker.

### C2 - Add service

Add service, for example:

```ts
ExplorationResultContextService
```

Method:

```ts
load(heroId: string, contextId: string): Observable<ExplorationResultContextView>
```

This calls `get_hero_exploration_result_context`.

### C3 - Replace minigame report pointer as primary UI state

Replace `ExplorationMinigameReportPointer` as the primary render pointer with:

```ts
ExplorationResultContextPointer
```

Shape:

```ts
interface ExplorationResultContextPointer {
  heroId: string;
  difficultyKey: string;
  explorationId: string;
  explorationResultContextId: string;
  minigameKey: string | null;
}
```

Optional legacy metadata may exist during migration, but must not drive rendering:

```ts
legacyReportId?: string;
childCombatReportId?: string;
```

### C4 - Update minigame completion handling

When `MinigameCompletionEvent` returns `explorationResultContextId`, store that ID.

Do not use `MinigameCompletionEvent.reportId` / child combat report ID as the primary result screen ID.

During migration only, if backend still returns old report ID, call the transition resolver once and then switch to `explorationResultContextId`.

### C5 - Add dedicated renderer

Add `ExplorationResultContextReport` or equivalent.

Render order:

```text
introNarrativeJson
minigameJson.combatSectionJson via CombatStage
resultNarrativeJson.narrativeRichText
resultNarrativeJson.rewardRichText / effectRichText
report actions
```

Reuse:

- existing `app-rich-text`
- existing `CombatStage`
- existing `ResultOutcomeStrip`, if applicable
- existing report actions component, if compatible

Do not use old preview mappers to compose Exploration copy from generic report sections.

### C6 - First frontend migration slice

Switch only completed Exploration combat Encounter to the new context service.

Acceptance:

- Runtime completion receives/stores `explorationResultContextId`.
- UI loads context by `explorationResultContextId`.
- UI renders handoff narrative -> CombatStage -> final Encounter result narrative.
- No child combat report redirect needed for this flow.

### C7 - Second frontend migration slice

Switch completed Trial combat to the same context service.

Acceptance:

- Trial manifestation narrative -> CombatStage -> final Trial result narrative + reward.
- Same renderer, same context ID model.
- No Trial-specific special route unless the DB payload says sourceKind is Trial.

### C8 - Third frontend migration slice

Switch non-combat Exploration result types where DB/RPC payload is ready:

- resource encounters
- effect encounters
- Trial no manifestation
- Trial auto resolve
- no-event / nothing results, if applicable

### C9 - Remove transitional hacks

Only after Encounter and Trial combat pass through context service:

Remove or stop using:

- child combat report -> parent report redirect in `ReportDetailPreviewCard`
- `relatedReportsJson` as Exploration result routing logic
- `domainContextJson.combat.parentReportId` as UI routing logic
- reward read model as completed result copy source
- `currentStepResult` for completed report detail
- local fallback copy

---

## 9. Safety sequencing

### Safe order

1. Keep current hotfix only as a temporary stabilizer.
2. Migrator adds context RPC and completion payload field.
3. Codex adds models/service/renderer without switching all flows.
4. Switch completed Encounter combat first.
5. Switch completed Trial combat second.
6. Remove child-report redirects after both pass.
7. Expand to other Exploration results.
8. Later adapt Reports Center/detail surfaces to context-aware rendering.

### Do not do

- Do not rewrite all Reports Center rendering first.
- Do not delete existing game reports or child combat reports.
- Do not make combat report self-standing as an Exploration UI screen.
- Do not add more Angular fallback strings.
- Do not make Angular inspect many IDs to reconstruct the screen.

---

## 10. Acceptance for the one-ID migration

The migration is accepted only when all of these are true:

1. Completed Encounter combat UI starts from `explorationResultContextId`.
2. Completed Trial combat UI starts from `explorationResultContextId`.
3. The same renderer handles both.
4. Angular does not need child combat report ID to render Exploration copy.
5. Angular does not need parent report ID to render Exploration copy.
6. Angular does not need reward grant ID to render reward copy.
7. `currentStepResult` is not used for completed report detail.
8. Combat/minigame is rendered as a section inside Exploration context.
9. Player-facing copy comes from DB/RPC narrative snapshots/rich text.
10. Existing full report links/actions still work as links, not render sources.

---

## 11. Temporary state policy

The current child combat report -> parent context report redirect may remain temporarily only as a compatibility bridge.

It must be documented as transitional and removed once `explorationResultContextId` is used by runtime completion and report detail surfaces.

If this redirect keeps causing Trial/Encounter ping-pong regressions, stop expanding it and prioritize the context RPC migration.

---

## 12. Short instruction for Migrator

```text
Build the canonical Exploration result context read model.

Frontend needs one primary ID: explorationResultContextId.
For minigame-backed Trial/Encounter, use challengeAttemptId as the MVP context ID unless a dedicated context table/view is required.

Add get_hero_exploration_result_context(hero_id, context_id), returning intro narrative, optional combat minigame section, final result narrative, reward/effect rich text, and actions.

Patch minigame completion to return explorationResultContextId as primary UI ID. Child combat report IDs may remain optional link/debug metadata, but must not be required for UI rendering.
```

---

## 13. Short instruction for Codex

```text
Prepare Angular to render Exploration result screens from explorationResultContextId.

Add domain model + service + dedicated renderer.
Do not use child combat report ID, parent report ID, reward grant ID, currentStepResult, or local copy to compose completed Exploration result UI.

Switch completed Encounter combat first, then Trial combat.
Keep existing child->parent report redirect only as a temporary compatibility bridge until both flows use explorationResultContextId.
```
