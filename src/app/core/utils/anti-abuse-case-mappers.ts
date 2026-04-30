import {
  AntiAbuseCaseAuditLink,
  AntiAbuseCaseDeclarationLink,
  AntiAbuseCaseParticipant,
  AntiAbuseCaseReadModel,
  AntiAbuseCaseSignalLink,
  AntiAbuseSignalReadModel,
} from '../domain/anti-abuse/anti-abuse-case.model';
import { Row } from '../types/supabase.types';

export function mapAntiAbuseCaseReadModel(
  row: Row<'anti_abuse_cases'>,
): AntiAbuseCaseReadModel {
  return {
    id: row.id,
    serverId: row.server_id,
    title: row.title,
    summary: row.summary,
    source: row.source,
    status: row.status,
    statusReason: row.status_reason,
    verdict: row.verdict,
    verdictReason: row.verdict_reason,
    sanctionRequired: row.sanction_required,
    noSanctionReason: row.no_sanction_reason,
    operatorNotes: row.operator_notes,
    groupingKey: row.grouping_key,
    primaryHeroId: row.primary_hero_id,
    primaryUserId: row.primary_user_id,
    assignedToUserId: row.assigned_to_user_id,
    openedByUserId: row.opened_by_user_id,
    resolvedByUserId: row.resolved_by_user_id,
    signalCount: row.signal_count,
    lastSignalAt: row.last_signal_at,
    possibleRecidivism: row.possible_recidivism,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at,
    cancelledAt: row.cancelled_at,
  };
}

export function mapAntiAbuseSignalReadModel(
  row: Row<'anti_abuse_signals'>,
): AntiAbuseSignalReadModel {
  return {
    id: row.id,
    serverId: row.server_id,
    signalTypeKey: row.signal_type_key,
    title: row.title,
    description: row.description,
    severity: row.severity,
    score: row.score,
    confidence: row.confidence,
    reason: row.reason,
    groupingKey: row.grouping_key,
    actorHeroId: row.actor_hero_id,
    actorUserId: row.actor_user_id,
    targetHeroId: row.target_hero_id,
    targetUserId: row.target_user_id,
    entityTypeKey: row.entity_type_key,
    entityId: row.entity_id,
    auditLogId: row.audit_log_id,
    metadataJson: row.metadata_json,
    isDismissed: row.is_dismissed,
    dismissedAt: row.dismissed_at,
    dismissedByUserId: row.dismissed_by_user_id,
    dismissedReason: row.dismissed_reason,
    createdAt: row.created_at,
  };
}

export function mapAntiAbuseCaseSignalLink(
  row: Row<'anti_abuse_case_signals'>,
): AntiAbuseCaseSignalLink {
  return {
    caseId: row.case_id,
    signalId: row.signal_id,
    reason: row.reason,
    linkedByUserId: row.linked_by_user_id,
    createdAt: row.created_at,
  };
}

export function mapAntiAbuseCaseParticipant(
  row: Row<'anti_abuse_case_participants'>,
): AntiAbuseCaseParticipant {
  return {
    id: row.id,
    caseId: row.case_id,
    userId: row.user_id,
    heroId: row.hero_id,
    roleKey: row.role_key,
    reason: row.reason,
    description: row.description,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
  };
}

export function mapAntiAbuseCaseAuditLink(
  row: Row<'anti_abuse_case_audit_logs'>,
): AntiAbuseCaseAuditLink {
  return {
    caseId: row.case_id,
    auditLogId: row.audit_log_id,
    reason: row.reason,
    linkedByUserId: row.linked_by_user_id,
    createdAt: row.created_at,
  };
}

export function mapAntiAbuseCaseDeclarationLink(
  row: Row<'anti_abuse_case_declarations'>,
): AntiAbuseCaseDeclarationLink {
  return {
    caseId: row.case_id,
    declarationId: row.declaration_id,
    reason: row.reason,
    linkedByUserId: row.linked_by_user_id,
    createdAt: row.created_at,
  };
}
