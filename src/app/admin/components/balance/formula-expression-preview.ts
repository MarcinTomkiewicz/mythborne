import { Component, input } from '@angular/core';
import { FormulaChartState } from '../../../core/utils/formula-chart';

@Component({
  selector: 'app-formula-expression-preview',
  standalone: true,
  templateUrl: './formula-expression-preview.html',
})
export class FormulaExpressionPreview {
  readonly humanExpression = input('');
  readonly chartVariable = input<string | null>(null);
  readonly chartState = input.required<FormulaChartState>();
}
