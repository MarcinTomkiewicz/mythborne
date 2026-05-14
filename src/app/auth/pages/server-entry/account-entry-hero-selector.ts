import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ServerEntryHeroContextOption } from './server-entry-page.model';

@Component({
  selector: 'app-account-entry-hero-selector',
  standalone: true,
  imports: [ButtonModule, ReactiveFormsModule, SelectModule],
  templateUrl: './account-entry-hero-selector.html',
  host: {
    class: 'd-block w-100',
  },
})
export class AccountEntryHeroSelector {
  readonly form = input.required<
    FormGroup<{
      selectedContextId: FormControl<string | null>;
    }>
  >();
  readonly options = input.required<ServerEntryHeroContextOption[]>();
  readonly selectedContext = input<ServerEntryHeroContextOption | null>(null);
  readonly isTransitioning = input(false);
  readonly enter = output<void>();
}
