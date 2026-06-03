import { Component, computed, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import {
  PlayerArmoryPageCopyFilters,
  PlayerArmoryPageCopyInventory,
  PlayerArmoryPageCopySearch,
} from '../../../core/domain/item/player-armory-page-context.model';
import { SelectOption } from '../../../core/types/select-option.types';

@Component({
  selector: 'app-armory-inventory-filter-bar',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    SelectModule,
  ],
  templateUrl: './armory-inventory-filter-bar.html',
})
export class ArmoryInventoryFilterBar {
  readonly searchControl = input.required<FormControl<string>>();
  readonly slotFilterControl = input.required<FormControl<string>>();
  readonly availabilityFilterControl = input.required<FormControl<string>>();
  readonly storageSlotFilterControl = input.required<FormControl<string>>();
  readonly searchCopy = input.required<PlayerArmoryPageCopySearch>();
  readonly filtersCopy = input.required<PlayerArmoryPageCopyFilters>();
  readonly inventoryCopy = input.required<PlayerArmoryPageCopyInventory>();
  readonly slotOptions = input.required<readonly SelectOption<string>[]>();
  readonly availabilityOptions = input.required<readonly SelectOption<string>[]>();
  readonly storageSlotOptions = input.required<readonly SelectOption<string>[]>();
  readonly hasFilters = input(false);
  readonly clearFilters = output<void>();

  readonly selectConfigs = computed(() => {
    const filtersCopy = this.filtersCopy();

    return [
      {
        key: 'slot',
        control: this.slotFilterControl(),
        options: [...this.slotOptions()],
        ariaLabel: filtersCopy.allSlots,
        placeholder: undefined,
      },
      {
        key: 'availability',
        control: this.availabilityFilterControl(),
        options: [...this.availabilityOptions()],
        ariaLabel: filtersCopy.allAvailability,
        placeholder: undefined,
      },
      {
        key: 'storageSlot',
        control: this.storageSlotFilterControl(),
        options: [...this.storageSlotOptions()],
        ariaLabel: filtersCopy.storageSlotPlaceholder,
        placeholder: filtersCopy.storageSlotPlaceholder,
      },
    ];
  });
}
