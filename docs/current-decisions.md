# Mythborne — Current Decisions Log

Updated: 2026-05-02

Use this file for recent design, domain, database and implementation decisions that should override older assumptions.

If something conflicts, prefer:

1. explicit user instruction,
2. current database schema / migrations / dump,
3. this file,
4. `project-context.md`,
5. broader concept documents.

This file is not a Codex status tracker. Do not mark Codex tasks as completed here unless the user explicitly asks for documentation/status updates after accepting the work.

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

## Future Memory Notes — 2026-05-02

These are side notes, not current Epic M/L work unless explicitly promoted:

- After Epic M, revisit `/admin/exploration-trials` for explainability/layout cleanup.
- Create a later `UX-CFG` epic for a systematic review of all admin/configurator UI explanations.
- PvP attack target range must be level-limited; very low/high level targets should be blocked outside the allowed range.
- PvP attacks cannot target members of the attacker’s own guild.
- PvP attack travel time depends on estate/address distance.
- PvP spying should be shorter than attack travel time.
- PvP spying can target anyone, including own guild members, without level limits, but still uses distance-based time.
- PvP sieges can ignore level limits but cannot target own guild members.
- Auction watchers should later support notifications for watched-auction price/outbid/end-soon events.
- Auction rules still need a design/config home: minimum increment, custom bid amount, auction timing, and anti-snipe/end-extension behavior.
- Trade Routes/building integration should later define the combined active offer-slot limit across auctions and direct trade.
- Direct trade offers received from another player should not consume the receiver’s Trade Routes/offer slot unless the receiver makes a counteroffer or otherwise creates their own commitment.

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

The canonical project/game name is **Mythborne**.

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

## Exploration Runtime Decisions

The core PvE order is:

1. player chooses direction;
2. every movement step takes time, including the first step;
3. trial opportunity is rolled first;
4. if no trial, encounter-or-nothing is rolled;
5. trial and encounter do not happen at the same time.

Encounter does not reset trial dry-step progression. Trial opportunity resets it.

Difficulty tiers are DB-backed. UI must not hardcode permanent difficulty cards when DB tiers are available.

Owner-readable exploration runtime tables are read-only from Angular. Persistent gameplay mutations use PvE RPCs.

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
