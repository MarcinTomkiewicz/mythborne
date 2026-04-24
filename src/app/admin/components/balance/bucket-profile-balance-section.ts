import { Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AdminFormFieldsComponent } from '../admin-form-fields/admin-form-fields';
import { AdminFormFieldType } from '../../../core/enums/admin-form-field-type';
import { AdminFormFieldConfig } from '../../../core/types/admin-ui.types';
import { ItemGenerationBalancePageFacade } from '../../../core/services/items/item-generation-balance-page.facade';

@Component({
  selector: 'app-bucket-profile-balance-section',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, AdminFormFieldsComponent],
  templateUrl: './bucket-profile-balance-section.html',
})
export class BucketProfileBalanceSectionComponent {
  readonly page = inject(ItemGenerationBalancePageFacade);
  readonly selectorFields = computed<readonly AdminFormFieldConfig[]>(() => [
    {
      type: AdminFormFieldType.Select,
      controlName: 'selectedId',
      label: 'Edited bucket profile',
      options: [
        { label: 'Create new profile', value: '' },
        ...this.page.profile.items().map((profile) => ({
          label: `${profile.name} (${profile.key})`,
          value: profile.id ?? '',
        })),
      ],
    },
  ]);
  readonly editorFields: readonly AdminFormFieldConfig[] = [
    {
      type: AdminFormFieldType.Text,
      controlName: 'name',
      label: 'Name',
    },
    {
      type: AdminFormFieldType.Text,
      controlName: 'key',
      label: 'Key',
      readonly: true,
    },
    {
      type: AdminFormFieldType.Textarea,
      controlName: 'description',
      label: 'Description',
      className: 'grid-col-span-2',
      rows: 3,
    },
    {
      type: AdminFormFieldType.Number,
      controlName: 'bucketCount',
      label: 'Bucket count',
    },
    {
      type: AdminFormFieldType.Number,
      controlName: 'baseValue',
      label: 'Base value',
    },
    {
      type: AdminFormFieldType.Number,
      controlName: 'linearGrowth',
      label: 'Linear growth',
    },
    {
      type: AdminFormFieldType.Number,
      controlName: 'growthFactor',
      label: 'Growth factor',
      step: '0.01',
    },
    {
      type: AdminFormFieldType.Number,
      controlName: 'roundingStep',
      label: 'Rounding step',
    },
    {
      type: AdminFormFieldType.Number,
      controlName: 'minIncrement',
      label: 'Minimum increment',
    },
    {
      type: AdminFormFieldType.Checkbox,
      controlName: 'isActive',
      label: 'Active profile',
    },
  ];
}
