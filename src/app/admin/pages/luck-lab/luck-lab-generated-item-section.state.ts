import { Injectable, computed, inject } from '@angular/core';
import { LuckGeneratedItemPreview } from '../../../core/domain/luck/luck.model';
import { LuckLabState } from '../../../core/services/luck/luck-lab.state';
import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';

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
    bucketLabel(this.definitions, this.lab.input().bucketProfileId),
  );
  readonly selectedMaxQualityLabel = computed(() =>
    qualityLabel(this.definitions, this.lab.input().maxQualityKey),
  );
  readonly budgetRows = computed(() => budgetRows(this.preview()));
}

function bucketLabel(
  definitions: ExplorationDefinitionsState,
  bucketProfileId: string | null,
): string {
  if (!bucketProfileId) {
    return 'DB default';
  }

  const profile = definitions
    .itemBucketProfiles()
    .find((entry) => entry.id === bucketProfileId || entry.key === bucketProfileId);

  return profile ? `${profile.name} (${profile.key})` : 'Referenced bucket not loaded';
}

function qualityLabel(
  definitions: ExplorationDefinitionsState,
  maxQualityKey: string | null,
): string {
  if (!maxQualityKey) {
    return 'DB default';
  }

  const quality = definitions
    .itemQualities()
    .find((entry) => entry.key === maxQualityKey);

  return quality ? `${quality.label} (${quality.key})` : 'Referenced quality not loaded';
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
