# Monster Hunt - Current TODO

Updated: 2026-05-01

This file lists pending work derived from:
- `docs/project-context.md`
- `docs/database-current.md`
- `docs/current-decisions.md`
- `docs/ui-ux-notes.md`

Order reflects implementation priority, not final business priority.

## Current Codex Backlog Position

- Completed and confirmed: A1 - regenerate/update Supabase database types.
- Current documentation sync applied: A2 - this TODO and `current-state-summary.md` were updated after A1 confirmation.
- Completed and confirmed: B1 - audit old identity assumptions.
- Completed and confirmed: B2 - standardize active server resolver.
- Completed and confirmed: B3 - standardize active hero resolver.
- Completed and confirmed: B4 - migrate stats/resources/progression to active hero id.
- Completed and confirmed: B5 - migrate estate/building/item/combat reads to active hero id.
- Completed and confirmed: C1 - add role/membership read layer.
- Completed and confirmed: C2 - staff server switcher.
- Completed and confirmed: C3 - membership status UI handling.
- Completed and confirmed: D1 - config definitions read model.
- Completed and confirmed: D2 - config values read model.
- Completed and confirmed: D3 - config change-set list/detail.
- Completed and confirmed: D4 - config edit draft flow.
- Completed and confirmed: D5 - config apply/cancel flow.
- Completed and confirmed: D6 - anti-abuse config admin section.
- Completed and confirmed: E1 - formula targets/formulas read layer.
- Completed and confirmed: E2 - formula assignment viewer.
- Completed and confirmed: E3 - local entity formula assignment support.
- Completed and confirmed: E4 - formula runtime integration cleanup.
- Completed and confirmed: F1 - inspect current bonus template usage.
- Completed and confirmed: F2 - design bonus model legacy retirement plan.
- Completed and confirmed: F3 - canonical bonus domain models and mappers.
- Completed and confirmed: F4 - bonus dictionary/admin read service.
- Completed and confirmed: F5 - bonus template write path migration.
- Completed and confirmed: F6 - entity bonus read model and payload helpers.
- Completed and confirmed: F7 - origin bonus read migration.
- Completed and confirmed: F8 - item generation base type model migration.
- Completed and confirmed: F9 - item generation entity bonuses.
- Completed and confirmed: F10 - building entity bonuses.
- Completed and confirmed: F11 - combat/equipment item bonus inputs.
- Completed and confirmed: F12 - legacy bonus usage cleanup audit.
- Completed and confirmed: G1 - audit dictionary read layer.
- Completed and confirmed: G2 - audit log read layer.
- Completed and confirmed: G3 - audit domain operation helper.
- Completed and confirmed: G4 - audit config governance changes.
- Completed and confirmed: G5 - audit anti-abuse decisions.
- Completed and confirmed: G6 - audit gameplay persistent changes, stat allocation RPC slice.
- Completed and confirmed: H1 - anti-abuse dictionary models, satisfied by UX-I8.
- Completed and confirmed: H2 - anti-abuse dictionary loaders.
- Completed and confirmed: H3 - anti-abuse case read models.
- Completed and confirmed: H4 - server-scoped case list service.
- Completed and confirmed: H5 - case detail aggregation service.
- Completed and confirmed: H6 - player relationship declaration form model.
- Completed and confirmed: H7 - player relationship declaration submission.
- Completed and confirmed: H8 - player declaration list/status read-model service slice.
- Completed and confirmed: H9 - staff relationship declaration review service slice.
- Completed and confirmed: H10 - player abuse report form model.
- Completed and confirmed: H11 - player abuse report submission.
- Completed and confirmed: H12 - player abuse report list/status read-model service slice.
- Completed and confirmed: H13 - staff case list page.
- Completed and confirmed: H14 - staff case detail page.
- Completed and confirmed: H15 - case status transition action.
- Completed and confirmed: H16 - case verdict action.
- Completed and confirmed: H17 - sanction domain models.
- Completed and confirmed: H18 - sanction type-driven form model.
- Completed and confirmed: H19 - sanction creation operation.
- Completed and confirmed: H20 - sanction status update operation.
- Completed and confirmed: H21 - CP penalty view/management.
- Completed and confirmed: H22 - repeat offender/history view.
- Completed and confirmed: I1 - add lifecycle fields to item domain models.
- Completed and confirmed: I2 - filter scrapped items from normal inventory.
- Completed and confirmed: I3 - implement safe scrap behavior skeleton.
- Completed and confirmed: I4 - staff item recovery operation.
- Completed and confirmed: J1 - align trade/auction frontend plan with existing DB/RPC contract.
- Completed and confirmed: J2 - direct trade read models and services.
- Completed and confirmed: J3 - direct trade mutation UI through existing RPCs.
- Completed and confirmed: J4 - auction gameplay UI through existing RPCs.
- Completed and confirmed: J5 - trade/auction transaction item snapshot feature integration.
- Completed and confirmed: J6 - trade and auction audit frontend alignment.
- Completed and confirmed: J7 - vendor scrap/sell for drachmas core service alignment.
- Completed and confirmed: K1 - anti-abuse signal generation contract alignment.
- Completed and confirmed: K2 - anti-abuse signal and case read models.
- Completed and confirmed: K3 - trade/auction signal review integration.
- Completed and confirmed: K4 - identity observation / same-IP-device integration boundary.
- Completed and confirmed: K5 - signal grouping and case explainability UI.
- Completed and confirmed: U0-C1 - frontend role usage audit.
- Completed and confirmed: U0-C2 - staff gameplay access audit.
- Completed and confirmed: U0-C6 - staff/moderation navigation boundaries audit.
- Completed and confirmed: U0-C3 - user/staff management UI audit.
- Completed and confirmed: U0-C4 - moderator scope UI spec.
- Completed and confirmed: U0-I1 - central staff access policy model.
- Completed and confirmed: U0-I2 - staff gameplay boundary implementation.
- Completed and confirmed: U0-I3 - admin route guard and sidebar boundary.
- Completed and confirmed: U0-I4 - admin dashboard cards and tag-link filtering.
- Completed and confirmed: U0-I5 - staff management read models and services.
- Completed and confirmed: U0-I6 - staff management UI foundation.
- Completed and confirmed: U0-I7 - moderator scope assignment UI.
- Completed and confirmed: U0-I8 - moderation actions UI foundation.
- Completed and confirmed: U0-I9 - moderation history target picker and full-history modes.
- Completed and confirmed: UX-I1 - shared metadata display helper.
- Completed and confirmed: UX-I2 - config governance explainability implementation.
- Completed and confirmed: UX-I3 - audit log readability pass.
- Completed and confirmed: UX-I4 - formula impact preview calculators.
- Completed and confirmed: UX-I5 - item generation quality impact preview.
- Completed and confirmed: UX-I6 - building impact calculator.
- Completed and confirmed: UX-I7 - building bonus and requirement explainability.
- Completed and confirmed: UX-I7b - DB-driven central requirement editor for Buildings admin.
- Completed and confirmed: UX-I8 - anti-abuse decision explainability pass.
- Current backlog task: wait for user commit, then continue with the next backlog task.
- H17+ planning note: status/verdict/sanction/CP penalty action sections now share a similar workflow-action shell; before adding the next similar audited status-action section, check whether to extract a light shared wrapper/state/helper for error/success/loading/submit card layout and stale-guard handling.
- Reporting rule: future task reports must include a short Shared/reuse check covering reused shared/admin components, checked-but-not-reused options, and any new component justification.
- G6 follow-up planning note: remaining gameplay audit slices are major item operations, trade operations once frontend flows exist, and estate/building irreversible changes.
- Epic F direction: legacy bonus model retirement; new app paths should use dictionaries, semantic bonus_templates, and entity_bonuses.

## Codex Backlog Workflow

- Use one backlog task per Codex prompt unless the user explicitly groups tightly related tasks.
- Codex reads the required project docs before making changes.
- Codex reports the exact changes, verification result, and acceptance-criteria status after the task.
- For UI/manual smoke reports, Codex includes both the clicked UI path and the domain meaning of the action, following `docs/AGENTS.md`.
- The user confirms whether the task works.
- Only after user confirmation, Codex updates `current-state-summary.md`, `current-todo.md`, and any relevant task status/docs.
- Unconfirmed work must stay out of the completed-state summary.
- After confirmation, Codex prepares a commit message and waits for the next task instruction.
- Non-blocking UI/UX findings should be recorded in `docs/ui-ux-notes.md` unless they are promoted to task acceptance criteria.

## Highest Priority Gameplay TODO

### Exploration + trials loop
- Create a real exploration step loop instead of placeholders.
- Implement step outcomes:
  - nothing
  - light combat encounter
  - small resource encounter
  - trial appearance
- Implement progressive anti-dry-streak trial chance.
- Ensure normal encounters do not reset trial progression.

### Trial lifecycle
- Implement trial appearance separately from trial manifestation.
- Implement manifestation chance based on:
  - difficulty
  - relevant stat
  - smaller luck contribution
- Implement trial completion logic after manifestation.
- Add daily trial caps.
- Add premium-based attempt increase without changing quality/luck odds.

### Combat evolution
- Reuse the current Walking Dead duel slice in broader combat contexts:
  - light encounter combat
  - trial combat
  - future PvP combat
- Extend the formula-driven combat layer beyond the current targets:
  - initiative / turn order
  - multi-attack / weapon profiles
  - ranged specifics
- Decide which combat stats are purely derived and which can be modified directly.
- Add reward/death/outcome hooks for encounters and trials.

## Item and Reward TODO

### Difficulty-tier reward model
- Implement easy / medium / hard difficulty loop.
- Gate `Outstanding` item quality to the highest difficulty tier in actual reward generation.
- Preserve medium as the best all-around progression tier for many players.
- Prevent hard from becoming the always-correct farm mode too early.

### Luck integration
- Use luck in opportunity shaping, not guaranteed outcomes.
- Integrate luck into:
  - trial manifestation support
  - item bucket shaping
  - affix / quality variance
  - worst-outcome suppression at very high values
- Keep diminishing returns and opportunity-cost constraints.

### Item gameplay loop
- Connect generated items to exploration/trials.
- Expand item requirement consequences in live gameplay.
- Implement selling / scrapping effects on real item cleanup and economy.

## Buildings / Estates TODO

### Building execution
- Implement real building upgrades instead of preview-only UX.
- Add cost spending, build-time progression, and resulting level changes.
- Define how build timers are stored and resolved.

### Estate progression
- Implement claiming / occupying a new empty estate.
- Enforce relocation consequences:
  - current buildings lost
  - strategic but easy-to-execute UX

### Siege and takeover
- Design staged siege flow:
  - preparation
  - participation
  - resolution
- Implement address swap logic for successful takeover.
- Define how guild support affects siege resolution.

## Social Systems TODO

### Prestige / reputation
- Create schema and runtime rules for prestige / reputation.
- Keep it separate from character level.
- Reward meaningful victories more than farming weak targets.

### Guilds / politics
- Add guild domain model and basic membership logic.
- Later add:
  - support structures
  - coalitions
  - district influence
  - leadership / voting systems

## Economy TODO

### Trade / auctions frontend
- Direct trade and one-item auction player-facing surfaces exist; continue with smoke/data hardening when sandbox data is ready.
- Manual smoke direct trade create/respond/confirm/cancel/reject once sandbox data includes two heroes, active items, a session and a real trade flow.
- Manual smoke gameplay auction listings, bids, buy now, cancellation, and closing once sandbox data includes active items, at least two heroes/users, Character Points and a real auction flow.
- Use existing RPC/domain operations for trade and auction mutations instead of direct table writes.
- Keep trade/auction lifecycle audit DB-owned through canonical RPCs/triggers; do not add Angular `AuditWriter` calls for these flows.
- Keep player-to-player trade based on Character Points.
- Keep drachmas as system/vendor currency/resource unless a later decision changes that.
- Hide or block trade/auction locked items from usable/equippable armory views.

### Trade Routes integration
- Replace `trade_active_offer_limit_fallback` with real Trade Routes/building bonus runtime.
- Decide how Trade Routes level affects active direct offers and other market limits.
- Keep the first Trade Routes integration simple and configurable.

### Character Points economy
- Connect Character Point earning to experience gain paths where appropriate.
- Use `character_point_ledger` for all persistent Character Point balance changes.
- Replace the current attribute-allocation direct balance update with the proper Character Point ledger/RPC flow.
- Keep vendor scrap outside player trade and Character Points; frontend core service uses `vendor_scrap_hero_item(...)`, while full player-facing vendor sell smoke waits for inventory/armory UI.

## Formula / Admin TODO

### Formula UX
- Consider moving function guides and templates to fully data-driven DB-backed configuration if admin ownership of these becomes important.
- Decide whether charting should stay lightweight SVG or be upgraded later.
- Add more domain-specific formula targets as gameplay systems come online.

### Balance coverage
- Continue replacing page-local hardcoded row editors with config-driven patterns where they are repetitive and stable.
- Keep shared non-component definitions in `core`.

## Technical TODO

### Testing
- Add targeted tests for:
  - combat simulator
  - formula variable validation
  - item bucket generation
  - bonus scaling types

### Cleanup
- Keep pushing mapper/helper logic that is not truly domain-object behavior into `core/utils` or equivalent focused utility folders.
- Continue splitting large admin screens into smaller components and facades where it improves clarity without over-engineering.

### Database/documentation sync
- Keep `docs/database-current.md`, `docs/current-decisions.md`, `current-state-summary.md`, and this TODO updated when migrations or confirmed implementation materially change semantics.
- Regenerate/update `src/app/core/types/database.types.ts` whenever schema changes require it.
- Do not mark backlog tasks complete in state docs until the user confirms the task works.
- Add a dedicated database/RLS task before production reliance on `hero.id != auth.uid()`: update onboarding policies and server-aware hero ownership checks.

---

## Added high-priority preparation track — U0 and UX special tasks

After G-series work and before deeper H/admin/staff UI work, prioritize the following preparation:

1. Regenerate Supabase `database.types.ts` after U0-N4 Stage 1–2 migrations.
2. Update `database-current.md` with U0 roles/staff/moderation contracts.
3. Add Codex tasks for U0 role/staff audits and Special UX explainability audits.
4. Do not ask Codex to build user/staff management UI before regenerated types and `database-current.md` include:
   - staff scopes;
   - moderation actions;
   - staff management RPC;
   - moderation history RPC;
   - staff assignment eligibility.
5. Track non-blocking role-aware UI and explainability findings in `ui-ux-notes` / current UX notes file.

### U0 DB foundation status

U0-N4 Stage 1–2 are structurally implemented in DB:

- staff scopes;
- moderation actions;
- warning/restriction/suspension/ban foundation;
- moderation history RPC;
- staff/user management RPC;
- permission helper split;
- access-control audit action types.

Remaining before frontend implementation:

- regenerate types;
- update docs;
- optionally run later behavioral tests with better test harness;
- implement runtime enforcement of restrictions in trade/auction/gameplay flows later.

