import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { Backend } from '../backend/backend';
import {
  caseRow,
  participantRow,
  penaltyRow,
  sanctionRow,
} from './anti-abuse-case-detail-fixtures';
import { AntiAbuseReferencedDictionaries } from './anti-abuse-referenced-dictionaries';
import { AntiAbuseRepeatOffenderHistoryService } from './anti-abuse-repeat-offender-history';

describe('AntiAbuseRepeatOffenderHistoryService', () => {
  let backend: jasmine.SpyObj<Backend>;
  let dictionaries: jasmine.SpyObj<AntiAbuseReferencedDictionaries>;
  let service: AntiAbuseRepeatOffenderHistoryService;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll']);
    dictionaries = jasmine.createSpyObj<AntiAbuseReferencedDictionaries>(
      'AntiAbuseReferencedDictionaries',
      ['getForReferences'],
    );
    dictionaries.getForReferences.and.returnValue(
      of({
        sanctionTypes: [sanctionType('warning', 'Warning sanction')],
        reportTypes: [],
        declarationTypes: [],
        signalTypes: [],
      }),
    );

    TestBed.configureTestingModule({
      providers: [
        AntiAbuseRepeatOffenderHistoryService,
        { provide: Backend, useValue: backend },
        { provide: AntiAbuseReferencedDictionaries, useValue: dictionaries },
      ],
    });

    service = TestBed.inject(AntiAbuseRepeatOffenderHistoryService);
  });

  it('loads server-scoped repeat offender history for hero and account targets', (done) => {
    backend.getAll.and.callFake(((options) => {
      switch (options.table) {
        case TABLES.anti_abuse_case_participants:
          return of([participantRow()]);
        case TABLES.anti_abuse_sanctions:
          return of([
            {
              ...sanctionRow(),
              id: 'sanction-warning',
              sanction_type_key: 'warning',
              target_hero_id: 'hero-1',
              target_user_id: 'user-1',
            },
            {
              ...sanctionRow(),
              id: 'sanction-cross-server',
              case_id: 'case-cross-server',
              target_hero_id: 'hero-1',
              target_user_id: 'user-1',
            },
          ]);
        case TABLES.character_point_penalties:
          return of([
            {
              ...penaltyRow(),
              hero_id: 'hero-1',
              user_id: 'user-1',
              remaining_amount: 7,
            },
          ]);
        case TABLES.anti_abuse_cases:
          return of([
            {
              ...caseRow(),
              id: 'case-1',
              server_id: 'server-1',
            },
          ]);
        default:
          return of([]);
      }
    }) as Backend['getAll']);

    service
      .getHistory({ serverId: 'server-1', heroId: 'hero-1', userId: 'user-1' })
      .subscribe((history) => {
        expect(history.totals.cases).toBe(1);
        expect(history.totals.sanctions).toBe(1);
        expect(history.totals.warnings).toBe(1);
        expect(history.totals.characterPointPenalties).toBe(1);
        expect(history.totals.remainingCharacterPoints).toBe(7);
        expect(history.sanctions.map((entry) => entry.id)).toEqual([
          'sanction-warning',
        ]);
        expect(history.dictionaries.sanctionTypes.map((entry) => entry.label)).toEqual([
          'Warning sanction',
        ]);
        expect(dictionaries.getForReferences).toHaveBeenCalledOnceWith({
          sanctionTypeKeys: ['warning'],
          reportTypeKeys: [],
          declarationTypeKeys: [],
          signalTypeKeys: [],
        });
        expect(
          backend.getAll.calls
            .allArgs()
            .filter(([options]) => options.table === TABLES.anti_abuse_cases)[0][0]
            .filters,
        ).toEqual(
          jasmine.objectContaining({
            serverId: { operator: 'eq', value: 'server-1' },
          }),
        );
        done();
      });
  });

  it('excludes the current case from prior history totals', (done) => {
    backend.getAll.and.callFake(((options) => {
      switch (options.table) {
        case TABLES.anti_abuse_case_participants:
          return of([participantRow()]);
        case TABLES.anti_abuse_sanctions:
          return of([{ ...sanctionRow(), target_hero_id: 'hero-1' }]);
        case TABLES.character_point_penalties:
          return of([{ ...penaltyRow(), hero_id: 'hero-1' }]);
        case TABLES.anti_abuse_cases:
          return of([{ ...caseRow(), id: 'case-1' }]);
        default:
          return of([]);
      }
    }) as Backend['getAll']);

    service
      .getHistory({
        serverId: 'server-1',
        heroId: 'hero-1',
        excludeCaseId: 'case-1',
      })
      .subscribe((history) => {
        expect(history.cases).toEqual([]);
        expect(history.sanctions).toEqual([]);
        expect(history.characterPointPenalties).toEqual([]);
        done();
      });
  });

  it('requires a hero or account target', () => {
    expect(() => service.getHistory({ serverId: 'server-1' })).toThrowError(
      'heroId or userId is required for anti-abuse history.',
    );
  });
});

function sanctionType(key: string, label: string) {
  return {
    key,
    label,
    description: `${label} description.`,
    helperText: null,
    adminDescription: null,
    category: 'sanction',
    sortOrder: 1,
    isActive: true,
    requiresReason: true,
    requiresTargetHero: false,
    requiresSourceHero: false,
    requiresDurationDays: false,
    requiresItemSelection: false,
    requiresCharacterPointsAmount: false,
  };
}
