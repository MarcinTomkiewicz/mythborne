import { DestroyRef, Injectable, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { LuckLabState } from '../../../core/services/luck/luck-lab.state';
import { SelectOption } from '../../../core/types/select-option.types';
import { DEFAULT_LUCK_LAB_INPUT } from '../../../core/utils/luck-lab-mappers';
import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';
import { LuckLabComparisonState } from './luck-lab-comparison.state';

@Injectable()
export class LuckLabPageState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly comparisons = inject(LuckLabComparisonState);
  readonly lab = inject(LuckLabState);
  readonly definitions = inject(ExplorationDefinitionsState);
  private isFormBound = false;

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
  readonly trialPowerComparisonRows = computed(() => this.comparisons.trialPowerRows());
  readonly isTrialPowerComparisonLoading = computed(
    () => this.comparisons.isTrialPowerLoading(),
  );
  readonly trialPowerComparisonError = computed(
    () => this.comparisons.trialPowerError(),
  );
  readonly trialPowerEquation = computed(() => {
    const trialPower = this.trialPower();

    if (!trialPower) {
      return 'Waiting for DB Trial Power preview.';
    }

    return `${trialPower.testedStatValue} + ${trialPower.luckInfluence} = ${trialPower.trialPower}`;
  });
  readonly trialOpportunityPreview = computed(() =>
    this.lab.result().chancePreviews.find(
      (preview) => preview.surfaceKey === 'trial_opportunity',
    ) ?? null,
  );
  readonly trialManifestationPreview = computed(() =>
    this.lab.result().chancePreviews.find(
      (preview) => preview.surfaceKey === 'trial_manifestation',
    ) ?? null,
  );
  readonly isTrialChanceLoading = computed(
    () => this.lab.loadingBySection().chancePreviews,
  );
  readonly trialChanceError = computed(() => this.lab.errorsBySection().chancePreviews);
  readonly trialChanceComparisonRows = computed(() =>
    this.comparisons.trialChanceRows(),
  );
  readonly isTrialChanceComparisonLoading = computed(
    () => this.comparisons.isTrialChanceLoading(),
  );
  readonly trialChanceComparisonError = computed(
    () => this.comparisons.trialChanceError(),
  );
  readonly selectedTrialContextLabel = computed(() => {
    const trialDefinitionId = this.lab.input().trialDefinitionId;

    if (!trialDefinitionId) {
      return 'DB default';
    }

    const trial = this.definitions
      .trialDefinitions()
      .find((definition) => definition.id === trialDefinitionId);

    return trial ? `${trial.label} (${trial.key})` : 'Referenced trial not loaded';
  });
  readonly selectedTrialContextId = computed(() => this.lab.input().trialDefinitionId);

  load(): void {
    this.bindForm();
    this.definitions.loadDefinitions();
    this.lab.reloadNow();
    this.comparisons.reloadTrialPower(this.lab.input());
    this.comparisons.reloadTrialChance(this.lab.input());
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
        this.comparisons.scheduleTrialPower(this.lab.input());
        this.comparisons.scheduleTrialChance(this.lab.input());
      });
    this.form.controls.testedStatValue.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.lab.setTestedStatValue(value);
        this.comparisons.scheduleTrialPower(this.lab.input());
        this.comparisons.scheduleTrialChance(this.lab.input());
      });
    this.form.controls.spiritualityValue.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.lab.setSpiritualityValue(value);
        this.comparisons.scheduleTrialChance(this.lab.input());
      });
    this.form.controls.difficultyKey.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.lab.setDifficultyKey(value);
        this.comparisons.scheduleTrialChance(this.lab.input());
      });
    this.form.controls.districtCode.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.lab.setDistrictCode(value);
        this.comparisons.scheduleTrialChance(this.lab.input());
      });
    this.form.controls.testedStatKey.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.lab.setTestedStatKey(value);
        this.comparisons.scheduleTrialChance(this.lab.input());
      });
    this.form.controls.trialDefinitionId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.lab.setTrialDefinitionId(value);
        this.comparisons.scheduleTrialChance(this.lab.input());
      });
  }
}
