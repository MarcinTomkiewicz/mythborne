# Text Utility Semantics And `muted-text` Cleanup Guide

Status: UI-CORE-8 draft for review  
Scope: documentation only; no Angular, SCSS, DB/RPC or generated-type changes

This document defines when text utilities such as `muted-text`, `error-text`, `success-text`, `info-text`, `warn-text` and `arcane-text` are acceptable. The goal is to keep useful text utilities while preventing important decisions, reasons, outcomes and status states from being visually demoted.

Use with:

- `docs/ui-ux/mythsworn-style-contract.md`;
- `docs/ui-ux/local-scss-budget-checklist.md`;
- `docs/ui-ux/shared-surface-patterns.md`;
- `docs/ui-ux/legacy-mg-scss-modernization-plan.md`.

## Current Sources

| source | current role | status |
|---|---|---|
| `src/scss/utilities/_status-text.scss` | Emits `error-text`, `success-text`, `info-text`, `warn-text`, `muted-text`, `arcane-text`. | Keep, but use semantically. |
| `src/scss/layouts/_components.scss` | Defines `.mg-section__subtitle` as muted supporting copy. | Keep. |
| `src/scss/base/_typography.scss` | Defines `.heading-color` for emphasis/headings. | Keep, but do not use it as a generic warning/error substitute. |
| `.tag-badge--*` variants | Semantic compact state/status display. | Prefer for status, reason and workflow state. |
| Future `mg-status-pill`, `mg-note-panel` | Planned UI-CORE-4/9 patterns. | Use when available instead of ad hoc status text. |

## Use / Do Not Use Matrix

| utility | use for | do not use for | preferred alternative when blocked |
|---|---|---|---|
| `muted-text` | Field labels, secondary metadata, timestamps, helper text, empty-state context, explanatory copy that is not action-critical. | Errors, blockers, reasons, verdicts, status transitions, success/failure outcomes, requirements that decide access, destructive confirmations. | `tag-badge--*`, inline note panel, error/warn text, future `mg-status-pill` / `mg-note-panel`. |
| `error-text` | Inline validation errors and blocking failures near the field/action. | Long operational diagnostics, permanent status labels, general body copy. | `tag-badge--danger` plus diagnostic panel for durable/blocking state. |
| `success-text` | Short inline success state when a badge/pill would be too heavy. | Completion outcome banners/cards, durable workflow status, reward/combat/progression results. | `tag-badge--success`, result card, summary/status pill. |
| `info-text` | Short non-critical informational inline text. | Primary status, missing DB dependencies, action-critical guidance. | `tag-badge--info`, note panel, section copy. |
| `warn-text` | Inline warning text where the user must notice a risk but no richer pattern is available. | Toast-only warning, hidden/action-critical instructions, durable warning status. | `tag-badge--warn`, inline warning panel, future `mg-note-panel`. |
| `arcane-text` | Rare special/system/technical emphasis where the meaning is non-critical and already explained. | Access control, security, moderation, economy or gameplay authority state. | `tag-badge--arcane` or explicit diagnostic panel. |
| `heading-color` | Titles, key values, compact labels that need hierarchy. | Error/warning/success meaning. | Semantic status text or badge variant. |
| `text-muted` / `text-danger` legacy aliases | Existing legacy/Bootstrap-like templates only. | New UI. | Use current project utilities or semantic badges. |

## Semantic Rules

1. Muted text is for secondary importance, not negative importance.
2. If the text tells the player/admin whether they can act, it is not just muted metadata.
3. If the text is a DB/RPC blocker, missing metadata gap, RLS/config dependency, combat/reward result, sanction, verdict or moderation reason, prefer a badge/status panel over `muted-text`.
4. Status labels may come from DB dictionaries/read models. CSS utility choice must not replace or reinterpret the DB label.
5. Use `muted-text` freely for static labels paired with a stronger value, for example label/value rows.
6. Empty states can use `muted-text` when they are neutral. If the empty state is unexpected or action-blocking, use a diagnostic panel or warning state.
7. Do not rely on color alone for access, eligibility, success/failure or blocking meaning.

## Audit Findings

The current codebase uses `muted-text` broadly. Many usages are legitimate:

- form field labels;
- DB metadata descriptions/helper text;
- timestamps and ids;
- label/value row labels;
- neutral empty states;
- report/detail secondary metadata.

Potential cleanup categories found during UI-CORE-8 discovery:

| category | examples by pattern | future action |
|---|---|---|
| Error text rendered as muted | `{{ error() }}`, `{{ page.loadError() }}`, `{{ page.battleError() }}` inside `muted-text`. | Replace with `error-text` or `tag-badge--danger`/note panel when touching the file. |
| Reason/blocker text rendered as muted | status reason, eligibility reason, relocation/destructive reason, action unavailable reason. | Use status badge plus visible reason/detail pattern. |
| Outcome/result description rendered as muted | challenge/combat/reward result descriptions. | Use result card/summary pattern; details can be secondary only after outcome is clear. |
| Missing DB/read-model diagnostics rendered as muted | missing metadata, reward/read-model gaps, unavailable preview/config. | Use note/warning panel and exact dependency text. |
| Dense metric rows all muted | stat rows where both label/value or whole row are muted. | Keep label muted, make value normal/heading if it is the scannable data. |

This task intentionally does not rewrite those templates because the current pass is MD-only. Future UI tasks should clean touched obvious abuses in their own scope.

## Replacement Lookup

| situation | preferred pattern |
|---|---|
| Short state such as active/pending/completed/blocked | `tag-badge--info/success/warn/danger/muted`. |
| Warning/action-critical dependency | Inline warning note/panel, then `tag-badge--warn` where compact display is needed. |
| Blocking error near an action | `error-text` for field/action-local error; `tag-badge--danger` or panel for durable page-level error. |
| Success after mutation | Toast for transient feedback plus durable state refresh; do not keep success only as small colored text. |
| DB metadata gap | Explicit missing namespace/key diagnostic panel or compact `tag-badge--warn`. |
| Label/value row | Muted label, normal/heading value. |
| Empty state | `muted-text` only if expected and neutral; warning/note panel if unexpected. |

## Touch-File Cleanup Rule

When a future UI task touches a template:

1. Search only the touched file for text utilities.
2. Keep `muted-text` for labels, helper copy, timestamps and neutral empty states.
3. Replace `muted-text` when it carries error, blocker, decision, reason, outcome or status meaning.
4. Prefer existing `.tag-badge--*`, shared surfaces and future UI-CORE-9 patterns over adding local classes.
5. Do not perform a repo-wide mass rewrite unless explicitly scoped.

## Review Checklist

Future UI reports must include:

- text utilities changed:
- muted-text usages removed:
- muted-text usages kept:
- why kept:
- status/reason/outcome pattern used:
- local SCSS added:
- copied from prototype: no:
- accessibility note: meaning is not color-only:
