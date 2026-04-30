import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { FilterOperator } from '../../enums/filter-operators';
import { Backend } from '../backend/backend';
import {
  auditLogRow,
  caseAuditRow,
  caseDeclarationRow,
  caseRow,
  caseSignalRow,
  declarationRow,
  participantRow,
  penaltyRow,
  reportRow,
  sanctionItemRow,
  sanctionRow,
  signalRow,
} from './anti-abuse-case-detail-fixtures';
import { AntiAbuseCaseDetails } from './anti-abuse-case-details';

describe('AntiAbuseCaseDetails', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: AntiAbuseCaseDetails;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll']);
    backend.getAll.and.callFake(((opts: { table: string }) => {
      switch (opts.table) {
        case TABLES.anti_abuse_cases:
          return of([caseRow()]);
        case TABLES.anti_abuse_case_signals:
          return of([caseSignalRow()]);
        case TABLES.anti_abuse_case_participants:
          return of([participantRow()]);
        case TABLES.anti_abuse_case_audit_logs:
          return of([caseAuditRow()]);
        case TABLES.anti_abuse_case_declarations:
          return of([caseDeclarationRow()]);
        case TABLES.player_abuse_reports:
          return of([reportRow()]);
        case TABLES.anti_abuse_sanctions:
          return of([sanctionRow()]);
        case TABLES.character_point_penalties:
          return of([penaltyRow()]);
        case TABLES.anti_abuse_signals:
          return of([signalRow()]);
        case TABLES.audit_logs:
          return of([auditLogRow()]);
        case TABLES.player_relationship_declarations:
          return of([declarationRow()]);
        case TABLES.anti_abuse_sanction_items:
          return of([sanctionItemRow()]);
        default:
          return of([]);
      }
    }) as Backend['getAll']);

    TestBed.configureTestingModule({
      providers: [
        AntiAbuseCaseDetails,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(AntiAbuseCaseDetails);
  });

  it('aggregates linked case data for staff detail views', async () => {
    const detail = await firstValueFrom(
      service.getCaseDetail({ serverId: ' server-1 ', caseId: ' case-1 ' }),
    );

    expect(detail.case.id).toBe('case-1');
    expect(detail.caseSignals[0].signalId).toBe('signal-1');
    expect(detail.signals[0].signalTypeKey).toBe('trade_funnel');
    expect(detail.participants[0].roleKey).toBe('accused');
    expect(detail.auditLinks[0].auditLogId).toBe('audit-1');
    expect(detail.auditLogs[0].actionTypeKey).toBe('anti_abuse.case.updated');
    expect(detail.declarationLinks[0].declarationId).toBe('declaration-1');
    expect(detail.declarations[0].declarationTypeKey).toBe('shared_household');
    expect(detail.reports[0].reportTypeKey).toBe('scam');
    expect(detail.sanctions[0].sanctionTypeKey).toBe('character_point_fine');
    expect(detail.characterPointPenalties[0].totalAmount).toBe(15);
    expect(detail.sanctionItems[0].itemId).toBe('item-1');
  });

  it('loads the base case by id and selected server before linked reads', async () => {
    await firstValueFrom(
      service.getCaseDetail({ serverId: ' server-1 ', caseId: ' case-1 ' }),
    );

    expect(backend.getAll.calls.first().args[0]).toEqual(
      jasmine.objectContaining({
        table: TABLES.anti_abuse_cases,
        filters: {
          id: { operator: FilterOperator.EQ, value: 'case-1' },
          serverId: { operator: FilterOperator.EQ, value: 'server-1' },
        },
        camelCase: false,
      }),
    );
  });

  it('requires case id for detail aggregation', () => {
    expect(() => service.getCaseDetail({ serverId: 'server-1', caseId: ' ' })).toThrowError(
      'caseId is required for anti-abuse case detail.',
    );
  });

  it('requires server id for detail aggregation', () => {
    expect(() => service.getCaseDetail({ serverId: ' ', caseId: 'case-1' })).toThrowError(
      'serverId is required for anti-abuse case detail.',
    );
  });

  it('fails clearly when the case is not found for the selected server', async () => {
    backend.getAll.and.callFake(((opts: { table: string }) =>
      opts.table === TABLES.anti_abuse_cases ? of([]) : of([])) as Backend['getAll']);

    await expectAsync(
      firstValueFrom(
        service.getCaseDetail({ serverId: 'server-2', caseId: 'case-1' }),
      ),
    ).toBeRejectedWithError('Anti-abuse case not found for selected server.');

    expect(backend.getAll.calls.allArgs().map(([options]) => options.table)).toEqual([
      TABLES.anti_abuse_cases,
    ]);
  });
});
