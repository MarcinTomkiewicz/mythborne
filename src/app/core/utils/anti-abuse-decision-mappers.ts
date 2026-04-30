import {
  AntiAbuseCaseDecision,
  PlayerAbuseReportDecision,
  PlayerRelationshipDeclarationDecision,
} from '../domain/anti-abuse/anti-abuse-decision.model';
import {
  AntiAbuseSanctionDecision,
  AntiAbuseSanctionItemDecision,
  CharacterPointPenaltyDecision,
} from '../domain/anti-abuse/anti-abuse-sanction.model';
import { Row } from '../types/supabase.types';

export function mapAntiAbuseCaseDecision(
  row: Row<'anti_abuse_cases'>,
): AntiAbuseCaseDecision {
  return {
    id: row.id,
    serverId: row.server_id,
    title: row.title,
    summary: row.summary,
    status: row.status,
    statusReason: row.status_reason,
    verdict: row.verdict,
    verdictReason: row.verdict_reason,
    sanctionRequired: row.sanction_required,
    noSanctionReason: row.no_sanction_reason,
    operatorNotes: row.operator_notes,
    resolvedAt: row.resolved_at,
    resolvedByUserId: row.resolved_by_user_id,
    cancelledAt: row.cancelled_at,
    updatedAt: row.updated_at,
  };
}

export function mapPlayerRelationshipDeclarationDecision(
  row: Row<'player_relationship_declarations'>,
): PlayerRelationshipDeclarationDecision {
  return {
    id: row.id,
    serverId: row.server_id,
    declarationTypeKey: row.declaration_type_key,
    title: row.title,
    status: row.status,
    statusReason: row.status_reason,
    adminNotes: row.admin_notes,
    playerNotes: row.player_notes,
    reviewedAt: row.reviewed_at,
    reviewedByUserId: row.reviewed_by_user_id,
    updatedAt: row.updated_at,
  };
}

export function mapPlayerAbuseReportDecision(
  row: Row<'player_abuse_reports'>,
): PlayerAbuseReportDecision {
  return {
    id: row.id,
    serverId: row.server_id,
    reportTypeKey: row.report_type_key,
    title: row.title,
    status: row.status,
    statusReason: row.status_reason,
    caseId: row.case_id,
    adminNotes: row.admin_notes,
    playerNotes: row.player_notes,
    resolvedAt: row.resolved_at,
    updatedAt: row.updated_at,
  };
}

export function mapAntiAbuseSanctionDecision(
  row: Row<'anti_abuse_sanctions'>,
): AntiAbuseSanctionDecision {
  return {
    id: row.id,
    caseId: row.case_id,
    sanctionTypeKey: row.sanction_type_key,
    status: row.status,
    statusReason: row.status_reason,
    reason: row.reason,
    operatorNotes: row.operator_notes,
    targetHeroId: row.target_hero_id,
    targetUserId: row.target_user_id,
    sourceHeroId: row.source_hero_id,
    destinationHeroId: row.destination_hero_id,
    amountCharacterPoints: row.amount_character_points,
    durationDays: row.duration_days,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    appliedAt: row.applied_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
    forgivenAt: row.forgiven_at,
    failedAt: row.failed_at,
    imposedByUserId: row.imposed_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCharacterPointPenaltyDecision(
  row: Row<'character_point_penalties'>,
): CharacterPointPenaltyDecision {
  return {
    id: row.id,
    sanctionId: row.sanction_id,
    caseId: row.case_id,
    serverId: row.server_id,
    heroId: row.hero_id,
    userId: row.user_id,
    status: row.status,
    statusReason: row.status_reason,
    reason: row.reason,
    operatorNotes: row.operator_notes,
    totalAmount: row.total_amount,
    remainingAmount: row.remaining_amount,
    paidAmount: row.paid_amount,
    appliedAt: row.applied_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
    forgivenAt: row.forgiven_at,
    failedAt: row.failed_at,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAntiAbuseSanctionItemDecision(
  row: Row<'anti_abuse_sanction_items'>,
): AntiAbuseSanctionItemDecision {
  return {
    id: row.id,
    sanctionId: row.sanction_id,
    itemId: row.item_id,
    sourceHeroId: row.source_hero_id,
    destinationHeroId: row.destination_hero_id,
    reason: row.reason,
    operatorNotes: row.operator_notes,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
  };
}
