import {
  EquipmentSlotKey,
  LoadoutPresetNumber,
} from '../../domain/item/item-equipment.model';

export interface EquipHeroItemInput {
  itemId: string;
  targetSlotKey?: EquipmentSlotKey | null;
  requestId?: string | null;
}

export interface UnequipHeroSlotInput {
  slotKey: EquipmentSlotKey;
  requestId?: string | null;
}

export interface BulkEquipHeroItemInput {
  itemId: string;
  targetSlotKey?: EquipmentSlotKey | null;
}

export interface BulkEquipHeroItemsInput {
  items: readonly BulkEquipHeroItemInput[];
  requestId?: string | null;
}

export interface BulkUnequipHeroItemInput {
  itemId?: string | null;
  slotKey?: EquipmentSlotKey | null;
}

export interface BulkUnequipHeroItemsInput {
  items: readonly BulkUnequipHeroItemInput[];
  requestId?: string | null;
}

export interface LoadoutPresetInput {
  presetNumber: LoadoutPresetNumber;
  requestId?: string | null;
}

export interface SaveCurrentLoadoutPresetInput extends LoadoutPresetInput {
  name?: string | null;
}

export interface RenameLoadoutPresetInput extends LoadoutPresetInput {
  name: string;
}
