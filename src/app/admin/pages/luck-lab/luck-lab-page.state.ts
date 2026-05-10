import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { finalize, forkJoin, map } from 'rxjs';
import { TrialPowerRead } from '../../../core/domain/luck/luck.model';
import { LuckLabState } from '../../../core/services/luck/luck-lab.state';
import { LuckLabPreviews } from '../../../core/services/luck/luck-lab-previews';
import { SelectOption } from '../../../core/types/select-option.types';
import { getErrorMessage } from '../../../core/utils/error-message';
import { DEFAULT_LUCK_LAB_INPUT } from '../../../core/utils/luck-lab-mappers';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';

@Injectable()
export class LuckLabPageState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly previews = inject(LuckLabPreviews);
  private readonly comparisonToken = new RequestToken();
  readonly lab = inject(LuckLabState);
  readonly definitions = inject(ExplorationDefinitionsState);
  private isFormBound = false;
  private comparisonDebounceHandle: ReturnType<typeof setTimeout> | null = null;

  readonly form = new FormGroup({
    luckValue: new FormControl<number>(DEFAULT_LUCK_LAB_INPUT.luckValue, {
      nonNullable: true,
    }),
    testedStatValue: new FormControl<number>(
      DEFAULT_LUCK_LAB_INPUT.testedStatValue,
      { nonNullable: true },
    ),
    spiritualityValue: new FormControl<number>(
      DEFAULT_LUCK_LAB_INPUT.spiritualityValue,
      { nonNullable: true },
    ),
    difficultyKey: new FormControl<string | null>(DEFAULT_LUCK_LAB_INPUT.difficultyKey),
    districtCode: new FormControl<string | null>(DEFAULT_LUCK_LAB_INPUT.districtCode),
    testedStatKey: new FormControl<string | null>(DEFAULT_LUCK_LAB_INPUT.testedStatKey),
    trialDefinitionId: new FormControl<string | null>(
      DEFAULT_LUCK_LAB_INPUT.trialDefinitionId,
    ),
  });

  readonly difficultyOptions = computed<SelectOption<string | null>[]>(() => [
    { label: 'Database default', value: null },
    ...this.definitions.difficultyOptions(),
  ]);
  readonly districtOptions = computed<SelectOption<string | null>[]>(() => [
    { label: 'Database default', value: null },
    ...this.definitions.districtOptions(),
  ]);
  readonly statOptions = computed<SelectOption<string | null>[]>(() => [
    { label: 'No stat key', value: null },
    ...this.definitions.statOptions(),
  ]);
  readonly trialOptions = computed<SelectOption<string | null>[]>(() => [
    { label: 'Database default', value: null },
    ...this.definitions.trialDefinitions().map((trial) => ({
      label: `${trial.label} (${trial.key})`,
      value: trial.id,
    })),
  ]);
  readonly isLoading = computed(
    () => this.definitions.isLoadingDefinitions() || this.lab.isLoading(),
  );
  readonly error = computed(() => this.definitions.error() ?? this.lab.error());
  readonly trialPower = computed(() => this.lab.result().trialPower);
  readonly luckInfluence = computed(() => this.lab.result().luckInfluence);
  readonly isTrialPowerLoading = computed(
    () => this.lab.loadingBySection().trialPower,
  );
  readonly trialPowerError = computed(() => this.lab.errorsBySection().trialPower);
  readonly trialPowerComparisonRows = computed(() => this.trialPowerComparisonRowsSource());
  readonly isTrialPowerComparisonLoading = computed(
    () => this.isTrialPowerComparisonLoadingSource(),
  );
  readonly trialPowerComparisonError = computed(
    () => this.trialPowerComparisonErrorSource(),
  );
  readonly trialPowerEquation = computed(() => {
    const trialPower = this.trialPower();

    if (!trialPower) {
      return 'Waiting for DB Trial Power preview.';
    }

    return `${trialPower.testedStatValue} + ${trialPower.luckInfluence} = ${trialPower.trialPower}`;
  });
  private readonly trialPowerComparisonRowsSource = signal<TrialPowerComparisonRow[]>([]);
  private readonly isTrialPowerComparisonLoadingSource = signal(false);
  private readonly trialPowerComparisonErrorSource = signal<string | null>(null);

  load(): void {
    this.bindForm();
    this.definitions.loadDefinitions();
    this.lab.reloadNow();
    this.reloadTrialPowerComparisons();
  }

  private bindForm(): void {
    if (this.isFormBound) {
      return;
    }

    this.isFormBound = true;
    this.form.controls.luckValue.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.lab.setLuckValue(value);
        this.scheduleTrialPowerComparisonReload();
      });
    this.form.controls.testedStatValue.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.lab.setTestedStatValue(value);
        this.scheduleTrialPowerComparisonReload();
      });
    this.form.controls.spiritualityValue.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.lab.setSpiritualityValue(value));
    this.form.controls.difficultyKey.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.lab.setDifficultyKey(value));
    this.form.controls.districtCode.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.lab.setDistrictCode(value));
    this.form.controls.testedStatKey.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.lab.setTestedStatKey(value));
    this.form.controls.trialDefinitionId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.lab.setTrialDefinitionId(value));
  }

  private scheduleTrialPowerComparisonReload(): void {
    if (this.comparisonDebounceHandle !== null) {
      clearTimeout(this.comparisonDebounceHandle);
    }

    this.comparisonDebounceHandle = setTimeout(() => {
      this.comparisonDebounceHandle = null;
      this.reloadTrialPowerComparisons();
    }, 250);
  }

  private reloadTrialPowerComparisons(): void {
    const token = this.comparisonToken.next();
    const input = this.lab.input();
    const statStep = 10;
    const presets = [
      {
        label: 'Current sliders',
        input,
      },
      {
        label: 'Luck 0, same stat',
        input: {
          ...input,
          luckValue: 0,
        },
      },
      {
        label: `Same Luck, stat +${statStep}`,
        input: {
          ...input,
          testedStatValue: input.testedStatValue + statStep,
        },
      },
      {
        label: `Same Luck, stat -${statStep}`,
        input: {
          ...input,
          testedStatValue: Math.max(0, input.testedStatValue - statStep),
        },
      },
    ];

    this.isTrialPowerComparisonLoadingSource.set(true);
    this.trialPowerComparisonErrorSource.set(null);
    forkJoin(
      presets.map((preset) =>
        this.previews.previewTrialPower(preset.input).pipe(
          map((rows) => toTrialPowerComparisonRow(preset.label, rows[0] ?? null)),
        ),
      ),
    )
      .pipe(
        finalize(() => {
          if (this.comparisonToken.isCurrent(token)) {
            this.isTrialPowerComparisonLoadingSource.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (rows) => {
          if (this.comparisonToken.isCurrent(token)) {
            this.trialPowerComparisonRowsSource.set(rows);
          }
        },
        error: (error: unknown) => {
          if (this.comparisonToken.isCurrent(token)) {
            this.trialPowerComparisonErrorSource.set(
              getErrorMessage(error, 'Trial Power comparison preview failed.'),
            );
          }
        },
      });
  }
}

interface TrialPowerComparisonRow {
  label: string;
  testedStatValue: number | null;
  luckValue: number | null;
  luckInfluence: number | null;
  trialPower: number | null;
}

function toTrialPowerComparisonRow(
  label: string,
  trialPower: TrialPowerRead | null,
): TrialPowerComparisonRow {
  return {
    label,
    testedStatValue: trialPower?.testedStatValue ?? null,
    luckValue: trialPower?.luckValue ?? null,
    luckInfluence: trialPower?.luckInfluence ?? null,
    trialPower: trialPower?.trialPower ?? null,
  };
}
