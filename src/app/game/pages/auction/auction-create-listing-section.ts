import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AuctionCreateListingState } from './auction-create-listing.state';

@Component({
  selector: 'app-auction-create-listing-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AutoCompleteModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './auction-create-listing-section.html',
})
export class AuctionCreateListingSection {
  readonly state = inject(AuctionCreateListingState);
}
