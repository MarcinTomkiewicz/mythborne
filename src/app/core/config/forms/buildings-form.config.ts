import { FormFieldType } from '../../enums/form-field-type';
import { FormFieldConfig } from '../../types/form-field.types';
import { BuildingAdminData } from '../../domain/building/building.model';
import { FormulaTarget } from '../../domain/formula/formula.model';

export const BUILDING_RESOURCE_TYPE_OPTIONS = [
  { label: 'Drachma', value: 'drachma' },
  { label: 'Materials', value: 'materials' },
  { label: 'Workforce', value: 'workforce' },
] as const;

export function createBuildingFormulaFields(
  targets: readonly FormulaTarget[],
  formulasFor: (targetKey: string) => readonly { value: string; label: string }[],
  toControlName: (targetKey: string) => string,
  labelFor: (targetKey: string, fallback: string) => string = (_targetKey, fallback) => fallback,
): readonly FormFieldConfig[] {
  return targets.map((target) => ({
    type: FormFieldType.Select,
    controlName: toControlName(target.key),
    label: labelFor(target.key, target.label),
    options: [{ label: 'Choose formula', value: '' }, ...formulasFor(target.key)],
  }));
}

export function createBuildingSelectorFields(
  buildings: readonly { id: string | null; key: string; name: string }[]
): readonly FormFieldConfig[] {
  return [
    {
      type: FormFieldType.Select,
      controlName: 'selectedId',
      label: 'Building',
      options: [
        { label: 'Create new building', value: '' },
        ...buildings.map((building) => ({
          label: `${building.name} (${building.key})`,
          value: building.id ?? '',
        })),
      ],
    },
  ];
}

export function createBuildingPrimaryEditorFields(
  adminData: BuildingAdminData,
  fieldLabel: (key: string, fallback: string) => string = (_key, fallback) => fallback,
): readonly FormFieldConfig[] {
  return [
    { type: FormFieldType.Text, controlName: 'key', label: fieldLabel('key', 'Key'), readonly: true },
    { type: FormFieldType.Text, controlName: 'name', label: fieldLabel('name', 'Name') },
    {
      type: FormFieldType.Textarea,
      controlName: 'description',
      label: fieldLabel('description', 'Description'),
      rows: 3,
    },
    {
      type: FormFieldType.Select,
      controlName: 'districtCode',
      label: fieldLabel('district_code', 'District'),
      options: adminData.districts.map((district) => ({
        label: `${district.code} - ${district.name}`,
        value: district.code,
      })),
    },
  ];
}

export function createBuildingProgressionFields(
  fieldLabel: (key: string, fallback: string) => string = (_key, fallback) => fallback,
): readonly FormFieldConfig[] {
  return [
    { type: FormFieldType.Number, controlName: 'sortOrder', label: fieldLabel('sort_order', 'Sort order') },
    {
      type: FormFieldType.Number,
      controlName: 'baseBuildTimeSeconds',
      label: fieldLabel('base_build_time_seconds', 'Base build time (sec)'),
    },
    { type: FormFieldType.Number, controlName: 'maxLevel', label: fieldLabel('max_level', 'Max level') },
  ];
}
