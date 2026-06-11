import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import type {
  VicinityRowAction,
  VicinityRowActionEvent,
} from '../../../../core/types/vicinity.types';

@Component({
  selector: 'app-vicinity-row-actions',
  standalone: true,
  imports: [ButtonModule, TooltipModule],
  host: { class: 'd-contents' },
  templateUrl: './vicinity-row-actions.html',
})
export class VicinityRowActions<Row> {
  readonly row = input.required<Row>();
  readonly actions = input.required<readonly VicinityRowAction[]>();
  readonly showLabels = input(false);
  readonly startAction = output<VicinityRowActionEvent<Row>>();
}
