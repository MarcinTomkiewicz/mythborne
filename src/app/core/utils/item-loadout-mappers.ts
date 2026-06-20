import {
  ClearLoadoutPresetResult,
  LoadoutPreset,
  LoadoutPresetPreview,
  LoadoutPresetSlotItem,
  RenameLoadoutPresetResult,
  SaveLoadoutPresetResult,
} from '../domain/item/item-equipment.model';
import {
  ClearHeroLoadoutPresetRpcRow,
  GetHeroLoadoutPresetsRpcRow,
  PreviewHeroLoadoutPresetRpcRow,
  RenameHeroLoadoutPresetRpcRow,
  SaveCurrentHeroLoadoutPresetRpcRow,
} from '../types/item-equipment-rpc.types';

export function mapLoadoutPreset(
  row: GetHeroLoadoutPresetsRpcRow,
): LoadoutPreset {
  return {
    presetId: row.preset_id,
    heroId: row.hero_id,
    presetNumber: row.preset_number,
    name: row.name,
    slotCount: row.slot_count,
    savedAt: row.saved_at,
    clearedAt: row.cleared_at,
    updatedAt: row.updated_at,
  };
}

export function mapSaveLoadoutPresetResult(
  row: SaveCurrentHeroLoadoutPresetRpcRow,
): SaveLoadoutPresetResult {
  return {
    heroId: row.hero_id,
    presetId: row.preset_id,
    presetNumber: row.preset_number,
    name: row.name,
    savedSlotCount: row.saved_slot_count,
    requestId: row.request_id,
    slotsJson: row.slots_json,
  };
}

export function mapRenameLoadoutPresetResult(
  row: RenameHeroLoadoutPresetRpcRow,
): RenameLoadoutPresetResult {
  return {
    heroId: row.hero_id,
    presetId: row.preset_id,
    presetNumber: row.preset_number,
    name: row.name,
    requestId: row.request_id,
    updatedAt: row.updated_at,
  };
}

export function mapClearLoadoutPresetResult(
  row: ClearHeroLoadoutPresetRpcRow,
): ClearLoadoutPresetResult {
  return {
    heroId: row.hero_id,
    presetId: row.preset_id,
    presetNumber: row.preset_number,
    name: row.name,
    clearedSlotCount: row.cleared_slot_count,
    requestId: row.request_id,
  };
}

export function mapLoadoutPresetPreview(
  preset: LoadoutPreset,
  rows: readonly PreviewHeroLoadoutPresetRpcRow[],
): LoadoutPresetPreview {
  return {
    preset,
    slotItems: [...rows]
      .sort((left, right) => left.slot_sort_order - right.slot_sort_order
        || left.slot_key.localeCompare(right.slot_key))
      .map(mapLoadoutPresetSlotItem),
  };
}

function mapLoadoutPresetSlotItem(
  row: PreviewHeroLoadoutPresetRpcRow,
): LoadoutPresetSlotItem {
  return {
    presetId: row.preset_id,
    presetNumber: row.preset_number,
    slotKey: row.slot_key,
    slotLabel: row.slot_label,
    slotSortOrder: row.slot_sort_order,
    savedItemId: row.saved_item_id,
    savedItemNameSnapshot: row.saved_item_name_snapshot,
    currentItemName: row.current_item_name,
    currentOwnerHeroId: row.current_owner_hero_id,
    lifecycleStatus: row.item_status,
    isOwnedByHero: row.is_owned_by_hero,
    isRuntimeUsable: row.is_runtime_usable,
    previewStatus: row.preview_status,
    statusMessage: row.status_message,
  };
}
