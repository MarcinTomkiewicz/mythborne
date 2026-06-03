import { FormFieldType } from '../../enums/form-field-type';
import { FormFieldConfig } from '../../types/form-field.types';
import { CatalogSection } from '../../domain/item/item-generation-admin.model';
import { ItemGenerationBaseType } from '../../domain/item/item-generation.model';
import { CatalogEntity } from '../../types/item-catalog-admin.types';

export const ITEM_CATALOG_SECTION_BUTTONS = [
  { label: 'Base items', section: 'base' },
  { label: 'Prefixes', section: 'prefix' },
  { label: 'Suffixes', section: 'suffix' },
] as const;

const AFFIX_KIND_OPTIONS = [
  { label: 'prefix', value: 'prefix' },
  { label: 'suffix', value: 'suffix' },
] as const;

export function createItemCatalogSelectorFields(
  section: CatalogSection,
  entities: readonly CatalogEntity[],
  optionLabel: (entity: CatalogEntity) => string
): readonly FormFieldConfig[] {
  return [
    {
      type: FormFieldType.Select,
      controlName: 'selectedId',
      label: 'Edited entry',
      options: [
        { label: `Create new ${section}`, value: '' },
        ...entities.map((entity) => ({
          label: optionLabel(entity),
          value: entity.id ?? '',
        })),
      ],
    },
  ];
}

export function createItemCatalogBaseEditorFields(
  baseTypes: readonly ItemGenerationBaseType[]
): readonly FormFieldConfig[] {
  return [
    { type: FormFieldType.Text, controlName: 'name', label: 'Name' },
    { type: FormFieldType.Text, controlName: 'key', label: 'Key', readonly: true },
    {
      type: FormFieldType.Select,
      controlName: 'baseTypeKey',
      label: 'Base type',
      options: [
        { label: 'Choose base type', value: '' },
        ...baseTypes.map((baseType) => ({
          label: `${baseType.label} (${baseType.equipmentSlotGroup})`,
          value: baseType.key,
        })),
      ],
    },
    { type: FormFieldType.Number, controlName: 'baseValue', label: 'Base value' },
    {
      type: FormFieldType.Textarea,
      controlName: 'description',
      label: 'Description',
      className: 'grid-col-span-2',
      rows: 3,
    },
  ];
}

export const ITEM_CATALOG_AFFIX_EDITOR_FIELDS: readonly FormFieldConfig[] = [
  { type: FormFieldType.Text, controlName: 'name', label: 'Name' },
  { type: FormFieldType.Text, controlName: 'key', label: 'Key', readonly: true },
  { type: FormFieldType.Select, controlName: 'kind', label: 'Kind', options: AFFIX_KIND_OPTIONS },
  { type: FormFieldType.Number, controlName: 'goldValue', label: 'Gold value' },
  {
    type: FormFieldType.Textarea,
    controlName: 'description',
    label: 'Description',
    className: 'grid-col-span-2',
    rows: 3,
  },
];
