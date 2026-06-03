import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import { FilterOperator } from '../../enums/filter-operators';
import {
  BulkEquipHeroItemsRpcRow,
  BulkUnequipHeroItemsRpcRow,
  ApplyHeroLoadoutPresetRpcRow,
  ClearHeroLoadoutPresetRpcRow,
  EquipHeroItemRpcRow,
  GetHeroEquipmentRuntimeSlotsRpcRow,
  GetHeroLoadoutPresetsRpcRow,
  PreviewHeroLoadoutPresetRpcRow,
  RenameHeroLoadoutPresetRpcRow,
  SaveCurrentHeroLoadoutPresetRpcRow,
  UnequipHeroItemRpcRow,
} from '../../types/item-equipment-rpc.types';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import { HeroEquipment } from './hero-equipment';

describe('HeroEquipment', () => {
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let backend: jasmine.SpyObj<Backend>;
  let service: HeroEquipment;

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
        HeroEquipment,
        { provide: ActiveHero, useValue: activeHero },
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(HeroEquipment);
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

  it('bulk equips ordered item list through canonical RPC without explicit slots by default', async () => {
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
            reasonKey: 'requirements_not_met',
          },
        ],
      }),
    ]));

    const result = await firstValueFrom(service.bulkEquipItems({
      requestId: ' bulk-request-1 ',
      items: [
        { itemId: ' item-1 ' },
        { itemId: ' item-2 ' },
      ],
    }));

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.bulk_equip_hero_items,
      {
        p_hero_id: 'active-hero-1',
        p_items_json: [
          { itemId: 'item-1' },
          { itemId: 'item-2' },
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

  it('keeps explicit bulk target slots only when a caller provides them', async () => {
    backend.rpc.and.returnValue(of([bulkEquipRow()]));

    await firstValueFrom(service.bulkEquipItems({
      items: [
        { itemId: ' item-1 ', targetSlotKey: ' main_hand ' },
        { itemId: ' item-2 ', targetSlotKey: null },
      ],
    }));

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.bulk_equip_hero_items,
      jasmine.objectContaining({
        p_items_json: [
          { itemId: 'item-1', targetSlotKey: 'main_hand' },
          { itemId: 'item-2' },
        ],
      }),
    );
  });

  it('bulk unequips selected items through canonical RPC without single-slot loops', async () => {
    backend.rpc.and.returnValue(of([
      bulkUnequipRow({
        result_journal_json: [
          {
            action: 'unequipped',
            itemId: 'item-main',
            slotKey: 'main_hand',
          },
          {
            action: 'skipped',
            itemId: 'item-ring',
            slotKey: 'ring_1',
            reasonKey: 'already_empty',
          },
        ],
      }),
    ]));

    const result = await firstValueFrom(service.bulkUnequipItems({
      requestId: ' unequip-request-1 ',
      items: [
        { slotKey: ' main_hand ', itemId: ' item-main ' },
        { itemId: ' item-ring ' },
      ],
    }));

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.bulk_unequip_hero_items,
      {
        p_hero_id: 'active-hero-1',
        p_items_json: [
          { itemId: 'item-main', slotKey: 'main_hand' },
          { itemId: 'item-ring' },
        ],
        p_request_id: 'unequip-request-1',
      },
    );
    expect(backend.rpc).not.toHaveBeenCalledWith(
      RPC.unequip_hero_item,
      jasmine.anything(),
    );
    expect(result.unequipped[0].itemId).toBe('item-main');
    expect(result.skipped[0].reason).toBe('already_empty');
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
    expect(backend.upsert).not.toHaveBeenCalled();
  });

  it('reads loadout presets through canonical RPC and preserves preset numbers', async () => {
    backend.rpc.and.returnValue(of([
      loadoutPresetRow({ preset_number: 2, preset_id: 'preset-2', name: 'Trial gear' }),
      loadoutPresetRow({ preset_number: 1, preset_id: 'preset-1', name: 'Default' }),
    ]));

    const result = await firstValueFrom(service.getLoadoutPresets());

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.get_hero_loadout_presets,
      { p_hero_id: 'active-hero-1' },
    );
    expect(result.map((preset) => `${preset.presetNumber}:${preset.presetId}`))
      .toEqual(['1:preset-1', '2:preset-2']);
    expect(JSON.stringify(backend.rpc.calls.mostRecent().args[1]))
      .not.toContain('user-1');
  });

  it('rejects loadout preset rows returned for a different hero', async () => {
    backend.rpc.and.returnValue(of([
      loadoutPresetRow({ hero_id: 'other-hero' }),
    ]));

    await expectAsync(firstValueFrom(service.getLoadoutPresets()))
      .toBeRejectedWithError(
        'get_hero_loadout_presets returned a row for a different hero.',
      );
  });

  it('saves current equipment into a preset with exact preset number and optional name', async () => {
    backend.rpc.and.returnValue(of([
      saveLoadoutPresetRow({
        preset_id: 'preset-2',
        preset_number: 2,
        name: 'Dungeon',
        saved_slot_count: 3,
        slots_json: [
          { slotKey: 'main_hand', itemId: 'item-dagger' },
        ],
      }),
    ]));

    const result = await firstValueFrom(service.saveCurrentLoadoutPreset({
      presetNumber: 2,
      name: ' Dungeon ',
      requestId: ' request-2 ',
    }));

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.save_current_hero_loadout_preset,
      {
        p_hero_id: 'active-hero-1',
        p_preset_number: 2,
        p_name: 'Dungeon',
        p_request_id: 'request-2',
      },
    );
    expect(result).toEqual(jasmine.objectContaining({
      heroId: 'active-hero-1',
      presetId: 'preset-2',
      presetNumber: 2,
      savedSlotCount: 3,
    }));
  });

  it('rejects save preset result rows returned for a different preset number', async () => {
    backend.rpc.and.returnValue(of([
      saveLoadoutPresetRow({
        preset_number: 3,
      }),
    ]));

    await expectAsync(firstValueFrom(service.saveCurrentLoadoutPreset({
      presetNumber: 2,
      name: 'Dungeon',
    }))).toBeRejectedWithError(
      'save_current_hero_loadout_preset returned a row for a different preset.',
    );
  });

  it('renames a preset through canonical RPC without saving current loadout', async () => {
    backend.rpc.and.returnValue(of([
      renameLoadoutPresetRow({
        preset_id: 'preset-2',
        preset_number: 2,
        name: 'Boss fights',
        updated_at: '2026-05-08T08:00:00.000Z',
      }),
    ]));

    const result = await firstValueFrom(service.renameLoadoutPreset({
      presetNumber: 2,
      name: ' Boss fights ',
      requestId: ' rename-request-1 ',
    }));

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.rename_hero_loadout_preset,
      {
        p_hero_id: 'active-hero-1',
        p_preset_number: 2,
        p_name: 'Boss fights',
        p_request_id: 'rename-request-1',
      },
    );
    expect(backend.rpc.calls.mostRecent().args[0])
      .not.toBe(RPC.save_current_hero_loadout_preset);
    expect(result).toEqual(jasmine.objectContaining({
      heroId: 'active-hero-1',
      presetId: 'preset-2',
      presetNumber: 2,
      name: 'Boss fights',
    }));
  });

  it('rejects blank preset rename with controlled domain feedback before RPC', () => {
    expect(() => service.renameLoadoutPreset({
      presetNumber: 2,
      name: ' ',
    })).toThrowError('rename_hero_loadout_preset_name_invalid');
    expect(backend.rpc).not.toHaveBeenCalled();
  });

  it('rejects rename result rows returned for a different hero', async () => {
    backend.rpc.and.returnValue(of([
      renameLoadoutPresetRow({ hero_id: 'other-hero' }),
    ]));

    await expectAsync(firstValueFrom(service.renameLoadoutPreset({
      presetNumber: 2,
      name: 'Boss fights',
    }))).toBeRejectedWithError(
      'rename_hero_loadout_preset returned a row for a different hero.',
    );
  });

  it('rejects rename result rows returned for a different preset number', async () => {
    backend.rpc.and.returnValue(of([
      renameLoadoutPresetRow({ preset_number: 3 }),
    ]));

    await expectAsync(firstValueFrom(service.renameLoadoutPreset({
      presetNumber: 2,
      name: 'Boss fights',
    }))).toBeRejectedWithError(
      'rename_hero_loadout_preset returned a row for a different preset.',
    );
  });

  it('surfaces empty rename preset responses clearly', async () => {
    backend.rpc.and.returnValue(of([]));

    await expectAsync(firstValueFrom(service.renameLoadoutPreset({
      presetNumber: 2,
      name: 'Boss fights',
    }))).toBeRejectedWithError(
      'rename_hero_loadout_preset returned no row.',
    );
  });

  it('clears a preset through canonical RPC without deleting preset rows', async () => {
    backend.rpc.and.returnValue(of([
      clearLoadoutPresetRow({
        preset_id: 'preset-3',
        preset_number: 3,
        cleared_slot_count: 4,
      }),
    ]));

    const result = await firstValueFrom(service.clearLoadoutPreset({
      presetNumber: 3,
      requestId: null,
    }));

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.clear_hero_loadout_preset,
      {
        p_hero_id: 'active-hero-1',
        p_preset_number: 3,
        p_request_id: undefined,
      },
    );
    expect(result).toEqual(jasmine.objectContaining({
      presetId: 'preset-3',
      presetNumber: 3,
      clearedSlotCount: 4,
    }));
    expect(backend.delete).not.toHaveBeenCalled();
  });

  it('rejects clear preset result rows returned for a different preset number', async () => {
    backend.rpc.and.returnValue(of([
      clearLoadoutPresetRow({
        preset_number: 4,
      }),
    ]));

    await expectAsync(firstValueFrom(service.clearLoadoutPreset({
      presetNumber: 3,
    }))).toBeRejectedWithError(
      'clear_hero_loadout_preset returned a row for a different preset.',
    );
  });

  it('previews a preset using DB-owned exact item rows and literal slots', async () => {
    backend.rpc.and.callFake(<T>(rpcName: string) => {
      if (rpcName === RPC.get_hero_loadout_presets) {
        return of([
          loadoutPresetRow({ preset_number: 2, preset_id: 'preset-2' }),
        ] as T);
      }

      return of([
        loadoutPresetSlotPreviewRow({
          slot_key: 'ring_2',
          slot_label: 'Ring 2',
          slot_sort_order: 90,
          saved_item_id: 'exact-ring-id',
          preview_status: 'available',
        }),
        loadoutPresetSlotPreviewRow({
          slot_key: 'main_hand',
          slot_label: 'Main hand',
          slot_sort_order: 10,
          saved_item_id: 'exact-dagger-id',
          preview_status: 'missing',
          status_message: 'Item is missing.',
        }),
      ] as T);
    });

    const result = await firstValueFrom(service.previewLoadoutPreset({
      presetNumber: 2,
    }));

    expect(backend.rpc.calls.allArgs()).toEqual([
      [
        RPC.get_hero_loadout_presets,
        { p_hero_id: 'active-hero-1' },
      ],
      [
        RPC.preview_hero_loadout_preset,
        { p_hero_id: 'active-hero-1', p_preset_number: 2 },
      ],
    ]);
    expect(result.preset.presetId).toBe('preset-2');
    expect(result.slotItems.map((slot) => `${slot.slotKey}:${slot.savedItemId}`))
      .toEqual([
        'main_hand:exact-dagger-id',
        'ring_2:exact-ring-id',
      ]);
    expect(result.slotItems[0]).toEqual(jasmine.objectContaining({
      previewStatus: 'missing',
      statusMessage: 'Item is missing.',
    }));
  });

  it('rejects preset preview rows returned for a different hero', async () => {
    backend.rpc.and.callFake(<T>(rpcName: string) => {
      if (rpcName === RPC.get_hero_loadout_presets) {
        return of([
          loadoutPresetRow({ preset_number: 2, preset_id: 'preset-2' }),
        ] as T);
      }

      return of([
        loadoutPresetSlotPreviewRow({ hero_id: 'other-hero' }),
      ] as T);
    });

    await expectAsync(firstValueFrom(service.previewLoadoutPreset({
      presetNumber: 2,
    }))).toBeRejectedWithError(
      'preview_hero_loadout_preset returned a row for a different hero.',
    );
  });

  it('surfaces missing exact preset preview header clearly', async () => {
    backend.rpc.and.callFake(<T>(rpcName: string) => {
      if (rpcName === RPC.get_hero_loadout_presets) {
        return of([
          loadoutPresetRow({ preset_number: 3, preset_id: 'preset-3' }),
        ] as T);
      }

      return of([
        loadoutPresetSlotPreviewRow(),
      ] as T);
    });

    await expectAsync(firstValueFrom(service.previewLoadoutPreset({
      presetNumber: 2,
    }))).toBeRejectedWithError(
      'preview_hero_loadout_preset returned no preset header.',
    );
  });

  it('rejects preset preview rows returned for a different preset number', async () => {
    backend.rpc.and.callFake(<T>(rpcName: string) => {
      if (rpcName === RPC.get_hero_loadout_presets) {
        return of([
          loadoutPresetRow({ preset_number: 2, preset_id: 'preset-2' }),
        ] as T);
      }

      return of([
        loadoutPresetSlotPreviewRow({ preset_number: 3 }),
      ] as T);
    });

    await expectAsync(firstValueFrom(service.previewLoadoutPreset({
      presetNumber: 2,
    }))).toBeRejectedWithError(
      'preview_hero_loadout_preset returned a row for a different preset.',
    );
  });

  it('applies a preset through canonical RPC and maps the DB journal', async () => {
    backend.rpc.and.returnValue(of([
      applyLoadoutPresetRow({
        preset_number: 2,
        result_journal_json: [
          {
            action: 'equipped',
            itemId: 'exact-dagger-id',
            slotKey: 'main_hand',
            reasonKey: 'preset_apply_exact_item',
          },
          {
            action: 'skipped',
            itemId: 'missing-ring-id',
            slotKey: 'ring_2',
            reasonKey: 'preset_item_missing',
          },
        ],
      }),
    ]));

    const result = await firstValueFrom(service.applyLoadoutPreset({
      presetNumber: 2,
      requestId: 'apply-request-1',
    }));

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.apply_hero_loadout_preset,
      {
        p_hero_id: 'active-hero-1',
        p_preset_number: 2,
        p_request_id: 'apply-request-1',
      },
    );
    expect(result.equipped[0]).toEqual(jasmine.objectContaining({
      itemId: 'exact-dagger-id',
      slotKey: 'main_hand',
      reason: 'preset_apply_exact_item',
    }));
    expect(result.skipped[0]).toEqual(jasmine.objectContaining({
      itemId: 'missing-ring-id',
      reason: 'preset_item_missing',
    }));
  });

  it('rejects apply preset result rows returned for a different preset number', async () => {
    backend.rpc.and.returnValue(of([
      applyLoadoutPresetRow({
        preset_number: 3,
      }),
    ]));

    await expectAsync(firstValueFrom(service.applyLoadoutPreset({
      presetNumber: 2,
    }))).toBeRejectedWithError(
      'apply_hero_loadout_preset returned a row for a different preset.',
    );
  });

  it('rejects blank required input before calling RPC', () => {
    expect(() => service.equipItem({
      itemId: ' ',
    })).toThrowError('itemId is required for equipment RPC.');
    expect(() => service.unequipSlot({ slotKey: ' ' }))
      .toThrowError('slotKey is required for equipment RPC.');
    expect(() => service.bulkEquipItems({
      items: [{ itemId: ' ' }],
    })).toThrowError('items[0].itemId is required for equipment RPC.');
    expect(() => service.applyLoadoutPreset({ presetNumber: 0 }))
      .toThrowError('presetNumber must be a positive integer for equipment RPC.');
    expect(backend.rpc).not.toHaveBeenCalled();
  });

  it('surfaces empty operation RPC responses clearly', async () => {
    backend.rpc.and.returnValue(of([]));

    await expectAsync(firstValueFrom(service.equipItem({
      itemId: 'item-1',
      targetSlotKey: 'main_hand',
    }))).toBeRejectedWithError(
      'equip_hero_item returned no row.',
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

function bulkUnequipRow(
  overrides: Partial<BulkUnequipHeroItemsRpcRow> = {},
): BulkUnequipHeroItemsRpcRow {
  return {
    armory_state_json: {},
    failed_count: 0,
    final_equipment_json: [],
    hero_id: 'active-hero-1',
    request_id: 'unequip-request-1',
    result_journal_json: [],
    server_id: 'server-1',
    skipped_count: 1,
    success: true,
    unequipped_count: 1,
    visible_items_json: [],
    ...overrides,
  };
}

function loadoutPresetRow(
  overrides: Partial<GetHeroLoadoutPresetsRpcRow> = {},
): GetHeroLoadoutPresetsRpcRow {
  return {
    cleared_at: '2026-05-07T11:00:00.000Z',
    created_at: '2026-05-07T10:00:00.000Z',
    hero_id: 'active-hero-1',
    name: 'Preset 1',
    preset_id: 'preset-1',
    preset_number: 1,
    saved_at: '2026-05-07T12:00:00.000Z',
    slot_count: 2,
    updated_at: '2026-05-07T12:00:00.000Z',
    ...overrides,
  };
}

function saveLoadoutPresetRow(
  overrides: Partial<SaveCurrentHeroLoadoutPresetRpcRow> = {},
): SaveCurrentHeroLoadoutPresetRpcRow {
  return {
    hero_id: 'active-hero-1',
    name: 'Preset 1',
    preset_id: 'preset-1',
    preset_number: 1,
    request_id: 'save-request-1',
    saved_slot_count: 2,
    slots_json: [],
    ...overrides,
  };
}

function renameLoadoutPresetRow(
  overrides: Partial<RenameHeroLoadoutPresetRpcRow> = {},
): RenameHeroLoadoutPresetRpcRow {
  return {
    hero_id: 'active-hero-1',
    name: 'Preset 1',
    preset_id: 'preset-1',
    preset_number: 1,
    request_id: 'rename-request-1',
    updated_at: '2026-05-08T08:00:00.000Z',
    ...overrides,
  };
}

function clearLoadoutPresetRow(
  overrides: Partial<ClearHeroLoadoutPresetRpcRow> = {},
): ClearHeroLoadoutPresetRpcRow {
  return {
    cleared_slot_count: 2,
    hero_id: 'active-hero-1',
    name: 'Preset 1',
    preset_id: 'preset-1',
    preset_number: 1,
    request_id: 'clear-request-1',
    ...overrides,
  };
}

function loadoutPresetSlotPreviewRow(
  overrides: Partial<PreviewHeroLoadoutPresetRpcRow> = {},
): PreviewHeroLoadoutPresetRpcRow {
  return {
    current_item_name: 'Current item',
    current_owner_hero_id: 'active-hero-1',
    hero_id: 'active-hero-1',
    is_owned_by_hero: true,
    is_runtime_usable: true,
    item_status: 'active',
    preset_id: 'preset-2',
    preset_number: 2,
    preview_status: 'available',
    saved_item_id: 'saved-item-1',
    saved_item_name_snapshot: 'Saved item',
    slot_key: 'main_hand',
    slot_label: 'Main hand',
    slot_sort_order: 10,
    status_message: '',
    ...overrides,
  };
}

function applyLoadoutPresetRow(
  overrides: Partial<ApplyHeroLoadoutPresetRpcRow> = {},
): ApplyHeroLoadoutPresetRpcRow {
  return {
    equipped_count: 1,
    failed_count: 0,
    final_equipment_json: [],
    hero_id: 'active-hero-1',
    preset_number: 1,
    request_id: 'apply-request-1',
    result_journal_json: [],
    skipped_count: 1,
    success: true,
    ...overrides,
  };
}
