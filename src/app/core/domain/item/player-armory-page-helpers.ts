import { equipmentPreviewIconClassForSlot } from '../equipment/equipment-preview-icons.config';
import { EquipmentPreviewSlotRow } from '../equipment/equipment-preview.model';
import {
  PlayerArmoryEquipmentSlotReadModel,
  PlayerArmoryItemReadModel,
  PlayerArmoryPageContextReadModel,
  PlayerArmorySellItemMessageParts,
  PlayerArmorySellSelectedMessageParts,
} from './player-armory-page-context.model';
import type {
  StructuredConfirmDialogSegment,
} from '../../interfaces/structured-confirm-dialog-segment.interface';

export function buildSellItemConfirmationSegments(
  parts: PlayerArmorySellItemMessageParts,
  highlightFields: readonly string[],
  itemName: string,
  drachmaValue: string,
): StructuredConfirmDialogSegment[] {
  return [
    { text: parts.prefix, highlighted: false },
    { text: itemName, highlighted: highlightFields.includes(parts.itemNameToken) },
    { text: parts.middle, highlighted: false },
    {
      text: drachmaValue,
      highlighted: highlightFields.includes(parts.drachmaValueToken),
    },
    { text: parts.suffix, highlighted: false },
  ];
}

export function buildSellSelectedConfirmationSegments(
  parts: PlayerArmorySellSelectedMessageParts,
  highlightFields: readonly string[],
  items: readonly PlayerArmoryItemReadModel[],
): StructuredConfirmDialogSegment[] {
  return [
    { text: parts.intro, highlighted: false, lineBreakAfter: true },
    { text: parts.itemsIntro, highlighted: false, lineBreakAfter: true },
    ...items.flatMap((item) => buildSellSelectedItemLineSegments(
      parts,
      highlightFields,
      item,
    )),
  ];
}

export function visibleArmoryItemsById(
  context: PlayerArmoryPageContextReadModel,
  itemIds: readonly string[],
): PlayerArmoryItemReadModel[] {
  const visibleItemsById = new Map(
    context.readModel.visibleItems.map((item) => [item.itemId, item]),
  );

  return itemIds
    .map((itemId) => visibleItemsById.get(itemId) ?? null)
    .filter((item): item is PlayerArmoryItemReadModel => item !== null);
}

export function canEquipInventoryItem(item: PlayerArmoryItemReadModel): boolean {
  return item.lifecycleStatusKey === 'active'
    && item.meetsRequirements === true;
}

export function canVendorScrapInventoryItem(
  item: PlayerArmoryItemReadModel,
): boolean {
  return item.lifecycleStatusKey === 'active'
    && isFiniteNumber(item.drachmaValue);
}

export function sumVendorScrapDrachmaValue(
  items: readonly PlayerArmoryItemReadModel[],
): number {
  return items.reduce((total, item) => {
    const drachmaValue = item.drachmaValue;

    if (!canVendorScrapInventoryItem(item) || !isFiniteNumber(drachmaValue)) {
      return total;
    }

    return total + drachmaValue;
  }, 0);
}

export function mapArmoryPageEquipmentPreviewRows(
  slots: readonly PlayerArmoryEquipmentSlotReadModel[],
): EquipmentPreviewSlotRow[] {
  return slots.map((slot) => ({
    slotKey: slot.slotKey,
    label: slot.slotLabel,
    sortOrder: slot.slotSortOrder,
    iconClass: equipmentPreviewIconClassForSlot(slot.slotKey),
    emptyDisplayName: slot.hasItem ? null : slot.itemDisplayName,
    emptyDisplayDetail: slot.hasItem ? null : slot.itemDisplayStateLabel,
    item: equipmentPreviewItem(slot),
  }));
}

function isFiniteNumber(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function buildSellSelectedItemLineSegments(
  parts: PlayerArmorySellSelectedMessageParts,
  highlightFields: readonly string[],
  item: PlayerArmoryItemReadModel,
): StructuredConfirmDialogSegment[] {
  const itemLineParts = parts.itemLineParts;
  const valueDisplay = item.displayCore.valueDisplay.displayValue;

  return [
    {
      text: item.displayCore.itemName,
      highlighted: highlightFields.includes(itemLineParts.itemNameToken),
    },
    { text: itemLineParts.middle, highlighted: false },
    {
      text: valueDisplay,
      highlighted: highlightFields.includes(itemLineParts.drachmaValueToken),
    },
    { text: itemLineParts.suffix, highlighted: false, lineBreakAfter: true },
  ];
}

function equipmentPreviewItem(
  slot: PlayerArmoryEquipmentSlotReadModel,
): EquipmentPreviewSlotRow['item'] {
  if (!slot.hasItem) {
    return null;
  }

  return {
    itemId: slot.itemId,
    name: slot.itemDisplayName,
    metadata: slot.itemDisplayStateLabel,
    statusLabel: slot.itemDisplayStateLabel,
    qualityLabel: slot.qualityLabel,
    kindLabel: slot.baseName,
    slotLabel: slot.slotLabel,
  };
}
