import { Component, OnInit, inject } from '@angular/core';
import { ExplorationChallengeState } from './exploration-challenge.state';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationDifficultyPreviewSection } from './exploration-difficulty-preview-section';
import { ExplorationRuntimeDirectionSection } from './exploration-runtime-direction-section';
import { ExplorationRuntimePrimarySurface } from './exploration-runtime-primary-surface';
import { ExplorationRuntimeSandboxSection } from './exploration-runtime-sandbox-section';
import { ExplorationMovementState } from './exploration-movement.state';
import { ExplorationMinigameHandoffState } from './exploration-minigame-handoff.state';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationPageState } from './exploration-page.state';
import { ExplorationPreviewState } from './exploration-preview.state';
import { ExplorationRewardState } from './exploration-reward.state';
import { ExplorationSandboxToolState } from './exploration-sandbox-tool.state';
import { ExplorationStepState } from './exploration-step.state';
import { ExplorationStartState } from './exploration-start.state';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';

@Component({
  selector: 'app-exploration-page',
  standalone: true,
  imports: [
    ExplorationDifficultyPreviewSection,
    ExplorationRuntimeDirectionSection,
    ExplorationRuntimePrimarySurface,
    ExplorationRuntimeSandboxSection,
    LoadingOverlay,
  ],
  providers: [
    ExplorationFeedbackState,
    ExplorationPreviewState,
    ExplorationOverviewState,
    ExplorationMovementState,
    ExplorationMinigameHandoffState,
    ExplorationStepState,
    ExplorationChallengeState,
    ExplorationRewardState,
    ExplorationSandboxToolState,
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
