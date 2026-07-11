import { Component, OnInit, inject } from '@angular/core';
import { ExplorationChallengeState } from './exploration-challenge.state';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { ExplorationDifficultyPreviewSection } from './exploration-difficulty-preview-section';
import { ExplorationRuntimeDirectionSection } from './exploration-runtime-direction-section';
import { ExplorationRuntimePrimarySurface } from './exploration-runtime-primary-surface';
import { ExplorationRuntimeSandboxSection } from './exploration-runtime-sandbox-section';
import { ExplorationMovementState } from './exploration-movement.state';
import { ExplorationManualTrialCopyState } from './exploration-manual-trial-copy.state';
import { ExplorationManualTrialDisplayState } from './exploration-manual-trial-display.state';
import { ExplorationManualTrialExitState } from './exploration-manual-trial-exit.state';
import { ExplorationManualTrialRecoveryState } from './exploration-manual-trial-recovery.state';
import { ExplorationManualTrialReportState } from './exploration-manual-trial-report.state';
import { ExplorationManualTrialState } from './exploration-manual-trial.state';
import { ExplorationMinigameHandoffState } from './exploration-minigame-handoff.state';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationPageState } from './exploration-page.state';
import { ExplorationPreviewState } from './exploration-preview.state';
import { ExplorationRewardState } from './exploration-reward.state';
import { ExplorationSandboxToolState } from './exploration-sandbox-tool.state';
import { ExplorationStepState } from './exploration-step.state';
import { ExplorationStartState } from './exploration-start.state';
import { GameCopyEditState } from '../../../shared/game-copy-edit/game-copy-edit.state';
import { GameCopyEditFormState } from '../../../shared/game-copy-edit/game-copy-edit-form.state';
import { GameCopyEditDialog } from '../../../shared/game-copy-edit-dialog/game-copy-edit-dialog';
import { GameCopyEditableText } from '../../../shared/game-copy-editable-text/game-copy-editable-text';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { MessageModule } from 'primeng/message';
import type { Observable } from 'rxjs';

@Component({
  selector: 'app-exploration-page',
  standalone: true,
  imports: [
    ExplorationDifficultyPreviewSection,
    ExplorationRuntimeDirectionSection,
    ExplorationRuntimePrimarySurface,
    ExplorationRuntimeSandboxSection,
    GameCopyEditableText,
    GameCopyEditDialog,
    LoadingOverlay,
    MessageModule,
  ],
  providers: [
    ExplorationFeedbackState,
    ExplorationPreviewState,
    ExplorationOverviewState,
    ExplorationMovementState,
    ExplorationManualTrialCopyState,
    ExplorationManualTrialRecoveryState,
    ExplorationManualTrialReportState,
    ExplorationManualTrialState,
    ExplorationManualTrialDisplayState,
    ExplorationManualTrialExitState,
    ExplorationMinigameHandoffState,
    ExplorationStepState,
    ExplorationChallengeState,
    ExplorationRewardState,
    ExplorationSandboxToolState,
    ExplorationStartState,
    GameCopyEditFormState,
    GameCopyEditState,
    ExplorationPageState,
  ],
  templateUrl: './exploration-page.html',
})
export class ExplorationPage implements OnInit {
  private readonly manualTrialExit = inject(ExplorationManualTrialExitState);
  readonly page = inject(ExplorationPageState);

  ngOnInit(): void {
    this.page.loadData();
  }

  canDeactivate(): Observable<boolean> {
    return this.manualTrialExit.confirmExitBeforeNavigation();
  }
}
