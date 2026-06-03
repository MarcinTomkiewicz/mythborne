import {
  ARMORY_PLAYER_SHELF_POSITIONS,
  ARMORY_UNSORTED_SHELF_POSITION,
} from '../constants/armory-shelves.const';
import {
  ArmoryItemSummary,
  ArmoryShelfReadModel,
  EquippedItemSummary,
} from '../domain/item/item-equipment.model';

export function completeArmoryShelfDisplay(
  shelves: readonly ArmoryShelfReadModel[],
): ArmoryShelfReadModel[] {
  const heroId = shelves[0]?.heroId ?? '';
  const shelvesByPosition = new Map(
    shelves.map((shelf) => [shelf.position, shelf]),
  );
  const shelfAt = (position: number): ArmoryShelfReadModel =>
    shelvesByPosition.get(position) ?? {
      shelfId: null,
      heroId,
      position,
      name: position === 0 ? 'Unsorted' : `Shelf ${position}`,
      updatedAt: null,
      isPersisted: false,
      isUnsortedDropArea: position === 0,
      visibleItems: [],
    };

  return [
    ...ARMORY_PLAYER_SHELF_POSITIONS.map(shelfAt),
    shelfAt(ARMORY_UNSORTED_SHELF_POSITION),
  ];
}

export function storedArmoryItems(
  items: readonly ArmoryItemSummary[],
  equippedItems: readonly Pick<EquippedItemSummary, 'itemId'>[],
): ArmoryItemSummary[] {
  const equippedItemIds = new Set(equippedItems.map((item) => item.itemId));

  return items.filter((item) => !equippedItemIds.has(item.itemId));
}

export function storedArmoryShelves(
  shelves: readonly ArmoryShelfReadModel[],
  equippedItems: readonly Pick<EquippedItemSummary, 'itemId'>[],
): ArmoryShelfReadModel[] {
  const equippedItemIds = new Set(equippedItems.map((item) => item.itemId));

  return projectArmoryShelvesByItemIds(
    shelves,
    new Set(
      shelves
        .flatMap((shelf) => shelf.visibleItems)
        .filter((item) => !equippedItemIds.has(item.itemId))
        .map((item) => item.itemId),
    ),
  );
}

export function projectArmoryShelvesByItemIds(
  shelves: readonly ArmoryShelfReadModel[],
  itemIds: ReadonlySet<string>,
): ArmoryShelfReadModel[] {
  return shelves.map((shelf) => ({
    ...shelf,
    visibleItems: shelf.visibleItems.filter((item) => itemIds.has(item.itemId)),
  }));
}
