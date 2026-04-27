# Monster Hunt - Current TODO

Updated: 2026-04-26

This file lists pending work derived from:
- `docs/project-context.md`
- `docs/database-current.md`
- `docs/current-decisions.md`

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
- Current backlog task: D5 - config apply/cancel flow.

## Codex Backlog Workflow

- Use one backlog task per Codex prompt unless the user explicitly groups tightly related tasks.
- Codex reads the required project docs before making changes.
- Codex reports the exact changes, verification result, and acceptance-criteria status after the task.
- The user confirms whether the task works.
- Only after user confirmation, Codex updates `current-state-summary.md`, `current-todo.md`, and any relevant task status/docs.
- Unconfirmed work must stay out of the completed-state summary.
- After confirmation, Codex prepares a commit message and waits for the next task instruction.

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
- Build frontend gameplay/admin surfaces for direct trade offers.
- Build frontend gameplay/admin surfaces for auction listings, bids, buy now, cancellation, and closing.
- Use existing RPC/domain operations for trade and auction mutations instead of direct table writes.
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
- Keep vendor scrap outside player trade and Character Points.

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
