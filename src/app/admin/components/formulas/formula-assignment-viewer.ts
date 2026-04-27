import { Component, input } from '@angular/core';
import { FormulaTarget } from '../../../core/domain/formula/formula.model';
import { FormulaTargetAssignmentRow } from '../../../core/types/formula-admin-view.types';
import { formatConfigJsonPreview } from '../../../core/utils/config-governance';

@Component({
  selector: 'app-formula-assignment-viewer',
  standalone: true,
  templateUrl: './formula-assignment-viewer.html',
})
export class FormulaAssignmentViewer {
  readonly rows = input<readonly FormulaTargetAssignmentRow[]>([]);

  contextPreview(target: FormulaTarget): string {
    return formatConfigJsonPreview(target.defaultTestContext);
  }
}
