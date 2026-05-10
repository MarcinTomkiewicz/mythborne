import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, map } from 'rxjs';
import { LuckLabInputState } from '../../../core/domain/luck/luck.model';
import { LuckLabPreviews } from '../../../core/services/luck/luck-lab-previews';
import { getErrorMessage } from '../../../core/utils/error-message';
import { RequestToken } from '../../../core/utils/request-token';
import {
  AutoResolveComparisonRow,
  TrialChanceComparisonRow,
  TrialPowerComparisonRow,
  toAutoResolveComparisonRow,
  toTrialChanceComparisonRow,
  toTrialPowerComparisonRow,
} from './luck-lab-comparison-rows';
import { luckLabComparisonPresets } from './luck-lab-comparison-presets';

@Injectable()
export class LuckLabComparisonState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly previews = inject(LuckLabPreviews);
  private readonly trialPowerToken = new RequestToken();
  private readonly trialChanceToken = new RequestToken();
  private readonly autoResolveToken = new RequestToken();
  private trialPowerDebounceHandle: ReturnType<typeof setTimeout> | null = null;
  private trialChanceDebounceHandle: ReturnType<typeof setTimeout> | null = null;
  private autoResolveDebounceHandle: ReturnType<typeof setTimeout> | null = null;

  private readonly trialPowerRowsSource = signal<TrialPowerComparisonRow[]>([]);
  private readonly isTrialPowerLoadingSource = signal(false);
  private readonly trialPowerErrorSource = signal<string | null>(null);
  private readonly trialChanceRowsSource = signal<TrialChanceComparisonRow[]>([]);
  private readonly isTrialChanceLoadingSource = signal(false);
  private readonly trialChanceErrorSource = signal<string | null>(null);
  private readonly autoResolveRowsSource = signal<AutoResolveComparisonRow[]>([]);
  private readonly isAutoResolveLoadingSource = signal(false);
  private readonly autoResolveErrorSource = signal<string | null>(null);

  readonly trialPowerRows = computed(() => this.trialPowerRowsSource());
  readonly isTrialPowerLoading = computed(() => this.isTrialPowerLoadingSource());
  readonly trialPowerError = computed(() => this.trialPowerErrorSource());
  readonly trialChanceRows = computed(() => this.trialChanceRowsSource());
  readonly isTrialChanceLoading = computed(() => this.isTrialChanceLoadingSource());
  readonly trialChanceError = computed(() => this.trialChanceErrorSource());
  readonly autoResolveRows = computed(() => this.autoResolveRowsSource());
  readonly isAutoResolveLoading = computed(() => this.isAutoResolveLoadingSource());
  readonly autoResolveError = computed(() => this.autoResolveErrorSource());

  scheduleTrialPower(input: LuckLabInputState): void {
    if (this.trialPowerDebounceHandle !== null) {
      clearTimeout(this.trialPowerDebounceHandle);
    }

    this.trialPowerToken.next();
    this.isTrialPowerLoadingSource.set(true);
    this.trialPowerErrorSource.set(null);
    this.trialPowerDebounceHandle = setTimeout(() => {
      this.trialPowerDebounceHandle = null;
      this.reloadTrialPower(input);
    }, 250);
  }

  reloadTrialPower(input: LuckLabInputState): void {
    const token = this.trialPowerToken.next();
    const presets = luckLabComparisonPresets(input);

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

    this.trialChanceToken.next();
    this.isTrialChanceLoadingSource.set(true);
    this.trialChanceErrorSource.set(null);
    this.trialChanceDebounceHandle = setTimeout(() => {
      this.trialChanceDebounceHandle = null;
      this.reloadTrialChance(input);
    }, 250);
  }

  reloadTrialChance(input: LuckLabInputState): void {
    const token = this.trialChanceToken.next();
    const presets = luckLabComparisonPresets(input);

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

  scheduleAutoResolve(input: LuckLabInputState): void {
    if (this.autoResolveDebounceHandle !== null) {
      clearTimeout(this.autoResolveDebounceHandle);
    }

    this.autoResolveToken.next();
    this.isAutoResolveLoadingSource.set(true);
    this.autoResolveErrorSource.set(null);
    this.autoResolveDebounceHandle = setTimeout(() => {
      this.autoResolveDebounceHandle = null;
      this.reloadAutoResolve(input);
    }, 250);
  }

  reloadAutoResolve(input: LuckLabInputState): void {
    const token = this.autoResolveToken.next();
    const presets = luckLabComparisonPresets(input);

    this.isAutoResolveLoadingSource.set(true);
    this.autoResolveErrorSource.set(null);
    forkJoin(
      presets.map((preset) =>
        this.previews.previewChallengeAutoResolve(preset.input).pipe(
          map((rows) => toAutoResolveComparisonRow(preset.label, rows[0] ?? null)),
        ),
      ),
    )
      .pipe(
        finalize(() => {
          if (this.autoResolveToken.isCurrent(token)) {
            this.isAutoResolveLoadingSource.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (rows) => {
          if (this.autoResolveToken.isCurrent(token)) {
            this.autoResolveRowsSource.set(rows);
          }
        },
        error: (error: unknown) => {
          if (this.autoResolveToken.isCurrent(token)) {
            this.autoResolveErrorSource.set(
              getErrorMessage(error, 'Auto-resolve comparison preview failed.'),
            );
          }
        },
      });
  }
}
