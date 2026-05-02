import { Component, OnInit, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { EXPLORATION_ENCOUNTERS_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { ExplorationEncounterCandidateActionsState } from './exploration-encounter-candidate-actions.state';
import { ExplorationEncounterCombatSection } from './exploration-encounter-combat-section';
import { ExplorationEncounterDefinitionActionsState } from './exploration-encounter-definition-actions.state';
import { ExplorationEncounterEditSection } from './exploration-encounter-edit-section';
import { ExplorationEncounterEffectDefinitionActionsState } from './exploration-encounter-effect-definition-actions.state';
import { ExplorationEncounterEffectPayloadActionsState } from './exploration-encounter-effect-payload-actions.state';
import { ExplorationEncounterMeaningSection } from './exploration-encounter-meaning-section';
import { ExplorationEncounterPayloadSection } from './exploration-encounter-payload-section';
import { ExplorationEncounterResourcePayloadActionsState } from './exploration-encounter-resource-payload-actions.state';
import { ExplorationEncounterRewardActionsState } from './exploration-encounter-reward-actions.state';
import { ExplorationEncounterRewardSection } from './exploration-encounter-reward-section';
import { ExplorationEncountersListSection } from './exploration-encounters-list-section';
import { ExplorationEncountersPageState } from './exploration-encounters-page.state';

@Component({
  selector: 'app-exploration-encounters-page',
  standalone: true,
  imports: [
    MessageModule,
    LoadingOverlay,
    AdminTagLinks,
    ExplorationEncountersListSection,
    ExplorationEncounterMeaningSection,
    ExplorationEncounterEditSection,
    ExplorationEncounterRewardSection,
    ExplorationEncounterCombatSection,
    ExplorationEncounterPayloadSection,
  ],
  providers: [
    ExplorationEncountersPageState,
    ExplorationEncounterDefinitionActionsState,
    ExplorationEncounterRewardActionsState,
    ExplorationEncounterCandidateActionsState,
    ExplorationEncounterResourcePayloadActionsState,
    ExplorationEncounterEffectDefinitionActionsState,
    ExplorationEncounterEffectPayloadActionsState,
  ],
  templateUrl: './exploration-encounters-page.html',
})
export class ExplorationEncountersPage implements OnInit {
  readonly page = inject(ExplorationEncountersPageState);
  readonly links = EXPLORATION_ENCOUNTERS_PAGE_LINKS;

  ngOnInit(): void {
    this.page.loadInitialData();
  }
}
