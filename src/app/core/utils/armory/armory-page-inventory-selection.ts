import {
  PlayerArmoryItemReadModel,
  PlayerArmoryPageContextReadModel,
} from '../../domain/item/player-armory-page-context.model';
import {
  canEquipInventoryItem,
  canVendorScrapInventoryItem,
  visibleArmoryItemsById,
} from '../../domain/item/player-armory-page-helpers';
import { ArmoryBulkMoveSelection } from '../../interfaces/item/armory-page-inventory-selection.interface';

export function armoryVendorScrapItems(
  context: PlayerArmoryPageContextReadModel,
  itemIds: readonly string[],
): PlayerArmoryItemReadModel[] | null {
  const selectedItems = visibleArmoryItemsById(context, itemIds);

  return selectedItems.length === itemIds.length
    && selectedItems.every(canVendorScrapInventoryItem)
      ? selectedItems
      : null;
}

export function armoryEquippableItems(
  context: PlayerArmoryPageContextReadModel,
  itemIds: readonly string[],
): PlayerArmoryItemReadModel[] | null {
  const selectedItems = visibleArmoryItemsById(context, itemIds);

  return selectedItems.length === itemIds.length
    && selectedItems.every(canEquipInventoryItem)
      ? selectedItems
      : null;
}

export function armoryBulkMoveSelection(
  context: PlayerArmoryPageContextReadModel,
  itemIds: readonly string[],
  targetShelfPosition: number,
): ArmoryBulkMoveSelection | null {
  const selectedItems = visibleArmoryItemsById(context, itemIds);
  const targetShelf = context.readModel.shelves.find((shelf) =>
    shelf.position === targetShelfPosition
    && shelf.isPersisted
    && !shelf.isUnsortedDropArea,
  ) ?? null;

  return selectedItems.length === itemIds.length && targetShelf
    ? { selectedItems, targetShelf }
    : null;
}
