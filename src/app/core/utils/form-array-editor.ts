import { AbstractControl, FormArray } from '@angular/forms';

export interface FormArrayEditor<TControl extends AbstractControl> {
  readonly array: FormArray<TControl>;
  readonly controls: TControl[];
  add(): void;
  remove(index: number): void;
  at(index: number): TControl;
}

export function createFormArrayEditor<TControl extends AbstractControl>(
  array: FormArray<TControl>,
  createControl: () => TControl
): FormArrayEditor<TControl> {
  return {
    array,
    get controls() {
      return array.controls as TControl[];
    },
    add() {
      array.push(createControl());
    },
    remove(index: number) {
      array.removeAt(index);
    },
    at(index: number) {
      return array.at(index) as TControl;
    },
  };
}
