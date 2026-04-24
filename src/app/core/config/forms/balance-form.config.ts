import { FormFieldType } from '../../enums/form-field-type';
import { FormulaAdminData } from '../../domain/formula/formula.model';
import { FormFieldConfig } from '../../types/form-field.types';
import {
  EditableItemGenerationBucketProfile,
  EditableItemGenerationQuality,
} from '../../domain/item/item-generation-admin.model';

const QUALITY_KEY_OPTIONS = [
  { label: 'normal', value: 'normal' },
  { label: 'quality', value: 'quality' },
  { label: 'outstanding', value: 'outstanding' },
] as const;

export function createQualitySelectorFields(
  qualities: readonly EditableItemGenerationQuality[]
): readonly FormFieldConfig[] {
  return [
    {
      type: FormFieldType.Select,
      controlName: 'selectedId',
      label: 'Edited quality',
      options: [
        { label: 'Create new quality', value: '' },
        ...qualities.map((quality) => ({
          label: `${quality.label} (${quality.key})`,
          value: quality.id ?? '',
        })),
      ],
    },
  ];
}

export const QUALITY_EDITOR_FIELDS: readonly FormFieldConfig[] = [
  { type: FormFieldType.Select, controlName: 'key', label: 'Key', options: QUALITY_KEY_OPTIONS },
  { type: FormFieldType.Text, controlName: 'label', label: 'Label' },
  { type: FormFieldType.Number, controlName: 'multiplier', label: 'Multiplier', step: '0.01' },
  { type: FormFieldType.Number, controlName: 'weight', label: 'Weight', step: 1 },
  { type: FormFieldType.Number, controlName: 'sortOrder', label: 'Sort order', step: 1 },
  { type: FormFieldType.Checkbox, controlName: 'isEnabled', label: 'Enabled' },
];

export function createBucketProfileSelectorFields(
  profiles: readonly EditableItemGenerationBucketProfile[]
): readonly FormFieldConfig[] {
  return [
    {
      type: FormFieldType.Select,
      controlName: 'selectedId',
      label: 'Edited bucket profile',
      options: [
        { label: 'Create new profile', value: '' },
        ...profiles.map((profile) => ({
          label: `${profile.name} (${profile.key})`,
          value: profile.id ?? '',
        })),
      ],
    },
  ];
}

export const BUCKET_PROFILE_EDITOR_FIELDS: readonly FormFieldConfig[] = [
  { type: FormFieldType.Text, controlName: 'name', label: 'Name' },
  { type: FormFieldType.Text, controlName: 'key', label: 'Key', readonly: true },
  {
    type: FormFieldType.Textarea,
    controlName: 'description',
    label: 'Description',
    className: 'grid-col-span-2',
    rows: 3,
  },
  { type: FormFieldType.Number, controlName: 'bucketCount', label: 'Bucket count' },
  { type: FormFieldType.Number, controlName: 'baseValue', label: 'Base value' },
  { type: FormFieldType.Number, controlName: 'linearGrowth', label: 'Linear growth' },
  { type: FormFieldType.Number, controlName: 'growthFactor', label: 'Growth factor', step: '0.01' },
  { type: FormFieldType.Number, controlName: 'roundingStep', label: 'Rounding step' },
  { type: FormFieldType.Number, controlName: 'minIncrement', label: 'Minimum increment' },
  { type: FormFieldType.Checkbox, controlName: 'isActive', label: 'Active profile' },
];

export function createFormulaAssignmentFields(
  data: FormulaAdminData,
  humanizeScope: (scopeKey: string) => string,
  selectedTargetFormulaIds: readonly { value: string; label: string }[]
): readonly FormFieldConfig[] {
  return [
    {
      type: FormFieldType.Select,
      controlName: 'targetId',
      label: 'Target',
      options: [
        { label: 'Choose target', value: '' },
        ...data.targets.map((target) => ({
          label: `${target.label} (${humanizeScope(target.scopeKey)})`,
          value: target.id,
        })),
      ],
    },
    {
      type: FormFieldType.Select,
      controlName: 'formulaId',
      label: 'Assigned formula',
      options: [{ label: 'Choose formula', value: '' }, ...selectedTargetFormulaIds],
    },
  ];
}

export function createFormulaSelectorFields(
  data: FormulaAdminData,
  humanizeScope: (scopeKey: string) => string
): readonly FormFieldConfig[] {
  return [
    {
      type: FormFieldType.Select,
      controlName: 'selectedId',
      label: 'Edited formula',
      options: [
        { label: 'Create new formula', value: '' },
        ...data.formulas.map((formula) => ({
          label: `${formula.label} (${humanizeScope(formula.scopeKey)})`,
          value: formula.id,
        })),
      ],
    },
  ];
}

export function createFormulaEditorMetaFields(
  scopes: readonly string[],
  humanizeScope: (scopeKey: string) => string
): readonly FormFieldConfig[] {
  return [
    { type: FormFieldType.Text, controlName: 'key', label: 'Key' },
    { type: FormFieldType.Text, controlName: 'label', label: 'Label' },
    {
      type: FormFieldType.Select,
      controlName: 'scopeKey',
      label: 'Scope',
      options: scopes.map((scope) => ({ label: humanizeScope(scope), value: scope })),
    },
    { type: FormFieldType.Checkbox, controlName: 'isEnabled', label: 'Enabled' },
  ];
}

export const FORMULA_EXPRESSION_FIELD: FormFieldConfig = {
  type: FormFieldType.Textarea,
  controlName: 'expression',
  label: 'Expression',
  className: 'grid-col-span-2',
  rows: 3,
};

export const FORMULA_DESCRIPTION_FIELD: FormFieldConfig = {
  type: FormFieldType.Textarea,
  controlName: 'description',
  label: 'Description',
  className: 'grid-col-span-2',
  rows: 3,
};
