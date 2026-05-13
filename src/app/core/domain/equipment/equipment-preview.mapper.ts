import {
  EquipmentSlot,
  EquippedItemSummary,
} from '../item/item-equipment.model';
import { EquipmentPreviewSlotRow } from './equipment-preview.model';
import {
  EQUIPMENT_PREVIEW_ICON_CLASSES,
  EquipmentPreviewIconClass,
  EQUIPMENT_PREVIEW_SLOT_KEYS,
  equipmentPreviewIconClassForSlot,
} from './equipment-preview-icons.config';

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
            name: item.itemName,
            metadata: itemMetadataLabel(slot.label, item.qualityLabel),
          }
        : null,
    };
  });
}

function itemMetadataLabel(slotLabel: string, qualityLabel: string | null): string {
  return [slotLabel, qualityLabel].filter(Boolean).join(' \u00b7 ');
}

function equipmentPreviewIconClass(
  slotKey: string,
  item: EquippedItemSummary | undefined,
): EquipmentPreviewIconClass {
  switch (slotKey) {
    case EQUIPMENT_PREVIEW_SLOT_KEYS.mainHand:
    case EQUIPMENT_PREVIEW_SLOT_KEYS.offHand:
      return weaponIconClass(item);
    default:
      return equipmentPreviewIconClassForSlot(slotKey);
  }
}

function weaponIconClass(
  item: EquippedItemSummary | undefined,
): EquipmentPreviewIconClass {
  const handUsage = item?.handUsage?.toLowerCase() ?? '';
  const baseTypeKey = item?.baseTypeKey?.toLowerCase() ?? '';
  const baseKey = item?.baseKey?.toLowerCase() ?? '';
  const weaponSource = [handUsage, baseTypeKey, baseKey].join(' ');

  if (weaponSource.includes('two')) {
    return EQUIPMENT_PREVIEW_ICON_CLASSES.twoHanded;
  }

  if (
    weaponSource.includes('bow')
    || weaponSource.includes('ranged')
  ) {
    return EQUIPMENT_PREVIEW_ICON_CLASSES.bowWeapon;
  }

  if (weaponSource.includes('shield')) {
    return EQUIPMENT_PREVIEW_ICON_CLASSES.shield;
  }

  if (weaponSource.includes('one')) {
    return EQUIPMENT_PREVIEW_ICON_CLASSES.oneHanded;
  }

  return EQUIPMENT_PREVIEW_ICON_CLASSES.oneHanded;
}
