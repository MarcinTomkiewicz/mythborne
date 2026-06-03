import { EquipmentPreviewItemDisplay } from '../domain/equipment/equipment-preview.model';
import { EquipmentPreviewIconClass } from '../domain/equipment/equipment-preview-icons.config';
import { ArmoryItemSummary } from '../domain/item/item-equipment.model';

export type ItemStatProfile = 'weapon' | 'armor' | 'none';

export type ItemClassificationKey =
  | 'one_handed_weapon'
  | 'two_handed_weapon'
  | 'ranged_weapon'
  | 'bow_weapon'
  | 'shield'
  | 'helmet'
  | 'armor'
  | 'pants'
  | 'boots'
  | 'ring'
  | 'amulet';

// Compatibility classification for read models that do not yet expose canonical
// item type/equip-target display labels directly.
export type ItemClassificationInput = Partial<Pick<
  ArmoryItemSummary,
  | 'baseTypeKey'
  | 'handUsageKey'
  | 'primarySlotKey'
  | 'allowedSlotKeys'
>>;

export type ClassifiedItemDisplay = Pick<
  EquipmentPreviewItemDisplay,
  'kindLabel' | 'slotLabel'
> & {
  iconClass: EquipmentPreviewIconClass;
  statProfile: ItemStatProfile;
};
