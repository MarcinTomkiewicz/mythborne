import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TooltipModule } from 'primeng/tooltip';
import { switchMap } from 'rxjs';
import { FormulaVariableHelp, toFormulaVariableHelpKey } from '../../../core/services/formula/formula-variable-help';
import { FormulaTargetAssignmentRow } from '../../../core/types/formula-admin-view.types';
import {
  formulaVariableDisplayText,
  formulaVariableHelpText,
  isLuckFormulaTarget,
} from '../../../core/utils/formula-variable-display';

@Component({
  selector: 'app-formula-luck-targets-section',
  standalone: true,
  imports: [TooltipModule],
  templateUrl: './formula-luck-targets-section.html',
})
export class FormulaLuckTargetsSection {
  private readonly formulaVariableHelp = inject(FormulaVariableHelp);

  readonly rows = input<readonly FormulaTargetAssignmentRow[]>([]);
  readonly luckFormulaRows = computed(() =>
    this.rows().filter((row) => isLuckFormulaTarget(row.target)),
  );
  readonly variableHelpByKey = toSignal(
    toObservable(this.rows).pipe(
      switchMap((rows) => this.formulaVariableHelp.getHelpByTargetVariable(rows)),
    ),
    { initialValue: new Map<string, string>() },
  );

  variableDisplayText(variable: string): string {
    return formulaVariableDisplayText(variable);
  }

  variableHelpText(row: FormulaTargetAssignmentRow, variable: string): string {
    return formulaVariableHelpText({
      variableKey: variable,
      metadataHelp: this.variableHelpByKey().get(
        toFormulaVariableHelpKey(row.target.key, variable),
      ),
      targetKey: row.target.key,
    });
  }
}
