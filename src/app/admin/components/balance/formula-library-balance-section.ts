import { Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AdminFormFieldsComponent } from '../admin-form-fields/admin-form-fields';
import { AdminFormFieldType } from '../../../core/enums/admin-form-field-type';
import { AdminFormFieldConfig } from '../../../core/types/admin-ui.types';
import { ItemGenerationBalancePageFacade } from '../../../core/services/items/item-generation-balance-page.facade';

@Component({
  selector: 'app-formula-library-balance-section',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, AdminFormFieldsComponent],
  templateUrl: './formula-library-balance-section.html',
})
export class FormulaLibraryBalanceSectionComponent {
  readonly page = inject(ItemGenerationBalancePageFacade);
  readonly selectorFields = computed<readonly AdminFormFieldConfig[]>(() => [
    {
      type: AdminFormFieldType.Select,
      controlName: 'selectedId',
      label: 'Edited formula',
      options: [
        { label: 'Create new formula', value: '' },
        ...this.page.formulas.data().formulas.map((formula) => ({
          label: `${formula.label} (${this.page.formulas.humanizeScope(formula.scopeKey)})`,
          value: formula.id,
        })),
      ],
    },
  ]);
  readonly editorFields = computed<readonly AdminFormFieldConfig[]>(() => [
    {
      type: AdminFormFieldType.Text,
      controlName: 'key',
      label: 'Key',
    },
    {
      type: AdminFormFieldType.Text,
      controlName: 'label',
      label: 'Label',
    },
    {
      type: AdminFormFieldType.Select,
      controlName: 'scopeKey',
      label: 'Scope',
      options: this.page.formulas.availableScopes().map((scope) => ({
        label: this.page.formulas.humanizeScope(scope),
        value: scope,
      })),
    },
    {
      type: AdminFormFieldType.Checkbox,
      controlName: 'isEnabled',
      label: 'Enabled',
    },
    {
      type: AdminFormFieldType.Textarea,
      controlName: 'expression',
      label: 'Expression',
      className: 'grid-col-span-2',
      rows: 3,
    },
    {
      type: AdminFormFieldType.Textarea,
      controlName: 'description',
      label: 'Description',
      className: 'grid-col-span-2',
      rows: 3,
    },
  ]);
}
