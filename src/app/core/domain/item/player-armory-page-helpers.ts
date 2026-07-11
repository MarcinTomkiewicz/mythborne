import { equipmentPreviewIconClassForSlot } from '../equipment/equipment-preview-icons.config';
import { EquipmentPreviewSlotRow } from '../equipment/equipment-preview.model';
import {
  PlayerArmoryEquipmentSlotReadModel,
  PlayerArmoryItemReadModel,
  PlayerArmoryPageContextReadModel,
  PlayerArmorySellItemMessageParts,
  PlayerArmorySellSelectedMessageParts,
  PlayerArmoryVendorScrapItem,
} from './player-armory-page-context.model';
import type {
  StructuredDialogParagraph,
} from '../../interfaces/structured-dialog-content.interface';

export function buildSellItemConfirmationParagraphs(
  parts: PlayerArmorySellItemMessageParts,
  highlightFields: readonly string[],
  itemName: string,
  drachmaValue: string,
): StructuredDialogParagraph[] {
  return [{
    segments: [
      { text: parts.prefix, tone: 'plain' },
      {
        text: itemName,
        tone: highlightFields.includes(parts.itemNameToken) ? 'heading' : 'plain',
      },
      { text: parts.middle, tone: 'plain' },
      {
        text: drachmaValue,
        tone: highlightFields.includes(parts.drachmaValueToken) ? 'heading' : 'plain',
      },
      { text: parts.suffix, tone: 'plain' },
    ],
  }];
}

export function buildSellSelectedConfirmationParagraphs(
  parts: PlayerArmorySellSelectedMessageParts,
  highlightFields: readonly string[],
  items: readonly PlayerArmoryItemReadModel[],
): StructuredDialogParagraph[] {
  return [
    { segments: [{ text: parts.intro, tone: 'plain' }] },
    { segments: [{ text: parts.itemsIntro, tone: 'plain' }] },
    ...items.map((item) => {
      const itemLineParts = parts.itemLineParts;

      return {
        segments: [
          {
            text: item.displayCore.itemName,
            tone: highlightFields.includes(itemLineParts.itemNameToken)
              ? 'heading'
              : 'plain',
          },
          { text: itemLineParts.middle, tone: 'plain' },
          {
            text: item.displayCore.valueDisplay.displayValue,
            tone: highlightFields.includes(itemLineParts.drachmaValueToken)
              ? 'heading'
              : 'plain',
          },
          { text: itemLineParts.suffix, tone: 'plain' },
        ],
      } satisfies StructuredDialogParagraph;
    }),
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
): item is PlayerArmoryVendorScrapItem {
  return item.lifecycleStatusKey === 'active'
    && typeof item.drachmaValue === 'number'
    && Number.isFinite(item.drachmaValue);
}

export function sumVendorScrapDrachmaValue(
  items: readonly PlayerArmoryItemReadModel[],
): number {
  return items.reduce((total, item) => {
    if (!canVendorScrapInventoryItem(item)) {
      return total;
    }

    return total + item.drachmaValue;
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
    item: slot.hasItem
      ? {
          itemId: slot.itemId,
          name: slot.itemDisplayName,
          metadata: slot.itemDisplayStateLabel,
          statusLabel: slot.itemDisplayStateLabel,
          qualityLabel: slot.qualityLabel,
          kindLabel: slot.baseName,
          slotLabel: slot.slotLabel,
        }
      : null,
  }));
}
