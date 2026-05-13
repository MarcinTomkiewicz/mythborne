import { EquipmentPreviewIconClass } from './equipment-preview-icons.config';

export interface EquipmentPreviewItemDisplay {
  name: string;
  metadata: string | null;
}

export interface EquipmentPreviewSlotRow {
  slotKey: string;
  label: string;
  sortOrder: number;
  iconClass: EquipmentPreviewIconClass;
  item: EquipmentPreviewItemDisplay | null;
}
