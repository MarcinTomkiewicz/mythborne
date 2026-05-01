import { Component, OnInit, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { EXPLORATION_TRIALS_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { ExplorationCombatCandidatesSection } from './exploration-combat-candidates-section';
import { ExplorationTrialEditSection } from './exploration-trial-edit-section';
import { ExplorationTrialMeaningSection } from './exploration-trial-meaning-section';
import { ExplorationTrialsActionsState } from './exploration-trials-actions.state';
import { ExplorationTrialsListSection } from './exploration-trials-list-section';
import { ExplorationTrialsPageState } from './exploration-trials-page.state';

@Component({
  selector: 'app-exploration-trials-page',
  standalone: true,
  imports: [
    MessageModule,
    AdminTagLinks,
    ExplorationCombatCandidatesSection,
    ExplorationTrialEditSection,
    ExplorationTrialMeaningSection,
    ExplorationTrialsListSection,
    LoadingOverlay,
  ],
  providers: [ExplorationTrialsPageState, ExplorationTrialsActionsState],
  templateUrl: './exploration-trials-page.html',
})
export class ExplorationTrialsPage implements OnInit {
  readonly page = inject(ExplorationTrialsPageState);
  readonly links = EXPLORATION_TRIALS_PAGE_LINKS;

  ngOnInit(): void {
    this.page.loadInitialData();
  }
}
