import {
  PlayerArmoryItemReadModel,
  PlayerArmoryStorageSlotReadModel,
} from '../../domain/item/player-armory-page-context.model';
import {
  ArmoryBulkActionsToolbarState,
  ArmoryBulkActionsToolbarStateInput,
} from '../../interfaces/item/armory-bulk-actions-toolbar-state.interface';
import { SelectOption } from '../../types/select-option.types';
import { armoryStorageSlotLabel } from '../armory-inventory-filter';

export function selectedArmoryInventoryItems(
  visibleItems: readonly PlayerArmoryItemReadModel[],
  selectedItemIds: readonly string[],
): PlayerArmoryItemReadModel[] {
  const visibleItemsById = new Map(
    visibleItems.map((item) => [item.itemId, item]),
  );

  return selectedItemIds
    .map((itemId) => visibleItemsById.get(itemId) ?? null)
    .filter((item): item is PlayerArmoryItemReadModel => item !== null);
}

export function armoryMoveDestinationOptions(
  shelves: readonly PlayerArmoryStorageSlotReadModel[],
  selectedItems: readonly PlayerArmoryItemReadModel[],
): Array<SelectOption<number>> {
  const selectedPositions = new Set(
    selectedItems.map((item) => item.storagePosition),
  );

  return shelves
    .filter((shelf) =>
      shelf.isPersisted
      && !shelf.isUnsortedDropArea
      && (
        selectedItems.length === 0
        || selectedPositions.size !== 1
        || !selectedPositions.has(shelf.position)
      ),
    )
    .map((shelf) => ({
      label: armoryStorageSlotLabel(shelf),
      value: shelf.position,
    }));
}

export function armoryBulkToolbarState(
  input: ArmoryBulkActionsToolbarStateInput,
): ArmoryBulkActionsToolbarState {
  return {
    selectedCount: input.selectedCount,
    drachmaValue: input.drachmaValue,
    selectedCountLabel: input.inventoryCopy.selectedCountLabel,
    selectedValueLabel: input.inventoryCopy.selectedValueLabel,
    actionBusyLabel: input.inventoryCopy.actionBusyLabel,
    equipLabel: input.equipLabel,
    sellLabel: input.sellLabel,
    moveTargetPlaceholder: input.inventoryCopy.moveTargetPlaceholder,
    moveSelectedLabel: input.inventoryCopy.moveSelectedLabel,
    canEquip: input.canEquip,
    canSell: input.canSell,
    canMove: input.canMove,
    moveDestinationOptions: input.moveDestinationOptions,
    isActionBusy: input.isActionBusy,
  };
}
