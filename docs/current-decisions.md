# Mythsworn — Current Decisions Log

Updated: 2026-05-08

Use this file for recent design, domain, database and implementation decisions that should override older assumptions.

If something conflicts, prefer:

1. explicit user instruction,
2. current database schema / migrations / dump,
3. this file,
4. `project-context.md`,
5. broader concept documents.

This file is not a Codex status tracker. Do not mark Codex tasks as completed here unless the user explicitly asks for documentation/status updates after accepting the work.



## Epic Y — Prestige Foundation Decisions — 2026-05-07

Epic Y covers the Prestige foundation. Prestige is a long-term reputation/sława system for a hero. It is not level, XP, Character Points, guild reputation, anti-abuse sanctioning or a server-wide score.

### Core model

- Prestige is hero-scoped and server-scoped.
- Prestige is personal. It belongs to the hero, not to the account, guild or whole server.
- Prestige is separate from level, XP and Character Points.
- Prestige has hidden points and visible rank.
- Prestige points cannot fall below `0`.
- Prestige has no decay. Fame does not expire with time.
- Prestige is DB/RPC-authoritative. Angular must not calculate durable Prestige points, rank, PvP delta or final outcome as authority.
- Prestige is not anti-abuse. It can discourage dishonourable PvP farming, but it does not replace moderation, sanctions or anti-abuse review.

### Visibility and player/admin boundary

- Players can see their own Prestige rank.
- Players can see other heroes' Prestige rank where public/player-facing hero identity is shown.
- Players must not see raw Prestige points.
- Players must not see numeric Prestige deltas.
- Admin/tester/sandbox UI may show raw Prestige points, raw delta, thresholds, source kind, source entity, formula/config context and before/after rank/points.
- Player-facing rank names and descriptions/helper text should come from DB/config/metadata, not hardcoded Angular copy.
- Rank names are canonical in-world proper names and should remain Greek-styled across language versions. Localize explanatory text, not the rank proper names.

### Prestige ranks

- There are 5 Prestige ranks.
- Existing DB `ranks` rows are the seed/candidate rank registry.
- Current canonical rank mapping is:
  - Rank 1 / District A: `Perioecus`;
  - Rank 2 / District B: `Ephor`;
  - Rank 3 / District C: `Strategos`;
  - Rank 4 / District D: `Archon`;
  - Rank 5 / District E: `Basileus`.
- `Basileus` is the canonical form for rank 5.
- The rank registry should use a normal technical ID, preferably UUID, and a separate `rank_number` for gameplay ordering/filtering/mapping.
- Existing `ranks.required_level` and `ranks.max_players` are legacy relative to the new Prestige model.
- Rank thresholds should be admin-configurable, preferably as explicit per-rank thresholds rather than a pure formula, because there are only five political/social ranks.
- Suggested default threshold seed is `0 / 100 / 350 / 900 / 2000` for ranks 1-5. These values are balancing defaults and may differ on test servers.

### Sources and extensibility

- Prestige v1 is PvP-driven.
- Trial/PvE, Guild and Siege actions do not grant Prestige in the first foundation.
- Guild actions do not affect a member's private Prestige/reputation in the first foundation.
- The system should be source-extensible so future private feats such as Argonautics can be configured to affect Prestige later.
- Future Prestige source kinds should be DB/config-driven where practical; Angular must not own source eligibility or delta calculation.

### PvP Prestige scoring semantics

- PvP Prestige is based on honour, challenge and shame, not victory alone.
- Target strength is classified by the target's position inside the legal PvP target range, not by raw absolute level difference only.
- Default banding is `20 / 60 / 20`: lower 20% = weaker, middle 60% = similar, upper 20% = stronger.
- Banding should be admin-configurable.
- Attacker rules:
  - attacking stronger and winning gives a big gain;
  - attacking stronger and drawing gives a small gain;
  - attacking stronger and losing gives `0` Prestige delta;
  - attacking similar and winning gives a normal gain;
  - attacking similar and drawing gives `0`;
  - attacking similar and losing gives a small-to-moderate loss;
  - attacking weaker and winning gives a minor loss;
  - attacking weaker and drawing gives a minor-to-medium loss;
  - attacking weaker and losing gives a big loss.
- Defender rules:
  - defending against stronger and winning gives a big gain;
  - defending against stronger and drawing gives a small gain;
  - defending against stronger and losing gives `0`;
  - defending against similar and winning gives a normal gain;
  - defending against similar and drawing gives `0`;
  - defending against similar and losing gives `0`;
  - defending against weaker and winning gives `0`;
  - defending against weaker and drawing gives a minor loss;
  - defending against weaker and losing gives a loss, but milder than the active attacker losing to a weaker target.
- Attacker penalties are harsher because the attacker chooses the target; defender penalties are softer because the defender does not choose the fight.
- Suggested numeric seed can exist in DB config, but all values are balancing defaults and must not be hardcoded in Angular.

### Reports and notifications

- Every PvP Prestige point delta should appear in the PvP report/result as a player-safe qualitative Prestige change summary.
- Player-facing PvP reports must not expose raw Prestige points or numeric delta.
- Ordinary point changes that do not change rank should not create a separate notification.
- A persistent notification should be created when a hero's Prestige rank changes.
- Rank-change notifications should tell the player that the hero advanced or dropped from one rank to another, using rank names.
- Rank-change notifications must not expose raw Prestige points, numeric delta or formula/debug context to players.
- Admin/debug report/read models may expose raw before/after points, raw delta, source and formula/config context.

### Districts, relocation and buildings

- Prestige rank gates district privileges:
  - District A requires rank 1;
  - District B requires rank 2;
  - District C requires rank 3;
  - District D requires rank 4;
  - District E requires rank 5.
- Falling below the Prestige rank required for the current district does not delete estate, delete buildings, downgrade buildings or force relocation.
- Existing buildings keep working after Prestige loss.
- Already-started building jobs/upgrades may finish even if Prestige drops during the job.
- A hero may only start new building construction/upgrades whose Prestige requirement is less than or equal to the hero's current Prestige rank.
- A hero below the current district requirement cannot relocate within that higher district and cannot move to a higher district until the requirement is met again.
- `buildings.rank_required` exists in the current schema, but the project also has central requirement foundations. Migrator should decide whether `buildings.rank_required` remains canonical, becomes compatibility/convenience data, or is migrated into central `prestige_rank` requirements. Do not leave two conflicting canonical sources.

### Future council and server events boundary

- Server Council and server-wide events are not part of Epic Y implementation.
- Future council eligibility requires high Prestige / district D or E.
- If a hero loses the required Prestige/district standing, they lose active voting rights; no detailed term/cadence/replacement system is designed in Epic Y.
- Server Council and global server event voting require separate future design.

### Implementation boundary

- DB/RPC/schema/finalizer work for Prestige belongs to the migrator/database track.
- Codex/frontend work belongs to Epic Y only after the DB/RPC contract and regenerated types exist.
- Codex must not implement Prestige by hardcoding thresholds, rank names as source of truth, PvP delta matrix, point calculation, notification generation or report generation in Angular.
- `current-todo.md`, `current-state-summary.md` and backlog task statuses are updated only by Codex/status workflow after confirmed implementation, not by this decision entry.


## Server Events Foundation Decisions — 2026-05-07

Server Events are global, temporary, server-scoped events that affect every hero on a server. They are not per-district, per-guild, per-rank, per-origin or per-player events. They are intended to be rare, powerful and lore-forward rather than a constant rotation of small buffs.

### Core model

- A Server Event affects the whole server and every hero on that server.
- Server Events do not have sub-scopes in v1. No district, guild, origin, rank or player-group targeting.
- Only one Server Event may be active on a server at a time.
- Server Events are temporary and have `starts_at` / `ends_at` semantics.
- Server Events are intended to be rare, powerful and irregular.
- Server Events can be positive, negative or mixed.
- Negative events are valid events, not a separate rarer category.
- Event definitions should be internally coherent and lore-driven. The preferred design is one strong effect or a simple coherent bundle, not a random pile of tiny modifiers.
- Mixed effects are allowed when the lore/design justifies them.
- Every event must have a lore-facing name and lore description.
- Event names, descriptions, helper text and player-facing copy must be DB/admin-configurable and must not become permanent Angular hardcode.

### Effect semantics

- Server Events may affect base stats, all stats, Luck, derived stats and combat-derived values such as HP, evasion chance, critical chance and critical damage.
- Server Events may affect combat through stats, derived stats and runtime bonus inputs.
- Server Events must not directly alter manual minigame mechanics such as Walking Dead speed or input timing behavior. If an event gives Agility, it may indirectly affect combat and Trial/minigame difficulty through the normal stat/runtime path.
- Server Events may apply requirement modifiers such as `-15%` to all normal requirement checks.
- Requirement modifiers apply to normal requirements such as item and building requirements.
- Requirement modifiers do not reduce Prestige/district entry gates or other political/district access thresholds.
- Requirement modifiers are runtime modifiers. They do not permanently rewrite requirement definitions.
- If an action is valid while the event is active, its normal persistence rules apply. Already equipped items do not fall off because requirements stop being met later, and already-started building jobs/upgrades continue normally.
- Server Events are not primarily an economy system in v1. They may indirectly affect drops through Luck, but do not start from production/cost economy events such as wood production or construction cost unless a later design explicitly expands them.

### Runtime and authority

- Server Events should not permanently mutate hero stats, Luck, HP or other hero fields. They should be treated as an active runtime bonus/debuff source.
- The final effective stat/derived/runtime value is based on the hero baseline plus all active bonus sources, including active Server Events.
- Angular must not calculate Server Event effects as gameplay authority.
- Frontend may display the active event and DB/read-model/resolver outputs, but durable gameplay impact belongs to DB/RPC/runtime resolvers.
- Migrator owns the DB/RPC decision of whether event effects directly reuse the existing bonus system or use a separate event-effect layer mapped into runtime resolvers.

### Activation and scheduling

- Server Events can be started manually by admin/operator tooling.
- Manual admin start ignores cooldown by design.
- Cooldown after a manually started event counts from that event's actual end time.
- Manual end/reschedule is not the normal production flow, but may exist as admin/sandbox/emergency correction tooling if the DB/admin design supports it.
- Server Events can also be started automatically by system roll.
- Default automatic cooldown is: after the previous event ends, wait at least 14 days before a system roll can try to start another event.
- Default system roll chance is 10%, but cooldown and chance are admin-configurable.
- System roll without Server Council does not create proposals or a scheduled voting flow. If the roll succeeds, the system picks one event and starts it immediately.
- Automatic event selection is uniform among active eligible event definitions. Event definitions do not have weights in the current design.
- A system event can start even if no players are currently online. Server Events are server state, not online-presence state.
- Default event duration is one week, but duration is admin-configurable.

### Future Server Council activation

- Server Council and council voting are not part of the first Server Events foundation, but Server Events should be compatible with a future `council_vote` activation source.
- Future Council voting default: generate 5 event proposals from the event pool.
- The proposal count should be admin-configurable, default 5.
- Future voting duration default: 3 days.
- Voting duration should be admin-configurable.
- Event start after voting should be configurable: either a specific weekday after voting or X days after voting ends. Monday start is a reasonable default/proof-of-concept, not a hard rule.
- If a council vote ties and an eligible E1 holder voted for one of the tied options, that vote resolves the tie.
- If no eligible E1 holder resolves the tie, use a 24-hour runoff among tied events only. If the runoff still ties, randomly select from the still-tied events.

### UI boundary

- Player UI should expose one compact active Server Event indicator.
- If no Server Event is active, the indicator should show a neutral inactive/no-event state or remain unobtrusive according to the final UI pattern.
- If a Server Event is active, the indicator should show the lore name, lore description/helper text and the major player-facing effect summary from DB/read models.
- Server Events v1 does not require a full event page, large banner, report flow or notification spam.
- Exact placement and visual treatment belong to later UI/Codex work; the decision here is that the active event must be visible and understandable without Angular owning event-effect authority.

### Non-goals and boundaries

- Server Events do not create a full political system by themselves.
- Server Council, council UI, full event proposal/voting tables, and concrete seed copy for many event definitions are future work.
- Server Events should not become an Angular-side effect calculator.
- Server Events should not introduce per-player/district/guild scopes in v1.

### Implementation boundary

- Migrator owns DB/RPC/schema/finalizer/read-model design for Server Events.
- The conversation decisions define what Server Events must do, not whether the DB implementation uses an existing bonus system directly or a separate event-effect layer mapped into runtime resolvers.
- Server Events must integrate with existing runtime stat/Luck/derived/requirement checks rather than creating a parallel Angular-side calculation path.
- Codex/frontend work can consume Server Events only after the DB/RPC/read-model contract and generated types exist.


## Epic AA — Server Council Decisions — 2026-05-08

Epic AA covers the future Server Council foundation. The Council is a lightweight political/prestige feature that gives high-district estate ownership additional meaning. It is not part of the first Server Events foundation and should not be implemented inside Epic Z.

### Core scope

- Server Council v1 exists only to choose Server Events.
- The Council is not a parliament, budget system, tax system, punishment system, veto system, guild governance system or full political simulator.
- The Council exists to give additional meaning to high districts D/E and especially to the E1 estate.
- Server Council v1 is a future system and should be planned as Epic AA after Prestige and Server Events foundations are available.

### Membership and eligibility

- Council membership is based on current estate ownership in districts D and E.
- District C is not part of the Council in v1.
- The number of Council members is not a separate hardcoded limit. It follows the current D/E estate capacity.
- If district D has 50 estates and district E has 1 estate, then the Council has up to 51 voting members.
- If future balancing changes district D capacity, Council size changes naturally with that capacity.
- There are no Council terms, election campaigns, candidate lists or separate Council elections.
- A hero that loses their D/E estate loses Council membership.
- A hero that gains a D/E estate enters the Council if the rest of eligibility is satisfied.
- Falling below the required Prestige threshold suspends voting rights but does not evict the hero or remove the estate.
- Suspended or banned server membership cannot vote.
- Being in the Council does not grant or remove Prestige by itself.
- The Council does not directly punish players. The only negative effect a Council decision may create is choosing a negative Server Event.

### Activation threshold

- Council-driven Server Event voting should not require all D/E estates to be occupied.
- Server Council voting may begin once at least 20 estates in district D are occupied on the server.
- This threshold exists for player experience: the Council can start being visible before the high districts are completely filled.
- The threshold should be DB/config-owned rather than hardcoded in Angular.
- If the threshold is not met, Server Events may still be started through admin/system activation according to Server Events rules; only Council voting is unavailable.

### Voting model

- The Council votes over a pool of Server Event proposals.
- Default proposal count is 5.
- Proposal count should be configurable.
- Each eligible Council member has one vote.
- A vote can be changed until voting closes.
- Not voting is simply non-participation and has no penalty.
- Voting results are not visible while voting is open.
- Players outside the Council may see a public state such as “the Council is deliberating”.
- Players outside the Council do not need to see the proposal list or live vote counts.
- After voting ends, at least the selected Server Event may be shown publicly.
- Showing the full proposal list after voting is a future UI/UX decision, not required for the v1 model.

### E1 / Basileus tiebreaker

- The tiebreaker is the hero currently holding estate E1.
- The tiebreaker is not every hero with Prestige rank `Basileus`.
- A hero with rank `Basileus` who does not hold E1 is not the tiebreaker.
- The tiebreaker comes from owning the most important estate, not from a separate Council rank.
- E1 may be lore-linked to a royal palace / royal seat.
- If voting is tied and the E1 holder voted for one of the tied options, the E1 holder's vote breaks the tie.
- If there is no eligible E1 holder or the E1 vote does not resolve the tie, run a runoff.
- The runoff lasts 24 hours by default and includes only the tied options.
- If the runoff remains tied, the system randomly selects one winner from the still-tied options only.
- Do not use “first proposed wins” because proposals are generated together.

### Out of scope for v1

- No Council terms.
- No campaigns.
- No candidate registration.
- No elections to the Council.
- No Council ranks beyond the E1 tiebreaker role.
- No Council budget.
- No taxes.
- No veto powers.
- No guild voting blocs as a formal mechanic.
- No public debates.
- No rewards for voting.
- No punishment for not voting.
- No player sanctions or direct disciplinary decisions.


## Manual Trial Shell / Core Decisions — 2026-05-08

Manual Trial Shell/Core is the shared foundation for non-combat manual Trial minigames. Concrete Trial minigames should be implemented as specializations of this shell rather than as isolated feature islands that duplicate lifecycle, submit, error and result handling.

### Core model

- Manual Trial Shell/Core is a shared lifecycle layer, not a standalone minigame.
- Manual Trial Shell/Core should be planned before individual non-combat Trial minigame epics.
- Each concrete Trial owns its own manifest schema, renderer, input mechanics, local interaction state and submit payload shape.
- The shared shell owns common challenge attempt flow, manifest loading, status/lifecycle, common errors, stale guards, submit orchestration and reward/report/result handoff.
- The shared shell should not try to become one universal gameplay engine that understands every concrete Trial mechanic.
- Combat may later reuse some shell/wrapper conventions such as layout, status, stale guards and result handoff, but combat remains a special live-combat runtime because it is DB-authoritative per player action with event log/opponent catch-up.

### Shared shell responsibilities

The shared shell should handle, at minimum:

- entry from an exploration challenge attempt;
- loading the DB/RPC/config-owned manual Trial manifest;
- showing Trial name, deity, relevant stat name/key and difficulty profile;
- not showing raw/final `trial_power` to the player;
- optional HUD sections such as timer, remaining time, mistakes, attempts, required successes or step count only when the concrete manifest provides them;
- common lifecycle states such as `not_started`, `running`, `submitting`, `success`, `failed`, `expired` or equivalent DB/read-model statuses;
- stale guards for selected server, active hero, challenge attempt/session and route context;
- canonical submit flow for the concrete Trial payload/result;
- transition to DB/RPC-owned reward, report and result flow;
- common failure states such as missing manifest, unsupported Trial kind, expired attempt, already-completed attempt or unsupported renderer.

### Per-Trial specialization boundary

- A concrete Trial defines the manifest parameters it understands.
- A concrete Trial defines the renderer and interaction model.
- A concrete Trial collects player input and produces a Trial-specific payload/result for submit.
- A concrete Trial may have its own local UI state, but it should not duplicate shell-owned attempt lifecycle, submit, common errors or result handoff.
- Concrete Trials must not hardcode long-term balancing values in Angular when DB/config/manifest should own them.
- Concrete Trials should reuse the shell and shared patterns rather than duplicating timer/status/result components per minigame.

### Difficulty and trial power semantics

- Trial difficulty does not scale from hero level directly.
- Hero level helps only indirectly through higher stats, gear, bonuses, Luck and therefore effective `trial_power`.
- `easy`, `normal` and `hard` are stable difficulty profiles configured by DB/admin/balance data.
- `trial_power` affects the concrete manifest within the selected difficulty profile, making the manual Trial more or less feasible.
- District should not make the manual minigame itself harder or easier. District may affect system-level auto-resolve caps, access, rewards or balancing according to existing DB/admin configuration.
- Auto-resolve caps are DB/admin-configured system rules and must not be treated as an open per-minigame decision or Angular-side calculation.
- Hard Trials are allowed to be practically impossible for low-stat / poorly prepared heroes. This is intended, not a bug.
- Practical impossibility must come from fair difficulty pressure such as short windows, long sequences or low tolerance, not from bugs, unreadable UI, bad hitboxes, unfair RNG, strobe/flashing or missing information.

### Apollo / Path of Light / Agility decision slice

Apollo / Path of Light is the Agility Trial specialization currently discussed.

- The player clicks/taps the highlighted light tile before it fades.
- Character movement onto the tile may be animated for fantasy/visual feedback, but movement/pathfinding is not the gameplay input in v1.
- The player does not navigate by adjacent-grid movement in the first version.
- The core fantasy is “follow the fading path of light”.
- Agility/trial power can affect tile lifetime, grace window, sequence length, grid size, mistakes allowed, decoy count/aggressiveness and chain rhythm.
- Decoy tiles may exist on any difficulty, but on easier difficulties they must be mild and non-frustrating.
- Hard difficulty may use shorter tile windows, more steps, fewer mistakes, faster rhythm and stronger decoys.
- Hard Apollo may be practically impossible at low Agility, but it must remain readable and fair.
- No strobe, harsh flashing, rapid contrast flicker or epilepsy-risk visual behavior. Tiles should appear/fade softly even when reaction windows are short.
- Apollo implementation should be a specialization of Manual Trial Shell/Core, not a standalone flow duplicating shell-owned lifecycle.


## Luck Foundation Decisions — 2026-05-05

Luck Foundation is a closed decision topic. It must not be reopened unless a migrator, Codex or Reviewer returns a real blocker.

### Core semantics

- Luck is a special stat, not a normal primary progression stat.
- Luck should influence opportunities, ranges and outcome distributions, not guarantee perfect rewards or bypass gameplay.
- Luck should not become direct combat power by itself.
- Luck effects must remain DB/RPC/formula/config-owned where persistent or durable gameplay is affected.
- Angular must not hardcode Luck formulas, drop chances, trial modifiers, combat RNG influence or reward ranges.
- Luck should carry opportunity cost: investing in Luck means not investing in other stats, equipment or bonuses.
- Luck affects helpful gameplay RNG surfaces unless a surface is explicitly Luck-excluded by DB/config/design.
- Luck is consumed through canonical derived outputs such as `luckInfluence`, not by letting Angular or feature code apply raw Luck directly.
- `luckInfluence` is the canonical derived influence value for Luck-aware reward, drop, Trial, Encounter and supported combat-preview contexts.

### Foundation scope

Luck Foundation covers, at minimum:

- hero Luck breakdown and effective Luck value;
- `luckInfluence` style formula output for reward/drop/trial/combat systems;
- Trial power / `trial_power` calculations where Luck contributes as secondary influence;
- `trial_power` is the canonical effective Trial strength used by Luck-aware Trial/Encounter/manual Trial contexts.
- Conceptual rule: `trial_power = testedStatValue + luckInfluence`.
- Difficulty, district, caps and challenge-specific parameters may consume `trial_power`, but they are not part of the `trial_power` value itself.
- exploration RNG influence;
- reward range and item generation opportunity influence;
- combat RNG preview/context where supported by DB helpers;
- Luck-aware admin/debug/explainability outputs.

### Design boundaries

- Luck may improve drop value opportunity, quality opportunity and affix opportunity, but it does not guarantee using the entire reward budget.
- Luck may improve Trial/Encounter probability or manual Trial parameter generation through `trial_power`, but the primary stat remains the main axis.
- Luck may influence RNG-sensitive combat contexts only through DB-owned helpers/config/formulas.
- Luck is not a substitute for missing stats, gear or skill.
- A `nothing` outcome is a deterministic fallback/result category, not a separate Luck RNG surface. Luck should influence the chance to reach reward/drop/opportunity surfaces, not treat `nothing` as its own positive roll target.
- Anti-abuse, moderation, sanctions, audit grouping and review workflows are not gameplay RNG surfaces and must not be Luck-influenced.
- Luck-excluded surfaces must remain explicit; if a gameplay RNG surface is excluded from Luck, DB/config/design should make that exclusion clear.
- Luck Lab is a separate admin/balancer epic, not part of Luck Foundation.
- Luck Lab may later provide sliders, simulations and distribution previews, but those tools must consume DB/RPC/formula outputs rather than inventing Angular formulas.

### Implementation boundary

- Existing DB/RPC contracts recorded in `database-current.md` are the source of truth for Luck Foundation availability.
- Frontend/Codex must consume DB/RPC/formula outputs for Luck, `luckInfluence`, `trial_power`, reward/item-generation context and combat preview.
- Missing Luck contract should be reported as a dependency/blocker, not replaced by Angular fallback math.
- Luck Foundation decisions must remain visible as their own section in decision/context files and must not be collapsed into generic reward, trial or item generation notes.


## Epic X — Onboarding / Start Flow Completion Decisions — 2026-05-06

Epic X covers the canonical player entry flow from server selection to active hero gameplay entry. It is not a tutorial epic and it must not turn Angular into the authority for creating gameplay state.

### Entry and routing

- Player entry starts from server selection.
- Server availability for new character creation must account for whether the selected standard server can still provide a free starting estate address in district A.
- If the selected standard server has no hero for the current user, the user enters hero creation.
- If the selected server has an existing hero for the current user, the user enters the game dashboard/game shell by default.
- After hero creation, the player is already inside the game and is routed by default to stat allocation.
- The initial stat allocation screen is not a mandatory tutorial/wizard lock. The player may leave it and return later.
- On later entries, an existing hero is routed to the dashboard/game shell by default, not back to stat allocation.

### Sandbox and multi-hero behavior

- Sandbox/test servers may allow privileged users such as staff/testers to have multiple heroes.
- For sandbox/test multi-hero contexts, the default active hero is the earliest created hero, treated as the likely main/default test hero.
- The UI must allow switching to another sandbox/test hero.
- A combined server-and-hero selector is acceptable, and a server-first then hero selector is also acceptable, as long as the selected server -> active hero semantics stay explicit.
- Users with access to multiple servers or sandbox/test heroes must be able to switch active context without logging out.

### Hero creation semantics

- Hero creation must be one coherent domain/DB-RPC workflow, not a series of direct frontend table writes.
- Hero names are unique per server. The same name may exist on different servers.
- Origin is selected once during hero creation and immediately affects hero identity and bonuses.
- Origin should not be changed after creation except through a future explicit admin/correction workflow if one is ever designed.
- Origin screen/content must be admin-configurable, including descriptions, lore and bonus presentation. Angular must not hardcode final origin content as the long-term source of truth.
- New heroes start with 1000 Character Points.
- Starting Character Points do not have to be spent immediately.
- Every new hero must receive an estate during creation. A hero without an estate after creation is an integrity error.
- The starting estate address is randomly selected from free addresses in district A.
- Starting estate addresses must not be assigned sequentially as A1, A2, A3, etc.
- The player does not choose or preview the exact starting address before hero creation.

### Source-of-truth boundary

- All entry flow logic must use selected server -> active hero and must not assume `hero.id === auth.uid()`.
- The DB/RPC contract for hero creation must exist before frontend implementation consumes the flow.
- Codex must not implement Epic X by direct-writing hero, origin, Character Points, estate, resource, audit or related onboarding tables from Angular.
- Preparing a DB/RPC handoff for the migrator and later frontend tasks for Codex are implementation consequences of these decisions, not open design questions.

## PvP Foundation Decisions — 2026-05-03 late

The active new Epic R is **PvP Foundation**. This is a target architecture foundation, not a throwaway MVP. Future systems may remain unimplemented where their own foundations do not exist yet, but the PvP model itself should not be knowingly temporary.

### Core PvP model

- PvP uses the existing combat module/combat result snapshot model. PvP supplies hero-vs-hero combatants and interprets the result.
- Defender is another hero/player, not an admin-defined opponent.
- PvP combat reports use `pvp_combat`, not plain low-level `combat`, when the combat is part of PvP.
- PvP notifications are after-the-fact result notifications. Do not create an incoming-attack notification by default.
- Manual fight window applies to the attacker only. If the attacker misses the configured window, the future runtime should auto-resolve.
- Combat should use current loadout/stats at fight start/resolve time, not at attack-click/travel-start time.
- Derived combat stats are resolved on the fly through current derived stat/equipment/bonus/formula runtime. Do not reintroduce `hero_derived` as a source of truth.

### Targeting, travel and protection

- Targeting is estate/vicinity based.
- Attack level range is configurable through DB formula/config, not hardcoded.
- Attack travel time is configurable through DB formula/config.
- Spy travel time is derived from attack travel time through configurable formula; current default is attack travel time divided by 3.
- Target protection starts when an attack starts, not when it resolves.
- One incoming attack per target may be active at a time.
- Protection duration is configurable and should support district-dependent behavior.
- Protection may be visible as target/vicinity state, but the defender should not receive an incoming-attack notification by default.

### Spy

- Spying creates a durable spy result snapshot/report-ready object, not only a transient toast/notification.
- Spy may show current equipment, derived combat stats, resource amounts and estate/building state.
- Spy must not show active exploration/PvP state or staff/admin/private internals.
- Spy results may later become shareable/public through a controlled report/surface, but current private read is owner-safe.

### Rewards, resources and prestige

- PvP reward routing should use existing reward foundation for XP where possible.
- Canonical PvP reward outcomes are `attacker_victory`, `defender_victory`, `draw`.
- XP rewards are configurable and level-difference aware: beating a stronger opponent should reward more; beating a much weaker opponent should reward little.
- Character Points are not a separate PvP reward. CP comes from XP through the Epic N XP → gross CP progression rule.
- Resource steal/loss is not an ordinary reward profile entry. It is a PvP-owned resource transfer/consequence workflow.
- PvP resource consequences are limited to `drachma`, `materials`, and `workforce`.
- PvP attack consequences do not include item transfer/steal/destruction, building loss, Character Point theft, or estate ownership transfer.
- PvP stores context needed for future Prestige: levels, level difference, outcome, winner/loser and resource consequence summary.
- Full hidden prestige points/ranks/scoring belong to a future Prestige epic. Prestige changes should create notifications when that system exists.

### Activity lock

- Central runtime activity model is `hero_runtime_activities`.
- It covers `exploration`, `pvp_attack`, `pvp_spy`, and future `siege` from the start.
- `hero_daily_action_counters` remains a counter/limit system, not the runtime activity lock.
- Existing exploration runtime is now synced to `hero_runtime_activities`.

### Anti-abuse and mercenary context

- Anti-abuse signals are review aids, not automatic punishment.
- Existing PvP-related signal types such as `same_ip_pvp_attack` and `pvp_feeding_pattern` should be reused by PvP producers.
- Relationship declarations provide context and must never automatically suppress signals.
- `mercenary_contract` is a case-by-case declaration, not a permanent “I am a mercenary” status.
- Mercenary contracts use Character Points as the declared payment channel, require amount and expiration, and may involve more than two participants.
- Staff/anti-abuse review should see mercenary/shared-IP/loan/group context when reviewing suspicious PvP or trade patterns.

### Future boundaries

- Siege is future guild/multiplayer PvP and remains inactive until guild/siege systems exist.
- Own-guild attack/siege restriction must be enforced when guild membership exists; do not create a fake guild system inside PvP Foundation.
- Equipment equip/unequip workflow belongs to the future item/equipment epic. The `hero_equipment` boundary is hardened, but full mutation workflow is not part of current PvP DB work.

## Pending Future Decision — Player bug reporting system

Plan a separate player/user bug reporting system. Preferred direction: an in-game bug report form that sends an email and creates an external board task, e.g. Trello, Jira or GitHub Issues. A Mythsworn admin-panel record may also be useful, but an external board is preferred for real triage and tracking. This is a future product/ops workflow, not part of current PvP Foundation DB work.

## Progression / Epic N DB-RPC Decisions — 2026-05-03 current state

Epic N is **Stats and Progression**.

- **Stats** means Character Point allocation into base stats.
- **Progression** means XP, level, XP-to-next-level, level-up, Character Points generated from XP, CP penalties/sinks, level-up rewards and level-up stat bonuses.

### Current DB/RPC state

The DB/RPC progression foundation now exists.

Current canonical foundations:

- `save_stat_allocation(...)` — canonical stat allocation workflow.
- `hero.level`.
- `hero.experience` — current XP progress toward next level.
- `hero.total_experience_earned` — lifetime XP earned.
- `hero.character_points` — current spendable Character Points.
- `hero.total_character_points_earned` — lifetime gross Character Points where relevant.
- `character_point_ledger` — append-only Character Points balance history.
- `apply_reward_character_points_delta(...)` — DB-owned reward/progression CP path.
- `apply_character_point_penalty_sink(...)` — automatic sink for newly earned CP consumed by active CP penalties.
- `hero_progression_ledger` — canonical append-only XP/progression ledger.
- `get_hero_experience_to_next_level(...)` — server-side XP threshold helper using `hero_experience_to_next_level`.
- `grant_hero_experience(...)` — canonical XP/level-up workflow.
- `reward_level_match_kinds` — DB-backed level matching dictionary.
- `reward_profile_assignments.level_match_kind`, `level_value`, `max_level_value`, `level_interval` — level-up reward matching.
- `find_best_level_up_reward_assignment(...)`.
- `grant_level_up_reward_to_hero(...)`.
- `level_up_stat_bonus_rules`.
- `level_up_stat_bonus_rule_stats`.
- `hero_level_stat_bonus_grants`.
- `upsert_level_up_stat_bonus_rule(...)`.
- `upsert_level_up_stat_bonus_rule_stat(...)`.
- `apply_level_up_stat_bonuses_to_hero(...)`.
- Progression/admin `ui_metadata_entries` content for XP, CP, penalty sink, level-up rewards, stat bonus rules and diagnostics.

### Stats and Character Point allocation

Stat allocation already has a canonical workflow through `save_stat_allocation(...)`.

Angular must not direct-write:

- `hero_stats`;
- `hero.character_points`;
- `character_point_ledger`;
- audit tables.

Plus/minus stat clicks in UI are local draft state and are not audited. The final save is the persistent/auditable mutation.

### XP and Character Points

Core rule: **every XP gain always grants the same gross amount of Character Points**.

This is not configurable as an optional boolean. If a hero gains `40 XP`, the hero also gains `40 Character Points` gross.

If a hero has an active Character Point penalty/debt, newly gained CP may be immediately consumed by the penalty sink. This does not break the XP → CP rule. Ledger/history should show both facts:

- positive CP gain from XP;
- negative CP payment toward active penalty/debt;
- net spendable CP after sink.

### Character Point penalties

CP penalties are modeled through `character_point_penalties`, with total/paid/remaining amounts and status workflow.

Automatic CP penalty sink now exists through `apply_character_point_penalty_sink(...)`.

Rules:

- CP is granted gross first.
- Active payable penalty/debt consumes as much of the newly granted CP as possible.
- `character_point_penalties.paid_amount` / `remaining_amount` are updated.
- CP ledger records gain and sink/payment.
- If a penalty reaches zero remaining amount, status moves to completed according to existing sanction/penalty status semantics.
- Frontend must not call low-level CP helpers directly.

### Experience model

Use:

- `hero.experience` = current XP progress toward next level.
- `hero.total_experience_earned` = lifetime XP earned.

Example:

- level 1, `experience = 80`, `total_experience_earned = 80`;
- gain `40 XP`;
- if next-level threshold is `100`, final state is level 2, `experience = 20`, `total_experience_earned = 120`.

`grant_hero_experience(...)` must be treated as the canonical DB/RPC workflow for this state transition. It evaluates thresholds server-side through `hero_experience_to_next_level`, supports multiple level-ups in one grant, writes `hero_progression_ledger`, grants gross Character Points and routes CP through the penalty sink.

### Level-up rewards

`reward_source_kinds.level_up` is now an active runtime reward source path.

Level-up reward routing supports matching by reached level:

- `any`;
- `exact`;
- `minimum`;
- `range`;
- `interval` / every N levels.

A single reached-level event chooses **one best matching reward profile**. If that level should give several things, they must be represented as multiple `reward_profile_entries` inside one selected reward profile.

Level-up reward profiles must not contain active `experience` entries, to avoid recursive loops:

```text
level-up → XP reward → new level-up → XP reward
```

### Level-up stat bonuses

Level-up stat bonuses are a core progression feature.

They are configurable and must not be hidden only in `metadata_json`.

Important decision: level-up stat bonuses increase the actual base stat values in `hero_stats`, not only separate derived bonuses. This intentionally increases future manual stat upgrade costs and contributes to the Character Point sink.

Examples:

- rule A: every 4 levels, +1 Strength;
- rule B: every 5 levels, +2 Agility;
- at level 20, both rules fire and the hero receives +1 Strength and +2 Agility.

Rules support:

- fixed-stat bonuses;
- random stat-pool bonuses;
- exact/minimum/range/interval level matching.

Actual grants are written to `hero_level_stat_bonus_grants` with before/after stat values.

### Frontend implementation standard for N

Frontend Epic N must consume existing DB/RPC contracts.

Do not implement:

- a second stat allocation workflow;
- a second XP/level-up workflow;
- frontend-only XP threshold mutation;
- frontend-only Character Points ledger mutation;
- frontend-only level-up rewards;
- frontend-only level-up stat grants.

Allowed frontend work:

- read models and mappers;
- stat allocation draft UI using `save_stat_allocation(...)`;
- XP/level display using `get_hero_experience_to_next_level(...)` / formula-backed data;
- progression history UI over `hero_progression_ledger`;
- Character Points ledger/history display over approved read paths;
- level-up reward/stat bonus result display;
- admin/configurator UI for existing progression rules and metadata;
- smoke/reporting over current DB/RPC workflows.

Generated Supabase types must be regenerated after N schema/RPC changes before Angular consumes the new contract.

## Admin Configurator UI Metadata Decisions — 2026-05-02 late

For new feature epics, explainability must be included inside the feature epic, not deferred to `UX-CFG`.

- Section-level runtime meaning and impact should be DB-backed, usually via `ui_metadata_entries`.
- Ordinary field labels, small validation messages and final translation polish may later move to i18n/refactor backlog.
- Domain dictionaries remain the source of truth for dictionary values such as resource types, reward outcome kinds, combat candidate kinds, equipment modes and stats.
- If a frontend reports missing metadata keys, prefer adding the exact missing `ui_metadata_entries` rows or aliases as a content seed rather than hardcoding permanent domain copy in Angular.

Current UI metadata seeds added/expected:

- `encounter_configurator_section` and `encounter_configurator_field` for L12c;
- alias rows for missing L12c keys such as `page_header`, `kind_specific_payloads`, `encounter_key`, `minigame`, per-field difficulty/district keys and reason keys;
- `trial_configurator_section` and `trial_configurator_field` for L11c, including aliases for `page_header`, `trial_meaning`, `trial_key`, `tested_stat`, `minigame`, reward assignment fields and candidate reason/weight;
- `combat_opponent_configurator_section` for M12, including `page_header`, `overview`, `families`, `opponent_definitions`, `baseline_stats`, `natural_attacks`, `equipment`, `manual_equipment`, `generated_equipment`, `scaling`, `usage_candidates`, `empty_state`, and `advanced`.

Do not spend excessive time now perfecting every small label. The mandatory standard is that admin/balancer can understand what a section changes, where runtime uses it, and what the impact is.


## Backlog Split Decisions — 2026-05-02 late

The implementation backlog was split into:

- main feature backlog: active feature/foundation epics;
- `Codex Mythsworn Refactor Backlog`: refactor/cleanup/retro epics.

The refactor backlog uses `Epic Ref A`, `Epic Ref B`, etc. to avoid colliding with the main feature backlog letters. It contains the former R/S/U0/UX/UX-CFG material.

A historical `2026-04-26 Priority Update` block is preserved in the refactor backlog only for classification under Ref B/S cleanup tasks. It is not the current execution order and must not override current epics or current DB/docs.

Future epics such as M, N, equipment and PvP must include their own admin/configurator explainability and should not defer new-feature explainability into UX-CFG. UX-CFG is retrospective only, for already-existing screens.


## Memory Notes / Pending Future Decisions — 2026-05-02 handoff preservation

These notes must be preserved across conversations. They are not current task scope unless the user explicitly promotes the topic. A new conversation should actively remember to bring them up when the relevant domain returns.

### PvP

- Attacks must be limited by allowed level range. A low-level player cannot attack a far higher-level player and vice versa.
- A player cannot attack members of their own guild.
- Attack travel time depends on distance between estates/addresses; nearby targets take less time than far-away targets.
- Spying is shorter than attacking.
- Spying has no level range restriction and can target own guild members, but still uses distance-based travel time.
- Sieges have no level range limit but cannot be declared against own guild members.

### Auctions

- Later design/implement watched auctions and notifications for watched auction events.
- Later design auction rules: minimum bid increment, allowed custom bid amount, timing, and anti-snipe/end-extension behavior.

### Trade Routes / offer slots

- Trade Routes/building level should affect the combined active offer-slot limit across auctions and direct trade.
- A direct trade offer received from another player should not consume the receiver’s slot until the receiver responds with their own counteroffer/commitment.

### Note preservation rule

When these notes are moved into canonical docs as pending/future decisions, they must remain discoverable. If a later conversation starts discussing PvP, auctions or Trade Routes, the assistant should remind the user that these notes already exist.


---

## Rewards / L12-L13 Reward Configuration Decisions — 2026-05-02

The L12/L13 reward smoke showed that a technically writable admin UI is not enough if the admin cannot understand what is being configured. Reward configuration must therefore be treated as a DB-backed, explainable configuration surface, not as raw table editing.

Current reward foundations now include:

1. **L-Reward-DB1 — reward profile/outcome admin foundation**
   - `reward_outcome_kinds` is the DB-backed dictionary for runtime-facing reward outcomes.
   - `reward_profiles` and `reward_profile_entries` have governed admin/balancer RPCs:
     - `upsert_reward_profile(...)`;
     - `deactivate_reward_profile(...)`;
     - `upsert_reward_profile_entry(...)`;
     - `deactivate_reward_profile_entry(...)`.
   - `reward_profile_assignments` validates `source_kind + outcome_kind` against `reward_outcome_kinds`.
   - `source_kind = test` is technical/admin/sandbox only, not normal player gameplay.

2. **L-Reward-DB2 — resource type dictionary**
   - `resource_types` is now the DB-backed source of truth for resource keys such as `drachma`, `materials`, and `workforce`.
   - Resource reward entries, resource payloads, hero resources, ledgers and reward grant entries reference `resource_types`.
   - Angular must not use fallback hardcoded resource lists as the normal source.

3. **L-Reward-DB3 — reward assignment match semantics and formula amounts**
   - `reward_assignment_match_kinds` defines matching modes: `any`, `exact`, `minimum`, `range`.
   - `reward_profile_assignments` now has explicit match semantics for difficulty and district:
     - `difficulty_match_kind`, `difficulty_key`, `max_difficulty_key`;
     - `district_match_kind`, `district_code`, `max_district_code`.
   - Active duplicate assignment scopes are blocked by DB uniqueness. There may be several assignments for the same source/outcome if their scopes differ, but not two active assignments for the exact same source/outcome/target/difficulty/district scope.
   - Reward lookup selects **one best matching reward profile**, not all matching profiles.
   - If one event should grant several things, model that as multiple `reward_profile_entries` inside the selected reward profile.
   - `amount_mode = formula` is now supported for numeric `experience`, `character_points`, and `resource` reward entries and is evaluated server-side.
   - `transfer_formula` remains reserved for future PvP transfer workflows and must not be presented as a normal PvE reward mode.
   - Failure reward assignments are no longer merely decorative: challenge completion may grant a configured failure reward if a matching failure assignment exists. Missing failure assignment means no failure reward.

Reward outcome keys are runtime-facing values scoped by source kind, not normal slugs generated from labels. Adding a new reward outcome kind does not make runtime emit it. The corresponding runtime workflow must explicitly emit that outcome key.

L12c must explain reward assignments in the encounter configurator. L13 must configure reward profiles/entries/outcomes. Both UIs must consume DB-backed `label`, `description`, `helper_text`, and `admin_description` instead of inventing permanent Angular-only copy.

---

## Combat / Epic M Explainability and Readiness Decisions — 2026-05-02

Epic M must be treated as a reusable combat foundation, not just a sandbox screen.

Current combat foundations include:

- **M-DB1:** governed combat opponent admin/balancer write path for opponent families, definitions, stat values, natural attack sources, and equipment blueprint entries.
- **M-DB2:** `persist_combat_result_snapshot(...)` for relational combat result snapshots.
- **M-Dict-DB1:** DB-backed combat explainability dictionaries:
  - `combat_source_type_definitions`;
  - `combat_side_definitions`;
  - `combat_outcome_definitions`;
  - `combat_participant_kind_definitions`;
  - `combat_attack_source_kind_definitions`;
  - `combat_candidate_kind_definitions`;
  - existing/enriched `combat_opponent_equipment_mode_definitions`;
  - enriched `equipment_slot_definitions`.

Combat formulas are explainable and DB-backed:

- `combat_initiative_score` / `combat-initiative-score-default` describes attack-slot ordering. Intelligence is the main tempo stat, Agility contributes lightly, and later attacks are slowed by `attackIndex`.
- `combat_opponent_scaled_stat` / `combat-opponent-scaled-stat-default` scales a single opponent baseline stat by hero level and candidate `difficultyMultiplier`.

Epic M rules:

- Combat core produces a combat result. Source-specific callers interpret consequences.
- Combat does not grant rewards, complete trials, apply PvP consequences, publish reports, or create notifications.
- `persist_combat_result_snapshot(...)` persists the snapshot only. It is not anti-cheat validation and does not prove the result was production-authoritative.
- Sandbox/admin-test combat may use the Angular combat resolver as a test surface.
- Production gameplay callers (`encounter`, `trial`, `pvp`) must not silently persist arbitrary Angular-computed combat results as final authoritative truth unless a backend/RPC validation/finalization boundary explicitly approves that path.
- No `hero_derived` dependency is allowed.
- Opponent equipment entries are fight-local item-like blueprints/loadouts and must not create player-owned `items`.
- Current DB may contain zero opponent families/definitions/stat values/attack sources/equipment entries. This is not a DB blocker: M12 must support empty state and create the first rows through canonical RPCs.

Epic M frontend work may begin after generated Supabase types are regenerated and M0 confirms the new M-DB1/M-DB2/M-Dict-DB1 tables/RPCs are visible.

---

## Admin Configurator Explainability Standard — 2026-05-02

Every epic that introduces or consumes admin-configurable gameplay objects must include the admin/operator/balancer explanation surface for those objects.

Admin UI must explain:

- what the object configures;
- where it is used;
- whether it is global, server-scoped, selected-entity-scoped, reusable library content, or technical metadata;
- what runtime/gameplay effect the configuration has;
- which DB dictionary/helper/admin text is displayed;
- which mutation path/RPC owns durable changes.

Raw keys/UUIDs are secondary metadata only. Missing or weak DB dictionary text must be reported as a DB/content seed gap, not hidden by permanent hardcoded Angular copy.

After Epic M, return to `/admin/exploration-trials` for a trial-editor explainability/layout pass analogous to L12c. Later, create/run a dedicated `UX-CFG` epic for a systematic explainability sweep of all admin/configurator screens.

---

---

## Combat / Epic M DB-RPC Completion Decisions — 2026-05-02

Epic M must be treated as a reusable combat foundation, not merely a sandbox screen. Two missing DB/RPC contracts were added after pre-flight:

1. **M-DB1 — combat opponent admin configurator foundation**
   - Combat opponent families, definitions, stat values, natural attack sources and equipment blueprint entries now have governed admin/balancer RPCs.
   - Frontend must use these RPCs rather than direct writes to `combat_opponent_*` tables.
   - RPCs require authenticated user context, config-governance permission and a non-blank reason.
   - Admin SELECT policies for combat opponent configuration tables are gated through `can_manage_config_governance(null)`.
   - Opponent equipment is blueprint/fight-local configuration only. It must not create normal player-owned `items` rows.

2. **M-DB2 — combat result snapshot persistence**
   - Combat result persistence now has canonical RPC `persist_combat_result_snapshot(...)`.
   - The RPC persists combat result header, participant snapshots, participant stat snapshots and attack rows.
   - The RPC intentionally does **not** grant rewards, complete trials, apply PvP consequences, publish reports or create notifications. Callers own those workflows.
   - Combat result read access is controlled through `can_read_combat_result(...)`, allowing config-governance staff and authenticated owners of hero participants.

Combat source types remain generic: `encounter`, `trial`, `pvp`, `sandbox`, `admin_test`. Combat core produces a result; source-specific callers interpret the result.

After these DB/RPC additions, Codex can implement Epic M without hidden DB blockers for M9 result persistence or M12 opponent admin configuration, provided generated Supabase types are regenerated first.

---

## Exploration / L12b Resource and Effect Payload Decisions — 2026-05-02

The L12b blocker was real: encounter definitions supported `resource`, `buff` and `debuff` kinds, but there was no typed DB-backed payload configuration for those non-combat encounter types.

L12b DB foundation now exists:

- `encounter_resource_payloads` — typed resource payload rows for resource encounters;
- `encounter_effect_payloads` — typed links between buff/debuff encounters and exploration effect definitions;
- `exploration_effect_definitions` — reusable exploration buff/debuff effect definitions with governed admin write path.

Canonical L12b admin/balancer RPCs:

- `upsert_encounter_resource_payload(...)`;
- `deactivate_encounter_resource_payload(...)`;
- `upsert_encounter_effect_payload(...)`;
- `deactivate_encounter_effect_payload(...)`;
- `upsert_exploration_effect_definition(...)`;
- `deactivate_exploration_effect_definition(...)`.

Rules:

- Resource encounter payloads are valid only for `encounter_kind = resource`.
- Effect encounter payloads are valid only for `encounter_kind = buff` or `encounter_kind = debuff`.
- Effect payload kind must match the linked `exploration_effect_definitions.effect_kind`.
- Resource payload amount modes are typed as `fixed`, `range` or `formula`.
- Formula-backed payloads reference `balance_formulas`; fixed/range payloads require ordered min/max amounts.
- Chance percent must remain within 0..100.
- `metadata_json` remains technical extension data and must not become the authoritative gameplay contract for resource/effect behavior.
- Mutations require authenticated user context, config-governance permission and a non-blank reason.

Smoke verification passed with rollback: a resource encounter accepted one resource payload, and a buff encounter accepted one effect payload. The resulting smoke summary was:

- `smoke_resource_encounter`: `resource_payloads = 1`, `effect_payloads = 0`;
- `smoke_buff_encounter`: `resource_payloads = 0`, `effect_payloads = 1`.

L12 UI should now expose kind-aware payload sections instead of leaving resource/effect configuration as pending or encoding behavior in arbitrary metadata JSON.

---

## Current Known Foundation Gaps — 2026-05-02

These are not part of Epic M/L12b execution unless explicitly promoted, but they remain important planning gaps:

- Equipment equip/unequip workflow: `hero_equipment` exists, but player-facing equip/unequip needs an approved DB/RPC workflow before Angular mutates equipment state.
- PvP MVP: combat/report foundations can support PvP sources, but target selection, attack limits, protection, resource stealing/loss, cooldowns and PvP report production still need a dedicated epic/DB workflow.
- Auction watchers: future side note, not current work.
- Auction rules/configuration: future side note, not current work.

---

## Working Standard / Dictation and Source Discipline — 2026-05-01

User input may be dictated, so transcription mistakes should be interpreted carefully. Obvious wording/order slips such as `UX/UI` vs `UI/UX`, malformed words or repeated fragments should be treated as likely dictation noise unless the user explicitly frames them as a new decision.

Do not convert a wording accident into a project decision. If a phrase appears suspicious or conflicts with current project files, check the current dump/docs and resolve conservatively.

Do not say that an epic or domain is “ready” merely because a table, seed or runtime helper exists. For admin configurators, check the full path: table/read policy, canonical RPC/write path, governance permission, audit/reason handling, generated types and frontend route scope.

The current collaboration mode is: decide business/domain semantics, prepare DB/RPC/schema foundations, then let Codex implement frontend slices against those contracts.

If the user mentions notes for memory, treat them as side notes or unrelated reminders. Do not move active task details, current Codex instructions or live decision material into those side notes.

---

## Project Name and Terminology

The canonical project/game name is **Mythsworn**.

Older names such as Monster Hunt, MythHunter, MythBurn or Mythos Hunter may appear in legacy files. Do not use them as current canonical naming in new documentation, UI labels or Codex prompts unless explicitly referencing old source material.

Canonical gameplay terms:

- Exploration;
- Trial opportunity / Trial appearance;
- Trial manifestation;
- Trial completion;
- Encounter;
- Prestige;
- Health;
- Character Points.

Do not casually rename the main PvE loop back to “monster hunt” in implementation language.

---

## Exploration / L11 Trial Admin Configuration Decisions — 2026-05-01

Trial definitions and trial combat candidates have a canonical DB/RPC write path for admin/balancer tooling.

Current RPCs:

- `upsert_trial_definition(...)` — create/update `trial_definitions`;
- `upsert_trial_combat_candidate(...)` — create/update `trial_combat_candidates`;
- `deactivate_trial_combat_candidate(...)` — deactivate a trial combat candidate.

Frontend must not direct-write `trial_definitions` or `trial_combat_candidates`.

These RPCs require authenticated user context, config-governance permission and a non-blank reason.

`trial_definitions.minigame_key` is the source of truth for trial minigame routing. Combat candidates may be edited only for trial definitions with `minigame_key = combat`.

Candidate kind rules:

- `opponent` candidate requires `opponent_definition_id` and null `family_key`;
- `family` candidate requires `family_key` and null `opponent_definition_id`;
- `difficulty_multiplier` and `weight` must be positive;
- min/max hero level constraints, if present, must be valid and ordered.

Exploration read policies exist for active difficulty tiers and owner-readable runtime exploration tables. These are read-only policies. Persistent exploration mutations still use canonical PvE RPCs.

The previous L11 read-only inspector blocker was real before these RPCs existed. After this DB foundation, Codex can convert L11 into a write-capable configurator using these RPCs.

---

## Exploration / L12 Encounter Admin Configuration Decisions — 2026-05-01

Encounter definitions now have a canonical DB/RPC write path for admin/balancer tooling.

Current RPCs:

- `upsert_encounter_definition(...)` — create/update `encounter_definitions`;
- `deactivate_encounter_definition(...)` — deactivate an encounter definition;
- `upsert_encounter_combat_candidate(...)` — create/update `encounter_combat_candidates`;
- `deactivate_encounter_combat_candidate(...)` — deactivate an encounter combat candidate;
- `upsert_encounter_description_variant(...)` — create/update `encounter_description_variants`;
- `deactivate_encounter_description_variant(...)` — deactivate an encounter description variant;
- `upsert_reward_profile_assignment(...)` — create/update `reward_profile_assignments`;
- `deactivate_reward_profile_assignment(...)` — deactivate a reward profile assignment.

Frontend must not direct-write `encounter_definitions`, `encounter_combat_candidates`, `encounter_description_variants` or `reward_profile_assignments`.

These RPCs require authenticated user context, config-governance permission and a non-blank reason.

Encounter kind rules:

- supported `encounter_kind` values are `combat`, `resource`, `buff` and `debuff`;
- `nothing` is a step outcome, not an encounter definition;
- `combat` encounters may have combat candidates;
- non-combat encounters must not receive combat candidates;
- buff/debuff encounters must respect the runtime rule that only one active exploration effect is active at a time.

Encounter combat candidate rules:

- candidate kind `opponent` requires `opponent_definition_id` and null `family_key`;
- candidate kind `family` requires `family_key` and null `opponent_definition_id`;
- `difficulty_multiplier` and `weight` must be positive;
- min/max hero level constraints, if present, must be valid and ordered;
- candidate scaling may use `scaling_formula_id`, otherwise runtime can fall back to opponent/default scaling rules.

Reward assignment rules:

- L12 UI should use `reward_profile_assignments` as the real reward assignment surface, not only `encounter_definitions.reward_profile_id`;
- for encounter rewards, use `source_kind = encounter`;
- `source_kind = encounter` may use `encounter_definition_id` and must not use `trial_definition_id`;
- `source_kind = trial` may use `trial_definition_id` and must not use `encounter_definition_id`;
- source kinds other than `trial`/`encounter` must not use trial or encounter definition ids;
- `outcome_kind` is a key-like value, not a free-form label.

Admin SELECT policies now exist for the L12 admin/balancer read path. Mutations still go through RPCs only.

After this DB foundation, Codex can implement L12 as a write-capable encounter configurator, provided generated Supabase types are refreshed and the UI uses the canonical RPCs.

---

## Exploration Core Completion Decisions — 2026-05-05

Epic W is **Exploration Core Completion**. Its purpose is to finish the core exploration runtime so that normal gameplay can progress through direction choice, step timing, step result, Trial / Encounter / Nothing, resolution or immediate outcome, reward/effect, and continued exploration without dead states.

### Canonical vocabulary

- Canonical player/domain terms are `Trial`, `Encounter`, `Nothing`, `Combat`, and `Minigame`.
- Do not use `Challenge` as a player-facing or planning-facing canonical term for this scope.
- If the database stores technical attempt/state rows, UI copy and domain documentation should still present them as a Trial or Encounter.
- `Nothing` is a step outcome. It is the deterministic result when the Trial opportunity roll and Encounter roll both fail; it is not an Encounter definition and not an independent RNG roll.

### Runtime eligibility

Normal exploration runtime may select only active and complete Trial / Encounter definitions.

A Trial is runtime-complete only when:

- the Trial definition is active;
- it has a supported resolver/minigame or an explicit auto-resolve-only mode;
- it has a reward assignment;
- any required combat candidate or minigame configuration is eligible;
- it has no blocking configuration/readiness error.

An Encounter is runtime-complete according to its kind:

- `combat` Encounter requires at least one eligible combat candidate and a reward assignment;
- `resource` Encounter requires a valid resource reward/payload;
- `buff` Encounter requires a valid buff/effect payload;
- `debuff` Encounter requires a valid debuff/effect payload.

Resource Encounter is a reward Encounter. Buff Encounter is complete when it grants a buff. Debuff Encounter is complete when it applies a debuff; this is the only intended negative exploration outcome. Do not introduce a generic penalty/consequence category for normal exploration.

Misconfigured Trials and Encounters may exist in admin configuration, but they must be excluded from normal runtime selection. Adding incomplete future content must not break player gameplay. Once a Trial or Encounter is fully configured, it may enter the eligible runtime pool automatically.

### Resolution and blocking

- An unresolved active Trial or Encounter blocks starting the next exploration step.
- If a Trial or Encounter requires resolution, the UI must expose a working manual resolve action, auto-resolve action, or explicit auto-resolve-only flow.
- A visible `Trial is ready` / equivalent state without a working resolve action is a blocker.
- Resource Encounters and effect Encounters should use their own outcome/reward/effect flow and must not pretend to be a manual minigame.
- Force outcome / force resolve tooling is outside Epic W.

### Sandbox tester/admin tools

Testing tools for Epic W are allowed only on sandbox servers and only for authorized tester/admin/staff contexts. They must not be visible or usable on live/standard gameplay servers.

Epic W sandbox tools should include:

- add daily Trial attempts / remaining Trial actions;
- skip or finish the current exploration step timer.

The tester UI should show the current available Trial count and allow the tester to increase it and confirm the change without leaving the exploration testing flow.

### Step timing configuration

Exploration step duration must be DB/config-owned and must not be hardcoded in Angular.

Epic W must verify and make discoverable:

- base exploration step duration;
- difficulty step duration multiplier;
- any additional step duration multiplier currently in use;
- global or server overrides, if present.

If this configuration already exists, admin/balancer UI should make it findable and understandable. If it is missing or ambiguous, that is a DB/config gap for the migration track.

### Readiness, diagnostics and admin clarity

Epic W needs one DB/RPC-owned readiness/eligibility model for Trial and Encounter definitions so runtime selection and admin diagnostics use the same rules.

The system should expose stable reason codes for incomplete definitions and DB-backed metadata/labels/descriptions for those reason codes. Angular should display DB-backed labels/copy rather than inventing a separate hardcoded reason-label system.

Admin/balancer UI must clearly show which Trials and Encounters are fully wired and which are incomplete. Incomplete status should show concrete reasons such as inactive definition, missing resolver, unsupported minigame, missing reward assignment, missing combat candidate, no eligible combat candidate, candidate level mismatch, missing resource payload, missing effect payload, or missing config.

Sandbox/tester diagnostics should show the useful selection story without dumping a huge full pool by default:

- what the step rolled or attempted to select;
- if an incomplete definition would have been selected, why it was skipped;
- what eligible definition replaced it, if any;
- whether the final outcome was Trial, Encounter or Nothing.

A collapsed/full debug payload may expose deeper pool and roll details for tester/admin use.

### Reward and item drop path

Reward/drop behavior must be tested through the real exploration runtime, not only through the admin item generator.

- Successful Trials and eligible reward Encounters route through reward profile/assignment workflows.
- If a reward is configured to generate an item, it must create a real `items` row.
- The generated item must be visible through the item/armory read path.
- Refreshing the page must not grant or generate the same reward a second time.
- Reward display should read durable DB result data, not transient frontend-only state.
- If an expected reward is missing, or item generation fails, UI/admin diagnostics must show the reason when the database knows it.

### Minimal smoke content

Epic W should ensure or repair minimal working content rather than creating duplicates when existing definitions can be fixed:

- one complete Combat Trial;
- one complete Combat Encounter with XP reward;
- one complete Resource Encounter with resource reward;
- one complete Buff Encounter with buff/effect payload;
- one complete Debuff Encounter with debuff/effect payload;
- a Trial reward assignment that can generate an item through the real reward/item generation path.

### Frontend copy and error handling

Frontend copy touched by Epic W should prioritize Polish for player, tester and admin feedback. Error handling is part of the contract: missing resolver, missing reward, failed reward grant, failed item generation, skipped configuration or unavailable action must be communicated clearly instead of failing silently.

---

## Formula Runtime Decisions — 2026-05-01

`balance_formulas` and their assignments are the source of truth for configurable gameplay formulas.

Frontend formula runtime is preview/explainability tooling. It is not authoritative for durable gameplay mutations.

Any DB/RPC/backend workflow that persists gameplay state must evaluate assigned formulas server-side when the result affects durable state.

Examples: building upgrade cost/time, stat upgrade cost/cap validation, XP-to-next-level validation, combat/opponent scaling where persisted, reward/challenge resolution where formula-backed, and future PvP/siege/resource calculations.

Current DB-side formula runtime foundation includes:

- `evaluate_balance_formula_expression(...)`;
- `evaluate_balance_formula_target(...)`;
- `formula_round_up(...)`;
- `formula_round_down(...)`;
- `formula_clamp(...)`;
- `formula_random()`;
- `formula_random(min, max)`.

If a new authoritative workflow needs formula evaluation and the current helper subset is insufficient, extend the approved DB/backend formula runtime instead of duplicating formula expressions in ad hoc RPC helpers or Angular.

---

## Estate / Buildings Runtime Decisions — 2026-05-01

Empty estate addresses are not rows. The database stores occupied estates only.

`district_code + address_number` is the source of truth for estate address identity.

`estates.address` remains legacy/display compatibility. New code should format addresses from `district_code + address_number`. When the final code dependency on `estates.address` is removed, Codex must report it as a DB cleanup candidate.

Current district capacity values:

- A = 5000;
- B = 3000;
- C = 500;
- D = 50;
- E = 1.

Moving to an empty address is destructive and DB-owned through `relocate_hero_estate_to_empty_address(...)`. It deletes the current estate row and its buildings/jobs via cascade, then creates the new estate at the selected empty address. It is not siege/takeover.

Siege/takeover of an occupied estate is a future guild/PvP workflow and must not delete estate/building state as if it were a relocation.

If an estate changes owner during a successful siege/takeover while an estate building job is active, the building job is interrupted/cancelled. The building remains at the level it had before the job started. The active construction job does not transfer together with the estate.

Relocation and future siege/takeover cooldowns are DB/config-owned, not frontend constants:

- A hero that completes an active estate relocation cannot actively relocate again for a configurable duration. Default: 12 hours.
- A hero that completes a siege/takeover-driven estate move as the initiator cannot start another outgoing siege/takeover for a configurable duration after the move/process completion. Default: 12 hours.
- A defender affected by a completed, interrupted, cancelled or repelled incoming siege/takeover receives a configurable protection window against new incoming sieges/takeovers. Default: 12 hours.
- Defender siege/takeover protection blocks new incoming sieges/takeovers but does not block that hero from initiating an outgoing siege/takeover.
- An active incoming siege/takeover blocks voluntary relocation by the target owner/hero; the defender cannot escape a contested estate to deny the attacker the estate/building outcome.
- Siege/takeover-specific protection is separate from ordinary PvP attack target protection.


Building construction/upgrades are DB-owned:

- one active `estate_building_jobs` row per estate;
- player-facing cancel is not part of MVP;
- `finalize_completed_estate_building_jobs(...)` lazy-finalizes completed jobs;
- `start_estate_building_upgrade(...)` evaluates assigned building formulas server-side, spends resources through `hero_resource_ledger`, creates a job and writes audit.

Building UI may preview formulas, but authoritative cost/time is calculated in the RPC.

---

## Game Reports / Epic P Decisions — 2026-05-01

Game reports are player-facing gameplay reports, not audit logs and not player abuse reports.

A report should reproduce the same core event view the player saw in-game. The private Reports UI renders it inside the normal application shell; the public link renders the same report content without the app shell.

Public report route is conceptually `/report/:publicToken`. Use `game_reports.public_token` instead of exposing internal report ids.

Game reports are shared per event. Multiple heroes can have private access to the same report through `game_report_hero_access` with roles `owner`, `participant` or `viewer`.

Removing a report from a hero's Reports list removes that hero access row. If it was the final access row, the report row is deleted and the public token stops resolving. This is gameplay/report cleanup, not audit deletion.

Current report type dictionary values include:

- `combat`;
- `trial`;
- `encounter`;
- `pvp_combat`;
- `siege`.

Combat report production wraps `combat_results`. Combat reports must not duplicate combat attack rows; renderers should read the durable combat result snapshot tables.

Trial and encounter reports should later wrap challenge/encounter outcomes, reward grant data and optional combat sections. PvP and siege report producers belong to future PvP/siege epics.

Reward/drop item references are public showcase item references. If the dropped item still exists, renderers should prefer the live `items` row and current balanced item card. If the item row is gone, renderers fall back to saved quality/base/prefix/suffix component refs and fallback display name.

Reward/drop report references intentionally do not snapshot final item stats forever. Reports show the living item when it still exists, not a frozen pre-rebalance stat card.

Combat attack source labels can be public, but full private player equipment/loadouts must not be exposed by default. Drop rewards are showcase items; used weapons/equipment are not automatically full public item cards.

---

## Notifications / Epic Q Decisions — 2026-05-01

Notifications are persistent inbox/bell entries for short attention or status events.

Notifications are not game reports, audit logs, player abuse reports or local UI-only toasts/messages.

The DB notification row is the durable source. A toast is only frontend presentation of a fresh notification row when the recipient is online and the notification type has `default_toast_enabled = true`.

Reports have their own Reports inbox and unread badge. Do not create default `game_report.created` notifications for ordinary report creation.

Recipient kinds:

- `user` — account/global notification;
- `hero` — gameplay/server/hero notification;
- `staff` — staff/server-work notification.

Notification severity values:

- `info`;
- `notice`;
- `warning`;
- `critical`.

Frontend must not insert notification rows directly. DB/RPC workflows create notifications through `create_notification(...)`. Frontend may call `mark_notification_read(...)` and `dismiss_notification(...)` for current-user notifications.

DB-owned hooks currently cover direct trade, auctions, declarations, abuse report decisions, anti-abuse case attention, sanctions and Character Points penalties.

Notification body/title/action URLs are concise attention messages. They are not historical item/report snapshots.

---

## Combat / Epic M Decisions

Combat is one reusable module, not multiple combat types. Exploration encounter combat, trial combat, PvP, sandbox and future systems provide combatants and interpret the result, but the core combat rules stay the same.

Combat receives combatants and produces a combat result. It does not decide rewards, trial completion, PvP consequences, cooldowns or public report publishing. The caller interprets the result.

Combat is limited by global product rule `combat_turn_limit`, currently defaulting to 10 full turns. One turn is a full round of eligible attack slots from both sides unless someone is defeated earlier. Draw occurs if no side is defeated before the turn limit.

Combat uses side names `initiator` and `defender`. Outcomes are `initiator_victory`, `defender_victory` and `draw`.

Attack slots are ordered by formula target `combat_initiative_score`. Higher score acts earlier; exact ties are won by the initiating side.

Critical damage is formula/bonus-driven: hardcoded x2 is not target architecture.

Admin-defined opponents:

- one opponent belongs to one family;
- encounter/trial combat candidates may point to a concrete opponent or a family;
- candidate scaling formula and `difficulty_multiplier` let the same opponent/family scale differently in encounter and trial contexts;
- opponent equipment can be `none`, `manual` item-like blueprint or `generated` item-like loadout materialized only for one fight;
- generated opponent equipment must not create normal player-owned `items` rows.

Combat result persistence should be relational and report-ready: result header, participant snapshots, participant stat snapshots and one row per resolved attack.

---

## Item Generation and Luck Decisions

Items use a layered identity: quality + optional prefix + base item + optional suffix.

Quality changes value and power. Prefix and suffix have independent value and gameplay impact.

High economic value does not guarantee direct usefulness. A player may drop a valuable but awkward item; that is intentional for economy and long-term trade.

Luck should improve opportunities, not guarantee perfect rewards. It can influence value bucket, quality and affix chances, but a full Luck strategy must carry opportunity costs in challenge success.

Item requirements are a critical progression safety valve. A player may obtain an item before being able to equip it.

---

## Item / Equipment / Armory Decisions — 2026-05-04

### Item identity and ownership

- Items use a layered identity: quality + optional prefix + base item + optional suffix.
- Item ownership changes through `items.hero_id`; items are not copied on transfer.
- `hero_equipment` is the source of equipped state.
- There is no `items.status = equipped`.
- Frontend must not mutate `hero_equipment` directly.
- Equip/unequip must go through canonical DB/RPC workflow.

### Equipped item statuses and market locks

- An item may be equipped if it belongs to the hero and is not `scrapped`.
- Equipped usable item statuses are:
  - `active`;
  - `locked_trade`;
  - `locked_auction`.
- `locked_trade` and `locked_auction` reserve the item for trade/auction workflow. They block listing the same item elsewhere and block scrap/vendor sale, but they do not block wearing the item.
- Locked items still count for current loadout and runtime equipment effects while they remain in `hero_equipment`.
- Trade/auction lock does not automatically unequip the item.
- Ownership transfer or scrap clears the item from the previous owner's `hero_equipment`.
- A player may manually unequip locked items. There are no cursed/non-removable items in the current equipment foundation.
- Unequip does not change item ownership, item status or trade/auction lock state.

### Scrap, vendor sale and recovery

- Active equipped items may be scrapped or sold to vendor; this auto-unequips the item.
- UI should not require confirmation for every scrap/vendor sale, because players may clean many items.
- Items without affixes are hard-deleted from the database on scrap.
- Items with affixes move to `scrapped` state on scrap and are recoverable only through staff/admin/operator workflow.
- Scrapped affix items are automatically cleaned after a retention period.
- Default scrapped-affix-item retention is 30 days.
- Scrapped-affix-item retention is configurable from admin configuration.
- Historical references such as trade offers, counteroffers, reports or other records do not justify retaining no-affix items.
- Staff/admin recovery, transfer, sanction and lifecycle corrections must be audited.
- Normal player equip/unequip changes are not classic audit-log workflows.
- Player equip/unequip RPCs must not require user-provided reason. Optional technical `request_id` is acceptable.

### Item requirements

- Item requirements are equip/use requirements, not item generation requirements.
- Item requirements apply to normal equip and bulk equip.
- Item requirements are checked at equip time.
- If a hero later stops meeting requirements, already equipped items remain equipped.
- Item requirements may use hero level and primary/base stats.
- Item requirements do not use resources, prestige, building level, district access or trade routes.
- Item instance requirements are not part of the system. Concrete `items.id` rows must not have arbitrary unique requirements.
- Requirements derive from definitional item layers:
  - base;
  - prefix;
  - suffix;
  - quality requirement multiplier.
- Requirements from base/prefix/suffix are aggregated by a global item requirement rule.
- The highest requirement is the base; lower requirements add configurable partial contributions.
- Quality has a separate requirement multiplier independent from quality bonus/value multiplier.
- Requirement calculation order is: aggregate base/prefix/suffix requirements, then apply quality requirement multiplier.
- Exact formulas, coefficients, rounding and config storage are DB/balancer implementation details, but the global semantic rule above is the target.
- Candidate item bonuses cannot help that same item meet its own requirements.
- Already equipped items may help meet requirements for another item.
- Items equipped earlier in a bulk operation may help later items.

### Item bonuses and runtime loadout

- Item bonuses from base/prefix/suffix sum absolutely.
- Example: prefix `+5 Strength` and suffix `+10 Strength` result in `+15 Strength`.
- Runtime loadout usable statuses are `active`, `locked_trade`, and `locked_auction`; `scrapped` is excluded.
- Any resolver that ignores equipped `locked_trade` or `locked_auction` items is inconsistent with current decisions and must be corrected.
- Equipment affects PvE, PvP, combat/autoresolve, manual combat, spy snapshots and runtime hero capability.
- PvE/PvP checks use current loadout at the relevant resolve/check moment.
- Manual combat must do per-turn loadout/stat checks.

### Slot compatibility and normal equip

- `item_generation_bases.base_type_key` is the source of truth for equip slot compatibility.
- `item_generation_bases.slot` is legacy/deprecated for equip workflow.
- One item cannot occupy multiple slots.
- One slot cannot contain multiple items.
- Normal equip may receive an explicit `slot_key`.
- With explicit `slot_key`, RPC attempts the literal target slot if compatible.
- Without explicit `slot_key`, RPC uses default behavior for the item base type:
  - one-handed weapon: hand rotation;
  - ring: ring rotation;
  - two-handed/ranged weapon: `main_hand`;
  - shield: `off_hand`;
  - single-slot armor/jewelry pieces: their matching slot.
- A failed normal equip must not remove the currently equipped item being replaced.
- RPC results must be readable enough to show what was equipped, shifted, unequipped, failed or skipped, plus final equipment state. The exact payload shape is a DB/RPC implementation detail.

### Hand slots

- Hand slots are `main_hand` and `off_hand`.
- Two-handed and ranged weapons use both hands and are stored in `main_hand`.
- Shields are off-hand only.
- One-handed weapons use hand slots.
- Equipping a two-handed or ranged weapon removes current `main_hand` and `off_hand` items as needed, then equips the new item in `main_hand`.
- Equipping an off-hand item while a two-handed/ranged weapon is equipped removes the two-handed/ranged weapon first, then applies the off-hand equip result.
- One-handed weapon rotation is deterministic:
  - current `off_hand` moves to `main_hand`;
  - new item goes to `off_hand`;
  - old `main_hand` is unequipped.
- If only one hand slot is occupied, a one-handed weapon fills the other hand where possible.
- If hands are empty and no explicit slot is passed, a one-handed weapon uses `main_hand` by default.

### Ring slots

- Ring slots are `ring_1` and `ring_2`.
- Rings use deterministic rotation analogous to one-handed weapons:
  - current `ring_2` moves to `ring_1`;
  - new ring goes to `ring_2`;
  - old `ring_1` is unequipped.
- If an explicit ring slot is passed, RPC replaces that literal slot if compatible.

### Bulk equip

- Bulk equip processes items in explicit input order.
- Bulk equip equips what can be equipped and reports failures.
- Failure of one item does not stop the whole bulk operation.
- Failed bulk items should not unnecessarily remove current equipped items.
- Each step sees the loadout produced by earlier successful steps.
- Bulk result must report equipped, shifted, unequipped, failed/skipped entries and final equipment state.

### Presets / loadout presets

- The word `set` is reserved for future item set bonuses.
- Saved equipment configurations are called `preset` / `loadout preset`.
- Presets are a convenience workflow, not an item-set-bonus mechanic.
- Presets store exact `item_id` values per literal slot.
- Presets do not match by name, base, quality, prefix, suffix or other similarity.
- Preset apply uses literal saved slots and does not use hand/ring rotation.
- Preset apply equips available items from the preset and does not touch the rest of the current equipment.
- Preset apply can partially succeed.
- Preset preview should show which saved items the hero has, which are missing/unavailable, and their saved slots.
- A preset that was legal when saved may re-equip the same exact item IDs without rechecking item requirements.
- Preset privilege survives sale/transfer away and later reacquisition of the same item ID.
- Presets can be edited, renamed, cleared or overwritten.
- Presets are not deleted; a hero has a fixed number of preset slots.
- Target range is 5–10 presets per hero; the final count should be a flat configurable value, not a formula.
- Presets should be stored relationally, not as JSON authority.

### Armory shelves

- Armory shelves are inventory organization, not equipment state.
- DB/code may use `shelf`; final UI naming belongs to UI/UX backlog.
- There are always 10 player-organizable shelves, numbered `1` through `10`.
- Dropped/newly generated items enter shelf `0`, meaning unsorted / no player shelf.
- Shelf `1` through shelf `10` are player organization shelves, not the default drop bucket.
- `hero_armory_shelves` stores hero-local shelf names for shelves `1` through `10`.
- `items.armory_shelf_position` stores the item shelf number; `0` means unsorted/no shelf.
- Item shelf number persists when the item transfers to another hero, even though that hero may have a different local name for that shelf number.
- Armory building level affects how many items are visible in the armory.
- Items outside the visible range do not disappear. Items disappear only through explicit scrap/transfer/lifecycle workflow.

---

## Guild Foundation Decisions — 2026-05-04

The first guild foundation should be deliberately simple. Guilds primarily support shared item logistics, future Argonautics/group expeditions, and future siege/defense support. Do not turn guilds into a broad parallel progression empire by default.

### Scope and explicit non-goals

- Guilds support:
  - membership;
  - roles;
  - invite/request-to-join;
  - guild armory loans;
  - emergency leader election;
  - future hooks for siege and Argonautics.
- Guilds do not currently implement:
  - guild-to-guild diplomacy;
  - alliances;
  - non-aggression pacts;
  - war declarations as a separate diplomacy system;
  - district influence;
  - guild reputation;
  - guild buildings in the first foundation;
  - generic assistance by arbitrary non-guild friends.
- Guild actions do not affect a member's private Prestige/reputation in the first foundation.
- Help from other players in siege/defense or Argonautics should be organized through guild membership. Solo attempts may exist, but group support uses the guild.

### Guild identity, creation and membership

- A guild is server-scoped.
- Guild membership is hero-based, not user-based.
- A hero may belong to only one guild on a server.
- Any active hero without a guild may create a guild.
- Creating a guild has a cost. Exact resource/currency/config belongs to DB/balance implementation.
- Guild name must be unique on the server.
- If guild tags are introduced, they should also be unique on the server.
- Guild membership can be started through either:
  - guild invite;
  - request-to-join.
- Invite and request-to-join are both first-foundation flows, not deferred features.
- A leader cannot simply leave the guild. The leader must dissolve the guild or transfer leadership through an approved workflow.

### Member limit

- Guild member capacity depends on the leader hero's level.
- Member capacity is calculated through admin-configurable formula/config.
- The exact config/formula model belongs to DB/balance implementation.
- Inactive leaders create a real growth problem because their level does not increase and therefore guild capacity does not grow; emergency leader election exists partly to solve this.

### Roles and permissions

- First-foundation roles are:
  - `leader`;
  - `officer`;
  - `member`.
- There is one officer.
- The leader has full guild permissions.
- The leader can dissolve the guild.
- The leader can promote one officer.
- The officer acts as the leader's deputy.
- The officer may:
  - invite members;
  - accept/reject join requests;
  - kick members;
  - remove items from guild armory;
  - force-return borrowed guild armory items;
  - block/unblock guild armory access per member.
- The officer cannot dissolve the guild.
- Members may use guild armory unless their guild armory access is blocked.

### Emergency leader election

Emergency leader election is a recovery tool for inactive leadership. It is not a normal vote to remove an active leader.

- Any current guild member may start an emergency leader election if the leader is inactive.
- Leader inactivity is based on the leader hero's last activity.
- Default leader inactivity threshold is 15 days.
- The inactivity threshold is configurable.
- Emergency election chooses a new leader; it does not merely vote to remove the old one.
- Election has two phases:
  - nomination phase: default 6 hours;
  - voting phase: default 12 hours.
- Phase durations are configurable.
- Maximum candidate count defaults to 3 and is configurable.
- Any current member except the inactive leader can be nominated as a candidate.
- Candidate consent is not required.
- Members vote if they want and manage to do so before voting ends.
- There is no quorum.
- There is no 50% + 1 requirement.
- The candidate with the most votes when voting ends becomes the new leader.
- Ties are resolved by earlier nomination time.
- The result automatically changes guild leadership at the end of voting.
- Eligible voters are current guild members who can normally access gameplay. Banned/suspended users should be blocked by normal access rules.

### Guild armory nature

- Guild armory is a lending/borrowing system, not trade.
- Depositing an item into guild armory does not change `items.hero_id`.
- The item owner remains the owner.
- Borrowing an item does not transfer ownership.
- Borrowed guild armory items may be equipped.
- Borrowed guild armory items count in runtime loadout.
- Borrowed guild armory items may appear in loadout presets.
- If a preset references guild-borrowed item IDs that later become unavailable, that preset can partially fail/break as expected.

### Guild armory deposit, withdraw and removal

- Any member with guild armory access may deposit their own item into guild armory.
- An equipped item cannot be deposited into guild armory. The owner must unequip it first.
- Deposit does not auto-unequip.
- A deposited item keeps its shelf number.
- The owner may withdraw their own item from guild armory at any time.
- The leader may remove any item from guild armory.
- The officer may remove any item from guild armory.
- Removing an item from guild armory is not confiscation and does not change ownership. The item returns to the owner's private state.
- Removal exists to prevent guild armory spam with junk items.
- If the removed/withdrawn item is currently borrowed, the loan ends and the borrower loses access/equipment at the next relevant refresh/check.

### Guild armory borrowing and access control

- Any member may borrow items unless their guild armory access is blocked.
- Guild armory access can be blocked per member.
- The leader can block/unblock guild armory access per member.
- The officer can block/unblock guild armory access per member.
- A blocked member cannot borrow new items and should not deposit new items.
- A blocked member can still return borrowed items.
- A borrower cannot sell, trade, auction, scrap or vendor-sell a borrowed item.
- The owner can still sell, trade, auction, scrap, withdraw or force-return their own item.
- If the owner wants to use their own deposited item, they withdraw it from guild armory first, then equip it normally.
- Deposited items are not simultaneously private-equipped by the owner and borrowable by others.

### Force return and loan lifecycle

- The item owner can force-return their own borrowed item for any reason.
- The leader can force-return borrowed guild armory items.
- The officer can force-return borrowed guild armory items.
- Force-return may unequip the item from the borrower.
- A normal return puts the item back into the guild armory pool.
- A withdraw/remove operation returns the item to the owner's private state and removes it from the guild armory pool.
- Guild armory loans do not expire in the first foundation.
- A loan ends through:
  - borrower return;
  - owner force-return;
  - leader/officer force-return;
  - owner withdraw;
  - leader/officer remove from guild armory;
  - ownership change;
  - scrap;
  - owner leaving the guild;
  - borrower leaving the guild;
  - guild dissolution.

### Guild armory shelves and capacity

- Guild armory may use shelves; DB/code may use `shelf`.
- Guild armory can mirror the 10-shelf concept from player armory unless DB implementation finds a better reason not to.
- A deposited item keeps its shelf number.
- Guild armory capacity is configurable.
- `0` guild armory capacity means unlimited.
- Capacity counts every item assigned to guild armory, including currently borrowed items.
- Exact DB/config model belongs to the DB migration track.

### Guild dissolution

- Only the leader can dissolve the guild.
- Dissolution should end active guild armory loans.
- Borrowed items should be unequipped/removed from borrowers when loans end through dissolution.
- Guild armory items return to their owners' private state.
- Membership should become inactive/dissolved according to DB workflow.
- Guild history should remain available for logs/anti-abuse; dissolution should not erase everything without trace.


## Vendor Scrap / Sell Decisions — 2026-05-01

Vendor/system item scrap/sell uses drachmas and is not player trade.

Frontend must call `vendor_scrap_hero_item(...)` for vendor sell/scrap. It must not compose item lifecycle updates and resource updates in Angular.

Vendor scrap is an item lifecycle transition plus resource reward, owned by DB/RPC.

---

## Trade / Auction Decisions

Player-to-player trade uses Character Points. Drachmas are vendor/system/building currency, not player-to-player trade currency.

Items are not copied on transfer. Ownership changes through `items.hero_id` via DB/RPC workflows.

Item statuses include `active`, `scrapped`, `locked_trade` and `locked_auction`.

Direct trade and one-item auction workflows are DB/RPC-owned. Angular must not directly mutate critical trade/auction tables.

Trade/auction audit is DB-owned through triggers and helper functions. Frontend must not manually write lifecycle audit rows.

---

## Progression / Epic N Decisions

Stat upgrade cost and cap validation are DB/RPC-owned for durable mutation. Frontend calculators may preview only.

Character Points are the canonical player-visible progression/economy points. Older `PR` / `Hero Points` wording may appear in legacy notes but new UI should use Character Points unless explicitly changed.

Progression formulas must be evaluated server-side when spending points or validating upgrades.

---

## Server / Account / Hero Decisions

`hero.id != auth.uid()`.

User account is global. Hero is server-specific.

Correct loading path:

1. authenticated user;
2. selected/current server;
3. active hero on that server;
4. hero-owned data.

Sandbox/testing may allow privileged multi-hero tooling. Standard gameplay must not assume one global hero.

Server staff permissions are server-scoped.

---

## Configuration Governance Decisions

Config changes must be reasoned and grouped in change sets.

Config definitions are a registry/governance layer, not a replacement for relational domain tables.

Critical config/value/entity edits should flow through DB/RPC/governance contracts, not direct Angular writes.

`global_value_change` / `server_value_change` entries must not misuse `entity_id`. Those entries use `config_definition_id`, optional `server_id`, `field_path = value_json`, old/new values and metadata. Entity edits use `entity_field_change`.

---

## Bonus / Derived Stat Decisions

Use `scope`, not `context`, for bonus semantics.

Central bonus foundation uses DB dictionaries and semantic bonus templates:

- `bonus_types`;
- `bonus_scopes`;
- `bonus_target_categories`;
- `bonus_targets`;
- extended `bonus_templates`;
- `entity_bonuses`.

Legacy bonus join tables are transitional.

`hero_derived` is no longer frontend/runtime source of truth. Do not introduce new dependencies on it.

Derived stats should resolve from base stats, equipment, origin/building/item/entity bonuses and formula/fallback layers where applicable.

---

## Admin IA / Epic R Direction — 2026-05-01

Epic R is lightweight admin information architecture and layout hygiene, not a final visual redesign.

Admin UI should be organized by work intent, not raw table names.

Recommended groups:

- Overview;
- Global Governance;
- Game Balance;
- Server Operations;
- Moderation & Anti-abuse;
- Gameplay Tools / Sandbox.

Codex should prefer PrimeNG tabs/tabbed sections or clear sections for complex admin pages instead of one long vertical form.

Final visual style, spacing, iconography and design-system decisions remain in the UI/UX backlog.

---

## M12 / Combat Opponent Admin Configurator Reminder

Combat opponent definitions are a future admin/balancer configurator area.

Corrected facts:

- `combat_opponent_attack_sources` does not have an attack-source-kind field;
- attack source rows have natural attack-source fields such as key/label/descriptions, min/max opponent level, attack count, min/max damage, critical chance/damage, active/sort order;
- opponent-level `equipment_mode` supports `none`, `manual`, `generated`;
- equipment-entry-level `entry_mode` supports `manual`, `generated` only.

Do not assume a write-capable M12 UI is safe until the dump/generated types confirm the current RPC/governance path for the exact tables being edited.
