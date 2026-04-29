import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { BuildingProgressionPreview } from '../../domain/building/building.model';
import { getErrorMessage } from '../../utils/error-message';
import { ToastService } from '../ui/toast';
import { BuildingAdminService } from './building-admin';

const BUILDING_PROGRESSION_PREVIEW_MAX_LEVEL_RANGE = 50;

@Injectable()
export class BuildingProgressionPreviewState {
  private readonly adminService = inject(BuildingAdminService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly form = this.formBuilder.group({
    districtCode: this.formBuilder.nonNullable.control('A', Validators.required),
    fromLevel: this.formBuilder.control<string | null>('1', [
      Validators.required,
      positiveIntegerLevelValidator(),
    ]),
    toLevel: this.formBuilder.control<string | null>('8', [
      Validators.required,
      positiveIntegerLevelValidator(),
    ]),
  });
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly warning = signal<string | null>(null);
  readonly rows = signal<BuildingProgressionPreview[]>([]);
  readonly summary = computed(() => this.rows()[0] ?? null);

  load(
    buildingId: string | null | undefined,
    options: { silent?: boolean } = {},
  ): void {
    const input = this.form.getRawValue();

    this.form.markAllAsTouched();
    this.form.updateValueAndValidity({ emitEvent: false });

    if (!buildingId) {
      this.rows.set([]);
      this.warning.set(null);
      this.error.set(
        'Save or select an existing building before loading the database progression preview.',
      );
      return;
    }

    const validationMessage = this.validationMessage();

    if (this.form.invalid || validationMessage) {
      this.rows.set([]);
      this.warning.set(null);
      this.error.set(validationMessage);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.warning.set(null);

    this.adminService
      .getBuildingProgressionPreview({
        buildingId,
        districtCode: input.districtCode,
        fromLevel: input.fromLevel,
        toLevel: input.toLevel,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (preview) => {
          this.applyPreviewRows(preview);

          if (!preview.length) {
            this.error.set(
              'The database returned no building progression rows for the selected range.',
            );
          }
        },
        error: (error: unknown) => {
          const message = getErrorMessage(error, 'Failed to load building progression preview.');
          this.error.set(message);

          if (!options.silent) {
            this.toast.show('error', 'Building preview unavailable', message);
          }
        },
      });
  }

  resetForBuilding(
    buildingDistrictCode: string | null | undefined,
    fallbackDistrictCode: string,
  ): void {
    this.form.patchValue(
      { districtCode: buildingDistrictCode || fallbackDistrictCode },
      { emitEvent: false },
    );
    this.rows.set([]);
    this.error.set(null);
    this.warning.set(null);
  }

  validationMessage(field?: keyof typeof this.form.controls): string {
    const districtCode = this.form.controls.districtCode;
    const fromLevel = this.form.controls.fromLevel;
    const toLevel = this.form.controls.toLevel;
    const fromValue = Number(fromLevel.value);
    const toValue = Number(toLevel.value);

    if (!field || field === 'districtCode') {
      if (districtCode.hasError('required')) {
        return 'District context is required for building progression preview.';
      }
    }

    if (!field || field === 'fromLevel') {
      if (fromLevel.hasError('required')) {
        return 'From level is required.';
      }

      if (fromLevel.hasError('integerLevel')) {
        return 'From level must be a positive integer.';
      }
    }

    if (!field || field === 'toLevel') {
      if (toLevel.hasError('required')) {
        return 'To level is required.';
      }

      if (toLevel.hasError('integerLevel')) {
        return 'To level must be a positive integer.';
      }
    }

    if (!Number.isFinite(fromValue) || !Number.isFinite(toValue)) {
      return 'Preview levels must be finite numbers.';
    }

    if (fromValue > toValue) {
      return 'From level must be less than or equal to to level.';
    }

    if (toValue - fromValue + 1 > BUILDING_PROGRESSION_PREVIEW_MAX_LEVEL_RANGE) {
      return `Preview range cannot exceed ${BUILDING_PROGRESSION_PREVIEW_MAX_LEVEL_RANGE} levels.`;
    }

    return '';
  }

  capLabel(preview: BuildingProgressionPreview): string {
    if (preview.isUnlimited) {
      return 'Unlimited (0 = unlimited)';
    }

    return String(preview.effectiveMaxLevel);
  }

  private applyPreviewRows(preview: BuildingProgressionPreview[]): void {
    const summary = preview[0] ?? null;

    if (!summary) {
      this.rows.set([]);
      return;
    }

    const fromLevel = requiredPositiveInteger(this.form.controls.fromLevel.value);
    const toLevel = requiredPositiveInteger(this.form.controls.toLevel.value);
    const effectiveMaxLevel = summary.effectiveMaxLevel;

    if (summary.isUnlimited || effectiveMaxLevel === 0) {
      this.rows.set(preview);
      return;
    }

    if (fromLevel > effectiveMaxLevel) {
      this.rows.set([]);
      this.error.set('From level is above the effective max level for this building/district.');
      return;
    }

    if (toLevel > effectiveMaxLevel) {
      const upgradeableRows = preview.filter((row) => row.nextLevel <= effectiveMaxLevel);

      this.rows.set(upgradeableRows);

      if (upgradeableRows.length) {
        this.warning.set(
          `Levels above effective max level ${effectiveMaxLevel} are outside the upgrade path and are not shown.`,
        );
      } else {
        this.error.set(
          `Selected range has no upgradeable rows within effective max level ${effectiveMaxLevel}.`,
        );
      }

      return;
    }

    this.rows.set(preview.filter((row) => row.nextLevel <= effectiveMaxLevel));
  }
}

function positiveIntegerLevelValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value === null || value === undefined || value === '') {
      return null;
    }

    return isPositiveIntegerValue(value)
      ? null
      : { integerLevel: true };
  };
}

function requiredPositiveInteger(value: number | string | null | undefined): number {
  if (!isPositiveIntegerValue(value)) {
    throw new Error('Building progression preview level is invalid.');
  }

  return Number(value);
}

function isPositiveIntegerValue(value: number | string | null | undefined): boolean {
  if (value === null || value === undefined || value === '') {
    return false;
  }

  if (typeof value === 'string' && !/^\d+$/.test(value.trim())) {
    return false;
  }

  const normalized = Number(value);

  return Number.isInteger(normalized) && normalized >= 1;
}
