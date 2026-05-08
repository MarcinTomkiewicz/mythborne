import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import { FilterOperator } from '../../enums/filter-operators';
import {
  BulkEquipHeroItemsRpcRow,
  EquipHeroItemRpcRow,
  GetHeroEquipmentRuntimeSlotsRpcRow,
  UnequipHeroItemRpcRow,
} from '../../types/item-equipment-rpc.types';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import { PlayerEquipment } from './player-equipment';

describe('PlayerEquipment', () => {
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let backend: jasmine.SpyObj<Backend>;
  let service: PlayerEquipment;

  beforeEach(() => {
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', [
      'requireActiveHero',
    ]);
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'rpc',
      'getAll',
      'create',
      'update',
      'delete',
      'upsert',
    ]);

    activeHero.requireActiveHero.and.returnValue(of({
      heroRow: { id: 'active-hero-1' } as never,
      heroId: 'active-hero-1',
      hero: {} as never,
      userId: 'user-1',
      serverId: 'server-1',
      server: {} as never,
    }));

    TestBed.configureTestingModule({
      providers: [
        PlayerEquipment,
        { provide: ActiveHero, useValue: activeHero },
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(PlayerEquipment);
  });

  it('loads current equipment through canonical RPC using active hero context', async () => {
    backend.rpc.and.returnValue(of([
      equipmentSlotRow({ slot_key: 'ring_2', slot_sort_order: 90 }),
      equipmentSlotRow({ item_id: 'item-main', slot_key: 'main_hand', slot_sort_order: 10 }),
      equipmentSlotRow({
        has_item: false,
        item_id: '',
        item_name: '',
        item_status_key: 'none',
        slot_item_state: 'empty',
        slot_key: 'helmet',
        slot_sort_order: 30,
      }),
    ]));

    const result = await firstValueFrom(service.getCurrentEquipment());

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.get_hero_equipment_runtime_slots,
      { p_hero_id: 'active-hero-1' },
    );
    expect(result.heroId).toBe('active-hero-1');
    expect(result.slots.map((slot) => slot.slotKey)).toEqual([
      'main_hand',
      'ring_2',
    ]);
    expect(result.slots.map((slot) => slot.lifecycleStatus)).toEqual([
      'active',
      'active',
    ]);
    expect(JSON.stringify(backend.rpc.calls.mostRecent().args[1]))
      .not.toContain('user-1');
  });

  it('loads active equipment slot definitions from DB dictionary rows', async () => {
    backend.getAll.and.returnValue(of([
      slotDefinitionRow({
        key: 'custom_trophy',
        label: 'Trophy hook',
        sort_order: 5,
      }),
      slotDefinitionRow({
        key: 'main_hand',
        label: 'Weapon hand',
        sort_order: 10,
      }),
    ]));

    const slots = await firstValueFrom(service.getEquipmentSlots());

    expect(backend.getAll).toHaveBeenCalledOnceWith({
      table: TABLES.equipment_slot_definitions,
      filters: {
        is_active: { operator: FilterOperator.EQ, value: true },
      },
      orderBy: [
        { column: 'sort_order' },
        { column: 'key' },
      ],
      camelCase: false,
    });
    expect(slots.map((slot) => `${slot.sortOrder}:${slot.slotKey}:${slot.label}`))
      .toEqual([
        '5:custom_trophy:Trophy hook',
        '10:main_hand:Weapon hand',
      ]);
    expect(slots[0].equipmentArea).toBe('ornament');
  });

  it('equips an item through canonical RPC without explicit slot by default', async () => {
    backend.rpc.and.returnValue(of([
      equipRow({
        journal_json: [
          {
            action: 'equipped',
            itemId: 'item-1',
            targetSlotKey: 'main_hand',
            reasonKey: 'equipped',
            message: 'Equipped.',
            details: { ownershipTransferred: false },
          },
        ],
      }),
    ]));

    const result = await firstValueFrom(service.equipItem({
      itemId: ' item-1 ',
      requestId: ' request-1 ',
    }));

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.equip_hero_item,
      {
        p_hero_id: 'active-hero-1',
        p_item_id: 'item-1',
        p_request_id: 'request-1',
      },
    );
    expect(backend.rpc.calls.mostRecent().args[1])
      .not.toEqual(jasmine.objectContaining({ p_target_slot_key: jasmine.anything() }));
    expect(JSON.stringify(backend.rpc.calls.mostRecent().args[1]))
      .not.toContain('reason');
    expect(result.equipped[0]).toEqual(jasmine.objectContaining({
      itemId: 'item-1',
      slotKey: 'main_hand',
      reason: 'equipped',
      detailsJson: { ownershipTransferred: false },
    }));
  });

  it('passes explicit target slot only when a caller provides one', async () => {
    backend.rpc.and.returnValue(of([equipRow()]));

    await firstValueFrom(service.equipItem({
      itemId: 'item-1',
      targetSlotKey: ' off_hand ',
    }));

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.equip_hero_item,
      jasmine.objectContaining({
        p_hero_id: 'active-hero-1',
        p_item_id: 'item-1',
        p_target_slot_key: 'off_hand',
      }),
    );
  });

  it('unequips a slot through canonical RPC without item-table writes', async () => {
    backend.rpc.and.returnValue(of([
      unequipRow({
        journal_json: [
          {
            actionKey: 'unequipped',
            item_id: 'item-1',
            slot_key: 'ring_1',
            reason: 'slot_cleared',
          },
        ],
      }),
    ]));

    const result = await firstValueFrom(service.unequipSlot({
      slotKey: ' ring_1 ',
      requestId: null,
    }));

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.unequip_hero_item,
      {
        p_hero_id: 'active-hero-1',
        p_request_id: undefined,
        p_slot_key: 'ring_1',
      },
    );
    expect(result.unequipped[0]).toEqual(jasmine.objectContaining({
      itemId: 'item-1',
      slotKey: 'ring_1',
      reason: 'slot_cleared',
    }));
    expect(backend.getAll).not.toHaveBeenCalled();
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
    expect(backend.upsert).not.toHaveBeenCalled();
  });

  it('bulk equips ordered item/slot pairs through canonical RPC', async () => {
    backend.rpc.and.returnValue(of([
      bulkEquipRow({
        result_journal_json: [
          {
            action: 'equipped',
            itemId: 'item-1',
            targetSlotKey: 'main_hand',
          },
          {
            action: 'failed',
            itemId: 'item-2',
            targetSlotKey: 'off_hand',
            reasonKey: 'requirements_not_met',
          },
        ],
      }),
    ]));

    const result = await firstValueFrom(service.bulkEquipItems({
      requestId: ' bulk-request-1 ',
      items: [
        { itemId: ' item-1 ', targetSlotKey: ' main_hand ' },
        { itemId: ' item-2 ', targetSlotKey: ' off_hand ' },
      ],
    }));

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.bulk_equip_hero_items,
      {
        p_hero_id: 'active-hero-1',
        p_items_json: [
          { itemId: 'item-1', targetSlotKey: 'main_hand' },
          { itemId: 'item-2', targetSlotKey: 'off_hand' },
        ],
        p_request_id: 'bulk-request-1',
      },
    );
    expect(result.equipped.length).toBe(1);
    expect(result.failed[0]).toEqual(jasmine.objectContaining({
      itemId: 'item-2',
      reason: 'requirements_not_met',
      success: false,
    }));
  });

  it('rejects blank required input before calling RPC', () => {
    expect(() => service.equipItem({
      itemId: ' ',
    })).toThrowError('itemId is required for equipment RPC.');
    expect(() => service.unequipSlot({ slotKey: ' ' }))
      .toThrowError('slotKey is required for equipment RPC.');
    expect(() => service.bulkEquipItems({
      items: [{ itemId: 'item-1', targetSlotKey: ' ' }],
    })).toThrowError('items[0].targetSlotKey is required for equipment RPC.');
    expect(backend.rpc).not.toHaveBeenCalled();
  });

  it('surfaces empty operation RPC responses clearly', async () => {
    backend.rpc.and.returnValue(of([]));

    await expectAsync(firstValueFrom(service.equipItem({
      itemId: 'item-1',
      targetSlotKey: 'main_hand',
    }))).toBeRejectedWithError(
      'equip_hero_item returned no equipment operation row.',
    );
  });
});

function equipmentSlotRow(
  overrides: Partial<GetHeroEquipmentRuntimeSlotsRpcRow> = {},
): GetHeroEquipmentRuntimeSlotsRpcRow {
  return {
    base_key: 'bronze_blade',
    base_name: 'Bronze blade',
    base_type_key: 'weapon',
    equipment_area: 'weapon',
    equipment_slot_group: 'hand',
    equipped_at: '2026-05-07T10:00:00.000Z',
    generation_base_id: 'base-1',
    generation_quality_key: 'normal',
    hand_usage: 'one_handed',
    has_item: true,
    hero_id: 'active-hero-1',
    is_runtime_usable: true,
    item_id: 'item-1',
    item_name: 'Bronze Blade',
    item_status_key: 'active',
    prefix_affix_id: '',
    prefix_key: '',
    prefix_name: '',
    quality_label: 'Normal',
    quality_multiplier: 1,
    slot_item_state: 'equipped',
    slot_key: 'main_hand',
    slot_label: 'Main hand',
    slot_sort_order: 10,
    suffix_affix_id: '',
    suffix_key: '',
    suffix_name: '',
    ...overrides,
  };
}

function slotDefinitionRow(overrides: Partial<ReturnType<typeof slotDefinitionBase>> = {}) {
  return {
    ...slotDefinitionBase(),
    ...overrides,
  };
}

function slotDefinitionBase() {
  return {
    admin_description: null,
    created_at: '2026-05-07T10:00:00.000Z',
    description: 'Equipment slot.',
    equipment_area: 'ornament',
    helper_text: null,
    is_active: true,
    key: 'main_hand',
    label: 'Main hand',
    sort_order: 10,
    updated_at: '2026-05-07T10:00:00.000Z',
  };
}

function equipRow(overrides: Partial<EquipHeroItemRpcRow> = {}): EquipHeroItemRpcRow {
  return {
    action_key: 'equipped',
    final_equipment_json: [],
    hero_id: 'active-hero-1',
    item_id: 'item-1',
    journal_json: [],
    message: 'Equipped.',
    request_id: 'request-1',
    slot_key: 'main_hand',
    success: true,
    ...overrides,
  };
}

function unequipRow(
  overrides: Partial<UnequipHeroItemRpcRow> = {},
): UnequipHeroItemRpcRow {
  return {
    action_key: 'unequipped',
    final_equipment_json: [],
    hero_id: 'active-hero-1',
    item_id: 'item-1',
    journal_json: [],
    message: 'Unequipped.',
    request_id: 'request-1',
    slot_key: 'ring_1',
    success: true,
    ...overrides,
  };
}

function bulkEquipRow(
  overrides: Partial<BulkEquipHeroItemsRpcRow> = {},
): BulkEquipHeroItemsRpcRow {
  return {
    equipped_count: 1,
    failed_count: 1,
    final_equipment_json: [],
    hero_id: 'active-hero-1',
    request_id: 'bulk-request-1',
    result_journal_json: [],
    skipped_count: 0,
    success: false,
    ...overrides,
  };
}
