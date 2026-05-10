import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, map } from 'rxjs';
import {
  CombatLuckPreview,
  LuckLabInputState,
} from '../../../core/domain/luck/luck.model';
import { LuckLabPreviews } from '../../../core/services/luck/luck-lab-previews';
import { getErrorMessage } from '../../../core/utils/error-message';
import { RequestToken } from '../../../core/utils/request-token';
import { luckLabComparisonPresets } from './luck-lab-comparison-presets';

export interface CombatComparisonRow {
  label: string;
  attackerLuck: number | null;
  attackerLuckInfluence: number | null;
  defenderLuck: number | null;
  defenderLuckInfluence: number | null;
  hitGreenZone: number | null;
  evasionChance: number | null;
  criticalChance: number | null;
  criticalMultiplier: number | null;
  finalDamage: number | null;
  initiativeScore: number | null;
}

@Injectable()
export class LuckLabCombatComparisonState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly previews = inject(LuckLabPreviews);
  private readonly token = new RequestToken();
  private debounceHandle: ReturnType<typeof setTimeout> | null = null;

  private readonly rowsSource = signal<CombatComparisonRow[]>([]);
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
    }, 250);
  }

  reload(input: LuckLabInputState): void {
    const token = this.token.next();
    const presets = luckLabComparisonPresets(input);

    this.isLoadingSource.set(true);
    this.errorSource.set(null);
    forkJoin(
      presets.map((preset) =>
        this.previews.previewCombat(preset.input).pipe(
          map((rows) => toCombatComparisonRow(preset.label, rows[0] ?? null)),
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
              getErrorMessage(error, 'Combat RNG comparison preview failed.'),
            );
          }
        },
      });
  }
}

function toCombatComparisonRow(
  label: string,
  preview: CombatLuckPreview | null,
): CombatComparisonRow {
  return {
    label,
    attackerLuck: preview?.attackerLuck ?? null,
    attackerLuckInfluence: preview?.attackerLuckInfluence ?? null,
    defenderLuck: preview?.defenderLuck ?? null,
    defenderLuckInfluence: preview?.defenderLuckInfluence ?? null,
    hitGreenZone: preview?.hitGreenZone ?? null,
    evasionChance: preview?.evasionChance ?? null,
    criticalChance: preview?.criticalChance ?? null,
    criticalMultiplier: preview?.criticalMultiplier ?? null,
    finalDamage: preview?.finalDamage ?? null,
    initiativeScore: preview?.initiativeScore ?? null,
  };
}
