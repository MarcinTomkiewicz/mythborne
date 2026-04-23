import { FormArray, FormControl, FormGroup } from '@angular/forms';
import {
  BuildingResourceType,
  EditableBuildingRequirement,
} from '../building.types';

export type BuildingFormulaControlName =
  | 'upgradeCostFormulaId'
  | 'upgradeTimeFormulaId'
  | 'bonusGrowthFormulaId';

export type BuildingSelectorForm = FormGroup<{
  selectedId: FormControl<string>;
}>;

export type BuildingFormulaAssignmentForm = FormGroup<{
  upgradeCostFormulaId: FormControl<string>;
  upgradeTimeFormulaId: FormControl<string>;
  bonusGrowthFormulaId: FormControl<string>;
}>;

export type BuildingBonusForm = FormGroup<{
  templateId: FormControl<string | null>;
  target: FormControl<string>;
  type: FormControl<'flat' | 'percent'>;
  value: FormControl<number>;
  description: FormControl<string>;
}>;

export type BuildingResourceCostForm = FormGroup<{
  id: FormControl<string | null>;
  resourceType: FormControl<BuildingResourceType>;
  baseValue: FormControl<number>;
  appliesFromLevel: FormControl<number>;
}>;

export type BuildingRequirementForm = FormGroup<{
  id: FormControl<string | null>;
  type: FormControl<EditableBuildingRequirement['type']>;
  statKey: FormControl<string | null>;
  minValue: FormControl<number>;
  appliesFromLevel: FormControl<number>;
}>;

export type BuildingEditorForm = FormGroup<{
  id: FormControl<string>;
  key: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
  imagePath: FormControl<string>;
  districtCode: FormControl<string>;
  rankRequired: FormControl<number>;
  sortOrder: FormControl<number>;
  baseBuildTimeMinutes: FormControl<number>;
  maxLevel: FormControl<number>;
  bonuses: FormArray<BuildingBonusForm>;
  resourceCosts: FormArray<BuildingResourceCostForm>;
  requirements: FormArray<BuildingRequirementForm>;
}>;
