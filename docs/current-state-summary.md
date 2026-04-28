# Monster Hunt - Current State Summary

Updated: 2026-04-28

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
| Exploration / trials / encounters | 5% | Documented conceptually, not implemented as a real loop yet. |
| Prestige / reputation | 0% | Not implemented yet. |
| Guilds / politics / sieges | 0% | Not implemented yet. |
| Trade / economy gameplay loop | 35% | Database/RPC foundation for Character Points, direct trade, auctions, item locks, and anti-abuse signals exists. Frontend gameplay surfaces and Trade Routes/building integration are still pending. |
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
- Frontend trade/auction gameplay surfaces are still pending.

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
