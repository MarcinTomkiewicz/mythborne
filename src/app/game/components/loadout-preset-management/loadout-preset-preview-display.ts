import {
  EquipmentSlot,
  LoadoutPreset,
  LoadoutPresetPreview,
  LoadoutPresetSlotItem,
} from '../../../core/domain/item/item-equipment.model';

export interface LoadoutPresetPreviewRow {
  slotKey: string;
  slotLabel: string;
  slotSortOrder: number;
  item: LoadoutPresetSlotItem | null;
}

export interface LoadoutPresetUpdateSuggestion {
  key: string;
  preset: LoadoutPreset;
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

export function loadoutPresetUpdateSuggestion(
  preview: LoadoutPresetPreview | null,
  rows: readonly LoadoutPresetPreviewRow[],
  currentItemIdForSlot: (slotKey: string) => string | null,
  canCompare: boolean,
  dismissedKey: string | null,
): LoadoutPresetUpdateSuggestion | null {
  if (!preview || !canCompare) {
    return null;
  }

  const key = loadoutPresetSuggestionKey(preview.preset);
  if (dismissedKey === key) {
    return null;
  }

  return previewDiffersFromCurrentLoadout(rows, currentItemIdForSlot)
    ? { key, preset: preview.preset }
    : null;
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

export function previewStatusClass(item: LoadoutPresetSlotItem | null): string {
  if (!item) {
    return 'tag-badge tag-badge--muted';
  }

  return item.previewStatus === 'available'
    ? 'tag-badge tag-badge--success'
    : 'tag-badge tag-badge--warn';
}

export function previewItemName(item: LoadoutPresetSlotItem): string {
  return item.currentItemName
    ?? item.savedItemNameSnapshot
    ?? item.savedItemId;
}

function loadoutPresetSuggestionKey(preset: LoadoutPreset): string {
  return `${preset.presetId}:${preset.updatedAt}`;
}

function previewDiffersFromCurrentLoadout(
  rows: readonly LoadoutPresetPreviewRow[],
  currentItemIdForSlot: (slotKey: string) => string | null,
): boolean {
  return rows.some((row) =>
    currentItemIdForSlot(row.slotKey) !== (row.item?.savedItemId ?? null),
  );
}

function humanizeKey(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ') || 'Status';
}
