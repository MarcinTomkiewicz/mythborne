import { Database } from './database.types';
import { Row } from './supabase.types';

export type GameReportAccessRole =
  Database['public']['Enums']['game_report_access_role'];
export type GameReportItemSourceKind =
  Database['public']['Enums']['game_report_item_source_kind'];
export type GameReportSourceEntityType =
  Database['public']['Enums']['game_report_source_entity_type'];

export type GameReportTypeRow = Row<'game_report_types'>;
export type GameReportParticipantRow = Row<'game_report_participants'>;
export type GameReportItemReferenceRow = Row<'game_report_item_references'>;

export type GetHeroGameReportsRpcRow =
  Database['public']['Functions']['get_hero_game_reports']['Returns'][number];
export type GetHeroGameReportsRpcArgs =
  Database['public']['Functions']['get_hero_game_reports']['Args'];
export type GetHeroGameReportUnreadCountRpcArgs =
  Database['public']['Functions']['get_hero_game_report_unread_count']['Args'];
export type GetHeroGameReportUnreadCountRpcReturn =
  Database['public']['Functions']['get_hero_game_report_unread_count']['Returns'];
export type GetHeroGameReportDetailRpcRow =
  Database['public']['Functions']['get_hero_game_report_detail']['Returns'][number];
export type GetHeroGameReportDetailRpcArgs =
  Database['public']['Functions']['get_hero_game_report_detail']['Args'];
export type MarkGameReportReadRpcArgs =
  Database['public']['Functions']['mark_game_report_read']['Args'];
export type MarkGameReportReadRpcReturn =
  Database['public']['Functions']['mark_game_report_read']['Returns'];
export type GetPublicGameReportByTokenRpcRow =
  Database['public']['Functions']['get_public_game_report_by_token']['Returns'][number];
export type GetPublicGameReportByTokenRpcArgs =
  Database['public']['Functions']['get_public_game_report_by_token']['Args'];
export type DeleteGameReportForHeroRpcArgs =
  Database['public']['Functions']['delete_game_report_for_hero']['Args'];
export type DeleteGameReportForHeroRpcRow =
  Database['public']['Functions']['delete_game_report_for_hero']['Returns'][number];
