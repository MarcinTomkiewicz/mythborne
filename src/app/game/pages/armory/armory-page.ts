import { Component, OnInit, computed, inject } from '@angular/core';
import {
  ArmorySummaryRowKey,
  ARMORY_SUMMARY_ROW_CONFIG,
} from '../../../core/configs/armory-summary-rows.config';
import {
  PlayerArmoryItemReadModel,
} from '../../../core/domain/item/player-armory-page-context.model';
import {
  mapArmoryPageEquipmentPreviewRows,
} from '../../../core/domain/item/player-armory-page-helpers';
import { GamePageSummaryRow } from '../../../core/interfaces/game-page-summary-row.interface';
import {
  ArmoryBulkMoveInventoryItemsInput,
  ArmoryRenameInventoryShelfInput,
} from '../../../core/interfaces/item/armory-page-actions.interface';
import { ArmoryPageFacade } from '../../../core/services/items/armory-page.facade';
import {
  ArmoryPageEquipmentMutationState,
} from '../../../core/services/items/armory-page-equipment-mutation.state';
import {
  ArmoryPageInventoryMutationState,
} from '../../../core/services/items/armory-page-inventory-mutation.state';
import { ArmoryInventorySection } from '../../components/armory-inventory-section/armory-inventory-section';
import { LoadoutPresetManagement } from '../../components/loadout-preset-management/loadout-preset-management';
import { EquipmentPreview } from '../../../shared/equipment-preview/equipment-preview';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { StructuredConfirmDialog } from '../../../shared/structured-confirm-dialog/structured-confirm-dialog';
import { ArmoryPageSellConfirmationState } from './armory-page-sell-confirmation.state';
import { ArmoryPageSelectionState } from './armory-page-selection.state';

@Component({
  selector: 'app-armory-page',
  standalone: true,
  imports: [
    LoadingOverlay,
    StructuredConfirmDialog,
    GamePageHeader,
    EquipmentPreview,
    LoadoutPresetManagement,
    ArmoryInventorySection,
  ],
  providers: [
    ArmoryPageFacade,
    ArmoryPageEquipmentMutationState,
    ArmoryPageInventoryMutationState,
    ArmoryPageSellConfirmationState,
    ArmoryPageSelectionState,
  ],
  templateUrl: './armory-page.html',
  host: { class: 'd-block w-100' },
})
export class ArmoryPage implements OnInit {
  readonly page = inject(ArmoryPageFacade);
  readonly sellConfirmation = inject(ArmoryPageSellConfirmationState);
  readonly selection = inject(ArmoryPageSelectionState);
  readonly isScreenLoading = computed(() =>
    this.page.status() !== 'error'
    && (
      this.page.status() !== 'loaded'
      || this.page.isEquipmentMutating()
      || this.page.isInventoryMutating()
    ),
  );
  readonly inventoryActionDisabled = computed(() =>
    this.page.isEquipmentMutating() || this.page.isInventoryMutating(),
  );
  readonly equippedItemCount = computed(() =>
    this.page.equipmentSlots().filter((slot) => slot.hasItem).length,
  );
  readonly equipmentPreviewRows = computed(() =>
    mapArmoryPageEquipmentPreviewRows(this.page.equipmentSlots()),
  );
  readonly savedLoadoutCount = computed(() =>
    this.page.loadoutPresets().filter((preset) => preset.savedAt !== null).length,
  );
  readonly summaryRows = computed<readonly GamePageSummaryRow[]>(() => {
    const context = this.page.context();

    if (!context) {
      return [];
    }

    const summary = context.copyJson.summary;
    const visibility = context.readModel.visibility;
    const values: Record<ArmorySummaryRowKey, number> = {
      capacity: visibility.visibilityLimit,
      allItems: visibility.totalOwnedItemCount,
      equippedItems: this.equippedItemCount(),
      savedSets: this.savedLoadoutCount(),
    };

    return ARMORY_SUMMARY_ROW_CONFIG.map((row) => ({
      key: row.key,
      label: summary[row.labelKey],
      value: values[row.key],
    }));
  });

  ngOnInit(): void {
    this.page.loadData();
  }

  unequipSelectedItems(): void {
    const selectedIds = this.selection.selectedEquippedItemIds();

    if (!selectedIds.length) {
      return;
    }

    this.page.bulkUnequipEquipmentItems(
      selectedIds,
      () => this.selection.clearEquipmentSelectionAfterMutation(),
    );
  }

  unequipAllItems(): void {
    const equippedItemIds = this.equipmentPreviewRows()
      .flatMap((row) => row.item ? [row.item.itemId] : []);

    if (!equippedItemIds.length) {
      return;
    }

    this.page.bulkUnequipEquipmentItems(
      equippedItemIds,
      () => this.selection.clearEquipmentSelectionAfterMutation(),
    );
  }

  equipInventoryItem(item: PlayerArmoryItemReadModel): void {
    if (this.inventoryActionDisabled()) {
      return;
    }

    this.page.equipInventoryItem(
      item.itemId,
      () => this.selection.clearAllSelectionAfterInventoryMutation(),
    );
  }

  bulkEquipInventoryItems(itemIds: readonly string[]): void {
    if (this.inventoryActionDisabled() || !itemIds.length) {
      return;
    }

    this.page.bulkEquipInventoryItems(
      itemIds,
      () => this.selection.clearAllSelectionAfterInventoryMutation(),
    );
  }

  bulkSellInventoryItems(itemIds: readonly string[]): void {
    const context = this.page.context();
    const copy = context?.copyJson;

    if (this.inventoryActionDisabled() || !context || !copy || !itemIds.length) {
      return;
    }

    const selectedItems = this.page.vendorScrapSelection(itemIds);

    if (!selectedItems) {
      return;
    }

    this.sellConfirmation.confirmSelectedItems(
      copy,
      selectedItems,
      () => this.sellInventoryItems(selectedItems),
    );
  }

  private sellInventoryItems(
    items: readonly PlayerArmoryItemReadModel[],
  ): void {
    if (this.inventoryActionDisabled() || !items.length) {
      return;
    }

    const selectedItems = this.page.vendorScrapSelection(items.map((item) => item.itemId));

    if (!selectedItems || selectedItems.length !== items.length) {
      return;
    }

    this.page.bulkVendorScrapInventoryItems(
      selectedItems.map((item) => item.itemId),
      () => this.selection.clearAllSelectionAfterInventoryMutation(),
    );
  }

  bulkMoveInventoryItems(input: ArmoryBulkMoveInventoryItemsInput): void {
    if (this.inventoryActionDisabled() || !input.itemIds.length) {
      return;
    }

    this.page.bulkMoveInventoryItems(input, () =>
      this.selection.clearAllSelectionAfterInventoryMutation(),
    );
  }

  confirmSellInventoryItem(item: PlayerArmoryItemReadModel): void {
    const copy = this.page.context()?.copyJson;

    if (this.inventoryActionDisabled() || !copy) {
      return;
    }
    const selectedItems = this.page.vendorScrapSelection([item.itemId]);

    if (!selectedItems || selectedItems.length !== 1) {
      return;
    }

    this.sellConfirmation.confirmItem(copy, selectedItems[0], () =>
      this.sellInventoryItem(selectedItems[0]),
    );
  }

  clearSellItemConfirmationMessage(): void {
    this.sellConfirmation.clear();
  }

  renameInventoryShelf(input: ArmoryRenameInventoryShelfInput): void {
    const context = this.page.context();

    if (this.inventoryActionDisabled() || !context) {
      return;
    }

    this.page.renameInventoryShelf(input, () =>
      this.selection.clearAllSelectionAfterInventoryMutation(),
    );
  }

  private sellInventoryItem(item: PlayerArmoryItemReadModel): void {
    if (this.inventoryActionDisabled()) {
      return;
    }

    this.page.vendorScrapInventoryItem(
      item.itemId,
      () => this.selection.clearAllSelectionAfterInventoryMutation(),
    );
  }
}
