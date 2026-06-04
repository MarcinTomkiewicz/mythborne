import { Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import {
  VicinityListRow,
  VicinityRowActionKind,
} from '../../../../core/types/vicinity.types';

@Component({
  selector: 'app-vicinity-address-list',
  standalone: true,
  imports: [ButtonModule, TooltipModule],
  host: { class: 'd-contents' },
  templateUrl: './vicinity-address-list.html',
})
export class VicinityAddressList {
  readonly rows = input.required<readonly VicinityListRow[]>();
  readonly columnLabels = input.required<readonly string[]>();
  readonly emptyLabel = input.required<string>();
  readonly tableLabel = input.required<string>();
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
  readonly startAction = output<{
    row: VicinityListRow;
    actionKind: VicinityRowActionKind;
  }>();
}
