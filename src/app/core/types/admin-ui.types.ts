import { AdminFormFieldType } from '../enums/admin-form-field-type';

export interface AdminSelectOption {
  label: string;
  value: string | number;
}

export interface AdminFormFieldConfig {
  type: AdminFormFieldType;
  controlName: string;
  label: string;
  className?: string;
  options?: readonly AdminSelectOption[];
  rows?: number;
  step?: string | number;
  readonly?: boolean;
}

export interface AdminTagLink {
  label: string;
  routerLink: string;
}

export interface AdminDashboardCard {
  legend: string;
  title: string;
  description: string;
  routerLink: string;
}
