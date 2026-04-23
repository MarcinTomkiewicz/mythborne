import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, startWith, take } from 'rxjs';
import {
  BuildingResourceType,
  EditableBuildingBonus,
  EditableBuildingRequirement,
  EditableBuilding,
  BuildingAdminData,
} from '../../domain/building/building.model';
import { resolveBuildingImagePath } from '../../domain/building/building-image-paths';
import { BuildingAdminFormFactory } from '../../factories/forms/building-admin-form.factory';
import {
  BuildingBonusForm,
  BuildingEditorForm,
  BuildingRequirementForm,
  BuildingResourceCostForm,
} from '../../types/forms/building-admin-form.types';
import {
  resourceOrder,
  toBuildingBonusLabel,
  toBuildingBonusValue,
  toBuildingDurationLabel,
  toBuildingRequirementSummary,
  toBuildingRequirementTypeLabel,
  toResourceLabel,
} from '../../utils/building-display';
import { createEntityEditorState } from '../../utils/entity-editor-state';
import { getErrorMessage } from '../../utils/error-message';
import { trimText } from '../../utils/normalize-text';
import { nonNegativeInteger } from '../../utils/number';
import { FormulaService } from '../formula/formula';
import { BuildingProgressionService } from '../progression/building-progression';
import { ToastService } from '../ui/toast';
import { BuildingAdminService } from './building-admin';
import { BuildingFormulaAdminFacade } from './building-formula-admin.facade';

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
  private readonly progression = inject(BuildingProgressionService);
  private readonly formFactory = inject(BuildingAdminFormFactory);
  private readonly toast = inject(ToastService);

  readonly formulas = inject(BuildingFormulaAdminFacade);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly adminData = signal<BuildingAdminData>(EMPTY_ADMIN_DATA);
  readonly previewLevel = signal(1);

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

  readonly imagePreviewPath = computed(() => {
    const value = this.editorValue();
    return (
      resolveBuildingImagePath(value.key, value.districtCode) ||
      trimText(value.imagePath) ||
      '/assets/icons/capitol.svg'
    );
  });

  readonly preview = computed(() => {
    const rules = this.formulas.rules();
    const value = this.editorValue();
    const level = nonNegativeInteger(this.previewLevel());
    const rank = Number(value.rankRequired ?? 1);

    if (!rules.costExpression || !rules.timeExpression || !rules.bonusExpression) {
      return { nextCosts: [], nextTime: null, bonuses: [], requirements: [] };
    }

    const nextCosts = this.resourceCostsArray.controls
      .map((control) => control.getRawValue())
      .filter((cost) => Number(cost.appliesFromLevel) <= level + 1)
      .reduce((acc, cost) => {
        const amount =
          this.progression.getUpgradeCost(level, Number(cost.baseValue), rank, rules) ?? 0;
        const existing = acc.find((entry) => entry.resourceType === cost.resourceType);
        existing
          ? (existing.amount += amount)
          : acc.push({ resourceType: cost.resourceType, amount });
        return acc;
      }, [] as Array<{ resourceType: BuildingResourceType; amount: number }>)
      .sort((left, right) => resourceOrder(left.resourceType) - resourceOrder(right.resourceType));

    return {
      nextCosts,
      nextTime: this.progression.getUpgradeTimeMinutes(
        level,
        Number(value.baseBuildTimeMinutes ?? 0),
        rank,
        rules
      ),
      bonuses: this.bonusesArray.controls.map((control) => {
        const bonus = control.getRawValue() as EditableBuildingBonus;
        return {
          target: bonus.target,
          type: bonus.type,
          current: this.progression.getBonusValue(level, Number(bonus.value), rules) ?? 0,
          next: this.progression.getBonusValue(level + 1, Number(bonus.value), rules) ?? 0,
        };
      }),
      requirements: this.requirementsArray.controls
        .map((control) => control.getRawValue() as EditableBuildingRequirement)
        .filter((requirement) => Number(requirement.appliesFromLevel) <= level + 1),
    };
  });

  get bonusesArray() {
    return this.building.editorForm.controls.bonuses;
  }

  get resourceCostsArray() {
    return this.building.editorForm.controls.resourceCosts;
  }

  get requirementsArray() {
    return this.building.editorForm.controls.requirements;
  }

  bonusGroups(): BuildingBonusForm[] {
    return this.bonusesArray.controls;
  }

  costGroups(): BuildingResourceCostForm[] {
    return this.resourceCostsArray.controls;
  }

  requirementGroups(): BuildingRequirementForm[] {
    return this.requirementsArray.controls;
  }

  loadData(preferredKey?: string) {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      adminData: this.adminService.getAdminData(),
      formulaData: this.formulaService.refreshAdminData(),
    })
      .pipe(
        take(1),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: ({ adminData, formulaData }) => {
          this.adminData.set(adminData);
          this.building.setItems(adminData.buildings, preferredKey);
          this.formulas.setData(formulaData);
        },
        error: (error: unknown) => {
          const message = getErrorMessage(error, 'Failed to load buildings.');
          this.error.set(message);
          this.toast.show('error', 'Buildings unavailable', message);
        },
      });
  }

  addBonus() {
    this.bonusesArray.push(this.formFactory.createBonusGroup());
  }

  removeBonus(index: number) {
    this.bonusesArray.removeAt(index);
  }

  addCost() {
    this.resourceCostsArray.push(this.formFactory.createCostGroup());
  }

  removeCost(index: number) {
    this.resourceCostsArray.removeAt(index);
  }

  addRequirement() {
    this.requirementsArray.push(this.formFactory.createRequirementGroup());
  }

  removeRequirement(index: number) {
    this.requirementsArray.removeAt(index);
  }

  applyTemplate(index: number, templateId: string) {
    const template = this.adminData().bonusTemplates.find(
      (entry) => entry.templateId === templateId
    );
    template && this.bonusesArray.at(index).patchValue(template);
  }

  updateRequirementType(index: number, type: string) {
    type !== 'hero_stat' && this.requirementsArray.at(index).patchValue({ statKey: null });
  }

  saveBuilding() {
    const draft = this.building.draft();
    this.isSaving.set(true);
    this.adminService
      .saveBuilding(draft)
      .pipe(
        take(1),
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

  toBonusLabel(target: string): string {
    return toBuildingBonusLabel(target);
  }

  toBonusValue(value: number, type: 'flat' | 'percent'): string {
    return toBuildingBonusValue(value, type);
  }

  toDurationLabel(minutes: number | null): string {
    return toBuildingDurationLabel(minutes);
  }

  requirementTypeLabel(type: EditableBuildingRequirement['type']): string {
    return toBuildingRequirementTypeLabel(type);
  }

  requirementSummary(requirement: EditableBuildingRequirement): string {
    return toBuildingRequirementSummary(requirement, this.adminData().stats);
  }

  resourceLabel(type: BuildingResourceType): string {
    return toResourceLabel(type);
  }

  handleImageError(event: Event) {
    const element = event.target as HTMLImageElement | null;

    if (element && !element.dataset['fallback']) {
      element.dataset['fallback'] = 'true';
      element.src = '/assets/icons/capitol.svg';
    }
  }
}
