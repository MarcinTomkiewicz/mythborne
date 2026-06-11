import { Component, computed, input, output } from '@angular/core';
import type {
  DataRow,
  DataRowActionEvent,
  DataRowFeedback,
  DataRowListVariant,
} from '../../../core/types/data-row.types';
import { DataRowActions } from '../data-row-actions/data-row-actions';

@Component({
  selector: 'app-data-row-list',
  standalone: true,
  imports: [DataRowActions],
  host: { class: 'd-contents' },
  templateUrl: './data-row-list.html',
})
export class DataRowList {
  readonly rows = input.required<readonly DataRow[]>();
  readonly columnLabels = input.required<readonly string[]>();
  readonly emptyLabel = input.required<string>();
  readonly tableLabel = input.required<string>();
  readonly variant = input<DataRowListVariant>('address');
  readonly selectedRow = input<DataRow | null>(null);
  readonly pvpError = input<string | null>(null);
  readonly actionError = input<string | null>(null);
  readonly actionSuccess = input<string | null>(null);
  readonly metadataError = input<string | null>(null);
  readonly feedbackRows = computed<readonly DataRowFeedback[]>(() => [
    {
      message: this.pvpError(),
      className: 'error-text mb-0',
    },
    {
      message: this.actionError(),
      className: 'error-text mb-0',
    },
    {
      message: this.actionSuccess(),
      className: 'success-text mb-0',
    },
    {
      message: this.metadataError(),
      className: 'warn-text mb-0',
    },
  ].filter((row) => row.message));
  readonly selectRow = output<DataRow>();
  readonly rowGridClass = computed(() =>
    this.variant() === 'ranking'
      ? 'grid-data-list-row-ranking'
      : 'grid-data-list-row',
  );
  readonly startAction = output<DataRowActionEvent<DataRow>>();
}
