import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ExplorationEncounterDefinitionActionsState } from './exploration-encounter-definition-actions.state';
import { ExplorationEncountersPageState } from './exploration-encounters-page.state';

@Component({
  selector: 'app-exploration-encounters-list-section',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, SelectModule],
  templateUrl: './exploration-encounters-list-section.html',
})
export class ExplorationEncountersListSection {
  readonly page = inject(ExplorationEncountersPageState);
  readonly definitionActions = inject(ExplorationEncounterDefinitionActionsState);
}
