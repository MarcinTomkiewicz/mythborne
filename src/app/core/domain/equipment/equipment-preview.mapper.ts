import {
  ClassifiedItemDisplay,
  ItemClassificationKey,
  ItemClassificationInput,
} from '../../types/equipment-classification.types';
import { normalizeKeyText } from '../../utils/normalize-text';
import {
  ArmoryItemSummary,
  EquipmentSlot,
  EquippedItemSummary,
} from '../item/item-equipment.model';
import {
  CLASSIFICATION_BY_KEY,
  HAND_USAGE_CLASSIFICATION_KEYS,
  SLOT_CLASSIFICATION_KEYS,
  UNKNOWN_ITEM_DISPLAY,
} from './equipment-classification.config';
import {
  EQUIPMENT_PREVIEW_SLOT_KEYS,
  EquipmentPreviewIconClass,
  equipmentPreviewIconClassForSlot,
} from './equipment-preview-icons.config';
import { EquipmentPreviewSlotRow } from './equipment-preview.model';

export function mapEquipmentPreviewRows(
  slots: EquipmentSlot[],
  equippedItems: EquippedItemSummary[],
): EquipmentPreviewSlotRow[] {
  const equippedBySlot = new Map(
    equippedItems.map((item) => [item.slotKey, item]),
  );

  return slots.map((slot) => {
    const item = equippedBySlot.get(slot.slotKey);

    return {
      slotKey: slot.slotKey,
      label: slot.label,
      sortOrder: slot.sortOrder,
      iconClass: equipmentPreviewIconClass(slot.slotKey, item),
      item: item
        ? {
            itemId: item.itemId,
            name: item.itemName,
            metadata: itemMetadataLabel(slot.label, item.qualityLabel),
            statusLabel: item.lifecycleStatus,
            qualityLabel: item.qualityLabel,
            kindLabel: item.baseName,
            slotLabel: slot.label,
          }
        : null,
    };
  });
}

function itemMetadataLabel(
  slotLabel: string,
  qualityLabel: string | null,
): string {
  return [slotLabel, qualityLabel].filter(Boolean).join(' \u00b7 ');
}

function equipmentPreviewIconClass(
  slotKey: string,
  item: EquippedItemSummary | undefined,
): EquipmentPreviewIconClass {
  if (!item) {
    return equipmentPreviewIconClassForSlot(slotKey);
  }

  switch (slotKey) {
    case EQUIPMENT_PREVIEW_SLOT_KEYS.mainHand:
    case EQUIPMENT_PREVIEW_SLOT_KEYS.offHand:
      return weaponIconClass(item);
    default:
      return equipmentPreviewIconClassForSlot(slotKey);
  }
}

export function equippedItemIconClass(
  item: EquippedItemSummary,
): EquipmentPreviewIconClass {
  return equipmentPreviewIconClass(item.slotKey, item);
}

export function armoryItemIconClass(
  item: ArmoryItemSummary,
): EquipmentPreviewIconClass {
  return classifyItemDisplay({
    baseTypeKey: item.baseTypeKey,
    handUsageKey: item.handUsageKey,
    primarySlotKey: item.primarySlotKey,
    allowedSlotKeys: item.allowedSlotKeys,
  }).iconClass;
}

export function classifyItemDisplay(
  input: ItemClassificationInput,
): ClassifiedItemDisplay {
  const classificationKey = resolveClassificationKey(input);

  return classificationKey
    ? CLASSIFICATION_BY_KEY[classificationKey]
    : UNKNOWN_ITEM_DISPLAY;
}

function weaponIconClass(item: EquippedItemSummary): EquipmentPreviewIconClass {
  return classifyItemDisplay({
    baseTypeKey: item.baseTypeKey,
    handUsageKey: item.handUsage,
    primarySlotKey: item.slotKey,
  }).iconClass;
}

function resolveClassificationKey(
  input: ItemClassificationInput,
): ItemClassificationKey | null {
  const baseTypeKey = normalizeKeyText(input.baseTypeKey);
  if (baseTypeKey in CLASSIFICATION_BY_KEY) {
    return baseTypeKey as ItemClassificationKey;
  }

  const slotKey = normalizedClassificationSlotKey(input);
  if (slotKey in SLOT_CLASSIFICATION_KEYS) {
    return SLOT_CLASSIFICATION_KEYS[slotKey];
  }

  const handUsageKey = normalizeKeyText(input.handUsageKey);

  return HAND_USAGE_CLASSIFICATION_KEYS[handUsageKey] ?? null;
}

function normalizedClassificationSlotKey(
  input: ItemClassificationInput,
): string {
  const slotKey =
    input.primarySlotKey?.trim() ||
    input.allowedSlotKeys?.find((key) => key.trim())?.trim() ||
    '';

  return normalizeKeyText(slotKey);
}
