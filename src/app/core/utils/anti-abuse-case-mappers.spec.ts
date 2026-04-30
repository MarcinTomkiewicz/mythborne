import { Row } from '../types/supabase.types';
import {
  mapAntiAbuseCaseAuditLink,
  mapAntiAbuseCaseDeclarationLink,
  mapAntiAbuseCaseParticipant,
  mapAntiAbuseCaseReadModel,
  mapAntiAbuseCaseSignalLink,
  mapAntiAbuseSignalReadModel,
} from './anti-abuse-case-mappers';

describe('anti-abuse case read mappers', () => {
  it('maps anti-abuse cases with staff decision and grouping context', () => {
    expect(mapAntiAbuseCaseReadModel(caseRow())).toEqual(
      jasmine.objectContaining({
        id: 'case-1',
        serverId: 'server-1',
        source: 'system_signal',
        status: 'in_review',
        verdict: 'abuse_confirmed',
        groupingKey: 'trade:hero-1:hero-2',
        primaryHeroId: 'hero-1',
        primaryUserId: 'user-1',
        signalCount: 2,
        possibleRecidivism: true,
      }),
    );
  });

  it('maps anti-abuse signals with entity, actor, target and dismissal context', () => {
    expect(mapAntiAbuseSignalReadModel(signalRow())).toEqual(
      jasmine.objectContaining({
        id: 'signal-1',
        serverId: 'server-1',
        signalTypeKey: 'trade_funnel',
        severity: 'warning',
        score: 25,
        confidence: 0.8,
        entityTypeKey: 'trade_transaction',
        entityId: 'transaction-1',
        auditLogId: 'audit-1',
        metadataJson: { tradeValue: 500 },
        isDismissed: false,
      }),
    );
  });

  it('maps case links needed for detail aggregation', () => {
    expect(mapAntiAbuseCaseSignalLink(caseSignalRow())).toEqual({
      caseId: 'case-1',
      signalId: 'signal-1',
      reason: 'Grouped automatically.',
      linkedByUserId: null,
      createdAt: '2026-04-30T10:00:00.000Z',
    });
    expect(mapAntiAbuseCaseParticipant(participantRow())).toEqual(
      jasmine.objectContaining({
        id: 'participant-1',
        caseId: 'case-1',
        userId: 'user-1',
        heroId: 'hero-1',
        roleKey: 'accused',
      }),
    );
    expect(mapAntiAbuseCaseAuditLink(caseAuditRow())).toEqual({
      caseId: 'case-1',
      auditLogId: 'audit-1',
      reason: 'Decision audit.',
      linkedByUserId: 'staff-1',
      createdAt: '2026-04-30T10:00:00.000Z',
    });
    expect(mapAntiAbuseCaseDeclarationLink(caseDeclarationRow())).toEqual({
      caseId: 'case-1',
      declarationId: 'declaration-1',
      reason: 'Related declaration.',
      linkedByUserId: 'staff-1',
      createdAt: '2026-04-30T10:00:00.000Z',
    });
  });
});

function caseRow(): Row<'anti_abuse_cases'> {
  return {
    assigned_to_user_id: 'staff-1',
    cancelled_at: null,
    created_at: '2026-04-30T09:00:00.000Z',
    grouping_key: 'trade:hero-1:hero-2',
    id: 'case-1',
    last_signal_at: '2026-04-30T09:30:00.000Z',
    no_sanction_reason: null,
    opened_by_user_id: null,
    operator_notes: 'Staff note.',
    possible_recidivism: true,
    primary_hero_id: 'hero-1',
    primary_user_id: 'user-1',
    resolved_at: null,
    resolved_by_user_id: null,
    sanction_required: true,
    server_id: 'server-1',
    signal_count: 2,
    source: 'system_signal',
    status: 'in_review',
    status_reason: 'Manual review started.',
    summary: 'Suspicious repeated trades.',
    title: 'Trade funnel review',
    updated_at: '2026-04-30T09:45:00.000Z',
    verdict: 'abuse_confirmed',
    verdict_reason: 'Confirmed pattern.',
  };
}

function signalRow(): Row<'anti_abuse_signals'> {
  return {
    actor_hero_id: 'hero-1',
    actor_user_id: 'user-1',
    audit_log_id: 'audit-1',
    confidence: 0.8,
    created_at: '2026-04-30T09:10:00.000Z',
    description: 'Large repeated value transfer.',
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

function caseSignalRow(): Row<'anti_abuse_case_signals'> {
  return {
    case_id: 'case-1',
    created_at: '2026-04-30T10:00:00.000Z',
    linked_by_user_id: null,
    reason: 'Grouped automatically.',
    signal_id: 'signal-1',
  };
}

function participantRow(): Row<'anti_abuse_case_participants'> {
  return {
    case_id: 'case-1',
    created_at: '2026-04-30T10:00:00.000Z',
    created_by_user_id: null,
    description: 'Primary accused hero.',
    hero_id: 'hero-1',
    id: 'participant-1',
    reason: 'Signal actor.',
    role_key: 'accused',
    user_id: 'user-1',
  };
}

function caseAuditRow(): Row<'anti_abuse_case_audit_logs'> {
  return {
    audit_log_id: 'audit-1',
    case_id: 'case-1',
    created_at: '2026-04-30T10:00:00.000Z',
    linked_by_user_id: 'staff-1',
    reason: 'Decision audit.',
  };
}

function caseDeclarationRow(): Row<'anti_abuse_case_declarations'> {
  return {
    case_id: 'case-1',
    created_at: '2026-04-30T10:00:00.000Z',
    declaration_id: 'declaration-1',
    linked_by_user_id: 'staff-1',
    reason: 'Related declaration.',
  };
}
