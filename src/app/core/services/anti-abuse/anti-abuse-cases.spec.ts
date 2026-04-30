import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { FilterOperator } from '../../enums/filter-operators';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';
import { AntiAbuseCases, toCaseListQueryFilters } from './anti-abuse-cases';

describe('AntiAbuseCases', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: AntiAbuseCases;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll']);
    backend.getAll.and.returnValue(of([caseRow()]));

    TestBed.configureTestingModule({
      providers: [
        AntiAbuseCases,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(AntiAbuseCases);
  });

  it('loads anti-abuse cases scoped to one server by default', async () => {
    const cases = await firstValueFrom(
      service.getCasesForServer({ serverId: ' server-1 ' }),
    );

    expect(cases[0]).toEqual(
      jasmine.objectContaining({
        id: 'case-1',
        serverId: 'server-1',
        status: 'open',
      }),
    );
    expect(backend.getAll).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        table: TABLES.anti_abuse_cases,
        filters: {
          serverId: { operator: FilterOperator.EQ, value: 'server-1' },
        },
        orderBy: [
          { column: 'updated_at', ascending: false },
          { column: 'created_at', ascending: false },
        ],
        camelCase: false,
      }),
    );
  });

  it('builds status, verdict, source and date range filters', () => {
    expect(
      toCaseListQueryFilters({
        serverId: 'server-1',
        status: 'in_review',
        verdict: 'abuse_confirmed',
        source: 'player_report',
        createdFrom: '2026-04-01T00:00:00.000Z',
        createdTo: '2026-04-30T23:59:59.999Z',
      }),
    ).toEqual({
      serverId: { operator: FilterOperator.EQ, value: 'server-1' },
      status: { operator: FilterOperator.EQ, value: 'in_review' },
      verdict: { operator: FilterOperator.EQ, value: 'abuse_confirmed' },
      source: { operator: FilterOperator.EQ, value: 'player_report' },
      createdAt: [
        { operator: FilterOperator.GTE, value: '2026-04-01T00:00:00.000Z' },
        { operator: FilterOperator.LTE, value: '2026-04-30T23:59:59.999Z' },
      ],
    });
  });

  it('requires server id so staff case lists cannot fall back to global cases', () => {
    expect(() => toCaseListQueryFilters({ serverId: ' ' })).toThrowError(
      'serverId is required for anti-abuse case list.',
    );
  });
});

function caseRow(): Row<'anti_abuse_cases'> {
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
