import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, NonNullableFormBuilder } from '@angular/forms';
import { finalize, forkJoin, of, switchMap } from 'rxjs';
import { REQUIREMENT_VALUE_TYPES } from '../../constants/requirement.const';
import {
  BuildingRequirementDefinition,
  BuildingRequirementDraft,
  BuildingRequirementImpactPreview,
} from '../../domain/building/building.model';
import { BuildingCanonicalRequirementForm } from '../../types/forms/building-admin-form.types';
import { draftFromRequirementImpactPreview } from '../../utils/building-requirement-rpc.mappers';
import { validateBuildingRequirementDraftForValueType } from '../../utils/building-requirement-value-rpc';
import { getErrorMessage } from '../../utils/error-message';
import { trimText } from '../../utils/normalize-text';
import { ToastService } from '../ui/toast';
import { BuildingRequirementsAdminService } from './building-requirements-admin';

@Injectable()
export class BuildingRequirementsState {
  private readonly admin = inject(BuildingRequirementsAdminService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly toast = inject(ToastService);

  readonly form = new FormArray<BuildingCanonicalRequirementForm>([]);
  readonly definitions = signal<BuildingRequirementDefinition[]>([]);
  readonly previewRows = signal<BuildingRequirementImpactPreview[]>([]);
  readonly inactivePreviewRows = signal<BuildingRequirementImpactPreview[]>([]);
  readonly showInactive = signal(false);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);

  readonly definitionOptions = computed(() =>
    this.definitions().map((definition) => ({
      label: `${definition.label} (${definition.key})`,
      value: definition.key,
    })),
  );

  load(buildingId: string | null | undefined, options: { silent?: boolean } = {}): void {
    this.isLoading.set(true);
    this.error.set(null);

    const preview$ = buildingId
      ? this.admin.getBuildingRequirementImpactPreview(buildingId)
      : of<BuildingRequirementImpactPreview[]>([]);

    forkJoin({
      definitions: this.admin.getRequirementDefinitions(),
      previewRows: preview$,
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: ({ definitions, previewRows }) => {
          this.definitions.set(definitions);
          this.applyPreviewRows(previewRows);
        },
        error: (error: unknown) => {
          const message = getErrorMessage(error, 'Failed to load building requirements.');
          this.error.set(message);

          if (!options.silent) {
            this.toast.show('error', 'Requirements unavailable', message);
          }
        },
      });
  }

  reset(): void {
    this.form.clear();
    this.previewRows.set([]);
    this.inactivePreviewRows.set([]);
    this.showInactive.set(false);
    this.error.set(null);
  }

  add(): void {
    const definition = this.definitions()[0];
    this.form.push(this.createGroup({ requirementDefinitionKey: definition?.key ?? '' }));
  }

  definitionFor(index: number): BuildingRequirementDefinition | null {
    const key = this.form.at(index)?.controls.requirementDefinitionKey.value;
    return this.definitions().find((definition) => definition.key === key) ?? null;
  }

  onDefinitionChange(index: number): void {
    const control = this.form.at(index);

    if (!control) {
      return;
    }

    control.patchValue({
      requiredBuildingKey: null,
      requiredDistrictCode: null,
      requiredResourceType: null,
      requiredStatKey: null,
      requiredValueBoolean:
        this.definitionFor(index)?.valueType === REQUIREMENT_VALUE_TYPES.Boolean
          ? true
          : null,
      requiredValueDecimal: null,
      requiredValueInteger: null,
      requiredValueText: null,
    });
  }

  toggleInactive(): void {
    this.showInactive.update((value) => !value);
  }

  save(index: number, buildingId: string | null | undefined): void {
    const control = this.form.at(index);

    if (!buildingId || !control) {
      this.error.set('Save or select a building before editing central requirements.');
      return;
    }

    const draft = this.toDraft(control);
    const definition = this.definitionFor(index);

    if (!definition) {
      this.error.set('Select a requirement definition before saving.');
      control.markAllAsTouched();
      return;
    }

    try {
      validateBuildingRequirementDraftForValueType(draft, definition.valueType);
    } catch (error: unknown) {
      this.error.set(getErrorMessage(error, 'Requirement value is invalid.'));
      control.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const request$ = draft.id
      ? this.admin.updateRequirement(draft, definition.valueType)
      : this.admin.createRequirement(buildingId, draft, definition.valueType);

    request$
      .pipe(
        switchMap(() => this.admin.getBuildingRequirementImpactPreview(buildingId)),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: (previewRows) => {
          this.error.set(null);
          this.applyPreviewRows(previewRows);
          this.toast.show('success', 'Requirement saved', 'Central requirement was saved.');
        },
        error: (error: unknown) => {
          const message = getErrorMessage(error, 'Failed to save central requirement.');
          this.error.set(message);
          this.toast.show('error', 'Requirement save failed', message);
        },
      });
  }

  deactivate(index: number, buildingId: string | null | undefined): void {
    const control = this.form.at(index);

    if (!control) {
      return;
    }

    const id = control.controls.id.value;

    if (!id) {
      this.form.removeAt(index);
      return;
    }

    if (!buildingId) {
      this.error.set('Save or select a building before editing central requirements.');
      return;
    }

    this.isSaving.set(true);
    this.admin
      .deactivateRequirement(id, control.controls.reason.value)
      .pipe(
        switchMap(() => this.admin.getBuildingRequirementImpactPreview(buildingId)),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: (previewRows) => {
          this.error.set(null);
          this.applyPreviewRows(previewRows);
          this.toast.show('success', 'Requirement deactivated', 'Central requirement was deactivated.');
        },
        error: (error: unknown) => {
          const message = getErrorMessage(error, 'Failed to deactivate central requirement.');
          this.error.set(message);
          this.toast.show('error', 'Requirement deactivate failed', message);
        },
      });
  }

  reactivate(
    row: BuildingRequirementImpactPreview,
    buildingId: string | null | undefined,
  ): void {
    if (!buildingId) {
      this.error.set('Save or select a building before editing central requirements.');
      return;
    }

    this.isSaving.set(true);
    this.admin
      .updateRequirement(
        draftFromRequirementImpactPreview(row),
        row.requirementValueType,
      )
      .pipe(
        switchMap(() => this.admin.getBuildingRequirementImpactPreview(buildingId)),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: (previewRows) => {
          this.error.set(null);
          this.applyPreviewRows(previewRows);
          this.toast.show('success', 'Requirement reactivated', 'Central requirement was reactivated.');
        },
        error: (error: unknown) => {
          const message = getErrorMessage(error, 'Failed to reactivate central requirement.');
          this.error.set(message);
          this.toast.show('error', 'Requirement reactivate failed', message);
        },
      });
  }

  private replaceForms(drafts: BuildingRequirementDraft[]): void {
    this.form.clear();

    for (const draft of drafts) {
      this.form.push(this.createGroup(draft));
    }
  }

  private applyPreviewRows(rows: BuildingRequirementImpactPreview[]): void {
    const activeRows = rows.filter((row) => row.isActive);
    const inactiveRows = rows.filter((row) => !row.isActive);

    this.previewRows.set(activeRows);
    this.inactivePreviewRows.set(inactiveRows);
    this.replaceForms(activeRows.map(draftFromRequirementImpactPreview));

    if (!inactiveRows.length) {
      this.showInactive.set(false);
    }
  }

  private createGroup(
    draft: Partial<BuildingRequirementDraft> = {},
  ): BuildingCanonicalRequirementForm {
    return this.fb.group({
      id: this.fb.control<string | null>(draft.id ?? null),
      requirementDefinitionKey: this.fb.control(draft.requirementDefinitionKey ?? ''),
      appliesFromLevel: this.fb.control(draft.appliesFromLevel ?? 1),
      description: this.fb.control(draft.description ?? ''),
      reason: this.fb.control(draft.reason ?? ''),
      sortOrder: this.fb.control(draft.sortOrder ?? (this.form.length + 1) * 10),
      requiredBuildingKey: this.fb.control<string | null>(draft.requiredBuildingKey ?? null),
      requiredDistrictCode: this.fb.control<string | null>(draft.requiredDistrictCode ?? null),
      requiredResourceType: this.fb.control<string | null>(draft.requiredResourceType ?? null),
      requiredStatKey: this.fb.control<string | null>(draft.requiredStatKey ?? null),
      requiredValueBoolean: this.fb.control<boolean | null>(
        draft.requiredValueBoolean ?? null,
      ),
      requiredValueDecimal: this.fb.control<number | null>(
        draft.requiredValueDecimal ?? null,
      ),
      requiredValueInteger: this.fb.control<number | null>(
        draft.requiredValueInteger ?? null,
      ),
      requiredValueText: this.fb.control<string | null>(draft.requiredValueText ?? null),
    });
  }

  private toDraft(control: BuildingCanonicalRequirementForm): BuildingRequirementDraft {
    const value = control.getRawValue();

    return {
      ...value,
      description: trimText(value.description),
      reason: trimText(value.reason),
    };
  }
}
