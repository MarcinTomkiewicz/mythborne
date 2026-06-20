import {
  PlayerArmoryPageCopyShelfCount,
  PlayerArmoryStorageSlotReadModel,
} from '../../domain/item/player-armory-page-context.model';
import { ArmoryInventoryShelfRow } from '../../interfaces/item/armory-inventory-section.interface';
import { armoryStorageSlotLabel } from '../armory-inventory-filter';
import { polishCountTemplateLabel } from '../number';

export function armoryInventoryShelfRows(
  shelves: readonly PlayerArmoryStorageSlotReadModel[],
  shelfCountCopy: PlayerArmoryPageCopyShelfCount,
): ArmoryInventoryShelfRow[] {
  return shelves.map((shelf) => {
    const visibleItemCount = shelf.visibleItems.length;

    return {
      ...shelf,
      controlName: armoryShelfControlName(shelf.position),
      canRename: shelf.isPersisted && !shelf.isUnsortedDropArea,
      shelfCountLabel: polishCountTemplateLabel(
        visibleItemCount,
        shelfCountCopy,
      ),
    };
  });
}

export function armoryShelfControlName(position: number): string {
  return `shelf_${position}`;
}
