import { Component, OnInit, inject } from '@angular/core';
import { ExplorationChallengeState } from './exploration-challenge.state';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationLiveCombat } from '../../../core/services/combat/exploration-live-combat';
import { ExplorationDifficultyPreviewSection } from './exploration-difficulty-preview-section';
import { ExplorationStatusSection } from './exploration-status-section';
import { ExplorationLiveCombatState } from './exploration-live-combat.state';
import { ExplorationMovementState } from './exploration-movement.state';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationPageState } from './exploration-page.state';
import { ExplorationPreviewState } from './exploration-preview.state';
import { ExplorationRewardState } from './exploration-reward.state';
import { ExplorationStepState } from './exploration-step.state';
import { ExplorationStartState } from './exploration-start.state';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';

@Component({
  selector: 'app-exploration-page',
  standalone: true,
  imports: [
    ExplorationDifficultyPreviewSection,
    ExplorationStatusSection,
    LoadingOverlay,
  ],
  providers: [
    ExplorationFeedbackState,
    ExplorationLiveCombat,
    ExplorationLiveCombatState,
    ExplorationPreviewState,
    ExplorationOverviewState,
    ExplorationMovementState,
    ExplorationStepState,
    ExplorationChallengeState,
    ExplorationRewardState,
    ExplorationStartState,
    ExplorationPageState,
  ],
  templateUrl: './exploration-page.html',
})
export class ExplorationPage implements OnInit {
  readonly page = inject(ExplorationPageState);

  ngOnInit(): void {
    this.page.loadData();
  }
}
