import { FormFieldType } from '../../enums/form-field-type';
import { FormFieldConfig } from '../../types/form-field.types';

export const LOGIN_FIELDS: readonly FormFieldConfig[] = [
  {
    type: FormFieldType.Text,
    controlName: 'email',
    label: 'Email',
    inputType: 'email',
    autocomplete: 'email',
  },
  {
    type: FormFieldType.Text,
    controlName: 'password',
    label: 'Password',
    inputType: 'password',
    autocomplete: 'current-password',
  },
];

export const CREATE_CHARACTER_ACCOUNT_FIELDS: readonly FormFieldConfig[] = [
  {
    type: FormFieldType.Text,
    controlName: 'email',
    label: 'Email',
    inputType: 'email',
    autocomplete: 'email',
  },
  {
    type: FormFieldType.Text,
    controlName: 'password',
    label: 'Password',
    inputType: 'password',
    autocomplete: 'new-password',
  },
];

export const CREATE_CHARACTER_HERO_FIELDS: readonly FormFieldConfig[] = [
  {
    type: FormFieldType.Text,
    controlName: 'characterName',
    label: 'Hero Name',
    autocomplete: 'off',
  },
];

export const CREATE_CHARACTER_PROFILE_MAIN_FIELDS: readonly FormFieldConfig[] = [
  { type: FormFieldType.Text, controlName: 'name', label: 'Name', autocomplete: 'name' },
  {
    type: FormFieldType.Date,
    controlName: 'birthday',
    label: 'Birthday (optional)',
    dateFormat: 'yy-mm-dd',
    showIcon: true,
  },
  { type: FormFieldType.Text, controlName: 'city', label: 'City', autocomplete: 'address-level2' },
  { type: FormFieldType.Textarea, controlName: 'bio', label: 'Bio', rows: 3 },
];

export const CREATE_CHARACTER_PROFILE_SOCIAL_FIELDS: readonly FormFieldConfig[] = [
  { type: FormFieldType.Text, controlName: 'facebook', label: 'Facebook' },
  { type: FormFieldType.Text, controlName: 'twitter', label: 'Twitter' },
  { type: FormFieldType.Text, controlName: 'linkedin', label: 'LinkedIn' },
  { type: FormFieldType.Text, controlName: 'instagram', label: 'Instagram' },
];
