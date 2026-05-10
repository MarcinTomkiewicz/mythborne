# Monster Hunt - Current TODO

Updated: 2026-05-10

This file lists pending work derived from:
- `docs/project-context.md`
- `docs/database-current.md`
- `docs/current-decisions.md`
- `docs/ui-ux-notes.md`

Order reflects implementation priority, not final business priority.

## Current Codex Backlog Position

- UI/UX foundation accepted: UI-CORE-1 - Mythsworn UI style contract extraction, UI-CORE-2 - Global SCSS and shared pattern inventory, UI-CORE-3 - Local SCSS budget and style report checklist, UI-CORE-4 - Shared surface/card/badge/chip/page-header patterns, UI-CORE-5 - Icon placeholder and Game Icons mapping contract, UI-CORE-6 - Item popover shared component contract, UI-CORE-7 - Legacy Monster Hunt / `mg-*` SCSS modernization plan, UI-CORE-8 - Text utility semantics and `muted-text` cleanup, UI-CORE-9 - Surface/card/badge/chip production pattern expansion, UI-CORE-10 - Custom icons and brand asset registry, UI-CORE-11 - Prototype-to-production SCSS mapping, UI-CORE-12 - PrimeNG/vendor wrapper modernization and lookup order, UI-CORE-13 - Utility class audit, semantics and usage pass, UI-CORE-14 - PrimeNG table/paginator/list pattern decision, and UI-CORE-15 - Layout utilities and section pattern cleanup.
- UI/UX foundation docs UI-CORE-1 through UI-CORE-15 are accepted. UI-SHELL-00 through UI-SHELL-02 are accepted as no-code shell preflight/status artifacts in `docs/ui-ux/ui-shell-00-02-inventory.md`, covering README-first lookup, current shell rollback boundary and token/color anchor gaps. UI-SHELL-1 - Game shell style foundation remains conditionally accepted; later shell implementation should use the 00-02 artifact before runtime changes, and UI-SHELL-4 / UI-SHELL-23+ should resolve the shared sidebar nav item / active nav pattern debt. HOTFIX-COMBAT-LIVE is accepted; next task will be selected by user.
- Epic S item/equipment/admin alignment is accepted through S26. Future accepted Codex implementation tasks should update status docs automatically at acceptance unless the user says otherwise.
- Epic T Guild Foundation is accepted through T24. T0 verified current generated guild DB/RPC types; T1 added guild domain models, RPC type aliases and mapper tests; T2 added the canonical guild read service and current guild state; T3 added guild discovery/search service, state, generated RPC aliases and mapper coverage; T4 added the create-guild service/action and form-ready state over canonical RPC/config contracts; T5 added the guild invite RPC service/state and focused invite mappers over canonical invite contracts; T6 added request-to-join RPC service/state and focused join-request mappers over canonical join request contracts; T7 added guild member list/action service, state and focused member mappers over canonical member RPC contracts; T8 added guild leave/disband lifecycle service, state and focused lifecycle mappers over canonical lifecycle RPC contracts; T9 added emergency leader election read service/state and focused election mappers over canonical read RPC contracts; T10 added emergency leader election action service/state over canonical RPC contracts; T11 added guild armory read/action models, split read/action mappers and services over canonical guild armory RPC contracts; T12 added a read-only guild armory UI section/state for current items, available/borrowed state, borrower display, current loans and DB-backed capacity; T13 added guild armory deposit, owner withdraw and leader/officer remove UI actions through canonical `PlayerGuildArmoryActions`, with equipped-item deposit blocked before RPC and header refresh reloading both read and deposit contexts; T14 added guild armory borrow and return UI actions through canonical `PlayerGuildArmoryActions`, with visibility driven by DB-backed `canBorrow`/`canReturn` flags and no frontend ownership-transfer/trade/auction/vendor/equipment behavior; T15 added guild armory force-return UI actions through canonical `PlayerGuildArmoryActions.forceReturnGuildArmoryLoanForActiveHero(...)`, with visibility driven by DB-backed `canForceReturn`, no direct table access, no local ownership-transfer logic and no borrower equipment simulation; T16 added per-member guild armory access status and leader/officer block/unblock UI through `get_hero_guild_members(...)` and canonical `PlayerGuildArmoryActions.setGuildArmoryMemberAccessForActiveHero(...)`, with ToastService feedback and no local access-state fallback; T17 aligned player Armory item UI with guild armory usage through canonical guild armory reads and hides private item actions for deposited/borrowed guild items; T18 added a concise guild support placeholder that explains future siege and Argonautics group support as guild-membership-bound without fake actions or diplomacy UI; T19 added a read-only admin guild config summary to config definitions using canonical `PlayerGuild.getGuildConfigSummary()`, with unlimited armory capacity rendered clearly and no config mutation/direct DB access; T20 added `/game/guild`, a sidebar `Guild` entry and a thin page over `CurrentGuildState` that shows no-guild entry areas, in-guild overview/member/election summaries and the existing guild armory section without fake siege/Argonautics actions; T21 replaced the no-guild entry placeholders with real create/search/request/cancel/accept/reject UI over existing canonical guild states/services, with search read errors inline and transient action feedback through toasts; T22 added in-guild membership management UI for member list, invite create/cancel, incoming join request accept/reject and outgoing request cancel flows over existing canonical guild states/services, with capability-flagged actions, inline read errors and toast action feedback; T23 added kick/promote/demote/leave/disband UI over existing canonical member and lifecycle states/services, with role/lifecycle UI guards, required disband reason validation, toast action feedback and current guild/member-list refresh after success; T24 replaced the emergency election placeholder with real summary/candidate/start/nominate/start-voting/vote/finalize UI over `GuildEmergencyElectionState`, DB-backed capability flags and canonical election services/actions, without local quorum/result inference. Manual smoke remains pending for `/admin/config-definitions`, `/game/guild` create/search/request/cancel/invite flows, `/game/guild` in-guild invite/request/member-management flows, T23 role/lifecycle flows and T24 emergency election flows; T23 smoke is data-blocked because the current server has only one character/guild member, and T24 smoke is data-dependent on an eligible emergency election scenario.
- Epic U Luck Foundation is accepted through U13 cleanup. U0 confirmed generated Luck Foundation contracts without code changes; U1 added Luck domain models, generated RPC aliases and mappers; U2 added the canonical Luck RNG surface registry read service; U3 added Trial Power read/preview integration over DB RPCs; U4 aligned exploration RNG read state so `nothing` is the canonical fallback outcome and trial/encounter rolls preserve DB-returned chance/roll/Luck metadata; U5 added nested Trial Manifestation read-state on challenge attempts; U6 added nested Challenge Auto-resolve read-state while keeping combat challenges on the live-combat/manual boundary; U7 added DB-owned combat Luck RNG read-state on live timing manifests, split combat live mappers by responsibility and preserved `submit_combat_player_action(...)` as timing-input-only with no client-side damage/outcome/equipment/stat/Luck formula authority; U8 switched Exploration Lab generated item preview to DB-owned `preview_reward_generated_item_luck(...)`, preserves bucket/value/quality/base/prefix/suffix/budget/Luck breakdown and keeps one-roll copy clear that Luck does not guarantee a better single item; U9 switched reward profile previews to DB-owned `preview_reward_profile_luck(...)`, preserving reward range/Luck policy/formula context without Angular-side reward RNG or amount formulas; U10 added Exploration Lab Luck surface registry/readability over `get_luck_lab_preview_contracts()` and DB-returned Luck influence/Trial Power/formula keys in chance previews without becoming a standalone Luck Lab; U11 made Luck Foundation formula targets readable in existing formula governance/admin surfaces, with metadata-first help, raw Luck vs Luck influence labels, assigned/variable-compatible tester target selection and successful smoke for `Default trial manifestation chance` after migrator fixed the live `trial_manifestation_chance` scope mismatch; U12 player-facing Luck copy direction was cancelled and accepted as cleanup: Exploration no longer shows explicit counterfactual Luck-impact copy, `Luck:` DB explanations, or auto-resolve technical Luck/Trial Power/cap facts in player-facing challenge/timing labels, with challenge/live-combat helpers extracted out of state files; U13 removed stale local item-generation/Luck RNG fallback paths, deleted the local generated-item demo surface, and routes generated PvE opponent equipment through the DB-owned opponent combatant snapshot contract without restoring local item/Luck/affix RNG or using preview RPCs as runtime. U8 manual smoke remains pending for the Exploration Lab generated item preview; U9 manual smoke remains pending for Exploration Lab and Reward Profiles reward-profile preview surfaces; U10 manual smoke remains pending for Exploration Lab Luck surface registry and chance preview readability; U12 manual smoke remains pending for `/game/exploration` active challenge/live combat rendering without player-facing Luck copy; U13 manual smoke remains pending representative generated-opponent data. Follow-ups: `ExplorationLabPageState` is a split candidate on the next larger Exploration Lab task; when representative generated opponent equipment data exists, smoke the generated PvE opponent path end-to-end and confirm result/report attack source component refs render correctly.
- Epic V Luck Lab is accepted through V13. V0 confirmed current generated DB types included the initial Luck Lab preview contracts, and V10 now consumes the regenerated DB-owned drop-distribution simulation contract. V1 added Luck Lab domain models and mapper coverage for input/result, Luck influence, Trial Power, chance previews, combat preview, reward range preview, generated item preview, comparison rows, explanation rows and explicit unsupported drop distribution, without editing generated types or adding local formula/drop simulation authority. Generated item Luck previews now model optional prefix/suffix as nullable affix objects, normalizing absent affixes to `null` instead of semantic empty strings/zeros. V2 added reusable `LuckLabPreviews` and `LuckLabState` over DB/RPC preview contracts with signal inputs, debounced reloads, stale-response guards, section-specific loading/error/result patching and no duplicated Trial Power RPC in aggregate preview. V3 added `/admin/luck-lab`, dashboard/navigation entry, a thin page plus page state with shared Luck/tested-stat sliders and DB-backed difficulty/district/stat/trial selectors over existing exploration definition state. V4 added the Trial Power panel with tested stat, raw Luck, Luck influence, final Trial Power, equation summary, DB formula keys/expressions, explanation and DB-backed comparison rows; form defaults now use `DEFAULT_LUCK_LAB_INPUT`. V5 added the Trial chances panel, separating Trial opportunity from Trial manifestation, showing DB/RPC chance previews with percent units, DB formula/explanation output, selected difficulty/district context, DB-backed trial label/key as the primary trial context and Luck 0/current/high comparison rows through feature-local `LuckLabComparisonState`. V6 added the Auto-resolve panel with DB-owned binary success chance, tested stat, Luck influence, Trial Power, raw chance, cap, difficulty multiplier, manual chance reference and Luck 0/current/high comparison rows through `LuckLabPreviews.previewChallengeAutoResolve(...)`; selected trial/minigame context is marked as not consumed by the current RPC. V7 added the Encounter fallback panel with DB-owned non-trial encounter chance, base/raw/final/cap breakdown, Luck 0/current/high comparison rows through `LuckLabPreviews.previewNonTrialEncounter(...)`, explicit `nothing` deterministic-fallback copy and resource events kept as encounter subtype. V8 added the Combat RNG panel over DB-owned `previewCombat`, showing hit/evasion/critical/critical multiplier/final damage/initiative plus Luck preset comparison rows, with combat-specific section state, no local `formulasJson` compatibility parser, formula target keys shown as metadata only and missing stable combat formula labels / critical multiplier target tracked as a DB metadata gap. V9 added the single-roll generated item panel over DB-owned `preview_reward_generated_item_luck(...)`, forcing `p_preview_count = 1`, showing bucket/max quality context, rolled bucket, quality, base item, nullable prefix/suffix, final value and budget breakdown, and keeping reward profile and generated item loading/error sections separate so hidden reward profile failures do not poison the panel or page shell. V10 added the Drop distribution panel over DB-owned `preview_reward_generated_item_distribution_luck(...)`, showing roll count, average/median/min/max value, bucket and quality distributions for current Luck and Luck 0 comparison, prefix/suffix hit rates, high-value/outstanding rates and average delta, with scoped `dropDistribution` loading/error and copy that Angular only renders DB-returned summary rows. V10 cleanup reused the unsupported summary helper for no-row fallback, removed unused `prefixRows` / `suffixRows`, and extracted shared bucket/quality option labels. V11 added shared Luck comparison presets for `Luck 0`, low, medium, high and current slider values, reused across Trial Power, trial chance, auto-resolve, encounter and combat comparisons, plus a section-local drop-distribution comparison state using the same preset helper and DB-owned distribution preview RPC. Preset labels are UI baselines because no DB/config preset source is exposed; all comparison values remain DB/RPC-owned. V12 added DB-backed human-readable explanation lists over `get_luck_lab_preview_contracts()` / `LuckLabPreviewResult.explanationRows`, using DB labels/descriptions/helper text plus returned preview explanations/formula metadata, removing local explanation fallback prose and render-time throws, and labeling summary/default/null values so cards do not show standalone `DB default` or `N/A`. V13 added formula governance navigation from Luck Lab explanation rows to the existing generic `/admin/formulas` route, showing returned/known formula keys or target keys as secondary metadata where target-specific deep links are not available, without adding a formula editor or fake deep links. `selectedCombatProfileKey` is future input only because current combat preview RPC does not consume it. Manual smoke remains pending for `/admin/luck-lab`, including Luck/bucket/max-quality distribution refresh, preset rows, DB-backed explanation rows, formula governance links, no standalone default/null card values and no NG0955 warnings. Follow-ups for later V UI/performance tasks: `luck_influence` comparison rows must not be presented as normal gain/loss, and V14 should re-check performance/stale behavior for the extra Trial Power/chance/auto-resolve/encounter/combat/generated-item/drop-distribution preview calls, including narrowing combat comparison reloads if combat still only consumes attacker Luck and preventing heavy distribution refreshes on every tiny slider movement.
- ADMIN-FOLLOWUP-1 is accepted: `/admin/config-definitions` now has a governed editable guild config form over `GuildConfigEditorState`, with sequential draft-entry-ready-apply-reload orchestration and explicit mapping from non-prefixed `get_guild_config_summary()` fields to prefixed canonical guild `config_definitions.key` values. Creation cost and `armoryCapacity = 0` / `Unlimited` manual smoke passed per acceptance.
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
- Completed and confirmed: L1 - DB/types alignment after PvE migrations.
- Completed and confirmed: L2 - exploration domain models and mappers.
- Completed and confirmed: L3 - player exploration start/status screen.
- Completed and confirmed: L4 - graph state read and direction UI.
- Completed and confirmed: L5 - start step timer and progress UI.
- Completed and confirmed: L6 - resolve step result UI.
- Completed and confirmed: L7 - challenge attempt UI: manual, auto and debug paths.
- Completed and confirmed: L8 - reward display and item persistence confirmation.
- Completed and confirmed: L9 - admin exploration debug page.
- Completed and confirmed: L10 - exploration lab / preview / simulation UI.
- Completed and confirmed: L11 - trial definitions admin configurator.
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
- Completed and frontend-confirmed: L12 - encounter definitions admin configurator.
- Completed and confirmed: L12b - resource and effect encounter payload configurators.
- Completed and confirmed: L12c - encounter configurator explainability and layout pass.
- Completed and confirmed: L13 - reward profile configurator.
- Completed and confirmed: L11c - trial configurator explainability and layout pass.
- Completed and confirmed: M0 - align generated DB types after Epic M schema foundation.
- Completed and confirmed: M1 - formula random runtime/editor support.
- Completed and confirmed: M2 - combat domain contracts.
- Completed and confirmed: M3 - hero combatant resolver and critical damage debt.
- Completed and confirmed: M4 - opponent definitions and combat dictionaries read layer.
- Completed and confirmed: M5 - opponent combatant/loadout resolver.
- Completed and confirmed: M6 - attack plan builder.
- Completed and confirmed: M7 - initiative and turn order.
- Completed and confirmed: M8 - core combat resolver with slot execution.
- Completed and confirmed: M9 - persist combat result snapshot through canonical RPC.
- Completed and confirmed: M10 - thin sandbox combat caller.
- Completed and confirmed: M11 - combat admin/balance tooling foundation.
- Completed and confirmed: M12 - combat opponent definitions admin configurator.
- Completed and confirmed: N0 - align generated DB types after Epic N DB foundation preflight.
- Completed and confirmed: N1 - terminology cleanup: Health vs Character Points.
- Completed and confirmed: N2 - stat allocation alignment with existing RPC.
- Completed and confirmed: N3 - stat upgrade cost formula usage audit/fix.
- Completed and confirmed: N4 - stat level cap formula usage audit/fix.
- Completed and confirmed: N5 - XP and level display over current DB/RPC contract.
- Completed and confirmed: N6 - XP grant workflow integration boundary.
- Completed and confirmed: N7 - progression ledger and history read models.
- Completed and confirmed: N8 - level-up reward visibility and routing awareness.
- Completed and confirmed: N9 - level-up stat bonus rules and grant display/admin alignment.
- Completed and confirmed: N10 - derived stat resolver cleanup, including critical damage.
- Completed and confirmed: N11 - Character Points display, ledger and penalty sink clarity.
- Completed and confirmed: N12 - Progression admin/formula/configurator explainability.
- Completed and confirmed: N13 - Progression integration smoke and blocker report technical checkpoint.
- Completed and confirmed: O1 - DB/types alignment after estate foundation cleanup.
- Completed and confirmed: O2 - Estate address and capacity read layer.
- Completed and confirmed: O3 - Empty-address relocation flow through the Vicinity picker.
- Completed and conditionally accepted: O4 - Building catalog and estate building read layer, including the formula editor/tester variable-contract follow-up after BUILDING-FORMULA-DB-FIX2/FIX3.
- Completed and confirmed: O5 - Building job read layer and lazy finalization.
- Completed and confirmed: O6 - Start building construction/upgrade flow, settled mansion runtime state and active/completed job smoke.
- Completed and confirmed: O8 - Building configurator edit alignment.
- Completed and confirmed: O9 - Estate vicinity/address browser and relocation picker UI.
- Completed and confirmed: O10 - Player estate overview and building dashboard UI.
- Completed and confirmed: O11 - Estate/building feedback and notification integration.
- Completed and confirmed: O12 - Estate/building integration smoke and blocker report technical checkpoint.
- Completed and confirmed: P1 - Game report domain models and mappers.
- Completed and confirmed: P2 - Private Reports list / Reports tab prototype.
- Completed and confirmed: P3 - Private report detail and mark-read flow.
- Completed and confirmed: P4 - Public report route.
- Completed and confirmed: P5 - Combat report renderer.
- Completed and confirmed: P6 - Combat report creation integration.
- Completed and confirmed: P7 - Reward/drop item reference display.
- Completed and confirmed: P8 - Attach reward drops to reports through approved producer path.
- Completed and confirmed: P9 - Trial and encounter report producer readiness.
- Completed and confirmed: P10 - Future PvP and siege report placeholders.
- Completed and confirmed: P11 - Reports Center prototype UI smoke and blocker report technical checkpoint.
- Completed and confirmed: Q1 - Notification domain models and mappers.
- Completed and confirmed: Q2 - Player notification read service and unread count.
- Completed and confirmed: Q3 - Staff notification read service and unread count.
- Completed and confirmed: Q4 - Notification bell / dropdown UI.
- Completed and confirmed: Q5 - Mark read / dismiss notification actions.
- Completed and confirmed: Q6 - Optional online toast presentation for fresh notifications.
- Completed and confirmed: Q7 - Staff notification inbox/dropdown UI.
- Completed and confirmed: Q8 - Notification type/admin readability pass.
- Completed and confirmed: Q9 - Notification hook diagnostics/admin readability.
- Completed and confirmed: Q10 - Notification smoke and hook verification technical checkpoint.
- Completed and confirmed: R1 - PvP domain/RPC type foundation.
- Completed and confirmed: R2 - PvP mappers.
- Completed and confirmed: R3 - PvP player RPC service.
- Completed and confirmed: R4 - PvP metadata read layer.
- Completed and confirmed: R5 - Vicinity page route.
- Completed and confirmed: R6 - Vicinity navigation entry.
- Completed and confirmed: R7 - Vicinity target candidate state.
- Completed and confirmed: R8 - Vicinity target list UI.
- Completed and confirmed: HOTFIX-COMBAT-1 - DB-owned exploration combat resolver.
- Completed and confirmed: HOTFIX-COMBAT-2 - exploration combat result/reward/report display.
- Completed and confirmed: HOTFIX-COMBAT-3 - reuse Walking Dead timing UI for exploration combat.
- Completed and confirmed: HOTFIX-COMBAT-LIVE - exploration combat live DB/RPC runtime.
- Completed and confirmed: R9 - Vicinity eligibility reason display.
- Completed and confirmed: R10 - Start spy action.
- Completed and confirmed: R11 - Start attack action.
- Completed and confirmed: R12 - PvP runtime activity display.
- Completed and confirmed: R13 - Spy result read state.
- Completed and confirmed: R14 - Spy result UI.
- Completed and confirmed: R15 - Attack result read state.
- Completed and confirmed: R16 - Attack result UI.
- Completed and confirmed: R17 - PvP report integration.
- Completed and confirmed: R18 - PvP notification routing.
- Completed and confirmed: R19 - PvP admin overview.
- Completed and confirmed: R20 - PvP action lifecycle admin surface.
- Completed and confirmed: R21 - PvP targeting/protection balancer surface.
- Completed and confirmed: R22 - PvP travel/manual-window balancer surface.
- Completed and confirmed: R23 - PvP resource consequence balancer surface.
- Completed and confirmed: R24 - PvP XP/reward balancer surface.
- Completed and confirmed: R25 - PvP Prestige context admin surface.
- Completed and confirmed: R26 - PvP anti-abuse explainability surface.
- Completed and confirmed: R27 - PvP report producer admin surface.
- Completed and confirmed: R28 - PvP foundation diagnostic admin surface.
- Completed and confirmed with follow-up: S24 - PvP and spy equipment display alignment.
- Completed and confirmed: S25 - Item requirement admin/balancer surface.
- Completed and confirmed: S0 - Generated DB types alignment after item/equipment foundation.
- Completed and confirmed: S1 - Item and equipment domain models.
- Completed and confirmed: S2 - Item and equipment mappers.
- Completed and confirmed: S3 - Equipment RPC service.
- Completed and confirmed: S4 - Current equipment read state.
- Completed and confirmed: S5 - Equipment paperdoll UI.
- Completed and confirmed: S6 - Armory shelf read state.
- Completed and confirmed: S7 - Armory shelf UI.
- Accepted hotfix: HOTFIX-REWARD-AUTO-RESOLVE - reward/drop communication and manual combat auto-resolve wording.
- Completed and confirmed: S8 - Armory shelf management.
- Completed and conditionally accepted: S9 - Item detail / popover equipment data.
- Completed and confirmed: S10 - Item requirement display.
- Completed and confirmed: SPECIAL TASK - Item generation requirements admin editor.
- Completed and confirmed: S11 - Equip single item action.
- Completed and confirmed: S11 follow-up - Dashboard runtime combat stats and Hero Stats use `get_hero_dashboard_runtime_stats(...)`.
- Completed and confirmed: S12 - Unequip slot action.
- Completed and confirmed: S13 - Bulk equip action.
- Completed and confirmed conditionally: S14 - Preset domain service and `PlayerEquipment` -> `HeroEquipment` rename.
- Completed and confirmed: S15 - Preset management UI.
- Q4 pending manual smoke: check a real DB row for `estate.building_job.completed`; source `action_url` must be `/game/mansion`. If it still returns `ViewState`, fix DB/content producer source and do not add a frontend remap.
- Q5 pending manual smoke: open bell, mark read, dismiss and action link; real DB/RLS denied-action smoke only if suitable test data/access exists.
- Q6 pending manual smoke: basic bell UI can be smoke-tested, but full fresh-toast validation needs a real DB producer notification. Eligible unread fresh rows should toast once; read rows and `default_toast_enabled = false` rows should remain inbox-only.
- Q7 pending manual smoke: real staff user + selected server + seeded/generated staff notification row; verify DB/RLS visibility and real staff action URL content.
- Q8 pending manual smoke: `/admin/notification-types` with real admin/operator access, seeded `notification_types` plus `notification_type_admin_section`, admin navigation card/link, and confirmation that no Save/Edit/Delete/Create controls are exposed.
- Q9 pending manual smoke: `/admin/notification-hooks` with real admin/operator access and DB rows from `get_admin_notification_db_owned_producer_diagnostics`; confirm producer rows, per-row blockers if any, and `game_report_created_is_not_default_notification_producer` as an explicit non-producer.
- Q10 pending manual smoke remains user-owned: player inbox load/count/mark-read/dismiss, staff selected-server inbox list/count/RLS, `/admin/notification-hooks` live rows, real producer smoke for building completion plus trade/auction/anti-abuse where data exists, and confirmation that report creation does not create a default notification.
- P2-P11 follow-ups: full manual smoke for list/detail/public-route/combat-rendering/item-reference rendering/unread/remove, low-level combat report creation, reward-drop attachment, contextual trial/encounter/PvP/siege readiness and deletion semantics needs authenticated session plus representative report producer/combat result/item/contextual/multi-access data.
- O6 user smoke confirmed real job behavior: start job, active job panel, route leave/return, browser refresh during an active job, completed-job settlement, and the new building level after `completes_at`.
- O8 user smoke confirmed building admin save/read behavior for `startingLevel = 0`. The editor now treats `starting_level = 0` as a legal not-built definition state, preserves it through mapping/form/save payload, keeps `startingLevel = 2` round-tripping, exposes `min=0`/`step=1`, and rejects negative/non-integer values instead of silently clamping.
- O12 pending manual smoke: Codex completed only the technical checkpoint. User-owned manual validation remains for `/game/mansion` resources versus topbar, build start/active/completion states, `/game/vicinity` district/center/filter and relocation, `/admin/buildings` save/reload for starting level/costs/formulas/metadata, and notification DB smoke for building-completion rows/action URLs when representative data exists.
- O9/O10/O12 follow-up: resource production after destructive relocation remains a non-blocking DB/runtime consistency issue. After relocating to a new estate with level 0 buildings, `hero_resources.per_hour` for drachma may remain stale (for example `+18/h`) until a later build/finalize path recalculates production (for example `+12/h`). Check `relocate_hero_estate_to_empty_address(...)`, `settle_hero_runtime_state(...)`, `get_hero_estate_runtime_state(...)` and `refresh_hero_resource_production_rates(...)`; do not add Angular-side production recalculation or local override.
- O11 UI debt: vicinity still uses native selects / `ngModel`. Keep it as temporary accepted debt; future UI pass should move it to project/PrimeNG reactive-form patterns without adding PvP/spy/protection workflows to `EstateVicinityPageState`.
- R9 follow-up: real PvP data smoke should confirm DB metadata labels for the main target eligibility reason keys. If player-facing copy should be fully Polish, seed/adjust DB metadata or later local fallback copy rather than changing the RPC contract.
- R10 follow-up resolved by R11: PvP start action now uses a global `pendingAction` lock across attack/spy and targets.
- R12 follow-up: `VicinityTargetCandidatesState` is now too large; next larger Vicinity touch should split candidates/action/runtime activity state, move refresh into a state method such as `refreshTargetsAndRuntime()`, and consider partial refresh instead of all-or-nothing `forkJoin` after action start.
- R12 UI follow-up: do not expand `ngModel` in new UI work; when Vicinity filters are refactored, use project reactive-form patterns or evaluate Signal Forms if the project Angular version supports it.
- R13/R14 follow-up: Spy result UI must not show raw technical `permission denied...` as primary player copy; use a player-facing no-access message and keep technical detail only as diagnostics if needed. Do not render raw spy snapshot JSON without an explicit display mapper/contract, and preserve request-id/stale guards for route parameter changes.
- R14 follow-up: before broader player snapshot display, prefer DB-backed display rows or explicit per-section allowlist contracts over the current conservative denylist for generic primitive snapshot rows. At next touch, remove unused `ButtonModule` from `PvpSpyResultPage`, consider invalid-date fallback for snapshot display dates, and consider promoting `humanLabel(...)` to a shared text/display helper if reuse appears.
- HOTFIX-COMBAT-LIVE manual smoke pending: real combat Trial/Encounter, ensure session, refresh during combat, one Walking Dead click equals one `submit_combat_player_action(...)`, DB response updates HP/log/current actor/manifest, finalization updates result/reward path, and no duplicate submit after refresh.
- HOTFIX-COMBAT-LIVE accepted follow-up: participant mapping now consumes DB-shaped `healthCurrent` and `healthMax` / `health_max`, so UI HP labels should not show `N/D` for max HP when DB returns `healthMax`. Submit payload remains limited to `p_session_id`, `p_timing_input_json.positionPercent` and `p_request_id`; manifest, streak, green-zone and speed remain DB-owned.
- HOTFIX-COMBAT-LIVE follow-up: add a stale-context regression for completed live combat state after difficulty/hero/context changes, and consider wiring `get_combat_live_state(...)` into an explicit delta/recovery refresh path if idempotent `ensure_exploration_combat_session(...)` is no longer sufficient. If post-DB-H2 green zone or speed still do not change after hits, treat it as a DB manifest issue rather than adding a frontend workaround.
- Formula balance refactor follow-up: before the next larger item generation/formula balance task, split `ItemGenerationFormulaBalanceFacade` further. It remains about 447 lines after the accepted variable-contract fix and must not absorb more workflow responsibilities.
- N13 pending validation: representative XP producer smoke remains pending until a real XP-producing flow exists or is intentionally selected; user/manual validation remains separate from technical green checks and must not be claimed by Codex.
- N12 DB/content cleanup follow-up: replace remaining formula target `hero points` wording with `Character Points`; confirm and align stat upgrade default test context keys (`hero_level`/`stat_level` vs allowed `heroLevel`/`statLevel`); seed the currently reported progression UI metadata gaps. Do not hide these with frontend fallback labels or fallback contexts.
- N9 follow-up: if progression history receives more enrichment slices, consider extracting a dedicated enrichment service.
- N9 DB/RLS caveat: `/admin/level-up-stat-bonuses` empty state is acceptable when no rules are seeded or current admin context intentionally cannot see them; if rules exist and should be visible, treat it as a DB/RLS/query blocker rather than adding frontend fallback rules.
- N8 refactor follow-up: split `RewardProfilesPageState` further; after N8 it remains 317 lines and still mixes load, selection, forms, options and key sync, but this is not a blocker for accepted N8.
- N7 follow-up: wire progression history into a concrete screen later; when UI/route exists, Codex should provide a manual smoke checklist for the user and must not run manual or route smoke itself.
- N6 follow-up: decide AuthState/dashboard refresh behavior after `grantExperience(...)` at the first real XP producer integration.
- N5 UI follow-up: dashboard remains provisional and should be rebuilt in a later UI/UX pass; do not expand N5 with further polish.
- N4 refactor follow-up: split `attribute-allocation-page.facade.ts` into smaller progression/allocation state pieces; it is 362 lines after N4 but not a blocker for the accepted task.
- N3 UI polish follow-up: surface the first exact row-level stat upgrade cost error in the summary instead of only the generic `characterPointSummaryError()`.
- N1 visual smoke follow-up: manually check attributes, dashboard, auction/trade and anti-abuse penalty sections for layout regressions from longer `Character Points` labels.
- S10 accepted follow-up: real item detail requirement smoke looked OK for the checked item, but fuller manual variants remain pending for an item without requirements, an item with met requirements and an item with unmet requirements. S9 regression smoke should continue to check Value, Item stats such as `Damage 2-9`, Bonuses and no console/Angular runtime errors. `PlayerArmory` is a cleanup candidate for the next larger armory touch; split item detail/read orchestration if the service grows further.
- SPECIAL TASK accepted follow-up: item generation requirements are now edited inside `/admin/item-catalog` for the selected base item, prefix or suffix. Manual smoke confirmed adding a Dexterity 6 requirement to the Demonic prefix and runtime item detail then showed Hero level 1 plus Dexterity 6 while Value, Damage and Bonuses still rendered. UI for the catalog Requirements section is provisional and needs a later UX pass; `BuildingRequirementsState` should be renamed/split into a neutral entity-requirements state on the next larger requirements touch.
- S11 accepted follow-up: dashboard runtime damage/defense/health/luck/crit/evasion/attack count and Hero Stats now come from `get_hero_dashboard_runtime_stats(...)`, including `stats_json`. `HeroDerivedStats` / local derived resolver remains a cleanup candidate because it still has active topbar and combat-demo usages outside the dashboard path.
- S12 follow-up: equipment journal label for shifted entries should be neutralized from `Already equipped` to `Shifted` or rely directly on the DB message before slot-rotation UX is finalized.
- S13-S19 follow-up: `armory-page.html` and `armory-page.ts` are still heavy even after extracting loadout preset management, preview, apply/update suggestion and vendor lifecycle sequencing. The next larger Armory touch should extract bulk selection, equipment journal and shelf item card concerns into smaller components or dedicated state. `HeroEquipment` is intentionally hero-scoped after the S14 rename, but it is already broad; S15-S18 keep preset UI workflow mostly outside `ArmoryPage` and route apply through `CurrentEquipmentState`, while S19 keeps player lifecycle mutations in the Armory shelf state/vendor service path.
- S20 follow-up: on the next small anti-abuse/admin touch, check whether scrapped item recovery UI should split `canSearch` and `canRecover`. DB search allows anti-abuse triage/sanction roles to inspect recoverable items, while recovery itself requires sanction-management authority; current S20 uses one management gate for the whole page. Also avoid growing `ScrappedItemRecoveryState` further without splitting the workflow.
- S21 follow-up: `isPlayerUsableItemStatus(...)` now means runtime/equipment usable (`active`, `locked_trade`, `locked_auction`) rather than vendor/listing/scrap eligible. Do not broaden it into lifecycle action eligibility. If touched again, consider renaming it to `isRuntimeUsableItemStatus(...)` or adding a clearer domain-specific helper.
- S22 follow-up: later exploration/PvE UI copy pass can unify the mixed Polish/English live combat/loadout boundary text. No behavior change is needed.
- S23 follow-up: live combat logs/results can show safe weapon/attack-source labels only if DB live events or result detail expose them. Do not reconstruct or guess weapon labels in Angular.
- S24 follow-up: PvP attack/result/report Prestige display must remain non-numeric until a dedicated player-safe Prestige summary read-model contract exists. Do not expose raw Prestige points, numeric deltas or projected deltas in player-facing PvP UI, and do not calculate Prestige in Angular.
- S26 scope note after S25: S25 already exposed and edits quality `requirementMultiplier` separately from value/bonus `multiplier` in the balance quality path. In S26, avoid repeating that work and focus only on remaining quality alignment gaps, if any.
- Epic N DB sanity follow-up: verify actual `balance_formula_targets`, `balance_formulas` and assignment rows for `hero_experience_to_next_level`, `hero_stat_upgrade_cost` and `hero_stat_level_cap`; generated TypeScript confirms schema/RPC signatures, not seeded content.
- M12 follow-up: apply `AdminReasonPresetField` to the remaining M12 reason fields for consistency.
- M12 follow-up: broader UI polish for white/native-looking inputs where global PrimeNG/theme styles are inconsistent.
- M12 follow-up: optional later refactor of large shared combat opponent files (`combat-opponent-admin.ts`, `combat-opponent.model.ts`).
- M12 follow-up: future UX/configurator pass can further improve tabbing/section layout; current M12 is functionally accepted.
- Epic O follow-up: fully integrate central `entity_requirements` / `requirement_definitions` into the building UI/read model. The M9-adjacent compile-only hotfix removed active legacy `building_requirements` reads and leaves building runtime requirements as an empty placeholder until the proper O slice.
- M2 follow-up debt: after the canonical combat runtime is implemented and integrated, retire the temporary `/game/combat` sandbox/prototype flow and remove `combat-sandbox.model.ts` instead of developing it as the target system.
- M4 follow-up debt: first opponent catalog UI should add readable labels for manual item-generation references and generated bucket references, and should distinguish "families exist but no opponent definitions" from a fully empty opponent catalog.
- M5 follow-up debt: generated opponent equipment with `generatedBucketProfileId` is currently reported as an unsupported integration gap because the current item generation catalog loader does not support opponent-specific bucket profile selection; revisit with the first opponent catalog/admin UI or item generation catalog integration pass.
- DB cleanup candidate: `hero_derived` is no longer the frontend/runtime source for derived stats; replacement path is runtime derived stats from base stats, equipment, bonus templates/entity bonuses, derived stat definitions and formula assignments. Removal safety remains unknown until a dedicated SQL/reference audit and type regeneration.
- L12c refactor debt: exploration encounter forms/templates remain fairly manual; future refactor work should revisit FormFieldConfig/shared renderer/form factory direction with a strong reuse check before new helpers/configs.
- L11c refactor debt: trial and encounter configurators now share similar metadata facade, form rules and workflow patterns; do not refactor retrospectively in this task, but future work should check existing feature/core patterns before adding helpers.
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
- Next: fix the backend/RLS blocker for player exploration challenge/reward reads: `/game/exploration` currently hits `permission denied for table hero_exploration_challenge_attempts`. Resolve with player-safe SELECT/RLS or a safe RPC/read model; do not bypass this in Angular with direct writes or service-role access.
- After the backend/RLS fix, repeat gameplay smoke: active difficulty tiers visible, debug `add_hero_remaining_actions` increases remaining trials for the selected hero/date, start exploration works, and challenge/reward read path does not throw permission denied.
- L9 has added the server-scoped admin exploration debug page with hero search, DB-backed selectors/pickers and sandbox helper RPC actions. Frontend/admin-debug smoke is accepted; full gameplay smoke is blocked by the backend/RLS issue above.
- L10 has added `/admin/exploration-lab` as a non-mutating balancing and explainability lab for exploration preview/simulation RPCs, with DB-backed selectors, labelled inputs, RPC explanations and simulation summary/distribution.
- L11 has added `/admin/exploration-trials` for admin/balancer trial definitions and combat candidate configuration. Mutations use `upsert_trial_definition`, `upsert_trial_combat_candidate`, and `deactivate_trial_combat_candidate` with mandatory reasons; no direct Angular writes to trial definition/candidate tables.
- L8 has added read-only persisted reward display for completed challenge attempts: challenge attempts -> reward grants -> reward grant entries -> items.
- L7 has added active challenge attempt UI with prototype manual completion and auto-resolve through canonical challenge RPCs. Full challenge/minigame smoke remains pending real trial/challenge data.
- L6 has added resolved step outcome display driven by DB `resolve_hero_exploration_step(...)` snapshots without frontend reroll or reward generation.
- L5 has added step timer/progress display from DB `resolves_at`/step status plus ready-only `Check result` handling through `resolve_hero_exploration_step(...)`.
- L4 has added graph/path display and valid direction choices from `get_hero_exploration_state(...)`, with movement started through `start_hero_exploration_step(...)`.
- L3 has added `/game/exploration`, DB-backed difficulty tiers, selected-difficulty state loading, and `start_or_get_hero_exploration(...)` start/status flow.
- Continue building the real exploration step loop instead of placeholders.
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
- O6 implemented player build/upgrade start through canonical `start_estate_building_upgrade(...)` and settled mansion runtime reads through `get_hero_estate_runtime_state(p_hero_id)`.
- Keep cost spending, resource materialization, build timers, active/recent jobs and completed level changes backend/RPC-owned; do not reintroduce Angular direct writes or local resource authority.
- Future building execution work should cover product-approved follow-up flows only, such as cancel/admin correction/claim UX if those become explicit backlog tasks.

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

