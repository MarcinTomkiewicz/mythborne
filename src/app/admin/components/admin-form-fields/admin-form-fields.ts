import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { AdminFormFieldType } from '../../../core/enums/admin-form-field-type';
import { AdminFormFieldConfig } from '../../../core/types/admin-ui.types';

@Component({
  selector: 'app-admin-form-fields',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule],
  templateUrl: './admin-form-fields.html',
})
export class AdminFormFieldsComponent {
  readonly form = input.required<FormGroup>();
  readonly fields = input.required<readonly AdminFormFieldConfig[]>();
  readonly widthClass = input('w-100');
  readonly fieldType = AdminFormFieldType;

  fieldClass(field: AdminFormFieldConfig, baseClass = 'flex-col gap-sm'): string {
    return field.className ? `${baseClass} ${field.className}` : baseClass;
  }
}
