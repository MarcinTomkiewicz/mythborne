import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TradeRespondOfferState } from './trade-respond-offer.state';

@Component({
  selector: 'app-trade-respond-offer-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AutoCompleteModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './trade-respond-offer-section.html',
})
export class TradeRespondOfferSection {
  readonly state = inject(TradeRespondOfferState);
}
