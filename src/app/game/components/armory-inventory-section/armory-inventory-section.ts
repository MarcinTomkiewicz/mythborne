import { Component, computed, effect, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import {
  PlayerArmoryPageCopyFilters,
  PlayerArmoryPageCopyInventory,
  PlayerArmoryPageCopySearch,
  PlayerArmoryItemReadModel,
  PlayerArmoryStorageSlotReadModel,
} from '../../../core/domain/item/player-armory-page-context.model';
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
import { InlineTextEdit } from '../../../shared/inline-text-edit/inline-text-edit';

@Component({
  selector: 'app-armory-inventory-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InlineTextEdit,
    InputTextModule,
    SelectModule,
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
  readonly sellItemLabel = input.required<string>();
  readonly renameStorageSlotLabel = input.required<string>();
  readonly cancelLabel = input.required<string>();
  readonly actionDisabled = input(false);
  readonly equipItem = output<PlayerArmoryItemReadModel>();
  readonly sellItem = output<PlayerArmoryItemReadModel>();
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
    this.visibleShelves().map((shelf) => ({
      ...shelf,
      controlName: shelfControlName(shelf.position),
      canRename: shelf.isPersisted && !shelf.isUnsortedDropArea,
    })),
  );
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
