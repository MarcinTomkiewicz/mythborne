import { AbstractControl, FormArray } from '@angular/forms';

export function replaceFormArray<TControl extends AbstractControl>(
  target: FormArray<TControl>,
  controls: TControl[]
) {
  target.clear();
  controls.forEach((control) => target.push(control));
}
