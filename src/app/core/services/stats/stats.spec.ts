import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { FilterOperator } from '../../enums/filter-operators';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';

import { StatsService } from './stats';

describe('StatsService', () => {
  let service: StatsService;
  let backend: jasmine.SpyObj<Backend>;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll']);

    TestBed.configureTestingModule({
      providers: [
        StatsService,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(StatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loads derived stat labels from active derived stat definitions', async () => {
    backend.getAll.and.returnValue(of([
      derivedStatDefinitionRow({
        id: 'critical-damage',
        key: 'critical_damage',
        label: 'Critical damage',
        description: 'Critical damage percent.',
        sort_order: 70,
      }),
    ]));

    const stats = await firstValueFrom(service.getDerivedStats());

    expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
      table: TABLES.derived_stat_definitions,
      filters: { isActive: { operator: FilterOperator.EQ, value: true } },
      orderBy: { column: 'sort_order', ascending: true },
      camelCase: false,
    }));
    expect(stats).toEqual([{
      id: 'critical-damage',
      key: 'critical_damage',
      label: 'Critical damage',
      description: 'Critical damage percent.',
      order: 70,
    }]);
  });
});

function derivedStatDefinitionRow(
  overrides: Partial<Row<'derived_stat_definitions'>> = {},
): Row<'derived_stat_definitions'> {
  return {
    id: 'definition-1',
    key: 'defense',
    label: 'Defense',
    description: 'Defense from endurance.',
    admin_description: null,
    base_source: 'base_stat',
    base_stat_key: 'endurance',
    bonus_target_key: 'defense',
    secondary_bonus_target_key: null,
    calculation_kind: 'additive',
    formula_target_key: null,
    helper_text: null,
    is_active: true,
    is_combat_stat: true,
    max_related_stat_key: null,
    min_related_stat_key: null,
    min_value: 0,
    sort_order: 10,
    updated_at: '2026-05-03T00:00:00.000Z',
    value_kind: 'number',
    created_at: '2026-05-03T00:00:00.000Z',
    ...overrides,
  };
}
