import { Database } from './database.types';

export type CanManageAntiAbuseRpcArgs =
  Database['public']['Functions']['can_manage_anti_abuse']['Args'];
export type SetAntiAbuseCaseDecisionRpcArgs =
  Database['public']['Functions']['set_anti_abuse_case_decision']['Args'];
export type SetPlayerRelationshipDeclarationDecisionRpcArgs =
  Database['public']['Functions']['set_player_relationship_declaration_decision']['Args'];
export type CreatePlayerRelationshipDeclarationRpcArgs =
  Database['public']['Functions']['create_player_relationship_declaration']['Args'];
export type CreatePlayerRelationshipDeclarationRpcRow =
  Database['public']['Functions']['create_player_relationship_declaration']['Returns'][number];
export type CreatePlayerAbuseReportRpcArgs =
  Database['public']['Functions']['create_player_abuse_report']['Args'];
export type CreatePlayerAbuseReportRpcRow =
  Database['public']['Functions']['create_player_abuse_report']['Returns'][number];
export type SetPlayerAbuseReportDecisionRpcArgs =
  Database['public']['Functions']['set_player_abuse_report_decision']['Args'];
export type CreateAntiAbuseSanctionRpcArgs =
  Database['public']['Functions']['create_anti_abuse_sanction']['Args'];
export type SetAntiAbuseSanctionStatusRpcArgs =
  Database['public']['Functions']['set_anti_abuse_sanction_status']['Args'];
export type CreateCharacterPointPenaltyForSanctionRpcArgs =
  Database['public']['Functions']['create_character_point_penalty_for_sanction']['Args'];
export type SetCharacterPointPenaltyStatusRpcArgs =
  Database['public']['Functions']['set_character_point_penalty_status']['Args'];
export type AddAntiAbuseSanctionItemRpcArgs =
  Database['public']['Functions']['add_anti_abuse_sanction_item']['Args'];
