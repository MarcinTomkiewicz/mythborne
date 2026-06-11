import { Component, computed, input, output } from '@angular/core';
import {
  VicinityAddressListVariant,
  VicinityListRow,
  VicinityRowActionEvent,
} from '../../../../core/types/vicinity.types';
import { VicinityRowActions } from '../row-actions/vicinity-row-actions';

@Component({
  selector: 'app-vicinity-address-list',
  standalone: true,
  imports: [VicinityRowActions],
  host: { class: 'd-contents' },
  templateUrl: './vicinity-address-list.html',
})
export class VicinityAddressList {
  readonly rows = input.required<readonly VicinityListRow[]>();
  readonly columnLabels = input.required<readonly string[]>();
  readonly emptyLabel = input.required<string>();
  readonly tableLabel = input.required<string>();
  readonly variant = input<VicinityAddressListVariant>('vicinity');
  readonly selectedRow = input<VicinityListRow | null>(null);
  readonly pvpError = input<string | null>(null);
  readonly actionError = input<string | null>(null);
  readonly actionSuccess = input<string | null>(null);
  readonly metadataError = input<string | null>(null);
  readonly feedbackRows = computed(() => [
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
  readonly selectRow = output<VicinityListRow>();
  readonly rowGridClass = computed(() =>
    this.variant() === 'ranking'
      ? 'grid-data-list-row-ranking'
      : 'grid-data-list-row',
  );
  readonly startAction = output<VicinityRowActionEvent<VicinityListRow>>();
}
