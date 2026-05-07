import { Json } from '../types/database.types';
import {
  BulkEquipHeroItemsRpcRow,
  GetHeroEquipmentRuntimeSlotsRpcRow,
  GetHeroLoadoutPresetsRpcRow,
  GetItemEffectiveRequirementsRpcRow,
  GetItemRequirementComponentRowsRpcRow,
  ItemRow,
  PreviewHeroLoadoutPresetRpcRow,
} from '../types/item-equipment-rpc.types';
import {
  mapCurrentEquipmentLoadout,
  mapEquipmentSlot,
  mapEquipmentOperationJournal,
  mapEquippedItemSummary,
  mapItemRequirementPreview,
  mapItemSummary,
  mapLoadoutPreset,
  mapLoadoutPresetSlotItem,
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

  it('maps item hero_id to ownerHeroId, not loadout hero context', () => {
    const item = mapItemSummary(itemRow({
      hero_id: 'owner-hero-1',
      id: 'item-1',
    }));

    expect(item.itemId).toBe('item-1');
    expect(item.ownerHeroId).toBe('owner-hero-1');
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

  it('maps preset rows with hero context and literal preset number', () => {
    const preset = mapLoadoutPreset(presetRow({
      hero_id: 'preset-hero-1',
      preset_number: 3,
    }));

    expect(preset.heroId).toBe('preset-hero-1');
    expect(preset.presetNumber).toBe(3);
  });

  it('preserves exact saved item ids and nullable missing item preview fields', () => {
    const preview = mapLoadoutPresetSlotItem(presetPreviewRow({
      saved_item_id: 'saved-item-1',
      slot_key: 'off_hand',
      current_item_name: null,
      current_owner_hero_id: null,
      item_status: null,
      is_runtime_usable: false,
    }));

    expect(preview.savedItemId).toBe('saved-item-1');
    expect(preview.slotKey).toBe('off_hand');
    expect(preview.currentItemName).toBeNull();
    expect(preview.currentOwnerHeroId).toBeNull();
    expect(preview.lifecycleStatus).toBeNull();
    expect(preview.isRuntimeUsable).toBeFalse();
  });

  it('keeps requirement preview numeric when the current DB contract is numeric-only', () => {
    const preview = mapItemRequirementPreview(
      'item-1',
      'hero-1',
      [requirementComponentRow()],
      [effectiveRequirementRow()],
      { meets_requirements: false, failures_json: { reason: 'too_low' } },
    );

    expect(preview.heroId).toBe('hero-1');
    expect(preview.meetsRequirements).toBeFalse();
    expect(preview.components[0].requiredKey).toBe('strength');
    expect(preview.components[0].requiredStatKey).toBe('strength');
    expect(preview.components[0].requiredValue).toBe(12);
    expect(preview.components[0].valueType).toBeNull();
    expect(preview.effectiveRequirements[0].requiredValue).toBe(15);
    expect(preview.effectiveRequirements[0].valueType).toBeNull();
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

function itemRow(overrides: Partial<ItemRow> = {}): ItemRow {
  return {
    id: 'item-1',
    server_id: 'server-1',
    hero_id: 'hero-1',
    name: 'Bronze Blade',
    description: null,
    status: 'active',
    generation_base_id: 'base-1',
    generation_quality_key: 'normal',
    prefix_affix_id: null,
    suffix_affix_id: null,
    armory_shelf_position: 0,
    drachma_value: 20,
    metadata_json: {},
    generated_at: '2026-05-07T10:00:00Z',
    scrapped_at: null,
    recoverable_until: null,
    created_at: '2026-05-07T10:00:00Z',
    updated_at: '2026-05-07T10:00:00Z',
    ...overrides,
  };
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
    quality_label: 'Normal',
    quality_multiplier: 1,
    prefix_affix_id: null,
    prefix_key: null,
    prefix_name: null,
    suffix_affix_id: null,
    suffix_key: null,
    suffix_name: null,
    is_runtime_usable: true,
    ...overrides,
  } as unknown as GetHeroEquipmentRuntimeSlotsRpcRow;
}

function presetRow(
  overrides: Record<string, unknown> = {},
): GetHeroLoadoutPresetsRpcRow {
  return {
    preset_id: 'preset-1',
    hero_id: 'hero-1',
    preset_number: 1,
    name: 'Default',
    slot_count: 2,
    saved_at: '2026-05-07T10:00:00Z',
    cleared_at: null,
    created_at: '2026-05-07T09:00:00Z',
    updated_at: '2026-05-07T10:00:00Z',
    ...overrides,
  } as unknown as GetHeroLoadoutPresetsRpcRow;
}

function presetPreviewRow(
  overrides: Record<string, unknown> = {},
): PreviewHeroLoadoutPresetRpcRow {
  return {
    hero_id: 'hero-1',
    preset_id: 'preset-1',
    preset_number: 1,
    slot_key: 'main_hand',
    slot_label: 'Main hand',
    slot_sort_order: 10,
    saved_item_id: 'item-1',
    saved_item_name_snapshot: 'Bronze Blade',
    current_item_name: 'Bronze Blade',
    current_owner_hero_id: 'hero-1',
    item_status: 'active',
    is_owned_by_hero: true,
    is_runtime_usable: true,
    preview_status: 'available',
    status_message: 'Available.',
    ...overrides,
  } as unknown as PreviewHeroLoadoutPresetRpcRow;
}

function requirementComponentRow(
  overrides: Partial<GetItemRequirementComponentRowsRpcRow> = {},
): GetItemRequirementComponentRowsRpcRow {
  return {
    item_id: 'item-1',
    item_owner_hero_id: 'hero-1',
    item_status: 'active',
    requirement_id: 'requirement-1',
    requirement_definition_key: 'hero_stat',
    required_stat_key: 'strength',
    raw_required_value: 12,
    applies_from_level: 1,
    source_entity_type: 'item_generation_base',
    source_entity_id: 'base-1',
    source_layer: 'base',
    source_key: 'bronze_blade',
    source_label: 'Bronze blade',
    source_sort_order: 10,
    requirement_sort_order: 10,
    generation_quality_key: 'normal',
    quality_requirement_multiplier: 1,
    ...overrides,
  };
}

function effectiveRequirementRow(
  overrides: Partial<GetItemEffectiveRequirementsRpcRow> = {},
): GetItemEffectiveRequirementsRpcRow {
  return {
    item_id: 'item-1',
    item_owner_hero_id: 'hero-1',
    requirement_definition_key: 'hero_stat',
    required_stat_key: 'strength',
    required_value_integer: 15,
    final_decimal_value: 15,
    highest_component_value: 12,
    additional_component_value: 3,
    additional_requirement_fraction: 0.5,
    pre_quality_value: 15,
    quality_requirement_multiplier: 1,
    rounding_mode: 'ceil',
    component_count: 2,
    generation_quality_key: 'normal',
    ...overrides,
  };
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
