import { EquipmentPreviewIconClass } from './equipment-preview-icons.config';

export interface EquipmentPreviewItemDisplay {
  itemId: string;
  name: string;
  metadata: string | null;
  statusLabel: string | null;
  qualityLabel: string | null;
  kindLabel: string | null;
  slotLabel: string | null;
}

export interface EquipmentPreviewSlotRow {
  slotKey: string;
  label: string;
  sortOrder: number;
  iconClass: EquipmentPreviewIconClass;
  item: EquipmentPreviewItemDisplay | null;
  emptyDisplayName?: string | null;
  emptyDisplayDetail?: string | null;
}
