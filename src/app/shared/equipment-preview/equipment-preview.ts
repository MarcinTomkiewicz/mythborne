import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  EQUIPMENT_PREVIEW_GROUPS,
  EquipmentPreviewRegion,
  equipmentPreviewRegionFor,
} from './equipment-preview.config';
import { EquipmentPreviewSlotRow } from '../../core/domain/equipment/equipment-preview.model';

interface EquipmentPreviewGroup {
  key: EquipmentPreviewRegion;
  zoneClass: string;
  rows: EquipmentPreviewSlotRow[];
}

@Component({
  selector: 'app-equipment-preview',
  standalone: true,
  imports: [NgClass, RouterLink],
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

  readonly paperdollGroups = computed<EquipmentPreviewGroup[]>(() =>
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
}
