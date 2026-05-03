import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { FilterOperator } from '../../enums/filter-operators';
import { Backend } from '../backend/backend';
import { ActiveHero } from './active-hero';
import { HeroProgressionHistory } from './hero-progression-history';

describe('HeroProgressionHistory', () => {
  let service: HeroProgressionHistory;
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let backend: jasmine.SpyObj<Backend>;

  beforeEach(() => {
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', ['requireActiveHero']);
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll', 'update', 'delete', 'create']);

    activeHero.requireActiveHero.and.returnValue(
      of({
        heroRow: {} as never,
        heroId: 'hero-1',
        hero: {} as never,
        userId: 'user-1',
        serverId: 'server-1',
        server: {} as never,
      }),
    );
    backend.getAll.and.callFake(<T extends object>(query: { table: string }) =>
      of(rowsForTable(query.table) as T[])
    );

    TestBed.configureTestingModule({
      providers: [
        HeroProgressionHistory,
        { provide: ActiveHero, useValue: activeHero },
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(HeroProgressionHistory);
  });

  it('loads active hero progression history as explicit read models', async () => {
    const result = await firstValueFrom(service.getActiveHeroHistory({ limit: 25 }));

    expect(backend.getAll).toHaveBeenCalledWith({
      table: 'hero_progression_ledger',
      filters: {
        heroId: { operator: FilterOperator.EQ, value: 'hero-1' },
        serverId: { operator: FilterOperator.EQ, value: 'server-1' },
      },
      orderBy: { column: 'created_at', ascending: false },
      range: { from: 0, to: 24 },
      camelCase: false,
    });
    expect(result[0]).toEqual(
      jasmine.objectContaining({
        id: 'ledger-1',
        entryType: 'experience_gain',
        experienceDelta: 120,
        statBonusGrants: [],
      }),
    );
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
    expect(backend.create).not.toHaveBeenCalled();
  });

  it('attaches actual stat bonus grants to level-up rows', async () => {
    backend.getAll.and.callFake(<T extends object>(query: { table: string }) =>
      of(rowsForTable(query.table, true) as T[])
    );

    const result = await firstValueFrom(service.getActiveHeroHistory());

    expect(backend.getAll).toHaveBeenCalledWith(
      jasmine.objectContaining({
        table: 'hero_level_stat_bonus_grants',
        filters: jasmine.objectContaining({
          heroId: { operator: FilterOperator.EQ, value: 'hero-1' },
          serverId: { operator: FilterOperator.EQ, value: 'server-1' },
          levelUpLedgerId: {
            operator: FilterOperator.IN,
            value: ['level-ledger-1'],
          },
        }),
      }),
    );
    expect(result[0].statBonusGrants).toEqual([
      jasmine.objectContaining({
        statLabel: 'Strength (strength)',
        ruleLabel: 'Warrior growth (warrior_growth)',
        valueChangeLabel: '10 -> 11',
      }),
    ]);
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
  });

  it('rejects invalid history limits before querying', () => {
    expect(() => service.getActiveHeroHistory({ limit: 1.5 })).toThrowError(
      'Progression history limit must be a positive integer.',
    );

    expect(backend.getAll).not.toHaveBeenCalled();
  });
});

function rowsForTable(table: string, levelUpLedger = false): object[] {
  switch (table) {
    case 'hero_progression_ledger':
      return [
        levelUpLedger
          ? {
            ...ledgerRow(),
            id: 'level-ledger-1',
            entry_kind: 'level_up',
            reached_level: 2,
          }
          : ledgerRow(),
      ];
    case 'hero_level_stat_bonus_grants':
      return [grantRow()];
    case 'level_up_stat_bonus_rules':
      return [ruleRow()];
    case 'level_up_stat_bonus_rule_stats':
      return [ruleStatRow()];
    case 'stats':
      return [{ key: 'strength', label: 'Strength' }];
    default:
      return [];
  }
}

function ledgerRow() {
  return {
    id: 'ledger-1',
    hero_id: 'hero-1',
    server_id: 'server-1',
    entry_kind: 'experience_gain',
    source_kind: 'trial',
    source_id: 'trial-1',
    experience_delta: 120,
    experience_before: 60,
    experience_after: 0,
    total_experience_earned_before: 60,
    total_experience_earned_after: 180,
    level_before: 1,
    level_after: 2,
    reached_level: null,
    parent_ledger_id: null,
    character_points_gross_delta: 120,
    character_points_balance_after: 25,
    xp_threshold: 180,
    reason: 'Trial completion reward',
    request_id: 'request-1',
    created_by: 'admin-1',
    created_at: '2026-05-03T10:00:00.000Z',
    metadata_json: { outcome: 'success' },
  };
}

function grantRow() {
  return {
    id: 'grant-1',
    hero_id: 'hero-1',
    server_id: 'server-1',
    level_up_ledger_id: 'level-ledger-1',
    parent_experience_ledger_id: 'ledger-1',
    rule_id: 'rule-1',
    rule_stat_id: 'rule-stat-1',
    stat_key: 'strength',
    grant_kind: 'fixed_stat',
    amount: 1,
    value_before: 10,
    value_after: 11,
    reached_level: 2,
    random_total_amount: null,
    random_weight_snapshot: null,
    metadata_json: {},
    created_by: 'system',
    created_at: '2026-05-03T10:00:01.000Z',
  };
}

function ruleRow() {
  return {
    id: 'rule-1',
    key: 'warrior_growth',
    label: 'Warrior growth',
    description: 'Fixed Strength on level-up.',
    helper_text: null,
    admin_description: null,
    rule_kind: 'fixed_stat',
    fixed_stat_key: 'strength',
    fixed_amount: 1,
    min_total_amount: null,
    max_total_amount: null,
    level_match_kind: 'any',
    level_value: null,
    max_level_value: null,
    level_interval: null,
    sort_order: 10,
    is_active: true,
    metadata_json: {},
    created_by: null,
    updated_by: null,
    created_at: '2026-05-03T09:00:00.000Z',
    updated_at: '2026-05-03T09:00:00.000Z',
  };
}

function ruleStatRow() {
  return {
    id: 'rule-stat-1',
    rule_id: 'rule-1',
    stat_key: 'strength',
    weight: 1,
    max_points_per_level: null,
    helper_text: null,
    admin_description: null,
    sort_order: 10,
    is_active: true,
    metadata_json: {},
    created_by: null,
    updated_by: null,
    created_at: '2026-05-03T09:00:00.000Z',
    updated_at: '2026-05-03T09:00:00.000Z',
  };
}
