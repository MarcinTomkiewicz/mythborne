import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ExplorationEncounterDefinitionActionsState } from './exploration-encounter-definition-actions.state';
import { ExplorationEncountersPageState } from './exploration-encounters-page.state';

@Component({
  selector: 'app-exploration-encounter-edit-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './exploration-encounter-edit-section.html',
})
export class ExplorationEncounterEditSection {
  readonly page = inject(ExplorationEncountersPageState);
  readonly definitionActions = inject(ExplorationEncounterDefinitionActionsState);
}
