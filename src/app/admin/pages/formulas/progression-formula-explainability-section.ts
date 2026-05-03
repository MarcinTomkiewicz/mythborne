import { JsonPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormulaTargetAssignmentRow } from '../../../core/types/formula-admin-view.types';
import {
  ProgressionExplainabilityTextRow,
  ProgressionFormulaExplainability,
} from './progression-formula-explainability';

@Component({
  selector: 'app-progression-formula-explainability-section',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './progression-formula-explainability-section.html',
})
export class ProgressionFormulaExplainabilitySection {
  readonly explainability = input.required<ProgressionFormulaExplainability>();
  readonly formulaRows = input.required<FormulaTargetAssignmentRow[]>();
  readonly missingFormulaTargetKeys = input.required<string[]>();
  readonly explanationRows = input.required<ProgressionExplainabilityTextRow[]>();
  readonly metadataGaps = input.required<string[]>();
}
