import { Database } from './database.types';
import { Row } from './supabase.types';

export type PvpActionKindRow = Row<'pvp_action_kinds'>;
export type PvpActionStatusRow = Row<'pvp_action_statuses'>;

export type PvpActionKindKey = PvpActionKindRow['key'];
export type PvpActionStatusKey = PvpActionStatusRow['key'];

export type GetPvpTargetCandidatesRpcArgs =
  Database['public']['Functions']['get_pvp_target_candidates']['Args'];
export type GetPvpTargetCandidatesRpcRow =
  Database['public']['Functions']['get_pvp_target_candidates']['Returns'][number];

export type GetPvpVisibleAddressTargetOverlayRpcArgs =
  Database['public']['Functions']['get_pvp_visible_address_target_overlay']['Args'];
export type GetPvpVisibleAddressTargetOverlayRpcRow =
  Database['public']['Functions']['get_pvp_visible_address_target_overlay']['Returns'][number];

export type GetActivePvpActionOfferRpcArgs =
  Database['public']['Functions']['get_active_pvp_action_offer']['Args'];
export type GetActivePvpActionOfferRpcRow =
  Database['public']['Functions']['get_active_pvp_action_offer']['Returns'][number];

export type GetHeroPvpDailyAttackStateRpcArgs =
  Database['public']['Functions']['get_hero_pvp_daily_attack_state']['Args'];
export type GetHeroPvpDailyAttackStateRpcRow =
  Database['public']['Functions']['get_hero_pvp_daily_attack_state']['Returns'][number];

export type StartPvpActionRpcArgs =
  Database['public']['Functions']['start_pvp_action']['Args'];
export type StartPvpActionRpcRow =
  Database['public']['Functions']['start_pvp_action']['Returns'][number];

export type SettleDuePvpSpyActionRpcArgs =
  Database['public']['Functions']['settle_due_pvp_spy_action']['Args'];
export type SettleDuePvpSpyActionRpcRow =
  Database['public']['Functions']['settle_due_pvp_spy_action']['Returns'][number];

export type CreatePvpSpyGameReportRpcArgs =
  Database['public']['Functions']['create_pvp_spy_game_report']['Args'];
export type CreatePvpSpyGameReportRpcRow =
  Database['public']['Functions']['create_pvp_spy_game_report']['Returns'][number];
