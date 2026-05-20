import { CdkDrag, CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import {
  Component,
  HostListener,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
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
import {
  BulkMoveArmoryItemsToShelfInput,
  MoveArmoryItemToShelfInput,
  RenameArmoryShelfInput,
} from '../../../core/interfaces/item/armory-actions.interface';
import {
  ArmoryInventoryAvailabilityFilterValue,
} from '../../../core/types/armory-inventory-filter.types';
import {
  ARMORY_AVAILABILITY_FILTER_OPTIONS,
} from '../../../core/constants/armory-inventory-filter.const';
import {
  armorySlotFilterOptions,
  armoryStandFilterOptions,
  armoryStandSelectLabel,
  filterArmoryItems,
  filteredArmoryShelves,
  armoryItemMetadata,
} from '../../../core/utils/armory-inventory-filter';
import { ArmoryBulkActionsToolbar } from '../armory-bulk-actions-toolbar/armory-bulk-actions-toolbar';
import { ArmoryGuildItemUsage } from '../../../core/interfaces/item/armory-guild-item-usage.interface';
import { normalizeSearchText } from '../../../core/utils/normalize-text';
import { ArmoryItemDetailPopover } from '../armory-item-detail-popover/armory-item-detail-popover';
import { ArmoryItemDragPreview } from '../armory-item-drag-preview/armory-item-drag-preview';
import { armoryItemIconClass } from '../../../core/domain/equipment/equipment-preview.mapper';
import {
  itemLifecycleStatusBadgeClass,
  itemLifecycleStatusLabel,
} from '../../../core/utils/item-lifecycle-display';
import { highlightTextParts } from '../../../core/utils/text-highlight';
import { TextHighlightPart } from '../../../core/types/text-highlight.types';
import { SelectOption } from '../../../core/types/select-option.types';

@Component({
  selector: 'app-armory-inventory-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DragDropModule,
    ButtonModule,
    InplaceModule,
    InputTextModule,
    SelectModule,
    ArmoryBulkActionsToolbar,
    ArmoryItemDragPreview,
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
  readonly moveItem = output<MoveArmoryItemToShelfInput>();
  readonly bulkMoveItems = output<BulkMoveArmoryItemsToShelfInput>();
  readonly renameShelf = output<RenameArmoryShelfInput>();
  readonly bulkEquipSelected = output<readonly ArmoryItemSummary[]>();
  readonly bulkSellSelected = output<readonly ArmoryItemSummary[]>();
  readonly selectedBulkItemIds = signal<string[]>([]);
  private readonly activeDrag = signal<{
    rootItemId: string;
    itemIds: readonly string[];
  } | null>(null);
  private activeDragRef: CdkDrag<ArmoryItemSummary> | null = null;
  private dragCancelPending = false;
  readonly armoryItemIconClass = armoryItemIconClass;
  readonly armoryItemMetadata = armoryItemMetadata;
  readonly itemLifecycleStatusBadgeClass = itemLifecycleStatusBadgeClass;
  readonly itemLifecycleStatusLabel = itemLifecycleStatusLabel;
  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  readonly slotFilterControl = new FormControl<string>('all', { nonNullable: true });
  readonly standFilterControl = new FormControl<string>('all', { nonNullable: true });
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
  private readonly standFilterValue = toSignal(this.standFilterControl.valueChanges, {
    initialValue: this.standFilterControl.value,
  });
  private readonly availabilityFilterValue = toSignal(
    this.availabilityFilterControl.valueChanges,
    { initialValue: this.availabilityFilterControl.value },
  );
  readonly slotOptions = computed(() => armorySlotFilterOptions(this.equipmentSlots()));
  readonly standOptions = computed(() => armoryStandFilterOptions(this.shelves()));
  readonly availabilityOptions = ARMORY_AVAILABILITY_FILTER_OPTIONS;
  readonly hasFilters = computed(() =>
    this.searchTerm().length > 0
    || this.slotFilterValue() !== 'all'
    || this.standFilterValue() !== 'all'
    || this.availabilityFilterValue() !== 'all',
  );
  readonly filteredItems = computed(() =>
    filterArmoryItems(
      this.items(),
      {
        searchTerm: this.searchTerm(),
        slotKey: this.slotFilterValue(),
        standKey: this.standFilterValue(),
        availability: this.availabilityFilterValue(),
      },
    ),
  );
  readonly visibleShelves = computed(() =>
    this.hasFilters()
      ? filteredArmoryShelves(
        this.shelves(),
        this.filteredItems(),
        this.standFilterValue(),
      )
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
  readonly selectedMovableItems = computed(() =>
    this.selectedBulkItems().filter((item) => this.canMoveItem(item)),
  );
  readonly selectedMoveDestinationOptions = computed(() => {
    const items = this.selectedMovableItems();

    return items.length ? this.bulkMoveDestinationOptions(items) : [];
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
    this.standFilterControl.setValue('all');
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

  emitMoveSelectedItem(targetShelfPosition: number): void {
    this.emitBulkMoveItemsToShelf(
      this.selectedMovableItems(),
      targetShelfPosition,
    );
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

  canMoveItem(item: ArmoryItemSummary): boolean {
    return this.canUseLifecycleActions(item)
      && this.moveDestinationOptions(item).length > 0;
  }

  canDragItem(item: ArmoryItemSummary): boolean {
    return !this.isActionBusy() && this.canMoveItem(item);
  }

  @HostListener('document:keydown', ['$event'])
  cancelActiveDrag(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.activeDrag()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.dragCancelPending = true;
    const activeDragRef = this.activeDragRef;

    this.activeDragRef = null;
    this.activeDrag.set(null);
    activeDragRef?.reset();
    this.releaseCanceledDragSession();
  }

  startItemDrag(
    item: ArmoryItemSummary,
    drag: CdkDrag<ArmoryItemSummary>,
  ): void {
    const items = this.resolveDragItems(item);

    this.dragCancelPending = false;
    this.activeDragRef = drag;
    this.activeDrag.set({
      rootItemId: item.itemId,
      itemIds: items.map((dragItem) => dragItem.itemId),
    });
  }

  endItemDrag(): void {
    this.activeDragRef = null;
    this.activeDrag.set(null);
  }

  dragPreviewItems(item: ArmoryItemSummary): readonly ArmoryItemSummary[] {
    const activeDrag = this.activeDrag();

    if (activeDrag?.rootItemId === item.itemId) {
      const itemsById = new Map(
        this.filteredItems().map((filteredItem) => [filteredItem.itemId, filteredItem]),
      );
      const activeItems = activeDrag.itemIds.flatMap((itemId) => {
        const activeItem = itemsById.get(itemId);

        return activeItem ? [activeItem] : [];
      });

      return activeItems.length ? activeItems : [item];
    }

    return this.resolveDragItems(item);
  }

  isHiddenByActiveDrag(item: ArmoryItemSummary): boolean {
    const activeDrag = this.activeDrag();

    return Boolean(
      activeDrag
      && activeDrag.rootItemId !== item.itemId
      && activeDrag.itemIds.includes(item.itemId),
    );
  }

  handleItemDrop(
    event: CdkDragDrop<ArmoryShelfReadModel, ArmoryShelfReadModel, ArmoryItemSummary>,
  ): void {
    if (this.dragCancelPending) {
      this.dragCancelPending = false;
      return;
    }

    const item = event.item.data;
    const targetShelfPosition = event.container.data.position;
    const sourceShelfPosition = event.previousContainer.data.position;

    if (this.isBulkItemSelected(item)) {
      this.emitMoveDraggedSelection(item, targetShelfPosition);
      return;
    }

    if (sourceShelfPosition === targetShelfPosition) {
      return;
    }

    this.emitMoveItem(item, targetShelfPosition);
  }

  moveDestinationOptions(
    item: ArmoryItemSummary,
  ): Array<SelectOption<number>> {
    return this.shelves()
      .filter((shelf) => shelf.position !== item.shelfPosition)
      .map((shelf) => ({
        label: armoryStandSelectLabel(shelf),
        value: shelf.position,
      }));
  }

  bulkMoveDestinationOptions(
    items: readonly ArmoryItemSummary[],
  ): Array<SelectOption<number>> {
    return this.shelves()
      .filter((shelf) =>
        items.some((item) => item.shelfPosition !== shelf.position),
      )
      .map((shelf) => ({
        label: armoryStandSelectLabel(shelf),
        value: shelf.position,
      }));
  }

  emitMoveItem(
    item: ArmoryItemSummary,
    targetShelfPosition: number,
  ): void {
    if (
      this.isActionBusy()
      || targetShelfPosition === item.shelfPosition
      || !this.canMoveItem(item)
      || !this.moveDestinationOptions(item)
        .some((option) => option.value === targetShelfPosition)
    ) {
      return;
    }

    this.moveItem.emit({
      itemId: item.itemId,
      targetShelfPosition,
    });
  }

  private emitMoveDraggedSelection(
    draggedItem: ArmoryItemSummary,
    targetShelfPosition: number,
  ): void {
    const selectedItems = this.selectedMovableItems();
    const draggedItemIsMovable = selectedItems.some((item) =>
      item.itemId === draggedItem.itemId,
    );

    if (!draggedItemIsMovable) {
      return;
    }

    this.emitBulkMoveItemsToShelf(selectedItems, targetShelfPosition);
  }

  private emitBulkMoveItemsToShelf(
    selectedItems: readonly ArmoryItemSummary[],
    targetShelfPosition: number,
  ): void {
    const items = selectedItems.filter((item) =>
      item.shelfPosition !== targetShelfPosition,
    );

    if (
      this.isActionBusy()
      || !items.length
      || !this.bulkMoveDestinationOptions(selectedItems)
        .some((option) => option.value === targetShelfPosition)
    ) {
      return;
    }

    this.bulkMoveItems.emit({
      items: items.map((item) => ({ itemId: item.itemId })),
      targetShelfPosition,
    });
  }

  private resolveDragItems(item: ArmoryItemSummary): readonly ArmoryItemSummary[] {
    return this.isBulkItemSelected(item)
      ? this.selectedMovableItems()
      : [item];
  }

  private releaseCanceledDragSession(): void {
    if (typeof PointerEvent === 'function') {
      document.dispatchEvent(new PointerEvent('pointerup', {
        bubbles: true,
        cancelable: true,
      }));
    }

    document.dispatchEvent(new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
    }));
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
