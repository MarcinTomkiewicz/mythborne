import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { ExplorationEncounterDefinitionActionsState } from './exploration-encounter-definition-actions.state';
import { ExplorationEncounterResourcePayloadActionsState } from './exploration-encounter-resource-payload-actions.state';
import { ExplorationEncountersPageState } from './exploration-encounters-page.state';

@Component({
  selector: 'app-exploration-encounter-resource-payload-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    TableModule,
    TagModule,
    AdminSectionIntro,
  ],
  templateUrl: './exploration-encounter-resource-payload-section.html',
})
export class ExplorationEncounterResourcePayloadSection {
  readonly page = inject(ExplorationEncountersPageState);
  readonly definitionActions = inject(ExplorationEncounterDefinitionActionsState);
  readonly actions = inject(ExplorationEncounterResourcePayloadActionsState);
}
