import { Injectable, computed, inject } from '@angular/core';
import { LuckGeneratedItemPreview } from '../../../core/domain/luck/luck.model';
import { LuckLabState } from '../../../core/services/luck/luck-lab.state';
import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';
import {
  luckLabBucketLabel,
  luckLabQualityLabel,
} from './luck-lab-item-option-labels';

export interface GeneratedItemBudgetRow {
  label: string;
  value: number;
}

@Injectable()
export class LuckLabGeneratedItemSectionState {
  private readonly lab = inject(LuckLabState);
  private readonly definitions = inject(ExplorationDefinitionsState);

  readonly preview = computed(
    () => this.lab.result().generatedItemPreviews[0] ?? null,
  );
  readonly isLoading = computed(() => this.lab.loadingBySection().generatedItem);
  readonly error = computed(() => this.lab.errorsBySection().generatedItem);
  readonly selectedBucketLabel = computed(() =>
    luckLabBucketLabel(this.definitions, this.lab.input().bucketProfileId),
  );
  readonly selectedMaxQualityLabel = computed(() =>
    luckLabQualityLabel(this.definitions, this.lab.input().maxQualityKey),
  );
  readonly budgetRows = computed(() => budgetRows(this.preview()));
}

function budgetRows(
  preview: LuckGeneratedItemPreview | null,
): GeneratedItemBudgetRow[] {
  if (!preview) {
    return [];
  }

  return [
    {
      label: 'Rolled bucket budget',
      value: preview.rolledBudget,
    },
    {
      label: 'Budget before quality multiplier',
      value: preview.budgetBeforeQualityMultiplier,
    },
    {
      label: 'Remaining after base',
      value: preview.remainingBudgetAfterBase,
    },
    {
      label: 'Remaining after prefix',
      value: preview.remainingBudgetAfterPrefix,
    },
    {
      label: 'Remaining after suffix',
      value: preview.remainingBudgetAfterSuffix,
    },
  ];
}
