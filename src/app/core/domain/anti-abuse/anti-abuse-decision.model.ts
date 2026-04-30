import { Database } from '../../types/database.types';
export type {
  AddAntiAbuseSanctionItemInput,
  AntiAbuseSanctionDecision,
  AntiAbuseSanctionItemDecision,
  AntiAbuseSanctionStatusInput,
  CharacterPointPenaltyDecision,
  CharacterPointPenaltyStatusInput,
  CreateAntiAbuseSanctionInput,
  CreateCharacterPointPenaltyInput,
} from './anti-abuse-sanction.model';

export type AntiAbuseCaseStatus =
  Database['public']['Enums']['anti_abuse_case_status'];
export type AntiAbuseCaseVerdict =
  Database['public']['Enums']['anti_abuse_case_verdict'];
export type AntiAbuseSanctionStatus =
  Database['public']['Enums']['anti_abuse_sanction_status'];
export type PlayerAbuseReportStatus =
  Database['public']['Enums']['player_abuse_report_status'];
export type PlayerRelationshipDeclarationStatus =
  Database['public']['Enums']['player_relationship_declaration_status'];

export interface AntiAbuseCaseDecisionInput {
  caseId: string;
  status: AntiAbuseCaseStatus;
  statusReason: string;
  verdict?: AntiAbuseCaseVerdict | null;
  verdictReason?: string | null;
  sanctionRequired?: boolean | null;
  noSanctionReason?: string | null;
  operatorNotes?: string | null;
}

export interface PlayerRelationshipDeclarationDecisionInput {
  declarationId: string;
  status: PlayerRelationshipDeclarationStatus;
  statusReason: string;
  adminNotes?: string | null;
  playerNotes?: string | null;
}

export interface PlayerAbuseReportDecisionInput {
  reportId: string;
  status: PlayerAbuseReportStatus;
  statusReason: string;
  caseId?: string | null;
  adminNotes?: string | null;
  playerNotes?: string | null;
}

export interface AntiAbuseCaseDecision {
  id: string;
  serverId: string;
  title: string;
  summary: string | null;
  status: AntiAbuseCaseStatus;
  statusReason: string | null;
  verdict: AntiAbuseCaseVerdict | null;
  verdictReason: string | null;
  sanctionRequired: boolean | null;
  noSanctionReason: string | null;
  operatorNotes: string | null;
  resolvedAt: string | null;
  resolvedByUserId: string | null;
  cancelledAt: string | null;
  updatedAt: string;
}

export interface PlayerRelationshipDeclarationDecision {
  id: string;
  serverId: string;
  declarationTypeKey: string;
  title: string;
  status: PlayerRelationshipDeclarationStatus;
  statusReason: string | null;
  adminNotes: string | null;
  playerNotes: string | null;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
  updatedAt: string;
}

export interface PlayerAbuseReportDecision {
  id: string;
  serverId: string;
  reportTypeKey: string;
  title: string;
  status: PlayerAbuseReportStatus;
  statusReason: string | null;
  caseId: string | null;
  adminNotes: string | null;
  playerNotes: string | null;
  resolvedAt: string | null;
  updatedAt: string;
}
