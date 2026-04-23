# Monster Hunt — Current Decisions Log

Use this file for recent design and implementation decisions that should override older assumptions.

## Confirmed / Active

### PvE loop
- The core PvE loop is exploration + trials, not a plain monster-hunt loop.
- Movement happens through a text-described virtual space.
- A movement step may lead to:
  - nothing,
  - a light encounter,
  - a small reward,
  - or a proper trial.
- Trial count is limited daily.
- Premium may increase the number of daily trials.
- Premium does not directly improve trial quality, drop quality, or luck outcomes.

### Trial chance pacing
- Trial chance should increase after consecutive non-trial steps.
- Trial chance resets after a trial occurs.
- Normal encounters do not reset the trial progression counter.
- This system is intentional anti-dry-streak pacing, not fixed deterministic scheduling.

### Luck
- Luck has no hard global cap by default.
- Practical maximum should come from itemization, slot economy, set bonuses, and origins.
- Luck is not upgraded from player stat points.
- Luck should remain worth maximizing.
- Luck improves opportunities, not guarantees.
- High luck may reduce or effectively remove the lowest-value buckets at extreme values, depending on balancing.
- High luck should not be enough on its own to trivialize difficult combat/trials.

### Item philosophy
- Expensive items are not guaranteed to be useful.
- Economically strong but awkward items are allowed.
- Requirements remain an important anti-skip mechanic.
- Valuable early drops should not always be freely monetizable immediately.

### Estates / districts / buildings
- Buildings belong to the estate/world progression layer, not just a personal upgrade tree.
- Relocating to an empty estate should be easy in UX terms, but expensive in strategic terms because buildings are lost.
- Siege-based estate takeover is a longer PvP/guild process, not a one-click event.
- Current building data is still partly conceptual and subject to iteration.

### Prestige / reputation
- This is a separate axis from character level.
- It should broadly represent honor / standing / reputation.
- Farming much weaker opponents should not be a strong prestige source.
- Meaningful victories and successful difficult actions should matter more.
- Prestige is expected to matter more in higher-end social/world systems.

### Guilds / politics
- Guild cooperation and negotiation are intentional parts of the design.
- Coalition-building is expected and not treated as a design failure.
- Later server-level leadership, voting, and global event systems are part of the long-term direction.

### Frontend / architecture
- Angular 21
- zoneless
- signals-based
- avoid outdated Angular patterns
- avoid promise-heavy architecture by default

## Still Provisional
- exact trial chance growth curve,
- exact movement step times,
- exact district entry thresholds,
- exact prestige formula,
- exact premium values,
- exact building formulas and caps,
- exact guild size rules,
- exact server governance details,
- final naming between prestige / reputation / honor.
