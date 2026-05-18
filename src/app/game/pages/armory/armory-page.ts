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
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InplaceModule } from 'primeng/inplace';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import {
  ARMORY_PLAYER_SHELF_POSITIONS,
  ARMORY_UNSORTED_SHELF_POSITION,
} from '../../../core/constants/armory-shelves.const';
import { movableArmoryShelfPosition } from '../../../core/utils/armory-shelf-position';
import { humanizeKey, trimText } from '../../../core/utils/normalize-text';
import {
  armoryItemIconClass,
  equippedItemIconClass,
  mapEquipmentPreviewRows,
} from '../../../core/domain/equipment/equipment-preview.mapper';
import { EquipmentPreviewSlotRow } from '../../../core/domain/equipment/equipment-preview.model';
import { ArmoryPageFacade } from '../../../core/services/items/armory-page.facade';
import { ArmoryShelfState } from '../../../core/services/items/armory-shelf.state';
import { CurrentEquipmentState } from '../../../core/services/items/current-equipment.state';
import { HeroLoadoutPresetsState } from '../../../core/services/items/hero-loadout-presets.state';
import { EquipmentPreview } from '../../../shared/equipment-preview/equipment-preview';
import { ArmoryItemDetailPopover } from '../../components/armory-item-detail-popover/armory-item-detail-popover';
import { LoadoutPresetManagement } from '../../components/loadout-preset-management/loadout-preset-management';
import {
  ArmoryGuildItemUsageState,
  ArmoryGuildItemUsage,
} from './armory-guild-item-usage.state';

@Component({
  selector: 'app-armory-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    InplaceModule,
    InputTextModule,
    SelectModule,
    EquipmentPreview,
    ArmoryItemDetailPopover,
    LoadoutPresetManagement,
  ],
  providers: [
    ArmoryPageFacade,
    CurrentEquipmentState,
    ArmoryShelfState,
    HeroLoadoutPresetsState,
    ArmoryGuildItemUsageState,
  ],
  templateUrl: './armory-page.html',
  host: { class: 'd-block w-100' },
})
export class ArmoryPage implements OnInit {
  readonly page = inject(ArmoryPageFacade);
  readonly equipment = inject(CurrentEquipmentState);
  readonly armory = inject(ArmoryShelfState);
  readonly loadoutPresets = inject(HeroLoadoutPresetsState);
  readonly guildItemUsageState = inject(ArmoryGuildItemUsageState);
  readonly equipmentPreviewRows = computed(() =>
    mapEquipmentPreviewRows(
      this.page.equipmentSlots(),
      this.equipment.slots(),
    ),
  );
  readonly paperdollImageUrl = computed(() => {
    const originKey = this.page.origin()?.key;

    return originKey
      ? `/images/paperdolls/${originKey.toLowerCase()}.png`
      : '/images/warrior.png';
  });
  readonly displayShelves = computed(() =>
    completeArmoryShelfDisplay(this.armory.shelves()).sort((left, right) => {
      if (left.isUnsortedDropArea !== right.isUnsortedDropArea) {
        return left.isUnsortedDropArea ? 1 : -1;
      }

      return right.position - left.position;
    }),
  );
  readonly moveTargetShelves = computed(() =>
    [...this.armory.shelves()]
      .sort((left, right) => {
        if (left.isUnsortedDropArea !== right.isUnsortedDropArea) {
          return left.isUnsortedDropArea ? 1 : -1;
        }

        return right.position - left.position;
      })
      .map((shelf) => ({
        position: shelf.position,
        label: shelf.isUnsortedDropArea
          ? this.shelfLabel(shelf)
          : `${this.shelfLabel(shelf)} (${shelf.position})`,
      })),
  );
  readonly selectedBulkItemIds = signal<string[]>([]);
  readonly selectedPaperdollItemIds = signal<string[]>([]);
  readonly savedLoadoutCount = computed(() =>
    this.loadoutPresets.presets()
      .filter((preset) => preset.savedAt !== null)
      .length,
  );
  readonly bulkSelectionForm = new FormRecord<FormControl<boolean>>({});
  readonly moveTargetShelfForm = new FormRecord<FormControl<number>>({});
  readonly renameStandForm = new FormRecord<FormControl<string>>({});
  readonly selectedBulkItems = computed(() => {
    const selectedIds = this.selectedBulkItemIds();
    const itemsById = new Map(
      this.armory.visibleItems().map((item) => [item.itemId, item]),
    );

    return selectedIds.flatMap((itemId) => {
      const item = itemsById.get(itemId);
      return item ? [item] : [];
    }).filter((item) => this.canUsePrivateItemActions(item));
  });
  private readonly syncArmoryForms = effect(() =>
    this.syncArmoryItemForms(this.armory.visibleItems()),
  );
  private readonly syncRenameStandForms = effect(() =>
    this.syncStandRenameControls(this.displayShelves()),
  );
  private readonly syncPaperdollSelection = effect(() =>
    this.prunePaperdollSelection(this.equipment.slots()),
  );

  ngOnInit(): void {
    this.page.loadData();
    this.equipment.load();
    this.armory.load();
    this.guildItemUsageState.load();
  }

  itemStatusLabel(item: EquippedItemSummary): string {
    return this.lifecycleStatusLabel(item.lifecycleStatus);
  }

  itemStatusClass(item: EquippedItemSummary): string {
    return this.lifecycleStatusClass(item.lifecycleStatus);
  }

  equippedItemIconClass(item: EquippedItemSummary): string {
    return equippedItemIconClass(item);
  }

  armoryItemStatusLabel(item: ArmoryItemSummary): string {
    return this.lifecycleStatusLabel(item.lifecycleStatus);
  }

  armoryItemStatusClass(item: ArmoryItemSummary): string {
    return this.lifecycleStatusClass(item.lifecycleStatus);
  }

  armoryItemIconClass(item: ArmoryItemSummary): string {
    return armoryItemIconClass(item);
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

  renameStandControl(shelf: ArmoryShelfReadModel): FormControl<string> {
    this.ensureRenameStandControl(shelf);

    return this.renameStandForm.controls[renameStandControlKey(shelf)];
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

    this.renameShelf(shelf, control.value.trim());
    control.markAsPristine();
    closeCallback(event);
  }

  moveItemToShelf(
    item: ArmoryItemSummary,
    targetShelfPosition: string | number | null | undefined,
  ): void {
    if (!this.canUsePrivateItemActions(item)) {
      return;
    }

    const parsedTargetShelfPosition = targetShelfPositionValue(targetShelfPosition);

    this.armory.moveItemToShelf({
      itemId: item.itemId,
      targetShelfPosition: parsedTargetShelfPosition,
    });
  }

  equipItem(item: ArmoryItemSummary): void {
    if (!this.canUsePrivateItemActions(item)) {
      return;
    }

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

  togglePaperdollItemSelection(row: EquipmentPreviewSlotRow): void {
    const itemId = row.item?.itemId;

    if (!itemId) {
      return;
    }

    const selectedIds = this.selectedPaperdollItemIds();
    this.selectedPaperdollItemIds.set(
      selectedIds.includes(itemId)
        ? selectedIds.filter((selectedId) => selectedId !== itemId)
        : [...selectedIds, itemId],
    );
  }

  unequipSelectedPaperdollItems(): void {
    const selectedIds = new Set(this.selectedPaperdollItemIds());
    const items = this.equipment.slots()
      .filter((item) => selectedIds.has(item.itemId))
      .map((item) => ({
        itemId: item.itemId,
        slotKey: item.slotKey,
      }));

    this.bulkUnequipPaperdollItems(items);
  }

  unequipAllPaperdollItems(): void {
    const items = this.equipment.slots().map((item) => ({
      itemId: item.itemId,
      slotKey: item.slotKey,
    }));

    this.bulkUnequipPaperdollItems(items);
  }

  moveItemToSelectedShelf(item: ArmoryItemSummary): void {
    if (!this.canUsePrivateItemActions(item)) {
      return;
    }

    const targetShelfPosition = this.moveTargetShelfForm.controls[item.itemId]?.value;

    this.moveItemToShelf(item, targetShelfPosition);
  }

  unequipSlot(slotKey: string): void {
    this.equipment.unequipSlot({
      slotKey,
    }, () => this.refreshArmoryAndDerivedStats());
  }

  vendorScrapItem(item: ArmoryItemSummary): void {
    if (!this.canUsePrivateItemActions(item)) {
      return;
    }

    this.armory.vendorScrapItem(
      item.itemId,
      () => this.refreshEquipmentAndDerivedStats(),
    );
  }

  canUseLifecycleActions(item: ArmoryItemSummary): boolean {
    return item.lifecycleStatus === 'active'
      && this.canUsePrivateItemActions(item);
  }

  canUsePrivateItemActions(item: ArmoryItemSummary): boolean {
    return this.guildItemUsageState.canUsePrivateItemActions(item);
  }

  guildItemUsage(item: ArmoryItemSummary): ArmoryGuildItemUsage {
    return this.guildItemUsageState.usageForItem(item);
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
    return humanizeKey(status, 'Status');
  }

  private lifecycleStatusClass(status: ItemLifecycleStatus): string {
    return status === 'active'
      ? 'tag-badge tag-badge--info'
      : 'tag-badge tag-badge--muted';
  }

  private refreshArmoryAndDerivedStats(): void {
    this.armory.refresh();
    this.guildItemUsageState.load();
    this.page.loadData();
  }

  private refreshEquipmentAndDerivedStats(): void {
    this.equipment.refresh();
    this.guildItemUsageState.load();
    this.page.loadData();
  }

  private clearBulkSelection(): void {
    this.selectedBulkItemIds.set([]);
    for (const control of Object.values(this.bulkSelectionForm.controls)) {
      control.setValue(false, { emitEvent: false });
    }
  }

  private bulkUnequipPaperdollItems(
    items: readonly { itemId: string; slotKey: string }[],
  ): void {
    if (!items.length) {
      return;
    }

    this.equipment.bulkUnequipItems({
      items,
    }, () => {
      this.selectedPaperdollItemIds.set([]);
      this.refreshArmoryAndDerivedStats();
    });
  }

  private prunePaperdollSelection(slots: readonly EquippedItemSummary[]): void {
    const equippedItemIds = new Set(slots.map((slot) => slot.itemId));
    const selectedIds = this.selectedPaperdollItemIds();
    const equippedSelectedIds = selectedIds.filter((itemId) =>
      equippedItemIds.has(itemId),
    );

    if (equippedSelectedIds.length !== selectedIds.length) {
      this.selectedPaperdollItemIds.set(equippedSelectedIds);
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

function targetShelfPositionValue(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    throw new Error('targetShelfPosition is required for armory action.');
  }

  if (typeof value === 'string' && !trimText(value)) {
    throw new Error('targetShelfPosition is required for armory action.');
  }

  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error('targetShelfPosition must be a number.');
  }

  return movableArmoryShelfPosition(parsed);
}

function renameStandControlKey(shelf: Pick<ArmoryShelfReadModel, 'position'>): string {
  return String(shelf.position);
}

function completeArmoryShelfDisplay(
  shelves: readonly ArmoryShelfReadModel[],
): ArmoryShelfReadModel[] {
  const heroId = shelves[0]?.heroId ?? '';
  const shelvesByPosition = new Map(
    shelves.map((shelf) => [shelf.position, shelf]),
  );
  const shelfAt = (position: number): ArmoryShelfReadModel =>
    shelvesByPosition.get(position) ?? {
      shelfId: null,
      heroId,
      position,
      name: position === 0 ? 'Unsorted' : `Shelf ${position}`,
      updatedAt: null,
      isPersisted: false,
      isUnsortedDropArea: position === 0,
      visibleItems: [],
    };

  return [
    ...ARMORY_PLAYER_SHELF_POSITIONS.map(shelfAt),
    shelfAt(ARMORY_UNSORTED_SHELF_POSITION),
  ];
}
