import { Component, OnInit, effect, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { EXPLORATION_TRIALS_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { ToastService } from '../../../core/services/ui/toast';
import { ExplorationCombatCandidatesSection } from './exploration-combat-candidates-section';
import { ExplorationTrialRewardActionsState } from './exploration-trial-reward-actions.state';
import { ExplorationTrialRewardSection } from './exploration-trial-reward-section';
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
    AdminSectionIntro,
    ExplorationCombatCandidatesSection,
    ExplorationTrialRewardSection,
    ExplorationTrialEditSection,
    ExplorationTrialMeaningSection,
    ExplorationTrialsListSection,
    LoadingOverlay,
  ],
  providers: [
    ExplorationTrialsPageState,
    ExplorationTrialsActionsState,
    ExplorationTrialRewardActionsState,
  ],
  templateUrl: './exploration-trials-page.html',
})
export class ExplorationTrialsPage implements OnInit {
  readonly page = inject(ExplorationTrialsPageState);
  readonly links = EXPLORATION_TRIALS_PAGE_LINKS;
  private readonly toast = inject(ToastService);

  constructor() {
    effect(() => {
      const message = this.page.error();

      if (message) {
        this.toast.show('error', 'Exploration trials', message);
      }
    });
  }

  ngOnInit(): void {
    this.page.loadInitialData();
  }
}
