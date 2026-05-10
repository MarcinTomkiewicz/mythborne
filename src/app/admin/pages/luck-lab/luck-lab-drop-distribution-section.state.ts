import { Injectable, computed, effect, inject } from '@angular/core';
import {
  LuckLabDistributionRow,
  LuckLabDropDistributionMetrics,
} from '../../../core/domain/luck/luck.model';
import { LuckLabState } from '../../../core/services/luck/luck-lab.state';
import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';
import {
  luckLabBucketLabel,
  luckLabQualityLabel,
} from './luck-lab-item-option-labels';
import { LuckLabDropDistributionComparisonState } from './luck-lab-drop-distribution-comparison.state';

export interface DropDistributionMetricRow {
  label: string;
  currentValue: number | null;
  compareValue: number | null;
  delta: number | null;
  unit: 'number' | 'percent' | 'drachma';
}

@Injectable()
export class LuckLabDropDistributionSectionState {
  private readonly lab = inject(LuckLabState);
  private readonly definitions = inject(ExplorationDefinitionsState);
  private readonly comparison = inject(LuckLabDropDistributionComparisonState);
  private isLoaded = false;

  readonly summary = computed(() => this.lab.result().dropDistribution);
  readonly isLoading = computed(() => this.lab.loadingBySection().dropDistribution);
  readonly error = computed(() => this.lab.errorsBySection().dropDistribution);
  readonly selectedBucketLabel = computed(() =>
    luckLabBucketLabel(this.definitions, this.lab.input().bucketProfileId),
  );
  readonly selectedMaxQualityLabel = computed(() =>
    luckLabQualityLabel(this.definitions, this.lab.input().maxQualityKey),
  );
  readonly metricRows = computed(() => {
    const summary = this.summary();

    return [
      metricRow(
        'Average value',
        summary.current,
        summary.comparison,
        'averageItemValue',
        'drachma',
      ),
      metricRow(
        'Median value',
        summary.current,
        summary.comparison,
        'medianItemValue',
        'drachma',
      ),
      metricRow(
        'Minimum value',
        summary.current,
        summary.comparison,
        'minItemValue',
        'drachma',
      ),
      metricRow(
        'Maximum value',
        summary.current,
        summary.comparison,
        'maxItemValue',
        'drachma',
      ),
      metricRow(
        'Prefix hit rate',
        summary.current,
        summary.comparison,
        'prefixHitRate',
        'percent',
      ),
      metricRow(
        'Suffix hit rate',
        summary.current,
        summary.comparison,
        'suffixHitRate',
        'percent',
      ),
      metricRow(
        'High-value rate',
        summary.current,
        summary.comparison,
        'highValueRate',
        'percent',
      ),
      metricRow(
        'Outstanding rate',
        summary.current,
        summary.comparison,
        'outstandingRate',
        'percent',
      ),
    ];
  });
  readonly comparisonRows = computed(() => this.comparison.rows());
  readonly isComparisonLoading = computed(() => this.comparison.isLoading());
  readonly comparisonError = computed(() => this.comparison.error());

  constructor() {
    effect(() => {
      const input = this.lab.input();
      input.luckValue;
      input.bucketProfileId;
      input.maxQualityKey;
      input.previewCount;

      if (this.isLoaded) {
        this.comparison.schedule(input);
      }
    });
  }

  load(): void {
    this.isLoaded = true;
    this.comparison.reload(this.lab.input());
  }

  valueText(value: number | null, unit: DropDistributionMetricRow['unit']): string {
    if (value === null) {
      return 'N/A';
    }

    if (unit === 'percent') {
      return `${value}%`;
    }

    if (unit === 'drachma') {
      return `${value} drachma`;
    }

    return `${value}`;
  }

  percentText(value: number | null): string {
    return value === null ? 'N/A' : `${value}%`;
  }

  distributionLabel(row: LuckLabDistributionRow): string {
    return `${row.label} (${row.key})`;
  }
}

function metricRow(
  label: string,
  current: LuckLabDropDistributionMetrics | null,
  comparison: LuckLabDropDistributionMetrics | null,
  key: keyof Omit<LuckLabDropDistributionMetrics, 'luckValue' | 'luckInfluence'>,
  unit: DropDistributionMetricRow['unit'],
): DropDistributionMetricRow {
  const currentValue = current?.[key] ?? null;
  const compareValue = comparison?.[key] ?? null;

  return {
    label,
    currentValue,
    compareValue,
    delta:
      currentValue !== null && compareValue !== null
        ? currentValue - compareValue
        : null,
    unit,
  };
}
