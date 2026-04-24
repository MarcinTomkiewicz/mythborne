import { FormFieldType } from '../../enums/form-field-type';
import { FormFieldConfig } from '../../types/form-field.types';
import { BuildingAdminData } from '../../domain/building/building.model';
import { FormulaTarget } from '../../domain/formula/formula.model';
import { BONUS_TYPE_OPTIONS } from '../../utils/bonus';

export const BUILDING_RESOURCE_TYPE_OPTIONS = [
  { label: 'Drachma', value: 'drachma' },
  { label: 'Materials', value: 'materials' },
  { label: 'Workforce', value: 'workforce' },
] as const;

export const BUILDING_REQUIREMENT_TYPE_OPTIONS = [
  { label: 'Hero level', value: 'hero_level' },
  { label: 'Hero stat', value: 'hero_stat' },
] as const;

export const BUILDING_BONUS_TYPE_OPTIONS = BONUS_TYPE_OPTIONS;

export function createBuildingFormulaFields(
  targets: readonly FormulaTarget[],
  formulasFor: (targetKey: string) => readonly { value: string; label: string }[],
  toControlName: (targetKey: string) => string
): readonly FormFieldConfig[] {
  return targets.map((target) => ({
    type: FormFieldType.Select,
    controlName: toControlName(target.key),
    label: target.label,
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
  adminData: BuildingAdminData
): readonly FormFieldConfig[] {
  return [
    { type: FormFieldType.Text, controlName: 'key', label: 'Key' },
    { type: FormFieldType.Text, controlName: 'name', label: 'Name' },
    {
      type: FormFieldType.Textarea,
      controlName: 'description',
      label: 'Description',
      className: 'grid-col-span-2',
      rows: 3,
    },
    {
      type: FormFieldType.Select,
      controlName: 'districtCode',
      label: 'District',
      options: adminData.districts.map((district) => ({
        label: `${district.code} - ${district.name}`,
        value: district.code,
      })),
    },
  ];
}

export const BUILDING_PROGRESSION_FIELDS: readonly FormFieldConfig[] = [
  { type: FormFieldType.Number, controlName: 'rankRequired', label: 'District unlock rank' },
  { type: FormFieldType.Number, controlName: 'sortOrder', label: 'Sort order' },
  { type: FormFieldType.Number, controlName: 'baseBuildTimeMinutes', label: 'Base build time (min)' },
  { type: FormFieldType.Number, controlName: 'maxLevel', label: 'Max level' },
];
