import { Component, computed, input } from '@angular/core';
import {
  ArmoryItemSummary,
  EquippedItemSummary,
} from '../../../core/domain/item/item-equipment.model';
import { ItemDetailPopoverCopy } from '../../../core/domain/item/item-detail-popover.model';
import { ItemDetailPopover } from '../../../shared/item-detail-popover/item-detail-popover';

@Component({
  selector: 'app-armory-item-detail-popover',
  standalone: true,
  imports: [ItemDetailPopover],
  template: `
    <app-item-detail-popover
      [copy]="copy()"
      [itemId]="item().itemId"
      [fallbackName]="itemName()"
      [contextSourceLabel]="contextSourceLabel()"
      [buttonTrigger]="buttonTrigger()"
      [triggerFullWidth]="triggerFullWidth()"
    >
      <ng-content />
    </app-item-detail-popover>
  `,
})
export class ArmoryItemDetailPopover {
  readonly item = input.required<ArmoryItemSummary | EquippedItemSummary>();
  readonly copy = input.required<ItemDetailPopoverCopy>();
  readonly guildContextLabel = input<string | null>(null);
  readonly guildContextDetail = input<string | null>(null);
  readonly buttonTrigger = input(true);
  readonly triggerFullWidth = input(false);
  readonly contextSourceLabel = computed(() =>
    this.guildContextDetail() ?? this.guildContextLabel(),
  );

  itemName(): string {
    const item = this.item();

    return 'itemName' in item ? item.itemName : item.name;
  }
}
