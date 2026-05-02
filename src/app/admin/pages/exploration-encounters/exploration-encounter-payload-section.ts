import { Component, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { ExplorationEncounterEffectDefinitionSection } from './exploration-encounter-effect-definition-section';
import { ExplorationEncounterEffectPayloadSection } from './exploration-encounter-effect-payload-section';
import { ExplorationEncounterResourcePayloadSection } from './exploration-encounter-resource-payload-section';
import { ExplorationEncounterDefinitionActionsState } from './exploration-encounter-definition-actions.state';
import { ExplorationEncountersPageState } from './exploration-encounters-page.state';

@Component({
  selector: 'app-exploration-encounter-payload-section',
  standalone: true,
  imports: [
    AdminSectionIntro,
    MessageModule,
    ExplorationEncounterEffectDefinitionSection,
    ExplorationEncounterEffectPayloadSection,
    ExplorationEncounterResourcePayloadSection,
  ],
  templateUrl: './exploration-encounter-payload-section.html',
})
export class ExplorationEncounterPayloadSection {
  readonly page = inject(ExplorationEncountersPageState);
  readonly definitionActions = inject(ExplorationEncounterDefinitionActionsState);
}
