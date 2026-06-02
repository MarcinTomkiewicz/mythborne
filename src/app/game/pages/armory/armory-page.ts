import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { equipmentPreviewIconClassForSlot } from '../../../core/domain/equipment/equipment-preview-icons.config';
import { EquipmentPreviewSlotRow } from '../../../core/domain/equipment/equipment-preview.model';
import {
  PlayerArmoryEquipmentSlotReadModel,
  PlayerArmoryItemReadModel,
  PlayerArmoryPageContextReadModel,
} from '../../../core/domain/item/player-armory-page-context.model';
import { ArmoryPageFacade } from '../../../core/services/items/armory-page.facade';
import { CurrentEquipmentState } from '../../../core/services/items/current-equipment.state';
import { ItemLifecycleService } from '../../../core/services/items/item-lifecycle';
import { ArmoryInventorySection } from '../../components/armory-inventory-section/armory-inventory-section';
import { LoadoutPresetManagement } from '../../components/loadout-preset-management/loadout-preset-management';
import { EquipmentPreview } from '../../../shared/equipment-preview/equipment-preview';

@Component({
  selector: 'app-armory-page',
  standalone: true,
  imports: [
    ConfirmDialogModule,
    EquipmentPreview,
    LoadoutPresetManagement,
    ArmoryInventorySection,
  ],
  providers: [ArmoryPageFacade, CurrentEquipmentState],
  templateUrl: './armory-page.html',
  host: { class: 'd-block w-100' },
})
export class ArmoryPage implements OnInit {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly lifecycle = inject(ItemLifecycleService);
  private inventoryActionToken = 0;
  readonly page = inject(ArmoryPageFacade);
  readonly equipment = inject(CurrentEquipmentState);
  readonly selectedEquippedItemIds = signal<readonly string[]>([]);
  readonly isInventoryItemMutating = signal(false);
  readonly inventoryActionDisabled = computed(() =>
    this.equipment.isMutating() || this.isInventoryItemMutating(),
  );
  readonly equippedItemCount = computed(() =>
    this.page.equipmentSlots().filter((slot) => slot.hasItem).length,
  );
  readonly equipmentPreviewRows = computed(() =>
    mapArmoryPageEquipmentPreviewRows(this.page.equipmentSlots()),
  );
  readonly savedLoadoutCount = computed(() =>
    this.page.loadoutPresets().filter((preset) => preset.savedAt !== null).length,
  );

  ngOnInit(): void {
    this.page.loadData();
  }

  toggleEquippedItemSelection(row: EquipmentPreviewSlotRow): void {
    const itemId = row.item?.itemId;

    if (!itemId) {
      return;
    }

    this.selectedEquippedItemIds.update((selectedIds) =>
      selectedIds.includes(itemId)
        ? selectedIds.filter((selectedId) => selectedId !== itemId)
        : [...selectedIds, itemId],
    );
  }

  unequipSelectedItems(): void {
    const selectedIds = this.selectedEquippedItemIds();

    if (!selectedIds.length) {
      return;
    }

    this.equipment.bulkUnequipItems({
      items: selectedIds.map((itemId) => ({ itemId })),
    }, () => this.refreshAfterEquipmentMutation());
  }

  unequipAllItems(): void {
    const equippedItemIds = this.equipmentPreviewRows()
      .flatMap((row) => row.item ? [row.item.itemId] : []);

    if (!equippedItemIds.length) {
      return;
    }

    this.equipment.bulkUnequipItems({
      items: equippedItemIds.map((itemId) => ({ itemId })),
    }, () => this.refreshAfterEquipmentMutation());
  }

  equipInventoryItem(item: PlayerArmoryItemReadModel): void {
    if (this.inventoryActionDisabled() || item.lifecycleStatusKey === 'scrapped') {
      return;
    }

    this.equipment.equipItem(
      { itemId: item.itemId },
      () => this.refreshAfterInventoryMutation(),
    );
  }

  confirmSellInventoryItem(item: PlayerArmoryItemReadModel): void {
    const copy = this.page.copyJson();

    if (
      this.inventoryActionDisabled()
      || item.lifecycleStatusKey !== 'active'
      || !copy
    ) {
      return;
    }

    this.confirmationService.confirm({
      header: copy.confirmations.sellItemTitle,
      message: copy.confirmations.sellItemMessage,
      acceptLabel: copy.confirmations.confirmLabel,
      rejectLabel: copy.confirmations.cancelLabel,
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => this.sellInventoryItem(item),
    });
  }

  private refreshAfterEquipmentMutation(): void {
    this.selectedEquippedItemIds.set([]);
    this.page.loadData();
  }

  private refreshAfterInventoryMutation(): void {
    this.selectedEquippedItemIds.set([]);
    this.isInventoryItemMutating.set(false);
    this.page.loadData();
  }

  private sellInventoryItem(item: PlayerArmoryItemReadModel): void {
    const context = this.page.context();

    if (
      this.inventoryActionDisabled()
      || item.lifecycleStatusKey !== 'active'
      || !context
    ) {
      return;
    }

    const token = ++this.inventoryActionToken;
    const contextKey = `${context.serverId}:${context.heroId}`;

    this.isInventoryItemMutating.set(true);
    this.lifecycle.vendorScrapHeroItem({
      actorHeroId: context.heroId,
      itemId: item.itemId,
    }).subscribe({
      next: () => {
        if (!this.acceptsInventoryActionResponse(token, contextKey)) {
          return;
        }

        this.refreshAfterInventoryMutation();
      },
      error: () => {
        if (!this.acceptsInventoryActionResponse(token, contextKey)) {
          return;
        }

        this.isInventoryItemMutating.set(false);
      },
    });
  }

  private acceptsInventoryActionResponse(token: number, contextKey: string): boolean {
    if (token !== this.inventoryActionToken) {
      return false;
    }

    if (contextKey !== contextKeyFor(this.page.context())) {
      this.isInventoryItemMutating.set(false);
      return false;
    }

    return true;
  }
}

function contextKeyFor(
  context: Pick<PlayerArmoryPageContextReadModel, 'heroId' | 'serverId'> | null,
): string | null {
  return context ? `${context.serverId}:${context.heroId}` : null;
}

function mapArmoryPageEquipmentPreviewRows(
  slots: readonly PlayerArmoryEquipmentSlotReadModel[],
): EquipmentPreviewSlotRow[] {
  return slots.map((slot) => ({
    slotKey: slot.slotKey,
    label: slot.slotLabel,
    sortOrder: slot.slotSortOrder,
    iconClass: equipmentPreviewIconClassForSlot(slot.slotKey),
    emptyDisplayName: slot.hasItem ? null : slot.itemDisplayName,
    emptyDisplayDetail: slot.hasItem ? null : slot.itemDisplayStateLabel,
    item: slot.hasItem
      ? {
          itemId: slot.itemId!,
          name: slot.itemDisplayName,
          metadata: slot.itemDisplayStateLabel,
          statusLabel: slot.itemDisplayStateLabel,
          qualityLabel: slot.qualityLabel,
          kindLabel: slot.baseName,
          slotLabel: slot.slotLabel,
        }
      : null,
  }));
}
