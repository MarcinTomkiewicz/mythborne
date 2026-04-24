import { Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AdminFormFieldsComponent } from '../admin-form-fields/admin-form-fields';
import { AdminFormFieldType } from '../../../core/enums/admin-form-field-type';
import { AdminFormFieldConfig } from '../../../core/types/admin-ui.types';
import { ItemGenerationBalancePageFacade } from '../../../core/services/items/item-generation-balance-page.facade';

@Component({
  selector: 'app-formula-assignment-balance-section',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, AdminFormFieldsComponent],
  templateUrl: './formula-assignment-balance-section.html',
})
export class FormulaAssignmentBalanceSectionComponent {
  readonly page = inject(ItemGenerationBalancePageFacade);
  readonly fields = computed<readonly AdminFormFieldConfig[]>(() => [
    {
      type: AdminFormFieldType.Select,
      controlName: 'targetId',
      label: 'Target',
      options: [
        { label: 'Choose target', value: '' },
        ...this.page.formulas.data().targets.map((target) => ({
          label: `${target.label} (${this.page.formulas.humanizeScope(target.scopeKey)})`,
          value: target.id,
        })),
      ],
    },
    {
      type: AdminFormFieldType.Select,
      controlName: 'formulaId',
      label: 'Assigned formula',
      options: [
        { label: 'Choose formula', value: '' },
        ...this.page.formulas.formulasForSelectedTarget().map((formula) => ({
          label: formula.label,
          value: formula.id,
        })),
      ],
    },
  ]);
}
