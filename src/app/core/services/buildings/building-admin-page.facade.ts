import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, startWith } from 'rxjs';
import {
  BuildingFormulaOverrides,
  EditableBuilding,
  BuildingAdminData,
} from '../../domain/building/building.model';
import { resolveBuildingImagePath } from '../../domain/building/building-image-paths';
import { BuildingAdminFormFactory } from '../../factories/forms/building-admin-form.factory';
import { BuildingEditorForm } from '../../types/forms/building-admin-form.types';
import {
  toBuildingBonusLabel,
  toBuildingBonusValue,
  toBuildingDurationLabel,
  toResourceLabel,
} from '../../utils/building-display';
import { createEntityEditorState } from '../../utils/entity-editor-state';
import { getErrorMessage } from '../../utils/error-message';
import { createFormArrayEditor } from '../../utils/form-array-editor';
import { trimText } from '../../utils/normalize-text';
import { nonNegativeInteger } from '../../utils/number';
import { toSlug } from '../../utils/slug';
import { FormulaService } from '../formula/formula';
import { ToastService } from '../ui/toast';
import { BuildingAdminService } from './building-admin';
import { BuildingFormulaPreviewCalculator } from './building-formula-preview-calculator';
import { BuildingFormulaAdminFacade } from './building-formula-admin.facade';
import { BuildingImpactPreviewState } from './building-impact-preview.state';
import { BuildingProgressionPreviewState } from './building-progression-preview.state';
import { BuildingRequirementsState } from './building-requirements.state';
import { buildingAdminValueFlags } from './building-admin-value-flags';
import { BuildingUiMetadata } from './building-ui-metadata';

const EMPTY_ADMIN_DATA: BuildingAdminData = {
  buildings: [],
  bonusTemplates: [],
  bonusTemplateMetadata: [],
  districts: [],
  stats: [],
  uiMetadataEntries: [],
};

@Injectable()
export class BuildingsPageFacade {
  private readonly destroyRef = inject(DestroyRef);
  private readonly adminService = inject(BuildingAdminService);
  private readonly formulaService = inject(FormulaService);
  private readonly formulaPreview = inject(BuildingFormulaPreviewCalculator);
  private readonly formFactory = inject(BuildingAdminFormFactory);
  private readonly toast = inject(ToastService);

  readonly formulas = inject(BuildingFormulaAdminFacade);
  readonly impact = inject(BuildingImpactPreviewState);
  readonly progression = inject(BuildingProgressionPreviewState);
  readonly requirements = inject(BuildingRequirementsState);
  readonly uiMetadata = new BuildingUiMetadata(() => this.adminData().uiMetadataEntries);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly adminData = signal<BuildingAdminData>(EMPTY_ADMIN_DATA);
  readonly previewLevel = signal(1);
  readonly format = {
    bonusLabel: toBuildingBonusLabel,
    bonusValue: toBuildingBonusValue,
    duration: toBuildingDurationLabel,
    resource: toResourceLabel,
  };
  readonly bonusTemplateOptions = computed(() =>
    this.adminData().bonusTemplates.map((template) => ({
      label: `${template.target} (${template.type})`,
      value: template.templateId ?? '',
    }))
  );
  readonly districtOptions = computed(() =>
    this.adminData().districts.map((district) => ({
      label: `${district.name} (${district.code})`,
      value: district.code,
    }))
  );

  readonly building = createEntityEditorState<EditableBuilding, BuildingEditorForm>({
    destroyRef: this.destroyRef,
    selectorForm: this.formFactory.createSelectorForm(),
    editorForm: this.formFactory.createEditorForm(),
    createDraft: () => this.formFactory.createDraft(this.adminData()),
    patch: (form, draft) => this.formFactory.patchEditor(form, draft),
    toDraft: (form) => this.formFactory.toDraft(form),
    idOf: (item) => item.id,
    keyOf: (item) => item.key,
  });

  readonly editorValue = toSignal(
    this.building.editorForm.valueChanges.pipe(
      startWith(this.building.editorForm.getRawValue())
    ),
    { initialValue: this.building.editorForm.getRawValue() }
  );
  readonly bonusEditor = createFormArrayEditor(
    this.building.editorForm.controls.bonuses,
    () => this.formFactory.createBonusGroup()
  );
  readonly costEditor = createFormArrayEditor(
    this.building.editorForm.controls.resourceCosts,
    () => this.formFactory.createCostGroup()
  );
  readonly imagePreviewPath = computed(() => {
    const value = this.editorValue();
    return (
      resolveBuildingImagePath(value.key, value.districtCode) ||
      trimText(value.imagePath) ||
      '/assets/icons/capitol.svg'
    );
  });

  readonly preview = computed(() => {
    return this.formulaPreview.singleLevelPreview(
      nonNegativeInteger(this.previewLevel()),
      this.formulaPreviewInput(),
    );
  });
  readonly formulaRangePreview = computed(() => {
    const fromLevel = Number(this.progression.form.controls.fromLevel.value);
    const toLevel = Number(this.progression.form.controls.toLevel.value);

    return this.formulaPreview.rangePreview({
      ...this.formulaPreviewInput(),
      fromLevel,
      toLevel,
      isRangeValid: !this.progression.form.invalid,
    });
  });
  readonly progressionImpactRows = computed(() =>
    this.formulaPreview.progressionImpactRows(
      this.progression.rows(),
      this.formulaRangePreview(),
    )
  );
  readonly advancedValueFlags = computed(() => {
    this.editorValue();

    return buildingAdminValueFlags(
      this.formFactory.toDraft(this.building.editorForm),
      {
        fieldLabel: (key) => this.uiMetadata.adminFieldLabel(key),
        duration: this.format.duration,
        resource: this.format.resource,
      },
    );
  });
  private saveRequestId = 0;

  constructor() {
    this.building.editorForm.controls.name.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((name) => {
        const id = this.building.editorForm.controls.id.value;
        const key = this.building.editorForm.controls.key.value;

        if (id && key) {
          return;
        }

        this.building.editorForm.controls.key.setValue(toSlug(name), {
          emitEvent: false,
        });
      });

    this.building.editorForm.controls.id.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => {
        this.resetProgressionPreviewForCurrentBuilding();
        this.impact.reset();
        this.requirements.reset();

        if (id) {
          this.impact.load(id, { silent: true });
          this.requirements.load(id, { silent: true });
        }
      });
  }

  loadData(preferredKey?: string) {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      adminData: this.adminService.getAdminData(),
      formulaData: this.formulaService.refreshAdminData(),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: ({ adminData, formulaData }) => {
          this.adminData.set(adminData);
          this.building.setItems(adminData.buildings, preferredKey);
          this.formulas.setData(formulaData);
          this.resetProgressionPreviewForCurrentBuilding();

          if (this.building.editorForm.controls.id.value) {
            this.loadBuildingProgressionPreview({ silent: true });
            this.requirements.load(this.building.editorForm.controls.id.value, {
              silent: true,
            });
          } else {
            this.requirements.load(null, { silent: true });
          }
        },
        error: (error: unknown) => {
          const message = getErrorMessage(error, 'Failed to load buildings.');
          this.error.set(message);
          this.toast.show('error', 'Buildings unavailable', message);
        },
      });
  }

  applyTemplate(index: number, templateId: string | null) {
    const template = this.adminData().bonusTemplates.find(
      (entry) => entry.templateId === templateId
    );
    template && this.bonusEditor.at(index).patchValue(template);
  }

  saveBuilding() {
    const draft = this.building.draft();
    const requestId = ++this.saveRequestId;
    const selectionKey = this.saveSelectionKey();

    this.isSaving.set(true);
    this.adminService
      .saveBuilding(draft)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (requestId === this.saveRequestId) {
            this.isSaving.set(false);
          }
        })
      )
      .subscribe({
        next: () => {
          if (requestId !== this.saveRequestId || selectionKey !== this.saveSelectionKey()) {
            return;
          }

          this.toast.show('success', 'Building saved', `${draft.name} was saved.`);
          this.loadData(draft.key);
        },
        error: (error: unknown) => {
          if (requestId !== this.saveRequestId || selectionKey !== this.saveSelectionKey()) {
            return;
          }

          this.toast.show(
            'error',
            'Save failed',
            getErrorMessage(error, 'Failed to save building.')
          );
        },
      });
  }

  updatePreviewLevel(value: string) {
    this.previewLevel.set(nonNegativeInteger(value));
  }

  loadBuildingProgressionPreview(options: { silent?: boolean } = {}): void {
    this.progression.load(this.building.editorForm.controls.id.value, options);
  }

  loadBuildingImpactPreview(options: { silent?: boolean } = {}): void {
    this.impact.load(this.building.editorForm.controls.id.value, options);
  }

  handleImageError(event: Event) {
    const element = event.target as HTMLImageElement | null;

    if (element && !element.dataset['fallback']) {
      element.dataset['fallback'] = 'true';
      element.src = '/assets/icons/capitol.svg';
    }
  }

  private resetProgressionPreviewForCurrentBuilding(): void {
    const building = this.building.draft();
    const fallbackDistrict = this.adminData().districts[0]?.code ?? 'A';

    this.progression.resetForBuilding(building.districtCode, fallbackDistrict);
  }

  private formulaPreviewInput() {
    const value = this.editorValue();

    return {
      building: this.formFactory.toDraft(this.building.editorForm),
      rules: this.formulas.resolveRules(value.formulaOverrides as BuildingFormulaOverrides),
      costs: this.costEditor.controls.map((control) => control.getRawValue()),
      bonuses: this.bonusEditor.controls.map((control) => control.getRawValue()),
    };
  }

  private saveSelectionKey(): string {
    return [
      this.building.editorForm.controls.id.value,
      this.building.editorForm.controls.key.value,
    ].join('|');
  }
}
