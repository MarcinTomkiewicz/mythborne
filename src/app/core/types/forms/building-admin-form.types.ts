import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { BuildingResourceType } from '../building.types';
import { BonusType } from '../bonus.types';

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
  type: FormControl<BonusType>;
  value: FormControl<number>;
  description: FormControl<string>;
}>;

export type BuildingResourceCostForm = FormGroup<{
  id: FormControl<string | null>;
  resourceType: FormControl<BuildingResourceType>;
  baseValue: FormControl<number>;
  appliesFromLevel: FormControl<number>;
}>;

export type BuildingCanonicalRequirementForm = FormGroup<{
  id: FormControl<string | null>;
  requirementDefinitionKey: FormControl<string>;
  appliesFromLevel: FormControl<number>;
  description: FormControl<string>;
  reason: FormControl<string>;
  sortOrder: FormControl<number>;
  requiredBuildingKey: FormControl<string | null>;
  requiredDistrictCode: FormControl<string | null>;
  requiredResourceType: FormControl<string | null>;
  requiredStatKey: FormControl<string | null>;
  requiredValueBoolean: FormControl<boolean | null>;
  requiredValueDecimal: FormControl<number | null>;
  requiredValueInteger: FormControl<number | null>;
  requiredValueText: FormControl<string | null>;
}>;

export type BuildingEditorForm = FormGroup<{
  id: FormControl<string>;
  key: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
  imagePath: FormControl<string>;
  districtCode: FormControl<string>;
  sortOrder: FormControl<number>;
  baseBuildTimeMinutes: FormControl<number>;
  maxLevel: FormControl<number>;
  formulaOverrides: FormGroup<{
    upgradeCostFormulaId: FormControl<string | null>;
    upgradeTimeFormulaId: FormControl<string | null>;
    bonusGrowthFormulaId: FormControl<string | null>;
  }>;
  bonuses: FormArray<BuildingBonusForm>;
  resourceCosts: FormArray<BuildingResourceCostForm>;
}>;
