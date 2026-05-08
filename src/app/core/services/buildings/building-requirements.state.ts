import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, NonNullableFormBuilder } from '@angular/forms';
import { finalize, forkJoin, Observable, of, switchMap } from 'rxjs';
import {
  REQUIREMENT_ENTITY_TYPES,
  REQUIREMENT_VALUE_TYPES,
} from '../../constants/requirement.const';
import {
  BuildingRequirementDefinition,
  BuildingRequirementDraft,
  BuildingRequirementEntityType,
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
  private loadRequestId = 0;
  private saveRequestId = 0;
  private currentEntityKey = '';

  load(buildingId: string | null | undefined, options: { silent?: boolean } = {}): void {
    this.loadForEntity(
      REQUIREMENT_ENTITY_TYPES.BuildingDefinition,
      buildingId,
      'Failed to load building requirements.',
      options,
    );
  }

  loadForEntity(
    entityType: BuildingRequirementEntityType,
    entityId: string | null | undefined,
    errorFallback = 'Failed to load requirements.',
    options: { silent?: boolean } = {},
  ): void {
    const requestId = ++this.loadRequestId;
    this.currentEntityKey = entityKey(entityType, entityId);
    this.isLoading.set(true);
    this.error.set(null);

    const preview$ = entityId
      ? this.admin.getRequirementImpactPreview(entityType, entityId)
      : of<BuildingRequirementImpactPreview[]>([]);

    forkJoin({
      definitions: this.admin.getRequirementDefinitions(),
      previewRows: preview$,
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (this.isCurrentLoad(requestId)) {
            this.isLoading.set(false);
          }
        }),
      )
      .subscribe({
        next: ({ definitions, previewRows }) => {
          if (!this.isCurrentLoad(requestId)) {
            return;
          }

          this.definitions.set(definitions);
          this.applyPreviewRows(previewRows);
        },
        error: (error: unknown) => {
          if (!this.isCurrentLoad(requestId)) {
            return;
          }

          const message = getErrorMessage(error, errorFallback);
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
    this.saveForEntity(
      index,
      REQUIREMENT_ENTITY_TYPES.BuildingDefinition,
      buildingId,
      'Save or select a building before editing central requirements.',
    );
  }

  saveForEntity(
    index: number,
    entityType: BuildingRequirementEntityType,
    entityId: string | null | undefined,
    missingEntityMessage: string,
  ): void {
    const control = this.form.at(index);

    if (!entityId || !control) {
      this.error.set(missingEntityMessage);
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
      : this.admin.createEntityRequirement(
          entityType,
          entityId,
          draft,
          definition.valueType,
        );

    this.runMutation(
      request$,
      entityType,
      entityId,
      'Requirement saved',
      'Requirement save failed',
      'Failed to save central requirement.',
    );
  }

  deactivate(index: number, buildingId: string | null | undefined): void {
    this.deactivateForEntity(
      index,
      REQUIREMENT_ENTITY_TYPES.BuildingDefinition,
      buildingId,
      'Save or select a building before editing central requirements.',
    );
  }

  deactivateForEntity(
    index: number,
    entityType: BuildingRequirementEntityType,
    entityId: string | null | undefined,
    missingEntityMessage: string,
  ): void {
    const control = this.form.at(index);

    if (!control) {
      return;
    }

    const id = control.controls.id.value;

    if (!id) {
      this.form.removeAt(index);
      return;
    }

    if (!entityId) {
      this.error.set(missingEntityMessage);
      return;
    }

    this.isSaving.set(true);
    this.runMutation(
      this.admin.deactivateRequirement(id, control.controls.reason.value),
      entityType,
      entityId,
      'Requirement deactivated',
      'Requirement deactivate failed',
      'Failed to deactivate central requirement.',
    );
  }

  reactivate(
    row: BuildingRequirementImpactPreview,
    buildingId: string | null | undefined,
  ): void {
    this.reactivateForEntity(
      row,
      REQUIREMENT_ENTITY_TYPES.BuildingDefinition,
      buildingId,
      'Save or select a building before editing central requirements.',
    );
  }

  reactivateForEntity(
    row: BuildingRequirementImpactPreview,
    entityType: BuildingRequirementEntityType,
    entityId: string | null | undefined,
    missingEntityMessage: string,
  ): void {
    if (!entityId) {
      this.error.set(missingEntityMessage);
      return;
    }

    this.isSaving.set(true);
    this.runMutation(
      this.admin.updateRequirement(
        draftFromRequirementImpactPreview(row),
        row.requirementValueType,
      ),
      entityType,
      entityId,
      'Requirement reactivated',
      'Requirement reactivate failed',
      'Failed to reactivate central requirement.',
    );
  }

  private runMutation(
    request$: Observable<void>,
    entityType: BuildingRequirementEntityType,
    entityId: string,
    successTitle: string,
    errorTitle: string,
    errorFallback: string,
  ): void {
    const requestId = ++this.saveRequestId;
    const expectedEntityKey = entityKey(entityType, entityId);
    request$
      .pipe(
        switchMap(() => this.admin.getRequirementImpactPreview(entityType, entityId)),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (this.isCurrentSave(requestId)) {
            this.isSaving.set(false);
          }
        }),
      )
      .subscribe({
        next: (previewRows) => {
          if (
            !this.isCurrentSave(requestId) ||
            this.currentEntityKey !== expectedEntityKey
          ) {
            return;
          }

          this.error.set(null);
          this.applyPreviewRows(previewRows);
          this.toast.show('success', successTitle, 'Central requirement was updated.');
        },
        error: (error: unknown) => {
          if (!this.isCurrentSave(requestId)) {
            return;
          }

          const message = getErrorMessage(error, errorFallback);
          this.error.set(message);
          this.toast.show('error', errorTitle, message);
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

  private isCurrentLoad(requestId: number): boolean {
    return requestId === this.loadRequestId;
  }

  private isCurrentSave(requestId: number): boolean {
    return requestId === this.saveRequestId;
  }
}

function entityKey(
  entityType: BuildingRequirementEntityType,
  entityId: string | null | undefined,
): string {
  return `${entityType}:${entityId ?? ''}`;
}
