import { FormFieldType } from '../../enums/form-field-type';
import { FormFieldConfig } from '../../types/form-field.types';
import { CatalogSection } from '../../domain/item/item-generation-admin.model';
import { CatalogEntity } from '../../types/item-catalog-admin.types';
import { BONUS_TYPE_OPTIONS } from '../../utils/bonus';

export const ITEM_CATALOG_SECTION_BUTTONS = [
  { label: 'Base items', section: 'base' },
  { label: 'Prefixes', section: 'prefix' },
  { label: 'Suffixes', section: 'suffix' },
] as const;

export const ITEM_CATALOG_BONUS_TYPE_OPTIONS = BONUS_TYPE_OPTIONS;

const SLOT_OPTIONS = [
  { label: 'weapon', value: 'weapon' },
  { label: 'trinket', value: 'trinket' },
  { label: 'armor', value: 'armor' },
  { label: 'shield', value: 'shield' },
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

export const ITEM_CATALOG_BASE_EDITOR_FIELDS: readonly FormFieldConfig[] = [
  { type: FormFieldType.Text, controlName: 'key', label: 'Key' },
  { type: FormFieldType.Text, controlName: 'name', label: 'Name' },
  { type: FormFieldType.Select, controlName: 'slot', label: 'Slot', options: SLOT_OPTIONS },
  { type: FormFieldType.Number, controlName: 'baseValue', label: 'Base value' },
  {
    type: FormFieldType.Textarea,
    controlName: 'description',
    label: 'Description',
    className: 'grid-col-span-2',
    rows: 3,
  },
];

export const ITEM_CATALOG_AFFIX_EDITOR_FIELDS: readonly FormFieldConfig[] = [
  { type: FormFieldType.Text, controlName: 'key', label: 'Key' },
  { type: FormFieldType.Text, controlName: 'name', label: 'Name' },
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
