import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import {
  ArmoryItemSummary,
  ArmoryShelfReadModel,
  EquipmentOperationAction,
  EquipmentOperationJournalEntry,
  EquippedItemSummary,
  ItemLifecycleStatus,
} from '../../../core/domain/item/item-equipment.model';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ArmoryPageFacade } from '../../../core/services/items/armory-page.facade';
import { ArmoryShelfState } from '../../../core/services/items/armory-shelf.state';
import { CurrentEquipmentState } from '../../../core/services/items/current-equipment.state';
import { ItemGeneratorPanel } from '../../components/item-generator-panel/item-generator-panel';
import { ArmoryItemDetailPopover } from '../../components/armory-item-detail-popover/armory-item-detail-popover';
import { LoadoutPresetManagement } from '../../components/loadout-preset-management/loadout-preset-management';

@Component({
  selector: 'app-armory-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    SelectModule,
    ArmoryItemDetailPopover,
    ItemGeneratorPanel,
    LoadoutPresetManagement,
  ],
  providers: [
    ArmoryPageFacade,
    CurrentEquipmentState,
    ArmoryShelfState,
  ],
  templateUrl: './armory-page.html',
})
export class ArmoryPage implements OnInit {
  readonly page = inject(ArmoryPageFacade);
  readonly equipment = inject(CurrentEquipmentState);
  readonly armory = inject(ArmoryShelfState);
  readonly paperdollSlots = computed(() =>
    this.page.equipmentSlots().map((slot) => ({
      slotKey: slot.slotKey,
      label: slot.label,
      item: this.equipment.slot(slot.slotKey),
    })),
  );
  readonly moveTargetShelves = computed(() =>
    this.armory.shelves().map((shelf) => ({
      position: shelf.position,
      label: shelf.isUnsortedDropArea
        ? this.shelfLabel(shelf)
        : `${this.shelfLabel(shelf)} (${shelf.position})`,
    })),
  );
  readonly selectedBulkItemIds = signal<string[]>([]);
  readonly bulkSelectionForm = new FormRecord<FormControl<boolean>>({});
  readonly moveTargetShelfForm = new FormRecord<FormControl<number>>({});
  readonly selectedBulkItems = computed(() => {
    const selectedIds = this.selectedBulkItemIds();
    const itemsById = new Map(
      this.armory.visibleItems().map((item) => [item.itemId, item]),
    );

    return selectedIds.flatMap((itemId) => {
      const item = itemsById.get(itemId);
      return item ? [item] : [];
    });
  });
  private readonly syncArmoryForms = effect(() =>
    this.syncArmoryItemForms(this.armory.visibleItems()),
  );

  ngOnInit(): void {
    this.page.loadData();
    this.equipment.load();
    this.armory.load();
  }

  itemLayerLabel(item: EquippedItemSummary): string {
    return [
      item.qualityLabel,
      item.baseName,
      item.prefixName,
      item.suffixName,
    ].filter(Boolean).join(' - ') || 'No item layers recorded';
  }

  itemStatusLabel(item: EquippedItemSummary): string {
    return this.lifecycleStatusLabel(item.lifecycleStatus);
  }

  itemStatusClass(item: EquippedItemSummary): string {
    return this.lifecycleStatusClass(item.lifecycleStatus);
  }

  armoryItemStatusLabel(item: ArmoryItemSummary): string {
    return this.lifecycleStatusLabel(item.lifecycleStatus);
  }

  armoryItemStatusClass(item: ArmoryItemSummary): string {
    return this.lifecycleStatusClass(item.lifecycleStatus);
  }

  shelfLabel(shelf: ArmoryShelfReadModel): string {
    return shelf.isUnsortedDropArea
      ? shelf.name || 'Unsorted'
      : shelf.name;
  }

  renameShelf(shelf: ArmoryShelfReadModel, newName: string): void {
    if (shelf.isUnsortedDropArea) {
      return;
    }

    this.armory.renameShelf({
      shelfPosition: shelf.position,
      newName,
    });
  }

  moveItemToShelf(
    item: ArmoryItemSummary,
    targetShelfPosition: string | number | null | undefined,
  ): void {
    const parsedTargetShelfPosition = shelfPositionValue(targetShelfPosition);

    this.armory.moveItemToShelf({
      itemId: item.itemId,
      targetShelfPosition: parsedTargetShelfPosition,
    });
  }

  equipItem(item: ArmoryItemSummary): void {
    this.equipment.equipItem({
      itemId: item.itemId,
    }, () => this.refreshArmoryAndDerivedStats());
  }

  bulkEquipSelectedItems(): void {
    const items = this.selectedBulkItems().map((item) => ({
      itemId: item.itemId,
    }));

    if (!items.length) {
      return;
    }

    this.equipment.bulkEquipItems({
      items,
    }, () => {
      this.clearBulkSelection();
      this.refreshArmoryAndDerivedStats();
    });
  }

  moveItemToSelectedShelf(item: ArmoryItemSummary): void {
    const targetShelfPosition = this.moveTargetShelfForm.controls[item.itemId]?.value;

    this.moveItemToShelf(item, targetShelfPosition);
  }

  unequipSlot(slotKey: string): void {
    this.equipment.unequipSlot({
      slotKey,
    }, () => this.refreshArmoryAndDerivedStats());
  }

  equipmentJournalEntries(
    action: EquipmentOperationAction,
  ): EquipmentOperationJournalEntry[] {
    const journal = this.equipment.actionJournal();

    return journal ? journal[action] : [];
  }

  operationMessage(entry: EquipmentOperationJournalEntry): string {
    return entry.message
      ?? entry.reason
      ?? (entry.success ? 'Operation accepted.' : 'Operation failed.');
  }

  isBulkItemSelected(item: ArmoryItemSummary): boolean {
    return this.selectedBulkItemIds().includes(item.itemId);
  }

  setBulkItemSelected(item: ArmoryItemSummary, selected: boolean): void {
    const currentIds = this.selectedBulkItemIds();
    this.ensureBulkSelectionControl(item);
    const control = this.bulkSelectionForm.controls[item.itemId];

    if (control.value !== selected) {
      control.setValue(selected, { emitEvent: false });
    }

    if (selected) {
      this.selectedBulkItemIds.set(
        currentIds.includes(item.itemId)
          ? currentIds
          : [...currentIds, item.itemId],
      );
      return;
    }

    this.selectedBulkItemIds.set(
      currentIds.filter((itemId) => itemId !== item.itemId),
    );
  }

  private lifecycleStatusLabel(status: ItemLifecycleStatus): string {
    return humanizeKey(status);
  }

  private lifecycleStatusClass(status: ItemLifecycleStatus): string {
    return status === 'active'
      ? 'tag-badge tag-badge--info'
      : 'tag-badge tag-badge--muted';
  }

  private refreshArmoryAndDerivedStats(): void {
    this.armory.refresh();
    this.page.loadData();
  }

  private clearBulkSelection(): void {
    this.selectedBulkItemIds.set([]);
    for (const control of Object.values(this.bulkSelectionForm.controls)) {
      control.setValue(false, { emitEvent: false });
    }
  }

  private syncArmoryItemForms(items: readonly ArmoryItemSummary[]): void {
    const visibleItemIds = new Set(items.map((item) => item.itemId));
    const selectedIds = this.selectedBulkItemIds();
    const visibleSelectedIds = selectedIds.filter((itemId) =>
      visibleItemIds.has(itemId),
    );

    if (visibleSelectedIds.length !== selectedIds.length) {
      this.selectedBulkItemIds.set(visibleSelectedIds);
    }

    for (const item of items) {
      this.ensureBulkSelectionControl(item);
      this.ensureMoveTargetShelfControl(item);
    }

    for (const itemId of Object.keys(this.bulkSelectionForm.controls)) {
      if (!visibleItemIds.has(itemId)) {
        this.bulkSelectionForm.removeControl(itemId, { emitEvent: false });
      }
    }

    for (const itemId of Object.keys(this.moveTargetShelfForm.controls)) {
      if (!visibleItemIds.has(itemId)) {
        this.moveTargetShelfForm.removeControl(itemId, { emitEvent: false });
      }
    }
  }

  private ensureBulkSelectionControl(item: ArmoryItemSummary): void {
    if (this.bulkSelectionForm.contains(item.itemId)) {
      return;
    }

    this.bulkSelectionForm.addControl(
      item.itemId,
      new FormControl<boolean>(
        this.isBulkItemSelected(item),
        { nonNullable: true },
      ),
      { emitEvent: false },
    );
  }

  private ensureMoveTargetShelfControl(item: ArmoryItemSummary): void {
    if (this.moveTargetShelfForm.contains(item.itemId)) {
      return;
    }

    this.moveTargetShelfForm.addControl(
      item.itemId,
      new FormControl<number>(
        item.shelfPosition,
        { nonNullable: true },
      ),
      { emitEvent: false },
    );
  }

}

function humanizeKey(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ') || 'Status';
}

function shelfPositionValue(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    throw new Error('targetShelfPosition is required for armory action.');
  }

  if (typeof value === 'string' && !value.trim()) {
    throw new Error('targetShelfPosition is required for armory action.');
  }

  const parsed = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error('targetShelfPosition must be a number.');
  }

  return parsed;
}
