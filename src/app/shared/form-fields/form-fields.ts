import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { FormFieldType } from '../../core/enums/form-field-type';
import { FormFieldConfig } from '../../core/types/form-field.types';

@Component({
  selector: 'app-form-fields',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, DatePickerModule],
  templateUrl: './form-fields.html',
  host: { style: 'display: contents;' },
})
export class FormFields {
  readonly form = input.required<FormGroup>();
  readonly fields = input.required<readonly FormFieldConfig[]>();
  readonly widthClass = input('w-100');
  readonly fieldType = FormFieldType;

  fieldClass(field: FormFieldConfig, baseClass = 'flex-col gap-sm'): string {
    return field.className ? `${baseClass} ${field.className}` : baseClass;
  }
}
