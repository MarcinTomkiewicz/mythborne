# Mythsworn PvP Prestige Runtime + Report Mapping Contract v1

Status: DB/RPC contract after PvP Prestige target-state migration  
Audience: Codex, Reviewer, Migrator  
Scope: PvP attack Prestige runtime, PvP report Prestige section, PvP report copy mapping, Prestige notifications, frontend mapping boundaries  
Out of scope: Reports Center list rendering, generic Report Detail shell, Combat renderer internals, PvP target selection/ranking UI, admin balancer surfaces, future non-PvP Prestige sources

---

## 0. Handoff summary

PvP is now one source of Prestige changes. PvP does not own the Prestige system.

Prestige as a domain system is still owned by:

- `hero_prestige`
- `hero_prestige_ledger`
- `ranks`
- Prestige public/read-model RPCs
- Prestige requirement/gating RPCs

PvP attack runtime now owns only this consequence:

```text
a resolved PvP attack can add or subtract hidden Prestige points,
write a Prestige ledger event,
update the hero's current Prestige rank,
mirror a player-safe Prestige summary into the PvP report context,
and expose qualitative Chwała/Glory copy through PvP report copy.
```

Frontend must not calculate, estimate, reconstruct, normalize, or locally translate Prestige deltas.

---

## 1. Core decision

### 1.1 PvP Prestige is a runtime consequence, not a frontend calculation

The frontend must not decide:

- how much Prestige changed
- whether the change is positive/negative/neutral
- which qualitative message kind applies
- whether a rank changed
- which rank notification should be created
- whether raw points should be shown
- whether a PvP report should get a Prestige section

DB/RPC owns all of that.

### 1.2 Frontend maps only player-facing read/copy payloads

Frontend may map:

- `get_pvp_report_copy(...).attackReport.glory`
- `get_report_detail(...).domainContextJson.pvp`
- `get_report_detail(...).reportShellContextJson`
- `get_report_detail(...).report.combatSectionJson`
- `get_hero_prestige_public_summary(...)`
- `get_player_dashboard_page_context(...).prestigeSummary`
- DB-owned requirement/read-model rows that already contain Prestige rank labels

Frontend must not map:

- `pvp_attack_results.prestige_context_json`
- raw `pvp_attack_results.report_context_json.prestige` as UI copy
- `hero_prestige.current_points`
- `hero_prestige_ledger.points_delta`
- `hero_prestige_ledger.points_before`
- `hero_prestige_ledger.points_after`
- internal calculator/helper RPCs

### 1.3 Generated types note

Generated Supabase types are required after this migration because functions/tables changed. They will not describe recursive `jsonb` payloads.

This document is the authoritative recursive contract for Codex mapping/review.

---

## 2. RPC inventory

## 2.1 Frontend-allowed RPCs relevant to this contract

### `get_pvp_report_copy(p_locale text default 'pl', p_report_id uuid) returns jsonb`

Grant:

```text
authenticated: allowed
anon: denied
```

Purpose: private, participant-safe, DB-owned copy payload for PvP combat and spy reports.

Frontend uses this for PvP report domain content, especially:

```text
payload.attackReport.glory
```

Do not use this RPC in public report pages.

### `get_report_detail(p_hero_id uuid, p_report_id uuid) returns jsonb`

Grant:

```text
authenticated: allowed
anon: denied
```

Purpose: private report detail shell/domain context.

Frontend uses:

```text
payload.reportShellContextJson
payload.domainContextJson
payload.report
```

Report detail chooses the domain renderer. It does not itself compute PvP Prestige.

### `get_public_report_detail(p_public_token text) returns jsonb`

Grant:

```text
authenticated: allowed
anon: allowed
```

Purpose: public report detail shell/domain snapshot.

Public mode must not call private PvP copy or private source-domain reads.

### `get_hero_prestige_public_summary(p_hero_id uuid)`

Purpose: player-safe visible Prestige rank identity.

Frontend may show:

```text
rank_number
rank_name
player_label
district_code
helper_text
updated_at
```

Frontend must not expect raw points or numeric delta here.

### `get_hero_prestige_requirement_context(p_hero_id uuid)`

Purpose: player-safe current Prestige rank context for requirement/gating display.

### `check_hero_meets_prestige_requirement(p_hero_id uuid, p_required_rank_number integer)`

Purpose: DB-side Prestige requirement evaluation.

Frontend must not duplicate this logic locally.

### `get_player_dashboard_page_context(p_hero_id uuid) returns jsonb`

Purpose: Dashboard page context. If Dashboard displays Prestige, it should use:

```text
payload.prestigeSummary
```

or DB-owned world-state rows, not direct Prestige tables.

## 2.2 Internal-only functions

Codex must not call these from Angular, even if regenerated types list them.

```text
create_pvp_attack_result_from_combat_result
create_pvp_attack_game_report
apply_pvp_attack_result_prestige
build_pvp_prestige_context
build_pvp_report_prestige_section_json
build_pvp_attack_report_context_json
rebuild_pvp_attack_result_report_context
create_prestige_rank_change_notification
calculate_pvp_prestige_delta_pair
calculate_pvp_prestige_level_relation
calculate_pvp_prestige_status_relation
get_pvp_prestige_component_multiplier
get_pvp_prestige_flat_component
get_pvp_prestige_status_component
calculate_pvp_prestige_own_positive_component
calculate_pvp_prestige_own_negative_component
apply_pvp_prestige_positive_pressure
apply_pvp_prestige_negative_pressure
resolve_pvp_prestige_message_kind
```

If Codex finds frontend code calling any of these through `supabase.rpc(...)`, the fix is:

```text
delete the frontend call and use the correct player/read/report RPC
```

not:

```text
regrant the function
add frontend fallback
recreate old helper
map raw table JSON directly
```

---

## 3. Runtime producer chain

Canonical PvP attack flow:

```text
combat_results(source_type = pvp)
  -> create_pvp_attack_result_from_combat_result
  -> pvp_attack_results
  -> apply_pvp_attack_result_prestige
  -> resource / XP consequence producers
  -> create_pvp_attack_game_report
  -> game_reports
  -> pvp_attack_results.report_context_json.prestige
  -> get_pvp_report_copy(...).attackReport.glory
```

Rules:

- `apply_pvp_attack_result_prestige` is internal.
- `create_pvp_attack_game_report` is internal.
- normal-flow insert refresh trigger is removed.
- `rebuild_pvp_attack_result_report_context(...)` exists only as internal/manual repair.
- frontend must not trigger, repeat, or repair this chain.

---

## 4. Report Detail integration

Report Detail remains a thin wrapper.

Private detail:

```text
get_report_detail(p_hero_id, p_report_id)
```

Codex should inspect:

```text
payload.domainContextJson.reportDomainKey
payload.domainContextJson.contentKind
payload.domainContextJson.pvp
payload.reportShellContextJson
payload.report
```

For PvP combat report:

```text
domainContextJson.reportDomainKey = 'pvp'
domainContextJson.contentKind = 'pvp_combat'
domainContextJson.pvp.sourceKind = 'pvp_attack'
domainContextJson.pvp.pvpAttackResultId != null in private mode
domainContextJson.pvp.combatResultId != null
```

Mapping rule:

```text
Report shell/header comes from reportShellContextJson.
Combat log comes from report.combatSectionJson / Combat renderer.
PvP result/resources/XP/Glory copy comes from get_pvp_report_copy(...).
```

Do not use legacy top-level report snapshot fields as shell/header:

```text
payload.report.title
payload.report.summary
payload.report.reportTypeLabel
payload.report.sourceLabel
```

Those may remain historical snapshot data.

---

## 5. Reports Center integration

Reports Center is not changed by this Prestige runtime migration.

Reports Center must still use:

```text
get_reports_center_page_context(...)
```

and map:

```text
payload.reports
payload.selectedPreview
row.preview
row.eventType.key
row.marker
```

Reports Center must not call:

```text
get_pvp_report_copy(...)
get_report_detail(...)
private PvP RPCs
pvp_attack_results
hero_prestige_ledger
```

to build the list or right preview.

If a row is `pvp_combat`, Reports Center may show only lightweight preview fields returned by Reports Center page context.

Full PvP Prestige/Glory mapping belongs to report detail / PvP report renderer.

---

## 6. PvP report copy contract

Location:

```text
get_pvp_report_copy(p_locale, p_report_id)
```

Current contract:

```ts
interface PvpReportCopyV1 {
  contractKey: 'pvp_report_copy';
  contractVersion: 'pvp_report_copy_v1';

  requestedLocale: string;
  locale: 'pl' | 'en' | string;
  fallbackLocale: 'en';

  visibility: 'private';
  reportId: string;
  publicToken: string | null;

  reportKind: 'attack' | 'spy' | string;

  access: PvpReportCopyAccessV1;

  shell: PvpReportCopyShellV1;
  sections: PvpReportCopySectionsV1;

  attackReport: PvpAttackReportCopyV1 | null;
  spyReport: PvpSpyReportCopyV1 | null;
}
```

### 6.1 Access

```ts
interface PvpReportCopyAccessV1 {
  heroId: string;
  accessRole: 'owner' | 'participant' | 'viewer' | string;
  viewerRole:
    | 'attacker'
    | 'defender'
    | 'spy_owner'
    | 'target'
    | 'viewer'
    | string;
}
```

Rules:

- `viewerRole` controls which player-safe Glory/Prestige message is selected.
- Frontend must not recompute viewerRole.
- Frontend must not compare hero IDs manually to decide attacker/defender copy.

### 6.2 Shell

```ts
interface PvpReportCopyShellV1 {
  eyebrow: string;
  sourceLabel: string;
  eventTypeLabel: string;
  title: string;
  summary: string | null;
}
```

Usage:

- In a dedicated PvP report renderer, this can be used as domain header/narrative.
- In generic Report Detail shell, top shell still comes from `reportShellContextJson`.
- Do not mix `reportShellContextJson.title` and `pvpCopy.shell.title` in the same visual header unless the design explicitly separates shell vs domain narrative.

### 6.3 Sections

```ts
interface PvpReportCopySectionsV1 {
  result: string;
  battleLoot: string;
  resources: string;
  experience: string;
  glory: string;
  combat: string;
}
```

Rules:

- Use these as section headings inside the PvP domain renderer.
- Do not hardcode local Polish labels like `Chwała`, `Zasoby`, `Doświadczenie`.
- Do not add missing section labels in Angular.

### 6.4 Attack report

```ts
interface PvpAttackReportCopyV1 {
  outcomeKey:
    | 'attacker_victory'
    | 'defender_victory'
    | 'draw'
    | string;

  viewerRole:
    | 'attacker'
    | 'defender'
    | 'viewer'
    | string;

  result: PvpAttackResultCopyV1;
  experience: PvpAttackExperienceCopyV1;
  resources: PvpAttackResourcesCopyV1;
  glory: PvpAttackGloryCopyV1 | null;
}
```

### 6.5 Result

```ts
interface PvpAttackResultCopyV1 {
  title: string;
  narrativePlainText: string | null;
}
```

Mapping:

```text
Render title as the PvP result title.
Render narrativePlainText as paragraph/body text.
Do not derive title from outcomeKey.
```

### 6.6 Experience

```ts
interface PvpAttackExperienceCopyV1 {
  rows: PvpAttackExperienceRowV1[];
  lines: PvpAttackExperienceLineV1[];
}

interface PvpAttackExperienceRowV1 {
  [key: string]: unknown;
}

interface PvpAttackExperienceLineV1 {
  key: string;
  recipient: 'viewer' | 'opponent' | string;
  amount: number;
  text: string;
}
```

Mapping:

```text
Prefer lines[].text for player-facing text.
Rows are structured support data and should not be displayed unless a dedicated UI contract says so.
Do not show Character Points as PvP reward text.
```

### 6.7 Resources

```ts
interface PvpAttackResourcesCopyV1 {
  line: string | null;
  gainRows: PvpAttackResourceRowV1[];
  lossRows: PvpAttackResourceRowV1[];
}

interface PvpAttackResourceRowV1 {
  [key: string]: unknown;
}
```

Mapping:

```text
If resources.line is non-empty, render it as the primary resource consequence sentence.
Do not reconstruct resource text from gainRows/lossRows unless a dedicated row UI contract exists.
Do not invent zero-state labels locally.
```

### 6.8 Glory / Chwała

```ts
interface PvpAttackGloryCopyV1 {
  [key: string]: unknown;
}
```

This object is DB-owned display copy for Prestige/Chwała.

Codex may render it only through a narrow adapter with these rules:

```text
If glory is null, do not render Glory section.
If glory has text-like fields, render only DB-provided text.
If glory has title/label fields, render only DB-provided title/label.
Do not derive Glory copy from messageKind locally.
Do not show raw points or numeric delta.
Do not show formula keys.
Do not show rank thresholds.
```

Recommended defensive TypeScript adapter:

```ts
interface PvpGloryDisplayModel {
  title: string | null;
  text: string | null;
  tone: string | null;
  raw: Record<string, unknown>;
}

function toPvpGloryDisplayModel(glory: unknown): PvpGloryDisplayModel | null {
  if (!glory || typeof glory !== 'object' || Array.isArray(glory)) {
    return null;
  }

  const record = glory as Record<string, unknown>;

  return {
    title:
      typeof record['title'] === 'string'
        ? record['title']
        : typeof record['label'] === 'string'
          ? record['label']
          : null,

    text:
      typeof record['text'] === 'string'
        ? record['text']
        : typeof record['summary'] === 'string'
          ? record['summary']
          : typeof record['description'] === 'string'
            ? record['description']
            : null,

    tone:
      typeof record['tone'] === 'string'
        ? record['tone']
        : null,

    raw: record,
  };
}
```

Review rule:

```text
The adapter may read generic display fields from DB-owned glory object.
The adapter must not create new messageKind -> text maps.
```

---

## 7. Canonical report context Prestige section

DB-owned source path:

```text
pvp_attack_results.report_context_json.prestige
```

Frontend should generally not direct-read this path. It exists to feed DB/copy/report builders.

Contract shape:

```ts
interface PvpReportContextPrestigeV1 {
  status: 'applied';
  source: 'build_pvp_report_prestige_section_json' | string;

  playerSafe: PvpReportContextPrestigePlayerSafeV1;

  rawPointsHidden: true;
  numericDeltaHidden: true;
}

interface PvpReportContextPrestigePlayerSafeV1 {
  attacker: PvpPrestigeActorPlayerSafeV1;
  defender: PvpPrestigeActorPlayerSafeV1;

  rawPointsHidden: true;
  numericDeltaHidden: true;
}
```

### 7.1 Actor player-safe shape

```ts
interface PvpPrestigeActorPlayerSafeV1 {
  source: 'hero_prestige_delta' | 'pvp_prestige_delta' | string;

  actorRole: 'attacker' | 'defender';
  heroId: string;
  ledgerId: string;

  sourceKind?: 'pvp_attack_result' | string;
  sourceEntityType?: 'pvp_attack_result' | string;

  messageKind:
    | 'no_change'
    | 'minor_increase'
    | 'significant_increase'
    | 'dramatic_increase'
    | 'minor_decrease'
    | 'significant_decrease'
    | 'dramatic_decrease'
    | string;

  messageDirection:
    | 'none'
    | 'increase'
    | 'decrease'
    | string;

  playerMessage: string | null;

  rankChanged: boolean;
  rankChangeDirection:
    | 'none'
    | 'rank_up'
    | 'rank_down'
    | string;

  rankBefore: PvpPrestigeRankSnapshotV1;
  rankAfter: PvpPrestigeRankSnapshotV1;

  levelRelation?:
    | 'much_lower'
    | 'lower'
    | 'peer'
    | 'higher'
    | 'much_higher'
    | string;

  statusRelation?:
    | 'much_lower_status'
    | 'lower_status'
    | 'same_status'
    | 'higher_status'
    | 'much_higher_status'
    | string;

  combatOutcome?: string;

  rawPointsHidden: true;
  numericDeltaHidden: true;
}

interface PvpPrestigeRankSnapshotV1 {
  rankNumber: number;
  rankName: string;
  districtCode: string;
}
```

Rules:

- This is player-safe, but it is not the preferred frontend copy source.
- Prefer `get_pvp_report_copy(...).attackReport.glory` for displayed Glory text.
- This context may be used by DB/copy builders and diagnostics.
- Frontend must not use `messageKind` to locally translate text.

---

## 8. Internal Prestige context

DB-owned internal path:

```text
pvp_attack_results.prestige_context_json
```

This is not a frontend contract.

It may contain:

```ts
interface PvpPrestigeContextInternalV1 {
  status: 'applied' | 'pending_apply' | string;
  source: 'build_pvp_prestige_context' | string;

  formulaKey: 'pvp_prestige_v1';
  formulaVersion: 'pvp_prestige_v1_2026_06';

  pvpAttackResultId: string;
  pvpActionId: string | null;
  combatResultId: string | null;
  serverId: string;

  combatOutcome: string;
  outcomeKey: string;

  attackerHeroId: string;
  defenderHeroId: string;

  levels: {
    attackerLevel: number | null;
    defenderLevel: number | null;
    levelDifference: number | null;
    levelDifferenceMeaning: 'attacker_level_snapshot - defender_level_snapshot' | string;
  };

  playerSafe: PvpReportContextPrestigePlayerSafeV1;

  adminDebugContext: {
    attacker?: PvpPrestigeAdminDebugActorV1;
    defender?: PvpPrestigeAdminDebugActorV1;
    [key: string]: unknown;
  };

  notificationBoundary: {
    persistentRankChangeNotificationCreatedByLedgerTrigger: true;
    producer: 'after_hero_prestige_ledger_insert_create_rank_notification' | string;
    ordinaryPointDeltaCreatesNotification: false;
    rawPointsHidden: true;
    numericDeltaHidden: true;
  };

  builtAt: string;
}

interface PvpPrestigeAdminDebugActorV1 {
  ledgerId: string;
  heroId: string;

  rawPointsDelta: number;
  pointsBefore: number;
  pointsAfter: number;

  rankNumberBefore: number;
  rankNumberAfter: number;

  adminContext: Record<string, unknown>;
}
```

Frontend rules:

```text
DO NOT map prestige_context_json.
DO NOT show adminDebugContext.
DO NOT show formulaKey/formulaVersion.
DO NOT show rawPointsDelta/pointsBefore/pointsAfter.
DO NOT use this as fallback when report copy is missing.
```

If frontend needs something from this context, that is a DB/read-model gap.

---

## 9. Prestige public summary contract

Source:

```text
get_hero_prestige_public_summary(p_hero_id)
```

Shape:

```ts
interface HeroPrestigePublicSummaryV1 {
  hero_id: string;
  server_id: string;
  rank_uuid: string;
  rank_number: number;
  rank_name: string;
  district_code: string;
  player_label: string | null;
  helper_text: string | null;
  updated_at: string;
}
```

Mapping:

```text
Use player_label if present.
Otherwise use rank_name.
Show district_code only where the UI explicitly has a district/rank context.
Do not show hidden points, thresholds or numeric deltas.
```

Dashboard mapping:

```text
Dashboard should use payload.prestigeSummary from get_player_dashboard_page_context.
If Dashboard calls get_hero_prestige_public_summary directly, it must map only the public summary fields above.
```

---

## 10. Prestige requirement/gating mapping

Prestige gates must be read from DB-owned requirement rows/read models.

Allowed frontend sources:

```text
get_hero_prestige_requirement_context(...)
check_hero_meets_prestige_requirement(...)
building requirement status JSON returned by Estate/Mansion read models
Dashboard/page-context rows returned by DB
```

Frontend must not compare:

```text
hero_prestige.current_rank_number >= required_rank_number
```

locally unless that comparison is already returned by DB as `isMet`, `meetsRequirement`, or equivalent.

Frontend must not hardcode:

```text
Perioecus = 1
Ephor = 2
Strategos = 3
Archon = 4
Basileus = 5
```

for logic. Labels may be shown only if returned by DB/copy.

---

## 11. Rank-change notification contract

Notifications:

```text
prestige.rank_up
prestige.rank_down
```

Trigger rule:

```text
Create persistent notification only when rank_number_before is distinct from rank_number_after.
```

Point-only Prestige changes:

```text
do not create persistent notifications
appear only in the PvP report as qualitative Glory/Chwała copy
```

Copy source:

```text
localized_entity_texts
entity_type = notification_type
entity_key = prestige.rank_up | prestige.rank_down
field_key = title_template | body_template
locale_key = pl
```

Template params:

```text
{oldRankName}
{newRankName}
```

Frontend notification UI maps the created notification as ordinary notification data. It must not infer rank changes from ledger rows.

Forbidden in notification display:

```text
points_delta
points_before
points_after
current_points
numeric delta
rank thresholds
formulaKey
formulaVersion
adminDebugContext
```

---

## 12. Forbidden legacy keys

These must not appear in frontend code, mappers, UI models, templates, tests, or local fallback data:

```text
bridge_gate_mid
bridge_mid_f45_b45_m150
targetBandKey
targetBandLabel
prestige_pvp_delta_matrix
prestige_pvp_target_bands
calculate_pvp_prestige_delta
calculate_pvp_prestige_target_band
get_pvp_prestige_delta_matrix_entry
calculate_pvp_prestige_bridge_gate_mid_pair
get_prestige_bridge_gate_mid_percent_multiplier
calculate_prestige_bridge_gate_mid_own_positive_component
calculate_prestige_bridge_gate_mid_own_negative_component
apply_prestige_bridge_gate_mid_positive_pressure
apply_prestige_bridge_gate_mid_negative_pressure
Y-DB5
```

If Codex finds any of these in frontend, generated types, mappers, fixtures, docs used by runtime, or local UI copy, it must report exact file/path and remove the dependency.

Exception:

```text
historical migration files may contain old names.
runtime frontend code must not.
```

---

## 13. Forbidden player-facing fields

These must not be displayed in player UI:

```text
current_points
points_delta
effective_points_delta
points_before
points_after
rawPointsDelta
rawDelta
numericDelta
prestigePoints
prestige_points_required
next_prestige_points_required
formulaKey
formulaVersion
formulaVariant
adminDebugContext
adminContext
```

Admin/debug pages may display raw values only through an explicit admin/debug contract.

---

## 14. What Codex should map

### 14.1 Private PvP combat report detail

When:

```text
get_report_detail(...).domainContextJson.reportDomainKey = 'pvp'
get_report_detail(...).domainContextJson.contentKind = 'pvp_combat'
```

Codex should:

1. render shell/header from `reportShellContextJson`;
2. call/use existing PvP report copy path if the current PvP report renderer already does so;
3. render:
   - result from `pvpCopy.attackReport.result`;
   - resources from `pvpCopy.attackReport.resources`;
   - experience from `pvpCopy.attackReport.experience`;
   - glory from `pvpCopy.attackReport.glory`;
   - combat through the Combat renderer/snapshot;
4. not parse raw `pvp_attack_results`.

### 14.2 Private PvP spy report detail

When:

```text
domainContextJson.reportDomainKey = 'pvp'
contentKind = 'pvp_spy'
```

Codex should render spy copy from the PvP copy payload or existing spy renderer.

Prestige/Glory section is not part of spy result unless DB copy explicitly returns it.

### 14.3 Public report detail

Public pages must not call private `get_pvp_report_copy`.

Use public detail/report snapshot. If a public PvP copy RPC is already part of the current public report renderer, it may be used only with public token and only if it omits private IDs/raw details.

### 14.4 Reports Center

Do not map PvP Prestige in Reports Center list/preview.

Reports Center preview may show only preview data returned by `get_reports_center_page_context`.

### 14.5 Dashboard

Use `prestigeSummary`.

Do not add a PvP report glory mapper to Dashboard.

### 14.6 Estate/building/district gating

Use DB-owned requirement status/read model rows.

Do not hardcode ranks or thresholds.

---

## 15. Why mapping fails

### Case A - `database.types.ts` compile errors after regen

Likely cause:

```text
frontend references deleted legacy tables/functions
```

Fix:

```text
remove illegal frontend dependency
```

Not allowed:

```text
recreate old DB objects
regrant internal functions
add local compatibility type aliases
```

### Case B - 403/permission denied from Supabase RPC

Likely cause:

```text
frontend calls internal helper whose grant was revoked
```

Fix:

```text
replace call with public/read/action RPC
```

Not allowed:

```text
regrant helper to authenticated
```

### Case C - PvP report opens but Glory missing

Check:

```text
get_pvp_report_copy(...).attackReport.glory
```

If missing/null:

```text
DB/copy contract gap or no Prestige section in source report
```

Do not locally map:

```text
report_context_json.prestige.playerSafe.messageKind -> Polish copy
```

### Case D - PvP report shows raw numbers or formula key

Codex mapper is wrong.

Remove display of:

```text
points_delta
points_before
points_after
formulaKey
formulaVersion
adminDebugContext
```

### Case E - Report Detail shell shows wrong title/summary

Use Report Detail shell contract:

```text
reportShellContextJson for shell/header
source-domain copy for domain body
```

Do not use:

```text
payload.report.title
payload.report.summary
```

as shell/header.

### Case F - Reports Center preview tries to display Glory

Wrong surface.

Reports Center is lightweight archive/preview. Glory belongs to PvP report detail/domain renderer.

---

## 16. Codex preflight checklist

Before editing UI, Codex must grep frontend for:

```text
prestige_pvp_delta_matrix
prestige_pvp_target_bands
calculate_pvp_prestige_delta
calculate_pvp_prestige_target_band
get_pvp_prestige_delta_matrix_entry
calculate_pvp_prestige_bridge_gate_mid_pair
bridge_gate_mid
bridge_mid_f45_b45_m150
targetBandKey
targetBandLabel
Y-DB5
prestige_context_json
report_context_json
apply_pvp_attack_result_prestige
create_pvp_attack_game_report
build_pvp_prestige_context
build_pvp_attack_report_context_json
rebuild_pvp_attack_result_report_context
create_prestige_rank_change_notification
points_delta
points_before
points_after
current_points
rawPointsDelta
adminDebugContext
```

Expected result:

```text
No runtime frontend usage.
Only migration/audit docs may contain old DB names.
```

If any runtime frontend usage exists, Codex must report:

```text
file path
symbol/member/function
why it violates this contract
the public/read/copy RPC that replaces it
```

---

## 17. Codex implementation directives

Codex must:

1. Regenerate/read generated DB types after migration.
2. Run TypeScript build.
3. Treat generated `jsonb` as opaque at type level and use this contract for recursive mapping.
4. Keep PvP Prestige calculation out of Angular.
5. Keep PvP report Glory mapping limited to `get_pvp_report_copy(...).attackReport.glory`.
6. Use DB-provided copy strings.
7. Use Report Detail shell contract for shell/header.
8. Use Combat renderer for combat timeline/snapshot.
9. Use `prestigeSummary` / public Prestige summary for Dashboard and rank displays.
10. Use DB requirement read models for Estate/building/district gating.
11. Report missing DB/copy payloads as blockers instead of inventing local keys.

Codex must not:

1. Call internal PvP Prestige helper RPCs.
2. Direct-read `pvp_attack_results`.
3. Direct-read `hero_prestige_ledger`.
4. Direct-read hidden `hero_prestige.current_points`.
5. Parse `prestige_context_json` for UI.
6. Render `report_context_json.prestige` directly as player copy.
7. Create `messageKind -> Polish text` maps in Angular.
8. Add local fallback copy for Glory/Prestige.
9. Display raw point deltas.
10. Display formula/debug context.
11. Restore target-band or bridge-gate fields.
12. Add compatibility aliases for deleted DB objects.
13. Regrant internal functions to fix frontend errors.
14. Move Prestige notification logic to frontend.
15. Show Character Points as PvP reward text.

---

## 18. Reviewer acceptance checks

A slice is acceptable only if:

```text
tsc/build passes after database.types.ts regeneration
no runtime frontend references deleted legacy DB functions/tables
no frontend calls internal PvP Prestige helpers
no direct pvp_attack_results prestige_context_json mapping
no local Glory/Prestige copy map
PvP report detail renders Glory from DB copy payload
Reports Center does not try to render full Prestige/Glory
Dashboard Prestige still uses public summary/page context
Estate/building Prestige gating still uses DB requirement status/read models
no raw points/deltas/formula keys in player UI
```

Blocker examples:

```text
const label = GLORY_LABELS[messageKind]
const delta = reportContext.prestige.playerSafe.attacker.pointsDelta
supabase.rpc('build_pvp_prestige_context')
supabase.rpc('apply_pvp_attack_result_prestige')
.from('pvp_attack_results').select('prestige_context_json')
if (rankNumber >= 4) allowDistrictD()
```

Acceptable examples:

```text
const pvpCopy = await getPvpReportCopy(locale, reportId)
const glory = toPvpGloryDisplayModel(pvpCopy.attackReport?.glory)
const prestigeSummary = dashboardContext.prestigeSummary
const shell = reportDetail.reportShellContextJson
const eventTypeKey = reportsCenterRow.eventType.key
```

---

## 19. Smoke checklist

After frontend changes or type regeneration:

1. `npm run build` / `npx tsc --noEmit` passes.
2. PvP report detail opens for attacker.
3. PvP report detail opens for defender.
4. PvP report shows Chwała/Glory section when `attackReport.glory` is non-null.
5. Chwała/Glory section does not show raw points or numeric delta.
6. PvP report still shows resources and experience copy.
7. Combat log is still rendered by Combat renderer/snapshot path.
8. Reports Center still lists PvP report rows.
9. Reports Center preview does not call full report detail.
10. Dashboard still shows Prestige rank.
11. Estate/building requirement UI still displays Prestige requirement state if present.
12. Browser/network logs show no 403 caused by frontend calling internal Prestige helpers.

---

## 20. Commit boundary

Frontend commit after this DB migration is allowed only after:

```text
database.types.ts regenerated by user/Migrator
frontend preflight grep clean
build/tsc clean
PvP report smoke clean
no local fallback copy introduced
```

Codex must not manually edit generated DB types.

---

## 21. Short form for code review

Use this when reviewing touched files:

```text
PvP Prestige mapping target:
- UI maps DB/copy/read payloads only.
- PvP report Glory comes from get_pvp_report_copy(...).attackReport.glory.
- Report shell comes from reportShellContextJson.
- Reports Center remains page-context preview only.
- Dashboard/rank displays use public Prestige summary/page context.
- Estate/building gates use DB requirement read models.
- No raw points, deltas, thresholds, formula/debug keys in player UI.
- No internal PvP Prestige RPC calls.
- No direct prestige_context_json/report_context_json parsing for player copy.
- No local messageKind/copy maps.
```
