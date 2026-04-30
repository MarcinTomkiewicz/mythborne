import { Database, Json } from '../../types/database.types';
import { AuditLogEntry } from '../audit/audit-log.model';
import { AntiAbuseDictionaryData } from './anti-abuse-dictionary.model';
import {
  AntiAbuseSanctionDecision,
  AntiAbuseSanctionItemDecision,
  CharacterPointPenaltyDecision,
  AntiAbuseCaseStatus,
  AntiAbuseCaseVerdict,
  PlayerAbuseReportDecision,
  PlayerRelationshipDeclarationDecision,
} from './anti-abuse-decision.model';

export type AntiAbuseCaseSource =
  Database['public']['Enums']['anti_abuse_case_source'];
export type AntiAbuseSignalSeverity = Database['public']['Enums']['audit_severity'];

export interface AntiAbuseCaseReadModel {
  id: string;
  serverId: string;
  title: string;
  summary: string | null;
  source: AntiAbuseCaseSource;
  status: AntiAbuseCaseStatus;
  statusReason: string | null;
  verdict: AntiAbuseCaseVerdict | null;
  verdictReason: string | null;
  sanctionRequired: boolean | null;
  noSanctionReason: string | null;
  operatorNotes: string | null;
  groupingKey: string | null;
  primaryHeroId: string | null;
  primaryUserId: string | null;
  assignedToUserId: string | null;
  openedByUserId: string | null;
  resolvedByUserId: string | null;
  signalCount: number;
  lastSignalAt: string | null;
  possibleRecidivism: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  cancelledAt: string | null;
}

export interface AntiAbuseSignalReadModel {
  id: string;
  serverId: string;
  signalTypeKey: string;
  title: string;
  description: string;
  severity: AntiAbuseSignalSeverity;
  score: number;
  confidence: number;
  reason: string | null;
  groupingKey: string | null;
  actorHeroId: string | null;
  actorUserId: string | null;
  targetHeroId: string | null;
  targetUserId: string | null;
  entityTypeKey: string | null;
  entityId: string | null;
  auditLogId: string | null;
  metadataJson: Json;
  isDismissed: boolean;
  dismissedAt: string | null;
  dismissedByUserId: string | null;
  dismissedReason: string | null;
  createdAt: string;
}

export interface AntiAbuseCaseSignalLink {
  caseId: string;
  signalId: string;
  reason: string | null;
  linkedByUserId: string | null;
  createdAt: string;
}

export interface AntiAbuseCaseParticipant {
  id: string;
  caseId: string;
  userId: string | null;
  heroId: string | null;
  roleKey: string;
  reason: string | null;
  description: string | null;
  createdByUserId: string | null;
  createdAt: string;
}

export interface AntiAbuseCaseAuditLink {
  caseId: string;
  auditLogId: string;
  reason: string | null;
  linkedByUserId: string | null;
  createdAt: string;
}

export interface AntiAbuseCaseDeclarationLink {
  caseId: string;
  declarationId: string;
  reason: string | null;
  linkedByUserId: string | null;
  createdAt: string;
}

export interface AntiAbuseCaseDetailReadModel {
  case: AntiAbuseCaseReadModel;
  dictionaries: AntiAbuseDictionaryData;
  signals: AntiAbuseSignalReadModel[];
  caseSignals: AntiAbuseCaseSignalLink[];
  participants: AntiAbuseCaseParticipant[];
  auditLinks: AntiAbuseCaseAuditLink[];
  auditLogs: AuditLogEntry[];
  declarationLinks: AntiAbuseCaseDeclarationLink[];
  declarations: PlayerRelationshipDeclarationDecision[];
  reports: PlayerAbuseReportDecision[];
  sanctions: AntiAbuseSanctionDecision[];
  characterPointPenalties: CharacterPointPenaltyDecision[];
  sanctionItems: AntiAbuseSanctionItemDecision[];
}
