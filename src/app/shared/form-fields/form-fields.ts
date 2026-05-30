import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { FormFieldType } from '../../core/enums/form-field-type';
import {
  FormFieldConfig,
  FormSelectOption,
} from '../../core/types/form-field.types';

@Component({
  selector: 'app-form-fields',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CheckboxModule,
    DatePickerModule,
    InputTextModule,
    PasswordModule,
    SelectModule,
  ],
  templateUrl: './form-fields.html',
  host: { class: 'd-contents' },
})
export class FormFields {
  readonly form = input.required<FormGroup>();
  readonly fields = input.required<readonly FormFieldConfig[]>();
  readonly widthClass = input('w-100');
  readonly fieldType = FormFieldType;

  fieldClass(field: FormFieldConfig, baseClass = 'flex-col gap-sm'): string {
    return [baseClass, this.widthClass(), field.className].filter(Boolean).join(' ');
  }

  fieldOptions(field: FormFieldConfig): FormSelectOption[] {
    return [...(field.options ?? [])];
  }
}
