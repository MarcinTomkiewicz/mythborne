import { Row } from '../types/supabase.types';
import {
  mapAntiAbuseCaseDecision,
  mapAntiAbuseSanctionDecision,
  mapAntiAbuseSanctionItemDecision,
  mapCharacterPointPenaltyDecision,
  mapPlayerAbuseReportDecision,
  mapPlayerRelationshipDeclarationDecision,
} from './anti-abuse-decision-mappers';

describe('anti-abuse decision domain mappers', () => {
  it('maps returned anti-abuse decision rows to domain models', () => {
    expect(mapAntiAbuseCaseDecision(createCaseRow()).status).toBe('resolved');
    expect(mapPlayerRelationshipDeclarationDecision(createDeclarationRow()).status)
      .toBe('approved');
    expect(mapPlayerAbuseReportDecision(createReportRow()).status)
      .toBe('linked_to_case');
    expect(mapAntiAbuseSanctionDecision(createSanctionRow()).status)
      .toBe('pending');
    expect(mapCharacterPointPenaltyDecision(createPenaltyRow()).remainingAmount)
      .toBe(100);
    expect(mapAntiAbuseSanctionItemDecision(createSanctionItemRow()).itemId)
      .toBe('item-1');
  });
});

function createCaseRow(): Row<'anti_abuse_cases'> {
  return {
    assigned_to_user_id: null,
    cancelled_at: null,
    created_at: '2026-04-28T00:00:00.000Z',
    grouping_key: 'group-1',
    id: 'case-1',
    last_signal_at: null,
    no_sanction_reason: null,
    opened_by_user_id: null,
    operator_notes: 'Reviewed.',
    possible_recidivism: false,
    primary_hero_id: 'hero-1',
    primary_user_id: 'user-1',
    resolved_at: '2026-04-28T00:00:00.000Z',
    resolved_by_user_id: 'operator-1',
    sanction_required: true,
    server_id: 'server-1',
    signal_count: 1,
    source: 'manual',
    status: 'resolved',
    status_reason: 'Done.',
    summary: 'Case summary.',
    title: 'Case title',
    updated_at: '2026-04-28T00:00:00.000Z',
    verdict: 'abuse_confirmed',
    verdict_reason: 'Confirmed.',
  };
}

function createDeclarationRow(): Row<'player_relationship_declarations'> {
  return {
    admin_notes: 'Reviewed.',
    amount_character_points: null,
    completed_at: null,
    created_at: '2026-04-28T00:00:00.000Z',
    created_by_hero_id: 'hero-1',
    created_by_user_id: 'user-1',
    declaration_type_key: 'shared_household',
    description: 'Declaration.',
    expires_at: null,
    id: 'declaration-1',
    player_notes: 'Player note.',
    reviewed_at: '2026-04-28T00:00:00.000Z',
    reviewed_by_user_id: 'operator-1',
    revoked_at: null,
    server_id: 'server-1',
    starts_at: null,
    status: 'approved',
    status_reason: 'Valid.',
    submitted_at: null,
    title: 'Declaration title',
    updated_at: '2026-04-28T00:00:00.000Z',
  };
}

function createReportRow(): Row<'player_abuse_reports'> {
  return {
    accused_hero_id: 'hero-2',
    accused_user_id: 'user-2',
    admin_notes: null,
    case_id: 'case-1',
    created_at: '2026-04-28T00:00:00.000Z',
    description: 'Report.',
    id: 'report-1',
    player_notes: null,
    related_item_id: null,
    related_trade_id: null,
    related_trade_reference: null,
    report_type_key: 'scam',
    reporting_hero_id: 'hero-1',
    reporting_user_id: 'user-1',
    resolved_at: null,
    server_id: 'server-1',
    status: 'linked_to_case',
    status_reason: 'Linked.',
    title: 'Report title',
    updated_at: '2026-04-28T00:00:00.000Z',
  };
}

function createSanctionRow(): Row<'anti_abuse_sanctions'> {
  return {
    amount_character_points: 100,
    applied_at: null,
    cancelled_at: null,
    case_id: 'case-1',
    completed_at: null,
    created_at: '2026-04-28T00:00:00.000Z',
    destination_hero_id: null,
    duration_days: null,
    ends_at: null,
    failed_at: null,
    forgiven_at: null,
    id: 'sanction-1',
    imposed_by_user_id: 'operator-1',
    operator_notes: null,
    reason: 'Fine.',
    sanction_type_key: 'character_point_fine',
    source_hero_id: null,
    starts_at: null,
    status: 'pending',
    status_reason: null,
    target_hero_id: 'hero-1',
    target_user_id: 'user-1',
    updated_at: '2026-04-28T00:00:00.000Z',
  };
}

function createPenaltyRow(): Row<'character_point_penalties'> {
  return {
    applied_at: null,
    cancelled_at: null,
    case_id: 'case-1',
    completed_at: null,
    created_at: '2026-04-28T00:00:00.000Z',
    created_by_user_id: 'operator-1',
    failed_at: null,
    forgiven_at: null,
    hero_id: 'hero-1',
    id: 'penalty-1',
    operator_notes: null,
    paid_amount: 0,
    reason: 'Fine.',
    remaining_amount: 100,
    sanction_id: 'sanction-1',
    server_id: 'server-1',
    status: 'pending',
    status_reason: null,
    total_amount: 100,
    updated_at: '2026-04-28T00:00:00.000Z',
    user_id: 'user-1',
  };
}

function createSanctionItemRow(): Row<'anti_abuse_sanction_items'> {
  return {
    created_at: '2026-04-28T00:00:00.000Z',
    created_by_user_id: 'operator-1',
    destination_hero_id: null,
    id: 'sanction-item-1',
    item_id: 'item-1',
    operator_notes: null,
    reason: 'Evidence item.',
    sanction_id: 'sanction-1',
    source_hero_id: 'hero-1',
  };
}
