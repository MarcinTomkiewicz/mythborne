# Mythsworn — UI/UX Backlog v3

Status: canonical full UI/UX backlog / strict execution contract / implementation hardening edition  
Updated: 2026-05-20 — UI-EXPLORATION-9 step result surface accepted

Purpose: make UI/UX implementation promptable for Codex without allowing it to ignore existing utilities, flatten accepted prototype hierarchy, overuse `muted-text`, invent local SCSS systems, or treat accepted prototypes as vague inspiration.

This document is the canonical UI/UX execution contract for new UI implementation tasks. It is not the database source of truth, not a task-status document, and not a final design system. UI/UX tasks become complete only after explicit user acceptance.

---

## 0. Why this rewrite exists

The first `UI-SHELL-1` production attempt exposed a process failure:

- Codex implemented a functional shell instead of the visual anchors from `game-shell-v1.html`.
- Codex reported reuse, but did not reliably start from `docs/ui-ux/README.md` and the UI-CORE inventories.
- Codex rewrote existing utilities into SCSS, then moved them back into templates, instead of using a clear utilities-first rule.
- Codex treated accepted prototypes as general inspiration and did not preserve key anchors such as centered desktop brand, premium selected-server/prestige card, stacked resource chips, and label/value hierarchy.
- Codex overused `muted-text` because the task did not force a label/value/status audit.
- Codex flattened missing prototype-backed patterns into generic `mg-card` surfaces instead of reporting production-pattern gaps.

Primary rule:

> Codex may not treat an accepted prototype as generic inspiration. For prototype-backed tasks, Codex must preserve the listed visual anchors unless the task explicitly says otherwise or reports an approved production-pattern gap.

---

## 0.1. Single-file rule and relationship to v2

This document is the **single canonical UI/UX backlog** for Codex UI work. It contains both the strict v3 execution contract and the canonical task inventory in one ordered file.

There must not be a runtime dependency on a separate v2 backlog file or a separate “Part II” during normal Codex work. A reviewer may keep old files historically, but Codex should be able to work from this one file plus the current project/source documents listed below.

Practical rule:

- v3 hardening rules in sections 0–7 are mandatory for every UI task.
- The task inventory starts after the execution contract and is organized by domain.
- If a task seems too broad, split it into smaller implementation slices inside the current prompt while preserving v3 preflight, visual anchors, utilities-first discipline, muted-text audit, missing-pattern escalation and required reporting.
- If older detailed inventory wording conflicts with newer hardening rules, the newer hardening rules win.
- Do not re-run completed UI-CORE documentation tasks unless a real implementation task proves that a specific rule/inventory entry is missing.

This rewrite intentionally removes the “v3 hardening + Part II” model. The backlog is one file with one canonical task inventory.

---

## 0.2. Read early vs conflict precedence

### Read early

At the start of every UI task, Codex should read early:

1. `AGENTS.md` — execution rules, dirty tree discipline, generated types, reporting.
2. `docs/ui-ux/README.md` — map of UI-CORE guidance files and prototype archive rules.
3. This UI/UX backlog section for the task being attempted.

### Conflict precedence

When sources conflict, prefer:

1. explicit user instruction for the current task;
2. current live database / migrations / dump / generated types when UI touches DB/RPC/read models;
3. `current-decisions.md`;
4. `database-current.md`;
5. `project-context.md`;
6. `AGENTS.md`;
7. `docs/ui-ux/README.md` and task-specific UI guidance files;
8. this UI/UX backlog;
9. accepted prototypes as visual anchors constrained by current production sources;
10. legacy concept files only for history/flavor.

`database.types.ts` is read-only user-owned generated input. Codex may read it but must not edit, regenerate, patch, reformat or “fix” it unless the user explicitly asks for generated type work.

If a guidance file from this list is missing, Codex must report a warning and continue with available sources unless the user explicitly made the missing file a blocker.

---

# 1. Mandatory UI preflight

Codex must not code a UI task before filling this preflight.

| Field | Required answer |
|---|---|
| Task id / title | Exact backlog task being attempted. |
| User instruction | One-sentence summary of the current user ask. |
| Dirty tree | `git status --short`; list files and whether user pre-approved them. |
| README read | Confirm `docs/ui-ux/README.md` was read first for UI guidance map. |
| Guidance docs read | Exact docs read, e.g. style contract, inventory, utility audit, text semantics, prototype mapping, wrapper lookup. |
| Actual source files checked | Exact `src/scss/*`, component, template and shared files checked. |
| Prototype source | Archive name or `none`. |
| Required visual anchors | Bullet list copied from this backlog/task. |
| Existing utilities/patterns found | Exact classes/components/wrappers found. |
| Checked but not reused | Exact file/class/component and reason. |
| Missing production pattern | Name, prototype source, fallback/defer decision. |
| Data/read model source | RPC/service/read model or `not data-backed`. |
| Muted-text audit | Labels/helper only? Important values not muted? |
| Local SCSS plan | `none`, or exact reason why unavoidable. |
| Verification plan | tsc/build/spec/visual/manual smoke or blocker. |

A report that says only “docs checked” or “utilities checked” is insufficient. The report must name exact files/classes/patterns.

## README-first UI preflight

Before any UI/SCSS/template task, Codex must start from `docs/ui-ux/README.md`.

Codex must use README as the index of available UI-CORE contracts and then select task-relevant documents.

The preflight report must include:

1. `README checked: yes/no`
2. `UI-CORE docs selected for this task:`
3. `Why each selected doc is relevant:`
4. `Relevant existing classes/utilities/patterns found:`
5. `Existing classes/utilities/patterns checked but not used:`
6. `Missing pattern/gap:`
7. `New SCSS/classes needed: yes/no + why`

For UI-SHELL/topbar/sidebar tasks, Codex must explicitly check and report:
- `global-scss-shared-inventory.md`
- `utility-class-audit.md`
- `layout-section-pattern-cleanup.md`
- `shared-surface-patterns.md`
- `surface-badge-pattern-expansion.md`
- `icon-brand-registry.md`
- `prototype-production-mapping.md`

Codex may not write new SCSS classes for flex/grid/gap/padding/position/sizing until it has listed the existing utilities that were checked.

---

# 2. Utilities-first execution

## 2.1. Rule

If a utility exists, use the utility. Do not rewrite it in SCSS.

Examples:

- use `position-sticky`, `top-0`, `position-relative`, `overflow-y-auto`, `backdrop-blur-*`, `z-*` if they exist;
- use `flex-row-*`, `flex-col`, `gap-*`, `p-*`, `px-*`, `py-*`, `w-*`, `h-*`, `min-w-*` if they exist;
- use PrimeNG wrappers before local `.p-*` styling;
- use `tag-badge--*`, `mg-card`, `mg-section__title`, `mg-container`, `mg-grid`, grid/flex utilities and existing wrappers before inventing new classes.

## 2.2. Class budget interpretation

Class budget does **not** mean “hide utilities in SCSS.”

Class budget blocks:

- defensive utility piles added without reason;
- feature-local BEM systems that duplicate global utilities;
- repeated semantic stacks that should become a shared/global pattern;
- local visual systems for cards, badges, chips, buttons, nav, popovers or page headers;
- arbitrary spacing/sizing when a tokenized utility already exists.

Class budget does not block:

- deliberate use of documented utilities for layout composition;
- short utility stacks that are simpler than inventing a new pattern;
- temporary utility composition while a missing pattern is explicitly logged.

## 2.3. Utility shadowing blocker

Blocked:

```scss
.some-shell-class {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: map.get(v.$spacings, "md");
  padding: map.get(v.$spacings, "md") map.get(v.$spacings, "lg");
}
```

when equivalent utilities already exist.

Allowed:

```scss
.mg-game-shell {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 15rem minmax(0, 1fr);
  grid-template-areas:
    "topbar topbar"
    "sidebar main";
}
```

when no existing utility/pattern expresses the named shell grid.

## 2.4. Required utility report

Every UI implementation report must include:

```md
Utilities checked:
- position:
- flex:
- grid:
- spacing/gap:
- width/height:
- overflow:
- z-index/backdrop/shadow:
- surface/badge/text:

Utilities used intentionally in HTML:
- ...

SCSS kept because no utility/pattern exists:
- ...

SCSS removed/avoided because utility exists:
- ...

Pseudo-element or selector exceptions:
- ...
```

---

# 3. Prototype visual anchors

## 3.1. Prototype-backed task rule

For any task with an accepted prototype, Codex must produce this report section:

```md
Prototype visual anchors:
- matched:
- intentionally not matched:
- not matched because missing production pattern:
- user decision needed:
```

A required visual anchor that is not matched and not explicitly waived is a blocker.

## 3.2. Prototype CSS is not production source

Do not copy:

- `mb-*` class names;
- prototype CSS values;
- gradients, rgba palette values, shadows or raw dimensions;
- mock gameplay labels or hardcoded config values.

Do translate:

- layout hierarchy;
- composition;
- label/value/status hierarchy;
- semantic density;
- interaction model;
- visual emphasis level;
- required surfaces/chips/badges/nav affordances.

## 3.3. Missing pattern escalation

If a prototype needs a repeated visual pattern and production has no implementation yet, Codex must not silently replace it with a generic `mg-card` or random utilities.

Codex must report:

- missing pattern name;
- prototype source;
- existing fallback used for now;
- whether current task may add a global/shared pattern;
- whether it must be deferred to another UI task.

---

# 4. Text hierarchy and `muted-text`

## 4.1. Label/value/status hierarchy

- Labels may be `muted-text` or secondary.
- Helper text, metadata and timestamps may be muted.
- Values must be normal, strong, heading-color or semantic badge/pill.
- Important gameplay/admin values must not be muted.
- Statuses must use a semantic badge/status pattern, not muted text.
- Hero names, server names, item names, Prestige ranks, origin names and result titles must not be muted.
- Errors, blockers, verdicts, outcomes, action-critical requirements and destructive confirmations must not be muted.

Example:

```html
<span class="muted-text">Server</span>
<strong class="heading-color">Sandbox</strong>
```

Allowed: label muted, value strong.  
Blocked: both label and value muted.

## 4.2. Required muted-text audit

Every UI task touching templates must report:

```md
Muted-text audit:
- labels using muted:
- helper/metadata using muted:
- important values not muted:
- status not muted:
- names/ranks/outcomes not muted:
- exceptions:
```

---

# 5. Pattern escalation and scope control

## 5.1. Do not flatten prototype patterns into generic cards

If a prototype has a clear visual pattern such as selected-server context card, resource chip, origin carousel, item popover, report result banner, or combat log row, Codex must not flatten it into a generic `mg-card` and claim success.

Allowed fallback only if reported:

```md
Missing production pattern:
- name: selected-server-context-card
- prototype source: game-shell-v1.html
- current fallback: mg-card + utilities
- accepted for this task: yes/no
- follow-up task: UI-SHELL-3 or UI-SHELL-4
```

## 5.2. Cut aggressively

Codex must remove anything not needed for the current task.

Blocked additions unless explicitly in scope:

- guest/account flow inside game shell;
- public shell inside game shell;
- dashboard redesign inside shell foundation;
- resource chip pattern inside shell skeleton task;
- final nav pattern inside shell skeleton task;
- fake DB-driven values;
- direct table writes for gameplay workflows;
- local CSS systems created “just for this screen.”

If a feature is not needed for the acceptance criteria, cut it or report it as deferred.

---

# 6. Required UI report format

Every larger UI task must end with this report:

```md
Decision-ready report

Preflight:
- dirty tree:
- README read:
- guidance docs read:
- source files checked:

Reuse:
- reused:
- checked but not reused:
- new component/state/helper/pattern added:
- missing production patterns:

Prototype fidelity:
- prototype source:
- visual anchors matched:
- visual anchors not matched and why:
- copied from prototype CSS/classes: yes/no:

Utilities / SCSS:
- utilities checked:
- utilities used intentionally:
- SCSS kept because no utility/pattern exists:
- SCSS avoided because utility exists:
- local/component SCSS added:
- pseudo-element exceptions:

Text hierarchy:
- muted-text audit:
- important values not muted:
- statuses/badges:

Architecture/data:
- route page kept thin:
- state/workflow location:
- DB/RPC/read model source:
- stale guards:
- generated types untouched:

Verification:
- tsc:
- specs:
- build:
- grep/static checks:
- manual smoke / N/A reason:
```

Manual smoke must not be proposed if it is known to be impossible because of missing data, session, backend, or environment. Mark it `N/A`, `data-blocked`, `environment-blocked`, or `backend-blocked`.

---

# 7. Accepted prototype map and visual anchors

The prototype archive is visual reference only. `docs/ui-ux/README.md` maps the UI-CORE guidance files and prototype archive. Prototype implementation must translate visual anchors into production patterns/utilities/wrappers, not copy CSS.

## 7.1. Current accepted prototype families

| Prototype family | Current status | Production target |
|---|---|---|
| Game shell / dashboard shell | accepted direction | layout shell, topbar, sidebar, active nav, resource chips, selected server/prestige card |
| Hero statistics / stat allocation | accepted direction | focused stat allocation page |
| Armory / item popover | accepted direction | armory screen and shared item popover |
| Estate / buildings | accepted direction | estate screen and building cards/jobs |
| Exploration flow | accepted direction | exploration state/result/direction surfaces |
| Auction House | accepted direction | marketplace listings, bidding/buy-now |
| Direct Trade | accepted direction | private offer/response workflow |
| PvP vicinity | accepted direction | target selection only |
| Reports / combat reports | accepted direction | durable report detail/list/read models |
| Notifications | accepted direction | short notification archive/bell |
| Admin overview | accepted direction | admin IA hub |
| Account Entry Shell | accepted direction | public/account shell before server+hero game context |
| Hero Creation Origin Carousel | accepted direction | name + origin carousel + DB-backed bonuses/artwork |
| Trial minigames | accepted direction per minigame | manual trial renderer and minigame hosts |

Accepted onboarding prototype archive files:
- Account Entry Shell / server+hero context selector: `docs/ui-ux/prototypes/mythsworn_server_select.html`;
- Hero Creation Origin Carousel: `docs/ui-ux/prototypes/mythsworn_origin_screen.html`.

---

## 7.2. Naming contract

CTA label must describe the real domain action, not the technical click.

Preferred labels:

| Context | Preferred primary action |
|---|---|
| Exploration idle | `Start exploration` |
| Exploration pending | `Check result` / `Resolve step` |
| Trial blocker | `Resolve Trial` |
| Encounter blocker | `Resolve Encounter` |
| Statistics draft | `Save allocation` |
| Statistics reset | `Reset draft` |
| Equipment slot | `Equip` / `Unequip` |
| Item detail | `Inspect item` / `View item` |
| Vendor/system item conversion | `Scrap for drachmas` |
| Direct Trade create | `Create offer` / `Send offer` |
| Direct Trade response | `Respond` / `Confirm trade` / `Cancel offer` |
| Auction listing | `Create listing` |
| Auction bid | `Place bid` |
| Auction buy now | `Buy now` |
| PvP target selection | `Select target` |
| Reports | `Open report` |
| Notifications | `Open notification` / `Mark as read` |
| Admin config draft | `Create draft` / `Add entry` |
| Admin config apply | `Apply change set` |

Avoid `Sell` when player trade could be confused with vendor/system conversion. Use `Scrap for drachmas` for vendor/system item conversion.

---

# 8. UI-SHELL — game shell hardening and implementation sequence

This section replaces broad shell tasks with microtasks. The goal is to make Codex execute one narrow, reviewable step at a time instead of improvising a full shell/topbar/sidebar redesign.

## 8.0. UI-SHELL execution rules

These rules apply to every `UI-SHELL-*` task.

### Mandatory README-first lookup

Every task starts with `docs/ui-ux/README.md` and then the task-relevant UI-CORE docs. Codex must report concrete files/classes/patterns, not just `docs checked`.

For shell/topbar/sidebar work, check at minimum:

- `docs/ui-ux/README.md`;
- `docs/ui-ux/mythsworn-style-contract.md`;
- `docs/ui-ux/global-scss-shared-inventory.md`;
- `docs/ui-ux/local-scss-budget-checklist.md`;
- `docs/ui-ux/prototype-production-mapping.md`;
- `docs/ui-ux/utility-class-audit.md`;
- `docs/ui-ux/layout-section-pattern-cleanup.md`;
- `docs/ui-ux/text-utility-semantics.md`;
- `docs/ui-ux/shared-surface-patterns.md`;
- `docs/ui-ux/surface-badge-pattern-expansion.md`;
- `docs/ui-ux/icon-brand-registry.md`;
- `docs/ui-ux/icon-placeholder-mapping.md`.

### Default no-new-class rule

Default assumption: **adding a new CSS class is wrong**.

A new class is allowed only when all are true:

1. the task explicitly permits that exact class or pattern;
2. existing utilities/patterns were checked and listed;
3. the class represents a real reusable pattern or unavoidable structural shell gap;
4. the report explains why existing utilities are insufficient.

Creating a class that merely rewrites flex/grid/gap/padding/position/sizing utilities is a blocker.

### UI-SHELL source/prototype anchors

Shell tasks are backed by `game-shell-v1.html` / accepted shell prototype direction. Codex must preserve these visual anchors unless a task explicitly says otherwise:

- desktop topbar uses three-zone composition: left hero status, centered brand, right resources;
- brand is centered in desktop topbar unless explicit task says otherwise;
- fallback `M` brand mark is visible and visually distinct from a normal status badge;
- left topbar shows Health and XP/Level summary;
- right topbar shows Notifications/Staff when applicable plus Drachmas, Materials and Workforce;
- resources are compact stacked chips/cards: icon + label + strong value + per-hour secondary line;
- sidebar selected server/prestige block is a compact premium context card, not a flat generic row panel;
- selected server block uses label/value/status hierarchy: small label, strong value, status badge;
- Prestige is separated inside the same surface, with label, strong rank value and rank/tier badge;
- active sidebar nav uses a gold left inset or equivalent active affordance;
- hover/focus/active states use the accepted dark navy/gold/blue visual language;
- important values are not muted.

### Color and interaction rule

Shell is responsible for establishing the reusable base for:

- shell background/surface/border token usage;
- brand mark fallback;
- topbar resource chip fallback or later pattern;
- sidebar selected context surface;
- sidebar nav active state, hover state and focus-visible state;
- semantic status badge usage.

Color work must be token-level or global/shared-pattern-level. Do not add one-off component colors. If a color/hover/active need is repeated and no token/pattern exists, report a token/pattern gap and put it in the relevant microtask below.

### Standard report for every UI-SHELL task

Every task report must include:

```md
Preflight:
- README checked:
- UI-CORE docs checked:
- source files checked:
- dirty tree:

Lookup:
- existing utilities/classes/patterns used:
- checked but not used:
- missing patterns/gaps:

Scope control:
- files changed:
- new classes added:
- SCSS kept and why:
- local/component SCSS added:
- copied from prototype CSS/classes:

Visual anchors:
- matched:
- not matched:
- deferred:

Verification:
- tsc:
- build:
- focused specs:
- manual/browser smoke or blocked reason:
```

---

## UI-SHELL-00 — Shell README-first inventory, no code

**Goal:** produce a concrete lookup table for the shell before any implementation.

**Allowed changes:** none. Documentation/report only.

**Scope:**

- Read `docs/ui-ux/README.md` first.
- Read the mandatory UI-CORE docs listed in `8.0`.
- Inspect actual SCSS files, not only docs:
  - `src/scss/base/_flex.scss`;
  - `src/scss/layouts/_grid.scss`;
  - `src/scss/utilities/_gap.scss`;
  - `src/scss/utilities/_spacings.scss`;
  - `src/scss/utilities/_width.scss`;
  - `src/scss/utilities/_height.scss`;
  - `src/scss/utilities/_display.scss`;
  - `src/scss/utilities/_position.scss`;
  - `src/scss/utilities/_overflow.scss`;
  - `src/scss/utilities/_z-index.scss`;
  - `src/scss/utilities/_backdrop.scss`;
  - `src/scss/base/_surface.scss`;
  - `src/scss/base/_badges.scss`;
  - `src/scss/base/_typography.scss`;
  - `src/scss/abstracts/_custom-icons.scss`.
- Inspect current shell components:
  - `src/app/layout/components/app-shell/*`;
  - `src/app/layout/components/game-topbar/*`;
  - `src/app/layout/components/game-sidebar/*`;
  - notification bell components.

**Output table:**

| Shell need | Existing class/component/pattern | Source file | Use now? | Gap/follow-up |
|---|---|---|---|---|
| three-zone desktop topbar | ... | ... | yes/no | ... |
| flex row start/center | ... | ... | yes/no | ... |
| flex row end/center | ... | ... | yes/no | ... |
| flex wrap | ... | ... | yes/no | ... |
| full-width/flex fill | ... | ... | yes/no | ... |
| compact resource chip fallback | ... | ... | yes/no | ... |
| brand mark fallback | ... | ... | yes/no | ... |
| selected server/prestige card | ... | ... | yes/no | ... |
| active nav inset | ... | ... | yes/no | ... |
| nav hover/focus states | ... | ... | yes/no | ... |
| shell surface/background/border | ... | ... | yes/no | ... |

**Acceptance criteria:** no code changed; reviewer can approve the exact next microtask.

---

## UI-SHELL-01 — Current shell diff and rollback boundary, no code

**Goal:** identify which current shell changes are baseline, which are experimental UI-SHELL-1/2 leftovers, and what may be safely removed.

**Allowed changes:** none.

**Scope:**

- Compare current `app-shell`, `game-topbar`, `game-sidebar`, `_game-shell.scss` with accepted prior state or current git diff.
- Mark every shell class as one of:
  - existing baseline;
  - accepted UI-SHELL-1 skeleton;
  - experimental UI-SHELL-2;
  - should remove;
  - unknown/user decision.

**Acceptance criteria:** report lists exact remove/keep candidates before code changes.

---

## UI-SHELL-02 — Shell token and color anchor inventory, no code

**Goal:** explicitly map shell prototype colors/interactions to current theme tokens and gaps.

**Allowed changes:** none.

**Scope:**

- Check `src/scss/abstracts/_variables.scss` and `src/scss/themes/*`.
- Check surface, badge, text and interaction utilities.
- Map these visual needs:
  - dark navy shell background;
  - elevated topbar surface;
  - sidebar surface;
  - soft gold border;
  - active nav gold inset;
  - active nav hover gold/blue wash;
  - brand mark gold/navy medallion;
  - resource chip border/background;
  - selected server/prestige premium card;
  - focus-visible ring/outline.

**Output:** token/pattern gap table.

**Acceptance criteria:** color/hover/active needs are not left implicit; future color changes have owners.

---

## UI-SHELL-03 — Game shell skeleton ownership only

**Goal:** keep or implement only the shell grid/areas and route containment.

**Allowed files:**

- `app-shell.html`;
- `_game-shell.scss` only for named shell grid/areas and shell boundary styling when no utility exists.

**Allowed new classes:** none beyond existing `mg-game-shell`, `mg-game-shell__topbar`, `mg-game-shell__sidebar`, `mg-game-shell__main` if already used by the shell.

**Out of scope:** topbar content layout, brand mark, resources, selected server card, nav item pattern, dashboard.

**Acceptance criteria:** shell renders topbar/sidebar/main; no guest/account flow; no utility shadowing.

---

## UI-SHELL-04 — Remove game shell guest/account/public leakage

**Goal:** ensure game shell is only for active server + active hero context.

**Allowed files:** shell/sidebar templates and minimal TS if current template still branches into guest/login/create-character.

**Out of scope:** account entry shell and hero creation.

**Acceptance criteria:** no `Guest`, `Login`, `Create character` or account/public flow is rendered inside game shell; blockers/redirects remain explicit.

**Status:** Accepted on 2026-05-12. The shell/auth containment pass removes guest/login/create-character leakage from the authenticated game shell, keeps logged-in users with visible authenticated chrome/navigation, and hardens hard-refresh context restoration: `Auth.initialize()` shares the in-flight bootstrap, `ActiveServer` restores the preferred accessible server before default fallback, and `ActiveHero` restores the selected hero per `userId + serverId` before falling back to the first returned hero row. The sidebar server/hero switch copy is Polish. No DB/RPC/generated-type changes were made; manual smoke was user-side.

---

## UI-SHELL-05 — Main content containment and scroll boundary

**Goal:** stabilize `main` and route content containment without touching visual patterns.

**Allowed files:** `app-shell.html`, `_game-shell.scss` only if a structural shell gap exists.

**Rules:** use `mg-container`, width, overflow and padding utilities if they exist. Do not write manual overflow/padding/width in SCSS.

**Acceptance criteria:** main content scrolls, route content is contained, no feature layout is redesigned.

**Status:** Accepted on 2026-05-12. The shell host now has a narrow `mg-game-shell` viewport containment rule because no existing `100dvh` utility exists, while the route body stays inside `mg-container`. Scroll containment is applied to `main` only; the sidebar keeps its fixed shell column without a separate scrollbar. The task preserved the accepted shell zones from the prototype direction and did not redesign route content, topbar, sidebar or feature pages. Manual smoke remains user-side for stable topbar/sidebar and main-only scrolling.

---

## UI-SHELL-06 — Shell boundary surfaces and theme tokens

**Goal:** ensure topbar/sidebar/main boundaries use the global theme tokens established by UI-CORE-16 or current theme.

**Allowed files:** `_game-shell.scss`, theme files only if a token gap is explicitly approved.

**Scope:**

- topbar border/background;
- sidebar border/background;
- main background inheritance;
- no component-local color fixes.

**Acceptance criteria:** no copied prototype rgba values; no random one-off color declarations; every declaration maps to current token.

**Status:** Accepted with follow-up on 2026-05-12. Shell boundary styling now uses explicit `mg-game-shell__topbar`, `mg-game-shell__sidebar` and `mg-game-shell__main` structure classes instead of brittle structural selectors. The boundary declarations map to current theme tokens: `v.$color-bg`, `v.$color-bg-surface-elevated`, `v.$color-bg-surface` and `v.$color-border`; no `!important`, raw prototype colors, component-local color fixes, TS changes or specs were added. Final color/elevation matching remains deferred to UI-CORE-16 / later color pass, and manual smoke remains user-side.

---

## UI-SHELL-07 — Topbar visual-anchor mapping, no code

**Goal:** map topbar anchors to current HTML/components/utilities before coding.

**Allowed changes:** none.

**Required output:**

| Topbar anchor | Current implementation | Existing utility/component | Gap | Next task owner |
|---|---|---|---|---|
| left Health | ... | ... | ... | ... |
| XP/Level | ... | ... | ... | ... |
| centered brand | ... | ... | ... | ... |
| right notifications | ... | ... | ... | ... |
| staff bell | ... | ... | ... | ... |
| Drachma chip | ... | ... | ... | ... |
| Materials chip | ... | ... | ... | ... |
| Workforce chip | ... | ... | ... | ... |
| responsive wrap | ... | ... | ... | ... |

**Acceptance criteria:** no code; reviewer can approve UI-SHELL-08/09/10 ordering.

**Status:** Accepted on 2026-05-12. Completed as `docs/ui-ux/ui-shell-07-topbar-anchor-mapping.md`. The mapping separates prototype anchors from current production implementation, confirms `app-shell` as shell placement and `app-game-topbar` as the normal topbar content owner, and identifies gaps for guaranteed desktop brand centering, temporary `tag-badge` resource chips, staff fallback containment, and Health/XP/resource runtime semantics. No Angular, SCSS, TS, specs, generated types or runtime verification were added.

---

## UI-SHELL-08 — Topbar delegation boundary

**Goal:** decide and implement where topbar composition lives.

**Allowed files:** `app-shell.html`, `game-topbar.html`, `game-topbar.ts` only if imports are needed.

**Rules:**

- `app-shell` should own shell placement only.
- `app-game-topbar` should own topbar content composition when visible.
- Staff bell must be inside the right topbar zone or explicitly outside with centering proof.

**Out of scope:** resource redesign, brand mark styling, health/XP data changes.

**Acceptance criteria:** `app-shell` does not have parallel topbar children that break centering.

**Status:** Accepted with follow-up on 2026-05-12. `app-shell` now owns only shell/header placement and renders `app-game-topbar` with a focused `showHeroContent` ownership input. `app-game-topbar` owns normal topbar content and the staff-only fallback composition; `StaffNotificationBell` was removed from `app-shell`. No resource redesign, brand styling, Health/XP data changes, SCSS, routes, generated types or extra specs were added. Follow-up: `GameTopbar` still initializes hero/resource loading when `showHeroContent=false`; leave this alone unless a later focused cleanup scopes it.

---

## UI-SHELL-09 — Topbar three-zone layout with existing utilities first

**Goal:** implement the desktop left/center/right composition with the smallest possible production structure.

**Allowed files:** `game-topbar.html`; `_game-shell.scss` only if no existing utility/grid pattern can express the three-zone layout.

**Allowed new SCSS:** at most one structural `.mg-game-topbar` rule for three-zone grid, if and only if UI-SHELL-00/07 proved no exact utility/pattern exists.

**Blocked:** `mg-game-topbar__hero`, `mg-game-topbar__resources`, `mg-game-topbar__brand`, `mg-game-topbar__metric`, or any BEM alias for flex/gap/width.

**Acceptance criteria:** brand is centered relative to full topbar; left/right zones do not overlap.

**Status:** Accepted on 2026-05-12. `game-topbar.html` now uses existing `mg-grid`, `grid-cols-3`, `grid-cols-1-lg` and `grid-items-center` utilities for the normal hero topbar, replacing flex-based pseudo-centering without adding new SCSS, `.mg-game-topbar` or BEM zone classes. The three zones keep existing content/components and remove obsolete `flex-1` / `flex-none` class noise. Manual visual smoke remains user-side; any further responsive overlap/wrap refinement belongs to UI-SHELL-18.

---

## UI-SHELL-10 — Topbar notifications and staff placement

**Goal:** place player notification bell and staff notification bell in the right zone without affecting brand centering.

**Allowed files:** `game-topbar.html`, `game-topbar.ts` only for imports.

**Out of scope:** notification styling, unread count logic, staff access logic.

**Acceptance criteria:** player and staff notifications are right-zone items; app-shell fallback is only for hidden topbar or non-game context if still required.

**Status:** Accepted on 2026-05-12. Already satisfied by UI-SHELL-08/09 runtime changes: `app-shell` renders only `app-game-topbar`, while the normal hero topbar places both `app-notification-bell` and `app-staff-notification-bell` in the right grid zone before resource chips. The remaining staff-only fallback is owned by `game-topbar` and is not a parallel `app-shell` topbar. No notification styling, unread count logic or staff access logic was changed.

---

## UI-SHELL-11 — Health display semantics

**Goal:** display hero health honestly without implying unavailable current/max state.

**Allowed files:** `game-topbar.html`, `game-topbar.ts`.

**Rules:**

- If only derived/max health exists, label must not imply live current HP unless current HP is available.
- Do not create fake full bars.
- Use existing `app-game-bar` only when `value` and `max` are meaningful.

**Acceptance criteria:** health display semantics are clear and report names the data source.

**Status:** Postponed on 2026-05-12. The topbar must display `current / max` HP, but the current topbar read path only exposes derived/max health from `HeroDerivedStats.resolveActiveHeroDerivedStats()`. Until a canonical current-HP read model is scoped, the UI uses a temporary `max / max` fallback so the format stays correct without inventing live HP. Do not treat this as final Health semantics.

---

## UI-SHELL-12 — XP / Level progress semantics

**Goal:** display Level and XP progress from existing service/RPC/read model.

**Allowed files:** `game-topbar.html`, `game-topbar.ts`.

**Rules:**

- Do not hardcode `experienceMax = 1000` unless that is already the canonical service output.
- Prefer existing `Hero.getHeroExperienceProgress()` or DB-backed experience-to-next read path if current.
- If next threshold is missing, show XP as value only and report dependency.

**Acceptance criteria:** no new hardcoded progression semantics; XP bar appears only when max/threshold is real.

---

## UI-SHELL-12B — Topbar Health/XP visual pattern

**Goal:** align Health and XP/Level topbar chip/progress visuals with the accepted shell prototype without changing UI-SHELL-11/12 data semantics.

**Status:** Accepted on 2026-05-12. Health and XP/Level now use the shared `mg-chip` skin primitive while layout/stretching stays in the template through existing flex/gap/width utilities. `app-game-bar` was cleaned up to one smooth shared progress pattern driven by `value`, `max`, `type`, `compact`, `showLabel` and `showValue`; the unused segmented API/template/CSS path was removed after checking current call sites. XP progress uses theme-backed progress tokens and fills the XP chip width. Health keeps the UI-SHELL-11 temporary `max / max` display until a canonical current-HP read model exists. Resource chip polish remains for later UI-SHELL/UI-CORE tasks.

---

## UI-SHELL-13 — Resource data source and live amount boundary

**Goal:** confirm resource amounts/per-hour use current hero/resource read path and do not invent resource semantics.

**Allowed files:** `game-topbar.ts` and existing resource service only if necessary.

**Rules:**

- Drachma, Materials, Workforce are production resources.
- Character Points must not be shown as produced resource.
- Live amount calculation must reuse existing service/helper if one exists; if not, report why local calculation is still current behavior.

**Acceptance criteria:** data source is named; no resource meaning is hardcoded beyond existing resource type keys.

**Status:** Accepted on 2026-05-12. `game-topbar` keeps the current active-hero `hero_resources` read path for resource rows and the existing live amount behavior based on `amount`, `per_hour` and `updated_at`, after checking that no shared live-amount helper exists. Drachma, Materials and Workforce display definitions now live in shared `CORE_RESOURCE_DISPLAY_DEFINITIONS` under `core/config/resource-display.config.ts`, labels come from `resourceTypeLabel(...)`, shared resource display types live in `core/types/resource-display.types.ts`, and the obsolete `game-topbar.types.ts` split was removed. Character Points are not shown as a produced resource. No HTML/SCSS visual changes, services, DB/RPC/generated-type edits or broad resource architecture were added; manual smoke remains user-side.

---

## UI-SHELL-14 — Resource chip fallback using existing classes only

**Goal:** implement compact stacked resource display without adding a new resource-chip SCSS pattern.

**Allowed files:** `game-topbar.html` only unless TS resource display shape needs no new semantics.

**Allowed classes:** existing `tag-badge`, `tag-badge--*`, `mg-card`, flex/grid/spacing utilities, icon classes.

**Blocked:** `mg-resource-chip`, `mg-resource-chip__*`, local chip SCSS.

**Required visual anchors:** icon, label, strong value, per-hour secondary line.

**Acceptance criteria:** icons visible for `pi pi-cash`, `pi pi-marble`, `pi pi-workforce`; values strong; per-hour readable; layout does not break topbar.

**Status:** Accepted with follow-up on 2026-05-12 as fallback cleanup only. The existing resource fallback kept Drachma, Materials and Workforce visible with icon, label, strong value and rate using `tag-badge`/utility/icon classes, and the rate was no longer rendered as `muted-text`. This did not implement final resource visual styling, did not add `mg-resource-chip` classes or local SCSS, and did not change HTML structure beyond the text-hierarchy cleanup. Follow-up resolved by UI-SHELL-15, which replaced the fallback with accepted compact resource summaries.

---

## UI-SHELL-15 — Resource chips: prototype visual implementation

**Goal:** zaimplementować finalny wygląd topbar resource chips zgodnie z zaakceptowanym prototypem.

**Prototype anchors:**

- osobne pill/medallion resource chips po prawej stronie topbara;
- icon + label + strong value + rate;
- ciemne tło, subtelny gold border/glow, czytelna hierarchia label/value/rate;
- Drachma / Materials / Workforce tylko — bez Character Points.

**Allowed files:**

- `game-topbar.html`;
- global/shared chip/badge SCSS, jeśli istniejący pattern nie wystarcza;
- theme/token files, jeśli brakuje tokenów do odwzorowania prototypu;
- resource display config/types, jeśli trzeba użyć istniejących definicji.

**Rules:**

- nie używać `tag-badge` jako finalnego resource chip patternu, jeśli nie matchuje prototypu;
- jeśli brakuje właściwego patternu, utwórz lub rozszerz shared/global pattern, np. `mg-chip--resource`;
- nie tworzyć lokalnego component-only `mg-resource-chip` bez powodu;
- label może być mniej dominujący, value i rate muszą być czytelne;
- żadnych raw kolorów poza theme token definitions;
- żadnego kopiowania prototype classes 1:1.

**Acceptance criteria:**

- resource chips wizualnie przypominają prototyp, nie tylko zawierają te same dane;
- wartości i rate nie są `muted-text`;
- trzy resource chips mają stabilną szerokość/rytm i nie wyglądają jak zwykłe tagi;
- brak lokalnego SCSS w komponencie;
- raport wskazuje, które prototype anchors zostały odwzorowane.

**Status:** Accepted with user-side visual adjustment on 2026-05-12. Final direction is compact right-side topbar resource summaries, not heavy bordered chips/pills: Drachma, Materials and Workforce keep icon, readable label, strong value and rate without `tag-badge` resource fallback or `mg-chip--resource`. Resource data/semantics stay on the UI-SHELL-13 shared definitions/read path, no DB/RPC/generated-type or TS changes were added, and the shared `mg-resource-summary*` shell pattern remains global. User patch moved size/weight to existing typography utilities where practical; the small pattern-level exception is that `mg-resource-summary__content` owns `text-align: right` and `line-height: 1.05`, while label/value/rate classes own semantic colors only. Manual smoke remains user-side.

---

## UI-SHELL-16 — Brand mark fallback: prototype medallion implementation

**Goal:** doprowadzić brand mark `M` do kierunku prototypu, jeśli nadal nie istnieje dedykowany asset.

**Scope:**

- sprawdź istniejący icon/brand registry w preflight;
- jeśli brak dedykowanego brand assetu, utrzymaj fallback `M`;
- zaimplementuj fallback jako tymczasowy, ale wizualnie zbliżony do prototypu.

**Allowed files:**

- `game-topbar.html`;
- `_game-shell.scss` albo global brand/icon SCSS, jeśli istnieje właściwsze miejsce;
- theme tokens, jeśli konieczne.

**Rules:**

- `M` nie może wyglądać jak randomowy badge;
- jedna semantyczna klasa jest OK, np. `mg-brand-mark-fallback`;
- użyj tokenów, nie prototype CSS 1:1;
- nie ruszaj topbar layoutu poza koniecznym osadzeniem markera;
- jeśli istniejący pattern nie wystarcza, popraw pattern zamiast zostawiać zły fallback.

**Acceptance criteria:**

- widoczny gold/navy medallion direction;
- klasa opisana/raportowana jako temporary until real brand asset;
- brak rozbudowy brand systemu poza fallbackiem.

---

## UI-SHELL-17 — Topbar color/elevation pass against prototype

**Goal:** dopasować topbar kolorystycznie i powierzchniowo do prototypu.

**Prototype anchors:**

- bardzo ciemny topbar;
- delikatny gold/navy border;
- topbar wyraźnie oddzielony od contentu;
- brand/resource chips czytelne na tle topbara.

**Allowed files:**

- `_game-shell.scss`;
- theme/token files;
- `game-topbar.html` tylko jeśli trzeba poprawić klasy istniejących elementów.

**Rules:**

- najpierw popraw tokeny/shared patterny, nie hackuj pojedynczych komponentów;
- nie dodawać przypadkowych utility stacks;
- nie używać `!important`;
- nie stylować przez brittle selectors typu `.mg-game-shell > div > aside`;
- używać semantycznych shell classes, np. `mg-game-shell__topbar`;
- jeśli tokeny są złe, popraw tokeny.

**Acceptance criteria:**

- topbar kolorystycznie bliższy prototypowi;
- brak raw kolorów poza theme token definitions;
- brak `!important`;
- visual report porównuje: background, border, elevation, chip contrast.

**Status:** Accepted with user-side visual adjustment on 2026-05-12. The topbar now uses the semantic `mg-game-shell__topbar` shell pattern with a darker token-based gradient, the existing shell gold border, and user-adjusted elevation through the `shadow-shell` utility backed by dark-theme shadow tokens. Brand and resource summaries remain readable on the darker topbar; no brittle structural selectors, local component SCSS, TS/resource semantics, DB/RPC or generated-type changes were added. Manual smoke remains user-side.

---

## UI-SHELL-18 — Topbar responsive behavior implementation

**Goal:** topbar ma nie nachodzić na siebie i zachować czytelność na desktop/tablet/narrow widths.

**Allowed files:**

- `game-topbar.html`;
- `_game-shell.scss` tylko jeśli utilities nie wystarczą.

**Rules:**

- nie przebudowuj danych ani resource semantics;
- użyj istniejących grid/flex responsive utilities;
- nie rób mobile-perfect redesign;
- jeśli potrzebny jest structural class/pattern, zrób go jako layout pattern, nie visual hack.

**Acceptance criteria:**

- brand nie ucieka absurdalnie przez różne szerokości lewej/prawej strony;
- left/status, brand, resources nie overlapują;
- narrow layout pozostaje czytelny;
- manual smoke user-side pozostaje acceptance gate.

**Status:** Deferred / not implemented on 2026-05-12. The responsive-only utility patch was reverted after reviewer direction, restoring the accepted UI-SHELL-15/17 topbar state. Manual responsive smoke and any intentional topbar responsive fix remain deferred for a later user/reviewer-led pass.

---

## UI-SHELL-19 — Sidebar context card: prototype visual implementation

**Goal:** zaimplementować selected server / Prestige context card zgodnie z prototypem.

**Prototype anchors:**

- compact premium card;
- selected server label/value/status;
- separator między server i prestige;
- prestige label/rank/tier;
- label drugorzędny, wartości mocne;
- status badge semantic.

**Allowed files:**

- `game-sidebar.html`;
- minimal `game-sidebar.ts` tylko jeśli potrzebny display model bez nowej domenowej logiki;
- global SCSS/tokeny, jeśli istniejący card pattern nie wystarcza.

**Rules:**

- nie zostawiać `mg-card--legend`, jeśli wizualnie nie odpowiada prototypowi;
- jeśli brakuje context-card/elevated-card patternu, utwórz albo rozszerz właściwy shared/global pattern w ramach taska;
- nie tworzyć lokalnego sidebar-only card systemu, jeśli pattern powinien być globalny;
- nie używać `muted-text` dla server name, status, rank;
- brak raw prestige points w player-facing sidebar.

**Acceptance criteria:**

- karta wygląda jak kontekstowa/premium powierzchnia, nie zwykły formularzowy card;
- server name i prestige rank są strong;
- status jest semantyczny;
- separator/rytm carda zbliżony do prototypu.

**Status:** Accepted on 2026-05-12. Sidebar context now uses a shared/global `mg-context-card` pattern instead of local/sidebar SCSS or `mg-card--legend`. Hero, selected server/status and Prestige live in one compact context card with separators; the separate sidebar `M` block was removed. Server/hero/prestige values remain strong, status and rank use semantic badges, spacing uses existing spacing tokens, `letter-spacing: 0.15em` remains a label typography detail, and `v.$shadow-soft` remains until a semantic premium/elevated shadow variable exists. No TS, DB/RPC, generated-type or sidebar data semantics changes were added. Manual visual smoke remains user-side.

---

## UI-SHELL-20 — Sidebar context data and stale guard cleanup

**Goal:** upewnić się, że sidebar context card używa właściwych danych i nie pokazuje stale prestige/server state.

**Allowed files:**

- `game-sidebar.ts`;
- `game-sidebar.html` tylko jeśli trzeba skorygować display binding.

**Rules:**

- selected server z `ActiveServer`;
- Prestige z DB-backed public summary/read model;
- brak raw points w player-facing UI;
- stale guard przy async prestige zależnym od active hero/server;
- nie zmieniać wizualu, jeśli UI-SHELL-19 jest już przyjęty.

**Acceptance criteria:**

- data source i stale guard są jawne;
- zmiana hero/server nie zostawia starego prestige;
- brak lokalnych fallbacków maskujących DB/read-model brak.

**Status:** Accepted on 2026-05-12. Sidebar context data now uses `ActiveServer` for selected server/status and DB-backed `get_hero_prestige_public_summary` for Prestige. Async Prestige loading clears stale context on hero/server changes, guards returned rows against the current hero and selected server, and uses `takeUntilDestroyed` instead of manual subscription cleanup. Local `humanizeKey(...)` was removed in favor of `core/utils/normalize-text.humanizeKey`; `isGameplayMenuUrl(...)` / `isAdminMenuUrl(...)` remain local for now and should be revisited during sidebar IA/navigation cleanup. No HTML, SCSS, DB/RPC/generated-type or visual changes were added. Manual smoke remains user-side.

---

## UI-SHELL-21 — Sidebar nav: prototype grouping and visual rhythm

**Goal:** ustawić grupy nawigacji i rytm menu zgodnie z prototypem, bez tworzenia fake routes.

**Prototype anchors:**

- grupy: Hero / World / Operations;
- aktywny item wyraźny;
- itemy kompaktowe, czytelne, z ikoną;
- staff/admin odseparowane od player navigation.

**Allowed files:**

- menu config;
- `game-sidebar.html`;
- minimal `game-sidebar.ts` tylko dla display/group mapping.

**Rules:**

- bez fake links;
- route visibility zgodnie z access policy;
- nie dokładać lokalnego SCSS, jeśli utilities/pattern wystarczą;
- jeśli obecne menu config jest błędne, popraw config zamiast hackować HTML.

**Acceptance criteria:**

- sidebar IA przypomina prototyp;
- player/admin/staff routes są rozdzielone;
- aktywny item dalej działa;
- brak route bez istniejącego targetu.

**Status:** Accepted on 2026-05-12. Sidebar navigation IA is now grouped from `menu-config.ts` as Hero, World and Operations, with `GameSidebar` rendering groups from config while preserving existing access-policy filtering and route active behavior. `Guild` lives under World, `Reports` remains under World as the accepted current IA decision because `/game/reports` owns Reports/Notifications tabs, and all grouped links were checked against existing routes. No fake links, SCSS, final nav visual styling, DB/RPC or generated-type changes were added. Manual smoke remains user-side.

---

## UI-SHELL-22 — Sidebar nav item final pattern implementation

**Goal:** doprowadzić nav itemy do prototypowego wyglądu zamiast tymczasowego `mg-card` fallbacku.

**Allowed files:**

- `game-sidebar.html`;
- global/shared nav SCSS pattern, jeśli `mg-card` fallback nie wystarcza;
- theme tokens, jeśli brakuje tokenu.

**Rules:**

- nie używać `mg-card` jako finalnego nav itemu, jeśli wizualnie nie matchuje;
- jeśli brakuje właściwego nav item patternu, stwórz albo rozszerz shared/global pattern, np. `mg-shell-nav-item`;
- active, hover, focus-visible muszą być częścią patternu;
- nie kopiować prototype CSS 1:1;
- brak class soup w HTML.

**Acceptance criteria:**

- nav itemy przypominają prototypowe itemy, nie listę kart;
- hover/focus/active istnieją i są tokenizowane;
- active route ma gold emphasis/inset i nie jest color-only;
- HTML pozostaje czytelny.

**Status:** Accepted on 2026-05-12. The temporary `mg-card` sidebar nav fallback was replaced with the shared/global `mg-shell-nav-item` pattern in shell SCSS, while grouped IA remains owned by `menu-config.ts`. Active route state now has a visible left gold inset and hover/focus/active styling is centralized in the shell nav pattern rather than local sidebar SCSS. Sidebar menu icons use the accepted project/custom icon classes `pi pi-helmet`, `pi pi-skills`, `pi pi-hydra` and `pi pi-trade`. No local component SCSS, DB/RPC, generated-type or route semantics changes were added. Manual smoke remains user-side. Cleanup candidate: normalize the `menu-config.ts` import quote to project style when the file is next touched.

---

## UI-SHELL-23 — Sidebar active/hover/focus interaction pass

**Goal:** dopracować interakcje sidebar nav: active, hover, focus-visible.

**Allowed files:**

- global/shared sidebar/nav SCSS pattern;
- `game-sidebar.html` tylko jeśli brakuje required class/hook.

**Rules:**

- active state nie może być tylko kolorem tekstu;
- focus-visible musi być widoczny;
- hover nie może osłabiać active;
- użyć tokenów;
- pseudo-element jest dozwolony tylko dla rzeczy niewyrażalnych utility classes, np. left inset.

**Acceptance criteria:**

- active item ma wyraźny gold inset/emphasis;
- hover/focus są czytelne;
- selector scope jest bezpieczny;
- brak lokalnych jednorazowych kolorów.

**Status:** Accepted on 2026-05-12. `mg-shell-nav-item` now has a visible token-based `:focus-visible` ring while preserving the active left gold inset from UI-SHELL-22. Hover, focus and active styling remain centralized in the shared shell nav pattern in `_game-shell.scss`, with no HTML, IA, TS, DB/RPC, generated-type or local sidebar SCSS changes. `min-height: 100dvh` for `.mg-game-shell` is accepted as the current shell baseline because it avoids hard-locking sidebar/content height and keeps the page scrollable when sidebar content is taller than the viewport. Manual visual/a11y smoke remains user-side.

---

## UI-SHELL-24 — Sidebar icon visual and registry pass

**Goal:** ikonki w sidebarze mają odpowiadać kierunkowi prototypu i używać właściwego registry/patternu.

**Allowed files:**

- menu config;
- `game-sidebar.html`;
- icon registry tylko jeśli dodawany jest zaakceptowany missing key.

**Rules:**

- używaj custom icon registry keys, jeśli istnieją;
- missing icon keys raportuj zamiast zastępować emoji/prototype initials;
- sizing przez istniejące utilities/pattern;
- icon-only controls muszą mieć accessible label.

**Acceptance criteria:**

- ikonki renderują stabilnie;
- brak broken image icon;
- missing keys są wypisane;
- rozmiar/rytm ikon zbliżony do prototypu.

**Status:** Accepted on 2026-05-12 with user-side icon adjustments. Sidebar logged-in menu icons now use custom/project icon classes through the existing Prime/custom icon registry and render as `pi pi-*` icon entries instead of broken image assets. Accepted classes include `pi pi-helmet`, `pi pi-skills`, `pi pi-hydra`, `pi pi-shield-bash`, `pi pi-chest`, `pi pi-capitol`, `pi pi-trail`, `pi pi-overlord`, `pi pi-tied-scroll`, `pi pi-trade`, `pi pi-shop-bag` and `pi pi-d20`. Missing icon keys were resolved by existing registry entries plus the user-added `capitol` asset/key. No local sidebar SCSS, DB/RPC, generated-type, route or access-policy semantics changes were added. Manual smoke remains user-side.

---

## UI-SHELL-25 — Sidebar/topbar status badge visual semantics

**Goal:** uporządkować statusy/badge w shellu tak, żeby ważne wartości nie były muted i miały właściwą semantykę.

**Scope:**

- server status;
- membership/status chips;
- resource values/rates;
- staff/admin badges;
- notification count;
- selected/default/current hero markers.

**Allowed files:**

- shell/topbar/sidebar templates;
- minimal global badge/chip SCSS tylko jeśli istniejący variant nie wystarcza.

**Rules:**

- label/helper/timestamp mogą być muted;
- values/status/outcome/blocker/reason nie mogą być muted;
- używać semantic variants: success, warn, danger, info, active, disabled, pending, conflict;
- nie tworzyć nowych status variants bez potrzeby.

**Acceptance criteria:**

- muted-text audit przechodzi;
- ważne wartości są strong/semantic;
- badge hierarchy jest zgodna z prototypem.

**Status:** Accepted on 2026-05-12. Shell status/badge semantics were tightened in the touched sidebar/blocker surfaces: non-live or unavailable selected-server status now uses `tag-badge--warn` instead of muted, membership suspension timing is shown as a warning badge, and membership block reason is strong/primary text instead of muted helper copy. Topbar resource values/rates and existing notification unread/error badges already had semantic/strong treatment, while timestamps, helper copy and read/dismissed metadata remain muted intentionally. No new badge variants, local sidebar SCSS, DB/RPC, generated-type or route/access semantics changes were added. Manual visual smoke remains user-side.

---

## UI-SHELL-26 — Shell surface palette alignment

**Goal:** dopasować shell background, sidebar, cards i elevated surfaces do prototypowej dark navy/gold palety.

**Allowed files:**

- theme token files;
- global shell/card/chip/nav SCSS;
- templates tylko jeśli trzeba usunąć konfliktujące klasy.

**Rules:**

- najpierw popraw tokeny;
- potem globalne patterny;
- nie hackuj pojedynczych komponentów raw kolorami;
- nie używaj `!important`;
- nie nadpisuj całego app theme bez sprawdzenia wpływu na istniejące karty/formy.

**Acceptance criteria:**

- screenshot produkcyjny jest wyraźnie bliższy prototypowi kolorystycznie;
- topbar/sidebar/content cards używają spójnej powierzchni;
- gold border/glow są subtelne i tokenizowane;
- brak local rgba/hex poza theme token definitions.

**Status:** Accepted on 2026-05-12. Shell surface palette alignment now uses token-level/global shell changes: dark shell tokens were tuned toward the accepted navy/gold direction, `.mg-game-shell` consumes the theme background gradient, shell cards and context surfaces use shared shell surface tokens, and topbar/context/brand elevations consume `v.$shadow-shell`, `v.$shadow-premium` and `v.$shadow-brand-mark`. Raw shadow values remain in theme token definitions, while global shell/surface patterns consume `v.$shadow-*` variables. No templates, TS, local component SCSS, DB/RPC or generated-type changes were introduced. Manual visual smoke remains user-side.

---

## UI-SHELL-27 — Shell content container and card rhythm pass

**Goal:** content area ma mieć prototypowy rytm: szerokości, odstępy, card density, bez przypadkowego rozciągania.

**Allowed files:**

- `app-shell.html`;
- global container/card utilities;
- feature page HTML tylko jeśli shell task wyraźnie wskazuje konkretny anchor.

**Rules:**

- `mg-container` pozostaje głównym wrapperem route content;
- nie naprawiać każdego feature page osobno;
- nie dodawać defensywnych `min-w-0`, `w-100`, `h-full` bez konkretnej potrzeby;
- jeśli feature pages wymagają osobnego passu, zgłoś follow-up.

**Acceptance criteria:**

- main content nie wygląda jak przypadkowo przyklejony do lewej/prawej;
- card spacing i width są bliższe prototypowi;
- brak globalnego side effectu na admin/wide layout.

**Status:** Accepted on 2026-05-12 after centering check. `mg-container` already centers constrained content with `margin: 0 auto`, so no extra centering rule was needed. The shell content rhythm pass keeps `mg-container` as the route wrapper, adds only a tokenized `$shell-container-max-width` and scopes the wider shell content width to `.mg-game-shell__main > .mg-container`; existing `max-w-none` still overrides this for admin/wide routes. No feature page templates, TS, DB/RPC, generated types or local component SCSS were touched. Manual visual smoke remains user-side.

---

## UI-SHELL-28 — Notifications and staff controls visual placement

**Goal:** notification/staff controls mają siedzieć w prawym topbar zone i nie zaburzać brand centering.

**Allowed files:**

- `game-topbar.html`;
- notification/staff components tylko jeśli ich wrapper łamie layout;
- SCSS tylko w shared patternie.

**Rules:**

- nie robić dwóch równoległych topbarów;
- normal topbar content owner: `GameTopbar`;
- staff fallback w `GameTopbar`, nie w `AppShell`;
- nie zmieniać notification data logic.

**Acceptance criteria:**

- notifications/staff są w prawej strefie;
- brand pozostaje centered;
- controls nie wyglądają jak przypadkowe tagi.

**Status:** Accepted on 2026-05-12. Topbar notification and staff controls remain grouped in the right zone without changing brand/topbar/resource layout. Player and staff notification components remain separate domain components, while the shared `TopbarDropdownCoordinator` prevents overlapping open dropdowns and the shared `DropdownOutsideClose` directive closes the open dropdown on outside click. Dropdown rows are flatter and less noisy, with technical category/type metadata removed from topbar previews; `.dropdown-anchor` no longer uses `!important`, row padding uses spacing tokens, and the weak border-only unread highlight was removed because read/unread badges carry the state. No DB/RPC/generated-type changes or broad notification architecture rewrite were added. Manual smoke remains user-side.

---

## UI-SHELL-29 — Shell responsive visual pass

**Goal:** po zmianach wizualnych shell ma działać na szerokościach desktop/tablet/narrow bez overlapu.

**Allowed files:**

- shell/topbar/sidebar templates;
- global responsive utilities/pattern SCSS tylko jeśli brakuje patternu.

**Rules:**

- nie robić pełnego mobile redesignu;
- nie ukrywać ważnych akcji bez alternatywy;
- nie dodawać scrolla sidebarowi, jeśli UX kierunek tego nie chce;
- main content może scrollować, sidebar nie powinien dostać osobnego scrolla bez decyzji.

**Acceptance criteria:**

- topbar nie overlapuje;
- resource chips wrapują/degradują czytelnie;
- sidebar nie rozwala shell height;
- manual smoke user-side.

**Status:** Deferred / not implemented on 2026-05-12. The responsive-only template changes were reverted after reviewer direction, restoring the last accepted shell/topbar baseline. Responsive smoke and any intentional shell/topbar responsive fixes remain deferred for a later dedicated pass. No TS, SCSS, data-layer, DB/RPC, generated-type, visual styling or resource-summary changes were added.

---

## UI-SHELL-30 — Shell prototype comparison and targeted fix pass

**Goal:** porównać produkcyjny shell do prototypu po implementacji UI-SHELL-15–29 i wykonać drobne targeted poprawki.

**Allowed changes:**

- drobne template/class/token/pattern fixes;
- brak dużych refactorów;
- brak nowych systemów bez osobnego taska.

**Scope comparison:**

- topbar background/elevation;
- brand mark;
- Health/XP chips;
- resource chips;
- sidebar context card;
- nav items active/hover/focus;
- content surface rhythm;
- dark navy/gold/blue language.

**Acceptance criteria:**

- raport `matched / not matched / fixed / deferred`;
- drobne fixy w tym samym tasku są dozwolone;
- większe braki trafiają jako nowe konkretne follow-up tasks, nie ogólne “visual polish”.

**Status:** Accepted on 2026-05-12. The production shell was compared against the accepted shell prototype anchors after UI-SHELL-15-29. Matched anchors include topbar background/elevation, fallback brand medallion, Health/XP chips, compact resource summaries, sidebar context card, nav active/hover/focus states, content rhythm and the dark navy/gold/blue language. No runtime fix was needed in this pass. Deferred items are concrete: UI-SHELL-29 responsive smoke/fixes, canonical current-HP read model for true Health semantics, real brand asset replacement for fallback `M`, and user-side final manual visual smoke.
---


## UI-SHELL-31 — Shell cleanup: remove temporary and failed iteration code

**Goal:** wyciąć klasy, SCSS, wrappers i fallbacki pozostałe po iteracjach shell/topbar/sidebar.

**Allowed files:**

- shell/topbar/sidebar templates;
- global shell/chip/nav/card SCSS;
- config/types tylko jeśli są orphaned.

**Scope:**

- grep for `mg-game-topbar__*`, `mg-resource-chip*`, old shell aliases, old brand/nav classes;
- usunąć unused `host` layout classes;
- usunąć transitional classes/wrappers;
- nie usuwać prototype archive CSS ani docs.

**Acceptance criteria:**

- brak orphan production classes;
- brak nieużywanych imports/types;
- brak martwego HTML;
- build passes.

**Status:** Accepted on 2026-05-12. Cleanup removed the empty `game-sidebar.scss` production file and its obsolete `styleUrl` hook from `GameSidebar`. Static cleanup checks found no production `mg-game-topbar__*` or `mg-resource-chip*` classes. No templates, visual styling, TS behavior, DB/RPC or generated types were changed beyond removing the unused stylesheet hook.
---


## UI-SHELL-32 — Shell foundation acceptance report and known gaps

**Goal:** przygotować decision-ready raport po faktycznych implementacjach visual shell foundation.

**Allowed changes:** docs/report only.

**Report must include:**

- completed tasks;
- exact classes/patterns kept;
- global/shared patterns added;
- visual anchors matched;
- visual anchors still deferred;
- known UI bugs/gaps;
- DB/read-model dependencies;
- responsive/accessibility/manual smoke checklist;
- recommended next UI backlog tasks.

**Acceptance criteria:**

- reviewer/user może przyjąć shell foundation bez odtwarzania całej historii;
- gaps są konkretne, np. “resource chip hover state missing”, nie “needs polish”;
- status docs można zsynchronizować dopiero po akceptacji.

**Status:** Accepted on 2026-05-12. Decision-ready report added at `docs/ui-ux/ui-shell-32-foundation-acceptance-report.md`. The report records completed shell tasks, exact kept runtime classes/patterns, added global/shared patterns, matched visual anchors, deferred known gaps, DB/read-model dependencies, verification checklist and recommended next tasks. Shell foundation is now ready to leave in favor of dashboard work, with UI-SHELL-29 responsive work explicitly deferred.

---

# 9. UI-DASHBOARD — Hero dashboard and persistent player state

This section preserves dashboard work that was intentionally removed from `UI-SHELL-*`.

`UI-SHELL-*` owns only shell/topbar/sidebar/layout chrome.  
`UI-DASHBOARD-*` owns the `/hero/dashboard` route content.

Dashboard must be hero-centric. It is not a second sidebar, not a system portal, not an admin diagnostics page and not a fake task queue.

Accepted visual/source anchor:
- `docs/ui-ux/prototypes/mythborne_ui_shell_prototype.html`
- dashboard body direction: hero banner, base stats, derived stats, equipment preview, light home/vicinity context, compact persistent state;
- no heavy right sidebar on dashboard;
- no fake live metrics.

Global UI-DASHBOARD rules:

- Use active hero + selected server context.
- Use real read models/services only.
- Do not hardcode permanent stat/resource/equipment labels if DB/read models already expose them.
- Do not invent local dashboard state.
- Do not duplicate sidebar navigation.
- Do not add action cards only because a route exists.
- Important values, statuses, blockers and action-needed states must not be `muted-text`.
- Missing read model = blocker/gap report, not fake placeholder UI.
- Manual visual/gameplay smoke is user-side.

---

## UI-DASHBOARD-00 — Dashboard source and current implementation inventory

**Goal:** establish the exact production baseline before editing `/hero/dashboard`.

**Allowed changes:** none unless the current dashboard has obvious dead imports from an earlier failed implementation.

**Scope:**

- inspect current dashboard page/component/state/template/SCSS;
- inspect current active hero/server services used by dashboard;
- inspect available hero stats / derived stats / equipment / estate / exploration / report / notification read paths;
- inspect existing UI patterns already created during UI-SHELL:
  - `mg-game-shell`;
  - `mg-context-card`;
  - `mg-chip`;
  - `mg-card`;
  - `mg-resource-summary`;
  - `mg-shell-nav-item`;
  - `app-game-bar`;
  - global grid/flex/spacing/font utilities.

**Output must include:**

- current dashboard files;
- available real data sources;
- missing read models;
- obsolete dashboard cards/fallbacks to remove later;
- prototype anchors that can be implemented now;
- prototype anchors blocked by missing data.

**Acceptance criteria:**

- report identifies exact implementation targets;
- no visual redesign yet;
- no fake data proposed;
- no new dashboard architecture invented.

---

## UI-DASHBOARD-01 — Remove generic portal/dashboard noise

**Goal:** clean the current dashboard so it stops behaving like a duplicate navigation portal.

**Allowed files:** dashboard template/component only, plus imports cleanup.

**Scope:**

- remove generic route shortcut cards that duplicate sidebar navigation;
- remove fake counters, fake queues, fake “recommended tasks” and placeholder metrics;
- remove admin/debug/diagnostic snippets from player-facing dashboard;
- preserve any real hero/player data already used correctly.

**Rules:**

- Do not replace removed fake content with new fake content.
- Do not add new feature cards just because a feature route exists.
- Do not touch shell/topbar/sidebar.

**Acceptance criteria:**

- dashboard no longer duplicates sidebar menu;
- no fake live metrics remain;
- no raw admin/debug diagnostics remain;
- build passes.

---

## UI-DASHBOARD-02 — Dashboard page frame and card rhythm

**Status:** Accepted on 2026-05-13 as a desktop-first dashboard frame. The accepted dashboard uses the route `mg-container` full-width path, one full-width hero card with avatar | identity/progress | vertical context, direct non-duplicated `app-game-bar` Health/Experience rows, real conditional `/game/vicinity` Address, and separate Hero Stats / Derived Stats cards. No dashboard-local SCSS, fake Guild/Prestige/District/equipment/estate cards, generated type edits or responsive redesign were added. Mobile/tablet responsiveness, lower dashboard polish, Guild/Prestige/District context and equipment/estate/persistent widgets remain deferred to later tasks.

**Goal:** create the production dashboard layout skeleton matching the accepted prototype direction.

**Allowed files:** dashboard HTML and only existing/global SCSS if a missing shared pattern is genuinely required.

**Prototype anchors:**

- main dashboard content uses route `mg-container`;
- dashboard body starts with a hero banner;
- below it: stats/derived stats;
- then equipment preview;
- then light estate/persistent state context;
- no heavy right sidebar.

**Rules:**

- Use existing `mg-grid`, `mg-card`, flex/gap/spacing utilities first.
- Do not introduce a dashboard-local SCSS system.
- Do not implement data-heavy widgets yet; this task is layout frame only.
- Do not add placeholder values.

**Acceptance criteria:**

- dashboard has the correct production layout hierarchy;
- empty sections are not rendered as fake cards;
- class usage is minimal and justified;
- no local SCSS unless a real shared pattern gap is reported.

---

## UI-DASHBOARD-03 — Hero banner identity block

**Status:** Accepted on 2026-05-13 as the desktop-first hero banner identity/context pass. The accepted banner preserves the avatar | identity/progress | context structure, removes the extra `Current hero` label, keeps Health and Experience as direct non-duplicated `app-game-bar` rows, keeps Origin / Character Points / real conditional Address as the primary vertical context stack, and adds selected Server from the real `ActiveServer.selectedServer` source in a separate secondary context column. No fake Guild/Prestige/District/equipment/estate cards, dashboard-local SCSS, generated type edits or responsive redesign were added.

**Goal:** implement the top hero banner as the dashboard’s primary visual anchor.

**Data sources:**

- `ActiveHero` / active hero state;
- selected server from `ActiveServer`;
- origin data only if already available through an existing read model/service;
- current estate/address only if already available through current active hero/estate address path.

**Prototype anchors:**

- hero identity is dominant;
- hero name is the main heading;
- server/origin/address/Character Points/membership-style metadata are secondary badges;
- portrait/silhouette area exists, but must not invent a fake avatar system.

**Rules:**

- If real portrait/avatar asset is missing, use existing accepted placeholder/brand/portrait pattern, not a random new local illustration system.
- Hero name, origin, server and important values are not muted.
- Metadata labels may be muted; values must be strong or badge-like.
- Do not add action buttons here unless a real immediate action belongs in UI-DASHBOARD-04.

**Acceptance criteria:**

- dashboard immediately communicates “this is the current hero”;
- no fake origin/address/portrait data;
- no debug IDs unless explicitly player-safe and secondary.

---

## UI-DASHBOARD-04 — Primary hero action strip

**Status:** Accepted on 2026-05-13 as a desktop-first action strip. The dashboard now shows a small `Hero actions / Next steps` strip with real route CTAs only: neutral `Continue Exploration` to `/game/exploration`, conditional `Spend Character Points` to `/hero/attributes` only when unspent Character Points are available, and conditional `Open Vicinity` to `/game/vicinity` only when the real estate address exists. Armory and Reports actions remain omitted until scoped dashboard equipment preview or unread/action-needed report state exists. No TS/services, dashboard-local SCSS, new classes, fake data, generated type edits or responsive redesign were added.

**Goal:** provide a small set of immediate, hero-relevant next actions without duplicating the sidebar.

**Allowed actions only if routes/flows exist:**

- continue/start Exploration;
- spend Character Points / open Attributes when unspent CP exists;
- open Armory/equipment if equipment preview exists;
- open Mansion/Vicinity if estate context exists;
- open Reports only if there is a real unread/action-needed state.

**Rules:**

- No generic “go to every system” card grid.
- No action for missing or future features.
- No fake priority/recommendation algorithm.
- If action depends on state, use real state; otherwise use neutral route CTA.

**Acceptance criteria:**

- actions are few and useful;
- dashboard remains hero-centered;
- sidebar remains primary full navigation.

---

## UI-DASHBOARD-05 — Base stats card

**Goal:** render canonical hero base stats in a compact dashboard card.

**Data source:**

- existing hero stats read model/service/state.

**Rules:**

- Stat labels must come from existing DB-backed labels/read model if available.
- Do not hardcode the canonical stat list unless the current production stat service already exposes only keys and no labels.
- If stat labels are missing, report metadata gap instead of inventing permanent copy.
- Values must be strong and readable, not muted.
- Unspent Character Points may be shown as a badge if real.

**Acceptance criteria:**

- base stats render from real active hero data;
- no fake stat values;
- no local stat dictionary if a shared one exists;
- stat card visually resembles the prototype stat tile rhythm.

**Implementation note:** accepted on 2026-05-13. Base Stats render through `DashboardPageFacade.baseStatRows()`, pairing runtime `get_hero_dashboard_runtime_stats.stats_json` values with `StatsService.getStats()` labels and omitting missing runtime values instead of rendering empty tiles. The dashboard route template was split into thin presentational section components over the existing page facade, with the existing `d-block w-100` component-host pattern preserving the accepted desktop-first width rhythm. Display projections moved into focused dashboard mappers, and repeated dashboard value/label colors now use normal text color utilities from `src/scss/utilities/_text-colors.scss` instead of `heading-color` gradient or status text classes. No fake values, local dashboard SCSS, generated type edits or responsive/mobile redesign were added.

---

## Health State frontend integration — Dashboard/topbar shared vitals cleanup

**Status:** Accepted on 2026-05-13. Frontend Health display now consumes canonical DB-owned `current_health / max_health` through `HeroHealthState` and shared `ActiveHeroVitalsState`. Dashboard and topbar share the same active-hero vitals state for current Health, max Health, level and XP progress; dashboard runtime stats remains scoped to dashboard-only stats/derived/damage rows. Topbar no longer directly loads `HeroHealthState`, `HeroDerivedStats` or `Hero.getHeroExperienceProgress()`, and `DashboardPageFacade` no longer owns separate XP loading. No generated type edits, fake Health fallback, local current-HP calculation/reset, `hero_derived` dashboard/topbar runtime authority, local dashboard SCSS or responsive redesign were added.

**Deferred:** manual smoke for Vlad `152 / 152`, a non-full-health hero and combat/report health; optional later split if backend/read models stop returning health in dashboard runtime stats; optional partial-failure resilience for shared vitals if topbar resilience needs it.

---

## UI-DASHBOARD-06 — Derived stats card

**Status:** Accepted on 2026-05-13. Derived Stats now render as a compact full-width row list from dashboard runtime read-model rows instead of repeated stat cards. Damage rows use the DB-owned `damage_rows_json` display contract through the dashboard runtime mapper, with main-hand/off-hand labels coming from the runtime row label and values shown only when the runtime row exposes a damage display. Defense, Luck, critical chance, critical damage, evasion and attack count remain player-safe runtime rows. Row rhythm uses existing global utilities (`flex-row-between-end`, `border-bottom`, `pb-xs`, `color-muted`, `small-caps`, `uppercase`, `text-xs`, `color-heading`, `text-md`) and the Hero Stats / Derived Stats cards are height-aligned with existing height/host utilities. Item popover is intentionally deferred because the dashboard damage row contract exposes no stable item reference; future integration belongs to the shared UI-CORE-6 / UI-ITEMS item popover contract.

**Goal:** render current derived combat/progression stats without exposing raw debug formula internals.

**Data source:**

- existing `HeroDerivedStats` / derived stats read model/service;
- existing XP/level/progression read path where needed.

**Allowed values if available:**

- Health;
- Defense;
- damage range / attack profile summaries;
- Luck;
- critical chance/damage;
- other player-safe derived stats already exposed by the read model.

**Rules:**

- Do not compute durable formulas locally.
- Do not expose admin/debug formula internals.
- If a derived stat is missing from the read model, omit it and report the gap.
- Labels may be secondary; values must be strong.

**Acceptance criteria:**

- derived stats are real and player-safe;
- no frontend formula authority is introduced;
- missing derived stats are not faked.

---

## UI-DASHBOARD-07 — Equipment preview source check

**Goal:** determine whether the dashboard can render a real equipment preview now.

**Allowed changes:** none unless removing dead dashboard equipment placeholder code.

**Scope:**

- inspect existing armory/equipment/current loadout read paths;
- identify available equipped item slots;
- identify whether item names/quality/bonus snippets are player-safe;
- identify whether paperdoll-style slot layout can be rendered with current data.

**Output must say:**

- data source found;
- slots available;
- missing slots or labels;
- whether UI-DASHBOARD-08 can proceed;
- blockers/gaps if not.

**Acceptance criteria:**

- no fake equipment preview is created;
- no direct item/equipment table writes;
- no local fake equipment model.

---

## UI-DASHBOARD-08 — Equipment preview implementation

**Goal:** implement the dashboard equipment preview if UI-DASHBOARD-07 confirms real data is available.

**Status:** Accepted on 2026-05-13 as a reusable paperdoll-style equipment preview. The dashboard now renders real equipment slots from `HeroEquipment.getEquipmentSlots()` and current equipped items from `CurrentEquipmentState` through display-only `EquipmentPreviewSlotRow` rows, with empty slots shown only from confirmed slot definitions. The shared `app-equipment-preview` component uses `warrior.png`, config-driven stable `slotKey` placement, typed icon classes and dashboard-only `Open Armory` CTA via `isArmory=false`; Armory mode is prepared without action wiring. No fake slots/items, equipment mutation/direct writes, local dashboard SCSS, generated type edits or local item popover were added.

**Allowed files:** dashboard component/template; shared equipment display helpers only if already existing or clearly reusable.

**Prototype anchors:**

- paperdoll-style or slot-focused equipment preview;
- main hand / off hand visible;
- armor/jewelry slots visible if data exists;
- compact equipped item list or slot labels;
- CTA to Armory.

**Rules:**

- Use existing equipped item/read model data only.
- Empty slots may be shown only if the read model confirms the slot exists.
- Do not invent fake equipped items.
- Do not implement equipment mutation here.
- Do not directly query workflow tables if a canonical service/read model exists.

**Acceptance criteria:**

- equipment preview is real;
- missing slots are handled cleanly;
- Armory CTA exists;
- no gameplay mutation added.

---

## UI-DASHBOARD-09 — Home / estate / vicinity context card

**Status:** Accepted on 2026-05-13. Dashboard estate context uses real `EstateAddresses.getActiveHeroCurrentAddress()` data, with `estateAddress` computed from `currentEstateAddress`. Server context and Address stay in the hero banner; District and `/game/vicinity` row action were later merged into the UI-DASHBOARD-11 `World State` card. Nearby range remains deferred until a real read model exposes it, and no fake range, local dashboard SCSS or generated type edits were added.

**Goal:** add light world context without turning dashboard into Mansion/Vicinity.

**Data sources:**

- active hero estate/address read path;
- selected server;
- current district/address;
- current mansion/building state only if already available.

**Prototype anchors:**

- estate/address/district context;
- optional CTA to Vicinity or Mansion;
- compact, secondary dashboard section.

**Rules:**

- Dashboard must not duplicate Mansion page.
- No local address generation.
- No fake nearby range unless generated by existing read model.
- No building control actions here unless explicitly scoped later.

**Acceptance criteria:**

- player sees where the hero currently belongs in the world;
- no fake vicinity data;
- clear CTA to the correct route if route exists.

---

## UI-DASHBOARD-10 — Persistent state source matrix

**Status:** Accepted on 2026-05-13. The source matrix lives at `docs/ui-ux/ui-dashboard-10-persistent-state-source-matrix.md`. UI-DASHBOARD-11 may implement only states with dashboard-safe read sources; active exploration, active step and challenge handoff remain blocked/conditional until a dashboard-safe current exploration difficulty source exists. Dashboard must not guess or hardcode `difficultyKey`, reuse page-local `ExplorationOverviewState` selection as a fallback, or show fake Nearby range values.

**Goal:** define which persistent states can be shown now using real sources.

**Allowed changes:** none unless deleting fake persistent state placeholders.

**Candidate sources:**

- active exploration / pending exploration result;
- active estate building job;
- unread reports / notifications;
- current Trial/Encounter/Combat handoff;
- active exploration effect;
- other durable states explicitly backed by DB/RPC/read model.

**Output must include table:**

- state;
- read model/service source;
- hero/server scoping;
- stale-clear rule;
- action/CTA allowed;
- implementation status: implement now / blocked / defer.

**Rules:**

- Missing source = dependency/gap, not placeholder.
- No fake countdowns.
- No local-only production state.

**Acceptance criteria:**

- dashboard persistent state work is grounded in real read models;
- no speculative widget list is approved.

---

## UI-DASHBOARD-11 — Persistent state container implementation

**Status:** Accepted on 2026-05-13. `World State` is a compact row-list placed under Derived Stats in the right dashboard column. It is backed by approved sources: estate building job with DB-owned `remainingSeconds` countdown display, trials remaining from the latest permission-safe `hero_daily_action_counters` row scoped by hero/server/`action_kind = trial`, active state from `get_hero_pending_combat_effect_state(p_hero_id)`, unread reports, and District/Vicinity rows from `EstateAddresses.getActiveHeroCurrentAddress()`. Active exploration, active step and challenge handoff remain deferred until a dashboard-safe difficulty/current exploration context source exists; notifications remain out of dashboard scope.

**Goal:** implement the shared dashboard area for real persistent states.

**Allowed files:** dashboard template/component; global/shared pattern only if needed and reusable.

**Rules:**

- Render only widgets that have real sources from UI-DASHBOARD-10.
- Empty state may say there is no current persistent state only if that is true from loaded sources.
- Do not add fake tiles for blocked/deferred states.
- Stale state clears on active hero/server change.

**Acceptance criteria:**

- persistent state area exists;
- no fake persistent state appears;
- important/action-needed states are visually clear;
- data loading/empty/error states are clear.

---

## UI-DASHBOARD-12 — Exploration persistent state widget

**Status:** Deferred / cancelled on 2026-05-14 by user direction. Active exploration, pending step and challenge handoff remain blocked by the missing dashboard-safe current exploration difficulty/source; do not implement this as a separate dashboard widget until that source exists.

**Goal:** show current Exploration state if the current read model supports it.

**Allowed states:**

- active exploration;
- pending movement/result;
- Trial/Encounter/Combat handoff returned by exploration state;
- active effect if DB returns it.

**Rules:**

- Use canonical exploration state/read model.
- Do not infer rewards from latest armory/report/etc.
- Do not create local timers unless display-only and DB owns time.
- CTA must go to `/game/exploration`.

**Acceptance criteria:**

- widget appears only when real exploration state exists;
- stale result/reward/combat state is not shown for the next step;
- CTA is clear;
- no fake exploration queue.

---

## UI-DASHBOARD-13 — Estate building job persistent state widget

**Status:** Deferred / cancelled on 2026-05-14 by user direction. The real estate job row is already covered inside the accepted UI-DASHBOARD-11 `World State` container, so no separate widget task should be implemented now.

**Goal:** show active estate building job if current settled mansion/estate runtime exposes one.

**Rules:**

- Use existing settled estate/mansion runtime read path.
- Countdown/progress is display-only; backend owns job timestamps.
- No start/cancel/build action here.
- CTA goes to Mansion if route exists.

**Acceptance criteria:**

- active building job appears only when real;
- completed/no-job state is handled without fake urgency;
- stale state clears when active hero/server changes.

---

## UI-DASHBOARD-14 — Reports/notifications attention widget

**Status:** Deferred / cancelled on 2026-05-14 by user direction. Unread reports are already covered by the accepted UI-DASHBOARD-11 `World State` row, while dashboard notifications remain deferred to avoid duplicating the topbar inbox.

**Goal:** show compact attention state for unread/action-needed reports or notifications if existing read models expose it.

**Rules:**

- Use existing notification/report unread count or list services.
- No heavy inbox duplication on dashboard.
- No staff/admin notification content on player dashboard.
- CTA goes to Reports/Notifications route if available.

**Acceptance criteria:**

- dashboard shows attention only when real;
- no admin/staff leakage;
- no fake notification/task count.

---

## UI-DASHBOARD-15 — Trial/Encounter/Combat handoff widget

**Status:** Deferred / cancelled on 2026-05-14 by user direction. Durable Trial/Encounter/Combat handoff stays deferred until a player-safe dashboard read model exposes that continuation state.

**Goal:** show blocking gameplay handoff only if backend/read model exposes a durable handoff state.

**Allowed examples:**

- unresolved Trial offer;
- active Manual Trial session;
- unresolved Encounter/Combat continuation;
- live combat session awaiting player action.

**Rules:**

- If current DB/RPC/read model does not expose this as player-safe dashboard data, report blocker/gap.
- Do not infer from route history.
- Do not inspect raw admin/debug tables.
- CTA must route to the canonical continuation screen.

**Acceptance criteria:**

- widget never appears from guessed frontend state;
- if missing, explicit follow-up DB/RPC/read-model dependency is documented.

---

## UI-DASHBOARD-16 — Dashboard text hierarchy and muted-text audit

**Interim note (2026-05-14):** Dashboard presentation/order cleanup keeps source-backed values out of muted styling, plain dashboard row links use global base link styling, Derived Stats render display-contract tone classes from `display_stats_json`, Luck is pinned to the final Derived Stats row while remaining neutral through `colorableFinalValue=false`, and World State rows render in the reviewed order: Trials remaining, Active state, Building job, District, Vicinity view, Unread reports. This is not UI-DASHBOARD-16 completion/acceptance. No dashboard-local SCSS, local stat math, display-string parsing, generated type edits or DB/RPC changes were added.

**Goal:** clean dashboard label/value/status hierarchy.

**Scope:**

- hero name;
- server/origin/address;
- Character Points;
- stats;
- derived stats;
- equipment names;
- persistent states;
- CTAs.

**Rules:**

- labels/helper/timestamps may be muted;
- values/statuses/outcomes/action-needed states are strong or semantic;
- hero/item/rank/state names are not muted;
- empty states are calm but readable.

**Acceptance criteria:**

- no important dashboard value is muted;
- no action-needed state is visually hidden;
- text hierarchy is consistent with shell/topbar/sidebar patterns.

---

## UI-DASHBOARD-17 — Dashboard visual prototype alignment pass

**Status:** Checked on 2026-05-14; decision changed and accepted as-is during implementation. The dashboard visual direction remains the current production composition using existing global utilities/shared patterns. No extra prototype-alignment patch is required here; future dashboard content may add other statistic surfaces, but Character Points history is not part of the dashboard direction.

**Goal:** make the dashboard visually approach the accepted prototype using production patterns.

**Scope:**

- hero banner surface;
- stats cards;
- derived stat rows;
- equipment preview;
- estate/persistent-state cards;
- CTA hierarchy;
- card rhythm and spacing.

**Rules:**

- This is not a no-code comparison task.
- If a visual mismatch is fixable with existing tokens/utilities/shared patterns, fix it.
- If a repeated pattern is missing, add one shared/global pattern only if clearly justified.
- Do not copy `mb-*` classes or prototype CSS directly.
- Do not add local dashboard SCSS unless no global/shared pattern can own it.

**Acceptance criteria:**

- production dashboard visibly resembles the accepted dashboard direction;
- remaining differences are named as concrete follow-up tasks;
- no generic “polish later” bucket.

---

## UI-DASHBOARD-18 — Dashboard stale state and active hero/server switch hardening

**Status:** Accepted on 2026-05-14. Dashboard data now reloads on active hero/server context changes, clears existing dashboard cards before the new load resolves, and guards hero, runtime stats, estate address, equipment slot and persistent-state responses with the active hero/server context, including stale estate address success/error after selected server changes. Character Points History was removed from the dashboard composition because CP ledger history is no longer a dashboard widget. No DB/RPC changes, generated type edits, local stat math, display-string parsing, global store or dashboard-local SCSS were added.

**Goal:** ensure dashboard does not show stale hero/dashboard data after active hero or selected server changes.

**Scope:**

- dashboard data loads;
- stats/derived/equipment/estate/persistent state widgets;
- error/loading state cleanup.

**Rules:**

- stale success must not overwrite current hero/server context;
- stale error must not show after context switch;
- state clears when active hero/server changes;
- use existing state/stale guard patterns;
- do not add broad test suites; add only focused regression if TS/state changed.

**Acceptance criteria:**

- switching hero/server does not leave old dashboard cards visible;
- async dashboard reads are guarded;
- no local global store is introduced.

---

## UI-DASHBOARD-19 — Dashboard cleanup and orphan removal

**Status:** Accepted on 2026-05-14. Dashboard cleanup removed the obsolete `mapDashboardDerivedDisplay` / `derivedDisplay` legacy path and the dashboard mapper no longer imports `IHeroDerived`. The remaining dashboard presentation uses `display_stats_json` rows plus the separate vitals-backed `healthDisplay`. Focused specs, `npx tsc --noEmit` and `npm run build` passed; manual smoke remains user-side/pending.

**Goal:** remove leftover dashboard code from failed iterations.

**Scope:**

- dead template blocks;
- unused imports;
- obsolete dashboard-only helpers;
- temporary class names;
- fake fixtures in production code;
- unused local SCSS.

**Rules:**

- Do not remove shared patterns still used by shell/topbar/sidebar.
- Do not delete prototype archive files.
- Do not update status docs before acceptance.

**Acceptance criteria:**

- dashboard production code is lean;
- no old dashboard portal/action-card leftovers remain;
- build passes.

---

## UI-DASHBOARD-20 — Dashboard final acceptance report

**Status:** Completed on 2026-05-14 by acceptance decision. Dashboard finalization is closed for this UI-DASHBOARD pass; manual smoke remains user-side/pending before commit handoff. Next scope moves to UI-ACCOUNT.

**Goal:** produce final decision-ready dashboard report.

**Allowed changes:** none.

**Report must include:**

- implemented dashboard sources and widgets;
- data sources used;
- deferred read-model dependencies;
- visual anchors matched;
- visual anchors intentionally not matched;
- known UI follow-ups;
- stale guard status;
- manual smoke checklist.

**Acceptance criteria:**

- dashboard can be accepted without rereading UI-SHELL history;
- remaining items are concrete and actionable.

<!-- This section preserves the former `UI-SHELL-2 — Dashboard hero-centric layout` and `UI-SHELL-5 — Persistent state widget boundary` scopes.

The `UI-SHELL-00–32` microtasks above replace shell/topbar/sidebar implementation only. They do **not** delete dashboard or persistent-state work. -->

<!-- ## UI-DASHBOARD-1 — Dashboard hero-centric layout

**Goal:** keep the game dashboard as a hero-centric overview, not a generic portal to every system and not a copy of the sidebar.

**Scope:**

- hero identity and current server context;
- current progression/state summary;
- clear entry points to immediate gameplay actions;
- no fake live dashboard metrics;
- no raw admin/debug diagnostics.

**Rules:**

- dashboard is player-facing and hero-centered;
- use real active hero/server/read-model data;
- do not add fake action cards just because a feature exists in navigation;
- persistent-state surfaces belong in `UI-DASHBOARD-2`, not as ad hoc cards.

**Acceptance criteria:**

- dashboard explains “what matters for this hero now”;
- sidebar/navigation remains navigation, not duplicated dashboard content;
- no fake counters or fake task queue;
- important values are not muted.

## UI-DASHBOARD-2 — Persistent state widget boundary

**Goal:** define and implement the boundary for persistent player state widgets that may appear on dashboard/shell-adjacent surfaces.

**Allowed states:** real states from real read models/services, such as:

- active exploration / pending exploration result;
- active estate building job;
- unread report/notification attention state;
- current blocking Trial/Encounter/Combat handoff when backend exposes it;
- other durable states explicitly backed by DB/RPC/read model.

**Out of scope:**

- fake action queue;
- fake timers;
- local-only production state;
- speculative future workflow cards;
- admin diagnostics as player-facing widgets.

**Rules:**

- each widget must name its read model/service source;
- frontend countdowns are display-only if backend owns time;
- if the read model is missing, report dependency instead of creating local placeholder state;
- no direct mutation from persistent-state widget unless the task explicitly scopes the canonical action.

**Acceptance criteria:**

- persistent state widgets are backed by durable source of truth;
- missing states do not appear as fake placeholders;
- action-needed states are visually clear and not muted;
- stale state is cleared on active hero/server changes.

## UI-DASHBOARD-3 — Dashboard prototype comparison and cleanup pass

**Goal:** after dashboard/persistent-state implementation slices, compare production dashboard to accepted dashboard/shell prototype direction and remove leftover temporary dashboard code.

**Scope:**

- compare hero-centric layout, persistent state widgets, card rhythm and CTA hierarchy;
- remove obsolete dashboard cards, fallback helpers and dead template sections;
- report matched / not matched / deferred anchors.

**Acceptance criteria:**

- dashboard is accepted without relying on old shell task history;
- remaining gaps are concrete follow-up tasks, not generic “polish”. -->

# 10. UI-CORE — Foundations and style contract

Cel: ustabilizować wspólne wzorce, globalne SCSS, reuse rules, vendor wrapper lookup i zasady przenoszenia prototypów do Angulara. UI-CORE jest **phase zero** dla większych ekranów.

## UI-CORE task index

- UI-CORE-1 / formerly UI-28 — Mythsworn UI style contract extraction
- UI-CORE-2 — Global SCSS and shared pattern inventory
- UI-CORE-3 — Local SCSS budget and style report checklist
- UI-CORE-4 — Shared surface/card/badge/chip/page-header patterns
- UI-CORE-5 — Icon placeholder and Game Icons mapping contract
- UI-CORE-6 — Item popover shared component contract
- UI-CORE-7 — Legacy Monster Hunt / `mg-*` SCSS modernization plan
- UI-CORE-8 — Text utility semantics and `muted-text` cleanup
- UI-CORE-9 — Surface/card/badge/chip production pattern expansion
- UI-CORE-10 — Custom icons and brand asset registry
- UI-CORE-11 — Prototype-to-production SCSS mapping
- UI-CORE-12 — PrimeNG/vendor wrapper modernization and lookup order
- UI-CORE-13 — Utility class audit, semantics and usage pass
- UI-CORE-14 — PrimeNG table/paginator/list pattern decision
- UI-CORE-15 — Layout utilities and section pattern cleanup

## UI-CORE-1 / formerly UI-28 — Mythsworn UI style contract extraction

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/mythsworn-style-contract.md`.

**Goal:**  
Zebrać zaakceptowane style z prototypów i rozmowy w praktyczny style contract dla Codexa, bez kopiowania canvas CSS do Angulara.

**Scope:**
- przejrzeć `src/scss/abstracts`, `base`, `themes`, `utilities`, `vendors`, `layouts`,
- przejrzeć istniejące layout/shared components, jeśli są dostępne,
- zmapować prototype visual intent na production tokeny/wrappers/patterns,
- opisać: game shell, admin shell, topbar, sidebar, page header, cards, summary cards, stat cards, badges, chips, item popover, report/notification rows,
- wskazać brakujące global/shared patterns,
- dopisać zasady no canvas-copy, global SCSS first, class budget, no div soup.

**Out of scope:**
- finalny design system,
- big-bang SCSS rewrite,
- zmiana wszystkich istniejących komponentów,
- nowy icon framework,
- DB/schema changes.

**Data/source rules:**
- nie projektować DB metadata ani admin nav registry w tym tasku,
- jeśli pattern wymaga danych z DB/read modelu, opisać dependency zamiast hardcodować runtime meaning.

**UI/SCSS rules:**
- użyć istniejących `mg` variables/wrappers jako aktualnej production foundation,
- oznaczyć `mg-*` jako legacy compatibility,
- nie tworzyć lokalnego `mb-*` token systemu,
- nie kopiować wartości kolorów z prototypów do component SCSS.

**Dependencies/blockers:**
- jeśli repo nie ma widocznych shared components dla card/badge/chip, wskazać brak jako pattern gap,
- jeśli istniejące wrappers są zbyt stare, wskazać je jako UI-CORE follow-up.

**Acceptance criteria:**
- style contract opisuje production usage, nie tylko estetykę,
- Codex ma jasny lookup order dla SCSS/vendor/shared,
- canvas HTML jest visual reference only,
- lista missing global patterns istnieje,
- review może ocenić, czy future UI task używa kontraktu.

**Verification/smoke:**
- jeśli task jest dokumentacyjny: no build required,
- jeśli zmienia SCSS: style compile/build.

**Required Codex report:**
- reused:
- checked but not reused:
- new component/state/helper added:
- global tokens used:
- shared/vendor components used:
- local SCSS added:
- copied from prototype: yes/no:

## UI-CORE-2 — Global SCSS and shared pattern inventory

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/global-scss-shared-inventory.md`.

**Goal:**  
Stworzyć inventory globalnych SCSS, utilities, layouts, vendor wrappers i shared components, które Codex ma sprawdzać przed implementacją UI.

**Scope:**
- zinwentaryzować `src/scss/abstracts`, `base`, `themes`, `utilities`, `vendors`, `layouts`,
- wskazać production-ready files, legacy/migration candidates, empty placeholders,
- wskazać wrappers dla PrimeNG: buttons, inputs, selects, paginator, table, tabs, popover, tooltip, dialogs, drawer, toasts, custom icons,
- wskazać layout helpers: grid, flex, section/title/subtitle, lists, scrollbars,
- wskazać shared Angular components, jeśli są dostępne w repo.

**Out of scope:**
- refactor wszystkich klas,
- usuwanie plików,
- zmiana visual language,
- implementacja ekranów.

**Data/source rules:**
- inventory ma wskazywać, gdzie UI powinien brać label/metadata, ale nie projektować nowego DB contractu.

**UI/SCSS rules:**
- inventory ma wyjaśniać, które klasy są legacy compatibility,
- empty placeholders typu `functions.scss` / `base/_icons.scss` nie mogą być traktowane jako real icon system,
- custom icons registry ma być wskazany osobno.

**Dependencies/blockers:**
- brak dostępu do repo/shared components -> raport z ograniczeniem,
- niepewne użycie klasy -> oznaczyć jako needs audit, nie zgadywać.

**Acceptance criteria:**
- istnieje tabela/katalog: file/pattern → intended use → status → notes,
- Codex wie, gdzie szukać card/badge/chip/button/table/popover/tabs/section styles,
- inventory wskazuje, czego nie wolno używać losowo,
- review może szybko sprawdzić, czy nowy task pominął reuse.

**Verification/smoke:**
- documentation-only: no build,
- if comments/docs in repo changed: formatting check if available.

**Required Codex report:**
- reused:
- checked but not reused:
- new docs/registry added:
- scope kept minimal:

## UI-CORE-3 — Local SCSS budget and style report checklist

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/local-scss-budget-checklist.md`.

**Goal:**  
Wprowadzić egzekwowalny local SCSS budget i styling report checklist dla wszystkich większych UI tasków.

**Scope:**
- dodać standard raportu stylowania,
- zdefiniować limit klas i zasady uzasadniania 3+ klas,
- zdefiniować kiedy local SCSS jest dopuszczalny,
- zdefiniować zakaz local PrimeNG internals overrides bez uzasadnienia,
- zdefiniować wymagane pytania review dla local SCSS.

**Out of scope:**
- automatyczny linter,
- refactor wszystkich istniejących templatek,
- usuwanie utilities.

**Data/source rules:**
- nie dotyczy DB/RPC, poza regułą, że CSS visibility nie jest access control.

**UI/SCSS rules:**
- global utilities/vendor wrappers mają być używane świadomie,
- powtarzalne utility combinations mają stać się global pattern/component,
- local SCSS layout-only unless justified.

**Dependencies/blockers:**
- jeśli project ma stylelint/ESLint custom rules, sprawdzić czy można później dodać automation; nie robić tego w tym tasku bez zgody.

**Acceptance criteria:**
- task template zawiera styling report,
- class budget jest opisany,
- local SCSS exceptions są jasno opisane,
- Codex musi raportować copied-from-prototype status.

**Verification/smoke:**
- documentation-only no build,
- jeśli dotyka config/lint: build/lint.

**Required Codex report:**
- reused:
- checked but not reused:
- new checklist added:
- not added intentionally:

## UI-CORE-4 — Shared surface/card/badge/chip/page-header patterns

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/shared-surface-patterns.md`.

**Goal:**  
Ujednolicić najczęstsze powierzchnie UI jako globalne klocki, które zastąpią lokalne kopiowanie prototypowego CSS.

**Scope:**
- przejrzeć `base/_surface.scss`, `base/_badges.scss`, `utilities/_shadows.scss`, `_borders.scss`, `_backgrounds.scss`,
- zaprojektować/rozszerzyć globalne patterny:
  - page header,
  - standard card,
  - premium/elevated card,
  - summary card,
  - stat card,
  - note/info panel,
  - badge,
  - chip,
  - status pill,
  - selected/active surface,
  - detail side panel,
- wskazać compatibility aliases i docelowe semantic names.

**Out of scope:**
- implementacja konkretnych ekranów,
- 10+ wariantów kart bez realnego użycia,
- pełny design system,
- local feature SCSS.

**Data/source rules:**
- labels/status variants mają wynikać z semantic meaning, nie z kolorów,
- DB-backed status labels pozostają DB/read-model sourced.

**UI/SCSS rules:**
- gradients/borders/shadows token-driven globalnie,
- badge color aliases `green/blue/gray/violet` compatibility only,
- no local `auction-card/admin-card/pvp-card` if global surface + layout class is enough.

**Dependencies/blockers:**
- jeśli existing components already wrap cards/badges, rozszerzyć je zamiast tworzyć nowe klasy,
- jeśli global token nie istnieje, zgłosić token gap.

**Acceptance criteria:**
- globalny zestaw patterns istnieje albo jest dokładnie zaplanowany,
- taski ekranowe mogą wskazać konkretny pattern,
- no local copied gradients,
- build/style compile passes if code changed.

**Verification/smoke:**
- style compile/build,
- visual smoke on one representative page if pattern applied.

**Required Codex report:**
- global tokens used:
- shared/vendor components used:
- global/shared SCSS classes added/changed:
- local SCSS added:
- why local SCSS was necessary:

## UI-CORE-5 — Icon placeholder and Game Icons mapping contract

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/icon-placeholder-mapping.md`.

**Goal:**  
Opisać docelowe użycie custom icons i placeholderów ikon, żeby Codex nie używał emoji ani losowych bibliotek.

**Scope:**
- przejrzeć `abstracts/_custom-icons.scss`, `vendors/_p-custom-icons.scss`, `vendors/_primeicons-local.scss`,
- zebrać istniejące icon keys/classes,
- zmapować placeholdery `AU/PV/ES/TR/EX/CG/AA/SM` na docelowe icon keys,
- opisać fallback: text placeholder only in prototype,
- opisać color/fill/mask/currentColor strategy, jeśli wynika z istniejącego SCSS.

**Out of scope:**
- pobieranie wszystkich ikon,
- zmiana całego icon systemu,
- emoji as final icons,
- hardcoded external icon URLs.

**Data/source rules:**
- icon key dla DB-backed type może później pochodzić z metadata/dictionary; ten task nie projektuje DB.

**UI/SCSS rules:**
- custom icon registry first,
- missing icon key report,
- no random icon library.

**Dependencies/blockers:**
- jeśli brak konkretnej ikony, raportować missing icon key,
- jeśli SVG nie obsługuje recolor, wskazać asset issue.

**Acceptance criteria:**
- icon registry usage documented,
- placeholder mapping exists,
- no emoji final icons,
- `M` mark preservation documented.

**Verification/smoke:**
- visual smoke for one custom icon if code changes,
- no build required for docs-only.

**Required Codex report:**
- reused icon registry:
- missing icon keys:
- new icons added:
- not added intentionally:

## UI-CORE-6 — Item popover shared component contract

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/item-popover-contract.md`.

**Goal:**  
Zdefiniować jeden item popover pattern dla całej aplikacji: armory, auction, direct trade, reports, rewards.

**Scope:**
- item name + quality/tier,
- item kind and slot,
- icon box on right,
- native item stats,
- bonuses,
- requirements,
- drachma value,
- boosted values,
- not equippable / requirement warning,
- source snapshot support for reports/trade.

**Out of scope:**
- item generation DB changes,
- equip/unequip workflow,
- CP market valuation,
- local tooltip CSS per feature.

**Data/source rules:**
- use current item read model/snapshot if available,
- reports/trade should use snapshot/fallback data where historical,
- no CP value as inherent item value,
- item requirements from DB/read model when available.

**UI/SCSS rules:**
- build on PrimeNG popover/tooltip wrapper where appropriate,
- no per-feature item tooltip CSS,
- icon placeholder uses custom icon registry/fallback.

**Dependencies/blockers:**
- if shared item read model missing, report dependency,
- if item stats not available, show safe partial popover and report data gap.

**Acceptance criteria:**
- one shared popover contract exists,
- damage/stat display distinguishes native stats and bonuses,
- boosted values visually marked,
- no CP valuation,
- accessible hover/focus/click behavior considered.

**Verification/smoke:**
- visual smoke in one item context,
- keyboard/focus smoke if popover implemented,
- build passes.

**Required Codex report:**
- reused popover/vendor:
- item read model source:
- new shared component added:
- local SCSS added:

## UI-CORE-7 — Legacy Monster Hunt / `mg-*` SCSS modernization plan

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/legacy-mg-scss-modernization-plan.md`.

**Goal:**  
Ustalić, co zostaje jako compatibility layer, co dostaje Mythsworn alias, a co wymaga refaktoru.

**Scope:**
- audit public `mg-*` variables/classes/mixins,
- mapping legacy `mg-*` → Mythsworn intent,
- identify empty placeholders: `functions.scss`, `base/_icons.scss`,
- identify wrappers/patterns safe to keep,
- identify aliases needed for future Mythsworn naming.

**Out of scope:**
- big-bang rename,
- removing classes without usage audit,
- rewriting every component,
- local `mb-*` system.

**Data/source rules:**
- not DB/RPC related.

**UI/SCSS rules:**
- keep working production layer,
- change/alias globally, not locally,
- document migration candidates.

**Dependencies/blockers:**
- if usage search unavailable, mark safe-to-change unknown,
- if class used widely, keep compatibility alias.

**Acceptance criteria:**
- legacy naming not treated as final branding,
- migration path minimal,
- mapping table exists,
- build/style compile if code changed.

**Verification/smoke:**
- style compile/build if code changes,
- no visual regressions on touched representative page.

**Required Codex report:**
- reused legacy compatibility:
- aliases added:
- cleanup candidates:
- safe to remove now yes/no/unknown:

## UI-CORE-8 — Text utility semantics and `muted-text` cleanup

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/text-utility-semantics.md`.

**Goal:**  
Ograniczyć nadużycie `muted-text` i status text, nie usuwając przydatnych utilities.

**Scope:**
- audit use of `muted-text`, `error-text`, `success-text`, `info-text`, `warn-text`, `arcane-text`,
- define use/do-not-use matrix,
- fix touched obvious abuses where text carries decision/reason/outcome/status meaning,
- point to badge/status pill alternatives.

**Out of scope:**
- full repo-wide mass rewrite unless approved,
- removing text utilities,
- replacing everything with gold/primary text.

**Data/source rules:**
- status labels may come from DB/dictionaries; styling must not replace semantic status.

**UI/SCSS rules:**
- helper/metadata only for muted,
- decisions/reasons/notes/outcomes not muted,
- status workflow prefers badges/status pills.

**Dependencies/blockers:**
- if a component uses `muted-text` because no badge/status pattern exists, link to UI-CORE-4/9.

**Acceptance criteria:**
- use/do-not-use matrix exists,
- nadużycia w touched files fixed,
- review checklist updated,
- build passes if code changed.

**Verification/smoke:**
- visual smoke for representative page if changes made.

**Required Codex report:**
- text utilities changed:
- muted-text usages removed/kept:
- why kept:

## UI-CORE-9 — Surface/card/badge/chip production pattern expansion

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/surface-badge-pattern-expansion.md`.

**Goal:**  
Rozszerzyć globalne surface/badge patterns do potrzeb zaakceptowanych prototypów.

**Scope:**
- `base/_surface.scss`, `base/_badges.scss`, `_tag-badge-aliases.scss`, shadows/borders/backgrounds,
- create/extend semantic variants for surfaces and badges,
- add doc comments or usage matrix where helpful,
- map repeated prototype surfaces to global patterns.

**Out of scope:**
- implementing full pages,
- replacing every existing card,
- many decorative variants without need.

**Data/source rules:**
- badge labels/statuses are semantic; DB label source remains separate.

**UI/SCSS rules:**
- no local copied gradients,
- token-driven colors,
- color aliases compatibility only,
- repeated surfaces global.

**Dependencies/blockers:**
- if theme token missing, report token gap,
- if shared component exists, extend component/wrapper instead of only class.

**Acceptance criteria:**
- production surface/badge/chip patterns exist,
- Codex has concrete classes/patterns to use,
- page header/summary/stat/note/detail/selected surfaces covered,
- build/style compile passes.

**Verification/smoke:**
- visual smoke on one representative page,
- build/style compile.

**Required Codex report:**
- global classes added/changed:
- variants added:
- compatibility aliases:
- local SCSS avoided:

## UI-CORE-10 — Custom icons and brand asset registry

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/icon-brand-registry.md`.

**Goal:**  
Ujednolicić custom icons i brand assets.

**Scope:**
- document `abstracts/_custom-icons.scss`, `_p-custom-icons.scss`, `_primeicons-local.scss`,
- map prototype placeholders,
- document brand assets slots: logo mark, wordmark, banner,
- preserve CSS `M` fallback.

**Out of scope:**
- downloading all icons,
- changing icon architecture,
- embedding assets as base64,
- hardcoded external URLs.

**Data/source rules:**
- future icon keys may become DB metadata; no DB design now.

**UI/SCSS rules:**
- registry first,
- missing key report,
- no emoji final.

**Dependencies/blockers:**
- real asset paths required for banner/wordmark use,
- missing icons can stay placeholders in prototypes only.

**Acceptance criteria:**
- icon/brand registry documented,
- `M` mark not lost,
- Codex knows missing icon behavior.

**Verification/smoke:**
- visual smoke if asset/icon use changes.

**Required Codex report:**
- icons reused:
- icon keys missing:
- brand assets used:

## UI-CORE-11 — Prototype-to-production SCSS mapping

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/prototype-production-mapping.md`.

**Goal:**  
Stworzyć mapping zaakceptowanych prototypes na production patterns.

**Scope:**
- for each accepted prototype family map:
  - visual pattern,
  - production token/class/component/wrapper,
  - missing pattern,
  - local layout-only class if needed,
- initial families: Dashboard, Admin Overview, Reports/Notifications, Trade, PvP Vicinity, Estate, Armory, Statistics.

**Out of scope:**
- copying prototype HTML/CSS into app,
- implementing screens,
- adding fake placeholders to prototype archive.

**Data/source rules:**
- mapping may reference DB/read model requirements but does not design DB.

**UI/SCSS rules:**
- prototype values translated to global SCSS/vendor/shared,
- local CSS exceptions documented.

**Dependencies/blockers:**
- if prototype HTML missing, recover/review one at a time.

**Acceptance criteria:**
- mapping table exists,
- each major UI task can reference patterns,
- no canvas CSS copy.

**Verification/smoke:**
- docs-only no build.

**Required Codex report:**
- prototypes mapped:
- missing patterns:
- local exceptions:

## UI-CORE-12 — PrimeNG/vendor wrapper modernization and lookup order

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/primeng-vendor-wrapper-lookup.md`.

**Goal:**  
Dopasować vendor wrappers do Mythsworn i wymusić ich używanie/rozszerzanie przed lokalnym stylem.

**Scope:**
- review `src/scss/vendors/*`,
- create lookup order: component → vendor wrapper → utility → local exception,
- review `_p-select.scss` broad selector scope,
- map `_p-toasts.scss` / `mg-toast` to notification severities,
- verify `_p-popover.scss` and `_tooltip.scss` for item popover/explainability,
- make `_p-paginator.scss` and `_p-table.scss` preferred basis for dense lists/tables where appropriate,
- document `_p-custom-icons.scss` and `_primeicons-local.scss`.

**Out of scope:**
- replacing PrimeNG,
- local `.p-*` overrides,
- `::ng-deep` exceptions without reason,
- deleting wrappers.

**Data/source rules:**
- not DB/RPC related.

**UI/SCSS rules:**
- wrappers first,
- extend wrapper globally if visual pattern is reusable,
- no feature-local PrimeNG internals.

**Dependencies/blockers:**
- if broad selector scope is unsafe to change without audit, mark as needs usage audit.

**Acceptance criteria:**
- vendor wrapper usage map,
- wrappers needing polish listed,
- local overrides are exceptions,
- build/style compile if code changed.

**Verification/smoke:**
- visual smoke for touched PrimeNG components,
- build/style compile.

**Required Codex report:**
- wrappers reused:
- wrappers changed:
- local overrides avoided/added:

## UI-CORE-13 — Utility class audit, semantics and usage pass

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/utility-class-audit.md`.

**Goal:**  
Korzystać z global utilities zamiast lokalnego CSS, ale bez losowego/defensywnego składania klas.

**Scope:**
- audit common utility usage,
- focus: `muted-text`, spacing/gap, width/height px, shadow/opacity/backdrop, visibility, animation,
- produce `utility → allowed use → do not use → preferred alternative`,
- identify repeated combinations for extraction.

**Out of scope:**
- deleting utilities,
- discouraging utility use,
- big-bang HTML rewrite.

**Data/source rules:**
- visibility/opacity is not access control.

**UI/SCSS rules:**
- utilities for simple layout/presentation,
- repeated combinations → global pattern,
- fixed px requires justification.

**Dependencies/blockers:**
- if usage cannot be searched fully, mark unknowns.

**Acceptance criteria:**
- utility matrix exists,
- class budget enforceable,
- repeated combos identified.

**Verification/smoke:**
- build if code changes.

**Required Codex report:**
- utility usages audited:
- candidates extracted:
- kept intentionally:

## UI-CORE-14 — PrimeNG table/paginator/list pattern decision

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/table-paginator-list-decision.md`.

**Goal:**  
Ustalić, kiedy używać PrimeNG table/paginator, a kiedy custom list/card row.

**Scope:**
- admin tables,
- reports/notifications,
- auction listings,
- PvP vicinity,
- armory item grids,
- direct trade pending offers.

**Out of scope:**
- full implementation of all pages,
- replacing accepted card/list UX with tables everywhere,
- custom paginator if PrimeNG paginator suffices.

**Data/source rules:**
- pagination source/page size should come from read model/config where available; otherwise document default.

**UI/SCSS rules:**
- PrimeNG paginator preferred for standard paging,
- table for dense comparable data,
- custom list/card rows for item-rich/gameplay-rich content.

**Dependencies/blockers:**
- if existing read model does not paginate, report data/service dependency.

**Acceptance criteria:**
- list vs table decision per major screen,
- pagination pattern chosen,
- no local custom paginator without reason.

**Verification/smoke:**
- visual smoke on one list/table if code changes.

**Required Codex report:**
- table/paginator wrappers reused:
- custom list justified:
- pagination source:

## UI-CORE-15 — Layout utilities and section pattern cleanup

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/layout-section-pattern-cleanup.md`.

**Goal:**  
Uporządkować layout utilities i section/header patterns.

**Scope:**
- review `layouts/_components.scss`, `_grid.scss`, `_flex.scss`, `_lists.scss`, `_scrollbars.scss`, `_img.scss`,
- document or alias `mg-section`, `mg-section__title`, `mg-section__subtitle`,
- audit global `ul/li` styling for reports/admin prose,
- define when grid/flex utilities are appropriate,
- keep scrollbars global,
- support image slots for banner/logo/item art.

**Out of scope:**
- deleting layout utility system,
- big-bang HTML refactor,
- feature-local scrollbar/list resets without reason.

**Data/source rules:**
- not DB/RPC related.

**UI/SCSS rules:**
- section patterns global,
- page architecture should not be repeated utility soup,
- prose lists must remain readable.

**Dependencies/blockers:**
- if global list styling breaks prose, create/reset documented pattern.

**Acceptance criteria:**
- layout usage rules,
- repeated sections have shared/semantic pattern,
- prose/list styling safe,
- build/style compile if code changed.

**Verification/smoke:**
- visual smoke for reports/admin prose if list styles changed.

**Required Codex report:**
- layout utilities reused:
- section patterns added/aliased:
- list/prose impact:

## UI-CORE-16 — Mythsworn theme token and color palette pass

Goal:
Align production theme variables with the accepted Mythsworn visual direction: dark navy layered background, bronze/gold accents, readable warm text, semantic status colors and premium low-opacity surfaces.

Scope:
- inspect `src/scss/abstracts/_variables.scss`;
- inspect `src/scss/themes/*`;
- inspect emitted `--mg-*` runtime variables;
- compare current production palette against accepted prototype visual anchors;
- propose minimal token-level changes for:
  - app background;
  - surface background;
  - elevated surface;
  - border;
  - gold/bronze accent;
  - primary text;
  - muted/helper text;
  - semantic success/info/warn/danger;
- update global variables/themes only if approved by user;
- do not patch individual components for color parity.

Out of scope:
- local component SCSS;
- copying prototype `--mb-*` values directly;
- full visual redesign of every page;
- changing DB/domain semantics;
- adding new feature screens.

UI/SCSS rules:
- theme tokens first;
- no local one-off color fixes;
- no copied prototype rgba/gradient values in components;
- if a color need is repeated, promote it to a token or global pattern;
- preserve accessibility/contrast.

Acceptance criteria:
- production app has a coherent Mythsworn color foundation;
- accepted prototype colors are translated into production tokens, not copied locally;
- existing `mg-*` compatibility remains usable;
- Codex reports every changed token and representative visual impact.

Required Codex report:
- variables/themes checked:
- tokens changed:
- prototype intent mapped:
- contrast/accessibility notes:
- components intentionally not touched:
- local SCSS added: none / explain:

## UI-CORE-CARD-SELECTED-1 — Global selected / featured card glow

**Status:** Accepted/completed on 2026-05-20 after Armory and Exploration selected-card smoke. The global `.mg-card--selected` pattern in
`src/scss/base/_surface.scss` now provides the reusable selected/featured card treatment for production surfaces. The
implementation adapts the accepted Exploration prototype selected difficulty card direction into Mythsworn tokens rather
than copying prototype `mb-*` classes or raw values: a modest warm border, subtle top radial wash, warm linear surface
overlay and restrained inner highlight. `.mg-game-shell .mg-card--selected` is tuned for game-shell surfaces, with
`/game/exploration` Difficulty cards as the first consumer through `[class.mg-card--selected]="selected"` and Armory
Inventory item cards as the second consumer through `[class.mg-card--selected]="isBulkItemSelected(item)"`. The selected
state now explicitly wins over card hover/focus/focus-within variants, and item popover trigger hover/focus styles apply
only to non-selected cards so selected ownership remains global in `_surface.scss`. No page-local SCSS, selection logic,
move/drag/drop/loadout behavior, DB/RPC/schema/generated changes or unrelated UI changes were added. Verification passed
with `npx tsc --noEmit`, `npm run build` with known budget/CommonJS warnings, and static greps.

---

# 11. UI-ACCOUNT / UI-ONBOARDING — Account entry and hero creation

## UI-ACCOUNT-1 — Account Entry Shell

**Status:** Accepted on 2026-05-14. Account entry now separates existing hero entry from creation with `Enter game`, `Join new world` and `Create new hero` copy, shows standard-server District A free/capacity values from `get_start_flow_server_availability`, keeps sandbox multi-hero selection compact and DB-backed, and avoids duplicating existing hero context beside the sandbox switcher. No DB/RPC changes, generated type edits, auth/start-flow rewrite or local SCSS were added. Manual visual smoke remains user-side/pending.

**Goal:**  
Implement account/public shell before the player enters a specific server+hero game context.

**Required visual anchors:**

- different navigation than in-game shell;
- main options: `Enter the game`, `Create new hero` / `Join new world`;
- existing hero contexts show server + hero and route to dashboard;
- new hero flow shows eligible creation servers;
- district A capacity/free slots visible for standard server creation eligibility;
- sandbox/test multi-hero selector is explicit;
- Stat Allocation is not shown as an onboarding wizard step.

**Data/source rules:**

- Use selected server → active hero semantics.
- Creation eligibility and district A capacity must come from DB/RPC/read model.
- Angular must not guess starting address capacity.

**Acceptance criteria:**

- Existing hero routes to dashboard/game shell.
- Eligible server routes to Hero Creation.
- Full/blocked server is clear and not fake-resolved.
- No direct hero creation table writes.

---

## UI-ACCOUNT-2 — Sandbox create new hero entry action

**Status:** Accepted on 2026-05-14. Sandbox/test server entry now exposes the secondary `Create new hero on this sandbox` CTA next to `Enter game` when the start-flow read model allows sandbox hero creation. Standard servers with an existing hero keep only the enter action. The route remains the existing `/auth/create-character` canonical start-flow path, with no DB/RPC changes, generated type edits, start-flow/auth rewrite, direct table writes or local SCSS. Manual smoke passed.

**Goal:** allow privileged/test users on sandbox/test servers to start creation of an additional hero on the selected sandbox server without logging out.

**Required anchors:**

- server entry keeps existing `Continue` action for current/default hero;
- sandbox/test server also exposes a secondary `Create new hero on this sandbox` action;
- standard servers do not accidentally offer multi-hero creation when a hero already exists;
- selected server context is preserved into hero creation;
- no parallel hero creation workflow and no direct table writes.

**Acceptance criteria:**

- sandbox server entry with an existing hero offers both continue and create-new-hero;
- standard server entry with an existing hero offers continue only;
- creation uses the canonical hero creation/start-flow path;
- no `hero.id === auth.uid()` assumption;
- no direct hero/origin/estate/resource/Character Point table writes.

## UI-ACCOUNT-3 — Visible logout action

**Goal:** add a clear `Log out` / `Wyloguj` action in authenticated/account UI so users can leave the current session without browser/dev workarounds.

**Scope:**

- reuse existing auth/sign-out path;
- place logout in the current authenticated shell/topbar/account area or reachable server-entry/auth area;
- do not redesign account settings or auth architecture.

**Acceptance criteria:**

- authenticated user can visibly log out;
- logout uses existing sign-out flow;
- user returns to current unauthenticated/login behavior;
- no unrelated shell/account refactor.

## UI-HERO-CREATION-1 — Hero Creation Origin Carousel

**Status:** Accepted on 2026-05-14. Existing-account hero creation now uses one account-side screen with readonly selected server context, editable hero name, DB/read-model-backed origin carousel, creation summary and `Stwórz bohatera` action through the existing canonical `create_hero_start_flow` path. Player-facing copy was cleaned to Polish product language and no longer exposes DB/backend/Angular/workflow wording. No DB/RPC changes, generated type edits, direct writes, auth/start-flow rewrite or local SCSS were added. Manual visual smoke remains user-side/final confirmation.

**Goal:**  
Implement the second and final account-side creation screen: name + origin + create hero.

**Required visual anchors:**

- selected server context is readonly;
- hero name input is editable;
- origin selection is a visual carousel or equally dynamic origin selector;
- origin artwork is central, not a tiny static icon;
- origins: Spartanin, Ateńczyk, Kreteńczyk, Koryntianin;
- origin detail area shows lore/description and concrete bonuses from DB/admin content;
- exact origin bonuses must not be hardcoded in Angular;
- creation summary remains visible;
- after creation, player enters in-game shell and routes to Stat Allocation as first in-game location.

**Data/source rules:**

- Hero creation must use canonical DB/RPC/domain workflow.
- No direct Angular writes to hero, origin, Character Points, estate, resource, audit or onboarding tables.
- New heroes start with 1000 Character Points and random free district A estate through backend workflow.
- Origin content/artwork/bonuses must come from DB/admin-configurable read model or report blocker.

**Acceptance criteria:**

- Name + origin are the only player inputs.
- Origin visual hierarchy is preserved.
- Bonus display is DB-backed or explicitly data-blocked.
- Post-create route is in-game Stat Allocation, not onboarding step 3.

---

## UI-ACCOUNT-PREP — Prototype/task handoff

## UI-ONBOARDING-PREP-1 — Prototype Hero Creation / Onboarding Flow

**Goal:**  
Przygotować następny ręczny canvas prototype dla canonical player entry flow before Codex implementation.

**Scope:**
- Prototype should cover:
  - server selection,
  - server full/no free district A address state,
  - existing hero -> dashboard/game shell path,
  - no hero -> hero creation path,
  - sandbox/test multi-hero switcher placeholder,
  - hero name,
  - origin selection with DB-backed content placeholder,
  - origin bonuses/lore presentation,
  - create hero action,
  - post-creation route to stat allocation,
  - stat allocation is not a tutorial lock.

**Out of scope:**
- Angular implementation.
- DB/RPC implementation.
- Direct table write assumptions.
- Final origin content hardcoding.

**Data/source rules:**
- Prototype must reflect decisions:
  - player entry starts from server selection,
  - existing hero enters dashboard/game shell by default,
  - hero creation is a coherent DB/RPC workflow,
  - origin content is admin-configurable,
  - new hero starts with 1000 Character Points,
  - estate is assigned during creation,
  - player does not choose/preview exact starting address.

**UI/SCSS rules:**
- Canvas HTML only for visual exploration.
- No production CSS copy.
- Keep Mythsworn player-facing premium RPG direction.

**Acceptance criteria:**
- Prototype clarifies the onboarding UX before implementation tasks.
- No fake backend authority is implied.
- Flow states are visually understandable.

**Verification/smoke:**
- Canvas visual review only.

**Required Codex report:**
- not applicable until implementation.

---

## Detailed account/onboarding follow-up tasks

This section is part of the canonical UI/UX backlog. It records the accepted account/public shell, server/hero entry and Hero Creation origin carousel direction. Stat allocation is the default first in-game location after creation, not a third account-onboarding step.

All tasks below inherit Part I strict execution rules: prototype visual anchors are a contract, production must use DB/RPC/read models, `database.types.ts` is read-only, critical mutations use canonical backend workflows, new/touched forms use Reactive Forms, and Codex must not copy prototype CSS/JS/`mb-*` classes into Angular.

---

## UI-ONBOARDING-ADD-1 — Account Entry Shell information architecture

**Status:** Accepted on 2026-05-14 as the account/onboarding shell-frame implementation. `/auth/server-entry` now uses a separate account shell frame instead of GameTopbar/GameSidebar, with a centered Mythsworn topbar, account context panel and distinct `Wejdź do gry` / `Stwórz bohatera` account navigation. The central enter-game selector/detail-card redesign is intentionally deferred to UI-ONBOARDING-ADD-2, not omitted.

**Goal:**  
Zdefiniować i wdrożyć account/public shell dla zalogowanego użytkownika przed wejściem w konkretny server+hero game shell.

**Scope:**

- Account/public shell ma inne boczne menu niż in-game shell.
- Minimalne menu account shell:
  - `Enter the game`;
  - `Create new hero` / `Join new world`;
  - account-related options such as account settings, notifications, sign out.
- Shell pokazuje account identity, ale nie udaje aktywnego hero contextu, dopóki hero/server nie zostaną wybrane.
- Shell musi jasno odróżniać:
  - account context;
  - selected server context;
  - active hero context;
  - no active hero yet.
- Dla większych ekranów użyć istniejącego layout/shell patternu, o ile istnieje, zamiast tworzyć osobny lokalny shell.

**Out of scope:**

- In-game sidebar/dashboard redesign.
- Hero creation mutation.
- Stat allocation redesign.
- Direct DB writes.
- Status docs update.

**Data/source rules:**

- Account/user identity comes from auth/account context.
- Server/hero state comes from existing selected/current server + active hero read layers or dedicated start-flow read model.
- Sandbox/test privileges must come from access/membership/staff read layer.
- Do not infer sandbox privileges client-side.

**UI/SCSS rules:**

- Use account/public shell as its own route/layout area, not the in-game shell.
- Use global page/card/sidebar/nav patterns where available.
- Do not copy canvas sidebar/topbar CSS.
- If a missing account-shell pattern is discovered, report it as shared/layout follow-up.

**Dependencies/blockers:**

- Missing account/server/hero read model.
- Missing access layer for sandbox/test privileges.
- Missing route boundary between account shell and in-game shell.

**Acceptance criteria:**

- Account shell does not show in-game navigation as if a hero were active.
- `Enter the game` and `Create new hero` are distinct flows.
- User can switch between these account-shell sections without logging out.
- Existing hero flow leads toward in-game dashboard context.
- New hero flow leads toward server eligibility / hero creation context.
- No `Step 1 of 4` or wizard language appears in account shell.

**Verification/smoke:**

- `npx tsc --noEmit`
- `npm run build`
- Route smoke for account entry route if implemented.
- Manual smoke:
  - authenticated account with existing hero;
  - authenticated account with no hero on an eligible server;
  - sandbox/test account with multiple heroes where representative data exists.

---

## UI-ONBOARDING-ADD-2 — Enter The Game existing-hero selector

**Status:** Accepted/completed on 2026-05-14 as the routed account-entry existing-hero selector. `/auth/server-entry` and `/auth/create-character` now render under the real `AccountEntryLayout` with `<router-outlet />`; `ServerEntryPage` owns only the entry page content and no longer contains account shell chrome or local enter/create section routing. The existing-hero selector uses the player-safe `get_account_entry_hero_contexts` read model for selectable hero contexts, displays server, hero, level and address, and keeps `enterHeroContext(serverId, heroId)` as the canonical dashboard entry action. Manual smoke remains user-side before commit handoff.

**Goal:**  
Utworzyć account-shell section `Enter the game`, która pokazuje tylko istniejące grywalne hero contexty i prowadzi do dashboard/game shell.

**Scope:**

- Show server/hero selector for contexts where the logged-in account already has a playable hero.
- A combined server+hero select is acceptable.
- For standard servers, one normal hero per account/server is expected.
- Sandbox/test servers may show multiple heroes for privileged users.
- Selected context detail should show:
  - server name/kind/status;
  - hero name;
  - safe hero summary, e.g. level/rank if available;
  - next route: dashboard/game shell.
- CTA: `Enter dashboard` / `Enter the game`.
- On enter, set/refresh selected server and active hero context, then route into the in-game shell.

**Out of scope:**

- Hero creation.
- Origin editing.
- Stat allocation route for existing heroes.
- Player profile redesign.

**Data/source rules:**

- Existing hero contexts must come from DB/RPC/read model.
- Do not assume one global hero per account.
- Do not assume `hero.id === auth.uid()`.
- Player-facing payload must not expose account ids, staff-only data or raw internal row ids unless already part of safe route state.

**UI/SCSS rules:**

- Prefer compact select/dropdown plus detail card over a large grid.
- Use global form/select wrappers and card/summary-row patterns.
- Do not create permanent local badge/card systems.

**Dependencies/blockers:**

- Missing read model for account-accessible hero contexts.
- Missing active hero context setter/reloader.
- Missing dashboard route or route guard behavior.

**Acceptance criteria:**

- Existing hero on selected server routes to dashboard/game shell by default.
- Existing hero does not route back to stat allocation unless the user explicitly chooses that in-game route later.
- Sandbox/test multi-hero user can select another hero where permissions allow.
- Selected server and active hero remain explicit.
- Stale responses from context switch do not overwrite current selection.

**Verification/smoke:**

- `npx tsc --noEmit`
- focused active-context specs if added
- `npm run build`
- Manual smoke:
  - one existing standard hero;
  - multiple server contexts;
  - sandbox/test multi-hero context if data exists.

---

## UI-ONBOARDING-ADD-3 — Create New Hero / Join New World server eligibility selector

**Status:** Accepted with follow-up on 2026-05-14. `/auth/create-character` now starts existing-account hero creation with a compact server eligibility selector before the Hero Creation stage. The selected-server detail shows DB/read-model District A free/capacity values, full District A disables the creation CTA with a visible reason, standard servers with an existing hero are blocked from create flow, and sandbox/test creation remains available when the backend returns `canCreateHero=true` without `blockReason`. The ADD-3 selector does not render hero name, origin carousel or create mutation before handoff to the creation stage. Final layout smoke was user-side confirmed after the account selector width/top-spacing correction. Follow-ups are non-blocking: polish emphasis for `Dzielnica A` / `Tworzenie`, copy improvements and broader helper/template cleanup when this area is next touched.

**Goal:**  
Utworzyć account-shell section `Create new hero` / `Join new world`, która pozwala wybrać serwer kwalifikujący się do stworzenia postaci i pokazuje creation availability oraz district A capacity.

**Scope:**

- Use a compact server select/dropdown, not a large server card grid by default.
- Detail card under select must show:
  - server name;
  - server kind, e.g. `standard`, `sandbox/test`;
  - server status;
  - hero state for current user;
  - creation availability;
  - visible district A starting-estate capacity/free slots for standard servers;
  - next route.
- Eligible standard server with no hero and free district A slots routes to Hero Creation.
- Full standard server can be shown as blocked/unavailable or included as explanatory disabled option.
- Sandbox/test server can show privileged creation / hero selector behavior where access permits.
- CTA should be visually prominent near the selected server details, not hidden only in a distant footer if the final layout allows it.

**Out of scope:**

- Hero name form.
- Origin selection.
- Estate address preview.
- Direct creation mutation.
- Final server marketing/lore page.

**Data/source rules:**

- Server availability must account for whether the selected standard server can provide a free district A starting address.
- Capacity/free-slot display comes from DB/RPC/read model.
- Angular must not guess capacity or assign addresses.
- Player does not choose or preview exact starting estate address before creation.

**UI/SCSS rules:**

- Use PrimeNG/select wrapper or approved form pattern for server selection.
- Use shared summary rows for server facts.
- Use status badges/pills for availability.
- No copied `mb-*` class names from prototype.

**Dependencies/blockers:**

- Missing server eligibility read model with district A capacity/free slots.
- Missing route to Hero Creation.
- Missing sandbox/test privilege read model.

**Acceptance criteria:**

- Server selector is compact and readable.
- District A free starting slots are visible for standard server creation state.
- Full standard server cannot proceed to hero creation.
- Eligible server proceeds to Hero Creation screen.
- Existing hero state is not mixed with origin/name form on this screen.

**Verification/smoke:**

- `npx tsc --noEmit`
- `npm run build`
- Manual smoke:
  - eligible standard server;
  - standard server full/no free district A starts;
  - server with existing hero;
  - sandbox/test if data exists.

---

## UI-ONBOARDING-ADD-4 — Hero Creation screen: name + origin carousel

**Status:** Accepted with follow-up on 2026-05-14. Existing-account `/auth/create-character` opens the Hero Creation stage after eligible server selection and shows readonly selected-server context, `Imię bohatera`, the existing start-flow-backed origin carousel, creation summary with `Punkty postaci: 1000`, and the canonical `Stwórz bohatera` action disabled while the hero name is invalid. Direct origin buttons/dots, stat allocation UI, server selector UI, account registration UI and technical backend/read-model copy are not part of this stage. Status docs/generated types were not touched during implementation. Follow-ups are non-blocking: visual polish against the dashboard/game-shell baseline, carousel typography/color tuning, summary card polish and possible later rename/cleanup of `shared/carousel` if it remains origin-specific.

**Goal:**  
Wdrożyć Hero Creation screen jako drugi i ostatni account-side creation screen: readonly server context, hero name, origin carousel, creation summary and `Create hero`.

**Scope:**

- Screen opens only after an eligible server has already been selected.
- Show readonly selected server context, including creation open and district A availability summary.
- Show hero name field.
- Show origin selection as a visual carousel, not four static cards only.
- Canonical prototype origins:
  - `Spartanin` / Spartan;
  - `Ateńczyk` / Athenian;
  - `Kreteńczyk` / Cretan;
  - `Koryntianin` / Corinthian.
- Carousel should include:
  - large central active artwork;
  - previous/next navigation;
  - quick origin tabs or dots;
  - selected origin summary;
  - bonus/lore display area.
- Use origin artwork assets through a production asset registry/read model, not hardcoded asset paths in feature code.
- Origin bonus display must render concrete DB-backed bonus rows when available.
- Known design note: Koryntianin / Corinthian has `+10 Luck`, but production must still read it from canonical origin bonus data rather than hardcoding Angular constants.

**Out of scope:**

- Designing final origin balance values.
- Direct hero table writes.
- Editing origin after creation.
- Stat allocation UI redesign.
- Implementing image generation or changing assets.

**Data/source rules:**

- Origin labels, descriptions, lore, helper text, artwork keys and bonuses are DB/admin-configurable content in production.
- Do not hardcode final origin content as the long-term source of truth.
- Origin bonuses should flow through canonical bonus model/read model, e.g. `entity_bonuses(entity_type = origin)` / resolved bonus read model where available.
- If origin content/read model does not include exact bonuses/artwork keys, report a DB/content blocker or implement only a read-only placeholder surface if explicitly scoped.
- Hero name uniqueness is per server and must be validated by backend/RPC on create; optional frontend precheck is not authoritative.

**UI/SCSS rules:**

- Prototype carousel motion is visual direction only; do not copy canvas JS/CSS.
- Production should use Angular component/state with accessible controls.
- Carousel must support keyboard path and reduced motion.
- Origin artwork must have alt text or accessible label.
- Use global cards/summary rows/badges/buttons/select/input wrappers.
- Local SCSS only for constrained carousel layout if no shared pattern exists; report why.

**Dependencies/blockers:**

- Missing DB/RPC origin read model with lore/bonus/artwork content.
- Missing canonical hero creation RPC/workflow.
- Missing asset registry convention for origin artwork.
- Missing Reactive Forms/form factory pattern for creation form.

**Acceptance criteria:**

- Hero Creation contains only selected server context, hero name, origin carousel and create actions.
- It does not show server list as a new choice.
- It does not present stat allocation as account-onboarding step.
- Selecting origins updates main artwork, details, bonuses and summary.
- `Create hero` remains disabled/invalid when hero name is empty.
- Exact origin bonus values are not hardcoded in Angular.
- Koryntianin `+10 Luck`, if displayed, comes from the DB/read model or is clearly marked as prototype-only placeholder in non-production scope.
- Create action uses canonical backend workflow when implemented.

**Verification/smoke:**

- `npx tsc --noEmit`
- focused form/state/component specs if added
- `npm run build`
- Manual smoke:
  - type hero name;
  - cycle carousel left/right;
  - select each origin through quick tab/dot;
  - view DB-backed bonuses;
  - submit with valid name/origin;
  - submit with duplicate name shows backend error;
  - full server cannot reach this screen except as blocked route guard case.

---

## UI-ONBOARDING-ADD-5 — Hero Creation canonical workflow and post-create handoff

**Goal:**  
Ensure the UI handoff from Hero Creation to gameplay matches Epic X: one backend workflow creates the hero and routes into in-game stat allocation as the default first location.

**Scope:**

- Use canonical DB/RPC/domain workflow for hero creation.
- Payload should include only approved input:
  - selected server id;
  - hero name;
  - selected origin id/key as required by RPC.
- Backend workflow owns:
  - hero row creation;
  - origin assignment;
  - 1000 Character Points;
  - random free district A estate assignment;
  - any resource/audit/onboarding side effects;
  - duplicate-name and server-full validation.
- After success:
  - refresh selected/current server if needed;
  - refresh active hero context;
  - enter in-game shell;
  - default route to stat allocation.
- Later entries with existing hero route to dashboard, not stat allocation.

**Out of scope:**

- DB migration or RPC creation in a pure UI task.
- Angular fallback creation through direct `.insert()` / `.update()` / `.upsert()`.
- Changing stat allocation save behavior.
- Forcing player to spend all 1000 CP immediately.

**Data/source rules:**

- If canonical creation RPC is missing from generated types/schema, stop and report DB/RPC blocker.
- Do not patch generated `database.types.ts`.
- Do not create temporary manual interfaces hiding missing generated RPC contract unless explicitly approved as a spike.
- All durable effects are backend-owned.

**UI/SCSS rules:**

- Submit/loading/success/error states must be explicit.
- Backend validation errors must be readable, especially duplicate name and full server.
- Stale guard required if selected server/origin/name changes during async submit.

**Dependencies/blockers:**

- Missing canonical creation RPC/domain service.
- Missing active hero reload path after creation.
- Missing stat allocation route.
- Missing error mapping for duplicate name/full server.

**Acceptance criteria:**

- No direct table writes to `hero`, origin assignment, `hero_stats`, Character Points, estate/resources/audit/onboarding tables.
- Successful creation refreshes active hero and routes to in-game stat allocation.
- Existing hero refresh/re-entry routes to dashboard.
- Duplicate name and full server errors are surfaced without corrupting UI state.
- Player can leave stat allocation later.

**Verification/smoke:**

- `npx tsc --noEmit`
- focused submit/routing/state specs if added
- `npm run build`
- static grep:
  - no `.insert(` / `.update(` / `.upsert(` in hero creation feature path for durable workflow tables;
  - no `ngModel` in new/touched form;
  - no hardcoded origin bonus constants as production source.
- Manual smoke:
  - successful new hero;
  - duplicate name;
  - server full between selection and submit;
  - refresh after creation routes to dashboard on later entry;
  - stat allocation can be left.

**Status:** Accepted with follow-up on 2026-05-15. Hero Creation still uses the canonical `create_hero_start_flow` backend workflow through the existing start-flow/create-hero services, blocks unknown post-create `route_next_action` values instead of silently routing, and keeps fresh hero creation routed to in-game Stat Allocation. The submit path now guards stale success/error responses with the submitted server/name/origin context, so changed context does not overwrite UI state or navigate. No DB/RPC/generated-type/status-doc changes were made during implementation, and focused stale-submit specs cover the success/error guard. Follow-ups are non-blocking: split `CreateCharacterPageFacade` when this flow is next touched, align remaining `Nazwa bohatera` validation/toast copy to `Imię bohatera` in a later copy cleanup, and keep UI-ONBOARDING-ADD-6/7 docs/audit plus UI-ONBOARDING-ADD-8 responsive/manual smoke as separate tasks.

---

## UI-ONBOARDING-ADD-6 — Origin content and artwork registry/read-model follow-up

**Goal:**  
Define the content/read-model requirements for production origin carousel implementation so Codex does not hardcode origin lore, artwork paths or bonuses.

**Scope:**

- Audit current DB/read models for origin content:
  - origin label/name;
  - description/lore/helper text;
  - artwork key/path/registry reference;
  - resolved bonuses from canonical bonus system;
  - active/sort order.
- Decide whether artwork keys live in DB content metadata, asset registry, or a small app-side mapping keyed by DB-owned origin key.
- Ensure canonical origins are represented:
  - Spartan / Spartanin;
  - Athenian / Ateńczyk;
  - Cretan / Kreteńczyk;
  - Corinthian / Koryntianin.
- Confirm exact origin bonuses are visible from a read model before production carousel uses them.
- Produce a blocker list for missing content/data, not a frontend-hardcoded substitute.

**Out of scope:**

- Creating/changing DB schema unless the user explicitly asks for DB/migrator work.
- Final balance design.
- Asset generation.
- Updating generated database types.

**Data/source rules:**

- Prefer current schema/dump and `database-current.md` over legacy concept docs.
- Origin bonuses should use canonical bonus model, not legacy hardcoded presentation.
- If DB contains legacy `origin_bonuses` but app target is `entity_bonuses`, report transitional status clearly.

**UI/SCSS rules:**

- This task may be documentation/audit-only if content contracts are missing.
- No prototype CSS changes required.

**Dependencies/blockers:**

- Missing origin artwork content source.
- Missing resolved bonus read model.
- Missing admin/content route to edit origin lore/bonus presentation.

**Acceptance criteria:**

- Report identifies the current source of origin names, descriptions, artwork and bonuses.
- Report states whether Hero Creation carousel can be implemented without hardcoding permanent content.
- Missing content is listed as DB/content/admin blocker.
- If implementation proceeds, it consumes DB/read-model content and safe asset keys.

**Verification/smoke:**

- No build required if audit-only.
- If code changes are made: `npx tsc --noEmit`, `npm run build`.

**Status:** Accepted on 2026-05-15 as documentation/audit only. `docs/ui-ux/onboarding-origin-content-read-model-audit.md` records that origin labels, descriptions, active/sort order and bonus display are currently sourced from `get_start_flow_origin_options()` over `origin` plus canonical `entity_bonuses(entity_type = origin)`, while artwork remains the existing app-side asset convention derived from DB-owned `origin_key`. Missing live seed confirmation for the four canonical origins, DB/content-backed artwork, and an admin/content editing route remain content/admin follow-ups, not Angular fallbacks. No code, DB/RPC, generated types or status-independent runtime changes were made.

---

## UI-ONBOARDING-ADD-7 — Archive accepted onboarding prototypes and production mapping

**Goal:**  
Add the accepted account entry and hero creation carousel prototypes to the UI/UX prototype archive/mapping so future Codex work uses them as visual reference only.

**Scope:**

- Archive accepted prototypes, using final names agreed by user:
  - Account Entry Shell / server+hero context selector prototype;
  - Hero Creation Origin Carousel prototype.
- Add mapping entries to prototype-to-production mapping:
  - account/public shell;
  - enter game existing-hero selector;
  - create new hero server eligibility selector;
  - hero creation origin carousel;
  - origin artwork/content read model;
  - post-create route into stat allocation.
- Each mapping entry must state:
  - production pattern target;
  - missing shared/global pattern if any;
  - local layout-only exception if any;
  - DB/RPC/read-model blocker if any.

**Out of scope:**

- Angular implementation.
- Copying prototype CSS/JS.
- Marking task complete in status docs.

**Data/source rules:**

- Archive entries must not claim DB/RPC exists if it does not.
- Prototype is visual reference only.
- Use current decisions for flow semantics.

**UI/SCSS rules:**

- Include standard `VISUAL REFERENCE ONLY` header in archived prototype HTML.
- Do not archive placeholder screens invented without user acceptance.

**Acceptance criteria:**

- UI/UX backlog points to the accepted prototypes.
- Prototype-production mapping prevents copying canvas classes/CSS.
- Future Codex task can identify which prototype to consult and which production patterns to use.

**Verification/smoke:**

- Docs-only review.
- Confirm filenames/paths with user before status docs update.

**Status:** Accepted on 2026-05-15 as documentation/mapping only. The accepted onboarding prototype archive paths are now recorded in the UI/UX backlog and README: `docs/ui-ux/prototypes/mythsworn_server_select.html` for Account Entry Shell / server+hero context selector and `docs/ui-ux/prototypes/mythsworn_origin_screen.html` for Hero Creation Origin Carousel. The ADD-7 onboarding entries in `docs/ui-ux/prototype-production-mapping.md` now map account shell, existing-hero entry, create-new-hero eligibility, hero creation carousel, origin content/artwork read-model boundaries and post-create Stat Allocation handoff to current production patterns and blockers; the broader UI-CORE-11 document remains marked draft for review. Prototype CSS/JS remains visual reference only and was not copied into Angular.

---

## UI-ONBOARDING-ADD-8 — Mobile/responsive check for account entry and hero creation carousel

**Goal:**  
Zapisać i później sprawdzić minimalne mobile/tablet constraints dla account entry i Hero Creation carousel, bez pełnego mobile redesignu.

**Scope:**

- Account Entry Shell:
  - sidebar may stack above content on narrow screens;
  - select/dropdown remains reachable;
  - CTA remains visible without horizontal scroll.
- Hero Creation carousel:
  - origin artwork and details stack on mobile;
  - carousel arrows/tabs are large enough for touch;
  - no hover-only critical information;
  - reduced motion supported;
  - page can scroll vertically, but the create action remains reachable.
- Stat allocation handoff:
  - after creation, mobile user should not be trapped in a confusing route state.

**Out of scope:**

- Full mobile redesign.
- Rewriting in-game shell navigation.
- Native app gestures.

**Data/source rules:**

- No DB changes.

**UI/SCSS rules:**

- Use responsive global utilities/patterns where available.
- Feature-local responsive CSS only for carousel geometry if no shared pattern exists.
- Report any unavoidable local SCSS.

**Acceptance criteria:**

- No horizontal scroll for primary controls at mobile width.
- Keyboard and touch paths exist for origin selection.
- Reduced motion does not break selection.
- CTA remains reachable.

**Verification/smoke:**

- Browser responsive smoke at desktop/tablet/mobile widths.
- Keyboard smoke for carousel controls.
- Reduced-motion smoke where practical.

**Status:** Postponed on 2026-05-15. Responsive/mobile verification for account entry and Hero Creation carousel remains a separate manual/browser smoke task. No responsive runtime changes, browser smoke, dev server or mobile redesign were performed in this documentation batch.

---

# 12. UI-HERO — Statistics and character growth

Cel: stat allocation, base stats, derived preview i Character Points spending UI. UI-HERO musi respektować istniejący canonical stat allocation workflow i nie może direct-write hero stats/CP.

## UI-HERO task index

- UI-HERO-1 — Hero statistics page
- UI-HERO-2 — Derived stat delta preview
- UI-HERO-3 — Stat allocation draft and save flow
- UI-HERO-4 — Character Points summary placement

## UI-HERO-1 — Hero statistics page

**Goal:**  
Zbudować Statistics/Hero stats page jako player-facing ekran rozdawania base stats i podglądu derived stats.

**Scope:**
- route/page target: existing hero/statistics route if present, otherwise report target route proposal,
- header/title: `Base stats allocation`,
- same-line CP summary: Character Points, Draft spent, Remaining after save,
- helper/description under title,
- base stats list/grid with current value and draft controls,
- derived stats preview below or beside allocation panel,
- save/reset controls,
- validation/error display.

**Out of scope:**
- DB stat model redesign,
- XP/level-up workflow,
- admin stat correction,
- direct writes to `hero_stats`, `hero.character_points`, `character_point_ledger`, audit tables,
- full equipment management.

**Data/source rules:**
- current stat values from active hero stat read model,
- CP balance from active hero/progression read model,
- save through canonical `save_stat_allocation(...)` or current frontend service wrapping it,
- stat labels/descriptions from DB-backed stat definitions/dictionaries where available,
- do not assume `hero.id === auth.uid()`.

**UI/SCSS rules:**
- use global page header/card/stat/list patterns,
- CP summary must not be duplicated elsewhere on the page,
- `muted-text` only for helper copy, not CP values or validation outcomes,
- no local stat card CSS copied from prototype.

**Dependencies/blockers:**
- if canonical stat allocation service/RPC is missing or incompatible, report blocker,
- if derived preview service is missing, keep save flow and report preview dependency.

**Acceptance criteria:**
- page displays base stats and CP summary in accepted placement,
- draft allocation can be represented without saving immediately,
- invalid drafts disable save or show clear validation,
- save uses canonical workflow,
- no duplicate CP summary,
- build passes.

**Verification/smoke:**
- route smoke for statistics page,
- draft + reset smoke,
- invalid CP overspend smoke,
- save smoke if backend/test data available; otherwise pending manual smoke,
- build/tsc.

**Required Codex report:**
- reused:
- checked but not reused:
- new component/state/helper added:
- stat/CP data source:
- save path:
- local SCSS added:
- not added intentionally:

**Status:** Accepted on 2026-05-15. `/hero/attributes` is the accepted UI-HERO-1 base-stat allocation screen: it uses the wide game-shell content path, a dashboard-aligned header with one summary card, compact stat allocation rows, an `Allocation draft` panel using the same divider-row pattern as the header/derived preview, and a current-only derived preview. Save/reset/cap/cost/no-Character-Points behavior remains on the canonical stat allocation workflow. `AttributeAllocationPageFacade` was reduced and cleaned after review, base stat definition/value mapping is centralized in `mapBaseStatSnapshots(...)`, and combat now reuses the same mapper for base stat entries. Verification accepted by the user: focused allocation and combat specs passed, `npx tsc --noEmit` passed, `npm run build` passed with existing budget/CommonJS warnings, and manual smoke was user-side. Copy/i18n polish remains a non-blocking later pass.

## UI-HERO-2 — Derived stat delta preview

**Goal:**  
Pokazać, jak derived stats zmienią się po zapisaniu aktualnego draftu stat allocation.

**Scope:**
- current derived value,
- after-save derived value,
- delta indicator,
- strengthened/boosted visual treatment where value changes,
- clear distinction between base/current and preview/draft,
- support item/equipment/bonus-aware runtime if available.

**Out of scope:**
- formula redesign,
- DB persistence of preview,
- local hardcoded derived formulas,
- equipment equip/unequip workflow.

**Data/source rules:**
- use current runtime derived stats resolver/service where available,
- if runtime resolver already accounts for items/bonuses/equipment, use it,
- if not, report limitation and do not fake item-aware calculations,
- do not use legacy `hero_derived` as runtime source if current decisions say it is not source of truth.

**UI/SCSS rules:**
- derived preview uses shared stat/summary pattern,
- deltas visually clear but not overcolored,
- boosted values use accepted gold/accent treatment,
- `muted-text` only for labels/help, not changed values.

**Dependencies/blockers:**
- missing resolver hook for draft preview -> dependency,
- missing equipment bonus runtime -> limitation/dependency.

**Acceptance criteria:**
- derived current/preview/delta shown clearly,
- preview updates with draft changes if implementation has runtime support,
- no fake formulas,
- missing runtime support reported honestly,
- build passes.

**Verification/smoke:**
- draft stat increment changes preview where supported,
- reset returns preview to current,
- no-data/loading state smoke,
- build/tsc.

**Required Codex report:**
- reused runtime resolver:
- checked but not reused:
- limitations:
- local SCSS added:

**Status:** Accepted on 2026-05-15. `/hero/attributes` Derived preview now uses the canonical `get_hero_attribute_allocation_preview_manifest(...)` one-shot manifest and a descriptor-driven local interpreter for allocation draft deltas, split from manifest normalization. User-side manual smoke confirmed `+ Endurance` Health `156 -> 161 (+5)` and Defense `142 -> 143 (+1)`, plus `+ Strength` Demonic Dagger `35-51 -> 36-52 (+1)` and Quality Cunning Mace `44-63 -> 45-64 (+1)`. Current-only, unsupported and unknown-descriptor rows remain current-only; future supported scalar rows with `draftDependencies`, `currentValue` and allowlisted descriptors are handled by the generic scalar path without row-key branches. Damage rows use DB-provided `currentMin/currentMax/currentStrength/strengthVariable`; plus/minus remains local draft state with no per-click RPC. Verification accepted by the user: focused specs, `npx tsc --noEmit`, `npm run build` with existing warnings only, static greps for no debug logs/eval/new Function/display-string parsing, and user-side manual smoke.

## UI-HERO-3 — Stat allocation draft and save flow

**Goal:**  
Ujednolicić draft state, validation and save UX dla stat allocation.

**Scope:**
- local draft state for plus/minus stat changes,
- computed draft spent,
- computed remaining after save,
- stat cost display if available,
- save/reset actions,
- stale guards around async save,
- success/error feedback using toast/messages according to project patterns.

**Out of scope:**
- changing stat cost formulas,
- changing CP ledger semantics,
- granting XP/level-up CP,
- admin correction tools.

**Data/source rules:**
- save through canonical stat allocation operation/RPC,
- no direct update to stat/hero/ledger/audit tables,
- async save must guard against active hero/server change,
- after save, refresh active hero/stat/CP state through existing services.

**UI/SCSS rules:**
- controls use shared buttons/forms/vendor wrappers,
- validation errors use form messages, not muted helper text,
- no local action card styling if global pattern exists.

**Dependencies/blockers:**
- if existing save service lacks needed return data, report service/RPC limitation,
- if stale guard pattern exists, reuse it; if missing, implement local guard carefully and report.

**Acceptance criteria:**
- draft cannot overspend CP,
- save disabled or blocked when invalid,
- successful save refreshes stats and CP,
- stale responses do not overwrite changed active hero/server context,
- build passes.

**Verification/smoke:**
- draft increment/decrement smoke,
- overspend validation smoke,
- save smoke if data available,
- stale/context change note if not testable,
- build/tsc.

**Required Codex report:**
- reused form/state/save service:
- checked but not reused:
- new state/helper added:
- stale guard approach:
- local SCSS added:

## UI-HERO-4 — Character Points summary placement

**Goal:**  
Ustalić i wdrożyć jedną, niedublowaną prezentację Character Points na Statistics page.

**Scope:**
- place Character Points / Draft spent / Remaining after save in same line as `Base stats allocation`,
- description/help text under that line,
- remove duplicated `14 CP available` style blocks if present,
- keep topbar/global CP display only where appropriate and not duplicative.

**Out of scope:**
- changing CP economy,
- CP ledger UI,
- trade CP lock UI,
- XP/CP progression redesign.

**Data/source rules:**
- CP balance from active hero/current progression read model,
- locked CP only if current screen needs it; stats page usually cares about spendable allocation CP,
- no hardcoded CP values.

**UI/SCSS rules:**
- CP values are important values, not `muted-text`,
- use chip/summary inline pattern from UI-CORE,
- avoid local CP badge styling.

**Dependencies/blockers:**
- if active hero CP state is stale after save, link to UI-HERO-3 refresh requirement.

**Acceptance criteria:**
- CP summary appears once in correct placement,
- Draft spent and Remaining after save update with draft,
- no duplicate CP panel,
- build passes.

**Verification/smoke:**
- draft change updates CP summary,
- no duplicate CP visible,
- build/tsc.

**Required Codex report:**
- CP source:
- duplicate UI removed:
- shared pattern used:
- local SCSS added:

---

# 13. UI-ITEMS — Armory, equipment and item display

Cel: armory, equipment preview, stands/sorting, item capacity and shared item popover. UI-ITEMS jest mocno zależne od UI-CORE-6 item popover contract oraz od aktualnego item/equipment read modelu. Nie wolno wymyślać equip/unequip workflow, jeśli DB/RPC go jeszcze nie ma.

## UI-ITEMS task index

- UI-ITEMS-1 — Armory overview and capacity
- UI-ITEMS-2 — Stands sorting UI
- UI-ITEMS-3 — Item popover shared display
- UI-ITEMS-4 — Equipment/paperdoll preview reuse
- UI-ITEMS-5 — Armory item list filtering and visibility
- UI-ITEMS-MOVE-1 — Armory item move action + selected-card cleanup
- UI-ITEMS-MOVE-2 — Armory drag-and-drop move between stands
- UI-ITEMS-MOVE-3 — Armory bulk move selected items to stand
- UI-ITEMS-MOVE-4 — Armory bulk drag-and-drop selected items

## UI-ITEMS-1 — Armory overview and capacity

**Goal:**  
Zbudować Armory overview pokazujące wyposażenie bohatera oraz listę posiadanych przedmiotów z jasnym rozróżnieniem: ile itemów bohater ma realnie, a ile jest widoczne przez aktualny rozmiar zbrojowni.

**Scope:**
- route/page target: existing armory route/page if present,
- equipment preview consistent with dashboard/paperdoll pattern,
- owned item list/grid,
- visible item count based on armory capacity,
- show real count vs visible capacity, e.g. `270 / 30`,
- item cards/rows with item name, type/slot, key requirements/status, drachma value on separate line,
- item hover/focus/click popover hook,
- empty/loading states.

**Out of scope:**
- equip/unequip workflow unless approved DB/RPC exists,
- item generation/balance admin,
- vendor scrap/sell flow,
- CP valuation for items,
- local item popover implementation if shared one is missing.

**Data/source rules:**
- item ownership/read model from current hero-owned item service,
- use active hero id, not auth uid,
- armory capacity from estate/building/bonus/runtime read model where available,
- if capacity source missing, report dependency and use safe placeholder in prototype only,
- item drachma value from item read model/snapshot, not CP market price.

**UI/SCSS rules:**
- use global item row/card and item popover pattern from UI-CORE,
- value in drachmas displayed on its own line in item card,
- no local copied card/popover CSS,
- item status/requirement warnings use semantic badge/status styling, not muted text.

**Dependencies/blockers:**
- if equip/unequip RPC is missing, keep preview read-only and report blocker for interactive equipment,
- if armory capacity calculation is unavailable, report runtime dependency,
- if shared item popover is missing, link to UI-CORE-6 and avoid local duplicate.

**Acceptance criteria:**
- equipped items and inventory are both visible,
- item capacity distinction visible as real count vs visible count,
- item drachma value appears on separate line,
- hover/focus/click can surface item detail through shared pattern or dependency is reported,
- no fake CP item value,
- build passes.

**Verification/smoke:**
- route smoke for Armory,
- smoke with item count greater than capacity if data/mock available,
- empty inventory smoke,
- item popover smoke if implemented,
- build/tsc.

**Required Codex report:**
- reused item/equipment services:
- capacity source:
- checked but not reused:
- new component/state/helper added:
- local SCSS added:
- not added intentionally:

**Status:** Accepted on 2026-05-16. `/game/armory` now uses the shared dashboard equipment preview path for equipped items, with the Armory page host following the accepted full-width host pattern. The inventory surface shows visible/owned count, capacity and hidden count clearly, renders shelves from highest position down with Unsorted last, and uses the same order for move targets. Item cards preserve name/status/guild context, drachma value on a separate line, Details popover entry, equip, bulk equip, move, vendor and guild restriction behavior. Full requirements remain available through the existing Details popover/detail contract; always-visible list-card requirement/type/slot summaries are a future read-model enhancement, not a blocker. No fake item semantics, direct DB writes, generated type changes or player-facing admin links were added. Manual visual smoke was user-side accepted.

## UI-ITEMS-2 — Stands sorting UI

**Goal:**  
Dodać stands as armory organization/visibility priority UI: stand 10 has highest visibility priority, stand 0 is default/lowest.

**Scope:**
- 10 stands visible,
- default stand = 0,
- display item groups from stand 10 down to stand 0,
- empty stands visibly present,
- item assignment/stand movement UI if backend/state exists,
- optional drag/drop as UX enhancement only if safe,
- stand labels/names can be shown as editable later but not required now.

**Out of scope:**
- DB schema for named stands if not present,
- persistent drag/drop mutation without approved workflow,
- auto-sorting algorithm beyond display priority,
- hiding empty stands completely.

**Data/source rules:**
- stand assignment must come from item/armory read model if implemented,
- if stand assignment does not exist, render prototype/read-only grouping only or report dependency,
- persistent stand changes must go through canonical RPC/service if available; no direct item updates.

**UI/SCSS rules:**
- stands use shared section/card/list patterns,
- empty stand style must be visible but subtle,
- drag handles/icons from custom icon registry where possible,
- no local drag/drop CSS if project has existing pattern.

**Dependencies/blockers:**
- no stand persistence model -> report DB/read model blocker,
- no drag/drop support pattern -> keep click/select move or postpone.

**Acceptance criteria:**
- all 10 stands represented,
- stand ordering is 10 → 1,
- empty stands visible,
- item visibility priority concept is clear,
- no fake persistent move if backend missing,
- build passes if implemented.

**Verification/smoke:**
- visual smoke with empty and non-empty stands,
- ordering smoke,
- persistence smoke only if backend exists,
- build/tsc.

**Required Codex report:**
- stand data source:
- move/persistence path:
- drag/drop used or deferred:
- local SCSS added:

**Status:** Accepted on 2026-05-16 as the Armory standy visual cleanup. The `Visible armory` standy presentation now uses full-width elevated inventory surfaces, full-width headers with fixed number badges, normal text-color stand titles, secondary visible-count state and subtle empty stand content below the header. Rename is inline through PrimeNG Inplace in the stand header, uses Reactive Forms, dark themed `pInputText`, icon-only confirm/cancel actions and no checkbox or speculative selection behavior. The stand number badge uses reusable global `radius-circle` and `square-9` utilities instead of inline styles or Armory-local CSS. The paperdoll/equipment preview layout was not changed in this pass. No fake item/type/slot/requirement logic, DB/read-model changes or new item actions were added. Focused Armory specs, `npx tsc --noEmit`, `npm run build` and static greps passed; manual visual smoke was user-side accepted.

## UI-ITEMS-3 — Item popover shared display

**Goal:**  
Wprowadzić lub zastosować shared item popover display wszędzie tam, gdzie pojawia się item: Armory, Auction House, Direct Trade, Reports, Rewards.

**Scope:**
- item name with quality/tier,
- item kind and equip slot, e.g. one-handed, two-handed, ranged, shield/offhand, head/chest/ring,
- icon box on right,
- native item stats such as damage/defense,
- bonuses as separate rows,
- requirements and not-equippable state,
- drachma value,
- boosted values visually marked,
- report/trade snapshot compatibility.

**Out of scope:**
- item generation DB changes,
- equip/unequip,
- CP market valuation,
- per-feature tooltip CSS,
- exposing private/staff-only item metadata in player UI.

**Data/source rules:**
- item stats/bonuses/requirements from item read model or snapshot,
- report/trade popovers must use durable snapshot/fallback when historical,
- no live recompute of historical item value if report snapshot exists,
- no CP value as inherent item value.

**UI/SCSS rules:**
- use PrimeNG popover/tooltip wrapper or shared overlay pattern,
- no duplicate local popover styles,
- icon placeholder via custom icon registry/fallback,
- boosted values use gold/accent treatment, not generic success green unless semantically appropriate.

**Dependencies/blockers:**
- missing resolved item stats -> report data dependency,
- missing shared popover -> implement through UI-CORE-6 or report blocker,
- missing requirements read model -> show safe partial and report gap.

**Acceptance criteria:**
- item popover shows all required categories when data exists,
- damage displayed as item stat, not only as bonus,
- bonuses remain visible separately,
- boosted values distinguish base vs boosted,
- no CP valuation,
- build passes.

**Verification/smoke:**
- hover/focus smoke for one item,
- not-equippable example smoke if data available,
- report/trade item smoke if integrated,
- build/tsc.

**Required Codex report:**
- item data source:
- popover/wrapper reused:
- missing fields:
- local SCSS added:

**Status:** Accepted on 2026-05-18 for the core shared item popover behavior. Item popovers on item icons/cards are usable, item detail display covers the accepted value/stat/bonus/requirement behavior for this task, icons render visibly, requirement state does not rely on visible `Met` / `Not met` row badges, and stats/bonus/value alignment is acceptable. Known non-blocking follow-up: `EquipmentPreview` / paperdoll responsive geometry remains imperfect across breakpoints, including possible boots/greaves ordering and slot positioning issues; handle this later as a dedicated paperdoll breakpoint refactor, not as a blocker for UI-ITEMS-3. Broader manual breakpoint smoke remains tester-side/future.

## UI-ITEMS-4 — Equipment/paperdoll preview reuse

**Goal:**  
Ujednolicić equipment/paperdoll preview między Dashboard, Armory i przyszłymi report/combat contexts.

**Scope:**
- main hand/off hand order: main hand first, off hand second,
- visible equipment slots,
- equipped item compact display,
- empty slot display,
- item popover on equipped item,
- read-only preview unless equip workflow exists.

**Out of scope:**
- equip/unequip mutation,
- combat equipment snapshot persistence,
- defender private equipment reveal in PvP reports.

**Data/source rules:**
- read equipped items from current equipment/read model,
- if equipment model exists but equip RPC missing, preview remains read-only,
- report/combat contexts use snapshots/allowed labels, not live/private data.

**UI/SCSS rules:**
- shared paperdoll/equipment component or global pattern,
- no local duplicate equipment slot styling,
- empty slot state visible.

**Dependencies/blockers:**
- missing equipment read model -> dependency,
- missing item popover -> dependency on UI-CORE-6.

**Acceptance criteria:**
- Dashboard and Armory can reuse same preview pattern,
- main/off hand order correct,
- empty slots clear,
- no fake equip actions,
- build passes.

**Verification/smoke:**
- visual smoke with equipped and empty slots,
- item popover smoke,
- build/tsc.

**Required Codex report:**
- equipment source:
- shared component reused/added:
- mutation intentionally not added:
- local SCSS added:

**Status:** Accepted/completed on 2026-05-18 for Armory shared `EquipmentPreview` reuse, paperdoll equipped-item selection and bulk unequip actions. Armory mode now controls selected equipped slots through page state, exposes `Unequip Selected` and `Unequip All`, and uses the canonical `bulk_unequip_hero_items(...)` RPC path without direct `hero_equipment` writes, DB/RPC/schema changes or generated type edits. The accepted item popover behavior remains preserved. Known follow-up: paperdoll responsive geometry/breakpoint polish remains imperfect and should be handled later as a dedicated paperdoll breakpoint pass, not as a blocker for UI-ITEMS-4. Broader manual visual smoke remains user/tester-side pending.

## UI-ITEMS-5 — Armory top header and summary badges

**Goal:**  
Make the top `/game/armory` header read closer to the prototype: clear Armory title, short explanatory copy, and compact owned/visible/capacity/hidden/hero luck badges.

**Scope:**
- Only the Armory top page header section.
- Arrange existing title/copy/badges into a cleaner hierarchy.
- Use current read-model values already available in the page.
- Keep badge labels short and readable.
- Keep production shell style, not prototype CSS.

**Out of scope:**
- Stand cards.
- Item cards.
- Filters.
- Search.
- Paperdoll changes.
- Equip/unequip logic.
- DB/RPC/read model changes.

**File limit:**
- Prefer `armory-page.html` only.
- If unavoidable, one small SCSS/global utility touch may be reported first before coding.

**Acceptance criteria:**
- Header visually reads as Armory landing/header, not a random card.
- Owned/visible/capacity/hidden/luck summary remains correct.
- No behavior changes.
- Dashboard unaffected.

**Verification/smoke:**
- `/game/armory` visual smoke desktop.
- Counts still display.
- Build/tsc.

**Required Codex report:**
- files changed:
- header hierarchy changed:
- data fields used:
- local SCSS added:
- manual smoke pending:

**Status:** Accepted on 2026-05-18 for the current Armory visual/header slice only. The `/game/armory` top header now follows the accepted title, description and structured metrics direction, with `Armory capacity`, `Total items`, `Equipped items` and `Saved loadouts` displayed as compact metric rows. Saved loadouts reuse the shared `HeroLoadoutPresetsState` path rather than a fake value or separate local fetch, and `.mg-section__title` no longer applies a gold gradient by default; gradient heading treatment is opt-in only. This acceptance covers the split header task, not the original broad filtering/list-visibility scope. Manual visual smoke remains user-side pending. Follow-ups: filtering/visibility/pagination/locked-status work remains in later split UI-ITEMS tasks; Armory page component split/cleanup remains a future refactor; do not churn `EquipmentPreview` geometry or accepted popover behavior from this status update.

---

## UI-ITEMS-6 — Visible Armory panel header only

**Goal:**  
Improve only the header area of the `Visible armory` panel so it matches the prototype direction: title, short capacity explanation, and compact status badges.

**Scope:**
- Only the top header block inside the `Visible armory` panel.
- Keep existing item/stand rendering untouched.
- Add or rearrange badges for visible/owned/capacity/hidden if already available.
- Keep text concise.

**Out of scope:**
- Stand section redesign.
- Item card redesign.
- Filters/search.
- Bulk selection changes.
- Any paperdoll work.
- DB/RPC changes.

**File limit:**
- Prefer `armory-page.html` only.

**Acceptance criteria:**
- `Visible armory` header is clearer and closer to prototype.
- Existing stand/item behavior unchanged.
- No new local component.

**Verification/smoke:**
- Armory visual smoke.
- Existing equip/move controls still present.
- Build/tsc.

**Required Codex report:**
- files changed:
- panel header changes:
- counts/badges used:
- behavior unchanged confirmation:

**Status:** Accepted/completed on 2026-05-18. The `Visible armory` panel header was intentionally simplified to a single `Inventory` heading so it no longer duplicates the main Armory page header metrics or capacity explanation. The existing capacity mini-summary cards remain below the header, and stand sections, item cards, filters, EquipmentPreview, equip/unequip behavior, DB/RPC contracts and generated types were not changed for this accepted slice. Manual visual smoke remains user-side pending. Follow-ups remain separate: Armory page split/refactor and later item/stand/filter tasks.

---

## UI-ITEMS-7 — Remove redundant Inventory mini-summary cards

**Goal:**  
Remove the redundant Inventory mini-summary cards because `Armory capacity`, `Total items`, `Equipped items` and `Saved loadouts` are owned by the main Armory header.

**Scope:**
- remove the three Inventory mini summary cards: `Owned items`, `Visible capacity`, `Hidden`;
- leave the simple `Inventory` panel header;
- leave bulk selection toolbar below it;
- do not replace the removed cards with another summary/copy/badge row.

**Out of scope:**
- Search/filter controls.
- Stand sections.
- Item cards.
- Pagination.
- Top Armory header.
- DB/RPC changes.

**File limit:**
- Prefer `armory-page.html` only.

**Acceptance criteria:**
- `Inventory` panel no longer repeats metrics already shown in the main header.
- No new replacement summary is added.
- Layout still reads cleanly.

**Verification/smoke:**
- `/game/armory` visual smoke.
- Inventory panel starts with one `Inventory` heading, then bulk selection / content.
- Build/tsc.

**Required Codex report:**
- files changed:
- exact removed block:
- confirmation no replacement summary added:
- confirmation no TS/SCSS/behavior changes:
- manual smoke pending:

**Status:** Accepted/completed on 2026-05-18. The three Inventory mini-summary cards (`Owned items`, `Visible capacity`, `Hidden`) were removed because those metrics are owned by the main Armory header (`Armory capacity`, `Total items`, `Equipped items`, `Saved loadouts`). No replacement summary/copy/badge row was added; the Inventory panel now starts with the single `Inventory` heading followed by bulk selection/content. User-side visual smoke passed. No TS, SCSS, EquipmentPreview, item cards, stand sections, filters, equip/unequip behavior, DB/RPC contracts or generated types were changed for this accepted task.

---

## UI-ITEMS-8 — Stand section header compact polish

**Goal:**  
Make each stand section header more like the prototype: clear stand number, stand label, item count badge, and rename action without visual noise.

**Scope:**
- Only stand section headers.
- Preserve existing stand order.
- Preserve rename behavior.
- Keep empty and occupied stand headers structurally consistent.
- Use existing badges/status utilities.

**Out of scope:**
- Item card layout inside stands.
- Empty stand body.
- Filtering.
- Drag/drop.
- DB/RPC changes.

**File limit:**
- Prefer `armory-page.html` only.
- No TS unless a tiny computed label is absolutely required; ask/report before adding.

**Acceptance criteria:**
- Stand headers are visually consistent.
- Stand number and item count are easy to scan.
- Rename action remains available.
- No action behavior changes.

**Verification/smoke:**
- Stand 10/9/empty stand header smoke.
- Rename UI still appears.
- Build/tsc.

**Required Codex report:**
- files changed:
- stand header fields used:
- rename behavior preserved:
- local SCSS added:

**Status:** Accepted/completed on 2026-05-18. Stand section headers now keep the stand number, primary stand label, item-count badge and rename action compact and consistent without changing stand order or rename behavior. Manual visual smoke remains user-side pending for: custom persisted stand label, default `Stand N` label, `Unsorted` label, item-count badge, and rename open/save/cancel.

---

## UI-ITEMS-9 — Empty stand body visual state

**Goal:**  
Make empty stands look intentional and prototype-like: visible empty state, ready/reserved copy, no broken large blank panels.

**Scope:**
- Only empty stand body rendering.
- Keep existing stand header untouched except where already changed in UI-ITEMS-8.
- Use current copy or simple improved copy.
- Use existing card/border/muted/warn/status utility patterns.

**Out of scope:**
- Drag/drop.
- Reserving stands.
- Item movement behavior.
- Filtering.
- DB/RPC changes.

**File limit:**
- Prefer `armory-page.html` only.

**Acceptance criteria:**
- Empty stands are clearly empty, not broken.
- Empty stand body aligns visually with occupied stand sections.
- No action behavior changes.

**Verification/smoke:**
- Empty stand visible.
- Occupied stand unchanged.
- Build/tsc.

**Required Codex report:**
- files changed:
- empty-state copy:
- behavior unchanged confirmation:

**Status:** Accepted/completed on 2026-05-18. Empty stand body now renders as a simple intentional empty state with an icon and `Empty stand` only, without replacement summary copy or behavior changes. Manual visual smoke is user-side accepted for this slice.

---

## UI-ITEMS-10 — Visible item card shell

**Goal:**  
Create a consistent shell for item cards in visible stands, without changing item actions yet.

**Scope:**
- Only the outer visual shell of item cards in `Visible armory`.
- Keep existing item action controls and popover wrapper.
- Use a consistent icon/name/value stack.
- Preserve item popover behavior.
- Preserve equip/vendor/move controls for now.

**Out of scope:**
- Action redesign.
- Filters.
- Sorting.
- New component extraction.
- DB/RPC changes.
- Paperdoll.

**File limit:**
- Prefer `armory-page.html`.
- No new component in this task.

**Acceptance criteria:**
- Item cards look consistent.
- Item name and drachma value are readable.
- Popover still opens.
- Existing actions still appear.

**Verification/smoke:**
- Item card hover/focus/click popover.
- Equip button still visible.
- Vendor/move controls still visible if previously visible.
- Build/tsc.

**Required Codex report:**
- files changed:
- item card shell changes:
- popover preserved:
- local SCSS added:

**Status:** Accepted/completed on 2026-05-18 after user-side visual checkpoint. The visible Inventory item cards now follow the accepted compact prototype direction with real project item icons, item name, classification-backed metadata, drachma value, visible `Equip` / `Sell to vendor` actions and click-to-select card state. The item grid uses the accepted compact global utility direction so cards distribute without overflowing the stand. The current card/grid direction is frozen for UI-ITEMS-10; do not change EquipmentPreview, paperdoll, popover behavior, stand headers, empty stand cards, TS services, DB/RPC contracts or generated types from this accepted task.

---

## UI-ITEMS-11 — Item card status badges

**Goal:**  
Make equipped/private/locked/lifecycle state badges readable and consistent on item cards.

**Scope:**
- Only item-card badges/status labels.
- Use existing lifecycle/guild usage labels already available.
- Important statuses must not be muted if they communicate action restrictions.
- Keep actions unchanged.

**Out of scope:**
- New lifecycle logic.
- New read-model fields.
- Filters.
- Sorting.
- Item card shell changes beyond small badge placement.

**File limit:**
- Prefer `armory-page.html` only.

**Acceptance criteria:**
- Equipped/private/locked states are visible.
- Badges do not overwhelm the card.
- No fake status inference.

**Verification/smoke:**
- Active item smoke.
- Equipped item smoke.
- Locked item smoke if data exists.
- Build/tsc.

**Required Codex report:**
- files changed:
- statuses displayed:
- statuses not available:
- behavior unchanged confirmation:

**Status:** Accepted/completed on 2026-05-18. Visible Inventory item cards now show lifecycle/guild badges only for non-default states, keeping default `Active` and `Owned private item` hidden so compact cards do not regain status noise. The accepted UI-ITEMS-10 grid/card direction, popover behavior and visible `Equip` / `Sell to vendor` actions were preserved; no DB/RPC contracts, generated types or status-inference logic were changed. Follow-up capacity semantics and TS cleanup are also accepted: equipped items are filtered out of visible Inventory stands and the displayed `Armory capacity` numerator, while dead checkbox/select/Move form/control code was removed and bulk selection remains signal-based. Full manual Inventory smoke remains user-side/pending.

---

## UI-ITEMS-12 — Bulk selection toolbar polish

**Goal:**  
Make bulk selection controls clear and prototype-adjacent without changing the bulk equip workflow.

**Scope:**
- Only the bulk selection toolbar above visible stands.
- Keep existing bulk equip behavior.
- Display selected count clearly.
- Keep disabled state readable.
- Do not add new actions.

**Out of scope:**
- Item card selection redesign.
- Filtering.
- Sorting.
- Bulk unequip paperdoll actions.
- DB/RPC changes.

**File limit:**
- Prefer `armory-page.html` only.

**Acceptance criteria:**
- Selected count and `Equip selected` are easy to understand.
- Disabled state is clear.
- No workflow changes.

**Verification/smoke:**
- Select visible item for bulk equip.
- Button enabled/disabled state.
- Build/tsc.

**Required Codex report:**
- files changed:
- toolbar changes:
- behavior unchanged confirmation:

**Status:** Accepted/completed on 2026-05-18. The Armory bulk actions toolbar is now a compact reusable `app-armory-bulk-actions-toolbar` rendered both above and below the visible stand list, showing `N selected · X drachma` with clear disabled/action-busy states. Bulk equip keeps the existing equipment workflow, and bulk vendor sell now uses the canonical `bulk_vendor_scrap_hero_items(...)` path with a PrimeNG `ConfirmDialogModule` confirmation, project dialog styling, success/danger confirm buttons and toast-based action feedback. The accepted Inventory card/grid direction, EquipmentPreview, popovers, stand headers and empty states were not changed. Manual smoke remains user-side/pending.

---

## UI-ITEMS-13 — Item card action layout cleanup

**Goal:**  
Reduce visual noise of per-item actions inside visible item cards while preserving behavior.

**Scope:**
- Only layout/order/grouping of existing actions: Equip, Sell to vendor, Move, shelf select.
- Do not add or remove actions unless already conditionally hidden by existing logic.
- Keep form controls and handlers unchanged.
- Keep PrimeNG usage valid.

**Out of scope:**
- New action workflows.
- Auction/trade creation.
- Vendor economy changes.
- DB/RPC changes.
- Component extraction.

**File limit:**
- Prefer `armory-page.html` only.

**Acceptance criteria:**
- Actions are easier to scan.
- Item cards are less chaotic.
- Existing controls still work.

**Verification/smoke:**
- Equip item action.
- Move item action.
- Vendor scrap if available.
- Build/tsc.

**Required Codex report:**
- files changed:
- action layout changes:
- handlers preserved:
- manual smoke pending:

**Status:** Rejected/superseded on 2026-05-19 after concept change. Per-item action layout cleanup is not pursued as a separate task; continue with the simplified Armory search pass in UI-ITEMS-14.

---

## UI-ITEMS-14 — Basic Armory search only

**Goal:**  
Add a simple search input for visible armory items after the visual layout is stable.

**Scope:**
- Search by item name only at first.
- Client-side filtering over current visible read model only.
- Clear empty filtered state.
- Preserve stand grouping: stands remain visible or hidden according to simple, documented rule.

**Out of scope:**
- Slot/kind/status filters.
- Server-side search.
- Pagination.
- Sorting.
- Search by bonus/requirement unless already trivial and safe.
- DB/RPC changes.

**File limit:**
- Prefer `armory-page.ts` + `armory-page.html`.
- No new service.

**Acceptance criteria:**
- Search is clear and not overbuilt.
- Empty result is understandable.
- Existing actions still work on filtered items.

**Verification/smoke:**
- Search matching item.
- Search with no result.
- Clear search.
- Build/tsc.

**Required Codex report:**
- files changed:
- search fields used:
- filtering location:
- empty result behavior:

**Status:** Accepted/completed on 2026-05-19 as the current Armory search/filter pass. The Inventory panel now has a wide production-styled filter bar with text search over visible card text (item name plus compact type/slot metadata), one player-facing `Pierścień` slot option that covers both ring slots, a slot dropdown that preserves off-hand/shield matching for `Druga ręka`, and an availability dropdown with player-facing labels (`Available`, `Offered in trade`, `Listed on auction`). Clear resets text, slot and availability filters; no-match uses the accepted maze empty state; search highlights exact normalized visible matches without `Matched ...` chips or hidden/system tokens such as `none`. The implementation keeps top and bottom bulk toolbars, selection is not cleared merely by emitting bulk actions, and bonus search is explicitly deferred until `get_hero_armory_items` / `ArmoryItemSummary` expose list-facing DB/RPC-backed bonus labels/targets/search tokens. Manual smoke was user-side accepted for the current scope. Follow-up: at the next larger Armory touch, continue reducing `ArmoryInventorySection` and separating inventory state/rendering where it provides real cleanup value.

---

## UI-ITEMS-15 — Slot/kind filter only

**Goal:**  
Add one compact slot/kind filter after search is stable.

**Scope:**
- One filter control for item slot/kind group.
- Use fields already present in current item read model.
- If field is missing/ambiguous, report dependency instead of inventing logic.
- Preserve search behavior from UI-ITEMS-14.

**Out of scope:**
- Lifecycle/status filter.
- Stand filter.
- Sorting.
- Server-side filtering.
- DB/RPC changes.

**File limit:**
- Prefer `armory-page.ts` + `armory-page.html`.

**Acceptance criteria:**
- Filter options are clear.
- Filter combines predictably with search.
- No fake classification if data missing.

**Verification/smoke:**
- Weapons filter.
- Armor filter.
- Jewelry filter if data exists.
- Search + filter combined.
- Build/tsc.

**Required Codex report:**
- files changed:
- filter data fields:
- missing fields:
- filter combination rule:

---

## UI-ITEMS-16 — Lifecycle/status filter only

**Goal:**  
Add lifecycle/status filter after search and slot/kind filter are stable.

**Scope:**
- Filter by status/action state available in read model: active, equipped, locked_trade, locked_auction where available.
- Normal inventory should not surface scrapped items unless current read model explicitly includes relevant recoverable/scrapped state.
- Locked states must not appear selectable for invalid actions.

**Out of scope:**
- New lifecycle rules.
- Recover scrapped UI.
- Auction/trade workflows.
- Server-side filter.
- DB/RPC changes.

**File limit:**
- Prefer `armory-page.ts` + `armory-page.html`.

**Acceptance criteria:**
- Status filter is readable.
- Locked/equipped/active states are handled honestly from data.
- Missing statuses are reported, not faked.

**Verification/smoke:**
- Active status filter.
- Equipped filter.
- Locked status smoke if data exists.
- Build/tsc.

**Required Codex report:**
- lifecycle source:
- statuses handled:
- statuses unavailable:
- no fake status inference confirmation:

---

## UI-ITEMS-17 — Stand filter only

**Goal:**  
Add a simple stand filter after item search/status filters are stable.

**Scope:**
- Filter visible items by stand/shelf position.
- Use current shelf/stand data.
- Keep stand sections understandable.
- Preserve search/slot/status filters.

**Out of scope:**
- Stand priority logic changes.
- Capacity rule changes.
- Drag/drop.
- DB/RPC changes.

**File limit:**
- Prefer `armory-page.ts` + `armory-page.html`.

**Acceptance criteria:**
- Stand filter options match visible stands.
- Empty stand/filter result state is clear.
- Existing item actions work.

**Verification/smoke:**
- Filter by Stand 10.
- Filter by empty stand if applicable.
- Combined filters.
- Build/tsc.

**Required Codex report:**
- stand data source:
- filter options:
- empty result behavior:

**Status:** Accepted/completed on 2026-05-19. The Armory Inventory filter bar now includes a stand dropdown backed by current shelf/read-model data, preserving search, slot and availability filters in the same wide control row. Selecting an empty stand renders that stand in its normal empty-stand state without the global maze/no-match banner; global no-result state now keys off rendered shelf state (`visibleShelves().length === 0`). The duplicated filter-bar `X matching item(s)` badge was removed, while Clear still resets text, slot, availability and stand filters. User-side smoke accepted `Pierścień`, empty current data for trade/auction availability, combined filter behavior and bulk toolbar preservation. Follow-ups remain non-blocking: bonus search needs list-facing DB/RPC/read-model support; `ArmoryInventorySection` can be reduced further on a later Armory touch; filter controls may move into a `FormGroup` if the bar grows; PrimeNG wrapper styling can be revisited in a future vendor-wrapper cleanup.

---

## UI-ITEMS-18 — Capacity cutoff explanation

**Goal:**  
Make current visible capacity and hidden item count understandable without implementing pagination yet.

**Resolved prerequisite:**  
Capacity semantics for equipped vs stored inventory were implemented after UI-ITEMS-11 acceptance. Equipped items remain in Equipment Preview / Current loadout, are filtered out of visible Inventory stands, and `Armory capacity` displays the stored visible item count rather than stored plus equipped items. The UI should not show confusing states such as `39 / 30` only because items are currently equipped.

**Scope:**
- Explain owned / visible / hidden relationship.
- If capacity cuts off lower-priority stands, show a small note/badge.
- Do not change actual visibility logic.
- Do not add pagination.

**Out of scope:**
- Large-list pagination.
- Server-side pagination.
- Stand priority changes.
- DB/RPC changes.

**File limit:**
- Prefer `armory-page.html` only.

**Acceptance criteria:**
- User can understand why some items are hidden.
- Counts match read model.
- No fake data.

**Verification/smoke:**
- Capacity full state.
- Hidden count > 0 state.
- Hidden count = 0 state if data available.
- Build/tsc.

**Required Codex report:**
- capacity fields used:
- copy added:
- no logic change confirmation:

**Status:** Accepted/completed on 2026-05-19. The Armory summary card was reduced to the accepted scope: `Hidden by capacity` and explanatory capacity copy were removed, `Armory capacity` shows only the visibility limit, and `Total items` uses the stored inventory item count from the existing visible/stored Armory item path so equipped items are excluded. `Equipped items` and `Saved loadouts` remain unchanged. No visibility/capacity logic, filters, stands, pagination, DB/RPC contracts, generated types or specs were changed. Manual smoke was user-side accepted for the header values.

---

## UI-ITEMS-19 — Large visible list safe display

**Goal:**  
Prevent large visible item lists from making Armory unusable, using existing project list/scroll/paginator patterns only.

**Scope:**
- Review existing list/paginator/scroll patterns.
- Apply the smallest existing pattern that fits.
- If no good pattern exists, report follow-up instead of building custom local virtual scroll.
- Keep filters from UI-ITEMS-14–17 intact.

**Out of scope:**
- New backend pagination.
- Custom virtual scroll.
- Table redesign.
- Economy sorting.
- DB/RPC changes.

**File limit:**
- Depends on existing pattern, but Codex must report planned touched files before implementing if more than 3 production files.

**Acceptance criteria:**
- Large visible list remains usable.
- Existing visual hierarchy remains intact.
- No local dense table unless already an accepted project pattern.

**Verification/smoke:**
- Large list smoke if data exists.
- Filter + large list smoke.
- Build/tsc.

**Required Codex report:**
- existing pattern checked:
- pattern used or rejected:
- files changed:
- large-list smoke:

**Status:** Deferred / potentially cancelled on 2026-05-19 after the accepted UI-ITEMS-14, UI-ITEMS-17 and UI-ITEMS-18 Armory passes. Current user smoke considers the visible Inventory usable enough for this UI slice, so large-list pagination/scroll work should not be added speculatively. Reopen only if representative large-list testing shows the Armory becomes hard to use, and then follow UI-CORE-14 rather than adding custom local pagination.

---

## UI-ITEMS-20 — Armory final visual consolidation checkpoint

**Goal:**  
Do a final small visual consistency pass after UI-ITEMS-5–19, without adding new features.

**Scope:**
- Check spacing consistency between header, equipment preview, visible armory, stand sections and item cards.
- Remove only obvious duplicate/obsolete local classes introduced in these Armory tasks.
- Verify no prototype CSS/`mb-*` leaked.
- Verify no `NgClass`.
- Verify no unnecessary local SCSS.

**Out of scope:**
- New filters.
- New actions.
- Component split.
- Large TS refactor.
- DB/RPC changes.
- Paperdoll geometry redesign.

**File limit:**
- Codex must provide a no-code inventory first if it expects to touch more than 3 production files.

**Acceptance criteria:**
- Armory is visually coherent enough for tester usage.
- No obvious temporary classes/comments/debug markup.
- No broad churn.
- Manual smoke checklist is documented.

**Verification/smoke:**
- Armory desktop visual smoke.
- Dashboard preview smoke.
- Popover smoke.
- Bulk equip/unequip smoke.
- Build/tsc.

**Required Codex report:**
- files changed:
- obsolete classes removed:
- static greps:
- manual smoke pending/done:
- known follow-ups:

**Status:** Accepted/completed on 2026-05-19. Final Armory visual consolidation stayed intentionally small: the obsolete nested Inventory heading wrapper was removed, the Inventory heading keeps the existing `mg-section__title` rhythm and spacing, and the pass confirmed no `NgClass`/`ngClass`, `className`, `ngModel`, `FormsModule`, `button pButton`, prototype `mb-*`, debug/TODO/temporary copy, hidden-capacity copy or `Matched` chip in the touched Armory paths. No TS logic, filters, actions, DB/RPC/schema/generated types, specs, SCSS or unrelated docs were changed. Manual smoke remains minimal/user-side for Armory desktop rhythm, filter bar layout, item popover sanity and bulk toolbar sanity.

---

## UI-ITEMS-MOVE-1 — Armory item move action + selected-card cleanup

**Goal:**
Add an explicit non-drag action for moving a stored Armory item between stands/shelves while cleaning local selected-card styling to use the global selected-card treatment.

**Scope:**
- selected-items toolbar action, beside `Equip selected` and `Sell selected`;
- canonical `move_hero_armory_item_to_shelf` path through existing Armory service/state wrappers;
- stored items only;
- one eligible selected item only unless a canonical bulk move path exists;
- destination selector sourced from current shelf/read-model data;
- current stand omitted from destination options;
- global `.mg-card--selected` for selected item cards.

**Out of scope:**
- drag-and-drop;
- uncontrolled multi-RPC bulk move loops;
- shelf creation/deletion;
- DB/RPC/schema/generated type edits;
- local Armory SCSS.

**Acceptance criteria:**
- selecting one eligible stored item enables a toolbar `Move selected` workflow;
- selecting a valid destination enables the button immediately;
- move uses `ArmoryShelfState.moveItemToShelf(...)` / `PlayerArmory.moveItemToShelf(...)` / `move_hero_armory_item_to_shelf`;
- current stand is not offered as destination;
- ineligible/guild/locked items cannot be moved through private action UI;
- no per-card move selector or CDK drag/drop remains;
- selected item styling uses global `.mg-card--selected`;
- build/tsc/static greps pass.

**Verification/smoke:**
- select one eligible stored item, choose destination, move succeeds and refreshed item appears under destination stand;
- two selected items keep move disabled because no canonical bulk move path exists;
- current stand omitted from destination options;
- selected-card visual remains acceptable.

**Status:** Accepted/completed on 2026-05-19. `Move selected` now lives in the reusable selected-items toolbar, beside `Equip selected` and `Sell selected`, and uses the canonical single-item Armory shelf move path (`ArmoryShelfState.moveItemToShelf(...)` -> `PlayerArmory.moveItemToShelf(...)` -> `move_hero_armory_item_to_shelf`). Because no canonical bulk move path exists, move is intentionally limited to exactly one eligible selected stored item; no uncontrolled loop of single-item RPCs was added. Destination options come from the current shelf read model and omit the selected item's current stand. The stale disabled state was fixed by bridging `moveTargetControl.valueChanges` through `toSignal(...)`, so selecting a destination enables `Move selected` immediately. Per-card move selectors and CDK drag/drop are not part of this task. Selected item cards now use global `.mg-card--selected`. User-side smoke confirmed the move path works. No local SCSS, direct DB writes, DB/RPC/schema/generated edits or specs were added.

---

## UI-ITEMS-MOVE-2 — Armory drag-and-drop move between stands

**Goal:**  
Add drag-and-drop move for stored Armory items between stands/shelves as a separate follow-up after the normal selected-toolbar move action.

**Scope:**
- reuse the canonical move service/state path from UI-ITEMS-MOVE-1;
- check existing project drag/drop pattern first;
- if no project pattern exists, use the smallest standard Angular-supported approach and report it;
- same-stand drop must not call the RPC;
- blocked/private/guild/locked items must not be draggable;
- keep the toolbar move action as accessibility/fallback path.

**Out of scope:**
- reordering items within one stand unless backend explicitly supports it;
- bulk drag;
- shelf creation/deletion;
- mobile-perfect drag UX beyond fallback action;
- DB/RPC/schema/generated edits;
- local Armory SCSS unless a missing global pattern is explicitly accepted.

**Status:** Accepted/completed on 2026-05-19 after user-side smoke. Stored Armory item cards can now be dragged by grabbing the card surface and dropped onto another rendered stand/shelf, including empty stands, through Angular CDK drag/drop and the existing canonical move path (`ArmoryShelfState.moveItemToShelf(...)` -> `PlayerArmory.moveItemToShelf(...)` -> `move_hero_armory_item_to_shelf`). Same-stand drops return before mutation. Drag eligibility reuses the same active/private-action lifecycle rules as move/equip/sell, so guild/locked/non-active/private-action-blocked items are not draggable. The selected-toolbar `Move selected` fallback remains unchanged. Item selection, popover behavior, filters, selected-card styling and stand rendering were preserved. No local Armory SCSS, direct DB writes, DB/RPC/schema/generated edits, bulk drag or reorder behavior were added. Verification passed with `npx tsc --noEmit`, `npm run build` with existing warnings and static greps; focused Armory specs remain blocked by pre-existing stale spec compile errors unrelated to this task.

---

## UI-ITEMS-MOVE-3 — Armory bulk move selected items to stand

**Goal:**  
Replace the selected-toolbar one-item move limitation with canonical multi-item move through `bulk_move_hero_armory_items_to_shelf(...)`, while keeping drag-and-drop as the single-item path.

**Scope:**
- use `ArmoryShelfState.bulkMoveItemsToShelf(...)` -> `PlayerArmory.bulkMoveItemsToShelf(...)` -> `bulk_move_hero_armory_items_to_shelf`;
- keep toolbar `Move selected` beside `Equip selected` and `Sell selected`;
- support eligible selected stored items from one or many stands;
- do not loop the old single-item move RPC;
- preserve DnD single-item move, filters, selection and popovers.

**Out of scope:**
- bulk drag;
- reordering within a stand;
- DB/RPC/schema/generated edits;
- direct DB writes;
- local Armory SCSS;
- broader Armory page or preset cleanup.

**Status:** Accepted/completed on 2026-05-20 after user-side smoke. The selected-items toolbar now moves multiple eligible stored items from one or many stands through the canonical bulk RPC path (`ArmoryShelfState.bulkMoveItemsToShelf(...)` -> `PlayerArmory.bulkMoveItemsToShelf(...)` -> `bulk_move_hero_armory_items_to_shelf`). The frontend does not loop the old single-item `moveItemToShelf(...)` RPC for toolbar bulk move. Mapper logic lives in `core/utils/armory-actions-mappers.ts`, bulk move feedback formatting lives in `core/utils/armory-bulk-move-feedback.ts`, and the public result model exposes mapped `resultJournal` without raw `resultJournalJson`. Toast copy is player-facing, clean success reads like `You moved 2 items to Shelf 10.`, skipped/no-op outcomes are not fatal, and failed rows can surface short journal detail. Existing DnD single-item move remains preserved. No local SCSS, direct DB writes, DB/RPC/schema/generated edits or specs were added. Verification passed with `npx tsc --noEmit`, `npm run build` with existing warnings and static greps.

---

## UI-ITEMS-MOVE-4 — Armory bulk drag-and-drop selected items

**Goal:**
Extend Armory drag-and-drop so dragging one selected eligible item moves the whole selected eligible group to a target stand through the canonical bulk move RPC, while unselected item drag keeps the existing single-item move path.

**Scope:**
- selected-item drag resolves the current selected movable group and emits the accepted bulk move output/path;
- unselected item drag continues through `move_hero_armory_item_to_shelf`;
- same-stand group drops no-op when nothing meaningful would move;
- empty stands remain valid drop targets;
- compact custom CDK drag preview/placeholder communicates single-item vs selected-group drag;
- active group drag hides moved selected items from source positions during drag;
- Escape cancels the active CDK drag UI and guards against a follow-up drop mutation.

**Out of scope:**
- move RPC, DB/RPC/schema/generated edits;
- direct DB writes;
- toolbar bulk move changes;
- loadout preset UI changes;
- local Armory SCSS.

**Status:** Accepted/completed on 2026-05-20 after user-side smoke and final cleanup. Dragging an unselected eligible stored item still uses the canonical single-item move path, while dragging a selected eligible item moves the selected movable group through `ArmoryShelfState.bulkMoveItemsToShelf(...)` / `PlayerArmory.bulkMoveItemsToShelf(...)` / `bulk_move_hero_armory_items_to_shelf` without looping `moveItemToShelf(...)`. Same-stand group drops no-op when all moved items are already on target, empty stands work as valid targets, ineligible/guild/locked/non-active/private-action-blocked items are excluded by the existing eligibility guards, and toolbar `Move selected` remains preserved. Custom `cdkDragPreview` / `cdkDragPlaceholder` use a reusable `ArmoryItemDragPreview` component plus global reusable drag-drop styles under `src/scss/components`, with compact single-card and group stack/summary visuals; no local Armory SCSS was added. Active selected-group drag hides moved items from source positions, Escape cancels drag UI and prevents a later drop mutation. The accepted cleanup also refreshes equipment plus Armory state after equip/unequip/bulk equip/bulk unequip, moves equipment action toast formatting to `core/utils/equipment-action-feedback.ts`, and fixes Armory page spacing by keeping the route content wrapper as the first layout-affecting element with `app-loading-overlay` rendered after it. Verification passed with `npx tsc --noEmit` and `npm run build` with existing warnings; focused Armory specs remain blocked by pre-existing stale spec compile errors unrelated to this task.

---

## UI-ITEMS-PRESETS-1 — Compact Armory saved presets panel

**Goal:**
Replace the noisy Armory loadout preset management surface with a compact `Saved presets` panel that keeps canonical preset RPC/service behavior intact.

**Scope:**
- show the panel in the left Armory column below Equipment Preview;
- keep five compact horizontal preset rows with inline rename plus `Save preset`, `Apply` and `Clear`;
- open saved preset preview from the preset name hover/focus instead of a dedicated Preview button;
- keep preview content compact and item-focused, using available saved item rows and explicit slot-icon fallback where the read model lacks item classification fields;
- preserve current save, apply, clear, rename and preview service/RPC paths.

**Out of scope:**
- preset RPC contracts, generated types, DB/RPC changes;
- equipment equip/unequip flow;
- Armory move/drag/drop and inventory layout;
- selected-card styling.

**Status:** Accepted/completed on 2026-05-20 after user-side review. The Armory left column now keeps Equipment Preview first and renders a compact `Saved presets` panel below it, while the Armory header owns the saved preset count. Preset rows use stable full-width layout containment, truncated names, inline `p-inplace` rename, `Save preset`, saved-only `Apply`, and saved-only danger `Clear` with the accepted icon. Saved preset preview opens from the preset name hover/focus using the existing popover visual language, shows saved item rows once with name, slot label and unavailable status only when needed, and separates rendered item rows without adding local SCSS. Preview icons use an explicitly named `previewSlotFallbackIconClass(...)` because the current preset preview read model does not expose item classification fields needed for true item-type icons. No preset RPC, DB/generated type, move/drag/drop, inventory or Equipment Preview behavior changes were added. Verification passed with `npx tsc --noEmit` and `npm run build` with existing warnings; focused preset specs remain covered by the task changes but broader focused Armory specs are still blocked by pre-existing stale spec compile errors unrelated to this task.

---

# 14. UI-EXPLORATION — Exploration flow

Execution rule for all UI-EXPLORATION tasks:

- Treat `mythborne_exploration_flow_v_2.html` as visual/UX anchor, not production CSS source.
- Do not copy prototype `mb-*` classes, raw colors, raw gradients, raw dimensions or local prototype CSS.
- Adapt the prototype intent to the current accepted Mythsworn dashboard/game-shell style.
- Use existing global card/page-header/button/badge/progress/panel patterns.
- No local SCSS unless the task explicitly proves a missing production pattern.
- No DB/RPC/schema/generated type changes unless the task explicitly says so.
- No fake gameplay state, fake counters, fake timers, fake chance math or fake map/story content.
- Runtime/gameplay authority remains backend/RPC/read-model owned.
- If required data is missing from the current read model, report dependency instead of inventing frontend fallback.
- Use `<p-button />`, PrimeNG standalone components and existing wrappers/patterns. Do not use native `<button pButton>`, `ngModel`, `FormsModule`, `NgClass`/`ngClass`, or `className`.
- Important values, outcomes, state, probabilities and action-needed text must not be `muted-text`.
- Helper/metadata/descriptions may be muted.
- Each task must report exact reused helpers/components/services/patterns, checked-but-not-reused, and any new helpers/components.
- Manual smoke may remain user-side pending if Codex cannot execute real session/data smoke.


## UI-EXPLORATION-0 — Exploration UI source/prototype preflight

**Goal:**  
Prepare a no-code map of the current `/game/exploration` UI, backend/read-model support and prototype anchors before implementation continues.

**Scope:**
- Read `AGENTS.md`, UI/UX backlog, UI-CORE guidance and this UI-EXPLORATION section.
- Inspect `mythborne_exploration_flow_v_2.html` as visual anchor.
- Inspect current `/game/exploration` route/page/components.
- Identify current services/read models/RPC paths used by Exploration UI.
- Map prototype areas to current implementation readiness:
  - implement now;
  - already implemented;
  - dependency/blocker;
  - later task.

**Out of scope:**
- Production code changes.
- New components.
- DB/RPC/schema/generated type edits.
- Fake data/timers/counters/chance values.

**Data/source rules:**
- Difficulty, status, active step, timer, trial chance preview, direction choices, result/reward/report values must be mapped to existing sources or marked missing.
- Do not infer backend contracts from prototype text.

**Acceptance criteria:**
- Report lists exact files checked.
- Report lists exact service/read-model/RPC sources.
- Report lists which prototype anchors are in scope for UI-EXPLORATION-1–14.
- No code changes.

**Verification/smoke:**
- N/A no-code.

**Required Codex report:**
- prototype source:
- files checked:
- services/read models/RPC sources:
- implement now:
- dependencies/blockers:
- deferred prototype anchors:
- local SCSS needed: no/why:

**Status:** Accepted/completed on 2026-05-19 as the Exploration UI source/prototype preflight. The production pass mapped `docs/ui-ux/prototypes/mythborne_exploration_flow_v_2.html`, the Exploration row in `docs/ui-ux/prototype-production-mapping.md`, current `/game/exploration` page/status/state files, `HeroExplorations.getActiveDifficultyTiers()` over `exploration_difficulty_tiers`, and `HeroExplorations.getHeroExplorationState(...)` over `get_hero_exploration_state`. Difficulty labels, top route state, remaining Trials and active effect are backed by current read models; difficulty card redesign, compact status card, timer, trial detail, route/direction, result/reward/report and any missing richer prototype anchors remain deferred to later UI-EXPLORATION tasks. No code, DB/RPC/schema/generated types, SCSS or specs were changed for this preflight.


## UI-EXPLORATION-1 — Page header and top state summary

**Goal:**  
Create the top Exploration page header and compact state summary, without touching difficulty cards or runtime panels.

**Scope:**
- Header/title/copy for `/game/exploration`.
- Compact summary surface aligned with prototype intent:
  - exploration readiness/state;
  - selected/current difficulty label;
  - daily Trial availability if read model exists;
  - blocking content/active effect summary if read model exists.
- Keep summary short and player-facing.

**Out of scope:**
- Difficulty card layout.
- Active step/timer panel.
- Trial detail by stat.
- Direction choices.
- Result/reward/report UI.
- Modal.
- New data reads.

**Data/source rules:**
- Difficulty label must come from current difficulty read model where available.
- Do not show raw difficulty key as the main badge/value.
- Daily counters only if existing read model provides them.
- No fake “daily reset”/counter values.

**UI/SCSS rules:**
- Use existing `mg-card`, `mg-section__title`, `tag-badge`, grid/flex utilities.
- Important summary values use `color-text`, `color-heading` or semantic badge, not `muted-text`.
- Helper copy may be muted.
- No local SCSS.

**Dependencies/blockers:**
- Missing daily counter/readiness field → omit and report dependency.
- Missing readable difficulty label → use existing humanizer or report source gap.

**Acceptance criteria:**
- Header communicates what Exploration screen is for.
- Compact state summary is readable.
- No raw key as primary state label.
- No fake counters or chance values.
- Build passes.

**Verification/smoke:**
- `/game/exploration` route visual smoke.
- No-exploration state smoke.
- Existing exploration state smoke if data exists.
- `npx tsc --noEmit`.
- `npm run build`.

**Required Codex report:**
- header/status data source:
- difficulty label source:
- daily counter source or dependency:
- reused UI patterns:
- local SCSS added:

**Status:** Accepted/completed on 2026-05-19. The `/game/exploration` header now uses the accepted production rhythm with a concise Exploration title/description and a right-side premium summary surface (`mg-card p-lg flex-col gap-sm w-100 shadow-premium`). Difficulty uses the current selected difficulty read model label, shows `Loading` only while the page is loading, and otherwise shows a non-misleading no-selection fallback; route state, remaining Trials and active effect use the existing page/read-model signals without fake counters or new reads. Current status section, timer, trial detail, directions, rewards/reports, TS logic, SCSS, DB/RPC/schema/generated types and specs were not changed. Manual smoke remains user-side pending for header rhythm, no-exploration state, existing exploration state and selected difficulty/top summary values.


## UI-EXPLORATION-2 — Current status compact card

**Goal:**  
Make the current Exploration runtime status readable as a compact card under/near the header, without touching difficulty cards.

**Scope:**
- Current status section only.
- Show current runtime status if available:
  - route/exploration state;
  - difficulty label;
  - current node/step/challenge/effect labels where available;
  - blockers / “ready to start” / no-exploration state.
- Remove or demote debug/raw-looking display from the main player-facing section.

**Out of scope:**
- Active timer/progress bar.
- Direction choices.
- Result/reward/report summaries.
- Difficulty card redesign.
- New backend reads.

**Data/source rules:**
- Use existing Exploration page/state/facade/read model.
- Raw IDs/keys only in gated diagnostics, not primary UI.
- If a label is missing, use existing label/humanizer helper or report gap.

**UI/SCSS rules:**
- Primary status values not muted.
- Helper/metadata may be muted.
- Status/outcome/blocking values use badges/status styles.
- No local SCSS.

**Dependencies/blockers:**
- If diagnostics are visible, confirm they are gated by existing debug/staff condition.
- If current status read model is missing key labels, report dependency rather than fake text.

**Acceptance criteria:**
- Player can understand whether exploration exists, is ready, blocked, or in progress.
- Current status is no longer debug-looking.
- Important values are not muted.
- Build passes.

**Verification/smoke:**
- no-exploration state;
- active exploration state if data exists;
- diagnostics hidden/gated where expected;
- `tsc`;
- build.

**Required Codex report:**
- current status data source:
- label/humanizer sources:
- diagnostics gating:
- local SCSS added:

**Status:** Accepted/completed on 2026-05-19. The `/game/exploration` no-exploration flow now goes from the header/top
summary directly to Difficulty without an extra status card. Header `Route state` uses the shared page
`runtimeStatusLabel()` display source, and the active-only compact current-route details surface is gated by
`state.hasExploration && state.exploration`, so it appears only when there is real current exploration runtime state to
summarize. Difficulty remains in the header summary to avoid duplicate rows. Raw node ids are no longer used as a
player-facing fallback; missing current node labels use neutral copy instead. `ExplorationActiveEffectDisplay` was moved
from the helper file into `core/interfaces`. The lower legacy `ExplorationStatusSection` remains after Difficulty as the
runtime surface for timer, directions, result/reward/report and diagnostics content; it is not the top compact status
card. Verification passed with `npx tsc --noEmit`, `npm run build` with known budget/CommonJS warnings, and static
greps. User-side manual smoke remains pending for no-exploration, existing-exploration duplication, no raw node id, and
no duplicated start action outside the difficulty/start flow. Follow-ups: clean raw-ish active step/challenge labels and
the broad `ExplorationPageState` facade in later runtime tasks / UI-EXPLORATION-14.


## UI-EXPLORATION-3 — Active exploration step inline panel

**Goal:**  
Show active exploration step/progress inline when a step is running or ready to resolve.

**Scope:**
- Active step inline card/panel.
- Time remaining / ready state.
- Check result button only when allowed.
- Step status and progress display from current read model.
- Loading/error/unavailable states.

**Out of scope:**
- Modal timer.
- Direction choice.
- Result/reward/report UI.
- Fake timer authority.
- LocalStorage gameplay state.
- New RPCs.

**Data/source rules:**
- Timer/progress/readiness from existing exploration read model/service.
- Frontend countdown is display only over backend-owned timestamps.
- Check result action through existing canonical service/RPC only.

**UI/SCSS rules:**
- Use shared card/progress/timer/button patterns.
- Ready/action-needed state not muted.
- Raw timestamps can be secondary metadata, not dominant UI.
- No local SCSS.

**Dependencies/blockers:**
- Missing timer/readiness fields → dependency.
- Missing check-result action → show dependency, not fake action.

**Acceptance criteria:**
- Active step state is clear.
- Time remaining/ready state is visible.
- Check result appears only when allowed.
- No fake timer authority.
- Build passes.

**Verification/smoke:**
- active step state smoke;
- ready-to-check state smoke if data exists;
- no-active-step state smoke;
- `tsc`;
- build.

**Required Codex report:**
- active step data source:
- timer/readiness source:
- check-result source:
- stale guard approach:
- local SCSS added:

**Status:** Accepted/completed on 2026-05-19. The active-step inline panel is now owned by `/game/exploration`
composition in `exploration-page.html`, gated directly by `page.activeStep()`, and rendered after the header/feedback
messages before Difficulty. It uses existing `ExplorationStepState` display signals for backend-owned timestamp progress,
readiness and remaining-time labels, keeps `Check result` visible only while `page.canCheckResult()` or resolving state
applies, and preserves loading/disabled behavior during resolve. `GameBar type="xp"` is accepted as a temporary wrapper
limitation because the shared component currently exposes only `hp | xp`. The lower legacy `ExplorationStatusSection`
no longer contains the duplicate `Movement step` / active-step timer block or the stale no-exploration `Start
exploration` branch, and its repeated `page.state()` guards were cleaned up through a local `@let state = page.state()`
while one-off nullable blocks remain scoped locally. No DB/RPC/schema/generated types, specs, local SCSS, native `<button pButton>`, `ngModel`,
`FormsModule`, direct exploration writes or `localStorage` were introduced. Verification passed with `npx tsc --noEmit`,
`npm run build` with known budget/CommonJS warnings, and static greps. Manual smoke remains data-blocked until a real
active-step scenario exists. Follow-ups: clean remaining legacy raw-ish runtime/status chips in later
UI-EXPLORATION-14/runtime cleanup and add a neutral shared progress `GameBar` type if needed.


## UI-EXPLORATION-4 — Difficulty card shell and selected state

**Goal:**  
Build the difficulty card shell and selected-state behavior only, without adding detailed chance breakdowns.

**Scope:**
- Difficulty cards/list layout.
- Difficulty label/description/helper copy.
- Selected difficulty visual state.
- Available/locked/disabled badges if data exists.
- Basic card action:
  - `Select` on non-selected cards;
  - selected card visually highlighted.

**Out of scope:**
- Start exploration CTA.
- Chance/probability rows.
- Stat-by-stat breakdown.
- Timer/active step.
- Result/reward/report UI.
- New chance math.

**Data/source rules:**
- Difficulty list from existing service/read model.
- Labels/descriptions from DB/read model where available.
- No hardcoded permanent difficulty list if DB/read model exists.

**UI/SCSS rules:**
- Use existing card/badge/button patterns.
- Selected state through existing border/glow/badge patterns.
- Disabled states use semantic badges/status, not opacity only.
- No local card system or local SCSS.

**Dependencies/blockers:**
- Missing difficulty read model → dependency/blocker.
- Missing labels → use existing humanizer or report gap.

**Acceptance criteria:**
- Difficulty cards render from real data.
- Selected card is visually clear.
- Unavailable/locked states are clear where data exists.
- No start action yet except existing unchanged behavior if already present.
- Build passes.

**Verification/smoke:**
- difficulty list render;
- selection change;
- selected state;
- build/tsc.

**Required Codex report:**
- difficulty source:
- label/source metadata:
- selected state pattern reused:
- checked but not reused:
- local SCSS added:

**Status:** Accepted/completed on 2026-05-19. The Difficulty section now keeps the shell/selected-state work scoped to
`exploration-page.html`: each card derives `isSelected` from `page.selectedDifficultyKey() === difficulty.key`, selected
cards use existing production `border-secondary` and `shadow-premium` classes plus a `Selected` badge, and selected or
unavailable cards have disabled selection actions. Availability badges are driven only by the current
`difficulty.isActive` read-model field, so unavailable/locked nuance remains limited to data that exists today.
Repeated `page.previewRows(difficulty.key)` calls were replaced by local `@let previewRows`; the preview rows themselves
remain the legacy/simple display and are deferred to UI-EXPLORATION-5. No start CTA, stat detail, timer, directions,
results, rewards, DB/RPC/schema/generated types, specs or local SCSS were changed. Verification passed with
`npx tsc --noEmit`, `npm run build` with known budget/CommonJS warnings, and static greps. Manual smoke remains
user-side pending for difficulty list render, selection change, selected visual distinction and selected/unavailable
disabled action behavior.


## UI-EXPLORATION-5 — Difficulty card DB-backed preview values

**Goal:**  
Add compact DB-backed preview values to difficulty cards.

**Scope:**
- Per-card compact preview rows/bars if current read model supports them:
  - step time;
  - Trial opportunity chance;
  - approximate manifestation chance;
  - approximate auto-result chance;
  - reward profile/multiplier.
- Preview values only on difficulty cards.
- No stat-by-stat detail.

**Out of scope:**
- Trial detail by stat section.
- Local chance calculations.
- Start CTA logic changes.
- Timer/direction/result UI.
- DB/RPC edits.

**Data/source rules:**
- Values from backend/read model only.
- If a value is missing, omit it or show dependency state; do not fake.
- Do not call `page.previewRows(difficulty.key)` repeatedly in template; assign once with `@let` or equivalent.

**UI/SCSS rules:**
- Important probabilities/values not muted.
- Use existing progress/bar/value row patterns where available.
- No local SCSS.
- Labels must not conflate manifestation and auto-result.

**Dependencies/blockers:**
- Missing preview read model → dependency, not fake.
- Missing labels → report source gap.

**Acceptance criteria:**
- Preview values are visible and readable where data exists.
- Manifestation and auto-result are not conflated.
- No fake chance math.
- Build passes.

**Verification/smoke:**
- one difficulty with preview values;
- missing preview value state;
- build/tsc.

**Required Codex report:**
- preview source:
- chance source:
- missing-value handling:
- local SCSS added:


**Status:** Accepted/completed on 2026-05-19. UI-EXPLORATION-5 now uses
`get_hero_exploration_difficulty_card_previews(...)` as the canonical source for Difficulty card preview values and
selected difficulty Trial detail rows. The old `preview_trial_opportunity_curve(...)` path is not used as the card
source. Difficulty preview UI was split into focused standalone components for the section, card, chance metric row and
Trial detail section; cards show DB-provided Step time, Trial opportunity, Approx. manifestation, Approx. auto result and
Reward items, with chance values rendered through the shared `GameBar type="chance"` variant and `max=100`. The selected
difficulty drives the Trial detail by stat section, which renders 9 DB-backed stat rows without Trial power, Tested stat
or source/debug rows in player-facing UI. The mapper keeps required DB contract fields strict, including exactly 9 stat
detail rows and required manifestation/auto-result display plus numeric chance fields. No local chance math, direct table
reads, DB/RPC/schema/generated edits or local page SCSS were added. Verification passed with `npx tsc --noEmit`,
`npm run build` with known budget/CommonJS warnings, and static greps. Manual visual smoke remains user-side for 3 cards,
selected card glow, full-width chance bars, selected difficulty switching and 9 visible stat rows. Follow-ups: polish card
typography/hierarchy, tune global `.mg-card--selected` if visual smoke says the glow is too weak, and keep
`GameBar type="chance"` percent formatting player-safe if future usage enables `showValue=true`.


## UI-EXPLORATION-6 — Difficulty start/continue CTA behavior

**Goal:**  
Wire and present the start/continue action for the selected difficulty card only.

**Scope:**
- Selected difficulty owns `Start exploration` CTA.
- If exploration already exists, show route/current-state CTA or “current route ready” state using existing behavior.
- Disabled/loading/starting states.
- Error/success feedback placement if already available.
- Ensure no direct writes.

**Out of scope:**
- Card layout redesign.
- Preview rows.
- Timer modal.
- Direction choices.
- Result/reward/report UI.
- New backend workflow.

**Data/source rules:**
- Start action through canonical existing Exploration service/RPC.
- Active hero/server context required.
- No direct table writes.
- No invented request payload fields.

**UI/SCSS rules:**
- Use `<p-button />`.
- Loading/disabled state clear.
- Action-needed state not muted.
- No local SCSS.

**Dependencies/blockers:**
- Missing canonical start service/RPC → dependency/blocker.
- Missing selected difficulty state → dependency.

**Acceptance criteria:**
- Player can start exploration from selected difficulty where backend supports it.
- Start disabled/loading state is clear.
- Existing exploration state does not show misleading start action.
- Build passes.

**Verification/smoke:**
- select difficulty + start smoke if backend/data exists;
- disabled/loading state;
- already-has-exploration state;
- build/tsc.

**Required Codex report:**
- start workflow source:
- active hero/server guard source:
- mutation path:
- local SCSS added:


**Status:** Accepted/completed on 2026-05-20 as the Difficulty entry-screen CTA pass. Non-selected available Difficulty cards are whole-card selectable with keyboard selection preserved, selected state uses the global `.mg-card--selected` treatment, status badges were removed, and only the selected card renders the stable bottom-aligned `Start exploration` / `Continue adventure` CTA through the existing `ExplorationStartState.startSelectedDifficulty()` / `HeroExplorations.startOrGetHeroExploration(...)` workflow. The top summary now shows Difficulty, Approx. auto result, Trials today and Effect; Approx. auto result comes from the selected difficulty preview read model, not local chance math. The separate current-route/status card is not rendered on this entry screen, existing exploration state uses `Continue adventure`, and loading/start feedback uses the existing `app-loading-overlay`. No runtime direction/result screen, local SCSS, DB/RPC/schema/generated edits or direct table writes were added. Verification passed with `npx tsc --noEmit`, `npm run build` with known bundle/CommonJS warnings and static greps; the focused Exploration spec run was blocked before execution by unrelated existing compile errors in `src/app/core/utils/armory-inventory-filter.spec.ts`.

## UI-EXPLORATION-7 — Runtime screen boundary and entry/runtime split

**Goal:**  
Separate the difficulty entry screen from the active Exploration runtime screen so the player no longer moves through runtime state inside the difficulty selection layout.

**Scope:**
- Split `/game/exploration` composition into:
  - difficulty entry screen;
  - active/runtime exploration screen.
- Keep the existing difficulty entry screen from UI-EXPLORATION-6 as the entry point.
- Move active-step/current-runtime UI out of the entry screen and into the runtime screen.
- `Continue adventure` on an existing selected difficulty should enter/show the runtime screen, not leave the player on difficulty selection with disabled/current-route copy.
- Keep runtime screen shell minimal:
  - selected/current difficulty context;
  - current exploration state summary where useful;
  - placeholder/slot for pending step, result, challenge, directions and reward/report sections.
- Use existing state/services/signals; do not invent new route state if current page state is enough.

**Out of scope:**
- Full pending timer redesign.
- Direction choice card implementation.
- Step result/reward/report redesign.
- Trial/combat implementation.
- New DB/RPC/schema/generated type changes.
- Fake runtime state or local route persistence.

**Data/source rules:**
- Runtime mode is driven by existing `get_hero_exploration_state` read model and current page state.
- Do not infer exploration progress from client-only state.
- If the current read model cannot reliably distinguish entry/runtime states, report dependency instead of adding fake state.

**UI/SCSS rules:**
- Use existing `mg-card`, page shell, grid/flex utilities and shared components.
- No local SCSS.
- No prototype `mb-*`.
- Important runtime/action state must not be muted.
- Keep difficulty entry and runtime screen visually distinct.

**Dependencies/blockers:**
- If current state cannot support entry/runtime split without ambiguity, report the exact missing field/contract.
- If a route/subroute is needed later, report it as a follow-up rather than implementing routing in this task.

**Acceptance criteria:**
- Difficulty entry screen does not show active-step/current-route runtime panels.
- Existing active exploration can be continued into a distinct runtime screen/surface.
- Runtime screen does not show the full difficulty selection as the primary content.
- No fake runtime data.
- No DB/RPC/generated changes.
- Build passes.

**Verification/smoke:**
- no-exploration entry screen;
- existing exploration → continue runtime screen;
- active step present → runtime screen;
- no duplicate active step/current route panels;
- `npx tsc --noEmit`;
- `npm run build`.

**Required Codex report:**
- runtime/entry state source:
- files changed:
- components reused:
- checked but not reused:
- new components/helpers:
- local SCSS added:


**Status:** Accepted/completed on 2026-05-20 as the entry/runtime boundary split. `/game/exploration` now keeps the UI-EXPLORATION-6 Difficulty entry screen as the entry surface and switches to a distinct runtime shell when Start/Continue succeeds or when the read model has active runtime state. Runtime mode is driven by the existing `get_hero_exploration_state` read model through current page state, with a small `runtimeScreenRequested` UI state only for the local entry/runtime presentation. The runtime shell is intentionally minimal and player-facing: selected difficulty/status context, current node, Trials today, active effect and neutral state slots for pending step, result/reward and runtime state. It does not render the pending timer/check-result UI, direction board, step result card, reward card, challenge panel or diagnostics; those remain scoped to later UI-EXPLORATION runtime tasks. No DB/RPC/schema/generated edits, route changes, local SCSS, direct writes or runtime workflow changes were added. Verification passed with `npx tsc --noEmit`, `npm run build` with known bundle/CommonJS warnings and static greps; the focused Exploration spec command remains blocked before execution by unrelated existing compile errors in `src/app/core/utils/armory-inventory-filter.spec.ts`.

## UI-EXPLORATION-8 — Pending movement step screen

**Status:** Accepted/completed on 2026-05-20 as the pending movement step runtime screen. When the existing exploration read model exposes an active movement step, `/game/exploration` now keeps the Difficulty entry cards out of the primary content and renders the pending step as the main runtime surface. Progress, remaining time, ready state and the `Check result` action are driven by existing `ExplorationStepState` display/readiness values over backend-owned `startedAt` / `resolvesAt`; the runtime header and pending card agree on `Result ready` when the step can be checked. Raw ISO timestamps are no longer shown as player-facing badges, no fake timer authority was added, and no direction board, step result, reward/report, challenge UI, DB/RPC/schema/generated-type change, local SCSS or workflow change was introduced. Verification passed with `npx tsc --noEmit`, `npm run build` with known bundle/CommonJS warnings and static greps; the focused Exploration spec command remains blocked before execution by unrelated existing compile errors in `src/app/core/utils/armory-inventory-filter.spec.ts`.

**Goal:**  
Render the backend-owned pending movement step as the main runtime screen while a step is running or ready to resolve.

**Scope:**
- Pending movement step screen inside Exploration runtime mode.
- Show:
  - selected/current difficulty context;
  - step progress/time remaining from backend-owned timestamps;
  - ready-to-check state;
  - `Check result` action only when backend/read model allows it;
  - loading/resolving state.
- Reuse the existing active-step work from earlier tasks, but relocate it into the runtime screen.
- Keep the pending screen focused: it is not the difficulty entry screen.

**Out of scope:**
- Timer modal.
- Direction choice board.
- Step result summary.
- Reward/report display.
- Trial/combat challenge UI.
- LocalStorage gameplay state.
- New timer authority.

**Data/source rules:**
- Step progress/readiness must come from existing exploration read model/state.
- Frontend countdown/progress is display-only over backend-owned `startedAt` / `resolvesAt` or equivalent fields.
- `Check result` uses existing canonical service/RPC path only.

**UI/SCSS rules:**
- Use shared card/progress/button patterns.
- Ready/action-needed state not muted.
- Raw timestamps may be secondary metadata only.
- No local SCSS.
- No fake timers.

**Dependencies/blockers:**
- Missing active step timestamps/readiness → report dependency.
- Missing check-result action → report dependency.
- Missing selected difficulty context → report dependency.

**Acceptance criteria:**
- Pending step is readable as the main runtime screen.
- Progress/remaining/ready state is visible and backend-derived.
- `Check result` appears only when allowed.
- Resolving/loading state is clear.
- Difficulty entry cards are not shown as the primary content while a step is pending.
- Build passes.

**Verification/smoke:**
- active pending step state;
- ready-to-check state;
- resolving state;
- no-active-step runtime fallback;
- `npx tsc --noEmit`;
- `npm run build`.

**Required Codex report:**
- active step source:
- timer/progress source:
- check-result source:
- reused components:
- local SCSS added:


## UI-EXPLORATION-9 — Step result screen and outcome summary

**Status:** Accepted/completed on 2026-05-20 as the resolved step result runtime surface. After checking a movement step, `/game/exploration` now shows a scoped `Step report` using the existing step resolution workflow state plus `exploration-step-result-ui` title/description/flavor helpers, with short handoff cards for challenge, reward/report and next action. Nothing, Trial and Encounter outcomes remain distinct through existing backend/read-model-backed result fields and labels; sandbox selection diagnostics are rendered only through the existing gated diagnostics component. This task did not implement the direction choice board, full reward UI, full challenge panel, DB/RPC/schema/generated-type changes, local SCSS, fake result text or local result recomputation. Verification passed with `npx tsc --noEmit`, `npm run build` with known bundle/CommonJS warnings and static greps; the focused Exploration spec command remains blocked before execution by unrelated existing compile errors in `src/app/core/utils/armory-inventory-filter.spec.ts`.

**Goal:**  
After checking a movement step, show a clear step outcome/result screen before the player chooses the next direction or enters a challenge.

**Scope:**
- Step result screen inside Exploration runtime mode.
- Show the resolved outcome:
  - nothing;
  - Trial opportunity/challenge;
  - Encounter/combat/challenge;
  - other backend-supported outcome kinds if present.
- Show short player-facing summary from backend/read model where available.
- Preserve diagnostics only if already gated for sandbox/staff/debug use.
- Provide a clear next-state handoff:
  - no challenge → directions/continue section;
  - challenge exists → challenge handoff section;
  - reward/report exists → reward/report section.

**Out of scope:**
- Direction choice board implementation.
- Full Trial UI/minigame.
- Full combat UI.
- Full reward/drop/report redesign.
- Fake result text or local result recompute.

**Data/source rules:**
- Use durable backend/result/read-model data from existing step resolution workflow.
- Do not locally recompute result/outcome/chance.
- Raw keys/IDs only in gated diagnostics.

**UI/SCSS rules:**
- Outcome/status/action-needed values not muted.
- Use shared card/status/action patterns.
- Keep helper/flavor copy secondary.
- No local SCSS.

**Dependencies/blockers:**
- Missing result read model → report dependency.
- Missing outcome labels/descriptions → use existing mapper/humanizer only if accepted; otherwise report gap.
- Missing durable result after route refresh → report dependency.

**Acceptance criteria:**
- Player can understand what happened after checking the step.
- Nothing/trial/encounter outcomes are not conflated.
- Result display is backend/read-model-backed.
- Debug shape is not primary player UI.
- Build passes.

**Verification/smoke:**
- nothing result;
- trial/encounter result if data exists;
- no-result state;
- diagnostics gated;
- `npx tsc --noEmit`;
- `npm run build`.

**Required Codex report:**
- result data source:
- outcome label source:
- diagnostics gating:
- reused components:
- local SCSS added:


## UI-EXPLORATION-10 — Direction choice board

**Goal:**  
Render backend-provided direction choices as the main continuation action after a step/result is clear.

**Scope:**
- Direction choice board inside Exploration runtime mode.
- Show available directions from current node:
  - direction label;
  - destination/discovery state where available;
  - disabled/blocked state where available;
  - short helper/status copy where available.
- Starting a direction uses the existing canonical movement/start-step service/RPC path.
- Board appears only when it makes sense:
  - no active pending step;
  - no unresolved blocking challenge;
  - exploration route exists and can continue.

**Out of scope:**
- Procedural map UI.
- Story/map authoring.
- Fake branching/directions.
- Timer modal.
- Reward/result UI.
- New backend mutations.
- Combat/Trial UI.

**Data/source rules:**
- Direction choices come from the existing exploration state/read model.
- Direction action uses canonical existing service/RPC.
- No hardcoded fake directions.
- No direct table writes.

**UI/SCSS rules:**
- Use shared card/action layout.
- Do not overuse badges; use them only for real semantic blocked/available state.
- Direction labels/action-needed text not muted.
- No local map CSS.
- No prototype `mb-*`.

**Dependencies/blockers:**
- Missing direction read model → report dependency.
- Missing next-step RPC/action → report dependency.
- Missing readable direction labels → use existing helper or report gap.

**Acceptance criteria:**
- Direction choices are readable where data exists.
- Unavailable/blocked choices are clear where data exists.
- Choosing a direction starts the backend-owned next movement step.
- Same screen transitions cleanly to pending step state.
- No fake directions.
- Build passes.

**Verification/smoke:**
- direction board render;
- direction choice action;
- no-choice state;
- blocked/disabled state if data exists;
- `npx tsc --noEmit`;
- `npm run build`.

**Required Codex report:**
- direction data source:
- mutation path:
- blocked/disabled source:
- reused components:
- local SCSS added:


## UI-EXPLORATION-11 — Challenge handoff shell

**Goal:**  
When a resolved step produces an active Trial/Encounter/challenge, show a clear handoff shell without implementing Trial or Combat internals in this task.

**Scope:**
- Challenge handoff section inside Exploration runtime mode.
- Show:
  - challenge kind/type label where available;
  - player-facing challenge title/description where available;
  - available existing actions:
    - auto/manual resolve if already supported;
    - enter combat if existing combat handoff exists;
    - enter Trial if existing Trial handoff exists;
  - unsupported/missing state if backend/frontend contract is not ready.
- Reuse existing `ExplorationChallengeState` / challenge panel logic where it is still valid, but do not keep it as a broad legacy dump.

**Out of scope:**
- Manual Trial minigame implementation.
- Combat live UI implementation.
- Backend verdict/reward logic.
- New Trial/combat RPCs.
- Fake challenge state.
- Direction choice while challenge blocks continuation.

**Data/source rules:**
- Challenge state from current exploration read model/state.
- Actions only from existing canonical services/RPCs.
- No local challenge outcome authority.
- If combat/trial handoff data is missing, report dependency.

**UI/SCSS rules:**
- Use shared card/action/panel patterns.
- Challenge/action-needed values not muted.
- Keep copy player-facing.
- No local SCSS.

**Dependencies/blockers:**
- Missing challenge labels/metadata → report dependency or use existing accepted mapper.
- Missing combat/Trial handoff route/action → report dependency.
- Missing stale/session guard → report dependency.

**Acceptance criteria:**
- Active challenge is clearly visible and not confused with directions/difficulty selection.
- Existing supported actions are available.
- Unsupported handoffs fail closed with clear non-fake state.
- Directions are not shown as the main next action while a blocking challenge is unresolved.
- Build passes.

**Verification/smoke:**
- active challenge state;
- no challenge state;
- existing auto/manual action if supported;
- combat/Trial handoff dependency state if unsupported;
- `npx tsc --noEmit`;
- `npm run build`.

**Required Codex report:**
- challenge data source:
- available actions:
- unsupported handoff dependencies:
- reused components:
- local SCSS added:


## UI-EXPLORATION-12 — Reward and report handoff

**Goal:**  
Show rewards, drops and report handoff after step/challenge resolution where durable backend data exists.

**Scope:**
- Reward/result handoff inside Exploration runtime mode.
- Show reward summary where available:
  - resources;
  - item drops;
  - effect/buff/debuff result where available;
  - reward unavailable state where backend says not available.
- Use shared item popover for item drops if item references/read model support it.
- Show `Open report` / report handoff if a report reference/link exists.
- Preserve continue/direction flow where appropriate.

**Out of scope:**
- Reward granting logic.
- Full report route implementation if owned by reports epic.
- Fake item drops.
- Live recompute of rewards.
- New DB/RPC contracts.
- Permanent local reward storage.

**Data/source rules:**
- Rewards from durable backend/read model only.
- Report from game report snapshot/source where available.
- Item drops through item read model/report item references.
- No fake report generation.
- No fake item popovers without item refs.

**UI/SCSS rules:**
- Reward values not muted.
- Use shared item popover/report/result patterns where possible.
- Keep reward/report UI compact; do not bury direction continuation.
- No local SCSS.

**Dependencies/blockers:**
- Missing reward snapshot/read model → report dependency.
- Missing report link/ref → report dependency.
- Missing item refs/details → omit popover and report limitation, do not fake.

**Acceptance criteria:**
- Reward summary is readable where data exists.
- Missing reward state is clear and non-fake.
- Report handoff is clear where available.
- Item drops use shared popover where possible.
- Build passes.

**Verification/smoke:**
- reward summary with data;
- no reward/unavailable state;
- report link/handoff if data exists;
- item drop popover if data exists;
- `npx tsc --noEmit`;
- `npm run build`.

**Required Codex report:**
- reward data source:
- report source/link:
- item popover reuse:
- missing-data limitations:
- local SCSS added:


## UI-EXPLORATION-13 — Runtime composition cleanup and legacy section removal

**Goal:**  
Remove remaining legacy Exploration runtime duplication after the pending/result/direction/reward sections have been split into focused runtime components.

**Scope:**
- Review current `/game/exploration` templates/components after UI-EXPLORATION-7–12.
- Remove or split broad legacy runtime surfaces, especially any catch-all status section that still duplicates:
  - active step;
  - result;
  - challenge;
  - reward;
  - directions;
  - debug diagnostics.
- Ensure player-facing Exploration runtime has a single clear flow:
  - entry difficulty screen;
  - runtime pending/result/challenge/direction/reward screens.
- Keep gated diagnostics available only where still useful and properly gated.
- Clean repeated template calls into `@let` where useful.

**Out of scope:**
- New feature implementation.
- New DB/RPC/schema/generated edits.
- Broad redesign outside Exploration.
- Combat/Trial internals.
- Fake data or fallback contracts.

**Data/source rules:**
- Do not add data fields.
- If a data gap remains, document dependency.
- Do not replace backend-owned runtime state with frontend-only state.

**UI/SCSS rules:**
- No `button pButton`.
- No `ngModel` / `FormsModule`.
- No `NgClass`/`ngClass` for simple class state.
- No `className`.
- No prototype `mb-*`.
- No local SCSS unless already accepted and justified.
- Important values/outcomes/action-needed text not muted.

**Dependencies/blockers:**
- Any runtime/browser smoke error in touched Exploration UI is blocker.
- Any missing backend contract discovered late should be reported, not patched with fallback.

**Acceptance criteria:**
- No duplicate active-step/result/challenge/reward/direction panels.
- No broad legacy status component owns multiple unrelated runtime concerns.
- Player-facing UI does not expose raw IDs/keys where labels exist.
- Diagnostics remain gated.
- Build passes.

**Verification/smoke:**
- no-exploration entry screen;
- existing exploration runtime screen;
- active pending step;
- ready/check result;
- result state;
- challenge state if available;
- direction board;
- reward/report if available;
- static greps for banned patterns;
- `npx tsc --noEmit`;
- `npm run build`.

**Required Codex report:**
- files reviewed:
- legacy blocks removed:
- components split/reused:
- diagnostics remaining/gating:
- issues intentionally left as follow-up:
- static greps:
- local SCSS remaining:


## UI-EXPLORATION-14 — Exploration UI final control pass

**Goal:**  
Perform the final Exploration UI control pass after UI-EXPLORATION-7–13 to ensure the full flow is consistent, production-styled and free of accidental prototype/debug/local patterns.

**Scope:**
- Review all touched Exploration templates/components/state from UI-EXPLORATION-1–13.
- Check complete player flow:
  - entry difficulty screen;
  - start/continue;
  - pending movement step;
  - check result;
  - result/challenge/reward/report;
  - direction choice and next movement.
- Remove accidental duplication, stale UI and debug-looking player UI.
- Check copy, values, labels and muted-text usage.
- Check selected/loading/disabled/action-needed states.
- Check keyboard/click interaction for cards/buttons where touched.
- Check component boundaries and obvious overgrown components.

**Out of scope:**
- New features.
- DB/RPC/schema/generated changes.
- Broad redesign outside Exploration.
- Combat/Trial implementation beyond handoff.
- Rewriting accepted UI from scratch.

**Data/source rules:**
- Do not add fake data or frontend gameplay authority.
- Any missing field/contract discovered late must be reported as dependency.
- Runtime/gameplay authority remains backend/RPC/read-model owned.

**UI/SCSS rules:**
- Use accepted dashboard/game-shell visual style.
- Prototype remains UX anchor only.
- No prototype `mb-*`.
- No raw prototype colors/gradients/dimensions.
- No unnecessary local SCSS.
- Important values/outcomes/action-needed text not muted.
- No badges/chips unless they carry real semantic status and are visually necessary.

**Dependencies/blockers:**
- Runtime browser smoke errors are blockers.
- Missing backend contracts that make a UI misleading are blockers/dependencies.
- Self-fulfilling tests that only validate local mocks are not enough for acceptance.

**Acceptance criteria:**
- Exploration UI reads as one coherent flow, not a pile of legacy panels.
- Entry screen and runtime screen are clearly separated.
- Pending/result/direction/reward states are not duplicated.
- No raw player-facing keys/IDs where labels exist.
- No fake runtime/chance/result/reward data.
- Build passes.
- Manual smoke list is explicit.

**Verification/smoke:**
- `/game/exploration` route smoke;
- no-exploration entry screen;
- selected difficulty/start;
- existing exploration continue;
- active pending step;
- ready-to-check;
- result state;
- direction choice;
- challenge handoff if available;
- reward/report if available;
- keyboard selection/action smoke for difficulty cards;
- static greps:
  - `button pButton`;
  - `ngModel`;
  - `FormsModule`;
  - `NgClass`/`ngClass`;
  - `className`;
  - prototype `mb-*`;
  - debug/TODO/temporary copy;
- `npx tsc --noEmit`;
- `npm run build`.

**Required Codex report:**
- files reviewed:
- flow states smoke checklist:
- issues removed:
- issues intentionally left as follow-up:
- static greps:
- local SCSS remaining:
- manual smoke pending:

---

# 15. UI-TRIALS — Trial minigame prototypes and renderer boundary

Cel: uporządkować zaakceptowane kierunki manual Trial minigames, wspólny host/rendering boundary oraz integrację z reports/result flow.

## UI-TRIALS-1A — Shared Trial Minigame Host / Renderer Shell Spec And Production Mapping

**Goal:**  
Define the shared player-facing host/mapping for manual Trial minigames before implementation. This is a spec and production-mapping task only.

**Scope:**
- Map the shared host visual and structural boundary for all manual Trial minigames:
  - trial header,
  - god label,
  - tested stat,
  - manual/auto state,
  - minigame content slot,
  - safe auto-resolve action,
  - warning modal before auto-resolve,
  - failed / not manifested / completed handling,
  - result/report handoff,
  - accessibility and mobile constraints.
- Define which parts belong to the shared host and which parts belong to each minigame renderer.
- Map the host to production sources:
  - current Angular routes/components/state,
  - existing global SCSS/utilities/shared patterns,
  - missing shared/global patterns,
  - required DB/RPC/read-model contract.
- Confirm that host implementation is not allowed until runtime/read-model contracts are sufficient.

**Out of scope:**
- Angular implementation.
- Implementing concrete minigames.
- Creating final DB schema.
- Copying canvas CSS/JS.
- Marking the host as done.

**Data/source rules:**
- Trial definition, tested stat, god identity, difficulty/runtime config and result state must come from DB/RPC/read model.
- Auto-resolve success chance and final result must be backend/RPC-owned.
- Completed result handoff must use durable trial/report result source, not local UI-only state.
- Missing runtime/read-model contract is a blocker for UI-TRIALS-1B.

**UI/SCSS rules:**
- Use Part I v3 rules: README-first preflight, prototype visual anchors, utilities-first, no utility shadowing, muted-text audit and missing-pattern escalation.
- Do not copy `mb-*` prototype CSS/classes.
- Report visual anchors from existing trial prototypes and the accepted prototype map.
- If a host/surface/nav/status pattern is missing, report it as missing production pattern instead of flattening everything into a generic `mg-card`.

**Acceptance criteria:**
- Host boundary is documented clearly enough for implementation.
- Shared host vs per-minigame renderer responsibilities are separated.
- Required DB/RPC/read-model contract is listed.
- Missing production patterns are listed.
- No code is changed.
- UI-TRIALS-1B has explicit go/no-go prerequisites.

**Verification/smoke:**
- Documentation-only: no build.

**Required Codex report:**
- README/docs read:
- prototype visual anchors:
- matched / not matched / missing pattern:
- host boundary:
- per-minigame slot boundary:
- runtime/read-model contract needed:
- missing production patterns:
- implementation blockers for UI-TRIALS-1B:

---

## UI-TRIALS-1B — Shared Trial Minigame Host Implementation

**Goal:**  
Implement one shared player-facing Trial Minigame Host / Renderer Shell after UI-TRIALS-1A is accepted and the DB/RPC/read-model contract exists.

**Scope:**
- Implement the shared host/container for manual Trial minigames:
  - header with trial/god/tested stat identity,
  - manual vs auto state,
  - minigame renderer slot,
  - safe auto-resolve action with warning modal,
  - result/report handoff state,
  - failed / not manifested / completed handling if supported by the read model.
- Plug in one representative minigame only if runtime data exists and the task explicitly allows it.
- Keep route/page thin and move state/read-model logic to the appropriate service/state layer.

**Out of scope:**
- Implementing all nine minigames.
- Final balancing.
- Creating DB/RPC contracts.
- Direct Angular table writes.
- Local fallback authority for success/failure/rewards.
- Copying canvas CSS/JS.

**Data/source rules:**
- Must consume the confirmed DB/RPC/read-model contract from UI-TRIALS-1A.
- If the contract is missing or generated types are stale, stop and report a blocker.
- Auto-resolve and final success/failure/rewards must be backend/RPC-owned.
- Completed reports must come from durable report/result read models.

**UI/SCSS rules:**
- Use existing shared/layout components, global SCSS, utilities and vendor wrappers first.
- Local SCSS only for narrow host layout gaps and only after Part I preflight.
- No `mb-*` classes, copied prototype gradients/palette/shadows, or feature-local badge/card/button systems.
- Follow reduced-motion and no-strobe requirements for all minigame slots.

**Dependencies/blockers:**
- UI-TRIALS-1A not accepted.
- Missing trial runtime read model/config contract.
- Missing manual minigame submit/auto-resolve RPC.
- Missing report/result handoff route or read model.
- Stale generated types.

**Acceptance criteria:**
- One renderer host can contain all manual trial minigames.
- Host does not duplicate game shell/nav.
- Auto-resolve warning is visible and safe.
- Host fails closed when runtime data is missing.
- Result/report handoff is explicit and durable-source-backed.
- No local success/reward fiction is added.

**Verification/smoke:**
- `npx tsc --noEmit`.
- Focused tests if state/service/component logic is added.
- Build if implementation touches production code.
- Visual/route smoke with one supported state if data exists.
- Mark manual smoke `data-blocked` / `backend-blocked` instead of inventing fake data.

**Required Codex report:**
- UI-TRIALS-1A accepted: yes/no:
- runtime/read models used:
- DB/RPC blockers:
- reused:
- checked but not reused:
- new component/state/helper added:
- local SCSS added:
- visual anchors matched/not matched:
- muted-text audit:
- missing production patterns:
- copied from prototype: yes/no:

---

## UI-TRIALS-2 — Accepted Manual Trial Prototype Map

**Goal:**  
Record the current accepted/manual Trial minigame directions in a table that separates god/stat/direction from prototype status and HTML reference.

**Scope:**
- Maintain the map below.
- Mark entries as prototype directions, not production source.
- Distinguish accepted HTML references from conceptual or archive-pending references.
- Use this map as input for UI-TRIALS-1A mapping and for future archive cleanup.

| Trial / God | Stat | Direction | Prototype status | HTML file/reference |
|---|---|---|---|---|
| Ares | Strength | Combat Trial using DB-owned live combat session / Walking Dead manifest | accepted direction; combat prototype exists | current canvas: Combat Minigame Prototype / archive filename TBD |
| Artemis | Dexterity | Harpy Hunt: aiming/shooting minigame; no strobe, no rapid flashing | accepted direction; prototype exists | current canvas/prototype reference; archive filename TBD |
| Apollo | Agility | Path of Light: fading path tiles, step before light disappears | accepted direction; prototype exists | current canvas/prototype reference; archive filename TBD |
| Hephaestus | Endurance | Divine Forge: heat/strain/progress process-control forge | accepted direction; prototype exists | current canvas/prototype reference; archive filename TBD |
| Hermes | Cunning | Shifting Seals: procedural seal tracking, reveal then shuffle, no riddle database | accepted direction; prototype exists | current canvas/prototype reference; archive filename TBD |
| Aphrodite | Charisma | The Graces’ Court: timing/turn-taking, moving receptive arc, no dialogue database | accepted direction; prototype exists | current canvas/prototype reference; archive filename TBD |
| Athena | Wisdom | Scales of Judgment: procedural omen selection under incomplete information, qualitative reveals | accepted direction; prototype exists | current canvas/prototype reference; archive filename TBD |
| Hera | Intelligence | Labyrinth with Minotaur: escape without combat | accepted direction; prototype exists | current canvas/prototype reference; archive filename TBD |
| Zeus | Spirituality | Storm Charge: hold-to-charge Sky/Earth/Oath, release grace, call thunder when all signs exceed threshold | accepted direction; prototype exists | current canvas/prototype reference; archive filename TBD |

**Out of scope:**
- Implementing Angular minigames.
- Creating final DB config schema.
- Marking UI tasks as complete.
- Inventing final archive filenames where none have been accepted.

**Data/source rules:**
- Each minigame difficulty must later be driven by trial definition/config and tested stat + Luck/runtime helpers where applicable.
- Frontend must not hardcode final difficulty curves as authority.

**UI/SCSS rules:**
- Archive accepted HTML prototypes under `docs/ui-ux/prototypes/` only after user accepts the exact file.
- Each prototype must include `VISUAL REFERENCE ONLY` header.
- No placeholder packs.

**Acceptance criteria:**
- Backlog contains a clear table for all nine trial stats/gods.
- Each row has `Prototype status` and `HTML file/reference`.
- It is clear which items require HTML prototype archival.
- It is clear that production implementation requires renderer host and DB/RPC config.

**Verification/smoke:**
- Documentation-only: no build required.

**Required Codex report:**
- prototype files referenced:
- prototype directions added:
- unclear/missing prototypes:
- scope kept minimal:

---

## UI-TRIALS-3 — Manual Trial Runtime And Difficulty Configuration Contract

**Goal:**  
Dopisać UI/UX task określający, jakie parametry manual triali muszą pochodzić z runtime config/read modelu zamiast z komponentów Angular.

**Scope:**
- Opisać common config categories:
  - tested stat key,
  - god key/label,
  - target difficulty,
  - allowed mistakes/fail threshold,
  - timer / duration / action window,
  - minigame-specific parameters,
  - auto-resolve chance,
  - accessibility/reduced-motion flags where relevant.
- Opisać minigame-specific examples:
  - Apollo: grid size, path length, tile lifetime, mistakes allowed.
  - Hephaestus: heat safe range, charge/strain rates, progress target.
  - Hermes: seal count, preview time, shuffle swaps, shuffle speed, mistakes allowed.
  - Athena: omen count, insight tokens, target range, reveal quality.
  - Aphrodite: window width, dial speed, arc speed, faux pas limit.
  - Zeus: charge rate, leak rate, release grace, threshold, ritual window, thunder calls.

**Out of scope:**
- Final DB schema.
- Formula implementation.
- Angular implementation.

**Data/source rules:**
- Angular may render values returned by read model/RPC.
- Angular must not be authority for durable success/failure.
- Missing config/read model must be dependency/blocker.

**UI/SCSS rules:**
- UI may show player-facing simplified labels, but technical config keys are secondary/admin/debug only.

**Acceptance criteria:**
- The backlog has a shared parameter taxonomy for trial minigames.
- Codex cannot reasonably hardcode minigame thresholds in Angular without violating the task.
- Open DB/RPC dependencies are explicit.

**Verification/smoke:**
- Documentation-only: no build.

**Required Codex report:**
- config parameters documented:
- DB/RPC dependencies identified:
- hardcoded values avoided:

---

## UI-TRIALS-4 — Trial Report / Result Integration Boundary

**Goal:**  
Utrwalić, że manual trial minigames kończą się durable result/report flow, a nie lokalnym ekranem sukcesu bez źródła danych.

**Scope:**
- Document expected flow:
  1. active exploration step yields trial/challenge attempt;
  2. player enters manual trial host;
  3. minigame submits result through canonical RPC/domain workflow;
  4. backend resolves success/failure and rewards;
  5. player sees completed report/result screen;
  6. report uses durable snapshot/read model.
- Include states:
  - ongoing manual trial,
  - auto-resolve selected,
  - success,
  - failure,
  - trial did not manifest,
  - missing/expired attempt.

**Out of scope:**
- Report renderer implementation.
- Reward formula/backend implementation.
- Public sharing policy.

**Data/source rules:**
- Rewards must come from reward profile/result read model.
- Item references must use shared item popover contract when details exist, safe label otherwise.
- Reports use snapshot/read model; do not recompute from live hero state.

**UI/SCSS rules:**
- Use report/result surface patterns and badges.
- No fake rewards.
- No local reward card style if global report reward/list pattern exists.

**Acceptance criteria:**
- Minigames have a defined handoff into reports/results.
- Missing report/reward read models are dependencies, not fake UI.
- Trial did-not-manifest and failed states are not presented as ordinary success.

**Verification/smoke:**
- Documentation-only unless implemented.
- Future visual smoke: success/failure/not-manifested.

**Required Codex report:**
- result source:
- reward source:
- report handoff:
- missing dependencies:

---

## UI-TRIALS-5 — Combat Trial / Ares Strength Direction

**Goal:**  
Dopisać trial direction dla Strength jako combat-based Trial of Ares, oparty o istniejący combat module/prototypy, bez tworzenia osobnej mechaniki klikowej.

**Scope:**
- Document that Strength trial can use combat screen/module direction.
- The combat minigame remains governed by combat runtime/Walking Dead action manifests where applicable.
- Trial provider interprets combat result as trial success/failure and reward eligibility.

**Out of scope:**
- New combat system.
- PvP-specific report logic.
- Reward implementation.

**Data/source rules:**
- Combatants and combat state from DB/RPC live combat/session or result snapshot.
- Trial success/failure from backend trial/combat integration.
- Combat itself does not grant trial rewards directly.

**UI/SCSS rules:**
- Use shared combat UI direction.
- Combat log must be readable and full where report requires it.
- No defender/private equipment leak in PvP contexts.

**Acceptance criteria:**
- Ares/Strength has a clear trial mapping.
- It reuses combat direction and does not invent another timing minigame.
- Trial/report handoff is explicit.

**Verification/smoke:**
- Documentation-only unless implemented.

**Required Codex report:**
- combat source:
- trial source:
- report/result source:

---

## UI-TRIALS-6 — Artemis Dexterity Prototype Direction: Harpy Hunt

**Goal:**  
Dopisać zaakceptowany kierunek Dexterity Trial jako safe-motion aiming/hunting minigame.

**Scope:**
- Document visual/mechanical direction:
  - target creatures crossing field,
  - cursor/reticle control,
  - required hits in limited time or limited attempts,
  - difficulty via target speed/count/size, reticle jitter, time window.
- Note accessibility and photosensitive safety constraints.

**Out of scope:**
- Production physics/animation implementation.
- Asset creation.
- Final mobile design.

**Data/source rules:**
- Runtime parameters from trial config/read model.
- Success/failure through backend attempt submit workflow.

**UI/SCSS rules:**
- No rapid flash/strobe.
- Prefer smooth motion and reduced-motion mode.
- If using canvas/SVG later, renderer host must still preserve global shell/pattern rules.

**Acceptance criteria:**
- Artemis/Dexterity has a documented prototype direction.
- Difficulty knobs are explicit.
- Safety constraints are explicit.

**Verification/smoke:**
- Documentation-only unless implemented.

**Required Codex report:**
- runtime knobs:
- safety constraints:
- mobile concerns:

---

## UI-TRIALS-7 — Apollo Agility Prototype Direction: Path of Light

**Goal:**  
Dopisać zaakceptowany kierunek Agility Trial jako step-through fading path minigame.

**Scope:**
- Document visual/mechanical direction:
  - grid of light tiles,
  - active tile and optional next-tile preview,
  - hero marker,
  - tile lifetime / mistakes / path length,
  - success after completing path,
  - failure after mistakes or timeout.

**Out of scope:**
- Production implementation.
- Final mobile layout.

**Data/source rules:**
- Grid size, path length, tile lifetime, preview availability, mistakes from runtime config.
- Submission/result through canonical trial workflow.

**UI/SCSS rules:**
- No unsafe flashing; fading/opacity changes must be calm.
- Reduced-motion mode should remain possible.

**Acceptance criteria:**
- Apollo/Agility direction is documented and distinguishable from combat/Aphrodite timing.
- Difficulty knobs are explicit.

**Verification/smoke:**
- Documentation-only unless implemented.

**Required Codex report:**
- runtime knobs:
- accessibility constraints:

---

## UI-TRIALS-8 — Hephaestus Endurance Prototype Direction: Divine Forge

**Goal:**  
Dopisać zaakceptowany kierunek Endurance Trial jako process-control forge minigame.

**Scope:**
- Document mechanics:
  - Heat,
  - Strain,
  - Progress,
  - Strike,
  - Bellows,
  - Quench.
- Endurance affects tolerance and stability:
  - wider safe heat range,
  - lower strain gain,
  - slower heat decay,
  - higher strain limit / grace.

**Out of scope:**
- Final balance.
- Production implementation.

**Data/source rules:**
- Parameters from trial config/read model.
- Final success/failure through backend workflow.

**UI/SCSS rules:**
- Visual fire/forge effects must be safe and non-strobing.
- No rapid clicking requirement.

**Acceptance criteria:**
- Hephaestus/Endurance has a clear non-combat, non-timing process-control identity.
- Difficulty knobs are explicit.

**Verification/smoke:**
- Documentation-only unless implemented.

**Required Codex report:**
- runtime knobs:
- success/failure source:
- safety constraints:

---

## UI-TRIALS-9 — Hermes Cunning Prototype Direction: Shifting Seals

**Goal:**  
Dopisać zaakceptowany kierunek Cunning Trial jako procedural shell-game/seal-tracking minigame bez bazy zagadek.

**Scope:**
- Document mechanics:
  - 4 seals by default,
  - reveal true seal,
  - shuffle/seal swaps,
  - visible labels are position labels, not hidden identity,
  - choose after shuffle,
  - mistakes reduce trust.
- Difficulty knobs:
  - seal count,
  - preview time,
  - shuffle speed,
  - swap count,
  - false motion/fake swaps,
  - mistakes allowed.

**Out of scope:**
- Text riddle/clue database.
- Production implementation.

**Data/source rules:**
- Parameters from runtime config.
- Result through canonical trial workflow.

**UI/SCSS rules:**
- No persistent highlight after preview.
- Smooth non-flashing motion.
- Reduced-motion alternative must be considered.

**Acceptance criteria:**
- Hermes/Cunning does not require authored clue/riddle content.
- Prototype direction is procedural and balanceable.

**Verification/smoke:**
- Documentation-only unless implemented.

**Required Codex report:**
- runtime knobs:
- no-riddle-content confirmed:
- accessibility constraints:

---

## UI-TRIALS-10 — Hera Intelligence Prototype Direction: Labyrinth With Minotaur

**Goal:**  
Dopisać kierunek Intelligence Trial jako labirynt z Minotaurem, bez walki.

**Scope:**
- Document mechanics:
  - generated or configured maze,
  - player must reach exit,
  - Minotaur moves through maze,
  - fail if Minotaur catches player or player cannot exit in time/steps,
  - no combat resolution inside this trial.
- Intelligence/difficulty affects:
  - maze size,
  - visibility/fog/revealed tiles,
  - Minotaur speed/pathing intelligence,
  - allowed time/steps,
  - hint/reveal strength.

**Out of scope:**
- Production maze algorithm.
- Combat with Minotaur.
- Final visual art.

**Data/source rules:**
- Maze seed/config and difficulty from runtime config/read model where possible.
- Result through canonical trial workflow.

**UI/SCSS rules:**
- Use trial host; maze renderer is contained inside minigame slot.
- No image dependency required for MVP prototype.
- Mobile layout is a known risk and follow-up.

**Acceptance criteria:**
- Hera/Intelligence has a documented non-riddle puzzle direction.
- No authored riddle database required.
- No combat fallback.

**Verification/smoke:**
- Documentation-only unless implemented.

**Required Codex report:**
- maze runtime dependencies:
- no-combat confirmed:
- mobile concerns:

---

## UI-TRIALS-11 — Athena Wisdom Prototype Direction: Scales of Judgment

**Goal:**  
Dopisać zaakceptowany kierunek Wisdom Trial jako procedural omen-judgment under incomplete information.

**Scope:**
- Document mechanics:
  - 8 omens by default,
  - hidden weights,
  - limited Insight tokens,
  - select exact number of omens,
  - target judgment range,
  - qualitative reveals: strongly favorable, slightly favorable, uncertain, harmful,
  - no exact current sum during active choice.
- Difficulty knobs:
  - omen count,
  - selected count,
  - insight tokens,
  - target range width,
  - reveal precision,
  - attempts allowed.

**Out of scope:**
- Riddle database.
- Production implementation.
- Exact balancing generator.

**Data/source rules:**
- Omen set/weights may be generated by backend/runtime config, not Angular authority.
- Result through canonical trial workflow.

**UI/SCSS rules:**
- Qualitative feedback only during active trial.
- Do not show exact `Current judgment` sum before final judgment.

**Acceptance criteria:**
- Athena/Wisdom is not a fixed mapping puzzle.
- Generator/balancing needs are explicit.
- Player feedback remains useful but not solved by arithmetic display.

**Verification/smoke:**
- Documentation-only unless implemented.

**Required Codex report:**
- qualitative labels:
- exact values hidden:
- generator dependencies:

---

## UI-TRIALS-12 — Aphrodite Charisma Prototype Direction: The Graces’ Court

**Goal:**  
Dopisać zaakceptowany kierunek Charisma Trial jako timing/turn-taking minigame with moving receptive arcs.

**Scope:**
- Document mechanics:
  - three Graces as presentation model,
  - active Grace rotates,
  - player responds when pointer overlaps moving receptive arc,
  - correct timing builds Influence,
  - mistakes create Faux Pas,
  - moving arc rotates against pointer.
- Difficulty knobs:
  - receptive arc width,
  - pointer speed,
  - arc speed,
  - number of required responses,
  - faux pas limit,
  - number of active circles/Graces.

**Out of scope:**
- Dialogue/persuasion text database.
- Flashing lure effects.
- Production implementation.

**Data/source rules:**
- Runtime parameters from config/read model.
- Result through canonical trial workflow.

**UI/SCSS rules:**
- No flashing/strobe/rapid contrast flicker.
- Smooth motion and reduced-motion support required.
- Use trial host.

**Acceptance criteria:**
- Aphrodite/Charisma is not another scale-balancing mechanic.
- It has clear difficulty knobs.
- It avoids dialogue authoring burden.

**Verification/smoke:**
- Documentation-only unless implemented.

**Required Codex report:**
- runtime knobs:
- safety constraints:
- reduced-motion behavior:

---

## UI-TRIALS-13 — Zeus Spirituality Prototype Direction: Storm Charge

**Goal:**  
Dopisać zaakceptowany kierunek Spirituality Trial jako hold-to-charge ritual control minigame.

**Scope:**
- Document mechanics:
  - three pillars/signs: Sky, Earth, Oath,
  - player holds each sign button to charge,
  - released signs keep charge for release grace/debounce period,
  - after grace they leak charge,
  - Call Thunder works when all three exceed threshold,
  - 3 thunder calls as accepted prototype threshold,
  - wrong call creates Wrath,
  - ritual window/timer can fail the attempt.
- Difficulty knobs:
  - charge rate,
  - leak rate,
  - release grace duration,
  - threshold height,
  - ritual window length,
  - wrath/fail limit.

**Out of scope:**
- Original three-auto-alignment version.
- Rapid clicking.
- Flash/strobe lightning effects.
- Final mobile solution.

**Data/source rules:**
- Runtime parameters from config/read model.
- Result through canonical trial workflow.
- Frontend may animate charge but durable success/failure is backend-owned.

**UI/SCSS rules:**
- No rapid clicking requirement.
- Smooth charge/leak animation.
- No lightning flash/strobe; use soft glow only.
- Mobile layout is a required future follow-up because vertical stacking may be hard during active play.

**Acceptance criteria:**
- Zeus/Spirituality has a distinct sustained-control identity.
- 3 thunder calls are documented as accepted prototype threshold.
- Release grace is documented as required for playability.
- Difficulty knobs are explicit.

**Verification/smoke:**
- Documentation-only unless implemented.
- Future visual smoke: blessed and low-spirituality modes.

**Required Codex report:**
- runtime knobs:
- release grace behavior:
- mobile concerns:
- safety constraints:

---

# 16. UI-COMBAT — Future combat screen

Cel: osobny future combat screen dla Walking Dead, combatants, combat log, attack source labels i outcome/report handoff. Combat UI jest źródłowo neutralny: Trial, Encounter, PvP, Sandbox/Admin Test mogą używać tego samego combat result presentation. Target selection i combat result/report są osobnymi ekranami.

## UI-COMBAT task index

- UI-COMBAT-1 — Combat screen shell
- UI-COMBAT-2 — Combatants panels and health bars
- UI-COMBAT-3 — Walking Dead timing component
- UI-COMBAT-4 — Combat log and attack source labels
- UI-COMBAT-5 — Combat result display and report handoff
- UI-COMBAT-6 — Combat privacy and snapshot boundary

## UI-COMBAT-1 — Combat screen shell

**Goal:**  
Zdefiniować/zbudować combat screen shell jako osobny ekran po rozpoczęciu walki, niezależny od PvP target selection.

**Scope:**
- route/page target proposal or existing combat route,
- combat source label: trial/encounter/pvp/sandbox/admin_test,
- initiator/defender side labels,
- combatants area,
- Walking Dead timing slot,
- combat log slot,
- outcome/report handoff slot,
- loading/error/no combat state.

**Out of scope:**
- PvP target selection,
- target eligibility,
- combat engine implementation,
- reward persistence,
- live recomputation of completed results.

**Data/source rules:**
- combat data from combat result/session/read model where available,
- source type from DB-backed combat source type dictionary/read model,
- participant sides use initiator/defender semantics, not hero/opponent assumptions,
- completed combat should prefer durable snapshot.

**UI/SCSS rules:**
- use global page/card/timeline/progress patterns,
- no local heavy decorative arena unless accepted,
- combat screen must remain readable and not overdecorated,
- labels from dictionaries/metadata where available.

**Dependencies/blockers:**
- if no active combat/session read model exists, keep task as prototype/shell and report backend dependency,
- if combat result snapshot exists only after completion, live combat UI may be future blocker.

**Acceptance criteria:**
- combat screen is separate from PvP target selection,
- source/side labels visible,
- shell supports combatants/timer/log/result slots,
- no fake live combat data,
- build passes if implemented.

**Verification/smoke:**
- route smoke if route exists,
- loading/no combat state smoke,
- completed result smoke if data exists,
- build/tsc.

**Required Codex report:**
- combat data source:
- source/side dictionary source:
- missing live data blockers:
- local SCSS added:

## UI-COMBAT-2 — Combatants panels and health bars

**Goal:**  
Pokazać combatants in a clear two-side layout, with health bars and allowed snapshot data.

**Scope:**
- initiator panel,
- defender panel,
- participant kind: hero/opponent,
- name/label,
- health/current HP,
- key visible stats if allowed,
- status/effects if available,
- attack source/equipment summary only where allowed by snapshot/privacy.

**Out of scope:**
- full private equipment reveal,
- live derived stat recompute,
- equip/unequip,
- admin opponent editor.

**Data/source rules:**
- combatants from combat participant snapshot/read model,
- defender private equipment not exposed unless snapshot/report policy allows,
- opponent equipment is blueprint/generated fight snapshot, not real player item,
- health values from combat snapshot/session state.

**UI/SCSS rules:**
- health bars use shared progress pattern,
- two panels balanced visually,
- important HP/status not muted,
- icons via custom registry/placeholders.

**Dependencies/blockers:**
- missing HP/current state -> show static participant summary and report blocker,
- missing privacy policy fields -> omit sensitive details.

**Acceptance criteria:**
- initiator/defender both visible,
- HP bars readable,
- participant kind clear,
- privacy boundaries preserved,
- build passes.

**Verification/smoke:**
- hero vs opponent smoke,
- hero vs hero smoke if PvP data exists,
- low HP/defeated state smoke,
- build/tsc.

**Required Codex report:**
- participant data source:
- privacy fields omitted:
- progress pattern reused:
- local SCSS added:

## UI-COMBAT-3 — Walking Dead timing component

**Goal:**  
Zaprojektować Walking Dead timing component for the actual combat screen, not target selection.

**Scope:**
- timing bar/track,
- current actor/next action indication where backend supports it,
- turn/round or timing explanation,
- paused/completed/loading states,
- integration slot in combat screen.

**Out of scope:**
- combat timing engine,
- target selection timing,
- arbitrary animation without backend state,
- live polling architecture unless current project supports it.

**Data/source rules:**
- timing state from combat session/read model if live combat exists,
- if only final snapshots exist, component remains future/prototype or shows timeline from snapshot,
- do not generate local fake timing for production.

**UI/SCSS rules:**
- use global progress/timer patterns where possible,
- motion restrained and accessible,
- no constant distracting animation unless useful.

**Dependencies/blockers:**
- missing live combat timing model -> blocker/future note,
- missing timer pattern -> UI-CORE/shell dependency.

**Acceptance criteria:**
- component is clearly located on combat screen only,
- supports loading/completed/no-live-state,
- does not fake backend timing,
- build passes if implemented.

**Verification/smoke:**
- static/completed state smoke,
- live timing smoke if backend exists,
- reduced-motion/accessibility consideration,
- build/tsc.

**Required Codex report:**
- timing data source:
- live support yes/no:
- animation choices:
- local SCSS added:

## UI-COMBAT-4 — Combat log and attack source labels

**Goal:**  
Pokazać combat log/timeline z czytelnymi attack source labels i bez wycieku private equipment.

**Scope:**
- ordered combat log rows,
- turn/sequence index,
- actor side/name,
- attack/source label,
- damage/heal/effect summary,
- miss/crit/block if data exists,
- attack source kind labels: natural, unarmed, player_item, opponent_manual, opponent_generated where available.

**Out of scope:**
- generating combat log from scratch,
- live recomputation,
- exposing full defender equipment if not in snapshot,
- raw JSON log display.

**Data/source rules:**
- log from combat result attacks/snapshot/read model,
- attack source dictionaries from DB-backed combat explainability dictionaries,
- item references only when snapshot/report policy allows,
- opponent generated/manual equipment labels should not pretend to be player inventory.

**UI/SCSS rules:**
- use timeline/list row pattern,
- source labels as badges/chips,
- important outcomes not muted,
- technical keys secondary.

**Dependencies/blockers:**
- missing combat attack rows -> show summary only and report data gap,
- missing dictionaries -> report metadata dependency or fallback safely.

**Acceptance criteria:**
- combat log rows readable,
- attack source labels meaningful,
- no raw JSON player-facing,
- privacy preserved,
- build passes.

**Verification/smoke:**
- log render smoke with sample/snapshot data,
- source kind variety smoke if available,
- empty log smoke,
- build/tsc.

**Required Codex report:**
- combat log source:
- dictionary/metadata source:
- privacy omissions:
- local SCSS added:

## UI-COMBAT-5 — Combat result display and report handoff

**Goal:**  
Pokazać wynik walki i przejście do durable report, bez mieszania live combat screen z report archive.

**Scope:**
- outcome banner: initiator victory, defender victory, draw,
- rewards/resource/item summary if allowed and available,
- participant final HP/status,
- action: Open report,
- action: Return to source context where available,
- share/report action only where report supports it.

**Out of scope:**
- reward granting logic,
- report producer backend,
- public share route,
- live recomputation of rewards.

**Data/source rules:**
- outcome from combat result snapshot,
- rewards from reward/result/report read model if available,
- report handoff through game_reports/source mapping where implemented,
- no fake reward summary if backend missing.

**UI/SCSS rules:**
- outcome as prominent but readable banner/card,
- status badges for victory/defeat/draw,
- item popovers via UI-CORE-6,
- report button clear.

**Dependencies/blockers:**
- missing report link -> show result only and report dependency,
- missing reward snapshot -> omit reward summary and report gap.

**Acceptance criteria:**
- result state visible,
- report handoff clear if available,
- no fake rewards,
- no privacy leak,
- build passes.

**Verification/smoke:**
- victory/defeat/draw visual smoke if data available,
- report link smoke,
- missing report state smoke,
- build/tsc.

**Required Codex report:**
- outcome source:
- reward/report source:
- omitted rewards/reports:
- local SCSS added:

## UI-COMBAT-6 — Combat privacy and snapshot boundary

**Goal:**  
Utrwalić zasady prywatności i snapshotów dla combat UI, szczególnie PvP.

**Scope:**
- document/display rules for hero vs opponent combat,
- allowed fields for defender/player equipment,
- source labels vs full item details,
- completed result snapshot vs live state,
- admin/sandbox exceptions if any.

**Out of scope:**
- RLS/RPC policy changes,
- changing snapshot schema,
- defender equipment reveal,
- admin debug payload UI.

**Data/source rules:**
- combat result snapshots are durable source for completed reports,
- live player state should not be used to reconstruct historical combat,
- defender private equipment not exposed unless snapshot/report policy allows,
- admin_test/sandbox may have different debug permissions but must be explicit.

**UI/SCSS rules:**
- technical/debug data not player-facing,
- privacy omissions should fail closed,
- helper copy concise if a field is hidden.

**Dependencies/blockers:**
- unclear snapshot/privacy policy -> decision dependency,
- missing allowed labels -> metadata dependency.

**Acceptance criteria:**
- privacy rules documented for combat UI,
- player-facing combat/report screens fail closed,
- admin/sandbox exceptions explicit,
- build passes if code changed.

**Verification/smoke:**
- review checklist item added,
- no private equipment shown in PvP smoke if data available.

**Required Codex report:**
- privacy policy source:
- fields intentionally omitted:
- snapshot vs live source:
- open decisions:

---

# 17. UI-REPORTS — Reports and Notifications

Cel: Reports Center, Reports archive, Notifications archive, full report detail, topbar bell/dropdown i toast-to-notification contract. Reports i Notifications są różnymi typami informacji i nie mogą być mieszane w jednej liście.

## UI-REPORTS task index

- UI-REPORTS-1 / formerly UI-45 — Reports Center shell
- UI-REPORTS-2 / formerly UI-46 — Reports list/archive screen
- UI-REPORTS-3 / formerly UI-47 — Full report detail route
- UI-REPORTS-4 / formerly UI-48 — Notifications archive tab
- UI-REPORTS-5 / formerly UI-49 — Topbar notification bell and recent notifications dropdown
- UI-REPORTS-6 / formerly UI-50 — Toast-to-notification behavior contract

## UI-REPORTS-1 / formerly UI-45 — Reports Center shell

**Goal:**  
Zbudować wspólny Reports Center shell dla dwóch osobnych archiwów: Reports i Notifications.

**Scope:**
- route/page target: existing reports route if present,
- tabs: Reports and Notifications,
- shared page header,
- shared filter/list/detail layout,
- read/unread visual state,
- pagination,
- empty/loading states,
- topbar bell considered quick access only, not archive replacement.

**Out of scope:**
- full report detail route,
- notification settings,
- public share report route,
- action queue/timer dashboard,
- audit/admin logs.

**Data/source rules:**
- Reports and Notifications should use separate read models/services if backend separates them,
- read/unread is user/hero scoped according to backend contract,
- do not mix audit/player-abuse reports with gameplay reports,
- if Notifications backend/archive missing, report dependency.

**UI/SCSS rules:**
- use global tabs/list/detail/pagination patterns,
- no local copied report card CSS,
- icons from custom registry/placeholders,
- statuses as badges/pills.

**Dependencies/blockers:**
- missing reports read model -> blocker for Reports tab,
- missing notifications read model -> blocker for Notifications tab,
- missing read state mutation -> open marks read disabled/dependency.

**Acceptance criteria:**
- Reports and Notifications tabs exist,
- entries are not mixed,
- layout supports list + detail panel,
- topbar bell not treated as archive,
- build passes.

**Verification/smoke:**
- route smoke,
- tab switch smoke,
- empty/loading state smoke,
- build/tsc.

**Required Codex report:**
- reports source:
- notifications source:
- shared components reused:
- local SCSS added:
- not added intentionally:

## UI-REPORTS-2 / formerly UI-46 — Reports list/archive screen

**Goal:**  
Zbudować Reports tab jako archiwum pełnych gameplay records, z listą, filtrami i summary/detail panelem.

**Scope:**
- report list rows/cards,
- categories: Combat, Trial, Encounter, PvP, Spy/Siege, Trade/Auction,
- report title, short summary, type, outcome/status, created time, read/unread,
- filters by type/status/time/search,
- pagination,
- detail side panel with participants/source/outcome/rewards/changes summary,
- actions: Open full report, Share.

**Out of scope:**
- Mark read button; opening marks read automatically,
- Share later label,
- full detail route implementation,
- public report route,
- live recomputation of historical reports,
- audit/player-abuse reports.

**Data/source rules:**
- reports render from durable report/snapshot data,
- item references use report item references/snapshots where available,
- opening report/detail should mark read through canonical read-state path if available,
- no private defender equipment leak.

**UI/SCSS rules:**
- use shared list/pagination/detail side panel patterns,
- type/outcome as badges/icons,
- report content not muted if meaningful,
- no local card system.

**Dependencies/blockers:**
- missing report read model -> dependency,
- missing mark-read path -> report limitation,
- missing share token/path -> show Share only if available or report dependency.

**Acceptance criteria:**
- Reports tab lists full reports,
- read state visible,
- clicking/opening marks read where backend supports it,
- detail summary visible,
- Open full report and Share actions present only where supported,
- build passes.

**Verification/smoke:**
- list render smoke,
- filter smoke,
- pagination smoke,
- open/mark-read smoke if backend available,
- build/tsc.

**Required Codex report:**
- report read model:
- mark-read path:
- share path:
- item snapshot handling:
- local SCSS added:

## UI-REPORTS-3 / formerly UI-47 — Full report detail route

**Goal:**  
Zbudować osobny full report detail screen dla trwałego gameplay reportu.

**Scope:**
- route/page target: e.g. `/reports/:reportId` or project route convention,
- header with report type/outcome/date,
- participants/source,
- main result summary,
- combat timeline/turns/log if combat report,
- rewards/loot/resource changes,
- item references with shared item popovers,
- Share action where allowed,
- read state update on open.

**Out of scope:**
- public share route unless separate task,
- report producer backend,
- live recomputation from current state,
- exposing private data not in snapshot.

**Data/source rules:**
- read durable report snapshot/read model,
- combat reports read combat result snapshots,
- trade reports show exact buyer/seller/item/CP summary from transaction-time data,
- item references use report item reference fallback where source item is missing,
- mark read through canonical path if available.

**UI/SCSS rules:**
- use report detail/page header/timeline patterns,
- item popovers via UI-CORE-6,
- technical ids secondary,
- no raw JSON payload as player-facing UI.

**Dependencies/blockers:**
- missing report detail read model -> blocker,
- missing timeline/log data -> render summary and report partial dependency,
- missing share token -> hide/disable Share and report dependency.

**Acceptance criteria:**
- full report route opens from Reports Center,
- report content is durable snapshot-based,
- opening marks read where supported,
- item references display safely,
- no privacy leak,
- build passes.

**Verification/smoke:**
- route smoke for report detail,
- combat report smoke if data exists,
- trade/report item smoke if data exists,
- missing report/404 smoke,
- build/tsc.

**Required Codex report:**
- report detail source:
- mark-read path:
- item reference handling:
- share capability:
- local SCSS added:

## UI-REPORTS-4 / formerly UI-48 — Notifications archive tab

**Goal:**  
Zbudować Notifications tab jako pełne archiwum krótkich komunikatów systemowych/gameplayowych.

**Scope:**
- four summary cards:
  - Unread,
  - Needs attention,
  - Last 24h,
  - Muted categories,
- notification list rows,
- category/severity/status/read state,
- filters: category/status/severity/search,
- pagination,
- detail side panel,
- linked source/report action,
- opening notification marks read where supported.

**Out of scope:**
- full notification settings page,
- report detail inside notification detail,
- action queue/timer dashboard,
- audit logs,
- raw technical payloads.

**Data/source rules:**
- notifications from persistent notification read model,
- online toasts do not replace archive,
- read/unread user/hero scoped per backend,
- severity/category from DB/dictionary/read model where available,
- if backend archive missing, report dependency and do not create permanent local store.

**UI/SCSS rules:**
- short scannable rows,
- notification detail remains short-form,
- severity as badges/status, not only colored text,
- no localStorage archive UI.

**Dependencies/blockers:**
- missing notification read model -> blocker,
- missing mark-read path -> read state limitation,
- missing muted categories source -> hide/placeholder according to convention.

**Acceptance criteria:**
- Notifications tab has four summary cards,
- list is short-form and scannable,
- detail panel links to source/report where available,
- opening marks read where supported,
- no fake local archive,
- build passes.

**Verification/smoke:**
- tab smoke,
- filter/pagination smoke,
- open/mark-read smoke if backend available,
- empty state smoke,
- build/tsc.

**Required Codex report:**
- notification source:
- category/severity source:
- mark-read path:
- source/report link handling:
- local SCSS added:

## UI-REPORTS-5 / formerly UI-49 — Topbar notification bell and recent notifications dropdown

**Goal:**  
Dodać topbar bell/dropdown jako quick access do najnowszych notifications, bez zastępowania pełnego archiwum.

**Scope:**
- bell icon/button in topbar,
- unread count badge,
- dropdown with latest 5–10 notifications,
- entry title, short subtitle, severity/category icon, time, unread marker,
- footer/action: View all -> Reports Center > Notifications,
- zero-count inactive state,
- close/click outside behavior through existing overlay pattern.

**Out of scope:**
- full notifications archive,
- notification settings,
- reports list in dropdown,
- custom overlay system if PrimeNG/vendor exists.

**Data/source rules:**
- same notification read model as archive but limited to latest entries,
- unread count from backend/read model,
- clicking item may route to source/report/detail if supported,
- no local permanent state.

**UI/SCSS rules:**
- use topbar/bell/overlay/popover vendor patterns,
- no orphan dropdown nodes in topbar,
- bell coexists with resource chips without layout breakage.

**Dependencies/blockers:**
- missing latest notifications source -> hide/dropdown pending and report dependency,
- missing overlay wrapper -> use PrimeNG overlay/popover or report gap.

**Acceptance criteria:**
- bell shows unread count,
- dropdown shows recent notifications only,
- View all opens Notifications archive,
- topbar layout stable,
- build passes.

**Verification/smoke:**
- open/close dropdown smoke,
- unread count smoke,
- View all route smoke,
- zero notifications smoke,
- build/tsc.

**Required Codex report:**
- latest notification source:
- overlay/wrapper reused:
- topbar layout changed:
- local SCSS added:

## UI-REPORTS-6 / formerly UI-50 — Toast-to-notification behavior contract

**Goal:**  
Opisać i/lub wdrożyć kontrakt między online toastami a persistent notification archive.

**Scope:**
- online active event can show toast where live event delivery exists,
- persistent archive remains source for historical items,
- toast fields: title, summary, severity, optional action/link,
- archive fields: category, severity, title, message, created time, read state, optional linked source/report,
- toast click routes to source/detail where supported,
- if opened from toast, mark read where appropriate.

**Out of scope:**
- building backend notification system if missing,
- permanent localStorage notification store,
- audit/event log substitute,
- staff/private payloads in player notifications.

**Data/source rules:**
- backend decides which events persist,
- frontend displays received live events,
- backend/read model owns archive and read/unread,
- no inference of persistence from toast state only.

**UI/SCSS rules:**
- use PrimeNG/vendor toast wrapper,
- severities map to Mythsworn notification severity names,
- toast content short and action-oriented.

**Dependencies/blockers:**
- missing live event channel -> document dependency and implement archive surfaces only,
- missing notification archive backend -> no permanent local substitute.

**Acceptance criteria:**
- contract documented in code/docs/task notes,
- toasts and archive responsibilities not confused,
- click routing described/implemented where supported,
- no local-only permanent store,
- build passes if code changed.

**Verification/smoke:**
- toast visual smoke if event/mock available,
- route/action smoke from toast if implemented,
- archive still source of truth,
- build/tsc.

**Required Codex report:**
- live event source:
- archive source:
- toast wrapper reused:
- persistence not added intentionally:

---

## Additional report/result prototype integration follow-ups

## UI-REPORTS-7 — Trial Result Report Variants

**Goal:**  
Dopisać brakujące backlog entries dla trial report variants wypracowanych podczas prototypowania.

**Scope:**
- Document player-facing report variants:
  - completed/passed trial,
  - failed trial,
  - trial did not manifest,
  - ongoing manual trial placeholder/host link,
  - trial with embedded combat/minigame result summary.
- Report should be linear/readable, not dashboard-like.
- Rewards should show EXP, drachmas/resources and item references from durable reward snapshot.

**Out of scope:**
- Recomputing rewards client-side.
- Full report sharing policy.
- Combat renderer implementation.

**Data/source rules:**
- Reports use durable report/result snapshot/read model.
- Item references use shared item popover contract when available.
- Missing data is omitted or shown as diagnostic, not faked.

**UI/SCSS rules:**
- Use shared report/card/badge/list patterns.
- No fake participants unless source data exists.
- Technical sequence/debug visible only in debug/admin context.

**Acceptance criteria:**
- Trial report variants are described in backlog.
- Reward display rules are explicit.
- Not-manifested state is distinct from failure/success.

**Verification/smoke:**
- Documentation-only unless implemented.

**Required Codex report:**
- report source:
- reward source:
- item reference source:
- debug fields omitted:

---

## UI-REPORTS-8 — PvP / Combat Report Perspective Variants

**Goal:**  
Dopisać backlog entry dla combat/PvP report perspective handling.

**Scope:**
- Document variants:
  - I attacked and won,
  - I attacked and lost,
  - I defended and won,
  - I defended and lost.
- Outcome color/status should be viewer-relative when product permits it.
- Combat log should be chronological from fight start downward.
- Combat log should be full in report, no hidden scroll for required report content.
- Critical hits, misses and evades should use readable semantic emphasis.

**Out of scope:**
- PvP backend consequence implementation.
- Private equipment leakage.
- Public share policy.

**Data/source rules:**
- Completed reports use snapshot, not live state.
- Defender/private equipment must not leak unless snapshot policy allows.
- PvP rewards/resources from PvP consequence snapshot, not ordinary reward profile.

**UI/SCSS rules:**
- Use report/list/status patterns.
- No combat log in one compressed line when turns/actions need separation.
- No local combat badge system.

**Acceptance criteria:**
- Perspective variants are explicit.
- Viewer-relative success/failure color rule is documented as desired if feasible.
- Full chronological combat log requirement is documented.

**Verification/smoke:**
- Documentation-only unless implemented.

**Required Codex report:**
- viewer perspective source:
- snapshot source:
- omitted private fields:

---

# 18. UI-ESTATE — Estate, buildings and vicinity

Cel: estate overview, building cards, active building job, build action boundary and future vicinity/list entry. Estate UI musi pokazywać budynki dostępne dla aktualnego district context i nie może oferować cancel/claim, jeśli gameplay decyzje tego nie przewidują.

## UI-ESTATE task index

- UI-ESTATE-1 / formerly UI-23 — Estate overview
- UI-ESTATE-2 / formerly UI-24 — Building cards and district grouping
- UI-ESTATE-3 / formerly UI-25 — Active building job panel
- UI-ESTATE-4 / formerly UI-26 — Build action RPC boundary
- UI-ESTATE-5 / formerly UI-27 — Estate list / vicinity entry boundary

## UI-ESTATE-1 / formerly UI-23 — Estate overview

**Goal:**  
Zbudować Estate overview jako player-facing ekran posiadłości z budynkami dostępnymi w aktualnym district context, active building job i build actions.

**Scope:**
- route/page target: existing estate route/page if present,
- page header with estate/address context,
- available building summary,
- building cards/grid,
- current level,
- current bonus/effect,
- next level bonus/effect,
- next level build time,
- next level cost,
- build button/action where eligible,
- active building job shown prominently if one exists,
- link/entry to estate list/vicinity if present in navigation.

**Out of scope:**
- cancel building job player action,
- claim/collect completed building job if DB finalizes lazily,
- building admin/configurator,
- DB schema changes,
- fake production values if backend/read model missing.

**Data/source rules:**
- estate data from active hero/selected server estate read model,
- address source should use `district_code + address_number` where current decisions require it,
- building definitions and current levels from canonical building/estate services,
- costs/time/requirements from DB/read model/formula preview where available,
- no direct writes to estate/building tables.

**UI/SCSS rules:**
- use shared page header/card/stat/note patterns,
- building image/placeholder uses global image/card pattern,
- no local repeated building-card CSS if global card pattern can cover it,
- no player-facing technical copy like “one estate per hero”.

**Dependencies/blockers:**
- if build execution RPC is missing, show read-only/disabled action and report dependency,
- if active job read model missing, report dependency,
- if cost/time preview missing, show safe partial and report data gap.

**Acceptance criteria:**
- estate overview shows available buildings for current context,
- each building card shows current level, bonus, next build time/cost where data exists,
- active job visible if present,
- no Cancel button/copy,
- no fake claim/collect flow,
- build passes.

**Verification/smoke:**
- route smoke for Estate,
- visual smoke with active job and without active job if data possible,
- disabled/ineligible build smoke,
- build/tsc.

**Required Codex report:**
- reused estate/building services:
- cost/time source:
- active job source:
- checked but not reused:
- local SCSS added:

## UI-ESTATE-2 / formerly UI-24 — Building cards and district grouping

**Goal:**  
Pokazać budynki według district availability, tak aby district B mógł pokazywać budynki z A+B, a wyższe district contexts mogły rozszerzać dostępność.

**Scope:**
- building grouping/sections by source district or availability band,
- available buildings count,
- visual distinction between current district and inherited lower-district buildings,
- building cards with image/placeholder, current level, next cost/time/effect,
- desktop-first grid, mobile later as responsive fallback,
- link to estate list/vicinity where relevant.

**Out of scope:**
- player-facing copy about internal district logic,
- building district cap editor,
- admin building configuration,
- new DB schema for district grouping.

**Data/source rules:**
- `buildings.district_code` is minimum district where building is available,
- building available in that district and higher districts unless current DB says otherwise,
- level caps/requirements from read model/canonical building services,
- no hardcoded permanent building list if DB definitions exist.

**UI/SCSS rules:**
- use section/card/chip patterns,
- avoid badge copy like “A+B buildings available” if it reads technical/player-hostile,
- show “Available buildings” or more player-facing label instead of “Buildings on”.

**Dependencies/blockers:**
- if district availability resolver missing, report dependency,
- if building images/assets missing, use consistent placeholder and report asset gap.

**Acceptance criteria:**
- district B example can show A+B building availability,
- buildings outside available districts are not shown,
- grouping is understandable without technical jargon,
- build passes.

**Verification/smoke:**
- visual smoke for district A and B contexts if data available,
- empty/no-buildings smoke,
- build/tsc.

**Required Codex report:**
- building availability source:
- grouping logic source:
- image/asset fallback:
- local SCSS added:

## UI-ESTATE-3 / formerly UI-25 — Active building job panel

**Goal:**  
Pokazać aktywną budowę w estate UI bez sugerowania cancel/claim, jeśli te akcje nie są player-facing.

**Scope:**
- active job card/panel,
- building name/image/icon,
- target level,
- started/remaining/completes at,
- cost summary if useful,
- progress bar/timer,
- link/highlight matching building card,
- completed state messaging if backend surfaces completed but not finalized.

**Out of scope:**
- cancel action,
- claim/collect action,
- multi-job queue unless backend supports it,
- action queue dashboard.

**Data/source rules:**
- active job from canonical estate_building_job read model/service,
- status labels from DB enum/read model where available,
- timer is display-only if backend owns completion,
- no local mutation to mark job completed.

**UI/SCSS rules:**
- use global progress/timer/status card pattern,
- active job must be visually clear but not oversized,
- completed/failed/cancelled internal statuses should be handled safely without player-facing cancel flow.

**Dependencies/blockers:**
- missing active job read model -> dependency,
- missing timer/progress global pattern -> link to UI-CORE/shell persistent state.

**Acceptance criteria:**
- active job visible when present,
- no cancel UI,
- progress/remaining time displayed where data exists,
- state remains safe if no active job,
- build passes.

**Verification/smoke:**
- active job smoke,
- no active job smoke,
- completed job edge smoke if available,
- build/tsc.

**Required Codex report:**
- active job source:
- timer/progress pattern reused:
- statuses handled:
- not added intentionally:

## UI-ESTATE-4 / formerly UI-26 — Build action RPC boundary

**Goal:**  
Upewnić się, że Build action w Estate przechodzi przez canonical DB/RPC workflow, z właściwymi disabled states i feedbackiem.

**Scope:**
- build button on eligible building cards,
- disabled states for missing requirements/resources/active job/max level,
- cost/requirement display,
- canonical build RPC/service call where available,
- success toast / inline error using PrimeNG/vendor wrappers,
- stale guard if active hero/server changes.

**Out of scope:**
- direct writes to estate/building/job/resource tables,
- cancel/claim actions,
- cost formula redesign,
- admin build correction.

**Data/source rules:**
- build action through existing canonical RPC/service only,
- requirement/cost validation from backend/read model,
- frontend preview is explanatory and not authority,
- after success refresh estate/job/resources through existing services.

**UI/SCSS rules:**
- use shared buttons/messages/toasts/vendor wrappers,
- blocked reason visible and not muted if action is blocked,
- no local loading button CSS if shared pattern exists.

**Dependencies/blockers:**
- if canonical build RPC/service missing, report blocker and do not implement fake mutation,
- if requirements read model missing, show safe disabled state/dependency.

**Acceptance criteria:**
- build button only enabled when read model says eligible,
- action uses canonical workflow,
- stale success/error cannot update wrong hero/server context,
- resources/job refresh after success,
- build passes.

**Verification/smoke:**
- route smoke,
- disabled build smoke,
- build action smoke if backend/test data available,
- stale/context note if not testable,
- build/tsc.

**Required Codex report:**
- build RPC/service used:
- requirement/cost source:
- stale guard approach:
- local SCSS added:
- not added intentionally:

## UI-ESTATE-5 / formerly UI-27 — Estate list / vicinity entry boundary

**Goal:**  
Zdefiniować granicę między własnym Estate overview a listą posiadłości/vicinity, która może służyć wejściu do PvP target selection i world browsing.

**Scope:**
- entry/link from Estate to estate list/vicinity if route exists,
- short orientation copy,
- clarify that own estate view is not the full vicinity list,
- if estate list route exists: show lightweight navigation slot,
- if route missing: show no fake working link or mark pending by project convention.

**Out of scope:**
- full estate list implementation,
- PvP target selection implementation,
- ranking/vicinity table,
- siege/spy actions.

**Data/source rules:**
- estate list/vicinity data comes from server estate read model if implemented,
- no hardcoded estate list,
- PvP target actions belong to UI-PVP tasks.

**UI/SCSS rules:**
- link/card uses global navigation/entry pattern,
- avoid confusing labels like technical “Buildings on”,
- no second sidebar/duplicated nav.

**Dependencies/blockers:**
- if estate list route missing, report future route/UX dependency,
- if PvP vicinity is the intended route, link only when available and gated.

**Acceptance criteria:**
- user can see how Estate relates to wider estate list/vicinity,
- no fake list rendered without data,
- no PvP actions on Estate overview unless explicitly part of route,
- build passes if code changed.

**Verification/smoke:**
- link smoke if route exists,
- no-link/pending state smoke if route missing,
- build/tsc.

**Required Codex report:**
- route/link checked:
- read model availability:
- not added intentionally:
- local SCSS added:

---

# 19. UI-TRADE — Auction House and Direct Trade

Cel: osobne player-facing ekrany Auction House i Direct Trade, zgodne z CP economy, item lock rules, market slot rules i anti-abuse/audit boundaries. Trade UI nie może direct-write item/auction/trade/CP tables.

## UI-TRADE task index

- UI-TRADE-1 / formerly UI-29 — Auction House one-item listing browser
- UI-TRADE-2 / formerly UI-30 — Auction filters, summary and pagination
- UI-TRADE-3 / formerly UI-32 — Auction actions through canonical RPC/domain paths
- UI-TRADE-4 / formerly UI-33 — Direct Trade offer builder
- UI-TRADE-5 / formerly UI-34 — Direct Trade pending offers with pagination
- UI-TRADE-6 / formerly UI-35 — Trade market slot summary
- UI-TRADE-7 / formerly UI-36 — Direct Trade create offer RPC workflow
- UI-TRADE-8 / formerly UI-37 — Direct Trade target response UI
- UI-TRADE-9 / formerly UI-38 — Trade item display and popover integration

## UI-TRADE-1 / formerly UI-29 — Auction House one-item listing browser

**Goal:**  
Zbudować Auction House listing browser jako osobny ekran od Direct Trade. Auction listing pokazuje maksymalnie jeden item i CP-based price/bid actions.

**Scope:**
- route/page target: existing auction/trade route if present,
- listing list/table/card pattern per UI-CORE-14 decision,
- one item per listing,
- item name with shared item popover,
- current bid in Character Points,
- buy now amount in Character Points if available,
- auction mode: bidding, buy now, bidding with buy now,
- actions:
  - bidding listing: Bid, Watch, Buy now if available,
  - buy-now-only listing: Buy,
- seller/listing metadata,
- pagination.

**Out of scope:**
- Direct Trade builder,
- bundle/set auctions,
- drachma pricing for player-to-player trade,
- create listing flow unless separate task,
- anti-abuse case UI.

**Data/source rules:**
- listings from auction read model/service,
- item display from item snapshot/read model,
- prices/bids in Character Points only,
- drachmas may appear only as item inherent/vendor value in popover, not trade price,
- no direct writes to auction/item/CP tables.

**UI/SCSS rules:**
- use PrimeNG paginator/table or global list pattern per UI-CORE-14,
- item hover/focus uses shared popover,
- actions use shared buttons/action icons,
- status/requirements as badges/status pills.

**Dependencies/blockers:**
- if auction read model/service missing, report blocker,
- if item popover missing, link UI-CORE-6 dependency,
- if watch action unsupported, omit or mark pending, do not fake.

**Acceptance criteria:**
- auction and direct trade are visually/route-separated,
- one item per listing,
- CP displayed for bid/buy now,
- no drachma P2P price,
- actions match auction mode,
- pagination visible,
- build passes.

**Verification/smoke:**
- route smoke,
- listing render smoke,
- mode/action smoke for bidding vs buy-now,
- item popover smoke,
- build/tsc.

**Required Codex report:**
- auction read model used:
- item popover reused:
- paginator/list pattern:
- unsupported actions omitted:
- local SCSS added:

## UI-TRADE-2 / formerly UI-30 — Auction filters, summary and pagination

**Goal:**  
Dodać wygodne filtrowanie i paginację dla Auction House bez tworzenia niemożliwych filtrów albo fake danych.

**Scope:**
- filters by item category/slot/kind,
- equippable / not equippable / requirements warning if read model supports it,
- auction mode filter,
- search by item/seller/listing where available,
- summary cards/chips: available CP, locked CP, active bids, your listings,
- page controls and current range.

**Out of scope:**
- advanced market analytics,
- price history,
- sorting by hidden item usefulness,
- local fake counts.

**Data/source rules:**
- filter options from dictionaries/read models where available,
- available/locked CP from Character Point read model/locks,
- active bids/listings from auction service,
- if read model does not support a filter, do not show it as functional.

**UI/SCSS rules:**
- filters use PrimeNG/vendor inputs/selects/chips,
- pagination uses project/PrimeNG paginator pattern if available,
- no local custom paginator unless justified by UI-CORE-14.

**Dependencies/blockers:**
- missing pagination in service -> report service dependency,
- missing CP lock summary -> show only available CP and report gap.

**Acceptance criteria:**
- filters are functional or clearly omitted,
- summary values are not hardcoded,
- pagination shows current range/page,
- no filter implies unavailable backend behavior,
- build passes.

**Verification/smoke:**
- filter change smoke,
- pagination smoke,
- empty result smoke,
- build/tsc.

**Required Codex report:**
- filters source:
- CP/lock source:
- pagination source:
- filters omitted intentionally:

## UI-TRADE-3 / formerly UI-32 — Auction actions through canonical RPC/domain paths

**Goal:**  
Podpiąć/wyznaczyć granicę dla Auction House actions przez canonical domain/RPC paths.

**Scope:**
- bid action,
- buy now action,
- watch action only if supported,
- disabled/blocked states,
- confirmation where needed,
- success/error feedback,
- refresh listing/CP locks after action,
- stale guard if active hero/server changes.

**Out of scope:**
- direct table writes,
- new auction RPCs unless task explicitly includes backend,
- create listing flow,
- anti-abuse admin review.

**Data/source rules:**
- use existing auction mutation service/RPC,
- CP locks/refunds reflected from backend read model,
- no direct `items`, `player_auction_*`, `character_point_*` mutations,
- active hero/server context required.

**UI/SCSS rules:**
- shared buttons/confirm/toast/messages,
- error states not muted,
- no local dialog CSS.

**Dependencies/blockers:**
- if action RPC missing, report blocker and leave disabled/pending,
- if watch unsupported, omit.

**Acceptance criteria:**
- actions call canonical paths,
- invalid/blocked actions disabled or show backend error cleanly,
- state refreshes after success,
- stale responses ignored if context changed,
- build passes.

**Verification/smoke:**
- bid smoke if backend/test data available,
- buy now smoke if available,
- blocked insufficient CP smoke,
- build/tsc.

**Required Codex report:**
- RPC/service used:
- locks/refunds source:
- stale guard:
- unsupported actions:

## UI-TRADE-4 / formerly UI-33 — Direct Trade offer builder

**Goal:**  
Zbudować Direct Trade offer builder, w którym creator wybiera wyłącznie własne itemy i własne Character Points. Creator nie może żądać konkretnych itemów/CP od targeta.

**Scope:**
- route/page target: Direct Trade route or Trade route tab,
- target hero search/select,
- creator item selection 0–5,
- creator CP amount,
- offer note/message,
- creator side preview,
- target response placeholder,
- item popover on selected items,
- rules/helper panel explaining creator side vs target response,
- validation: item count, CP amount, target required.

**Out of scope:**
- target inventory browsing,
- requested item/CP UI,
- CP-only-for-CP-only explanation in main UI unless backend error requires it,
- auction UI,
- direct writes.

**Data/source rules:**
- target hero search from server-scoped hero search/read service,
- creator items from active hero inventory with eligible statuses,
- creator CP from active hero/CP read model,
- create action through canonical direct trade RPC/service,
- no direct write to trade/item/CP tables.

**UI/SCSS rules:**
- use shared item row/popover,
- use vendor form inputs/selects,
- target response panel visibly empty until target answers,
- no local copied prototype CSS.

**Dependencies/blockers:**
- missing hero search -> report dependency,
- missing direct trade create service/RPC -> report blocker,
- missing item eligibility data -> show safe disabled selection and report gap.

**Acceptance criteria:**
- no requested item/CP UI exists,
- target response placeholder is clear,
- creator can select up to five own eligible items,
- CP validation prevents overspend,
- create offer uses canonical workflow,
- build passes.

**Verification/smoke:**
- route smoke,
- target select smoke,
- item selection count smoke,
- CP overspend smoke,
- create smoke if backend data available,
- build/tsc.

**Required Codex report:**
- target search source:
- item eligibility source:
- CP source:
- create RPC/service:
- local SCSS added:

## UI-TRADE-5 / formerly UI-34 — Direct Trade pending offers with pagination

**Goal:**  
Pokazać pending direct trade offers jako paged list, maksymalnie pięć widocznych na panel/stronę.

**Scope:**
- pending offers list,
- total count,
- page controls,
- statuses: pending target, pending creator, incoming, expires soon, completed/rejected if included by filter,
- selected offer detail summary,
- incoming empty offer state does not block market slot,
- action entry points where supported: respond, review, cancel own offer if backend supports it.

**Out of scope:**
- full response builder if handled by UI-TRADE-8,
- fake cancel if no backend action,
- auction listings.

**Data/source rules:**
- offers from direct trade read model/service,
- market slot blocking from backend/read model if available,
- incoming empty offers must not be counted as blocking creator’s slot unless backend says otherwise,
- no local status inference that conflicts with backend.

**UI/SCSS rules:**
- use shared list/pagination/status patterns,
- pagination should fit pending panel width,
- status labels as badges/pills, not muted text.

**Dependencies/blockers:**
- missing pagination/read model -> report dependency,
- missing slot impact info -> report limitation.

**Acceptance criteria:**
- five visible offers per page,
- total pending count visible,
- empty incoming offer does not visually block slot,
- statuses clear,
- build passes.

**Verification/smoke:**
- pagination smoke,
- selected offer smoke,
- empty incoming offer smoke if data available,
- build/tsc.

**Required Codex report:**
- pending offers source:
- pagination source:
- slot impact source:
- local SCSS added:

## UI-TRADE-6 / formerly UI-35 — Trade market slot summary

**Goal:**  
Pokazać market slot budget i CP lock context w sposób zrozumiały dla gracza.

**Scope:**
- available CP,
- locked CP,
- market slots,
- remaining slots,
- helper/tooltip explaining that direct offers, active auction listings and active winning bids share slot budget for now,
- slot impact in Direct Trade and Auction House screens.

**Out of scope:**
- building/Trade Routes design changes,
- changing slot calculation,
- admin config of slots,
- fake slot numbers.

**Data/source rules:**
- slot limit from trade rules/building/runtime read model where available,
- CP locks from CP lock read model,
- if slot source missing, report dependency and avoid hardcoded production values.

**UI/SCSS rules:**
- summary values important, not muted,
- use shared summary/card/chip patterns,
- helper copy can be muted/secondary but must be readable.

**Dependencies/blockers:**
- missing slot read model -> dependency,
- missing CP lock summary -> partial summary and report gap.

**Acceptance criteria:**
- summary visible on trade screens,
- no confusing technical copy in main UI,
- values sourced or dependency reported,
- build passes.

**Verification/smoke:**
- visual smoke,
- lock/slot values smoke if data available,
- build/tsc.

**Required Codex report:**
- market slot source:
- CP lock source:
- values hardcoded yes/no:
- local SCSS added:

## UI-TRADE-7 / formerly UI-36 — Direct Trade create offer RPC workflow

**Goal:**  
Podpiąć Direct Trade create offer do canonical RPC/service z walidacją, feedbackiem i stale guards.

**Scope:**
- validate target, items 0–5, CP amount,
- call direct trade create RPC/service,
- show success toast and refresh offers/locks/items,
- show inline/form errors for validation/RPC errors,
- stale guard for active hero/server/target changes.

**Out of scope:**
- target response workflow,
- auction create listing,
- direct table writes,
- backend RPC creation unless task explicitly includes backend.

**Data/source rules:**
- canonical direct trade RPC/service only,
- item locks/CP locks backend-owned,
- no direct writes to `items`, trade tables, CP tables,
- refresh active hero/items/offers after success.

**UI/SCSS rules:**
- vendor form messages/toasts,
- no local loading/error CSS if shared pattern exists,
- important RPC errors not muted.

**Dependencies/blockers:**
- missing create RPC/service -> blocker,
- missing lock refresh read model -> report limitation.

**Acceptance criteria:**
- invalid drafts cannot submit,
- successful create locks creator assets via backend,
- stale response guarded,
- UI refreshes after success,
- build passes.

**Verification/smoke:**
- validation smoke,
- create offer smoke if data available,
- failure smoke for insufficient CP/ineligible item if available,
- build/tsc.

**Required Codex report:**
- create RPC/service:
- validation rules:
- refresh paths:
- stale guard:

## UI-TRADE-8 / formerly UI-37 — Direct Trade target response UI

**Goal:**  
Zaprojektować/zaimplementować target-side response UI, gdzie target widzi creator side i wybiera własne itemy/CP jako odpowiedź.

**Scope:**
- show creator committed side from offer snapshot/read model,
- target selects own eligible items 0–5,
- target CP amount,
- accept/respond/reject actions where backend supports them,
- target response preview,
- item popovers,
- validation.

**Out of scope:**
- target seeing creator private inventory beyond offer,
- modifying creator side,
- auction UI,
- direct table writes.

**Data/source rules:**
- creator side from direct trade offer snapshot/read model,
- target items from active hero eligible inventory,
- response through canonical RPC/service,
- no access to other hero inventory except committed offer items.

**UI/SCSS rules:**
- two-side offer layout reusable with builder,
- item popovers shared,
- response statuses as badges/pills.

**Dependencies/blockers:**
- missing response RPC/service -> blocker,
- missing offer snapshot read model -> dependency.

**Acceptance criteria:**
- target can understand creator side,
- target cannot edit creator side,
- response uses canonical path,
- no privacy leak,
- build passes.

**Verification/smoke:**
- open incoming offer smoke,
- response validation smoke,
- accept/reject smoke if backend exists,
- build/tsc.

**Required Codex report:**
- offer snapshot source:
- target item source:
- response RPC/service:
- privacy boundaries:

## UI-TRADE-9 / formerly UI-38 — Trade item display and popover integration

**Goal:**  
Upewnić się, że każdy item w Auction House i Direct Trade korzysta ze shared item display/popover.

**Scope:**
- Auction listing item,
- Direct Trade selected/offered item,
- pending offer item summary,
- report/trade transaction item if present,
- requirements/equippable status,
- drachma value in popover or item row as appropriate.

**Out of scope:**
- CP item valuation,
- local tooltip CSS,
- item generation changes.

**Data/source rules:**
- item display from item read model/snapshot,
- historical transaction items use snapshots where available,
- no live recompute if snapshot exists,
- no private data leakage.

**UI/SCSS rules:**
- UI-CORE-6 shared item popover,
- status/requirements badges,
- no duplicate per-screen item styling.

**Dependencies/blockers:**
- missing shared popover -> dependency,
- missing snapshot data -> report gap and safe fallback.

**Acceptance criteria:**
- item hover/focus detail consistent across trade screens,
- requirements, bonuses and drachma value visible,
- no CP inherent value,
- build passes.

**Verification/smoke:**
- item popover smoke in auction and direct trade,
- not-equippable item smoke if data exists,
- build/tsc.

**Required Codex report:**
- item popover reused:
- item data/snapshot source:
- local CSS avoided:
- missing data fields:

---

# 20. UI-PVP — PvP target selection and future combat boundary

Cel: PvP target selection przez Vicinity/Ranking, z jasną granicą względem właściwego combat screen. UI-PVP target selection nie może zawierać Walking Dead, combat preview, result preview ani combat log. Dostępność akcji musi pochodzić z backend/read modelu.

## UI-PVP task index

- UI-PVP-1 / formerly UI-39 — PvP Vicinity target selection screen
- UI-PVP-2 / formerly UI-40 — Selected target side panel
- UI-PVP-3 / formerly UI-41 — Vicinity pagination and search
- UI-PVP-4 / formerly UI-42 — PvP action start boundaries
- UI-PVP-5 / formerly UI-43 — PvP Ranking entry point
- UI-PVP-6 / formerly UI-44 — PvP combat screen boundary note

## UI-PVP-1 / formerly UI-39 — PvP Vicinity target selection screen

**Goal:**  
Zbudować PvP target selection screen oparty o Vicinity, gdzie gracz wybiera cel ataku/szpiegowania/oblężenia z listy posiadłości w okolicy.

**Scope:**
- route/page target: existing PvP route/page if present,
- top tabs/entry points: Vicinity and Ranking,
- self hero/estate address visible,
- list/table of nearby estates,
- fields: address, hero name, level/rank if available, attack travel time, spy travel time, action availability,
- row states: self, empty plot, protected, guild member, attackable, siege-only/spy-only,
- compact action icons/buttons: Spy, Attack, Lay siege where available,
- selected target side panel summary,
- pagination if many nearby estates.

**Out of scope:**
- Walking Dead timing,
- combat preview,
- result preview,
- combat log,
- spy result detail,
- siege setup form,
- ranking full implementation unless part of separate task.

**Data/source rules:**
- target list from backend/read model for vicinity/estate list,
- eligibility and action availability from backend/read model, not frontend guessing,
- attack travel time and spy travel time from backend/read model,
- guild membership/protection/range rules from backend/read model,
- no direct writes to PvP/combat/report tables,
- do not assume `hero.id === auth.uid()`.

**UI/SCSS rules:**
- use shared table/list/pagination patterns per UI-CORE-14,
- action icons should use custom icon registry where available,
- disabled/protected/guild states use badges/status pills, not opacity only,
- no local combat-specific CSS on target selection screen.

**Dependencies/blockers:**
- missing vicinity read model -> dependency/blocker,
- missing eligibility flags -> do not infer; report backend dependency,
- missing PvP action RPCs -> actions disabled/pending and reported.

**Acceptance criteria:**
- Vicinity and Ranking controls fit in one line where desktop space allows,
- own estate row clearly marked,
- empty plots are visible but not attackable,
- protected target shows Spy/Siege where allowed plus Protected state, no overflowing button text,
- guild member shows Spy + Guild, no Attack/Siege,
- target selection does not show combat UI,
- build passes.

**Verification/smoke:**
- route smoke,
- visual smoke for self, empty, protected, guild, attackable rows,
- pagination smoke if data supports it,
- build/tsc.

**Required Codex report:**
- target/vicinity data source:
- eligibility source:
- actions implemented/omitted:
- checked but not reused:
- local SCSS added:

## UI-PVP-2 / formerly UI-40 — Selected target side panel

**Goal:**  
Dodać compact selected target side panel pokazujący najważniejsze dane i dostępne akcje dla wybranego celu.

**Scope:**
- target hero name,
- address,
- attack travel time,
- spy travel time,
- siege available yes/no,
- protection/guild/range state if relevant,
- action buttons/icons: Start attack, Spy, Lay siege when available,
- short “what happens next” helper copy.

**Out of scope:**
- Clear button,
- combat log/preview,
- detailed enemy equipment,
- spy result details,
- siege setup options.

**Data/source rules:**
- selected target state from current row/read model,
- action availability from backend flags,
- do not reveal private defender equipment,
- if data stale after refresh, selected target should update or clear safely.

**UI/SCSS rules:**
- use shared detail side panel/card patterns,
- buttons must fit; prefer icon actions if text buttons overflow,
- no redundant distance/district if address already carries location context,
- statuses as badges/status pills.

**Dependencies/blockers:**
- missing selected target read model fields -> partial display and report dependency,
- missing action workflow -> disabled action with dependency report.

**Acceptance criteria:**
- target, address, attack travel time, spy travel time and siege availability visible,
- actions fit and match row eligibility,
- no Clear button,
- no defender private data leak,
- build passes.

**Verification/smoke:**
- select row smoke,
- protected/guild row selected smoke,
- refresh/stale note if not testable,
- build/tsc.

**Required Codex report:**
- selected target data source:
- action availability source:
- private data avoided:
- local SCSS added:

## UI-PVP-3 / formerly UI-41 — Vicinity pagination and search

**Goal:**  
Dodać pagination/search/filtering dla Vicinity target list bez tworzenia fake sortowania przeciwników.

**Scope:**
- search by hero/address if backend/read model supports it,
- pagination with current range, e.g. showing 1–20,
- optional “attackable only” filter if supported,
- ranking tab remains separate entry point,
- stable selected target behavior across pages.

**Out of scope:**
- arbitrary strength sorting,
- frontend-calculated match range,
- enemy recommendations,
- full ranking UI.

**Data/source rules:**
- pagination and search should use backend/read model where available,
- if only client-side list exists, do not imply server-side search,
- availability filters only if backend supports them,
- no frontend guessing attack range/match range.

**UI/SCSS rules:**
- use PrimeNG paginator/global pagination pattern,
- search input through vendor input wrapper,
- no local custom paginator unless justified by UI-CORE-14.

**Dependencies/blockers:**
- missing server-side pagination/search -> report service dependency,
- missing filter support -> omit filter or mark disabled per convention.

**Acceptance criteria:**
- page controls visible and fit table/list width,
- search/filter does not imply unsupported backend behavior,
- selected target updates safely when page changes,
- build passes.

**Verification/smoke:**
- pagination smoke,
- search smoke if backend supports it,
- selected target page-change smoke,
- build/tsc.

**Required Codex report:**
- pagination source:
- search/filter support:
- paginator pattern reused:
- local SCSS added:

## UI-PVP-4 / formerly UI-42 — PvP action start boundaries

**Goal:**  
Ustalić i/lub podpiąć action start boundaries dla Attack, Spy i Lay siege bez implementowania samego combat/spy/siege result screen.

**Scope:**
- action handlers for available row/selected target actions,
- pre-action confirmation if needed,
- call canonical PvP/spy/siege start RPC/service where available,
- show travel timer/state if backend returns one and UI pattern exists,
- success/error feedback,
- refresh action availability after start.

**Out of scope:**
- combat screen,
- Walking Dead,
- spy result details,
- siege configuration details,
- direct writes to combat/pvp/report tables.

**Data/source rules:**
- use canonical backend RPC/service for each action,
- frontend is not authority for eligibility,
- backend error wins and must be shown cleanly,
- no direct persistent mutations,
- active hero/server context required.

**UI/SCSS rules:**
- confirmation/dialog/toast through vendor wrappers,
- action-needed/error text not muted,
- no local timer styling unless global pattern missing and justified.

**Dependencies/blockers:**
- missing attack/spy/siege RPC -> leave action disabled/pending and report blocker,
- missing travel timer read model -> show success and report persistent state dependency.

**Acceptance criteria:**
- unavailable actions cannot start,
- available actions call canonical path if implemented,
- errors/blocked states clear,
- target selection remains separate from combat,
- build passes.

**Verification/smoke:**
- action click smoke if backend available,
- blocked action smoke,
- success feedback smoke,
- build/tsc.

**Required Codex report:**
- action RPCs/services used:
- backend blockers:
- refresh paths:
- local SCSS added:

## UI-PVP-5 / formerly UI-43 — PvP Ranking entry point

**Goal:**  
Dodać Ranking jako drugi target source / entry point obok Vicinity, bez pełnego projektowania rankingu, jeśli nie jest jeszcze gotowy.

**Scope:**
- Ranking tab/route entry,
- placeholder/disabled state only if route/data missing and project convention allows it,
- if ranking read model exists: list entries with same action availability rules as Vicinity,
- clear separation between ranking list and vicinity list.

**Out of scope:**
- full ranking algorithm,
- leaderboards polish,
- opponent sorting hacks,
- duplicate eligibility logic.

**Data/source rules:**
- ranking list from backend/read model,
- action eligibility still from backend flags,
- no frontend match range guessing.

**UI/SCSS rules:**
- reuse target list/action patterns from Vicinity,
- no separate local ranking card system,
- pending/empty state uses shared empty state pattern.

**Dependencies/blockers:**
- if ranking read model missing, report dependency and keep entry pending/omitted per project convention.

**Acceptance criteria:**
- ranking entry exists only if useful and not misleading,
- no fake working ranking,
- action rules consistent with Vicinity,
- build passes if implemented.

**Verification/smoke:**
- tab/route smoke,
- pending state smoke if no data,
- build/tsc.

**Required Codex report:**
- ranking source:
- omitted/pending reason:
- reused target patterns:
- local SCSS added:

## UI-PVP-6 / formerly UI-44 — PvP combat screen boundary note

**Goal:**  
Utrwalić granicę: target selection kończy się na rozpoczęciu akcji, a właściwy combat screen jest osobnym widokiem/taskiem.

**Scope:**
- add code comments/docs/task notes where useful,
- ensure PvP target screen does not include combat timing/log/result,
- route/action handoff points to future combat/travel/report flow,
- align with UI-COMBAT future tasks.

**Out of scope:**
- combat screen implementation,
- combat engine/RPC changes,
- reports generation,
- Walking Dead.

**Data/source rules:**
- combat result/report data belongs to combat/report read models,
- target selection should not read defender private equipment beyond allowed eligibility/display fields.

**UI/SCSS rules:**
- no combat-specific widgets on target selection,
- helper copy should be concise and player-facing.

**Dependencies/blockers:**
- if current UI mixes combat preview into target selection, report cleanup scope.

**Acceptance criteria:**
- boundary documented,
- target selection UI remains clean,
- future combat screen has clear next task,
- build passes if code changed.

**Verification/smoke:**
- visual scan/no combat widgets,
- route smoke if code changed.

**Required Codex report:**
- combat-related elements removed/avoided:
- future dependencies:
- not added intentionally:

---

# 21. UI-ADMIN — Admin IA, governance and admin workspaces

Cel: admin shell, global/admin/operator distinctions, Admin Overview, Admin Area Map, Server Management, Launch New Server and future concrete admin modules. Admin UI ma być uporządkowane według intencji pracy, nie raw table names. Admin overview jest orientation hub, nie fake dashboard.

## UI-ADMIN task index

- UI-ADMIN-1 / formerly UI-51 — Admin Overview shell and global admin variant
- UI-ADMIN-2 / formerly UI-52 — Admin scope strip and operator/server-scoped variant boundary
- UI-ADMIN-3 / formerly UI-53 — Admin sidebar information architecture
- UI-ADMIN-4 / formerly UI-54 — Admin Area Map and Coverage Checklist
- UI-ADMIN-5 / formerly UI-55 — Admin Context / Explainability panel
- UI-ADMIN-6 / formerly UI-56 — Server Management admin entry and staff assignment boundary
- UI-ADMIN-7 / formerly UI-57 — Launch New Server admin entry
- UI-ADMIN-8 / formerly UI-58 — Admin Overview status cards
- UI-ADMIN-9 — Concrete admin module shell pattern
- UI-ADMIN-10 — Admin route coverage matrix

## UI-ADMIN-1 / formerly UI-51 — Admin Overview shell and global admin variant

**Goal:**  
Zbudować Admin Overview jako global admin orientation hub zgodny z zaakceptowanym Admin Overview V7: czysty, lekki, bez fake live dashboardu i bez Recent Staff Activity.

**Scope:**
- route/page target: existing `/admin` overview route if present,
- admin shell/branding with `M` mark,
- global admin topbar:
  - edit level,
  - server focus,
  - role/scope chips,
  - search/audit entry if route exists,
- sidebar groups:
  - Overview,
  - Priority Operations,
  - Content & Balance,
  - World & Economy,
  - Gameplay Tools / Sandbox,
- page header and summary card,
- global admin scope strip,
- cautious status cards,
- Admin Area Map,
- Coverage Checklist,
- Context / Explainability panel.

**Out of scope:**
- concrete admin module implementation,
- full audit view,
- fake recent staff activity,
- fake command board/live queue,
- DB/admin navigation registry design,
- staff assignment form,
- server launch workflow.

**Data/source rules:**
- current user global role/access from canonical access/read model,
- server focus list from existing server/admin server switcher/read model where available,
- counts/cards must come from real read models or be omitted/placeholder per project convention,
- no hardcoded production counts,
- do not infer global admin from selected server role.

**UI/SCSS rules:**
- use admin shell/global surface patterns from UI-CORE,
- no local copied Admin Overview canvas CSS,
- scope strip only global admin,
- technical keys are secondary metadata,
- no `muted-text` for role/access/status values.

**Dependencies/blockers:**
- missing global admin route/access resolver -> dependency,
- missing status card read models -> omit/placeholder and report,
- missing server focus service -> show current context only and report.

**Acceptance criteria:**
- Admin Overview renders as global admin variant,
- user role shows Admin, not Operator,
- Server focus can be All servers or one server where supported,
- no fake Recent Staff Activity,
- Admin Area Map and Coverage Checklist present,
- `M` mark preserved,
- build passes.

**Verification/smoke:**
- admin route smoke,
- global admin visual smoke,
- non-admin access smoke if route guard exists,
- build/tsc.

**Required Codex report:**
- reused admin shell/access services:
- server focus source:
- status card sources:
- checked but not reused:
- local SCSS added:
- not added intentionally:

## UI-ADMIN-2 / formerly UI-52 — Admin scope strip and operator/server-scoped variant boundary

**Goal:**  
Wprowadzić jasną granicę UI między global adminem a server-scoped operatorem. Scope strip jest widoczny tylko dla global admina.

**Scope:**
- global admin scope strip:
  - Global Admin,
  - Selected Server,
  - Launch New Server,
  - Sandbox / Test,
- operator variant:
  - no global scope strip,
  - selected server context,
  - Role: Operator,
  - Edit level: Selected server,
- clear labeling of role vs server focus vs edit level.

**Out of scope:**
- backend role model redesign,
- full operator dashboard,
- staff assignment mutation,
- RLS/RPC changes.

**Data/source rules:**
- global admin role and server staff role are separate,
- do not infer admin from server staff assignment,
- operator can only see assigned server scope according to backend/access model,
- CSS visibility is not access control.

**UI/SCSS rules:**
- scope strip uses shared admin pattern,
- hidden controls must also be blocked by route/access logic,
- labels must not conflate Admin with Operator.

**Dependencies/blockers:**
- if current access model cannot distinguish global admin vs server operator, report blocker,
- if operator selected server resolution missing, report dependency.

**Acceptance criteria:**
- scope strip visible only for global admin,
- operator cannot switch to global/launch modes,
- global admin can focus All servers or one server,
- labels clear,
- build passes.

**Verification/smoke:**
- global admin smoke,
- operator/scoped user smoke if test user available,
- access/visibility smoke,
- build/tsc.

**Required Codex report:**
- access model source:
- role/scope states tested:
- controls hidden/disabled:
- local SCSS added:

## UI-ADMIN-3 / formerly UI-53 — Admin sidebar information architecture

**Goal:**  
Ułożyć admin sidebar według zaakceptowanej intencji pracy, bez dublowania raw table names i bez mieszania global/server/sandbox narzędzi.

**Accepted groups and entries:**
- Overview:
  - Overview
- Priority Operations:
  - Config Governance
  - Anti-abuse
- Content & Balance:
  - Exploration
  - Rewards & Loot
  - Combat Foundation
  - Formulas
- World & Economy:
  - Estate & Buildings
  - Economy & Trade
  - Server Management
  - Launch New Server
- Gameplay Tools / Sandbox:
  - Sandbox Helpers

**Scope:**
- update/admin navigation config if present,
- keep existing reachable routes,
- hide/disable missing routes by project convention,
- indicate route groups/section labels,
- ensure Config Governance and Anti-abuse are visually prioritized.

**Out of scope:**
- concrete module screens,
- DB-backed admin nav registry,
- route guard redesign unless needed for visibility bug,
- removing existing routes without replacement.

**Data/source rules:**
- route visibility from admin/global/server role/access model,
- server-scoped routes must honor selected server context,
- sandbox tools visible only to allowed roles/server kinds.

**UI/SCSS rules:**
- use shared admin sidebar/nav patterns,
- active state matches style contract,
- raw technical keys are not primary labels,
- icon placeholders only where registry key missing.

**Dependencies/blockers:**
- if route does not exist, mark pending/omit per convention,
- if coverage unknown, add to UI-ADMIN-10 coverage matrix.

**Acceptance criteria:**
- sidebar matches accepted grouping,
- Config Governance and Anti-abuse prioritized,
- Trials/Encounters grouped under Exploration,
- Reward profiles and item generation grouped under Rewards & Loot,
- Combat Opponents under Combat Foundation,
- Server Management and Launch New Server separate,
- build passes.

**Verification/smoke:**
- route smoke for existing admin entries,
- active nav visual smoke,
- non-authorized visibility smoke if possible,
- build/tsc.

**Required Codex report:**
- navigation config reused:
- routes checked:
- missing routes:
- access visibility source:
- local SCSS added:

## UI-ADMIN-4 / formerly UI-54 — Admin Area Map and Coverage Checklist

**Goal:**  
Zastąpić Workspaces/Command Board uczciwym orientation blockiem: Admin Area Map + Coverage Checklist.

**Scope:**
- central Admin Area Map with major admin areas:
  - Config Governance,
  - Anti-abuse,
  - Exploration,
  - Rewards & Loot,
  - Server Management,
- subarea chips under each area,
- Coverage Checklist:
  - Global config — covered,
  - Server config — covered,
  - Launch new server — slot,
  - Staff assignment — covered,
  - Sandbox tools — separate,
- note that overview is intentionally light,
- selected area can feed Context / Explainability panel.

**Out of scope:**
- fake live queue,
- recent staff activity,
- command board,
- full route coverage audit implementation,
- DB-backed admin area registry design.

**Data/source rules:**
- content may start as typed local registry/static config,
- do not fetch fake live data to fill overview,
- if counts/statuses appear, they must come from real source.

**UI/SCSS rules:**
- use admin area map/global card/chip patterns,
- not a second menu pretending to be dashboard,
- no local copied card CSS.

**Dependencies/blockers:**
- if selected-area state should drive explainability, define local state or registry; no DB schema design in this task.

**Acceptance criteria:**
- Workspaces/Command Board not present,
- Admin Area Map visible,
- Coverage Checklist visible and secondary,
- no Recent Staff Activity,
- overview feels like orientation hub,
- build passes.

**Verification/smoke:**
- route visual smoke,
- selected area/explainability smoke if interactive,
- build/tsc.

**Required Codex report:**
- area registry/source:
- live data intentionally not used:
- shared patterns reused:
- local SCSS added:

## UI-ADMIN-5 / formerly UI-55 — Admin Context / Explainability panel

**Goal:**  
Dodać reusable admin Context / Explainability panel pokazujący label/description/helper/admin_description dla zaznaczonego obszaru lub konfiguracji.

**Scope:**
- right panel with:
  - Label,
  - Description,
  - Helper text,
  - Admin description,
  - Technical key,
  - Why this matters,
- selected Admin Area Map area as initial source,
- future compatibility with config definitions and dictionary metadata,
- safe missing metadata state.

**Out of scope:**
- DB metadata table design,
- full config definition editor,
- raw JSON payload viewer,
- staff-only private data exposure.

**Data/source rules:**
- prefer DB/read model metadata where available: label, description, helper_text, admin_description, gameplay impact/warning,
- fallback to typed local registry if no DB metadata,
- raw key secondary only,
- missing important metadata should be visible as content debt where appropriate.

**UI/SCSS rules:**
- use shared detail side panel/note/code chip patterns,
- important descriptions readable, not over-muted,
- technical key as small secondary chip.

**Dependencies/blockers:**
- if metadata read model exists but not wired, report wiring task,
- if metadata missing, record key/area gap.

**Acceptance criteria:**
- context panel renders selected area metadata,
- human-readable text first,
- technical key secondary,
- no private data leak,
- build passes.

**Verification/smoke:**
- selected area smoke,
- missing metadata smoke,
- build/tsc.

**Required Codex report:**
- metadata source:
- fallback registry used:
- missing metadata keys:
- local SCSS added:

## UI-ADMIN-6 / formerly UI-56 — Server Management admin entry and staff assignment boundary

**Goal:**  
Ująć Server Management jako pełnoprawny admin area z jasną granicą między global adminem i scoped operatorem.

**Scope:**
- sidebar entry: Server Management,
- Admin Area Map coverage:
  - server list,
  - server settings,
  - operator,
  - moderators,
  - staff scopes,
- global admin capabilities described/represented,
- scoped operator capabilities described/represented,
- no fake staff assignment form unless real workflow exists.

**Out of scope:**
- full staff assignment form,
- server launch flow,
- DB role model changes,
- bypassing backend/RPC permission checks,
- direct write to staff assignment tables.

**Data/source rules:**
- global admin can manage server list/operator/moderators if backend allows,
- operator may manage moderators only within assigned server and backend rules,
- staff assignment must use canonical audited RPC/service where available,
- reason requirement must be preserved,
- staff-disqualifying history warnings respected.

**UI/SCSS rules:**
- labels clearly distinguish Admin, Operator, Moderator, Tester,
- access/status values not muted,
- use admin cards/forms/vendor wrappers.

**Dependencies/blockers:**
- missing server staff read model/RPC -> dependency,
- missing user search for staff assignment -> dependency,
- missing disqualifying history warning source -> dependency.

**Acceptance criteria:**
- Server Management appears in sidebar and Area Map,
- global admin/operator capabilities not conflated,
- operator assignment and multiple moderator assignment represented as future/covered subareas,
- no fake staff mutation,
- build passes.

**Verification/smoke:**
- navigation smoke,
- visibility smoke for admin/operator if available,
- no mutation smoke unless workflow exists,
- build/tsc.

**Required Codex report:**
- server/staff sources:
- RPCs checked:
- access boundaries:
- not added intentionally:

## UI-ADMIN-7 / formerly UI-57 — Launch New Server admin entry

**Goal:**  
Dodać Launch New Server jako osobny admin area od live Server Management i live server overrides.

**Scope:**
- sidebar entry: Launch New Server,
- scope strip includes Launch New Server for global admin,
- Area Map/Coverage Checklist includes launch templates, snapshots, pre-live checks,
- topbar/edit level can represent Launch New Server mode if supported,
- clear pre-live setup labeling.

**Out of scope:**
- launch flow forms,
- creating server records,
- DB schema for launch templates,
- config snapshot application,
- direct writes to server/config tables.

**Data/source rules:**
- launch config should eventually use config governance/server_launch scope,
- if launch read models/RPCs missing, route entry can be pending/disabled per convention,
- pre-live checks backend/read-model driven when implemented.

**UI/SCSS rules:**
- launch entry distinct from Server Management,
- no fake server creation button if backend missing,
- use admin status/cards/patterns.

**Dependencies/blockers:**
- missing launch route/workflow -> dependency,
- missing launch snapshot source -> dependency.

**Acceptance criteria:**
- Launch New Server is separate from Server Management,
- launch mode not available to scoped operator,
- overview does not imply implemented launch flow if missing,
- build passes.

**Verification/smoke:**
- nav/entry smoke,
- disabled/pending state smoke if route missing,
- access smoke if possible,
- build/tsc.

**Required Codex report:**
- launch route/source checked:
- scope/access behavior:
- pending/disabled reason:
- local SCSS added:

## UI-ADMIN-8 / formerly UI-58 — Admin Overview status cards

**Goal:**  
Dodać ostrożne, niewymyślone status cards do Admin Overview.

**Accepted cards:**
- Pending Global Changes,
- Server Staff Gaps,
- Open Anti-abuse Cases,
- Sandbox Tools Ready.

**Scope:**
- render four status cards when data/source exists,
- cards adapt by role/scope:
  - global admin may aggregate across server focus,
  - operator sees server-scoped cards only,
- each card links or routes to relevant area if route exists,
- safe empty/loading states.

**Out of scope:**
- Balance Warnings without real engine/read model,
- fake staff gaps,
- Recent Staff Activity,
- fake command queue,
- audit list on overview.

**Data/source rules:**
- Pending Global Changes from config change set read model,
- Server Staff Gaps from server/staff coverage read model if exists,
- Open Anti-abuse Cases from anti-abuse read model, server-scoped where appropriate,
- Sandbox Tools Ready from access/server kind/tool availability if exists,
- no hardcoded production counts.

**UI/SCSS rules:**
- use summary/stat card patterns,
- counts important, not muted,
- cards should not visually overpower orientation map.

**Dependencies/blockers:**
- missing source -> omit/placeholder and report dependency,
- no balance warning engine -> do not add Balance Warnings.

**Acceptance criteria:**
- accepted cards appear only with real source or safe placeholder convention,
- no Balance Warnings card,
- operator/admin visibility differs correctly,
- no Recent Staff Activity,
- build passes.

**Verification/smoke:**
- card render smoke,
- missing source smoke,
- role/scope smoke if possible,
- build/tsc.

**Required Codex report:**
- source per card:
- omitted cards:
- hardcoded counts yes/no:
- local SCSS added:

## UI-ADMIN-9 — Concrete admin module shell pattern

**Goal:**  
Zdefiniować reusable shell/pattern dla konkretnych admin modułów takich jak Config Governance, Exploration, Rewards, Combat Foundation, Server Management.

**Scope:**
- page header with module label/context,
- tab/section layout,
- list/detail/editor split where appropriate,
- reason-required action block,
- metadata/explainability panel,
- read-only vs edit state,
- scoped server/global context chip,
- audit/change summary slot.

**Out of scope:**
- implementing every admin module,
- DB metadata design,
- concrete forms for each module,
- global admin overview.

**Data/source rules:**
- module metadata from DB/read model where available,
- reason required for governed mutations,
- direct table writes forbidden,
- global vs server scope must be explicit.

**UI/SCSS rules:**
- use admin global patterns from UI-CORE/UI-ADMIN,
- no per-module card/form CSS duplication,
- PrimeNG tabs/table/forms/vendor wrappers first.

**Dependencies/blockers:**
- if existing admin modules have divergent layout, report migration candidates,
- if module metadata missing, show safe fallback and report content debt.

**Acceptance criteria:**
- reusable module shell pattern documented or implemented,
- supports DB-backed explainability,
- supports reason-required mutations,
- future admin modules have consistent structure,
- build passes if code changed.

**Verification/smoke:**
- apply pattern to one admin module if in scope,
- build/tsc,
- visual smoke for read-only and edit states if implemented.

**Required Codex report:**
- existing admin modules checked:
- pattern reused/added:
- metadata source:
- local SCSS added:

## UI-ADMIN-10 — Admin route coverage matrix

**Goal:**  
Przygotować route/configurator → admin area coverage matrix, żeby sidebar/Admin Area Map pokrywały realne istniejące konfiguratory i admin routes.

**Scope:**
- inventory current admin routes/navigation config,
- inventory known configurators from backlog/docs/current route files,
- map each route to:
  - admin area,
  - global/server/launch/sandbox scope,
  - required role/access,
  - metadata/explainability source,
  - route status: implemented/pending/deprecated,
- identify gaps/duplicates.

**Out of scope:**
- moving routes unless explicitly approved,
- DB admin nav registry design,
- implementing missing pages,
- removing routes without user acceptance.

**Data/source rules:**
- route coverage based on actual repo route config and docs,
- access based on current guards/services/RPC semantics where visible,
- if route source uncertain, mark unknown instead of guessing.

**UI/SCSS rules:**
- not a visual task unless navigation config changes are included,
- if navigation updated, use admin sidebar patterns.

**Dependencies/blockers:**
- repo route files required for accurate matrix,
- if routes incomplete, report limitations.

**Acceptance criteria:**
- matrix exists,
- every known admin route/configurator has a proposed area,
- duplicates/gaps identified,
- Admin sidebar IA can be reviewed against real coverage.

**Verification/smoke:**
- docs-only no build,
- if nav config changed: route smoke/build.

**Required Codex report:**
- routes inventoried:
- unmapped routes:
- deprecated/pending routes:
- recommended moves:

---

## Current Admin workspace prototype direction

The older Admin Overview tasks are retained for source/context, but new admin UX work should follow the current workspace-first prototype direction from `admin-ui-ux-prototype-plan.md` and accepted admin canvases. Admin IA should be grouped by operator work intent, not by the old flat route/dashboard-card model.

Current admin workspace implementation targets:

- `UI-ADMIN-11 — Admin Shell + Hub IA production pass`;
- `UI-ADMIN-12 — Governance & Drafts Landing`;
- `UI-ADMIN-13 — Active Balance Draft Workspace`;
- `UI-ADMIN-14 — Config Registry Workspace`;
- `UI-ADMIN-15 — Formula Library Workspace`;
- `UI-ADMIN-16 — Item Generation Workspace Overview`;
- `UI-ADMIN-17 — Bucket Profiles Tab`;
- `UI-ADMIN-18 — Quality Tiers Tab`;
- `UI-ADMIN-19 — Item Bases / Catalog Tab`;
- `UI-ADMIN-20 — Prefixes / Suffixes Tab`;
- `UI-ADMIN-21 — Bonuses / Requirements Tab`;
- `UI-ADMIN-22 — Preview / Luck Lab admin workspace`;
- `UI-ADMIN-23 — Exploration Settings Workspace`;
- `UI-ADMIN-24 — Moderation & Anti-abuse Workspace`;
- `UI-ADMIN-25 — Reports / Notifications / Audit Workspace`;
- `UI-ADMIN-26 — PvP Readiness & Diagnostics grouped workspace`;
- `UI-ADMIN-27 — Admin route coverage matrix`.

Rules:

- diagnostics/read-only surfaces should remain accessible but de-emphasized;
- PvP read-only pages should be grouped as readiness/diagnostics, not separate top-level dashboard cards;
- Scrapped item recovery belongs under Moderation & Anti-abuse;
- governed balance/config changes should use active balance draft flow when the DB/RPC path exists.

# 22. UI-OPEN — Open questions

- Exact Game Icons mapping.
- Mobile layout strategy for dense tables and admin screens.
- Full PvP combat UX.
- Full Exploration result UX.
- Full Siege setup/result UX.
- Full Spy result UX.
- Public report share page.
- Notification settings page.
- Admin route coverage matrix and possible DB/registry source.
- Full concrete admin modules after overview IA.

---

# Appendix A — Codex UI task template

```md
## UI-AREA-N — Task title

Goal:

Scope:

Out of scope:

Data/source rules:

Required visual anchors:

UI/SCSS rules:

Dependencies/blockers:

Acceptance criteria:

Verification/smoke:

Required Codex report:
- preflight:
- reused:
- checked but not reused:
- missing patterns:
- prototype visual anchors:
- utilities checked/used:
- local SCSS:
- muted-text audit:
- data/read model source:
- stale guards:
- verification:
```

---
