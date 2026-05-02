# Monster Hunt - Current State Summary

Updated: 2026-05-02

This file summarizes the current implementation state against:
- `docs/project-context.md`
- `docs/database-current.md`
- `docs/current-decisions.md`

If code, migrations, and this file diverge, prefer code and migrations, then update this file.

## Overall Completion Snapshot

This is an operational estimate, not a formal audit.

| Area | Approx. completion | Notes |
| --- | --- | --- |
| Angular 21 / zoneless / signals architecture | 85% | Active pattern across current feature work. |
| Auth / hero bootstrap / stat loading | 75% | Core hero data, stats, and derived stats are loaded and used in multiple screens. |
| Item generation and balance admin | 85% | Quality tiers, bucket profiles, formulas, previews, assignments, and bonus types are live. |
| Building admin and estate building preview | 70% | Definitions, progression formulas, requirements, costs, and previews exist. Real build execution is still placeholder. |
| Bonus-template based modular stats | 75% | Used across origins, items, and buildings, including `percent` and `per_4_levels`. |
| Formula system | 85% | Targets, formulas, assignments, block library, human preview, chart, target-defined variables, and combat balance targets are implemented. |
| Hero progression formulas | 70% | Stat cost and cap formulas are live, including support for `statLevel`. |
| Armory / item visibility layer | 50% | Core item catalog and armory surface exist, but broader gameplay loops are still incomplete. |
| Combat | 35% | `/game/combat` now has a 10-turn Walking Dead duel with formula-driven hit/evasion/crit/damage, but it is still sandbox-only and not tied to rewards or exploration. |
| Exploration / trials / encounters | 40% | DB/RPC foundation and guarded frontend models/mappers exist. `/game/exploration` now has player-facing status/start, DB-backed graph/direction display, movement start, DB-time-gated step resolve, resolved outcome presentation, active challenge completion/auto-resolve UI and read-only persisted reward display. Full runtime smoke is still pending admin/debug data setup. |
| Prestige / reputation | 0% | Not implemented yet. |
| Guilds / politics / sieges | 0% | Not implemented yet. |
| Trade / economy gameplay loop | 58% | Database/RPC foundation for Character Points, direct trade, auctions, item locks, vendor scrap and anti-abuse signals exists. Direct trade and one-item auctions have initial player-facing RPC-backed UIs; vendor sell has a core service contract, while Trade Routes/building integration and real sandbox smoke coverage are still pending. |
| Generated database types | 100% | Task A1 confirmed. `src/app/core/types/database.types.ts` has been regenerated against the current schema and includes the latest trade, auction, anti-abuse, item lifecycle, server/config/formula/audit, and hero tables/functions/enums. |

## What Is Implemented

### Frontend / architecture
- App is aligned with Angular 21 standalone structure.
- Current feature work follows zoneless and signals-first patterns.
- Shared non-component form/config logic has been moved toward `core`.
- Reusable UI helpers such as form field renderers and tag-link components are in shared UI.
- Generated Supabase types are kept in `src/app/core/types/database.types.ts`; domain models should continue to map from DB rows rather than being replaced by raw generated row types.

### Database types / task tracking
- Task A1 is confirmed complete as of 2026-04-26.
- `database.types.ts` includes the current public schema for:
  - game servers, memberships, staff assignments,
  - config governance,
  - formula governance,
  - audit and anti-abuse foundations,
  - item lifecycle and locks,
  - Character Points ledger/locks,
  - direct trade and auction runtime,
  - existing hero, stats, resources, estate, building, and item tables.
- Frontend compile fixes from the regenerated types are applied:
  - `hero_derived.hp` is no longer read or written,
  - Character Points are read from `hero.character_points`,
  - generated bonus-template rows are mapped through defaults instead of legacy removed columns,
  - hero loading now filters by `hero.user_id` instead of assuming `hero.id === auth.uid()`.
- Task A2 has been applied for A1 by updating this state summary and `docs/current-todo.md`.
- Task B1 is confirmed complete as of 2026-04-26. The audit report is stored in `docs/b1-identity-assumptions-audit.md`.
- B1 confirmed that RLS/onboarding SQL is a separate required database task before the project can fully rely on `hero.id != auth.uid()` in production.
- Task B2 is confirmed complete as of 2026-04-26. The app now has a shared active server resolver in `ActiveServer`.
- Active server state loads accessible game servers, respects global roles/staff visibility, chooses a default sandbox/live/scheduled server, exposes selected server data, and provides access flags for downstream UI/domain code.
- Active server domain rules live in `core/utils/active-server.ts`; enums live in `core/enums/active-server.enum.ts`, and related interfaces live in `core/interfaces/server/active-server.interface.ts`.
- Task B3 is confirmed complete as of 2026-04-26. The app now has a shared active hero resolver in `ActiveHero`.
- Active hero state loads the current hero by authenticated `user_id` plus selected `server_id`, exposes `userId`, `serverId`, `heroId`, `server`, `hero`, and `heroRow`, and handles the no-hero-yet onboarding state.
- Auth bootstrap and the legacy `Hero.getHeroData()` path now use `ActiveHero`, so gameplay-owned reads can continue from the selected server's `hero.id` instead of assuming `hero.id === auth.uid()`.
- Task B4 is confirmed complete as of 2026-04-26. Stats, derived stats, resources, and progression save now use the active hero row as the source of `hero.id`.
- The legacy `Hero` service no longer gates these flows through a separate `authState.user()` check before querying hero-owned tables.
- Progression save refreshes `AuthState.hero().characterPoints` after the Character Points update succeeds.
- Task B5 is confirmed complete as of 2026-04-26. Estate/building/combat/armory reads in the current prototype now flow through `ActiveHero` and use the selected server's active `hero.id` for hero-owned data.
- Estate reads used by mansion preview and hero address display are additionally constrained by `server_id`, so occupied estate data stays server-scoped.
- Current armory and combat prototype surfaces already consume hero-derived data through the shared `Hero` service; no separate auth uid based item/combat reads were found in this slice.
- Task C1 is confirmed complete as of 2026-04-26. `ActiveServer.access` exposes global role flags, server membership status, server staff role, staff flag, sandbox access, and selected-server management capability.
- Global role (`globalRoleKey`) and server staff role (`serverStaffRole`) are represented separately, so UI can distinguish global admin/operator/tester access from server-specific staff assignment.
- Task C2 is confirmed complete as of 2026-04-26. Staff/admin pages now share an admin server switcher backed by `ActiveServer`, so dashboard, item balance, item catalog, and building admin views operate against the selected server context.
- The server switcher uses Reactive Forms through a core form factory and PrimeNG `p-select`; it avoids `ngModel`, local component styling, temporary debug output, and direct ad hoc RPC calls from the component.
- Current global role checks use the existing `has_global_role` RPC through the backend layer, while direct `roles` table reads remain avoided because RLS may hide those rows.
- Task C3 is confirmed complete as of 2026-04-26. Active server access now exposes membership status details and gameplay routes are blocked for suspended or banned selected-server memberships while admin/staff visibility remains available.
- Suspended/banned membership messaging lives in a dedicated layout component and shows the status, suspension end where available, and stored reason text.
- The game topbar now loads from active hero state without repeatedly resetting active hero loading, so address, health, experience, and resources stay visible.
- Runtime derived stats no longer read or write `hero_derived`. Frontend derived stats are resolved from active hero base stats, derived stat definitions, origin/hero entity bonuses, bonus scopes, and health formula assignment/fallback; `hero_derived` remains only in generated database types until the physical DB table is removed and types are regenerated.
- Bonus terminology in frontend models/forms has moved from old bonus `context` naming to `scope`; unrelated formula/runtime context naming remains separate.
- Task D1 is confirmed complete as of 2026-04-26. The frontend now has a typed `config_definitions` read model, mapper, service, and `/admin/config-definitions` read-only admin view.
- Config definition rows are mapped to domain fields for key, label, description, governance scope, managed entity type/key, value type, schema, default value, active flag, sort order, and timestamps.
- The config definitions admin view displays technical fields as chips, pretty-prints JSON schema/default previews, shows `No default` for null defaults, and supports Reactive Forms filtering by search text, governance scope, and managed entity type.
- Task D2 is confirmed complete as of 2026-04-26. The frontend now has typed read models and mappers for active `global_config_values` and selected-server `server_config_values`.
- The config definitions admin view resolves and displays an effective value for each definition using the current D2 read-model order: selected server value, active global value, definition default, then no value.
- Effective config values show their source label as server source, global version, default, or no value. Later config governance tasks still need to enforce `governance_scope` more strictly when editing or applying config changes.
- Task D3 is confirmed complete as of 2026-04-26. Admin now has a read-only `/admin/config-change-sets` view for config governance change history.
- The config change-set view lists titles, reasons, statuses, changelog visibility/content, requested/applied/cancelled actors, and created/updated/ready/applied/cancelled timestamps.
- Selecting a change set loads its `config_change_entries` detail with change kind, config definition label, server/entity identifiers, field path, old/new scopes, old/new values, metadata, and entry creation time.
- Task D4 is confirmed complete as of 2026-04-27. Admin can create draft config change sets with mandatory trim-validated title and reason.
- Draft change sets can receive value-change entries for `scalar_config` and `json_config` definitions with value types `integer`, `decimal`, `boolean`, `string`, and `json`.
- D4 records only draft `global_value_change` / `server_value_change` entries and does not apply or silently mutate `global_config_values` or `server_config_values`; relational config changes remain reserved for future `entity_field_change` flows.
- Task D5 is confirmed complete as of 2026-04-27. Config change sets can now be marked ready, applied, or cancelled through the accepted DB/RPC workflow instead of frontend-side table mutation.
- D5 frontend workflow calls `mark_config_change_set_ready`, `apply_config_change_set`, and `cancel_config_change_set` through the shared backend RPC layer; cancellation requires and sends `cancelledReason`.
- Config change-set models/mappers include `readyBy` and `cancelledReason`, and the admin change-set UI shows/validates cancellation reason while preserving the original change-set reason.
- The config change-set page has been refactored into page-local list/detail state, effective-values state, draft actions, entry-draft state, and workflow actions; the page facade now acts as a small orchestration shell.
- Task D6 is confirmed complete as of 2026-04-27. Admin now has `/admin/anti-abuse-config` for selected-server anti-abuse governance values.
- The anti-abuse config page loads active `config_definitions` where `managed_entity_key = anti_abuse`, resolves effective values for the selected server, and displays source/default/value type metadata without hardcoded thresholds.
- Anti-abuse config edits are routed into the existing config change-set path through `/admin/config-change-sets?managedEntityKey=anti_abuse`; the draft entry selector is filtered to anti-abuse definitions and still uses governed change entries instead of direct config value mutation.
- D6 was verified with `npm run build`; the build passes with the existing bundle budget and Supabase SSR CommonJS warnings.

### Canonical stats and derived stats
- Base stats are loaded from canonical stat definitions.
- Derived stats are loaded separately and displayed in hero/game screens.
- Origin bonuses are applied through the modular bonus system rather than hardcoded per-feature columns.

### Bonus template model
- `bonus_templates` is used as a central bonus definition source.
- Supported bonus types now include:
  - `flat`
  - `percent`
  - `per_4_levels`
- Bonus normalization and formatting are shared through utils.

### Item generation / item balance
- Item generation balance admin has working CRUD for:
  - quality tiers
  - bucket profiles
  - global formulas
  - formula assignments
- Quality tier validation enforces weight totals for enabled tiers.
- Bucket profile preview updates reactively.
- Bucket profile key generation is automated from name.
- Formula editor supports:
  - human-readable preview
  - function/tooltips
  - chart preview
  - block insertion
  - template insertion
  - target-level variable management

### Formula platform
- Formula targets, formulas, assignments, and formula blocks are backed by Supabase tables.
- Formula runtime evaluates only functions and variables allowed by the selected target.
- Unknown custom variables are no longer silently accepted.
- Target variables are now editable and persisted.
- `statLevel` is supported in the stat progression target and runtime.
- Combat balance is now also configured through formula targets for:
  - Walking Dead green-zone width
  - evasion chance
  - critical chance
  - final damage
- Task E1 is confirmed complete as of 2026-04-27. Formula governance now has a typed read layer for formula targets, formulas, global assignments, formula blocks, and entity formula assignments.
- `/admin/formulas` provides a read-only admin inspection view for formula targets, grouped formula library entries, global/default assignments, formula blocks, and local entity assignments.
- `FormulaService.getAdminData()` now reads formula governance tables through generated DB row types and maps them into domain models instead of untyped `any` rows.
- Task E2 is confirmed complete as of 2026-04-27. `/admin/formulas` now has a dedicated formula assignment viewer for global/default target-to-formula assignments.
- The assignment viewer shows target scope, assignment status, assigned formula key/label, formula description, expression, update timestamp, allowed variables, and default test context.
- Assignment status now distinguishes `no assignment`, `missing assigned formula`, `disabled assigned formula`, and `enabled assigned formula`.
- Formula assignment view models and status mapping live in `core/types/formula-admin-view.types.ts` and `core/utils/formula-assignment-view.ts`, keeping page/component files focused on UI orchestration.
- Project convention reinforced: exported/shared types, interfaces, constants, view models, and mapping rules should live in `core/domain`, `core/types`, `core/interfaces`, `core/constants`, or `core/utils`, not inside component/service/facade files.
- Task E3 is confirmed complete as of 2026-04-27. `/admin/formulas` now shows local entity formula overrides next to the global/default fallback for the same target.
- Building entity assignments are labelled with building name/key where available through `FormulaEntityLabels`.
- The E3 view model documents the runtime lookup expectation in code: local entity assignment first, global/default assignment after removal.
- Shared E3 row/reference types live in `core/types/formula-admin-view.types.ts`, and local override/global fallback mapping stays in `core/utils/formula-assignment-view.ts`.
- Task E4 is confirmed complete as of 2026-04-27. Formula runtime lookup now uses a shared resolver for local entity assignment, global/default assignment, and configuration-error handling.
- Building progression runtime now respects building-specific local formula overrides before global/default building formulas.
- Stat progression and `FormulaService.getAssignedFormula()` use the same assignment resolver for global/default formula lookup.
- A local entity assignment that references a missing or disabled formula is treated as a configuration error, not silently hidden by falling back to the global/default assignment.

### Buildings / estate layer
- Building admin supports:
  - building definitions
  - district availability
  - progression inputs
  - requirements
  - bonus rows
  - cost rows
  - formula assignment
  - preview of next level costs/time/bonuses/requirements
- Mansion page displays current building state and formula-based next-step previews.
- This is currently preview/admin heavy. Real construction execution is not implemented yet.

### Trade / auctions / Character Points
- Character Points are stored on `hero.character_points` with lifetime baseline in `hero.total_character_points_earned`.
- `character_point_ledger` is the append-only balance history.
- `items` has lifecycle/ownership fields for active, scrapped, trade-locked, and auction-locked states.
- Direct trade backend/RPC runtime exists for private same-server hero trades with Character Point locks and item locks.
- Auction backend/RPC runtime exists for one-item server-scoped auctions with bidding, buy now, and bid escrow through Character Point locks.
- Completed trade/auction transactions can generate anti-abuse signals and grouped review cases.
- Direct trade has an initial player-facing `/game/trade` surface for create, respond, confirm, cancel and reject flows through public RPCs.
- Auction has an initial player-facing `/game/auction` surface for listing, bidding, buy now, close and cancel flows through public RPCs.
- Auction sale history reads `player_trade_transactions(transaction_type = auction_sale)` and linked `player_trade_transaction_items` transaction-time snapshots instead of reconstructing historical item state from current `items`.
- Trade and auction lifecycle audit is DB-owned by canonical RPCs/triggers. Frontend trade/auction action services do not inject or call Angular `AuditWriter` and do not direct-write trade, auction, item lock or transaction tables.
- Vendor scrap/sell is a separate system/vendor economy workflow. Frontend core service support calls `vendor_scrap_hero_item(...)` and does not compose item lifecycle cleanup with resource updates client-side.

### Combat
- `/game/combat` is no longer a placeholder.
- Current hero data is loaded and mapped into a combat snapshot.
- A demo opponent with base stats around 5-10 and derived combat values is created.
- The current slice uses:
  - Walking Dead timing for player attacks
  - automatic opponent attacks
  - a 10-turn limit
  - victory / defeat / draw resolution
  - streak-based green-zone narrowing and speed increase
- Hit zone width, evasion, critical chance, and final damage are read from admin-managed combat formulas.
- This is intentionally still a sandbox slice, not the final PvE/PvP system.

## What Is Only Partially Realized

### Item philosophy from business context
Partially realized:
- layered item generation exists
- quality and affix systems exist
- requirement-driven gating exists in the data model and formulas

Not fully realized:
- broader loot loop in exploration/trials
- economic weirdness / awkward but valuable items as a live gameplay loop
- stronger market/trade consequences

### Buildings as estate/world progression
Partially realized:
- district-linked building definitions exist
- building previews and admin balancing exist
- resources are connected conceptually to buildings

Not fully realized:
- real relocation consequences
- siege-driven estate takeover
- build queue / build execution / timers / claims

### Luck philosophy
Partially realized:
- luck exists as a derived stat
- luck is treated separately from standard point-invested stats
- item-generation design clearly leaves room for luck-sensitive variance

Not fully realized:
- exploration/trial manifestation influence
- encounter influence
- bucket filtering / dry-streak emotional tuning in live gameplay

### Trial / exploration loop
Mostly not realized yet:
- no live movement loop
- no progressive trial chance tracker
- no manifestation stage
- no daily trial cap flow
- no difficulty-tier execution loop

## Current Decision Alignment

### Strongly aligned already
- Angular 21 / zoneless / signals-first implementation direction
- Modular bonus-template approach
- Buildings treated as estate/world-side systems rather than just player talents
- Formula/balance systems left configurable for admin balancing
- Hardcoded gameplay values reduced where balancing is expected later

### Only conceptually aligned so far
- Exploration + trials as the main PvE loop
- Trial appearance vs manifestation vs completion separation
- Hard-only access to the top quality tier in the actual PvE reward loop
- Reputation / prestige as a separate axis
- Guild coalitions and politics

## Database Semantics Check

Aligned with `docs/database-current.md`:
- canonical stat loading from database-backed stat definitions
- separate handling of base and derived stats
- central `bonus_templates` model
- building definitions with progression-related metadata
- formula targets with `allowed_variables` and `default_test_context`
- Character Points on `hero` plus append-only `character_point_ledger`
- item lifecycle statuses for active/scrapped/trade-locked/auction-locked items
- direct trade, auction, Character Point lock, transaction, anti-abuse signal, and anti-abuse case grouping foundations
- generated Supabase types synchronized with the current schema

Still pending at the gameplay level even if partially supported in schema:
- trials / encounters / manifestation-specific storage and runtime flow
- estate conflict / siege persistence
- reputation / prestige persistence and scoring
- frontend trade/auction UX and Trade Routes/building bonus integration

## Important Notes For Next Work

- F3 accepted on 2026-04-27: canonical bonus governance models and new-only mappers were added under `core/types`, `core/domain/bonus`, and `core/utils`.
- F3 deliberately did not rewire UI/runtime/write paths; `mapCanonicalBonusTemplate()` treats missing `type_key`, `target_key`, or `scope_key` as configuration errors and does not fall back to legacy `bonus_templates.target/type`.
- F3 mapper tests cover new-only template mapping, resolved `entity_bonuses` overrides, value-only quality scaling projection, and unsupported entity type rejection.
- F4 accepted on 2026-04-27: bonus admin read data now loads `bonus_types`, `bonus_scopes`, `bonus_target_categories`, `bonus_targets`, and semantic `bonus_templates`; `/admin/balance` no longer depends on `bonus_templates.category`, and template editing is read-only until F5 semantic write migration.
- F5 accepted on 2026-04-27: bonus template admin writes now use a semantic payload for `type_key`, `target_key`, `scope_key`, `level_interval`, `scaling_stat_key`, `params_json`, `sort_order`, and `is_active`.
- F5 no longer sends legacy `bonus_templates.category`, `target`, `type`, `scope`, `base_value`, `levels_step`, `source_stat`, or `scaling_factor`; `Backend.create/update` converts the camelCase payload to DB snake_case before Supabase writes.
- `/admin/balance` template editing is unlocked again for semantic template fields. Template `baseValue` is intentionally not edited there because bonus values belong to `entity_bonuses.value`.
- F6 accepted on 2026-04-27: shared entity bonus helpers now provide dictionary maps, resolved bonus view mapping, and single-row `entity_bonuses` payload construction for `origin`, `item_generation_base`, `item_generation_affix`, `building`, and `item`.
- F6 intentionally did not rewire origin/item/building runtime paths and did not introduce a generic save-replace-collection mechanism. `quality_scales_level_interval = true` is rejected in the payload helper.
- F7 accepted on 2026-04-27: origin bonus reads now use `entity_bonuses` with `entity_type = origin` and joined semantic `bonus_templates`; app code no longer reads `origin_bonuses`.
- F7 keeps the existing `OriginBonus` view model as a transitional compatibility bridge for dashboard, combat, and origin selection, while sourcing data from canonical entity bonuses.
- `BONUS_ENTITY_TYPES` centralizes `entity_bonuses.entity_type` values, and `TABLES.origin` is used instead of raw origin table strings in the origin service.
- F8 accepted on 2026-04-27: item generation base items now use `item_generation_bases.base_type_key` as the semantic source of truth.
- F8 loads `item_generation_base_types` and `item_generation_base_type_targets`; runtime/admin base item models expose base type metadata instead of legacy `slot`, and missing base type dictionary entries are configuration errors.
- F8 does not complete item generation bonus migration: `item_generation_base_bonuses` and `item_generation_affix_bonuses` remain legacy paths to remove in F9 via `entity_bonuses`.
- F9 accepted on 2026-04-27: item generation base/affix bonus read and write paths now use `entity_bonuses` with `entity_type = item_generation_base` or `item_generation_affix`.
- F9 removed app-code usage of `item_generation_base_bonuses` and `item_generation_affix_bonuses`; those names remain only in generated database types.
- F9 item quality scaling uses `entity_bonuses.quality_scales_value` to scale only bonus value. `quality_scales_level_interval = true` is rejected because `level_interval` must never be quality-scaled.
- `/admin/item-catalog` now keeps base/affix `key` readonly and generated from `name`, and bonus rows use PrimeNG/shared form controls for select/checkbox inputs.
- F10 accepted on 2026-04-27: building admin read/write and mansion/building preview now use `entity_bonuses` with `entity_type = building`.
- F10 removed app-code usage of `building_bonuses`; that legacy table remains only in generated database types.
- F10 building bonus writes do a controlled replace for the concrete `entity_type = building` and `entity_id = buildingId`, require semantic bonus templates, and never fall back to legacy `building_bonuses`.
- Empty building `entity_bonuses` is allowed when buildings legitimately have no configured bonus rows; missing expected rows should still be treated as a SQL/backfill blocker.
- `/admin/buildings` was split into smaller building section components, building form selects in the touched sections use PrimeNG/shared controls, and building `key` is readonly/generated from `name` only for new or empty-key records.
- F11 accepted on 2026-04-27: combat item/equipment bonus inputs now read equipped items from `hero_equipment` and resolve item generation base/prefix/suffix bonuses through the canonical item generation catalog.
- F11 applies item quality scaling through the existing value-only quality scaling helper, then maps combat-scope equipment bonuses into `hitBonusFromItems`, `critBonusFromItems`, `evasionBonusFromItems`, and `damageBonusFromItems`.
- F11 does not add a dependency on `hero_derived`; missing legacy/null equipped item generation fields remain data cleanup blockers rather than a reason to fall back to legacy item bonus paths.
- `hitBonusFromItems` remains zero until the DB dictionary gets a canonical hit/accuracy bonus target. No unregistered `accuracy` or `hit_chance` magic target is used in runtime mapping.
- F12 accepted on 2026-04-27: app code no longer reads/writes legacy bonus join tables, and those table names remain only in generated database types and documentation.
- F12 removed legacy fallback from derived-stat bonus mapping: runtime entity bonuses require semantic `bonus_templates.type_key`, `target_key`, and `scope_key`; legacy `bonus_templates.target/type` are not used as source of truth.
- Derived stats now resolve from final/effective base stats: raw `hero_stats` are first adjusted by active base-stat bonuses, then defense, health, damage, and combat inputs derive from those final stat values.
- Base-stat bonuses are not counted twice for derived stats: if a derived definition uses `base_stat_key = endurance`, an endurance bonus affects the final endurance base and is not also re-added as a defense bonus. Direct `target_key = defense` bonuses still apply to defense.
- `BONUS_ENTITY_TYPES.Hero` documents the canonical hero entity bonus type used by runtime derived stats through `entity_bonuses(entity_type = hero)`.
- G1 accepted on 2026-04-27: audit dictionary read layer now loads active `audit_action_types` and `audit_entity_types` through core domain models, mappers, and `AuditDictionaries`.
- `/admin/audit-dictionaries` provides a read-only admin view of stable audit action/entity keys, labels, categories, default severity, sort order, and update timestamps. Audit log rows remain separate G2 work.
- G2 accepted on 2026-04-27: audit log read layer now loads `audit_logs` with joined action/entity dictionaries through core domain models, row types, mappers, and the `AuditLogs` service.
- `/admin/audit-logs` provides a read-only recent audit log view with exact-match filters for action type, entity type, server id, actor user/hero id, and target user/hero id. Config/domain operation integration remains separate G4+ work.
- G3 accepted on 2026-04-28: audit domain operations can now use the shared `AuditWriter` service backed by the `write_audit_log` RPC.
- `AuditWriteRequest` lives in `core/domain/audit`, `toWriteAuditLogRpcArgs()` lives in `core/utils`, and the RPC name is centralized as `RPC.write_audit_log`.
- G3 intentionally does not log generic UI clicks or attach audit writes to components. Frontend callers pass domain context such as action/entity keys, entity id, optional actor hero context, targets, reason, request id, and lightweight metadata; the RPC/database remains responsible for validating dictionary keys and resolving the authenticated actor user.
- G4 accepted on 2026-04-28: config governance create/add/workflow operations now use DB-side audited workflow RPCs instead of direct table inserts or frontend audit helper calls.
- `ConfigChangeSets.createDraftChangeSet()` calls `create_config_change_set_draft`, and `createConfigValueChangeEntry()` calls `create_config_value_change_entry`; frontend no longer calls `try_write_config_change_set_audit`.
- Config change-set ready/apply/cancel flows continue to call `mark_config_change_set_ready`, `apply_config_change_set`, and `cancel_config_change_set`; DB workflow RPCs own those audit writes.
- Draft value-entry target is derived from `config_definitions.governance_scope`: global scopes create `global_value_change`, while server-scoped definitions require an active server and create `server_value_change`.
- `/admin/config-change-sets` now reports operational feedback with toasts and inline PrimeNG messages, and resets the draft value field cleanly after a successful entry add.
- Non-blocking UI/UX observations now have a dedicated tracking file in `docs/ui-ux-notes.md`.
- G5 accepted on 2026-04-28: anti-abuse decision workflows now have a typed frontend domain layer over DB-side audited RPCs.
- `AntiAbuseDecisions` calls the public anti-abuse workflow RPCs for permission checks, case decisions, relationship declaration decisions, abuse report decisions, sanction creation/status changes, Character Point penalty creation/status changes, and sanction item linking.
- G5 frontend code does not call `write_audit_log` or `try_write_anti_abuse_case_audit` after anti-abuse mutations; audit remains owned by the DB workflow RPCs.
- G5 adds anti-abuse decision input/output models, generated RPC arg aliases, payload mappers, row-to-domain mappers, and targeted mapper tests.
- `add_anti_abuse_sanction_item` is modeled as sanction item evidence/context, not item confiscation or return ownership transfer.
- G6 accepted on 2026-04-29 for the stat allocation slice: attribute allocation save now uses canonical `save_stat_allocation(...)` instead of direct frontend writes to `hero_stats` or `hero.character_points`.
- G6 stat allocation audit, Character Point ledger, and spend validation are owned by the DB workflow. The frontend sends normalized stat JSON and a declared `p_character_points_spent` request input, then refreshes local stat/CP state from `stats_json` and `character_points_after` returned by the RPC.
- G6 frontend code does not call `AuditWriter.write()` for stat allocation saves. UI-only plus/minus clicks remain local draft state and are not audited.
- U0-C1 accepted on 2026-04-28: frontend role usage audit confirmed that global roles and server staff assignments are already separate data dimensions, but current UI/access affordances are still too broad.
- U0-C1 identified `/admin` route guards, logged-in menu visibility, static admin navigation, and `ActiveServer.canManageSelectedServer` semantics as the main frontend role-boundary risks.
- `canManageSelectedServer` must not mean "has any server staff assignment"; future U0 work should split staff access, management authority, moderation authority, test access, and assigned-staff status into separate access flags.
- U0-C2 accepted on 2026-04-28: staff gameplay access audit confirmed that `/hero/*` and `/game/*` currently check auth/onboarding and membership punishment state, but do not block assigned staff from normal gameplay on standard servers.
- Future U0-C2 implementation should add a dedicated staff-gameplay boundary for standard servers while preserving sandbox/testing exceptions; this must stay separate from suspended/banned membership blocking and from `/admin/*` route access.
- Staff gameplay blocking should use explicit access semantics such as assigned staff, gameplay allowed, management authority, moderation authority, and tester/sandbox access rather than extending `canManageSelectedServer`.
- U0-C6 accepted on 2026-04-28: admin/navigation boundary audit confirmed that `/admin/*`, sidebar `Admin`, dashboard cards, and admin tag-links are still static/prototype-level and not role/scope-aware.
- Future U0 navigation implementation needs one central access-policy source for routes, sidebar entries, dashboard cards, and tag-links so UI does not advertise links that guards deny.
- U0 route/navigation policy must distinguish global admin, server operator, scoped moderator, tester, player, and assigned-staff state instead of relying on broad `canManageSelectedServer`.
- U0-C3 accepted on 2026-04-28: user/staff management UI audit confirmed that frontend has no staff management screens yet, only current-user access context through `ActiveServer`.
- Generated types now include U0 staff/user management contracts such as `assign_global_role`, `assign_server_staff`, `revoke_server_staff`, `set_server_staff_permission_scopes`, `user_has_staff_disqualifying_history`, `user_has_hero_on_server`, `staff_permission_scopes`, and `server_staff_assignment_scopes`.
- Future staff management UI must use RPC workflows and stable dictionary keys, not direct writes to `server_staff_assignments`, `server_staff_assignment_scopes`, or `user_data.role_id`.
- U0-C4 accepted on 2026-04-28: moderator scope UI spec defines staff management flow around server selection, safe user selection, eligibility pre-checks, moderator role assignment, DB-driven scope selection, required reason/notes, and RPC-only submit.
- Future moderator scope UI should distinguish blocking hero-on-standard-server state, staff-disqualifying history warnings/blocks, and informational sandbox/testing exceptions instead of collapsing eligibility into one boolean.
- U0-I1 accepted on 2026-04-28: frontend now has a central staff access policy helper in `core/utils/staff-access-policy.ts` with exported policy types in `core/types/staff-access-policy.types.ts`.
- U0-I1 policy separates global admin/operator/tester/moderator signals from selected-server owner/operator/moderator/tester assignment, assigned-staff state, management authority, moderation authority, testing access, player gameplay access, and staff gameplay blocking.
- U0-I1 deliberately does not wire policy into guards, sidebar, dashboard cards, or tag-links yet; U0-I2/U0-I3/U0-I4 should consume this helper instead of extending broad `canManageSelectedServer` semantics.
- Selected-server action flags are gated by an actual selected server context: global admin may access the admin shell without selected server, but `canManageSelectedServer`, `canModerateSelectedServer`, and `canTestSelectedServer` remain false when `selectedServer` is null.
- Staff gameplay blocking is represented as policy state only for now: assigned staff on standard selected servers is blocked from normal gameplay, while sandbox/testing contexts allow staff gameplay for testing and suspended/banned membership remains a separate gameplay block.
- U0-I2 accepted on 2026-04-28: `/hero/*` and `/game/*` now respect the staff gameplay boundary through the app shell. Membership suspended/banned notices still take precedence over staff gameplay blocking.
- U0-I2 moved the visual app layout into a lazy `AppShell`, leaving root `App` as global toast plus router outlet. This keeps sidebar/topbar/notices and PrimeNG notice/button modules out of the root initial bundle.
- U0-I2 adds a dedicated staff gameplay blocked notice for assigned staff on standard servers, hides normal gameplay topbar context while blocked, and keeps `/admin/*` outside this gameplay boundary.
- U0-I2 sidebar filtering removes `/hero/*` and `/game/*` links when staff gameplay is blocked, while sandbox/testing contexts preserve gameplay links for staff testing.
- U0-I2 was verified with targeted staff policy/sidebar tests and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- U0-I3 accepted on 2026-04-28: `/admin/*` now has a route boundary through `requireAdminAccessGuard`, backed by the central staff access policy.
- U0-I3 adds a lightweight `/admin/access-denied` page for direct denied navigation and keeps it exempt from the admin guard to avoid redirect loops.
- U0-I3 sidebar filtering hides the `Admin` link for normal logged-in players while keeping it visible for users whose policy allows the admin shell.
- U0-I3 is intentionally only a shell/menu boundary. Dashboard card filtering, tag-link filtering, and per-tool route metadata remain U0-I4+ work.
- U0-I3 was verified with targeted admin guard/sidebar/staff-policy tests and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- U0-I4 accepted on 2026-04-28: admin dashboard cards and reusable admin tag-links now filter through a central admin navigation access helper backed by the staff access policy.
- U0-I4 adds explicit `accessPolicy` metadata for admin dashboard cards and current admin tag-link lists, with a transitional fallback only for compatibility.
- U0-I4 hides management cards from moderation/testing-only contexts, keeps management tools visible for global admin and selected-server management authority, and hides gameplay links when player gameplay is blocked.
- U0-I4 removed stale admin dashboard copy about missing roles/guards and adds an empty state for shell access without available tools.
- U0-I4 was verified with targeted admin navigation/guard/sidebar tests and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- U0-I5 accepted on 2026-04-28: staff management now has a typed read/domain layer in `core/domain`, `core/types`, `core/utils`, and `core/services`.
- U0-I5 candidate search uses the server-scoped `search_server_staff_candidates` RPC and no longer fetches a broad `user_data` pool; empty or too-short queries return no results.
- U0-I5 staff candidate models include existing assignment/role, hero-on-server state, staff-disqualifying history, eligibility flag/reason, and a human-readable eligibility message.
- U0-I5 staff mutations remain RPC-only through assign global role, assign server staff, revoke staff, and set scopes workflows; there are no direct writes to staff tables.
- U0-I5 roles and scopes load from DB dictionaries. Global role keys use `StaffGlobalRoleKey = Row<'roles'>['key']`, while server staff roles use the generated DB enum.
- U0-I5 was verified with targeted staff-management tests and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- U0-I6 accepted on 2026-04-28: `/admin/staff-management` is now a lazy admin page for selected-server staff assignment management.
- U0-I6 staff UI uses the `search_server_staff_candidates` RPC for server-scoped candidate search, shows eligibility messages/flags, and never returns to broad `user_data` pool filtering.
- U0-I6 assignment and revoke flows use `assign_server_staff` and `revoke_server_staff` through the `StaffManagement` service; reason is required and RPC denials are surfaced through toast/message UI.
- U0-I6 current staff assignments display technical user ids as secondary data and map assigned scope keys to labels from `staff_permission_scopes` where available.
- U0-I6 cleanup split the original page facade into focused `StaffCandidateSearchState`, `StaffAssignmentListState`, `StaffAssignmentDraftActions`, `StaffRevokeActions`, and a thin `StaffManagementPageFacade` shell before U0-I7 scope UI work.
- U0-I6 was verified with targeted staff-management/admin-navigation tests and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- U0-I7 accepted on 2026-04-29: `/admin/staff-management` now includes moderator permission scope assignment for moderator staff assignments.
- U0-I7 scope options come from `staff_permission_scopes` and are shown with label/description/helper text first, with technical keys only as metadata.
- U0-I7 scope updates use `set_server_staff_permission_scopes`; `can_have_moderator_scope` is used as a per-scope pre-check before enabling checkbox controls.
- U0-I7 scope selection uses Reactive Forms only (`FormRecord<FormControl<boolean>>`), with no `FormsModule`, `ngModel`, per-control subscriptions, or duplicate mutable selected-scope state.
- U0-I7 split the moderator scope editor into `StaffScopeAssignmentActions` and `StaffScopeAssignmentSection`; empty scope sets are allowed and mean “remove all scopes”.
- U0-I7 was verified with targeted staff-management/admin-navigation tests and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- U0-I8 accepted on 2026-04-29: `/admin/moderation-actions` is now a lazy admin page for server-scoped moderation actions.
- U0-I8 uses DB dictionaries for action labels/options: `moderation_action_types` for action types and `staff_permission_scopes` for moderation scope labels.
- U0-I8 creates moderation actions only through `create_moderation_action`; there are no direct writes to `moderation_actions` and no frontend audit helper calls.
- U0-I8 reads moderator-facing visible history through `get_visible_moderation_actions` and does not use removed legacy `get_user_moderation_history` / `get_hero_moderation_history` RPC names.
- U0-I8 splits page logic into `ModerationActionsPageFacade`, `ModerationActionDictionariesState`, `ModerationActionCreateActions`, and `ModerationActionHistoryState`, with create/history UI sections kept as lazy page components.
- U0-I8 was verified with targeted moderation-action/admin-navigation tests and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- U0-I9 accepted on 2026-04-29: moderation action create/history target fields now use DB-backed user/account and hero autocompletes through `search_moderation_user_targets` and `search_moderation_hero_targets`.
- U0-I9 keeps target lookup server-scoped and does not read `auth.users`, use `search_server_staff_candidates`, or add broad `user_data`/hero fetches.
- U0-I9 history supports visible history and full user/hero history modes through `get_visible_moderation_actions`, `get_full_user_moderation_history`, and `get_full_hero_moderation_history`.
- U0-I9 requires an explicit user/account or hero target before refreshing moderation history; empty target refresh shows stable inline validation and does not call history RPC.
- U0-I9 uses shared `ModerationTargetSearchState` for create/history autocomplete state and keeps action-type badges as a small view-model list instead of repeated template conditionals.
- U0-I9 was verified with targeted moderation-action tests and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- UX-I1 accepted on 2026-04-29: shared `MetadataDisplay` was added for label/description/helper text plus secondary technical key metadata.
- UX-I1 is used in Moderation actions action-type details and Staff management moderator scope options.
- UX-I1 manual smoke confirmed Moderation actions metadata display; Staff management scope metadata smoke is deferred until seeded/pre-alpha data has a practical moderator assignment target.
- UX-I1 was verified with targeted moderation-action/staff-management tests and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- UX-I2 accepted on 2026-04-29: config governance screens now consume `get_config_definition_explainability(...)` for DB-backed scope/value/applicability explanations.
- UX-I2 added human-readable scope, applies-to, value type, effective source, impact and warning metadata to Config Definitions and Config Change Sets draft entry UI.
- UX-I2 keeps technical JSON/schema previews as secondary legacy admin previews; no new raw `<pre>` explainability content was introduced.
- UX-I2 was verified with targeted config-governance RPC tests and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- UX-I3 accepted on 2026-04-29: Audit logs now show joined audit action/entity labels and descriptions as primary readable content where dictionary metadata exists.
- UX-I3 keeps stable `audit_action_types` / `audit_entity_types` keys visible only as secondary technical metadata, with graceful fallback to keys when dictionary joins are missing.
- UX-I3 moved audit metadata/old/new JSON previews into collapsed technical `<details>` blocks so raw JSON no longer dominates audit log cards by default.
- UX-I3 was verified with targeted audit-log/audit-dictionary tests and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- UX-I4 accepted on 2026-04-29: `/admin/formulas` now includes a formula impact calculator for enabled global/default target assignments.
- UX-I4 lets admins select a formula target, choose a sweep variable such as `level`/`statLevel`, set an input range and context variables, and inspect output table plus chart without editing database values.
- UX-I4 reuses the existing formula runtime and expression preview; technical formula expressions remain visible as formula previews, not raw JSON explainability.
- UX-I4 was verified with targeted formula-runtime tests and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- UX-I5 accepted on 2026-04-29: Balance quality tiers now include a DB-backed item quality impact preview powered by `get_item_quality_impact_preview(...)`.
- UX-I5 shows quality rows from `item_generation_qualities`, sample item value after quality multiplier, quality-scaled bonus value and DB-provided explanation text; no hardcoded Normal/Quality/Outstanding list is used.
- UX-I5 validation keeps sample base/bonus values required, rejects negative sample base values in UI and mapper, and intentionally allows negative bonus values for malus previews.
- UX-I5 was verified with targeted item-generation admin mapper tests and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- UX-I6 accepted on 2026-04-29: Building admin now has a separate preview section below the main save flow, combining local editable formula output with DB-backed district/cap progression context.
- UX-I6 uses `get_building_progression_preview(...)` for district availability, effective max level, cap source, cap explanation, and `0 = unlimited` semantics while keeping persisted DB base values as collapsed technical metadata.
- UX-I6 local formula preview uses editable resource cost rows for single-level and range previews through `BuildingFormulaPreviewCalculator`; cost errors now show actionable reasons instead of false zeroes or vague unavailable states.
- UX-I6 validation rejects empty, decimal, inverted, above-range, and too-wide level ranges before RPC, and above-cap rows no longer appear as upgradeable.
- UX-I6 was verified with targeted building admin mapper, building progression, and building formula preview calculator tests plus `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- UX-I7 accepted on 2026-04-29: Building admin bonus rows now show local live form-row explainability for the selected bonus template, target, type/scope, value and scaling metadata.
- UX-I7 keeps saved canonical bonus impact as a separate DB-backed section powered by `get_bonus_impact_preview(...)`; it shows saved canonical bonus rows only and does not imply unsaved editor changes are included.
- UX-I7 requirement rows now show only local live form-row explainability for Hero level, Hero rank and Hero stat requirements. The saved canonical requirement impact section was removed from Buildings admin to avoid mixing the legacy `building_requirements` editor with canonical `entity_requirements` preview state.
- UX-I7's `Open bonus templates` link is generic navigation to `/admin/balance`; it is not a selected-template deep link.
- UX-I7 was verified with targeted building admin mapper and building progression tests plus `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- UX-I7b accepted on 2026-04-29: Buildings admin now uses a DB-driven central requirement editor backed by `requirement_definitions`, canonical entity requirement RPCs and `get_requirement_impact_preview(...)`.
- UX-I7b supports create, update, deactivate and reactivate for building requirements through canonical RPCs only; the active editor list is rebuilt from active preview rows and inactive rows are shown separately when the DB read model returns them.
- UX-I7b smoke confirmed that `get_requirement_impact_preview(...)` returns inactive rows required by the reactivate flow, so no direct `entity_requirements` read is needed.
- UX-I7b replaced the Buildings admin legacy requirement edit path: the admin editor no longer uses `building_requirements`, `buildings.requirements` or `rank_required`; remaining legacy references are runtime/player read-model or generated-type context only.
- UX-I7b requirement payloads are `value_type` aware so create/update sends only relevant fields for integer, decimal, boolean, string/enum, stat, building, resource and district requirements.
- UX-I7b was verified with `npx tsc --noEmit`, `npm run build`, targeted building mapper/progression/formula preview specs and requirement RPC mapper specs; build still has the known bundle budget/CommonJS warnings but no hard failure.
- UX-I8 accepted on 2026-04-29: anti-abuse decision explainability now has DB-backed dictionary loading and mappers for sanction types, player abuse report types, relationship declaration types and anti-abuse signal types.
- UX-I8 added display/projection helpers for future anti-abuse case, sanction, report and declaration UI. Staff-facing projections can show staff notes/metadata, while player-facing projections omit staff-only `operatorNotes`, `adminNotes`, `adminDescription` and staff-only `statusReason`.
- UX-I8 keeps anti-abuse status labels as explicit fallback enum labels only; DB-backed explainability comes from the dictionary tables where available.
- UX-I8 explains sanction item links as evidence/context links and not item confiscation, transfer or mutation by themselves.
- UX-I8 requires reason/status reason in frontend anti-abuse RPC payload helpers for staff decision workflows before sending audited RPC calls.
- UX-I8 was verified with `npx tsc --noEmit`, `npm run build`, targeted anti-abuse dictionary/display/RPC specs and grep checks; build still has the known bundle budget/CommonJS warnings but no hard failure.
- H1 is confirmed complete through UX-I8: typed anti-abuse dictionary domain models and mappers cover sanction types, signal types, player abuse report types and player relationship declaration types, including descriptions/helper/admin text and required-field flags.
- H2 accepted on 2026-04-29: `AntiAbuseDictionaries` loads active DB-backed rows for all four anti-abuse dictionary collections, sorts each query by `sort_order` then `key`, and exposes the loaded data for future player/staff forms without UI hardcoded type lists.
- H2 was verified with `npx tsc --noEmit`, targeted anti-abuse dictionary service/mapper specs and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- H3 accepted on 2026-04-30: anti-abuse case read models now cover cases, signals, case-signal links, participants, case-audit links and case-declaration links so H5 can build a case detail aggregation model.
- H3 is a model-only foundation slice with no meaningful UI smoke path. It was verified technically with `npx tsc --noEmit`, targeted anti-abuse case mapper specs and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- H4 accepted on 2026-04-30: `AntiAbuseCases` loads anti-abuse case lists scoped by required `serverId`, with optional status, verdict, source and created date range filters. There is no global fallback, so staff case lists do not show unrelated server cases by default.
- H4 is a service-only slice with no meaningful UI smoke path. It was verified technically with `npx tsc --noEmit`, targeted anti-abuse case service/mapper specs and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- H5 accepted on 2026-04-30: `AntiAbuseCaseDetails` loads a server-scoped case detail aggregate from the base case, participants, signals, reports, declarations, audit logs, sanctions, Character Point penalties and sanction items.
- H5 validates both `serverId` and `caseId`, loads the base case by both fields before any linked reads, and fails with a stable selected-server not-found error without querying linked rows when the case is not available for that server.
- H5 is a service-only slice with no meaningful UI smoke path. It was verified technically with `npx tsc --noEmit`, targeted anti-abuse case detail/list/mapper specs and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- H6 accepted on 2026-04-30: player relationship declaration form models are generated from DB-backed `PlayerRelationshipDeclarationTypeEntry` flags, with title, description and participants always required and amount, expiration, item and trade fields enabled only when the declaration type requires them.
- H6 keeps the player-facing form model free of staff-only `adminDescription` / `admin_description` copy, normalizes participant min/max rules into stable helper text, and intentionally does not include submit/RPC behavior; H7 remains the declaration submission slice.
- H6 is a model-only slice with no meaningful UI smoke path. It was verified technically with `npx tsc --noEmit`, targeted player relationship declaration form specs and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- H7 accepted on 2026-04-30: player relationship declaration submission now uses the canonical `create_player_relationship_declaration(...)` RPC through a focused service and payload mapper.
- H7 sends top-level generated RPC args as `p_*` fields, while nested participants/items/trades JSON uses the camelCase keys expected by the DB workflow. Empty optional linked rows are filtered out, item/trade role keys default to `related`, and negative `amountCharacterPoints` is rejected before RPC.
- H7 does not direct-read or direct-write `player_relationship_declarations` or child declaration tables from the frontend. It is a service-only slice with no meaningful UI smoke path; technical verification covered mapper payloads, service RPC-only submission, `npx tsc --noEmit`, targeted specs and `npm run build`.
- H8 accepted on 2026-04-30 as a service/read-model slice: player relationship declaration list loading now requires `serverId`, `heroId` and `userId`, and combines own declarations, hero participant declarations and user-only participant declarations.
- H8 keeps the final declaration list server-scoped by reloading participant-linked declarations with `serverId + id IN (...)`, loads referenced inactive/deprecated declaration type labels from DB, and exposes a player-facing model without `userId`, `adminNotes`, `adminDescription` or staff-only `statusReason`.
- H8 is not a UI slice yet, so there is no meaningful manual UI smoke path. Technical verification covered service and mapper specs for user-only participants, cross-server leakage prevention, inactive type labels, staff-only field privacy, `npx tsc --noEmit` and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- H9 accepted on 2026-04-30 as a service/read-model slice: staff relationship declaration review now has a server-scoped detail loader that confirms `serverId + declarationId` before loading participants, items or trades.
- H9 staff-facing detail intentionally exposes review fields such as `statusReason`, `adminNotes`, `playerStatusMessage`, `reviewedByUserId`, `createdByUserId` and participant `userId`, and loads inactive/deprecated declaration type labels plus `adminDescription` from DB by key.
- H9 staff decisions use `AntiAbuseDecisions.setRelationshipDeclarationDecision(...)`, backed by the canonical `set_player_relationship_declaration_decision` workflow. The review service does not direct-write declaration tables, call `write_audit_log`, or call `.rpc()` directly.
- H9 has no meaningful UI smoke path yet. Technical verification covered server scope, not-found behavior without linked reads, inactive type labels, staff-visible fields, decision workflow, ID validation, `npx tsc --noEmit`, targeted specs and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- H10 accepted on 2026-04-30: player abuse report form models are generated from DB-backed `PlayerAbuseReportTypeEntry` flags. `title` and `description` are always visible and required because the current `create_player_abuse_report(...)` RPC requires both `p_title` and `p_description`.
- H10 uses DB flags only for optional report-specific fields: `requiresAccusedHero` controls accused hero selection, `requiresItemSelection` controls related item selection, and `requiresTradeSelection` controls related trade selection. The player-facing form model does not expose staff-only `adminDescription`.
- H10 is a model-only slice with no meaningful UI smoke path. It was verified technically with `npx tsc --noEmit`, targeted player abuse report form/dictionary specs and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- H11 accepted on 2026-04-30: player abuse report submission now uses the canonical `create_player_abuse_report(...)` RPC through a focused service and payload mapper.
- H11 sends only generated RPC args supported by the current DB contract. The frontend validates `serverId`, `reportTypeKey`, `title`, `description` and `reportingHeroId`; it does not require or send a fake `reportingUserId` because the DB workflow resolves the authenticated user.
- H11 maps optional accused hero, related item, related trade id and trade reference only when present, requires both returned `report_id` and `case_id`, and does not direct-read/write `player_abuse_reports` or call separate audit helpers.
- H11 is a service-only slice with no meaningful UI smoke path. Technical verification covered RPC payloads, unsupported user id args, required fields, empty RPC responses, `npx tsc --noEmit`, targeted specs and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- H12 accepted on 2026-04-30 as a service/read-model slice: player abuse report list loading now requires `serverId`, `heroId` and `userId`, combines hero-owned reports and user-only reports, and defensively filters final rows by `server_id`.
- H12 loads DB-backed report type labels including inactive/deprecated referenced keys, loads linked case status through server-scoped `anti_abuse_cases` reads, and exposes player-facing status as `playerStatusMessage` plus limited linked case status.
- H12 player-facing models omit staff-only and global account fields such as `adminNotes`, `adminDescription`, `statusReason`, `reportingUserId`, `accusedUserId`, and linked case `operatorNotes`/`verdictReason`.
- H12 has no meaningful UI smoke path yet. Technical verification covered mapper and service specs for hero/user reports, server scope, cross-server leakage prevention, inactive report type labels, linked case status, staff-only field privacy, `npx tsc --noEmit` and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- H13 accepted on 2026-04-30: staff can browse selected-server anti-abuse cases at `/admin/anti-abuse-cases`, gated by explicit anti-abuse triage access and linked from the admin navigation.
- H13 case list filters cover status, verdict, source, created date range and participant target filters. Participant filtering uses existing server-scoped moderation target search autocomplete for hero/account lookup, not UUID-only text fields, while raw technical ids remain searchable through that safe target-search path.
- H13 list loading is manual through `Apply filters`, guards stale list responses, clears participant target controls/form filters/applied filters on selected-server or access changes, and guards stale autocomplete suggestions. `/admin/anti-abuse-cases/:caseId` is the staff case detail route implemented by H14.
- H13 was verified with `npx tsc --noEmit`, targeted H13/admin-access/anti-abuse display specs, `npm run build`, and route smoke for `/admin/anti-abuse-cases` plus `/admin/anti-abuse-cases/:caseId`; build still has the known bundle budget/CommonJS warnings but no hard failure. Full manual data smoke with real case/signal content is deferred until gameplay data exists.
- H14 accepted on 2026-04-30: staff can review selected-server anti-abuse case details at `/admin/anti-abuse-cases/:caseId`, gated by anti-abuse triage access and backed by the server-scoped `AntiAbuseCaseDetails` aggregate.
- H14 detail includes staff-facing sections for header/status/verdict/reasons/operator notes, participants, signals, reports, declarations, audit logs, sanctions, Character Point penalties and sanction items. The UI is split into small section components and remains read-only: no mutating RPC, direct writes or separate audit writes are introduced.
- H14 uses DB-backed anti-abuse dictionary labels as primary staff-facing labels for signal, report, declaration and sanction types. Raw technical keys remain secondary metadata, and referenced inactive/deprecated dictionary rows are loaded through `AntiAbuseReferencedDictionaries`.
- H14 keeps JSON payloads in a shared collapsed `CollapsedJsonPreview` diagnostic component. Repeated empty-value display uses `displayValue`.
- H14 was verified with `npx tsc --noEmit`, targeted H14/H5 specs (`anti-abuse-case-detail-page.spec.ts` and `anti-abuse-case-details.spec.ts`), `npm run build`, and route smoke for `/admin/anti-abuse-cases` plus `/admin/anti-abuse-cases/case-1`; build still has the known bundle budget/CommonJS warnings but no hard failure. Full manual smoke of complete case detail on real gameplay case/signal data is explicitly deferred until such data exists.
- H15 accepted on 2026-04-30: staff can update an anti-abuse case process status from the selected-server case detail page through the canonical `AntiAbuseDecisions.setCaseDecision(...)` workflow.
- H15 status-only payloads send only `caseId`, `status` and `statusReason`; they do not echo read-model fields such as verdict, sanction flags, no-sanction reason or operator notes, avoiding accidental overwrite of parallel decision edits.
- H15 requires `statusReason`, guards stale child submit responses with `DestroyRef`/`takeUntilDestroyed`, and the parent detail page defensively ignores decisions for another case, server, route case id or selected server.
- H15 keeps status form state synced with the current case status without clearing success feedback after a local detail update. It was verified with `npx tsc --noEmit`, targeted specs (`anti-abuse-case-detail-page.spec.ts` and `anti-abuse-decision-rpc.spec.ts`, 14 SUCCESS), `npm run build`, and route smoke for `/admin/anti-abuse-cases` plus `/admin/anti-abuse-cases/case-1`; build still has the known bundle budget/CommonJS warnings but no hard failure. Full manual smoke of the status transition on real case/staff data is deferred until representative gameplay cases exist.
- H16 accepted on 2026-04-30: staff can set the anti-abuse case verdict and sanction requirement from the selected-server case detail page through the canonical `AntiAbuseDecisions.setCaseDecision(...)` workflow.
- H16 verdict options cover `no_abuse`, `insufficient_evidence`, `abuse_confirmed` and `resolved_by_voluntary_return`; no `false_positive` verdict option was added. Verdict and verdict reason are required, `sanctionRequired` is handled by a checkbox, and `noSanctionReason` is sent as `null` when a sanction is required.
- H16 blocks resolved cases from being saved with `sanctionRequired = true` when no sanctions are linked, warns when the case is marked sanction-required without sanctions, omits `operatorNotes` from verdict payloads, and preserves existing `statusReason` or uses the stable fallback `Verdict updated.` without copying `verdictReason` into `statusReason`.
- H16 uses the same stale child response and parent case/server/route/selected-server guards as H15. It was verified with `npx tsc --noEmit`, targeted specs (`anti-abuse-case-detail-page.spec.ts` and `anti-abuse-decision-rpc.spec.ts`, 18 SUCCESS), `npm run build`, and route smoke for `/admin/anti-abuse-cases` plus `/admin/anti-abuse-cases/case-1`; build still has the known bundle budget/CommonJS warnings but no hard failure. Full manual smoke of verdict transitions on real case/staff data is deferred until representative gameplay cases exist.
- Planning note: status and verdict action sections now share a similar workflow-action shell. If additional case action cards are added, consider a light shared wrapper/helper for error, success, loading and submit layout rather than copying the pattern further.
- H17 accepted on 2026-04-30: anti-abuse sanctions, sanction item links and Character Point penalties now have a dedicated domain model file at `anti-abuse-sanction.model.ts`.
- H17 keeps re-exports from `anti-abuse-decision.model.ts` for existing public imports, while runtime imports for sanction-specific services, mappers and UI sections now use `anti-abuse-sanction.model.ts`.
- H17 adds explicit fields that were previously missing from the frontend domain models: `AntiAbuseSanctionDecision.createdAt`, `CharacterPointPenaltyDecision.createdByUserId` and `CharacterPointPenaltyDecision.createdAt`. The row mappers map these from table columns directly, without hiding core data in metadata JSON.
- H17 was verified with `npx tsc --noEmit`, targeted specs (`anti-abuse-decision-mappers.spec.ts`, `anti-abuse-case-details.spec.ts`, `anti-abuse-decision-display.spec.ts`, 12 SUCCESS), `npm run build`, and technical route smoke for `/admin/anti-abuse-cases/case-1`; build still has the known bundle budget/CommonJS warnings but no hard failure. H17 is service/model-only, so full manual UI smoke is not meaningful.
- Reporting rule from H18 onward: task reports should include a short Shared/reuse check listing reused shared/admin components, checked-but-not-reused components or patterns, and any new component justification.
- H18 accepted on 2026-04-30: anti-abuse sanction forms now have a DB-backed staff-facing form model based on `AntiAbuseSanctionTypeEntry`.
- H18 base required fields are `reason`, `targetHeroId` and `targetUserId`. The target hero/account pair remains required even when `requiresTargetHero` is false, because the current `CreateAntiAbuseSanctionInput` and `create_anti_abuse_sanction` RPC require both identifiers.
- H18 maps sanction type flags to dynamic fields: `requiresSourceHero -> sourceHeroId`, `requiresDurationDays -> durationDays`, `requiresCharacterPointsAmount -> amountCharacterPoints`, and `requiresItemSelection -> itemIds`. `adminDescription` remains available because this is a staff-facing form model.
- H18 was verified with `npx tsc --noEmit`, targeted specs (`anti-abuse-sanction-form.spec.ts` and `anti-abuse-dictionary.spec.ts`, 8 SUCCESS), `npm run build`, and technical route smoke for `/admin/anti-abuse-cases/case-1`; build still has the known bundle budget/CommonJS warnings but no hard failure. H18 is model-only, so manual UI smoke is not meaningful.
- H19 accepted on 2026-04-30: staff can create anti-abuse sanctions from the selected-server case detail page through canonical `AntiAbuseDecisions.createSanction(...)`.
- H19 supports warning/suspension/fine/item sanction creation flow. Character Point fines create a linked Character Point penalty, and item sanctions link selected item evidence/context through `addSanctionItem(...)`; no direct writes or frontend audit writes are introduced.
- H19 uses server-scoped search/picker flows for target hero/account, source hero and item selection instead of UUID-only staff inputs. Hidden dynamic fields are cleared when sanction type changes, invalid number values are explicit validation errors, stale guards check case and server context, and partial linked-record failures are surfaced while still refreshing the detail aggregate after the base sanction is created.
- H19 was verified with `npx tsc --noEmit`, targeted H19/detail specs (`anti-abuse-case-sanction-create-section.spec.ts` and `anti-abuse-case-detail-page.spec.ts`, 23 SUCCESS), `anti-abuse-decision-rpc.spec.ts` (5 SUCCESS), `npm run build`, and route smoke for `/admin/anti-abuse-cases` plus `/admin/anti-abuse-cases/case-1`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- H19 full manual smoke is deferred until representative gameplay case/item data exists. Later smoke should cover warning sanction, Character Point fine plus created penalty, item recovery plus selected item links, partial linked-record failure messaging, detail refresh after success, and server-scoped target/item search.
- H20 accepted on 2026-04-30: staff can update existing anti-abuse sanction status from the selected-server case detail page through canonical `AntiAbuseDecisions.setSanctionStatus(...)`.
- H20 requires sanction, status and status reason, uses central sanction status options, refreshes the parent detail after success, and does not introduce direct writes or frontend audit writes.
- H20 protects stale success and stale error responses by checking submit-time case/server context, verifying the requested sanction still exists in the current sanctions list, and requiring the currently selected sanction id to still match the requested sanction id. Switching sanctions clears stale status reason, error and success feedback; sanction dropdown labels include type/status/target/reason preview instead of reason-only text.
- H20 was verified with `npx tsc --noEmit`, targeted H20/detail/RPC specs (`anti-abuse-case-sanction-status-section.spec.ts`, `anti-abuse-case-detail-page.spec.ts`, `anti-abuse-decision-rpc.spec.ts`, 27 SUCCESS), `npm run build`, and prior route smoke for `/admin/anti-abuse-cases` plus `/admin/anti-abuse-cases/case-1`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- H20 full manual smoke is deferred until representative gameplay sanctions/cases exist. Later smoke should cover progress, cancel, forgive and fail flows with real sanctions and staff session context.
- H21 accepted on 2026-04-30: staff can inspect Character Point fine debt in case detail and update linked CP penalty status through canonical `AntiAbuseDecisions.setCharacterPointPenaltyStatus(...)`.
- H21 does not add direct writes or automatic CP siphoning. The status action requires penalty, status and status reason, uses central sanction status options, labels penalty choices with hero/status/debt/reason context, and refreshes the parent case detail after success.
- H21 protects stale success and stale error responses by checking submit-time case/server context, verifying the requested penalty still exists in the current detail aggregate, and requiring the currently selected penalty id to still match the requested penalty id. Switching penalties clears stale status reason, error and success feedback.
- H21 was verified with `npx tsc --noEmit`, targeted H21/detail/RPC specs (`anti-abuse-case-penalty-status-section.spec.ts`, `anti-abuse-case-detail-page.spec.ts`, `anti-abuse-decision-rpc.spec.ts`, 28 SUCCESS), `npm run build`, and route smoke for `/admin/anti-abuse-cases` plus `/admin/anti-abuse-cases/case-1`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- H21 full manual smoke is deferred until representative gameplay cases and CP penalty data exist. Later smoke should cover complete, cancel, forgive and fail flows on real CP penalties with staff session context.
- H22 accepted on 2026-04-30: staff can review repeat-offender history for a selected hero/account from the selected-server anti-abuse case detail page.
- H22 adds a dedicated server-scoped `AntiAbuseRepeatOffenderHistoryService` over anti-abuse cases, participants, sanctions and Character Point penalties. It excludes the current case, uses final `serverId + id IN (...)` case resolution to avoid cross-server leakage, and does not use the legacy moderation history RPC.
- H22 repeat-offender UI filters out empty participant targets, preserves stale success/error guards for target/case/server changes, and displays prior cases, sanctions/warnings and CP penalties with totals for staff review.
- H22 carries referenced sanction type dictionaries in the history read model by reusing `AntiAbuseReferencedDictionaries.getForReferences(...)`, so prior sanction/warning type labels remain DB-backed even when the type is not present in the current case detail dictionaries. Raw sanction type keys remain secondary technical metadata.
- H22 was verified with `npx tsc --noEmit`, targeted H22/detail specs (`anti-abuse-repeat-offender-history.spec.ts`, `anti-abuse-case-repeat-offender-history-section.spec.ts`, `anti-abuse-case-detail-page.spec.ts`, 23 SUCCESS), `npm run build`, and route smoke for `/admin/anti-abuse-cases` plus `/admin/anti-abuse-cases/case-1`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- H22 full manual smoke is deferred until representative anti-abuse history data exists. Later smoke should cover real prior cases, sanctions, warnings, CP penalties, current-case exclusion, server-scoped target selection and DB-backed labels on inactive/deprecated sanction types.
- I1 accepted on 2026-04-30: runtime item domain models now understand item lifecycle fields from the current `items` table.
- I1 adds `ItemReadModel` and `mapItemReadModel(...)` with `status`, `scrappedAt`, `recoverableUntil` and `updatedAt`, plus the existing runtime item identity, generation, shelf, value and metadata fields. This prepares I2 to filter scrapped items from normal player inventory/armory paths without reworking the base item row contract.
- I1 also expands the equipped-item join type/select to include lifecycle columns, but intentionally does not filter scrapped items yet because that is I2 scope.
- I1 was verified with `npx tsc --noEmit`, targeted `item-mappers.spec.ts` (`1 SUCCESS`) and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure. UI/manual smoke is not applicable because I1 is a model/mapper-only slice.
- I2 accepted on 2026-04-30: normal player-facing equipment bonus resolution now treats only `items.status = active` as usable.
- I2 adds `isPlayerUsableItemStatus(...)` to the runtime item domain model and uses it in `EquipmentBonusesService` so `scrapped`, `locked_trade` and `locked_auction` equipped items do not contribute combat/equipment bonuses.
- I2 preserves the existing integrity guard for missing joined item rows: `row.items === null` still raises `Equipped item "... could not be loaded."` rather than being silently treated as inactive.
- I2 was verified with `npx tsc --noEmit`, targeted item/equipment specs (`item-mappers.spec.ts`, `equipment-bonuses.spec.ts`, 4 SUCCESS) and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure. UI/manual smoke is not meaningful yet because the current armory route does not expose a runtime inventory list.
- I3 accepted on 2026-04-30: safe item scrap now has a core skeleton backed by the canonical `scrap_hero_item` RPC.
- I3 adds `ItemLifecycleService`, item lifecycle RPC types/mappers and `resolveSafeItemScrapBehavior(...)`. The frontend service does not direct-delete or direct-write `items`; no-affix permanent removal is a DB/RPC decision, and `permanent_delete_candidate` is only a prediction/classification hint.
- I3 intentionally does not expose `p_recoverable_until` in the player-facing service input, so UI/client code does not control the recovery window. Future UI should refresh inventory/equipment after success and should not assume the item row still exists after `scrap_hero_item` returns.
- I3 was verified with `npx tsc --noEmit`, targeted lifecycle specs (`item-lifecycle-rpc.spec.ts`, `item-lifecycle.spec.ts`, 7 SUCCESS) and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure. UI/manual smoke is not applicable because I3 is a core service/mapper skeleton.
- I4 accepted on 2026-04-30: staff item recovery now has core service/model/mapper support backed by canonical `recover_scrapped_item` and dedicated recoverable-scrapped read model RPC `search_recoverable_scrapped_items_page`.
- I4 extends `ItemLifecycleService` with recoverable item search and recovery operations, maps recovery/search RPC args/results, and keeps recovery behind DB workflow ownership with no direct frontend writes or deletes to `items`.
- I4 lifecycle operation results support both scrap and recovery semantics: scrap can return `status = scrapped` with lifecycle timestamps, while recovery can return `status = active` with `scrappedAt` and `recoverableUntil` cleared to `null`. The frontend should refresh inventory/equipment after recovery and not assume a stale scrapped item row remains valid.
- I4 was verified with `npx tsc --noEmit`, targeted lifecycle specs (`item-lifecycle-rpc.spec.ts`, `item-lifecycle.spec.ts`, 13 SUCCESS) and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure. Manual UI smoke is not applicable because I4 is service/model/mapper-only; full staff recovery UI smoke is deferred to a later UI task with real staff data.
- J1 accepted on 2026-04-30 as an inspect/preflight slice for trade and auction frontend planning.
- J1 confirmed that J2 can proceed on the current direct-trade and one-item auction DB/RPC contract without a new DB foundation and without reviving `market_listings`. Generated types include the expected public direct trade and auction RPCs; helper RPCs such as unlock/release/finalize are internal and should not be treated as player-facing frontend contracts.
- J1 found no active `market_listings` frontend path in `src`. Future J2/J3/J4 work should add typed domain/read/mutation services over the current tables and public workflow RPCs instead of designing a new player market schema.
- J2 accepted on 2026-04-30: direct trade now has a read-only frontend domain/service layer for active offers and direct-trade transaction history.
- J2 adds `DirectTrades`, direct trade read models and mappers. Reads are selected-server and active-hero scoped, active offers load where the hero is creator or target, transaction history excludes `auction_sale`, and linked hero/current-item labels are fetched only by concrete IDs.
- J2 does not add mutation paths, direct writes or RPC writes. Player-facing read models intentionally do not expose raw `status_reason` or transaction `reason` fields; future UI should introduce explicit player-safe status messaging only if supported by a safe contract.
- J2 was verified with `npx tsc --noEmit`, targeted direct trade specs (`direct-trade-mappers.spec.ts`, `direct-trades.spec.ts`, 7 SUCCESS) and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure. Manual UI smoke is not applicable because J2 is service/model/mapper-only.
- J3 accepted on 2026-04-30: `/game/trade` now exposes direct trade create, respond, confirm, cancel and reject flows through public direct-trade RPCs.
- J3 keeps the route component thin and splits the workflow into `TradeOverviewState`, `TradeCreateOfferState`, `TradeRespondOfferState`, `TradeOfferActionsState`, `TradeFeedbackState`, `TradeRequestToken` and pure validation/label helpers. `TradePage.providers` supplies the local state graph, stale guards are covered for overview/search/action responses, and direct trade mutations do not write directly to trade, lock, item or transaction tables.
- J3 was verified with `npx tsc --noEmit`, targeted direct trade/trade page specs (`direct-trade-mappers.spec.ts`, `direct-trade-rpc.spec.ts`, `direct-trades.spec.ts`, `direct-trade-actions.spec.ts`, `trade-page.state.spec.ts`, 19 SUCCESS), `npm run build`, and route smoke `/game/trade -> 200`; build still has the known bundle budget/CommonJS warnings but no hard failure. Manual create/respond/confirm/cancel/reject smoke is pending until sandbox data has two heroes, active items, a session and a real trade flow.
- J4 accepted on 2026-04-30: `/game/auction` now exposes player-facing one-item auction listing, bidding, buy-now, close and cancel flows through public auction RPCs.
- J4 keeps auction responsibilities split into `PlayerAuctions`, `PlayerAuctionActions`, auction RPC/domain mappers, `AuctionOverviewState`, `AuctionCreateListingState`, `AuctionListingActionsState`, `AuctionFeedbackState`, route-level `AuctionPageState` facade and pure validation/label helpers. The UI does not direct-write auction, lock, item status or transaction tables.
- J4 preserves action-specific RPC result semantics: create/cancel return `listingId`, bid returns `bidId`, buy-now returns `transactionId`, and close returns `transactionId | null`; stale guards use request token plus current server/hero/listing context. Seller cancel is hidden once bids/current bid/current highest bidder exist.
- J4 was verified with `npx tsc --noEmit`, targeted auction/sidebar specs (`player-auction-rpc.spec.ts`, `player-auction-actions.spec.ts`, `auction-page.state.spec.ts`, `game-sidebar.spec.ts`, 17 SUCCESS), `npm run build`, and route smoke through `/game/auction`; build still has the known bundle budget/CommonJS warnings but no hard failure. Manual create/bid/buy-now/cancel/close smoke is pending until sandbox data has an active item, at least two heroes/users, Character Points and a real auction flow.
- J5 accepted on 2026-05-01: trade/auction transaction item history now consumes existing `player_trade_transaction_items` lightweight snapshots instead of reconstructing historical item features from current live items.
- J5 extends `DirectTradeTransactionItemReadModel` and `mapDirectTradeTransactionItem(...)` with transaction-time snapshot fields for base, quality, affixes, prefix/suffix flags, value bucket and snapshot JSON. Auction history reuses that mapper for `auction_sale` transaction items.
- J5 adds auction sale history to `/game/auction` through `PlayerAuctions`, reading active-hero `player_trade_transactions(transaction_type = auction_sale)` and linked historical transaction item snapshots. No write path or client-side fake snapshot substitute was added.
- J5 was verified with `npx tsc --noEmit`, targeted snapshot/auction specs (`direct-trade-mappers.spec.ts`, `player-auctions.spec.ts`, `auction-page.state.spec.ts`, 9 SUCCESS) and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure. Manual auction-history smoke is pending until sandbox data has completed auction sales.
- J6 accepted on 2026-05-01: trade and auction frontend mutation services are aligned with the DB-owned lifecycle audit foundation.
- J6 keeps direct trade and auction lifecycle audit in canonical DB RPCs/triggers. `DirectTradeActions` and `PlayerAuctionActions` continue to use public RPCs and do not use Angular `AuditWriter`; focused specs assert `AuditWriter.write(...)` is not called and direct `create/update/delete` writes are not used.
- J6 was verified with `npx tsc --noEmit`, targeted trade/auction action specs (`direct-trade-actions.spec.ts`, `player-auction-actions.spec.ts`, 5 SUCCESS) and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure. Manual smoke is not applicable because J6 is service/test alignment only.
- J7 accepted on 2026-05-01: vendor scrap/sell for drachmas now has core frontend service/model/mapper support over the canonical `vendor_scrap_hero_item(...)` DB workflow.
- J7 adds `vendorScrapHeroItem(...)` and `getVendorScrapDrachmaPayoutPercent()` to `ItemLifecycleService`, plus typed RPC args/result mapping for lifecycle outcome and payout fields. The frontend does not call `apply_reward_resource_delta(...)` directly and does not direct-write `items`, `hero_resources`, audit logs or resource balances.
- J7 was verified with `npx tsc --noEmit`, targeted lifecycle specs (`item-lifecycle-rpc.spec.ts`, `item-lifecycle.spec.ts`, 17 SUCCESS) and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure. Manual smoke is not applicable until a future player-facing inventory/armory vendor sell action exists with real active item data.
- K1 accepted on 2026-05-01 as an inspect/contract-alignment slice for the DB-owned anti-abuse signal generation foundation.
- K1 confirmed that Angular must not direct-insert `anti_abuse_signals`, `anti_abuse_cases`, case links or participants. Safe frontend-facing paths are existing staff read paths, public report/declaration RPCs and the approved Edge Function boundary for identity observation; trade/auction signal generation remains DB/trigger-owned after transactions.
- K1 classified internal helpers such as `insert_trade_transaction_anti_abuse_signal(...)`, `insert_identity_anti_abuse_signal(...)`, `create_or_link_anti_abuse_case_for_signal(...)`, `refresh_anti_abuse_case_signal_stats(...)`, participant/link helpers, trigger wrappers and service-role identity observation helpers as DB-owned, not Angular service contracts. Build/tests were not applicable because K1 made no code changes.
- K2 accepted on 2026-05-01: anti-abuse DB-generated signals now have a server-scoped core read service and list read model.
- K2 adds `AntiAbuseSignals.getSignalsForServer(...)` over `anti_abuse_signals`, requiring `serverId`, mapping through the existing `AntiAbuseSignalReadModel` / `mapAntiAbuseSignalReadModel(...)`, and loading DB-backed signal type labels through `AntiAbuseReferencedDictionaries`. Referenced signal type keys are deduplicated before dictionary lookup, including repeated signals of the same type.
- K2 does not add Angular signal generation or direct `insert/update/delete` paths for `anti_abuse_signals`, `anti_abuse_cases`, case links or participants. Verification: `npx tsc --noEmit` passed; focused `anti-abuse-signals.spec.ts` passed with 5 SUCCESS after sandbox `spawn EPERM` rerun outside sandbox. Manual smoke is not applicable because this is a core read-service/model slice without UI.
- K3 accepted on 2026-05-01: staff case detail signal review now surfaces DB-owned trade/auction evidence context from the signal row and lightweight metadata without recomputing detection logic in Angular.
- K3 keeps DB-backed signal labels as primary text and raw `signalTypeKey` as secondary metadata. Trade/auction markers are shown only for trade/auction entity types, `trade.` / `auction.` signal type keys, or explicit trade/auction metadata references; generic `itemId` / `transactionItemId` metadata alone does not classify a signal as trade/auction evidence.
- K3 intentionally does not add deep links because there is no safe staff-facing trade/auction evidence route yet. Verification: `npx tsc --noEmit` passed; focused `anti-abuse-case-signals-section.spec.ts` passed with 3 SUCCESS after sandbox `spawn EPERM` rerun outside sandbox; `npm run build` passed with existing bundle budget/CommonJS warnings. Manual smoke is pending real DB-generated trade/auction signal case data.
- K4 accepted on 2026-05-01: Angular identity observation integration now goes only through the approved Supabase Edge Function `record-identity-observation`.
- K4 adds a thin `AntiAbuseIdentityObservation` service plus typed Edge Function body/response mappers. The frontend does not direct-write identity observation tables, does not call service-role `record_anti_abuse_identity_observation(...)`, does not send raw IP/user-agent/hash fields and does not hash identity material client-side.
- K4 maps both returned Edge Function errors and rejected `functions.invoke(...)` calls to safe status text so raw env/backend errors do not leak to callers. Verification: `npx tsc --noEmit` passed; focused identity observation mapper/service specs passed with 6 SUCCESS; `npm run build` passed with existing bundle budget/CommonJS warnings. Manual smoke is pending deployed Edge Function config/secrets and authenticated runtime invocation.
- K5 accepted on 2026-05-01: anti-abuse case overview now has a `Signal grouping and review context` section using the existing `AntiAbuseCaseDetailReadModel` aggregate.
- K5 shows grouping key, linked signal counts, case-signal links, participants, linked signal facts and participant facts without adding a new read service. Linked signal labels use DB-backed signal type dictionaries where available.
- K5 explicitly explains that signals are review aids and do not automatically punish players. It does not change status, verdict or sanction workflows. Verification: `npx tsc --noEmit` passed; focused `anti-abuse-case-overview-section.spec.ts` passed with 1 SUCCESS after sandbox `spawn EPERM` rerun outside sandbox. Manual smoke is pending real DB-generated grouped signal/case data.
- L1 accepted on 2026-05-01 as an inspect/types-alignment slice for the Epic L PvE exploration/trials foundation.
- L1 confirmed that generated `database.types.ts` exposes the expected exploration/PvE tables, including difficulty tiers, minigames, trial/encounter definitions, reward profiles/grants, daily action counters, hero explorations, nodes, edges, steps, effects, challenge attempts and test overrides.
- L1 confirmed that generated types expose runtime RPCs, challenge completion/auto-resolve/force-complete RPCs, sandbox/admin helper RPCs and all L-DB4c preview/simulation RPCs. `get_hero_exploration_state(...)` and `get_hero_exploration_debug_state(...)` return `Json`, so L2 should add guarded core/domain mappers instead of assuming raw JSON shape in components. Verification: `npx tsc --noEmit` and `npm run build` passed; build retained the known bundle budget/CommonJS warnings.
- L2 accepted on 2026-05-01: exploration/trial/reward/preview frontend domain models and mappers now cover the DB-backed PvE foundation without exposing raw generated rows or raw RPC JSON to future components.
- L2 adds guarded JSON mapping for the real `get_hero_exploration_state(...)` player shape and a separate debug aggregate for `get_hero_exploration_debug_state(...)`. Generic JSON guard/read primitives live in shared `core/utils/json-read.ts`, while exploration-specific RPC mapping remains in `exploration-runtime-json-mappers.ts`.
- L2 was verified with `npx tsc --noEmit`, focused shared JSON/exploration mapper specs and `npm run build`; build still has the known bundle budget/CommonJS warnings but no hard failure.
- L3 accepted on 2026-05-01: `/game/exploration` now has a player-facing start/status page for the active hero/server.
- L3 adds the `HeroExplorations` core service over DB-backed active difficulty tiers, `get_hero_exploration_state(...)`, `start_or_get_hero_exploration(...)` and read-only `preview_trial_opportunity_curve(...)`. Mutating runtime start uses the public RPC only; no direct writes to exploration, reward or item tables were added.
- L3 keeps page state split into `ExplorationOverviewState`, `ExplorationPreviewState`, `ExplorationStartState`, `ExplorationFeedbackState` and a small `ExplorationPageState` facade. Shared stale request handling now uses neutral `core/utils/request-token.ts`, reused by trade, auction and exploration. Manual runtime smoke is pending logged-in hero/server data and a real exploration RPC flow.
- L4 accepted on 2026-05-01: `/game/exploration` now displays current graph/path state from `get_hero_exploration_state(...)` and lets the player choose valid DB-provided directions.
- L4 adds `ExplorationMovementState` and `HeroExplorations.startHeroExplorationStep(...)` over canonical `start_hero_exploration_step(...)`; after the movement RPC, the frontend refreshes canonical state through `get_hero_exploration_state(...)`. The UI presents `Known path` / `Undiscovered branch` from current DB edge state only, without frontend rerolls.
- L4 blocks movement while an active step or active challenge exists, when no attempts remain, or when no available directions exist. Verification: `npx tsc --noEmit`, focused exploration service/page specs and `npm run build` passed; build retained the known bundle budget/CommonJS warnings. Route smoke `/game/exploration` passed, while full movement/trial manual smoke remains pending real runtime data.
- L5 accepted on 2026-05-01: `/game/exploration` now shows active movement step timer/progress from DB `startedAt`, `resolvesAt` and `status`, and exposes `Check result` only when the DB-ready time has passed.
- L5 adds `ExplorationStepState` and `HeroExplorations.resolveHeroExplorationStep(...)` over canonical `resolve_hero_exploration_step(...)`; after resolve, canonical state is refreshed through `get_hero_exploration_state(...)`. Normal player UI does not expose `skip_hero_exploration_step_timer(...)`, which remains a sandbox/admin helper.
- L5 was verified with `npx tsc --noEmit`, focused exploration service/page specs and `npm run build`; build retained the known bundle budget/CommonJS warnings. Full timer/resolve manual smoke remains pending real active exploration step data.
- L6 accepted on 2026-05-01: resolved exploration step outcomes are now shown from DB `resolve_hero_exploration_step(...)` snapshots, paired with refreshed canonical exploration state.
- L6 adds `HeroExplorationStepResolutionReadModel`, keeps the last resolved step result scoped to the current exploration, and presents known-path/movement, empty/nothing flavor, encounter started, trial manifested and trial manifestation-fail outcomes without frontend reroll or reward generation.
- L6 split the growing `/game/exploration` template into `ExplorationStatusSection`. Verification: changed-file list matched the expected 11 files, `npx tsc --noEmit` passed, focused exploration service/page specs passed with 14 SUCCESS, and `npm run build` passed with the known bundle budget/CommonJS warnings. Manual outcome smoke remains pending real resolved step/challenge data.
- L7 accepted on 2026-05-01: `/game/exploration` now shows active trial/encounter challenge attempts from canonical exploration state and supports prototype manual completion plus auto-resolve through DB challenge RPCs.
- L7 adds `HeroExplorations.completeHeroExplorationChallengeAttempt(...)`, `HeroExplorations.autoResolveHeroExplorationChallengeAttempt(...)` and separate `ExplorationChallengeState`. Normal player UI does not expose `force_complete_hero_exploration_challenge_attempt(...)`; prototype manual success/fail copy is explicitly marked as sandbox/minigame placeholder.
- L7 verification: `npx tsc --noEmit` passed, focused exploration service/page specs passed, and `npm run build` passed with the known bundle budget/CommonJS warnings. Full manual smoke for challenge/minigame flow remains pending real trial/challenge DB data.
- L8 accepted on 2026-05-01: `/game/exploration` now shows persisted challenge rewards through a read-only DB path.
- L8 adds `HeroExplorationRewards` and `ExplorationRewardState` to read completed challenge attempts, reward grants, reward grant entries and generated item rows. It does not grant rewards from Angular and does not write to reward or item tables.
- L8 also split the exploration status aggregate into local challenge/result/reward cards. `ExplorationRewardState` clears reward on context changes and ignores stale responses by request token, active hero/difficulty context and current exploration id. Verification: `npx tsc --noEmit`, focused exploration reward/page specs with 16 SUCCESS and `npm run build` passed with the known bundle budget/CommonJS warnings. Manual reward smoke is deferred until admin/debug tooling can create real trial/challenge/reward data.
- L9 accepted on 2026-05-01 for the frontend/admin-debug slice: `/admin/exploration-debug` is a server-scoped sandbox page for inspecting exploration debug state and calling DB-owned helper RPCs. It uses staff hero search instead of raw UUID as the main path, DB-backed/select-driven controls for difficulty, action type, step, challenge, reward profile, trial definition, encounter definition and manifestation status, and `ToastService` for successful debug actions.
- L9 adds `HeroExplorationDebug`, shared `ExplorationDefinitions`, typed debug RPC mappers and split page state/sections. Debug actions still go through canonical helper RPCs and do not direct-write exploration/reward/item tables. Verification: `npx tsc --noEmit`, focused exploration-debug specs with 12 SUCCESS, `npm run build`, and route smoke for `/admin/exploration-debug` and `/game/exploration` passed with the known build warnings. Full gameplay smoke remains pending a backend/RLS fix for `permission denied for table hero_exploration_challenge_attempts`.
- L10 accepted on 2026-05-01: `/admin/exploration-lab` now exposes the L-DB4c preview/simulation RPCs as a read-only balancing and explainability lab.
- L10 adds `ExplorationLabPreviews`, typed preview RPC args/mappers and local lab sections for chance previews, reward previews and trial opportunity simulation. The lab uses DB-backed dictionaries for difficulty, district, stats, reward profiles, trial definitions, item bucket profiles and item qualities; autocomplete object controls are mapped to explicit ids before RPC calls. Outputs show the RPC `explanation` text and simulation summary/distribution. Verification: `npx tsc --noEmit`, focused exploration lab/debug specs with 21 SUCCESS, `npm run build`, and route smoke for `/admin/exploration-lab` passed with the known build warnings.
- L11 accepted on 2026-05-01: `/admin/exploration-trials` now provides the admin/balancer trial definitions configurator.
- L11 loads trial definitions, canonical stats, exploration minigames, combat candidates, opponent definitions/families and formulas from DB-backed read models. Trial definition edits use `upsert_trial_definition`, combat candidate edits use `upsert_trial_combat_candidate`, and candidate deactivation uses `deactivate_trial_combat_candidate`, each with mandatory `reason`; the frontend does not direct-write `trial_definitions` or `trial_combat_candidates`. The UI uses reactive forms, generated keys for new trials via `toSlug`, stable existing keys unless advanced override is enabled, ToastService success feedback, and stale guards for save/deactivate responses. Verification: `npx tsc --noEmit`, focused exploration trials specs with 17 SUCCESS, and `npm run build` passed with the known build warnings.
- L11c accepted on 2026-05-02 after manual smoke: `/admin/exploration-trials` is now an explainable trial configurator rather than a raw table editor. Section intros and field help use DB-backed `ui_metadata_entries` (`trial_configurator_section` / `trial_configurator_field`) with exact missing namespace/key gap reporting. Trial definition selects persist and save through rendered PrimeNG/reactive-form paths; reward assignments use the canonical reward assignment RPC, DB-backed outcome/match dictionaries, hidden match-value cleanup and invalid range prevalidation; combat candidates react to draft minigame and block kind-specific saves until the trial definition is saved. Verification: `npx tsc --noEmit`, focused exploration trial/admin specs with 22 SUCCESS, and `npm run build` passed with the known build warnings.
- L12 frontend accepted on 2026-05-01: `/admin/exploration-encounters` now provides the admin/balancer encounter definitions configurator.
- L12 loads encounter definitions, minigames, difficulty tiers, districts, reward profiles, reward profile assignments, encounter combat candidates, opponent definitions/families and formulas from DB-backed read models. Encounter definition edits use `upsert_encounter_definition` / `deactivate_encounter_definition`, combat candidate edits use `upsert_encounter_combat_candidate` / `deactivate_encounter_combat_candidate`, and reward assignment edits use `upsert_reward_profile_assignment` / `deactivate_reward_profile_assignment`, each with mandatory `reason`; the frontend does not direct-write `encounter_definitions`, `encounter_combat_candidates` or `reward_profile_assignments`. The UI uses reactive forms, generated keys for new encounters via `toSlug`, stable existing keys unless advanced override is enabled, ToastService success feedback, and split stale-guarded action states for definition/candidate/reward workflows. Verification: `npx tsc --noEmit`, focused exploration encounter specs with 9 SUCCESS, and `npm run build` passed with the known build warnings. Full real-user smoke may still require backend/RLS grants for required admin read tables.
- L12b accepted on 2026-05-02: `/admin/exploration-encounters` now includes typed DB-backed resource payload, exploration effect definition and encounter effect payload workflows. Resource/effect mutations use approved RPC paths only, with no Angular direct writes to payload/effect tables. Payload action states are split by workflow and share `runEncounterWorkflowAction(...)` for token/finalize/toast/error/stale-guard handling. Key-like fields are generated or select/fallback driven, advanced key override still validates non-empty keys, reason validation is inline/touched instead of global page feedback, invalid metadata JSON remains visible and blocks RPC calls, and metadata JSON is kept under Advanced/Technical UI. Verification: `npx tsc --noEmit`, focused exploration encounter specs with 17 SUCCESS, and `npm run build` passed with the known build warnings.
- L12c accepted on 2026-05-02: `/admin/exploration-encounters` is now an explainable encounter configurator rather than a raw table editor. Section intros and field help use DB-backed `ui_metadata_entries` (`encounter_configurator_section` / `encounter_configurator_field`) with exact missing namespace/key gap reporting. The page separates encounter definition, reward routing, combat candidates, resource payloads, effect library and selected-encounter effect payloads; reward assignment summaries explain best-match profile selection and profile entries. Frontend validation now blocks known invalid min/max difficulty and district ranges before RPC, reward assignment match modes hide and clear stale values by mode, and draft encounter kind controls kind-specific section visibility while blocking payload/candidate saves until the definition is saved. Verification: `npx tsc --noEmit`, focused exploration encounter specs with 31 SUCCESS, and `npm run build` passed with the known build warnings; manual smoke was accepted by the user.
- L13 accepted on 2026-05-02: `/admin/reward-profiles` now provides the reward profile configurator for reusable reward bundles, reward profile entries, DB-backed reward outcome kinds and preview-only reward profile inspection. Reward mutations use `upsert_reward_profile`, `deactivate_reward_profile`, `upsert_reward_profile_entry`, `deactivate_reward_profile_entry`, `upsert_reward_outcome_kind` and `deactivate_reward_outcome_kind` through RPCs only; Angular does not direct-write reward tables or grant rewards from the admin UI. Entry kinds, amount modes, source kinds, assignment match kinds and resource types use DB-backed dictionaries with fallback/degraded warnings where appropriate. PvE reward entry editing filters amount modes by runtime contract: formula is limited to numeric rewards, item generation and exploration effects use `none`, and reserved `transfer_formula` is hidden. L13 also hardened PrimeNG `p-select` + Reactive Forms flows in reward profile and exploration encounter admin forms, moved transient page/action errors to ToastService, and left `p-message` only for persistent/degraded configuration context. Verification: `npx tsc --noEmit`, focused reward profile/exploration encounter specs with 42 SUCCESS, and `npm run build` passed with the known build warnings.
- M0 accepted on 2026-05-02: generated `database.types.ts` exposes the Epic M combat DB foundation, including combat enums, opponent/config/snapshot tables, explainability dictionaries, `get_combat_turn_limit`, `persist_combat_result_snapshot`, `can_read_combat_result`, and governed combat opponent admin RPCs. No generated types were edited manually. Verification: `npx tsc --noEmit` and `npm run build` passed with the known build warnings.
- M1 accepted on 2026-05-02: `FormulaRuntimeService` now supports admin-preview execution of `random()` and `random(min, max)`, detects non-deterministic formulas, humanizes random expressions, and validates unsupported random arity with a specific error. Formula editor and impact calculator previews mark random formulas as non-deterministic, skip stable chart plotting, expose reroll/sample behavior, and keep durable gameplay caveats explicit because authoritative workflows must evaluate random formulas server-side. Verification: `npx tsc --noEmit`, focused formula runtime/impact calculator specs with 7 SUCCESS, and `npm run build` passed with the known build warnings.
- M2 accepted on 2026-05-02: canonical combat domain contracts now live in `src/app/core/domain/combat/combat.model.ts` and are tied to generated DB combat enums/result snapshot semantics. Active `/game/combat` prototype types were split into `combat-sandbox.model.ts` so sandbox snapshots no longer pollute the canonical combat result model. Combat sandbox services/components import the sandbox model directly, and `combat.model.ts` no longer imports `IHeroStats` or declares `SandboxCombat*`, `CombatRoundEntry`, `CombatantSnapshot`, `CombatBalanceRules` or `CombatDerivedStats`. Verification: `npx tsc --noEmit`, focused combat model and combat equipment bonus specs with 5 SUCCESS total, and `npm run build` passed with the known build warnings. Refactor debt is recorded to retire the prototype sandbox after canonical runtime integration.
- Status/verdict/sanction/CP penalty action sections now repeat the same audited action shell. Before adding another similar status-action section, check whether a shared wrapper/state/helper is warranted for error/success/loading, submit layout and stale-guard behavior.
- `core` should continue to hold non-component logic:
  - domain models
  - domain-specific services
  - mappers
  - helpers/utils
  - feature config
- New gameplay systems should be split into small vertical slices.
- Combat should now evolve from the sandbox slice into reusable domain pieces, not a giant monolithic combat engine.
- Exploration, encounter, and trial logic should be built on top of the current formula/stat/bonus foundation instead of bypassing it.
- Use RPC/domain operations for critical economy mutations such as direct trade, auctions, Character Point balance changes, and item lock transitions.

---

## Update 2026-04-28 — U0 roles/staff/moderation DB foundation

U0-N4 Stage 1–2 database foundation has been implemented structurally.

Confirmed by schema/verification:

- `staff_permission_scopes` exists and stores moderator responsibility scopes.
- `server_staff_assignment_scopes` exists and assigns scopes to staff assignments.
- `moderation_action_types` exists and defines local/account warnings, restrictions, suspensions and bans.
- `moderation_actions` exists and stores server-scoped moderation actions with required reason/source fields.
- `moderation_action_status` enum exists.
- Validation and after-change triggers exist for moderation actions.
- Staff assignment eligibility trigger exists on `server_staff_assignments`.
- Default moderation config values resolve correctly:
  - warning duration = 30 days;
  - local restriction duration = 3 days;
  - auto suspension duration = 3 days;
  - staff-disqualifying suspension threshold = 15 days.
- RPC/helper grants are clean: no `PUBLIC`/`anon` execute on U0 mutating RPC/helper functions.
- Staff/user management RPC exists:
  - `assign_global_role`
  - `assign_server_staff`
  - `revoke_server_staff`
  - `set_server_staff_permission_scopes`
  - `user_has_staff_disqualifying_history`
- Moderation action/history RPC exists:
  - `create_moderation_action`
  - `set_moderation_action_status`
  - `get_user_moderation_history`
  - `get_hero_moderation_history`

Important remaining work:

- Generated Supabase types have been refreshed after the U0 foundation; future U0 implementation tasks may use the typed contracts where present.
- Update `database-current.md` and task docs before Codex uses the new schema.
- Runtime enforcement of restrictions in trade/auction/gameplay is not yet wired.
- Behavioral tests should be rerun later with a cleaner test harness or real sandbox data.
- G5 RPC should later be explicitly aligned to dedicated helpers for readability.

