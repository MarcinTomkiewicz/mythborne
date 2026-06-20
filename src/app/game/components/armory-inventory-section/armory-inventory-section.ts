import { Component, computed, effect, input, output } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import type {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import {
  PlayerArmoryPageCopyFilters,
  PlayerArmoryPageCopyInventory,
  PlayerArmoryPageCopySearch,
  PlayerArmoryItemReadModel,
  PlayerArmoryStorageSlotReadModel,
} from '../../../core/domain/item/player-armory-page-context.model';
import {
  canEquipInventoryItem,
  canVendorScrapInventoryItem,
  sumVendorScrapDrachmaValue,
} from '../../../core/domain/item/player-armory-page-helpers';
import {
  ArmoryInventoryDragData,
  ArmoryInventoryShelfRow,
} from '../../../core/interfaces/item/armory-inventory-section.interface';
import {
  ArmoryBulkMoveInventoryItemsInput,
  ArmoryRenameInventoryShelfInput,
} from '../../../core/interfaces/item/armory-page-actions.interface';
import {
  armoryAvailabilityFilterOptions,
  armorySlotFilterOptions,
  armoryStorageSlotFilterOptions,
  armoryItemMetadata,
  armoryStorageSlotLabel,
  filterArmoryShelves,
} from '../../../core/utils/armory-inventory-filter';
import {
  canReceiveArmoryShelfDrop,
  movedArmoryItemsForDraggedItem,
} from '../../../core/utils/armory/armory-inventory-drag-drop';
import {
  armoryInventoryShelfRows,
  armoryShelfControlName,
} from '../../../core/utils/armory/armory-inventory-shelf-rows';
import {
  armoryBulkToolbarState,
  armoryMoveDestinationOptions,
  selectedArmoryInventoryItems,
} from '../../../core/utils/armory/armory-inventory-selection-view';
import {
  syncArmoryShelfNameForms,
} from '../../../core/utils/armory/armory-shelf-form-controls';
import { ARMORY_INVENTORY_ALL_FILTER_VALUE } from '../../../core/constants/armory-inventory-filter.const';
import { normalizeSearchText } from '../../../core/utils/normalize-text';
import { InlineTextEdit } from '../../../shared/inline-text-edit/inline-text-edit';
import { ArmoryInventoryFilterBar } from '../armory-inventory-filter-bar/armory-inventory-filter-bar';
import { ArmoryBulkActionsToolbar } from '../armory-bulk-actions-toolbar/armory-bulk-actions-toolbar';
import { ArmoryItemDragPreview } from '../armory-item-drag-preview/armory-item-drag-preview';
import {
  ArmoryInventoryItemCard,
} from '../armory-inventory-item-card/armory-inventory-item-card';

@Component({
  selector: 'app-armory-inventory-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DragDropModule,
    ArmoryBulkActionsToolbar,
    ArmoryInventoryFilterBar,
    InlineTextEdit,
    ArmoryItemDragPreview,
    ArmoryInventoryItemCard,
  ],
  templateUrl: './armory-inventory-section.html',
})
export class ArmoryInventorySection {
  readonly title = input.required<string>();
  readonly shelves = input.required<readonly PlayerArmoryStorageSlotReadModel[]>();
  readonly searchCopy = input.required<PlayerArmoryPageCopySearch>();
  readonly filtersCopy = input.required<PlayerArmoryPageCopyFilters>();
  readonly inventoryCopy = input.required<PlayerArmoryPageCopyInventory>();
  readonly equipItemLabel = input.required<string>();
  readonly bulkEquipItemLabel = input.required<string>();
  readonly bulkSellItemLabel = input.required<string>();
  readonly sellItemLabel = input.required<string>();
  readonly renameStorageSlotLabel = input.required<string>();
  readonly cancelLabel = input.required<string>();
  readonly actionDisabled = input(false);
  readonly selectedItemIds = input<readonly string[]>([]);
  readonly equipItem = output<PlayerArmoryItemReadModel>();
  readonly sellItem = output<PlayerArmoryItemReadModel>();
  readonly bulkEquipItems = output<readonly string[]>();
  readonly bulkSellItems = output<readonly string[]>();
  readonly bulkMoveItems = output<ArmoryBulkMoveInventoryItemsInput>();
  readonly selectedItemIdsChange = output<readonly string[]>();
  readonly renameShelf = output<ArmoryRenameInventoryShelfInput>();
  readonly shelfNameForm = new FormRecord<FormControl<string>>({});
  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  readonly slotFilterControl = new FormControl<string>(ARMORY_INVENTORY_ALL_FILTER_VALUE, {
    nonNullable: true,
  });
  readonly availabilityFilterControl = new FormControl<string>(
    ARMORY_INVENTORY_ALL_FILTER_VALUE,
    { nonNullable: true },
  );
  readonly storageSlotFilterControl = new FormControl<string>(
    ARMORY_INVENTORY_ALL_FILTER_VALUE,
    { nonNullable: true },
  );
  private readonly searchValue = toSignal(this.searchControl.valueChanges, {
    initialValue: this.searchControl.value,
  });
  private readonly slotFilterValue = toSignal(this.slotFilterControl.valueChanges, {
    initialValue: this.slotFilterControl.value,
  });
  private readonly availabilityFilterValue = toSignal(
    this.availabilityFilterControl.valueChanges,
    { initialValue: this.availabilityFilterControl.value },
  );
  private readonly storageSlotFilterValue = toSignal(
    this.storageSlotFilterControl.valueChanges,
    { initialValue: this.storageSlotFilterControl.value },
  );
  readonly slotOptions = computed(() =>
    armorySlotFilterOptions(this.shelves(), this.filtersCopy().allSlots),
  );
  readonly availabilityOptions = computed(() =>
    armoryAvailabilityFilterOptions(
      this.filtersCopy().allAvailability,
      this.filtersCopy().availabilityOptions,
    ),
  );
  readonly storageSlotOptions = computed(() =>
    armoryStorageSlotFilterOptions(this.shelves(), this.filtersCopy().allStorageSlots),
  );
  readonly hasFilters = computed(() =>
    this.searchTerm().length > 0
    || this.slotFilterValue() !== ARMORY_INVENTORY_ALL_FILTER_VALUE
    || this.availabilityFilterValue() !== ARMORY_INVENTORY_ALL_FILTER_VALUE
    || this.storageSlotFilterValue() !== ARMORY_INVENTORY_ALL_FILTER_VALUE,
  );
  readonly visibleShelves = computed(() =>
    this.hasFilters()
      ? filterArmoryShelves(this.shelves(), {
          searchTerm: this.searchTerm(),
          slotKey: this.slotFilterValue(),
          availabilityKey: this.availabilityFilterValue(),
          storageSlotPosition: this.storageSlotFilterValue(),
        })
      : this.shelves(),
  );
  readonly shelfRows = computed<ArmoryInventoryShelfRow[]>(() =>
    armoryInventoryShelfRows(
      this.visibleShelves(),
      this.inventoryCopy().shelfCount,
    ),
  );
  readonly visibleItems = computed(() =>
    this.visibleShelves().flatMap((shelf) => shelf.visibleItems),
  );
  readonly selectedVisibleItems = computed(() => {
    return selectedArmoryInventoryItems(
      this.visibleItems(),
      this.selectedItemIds(),
    );
  });
  readonly selectedVisibleItemIds = computed(() =>
    this.selectedVisibleItems().map((item) => item.itemId),
  );
  readonly selectedVisibleEquippableItemIds = computed(() =>
    this.selectedVisibleItems()
      .filter((item) => this.canEquipItem(item))
      .map((item) => item.itemId),
  );
  readonly selectedVisibleSellableItemIds = computed(() =>
    this.selectedVisibleItems()
      .filter((item) => this.canSellItem(item))
      .map((item) => item.itemId),
  );
  readonly selectedVisibleDrachmaValue = computed(() =>
    sumVendorScrapDrachmaValue(this.selectedVisibleItems()),
  );
  readonly moveDestinationOptions = computed(() =>
    armoryMoveDestinationOptions(this.shelves(), this.selectedVisibleItems()),
  );
  readonly canBulkEquipSelected = computed(() =>
    this.selectedVisibleEquippableItemIds().length > 0,
  );
  readonly canBulkSellSelected = computed(() =>
    this.selectedVisibleSellableItemIds().length > 0,
  );
  readonly canBulkMoveSelected = computed(() =>
    this.selectedVisibleItemIds().length > 0
    && this.moveDestinationOptions().length > 0,
  );
  readonly bulkToolbarState = computed(() =>
    armoryBulkToolbarState({
      inventoryCopy: this.inventoryCopy(),
      selectedCount: this.selectedVisibleItems().length,
      drachmaValue: this.selectedVisibleDrachmaValue(),
      equipLabel: this.bulkEquipItemLabel(),
      sellLabel: this.bulkSellItemLabel(),
      canEquip: this.canBulkEquipSelected(),
      canSell: this.canBulkSellSelected(),
      canMove: this.canBulkMoveSelected(),
      moveDestinationOptions: this.moveDestinationOptions(),
      isActionBusy: this.actionDisabled(),
    }),
  );
  private readonly searchTerm = computed(() =>
    normalizeSearchText(this.searchValue()),
  );
  readonly shelfTitle = armoryStorageSlotLabel;
  readonly itemMetadata = armoryItemMetadata;
  readonly canEquipItem = canEquipInventoryItem;
  readonly canSellItem = canVendorScrapInventoryItem;
  readonly canEnterShelfDropList = (
    _drag: CdkDrag<ArmoryInventoryDragData>,
    drop: CdkDropList<ArmoryInventoryShelfRow>,
  ): boolean => !this.actionDisabled() && this.canReceiveDroppedItem(drop.data);
  readonly canReceiveDroppedItem = canReceiveArmoryShelfDrop;
  private readonly syncShelfForms = effect(() =>
    syncArmoryShelfNameForms(this.shelfNameForm, this.shelves()),
  );

  isItemSelected(item: PlayerArmoryItemReadModel): boolean {
    return this.selectedItemIds().includes(item.itemId);
  }

  toggleItemSelection(item: PlayerArmoryItemReadModel): void {
    const selectedIds = this.selectedItemIds();

    this.selectedItemIdsChange.emit(
      selectedIds.includes(item.itemId)
        ? selectedIds.filter((itemId) => itemId !== item.itemId)
        : [...selectedIds, item.itemId],
    );
  }

  equipSelectedItems(): void {
    if (!this.canBulkEquipSelected()) {
      return;
    }

    this.bulkEquipItems.emit(this.selectedVisibleEquippableItemIds());
  }

  sellSelectedItems(): void {
    if (!this.canBulkSellSelected()) {
      return;
    }

    this.bulkSellItems.emit(this.selectedVisibleSellableItemIds());
  }

  moveSelectedItems(targetShelfPosition: number): void {
    if (!this.canBulkMoveSelected()) {
      return;
    }

    this.bulkMoveItems.emit({
      itemIds: this.selectedVisibleItemIds(),
      targetShelfPosition,
    });
  }

  dragData(item: PlayerArmoryItemReadModel): ArmoryInventoryDragData {
    return { item };
  }

  draggedItems(item: PlayerArmoryItemReadModel): PlayerArmoryItemReadModel[] {
    return this.movedItemsForDraggedItem(item);
  }

  dropInventoryItem(
    event: CdkDragDrop<
      ArmoryInventoryShelfRow,
      ArmoryInventoryShelfRow,
      ArmoryInventoryDragData
    >,
  ): void {
    const targetShelf = event.container.data;
    const item = event.item.data.item;
    const movedItems = this.movedItemsForDraggedItem(item);

    if (
      this.actionDisabled()
      || !this.canReceiveDroppedItem(targetShelf)
      || movedItems.every((movedItem) => movedItem.storagePosition === targetShelf.position)
    ) {
      return;
    }

    this.bulkMoveItems.emit({
      itemIds: movedItems.map((movedItem) => movedItem.itemId),
      targetShelfPosition: targetShelf.position,
    });
  }

  submitShelfRename(
    shelf: PlayerArmoryStorageSlotReadModel,
    name: string,
  ): void {
    this.renameShelf.emit({
      shelfPosition: shelf.position,
      name,
    });
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.slotFilterControl.setValue(ARMORY_INVENTORY_ALL_FILTER_VALUE);
    this.availabilityFilterControl.setValue(ARMORY_INVENTORY_ALL_FILTER_VALUE);
    this.storageSlotFilterControl.setValue(ARMORY_INVENTORY_ALL_FILTER_VALUE);
  }

  private movedItemsForDraggedItem(
    item: PlayerArmoryItemReadModel,
  ): PlayerArmoryItemReadModel[] {
    return movedArmoryItemsForDraggedItem(item, this.selectedVisibleItems());
  }

}
