import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, map } from 'rxjs';
import { LuckLabInputState } from '../../../core/domain/luck/luck.model';
import { LuckLabPreviews } from '../../../core/services/luck/luck-lab-previews';
import { getErrorMessage } from '../../../core/utils/error-message';
import { RequestToken } from '../../../core/utils/request-token';
import {
  TrialChanceComparisonRow,
  TrialPowerComparisonRow,
  toTrialChanceComparisonRow,
  toTrialPowerComparisonRow,
} from './luck-lab-comparison-rows';

@Injectable()
export class LuckLabComparisonState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly previews = inject(LuckLabPreviews);
  private readonly trialPowerToken = new RequestToken();
  private readonly trialChanceToken = new RequestToken();
  private trialPowerDebounceHandle: ReturnType<typeof setTimeout> | null = null;
  private trialChanceDebounceHandle: ReturnType<typeof setTimeout> | null = null;

  private readonly trialPowerRowsSource = signal<TrialPowerComparisonRow[]>([]);
  private readonly isTrialPowerLoadingSource = signal(false);
  private readonly trialPowerErrorSource = signal<string | null>(null);
  private readonly trialChanceRowsSource = signal<TrialChanceComparisonRow[]>([]);
  private readonly isTrialChanceLoadingSource = signal(false);
  private readonly trialChanceErrorSource = signal<string | null>(null);

  readonly trialPowerRows = computed(() => this.trialPowerRowsSource());
  readonly isTrialPowerLoading = computed(() => this.isTrialPowerLoadingSource());
  readonly trialPowerError = computed(() => this.trialPowerErrorSource());
  readonly trialChanceRows = computed(() => this.trialChanceRowsSource());
  readonly isTrialChanceLoading = computed(() => this.isTrialChanceLoadingSource());
  readonly trialChanceError = computed(() => this.trialChanceErrorSource());

  scheduleTrialPower(input: LuckLabInputState): void {
    if (this.trialPowerDebounceHandle !== null) {
      clearTimeout(this.trialPowerDebounceHandle);
    }

    this.trialPowerDebounceHandle = setTimeout(() => {
      this.trialPowerDebounceHandle = null;
      this.reloadTrialPower(input);
    }, 250);
  }

  reloadTrialPower(input: LuckLabInputState): void {
    const token = this.trialPowerToken.next();
    const statStep = 10;
    const presets = [
      { label: 'Current sliders', input },
      { label: 'Luck 0, same stat', input: { ...input, luckValue: 0 } },
      {
        label: `Same Luck, stat +${statStep}`,
        input: { ...input, testedStatValue: input.testedStatValue + statStep },
      },
      {
        label: `Same Luck, stat -${statStep}`,
        input: {
          ...input,
          testedStatValue: Math.max(0, input.testedStatValue - statStep),
        },
      },
    ];

    this.isTrialPowerLoadingSource.set(true);
    this.trialPowerErrorSource.set(null);
    forkJoin(
      presets.map((preset) =>
        this.previews.previewTrialPower(preset.input).pipe(
          map((rows) => toTrialPowerComparisonRow(preset.label, rows[0] ?? null)),
        ),
      ),
    )
      .pipe(
        finalize(() => {
          if (this.trialPowerToken.isCurrent(token)) {
            this.isTrialPowerLoadingSource.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (rows) => {
          if (this.trialPowerToken.isCurrent(token)) {
            this.trialPowerRowsSource.set(rows);
          }
        },
        error: (error: unknown) => {
          if (this.trialPowerToken.isCurrent(token)) {
            this.trialPowerErrorSource.set(
              getErrorMessage(error, 'Trial Power comparison preview failed.'),
            );
          }
        },
      });
  }

  scheduleTrialChance(input: LuckLabInputState): void {
    if (this.trialChanceDebounceHandle !== null) {
      clearTimeout(this.trialChanceDebounceHandle);
    }

    this.trialChanceDebounceHandle = setTimeout(() => {
      this.trialChanceDebounceHandle = null;
      this.reloadTrialChance(input);
    }, 250);
  }

  reloadTrialChance(input: LuckLabInputState): void {
    const token = this.trialChanceToken.next();
    const highLuckValue = Math.max(input.luckValue + 50, 50);
    const presets = [
      { label: 'Luck 0', input: { ...input, luckValue: 0 } },
      { label: 'Current Luck', input },
      { label: `High Luck ${highLuckValue}`, input: { ...input, luckValue: highLuckValue } },
    ];

    this.isTrialChanceLoadingSource.set(true);
    this.trialChanceErrorSource.set(null);
    forkJoin(
      presets.map((preset) =>
        forkJoin({
          opportunityRows: this.previews.previewTrialOpportunity(preset.input),
          manifestationRows: this.previews.previewTrialManifestation(preset.input),
        }).pipe(
          map((result) =>
            toTrialChanceComparisonRow(
              preset.label,
              result.opportunityRows[0] ?? null,
              result.manifestationRows[0] ?? null,
            ),
          ),
        ),
      ),
    )
      .pipe(
        finalize(() => {
          if (this.trialChanceToken.isCurrent(token)) {
            this.isTrialChanceLoadingSource.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (rows) => {
          if (this.trialChanceToken.isCurrent(token)) {
            this.trialChanceRowsSource.set(rows);
          }
        },
        error: (error: unknown) => {
          if (this.trialChanceToken.isCurrent(token)) {
            this.trialChanceErrorSource.set(
              getErrorMessage(error, 'Trial chance comparison preview failed.'),
            );
          }
        },
      });
  }
}
