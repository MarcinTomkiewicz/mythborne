import {
  PlayerArmoryItemReadModel,
  PlayerArmoryStorageSlotReadModel,
} from '../../domain/item/player-armory-page-context.model';

export function movedArmoryItemsForDraggedItem(
  item: PlayerArmoryItemReadModel,
  selectedItems: readonly PlayerArmoryItemReadModel[],
): PlayerArmoryItemReadModel[] {
  return selectedItems.length > 1
    && selectedItems.some((selectedItem) => selectedItem.itemId === item.itemId)
      ? [...selectedItems]
      : [item];
}

export function canReceiveArmoryShelfDrop(
  shelf: PlayerArmoryStorageSlotReadModel,
): boolean {
  return shelf.isPersisted && !shelf.isUnsortedDropArea;
}
