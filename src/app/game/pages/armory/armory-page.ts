import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import {
  ArmorySummaryRowKey,
  ARMORY_SUMMARY_ROW_CONFIG,
} from '../../../core/configs/armory-summary-rows.config';
import { EquipmentPreviewSlotRow } from '../../../core/domain/equipment/equipment-preview.model';
import {
  PlayerArmoryItemReadModel,
} from '../../../core/domain/item/player-armory-page-context.model';
import {
  buildSellItemConfirmationSegments,
  buildSellSelectedConfirmationSegments,
  canEquipInventoryItem,
  canVendorScrapInventoryItem,
  mapArmoryPageEquipmentPreviewRows,
  plainStructuredConfirmMessage,
  visibleArmoryItemsById,
} from '../../../core/domain/item/player-armory-page-helpers';
import type {
  StructuredConfirmDialogSegment,
} from '../../../core/interfaces/structured-confirm-dialog-segment.interface';
import { GamePageSummaryRow } from '../../../core/interfaces/game-page-summary-row.interface';
import {
  ArmoryBulkMoveInventoryItemsInput,
  ArmoryRenameInventoryShelfInput,
} from '../../../core/interfaces/item/armory-page-actions.interface';
import { ArmoryPageFacade } from '../../../core/services/items/armory-page.facade';
import { CurrentEquipmentState } from '../../../core/services/items/current-equipment.state';
import { ArmoryInventorySection } from '../../components/armory-inventory-section/armory-inventory-section';
import { LoadoutPresetManagement } from '../../components/loadout-preset-management/loadout-preset-management';
import { EquipmentPreview } from '../../../shared/equipment-preview/equipment-preview';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { StructuredConfirmDialog } from '../../../shared/structured-confirm-dialog/structured-confirm-dialog';

const ARMORY_SELL_ITEM_CONFIRMATION_KEY = 'armory-sell-item';

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
  providers: [ArmoryPageFacade, CurrentEquipmentState],
  templateUrl: './armory-page.html',
  host: { class: 'd-block w-100' },
})
export class ArmoryPage implements OnInit {
  private readonly confirmationService = inject(ConfirmationService);
  readonly page = inject(ArmoryPageFacade);
  readonly equipment = inject(CurrentEquipmentState);
  readonly selectedEquippedItemIds = signal<readonly string[]>([]);
  readonly selectedInventoryItemIds = signal<readonly string[]>([]);
  readonly sellItemConfirmationSegments =
    signal<readonly StructuredConfirmDialogSegment[]>([]);
  readonly isScreenLoading = computed(() =>
    this.page.status() !== 'error'
    && (
      this.page.status() !== 'loaded'
      || this.equipment.isMutating()
      || this.page.isInventoryMutating()
    ),
  );
  readonly inventoryActionDisabled = computed(() =>
    this.equipment.isMutating() || this.page.isInventoryMutating(),
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

  unequipSelectedItems(): void {
    const selectedIds = this.selectedEquippedItemIds();

    if (!selectedIds.length) {
      return;
    }

    this.equipment.bulkUnequipItems({
      items: selectedIds.map((itemId) => ({ itemId })),
    }, () => this.refreshAfterEquipmentMutation());
  }

  unequipAllItems(): void {
    const equippedItemIds = this.equipmentPreviewRows()
      .flatMap((row) => row.item ? [row.item.itemId] : []);

    if (!equippedItemIds.length) {
      return;
    }

    this.equipment.bulkUnequipItems({
      items: equippedItemIds.map((itemId) => ({ itemId })),
    }, () => this.refreshAfterEquipmentMutation());
  }

  equipInventoryItem(item: PlayerArmoryItemReadModel): void {
    if (this.inventoryActionDisabled() || !canEquipInventoryItem(item)) {
      return;
    }

    this.equipment.equipItem(
      { itemId: item.itemId },
      () => this.refreshAfterInventoryMutation(),
    );
  }

  bulkEquipInventoryItems(itemIds: readonly string[]): void {
    const context = this.page.context();

    if (this.inventoryActionDisabled() || !context || !itemIds.length) {
      return;
    }

    const selectedItems = visibleArmoryItemsById(context, itemIds);

    if (
      selectedItems.length !== itemIds.length
      || selectedItems.some((item) => !canEquipInventoryItem(item))
    ) {
      return;
    }

    this.equipment.bulkEquipItems({
      items: selectedItems.map((item) => ({ itemId: item.itemId })),
    }, () => this.refreshAfterInventoryMutation());
  }

  bulkSellInventoryItems(itemIds: readonly string[]): void {
    const context = this.page.context();
    const copy = context?.copyJson;

    if (this.inventoryActionDisabled() || !context || !copy || !itemIds.length) {
      return;
    }

    const selectedItems = visibleArmoryItemsById(context, itemIds);

    if (
      selectedItems.length !== itemIds.length
      || selectedItems.some((item) => !canVendorScrapInventoryItem(item))
    ) {
      return;
    }

    const messageSegments = buildSellSelectedConfirmationSegments(
      copy.confirmations.sellSelectedMessageParts,
      copy.confirmations.sellSelectedHighlightFields,
      selectedItems,
    );

    if (!messageSegments.length) {
      return;
    }

    this.sellItemConfirmationSegments.set(messageSegments);
    this.confirmationService.confirm({
      key: ARMORY_SELL_ITEM_CONFIRMATION_KEY,
      header: copy.confirmations.sellItemTitle,
      message: plainStructuredConfirmMessage(messageSegments),
      acceptLabel: copy.confirmations.confirmLabel,
      rejectLabel: copy.confirmations.cancelLabel,
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => this.sellInventoryItems(selectedItems),
      reject: () => this.clearSellItemConfirmationMessage(),
    });
  }

  private sellInventoryItems(
    items: readonly PlayerArmoryItemReadModel[],
  ): void {
    const context = this.page.context();

    if (this.inventoryActionDisabled() || !context || !items.length) {
      return;
    }

    const selectedItems = visibleArmoryItemsById(
      context,
      items.map((item) => item.itemId),
    );

    if (
      selectedItems.length !== items.length
      || selectedItems.some((item) => !canVendorScrapInventoryItem(item))
    ) {
      return;
    }

    this.page.bulkVendorScrapInventoryItems(
      selectedItems.map((item) => item.itemId),
      () => this.clearInventorySelectionAfterMutation(),
    );
  }

  bulkMoveInventoryItems(input: ArmoryBulkMoveInventoryItemsInput): void {
    const context = this.page.context();

    if (this.inventoryActionDisabled() || !context || !input.itemIds.length) {
      return;
    }

    const selectedItems = visibleArmoryItemsById(context, input.itemIds);
    const targetShelf = context.readModel.shelves.find((shelf) =>
      shelf.position === input.targetShelfPosition
      && shelf.isPersisted
      && !shelf.isUnsortedDropArea,
    );

    if (selectedItems.length !== input.itemIds.length || !targetShelf) {
      return;
    }

    this.page.bulkMoveInventoryItems(input, () =>
      this.clearInventorySelectionAfterMutation(),
    );
  }

  confirmSellInventoryItem(item: PlayerArmoryItemReadModel): void {
    const copy = this.page.context()?.copyJson;
    const valueDisplay = item.displayCore.valueDisplay?.displayValue;

    if (
      this.inventoryActionDisabled()
      || !canVendorScrapInventoryItem(item)
      || !copy
      || !valueDisplay
    ) {
      return;
    }

    const messageSegments = buildSellItemConfirmationSegments(
      copy.confirmations.sellItemMessageParts,
      copy.confirmations.sellItemHighlightFields,
      item.displayCore.itemName,
      valueDisplay,
    );

    this.sellItemConfirmationSegments.set(messageSegments);
    this.confirmationService.confirm({
      key: ARMORY_SELL_ITEM_CONFIRMATION_KEY,
      header: copy.confirmations.sellItemTitle,
      message: plainStructuredConfirmMessage(messageSegments),
      acceptLabel: copy.confirmations.confirmLabel,
      rejectLabel: copy.confirmations.cancelLabel,
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => this.sellInventoryItem(item),
      reject: () => this.clearSellItemConfirmationMessage(),
    });
  }

  clearSellItemConfirmationMessage(): void {
    this.sellItemConfirmationSegments.set([]);
  }

  renameInventoryShelf(input: ArmoryRenameInventoryShelfInput): void {
    const context = this.page.context();

    if (this.inventoryActionDisabled() || !context) {
      return;
    }

    this.page.renameInventoryShelf(input, () =>
      this.clearInventorySelectionAfterMutation(),
    );
  }

  private refreshAfterEquipmentMutation(): void {
    this.selectedEquippedItemIds.set([]);
    this.page.loadData();
  }

  private refreshAfterInventoryMutation(): void {
    this.clearInventorySelectionAfterMutation();
    this.page.loadData();
  }

  private clearInventorySelectionAfterMutation(): void {
    this.selectedEquippedItemIds.set([]);
    this.selectedInventoryItemIds.set([]);
  }

  private sellInventoryItem(item: PlayerArmoryItemReadModel): void {
    const context = this.page.context();

    if (
      this.inventoryActionDisabled()
      || !canVendorScrapInventoryItem(item)
      || !context
    ) {
      return;
    }

    this.page.vendorScrapInventoryItem(
      item.itemId,
      () => this.clearInventorySelectionAfterMutation(),
    );
  }
}
