import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import type {
  DataRowAction,
  DataRowActionEvent,
} from '../../../core/types/data-row.types';

@Component({
  selector: 'app-data-row-actions',
  standalone: true,
  imports: [ButtonModule, TooltipModule],
  host: { class: 'd-contents' },
  templateUrl: './data-row-actions.html',
})
export class DataRowActions<Row> {
  readonly row = input.required<Row>();
  readonly actions = input.required<readonly DataRowAction[]>();
  readonly showLabels = input(false);
  readonly startAction = output<DataRowActionEvent<Row>>();
}
