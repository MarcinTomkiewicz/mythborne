import {
  EQUIPMENT_PREVIEW_SLOT_KEYS,
  EquipmentPreviewSlotKey,
} from '../../core/domain/equipment/equipment-preview-icons.config';
import { EquipmentPreviewSlotRow } from '../../core/domain/equipment/equipment-preview.model';

export type EquipmentPreviewRegion =
  | 'head'
  | 'torso'
  | 'neck'
  | 'ring1'
  | 'ring2'
  | 'mainHand'
  | 'offHand'
  | 'feet'
  | 'legs'
  | 'other';

export interface EquipmentPreviewGroupConfig {
  key: EquipmentPreviewRegion;
  zoneClass: string;
}

export const EQUIPMENT_PREVIEW_GROUPS: EquipmentPreviewGroupConfig[] = [
  { key: 'head', zoneClass: 'equipment-preview__zone--head' },
  { key: 'torso', zoneClass: 'equipment-preview__zone--torso' },
  { key: 'neck', zoneClass: 'equipment-preview__zone--neck' },
  { key: 'ring1', zoneClass: 'equipment-preview__zone--ring1' },
  { key: 'ring2', zoneClass: 'equipment-preview__zone--ring2' },
  { key: 'mainHand', zoneClass: 'equipment-preview__zone--main-hand' },
  { key: 'offHand', zoneClass: 'equipment-preview__zone--off-hand' },
  { key: 'feet', zoneClass: 'equipment-preview__zone--feet' },
  { key: 'legs', zoneClass: 'equipment-preview__zone--legs' },
];

export const EQUIPMENT_PREVIEW_SLOT_REGIONS: Record<
  EquipmentPreviewSlotKey,
  EquipmentPreviewRegion
> = {
  [EQUIPMENT_PREVIEW_SLOT_KEYS.helmet]: 'head',
  [EQUIPMENT_PREVIEW_SLOT_KEYS.armor]: 'torso',
  [EQUIPMENT_PREVIEW_SLOT_KEYS.ring1]: 'ring1',
  [EQUIPMENT_PREVIEW_SLOT_KEYS.mainHand]: 'mainHand',
  [EQUIPMENT_PREVIEW_SLOT_KEYS.boots]: 'feet',
  [EQUIPMENT_PREVIEW_SLOT_KEYS.amulet]: 'neck',
  [EQUIPMENT_PREVIEW_SLOT_KEYS.ring2]: 'ring2',
  [EQUIPMENT_PREVIEW_SLOT_KEYS.offHand]: 'offHand',
  [EQUIPMENT_PREVIEW_SLOT_KEYS.pants]: 'legs',
};

export function equipmentPreviewRegionFor(
  row: EquipmentPreviewSlotRow,
): EquipmentPreviewRegion {
  return isEquipmentPreviewSlotRegionKey(row.slotKey)
    ? EQUIPMENT_PREVIEW_SLOT_REGIONS[row.slotKey]
    : 'other';
}

function isEquipmentPreviewSlotRegionKey(
  slotKey: string,
): slotKey is EquipmentPreviewSlotKey {
  return Object.hasOwn(EQUIPMENT_PREVIEW_SLOT_REGIONS, slotKey);
}
