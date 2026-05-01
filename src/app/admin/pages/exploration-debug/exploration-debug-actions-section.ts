import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ExplorationDebugActionsState } from './exploration-debug-actions.state';
import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';

@Component({
  selector: 'app-exploration-debug-actions-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AutoCompleteModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './exploration-debug-actions-section.html',
})
export class ExplorationDebugActionsSection {
  readonly actions = inject(ExplorationDebugActionsState);
  readonly definitions = inject(ExplorationDefinitionsState);
}
