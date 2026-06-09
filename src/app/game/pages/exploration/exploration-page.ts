import { Component, OnInit, inject } from '@angular/core';
import { ExplorationChallengeState } from './exploration-challenge.state';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationDiagnosticsState } from './exploration-diagnostics.state';
import { ExplorationDifficultyPreviewSection } from './exploration-difficulty-preview-section';
import { ExplorationRuntimeDiagnosticsSection } from './exploration-runtime-diagnostics-section';
import { ExplorationRuntimeDirectionSection } from './exploration-runtime-direction-section';
import { ExplorationRuntimePrimarySurface } from './exploration-runtime-primary-surface';
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
    ExplorationRuntimeDiagnosticsSection,
    ExplorationRuntimeDirectionSection,
    ExplorationRuntimePrimarySurface,
    LoadingOverlay,
  ],
  providers: [
    ExplorationFeedbackState,
    ExplorationDiagnosticsState,
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
