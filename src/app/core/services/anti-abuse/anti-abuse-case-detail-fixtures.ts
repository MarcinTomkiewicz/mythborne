import { AuditLogWithDictionaryRow } from '../../types/audit-log-row.types';
import { Row } from '../../types/supabase.types';

export function caseRow(): Row<'anti_abuse_cases'> {
  return {
    assigned_to_user_id: null,
    cancelled_at: null,
    created_at: '2026-04-30T09:00:00.000Z',
    grouping_key: null,
    id: 'case-1',
    last_signal_at: null,
    no_sanction_reason: null,
    opened_by_user_id: null,
    operator_notes: null,
    possible_recidivism: false,
    primary_hero_id: null,
    primary_user_id: null,
    resolved_at: null,
    resolved_by_user_id: null,
    sanction_required: null,
    server_id: 'server-1',
    signal_count: 0,
    source: 'manual',
    status: 'open',
    status_reason: null,
    summary: null,
    title: 'Manual review',
    updated_at: '2026-04-30T09:10:00.000Z',
    verdict: null,
    verdict_reason: null,
  };
}

export function caseSignalRow(): Row<'anti_abuse_case_signals'> {
  return {
    case_id: 'case-1',
    created_at: '2026-04-30T09:11:00.000Z',
    linked_by_user_id: null,
    reason: 'Grouped automatically.',
    signal_id: 'signal-1',
  };
}

export function participantRow(): Row<'anti_abuse_case_participants'> {
  return {
    case_id: 'case-1',
    created_at: '2026-04-30T09:12:00.000Z',
    created_by_user_id: null,
    description: 'Primary accused hero.',
    hero_id: 'hero-1',
    id: 'participant-1',
    reason: 'Signal actor.',
    role_key: 'accused',
    user_id: 'user-1',
  };
}

export function caseAuditRow(): Row<'anti_abuse_case_audit_logs'> {
  return {
    audit_log_id: 'audit-1',
    case_id: 'case-1',
    created_at: '2026-04-30T09:13:00.000Z',
    linked_by_user_id: 'staff-1',
    reason: 'Case audit.',
  };
}

export function caseDeclarationRow(): Row<'anti_abuse_case_declarations'> {
  return {
    case_id: 'case-1',
    created_at: '2026-04-30T09:14:00.000Z',
    declaration_id: 'declaration-1',
    linked_by_user_id: 'staff-1',
    reason: 'Related declaration.',
  };
}

export function reportRow(): Row<'player_abuse_reports'> {
  return {
    accused_hero_id: 'hero-2',
    accused_user_id: 'user-2',
    admin_notes: 'Staff-only report note.',
    case_id: 'case-1',
    created_at: '2026-04-30T09:15:00.000Z',
    description: 'Report description.',
    id: 'report-1',
    player_notes: 'Player-safe note.',
    related_item_id: null,
    related_trade_id: null,
    related_trade_reference: null,
    report_type_key: 'scam',
    reporting_hero_id: 'hero-1',
    reporting_user_id: 'user-1',
    resolved_at: null,
    server_id: 'server-1',
    status: 'submitted',
    status_reason: null,
    title: 'Scam report',
    updated_at: '2026-04-30T09:16:00.000Z',
  };
}

export function sanctionRow(): Row<'anti_abuse_sanctions'> {
  return {
    amount_character_points: 15,
    applied_at: null,
    cancelled_at: null,
    case_id: 'case-1',
    completed_at: null,
    created_at: '2026-04-30T09:17:00.000Z',
    destination_hero_id: null,
    duration_days: null,
    ends_at: null,
    failed_at: null,
    forgiven_at: null,
    id: 'sanction-1',
    imposed_by_user_id: 'staff-1',
    operator_notes: 'Sanction note.',
    reason: 'Confirmed abuse.',
    sanction_type_key: 'character_point_fine',
    source_hero_id: null,
    starts_at: null,
    status: 'pending',
    status_reason: null,
    target_hero_id: 'hero-2',
    target_user_id: 'user-2',
    updated_at: '2026-04-30T09:18:00.000Z',
  };
}

export function penaltyRow(): Row<'character_point_penalties'> {
  return {
    applied_at: null,
    cancelled_at: null,
    case_id: 'case-1',
    completed_at: null,
    created_at: '2026-04-30T09:19:00.000Z',
    created_by_user_id: 'staff-1',
    failed_at: null,
    forgiven_at: null,
    hero_id: 'hero-2',
    id: 'penalty-1',
    operator_notes: 'Penalty note.',
    paid_amount: 0,
    reason: 'Penalty for confirmed abuse.',
    remaining_amount: 15,
    sanction_id: 'sanction-1',
    server_id: 'server-1',
    status: 'pending',
    status_reason: null,
    total_amount: 15,
    updated_at: '2026-04-30T09:20:00.000Z',
    user_id: 'user-2',
  };
}

export function signalRow(): Row<'anti_abuse_signals'> {
  return {
    actor_hero_id: 'hero-1',
    actor_user_id: 'user-1',
    audit_log_id: 'audit-1',
    confidence: 0.8,
    created_at: '2026-04-30T09:21:00.000Z',
    description: 'Potential trade funnel.',
    dismissed_at: null,
    dismissed_by_user_id: null,
    dismissed_reason: null,
    entity_id: 'transaction-1',
    entity_type_key: 'trade_transaction',
    grouping_key: 'trade:hero-1:hero-2',
    id: 'signal-1',
    is_dismissed: false,
    metadata_json: { tradeValue: 500 },
    reason: 'Rule threshold exceeded.',
    score: 25,
    server_id: 'server-1',
    severity: 'warning',
    signal_type_key: 'trade_funnel',
    target_hero_id: 'hero-2',
    target_user_id: 'user-2',
    title: 'Potential trade funnel',
  };
}

export function auditLogRow(): AuditLogWithDictionaryRow {
  return {
    action_type_key: 'anti_abuse.case.updated',
    actor_hero_id: null,
    actor_user_id: 'staff-1',
    audit_action_types: null,
    audit_entity_types: null,
    created_at: '2026-04-30T09:22:00.000Z',
    entity_id: 'case-1',
    entity_type_key: 'anti_abuse_case',
    id: 'audit-1',
    metadata_json: {},
    new_value_json: { status: 'in_review' },
    old_value_json: { status: 'open' },
    reason: 'Case moved to review.',
    request_id: null,
    server_id: 'server-1',
    severity: 'notice',
    target_hero_id: null,
    target_user_id: null,
  };
}

export function declarationRow(): Row<'player_relationship_declarations'> {
  return {
    admin_notes: 'Staff declaration note.',
    amount_character_points: null,
    completed_at: null,
    created_at: '2026-04-30T09:23:00.000Z',
    created_by_hero_id: 'hero-1',
    created_by_user_id: 'user-1',
    declaration_type_key: 'shared_household',
    description: 'Shared household declaration.',
    expires_at: null,
    id: 'declaration-1',
    player_notes: 'Player declaration note.',
    reviewed_at: null,
    reviewed_by_user_id: null,
    revoked_at: null,
    server_id: 'server-1',
    starts_at: null,
    status: 'submitted',
    status_reason: null,
    submitted_at: '2026-04-30T09:23:00.000Z',
    title: 'Shared household',
    updated_at: '2026-04-30T09:24:00.000Z',
  };
}

export function sanctionItemRow(): Row<'anti_abuse_sanction_items'> {
  return {
    created_at: '2026-04-30T09:25:00.000Z',
    created_by_user_id: 'staff-1',
    destination_hero_id: null,
    id: 'sanction-item-1',
    item_id: 'item-1',
    operator_notes: 'Evidence item.',
    reason: 'Linked as evidence.',
    sanction_id: 'sanction-1',
    source_hero_id: 'hero-2',
  };
}
