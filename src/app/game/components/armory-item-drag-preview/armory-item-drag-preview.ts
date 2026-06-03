import { Component, computed, input } from '@angular/core';
import { PlayerArmoryItemReadModel } from '../../../core/domain/item/player-armory-page-context.model';
import { armoryItemMetadata } from '../../../core/utils/armory-inventory-filter';

@Component({
  selector: 'app-armory-item-drag-preview',
  standalone: true,
  templateUrl: './armory-item-drag-preview.html',
  host: { class: 'd-block w-px-300 max-w-300' },
})
export class ArmoryItemDragPreview {
  readonly item = input.required<PlayerArmoryItemReadModel>();
  readonly items = input<readonly PlayerArmoryItemReadModel[]>([]);
  readonly placeholder = input(false);
  readonly itemMetadata = armoryItemMetadata;

  readonly previewItems = computed(() => {
    const items = this.items();

    return items.length ? items : [this.item()];
  });
  readonly visibleStackItems = computed(() => this.previewItems().slice(0, 5));
  readonly isGroup = computed(() => this.previewItems().length > 1);
  readonly isSummary = computed(() => this.previewItems().length > 5);
  readonly count = computed(() => this.previewItems().length);
  readonly overflowCount = computed(() =>
    Math.max(this.previewItems().length - this.visibleStackItems().length, 0),
  );
}
