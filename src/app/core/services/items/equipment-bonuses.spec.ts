import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Backend } from '../backend/backend';
import { EquipmentBonusesService } from './equipment-bonuses';

describe('EquipmentBonusesService', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: EquipmentBonusesService;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll', 'rpc']);

    TestBed.configureTestingModule({
      providers: [
        EquipmentBonusesService,
        { provide: Backend, useValue: backend },
      ],
    });

    service = TestBed.inject(EquipmentBonusesService);
  });

  it('loads DB-owned runtime equipment bonus totals for the hero', async () => {
    backend.rpc.and.returnValue(
      of([
        runtimeBonusTotal({ target_key: 'min_damage', total_value: 2 }),
        runtimeBonusTotal({ target_key: 'max_damage', total_value: 9 }),
        runtimeBonusTotal({ target_key: 'critical_chance', total_value: 2 }),
      ]),
    );

    const bonuses = await firstValueFrom(service.getEquipmentBonusesForHero('hero-1'));

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.get_hero_equipment_runtime_bonus_totals,
      { p_hero_id: 'hero-1' },
    );
    expect(backend.getAll).not.toHaveBeenCalled();
    expect(bonuses).toEqual([
      jasmine.objectContaining({
        target: 'min_damage',
        value: 2,
        type: 'flat',
        scope: 'combat',
      }),
      jasmine.objectContaining({
        target: 'max_damage',
        value: 9,
        type: 'flat',
        scope: 'combat',
      }),
      jasmine.objectContaining({
        target: 'critical_chance',
        value: 2,
        type: 'flat',
        scope: 'combat',
      }),
    ]);
  });

  it('rejects stale runtime bonus rows for a different hero', async () => {
    backend.rpc.and.returnValue(
      of([
        runtimeBonusTotal({
          hero_id: 'hero-other',
          target_key: 'min_damage',
          total_value: 2,
        }),
      ]),
    );

    await expectAsync(
      firstValueFrom(service.getEquipmentBonusesForHero('hero-1')),
    ).toBeRejectedWithError(
      'Equipment bonus totals returned a row for a different hero.',
    );
  });
});

function runtimeBonusTotal(
  overrides: {
    hero_id?: string;
    scope_key?: string;
    target_key: string;
    total_value: number;
    type_key?: string;
  },
) {
  return {
    bonus_row_count: 1,
    hero_id: overrides.hero_id ?? 'hero-1',
    scope_key: overrides.scope_key ?? 'combat',
    target_key: overrides.target_key,
    total_value: overrides.total_value,
    type_key: overrides.type_key ?? 'flat',
  };
}
