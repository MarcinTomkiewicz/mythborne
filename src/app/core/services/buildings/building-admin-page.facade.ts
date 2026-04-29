import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, startWith } from 'rxjs';
import {
  BuildingFormulaOverrides,
  EditableBuildingRequirement,
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
  toBuildingRequirementSummary,
  toBuildingRequirementTypeLabel,
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
import { BuildingProgressionPreviewState } from './building-progression-preview.state';

const EMPTY_ADMIN_DATA: BuildingAdminData = {
  buildings: [],
  bonusTemplates: [],
  districts: [],
  stats: [],
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
  readonly progression = inject(BuildingProgressionPreviewState);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly adminData = signal<BuildingAdminData>(EMPTY_ADMIN_DATA);
  readonly previewLevel = signal(1);
  readonly format = {
    bonusLabel: toBuildingBonusLabel,
    bonusValue: toBuildingBonusValue,
    duration: toBuildingDurationLabel,
    requirementType: toBuildingRequirementTypeLabel,
    resource: toResourceLabel,
    requirementSummary: (requirement: EditableBuildingRequirement) =>
      toBuildingRequirementSummary(requirement, this.adminData().stats),
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
  readonly requirementEditor = createFormArrayEditor(
    this.building.editorForm.controls.requirements,
    () => this.formFactory.createRequirementGroup()
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
      .subscribe(() => this.resetProgressionPreviewForCurrentBuilding());
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

  updateRequirementType(index: number, type: string) {
    type !== 'hero_stat' && this.requirementEditor.at(index).patchValue({ statKey: null });
  }

  saveBuilding() {
    const draft = this.building.draft();
    this.isSaving.set(true);
    this.adminService
      .saveBuilding(draft)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.toast.show('success', 'Building saved', `${draft.name} was saved.`);
          this.loadData(draft.key);
        },
        error: (error: unknown) => {
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
      requirements: this.requirementEditor.controls.map((control) => control.getRawValue()),
    };
  }
}
