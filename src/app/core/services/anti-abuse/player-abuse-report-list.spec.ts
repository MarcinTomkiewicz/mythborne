import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { PlayerAbuseReportTypeEntry } from '../../domain/anti-abuse/anti-abuse-dictionary.model';
import { FilterOperator } from '../../enums/filter-operators';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';
import { AntiAbuseDictionaries } from './anti-abuse-dictionaries';
import { PlayerAbuseReportList } from './player-abuse-report-list';

describe('PlayerAbuseReportList', () => {
  let backend: jasmine.SpyObj<Backend>;
  let dictionaries: jasmine.SpyObj<AntiAbuseDictionaries>;
  let service: PlayerAbuseReportList;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll']);
    dictionaries = jasmine.createSpyObj<AntiAbuseDictionaries>(
      'AntiAbuseDictionaries',
      ['getActiveReportTypes'],
    );
    dictionaries.getActiveReportTypes.and.returnValue(of([reportType()]));
    backend.getAll.and.callFake(((opts: { table: string; filters?: Record<string, unknown> }) => {
      switch (opts.table) {
        case TABLES.player_abuse_reports:
          return opts.filters && 'reportingUserId' in opts.filters
            ? of([userOnlyReportRow(), crossServerReportRow()])
            : of([heroReportRow()]);
        case TABLES.anti_abuse_cases:
          return of([caseRow()]);
        case TABLES.player_abuse_report_types:
          return of([inactiveReportTypeRow()]);
        default:
          return of([]);
      }
    }) as Backend['getAll']);

    TestBed.configureTestingModule({
      providers: [
        PlayerAbuseReportList,
        { provide: Backend, useValue: backend },
        { provide: AntiAbuseDictionaries, useValue: dictionaries },
      ],
    });
    service = TestBed.inject(PlayerAbuseReportList);
  });

  it('loads player relevant reports with linked case status', async () => {
    const reports = await firstValueFrom(
      service.getReportsForPlayer({
        serverId: ' server-1 ',
        heroId: ' hero-1 ',
        userId: ' user-1 ',
      }),
    );

    expect(reports.map((entry) => entry.id)).toEqual([
      'report-3',
      'report-1',
    ]);
    expect(reports[0]).toEqual(
      jasmine.objectContaining({
        reportTypeLabel: 'Scam',
        statusLabel: 'Submitted',
        playerStatusMessage: 'User-only report update.',
      }),
    );
    expect(reports[0].linkedCase).toEqual(
      jasmine.objectContaining({
        id: 'case-1',
        statusLabel: 'Open',
      }),
    );
    expect(reports[1]).toEqual(
      jasmine.objectContaining({
        reportTypeKey: 'archived_scam',
        reportTypeLabel: 'Archived scam',
      }),
    );
  });

  it('queries reports by selected server and active player context', async () => {
    await firstValueFrom(
      service.getReportsForPlayer({
        serverId: ' server-1 ',
        heroId: ' hero-1 ',
        userId: ' user-1 ',
      }),
    );

    const calls = backend.getAll.calls.allArgs().map(([options]) => options);

    expect(calls[0]).toEqual(
      jasmine.objectContaining({
        table: TABLES.player_abuse_reports,
        filters: {
          serverId: { operator: FilterOperator.EQ, value: 'server-1' },
          reportingHeroId: { operator: FilterOperator.EQ, value: 'hero-1' },
        },
        camelCase: false,
      }),
    );
    expect(calls[1]).toEqual(
      jasmine.objectContaining({
        table: TABLES.player_abuse_reports,
        filters: {
          serverId: { operator: FilterOperator.EQ, value: 'server-1' },
          reportingUserId: { operator: FilterOperator.EQ, value: 'user-1' },
        },
        camelCase: false,
      }),
    );
  });

  it('loads linked case statuses through selected-server scoped query', async () => {
    await firstValueFrom(
      service.getReportsForPlayer({
        serverId: 'server-1',
        heroId: 'hero-1',
        userId: 'user-1',
      }),
    );

    expect(backend.getAll.calls.allArgs().map(([options]) => options)).toContain(
      jasmine.objectContaining({
        table: TABLES.anti_abuse_cases,
        filters: jasmine.objectContaining({
          serverId: { operator: FilterOperator.EQ, value: 'server-1' },
        }),
      }),
    );
  });

  it('does not leak reports from another selected server', async () => {
    const reports = await firstValueFrom(
      service.getReportsForPlayer({
        serverId: 'server-1',
        heroId: 'hero-1',
        userId: 'user-1',
      }),
    );

    expect(reports.map((entry) => entry.id)).not.toContain('report-cross');
  });

  it('does not expose staff-only or global account fields in player report models', async () => {
    const reports = await firstValueFrom(
      service.getReportsForPlayer({
        serverId: 'server-1',
        heroId: 'hero-1',
        userId: 'user-1',
      }),
    );

    expect(reports[0] as unknown as Record<string, unknown>).not.toEqual(
      jasmine.objectContaining({
        adminNotes: jasmine.any(String),
        adminDescription: jasmine.any(String),
        statusReason: jasmine.any(String),
        reportingUserId: jasmine.any(String),
        accusedUserId: jasmine.any(String),
      }),
    );
    expect(reports[0].linkedCase as unknown as Record<string, unknown>).not.toEqual(
      jasmine.objectContaining({
        operatorNotes: jasmine.any(String),
        statusReason: jasmine.any(String),
        verdictReason: jasmine.any(String),
      }),
    );
  });

  it('loads labels for referenced inactive report types', async () => {
    const reports = await firstValueFrom(
      service.getReportsForPlayer({
        serverId: 'server-1',
        heroId: 'hero-1',
        userId: 'user-1',
      }),
    );

    expect(reports.find((entry) => entry.id === 'report-1')).toEqual(
      jasmine.objectContaining({
        reportTypeLabel: 'Archived scam',
      }),
    );
    expect(backend.getAll.calls.allArgs().map(([options]) => options.table)).toContain(
      TABLES.player_abuse_report_types,
    );
  });

  it('requires server, hero and user ids', () => {
    expect(() =>
      service.getReportsForPlayer({ serverId: '', heroId: 'hero-1', userId: 'user-1' }),
    ).toThrowError('serverId is required for player abuse report list.');
    expect(() =>
      service.getReportsForPlayer({ serverId: 'server-1', heroId: '', userId: 'user-1' }),
    ).toThrowError('heroId is required for player abuse report list.');
    expect(() =>
      service.getReportsForPlayer({ serverId: 'server-1', heroId: 'hero-1', userId: '' }),
    ).toThrowError('userId is required for player abuse report list.');
  });
});

function reportType(): PlayerAbuseReportTypeEntry {
  return {
    key: 'scam',
    label: 'Scam',
    description: 'Report a scam.',
    helperText: null,
    adminDescription: 'Staff-only type context.',
    category: 'trade',
    sortOrder: 10,
    isActive: true,
    requiresAccusedHero: true,
    requiresDescription: true,
    requiresItemSelection: false,
    requiresTradeSelection: true,
  };
}

function inactiveReportTypeRow(): Row<'player_abuse_report_types'> {
  return {
    admin_description: 'Staff-only archived type context.',
    category: 'trade',
    created_at: '2026-04-30T09:00:00.000Z',
    created_by: null,
    description: 'Archived scam report.',
    helper_text: null,
    id: 'report-type-2',
    is_active: false,
    key: 'archived_scam',
    label: 'Archived scam',
    requires_accused_hero: true,
    requires_description: true,
    requires_item_selection: false,
    requires_trade_selection: true,
    sort_order: 20,
    updated_at: '2026-04-30T09:00:00.000Z',
    updated_by: null,
  };
}

function heroReportRow(): Row<'player_abuse_reports'> {
  return reportRow({
    id: 'report-1',
    report_type_key: 'archived_scam',
    player_notes: 'Hero report update.',
    updated_at: '2026-04-30T09:00:00.000Z',
  });
}

function userOnlyReportRow(): Row<'player_abuse_reports'> {
  return reportRow({
    id: 'report-3',
    reporting_hero_id: null,
    player_notes: 'User-only report update.',
    updated_at: '2026-04-30T11:00:00.000Z',
  });
}

function crossServerReportRow(): Row<'player_abuse_reports'> {
  return reportRow({
    id: 'report-cross',
    server_id: 'server-2',
    case_id: 'case-cross',
    player_notes: 'Cross-server report update.',
    updated_at: '2026-04-30T10:00:00.000Z',
  });
}

function reportRow(
  overrides: Partial<Row<'player_abuse_reports'>>,
): Row<'player_abuse_reports'> {
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
    status: 'submitted',
    status_reason: 'Staff-only report status reason.',
    title: 'Trade scam',
    updated_at: '2026-04-30T09:00:00.000Z',
    ...overrides,
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
