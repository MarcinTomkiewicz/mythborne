import { FormControl, FormGroup } from '@angular/forms';
import { EditableBalanceFormula } from '../formula.types';
import { ItemQualityKey } from '../item-generation.types';
import { BonusScope, BonusType } from '../bonus.types';

export type QualitySelectorForm = FormGroup<{
  selectedId: FormControl<string>;
}>;

export type QualityEditorForm = FormGroup<{
  id: FormControl<string>;
  key: FormControl<ItemQualityKey>;
  label: FormControl<string>;
  multiplier: FormControl<number>;
  weight: FormControl<number>;
  sortOrder: FormControl<number>;
  isEnabled: FormControl<boolean>;
}>;

export type BucketProfileSelectorForm = FormGroup<{
  selectedId: FormControl<string>;
}>;

export type BucketProfileEditorForm = FormGroup<{
  id: FormControl<string>;
  key: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
  bucketCount: FormControl<number>;
  baseValue: FormControl<number>;
  linearGrowth: FormControl<number>;
  growthFactor: FormControl<number>;
  roundingStep: FormControl<number>;
  minIncrement: FormControl<number>;
  isActive: FormControl<boolean>;
}>;

export type FormulaSelectorForm = FormGroup<{
  selectedId: FormControl<string>;
}>;

export type FormulaEditorForm = FormGroup<{
  id: FormControl<string>;
  key: FormControl<string>;
  scopeKey: FormControl<string>;
  label: FormControl<string>;
  expression: FormControl<string>;
  description: FormControl<string>;
  isEnabled: FormControl<boolean>;
}>;

export type FormulaAssignmentForm = FormGroup<{
  targetId: FormControl<string>;
  formulaId: FormControl<string>;
}>;

export type BonusTemplateSelectorForm = FormGroup<{
  selectedId: FormControl<string>;
}>;

export type BonusTemplateEditorForm = FormGroup<{
  id: FormControl<string>;
  key: FormControl<string>;
  label: FormControl<string>;
  category: FormControl<string>;
  target: FormControl<string>;
  type: FormControl<BonusType>;
  scope: FormControl<BonusScope>;
  description: FormControl<string>;
  baseValue: FormControl<number>;
  levelsStep: FormControl<number | null>;
  sourceStat: FormControl<string | null>;
  scalingFactor: FormControl<number | null>;
  sortOrder: FormControl<number>;
  isActive: FormControl<boolean>;
}>;

export type FormulaEditorDraft = EditableBalanceFormula;
