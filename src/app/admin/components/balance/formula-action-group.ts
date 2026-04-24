import { Component, input, output } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';

export interface FormulaActionViewItem {
  id: string;
  label: string;
  secondaryLabel?: string;
  tooltip?: string;
}

@Component({
  selector: 'app-formula-action-group',
  standalone: true,
  imports: [TooltipModule],
  templateUrl: './formula-action-group.html',
})
export class FormulaActionGroup {
  readonly title = input.required<string>();
  readonly items = input.required<readonly FormulaActionViewItem[]>();
  readonly appearance = input<'tag' | 'card'>('tag');
  readonly tone = input<'muted' | 'warn'>('muted');
  readonly selected = output<FormulaActionViewItem>();
}
