import { Component, OnInit, computed, inject } from '@angular/core';
import {
  EquippedItemSummary,
} from '../../../core/domain/item/item-equipment.model';
import { RouterLink } from '@angular/router';
import { ArmoryPageFacade } from '../../../core/services/items/armory-page.facade';
import { CurrentEquipmentState } from '../../../core/services/items/current-equipment.state';
import { ItemGeneratorPanel } from '../../components/item-generator-panel/item-generator-panel';

interface EquipmentPaperdollSlot {
  slotKey: string;
  label: string;
  item: EquippedItemSummary | null;
}

@Component({
  selector: 'app-armory-page',
  standalone: true,
  imports: [RouterLink, ItemGeneratorPanel],
  providers: [ArmoryPageFacade, CurrentEquipmentState],
  templateUrl: './armory-page.html',
})
export class ArmoryPage implements OnInit {
  readonly page = inject(ArmoryPageFacade);
  readonly equipment = inject(CurrentEquipmentState);
  readonly paperdollSlots = computed<EquipmentPaperdollSlot[]>(() =>
    this.page.equipmentSlots().map((slot) => ({
      slotKey: slot.slotKey,
      label: slot.label,
      item: this.equipment.slot(slot.slotKey),
    })),
  );

  ngOnInit(): void {
    this.page.loadData();
    this.equipment.load();
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
    return humanizeKey(item.lifecycleStatus);
  }

  itemStatusClass(item: EquippedItemSummary): string {
    return item.lifecycleStatus === 'active'
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
