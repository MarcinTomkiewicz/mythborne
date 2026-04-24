import { Injectable, inject } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import {
  BuildingAdminData,
  BuildingResourceType,
  EditableBuilding,
  EditableBuildingBonus,
  EditableBuildingRequirement,
  EditableBuildingResourceCost,
} from '../../domain/building/building.model';
import { BUILDING_PROGRESSION_TARGET_KEYS } from '../../domain/progression/building-progression.model';
import {
  BuildingBonusForm,
  BuildingEditorForm,
  BuildingFormulaAssignmentForm,
  BuildingFormulaControlName,
  BuildingRequirementForm,
  BuildingResourceCostForm,
  BuildingSelectorForm,
} from '../../types/forms/building-admin-form.types';
import { replaceFormArray } from '../../utils/form-controls';
import { normalizeBonusTarget, normalizeBonusType } from '../../utils/bonus';
import { trimText } from '../../utils/normalize-text';
import { roundedNumber } from '../../utils/number';

@Injectable({ providedIn: 'root' })
export class BuildingAdminFormFactory {
  private readonly fb = inject(NonNullableFormBuilder);

  createSelectorForm(): BuildingSelectorForm {
    return this.fb.group({
      selectedId: this.fb.control(''),
    });
  }

  createFormulaAssignmentForm(): BuildingFormulaAssignmentForm {
    return this.fb.group({
      upgradeCostFormulaId: this.fb.control(''),
      upgradeTimeFormulaId: this.fb.control(''),
      bonusGrowthFormulaId: this.fb.control(''),
    });
  }

  createEditorForm(): BuildingEditorForm {
    return this.fb.group({
      id: this.fb.control(''),
      key: this.fb.control(''),
      name: this.fb.control(''),
      description: this.fb.control(''),
      imagePath: this.fb.control(''),
      districtCode: this.fb.control('A'),
      rankRequired: this.fb.control(1),
      sortOrder: this.fb.control(0),
      baseBuildTimeMinutes: this.fb.control(60),
      maxLevel: this.fb.control(0),
      bonuses: this.fb.array<BuildingBonusForm>([]),
      resourceCosts: this.fb.array<BuildingResourceCostForm>([]),
      requirements: this.fb.array<BuildingRequirementForm>([]),
    });
  }

  createDraft(data: BuildingAdminData): EditableBuilding {
    return {
      id: null,
      key: '',
      name: '',
      description: '',
      imagePath: '',
      districtCode: data.districts[0]?.code ?? 'A',
      rankRequired: 1,
      sortOrder: 0,
      baseBuildTimeMinutes: 60,
      maxLevel: 0,
      bonuses: [],
      resourceCosts: [
        {
          id: null,
          resourceType: 'drachma',
          baseValue: 100,
          appliesFromLevel: 1,
        },
      ],
      requirements: [],
    };
  }

  createBonusGroup(bonus?: EditableBuildingBonus): BuildingBonusForm {
    return this.fb.group({
      templateId: this.fb.control<string | null>(bonus?.templateId ?? null),
      target: this.fb.control(bonus?.target ?? ''),
      type: this.fb.control(normalizeBonusType(bonus?.type)),
      value: this.fb.control(bonus?.value ?? 0),
      description: this.fb.control(bonus?.description ?? ''),
    });
  }

  createCostGroup(cost?: EditableBuildingResourceCost): BuildingResourceCostForm {
    return this.fb.group({
      id: this.fb.control<string | null>(cost?.id ?? null),
      resourceType: this.fb.control<BuildingResourceType>(cost?.resourceType ?? 'drachma'),
      baseValue: this.fb.control(cost?.baseValue ?? 0),
      appliesFromLevel: this.fb.control(cost?.appliesFromLevel ?? 1),
    });
  }

  createRequirementGroup(requirement?: EditableBuildingRequirement): BuildingRequirementForm {
    return this.fb.group({
      id: this.fb.control<string | null>(requirement?.id ?? null),
      type: this.fb.control<EditableBuildingRequirement['type']>(
        requirement?.type ?? 'hero_level'
      ),
      statKey: this.fb.control<string | null>(requirement?.statKey ?? null),
      minValue: this.fb.control(requirement?.minValue ?? 1),
      appliesFromLevel: this.fb.control(requirement?.appliesFromLevel ?? 1),
    });
  }

  patchEditor(form: BuildingEditorForm, draft: EditableBuilding) {
    form.patchValue({
      id: draft.id ?? '',
      key: draft.key,
      name: draft.name,
      description: draft.description,
      imagePath: draft.imagePath,
      districtCode: draft.districtCode,
      rankRequired: draft.rankRequired,
      sortOrder: draft.sortOrder,
      baseBuildTimeMinutes: draft.baseBuildTimeMinutes,
      maxLevel: draft.maxLevel,
    });

    replaceFormArray(
      form.controls.bonuses,
      draft.bonuses.map((bonus) => this.createBonusGroup(bonus))
    );
    replaceFormArray(
      form.controls.resourceCosts,
      draft.resourceCosts.map((cost) => this.createCostGroup(cost))
    );
    replaceFormArray(
      form.controls.requirements,
      draft.requirements.map((requirement) => this.createRequirementGroup(requirement))
    );
  }

  toDraft(form: BuildingEditorForm): EditableBuilding {
    const value = form.getRawValue();

    return {
      id: value.id || null,
      key: trimText(value.key),
      name: trimText(value.name),
      description: trimText(value.description),
      imagePath: trimText(value.imagePath),
      districtCode: value.districtCode,
      rankRequired: roundedNumber(value.rankRequired),
      sortOrder: roundedNumber(value.sortOrder),
      baseBuildTimeMinutes: roundedNumber(value.baseBuildTimeMinutes),
      maxLevel: roundedNumber(value.maxLevel),
      bonuses: value.bonuses.map((bonus) => ({
        templateId: bonus.templateId,
        target: normalizeBonusTarget(trimText(bonus.target)),
        type: normalizeBonusType(bonus.type),
        value: roundedNumber(bonus.value),
        description: trimText(bonus.description),
      })),
      resourceCosts: value.resourceCosts.map((cost) => ({
        id: cost.id,
        resourceType: cost.resourceType,
        baseValue: roundedNumber(cost.baseValue),
        appliesFromLevel: roundedNumber(cost.appliesFromLevel),
      })),
      requirements: value.requirements.map((requirement) => ({
        id: requirement.id,
        type: requirement.type,
        statKey: requirement.type === 'hero_stat' ? requirement.statKey : null,
        minValue: roundedNumber(requirement.minValue),
        appliesFromLevel: roundedNumber(requirement.appliesFromLevel),
      })),
    };
  }

  toFormulaControlName(targetKey: string): BuildingFormulaControlName {
    if (targetKey === BUILDING_PROGRESSION_TARGET_KEYS.upgradeTime) {
      return 'upgradeTimeFormulaId';
    }

    if (targetKey === BUILDING_PROGRESSION_TARGET_KEYS.bonusGrowth) {
      return 'bonusGrowthFormulaId';
    }

    return 'upgradeCostFormulaId';
  }
}
