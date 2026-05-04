import { Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormFields } from '../../../shared/form-fields/form-fields';
import { ItemGenerationBalancePageFacade } from '../../../core/services/items/item-generation-balance-page.facade';
import { createFormulaAssignmentFields } from '../../../core/config/forms/balance-form.config';
import { humanizeFormulaScope } from './formula-library-helpers';

@Component({
  selector: 'app-formula-assignment-balance-section',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, FormFields],
  templateUrl: './formula-assignment-balance-section.html',
  host: { class: 'd-block w-100' },
})
export class FormulaAssignmentBalanceSection {
  readonly page = inject(ItemGenerationBalancePageFacade);
  readonly fields = computed(() =>
    createFormulaAssignmentFields(
      this.page.formulas.data(),
      (scope) => humanizeFormulaScope(scope),
      this.page.formulas.formulasForSelectedTarget().map((formula) => ({
        value: formula.id,
        label: formula.label,
      }))
    )
  );
}
