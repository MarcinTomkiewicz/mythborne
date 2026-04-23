# Monster Hunt — Project Context for Codex

## Purpose
This file is the short, operational context document for implementation work.
Use it as the primary high-level source of truth when generating code, scaffolding features, or proposing architecture.

This document is intentionally shorter than the full design documents.
If something here conflicts with a newer migration, seed, or explicit user instruction, prefer:
1. explicit user instruction,
2. current database schema / migrations,
3. this document.

## Game Overview
Monster Hunt is a browser RPG inspired by ancient Greece.

The game combines:
- character progression,
- item generation and loot variance,
- exploration plus trials,
- estate and district progression,
- PvP conflict,
- guild-supported sieges,
- long-term prestige / reputation systems,
- and later server-level political / event systems.

The game is not meant to be a pure action game or a passive idle game.
It should reward:
- planning,
- adaptation,
- execution,
- meaningful risk,
- and long-term strategic progression.

Failure is allowed.
RNG is allowed.
High value does not always mean high usefulness.

## Canonical Terminology

### Character Power Axes
- Level: main character progression level.
- Stats: canonical base stats from the database.
- Derived stats: HP, defense, damage ranges, luck, etc.
- Gear / equipment: modifies build capability and challenge success.

### Estate / World Axes
- Estate / Possession: the player's current property.
- Address: district-coded address such as `A-2374`.
- District: world/estate layer (A, B, C, D, E).
- Buildings: infrastructure attached to an estate, not just to the player.

### Social / Server Axes
- Guild: social structure that can support sieges and coordinated progression.
- Reputation / Prestige: social-world standing; not the same as level.
- Server governance: later political / voting / event layer.

### PvE Terminology
Do not call the main PvE loop “monster hunt” in implementation language unless the user explicitly wants that wording.

Preferred terms:
- Exploration
- Trials
- Exploration + Trials loop
- Encounter
- Trial chance

Reason: the PvE loop is no longer just a single hunt/combat activity. It is a text-driven exploration shell with encounters and limited trials.

## Current PvE Model (Important)
The main PvE loop is:
1. The player moves through a text-described virtual exploration space.
2. Each movement step takes time.
3. A step may result in:
   - nothing,
   - a light encounter,
   - a small reward,
   - combat-style fluff event,
   - or a proper trial.
4. The number of actual trials per day is limited.
5. Trial chance increases after consecutive steps without a trial.
6. When a trial occurs, that progressive trial chance resets.
7. A normal encounter does not reset the trial progression counter.

### Key design rule
Encounters exist partly to prevent the loop from feeling like:
- empty location,
- empty location,
- empty location,
- trial.

Instead it should feel more like:
- movement,
- something happens,
- movement,
- something happens,
- trial.

### Trial Chance Rule
Flat independent RNG alone is not enough.

Use a progressive trial chance model:
- initial chance is low,
- each non-trial step increases the chance,
- trial resets it,
- encounter does not reset it.

This is an anti-dry-streak system, not a guarantee system.

## Daily Trials and Premium
The daily cap applies to trials, not necessarily to raw movement steps.

Premium may increase the number of daily trials / attempts.

Premium should not directly improve:
- drop quality,
- trial success chance,
- or luck outcomes.

It only increases the number of attempts/opportunities.

## Luck (Critical Design Rule)
Luck is a special stat.
It should not be treated as a normal combat stat.

### Luck should do
- improve access to better opportunities,
- improve bucket quality,
- improve chance of affixes / quality rolls,
- reduce frequency of the worst outcomes at high values,
- increase variance in an interesting way.

### Luck should not do
- guarantee success,
- guarantee best-in-slot items,
- guarantee universally useful drops,
- replace the need for combat-ready or challenge-ready stats.

### Important constraints
- Luck has no hard system-wide cap by default.
- Its practical ceiling comes from itemization and build structure.
- It should be constrained by slot economy and opportunity cost.
- Diminishing returns are expected.
- High luck should still feel worth maximizing.
- High luck should improve the distribution of opportunities, not guarantee satisfaction.

### Emotional design rule
A player with high luck may still say:
“I did a huge number of runs and only got an outstanding mace.”

That is not automatically a system failure.
Frustration from variance is partly intended.
The system must feel consistent, but it does not need to guarantee emotionally satisfying outcomes.

## Item Philosophy
Items follow layered generation:
- quality
- optional prefix
- base item
- optional suffix

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
Important distinction:

### Economic resources
- Drachmas
- materials (final construction resource)

### Production sources / profiles
Wood and marble are not necessarily two equally separate final economy layers.

Current interpretation:
- they are production inputs / profiles that effectively feed one broader construction-materials economy,
- wood is earlier / less efficient,
- marble is later / more efficient.

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

## Districts, Estates and Relocation
District progression is one of the core world systems.

The player has an address in a district.

Moving to a new empty estate should be operationally simple:
- choose address,
- click claim/occupy,
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
They are becoming part of the logic of:
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

## Frontend / Technical Rules (Very Important)
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
- mappers from backend data to domain/UI models,
- modular feature structure.

Avoid:
- promises as a default architectural pattern,
- outdated Angular patterns,
- zone-dependent assumptions,
- legacy state management habits,
- ad hoc imperative UI logic when signal-driven composition fits better.

When generating Angular code:
- assume Angular 21,
- assume zoneless change detection,
- prefer signals-first APIs,
- do not introduce promise-heavy flows unless explicitly required,
- do not reintroduce old-school Angular practices “for compatibility” without being asked.

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
- services
- domain models
- mappers
- interfaces/types
- config/constants
- enums
- validators
- helpers/utils
- reusable technical infrastructure

Feature folders should contain feature-local composition, pages, components, and routes.

## What Codex Should Treat As Provisional
Unless explicitly confirmed elsewhere, these areas are still subject to change:
- exact formulas,
- exact district thresholds,
- exact prestige formulas,
- exact building effects,
- exact premium numbers,
- exact trial progression curve,
- exact final names for some systems.

Do not over-freeze provisional gameplay values into code without leaving room for balancing/admin control.

## Codex Behavior Expectations
When implementing a feature:
1. preserve canonical terminology,
2. preserve signals-based Angular patterns,
3. avoid simplifying gameplay semantics unless asked,
4. prefer configurable systems over hardcoded numbers,
5. note when a feature depends on still-provisional design decisions.

If a design decision is ambiguous, keep the implementation extensible rather than guessing hard in one direction.
