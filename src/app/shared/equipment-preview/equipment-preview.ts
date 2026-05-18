import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ItemDetailPopover } from '../item-detail-popover/item-detail-popover';
import {
  EQUIPMENT_PREVIEW_GROUPS,
  EquipmentPreviewRegion,
  equipmentPreviewRegionFor,
} from './equipment-preview.config';
import { EquipmentPreviewSlotRow } from '../../core/domain/equipment/equipment-preview.model';

@Component({
  selector: 'app-equipment-preview',
  standalone: true,
  imports: [ButtonModule, NgTemplateOutlet, RouterLink, ItemDetailPopover],
  host: { class: 'd-block w-100' },
  templateUrl: './equipment-preview.html',
})
export class EquipmentPreview {
  readonly rows = input.required<EquipmentPreviewSlotRow[]>();
  readonly title = input('Equipment Preview');
  readonly isArmory = input(false);
  readonly isLoading = input(false);
  readonly isUnavailable = input(false);
  readonly error = input<string | null>(null);
  readonly armoryLink = input('/game/armory');
  readonly compact = input(false);
  readonly showSlotLabels = input(true);
  readonly paperdollImageUrl = input('/images/warrior.png');
  readonly selectedItemIds = input<readonly string[]>([]);
  readonly selectionActionDisabled = input(false);
  readonly equippedItemToggle = output<EquipmentPreviewSlotRow>();
  readonly unequipSelected = output<void>();
  readonly unequipAll = output<void>();
  readonly hasEquippedItems = computed(() =>
    this.rows().some((row) => row.item),
  );
  readonly hasSelectedEquippedItems = computed(() =>
    this.rows().some((row) => row.item && this.isSelected(row)),
  );

  readonly paperdollGroups = computed(() =>
    EQUIPMENT_PREVIEW_GROUPS.map((group) => ({
      ...group,
      rows: this.rowsForRegion(group.key),
    }))
  );

  readonly otherRows = computed(() => this.rowsForRegion('other'));

  private rowsForRegion(region: EquipmentPreviewRegion): EquipmentPreviewSlotRow[] {
    return this.rows()
      .filter((row) => equipmentPreviewRegionFor(row) === region)
      .sort((first, second) => first.sortOrder - second.sortOrder);
  }

  isSelected(row: EquipmentPreviewSlotRow): boolean {
    const itemId = row.item?.itemId;

    return Boolean(itemId && this.selectedItemIds().includes(itemId));
  }

  toggleEquippedItem(row: EquipmentPreviewSlotRow): void {
    if (!this.isArmory() || !row.item) {
      return;
    }

    this.equippedItemToggle.emit(row);
  }
}
