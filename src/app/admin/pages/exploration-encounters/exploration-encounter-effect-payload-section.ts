import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { ExplorationEncounterDefinitionActionsState } from './exploration-encounter-definition-actions.state';
import { ExplorationEncounterEffectPayloadActionsState } from './exploration-encounter-effect-payload-actions.state';
import { ExplorationEncountersPageState } from './exploration-encounters-page.state';

@Component({
  selector: 'app-exploration-encounter-effect-payload-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
    AdminSectionIntro,
  ],
  templateUrl: './exploration-encounter-effect-payload-section.html',
})
export class ExplorationEncounterEffectPayloadSection {
  readonly page = inject(ExplorationEncountersPageState);
  readonly definitionActions = inject(ExplorationEncounterDefinitionActionsState);
  readonly actions = inject(ExplorationEncounterEffectPayloadActionsState);
}
