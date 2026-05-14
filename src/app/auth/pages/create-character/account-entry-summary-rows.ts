import { Component, input } from '@angular/core';
import { CreateCharacterSummaryRow } from '../../../core/interfaces/hero/create-character-server-options.interface';

@Component({
  selector: 'app-account-entry-summary-rows',
  standalone: true,
  template: `
    <div class="mg-account-entry-summary">
      @for (row of rows(); track row.label) {
        <div
          class="mg-account-entry-summary__row"
          [class.mg-account-entry-summary__row--primary]="row.primary"
          [class.mg-account-entry-summary__row--danger]="row.tone === 'danger'"
        >
          <span class="mg-account-entry-summary__label">{{ row.label }}</span>
          @if (row.multiline) {
            <span
              class="mg-account-entry-summary__value"
              [class.heading-color]="row.primary"
              [class.text-danger]="row.tone === 'danger'"
            >
              {{ row.value }}
            </span>
          } @else {
            <strong
              class="mg-account-entry-summary__value"
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
