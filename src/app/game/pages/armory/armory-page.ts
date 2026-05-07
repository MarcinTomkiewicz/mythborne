import { Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ArmoryItemSummary,
  ArmoryShelfReadModel,
  EquippedItemSummary,
  ItemLifecycleStatus,
} from '../../../core/domain/item/item-equipment.model';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ArmoryPageFacade } from '../../../core/services/items/armory-page.facade';
import { ArmoryShelfState } from '../../../core/services/items/armory-shelf.state';
import { CurrentEquipmentState } from '../../../core/services/items/current-equipment.state';
import { ItemGeneratorPanel } from '../../components/item-generator-panel/item-generator-panel';
import { ArmoryItemDetailPopover } from '../../components/armory-item-detail-popover/armory-item-detail-popover';

interface EquipmentPaperdollSlot {
  slotKey: string;
  label: string;
  item: EquippedItemSummary | null;
}

@Component({
  selector: 'app-armory-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ArmoryItemDetailPopover,
    ItemGeneratorPanel,
  ],
  providers: [ArmoryPageFacade, CurrentEquipmentState, ArmoryShelfState],
  templateUrl: './armory-page.html',
})
export class ArmoryPage implements OnInit {
  readonly page = inject(ArmoryPageFacade);
  readonly equipment = inject(CurrentEquipmentState);
  readonly armory = inject(ArmoryShelfState);
  readonly paperdollSlots = computed<EquipmentPaperdollSlot[]>(() =>
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

  private lifecycleStatusLabel(status: ItemLifecycleStatus): string {
    return humanizeKey(status);
  }

  private lifecycleStatusClass(status: ItemLifecycleStatus): string {
    return status === 'active'
      ? 'tag-badge tag-badge--info'
      : 'tag-badge tag-badge--muted';
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
