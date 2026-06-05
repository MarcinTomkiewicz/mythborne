import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import {
  ArmorySummaryRowKey,
  ARMORY_SUMMARY_ROW_CONFIG,
} from '../../../core/configs/armory-summary-rows.config';
import { equipmentPreviewIconClassForSlot } from '../../../core/domain/equipment/equipment-preview-icons.config';
import { EquipmentPreviewSlotRow } from '../../../core/domain/equipment/equipment-preview.model';
import {
  PlayerArmoryEquipmentSlotReadModel,
  PlayerArmoryItemReadModel,
  PlayerArmoryPageContextReadModel,
  PlayerArmorySellItemMessageParts,
  PlayerArmorySellSelectedMessageParts,
} from '../../../core/domain/item/player-armory-page-context.model';
import type {
  StructuredConfirmDialogSegment,
} from '../../../core/interfaces/structured-confirm-dialog-segment.interface';
import { GamePageSummaryRow } from '../../../core/interfaces/game-page-summary-row.interface';
import { ArmoryPageFacade } from '../../../core/services/items/armory-page.facade';
import { CurrentEquipmentState } from '../../../core/services/items/current-equipment.state';
import { ItemLifecycleService } from '../../../core/services/items/item-lifecycle';
import { PlayerArmory } from '../../../core/services/items/player-armory';
import { ArmoryInventorySection } from '../../components/armory-inventory-section/armory-inventory-section';
import { LoadoutPresetManagement } from '../../components/loadout-preset-management/loadout-preset-management';
import { EquipmentPreview } from '../../../shared/equipment-preview/equipment-preview';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { StructuredConfirmDialog } from '../../../shared/structured-confirm-dialog/structured-confirm-dialog';

const ARMORY_SELL_ITEM_CONFIRMATION_KEY = 'armory-sell-item';

@Component({
  selector: 'app-armory-page',
  standalone: true,
  imports: [
    LoadingOverlay,
    StructuredConfirmDialog,
    GamePageHeader,
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
  private readonly armory = inject(PlayerArmory);
  private inventoryActionToken = 0;
  readonly page = inject(ArmoryPageFacade);
  readonly equipment = inject(CurrentEquipmentState);
  readonly selectedEquippedItemIds = signal<readonly string[]>([]);
  readonly selectedInventoryItemIds = signal<readonly string[]>([]);
  readonly isInventoryMutating = signal(false);
  readonly sellItemConfirmationSegments =
    signal<readonly StructuredConfirmDialogSegment[]>([]);
  readonly isScreenLoading = computed(() =>
    this.page.status() !== 'error'
    && (
      this.page.status() !== 'loaded'
      || this.equipment.isMutating()
      || this.isInventoryMutating()
    ),
  );
  readonly inventoryActionDisabled = computed(() =>
    this.equipment.isMutating() || this.isInventoryMutating(),
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
  readonly summaryRows = computed<readonly GamePageSummaryRow[]>(() => {
    const context = this.page.context();

    if (!context) {
      return [];
    }

    const summary = context.copyJson.summary;
    const visibility = context.readModel.visibility;
    const values: Record<ArmorySummaryRowKey, number> = {
      capacity: visibility.visibilityLimit,
      allItems: visibility.totalOwnedItemCount,
      equippedItems: this.equippedItemCount(),
      savedSets: this.savedLoadoutCount(),
    };

    return ARMORY_SUMMARY_ROW_CONFIG.map((row) => ({
      key: row.key,
      label: summary[row.labelKey],
      value: values[row.key],
    }));
  });

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
    if (this.inventoryActionDisabled() || !canEquipInventoryItem(item)) {
      return;
    }

    this.equipment.equipItem(
      { itemId: item.itemId },
      () => this.refreshAfterInventoryMutation(),
    );
  }

  bulkEquipInventoryItems(itemIds: readonly string[]): void {
    const context = this.page.context();

    if (this.inventoryActionDisabled() || !context || !itemIds.length) {
      return;
    }

    const selectedItems = visibleArmoryItemsById(context, itemIds);

    if (
      selectedItems.length !== itemIds.length
      || selectedItems.some((item) => !canEquipInventoryItem(item))
    ) {
      return;
    }

    this.equipment.bulkEquipItems({
      items: selectedItems.map((item) => ({ itemId: item.itemId })),
    }, () => this.refreshAfterInventoryMutation());
  }

  bulkSellInventoryItems(itemIds: readonly string[]): void {
    const context = this.page.context();
    const copy = context?.copyJson;

    if (this.inventoryActionDisabled() || !context || !copy || !itemIds.length) {
      return;
    }

    const selectedItems = visibleArmoryItemsById(context, itemIds);

    if (
      selectedItems.length !== itemIds.length
      || selectedItems.some((item) => item.lifecycleStatusKey !== 'active')
      || selectedItems.some((item) => !item.displayCore.valueDisplay)
    ) {
      return;
    }

    const messageSegments = buildSellSelectedConfirmationSegments(
      copy.confirmations.sellSelectedMessageParts,
      copy.confirmations.sellSelectedHighlightFields,
      selectedItems,
    );

    this.sellItemConfirmationSegments.set(messageSegments);
    this.confirmationService.confirm({
      key: ARMORY_SELL_ITEM_CONFIRMATION_KEY,
      header: copy.confirmations.sellItemTitle,
      message: plainStructuredConfirmMessage(messageSegments),
      acceptLabel: copy.confirmations.confirmLabel,
      rejectLabel: copy.confirmations.cancelLabel,
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => this.sellInventoryItems(selectedItems),
      reject: () => this.clearSellItemConfirmationMessage(),
    });
  }

  private sellInventoryItems(
    items: readonly PlayerArmoryItemReadModel[],
  ): void {
    const context = this.page.context();

    if (this.inventoryActionDisabled() || !context || !items.length) {
      return;
    }

    const selectedItems = visibleArmoryItemsById(
      context,
      items.map((item) => item.itemId),
    );

    if (
      selectedItems.length !== items.length
      || selectedItems.some((item) => item.lifecycleStatusKey !== 'active')
      || selectedItems.some((item) => !item.displayCore.valueDisplay)
    ) {
      return;
    }

    const token = ++this.inventoryActionToken;
    const contextKey = `${context.serverId}:${context.heroId}`;

    this.isInventoryMutating.set(true);
    this.lifecycle.bulkVendorScrapHeroItems({
      actorHeroId: context.heroId,
      items: selectedItems.map((item) => ({ itemId: item.itemId })),
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

        this.isInventoryMutating.set(false);
      },
    });
  }

  bulkMoveInventoryItems(input: {
    itemIds: readonly string[];
    targetShelfPosition: number;
  }): void {
    const context = this.page.context();

    if (this.inventoryActionDisabled() || !context || !input.itemIds.length) {
      return;
    }

    const selectedItems = visibleArmoryItemsById(context, input.itemIds);
    const targetShelf = context.readModel.shelves.find((shelf) =>
      shelf.position === input.targetShelfPosition
      && shelf.isPersisted
      && !shelf.isUnsortedDropArea,
    );

    if (selectedItems.length !== input.itemIds.length || !targetShelf) {
      return;
    }

    const token = ++this.inventoryActionToken;
    const contextKey = `${context.serverId}:${context.heroId}`;

    this.isInventoryMutating.set(true);
    this.armory.bulkMoveItemsToShelf({
      items: selectedItems.map((item) => ({ itemId: item.itemId })),
      targetShelfPosition: input.targetShelfPosition,
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

        this.isInventoryMutating.set(false);
      },
    });
  }

  confirmSellInventoryItem(item: PlayerArmoryItemReadModel): void {
    const copy = this.page.context()?.copyJson;
    const valueDisplay = item.displayCore.valueDisplay?.displayValue;

    if (
      this.inventoryActionDisabled()
      || item.lifecycleStatusKey !== 'active'
      || !copy
      || !valueDisplay
    ) {
      return;
    }

    const messageSegments = buildSellItemConfirmationSegments(
      copy.confirmations.sellItemMessageParts,
      copy.confirmations.sellItemHighlightFields,
      item.displayCore.itemName,
      valueDisplay,
    );

    this.sellItemConfirmationSegments.set(messageSegments);
    this.confirmationService.confirm({
      key: ARMORY_SELL_ITEM_CONFIRMATION_KEY,
      header: copy.confirmations.sellItemTitle,
      message: plainStructuredConfirmMessage(messageSegments),
      acceptLabel: copy.confirmations.confirmLabel,
      rejectLabel: copy.confirmations.cancelLabel,
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => this.sellInventoryItem(item),
      reject: () => this.clearSellItemConfirmationMessage(),
    });
  }

  clearSellItemConfirmationMessage(): void {
    this.sellItemConfirmationSegments.set([]);
  }

  renameInventoryShelf(input: { shelfPosition: number; name: string }): void {
    const context = this.page.context();

    if (this.inventoryActionDisabled() || !context) {
      return;
    }

    const token = ++this.inventoryActionToken;
    const contextKey = `${context.serverId}:${context.heroId}`;

    this.isInventoryMutating.set(true);
    this.armory.renameShelf({
      shelfPosition: input.shelfPosition,
      newName: input.name,
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

        this.isInventoryMutating.set(false);
      },
    });
  }

  private refreshAfterEquipmentMutation(): void {
    this.selectedEquippedItemIds.set([]);
    this.page.loadData();
  }

  private refreshAfterInventoryMutation(): void {
    this.selectedEquippedItemIds.set([]);
    this.selectedInventoryItemIds.set([]);
    this.isInventoryMutating.set(false);
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

    this.isInventoryMutating.set(true);
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

        this.isInventoryMutating.set(false);
      },
    });
  }

  private acceptsInventoryActionResponse(token: number, contextKey: string): boolean {
    if (token !== this.inventoryActionToken) {
      return false;
    }

    if (contextKey !== contextKeyFor(this.page.context())) {
      this.isInventoryMutating.set(false);
      return false;
    }

    return true;
  }
}

function buildSellItemConfirmationSegments(
  parts: PlayerArmorySellItemMessageParts,
  highlightFields: readonly string[],
  itemName: string,
  drachmaValue: string,
): StructuredConfirmDialogSegment[] {
  return [
    { text: parts.prefix, highlighted: false },
    { text: itemName, highlighted: highlightFields.includes(parts.itemNameToken) },
    { text: parts.middle, highlighted: false },
    {
      text: drachmaValue,
      highlighted: highlightFields.includes(parts.drachmaValueToken),
    },
    { text: parts.suffix, highlighted: false },
  ];
}

function buildSellSelectedConfirmationSegments(
  parts: PlayerArmorySellSelectedMessageParts,
  highlightFields: readonly string[],
  items: readonly PlayerArmoryItemReadModel[],
): StructuredConfirmDialogSegment[] {
  const totalDrachmaValue = items.reduce(
    (total, item) => total + (item.drachmaValue ?? 0),
    0,
  );

  return [
    { text: parts.intro, highlighted: false, lineBreakAfter: true },
    { text: parts.itemsIntro, highlighted: false, lineBreakAfter: true },
    ...items.flatMap((item) => buildSellSelectedItemLineSegments(
      parts,
      highlightFields,
      item,
    )),
    { text: parts.totalPrefix, highlighted: false },
    {
      text: String(totalDrachmaValue),
      highlighted: highlightFields.includes(parts.totalValueToken),
    },
    { text: parts.totalSuffix, highlighted: false },
  ];
}

function buildSellSelectedItemLineSegments(
  parts: PlayerArmorySellSelectedMessageParts,
  highlightFields: readonly string[],
  item: PlayerArmoryItemReadModel,
): StructuredConfirmDialogSegment[] {
  const itemLineParts = parts.itemLineParts;
  const valueDisplay = item.displayCore.valueDisplay?.displayValue;

  if (!valueDisplay) {
    return [];
  }

  return [
    {
      text: item.displayCore.itemName,
      highlighted: highlightFields.includes(itemLineParts.itemNameToken),
    },
    { text: itemLineParts.middle, highlighted: false },
    {
      text: valueDisplay,
      highlighted: highlightFields.includes(itemLineParts.drachmaValueToken),
    },
    { text: itemLineParts.suffix, highlighted: false, lineBreakAfter: true },
  ];
}

function plainStructuredConfirmMessage(
  segments: readonly StructuredConfirmDialogSegment[],
): string {
  return segments
    .map((segment) => `${segment.text}${segment.lineBreakAfter ? '\n' : ''}`)
    .join('');
}

function contextKeyFor(
  context: Pick<PlayerArmoryPageContextReadModel, 'heroId' | 'serverId'> | null,
): string | null {
  return context ? `${context.serverId}:${context.heroId}` : null;
}

function visibleArmoryItemsById(
  context: PlayerArmoryPageContextReadModel,
  itemIds: readonly string[],
): PlayerArmoryItemReadModel[] {
  const visibleItemsById = new Map(
    context.readModel.visibleItems.map((item) => [item.itemId, item]),
  );

  return itemIds
    .map((itemId) => visibleItemsById.get(itemId) ?? null)
    .filter((item): item is PlayerArmoryItemReadModel => item !== null);
}

function canEquipInventoryItem(item: PlayerArmoryItemReadModel): boolean {
  return item.lifecycleStatusKey === 'active'
    && item.meetsRequirements === true;
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
