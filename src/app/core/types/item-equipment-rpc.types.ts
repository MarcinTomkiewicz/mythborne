import { Database } from './database.types';
import { Row } from './supabase.types';

export type ItemRow = Row<'items'>;
export type ArmoryShelfRow = Row<'hero_armory_shelves'>;

export type GetHeroEquipmentRuntimeSlotsRpcArgs =
  Database['public']['Functions']['get_hero_equipment_runtime_slots']['Args'];
export type GetHeroEquipmentRuntimeSlotsRpcRow =
  Database['public']['Functions']['get_hero_equipment_runtime_slots']['Returns'][number];

export type GetHeroArmoryVisibilityStateRpcArgs =
  Database['public']['Functions']['get_hero_armory_visibility_state']['Args'];
export type GetHeroArmoryVisibilityStateRpcRow =
  Database['public']['Functions']['get_hero_armory_visibility_state']['Returns'][number];

export type GetHeroArmoryItemsRpcArgs =
  Database['public']['Functions']['get_hero_armory_items']['Args'];
export type GetHeroArmoryItemsRpcRow =
  Database['public']['Functions']['get_hero_armory_items']['Returns'][number];

export type EquipHeroItemRpcArgs =
  Database['public']['Functions']['equip_hero_item']['Args'];
export type EquipHeroItemRpcRow =
  Database['public']['Functions']['equip_hero_item']['Returns'][number];

export type UnequipHeroItemRpcArgs =
  Database['public']['Functions']['unequip_hero_item']['Args'];
export type UnequipHeroItemRpcRow =
  Database['public']['Functions']['unequip_hero_item']['Returns'][number];

export type BulkEquipHeroItemsRpcArgs =
  Database['public']['Functions']['bulk_equip_hero_items']['Args'];
export type BulkEquipHeroItemsRpcRow =
  Database['public']['Functions']['bulk_equip_hero_items']['Returns'][number];

export type GetHeroLoadoutPresetsRpcArgs =
  Database['public']['Functions']['get_hero_loadout_presets']['Args'];
export type GetHeroLoadoutPresetsRpcRow =
  Database['public']['Functions']['get_hero_loadout_presets']['Returns'][number];

export type SaveCurrentHeroLoadoutPresetRpcArgs =
  Database['public']['Functions']['save_current_hero_loadout_preset']['Args'];
export type SaveCurrentHeroLoadoutPresetRpcRow =
  Database['public']['Functions']['save_current_hero_loadout_preset']['Returns'][number];

export type ClearHeroLoadoutPresetRpcArgs =
  Database['public']['Functions']['clear_hero_loadout_preset']['Args'];
export type ClearHeroLoadoutPresetRpcRow =
  Database['public']['Functions']['clear_hero_loadout_preset']['Returns'][number];

export type PreviewHeroLoadoutPresetRpcArgs =
  Database['public']['Functions']['preview_hero_loadout_preset']['Args'];
export type PreviewHeroLoadoutPresetRpcRow =
  Database['public']['Functions']['preview_hero_loadout_preset']['Returns'][number];

export type ApplyHeroLoadoutPresetRpcArgs =
  Database['public']['Functions']['apply_hero_loadout_preset']['Args'];
export type ApplyHeroLoadoutPresetRpcRow =
  Database['public']['Functions']['apply_hero_loadout_preset']['Returns'][number];

export type GetItemEffectiveRequirementsRpcArgs =
  Database['public']['Functions']['get_item_effective_requirements']['Args'];
export type GetItemEffectiveRequirementsRpcRow =
  Database['public']['Functions']['get_item_effective_requirements']['Returns'][number];

export type GetItemRequirementComponentRowsRpcArgs =
  Database['public']['Functions']['get_item_requirement_component_rows']['Args'];
export type GetItemRequirementComponentRowsRpcRow =
  Database['public']['Functions']['get_item_requirement_component_rows']['Returns'][number];

export type CheckHeroMeetsItemRequirementsRpcArgs =
  Database['public']['Functions']['check_hero_meets_item_requirements']['Args'];
export type CheckHeroMeetsItemRequirementsRpcRow =
  Database['public']['Functions']['check_hero_meets_item_requirements']['Returns'][number];

export type EquipmentOperationRpcRow =
  | EquipHeroItemRpcRow
  | UnequipHeroItemRpcRow
  | BulkEquipHeroItemsRpcRow
  | ApplyHeroLoadoutPresetRpcRow;
