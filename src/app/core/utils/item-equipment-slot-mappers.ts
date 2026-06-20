import {
  CurrentEquipmentLoadout,
  EquipmentSlot,
  EquippedItemSummary,
} from '../domain/item/item-equipment.model';
import { GetHeroEquipmentRuntimeSlotsRpcRow } from '../types/item-equipment-rpc.types';
import { Row } from '../types/supabase.types';

export function mapEquipmentSlot(row: Row<'equipment_slot_definitions'>): EquipmentSlot {
  return {
    slotKey: row.key,
    label: row.label,
    sortOrder: row.sort_order,
    equipmentArea: row.equipment_area,
    equipmentSlotGroup: row.equipment_area,
  };
}

export function mapEquippedItemSummary(
  row: GetHeroEquipmentRuntimeSlotsRpcRow,
): EquippedItemSummary {
  return {
    itemId: row.item_id,
    heroId: row.hero_id,
    ownerHeroId: null,
    itemName: row.item_name,
    lifecycleStatus: row.item_status_key as EquippedItemSummary['lifecycleStatus'],
    generationBaseId: row.generation_base_id,
    generationQualityKey: row.generation_quality_key,
    prefixAffixId: row.prefix_affix_id,
    suffixAffixId: row.suffix_affix_id,
    slotKey: row.slot_key,
    slotLabel: row.slot_label,
    slotSortOrder: row.slot_sort_order,
    equipmentArea: row.equipment_area,
    equipmentSlotGroup: row.equipment_slot_group,
    equippedAt: row.equipped_at,
    baseKey: row.base_key,
    baseName: row.base_name,
    baseTypeKey: row.base_type_key,
    handUsage: row.hand_usage,
    qualityLabel: row.quality_label,
    qualityMultiplier: row.quality_multiplier,
    prefixKey: row.prefix_key,
    prefixName: row.prefix_name,
    suffixKey: row.suffix_key,
    suffixName: row.suffix_name,
    isRuntimeUsable: row.is_runtime_usable,
  };
}

export function mapCurrentEquipmentLoadout(
  heroId: string,
  rows: readonly GetHeroEquipmentRuntimeSlotsRpcRow[],
): CurrentEquipmentLoadout {
  return {
    heroId,
    slots: [...rows]
      .filter((row) => row.has_item)
      .sort((left, right) => left.slot_sort_order - right.slot_sort_order)
      .map(mapEquippedItemSummary),
  };
}
