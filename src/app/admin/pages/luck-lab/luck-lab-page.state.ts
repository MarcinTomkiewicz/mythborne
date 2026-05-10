import { DestroyRef, Injectable, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { LuckLabState } from '../../../core/services/luck/luck-lab.state';
import { SelectOption } from '../../../core/types/select-option.types';
import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';

@Injectable()
export class LuckLabPageState {
  private readonly destroyRef = inject(DestroyRef);
  readonly lab = inject(LuckLabState);
  readonly definitions = inject(ExplorationDefinitionsState);
  private isFormBound = false;

  readonly form = new FormGroup({
    luckValue: new FormControl<number>(0, { nonNullable: true }),
    testedStatValue: new FormControl<number>(0, { nonNullable: true }),
    spiritualityValue: new FormControl<number>(0, { nonNullable: true }),
    difficultyKey: new FormControl<string | null>(null),
    districtCode: new FormControl<string | null>(null),
    testedStatKey: new FormControl<string | null>(null),
    trialDefinitionId: new FormControl<string | null>(null),
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

  load(): void {
    this.bindForm();
    this.definitions.loadDefinitions();
    this.lab.reloadNow();
  }

  private bindForm(): void {
    if (this.isFormBound) {
      return;
    }

    this.isFormBound = true;
    this.form.controls.luckValue.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.lab.setLuckValue(value));
    this.form.controls.testedStatValue.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.lab.setTestedStatValue(value));
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
}
