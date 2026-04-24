import { Component, OnInit, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AdminFormFieldsComponent } from '../../components/admin-form-fields/admin-form-fields';
import { AdminTagLinksComponent } from '../../components/admin-tag-links/admin-tag-links';
import { ITEM_CATALOG_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminFormFieldType } from '../../../core/enums/admin-form-field-type';
import { AdminFormFieldConfig } from '../../../core/types/admin-ui.types';
import { ItemGenerationItemCatalogPageFacade } from '../../../core/services/items/item-generation-item-catalog-page.facade';

const SECTION_BUTTONS = [
  { label: 'Base items', section: 'base' },
  { label: 'Prefixes', section: 'prefix' },
  { label: 'Suffixes', section: 'suffix' },
] as const;

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

const BONUS_TYPE_OPTIONS = [
  { label: 'flat', value: 'flat' },
  { label: 'percent', value: 'percent' },
] as const;

@Component({
  selector: 'app-item-generation-item-catalog-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    AdminFormFieldsComponent,
    AdminTagLinksComponent,
  ],
  providers: [ItemGenerationItemCatalogPageFacade],
  templateUrl: './item-generation-item-catalog-page.html',
})
export class ItemGenerationItemCatalogPage implements OnInit {
  readonly page = inject(ItemGenerationItemCatalogPageFacade);
  readonly links = ITEM_CATALOG_PAGE_LINKS;
  readonly sectionButtons = SECTION_BUTTONS;
  readonly bonusTypeOptions = BONUS_TYPE_OPTIONS;
  readonly selectorFields = computed<readonly AdminFormFieldConfig[]>(() => [
    {
      type: AdminFormFieldType.Select,
      controlName: 'selectedId',
      label: 'Edited entry',
      options: [
        {
          label: `Create new ${this.page.activeSection()}`,
          value: '',
        },
        ...this.page.activeEntities().map((entity) => ({
          label: this.page.optionLabel(entity),
          value: entity.id ?? '',
        })),
      ],
    },
  ]);
  readonly baseEditorFields: readonly AdminFormFieldConfig[] = [
    {
      type: AdminFormFieldType.Text,
      controlName: 'key',
      label: 'Key',
    },
    {
      type: AdminFormFieldType.Text,
      controlName: 'name',
      label: 'Name',
    },
    {
      type: AdminFormFieldType.Select,
      controlName: 'slot',
      label: 'Slot',
      options: SLOT_OPTIONS,
    },
    {
      type: AdminFormFieldType.Number,
      controlName: 'baseValue',
      label: 'Base value',
    },
    {
      type: AdminFormFieldType.Textarea,
      controlName: 'description',
      label: 'Description',
      className: 'grid-col-span-2',
      rows: 3,
    },
  ];
  readonly affixEditorFields: readonly AdminFormFieldConfig[] = [
    {
      type: AdminFormFieldType.Text,
      controlName: 'key',
      label: 'Key',
    },
    {
      type: AdminFormFieldType.Text,
      controlName: 'name',
      label: 'Name',
    },
    {
      type: AdminFormFieldType.Select,
      controlName: 'kind',
      label: 'Kind',
      options: AFFIX_KIND_OPTIONS,
    },
    {
      type: AdminFormFieldType.Number,
      controlName: 'goldValue',
      label: 'Gold value',
    },
    {
      type: AdminFormFieldType.Textarea,
      controlName: 'description',
      label: 'Description',
      className: 'grid-col-span-2',
      rows: 3,
    },
  ];

  ngOnInit(): void {
    this.page.loadData();
  }
}
