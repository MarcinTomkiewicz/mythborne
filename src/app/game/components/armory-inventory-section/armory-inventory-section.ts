import { Component, computed, effect, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InplaceModule } from 'primeng/inplace';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import {
  ArmoryItemSummary,
  ArmoryShelfReadModel,
  EquipmentSlot,
} from '../../../core/domain/item/item-equipment.model';
import { RenameArmoryShelfInput } from '../../../core/interfaces/item/armory-actions.interface';
import {
  ArmoryInventoryAvailabilityFilterValue,
} from '../../../core/types/armory-inventory-filter.types';
import {
  ARMORY_AVAILABILITY_FILTER_OPTIONS,
} from '../../../core/constants/armory-inventory-filter.const';
import {
  armorySlotFilterOptions,
  filterArmoryItems,
  filteredArmoryShelves,
  armoryItemMetadata,
} from '../../../core/utils/armory-inventory-filter';
import { ArmoryBulkActionsToolbar } from '../armory-bulk-actions-toolbar/armory-bulk-actions-toolbar';
import { ArmoryGuildItemUsage } from '../../../core/interfaces/item/armory-guild-item-usage.interface';
import { normalizeSearchText } from '../../../core/utils/normalize-text';
import { ArmoryItemDetailPopover } from '../armory-item-detail-popover/armory-item-detail-popover';
import { armoryItemIconClass } from '../../../core/domain/equipment/equipment-preview.mapper';
import {
  itemLifecycleStatusBadgeClass,
  itemLifecycleStatusLabel,
} from '../../../core/utils/item-lifecycle-display';
import { highlightTextParts } from '../../../core/utils/text-highlight';
import { TextHighlightPart } from '../../../core/types/text-highlight.types';

@Component({
  selector: 'app-armory-inventory-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InplaceModule,
    InputTextModule,
    SelectModule,
    ArmoryBulkActionsToolbar,
    ArmoryItemDetailPopover,
  ],
  templateUrl: './armory-inventory-section.html',
})
export class ArmoryInventorySection {
  readonly shelves = input.required<readonly ArmoryShelfReadModel[]>();
  readonly items = input.required<readonly ArmoryItemSummary[]>();
  readonly equipmentSlots = input.required<readonly EquipmentSlot[]>();
  readonly armoryError = input<string | null>(null);
  readonly guildError = input<string | null>(null);
  readonly isActionBusy = input(false);
  readonly guildItemUsage = input.required<(item: ArmoryItemSummary) => ArmoryGuildItemUsage>();
  readonly canUsePrivateItemActions = input.required<(item: ArmoryItemSummary) => boolean>();
  readonly equipItem = output<ArmoryItemSummary>();
  readonly sellItem = output<ArmoryItemSummary>();
  readonly renameShelf = output<RenameArmoryShelfInput>();
  readonly bulkEquipSelected = output<readonly ArmoryItemSummary[]>();
  readonly bulkSellSelected = output<readonly ArmoryItemSummary[]>();
  readonly selectedBulkItemIds = signal<string[]>([]);
  readonly armoryItemIconClass = armoryItemIconClass;
  readonly armoryItemMetadata = armoryItemMetadata;
  readonly itemLifecycleStatusBadgeClass = itemLifecycleStatusBadgeClass;
  readonly itemLifecycleStatusLabel = itemLifecycleStatusLabel;
  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  readonly slotFilterControl = new FormControl<string>('all', { nonNullable: true });
  readonly availabilityFilterControl =
    new FormControl<ArmoryInventoryAvailabilityFilterValue>('all', {
      nonNullable: true,
    });
  readonly renameStandForm = new FormRecord<FormControl<string>>({});
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
  readonly slotOptions = computed(() => armorySlotFilterOptions(this.equipmentSlots()));
  readonly availabilityOptions = ARMORY_AVAILABILITY_FILTER_OPTIONS;
  readonly hasFilters = computed(() =>
    this.searchTerm().length > 0
    || this.slotFilterValue() !== 'all'
    || this.availabilityFilterValue() !== 'all',
  );
  readonly filteredItems = computed(() =>
    filterArmoryItems(
      this.items(),
      {
        searchTerm: this.searchTerm(),
        slotKey: this.slotFilterValue(),
        availability: this.availabilityFilterValue(),
      },
    ),
  );
  readonly visibleShelves = computed(() =>
    this.hasFilters()
      ? filteredArmoryShelves(this.shelves(), this.filteredItems())
      : this.shelves(),
  );
  readonly selectedBulkItems = computed(() => {
    const selectedIds = this.selectedBulkItemIds();
    const itemsById = new Map(this.filteredItems().map((item) => [item.itemId, item]));

    return selectedIds.flatMap((itemId) => {
      const item = itemsById.get(itemId);
      return item ? [item] : [];
    }).filter((item) => this.canUsePrivateItemActions()(item));
  });
  readonly selectedBulkSellableItems = computed(() =>
    this.selectedBulkItems().filter((item) => this.canUseLifecycleActions(item)),
  );
  readonly selectedBulkSellSummary = computed(() => {
    const items = this.selectedBulkSellableItems();

    return {
      count: items.length,
      drachmaValue: items.reduce(
        (total, item) => total + (item.drachmaValue ?? 0),
        0,
      ),
    };
  });
  readonly searchTerm = computed(() =>
    normalizeSearchText(this.searchValue()),
  );
  private readonly syncSelection = effect(() =>
    this.pruneBulkSelection(this.filteredItems()),
  );
  private readonly syncRenameStandForms = effect(() =>
    this.syncStandRenameControls(this.visibleShelves()),
  );

  clearFilters(): void {
    this.searchControl.setValue('');
    this.slotFilterControl.setValue('all');
    this.availabilityFilterControl.setValue('all');
  }

  canBulkVendorScrapSelectedItems(): boolean {
    return this.selectedBulkSellSummary().count > 0;
  }

  toggleBulkItemSelection(item: ArmoryItemSummary): void {
    if (!this.canUsePrivateItemActions()(item)) {
      return;
    }

    const currentIds = this.selectedBulkItemIds();
    this.selectedBulkItemIds.set(
      currentIds.includes(item.itemId)
        ? currentIds.filter((itemId) => itemId !== item.itemId)
        : [...currentIds, item.itemId],
    );
  }

  emitBulkEquipSelectedItems(): void {
    const items = this.selectedBulkItems();

    if (items.length) {
      this.bulkEquipSelected.emit(items);
    }
  }

  emitBulkSellSelectedItems(): void {
    const items = this.selectedBulkSellableItems();

    if (items.length) {
      this.bulkSellSelected.emit(items);
    }
  }

  shelfLabel(shelf: ArmoryShelfReadModel): string {
    return shelf.isUnsortedDropArea ? shelf.name || 'Unsorted' : shelf.name;
  }

  renameStandActionIsCancel(control: FormControl<string>): boolean {
    return control.pristine || control.value.trim().length === 0;
  }

  renameStandActionIcon(control: FormControl<string>): string {
    return this.renameStandActionIsCancel(control)
      ? 'pi pi-interdiction'
      : 'pi pi-scroll-quill';
  }

  renameStandActionSeverity(control: FormControl<string>): 'danger' | 'secondary' {
    return this.renameStandActionIsCancel(control) ? 'danger' : 'secondary';
  }

  renameStandActionLabel(control: FormControl<string>): string {
    return this.renameStandActionIsCancel(control) ? 'Cancel' : 'Rename stand';
  }

  handleRenameStandInplaceAction(
    shelf: ArmoryShelfReadModel,
    control: FormControl<string>,
    closeCallback: (event?: Event) => void,
    event: Event,
  ): void {
    if (this.renameStandActionIsCancel(control)) {
      this.resetRenameStandControl(shelf, control);
      closeCallback(event);
      return;
    }

    this.renameShelf.emit({
      shelfPosition: shelf.position,
      newName: control.value.trim(),
    });
    control.markAsPristine();
    closeCallback(event);
  }

  isBulkItemSelected(item: ArmoryItemSummary): boolean {
    return this.selectedBulkItemIds().includes(item.itemId);
  }

  highlightedText(value: string): TextHighlightPart[] {
    return highlightTextParts(value, this.searchTerm());
  }

  canUseLifecycleActions(item: ArmoryItemSummary): boolean {
    return item.lifecycleStatus === 'active'
      && this.canUsePrivateItemActions()(item);
  }

  private pruneBulkSelection(items: readonly ArmoryItemSummary[]): void {
    const visibleItemIds = new Set(items.map((item) => item.itemId));
    const selectedIds = this.selectedBulkItemIds();
    const visibleSelectedIds = selectedIds.filter((itemId) =>
      visibleItemIds.has(itemId),
    );

    if (visibleSelectedIds.length !== selectedIds.length) {
      this.selectedBulkItemIds.set(visibleSelectedIds);
    }
  }

  private syncStandRenameControls(shelves: readonly ArmoryShelfReadModel[]): void {
    const editableShelfKeys = new Set(
      shelves
        .filter((shelf) => shelf.isPersisted && !shelf.isUnsortedDropArea)
        .map(renameStandControlKey),
    );

    for (const shelf of shelves) {
      if (shelf.isPersisted && !shelf.isUnsortedDropArea) {
        this.ensureRenameStandControl(shelf);
      }
    }

    for (const key of Object.keys(this.renameStandForm.controls)) {
      if (!editableShelfKeys.has(key)) {
        this.renameStandForm.removeControl(key, { emitEvent: false });
      }
    }
  }

  private ensureRenameStandControl(shelf: ArmoryShelfReadModel): void {
    const key = renameStandControlKey(shelf);
    const control = this.renameStandForm.controls[key];

    if (control) {
      if (control.pristine && control.value !== shelf.name) {
        control.setValue(shelf.name, { emitEvent: false });
        control.markAsPristine();
      }

      return;
    }

    this.renameStandForm.addControl(
      key,
      new FormControl<string>(shelf.name, { nonNullable: true }),
      { emitEvent: false },
    );
  }

  private resetRenameStandControl(
    shelf: ArmoryShelfReadModel,
    control: FormControl<string>,
  ): void {
    control.setValue(shelf.name, { emitEvent: false });
    control.markAsPristine();
  }
}

function renameStandControlKey(shelf: Pick<ArmoryShelfReadModel, 'position'>): string {
  return String(shelf.position);
}
