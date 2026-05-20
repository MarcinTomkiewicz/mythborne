import {
  EquipmentPreviewIconClass,
  equipmentPreviewIconClassForSlot,
} from '../../../core/domain/equipment/equipment-preview-icons.config';
import {
  EquipmentSlot,
  LoadoutPresetPreview,
  LoadoutPresetSlotItem,
} from '../../../core/domain/item/item-equipment.model';

export interface LoadoutPresetPreviewRow {
  slotKey: string;
  slotLabel: string;
  slotSortOrder: number;
  item: LoadoutPresetSlotItem | null;
}

export interface LoadoutPresetPreviewItemRow extends LoadoutPresetPreviewRow {
  item: LoadoutPresetSlotItem;
}

export function buildLoadoutPresetPreviewRows(
  preview: LoadoutPresetPreview | null,
  slots: readonly EquipmentSlot[],
): LoadoutPresetPreviewRow[] {
  if (!preview) {
    return [];
  }

  const itemsBySlot = new Map(
    preview.slotItems.map((item) => [item.slotKey, item]),
  );

  return slots.length
    ? slots.map((slot) => ({
        slotKey: slot.slotKey,
        slotLabel: slot.label,
        slotSortOrder: slot.sortOrder,
        item: itemsBySlot.get(slot.slotKey) ?? null,
      }))
    : preview.slotItems.map((item) => ({
        slotKey: item.slotKey,
        slotLabel: item.slotLabel,
        slotSortOrder: item.slotSortOrder,
        item,
      }));
}

export function previewStatusLabel(item: LoadoutPresetSlotItem | null): string {
  if (!item) {
    return 'Empty slot';
  }

  switch (item.previewStatus) {
    case 'available':
      return 'Owned and available';
    case 'missing':
      return 'Item missing';
    case 'no_longer_owned':
      return 'No longer owned';
    case 'scrapped':
      return 'Scrapped';
    default:
      return humanizeKey(item.previewStatus);
  }
}

export function previewItemName(item: LoadoutPresetSlotItem): string {
  return item.currentItemName
    ?? item.savedItemNameSnapshot
    ?? item.savedItemId;
}

export function isLoadoutPresetPreviewItemRow(
  row: LoadoutPresetPreviewRow,
): row is LoadoutPresetPreviewItemRow {
  return row.item !== null;
}

export function previewSlotFallbackIconClass(
  row: Pick<LoadoutPresetPreviewRow, 'slotKey'>,
): EquipmentPreviewIconClass {
  // The preset preview read model does not expose item type/base/hand metadata.
  // Use the target slot icon as the explicit fallback until the RPC exposes item classification.
  return equipmentPreviewIconClassForSlot(row.slotKey);
}

function humanizeKey(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ') || 'Status';
}
