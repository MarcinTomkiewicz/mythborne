import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, map } from 'rxjs';
import {
  LuckChancePreview,
  LuckLabInputState,
} from '../../../core/domain/luck/luck.model';
import { LuckLabPreviews } from '../../../core/services/luck/luck-lab-previews';
import { getErrorMessage } from '../../../core/utils/error-message';
import { RequestToken } from '../../../core/utils/request-token';

export interface EncounterComparisonRow {
  label: string;
  luckValue: number | null;
  luckInfluence: number | null;
  baseChance: number | null;
  rawChance: number | null;
  finalChance: number | null;
  capPercent: number | null;
}

@Injectable()
export class LuckLabEncounterComparisonState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly previews = inject(LuckLabPreviews);
  private readonly token = new RequestToken();
  private debounceHandle: ReturnType<typeof setTimeout> | null = null;

  private readonly rowsSource = signal<EncounterComparisonRow[]>([]);
  private readonly isLoadingSource = signal(false);
  private readonly errorSource = signal<string | null>(null);

  readonly rows = computed(() => this.rowsSource());
  readonly isLoading = computed(() => this.isLoadingSource());
  readonly error = computed(() => this.errorSource());

  schedule(input: LuckLabInputState): void {
    if (this.debounceHandle !== null) {
      clearTimeout(this.debounceHandle);
    }

    this.debounceHandle = setTimeout(() => {
      this.debounceHandle = null;
      this.reload(input);
    }, 250);
  }

  reload(input: LuckLabInputState): void {
    const token = this.token.next();
    const highLuckValue = Math.max(input.luckValue + 50, 50);
    const presets = [
      { label: 'Luck 0', input: { ...input, luckValue: 0 } },
      { label: 'Current Luck', input },
      { label: `High Luck ${highLuckValue}`, input: { ...input, luckValue: highLuckValue } },
    ];

    this.isLoadingSource.set(true);
    this.errorSource.set(null);
    forkJoin(
      presets.map((preset) =>
        this.previews.previewNonTrialEncounter(preset.input).pipe(
          map((rows) => toEncounterComparisonRow(preset.label, rows[0] ?? null)),
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
              getErrorMessage(error, 'Encounter fallback comparison preview failed.'),
            );
          }
        },
      });
  }
}

function toEncounterComparisonRow(
  label: string,
  encounter: LuckChancePreview | null,
): EncounterComparisonRow {
  const context = chanceContext(encounter);

  return {
    label,
    luckValue: encounter?.luckValue ?? null,
    luckInfluence: encounter?.luckInfluence ?? null,
    baseChance: numberContextValue(context, 'baseChance'),
    rawChance: numberContextValue(context, 'rawEncounterChance'),
    finalChance: encounter?.chancePercent ?? null,
    capPercent: numberContextValue(context, 'capPercent'),
  };
}

function chanceContext(preview: LuckChancePreview | null): Record<string, unknown> {
  return preview?.contextJson &&
    typeof preview.contextJson === 'object' &&
    !Array.isArray(preview.contextJson)
    ? preview.contextJson
    : {};
}

function numberContextValue(
  context: Record<string, unknown>,
  key: string,
): number | null {
  const value = context[key];

  return typeof value === 'number' ? value : null;
}
