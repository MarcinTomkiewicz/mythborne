import { Database } from '../../types/database.types';

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

export interface CreateAntiAbuseSanctionInput {
  caseId: string;
  sanctionTypeKey: string;
  targetHeroId: string;
  targetUserId: string;
  reason: string;
  operatorNotes?: string | null;
  amountCharacterPoints?: number | null;
  durationDays?: number | null;
  sourceHeroId?: string | null;
  destinationHeroId?: string | null;
}

export interface AntiAbuseSanctionStatusInput {
  sanctionId: string;
  status: AntiAbuseSanctionStatus;
  statusReason: string;
}

export interface CreateCharacterPointPenaltyInput {
  sanctionId: string;
  reason: string;
  operatorNotes?: string | null;
}

export interface CharacterPointPenaltyStatusInput {
  penaltyId: string;
  status: AntiAbuseSanctionStatus;
  statusReason: string;
}

export interface AddAntiAbuseSanctionItemInput {
  sanctionId: string;
  itemId: string;
  reason: string;
  operatorNotes?: string | null;
  sourceHeroId?: string | null;
  destinationHeroId?: string | null;
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

export interface AntiAbuseSanctionDecision {
  id: string;
  caseId: string;
  sanctionTypeKey: string;
  status: AntiAbuseSanctionStatus;
  statusReason: string | null;
  reason: string;
  operatorNotes: string | null;
  targetHeroId: string | null;
  targetUserId: string | null;
  sourceHeroId: string | null;
  destinationHeroId: string | null;
  amountCharacterPoints: number | null;
  durationDays: number | null;
  startsAt: string | null;
  endsAt: string | null;
  appliedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  forgivenAt: string | null;
  failedAt: string | null;
  imposedByUserId: string | null;
  updatedAt: string;
}

export interface CharacterPointPenaltyDecision {
  id: string;
  sanctionId: string;
  caseId: string;
  serverId: string;
  heroId: string;
  userId: string | null;
  status: AntiAbuseSanctionStatus;
  statusReason: string | null;
  reason: string;
  operatorNotes: string | null;
  totalAmount: number;
  remainingAmount: number;
  paidAmount: number;
  appliedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  forgivenAt: string | null;
  failedAt: string | null;
  updatedAt: string;
}

export interface AntiAbuseSanctionItemDecision {
  id: string;
  sanctionId: string;
  itemId: string;
  sourceHeroId: string | null;
  destinationHeroId: string | null;
  reason: string;
  operatorNotes: string | null;
  createdByUserId: string | null;
  createdAt: string;
}
