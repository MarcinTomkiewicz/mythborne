import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ExplorationEncounterEffectDefinitionActionsState } from './exploration-encounter-effect-definition-actions.state';
import { ExplorationEncounterEffectPayloadActionsState } from './exploration-encounter-effect-payload-actions.state';
import { ExplorationEncountersPageState } from './exploration-encounters-page.state';

@Component({
  selector: 'app-exploration-encounter-effect-definition-section',
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
  ],
  templateUrl: './exploration-encounter-effect-definition-section.html',
})
export class ExplorationEncounterEffectDefinitionSection {
  readonly page = inject(ExplorationEncountersPageState);
  readonly actions = inject(ExplorationEncounterEffectDefinitionActionsState);
  private readonly payloadActions = inject(ExplorationEncounterEffectPayloadActionsState);

  saveEffectDefinition(): void {
    this.actions.saveEffectDefinition((effectId, effectKind) =>
      this.payloadActions.prefillEffectDefinition(effectId, effectKind),
    );
  }
}
