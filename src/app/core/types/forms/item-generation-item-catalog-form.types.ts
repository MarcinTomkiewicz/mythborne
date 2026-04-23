import { FormArray, FormControl, FormGroup } from '@angular/forms';

export type CatalogEntitySelectorForm = FormGroup<{
  selectedId: FormControl<string>;
}>;

export type BonusForm = FormGroup<{
  templateId: FormControl<string>;
  target: FormControl<string>;
  type: FormControl<'flat' | 'percent'>;
  value: FormControl<number>;
  description: FormControl<string>;
}>;

export type BaseEditorForm = FormGroup<{
  id: FormControl<string>;
  key: FormControl<string>;
  name: FormControl<string>;
  slot: FormControl<'weapon' | 'trinket' | 'armor' | 'shield'>;
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
