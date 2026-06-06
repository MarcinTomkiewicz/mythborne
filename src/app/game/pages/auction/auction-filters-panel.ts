import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AuctionPageCopy } from '../../../core/domain/trade/player-auction.model';
import { SelectOption } from '../../../core/types/select-option.types';

@Component({
  selector: 'app-auction-filters-panel',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    SelectModule,
  ],
  templateUrl: './auction-filters-panel.html',
})
export class AuctionFiltersPanel {
  readonly copy = input.required<AuctionPageCopy>();
  readonly filterForm = input.required<FormGroup>();
  readonly auctionModeOptions = input.required<SelectOption<string>[]>();
  readonly baseTypeOptions = input.required<SelectOption<string | null>[]>();
  readonly sortOptions = input.required<SelectOption<string>[]>();
  readonly isLoading = input.required<boolean>();
  readonly apply = output<void>();
  readonly baseTypeSelect = output<string | null>();

  isBaseTypeSelected(value: string | null): boolean {
    return this.filterForm().controls['baseTypeKey']?.value === value;
  }
}
