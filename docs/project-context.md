# Monster Hunt — Project Context for Codex

## Purpose
This is the short operational context file for implementation work.
Use it as the primary high-level source of truth when generating code, scaffolding features, or proposing architecture.

If something here conflicts with:
1. an explicit user instruction,
2. current database schema or migrations,
3. newer seed data,
then prefer those over this file.

## Game Overview
Monster Hunt is a browser RPG inspired by ancient Greece.

The game combines:
- character progression,
- layered item generation and loot variance,
- exploration plus trials,
- estates, districts, and buildings,
- PvP conflict,
- guild-supported sieges,
- reputation / prestige progression,
- and later server-level politics and global events.

The game is not meant to be a pure action game or a passive idle game.
It should reward planning, adaptation, execution, meaningful risk, and long-term strategic progression.

Failure is allowed.
RNG is allowed.
High value does not always mean high usefulness.

## Canonical Terminology

### Character Power Axes
- Level: main character progression level.
- Base stats: canonical stats from the database.
- Derived stats: health, defense, damage ranges, luck, etc.
- Gear / equipment: modifies build capability and challenge success.

### Estate / World Axes
- Estate / Possession: the player's current property.
- Address: district-coded address such as `A-2374`.
- District: world / estate layer such as A, B, C, D, E.
- Buildings: infrastructure attached to an estate, not just to the player.

### Social / Server Axes
- Guild: social structure that can support sieges and coordinated progression.
- Reputation / Prestige: social-world standing; not the same as level.
- Server governance: later political, voting, and global-event layer.

### PvE Terminology
Do not describe the main PvE loop as a plain “monster hunt” unless the user explicitly wants that wording.

Preferred terms:
- Exploration
- Trials
- Encounter
- Exploration + Trials loop
- Trial appearance
- Trial manifestation
- Trial completion

Reason: the PvE loop is a text-driven exploration shell with encounters and limited trials, not a single repeated combat-only hunt.

## Current PvE Model
The main PvE loop is:
1. The player moves through a text-described virtual exploration space.
2. Each movement step takes time.
3. A step first checks for a trial.
4. If no trial appears, the system checks for encounter or nothing.
5. Encounter and trial cannot happen at the same time.
6. Normal encounters do not reset the progressive chance of the next trial.
7. Trials are limited per day.
8. The player's daily goal is generally to complete as many available trials as possible.

### Encounter Types
Current minimal encounter model:
- light combat encounter,
- small resource encounter.

Encounters exist partly so exploration does not feel like empty step, empty step, empty step, trial.

### Trial Chance Rule
Flat independent RNG alone is not enough.

Use a progressive trial chance model:
- initial chance is low,
- each non-trial step increases the chance,
- a trial resets it,
- a normal encounter does not reset it.

This is an anti-dry-streak pacing system, not a guarantee system.

### Trial Manifestation Rule
A trial appearing is not the same as a trial fully happening.

After a trial appears, the system should still check whether the trial truly manifests / proceeds.
This chance depends on:
- difficulty,
- the relevant stat for that trial,
- and to a smaller degree luck.

This supports flavor such as “the gods did not answer” or the ritual / omen / invocation failing to produce the real challenge.

### Trial Completion Rule
If a trial manifests, the player must still complete it.
A manifested trial is not a guaranteed success.

## Difficulty Philosophy for Trials
There are three main trial difficulty tiers:
- easy,
- medium,
- hard.

Difficulty affects:
- trial manifestation reliability,
- trial execution difficulty,
- encounter difficulty,
- encounter rewards,
- movement time between locations,
- and accessible item-quality ceilings.

### Important quality gate
The highest item quality (`Outstanding`) should only be obtainable from the highest difficulty tier.

Lower tiers may still give useful loot, but not the top quality tier.

### Intended progression balance
- Easy should be stable and accessible.
- Medium should usually be the best all-around progression tier for most players.
- Hard should be the highest-ceiling tier, not the universally best farming tier at every stage of progression.

Trials also matter for XP progression.
A player who over-forces hard content too early may fall behind in XP efficiency even while chasing better theoretical drops.

## Daily Trials and Premium
The daily cap applies to trials, not necessarily to raw movement steps.

Premium may increase the number of daily trials / attempts.

Premium should not directly improve:
- drop quality,
- trial success chance,
- or luck outcomes.

It only increases the number of attempts / opportunities.

## Luck
Luck is a special stat.
It should not be treated as a normal combat stat.

### Luck should do
- improve access to better opportunities,
- improve bucket quality,
- improve chance of affixes / quality rolls,
- reduce frequency of the worst outcomes at high values,
- increase variance in an interesting way,
- slightly help trial manifestation in relevant places.

### Luck should not do
- guarantee success,
- guarantee best-in-slot items,
- guarantee universally useful drops,
- replace the need for combat-ready or challenge-ready stats,
- guarantee that a high-difficulty trial will manifest or be completed.

### Important constraints
- Luck has no hard system-wide cap by default.
- Its practical ceiling comes from itemization and build structure.
- It should be constrained by slot economy and opportunity cost.
- Diminishing returns are expected.
- High luck should still feel worth maximizing.
- High luck improves the distribution of opportunities, not the certainty of satisfaction.

### Emotional design rule
A player with high luck may still say:
“I did a huge number of runs and only got an outstanding mace.”

That is not automatically a system failure.
Frustration from variance is partly intended.
The system must feel consistent, but it does not need to guarantee emotionally satisfying outcomes.

## Item Philosophy
Items follow layered generation:
- quality,
- optional prefix,
- base item,
- optional suffix.

High economic value is not always equal to high direct usability.

Allowed item categories include:
- immediately useful power spikes,
- economically valuable but awkward or weak items,
- prestige / bait items,
- future-use items blocked by requirements.

### Requirements
Items may have level/stat requirements.
A powerful early drop should not always be immediately usable or immediately monetizable.
This is a major anti-skip safeguard.

## Resources
### Economic resources
- Drachmas
- Materials
- Workforce

### Current resource interpretation
- Agora: produces drachmas.
- Lumber Mill and similar building-material sources feed `materials`.
- Farm produces `workforce` as a normal stockpilable construction resource.

### Progression currency
- Hero Points / PR
  - used for growth,
  - potentially also for trade / market logic.

## Buildings
Buildings are attached to estates / addresses / districts.
They are not just a generic personal upgrade tree.

### Important design assumptions
- buildings can have cost, build time, max level, requirements,
- `max_level = 0` may mean unlimited,
- some buildings will have real caps,
- current building descriptions are still partly conceptual,
- building effects are subject to balancing/admin control.

### Current first-wave building intent
- Farm: produces workforce.
- Lumber Mill: produces materials.
- Agora: produces drachmas.
- Barracks: PvP attack-side building; primarily health scaling in attack based on building level and one chosen stat such as cunning; may also add one small offensive-stat bonus.
- Fortress: PvP defense-side building; primarily health scaling in defense based on building level and one chosen stat such as wisdom; may also add one small defensive or combat-related bonus.
- Trade Routes: unlock trade and should remain functionally simple at first.
- Armory: increases visible / directly manageable item capacity. Items are not deleted just because they are not visible.

### Armory rule
Armory is a visibility / access management system, not an auto-delete storage cap.
Items may still exist even if not currently visible on the active shelves.
Selling / scrapping should remove items from the database and reduce item clutter.

## Districts, Estates and Relocation
District progression is one of the core world systems.

The player has an address in a district.

Moving to a new empty estate should be operationally simple:
- choose address,
- click claim / occupy,
- confirm,
- understand that existing buildings are lost,
- rebuild from zero.

Relocation should be easy to execute, but strategically expensive.

### Siege / estate takeover
Estate takeover is not a one-click action.

It is intended as a longer process:
- siege preparation time,
- possible guild participation,
- defense participation,
- then resolution.

If the attacker wins:
- addresses are swapped,
- the winner takes the target estate,
- the loser takes the winner’s old estate.

If the siege fails:
- everyone stays where they are.

## Reputation / Prestige
Do not reduce this to “rank = level”.

Reputation / prestige is a separate social-world progression axis.

It should broadly reflect:
- honor,
- standing,
- credibility,
- world respect,
- meaningful victories,
- successful challenge performance.

It should not reward farming helpless targets the same way it rewards beating stronger opponents.

Possible high-level rule:
- beating much weaker players gives little or no prestige,
- losing to weaker players may hurt prestige,
- meaningful challenges and meaningful PvP wins increase prestige more.

This system is expected to matter especially for higher-end districts and server-political layers.

Use the term reputation or prestige rather than generic `rank` unless the user explicitly wants another label.

## Guilds and Server Politics
Guilds are not optional fluff.
They are part of the logic of:
- sieges,
- support,
- alliance-building,
- and later server politics.

Long-term direction includes:
- limited guild size,
- coalition-building across multiple guilds,
- elections / support systems,
- district-linked prestige competition,
- server-wide event voting or activation.

Political coordination, negotiated support, and social power are part of the design fantasy, not accidental side effects.

## Frontend / Technical Rules
The stack is:
- Angular 21
- zoneless
- signals-based
- modern Angular patterns only

### Architectural rules
Prefer:
- signals,
- computed signals,
- effect where appropriate,
- RxJS only when genuinely needed for stream-based integration,
- typed domain models,
- mappers from backend data to domain / UI models,
- modular feature structure.

Avoid:
- promises as a default architectural pattern,
- outdated Angular patterns,
- zone-dependent assumptions,
- legacy state-management habits,
- ad hoc imperative UI logic when signal-driven composition fits better.

When generating Angular code:
- assume Angular 21,
- assume zoneless change detection,
- prefer signals-first APIs,
- do not introduce promise-heavy flows unless explicitly required,
- do not reintroduce old Angular practices “for compatibility” without being asked.

## Repository Organization
Use these broad feature boundaries:
- `src/app/public`
- `src/app/auth`
- `src/app/admin`
- `src/app/hero`
- `src/app/game`
- `src/app/layout`
- `src/app/shared`
- `src/app/core`

`core` is for:
- services,
- domain models,
- mappers,
- interfaces / types,
- config / constants,
- enums,
- validators,
- helpers / utils,
- reusable technical infrastructure.

Feature folders should contain feature-local composition, pages, components, and routes.

## What Codex Should Treat As Provisional
Unless explicitly confirmed elsewhere, these areas are still subject to change:
- exact formulas,
- exact district thresholds,
- exact prestige formulas,
- exact building effects,
- exact premium numbers,
- exact trial progression curve,
- exact final names for some systems,
- exact encounter reward tables,
- exact manifestation probabilities per difficulty.

Do not over-freeze provisional gameplay values into code without leaving room for balancing/admin control.

## Codex Behavior Expectations
When implementing a feature:
1. preserve canonical terminology,
2. preserve signals-based Angular patterns,
3. avoid simplifying gameplay semantics unless asked,
4. prefer configurable systems over hardcoded numbers,
5. note when a feature depends on still-provisional design decisions.

If a design decision is ambiguous, keep the implementation extensible rather than guessing hard in one direction.

---

# Update 2026-04-26 — Runtime economy decisions

## Character Points

Character Points are the canonical spendable/progression currency.

- Stored on `hero.character_points`.
- Lifetime generated baseline is stored on `hero.total_character_points_earned`.
- Changes are recorded in `character_point_ledger`.
- Character Points are earned alongside experience.
- Experience mainly drives level/progression thresholds; Character Points are spent/traded.
- Character Points are not a `hero_resources` row and are not `hero_derived`.

## Health and derived stats

Use **Health** for combat hit points in UI and implementation language.

`hero_derived.hp` no longer exists. Remaining `hero_derived` fields are transitional and must not be treated as authoritative source of truth for new systems.

New domain work should calculate derived values from base stats, equipment, bonuses, formulas and context. Frontend may preview values; backend/RPC/domain actions must calculate authoritative values.

## Player economy

Player-to-player trade uses Character Points.

Drachmas are system/vendor currency/resource. Vendor scrap gives drachmas and is not a player trade.

Implemented foundation supports:

- direct private trade between two heroes;
- public server-scoped auctions for one item;
- Character Point locks;
- item locks for trade/auction;
- completed transaction records;
- Character Point ledger entries;
- anti-abuse signals and automatic case grouping.

Trade Routes/building bonus integration is still pending. Current DB runtime uses fallback active-offer config until building bonus runtime is connected.

## Anti-abuse review principle

Anti-abuse signals/cases are evidence and review workflow, not automatic guilt.

Suspicious trade/auction signals should be reviewed with context such as declarations, repeated patterns, item history, server market conditions and operator judgment.
