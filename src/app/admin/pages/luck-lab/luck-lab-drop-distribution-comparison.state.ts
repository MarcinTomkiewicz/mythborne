import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, map } from 'rxjs';
import {
  LuckLabDropDistributionSummary,
  LuckLabInputState,
} from '../../../core/domain/luck/luck.model';
import { LuckLabPreviews } from '../../../core/services/luck/luck-lab-previews';
import { getErrorMessage } from '../../../core/utils/error-message';
import { RequestToken } from '../../../core/utils/request-token';
import { luckLabComparisonPresets } from './luck-lab-comparison-presets';

const DROP_DISTRIBUTION_COMPARISON_DEBOUNCE_MS = 900;

export interface DropDistributionComparisonRow {
  label: string;
  luckValue: number | null;
  luckInfluence: number | null;
  averageItemValue: number | null;
  medianItemValue: number | null;
  highValueRate: number | null;
  prefixHitRate: number | null;
  suffixHitRate: number | null;
  averageDeltaFromLuckZero: number | null;
}

@Injectable()
export class LuckLabDropDistributionComparisonState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly previews = inject(LuckLabPreviews);
  private readonly token = new RequestToken();
  private debounceHandle: ReturnType<typeof setTimeout> | null = null;

  private readonly rowsSource = signal<DropDistributionComparisonRow[]>([]);
  private readonly isLoadingSource = signal(false);
  private readonly errorSource = signal<string | null>(null);

  readonly rows = computed(() => this.rowsSource());
  readonly isLoading = computed(() => this.isLoadingSource());
  readonly error = computed(() => this.errorSource());

  schedule(input: LuckLabInputState): void {
    if (this.debounceHandle !== null) {
      clearTimeout(this.debounceHandle);
    }

    this.token.next();
    this.isLoadingSource.set(true);
    this.errorSource.set(null);
    this.debounceHandle = setTimeout(() => {
      this.debounceHandle = null;
      this.reload(input);
    }, DROP_DISTRIBUTION_COMPARISON_DEBOUNCE_MS);
  }

  reload(input: LuckLabInputState): void {
    const token = this.token.next();
    const presets = luckLabComparisonPresets(input);

    this.isLoadingSource.set(true);
    this.errorSource.set(null);
    forkJoin(
      presets.map((preset) =>
        this.previews.previewDropDistribution(preset.input).pipe(
          map((summary) => toDropDistributionComparisonRow(preset.label, summary)),
        ),
      ),
    )
      .pipe(
        finalize(() => {
          if (this.token.isCurrent(token)) {
            this.isLoadingSource.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (rows) => {
          if (this.token.isCurrent(token)) {
            this.rowsSource.set(rows);
          }
        },
        error: (error: unknown) => {
          if (this.token.isCurrent(token)) {
            this.errorSource.set(
              getErrorMessage(error, 'Drop distribution comparison preview failed.'),
            );
          }
        },
      });
  }
}

function toDropDistributionComparisonRow(
  label: string,
  summary: LuckLabDropDistributionSummary,
): DropDistributionComparisonRow {
  return {
    label,
    luckValue: summary.current?.luckValue ?? null,
    luckInfluence: summary.current?.luckInfluence ?? null,
    averageItemValue: summary.current?.averageItemValue ?? null,
    medianItemValue: summary.current?.medianItemValue ?? null,
    highValueRate: summary.current?.highValueRate ?? null,
    prefixHitRate: summary.current?.prefixHitRate ?? null,
    suffixHitRate: summary.current?.suffixHitRate ?? null,
    averageDeltaFromLuckZero: summary.averageDelta,
  };
}
