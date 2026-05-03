import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';
import { LevelUpStatBonuses } from './level-up-stat-bonuses';

describe('LevelUpStatBonuses', () => {
  let service: LevelUpStatBonuses;
  let backend: jasmine.SpyObj<Backend>;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'getAll',
      'create',
      'update',
      'delete',
    ]);
    backend.getAll.and.callFake(<T extends object>(query: { table: string }) =>
      of(rowsForTable(query.table) as T[])
    );

    TestBed.configureTestingModule({
      providers: [
        LevelUpStatBonuses,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(LevelUpStatBonuses);
  });

  it('loads level-up stat bonus admin data as read-only rules and pools', async () => {
    const data = await firstValueFrom(service.getAdminData());

    expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
      table: TABLES.level_up_stat_bonus_rules,
    }));
    expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
      table: TABLES.level_up_stat_bonus_rule_stats,
    }));
    expect(data.ruleViews[0]).toEqual(jasmine.objectContaining({
      fixedStatLabel: 'Strength (strength)',
      amountLabel: '+1',
    }));
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
  });
});

function rowsForTable(table: string): object[] {
  switch (table) {
    case TABLES.level_up_stat_bonus_rules:
      return [ruleRow()];
    case TABLES.level_up_stat_bonus_rule_stats:
      return [ruleStatRow()];
    case TABLES.stats:
      return [{ key: 'strength', label: 'Strength' }];
    default:
      return [];
  }
}

function ruleRow(): Row<'level_up_stat_bonus_rules'> {
  return {
    id: 'rule-1',
    key: 'fixed_strength',
    label: 'Fixed Strength',
    description: 'Fixed Strength on every level.',
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

function ruleStatRow(): Row<'level_up_stat_bonus_rule_stats'> {
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
