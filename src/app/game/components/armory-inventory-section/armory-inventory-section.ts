import { Component, computed, effect, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import {
  ItemDetailPopoverCopy,
} from '../../../core/domain/item/item-detail-popover.model';
import {
  PlayerArmoryPageCopyFilters,
  PlayerArmoryPageCopyInventory,
  PlayerArmoryPageCopySearch,
  PlayerArmoryItemReadModel,
  PlayerArmoryStorageSlotReadModel,
} from '../../../core/domain/item/player-armory-page-context.model';
import { ArmoryBulkActionsToolbarState } from '../../../core/interfaces/item/armory-bulk-actions-toolbar-state.interface';
import {
  ARMORY_INVENTORY_ALL_FILTER_VALUE,
  armoryAvailabilityFilterOptions,
  armorySlotFilterOptions,
  armoryStorageSlotFilterOptions,
  armoryItemMetadata,
  armoryStorageSlotLabel,
  filterArmoryShelves,
} from '../../../core/utils/armory-inventory-filter';
import { normalizeSearchText } from '../../../core/utils/normalize-text';
import { polishCountTemplateLabel } from '../../../core/utils/number';
import { InlineTextEdit } from '../../../shared/inline-text-edit/inline-text-edit';
import { SelectOption } from '../../../core/types/select-option.types';
import { ArmoryInventoryFilterBar } from '../armory-inventory-filter-bar/armory-inventory-filter-bar';
import { ArmoryBulkActionsToolbar } from '../armory-bulk-actions-toolbar/armory-bulk-actions-toolbar';
import { ItemDetailPopover } from '../../../shared/item-detail-popover/item-detail-popover';

@Component({
  selector: 'app-armory-inventory-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ArmoryBulkActionsToolbar,
    ArmoryInventoryFilterBar,
    ButtonModule,
    InlineTextEdit,
    ItemDetailPopover,
  ],
  templateUrl: './armory-inventory-section.html',
})
export class ArmoryInventorySection {
  readonly title = input.required<string>();
  readonly shelves = input.required<readonly PlayerArmoryStorageSlotReadModel[]>();
  readonly searchCopy = input.required<PlayerArmoryPageCopySearch>();
  readonly filtersCopy = input.required<PlayerArmoryPageCopyFilters>();
  readonly inventoryCopy = input.required<PlayerArmoryPageCopyInventory>();
  readonly itemDetailCopy = input.required<ItemDetailPopoverCopy>();
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
  readonly bulkMoveItems = output<{
    itemIds: readonly string[];
    targetShelfPosition: number;
  }>();
  readonly selectedItemIdsChange = output<readonly string[]>();
  readonly renameShelf = output<{ shelfPosition: number; name: string }>();
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
  readonly shelfRows = computed(() =>
    this.visibleShelves().map((shelf) => {
      const visibleItemCount = shelf.visibleItems.length;

      return {
        ...shelf,
        controlName: shelfControlName(shelf.position),
        canRename: shelf.isPersisted && !shelf.isUnsortedDropArea,
        shelfCountLabel: polishCountTemplateLabel(
          visibleItemCount,
          this.inventoryCopy().shelfCount,
        ),
      };
    }),
  );
  readonly visibleItems = computed(() =>
    this.visibleShelves().flatMap((shelf) => shelf.visibleItems),
  );
  readonly selectedVisibleItems = computed(() => {
    const visibleItemsById = new Map(
      this.visibleItems().map((item) => [item.itemId, item]),
    );

    return this.selectedItemIds()
      .map((itemId) => visibleItemsById.get(itemId) ?? null)
      .filter((item): item is PlayerArmoryItemReadModel => item !== null);
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
    this.selectedVisibleItems().reduce(
      (total, item) => total + (item.drachmaValue ?? 0),
      0,
    ),
  );
  readonly moveDestinationOptions = computed<Array<SelectOption<number>>>(() => {
    const selectedItems = this.selectedVisibleItems();
    const selectedPositions = new Set(
      selectedItems.map((item) => item.shelfPosition),
    );

    return this.shelves()
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
  });
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
  readonly bulkToolbarState = computed<ArmoryBulkActionsToolbarState>(() => {
    const inventoryCopy = this.inventoryCopy();

    return {
      selectedCount: this.selectedVisibleItems().length,
      drachmaValue: this.selectedVisibleDrachmaValue(),
      selectedCountLabel: inventoryCopy.selectedCountLabel,
      selectedValueLabel: inventoryCopy.selectedValueLabel,
      actionBusyLabel: inventoryCopy.actionBusyLabel,
      equipLabel: this.bulkEquipItemLabel(),
      sellLabel: this.bulkSellItemLabel(),
      moveTargetPlaceholder: inventoryCopy.moveTargetPlaceholder,
      moveSelectedLabel: inventoryCopy.moveSelectedLabel,
      canEquip: this.canBulkEquipSelected(),
      canSell: this.canBulkSellSelected(),
      canMove: this.canBulkMoveSelected(),
      moveDestinationOptions: this.moveDestinationOptions(),
      isActionBusy: this.actionDisabled(),
    };
  });
  private readonly searchTerm = computed(() =>
    normalizeSearchText(this.searchValue()),
  );
  readonly itemMetadata = armoryItemMetadata;
  private readonly syncShelfForms = effect(() =>
    this.syncShelfNameForms(this.shelves()),
  );

  shelfTitle(shelf: PlayerArmoryStorageSlotReadModel): string {
    return armoryStorageSlotLabel(shelf);
  }

  canEquipItem(item: PlayerArmoryItemReadModel): boolean {
    return item.lifecycleStatusKey !== 'scrapped';
  }

  canSellItem(item: PlayerArmoryItemReadModel): boolean {
    return item.lifecycleStatusKey === 'active';
  }

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

  private syncShelfNameForms(
    shelves: readonly PlayerArmoryStorageSlotReadModel[],
  ): void {
    const editableShelves = shelves.filter((shelf) =>
      shelf.isPersisted && !shelf.isUnsortedDropArea,
    );
    const controlNames = new Set(
      editableShelves.map((shelf) => shelfControlName(shelf.position)),
    );

    for (const shelf of editableShelves) {
      this.ensureShelfNameControl(shelf);
    }

    for (const controlName of Object.keys(this.shelfNameForm.controls)) {
      if (!controlNames.has(controlName)) {
        this.shelfNameForm.removeControl(controlName, { emitEvent: false });
      }
    }
  }

  private ensureShelfNameControl(shelf: PlayerArmoryStorageSlotReadModel): void {
    const controlName = shelfControlName(shelf.position);
    const currentControl = this.shelfNameForm.controls[controlName];

    if (currentControl) {
      if (!currentControl.dirty && currentControl.value !== shelf.displayName) {
        currentControl.setValue(shelf.displayName, { emitEvent: false });
      }
      return;
    }

    this.shelfNameForm.addControl(
      controlName,
      new FormControl<string>(shelf.displayName, { nonNullable: true }),
      { emitEvent: false },
    );
  }

}

function shelfControlName(position: number): string {
  return `shelf_${position}`;
}
