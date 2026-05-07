import { Json } from '../types/database.types';
import {
  BulkEquipHeroItemsRpcRow,
  GetHeroArmoryItemsRpcRow,
  GetHeroArmoryVisibilityStateRpcRow,
  GetHeroEquipmentRuntimeSlotsRpcRow,
} from '../types/item-equipment-rpc.types';
import {
  mapCurrentEquipmentLoadout,
  mapEquipmentSlot,
  mapEquipmentOperationJournal,
  mapEquippedItemSummary,
  mapHeroArmoryReadModel,
} from './item-equipment-mappers';

describe('item-equipment-mappers', () => {
  it('maps DB equipment slot definitions into domain slots', () => {
    expect(mapEquipmentSlot({
      admin_description: null,
      created_at: '2026-05-07T10:00:00.000Z',
      description: 'Custom slot.',
      equipment_area: 'custom_area',
      helper_text: null,
      is_active: true,
      key: 'custom_trophy',
      label: 'Trophy hook',
      sort_order: 5,
      updated_at: '2026-05-07T10:00:00.000Z',
    })).toEqual({
      slotKey: 'custom_trophy',
      label: 'Trophy hook',
      sortOrder: 5,
      equipmentArea: 'custom_area',
      equipmentSlotGroup: 'custom_area',
    });
  });

  it('maps DB-owned armory visibility and item RPC rows into shelves with unsorted area', () => {
    const readModel = mapHeroArmoryReadModel(
      'hero-1',
      visibilityRow(),
      [
        armoryItemRow({
          item_id: 'item-locked',
          item_name: 'Locked ring',
          item_status: 'locked_trade',
          armory_shelf_position: 2,
          shelf_name: 'Materials',
        }),
        armoryItemRow({
          item_id: 'item-unsorted',
          item_name: 'Fresh drop blade',
          armory_shelf_position: 0,
          is_unsorted: true,
          shelf_name: 'Unsorted',
        }),
      ],
    );

    expect(readModel.heroId).toBe('hero-1');
    expect(readModel.shelves.length).toBe(11);
    expect(readModel.shelves[0]).toEqual(jasmine.objectContaining({
      shelfId: null,
      position: 0,
      name: 'Unsorted',
      isUnsortedDropArea: true,
      isPersisted: false,
    }));
    expect(readModel.shelves[1]).toEqual(jasmine.objectContaining({
      shelfId: 'shelf-1',
      position: 1,
      name: 'Shelf 1',
      isUnsortedDropArea: false,
      isPersisted: true,
    }));
    expect(readModel.shelves[2].visibleItems.map((item) => item.itemId))
      .toEqual(['item-locked']);
    expect(readModel.shelves[0].visibleItems[0].itemId).toBe('item-unsorted');
    expect(readModel.visibility.visibleItemCount).toBe(2);
    expect(readModel.visibility.totalOwnedItemCount).toBe(5);
    expect(readModel.visibility.hiddenItemCount).toBe(3);
    expect(readModel.visibility.visibilityLimit).toBe(2);
    expect(readModel.visibility.visibilityLimitSource).toBe('visible_item_capacity');
    expect(readModel.visibility.sourceConfigJson as unknown)
      .toEqual({ target: 'visible_item_capacity' });
    expect(readModel.visibility.visibleStatuses)
      .toEqual(['active', 'locked_trade', 'locked_auction']);
  });

  it('maps DB-like shelfPosition JSON without duplicating visible items across shelves', () => {
    const readModel = mapHeroArmoryReadModel(
      'hero-1',
      visibilityRow({
        unsorted_json: {
          shelfPosition: 0,
          name: 'Unsorted',
          isPersisted: false,
        },
        shelves_json: Array.from({ length: 10 }, (_, index) => ({
          id: `shelf-${index + 1}`,
          shelfPosition: index + 1,
          name: `Shelf ${index + 1}`,
          isPersisted: true,
        })),
      }),
      [
        armoryItemRow({
          item_id: 'item-unsorted',
          item_name: 'Fresh Drop Blade',
          armory_shelf_position: 0,
          is_unsorted: true,
          shelf_name: 'Unsorted',
        }),
        armoryItemRow({
          item_id: 'item-shelf-2',
          item_name: 'Shelf Two Spear',
          armory_shelf_position: 2,
          shelf_name: 'Shelf 2',
        }),
      ],
    );

    expect(readModel.shelves.map((shelf) => shelf.position))
      .toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(readModel.shelves[0].isUnsortedDropArea).toBeTrue();
    expect(readModel.shelves[0].visibleItems.map((item) => item.itemId))
      .toEqual(['item-unsorted']);
    expect(readModel.shelves[2].visibleItems.map((item) => item.itemId))
      .toEqual(['item-shelf-2']);
    expect(readModel.shelves.flatMap((shelf) =>
      shelf.visibleItems.filter((item) => item.itemId === 'item-unsorted'),
    ).length).toBe(1);
    expect(readModel.shelves.flatMap((shelf) =>
      shelf.visibleItems.filter((item) => item.itemId === 'item-shelf-2'),
    ).length).toBe(1);
  });

  it('maps equipment runtime hero_id as loadout hero and preserves literal slot/item ids', () => {
    const equipped = mapEquippedItemSummary(equipmentRow({
      hero_id: 'loadout-hero-1',
      item_id: 'borrowed-or-owned-item-1',
      slot_key: 'main_hand',
    }));

    expect(equipped.heroId).toBe('loadout-hero-1');
    expect(equipped.ownerHeroId).toBeNull();
    expect(equipped.itemId).toBe('borrowed-or-owned-item-1');
    expect(equipped.slotKey).toBe('main_hand');
  });

  it('sorts current equipment by DB slot sort order without changing slot keys', () => {
    const loadout = mapCurrentEquipmentLoadout('hero-1', [
      equipmentRow({ slot_key: 'ring_2', slot_sort_order: 30 }),
      equipmentRow({ slot_key: 'main_hand', slot_sort_order: 10 }),
    ]);

    expect(loadout.heroId).toBe('hero-1');
    expect(loadout.slots.map((slot) => slot.slotKey)).toEqual([
      'main_hand',
      'ring_2',
    ]);
  });

  it('maps empty current equipment with explicit hero context', () => {
    const loadout = mapCurrentEquipmentLoadout('hero-empty', []);

    expect(loadout.heroId).toBe('hero-empty');
    expect(loadout.slots).toEqual([]);
  });

  it('preserves nullable item layers in equipment display mapping', () => {
    const equipped = mapEquippedItemSummary(equipmentRow({
      prefix_affix_id: null,
      prefix_key: null,
      prefix_name: null,
      suffix_affix_id: null,
      suffix_key: null,
      suffix_name: null,
    }));

    expect(equipped.prefixAffixId).toBeNull();
    expect(equipped.prefixKey).toBeNull();
    expect(equipped.suffixAffixId).toBeNull();
    expect(equipped.suffixKey).toBeNull();
  });

  it('preserves operation journal reason/details and final equipment', () => {
    const journal = mapEquipmentOperationJournal(operationRow({
      result_journal_json: {
        equipped: [{
          action: 'equipped',
          item_id: 'item-1',
          slot_key: 'main_hand',
          reason: 'equipped_successfully',
          message: 'Equipped.',
          success: true,
          details_json: {
            handConflictResolved: true,
            guildArmoryContext: { ownershipTransferred: false },
          },
        }],
        failed: [{
          item_id: 'item-2',
          slot_key: 'off_hand',
          reason_key: 'runtime_use_denied',
          status_message: 'Cannot use item.',
          success: false,
          details: { source: 'guild_armory' },
        }],
        diagnostics: { requestScope: 'bulk' },
      },
      final_equipment_json: {
        slots: [{
          hero_id: 'hero-1',
          owner_hero_id: 'owner-hero-1',
          item_id: 'item-1',
          item_name: 'Bronze Blade',
          item_status: 'locked_trade',
          slot_key: 'main_hand',
          slot_label: 'Main hand',
          slot_sort_order: 10,
          equipment_area: 'weapon',
          equipment_slot_group: 'hand',
          equipped_at: '2026-05-07T10:00:00Z',
          is_runtime_usable: true,
        }],
      },
    }));

    expect(journal.equipped[0].reason).toBe('equipped_successfully');
    expect(journal.equipped[0].detailsJson as unknown).toEqual({
      handConflictResolved: true,
      guildArmoryContext: { ownershipTransferred: false },
    });
    expect(journal.failed[0].reason).toBe('runtime_use_denied');
    expect(journal.failed[0].detailsJson as unknown)
      .toEqual({ source: 'guild_armory' });
    expect(journal.diagnostics as unknown).toEqual({ requestScope: 'bulk' });
    expect(journal.finalEquipment?.slots[0].ownerHeroId).toBe('owner-hero-1');
    expect(journal.finalEquipment?.slots[0].itemId).toBe('item-1');
    expect(journal.finalEquipment?.slots[0].slotKey).toBe('main_hand');
  });

  it('maps DB-like apply preset array journal and buckets normalized actions', () => {
    const journal = mapEquipmentOperationJournal(operationRow({
      result_journal_json: [
        {
          actionKey: 'equipped',
          itemId: 'item-1',
          targetSlotKey: 'main_hand',
          reasonKey: 'preset_apply_exact_item',
          statusMessage: 'Preset item equipped.',
          success: true,
          details: { presetNumber: 2 },
        },
        {
          actionKey: 'skipped',
          itemId: 'item-2',
          targetSlotKey: 'ring_1',
          reasonKey: 'preset_item_missing',
          statusMessage: 'Saved item is missing.',
          success: true,
          details_json: { savedItemId: 'item-2' },
        },
      ],
    }));

    expect(journal.equipped[0].itemId).toBe('item-1');
    expect(journal.equipped[0].slotKey).toBe('main_hand');
    expect(journal.equipped[0].reason).toBe('preset_apply_exact_item');
    expect(journal.equipped[0].detailsJson as unknown).toEqual({ presetNumber: 2 });
    expect(journal.skipped[0].itemId).toBe('item-2');
    expect(journal.skipped[0].slotKey).toBe('ring_1');
    expect(journal.skipped[0].reason).toBe('preset_item_missing');
    expect(journal.skipped[0].detailsJson as unknown)
      .toEqual({ savedItemId: 'item-2' });
  });

  it('maps DB-like bulk array journal with nested per-item journal entries', () => {
    const journal = mapEquipmentOperationJournal(operationRow({
      result_journal_json: [
        {
          actionKey: 'equipped',
          itemId: 'item-1',
          targetSlotKey: 'off_hand',
          reasonKey: 'bulk_item_processed',
          success: true,
          details: { inputOrder: 1 },
          journal: [
            {
              actionKey: 'shifted',
              itemId: 'old-offhand',
              slotKey: 'main_hand',
              reasonKey: 'hand_rotation',
              message: 'Moved current off-hand item.',
              details: { fromSlotKey: 'off_hand' },
            },
          ],
        },
        {
          actionKey: 'failed',
          itemId: 'item-2',
          targetSlotKey: 'ring_2',
          reasonKey: 'requirements_not_met',
          statusMessage: 'Requirements are not met.',
          success: false,
          details: { missing: [{ stat: 'strength', required: 15 }] },
        },
      ],
    }));

    expect(journal.equipped[0].reason).toBe('bulk_item_processed');
    expect(journal.equipped[0].slotKey).toBe('off_hand');
    expect(journal.shifted[0].reason).toBe('hand_rotation');
    expect(journal.shifted[0].slotKey).toBe('main_hand');
    expect(journal.shifted[0].detailsJson as unknown)
      .toEqual({ fromSlotKey: 'off_hand' });
    expect(journal.failed[0].reason).toBe('requirements_not_met');
    expect(journal.failed[0].detailsJson as unknown)
      .toEqual({ missing: [{ stat: 'strength', required: 15 }] });
  });

  it('defaults failed array journal entries without explicit success to false', () => {
    const journal = mapEquipmentOperationJournal(operationRow({
      result_journal_json: [
        {
          action: 'failed',
          itemId: 'item-failed',
          targetSlotKey: 'main_hand',
          reason: 'exception',
          message: 'Equipment workflow failed.',
        },
      ],
    }));

    expect(journal.failed[0].action).toBe('failed');
    expect(journal.failed[0].success).toBeFalse();
    expect(journal.failed[0].reason).toBe('exception');
  });
});

function visibilityRow(
  overrides: Partial<GetHeroArmoryVisibilityStateRpcRow> = {},
): GetHeroArmoryVisibilityStateRpcRow {
  return {
    armory_building_id: 'building-1',
    armory_building_key: 'armory',
    armory_building_level: 2,
    estate_id: 'estate-1',
    generated_at: '2026-05-07T10:00:00Z',
    hero_id: 'hero-1',
    hidden_item_count: 3,
    server_id: 'server-1',
    shelves_json: Array.from({ length: 10 }, (_, index) => ({
      id: `shelf-${index + 1}`,
      position: index + 1,
      name: `Shelf ${index + 1}`,
      updatedAt: '2026-05-07T10:00:00Z',
      isPersisted: true,
    })),
    source_config_json: { target: 'visible_item_capacity' },
    total_owned_item_count: 5,
    unsorted_json: {
      id: null,
      position: 0,
      name: 'Unsorted',
      isPersisted: false,
    },
    visibility_limit: 2,
    visibility_limit_source: 'visible_item_capacity',
    visibility_order: 'armory_shelf_position',
    visible_item_count: 2,
    visible_statuses: ['active', 'locked_trade', 'locked_auction'],
    ...overrides,
  };
}

function armoryItemRow(
  overrides: Partial<GetHeroArmoryItemsRpcRow> = {},
): GetHeroArmoryItemsRpcRow {
  return {
    armory_shelf_position: 1,
    created_at: '2026-05-07T10:00:00Z',
    drachma_value: 20,
    generated_at: '2026-05-07T10:00:00Z',
    generation_base_id: 'base-1',
    generation_quality_key: 'normal',
    hero_id: 'hero-1',
    is_unsorted: false,
    is_visible: true,
    item_id: 'item-1',
    item_name: 'Bronze Blade',
    item_status: 'active',
    prefix_affix_id: null,
    server_id: 'server-1',
    shelf_name: 'Shelf 1',
    suffix_affix_id: null,
    visibility_index: 1,
    visibility_limit: 2,
    ...overrides,
  } as GetHeroArmoryItemsRpcRow;
}

function equipmentRow(
  overrides: Record<string, unknown> = {},
): GetHeroEquipmentRuntimeSlotsRpcRow {
  return {
    hero_id: 'hero-1',
    item_id: 'item-1',
    item_name: 'Bronze Blade',
    item_status: 'active',
    slot_key: 'main_hand',
    slot_label: 'Main hand',
    slot_sort_order: 10,
    equipment_area: 'weapon',
    equipment_slot_group: 'hand',
    equipped_at: '2026-05-07T10:00:00Z',
    generation_base_id: 'base-1',
    generation_quality_key: 'normal',
    base_key: 'bronze_blade',
    base_name: 'Bronze blade',
    base_type_key: 'one_handed_weapon',
    hand_usage: 'one_handed',
    has_item: true,
    quality_label: 'Normal',
    quality_multiplier: 1,
    prefix_affix_id: null,
    prefix_key: null,
    prefix_name: null,
    suffix_affix_id: null,
    suffix_key: null,
    suffix_name: null,
    is_runtime_usable: true,
    item_status_key: 'active',
    slot_item_state: 'equipped',
    ...overrides,
  } as unknown as GetHeroEquipmentRuntimeSlotsRpcRow;
}

function operationRow(
  overrides: Partial<BulkEquipHeroItemsRpcRow> = {},
): BulkEquipHeroItemsRpcRow {
  return {
    hero_id: 'hero-1',
    request_id: 'request-1',
    success: false,
    equipped_count: 1,
    skipped_count: 0,
    failed_count: 1,
    result_journal_json: {},
    final_equipment_json: [],
    ...overrides,
  };
}
