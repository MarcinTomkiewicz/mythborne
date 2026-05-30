import { Component, input } from '@angular/core';
import { CreateCharacterSummaryRow } from '../../../core/interfaces/hero/create-character-server-options.interface';

@Component({
  selector: 'app-account-entry-summary-rows',
  standalone: true,
  host: {
    class: 'd-block w-100',
  },
  template: `
    <div class="flex-col gap-sm w-100">
      @for (row of rows(); track row.label) {
        <div
          class="mg-data-row w-100"
          [class.mg-card--selected]="row.primary"
          [class.mg-card--danger]="row.tone === 'danger'"
        >
          <span class="mg-data-row__label">{{ row.label }}</span>
          @if (row.multiline) {
            <span
              class="mg-data-row__value"
              [class.heading-color]="row.primary"
              [class.text-danger]="row.tone === 'danger'"
            >
              {{ row.value }}
            </span>
          } @else {
            <strong
              class="mg-data-row__value"
              [class.heading-color]="row.primary"
              [class.text-danger]="row.tone === 'danger'"
            >
              {{ row.value }}
            </strong>
          }
        </div>
      }
    </div>
  `,
})
export class AccountEntrySummaryRows {
  readonly rows = input.required<CreateCharacterSummaryRow[]>();
}
