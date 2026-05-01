import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ExplorationLabPageState } from './exploration-lab-page.state';

@Component({
  selector: 'app-exploration-lab-reward-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AutoCompleteModule,
    ButtonModule,
    InputNumberModule,
    SelectModule,
    TableModule,
  ],
  templateUrl: './exploration-lab-reward-section.html',
})
export class ExplorationLabRewardSection {
  readonly page = inject(ExplorationLabPageState);
}
