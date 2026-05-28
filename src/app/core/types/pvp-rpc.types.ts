import { Database } from './database.types';
import { Row } from './supabase.types';

export type PvpActionKindRow = Row<'pvp_action_kinds'>;
export type PvpActionStatusRow = Row<'pvp_action_statuses'>;
export type PvpActionRow = Row<'pvp_actions'>;
export type PvpAttackOutcomeKindRow = Row<'pvp_attack_outcome_kinds'>;
export type PvpAttackResultRow = Row<'pvp_attack_results'>;
export type PvpSpyResultRow = Row<'pvp_spy_results'>;
export type PvpTargetProtectionRow = Row<'pvp_target_protections'>;

export type PvpActionKindKey = PvpActionKindRow['key'];
export type PvpActionStatusKey = PvpActionStatusRow['key'];
export type PvpAttackOutcomeKey = PvpAttackOutcomeKindRow['key'];
export type PvpCombatOutcome = Database['public']['Enums']['combat_outcome'];

export type GetPvpTargetCandidatesRpcArgs =
  Database['public']['Functions']['get_pvp_target_candidates']['Args'];
export type GetPvpTargetCandidatesRpcRow =
  Database['public']['Functions']['get_pvp_target_candidates']['Returns'][number];

export type GetPvpVisibleAddressTargetOverlayRpcArgs =
  Database['public']['Functions']['get_pvp_visible_address_target_overlay']['Args'];
export type GetPvpVisibleAddressTargetOverlayRpcRow =
  Database['public']['Functions']['get_pvp_visible_address_target_overlay']['Returns'][number];

export type GetHeroActiveRuntimeActivityRpcArgs =
  Database['public']['Functions']['get_hero_active_runtime_activity']['Args'];
export type GetHeroActiveRuntimeActivityRpcRow =
  Database['public']['Functions']['get_hero_active_runtime_activity']['Returns'][number];

export type GetHeroPvpDailyAttackStateRpcArgs =
  Database['public']['Functions']['get_hero_pvp_daily_attack_state']['Args'];
export type GetHeroPvpDailyAttackStateRpcRow =
  Database['public']['Functions']['get_hero_pvp_daily_attack_state']['Returns'][number];

export type StartPvpActionRpcArgs =
  Database['public']['Functions']['start_pvp_action']['Args'];
export type StartPvpActionRpcRow =
  Database['public']['Functions']['start_pvp_action']['Returns'][number];

export type GetMyPvpSpyResultRpcArgs =
  Database['public']['Functions']['get_my_pvp_spy_result']['Args'];
export type GetMyPvpSpyResultRpcRow =
  Database['public']['Functions']['get_my_pvp_spy_result']['Returns'][number];

export type GetMyPvpAttackResultRpcArgs =
  Database['public']['Functions']['get_my_pvp_attack_result']['Args'];
export type GetMyPvpAttackResultRpcRow =
  Database['public']['Functions']['get_my_pvp_attack_result']['Returns'][number];
