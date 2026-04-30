import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TradeCreateOfferState } from './trade-create-offer.state';

@Component({
  selector: 'app-trade-create-offer-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AutoCompleteModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
  ],
  templateUrl: './trade-create-offer-section.html',
})
export class TradeCreateOfferSection {
  readonly state = inject(TradeCreateOfferState);
}
