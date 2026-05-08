import { Component, input } from '@angular/core';
import {
  EditableItemGenerationQuality,
  ItemRequirementAggregationSettings,
} from '../../../core/domain/item/item-generation-admin.model';

@Component({
  selector: 'app-item-requirement-aggregation-section',
  standalone: true,
  templateUrl: './item-requirement-aggregation-section.html',
  host: { class: 'd-block w-100' },
})
export class ItemRequirementAggregationSection {
  readonly aggregationSettings =
    input<ItemRequirementAggregationSettings | null>(null);
  readonly qualities = input.required<readonly EditableItemGenerationQuality[]>();
}
