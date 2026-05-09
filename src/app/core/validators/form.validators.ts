import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ConfigChangeVisibilityKey } from '../enums/config-governance.enum';

export function trimRequiredValidator(): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const value = control.value;

    return typeof value === 'string' && value.trim().length > 0
      ? null
      : { trimRequired: true };
  };
}

export function integerValidator(): ValidatorFn {
  return (control: AbstractControl<number | null>): ValidationErrors | null => {
    const value = control.value;

    return value === null || Number.isInteger(value) ? null : { integer: true };
  };
}

export function publicChangelogValidator(
  visibilityControlName: string,
  titleControlName: string,
  bodyControlName: string,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const visibility = control.get(visibilityControlName)?.value;

    if (visibility !== ConfigChangeVisibilityKey.Public) {
      return null;
    }

    const title = control.get(titleControlName)?.value;
    const body = control.get(bodyControlName)?.value;
    const hasTitle = typeof title === 'string' && title.trim().length > 0;
    const hasBody = typeof body === 'string' && body.trim().length > 0;

    return hasTitle && hasBody ? null : { publicChangelogRequired: true };
  };
}
