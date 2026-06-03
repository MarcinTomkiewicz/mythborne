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
  min?: string | number;
  max?: string | number;
  readonly?: boolean;
  autocomplete?: string;
  passwordFeedback?: boolean;
  showIcon?: boolean;
  dateFormat?: string;
}
