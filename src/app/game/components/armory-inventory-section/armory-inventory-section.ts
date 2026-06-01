import { Component, computed, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import {
  PlayerArmoryPageCopyFilters,
  PlayerArmoryPageCopyInventory,
  PlayerArmoryPageCopySearch,
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

@Component({
  selector: 'app-armory-inventory-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
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
  private readonly searchTerm = computed(() =>
    normalizeSearchText(this.searchValue()),
  );
  readonly itemMetadata = armoryItemMetadata;

  shelfTitle(shelf: PlayerArmoryStorageSlotReadModel): string {
    return armoryStorageSlotLabel(shelf);
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.slotFilterControl.setValue(ARMORY_INVENTORY_ALL_FILTER_VALUE);
    this.availabilityFilterControl.setValue(ARMORY_INVENTORY_ALL_FILTER_VALUE);
    this.storageSlotFilterControl.setValue(ARMORY_INVENTORY_ALL_FILTER_VALUE);
  }
}
