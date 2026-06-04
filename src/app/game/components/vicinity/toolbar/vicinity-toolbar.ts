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
  readonly districtSelectId = 'vicinity-district-filter';
  readonly selectedDistrictControl = input.required<FormControl<string | null>>();
  readonly searchControl = input.required<FormControl<string>>();
  readonly districtOptions = input.required<SelectItem<string>[]>();
  readonly sectionTitle = input.required<string>();
  readonly helperText = input.required<string>();
  readonly districtFilterLabel = input.required<string>();
  readonly currentVicinityButtonLabel = input.required<string>();
  readonly searchLabel = input.required<string>();
  readonly searchPlaceholder = input.required<string>();
  readonly searchButtonLabel = input.required<string>();
  readonly searchFeedback = input<string | null>(null);
  readonly isSearching = input(false);
  readonly isMyVicinityDisabled = input(false);
  readonly search = output<void>();
  readonly focusCurrentAddress = output<void>();
}
