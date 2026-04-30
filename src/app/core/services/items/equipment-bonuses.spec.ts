import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { ItemGenerationCatalog } from '../../domain/item/item-generation.model';
import { Backend } from '../backend/backend';
import { ItemCatalogService } from './item-catalog';
import { EquipmentBonusesService } from './equipment-bonuses';
import { EquippedItemRow } from '../../types/equipment-row.types';

describe('EquipmentBonusesService', () => {
  let backend: jasmine.SpyObj<Backend>;
  let itemCatalog: jasmine.SpyObj<ItemCatalogService>;
  let service: EquipmentBonusesService;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll']);
    itemCatalog = jasmine.createSpyObj<ItemCatalogService>('ItemCatalogService', [
      'getCatalog',
    ]);

    TestBed.configureTestingModule({
      providers: [
        EquipmentBonusesService,
        { provide: Backend, useValue: backend },
        { provide: ItemCatalogService, useValue: itemCatalog },
      ],
    });

    service = TestBed.inject(EquipmentBonusesService);
  });

  it('uses only active equipped items for player equipment bonuses', async () => {
    backend.getAll.and.returnValue(
      of([
        equippedItemRow({
          itemId: 'active-item',
          baseId: 'active-base',
          status: 'active',
        }),
        equippedItemRow({
          itemId: 'scrapped-item',
          baseId: 'scrapped-base',
          status: 'scrapped',
        }),
        equippedItemRow({
          itemId: 'trade-locked-item',
          baseId: 'trade-locked-base',
          status: 'locked_trade',
        }),
      ]),
    );
    itemCatalog.getCatalog.and.returnValue(of(catalog()));

    const bonuses = await firstValueFrom(service.getEquipmentBonusesForHero('hero-1'));

    expect(backend.getAll).toHaveBeenCalledWith(
      jasmine.objectContaining({
        table: TABLES.hero_equipment,
        filters: jasmine.objectContaining({
          heroId: jasmine.objectContaining({ value: 'hero-1' }),
        }),
      }),
    );
    expect(bonuses.map((bonus) => bonus.value)).toEqual([5]);
  });

  it('fails when an equipped item join is missing instead of treating it as inactive', async () => {
    backend.getAll.and.returnValue(
      of([
        {
          hero_id: 'hero-1',
          item_id: 'missing-item',
          slot_key: 'weapon',
          equipped_at: '2026-04-30T10:00:00.000Z',
          items: null,
        },
      ]),
    );
    itemCatalog.getCatalog.and.returnValue(of(catalog()));

    await expectAsync(
      firstValueFrom(service.getEquipmentBonusesForHero('hero-1')),
    ).toBeRejectedWithError('Equipped item "missing-item" could not be loaded.');
  });
});

function equippedItemRow(params: {
  itemId: string;
  baseId: string;
  status: NonNullable<EquippedItemRow['items']>['status'];
}): EquippedItemRow {
  return {
    hero_id: 'hero-1',
    item_id: params.itemId,
    slot_key: params.itemId,
    equipped_at: '2026-04-30T10:00:00.000Z',
    items: {
      id: params.itemId,
      generation_base_id: params.baseId,
      generation_quality_key: 'normal',
      prefix_affix_id: null,
      suffix_affix_id: null,
      status: params.status,
      scrapped_at:
        params.status === 'scrapped' ? '2026-04-30T11:00:00.000Z' : null,
      recoverable_until:
        params.status === 'scrapped' ? '2026-05-07T11:00:00.000Z' : null,
      updated_at: '2026-04-30T11:00:00.000Z',
    },
  };
}

function catalog(): ItemGenerationCatalog {
  return {
    budgetBuckets: [100],
    qualities: [
      {
        key: 'normal',
        label: 'Normal',
        multiplier: 1,
        weight: 1,
      },
    ],
    baseTypes: [],
    baseTypeTargets: [],
    bases: [
      {
        id: 'active-base',
        key: 'active-base',
        name: 'Active blade',
        baseTypeKey: 'weapon',
        baseTypeLabel: 'Weapon',
        equipmentSlotGroup: 'weapon',
        handUsage: 'one_handed',
        baseValue: 10,
        description: 'Active item.',
        bonuses: [
          {
            target: 'damage',
            type: 'flat',
            scope: 'combat',
            value: 5,
            levelsStep: null,
            sourceStat: null,
            scalingFactor: null,
          },
        ],
      },
      {
        id: 'scrapped-base',
        key: 'scrapped-base',
        name: 'Scrapped blade',
        baseTypeKey: 'weapon',
        baseTypeLabel: 'Weapon',
        equipmentSlotGroup: 'weapon',
        handUsage: 'one_handed',
        baseValue: 10,
        description: 'Scrapped item.',
        bonuses: [
          {
            target: 'damage',
            type: 'flat',
            scope: 'combat',
            value: 99,
            levelsStep: null,
            sourceStat: null,
            scalingFactor: null,
          },
        ],
      },
      {
        id: 'trade-locked-base',
        key: 'trade-locked-base',
        name: 'Trade locked blade',
        baseTypeKey: 'weapon',
        baseTypeLabel: 'Weapon',
        equipmentSlotGroup: 'weapon',
        handUsage: 'one_handed',
        baseValue: 10,
        description: 'Locked item.',
        bonuses: [
          {
            target: 'damage',
            type: 'flat',
            scope: 'combat',
            value: 42,
            levelsStep: null,
            sourceStat: null,
            scalingFactor: null,
          },
        ],
      },
    ],
    prefixes: [],
    suffixes: [],
  };
}
