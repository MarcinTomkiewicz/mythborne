import { Component, computed, input } from '@angular/core';
import { armoryItemIconClass } from '../../../core/domain/equipment/equipment-preview.mapper';
import { ArmoryItemSummary } from '../../../core/domain/item/item-equipment.model';
import { armoryItemMetadata } from '../../../core/utils/armory-inventory-filter';

@Component({
  selector: 'app-armory-item-drag-preview',
  standalone: true,
  templateUrl: './armory-item-drag-preview.html',
  host: { class: 'd-block w-px-300 max-w-300' },
})
export class ArmoryItemDragPreview {
  readonly item = input.required<ArmoryItemSummary>();
  readonly items = input<readonly ArmoryItemSummary[]>([]);
  readonly placeholder = input(false);
  readonly armoryItemIconClass = armoryItemIconClass;
  readonly armoryItemMetadata = armoryItemMetadata;

  readonly previewItems = computed(() => {
    const items = this.items();

    return items.length ? items : [this.item()];
  });
  readonly visibleStackItems = computed(() => this.previewItems().slice(0, 5));
  readonly isGroup = computed(() => this.previewItems().length > 1);
  readonly isSummary = computed(() => this.previewItems().length > 5);
  readonly title = computed(() => {
    const count = this.previewItems().length;

    return this.isGroup()
      ? `Moving ${count} item${count === 1 ? '' : 's'}`
      : this.item().name;
  });
  readonly overflowCount = computed(() =>
    Math.max(this.previewItems().length - this.visibleStackItems().length, 0),
  );
  readonly subtitle = computed(() => armoryItemMetadata(this.item()));
}
