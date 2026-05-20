import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import {
  ArmoryItemSummary,
  EquippedItemSummary,
} from '../../../core/domain/item/item-equipment.model';
import { BulkVendorScrapHeroItemsResult } from '../../../core/domain/item/item-lifecycle.model';
import { BulkMoveArmoryItemsToShelfResult } from '../../../core/domain/item/armory-actions.model';
import {
  BulkMoveArmoryItemsToShelfInput,
  MoveArmoryItemToShelfInput,
  RenameArmoryShelfInput,
} from '../../../core/interfaces/item/armory-actions.interface';
import {
  mapEquipmentPreviewRows,
} from '../../../core/domain/equipment/equipment-preview.mapper';
import { EquipmentPreviewSlotRow } from '../../../core/domain/equipment/equipment-preview.model';
import {
  completeArmoryShelfDisplay,
  storedArmoryItems,
  storedArmoryShelves,
} from '../../../core/utils/armory-shelf-display';
import { armoryBulkMoveToastMessage } from '../../../core/utils/armory-bulk-move-feedback';
import { ArmoryPageFacade } from '../../../core/services/items/armory-page.facade';
import { ArmoryShelfState } from '../../../core/services/items/armory-shelf.state';
import { CurrentEquipmentState } from '../../../core/services/items/current-equipment.state';
import { HeroLoadoutPresetsState } from '../../../core/services/items/hero-loadout-presets.state';
import { ToastService } from '../../../core/services/ui/toast';
import { EquipmentPreview } from '../../../shared/equipment-preview/equipment-preview';
import { ArmoryInventorySection } from '../../components/armory-inventory-section/armory-inventory-section';
import { LoadoutPresetManagement } from '../../components/loadout-preset-management/loadout-preset-management';
import {
  ArmoryGuildItemUsageState,
} from './armory-guild-item-usage.state';

@Component({
  selector: 'app-armory-page',
  standalone: true,
  imports: [
    ConfirmDialogModule,
    EquipmentPreview,
    ArmoryInventorySection,
    LoadoutPresetManagement,
  ],
  providers: [
    ArmoryPageFacade,
    CurrentEquipmentState,
    ArmoryShelfState,
    HeroLoadoutPresetsState,
    ArmoryGuildItemUsageState,
    ConfirmationService,
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
  private readonly confirmationService = inject(ConfirmationService);
  private readonly toast = inject(ToastService);
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
    completeArmoryShelfDisplay(this.storedArmoryShelves()).sort((left, right) => {
      if (left.isUnsortedDropArea !== right.isUnsortedDropArea) {
        return left.isUnsortedDropArea ? 1 : -1;
      }

      return right.position - left.position;
    }),
  );
  readonly storedArmoryVisibility = computed(() => {
    const visibility = this.armory.visibility();

    return visibility
      ? {
        ...visibility,
        visibleItemCount: this.storedArmoryItems().length,
      }
      : null;
  });
  readonly selectedPaperdollItemIds = signal<string[]>([]);
  readonly savedLoadoutCount = computed(() =>
    this.loadoutPresets.presets()
      .filter((preset) => preset.savedAt !== null)
      .length,
  );
  readonly guildItemUsageForInventory = (item: ArmoryItemSummary) =>
    this.guildItemUsageState.usageForItem(item);
  readonly canUsePrivateItemActionsForInventory = (item: ArmoryItemSummary) =>
    this.guildItemUsageState.canUsePrivateItemActions(item);
  private readonly syncPaperdollSelection = effect(() =>
    this.prunePaperdollSelection(this.equipment.slots()),
  );
  private readonly equipmentActionToast = effect(() => {
    const error = this.equipment.actionError();
    const journal = this.equipment.actionJournal();

    if (error) {
      this.toast.show('error', 'Equipment action failed', error);
      return;
    }

    if (!journal) {
      return;
    }

    const failedCount = journal.failed.length;
    const skippedCount = journal.skipped.length;
    const changedCount =
      journal.equipped.length + journal.shifted.length + journal.unequipped.length;

    if (!journal.success || failedCount > 0) {
      this.toast.show(
        'error',
        'Equipment action failed',
        `${failedCount || 1} failed, ${skippedCount} skipped.`,
      );
      return;
    }

    if (skippedCount > 0) {
      this.toast.show(
        'warn',
        'Equipment action partially applied',
        `${changedCount} changed, ${skippedCount} skipped.`,
      );
      return;
    }

    this.toast.show(
      'success',
      'Equipment updated',
      `${changedCount} item${changedCount === 1 ? '' : 's'} changed.`,
    );
  });
  private readonly armoryActionErrorToast = effect(() => {
    const error = this.armory.actionError();

    if (error) {
      this.toast.show('error', 'Armory action failed', error);
    }
  });
  private readonly armoryActionMessageToast = effect(() => {
    const message = this.armory.actionMessage();

    if (message) {
      this.toast.show('success', 'Armory updated', message);
    }
  });

  ngOnInit(): void {
    this.page.loadData();
    this.equipment.load();
    this.armory.load();
    this.guildItemUsageState.load();
  }

  renameShelf(input: RenameArmoryShelfInput): void {
    this.armory.renameShelf(input);
  }

  moveItem(input: MoveArmoryItemToShelfInput): void {
    this.armory.moveItemToShelf(input);
  }

  bulkMoveItems(input: BulkMoveArmoryItemsToShelfInput): void {
    this.armory.bulkMoveItemsToShelf(input, (result) => {
      this.showBulkMoveToast(result);
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

  bulkEquipSelectedItems(selectedItems: readonly ArmoryItemSummary[]): void {
    const items = selectedItems.map((item) => ({
      itemId: item.itemId,
    }));

    if (!items.length) {
      return;
    }

    this.equipment.bulkEquipItems({
      items,
    }, () => {
      this.refreshArmoryAndDerivedStats();
    });
  }

  confirmBulkVendorScrapSelectedItems(items: readonly ArmoryItemSummary[]): void {
    const summary = {
      count: items.length,
      drachmaValue: items.reduce(
        (total, item) => total + (item.drachmaValue ?? 0),
        0,
      ),
    };

    if (!summary.count) {
      return;
    }

    this.confirmationService.confirm({
      header: 'Sell selected items',
      message: `Sell to vendor <strong class="color-heading">${summary.count} items</strong> for <strong class="color-heading">${summary.drachmaValue} drachmas</strong>?`,
      acceptLabel: 'Sell selected',
      rejectLabel: 'Cancel',
      acceptIcon: 'pi pi-sold',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => this.bulkVendorScrapSelectedItems(items),
    });
  }

  private bulkVendorScrapSelectedItems(
    items: readonly ArmoryItemSummary[],
  ): void {
    if (!items.length) {
      return;
    }

    this.armory.bulkVendorScrapItems(items.map((item) => item.itemId), (result) => {
      this.showBulkVendorScrapToast(result);
      this.refreshEquipmentAndDerivedStats();
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

  vendorScrapItem(item: ArmoryItemSummary): void {
    if (!this.canUsePrivateItemActions(item)) {
      return;
    }

    this.armory.vendorScrapItem(
      item.itemId,
      (result) => {
        this.toast.show(
          'success',
          'Item sold to vendor',
          `${item.name} sold for ${result.drachmaAmount} drachma.`,
        );
        this.refreshEquipmentAndDerivedStats();
      },
    );
  }

  canUsePrivateItemActions(item: ArmoryItemSummary): boolean {
    return this.guildItemUsageState.canUsePrivateItemActions(item);
  }

  readonly storedArmoryItems = computed(() => {
    return storedArmoryItems(this.armory.visibleItems(), this.equipment.slots());
  });
  private readonly storedArmoryShelves = computed(() => {
    return storedArmoryShelves(this.armory.shelves(), this.equipment.slots());
  });

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

  private showBulkVendorScrapToast(result: BulkVendorScrapHeroItemsResult): void {
    const partial = result.failedCount > 0
      || result.skippedCount > 0
      || result.soldCount < result.selectedCount;

    if (result.soldCount === 0 || result.failedCount > 0) {
      this.toast.show(
        result.soldCount > 0 ? 'warn' : 'error',
        result.soldCount > 0 ? 'Bulk sell partially applied' : 'Bulk sell failed',
        `${result.soldCount} sold for ${result.totalDrachmaAmount} drachma, ${result.failedCount} failed, ${result.skippedCount} skipped.`,
      );
      return;
    }

    this.toast.show(
      partial ? 'warn' : 'success',
      partial ? 'Bulk sell partially applied' : 'Items sold to vendor',
      `${result.soldCount} sold for ${result.totalDrachmaAmount} drachma.`,
    );
  }

  private showBulkMoveToast(result: BulkMoveArmoryItemsToShelfResult): void {
    const message = armoryBulkMoveToastMessage(result);

    this.toast.show(message.severity, message.summary, message.detail);
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

}
