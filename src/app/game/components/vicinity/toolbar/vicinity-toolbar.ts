import { Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import type { SelectItem } from 'primeng/api';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-vicinity-toolbar',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    SelectModule,
  ],
  host: { class: 'd-contents' },
  templateUrl: './vicinity-toolbar.html',
})
export class VicinityToolbar {
  readonly selectedDistrictControl = input.required<FormControl<string | null>>();
  readonly searchControl = input.required<FormControl<string>>();
  readonly districtOptions = input.required<SelectItem<string>[]>();
  readonly searchFeedback = input<string | null>(null);
  readonly isSearching = input(false);
  readonly isMyVicinityDisabled = input(false);
  readonly search = output<void>();
  readonly focusCurrentAddress = output<void>();
}
