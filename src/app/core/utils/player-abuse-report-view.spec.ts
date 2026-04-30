import { PlayerAbuseReportTypeEntry } from '../domain/anti-abuse/anti-abuse-dictionary.model';
import { Row } from '../types/supabase.types';
import {
  mapPlayerAbuseReportLinkedCase,
  mapPlayerAbuseReportListItem,
} from './player-abuse-report-view';

describe('player abuse report view mappers', () => {
  it('maps player-facing report fields without staff-only data', () => {
    const item = mapPlayerAbuseReportListItem(reportRow(), {
      reportTypes: [reportType()],
      linkedCase: mapPlayerAbuseReportLinkedCase(caseRow()),
    });

    expect(item).toEqual(
      jasmine.objectContaining({
        id: 'report-1',
        reportTypeLabel: 'Scam',
        statusLabel: 'Linked to case',
        playerStatusMessage: 'Visible player update.',
        linkedCase: jasmine.objectContaining({
          id: 'case-1',
          statusLabel: 'Open',
        }),
      }),
    );
    expect(item as unknown as Record<string, unknown>).not.toEqual(
      jasmine.objectContaining({
        adminNotes: jasmine.any(String),
        adminDescription: jasmine.any(String),
        statusReason: jasmine.any(String),
        reportingUserId: jasmine.any(String),
        accusedUserId: jasmine.any(String),
      }),
    );
    expect(item.linkedCase as unknown as Record<string, unknown>).not.toEqual(
      jasmine.objectContaining({
        operatorNotes: jasmine.any(String),
        statusReason: jasmine.any(String),
        verdictReason: jasmine.any(String),
      }),
    );
  });

  it('falls back to raw report type key when dictionary label is unavailable', () => {
    expect(
      mapPlayerAbuseReportListItem(reportRow(), {
        reportTypes: [],
        linkedCase: null,
      }),
    ).toEqual(
      jasmine.objectContaining({
        reportTypeLabel: 'scam',
        linkedCase: null,
      }),
    );
  });
});

function reportType(): PlayerAbuseReportTypeEntry {
  return {
    key: 'scam',
    label: 'Scam',
    description: 'Report a scam.',
    helperText: null,
    adminDescription: 'Staff-only report type guidance.',
    category: 'trade',
    sortOrder: 10,
    isActive: true,
    requiresAccusedHero: true,
    requiresDescription: true,
    requiresItemSelection: false,
    requiresTradeSelection: true,
  };
}

function reportRow(): Row<'player_abuse_reports'> {
  return {
    accused_hero_id: 'hero-2',
    accused_user_id: 'user-2',
    admin_notes: 'Staff-only report note.',
    case_id: 'case-1',
    created_at: '2026-04-30T08:00:00.000Z',
    description: 'Player did not send the agreed item.',
    id: 'report-1',
    player_notes: 'Visible player update.',
    related_item_id: null,
    related_trade_id: 'trade-1',
    related_trade_reference: 'Trade #1',
    report_type_key: 'scam',
    reporting_hero_id: 'hero-1',
    reporting_user_id: 'user-1',
    resolved_at: null,
    server_id: 'server-1',
    status: 'linked_to_case',
    status_reason: 'Staff-only report status reason.',
    title: 'Trade scam',
    updated_at: '2026-04-30T09:00:00.000Z',
  };
}

function caseRow(): Row<'anti_abuse_cases'> {
  return {
    assigned_to_user_id: 'staff-user-1',
    cancelled_at: null,
    created_at: '2026-04-30T08:30:00.000Z',
    grouping_key: null,
    id: 'case-1',
    last_signal_at: null,
    no_sanction_reason: null,
    opened_by_user_id: 'staff-user-1',
    operator_notes: 'Staff-only case note.',
    possible_recidivism: false,
    primary_hero_id: 'hero-2',
    primary_user_id: 'user-2',
    resolved_at: null,
    resolved_by_user_id: null,
    sanction_required: null,
    server_id: 'server-1',
    signal_count: 0,
    source: 'player_report',
    status: 'open',
    status_reason: 'Staff-only case status reason.',
    summary: 'Staff-only summary.',
    title: 'Trade scam case',
    updated_at: '2026-04-30T09:30:00.000Z',
    verdict: null,
    verdict_reason: 'Staff-only verdict reason.',
  };
}
