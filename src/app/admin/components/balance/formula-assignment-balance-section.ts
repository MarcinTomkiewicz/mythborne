import { Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { switchMap } from 'rxjs';
import { FormFields } from '../../../shared/form-fields/form-fields';
import { ItemGenerationBalancePageFacade } from '../../../core/services/items/item-generation-balance-page.facade';
import { createFormulaAssignmentFields } from '../../../core/config/forms/balance-form.config';
import { humanizeFormulaScope } from './formula-library-helpers';
import {
  formulaVariableDisplayText,
  formulaVariableHelpText,
} from '../../../core/utils/formula-variable-display';
import {
  FormulaVariableHelp,
  toFormulaVariableHelpKey,
} from '../../../core/services/formula/formula-variable-help';
import { FormulaTargetAssignmentRow } from '../../../core/types/formula-admin-view.types';

@Component({
  selector: 'app-formula-assignment-balance-section',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, TooltipModule, FormFields],
  templateUrl: './formula-assignment-balance-section.html',
  host: { class: 'd-block w-100' },
})
export class FormulaAssignmentBalanceSection {
  readonly page = inject(ItemGenerationBalancePageFacade);
  private readonly formulaVariableHelp = inject(FormulaVariableHelp);

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
  readonly selectedTargetHelpRows = computed<FormulaTargetAssignmentRow[]>(() => {
    const target = this.page.formulas.selectedTarget();

    return target
      ? [{
          target,
          assignment: null,
          formula: null,
          status: 'no_assignment',
          statusLabel: 'No assignment',
        }]
      : [];
  });
  readonly variableHelpByKey = toSignal(
    toObservable(this.selectedTargetHelpRows).pipe(
      switchMap((rows) => this.formulaVariableHelp.getHelpByTargetVariable(rows)),
    ),
    { initialValue: new Map<string, string>() },
  );

  variableDisplayText(variable: string): string {
    return formulaVariableDisplayText(variable);
  }

  variableHelpText(variable: string): string {
    const target = this.page.formulas.selectedTarget();

    return formulaVariableHelpText({
      variableKey: variable,
      metadataHelp: target
        ? this.variableHelpByKey().get(toFormulaVariableHelpKey(target.key, variable))
        : null,
      targetKey: target?.key ?? null,
    });
  }
}
