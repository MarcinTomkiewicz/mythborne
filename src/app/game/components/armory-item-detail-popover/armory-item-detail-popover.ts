import { Component, computed, input } from '@angular/core';
import {
  armoryItemIconClass,
  equippedItemIconClass,
} from '../../../core/domain/equipment/equipment-preview.mapper';
import {
  ArmoryItemSummary,
  EquippedItemSummary,
} from '../../../core/domain/item/item-equipment.model';
import { ItemDetailPopover } from '../../../shared/item-detail-popover/item-detail-popover';

@Component({
  selector: 'app-armory-item-detail-popover',
  standalone: true,
  imports: [ItemDetailPopover],
  template: `
    <app-item-detail-popover
      [itemId]="item().itemId"
      [fallbackName]="itemName()"
      [statusLabel]="item().lifecycleStatus"
      [iconClass]="iconClass()"
      [drachmaValue]="drachmaValue()"
      contextKind="current"
      [contextLabel]="guildContextLabel() ? 'Current guild armory item' : 'Current armory item'"
      [contextSourceLabel]="contextSourceLabel()"
      [buttonTrigger]="buttonTrigger()"
      [triggerFullWidth]="triggerFullWidth()"
      triggerLabel="Details"
    >
      <ng-content />
    </app-item-detail-popover>
  `,
})
export class ArmoryItemDetailPopover {
  readonly item = input.required<ArmoryItemSummary | EquippedItemSummary>();
  readonly guildContextLabel = input<string | null>(null);
  readonly guildContextDetail = input<string | null>(null);
  readonly buttonTrigger = input(true);
  readonly triggerFullWidth = input(false);
  readonly contextSourceLabel = computed(() =>
    this.guildContextDetail() ?? this.guildContextLabel(),
  );
  readonly iconClass = computed(() => {
    const item = this.item();

    return 'slotKey' in item ? equippedItemIconClass(item) : armoryItemIconClass(item);
  });

  itemName(): string {
    const item = this.item();

    return 'itemName' in item ? item.itemName : item.name;
  }

  drachmaValue(): number | null {
    const item = this.item();

    return 'drachmaValue' in item ? item.drachmaValue : null;
  }
}
