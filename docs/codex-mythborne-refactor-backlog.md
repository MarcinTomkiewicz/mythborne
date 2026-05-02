# Codex Backlog — Mythborne Refactor Backlog

Purpose: this backlog translates current project decisions into small, promptable implementation tasks for Codex.

Use this as a practical task queue. Concept documents remain informational; this file is for execution.

Canonical source order:

1. explicit user instruction,
2. current database schema / migrations,
3. `docs/database-current.md`,
4. `docs/current-decisions.md`,
5. `docs/project-context.md`,
6. `current-state-summary.md`,
7. `current-todo.md`.

Global Codex rules:

- Work from the current repository state.
- Read the relevant docs before coding.
- Do not invent schema that is not in current DB/migrations.
- Regenerate/update database types when schema changes require it.
- Do not assume `hero.id === auth.uid()`.
- Load selected/current server and active hero before hero-owned queries.
- Use DB dictionaries/configs instead of hardcoding configurable options.
- Keep metadata JSON lightweight.
- Prefer backend/RPC/domain operations for critical persistent changes.
- Frontend formula runtime is preview/admin explainability only; authoritative DB/RPC workflows must evaluate assigned `balance_formulas` server-side and must not trust Angular-computed formula results for durable mutations.
- Preserve `reason`, `description`, `status_reason`, helper/admin text wherever applicable.
- After each task, summarize exact changes and wait for user confirmation.
- Do not mark tasks as completed in state docs before user confirms they work.
- Before adding new utility/config/factory files, check existing `core/utils`, `core/factories`, form config files and shared form patterns. If you add a new helper anyway, include a `reused / checked but not reused / new` table in the report.



## Refactor backlog ID policy

This backlog uses `Epic Ref A`, `Epic Ref B`, etc. to avoid colliding with the main feature backlog epic letters. Original epic/task IDs are preserved in headings or notes where useful for traceability.

---

## DB cleanup candidate rule

If a task removes the final frontend/backend dependency on a legacy DB object, Codex must report it as a cleanup candidate instead of silently leaving schema debt.

The report must include:

- object name, e.g. table/column/function/view;
- where it was previously used;
- what replaced it;
- whether a later DB cleanup/drop migration appears safe;
- any remaining known references in docs, generated types, tests, migrations or legacy adapters.

Codex must not create cleanup/drop migrations unless the user explicitly asks for database cleanup work.

---

## Implementation backlog discipline

- Prefer implementation tasks over repeated audits once schema/contracts are known.
- Audit/spec tasks should normally be followed by concrete implementation tasks in the same epic.
- Do not create long audit-only sequences unless user explicitly asks or implementation is blocked.
- If an audit finds clear work, add/update implementation tasks with acceptance criteria before continuing.
- UX tasks should produce visible UI/helpers unless explicitly marked as audit/spec.

---

# Epic Ref A — Admin information architecture and layout hygiene

Original source: Epic R.

Epic R is a lightweight admin IA/layout hygiene epic, not a final UI redesign.

The goal is to stop admin tooling from growing randomly and to give new admin/balancer modules predictable places in the admin shell. Final visual style, spacing, iconography, and full design-system decisions remain in the UI/UX backlog.

Admin UI should be organized by **work intent**, not by raw table names.

Preferred admin groups:

- **Overview**
- **Global Governance**
- **Game Balance**
- **Server Operations**
- **Moderation & Anti-abuse**
- **Gameplay Tools / Sandbox**

General Epic Ref A rules:
- Do not rename gameplay concepts casually.
- Do not move player-facing routes into admin.
- Keep selected server context visible for server-scoped admin pages.
- Use DB dictionaries and labels instead of hardcoded permanent lists.
- Raw technical keys/UUIDs may appear as secondary metadata, not as primary UX.
- Prefer PrimeNG Tabs / tabbed sections for complex admin pages instead of one long vertical form.
- Epic Ref A is not a final visual redesign. Keep changes structural, navigational, and reusable.
- If a route/page already exists, preserve functionality while moving or grouping navigation.
- If a target route does not exist yet, add a clear placeholder/navigation slot only when useful; do not fake implemented functionality.

---

## Task Ref A1 (formerly R1) — Admin navigation taxonomy and route inventory

**Goal:** Audit current admin routes and assign them to a stable admin navigation taxonomy.

**Scope:**
- Inspect current admin routes, sidebar entries, dashboard links, and admin page entry points.
- Classify each current admin route under one of:
  - Overview;
  - Global Governance;
  - Game Balance;
  - Server Operations;
  - Moderation & Anti-abuse;
  - Gameplay Tools / Sandbox.
- Identify routes currently placed randomly or under misleading labels.
- Identify missing route slots needed by upcoming/current admin modules:
  - Trial definitions admin configurator;
  - Encounter definitions admin configurator;
  - Combat opponent definitions admin configurator;
  - Notification inbox/type admin/readability;
  - Game report admin/debug/readability;
  - Exploration lab/debug tools;
  - Combat sandbox/admin test tools.
- Keep a distinction between:
  - global/product admin pages;
  - selected-server admin pages;
  - staff/moderation pages;
  - sandbox/test tools.
- Do not change behavior yet unless it is a trivial label/grouping fix.

**Acceptance criteria:**
- Report lists current admin routes and their proposed group.
- Report identifies misplaced or ambiguous routes.
- Report lists missing navigation slots for M12/L11/L12/P/Q-related admin pages.
- No large UI rewrite is done in this audit task.
- No route is removed.
- Build is not required unless code changes are made.

---

## Task Ref A2 (formerly R2) — Admin sidebar grouping implementation

**Goal:** Reorganize admin navigation into stable, readable groups.

**Scope:**
- Update admin/sidebar navigation to use the agreed groups:
  - Overview;
  - Global Governance;
  - Game Balance;
  - Server Operations;
  - Moderation & Anti-abuse;
  - Gameplay Tools / Sandbox.
- Move existing entries into the correct groups based on Ref A1.
- Keep global/product tools separate from selected-server tools.
- Keep moderation and anti-abuse tools grouped together.
- Create clear navigation slots for upcoming admin modules where appropriate:
  - Game Balance → Trials;
  - Game Balance → Encounters;
  - Game Balance → Combat Opponents;
  - Game Balance → Reward Profiles if/when route exists;
  - Gameplay Tools / Sandbox → Exploration Lab;
  - Gameplay Tools / Sandbox → Combat Sandbox/Admin Test;
  - Overview or Operations → Notifications;
  - Gameplay Tools or Reports area → Game Reports, if route exists.
- Do not create fake working pages. If a route is missing, either omit it or mark it as pending only if the project already uses pending/disabled navigation conventions.
- Preserve existing route guards and staff/admin access boundaries.
- Preserve selected-server switcher behavior.

**Acceptance criteria:**
- Admin sidebar is grouped by work intent, not raw table/entity names.
- Existing admin routes remain reachable.
- No player-facing route is accidentally moved into admin.
- Server-scoped pages still make selected server context clear.
- Hidden/disabled/pending links do not imply implemented functionality.
- Build passes.

---

## Task Ref A3 (formerly R3) — Admin page layout pattern: header, context, and sections

**Goal:** Establish a reusable admin page layout pattern for current and future admin tools.

**Scope:**
- Identify or create a lightweight reusable/admin-local layout pattern for admin pages:
  - page title;
  - short explanation/helper text;
  - optional technical key/source metadata;
  - global vs selected-server context indicator;
  - action area;
  - content sections.
- Prefer reuse of existing shared/page layout components if they already exist.
- For complex admin pages, prefer PrimeNG Tabs / tabbed grouping or clearly separated sections instead of long vertical forms.
- Do not perform full visual redesign.
- Do not introduce a heavy design system replacement.
- Apply the pattern to one or two representative admin pages only, unless the change is trivial and safe.
- Document the pattern in comments or local helper naming so future admin configurators can reuse it.

**Recommended tab patterns for future configurators:**
- Combat Opponents:
  - Overview;
  - Stats;
  - Natural attacks;
  - Equipment;
  - Scaling;
  - Usage / candidates.
- Trials:
  - Overview;
  - Minigame;
  - Combat candidates;
  - Requirements / availability;
  - Preview.
- Encounters:
  - Overview;
  - Kind / minigame;
  - Reward profile;
  - Combat candidates;
  - Difficulty / districts;
  - Preview.
- Notifications:
  - Types;
  - Inbox/read model;
  - Hook diagnostics.
- Reports:
  - Types;
  - Combat reports;
  - Public link preview;
  - Item references.

**Acceptance criteria:**
- At least one admin page demonstrates the reusable header/context/section pattern.
- Selected-server pages visibly show selected server context.
- Global pages do not pretend to be server-scoped.
- Complex content is organized into tabs or logical sections where appropriate.
- Existing form behavior is not broken.
- Build passes.

---

## Task Ref A4 (formerly R4) — Staff/Admin dashboard attention cards

**Goal:** Make the admin/staff landing page useful by surfacing work that needs attention.

**Scope:**
- Add or improve staff/admin landing dashboard cards using existing read models where available.
- Candidate cards:
  - selected server summary;
  - open anti-abuse cases;
  - cases waiting for player;
  - cases waiting for staff;
  - pending player abuse reports;
  - pending relationship declarations;
  - pending sanctions / Character Points penalties;
  - unread staff notifications.
- Use DB/RPC/read models that already exist.
- Do not invent new backend aggregation tables.
- If a needed aggregate/read path is missing, show a minimal safe fallback or report DB/RPC blocker.
- Cards should link to the relevant admin/staff section.
- Avoid raw UUID-only display.
- Do not expose staff-only data to non-staff users.

**Acceptance criteria:**
- Staff/admin landing page shows at least several meaningful attention cards from existing systems.
- Staff notifications from the Q foundation can be surfaced if current read path permits.
- Cards link to relevant admin pages where routes exist.
- Missing route/read path is documented clearly instead of faked.
- Normal players cannot access staff dashboard data.
- Build passes.

---

## Task Ref A5 (formerly R5) — Admin source-link and cross-navigation hygiene

**Goal:** Improve navigation between related admin/domain entities without forcing admins to manually copy UUIDs.

**Scope:**
- Add or standardize source links where existing data has source entity references:
  - notifications → source entity;
  - audit logs → entity/source where route exists;
  - anti-abuse case → related report/trade/auction/hero;
  - player abuse report → related case/trade/item;
  - game report → source combat result/report detail where route exists;
  - exploration lab/debug → related trial/encounter definitions where route exists.
- If a route exists, render a usable link.
- If a route does not exist, show readable metadata and mark the link as unavailable/pending.
- Keep raw UUIDs secondary and copyable where useful.
- Do not create fake routes or broken links.
- Respect player/staff privacy boundaries.

**Acceptance criteria:**
- Admins can navigate from at least one notification/source-driven area to its source entity where route exists.
- Missing source routes are represented as disabled/pending with metadata, not broken links.
- UUIDs are not the main UX label.
- Cross-links do not expose player-private or staff-only fields to the wrong audience.
- Build passes.

---

## Task Ref A6 (formerly R6) — Admin configurator placement check for M12/L11/L12

**Goal:** Ensure new admin configurators for combat opponents, trials, and encounters have correct navigation and layout placement.

**Scope:**
- Confirm where these upcoming/added admin tools should appear:
  - `M12 — Combat opponent definitions admin configurator` → Game Balance / Combat Opponents.
  - `L11 — Trial definitions admin configurator` → Game Balance / Trials.
  - `L12 — Encounter definitions admin configurator` → Game Balance / Encounters.
- Ensure route labels are human-readable and not raw table names.
- Ensure these pages use the Ref A3 layout pattern where implemented.
- If routes are not implemented yet, document the intended placement and keep sidebar placeholders disabled or omitted according to existing navigation convention.
- Do not implement M12/L11/L12 inside Epic Ref A unless explicitly instructed.

**Acceptance criteria:**
- Placement decision for M12/L11/L12 is documented in code comments, route metadata, or admin navigation config.
- No configurator is hidden under unrelated moderation/server/config sections.
- Future Codex tasks can add those pages without inventing a new navigation structure.
- Build passes if code changes are made.

# Epic Ref B — Responsibility, legacy cleanup and Angular 21 alignment

Original source: Epic S.

Epic S is a cleanup and verification epic for already-started foundation work.

It closes old responsibility, naming, Character Points, `hero_derived`, trade/auction and anti-abuse cleanup concerns that were introduced before later epics refined the architecture.

This epic must not reimplement completed work. It must verify what is already done, identify stale/legacy paths, and turn remaining gaps into precise current tasks.

Do not update status docs before user confirmation.

---

## Epic goals

- Find scattered domain responsibilities.
- Confirm old HP / Hero Points / PR / Character Points confusion is gone from active app paths.
- Confirm new code does not reintroduce `hero_derived` as source of truth.
- Confirm trade and auction runtime uses canonical RPCs.
- Confirm locked/scrapped items are not usable as normal active items.
- Confirm anti-abuse signal/case read surfaces are usable and server-scoped.
- Confirm whether Trade Routes active-offer-limit integration remains pending or has a current implementation path.
- Keep touched code aligned with Angular 21 / signals / current project style.

---

## Epic rules

- Do not mass-rename unrelated files.
- Do not drop DB objects in this epic.
- Do not invent schema.
- Do not mutate governed domain tables directly from Angular.
- Do not replace existing domain/RPC workflows with frontend-only logic.
- Do not mark tasks complete in state docs before user confirmation.
- If a cleanup item is already covered by a newer epic/task, report that instead of duplicating implementation.
- If a cleanup item is obsolete/superseded, say so explicitly.
- If a cleanup item is still pending, produce a precise follow-up task with owner domain/epic.

---

## Task Ref B1 (formerly S1) — Responsibility audit

**Goal:** Find scattered domain responsibilities and stale architecture boundaries.

**Scope:**

Audit active app code for misplaced responsibilities across:

- hero identity/bootstrap;
- progression/stat allocation;
- Character Points and ledger usage;
- resources;
- estate/buildings;
- item inventory/armory lifecycle;
- combat;
- admin/config governance;
- trade/auction;
- anti-abuse.

Classify findings as:

- acceptable current ownership;
- misplaced responsibility;
- legacy compatibility;
- superseded by newer epic;
- needs follow-up task.

**Acceptance criteria:**

- Report lists misplaced responsibilities with exact files/classes/functions.
- Report names the correct owning domain for each issue.
- No broad refactor is performed in this task.
- No docs/status files are updated before user confirmation.

---

## Task Ref B2 (formerly S2) — Hero/progression/stat cleanup

**Goal:** Fix the known scattered hero/progression/stat area first.

**Scope:**

- Hero domain handles hero identity/bootstrap.
- Progression/stat domain handles stat allocation/progression.
- Resource domain handles resources.
- Character Points reads come from `hero.character_points` or an approved read model.
- Stat allocation/progression saves use the approved backend/RPC/domain workflow.
- Preserve behavior.

**Acceptance criteria:**

- Existing stat allocation still works.
- Responsibilities are clearer.
- No direct frontend writes to `hero_stats`, `hero.character_points`, `character_point_ledger` or audit tables.
- No new `hero.id === auth.uid()` assumption appears.

---

## Task Ref B3 (formerly S3) — Angular 21 naming cleanup when touched

**Goal:** Avoid outdated naming and architecture noise while touching cleanup areas.

**Scope:**

- Do not add unnecessary `XxxService` suffix if current project style avoids it.
- Avoid redundant facade naming.
- Do not mass rename unrelated files.
- Keep reusable domain models, mappers, helpers and form types out of components.
- Prefer signals/computed signals/current Angular style where touched.
- Preserve existing route/page/component structure.

**Acceptance criteria:**

- Touched code follows current project style.
- No unrelated rename churn.
- Build passes.

---

## Task Ref B4 (formerly S4) — Classify old 2026-04-26 priority update items

**Goal:** Convert the old post-trade/auction/anti-abuse priority update into a current, accurate checklist.

**Scope:**

Inspect current code, generated types and current docs against the old priority list:

1. regenerate database types;
2. HP / Hero Points / Character Points cleanup;
3. `hero_derived` cleanup;
4. direct trade RPC integration;
5. auction RPC integration;
6. locked trade/auction item visibility;
7. anti-abuse signal/case UI;
8. Trade Routes active offer limit;
9. fixed-price listing supersession.

For each item, classify as:

- already done / confirmed;
- done but needs verification;
- partially done;
- covered by a newer epic/task;
- obsolete/superseded;
- still pending.

**Acceptance criteria:**

- Report maps every old priority item to current status.
- Report names the current epic/task that owns remaining work.
- No implementation changes are made unless explicitly requested.
- No docs/status updates are made before user confirmation.

---

## Task Ref B5 (formerly S5) — Character Points / Health terminology verification

**Goal:** Verify that old HP/Hero Points/PR confusion is gone from active UI/domain paths.

**Scope:**

Search active app code for:

- `hero_derived.hp`;
- `Hero Points`;
- `hero points`;
- `PR` as player-facing currency/progression label;
- `hp` used as points/currency;
- Character Points stored/read from wrong source.

Confirm:

- Character Points read from `hero.character_points` or approved read model;
- `hero.total_character_points_earned` is used only as lifetime/baseline where intended;
- Health means combat/hit points;
- Character Points are not stored in `hero_resources`;
- UI/domain wording does not confuse Health and Character Points.

Do not mass-rename legacy docs unless explicitly asked.

**Acceptance criteria:**

- No active app path reads removed `hero_derived.hp`.
- Player-facing current terminology uses Health and Character Points correctly.
- Remaining legacy wording is listed with file/path and recommended owner epic.
- Any actual behavior bug is separated from wording-only cleanup.

---

## Task Ref B6 (formerly S6) — Derived stats / `hero_derived` dependency verification

**Goal:** Verify that new runtime paths do not reintroduce `hero_derived` as source of truth.

**Scope:**

- Search active app code for `hero_derived`.
- Classify remaining usage:
  - generated types only;
  - legacy compatibility;
  - active runtime dependency;
  - bug/blocker.
- Verify current derived stat resolver uses base stats, equipment, bonuses and formula/fallback layers where intended.
- Verify new trade/economy work does not depend on `hero_derived`.
- Do not remove remaining `hero_derived` DB table/columns.

**Acceptance criteria:**

- No new active runtime dependency on `hero_derived`.
- Remaining usages are documented.
- Any real usage blocker is assigned to Epic N, combat, equipment or another relevant current epic.
- Combat/progression screens still work after touched cleanup.

---

## Task Ref B7 (formerly S7) — Direct trade and auction RPC/runtime verification

**Goal:** Verify that direct trade and auction player workflows use current RPC contracts and do not direct-write critical tables.

**Scope:**

Verify direct trade actions use canonical RPCs:

- `create_player_direct_trade_offer(...)`;
- `respond_player_direct_trade_offer(...)`;
- `cancel_player_direct_trade_offer(...)`;
- `reject_player_direct_trade_offer(...)`;
- `confirm_player_direct_trade_offer(...)`.

Verify auction actions use canonical RPCs:

- `create_player_auction_listing(...)`;
- `place_player_auction_bid(...)`;
- `buy_now_player_auction(...)`;
- `cancel_player_auction_listing(...)`;
- `close_player_auction_listing(...)`.

Verify UI/domain behavior:

- direct trade is private between two heroes;
- both sides are on same server and able to use trade;
- each side only selects own items;
- no access to another hero private inventory;
- CP-only for CP-only exchange is blocked if still required by current contract;
- available CP accounts for active locks;
- status/reason text for cancel/reject/expire/fail is visible enough;
- inventory, CP balance and offers refresh after completion/cancel/reject;
- no generic public fixed-price listing path was reintroduced.

**Acceptance criteria:**

- No direct Angular writes to trade/auction/lock/item ownership tables.
- Direct trade uses RPCs.
- Auctions use RPCs.
- CP/item lock states are visible or explicitly listed as pending UI debt.
- Fixed-price public listing assumptions are absent or marked superseded.

---

## Task Ref B8 (formerly S8) — Locked and scrapped item visibility verification

**Goal:** Verify that locked/scrapped items are not usable as normal active inventory/equipment.

**Scope:**

Check:

- inventory;
- armory;
- item selection in direct trade;
- item selection in auctions;
- equipment/combat bonus paths;
- vendor scrap/sell paths where applicable.

Confirm:

- `locked_trade` items are hidden or disabled where normal active items are expected;
- `locked_auction` items are hidden or disabled where normal active items are expected;
- `scrapped` items are not usable by player-facing paths;
- staff recovery/review exceptions remain staff-only;
- equipment/combat bonus path does not consume locked/scrapped items.

**Acceptance criteria:**

- Player cannot use locked trade/auction items as normal active items.
- Player cannot use scrapped items as normal active items.
- Equipment/combat bonus path does not consume locked/scrapped items.
- Any missing UI state is reported with exact screen/path.

---

## Task Ref B9 (formerly S9) — Anti-abuse signal/case read verification

**Goal:** Verify that existing signal-generated anti-abuse case surfaces are usable and server-scoped.

**Scope:**

Verify staff/admin case list and detail can show:

- signals;
- linked case signals;
- participants;
- related transaction/entity ids;
- metadata;
- reasons/descriptions;
- status/verdict context where available.

Confirm:

- signals/cases are review aids, not automatic punishment;
- signal grouping is visible enough for staff review;
- resolved/cancelled cases are historical and not silently reopened;
- case views are server-scoped;
- player-facing views do not expose staff-only fields.

Implemented signal types to consider:

- `trade.high_cp_direct_trade`;
- `auction.high_cp_sale`;
- `trade.repeated_pair_transfers`.

**Acceptance criteria:**

- Staff can view signal-generated cases.
- Case list groups repeated signals clearly enough for review.
- Case/signal data is server-scoped.
- UI distinguishes evidence, decision, sanction and penalty.
- Linked transaction/entity ids are visible enough for review/debugging.

---

## Task Ref B10 (formerly S10) — Trade Routes active offer limit blocker confirmation

**Goal:** Confirm and isolate the remaining Trade Routes/building integration gap.

**Scope:**

- Inspect current active trade/auction offer limit flow.
- Confirm whether runtime still uses `trade_active_offer_limit_fallback`.
- Check whether Trade Routes/building bonus runtime is available to compute shared active direct trade + auction slot limit.
- Confirm direct trade and active auctions currently share one active-offer slot pool unless a newer explicit config changed this.
- Confirm both sides of direct trade and auction seller/buyer/bidder are validated as able to use player trade.
- Do not implement Trade Routes if the building/runtime contract is still missing; report blocker precisely.

**Acceptance criteria:**

- Current source of active offer limit is identified.
- If fallback remains normal gameplay source, report concrete DB/RPC/runtime blocker.
- If building runtime exists, produce the next implementation task to connect Trade Routes to active offer slots.
- Frontend gaps explaining why trade/auction is unavailable are listed.

---

## Task Ref B11 (formerly S11) — Archive or rewrite stale old-priority backlog block after confirmation

**Goal:** Prevent the old 2026-04-26 priority update from being misread as current active work after Ref B4–Ref B10 classify it.

**Scope:**

After user confirms Ref B4–Ref B10 findings, update backlog manually or by explicit request.

Mark old items as:

- completed;
- superseded;
- moved to Epic N/J/K/O/S/etc.;
- pending as Trade Routes or another named task;
- obsolete.

Do not update `current-todo.md` unless explicitly requested.

**Acceptance criteria:**

- Backlog no longer contains stale duplicate instructions that conflict with current epics.
- Pending work has current owners.

---

## Task Ref B12 — Retire prototype combat sandbox after canonical runtime integration

**Goal:** Remove the temporary `/game/combat` sandbox/prototype flow once the proper Epic M combat runtime is implemented and integrated.

**Scope:**

- After canonical combat runtime, resolver, attack-plan execution and caller integration are in place, delete the prototype-only sandbox model and demo flow instead of extending it as target architecture.
- Remove or replace:
  - `src/app/core/domain/combat/combat-sandbox.model.ts`;
  - demo/prototype combat services that depend on sandbox snapshots;
  - `/game/combat` prototype UI paths that do not use the canonical runtime contract.
- Keep `src/app/core/domain/combat/combat.model.ts` as the canonical DB-backed combat contract boundary.
- Preserve or rebuild any useful admin/test surface only if it calls the canonical combat runtime and clearly labels sandbox/admin-test authority.
- Do not remove the sandbox before canonical runtime integration gives an equivalent test/admin path.

**Acceptance criteria:**

- No active app path depends on `combat-sandbox.model.ts`.
- Prototype sandbox result types are gone or replaced by canonical combat runtime/result types.
- `/game/combat` no longer implies the prototype resolver is the production combat system.
- Canonical combat result snapshots remain DB-backed and caller consequences remain outside combat core.
- No confirmed work is marked complete before user confirmation.

---

## DB cleanup candidate — `hero_derived`

- legacy object: `hero_derived`
- previous usage: former frontend/runtime source for derived stats.
- replacement path: runtime derived stats resolved from base stats, equipment, bonus templates/entity bonuses, `derived_stat_definitions`, and formula assignments.
- remaining blockers: dedicated SQL/reference audit and regenerated Supabase types after any DB cleanup.
- safe to remove now: unknown until dedicated SQL/reference audit.

---

## Epic M follow-up candidate - opponent catalog UI read-model polish

- origin: M4 accepted read-layer follow-up.
- current state: M4 exposes opponent equipment entry shape, DB-backed slot labels, equipment mode labels and level ranges.
- remaining polish:
  - add readable labels for manual item-generation references: base, quality, prefix affix and suffix affix;
  - add readable labels for generated equipment bucket profile and max quality references;
  - distinguish a fully empty opponent catalog from "families exist, but no opponent definitions are configured".
- timing: handle with the first opponent catalog/admin UI task or a focused read-model polish task; do not retrofit during unrelated combat runtime work.

---

# Historical material for Epic Ref B classification

The following historical execution notes and the 2026-04-26 priority update are preserved only for Ref B4/Ref B11 classification.
They are not the current execution order and must not override current epics, current DB/schema, generated types, `database-current.md`, `current-decisions.md`, or explicit user instructions.

## Historical recommended near-term execution order

1. A1 — Regenerate DB types
2. B1 — Audit identity assumptions
3. B2 — Active server resolver
4. B3 — Active hero resolver and critical progression/stat/resource cleanup
5. C1/C2 — role/membership/staff access read layer and server switcher
6. D1/D2 — config definitions/values read model
7. G1/G2/G3 — audit dictionaries/log read/write helper
8. H1/H2/H3/H4/H5 — anti-abuse read models and server-scoped case read
9. H6-H12 — player declarations/reports
10. H13-H21 — staff case/sanction UI
11. D6/H config admin — anti-abuse config UI
12. I1-I3 — item lifecycle
13. F1-F12 — bonus model legacy retirement
14. L/M/N/O/P workstreams as separate feature milestones

## Historical notes

- Do not attempt this entire backlog in one Codex run.
- Use one task or a small tightly related group per prompt.
- After each completed task, wait for user test/confirmation before updating completed-state docs.

---

## Historical block to classify under Epic Ref B — 2026-04-26 Priority Update: DB foundation after trade/auction/anti-abuse stages

The following block is preserved for Ref B4/Ref B11 classification only. It is not a live instruction to run before current feature work.


The database now contains new runtime foundations that Codex must treat as current schema after regenerating Supabase types.

## Immediate execution order update

Run these before broader gameplay work:

1. Regenerate Supabase `database.types.ts` and fix compile errors.
2. Replace legacy `hero_derived.hp` / Hero Points / old HP-as-points usage.
3. Ensure Character Points reads use `hero.character_points`.
4. Ensure Character Points changes go through backend/RPC/domain operations and write `character_point_ledger` where appropriate.
5. Treat `hero_derived` as transitional/legacy; do not add new dependencies to it.
6. Wire direct trade and auction frontend to existing RPCs.
7. Ensure inventory/armory hides or disables `locked_trade` and `locked_auction` items.
8. Connect Trade Routes/building bonus runtime to active trade slot limit; remove reliance on fallback config in normal gameplay.
9. Build staff/admin anti-abuse signal/case read views from existing tables.
10. Only after user confirms these work, update state docs as completed.

## High priority task — Character Points / legacy HP cleanup

Current database state:

- `hero.character_points` is current spendable Character Points balance.
- `hero.total_character_points_earned` tracks lifetime generated Character Points baseline.
- `character_point_ledger` stores append-only CP balance changes.
- `hero_derived.hp` no longer exists.
- `hero_derived.health` is combat health / hit points.
- `hero_resources` remains for resources like drachmas, materials and workforce.

Required work:

- regenerate database types;
- find all references to `hero_derived.hp`, `hp` as points, `hero points`, `Hero Points`, old PR/points wording;
- replace Character Point reads with `hero.character_points`;
- replace combat HP reads with `hero_derived.health` or runtime health resolver;
- update stat allocation/progression save flow to spend `hero.character_points` and write ledger through backend/RPC/domain logic;
- do not store Character Points in `hero_resources`;
- do not write CP ledger rows directly from UI click handlers.

Acceptance criteria:

- app compiles with regenerated DB types;
- no reference to removed `hero_derived.hp` remains;
- stat allocation uses Character Points correctly;
- Character Points and Health are not confused in domain models/UI.

## High priority task — Derived stats cleanup

Decision:

- `hero_derived` is transitional/legacy;
- derived stats are not authoritative persisted state for new systems;
- frontend may calculate previews;
- backend/RPC/domain actions calculate authoritative values from base stats, equipment, bonuses, formulas and context;
- reports/combat/trials store event snapshots of values used at the time.

Required work:

- audit all reads/writes of `hero_derived`;
- identify which screens/services rely on persisted derived stats;
- avoid adding new writes to `hero_derived` on equipment/stat changes;
- introduce or reuse runtime derived-stat resolver/calculator;
- do not remove remaining `hero_derived` columns until current usages are audited and replaced.

Acceptance criteria:

- clear report of existing usage;
- new trade/economy work does not depend on `hero_derived`;
- combat/progression screens still work after cleanup.

## High priority task — Direct trade frontend/runtime integration

Database/RPCs already exist:

- `create_player_direct_trade_offer(...)`
- `respond_player_direct_trade_offer(...)`
- `cancel_player_direct_trade_offer(...)`
- `reject_player_direct_trade_offer(...)`
- `confirm_player_direct_trade_offer(...)`

Frontend/domain requirements:

- direct trade is private between two heroes;
- both sides must be on same server and able to use trade;
- each side only selects own items;
- no access to another hero's private inventory;
- each side must offer item(s) and/or Character Points;
- CP-only for CP-only exchange should be blocked;
- show available CP as current CP minus active locks;
- show clear reason/status text for cancel/reject/expire/fail;
- after completing/cancelling/rejecting, refresh inventory, CP balance and active offers.

Acceptance criteria:

- player can create, respond to, cancel/reject and complete direct trade using RPCs;
- locked items are not usable/equippable;
- CP locks affect available CP display;
- completed trade creates transaction/ledger and can create anti-abuse signal/case when rules trigger.

## High priority task — Auction frontend/runtime integration

Database/RPCs already exist:

- `create_player_auction_listing(...)`
- `place_player_auction_bid(...)`
- `buy_now_player_auction(...)`
- `cancel_player_auction_listing(...)`
- `close_player_auction_listing(...)`

Frontend/domain requirements:

- one auction lists exactly one item;
- supported modes are bidding, buy now, bidding with buy now;
- duration is server-configured;
- seller can cancel only before bids;
- expired auction without bids returns item to `active`;
- buy now completes immediately;
- bids lock CP and outbid releases prior lock;
- show item/CP status clearly.

Acceptance criteria:

- player can list, bid, buy now, cancel eligible auction and close expired/ended auction through RPCs;
- item and CP locks display correctly;
- completed auction writes transaction/ledger and can create anti-abuse signal/case.

## High priority task — Anti-abuse signal/case UI integration

Database foundation exists:

- `anti_abuse_signals`
- `anti_abuse_cases`
- `anti_abuse_case_signals`
- `anti_abuse_case_participants`

Implemented signal types:

- `trade.high_cp_direct_trade`
- `auction.high_cp_sale`
- `trade.repeated_pair_transfers`

Requirements:

- staff/admin views must be server-scoped;
- list cases by server/status/grouping key;
- case detail should show linked signals, participants, related transaction/entity ids, metadata, reasons/descriptions;
- signals/cases are review aids, not automatic punishment;
- resolved/cancelled cases are historical and not reopened automatically.

Acceptance criteria:

- staff can view signal-generated cases;
- case list groups repeated signals correctly;
- linked transaction/entity ids are visible enough for review/debugging.

## High priority task — Trade Routes and active offer limit

Current database runtime uses `trade_active_offer_limit_fallback`.

Required work:

- connect active trade/auction offer limit to Trade Routes/building bonus runtime;
- both sides of direct trade must be able to use player trade;
- auction seller/buyer/bidder must be able to use player trade;
- direct trade and active auctions share the active-offer slot pool unless later config deliberately changes it.

Acceptance criteria:

- fallback is not the normal gameplay source once building runtime exists;
- active offer limit changes with Trade Routes/building level/config;
- frontend explains why trade/auction is unavailable.

## Update old backlog items

Older tasks mentioning generic public fixed-price listings should be interpreted as superseded.

Current direction:

- direct private trade is implemented first;
- auctions are implemented as the public market path;
- there is no separate public fixed-price listing mode outside auction buy-now.

---

# Epic Ref C — Roles, permissions and scoped moderation

Original source: Special Epic U0.

These tasks should be inserted after the current G-series work and before deeper H/admin/staff UI work, unless the user explicitly chooses another order. They depend on the U0-N4 DB foundation and regenerated Supabase types.

## Task Ref C1 (formerly U0-C1) — Frontend role usage audit

**Status:** Done / confirmed on 2026-04-28.

**Goal:** Audit current frontend role/staff assumptions.

**Scope:**

- Search for role assumptions such as `isAdmin`, `isOperator`, `isModerator`, `isServerStaff`, `globalRoleKey`, `serverStaffRole`, `canManageSelectedServer`.
- Classify whether each usage matches the U0 role model.
- Do not refactor broadly.

**Acceptance criteria:**

- Report lists exact files/components/services.
- Report identifies mismatches between global role and server staff assignment.
- No schema or behavior changes.
- Implementation note: audit identified `/admin` route guards, logged-in menu visibility, static admin navigation, and broad `ActiveServer.canManageSelectedServer` semantics as primary frontend role-boundary risks.

## Task Ref C2 (formerly U0-C2) — Staff gameplay access audit

**Status:** Done / confirmed on 2026-04-28.

**Goal:** Verify whether staff can enter normal gameplay on servers where they are assigned staff.

**Scope:**

- Active server/hero loading.
- Route guards.
- Gameplay entry points.
- Sandbox/test exceptions.

**Acceptance criteria:**

- Report explains where staff gameplay should be blocked or allowed.
- Sandbox exception is preserved.
- No broad implementation yet unless user requests it.
- Implementation note: audit confirmed `/hero/*` and `/game/*` lacked standard-server assigned-staff gameplay blocking; later U0 implementation added the central policy and gameplay boundary.

## Task Ref C3 (formerly U0-C3) — User/staff management UI audit

**Status:** Done / confirmed on 2026-04-28.

**Goal:** Identify existing or missing UI for global role assignment, server staff assignment and moderator scope assignment.

**Scope:**

- User search/selection.
- Assign global role flow.
- Assign server staff flow.
- Assign moderator scopes flow.
- Candidate disqualification display.

**Acceptance criteria:**

- Report identifies missing screens/services/components.
- No direct table writes proposed; future UI must use U0 RPC.
- Implementation note: audit confirmed no frontend staff management screen existed yet and future implementation must use staff RPC workflows/dictionaries instead of direct staff table writes.

## Task Ref C4 (formerly U0-C4) — Moderator scope UI spec

**Status:** Done / confirmed on 2026-04-28.

**Goal:** Design UI flow for assigning moderator scopes.

**Scope:**

- Admin/operator selects user and server.
- UI excludes/disables users with heroes on standard target server.
- UI shows staff-disqualifying history warnings.
- UI allows choosing moderator scopes.

**Acceptance criteria:**

- Spec uses DB dictionaries from `staff_permission_scopes`.
- No hardcoded scope list except transitional display fallback.
- No implementation unless user requests it.
- Implementation note: spec defined safe server/user selection, eligibility checks, moderator role assignment, DB-driven scope selection, required reason/notes and RPC-only submit.

## Task Ref C5 (formerly U0-C5) — Role-aware technical metadata visibility audit

**Goal:** Audit where technical keys/raw JSON are shown and whether visibility should depend on role/context.

**Acceptance criteria:**

- Player-facing technical key leaks are identified.
- Moderator-only views are checked against scope/context.
- Admin/operator metadata remains available as secondary information.

## Task Ref C6 (formerly U0-C6) — Staff/moderation navigation boundaries audit

**Status:** Done / confirmed on 2026-04-28.

**Goal:** Ensure navigation separates admin global tools, operator server tools, moderator scoped tools and player gameplay.

**Acceptance criteria:**

- Report identifies routes/menu items requiring role/scope guards.
- Moderator does not receive operator/admin tooling unless explicitly allowed.
- Implementation note: audit confirmed admin shell, sidebar, dashboard cards and admin tag-links needed one central route/navigation access policy rather than static prototype visibility.

## Task Ref C7 (formerly U0-C7) — Moderation actions UI foundation

**Status:** Done / confirmed on 2026-04-29 through U0-I8 and U0-I9.

**Goal:** Build frontend read/write surfaces for U0 moderation actions after types regeneration.

**Scope:**

- Create local warning/account warning/restriction/suspension/ban through `create_moderation_action`.
- Show required reason.
- Allow source entity id/type where relevant.
- Show moderation history through RPC.

**Acceptance criteria:**

- No direct writes to `moderation_actions`.
- UI uses `moderation_action_types` and `staff_permission_scopes` dictionaries.
- Moderator only sees actions allowed by scope.
- Operator/admin see history.
- Implementation note: `/admin/moderation-actions` uses DB dictionaries, creates actions only through `create_moderation_action`, reads visible/full history through moderation history RPCs, and uses server-scoped user/account and hero target search autocompletes.

## Confirmed Ref C implementation follow-ups (formerly U0 implementation follow-ups)

These implementation slices were executed after the U0 audit/spec tasks and are recorded here to preserve the completed task history.

- **U0-I1 — Central staff access policy model:** Done / confirmed on 2026-04-28. Added `resolveStaffAccessPolicy(...)` and exported policy types to separate global roles, selected-server staff assignment, management authority, moderation authority, testing access, player gameplay access and assigned-staff gameplay blocking.
- **U0-I2 — Staff gameplay boundary implementation:** Done / confirmed on 2026-04-28. `/hero/*` and `/game/*` now respect staff gameplay blocking on standard servers while preserving sandbox/testing exceptions and membership punishment handling.
- **U0-I3 — Admin route guard and sidebar boundary:** Done / confirmed on 2026-04-28. `/admin/*` is guarded by central staff access policy and normal players no longer see the admin shell entry.
- **U0-I4 — Admin dashboard cards and tag-link filtering:** Done / confirmed on 2026-04-28. Admin dashboard cards and reusable admin tag links now filter through central admin navigation access metadata.
- **U0-I5 — Staff management read models and services:** Done / confirmed on 2026-04-28. Staff management has typed domain/read services, server-scoped staff candidate search, RPC-only staff mutations and DB-backed roles/scopes.
- **U0-I6 — Staff management UI foundation:** Done / confirmed on 2026-04-28. `/admin/staff-management` provides selected-server staff assignment management through server-scoped candidate search and RPC-backed assignment/revoke flows.
- **U0-I7 — Moderator scope assignment UI:** Done / confirmed on 2026-04-29. Staff management supports moderator permission scope assignment using `staff_permission_scopes` labels and `set_server_staff_permission_scopes`.
- **U0-I8 — Moderation actions UI foundation:** Done / confirmed on 2026-04-29. `/admin/moderation-actions` supports server-scoped moderation actions through canonical moderation action RPCs.
- **U0-I9 — Moderation history target picker and full-history modes:** Done / confirmed on 2026-04-29. Moderation action create/history target fields use server-scoped user/account and hero autocompletes and support visible plus full target history modes.

# Epic Ref D — Explainability and impact previews

Original source: Special Epic UX.

## Task Ref D1 (formerly UX-C1) — Audit raw-key and unexplained UI exposure

**Goal:** Find places where UI exposes raw keys, enum values, JSON blobs, config names or audit/action/entity keys without human-readable label/description/helper text.

**Scope:** config governance, formula governance, audit logs, bonus admin, anti-abuse, building admin, item generation admin.

**Acceptance criteria:** report exact screens/components, classify missing DB metadata vs missing display use, and do not refactor broadly.

## Task Ref D2 (formerly UX-C2) — Audit missing gameplay impact previews

**Goal:** Find places where admin can change data but cannot see predicted gameplay effect.

**Examples:** item Normal/Quality/Outstanding preview, formula calculators, building level calculators, bonus/requirement previews.

**Acceptance criteria:** actionable report only; no broad refactor.

## Task Ref D3 (formerly UX-C3) — Add human-readable metadata display helpers

**Status:** Done / confirmed on 2026-04-29 through UX-I1.

**Goal:** Add shared helper/component pattern to render label, description/helper, and technical key as secondary metadata.

**Acceptance criteria:** label is primary; key is secondary; raw JSON is in technical details; no hardcoded gameplay dictionary explosion.

- Implementation note: shared `MetadataDisplay` was added and used in Moderation actions action-type details plus Staff management moderator scope options.

## Task Ref D4 (formerly UX-C4) — Add dictionary value display helper

**Goal:** Support human-readable labels/descriptions for enum/status/scope/type keys using DB metadata once available.

**Acceptance criteria:** raw enum keys are not primary UI text when dictionary metadata exists.

## Task Ref D5 (formerly UX-C5) — Config governance explainability pass

**Status:** Done / confirmed on 2026-04-29 through UX-I2.

**Goal:** Make config governance screens understandable: what the value changes, where it applies, and what risk/scope it has.

- Implementation note: config governance screens consume `get_config_definition_explainability(...)` for DB-backed scope/value/applicability explanations and keep technical JSON/schema as secondary legacy admin previews.

## Task Ref D6 (formerly UX-C6) — Formula impact preview calculators

**Status:** Done / confirmed on 2026-04-29 through UX-I4.

**Goal:** Add calculators showing formula output for supplied example inputs, e.g. building level 11 -> level 12 cost.

- Implementation note: `/admin/formulas` includes a formula impact calculator for enabled global/default target assignments, using existing formula runtime and expression preview.

## Task Ref D7 (formerly UX-C7) — Item generation quality impact preview

**Status:** Done / confirmed on 2026-04-29 through UX-I5.

**Goal:** Show Normal/Quality/Outstanding outcomes for item generation definitions, bonuses, requirements and drachma value.

- Implementation note: Balance quality tiers include DB-backed item quality impact preview through `get_item_quality_impact_preview(...)` and no hardcoded quality-tier list.

## Task Ref D8 (formerly UX-C8) — Building formula impact calculators

**Status:** Done / confirmed on 2026-04-29 through UX-I6.

**Goal:** Show predicted building cost/effect/production by selected level and formula assignment.

- Implementation note: Building admin includes a separate preview section combining local formula output with DB-backed district/cap progression context from `get_building_progression_preview(...)`.

## Task Ref D9 (formerly UX-C9) — Bonus and requirement impact preview

**Status:** Done / confirmed on 2026-04-29 through UX-I7 and UX-I7b.

**Goal:** Show resolved effect of bonus templates, entity bonuses, quality scaling, per-level intervals and requirements in human-readable terms.

- Implementation note: Building admin bonus rows show live local explainability and saved canonical bonus impact; building requirements now use a DB-driven central requirement editor backed by `requirement_definitions`, canonical entity requirement RPCs and `get_requirement_impact_preview(...)`.

## Task Ref D10 (formerly UX-C10) — Audit and anti-abuse explainability pass

**Status:** Done / confirmed on 2026-04-29 through UX-I3 and UX-I8.

**Goal:** Replace raw audit action/case/sanction keys as primary UI text with labels and explanations.

- Implementation note: Audit logs now show joined audit action/entity labels and collapsed technical JSON; anti-abuse decision explainability has DB-backed dictionary loading and display/projection helpers for sanction, report, declaration and signal types.

## Task Ref D11 (formerly UX-C11) — Smoke test UX notes integration

**Goal:** Ensure Codex smoke tests describe both click path and business/gameplay meaning of what is tested.

## Task Ref D12 (formerly UX-C12) — ux-ui-notes cleanup and prioritization pass

**Goal:** Periodically group and prioritize UX/UI notes by severity, quick wins, DB metadata needed, and redesign-needed items.

# Epic Ref E — Retrospective admin configurator explainability sweep

Original source: Epic UX-CFG.

Epic UX-CFG is a retrospective cleanup epic for admin/configurator/workflow screens that already exist in the project.

This epic exists because several older admin/configuration surfaces were implemented before the stricter “admin must understand what this config changes at runtime” standard was established. UX-CFG must not become a bucket for future epics. New feature epics must include their own configuration/explainability requirements directly inside their own scope.

Examples:
- Epic M must include its own combat opponent/admin configuration explainability.
- Epic N must include its own progression/formula/admin explainability where applicable.
- Future equipment, PvP, siege, guild, auction-rule or other epics must include their own configurator requirements if they introduce configurable systems.
- UX-CFG only revisits surfaces that already exist or were already implemented before this standard.

---

## Epic goal

Make existing admin/configurator/workflow screens understandable, DB-backed and safe to use.

For every included screen, an admin/operator/balancer must be able to answer:

- What am I configuring?
- Where is this value used?
- Does it affect one selected entity, all matching entities, a server, global config, reusable library content, workflow state, or only technical metadata?
- What runtime/gameplay/admin effect will this change have?
- Which DB dictionary/read model provides labels/descriptions/helper/admin text?
- Which RPC/governance path owns durable changes?
- What is safe to change and what requires a separate domain/DB decision?

---

## Epic scope

UX-CFG includes existing screens and surfaces only, such as:

- existing admin/configuration screens;
- existing balance/admin pages;
- existing dictionary inspectors/editors;
- existing governed workflow screens;
- existing staff/moderation/anti-abuse action surfaces;
- existing item/building/formula/bonus/configuration admin tools;
- existing player workflow screens only if they already contain unclear domain-critical workflow decisions, e.g. trade/auction locks and outcomes.

UX-CFG does not include future or not-yet-implemented systems.

---

## Out of scope

Do not use UX-CFG to define or defer explainability for future epics.

Out of scope unless already implemented and accepted before UX-CFG work starts:

- Epic M combat opponent/config tooling before M is accepted;
- Epic N progression/config tooling before N is accepted;
- equipment equip/unequip workflow;
- future PvP target/range/attack/siege configurators;
- future auction watcher/rule configuration;
- future guild/siege/politics systems;
- future reports/notifications config unless already implemented;
- full visual redesign of the application.

Visual polish is not the goal. Functional explainability is the goal.

---

## Global UX-CFG rules

Every Epic Ref E task must cover one route/page or one tightly related group of already-existing screens.

Do not ask Codex to “fix all admin configurators” in one task.

Each UX-CFG task must verify and, where needed, improve:

- DB-backed labels/descriptions/helper/admin text;
- section-level explanations;
- human-readable runtime/admin impact summaries;
- clear distinction between:
  - global configuration,
  - server-scoped configuration,
  - selected-entity-scoped configuration,
  - reusable library content,
  - workflow state,
  - technical/advanced metadata;
- raw keys/UUIDs shown only as secondary metadata;
- metadata JSON collapsed under Advanced / Technical;
- durable mutations routed through canonical RPC/governance paths;
- reason/audit/governance context where applicable;
- stale success/error guards for async workflows;
- smoke reports that explain domain meaning, not only click paths.

If DB dictionary/explainability text is missing or weak, Codex must report the exact table/key/field gap instead of hiding it with permanent hardcoded Angular copy.

If a screen needs a DB/content seed patch before UI can be made understandable, Codex must stop and report the blocker.

---

## Shared acceptance criteria for every UX-CFG implementation task

Every task under Epic Ref E must satisfy these criteria unless explicitly scoped out:

- Admin/operator can tell what the screen changes without knowing table names.
- Admin/operator can tell whether a value is global, server-scoped, selected-entity-scoped, reusable library content, workflow state or technical metadata.
- UI uses DB-backed labels/descriptions/helper/admin text where available.
- Raw keys/UUIDs are secondary metadata only.
- Metadata JSON is collapsed and not treated as primary gameplay configuration.
- Dangerous/durable actions show reason/audit/governance meaning.
- Mutations use canonical RPC/domain paths only.
- No new direct writes are introduced to governed/domain tables.
- Existing shared components/helpers/patterns are checked before adding new local components.
- Smoke report explains what the tested action means in gameplay/admin terms.
- Build passes.

---

## Task Ref E0 (formerly UX-CFG0) — Inventory existing admin/configurator surfaces

**Goal:** Build the exact inventory of existing screens that qualify for retrospective UX-CFG work.

**Scope:**

- Inspect current Angular routes/navigation/admin pages.
- Cross-check against already implemented/accepted areas:
  - config governance;
  - formula admin;
  - bonus/balance admin;
  - item generation/item catalog admin;
  - building/requirements admin;
  - audit/admin dictionaries/logs;
  - staff/access/moderation screens;
  - anti-abuse/case/sanction workflows;
  - existing trade/auction workflow pages if they contain unclear domain-critical actions.
- Classify each found screen as:
  - `configurator`;
  - `admin workflow`;
  - `read-only inspector`;
  - `player workflow with domain-critical state`;
  - `not UX-CFG`.
- For each included screen, list:
  - route;
  - domain;
  - current data sources;
  - mutation path, if any;
  - direct-write/RPC risk;
  - dictionary/explainability risk;
  - stale-guard risk;
  - smoke priority.

**Acceptance criteria:**

- Produces a concrete list of UX-CFG candidate screens.
- Does not modify UI unless explicitly approved.
- Does not include future/not-yet-implemented epic screens.
- Identifies which follow-up UX-CFG task should handle each screen.

---

## Task Ref E1 (formerly UX-CFG1) — Config governance explainability retrofit

**Goal:** Make existing config governance screens understandable as governed configuration workflow, not raw value editing.

**Scope:**

Existing config governance surfaces such as:

- config definitions;
- config values/effective values;
- config change sets;
- anti-abuse config if it is currently implemented through config governance.

**Must explain:**

- config definition is not the same as live value;
- default value vs active global value vs selected-server override;
- governance scope;
- global vs server-scoped config;
- draft / ready / applied / cancelled;
- value type and schema;
- public/internal/no changelog visibility;
- reason and audit meaning;
- why target for draft value entries is derived from governance scope and should not be a free user choice.

**Implementation requirements:**

- Keep direct mutation out of Angular.
- Continue using existing config governance RPCs.
- Clear stale success/error states when switching selected change set, server, definition or workflow action.
- Operational success can use toast; inline validation/RPC errors should be visible near the action.

**Acceptance criteria:**

- Admin can tell what value will change and where.
- Admin can tell whether change is global or server-scoped.
- UI does not imply live mutation before apply.
- Smoke explains draft creation, entry add, ready/apply/cancel in config-governance terms.

---

## Task Ref E2 (formerly UX-CFG2) — Formula admin explainability retrofit

**Goal:** Make existing formula admin tooling understandable as formula governance, not just expression editing.

**Scope:**

Existing formula surfaces such as:

- formula targets;
- formula library;
- formula assignments;
- local entity formula assignments;
- editor/preview/chart where already implemented.

**Must explain:**

- formula target = where a formula is used;
- formula = reusable expression;
- assignment = active binding between target and formula;
- local override vs global/default fallback;
- allowed variables;
- default test context;
- disabled/missing formula states;
- preview/chart is admin explainability, not authoritative durable runtime;
- random formulas are non-deterministic and need reroll/refresh behavior.

**Implementation requirements:**

- Use DB-backed target/formula labels and descriptions.
- Do not hardcode formula target semantics where DB text exists.
- Do not imply Angular preview result can be trusted for durable gameplay mutation.
- Show configuration errors clearly instead of silently falling back where the runtime should not.

**Acceptance criteria:**

- Admin can tell which formula is active for a target.
- Admin can tell which variables are legal and why.
- Admin can distinguish formula library entries from active assignments.
- Random formula preview is visibly non-deterministic.

---

## Task Ref E3 (formerly UX-CFG3) — Bonus/balance configurator retrofit

**Goal:** Make existing bonus/balance admin surfaces understandable under the canonical bonus model.

**Scope:**

Existing bonus/balance surfaces such as:

- bonus types;
- bonus scopes;
- bonus target categories;
- bonus targets;
- semantic bonus templates;
- entity bonuses where already exposed.

**Must explain:**

- bonus type vs target vs scope;
- template vs entity bonus value;
- value vs level interval;
- quality scaling rules;
- `scope`, not legacy `context`;
- category is organizational/filtering, not runtime behavior by itself;
- legacy bonus tables/columns are transitional only;
- where a bonus is consumed at runtime.

**Implementation requirements:**

- Use canonical bonus dictionaries and semantic `bonus_templates`.
- Do not use legacy `bonus_templates.target/type/scope/category` as source of truth.
- Raw keys may be shown as secondary metadata only.
- If canonical entity bonuses are missing where expected, report data/backfill blocker.

**Acceptance criteria:**

- Admin can tell what a bonus modifies and in which runtime scope.
- Admin can tell where value comes from and where it is applied.
- UI does not preserve hybrid/legacy model as target architecture.

---

## Task Ref E4 (formerly UX-CFG4) — Item generation and item catalog configurator retrofit

**Goal:** Make existing item generation/admin item configuration understandable.

**Scope:**

Existing item generation/item catalog admin surfaces such as:

- item generation qualities;
- bucket profiles;
- base types;
- bases;
- affixes;
- item generation previews;
- item catalog surfaces that already exist.

**Must explain:**

- item structure: quality + optional prefix + base + optional suffix;
- quality impact on value/power;
- bucket budget;
- Luck influence;
- base item value vs usefulness;
- affix value and effect;
- base type vs legacy slot;
- quality-scaled entity bonuses;
- preview vs real item creation;
- generated item does not become a player-owned item unless a DB/RPC workflow creates it.

**Implementation requirements:**

- Use DB-backed item generation dictionaries/read models.
- Do not treat legacy `slot` as source of truth where `base_type_key` exists.
- Do not confuse item value in drachmas with Character Points trade currency.
- Keep raw technical fields secondary.

**Acceptance criteria:**

- Admin can tell what affects generated item value.
- Admin can tell what affects generated item usefulness.
- UI explains preview/simulation vs actual item creation.
- No hardcoded permanent lists replace DB dictionaries.

---

## Task Ref E5 (formerly UX-CFG5) — Buildings, requirements and estate admin explainability retrofit

**Goal:** Make existing building/estate/requirement admin configuration understandable.

**Scope:**

Existing building and estate-related admin surfaces such as:

- building definitions;
- building requirements;
- district caps;
- building cost/time formulas;
- building bonuses;
- estate/building preview surfaces that already exist.

**Must explain:**

- building definition vs owned estate building;
- district availability;
- district cap override;
- `max_level = 0` means unlimited;
- requirements are not costs;
- costs/resources are spent through DB/RPC runtime;
- local formula override vs global/default formula;
- building bonuses through canonical entity bonuses;
- preview vs real construction/upgrade execution.

**Implementation requirements:**

- Use DB-backed building/requirement/formula/bonus labels where available.
- Do not make JSON requirements the primary surface if relational requirement tables exist.
- Do not imply preview mutates estate/building state.
- Critical building mutations must remain DB/RPC-owned.

**Acceptance criteria:**

- Admin can tell what affects availability, cap, cost, time and bonus.
- Requirements, costs and bonuses are visually/domain-wise distinct.
- Metadata JSON is not primary gameplay configuration.

---

## Task Ref E6 (formerly UX-CFG6) — Audit and admin evidence explainability retrofit

**Goal:** Make existing audit/evidence admin surfaces readable without raw JSON-first interpretation.

**Scope:**

Existing audit/admin evidence surfaces such as:

- audit action/entity dictionaries;
- audit logs;
- linked source/entity references where already displayed.

**Must explain:**

- audit log is governance/evidence/history, not gameplay report;
- audit action type vs entity type;
- actor/target/server scope;
- old/new JSON is diagnostic detail;
- metadata JSON is diagnostic detail;
- raw UUIDs should be copyable but not primary labels.

**Implementation requirements:**

- Use audit dictionaries for labels.
- Keep JSON collapsed by default.
- Make server/context visible when relevant.
- Do not convert audit logs into public/game reports.

**Acceptance criteria:**

- Staff can understand audit rows without opening JSON first.
- UI distinguishes audit logs from game reports and abuse reports.
- Raw ids remain available but secondary.

---

## Task Ref E7 (formerly UX-CFG7) — Staff, access and moderation management explainability retrofit

**Goal:** Make existing staff/access/moderation admin surfaces understandable and scope-safe.

**Scope:**

Existing staff/access/moderation surfaces such as:

- staff management;
- moderator scope assignment;
- moderation action foundations/history;
- admin route/sidebar/dashboard access surfaces that already exist.

**Must explain:**

- global role vs server staff role;
- selected-server scope;
- staff gameplay boundary;
- sandbox/testing exceptions;
- moderator scopes in human terms;
- staff-disqualifying history warning;
- reason requirements;
- why normal players cannot access admin/staff data.

**Implementation requirements:**

- Use DB-backed scope/action/type dictionaries where available.
- Do not expose raw scope keys as primary UX.
- Do not blur global admin/operator/tester access with selected-server staff assignment.
- Preserve server-scoped access logic.
- Keep player-facing and staff-facing data separated.

**Acceptance criteria:**

- Operator/admin can tell which access is global and which is server-scoped.
- Moderator scope UI is understandable without raw keys.
- Staff gameplay block and sandbox exceptions are clear.
- Reason-required workflows cannot submit without reason.

---

## Task Ref E8 (formerly UX-CFG8) — Anti-abuse and sanction workflow explainability retrofit

**Goal:** Make existing anti-abuse/case/sanction workflow surfaces understandable and safe.

**Scope:**

Existing anti-abuse/moderation workflow surfaces such as:

- anti-abuse cases;
- signals;
- player declarations;
- player abuse reports;
- sanctions;
- Character Point penalties;
- sanction item links;
- repeat-offender/history views.

**Must explain:**

- signal is review aid, not proof;
- case grouping is context, not automatic punishment;
- declaration provides context, does not disable anti-abuse;
- sanction item link is evidence/context, not confiscation/return;
- real confiscation/return requires a separate workflow;
- sanction vs CP penalty;
- verdict/status/status reason/verdict reason;
- staff-only vs player-facing fields;
- server scope.

**Implementation requirements:**

- Use DB-backed anti-abuse dictionaries.
- Use canonical anti-abuse decision RPC/domain services.
- Do not add frontend audit writes where DB workflow owns audit.
- Do not leak staff-only fields to player-facing models.

**Acceptance criteria:**

- Staff can distinguish evidence, decision, sanction and penalty.
- UI does not imply automatic punishment.
- Player-facing views do not expose staff-only/global account fields.
- Smoke explains domain meaning of decision/status/sanction actions.

---

## Task Ref E9 (formerly UX-CFG9) — Existing trade and auction workflow explainability retrofit

**Goal:** Make existing trade/auction player/admin workflow screens understandable where they already exist.

This task is included because direct trade and auction flows already exist and contain domain-critical state such as item locks, Character Point locks and historical transaction snapshots. It is not a future auction-rule/watchers task.

**Scope:**

Existing trade/auction surfaces such as:

- direct trade UI if already implemented;
- auction UI if already implemented;
- trade/auction history where present;
- item/CP lock state displays if present.

**Must explain:**

- Character Points are player-to-player trade currency;
- drachmas are vendor/system/building currency;
- direct trade vs auction;
- item lock states;
- Character Point locks/escrow;
- offer/listing/bid/buy-now/close/cancel status;
- transaction snapshots vs current item state;
- audit/anti-abuse signals are DB-owned and not UI-created.

**Implementation requirements:**

- Mutations must continue using trade/auction RPCs.
- No direct writes to trade/auction/lock/item ownership tables.
- No Angular-side anti-abuse signal creation as source of truth.
- History should use transaction snapshots where available.

**Acceptance criteria:**

- Player/admin can understand why item/CP is locked.
- UI does not imply drachmas are player trade currency.
- Historical trade/auction views do not reconstruct history from live item state when snapshots exist.
- Smoke explains lifecycle meaning, not only clicked buttons.

---

## Task Ref E10 (formerly UX-CFG10) — Existing admin navigation and configurator placement retrofit

**Goal:** Make existing admin navigation and route placement match domain intent.

**Scope:**

Existing admin navigation surfaces such as:

- admin sidebar;
- admin dashboard cards;
- admin route groups;
- tag links;
- entry points into already-existing configurators/workflow pages.

**Must explain/fix:**

- group tools by work intent, not raw table name;
- distinguish:
  - Game Balance;
  - Global Governance;
  - Server Operations;
  - Moderation / Anti-abuse;
  - Audit / Evidence;
  - Player/World tooling where already present;
- hide links that policy denies;
- do not show fake links to not-yet-existing future systems;
- make unavailable/pending tools clearly unavailable if placeholders exist;
- raw UUIDs/technical route ids must not be primary labels.

**Implementation requirements:**

- Reuse existing admin navigation access policy/helpers.
- Do not bypass route guards.
- Do not add future feature links as if implemented.
- Do not update status docs before user confirmation.

**Acceptance criteria:**

- Admin can find existing tools by domain intent.
- Navigation does not advertise denied tools to normal players.
- Configurators are not hidden under unrelated moderation/server/config sections.
- No fake/broken future links are introduced.

---

## Epic Ref E execution order

Recommended order:

1. Ref E0 — inventory existing screens.
2. Pick the highest-risk existing area from the inventory.
3. Run one UX-CFG task at a time.
4. If a task discovers missing DB dictionary/text/RPC, stop and prepare a DB/content patch before UI work.
5. After user confirms the UI works, update backlog/status docs only if explicitly requested or following the normal confirmed-work process.

Epic Ref E tasks should not be batched unless the user explicitly groups small related screens.

---

## Codex report requirements for Epic Ref E tasks

Every Epic Ref E report must include:

- exact route(s) touched;
- exact domain meaning of the screen/action;
- reused components/helpers/state/services;
- checked but not reused;
- new component/state/helper added and why;
- DB dictionaries/read models used;
- RPC/domain paths used for mutations;
- stale guard approach;
- build/test results;
- manual smoke result or pending manual smoke reason.

Required report format must follow current Mythborne Codex review standards:

- decision-ready summary;
- concrete changed files;
- verification;
- acceptance criteria mapping;
- pending manual smoke if needed.
