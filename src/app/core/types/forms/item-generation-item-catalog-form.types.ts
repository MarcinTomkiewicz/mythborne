import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { BonusScope, BonusType } from '../bonus.types';

export type CatalogEntitySelectorForm = FormGroup<{
  selectedId: FormControl<string>;
}>;

export type BonusForm = FormGroup<{
  templateId: FormControl<string | null>;
  category: FormControl<string>;
  templateLabel: FormControl<string>;
  target: FormControl<string>;
  type: FormControl<BonusType>;
  scope: FormControl<BonusScope>;
  baseValue: FormControl<number>;
  levelsStep: FormControl<number | null>;
  sourceStat: FormControl<string | null>;
  scalingFactor: FormControl<number | null>;
  description: FormControl<string>;
  qualityScalesValue: FormControl<boolean>;
}>;

export type BaseEditorForm = FormGroup<{
  id: FormControl<string>;
  key: FormControl<string>;
  name: FormControl<string>;
  baseTypeKey: FormControl<string>;
  baseValue: FormControl<number>;
  description: FormControl<string>;
  bonuses: FormArray<BonusForm>;
}>;

export type AffixEditorForm = FormGroup<{
  id: FormControl<string>;
  key: FormControl<string>;
  kind: FormControl<'prefix' | 'suffix'>;
  name: FormControl<string>;
  goldValue: FormControl<number>;
  description: FormControl<string>;
  bonuses: FormArray<BonusForm>;
}>;
