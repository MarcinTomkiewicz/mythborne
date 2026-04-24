import { FormFieldType } from '../enums/form-field-type';

export interface FormSelectOption {
  label: string;
  value: string | number | boolean | null;
}

export interface FormFieldConfig {
  type: FormFieldType;
  controlName: string;
  label: string;
  className?: string;
  inputType?: 'text' | 'email' | 'password' | 'number';
  options?: readonly FormSelectOption[];
  rows?: number;
  step?: string | number;
  readonly?: boolean;
  autocomplete?: string;
  showIcon?: boolean;
  dateFormat?: string;
}
