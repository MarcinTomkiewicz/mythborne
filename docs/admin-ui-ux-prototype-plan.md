# Mythsworn — Admin UI/UX Prototype Plan

Status: working planning document / candidate design brief  
Updated: 2026-05-10

## Purpose

This document defines the planned UI/UX prototype scope for the Mythsworn admin panel.

It is **not** an implementation backlog, not a DB/RPC registry, not a status tracker and not a final design system. It exists so the UI/UX designer conversation can work from a stable map instead of receiving a long batch of unrelated one-off screen requests.

Use this document to decide:

- which admin workspaces need prototypes;
- which routes/screens belong together;
- which surfaces should be grouped, hidden, collapsed or treated as diagnostics;
- which reusable UX patterns Codex will later need as visual anchors;
- which areas need DB/RPC/metadata follow-up before implementation.

## Working principles

- Do not design 33 existing admin cards as 33 equal top-level screens.
- Group admin work by operator intent, not by current route names.
- A route is not always a surface. One route can contain multiple real admin surfaces, tabs or workflows.
- Configurators, read-only inspectors, diagnostics, sandbox tools, moderation workflows and governance workflows must be visually distinct.
- Read-only diagnostics should remain accessible, but should not dominate the main admin dashboard.
- Complex admin screens should use concrete structure: tabs, accordions, split views, list/detail, side panels, diff tables, preview panels and status chips.
- Prototypes should give Codex clear visual/UX anchors. Codex should not have to invent layout structure.
- If a design needs DB/RPC, metadata or generated types that do not exist yet, mark it as a dependency instead of masking it with permanent UI copy.

## Key MVP balance/config lifecycle

Target MVP flow for admin-configurable balance/gameplay changes:

```text
admin edit -> active global balance draft -> sandbox/diagnostics draft overlay -> mark ready -> apply -> live/global
```

MVP assumptions:

- one global active `balance_global` draft;
- no per-user drafts;
- no per-server live overrides;
- no multi-server apply;
- no independent sandbox overrides as a separate source of truth;
- draft change set is the source of proposed changes;
- sandbox/admin diagnostics may evaluate live values plus draft overlay;
- live gameplay does not see draft changes;
- apply promotes final proposed values globally to live.

UI implications:

- show live value and draft/proposed value separately;
- show whether the current preview is live-only or draft-overlay;
- show whether a change is included in the active draft;
- show conflict state before apply;
- apply is atomic: any conflict blocks the whole apply;
- do not design partial apply for MVP.

## Top-level admin areas

### 1. Overview / Admin Hub

Role: entry point and orientation layer.

Current source:

- `/admin`

Target:

- not a flat wall of cards;
- grouped admin areas;
- selected server/sandbox context;
- active balance draft summary;
- pending conflicts/warnings;
- links to major workspaces;
- diagnostic links de-emphasized or grouped.

### 2. Change Governance / Formula & Config

Role: source-of-truth and governed-change workspace.

Current surfaces:

- `/admin/config-definitions`
- `/admin/config-change-sets`
- `/admin/formulas`
- formula/library/assignment sections currently embedded in `/admin/balance`
- `/admin/audit-dictionaries`
- `/admin/audit-logs` as governance support/cross-link

Target workspace concepts:

- Config definitions;
- Config change sets;
- Active balance draft;
- Formula library;
- Formula targets;
- Formula assignments;
- Where-used / runtime impact;
- Audit support.

Important note: Formula Library is a reusable formula library for the whole game, not a simple balance subpage. It must explain legal variables, target usage and gameplay/runtime impact.

### 3. Game Balance

Role: balancer workspace for gameplay/content definitions and tuning.

Target sub-workspaces:

- Item Generation;
- Buildings / Estate Balance;
- Combat Content / Combat Balance;
- Progression Balance;
- PvP only when it has real configurators, not as many read-only diagnostic cards.

### 4. Exploration & PvE Settings

Role: core loop configuration for Exploration, Trials, Encounters and Rewards.

Current surfaces:

- `/admin/exploration-trials`
- `/admin/exploration-encounters`
- `/admin/reward-profiles`

Related but not primary config:

- `/admin/exploration-lab`
- `/admin/exploration-debug`
- Luck Lab / draft-aware previews

Target workspace concepts:

- Trial definitions;
- Encounter definitions;
- Reward profiles;
- candidate wiring;
- reward/effect wiring;
- readiness checks;
- links to sandbox/lab/diagnostics.

### 5. Moderation & Anti-abuse

Role: operator/moderator workflows, cases, sanctions and abuse recovery.

Current surfaces:

- `/admin/anti-abuse-cases`
- `/admin/anti-abuse-cases/:caseId`
- `/admin/moderation-actions`
- `/admin/anti-abuse-config`
- `/admin/scrapped-item-recovery`
- `/admin/pvp-anti-abuse-explainability`

Decision:

- Scrapped item recovery belongs here. It is an operator recovery workflow for harm/abuse incidents, not an item catalog feature.

Target workspace concepts:

- Case queue;
- Case detail;
- Signals/reports/participants;
- Moderation actions;
- Sanctions and penalties;
- Item recovery;
- PvP anti-abuse summary/link;
- Audit context.

### 6. Server Operations

Role: live/server operations and staff/server management.

Current surface:

- `/admin/staff-management`

Future/pending slots:

- Server Events admin/config;
- Guild/server operations;
- Notification inbox/readability;
- server lifecycle/status.

Decision:

- Server Events are operational server state, not ordinary Game Balance UI, even if they affect gameplay.

### 7. Reports / Notifications / Audit

Role: communication, report readability, notification registry and audit access.

Current surfaces:

- `/admin/notification-types`
- `/admin/notification-hooks`
- `/admin/pvp-report-producer`
- `/admin/audit-dictionaries`
- `/admin/audit-logs`

Future/pending slots:

- general Game Reports admin/readability/debug;
- notification inbox/readability.

Note:

- Some audit surfaces may also appear as cross-links in Governance or Moderation. They do not all need top-level prominence.

### 8. Gameplay Tools / Sandbox / Diagnostics

Role: test tools, labs, previews, diagnostics and runtime inspection.

Current surfaces:

- `/admin/exploration-lab`
- `/admin/exploration-debug`
- `/admin/pvp-foundation-diagnostic`
- `/admin/notification-hooks` as diagnostics
- Luck Lab, if/when surfaced in admin

Future/pending slots:

- Combat sandbox/admin test;
- Game reports diagnostics;
- Server Events diagnostics.

Important decision:

- PvP read-only pages should be grouped as one `PvP Readiness & Diagnostics` workspace, not exposed as many equal dashboard cards.

## Prototype batches

### Batch 1 — Admin foundation

#### Prototype 1: Admin Shell / Navigation IA

Goal: define the primary admin navigation structure.

Needs to show:

- grouped navigation / sidebar / accordion model;
- top-level admin areas;
- distinction between configurators, diagnostics, sandbox and moderation;
- collapsed/secondary diagnostics;
- selected server/sandbox context placement.

Do not:

- show 33 equal cards;
- over-expose read-only diagnostics;
- imply missing features are implemented.

#### Prototype 2: Admin Area Hub / Overview

Goal: replace the flat admin dashboard with an operator-friendly hub.

Needs to show:

- sections for major admin areas;
- active balance draft summary;
- pending conflicts/warnings;
- sandbox/live context;
- recent/important workflows;
- quick links to key workspaces;
- secondary diagnostics area.

Required states:

- no active balance draft;
- active draft with clean entries;
- active draft with conflicts;
- diagnostics/warnings present.

#### Prototype 3: Admin Balance Draft Workspace

Goal: full change-set/draft workspace for balance changes.

Needs to show:

- active draft card;
- status: draft / ready / applied / cancelled;
- reason;
- created by / created at;
- active entries count;
- conflict count;
- actions: create/get active draft, mark ready, apply, cancel;
- ambiguous draft state as blocker;
- diff table.

Diff table columns:

- entity label;
- field label;
- live value;
- proposed value;
- effective sandbox value;
- conflict status.

Conflict statuses:

- clean;
- conflict;
- missing_entity;
- invalid_field.

Apply behavior:

- all clean -> apply all;
- any conflict -> apply blocked;
- no partial apply in MVP.

#### Prototype 4: Persistent Draft Context Strip / Panel

Goal: small reusable pattern visible inside configurators and preview tools.

Needs to show:

- active draft present / absent;
- preview mode: live vs draft overlay;
- pending changes for this workspace;
- link to full draft workspace;
- warning: draft does not affect live gameplay.

Use cases:

- Item Generation;
- Formula Library;
- Luck Lab;
- Exploration Settings;
- later other balance workspaces.

### Batch 2 — Game Balance MVP

#### Prototype 5: Item Generation Workspace

Current sources:

- `/admin/balance`
- `/admin/item-catalog`

Primary tabs/sections:

- Overview;
- Quality tiers;
- Bucket profiles;
- Item bases;
- Prefixes / suffixes;
- Bonus templates;
- Item requirements;
- Formula assignments;
- Preview / Luck Lab;
- Draft/change-set status.

Needs to show:

- editing through draft state, not direct live mutation;
- live vs proposed values;
- preview with active draft;
- where formulas and assignments affect item generation;
- clear distinction between catalog definitions and balance tuning.

Primary end-to-end example:

```text
Bucket profile edit -> draft diff -> Luck Lab preview with draft -> mark ready -> apply
```

#### Prototype 6: Formula Library & Assignment Workspace

Current sources:

- `/admin/formulas`
- formula sections inside `/admin/balance`

Primary tabs/sections:

- Formula library;
- Formula targets;
- Allowed variables;
- Assignments;
- Where used;
- Runtime impact;
- Preview/test;
- Draft state.

Needs to solve:

- admin can understand where a formula is used;
- admin can see legal variables and DB/runtime constraints;
- admin can distinguish library expression from active assignment;
- admin can preview impact without implying live apply.

#### Prototype 7: Luck Lab / Preview Workspace

Goal: draft-aware preview/simulation workspace.

Primary modes:

- Live preview;
- Preview with active balance draft.

Needs to show:

- selected draft context;
- clear statement that draft preview does not affect live gameplay;
- generated item / reward / Luck simulation output;
- comparison between live and proposed where useful;
- links back to changed bucket/profile/formula entries.

### Batch 3 — Core loop admin

#### Prototype 8: Exploration Settings Workspace

Current sources:

- `/admin/exploration-trials`
- `/admin/exploration-encounters`
- `/admin/reward-profiles`

Primary tabs/sections:

- Overview;
- Trial definitions;
- Encounter definitions;
- Reward profiles;
- Candidate wiring;
- Reward/effect wiring;
- Readiness checks;
- Links to Exploration Lab/Debug;
- Draft/change-set dependency placeholder if DB/RPC not ready.

Needs to show:

- Trials/Encounters/Rewards as one core-loop configuration family;
- sandbox/debug tools as links or secondary tabs, not mixed with normal config;
- readiness and missing-contract warnings.

#### Prototype 9: Sandbox / Diagnostics Workspace

Primary sections:

- Luck Lab;
- Exploration Lab;
- Exploration Debug;
- PvP Readiness & Diagnostics;
- future Combat Sandbox;
- report/notification diagnostics.

Needs to show:

- strong sandbox/debug labeling;
- no confusion with live config;
- grouped read-only diagnostics;
- PvP read-only pages as one diagnostics workspace with tabs.

### Batch 4 — Operator/admin support

#### Prototype 10: Moderation & Anti-abuse Workspace

Primary sections:

- Case queue;
- Case detail;
- Player reports/signals;
- Participants;
- Moderation actions;
- Sanctions/penalties;
- Item recovery;
- PvP anti-abuse;
- Audit context.

Needs to show:

- item recovery as moderation/abuse recovery;
- reason/audit emphasis;
- server-scoped operator context;
- clear separation from Game Balance and Item Catalog.

#### Prototype 11: Reports / Notifications / Audit Workspace

Primary sections:

- Notification types;
- Notification hooks/producers;
- future notification inbox/readability;
- Game Reports admin/readability/debug;
- PvP report producer diagnostics;
- Audit logs;
- Audit dictionaries.

Needs to show:

- registry vs inbox/readability vs diagnostics;
- technical diagnostics de-emphasized;
- audit as support context, not necessarily a top-level daily workspace.

## Route-to-target map v0.1

| Current route | Target area | Target workspace / note |
|---|---|---|
| `/admin` | Overview | Admin Hub |
| `/admin/balance` | Game Balance | Item Generation + Formula sections |
| `/admin/item-catalog` | Game Balance | Item Generation catalog/config |
| `/admin/buildings` | Game Balance | Buildings / Estate Balance |
| `/admin/combat-opponents` | Game Balance | Combat Content configurator |
| `/admin/combat-balance` | Game Balance or Sandbox | Combat preview/diagnostics; not ordinary config |
| `/admin/level-up-stat-bonuses` | Game Balance | Progression Balance, read-only until configurator exists |
| `/admin/formulas` | Change Governance / Game Balance cross-link | Formula Library & Assignment Workspace |
| `/admin/config-definitions` | Change Governance | Config definitions/read model |
| `/admin/config-change-sets` | Change Governance | Change sets / Active Balance Draft |
| `/admin/audit-dictionaries` | Governance or Reports/Audit | Audit support |
| `/admin/audit-logs` | Reports/Audit or Moderation support | Audit context |
| `/admin/exploration-trials` | Exploration & PvE Settings | Trial definitions |
| `/admin/exploration-encounters` | Exploration & PvE Settings | Encounter definitions |
| `/admin/reward-profiles` | Exploration & PvE Settings / Game Balance | Reward profiles |
| `/admin/exploration-lab` | Sandbox / Diagnostics | Exploration lab |
| `/admin/exploration-debug` | Sandbox / Diagnostics | Debug/test helper tools |
| `/admin/anti-abuse-cases` | Moderation & Anti-abuse | Case queue |
| `/admin/anti-abuse-cases/:caseId` | Moderation & Anti-abuse | Case detail |
| `/admin/moderation-actions` | Moderation & Anti-abuse | Moderation actions |
| `/admin/anti-abuse-config` | Moderation & Anti-abuse | Anti-abuse config/read-only link to change sets |
| `/admin/scrapped-item-recovery` | Moderation & Anti-abuse | Item recovery |
| `/admin/staff-management` | Server Operations | Staff management |
| `/admin/notification-types` | Reports / Notifications | Notification registry |
| `/admin/notification-hooks` | Reports/Notifications or Sandbox | Producer diagnostics |
| `/admin/pvp-overview` | Sandbox / Diagnostics | PvP Readiness & Diagnostics tab |
| `/admin/pvp-action-lifecycle` | Sandbox / Diagnostics | PvP Readiness & Diagnostics tab |
| `/admin/pvp-targeting` | Sandbox / Diagnostics | PvP Readiness & Diagnostics tab until real configurator exists |
| `/admin/pvp-travel-timing` | Sandbox / Diagnostics | PvP Readiness & Diagnostics tab until real configurator exists |
| `/admin/pvp-resource-consequences` | Sandbox / Diagnostics | PvP Readiness & Diagnostics tab until real configurator exists |
| `/admin/pvp-reward-routing` | Sandbox / Diagnostics | PvP Readiness & Diagnostics tab until real configurator exists |
| `/admin/pvp-prestige-context` | Sandbox / Diagnostics | Temporary readiness surface; likely changes after Prestige epic |
| `/admin/pvp-anti-abuse-explainability` | Moderation & Anti-abuse + Sandbox cross-link | PvP anti-abuse diagnostics |
| `/admin/pvp-report-producer` | Reports / Notifications + Sandbox cross-link | Report producer diagnostics |
| `/admin/pvp-foundation-diagnostic` | Sandbox / Diagnostics | PvP diagnostics |

## Open decisions

- Whether `Reports / Notifications / Audit` should be a top-level area or split between Governance, Operations and Diagnostics.
- Whether `Combat Balance` belongs under Game Balance or Sandbox/Diagnostics until it becomes a real configurator.
- Whether `Reward Profiles` should primarily live under Exploration & PvE or Game Balance; likely both via cross-links.
- Exact shape of future Server Events admin/config workspace.
- Exact shape of future Game Reports admin/readability surface.
- How much of PvP Readiness & Diagnostics should remain visible before PvP becomes a real player-facing feature.

## Designer output expectations

For each prototype, provide:

- purpose of the screen/workspace;
- primary user role;
- layout structure;
- tabs/sections;
- visual anchors Codex must preserve;
- key states;
- empty/error/conflict states;
- what is live, draft, sandbox, read-only or diagnostic;
- dependencies on DB/RPC/metadata;
- what should not be implemented yet.
