import { Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import {
  CreateCharacterServerDetails,
  CreateCharacterServerOption,
} from '../../../core/interfaces/hero/create-character-server-options.interface';
import { AccountEntrySummaryRows } from './account-entry-summary-rows';

@Component({
  selector: 'app-account-entry-server-selector',
  standalone: true,
  imports: [AccountEntrySummaryRows, ButtonModule, ReactiveFormsModule, SelectModule],
  templateUrl: './account-entry-server-selector.html',
  host: {
    class: 'd-block w-100',
  },
})
export class AccountEntryServerSelector {
  readonly form = input.required<FormGroup<{
    selectedServerId: FormControl<string | null>;
  }>>();
  readonly options = input.required<CreateCharacterServerOption[]>();
  readonly details = input<CreateCharacterServerDetails | null>(null);
  readonly emptyMessage = input<string | null>(null);
  readonly continue = output<void>();

  constructor() {
    effect(() => {
      const control = this.form().controls.selectedServerId;

      if (this.emptyMessage()) {
        control.disable({ emitEvent: false });
        return;
      }

      control.enable({ emitEvent: false });
    });
  }
}
