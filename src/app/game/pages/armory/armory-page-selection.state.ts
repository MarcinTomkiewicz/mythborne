import { Injectable, signal } from '@angular/core';
import { EquipmentPreviewSlotRow } from '../../../core/domain/equipment/equipment-preview.model';

@Injectable()
export class ArmoryPageSelectionState {
  readonly selectedEquippedItemIds = signal<readonly string[]>([]);
  readonly selectedInventoryItemIds = signal<readonly string[]>([]);

  toggleEquippedItemSelection(row: EquipmentPreviewSlotRow): void {
    const itemId = row.item?.itemId;

    if (!itemId) {
      return;
    }

    this.selectedEquippedItemIds.update((selectedIds) =>
      selectedIds.includes(itemId)
        ? selectedIds.filter((selectedId) => selectedId !== itemId)
        : [...selectedIds, itemId],
    );
  }

  clearEquipmentSelectionAfterMutation(): void {
    this.selectedEquippedItemIds.set([]);
  }

  clearAllSelectionAfterInventoryMutation(): void {
    this.selectedEquippedItemIds.set([]);
    this.selectedInventoryItemIds.set([]);
  }
}
