import { Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AdminFormFieldsComponent } from '../admin-form-fields/admin-form-fields';
import { AdminFormFieldType } from '../../../core/enums/admin-form-field-type';
import { AdminFormFieldConfig } from '../../../core/types/admin-ui.types';
import { ItemGenerationBalancePageFacade } from '../../../core/services/items/item-generation-balance-page.facade';

const QUALITY_KEY_OPTIONS = [
  { label: 'normal', value: 'normal' },
  { label: 'quality', value: 'quality' },
  { label: 'outstanding', value: 'outstanding' },
] as const;

@Component({
  selector: 'app-quality-balance-section',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, AdminFormFieldsComponent],
  templateUrl: './quality-balance-section.html',
})
export class QualityBalanceSectionComponent {
  readonly page = inject(ItemGenerationBalancePageFacade);
  readonly selectorFields = computed<readonly AdminFormFieldConfig[]>(() => [
    {
      type: AdminFormFieldType.Select,
      controlName: 'selectedId',
      label: 'Edited quality',
      options: [
        { label: 'Create new quality', value: '' },
        ...this.page.quality.items().map((quality) => ({
          label: `${quality.label} (${quality.key})`,
          value: quality.id ?? '',
        })),
      ],
    },
  ]);
  readonly editorFields: readonly AdminFormFieldConfig[] = [
    {
      type: AdminFormFieldType.Select,
      controlName: 'key',
      label: 'Key',
      options: QUALITY_KEY_OPTIONS,
    },
    {
      type: AdminFormFieldType.Text,
      controlName: 'label',
      label: 'Label',
    },
    {
      type: AdminFormFieldType.Number,
      controlName: 'multiplier',
      label: 'Multiplier',
      step: '0.01',
    },
    {
      type: AdminFormFieldType.Number,
      controlName: 'weight',
      label: 'Weight',
      step: 1,
    },
    {
      type: AdminFormFieldType.Number,
      controlName: 'sortOrder',
      label: 'Sort order',
      step: 1,
    },
    {
      type: AdminFormFieldType.Checkbox,
      controlName: 'isEnabled',
      label: 'Enabled',
    },
  ];
}
