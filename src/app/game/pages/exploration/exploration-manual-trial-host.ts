import { Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { GAME_COPY_DEFAULT_LOCALE } from '../../../core/constants/game-copy.const';
import { MANUAL_TRIAL_COPY_KIND } from '../../../core/constants/manual-trial.const';
import {
  isMinigameKey,
  type MinigameCompletionEvent,
} from '../../../core/domain/minigame/minigame-completion.model';
import { GameCopyEditableText } from '../../../shared/game-copy-editable-text/game-copy-editable-text';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { MinigameHost } from '../../components/minigame-host/minigame-host';
import { StructuredConfirmDialog } from '../../../shared/structured-confirm-dialog/structured-confirm-dialog';
import { ExplorationManualTrialCopyState } from './exploration-manual-trial-copy.state';
import { ExplorationManualTrialDisplayState } from './exploration-manual-trial-display.state';
import { ExplorationManualTrialExitState } from './exploration-manual-trial-exit.state';
import { ExplorationManualTrialRuntimeError } from './exploration-manual-trial-runtime-error';
import { ExplorationManualTrialReportState } from './exploration-manual-trial-report.state';
import { ExplorationManualTrialState } from './exploration-manual-trial.state';
import { ExplorationManualTrialUnavailablePanel } from './exploration-manual-trial-unavailable-panel';

@Component({
  selector: 'app-exploration-manual-trial-host',
  standalone: true,
  imports: [
    ExplorationManualTrialRuntimeError,
    ExplorationManualTrialUnavailablePanel,
    MinigameHost,
    GameCopyEditableText,
    LoadingOverlay,
    StructuredConfirmDialog,
  ],
  templateUrl: './exploration-manual-trial-host.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationManualTrialHost {
  private readonly destroyRef = inject(DestroyRef);
  private emittedVerdictId: string | null = null;
  readonly copyState = inject(ExplorationManualTrialCopyState);
  readonly display = inject(ExplorationManualTrialDisplayState);
  readonly exit = inject(ExplorationManualTrialExitState);
  readonly manualTrial = inject(ExplorationManualTrialState);
  private readonly reportState = inject(ExplorationManualTrialReportState);
  readonly attemptId = input.required<string>();
  readonly completed = output<MinigameCompletionEvent>();
  readonly copyKind = MANUAL_TRIAL_COPY_KIND;
  readonly copyLocale = GAME_COPY_DEFAULT_LOCALE;

  constructor() {
    effect(() => this.manualTrial.attachAttempt(this.attemptId()));
    effect(() => {
      const verdict = this.manualTrial.verdict();

      if (!verdict) {
        this.emittedVerdictId = null;
        return;
      }

      if (this.emittedVerdictId === verdict.verdictId) {
        return;
      }

      if (!isMinigameKey(verdict.minigameKey)) {
        return;
      }

      this.emittedVerdictId = verdict.verdictId;
      this.completed.emit({
        minigameKey: verdict.minigameKey,
        sourceEntityId: verdict.attemptId,
        resultId: verdict.verdictId,
        reportId: verdict.report.gameReportId,
        rewardGrantId: verdict.reward.rewardGrantId,
        presentationSource: {
          kind: 'manual_trial',
          failureReasonKey: verdict.failureReasonKey,
        },
      });
      this.reportState.acceptVerdict(verdict);
    });
    this.destroyRef.onDestroy(() => this.manualTrial.detachAttempt(this.attemptId()));
  }

  acceptCompletion(event: MinigameCompletionEvent): void {
    this.completed.emit(event);
  }
}
