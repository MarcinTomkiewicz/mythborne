import { EquipmentPreviewItemDisplay } from '../domain/equipment/equipment-preview.model';
import { EquipmentPreviewIconClass } from '../domain/equipment/equipment-preview-icons.config';

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

export interface ItemClassificationInput {
  baseTypeKey?: string | null;
  handUsageKey?: string | null;
  primarySlotKey?: string | null;
  allowedSlotKeys?: readonly string[] | null;
}

export type ClassifiedItemDisplay = Pick<
  EquipmentPreviewItemDisplay,
  'kindLabel' | 'slotLabel'
> & {
  iconClass: EquipmentPreviewIconClass;
  statProfile: ItemStatProfile;
};
