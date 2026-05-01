import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { AntiAbuseDictionaryData } from '../../domain/anti-abuse/anti-abuse-dictionary.model';
import { FilterOperator } from '../../enums/filter-operators';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';
import { AntiAbuseReferencedDictionaries } from './anti-abuse-referenced-dictionaries';
import { AntiAbuseSignals, toSignalListQueryFilters } from './anti-abuse-signals';

describe('AntiAbuseSignals', () => {
  let backend: jasmine.SpyObj<Backend>;
  let dictionaries: jasmine.SpyObj<AntiAbuseReferencedDictionaries>;
  let service: AntiAbuseSignals;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll', 'create', 'update', 'delete']);
    dictionaries = jasmine.createSpyObj<AntiAbuseReferencedDictionaries>(
      'AntiAbuseReferencedDictionaries',
      ['getForReferences'],
    );

    backend.getAll.and.returnValue(of([signalRow()]));
    dictionaries.getForReferences.and.returnValue(of(dictionaryData()));

    TestBed.configureTestingModule({
      providers: [
        AntiAbuseSignals,
        { provide: Backend, useValue: backend },
        { provide: AntiAbuseReferencedDictionaries, useValue: dictionaries },
      ],
    });
    service = TestBed.inject(AntiAbuseSignals);
  });

  it('loads anti-abuse signals scoped to one server with referenced signal labels', async () => {
    const result = await firstValueFrom(
      service.getSignalsForServer({ serverId: ' server-1 ' }),
    );

    expect(result.signals[0]).toEqual(
      jasmine.objectContaining({
        id: 'signal-1',
        serverId: 'server-1',
        signalTypeKey: 'trade.repeated_pair_transfers',
        entityTypeKey: 'player_trade_transaction',
        entityId: 'transaction-1',
      }),
    );
    expect(result.dictionaries.signalTypes[0].label).toBe('Repeated transfers');
    expect(backend.getAll).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        table: TABLES.anti_abuse_signals,
        filters: {
          serverId: { operator: FilterOperator.EQ, value: 'server-1' },
        },
        orderBy: [{ column: 'created_at', ascending: false }],
        camelCase: false,
      }),
    );
    expect(dictionaries.getForReferences).toHaveBeenCalledOnceWith({
      sanctionTypeKeys: [],
      reportTypeKeys: [],
      declarationTypeKeys: [],
      signalTypeKeys: ['trade.repeated_pair_transfers'],
    });
  });

  it('builds server-scoped signal filters without exposing raw rows to callers', () => {
    expect(
      toSignalListQueryFilters({
        serverId: 'server-1',
        signalTypeKey: ' trade.high_cp_direct_trade ',
        severity: 'warning',
        actorHeroId: 'actor-hero',
        actorUserId: 'actor-user',
        targetHeroId: 'target-hero',
        targetUserId: 'target-user',
        entityTypeKey: 'player_trade_transaction',
        entityId: 'transaction-1',
        groupingKey: 'hero-pair:1',
        isDismissed: false,
        createdFrom: '2026-04-01T00:00:00.000Z',
        createdTo: '2026-04-30T23:59:59.999Z',
      }),
    ).toEqual({
      serverId: { operator: FilterOperator.EQ, value: 'server-1' },
      signalTypeKey: {
        operator: FilterOperator.EQ,
        value: 'trade.high_cp_direct_trade',
      },
      severity: { operator: FilterOperator.EQ, value: 'warning' },
      actorHeroId: { operator: FilterOperator.EQ, value: 'actor-hero' },
      actorUserId: { operator: FilterOperator.EQ, value: 'actor-user' },
      targetHeroId: { operator: FilterOperator.EQ, value: 'target-hero' },
      targetUserId: { operator: FilterOperator.EQ, value: 'target-user' },
      entityTypeKey: {
        operator: FilterOperator.EQ,
        value: 'player_trade_transaction',
      },
      entityId: { operator: FilterOperator.EQ, value: 'transaction-1' },
      groupingKey: { operator: FilterOperator.EQ, value: 'hero-pair:1' },
      isDismissed: { operator: FilterOperator.EQ, value: false },
      createdAt: [
        { operator: FilterOperator.GTE, value: '2026-04-01T00:00:00.000Z' },
        { operator: FilterOperator.LTE, value: '2026-04-30T23:59:59.999Z' },
      ],
    });
  });

  it('requires server id so staff signal reads cannot fall back to global signals', () => {
    expect(() => toSignalListQueryFilters({ serverId: ' ' })).toThrowError(
      'serverId is required for anti-abuse signal list.',
    );
  });

  it('does not add direct signal or case mutation paths', async () => {
    await firstValueFrom(service.getSignalsForServer({ serverId: 'server-1' }));

    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
  });

  it('deduplicates signal type keys before loading referenced dictionaries', async () => {
    backend.getAll.and.returnValue(of([signalRow(), signalRow({ id: 'signal-2' })]));

    await firstValueFrom(service.getSignalsForServer({ serverId: 'server-1' }));

    expect(dictionaries.getForReferences).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        signalTypeKeys: ['trade.repeated_pair_transfers'],
      }),
    );
  });
});

function signalRow(
  overrides: Partial<Row<'anti_abuse_signals'>> = {},
): Row<'anti_abuse_signals'> {
  return {
    actor_hero_id: 'actor-hero',
    actor_user_id: 'actor-user',
    audit_log_id: 'audit-1',
    confidence: 0.8,
    created_at: '2026-05-01T10:00:00.000Z',
    description: 'Repeated transfers between the same heroes.',
    dismissed_at: null,
    dismissed_by_user_id: null,
    dismissed_reason: null,
    entity_id: 'transaction-1',
    entity_type_key: 'player_trade_transaction',
    grouping_key: 'hero-pair:1',
    id: 'signal-1',
    is_dismissed: false,
    metadata_json: { source: 'spec' },
    reason: 'Pattern matched.',
    score: 75,
    server_id: 'server-1',
    severity: 'warning',
    signal_type_key: 'trade.repeated_pair_transfers',
    target_hero_id: 'target-hero',
    target_user_id: 'target-user',
    title: 'Repeated transfer pattern',
    ...overrides,
  };
}

function dictionaryData(): AntiAbuseDictionaryData {
  return {
    sanctionTypes: [],
    reportTypes: [],
    declarationTypes: [],
    signalTypes: [
      {
        key: 'trade.repeated_pair_transfers',
        label: 'Repeated transfers',
        description: 'Repeated transfer review signal.',
        helperText: 'Review the linked transactions.',
        adminDescription: 'DB-generated review signal.',
        category: 'trade',
        sortOrder: 10,
        isActive: true,
        defaultSeverity: 'warning',
        defaultScore: 70,
        defaultConfidence: 0.75,
      },
    ],
  };
}
